import { motion } from "framer-motion";
import { BarChart3, DollarSign, TrendingUp, TrendingDown, Building2, AlertTriangle } from "lucide-react";

const currencyFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 0,
});

// Mock data - Lease Dashboard
const mockLeaseDashboard = {
  thisMonth: {
    rentalIncome: 150000, // รายได้ค่าเช่า
    rentalExpenses: 50000, // ค่าเช่าที่ต้องจ่าย
    netProfit: 100000, // กำไรสุทธิ
    overdue: 20000, // หนี้ค้าง
  },
  lastMonth: {
    rentalIncome: 140000,
    rentalExpenses: 48000,
    netProfit: 92000,
  },
  byShop: {
    "FIT Auto": { amount: 35000, branches: 5, type: "คงที่" },
    "Chester's": { amount: 25000, branches: 3, type: "% จากยอดขาย" },
    "Daiso": { amount: 20000, branches: 5, type: "คงที่" },
    "Quick": { amount: 30000, branches: 5, type: "คงที่" },
    "ร้าน EV": { amount: 17500, branches: 5, type: "คงที่" },
    "อื่นๆ": { amount: 22500, branches: 5, type: "คงที่" },
  },
  byBranch: {
    "สำนักงานใหญ่": { income: 50000, expenses: 15000, net: 35000 },
    "สาขา A": { income: 40000, expenses: 12000, net: 28000 },
    "สาขา B": { income: 35000, expenses: 10000, net: 25000 },
    "สาขา C": { income: 15000, expenses: 8000, net: 7000 },
    "สาขา D": { income: 10000, expenses: 5000, net: 5000 },
  },
  overdueShops: [
    { name: "Daiso", amount: 20000, days: 30, branch: "สาขา A" },
  ],
};

export default function LeaseDashboard() {
  const incomeChange = ((mockLeaseDashboard.thisMonth.rentalIncome - mockLeaseDashboard.lastMonth.rentalIncome) / mockLeaseDashboard.lastMonth.rentalIncome) * 100;
  const profitChange = ((mockLeaseDashboard.thisMonth.netProfit - mockLeaseDashboard.lastMonth.netProfit) / mockLeaseDashboard.lastMonth.netProfit) * 100;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h2 className="text-3xl font-bold text-app mb-2 font-display">แดชบอร์ดพื้นที่เช่า</h2>
        <p className="text-muted font-light">
          ดูภาพรวม: รายได้ค่าเช่า, ค่าเช่าที่ต้องจ่าย, ค้างชำระ
        </p>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="panel rounded-2xl p-6 shadow-app border-2 border-emerald-500/30"
        >
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="w-6 h-6 text-emerald-400" />
            <span className="text-xs text-muted">รายได้ค่าเช่า</span>
          </div>
          <p className="text-2xl font-bold text-emerald-400">
            {currencyFormatter.format(mockLeaseDashboard.thisMonth.rentalIncome)}
          </p>
          <p className="text-xs text-muted mt-1">
            เดือนที่แล้ว: {currencyFormatter.format(mockLeaseDashboard.lastMonth.rentalIncome)}
            {incomeChange > 0 && (
              <span className="text-emerald-400 ml-1">(+{incomeChange.toFixed(1)}%)</span>
            )}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="panel rounded-2xl p-6 shadow-app border-2 border-red-500/30"
        >
          <div className="flex items-center justify-between mb-4">
            <TrendingDown className="w-6 h-6 text-red-400" />
            <span className="text-xs text-muted">ค่าเช่าที่ต้องจ่าย</span>
          </div>
          <p className="text-2xl font-bold text-red-400">
            {currencyFormatter.format(mockLeaseDashboard.thisMonth.rentalExpenses)}
          </p>
          <p className="text-xs text-muted mt-1">
            เดือนที่แล้ว: {currencyFormatter.format(mockLeaseDashboard.lastMonth.rentalExpenses)}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="panel rounded-2xl p-6 shadow-app border-2 border-ptt-blue/30"
        >
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="w-6 h-6 text-ptt-cyan" />
            <span className="text-xs text-muted">กำไรสุทธิ</span>
          </div>
          <p className="text-2xl font-bold text-ptt-cyan">
            {currencyFormatter.format(mockLeaseDashboard.thisMonth.netProfit)}
          </p>
          <p className="text-xs text-muted mt-1">
            เดือนที่แล้ว: {currencyFormatter.format(mockLeaseDashboard.lastMonth.netProfit)}
            {profitChange > 0 && (
              <span className="text-emerald-400 ml-1">(+{profitChange.toFixed(1)}%)</span>
            )}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="panel rounded-2xl p-6 shadow-app border-2 border-orange-500/30"
        >
          <div className="flex items-center justify-between mb-4">
            <AlertTriangle className="w-6 h-6 text-orange-400" />
            <span className="text-xs text-muted">หนี้ค้าง</span>
          </div>
          <p className="text-2xl font-bold text-orange-400">
            {currencyFormatter.format(mockLeaseDashboard.thisMonth.overdue)}
          </p>
          <p className="text-xs text-muted mt-1">
            {mockLeaseDashboard.overdueShops.length} รายการ
          </p>
        </motion.div>
      </div>

      {/* By Shop */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="panel rounded-2xl p-6 shadow-app"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-app">รายได้ค่าเช่าแยกร้าน</h3>
            <p className="text-sm text-muted">รวมทั้ง 5 ปั๊ม</p>
          </div>
          <BarChart3 className="w-6 h-6 text-muted" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(mockLeaseDashboard.byShop).map(([shop, data]) => (
            <div key={shop} className="p-4 bg-ptt-blue/10 border border-ptt-blue/30 rounded-xl">
              <p className="text-sm text-muted mb-1">{shop}</p>
              <p className="text-2xl font-bold text-ptt-cyan">
                {currencyFormatter.format(data.amount)}
              </p>
              <p className="text-xs text-muted mt-1">
                {data.branches} สาขา • {data.type}
              </p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* By Branch */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="panel rounded-2xl p-6 shadow-app"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-app">รายได้ค่าเช่าแยกสาขา</h3>
            <p className="text-sm text-muted">ดูทุกสาขาในหน้าเดียว</p>
          </div>
          <Building2 className="w-6 h-6 text-muted" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-app">
                <th className="text-left py-3 px-4 text-sm font-semibold text-muted">สาขา</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-muted">รายได้ค่าเช่า</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-muted">ค่าเช่าที่จ่าย</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-muted">กำไรสุทธิ</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(mockLeaseDashboard.byBranch).map(([branch, data]) => (
                <tr
                  key={branch}
                  className="border-b border-app/50 hover:bg-soft/50 transition-colors"
                >
                  <td className="py-3 px-4">
                    <span className="font-medium text-app">{branch}</span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="font-semibold text-emerald-400">
                      {currencyFormatter.format(data.income)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="font-semibold text-red-400">
                      {currencyFormatter.format(data.expenses)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="font-bold text-ptt-cyan">
                      {currencyFormatter.format(data.net)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Overdue Alerts */}
      {mockLeaseDashboard.overdueShops.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="panel rounded-2xl p-6 shadow-app border-2 border-orange-500/30"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-semibold text-app">หนี้ค้างชำระ</h3>
              <p className="text-sm text-muted">
                {mockLeaseDashboard.overdueShops.length} รายการ
              </p>
            </div>
            <AlertTriangle className="w-6 h-6 text-orange-400" />
          </div>
          <div className="space-y-2">
            {mockLeaseDashboard.overdueShops.map((shop) => (
              <div
                key={shop.name}
                className="p-3 bg-orange-500/10 border border-orange-500/30 rounded-xl"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-app">{shop.name} ({shop.branch})</p>
                    <p className="text-xs text-muted">ค้างชำระ {shop.days} วัน</p>
                  </div>
                  <p className="text-lg font-bold text-orange-400">
                    {currencyFormatter.format(shop.amount)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

