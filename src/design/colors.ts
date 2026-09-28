export const palette = {
  parchment: '#F4F1EA',
  porcelain: '#FBF9F5',
  chalk: '#EEEAE2',
  stone: '#DDD7CD',
  graphite: '#171916',
  slate: '#62665F',
  ash: '#73776E',
  forest: '#30473B',
  forestDeep: '#20362C',
  forestMist: '#E2E8E3',
  navy: '#293747',
  burgundy: '#5B3F42',
  bronze: '#8B7157',
  bronzeMist: '#EEE4D7',
  success: '#2E684A',
  warning: '#8D6427',
  danger: '#9D403B',
  white: '#FFFFFF',
  black: '#10110F',
} as const;

export const semanticColors = {
  canvas: {
    default: palette.parchment,
    elevated: palette.porcelain,
    sunken: palette.chalk,
    editorial: '#EAE6DC',
    media: '#E9E3D8',
    inverse: palette.forestDeep,
    floating: '#FFFEFA',
    selected: palette.forestMist,
  },
  ink: {
    primary: palette.graphite,
    secondary: palette.slate,
    tertiary: palette.ash,
    inverse: palette.porcelain,
  },
  border: {
    subtle: '#E2DDD4',
    strong: '#CBC4B9',
  },
  accent: {
    forest: palette.forest,
    forestDeep: palette.forestDeep,
    forestMist: palette.forestMist,
    navy: palette.navy,
    burgundy: palette.burgundy,
    bronze: palette.bronze,
    bronzeMist: palette.bronzeMist,
  },
  feedback: {
    positive: palette.success,
    caution: palette.warning,
    negative: palette.danger,
  },
} as const;

export type Colors = {
  [Section in keyof typeof semanticColors]: {
    [Token in keyof (typeof semanticColors)[Section]]: string;
  };
};
export const darkColors: Colors = {
  canvas: { default: '#171C19', elevated: '#232B26', sunken: '#2C342E',
    editorial: '#222B27', media: '#2E3530', inverse: '#14251C', floating: '#303A33', selected: '#365040' },
  ink: { primary: '#F3EFE5', secondary: '#C0C5BA', tertiary: '#A4AC9F', inverse: '#FBF9F5' },
  border: { subtle: '#39433A', strong: '#566354' },
  accent: {
    forest: '#B0C8AA',
    forestDeep: '#304B3D',
    forestMist: '#304137',
    navy: '#AEBFD4',
    burgundy: '#D8AFAE',
    bronze: '#C9AA81',
    bronzeMist: '#3C352B',
  },
  feedback: { positive: '#A6D3B8', caution: '#E0BB7F', negative: '#F0AAA0' },
};
