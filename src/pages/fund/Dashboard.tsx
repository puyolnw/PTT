import { motion } from "framer-motion";
import { fundSummary } from "@/data/mockData";
import { TrendingUp, TrendingDown, Clock, PiggyBank } from "lucide-react";

export default function FundDashboard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-ptt-cyan font-display">ภาพรวมกองทุน</h2>
        <p className="text-muted font-light">สรุปข้อมูลกองทุนทั้งหมด</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Balance */}
        <div className="bg-gradient-to-br from-ptt-blue/10 to-ptt-cyan/10 border border-ptt-blue/20 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-3">
            <PiggyBank className="w-8 h-8 text-ptt-cyan" strokeWidth={1.5} />
            <span className="text-xs text-muted">ยอดคงเหลือ</span>
          </div>
          <div className="text-3xl font-bold text-app mb-1">
            {fundSummary.totalBalance.toLocaleString()}
          </div>
          <p className="text-sm text-muted">บาท</p>
        </div>

        {/* Total Donations */}
        <div className="bg-gradient-to-br from-green-500/10 to-green-400/10 border border-green-500/20 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-3">
            <TrendingUp className="w-8 h-8 text-green-400" strokeWidth={1.5} />
            <span className="text-xs text-muted">ยอดรับบริจาค</span>
          </div>
          <div className="text-3xl font-bold text-app mb-1">
            {fundSummary.totalDonations.toLocaleString()}
          </div>
          <p className="text-sm text-muted">บาท</p>
        </div>

        {/* Total Expenditures */}
        <div className="bg-gradient-to-br from-ptt-red/10 to-red-400/10 border border-ptt-red/20 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-3">
            <TrendingDown className="w-8 h-8 text-ptt-red" strokeWidth={1.5} />
            <span className="text-xs text-muted">ยอดเบิกจ่าย</span>
          </div>
          <div className="text-3xl font-bold text-app mb-1">
            {fundSummary.totalExpenditures.toLocaleString()}
          </div>
          <p className="text-sm text-muted">บาท</p>
        </div>

        {/* Pending Approvals */}
        <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-400/10 border border-yellow-500/20 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-3">
            <Clock className="w-8 h-8 text-yellow-400" strokeWidth={1.5} />
            <span className="text-xs text-muted">รออนุมัติ</span>
          </div>
          <div className="text-3xl font-bold text-app mb-1">
            {fundSummary.pendingApprovals}
          </div>
          <p className="text-sm text-muted">รายการ</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="panel/40 border border-app rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-app mb-4 font-display">การดำเนินการด่วน</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center gap-3 p-4 bg-ptt-blue/10 hover:bg-ptt-blue/20 border border-ptt-blue/30 rounded-xl transition-colors">
            <TrendingUp className="w-5 h-5 text-ptt-cyan" />
            <span className="text-app">บันทึกการบริจาค</span>
          </button>
          <button className="flex items-center gap-3 p-4 bg-ptt-red/10 hover:bg-ptt-red/20 border border-ptt-red/30 rounded-xl transition-colors">
            <TrendingDown className="w-5 h-5 text-ptt-red" />
            <span className="text-app">บันทึกการเบิกจ่าย</span>
          </button>
          <button className="flex items-center gap-3 p-4 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 rounded-xl transition-colors">
            <Clock className="w-5 h-5 text-yellow-400" />
            <span className="text-app">อนุมัติคำขอ</span>
          </button>
        </div>
      </div>

      {/* Recent Activity Placeholder */}
      <div className="panel/40 border border-app rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-app mb-4 font-display">กิจกรรมล่าสุด</h3>
        <div className="text-center py-8 text-muted">
          <p>แสดงรายการกิจกรรมล่าสุดของกองทุน</p>
        </div>
      </div>
    </motion.div>
  );
}

