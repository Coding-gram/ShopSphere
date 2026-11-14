const catalogImageUrl = (photoId: string) =>
  `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=1200&q=85`;

export const CATALOG_PRODUCT_IMAGES = {
  'SS-CLO-002': catalogImageUrl('photo-1576566588028-4147f3842f27'), // cashmere sweater
  'SS-CLO-003': catalogImageUrl('photo-1594938298603-c8148c4dae35'), // linen trousers
  'SS-ACC-001': catalogImageUrl('photo-1590874103328-eac38a683ce7'), // leather tote bag
  'SS-FTW-001': catalogImageUrl('photo-1614252235316-8c857d38b5f4'), // oxford shoes
  'SS-FTW-002': catalogImageUrl('photo-1638247025967-b4e38f787b76'), // chelsea boots
  'SS-HOM-001': catalogImageUrl('photo-1602028915047-37269d1a73f7'), // scented candles
  'SS-HOM-002': catalogImageUrl('photo-1556679343-c7306c1976bc'), // ceramic tea set
  'SS-BTY-002': catalogImageUrl('photo-1570172619644-dfd03ed5d881'), // face roller
} as const;

export const ARTISAN_SCENTED_CANDLE_IMAGE = CATALOG_PRODUCT_IMAGES['SS-HOM-001'];
