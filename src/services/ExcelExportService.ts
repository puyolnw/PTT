import * as XLSX from "xlsx";
import {
    PurchaseReportRow,
    StockCardRow,
    TaxInvoiceSummaryRow,
    ReceivingRecord,
} from "@/types/accounting";

interface SalesRecord {
    date: string;
    documentNo: string;
    customer?: string;
    oilType: string;
    quantity: number;
    sellingPrice: number;
    cost: number;
    totalSales: number;
    totalCost: number;
    profit: number;
}
import { costCalculationService } from "./CostCalculationService";

const currencyFormatter = new Intl.NumberFormat("th-TH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

const numberFormatter = new Intl.NumberFormat("th-TH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

/**
 * Service for exporting accounting reports to Excel
 */
class ExcelExportService {
    /**
     * Export Purchase Report (รายงานซื้อ)
     * For accounting to record purchases and claim input VAT
     */
    exportPurchaseReport(
        startDate: string,
        endDate: string,
        receivings: ReceivingRecord[]
    ): void {
        const data: PurchaseReportRow[] = [];

        receivings.forEach((receiving) => {
            receiving.items.forEach((item) => {
                const amount = item.totalAmount;
                const vat = amount * 0.07;
                const total = amount + vat;

                data.push({
                    date: receiving.receiveDate,
                    poNumber: receiving.poNumber,
                    taxInvoiceNo: receiving.taxInvoiceNo,
                    supplier: "ปตท. (PTT)",
                    description: item.oilType,
                    quantity: item.quantityReceived,
                    unitPrice: item.actualUnitPrice,
                    amount: amount,
                    vat: vat,
                    total: total,
                });
            });
        });

        // Convert to Excel format
        const excelData = data.map((row) => ({
            วันที่: row.date,
            "เลขที่ PO": row.poNumber,
            "เลขที่ใบกำกับภาษี": row.taxInvoiceNo,
            ผู้จำหน่าย: row.supplier,
            รายการ: row.description,
            "ปริมาณ (ลิตร)": numberFormatter.format(row.quantity),
            "ราคาต่อหน่วย (บาท)": currencyFormatter.format(row.unitPrice),
            "จำนวนเงิน (บาท)": currencyFormatter.format(row.amount),
            "VAT 7%": currencyFormatter.format(row.vat),
            รวมทั้งสิ้น: currencyFormatter.format(row.total),
        }));

        // Calculate totals
        const totals = {
            วันที่: "",
            "เลขที่ PO": "",
            "เลขที่ใบกำกับภาษี": "",
            ผู้จำหน่าย: "",
            รายการ: "รวมทั้งสิ้น",
            "ปริมาณ (ลิตร)": numberFormatter.format(
                data.reduce((sum, row) => sum + row.quantity, 0)
            ),
            "ราคาต่อหน่วย (บาท)": "",
            "จำนวนเงิน (บาท)": currencyFormatter.format(
                data.reduce((sum, row) => sum + row.amount, 0)
            ),
            "VAT 7%": currencyFormatter.format(
                data.reduce((sum, row) => sum + row.vat, 0)
            ),
            รวมทั้งสิ้น: currencyFormatter.format(
                data.reduce((sum, row) => sum + row.total, 0)
            ),
        };

        excelData.push(totals);

        // Create worksheet
        const ws = XLSX.utils.json_to_sheet(excelData);

        // Set column widths
        ws["!cols"] = [
            { wch: 12 }, // วันที่
            { wch: 18 }, // เลขที่ PO
            { wch: 20 }, // เลขที่ใบกำกับภาษี
            { wch: 15 }, // ผู้จำหน่าย
            { wch: 25 }, // รายการ
            { wch: 15 }, // ปริมาณ
            { wch: 18 }, // ราคาต่อหน่วย
            { wch: 18 }, // จำนวนเงิน
            { wch: 15 }, // VAT
            { wch: 18 }, // รวมทั้งสิ้น
        ];

        // Create workbook
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "รายงานซื้อ");

        // Generate filename
        const filename = `รายงานซื้อ_${startDate}_${endDate}.xlsx`;

        // Save file
        XLSX.writeFile(wb, filename);
    }

    /**
     * Export Stock Card (บัตรคุมสต็อก)
     * Shows stock movement with running balance and value
     */
    exportStockCard(
        oilType: string,
        startDate: string,
        endDate: string
    ): void {
        const costHistory = costCalculationService.getCostHistory(oilType);

        // Filter by date range
        const filteredHistory = costHistory.filter((h) => {
            return h.date >= startDate && h.date <= endDate;
        });

        const data: StockCardRow[] = filteredHistory.map((h) => ({
            date: h.date,
            documentNo: h.documentNo,
            description: this.getActionDescription(h.action),
            in: h.action === "purchase" || h.action === "adjustment" ? Math.abs(h.quantity) : 0,
            out: h.action === "sale" ? Math.abs(h.quantity) : 0,
            balance: h.stockAfter,
            avgCost: h.avgCostAfter,
            value: h.stockAfter * h.avgCostAfter,
        }));

        // Convert to Excel format
        const excelData = data.map((row) => ({
            วันที่: row.date,
            เลขที่เอกสาร: row.documentNo,
            รายการ: row.description,
            "รับ (ลิตร)": row.in > 0 ? numberFormatter.format(row.in) : "",
            "จ่าย (ลิตร)": row.out > 0 ? numberFormatter.format(row.out) : "",
            "คงเหลือ (ลิตร)": numberFormatter.format(row.balance),
            "ต้นทุนเฉลี่ย (บาท/ลิตร)": currencyFormatter.format(row.avgCost),
            "มูลค่า (บาท)": currencyFormatter.format(row.value),
        }));

        // Create worksheet
        const ws = XLSX.utils.json_to_sheet(excelData);

        // Set column widths
        ws["!cols"] = [
            { wch: 12 }, // วันที่
            { wch: 18 }, // เลขที่เอกสาร
            { wch: 30 }, // รายการ
            { wch: 15 }, // รับ
            { wch: 15 }, // จ่าย
            { wch: 18 }, // คงเหลือ
            { wch: 22 }, // ต้นทุนเฉลี่ย
            { wch: 18 }, // มูลค่า
        ];

        // Create workbook
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "บัตรคุมสต็อก");

        // Generate filename
        const filename = `บัตรคุมสต็อก_${oilType}_${startDate}_${endDate}.xlsx`;

        // Save file
        XLSX.writeFile(wb, filename);
    }

    /**
     * Export Tax Invoice Summary (สรุปใบกำกับภาษี)
     * For VAT reporting
     */
    exportTaxInvoiceSummary(
        startDate: string,
        endDate: string,
        receivings: ReceivingRecord[]
    ): void {
        const data: TaxInvoiceSummaryRow[] = receivings.map((receiving) => {
            const totalAmount = receiving.items.reduce(
                (sum, item) => sum + item.totalAmount,
                0
            );
            const vat = totalAmount * 0.07;
            const total = totalAmount + vat;

            return {
                taxInvoiceNo: receiving.taxInvoiceNo,
                taxInvoiceDate: receiving.taxInvoiceDate,
                poNumber: receiving.poNumber,
                supplier: "ปตท. (PTT)",
                amount: totalAmount,
                vat: vat,
                total: total,
                status: "บันทึกแล้ว",
            };
        });

        // Convert to Excel format
        const excelData = data.map((row) => ({
            "เลขที่ใบกำกับภาษี": row.taxInvoiceNo,
            "วันที่ใบกำกับ": row.taxInvoiceDate,
            "เลขที่ PO": row.poNumber,
            ผู้จำหน่าย: row.supplier,
            "มูลค่าสินค้า (บาท)": currencyFormatter.format(row.amount),
            "VAT 7%": currencyFormatter.format(row.vat),
            "รวมทั้งสิ้น (บาท)": currencyFormatter.format(row.total),
            สถานะ: row.status,
        }));

        // Calculate totals
        const totals = {
            "เลขที่ใบกำกับภาษี": "",
            "วันที่ใบกำกับ": "",
            "เลขที่ PO": "",
            ผู้จำหน่าย: "รวมทั้งสิ้น",
            "มูลค่าสินค้า (บาท)": currencyFormatter.format(
                data.reduce((sum, row) => sum + row.amount, 0)
            ),
            "VAT 7%": currencyFormatter.format(
                data.reduce((sum, row) => sum + row.vat, 0)
            ),
            "รวมทั้งสิ้น (บาท)": currencyFormatter.format(
                data.reduce((sum, row) => sum + row.total, 0)
            ),
            สถานะ: "",
        };

        excelData.push(totals);

        // Create worksheet
        const ws = XLSX.utils.json_to_sheet(excelData);

        // Set column widths
        ws["!cols"] = [
            { wch: 20 }, // เลขที่ใบกำกับภาษี
            { wch: 15 }, // วันที่ใบกำกับ
            { wch: 18 }, // เลขที่ PO
            { wch: 15 }, // ผู้จำหน่าย
            { wch: 20 }, // มูลค่าสินค้า
            { wch: 15 }, // VAT
            { wch: 20 }, // รวมทั้งสิ้น
            { wch: 12 }, // สถานะ
        ];

        // Create workbook
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "สรุปใบกำกับภาษี");

        // Generate filename
        const filename = `สรุปใบกำกับภาษี_${startDate}_${endDate}.xlsx`;

        // Save file
        XLSX.writeFile(wb, filename);
    }

    /**
     * Export Sales Report (รายงานขาย)
     */
    exportSalesReport(
        startDate: string,
        endDate: string,
        sales: SalesRecord[]
    ): void {
        const data = sales.map((sale) => ({
            วันที่: sale.date,
            เลขที่เอกสาร: sale.documentNo,
            ลูกค้า: sale.customer || "ขายปลีก",
            รายการ: sale.oilType,
            "ปริมาณ (ลิตร)": numberFormatter.format(sale.quantity),
            "ราคาขาย (บาท/ลิตร)": currencyFormatter.format(sale.sellingPrice),
            "ต้นทุน (บาท/ลิตร)": currencyFormatter.format(sale.cost),
            "ยอดขาย (บาท)": currencyFormatter.format(sale.totalSales),
            "ต้นทุนขาย (บาท)": currencyFormatter.format(sale.totalCost),
            "กำไร (บาท)": currencyFormatter.format(sale.profit),
        }));

        // Create worksheet
        const ws = XLSX.utils.json_to_sheet(data);

        // Set column widths
        ws["!cols"] = [
            { wch: 12 },
            { wch: 18 },
            { wch: 20 },
            { wch: 25 },
            { wch: 15 },
            { wch: 18 },
            { wch: 18 },
            { wch: 18 },
            { wch: 18 },
            { wch: 15 },
        ];

        // Create workbook
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "รายงานขาย");

        // Generate filename
        const filename = `รายงานขาย_${startDate}_${endDate}.xlsx`;

        // Save file
        XLSX.writeFile(wb, filename);
    }

    /**
     * Helper: Get action description in Thai
     */
    private getActionDescription(action: string): string {
        const descriptions: Record<string, string> = {
            purchase: "รับซื้อ",
            sale: "ขาย",
            adjustment: "ปรับปรุง",
            transfer: "โอนย้าย",
        };
        if (Object.prototype.hasOwnProperty.call(descriptions, action)) {
            return descriptions[action];
        }
        return action;
    }
}

// Export singleton instance
export const excelExportService = new ExcelExportService();
