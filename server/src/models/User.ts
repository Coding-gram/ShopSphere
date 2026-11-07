import mongoose, { type Document, type Model, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

// ── Interface ────────────────────────────────────────────────────────────────

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'customer' | 'admin';
  phone?: string;
  avatar?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

interface IUserModel extends Model<IUser> {
  // static methods can be added here
}

// ── Schema ───────────────────────────────────────────────────────────────────

const userSchema = new Schema<IUser, IUserModel>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: ['customer', 'admin'],
      default: 'customer',
    },
    phone: {
      type: String,
      trim: true,
    },
    avatar: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: Record<string, unknown>) {
        ret.password = undefined;
        ret.__v = undefined;
        return ret;
      },
    },
  },
);

// ── Indexes ──────────────────────────────────────────────────────────────────

userSchema.index({ email: 1 });
userSchema.index({ role: 1 });

// ── Pre-save: hash password ──────────────────────────────────────────────────

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// ── Instance method: compare password ────────────────────────────────────────

userSchema.methods.comparePassword = async function (
  candidate: string,
): Promise<boolean> {
  return bcrypt.compare(candidate, this.password);
};

// ── Export ────────────────────────────────────────────────────────────────────

export const User = mongoose.model<IUser, IUserModel>('User', userSchema);
