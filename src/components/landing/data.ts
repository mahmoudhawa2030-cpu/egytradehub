// Mock data used to render the landing page until Supabase is wired up.
// Mirrors the shape of `src/lib/supabase/types.ts` so swap-in is trivial later.

export type Category = {
  id: string;
  label: string;
  icon: string; // Lucide icon name
  bg: string;   // tailwind bg color class
  fg: string;   // tailwind text color class
};

export const categoryTabs = [
  "All",
  "Electronics",
  "Machinery",
  "Textiles",
  "Chemicals",
  "Safety",
  "Logistics",
  "Healthcare",
] as const;

export const categories: Category[] = [
  { id: "electronics", label: "Electronics", icon: "Monitor",   bg: "bg-orange-50",  fg: "text-orange-700" },
  { id: "machinery",   label: "Machinery",   icon: "Settings",  bg: "bg-blue-50",    fg: "text-blue-700" },
  { id: "textiles",    label: "Textiles",    icon: "Shirt",     bg: "bg-purple-50",  fg: "text-purple-700" },
  { id: "logistics",   label: "Logistics",   icon: "Truck",     bg: "bg-cyan-50",    fg: "text-cyan-800" },
  { id: "healthcare",  label: "Healthcare",  icon: "HeartPulse",bg: "bg-pink-50",    fg: "text-pink-800" },
  { id: "safety",      label: "Safety",      icon: "ShieldCheck",bg:"bg-green-50",   fg: "text-green-800" },
  { id: "chemicals",   label: "Chemicals",   icon: "FlaskConical",bg:"bg-yellow-50", fg: "text-yellow-800" },
  { id: "raw",         label: "Raw Mats",    icon: "Package",   bg: "bg-stone-100",  fg: "text-stone-700" },
  { id: "packaging",   label: "Packaging",   icon: "Layers",    bg: "bg-lime-50",    fg: "text-lime-800" },
  { id: "oem",         label: "OEM/ODM",     icon: "Users",     bg: "bg-indigo-50",  fg: "text-indigo-800" },
];

export type FlashDeal = {
  id: string;
  name: string;
  priceLow: number;
  priceHigh: number;
  moq: number;
  discountPct: number;
  claimedPct: number;
  bg: string;
};

export const flashDeals: FlashDeal[] = [
  { id: "fd-1", name: "Hydraulic pump set industrial", priceLow: 44, priceHigh: 68, moq: 5,  discountPct: 38, claimedPct: 81, bg: "bg-orange-100" },
  { id: "fd-2", name: "Servo motor 400W AC",           priceLow: 56, priceHigh: 80, moq: 10, discountPct: 29, claimedPct: 63, bg: "bg-green-100" },
  { id: "fd-3", name: "HEPA air purifier H13",         priceLow: 7,  priceHigh: 11, moq: 20, discountPct: 41, claimedPct: 92, bg: "bg-blue-100" },
  { id: "fd-4", name: "Industrial LED panel 60W",      priceLow: 12, priceHigh: 22, moq: 30, discountPct: 35, claimedPct: 47, bg: "bg-yellow-100" },
];

export type TrendingProduct = {
  id: string;
  name: string;
  basePrice: number;
  priceLow: number;
  priceHigh: number;
  moq: number;
  supplier: string;
  verified: boolean;
  badge?: { label: string; tone: "hot" | "new" | "deal" };
  bg: string;
};

export const trendingProducts: TrendingProduct[] = [
  { id: "tp-1", name: "Industrial conveyor belt 6m",   basePrice: 220,  priceLow: 220,  priceHigh: 310, moq: 2,  supplier: "MetaTech Corp",   verified: true, badge: { label: "Hot",  tone: "hot"  }, bg: "bg-orange-100" },
  { id: "tp-2", name: "Safety goggle EN 166 pack",     basePrice: 3.2,  priceLow: 3.2,  priceHigh: 5.5, moq: 50, supplier: "GreenRoute Ltd",  verified: true, badge: { label: "New",  tone: "new"  }, bg: "bg-green-100" },
  { id: "tp-3", name: "Pneumatic valve kit 12pc",      basePrice: 18.9, priceLow: 18.9, priceHigh: 27,  moq: 10, supplier: "Prexon Systems",  verified: true, badge: { label: "-25%", tone: "deal" }, bg: "bg-blue-100" },
  { id: "tp-4", name: "Digital pressure sensor 4-20mA",basePrice: 9.2,  priceLow: 9.2,  priceHigh: 15,  moq: 25, supplier: "ZenKit",          verified: true, bg: "bg-purple-100" },
];

export type Supplier = {
  id: string;
  initials: string;
  name: string;
  years: number;
  productCount: number;
  rating: number;
  reviewCount: string;
  tags: string[];
  bg: string;
  fg: string;
};

export const topSuppliers: Supplier[] = [
  { id: "s-1", initials: "AC", name: "Acme Industrial",  years: 12, productCount: 2400, rating: 4.9, reviewCount: "1.2k", tags: ["ISO 9001", "OEM"],     bg: "bg-orange-100", fg: "text-orange-700" },
  { id: "s-2", initials: "PX", name: "Prexon Systems",   years: 8,  productCount: 1800, rating: 4.7, reviewCount: "940",  tags: ["CE", "RoHS"],          bg: "bg-green-100",  fg: "text-green-700" },
  { id: "s-3", initials: "ZK", name: "ZenKit Machinery", years: 5,  productCount: 900,  rating: 4.8, reviewCount: "610",  tags: ["ISO 14001"],            bg: "bg-blue-100",   fg: "text-blue-700" },
  { id: "s-4", initials: "MT", name: "MetaTech Corp",    years: 15, productCount: 3100, rating: 4.6, reviewCount: "2.1k", tags: ["OEM", "ODM"],          bg: "bg-purple-100", fg: "text-purple-700" },
];

export type RecentOrder = {
  id: string;
  description: string;
  amount: number;
  status: "delivered" | "in_transit" | "processing";
};

export const recentOrders: RecentOrder[] = [
  { id: "TH-2024-1102", description: "HEPA 7740 × 200 units",       amount: 1700, status: "delivered" },
  { id: "TH-2024-1089", description: "Safety harness × 50 units",   amount: 1125, status: "in_transit" },
  { id: "TH-2024-1076", description: "Servo motor × 30 units",      amount: 2310, status: "processing" },
];
