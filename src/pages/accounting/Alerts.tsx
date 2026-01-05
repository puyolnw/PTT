import { motion } from "framer-motion";
import { Bell, Mail, MessageSquare, Settings, Plus, Edit, Trash2, CheckCircle } from "lucide-react";
import { useState } from "react";

// Mock data - Alerts
const mockAlerts = [
  {
    id: "ALERT-001",
    name: "แจ้งเตือนปิดงบดุล",
    type: "closing",
    channel: ["email", "sms"],
    trigger: "days_before_month_end",
    triggerValue: 3,
    message: "เหลืออีก 3 วันก่อนสิ้นเดือน กรุณาเตรียมปิดงบดุล",
    enabled: true,
    lastSent: "2024-11-28",
  },
  {
    id: "ALERT-002",
    name: "แจ้งเตือนยอดคลาดเคลื่อน",
    type: "variance",
    channel: ["email"],
    trigger: "inventory_variance",
    triggerValue: 5,
    message: "สต็อกมีส่วนต่างเกิน 5% กรุณาตรวจสอบ",
    enabled: true,
    lastSent: "2024-12-15",
  },
  {
    id: "ALERT-003",
    name: "แจ้งเตือนลูกหนี้เก่า",
    type: "aging",
    channel: ["email", "sms"],
    trigger: "receivables_overdue",
    triggerValue: 90,
    message: "มีลูกหนี้ค้างชำระเกิน 90 วัน กรุณาติดตาม",
    enabled: true,
    lastSent: "2024-12-14",
  },
  {
    id: "ALERT-004",
    name: "แจ้งเตือนกระทบยอดธนาคาร",
    type: "reconciliation",
    channel: ["email"],
    trigger: "bank_reconciliation_due",
    triggerValue: 5,
    message: "ถึงกำหนดกระทบยอดธนาคารแล้ว",
    enabled: false,
    lastSent: null,
  },
];

export default function Alerts() {
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const filteredAlerts = selectedType
    ? mockAlerts.filter(alert => alert.type === selectedType)
    : mockAlerts;

  const types = Array.from(new Set(mockAlerts.map(a => a.type)));

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h2 className="text-3xl font-bold text-app mb-2 font-display">การแจ้งเตือนอัตโนมัติ</h2>
        <p className="text-muted font-light">
          ส่งอีเมล/SMS สำหรับเหตุการณ์สำคัญ (เช่น ใกล้ปิดงบ, ยอดคลาดเคลื่อน)
        </p>
      </motion.div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="panel rounded-2xl p-6 shadow-app"
        >
          <div className="flex items-center justify-between mb-4">
            <Bell className="w-6 h-6 text-ptt-cyan" />
            <span className="text-xs text-muted">ทั้งหมด</span>
          </div>
          <p className="text-2xl font-bold text-app">
            {mockAlerts.length}
          </p>
          <p className="text-xs text-muted mt-1">รายการ</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="panel rounded-2xl p-6 shadow-app border-2 border-emerald-500/30"
        >
          <div className="flex items-center justify-between mb-4">
            <CheckCircle className="w-6 h-6 text-emerald-400" />
            <span className="text-xs text-muted">เปิดใช้งาน</span>
          </div>
          <p className="text-2xl font-bold text-emerald-400">
            {mockAlerts.filter(a => a.enabled).length}
          </p>
          <p className="text-xs text-muted mt-1">รายการ</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="panel rounded-2xl p-6 shadow-app"
        >
          <div className="flex items-center justify-between mb-4">
            <Mail className="w-6 h-6 text-blue-400" />
            <span className="text-xs text-muted">อีเมล</span>
          </div>
          <p className="text-2xl font-bold text-blue-400">
            {mockAlerts.filter(a => a.channel.includes("email")).length}
          </p>
          <p className="text-xs text-muted mt-1">รายการ</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="panel rounded-2xl p-6 shadow-app"
        >
          <div className="flex items-center justify-between mb-4">
            <MessageSquare className="w-6 h-6 text-purple-400" />
            <span className="text-xs text-muted">SMS</span>
          </div>
          <p className="text-2xl font-bold text-purple-400">
            {mockAlerts.filter(a => a.channel.includes("sms")).length}
          </p>
          <p className="text-xs text-muted mt-1">รายการ</p>
        </motion.div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center">
        <label htmlFor="alert-type-filter" className="sr-only">กรองตามประเภทการแจ้งเตือน</label>
        <select
          id="alert-type-filter"
          value={selectedType || ""}
          onChange={(e) => setSelectedType(e.target.value || null)}
          className="px-4 py-2 bg-soft border border-app rounded-xl text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue/30"
        >
          <option value="">ทุกประเภท</option>
          {types.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
        <button className="flex items-center gap-2 px-4 py-2 bg-ptt-blue/10 hover:bg-ptt-blue/20 border border-ptt-blue/30 rounded-xl text-ptt-cyan transition-colors">
          <Plus className="w-5 h-5" />
          <span>เพิ่มการแจ้งเตือน</span>
        </button>
      </div>

      {/* Alerts List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="panel rounded-2xl p-6 shadow-app"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-app">รายการการแจ้งเตือน</h3>
            <p className="text-sm text-muted">
              {filteredAlerts.length} รายการ
            </p>
          </div>
          <Bell className="w-6 h-6 text-muted" />
        </div>
        <div className="space-y-3">
          {filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 rounded-xl border-2 ${alert.enabled
                  ? "bg-soft border-app"
                  : "bg-soft/50 border-app/50"
                }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-semibold text-app">{alert.name}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs ${alert.enabled
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                        : "bg-gray-500/10 text-gray-400 border border-gray-500/30"
                      }`}>
                      {alert.enabled ? "เปิดใช้งาน" : "ปิดใช้งาน"}
                    </span>
                    <span className="px-2 py-1 rounded-full bg-ptt-blue/10 text-ptt-cyan text-xs">
                      {alert.type}
                    </span>
                  </div>
                  <p className="text-sm text-muted mb-3">{alert.message}</p>
                  <div className="flex items-center gap-4 text-xs text-muted">
                    <div className="flex items-center gap-1">
                      <span>ช่องทาง:</span>
                      {alert.channel.includes("email") && (
                        <Mail className="w-3 h-3 text-blue-400" />
                      )}
                      {alert.channel.includes("sms") && (
                        <MessageSquare className="w-3 h-3 text-purple-400" />
                      )}
                    </div>
                    <span>เงื่อนไข: {alert.trigger}</span>
                    {alert.lastSent && (
                      <span>
                        ส่งล่าสุด: {new Date(alert.lastSent).toLocaleDateString("th-TH")}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button className="p-2 hover:bg-soft rounded-lg transition-colors" title="แก้ไข">
                    <Edit className="w-4 h-4 text-muted" />
                  </button>
                  <button className="p-2 hover:bg-red-500/10 rounded-lg transition-colors" title="ลบ">
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Alert Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="panel rounded-2xl p-6 shadow-app"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-app">ตั้งค่าการแจ้งเตือน</h3>
            <p className="text-sm text-muted">กำหนดช่องทางและเงื่อนไขการแจ้งเตือน</p>
          </div>
          <Settings className="w-6 h-6 text-muted" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 bg-soft rounded-xl border border-app">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-400" />
                <span className="font-medium text-app">อีเมล</span>
              </div>
              <label htmlFor="email-alert-toggle" className="relative inline-flex items-center cursor-pointer">
                <input id="email-alert-toggle" type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-ptt-blue/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-app after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-app after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-ptt-blue"></div>
                <span className="sr-only">เปิดการแจ้งเตือนทางอีเมล</span>
              </label>
            </div>
            <p className="text-xs text-muted">ส่งการแจ้งเตือนผ่านอีเมล</p>
          </div>
          <div className="p-4 bg-soft rounded-xl border border-app">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-purple-400" />
                <span className="font-medium text-app">SMS</span>
              </div>
              <label htmlFor="sms-alert-toggle" className="relative inline-flex items-center cursor-pointer">
                <input id="sms-alert-toggle" type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-ptt-blue/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-app after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-app after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-ptt-blue"></div>
                <span className="sr-only">เปิดการแจ้งเตือนทาง SMS</span>
              </label>
            </div>
            <p className="text-xs text-muted">ส่งการแจ้งเตือนผ่าน SMS</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

