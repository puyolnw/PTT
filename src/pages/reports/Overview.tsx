import { motion } from "framer-motion";
import { PieChart, Users, PiggyBank, TrendingUp } from "lucide-react";

export default function Overview() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-ptt-cyan font-display">ภาพรวมรายงาน</h2>
        <p className="text-muted font-light">Dashboard รวมทุกระบบ</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-ptt-blue/10 to-ptt-cyan/10 border border-ptt-blue/20 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-3">
            <Users className="w-8 h-8 text-ptt-cyan" strokeWidth={1.5} />
            <span className="text-xs text-muted">พนักงานทั้งหมด</span>
          </div>
          <div className="text-3xl font-bold text-app mb-1">156</div>
          <p className="text-sm text-muted">คน</p>
        </div>

        <div className="bg-gradient-to-br from-green-500/10 to-green-400/10 border border-green-500/20 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-3">
            <TrendingUp className="w-8 h-8 text-green-400" strokeWidth={1.5} />
            <span className="text-xs text-muted">ประสิทธิภาพเฉลี่ย</span>
          </div>
          <div className="text-3xl font-bold text-app mb-1">87%</div>
          <p className="text-sm text-muted">คะแนน</p>
        </div>

        <div className="bg-gradient-to-br from-ptt-blue/10 to-purple-500/10 border border-purple-500/20 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-3">
            <PiggyBank className="w-8 h-8 text-purple-400" strokeWidth={1.5} />
            <span className="text-xs text-muted">กองทุนคงเหลือ</span>
          </div>
          <div className="text-3xl font-bold text-app mb-1">2.5M</div>
          <p className="text-sm text-muted">บาท</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-500/10 to-orange-400/10 border border-yellow-500/20 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-3">
            <PieChart className="w-8 h-8 text-yellow-400" strokeWidth={1.5} />
            <span className="text-xs text-muted">การเข้างานเฉลี่ย</span>
          </div>
          <div className="text-3xl font-bold text-app mb-1">95%</div>
          <p className="text-sm text-muted">อัตรา</p>
        </div>
      </div>

      {/* Chart Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* HR Overview */}
        <div className="panel/40 border border-app rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <Users className="w-6 h-6 text-ptt-cyan" strokeWidth={1.5} />
            <h3 className="text-lg font-semibold text-app font-display">สรุประบบพนักงาน</h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-ink-800/40 rounded-lg">
              <span className="text-sm text-app">พนักงานใหม่เดือนนี้</span>
              <span className="text-lg font-bold text-green-400">+12</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-ink-800/40 rounded-lg">
              <span className="text-sm text-app">การลาค้างอนุมัติ</span>
              <span className="text-lg font-bold text-yellow-400">5</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-ink-800/40 rounded-lg">
              <span className="text-sm text-app">การมาสายเดือนนี้</span>
              <span className="text-lg font-bold text-ptt-red">8</span>
            </div>
          </div>
        </div>

        {/* Fund Overview */}
        <div className="panel/40 border border-app rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <PiggyBank className="w-6 h-6 text-ptt-cyan" strokeWidth={1.5} />
            <h3 className="text-lg font-semibold text-app font-display">สรุประบบกองทุน</h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-ink-800/40 rounded-lg">
              <span className="text-sm text-app">รายรับเดือนนี้</span>
              <span className="text-lg font-bold text-green-400">+765K</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-ink-800/40 rounded-lg">
              <span className="text-sm text-app">รายจ่ายเดือนนี้</span>
              <span className="text-lg font-bold text-ptt-red">-160K</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-ink-800/40 rounded-lg">
              <span className="text-sm text-app">คำขอรออนุมัติ</span>
              <span className="text-lg font-bold text-yellow-400">2</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Placeholder */}
      <div className="panel/40 border border-app rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-app mb-4 font-display">กราฟแนวโน้มรายเดือน</h3>
        <div className="h-64 flex items-center justify-center border-2 border-dashed border-app rounded-xl">
          <p className="text-muted">📊 Chart Placeholder (ใช้ Recharts/Chart.js)</p>
        </div>
      </div>
    </motion.div>
  );
}

