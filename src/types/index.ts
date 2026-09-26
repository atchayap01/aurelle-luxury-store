export interface ProductSpecification {
  [key: string]: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  category: 'Home' | 'Fashion' | 'Accessories' | 'Beauty' | 'Lifestyle';
  price: number;
  originalPrice?: number;
  discount?: number;
  images: string[];
  stock: number;
  specifications: ProductSpecification;
  featured: boolean;
  bestseller: boolean;
  createdAt: string;
  updatedAt: string;
}

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

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'user' | 'admin';
  addresses: Address[];
  wishlist: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId?: string;
  userEmail: string;
  items: OrderItem[];
  shippingAddress: Address;
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  paymentMethod: 'Cash on Delivery' | 'Card';
  paymentStatus: 'Pending' | 'Paid';
  orderStatus: 'Order Placed' | 'Processing' | 'Shipped' | 'Out for Delivery' | 'Delivered' | 'Cancelled';
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus = Order['orderStatus'];
