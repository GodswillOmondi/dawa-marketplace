import React, { useState } from 'react';
import { trackOrdersByPhone, Order } from '../../lib/api';
import { InvoiceDocument } from '../shared/InvoiceDocument';
import { X, Search, Truck, Clock, CheckCircle2, ChevronDown, ChevronUp, Mail, AlertCircle, FileText } from 'lucide-react';

interface OrderTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const STAGES = [
  { key: 'OrderInitiation', label: '1. Order Initiated', desc: 'Draft invoice issued' },
  { key: 'OrderReceived', label: '2. Order Received', desc: 'Vendor confirmed meetup' },
  { key: 'OrderProcessed', label: '3. Processed', desc: 'Testing & in transit' },
  { key: 'OrderDelivered', label: '4. Delivered & Paid', desc: 'Equipment verified' },
];

export const OrderTrackerModal: React.FC<OrderTrackerModalProps> = ({ isOpen, onClose }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedInvoiceId, setExpandedInvoiceId] = useState<number | null>(null);
  const [expandedEmailsId, setExpandedEmailsId] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim()) {
      setError('Please enter your phone number.');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const results = await trackOrdersByPhone(phoneNumber.trim());
      setOrders(results);
      if (results.length === 0) {
        setError('No orders found for this phone number. Please check the digits entered.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to retrieve orders.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStageIndex = (stage: string) => {
    switch (stage) {
      case 'OrderInitiation': return 0;
      case 'OrderReceived': return 1;
      case 'OrderProcessed': return 2;
      case 'OrderDelivered': return 3;
      case 'OrderCancelled': return -1;
      default: return 0;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-espresso-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
      <div 
        className="relative w-full max-w-3xl bg-alabaster rounded-2xl shadow-2xl border border-espresso/20 p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto"
        style={{ overscrollBehavior: 'contain' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-espresso/10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-espresso flex items-center justify-center text-brass">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-espresso leading-none">
                Track Commercial Equipment Orders
              </h2>
              <p className="text-xs text-espresso/60 mt-1">
                Enter the phone number used during checkout to view order progress and invoices.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-espresso/5 flex items-center justify-center text-espresso/70 hover:text-espresso"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="flex gap-2.5">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-espresso/40" />
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Enter your phone number (e.g. 0712345678)"
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-espresso/20 rounded-xl text-xs text-espresso focus:outline-none focus:ring-2 focus:ring-brass"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2.5 rounded-xl bg-brass hover:bg-brass-light text-espresso-950 font-display text-xs uppercase tracking-wider font-bold transition-all shadow-sm shrink-0"
          >
            {isLoading ? 'Searching...' : 'Lookup Orders'}
          </button>
        </form>

        {error && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-800">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Results List */}
        {orders && orders.length > 0 && (
          <div className="space-y-6 pt-2">
            <h3 className="font-display text-xs uppercase tracking-wider font-bold text-espresso/70">
              Found {orders.length} Order{orders.length > 1 ? 's' : ''} for {phoneNumber}
            </h3>

            {orders.map((order) => {
              const currentIdx = getStageIndex(order.stage);
              const isCancelled = order.stage === 'OrderCancelled';

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-xl border border-espresso/15 p-5 shadow-sm space-y-5"
                >
                  {/* Order Overview Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-espresso/10 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold font-mono text-sm text-espresso">
                          #{order.orderNumber}
                        </span>
                        <span className="text-espresso/60">•</span>
                        <span className="text-espresso/70">{new Date(order.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="text-[11px] text-espresso/60 mt-0.5">
                        Buyer: {order.buyerName} ({order.buyerPhone})
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-full font-display uppercase tracking-wider text-[10px] font-bold ${
                        isCancelled
                          ? 'bg-red-100 text-red-800'
                          : order.stage === 'OrderDelivered'
                          ? 'bg-sage/20 text-sage-dark'
                          : 'bg-brass/20 text-brass-dark'
                      }`}>
                        Stage: {order.stage}
                      </span>
                    </div>
                  </div>

                  {/* 5-Stage Visual Progress Bar */}
                  {!isCancelled ? (
                    <div className="py-2">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {STAGES.map((st, idx) => {
                          const isDone = currentIdx >= idx;
                          const isCurrent = currentIdx === idx;
                          return (
                            <div
                              key={st.key}
                              className={`p-3 rounded-lg border text-center transition-all ${
                                isCurrent
                                  ? 'bg-brass/10 border-brass shadow-sm'
                                  : isDone
                                  ? 'bg-sage/10 border-sage/40'
                                  : 'bg-alabaster/40 border-espresso/10 opacity-60'
                              }`}
                            >
                              <div className="flex justify-center mb-1.5">
                                {isDone ? (
                                  <CheckCircle2 className="w-4 h-4 text-sage-dark" />
                                ) : (
                                  <Clock className="w-4 h-4 text-espresso/40" />
                                )}
                              </div>
                              <p className={`font-display text-[11px] font-bold uppercase tracking-wider ${
                                isCurrent ? 'text-brass-dark' : isDone ? 'text-sage-dark' : 'text-espresso/60'
                              }`}>
                                {st.label}
                              </p>
                              <p className="text-[10px] text-espresso/60 mt-0.5">{st.desc}</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-red-50 text-red-800 rounded-lg text-xs font-semibold text-center">
                      Order Cancelled.
                    </div>
                  )}

                  {/* Toggle Buttons: Invoice & Email Logs */}
                  <div className="pt-2 flex flex-wrap gap-2 text-xs">
                    <button
                      onClick={() =>
                        setExpandedInvoiceId(expandedInvoiceId === order.id ? null : order.id)
                      }
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-espresso/20 hover:border-brass text-espresso font-display uppercase tracking-wider font-semibold text-[11px]"
                    >
                      <FileText className="w-3.5 h-3.5 text-brass" />
                      <span>{expandedInvoiceId === order.id ? 'Hide Invoice' : 'View Itemized Invoice'}</span>
                      {expandedInvoiceId === order.id ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>

                    <button
                      onClick={() =>
                        setExpandedEmailsId(expandedEmailsId === order.id ? null : order.id)
                      }
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-espresso/20 hover:border-brass text-espresso font-display uppercase tracking-wider font-semibold text-[11px]"
                    >
                      <Mail className="w-3.5 h-3.5 text-sage-dark" />
                      <span>
                        Email Notifications ({order.emailLogs?.length || 0})
                      </span>
                      {expandedEmailsId === order.id ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  {/* Expandable Invoice Document */}
                  {expandedInvoiceId === order.id && order.invoice && (
                    <div className="pt-3 border-t border-espresso/10">
                      <InvoiceDocument
                        invoice={{
                          invoiceNumber: order.invoice.invoiceNumber,
                          orderNumber: order.orderNumber,
                          status: order.invoice.status,
                          issuedAt: order.invoice.issuedAt,
                          paidAt: order.invoice.paidAt,
                          buyerName: order.buyerName,
                          buyerPhone: order.buyerPhone,
                          buyerEmail: order.buyerEmail,
                          deliveryNote: order.deliveryNote,
                          items: order.items,
                          totalAmount: order.totalAmount,
                        }}
                      />
                    </div>
                  )}

                  {/* Expandable Email Notification Log */}
                  {expandedEmailsId === order.id && (
                    <div className="pt-3 border-t border-espresso/10 space-y-3">
                      <p className="text-xs font-display uppercase tracking-wider font-bold text-espresso/70">
                        Dispatch & Notification Logs (Resend & In-App):
                      </p>
                      {(!order.emailLogs || order.emailLogs.length === 0) ? (
                        <p className="text-xs text-espresso/50">No notifications sent yet.</p>
                      ) : (
                        <div className="space-y-2">
                          {order.emailLogs.map((log) => (
                            <div key={log.id} className="p-3 rounded-lg bg-alabaster border border-espresso/10 text-xs space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-espresso">{log.subject}</span>
                                <span className="text-[10px] px-2 py-0.5 rounded bg-espresso/10 font-mono">
                                  {log.deliveryStatus}
                                </span>
                              </div>
                              <p className="text-[11px] text-espresso/60">
                                Sent to {log.recipientEmail} at {new Date(log.sentAt).toLocaleString()}
                              </p>
                              <div 
                                className="mt-2 text-xs bg-white p-2.5 rounded border border-espresso/10 text-espresso/90"
                                dangerouslySetInnerHTML={{ __html: log.body }}
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
