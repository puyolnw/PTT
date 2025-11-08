import { motion } from "framer-motion";
import { fundMembers, loans, savingsDeductions, loanRequests } from "@/data/mockData";
import { Clock, PiggyBank, Users, CreditCard, DollarSign } from "lucide-react";

const formatMonthLabel = (month: string) => {
  const [year, monthIndex] = month.split("-").map(Number);
  if (!year || !monthIndex) {
    return month;
  }
  const date = new Date(year, monthIndex - 1, 1);
  return date.toLocaleDateString("th-TH", {
    month: "long",
    year: "numeric",
  });
};

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
        <h2 className="text-2xl font-semibold text-ptt-cyan font-display">ภาพรวมกองทุนสัจจะออมทรัพย์</h2>
        <p className="text-muted font-light">สรุปข้อมูลกองทุนสัจจะออมทรัพย์ทั้งหมด</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Savings */}
        <div className="bg-gradient-to-br from-ptt-blue/10 to-ptt-cyan/10 border border-ptt-blue/20 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-3">
            <PiggyBank className="w-8 h-8 text-ptt-cyan" strokeWidth={1.5} />
            <span className="text-xs text-muted">เงินสัจจะสะสมรวม</span>
          </div>
          <div className="text-3xl font-bold text-app mb-1">
            {fundMembers.reduce((sum, m) => sum + m.totalSavings, 0).toLocaleString()}
          </div>
          <p className="text-sm text-muted">บาท</p>
        </div>

        {/* Total Members */}
        <div className="bg-gradient-to-br from-green-500/10 to-green-400/10 border border-green-500/20 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-3">
            <Users className="w-8 h-8 text-green-400" strokeWidth={1.5} />
            <span className="text-xs text-muted">สมาชิกทั้งหมด</span>
          </div>
          <div className="text-3xl font-bold text-app mb-1">
            {fundMembers.filter(m => m.status === "Active").length}
          </div>
          <p className="text-sm text-muted">คน</p>
        </div>

        {/* Active Loans */}
        <div className="bg-gradient-to-br from-blue-500/10 to-blue-400/10 border border-blue-500/20 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-3">
            <CreditCard className="w-8 h-8 text-blue-400" strokeWidth={1.5} />
            <span className="text-xs text-muted">กู้ที่กำลังชำระ</span>
          </div>
          <div className="text-3xl font-bold text-app mb-1">
            {loans.filter(l => l.status === "Active").length}
          </div>
          <p className="text-sm text-muted">รายการ</p>
        </div>

        {/* Pending Loan Requests */}
        <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-400/10 border border-yellow-500/20 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-3">
            <Clock className="w-8 h-8 text-yellow-400" strokeWidth={1.5} />
            <span className="text-xs text-muted">รออนุมัติกู้</span>
          </div>
          <div className="text-3xl font-bold text-app mb-1">
            {loanRequests.filter(r => r.status === "Pending").length}
          </div>
          <p className="text-sm text-muted">รายการ</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="panel/40 border border-app rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-app mb-4 font-display">การดำเนินการด่วน</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button className="flex items-center gap-3 p-4 bg-ptt-blue/10 hover:bg-ptt-blue/20 border border-ptt-blue/30 rounded-xl transition-colors">
            <Users className="w-5 h-5 text-ptt-cyan" />
            <span className="text-app">เพิ่มสมาชิก</span>
          </button>
          <button className="flex items-center gap-3 p-4 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 rounded-xl transition-colors">
            <CreditCard className="w-5 h-5 text-green-400" />
            <span className="text-app">ยื่นคำขอกู้</span>
          </button>
          <button className="flex items-center gap-3 p-4 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 rounded-xl transition-colors">
            <Clock className="w-5 h-5 text-yellow-400" />
            <span className="text-app">อนุมัติคำขอ</span>
          </button>
          <button className="flex items-center gap-3 p-4 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 rounded-xl transition-colors">
            <DollarSign className="w-5 h-5 text-purple-400" />
            <span className="text-app">ถอนเงินสัจจะ</span>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Deductions */}
        <div className="panel/40 border border-app rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-app mb-4 font-display">การหักเงินสัจจะล่าสุด</h3>
          <div className="space-y-3">
            {savingsDeductions.slice(0, 5).map((deduction) => (
              <div key={deduction.id} className="flex items-center justify-between p-3 bg-soft rounded-lg">
                <div>
                  <p className="text-sm font-medium text-app">{deduction.empName}</p>
                  <p className="text-xs text-muted">{formatMonthLabel(deduction.month)}</p>
                </div>
                <p className="text-sm font-semibold text-green-400">
                  {deduction.amount.toLocaleString()} ฿
                </p>
              </div>
            ))}
            {savingsDeductions.length === 0 && (
              <p className="text-center py-4 text-muted text-sm">ยังไม่มีข้อมูล</p>
            )}
          </div>
        </div>

        {/* Pending Loan Requests */}
        <div className="panel/40 border border-app rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-app mb-4 font-display">คำขอกู้ที่รออนุมัติ</h3>
          <div className="space-y-3">
            {loanRequests
              .filter(r => r.status === "Pending")
              .slice(0, 5)
              .map((request) => (
                <div key={request.id} className="flex items-center justify-between p-3 bg-soft rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-app">{request.empName}</p>
                    <p className="text-xs text-muted">{request.loanType} • {request.purpose}</p>
                  </div>
                  <p className="text-sm font-semibold text-ptt-cyan">
                    {request.requestedAmount.toLocaleString()} ฿
                  </p>
                </div>
              ))}
            {loanRequests.filter(r => r.status === "Pending").length === 0 && (
              <p className="text-center py-4 text-muted text-sm">ไม่มีคำขอรออนุมัติ</p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

