import React from 'react';
import { formatPrice } from '../../lib/utils';
import { Coffee, Printer, CheckCircle, Clock, XCircle } from 'lucide-react';

export interface InvoiceData {
  invoiceNumber: string;
  orderNumber: string;
  status: 'DRAFT' | 'PAID' | 'CANCELLED';
  issuedAt: string;
  paidAt?: string | null;
  buyerName: string;
  buyerPhone: string;
  buyerEmail: string;
  deliveryNote: string;
  items: {
    productId: number;
    productName: string;
    variant?: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }[];
  totalAmount: number;
}

interface InvoiceDocumentProps {
  invoice: InvoiceData;
  onPrint?: () => void;
}

export const InvoiceDocument: React.FC<InvoiceDocumentProps> = ({ invoice, onPrint }) => {
  const handlePrint = () => {
    if (onPrint) onPrint();
    else window.print();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-display font-bold uppercase tracking-wider bg-sage/20 text-sage-dark border border-sage/40">
            <CheckCircle className="w-3.5 h-3.5" /> PAID & DELIVERED
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-display font-bold uppercase tracking-wider bg-red-100 text-red-800 border border-red-300">
            <XCircle className="w-3.5 h-3.5" /> CANCELLED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-display font-bold uppercase tracking-wider bg-brass/20 text-brass-dark border border-brass/50">
            <Clock className="w-3.5 h-3.5" /> DRAFT INVOICE (PENDING MEETUP)
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-xl border border-espresso/15 p-6 sm:p-8 shadow-md text-espresso max-w-2xl mx-auto font-sans print:shadow-none print:border-none print:p-0">
      {/* Invoice Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-espresso/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-sm bg-espresso flex items-center justify-center text-brass">
            <Coffee className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-serif text-2xl font-bold tracking-tight text-espresso leading-none">
              DAWA EQUIPS
            </h2>
            <p className="text-[10px] uppercase font-display tracking-widest text-espresso/60 font-semibold mt-1">
              Refurbished Commercial Appliances
            </p>
          </div>
        </div>

        <div className="text-right flex flex-col items-start sm:items-end">
          <div className="mb-1.5">{getStatusBadge(invoice.status)}</div>
          <p className="text-xs font-display uppercase tracking-wider font-bold text-espresso">
            Invoice: <span className="font-mono text-brass-dark">{invoice.invoiceNumber}</span>
          </p>
          <p className="text-[11px] text-espresso/60">
            Order Ref: #{invoice.orderNumber} • {new Date(invoice.issuedAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Buyer & Meetup Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-5 border-b border-espresso/10 text-xs">
        <div>
          <p className="font-display uppercase tracking-wider text-espresso/60 font-bold mb-1">
            Buyer Details:
          </p>
          <p className="font-semibold text-sm text-espresso">{invoice.buyerName}</p>
          <p className="text-espresso/80 mt-0.5">📞 {invoice.buyerPhone}</p>
          <p className="text-espresso/80">✉️ {invoice.buyerEmail}</p>
        </div>

        <div>
          <p className="font-display uppercase tracking-wider text-espresso/60 font-bold mb-1">
            Meetup / Delivery Note:
          </p>
          <p className="text-espresso/90 bg-alabaster p-2.5 rounded-lg border border-espresso/10 italic">
            "{invoice.deliveryNote}"
          </p>
        </div>
      </div>

      {/* Products Bought vs. Price Table */}
      <div className="py-5">
        <p className="font-display uppercase tracking-wider text-xs font-bold text-espresso/70 mb-2">
          Products Bought vs. Price Table
        </p>
        <div className="border border-espresso/10 rounded-lg overflow-hidden text-xs">
          <table className="w-full text-left">
            <thead className="bg-alabaster border-b border-espresso/10 font-display uppercase tracking-wider text-[11px] text-espresso/70">
              <tr>
                <th className="py-2.5 px-3">Item & Configuration</th>
                <th className="py-2.5 px-3 text-center">Qty</th>
                <th className="py-2.5 px-3 text-right">Unit Price</th>
                <th className="py-2.5 px-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-espresso/5">
              {invoice.items.map((item, idx) => (
                <tr key={idx} className="hover:bg-alabaster/30">
                  <td className="py-2.5 px-3">
                    <p className="font-semibold text-espresso">{item.productName}</p>
                    {item.variant && (
                      <p className="text-[11px] text-espresso/60">{item.variant}</p>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-center font-medium">{item.quantity}</td>
                  <td className="py-2.5 px-3 text-right text-espresso/80 font-mono">
                    {formatPrice(item.unitPrice)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-espresso font-mono">
                    {formatPrice(item.lineTotal)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-espresso-50/50 font-display border-t border-espresso/10">
              <tr>
                <td colSpan={3} className="py-3 px-3 text-right uppercase tracking-wider font-bold text-xs text-espresso">
                  Total Payable Amount:
                </td>
                <td className="py-3 px-3 text-right font-bold text-base text-brass-dark font-mono">
                  {formatPrice(invoice.totalAmount)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Bottom Notes & Actions */}
      <div className="pt-4 border-t border-espresso/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-espresso/70">
        <p className="max-w-md">
          * Terms: Cash on meetup/delivery or bank transfer after on-site mechanical inspection. Equipment verified to 9-bar pressure.
        </p>

        <button
          onClick={handlePrint}
          className="print:hidden inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-espresso/20 hover:border-brass hover:text-espresso font-display text-xs uppercase tracking-wider font-bold transition-all shadow-sm"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print / Save PDF</span>
        </button>
      </div>
    </div>
  );
};
