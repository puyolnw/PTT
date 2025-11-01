import { motion } from "framer-motion";
import { fundSummary, donations, expenditures } from "@/data/mockData";
import { FileSpreadsheet, Download, TrendingUp, TrendingDown } from "lucide-react";

export default function FundReports() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-ptt-cyan font-display">รายงานกองทุน</h2>
          <p className="text-muted font-light">สรุปรายงานและส่งออกข้อมูลกองทุน</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 rounded-xl transition-colors">
          <FileSpreadsheet className="w-5 h-5" />
          <span>ส่งออก Excel</span>
        </button>
      </div>

      {/* Summary Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Income Report */}
        <div className="panel/40 border border-app rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500/20 to-green-400/20 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-400" strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-app font-display">รายได้ (บริจาค)</h3>
              <p className="text-sm text-muted">ยอดรวมรายการบริจาค</p>
            </div>
          </div>
          <div className="text-3xl font-bold text-green-400 mb-4">
            {fundSummary.totalDonations.toLocaleString()} ฿
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted">จำนวนรายการ:</span>
              <span className="text-app font-semibold">{donations.length} รายการ</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted">ยอดเฉลี่ย:</span>
              <span className="text-app font-semibold">
                {(fundSummary.totalDonations / donations.length).toLocaleString()} ฿
              </span>
            </div>
          </div>
        </div>

        {/* Expense Report */}
        <div className="panel/40 border border-app rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-ptt-red/20 to-red-400/20 rounded-xl flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-ptt-red" strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-app font-display">รายจ่าย (เบิกจ่าย)</h3>
              <p className="text-sm text-muted">ยอดรวมการเบิกจ่าย</p>
            </div>
          </div>
          <div className="text-3xl font-bold text-ptt-red mb-4">
            {fundSummary.totalExpenditures.toLocaleString()} ฿
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted">จำนวนรายการ:</span>
              <span className="text-app font-semibold">{expenditures.length} รายการ</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted">ยอดเฉลี่ย:</span>
              <span className="text-app font-semibold">
                {(fundSummary.totalExpenditures / expenditures.length).toLocaleString()} ฿
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className="panel/40 border border-app rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-app mb-4 font-display">ส่งออกรายงาน</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center gap-3 p-4 bg-green-600/20 hover:bg-green-600/30 border border-green-500/30 rounded-xl transition-colors">
            <Download className="w-5 h-5 text-green-400" />
            <div className="text-left">
              <p className="text-sm font-semibold text-app">รายงานการบริจาค</p>
              <p className="text-xs text-muted">Excel / PDF</p>
            </div>
          </button>
          <button className="flex items-center gap-3 p-4 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 rounded-xl transition-colors">
            <Download className="w-5 h-5 text-red-400" />
            <div className="text-left">
              <p className="text-sm font-semibold text-app">รายงานการเบิกจ่าย</p>
              <p className="text-xs text-muted">Excel / PDF</p>
            </div>
          </button>
          <button className="flex items-center gap-3 p-4 bg-ptt-blue/20 hover:bg-ptt-blue/30 border border-ptt-blue/30 rounded-xl transition-colors">
            <Download className="w-5 h-5 text-ptt-cyan" />
            <div className="text-left">
              <p className="text-sm font-semibold text-app">รายงานสรุปกองทุน</p>
              <p className="text-xs text-muted">Excel / PDF</p>
            </div>
          </button>
        </div>
      </div>

      {/* Chart Placeholder */}
      <div className="panel/40 border border-app rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-app mb-4 font-display">กราฟแสดงยอดกองทุนรายเดือน</h3>
        <div className="h-64 flex items-center justify-center text-muted">
          <p>[ แสดงกราฟการเคลื่อนไหวของกองทุน ]</p>
        </div>
      </div>
    </motion.div>
  );
}

