import React, { useState, useEffect } from 'react';
import { fetchAllOrders, updateOrderStage, Order } from '../../lib/api';
import { formatPrice } from '../../lib/utils';
import { InvoiceDocument } from '../shared/InvoiceDocument';
import { Truck, CheckCircle2, ChevronDown, ChevronUp, AlertCircle, FileText, ArrowRight } from 'lucide-react';

interface VendorOrdersViewProps {
  onRefresh?: () => void;
}

export const VendorOrdersView: React.FC<VendorOrdersViewProps> = ({ onRefresh }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      const data = await fetchAllOrders();
      setOrders(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch orders');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleOpenOrder = async (order: Order) => {
    setSelectedOrder(order);

    // Auto-advance OrderInitiation -> OrderReceived upon vendor opening
    if (order.stage === 'OrderInitiation') {
      try {
        const { order: updated } = await updateOrderStage(order.id, 'OrderReceived');
        setSelectedOrder((prev) => (prev?.id === order.id ? { ...prev, stage: updated.stage } : prev));
        loadOrders();
        if (onRefresh) onRefresh();
      } catch (err) {
        console.error('Failed to auto-advance order stage to OrderReceived:', err);
      }
    }
  };

  const handleStageTransition = async (orderId: number, nextStage: string) => {
    try {
      const { order: updated, invoice } = await updateOrderStage(orderId, nextStage);
      setSelectedOrder((prev) => (prev?.id === orderId ? { ...prev, stage: updated.stage, invoice } : prev));
      loadOrders();
      if (onRefresh) onRefresh();
    } catch (err: any) {
      setError(err.message || 'Failed to update order stage');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl font-bold text-espresso">Customer Orders & Fulfillment</h2>
          <p className="text-xs text-espresso/60 mt-0.5">
            Opening an Initiated order automatically sets it to <strong>OrderReceived</strong>. Step through to <strong>OrderDelivered</strong> to finalize payment and deduct inventory.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-800">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {isLoading ? (
        <div className="py-16 text-center text-xs text-espresso/60">Loading incoming orders...</div>
      ) : orders.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-xl border border-espresso/15 p-8 space-y-2">
          <Truck className="w-10 h-10 text-espresso/20 mx-auto" />
          <p className="font-serif text-lg text-espresso/70">No customer orders yet.</p>
          <p className="text-xs text-espresso/50">Orders placed by buyers on the storefront will appear here live.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Orders List */}
          <div className="lg:col-span-7 bg-white rounded-xl border border-espresso/15 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-alabaster border-b border-espresso/10 font-display uppercase tracking-wider text-[11px] text-espresso/70">
                  <tr>
                    <th className="py-3 px-4">Order #</th>
                    <th className="py-3 px-4">Buyer</th>
                    <th className="py-3 px-4 text-right">Total</th>
                    <th className="py-3 px-4 text-center">Stage</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-espresso/5">
                  {orders.map((o) => {
                    const isSelected = selectedOrder?.id === o.id;
                    return (
                      <tr
                        key={o.id}
                        onClick={() => handleOpenOrder(o)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? 'bg-brass/10' : 'hover:bg-alabaster/40'
                        }`}
                      >
                        <td className="py-3 px-4 font-mono font-bold text-espresso">
                          #{o.orderNumber}
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-bold text-espresso">{o.buyerName}</p>
                          <p className="text-[11px] text-espresso/60">📞 {o.buyerPhone}</p>
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-brass-dark">
                          {formatPrice(o.totalAmount)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-display uppercase font-bold tracking-wider ${
                            o.stage === 'OrderDelivered'
                              ? 'bg-sage/20 text-sage-dark'
                              : o.stage === 'OrderCancelled'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-brass/20 text-brass-dark'
                          }`}>
                            {o.stage}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenOrder(o);
                            }}
                            className="px-2.5 py-1 rounded bg-espresso text-alabaster text-[10px] font-display uppercase font-bold hover:bg-espresso-800"
                          >
                            Manage
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Order Detail & Stage Management Card */}
          <div className="lg:col-span-5 space-y-4">
            {selectedOrder ? (
              <div className="bg-white rounded-xl border border-espresso/15 p-6 shadow-sm space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-espresso/10">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-espresso">
                      Order #{selectedOrder.orderNumber}
                    </h3>
                    <p className="text-[11px] text-espresso/60">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-display uppercase font-bold bg-espresso/5 text-espresso">
                    {selectedOrder.stage}
                  </span>
                </div>

                {/* Buyer & Meetup Details */}
                <div className="text-xs space-y-1.5 p-3 rounded-lg bg-alabaster border border-espresso/10">
                  <p><strong>Buyer:</strong> {selectedOrder.buyerName}</p>
                  <p><strong>Phone:</strong> <a href={`tel:${selectedOrder.buyerPhone}`} className="text-brass-dark underline">{selectedOrder.buyerPhone}</a></p>
                  <p><strong>Email:</strong> {selectedOrder.buyerEmail}</p>
                  <p className="pt-1 text-espresso/80"><strong>Meetup Note:</strong> "{selectedOrder.deliveryNote}"</p>
                </div>

                {/* Stage Progression Actions */}
                <div className="space-y-2 pt-2 border-t border-espresso/10">
                  <p className="text-xs font-display uppercase tracking-wider font-bold text-espresso/80">
                    Advance Fulfillment Stage:
                  </p>
                  <div className="flex flex-col gap-2">
                    {selectedOrder.stage === 'OrderReceived' && (
                      <button
                        onClick={() => handleStageTransition(selectedOrder.id, 'OrderProcessed')}
                        className="w-full py-2.5 px-4 rounded-xl bg-espresso text-alabaster text-xs font-display uppercase tracking-wider font-bold hover:bg-espresso-800 transition-all flex items-center justify-center gap-1.5"
                      >
                        <span>Step to OrderProcessed (Inspection Scheduled)</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {selectedOrder.stage === 'OrderProcessed' && (
                      <button
                        onClick={() => handleStageTransition(selectedOrder.id, 'OrderDelivered')}
                        className="w-full py-2.5 px-4 rounded-xl bg-sage-dark text-white text-xs font-display uppercase tracking-wider font-bold hover:opacity-90 transition-all flex items-center justify-center gap-1.5 shadow-md"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Mark OrderDelivered (Paid & Deduct Stock)</span>
                      </button>
                    )}

                    {selectedOrder.stage !== 'OrderDelivered' && selectedOrder.stage !== 'OrderCancelled' && (
                      <button
                        onClick={() => handleStageTransition(selectedOrder.id, 'OrderCancelled')}
                        className="w-full py-1.5 px-4 rounded-lg border border-red-200 text-red-700 text-[11px] font-display uppercase font-semibold hover:bg-red-50"
                      >
                        Cancel Order
                      </button>
                    )}
                  </div>
                </div>

                {/* Order Invoice Document Preview */}
                {selectedOrder.invoice && (
                  <div className="pt-3 border-t border-espresso/10">
                    <InvoiceDocument
                      invoice={{
                        invoiceNumber: selectedOrder.invoice.invoiceNumber,
                        orderNumber: selectedOrder.orderNumber,
                        status: selectedOrder.invoice.status,
                        issuedAt: selectedOrder.invoice.issuedAt,
                        paidAt: selectedOrder.invoice.paidAt,
                        buyerName: selectedOrder.buyerName,
                        buyerPhone: selectedOrder.buyerPhone,
                        buyerEmail: selectedOrder.buyerEmail,
                        deliveryNote: selectedOrder.deliveryNote,
                        items: selectedOrder.items,
                        totalAmount: selectedOrder.totalAmount,
                      }}
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-espresso/15 p-8 text-center text-xs text-espresso/50">
                Click on any order to view details and advance its fulfillment stage.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
