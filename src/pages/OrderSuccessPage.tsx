import React from 'react';
import { Check, ArrowRight, PackageCheck, ShoppingBag } from 'lucide-react';

interface OrderSuccessPageProps {
  orderId?: string;
  onNavigate: (page: string, params?: any) => void;
}

export const OrderSuccessPage: React.FC<OrderSuccessPageProps> = ({
  orderId = 'AUR-78201',
  onNavigate,
}) => {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center">
      {/* Elegant Success Icon */}
      <div className="w-16 h-16 rounded-full bg-[#2C2520] text-[#D6C2A5] mx-auto flex items-center justify-center mb-6 shadow-xl">
        <Check className="w-8 h-8 stroke-2" />
      </div>

      <span className="text-xs uppercase tracking-[0.24em] font-medium text-[#A99B8C] block mb-2">
        Consignment Confirmed
      </span>

      <h1 className="font-serif text-3xl sm:text-5xl text-[#2C2520] font-normal mb-4">
        Thank You for Your Order
      </h1>

      <p className="text-sm text-[#A99B8C] max-w-md mx-auto mb-6 leading-relaxed font-light">
        Your acquisition has been received by our atelier. We are carefully inspecting and preparing each piece for climate-controlled transit.
      </p>

      {/* Order Reference Box */}
      <div className="max-w-md mx-auto bg-[#E8DED0]/40 border border-[#E8DED0] p-6 rounded-xs mb-10 text-left">
        <div className="flex justify-between items-center pb-3 border-b border-[#E8DED0]">
          <span className="text-xs uppercase tracking-wider text-[#A99B8C]">
            Order Reference
          </span>
          <span className="font-mono text-sm font-semibold text-[#2C2520]">
            {orderId}
          </span>
        </div>
        <p className="text-xs text-[#2C2520]/80 mt-3 leading-relaxed">
          A confirmation dispatch with authentication details has been sent to your registered email address.
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <button
          onClick={() => onNavigate('track', { orderId })}
          className="w-full sm:w-auto px-8 py-4 bg-[#2C2520] hover:bg-[#3D342E] text-[#F8F5EF] text-xs uppercase tracking-[0.18em] font-semibold transition-all flex items-center justify-center gap-2 shadow-md"
        >
          <PackageCheck className="w-4 h-4" />
          <span>Track Order Consignment</span>
        </button>

        <button
          onClick={() => onNavigate('shop')}
          className="w-full sm:w-auto px-8 py-4 border border-[#2C2520] text-[#2C2520] hover:bg-[#E8DED0]/50 text-xs uppercase tracking-[0.18em] font-medium transition-colors flex items-center justify-center gap-2"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Continue Browsing</span>
        </button>
      </div>
    </div>
  );
};
