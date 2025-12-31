import Papa from "papaparse";
import {
    ElsaSalesData,
    ElsaImportRecord,
    ValidationResult,
    MatchResult,
    ImportResult,
    Product,
    SalesTransaction,
} from "@/types/lubricants";

class ElsaDataService {
    /**
     * Parse CSV file from Elsa system
     */
    async parseElsaFile(file: File): Promise<ElsaSalesData[]> {
        return new Promise((resolve, reject) => {
            Papa.parse(file, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    try {
                        const data = (results.data as Record<string, string | undefined>[]).map((row, index) => ({
                            productId: row["Product ID"] || row["รหัสสินค้า"] || "",
                            productName: row["Product Name"] || row["ชื่อสินค้า"] || "",
                            quantity: parseFloat(row["Quantity"] || row["จำนวน"] || "0"),
                            date: row["Date"] || row["วันที่"] || new Date().toISOString().split("T")[0],
                            elsaReferenceId: row["Reference ID"] || row["เลขที่อ้างอิง"] || `ELSA-${Date.now()}-${index}`,
                            serviceAdvisor: row["Service Advisor"] || row["ที่ปรึกษาบริการ"] || "",
                        }));
                        resolve(data);
                    } catch (error) {
                        reject(new Error("Failed to parse CSV file: " + (error as Error).message));
                    }
                },
                error: (error) => {
                    reject(new Error("CSV parsing error: " + error.message));
                },
            });
        });
    }

    /**
     * Validate Elsa data
     */
    validateElsaData(data: ElsaSalesData[]): ValidationResult {
        const errors: ValidationResult["errors"] = [];
        const warnings: ValidationResult["warnings"] = [];

        data.forEach((item, index) => {
            const row = index + 2; // +2 because row 1 is header, array is 0-indexed

            // Required field validation
            if (!item.productId || item.productId.trim() === "") {
                errors.push({
                    row,
                    field: "productId",
                    message: "รหัสสินค้าไม่สามารถเว้นว่างได้",
                });
            }

            if (!item.productName || item.productName.trim() === "") {
                errors.push({
                    row,
                    field: "productName",
                    message: "ชื่อสินค้าไม่สามารถเว้นว่างได้",
                });
            }

            // Quantity validation
            if (isNaN(item.quantity) || item.quantity <= 0) {
                errors.push({
                    row,
                    field: "quantity",
                    message: "จำนวนต้องเป็นตัวเลขที่มากกว่า 0",
                });
            }

            if (item.quantity > 1000) {
                warnings.push({
                    row,
                    field: "quantity",
                    message: "จำนวนสูงผิดปกติ (มากกว่า 1,000)",
                });
            }

            // Date validation
            if (!item.date || isNaN(new Date(item.date).getTime())) {
                errors.push({
                    row,
                    field: "date",
                    message: "รูปแบบวันที่ไม่ถูกต้อง",
                });
            }

            // Check for future dates
            if (new Date(item.date) > new Date()) {
                errors.push({
                    row,
                    field: "date",
                    message: "วันที่ไม่สามารถเป็นอนาคตได้",
                });
            }
        });

        return {
            isValid: errors.length === 0,
            errors,
            warnings,
        };
    }

    /**
     * Match Elsa products with existing inventory
     */
    matchProducts(elsaData: ElsaSalesData[], products: Product[]): MatchResult {
        const matched: MatchResult["matched"] = [];
        const unmatched: MatchResult["unmatched"] = [];

        elsaData.forEach((elsaItem) => {
            // Try to find product by ID first
            let product = products.find((p) => p.id === elsaItem.productId);

            // If not found by ID, try to match by name (case-insensitive)
            if (!product) {
                product = products.find(
                    (p) => p.name.toLowerCase().trim() === elsaItem.productName.toLowerCase().trim()
                );
            }

            if (product) {
                matched.push({
                    elsaData: elsaItem,
                    product,
                });
            } else {
                unmatched.push({
                    elsaData: elsaItem,
                    reason: `ไม่พบสินค้า "${elsaItem.productName}" (${elsaItem.productId}) ในระบบ`,
                });
            }
        });

        return { matched, unmatched };
    }

    /**
     * Import sales data from Elsa
     */
    async importSalesData(
        elsaData: ElsaSalesData[],
        products: Product[],
        importedBy: string,
        fileName: string
    ): Promise<ImportResult> {
        const importId = `IMP-${Date.now()}`;
        const now = new Date();
        const importDate = now.toISOString().split("T")[0];
        const importTime = now.toTimeString().split(" ")[0];

        // Validate data
        const validation = this.validateElsaData(elsaData);
        if (!validation.isValid) {
            return {
                success: false,
                importRecord: {
                    id: importId,
                    importDate,
                    importTime,
                    fileName,
                    totalRecords: elsaData.length,
                    successRecords: 0,
                    failedRecords: elsaData.length,
                    status: "failed",
                    importedBy,
                    salesData: elsaData,
                    errors: validation.errors.map((e) => ({
                        row: e.row,
                        productId: "",
                        error: `${e.field}: ${e.message}`,
                    })),
                },
                updatedProducts: [],
                message: "การ import ล้มเหลว: พบข้อผิดพลาดในข้อมูล",
            };
        }

        // Match products
        const matchResult = this.matchProducts(elsaData, products);

        // Create sales transactions and update products
        const updatedProducts: Product[] = [];
        const salesTransactions: SalesTransaction[] = [];
        const errors: ElsaImportRecord["errors"] = [];

        matchResult.matched.forEach(({ elsaData: item, product }) => {
            try {
                // Create sales transaction
                const transaction: SalesTransaction = {
                    id: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    transactionNo: `FIT-${item.elsaReferenceId}`,
                    productId: product.id,
                    productName: product.name,
                    quantity: item.quantity,
                    pricePerUnit: product.pricePerUnit,
                    totalAmount: item.quantity * product.pricePerUnit,
                    channel: "fit-auto",
                    date: item.date,
                    time: importTime,
                    soldBy: item.serviceAdvisor || "Fit Auto",
                    elsaReferenceId: item.elsaReferenceId,
                };

                salesTransactions.push(transaction);

                // Update product
                const updatedProduct: Product = {
                    ...product,
                    currentStock: product.currentStock - item.quantity,
                    salesChannels: {
                        ...product.salesChannels,
                        fitAuto: {
                            dailySales: product.salesChannels.fitAuto.dailySales + item.quantity,
                            lastSyncDate: now.toISOString(),
                            elsaReferenceId: item.elsaReferenceId,
                        },
                    },
                    salesHistory: [...product.salesHistory, transaction.id],
                    lastUpdated: now.toISOString(),
                    status:
                        product.currentStock - item.quantity <= 0
                            ? "out-of-stock"
                            : product.currentStock - item.quantity < product.minThreshold
                                ? "low-stock"
                                : "in-stock",
                };

                updatedProducts.push(updatedProduct);
            } catch (error) {
                errors.push({
                    row: 0,
                    productId: item.productId,
                    error: `Failed to process: ${(error as Error).message}`,
                });
            }
        });

        // Add unmatched items to errors
        matchResult.unmatched.forEach((item, index) => {
            errors.push({
                row: index + 2,
                productId: item.elsaData.productId,
                error: item.reason,
            });
        });

        const importRecord: ElsaImportRecord = {
            id: importId,
            importDate,
            importTime,
            fileName,
            totalRecords: elsaData.length,
            successRecords: matchResult.matched.length,
            failedRecords: matchResult.unmatched.length,
            status:
                matchResult.unmatched.length === 0
                    ? "success"
                    : matchResult.matched.length > 0
                        ? "partial"
                        : "failed",
            importedBy,
            salesData: elsaData,
            errors: errors.length > 0 ? errors : undefined,
        };

        return {
            success: matchResult.matched.length > 0,
            importRecord,
            updatedProducts,
            message:
                matchResult.unmatched.length === 0
                    ? `Import สำเร็จ: ${matchResult.matched.length} รายการ`
                    : `Import บางส่วน: สำเร็จ ${matchResult.matched.length} รายการ, ล้มเหลว ${matchResult.unmatched.length} รายการ`,
        };
    }

    /**
     * Get import history (mock - should be from database)
     */
    getImportHistory(): ElsaImportRecord[] {
        // This would typically fetch from database
        // For now, return empty array
        return [];
    }
}

export const elsaDataService = new ElsaDataService();
