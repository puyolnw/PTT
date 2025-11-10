import { useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  Download,
  TrendingUp,
  DollarSign,
  Package,
  ShoppingCart,
  Calendar,
} from "lucide-react";
import { useShop } from "@/contexts/ShopContext";

const currencyFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 0,
});

// Mock data
const profitLossData = {
  revenue: 450000,
  cost: 280000,
  profit: 170000,
  expenses: 50000,
  netProfit: 120000,
};

const topSellingItems = [
  { name: "หมูหยอง", sales: 150000, cost: 90000, profit: 60000 },
  { name: "กุนเชียง", sales: 120000, cost: 75000, profit: 45000 },
  { name: "หมูแผ่น", sales: 80000, cost: 50000, profit: 30000 },
  { name: "แหนม", sales: 50000, cost: 35000, profit: 15000 },
];

// Mock data for purchase report
const purchaseReportData = [
  { date: "2024-12-15", supplier: "ตลาดสด", item: "เนื้อหมู", quantity: "100 กก.", amount: 50000 },
  { date: "2024-12-10", supplier: "PTT", item: "ค่าน้ำ/ไฟ", quantity: "-", amount: 3000 },
  { date: "2024-12-08", supplier: "ซัพพลายเออร์ A", item: "วัตถุดิบ", quantity: "50 ชิ้น", amount: 15000 },
  { date: "2024-12-05", supplier: "บริษัทขนส่ง", item: "ค่าขนส่ง", quantity: "-", amount: 2000 },
  { date: "2024-12-01", supplier: "ช่างซ่อม", item: "ค่าซ่อม", quantity: "-", amount: 5000 },
];

// Mock data for stock report
const stockReportData = [
  { name: "กุนเชียง", quantity: 500, unit: "ชิ้น", cost: 50, totalValue: 25000, category: "อาหารแปรรูป" },
  { name: "หมูหยอง", quantity: 100, unit: "กรัม", cost: 200, totalValue: 20000, category: "อาหารแปรรูป" },
  { name: "หมูแผ่น", quantity: 300, unit: "ชิ้น", cost: 30, totalValue: 9000, category: "อาหารแปรรูป" },
  { name: "แหนม", quantity: 50, unit: "ชิ้น", cost: 40, totalValue: 2000, category: "อาหารแปรรูป" },
];

// Mock data for sales report by period
const salesByPeriod = {
  daily: [
    { date: "2024-12-15", items: ["หมูหยอง", "กุนเชียง"], total: 2550 },
    { date: "2024-12-14", items: ["หมูหยอง", "กุนเชียง", "หมูแผ่น"], total: 5350 },
    { date: "2024-12-13", items: ["แหนม", "หมูแผ่น"], total: 270 },
  ],
  monthly: [
    { month: "ธันวาคม 2567", total: 450000, items: 120 },
    { month: "พฤศจิกายน 2567", total: 420000, items: 115 },
  ],
};

export default function Reports() {
  const { currentShop } = useShop();
  const shopName = currentShop?.name || "ปึงหงี่เชียง";
  const [selectedPeriod, setSelectedPeriod] = useState("month");

  const handleExport = (format: "pdf" | "excel") => {
    alert(`กำลังส่งออกรายงานเป็น ${format.toUpperCase()}...`);
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-app mb-2 font-display">รายงาน - {shopName}</h2>
            <p className="text-muted font-light">
              รายงานกำไร-ขาดทุน รายงานการซื้อ รายงานสต็อก และรายงานยอดขาย
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleExport("pdf")}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>ส่งออก PDF</span>
            </button>
            <button
              onClick={() => handleExport("excel")}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>ส่งออก Excel</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Period Selector */}
      <div className="flex gap-2">
        {["day", "week", "month", "year"].map((period) => (
          <button
            key={period}
            onClick={() => setSelectedPeriod(period)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedPeriod === period
                ? "bg-ptt-blue text-white"
                : "bg-soft text-app hover:bg-app/10"
            }`}
          >
            {period === "day" ? "รายวัน" :
             period === "week" ? "รายสัปดาห์" :
             period === "month" ? "รายเดือน" : "รายปี"}
          </button>
        ))}
      </div>

      {/* Profit & Loss Report */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="panel rounded-2xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-app">รายงานกำไรและขาดทุน</h3>
          <BarChart3 className="w-6 h-6 text-muted" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
            <p className="text-sm text-muted mb-1">รายรับ</p>
            <p className="text-2xl font-bold text-emerald-400">
              {currencyFormatter.format(profitLossData.revenue)}
            </p>
          </div>
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
            <p className="text-sm text-muted mb-1">ต้นทุน</p>
            <p className="text-2xl font-bold text-red-400">
              {currencyFormatter.format(profitLossData.cost)}
            </p>
          </div>
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
            <p className="text-sm text-muted mb-1">กำไรขั้นต้น</p>
            <p className="text-2xl font-bold text-purple-400">
              {currencyFormatter.format(profitLossData.profit)}
            </p>
          </div>
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
            <p className="text-sm text-muted mb-1">รายจ่าย</p>
            <p className="text-2xl font-bold text-orange-400">
              {currencyFormatter.format(profitLossData.expenses)}
            </p>
          </div>
          <div className="bg-ptt-blue/10 border border-ptt-blue/30 rounded-xl p-4">
            <p className="text-sm text-muted mb-1">กำไรสุทธิ</p>
            <p className="text-2xl font-bold text-ptt-cyan">
              {currencyFormatter.format(profitLossData.netProfit)}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Top Selling Items */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="panel rounded-2xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-app">สินค้าขายดี</h3>
          <TrendingUp className="w-6 h-6 text-muted" />
        </div>
        <div className="space-y-4">
          {topSellingItems.map((item, index) => (
            <div
              key={item.name}
              className="p-4 bg-soft rounded-xl border border-app"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    index === 0 ? "bg-ptt-blue/20 text-ptt-cyan" :
                    index === 1 ? "bg-emerald-500/20 text-emerald-400" :
                    "bg-muted/20 text-muted"
                  }`}>
                    <span className="text-sm font-bold">{index + 1}</span>
                  </div>
                  <p className="font-semibold text-app">{item.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-app">
                    {currencyFormatter.format(item.sales)}
                  </p>
                  <p className="text-xs text-muted">ยอดขาย</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-3 pt-3 border-t border-app">
                <div>
                  <p className="text-xs text-muted">ต้นทุน</p>
                  <p className="text-sm font-medium text-app">
                    {currencyFormatter.format(item.cost)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted">กำไร</p>
                  <p className="text-sm font-medium text-emerald-400">
                    {currencyFormatter.format(item.profit)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted">อัตรากำไร</p>
                  <p className="text-sm font-medium text-ptt-cyan">
                    {((item.profit / item.sales) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Purchase Report */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="panel rounded-2xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-app">รายงานการซื้อสินค้าเข้า</h3>
          <ShoppingCart className="w-6 h-6 text-muted" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-app">
                <th className="text-left py-3 px-4 text-sm font-semibold text-app">วันที่</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-app">ซัพพลายเออร์</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-app">สินค้า/รายการ</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-app">จำนวน</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-app">ยอดรวม</th>
              </tr>
            </thead>
            <tbody>
              {purchaseReportData.map((purchase, index) => (
                <tr key={index} className="border-b border-app/50 hover:bg-soft/50">
                  <td className="py-3 px-4">
                    {new Date(purchase.date).toLocaleDateString("th-TH")}
                  </td>
                  <td className="py-3 px-4">{purchase.supplier}</td>
                  <td className="py-3 px-4">{purchase.item}</td>
                  <td className="py-3 px-4">{purchase.quantity}</td>
                  <td className="py-3 px-4 text-right font-semibold text-app">
                    {currencyFormatter.format(purchase.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Stock Report */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="panel rounded-2xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-app">รายงานสต็อกสินค้า</h3>
          <Package className="w-6 h-6 text-muted" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-app">
                <th className="text-left py-3 px-4 text-sm font-semibold text-app">สินค้า</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-app">คงเหลือ</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-app">ต้นทุนต่อหน่วย</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-app">มูลค่าสต็อก</th>
              </tr>
            </thead>
            <tbody>
              {stockReportData.map((item, index) => (
                <tr key={index} className="border-b border-app/50 hover:bg-soft/50">
                  <td className="py-3 px-4">
                    <p className="font-medium text-app">{item.name}</p>
                    <p className="text-xs text-muted">{item.category}</p>
                  </td>
                  <td className="py-3 px-4">
                    {item.quantity} {item.unit}
                  </td>
                  <td className="py-3 px-4">
                    {currencyFormatter.format(item.cost)}
                  </td>
                  <td className="py-3 px-4 text-right font-semibold text-app">
                    {currencyFormatter.format(item.totalValue)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-app">
                <td colSpan={3} className="py-3 px-4 text-right font-semibold text-app">
                  มูลค่าสต็อกรวม
                </td>
                <td className="py-3 px-4 text-right font-bold text-ptt-cyan">
                  {currencyFormatter.format(
                    stockReportData.reduce((sum, item) => sum + item.totalValue, 0)
                  )}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </motion.div>

      {/* Sales Report by Period */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="panel rounded-2xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-app">รายงานยอดขายรายวัน/เดือน/ปี</h3>
          <Calendar className="w-6 h-6 text-muted" />
        </div>
        {selectedPeriod === "day" && (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-app mb-4">รายงานยอดขายรายวัน</h4>
            {salesByPeriod.daily.map((sale, index) => (
              <div key={index} className="p-4 bg-soft rounded-xl border border-app">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-semibold text-app">
                      {new Date(sale.date).toLocaleDateString("th-TH", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                    <p className="text-sm text-muted mt-1">
                      สินค้า: {sale.items.join(", ")}
                    </p>
                  </div>
                  <p className="text-xl font-bold text-ptt-cyan">
                    {currencyFormatter.format(sale.total)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
        {selectedPeriod === "month" && (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-app mb-4">รายงานยอดขายรายเดือน</h4>
            {salesByPeriod.monthly.map((sale, index) => (
              <div key={index} className="p-4 bg-soft rounded-xl border border-app">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-semibold text-app">{sale.month}</p>
                    <p className="text-sm text-muted mt-1">
                      {sale.items} รายการ
                    </p>
                  </div>
                  <p className="text-xl font-bold text-ptt-cyan">
                    {currencyFormatter.format(sale.total)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
        {(selectedPeriod === "week" || selectedPeriod === "year") && (
          <div className="text-center py-12 text-muted">
            กำลังพัฒนารายงานรายสัปดาห์และรายปี
          </div>
        )}
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="panel rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="w-8 h-8 text-emerald-400" />
            <span className="text-sm text-muted">ยอดขายรวม</span>
          </div>
          <p className="text-2xl font-bold text-app">
            {currencyFormatter.format(profitLossData.revenue)}
          </p>
          <p className="text-sm text-muted mt-2">รายเดือน</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="panel rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <Package className="w-8 h-8 text-ptt-cyan" />
            <span className="text-sm text-muted">มูลค่าสต็อก</span>
          </div>
          <p className="text-2xl font-bold text-app">
            {currencyFormatter.format(
              stockReportData.reduce((sum, item) => sum + item.totalValue, 0)
            )}
          </p>
          <p className="text-sm text-muted mt-2">รวมต้นทุน</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="panel rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <ShoppingCart className="w-8 h-8 text-orange-400" />
            <span className="text-sm text-muted">การซื้อเข้า</span>
          </div>
          <p className="text-2xl font-bold text-app">
            {currencyFormatter.format(
              purchaseReportData.reduce((sum, p) => sum + p.amount, 0)
            )}
          </p>
          <p className="text-sm text-muted mt-2">รายเดือน</p>
        </motion.div>
      </div>
    </div>
  );
}

