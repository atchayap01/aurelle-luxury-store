import mongoose, { Schema, Document } from 'mongoose';

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface ShippingAddress {
  id: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface IOrder extends Document {
  id: string;
  orderNumber: string;
  userId?: string;
  userEmail: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  paymentMethod: 'Card' | 'Cash on Delivery';
  paymentStatus: 'Paid' | 'Pending';
  orderStatus:
    | 'Order Placed'
    | 'Processing'
    | 'Shipped'
    | 'Out for Delivery'
    | 'Delivered'
    | 'Cancelled';
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<OrderItem>(
  {
    productId: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    image: { type: String, default: '' }
  },
  { _id: false }
);

const ShippingAddressSchema = new Schema<ShippingAddress>(
  {
    id: { type: String, required: true },
    fullName: { type: String, required: true },
    phone: { type: String, default: '' },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, default: '' },
    postalCode: { type: String, required: true },
    country: { type: String, default: 'India' }
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true
    },

    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true
    },

    userId: {
      type: String,
      index: true
    },

    userEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true
    },

    items: {
      type: [OrderItemSchema],
      required: true
    },

    shippingAddress: {
      type: ShippingAddressSchema,
      required: true
    },

    subtotal: {
      type: Number,
      required: true,
      min: 0
    },

    shippingFee: {
      type: Number,
      required: true,
      min: 0
    },

    discount: {
      type: Number,
      default: 0,
      min: 0
    },

    total: {
      type: Number,
      required: true,
      min: 0
    },

    paymentMethod: {
      type: String,
      enum: ['Card', 'Cash on Delivery'],
      required: true
    },

    paymentStatus: {
      type: String,
      enum: ['Paid', 'Pending'],
      required: true
    },

    orderStatus: {
      type: String,
      enum: [
        'Order Placed',
        'Processing',
        'Shipped',
        'Out for Delivery',
        'Delivered',
        'Cancelled'
      ],
      default: 'Order Placed'
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

export const Order = mongoose.model<IOrder>('Order', OrderSchema);

export default Order;