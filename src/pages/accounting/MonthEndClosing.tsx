import { motion } from "framer-motion";
import { Lock, Unlock, CheckCircle, XCircle, AlertCircle, FileText, Download } from "lucide-react";
import { useState } from "react";

const currencyFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 0,
});

// Mock data - Month End Closing
const mockClosingData = {
  currentPeriod: "ตุลาคม 2568",
  isClosed: true,
  closedDate: "2024-10-31",
  closedBy: "ผู้ดูแลระบบ",
  previousPeriod: "กันยายน 2568",
  previousClosed: true,
  closingChecks: [
    { id: "1", name: "ตรวจสอบรายการบัญชีทั้งหมด", status: "passed", message: "✓ ผ่าน" },
    { id: "2", name: "กระทบยอดธนาคาร", status: "passed", message: "✓ ตรงกัน 99.8%" },
    { id: "3", name: "คำนวณภาษี VAT", status: "passed", message: "✓ ครบถ้วน" },
    { id: "4", name: "ตรวจสอบยอดคงเหลือ", status: "passed", message: "✓ สมดุล" },
    { id: "5", name: "บันทึกค่าเสื่อมราคา", status: "passed", message: "✓ ครบถ้วน" },
  ],
  financialSummary: {
    revenue: 5500000,
    expenses: 4200000,
    netProfit: 1300000,
    assets: 15000000,
    liabilities: 6000000,
    equity: 9000000,
  },
  reportsGenerated: [
    { id: "1", name: "งบดุล", generated: true, date: "2024-10-31" },
    { id: "2", name: "งบกำไรขาดทุน", generated: true, date: "2024-10-31" },
    { id: "3", name: "งบกระแสเงินสด", generated: true, date: "2024-10-31" },
  ],
};

export default function MonthEndClosing() {
  const [selectedPeriod, setSelectedPeriod] = useState("2024-10");

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h2 className="text-3xl font-bold text-app mb-2 font-display">ปิดงบดุลรายเดือน</h2>
        <p className="text-muted font-light">
          ล็อกข้อมูล → ปิดบัญชี → ออกงบอัตโนมัติ
        </p>
      </motion.div>

      {/* Status Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`panel rounded-2xl p-6 shadow-app border-2 ${
          mockClosingData.isClosed
            ? "border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5"
            : "border-orange-500/30 bg-gradient-to-br from-orange-500/10 to-orange-500/5"
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {mockClosingData.isClosed ? (
              <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30">
                <Lock className="w-6 h-6 text-emerald-400" />
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-orange-500/20 border border-orange-500/30">
                <Unlock className="w-6 h-6 text-orange-400" />
              </div>
            )}
            <div>
              <h3 className="text-xl font-semibold text-app">สถานะปิดงบดุล</h3>
              <p className="text-sm text-muted">
                {mockClosingData.isClosed
                  ? `ปิดแล้ว - ${mockClosingData.currentPeriod}`
                  : `ยังไม่ปิด - ${mockClosingData.currentPeriod}`}
              </p>
            </div>
          </div>
          {mockClosingData.isClosed ? (
            <span className="px-4 py-2 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-medium">
              ✅ ปิดแล้ว
            </span>
          ) : (
            <button className="flex items-center gap-2 px-4 py-2 bg-ptt-blue/10 hover:bg-ptt-blue/20 border border-ptt-blue/30 rounded-xl text-ptt-cyan transition-colors">
              <Lock className="w-5 h-5" />
              <span>ปิดงบดุล</span>
            </button>
          )}
        </div>
        {mockClosingData.isClosed && (
          <div className="mt-4 p-4 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
            <p className="text-sm text-emerald-400/80">
              ปิดงบดุลเมื่อ: {new Date(mockClosingData.closedDate).toLocaleDateString("th-TH", {
                year: "numeric",
                month: "long",
                day: "numeric"
              })} โดย {mockClosingData.closedBy}
            </p>
          </div>
        )}
      </motion.div>

      {/* Closing Checks */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="panel rounded-2xl p-6 shadow-app"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-app">ตรวจสอบก่อนปิดงบดุล</h3>
            <p className="text-sm text-muted">
              {mockClosingData.closingChecks.filter(c => c.status === "passed").length} / {mockClosingData.closingChecks.length} ผ่าน
            </p>
          </div>
          <AlertCircle className="w-6 h-6 text-muted" />
        </div>
        <div className="space-y-3">
          {mockClosingData.closingChecks.map((check) => (
            <div
              key={check.id}
              className={`flex items-center justify-between p-4 rounded-xl border ${
                check.status === "passed"
                  ? "bg-emerald-500/10 border-emerald-500/30"
                  : "bg-orange-500/10 border-orange-500/30"
              }`}
            >
              <div className="flex items-center gap-3">
                {check.status === "passed" ? (
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                ) : (
                  <XCircle className="w-5 h-5 text-orange-400" />
                )}
                <span className="font-medium text-app">{check.name}</span>
              </div>
              <span className={`text-sm ${
                check.status === "passed" ? "text-emerald-400" : "text-orange-400"
              }`}>
                {check.message}
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Financial Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="panel rounded-2xl p-6 shadow-app"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-app">สรุปการเงิน - {mockClosingData.currentPeriod}</h3>
          <FileText className="w-6 h-6 text-muted" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
            <p className="text-sm text-muted mb-1">รายได้รวม</p>
            <p className="text-2xl font-bold text-emerald-400">
              {currencyFormatter.format(mockClosingData.financialSummary.revenue)}
            </p>
          </div>
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
            <p className="text-sm text-muted mb-1">ค่าใช้จ่ายรวม</p>
            <p className="text-2xl font-bold text-red-400">
              {currencyFormatter.format(mockClosingData.financialSummary.expenses)}
            </p>
          </div>
          <div className="bg-ptt-blue/10 border border-ptt-blue/30 rounded-xl p-4">
            <p className="text-sm text-muted mb-1">กำไรสุทธิ</p>
            <p className="text-2xl font-bold text-ptt-cyan">
              {currencyFormatter.format(mockClosingData.financialSummary.netProfit)}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
            <p className="text-sm text-muted mb-1">สินทรัพย์</p>
            <p className="text-2xl font-bold text-blue-400">
              {currencyFormatter.format(mockClosingData.financialSummary.assets)}
            </p>
          </div>
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
            <p className="text-sm text-muted mb-1">หนี้สิน</p>
            <p className="text-2xl font-bold text-orange-400">
              {currencyFormatter.format(mockClosingData.financialSummary.liabilities)}
            </p>
          </div>
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
            <p className="text-sm text-muted mb-1">ทุน</p>
            <p className="text-2xl font-bold text-purple-400">
              {currencyFormatter.format(mockClosingData.financialSummary.equity)}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Generated Reports */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="panel rounded-2xl p-6 shadow-app"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-app">รายงานที่สร้างแล้ว</h3>
            <p className="text-sm text-muted">
              {mockClosingData.reportsGenerated.filter(r => r.generated).length} / {mockClosingData.reportsGenerated.length} รายงาน
            </p>
          </div>
          <Download className="w-6 h-6 text-muted" />
        </div>
        <div className="space-y-3">
          {mockClosingData.reportsGenerated.map((report) => (
            <div
              key={report.id}
              className="flex items-center justify-between p-4 bg-soft rounded-xl border border-app"
            >
              <div className="flex items-center gap-3">
                {report.generated ? (
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                ) : (
                  <XCircle className="w-5 h-5 text-muted" />
                )}
                <div>
                  <p className="font-medium text-app">{report.name}</p>
                  {report.generated && (
                    <p className="text-xs text-muted">
                      สร้างเมื่อ: {new Date(report.date).toLocaleDateString("th-TH")}
                    </p>
                  )}
                </div>
              </div>
              {report.generated && (
                <button className="flex items-center gap-2 px-4 py-2 bg-ptt-blue/10 hover:bg-ptt-blue/20 border border-ptt-blue/30 rounded-xl text-ptt-cyan transition-colors">
                  <Download className="w-4 h-4" />
                  <span>ดาวน์โหลด</span>
                </button>
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Actions */}
      {!mockClosingData.isClosed && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="panel rounded-2xl p-6 shadow-app border-2 border-orange-500/30"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-app">พร้อมปิดงบดุล</h3>
              <p className="text-sm text-muted">
                ตรวจสอบครบถ้วนแล้ว สามารถปิดงบดุลได้
              </p>
            </div>
            <button className="flex items-center gap-2 px-6 py-3 bg-ptt-blue/10 hover:bg-ptt-blue/20 border border-ptt-blue/30 rounded-xl text-ptt-cyan font-semibold transition-colors">
              <Lock className="w-5 h-5" />
              <span>ปิดงบดุล {mockClosingData.currentPeriod}</span>
            </button>
          </div>
        </motion.div>
      )}

      {/* Period Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="panel rounded-2xl p-6 shadow-app"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-app">เลือกงวดที่ต้องการดู</h3>
            <p className="text-sm text-muted">ดูสถานะปิดงบดุลของงวดอื่นๆ</p>
          </div>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 bg-soft border border-app rounded-xl text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue/30"
          >
            <option value="2024-10">ตุลาคม 2568</option>
            <option value="2024-09">กันยายน 2568</option>
            <option value="2024-08">สิงหาคม 2568</option>
          </select>
        </div>
      </motion.div>
    </div>
  );
}

