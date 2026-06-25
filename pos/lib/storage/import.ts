/**
 * Data Import Module
 * Handles importing previously exported data from JSON files
 */

import Database from './database';
import { ExportedData } from './types';

export interface ImportResult {
  success: boolean;
  message: string;
  itemsImported?: {
    products: number;
    sales: number;
    payments: number;
    customers: number;
  };
  errors?: string[];
}

export class DataImporter {
  /**
   * Validate import data structure
   */
  static validateData(data: unknown): data is Omit<ExportedData, 'version'> {
    if (!data || typeof data !== 'object') return false;

    const d = data as any;
    return (
      Array.isArray(d.products) &&
      Array.isArray(d.sales) &&
      Array.isArray(d.payments) &&
      Array.isArray(d.customers) &&
      d.settings &&
      typeof d.settings === 'object'
    );
  }

  /**
   * Import data from file input
   */
  static async importFromFile(file: File): Promise<ImportResult> {
    return new Promise((resolve) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        try {
          const content = event.target?.result as string;
          const parsed = JSON.parse(content);

          if (!this.validateData(parsed)) {
            resolve({
              success: false,
              message: 'Invalid backup file format. Please ensure you are uploading a valid POS backup file.',
              errors: ['Missing required data fields'],
            });
            return;
          }

          // Clear existing data and restore
          Database.clearAllData();
          Database.restoreData(parsed);

          resolve({
            success: true,
            message: 'Data imported successfully!',
            itemsImported: {
              products: parsed.products.length,
              sales: parsed.sales.length,
              payments: parsed.payments.length,
              customers: parsed.customers.length,
            },
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          resolve({
            success: false,
            message: `Failed to import data: ${errorMessage}`,
            errors: [errorMessage],
          });
        }
      };

      reader.onerror = () => {
        resolve({
          success: false,
          message: 'Failed to read file. Please try again.',
          errors: ['File read error'],
        });
      };

      reader.readAsText(file);
    });
  }

  /**
   * Import from JSON string
   */
  static importFromJSON(jsonString: string): ImportResult {
    try {
      const parsed = JSON.parse(jsonString);

      if (!this.validateData(parsed)) {
        return {
          success: false,
          message: 'Invalid data format',
          errors: ['Missing required fields'],
        };
      }

      Database.clearAllData();
      Database.restoreData(parsed);

      return {
        success: true,
        message: 'Data imported successfully!',
        itemsImported: {
          products: parsed.products.length,
          sales: parsed.sales.length,
          payments: parsed.payments.length,
          customers: parsed.customers.length,
        },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        message: `Failed to parse JSON: ${errorMessage}`,
        errors: [errorMessage],
      };
    }
  }

  /**
   * Merge import data instead of replacing
   */
  static async mergeFromFile(file: File): Promise<ImportResult> {
    return new Promise((resolve) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        try {
          const content = event.target?.result as string;
          const parsed = JSON.parse(content);

          if (!this.validateData(parsed)) {
            resolve({
              success: false,
              message: 'Invalid backup file format',
              errors: ['Missing required data fields'],
            });
            return;
          }

          // Merge instead of replace
          const currentProducts = Database.getProducts();
          const currentSales = Database.getSales();
          const currentPayments = Database.getPayments();
          const currentCustomers = Database.getCustomers();

          // Merge with ID adjustment to avoid conflicts
          const maxProductId = Math.max(...currentProducts.map(p => p.id), 0);
          const maxSaleId = Math.max(...currentSales.map(s => s.id), 0);
          const maxCustomerId = Math.max(...currentCustomers.map(c => c.id), 0);

          const adjustedProducts = parsed.products.map((p, idx) => ({
            ...p,
            id: maxProductId + idx + 1,
          }));

          const adjustedSales = parsed.sales.map((s, idx) => ({
            ...s,
            id: maxSaleId + idx + 1,
          }));

          const adjustedCustomers = parsed.customers.map((c, idx) => ({
            ...c,
            id: maxCustomerId + idx + 1,
          }));

          // Merge and save
          Database.saveProducts([...currentProducts, ...adjustedProducts]);
          Database.saveSales([...currentSales, ...adjustedSales]);
          Database.savePayments([...currentPayments, ...parsed.payments]);
          Database.saveCustomers([...currentCustomers, ...adjustedCustomers]);

          resolve({
            success: true,
            message: 'Data merged successfully!',
            itemsImported: {
              products: adjustedProducts.length,
              sales: adjustedSales.length,
              payments: parsed.payments.length,
              customers: adjustedCustomers.length,
            },
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          resolve({
            success: false,
            message: `Failed to merge data: ${errorMessage}`,
            errors: [errorMessage],
          });
        }
      };

      reader.onerror = () => {
        resolve({
          success: false,
          message: 'Failed to read file',
          errors: ['File read error'],
        });
      };

      reader.readAsText(file);
    });
  }

  /**
   * Get import preview from file
   */
  static async getFilePreview(file: File): Promise<{ success: boolean; preview?: any; error?: string }> {
    return new Promise((resolve) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        try {
          const content = event.target?.result as string;
          const parsed = JSON.parse(content);

          if (!this.validateData(parsed)) {
            resolve({
              success: false,
              error: 'Invalid file format',
            });
            return;
          }

          resolve({
            success: true,
            preview: {
              exportedAt: parsed.exportedAt ? new Date(parsed.exportedAt) : 'Unknown',
              exportedBy: parsed.exportedBy || 'Unknown',
              items: {
                products: parsed.products.length,
                sales: parsed.sales.length,
                payments: parsed.payments.length,
                customers: parsed.customers.length,
              },
              totalRevenue: parsed.metadata?.totalRevenue || 0,
            },
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          resolve({
            success: false,
            error: errorMessage,
          });
        }
      };

      reader.onerror = () => {
        resolve({
          success: false,
          error: 'Failed to read file',
        });
      };

      reader.readAsText(file);
    });
  }
}

export default DataImporter;
