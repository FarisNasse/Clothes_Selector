import type { GarmentCategory } from '@/types/domain';

/** Suggestions only: users can still enter any garment name or color. */
export const garmentTypes: Record<GarmentCategory, readonly string[]> = {
  top: [
    'Crewneck T-shirt', 'Heavyweight T-shirt', 'Henley', 'Tank top', 'Oxford shirt',
    'Dress shirt', 'Linen shirt', 'Camp-collar shirt', 'Flannel shirt', 'Denim shirt',
    'Knit polo', 'Piqué polo', 'Turtleneck', 'Mock neck', 'Crewneck sweater',
    'V-neck sweater', 'Cardigan', 'Sweatshirt', 'Hoodie', 'Rugby shirt',
  ],
  bottom: [
    'Straight jeans', 'Relaxed jeans', 'Wide-leg jeans', 'Chinos', 'Pleated trousers',
    'Wool trousers', 'Linen trousers', 'Corduroy trousers', 'Cargo pants', 'Drawstring pants',
    'Tailored shorts', 'Chino shorts', 'Linen shorts', 'Denim shorts', 'Sweatpants',
  ],
  outerwear: [
    'Blazer', 'Unstructured blazer', 'Harrington jacket', 'Bomber jacket', 'Suede bomber',
    'Denim jacket', 'Leather jacket', 'Overshirt', 'Shirt jacket', 'Trench coat',
    'Rain shell', 'Field jacket', 'Parka', 'Puffer jacket', 'Wool overcoat',
    'Peacoat', 'Car coat', 'Fleece jacket',
  ],
  footwear: [
    'Minimal leather sneakers', 'Canvas sneakers', 'Retro sneakers', 'Running shoes',
    'Suede loafers', 'Penny loafers', 'Tassel loafers', 'Derby shoes', 'Oxford shoes',
    'Brogues', 'Chelsea boots', 'Service boots', 'Chukka boots', 'Hiking boots',
    'Sandals', 'Espadrilles',
  ],
  accessory: [
    'Leather belt', 'Suede belt', 'Dress watch', 'Sport watch', 'Sunglasses', 'Scarf',
    'Baseball cap', 'Beanie', 'Tie', 'Pocket square', 'Tote bag', 'Crossbody bag',
  ],
  suit: ['Two-piece suit', 'Double-breasted suit', 'Linen suit', 'Tuxedo'],
};

export const colorGroups = [
  { label: 'Neutrals', colors: ['black', 'white', 'off-white', 'cream', 'ivory', 'stone', 'beige', 'sand', 'taupe', 'gray', 'charcoal'] },
  { label: 'Blues', colors: ['navy', 'midnight blue', 'indigo', 'blue', 'light blue', 'sky blue', 'steel blue', 'teal'] },
  { label: 'Earth', colors: ['brown', 'chocolate', 'espresso', 'tan', 'camel', 'cognac', 'rust', 'terracotta', 'ochre'] },
  { label: 'Greens', colors: ['olive', 'sage', 'forest green', 'emerald', 'mint'] },
  { label: 'Accents', colors: ['burgundy', 'wine', 'red', 'brick red', 'coral', 'pink', 'dusty pink', 'lavender', 'purple', 'mustard', 'yellow'] },
] as const;

export const colorSwatches: Record<string, string> = {
  black: '#252728', white: '#F6F5EF', 'off-white': '#EEECE2', cream: '#E7DDC8',
  ivory: '#F3EBD7', stone: '#BEB9AB', beige: '#CBB899', sand: '#D4BE9D',
  taupe: '#9A897B', gray: '#909294', charcoal: '#4B5155', navy: '#293B59',
  'midnight blue': '#202B42', indigo: '#394F76', blue: '#4879AA',
  'light blue': '#A7C5DA', 'sky blue': '#90BFE0', 'steel blue': '#648397',
  teal: '#397B83', brown: '#75533D', chocolate: '#594032', espresso: '#392F2D',
  tan: '#B78E65', camel: '#BB9567', cognac: '#A35F38', rust: '#A85436',
  terracotta: '#B86D55', ochre: '#B68A37', olive: '#69744A', sage: '#9BAA8E',
  'forest green': '#365B49', emerald: '#31856B', mint: '#A5C9AC',
  burgundy: '#722F45', wine: '#652E43', red: '#B4433D', 'brick red': '#A64C3C',
  coral: '#DC8070', pink: '#DEA4AD', 'dusty pink': '#C08C93',
  lavender: '#A99ABD', purple: '#705482', mustard: '#C39B42', yellow: '#E5CB66',
};

export function canonicalColor(value: string): string {
  const color = value.trim().toLowerCase().replace(/\s+/g, ' ');
  const aliases: Record<string, string> = {
    grey: 'gray', 'dark grey': 'charcoal', 'dark gray': 'charcoal',
    'light grey': 'gray', 'light gray': 'gray', 'navy blue': 'navy',
    'dark blue': 'navy', 'light brown': 'tan', 'dark brown': 'chocolate',
    khaki: 'beige', ecru: 'cream', 'forest': 'forest green',
  };
  return aliases[color] ?? color;
}
