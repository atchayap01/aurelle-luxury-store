import React, { useState } from 'react';
import { ArrowRight, Check, Download } from 'lucide-react';
import { useToast } from '../context/ToastContext';

interface FooterProps {
  onNavigate: (page: string, params?: any) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const { success, error } = useToast();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      error('Invalid Email', 'Please enter a valid email address.');
      return;
    }
    setSubscribed(true);
    success('Subscribed to Aurelle Gazettes', 'You will receive our private seasonal dispatches.');
    setEmail('');
  };

  return (
    <footer className="bg-[#2C2520] text-[#E8DED0] pt-20 pb-12 border-t border-[#D6C2A5]/10 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Newsletter & Brand Essence row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-16 border-b border-[#D6C2A5]/15">
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div>
              <span className="font-serif text-3xl sm:text-4xl tracking-[0.2em] uppercase font-light text-white block">
                Aurelle
              </span>
              <p className="font-serif italic text-lg text-[#D6C2A5] mt-2">
                Curated for the art of living.
              </p>
              <p className="text-sm text-[#A99B8C] mt-4 leading-relaxed max-w-md">
                Thoughtfully selected pieces that bring beauty, character, and timeless elegance into everyday life. Crafted in harmony with honest materials and master artisans.
              </p>
            </div>
          </div>

          <div className="lg:col-span-7 flex flex-col justify-center">
            <div className="max-w-lg lg:ml-auto w-full">
              <span className="text-xs uppercase tracking-[0.2em] font-medium text-[#D6C2A5] block mb-2">
                The Aurelle Dispatches
              </span>
              <h3 className="font-serif text-2xl text-white mb-3">
                Invitations to private previews and editorial notes.
              </h3>
              <p className="text-xs text-[#A99B8C] mb-5">
                Join our circle for seasonal launches, design stories, and exclusive archival offerings.
              </p>

              {subscribed ? (
                <div className="flex items-center gap-2 p-3.5 bg-[#D6C2A5]/10 border border-[#D6C2A5]/30 text-white text-xs tracking-wider">
                  <Check className="w-4 h-4 text-[#D6C2A5]" />
                  <span>Thank you. Your invitation has been confirmed.</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="flex-1 bg-[#F8F5EF]/5 border border-[#D6C2A5]/30 px-4 py-3 text-sm text-white placeholder-[#A99B8C] focus:outline-none focus:border-[#D6C2A5] transition-colors"
                  />
                  <button
                    type="submit"
                    className="bg-[#D6C2A5] hover:bg-[#E8DED0] text-[#2C2520] px-6 py-3 text-xs uppercase tracking-[0.16em] font-semibold transition-colors flex items-center gap-2 whitespace-nowrap"
                  >
                    <span>Subscribe</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Links Navigation Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-16 border-b border-[#D6C2A5]/15 text-xs">
          {/* Column 1: Shop */}
          <div>
            <h4 className="text-[#D6C2A5] uppercase tracking-[0.2em] font-medium mb-4">Shop</h4>
            <ul className="space-y-3 text-[#A99B8C]">
              <li>
                <button
                  onClick={() => onNavigate('shop', { filter: 'newest' })}
                  className="hover:text-white transition-colors"
                >
                  New Arrivals
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('shop', { filter: 'bestseller' })}
                  className="hover:text-white transition-colors"
                >
                  Best Sellers
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('categories')}
                  className="hover:text-white transition-colors"
                >
                  All Collections
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('shop', { category: 'Home' })}
                  className="hover:text-white transition-colors"
                >
                  Home & Living
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('shop', { category: 'Fashion' })}
                  className="hover:text-white transition-colors"
                >
                  Fashion Atelier
                </button>
              </li>
            </ul>
          </div>

          {/* Column 2: Customer Care */}
          <div>
            <h4 className="text-[#D6C2A5] uppercase tracking-[0.2em] font-medium mb-4">Customer Care</h4>
            <ul className="space-y-3 text-[#A99B8C]">
              <li>
                <button
                  onClick={() => onNavigate('about')}
                  className="hover:text-white transition-colors"
                >
                  Contact Concierge
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('about')}
                  className="hover:text-white transition-colors"
                >
                  White-Glove Shipping
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('about')}
                  className="hover:text-white transition-colors"
                >
                  14-Day Returns & Care
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('track')}
                  className="hover:text-white transition-colors"
                >
                  Track Your Consignment
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('about')}
                  className="hover:text-white transition-colors"
                >
                  Frequently Asked Questions
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Atelier & Company */}
          <div>
            <h4 className="text-[#D6C2A5] uppercase tracking-[0.2em] font-medium mb-4">Company</h4>
            <ul className="space-y-3 text-[#A99B8C]">
              <li>
                <button
                  onClick={() => onNavigate('about')}
                  className="hover:text-white transition-colors"
                >
                  Our Philosophy
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('about')}
                  className="hover:text-white transition-colors"
                >
                  Master Artisans
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('about')}
                  className="hover:text-white transition-colors"
                >
                  Sustainability & Provenance
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('about')}
                  className="hover:text-white transition-colors"
                >
                  Press & Exhibitions
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Studio Location */}
          <div>
            <h4 className="text-[#D6C2A5] uppercase tracking-[0.2em] font-medium mb-4">Flagship Atelier</h4>
            <address className="not-italic text-[#A99B8C] leading-relaxed space-y-2">
              <p className="text-white">Aurelle Studio & Salon</p>
              <p>14/B Heritage Promenade, Colaba</p>
              <p>Mumbai, Maharashtra 400001</p>
              <p className="pt-2 text-white font-mono text-[11px]">atelier@aurelle.com</p>
              <p className="text-white font-mono text-[11px]">+91 98765 43210</p>
            </address>
          </div>
        </div>

        {/* Bottom Copyright & Terms */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#A99B8C] gap-4">
          <p>© {new Date().getFullYear()} Aurelle Luxury Lifestyle Ltd. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-6">
            <button onClick={() => onNavigate('about')} className="hover:text-white transition-colors">
              Privacy Policy
            </button>
            <span>·</span>
            <button onClick={() => onNavigate('about')} className="hover:text-white transition-colors">
              Terms of Service
            </button>
            <span>·</span>
            <button onClick={() => onNavigate('about')} className="hover:text-white transition-colors">
              Accessibility
            </button>
            <span>·</span>
            <a
              href="/api/download-zip"
              download="aurelle-luxury-store.zip"
              className="inline-flex items-center gap-1.5 text-[#D6C2A5] hover:text-white transition-colors font-medium border border-[#D6C2A5]/30 px-2.5 py-1 rounded bg-[#D6C2A5]/10"
              title="Download full project code as a ZIP archive for GitHub / Render / Vercel"
            >
              <Download className="w-3 h-3 text-[#D6C2A5]" />
              <span>Download Project Code (.zip)</span>
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
};
