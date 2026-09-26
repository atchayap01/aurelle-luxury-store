import React, { useState, useEffect } from 'react';
import { Heart, ShoppingBag, Truck, RotateCcw, ShieldCheck, ChevronRight, Check } from 'lucide-react';
import { Product } from '../types';
import { productsAPI } from '../services/api';
import { formatCurrency } from '../utils/formatters';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ProductCard } from '../components/ProductCard';
import { ImageWithFallback } from '../components/ImageWithFallback';

interface ProductDetailsPageProps {
  productId: string;
  onNavigate: (page: string, params?: any) => void;
  onSelectProduct: (product: Product) => void;
  onQuickView: (product: Product) => void;
}

export const ProductDetailsPage: React.FC<ProductDetailsPageProps> = ({
  productId,
  onNavigate,
  onSelectProduct,
  onQuickView,
}) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'specs' | 'shipping' | 'returns'>('specs');

  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useAuth();

  useEffect(() => {
    const loadDetails = async () => {
      setIsLoading(true);
      try {
        const data = await productsAPI.getProductById(productId);
        setProduct(data.product);
        setRelatedProducts(data.related || []);
        setSelectedImageIndex(0);
        setQuantity(1);
      } catch (err) {
        console.error('Error fetching product details:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadDetails();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [productId]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-pulse">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-7 aspect-[4/5] bg-[#E8DED0]/60 rounded-xs" />
          <div className="lg:col-span-5 space-y-6">
            <div className="h-4 bg-[#E8DED0]/60 w-1/4" />
            <div className="h-8 bg-[#E8DED0]/60 w-3/4" />
            <div className="h-6 bg-[#E8DED0]/60 w-1/3" />
            <div className="h-24 bg-[#E8DED0]/60 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <h2 className="font-serif text-3xl text-[#2C2520] mb-4">Piece Not Found</h2>
        <p className="text-xs text-[#A99B8C] mb-8">
          The requested archival piece may have been retired or moved.
        </p>
        <button
          onClick={() => onNavigate('shop')}
          className="px-8 py-3.5 bg-[#2C2520] text-[#F8F5EF] text-xs uppercase tracking-[0.16em]"
        >
          Return to Catalogue
        </button>
      </div>
    );
  }

  const isFavorited = isInWishlist(product.id);
  const isOutOfStock = product.stock <= 0;

  const handleAddToCart = () => {
    if (!isOutOfStock) {
      addToCart(product, quantity);
    }
  };

  const handleBuyNow = () => {
    if (!isOutOfStock) {
      addToCart(product, quantity);
      onNavigate('checkout');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-20">
      
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#A99B8C]">
        <button onClick={() => onNavigate('home')} className="hover:text-[#2C2520] transition-colors">
          Home
        </button>
        <ChevronRight className="w-3 h-3" />
        <button
          onClick={() => onNavigate('shop', { category: product.category })}
          className="hover:text-[#2C2520] transition-colors"
        >
          {product.category}
        </button>
        <ChevronRight className="w-3 h-3" />
        <span className="text-[#2C2520] truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main PDP Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
        
        {/* Left Column: Gallery */}
        <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-4">
          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-y-auto max-h-[600px] shrink-0 pb-2 sm:pb-0 scrollbar-none">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`w-16 h-20 sm:w-20 sm:h-24 shrink-0 overflow-hidden border transition-all ${
                    selectedImageIndex === idx
                      ? 'border-[#2C2520] ring-1 ring-[#2C2520]'
                      : 'border-[#E8DED0] opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img}
                    alt={`${product.name} perspective ${idx + 1}`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Main Visual Frame */}
          <div className="flex-1 aspect-[4/5] bg-[#E8DED0]/40 overflow-hidden rounded-xs border border-[#E8DED0] relative">
            <ImageWithFallback
              src={product.images[selectedImageIndex] || product.images[0]}
              alt={product.name}
              category={product.category}
              className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
            />

            {product.discount && (
              <span className="absolute top-4 left-4 bg-[#2C2520] text-[#F8F5EF] text-[11px] tracking-widest uppercase font-medium px-2.5 py-1">
                Save {product.discount}%
              </span>
            )}
          </div>
        </div>

        {/* Right Column: Contiguous Purchase Module */}
        <div className="lg:col-span-5 space-y-8 sticky top-28">
          <div>
            {/* Unboxed Metadata with · separator */}
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#A99B8C] font-medium mb-2">
              <span>{product.category}</span>
              <span aria-hidden="true">·</span>
              <span className={isOutOfStock ? 'text-red-700' : 'text-[#2C2520]'}>
                {isOutOfStock ? 'Sold Out' : `${product.stock} Units Remaining`}
              </span>
            </div>

            {/* Product Title */}
            <h1 className="font-serif text-3xl sm:text-4xl text-[#2C2520] font-normal leading-tight">
              {product.name}
            </h1>

            {/* Price Row */}
            <div className="mt-4 flex items-baseline gap-3 font-mono">
              <span className="text-2xl font-semibold text-[#2C2520]">
                {formatCurrency(product.price)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-sm text-[#A99B8C] line-through">
                  {formatCurrency(product.originalPrice)}
                </span>
              )}
              <span className="text-[11px] text-[#A99B8C] uppercase tracking-wider ml-1">
                Tax Included
              </span>
            </div>
          </div>

          {/* Description Prose */}
          <p className="text-sm text-[#2C2520]/80 leading-relaxed font-light">
            {product.description}
          </p>

          {/* Actions & Quantity Module */}
          <div className="space-y-4 pt-4 border-t border-[#E8DED0]">
            <div className="flex items-center gap-4">
              {/* Quantity Stepper */}
              <div className="flex items-center border border-[#E8DED0] bg-[#F8F5EF]">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-11 flex items-center justify-center text-sm text-[#2C2520] hover:bg-[#E8DED0] transition-colors"
                >
                  -
                </button>
                <span className="w-12 text-center text-xs font-mono font-medium">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  disabled={quantity >= product.stock}
                  className="w-10 h-11 flex items-center justify-center text-sm text-[#2C2520] hover:bg-[#E8DED0] transition-colors disabled:opacity-30"
                >
                  +
                </button>
              </div>

              {/* Add to Bag */}
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`flex-1 py-3.5 px-6 text-xs uppercase tracking-[0.18em] font-semibold flex items-center justify-center gap-2 transition-all ${
                  isOutOfStock
                    ? 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
                    : 'bg-[#2C2520] hover:bg-[#3D342E] text-[#F8F5EF] shadow-md'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{isOutOfStock ? 'Sold Out' : 'Add to Bag'}</span>
              </button>

              {/* Wishlist Toggle Button */}
              <button
                onClick={() => toggleWishlist(product.id)}
                className={`p-3.5 border transition-all ${
                  isFavorited
                    ? 'bg-[#2C2520] text-[#D6C2A5] border-[#2C2520]'
                    : 'border-[#E8DED0] text-[#2C2520] hover:bg-[#E8DED0]/50'
                }`}
                aria-label="Save to curated wishlist"
              >
                <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Direct Buy Now Button */}
            {!isOutOfStock && (
              <button
                onClick={handleBuyNow}
                className="w-full py-3.5 border border-[#2C2520] text-[#2C2520] hover:bg-[#2C2520] hover:text-[#F8F5EF] text-xs uppercase tracking-[0.18em] font-semibold transition-all"
              >
                Buy Now — Instant Checkout
              </button>
            )}
          </div>

          {/* Value Props */}
          <div className="pt-4 border-t border-[#E8DED0] grid grid-cols-2 gap-4 text-xs text-[#2C2520]">
            <div className="flex items-center gap-2.5">
              <Truck className="w-4 h-4 text-[#A99B8C] shrink-0" />
              <span>Complimentary shipping over ₹3,000</span>
            </div>
            <div className="flex items-center gap-2.5">
              <RotateCcw className="w-4 h-4 text-[#A99B8C] shrink-0" />
              <span>14-day hassle-free returns</span>
            </div>
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-[#A99B8C] shrink-0" />
              <span>Certificate of Atelier Provenance</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Check className="w-4 h-4 text-[#A99B8C] shrink-0" />
              <span>Cash on Delivery Available</span>
            </div>
          </div>

          {/* Accordion Tabs for Specifications, Shipping & Returns */}
          <div className="border-t border-[#E8DED0] pt-6">
            <div className="flex border-b border-[#E8DED0] gap-6 text-xs uppercase tracking-wider font-medium mb-4">
              <button
                onClick={() => setActiveTab('specs')}
                className={`pb-2 transition-colors relative ${
                  activeTab === 'specs' ? 'text-[#2C2520] font-semibold' : 'text-[#A99B8C]'
                }`}
              >
                Specifications
                {activeTab === 'specs' && (
                  <span className="absolute bottom-0 left-0 w-full h-[1.5px] bg-[#2C2520]" />
                )}
              </button>

              <button
                onClick={() => setActiveTab('shipping')}
                className={`pb-2 transition-colors relative ${
                  activeTab === 'shipping' ? 'text-[#2C2520] font-semibold' : 'text-[#A99B8C]'
                }`}
              >
                Shipping & Delivery
                {activeTab === 'shipping' && (
                  <span className="absolute bottom-0 left-0 w-full h-[1.5px] bg-[#2C2520]" />
                )}
              </button>

              <button
                onClick={() => setActiveTab('returns')}
                className={`pb-2 transition-colors relative ${
                  activeTab === 'returns' ? 'text-[#2C2520] font-semibold' : 'text-[#A99B8C]'
                }`}
              >
                Returns Policy
                {activeTab === 'returns' && (
                  <span className="absolute bottom-0 left-0 w-full h-[1.5px] bg-[#2C2520]" />
                )}
              </button>
            </div>

            {activeTab === 'specs' && (
              <div className="space-y-2 text-xs">
                {product.specifications && Object.keys(product.specifications).length > 0 ? (
                  Object.entries(product.specifications).map(([key, val]) => (
                    <div key={key} className="flex justify-between py-1 border-b border-[#E8DED0]/50">
                      <span className="font-medium text-[#2C2520]">{key}</span>
                      <span className="text-[#A99B8C] text-right">{val}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-[#A99B8C]">Specifications available on direct atelier request.</p>
                )}
              </div>
            )}

            {activeTab === 'shipping' && (
              <div className="space-y-3 text-xs text-[#2C2520]/80 leading-relaxed">
                <p>
                  Orders are prepared in climate-controlled white-glove packaging within 24 to 48 hours.
                </p>
                <p>
                  Metro deliveries (Mumbai, Delhi, Bengaluru) arrive in 2–4 business days. Regional destinations within 5–7 business days.
                </p>
                <p className="font-medium text-[#2C2520]">
                  Complimentary courier dispatch on all domestic orders valued over ₹3,000.
                </p>
              </div>
            )}

            {activeTab === 'returns' && (
              <div className="space-y-3 text-xs text-[#2C2520]/80 leading-relaxed">
                <p>
                  We offer a 14-day archival return window. If a piece does not harmonise with your interior space, our concierge will arrange a doorstep inspection and complimentary collection.
                </p>
                <p>
                  Items must be returned in their original packaging with atelier seals intact.
                </p>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Related Products / Complete the Look */}
      {relatedProducts.length > 0 && (
        <section className="pt-16 border-t border-[#E8DED0]">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 pb-4 border-b border-[#E8DED0]">
            <div>
              <span className="text-xs uppercase tracking-[0.2em] font-medium text-[#A99B8C] block mb-1">
                Harmonious Pairings
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl text-[#2C2520]">
                Complete The Look
              </h3>
            </div>
            <button
              onClick={() => onNavigate('shop', { category: product.category })}
              className="mt-2 md:mt-0 text-xs uppercase tracking-wider text-[#2C2520] hover:text-[#A99B8C]"
            >
              Explore {product.category} Archive →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {relatedProducts.map((rel) => (
              <ProductCard
                key={rel.id}
                product={rel}
                onSelect={onSelectProduct}
                onQuickView={onQuickView}
              />
            ))}
          </div>
        </section>
      )}

    </div>
  );
};
