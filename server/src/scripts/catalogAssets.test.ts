import { describe, expect, it } from 'vitest';
import { CATALOG_PRODUCT_IMAGES } from './catalogAssets.js';

describe('catalog product image repairs', () => {
  it('maps every corrected product SKU to a unique optimized Unsplash image', () => {
    const entries = Object.entries(CATALOG_PRODUCT_IMAGES);

    expect(Object.keys(CATALOG_PRODUCT_IMAGES)).toEqual([
      'SS-CLO-002',
      'SS-CLO-003',
      'SS-ACC-001',
      'SS-FTW-001',
      'SS-FTW-002',
      'SS-HOM-001',
      'SS-HOM-002',
      'SS-BTY-002',
    ]);
    expect(new Set(entries.map(([, image]) => image)).size).toBe(entries.length);

    for (const [, image] of entries) {
      expect(image).toMatch(
        /^https:\/\/images\.unsplash\.com\/photo-[\w-]+\?auto=format&fit=crop&w=1200&q=85$/,
      );
    }
  });
});
