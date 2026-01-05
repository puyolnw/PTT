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
  Target,
} from "lucide-react";
import { useShop } from "@/contexts/ShopContext";

const currencyFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 0,
});

// Mock data สำหรับร้านเจียง - รองรับหลายสาขาและแยกตามเมนู
const branches = ["สาขา A", "สาขา B", "สาขา C", "สาขา D", "สำนักงานใหญ่"];

const profitLossDataByBranchMap = new Map<string, {
  revenue: number;
  cost: number;
  profit: number;
  expenses: number;
  netProfit: number;
  byMenu: {
    kuayTiew: number;
    yenTaFo: number;
    others: number;
  };
}>([
  ["สาขา A", {
    revenue: 162000,
    cost: 97200,
    profit: 64800,
    expenses: 18000,
    netProfit: 46800,
    byMenu: { kuayTiew: 97200, yenTaFo: 48600, others: 16200 },
  }],
  ["สาขา B", {
    revenue: 144000,
    cost: 86400,
    profit: 57600,
    expenses: 16000,
    netProfit: 41600,
    byMenu: { kuayTiew: 86400, yenTaFo: 43200, others: 14400 },
  }],
  ["สาขา C", {
    revenue: 132000,
    cost: 79200,
    profit: 52800,
    expenses: 15000,
    netProfit: 37800,
    byMenu: { kuayTiew: 79200, yenTaFo: 39600, others: 13200 },
  }],
  ["สาขา D", {
    revenue: 120000,
    cost: 72000,
    profit: 48000,
    expenses: 14000,
    netProfit: 34000,
    byMenu: { kuayTiew: 72000, yenTaFo: 36000, others: 12000 },
  }],
  ["สำนักงานใหญ่", {
    revenue: 180000,
    cost: 108000,
    profit: 72000,
    expenses: 20000,
    netProfit: 52000,
    byMenu: { kuayTiew: 108000, yenTaFo: 54000, others: 18000 },
  }],
]);

// Calculate totals across all branches
const totalProfitLoss = branches.reduce((acc, branch) => {
  const data = profitLossDataByBranchMap.get(branch);
  if (data) {
    acc.revenue += data.revenue;
    acc.cost += data.cost;
    acc.profit += data.profit;
    acc.expenses += data.expenses;
    acc.netProfit += data.netProfit;
  }
  return acc;
}, { revenue: 0, cost: 0, profit: 0, expenses: 0, netProfit: 0 });

const topSellingItems = [
  { name: "เย็นตาโฟ", sales: 162000, cost: 97200, profit: 64800, menu: "เย็นตาโฟ", trend: "+15%" },
  { name: "ก๋วยเตี๋ยวลูกชิ้นปลา", sales: 324000, cost: 194400, profit: 129600, menu: "ก๋วยเตี๋ยว", trend: "+8%" },
  { name: "ขนมจีนบุฟเฟ่ต์", sales: 54000, cost: 32400, profit: 21600, menu: "อื่นๆ", trend: "+25%" },
];

// Purchase planning data
const purchasePlanning = [
  { item: "ลูกชิ้นปลา", currentStock: 50, threshold: 100, recommended: 100, unit: "กก.", reason: "สต็อกต่ำกว่าเกณฑ์" },
  { item: "ปลาสด", currentStock: 25, threshold: 50, recommended: 50, unit: "กก.", reason: "สต็อกต่ำและใกล้หมดอายุ" },
  { item: "เส้นก๋วยเตี๋ยว", currentStock: 30, threshold: 80, recommended: 80, unit: "กก.", reason: "สต็อกต่ำกว่าเกณฑ์" },
];

export default function Reports() {
  const { currentShop } = useShop();
  const shopName = currentShop?.name || "ร้านเจียง (Jiang Fish Balls)";
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [selectedBranch, setSelectedBranch] = useState<string>("ทั้งหมด");

  const handleExport = (format: "pdf" | "excel") => {
    alert(`กำลังส่งออกรายงานเป็น ${format.toUpperCase()}...`);
  };

  const currentData = (selectedBranch === "ทั้งหมด"
    ? totalProfitLoss
    : profitLossDataByBranchMap.get(selectedBranch)) || totalProfitLoss;

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
              รายงานกำไร-ขาดทุน รายงานการซื้อ รายงานสต็อก และรายงานยอดขาย แยกตามสาขา/เมนู การวางแผนการสั่งซื้อ
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
              className={`px-4 py-2 rounded-lg transition-colors ${selectedPeriod === period
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

      {/* Sales by Menu */}
      {selectedBranch !== "ทั้งหมด" && profitLossDataByBranchMap.get(selectedBranch) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="panel rounded-2xl p-6"
        >
          <h3 className="text-xl font-semibold text-app mb-4">ยอดขายแยกตามเมนู - {selectedBranch}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
              <p className="text-sm text-muted mb-1">ก๋วยเตี๋ยวลูกชิ้นปลา</p>
              <p className="text-2xl font-bold text-orange-400">
                {currencyFormatter.format(profitLossDataByBranchMap.get(selectedBranch)?.byMenu.kuayTiew || 0)}
              </p>
            </div>
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
              <p className="text-sm text-muted mb-1">เย็นตาโฟ</p>
              <p className="text-2xl font-bold text-blue-400">
                {currencyFormatter.format(profitLossDataByBranchMap.get(selectedBranch)?.byMenu.yenTaFo || 0)}
              </p>
            </div>
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
              <p className="text-sm text-muted mb-1">อื่นๆ</p>
              <p className="text-2xl font-bold text-purple-400">
                {currencyFormatter.format(profitLossDataByBranchMap.get(selectedBranch)?.byMenu.others || 0)}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Purchase Planning */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="panel rounded-2xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-app">การวางแผนการสั่งซื้อ</h3>
          <Target className="w-6 h-6 text-muted" />
        </div>
        <div className="space-y-4">
          {purchasePlanning.map((item) => (
            <div
              key={item.item}
              className="p-4 bg-soft rounded-xl border border-app"
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="font-semibold text-app">{item.item}</p>
                  <p className="text-sm text-muted">{item.reason}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-ptt-cyan">
                    {item.recommended} {item.unit}
                  </p>
                  <p className="text-xs text-muted">แนะนำสั่งซื้อ</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-3 pt-3 border-t border-app">
                <div>
                  <p className="text-xs text-muted">สต็อกปัจจุบัน</p>
                  <p className="text-sm font-medium text-app">
                    {item.currentStock} {item.unit}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted">เกณฑ์ต่ำสุด</p>
                  <p className="text-sm font-medium text-orange-400">
                    {item.threshold} {item.unit}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted">แนะนำสั่ง</p>
                  <p className="text-sm font-medium text-emerald-400">
                    {item.recommended} {item.unit}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Branch Comparison */}
      {selectedBranch === "ทั้งหมด" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="panel rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-app">เปรียบเทียบสาขา</h3>
            <Building2 className="w-6 h-6 text-muted" />
          </div>
          <div className="space-y-4">
            {branches.map((branch) => {
              const data = profitLossDataByBranchMap.get(branch);
              if (!data) return null;
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
        transition={{ delay: 0.5 }}
        className="panel rounded-2xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-app">เมนูขายดี</h3>
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
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${index === 0 ? "bg-ptt-blue/20 text-ptt-cyan" :
                    index === 1 ? "bg-emerald-500/20 text-emerald-400" :
                      "bg-muted/20 text-muted"
                    }`}>
                    <span className="text-sm font-bold">{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-app">{item.name}</p>
                    <p className="text-xs text-muted">{item.menu}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-app">
                    {currencyFormatter.format(item.sales)}
                  </p>
                  <div className={`flex items-center gap-1 text-xs ${item.trend.startsWith('+') ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                    {item.trend.startsWith('+') ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingUp className="w-3 h-3 rotate-180" />
                    )}
                    {item.trend}
                  </div>
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
          transition={{ delay: 0.6 }}
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
          transition={{ delay: 0.7 }}
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
          transition={{ delay: 0.8 }}
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

