import { motion } from "framer-motion";
import { PiggyBank, TrendingUp, TrendingDown, Activity } from "lucide-react";
import { donations, expenditures, fundSummary } from "@/data/mockData";

export default function FundStats() {
  const donationsByMonth = donations.reduce((acc, d) => acc + d.amount, 0);
  const expendituresByMonth = expenditures.reduce((acc, e) => acc + e.amount, 0);
  const netChange = donationsByMonth - expendituresByMonth;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-ptt-cyan font-display">รายงานกองทุน</h2>
        <p className="text-muted font-light">สถิติกองทุน รายรับ-รายจ่าย</p>
      </div>

      {/* Fund Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

        <div className="bg-gradient-to-br from-green-500/10 to-green-400/10 border border-green-500/20 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-3">
            <TrendingUp className="w-8 h-8 text-green-400" strokeWidth={1.5} />
            <span className="text-xs text-muted">รายรับเดือนนี้</span>
          </div>
          <div className="text-3xl font-bold text-app mb-1">
            {donationsByMonth.toLocaleString()}
          </div>
          <p className="text-sm text-muted">บาท</p>
        </div>

        <div className="bg-gradient-to-br from-ptt-red/10 to-red-400/10 border border-ptt-red/20 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-3">
            <TrendingDown className="w-8 h-8 text-ptt-red" strokeWidth={1.5} />
            <span className="text-xs text-muted">รายจ่ายเดือนนี้</span>
          </div>
          <div className="text-3xl font-bold text-app mb-1">
            {expendituresByMonth.toLocaleString()}
          </div>
          <p className="text-sm text-muted">บาท</p>
        </div>

        <div className={`bg-gradient-to-br ${netChange >= 0 ? 'from-green-500/10 to-green-400/10 border-green-500/20' : 'from-ptt-red/10 to-red-400/10 border-ptt-red/20'} border rounded-2xl p-6`}>
          <div className="flex items-center justify-between mb-3">
            <Activity className={`w-8 h-8 ${netChange >= 0 ? 'text-green-400' : 'text-ptt-red'}`} strokeWidth={1.5} />
            <span className="text-xs text-muted">เปลี่ยนแปลง</span>
          </div>
          <div className={`text-3xl font-bold ${netChange >= 0 ? 'text-green-400' : 'text-ptt-red'} mb-1`}>
            {netChange >= 0 ? '+' : ''}{netChange.toLocaleString()}
          </div>
          <p className="text-sm text-muted">บาท</p>
        </div>
      </div>

      {/* Donation Breakdown */}
      <div className="panel/40 border border-app rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-app mb-4 font-display">รายรับแยกตามประเภท</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {["Individual", "Company"].map((type) => {
            const amount = donations
              .filter(d => d.donorType === type)
              .reduce((sum, d) => sum + d.amount, 0);
            const count = donations.filter(d => d.donorType === type).length;
            return (
              <div key={type} className="bg-ink-800/40 rounded-xl p-4">
                <div className="text-sm text-muted mb-2">
                  {type === "Individual" ? "บุคคลทั่วไป" : "บริษัท/องค์กร"}
                </div>
                <div className="text-2xl font-bold text-green-400 mb-1">
                  {amount.toLocaleString()} ฿
                </div>
                <div className="text-xs text-muted">{count} รายการ</div>
                <div className="mt-3 h-2 bg-ink-700 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-green-500 to-green-400 w-[var(--donation-percentage)]"
                    style={{ "--donation-percentage": `${(amount / donationsByMonth) * 100}%` } as React.CSSProperties}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Expenditure Breakdown */}
      <div className="panel/40 border border-app rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-app mb-4 font-display">รายจ่ายแยกตามแผนก</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {["IT", "HR", "Account", "Marketing"].map((dept) => {
            const amount = expenditures
              .filter(e => e.dept === dept)
              .reduce((sum, e) => sum + e.amount, 0);
            return (
              <div key={dept} className="bg-ink-800/40 rounded-xl p-4">
                <div className="text-sm text-muted mb-2">{dept}</div>
                <div className="text-2xl font-bold text-ptt-red mb-1">
                  {amount.toLocaleString()} ฿
                </div>
                <div className="mt-2 h-2 bg-ink-700 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-ptt-red to-red-400 w-[var(--expenditure-percentage)]"
                    style={{ "--expenditure-percentage": `${amount > 0 ? (amount / expendituresByMonth) * 100 : 0}%` } as React.CSSProperties}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="panel/40 border border-app rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-app mb-4 font-display">รายการล่าสุด</h3>
        <div className="space-y-3">
          {donations.slice(0, 3).map((d) => (
            <div key={d.id} className="flex items-center justify-between p-3 bg-ink-800/40 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-400" strokeWidth={1.5} />
                </div>
                <div>
                  <div className="text-sm font-medium text-app">{d.donorName}</div>
                  <div className="text-xs text-muted">{d.date}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-green-400">+{d.amount.toLocaleString()} ฿</div>
                <div className="text-xs text-muted">{d.purpose}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chart Placeholder */}
      <div className="panel/40 border border-app rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-app mb-4 font-display">แนวโน้มรายรับ-รายจ่ายรายเดือน</h3>
        <div className="h-64 flex items-center justify-center border-2 border-dashed border-app rounded-xl">
          <p className="text-muted">📊 Chart Placeholder (ใช้ Recharts/Chart.js)</p>
        </div>
      </div>
    </motion.div>
  );
}

