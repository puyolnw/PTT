import { motion } from "framer-motion";
import { Users, Clock, Calendar, Wallet, TrendingUp, Download } from "lucide-react";
import SummaryStats from "@/components/SummaryStats";
import ChartCard from "@/components/ChartCard";
import { reportSummary, attendanceChartData, departmentData } from "@/data/mockData";

export default function Reports() {
  const stats = [
    {
      label: "พนักงานทั้งหมด",
      value: reportSummary.totalEmployees,
      icon: Users,
      color: "from-ptt-blue to-ptt-cyan",
      change: "+1"
    },
    {
      label: "อัตราเข้างานตรงเวลา",
      value: `${reportSummary.averageAttendance}%`,
      icon: Clock,
      color: "from-green-500 to-emerald-500",
      change: "+2.5%"
    },
    {
      label: "การลารอดำเนินการ",
      value: reportSummary.pendingLeaves,
      icon: Calendar,
      color: "from-yellow-500 to-orange-500",
    },
    {
      label: "เงินเดือนรวม",
      value: `฿${(reportSummary.totalPayroll / 1000).toFixed(0)}K`,
      icon: Wallet,
      color: "from-purple-500 to-pink-500",
    },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-app mb-2 font-display">
            รายงานและสถิติ
          </h1>
          <p className="text-muted font-light">
            ภาพรวมข้อมูล HR ทั้งหมด
          </p>
        </div>

        <button
          onClick={() => alert("Export รายงาน (Mock)")}
          className="inline-flex items-center gap-2 px-6 py-3 bg-ptt-blue hover:bg-ptt-blue/80 
                   text-app rounded-xl transition-all duration-200 font-semibold 
                   shadow-lg hover:shadow-xl hover:-translate-y-0.5"
        >
          <Download className="w-5 h-5" />
          Export รายงาน
        </button>
      </div>

      {/* Summary Stats */}
      <SummaryStats stats={stats} />

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Chart */}
        <ChartCard
          title="สถิติการเข้างาน"
          subtitle="4 เดือนล่าสุด"
          icon={TrendingUp}
        >
          <div className="h-64 flex items-center justify-center bg-ink-900/50 rounded-xl">
            <div className="text-center">
              <p className="text-muted font-light mb-2">Attendance Trend</p>
              <div className="flex gap-4 justify-center text-sm">
                {attendanceChartData.map((data) => (
                  <div key={data.month} className="text-center">
                    <p className="text-slate-500 text-xs mb-1">{data.month}</p>
                    <div className="flex gap-1">
                      <div className="w-3 h-12 bg-green-500 rounded-sm" title={`ตรงเวลา: ${data.onTime}`} />
                      <div className="w-3 h-3 bg-yellow-500 rounded-sm" title={`สาย: ${data.late}`} />
                      <div className="w-3 h-2 bg-red-500 rounded-sm" title={`ขาด: ${data.absent}`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ChartCard>

        {/* Department Distribution */}
        <ChartCard
          title="กระจายแผนก"
          subtitle="จำนวนพนักงานแต่ละแผนก"
          icon={Users}
        >
          <div className="h-64 flex items-center justify-center">
            <div className="space-y-3 w-full">
              {departmentData.map((dept, index) => (
                <div key={dept.name} className="flex items-center gap-4">
                  <div className="w-24 text-right text-sm text-slate-300 font-light">
                    {dept.name}
                  </div>
                  <div className="flex-1 bg-ink-900 rounded-full h-6 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(dept.value / 6) * 100}%` }}
                      transition={{ delay: index * 0.2, duration: 0.5 }}
                      className="h-full bg-gradient-to-r from-ptt-blue to-ptt-cyan rounded-full 
                               flex items-center justify-end pr-2"
                    >
                      <span className="text-xs text-app font-semibold">{dept.value}</span>
                    </motion.div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-soft border border-app rounded-2xl p-6 shadow-xl"
        >
          <h3 className="text-lg font-semibold text-app mb-4 font-display">
            สรุปการเข้างาน
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted">พนักงานออนไลน์:</span>
              <span className="text-green-400 font-semibold">{reportSummary.activeEmployees}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted">ลา:</span>
              <span className="text-yellow-400 font-semibold">{reportSummary.onLeave}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted">มาสายเดือนนี้:</span>
              <span className="text-red-400 font-semibold">{reportSummary.lateThisMonth}</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-soft border border-app rounded-2xl p-6 shadow-xl"
        >
          <h3 className="text-lg font-semibold text-app mb-4 font-display">
            การเงิน
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted">เงินเดือนรวม:</span>
              <span className="text-ptt-cyan font-semibold">
                {formatCurrency(reportSummary.totalPayroll)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted">เฉลี่ยต่อคน:</span>
              <span className="text-app font-semibold">
                {formatCurrency(reportSummary.totalPayroll / reportSummary.totalEmployees)}
              </span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-soft border border-app rounded-2xl p-6 shadow-xl"
        >
          <h3 className="text-lg font-semibold text-app mb-4 font-display">
            การจ้างงาน
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted">พนักงานใหม่เดือนนี้:</span>
              <span className="text-green-400 font-semibold">{reportSummary.newHires}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted">อัตราการเติบโต:</span>
              <span className="text-ptt-cyan font-semibold">+12%</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

