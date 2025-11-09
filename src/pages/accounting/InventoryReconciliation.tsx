import { motion } from "framer-motion";
import { Package, AlertTriangle, TrendingUp, TrendingDown, RefreshCw } from "lucide-react";

const numberFormatter = new Intl.NumberFormat("th-TH");

// Mock data - Inventory Reconciliation
const mockInventoryData = {
  period: "ตุลาคม 2568",
  items: [
    {
      id: "1",
      name: "Gasohol 95",
      unit: "ลิตร",
      openingBalance: 50000,
      purchases: 100000,
      sales: 120000,
      systemBalance: 30000,
      physicalCount: 29500,
      variance: -500,
      variancePercent: -1.67,
      lossGain: -500,
      status: "warning",
    },
    {
      id: "2",
      name: "Diesel",
      unit: "ลิตร",
      openingBalance: 40000,
      purchases: 80000,
      sales: 90000,
      systemBalance: 30000,
      physicalCount: 30100,
      variance: 100,
      variancePercent: 0.33,
      lossGain: 100,
      status: "ok",
    },
    {
      id: "3",
      name: "Premium Gasohol 95",
      unit: "ลิตร",
      openingBalance: 20000,
      purchases: 50000,
      sales: 60000,
      systemBalance: 10000,
      physicalCount: 9500,
      variance: -500,
      variancePercent: -5.0,
      lossGain: -500,
      status: "error",
    },
  ],
  summary: {
    totalVariance: -900,
    totalLoss: 900,
    matchRate: 98.5,
  },
};

export default function InventoryReconciliation() {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h2 className="text-3xl font-bold text-app mb-2 font-display">กระทบยอดสต็อก</h2>
        <p className="text-muted font-light">
          กระทบยอดสต็อกน้ำมันและสินค้าจาก M1/M2 (Balance Petrel, Dip Reading) กับยอดขายจริง เพื่อคำนวณ Loss/Gain
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
            <Package className="w-6 h-6 text-ptt-cyan" />
            <span className="text-xs text-muted">รายการทั้งหมด</span>
          </div>
          <p className="text-2xl font-bold text-app">
            {mockInventoryData.items.length}
          </p>
          <p className="text-xs text-muted mt-1">รายการสินค้า</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`panel rounded-2xl p-6 shadow-app ${
            Math.abs(mockInventoryData.summary.totalVariance) < 1000
              ? "border-2 border-emerald-500/30"
              : "border-2 border-orange-500/30"
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <AlertTriangle className={`w-6 h-6 ${
              Math.abs(mockInventoryData.summary.totalVariance) < 1000
                ? "text-emerald-400"
                : "text-orange-400"
            }`} />
            <span className="text-xs text-muted">ส่วนต่างรวม</span>
          </div>
          <p className={`text-2xl font-bold ${
            mockInventoryData.summary.totalVariance < 0
              ? "text-red-400"
              : "text-emerald-400"
          }`}>
            {mockInventoryData.summary.totalVariance > 0 ? "+" : ""}
            {numberFormatter.format(mockInventoryData.summary.totalVariance)}
          </p>
          <p className="text-xs text-muted mt-1">หน่วย</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="panel rounded-2xl p-6 shadow-app"
        >
          <div className="flex items-center justify-between mb-4">
            <TrendingDown className="w-6 h-6 text-red-400" />
            <span className="text-xs text-muted">ขาดทุน (Loss)</span>
          </div>
          <p className="text-2xl font-bold text-red-400">
            {numberFormatter.format(mockInventoryData.summary.totalLoss)}
          </p>
          <p className="text-xs text-muted mt-1">หน่วย</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="panel rounded-2xl p-6 shadow-app"
        >
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="w-6 h-6 text-emerald-400" />
            <span className="text-xs text-muted">อัตราตรงกัน</span>
          </div>
          <p className="text-2xl font-bold text-emerald-400">
            {mockInventoryData.summary.matchRate}%
          </p>
          <p className="text-xs text-muted mt-1">ความแม่นยำ</p>
        </motion.div>
      </div>

      {/* Inventory Items */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="panel rounded-2xl p-6 shadow-app"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-app">รายการกระทบยอดสต็อก</h3>
            <p className="text-sm text-muted">เปรียบเทียบยอดระบบกับยอดนับจริง</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-soft hover:bg-soft/80 border border-app rounded-xl text-app transition-colors">
            <RefreshCw className="w-5 h-5" />
            <span>รีเฟรช</span>
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-app">
                <th className="text-left py-3 px-4 text-sm font-semibold text-muted">สินค้า</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-muted">ยอดเปิด</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-muted">ซื้อเข้า</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-muted">ขายออก</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-muted">ยอดระบบ</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-muted">ยอดนับจริง</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-muted">ส่วนต่าง</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-muted">สถานะ</th>
              </tr>
            </thead>
            <tbody>
              {mockInventoryData.items.map((item) => (
                <tr
                  key={item.id}
                  className={`border-b border-app/50 hover:bg-soft/50 transition-colors ${
                    item.status === "error" ? "bg-red-500/5" :
                    item.status === "warning" ? "bg-orange-500/5" : ""
                  }`}
                >
                  <td className="py-3 px-4">
                    <p className="font-medium text-app">{item.name}</p>
                    <p className="text-xs text-muted">{item.unit}</p>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="text-app">{numberFormatter.format(item.openingBalance)}</span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="text-emerald-400">+{numberFormatter.format(item.purchases)}</span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="text-red-400">-{numberFormatter.format(item.sales)}</span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="font-semibold text-app">{numberFormatter.format(item.systemBalance)}</span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="font-semibold text-blue-400">{numberFormatter.format(item.physicalCount)}</span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className={`font-bold ${
                      item.variance < 0 ? "text-red-400" : "text-emerald-400"
                    }`}>
                      {item.variance > 0 ? "+" : ""}
                      {numberFormatter.format(item.variance)}
                    </span>
                    <p className="text-xs text-muted">
                      ({item.variancePercent > 0 ? "+" : ""}{item.variancePercent.toFixed(2)}%)
                    </p>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      item.status === "ok"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                        : item.status === "warning"
                        ? "bg-orange-500/10 text-orange-400 border border-orange-500/30"
                        : "bg-red-500/10 text-red-400 border border-red-500/30"
                    }`}>
                      {item.status === "ok" ? "ปกติ" : item.status === "warning" ? "เตือน" : "ผิดปกติ"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Loss/Gain Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="panel rounded-2xl p-6 shadow-app"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-app">วิเคราะห์ Loss/Gain</h3>
            <p className="text-sm text-muted">สรุปผลการกระทบยอดสต็อก</p>
          </div>
          <AlertTriangle className="w-6 h-6 text-muted" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
            <p className="text-sm text-muted mb-2">ขาดทุน (Loss)</p>
            <p className="text-2xl font-bold text-red-400">
              {numberFormatter.format(mockInventoryData.summary.totalLoss)} หน่วย
            </p>
            <p className="text-xs text-muted mt-2">
              สาเหตุ: การรั่วไหล, การระเหย, ความคลาดเคลื่อนในการวัด
            </p>
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
            <p className="text-sm text-muted mb-2">อัตราตรงกัน</p>
            <p className="text-2xl font-bold text-emerald-400">
              {mockInventoryData.summary.matchRate}%
            </p>
            <p className="text-xs text-muted mt-2">
              {mockInventoryData.summary.matchRate >= 98 ? "อยู่ในเกณฑ์ดี" : "ต้องตรวจสอบ"}
            </p>
          </div>
        </div>
        <div className="mt-4 p-4 bg-orange-500/10 border border-orange-500/30 rounded-xl">
          <p className="text-sm text-orange-400/80">
            <strong>หมายเหตุ:</strong> หากส่วนต่างเกิน 5% ควรตรวจสอบสาเหตุและบันทึกเป็นรายการปรับปรุง (Adjusting Entry)
          </p>
        </div>
      </motion.div>
    </div>
  );
}

