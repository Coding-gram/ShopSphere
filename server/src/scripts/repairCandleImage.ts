import 'dotenv/config';
import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { Product } from '../models/Product.js';
import { ARTISAN_SCENTED_CANDLE_IMAGE } from './catalogAssets.js';

async function repairCandleImage() {
  await mongoose.connect(env.MONGODB_URI);

  const result = await Product.updateOne(
    { sku: 'SS-HOM-001' },
    { $set: { images: [ARTISAN_SCENTED_CANDLE_IMAGE] } },
  );

  if (result.matchedCount !== 1) {
    throw new Error('Artisan Scented Candle Trio was not found. Seed the catalog before running this repair.');
  }

  console.log('Updated the Artisan Scented Candle Trio image.');
}

repairCandleImage()
  .catch((error: unknown) => {
    console.error('Could not update the Artisan Scented Candle Trio image:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
