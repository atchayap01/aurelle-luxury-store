import React, { useState, useEffect } from 'react';
import { ArrowRight, Sparkles, Compass, Shield, Feather } from 'lucide-react';
import { Product } from '../types';
import { productsAPI } from '../services/api';
import { ProductCard } from '../components/ProductCard';
import { ImageWithFallback } from '../components/ImageWithFallback';

interface HomePageProps {
  onNavigate: (page: string, params?: any) => void;
  onSelectProduct: (product: Product) => void;
  onQuickView: (product: Product) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onNavigate,
  onSelectProduct,
  onQuickView,
}) => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [bestsellerProducts, setBestsellerProducts] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const [featData, bestData, newData] = await Promise.all([
          productsAPI.getProducts({ featured: true, limit: 4 }),
          productsAPI.getProducts({ bestseller: true, limit: 4 }),
          productsAPI.getProducts({ sort: 'newest', limit: 4 }),
        ]);
        setFeaturedProducts(featData.products);
        setBestsellerProducts(bestData.products);
        setNewArrivals(newData.products);
      } catch (err) {
        console.error('Failed to load home page products:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadHomeData();
  }, []);

  const categories = [
    {
      name: 'Home',
      title: 'Objects & Lighting',
      desc: 'Tactile stoneware, mouth-blown glass, and quiet architectural illumination.',
      image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Fashion',
      title: 'Apparel Atelier',
      desc: 'Washed European linens, unconstructed wool tailoring, and honest silhouettes.',
      image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Accessories',
      title: 'Leather & Horology',
      desc: 'Vegetable-tanned Tuscan leather, pure mulberry silks, and minimal timepieces.',
      image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Beauty',
      title: 'Botanical Formulations',
      desc: 'Artisanal perfume compositions and cold-pressed nutrient-dense face elixirs.',
      image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Lifestyle',
      title: 'Everyday Rituals',
      desc: 'Handcrafted slow-drip coffee tools, incense burners, and walnut desk objects.',
      image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
    },
  ];

  return (
    <div className="space-y-24 sm:space-y-32">
      
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[85vh] lg:min-h-[90vh] flex items-center justify-center overflow-hidden -mt-6 sm:-mt-8">
        {/* Hero Background Image */}
        <div className="absolute inset-0 z-0">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=2000&q=85"
            alt="Aurelle luxury interior architecture"
            className="w-full h-full object-cover scale-105"
          />
          {/* Measured Scrim for Media Overlays (WCAG AA 4.5:1 text contrast) */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#2C2520]/85 via-[#2C2520]/45 to-[#2C2520]/25" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center text-[#F8F5EF] py-20">
          {/* Brand mark */}
          <span className="text-xs sm:text-sm tracking-[0.3em] uppercase font-medium text-[#D6C2A5] mb-4 block">
            Aurelle Atelier
          </span>

          <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-normal tracking-tight text-white mb-6 leading-[1.08] text-balance">
            Curated for the art of living.
          </h1>

          <p className="text-base sm:text-lg text-[#E8DED0]/90 max-w-2xl mx-auto mb-10 font-light leading-relaxed">
            Thoughtfully selected pieces that bring beauty, character, and timeless elegance into everyday life.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => onNavigate('shop')}
              className="w-full sm:w-auto px-8 py-4 bg-[#F8F5EF] text-[#2C2520] hover:bg-[#E8DED0] text-xs uppercase tracking-[0.2em] font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg"
            >
              <span>Explore Collection</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('about')}
              className="w-full sm:w-auto px-8 py-4 border border-[#F8F5EF]/60 text-white hover:bg-white/10 text-xs uppercase tracking-[0.2em] font-medium transition-all duration-200 backdrop-blur-xs"
            >
              Discover Aurelle
            </button>
          </div>
        </div>
      </section>

      {/* Editorial Pillars - 4 Principles of Quiet Luxury */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 bg-[#F8F5EF] p-6 sm:p-8 border border-[#E8DED0] shadow-sm">
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left p-3">
            <Feather className="w-5 h-5 text-[#A99B8C] mb-2" />
            <h4 className="text-xs uppercase tracking-[0.16em] font-semibold text-[#2C2520]">
              Tactile Materials
            </h4>
            <p className="text-xs text-[#A99B8C] mt-1 leading-relaxed">
              Normandy linen, Tuscan leather, and raw Kyoto stoneware.
            </p>
          </div>

          <div className="flex flex-col items-center sm:items-start text-center sm:text-left p-3 border-l border-[#E8DED0]/60">
            <Compass className="w-5 h-5 text-[#A99B8C] mb-2" />
            <h4 className="text-xs uppercase tracking-[0.16em] font-semibold text-[#2C2520]">
              Master Provenance
            </h4>
            <p className="text-xs text-[#A99B8C] mt-1 leading-relaxed">
              Formed in collaboration with multi-generational studios.
            </p>
          </div>

          <div className="flex flex-col items-center sm:items-start text-center sm:text-left p-3 border-l border-[#E8DED0]/60">
            <Sparkles className="w-5 h-5 text-[#A99B8C] mb-2" />
            <h4 className="text-xs uppercase tracking-[0.16em] font-semibold text-[#2C2520]">
              Limited Runs
            </h4>
            <p className="text-xs text-[#A99B8C] mt-1 leading-relaxed">
              Small batch releases that value enduring permanence.
            </p>
          </div>

          <div className="flex flex-col items-center sm:items-start text-center sm:text-left p-3 border-l border-[#E8DED0]/60">
            <Shield className="w-5 h-5 text-[#A99B8C] mb-2" />
            <h4 className="text-xs uppercase tracking-[0.16em] font-semibold text-[#2C2520]">
              White-Glove Care
            </h4>
            <p className="text-xs text-[#A99B8C] mt-1 leading-relaxed">
              Complimentary shipping over ₹3,000 and 14-day trials.
            </p>
          </div>
        </div>
      </section>

      {/* 2. FEATURED COLLECTION SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 pb-4 border-b border-[#E8DED0]">
          <div>
            <span className="text-xs uppercase tracking-[0.2em] font-medium text-[#A99B8C] block mb-2">
              Curated Selection
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#2C2520]">
              Featured Collection
            </h2>
          </div>
          <button
            onClick={() => onNavigate('shop', { filter: 'featured' })}
            className="mt-4 md:mt-0 text-xs uppercase tracking-[0.16em] text-[#2C2520] hover:text-[#A99B8C] font-medium flex items-center gap-2 group"
          >
            <span>View All Curations</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="animate-pulse space-y-4">
                <div className="aspect-[4/5] bg-[#E8DED0]/60 rounded-xs" />
                <div className="h-4 bg-[#E8DED0]/60 w-3/4" />
                <div className="h-4 bg-[#E8DED0]/60 w-1/4" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelect={onSelectProduct}
                onQuickView={onQuickView}
              />
            ))}
          </div>
        )}
      </section>

      {/* 3. SHOP BY CATEGORY SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-16">
          <span className="text-xs uppercase tracking-[0.2em] font-medium text-[#A99B8C] block mb-2">
            Disciplines
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#2C2520]">
            Shop by Category
          </h2>
          <p className="text-xs sm:text-sm text-[#A99B8C] mt-3">
            Each category represents a dedicated studio exploration in harmony, tactile comfort, and sculptural form.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {categories.map((cat) => (
            <div
              key={cat.name}
              onClick={() => onNavigate('shop', { category: cat.name })}
              className="group relative cursor-pointer overflow-hidden bg-[#E8DED0] aspect-[3/4] border border-[#E8DED0] flex flex-col justify-end p-6 transition-all duration-300 hover:shadow-xl"
            >
              {/* Category Background Image */}
              <div className="absolute inset-0">
                <ImageWithFallback
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#2C2520]/80 via-[#2C2520]/25 to-transparent transition-opacity group-hover:from-[#2C2520]/90" />
              </div>

              {/* Category Label */}
              <div className="relative z-10 text-white">
                <span className="text-[10px] uppercase tracking-[0.2em] font-medium text-[#D6C2A5] block mb-1">
                  Collection
                </span>
                <h3 className="font-serif text-2xl font-normal leading-tight group-hover:translate-x-1 transition-transform">
                  {cat.name}
                </h3>
                <p className="text-[11px] text-[#E8DED0]/80 mt-1 line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {cat.title}
                </p>
                <div className="mt-3 flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-[#D6C2A5]">
                  <span>Discover</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. EDITORIAL HERO BANNER: The Aurelle Atelier Story */}
      <section className="bg-[#2C2520] text-[#F8F5EF] py-24 sm:py-32 overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Left Story Column */}
            <div className="lg:col-span-6 space-y-6">
              <span className="text-xs uppercase tracking-[0.24em] font-medium text-[#D6C2A5] block">
                The Philosophy of Aurelle
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl font-light text-white leading-tight">
                Quiet luxury is not an aesthetic. It is a relationship with stillness.
              </h2>
              <div className="space-y-4 text-sm text-[#E8DED0]/80 leading-relaxed font-light">
                <p>
                  At Aurelle, we create for those who seek depth over novelty. Every object in our collection is born from an uncompromising appreciation for materials: unbleached organic linen, honest stone, veg-tanned leather, and unadorned stoneware.
                </p>
                <p>
                  We collaborate with ateliers across Kyoto, Florence, Grasse, and Porto — keepers of ancient techniques who share our conviction that objects should age with dignity and tell stories across generations.
                </p>
              </div>

              <div className="pt-4 flex items-center gap-6">
                <button
                  onClick={() => onNavigate('about')}
                  className="px-6 py-3.5 bg-[#D6C2A5] hover:bg-[#E8DED0] text-[#2C2520] text-xs uppercase tracking-[0.18em] font-semibold transition-colors"
                >
                  Read Our Atelier Story
                </button>
                <button
                  onClick={() => onNavigate('shop')}
                  className="text-xs uppercase tracking-[0.18em] text-[#E8DED0] hover:text-white underline underline-offset-4"
                >
                  View Archive
                </button>
              </div>
            </div>

            {/* Right Atmospheric Visual Grid */}
            <div className="lg:col-span-6 relative">
              <div className="grid grid-cols-2 gap-4">
                <div className="aspect-[3/4] overflow-hidden rounded-xs border border-[#D6C2A5]/20 shadow-xl">
                  <ImageWithFallback
                    src="https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80"
                    alt="Artisan ceramic craftsmanship"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="aspect-[3/4] overflow-hidden rounded-xs border border-[#D6C2A5]/20 shadow-xl mt-8">
                  <ImageWithFallback
                    src="https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80"
                    alt="Textile drape and natural linen"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 5. BEST SELLERS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 pb-4 border-b border-[#E8DED0]">
          <div>
            <span className="text-xs uppercase tracking-[0.2em] font-medium text-[#A99B8C] block mb-2">
              Enduring Favorites
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#2C2520]">
              Best Sellers
            </h2>
          </div>
          <button
            onClick={() => onNavigate('shop', { filter: 'bestseller' })}
            className="mt-4 md:mt-0 text-xs uppercase tracking-[0.16em] text-[#2C2520] hover:text-[#A99B8C] font-medium flex items-center gap-2 group"
          >
            <span>Explore All Icons</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {bestsellerProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelect={onSelectProduct}
              onQuickView={onQuickView}
            />
          ))}
        </div>
      </section>

      {/* 6. NEW ARRIVALS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 pb-4 border-b border-[#E8DED0]">
          <div>
            <span className="text-xs uppercase tracking-[0.2em] font-medium text-[#A99B8C] block mb-2">
              Fresh From Ateliers
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#2C2520]">
              New Arrivals
            </h2>
          </div>
          <button
            onClick={() => onNavigate('shop', { filter: 'newest' })}
            className="mt-4 md:mt-0 text-xs uppercase tracking-[0.16em] text-[#2C2520] hover:text-[#A99B8C] font-medium flex items-center gap-2 group"
          >
            <span>View New Arrivals</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {newArrivals.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelect={onSelectProduct}
              onQuickView={onQuickView}
            />
          ))}
        </div>
      </section>

    </div>
  );
};
