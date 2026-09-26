import React, { useState, useEffect, useCallback } from 'react';
import { Search, SlidersHorizontal, X, RotateCcw } from 'lucide-react';
import { Product } from '../types';
import { productsAPI, ProductQueryParams } from '../services/api';
import { ProductCard } from '../components/ProductCard';

interface ShopPageProps {
  initialCategory?: string;
  initialSearch?: string;
  initialSort?: string;
  onSelectProduct: (product: Product) => void;
  onQuickView: (product: Product) => void;
}

export const ShopPage: React.FC<ShopPageProps> = ({
  initialCategory = 'All',
  initialSearch = '',
  initialSort = 'featured',
  onSelectProduct,
  onQuickView,
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Filters State
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch);
  const [sortBy, setSortBy] = useState<string>(initialSort);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 30000]);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  const categories = ['All', 'Home', 'Fashion', 'Accessories', 'Beauty', 'Lifestyle'];

  const sortOptions = [
    { value: 'featured', label: 'Curator’s Choice (Featured)' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
    { value: 'newest', label: 'Newest Arrivals' },
    { value: 'bestseller', label: 'Best Sellers' },
  ];

  const fetchProducts = useCallback(async (pageToLoad = 1) => {
    setIsLoading(true);
    try {
      const params: ProductQueryParams = {
        page: pageToLoad,
        limit: 12,
        sort: sortBy,
        minPrice: priceRange[0] > 0 ? priceRange[0] : undefined,
        maxPrice: priceRange[1] < 30000 ? priceRange[1] : undefined,
        inStock: inStockOnly || undefined,
      };

      if (selectedCategory && selectedCategory !== 'All') {
        params.category = selectedCategory;
      }

      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      const res = await productsAPI.getProducts(params);
      setProducts(res.products);
      setTotalProducts(res.total);
      setTotalPages(res.totalPages);
      setCurrentPage(res.page);
    } catch (err) {
      console.error('Failed to fetch catalog:', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory, searchQuery, sortBy, priceRange, inStockOnly]);

  useEffect(() => {
    fetchProducts(1);
  }, [fetchProducts]);

  const handleResetFilters = () => {
    setSelectedCategory('All');
    setSearchQuery('');
    setSortBy('featured');
    setPriceRange([0, 30000]);
    setInStockOnly(false);
  };

  const hasActiveFilters =
    selectedCategory !== 'All' ||
    searchQuery.trim() !== '' ||
    priceRange[0] > 0 ||
    priceRange[1] < 30000 ||
    inStockOnly;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      
      {/* Header Banner */}
      <div className="border-b border-[#E8DED0] pb-8">
        <span className="text-xs uppercase tracking-[0.2em] font-medium text-[#A99B8C] block mb-2">
          The Aurelle Catalogue
        </span>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl sm:text-5xl text-[#2C2520] font-normal">
              {selectedCategory === 'All' ? 'Curated Collection' : `${selectedCategory} Collection`}
            </h1>
            <p className="text-xs sm:text-sm text-[#A99B8C] mt-2 max-w-xl">
              Enduring pieces made with deliberate precision, tactile materials, and respectful proportion.
            </p>
          </div>
          <div className="text-xs font-mono text-[#A99B8C]">
            Showing {products.length} of {totalProducts} pieces
          </div>
        </div>
      </div>

      {/* Filter and Controls Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-[#E8DED0]">
        
        {/* Category Segmented Controls (interactive buttons) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 text-xs uppercase tracking-[0.14em] font-medium whitespace-nowrap transition-colors rounded-xs ${
                selectedCategory === cat
                  ? 'bg-[#2C2520] text-[#F8F5EF]'
                  : 'bg-[#E8DED0]/50 text-[#2C2520] hover:bg-[#E8DED0]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search, Sort, and Filter Toggle */}
        <div className="flex items-center gap-3">
          {/* Quick Search inside catalog */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-[#A99B8C] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search pieces..."
              className="w-full bg-[#F8F5EF] border border-[#E8DED0] pl-9 pr-3 py-2 text-xs text-[#2C2520] placeholder-[#A99B8C] focus:outline-none focus:border-[#2C2520]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#A99B8C] hover:text-[#2C2520]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-[#F8F5EF] border border-[#E8DED0] px-3 py-2 text-xs uppercase tracking-wider text-[#2C2520] focus:outline-none cursor-pointer"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {/* Filter Drawer Toggle */}
          <button
            onClick={() => setIsFilterDrawerOpen(!isFilterDrawerOpen)}
            className={`px-3 py-2 border text-xs uppercase tracking-wider flex items-center gap-2 transition-colors ${
              hasActiveFilters
                ? 'bg-[#E8DED0] border-[#2C2520] text-[#2C2520] font-semibold'
                : 'border-[#E8DED0] text-[#2C2520] hover:bg-[#E8DED0]/50'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Filters</span>
          </button>
        </div>

      </div>

      {/* Expandable Filter Tray */}
      {isFilterDrawerOpen && (
        <div className="bg-[#E8DED0]/30 p-6 border border-[#E8DED0] rounded-xs animate-fade-in space-y-6">
          <div className="flex justify-between items-center pb-3 border-b border-[#E8DED0]">
            <h3 className="text-xs uppercase tracking-[0.2em] font-medium text-[#2C2520]">
              Refine Collection
            </h3>
            <button
              onClick={handleResetFilters}
              className="text-xs text-[#A99B8C] hover:text-[#2C2520] flex items-center gap-1.5 uppercase tracking-wider"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset All</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Price Filter */}
            <div>
              <label className="text-xs uppercase tracking-wider text-[#2C2520] font-medium block mb-2">
                Price Cap: Up to ₹{priceRange[1].toLocaleString('en-IN')}
              </label>
              <input
                type="range"
                min="2000"
                max="30000"
                step="1000"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                className="w-full accent-[#2C2520]"
              />
              <div className="flex justify-between text-[11px] font-mono text-[#A99B8C] mt-1">
                <span>₹2,000</span>
                <span>₹30,000+</span>
              </div>
            </div>

            {/* In Stock toggle */}
            <div className="flex items-center gap-3 pt-4 sm:pt-0">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="rounded-xs accent-[#2C2520] w-4 h-4 cursor-pointer"
                />
                <span className="text-xs uppercase tracking-wider text-[#2C2520] font-medium">
                  In-Stock Pieces Only
                </span>
              </label>
            </div>

            {/* Active Filters Summary */}
            <div className="flex items-center justify-end">
              {hasActiveFilters && (
                <div className="flex flex-wrap gap-1.5 items-center">
                  <span className="text-[11px] text-[#A99B8C] mr-1">Active:</span>
                  {selectedCategory !== 'All' && (
                    <span className="text-[11px] bg-[#E8DED0] px-2 py-0.5 text-[#2C2520]">
                      {selectedCategory}
                    </span>
                  )}
                  {searchQuery && (
                    <span className="text-[11px] bg-[#E8DED0] px-2 py-0.5 text-[#2C2520]">
                      "{searchQuery}"
                    </span>
                  )}
                  {inStockOnly && (
                    <span className="text-[11px] bg-[#E8DED0] px-2 py-0.5 text-[#2C2520]">
                      In Stock
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Product Grid Area */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div key={n} className="animate-pulse space-y-4">
              <div className="aspect-[4/5] bg-[#E8DED0]/60 rounded-xs" />
              <div className="h-4 bg-[#E8DED0]/60 w-3/4" />
              <div className="h-4 bg-[#E8DED0]/60 w-1/4" />
            </div>
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelect={onSelectProduct}
              onQuickView={onQuickView}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="py-24 text-center border border-[#E8DED0] bg-[#E8DED0]/20 rounded-xs p-8">
          <h3 className="font-serif text-2xl text-[#2C2520] mb-2">No pieces found</h3>
          <p className="text-xs text-[#A99B8C] max-w-md mx-auto mb-6">
            We could not find any curations matching your specific combination of filters. Try clearing your filters or selecting a different category.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-6 py-3 bg-[#2C2520] text-[#F8F5EF] text-xs uppercase tracking-[0.16em] hover:bg-[#3D342E] transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-12 border-t border-[#E8DED0]">
          <button
            onClick={() => fetchProducts(currentPage - 1)}
            disabled={currentPage <= 1}
            className="px-4 py-2 border border-[#E8DED0] text-xs uppercase tracking-wider text-[#2C2520] disabled:opacity-30 hover:bg-[#E8DED0]/40 transition-colors"
          >
            Previous
          </button>

          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i + 1}
              onClick={() => fetchProducts(i + 1)}
              className={`w-9 h-9 text-xs font-mono transition-colors ${
                currentPage === i + 1
                  ? 'bg-[#2C2520] text-white font-semibold'
                  : 'text-[#2C2520] hover:bg-[#E8DED0]/50'
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            onClick={() => fetchProducts(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="px-4 py-2 border border-[#E8DED0] text-xs uppercase tracking-wider text-[#2C2520] disabled:opacity-30 hover:bg-[#E8DED0]/40 transition-colors"
          >
            Next
          </button>
        </div>
      )}

    </div>
  );
};
