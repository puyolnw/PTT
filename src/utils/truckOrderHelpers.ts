// Helper functions for TruckOrders and OilReceipt integration

/**
 * Generate Transport Number (TR-YYYYMMDD-XXX)
 */
export function generateTransportNo(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const random = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
    return `TR-${year}${month}${day}-${random}`;
}

/**
 * Get TruckOrder by Purchase Order Number
 */
export function getTruckOrderByPO(purchaseOrderNo: string, truckOrders: any[]): any | undefined {
    return truckOrders.find(order => order.purchaseOrderNo === purchaseOrderNo);
}

/**
 * Get TruckOrder by Transport Number
 */
export function getTruckOrderByTransportNo(transportNo: string, truckOrders: any[]): any | undefined {
    return truckOrders.find(order => order.transportNo === transportNo);
}

/**
 * Check if TruckOrder has Oil Receipt
 */
export function hasOilReceipt(order: any): boolean {
    return !!order.oilReceiptId;
}

/**
 * Get Receipt Status for TruckOrder
 */
export function getReceiptStatus(order: any): 'ยังไม่รับ' | 'รับแล้ว' {
    return order.oilReceiptId ? 'รับแล้ว' : 'ยังไม่รับ';
}
