// Type definitions for Lubricants System

export type ProductCategory = "lubricants" | "engine-oil" | "brake-fluid" | "coolant" | "other";

export type SalesChannel = "pos" | "fit-auto";

export type ProductStatus = "in-stock" | "low-stock" | "out-of-stock";

export interface SalesChannelData {
    dailySales: number;
    lastSyncDate: string;
    elsaReferenceId?: string;
}

export interface Product {
    id: string;
    name: string;
    brand?: string;
    category: ProductCategory;
    unit: string;
    currentStock: number;
    minThreshold: number;
    pricePerUnit: number;
    status: ProductStatus;
    lastUpdated: string;

    // Dual Channel Sales Tracking
    salesChannels: {
        pos: SalesChannelData;
        fitAuto: SalesChannelData;
    };

    // Product Lifecycle
    purchaseOrders: string[];
    receivingHistory: string[];
    salesHistory: string[];
}

export interface SalesTransaction {
    id: string;
    transactionNo: string;
    productId: string;
    productName: string;
    quantity: number;
    pricePerUnit: number;
    totalAmount: number;
    channel: SalesChannel;
    date: string;
    time: string;
    soldBy: string;
    elsaReferenceId?: string;
    notes?: string;
}

export interface ElsaSalesData {
    productId: string;
    productName: string;
    quantity: number;
    date: string;
    elsaReferenceId: string;
    serviceAdvisor?: string;
}

export interface ElsaImportRecord {
    id: string;
    importDate: string;
    importTime: string;
    fileName: string;
    totalRecords: number;
    successRecords: number;
    failedRecords: number;
    status: "success" | "partial" | "failed";
    importedBy: string;
    salesData: ElsaSalesData[];
    errors?: {
        row: number;
        productId: string;
        error: string;
    }[];
}

export interface ValidationResult {
    isValid: boolean;
    errors: {
        row: number;
        field: string;
        message: string;
    }[];
    warnings: {
        row: number;
        field: string;
        message: string;
    }[];
}

export interface MatchResult {
    matched: {
        elsaData: ElsaSalesData;
        product: Product;
    }[];
    unmatched: {
        elsaData: ElsaSalesData;
        reason: string;
    }[];
}

export interface ImportResult {
    success: boolean;
    importRecord: ElsaImportRecord;
    updatedProducts: Product[];
    message: string;
}

export interface DailyReconciliation {
    date: string;
    openingStock: number;
    stockIn: number;
    posSales: number;
    fitAutoSales: number;
    closingStock: number;
    variance: number;
    reconciled: boolean;
    reconciledBy?: string;
    reconciledAt?: string;
}
