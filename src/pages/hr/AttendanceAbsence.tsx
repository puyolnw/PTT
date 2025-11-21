import { useMemo, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AlertTriangle, Users, Calendar, ArrowLeft, BarChart3, Activity, TrendingUp, FileText } from "lucide-react";
import { attendanceLogs, employees } from "@/data/mockData";

interface EmployeeAbsenceStat {
  empCode: string;
  empName: string;
  dept?: string;
  category?: string | null;
  status?: string;
  absentCount: number;
  leaveCount: number;
  totalRecords: number;
  lastAbsent?: string;
  lastLeave?: string;
  impactScore: number;
}

export default function AttendanceAbsenceDashboard() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const {
    totalAbsences,
    totalLeaves,
    employeesWithAbsence,
    topAbsentees,
    statsList,
    recentAbsenceLogs,
  } = useMemo(() => {
    const statsMap: Record<string, EmployeeAbsenceStat> = {};

    const sortedLogs = [...attendanceLogs].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    sortedLogs.forEach((log) => {
      const employee = employees.find((emp) => emp.code === log.empCode);
      if (!employee) return;
      if (!statsMap[log.empCode]) {
        statsMap[log.empCode] = {
          empCode: log.empCode,
          empName: log.empName,
          dept: employee.dept,
          category: employee.category,
          status: employee.status,
          absentCount: 0,
          leaveCount: 0,
          totalRecords: 0,
          impactScore: 0,
        };
      }

      const stat = statsMap[log.empCode];
      stat.totalRecords += 1;

      if (log.status === "ขาดงาน") {
        stat.absentCount += 1;
        stat.impactScore += 3;
        if (!stat.lastAbsent) {
          stat.lastAbsent = log.date;
        }
      } else if (log.status === "ลา") {
        stat.leaveCount += 1;
        stat.impactScore += 1;
        if (!stat.lastLeave) {
          stat.lastLeave = log.date;
        }
      }
    });

    const statsList = Object.values(statsMap).filter(
      (stat) => stat.absentCount > 0 || stat.leaveCount > 0
    );

    statsList.sort((a, b) => b.impactScore - a.impactScore);

    const topAbsentees = statsList.slice(0, 10);
    const totalAbsences = statsList.reduce((sum, stat) => sum + stat.absentCount, 0);
    const totalLeaves = statsList.reduce((sum, stat) => sum + stat.leaveCount, 0);
    const employeesWithAbsence = statsList.length;
    const recentAbsenceLogs = sortedLogs
      .filter((log) => log.status === "ขาดงาน" || log.status === "ลา")
      .slice(0, 8);

    return {
      totalAbsences,
      totalLeaves,
      topAbsentees,
      employeesWithAbsence,
      statsList,
      recentAbsenceLogs,
    };
  }, []);

  const departments = useMemo(
    () => Array.from(new Set(statsList.map((stat) => stat.dept).filter(Boolean))) as string[],
    [statsList]
  );
  const statuses = useMemo(
    () => Array.from(new Set(statsList.map((stat) => stat.status).filter(Boolean))) as string[],
    [statsList]
  );
  const categories = useMemo(
    () => Array.from(new Set(statsList.map((stat) => stat.category).filter(Boolean))) as string[],
    [statsList]
  );

  const filteredStats = useMemo(() => {
    let filtered = statsList;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (stat) =>
          stat.empName.toLowerCase().includes(query) ||
          stat.empCode.toLowerCase().includes(query) ||
          (stat.dept && stat.dept.toLowerCase().includes(query))
      );
    }
    if (deptFilter) {
      filtered = filtered.filter((stat) => stat.dept === deptFilter);
    }
    if (statusFilter) {
      filtered = filtered.filter((stat) => stat.status === statusFilter);
    }
    if (categoryFilter) {
      filtered = filtered.filter((stat) => stat.category === categoryFilter);
    }
    return filtered;
  }, [statsList, searchQuery, deptFilter, statusFilter, categoryFilter]);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/app/hr/attendance", { replace: true });
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-app mb-2 font-display flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-red-500" />
            สรุปพนักงานขาด / ลา
          </h1>
          <p className="text-muted font-light">
            แสดงภาพรวมพนักงานที่มีการขาดงานและการลา พร้อมสถิติเปรียบเทียบ
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-2 px-4 py-2 bg-soft border border-app rounded-xl text-app font-medium hover:bg-soft/80"
          >
            <ArrowLeft className="w-4 h-4" />
            กลับไปหน้าบันทึกเวลา
          </button>
          <button
            onClick={() => {
              const csvHeader = `"รหัส","ชื่อ-สกุล","แผนก","ขาดงาน","ลา","คะแนนผลกระทบ"\n`;
              const csvBody = topAbsentees
                .map(
                  (stat) =>
                    `"${stat.empCode}","${stat.empName}","${stat.dept || ""}",${stat.absentCount},${stat.leaveCount},${stat.impactScore}`
                )
                .join("\n");
              const blob = new Blob([csvHeader + csvBody], { type: "text/csv;charset=utf-8;" });
              const link = document.createElement("a");
              link.href = URL.createObjectURL(blob);
              link.setAttribute("download", `attendance_absence_${new Date().toISOString().split("T")[0]}.csv`);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-ptt-cyan text-app rounded-xl font-semibold hover:bg-ptt-cyan/80 shadow"
          >
            <FileText className="w-4 h-4" />
            ดาวน์โหลดรายงาน
          </button>
        </div>
      </div>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard
          icon={<AlertTriangle className="w-6 h-6 text-red-500" />}
          title="จำนวนการขาดงาน"
          value={`${totalAbsences} ครั้ง`}
          subtitle="รวมขาดงานทั้งหมดในช่วงข้อมูล"
        />
        <DashboardCard
          icon={<Calendar className="w-6 h-6 text-yellow-500" />}
          title="จำนวนการลา"
          value={`${totalLeaves} ครั้ง`}
          subtitle="รวมคำขอลาทั้งหมด"
        />
        <DashboardCard
          icon={<Users className="w-6 h-6 text-orange-500" />}
          title="พนักงานที่มีประวัติขาด/ลา"
          value={`${employeesWithAbsence} คน`}
          subtitle="มีการขาด/ลา อย่างน้อย 1 ครั้ง"
        />
        <DashboardCard
          icon={<Activity className="w-6 h-6 text-ptt-cyan" />}
          title="Top Impact Score"
          value={`${topAbsentees[0]?.impactScore || 0} คะแนน`}
          subtitle={topAbsentees[0] ? topAbsentees[0].empName : "ไม่มีข้อมูล"}
        />
      </div>

      {/* Top Absentees */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-soft border border-app rounded-2xl shadow-xl overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-app flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-app font-display">พนักงานที่ขาด/ลาสูงสุด</h3>
              <p className="text-xs text-muted">จัดอันดับด้วย Impact Score (ขาด=3, ลา=1)</p>
            </div>
            <p className="text-xs text-muted">แสดง {filteredStats.length} จาก {statsList.length} คน</p>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="ค้นหาชื่อหรือรหัสพนักงาน..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-soft border border-app rounded-xl text-app placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-ptt-blue focus:border-transparent transition-all font-light"
              />
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div className="flex flex-wrap gap-3">
              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="px-4 py-2.5 bg-soft border border-app rounded-xl text-app text-sm min-w-[150px] focus:outline-none focus:ring-2 focus:ring-ptt-blue focus:border-transparent transition-all cursor-pointer hover:border-app/50"
              >
                <option value="">ทุกแผนก</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2.5 bg-soft border border-app rounded-xl text-app text-sm min-w-[150px] focus:outline-none focus:ring-2 focus:ring-ptt-blue focus:border-transparent transition-all cursor-pointer hover:border-app/50"
              >
                <option value="">ทุกสถานะ</option>
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2.5 bg-soft border border-app rounded-xl text-app text-sm min-w-[150px] focus:outline-none focus:ring-2 focus:ring-ptt-blue focus:border-transparent transition-all cursor-pointer hover:border-app/50"
              >
                <option value="">ทุกหมวดหมู่</option>
                {categories.map((category) => (
                  <option key={category} value={category || ""}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-soft border-b border-app">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted">#</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted">พนักงาน</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted">แผนก</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-muted">ขาดงาน</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-muted">ลา</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-muted">Impact Score</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted">ครั้งล่าสุด</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-app">
              {filteredStats.map((stat, index) => (
                <tr key={stat.empCode} className="hover:bg-soft/50 transition-colors">
                  <td className="px-4 py-3 text-left text-xs text-muted">{index + 1}</td>
                  <td className="px-4 py-3">
                    <p className="text-app font-medium">{stat.empName}</p>
                    <p className="text-xs text-muted">{stat.empCode}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-ptt-cyan">{stat.dept || "-"}</td>
                  <td className="px-4 py-3 text-center text-red-500 font-semibold">{stat.absentCount}</td>
                  <td className="px-4 py-3 text-center text-yellow-500 font-semibold">{stat.leaveCount}</td>
                  <td className="px-4 py-3 text-center text-app font-semibold">{stat.impactScore}</td>
                  <td className="px-4 py-3 text-xs text-muted">
                    {stat.lastAbsent
                      ? `ขาด: ${new Date(stat.lastAbsent).toLocaleDateString("th-TH")}`
                      : stat.lastLeave
                      ? `ลา: ${new Date(stat.lastLeave).toLocaleDateString("th-TH")}`
                      : "-"}
                  </td>
                </tr>
              ))}
              {filteredStats.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-muted">
                    ไม่พบข้อมูลการขาด/ลา
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Recent Absence Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-soft border border-app rounded-2xl shadow-xl p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-app font-display flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-orange-500" />
            รายการขาด/ลาล่าสุด
          </h3>
        </div>
        <div className="space-y-3">
          {recentAbsenceLogs.map((log) => (
            <div
              key={`${log.empCode}-${log.date}`}
              className="flex items-center justify-between bg-soft/60 border border-app rounded-xl px-4 py-3"
            >
              <div>
                <p className="text-sm font-semibold text-app">{log.empName}</p>
                <p className="text-xs text-muted">{log.empCode}</p>
              </div>
              <div className="text-right">
                <p
                  className={`text-sm font-semibold ${
                    log.status === "ขาดงาน" ? "text-red-500" : "text-yellow-500"
                  }`}
                >
                  {log.status}
                </p>
                <p className="text-xs text-muted">{new Date(log.date).toLocaleDateString("th-TH")}</p>
              </div>
            </div>
          ))}
          {recentAbsenceLogs.length === 0 && (
            <p className="text-center text-muted text-sm">ไม่มีรายการล่าสุด</p>
          )}
        </div>
      </motion.div>
    </div>
  );
}

type DashboardCardProps = {
  icon: ReactNode;
  title: string;
  value: string;
  subtitle: string;
};

const DashboardCard = ({ icon, title, value, subtitle }: DashboardCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-soft border border-app rounded-2xl p-4 shadow"
  >
    <div className="flex items-center gap-3 mb-2">
      <div className="p-2 bg-soft border border-app rounded-lg">{icon}</div>
      <div>
        <p className="text-xs text-muted">{title}</p>
        <p className="text-xl font-bold text-app">{value}</p>
        <p className="text-[11px] text-muted mt-1">{subtitle}</p>
      </div>
    </div>
  </motion.div>
);

