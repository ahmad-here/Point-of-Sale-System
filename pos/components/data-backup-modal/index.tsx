/**
 * Data Export/Import Modal Component
 * Handles UI for backing up and restoring data
 */

'use client';

import React, { useState, useRef } from 'react';
import Button from '@/components/button';
import { useDataManager } from '@/lib/storage';
import { Download, Upload, AlertCircle, CheckCircle, Loader } from 'lucide-react';

interface DataBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DataBackupModal({ isOpen, onClose }: DataBackupModalProps) {
  const { exportData, importData, mergeData, stats } = useDataManager();
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [mergeMode, setMergeMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    try {
      setLoading(true);
      exportData('json');
      setMessage({
        type: 'success',
        text: 'Data exported successfully! File downloading...',
      });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Failed to export data. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async (file: File) => {
    try {
      setLoading(true);
      const result = await importData(file);

      if (result.success) {
        setMessage({
          type: 'success',
          text: `Data restored successfully! Imported ${result.itemsImported?.products || 0} products, ${result.itemsImported?.sales || 0} sales, ${result.itemsImported?.payments || 0} payments, ${result.itemsImported?.customers || 0} customers.`,
        });
        setTimeout(() => {
          setMessage(null);
          onClose();
        }, 3000);
      } else {
        setMessage({
          type: 'error',
          text: result.message,
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Failed to import data. Please check the file format.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMerge = async (file: File) => {
    try {
      setLoading(true);
      const result = await mergeData(file);

      if (result.success) {
        setMessage({
          type: 'success',
          text: `Data merged successfully! Added ${result.itemsImported?.products || 0} products and ${result.itemsImported?.sales || 0} sales.`,
        });
        setTimeout(() => {
          setMessage(null);
          onClose();
        }, 3000);
      } else {
        setMessage({
          type: 'error',
          text: result.message,
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Failed to merge data. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (mergeMode) {
        handleMerge(file);
      } else {
        handleImport(file);
      }
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Data Backup & Restore</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b bg-gray-50">
          <div className="flex">
            <button
              onClick={() => setActiveTab('export')}
              className={`flex-1 py-4 px-6 font-medium border-b-2 transition-colors ${
                activeTab === 'export'
                  ? 'text-blue-600 border-blue-600'
                  : 'text-gray-600 border-transparent hover:text-gray-900'
              }`}
            >
              <Download className="inline mr-2 w-5 h-5" />
              Export Data
            </button>
            <button
              onClick={() => setActiveTab('import')}
              className={`flex-1 py-4 px-6 font-medium border-b-2 transition-colors ${
                activeTab === 'import'
                  ? 'text-blue-600 border-blue-600'
                  : 'text-gray-600 border-transparent hover:text-gray-900'
              }`}
            >
              <Upload className="inline mr-2 w-5 h-5" />
              Import Data
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Messages */}
          {message && (
            <div
              className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${
                message.type === 'success'
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {message.type === 'success' ? (
                <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              )}
              <span>{message.text}</span>
            </div>
          )}

          {/* Export Tab */}
          {activeTab === 'export' && (
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Backup Your Data</h3>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Products</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.totalProducts}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Sales</p>
                  <p className="text-2xl font-bold text-green-600">{stats.totalSales}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Payments</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.completedPayments}</p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Revenue</p>
                  <p className="text-2xl font-bold text-orange-600">${stats.totalRevenue.toFixed(2)}</p>
                </div>
              </div>

              {/* Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-900">
                  <strong>Tip:</strong> Export your data regularly to create a backup. You can restore it anytime by
                  importing the downloaded file.
                </p>
              </div>

              {/* Export Button */}
              <Button
                variant="primary"
                size="lg"
                
                disabled={loading}
                onClick={handleExport}
              >
                {loading ? (
                  <>
                    <Loader className="inline mr-2 w-5 h-5 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="inline mr-2 w-5 h-5" />
                    Download Backup File
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Import Tab */}
          {activeTab === 'import' && (
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Restore Your Data</h3>

              {/* Mode Selection */}
              <div className="mb-6 space-y-3">
                <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50"
                  style={{ borderColor: !mergeMode ? '#3b82f6' : '#e5e7eb' }}>
                  <input
                    type="radio"
                    checked={!mergeMode}
                    onChange={() => setMergeMode(false)}
                    className="w-4 h-4"
                  />
                  <div className="ml-3">
                    <p className="font-medium text-gray-900">Replace All Data</p>
                    <p className="text-sm text-gray-600">This will replace all existing data with the backup file</p>
                  </div>
                </label>

                <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50"
                  style={{ borderColor: mergeMode ? '#3b82f6' : '#e5e7eb' }}>
                  <input
                    type="radio"
                    checked={mergeMode}
                    onChange={() => setMergeMode(true)}
                    className="w-4 h-4"
                  />
                  <div className="ml-3">
                    <p className="font-medium text-gray-900">Merge With Existing Data</p>
                    <p className="text-sm text-gray-600">This will add the backup data without removing existing data</p>
                  </div>
                </label>
              </div>

              {/* Warning */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-red-900">
                  <strong>Warning:</strong> {mergeMode ? 
                    'Merged data may have duplicate IDs. Review your data after import.' :
                    'This action cannot be undone. All current data will be replaced.'}
                </p>
              </div>

              {/* Upload Area */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors"
              >
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="font-medium text-gray-900">Choose a backup file</p>
                <p className="text-sm text-gray-600">or drag and drop here</p>
                <p className="text-xs text-gray-500 mt-2">.json format (exported from this system)</p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />

              <Button
                variant="secondary"
                size="lg"
                disabled={loading}
                onClick={() => fileInputRef.current?.click()}
                className="mt-4"
              >
                {loading ? (
                  <>
                    <Loader className="inline mr-2 w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Upload className="inline mr-2 w-5 h-5" />
                    Select File
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-6 bg-gray-50 flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

export default DataBackupModal;
