import React from 'react';
import { Heart, ShoppingBag, Eye } from 'lucide-react';
import { Product } from '../types';
import { formatCurrency } from '../utils/formatters';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ImageWithFallback } from './ImageWithFallback';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
  onQuickView?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect, onQuickView }) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useAuth();

  const isFavorited = isInWishlist(product.id);
  const isOutOfStock = product.stock <= 0;

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isOutOfStock) {
      addToCart(product, 1);
    }
  };

  return (
    <div
      onClick={() => onSelect(product)}
      className="group flex flex-col cursor-pointer transition-transform duration-300 ease-out hover:-translate-y-1"
    >
      {/* Product Image Slot */}
      <div className="relative aspect-[4/5] bg-[#E8DED0]/40 overflow-hidden rounded-xs border border-[#E8DED0]">
        <ImageWithFallback
          src={product.images[0]}
          alt={product.name}
          category={product.category}
          fallbackTitle={product.name}
          className="transition-transform duration-700 ease-out group-hover:scale-105"
        />

        {/* Quiet Top Badges - Unboxed or Subtle */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 items-start">
          {product.discount && (
            <span className="bg-[#2C2520] text-[#F8F5EF] text-[10px] tracking-widest uppercase font-medium px-2 py-0.5">
              -{product.discount}%
            </span>
          )}
          {product.bestseller && !product.discount && (
            <span className="bg-[#D6C2A5] text-[#2C2520] text-[10px] tracking-widest uppercase font-medium px-2 py-0.5">
              Bestseller
            </span>
          )}
          {isOutOfStock && (
            <span className="bg-red-800 text-white text-[10px] tracking-widest uppercase font-medium px-2 py-0.5">
              Sold Out
            </span>
          )}
        </div>

        {/* Wishlist Heart Button */}
        <button
          onClick={handleWishlistClick}
          aria-label={isFavorited ? 'Remove from wishlist' : 'Add to wishlist'}
          className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-200 ${
            isFavorited
              ? 'bg-[#2C2520] text-[#D6C2A5] shadow-md'
              : 'bg-[#F8F5EF]/85 text-[#2C2520] hover:bg-[#2C2520] hover:text-[#F8F5EF] opacity-90 sm:opacity-0 group-hover:opacity-100 shadow-xs'
          }`}
        >
          <Heart className={`w-3.5 h-3.5 ${isFavorited ? 'fill-current' : ''}`} />
        </button>

        {/* Bottom Quick-Add Hover Overlay Bar */}
        <div className="absolute inset-x-3 bottom-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`flex-1 py-2.5 px-3 text-[11px] uppercase tracking-[0.16em] font-medium transition-all shadow-md flex items-center justify-center gap-1.5 ${
              isOutOfStock
                ? 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
                : 'bg-[#2C2520] text-[#F8F5EF] hover:bg-[#3D342E]'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>{isOutOfStock ? 'Sold Out' : 'Add to Bag'}</span>
          </button>

          {onQuickView && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onQuickView(product);
              }}
              aria-label="Quick View"
              className="p-2.5 bg-[#F8F5EF] text-[#2C2520] hover:bg-[#E8DED0] transition-colors shadow-md"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Product Metadata & Details */}
      <div className="pt-4 flex flex-col flex-1">
        {/* Unboxed Metadata with · separator */}
        <div className="flex items-center gap-2 text-[11px] tracking-widest uppercase text-[#A99B8C] font-medium mb-1">
          <span>{product.category}</span>
          <span aria-hidden="true">·</span>
          <span>{isOutOfStock ? 'Waitlist' : `${product.stock} available`}</span>
        </div>

        {/* Product Title */}
        <h3 className="font-serif text-base text-[#2C2520] font-normal leading-snug line-clamp-1 group-hover:text-[#A99B8C] transition-colors">
          {product.name}
        </h3>

        {/* Price Row with Tabular Numerals */}
        <div className="mt-2 flex items-baseline gap-2.5 font-mono text-sm">
          <span className="font-semibold text-[#2C2520]">
            {formatCurrency(product.price)}
          </span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-xs text-[#A99B8C] line-through">
              {formatCurrency(product.originalPrice)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
