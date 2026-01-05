import { useState, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import {
  Banknote,
  Wallet,
  PieChart,
  Calendar,
  Upload,
  Download,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CreditCard,
  Coins,
  BarChart3,
  X,
} from "lucide-react";

const numberFormatter = new Intl.NumberFormat("th-TH");

interface DailySalesRecord {
  date: string; // Format: "1/7/2568"
  productSales: number;
  cash: number;
  transferQr: number;
  other: number;
  actualTotal: number;
  diff: number | null; // null means no difference
  remarks: string;
}

const initialDailySales: DailySalesRecord[] = [
  { date: "1/7/2568", productSales: 5849, cash: 2582, transferQr: 2312, other: 990, actualTotal: 5884, diff: 35, remarks: "คียสินค้าของโรงแรม" },
  { date: "2/7/2568", productSales: 7355, cash: 4855, transferQr: 2760, other: 0, actualTotal: 7615, diff: 260, remarks: "ลืมคีย์แหนมเนือง" },
  { date: "3/7/2568", productSales: 6001, cash: 2340, transferQr: 1510, other: 0, actualTotal: 1856, diff: -295, remarks: "" },
  { date: "4/7/2568", productSales: 7861, cash: 4362, transferQr: 3499, other: 0, actualTotal: 7861, diff: null, remarks: "" },
  { date: "5/7/2568", productSales: 9985, cash: 6747, transferQr: 3238, other: 0, actualTotal: 9985, diff: null, remarks: "" },
  { date: "6/7/2568", productSales: 5516, cash: 3888, transferQr: 1628, other: 0, actualTotal: 5516, diff: null, remarks: "" },
  { date: "7/7/2568", productSales: 8194, cash: 3974, transferQr: 4231, other: 0, actualTotal: 8205, diff: 11, remarks: "" },
  { date: "8/7/2568", productSales: 6585, cash: 4370, transferQr: 2214, other: 0, actualTotal: 6584, diff: -1, remarks: "" },
  { date: "9/7/2568", productSales: 7425, cash: 4445, transferQr: 2980, other: 0, actualTotal: 7425, diff: null, remarks: "" },
  { date: "10/7/2568", productSales: 8942, cash: 3843, transferQr: 5099, other: 0, actualTotal: 8942, diff: null, remarks: "" },
  { date: "11/7/2568", productSales: 6754, cash: 3874, transferQr: 2880, other: 0, actualTotal: 6754, diff: null, remarks: "" },
  { date: "12/7/2568", productSales: 6231, cash: 3459, transferQr: 2771, other: 0, actualTotal: 6230, diff: -1, remarks: "" },
  { date: "13/7/2568", productSales: 9026, cash: 5260, transferQr: 3767, other: 0, actualTotal: 9027, diff: 1, remarks: "" },
  { date: "14/7/2568", productSales: 7337, cash: 5893, transferQr: 1704, other: 0, actualTotal: 7597, diff: 260, remarks: "ลืมคีย์แหนมเนือง" },
  { date: "15/7/2568", productSales: 8926, cash: 7998, transferQr: 1930, other: 0, actualTotal: 9928, diff: 1002, remarks: "" },
  { date: "16/7/2568", productSales: 7344, cash: 1195, transferQr: 4257, other: 630, actualTotal: 6082, diff: -1262, remarks: "คียสินค้าของโรงแรม" },
  { date: "17/7/2568", productSales: 6290, cash: 1440, transferQr: 3097, other: 0, actualTotal: 6295, diff: 5, remarks: "คียสินค้าของโรงแรม" },
  { date: "18/7/2568", productSales: 9874, cash: 4950, transferQr: 1115, other: 0, actualTotal: 9874, diff: null, remarks: "คียสินค้าของโรงแรม" },
  { date: "19/7/2568", productSales: 7757, cash: 4597, transferQr: 3160, other: 0, actualTotal: 7757, diff: null, remarks: "" },
  { date: "20/7/2568", productSales: 6272, cash: 4179, transferQr: 2093, other: 0, actualTotal: 6272, diff: null, remarks: "" },
  { date: "21/7/2568", productSales: 7490, cash: 2610, transferQr: 2649, other: 0, actualTotal: 7490, diff: null, remarks: "คียสินค้าของโรงแรม" },
  { date: "22/7/2568", productSales: 4671, cash: 1800, transferQr: 1429, other: 0, actualTotal: 4671, diff: null, remarks: "คียสินค้าของโรงแรม" },
  { date: "23/7/2568", productSales: 7119, cash: 5239, transferQr: 1555, other: 360, actualTotal: 7154, diff: 35, remarks: "คียสินค้าของโรงแรม" },
  { date: "24/7/2568", productSales: 6057, cash: 2250, transferQr: 2525, other: 0, actualTotal: 6057, diff: null, remarks: "คียสินค้าของโรงแรม" },
  { date: "25/7/2568", productSales: 11267, cash: 4268, transferQr: 7004, other: 0, actualTotal: 11272, diff: 5, remarks: "" },
  { date: "26/7/2568", productSales: 9154, cash: 7410, transferQr: 1744, other: 0, actualTotal: 9154, diff: null, remarks: "" },
  { date: "27/7/2568", productSales: 6385, cash: 3135, transferQr: 2620, other: 630, actualTotal: 6385, diff: null, remarks: "คียสินค้าของโรงแรม" },
  { date: "28/7/2568", productSales: 10932, cash: 2588, transferQr: 8344, other: 0, actualTotal: 10932, diff: null, remarks: "" },
  { date: "29/7/2568", productSales: 6198, cash: 1620, transferQr: 1623, other: 0, actualTotal: 6198, diff: null, remarks: "คียสินค้าของโรงแรม" },
  { date: "30/7/2568", productSales: 9920, cash: 4500, transferQr: 2421, other: 0, actualTotal: 9920, diff: null, remarks: "คียสินค้าของโรงแรม" },
  { date: "31/7/2568", productSales: 11566, cash: 4900, transferQr: 3948, other: 0, actualTotal: 11566, diff: null, remarks: "น้ำดื่มเนสเล่ ออฟฟิต" },
];

export default function OtopSales() {
  const [activeTab, setActiveTab] = useState<"sales" | "expenses" | "pl">("sales");
  const [selectedMonth] = useState("กรกฎาคม 2568");
  const [dailySales] = useState<DailySalesRecord[]>(initialDailySales);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedImportType, setSelectedImportType] = useState<"sales" | "expenses" | "pl" | null>(null);
  const [importDate, setImportDate] = useState({
    month: "",
    year: "",
    startDate: "",
    endDate: "",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const months = [
    "มกราคม",
    "กุมภาพันธ์",
    "มีนาคม",
    "เมษายน",
    "พฤษภาคม",
    "มิถุนายน",
    "กรกฎาคม",
    "สิงหาคม",
    "กันยายน",
    "ตุลาคม",
    "พฤศจิกายน",
    "ธันวาคม",
  ];

  const years = Array.from({ length: 10 }, (_, i) => 2568 - i); // 2568 ถึง 2559

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const totalProductSales = dailySales.reduce((sum, record) => sum + record.productSales, 0);
    const totalCash = dailySales.reduce((sum, record) => sum + record.cash, 0);
    const totalTransferQr = dailySales.reduce((sum, record) => sum + record.transferQr, 0);
    const totalOther = dailySales.reduce((sum, record) => sum + record.other, 0);
    const totalActualReceived = dailySales.reduce((sum, record) => sum + record.actualTotal, 0);
    const daysWithSales = dailySales.length;
    const averagePerDay = daysWithSales > 0 ? totalProductSales / daysWithSales : 0;
    const daysWithDiff = dailySales.filter((record) => record.diff !== null && record.diff !== 0).length;
    const totalDiff = dailySales.reduce((sum, record) => sum + (record.diff || 0), 0);
    const cashPercentage = totalActualReceived > 0 ? (totalCash / totalActualReceived) * 100 : 0;
    const transferPercentage = totalActualReceived > 0 ? (totalTransferQr / totalActualReceived) * 100 : 0;

    return {
      totalProductSales,
      totalCash,
      totalTransferQr,
      totalOther,
      totalActualReceived,
      daysWithSales,
      averagePerDay,
      daysWithDiff,
      totalDiff,
      cashPercentage,
      transferPercentage,
    };
  }, [dailySales]);

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Banknote className="h-8 w-8 text-purple-600" />
            บัญชีรายรับ-รายจ่าย (Sales & Accounting)
          </h2>
          <p className="text-slate-500 text-sm mt-1">สาขา ไฮโซ • ประจำเดือน {selectedMonth}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            <Upload className="h-4 w-4" />
            นำเข้า Excel
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file && selectedImportType && importDate.month && importDate.year) {
                const typeNames = new Map([
                  ["sales", "ยอดขายรายวัน (Sales)"],
                  ["expenses", "บันทึกรายจ่าย (Expenses)"],
                  ["pl", "กำไร/ขาดทุน (P&L)"],
                ]);
                const dateRange =
                  importDate.startDate && importDate.endDate
                    ? `\nช่วงวันที่: ${importDate.startDate} ถึง ${importDate.endDate}`
                    : "";
                alert(
                  `กำลังนำเข้าข้อมูล${typeNames.get(selectedImportType)}\nเดือน: ${importDate.month} ${importDate.year}${dateRange}\nจากไฟล์: ${file.name}\n\n(ฟังก์ชันนี้ยังเป็น Mock - ระบบจะอ่านไฟล์และอัปเดตข้อมูลอัตโนมัติ)`
                );
                setIsImportModalOpen(false);
                setSelectedImportType(null);
                setImportDate({ month: "", year: "", startDate: "", endDate: "" });
              }
              if (e.target) {
                e.target.value = "";
              }
            }}
            className="hidden"
          />
          <button
            onClick={() => {
              alert("กำลังส่งออกข้อมูลบัญชีรายรับ-รายจ่ายเป็นไฟล์ Excel...\n\n(ฟังก์ชันนี้ยังเป็น Mock)");
            }}
            className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            <Download className="h-4 w-4" />
            ส่งออก
          </button>
          <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-gray-200 shadow-sm">
            <Calendar className="h-4 w-4 text-purple-500" />
            <span className="font-medium text-slate-700">{selectedMonth}</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-200 bg-white rounded-t-lg px-4 pt-2">
        <button
          onClick={() => setActiveTab("sales")}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === "sales"
            ? "border-purple-600 text-purple-600 bg-purple-50/50"
            : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
        >
          <Banknote className="h-4 w-4" />
          ยอดขายรายวัน (Sales)
        </button>
        <button
          onClick={() => setActiveTab("expenses")}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === "expenses"
            ? "border-purple-600 text-purple-600 bg-purple-50/50"
            : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
        >
          <Wallet className="h-4 w-4" />
          บันทึกรายจ่าย (Expenses)
        </button>
        <button
          onClick={() => setActiveTab("pl")}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === "pl"
            ? "border-purple-600 text-purple-600 bg-purple-50/50"
            : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
        >
          <PieChart className="h-4 w-4" />
          กำไร/ขาดทุน (P&L)
        </button>
      </div>

      {/* Content Section */}
      <div className="bg-white rounded-b-xl shadow-sm border border-t-0 border-gray-200 overflow-hidden p-6">
        {activeTab === "sales" && (
          <>
            {/* Dashboard Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0 }}
                className="bg-gradient-to-br from-purple-50 to-purple-100 p-5 rounded-xl border border-purple-200 shadow-sm"
              >
                <div className="flex items-center justify-between mb-2">
                  <DollarSign className="h-6 w-6 text-purple-600" />
                  <span className="text-xs text-purple-600 font-medium">ยอดขายรวม</span>
                </div>
                <div className="text-2xl font-bold text-purple-900">
                  ฿{numberFormatter.format(summaryStats.totalProductSales)}
                </div>
                <div className="text-xs text-purple-600 mt-1">
                  เฉลี่ย {numberFormatter.format(summaryStats.averagePerDay)}/วัน
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-5 rounded-xl border border-emerald-200 shadow-sm"
              >
                <div className="flex items-center justify-between mb-2">
                  <Coins className="h-6 w-6 text-emerald-600" />
                  <span className="text-xs text-emerald-600 font-medium">เงินสด</span>
                </div>
                <div className="text-2xl font-bold text-emerald-900">
                  ฿{numberFormatter.format(summaryStats.totalCash)}
                </div>
                <div className="text-xs text-emerald-600 mt-1">
                  {summaryStats.cashPercentage.toFixed(1)}% ของยอดรับจริง
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-xl border border-blue-200 shadow-sm"
              >
                <div className="flex items-center justify-between mb-2">
                  <CreditCard className="h-6 w-6 text-blue-600" />
                  <span className="text-xs text-blue-600 font-medium">โอน/QR</span>
                </div>
                <div className="text-2xl font-bold text-blue-900">
                  ฿{numberFormatter.format(summaryStats.totalTransferQr)}
                </div>
                <div className="text-xs text-blue-600 mt-1">
                  {summaryStats.transferPercentage.toFixed(1)}% ของยอดรับจริง
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-br from-green-50 to-green-100 p-5 rounded-xl border border-green-200 shadow-sm"
              >
                <div className="flex items-center justify-between mb-2">
                  <BarChart3 className="h-6 w-6 text-green-600" />
                  <span className="text-xs text-green-600 font-medium">รวมรับจริง</span>
                </div>
                <div className="text-2xl font-bold text-green-900">
                  ฿{numberFormatter.format(summaryStats.totalActualReceived)}
                </div>
                <div className="text-xs text-green-600 mt-1">
                  {summaryStats.daysWithSales} วัน
                </div>
              </motion.div>
            </div>

            {/* Secondary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gray-50 p-4 rounded-lg border border-gray-200"
              >
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">ค่าเฉลี่ยต่อวัน</span>
                </div>
                <div className="text-xl font-bold text-gray-900">
                  ฿{numberFormatter.format(summaryStats.averagePerDay)}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-gray-50 p-4 rounded-lg border border-gray-200"
              >
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-5 w-5 text-orange-600" />
                  <span className="text-sm font-medium text-gray-700">วันที่มี Diff</span>
                </div>
                <div className="text-xl font-bold text-gray-900">
                  {summaryStats.daysWithDiff} วัน
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Diff รวม: {summaryStats.totalDiff >= 0 ? "+" : ""}
                  {numberFormatter.format(summaryStats.totalDiff)}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-gray-50 p-4 rounded-lg border border-gray-200"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Wallet className="h-5 w-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">อื่นๆ</span>
                </div>
                <div className="text-xl font-bold text-gray-900">
                  ฿{numberFormatter.format(summaryStats.totalOther)}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {summaryStats.totalActualReceived > 0
                    ? ((summaryStats.totalOther / summaryStats.totalActualReceived) * 100).toFixed(1)
                    : 0}
                  % ของยอดรับจริง
                </div>
              </motion.div>
            </div>

            {/* Sales Table */}
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider border-b border-gray-200">
                    <th className="px-4 py-3 font-medium text-center">วันที่</th>
                    <th className="px-4 py-3 font-medium text-right">ขายสินค้า</th>
                    <th className="px-4 py-3 font-medium text-right">เงินสด</th>
                    <th className="px-4 py-3 font-medium text-right">โอน/QR</th>
                    <th className="px-4 py-3 font-medium text-right">อื่นๆ</th>
                    <th className="px-4 py-3 font-bold text-right">รวมรับจริง</th>
                    <th className="px-4 py-3 font-medium text-center">Diff</th>
                    <th className="px-4 py-3 font-medium">หมายเหตุ</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-gray-100">
                  {dailySales.map((record, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-center text-gray-500 font-mono">{record.date}</td>
                      <td className="px-4 py-3 text-right font-medium">
                        {numberFormatter.format(record.productSales)}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-600">
                        {numberFormatter.format(record.cash)}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-600">
                        {numberFormatter.format(record.transferQr)}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-600">
                        {record.other > 0 ? numberFormatter.format(record.other) : "-"}
                      </td>
                      <td className="px-4 py-3 text-right font-bold">
                        {numberFormatter.format(record.actualTotal)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {record.diff !== null ? (
                          <span
                            className={record.diff >= 0 ? "text-green-600" : "text-red-600"}
                          >
                            {record.diff > 0 ? "+" : ""}
                            {numberFormatter.format(record.diff)}
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs truncate max-w-[150px]">
                        {record.remarks || ""}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activeTab === "expenses" && (
          <div className="text-center py-12 text-gray-500">
            <p>หน้าบันทึกรายจ่าย (Expenses) - กำลังพัฒนา</p>
          </div>
        )}

        {activeTab === "pl" && (
          <div className="text-center py-12 text-gray-500">
            <p>หน้ากำไร/ขาดทุน (P&L) - กำลังพัฒนา</p>
          </div>
        )}
      </div>

      {/* Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Upload className="h-5 w-5 text-purple-600" />
                เลือกประเภทข้อมูลที่จะนำเข้า
              </h3>
              <button
                onClick={() => {
                  setIsImportModalOpen(false);
                  setSelectedImportType(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              กรุณาเลือกช่วงวันที่และประเภทข้อมูลที่ต้องการนำเข้าจากไฟล์ Excel
            </p>

            {/* Date Selection */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="text-sm font-semibold text-gray-700 mb-3">ช่วงวันที่ของข้อมูล</div>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label htmlFor="otop-sales-import-month" className="block text-xs text-gray-600 mb-1">เดือน</label>
                  <select
                    id="otop-sales-import-month"
                    value={importDate.month}
                    onChange={(e) => setImportDate({ ...importDate, month: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">เลือกเดือน</option>
                    {months.map((month, index) => (
                      <option key={index} value={month}>
                        {month}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="otop-sales-import-year" className="block text-xs text-gray-600 mb-1">ปี (พ.ศ.)</label>
                  <select
                    id="otop-sales-import-year"
                    value={importDate.year}
                    onChange={(e) => setImportDate({ ...importDate, year: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">เลือกปี</option>
                    {years.map((year) => (
                      <option key={year} value={year.toString()}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="otop-sales-import-start-date" className="block text-xs text-gray-600 mb-1">วันที่เริ่มต้น</label>
                  <input
                    id="otop-sales-import-start-date"
                    type="date"
                    value={importDate.startDate}
                    onChange={(e) => setImportDate({ ...importDate, startDate: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label htmlFor="otop-sales-import-end-date" className="block text-xs text-gray-600 mb-1">วันที่สิ้นสุด</label>
                  <input
                    id="otop-sales-import-end-date"
                    type="date"
                    value={importDate.endDate}
                    onChange={(e) => setImportDate({ ...importDate, endDate: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            </div>

            {/* Type Selection */}
            <div className="mb-6">
              <div className="text-sm font-semibold text-gray-700 mb-3">ประเภทข้อมูล</div>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    if (!importDate.month || !importDate.year) {
                      alert("กรุณาเลือกเดือนและปีก่อน");
                      return;
                    }
                    setSelectedImportType("sales");
                    setTimeout(() => {
                      fileInputRef.current?.click();
                    }, 100);
                  }}
                  disabled={!importDate.month || !importDate.year}
                  className={`w-full p-4 border-2 rounded-lg transition-all text-left flex items-center gap-3 group ${selectedImportType === "sales"
                    ? "border-purple-500 bg-purple-50"
                    : "border-gray-200 hover:border-purple-500 hover:bg-purple-50"
                    } ${!importDate.month || !importDate.year
                      ? "opacity-50 cursor-not-allowed"
                      : "cursor-pointer"
                    }`}
                >
                  <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                    <Banknote className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-800">ยอดขายรายวัน (Sales)</div>
                    <div className="text-sm text-gray-500">นำเข้าข้อมูลยอดขายรายวัน</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    if (!importDate.month || !importDate.year) {
                      alert("กรุณาเลือกเดือนและปีก่อน");
                      return;
                    }
                    setSelectedImportType("expenses");
                    setTimeout(() => {
                      fileInputRef.current?.click();
                    }, 100);
                  }}
                  disabled={!importDate.month || !importDate.year}
                  className={`w-full p-4 border-2 rounded-lg transition-all text-left flex items-center gap-3 group ${selectedImportType === "expenses"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-blue-500 hover:bg-blue-50"
                    } ${!importDate.month || !importDate.year
                      ? "opacity-50 cursor-not-allowed"
                      : "cursor-pointer"
                    }`}
                >
                  <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <Wallet className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-800">บันทึกรายจ่าย (Expenses)</div>
                    <div className="text-sm text-gray-500">นำเข้าข้อมูลรายจ่ายต่างๆ</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    if (!importDate.month || !importDate.year) {
                      alert("กรุณาเลือกเดือนและปีก่อน");
                      return;
                    }
                    setSelectedImportType("pl");
                    setTimeout(() => {
                      fileInputRef.current?.click();
                    }, 100);
                  }}
                  disabled={!importDate.month || !importDate.year}
                  className={`w-full p-4 border-2 rounded-lg transition-all text-left flex items-center gap-3 group ${selectedImportType === "pl"
                    ? "border-green-500 bg-green-50"
                    : "border-gray-200 hover:border-green-500 hover:bg-green-50"
                    } ${!importDate.month || !importDate.year
                      ? "opacity-50 cursor-not-allowed"
                      : "cursor-pointer"
                    }`}
                >
                  <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center group-hover:bg-green-200 transition-colors">
                    <PieChart className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-800">กำไร/ขาดทุน (P&L)</div>
                    <div className="text-sm text-gray-500">นำเข้าข้อมูลกำไร/ขาดทุน</div>
                  </div>
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setIsImportModalOpen(false);
                  setSelectedImportType(null);
                  setImportDate({ month: "", year: "", startDate: "", endDate: "" });
                }}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ยกเลิก
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
