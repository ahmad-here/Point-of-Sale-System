/**
 * Storage Module Exports
 * Central export point for all storage-related functionality
 */

// Types
export type { 
  Product, 
  Sale, 
  Payment, 
  Customer, 
  SystemSettings, 
  ExportedData, 
  StorageKeyMap,
  DataStats 
} from './storage/types';

// Database
export { default as Database } from './storage/database';

// Export/Import
export { DataExporter } from './storage/export';
export { DataImporter, type ImportResult } from './storage/import';

// Utilities
export { StorageUtils } from './storage/utils';

// Context
export { DataManagerProvider, useDataManager } from './storage/index';
export type { DataManagerContextType } from './storage/index';
