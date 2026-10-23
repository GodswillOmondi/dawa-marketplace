import React, { useState } from 'react';
import { formatPrice } from '../../lib/utils';
import { createOrder, OrderItem, Order } from '../../lib/api';
import { InvoiceDocument } from '../shared/InvoiceDocument';
import { X, Trash2, ShoppingBag, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

export interface CartItem {
  productId: number;
  productName: string;
  variant?: string;
  quantity: number;
  unitPrice: number;
  image?: string;
}

interface CartCheckoutDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (index: number, quantity: number) => void;
  onRemoveItem: (index: number) => void;
  onClearCart: () => void;
}

export const CartCheckoutDrawer: React.FC<CartCheckoutDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
}) => {
  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [deliveryNote, setDeliveryNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdOrderData, setCreatedOrderData] = useState<{ order: Order; invoice: any } | null>(null);

  if (!isOpen) return null;

  const totalAmount = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyerName || !buyerPhone || !buyerEmail) {
      setError('Please provide your name, phone number, and email.');
      return;
    }

    if (cart.length === 0) {
      setError('Your cart is empty.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const orderItems: OrderItem[] = cart.map((c) => ({
        productId: c.productId,
        productName: c.productName,
        variant: c.variant,
        quantity: c.quantity,
        unitPrice: c.unitPrice,
        lineTotal: c.unitPrice * c.quantity,
      }));

      const res = await createOrder({
        buyerName,
        buyerPhone,
        buyerEmail,
        deliveryNote: deliveryNote || 'Standard Meetup/Inspection',
        items: orderItems,
      });

      setCreatedOrderData(res);
      onClearCart();
    } catch (err: any) {
      setError(err.message || 'Failed to submit order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinish = () => {
    setCreatedOrderData(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-espresso-950/70 backdrop-blur-sm flex justify-end">
      <div 
        className="w-full max-w-xl bg-alabaster h-full shadow-2xl flex flex-col border-l border-espresso/20 overflow-y-auto"
        style={{ overscrollBehavior: 'contain' }}
      >
        {/* Drawer Header */}
        <div className="p-5 border-b border-espresso/10 flex items-center justify-between bg-white sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-brass" />
            <h2 className="font-serif text-xl font-bold text-espresso">
              {createdOrderData ? 'Order Confirmed — Draft Invoice' : 'Shopping Cart & Checkout'}
            </h2>
          </div>
          <button
            onClick={createdOrderData ? handleFinish : onClose}
            className="w-8 h-8 rounded-full hover:bg-espresso/5 flex items-center justify-center text-espresso/70 hover:text-espresso"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 flex-1 overflow-y-auto space-y-6">
          {createdOrderData ? (
            <div className="space-y-6">
              <div className="p-4 bg-sage/15 border border-sage/30 rounded-xl flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-sage-dark shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-bold text-sm text-espresso">Order Initiated Successfully!</p>
                  <p className="text-espresso/80 mt-1">
                    Your DRAFT Order Invoice is ready below. Our team has received your request and will contact you at <strong>{buyerPhone}</strong> to coordinate physical inspection and delivery meetup.
                  </p>
                </div>
              </div>

              {/* Render Shared Printable Invoice */}
              <InvoiceDocument
                invoice={{
                  invoiceNumber: createdOrderData.invoice.invoiceNumber,
                  orderNumber: createdOrderData.order.orderNumber,
                  status: createdOrderData.invoice.status,
                  issuedAt: createdOrderData.invoice.issuedAt || new Date().toISOString(),
                  buyerName: createdOrderData.order.buyerName,
                  buyerPhone: createdOrderData.order.buyerPhone,
                  buyerEmail: createdOrderData.order.buyerEmail,
                  deliveryNote: createdOrderData.order.deliveryNote,
                  items: createdOrderData.order.items,
                  totalAmount: createdOrderData.order.totalAmount,
                }}
              />

              <div className="text-center pt-2">
                <button
                  onClick={handleFinish}
                  className="px-8 py-3 rounded-full bg-espresso text-alabaster font-display text-xs uppercase tracking-wider font-bold hover:bg-espresso-800 transition-all shadow-md"
                >
                  Return to Storefront
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Cart Items List */}
              {cart.length === 0 ? (
                <div className="py-16 text-center space-y-3">
                  <ShoppingBag className="w-12 h-12 text-espresso/20 mx-auto" />
                  <p className="font-serif text-lg text-espresso/70">Your cart is currently empty.</p>
                  <p className="text-xs text-espresso/50 max-w-xs mx-auto">
                    Browse our refurbished commercial coffee machines and equipment to add items.
                  </p>
                  <button
                    onClick={onClose}
                    className="mt-4 px-6 py-2.5 rounded-full bg-brass text-espresso-950 font-display text-xs uppercase tracking-wider font-bold"
                  >
                    Explore Equipment
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs font-display uppercase tracking-wider text-espresso/60 font-semibold border-b border-espresso/10 pb-2">
                    <span>Selected Appliances ({cart.length})</span>
                    <button
                      onClick={onClearCart}
                      className="text-red-700 hover:underline text-[11px]"
                    >
                      Clear All
                    </button>
                  </div>

                  <div className="divide-y divide-espresso/10">
                    {cart.map((item, idx) => (
                      <div key={idx} className="py-3 flex items-center gap-3">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.productName}
                            className="w-14 h-14 object-cover rounded-lg border border-espresso/10 shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-espresso line-clamp-1">{item.productName}</p>
                          {item.variant && (
                            <p className="text-[11px] text-espresso/60">{item.variant}</p>
                          )}
                          <p className="text-xs font-mono font-bold text-brass-dark mt-0.5">
                            {formatPrice(item.unitPrice)}
                          </p>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center border border-espresso/20 rounded-full bg-white px-2 py-0.5">
                          <button
                            onClick={() => onUpdateQuantity(idx, Math.max(1, item.quantity - 1))}
                            className="w-5 h-5 flex items-center justify-center text-espresso/70 hover:text-espresso font-bold text-xs"
                          >
                            -
                          </button>
                          <span className="w-6 text-center text-xs font-bold font-display text-espresso">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(idx, item.quantity + 1)}
                            className="w-5 h-5 flex items-center justify-center text-espresso/70 hover:text-espresso font-bold text-xs"
                          >
                            +
                          </button>
                        </div>

                        <button
                          onClick={() => onRemoveItem(idx)}
                          className="p-1.5 text-espresso/40 hover:text-red-700 transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Subtotal */}
                  <div className="p-4 rounded-xl bg-white border border-espresso/10 flex justify-between items-center text-espresso">
                    <span className="text-xs font-display uppercase tracking-wider font-bold">Estimated Order Total:</span>
                    <span className="text-lg font-display font-bold text-brass-dark font-mono">
                      {formatPrice(totalAmount)}
                    </span>
                  </div>

                  {/* Checkout Form */}
                  <form onSubmit={handleSubmitOrder} className="pt-4 border-t border-espresso/10 space-y-4">
                    <div className="flex items-center gap-2">
                      <h3 className="font-serif text-lg font-bold text-espresso">
                        Buyer & Meetup Coordination
                      </h3>
                    </div>
                    <p className="text-xs text-espresso/70 leading-relaxed">
                      We operate on a transparent <strong>Invoice-First</strong> model: submit your meetup details to receive an itemized DRAFT invoice. You inspect equipment on delivery before completing payment.
                    </p>

                    {error && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-xs text-red-800">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{error}</span>
                      </div>
                    )}

                    <div className="space-y-3">
                      <div>
                        <label className="block text-[11px] font-display uppercase tracking-wider font-bold text-espresso/80 mb-1">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={buyerName}
                          onChange={(e) => setBuyerName(e.target.value)}
                          placeholder="e.g. John Doe / Roastery Cafe"
                          className="w-full px-3.5 py-2 text-xs bg-white border border-espresso/20 rounded-lg text-espresso focus:outline-none focus:ring-2 focus:ring-brass"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-display uppercase tracking-wider font-bold text-espresso/80 mb-1">
                            Phone Number * (For Meetup & Tracking)
                          </label>
                          <input
                            type="tel"
                            required
                            value={buyerPhone}
                            onChange={(e) => setBuyerPhone(e.target.value)}
                            placeholder="e.g. 0712345678"
                            className="w-full px-3.5 py-2 text-xs bg-white border border-espresso/20 rounded-lg text-espresso focus:outline-none focus:ring-2 focus:ring-brass"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-display uppercase tracking-wider font-bold text-espresso/80 mb-1">
                            Email Address * (For Invoices & Updates)
                          </label>
                          <input
                            type="email"
                            required
                            value={buyerEmail}
                            onChange={(e) => setBuyerEmail(e.target.value)}
                            placeholder="e.g. cafe@domain.com"
                            className="w-full px-3.5 py-2 text-xs bg-white border border-espresso/20 rounded-lg text-espresso focus:outline-none focus:ring-2 focus:ring-brass"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-display uppercase tracking-wider font-bold text-espresso/80 mb-1">
                          Delivery / Inspection Meetup Note
                        </label>
                        <textarea
                          rows={2}
                          value={deliveryNote}
                          onChange={(e) => setDeliveryNote(e.target.value)}
                          placeholder="e.g. Deliver to Westlands cafe site, ground floor. Please bring pressure testing gauge."
                          className="w-full px-3.5 py-2 text-xs bg-white border border-espresso/20 rounded-lg text-espresso focus:outline-none focus:ring-2 focus:ring-brass"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3.5 px-6 rounded-full bg-brass hover:bg-brass-light text-espresso-950 font-display text-xs uppercase tracking-wider font-bold transition-transform hover:scale-[1.01] shadow-md flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <span>Generating Draft Invoice...</span>
                      ) : (
                        <>
                          <span>Confirm Order & Generate Draft Invoice</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
