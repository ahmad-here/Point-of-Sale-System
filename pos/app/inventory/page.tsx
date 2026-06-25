'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/header';
import Card from '@/components/card';
import Button from '@/components/button';
import Badge from '@/components/badge';
import EditInventoryModal from '@/components/edit-inventory-modal';
import { Package, Plus, Search, ChevronDown } from 'lucide-react';
import { useInventory } from './context';
import { useToast } from '@/app/providers/toast-provider';
import { useDataManager } from '@/lib/storage';
import { Product } from '@/lib/storage/types';


export default function Inventory() {
  const router = useRouter();
  const { categories } = useDataManager();
  const { items, updateProduct, deleteProduct } = useInventory();
  const { showToast } = useToast();
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'sku' | 'quantity'>('name');
  const [filterStatus, setFilterStatus] = useState<
    'all' | 'In Stock' | 'Low Stock' | 'Out of Stock'
  >('all');

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editFormError, setEditFormError] = useState('');

  const [editFormData, setEditFormData] = useState({
    name: '',
    sku: '',
    categoryId: '',
    quantity: '',
    reorderLevel: '',
  });

  // =========================
  // FILTER + SEARCH + SORT
  // =========================

  const filteredItems = useMemo(() => {
    let filtered = items;

    // status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(item => item.status === filterStatus);
    }

    // search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();

      filtered = filtered.filter(item => {
        const categoryName =
          categories.find(c => c.id === item.categoryId)?.name || '';

        return (
          item.name.toLowerCase().includes(query) ||
          item.sku.toLowerCase().includes(query) ||
          categoryName.toLowerCase().includes(query)
        );
      });
    }

    return filtered;
  }, [items, filterStatus, searchQuery, categories]);

  // sorting
  const sortedItems = useMemo(() => {
    const sorted = [...filteredItems];

    if (sortBy === 'name') {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'sku') {
      sorted.sort((a, b) => a.sku.localeCompare(b.sku));
    } else if (sortBy === 'quantity') {
      sorted.sort((a, b) => a.quantity - b.quantity);
    }

    return sorted;
  }, [filteredItems, sortBy]);

  // =========================
  // EDIT PRODUCT
  // =========================
  const handleEditProduct = (product: Product) => {
    setEditingId(product.id);

    setEditFormData({
      name: product.name,
      sku: product.sku,
      categoryId: product.categoryId.toString(), // ✅ FIXED
      quantity: product.quantity.toString(),
      reorderLevel: product.reorder.toString(),
    });

    setEditFormError('');
    setIsEditModalOpen(true);
  };

  const handleEditInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setEditFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    setEditFormError('');
  };

  // =========================
  // UPDATE PRODUCT
  // =========================

  const handleUpdateProduct = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !editFormData.name ||
      !editFormData.sku ||
      !editFormData.categoryId ||
      !editFormData.quantity
    ) {
      setEditFormError('Please fill in all required fields');
      return;
    }

    if (editingId !== null) {
      updateProduct(editingId, {
        name: editFormData.name,
        sku: editFormData.sku,
        categoryId: Number(editFormData.categoryId), // ✅ FIXED
        quantity: parseInt(editFormData.quantity),
        reorder: parseInt(editFormData.reorderLevel) || 10,
      });

      showToast(`${editFormData.name} updated successfully!`, 'success');

      setIsEditModalOpen(false);
      setEditingId(null);
    }
  };
  const handleDeleteProduct = (productId: number) => {
    if (confirm('Are you sure you want to delete this product?')) {
      deleteProduct(productId);
      showToast('Product deleted successfully!', 'success');
    }
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingId(null);
    setEditFormError('');

    setEditFormData({
      name: '',
      sku: '',
      categoryId: '',
      quantity: '',
      reorderLevel: '',
    });
  };

  return (
    <div className="w-full">
      <Header title="Inventory" subtitle="Manage your products and stock levels" />

      <div className="p-6 min-h-[calc(100vh-100px)]">
        {/* Actions Bar */}
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-[#403d39]" />
              <input
                type="text"
                placeholder="Search by name, SKU, or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[#ccc5b9]/20 border border-[#ccc5b9]/50 rounded-lg text-[#252422] placeholder-[#403d39] focus:outline-none focus:border-[#eb5e28]"
              />
            </div>

            {/* Sort Button */}
            <div className="relative">
              <button
                onClick={() => setShowSortMenu(!showSortMenu)}
                className="px-4 py-2 bg-[#ccc5b9]/20 border border-[#ccc5b9]/50 rounded-lg text-[#252422] hover:bg-[#ccc5b9]/30 transition-colors  flex items-center gap-2 whitespace-nowrap"
              >
                Sort
                <ChevronDown className="w-4 h-4" />
              </button>
              {showSortMenu && (
                <div className="absolute top-full right-0 mt-2 bg-white border border-[#ccc5b9] rounded-lg shadow-lg z-10 ">
                  <button
                    onClick={() => {
                      setSortBy('name');
                      setShowSortMenu(false);
                    }}
                    className={`w-full text-left px-4 py-2 hover:bg-[#fffcf2] transition-colors border-b border-[#ccc5b9]/30 ${sortBy === 'name' ? 'text-[#eb5e28] font-semibold' : 'text-[#252422]'}`}
                  >
                    Product Name
                  </button>
                  <button
                    onClick={() => {
                      setSortBy('sku');
                      setShowSortMenu(false);
                    }}
                    className={`width-full text-left px-4 py-2 hover:bg-[#fffcf2] transition-colors border-b border-[#ccc5b9]/30 ${sortBy === 'sku' ? 'text-[#eb5e28] font-semibold' : 'text-[#252422]'}`}
                  >
                    SKU
                  </button>
                  <button
                    onClick={() => {
                      setSortBy('quantity');
                      setShowSortMenu(false);
                    }}
                    className={` text-left px-4 py-2 hover:bg-[#fffcf2] transition-colors ${sortBy === 'quantity' ? 'text-[#eb5e28] font-semibold' : 'text-[#252422]'}`}
                  >
                    Quantity (Low to High)
                  </button>
                </div>
              )}
            </div>

            {/* Filter Button */}
            <div className="relative">
              <button
                onClick={() => setShowFilterMenu(!showFilterMenu)}
                className="px-4 py-2 bg-[#ccc5b9]/20 border border-[#ccc5b9]/50 rounded-lg text-[#252422] hover:bg-[#ccc5b9]/30 transition-colors flex items-center gap-2 whitespace-nowrap"
              >
                Filter
                <ChevronDown className="w-4 h-4" />
              </button>
              {showFilterMenu && (
                <div className="absolute top-full right-0 mt-2 bg-white border border-[#ccc5b9] rounded-lg shadow-lg z-10">
                  <button
                    onClick={() => {
                      setFilterStatus('all');
                      setShowFilterMenu(false);
                    }}
                    className={`w-full text-left px-4 py-2 hover:bg-[#fffcf2] transition-colors border-b border-[#ccc5b9]/30 ${filterStatus === 'all' ? 'text-[#eb5e28] font-semibold' : 'text-[#252422]'}`}
                  >
                    All Status
                  </button>
                  <button
                    onClick={() => {
                      setFilterStatus('In Stock');
                      setShowFilterMenu(false);
                    }}
                    className={`w-full text-left px-4 py-2 hover:bg-[#fffcf2] transition-colors border-b border-[#ccc5b9]/30 ${filterStatus === 'In Stock' ? 'text-[#eb5e28] font-semibold' : 'text-[#252422]'}`}
                  >
                    In Stock
                  </button>
                  <button
                    onClick={() => {
                      setFilterStatus('Low Stock');
                      setShowFilterMenu(false);
                    }}
                    className={`w-full text-left px-4 py-2 hover:bg-[#fffcf2] transition-colors border-b border-[#ccc5b9]/30 ${filterStatus === 'Low Stock' ? 'text-[#eb5e28] font-semibold' : 'text-[#252422]'}`}
                  >
                    Low Stock
                  </button>
                  <button
                    onClick={() => {
                      setFilterStatus('Out of Stock');
                      setShowFilterMenu(false);
                    }}
                    className={`w-full text-left px-4 py-2 hover:bg-[#fffcf2] transition-colors ${filterStatus === 'Out of Stock' ? 'text-[#eb5e28] font-semibold' : 'text-[#252422]'}`}
                  >
                    Out of Stock
                  </button>
                </div>
              )}
            </div>

            <Button variant="primary" size="md" onClick={() => router.push('/inventory/add-inventory')}>
              <Plus className="w-4 h-4" />
              Add Product
            </Button>
          </div>
        </div>

        {/* Inventory Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#ccc5b9]/30">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#252422]">Product Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#252422]">SKU</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#252422]">Category</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#252422]">Quantity</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#252422]">Price</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#252422]">Reorder Level</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#252422]">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#252422]">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.length > 0 ? (
                  filteredItems.map((item) => (
                    console.log('Rendering item:', item), // Debug log to check item data
                    <tr key={item.id} className="border-b border-[#ccc5b9]/20 hover:bg-[#ccc5b9]/10 transition-colors">
                      <td className="px-6 py-4 text-sm text-[#252422]">{item.name}</td>
                      <td className="px-6 py-4 text-sm text-[#403d39]">{item.sku}</td>
                      <td className="px-6 py-4 text-sm text-[#403d39]">{categories.find(c => c.id === item.categoryId)?.name}</td>
                      <td className="px-6 py-4 text-sm text-[#252422] font-semibold">{item.quantity.toFixed(2)}</td>
                      <td className="px-6 py-4 text-sm text-[#403d39]">${item.price.toFixed(2)}</td>
                      <td className="px-6 py-4 text-sm text-[#403d39]">{item.reorder.toFixed(2)}</td>
                      <td className="px-6 py-4 text-sm">
                        <Badge
                          variant={
                            item.status === 'In Stock'
                              ? 'success'
                              : item.status === 'Low Stock'
                                ? 'warning'
                                : 'danger'
                          }
                        >
                          {item.status}
                        </Badge>
                      </td>
                      <td className="flex gap-2 px-6 py-4 text-sm">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditProduct(item)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeleteProduct(item.id)}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-[#ccc5b9]">
                      No products found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <EditInventoryModal
        isOpen={isEditModalOpen}
        productId={editingId}
        formData={editFormData}
        formError={editFormError}
        onInputChange={handleEditInputChange}
        onSubmit={handleUpdateProduct}
        onClose={handleCloseEditModal}
      />
    </div>

  );
}
