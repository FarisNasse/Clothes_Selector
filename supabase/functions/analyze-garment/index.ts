import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const garmentSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    category: { type: 'string', enum: ['top', 'bottom', 'outerwear', 'footwear', 'accessory', 'suit'] },
    subcategory: { type: 'string' },
    name: { type: 'string' },
    brand: { anyOf: [{ type: 'string' }, { type: 'null' }] },
    primaryColor: { type: 'string' },
    secondaryColors: { type: 'array', items: { type: 'string' } },
    pattern: { type: 'string' },
    materials: { type: 'array', items: { type: 'string' } },
    fit: { type: 'string', enum: ['slim', 'tailored', 'regular', 'relaxed', 'oversized'] },
    formality: { type: 'integer', minimum: 1, maximum: 10 },
    warmth: { type: 'integer', minimum: 1, maximum: 10 },
    waterproof: { type: 'boolean' },
    seasons: {
      type: 'array',
      items: { type: 'string', enum: ['spring', 'summer', 'fall', 'winter', 'all-season'] },
    },
    styleTags: { type: 'array', items: { type: 'string' } },
    confidence: { type: 'number', minimum: 0, maximum: 1 },
  },
  required: [
    'category',
    'subcategory',
    'name',
    'brand',
    'primaryColor',
    'secondaryColors',
    'pattern',
    'materials',
    'fit',
    'formality',
    'warmth',
    'waterproof',
    'seasons',
    'styleTags',
    'confidence',
  ],
} as const;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return json({ error: 'Authentication required' }, 401);

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const openAiKey = Deno.env.get('OPENAI_API_KEY');
  const model = Deno.env.get('OPENAI_GARMENT_MODEL') ?? 'gpt-5.6';

  if (!supabaseUrl || !supabaseAnonKey || !openAiKey) {
    return json({ error: 'Server configuration is incomplete' }, 500);
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false },
  });

  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(authHeader.replace('Bearer ', ''));
  if (claimsError || !claimsData?.claims?.sub) return json({ error: 'Invalid session' }, 401);

  let storagePath: string | undefined;
  try {
    const body = await req.json();
    storagePath = typeof body.storagePath === 'string' ? body.storagePath : undefined;
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  if (!storagePath) return json({ error: 'storagePath is required' }, 400);
  if (!storagePath.startsWith(`${claimsData.claims.sub}/`)) return json({ error: 'Invalid storage path' }, 403);

  const { data: signed, error: signedError } = await supabase.storage
    .from('garment-images')
    .createSignedUrl(storagePath, 120);
  if (signedError || !signed?.signedUrl) return json({ error: 'Could not access garment image' }, 403);

  const openAiResponse = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${openAiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      input: [
        {
          role: 'user',
          content: [
            {
              type: 'input_text',
              text:
                'Analyze this single menswear garment for a wardrobe database. Be conservative: infer only visible or strongly supported attributes. Use lowercase canonical color/material/style labels where possible. Brand must be null unless visible or highly certain. Return only the schema.',
            },
            { type: 'input_image', image_url: signed.signedUrl, detail: 'high' },
          ],
        },
      ],
      text: {
        format: {
          type: 'json_schema',
          name: 'garment_analysis',
          strict: true,
          schema: garmentSchema,
        },
      },
    }),
  });

  if (!openAiResponse.ok) {
    const diagnostic = (await openAiResponse.text()).slice(0, 500);
    console.error('OpenAI garment analysis failed', openAiResponse.status, diagnostic);
    return json({ error: 'Garment analysis failed' }, 502);
  }

  const response = await openAiResponse.json();
  const outputText = extractOutputText(response);
  if (!outputText) return json({ error: 'Garment analysis produced no structured result' }, 502);

  try {
    return json(JSON.parse(outputText), 200);
  } catch {
    console.error('Structured output was not valid JSON');
    return json({ error: 'Garment analysis could not be parsed' }, 502);
  }
});

function extractOutputText(response: unknown): string | null {
  if (!response || typeof response !== 'object') return null;
  const output = (response as { output?: unknown }).output;
  if (!Array.isArray(output)) return null;

  for (const item of output) {
    if (!item || typeof item !== 'object') continue;
    const content = (item as { content?: unknown }).content;
    if (!Array.isArray(content)) continue;
    for (const part of content) {
      if (
        part &&
        typeof part === 'object' &&
        (part as { type?: unknown }).type === 'output_text' &&
        typeof (part as { text?: unknown }).text === 'string'
      ) {
        return (part as { text: string }).text;
      }
    }
  }
  return null;
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
