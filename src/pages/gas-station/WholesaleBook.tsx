import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  FileCheck,
  Search,
  Filter,
  Calendar,
  DollarSign,
  Droplet,
  TrendingUp,
  ShoppingCart,
  Eye,
  X,
  FileText,
  Package,
} from "lucide-react";

const numberFormatter = new Intl.NumberFormat("th-TH", {
  maximumFractionDigits: 0,
});

const currencyFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 0,
});

type LedgerEntry = {
  id: string;
  date: string;
  hsdPurchase: number; // ลิตร
  dieselPurchase: number; // ลิตร
  lpgPurchase: number; // ลิตร
  wholesaleSales: number; // บาท
  retailSales: number; // บาท
  totalSales: number; // บาท
  remarks: string;
};

// Mock data - สมุดบัญชีขายส่งขายปลีก
const mockLedgerData: LedgerEntry[] = [
  {
    id: "WB-20241201",
    date: "2024-12-01",
    hsdPurchase: 8000,
    dieselPurchase: 7000,
    lpgPurchase: 0,
    wholesaleSales: 8000,
    retailSales: 4000,
    totalSales: 12000,
    remarks: "ขายส่งปกติ",
  },
  {
    id: "WB-20241202",
    date: "2024-12-02",
    hsdPurchase: 8000,
    dieselPurchase: 0,
    lpgPurchase: 4000,
    wholesaleSales: 0,
    retailSales: 4000,
    totalSales: 4000,
    remarks: "",
  },
  {
    id: "WB-20241203",
    date: "2024-12-03",
    hsdPurchase: 8000,
    dieselPurchase: 0,
    lpgPurchase: 0,
    wholesaleSales: 0,
    retailSales: 4000,
    totalSales: 4000,
    remarks: "",
  },
  {
    id: "WB-20241204",
    date: "2024-12-04",
    hsdPurchase: 0,
    dieselPurchase: 0,
    lpgPurchase: 0,
    wholesaleSales: 0,
    retailSales: 0,
    totalSales: 0,
    remarks: "ปิดทำการ",
  },
  {
    id: "WB-20241205",
    date: "2024-12-05",
    hsdPurchase: 11000,
    dieselPurchase: 7000,
    lpgPurchase: 0,
    wholesaleSales: 0,
    retailSales: 4000,
    totalSales: 4000,
    remarks: "",
  },
  {
    id: "WB-20241206",
    date: "2024-12-06",
    hsdPurchase: 8000,
    dieselPurchase: 0,
    lpgPurchase: 0,
    wholesaleSales: 0,
    retailSales: 4000,
    totalSales: 4000,
    remarks: "",
  },
  {
    id: "WB-20241207",
    date: "2024-12-07",
    hsdPurchase: 8000,
    dieselPurchase: 0,
    lpgPurchase: 4000,
    wholesaleSales: 4000,
    retailSales: 0,
    totalSales: 4000,
    remarks: "ขายส่งพิเศษ",
  },
  {
    id: "WB-20241208",
    date: "2024-12-08",
    hsdPurchase: 8000,
    dieselPurchase: 4000,
    lpgPurchase: 5000,
    wholesaleSales: 0,
    retailSales: 4000,
    totalSales: 4000,
    remarks: "",
  },
  {
    id: "WB-20241209",
    date: "2024-12-09",
    hsdPurchase: 8000,
    dieselPurchase: 0,
    lpgPurchase: 0,
    wholesaleSales: 8000,
    retailSales: 0,
    totalSales: 8000,
    remarks: "ขายส่งเท่านั้น",
  },
  {
    id: "WB-20241210",
    date: "2024-12-10",
    hsdPurchase: 8000,
    dieselPurchase: 0,
    lpgPurchase: 4000,
    wholesaleSales: 0,
    retailSales: 4000,
    totalSales: 4000,
    remarks: "",
  },
  {
    id: "WB-20241211",
    date: "2024-12-11",
    hsdPurchase: 8000,
    dieselPurchase: 4000,
    lpgPurchase: 5000,
    wholesaleSales: 6000,
    retailSales: 8000,
    totalSales: 14000,
    remarks: "ยอดขายดี",
  },
  {
    id: "WB-20241212",
    date: "2024-12-12",
    hsdPurchase: 8000,
    dieselPurchase: 0,
    lpgPurchase: 0,
    wholesaleSales: 0,
    retailSales: 4000,
    totalSales: 4000,
    remarks: "",
  },
  {
    id: "WB-20241213",
    date: "2024-12-13",
    hsdPurchase: 8000,
    dieselPurchase: 0,
    lpgPurchase: 4000,
    wholesaleSales: 4000,
    retailSales: 0,
    totalSales: 4000,
    remarks: "",
  },
  {
    id: "WB-20241214",
    date: "2024-12-14",
    hsdPurchase: 8000,
    dieselPurchase: 1000,
    lpgPurchase: 5000,
    wholesaleSales: 0,
    retailSales: 4000,
    totalSales: 4000,
    remarks: "",
  },
  {
    id: "WB-20241215",
    date: "2024-12-15",
    hsdPurchase: 10000,
    dieselPurchase: 0,
    lpgPurchase: 0,
    wholesaleSales: 0,
    retailSales: 4000,
    totalSales: 4000,
    remarks: "",
  },
];

export default function WholesaleBook() {
  const [ledgerData] = useState<LedgerEntry[]>(mockLedgerData);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDateRange, setSelectedDateRange] = useState("ทั้งหมด");
  const [selectedItem, setSelectedItem] = useState<LedgerEntry | null>(null);

  const filteredLedger = ledgerData.filter((item) => {
    const matchesSearch =
      item.date.includes(searchTerm) ||
      item.remarks.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  const summary = {
    totalEntries: ledgerData.length,
    totalHsdPurchase: ledgerData.reduce((sum, item) => sum + item.hsdPurchase, 0),
    totalDieselPurchase: ledgerData.reduce((sum, item) => sum + item.dieselPurchase, 0),
    totalLpgPurchase: ledgerData.reduce((sum, item) => sum + item.lpgPurchase, 0),
    totalWholesaleSales: ledgerData.reduce((sum, item) => sum + item.wholesaleSales, 0),
    totalRetailSales: ledgerData.reduce((sum, item) => sum + item.retailSales, 0),
    totalSales: ledgerData.reduce((sum, item) => sum + item.totalSales, 0),
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2 flex items-center gap-3">
          <FileCheck className="w-8 h-8 text-amber-500" />
          สมุดบัญชีขายส่งขายปลีก
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          บันทึกรายการซื้อน้ำมันและยอดขายประจำวัน ทั้งขายส่งและขายปลีก
        </p>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          {
            title: "ขายส่งรวม",
            value: currencyFormatter.format(summary.totalWholesaleSales),
            subtitle: "บาท",
            icon: ShoppingCart,
            iconColor: "bg-gradient-to-br from-purple-500 to-purple-600",
          },
          {
            title: "ขายปลีกรวม",
            value: currencyFormatter.format(summary.totalRetailSales),
            subtitle: "บาท",
            icon: TrendingUp,
            iconColor: "bg-gradient-to-br from-blue-500 to-blue-600",
          },
          {
            title: "ยอดขายรวมทั้งหมด",
            value: currencyFormatter.format(summary.totalSales),
            subtitle: "บาท",
            icon: DollarSign,
            iconColor: "bg-gradient-to-br from-emerald-500 to-emerald-600",
          },
          {
            title: "จำนวนรายการ",
            value: summary.totalEntries.toString(),
            subtitle: "รายการ",
            icon: FileText,
            iconColor: "bg-gradient-to-br from-amber-500 to-amber-600",
          },
        ].map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
          >
            <div className="p-4">
              <div className="flex items-center">
                <div className={`w-16 h-16 ${stat.iconColor} rounded-lg flex items-center justify-center shadow-lg mr-4`}>
                  <stat.icon className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h6 className="text-gray-600 dark:text-gray-400 text-sm font-semibold mb-1">{stat.title}</h6>
                  <h6 className="text-gray-800 dark:text-white text-2xl font-extrabold mb-0">{stat.value}</h6>
                  <p className="text-gray-500 dark:text-gray-500 text-xs mt-1">{stat.subtitle}</p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Purchase Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[
          {
            title: "HSD ซื้อรวม",
            value: numberFormatter.format(summary.totalHsdPurchase),
            subtitle: "ลิตร",
            icon: Droplet,
            iconColor: "text-blue-500",
            bgColor: "bg-blue-50 dark:bg-blue-900/20",
            borderColor: "border-blue-200 dark:border-blue-800",
          },
          {
            title: "ดีเซล ซื้อรวม",
            value: numberFormatter.format(summary.totalDieselPurchase),
            subtitle: "ลิตร",
            icon: Droplet,
            iconColor: "text-green-500",
            bgColor: "bg-green-50 dark:bg-green-900/20",
            borderColor: "border-green-200 dark:border-green-800",
          },
          {
            title: "LPG ซื้อรวม",
            value: numberFormatter.format(summary.totalLpgPurchase),
            subtitle: "ลิตร",
            icon: Package,
            iconColor: "text-orange-500",
            bgColor: "bg-orange-50 dark:bg-orange-900/20",
            borderColor: "border-orange-200 dark:border-orange-800",
          },
        ].map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
            className={`${stat.bgColor} ${stat.borderColor} border rounded-xl p-4 flex items-center gap-3`}
          >
            <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
              <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{stat.value} {stat.subtitle}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5 flex flex-col md:flex-row gap-4 mb-6"
      >
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="ค้นหาวันที่หรือหมายเหตุ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/50 text-gray-800 dark:text-white transition-all duration-200"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={selectedDateRange}
            onChange={(e) => setSelectedDateRange(e.target.value)}
            className="px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/50 text-gray-800 dark:text-white transition-all duration-200"
          >
            <option>ทั้งหมด</option>
            <option>7 วันล่าสุด</option>
            <option>30 วันล่าสุด</option>
            <option>เดือนนี้</option>
          </select>
        </div>
      </motion.div>

      {/* Ledger Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden"
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-1">รายการสมุดบัญชี</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            บันทึกรายการซื้อน้ำมันและยอดขายประจำวัน
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/60">
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 dark:text-gray-400">
                  วันที่
                </th>
                <th className="text-right py-4 px-6 text-xs font-semibold text-gray-600 dark:text-gray-400">
                  HSD ซื้อ (ลิตร)
                </th>
                <th className="text-right py-4 px-6 text-xs font-semibold text-gray-600 dark:text-gray-400">
                  ดีเซล ซื้อ (ลิตร)
                </th>
                <th className="text-right py-4 px-6 text-xs font-semibold text-gray-600 dark:text-gray-400">
                  LPG ซื้อ (ลิตร)
                </th>
                <th className="text-right py-4 px-6 text-xs font-semibold text-gray-600 dark:text-gray-400">
                  ขายส่ง (บาท)
                </th>
                <th className="text-right py-4 px-6 text-xs font-semibold text-gray-600 dark:text-gray-400">
                  ขายปลีก (บาท)
                </th>
                <th className="text-right py-4 px-6 text-xs font-semibold text-gray-600 dark:text-gray-400">
                  รวมยอดขาย (บาท)
                </th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 dark:text-gray-400">
                  หมายเหตุ
                </th>
                <th className="text-center py-4 px-6 text-xs font-semibold text-gray-600 dark:text-gray-400">
                  จัดการ
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredLedger.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-8 px-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    ไม่พบข้อมูลที่ตรงกับเงื่อนไขค้นหา
                  </td>
                </tr>
              )}
              {filteredLedger.map((item, index) => (
                <motion.tr
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-semibold text-gray-800 dark:text-white">{item.date}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-sm text-right font-semibold text-gray-800 dark:text-white">
                    {item.hsdPurchase > 0 ? numberFormatter.format(item.hsdPurchase) : "-"}
                  </td>
                  <td className="py-4 px-6 text-sm text-right font-semibold text-gray-800 dark:text-white">
                    {item.dieselPurchase > 0 ? numberFormatter.format(item.dieselPurchase) : "-"}
                  </td>
                  <td className="py-4 px-6 text-sm text-right font-semibold text-gray-800 dark:text-white">
                    {item.lpgPurchase > 0 ? numberFormatter.format(item.lpgPurchase) : "-"}
                  </td>
                  <td className="py-4 px-6 text-sm text-right font-semibold text-purple-600 dark:text-purple-400">
                    {item.wholesaleSales > 0 ? currencyFormatter.format(item.wholesaleSales) : "-"}
                  </td>
                  <td className="py-4 px-6 text-sm text-right font-semibold text-blue-600 dark:text-blue-400">
                    {item.retailSales > 0 ? currencyFormatter.format(item.retailSales) : "-"}
                  </td>
                  <td className="py-4 px-6 text-sm text-right font-bold text-emerald-600 dark:text-emerald-400">
                    {item.totalSales > 0 ? currencyFormatter.format(item.totalSales) : "-"}
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">
                    {item.remarks || "-"}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => setSelectedItem(item)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                        title="ดูรายละเอียด"
                      >
                        <Eye className="w-4 h-4 text-gray-400 hover:text-amber-500" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedItem && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedItem(null)}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setSelectedItem(null);
                }
              }}
              role="button"
              tabIndex={0}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
                role="none"
              >
                {/* Modal Header */}
                <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between rounded-t-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center">
                      <FileCheck className="w-6 h-6 text-amber-500" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-800 dark:text-white">รายละเอียดรายการ</h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{selectedItem.date}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedItem(null)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                {/* Modal Content */}
                <div className="p-6 space-y-6">
                  {/* Purchase Information */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-3 mb-4">
                      <Droplet className="w-6 h-6 text-blue-500" />
                      <h3 className="text-lg font-bold text-gray-800 dark:text-white">ข้อมูลการซื้อน้ำมัน</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">HSD ซื้อ</p>
                        <p className="text-lg font-bold text-gray-800 dark:text-white">
                          {numberFormatter.format(selectedItem.hsdPurchase)} ลิตร
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">ดีเซล ซื้อ</p>
                        <p className="text-lg font-bold text-gray-800 dark:text-white">
                          {numberFormatter.format(selectedItem.dieselPurchase)} ลิตร
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">LPG ซื้อ</p>
                        <p className="text-lg font-bold text-gray-800 dark:text-white">
                          {numberFormatter.format(selectedItem.lpgPurchase)} ลิตร
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Sales Information */}
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
                    <div className="flex items-center gap-3 mb-4">
                      <DollarSign className="w-6 h-6 text-purple-500" />
                      <h3 className="text-lg font-bold text-gray-800 dark:text-white">ข้อมูลยอดขาย</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2 border-b border-purple-200 dark:border-purple-800">
                        <span className="text-sm text-gray-600 dark:text-gray-400">ขายส่ง</span>
                        <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
                          {currencyFormatter.format(selectedItem.wholesaleSales)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-purple-200 dark:border-purple-800">
                        <span className="text-sm text-gray-600 dark:text-gray-400">ขายปลีก</span>
                        <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                          {currencyFormatter.format(selectedItem.retailSales)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-3 bg-white dark:bg-gray-800 rounded-lg px-4 mt-2">
                        <span className="text-base font-bold text-gray-800 dark:text-white">รวมยอดขาย</span>
                        <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                          {currencyFormatter.format(selectedItem.totalSales)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Remarks */}
                  {selectedItem.remarks && (
                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4">
                      <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">หมายเหตุ</h3>
                      <p className="text-base text-gray-800 dark:text-white">{selectedItem.remarks}</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
