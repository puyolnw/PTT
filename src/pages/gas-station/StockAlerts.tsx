import { motion } from "framer-motion";
import { Bell, AlertTriangle, Settings, Fuel } from "lucide-react";
import { useState } from "react";

const numberFormatter = new Intl.NumberFormat("th-TH");

// Mock data - Stock Alerts
const mockStockAlerts = {
  settings: {
    lowStockThreshold: 10000, // ลิตร
    criticalStockThreshold: 5000, // ลิตร
    alertChannels: ["email", "line", "sms"],
    alertFrequency: "realtime",
  },
  alerts: [
    {
      id: "1",
      branch: "สำนักงานใหญ่",
      fuelType: "Premium Gasohol 95",
      tank: "TK-003",
      currentStock: 15000,
      threshold: 10000,
      status: "warning",
      alertTime: "2024-12-15T08:30:00",
    },
    {
      id: "2",
      branch: "สาขา A",
      fuelType: "E20",
      tank: "TK-004",
      currentStock: 8000,
      threshold: 10000,
      status: "critical",
      alertTime: "2024-12-15T09:15:00",
    },
    {
      id: "3",
      branch: "สาขา B",
      fuelType: "Gasohol 91",
      tank: "TK-005",
      currentStock: 12000,
      threshold: 10000,
      status: "ok",
      alertTime: null,
    },
  ],
};

export default function StockAlerts() {
  const [settings, setSettings] = useState(mockStockAlerts.settings);

  const activeAlerts = mockStockAlerts.alerts.filter(a => a.status !== "ok");

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h2 className="text-3xl font-bold text-app mb-2 font-display">แจ้งเตือนสต็อกต่ำ</h2>
        <p className="text-muted font-light">
          ตั้งระดับต่ำสุด → แจ้งเตือนผ่านแอป/ไลน์/อีเมล เมื่อสต็อก &lt; ระดับต่ำสุด
        </p>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="panel rounded-2xl p-6 shadow-app border-2 border-orange-500/30"
        >
          <div className="flex items-center justify-between mb-4">
            <AlertTriangle className="w-6 h-6 text-orange-400" />
            <span className="text-xs text-muted">เตือน (Warning)</span>
          </div>
          <p className="text-2xl font-bold text-orange-400">
            {activeAlerts.filter(a => a.status === "warning").length}
          </p>
          <p className="text-xs text-muted mt-1">ถัง</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="panel rounded-2xl p-6 shadow-app border-2 border-red-500/30"
        >
          <div className="flex items-center justify-between mb-4">
            <AlertTriangle className="w-6 h-6 text-red-400" />
            <span className="text-xs text-muted">วิกฤต (Critical)</span>
          </div>
          <p className="text-2xl font-bold text-red-400">
            {activeAlerts.filter(a => a.status === "critical").length}
          </p>
          <p className="text-xs text-muted mt-1">ถัง</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="panel rounded-2xl p-6 shadow-app"
        >
          <div className="flex items-center justify-between mb-4">
            <Bell className="w-6 h-6 text-ptt-cyan" />
            <span className="text-xs text-muted">ช่องทางแจ้งเตือน</span>
          </div>
          <p className="text-2xl font-bold text-app">
            {settings.alertChannels.length}
          </p>
          <p className="text-xs text-muted mt-1">ช่องทาง</p>
        </motion.div>
      </div>

      {/* Active Alerts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="panel rounded-2xl p-6 shadow-app"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-app">แจ้งเตือนที่ยังไม่แก้ไข</h3>
            <p className="text-sm text-muted">
              {activeAlerts.length} รายการ
            </p>
          </div>
          <Bell className="w-6 h-6 text-muted" />
        </div>
        <div className="space-y-3">
          {activeAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 rounded-xl border-2 ${
                alert.status === "critical"
                  ? "bg-red-500/10 border-red-500/30"
                  : "bg-orange-500/10 border-orange-500/30"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Fuel className="w-5 h-5 text-ptt-cyan" />
                    <h4 className="font-semibold text-app">{alert.fuelType}</h4>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      alert.status === "critical"
                        ? "bg-red-500/20 text-red-400 border border-red-500/30"
                        : "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                    }`}>
                      {alert.status === "critical" ? "วิกฤต" : "เตือน"}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                    <div>
                      <span className="text-muted">สาขา: </span>
                      <span className="text-app">{alert.branch}</span>
                    </div>
                    <div>
                      <span className="text-muted">ถัง: </span>
                      <span className="text-app">{alert.tank}</span>
                    </div>
                    <div>
                      <span className="text-muted">สต็อกปัจจุบัน: </span>
                      <span className={`font-bold ${
                        alert.status === "critical" ? "text-red-400" : "text-orange-400"
                      }`}>
                        {numberFormatter.format(alert.currentStock)} ลิตร
                      </span>
                    </div>
                  </div>
                  <div className="mt-2">
                    <p className="text-xs text-muted">
                      ระดับต่ำสุด: {numberFormatter.format(alert.threshold)} ลิตร
                      {alert.currentStock < alert.threshold && (
                        <span className="text-red-400 ml-2">
                          (ต่ำกว่า {numberFormatter.format(alert.threshold - alert.currentStock)} ลิตร)
                        </span>
                      )}
                    </p>
                    {alert.alertTime && (
                      <p className="text-xs text-muted mt-1">
                        แจ้งเตือนเมื่อ: {new Date(alert.alertTime).toLocaleString("th-TH")}
                      </p>
                    )}
                  </div>
                </div>
                <button className="ml-4 px-4 py-2 bg-ptt-blue/10 hover:bg-ptt-blue/20 border border-ptt-blue/30 rounded-xl text-ptt-cyan text-sm transition-colors">
                  ตรวจสอบ
                </button>
              </div>
            </div>
          ))}
          {activeAlerts.length === 0 && (
            <div className="text-center py-8 text-muted">
              ไม่มีแจ้งเตือนสต็อกต่ำ
            </div>
          )}
        </div>
      </motion.div>

      {/* Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="panel rounded-2xl p-6 shadow-app"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-app">ตั้งค่าแจ้งเตือน</h3>
            <p className="text-sm text-muted">กำหนดระดับต่ำสุดและช่องทางแจ้งเตือน</p>
          </div>
          <Settings className="w-6 h-6 text-muted" />
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted mb-2">
              ระดับต่ำสุด (Warning) - ลิตร
            </label>
            <input
              type="number"
              value={settings.lowStockThreshold}
              onChange={(e) => setSettings({ ...settings, lowStockThreshold: Number(e.target.value) })}
              className="w-full px-4 py-2 bg-soft border border-app rounded-xl text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue/30"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted mb-2">
              ระดับวิกฤต (Critical) - ลิตร
            </label>
            <input
              type="number"
              value={settings.criticalStockThreshold}
              onChange={(e) => setSettings({ ...settings, criticalStockThreshold: Number(e.target.value) })}
              className="w-full px-4 py-2 bg-soft border border-app rounded-xl text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue/30"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted mb-2">
              ช่องทางแจ้งเตือน
            </label>
            <div className="flex gap-4">
              {["email", "line", "sms"].map((channel) => (
                <label key={channel} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.alertChannels.includes(channel)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSettings({ ...settings, alertChannels: [...settings.alertChannels, channel] });
                      } else {
                        setSettings({ ...settings, alertChannels: settings.alertChannels.filter(c => c !== channel) });
                      }
                    }}
                    className="w-4 h-4 rounded border-app text-ptt-blue focus:ring-ptt-blue/30"
                  />
                  <span className="text-sm text-app capitalize">{channel}</span>
                </label>
              ))}
            </div>
          </div>
          <button className="w-full px-4 py-2 bg-ptt-blue/10 hover:bg-ptt-blue/20 border border-ptt-blue/30 rounded-xl text-ptt-cyan transition-colors">
            บันทึกการตั้งค่า
          </button>
        </div>
      </motion.div>
    </div>
  );
}

