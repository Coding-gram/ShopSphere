import { Cart } from '../../models/Cart.js';
import { Product } from '../../models/Product.js';
import { ApiError } from '../../utils/ApiError.js';
import { MAX_CART_ITEM_QUANTITY } from './cart.validators.js';

interface CartProductView {
  _id: { toString(): string };
  name: string;
  slug: string;
  price: number;
  stock: number;
  images: string[];
  isActive: boolean;
}

function assertValidQuantity(quantity: number): void {
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_CART_ITEM_QUANTITY) {
    throw new ApiError(400, `Quantity must be between 1 and ${MAX_CART_ITEM_QUANTITY}`);
  }
}

export function toCartView(cart: Awaited<ReturnType<typeof getCart>>) {
  const items = cart.items.map((item) => {
    if (!item._id) throw new ApiError(500, 'Cart item is missing its identifier');
    const product = item.product as unknown as CartProductView | null;
    const itemPrice = Number(item.price);
    const quantity = Number(item.quantity);

    return {
      _id: item._id.toString(),
      product: product
        ? {
            _id: product._id.toString(),
            name: product.name,
            slug: product.slug,
            price: product.price,
            stock: product.stock,
            images: product.images,
            isActive: product.isActive,
          }
        : null,
      quantity,
      price: itemPrice,
      lineTotal: itemPrice * quantity,
    };
  });
  const subtotal = items.reduce((total, item) => total + item.lineTotal, 0);

  return {
    _id: cart._id.toString(),
    items,
    itemCount: items.reduce((total, item) => total + item.quantity, 0),
    subtotal,
    total: subtotal,
    createdAt: cart.createdAt,
    updatedAt: cart.updatedAt,
  };
}

// ── Get cart (create if not exists) ──────────────────────────────────────────

export async function getCart(userId: string) {
  let cart = await Cart.findOne({ user: userId }).populate({
    path: 'items.product',
    select: 'name slug price stock images isActive',
    populate: { path: 'category', select: 'name slug' },
  });

  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
    // populate on the new empty cart
    await cart.populate({
      path: 'items.product',
      select: 'name slug price stock images isActive',
      populate: { path: 'category', select: 'name slug' },
    });
  }

  return cart;
}

// ── Add item to cart ─────────────────────────────────────────────────────────

export async function addItem(userId: string, productId: string, quantity: number) {
  assertValidQuantity(quantity);
  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    throw new ApiError(404, 'Product not found');
  }

  if (product.stock < quantity) {
    throw new ApiError(400, `Insufficient stock. Only ${product.stock} available.`);
  }

  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }

  // Check if product already in cart
  const existingItem = cart.items.find(
    (item) => item.product.toString() === productId,
  );

  if (existingItem) {
    const newQty = existingItem.quantity + quantity;
    if (newQty > product.stock) {
      throw new ApiError(400, `Cannot add more. Only ${product.stock} available (${existingItem.quantity} in cart).`);
    }
    if (newQty > MAX_CART_ITEM_QUANTITY) {
      throw new ApiError(400, 'Maximum 10 of each item allowed.');
    }
    existingItem.quantity = newQty;
    existingItem.price = product.price; // always use latest price
  } else {
    cart.items.push({
      product: product._id,
      quantity,
      price: product.price,
    });
  }

  await cart.save();

  return getCart(userId);
}

// ── Update item quantity ─────────────────────────────────────────────────────

export async function updateItem(userId: string, itemId: string, quantity: number) {
  assertValidQuantity(quantity);
  const cart = await Cart.findOne({ user: userId });
  if (!cart) throw new ApiError(404, 'Cart not found');

  const item = cart.items.find((i) => i._id?.toString() === itemId);
  if (!item) throw new ApiError(404, 'Item not found in cart');

  // Validate stock
  const product = await Product.findById(item.product);
  if (!product || !product.isActive) {
    throw new ApiError(400, 'Product is no longer available');
  }

  if (quantity > product.stock) {
    throw new ApiError(400, `Insufficient stock. Only ${product.stock} available.`);
  }

  item.quantity = quantity;
  item.price = product.price; // refresh price

  await cart.save();
  return getCart(userId);
}

// ── Remove item from cart ────────────────────────────────────────────────────

export async function removeItem(userId: string, itemId: string) {
  const cart = await Cart.findOne({ user: userId });
  if (!cart) throw new ApiError(404, 'Cart not found');

  const idx = cart.items.findIndex((i) => i._id?.toString() === itemId);
  if (idx === -1) throw new ApiError(404, 'Item not found in cart');

  cart.items.splice(idx, 1);
  await cart.save();
  return getCart(userId);
}

// ── Clear cart ───────────────────────────────────────────────────────────────

export async function clearCart(userId: string) {
  const cart = await Cart.findOne({ user: userId });
  if (cart) {
    cart.items = [];
    await cart.save();
  }
}
