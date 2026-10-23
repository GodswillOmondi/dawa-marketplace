import React, { useState, useEffect } from 'react';
import { InvoiceDocument } from '../shared/InvoiceDocument';
import { formatPrice } from '../../lib/utils';
import { FileText, CheckCircle2, Clock, XCircle, Printer } from 'lucide-react';

interface InvoiceRecord {
  id: number;
  invoiceNumber: string;
  status: 'DRAFT' | 'PAID' | 'CANCELLED';
  issuedAt: string;
  paidAt?: string | null;
  order: {
    id: number;
    orderNumber: string;
    buyerName: string;
    buyerPhone: string;
    buyerEmail: string;
    deliveryNote: string;
    items: any[];
    totalAmount: number;
    stage: string;
  };
}

export const VendorInvoicesView: React.FC = () => {
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/orders/invoices')
      .then((res) => res.json())
      .then((data) => {
        setInvoices(data);
        if (data.length > 0) setSelectedInvoice(data[0]);
      })
      .catch((err) => console.error('Failed to load invoices:', err))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl font-bold text-espresso">Order Invoices Ledger</h2>
        <p className="text-xs text-espresso/60 mt-0.5">
          All order invoices generated upon checkout. Automatically flips from DRAFT to PAID when orders are delivered.
        </p>
      </div>

      {isLoading ? (
        <div className="py-16 text-center text-xs text-espresso/60">Loading invoices...</div>
      ) : invoices.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-xl border border-espresso/15 p-8 space-y-2">
          <FileText className="w-10 h-10 text-espresso/20 mx-auto" />
          <p className="font-serif text-lg text-espresso/70">No invoices generated yet.</p>
          <p className="text-xs text-espresso/50">When buyers place orders, their invoices appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Invoices List */}
          <div className="lg:col-span-5 bg-white rounded-xl border border-espresso/15 shadow-sm overflow-hidden divide-y divide-espresso/10">
            {invoices.map((inv) => {
              const isSelected = selectedInvoice?.id === inv.id;
              return (
                <div
                  key={inv.id}
                  onClick={() => setSelectedInvoice(inv)}
                  className={`p-4 cursor-pointer transition-colors ${
                    isSelected ? 'bg-brass/10 border-l-4 border-brass' : 'hover:bg-alabaster/40'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-espresso">{inv.invoiceNumber}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-display uppercase font-bold tracking-wider ${
                      inv.status === 'PAID'
                        ? 'bg-sage/20 text-sage-dark'
                        : inv.status === 'CANCELLED'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-brass/20 text-brass-dark'
                    }`}>
                      {inv.status}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-espresso mt-1">{inv.order?.buyerName}</p>
                  <div className="flex items-center justify-between text-[11px] text-espresso/60 mt-1">
                    <span>Order #{inv.order?.orderNumber}</span>
                    <span className="font-mono font-bold text-brass-dark">
                      {inv.order ? formatPrice(inv.order.totalAmount) : ''}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Printable Invoice Display */}
          <div className="lg:col-span-7">
            {selectedInvoice && selectedInvoice.order ? (
              <InvoiceDocument
                invoice={{
                  invoiceNumber: selectedInvoice.invoiceNumber,
                  orderNumber: selectedInvoice.order.orderNumber,
                  status: selectedInvoice.status,
                  issuedAt: selectedInvoice.issuedAt,
                  paidAt: selectedInvoice.paidAt,
                  buyerName: selectedInvoice.order.buyerName,
                  buyerPhone: selectedInvoice.order.buyerPhone,
                  buyerEmail: selectedInvoice.order.buyerEmail,
                  deliveryNote: selectedInvoice.order.deliveryNote,
                  items: selectedInvoice.order.items,
                  totalAmount: selectedInvoice.order.totalAmount,
                }}
              />
            ) : (
              <div className="bg-white rounded-xl border border-espresso/15 p-8 text-center text-xs text-espresso/50">
                Select an invoice to preview.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
