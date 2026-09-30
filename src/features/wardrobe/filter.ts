import type { Garment, GarmentCategory, Season } from '@/types/domain';
import { bottomCoverage } from './visual';
const known = (item: Garment, field: 'fit' | 'formality' | 'seasons') =>
  item.confirmedFields === undefined || item.confirmedFields.includes(field);
export type WardrobeFilters = {
  category: GarmentCategory | 'all';
  color: string;
  season: Season | 'all';
  formality: 'all' | 'casual' | 'smart' | 'formal';
  favoritesOnly: boolean;
  sort: 'added' | 'least-worn' | 'recently-worn' | 'name';
};
export const defaultFilters: WardrobeFilters = {
  category: 'all',
  color: '',
  season: 'all',
  formality: 'all',
  favoritesOnly: false,
  sort: 'added',
};
function searchText(item: Garment) {
  const occasions = !known(item, 'formality') ? '' :
    item.formality >= 7
      ? 'formal work dinner date'
      : item.formality >= 4
        ? 'smart casual dinner work date going out'
        : 'casual everyday relaxed';
  return [
    item.name,
    item.brand,
    item.category,
    item.subcategory,
    item.primaryColor,
    ...item.secondaryColors,
    ...item.styleTags,
    ...item.materials,
    known(item, 'fit') ? item.fit : '',
    occasions,
    item.category === 'footwear'
      ? 'shoe shoes footwear'
      : item.category === 'bottom'
        ? bottomCoverage(item.subcategory) === 'full' ? 'pants trousers bottoms'
          : bottomCoverage(item.subcategory) === 'short' ? 'shorts bottoms' : 'bottoms'
        : item.category === 'outerwear'
          ? 'jacket coat layer'
          : item.category + 's',
  ]
    .join(' ')
    .toLowerCase();
}
export function filterWardrobe(
  items: Garment[],
  query: string,
  filters: WardrobeFilters,
  favorites: string[] = [],
) {
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const result = items.filter((item) => {
    if (filters.category !== 'all' && filters.category !== item.category) return false;
    if (filters.favoritesOnly && !favorites.includes(item.id)) return false;
    if (
      filters.color &&
      ![item.primaryColor, ...item.secondaryColors].some(
        (color) => color.toLowerCase() === filters.color.toLowerCase(),
      )
    )
      return false;
    if (
      filters.season !== 'all' &&
      (!known(item, 'seasons') || (!item.seasons.includes(filters.season) &&
      !item.seasons.includes('all-season')))
    )
      return false;
    if (filters.formality !== 'all' && !known(item, 'formality')) return false;
    if (filters.formality === 'casual' && item.formality > 3) return false;
    if (filters.formality === 'smart' && (item.formality < 4 || item.formality > 6)) return false;
    if (filters.formality === 'formal' && item.formality < 7) return false;
    return terms.every((term) => searchText(item).includes(term));
  });
  if (filters.sort === 'least-worn')
    result.sort((a, b) => a.wearCount - b.wearCount || a.name.localeCompare(b.name));
  if (filters.sort === 'recently-worn')
    result.sort((a, b) => (b.lastWornAt ?? '').localeCompare(a.lastWornAt ?? ''));
  if (filters.sort === 'name') result.sort((a, b) => a.name.localeCompare(b.name));
  return result;
}
export function activeFilterCount(filters: WardrobeFilters) {
  return (
    Number(filters.category !== 'all') +
    Number(Boolean(filters.color)) +
    Number(filters.season !== 'all') +
    Number(filters.formality !== 'all') +
    Number(filters.favoritesOnly) +
    Number(filters.sort !== 'added')
  );
}
