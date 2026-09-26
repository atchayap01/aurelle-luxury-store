import mongoose from 'mongoose';

export interface Address {
  id: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
}

export interface IUser {
  id: string;
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: 'user' | 'admin';
  addresses: Address[];
  wishlist: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

const AddressSchema = new mongoose.Schema<Address>(
  {
    id: { type: String, required: true },
    fullName: { type: String, required: true },
    phone: { type: String, default: '' },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, default: '' },
    postalCode: { type: String, required: true },
    country: { type: String, default: 'India' },
    isDefault: { type: Boolean, default: false }
  },
  { _id: false }
);

const UserSchema = new mongoose.Schema<IUser>(
  {
    id: {
      type: String,
      required: true,
      unique: true
    },

    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    password: {
      type: String,
      required: true
    },

    phone: {
      type: String,
      default: ''
    },

    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user'
    },

    addresses: {
      type: [AddressSchema],
      default: []
    },

    wishlist: {
      type: [String],
      default: []
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

export const User = mongoose.model<IUser>('User', UserSchema);