import { withSupabase } from '@supabase/server';

// Server-only operation. The caller never supplies an account ID or receives
// the admin credential. A failed cleanup leaves the account intact for retry.
export default {
  fetch: withSupabase({ auth: 'user' }, async (request, ctx) => {
    if (request.method !== 'POST') return Response.json({ error: 'Method not allowed' }, { status: 405 });
    const userId = ctx.userClaims?.id;
    if (!userId) return Response.json({ error: 'Sign in again.' }, { status: 401 });
    const { data: identity, error: identityError } = await ctx.supabase.auth.getUser();
    if (identityError || identity.user?.id !== userId)
      return Response.json({ error: 'Sign in again.' }, { status: 401 });

    const bucket = ctx.supabaseAdmin.storage.from('garment-images');
    let batches = 0;
    async function removeFolder(prefix: string, depth: number): Promise<void> {
      if (depth > 12) throw new Error('Photo folder nesting limit reached');
      for (;;) {
        if (++batches > 60) throw new Error('Photo cleanup needs another attempt');
        const { data, error } = await bucket.list(prefix, { limit: 100, offset: 0 });
        if (error) throw error;
        if (!data?.length) return;
        const files = data.filter((item) => item.id !== null).map((item) => `${prefix}/${item.name}`);
        const folders = data.filter((item) => item.id === null).map((item) => `${prefix}/${item.name}`);
        for (const folder of folders) await removeFolder(folder, depth + 1);
        if (files.length) {
          const removed = await bucket.remove(files);
          if (removed.error) throw removed.error;
        }
      }
    }
    try {
      await removeFolder(userId, 0);
      const { error } = await ctx.supabaseAdmin.auth.admin.deleteUser(userId);
      if (error) throw error;
      return Response.json({ deleted: true });
    } catch (error) {
      console.error('Account deletion incomplete:', error instanceof Error ? error.name : 'Unknown error');
      return Response.json({ error: 'Could not finish account deletion. Check account status, then retry or contact support.' }, { status: 503 });
    }
  }),
};
