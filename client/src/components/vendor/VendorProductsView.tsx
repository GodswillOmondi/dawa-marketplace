import React, { useState } from 'react';
import { Product } from '../../lib/api';
import { formatPrice } from '../../lib/utils';
import { Plus, Upload, Edit, AlertCircle, CheckCircle2, Layers, Search, Filter } from 'lucide-react';
import { ProductMultiStepModal } from './ProductMultiStepModal';
import { CsvImportModal } from './CsvImportModal';

interface VendorProductsViewProps {
  products: Product[];
  onRefresh: () => void;
}

export const VendorProductsView: React.FC<VendorProductsViewProps> = ({ products, onRefresh }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const filtered = products.filter((p) => {
    if (filterStatus !== 'ALL' && p.status !== filterStatus) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q);
    }
    return true;
  });

  const handleEdit = (prod: Product) => {
    setEditingProduct(prod);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* View Header & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-espresso">Appliance Inventory</h2>
          <p className="text-xs text-espresso/60 mt-0.5">
            Manage commercial equipment, update stock, and complete 3-image verification.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCsvModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-espresso/25 hover:border-espresso text-espresso font-display text-xs uppercase tracking-wider font-bold transition-all bg-white"
          >
            <Upload className="w-3.5 h-3.5 text-brass-dark" />
            <span>Import CSV</span>
          </button>

          <button
            onClick={handleCreate}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-brass hover:bg-brass-light text-espresso-950 font-display text-xs uppercase tracking-wider font-bold transition-all shadow-md hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            <span>New Appliance</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-3.5 rounded-xl border border-espresso/10">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-espresso/40" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by appliance name or brand..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-alabaster/40 border border-espresso/15 rounded-lg text-espresso focus:outline-none focus:ring-2 focus:ring-brass"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-espresso/50" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-xs bg-alabaster/40 border border-espresso/15 rounded-lg px-2.5 py-1.5 text-espresso focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active (Verified 3+ Images)</option>
            <option value="PENDING_IMAGES">Needs 3+ Images</option>
            <option value="OUT_OF_STOCK">Out of Stock</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl border border-espresso/15 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-alabaster border-b border-espresso/10 font-display uppercase tracking-wider text-[11px] text-espresso/70">
              <tr>
                <th className="py-3 px-4">Appliance</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-right">Selling Price</th>
                <th className="py-3 px-4 text-center">Stock</th>
                <th className="py-3 px-4 text-center">Photos</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-espresso/5">
              {filtered.map((prod) => {
                const imgCount = prod.images?.length || 0;
                const isPending = prod.status === 'PENDING_IMAGES' || imgCount < 3;
                const isOut = prod.stock <= 0 || prod.status === 'OUT_OF_STOCK';

                return (
                  <tr key={prod.id} className="hover:bg-alabaster/40 transition-colors">
                    <td className="py-3 px-4 flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-espresso-50 border border-espresso/10 shrink-0">
                        {prod.images?.[0] ? (
                          <img
                            src={prod.images[0]}
                            alt={prod.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-espresso/30 text-[10px]">
                            No photo
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-espresso line-clamp-1">{prod.name}</p>
                        <p className="text-[11px] text-espresso/60 font-semibold">{prod.brand}</p>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-espresso/70 font-medium">
                      {prod.category}
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-bold text-espresso">
                      {formatPrice(prod.price)}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span className={`font-bold font-mono px-2 py-0.5 rounded text-[11px] ${
                        isOut ? 'bg-red-100 text-red-800' : 'bg-espresso/5 text-espresso'
                      }`}>
                        {prod.stock} units
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-display font-bold ${
                        imgCount >= 3 ? 'bg-sage/20 text-sage-dark' : 'bg-amber-100 text-amber-800'
                      }`}>
                        <Layers className="w-3 h-3" />
                        {imgCount} / 3
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center">
                      {isPending ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-display uppercase font-bold tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
                          <AlertCircle className="w-3 h-3" /> Needs 3+ Images
                        </span>
                      ) : isOut ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-display uppercase font-bold tracking-wider bg-espresso text-alabaster">
                          Out of Stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-display uppercase font-bold tracking-wider bg-sage/20 text-sage-dark border border-sage/40">
                          <CheckCircle2 className="w-3 h-3" /> Active on Store
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleEdit(prod)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-espresso/20 text-espresso hover:border-brass hover:text-espresso font-display uppercase text-[11px] font-bold"
                      >
                        <Edit className="w-3 h-3 text-brass" />
                        <span>Edit</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Multi-Step Modal */}
      <ProductMultiStepModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={onRefresh}
        productToEdit={editingProduct}
      />

      {/* CSV Import Modal */}
      <CsvImportModal
        isOpen={isCsvModalOpen}
        onClose={() => setIsCsvModalOpen(false)}
        onSuccess={onRefresh}
      />
    </div>
  );
};
