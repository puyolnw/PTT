import { motion } from "framer-motion";
import { Camera, Monitor, AlertTriangle, CheckCircle, Eye } from "lucide-react";
import { useState } from "react";

const currencyFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 0,
});

// Mock data - POS & CCTV Integration
const mockPOSData = {
  transactions: [
    {
      id: "TXN-001",
      timestamp: "2024-12-15T10:30:00",
      branch: "สำนักงานใหญ่",
      posId: "POS-001",
      amount: 1200,
      fuelType: "Gasohol 95",
      litres: 30,
      paymentMethod: "QR",
      cctvAvailable: true,
      cctvTimestamp: "2024-12-15T10:30:15",
      status: "matched",
      variance: 0,
    },
    {
      id: "TXN-002",
      timestamp: "2024-12-15T10:25:00",
      branch: "สาขา A",
      posId: "POS-002",
      amount: 1750,
      fuelType: "Diesel",
      litres: 50,
      paymentMethod: "Cash",
      cctvAvailable: true,
      cctvTimestamp: "2024-12-15T10:25:10",
      status: "matched",
      variance: 0,
    },
    {
      id: "TXN-003",
      timestamp: "2024-12-15T10:20:00",
      branch: "สาขา B",
      posId: "POS-003",
      amount: 800,
      fuelType: "Gasohol 95",
      litres: 20,
      paymentMethod: "Card",
      cctvAvailable: false,
      cctvTimestamp: null,
      status: "no_cctv",
      variance: 0,
    },
    {
      id: "TXN-004",
      timestamp: "2024-12-15T10:15:00",
      branch: "สำนักงานใหญ่",
      posId: "POS-001",
      amount: 2000,
      fuelType: "Premium Gasohol 95",
      litres: 47,
      paymentMethod: "Cash",
      cctvAvailable: true,
      cctvTimestamp: "2024-12-15T10:15:05",
      status: "variance",
      variance: 50, // ต่าง 50 บาท
    },
  ],
  summary: {
    totalTransactions: 4,
    matched: 2,
    variance: 1,
    noCCTV: 1,
    totalAmount: 5750,
  },
};

export default function POSIntegration() {
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  const filteredTransactions = selectedStatus
    ? mockPOSData.transactions.filter(t => t.status === selectedStatus)
    : mockPOSData.transactions;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h2 className="text-3xl font-bold text-app mb-2 font-display">POS & CCTV Integration</h2>
        <p className="text-muted font-light">
          เชื่อม POS + กล้อง → ตรวจสอบยอดขาย vs ภาพจริง
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
            <Monitor className="w-6 h-6 text-ptt-cyan" />
            <span className="text-xs text-muted">รายการทั้งหมด</span>
          </div>
          <p className="text-2xl font-bold text-app">
            {mockPOSData.summary.totalTransactions}
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
            <span className="text-xs text-muted">ตรงกัน</span>
          </div>
          <p className="text-2xl font-bold text-emerald-400">
            {mockPOSData.summary.matched}
          </p>
          <p className="text-xs text-muted mt-1">รายการ</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="panel rounded-2xl p-6 shadow-app border-2 border-orange-500/30"
        >
          <div className="flex items-center justify-between mb-4">
            <AlertTriangle className="w-6 h-6 text-orange-400" />
            <span className="text-xs text-muted">คลาดเคลื่อน</span>
          </div>
          <p className="text-2xl font-bold text-orange-400">
            {mockPOSData.summary.variance}
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
            <Camera className="w-6 h-6 text-blue-400" />
            <span className="text-xs text-muted">ไม่มี CCTV</span>
          </div>
          <p className="text-2xl font-bold text-blue-400">
            {mockPOSData.summary.noCCTV}
          </p>
          <p className="text-xs text-muted mt-1">รายการ</p>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <select
          value={selectedStatus || ""}
          onChange={(e) => setSelectedStatus(e.target.value || null)}
          className="px-4 py-2 bg-soft border border-app rounded-xl text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue/30"
        >
          <option value="">ทุกสถานะ</option>
          <option value="matched">ตรงกัน</option>
          <option value="variance">คลาดเคลื่อน</option>
          <option value="no_cctv">ไม่มี CCTV</option>
        </select>
      </div>

      {/* Transactions List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="panel rounded-2xl p-6 shadow-app"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-app">รายการตรวจสอบ POS vs CCTV</h3>
            <p className="text-sm text-muted">
              {filteredTransactions.length} รายการ
            </p>
          </div>
          <Monitor className="w-6 h-6 text-muted" />
        </div>
        <div className="space-y-3">
          {filteredTransactions.map((txn) => (
            <div
              key={txn.id}
              className={`p-4 rounded-xl border-2 ${
                txn.status === "matched"
                  ? "bg-emerald-500/10 border-emerald-500/30"
                  : txn.status === "variance"
                  ? "bg-orange-500/10 border-orange-500/30"
                  : "bg-blue-500/10 border-blue-500/30"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-semibold text-app">{txn.id}</h4>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      txn.status === "matched"
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : txn.status === "variance"
                        ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                        : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                    }`}>
                      {txn.status === "matched" ? "ตรงกัน" : txn.status === "variance" ? "คลาดเคลื่อน" : "ไม่มี CCTV"}
                    </span>
                    {txn.cctvAvailable && (
                      <span className="px-2 py-1 rounded-full bg-ptt-blue/10 text-ptt-cyan text-xs border border-ptt-blue/30">
                        <Camera className="w-3 h-3 inline mr-1" />
                        CCTV
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 text-sm mb-2">
                    <div>
                      <span className="text-muted">สาขา: </span>
                      <span className="text-app">{txn.branch}</span>
                    </div>
                    <div>
                      <span className="text-muted">POS: </span>
                      <span className="text-app font-mono">{txn.posId}</span>
                    </div>
                    <div>
                      <span className="text-muted">ชนิดน้ำมัน: </span>
                      <span className="text-app">{txn.fuelType}</span>
                    </div>
                    <div>
                      <span className="text-muted">ชำระด้วย: </span>
                      <span className="text-app">{txn.paymentMethod}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                    <div>
                      <span className="text-muted">จำนวน: </span>
                      <span className="text-app font-semibold">{txn.litres} ลิตร</span>
                    </div>
                    <div>
                      <span className="text-muted">ยอดเงิน: </span>
                      <span className="text-app font-bold">{currencyFormatter.format(txn.amount)}</span>
                    </div>
                    <div>
                      <span className="text-muted">เวลา: </span>
                      <span className="text-app">
                        {new Date(txn.timestamp).toLocaleTimeString("th-TH")}
                      </span>
                    </div>
                  </div>
                  {txn.cctvAvailable && txn.cctvTimestamp && (
                    <div className="mt-2 text-xs text-muted">
                      CCTV: {new Date(txn.cctvTimestamp).toLocaleString("th-TH")}
                    </div>
                  )}
                  {txn.status === "variance" && (
                    <div className="mt-2 p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                      <p className="text-xs text-orange-400">
                        <strong>เตือน:</strong> คลาดเคลื่อน {currencyFormatter.format(txn.variance)} ควรตรวจสอบ
                      </p>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 ml-4">
                  {txn.cctvAvailable && (
                    <button className="p-2 hover:bg-soft rounded-lg transition-colors" title="ดู CCTV">
                      <Eye className="w-5 h-5 text-muted" />
                    </button>
                  )}
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
          <AlertTriangle className="w-6 h-6 text-ptt-cyan mt-0.5" />
          <div>
            <h4 className="font-semibold text-app mb-2">การทำงานของระบบ</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-muted">
              <li>POS บันทึกยอดขาย → ส่งข้อมูลไประบบ</li>
              <li>CCTV บันทึกภาพ → เชื่อมโยงกับรายการ POS</li>
              <li>ระบบเปรียบเทียบ → ตรวจสอบความถูกต้อง</li>
              <li>แจ้งเตือนหากคลาดเคลื่อน → ป้องกันทุจริต</li>
            </ol>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

