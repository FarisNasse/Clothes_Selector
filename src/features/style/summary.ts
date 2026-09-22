import type { Garment, StyleProfile } from '@/types/domain';
function rank(values: string[]) {
  const counts = new Map<string, number>();
  for (const value of values)
    counts.set(value.toLowerCase(), (counts.get(value.toLowerCase()) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}
export function summarizeStyle(garments: Garment[], profile: StyleProfile) {
  const colors = rank(garments.map((item) => item.primaryColor));
  const fits = rank(
    garments
      .filter((item) => item.category !== 'footwear' && item.category !== 'accessory')
      .map((item) => item.fit),
  );
  const chosen = Object.entries(profile.styleWeights)
    .filter(([, value]) => value >= 0.65)
    .sort((a, b) => b[1] - a[1]);
  const descriptor = chosen[0]?.[0] ?? null;
  return {
    colors: colors.slice(0, 5),
    descriptor,
    fit: fits[0]?.[0] ?? profile.preferredFits[0] ?? null,
    description: garments.length
      ? 'Your wardrobe leans toward ' +
        colors
          .slice(0, 3)
          .map(([color]) => color)
          .join(', ') +
        (fits[0] ? ', with ' + fits[0][0] + ' silhouettes.' : '.')
      : 'Your style starts with the pieces you choose. Add a few to see your wardrobe take shape.',
    rediscover: [...garments]
      .sort(
        (a, b) =>
          a.wearCount - b.wearCount || (a.lastWornAt ?? '').localeCompare(b.lastWornAt ?? ''),
      )
      .slice(0, 3),
  };
}
