import React, { useState } from 'react';
import { ArrowRight, Lock, Mail, User, Phone, Check, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ImageWithFallback } from '../components/ImageWithFallback';

interface AuthPageProps {
  initialTab?: 'login' | 'register';
  onNavigate: (page: string, params?: any) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  initialTab = 'login',
  onNavigate,
}) => {
  const [tab, setTab] = useState<'login' | 'register'>(initialTab);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  const { login, register } = useAuth();

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const ok = await login(email, password, rememberMe);
    setIsSubmitting(false);
    if (ok) {
      onNavigate('account');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const ok = await register(name, email, password, confirmPassword, phone);
    setIsSubmitting(false);
    if (ok) {
      onNavigate('account');
    }
  };

  // Demo Login Quick Fills
  const fillAdmin = () => {
    setTab('login');
    setEmail('admin@aurelle.com');
    setPassword('AdminAurelle123!');
  };

  const fillCustomer = () => {
    setTab('login');
    setEmail('customer@aurelle.com');
    setPassword('Customer123!');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      <div className="grid grid-cols-1 lg:grid-cols-12 overflow-hidden border border-[#E8DED0] bg-[#F8F5EF] shadow-xl">
        
        {/* Left Column: Visual Brand Mood */}
        <div className="lg:col-span-5 relative hidden lg:flex flex-col justify-between p-10 bg-[#2C2520] text-[#F8F5EF]">
          <div className="absolute inset-0 z-0 opacity-40">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1000&q=80"
              alt="Aurelle Atelier Interior"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#2C2520] via-[#2C2520]/70 to-[#2C2520]/40 z-0" />

          <div className="relative z-10">
            <span className="font-serif text-2xl tracking-[0.2em] uppercase font-light text-white block">
              Aurelle
            </span>
            <p className="font-serif italic text-sm text-[#D6C2A5] mt-1">
              Curated for the art of living.
            </p>
          </div>

          <div className="relative z-10 space-y-4">
            <h3 className="font-serif text-2xl text-white font-light leading-snug">
              Welcome to our private client circle.
            </h3>
            <p className="text-xs text-[#E8DED0]/80 leading-relaxed font-light">
              Access your personal archival selections, tracked consignments, bespoke address books, and curator privileges.
            </p>

          
          </div>
        </div>

        {/* Right Column: Authentication Form */}
        <div className="lg:col-span-7 p-6 sm:p-12 flex flex-col justify-center">
          
          {/* Tabs */}
          <div className="flex border-b border-[#E8DED0] mb-8">
            <button
              onClick={() => setTab('login')}
              className={`pb-3 text-xs uppercase tracking-[0.18em] font-medium transition-colors relative flex-1 text-center ${
                tab === 'login' ? 'text-[#2C2520] font-semibold' : 'text-[#A99B8C]'
              }`}
            >
              Sign In
              {tab === 'login' && (
                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#2C2520]" />
              )}
            </button>

            <button
              onClick={() => setTab('register')}
              className={`pb-3 text-xs uppercase tracking-[0.18em] font-medium transition-colors relative flex-1 text-center ${
                tab === 'register' ? 'text-[#2C2520] font-semibold' : 'text-[#A99B8C]'
              }`}
            >
              Create Account
              {tab === 'register' && (
                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#2C2520]" />
              )}
            </button>
          </div>

          {/* LOGIN FORM */}
          {tab === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-5 animate-fade-in">
              <div>
                <label className="text-xs uppercase tracking-wider text-[#2C2520] font-medium block mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#A99B8C] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="yourname@domain.com"
                    required
                    className="w-full bg-[#F8F5EF] border border-[#E8DED0] pl-10 pr-4 py-3 text-sm text-[#2C2520] placeholder-[#A99B8C] focus:outline-none focus:border-[#2C2520]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs uppercase tracking-wider text-[#2C2520] font-medium block mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#A99B8C] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full bg-[#F8F5EF] border border-[#E8DED0] pl-10 pr-4 py-3 text-sm text-[#2C2520] placeholder-[#A99B8C] focus:outline-none focus:border-[#2C2520]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 cursor-pointer text-[#2C2520]">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="accent-[#2C2520] w-3.5 h-3.5"
                  />
                  <span>Remember my session</span>
                </label>
                <button
                  type="button"
                  onClick={() => alert('For password resets, contact concierge@aurelle.com or use the demo credentials.')}
                  className="text-[#A99B8C] hover:text-[#2C2520] underline"
                >
                  Forgot credentials?
                </button>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-[#2C2520] hover:bg-[#3D342E] text-[#F8F5EF] text-xs uppercase tracking-[0.2em] font-semibold transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-50 mt-4"
              >
                <span>{isSubmitting ? 'Verifying...' : 'Sign In'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Mobile Demo Access Buttons */}
              <div className="lg:hidden pt-4 border-t border-[#E8DED0] space-y-2">
                <span className="text-[10px] uppercase tracking-widest text-[#A99B8C] font-semibold block text-center">
                  Quick Demo Sign-In:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={fillAdmin}
                    className="px-2 py-2 border border-[#E8DED0] bg-[#E8DED0]/30 text-[11px] text-[#2C2520] hover:bg-[#E8DED0]"
                  >
                    Curator / Admin
                  </button>
                  <button
                    type="button"
                    onClick={fillCustomer}
                    className="px-2 py-2 border border-[#E8DED0] bg-[#E8DED0]/30 text-[11px] text-[#2C2520] hover:bg-[#E8DED0]"
                  >
                    Collector Demo
                  </button>
                </div>
              </div>
            </form>
          ) : (
            /* REGISTER FORM */
            <form onSubmit={handleRegisterSubmit} className="space-y-4 animate-fade-in">
              <div>
                <label className="text-xs uppercase tracking-wider text-[#2C2520] font-medium block mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#A99B8C] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Lady Eleanor Vance"
                    required
                    className="w-full bg-[#F8F5EF] border border-[#E8DED0] pl-10 pr-4 py-2.5 text-sm text-[#2C2520] placeholder-[#A99B8C] focus:outline-none focus:border-[#2C2520]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs uppercase tracking-wider text-[#2C2520] font-medium block mb-1">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#A99B8C] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="eleanor@domain.com"
                      required
                      className="w-full bg-[#F8F5EF] border border-[#E8DED0] pl-10 pr-4 py-2.5 text-sm text-[#2C2520] placeholder-[#A99B8C] focus:outline-none focus:border-[#2C2520]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs uppercase tracking-wider text-[#2C2520] font-medium block mb-1">
                    Contact Phone
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-[#A99B8C] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full bg-[#F8F5EF] border border-[#E8DED0] pl-10 pr-4 py-2.5 text-sm text-[#2C2520] placeholder-[#A99B8C] focus:outline-none focus:border-[#2C2520]"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs uppercase tracking-wider text-[#2C2520] font-medium block mb-1">
                    Password *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#A99B8C] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      required
                      minLength={6}
                      className="w-full bg-[#F8F5EF] border border-[#E8DED0] pl-10 pr-4 py-2.5 text-sm text-[#2C2520] placeholder-[#A99B8C] focus:outline-none focus:border-[#2C2520]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs uppercase tracking-wider text-[#2C2520] font-medium block mb-1">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#A99B8C] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat password"
                      required
                      className="w-full bg-[#F8F5EF] border border-[#E8DED0] pl-10 pr-4 py-2.5 text-sm text-[#2C2520] placeholder-[#A99B8C] focus:outline-none focus:border-[#2C2520]"
                    />
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-[#A99B8C] pt-2">
                By creating an account, you consent to our Terms of Service and white-glove privacy commitments.
              </p>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-[#2C2520] hover:bg-[#3D342E] text-[#F8F5EF] text-xs uppercase tracking-[0.2em] font-semibold transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-50 mt-4"
              >
                <span>{isSubmitting ? 'Creating Profile...' : 'Complete Registration'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

        </div>

      </div>
    </div>
  );
};
