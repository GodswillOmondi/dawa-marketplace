import React from 'react';
import { Product } from '../../lib/api';
import { formatPrice, calculateDiscount } from '../../lib/utils';
import { Star, ShoppingBag, Eye, Layers } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
  onAddToCart: (product: Product, e: React.MouseEvent) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelect,
  onAddToCart,
}) => {
  const isOutOfStock = product.stock <= 0 || product.status === 'OUT_OF_STOCK';
  const discount = calculateDiscount(product.price, product.initialPrice);
  const primaryImage = product.images?.[0] || 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80';
  const imageCount = product.images?.length || 0;

  return (
    <div
      onClick={() => onSelect(product)}
      className={`group relative bg-white rounded-xl border border-espresso/10 overflow-hidden flex flex-col transition-all duration-300 hover:shadow-xl hover:border-brass/50 cursor-pointer ${
        isOutOfStock ? 'opacity-75 grayscale-[20%]' : ''
      }`}
    >
      {/* Thumbnail Container */}
      <div className="relative aspect-[4/3] bg-espresso-50/50 overflow-hidden">
        <img
          src={primaryImage}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Badges Overlay */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
          {discount && !isOutOfStock && (
            <span className="px-2 py-0.5 rounded text-[10px] font-display font-bold uppercase tracking-wider bg-brass text-espresso-950 shadow-sm">
              -{discount}% OFF
            </span>
          )}
          {isOutOfStock && (
            <span className="px-2 py-0.5 rounded text-[10px] font-display font-bold uppercase tracking-wider bg-espresso text-alabaster shadow-sm">
              Out of Stock
            </span>
          )}
        </div>

        {/* Image count indicator (core trust feature: 3+ photos) */}
        <div className="absolute top-2.5 right-2.5 z-10 bg-espresso/70 backdrop-blur-sm text-alabaster px-2 py-0.5 rounded-full text-[10px] font-display flex items-center gap-1">
          <Layers className="w-3 h-3 text-brass" />
          <span>{imageCount} Photos</span>
        </div>

        {/* Hover Quick Action Overlay */}
        <div className="absolute inset-0 bg-espresso-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(product);
            }}
            className="p-2.5 rounded-full bg-alabaster/90 text-espresso hover:bg-white hover:scale-110 transition-all shadow-md"
            title="Inspect Details & Specifications"
          >
            <Eye className="w-4 h-4" />
          </button>
          {!isOutOfStock && (
            <button
              onClick={(e) => onAddToCart(product, e)}
              className="px-4 py-2 rounded-full bg-brass hover:bg-brass-light text-espresso-950 font-display text-xs uppercase tracking-wider font-bold hover:scale-105 transition-all shadow-md flex items-center gap-1.5"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Add to Cart</span>
            </button>
          )}
        </div>
      </div>

      {/* Product Content Details */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Brand & Category */}
          <div className="flex items-center justify-between text-[11px] font-display uppercase tracking-wider text-espresso/60 font-semibold mb-1">
            <span>{product.brand}</span>
            <span className="text-brass-dark font-medium">{product.category.split(' ')[0]}</span>
          </div>

          {/* Title */}
          <h3 className="font-serif text-lg font-bold text-espresso group-hover:text-brass-dark transition-colors line-clamp-2 leading-snug">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1.5 mt-2">
            <div className="flex items-center text-brass">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3.5 h-3.5 ${
                    i < Math.floor(product.ratingValue) ? 'fill-current' : 'text-espresso/20'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs font-semibold text-espresso/80">
              {product.ratingValue.toFixed(1)}
            </span>
          </div>
        </div>

        {/* Pricing & Stock Footer */}
        <div className="mt-4 pt-3 border-t border-espresso/10 flex items-end justify-between">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-display font-bold text-espresso">
                {formatPrice(product.price)}
              </span>
              {product.initialPrice && product.initialPrice > product.price && (
                <span className="text-xs line-through text-espresso/40">
                  {formatPrice(product.initialPrice)}
                </span>
              )}
            </div>
            <p className="text-[11px] text-espresso/60 mt-0.5">
              {isOutOfStock ? (
                <span className="text-red-700 font-semibold">Unavailable</span>
              ) : (
                <span className="text-sage-dark font-semibold">In Stock ({product.stock} available)</span>
              )}
            </p>
          </div>

          {/* Bottom Card CTA */}
          <div>
            {!isOutOfStock ? (
              <button
                onClick={(e) => onAddToCart(product, e)}
                className="sm:hidden p-2 rounded-full bg-brass text-espresso-950 hover:bg-brass-light transition-colors"
                title="Add to Cart"
              >
                <ShoppingBag className="w-4 h-4" />
              </button>
            ) : (
              <span className="text-[11px] font-display uppercase tracking-wider font-bold text-espresso/40">
                Sold Out
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
