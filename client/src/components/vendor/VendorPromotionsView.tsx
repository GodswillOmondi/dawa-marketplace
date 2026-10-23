import React, { useState } from 'react';
import { Product, Promotion, createPromotion } from '../../lib/api';
import { formatPrice } from '../../lib/utils';
import { Flame, Sparkles, Send, CheckCircle2, AlertCircle, LayoutTemplate } from 'lucide-react';

interface VendorPromotionsViewProps {
  products: Product[];
  promotions: Promotion[];
  onRefresh: () => void;
}

const BANNER_TEMPLATES = [
  {
    id: 'espresso-gold',
    name: 'Espresso Gold Flash Sale',
    bg: 'bg-gradient-to-r from-espresso-950 via-espresso to-[#2C1D1B]',
    text: 'text-alabaster',
    accent: 'text-brass',
    desc: 'Deep roasted espresso background with metallic brushed brass typography.',
  },
  {
    id: 'sage-editorial',
    name: 'Sage Editorial Seasonal Deal',
    bg: 'bg-gradient-to-r from-[#8E9F7C] via-[#9CAF88] to-[#6E805B]',
    text: 'text-espresso-950',
    accent: 'text-alabaster',
    desc: 'Warm muted sage green gradient tailored for commercial roastery partnerships.',
  },
  {
    id: 'brass-spotlight',
    name: 'Brushed Brass Spotlight',
    bg: 'bg-gradient-to-r from-[#D4AF37] via-[#E5C564] to-[#B28E22]',
    text: 'text-espresso-950',
    accent: 'text-espresso',
    desc: 'High-contrast metallic hero banner designed for urgent inventory liquidation.',
  },
];

export const VendorPromotionsView: React.FC<VendorPromotionsViewProps> = ({
  products,
  promotions,
  onRefresh,
}) => {
  const [selectedProductId, setSelectedProductId] = useState<number>(
    products[0]?.id || 0
  );
  const [title, setTitle] = useState('FLASH SALE: 15% OFF CERTIFIED ESPRESSO WORKHORSE');
  const [subtitle, setSubtitle] = useState('Certified Ex-UK Refurbished • Fully Tested to 9-Bar Pressure');
  const [promoType, setPromoType] = useState<'FLASH_SALE' | 'SEASONAL_DEAL'>('FLASH_SALE');
  const [templateId, setTemplateId] = useState('espresso-gold');
  const [promoPrice, setPromoPrice] = useState<number | ''>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedProd = products.find((p) => p.id === selectedProductId);

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || promoPrice === '' || !title.trim()) {
      setError('Please select a product and enter the promotional price.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccessMsg(null);

    try {
      await createPromotion({
        title,
        subtitle,
        promoType,
        templateId,
        productId: selectedProductId,
        promoPrice: Number(promoPrice),
      });

      setSuccessMsg('Promotion banner published and broadcast live to storefront via Server-Sent Events!');
      onRefresh();
    } catch (err: any) {
      setError(err.message || 'Failed to publish promotion');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-serif text-2xl font-bold text-espresso">
          Promotions & Live Banner Builder
        </h2>
        <p className="text-xs text-espresso/60 mt-0.5">
          Publish instant Flash Sale or Seasonal Deal banners. Changes broadcast live over SSE to all open storefront tabs without reloading.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form: Configure Banner */}
        <form onSubmit={handlePublish} className="lg:col-span-7 bg-white p-6 sm:p-7 rounded-2xl border border-espresso/15 shadow-sm space-y-5">
          <h3 className="font-serif text-lg font-bold text-espresso border-b border-espresso/10 pb-3 flex items-center gap-2">
            <LayoutTemplate className="w-5 h-5 text-brass" />
            <span>Create Promotional Campaign</span>
          </h3>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-800">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-sage/20 border border-sage/40 rounded-xl flex items-center gap-2 text-xs text-sage-dark font-semibold">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Target Product */}
          <div>
            <label className="block text-xs font-display uppercase tracking-wider font-bold text-espresso/80 mb-1">
              Select Commercial Appliance from Inventory:
            </label>
            <select
              value={selectedProductId}
              onChange={(e) => {
                const id = Number(e.target.value);
                setSelectedProductId(id);
                const p = products.find((prod) => prod.id === id);
                if (p) {
                  setPromoPrice(Math.round(p.price * 0.85)); // Default 15% discount
                }
              }}
              className="w-full px-3.5 py-2.5 text-xs bg-alabaster/40 border border-espresso/20 rounded-xl text-espresso focus:outline-none focus:ring-2 focus:ring-brass"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (Current: {formatPrice(p.price)} • Stock: {p.stock})
                </option>
              ))}
            </select>
          </div>

          {/* Promo Type & Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-display uppercase tracking-wider font-bold text-espresso/80 mb-1">
                Promotion Type:
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPromoType('FLASH_SALE')}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-display uppercase tracking-wider font-bold flex items-center justify-center gap-1.5 border transition-all ${
                    promoType === 'FLASH_SALE'
                      ? 'bg-brass text-espresso-950 border-brass shadow-sm'
                      : 'bg-alabaster text-espresso/70 border-espresso/15'
                  }`}
                >
                  <Flame className="w-3.5 h-3.5" />
                  <span>Flash Sale</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPromoType('SEASONAL_DEAL')}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-display uppercase tracking-wider font-bold flex items-center justify-center gap-1.5 border transition-all ${
                    promoType === 'SEASONAL_DEAL'
                      ? 'bg-espresso text-alabaster border-espresso shadow-sm'
                      : 'bg-alabaster text-espresso/70 border-espresso/15'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Seasonal Deal</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-display uppercase tracking-wider font-bold text-espresso/80 mb-1">
                New Promotional Price (KES) *:
              </label>
              <input
                type="number"
                required
                value={promoPrice}
                onChange={(e) => setPromoPrice(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="320000"
                className="w-full px-3.5 py-2 text-xs bg-alabaster/40 border border-espresso/20 rounded-xl text-espresso font-mono font-bold focus:outline-none focus:ring-2 focus:ring-brass"
              />
              {selectedProd && promoPrice !== '' && (
                <span className="text-[10px] text-espresso/60 mt-0.5 block">
                  Original price {formatPrice(selectedProd.price)} will be stored as Initial Price.
                </span>
              )}
            </div>
          </div>

          {/* Headline & Subtitle */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-display uppercase tracking-wider font-bold text-espresso/80 mb-1">
                Banner Headline:
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-alabaster/40 border border-espresso/20 rounded-xl text-espresso focus:outline-none focus:ring-2 focus:ring-brass font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-display uppercase tracking-wider font-bold text-espresso/80 mb-1">
                Subtitle / Trust Callout:
              </label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-alabaster/40 border border-espresso/20 rounded-xl text-espresso focus:outline-none focus:ring-2 focus:ring-brass"
              />
            </div>
          </div>

          {/* Banner Design Templates */}
          <div>
            <label className="block text-xs font-display uppercase tracking-wider font-bold text-espresso/80 mb-2">
              Select Editorial Design Template:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {BANNER_TEMPLATES.map((tmpl) => (
                <div
                  key={tmpl.id}
                  onClick={() => setTemplateId(tmpl.id)}
                  className={`cursor-pointer p-3 rounded-xl border transition-all ${
                    templateId === tmpl.id
                      ? 'border-brass shadow-md bg-brass/5 ring-2 ring-brass/40'
                      : 'border-espresso/15 bg-white hover:border-espresso/40'
                  }`}
                >
                  <div className={`h-6 rounded-md mb-2 ${tmpl.bg}`} />
                  <p className="font-display uppercase tracking-wider text-[11px] font-bold text-espresso truncate">
                    {tmpl.name}
                  </p>
                  <p className="text-[10px] text-espresso/50 mt-1 line-clamp-2">{tmpl.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-6 rounded-full bg-brass hover:bg-brass-light text-espresso-950 font-display text-xs uppercase tracking-wider font-bold transition-all shadow-md flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span>{isSubmitting ? 'Broadcasting Banner...' : 'Publish & Broadcast Live to Storefront (SSE)'}</span>
          </button>
        </form>

        {/* Right Preview: Live Active Promotions */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="font-serif text-lg font-bold text-espresso">
            Active Storefront Promotions ({promotions.length})
          </h3>

          <div className="space-y-4">
            {promotions.map((promo) => (
              <div
                key={promo.id}
                className="p-5 rounded-2xl border border-espresso/15 bg-white shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-display uppercase font-bold tracking-wider bg-brass text-espresso-950">
                    {promo.promoType}
                  </span>
                  <span className="text-xs font-mono font-bold text-brass-dark">
                    {formatPrice(promo.promoPrice)}
                  </span>
                </div>

                <div>
                  <h4 className="font-serif text-base font-bold text-espresso">{promo.title}</h4>
                  {promo.subtitle && (
                    <p className="text-xs text-espresso/70 mt-1">{promo.subtitle}</p>
                  )}
                </div>

                {promo.product && (
                  <div className="flex items-center gap-2.5 p-2 bg-alabaster rounded-lg border border-espresso/10 text-xs">
                    {promo.product.images?.[0] && (
                      <img
                        src={promo.product.images[0]}
                        alt={promo.product.name}
                        className="w-10 h-10 object-cover rounded"
                      />
                    )}
                    <div className="min-w-0">
                      <p className="font-semibold text-espresso truncate">{promo.product.name}</p>
                      <p className="text-[10px] text-espresso/60">{promo.product.brand}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
