import 'dotenv/config';
import mongoose from 'mongoose';
import slugify from 'slugify';
import { env } from '../config/env.js';
import { Category } from '../models/Category.js';
import { Product } from '../models/Product.js';
import { catalogAdditions } from './catalogAdditions.js';

async function seedCatalogAdditions() {
  try {
    await mongoose.connect(env.MONGODB_URI);

    const categoryNames = [...new Set(catalogAdditions.map((product) => product.categoryName))];
    const categories = await Category.find({ name: { $in: categoryNames } }).select('_id name').lean();
    const categoryIds = new Map(categories.map((category) => [category.name, category._id]));
    const missingCategories = categoryNames.filter((name) => !categoryIds.has(name));

    if (missingCategories.length > 0) {
      throw new Error(`Missing catalog categories: ${missingCategories.join(', ')}`);
    }

    const operations = catalogAdditions.map(({ categoryName, name, images, ...product }) => {
      const category = categoryIds.get(categoryName);
      if (!category) throw new Error(`Missing catalog category: ${categoryName}`);

      return {
        updateOne: {
          filter: { sku: product.sku },
          update: {
            $set: {
              images,
            },
            $setOnInsert: {
              ...product,
              name,
              slug: slugify(name, { lower: true, strict: true }),
              category,
            },
          },
          upsert: true,
        },
      };
    });

    const result = await Product.bulkWrite(operations, { ordered: true });
    console.log(`Catalog additions complete: ${result.upsertedCount} inserted, ${result.matchedCount} already present.`);
  } catch (error) {
    console.error('Catalog additions failed:', error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

void seedCatalogAdditions();
