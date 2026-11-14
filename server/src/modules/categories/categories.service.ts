import { Category, type ICategory } from '../../models/Category.js';
import { Product } from '../../models/Product.js';
import { ApiError } from '../../utils/ApiError.js';
import type { Types } from 'mongoose';

export async function listCategories(activeOnly = true) {
  const filter = activeOnly ? { isActive: true } : {};
  return Category.find(filter).sort({ name: 1 }).lean();
}

export async function getCategoryBySlug(slug: string) {
  const category = await Category.findOne({ slug, isActive: true }).lean();
  if (!category) throw new ApiError(404, 'Category not found');
  return category;
}

export async function createCategory(data: Partial<ICategory>) {
  if (data.parent) {
    const parentExists = await Category.findById(data.parent);
    if (!parentExists) throw new ApiError(400, 'Invalid parent category');
  }
  return Category.create(data);
}

export async function updateCategory(id: string, data: Partial<ICategory>) {
  if (data.parent) {
    await assertValidParent(id, data.parent);
  }

  const category = await Category.findByIdAndUpdate(id, data, {
    returnDocument: 'after',
    runValidators: true,
  });
  if (!category) throw new ApiError(404, 'Category not found');
  return category;
}

async function assertValidParent(categoryId: string, parentId: Types.ObjectId) {
  let currentId: Types.ObjectId | null = parentId;
  const visited = new Set<string>();

  while (currentId) {
    const currentKey = currentId.toString();
    if (currentKey === categoryId || visited.has(currentKey)) {
      throw new ApiError(400, 'Category parent relationship cannot contain a cycle');
    }
    visited.add(currentKey);
    const parentCategory: { parent?: Types.ObjectId | null } | null = await Category
      .findById(currentId)
      .select('parent')
      .lean();
    if (!parentCategory) throw new ApiError(400, 'Invalid parent category');
    currentId = parentCategory.parent ?? null;
  }
}

export async function deleteCategory(id: string) {
  const productCount = await Product.countDocuments({ category: id });
  if (productCount > 0) {
    throw new ApiError(
      400,
      `Cannot delete category with ${productCount} product(s). Reassign them first.`,
    );
  }

  const childCount = await Category.countDocuments({ parent: id });
  if (childCount > 0) {
    throw new ApiError(
      400,
      `Cannot delete category with ${childCount} subcategory(ies). Reassign them first.`,
    );
  }

  const category = await Category.findByIdAndDelete(id);
  if (!category) throw new ApiError(404, 'Category not found');
}
