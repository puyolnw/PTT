import { motion } from "framer-motion";
import { TrendingUp, Calculator, RefreshCw, DollarSign, BarChart3 } from "lucide-react";

const currencyFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 0,
});

// Mock data - Variable Rent
const mockVariableRent = {
  contracts: [
    {
      id: "C-001",
      shop: "Chester's",
      branch: "สาขา A",
      rentType: "% จากยอดขาย",
      percentage: 5,
      salesFromM1: 500000, // ดึงจาก M1
      calculatedRent: 25000,
      previousMonth: 24000,
      change: 1000,
      changePercent: 4.17,
    },
    {
      id: "C-002",
      shop: "7-Eleven",
      branch: "สำนักงานใหญ่",
      rentType: "% จากยอดขาย",
      percentage: 7,
      salesFromM1: 300000,
      calculatedRent: 21000,
      previousMonth: 20000,
      change: 1000,
      changePercent: 5.0,
    },
    {
      id: "C-003",
      shop: "ร้านกาแฟ",
      branch: "สาขา B",
      rentType: "% จากยอดขาย",
      percentage: 3,
      salesFromM1: 200000,
      calculatedRent: 6000,
      previousMonth: 5500,
      change: 500,
      changePercent: 9.09,
    },
  ],
  summary: {
    totalContracts: 3,
    totalSales: 1000000,
    totalRent: 52000,
    averagePercentage: 5,
  },
};

export default function VariableRent() {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h2 className="text-3xl font-bold text-app mb-2 font-display">ค่าเช่าผันแปรตามยอดขาย</h2>
        <p className="text-muted font-light">
          คำนวณ % จากยอดขาย (ดึงจาก M1) → ค่าเช่าอัตโนมัติ
        </p>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="panel rounded-2xl p-6 shadow-app"
        >
          <div className="flex items-center justify-between mb-4">
            <Calculator className="w-6 h-6 text-ptt-cyan" />
            <span className="text-xs text-muted">สัญญาทั้งหมด</span>
          </div>
          <p className="text-2xl font-bold text-app">
            {mockVariableRent.summary.totalContracts}
          </p>
          <p className="text-xs text-muted mt-1">สัญญา</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="panel rounded-2xl p-6 shadow-app"
        >
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="w-6 h-6 text-emerald-400" />
            <span className="text-xs text-muted">ยอดขายรวม</span>
          </div>
          <p className="text-2xl font-bold text-emerald-400">
            {currencyFormatter.format(mockVariableRent.summary.totalSales)}
          </p>
          <p className="text-xs text-muted mt-1">จาก M1</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="panel rounded-2xl p-6 shadow-app"
        >
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="w-6 h-6 text-blue-400" />
            <span className="text-xs text-muted">ค่าเช่ารวม</span>
          </div>
          <p className="text-2xl font-bold text-blue-400">
            {currencyFormatter.format(mockVariableRent.summary.totalRent)}
          </p>
          <p className="text-xs text-muted mt-1">คำนวณอัตโนมัติ</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="panel rounded-2xl p-6 shadow-app"
        >
          <div className="flex items-center justify-between mb-4">
            <BarChart3 className="w-6 h-6 text-purple-400" />
            <span className="text-xs text-muted">เฉลี่ย %</span>
          </div>
          <p className="text-2xl font-bold text-purple-400">
            {mockVariableRent.summary.averagePercentage}%
          </p>
          <p className="text-xs text-muted mt-1">จากยอดขาย</p>
        </motion.div>
      </div>

      {/* Contracts List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="panel rounded-2xl p-6 shadow-app"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-app">สัญญาค่าเช่าผันแปร</h3>
            <p className="text-sm text-muted">
              คำนวณจากยอดขายใน M1 อัตโนมัติ
            </p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-ptt-blue/10 hover:bg-ptt-blue/20 border border-ptt-blue/30 rounded-xl text-ptt-cyan transition-colors">
            <RefreshCw className="w-5 h-5" />
            <span>อัปเดตจาก M1</span>
          </button>
        </div>
        <div className="space-y-3">
          {mockVariableRent.contracts.map((contract) => (
            <div
              key={contract.id}
              className="p-4 bg-soft rounded-xl border border-app hover:border-ptt-blue/30 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-semibold text-app">{contract.shop}</h4>
                    <span className="px-2 py-1 rounded-full bg-ptt-blue/10 text-ptt-cyan text-xs">
                      {contract.branch}
                    </span>
                    <span className="px-2 py-1 rounded-full bg-purple-500/10 text-purple-400 text-xs">
                      {contract.percentage}% จากยอดขาย
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-sm">
                    <div>
                      <span className="text-muted">ยอดขาย (M1): </span>
                      <span className="font-semibold text-app">
                        {currencyFormatter.format(contract.salesFromM1)}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted">อัตรา: </span>
                      <span className="text-app">{contract.percentage}%</span>
                    </div>
                    <div>
                      <span className="text-muted">ค่าเช่าคำนวณ: </span>
                      <span className="font-bold text-ptt-cyan">
                        {currencyFormatter.format(contract.calculatedRent)}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted">เดือนที่แล้ว: </span>
                      <span className="text-app">
                        {currencyFormatter.format(contract.previousMonth)}
                      </span>
                      {contract.change > 0 && (
                        <span className="text-emerald-400 ml-1">
                          (+{currencyFormatter.format(contract.change)})
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-muted">
                    <p>
                      สูตร: {currencyFormatter.format(contract.salesFromM1)} × {contract.percentage}% = {currencyFormatter.format(contract.calculatedRent)}
                    </p>
                  </div>
                </div>
                <div className="ml-4 text-right">
                  <div className="flex items-center gap-1 text-emerald-400">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-sm font-semibold">
                      +{contract.changePercent.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Integration Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="panel rounded-2xl p-6 shadow-app bg-gradient-to-br from-ptt-blue/10 to-ptt-cyan/10 border border-ptt-blue/30"
      >
        <div className="flex items-start gap-3">
          <Calculator className="w-6 h-6 text-ptt-cyan mt-0.5" />
          <div>
            <h4 className="font-semibold text-app mb-2">การเชื่อมต่อกับ M1</h4>
            <p className="text-sm text-muted">
              ระบบจะดึงยอดขายจากโมดูล M1 (Gas Station) อัตโนมัติทุกวัน เพื่อคำนวณค่าเช่าที่ผันแปรตามยอดขาย
            </p>
            <p className="text-xs text-muted mt-2">
              ตัวอย่าง: Chester's ขาย 500,000 บาท × 5% = 25,000 บาท (ค่าเช่า)
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

