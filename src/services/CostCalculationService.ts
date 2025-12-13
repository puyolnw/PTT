import { OilCost, CostHistory, ReceivingRecord } from "@/types/accounting";

/**
 * Service for calculating oil costs using Moving Weighted Average method
 * 
 * Formula: New Avg Cost = (Old Stock Value + New Purchase Value) / (Old Stock + New Stock)
 * 
 * Example:
 * - Old Stock: 1000 L @ 25 THB/L = 25,000 THB
 * - New Purchase: 500 L @ 28 THB/L = 14,000 THB
 * - New Avg Cost = (25,000 + 14,000) / (1000 + 500) = 39,000 / 1500 = 26 THB/L
 */
class CostCalculationService {
    // In-memory storage (in real app, this would be from database)
    private oilCosts: Map<string, OilCost> = new Map();

    /**
     * Initialize oil costs with starting values
     */
    initializeOilCost(oilType: string, initialStock: number, initialCost: number): void {
        const oilCost: OilCost = {
            oilType,
            currentStock: initialStock,
            averageCost: initialCost,
            totalValue: initialStock * initialCost,
            lastUpdated: new Date().toISOString(),
            history: [
                {
                    date: new Date().toISOString().split("T")[0],
                    time: new Date().toTimeString().split(" ")[0],
                    action: "adjustment",
                    documentNo: "INIT",
                    quantity: initialStock,
                    unitPrice: initialCost,
                    stockBefore: 0,
                    stockAfter: initialStock,
                    avgCostBefore: 0,
                    avgCostAfter: initialCost,
                    notes: "Initial stock setup",
                },
            ],
        };

        this.oilCosts.set(oilType, oilCost);
    }

    /**
     * Calculate new average cost using Moving Weighted Average
     */
    calculateMovingAverage(
        oldStock: number,
        oldAverageCost: number,
        newStock: number,
        newPurchasePrice: number
    ): number {
        // If no old stock, new average = new purchase price
        if (oldStock <= 0) {
            return newPurchasePrice;
        }

        const oldValue = oldStock * oldAverageCost;
        const newValue = newStock * newPurchasePrice;
        const totalValue = oldValue + newValue;
        const totalStock = oldStock + newStock;

        return totalStock > 0 ? totalValue / totalStock : newPurchasePrice;
    }

    /**
     * Update cost after receiving oil
     */
    updateCostAfterReceiving(receivingRecord: ReceivingRecord): void {
        const now = new Date();
        const date = now.toISOString().split("T")[0];
        const time = now.toTimeString().split(" ")[0];

        receivingRecord.items.forEach((item) => {
            const currentCost = this.oilCosts.get(item.oilType);

            if (!currentCost) {
                // If oil type doesn't exist, initialize it
                this.initializeOilCost(item.oilType, 0, item.actualUnitPrice);
            }

            const cost = this.oilCosts.get(item.oilType)!;

            // Calculate new average cost
            const newAvgCost = this.calculateMovingAverage(
                cost.currentStock,
                cost.averageCost,
                item.quantityReceived,
                item.actualUnitPrice
            );

            const newStock = cost.currentStock + item.quantityReceived;
            const newValue = newStock * newAvgCost;

            // Create history record
            const historyRecord: CostHistory = {
                date,
                time,
                action: "purchase",
                documentNo: receivingRecord.taxInvoiceNo,
                quantity: item.quantityReceived,
                unitPrice: item.actualUnitPrice,
                stockBefore: cost.currentStock,
                stockAfter: newStock,
                avgCostBefore: cost.averageCost,
                avgCostAfter: newAvgCost,
                notes: `Received from PO ${receivingRecord.poNumber}`,
            };

            // Update cost
            cost.currentStock = newStock;
            cost.averageCost = newAvgCost;
            cost.totalValue = newValue;
            cost.lastUpdated = now.toISOString();
            cost.history.push(historyRecord);

            this.oilCosts.set(item.oilType, cost);
        });
    }

    /**
     * Update cost after selling oil
     */
    updateCostAfterSale(
        oilType: string,
        quantitySold: number,
        documentNo: string
    ): void {
        const cost = this.oilCosts.get(oilType);

        if (!cost) {
            throw new Error(`Oil type ${oilType} not found in cost records`);
        }

        if (cost.currentStock < quantitySold) {
            throw new Error(
                `Insufficient stock for ${oilType}. Available: ${cost.currentStock}, Requested: ${quantitySold}`
            );
        }

        const now = new Date();
        const date = now.toISOString().split("T")[0];
        const time = now.toTimeString().split(" ")[0];

        const newStock = cost.currentStock - quantitySold;
        const newValue = newStock * cost.averageCost;

        // Create history record
        const historyRecord: CostHistory = {
            date,
            time,
            action: "sale",
            documentNo,
            quantity: -quantitySold,
            unitPrice: cost.averageCost, // Use average cost for COGS
            stockBefore: cost.currentStock,
            stockAfter: newStock,
            avgCostBefore: cost.averageCost,
            avgCostAfter: cost.averageCost, // Average cost doesn't change on sale
            notes: `Sale transaction`,
        };

        // Update cost (average cost remains the same, only stock changes)
        cost.currentStock = newStock;
        cost.totalValue = newValue;
        cost.lastUpdated = now.toISOString();
        cost.history.push(historyRecord);

        this.oilCosts.set(oilType, cost);
    }

    /**
     * Get current average cost for an oil type
     */
    getCurrentAverageCost(oilType: string): number {
        const cost = this.oilCosts.get(oilType);
        return cost ? cost.averageCost : 0;
    }

    /**
     * Get current stock for an oil type
     */
    getCurrentStock(oilType: string): number {
        const cost = this.oilCosts.get(oilType);
        return cost ? cost.currentStock : 0;
    }

    /**
     * Get current stock value for an oil type
     */
    getCurrentStockValue(oilType: string): number {
        const cost = this.oilCosts.get(oilType);
        return cost ? cost.totalValue : 0;
    }

    /**
     * Get oil cost details
     */
    getOilCost(oilType: string): OilCost | undefined {
        return this.oilCosts.get(oilType);
    }

    /**
     * Get all oil costs
     */
    getAllOilCosts(): OilCost[] {
        return Array.from(this.oilCosts.values());
    }

    /**
     * Get cost history for an oil type
     */
    getCostHistory(oilType: string, limit?: number): CostHistory[] {
        const cost = this.oilCosts.get(oilType);
        if (!cost) return [];

        const history = [...cost.history].reverse(); // Most recent first
        return limit ? history.slice(0, limit) : history;
    }

    /**
     * Calculate COGS (Cost of Goods Sold) for a sale
     */
    calculateCOGS(oilType: string, quantity: number): number {
        const avgCost = this.getCurrentAverageCost(oilType);
        return quantity * avgCost;
    }

    /**
     * Get total stock value across all oil types
     */
    getTotalStockValue(): number {
        return Array.from(this.oilCosts.values()).reduce(
            (total, cost) => total + cost.totalValue,
            0
        );
    }
}

// Export singleton instance
export const costCalculationService = new CostCalculationService();

// Initialize with default oil types (example - should be configured)
const defaultOilTypes = [
    { type: "Premium Diesel", initialStock: 0, initialCost: 30 },
    { type: "Diesel", initialStock: 0, initialCost: 28 },
    { type: "Gasohol 95", initialStock: 0, initialCost: 35 },
    { type: "Gasohol 91", initialStock: 0, initialCost: 33 },
    { type: "E20", initialStock: 0, initialCost: 32 },
    { type: "E85", initialStock: 0, initialCost: 25 },
];

// Auto-initialize
defaultOilTypes.forEach(({ type, initialStock, initialCost }) => {
    costCalculationService.initializeOilCost(type, initialStock, initialCost);
});
