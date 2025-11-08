import { motion } from "framer-motion";
import { Users, Clock, Calendar, Wallet, TrendingUp, Download, AlertCircle, Timer } from "lucide-react";
import SummaryStats from "@/components/SummaryStats";
import ChartCard from "@/components/ChartCard";
import { reportSummary, attendanceChartData, departmentData, attendanceLogs, leaves, payroll } from "@/data/mockData";

export default function Reports() {
  // Calculate statistics
  const totalDays = attendanceLogs.length;
  const absentCount = attendanceLogs.filter(log => log.status === "ขาดงาน").length;
  const lateCount = attendanceLogs.filter(log => log.status.includes("สาย")).length;
  const absentRate = totalDays > 0 ? ((absentCount / totalDays) * 100).toFixed(1) : "0.0";
  const lateRate = totalDays > 0 ? ((lateCount / totalDays) * 100).toFixed(1) : "0.0";
  
  // Calculate OT hours (mock: assume 1 hour OT per 1000 baht OT pay, average OT rate 200 baht/hour)
  const totalOTAmount = payroll.reduce((sum, p) => sum + p.ot, 0);
  const avgOTRate = 200; // Average OT rate
  const totalOTHours = Math.round(totalOTAmount / avgOTRate);
  
  // Leave history count
  const totalLeaves = leaves.length;
  const approvedLeaves = leaves.filter(l => l.status === "อนุมัติแล้ว").length;

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
          <div className="h-64 flex items-center justify-center bg-soft rounded-xl">
            <div className="text-center">
              <p className="text-muted font-light mb-2">Attendance Trend</p>
              <div className="flex gap-4 justify-center text-sm">
                {attendanceChartData.map((data) => (
                  <div key={data.month} className="text-center">
                    <p className="text-muted text-xs mb-1">{data.month}</p>
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
                  <div className="w-24 text-right text-sm text-muted font-light">
                    {dept.name}
                  </div>
                  <div className="flex-1 bg-soft rounded-full h-6 overflow-hidden">
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-soft border border-app rounded-2xl p-6 shadow-xl"
        >
          <h3 className="text-lg font-semibold text-app mb-4 font-display flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-400" />
            อัตราการขาดงาน
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted">จำนวนครั้งที่ขาด:</span>
              <span className="text-red-400 font-semibold">{absentCount} ครั้ง</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted">อัตราการขาดงาน:</span>
              <span className="text-red-400 font-semibold">{absentRate}%</span>
            </div>
            <div className="pt-2 border-t border-app">
              <p className="text-xs text-muted">
                จากทั้งหมด {totalDays} วัน
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-soft border border-app rounded-2xl p-6 shadow-xl"
        >
          <h3 className="text-lg font-semibold text-app mb-4 font-display flex items-center gap-2">
            <Clock className="w-5 h-5 text-yellow-400" />
            การมาสาย
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted">จำนวนครั้งที่สาย:</span>
              <span className="text-yellow-400 font-semibold">{lateCount} ครั้ง</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted">อัตราการมาสาย:</span>
              <span className="text-yellow-400 font-semibold">{lateRate}%</span>
            </div>
            <div className="pt-2 border-t border-app">
              <p className="text-xs text-muted">
                จากทั้งหมด {totalDays} วัน
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-soft border border-app rounded-2xl p-6 shadow-xl"
        >
          <h3 className="text-lg font-semibold text-app mb-4 font-display flex items-center gap-2">
            <Timer className="w-5 h-5 text-green-400" />
            ชั่วโมง OT
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted">ชั่วโมง OT รวม:</span>
              <span className="text-green-400 font-semibold">{totalOTHours} ชั่วโมง</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted">ยอด OT รวม:</span>
              <span className="text-green-400 font-semibold font-mono">
                {formatCurrency(totalOTAmount)}
              </span>
            </div>
            <div className="pt-2 border-t border-app">
              <p className="text-xs text-muted">
                เฉลี่ย {totalOTHours > 0 ? Math.round(totalOTHours / payroll.length) : 0} ชม./คน
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-soft border border-app rounded-2xl p-6 shadow-xl"
        >
          <h3 className="text-lg font-semibold text-app mb-4 font-display flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-400" />
            ประวัติการลา
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted">การลาทั้งหมด:</span>
              <span className="text-blue-400 font-semibold">{totalLeaves} รายการ</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted">อนุมัติแล้ว:</span>
              <span className="text-green-400 font-semibold">{approvedLeaves} รายการ</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted">รออนุมัติ:</span>
              <span className="text-yellow-400 font-semibold">{reportSummary.pendingLeaves} รายการ</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Additional Stats - Original */}
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

