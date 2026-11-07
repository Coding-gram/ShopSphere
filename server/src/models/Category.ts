import mongoose, { type Document, Schema } from 'mongoose';
import slugify from 'slugify';

// ── Interface ────────────────────────────────────────────────────────────────

export interface ICategory extends Document {
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parent?: mongoose.Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ── Schema ───────────────────────────────────────────────────────────────────

const categorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      unique: true,
      trim: true,
      maxlength: [80, 'Category name cannot exceed 80 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    image: {
      type: String,
    },
    parent: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, versionKey: false },
    toObject: { virtuals: true },
  },
);

// ── Indexes ──────────────────────────────────────────────────────────────────

categorySchema.index({ slug: 1 });
categorySchema.index({ parent: 1 });

// ── Pre-save: generate slug ──────────────────────────────────────────────────

categorySchema.pre('save', function () {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
});

// ── Export ────────────────────────────────────────────────────────────────────

export const Category = mongoose.model<ICategory>('Category', categorySchema);
