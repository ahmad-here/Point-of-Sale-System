'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/header';
import Card from '@/components/card';
import Button from '@/components/button';
import { ArrowLeft, Upload } from 'lucide-react';
import { useInventory } from '../context';
import { useToast } from '@/app/providers/toast-provider';
import { useDataManager } from '@/lib/storage';


export default function AddInventory() {
    const { addCategory, categories } = useDataManager();
    const router = useRouter();
    const { addProduct, items } = useInventory();
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState<'form' | 'csv'>('form');
    const [formError, setFormError] = useState('');
    const [csvError, setCsvError] = useState('');
    const [csvFile, setCsvFile] = useState<File | null>(null);
    const [newCategoryName, setNewCategoryName] = useState('');

    const [isCustomCategory, setIsCustomCategory] = useState(false);



    // ✅ FIXED FORM STATE
    const [formData, setFormData] = useState({
        name: '',
        sku: '',
        categoryId: '',
        quantity: '',
        price: '',
        reorderLevel: '',
    });

    // =========================
    // INPUT CHANGE
    // =========================
    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;

        if (name === 'categoryId' && value === 'other') {
            setIsCustomCategory(true);
            return; // don't set categoryId to "other"
        }

        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddCategory = () => {
        const name = newCategoryName.trim(); // ← was wrongly using formData.categoryId

        if (!name) {
            setFormError('Please enter a category name');
            return;
        }

        const exists = categories.some(
            (c) => c.name.toLowerCase() === name.toLowerCase()
        );

        if (exists) {
            setFormError('Category already exists');
            return;
        }

        const created = addCategory({ name });

        // Set the dropdown to the newly created category
        setFormData(prev => ({
            ...prev,
            categoryId: String(created.id), // ← auto-select the new category
        }));

        setNewCategoryName('');       // clear the input
        setIsCustomCategory(false);   // hide the custom input
        setFormError('');
    };
    // =========================
    // SUBMIT PRODUCT
    // =========================
    const handleSubmitForm = (e: React.FormEvent) => {
        e.preventDefault();

        if (
            !formData.name ||
            !formData.sku ||
            !formData.categoryId ||
            !formData.quantity
        ) {
            setFormError('Please fill in all required fields');
            return;
        }

        addProduct({
            name: formData.name,
            sku: formData.sku,
            categoryId: Number(formData.categoryId), // ✅ IMPORTANT FIX
            quantity: parseInt(formData.quantity),
            price: parseFloat(formData.price) || 0,
            reorder: parseInt(formData.reorderLevel) || 10,
        });

        showToast(`${formData.name} added successfully!`, 'success');

        // =========================
        // RESET FORM (FIXED)
        // =========================
        setFormData({
            name: '',
            sku: '',
            categoryId: '',
            quantity: '',
            price: '',
            reorderLevel: '',
        });

        setIsCustomCategory(false);
        setFormError('');
    };


    const handleCSVFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setCsvFile(file);
            setCsvError('');
        }
    };

    const handleCSVUpload = async () => {
        if (!csvFile) {
            setCsvError('Please select a CSV file');
            return;
        }

        try {
            const text = await csvFile.text();
            const lines = text.split('\n').filter(line => line.trim());

            if (lines.length < 2) {
                setCsvError('CSV file must contain a header row and at least one data row');
                return;
            }

            const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
            const requiredHeaders = ['name', 'sku', 'category', 'quantity'];

            const hasRequiredHeaders = requiredHeaders.every(header =>
                headers.includes(header)
            );

            if (!hasRequiredHeaders) {
                setCsvError(`CSV must have columns: ${requiredHeaders.join(', ')}`);
                return;
            }

            let validCount = 0;

            for (let i = 1; i < lines.length; i++) {
                const values = lines[i].split(',').map(v => v.trim());
                const product: any = {};

                headers.forEach((header, index) => {
                    if (header === 'quantity' || header === 'reorderlevel') {
                        product[header === 'reorderlevel' ? 'reorder' : header] = parseInt(values[index]) || 0;
                    } else {
                        product[header] = values[index];
                    }
                });

                if (product.name && product.sku && product.category && product.quantity !== undefined) {
                    addProduct(product);
                    validCount++;
                }
            }

            if (validCount === 0) {
                setCsvError('No valid products found in CSV');
                return;
            }

            showToast(`${validCount} product${validCount > 1 ? 's' : ''} uploaded successfully!`, 'success');
            setCsvFile(null);
            setCsvError('');
        } catch (error) {
            setCsvError('Error parsing CSV file. Please check the format.');
        }
    };

    return (
        <div className="w-full ">
            <div className="flex items-center gap-4 p-6 border-b border-[#ccc5b9]/30">
                <button
                    onClick={() => router.back()}
                    className="p-2 hover:bg-[#ccc5b9]/20 rounded transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 text-[#252422]" />
                </button>
                <div>
                    <h1 className="text-3xl font-bold text-[#252422]">Add Inventory</h1>
                    <p className="text-[#403d39]">Add new products to your inventory</p>
                </div>
            </div>

            <div className="p-6 flex justify-center">
                <Card className="w-full max-w-4xl">
                    {/* Tabs */}
                    <div className="flex border-b border-[#ccc5b9]/30 px-6 pt-6">
                        <button
                            onClick={() => setActiveTab('form')}
                            className={`pb-4 px-4 font-semibold transition-colors border-b-2 ${activeTab === 'form'
                                ? 'text-[#eb5e28] border-[#eb5e28]'
                                : 'text-[#403d39] border-transparent hover:text-[#252422]'
                                }`}
                        >
                            Add Single Item
                        </button>
                        <button
                            onClick={() => setActiveTab('csv')}
                            className={`pb-4 px-4 font-semibold transition-colors border-b-2 ${activeTab === 'csv'
                                ? 'text-[#eb5e28] border-[#eb5e28]'
                                : 'text-[#403d39] border-transparent hover:text-[#252422]'
                                }`}
                        >
                            Upload CSV
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        {activeTab === 'form' ? (
                            <form onSubmit={handleSubmitForm} className="space-y-4">
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
                                            onChange={handleInputChange}
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
                                            onChange={handleInputChange}
                                            placeholder="e.g., SKU-001"
                                            className="w-full px-4 py-2 border border-[#ccc5b9] rounded-lg bg-white text-[#252422] placeholder-[#ccc5b9] focus:outline-none focus:border-[#eb5e28] focus:ring-1 focus:ring-[#eb5e28]"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-[#252422] mb-2">
                                            Category *
                                        </label>
                                        {!isCustomCategory ? (
                                            <select
                                                name="categoryId"
                                                value={formData.categoryId}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-2 border border-[#ccc5b9] rounded-lg bg-white text-[#252422] focus:outline-none focus:border-[#eb5e28] focus:ring-1 focus:ring-[#eb5e28]"
                                            >
                                                <option value="">Select Category</option>

                                                {categories.map((cat) => (
                                                    <option key={cat.id} value={cat.id}>
                                                        {cat.name}
                                                    </option>
                                                ))}

                                                <option value="other">+ Add New Category</option>
                                            </select>
                                        ) : (
                                            <div
                                                className="flex items-center gap-2">
                                                <input
                                                    type="text"
                                                    placeholder="Enter category name"
                                                    value={newCategoryName}              // ← was bound to formData.categoryId
                                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                                    autoFocus
                                                    className="w-full px-4 py-2 border border-[#ccc5b9] rounded-lg bg-white text-[#252422] placeholder-[#ccc5b9] focus:outline-none focus:border-[#eb5e28] focus:ring-1 focus:ring-[#eb5e28]"
                                                />
                                                <button className="px-4 py-2 bg-[#eb5e28] text-white rounded-lg hover:bg-[#d4501f] focus:outline-none focus:ring-2 focus:ring-[#eb5e28]" type="button" onClick={handleAddCategory}>
                                                    Add
                                                </button>
                                                <button className="px-4 py-2 bg-[#ccc5b9] text-[#252422] rounded-lg hover:bg-[#bbb4a6] focus:outline-none focus:ring-2 focus:ring-[#ccc5b9]" type="button" onClick={() => {
                                                    setIsCustomCategory(false);
                                                    setNewCategoryName('');
                                                }}>
                                                    Cancel
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-[#252422] mb-2">
                                            Quantity *
                                        </label>
                                        <input
                                            type="number"
                                            name="quantity"
                                            value={formData.quantity}
                                            onChange={handleInputChange}
                                            placeholder="0"
                                            min="0"
                                            className="w-full px-4 py-2 border border-[#ccc5b9] rounded-lg bg-white text-[#252422] placeholder-[#ccc5b9] focus:outline-none focus:border-[#eb5e28] focus:ring-1 focus:ring-[#eb5e28]"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-[#252422] mb-2">
                                            Price
                                        </label>
                                        <input
                                            type="number"
                                            name="price"
                                            value={formData.price}
                                            onChange={handleInputChange}
                                            placeholder="0.00"
                                            min="0"
                                            step="0.01"
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
                                            onChange={handleInputChange}
                                            placeholder="10"
                                            min="0"
                                            className="w-full px-4 py-2 border border-[#ccc5b9] rounded-lg bg-white text-[#252422] placeholder-[#ccc5b9] focus:outline-none focus:border-[#eb5e28] focus:ring-1 focus:ring-[#eb5e28]"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-6">
                                    <Button variant="secondary" onClick={() => router.back()} className="flex-1">
                                        Back
                                    </Button>
                                    <Button variant="primary" type="submit" className="flex-1">
                                        Add Product
                                    </Button>
                                </div>
                            </form>
                        ) : (
                            <div className="space-y-4">
                                {csvError && (
                                    <div className="p-4 bg-red-100 border border-red-300 rounded-lg text-red-700 text-sm">
                                        {csvError}
                                    </div>
                                )}

                                <div className="border-2 border-dashed border-[#ccc5b9] rounded-lg p-8 text-center">
                                    <Upload className="w-12 h-12 text-[#eb5e28] mx-auto mb-4" />
                                    <p className="text-[#252422] font-semibold mb-2">Upload CSV File</p>
                                    <p className="text-sm text-[#403d39] mb-4">
                                        Required columns: name, sku, category, quantity
                                    </p>
                                    <label>
                                        <input
                                            type="file"
                                            accept=".csv"
                                            onChange={handleCSVFileChange}
                                            className="hidden"
                                        />
                                        <span className="inline-block px-6 py-2 bg-[#eb5e28]/20 text-[#eb5e28] rounded-lg font-semibold cursor-pointer hover:bg-[#eb5e28]/30 transition-colors">
                                            Choose File
                                        </span>
                                    </label>
                                </div>

                                {csvFile && (
                                    <div className="p-4 bg-[#fffcf2] border border-[#ccc5b9] rounded-lg">
                                        <p className="text-sm text-[#252422] font-semibold">Selected: {csvFile.name}</p>
                                        <p className="text-xs text-[#403d39]">Size: {(csvFile.size / 1024).toFixed(2)} KB</p>
                                    </div>
                                )}

                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <p className="text-sm text-blue-900 font-semibold mb-2">CSV Format Example:</p>
                                    <pre className="text-xs bg-white border border-blue-100 p-3 rounded overflow-x-auto">
                                        {`name,sku,category,quantity
Wireless Mouse,WM-001,Electronics,150
USB Cable,USB-001,Accessories,300`}
                                    </pre>
                                </div>

                                <div className="flex gap-3 pt-6">
                                    <Button variant="secondary" onClick={() => router.back()} className="flex-1">
                                        Back
                                    </Button>
                                    <Button
                                        variant="primary"
                                        onClick={handleCSVUpload}
                                        disabled={!csvFile}
                                        className="flex-1"
                                    >
                                        Upload Products
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>

                </Card>
            </div>
        </div>
    );
}
