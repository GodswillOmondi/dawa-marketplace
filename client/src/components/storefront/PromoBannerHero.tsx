import React, { useState, useEffect } from 'react';
import { Promotion } from '../../lib/api';
import { formatPrice, calculateDiscount } from '../../lib/utils';
import { Flame, Sparkles, ChevronRight, Clock, ShieldCheck } from 'lucide-react';

interface PromoBannerHeroProps {
  promotions: Promotion[];
  onSelectProduct: (productId: number) => void;
}

export const PromoBannerHero: React.FC<PromoBannerHeroProps> = ({
  promotions,
  onSelectProduct,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (promotions.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % promotions.length);
    }, 6500);
    return () => clearInterval(interval);
  }, [promotions.length]);

  if (!promotions || promotions.length === 0) {
    return null;
  }

  const promo = promotions[currentIndex];
  const prod = promo.product;
  const discount = prod ? calculateDiscount(promo.promoPrice, prod.initialPrice) : null;

  return (
    <section className="relative overflow-hidden my-4 sm:my-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div 
        className={`relative rounded-2xl overflow-hidden border transition-all duration-700 shadow-sm ${
          promo.templateId === 'sage-editorial'
            ? 'bg-gradient-to-r from-[#8E9F7C] via-[#9CAF88] to-[#6E805B] text-espresso-950 border-sage-dark/30'
            : 'bg-gradient-to-r from-espresso-950 via-espresso to-[#2C1D1B] text-alabaster border-brass/30'
        }`}
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-6 p-6 sm:p-10">
          {/* Text Content */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-display uppercase tracking-widest font-bold ${
                promo.promoType === 'FLASH_SALE'
                  ? 'bg-brass text-espresso-950 shadow-sm'
                  : 'bg-alabaster/90 text-espresso shadow-sm'
              }`}>
                {promo.promoType === 'FLASH_SALE' ? (
                  <>
                    <Flame className="w-3.5 h-3.5 fill-current animate-bounce" />
                    <span>Flash Deal</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-brass fill-current" />
                    <span>Seasonal Spotlight</span>
                  </>
                )}
              </span>

              <span className="flex items-center gap-1 text-[11px] font-display uppercase tracking-wider opacity-80">
                <Clock className="w-3 h-3" /> Limited Verified Stock
              </span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.1]">
              {promo.title}
            </h2>

            {promo.subtitle && (
              <p className="text-sm sm:text-base font-sans opacity-90 max-w-xl leading-relaxed">
                {promo.subtitle}
              </p>
            )}

            {/* Price Callout */}
            <div className="flex flex-wrap items-baseline gap-3 pt-2">
              <span className="text-2xl sm:text-3xl font-display font-bold text-brass">
                {formatPrice(promo.promoPrice)}
              </span>
              {prod?.initialPrice && prod.initialPrice > promo.promoPrice && (
                <span className="text-sm line-through opacity-60">
                  {formatPrice(prod.initialPrice)}
                </span>
              )}
              {discount && (
                <span className="px-2 py-0.5 rounded text-xs font-display font-bold bg-brass/20 text-brass border border-brass/40">
                  Save {discount}%
                </span>
              )}
            </div>

            {/* Action CTA */}
            <div className="pt-2 flex items-center gap-4">
              <button
                onClick={() => onSelectProduct(promo.productId)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-brass hover:bg-brass-light text-espresso-950 font-display text-xs uppercase tracking-wider font-bold transition-transform hover:scale-[1.02] shadow-md group"
              >
                <span>Inspect Machine & Specs</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <div className="hidden sm:flex items-center gap-1.5 text-xs opacity-75 font-sans">
                <ShieldCheck className="w-4 h-4 text-brass" />
                <span>9-Bar Certified Warranty</span>
              </div>
            </div>
          </div>

          {/* Product Thumbnail Gallery Graphic */}
          <div className="lg:col-span-5 flex justify-center">
            {prod && prod.images && prod.images.length > 0 ? (
              <div 
                onClick={() => onSelectProduct(promo.productId)}
                className="cursor-pointer group relative w-full max-w-sm aspect-[4/3] rounded-xl overflow-hidden border border-white/10 shadow-2xl bg-espresso-900"
              >
                <img
                  src={prod.images[0]}
                  alt={prod.name}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <p className="text-xs font-display uppercase tracking-wider text-brass font-bold">{prod.brand}</p>
                  <p className="text-sm font-semibold truncate">{prod.name}</p>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* Slide Indicators */}
        {promotions.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
            {promotions.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-1.5 rounded-full transition-all ${
                  idx === currentIndex ? 'w-6 bg-brass' : 'w-2 bg-white/40 hover:bg-white/70'
                }`}
                aria-label={`Go to promo slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
