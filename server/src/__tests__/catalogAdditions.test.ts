import { describe, expect, it } from 'vitest';
import { catalogAdditions } from '../scripts/catalogAdditions.js';

describe('catalog additions', () => {
  it('provides a stocked, image-backed mix of new and featured products', () => {
    expect(catalogAdditions).toHaveLength(20);
    expect(new Set(catalogAdditions.map((product) => product.sku)).size).toBe(catalogAdditions.length);
    expect(catalogAdditions.filter((product) => product.isFeatured)).toHaveLength(8);
    expect(catalogAdditions.filter((product) => product.isNewArrival)).toHaveLength(10);
    expect(catalogAdditions.find((product) => product.sku === 'SS-CLO-008')?.images[0]).not.toContain(
      'photo-1583496661160-fb5886a13d27',
    );
    expect(catalogAdditions.find((product) => product.sku === 'SS-BTY-005')?.images[0]).not.toContain(
      'photo-1570194065650-d99fb4bedf0a',
    );

    for (const product of catalogAdditions) {
      expect(product.images).not.toHaveLength(0);
      expect(product.stock).toBeGreaterThan(0);
      expect(product.isActive).toBe(true);
    }
  });
});
