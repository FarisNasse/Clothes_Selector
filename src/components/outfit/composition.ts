import type { Garment } from '@/types/domain';
import { topRole } from '@/features/wardrobe/visual';
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
  const hasOuter = garments.some((item) => item.category === 'outerwear');
  const twoTops = garments.filter((item) => item.category === 'top').length > 1;
  return Object.fromEntries(
    garments.map((item) => {
      const placements: Record<Garment['category'], Placement> = {
        outerwear: { left: 2, top: 5, width: hasSuit ? 42 : 52, height: 68, rotation: -7, zIndex: 1 },
        suit: { left: hasOuter ? 46 : 3, top: 3, width: hasOuter ? 43 : 54, height: 74, rotation: -5, zIndex: 2 },
        top: {
          left: twoTops ? (topRole(item.subcategory) === 'mid' ? 39 : 24) : layered ? 31 : 6,
          top: twoTops ? (topRole(item.subcategory) === 'mid' ? 26 : 7) : layered ? 11 : 9,
          width: twoTops ? 37 : layered ? 42 : 56,
          height: twoTops ? 46 : layered ? 50 : 62,
          rotation: 5,
          zIndex: twoTops && topRole(item.subcategory) === 'mid' ? 4 : 3,
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
