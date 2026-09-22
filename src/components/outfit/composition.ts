import type { Garment } from '@/types/domain';
type Placement = {
  left: number;
  top: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
};
export function compositionFor(garments: Garment[]): Record<string, Placement> {
  const layered = garments.some(
    (item) => item.category === 'outerwear' || item.category === 'suit',
  );
  const hasSuit = garments.some((item) => item.category === 'suit');
  return Object.fromEntries(
    garments.map((item) => {
      const placements: Record<Garment['category'], Placement> = {
        outerwear: { left: 2, top: 5, width: 52, height: 68, rotation: -7, zIndex: 1 },
        suit: { left: 3, top: 3, width: 54, height: 74, rotation: -5, zIndex: 1 },
        top: {
          left: layered ? 31 : 6,
          top: layered ? 11 : 9,
          width: layered ? 42 : 56,
          height: layered ? 50 : 62,
          rotation: 5,
          zIndex: 3,
        },
        bottom: {
          left: layered ? 66 : 60,
          top: 9,
          width: layered ? 31 : 36,
          height: 70,
          rotation: 6,
          zIndex: 2,
        },
        footwear: {
          left: hasSuit ? 48 : 24,
          top: 66,
          width: 48,
          height: 31,
          rotation: -9,
          zIndex: 4,
        },
        accessory: { left: 77, top: 77, width: 20, height: 21, rotation: 9, zIndex: 5 },
      };
      return [item.id, placements[item.category]];
    }),
  );
}
