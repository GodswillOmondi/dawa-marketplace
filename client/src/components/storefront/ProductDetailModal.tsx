import React, { useState, useEffect } from 'react';
import { Product } from '../../lib/api';
import { formatPrice, calculateDiscount } from '../../lib/utils';
import { X, Star, CheckCircle2, AlertCircle, ShoppingBag, ShieldCheck, Wrench, Sparkles, Layers } from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, variantName?: string, quantity?: number) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart,
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<string>('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (product) {
      setActiveImageIndex(0);
      setQuantity(1);
      if (product.variants && product.variants.length > 0) {
        setSelectedVariant(product.variants[0].name);
      } else {
        setSelectedVariant('');
      }
    }
  }, [product]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!product) return null;

  const isOutOfStock = product.stock <= 0 || product.status === 'OUT_OF_STOCK';
  const discount = calculateDiscount(product.price, product.initialPrice);
  const images = product.images && product.images.length > 0
    ? product.images
    : ['https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=900&q=80'];

  // Current variant price if defined
  const currentVariantObj = product.variants?.find(v => v.name === selectedVariant);
  const effectivePrice = currentVariantObj?.price ?? product.price;

  const handleAdd = () => {
    if (isOutOfStock) return;
    onAddToCart(product, selectedVariant || undefined, quantity);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-espresso-950/70 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl bg-alabaster rounded-2xl shadow-2xl border border-espresso/20 overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
        style={{ overscrollBehavior: 'contain' }}
      >
        {/* Header Close Bar */}
        <div className="absolute top-4 right-4 z-20">
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/80 hover:bg-white text-espresso flex items-center justify-center shadow-md transition-all hover:scale-105"
            aria-label="Close product details"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 max-h-[90vh] overflow-y-auto">
          {/* Left Column: 3+ Image Gallery */}
          <div className="md:col-span-6 p-6 sm:p-8 bg-espresso-50/60 border-b md:border-b-0 md:border-r border-espresso/10 flex flex-col gap-4">
            {/* Primary Large Image */}
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-espresso-900 border border-espresso/15 shadow-sm">
              <img
                src={images[activeImageIndex]}
                alt={`${product.name} view ${activeImageIndex + 1}`}
                className="w-full h-full object-cover object-center transition-all duration-300"
              />
              <div className="absolute bottom-2.5 left-2.5 bg-espresso/80 text-alabaster px-2.5 py-1 rounded-full text-xs font-display flex items-center gap-1.5 backdrop-blur-sm">
                <Layers className="w-3.5 h-3.5 text-brass" />
                <span>Photo {activeImageIndex + 1} of {images.length}</span>
              </div>
            </div>

            {/* Thumbnails Strip (Proof of 3+ Photos) */}
            <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-none">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative w-20 h-16 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
                    idx === activeImageIndex
                      ? 'border-brass scale-105 shadow-md'
                      : 'border-transparent opacity-70 hover:opacity-100 hover:border-espresso/30'
                  }`}
                >
                  <img
                    src={img}
                    alt={`Thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>

            {/* Trust Assurance Pills */}
            <div className="mt-auto pt-4 space-y-2 border-t border-espresso/10 text-xs font-sans text-espresso/80">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-brass-dark" />
                <span>9-Bar Pressure Tested & Boiler Decalcified</span>
              </div>
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-sage-dark" />
                <span>Genuine OEM Replacement Seals & Gaskets</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-espresso/70" />
                <span>On-Site Meetup, Inspection & Payment Coordination</span>
              </div>
            </div>
          </div>

          {/* Right Column: Specs, Variants & Purchase */}
          <div className="md:col-span-6 p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              {/* Category & Brand Header */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-display uppercase tracking-widest text-brass-dark font-bold">
                  {product.brand}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-display uppercase tracking-wider bg-espresso/5 text-espresso/70 font-semibold">
                  {product.category}
                </span>
              </div>

              {/* Title */}
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-espresso leading-tight">
                {product.name}
              </h2>

              {/* Rating & Stock Status */}
              <div className="flex items-center justify-between gap-4 py-1">
                <div className="flex items-center gap-1.5">
                  <div className="flex text-brass">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(product.ratingValue) ? 'fill-current' : 'text-espresso/20'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-espresso">
                    {product.ratingValue.toFixed(1)} / 5.0 Rating
                  </span>
                </div>

                <div>
                  {isOutOfStock ? (
                    <span className="inline-flex items-center gap-1 text-xs font-display uppercase font-bold text-red-700 bg-red-50 px-2.5 py-1 rounded-full border border-red-200">
                      <AlertCircle className="w-3.5 h-3.5" /> Out of Stock
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-display uppercase font-bold text-sage-dark bg-sage/15 px-2.5 py-1 rounded-full border border-sage/30">
                      <CheckCircle2 className="w-3.5 h-3.5" /> In Stock ({product.stock} available)
                    </span>
                  )}
                </div>
              </div>

              {/* Price Block */}
              <div className="p-3.5 rounded-xl bg-white border border-espresso/10 flex items-baseline justify-between">
                <div>
                  <div className="flex items-baseline gap-2.5">
                    <span className="text-2xl sm:text-3xl font-display font-bold text-espresso">
                      {formatPrice(effectivePrice)}
                    </span>
                    {product.initialPrice && product.initialPrice > effectivePrice && (
                      <span className="text-sm line-through text-espresso/40">
                        {formatPrice(product.initialPrice)}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-espresso/60 mt-0.5">Includes equipment inspection & testing on arrival</p>
                </div>
                {discount && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-display font-bold bg-brass text-espresso-950 shadow-sm">
                    Save {discount}%
                  </span>
                )}
              </div>

              {/* Variants Selector */}
              {product.variants && product.variants.length > 0 && (
                <div className="space-y-2">
                  <label className="text-xs font-display uppercase tracking-wider text-espresso/80 font-bold block">
                    Select Equipment Configuration:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.map((v) => (
                      <button
                        key={v.name}
                        onClick={() => setSelectedVariant(v.name)}
                        className={`px-3.5 py-2 rounded-lg text-xs font-sans font-medium transition-all border ${
                          selectedVariant === v.name
                            ? 'bg-espresso text-alabaster border-espresso font-semibold shadow-sm'
                            : 'bg-white text-espresso border-espresso/20 hover:border-espresso/40'
                        }`}
                      >
                        {v.name} {v.price ? `(+${formatPrice(v.price - product.price)})` : ''}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-display uppercase tracking-wider text-espresso/80 font-bold block">
                  Equipment Condition & Details:
                </label>
                <p className="text-xs sm:text-sm text-espresso/80 leading-relaxed font-sans">
                  {product.description}
                </p>
              </div>

              {/* Structured Technical Specifications Table (Key Trust Kernel) */}
              {product.specifications && Object.keys(product.specifications).length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-display uppercase tracking-wider text-espresso/80 font-bold">
                    <Sparkles className="w-3.5 h-3.5 text-brass" />
                    <span>Technical Specifications</span>
                  </div>
                  <div className="rounded-xl border border-espresso/10 bg-white overflow-hidden text-xs">
                    <table className="w-full text-left">
                      <tbody>
                        {Object.entries(product.specifications).map(([key, val], idx) => (
                          <tr
                            key={key}
                            className={`border-b border-espresso/5 last:border-0 ${
                              idx % 2 === 0 ? 'bg-alabaster/40' : 'bg-white'
                            }`}
                          >
                            <td className="py-2 px-3 font-semibold text-espresso/70 w-2/5 border-r border-espresso/5">
                              {key}
                            </td>
                            <td className="py-2 px-3 text-espresso font-medium">
                              {String(val)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Quantity and Add to Cart Action Footer */}
            <div className="pt-4 border-t border-espresso/10 flex items-center gap-3">
              <div className="flex items-center border border-espresso/20 rounded-full bg-white px-2 py-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-7 h-7 flex items-center justify-center text-espresso/70 hover:text-espresso font-bold text-sm"
                  disabled={isOutOfStock}
                >
                  -
                </button>
                <span className="w-8 text-center text-xs font-bold font-display text-espresso">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="w-7 h-7 flex items-center justify-center text-espresso/70 hover:text-espresso font-bold text-sm"
                  disabled={isOutOfStock || quantity >= product.stock}
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAdd}
                disabled={isOutOfStock}
                className={`flex-1 py-3 px-6 rounded-full font-display text-xs uppercase tracking-wider font-bold transition-all flex items-center justify-center gap-2 shadow-md ${
                  isOutOfStock
                    ? 'bg-espresso/20 text-espresso/40 cursor-not-allowed'
                    : 'bg-brass hover:bg-brass-light text-espresso-950 hover:scale-[1.01]'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{isOutOfStock ? 'Sold Out' : `Add ${quantity} to Cart • ${formatPrice(effectivePrice * quantity)}`}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
