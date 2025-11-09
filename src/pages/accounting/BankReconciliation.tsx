import { motion } from "framer-motion";
import { Building2, Upload, CheckCircle, XCircle, AlertCircle, Download } from "lucide-react";
import { useState } from "react";

const currencyFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 0,
});

// Mock data - Bank Reconciliation
const mockBankReconciliation = {
  systemBalance: 5000000,
  bankBalance: 4990000,
  difference: 10000,
  matchRate: 99.8,
  period: "ตุลาคม 2568",
  transactions: [
    { id: "1", date: "2024-10-15", description: "โอนเงินเข้า - M1 ขายน้ำมัน", amount: 500000, type: "credit", matched: true },
    { id: "2", date: "2024-10-14", description: "โอนเงินออก - จ่ายเงินเดือน", amount: -200000, type: "debit", matched: true },
    { id: "3", date: "2024-10-13", description: "ค่าธรรมเนียมธนาคาร", amount: -100, type: "debit", matched: false },
    { id: "4", date: "2024-10-12", description: "ดอกเบี้ยเงินฝาก", amount: 500, type: "credit", matched: false },
    { id: "5", date: "2024-10-11", description: "โอนเงินเข้า - M2 ค่าเช่า", amount: 25000, type: "credit", matched: true },
  ],
  unmatchedItems: [
    { id: "3", date: "2024-10-13", description: "ค่าธรรมเนียมธนาคาร", amount: -100, type: "bank" },
    { id: "4", date: "2024-10-12", description: "ดอกเบี้ยเงินฝาก", amount: 500, type: "bank" },
  ],
};

export default function BankReconciliation() {
  const [selectedPeriod, setSelectedPeriod] = useState("2024-10");

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h2 className="text-3xl font-bold text-app mb-2 font-display">กระทบยอดธนาคาร (Bank Reconciliation)</h2>
        <p className="text-muted font-light">
          นำเข้าไฟล์ Bank Statement → กระทบยอดอัตโนมัติ
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
            <Building2 className="w-6 h-6 text-ptt-cyan" />
            <span className="text-xs text-muted">ยอดระบบ</span>
          </div>
          <p className="text-2xl font-bold text-app">
            {currencyFormatter.format(mockBankReconciliation.systemBalance)}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="panel rounded-2xl p-6 shadow-app"
        >
          <div className="flex items-center justify-between mb-4">
            <Building2 className="w-6 h-6 text-blue-400" />
            <span className="text-xs text-muted">ยอดธนาคาร</span>
          </div>
          <p className="text-2xl font-bold text-app">
            {currencyFormatter.format(mockBankReconciliation.bankBalance)}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`panel rounded-2xl p-6 shadow-app ${
            Math.abs(mockBankReconciliation.difference) < 10000
              ? "border-2 border-emerald-500/30"
              : "border-2 border-orange-500/30"
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <AlertCircle className={`w-6 h-6 ${
              Math.abs(mockBankReconciliation.difference) < 10000
                ? "text-emerald-400"
                : "text-orange-400"
            }`} />
            <span className="text-xs text-muted">ส่วนต่าง</span>
          </div>
          <p className={`text-2xl font-bold ${
            Math.abs(mockBankReconciliation.difference) < 10000
              ? "text-emerald-400"
              : "text-orange-400"
          }`}>
            {currencyFormatter.format(mockBankReconciliation.difference)}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="panel rounded-2xl p-6 shadow-app"
        >
          <div className="flex items-center justify-between mb-4">
            <CheckCircle className="w-6 h-6 text-emerald-400" />
            <span className="text-xs text-muted">อัตราตรงกัน</span>
          </div>
          <p className="text-2xl font-bold text-emerald-400">
            {mockBankReconciliation.matchRate}%
          </p>
        </motion.div>
      </div>

      {/* Upload Bank Statement */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="panel rounded-2xl p-6 shadow-app"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-app">นำเข้าไฟล์ Bank Statement</h3>
            <p className="text-sm text-muted">รองรับไฟล์ Excel จากธนาคาร</p>
          </div>
          <Upload className="w-6 h-6 text-muted" />
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-3 px-6 py-3 bg-ptt-blue/10 hover:bg-ptt-blue/20 border border-ptt-blue/30 rounded-xl cursor-pointer transition-colors">
            <Upload className="w-5 h-5 text-ptt-cyan" />
            <span className="text-ptt-cyan font-medium">เลือกไฟล์ Excel</span>
            <input
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
            />
          </label>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-3 bg-soft border border-app rounded-xl text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue/30"
          >
            <option value="2024-10">ตุลาคม 2568</option>
            <option value="2024-09">กันยายน 2568</option>
            <option value="2024-08">สิงหาคม 2568</option>
          </select>
        </div>
      </motion.div>

      {/* Reconciliation Details */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Matched Transactions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="panel rounded-2xl p-6 shadow-app"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-semibold text-app">รายการที่ตรงกัน</h3>
              <p className="text-sm text-muted">
                {mockBankReconciliation.transactions.filter(t => t.matched).length} รายการ
              </p>
            </div>
            <CheckCircle className="w-6 h-6 text-emerald-400" />
          </div>
          <div className="space-y-3">
            {mockBankReconciliation.transactions.filter(t => t.matched).map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl"
              >
                <div>
                  <p className="font-medium text-app">{transaction.description}</p>
                  <p className="text-xs text-muted">
                    {new Date(transaction.date).toLocaleDateString("th-TH")}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${
                    transaction.amount > 0 ? "text-emerald-400" : "text-red-400"
                  }`}>
                    {transaction.amount > 0 ? "+" : ""}
                    {currencyFormatter.format(transaction.amount)}
                  </p>
                  <CheckCircle className="w-4 h-4 text-emerald-400 mt-1 ml-auto" />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Unmatched Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="panel rounded-2xl p-6 shadow-app"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-semibold text-app">รายการที่ไม่ตรงกัน</h3>
              <p className="text-sm text-muted">
                {mockBankReconciliation.unmatchedItems.length} รายการ
              </p>
            </div>
            <XCircle className="w-6 h-6 text-orange-400" />
          </div>
          <div className="space-y-3">
            {mockBankReconciliation.unmatchedItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 bg-orange-500/10 border border-orange-500/30 rounded-xl"
              >
                <div>
                  <p className="font-medium text-app">{item.description}</p>
                  <p className="text-xs text-muted">
                    {new Date(item.date).toLocaleDateString("th-TH")} • {item.type === "bank" ? "ธนาคาร" : "ระบบ"}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${
                    item.amount > 0 ? "text-emerald-400" : "text-red-400"
                  }`}>
                    {item.amount > 0 ? "+" : ""}
                    {currencyFormatter.format(item.amount)}
                  </p>
                  <button className="mt-2 px-3 py-1 text-xs bg-ptt-blue/10 hover:bg-ptt-blue/20 text-ptt-cyan rounded-lg transition-colors">
                    จับคู่
                  </button>
                </div>
              </div>
            ))}
            {mockBankReconciliation.unmatchedItems.length === 0 && (
              <div className="text-center py-8 text-muted">
                ไม่มีรายการที่ไม่ตรงกัน
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="panel rounded-2xl p-6 shadow-app"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-app">การดำเนินการ</h3>
            <p className="text-sm text-muted">ออกรายงานหรือบันทึกการกระทบยอด</p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-soft hover:bg-soft/80 border border-app rounded-xl text-app transition-colors">
              <Download className="w-5 h-5" />
              <span>ออกรายงาน</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-ptt-blue/10 hover:bg-ptt-blue/20 border border-ptt-blue/30 rounded-xl text-ptt-cyan transition-colors">
              <CheckCircle className="w-5 h-5" />
              <span>บันทึกการกระทบยอด</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

