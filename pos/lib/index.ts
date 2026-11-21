/**
 * Storage Module Exports
 * Central export point for all storage-related functionality
 */

export type {
  Product,
  Category,
  Sale,
  SaleItem,
  Payment,
  PaymentMethod,
  Customer,
  SystemSettings,
  ExportedData,
  StorageKeyMap,
  DataStats,
} from './storage/types';

export { default as Database } from './storage/database';
export { DataExporter } from './storage/export';
export { DataImporter, type ImportResult } from './storage/import';
export { StorageUtils } from './storage/utils';
export { DataManagerProvider, useDataManager, useMoney } from './storage/index';
export type { DataManagerContextType } from './storage/index';
