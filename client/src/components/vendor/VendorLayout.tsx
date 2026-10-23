import React, { useState, useEffect } from 'react';
import { fetchProducts, fetchPromotions, Product, Promotion } from '../../lib/api';
import { VendorProductsView } from './VendorProductsView';
import { VendorPromotionsView } from './VendorPromotionsView';
import { VendorOrdersView } from './VendorOrdersView';
import { VendorInvoicesView } from './VendorInvoicesView';
import { Package, Flame, ShoppingCart, FileText, ArrowLeft, AlertTriangle, Coffee } from 'lucide-react';

interface VendorLayoutProps {
  onSwitchToStorefront: () => void;
}

export const VendorLayout: React.FC<VendorLayoutProps> = ({ onSwitchToStorefront }) => {
  const [currentTab, setCurrentTab] = useState<'orders' | 'products' | 'promotions' | 'invoices'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadVendorData = async () => {
    try {
      setIsLoading(true);
      const [prods, promos] = await Promise.all([
        fetchProducts(), // Vendor sees all products including PENDING_IMAGES & OUT_OF_STOCK
        fetchPromotions(false),
      ]);
      setProducts(prods);
      setPromotions(promos);
    } catch (err) {
      console.error('Failed to load vendor data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadVendorData();
  }, []);

  // Check for zero-stock alerts
  const outOfStockProducts = products.filter((p) => p.stock <= 0 || p.status === 'OUT_OF_STOCK');

  return (
    <div className="min-h-screen bg-alabaster flex text-espresso font-sans selection:bg-brass selection:text-espresso-950">
      {/* Left Sidebar */}
      <aside className="w-64 bg-espresso text-alabaster border-r border-espresso-800 flex flex-col justify-between shrink-0 hidden md:flex">
        <div>
          {/* Brand Logo & Portal Header */}
          <div className="p-6 border-b border-espresso-800 flex items-center gap-3">
            <div className="w-9 h-9 rounded-sm bg-brass text-espresso-950 flex items-center justify-center font-bold">
              <Coffee className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-serif text-lg font-bold tracking-tight text-alabaster leading-none">
                DAWA EQUIPS
              </h1>
              <p className="text-[10px] font-display uppercase tracking-widest text-brass mt-1 font-semibold">
                Retailer Portal
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="p-4 space-y-1.5 font-display uppercase text-xs tracking-wider">
            <button
              onClick={() => setCurrentTab('orders')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold ${
                currentTab === 'orders'
                  ? 'bg-brass text-espresso-950 font-bold shadow-sm'
                  : 'text-alabaster/70 hover:text-alabaster hover:bg-espresso-800'
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Orders</span>
            </button>

            <button
              onClick={() => setCurrentTab('products')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all font-semibold ${
                currentTab === 'products'
                  ? 'bg-brass text-espresso-950 font-bold shadow-sm'
                  : 'text-alabaster/70 hover:text-alabaster hover:bg-espresso-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <Package className="w-4 h-4" />
                <span>Products</span>
              </div>
              {outOfStockProducts.length > 0 && (
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-red-600 text-white font-mono">
                  {outOfStockProducts.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setCurrentTab('promotions')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold ${
                currentTab === 'promotions'
                  ? 'bg-brass text-espresso-950 font-bold shadow-sm'
                  : 'text-alabaster/70 hover:text-alabaster hover:bg-espresso-800'
              }`}
            >
              <Flame className="w-4 h-4" />
              <span>Promotions</span>
            </button>

            <button
              onClick={() => setCurrentTab('invoices')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold ${
                currentTab === 'invoices'
                  ? 'bg-brass text-espresso-950 font-bold shadow-sm'
                  : 'text-alabaster/70 hover:text-alabaster hover:bg-espresso-800'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Invoices</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer with Out of Stock Indicator & Return CTA */}
        <div className="p-4 border-t border-espresso-800 space-y-3">
          {outOfStockProducts.length > 0 && (
            <div className="p-3 bg-red-950/60 border border-red-800/60 rounded-xl flex items-center gap-2 text-xs text-red-200">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              <div className="text-[11px] leading-tight">
                <p className="font-bold">{outOfStockProducts.length} Appliance{outOfStockProducts.length > 1 ? 's' : ''} at 0 Stock</p>
                <p className="text-red-300/70">Needs replenishment</p>
              </div>
            </div>
          )}

          <button
            onClick={onSwitchToStorefront}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-full border border-brass/40 text-brass hover:bg-brass/10 transition-all font-display text-xs uppercase tracking-wider font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Storefront View</span>
          </button>
        </div>
      </aside>

      {/* Main Vendor Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar for Mobile & Quick Status */}
        <header className="bg-white border-b border-espresso/10 p-4 flex items-center justify-between md:hidden">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-espresso text-brass flex items-center justify-center">
              <Coffee className="w-4 h-4" />
            </div>
            <span className="font-serif font-bold text-sm text-espresso">Retailer Portal</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onSwitchToStorefront}
              className="text-xs font-display uppercase tracking-wider text-brass-dark font-bold flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Storefront
            </button>
          </div>
        </header>

        {/* Mobile Tab Pills */}
        <div className="flex md:hidden bg-alabaster border-b border-espresso/10 px-4 py-2 overflow-x-auto gap-2 text-xs font-display uppercase font-bold">
          {(['orders', 'products', 'promotions', 'invoices'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setCurrentTab(t)}
              className={`px-3 py-1.5 rounded-full whitespace-nowrap ${
                currentTab === t ? 'bg-brass text-espresso-950 font-bold' : 'text-espresso/60'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Out-of-Stock Alert Banner if any appliance hit 0 stock */}
        {outOfStockProducts.length > 0 && (
          <div className="bg-red-50 border-b border-red-200 px-6 py-2.5 flex items-center justify-between text-xs text-red-900">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-700 shrink-0" />
              <span>
                <strong>Inventory Notice:</strong> {outOfStockProducts.map((p) => p.name).join(', ')} currently reached 0 stock and is disabled on the buyer storefront.
              </span>
            </div>
            <button
              onClick={() => setCurrentTab('products')}
              className="underline font-bold text-[11px] shrink-0 ml-4 hover:text-red-950"
            >
              Update Stock in Products
            </button>
          </div>
        )}

        {/* Dynamic Tab Body */}
        <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto overflow-y-auto">
          {currentTab === 'products' && (
            <VendorProductsView products={products} onRefresh={loadVendorData} />
          )}
          {currentTab === 'promotions' && (
            <VendorPromotionsView
              products={products}
              promotions={promotions}
              onRefresh={loadVendorData}
            />
          )}
          {currentTab === 'orders' && (
            <VendorOrdersView onRefresh={loadVendorData} />
          )}
          {currentTab === 'invoices' && (
            <VendorInvoicesView />
          )}
        </main>
      </div>
    </div>
  );
};
