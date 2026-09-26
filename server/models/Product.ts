import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  images: string[];
  stock: number;
  specifications: Record<string, string>;
  featured: boolean;
  bestseller: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new mongoose.Schema<IProduct>(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true
    },

    name: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      required: true
    },

    category: {
      type: String,
      required: true,
      index: true
    },

    price: {
      type: Number,
      required: true,
      min: 0
    },

    originalPrice: {
      type: Number,
      min: 0
    },

    discount: {
      type: Number,
      min: 0
    },

    images: {
      type: [String],
      default: []
    },

    stock: {
      type: Number,
      required: true,
      default: 10,
      min: 0
    },

    specifications: {
      type: Schema.Types.Mixed,
      default: {}
    },

    featured: {
      type: Boolean,
      default: false
    },

    bestseller: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

export const Product = mongoose.model<IProduct>('Product', ProductSchema);

export default Product;