import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ArrowRight } from 'lucide-react';
import { Product } from '../types';
import { productsAPI } from '../services/api';
import { formatCurrency } from '../utils/formatters';
import { ImageWithFallback } from './ImageWithFallback';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
  onNavigateToShop: (query: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectProduct,
  onNavigateToShop,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const data = await productsAPI.getProducts({ search: query.trim(), limit: 6 });
        setResults(data.products);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const popularSearches = ['Linen', 'Vase', 'Ceramic', 'Leather Tote', 'Watch', 'Perfume'];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#2C2520]/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-2xl bg-[#F8F5EF] shadow-2xl border border-[#E8DED0] overflow-hidden z-10 animate-fade-in">
        
        {/* Search Input Bar */}
        <div className="p-4 sm:p-6 border-b border-[#E8DED0] flex items-center gap-3">
          <Search className="w-5 h-5 text-[#A99B8C] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && query.trim()) {
                onNavigateToShop(query.trim());
                onClose();
              }
            }}
            placeholder="Search our curated collections..."
            className="flex-1 bg-transparent text-lg text-[#2C2520] placeholder-[#A99B8C] font-serif focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-[#A99B8C] hover:text-[#2C2520]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-xs uppercase tracking-widest text-[#2C2520] px-2 py-1 hover:text-[#A99B8C]"
          >
            Esc
          </button>
        </div>

        {/* Content Body */}
        <div className="max-h-[60vh] overflow-y-auto p-6">
          {query.trim() === '' ? (
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-[#A99B8C] font-medium mb-3">
                Suggested Curations
              </p>
              <div className="flex flex-wrap gap-2">
                {popularSearches.map((term) => (
                  <button
                    key={term}
                    onClick={() => {
                      setQuery(term);
                    }}
                    className="px-3.5 py-1.5 text-xs text-[#2C2520] bg-[#E8DED0]/60 hover:bg-[#E8DED0] transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          ) : isSearching ? (
            <div className="py-12 text-center text-xs text-[#A99B8C] uppercase tracking-widest font-mono">
              Searching archives...
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs uppercase tracking-wider text-[#A99B8C]">
                <span>{results.length} Pieces Found</span>
                <button
                  onClick={() => {
                    onNavigateToShop(query.trim());
                    onClose();
                  }}
                  className="text-[#2C2520] font-medium hover:underline flex items-center gap-1"
                >
                  <span>View all</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {results.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => {
                      onSelectProduct(product);
                      onClose();
                    }}
                    className="flex gap-3 p-2 bg-[#F8F5EF] hover:bg-[#E8DED0]/40 border border-[#E8DED0] cursor-pointer transition-colors group"
                  >
                    <div className="w-16 h-20 shrink-0 overflow-hidden bg-[#E8DED0]">
                      <ImageWithFallback
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div className="flex flex-col justify-center">
                      <span className="text-[10px] uppercase tracking-wider text-[#A99B8C]">
                        {product.category}
                      </span>
                      <h4 className="font-serif text-sm text-[#2C2520] line-clamp-1 group-hover:text-[#A99B8C] transition-colors">
                        {product.name}
                      </h4>
                      <span className="font-mono text-xs font-semibold text-[#2C2520] mt-1">
                        {formatCurrency(product.price)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-12 text-center">
              <p className="font-serif text-lg text-[#2C2520]">No pieces matching "{query}"</p>
              <p className="text-xs text-[#A99B8C] mt-1">
                Try searching for materials like linen, ceramic, leather, or browse categories.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
