import React from 'react';
import { Search, ShoppingBag, Truck, LayoutDashboard, Coffee } from 'lucide-react';

interface StorefrontHeaderProps {
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  cartCount: number;
  onOpenCart: () => void;
  onOpenTracker: () => void;
  onNavigateVendor: () => void;
}

export const CATEGORIES = [
  'ALL',
  'Commercial Espresso Machines',
  'Grinders',
  'Ovens & Dishwashers',
  'Spare Parts',
];

export const StorefrontHeader: React.FC<StorefrontHeaderProps> = ({
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  cartCount,
  onOpenCart,
  onOpenTracker,
  onNavigateVendor,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-alabaster/95 backdrop-blur-md border-b border-espresso/10 transition-all">
      {/* Top Banner Bar */}
      <div className="bg-espresso text-alabaster text-xs py-1.5 px-4 flex justify-between items-center tracking-wider font-display uppercase">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-sage animate-pulse"></span>
          <span>Ex-UK Commercial Grade Stock • Fully Certified & Descaled</span>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={onNavigateVendor}
            className="flex items-center gap-1.5 text-brass hover:text-brass-light transition-colors font-semibold"
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Retailer Portal</span>
          </button>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div 
          onClick={() => onSelectCategory('ALL')}
          className="cursor-pointer flex items-center gap-2.5 group"
        >
          <div className="w-10 h-10 rounded-sm bg-espresso flex items-center justify-center text-brass shadow-sm group-hover:scale-105 transition-transform">
            <Coffee className="w-6 h-6 stroke-[1.75]" />
          </div>
          <div>
            <h1 className="font-serif text-2xl font-bold tracking-tight text-espresso leading-none">
              DAWA EQUIPS
            </h1>
            <p className="text-[10px] uppercase font-display tracking-widest text-espresso/60 font-semibold mt-0.5">
              Refurbished Commercial Appliances
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-espresso/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search espresso machines, grinders, spare parts..."
              className="w-full pl-9 pr-4 py-2 bg-white/70 border border-espresso/15 rounded-full text-sm text-espresso placeholder:text-espresso/40 focus:outline-none focus:ring-2 focus:ring-brass/50 focus:border-brass transition-all"
            />
          </div>
        </div>

        {/* Actions: Track Order & Cart */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenTracker}
            className="flex items-center gap-2 px-3.5 py-2 rounded-full border border-espresso/20 text-xs font-display uppercase tracking-wider text-espresso hover:border-brass hover:text-espresso-950 hover:bg-brass/10 transition-all font-semibold"
            title="Track existing orders using your phone number"
          >
            <Truck className="w-4 h-4 text-sage-dark" />
            <span className="hidden sm:inline">Track Order</span>
          </button>

          <button
            onClick={onOpenCart}
            className="relative flex items-center gap-2 px-4 py-2 rounded-full bg-espresso text-alabaster text-xs font-display uppercase tracking-wider hover:bg-espresso-800 transition-all font-semibold shadow-sm group"
          >
            <ShoppingBag className="w-4 h-4 text-brass group-hover:scale-110 transition-transform" />
            <span>Cart</span>
            {cartCount > 0 && (
              <span className="w-5 h-5 flex items-center justify-center rounded-full bg-brass text-espresso-950 text-[11px] font-bold">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Category Pills Navigation */}
      <div className="border-t border-espresso/10 bg-alabaster/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 overflow-x-auto scrollbar-none flex items-center gap-2">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => onSelectCategory(cat)}
                className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-[11px] font-display uppercase tracking-wider transition-all font-semibold ${
                  isSelected
                    ? 'bg-brass text-espresso-950 shadow-sm font-bold'
                    : 'text-espresso/70 hover:text-espresso hover:bg-espresso/5'
                }`}
              >
                {cat === 'ALL' ? 'All Inventory' : cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile Search Bar */}
      <div className="md:hidden px-4 py-2 border-t border-espresso/10 bg-white/40">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-espresso/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search catalog..."
            className="w-full pl-9 pr-3 py-1.5 bg-white border border-espresso/15 rounded-full text-xs text-espresso focus:outline-none focus:ring-2 focus:ring-brass"
          />
        </div>
      </div>
    </header>
  );
};
