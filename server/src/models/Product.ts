import mongoose, { type Document, Schema } from 'mongoose';
import slugify from 'slugify';

// ── Sub-document interfaces ──────────────────────────────────────────────────

export interface IProductVariant {
  name: string;
  value: string;
  sku?: string;
  price?: number;
  stock: number;
}

// ── Interface ────────────────────────────────────────────────────────────────

export interface IProduct extends Document {
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  category: mongoose.Types.ObjectId;
  images: string[];
  variants: IProductVariant[];
  stock: number;
  sku: string;
  tags: string[];
  isActive: boolean;
  isFeatured: boolean;
  avgRating: number;
  reviewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// ── Variant sub-schema ───────────────────────────────────────────────────────

const variantSchema = new Schema<IProductVariant>(
  {
    name: { type: String, required: true, trim: true },
    value: { type: String, required: true, trim: true },
    sku: { type: String, trim: true },
    price: { type: Number, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
  },
  { _id: true },
);

// ── Schema ───────────────────────────────────────────────────────────────────

const productSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [200, 'Product name cannot exceed 200 characters'],
    },
    slug: { type: String, unique: true, lowercase: true },
    description: {
      type: String,
      required: [true, 'Product description is required'],
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: [0, 'Price cannot be negative'],
    },
    compareAtPrice: { type: Number, min: [0, 'Compare-at price cannot be negative'] },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Product category is required'],
    },
    images: { type: [String], default: [] },
    variants: { type: [variantSchema], default: [] },
    stock: { type: Number, required: true, min: [0, 'Stock cannot be negative'], default: 0 },
    sku: { type: String, required: [true, 'SKU is required'], unique: true, uppercase: true, trim: true },
    tags: { type: [String], default: [] },
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    avgRating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0, min: 0 },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, versionKey: false },
    toObject: { virtuals: true },
  },
);

// ── Indexes ──────────────────────────────────────────────────────────────────

productSchema.index({ slug: 1 });
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ name: 'text', tags: 'text', description: 'text' });
productSchema.index({ isActive: 1, isFeatured: 1 });
productSchema.index({ createdAt: -1 });

// ── Pre-save: generate slug ──────────────────────────────────────────────────

productSchema.pre('save', function () {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
});

// ── Export ────────────────────────────────────────────────────────────────────

export const Product = mongoose.model<IProduct>('Product', productSchema);
