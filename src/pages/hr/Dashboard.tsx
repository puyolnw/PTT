import { motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  CalendarClock,
  Clock,
  ClipboardCheck,
  DollarSign,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  employees,
  attendanceLogs,
  leaves,
  payroll,
  evaluations,
  shifts,
} from "../../data/mockData";

const numberFormatter = new Intl.NumberFormat("th-TH");
const decimalFormatter = new Intl.NumberFormat("th-TH", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});
const currencyFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 0,
});

const statusStyles: Record<string, string> = {
  ตรงเวลา: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30",
  "สาย 1 นาที": "bg-amber-500/10 text-amber-400 border border-amber-500/30",
  "สาย 5 นาที": "bg-amber-500/10 text-amber-400 border border-amber-500/30",
  "สาย 15 นาที": "bg-orange-500/10 text-orange-400 border border-orange-500/30",
  ลา: "bg-sky-500/10 text-sky-400 border border-sky-500/30",
  ขาดงาน: "bg-rose-500/10 text-rose-400 border border-rose-500/30",
};

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

import { useBranch } from "@/contexts/BranchContext";

// ... (other codes)

export default function Dashboard() {
  const { selectedBranches } = useBranch();

  // Filter Data based on Branch
  const filteredEmployees = employees.filter((emp) =>
    selectedBranches.includes(String(emp.branchId))
  );
  const filteredEmployeeCodes = new Set(filteredEmployees.map((e) => e.code));

  const filteredAttendanceLogs = attendanceLogs.filter((log) =>
    filteredEmployeeCodes.has(log.empCode)
  );

  const filteredLeaves = leaves.filter((leave) =>
    filteredEmployeeCodes.has(leave.empCode)
  );

  const filteredPayroll = payroll.filter((slip) =>
    filteredEmployeeCodes.has(slip.empCode)
  );

  const filteredEvaluations = evaluations.filter((ev) =>
    filteredEmployeeCodes.has(ev.empCode)
  );

  const totalEmployees = filteredEmployees.length;
  const activeEmployees = filteredEmployees.filter((emp) => emp.status === "Active").length;
  const leaveEmployees = filteredEmployees.filter((emp) => emp.status === "Leave").length;
  const resignedEmployees = filteredEmployees.filter((emp) => emp.status === "Resigned").length;
  const departments = Array.from(new Set(filteredEmployees.map((emp) => emp.dept)));

  const latestAttendanceDate = filteredAttendanceLogs.reduce((latest, log) => {
    if (!latest) return log.date;
    return log.date > latest ? log.date : latest;
  }, "");
  const referenceDate = latestAttendanceDate ? new Date(latestAttendanceDate) : new Date();

  const attendanceToday = filteredAttendanceLogs.filter((log) => log.date === latestAttendanceDate);
  const lateEmployees = attendanceToday.filter((log) => log.status.includes("สาย"));
  const absentEmployees = attendanceToday.filter(
    (log) => log.status === "ลา" || log.status === "ขาดงาน",
  );
  const totalOtHours = attendanceToday.reduce((sum, log) => sum + (log.otHours ?? 0), 0);
  const totalOtAmount = attendanceToday.reduce((sum, log) => sum + (log.otAmount ?? 0), 0);

  const pendingLeaves = filteredLeaves.filter((leave) => leave.status === "รอผู้จัดการ" || leave.status === "รอ HR" || leave.status === "รอหัวหน้าสถานี");
  const upcomingLeaves = filteredLeaves
    .filter((leave) => new Date(leave.fromDate) >= referenceDate)
    .sort((a, b) => (a.fromDate > b.fromDate ? 1 : -1));

  const latestPayrollMonth = filteredPayroll.reduce((latest, slip) => {
    if (!latest) return slip.month;
    return slip.month > latest ? slip.month : latest;
  }, "");

  const payrollLatest = filteredPayroll.filter((slip) => slip.month === latestPayrollMonth);
  const netPayroll = payrollLatest.reduce((sum, slip) => sum + slip.net, 0);
  const averageSalary = payrollLatest.reduce((sum, slip) => sum + slip.salary, 0) /
    (payrollLatest.length || 1);

  const departmentDistribution = departments
    .map((dept) => {
      const count = filteredEmployees.filter((emp) => emp.dept === dept).length;
      return {
        dept,
        count,
        percentage: (count / totalEmployees) * 100,
      };
    })
    .sort((a, b) => b.count - a.count);

  const topEvaluations = filteredEvaluations
    .slice()
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  const shiftCoverage = shifts.map((shift) => {
    const assignedEmployees = employees.filter((emp) => emp.shiftId === shift.id).length;
    return {
      ...shift,
      assignedEmployees,
    };
  });

  const overviewStats = [
    {
      title: "พนักงานทั้งหมด",
      value: numberFormatter.format(totalEmployees),
      subtitle: `${numberFormatter.format(activeEmployees)} ปฏิบัติงาน • ${numberFormatter.format(leaveEmployees)} ลา • ${numberFormatter.format(resignedEmployees)} ลาออก`,
      icon: Users,
      gradient: "from-ptt-blue to-ptt-cyan",
    },
    {
      title: "การทำงาน OT วันนี้",
      value: `${decimalFormatter.format(totalOtHours)} ชม.`,
      subtitle: currencyFormatter.format(totalOtAmount),
      icon: Activity,
      gradient: "from-purple-500 to-pink-500",
    },
    {
      title: "การลาที่รออนุมัติ",
      value: numberFormatter.format(pendingLeaves.length),
      subtitle: `${numberFormatter.format(upcomingLeaves.length)} รายการกำลังจะมาถึง`,
      icon: CalendarClock,
      gradient: "from-orange-500 to-red-500",
    },
    {
      title: "พนักงานสาย / ขาด",
      value: numberFormatter.format(lateEmployees.length + absentEmployees.length),
      subtitle: `${numberFormatter.format(lateEmployees.length)} สาย • ${numberFormatter.format(absentEmployees.length)} ลา/ขาด`,
      icon: AlertTriangle,
      gradient: "from-green-500 to-emerald-500",
    },
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h2 className="text-3xl font-bold text-app mb-2 font-display">ระบบพนักงาน</h2>
        <p className="text-muted font-light">
          ภาพรวมการปฏิบัติงาน สถานะพนักงาน และข้อมูลประกอบการตัดสินใจล่าสุด
        </p>
        <p className="text-xs text-muted/70">
          ข้อมูลอ้างอิงจากวันที่ {latestAttendanceDate || "-"}
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {overviewStats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="panel rounded-2xl p-6 hover:border-ptt-blue/30 transition-all duration-200 shadow-app"
          >
            <div className="flex items-center justify-between mb-5">
              <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient}`}>
                <stat.icon className="w-6 h-6 text-app" />
              </div>
              <TrendingUp className="w-5 h-5 text-muted" />
            </div>
            <h3 className="text-muted text-sm mb-2">{stat.title}</h3>
            <p className="text-2xl font-bold text-app mb-1">{stat.value}</p>
            <p className="text-sm text-muted">{stat.subtitle}</p>
          </motion.div>
        ))}
      </div>



      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="panel rounded-2xl p-6 shadow-app xl:col-span-2"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-semibold text-app">ภาพรวมการเข้างาน</h3>
              <p className="text-sm text-muted">สรุปข้อมูลการลงเวลาในวันล่าสุด</p>
            </div>
            <Clock className="w-6 h-6 text-muted" />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="rounded-xl bg-soft border-app p-4">
              <p className="text-sm text-muted">บันทึกทั้งหมด</p>
              <p className="text-lg font-semibold text-app">
                {numberFormatter.format(attendanceToday.length)} รายการ
              </p>
            </div>
            <div className="rounded-xl bg-soft border-app p-4">
              <p className="text-sm text-muted">เข้า &quot;ตรงเวลา&quot;</p>
              <p className="text-lg font-semibold text-app">
                {numberFormatter.format(attendanceToday.length - lateEmployees.length - absentEmployees.length)} คน
              </p>
            </div>
            <div className="rounded-xl bg-soft border-app p-4">
              <p className="text-sm text-muted">สาย</p>
              <p className="text-lg font-semibold text-amber-400">
                {numberFormatter.format(lateEmployees.length)} คน
              </p>
            </div>
            <div className="rounded-xl bg-soft border-app p-4">
              <p className="text-sm text-muted">ลา / ขาด</p>
              <p className="text-lg font-semibold text-rose-400">
                {numberFormatter.format(absentEmployees.length)} คน
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {attendanceToday.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between p-4 bg-soft rounded-xl border-app"
              >
                <div>
                  <p className="font-medium text-app">{log.empName}</p>
                  <p className="text-sm text-muted">
                    เข้างาน {log.checkIn} • ออกงาน {log.checkOut}
                  </p>
                </div>
                <span
                  className={`px-4 py-1 text-xs font-medium rounded-full ${statusStyles[log.status] ?? "bg-muted/10 text-muted border border-muted/20"
                    }`}
                >
                  {log.status}
                </span>
              </div>
            ))}
            {attendanceToday.length === 0 && (
              <div className="p-6 text-center bg-soft rounded-xl border-app text-sm text-muted">
                ยังไม่มีข้อมูลบันทึกเวลาในวันล่าสุด
              </div>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="panel rounded-2xl p-6 shadow-app"
        >
          <h3 className="text-xl font-semibold mb-4 text-app">สรุปคำขอและกะงาน</h3>
          <div className="space-y-5">
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-app">คำขอลาที่รออนุมัติ</p>
                <CalendarClock className="w-5 h-5 text-muted" />
              </div>
              <div className="space-y-3">
                {pendingLeaves.slice(0, 3).map((leave) => (
                  <div
                    key={leave.id}
                    className="p-3 bg-soft rounded-lg border-app"
                  >
                    <p className="text-sm font-semibold text-app">{leave.empName}</p>
                    <p className="text-xs text-muted">
                      {leave.type} • {leave.fromDate} - {leave.toDate}
                    </p>
                  </div>
                ))}
                {pendingLeaves.length === 0 && (
                  <p className="text-sm text-muted">ไม่มีคำขอใหม่ในขณะนี้</p>
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-app">การจัดกะทำงาน</p>
                <ClipboardCheck className="w-5 h-5 text-muted" />
              </div>
              <div className="space-y-3">
                {shiftCoverage.map((shift) => (
                  <div
                    key={shift.id}
                    className="flex items-center justify-between text-sm bg-soft rounded-lg border-app px-3 py-2"
                  >
                    <div>
                      <p className="font-medium text-app">กะ{shift.name}</p>
                      <p className="text-xs text-muted">
                        {shift.startTime} - {shift.endTime}
                      </p>
                    </div>
                    <span className="text-muted text-xs">
                      {numberFormatter.format(shift.assignedEmployees)} คน
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="panel rounded-2xl p-6 shadow-app"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-app">โครงสร้างฝ่ายงาน</h3>
            <Users className="w-5 h-5 text-muted" />
          </div>
          <div className="space-y-4">
            {departmentDistribution.map((dept) => (
              <div key={dept.dept}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <p className="text-app font-medium">{dept.dept}</p>
                  <span className="text-muted">
                    {numberFormatter.format(dept.count)} คน
                  </span>
                </div>
                <div className="h-2 bg-soft rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-ptt-blue to-ptt-cyan w-[var(--dept-width)]"
                    style={{ "--dept-width": `${dept.percentage}%` } as React.CSSProperties}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="panel rounded-2xl p-6 shadow-app"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-app">สรุปเงินเดือน</h3>
            <DollarSign className="w-5 h-5 text-muted" />
          </div>
          <p className="text-sm text-muted mb-3">
            รอบจ่ายล่าสุด: {latestPayrollMonth ? formatMonthLabel(latestPayrollMonth) : "-"}
          </p>
          <div className="space-y-4">
            <div className="bg-soft border-app rounded-xl p-4">
              <p className="text-sm text-muted">ยอดสุทธิ</p>
              <p className="text-lg font-semibold text-app">
                {currencyFormatter.format(netPayroll)}
              </p>
            </div>
            <div className="bg-soft border-app rounded-xl p-4">
              <p className="text-sm text-muted">เงินเดือนเฉลี่ย</p>
              <p className="text-lg font-semibold text-app">
                {currencyFormatter.format(averageSalary || 0)}
              </p>
            </div>
            <div className="bg-soft border-app rounded-xl p-4">
              <p className="text-sm text-muted">จำนวนสลิป</p>
              <p className="text-lg font-semibold text-app">
                {numberFormatter.format(payrollLatest.length)} รายการ
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="panel rounded-2xl p-6 shadow-app"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-app">ผลงานโดดเด่น</h3>
            <Activity className="w-5 h-5 text-muted" />
          </div>
          <div className="space-y-3">
            {topEvaluations.map((evaluation) => (
              <div
                key={evaluation.id}
                className="p-4 bg-soft rounded-xl border-app"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-app">{evaluation.empName}</p>
                  <span className="text-xs text-muted">{evaluation.round} / {evaluation.year}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted">คะแนน {evaluation.score}</span>
                  <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    {evaluation.status}
                  </span>
                </div>
                {evaluation.comment && (
                  <p className="text-xs text-muted mt-2">“{evaluation.comment}”</p>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

