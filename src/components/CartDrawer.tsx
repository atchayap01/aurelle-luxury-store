import React from 'react';
import { X, Trash2, ArrowRight, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/formatters';
import { ImageWithFallback } from './ImageWithFallback';

interface CartDrawerProps {
  onNavigate: (page: string, params?: any) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onNavigate }) => {
  const {
    cart,
    isCartOpen,
    closeCart,
    updateQuantity,
    removeFromCart,
    subtotal,
    shippingFee,
    total,
    amountNeededForFreeShipping,
    freeShippingThreshold
  } = useCart();

  if (!isCartOpen) return null;

  const progressPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  const handleCheckoutClick = () => {
    closeCart();
    onNavigate('checkout');
  };

  const handleViewBagClick = () => {
    closeCart();
    onNavigate('cart');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#2C2520]/50 backdrop-blur-xs transition-opacity duration-300"
        onClick={closeCart}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#F8F5EF] shadow-2xl flex flex-col border-l border-[#E8DED0]">
          
          {/* Header */}
          <div className="p-6 border-b border-[#E8DED0] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-serif text-xl tracking-[0.1em] uppercase font-light text-[#2C2520]">
                Shopping Bag
              </span>
              <span className="text-xs font-mono text-[#A99B8C]">
                ({cart.reduce((c, i) => c + i.quantity, 0)})
              </span>
            </div>
            <button
              onClick={closeCart}
              className="p-2 text-[#2C2520] hover:text-[#A99B8C] transition-colors"
              aria-label="Close cart drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Indicator */}
          <div className="bg-[#E8DED0]/50 px-6 py-3 border-b border-[#E8DED0]">
            <div className="flex justify-between text-[11px] uppercase tracking-wider font-medium text-[#2C2520] mb-1.5">
              <span>
                {amountNeededForFreeShipping > 0
                  ? `Add ${formatCurrency(amountNeededForFreeShipping)} for complimentary shipping`
                  : 'Eligible for complimentary white-glove shipping'}
              </span>
              <span className="font-mono">{progressPercent}%</span>
            </div>
            <div className="w-full bg-[#E8DED0] h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-[#2C2520] h-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-16">
                <div className="w-16 h-16 rounded-full bg-[#E8DED0]/60 flex items-center justify-center text-[#2C2520] mb-4">
                  <ShoppingBag className="w-7 h-7 stroke-1" />
                </div>
                <h4 className="font-serif text-xl text-[#2C2520] mb-2">Your bag is empty</h4>
                <p className="text-xs text-[#A99B8C] max-w-xs mb-6 leading-relaxed">
                  Discover our curated collection of timeless lifestyle pieces, crafted for the art of living.
                </p>
                <button
                  onClick={() => {
                    closeCart();
                    onNavigate('shop');
                  }}
                  className="px-6 py-3 bg-[#2C2520] text-[#F8F5EF] text-xs uppercase tracking-[0.16em] hover:bg-[#3D342E] transition-colors"
                >
                  Explore Collection
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.product.id} className="flex gap-4 pb-6 border-b border-[#E8DED0]/70">
                  {/* Thumbnail */}
                  <div className="w-20 h-24 shrink-0 bg-[#E8DED0] overflow-hidden rounded-xs border border-[#E8DED0]">
                    <ImageWithFallback
                      src={item.product.images[0]}
                      alt={item.product.name}
                      category={item.product.category}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <h5 className="font-serif text-sm font-medium text-[#2C2520] line-clamp-1">
                          {item.product.name}
                        </h5>
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-[#A99B8C] hover:text-red-700 p-1 transition-colors"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-[11px] uppercase tracking-wider text-[#A99B8C] mt-0.5">
                        {item.product.category}
                      </p>
                    </div>

                    <div className="flex justify-between items-center mt-3">
                      {/* Quantity Stepper */}
                      <div className="flex items-center border border-[#E8DED0] bg-[#F8F5EF]">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="w-7 h-7 flex items-center justify-center text-xs text-[#2C2520] hover:bg-[#E8DED0] transition-colors"
                        >
                          -
                        </button>
                        <span className="w-8 text-center text-xs font-mono font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          disabled={item.quantity >= item.product.stock}
                          className="w-7 h-7 flex items-center justify-center text-xs text-[#2C2520] hover:bg-[#E8DED0] transition-colors disabled:opacity-30"
                        >
                          +
                        </button>
                      </div>

                      {/* Total for item */}
                      <span className="font-mono text-sm font-medium text-[#2C2520]">
                        {formatCurrency(item.product.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Subtotal & Actions */}
          {cart.length > 0 && (
            <div className="p-6 border-t border-[#E8DED0] bg-[#F8F5EF]">
              <div className="space-y-2 mb-5 text-xs text-[#2C2520]">
                <div className="flex justify-between">
                  <span className="text-[#A99B8C] uppercase tracking-wider">Subtotal</span>
                  <span className="font-mono font-medium">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#A99B8C] uppercase tracking-wider">Shipping</span>
                  <span className="font-mono font-medium">
                    {shippingFee === 0 ? 'Complimentary' : formatCurrency(shippingFee)}
                  </span>
                </div>
                <div className="pt-2 border-t border-[#E8DED0] flex justify-between text-sm font-medium">
                  <span className="uppercase tracking-wider">Estimated Total</span>
                  <span className="font-mono text-base font-semibold">{formatCurrency(total)}</span>
                </div>
              </div>

              <div className="flex flex-col gap-2.5">
                <button
                  onClick={handleCheckoutClick}
                  className="w-full py-3.5 bg-[#2C2520] hover:bg-[#3D342E] text-[#F8F5EF] text-xs uppercase tracking-[0.16em] font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={handleViewBagClick}
                  className="w-full py-3 border border-[#2C2520] text-[#2C2520] hover:bg-[#E8DED0]/50 text-xs uppercase tracking-[0.16em] font-medium transition-colors"
                >
                  View Full Bag
                </button>
              </div>

              <p className="text-[10px] text-center text-[#A99B8C] mt-3 uppercase tracking-wider">
                Taxes included · 14-day return privilege
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
