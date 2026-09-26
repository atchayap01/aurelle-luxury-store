export interface ProductSpecification {
  [key: string]: string;
}

export interface ProductData {
  id: string;
  name: string;
  description: string;
  category: 'Home' | 'Fashion' | 'Accessories' | 'Beauty' | 'Lifestyle';
  price: number;
  originalPrice?: number;
  discount?: number;
  images: string[];
  stock: number;
  specifications: ProductSpecification;
  featured: boolean;
  bestseller: boolean;
  createdAt: string;
  updatedAt: string;
}

export const initialProducts: ProductData[] = [
  {
    id: "prod-001",
    name: "Sculptural Ceramic Vase",
    description: "An asymmetrical, handcrafted fluted vessel shaped by master potters from raw stoneware. Finished in a tactile organic sand glaze that captures ambient light gracefully.",
    category: "Home",
    price: 4800,
    originalPrice: 6000,
    discount: 20,
    images: [
      "https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&w=1000&q=80"
    ],
    stock: 14,
    specifications: {
      "Material": "Stoneware clay, mineral sand glaze",
      "Dimensions": "28cm H × 18cm W",
      "Weight": "1.8 kg",
      "Origin": "Kyoto, Japan",
      "Care": "Wipe with damp cloth. Hand wash only."
    },
    featured: true,
    bestseller: true,
    createdAt: "2026-01-10T10:00:00Z",
    updatedAt: "2026-02-15T12:00:00Z"
  },
  {
    id: "prod-002",
    name: "Linen Table Lamp",
    description: "An architectural lighting piece featuring a solid travertine stone cylinder base paired with an unbleached Belgian linen cylinder shade for warm, diffused evening illumination.",
    category: "Home",
    price: 8500,
    originalPrice: 9900,
    discount: 14,
    images: [
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=1000&q=80"
    ],
    stock: 9,
    specifications: {
      "Base Material": "Honed Italian travertine",
      "Shade Material": "100% Belgian flax linen",
      "Dimensions": "42cm H × 25cm Dia",
      "Cord": "2m braided champagne cord with brass dimmer",
      "Bulb": "E27 Warm LED (included)"
    },
    featured: true,
    bestseller: false,
    createdAt: "2026-01-12T11:00:00Z",
    updatedAt: "2026-02-10T14:30:00Z"
  },
  {
    id: "prod-003",
    name: "Minimalist Candle Set",
    description: "A curated trio of hand-poured botanical soy candles housed in matte cream stoneware cups. Notes of smoked cedarwood, sun-drenched fig leaves, and earthy vetiver.",
    category: "Home",
    price: 2400,
    images: [
      "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1572726728687-9b2f5c714152?auto=format&fit=crop&w=1000&q=80"
    ],
    stock: 28,
    specifications: {
      "Wax": "100% natural slow-burning soy wax",
      "Wick": "Unbleached organic cotton wick",
      "Burn Time": "45 hours per vessel",
      "Set Includes": "Santal Noir, Figuier Sauvage, Vetiver Blanc",
      "Vessel": "Reusable matte ceramic"
    },
    featured: false,
    bestseller: true,
    createdAt: "2026-01-15T09:00:00Z",
    updatedAt: "2026-01-20T10:00:00Z"
  },
  {
    id: "prod-004",
    name: "Signature Linen Shirt",
    description: "Tailored from pure Normandy flax linen pre-washed for effortless softness. Designed with a relaxed unstructured collar, clean French seams, and carved mother-of-pearl buttons.",
    category: "Fashion",
    price: 5200,
    originalPrice: 6500,
    discount: 20,
    images: [
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1000&q=80"
    ],
    stock: 18,
    specifications: {
      "Fabric": "100% Normandy certified linen (165 gsm)",
      "Fit": "Relaxed tailored silhouette",
      "Buttons": "Natural river shell mother-of-pearl",
      "Origin": "Porto, Portugal",
      "Care": "Gentle machine wash cold, hang dry in shade."
    },
    featured: true,
    bestseller: false,
    createdAt: "2026-01-18T14:00:00Z",
    updatedAt: "2026-02-12T09:00:00Z"
  },
  {
    id: "prod-005",
    name: "Tailored Relaxed Blazer",
    description: "An unconstructed single-breasted blazer crafted from a bespoke Italian virgin wool and raw linen blend. Features soft natural shoulders and patch pockets for understated sartorial luxury.",
    category: "Fashion",
    price: 14500,
    originalPrice: 17000,
    discount: 15,
    images: [
      "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1598554747436-c9293d6a588f?auto=format&fit=crop&w=1000&q=80"
    ],
    stock: 8,
    specifications: {
      "Composition": "65% Virgin Wool, 35% Belgian Flax",
      "Lining": "100% Cupro half-lined interior",
      "Closure": "Single horn button",
      "Fit": "Modern relaxed cut",
      "Dry Clean": "Specialist dry clean only"
    },
    featured: true,
    bestseller: true,
    createdAt: "2026-01-20T16:00:00Z",
    updatedAt: "2026-02-14T11:00:00Z"
  },
  {
    id: "prod-006",
    name: "Classic Leather Tote",
    description: "Formed from supple full-grain Italian Tuscan saddle leather that patinas richly over years of use. Unlined suede interior with a secure detachable zipper pouch and brass magnetic clasp.",
    category: "Fashion",
    price: 18900,
    originalPrice: 22000,
    discount: 14,
    images: [
      "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1000&q=80"
    ],
    stock: 11,
    specifications: {
      "Leather": "Full-grain vegetable-tanned vachetta",
      "Hardware": "Solid brushed brass",
      "Dimensions": "36cm H × 44cm W × 14cm D",
      "Strap Drop": "26cm comfortable shoulder drop",
      "Origin": "Florence, Italy"
    },
    featured: true,
    bestseller: true,
    createdAt: "2026-01-22T08:30:00Z",
    updatedAt: "2026-02-18T10:15:00Z"
  },
  {
    id: "prod-007",
    name: "Minimal Leather Wallet",
    description: "An ultra-thin everyday card wallet engineered to hold up to 8 cards and folded banknotes without pocket bulk. Beveled and beeswax burnished edges.",
    category: "Accessories",
    price: 3800,
    originalPrice: 4500,
    discount: 15,
    images: [
      "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1606503829068-d0f50868f086?auto=format&fit=crop&w=1000&q=80"
    ],
    stock: 25,
    specifications: {
      "Material": "Full-grain French calfskin",
      "Slots": "4 exterior card slots, 1 central cash compartment",
      "Dimensions": "10cm × 7.5cm × 0.5cm",
      "Stitching": "Durable waxed saddle thread",
      "Warranty": "5-year craftsmanship guarantee"
    },
    featured: false,
    bestseller: true,
    createdAt: "2026-01-25T11:00:00Z",
    updatedAt: "2026-02-01T15:00:00Z"
  },
  {
    id: "prod-008",
    name: "Gold Accent Watch",
    description: "A master study in proportion and stillness. 38mm brushed champagne gold case with a warm cream dial, slender polished indices, and an espresso alligator-embossed calf leather strap.",
    category: "Accessories",
    price: 24000,
    originalPrice: 28500,
    discount: 16,
    images: [
      "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1000&q=80"
    ],
    stock: 6,
    specifications: {
      "Case": "316L Stainless steel with 18k champagne gold PVD",
      "Glass": "Anti-reflective domed sapphire crystal",
      "Movement": "Swiss Ronda 762 quartz movement",
      "Water Resistance": "5 ATM / 50 meters",
      "Strap": "Quick-release genuine Italian calfskin"
    },
    featured: true,
    bestseller: false,
    createdAt: "2026-01-28T12:00:00Z",
    updatedAt: "2026-02-17T09:30:00Z"
  },
  {
    id: "prod-009",
    name: "Silk Scarf",
    description: "Woven from 18-momme pure mulberry silk twill. Features hand-rolled and hand-stitched borders with an exclusive quiet abstract landscape print inspired by Mediterranean coastline stones.",
    category: "Accessories",
    price: 4200,
    images: [
      "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1000&q=80"
    ],
    stock: 19,
    specifications: {
      "Material": "100% Grade 6A Mulberry Silk Twill (18mm)",
      "Edges": "Artisan hand-rolled hems",
      "Dimensions": "90cm × 90cm square",
      "Printing": "Non-toxic organic pigments",
      "Care": "Dry clean or gentle hand wash in lukewarm water"
    },
    featured: false,
    bestseller: false,
    createdAt: "2026-02-01T10:00:00Z",
    updatedAt: "2026-02-05T11:00:00Z"
  },
  {
    id: "prod-010",
    name: "Botanical Eau de Parfum",
    description: "An evocative olfactory signature crafted in Grasse. Opening with crisp bergamot zest and pink peppercorn, settling into an intimate heart of cedarwood, orris root, and smoky warm amber.",
    category: "Beauty",
    price: 7800,
    originalPrice: 9200,
    discount: 15,
    images: [
      "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=1000&q=80"
    ],
    stock: 16,
    specifications: {
      "Volume": "50ml / 1.7 fl oz",
      "Concentration": "Eau de Parfum (22% fragrance oils)",
      "Top Notes": "Calabrian Bergamot, Pink Peppercorn",
      "Heart Notes": "Florentine Orris, Moroccan Neroli",
      "Base Notes": "Atlas Cedarwood, Warm Amber, Vetiver",
      "Origin": "Grasse, France"
    },
    featured: true,
    bestseller: true,
    createdAt: "2026-02-03T15:00:00Z",
    updatedAt: "2026-02-16T13:45:00Z"
  },
  {
    id: "prod-011",
    name: "Luxury Body Oil",
    description: "A fast-absorbing, featherlight dry oil formulated with 9 cold-pressed organic botanicals. Enriched with squalane, camellia seed, and rosehip oils for deeply replenished, luminous skin.",
    category: "Beauty",
    price: 3600,
    images: [
      "https://images.unsplash.com/photo-1608248597359-009d17d5c90b?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=1000&q=80"
    ],
    stock: 22,
    specifications: {
      "Volume": "100ml / 3.4 fl oz",
      "Texture": "Non-greasy, satin dry finish",
      "Key Ingredients": "Olive Squalane, Camellia Japonica, Organic Rosehip Seed",
      "Scent": "Natural neroli blossom and sweet orange peel",
      "Formula": "100% vegan, cruelty-free, silicone-free"
    },
    featured: false,
    bestseller: true,
    createdAt: "2026-02-05T09:15:00Z",
    updatedAt: "2026-02-12T16:00:00Z"
  },
  {
    id: "prod-012",
    name: "Artisan Coffee Set",
    description: "A ritualistic morning brewing ensemble consisting of a hand-blown heat-resistant borosilicate glass pour-over dripper, solid American walnut resting ring, and two ribbed ceramic espresso cups.",
    category: "Lifestyle",
    price: 6900,
    originalPrice: 8200,
    discount: 16,
    images: [
      "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=1000&q=80"
    ],
    stock: 10,
    specifications: {
      "Materials": "Borosilicate glass, FSC-certified American walnut, stoneware",
      "Capacity": "Dripper 600ml (serves 2-3 cups)",
      "Cup Capacity": "180ml each",
      "Filter Type": "Compatible with standard cone #2 paper filters",
      "Craftsmanship": "Individually mouth-blown and lathe-turned"
    },
    featured: true,
    bestseller: true,
    createdAt: "2026-02-08T11:20:00Z",
    updatedAt: "2026-02-19T14:10:00Z"
  }
];
