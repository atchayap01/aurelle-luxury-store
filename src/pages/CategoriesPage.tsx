import React from 'react';
import { ArrowRight } from 'lucide-react';
import { ImageWithFallback } from '../components/ImageWithFallback';

interface CategoriesPageProps {
  onNavigate: (page: string, params?: any) => void;
}

export const CategoriesPage: React.FC<CategoriesPageProps> = ({ onNavigate }) => {
  const categories = [
    {
      name: 'Home',
      title: 'Objects, Vessels & Ambient Illumination',
      desc: 'Formed from tactile stoneware, solid travertine, and mouth-blown glass. Designed to introduce stillness and proportion into architectural interiors.',
      image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1000&q=80',
      curatedCount: '3 Archival Pieces',
    },
    {
      name: 'Fashion',
      title: 'Relaxed Tailoring & Washed European Linens',
      desc: 'Sartorial silhouettes unburdened by rigid structure. Tailored in Porto and Northern Italy from breathable Normandy flax and virgin wool.',
      image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1000&q=80',
      curatedCount: '3 Archival Pieces',
    },
    {
      name: 'Accessories',
      title: 'Tuscan Leather Goods, Silk & Minimal Horology',
      desc: 'Crafted from vegetable-tanned full-grain vachetta that patinas over decades. Paired with Swiss quartz timepieces and pure mulberry silk squares.',
      image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1000&q=80',
      curatedCount: '3 Archival Pieces',
    },
    {
      name: 'Beauty',
      title: 'Botanical Perfumery & Restorative Body Elixirs',
      desc: 'Artisanal perfume compositions distilled in Grasse, France. Formulated with cold-pressed botanical squalane, camellia seed, and Moroccan neroli.',
      image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1000&q=80',
      curatedCount: '2 Archival Pieces',
    },
    {
      name: 'Lifestyle',
      title: 'Mindful Morning Rituals & Desk Objects',
      desc: 'Hand-blown borosilicate coffee brewing tools, lathed American walnut stands, and ritualistic objects for intentional living.',
      image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1000&q=80',
      curatedCount: '1 Archival Piece',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
      
      {/* Header */}
      <div className="border-b border-[#E8DED0] pb-6">
        <span className="text-xs uppercase tracking-[0.24em] font-medium text-[#A99B8C] block mb-2">
          Atelier Taxonomy
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl text-[#2C2520] font-normal">
          Disciplines & Collections
        </h1>
        <p className="text-xs sm:text-sm text-[#A99B8C] mt-2 max-w-xl">
          Explore our five dedicated curations, each grounded in material integrity and master craftsmanship.
        </p>
      </div>

      {/* Category List */}
      <div className="space-y-8">
        {categories.map((cat, idx) => (
          <div
            key={cat.name}
            onClick={() => onNavigate('shop', { category: cat.name })}
            className="group cursor-pointer grid grid-cols-1 md:grid-cols-12 border border-[#E8DED0] bg-[#F8F5EF] overflow-hidden hover:shadow-xl transition-all duration-300"
          >
            {/* Image Frame */}
            <div className="md:col-span-5 aspect-[4/3] md:aspect-auto overflow-hidden bg-[#E8DED0]">
              <ImageWithFallback
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
            </div>

            {/* Info Frame */}
            <div className="md:col-span-7 p-6 sm:p-10 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 text-xs uppercase tracking-widest text-[#A99B8C] mb-2">
                  <span>0{idx + 1}. Discipline</span>
                  <span>·</span>
                  <span>{cat.curatedCount}</span>
                </div>

                <h2 className="font-serif text-2xl sm:text-3xl text-[#2C2520] group-hover:text-[#A99B8C] transition-colors mb-2">
                  {cat.name} Collection
                </h2>

                <h3 className="font-serif italic text-base text-[#D6C2A5] mb-4">
                  {cat.title}
                </h3>

                <p className="text-xs sm:text-sm text-[#2C2520]/80 leading-relaxed font-light max-w-xl">
                  {cat.desc}
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-[#E8DED0] flex items-center justify-between">
                <span className="text-xs uppercase tracking-[0.18em] font-semibold text-[#2C2520] flex items-center gap-2 group-hover:translate-x-1 transition-transform">
                  <span>Explore {cat.name} Catalogue</span>
                  <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
