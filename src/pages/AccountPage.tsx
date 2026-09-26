import React, { useState, useEffect } from 'react';
import {
  User as UserIcon,
  PackageCheck,
  Heart,
  MapPin,
  LogOut,
  Edit2,
  Trash2,
  Plus,
  ShoppingBag,
  ExternalLink,
  ShieldCheck,
  Check,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ordersAPI, productsAPI, authAPI } from '../services/api';
import { Order, Product, Address } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import { useToast } from '../context/ToastContext';
import { ImageWithFallback } from '../components/ImageWithFallback';

interface AccountPageProps {
  initialTab?: 'profile' | 'orders' | 'wishlist' | 'addresses';
  onNavigate: (page: string, params?: any) => void;
  onSelectProduct: (product: Product) => void;
}

export const AccountPage: React.FC<AccountPageProps> = ({
  initialTab = 'profile',
  onNavigate,
  onSelectProduct,
}) => {
  const { user, logout, updateProfile, addAddress, deleteAddress, toggleWishlist, syncWishlist, isAdmin } = useAuth();
  const { addToCart } = useCart();
  const { success, error } = useToast();

  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'wishlist' | 'addresses'>(initialTab);
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [isLoadingWishlist, setIsLoadingWishlist] = useState(false);
  const [isSyncingWishlist, setIsSyncingWishlist] = useState(false);

  // Edit Profile form state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');

  // Add Address form state
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    isDefault: false,
  });

  useEffect(() => {
    if (user) {
      setName(user.name);
      setPhone(user.phone || '');
    }
  }, [user]);

  // Load orders
  useEffect(() => {
    if (activeTab === 'orders') {
      const loadOrders = async () => {
        setIsLoadingOrders(true);
        try {
          const list = await ordersAPI.getOrders();
          setOrders(list);
        } catch (err) {
          console.error('Error fetching orders:', err);
        } finally {
          setIsLoadingOrders(false);
        }
      };
      loadOrders();
    }
  }, [activeTab]);

  // Load wishlist products directly from server database
  useEffect(() => {
    if (activeTab === 'wishlist') {
      const loadWishlistItems = async () => {
        setIsLoadingWishlist(true);
        try {
          // Fetch populated wishlist products directly from the server database
          const res = await authAPI.getWishlist();
          setWishlistProducts(res.products || []);
        } catch {
          // Fallback to local products filter
          try {
            if (user?.wishlist) {
              const allProds = await productsAPI.getProducts({ limit: 50 });
              const filtered = allProds.products.filter((p) => user.wishlist.includes(p.id));
              setWishlistProducts(filtered);
            }
          } catch (err) {
            console.error('Error fetching fallback wishlist:', err);
          }
        } finally {
          setIsLoadingWishlist(false);
        }
      };
      loadWishlistItems();
    }
  }, [activeTab, user?.wishlist]);

  const handleManualSyncWishlist = async () => {
    setIsSyncingWishlist(true);
    try {
      await syncWishlist();
      const res = await authAPI.getWishlist();
      setWishlistProducts(res.products || []);
      success('Database Synchronized', 'Your private wishlist is up to date.');
    } catch {
      error('Sync Error', 'Could not refresh server wishlist.');
    } finally {
      setIsSyncingWishlist(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await updateProfile({ name, phone });
    if (ok) setIsEditingProfile(false);
  };

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddress.fullName || !newAddress.address || !newAddress.city || !newAddress.postalCode) {
      error('Address Incomplete', 'Please fill in required fields.');
      return;
    }
    const ok = await addAddress(newAddress);
    if (ok) {
      setIsAddingAddress(false);
      setNewAddress({
        fullName: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'India',
        isDefault: false,
      });
    }
  };

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <h2 className="font-serif text-2xl text-[#2C2520] mb-3">Sign in Required</h2>
        <p className="text-xs text-[#A99B8C] mb-6">
          Please log in to your Aurelle client profile to view order history and private collections.
        </p>
        <button
          onClick={() => onNavigate('auth')}
          className="px-6 py-3 bg-[#2C2520] text-[#F8F5EF] text-xs uppercase tracking-widest"
        >
          Sign In / Register
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      
      {/* Client Overview Banner */}
      <div className="bg-[#E8DED0]/40 border border-[#E8DED0] p-6 sm:p-8 rounded-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[#2C2520] text-[#D6C2A5] flex items-center justify-center font-serif text-2xl">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-2xl sm:text-3xl text-[#2C2520]">{user.name}</h1>
              {isAdmin && (
                <span className="text-[10px] bg-[#2C2520] text-[#D6C2A5] px-2 py-0.5 uppercase tracking-widest font-semibold">
                  Curator / Admin
                </span>
              )}
            </div>
            <p className="text-xs text-[#A99B8C] font-mono mt-0.5">{user.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isAdmin && (
            <button
              onClick={() => onNavigate('admin')}
              className="px-4 py-2.5 bg-[#2C2520] text-[#D6C2A5] text-xs uppercase tracking-wider font-semibold flex items-center gap-2"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Curator Studio</span>
            </button>
          )}

          <button
            onClick={() => {
              logout();
              onNavigate('home');
            }}
            className="px-4 py-2.5 border border-[#2C2520] text-[#2C2520] hover:bg-[#2C2520] hover:text-[#F8F5EF] text-xs uppercase tracking-wider transition-colors flex items-center gap-2"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Navigation Sidebar */}
        <div className="lg:col-span-3 bg-[#F8F5EF] border border-[#E8DED0] p-3 rounded-xs space-y-1">
          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full text-left px-4 py-3 text-xs uppercase tracking-wider flex items-center gap-3 transition-colors ${
              activeTab === 'profile'
                ? 'bg-[#2C2520] text-[#F8F5EF] font-semibold'
                : 'text-[#2C2520] hover:bg-[#E8DED0]/50'
            }`}
          >
            <UserIcon className="w-4 h-4" />
            <span>Client Profile</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full text-left px-4 py-3 text-xs uppercase tracking-wider flex items-center gap-3 transition-colors ${
              activeTab === 'orders'
                ? 'bg-[#2C2520] text-[#F8F5EF] font-semibold'
                : 'text-[#2C2520] hover:bg-[#E8DED0]/50'
            }`}
          >
            <PackageCheck className="w-4 h-4" />
            <span>Order History</span>
          </button>

          <button
            onClick={() => setActiveTab('wishlist')}
            className={`w-full text-left px-4 py-3 text-xs uppercase tracking-wider flex items-center justify-between transition-colors ${
              activeTab === 'wishlist'
                ? 'bg-[#2C2520] text-[#F8F5EF] font-semibold'
                : 'text-[#2C2520] hover:bg-[#E8DED0]/50'
            }`}
          >
            <span className="flex items-center gap-3">
              <Heart className="w-4 h-4" />
              <span>Curated Wishlist</span>
            </span>
            {user.wishlist && user.wishlist.length > 0 && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 bg-[#D6C2A5] text-[#2C2520] font-semibold rounded-full">
                {user.wishlist.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('addresses')}
            className={`w-full text-left px-4 py-3 text-xs uppercase tracking-wider flex items-center gap-3 transition-colors ${
              activeTab === 'addresses'
                ? 'bg-[#2C2520] text-[#F8F5EF] font-semibold'
                : 'text-[#2C2520] hover:bg-[#E8DED0]/50'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Saved Addresses</span>
          </button>
        </div>

        {/* Tab Content Display */}
        <div className="lg:col-span-9 bg-[#F8F5EF] border border-[#E8DED0] p-6 sm:p-8 rounded-xs min-h-[400px]">
          
          {/* TAB 1: PROFILE */}
          {activeTab === 'profile' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex justify-between items-center pb-4 border-b border-[#E8DED0]">
                <div>
                  <h2 className="font-serif text-2xl text-[#2C2520]">Client Profile</h2>
                  <p className="text-xs text-[#A99B8C]">Your personal credentials and salon tier.</p>
                </div>
                {!isEditingProfile && (
                  <button
                    onClick={() => setIsEditingProfile(true)}
                    className="text-xs uppercase tracking-wider text-[#2C2520] hover:text-[#A99B8C] flex items-center gap-1.5"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit Profile</span>
                  </button>
                )}
              </div>

              {isEditingProfile ? (
                <form onSubmit={handleProfileSubmit} className="space-y-4 max-w-md">
                  <div>
                    <label className="text-xs uppercase tracking-wider text-[#2C2520] font-medium block mb-1">
                      Legal Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full bg-[#F8F5EF] border border-[#E8DED0] px-4 py-2.5 text-sm text-[#2C2520] focus:outline-none focus:border-[#2C2520]"
                    />
                  </div>

                  <div>
                    <label className="text-xs uppercase tracking-wider text-[#2C2520] font-medium block mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full bg-[#F8F5EF] border border-[#E8DED0] px-4 py-2.5 text-sm text-[#2C2520] focus:outline-none focus:border-[#2C2520]"
                    />
                  </div>

                  <div className="flex gap-3 pt-3">
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-[#2C2520] text-[#F8F5EF] text-xs uppercase tracking-wider font-semibold"
                    >
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(false)}
                      className="px-6 py-2.5 border border-[#E8DED0] text-[#2C2520] text-xs uppercase tracking-wider"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4 max-w-lg text-xs">
                  <div className="flex justify-between py-2 border-b border-[#E8DED0]/60">
                    <span className="text-[#A99B8C] uppercase tracking-wider">Full Name</span>
                    <span className="font-medium text-[#2C2520]">{user.name}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-[#E8DED0]/60">
                    <span className="text-[#A99B8C] uppercase tracking-wider">Email Address</span>
                    <span className="font-mono text-[#2C2520]">{user.email}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-[#E8DED0]/60">
                    <span className="text-[#A99B8C] uppercase tracking-wider">Primary Contact</span>
                    <span className="font-mono text-[#2C2520]">{user.phone || 'Not specified'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-[#E8DED0]/60">
                    <span className="text-[#A99B8C] uppercase tracking-wider">Membership Role</span>
                    <span className="uppercase font-semibold tracking-wider text-[#2C2520]">{user.role}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ORDERS */}
          {activeTab === 'orders' && (
            <div className="space-y-6 animate-fade-in">
              <div className="pb-4 border-b border-[#E8DED0]">
                <h2 className="font-serif text-2xl text-[#2C2520]">Order History</h2>
                <p className="text-xs text-[#A99B8C]">
                  Track progress, view consignments, or request concierge care.
                </p>
              </div>

              {isLoadingOrders ? (
                <div className="py-12 text-center text-xs text-[#A99B8C] font-mono">
                  Loading order ledgers...
                </div>
              ) : orders.length === 0 ? (
                <div className="py-16 text-center">
                  <PackageCheck className="w-8 h-8 text-[#A99B8C] mx-auto mb-2 stroke-1" />
                  <p className="font-serif text-lg text-[#2C2520]">No Orders Yet</p>
                  <p className="text-xs text-[#A99B8C] max-w-xs mx-auto mt-1 mb-6">
                    You have not placed any orders yet. Discover our latest collections.
                  </p>
                  <button
                    onClick={() => onNavigate('shop')}
                    className="px-6 py-2.5 bg-[#2C2520] text-[#F8F5EF] text-xs uppercase tracking-wider font-semibold"
                  >
                    Explore Catalogue
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((ord) => (
                    <div
                      key={ord.id}
                      className="border border-[#E8DED0] p-5 bg-[#E8DED0]/15 rounded-xs space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#E8DED0]/60 gap-2">
                        <div>
                          <span className="font-mono text-sm font-bold text-[#2C2520]">
                            {ord.orderNumber}
                          </span>
                          <span className="text-xs text-[#A99B8C] ml-3">
                            {formatDate(ord.createdAt)}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span
                            className={`px-2.5 py-0.5 text-[10px] uppercase tracking-wider font-semibold ${
                              ord.orderStatus === 'Cancelled'
                                ? 'bg-red-100 text-red-800'
                                : ord.orderStatus === 'Delivered'
                                ? 'bg-[#2C2520] text-[#F8F5EF]'
                                : 'bg-[#D6C2A5]/70 text-[#2C2520]'
                            }`}
                          >
                            {ord.orderStatus}
                          </span>
                          <button
                            onClick={() => onNavigate('track', { orderId: ord.orderNumber })}
                            className="text-xs text-[#2C2520] hover:text-[#A99B8C] underline uppercase tracking-wider flex items-center gap-1"
                          >
                            <span>Track Consignment</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Items row */}
                      <div className="flex flex-wrap gap-4 items-center">
                        {ord.items.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs">
                            <div className="w-8 h-10 bg-[#E8DED0] overflow-hidden shrink-0 border border-[#E8DED0]">
                              <ImageWithFallback
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <span className="font-medium text-[#2C2520] line-clamp-1">
                                {item.name}
                              </span>
                              <span className="text-[#A99B8C] font-mono text-[11px]">
                                Qty: {item.quantity}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="pt-2 border-t border-[#E8DED0]/60 flex justify-between text-xs font-mono">
                        <span className="text-[#A99B8C]">
                          Payment: {ord.paymentMethod} ({ord.paymentStatus})
                        </span>
                        <span className="font-semibold text-sm text-[#2C2520]">
                          Total: {formatCurrency(ord.total)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: WISHLIST */}
          {activeTab === 'wishlist' && (
            <div className="space-y-6 animate-fade-in">
              <div className="pb-4 border-b border-[#E8DED0] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2.5">
                    <h2 className="font-serif text-2xl text-[#2C2520]">Curated Wishlist</h2>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#E8DED0]/70 border border-[#D6C2A5]/80 text-[10px] uppercase font-mono tracking-wider text-[#2C2520] rounded-xs">
                      <Sparkles className="w-3 h-3 text-[#A99B8C]" />
                      <span>Server Synced</span>
                    </span>
                  </div>
                  <p className="text-xs text-[#A99B8C] mt-0.5">
                    Your privately saved considerations, synchronized in real time with your Aurelle database account.
                  </p>
                </div>
                <button
                  onClick={handleManualSyncWishlist}
                  disabled={isSyncingWishlist}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#E8DED0] bg-[#F8F5EF] hover:bg-[#E8DED0]/50 text-xs font-mono uppercase tracking-wider text-[#2C2520] transition-colors disabled:opacity-50 self-start sm:self-auto cursor-pointer"
                  title="Synchronize wishlist with Aurelle database"
                >
                  <RefreshCw className={`w-3 h-3 ${isSyncingWishlist ? 'animate-spin' : ''}`} />
                  <span>{isSyncingWishlist ? 'Syncing...' : 'Sync Wishlist'}</span>
                </button>
              </div>

              {isLoadingWishlist ? (
                <div className="py-12 text-center text-xs text-[#A99B8C] font-mono">
                  Accessing private curations...
                </div>
              ) : wishlistProducts.length === 0 ? (
                <div className="py-16 text-center">
                  <Heart className="w-8 h-8 text-[#A99B8C] mx-auto mb-2 stroke-1" />
                  <p className="font-serif text-lg text-[#2C2520]">Your Wishlist is Empty</p>
                  <p className="text-xs text-[#A99B8C] max-w-xs mx-auto mt-1 mb-6">
                    Bookmark items from our catalog to review or acquire when you are ready.
                  </p>
                  <button
                    onClick={() => onNavigate('shop')}
                    className="px-6 py-2.5 bg-[#2C2520] text-[#F8F5EF] text-xs uppercase tracking-wider font-semibold"
                  >
                    Browse Collections
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {wishlistProducts.map((prod) => (
                    <div
                      key={prod.id}
                      className="border border-[#E8DED0] bg-[#F8F5EF] p-3 flex flex-col justify-between group"
                    >
                      <div
                        onClick={() => onSelectProduct(prod)}
                        className="cursor-pointer"
                      >
                        <div className="aspect-[4/5] bg-[#E8DED0] overflow-hidden mb-3">
                          <ImageWithFallback
                            src={prod.images[0]}
                            alt={prod.name}
                            category={prod.category}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                        <span className="text-[10px] uppercase tracking-wider text-[#A99B8C]">
                          {prod.category}
                        </span>
                        <h4 className="font-serif text-sm text-[#2C2520] line-clamp-1">
                          {prod.name}
                        </h4>
                        <div className="font-mono text-xs font-semibold text-[#2C2520] mt-1">
                          {formatCurrency(prod.price)}
                        </div>
                      </div>

                      <div className="flex gap-2 mt-4 pt-3 border-t border-[#E8DED0]">
                        <button
                          onClick={() => addToCart(prod, 1)}
                          disabled={prod.stock <= 0}
                          className="flex-1 py-2 bg-[#2C2520] text-[#F8F5EF] text-[10px] uppercase tracking-wider font-medium flex items-center justify-center gap-1.5 disabled:opacity-30"
                        >
                          <ShoppingBag className="w-3 h-3" />
                          <span>Move to Bag</span>
                        </button>
                        <button
                          onClick={() => toggleWishlist(prod.id)}
                          className="p-2 border border-[#E8DED0] text-[#A99B8C] hover:text-red-700 transition-colors"
                          aria-label="Remove from wishlist"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: ADDRESSES */}
          {activeTab === 'addresses' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex justify-between items-center pb-4 border-b border-[#E8DED0]">
                <div>
                  <h2 className="font-serif text-2xl text-[#2C2520]">Saved Shipping Addresses</h2>
                  <p className="text-xs text-[#A99B8C]">
                    Manage destinations for white-glove courier deliveries.
                  </p>
                </div>
                {!isAddingAddress && (
                  <button
                    onClick={() => setIsAddingAddress(true)}
                    className="px-4 py-2 bg-[#2C2520] text-[#F8F5EF] text-xs uppercase tracking-wider font-medium flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Destination</span>
                  </button>
                )}
              </div>

              {/* Add Address Form */}
              {isAddingAddress && (
                <form
                  onSubmit={handleAddressSubmit}
                  className="bg-[#E8DED0]/20 p-6 border border-[#E8DED0] rounded-xs space-y-4 mb-6"
                >
                  <h3 className="font-serif text-lg text-[#2C2520]">New Delivery Destination</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs uppercase tracking-wider text-[#2C2520] font-medium block mb-1">
                        Recipient Name *
                      </label>
                      <input
                        type="text"
                        value={newAddress.fullName}
                        onChange={(e) =>
                          setNewAddress((p) => ({ ...p, fullName: e.target.value }))
                        }
                        required
                        className="w-full bg-[#F8F5EF] border border-[#E8DED0] px-3 py-2 text-xs text-[#2C2520]"
                      />
                    </div>
                    <div>
                      <label className="text-xs uppercase tracking-wider text-[#2C2520] font-medium block mb-1">
                        Contact Phone *
                      </label>
                      <input
                        type="tel"
                        value={newAddress.phone}
                        onChange={(e) =>
                          setNewAddress((p) => ({ ...p, phone: e.target.value }))
                        }
                        required
                        className="w-full bg-[#F8F5EF] border border-[#E8DED0] px-3 py-2 text-xs text-[#2C2520]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs uppercase tracking-wider text-[#2C2520] font-medium block mb-1">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      value={newAddress.address}
                      onChange={(e) =>
                        setNewAddress((p) => ({ ...p, address: e.target.value }))
                      }
                      required
                      className="w-full bg-[#F8F5EF] border border-[#E8DED0] px-3 py-2 text-xs text-[#2C2520]"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs uppercase tracking-wider text-[#2C2520] font-medium block mb-1">
                        City *
                      </label>
                      <input
                        type="text"
                        value={newAddress.city}
                        onChange={(e) =>
                          setNewAddress((p) => ({ ...p, city: e.target.value }))
                        }
                        required
                        className="w-full bg-[#F8F5EF] border border-[#E8DED0] px-3 py-2 text-xs text-[#2C2520]"
                      />
                    </div>
                    <div>
                      <label className="text-xs uppercase tracking-wider text-[#2C2520] font-medium block mb-1">
                        State
                      </label>
                      <input
                        type="text"
                        value={newAddress.state}
                        onChange={(e) =>
                          setNewAddress((p) => ({ ...p, state: e.target.value }))
                        }
                        className="w-full bg-[#F8F5EF] border border-[#E8DED0] px-3 py-2 text-xs text-[#2C2520]"
                      />
                    </div>
                    <div>
                      <label className="text-xs uppercase tracking-wider text-[#2C2520] font-medium block mb-1">
                        Postal Code *
                      </label>
                      <input
                        type="text"
                        value={newAddress.postalCode}
                        onChange={(e) =>
                          setNewAddress((p) => ({ ...p, postalCode: e.target.value }))
                        }
                        required
                        className="w-full bg-[#F8F5EF] border border-[#E8DED0] px-3 py-2 text-xs text-[#2C2520]"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="submit"
                      className="px-6 py-2 bg-[#2C2520] text-[#F8F5EF] text-xs uppercase tracking-wider font-semibold"
                    >
                      Save Destination
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsAddingAddress(false)}
                      className="px-6 py-2 border border-[#E8DED0] text-[#2C2520] text-xs uppercase tracking-wider"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {/* Address Cards List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(user.addresses || []).map((addr) => (
                  <div
                    key={addr.id}
                    className="p-5 border border-[#E8DED0] bg-[#F8F5EF] rounded-xs relative flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-xs text-[#2C2520]">
                          {addr.fullName}
                        </span>
                        {addr.isDefault && (
                          <span className="text-[10px] bg-[#2C2520] text-[#F8F5EF] px-2 py-0.5 uppercase tracking-wider font-medium">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#2C2520]/80 leading-relaxed">
                        {addr.address}
                      </p>
                      <p className="text-xs text-[#2C2520]/80">
                        {addr.city}, {addr.state} - {addr.postalCode}
                      </p>
                      <p className="text-[11px] text-[#A99B8C] font-mono mt-2">
                        {addr.phone}
                      </p>
                    </div>

                    <div className="pt-4 mt-4 border-t border-[#E8DED0]/60 flex justify-end">
                      <button
                        onClick={() => deleteAddress(addr.id)}
                        className="text-xs text-[#A99B8C] hover:text-red-700 flex items-center gap-1 uppercase tracking-wider"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
