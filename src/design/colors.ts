export const palette = {
  parchment: '#F4F1EA',
  porcelain: '#FBF9F5',
  chalk: '#EEEAE2',
  stone: '#DDD7CD',
  graphite: '#171916',
  slate: '#62665F',
  ash: '#91958E',
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
