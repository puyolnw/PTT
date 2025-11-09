import { useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  Download,
  TrendingUp,
  DollarSign,
  Package,
  ShoppingCart,
  Building2,
} from "lucide-react";
import { useShop } from "@/contexts/ShopContext";

const currencyFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 0,
});

// Mock data สำหรับเซเว่น - รองรับหลายสาขา
const branches = ["สาขา A", "สาขา B", "สาขา C", "สาขา D", "สำนักงานใหญ่"];

const profitLossDataByBranch: Record<string, {
  revenue: number;
  cost: number;
  profit: number;
  expenses: number;
  netProfit: number;
}> = {
  "สาขา A": {
    revenue: 1350000,
    cost: 810000,
    profit: 540000,
    expenses: 150000,
    netProfit: 390000,
  },
  "สาขา B": {
    revenue: 1200000,
    cost: 720000,
    profit: 480000,
    expenses: 130000,
    netProfit: 350000,
  },
  "สาขา C": {
    revenue: 1100000,
    cost: 660000,
    profit: 440000,
    expenses: 120000,
    netProfit: 320000,
  },
  "สาขา D": {
    revenue: 1000000,
    cost: 600000,
    profit: 400000,
    expenses: 110000,
    netProfit: 290000,
  },
  "สำนักงานใหญ่": {
    revenue: 1500000,
    cost: 900000,
    profit: 600000,
    expenses: 180000,
    netProfit: 420000,
  },
};

// Calculate totals across all branches
const totalProfitLoss = branches.reduce((acc, branch) => {
  const data = profitLossDataByBranch[branch];
  acc.revenue += data.revenue;
  acc.cost += data.cost;
  acc.profit += data.profit;
  acc.expenses += data.expenses;
  acc.netProfit += data.netProfit;
  return acc;
}, { revenue: 0, cost: 0, profit: 0, expenses: 0, netProfit: 0 });

const topSellingItems = [
  { name: "กาแฟเย็น", sales: 450000, cost: 270000, profit: 180000, category: "เครื่องดื่ม" },
  { name: "ขนมปัง", sales: 360000, cost: 240000, profit: 120000, category: "อาหาร" },
  { name: "น้ำอัดลม", sales: 240000, cost: 144000, profit: 96000, category: "เครื่องดื่ม" },
  { name: "บะหมี่กึ่งสำเร็จรูป", sales: 150000, cost: 80000, profit: 70000, category: "อาหาร" },
];

export default function Reports() {
  const { currentShop } = useShop();
  const shopName = currentShop?.name || "เซเว่น (7-Eleven)";
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [selectedBranch, setSelectedBranch] = useState<string>("ทั้งหมด");

  const handleExport = (format: "pdf" | "excel") => {
    alert(`กำลังส่งออกรายงานเป็น ${format.toUpperCase()}...`);
  };

  const currentData = selectedBranch === "ทั้งหมด" 
    ? totalProfitLoss 
    : profitLossDataByBranch[selectedBranch] || totalProfitLoss;

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
              รายงานกำไร-ขาดทุน รายงานการซื้อ รายงานสต็อก และรายงานยอดขาย แยกตามสาขา
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

      {/* Period and Branch Selector */}
      <div className="flex flex-col md:flex-row gap-4">
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
        <div className="flex gap-2">
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="px-4 py-2 bg-soft border border-app rounded-lg text-app"
          >
            <option value="ทั้งหมด">ทั้งหมด (5 สาขา)</option>
            {branches.map((branch) => (
              <option key={branch} value={branch}>{branch}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Profit & Loss Report */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="panel rounded-2xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-app">รายงานกำไรและขาดทุน</h3>
            <p className="text-sm text-muted">
              {selectedBranch === "ทั้งหมด" ? "รวมทุกสาขา" : selectedBranch}
            </p>
          </div>
          <BarChart3 className="w-6 h-6 text-muted" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
            <p className="text-sm text-muted mb-1">รายรับ</p>
            <p className="text-2xl font-bold text-emerald-400">
              {currencyFormatter.format(currentData.revenue)}
            </p>
          </div>
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
            <p className="text-sm text-muted mb-1">ต้นทุน</p>
            <p className="text-2xl font-bold text-red-400">
              {currencyFormatter.format(currentData.cost)}
            </p>
          </div>
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
            <p className="text-sm text-muted mb-1">กำไรขั้นต้น</p>
            <p className="text-2xl font-bold text-purple-400">
              {currencyFormatter.format(currentData.profit)}
            </p>
          </div>
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
            <p className="text-sm text-muted mb-1">รายจ่าย</p>
            <p className="text-2xl font-bold text-orange-400">
              {currencyFormatter.format(currentData.expenses)}
            </p>
          </div>
          <div className="bg-ptt-blue/10 border border-ptt-blue/30 rounded-xl p-4">
            <p className="text-sm text-muted mb-1">กำไรสุทธิ</p>
            <p className="text-2xl font-bold text-ptt-cyan">
              {currencyFormatter.format(currentData.netProfit)}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Branch Comparison */}
      {selectedBranch === "ทั้งหมด" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="panel rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-app">เปรียบเทียบสาขา</h3>
            <Building2 className="w-6 h-6 text-muted" />
          </div>
          <div className="space-y-4">
            {branches.map((branch) => {
              const data = profitLossDataByBranch[branch];
              return (
                <div
                  key={branch}
                  className="p-4 bg-soft rounded-xl border border-app"
                >
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-semibold text-app">{branch}</p>
                    <p className="text-lg font-bold text-ptt-cyan">
                      {currencyFormatter.format(data.netProfit)}
                    </p>
                  </div>
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-xs text-muted">รายรับ</p>
                      <p className="text-app font-medium">
                        {currencyFormatter.format(data.revenue)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted">ต้นทุน</p>
                      <p className="text-app font-medium">
                        {currencyFormatter.format(data.cost)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted">รายจ่าย</p>
                      <p className="text-app font-medium">
                        {currencyFormatter.format(data.expenses)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted">กำไรสุทธิ</p>
                      <p className="text-emerald-400 font-semibold">
                        {currencyFormatter.format(data.netProfit)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Top Selling Items */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
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
                  <div>
                    <p className="font-semibold text-app">{item.name}</p>
                    <p className="text-xs text-muted">{item.category}</p>
                  </div>
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="panel rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="w-8 h-8 text-emerald-400" />
            <span className="text-sm text-muted">ยอดขายรวม</span>
          </div>
          <p className="text-2xl font-bold text-app">
            {currencyFormatter.format(currentData.revenue)}
          </p>
          <p className="text-sm text-muted mt-2">รายเดือน</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="panel rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <Package className="w-8 h-8 text-ptt-cyan" />
            <span className="text-sm text-muted">มูลค่าสต็อก</span>
          </div>
          <p className="text-2xl font-bold text-app">
            {currencyFormatter.format(2800000)}
          </p>
          <p className="text-sm text-muted mt-2">รวมต้นทุน</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="panel rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <ShoppingCart className="w-8 h-8 text-orange-400" />
            <span className="text-sm text-muted">การซื้อเข้า</span>
          </div>
          <p className="text-2xl font-bold text-app">
            {currencyFormatter.format(currentData.cost)}
          </p>
          <p className="text-sm text-muted mt-2">รายเดือน</p>
        </motion.div>
      </div>
    </div>
  );
}

