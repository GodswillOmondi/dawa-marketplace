import React, { useState } from 'react';
import Papa from 'papaparse';
import { importCsvProducts } from '../../lib/api';
import { X, Upload, FileSpreadsheet, CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';

interface CsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CsvImportModal: React.FC<CsvImportModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setError(null);

    Papa.parse(f, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setParsedRows(results.data);
      },
      error: (err) => {
        setError(`CSV parse error: ${err.message}`);
      },
    });
  };

  const handleImport = async () => {
    if (parsedRows.length === 0) {
      setError('Please select a valid CSV file with product rows.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await importCsvProducts(parsedRows);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to import products');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-espresso-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
      <div 
        className="relative w-full max-w-xl bg-alabaster rounded-2xl shadow-2xl border border-espresso/20 p-6 sm:p-8 space-y-6"
        style={{ overscrollBehavior: 'contain' }}
      >
        <div className="flex items-center justify-between pb-4 border-b border-espresso/10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-espresso flex items-center justify-center text-brass">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-espresso">
                Bulk CSV Product Import
              </h2>
              <p className="text-xs text-espresso/60 mt-0.5">
                Two-Stage Image Rule: Rows with &lt; 3 photos import as "Needs 3+ Images"
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

        {/* Informational Guidance */}
        <div className="p-4 bg-brass/10 border border-brass/30 rounded-xl flex items-start gap-3 text-xs text-espresso/80">
          <HelpCircle className="w-4 h-4 text-brass-dark shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-espresso">Two-Stage Safe CSV Ingestion:</p>
            <p className="mt-1 leading-relaxed">
              You do not need to host image URLs before uploading your spreadsheet. Any imported appliance with fewer than 3 photos is safely flagged as <strong>Needs 3+ Images</strong> and withheld from the buyer storefront until you attach photos via the 4-step modal.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-800">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* File Input */}
        <div>
          <label className="border-2 border-dashed border-espresso/25 hover:border-brass rounded-2xl p-6 text-center cursor-pointer transition-all bg-white hover:bg-alabaster/40 flex flex-col items-center justify-center gap-2 block">
            <Upload className="w-8 h-8 text-brass" />
            <span className="text-xs font-display uppercase tracking-wider font-bold text-espresso">
              {file ? file.name : 'Choose CSV Spreadsheet File'}
            </span>
            <span className="text-[11px] text-espresso/50">
              Columns: name, brand, category, price, stock, description
            </span>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </div>

        {/* Parsed Rows Preview */}
        {parsedRows.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-display uppercase tracking-wider font-bold text-espresso/70">
              <span>Ready to Import ({parsedRows.length} Rows Detected)</span>
              <span className="text-sage-dark flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Valid Format
              </span>
            </div>
            <div className="max-h-40 overflow-y-auto border border-espresso/15 rounded-xl bg-white p-2 divide-y divide-espresso/5 text-[11px]">
              {parsedRows.slice(0, 5).map((row, idx) => (
                <div key={idx} className="py-1.5 flex justify-between">
                  <span className="font-semibold truncate max-w-xs">{row.name || 'Row ' + (idx + 1)}</span>
                  <span className="font-mono text-espresso/60">KES {row.price || '0'}</span>
                </div>
              ))}
              {parsedRows.length > 5 && (
                <p className="py-1 text-center text-espresso/40 italic">
                  + {parsedRows.length - 5} more rows...
                </p>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-4 border-t border-espresso/10 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-full border border-espresso/20 text-xs font-display uppercase tracking-wider font-bold text-espresso hover:bg-espresso/5"
          >
            Cancel
          </button>
          <button
            disabled={parsedRows.length === 0 || isSubmitting}
            onClick={handleImport}
            className={`px-6 py-2.5 rounded-full text-xs font-display uppercase tracking-wider font-bold transition-all shadow-md ${
              parsedRows.length === 0 || isSubmitting
                ? 'bg-espresso/20 text-espresso/40 cursor-not-allowed'
                : 'bg-brass hover:bg-brass-light text-espresso-950 hover:scale-105'
            }`}
          >
            {isSubmitting ? 'Importing Rows...' : `Import ${parsedRows.length} Appliances`}
          </button>
        </div>
      </div>
    </div>
  );
};
