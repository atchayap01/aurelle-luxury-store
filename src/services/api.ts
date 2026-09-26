import axios from 'axios';
import { Product, User, Order, Address } from '../types';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('aurelle_auth_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor for session expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if invalid or unauthorized
      if (window.location.pathname.startsWith('/account') || window.location.pathname.startsWith('/admin')) {
        localStorage.removeItem('aurelle_auth_token');
        localStorage.removeItem('aurelle_user');
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: async (data: { name: string; email: string; password: string; confirmPassword?: string; phone?: string }) => {
    const res = await api.post<{ message: string; token: string; user: User }>('/auth/register', data);
    return res.data;
  },
  login: async (data: { email: string; password: string; rememberMe?: boolean }) => {
    const res = await api.post<{ message: string; token: string; user: User }>('/auth/login', data);
    return res.data;
  },
  getMe: async () => {
    const res = await api.get<{ user: User }>('/auth/me');
    return res.data.user;
  },
  updateProfile: async (data: { name?: string; phone?: string }) => {
    const res = await api.put<{ message: string; user: User }>('/auth/profile', data);
    return res.data;
  },
  toggleWishlist: async (productId: string) => {
    const res = await api.post<{ added: boolean; wishlist: string[]; message: string; user?: User }>('/auth/wishlist/toggle', { productId });
    return res.data;
  },
  syncWishlist: async (productIds: string[]) => {
    const res = await api.post<{ message: string; wishlist: string[]; addedCount: number; user?: User; products?: Product[] }>('/auth/wishlist/sync', { productIds });
    return res.data;
  },
  getWishlist: async () => {
    const res = await api.get<{ wishlist: string[]; products: Product[] }>('/auth/wishlist');
    return res.data;
  },
  addToWishlist: async (productId: string) => {
    const res = await api.post<{ added: boolean; wishlist: string[]; message: string; user?: User }>('/auth/wishlist/add', { productId });
    return res.data;
  },
  removeFromWishlist: async (productId: string) => {
    const res = await api.delete<{ removed: boolean; wishlist: string[]; message: string; user?: User }>(`/auth/wishlist/${productId}`);
    return res.data;
  },
  addAddress: async (data: Omit<Address, 'id'>) => {
    const res = await api.post<{ message: string; addresses: Address[] }>('/auth/addresses', data);
    return res.data;
  },
  deleteAddress: async (id: string) => {
    const res = await api.delete<{ message: string; addresses: Address[] }>(`/auth/addresses/${id}`);
    return res.data;
  },
};

export interface ProductQueryParams {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  featured?: boolean;
  bestseller?: boolean;
  inStock?: boolean;
  page?: number;
  limit?: number;
}

export const productsAPI = {
  getProducts: async (params?: ProductQueryParams) => {
    const res = await api.get<{
      products: Product[];
      total: number;
      page: number;
      totalPages: number;
      limit: number;
    }>('/products', { params });
    return res.data;
  },
  getProductById: async (id: string) => {
    const res = await api.get<{ product: Product; related: Product[] }>(`/products/${id}`);
    return res.data;
  },
  createProduct: async (data: Partial<Product>) => {
    const res = await api.post<{ message: string; product: Product }>('/products', data);
    return res.data;
  },
  updateProduct: async (id: string, data: Partial<Product>) => {
    const res = await api.put<{ message: string; product: Product }>(`/products/${id}`, data);
    return res.data;
  },
  deleteProduct: async (id: string) => {
    const res = await api.delete<{ message: string; id: string }>(`/products/${id}`);
    return res.data;
  },
};

export const ordersAPI = {
  createOrder: async (data: {
    items: { productId: string; quantity: number }[];
    shippingAddress: Partial<Address> & { email?: string };
    paymentMethod: 'Cash on Delivery' | 'Card';
  }) => {
    const res = await api.post<{ message: string; order: Order }>('/orders', data);
    return res.data;
  },
  getOrders: async () => {
    const res = await api.get<{ orders: Order[] }>('/orders');
    return res.data.orders;
  },
  getOrderById: async (id: string) => {
    const res = await api.get<{ order: Order }>(`/orders/${id}`);
    return res.data.order;
  },
  updateOrderStatus: async (id: string, data: { orderStatus?: string; paymentStatus?: string }) => {
    const res = await api.put<{ message: string; order: Order }>(`/orders/${id}/status`, data);
    return res.data;
  },
  cancelOrder: async (id: string) => {
    const res = await api.delete<{ message: string; order: Order }>(`/orders/${id}`);
    return res.data;
  },
};

export const adminAPI = {
  getStats: async () => {
    const res = await api.get<{
      totalUsers: number;
      totalProducts: number;
      totalOrders: number;
      totalRevenue: number;
      pendingOrdersCount: number;
      lowStockCount: number;
      lowStockProducts: Product[];
      recentOrders: Order[];
    }>('/admin/stats');
    return res.data;
  },
  getUsers: async () => {
    const res = await api.get<{ users: User[] }>('/users');
    return res.data.users;
  },
  getUserById: async (id: string) => {
    const res = await api.get<{ user: User }>(`/users/${id}`);
    return res.data.user;
  },
  updateUser: async (id: string, data: { role?: 'user' | 'admin'; name?: string; phone?: string }) => {
    const res = await api.put<{ message: string; user: User }>(`/users/${id}`, data);
    return res.data;
  },
  deleteUser: async (id: string) => {
    const res = await api.delete<{ message: string }>(`/users/${id}`);
    return res.data;
  },
};

export default api;
