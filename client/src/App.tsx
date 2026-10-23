import React, { useState, useEffect, useMemo } from 'react';
import { fetchProducts, fetchPromotions, Product, Promotion, useSSE } from './lib/api';
import { StorefrontHeader, CATEGORIES } from './components/storefront/StorefrontHeader';
import { PromoBannerHero } from './components/storefront/PromoBannerHero';
import { ProductCard } from './components/storefront/ProductCard';
import { ProductDetailModal } from './components/storefront/ProductDetailModal';
import { CartCheckoutDrawer, CartItem } from './components/storefront/CartCheckoutDrawer';
import { OrderTrackerModal } from './components/storefront/OrderTrackerModal';
import { SlidersHorizontal, RotateCcw, ShieldCheck, Check, Sparkles, AlertCircle } from 'lucide-react';
import { VendorLayout } from './components/vendor/VendorLayout';

export function App() {
  // Navigation / View state
  const [isVendorView, setIsVendorView] = useState<boolean>(() => {
    return (
      window.location.hostname.startsWith('vendor.') ||
      window.location.pathname.startsWith('/vendor') ||
      window.location.hash === '#vendor'
    );
  });

  // Catalog State
  const [products, setProducts] = useState<Product[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Filters State
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedBrand, setSelectedBrand] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [priceRange, setPriceRange] = useState<number>(1000000); // Up to 1M KES

  // Modals & Drawers
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isTrackerOpen, setIsTrackerOpen] = useState(false);

  // Cart State (Persisted in localStorage)
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('dawa_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('dawa_cart', JSON.stringify(cart));
    } catch (err) {
      console.warn('Failed to save cart to localStorage:', err);
    }
  }, [cart]);

  // Load Data
  const loadCatalogData = async () => {
    try {
      setIsLoading(true);
      setLoadError(null);
      const [prods, promos] = await Promise.all([
        fetchProducts(),
        fetchPromotions(true),
      ]);
      setProducts(prods);
      setPromotions(promos);
    } catch (err: any) {
      console.error('Failed to load initial catalog:', err);
      setLoadError(err.message || 'Failed to connect to Dawa Equips API server.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCatalogData();
  }, []);

  // Listen to Server-Sent Events (SSE) for instant promo updates & stock changes
  useSSE((event, data) => {
    console.log(`📡 SSE Event received: ${event}`, data);
    if (event === 'promo:updated' || event === 'product:updated' || event === 'stock:updated') {
      loadCatalogData();
    }
  });

  // Extract unique brands for filter dropdown
  const uniqueBrands = useMemo(() => {
    const brands = new Set<string>();
    products.forEach((p) => {
      if (p.brand) brands.add(p.brand);
    });
    return Array.from(brands);
  }, [products]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // In buyer storefront, exclude PENDING_IMAGES items (requires 3+ photos)
      if (p.status === 'PENDING_IMAGES') return false;

      // Category filter
      if (selectedCategory !== 'ALL' && p.category !== selectedCategory) {
        return false;
      }

      // Brand filter
      if (selectedBrand !== 'ALL' && p.brand !== selectedBrand) {
        return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesBrand = p.brand.toLowerCase().includes(q);
        const matchesCategory = p.category.toLowerCase().includes(q);
        const matchesDesc = p.description.toLowerCase().includes(q);
        if (!matchesName && !matchesBrand && !matchesCategory && !matchesDesc) {
          return false;
        }
      }

      // Price filter
      if (p.price > priceRange) {
        return false;
      }

      return true;
    });
  }, [products, selectedCategory, selectedBrand, searchQuery, priceRange]);

  // Cart operations
  const handleAddToCart = (product: Product, variantName?: string, qty = 1) => {
    const currentVariant = product.variants?.find((v) => v.name === variantName);
    const unitPrice = currentVariant?.price ?? product.price;

    setCart((prev) => {
      const existingIdx = prev.findIndex(
        (it) => it.productId === product.id && it.variant === (variantName || undefined)
      );
      if (existingIdx >= 0) {
        const copy = [...prev];
        copy[existingIdx].quantity += qty;
        return copy;
      }
      return [
        ...prev,
        {
          productId: product.id,
          productName: product.name,
          variant: variantName,
          quantity: qty,
          unitPrice,
          image: product.images?.[0],
        },
      ];
    });

    setIsCartOpen(true);
  };

  const handleUpdateCartQuantity = (index: number, quantity: number) => {
    setCart((prev) => {
      const copy = [...prev];
      copy[index].quantity = quantity;
      return copy;
    });
  };

  const handleRemoveCartItem = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const handleResetFilters = () => {
    setSelectedCategory('ALL');
    setSelectedBrand('ALL');
    setSearchQuery('');
    setPriceRange(1000000);
  };

  const totalCartCount = cart.reduce((sum, it) => sum + it.quantity, 0);

  // If in Vendor Portal Mode, render VendorLayout
  if (isVendorView) {
    return (
      <VendorLayout
        onSwitchToStorefront={() => {
          setIsVendorView(false);
          window.history.pushState({}, '', '/');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-alabaster text-espresso font-sans flex flex-col selection:bg-brass selection:text-espresso-950">
      {/* View Switcher Floating Pill */}
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => {
            setIsVendorView(true);
            window.history.pushState({}, '', '/vendor');
          }}
          className="px-4 py-2.5 rounded-full bg-espresso text-alabaster border border-brass/40 shadow-xl hover:bg-espresso-800 transition-all font-display text-xs uppercase tracking-wider font-bold flex items-center gap-2 group hover:scale-105"
        >
          <span className="w-2 h-2 rounded-full bg-brass animate-pulse"></span>
          <span>Open Retailer Portal</span>
        </button>
      </div>

      {/* Storefront Top Navigation */}
      <StorefrontHeader
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenTracker={() => setIsTrackerOpen(true)}
        onNavigateVendor={() => {
          setIsVendorView(true);
          window.history.pushState({}, '', '/vendor');
        }}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pb-16">
        {/* Active Flash Sale / Seasonal Deal Hero Banner */}
        <PromoBannerHero
          promotions={promotions}
          onSelectProduct={(productId) => {
            const found = products.find((p) => p.id === productId);
            if (found) setSelectedProduct(found);
          }}
        />

        {/* Catalog Control Header */}
        <div className="my-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-espresso/10 pb-4">
          <div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-espresso">
              {selectedCategory === 'ALL' ? 'All Refurbished Appliances' : selectedCategory}
            </h2>
            <p className="text-xs text-espresso/60 mt-0.5">
              Showing {filteredProducts.length} verified commercial units (minimum 3 inspection photos each)
            </p>
          </div>

          {/* Quick Filter Controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Brand Selector */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-espresso/60 font-semibold font-display uppercase tracking-wider">Brand:</span>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="bg-white border border-espresso/20 rounded-lg px-2.5 py-1.5 text-xs text-espresso focus:outline-none focus:ring-2 focus:ring-brass"
              >
                <option value="ALL">All Brands</option>
                {uniqueBrands.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            {(selectedCategory !== 'ALL' || selectedBrand !== 'ALL' || searchQuery) && (
              <button
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1 text-xs text-brass-dark hover:underline font-semibold"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>
        </div>

        {/* Loading / Error States */}
        {isLoading && (
          <div className="py-24 text-center space-y-3">
            <div className="w-10 h-10 border-4 border-brass border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="font-serif text-lg text-espresso/70">Connecting to Dawa Equips catalog...</p>
          </div>
        )}

        {loadError && (
          <div className="my-8 p-6 bg-red-50 border border-red-200 rounded-2xl text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-red-700 mx-auto" />
            <p className="font-serif text-lg text-red-900 font-bold">Catalog Unavailable</p>
            <p className="text-xs text-red-700 max-w-md mx-auto">{loadError}</p>
            <button
              onClick={loadCatalogData}
              className="px-6 py-2 rounded-full bg-espresso text-alabaster text-xs font-display uppercase tracking-wider font-bold"
            >
              Retry Connection
            </button>
          </div>
        )}

        {/* Products Grid */}
        {!isLoading && !loadError && (
          <>
            {filteredProducts.length === 0 ? (
              <div className="py-20 text-center space-y-4 bg-white/50 rounded-2xl border border-espresso/10 p-8">
                <Sparkles className="w-10 h-10 text-espresso/20 mx-auto" />
                <h3 className="font-serif text-xl font-bold text-espresso">No commercial appliances match your filter.</h3>
                <p className="text-xs text-espresso/60 max-w-sm mx-auto">
                  Try clearing your search query or selecting a different category to view available refurbished inventory.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-6 py-2.5 rounded-full bg-brass text-espresso-950 font-display text-xs uppercase tracking-wider font-bold shadow-sm"
                >
                  Show All Inventory
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onSelect={(p) => setSelectedProduct(p)}
                    onAddToCart={(p, e) => {
                      e.stopPropagation();
                      handleAddToCart(p);
                    }}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* Storefront Footer */}
      <footer className="mt-auto bg-espresso text-alabaster border-t border-espresso-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8 text-xs font-sans">
          <div className="space-y-2">
            <h4 className="font-serif text-lg font-bold text-brass">DAWA EQUIPS</h4>
            <p className="text-alabaster/70 leading-relaxed">
              Specialist supplier of certified refurbished commercial espresso machines, industrial coffee grinders, and catering appliances across Kenya and East Africa.
            </p>
          </div>

          <div className="space-y-2">
            <h5 className="font-display uppercase tracking-wider font-bold text-brass text-[11px]">Quality Guarantee</h5>
            <p className="text-alabaster/70 leading-relaxed">
              Every unit undergoes a comprehensive 9-point technical overhaul: complete boiler decalcification, replacement of seals with OEM silicone gaskets, rotary pump recalibration, and live heating tests.
            </p>
          </div>

          <div className="space-y-2">
            <h5 className="font-display uppercase tracking-wider font-bold text-brass text-[11px]">Inspection & Delivery</h5>
            <p className="text-alabaster/70 leading-relaxed">
              Transparent Invoice-First ordering. We arrange direct site delivery and mechanical demonstration before payment settlement.
            </p>
          </div>
        </div>
      </footer>

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={(p, variant, qty) => handleAddToCart(p, variant, qty)}
      />

      {/* Cart & Checkout Drawer */}
      <CartCheckoutDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
      />

      {/* Order Tracker Modal */}
      <OrderTrackerModal
        isOpen={isTrackerOpen}
        onClose={() => setIsTrackerOpen(false)}
      />
    </div>
  );
}
export default App;
