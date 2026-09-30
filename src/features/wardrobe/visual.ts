import type { Garment } from '@/types/domain';

/** Versioned, conservative mapping. An unknown subtype never acquires invented coverage. */
export const VISUAL_TAXONOMY_VERSION = 1;
export type BottomCoverage = 'short' | 'full' | 'unknown';
export type TopRole = 'base' | 'mid';
export type AccessoryPlacement = 'head' | 'neck' | 'waist' | 'wrist' | 'shoulder' | 'eyes' | 'unknown';

export function bottomCoverage(subcategory: string): BottomCoverage {
  if (/shorts?\b|bermuda/i.test(subcategory)) return 'short';
  if (/\b(jeans?|trousers?|pants?|chinos?|joggers?|sweatpants?|slacks?)\b/i.test(subcategory)) return 'full';
  return 'unknown';
}

export function topRole(subcategory: string): TopRole {
  return /sweater|cardigan|hoodie|sweatshirt|pullover|fleece|jumper/i.test(subcategory) ? 'mid' : 'base';
}

export function accessoryPlacement(subcategory: string): AccessoryPlacement {
  if (/\b(cap|hat|beanie)\b/i.test(subcategory)) return 'head';
  if (/scarf|tie|pocket square/i.test(subcategory)) return 'neck';
  if (/belt/i.test(subcategory)) return 'waist';
  if (/watch|bracelet/i.test(subcategory)) return 'wrist';
  if (/bag|tote/i.test(subcategory)) return 'shoulder';
  if (/glasses/i.test(subcategory)) return 'eyes';
  return 'unknown';
}

export function visualSlot(item: Garment) {
  if (item.category === 'bottom') return bottomCoverage(item.subcategory);
  if (item.category === 'top') return topRole(item.subcategory);
  if (item.category === 'accessory') return accessoryPlacement(item.subcategory);
  return item.category;
}
