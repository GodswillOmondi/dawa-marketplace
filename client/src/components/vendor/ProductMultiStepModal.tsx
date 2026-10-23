import React, { useState, useEffect } from 'react';
import { Product, createProduct, updateProduct } from '../../lib/api';
import { X, ArrowRight, ArrowLeft, Check, Upload, Plus, Trash2, AlertCircle, Layers } from 'lucide-react';

interface ProductMultiStepModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  productToEdit?: Product | null;
}

export const ProductMultiStepModal: React.FC<ProductMultiStepModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  productToEdit,
}) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('La Marzocco');
  const [category, setCategory] = useState('Commercial Espresso Machines');
  const [price, setPrice] = useState<number | ''>('');
  const [initialPrice, setInitialPrice] = useState<number | ''>('');
  const [stock, setStock] = useState<number>(1);
  const [variants, setVariants] = useState<{ name: string; price?: number }[]>([]);
  const [specifications, setSpecifications] = useState<{ key: string; value: string }[]>([
    { key: 'Boiler Capacity', value: '' },
    { key: 'Power Supply', value: '' },
    { key: 'Condition', value: 'Certified Refurbished Ex-UK' },
  ]);
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');

  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name);
      setBrand(productToEdit.brand);
      setCategory(productToEdit.category);
      setPrice(productToEdit.price);
      setInitialPrice(productToEdit.initialPrice ?? '');
      setStock(productToEdit.stock);
      setVariants(productToEdit.variants || []);
      setSpecifications(
        productToEdit.specifications
          ? Object.entries(productToEdit.specifications).map(([key, value]) => ({ key, value }))
          : []
      );
      setDescription(productToEdit.description);
      setImages(productToEdit.images || []);
    } else {
      // Defaults
      setName('');
      setBrand('La Marzocco');
      setCategory('Commercial Espresso Machines');
      setPrice('');
      setInitialPrice('');
      setStock(1);
      setVariants([]);
      setSpecifications([
        { key: 'Boiler Capacity', value: '7 Liters Steam + 3.4L Coffee' },
        { key: 'Power Supply', value: '230V / 3600W' },
        { key: 'Condition', value: 'Certified Refurbished Ex-UK' },
      ]);
      setDescription('');
      setImages([]);
    }
    setStep(1);
    setError(null);
  }, [productToEdit, isOpen]);

  if (!isOpen) return null;

  // Client-side HTML canvas compression to Base64 (max 1000px, JPEG quality 0.8)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (readerEvent) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1000;
          let width = img.width;
          let height = img.height;

          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);

          setImages((prev) => [...prev, compressedDataUrl]);
        };
        img.src = readerEvent.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAddImageUrl = () => {
    if (newImageUrl.trim()) {
      setImages((prev) => [...prev, newImageUrl.trim()]);
      setNewImageUrl('');
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddVariant = () => {
    setVariants((prev) => [...prev, { name: '', price: undefined }]);
  };

  const handleRemoveVariant = (index: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddSpec = () => {
    setSpecifications((prev) => [...prev, { key: '', value: '' }]);
  };

  const handleRemoveSpec = (index: number) => {
    setSpecifications((prev) => prev.filter((_, i) => i !== index));
  };

  const handleNextStep = () => {
    setError(null);
    if (step === 1) {
      if (!name.trim()) {
        setError('Please enter a product name.');
        return;
      }
    } else if (step === 2) {
      if (price === '' || Number(price) <= 0) {
        setError('Please enter a valid price.');
        return;
      }
    } else if (step === 3) {
      if (!description.trim()) {
        setError('Please provide a short description or condition overhaul note.');
        return;
      }
    }
    setStep(step + 1);
  };

  const handleSubmit = async () => {
    if (images.length < 3) {
      setError('A minimum of 3 photos is required for active commercial storefront publishing.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const specObj: Record<string, string> = {};
    specifications.forEach((s) => {
      if (s.key.trim() && s.value.trim()) {
        specObj[s.key.trim()] = s.value.trim();
      }
    });

    const payload = {
      name,
      brand,
      category,
      price: Number(price),
      initialPrice: initialPrice ? Number(initialPrice) : null,
      stock: Number(stock),
      variants: variants.filter((v) => v.name.trim()),
      specifications: specObj,
      description,
      images,
    };

    try {
      if (productToEdit) {
        await updateProduct(productToEdit.id, payload);
      } else {
        await createProduct(payload);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save product');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-espresso-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
      <div 
        className="relative w-full max-w-2xl bg-alabaster rounded-2xl shadow-2xl border border-espresso/20 p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto"
        style={{ overscrollBehavior: 'contain' }}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-espresso/10">
          <div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-espresso">
              {productToEdit ? 'Edit Commercial Appliance' : 'Add New Commercial Appliance'}
            </h2>
            <p className="text-xs text-espresso/60 mt-0.5">
              Step {step} of 4: {step === 1 ? 'Identity' : step === 2 ? 'Pricing & Stock' : step === 3 ? 'Specifications' : '3+ Photos Gallery'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-espresso/5 flex items-center justify-center text-espresso/70 hover:text-espresso"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="grid grid-cols-4 gap-2">
          {['1. Identity', '2. Pricing', '3. Specs', '4. 3+ Photos'].map((label, idx) => (
            <div
              key={idx}
              className={`py-1.5 px-2 rounded-lg text-center font-display text-[10px] uppercase font-bold tracking-wider ${
                step === idx + 1
                  ? 'bg-brass text-espresso-950 shadow-sm'
                  : step > idx + 1
                  ? 'bg-sage/20 text-sage-dark'
                  : 'bg-espresso/5 text-espresso/40'
              }`}
            >
              {label}
            </div>
          ))}
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-800">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Step 1: Identity */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-display uppercase tracking-wider font-bold text-espresso/80 mb-1">
                Product Title *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. La Marzocco Linea PB 2-Group Dual Boiler"
                className="w-full px-3.5 py-2 text-xs bg-white border border-espresso/20 rounded-lg text-espresso focus:outline-none focus:ring-2 focus:ring-brass"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-display uppercase tracking-wider font-bold text-espresso/80 mb-1">
                  Brand *
                </label>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="e.g. La Marzocco / Victoria Arduino"
                  className="w-full px-3.5 py-2 text-xs bg-white border border-espresso/20 rounded-lg text-espresso focus:outline-none focus:ring-2 focus:ring-brass"
                />
              </div>

              <div>
                <label className="block text-xs font-display uppercase tracking-wider font-bold text-espresso/80 mb-1">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-white border border-espresso/20 rounded-lg text-espresso focus:outline-none focus:ring-2 focus:ring-brass"
                >
                  <option value="Commercial Espresso Machines">Commercial Espresso Machines</option>
                  <option value="Grinders">Grinders</option>
                  <option value="Ovens & Dishwashers">Ovens & Dishwashers</option>
                  <option value="Spare Parts">Spare Parts</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Pricing & Stock */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-display uppercase tracking-wider font-bold text-espresso/80 mb-1">
                  Selling Price (KES) *
                </label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="380000"
                  className="w-full px-3.5 py-2 text-xs bg-white border border-espresso/20 rounded-lg text-espresso focus:outline-none focus:ring-2 focus:ring-brass font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-display uppercase tracking-wider font-bold text-espresso/80 mb-1">
                  Original Price (KES)
                </label>
                <input
                  type="number"
                  value={initialPrice}
                  onChange={(e) => setInitialPrice(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="460000"
                  className="w-full px-3.5 py-2 text-xs bg-white border border-espresso/20 rounded-lg text-espresso focus:outline-none focus:ring-2 focus:ring-brass font-mono"
                />
                <span className="text-[10px] text-espresso/50">For discount badge calculation</span>
              </div>

              <div>
                <label className="block text-xs font-display uppercase tracking-wider font-bold text-espresso/80 mb-1">
                  Stock Units Available *
                </label>
                <input
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(Number(e.target.value))}
                  className="w-full px-3.5 py-2 text-xs bg-white border border-espresso/20 rounded-lg text-espresso focus:outline-none focus:ring-2 focus:ring-brass font-bold"
                />
              </div>
            </div>

            {/* Optional Variants */}
            <div className="space-y-2 pt-2 border-t border-espresso/10">
              <div className="flex items-center justify-between">
                <label className="text-xs font-display uppercase tracking-wider font-bold text-espresso/80">
                  Equipment Variants (Optional):
                </label>
                <button
                  type="button"
                  onClick={handleAddVariant}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-brass-dark hover:underline"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Variant
                </button>
              </div>

              {variants.map((v, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={v.name}
                    onChange={(e) => {
                      const copy = [...variants];
                      copy[idx].name = e.target.value;
                      setVariants(copy);
                    }}
                    placeholder="e.g. 2-Group High Cup"
                    className="flex-1 px-3 py-1.5 text-xs bg-white border border-espresso/20 rounded-lg text-espresso"
                  />
                  <input
                    type="number"
                    value={v.price ?? ''}
                    onChange={(e) => {
                      const copy = [...variants];
                      copy[idx].price = e.target.value ? Number(e.target.value) : undefined;
                      setVariants(copy);
                    }}
                    placeholder="Specific Price (opt)"
                    className="w-32 px-3 py-1.5 text-xs bg-white border border-espresso/20 rounded-lg text-espresso font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveVariant(idx)}
                    className="p-1.5 text-espresso/40 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Specifications & Description */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-display uppercase tracking-wider font-bold text-espresso/80 mb-1">
                Refurbishment & Condition Description *
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Details on ex-UK source, replacement parts, boiler descaling, and testing..."
                className="w-full px-3.5 py-2 text-xs bg-white border border-espresso/20 rounded-lg text-espresso focus:outline-none focus:ring-2 focus:ring-brass"
              />
            </div>

            <div className="space-y-2 pt-2 border-t border-espresso/10">
              <div className="flex items-center justify-between">
                <label className="text-xs font-display uppercase tracking-wider font-bold text-espresso/80">
                  Technical Specifications Table (Trust Kernel):
                </label>
                <button
                  type="button"
                  onClick={handleAddSpec}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-brass-dark hover:underline"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Spec Row
                </button>
              </div>

              {specifications.map((s, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={s.key}
                    onChange={(e) => {
                      const copy = [...specifications];
                      copy[idx].key = e.target.value;
                      setSpecifications(copy);
                    }}
                    placeholder="Feature (e.g. Boiler)"
                    className="w-1/3 px-3 py-1.5 text-xs bg-white border border-espresso/20 rounded-lg text-espresso font-semibold"
                  />
                  <input
                    type="text"
                    value={s.value}
                    onChange={(e) => {
                      const copy = [...specifications];
                      copy[idx].value = e.target.value;
                      setSpecifications(copy);
                    }}
                    placeholder="Spec (e.g. 7 Liters Stainless Steel)"
                    className="flex-1 px-3 py-1.5 text-xs bg-white border border-espresso/20 rounded-lg text-espresso"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveSpec(idx)}
                    className="p-1.5 text-espresso/40 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: 3+ Image Media Gallery */}
        {step === 4 && (
          <div className="space-y-4">
            <div className="p-3.5 bg-espresso-50 rounded-xl border border-espresso/10 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-brass" />
                <span className="font-bold text-espresso">Minimum 3 Photos Required:</span>
              </div>
              <span className={`font-display uppercase font-bold text-[11px] px-2 py-0.5 rounded-full ${
                images.length >= 3 ? 'bg-sage/20 text-sage-dark' : 'bg-red-100 text-red-800'
              }`}>
                {images.length} / 3 Attached {images.length >= 3 ? '✓ (Ready)' : '(Needs more)'}
              </span>
            </div>

            {/* Upload or Add URL */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="border-2 border-dashed border-espresso/20 hover:border-brass rounded-xl p-4 text-center cursor-pointer transition-all bg-white hover:bg-alabaster/40 flex flex-col items-center justify-center gap-1.5">
                <Upload className="w-6 h-6 text-brass" />
                <span className="text-xs font-display uppercase tracking-wider font-bold text-espresso">
                  Upload Device Images
                </span>
                <span className="text-[10px] text-espresso/50">Auto-compressed to Base64</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              <div className="border border-espresso/20 rounded-xl p-3 bg-white flex flex-col justify-between">
                <span className="text-[11px] font-display uppercase tracking-wider font-bold text-espresso/80">
                  Or Paste Image URL:
                </span>
                <div className="flex gap-2 mt-2">
                  <input
                    type="url"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="https://..."
                    className="flex-1 px-2.5 py-1.5 text-xs bg-alabaster/40 border border-espresso/20 rounded-lg text-espresso"
                  />
                  <button
                    type="button"
                    onClick={handleAddImageUrl}
                    className="px-3 py-1.5 bg-espresso text-alabaster rounded-lg text-xs font-bold"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            {/* Image Preview Grid */}
            {images.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 pt-2">
                {images.map((img, idx) => (
                  <div key={idx} className="relative aspect-video rounded-lg overflow-hidden border border-espresso/20 bg-espresso-900 group">
                    <img src={img} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-1 right-1 p-1 bg-red-600/90 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                    <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/60 text-white text-[9px] font-mono">
                      #{idx + 1}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Modal Action Footer */}
        <div className="pt-4 border-t border-espresso/10 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-espresso/20 text-xs font-display uppercase tracking-wider font-bold text-espresso hover:bg-espresso/5 transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
          ) : <div />}

          {step < 4 ? (
            <button
              type="button"
              onClick={handleNextStep}
              className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-full bg-espresso hover:bg-espresso-800 text-alabaster text-xs font-display uppercase tracking-wider font-bold transition-all shadow-md"
            >
              Next <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              disabled={isSubmitting || images.length < 3}
              onClick={handleSubmit}
              className={`inline-flex items-center gap-1.5 px-6 py-2.5 rounded-full text-xs font-display uppercase tracking-wider font-bold transition-all shadow-md ${
                images.length < 3
                  ? 'bg-espresso/20 text-espresso/40 cursor-not-allowed'
                  : 'bg-brass hover:bg-brass-light text-espresso-950 hover:scale-105'
              }`}
            >
              {isSubmitting ? 'Saving Appliance...' : 'Publish to Storefront'}
              <Check className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
