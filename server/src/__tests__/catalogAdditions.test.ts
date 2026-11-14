import { describe, expect, it } from 'vitest';
import { catalogAdditions } from '../scripts/catalogAdditions.js';

describe('catalog additions', () => {
  it('provides a stocked, image-backed mix of new and featured products', () => {
    expect(catalogAdditions).toHaveLength(10);
    expect(new Set(catalogAdditions.map((product) => product.sku)).size).toBe(catalogAdditions.length);
    expect(catalogAdditions.filter((product) => product.isFeatured)).toHaveLength(5);

    for (const product of catalogAdditions) {
      expect(product.images).not.toHaveLength(0);
      expect(product.stock).toBeGreaterThan(0);
      expect(product.isActive).toBe(true);
    }
  });
});
