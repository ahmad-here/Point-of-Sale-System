'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { X, Search, Check } from 'lucide-react';
import Card from '@/components/card';
import Button from '@/components/button';
import { usePayments } from '@/app/payments/context';
import { useCheckout } from '@/app/dashboard/checkout-context';
import { useDataManager } from '@/lib/storage';
import { useToast } from '@/app/providers/toast-provider';
interface SaleItem {
  product: any;
  quantity: number;
  subtotal: number;
}

export default function ProductEntry() {
  const [searchQuery, setSearchQuery] = useState('');
  const { showToast } = useToast();
  const { categories } = useDataManager();
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const router = useRouter();
  const { addPayment } = usePayments();
  const { setSaleCheckoutData } = useCheckout();
  const { products } = useDataManager();

  // Filter products based on search
  const filteredProducts = useMemo(
    () =>
      products.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.sku.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [products, searchQuery]
  );

  const handleAddProduct = (product: any) => {
  if (product.quantity <= 0) {
    showToast(`${product.name} is out of stock`, 'error');
    return;
  }

  const existingItem = saleItems.find(
    (item) => item.product.id === product.id
  );

  if (existingItem) {
    if (existingItem.quantity >= product.quantity) {
      showToast(
        `Only ${product.quantity} ${product.name} available in stock`,
        'warning'
      );
      return;
    }

    setSaleItems(
      saleItems.map((item) =>
        item.product.id === product.id
          ? {
              ...item,
              quantity: item.quantity + 1,
              subtotal: (item.quantity + 1) * item.product.price,
            }
          : item
      )
    );
  } else {
    setSaleItems([
      ...saleItems,
      {
        product,
        quantity: 1,
        subtotal: product.price,
      },
    ]);
  }

  setSearchQuery('');
};

  const handleUpdateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveItem(productId);
      return;
    }

    setSaleItems(
      saleItems.map((item) =>
        item.product.id === productId
          ? {
              ...item,
              quantity: newQuantity,
              subtotal: newQuantity * item.product.price,
            }
          : item
      )
    );
  };

  const handleRemoveItem = (productId: string) => {
    setSaleItems(saleItems.filter((item) => item.product.id !== productId));
  };

  const totalAmount = saleItems.reduce((sum, item) => sum + item.subtotal, 0);

  const handleCompleteSale = () => {
    if (saleItems.length > 0) {
      // Generate order ID
      const orderId = `#${1000 + Math.floor(Math.random() * 9000)}`;

      // Add payment to context
      addPayment({
        orderId,
        amount: totalAmount,
        method: 'Cash', // Default to Cash for manual sales
        status: 'Completed',
        date: new Date().toISOString().split('T')[0],
        notes: `Sale of ${saleItems.length} items`,
      });

      // Show success message
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);

      // Clear the sale items
      setSaleItems([]);
    }
  };

  const handleCheckout = () => {
    if (saleItems.length > 0) {
      // Store sale data in checkout context
      setSaleCheckoutData(saleItems, totalAmount);
      // Navigate to checkout page
      router.push('/dashboard/process-checkout');
    }
  };

  // Show filtered products if searching, otherwise show all products
  const displayProducts = searchQuery ? filteredProducts : products;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-100px)] overflow-hidden">
      {/* Items List Section */}
      <div className="flex flex-col overflow-hidden">
        {/* Search Bar */}
        <Card className="p-4 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-[#ccc5b9]" />
            <input
              type="text"
              placeholder="Search product name or SKU..."
              value={searchQuery || ''}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-[#ccc5b9] rounded-lg bg-white text-[#252422] placeholder-[#ccc5b9] focus:outline-none focus:border-[#eb5e28] focus:ring-1 focus:ring-[#eb5e28]"
            />
          </div>
        </Card>

        {/* Products List */}
        <Card className="flex-1 overflow-y-auto">
          {displayProducts.length > 0 ? (
            <div className="p-4 space-y-3">
              {displayProducts.map((product) => (
                console.log(product),
                <button
                  key={product.id}
                  onClick={() => handleAddProduct(product)}
                  className="w-full text-left p-4 bg-gradient-to-r from-[#fffcf2] to-[#ccc5b9]/10 border border-[#ccc5b9] rounded-lg hover:border-[#eb5e28] hover:shadow-lg transition-all group"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <p className="font-semibold text-[#252422] group-hover:text-[#eb5e28] transition-colors">
                        {product.name}
                      </p>
                      <p className="text-xs text-[#ccc5b9]">SKU: {product.sku} • { categories.find((cat) => cat.id === product.categoryId)?.name || 'Unknown Category'}</p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="font-bold text-[#eb5e28] text-lg">${product.price.toFixed(2)}</p>
                      <p className="text-xs text-[#403d39]">{product.quantity} in stock</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              <p className="text-[#ccc5b9]">Add products in the inventory</p>
              <button onClick={() => router.push('/inventory')} className="mt-3 px-4 py-2 bg-[#eb5e28] text-white rounded-lg hover:bg-[#eb5e28]/90 transition-colors">
                Inventory +
              </button>
            </div>
          )}
        </Card>
      </div>

      {/* Bill Summary Section */}
      <div className="flex flex-col overflow-hidden max-h-[calc(100vh-100px)]">
        <Card className="flex flex-col h-full p-4">
          <h3 className="text-lg font-semibold text-[#252422] mb-4">Bill</h3>

          {/* Items List in Bill */}
          <div className="flex-1 overflow-y-auto mb-4 space-y-2">
          {saleItems.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-center text-[#ccc5b9]">No items added</p>
            </div>
          ) : (
            saleItems.map((item) => (
              <div
                key={item.product.id}
                className="p-3 bg-[#fffcf2] rounded border border-[#ccc5b9]/30 space-y-2"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1 pr-2">
                    <p className="font-medium text-sm text-[#252422] line-clamp-2">
                      {item.product.name}
                    </p>
                    <p className="text-xs text-[#ccc5b9]">
                      ${item.product.price.toFixed(2)} each
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemoveItem(item.product.id)}
                    className="p-1 hover:bg-red-100 rounded transition-colors flex-shrink-0"
                  >
                    <X className="w-4 h-4 text-red-600" />
                  </button>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleUpdateQuantity(item.product.id, item.quantity - 1)}
                    className="px-2 py-1 bg-[#eb5e28]/20 text-[#eb5e28] rounded text-sm font-semibold hover:bg-[#eb5e28]/30 transition-colors"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity || 0}
                    onChange={(e) =>
                      handleUpdateQuantity(item.product.id, parseInt(e.target.value) || 1)
                    }
                    className="w-12 text-center px-2 py-1 border border-[#ccc5b9] rounded text-sm text-[#252422]"
                  />
                  <button
                    onClick={() => handleUpdateQuantity(item.product.id, item.quantity + 1)}
                    className="px-2 py-1 bg-[#eb5e28]/20 text-[#eb5e28] rounded text-sm font-semibold hover:bg-[#eb5e28]/30 transition-colors"
                  >
                    +
                  </button>
                  <span className="ml-auto font-semibold text-[#eb5e28] whitespace-nowrap">
                    ${item.subtotal.toFixed(2)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Bill Summary Footer - Always Show */}
        <div className="space-y-3 border-t border-[#ccc5b9]/30 pt-4">
          <div className="flex justify-between text-sm text-[#403d39]">
            <span>Items:</span>
            <span className="font-medium">{saleItems.length}</span>
          </div>
          <div className="flex justify-between text-sm text-[#403d39]">
            <span>Subtotal:</span>
            <span>${totalAmount.toFixed(2)}</span>
          </div>

          <div className="flex justify-between items-center py-3 border-t border-[#eb5e28]/30">
            <span className="font-semibold text-[#252422]">Total:</span>
            <span className="text-2xl font-bold text-[#eb5e28]">
              ${totalAmount.toFixed(2)}
            </span>
          </div>
        </div>

        <Button
          variant="primary"
          className="w-full mt-4"
          disabled={saleItems.length === 0}
          onClick={handleCheckout}
        >
          Checkout
        </Button>

        {/* Success Message */}
        {showSuccessMessage && (
          <div className="w-full mt-3 p-3 bg-green-100 border border-green-300 rounded-lg flex items-center gap-2">
            <Check className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-700">Payment recorded successfully!</span>
          </div>
        )}

        <Button
          variant="secondary"
          className="w-full mt-2"
          onClick={() => setSaleItems([])}
          disabled={saleItems.length === 0}
        >
          Clear Bill
        </Button>
        </Card>
      </div>
    </div>
  );
}
