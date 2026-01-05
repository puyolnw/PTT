import { motion } from "framer-motion";
import { Bell, AlertTriangle, Calendar, FileText, Clock } from "lucide-react";
import { useState } from "react";

const currencyFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 0,
});

// Interfaces
interface ContractAlert {
  id: string;
  shop: string;
  branch: string;
  contractType: string;
  endDate: string;
  daysRemaining: number;
  status: "warning" | "info" | "urgent";
  rentAmount: number;
}

interface PaymentAlert {
  id: string;
  shop: string;
  branch: string;
  contractType: string;
  dueDate: string;
  daysRemaining: number;
  amount: number;
  status: "warning" | "info" | "urgent";
}

interface LeaseAlertsData {
  expiringContracts: ContractAlert[];
  paymentDue: PaymentAlert[];
}

// Mock data - Lease Alerts
const mockLeaseAlerts: LeaseAlertsData = {
  expiringContracts: [
    {
      id: "C-001",
      shop: "FIT Auto",
      branch: "สำนักงานใหญ่",
      contractType: "ให้เช่า",
      endDate: "2024-12-31",
      daysRemaining: 16,
      status: "warning",
      rentAmount: 7000,
    },
    {
      id: "C-002",
      shop: "Chester's",
      branch: "สาขา A",
      contractType: "ให้เช่า",
      endDate: "2025-01-15",
      daysRemaining: 31,
      status: "info",
      rentAmount: 25000,
    },
    {
      id: "C-003",
      shop: "ที่ดินเช่า",
      branch: "สาขา B",
      contractType: "เป็นผู้เช่า",
      endDate: "2025-01-20",
      daysRemaining: 36,
      status: "info",
      rentAmount: 20000,
    },
  ],
  paymentDue: [
    {
      id: "P-001",
      shop: "Daiso",
      branch: "สาขา A",
      contractType: "ให้เช่า",
      dueDate: "2024-12-20",
      daysRemaining: 5,
      amount: 4000,
      status: "urgent",
    },
    {
      id: "P-002",
      shop: "Quick",
      branch: "สาขา B",
      contractType: "ให้เช่า",
      dueDate: "2024-12-25",
      daysRemaining: 10,
      amount: 6000,
      status: "warning",
    },
    {
      id: "P-003",
      shop: "ที่ดินเช่า",
      branch: "สาขา C",
      contractType: "เป็นผู้เช่า",
      dueDate: "2025-01-05",
      daysRemaining: 21,
      amount: 20000,
      status: "info",
    },
  ],
};

export default function LeaseAlerts() {
  const [selectedType, setSelectedType] = useState<"contracts" | "payments">("contracts");

  const urgentAlerts = mockLeaseAlerts.expiringContracts.filter(a => a.status === "warning").length +
    mockLeaseAlerts.paymentDue.filter(a => a.status === "urgent").length;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h2 className="text-3xl font-bold text-app mb-2 font-display">แจ้งเตือนสัญญาเช่า</h2>
        <p className="text-muted font-light">
          แจ้งเตือนสัญญาเช่าใกล้หมดและครบกำหนดชำระล่วงหน้า 60/30/7 วัน
        </p>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="panel rounded-2xl p-6 shadow-app border-2 border-red-500/30"
        >
          <div className="flex items-center justify-between mb-4">
            <AlertTriangle className="w-6 h-6 text-red-400" />
            <span className="text-xs text-muted">ด่วน</span>
          </div>
          <p className="text-2xl font-bold text-red-400">
            {urgentAlerts}
          </p>
          <p className="text-xs text-muted mt-1">รายการ</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="panel rounded-2xl p-6 shadow-app"
        >
          <div className="flex items-center justify-between mb-4">
            <FileText className="w-6 h-6 text-ptt-cyan" />
            <span className="text-xs text-muted">สัญญาใกล้หมด</span>
          </div>
          <p className="text-2xl font-bold text-app">
            {mockLeaseAlerts.expiringContracts.length}
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
            <Clock className="w-6 h-6 text-orange-400" />
            <span className="text-xs text-muted">ครบกำหนดชำระ</span>
          </div>
          <p className="text-2xl font-bold text-orange-400">
            {mockLeaseAlerts.paymentDue.length}
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
            <Bell className="w-6 h-6 text-blue-400" />
            <span className="text-xs text-muted">รวมทั้งหมด</span>
          </div>
          <p className="text-2xl font-bold text-blue-400">
            {mockLeaseAlerts.expiringContracts.length + mockLeaseAlerts.paymentDue.length}
          </p>
          <p className="text-xs text-muted mt-1">รายการ</p>
        </motion.div>
      </div>

      {/* Type Selection */}
      <div className="flex gap-4">
        <button
          onClick={() => setSelectedType("contracts")}
          className={`flex-1 px-6 py-4 rounded-xl border-2 transition-all ${selectedType === "contracts"
            ? "bg-ptt-blue/10 border-ptt-blue/30 text-ptt-cyan"
            : "bg-soft border-app text-muted hover:text-app"
            }`}
        >
          <div className="flex items-center justify-center gap-3">
            <FileText className="w-5 h-5" />
            <span className="font-semibold">สัญญาใกล้หมด</span>
          </div>
        </button>
        <button
          onClick={() => setSelectedType("payments")}
          className={`flex-1 px-6 py-4 rounded-xl border-2 transition-all ${selectedType === "payments"
            ? "bg-ptt-blue/10 border-ptt-blue/30 text-ptt-cyan"
            : "bg-soft border-app text-muted hover:text-app"
            }`}
        >
          <div className="flex items-center justify-center gap-3">
            <Clock className="w-5 h-5" />
            <span className="font-semibold">ครบกำหนดชำระ</span>
          </div>
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
            <h3 className="text-xl font-semibold text-app">
              {selectedType === "contracts" ? "สัญญาเช่าใกล้หมด" : "ครบกำหนดชำระ"}
            </h3>
            <p className="text-sm text-muted">
              {selectedType === "contracts"
                ? mockLeaseAlerts.expiringContracts.length
                : mockLeaseAlerts.paymentDue.length} รายการ
            </p>
          </div>
          <Bell className="w-6 h-6 text-muted" />
        </div>
        <div className="space-y-3">
          {(selectedType === "contracts"
            ? mockLeaseAlerts.expiringContracts
            : mockLeaseAlerts.paymentDue
          ).map((alert) => (
            <div
              key={alert.id}
              className={`p-4 rounded-xl border-2 ${alert.status === "urgent"
                ? "bg-red-500/10 border-red-500/30"
                : alert.status === "warning"
                  ? "bg-orange-500/10 border-orange-500/30"
                  : "bg-blue-500/10 border-blue-500/30"
                }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-semibold text-app">{alert.shop}</h4>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${alert.status === "urgent"
                      ? "bg-red-500/20 text-red-400 border border-red-500/30"
                      : alert.status === "warning"
                        ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                        : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                      }`}>
                      {alert.status === "urgent" ? "ด่วน" : alert.status === "warning" ? "เตือน" : "แจ้งเตือน"}
                    </span>
                    <span className="px-2 py-1 rounded-full bg-ptt-blue/10 text-ptt-cyan text-xs">
                      {alert.contractType}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                    <div>
                      <span className="text-muted">สาขา: </span>
                      <span className="text-app">{alert.branch}</span>
                    </div>
                    <div>
                      <span className="text-muted">
                        {selectedType === "contracts" ? "วันหมดอายุ: " : "ครบกำหนด: "}
                      </span>
                      <span className="text-app">
                        {new Date("endDate" in alert ? alert.endDate : alert.dueDate).toLocaleDateString("th-TH")}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted">เหลือ: </span>
                      <span className={`font-bold ${alert.daysRemaining <= 7 ? "text-red-400" :
                        alert.daysRemaining <= 30 ? "text-orange-400" :
                          "text-blue-400"
                        }`}>
                        {alert.daysRemaining} วัน
                      </span>
                    </div>
                  </div>
                  {selectedType === "payments" && (
                    <div className="mt-2">
                      <span className="text-muted">ยอดที่ต้องชำระ: </span>
                      <span className="font-bold text-app">
                        {"amount" in alert && currencyFormatter.format(alert.amount)}
                      </span>
                    </div>
                  )}
                </div>
                <button className="ml-4 px-4 py-2 bg-ptt-blue/10 hover:bg-ptt-blue/20 border border-ptt-blue/30 rounded-xl text-ptt-cyan text-sm transition-colors">
                  {selectedType === "contracts" ? "ต่อสัญญา" : "ชำระเงิน"}
                </button>
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
            <h3 className="text-xl font-semibold text-app">ตั้งค่าแจ้งเตือน</h3>
            <p className="text-sm text-muted">กำหนดวันแจ้งเตือนล่วงหน้า</p>
          </div>
          <Calendar className="w-6 h-6 text-muted" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-soft rounded-xl border border-app">
            <span className="block text-sm font-medium text-muted mb-2">
              แจ้งเตือนสัญญาใกล้หมด (วัน)
            </span>
            <div className="flex gap-2">
              <input
                aria-label="Contract alert threshold 1 (days)"
                type="number"
                defaultValue={60}
                className="w-full px-3 py-2 bg-app border border-app rounded-lg text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue/30"
              />
              <input
                aria-label="Contract alert threshold 2 (days)"
                type="number"
                defaultValue={30}
                className="w-full px-3 py-2 bg-app border border-app rounded-lg text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue/30"
              />
              <input
                aria-label="Contract alert threshold 3 (days)"
                type="number"
                defaultValue={7}
                className="w-full px-3 py-2 bg-app border border-app rounded-lg text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue/30"
              />
            </div>
            <p className="text-xs text-muted mt-2">60 / 30 / 7 วัน</p>
          </div>
          <div className="p-4 bg-soft rounded-xl border border-app">
            <span className="block text-sm font-medium text-muted mb-2">
              แจ้งเตือนครบกำหนดชำระ (วัน)
            </span>
            <div className="flex gap-2">
              <input
                aria-label="Payment alert threshold 1 (days)"
                type="number"
                defaultValue={30}
                className="w-full px-3 py-2 bg-app border border-app rounded-lg text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue/30"
              />
              <input
                aria-label="Payment alert threshold 2 (days)"
                type="number"
                defaultValue={15}
                className="w-full px-3 py-2 bg-app border border-app rounded-lg text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue/30"
              />
              <input
                aria-label="Payment alert threshold 3 (days)"
                type="number"
                defaultValue={7}
                className="w-full px-3 py-2 bg-app border border-app rounded-lg text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue/30"
              />
            </div>
            <p className="text-xs text-muted mt-2">30 / 15 / 7 วัน</p>
          </div>
          <div className="p-4 bg-soft rounded-xl border border-app">
            <span className="block text-sm font-medium text-muted mb-2">
              ช่องทางแจ้งเตือน
            </span>
            <div className="space-y-2">
              <label htmlFor="alert-email" className="flex items-center gap-2 cursor-pointer">
                <input id="alert-email" type="checkbox" defaultChecked className="w-4 h-4 rounded border-app text-ptt-blue focus:ring-ptt-blue/30" />
                <span className="text-sm text-app">อีเมล</span>
              </label>
              <label htmlFor="alert-line" className="flex items-center gap-2 cursor-pointer">
                <input id="alert-line" type="checkbox" defaultChecked className="w-4 h-4 rounded border-app text-ptt-blue focus:ring-ptt-blue/30" />
                <span className="text-sm text-app">Line</span>
              </label>
              <label htmlFor="alert-sms" className="flex items-center gap-2 cursor-pointer">
                <input id="alert-sms" type="checkbox" className="w-4 h-4 rounded border-app text-ptt-blue focus:ring-ptt-blue/30" />
                <span className="text-sm text-app">SMS</span>
              </label>
            </div>
          </div>
        </div>
        <button className="w-full mt-4 px-4 py-2 bg-ptt-blue/10 hover:bg-ptt-blue/20 border border-ptt-blue/30 rounded-xl text-ptt-cyan transition-colors">
          บันทึกการตั้งค่า
        </button>
      </motion.div>
    </div>
  );
}

