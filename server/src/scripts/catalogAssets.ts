const catalogImageUrl = (photoId: string) =>
  `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=1200&q=85`;

export const CATALOG_PRODUCT_IMAGES = {
  'SS-CLO-002': catalogImageUrl('photo-1549351778-5738a76408a3'),
  'SS-CLO-003': catalogImageUrl('photo-1774005906344-57048d3f5856'),
  'SS-ACC-001': catalogImageUrl('photo-1571254165288-99dd71f0e352'),
  'SS-FTW-001': catalogImageUrl('photo-1777987601431-8d27d2039cc4'),
  'SS-FTW-002': catalogImageUrl('photo-1577387224391-5de31164a0e0'),
  'SS-HOM-001': catalogImageUrl('photo-1755511834495-76cf144e2517'),
  'SS-HOM-002': catalogImageUrl('photo-1757507423608-ae47cddef75f'),
  'SS-BTY-002': catalogImageUrl('photo-1600428853876-fb5a850b444f'),
} as const;

export const ARTISAN_SCENTED_CANDLE_IMAGE = CATALOG_PRODUCT_IMAGES['SS-HOM-001'];
