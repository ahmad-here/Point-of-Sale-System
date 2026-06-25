'use client';

import Button from '@/components/button';
import { X } from 'lucide-react';

interface EditInventoryModalProps {
  isOpen: boolean;
  productId: number | null;
  formData: {
    name: string;
    sku: string;
    categoryId: string;
    quantity: string;
    reorderLevel: string;
  };
  formError: string;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

export default function EditInventoryModal({
  isOpen,
  productId,
  formData,
  formError,
  onInputChange,
  onSubmit,
  onClose,
}: EditInventoryModalProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      
      {/* Modal Container */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-[#fffcf2] rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto pointer-events-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-[#ccc5b9]/30 sticky top-0 bg-[#fffcf2]">
          <h2 className="text-2xl font-bold text-[#252422]">Edit Product</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-[#ccc5b9]/20 rounded transition-colors"
          >
            <X className="w-6 h-6 text-[#403d39]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <form onSubmit={onSubmit} className="space-y-4">
            {formError && (
              <div className="p-4 bg-red-100 border border-red-300 rounded-lg text-red-700 text-sm">
                {formError}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-[#252422] mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={onInputChange}
                  placeholder="Enter product name"
                  className="w-full px-4 py-2 border border-[#ccc5b9] rounded-lg bg-white text-[#252422] placeholder-[#ccc5b9] focus:outline-none focus:border-[#eb5e28] focus:ring-1 focus:ring-[#eb5e28]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#252422] mb-2">
                  SKU *
                </label>
                <input
                  type="text"
                  name="sku"
                  value={formData.sku}
                  onChange={onInputChange}
                  placeholder="e.g., SKU-001"
                  className="w-full px-4 py-2 border border-[#ccc5b9] rounded-lg bg-white text-[#252422] placeholder-[#ccc5b9] focus:outline-none focus:border-[#eb5e28] focus:ring-1 focus:ring-[#eb5e28]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#252422] mb-2">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.categoryId}
                  onChange={onInputChange}
                  className="w-full px-4 py-2 border border-[#ccc5b9] rounded-lg bg-white text-[#252422] focus:outline-none focus:border-[#eb5e28] focus:ring-1 focus:ring-[#eb5e28]"
                >
                  <option value="">Select Category</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Accessories">Accessories</option>
                  <option value="Lighting">Lighting</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#252422] mb-2">
                  Quantity *
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={onInputChange}
                  placeholder="0"
                  min="0"
                  className="w-full px-4 py-2 border border-[#ccc5b9] rounded-lg bg-white text-[#252422] placeholder-[#ccc5b9] focus:outline-none focus:border-[#eb5e28] focus:ring-1 focus:ring-[#eb5e28]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#252422] mb-2">
                  Reorder Level
                </label>
                <input
                  type="number"
                  name="reorderLevel"
                  value={formData.reorderLevel}
                  onChange={onInputChange}
                  placeholder="10"
                  min="0"
                  className="w-full px-4 py-2 border border-[#ccc5b9] rounded-lg bg-white text-[#252422] placeholder-[#ccc5b9] focus:outline-none focus:border-[#eb5e28] focus:ring-1 focus:ring-[#eb5e28]"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-6">
              <Button variant="secondary" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button variant="primary" type="submit" className="flex-1">
                Update Product
              </Button>
            </div>
          </form>
        </div>
      </div>
      </div>
    </>
  );
}
