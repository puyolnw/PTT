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
  Zap,
} from "lucide-react";
import { useShop } from "@/contexts/ShopContext";

const currencyFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 0,
});

// Mock data สำหรับ FIT Auto - รองรับหลายสาขาและแยกตามบริการ
const branches = ["สาขา A", "สาขา B", "สาขา C", "สาขา D", "สำนักงานใหญ่"];

const profitLossDataByBranchMap = new Map<string, {
  revenue: number;
  cost: number;
  profit: number;
  expenses: number;
  labor: number;
  netProfit: number;
  byService: {
    oilChange: number;
    tireRepair: number;
    inspection: number;
    others: number;
  };
}>([
  ["สาขา A", {
    revenue: 270000,
    cost: 162000,
    profit: 108000,
    expenses: 24000,
    labor: 18000,
    netProfit: 84000,
    byService: { oilChange: 189000, tireRepair: 54000, inspection: 18000, others: 9000 },
  }],
  ["สาขา B", {
    revenue: 240000,
    cost: 144000,
    profit: 96000,
    expenses: 22000,
    labor: 16000,
    netProfit: 74000,
    byService: { oilChange: 168000, tireRepair: 48000, inspection: 16000, others: 8000 },
  }],
  ["สาขา C", {
    revenue: 216000,
    cost: 129600,
    profit: 86400,
    expenses: 20000,
    labor: 15000,
    netProfit: 66400,
    byService: { oilChange: 151200, tireRepair: 43200, inspection: 14400, others: 7200 },
  }],
  ["สาขา D", {
    revenue: 198000,
    cost: 118800,
    profit: 79200,
    expenses: 18000,
    labor: 14000,
    netProfit: 65200,
    byService: { oilChange: 138600, tireRepair: 39600, inspection: 13200, others: 6600 },
  }],
  ["สำนักงานใหญ่", {
    revenue: 300000,
    cost: 180000,
    profit: 120000,
    expenses: 26000,
    labor: 20000,
    netProfit: 94000,
    byService: { oilChange: 210000, tireRepair: 60000, inspection: 20000, others: 10000 },
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
    acc.labor += data.labor;
    acc.netProfit += data.netProfit;
  }
  return acc;
}, { revenue: 0, cost: 0, profit: 0, expenses: 0, labor: 0, netProfit: 0 });

const topSellingServices = [
  { name: "เปลี่ยนน้ำมันเครื่อง PTT Lubricants", sales: 630000, cost: 378000, profit: 252000, service: "เปลี่ยนน้ำมันเครื่อง", trend: "+15%" },
  { name: "ซ่อมยาง", sales: 180000, cost: 108000, profit: 72000, service: "ซ่อมยาง", trend: "+8%" },
  { name: "ตรวจสภาพรถ", sales: 60000, cost: 36000, profit: 24000, service: "ตรวจสภาพรถ", trend: "+25%" },
  { name: "บริการ EV", sales: 30000, cost: 18000, profit: 12000, service: "อื่นๆ", trend: "+50%" },
];

export default function Reports() {
  const { currentShop } = useShop();
  const shopName = currentShop?.name || "FIT Auto";
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
              รายงานกำไร-ขาดทุน รายงานการซื้อ รายงานสต็อก และรายงานยอดขาย แยกตามสาขา/บริการ (เปลี่ยนน้ำมัน, ซ่อมยาง, ตรวจสภาพรถ, EV)
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
            <p className="text-sm text-muted mb-1">รายรับ</p>
            <p className="text-2xl font-bold text-emerald-400">
              {currencyFormatter.format(currentData.revenue)}
            </p>
          </div>
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
            <p className="text-sm text-muted mb-1">ต้นทุน (อะไหล่)</p>
            <p className="text-2xl font-bold text-red-400">
              {currencyFormatter.format(currentData.cost)}
            </p>
          </div>
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
            <p className="text-sm text-muted mb-1">ค่าแรงช่าง</p>
            <p className="text-2xl font-bold text-orange-400">
              {currencyFormatter.format(currentData.labor)}
            </p>
          </div>
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
            <p className="text-sm text-muted mb-1">กำไรขั้นต้น</p>
            <p className="text-2xl font-bold text-purple-400">
              {currencyFormatter.format(currentData.profit)}
            </p>
          </div>
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
            <p className="text-sm text-muted mb-1">รายจ่ายอื่นๆ</p>
            <p className="text-2xl font-bold text-yellow-400">
              {currencyFormatter.format(currentData.expenses - currentData.labor)}
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

      {/* Sales by Service */}
      {selectedBranch !== "ทั้งหมด" && profitLossDataByBranchMap.get(selectedBranch) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="panel rounded-2xl p-6"
        >
          <h3 className="text-xl font-semibold text-app mb-4">ยอดขายแยกตามบริการ - {selectedBranch}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
              <p className="text-sm text-muted mb-1">เปลี่ยนน้ำมันเครื่อง</p>
              <p className="text-2xl font-bold text-orange-400">
                {currencyFormatter.format(profitLossDataByBranchMap.get(selectedBranch)?.byService.oilChange || 0)}
              </p>
            </div>
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
              <p className="text-sm text-muted mb-1">ซ่อมยาง</p>
              <p className="text-2xl font-bold text-blue-400">
                {currencyFormatter.format(profitLossDataByBranchMap.get(selectedBranch)?.byService.tireRepair || 0)}
              </p>
            </div>
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
              <p className="text-sm text-muted mb-1">ตรวจสภาพรถ</p>
              <p className="text-2xl font-bold text-purple-400">
                {currencyFormatter.format(profitLossDataByBranchMap.get(selectedBranch)?.byService.inspection || 0)}
              </p>
            </div>
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
              <p className="text-sm text-muted mb-1">อื่นๆ (EV)</p>
              <p className="text-2xl font-bold text-green-400">
                {currencyFormatter.format(profitLossDataByBranchMap.get(selectedBranch)?.byService.others || 0)}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Branch Comparison */}
      {selectedBranch === "ทั้งหมด" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
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
                  <div className="grid grid-cols-5 gap-4 text-sm">
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
                      <p className="text-xs text-muted">ค่าแรง</p>
                      <p className="text-app font-medium">
                        {currencyFormatter.format(data.labor)}
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

      {/* Top Selling Services */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="panel rounded-2xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-app">บริการขายดี (ฮิต: เปลี่ยนน้ำมัน PTT Lubricants)</h3>
          <TrendingUp className="w-6 h-6 text-muted" />
        </div>
        <div className="space-y-4">
          {topSellingServices.map((item, index) => (
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
                    <p className="text-xs text-muted">{item.service}</p>
                  </div>
                  {item.service === "อื่นๆ" && (
                    <Zap className="w-4 h-4 text-green-400" />
                  )}
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
          transition={{ delay: 0.5 }}
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
          transition={{ delay: 0.6 }}
          className="panel rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <Package className="w-8 h-8 text-ptt-cyan" />
            <span className="text-sm text-muted">มูลค่าสต็อก</span>
          </div>
          <p className="text-2xl font-bold text-app">
            {currencyFormatter.format(3500000)}
          </p>
          <p className="text-sm text-muted mt-2">รวมต้นทุน</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
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

