import { motion } from "framer-motion";
import { AlertTriangle, Shield, Package, Clock } from "lucide-react";

const currencyFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 0,
});

// Mock data - Risk Dashboard
const mockRiskData = {
  alerts: [
    {
      id: "1",
      type: "warning",
      severity: "medium",
      title: "สต็อกขาดเกิน 5%",
      description: "Premium Gasohol 95 มีส่วนต่าง -5.0% (เกินเกณฑ์)",
      module: "Inventory",
      date: "2024-12-15",
    },
    {
      id: "2",
      type: "warning",
      severity: "high",
      title: "ลูกหนี้เกิน 90 วัน",
      description: "ร้าน GHI ค้างชำระ 100,000 บาท เป็นเวลา 120 วัน",
      module: "Aging",
      date: "2024-12-14",
    },
    {
      id: "3",
      type: "info",
      severity: "low",
      title: "ใกล้ปิดงบดุล",
      description: "เหลืออีก 5 วันก่อนสิ้นเดือน ควรเตรียมปิดงบดุล",
      module: "Closing",
      date: "2024-12-15",
    },
  ],
  risks: {
    inventoryVariance: {
      total: 3,
      critical: 1,
      warning: 2,
      items: [
        { name: "Premium Gasohol 95", variance: -5.0, status: "critical" },
        { name: "Gasohol 95", variance: -1.67, status: "warning" },
        { name: "Diesel", variance: 0.33, status: "ok" },
      ],
    },
    overdueReceivables: {
      total: 100000,
      count: 1,
      items: [
        { name: "ร้าน GHI", amount: 100000, days: 120 },
      ],
    },
    bankReconciliation: {
      difference: 10000,
      matchRate: 99.8,
      status: "ok",
    },
  },
  summary: {
    totalRisks: 3,
    critical: 1,
    warning: 2,
    resolved: 0,
  },
};

export default function RiskDashboard() {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h2 className="text-3xl font-bold text-app mb-2 font-display">แดชบอร์ดความเสี่ยง</h2>
        <p className="text-muted font-light">
          แสดงแจ้งเตือนความผิดปกติ (เช่น สต็อกขาดเกิน 5%, ลูกหนี้เก่า)
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
            <Shield className="w-6 h-6 text-ptt-cyan" />
            <span className="text-xs text-muted">ความเสี่ยงทั้งหมด</span>
          </div>
          <p className="text-2xl font-bold text-app">
            {mockRiskData.summary.totalRisks}
          </p>
          <p className="text-xs text-muted mt-1">รายการ</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="panel rounded-2xl p-6 shadow-app border-2 border-red-500/30"
        >
          <div className="flex items-center justify-between mb-4">
            <AlertTriangle className="w-6 h-6 text-red-400" />
            <span className="text-xs text-muted">วิกฤต</span>
          </div>
          <p className="text-2xl font-bold text-red-400">
            {mockRiskData.summary.critical}
          </p>
          <p className="text-xs text-muted mt-1">ต้องแก้ไขทันที</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="panel rounded-2xl p-6 shadow-app border-2 border-orange-500/30"
        >
          <div className="flex items-center justify-between mb-4">
            <AlertTriangle className="w-6 h-6 text-orange-400" />
            <span className="text-xs text-muted">เตือน</span>
          </div>
          <p className="text-2xl font-bold text-orange-400">
            {mockRiskData.summary.warning}
          </p>
          <p className="text-xs text-muted mt-1">ควรตรวจสอบ</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="panel rounded-2xl p-6 shadow-app border-2 border-emerald-500/30"
        >
          <div className="flex items-center justify-between mb-4">
            <Shield className="w-6 h-6 text-emerald-400" />
            <span className="text-xs text-muted">แก้ไขแล้ว</span>
          </div>
          <p className="text-2xl font-bold text-emerald-400">
            {mockRiskData.summary.resolved}
          </p>
          <p className="text-xs text-muted mt-1">รายการ</p>
        </motion.div>
      </div>

      {/* Alerts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="panel rounded-2xl p-6 shadow-app"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-app">แจ้งเตือนความเสี่ยง</h3>
            <p className="text-sm text-muted">
              {mockRiskData.alerts.length} รายการ
            </p>
          </div>
          <AlertTriangle className="w-6 h-6 text-muted" />
        </div>
        <div className="space-y-3">
          {mockRiskData.alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 rounded-xl border-2 ${
                alert.severity === "high"
                  ? "bg-red-500/10 border-red-500/30"
                  : alert.severity === "medium"
                  ? "bg-orange-500/10 border-orange-500/30"
                  : "bg-blue-500/10 border-blue-500/30"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <AlertTriangle className={`w-5 h-5 ${
                      alert.severity === "high"
                        ? "text-red-400"
                        : alert.severity === "medium"
                        ? "text-orange-400"
                        : "text-blue-400"
                    }`} />
                    <h4 className="font-semibold text-app">{alert.title}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      alert.severity === "high"
                        ? "bg-red-500/20 text-red-400 border border-red-500/30"
                        : alert.severity === "medium"
                        ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                        : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                    }`}>
                      {alert.severity === "high" ? "วิกฤต" : alert.severity === "medium" ? "เตือน" : "ข้อมูล"}
                    </span>
                  </div>
                  <p className="text-sm text-muted mb-2">{alert.description}</p>
                  <div className="flex items-center gap-4 text-xs text-muted">
                    <span>โมดูล: {alert.module}</span>
                    <span>
                      {new Date(alert.date).toLocaleDateString("th-TH")}
                    </span>
                  </div>
                </div>
                <button className="px-4 py-2 bg-ptt-blue/10 hover:bg-ptt-blue/20 border border-ptt-blue/30 rounded-xl text-ptt-cyan text-sm transition-colors">
                  ตรวจสอบ
                </button>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Risk Details */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Inventory Variance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="panel rounded-2xl p-6 shadow-app"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-semibold text-app">ความเสี่ยงสต็อก</h3>
              <p className="text-sm text-muted">
                ส่วนต่างเกิน 5%: {mockRiskData.risks.inventoryVariance.critical} รายการ
              </p>
            </div>
            <Package className="w-6 h-6 text-muted" />
          </div>
          <div className="space-y-3">
            {mockRiskData.risks.inventoryVariance.items.map((item) => (
              <div
                key={item.name}
                className={`p-4 rounded-xl border ${
                  item.status === "critical"
                    ? "bg-red-500/10 border-red-500/30"
                    : item.status === "warning"
                    ? "bg-orange-500/10 border-orange-500/30"
                    : "bg-emerald-500/10 border-emerald-500/30"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-app">{item.name}</p>
                    <p className="text-xs text-muted">ส่วนต่าง: {item.variance > 0 ? "+" : ""}{item.variance.toFixed(2)}%</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    item.status === "critical"
                      ? "bg-red-500/20 text-red-400 border border-red-500/30"
                      : item.status === "warning"
                      ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                      : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  }`}>
                    {item.status === "critical" ? "วิกฤต" : item.status === "warning" ? "เตือน" : "ปกติ"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Overdue Receivables */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="panel rounded-2xl p-6 shadow-app"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-semibold text-app">ลูกหนี้เกินกำหนด</h3>
              <p className="text-sm text-muted">
                เกิน 90 วัน: {mockRiskData.risks.overdueReceivables.count} รายการ
              </p>
            </div>
            <Clock className="w-6 h-6 text-muted" />
          </div>
          <div className="space-y-3">
            {mockRiskData.risks.overdueReceivables.items.map((item) => (
              <div
                key={item.name}
                className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-app">{item.name}</p>
                    <p className="text-xs text-muted">ค้างชำระ: {item.days} วัน</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-red-400">
                      {currencyFormatter.format(item.amount)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {mockRiskData.risks.overdueReceivables.items.length === 0 && (
              <div className="text-center py-8 text-muted">
                ไม่มีลูกหนี้เกินกำหนด
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

