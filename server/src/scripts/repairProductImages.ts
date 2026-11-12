import 'dotenv/config';
import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { Product } from '../models/Product.js';
import { CATALOG_PRODUCT_IMAGES } from './catalogAssets.js';

async function repairProductImages() {
  await mongoose.connect(env.MONGODB_URI);

  const repairs = Object.entries(CATALOG_PRODUCT_IMAGES);
  const expectedSkus = repairs.map(([sku]) => sku);
  const existingProducts = await Product.find(
    { sku: { $in: expectedSkus } },
    { sku: 1 },
  ).lean();
  const existingSkus = new Set(existingProducts.map((product) => product.sku));
  const missingSkus = expectedSkus.filter((sku) => !existingSkus.has(sku));

  if (missingSkus.length > 0) {
    throw new Error(
      `Could not find catalog products for: ${missingSkus.join(', ')}. Seed the catalog before running this repair.`,
    );
  }

  const result = await Product.bulkWrite(
    repairs.map(([sku, image]) => ({
      updateOne: {
        filter: { sku },
        update: { $set: { images: [image] } },
      },
    })),
  );

  if (result.matchedCount !== repairs.length) {
    throw new Error(
      `Updated ${result.matchedCount} of ${repairs.length} catalog products. Check the catalog before retrying.`,
    );
  }

  console.log(`Verified image records for ${result.matchedCount} catalog products.`);
}

repairProductImages()
  .catch((error: unknown) => {
    console.error('Could not update catalog product images:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
