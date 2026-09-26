import React from 'react';
import { Trash2, ArrowRight, ArrowLeft, ShoppingBag, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/formatters';
import { ImageWithFallback } from '../components/ImageWithFallback';

interface CartPageProps {
  onNavigate: (page: string, params?: any) => void;
  onSelectProduct: (product: any) => void;
}

export const CartPage: React.FC<CartPageProps> = ({ onNavigate, onSelectProduct }) => {
  const {
    cart,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    shippingFee,
    total,
    amountNeededForFreeShipping,
    freeShippingThreshold,
  } = useCart();

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-24 text-center">
        <div className="w-20 h-20 rounded-full bg-[#E8DED0]/60 mx-auto flex items-center justify-center text-[#2C2520] mb-6">
          <ShoppingBag className="w-8 h-8 stroke-1" />
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl text-[#2C2520] mb-3">
          Your Shopping Bag is Empty
        </h1>
        <p className="text-sm text-[#A99B8C] max-w-md mx-auto mb-8 font-light">
          Your curated selection is awaiting its first piece. Explore our intentional collections across interior objects, apparel, and lifestyle.
        </p>
        <button
          onClick={() => onNavigate('shop')}
          className="px-8 py-4 bg-[#2C2520] text-[#F8F5EF] hover:bg-[#3D342E] text-xs uppercase tracking-[0.2em] font-semibold transition-all inline-flex items-center gap-2"
        >
          <span>Explore The Catalogue</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  const progressPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      
      {/* Page Title */}
      <div className="border-b border-[#E8DED0] pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-[0.2em] font-medium text-[#A99B8C] block mb-2">
            Order Review
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#2C2520] font-normal">
            Shopping Bag
          </h1>
        </div>
        <button
          onClick={clearCart}
          className="text-xs uppercase tracking-wider text-[#A99B8C] hover:text-red-700 transition-colors"
        >
          Clear Entire Bag
        </button>
      </div>

      {/* Free shipping progress notification */}
      <div className="bg-[#E8DED0]/40 p-4 border border-[#E8DED0] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="text-xs text-[#2C2520]">
          <span className="font-medium uppercase tracking-wider block sm:inline mr-2">
            White-Glove Delivery:
          </span>
          <span>
            {amountNeededForFreeShipping > 0
              ? `Add ${formatCurrency(amountNeededForFreeShipping)} more to receive complimentary courier dispatch.`
              : 'Your order qualifies for complimentary white-glove dispatch.'}
          </span>
        </div>
        <div className="w-full sm:w-48 bg-[#E8DED0] h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-[#2C2520] h-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* Items Table */}
        <div className="lg:col-span-8 space-y-6">
          <div className="hidden sm:grid grid-cols-12 text-xs uppercase tracking-widest text-[#A99B8C] pb-3 border-b border-[#E8DED0]">
            <div className="col-span-6">Item</div>
            <div className="col-span-2 text-center">Quantity</div>
            <div className="col-span-2 text-right">Price</div>
            <div className="col-span-2 text-right">Total</div>
          </div>

          {cart.map((item) => (
            <div
              key={item.product.id}
              className="flex flex-col sm:grid sm:grid-cols-12 gap-4 py-6 border-b border-[#E8DED0]/70 items-center"
            >
              {/* Product preview */}
              <div className="w-full sm:col-span-6 flex gap-4 items-center">
                <div
                  onClick={() => onSelectProduct(item.product)}
                  className="w-20 h-24 sm:w-24 sm:h-28 shrink-0 bg-[#E8DED0] overflow-hidden rounded-xs cursor-pointer border border-[#E8DED0]"
                >
                  <ImageWithFallback
                    src={item.product.images[0]}
                    alt={item.product.name}
                    category={item.product.category}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <span className="text-[10px] uppercase tracking-wider text-[#A99B8C]">
                    {item.product.category}
                  </span>
                  <h3
                    onClick={() => onSelectProduct(item.product)}
                    className="font-serif text-base text-[#2C2520] hover:text-[#A99B8C] cursor-pointer transition-colors"
                  >
                    {item.product.name}
                  </h3>
                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="mt-2 text-xs text-[#A99B8C] hover:text-red-700 flex items-center gap-1 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Remove</span>
                  </button>
                </div>
              </div>

              {/* Quantity Stepper */}
              <div className="w-full sm:col-span-2 flex justify-between sm:justify-center items-center">
                <span className="sm:hidden text-xs text-[#A99B8C] uppercase tracking-wider">
                  Quantity:
                </span>
                <div className="flex items-center border border-[#E8DED0] bg-[#F8F5EF]">
                  <button
                    onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                    className="w-7 h-7 flex items-center justify-center text-xs text-[#2C2520] hover:bg-[#E8DED0]"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-xs font-mono font-medium">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                    disabled={item.quantity >= item.product.stock}
                    className="w-7 h-7 flex items-center justify-center text-xs text-[#2C2520] hover:bg-[#E8DED0] disabled:opacity-30"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Unit Price */}
              <div className="w-full sm:col-span-2 flex justify-between sm:justify-end items-center font-mono text-xs text-[#A99B8C]">
                <span className="sm:hidden uppercase tracking-wider">Unit:</span>
                <span>{formatCurrency(item.product.price)}</span>
              </div>

              {/* Line Total */}
              <div className="w-full sm:col-span-2 flex justify-between sm:justify-end items-center font-mono text-sm font-semibold text-[#2C2520]">
                <span className="sm:hidden uppercase tracking-wider text-xs font-normal text-[#A99B8C]">
                  Total:
                </span>
                <span>{formatCurrency(item.product.price * item.quantity)}</span>
              </div>
            </div>
          ))}

          {/* Continue Shopping button */}
          <div className="pt-4">
            <button
              onClick={() => onNavigate('shop')}
              className="text-xs uppercase tracking-widest text-[#2C2520] hover:text-[#A99B8C] inline-flex items-center gap-2 font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Continue Browsing Catalogue</span>
            </button>
          </div>
        </div>

        {/* Sticky Order Summary */}
        <div className="lg:col-span-4 bg-[#E8DED0]/30 p-6 sm:p-8 border border-[#E8DED0] rounded-xs space-y-6 sticky top-28">
          <h2 className="font-serif text-xl text-[#2C2520]">Order Summary</h2>

          <div className="space-y-3 text-xs text-[#2C2520]">
            <div className="flex justify-between">
              <span className="text-[#A99B8C] uppercase tracking-wider">Subtotal</span>
              <span className="font-mono font-medium">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#A99B8C] uppercase tracking-wider">Estimated Shipping</span>
              <span className="font-mono font-medium">
                {shippingFee === 0 ? 'Complimentary' : formatCurrency(shippingFee)}
              </span>
            </div>
            <div className="flex justify-between text-[#A99B8C]">
              <span className="uppercase tracking-wider">Estimated Tax</span>
              <span>Included</span>
            </div>
            <div className="pt-4 border-t border-[#E8DED0] flex justify-between text-base font-medium">
              <span className="uppercase tracking-wider">Final Total</span>
              <span className="font-mono text-lg font-semibold text-[#2C2520]">
                {formatCurrency(total)}
              </span>
            </div>
          </div>

          <button
            onClick={() => onNavigate('checkout')}
            className="w-full py-4 bg-[#2C2520] hover:bg-[#3D342E] text-[#F8F5EF] text-xs uppercase tracking-[0.2em] font-semibold transition-all flex items-center justify-center gap-2 shadow-lg"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="pt-4 border-t border-[#E8DED0] space-y-2 text-[11px] text-[#A99B8C]">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-[#2C2520] shrink-0" />
              <span>Certified authentic atelier craft</span>
            </div>
            <p>14-day hassle-free return guarantee with insured courier collection.</p>
          </div>
        </div>

      </div>

    </div>
  );
};
