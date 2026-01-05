import { motion } from "framer-motion";
import { Clock, Calendar, TrendingUp, AlertTriangle } from "lucide-react";
import { attendanceLogs, employees } from "@/data/mockData";

export default function AttendanceReport() {
  const onTimeCount = attendanceLogs.filter(a => a.status === "ตรงเวลา").length;
  const lateCount = attendanceLogs.filter(a => a.status.includes("สาย")).length;
  const absentCount = attendanceLogs.filter(a => a.status === "ขาดงาน").length;
  const totalLogs = attendanceLogs.length;
  const attendanceRate = ((onTimeCount + lateCount) / totalLogs * 100).toFixed(1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-ptt-cyan font-display">รายงานการมาทำงาน</h2>
        <p className="text-muted font-light">การเข้าออกงานรายเดือน</p>
      </div>

      {/* Attendance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-ptt-blue/10 to-ptt-cyan/10 border border-ptt-blue/20 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-3">
            <Calendar className="w-8 h-8 text-ptt-cyan" strokeWidth={1.5} />
            <span className="text-xs text-muted">อัตราเข้างาน</span>
          </div>
          <div className="text-3xl font-bold text-app mb-1">{attendanceRate}%</div>
          <p className="text-sm text-muted">ของทั้งหมด</p>
        </div>

        <div className="bg-gradient-to-br from-green-500/10 to-green-400/10 border border-green-500/20 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-3">
            <TrendingUp className="w-8 h-8 text-green-400" strokeWidth={1.5} />
            <span className="text-xs text-muted">ตรงเวลา</span>
          </div>
          <div className="text-3xl font-bold text-app mb-1">{onTimeCount}</div>
          <p className="text-sm text-muted">ครั้ง</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-400/10 border border-yellow-500/20 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-3">
            <Clock className="w-8 h-8 text-yellow-400" strokeWidth={1.5} />
            <span className="text-xs text-muted">มาสาย</span>
          </div>
          <div className="text-3xl font-bold text-app mb-1">{lateCount}</div>
          <p className="text-sm text-muted">ครั้ง</p>
        </div>

        <div className="bg-gradient-to-br from-ptt-red/10 to-red-400/10 border border-ptt-red/20 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-3">
            <AlertTriangle className="w-8 h-8 text-ptt-red" strokeWidth={1.5} />
            <span className="text-xs text-muted">ขาดงาน</span>
          </div>
          <div className="text-3xl font-bold text-app mb-1">{absentCount}</div>
          <p className="text-sm text-muted">ครั้ง</p>
        </div>
      </div>

      {/* Attendance by Department */}
      <div className="panel/40 border border-app rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-app mb-4 font-display">การเข้างานแยกตามแผนก</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {["IT", "HR", "Account", "Marketing"].map((dept) => {
            const deptEmployees = employees.filter(e => e.dept === dept);
            const deptLogs = attendanceLogs.filter(log =>
              deptEmployees.some(emp => emp.code === log.empCode)
            );
            const onTime = deptLogs.filter(l => l.status === "ตรงเวลา").length;
            const rate = deptLogs.length > 0 ? ((onTime / deptLogs.length) * 100).toFixed(0) : 0;

            return (
              <div key={dept} className="bg-ink-800/40 rounded-xl p-4">
                <div className="text-sm text-muted mb-2">{dept}</div>
                <div className="text-2xl font-bold text-app mb-1">{rate}%</div>
                <div className="text-xs text-muted mb-3">ตรงเวลา</div>
                <div className="h-2 bg-ink-700 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-green-500 to-green-400 w-[var(--rate-width)]"
                    style={{ "--rate-width": `${rate}%` } as React.CSSProperties}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Attendance Logs */}
      <div className="panel/40 border border-app rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-app mb-4 font-display">บันทึกการเข้างานล่าสุด</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-ink-800/60">
              <tr className="border-b border-app">
                <th className="px-6 py-3 text-left text-sm font-semibold text-app">รหัสพนักงาน</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-app">ชื่อ</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-app">วันที่</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-app">เวลาเข้า</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-app">เวลาออก</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-app">สถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {attendanceLogs.slice(0, 10).map((log) => (
                <tr key={log.id} className="hover:bg-soft">
                  <td className="px-6 py-3 text-sm text-muted font-mono">{log.empCode}</td>
                  <td className="px-6 py-3 text-sm text-app">{log.empName}</td>
                  <td className="px-6 py-3 text-sm text-muted">{log.date}</td>
                  <td className="px-6 py-3 text-center text-sm text-app font-mono">{log.checkIn}</td>
                  <td className="px-6 py-3 text-center text-sm text-app font-mono">{log.checkOut}</td>
                  <td className="px-6 py-3 text-center">
                    <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${log.status === "ตรงเวลา" ? "bg-green-500/20 text-green-400" :
                      log.status.includes("สาย") ? "bg-yellow-500/20 text-yellow-400" :
                        log.status === "ขาดงาน" ? "bg-ptt-red/20 text-ptt-red" :
                          "bg-blue-500/20 text-blue-400"
                      }`}>
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Attendance Trend Chart Placeholder */}
      <div className="panel/40 border border-app rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-app mb-4 font-display">แนวโน้มการเข้างานรายสัปดาห์</h3>
        <div className="h-64 flex items-center justify-center border-2 border-dashed border-app rounded-xl">
          <p className="text-muted">📊 Chart Placeholder (ใช้ Recharts/Chart.js)</p>
        </div>
      </div>
    </motion.div>
  );
}

