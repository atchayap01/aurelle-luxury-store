import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Package,
  ShoppingBag,
  TrendingUp,
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  X,
  Check,
  Search,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { adminAPI, productsAPI, ordersAPI } from '../services/api';
import { Product, Order, User } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import { useToast } from '../context/ToastContext';
import { ImageWithFallback } from '../components/ImageWithFallback';

interface AdminDashboardProps {
  onNavigate: (page: string, params?: any) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const { user, isAdmin } = useAuth();
  const { success, error } = useToast();

  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'users'>('overview');
  const [stats, setStats] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Product modal state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    category: 'Home' as 'Home' | 'Fashion' | 'Accessories' | 'Beauty' | 'Lifestyle',
    price: '',
    originalPrice: '',
    discount: '',
    stock: '10',
    description: '',
    image1: '',
    image2: '',
    featured: false,
    bestseller: false,
  });

  // Filter queries inside admin
  const [productSearch, setProductSearch] = useState('');
  const [orderSearch, setOrderSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');

  const loadAllAdminData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [statsData, prodsData, ordersData, usersData] = await Promise.all([
        adminAPI.getStats(),
        productsAPI.getProducts({ limit: 100 }),
        ordersAPI.getOrders(),
        adminAPI.getUsers(),
      ]);
      setStats(statsData);
      setProducts(prodsData.products);
      setOrders(ordersData);
      setUsers(usersData);
    } catch (err: any) {
      console.error('Error fetching admin data:', err);
      error('Admin Error', err.response?.data?.error || 'Could not load management records.');
    } finally {
      setIsLoading(false);
    }
  }, [error]);

  useEffect(() => {
    if (isAdmin) {
      loadAllAdminData();
    }
  }, [isAdmin, loadAllAdminData]);

  if (!isAdmin) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <AlertTriangle className="w-10 h-10 text-red-800 mx-auto mb-3" />
        <h2 className="font-serif text-2xl text-[#2C2520] mb-2">Restricted Curator Vault</h2>
        <p className="text-xs text-[#A99B8C] mb-6">
          Access to Curator Studio is strictly limited to authorized atelier administrators.
        </p>
        <button
          onClick={() => onNavigate('home')}
          className="px-6 py-3 bg-[#2C2520] text-[#F8F5EF] text-xs uppercase tracking-widest"
        >
          Return to Atelier
        </button>
      </div>
    );
  }

  // --- Product CRUD Handlers ---
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      category: 'Home',
      price: '',
      originalPrice: '',
      discount: '',
      stock: '10',
      description: '',
      image1: 'https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?auto=format&fit=crop&w=1000&q=80',
      image2: '',
      featured: false,
      bestseller: false,
    });
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setProductForm({
      name: prod.name,
      category: prod.category,
      price: String(prod.price),
      originalPrice: prod.originalPrice ? String(prod.originalPrice) : '',
      discount: prod.discount ? String(prod.discount) : '',
      stock: String(prod.stock),
      description: prod.description,
      image1: prod.images[0] || '',
      image2: prod.images[1] || '',
      featured: prod.featured || false,
      bestseller: prod.bestseller || false,
    });
    setIsProductModalOpen(true);
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const images = [productForm.image1];
      if (productForm.image2.trim()) images.push(productForm.image2.trim());

      const payload = {
        name: productForm.name,
        category: productForm.category,
        price: Number(productForm.price),
        originalPrice: productForm.originalPrice ? Number(productForm.originalPrice) : undefined,
        discount: productForm.discount ? Number(productForm.discount) : undefined,
        stock: Number(productForm.stock),
        description: productForm.description,
        images,
        featured: productForm.featured,
        bestseller: productForm.bestseller,
      };

      if (editingProduct) {
        await productsAPI.updateProduct(editingProduct.id, payload);
        success('Piece Updated', `${productForm.name} catalog record updated.`);
      } else {
        await productsAPI.createProduct(payload);
        success('Piece Added', `${productForm.name} enrolled into archive.`);
      }

      setIsProductModalOpen(false);
      loadAllAdminData();
    } catch (err: any) {
      error('Action Failed', err.response?.data?.error || 'Could not save product.');
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (confirm(`Remove "${name}" permanently from the archive?`)) {
      try {
        await productsAPI.deleteProduct(id);
        success('Piece Removed', `${name} deleted.`);
        loadAllAdminData();
      } catch (err: any) {
        error('Delete Failed', err.response?.data?.error || 'Unable to delete piece.');
      }
    }
  };

  // --- Order Status Updater ---
  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await ordersAPI.updateOrderStatus(orderId, { orderStatus: newStatus });
      success('Status Updated', `Consignment status set to ${newStatus}.`);
      loadAllAdminData();
    } catch (err: any) {
      error('Update Failed', err.response?.data?.error || 'Unable to update status.');
    }
  };

  // --- User Role Updater ---
  const handleToggleUserRole = async (userId: string, currentRole: 'user' | 'admin') => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      await adminAPI.updateUser(userId, { role: newRole });
      success('Role Modified', `User privilege updated to ${newRole}.`);
      loadAllAdminData();
    } catch (err: any) {
      error('Role Update Failed', err.response?.data?.error || 'Cannot modify role.');
    }
  };

  const handleDeleteUser = async (userId: string, name: string) => {
    if (confirm(`Delete account for ${name}?`)) {
      try {
        await adminAPI.deleteUser(userId);
        success('Account Removed', `${name}'s account was deleted.`);
        loadAllAdminData();
      } catch (err: any) {
        error('Action Failed', err.response?.data?.error || 'Could not delete user.');
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      
      {/* Admin Studio Header */}
      <div className="border-b border-[#E8DED0] pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-[0.24em] font-medium text-[#A99B8C] block mb-1">
            Atelier Governance
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#2C2520] font-normal flex items-center gap-3">
            <span>Curator Studio</span>
            <span className="text-xs bg-[#2C2520] text-[#D6C2A5] px-2.5 py-1 uppercase tracking-widest font-sans font-semibold">
              Admin
            </span>
          </h1>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-[#E8DED0]/50 p-1 rounded-xs gap-1 text-xs uppercase tracking-wider font-medium">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 transition-colors ${
              activeTab === 'overview' ? 'bg-[#2C2520] text-white' : 'text-[#2C2520] hover:bg-[#E8DED0]'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2 transition-colors ${
              activeTab === 'products' ? 'bg-[#2C2520] text-white' : 'text-[#2C2520] hover:bg-[#E8DED0]'
            }`}
          >
            Catalogue ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 transition-colors ${
              activeTab === 'orders' ? 'bg-[#2C2520] text-white' : 'text-[#2C2520] hover:bg-[#E8DED0]'
            }`}
          >
            Orders ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 transition-colors ${
              activeTab === 'users' ? 'bg-[#2C2520] text-white' : 'text-[#2C2520] hover:bg-[#E8DED0]'
            }`}
          >
            Clients ({users.length})
          </button>
        </div>
      </div>

      {/* TAB 1: OVERVIEW & METRICS */}
      {activeTab === 'overview' && (
        <div className="space-y-10 animate-fade-in">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-[#E8DED0]/30 border border-[#E8DED0] p-6 rounded-xs">
              <div className="flex justify-between items-start text-[#A99B8C] mb-3">
                <span className="text-xs uppercase tracking-wider font-medium">Total Revenue</span>
                <TrendingUp className="w-4 h-4 text-[#2C2520]" />
              </div>
              <div className="font-mono text-2xl sm:text-3xl font-bold text-[#2C2520]">
                {formatCurrency(stats?.totalRevenue || 0)}
              </div>
              <p className="text-[11px] text-[#A99B8C] mt-2">Settled & active orders</p>
            </div>

            <div className="bg-[#E8DED0]/30 border border-[#E8DED0] p-6 rounded-xs">
              <div className="flex justify-between items-start text-[#A99B8C] mb-3">
                <span className="text-xs uppercase tracking-wider font-medium">Orders Placed</span>
                <ShoppingBag className="w-4 h-4 text-[#2C2520]" />
              </div>
              <div className="font-mono text-2xl sm:text-3xl font-bold text-[#2C2520]">
                {stats?.totalOrders || 0}
              </div>
              <p className="text-[11px] text-[#A99B8C] mt-2">
                {stats?.pendingOrdersCount || 0} requiring packing/shipment
              </p>
            </div>

            <div className="bg-[#E8DED0]/30 border border-[#E8DED0] p-6 rounded-xs">
              <div className="flex justify-between items-start text-[#A99B8C] mb-3">
                <span className="text-xs uppercase tracking-wider font-medium">Archival Pieces</span>
                <Package className="w-4 h-4 text-[#2C2520]" />
              </div>
              <div className="font-mono text-2xl sm:text-3xl font-bold text-[#2C2520]">
                {stats?.totalProducts || 0}
              </div>
              <p className="text-[11px] text-[#A99B8C] mt-2">Across 5 distinct disciplines</p>
            </div>

            <div className="bg-[#E8DED0]/30 border border-[#E8DED0] p-6 rounded-xs">
              <div className="flex justify-between items-start text-[#A99B8C] mb-3">
                <span className="text-xs uppercase tracking-wider font-medium">Client Accounts</span>
                <Users className="w-4 h-4 text-[#2C2520]" />
              </div>
              <div className="font-mono text-2xl sm:text-3xl font-bold text-[#2C2520]">
                {stats?.totalUsers || 0}
              </div>
              <p className="text-[11px] text-[#A99B8C] mt-2">Registered collectors</p>
            </div>
          </div>

          {/* Quick Insights Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Low Stock Alerts */}
            <div className="bg-[#F8F5EF] border border-[#E8DED0] p-6 rounded-xs space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-[#E8DED0]">
                <h3 className="font-serif text-lg text-[#2C2520]">Low Inventory Notice</h3>
                <span className="text-xs font-mono text-amber-800 bg-amber-50 px-2 py-0.5 border border-amber-200">
                  {stats?.lowStockCount || 0} pieces under 5 units
                </span>
              </div>

              {stats?.lowStockProducts && stats.lowStockProducts.length > 0 ? (
                <div className="space-y-3">
                  {stats.lowStockProducts.map((p: Product) => (
                    <div
                      key={p.id}
                      className="flex justify-between items-center text-xs py-2 border-b border-[#E8DED0]/50"
                    >
                      <div>
                        <span className="font-medium text-[#2C2520]">{p.name}</span>
                        <span className="text-[#A99B8C] ml-2">({p.category})</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-semibold text-amber-800">
                          {p.stock} left
                        </span>
                        <button
                          onClick={() => handleOpenEditProduct(p)}
                          className="text-[11px] uppercase tracking-wider underline hover:text-[#A99B8C]"
                        >
                          Restock
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#A99B8C] py-4">All inventory levels are healthy.</p>
              )}
            </div>

            {/* Recent Consignments */}
            <div className="bg-[#F8F5EF] border border-[#E8DED0] p-6 rounded-xs space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-[#E8DED0]">
                <h3 className="font-serif text-lg text-[#2C2520]">Recent Consignments</h3>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-xs uppercase tracking-wider text-[#2C2520] hover:text-[#A99B8C]"
                >
                  View All Orders →
                </button>
              </div>

              {stats?.recentOrders && stats.recentOrders.length > 0 ? (
                <div className="space-y-3">
                  {stats.recentOrders.map((o: Order) => (
                    <div
                      key={o.id}
                      className="flex justify-between items-center text-xs py-2 border-b border-[#E8DED0]/50"
                    >
                      <div>
                        <span className="font-mono font-bold text-[#2C2520]">{o.orderNumber}</span>
                        <span className="text-[#A99B8C] ml-2">{o.userEmail}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-medium">{formatCurrency(o.total)}</span>
                        <span className="text-[10px] uppercase font-semibold bg-[#E8DED0] px-2 py-0.5">
                          {o.orderStatus}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#A99B8C] py-4">No recent orders.</p>
              )}
            </div>

          </div>
        </div>
      )}

      {/* TAB 2: PRODUCTS MANAGEMENT */}
      {activeTab === 'products' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8DED0]">
            <div className="relative flex-1 sm:max-w-md">
              <Search className="w-4 h-4 text-[#A99B8C] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="Search archive by name or category..."
                className="w-full bg-[#F8F5EF] border border-[#E8DED0] pl-9 pr-3 py-2 text-xs text-[#2C2520]"
              />
            </div>

            <button
              onClick={handleOpenAddProduct}
              className="px-5 py-2.5 bg-[#2C2520] text-[#F8F5EF] text-xs uppercase tracking-wider font-semibold flex items-center gap-2 hover:bg-[#3D342E]"
            >
              <Plus className="w-4 h-4" />
              <span>Enroll New Piece</span>
            </button>
          </div>

          {/* Products Table */}
          <div className="border border-[#E8DED0] overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#E8DED0]/50 text-[#A99B8C] uppercase tracking-wider border-b border-[#E8DED0]">
                <tr>
                  <th className="p-4">Piece</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4">Curations</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8DED0]">
                {products
                  .filter((p) =>
                    !productSearch.trim() ||
                    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
                    p.category.toLowerCase().includes(productSearch.toLowerCase())
                  )
                  .map((prod) => (
                    <tr key={prod.id} className="hover:bg-[#E8DED0]/20 transition-colors">
                      <td className="p-4 flex items-center gap-3">
                        <div className="w-12 h-14 bg-[#E8DED0] overflow-hidden shrink-0 border border-[#E8DED0]">
                          <ImageWithFallback
                            src={prod.images[0]}
                            alt={prod.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="font-serif font-medium text-sm text-[#2C2520]">
                            {prod.name}
                          </div>
                          <span className="font-mono text-[10px] text-[#A99B8C]">{prod.id}</span>
                        </div>
                      </td>
                      <td className="p-4 uppercase tracking-wider text-[11px] text-[#2C2520]">
                        {prod.category}
                      </td>
                      <td className="p-4 font-mono font-medium text-[#2C2520]">
                        {formatCurrency(prod.price)}
                      </td>
                      <td className="p-4 font-mono">
                        <span
                          className={`font-semibold ${
                            prod.stock <= 5 ? 'text-red-700' : 'text-[#2C2520]'
                          }`}
                        >
                          {prod.stock}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-1">
                          {prod.featured && (
                            <span className="text-[10px] bg-[#2C2520] text-white px-1.5 py-0.5 uppercase tracking-wider">
                              Feat
                            </span>
                          )}
                          {prod.bestseller && (
                            <span className="text-[10px] bg-[#D6C2A5] text-[#2C2520] px-1.5 py-0.5 uppercase tracking-wider font-semibold">
                              Best
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-3">
                          <button
                            onClick={() => handleOpenEditProduct(prod)}
                            className="text-[#2C2520] hover:text-[#A99B8C] p-1"
                            aria-label="Edit piece"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(prod.id, prod.name)}
                            className="text-[#A99B8C] hover:text-red-700 p-1"
                            aria-label="Delete piece"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: ORDERS MANAGEMENT */}
      {activeTab === 'orders' && (
        <div className="space-y-6 animate-fade-in">
          <div className="relative max-w-md">
            <Search className="w-4 h-4 text-[#A99B8C] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={orderSearch}
              onChange={(e) => setOrderSearch(e.target.value)}
              placeholder="Search by order #, email, or recipient name..."
              className="w-full bg-[#F8F5EF] border border-[#E8DED0] pl-9 pr-3 py-2 text-xs text-[#2C2520]"
            />
          </div>

          <div className="border border-[#E8DED0] overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#E8DED0]/50 text-[#A99B8C] uppercase tracking-wider border-b border-[#E8DED0]">
                <tr>
                  <th className="p-4">Reference</th>
                  <th className="p-4">Client</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Pieces</th>
                  <th className="p-4">Total</th>
                  <th className="p-4">Status & Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8DED0]">
                {orders
                  .filter((o) =>
                    !orderSearch.trim() ||
                    o.orderNumber.toLowerCase().includes(orderSearch.toLowerCase()) ||
                    o.userEmail.toLowerCase().includes(orderSearch.toLowerCase()) ||
                    o.shippingAddress.fullName.toLowerCase().includes(orderSearch.toLowerCase())
                  )
                  .map((ord) => (
                    <tr key={ord.id} className="hover:bg-[#E8DED0]/20 transition-colors">
                      <td className="p-4 font-mono font-bold text-[#2C2520]">
                        {ord.orderNumber}
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-[#2C2520]">
                          {ord.shippingAddress.fullName}
                        </div>
                        <div className="text-[#A99B8C] font-mono text-[11px]">{ord.userEmail}</div>
                        <div className="text-[10px] text-[#A99B8C]">{ord.shippingAddress.city}</div>
                      </td>
                      <td className="p-4 text-[#A99B8C]">{formatDate(ord.createdAt)}</td>
                      <td className="p-4">
                        <span className="font-mono">{ord.items.length} items</span>
                      </td>
                      <td className="p-4 font-mono font-semibold text-[#2C2520]">
                        {formatCurrency(ord.total)}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <select
                            value={ord.orderStatus}
                            onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value)}
                            className="bg-[#F8F5EF] border border-[#E8DED0] px-2 py-1 text-xs uppercase tracking-wider font-medium focus:outline-none cursor-pointer"
                          >
                            <option value="Order Placed">Order Placed</option>
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Out for Delivery">Out for Delivery</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>

                          <button
                            onClick={() => onNavigate('track', { orderId: ord.orderNumber })}
                            className="text-[#A99B8C] hover:text-[#2C2520] underline text-[11px] uppercase tracking-wider whitespace-nowrap"
                          >
                            Consignment Details
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: USERS MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="space-y-6 animate-fade-in">
          <div className="relative max-w-md">
            <Search className="w-4 h-4 text-[#A99B8C] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              placeholder="Search clients by name or email..."
              className="w-full bg-[#F8F5EF] border border-[#E8DED0] pl-9 pr-3 py-2 text-xs text-[#2C2520]"
            />
          </div>

          <div className="border border-[#E8DED0] overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#E8DED0]/50 text-[#A99B8C] uppercase tracking-wider border-b border-[#E8DED0]">
                <tr>
                  <th className="p-4">Client</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Contact</th>
                  <th className="p-4">Role</th>
                  <th className="p-4 text-right">Privilege Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8DED0]">
                {users
                  .filter((u) =>
                    !userSearch.trim() ||
                    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
                    u.email.toLowerCase().includes(userSearch.toLowerCase())
                  )
                  .map((usr) => (
                    <tr key={usr.id} className="hover:bg-[#E8DED0]/20 transition-colors">
                      <td className="p-4 font-medium text-[#2C2520] flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-[#2C2520] text-[#D6C2A5] flex items-center justify-center font-serif text-xs">
                          {usr.name.charAt(0).toUpperCase()}
                        </div>
                        <span>{usr.name}</span>
                      </td>
                      <td className="p-4 font-mono text-[#A99B8C]">{usr.email}</td>
                      <td className="p-4 font-mono">{usr.phone || '—'}</td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-0.5 text-[10px] uppercase tracking-wider font-semibold ${
                            usr.role === 'admin'
                              ? 'bg-[#2C2520] text-[#D6C2A5]'
                              : 'bg-[#E8DED0] text-[#2C2520]'
                          }`}
                        >
                          {usr.role}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-3 items-center">
                          <button
                            onClick={() => handleToggleUserRole(usr.id, usr.role)}
                            className="text-xs text-[#2C2520] hover:underline uppercase tracking-wider"
                          >
                            {usr.role === 'admin' ? 'Demote to User' : 'Promote to Admin'}
                          </button>
                          {usr.id !== user?.id && (
                            <button
                              onClick={() => handleDeleteUser(usr.id, usr.name)}
                              className="text-[#A99B8C] hover:text-red-700 p-1"
                              aria-label="Delete client"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Product Add / Edit Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div
            className="fixed inset-0 bg-[#2C2520]/60 backdrop-blur-xs"
            onClick={() => setIsProductModalOpen(false)}
          />

          <div className="relative bg-[#F8F5EF] border border-[#E8DED0] max-w-2xl w-full p-6 sm:p-8 shadow-2xl z-10 max-h-[90vh] overflow-y-auto my-8">
            <div className="flex justify-between items-center pb-4 border-b border-[#E8DED0] mb-6">
              <h3 className="font-serif text-2xl text-[#2C2520]">
                {editingProduct ? 'Edit Archival Piece' : 'Enroll New Piece'}
              </h3>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="text-[#A99B8C] hover:text-[#2C2520] p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleProductSubmit} className="space-y-4 text-xs">
              <div>
                <label className="uppercase tracking-wider text-[#2C2520] font-medium block mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  value={productForm.name}
                  onChange={(e) => setProductForm((p) => ({ ...p, name: e.target.value }))}
                  required
                  placeholder="e.g. Sculptural Ceramic Vase"
                  className="w-full bg-[#F8F5EF] border border-[#E8DED0] px-3 py-2 text-sm text-[#2C2520]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="uppercase tracking-wider text-[#2C2520] font-medium block mb-1">
                    Category *
                  </label>
                  <select
                    value={productForm.category}
                    onChange={(e) =>
                      setProductForm((p) => ({ ...p, category: e.target.value as any }))
                    }
                    className="w-full bg-[#F8F5EF] border border-[#E8DED0] px-3 py-2 text-xs"
                  >
                    <option value="Home">Home</option>
                    <option value="Fashion">Fashion</option>
                    <option value="Accessories">Accessories</option>
                    <option value="Beauty">Beauty</option>
                    <option value="Lifestyle">Lifestyle</option>
                  </select>
                </div>

                <div>
                  <label className="uppercase tracking-wider text-[#2C2520] font-medium block mb-1">
                    Available Stock *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={productForm.stock}
                    onChange={(e) => setProductForm((p) => ({ ...p, stock: e.target.value }))}
                    required
                    className="w-full bg-[#F8F5EF] border border-[#E8DED0] px-3 py-2 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="uppercase tracking-wider text-[#2C2520] font-medium block mb-1">
                    Price (INR) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={productForm.price}
                    onChange={(e) => setProductForm((p) => ({ ...p, price: e.target.value }))}
                    required
                    placeholder="4800"
                    className="w-full bg-[#F8F5EF] border border-[#E8DED0] px-3 py-2 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="uppercase tracking-wider text-[#2C2520] font-medium block mb-1">
                    Original Price
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={productForm.originalPrice}
                    onChange={(e) =>
                      setProductForm((p) => ({ ...p, originalPrice: e.target.value }))
                    }
                    placeholder="6000"
                    className="w-full bg-[#F8F5EF] border border-[#E8DED0] px-3 py-2 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="uppercase tracking-wider text-[#2C2520] font-medium block mb-1">
                    Discount %
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="99"
                    value={productForm.discount}
                    onChange={(e) => setProductForm((p) => ({ ...p, discount: e.target.value }))}
                    placeholder="20"
                    className="w-full bg-[#F8F5EF] border border-[#E8DED0] px-3 py-2 text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="uppercase tracking-wider text-[#2C2520] font-medium block mb-1">
                  Primary Image URL *
                </label>
                <input
                  type="url"
                  value={productForm.image1}
                  onChange={(e) => setProductForm((p) => ({ ...p, image1: e.target.value }))}
                  required
                  placeholder="https://..."
                  className="w-full bg-[#F8F5EF] border border-[#E8DED0] px-3 py-2 text-xs font-mono"
                />
              </div>

              <div>
                <label className="uppercase tracking-wider text-[#2C2520] font-medium block mb-1">
                  Secondary Perspective Image URL
                </label>
                <input
                  type="url"
                  value={productForm.image2}
                  onChange={(e) => setProductForm((p) => ({ ...p, image2: e.target.value }))}
                  placeholder="https://..."
                  className="w-full bg-[#F8F5EF] border border-[#E8DED0] px-3 py-2 text-xs font-mono"
                />
              </div>

              <div>
                <label className="uppercase tracking-wider text-[#2C2520] font-medium block mb-1">
                  Atelier Description *
                </label>
                <textarea
                  rows={4}
                  value={productForm.description}
                  onChange={(e) =>
                    setProductForm((p) => ({ ...p, description: e.target.value }))
                  }
                  required
                  placeholder="Detail the materials, artisanal techniques, and spatial intent..."
                  className="w-full bg-[#F8F5EF] border border-[#E8DED0] px-3 py-2 text-xs text-[#2C2520]"
                />
              </div>

              <div className="flex gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={productForm.featured}
                    onChange={(e) =>
                      setProductForm((p) => ({ ...p, featured: e.target.checked }))
                    }
                    className="accent-[#2C2520]"
                  />
                  <span className="uppercase tracking-wider font-medium text-[#2C2520]">
                    Feature on Homepage
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={productForm.bestseller}
                    onChange={(e) =>
                      setProductForm((p) => ({ ...p, bestseller: e.target.checked }))
                    }
                    className="accent-[#2C2520]"
                  />
                  <span className="uppercase tracking-wider font-medium text-[#2C2520]">
                    Bestseller Designation
                  </span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-[#E8DED0]">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-5 py-2.5 border border-[#E8DED0] text-xs uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#2C2520] text-[#F8F5EF] text-xs uppercase tracking-wider font-semibold hover:bg-[#3D342E]"
                >
                  {editingProduct ? 'Save Modifications' : 'Enroll Piece'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
