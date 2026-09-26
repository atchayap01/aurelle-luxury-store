import React, { useState, useEffect } from 'react';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { SearchModal } from './components/SearchModal';
import { QuickViewModal } from './components/QuickViewModal';

import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { ProductDetailsPage } from './pages/ProductDetailsPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderSuccessPage } from './pages/OrderSuccessPage';
import { OrderTrackingPage } from './pages/OrderTrackingPage';
import { AuthPage } from './pages/AuthPage';
import { AccountPage } from './pages/AccountPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { CategoriesPage } from './pages/CategoriesPage';
import { AboutPage } from './pages/AboutPage';

import { Product } from './types';

interface NavigationState {
  page: string;
  params?: any;
}

const AppContent: React.FC = () => {
  const [navState, setNavState] = useState<NavigationState>(() => {
    // Parse initial URL hash if present
    const hash = window.location.hash.replace('#', '');
    if (hash) {
      const [page, queryString] = hash.split('?');
      const params = queryString ? Object.fromEntries(new URLSearchParams(queryString)) : {};
      return { page: page || 'home', params };
    }
    return { page: 'home' };
  });

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Sync route with URL hash for browser back/forward and direct links
  const navigate = (page: string, params: any = {}) => {
    setNavState({ page, params });
    const query = new URLSearchParams(params).toString();
    const hashTarget = query ? `#${page}?${query}` : `#${page}`;
    window.location.hash = hashTarget;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash) {
        const [page, queryString] = hash.split('?');
        const params = queryString ? Object.fromEntries(new URLSearchParams(queryString)) : {};
        setNavState({ page: page || 'home', params });
      } else {
        setNavState({ page: 'home' });
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleSelectProduct = (product: Product) => {
    navigate('product-details', { productId: product.id });
  };

  const handleQuickView = (product: Product) => {
    setQuickViewProduct(product);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F5EF] text-[#2C2520]">
      {/* Top Navbar */}
      <Navbar
        currentPage={navState.page}
        onNavigate={navigate}
        onOpenSearch={() => setIsSearchOpen(true)}
      />

      {/* Main Page Render */}
      <main className="flex-1">
        {navState.page === 'home' && (
          <HomePage
            onNavigate={navigate}
            onSelectProduct={handleSelectProduct}
            onQuickView={handleQuickView}
          />
        )}

        {navState.page === 'shop' && (
          <ShopPage
            initialCategory={navState.params?.category || (navState.params?.filter === 'featured' ? 'All' : undefined)}
            initialSearch={navState.params?.search || ''}
            initialSort={navState.params?.filter || 'featured'}
            onSelectProduct={handleSelectProduct}
            onQuickView={handleQuickView}
          />
        )}

        {navState.page === 'product-details' && (
          <ProductDetailsPage
            productId={navState.params?.productId || 'prod-001'}
            onNavigate={navigate}
            onSelectProduct={handleSelectProduct}
            onQuickView={handleQuickView}
          />
        )}

        {navState.page === 'cart' && (
          <CartPage
            onNavigate={navigate}
            onSelectProduct={handleSelectProduct}
          />
        )}

        {navState.page === 'checkout' && (
          <CheckoutPage
            onNavigate={navigate}
            onOrderCompleted={(order) => {
              navigate('order-success', { orderId: order.orderNumber || order.id });
            }}
          />
        )}

        {navState.page === 'order-success' && (
          <OrderSuccessPage
            orderId={navState.params?.orderId}
            onNavigate={navigate}
          />
        )}

        {navState.page === 'track' && (
          <OrderTrackingPage
            initialOrderId={navState.params?.orderId || ''}
            onNavigate={navigate}
          />
        )}

        {navState.page === 'auth' && (
          <AuthPage
            initialTab={navState.params?.tab === 'register' ? 'register' : 'login'}
            onNavigate={navigate}
          />
        )}

        {navState.page === 'account' && (
          <AccountPage
            initialTab={navState.params?.tab || 'profile'}
            onNavigate={navigate}
            onSelectProduct={handleSelectProduct}
          />
        )}

        {navState.page === 'admin' && (
          <AdminDashboard
            onNavigate={navigate}
          />
        )}

        {navState.page === 'categories' && (
          <CategoriesPage
            onNavigate={navigate}
          />
        )}

        {navState.page === 'about' && (
          <AboutPage
            onNavigate={navigate}
          />
        )}
      </main>

      {/* Cart Drawer */}
      <CartDrawer onNavigate={navigate} />

      {/* Live Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectProduct={handleSelectProduct}
        onNavigateToShop={(query) => navigate('shop', { search: query })}
      />

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onViewFullDetails={handleSelectProduct}
      />

      {/* Global Luxury Footer */}
      <Footer onNavigate={navigate} />
    </div>
  );
};

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <AppContent />
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
