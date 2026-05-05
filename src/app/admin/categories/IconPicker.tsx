"use client";

import { useState, useMemo } from "react";
import type { LucideIcon } from "lucide-react";
import { Search, X, Check,
  Factory, Warehouse, Package, PackageOpen, PackageCheck, Boxes, Box,
  Truck, Ship, Plane, Train, HardHat, Wrench, Hammer, Drill, Cog, Settings, Settings2,
  Zap, Battery, Gauge, Thermometer, CircuitBoard,
  Building, Building2, Landmark, Home, Castle, School,
  Layers, Ruler, PenTool, Pencil, Compass, Map, MapPin, Mountain, Pickaxe,
  Leaf, TreePine, Trees, Flower, Sprout, Sun, Droplets, Wind, Flame, Snowflake, Diamond, Gem,
  Blocks, Shapes, Circle, Square, Triangle,
  Monitor, Laptop, Tablet, Smartphone, Tv, Radio, Wifi, Bluetooth,
  HardDrive, Database, Server, Network, Router, Plug,
  Apple, Cherry, Banana, Carrot, Wheat, UtensilsCrossed, ChefHat, Coffee, Cookie, Fish, Egg,
  FlaskConical, TestTube, Microscope,
  ShieldCheck, Shield, ShieldAlert, HeartPulse, Heart, Activity,
  Stethoscope, Pill, Syringe, Bandage, Cross, Ambulance, Glasses, Eye, Hand,
  Briefcase, BarChart, BarChart2, BarChart3, LineChart, PieChart,
  TrendingUp, TrendingDown, DollarSign, CreditCard, Wallet, Coins, Banknote,
  Receipt, ShoppingCart, Store, Tag, Tags,
  Car, Bus, Bike, Anchor, Navigation, Route, Globe, Globe2,
  ArrowLeftRight, ArrowUpDown, PackageSearch, Scan, QrCode,
  Shirt, Scissors, ShoppingBag, Watch, Crown, Star, Sparkles, Palette, Paintbrush,
  Atom, Biohazard, Dna, Bug,
} from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  Factory, Warehouse, Package, PackageOpen, PackageCheck, Boxes, Box,
  Truck, Ship, Plane, Train, HardHat, Wrench, Hammer, Drill, Cog, Settings, Settings2,
  Zap, Battery, Gauge, Thermometer, CircuitBoard,
  Building, Building2, Landmark, Home, Castle, School,
  Layers, Ruler, PenTool, Pencil, Compass, Map, MapPin, Mountain, Pickaxe,
  Leaf, TreePine, Trees, Flower, Sprout, Sun, Droplets, Wind, Flame, Snowflake, Diamond, Gem,
  Blocks, Shapes, Circle, Square, Triangle,
  Monitor, Laptop, Tablet, Smartphone, Tv, Radio, Wifi, Bluetooth,
  HardDrive, Database, Server, Network, Router, Plug,
  Apple, Cherry, Banana, Carrot, Wheat, UtensilsCrossed, ChefHat, Coffee, Cookie, Fish, Egg,
  FlaskConical, TestTube, Microscope,
  ShieldCheck, Shield, ShieldAlert, HeartPulse, Heart, Activity,
  Stethoscope, Pill, Syringe, Bandage, Cross, Ambulance, Glasses, Eye, Hand,
  Briefcase, BarChart, BarChart2, BarChart3, LineChart, PieChart,
  TrendingUp, TrendingDown, DollarSign, CreditCard, Wallet, Coins, Banknote,
  Receipt, ShoppingCart, Store, Tag, Tags,
  Car, Bus, Bike, Anchor, Navigation, Route, Globe, Globe2,
  ArrowLeftRight, ArrowUpDown, PackageSearch, Scan, QrCode,
  Shirt, Scissors, ShoppingBag, Watch, Crown, Star, Sparkles, Palette, Paintbrush,
  Atom, Biohazard, Dna, Bug,
};

const CATEGORY_ICONS: Record<string, string[]> = {
  "Industry & Trade": [
    "Factory","Warehouse","Package","PackageOpen","PackageCheck","Boxes","Box",
    "Container","Truck","TruckIcon","Ship","Plane","Train","Forklift",
    "HardHat","Wrench","Hammer","Drill","Cog","Settings","Settings2",
    "Bolt","Nut","Cpu","CircuitBoard","Zap","Battery","Gauge","Thermometer",
  ],
  "Construction": [
    "Building","Building2","Landmark","Home","Castle","Church","School",
    "Layers","Ruler","PenTool","Pencil","Compass","Map","MapPin",
    "Mountain","Pickaxe","Shovel","Trowel","Construction",
  ],
  "Nature & Materials": [
    "Leaf","TreePine","Trees","Flower","FlowerIcon","Sprout","Sun","Droplets",
    "Water","Wind","Flame","Snowflake","Diamond","Gem","Crystal",
    "Package","Blocks","Shapes","Circle","Square","Triangle",
  ],
  "Electronics & Tech": [
    "Monitor","MonitorSmartphone","Laptop","Tablet","Smartphone","Tv",
    "Radio","Wifi","Bluetooth","Usb","HardDrive","Database","Server",
    "Network","Router","Chip","Microchip","Cable","Plug","Power",
  ],
  "Food & Agriculture": [
    "Apple","Cherry","Banana","Grape","Carrot","Wheat","Corn","Leaf",
    "UtensilsCrossed","ChefHat","Coffee","Cookie","Beef","Fish","Egg",
    "Milk","FlaskConical","TestTube","Microscope",
  ],
  "Health & Safety": [
    "ShieldCheck","Shield","ShieldAlert","HeartPulse","Heart","Activity",
    "Stethoscope","Pill","Syringe","Bandage","Cross","Ambulance",
    "FireExtinguisher","HardHat","Glasses","Ear","Eye","Hand",
  ],
  "Business & Finance": [
    "Briefcase","BarChart","BarChart2","BarChart3","LineChart","PieChart",
    "TrendingUp","TrendingDown","DollarSign","CircleDollarSign","CreditCard",
    "Wallet","Coins","Banknote","Receipt","ShoppingCart","Store","Tag","Tags",
  ],
  "Logistics & Transport": [
    "Truck","Car","Bus","Bike","Motorcycle","Anchor","Compass","Navigation",
    "MapPin","Map","Route","Globe","Globe2","ArrowLeftRight","ArrowUpDown",
    "PackageSearch","Scan","Barcode","QrCode",
  ],
  "Textiles & Fashion": [
    "Shirt","Scissors","Spool","Ribbon","Tag","Tags","ShoppingBag","Bag",
    "Watch","Ring","Crown","Star","Sparkles","Palette","Paintbrush",
  ],
  "Chemicals & Lab": [
    "FlaskConical","Flask","TestTube","TestTubes","Beaker","Microscope",
    "Atom","Radiation","Biohazard","Pipette","Dna","Bug","Virus",
  ],
};

const ALL_ICONS = Array.from(new Set(Object.values(CATEGORY_ICONS).flat())).filter(n => n in ICON_MAP);

function resolveIcon(name: string): LucideIcon | null {
  return ICON_MAP[name] ?? null;
}

export default function IconPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (name: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [activeGroup, setActiveGroup] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (q) {
      return ALL_ICONS.filter((n) => n.toLowerCase().includes(q));
    }
    if (activeGroup) {
      return CATEGORY_ICONS[activeGroup] ?? [];
    }
    return ALL_ICONS;
  }, [search, activeGroup]);

  const SelectedIcon = value ? resolveIcon(value) : null;

  return (
    <div>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full flex items-center gap-3 px-3 py-2 border border-neutral-200 rounded-lg hover:border-[#FF6A00] transition bg-white text-left"
      >
        {SelectedIcon ? (
          <SelectedIcon className="w-5 h-5 text-[#FF6A00] flex-shrink-0" />
        ) : (
          <div className="w-5 h-5 rounded bg-neutral-100 flex-shrink-0" />
        )}
        <span className={`text-sm flex-1 ${value ? "text-neutral-900" : "text-neutral-400"}`}>
          {value || "Choose an icon..."}
        </span>
        {value && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onChange(""); }}
            className="p-0.5 hover:bg-neutral-100 rounded"
          >
            <X className="w-3.5 h-3.5 text-neutral-400" />
          </button>
        )}
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[85vh]">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
              <h3 className="font-semibold text-neutral-900">Choose Icon</h3>
              <button onClick={() => setOpen(false)} className="p-1.5 hover:bg-neutral-100 rounded-lg transition">
                <X className="w-4 h-4 text-neutral-500" />
              </button>
            </div>

            {/* Search */}
            <div className="px-5 py-3 border-b border-neutral-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setActiveGroup(null); }}
                  placeholder="Search icons..."
                  className="w-full pl-9 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-[#FF6A00]"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
              {/* Category sidebar */}
              {!search && (
                <aside className="w-44 flex-shrink-0 border-r border-neutral-100 overflow-y-auto py-2">
                  <button
                    onClick={() => setActiveGroup(null)}
                    className={`w-full text-left px-4 py-2 text-xs font-medium transition ${
                      !activeGroup ? "text-[#FF6A00] bg-orange-50" : "text-neutral-600 hover:bg-neutral-50"
                    }`}
                  >
                    All Icons
                  </button>
                  {Object.keys(CATEGORY_ICONS).map((g) => (
                    <button
                      key={g}
                      onClick={() => setActiveGroup(g)}
                      className={`w-full text-left px-4 py-2 text-xs font-medium transition ${
                        activeGroup === g ? "text-[#FF6A00] bg-orange-50" : "text-neutral-600 hover:bg-neutral-50"
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </aside>
              )}

              {/* Icon grid */}
              <div className="flex-1 overflow-y-auto p-4">
                {filtered.length === 0 ? (
                  <p className="text-center text-sm text-neutral-400 py-8">No icons found</p>
                ) : (
                  <div className="grid grid-cols-8 gap-1.5">
                    {filtered.map((name) => {
                      const Icon = resolveIcon(name);
                      if (!Icon) return null;
                      const isSelected = value === name;
                      return (
                        <button
                          key={name}
                          type="button"
                          onClick={() => { onChange(name); setOpen(false); setSearch(""); }}
                          title={name}
                          className={`relative flex flex-col items-center justify-center gap-1 p-2 rounded-xl transition group ${
                            isSelected
                              ? "bg-[#FF6A00] text-white"
                              : "hover:bg-orange-50 text-neutral-600 hover:text-[#FF6A00]"
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                          {isSelected && (
                            <span className="absolute top-0.5 right-0.5">
                              <Check className="w-2.5 h-2.5" />
                            </span>
                          )}
                          <span className="text-[9px] leading-tight text-center truncate w-full opacity-60 group-hover:opacity-100">
                            {name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            {value && (
              <div className="px-5 py-3 border-t border-neutral-100 flex items-center gap-3 bg-neutral-50 rounded-b-2xl">
                {SelectedIcon && <SelectedIcon className="w-5 h-5 text-[#FF6A00]" />}
                <span className="text-sm font-medium text-neutral-700">{value}</span>
                <button
                  type="button"
                  onClick={() => { onChange(""); }}
                  className="ml-auto text-xs text-red-500 hover:underline"
                >
                  Clear
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
