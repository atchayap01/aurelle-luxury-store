import React, { useState, useEffect } from 'react';
import { Search, Heart, ShoppingBag, User as UserIcon, Menu, X, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

interface NavbarProps {
  onNavigate: (page: string, params?: any) => void;
  currentPage: string;
  onOpenSearch: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate, currentPage, onOpenSearch }) => {
  const { user, isAdmin, logout } = useAuth();
  const { totalItemsCount, openCart } = useCart();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'shop', label: 'Shop' },
    { id: 'categories', label: 'Categories' },
    { id: 'about', label: 'About' },
    ...(isAdmin ? [{ id: 'admin', label: 'Curator Studio', isSpecial: true }] : [])
  ];

  const handleNavClick = (pageId: string, params?: any) => {
    onNavigate(pageId, params);
    setIsMobileMenuOpen(false);
    setIsAccountMenuOpen(false);
  };

  return (
    <>
      {/* Editorial Announcement Banner */}
      <div className="bg-[#2C2520] text-[#E8DED0] text-[11px] tracking-widest uppercase py-2 px-4 text-center border-b border-[#D6C2A5]/10 font-medium">
        <span>Complimentary white-glove delivery on orders over ₹3,000 · Handcrafted luxury</span>
      </div>

      {/* Main Top Bar Contract */}
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-[#F8F5EF]/95 backdrop-blur-md shadow-xs border-b border-[#E8DED0]'
            : 'bg-[#F8F5EF] border-b border-[#E8DED0]/60'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 -ml-2 text-[#2C2520] hover:text-[#A99B8C] transition-colors"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleNavClick('home')}
              className="font-serif text-2xl sm:text-3xl tracking-[0.2em] uppercase font-light text-[#2C2520] hover:opacity-90 transition-opacity whitespace-nowrap"
            >
              Aurelle
            </button>
          </div>

          {/* Zone 2: 4–6 clean text navigation links */}
          <nav className="hidden lg:flex items-center gap-9 text-[13px] tracking-[0.14em] uppercase font-medium text-[#2C2520]">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`relative py-1 transition-colors hover:text-[#A99B8C] ${
                  currentPage === link.id ? 'text-[#2C2520] font-semibold' : 'text-[#2C2520]/80'
                } ${link.isSpecial ? 'flex items-center gap-1.5 text-[#2C2520]' : ''}`}
              >
                {link.isSpecial && <ShieldCheck className="w-3.5 h-3.5 text-[#A99B8C]" />}
                {link.label}
                {currentPage === link.id && (
                  <span className="absolute bottom-0 left-0 w-full h-[1.5px] bg-[#2C2520]" />
                )}
              </button>
            ))}
          </nav>

          {/* Zone 3: 1–2 primary action clusters */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Search Trigger */}
            <button
              onClick={onOpenSearch}
              className="p-2 text-[#2C2520] hover:text-[#A99B8C] transition-colors"
              aria-label="Search collection"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Wishlist */}
            <button
              onClick={() => handleNavClick(user ? 'account' : 'auth', { tab: 'wishlist' })}
              className="relative p-2 text-[#2C2520] hover:text-[#A99B8C] transition-colors"
              aria-label="View curated wishlist"
            >
              <Heart className="w-5 h-5" />
              {user?.wishlist && user.wishlist.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-[#2C2520] text-[#F8F5EF] text-[9px] font-mono rounded-full flex items-center justify-center">
                  {user.wishlist.length}
                </span>
              )}
            </button>

            {/* Shopping Bag Trigger */}
            <button
              onClick={openCart}
              className="relative p-2 text-[#2C2520] hover:text-[#A99B8C] transition-colors"
              aria-label="View shopping bag"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItemsCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-[#2C2520] text-[#F8F5EF] text-[9px] font-mono rounded-full flex items-center justify-center">
                  {totalItemsCount}
                </span>
              )}
            </button>

            {/* Account dropdown / trigger */}
            <div className="relative">
              {user ? (
                <button
                  onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                  className="flex items-center gap-1.5 p-1.5 text-[#2C2520] hover:text-[#A99B8C] transition-colors rounded-full"
                  aria-label="Account options"
                >
                  <div className="w-8 h-8 rounded-full bg-[#E8DED0] border border-[#D6C2A5]/60 flex items-center justify-center text-xs font-serif italic text-[#2C2520]">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                </button>
              ) : (
                <button
                  onClick={() => handleNavClick('auth')}
                  className="p-2 text-[#2C2520] hover:text-[#A99B8C] transition-colors"
                  aria-label="Sign in"
                >
                  <UserIcon className="w-5 h-5" />
                </button>
              )}

              {/* Account Dropdown Menu */}
              {isAccountMenuOpen && user && (
                <div className="absolute right-0 mt-3 w-56 bg-[#F8F5EF] border border-[#E8DED0] shadow-lg py-2 z-50 animate-fade-in">
                  <div className="px-4 py-2 border-b border-[#E8DED0]">
                    <p className="text-xs text-[#A99B8C] uppercase tracking-wider">Signed in as</p>
                    <p className="text-sm font-medium text-[#2C2520] truncate">{user.name}</p>
                    <p className="text-xs text-[#A99B8C] truncate font-mono">{user.email}</p>
                  </div>

                  <button
                    onClick={() => handleNavClick('account', { tab: 'profile' })}
                    className="w-full text-left px-4 py-2 text-xs tracking-wider uppercase text-[#2C2520] hover:bg-[#E8DED0]/50 transition-colors"
                  >
                    My Profile
                  </button>

                  <button
                    onClick={() => handleNavClick('account', { tab: 'orders' })}
                    className="w-full text-left px-4 py-2 text-xs tracking-wider uppercase text-[#2C2520] hover:bg-[#E8DED0]/50 transition-colors"
                  >
                    Order History
                  </button>

                  <button
                    onClick={() => handleNavClick('account', { tab: 'wishlist' })}
                    className="w-full text-left px-4 py-2 text-xs tracking-wider uppercase text-[#2C2520] hover:bg-[#E8DED0]/50 transition-colors"
                  >
                    Curated Wishlist
                  </button>

                  <button
                    onClick={() => handleNavClick('account', { tab: 'addresses' })}
                    className="w-full text-left px-4 py-2 text-xs tracking-wider uppercase text-[#2C2520] hover:bg-[#E8DED0]/50 transition-colors"
                  >
                    Delivery Addresses
                  </button>

                  {isAdmin && (
                    <button
                      onClick={() => handleNavClick('admin')}
                      className="w-full text-left px-4 py-2 text-xs tracking-wider uppercase font-semibold text-[#2C2520] bg-[#E8DED0]/30 hover:bg-[#E8DED0] transition-colors border-t border-[#E8DED0]"
                    >
                      Curator Studio (Admin)
                    </button>
                  )}

                  <div className="border-t border-[#E8DED0] my-1" />

                  <button
                    onClick={() => {
                      logout();
                      setIsAccountMenuOpen(false);
                      onNavigate('home');
                    }}
                    className="w-full text-left px-4 py-2 text-xs tracking-wider uppercase text-[#2C2520]/70 hover:text-red-700 hover:bg-red-50/50 transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>

          </div>

        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-[#2C2520]/40 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          <div className="relative w-4/5 max-w-sm bg-[#F8F5EF] h-full shadow-2xl flex flex-col p-6 z-10 border-r border-[#E8DED0]">
            <div className="flex items-center justify-between pb-6 border-b border-[#E8DED0]">
              <span className="font-serif text-xl tracking-[0.2em] uppercase font-light text-[#2C2520]">
                Aurelle
              </span>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 text-[#2C2520] hover:text-[#A99B8C]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col gap-4 py-8">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`text-left text-sm tracking-[0.16em] uppercase py-2 transition-colors ${
                    currentPage === link.id
                      ? 'text-[#2C2520] font-semibold pl-2 border-l-2 border-[#2C2520]'
                      : 'text-[#2C2520]/70 hover:text-[#2C2520]'
                  }`}
                >
                  {link.label}
                </button>
              ))}
            </div>

            <div className="mt-auto pt-6 border-t border-[#E8DED0] flex flex-col gap-3">
              {user ? (
                <>
                  <div className="text-xs text-[#2C2520]">
                    <p className="font-medium">{user.name}</p>
                    <p className="text-[#A99B8C] font-mono">{user.email}</p>
                  </div>
                  <button
                    onClick={() => handleNavClick('account')}
                    className="w-full text-center py-2.5 text-xs uppercase tracking-widest bg-[#2C2520] text-[#F8F5EF]"
                  >
                    View Account
                  </button>
                  <button
                    onClick={() => {
                      logout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-center py-2 text-xs uppercase tracking-widest text-[#2C2520]/60 hover:text-red-700"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <button
                  onClick={() => handleNavClick('auth')}
                  className="w-full text-center py-3 text-xs uppercase tracking-widest bg-[#2C2520] text-[#F8F5EF]"
                >
                  Sign In / Register
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
