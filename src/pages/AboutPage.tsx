import React from 'react';
import { ArrowRight, Compass, Feather, Sparkles, Shield } from 'lucide-react';
import { ImageWithFallback } from '../components/ImageWithFallback';

interface AboutPageProps {
  onNavigate: (page: string, params?: any) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      
      {/* Editorial Header */}
      <section className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs uppercase tracking-[0.24em] font-medium text-[#A99B8C] block">
          The Aurelle Manifesto
        </span>
        <h1 className="font-serif text-4xl sm:text-6xl text-[#2C2520] font-normal leading-tight text-balance">
          Curated for the art of living.
        </h1>
        <p className="text-base sm:text-lg text-[#2C2520]/80 font-light leading-relaxed">
          We reject the ephemeral pace of industrial mass consumerism in pursuit of objects that evoke stillness, enduring beauty, and spatial harmony.
        </p>
      </section>

      {/* Hero Dual Image Panel */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="aspect-[4/5] bg-[#E8DED0] overflow-hidden rounded-xs border border-[#E8DED0] shadow-xl">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80"
            alt="Artisanal ceramics and interior stillness"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="space-y-6 md:pl-8">
          <span className="text-xs uppercase tracking-[0.2em] font-medium text-[#A99B8C]">
            01. The Principle of Stillness
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#2C2520] font-light leading-snug">
            Objects that ground the human spirit within architectural space.
          </h2>
          <div className="space-y-4 text-xs sm:text-sm text-[#2C2520]/80 leading-relaxed font-light">
            <p>
              Aurelle was established with a singular conviction: that the objects with which we inhabit daily existence subtly shape our inner thoughts, our breath, and our rhythm of living.
            </p>
            <p>
              Rather than transient novelty, we seek out silence, proportion, and organic grain. An unglazed ceramic lip that catches the morning sun; Belgian flax that softens with every wash; a Tuscany leather bag that records the travels of a lifetime.
            </p>
          </div>
        </div>
      </section>

      {/* 3 Core Tenets */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 py-12 border-y border-[#E8DED0]">
        <div className="space-y-3">
          <Feather className="w-6 h-6 text-[#A99B8C]" />
          <h3 className="font-serif text-xl text-[#2C2520]">Honest Raw Materials</h3>
          <p className="text-xs text-[#2C2520]/80 leading-relaxed font-light">
            We use zero synthetic resins or petroleum plastics where natural, biodegradable, and circular elements can endure. Certified flax, organic vegetable-tanned leathers, and native mineral clays.
          </p>
        </div>

        <div className="space-y-3">
          <Compass className="w-6 h-6 text-[#A99B8C]" />
          <h3 className="font-serif text-xl text-[#2C2520]">Atelier Provenance</h3>
          <p className="text-xs text-[#2C2520]/80 leading-relaxed font-light">
            Each creation is anchored in geographical mastery: perfumers in Grasse, ceramicists in Kyoto, leather artisans in Florence, and textile weavers in Porto.
          </p>
        </div>

        <div className="space-y-3">
          <Shield className="w-6 h-6 text-[#A99B8C]" />
          <h3 className="font-serif text-xl text-[#2C2520]">Small Batch Permanence</h3>
          <p className="text-xs text-[#2C2520]/80 leading-relaxed font-light">
            No warehouses of discardable inventory. We produce limited numbered editions, allowing artisans the quiet time needed for uncompromised finishing.
          </p>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="text-center py-12 max-w-xl mx-auto space-y-6">
        <h3 className="font-serif text-3xl text-[#2C2520]">Experience the Collection</h3>
        <p className="text-xs text-[#A99B8C] leading-relaxed">
          Discover our current release of lifestyle objects, apparel, and interior lighting.
        </p>
        <button
          onClick={() => onNavigate('shop')}
          className="px-8 py-4 bg-[#2C2520] hover:bg-[#3D342E] text-[#F8F5EF] text-xs uppercase tracking-[0.2em] font-semibold transition-all inline-flex items-center gap-2 shadow-lg"
        >
          <span>Explore The Catalogue</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </section>

    </div>
  );
};
