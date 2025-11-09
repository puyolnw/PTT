import { motion } from "framer-motion";
import { Clock, AlertTriangle, TrendingUp, Building2 } from "lucide-react";
import { useState } from "react";

const currencyFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 0,
});

// Mock data - Rental Aging Report
const mockAgingData = {
  receivables: {
    total: 20000,
    current: 0, // 0-30 วัน
    days31_60: 0, // 31-60 วัน
    days61_90: 0, // 61-90 วัน
    over90: 20000, // เกิน 90 วัน
    items: [
      { id: "1", shop: "Daiso", branch: "สาขา A", amount: 20000, days: 30, status: "overdue" },
    ],
  },
  payables: {
    total: 0,
    current: 0,
    days31_60: 0,
    days61_90: 0,
    over90: 0,
    items: [],
  },
};

export default function RentalAgingReport() {
  const [selectedType, setSelectedType] = useState<"receivables" | "payables">("receivables");

  const data = selectedType === "receivables" ? mockAgingData.receivables : mockAgingData.payables;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h2 className="text-3xl font-bold text-app mb-2 font-display">รายงานอายุหนี้ค่าเช่า</h2>
        <p className="text-muted font-light">
          Aging Report (0-30, 31-60, 61+ วัน) เพื่อบริหารสภาพคล่อง
        </p>
      </motion.div>

      {/* Type Selection */}
      <div className="flex gap-4">
        <button
          onClick={() => setSelectedType("receivables")}
          className={`flex-1 px-6 py-4 rounded-xl border-2 transition-all ${
            selectedType === "receivables"
              ? "bg-ptt-blue/10 border-ptt-blue/30 text-ptt-cyan"
              : "bg-soft border-app text-muted hover:text-app"
          }`}
        >
          <div className="flex items-center justify-center gap-3">
            <TrendingUp className="w-5 h-5" />
            <span className="font-semibold">ลูกหนี้ค่าเช่า (Receivables)</span>
          </div>
        </button>
        <button
          onClick={() => setSelectedType("payables")}
          className={`flex-1 px-6 py-4 rounded-xl border-2 transition-all ${
            selectedType === "payables"
              ? "bg-ptt-blue/10 border-ptt-blue/30 text-ptt-cyan"
              : "bg-soft border-app text-muted hover:text-app"
          }`}
        >
          <div className="flex items-center justify-center gap-3">
            <TrendingUp className="w-5 h-5" />
            <span className="font-semibold">เจ้าหนี้ค่าเช่า (Payables)</span>
          </div>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="panel rounded-2xl p-6 shadow-app border-2 border-emerald-500/30"
        >
          <div className="flex items-center justify-between mb-4">
            <Clock className="w-6 h-6 text-emerald-400" />
            <span className="text-xs text-muted">0-30 วัน</span>
          </div>
          <p className="text-2xl font-bold text-emerald-400">
            {currencyFormatter.format(data.current)}
          </p>
          <p className="text-xs text-muted mt-1">
            {data.total > 0 ? ((data.current / data.total) * 100).toFixed(1) : 0}% ของทั้งหมด
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="panel rounded-2xl p-6 shadow-app border-2 border-yellow-500/30"
        >
          <div className="flex items-center justify-between mb-4">
            <Clock className="w-6 h-6 text-yellow-400" />
            <span className="text-xs text-muted">31-60 วัน</span>
          </div>
          <p className="text-2xl font-bold text-yellow-400">
            {currencyFormatter.format(data.days31_60)}
          </p>
          <p className="text-xs text-muted mt-1">
            {data.total > 0 ? ((data.days31_60 / data.total) * 100).toFixed(1) : 0}% ของทั้งหมด
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="panel rounded-2xl p-6 shadow-app border-2 border-orange-500/30"
        >
          <div className="flex items-center justify-between mb-4">
            <Clock className="w-6 h-6 text-orange-400" />
            <span className="text-xs text-muted">61-90 วัน</span>
          </div>
          <p className="text-2xl font-bold text-orange-400">
            {currencyFormatter.format(data.days61_90)}
          </p>
          <p className="text-xs text-muted mt-1">
            {data.total > 0 ? ((data.days61_90 / data.total) * 100).toFixed(1) : 0}% ของทั้งหมด
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="panel rounded-2xl p-6 shadow-app border-2 border-red-500/30"
        >
          <div className="flex items-center justify-between mb-4">
            <AlertTriangle className="w-6 h-6 text-red-400" />
            <span className="text-xs text-muted">เกิน 90 วัน</span>
          </div>
          <p className="text-2xl font-bold text-red-400">
            {currencyFormatter.format(data.over90)}
          </p>
          <p className="text-xs text-muted mt-1">
            {data.total > 0 ? ((data.over90 / data.total) * 100).toFixed(1) : 0}% ของทั้งหมด
          </p>
        </motion.div>
      </div>

      {/* Total Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="panel rounded-2xl p-6 shadow-app"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-app">
              {selectedType === "receivables" ? "ลูกหนี้ค่าเช่า" : "เจ้าหนี้ค่าเช่า"} รวม
            </h3>
            <p className="text-sm text-muted">ยอดรวมทั้งหมด</p>
          </div>
          <Building2 className="w-6 h-6 text-muted" />
        </div>
        <div className="bg-ptt-blue/10 border border-ptt-blue/30 rounded-xl p-6">
          <p className="text-3xl font-bold text-ptt-cyan">
            {currencyFormatter.format(data.total)}
          </p>
          <div className="grid grid-cols-4 gap-4 mt-4">
            <div>
              <p className="text-xs text-muted mb-1">0-30 วัน</p>
              <p className="text-sm font-semibold text-emerald-400">
                {currencyFormatter.format(data.current)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted mb-1">31-60 วัน</p>
              <p className="text-sm font-semibold text-yellow-400">
                {currencyFormatter.format(data.days31_60)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted mb-1">61-90 วัน</p>
              <p className="text-sm font-semibold text-orange-400">
                {currencyFormatter.format(data.days61_90)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted mb-1">เกิน 90 วัน</p>
              <p className="text-sm font-semibold text-red-400">
                {currencyFormatter.format(data.over90)}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Detailed List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="panel rounded-2xl p-6 shadow-app"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-app">รายละเอียดตามอายุหนี้</h3>
            <p className="text-sm text-muted">
              {selectedType === "receivables" ? "ลูกหนี้ค่าเช่า" : "เจ้าหนี้ค่าเช่า"} ที่ต้องติดตาม
            </p>
          </div>
          <Clock className="w-6 h-6 text-muted" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-app">
                <th className="text-left py-3 px-4 text-sm font-semibold text-muted">ร้าน/ผู้เช่า</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-muted">สาขา</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-muted">ยอดหนี้</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-muted">อายุหนี้ (วัน)</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-muted">สถานะ</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item) => (
                <tr
                  key={item.id}
                  className={`border-b border-app/50 hover:bg-soft/50 transition-colors ${
                    item.status === "overdue" ? "bg-red-500/5" :
                    item.status === "warning" ? "bg-orange-500/5" : ""
                  }`}
                >
                  <td className="py-3 px-4">
                    <p className="font-medium text-app">{item.shop}</p>
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-sm text-app">{item.branch}</p>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="font-semibold text-app">
                      {currencyFormatter.format(item.amount)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className={`font-semibold ${
                      item.days <= 30 ? "text-emerald-400" :
                      item.days <= 60 ? "text-yellow-400" :
                      item.days <= 90 ? "text-orange-400" :
                      "text-red-400"
                    }`}>
                      {item.days} วัน
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      item.status === "current"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                        : item.status === "warning"
                        ? "bg-orange-500/10 text-orange-400 border border-orange-500/30"
                        : "bg-red-500/10 text-red-400 border border-red-500/30"
                    }`}>
                      {item.status === "current" ? "ปกติ" : item.status === "warning" ? "เตือน" : "เกินกำหนด"}
                    </span>
                  </td>
                </tr>
              ))}
              {data.items.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-muted">
                    ไม่มีข้อมูล
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}

