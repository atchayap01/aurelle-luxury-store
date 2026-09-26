import React, { useState } from 'react';
import { X, Heart, ShoppingBag, ArrowRight } from 'lucide-react';
import { Product } from '../types';
import { formatCurrency } from '../utils/formatters';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ImageWithFallback } from './ImageWithFallback';

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
  onViewFullDetails: (product: Product) => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({
  product,
  onClose,
  onViewFullDetails,
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useAuth();

  if (!product) return null;

  const isFavorited = isInWishlist(product.id);
  const isOutOfStock = product.stock <= 0;

  const handleAddToCart = () => {
    if (!isOutOfStock) {
      addToCart(product, quantity);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#2C2520]/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-3xl bg-[#F8F5EF] shadow-2xl border border-[#E8DED0] overflow-hidden z-10 animate-fade-in my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 text-[#2C2520] hover:text-[#A99B8C] bg-[#F8F5EF]/80 rounded-full"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Gallery Column */}
          <div className="bg-[#E8DED0]/40 p-6 flex flex-col justify-between">
            <div className="aspect-[4/5] overflow-hidden rounded-xs border border-[#E8DED0]">
              <ImageWithFallback
                src={product.images[selectedImageIndex] || product.images[0]}
                alt={product.name}
                category={product.category}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Thumbnail switcher if multiple images */}
            {product.images.length > 1 && (
              <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`w-14 h-16 shrink-0 border overflow-hidden transition-all ${
                      selectedImageIndex === idx
                        ? 'border-[#2C2520] ring-1 ring-[#2C2520]'
                        : 'border-[#E8DED0] opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details Column */}
          <div className="p-6 sm:p-8 flex flex-col justify-between">
            <div>
              {/* Category & Status */}
              <div className="flex items-center gap-2 text-[11px] tracking-widest uppercase text-[#A99B8C] font-medium mb-1">
                <span>{product.category}</span>
                <span aria-hidden="true">·</span>
                <span className={isOutOfStock ? 'text-red-700' : 'text-[#2C2520]'}>
                  {isOutOfStock ? 'Currently Unavailable' : `${product.stock} in Stock`}
                </span>
              </div>

              {/* Title */}
              <h2 className="font-serif text-2xl text-[#2C2520] font-normal leading-snug mb-3">
                {product.name}
              </h2>

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-4 font-mono">
                <span className="text-xl font-semibold text-[#2C2520]">
                  {formatCurrency(product.price)}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-sm text-[#A99B8C] line-through">
                    {formatCurrency(product.originalPrice)}
                  </span>
                )}
                {product.discount && (
                  <span className="text-xs text-[#2C2520] bg-[#D6C2A5]/40 px-2 py-0.5">
                    Save {product.discount}%
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-xs text-[#2C2520]/80 leading-relaxed mb-6 line-clamp-3">
                {product.description}
              </p>

              {/* Specifications preview */}
              {product.specifications && Object.keys(product.specifications).length > 0 && (
                <div className="border-t border-[#E8DED0] py-3 text-xs space-y-1 mb-6">
                  {Object.entries(product.specifications).slice(0, 2).map(([k, v]) => (
                    <div key={k} className="flex justify-between text-[#A99B8C]">
                      <span className="font-medium text-[#2C2520]">{k}:</span>
                      <span>{v}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-[#E8DED0]">
              <div className="flex items-center gap-3 mb-4">
                {/* Quantity */}
                <div className="flex items-center border border-[#E8DED0] bg-[#F8F5EF]">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-9 flex items-center justify-center text-xs text-[#2C2520] hover:bg-[#E8DED0] transition-colors"
                  >
                    -
                  </button>
                  <span className="w-10 text-center text-xs font-mono font-medium">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    disabled={quantity >= product.stock}
                    className="w-8 h-9 flex items-center justify-center text-xs text-[#2C2520] hover:bg-[#E8DED0] transition-colors disabled:opacity-30"
                  >
                    +
                  </button>
                </div>

                {/* Add to Bag */}
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className={`flex-1 py-3 px-4 text-xs uppercase tracking-[0.16em] font-semibold flex items-center justify-center gap-2 transition-colors ${
                    isOutOfStock
                      ? 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
                      : 'bg-[#2C2520] hover:bg-[#3D342E] text-[#F8F5EF]'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{isOutOfStock ? 'Out of Stock' : 'Add to Bag'}</span>
                </button>

                {/* Wishlist */}
                <button
                  onClick={() => toggleWishlist(product.id)}
                  aria-label="Wishlist"
                  className={`p-3 border border-[#E8DED0] transition-colors ${
                    isFavorited
                      ? 'bg-[#2C2520] text-[#D6C2A5]'
                      : 'hover:bg-[#E8DED0] text-[#2C2520]'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
                </button>
              </div>

              {/* View Full Page link */}
              <button
                onClick={() => {
                  onClose();
                  onViewFullDetails(product);
                }}
                className="w-full text-center text-xs uppercase tracking-[0.14em] text-[#2C2520] hover:text-[#A99B8C] py-1 flex items-center justify-center gap-1.5 font-medium"
              >
                <span>View Full Specifications & Care</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
