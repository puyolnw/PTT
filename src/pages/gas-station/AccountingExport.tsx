import { motion } from "framer-motion";
import { useState } from "react";
import {
    FileSpreadsheet,
    Download,
    Calendar,
    Filter,
    FileText,
    Package,
    Receipt,
    TrendingUp,
} from "lucide-react";
import { excelExportService } from "@/services/ExcelExportService";

const reportTypes = [
    {
        id: "purchase",
        name: "รายงานซื้อ (Purchase Report)",
        description: "รายงานการซื้อน้ำมันพร้อมใบกำกับภาษี",
        icon: Receipt,
        color: "from-blue-500 to-blue-600",
    },
    {
        id: "stock-card",
        name: "บัตรคุมสต็อก (Stock Card)",
        description: "รายงานการเคลื่อนไหวสต็อกพร้อมต้นทุนเฉลี่ย",
        icon: Package,
        color: "from-emerald-500 to-emerald-600",
    },
    {
        id: "tax-invoice",
        name: "สรุปใบกำกับภาษี (Tax Invoice Summary)",
        description: "สรุปใบกำกับภาษีสำหรับยื่นภาษี",
        icon: FileText,
        color: "from-purple-500 to-purple-600",
    },
    {
        id: "sales",
        name: "รายงานขาย (Sales Report)",
        description: "รายงานยอดขายและกำไร",
        icon: TrendingUp,
        color: "from-orange-500 to-orange-600",
    },
];

const oilTypes = [
    "Premium Diesel",
    "Diesel",
    "Gasohol 95",
    "Gasohol 91",
    "E20",
    "E85",
];

export default function AccountingExport() {
    const [selectedReport, setSelectedReport] = useState("purchase");
    const [startDate, setStartDate] = useState(
        new Date(new Date().setDate(new Date().getDate() - 30))
            .toISOString()
            .split("T")[0]
    );
    const [endDate, setEndDate] = useState(
        new Date().toISOString().split("T")[0]
    );
    const [selectedOilType, setSelectedOilType] = useState("Premium Diesel");
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async () => {
        setIsExporting(true);

        try {
            // Mock data - in real app, fetch from API
            const mockReceivings = [
                {
                    id: "RC-001",
                    poNumber: "PO-2024-001",
                    taxInvoiceNo: "TAX-2024-001",
                    taxInvoiceDate: "2024-12-10",
                    receiveDate: "2024-12-10",
                    receiveTime: "14:30",
                    items: [
                        {
                            oilType: "Premium Diesel",
                            quantityOrdered: 20000,
                            quantityReceived: 19950,
                            difference: -50,
                            differencePercent: -0.25,
                            actualUnitPrice: 30.5,
                            totalAmount: 608475,
                        },
                    ],
                    driverName: "สมชาย ใจดี",
                    truckPlateNumber: "กก-1234",
                    receiverEmployee: "พนักงาน A",
                    status: "completed" as const,
                    deliveryNoteNo: "DN-001",
                    orderNo: "SO-001",
                    supplierOrderNo: "PTT-001",
                    totalQuantityOrdered: 20000,
                    totalQuantityReceived: 19950,
                    totalAmount: 608475,
                    createdBy: "admin",
                    createdAt: "2024-12-10T14:30:00",
                },
            ];

            switch (selectedReport) {
                case "purchase":
                    excelExportService.exportPurchaseReport(
                        startDate,
                        endDate,
                        mockReceivings
                    );
                    break;
                case "stock-card":
                    excelExportService.exportStockCard(
                        selectedOilType,
                        startDate,
                        endDate
                    );
                    break;
                case "tax-invoice":
                    excelExportService.exportTaxInvoiceSummary(
                        startDate,
                        endDate,
                        mockReceivings
                    );
                    break;
                case "sales":
                    // Mock sales data
                    const mockSales = [
                        {
                            date: "2024-12-10",
                            documentNo: "SALE-001",
                            customer: "ขายปลีก",
                            oilType: "Premium Diesel",
                            quantity: 1000,
                            sellingPrice: 35,
                            cost: 30.5,
                            totalSales: 35000,
                            totalCost: 30500,
                            profit: 4500,
                        },
                    ];
                    excelExportService.exportSalesReport(startDate, endDate, mockSales);
                    break;
            }

            alert("✅ Export สำเร็จ! ไฟล์ถูกดาวน์โหลดแล้ว");
        } catch (error) {
            alert("❌ เกิดข้อผิดพลาด: " + (error as Error).message);
        } finally {
            setIsExporting(false);
        }
    };

    const selectedReportData = reportTypes.find((r) => r.id === selectedReport);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6"
                >
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2 flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg">
                            <FileSpreadsheet className="w-6 h-6 text-white" />
                        </div>
                        Export รายงานบัญชี
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        ส่งออกรายงานเป็นไฟล์ Excel สำหรับฝ่ายบัญชี
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Report Type Selection */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-1"
                    >
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                            <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                                <Filter className="w-5 h-5" />
                                เลือกประเภทรายงาน
                            </h2>
                            <div className="space-y-2">
                                {reportTypes.map((report) => (
                                    <button
                                        key={report.id}
                                        onClick={() => setSelectedReport(report.id)}
                                        className={`w-full p-4 rounded-xl transition-all duration-200 text-left ${selectedReport === report.id
                                                ? "bg-gradient-to-r " +
                                                report.color +
                                                " text-white shadow-lg scale-105"
                                                : "bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600"
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <report.icon className="w-5 h-5" />
                                            <div className="flex-1">
                                                <div className="font-semibold text-sm">
                                                    {report.name}
                                                </div>
                                                <div
                                                    className={`text-xs mt-1 ${selectedReport === report.id
                                                            ? "text-white/80"
                                                            : "text-gray-500 dark:text-gray-400"
                                                        }`}
                                                >
                                                    {report.description}
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    {/* Export Configuration */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-2"
                    >
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                            {selectedReportData && (
                                <>
                                    <div className="flex items-center gap-3 mb-6">
                                        <div
                                            className={`p-3 bg-gradient-to-br ${selectedReportData.color} rounded-lg shadow-lg`}
                                        >
                                            <selectedReportData.icon className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                                                {selectedReportData.name}
                                            </h2>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                {selectedReportData.description}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Date Range */}
                                    <div className="mb-6">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                            <Calendar className="w-4 h-4 inline mr-2" />
                                            ช่วงเวลา
                                        </label>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-2">
                                                    วันที่เริ่มต้น
                                                </label>
                                                <input
                                                    type="date"
                                                    value={startDate}
                                                    onChange={(e) => setStartDate(e.target.value)}
                                                    max={endDate}
                                                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/30 text-gray-800 dark:text-white"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-2">
                                                    วันที่สิ้นสุด
                                                </label>
                                                <input
                                                    type="date"
                                                    value={endDate}
                                                    onChange={(e) => setEndDate(e.target.value)}
                                                    min={startDate}
                                                    max={new Date().toISOString().split("T")[0]}
                                                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/30 text-gray-800 dark:text-white"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Oil Type Selection (for Stock Card only) */}
                                    {selectedReport === "stock-card" && (
                                        <div className="mb-6">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                                <Package className="w-4 h-4 inline mr-2" />
                                                ประเภทน้ำมัน
                                            </label>
                                            <select
                                                value={selectedOilType}
                                                onChange={(e) => setSelectedOilType(e.target.value)}
                                                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/30 text-gray-800 dark:text-white"
                                            >
                                                {oilTypes.map((type) => (
                                                    <option key={type} value={type}>
                                                        {type}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    {/* Preview Info */}
                                    <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                                        <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
                                            ข้อมูลที่จะ Export:
                                        </h3>
                                        <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                                            <li>
                                                • ช่วงเวลา:{" "}
                                                {new Date(startDate).toLocaleDateString("th-TH")} -{" "}
                                                {new Date(endDate).toLocaleDateString("th-TH")}
                                            </li>
                                            {selectedReport === "stock-card" && (
                                                <li>• ประเภทน้ำมัน: {selectedOilType}</li>
                                            )}
                                            <li>• รูปแบบไฟล์: Excel (.xlsx)</li>
                                        </ul>
                                    </div>

                                    {/* Export Button */}
                                    <button
                                        onClick={handleExport}
                                        disabled={isExporting}
                                        className="w-full px-6 py-4 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-xl transition-all duration-200 font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isExporting ? (
                                            <>กำลัง Export...</>
                                        ) : (
                                            <>
                                                <Download className="w-5 h-5" />
                                                Export รายงาน
                                            </>
                                        )}
                                    </button>
                                </>
                            )}
                        </div>
                    </motion.div>
                </div>

                {/* Info Box */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 rounded-lg p-4"
                >
                    <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-2">
                        📌 หมายเหตุ
                    </h3>
                    <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1">
                        <li>
                            • ไฟล์ Excel จะถูกดาวน์โหลดไปยังโฟลเดอร์ Downloads ของคุณ
                        </li>
                        <li>
                            • รายงานซื้อและสรุปใบกำกับภาษีสามารถนำไปใช้ยื่นภาษีได้ทันที
                        </li>
                        <li>
                            • บัตรคุมสต็อกแสดงต้นทุนเฉลี่ยแบบ Moving Weighted Average
                        </li>
                        <li>
                            • หากต้องการรูปแบบพิเศษ กรุณาติดต่อฝ่าย IT
                        </li>
                    </ul>
                </motion.div>
            </div>
        </div>
    );
}
