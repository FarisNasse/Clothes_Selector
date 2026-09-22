export const motion = {
  micro: 100,
  instant: 120,
  fast: 180,
  standard: 280,
  deliberate: 420,
  expressive: 420,
  pageTransition: 320,
  springSoft: { damping: 23, stiffness: 220, mass: 0.8 },
  springSnappy: { damping: 20, stiffness: 380, mass: 0.6 },
} as const;
