// Type definitions for Billing & Accounting System

export interface PurchaseOrder {
    id: string;
    poNumber: string;
    poDate: string;
    supplierName: string;
    supplierId: string;

    // Truck & Driver Info
    truckId: string;
    truckPlateNumber: string;
    trailerId: string;
    trailerPlateNumber: string;
    driverId: string;
    driverName: string;
    driverCode: string;

    // Order Items
    items: PurchaseOrderItem[];

    // Summary
    totalQuantity: number;
    totalAmount: number;

    // Status
    status: "draft" | "sent" | "confirmed" | "receiving" | "completed" | "cancelled";

    // Audit
    createdBy: string;
    createdAt: string;
    approvedBy?: string;
    approvedAt?: string;

    // Notes
    notes?: string;
}

export interface PurchaseOrderItem {
    oilType: string;
    quantity: number;
    estimatedPrice: number;
    totalAmount: number;
    branches: BranchOrderDetail[];
}

export interface BranchOrderDetail {
    branchId: number;
    branchName: string;
    quantity: number;
}

export interface ReceivingRecord {
    id: string;
    orderNo: string;
    poNumber: string;

    // Tax Invoice (CRITICAL - Required for VAT claim)
    taxInvoiceNo: string; // Required
    taxInvoiceDate: string; // Required

    // Receiving Details
    receiveDate: string;
    receiveTime: string;
    deliveryNoteNo?: string;

    items: ReceivingItem[];

    // Truck & Driver
    truckPlateNumber: string;
    trailerPlateNumber?: string;
    driverName: string;

    // Employee
    receiverEmployee: string;

    // Summary
    totalQuantityOrdered: number;
    totalQuantityReceived: number;
    totalAmount: number;

    status: "completed";

    // Audit
    createdBy: string;
    createdAt: string;
}

export interface ReceivingItem {
    oilType: string;
    quantityOrdered: number;
    quantityReceived: number;
    difference: number;
    differencePercent: number;

    // Pricing (for cost calculation)
    actualUnitPrice: number; // ราคาต่อหน่วยจริงจากใบกำกับ
    totalAmount: number; // quantityReceived * actualUnitPrice

    // Quality Check
    apiCheck?: number;
    temperature?: number;
}

export interface OilCost {
    oilType: string;
    currentStock: number;
    averageCost: number; // ต้นทุนเฉลี่ยต่อลิตร (Moving Weighted Average)
    totalValue: number; // currentStock * averageCost
    lastUpdated: string;
    history: CostHistory[];
}

export interface CostHistory {
    date: string;
    time: string;
    action: "purchase" | "sale" | "adjustment" | "transfer";
    documentNo: string;
    quantity: number;
    unitPrice: number;
    stockBefore: number;
    stockAfter: number;
    avgCostBefore: number;
    avgCostAfter: number;
    notes?: string;
}

export interface AccountingExportOptions {
    reportType: "purchase" | "sales" | "stock-card" | "tax-invoice-summary";
    startDate: string;
    endDate: string;
    oilType?: string; // For stock card
    branch?: string; // Optional filter
}

export interface PurchaseReportRow {
    date: string;
    poNumber: string;
    taxInvoiceNo: string;
    supplier: string;
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
    vat: number;
    total: number;
}

export interface StockCardRow {
    date: string;
    documentNo: string;
    description: string;
    in: number;
    out: number;
    balance: number;
    avgCost: number;
    value: number;
}

export interface TaxInvoiceSummaryRow {
    taxInvoiceNo: string;
    taxInvoiceDate: string;
    poNumber: string;
    supplier: string;
    amount: number;
    vat: number;
    total: number;
    status: string;
}
