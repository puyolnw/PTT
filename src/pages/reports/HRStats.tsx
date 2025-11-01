import { motion } from "framer-motion";
import { Users, UserCheck, UserX, TrendingUp } from "lucide-react";
import { employees, attendanceLogs } from "@/data/mockData";

export default function HRStats() {
  const activeEmployees = employees.filter(e => e.status === "Active").length;
  const onLeave = employees.filter(e => e.status === "Leave").length;
  const lateCount = attendanceLogs.filter(a => a.status.includes("สาย")).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-ptt-cyan font-display">รายงานพนักงาน</h2>
        <p className="text-muted font-light">สถิติพนักงาน, การลา, มาสาย</p>
      </div>

      {/* Employee Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-ptt-blue/10 to-ptt-cyan/10 border border-ptt-blue/20 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-3">
            <Users className="w-8 h-8 text-ptt-cyan" strokeWidth={1.5} />
            <span className="text-xs text-muted">ทั้งหมด</span>
          </div>
          <div className="text-3xl font-bold text-app mb-1">{employees.length}</div>
          <p className="text-sm text-muted">คน</p>
        </div>

        <div className="bg-gradient-to-br from-green-500/10 to-green-400/10 border border-green-500/20 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-3">
            <UserCheck className="w-8 h-8 text-green-400" strokeWidth={1.5} />
            <span className="text-xs text-muted">ทำงานอยู่</span>
          </div>
          <div className="text-3xl font-bold text-app mb-1">{activeEmployees}</div>
          <p className="text-sm text-muted">คน</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-400/10 border border-yellow-500/20 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-3">
            <UserX className="w-8 h-8 text-yellow-400" strokeWidth={1.5} />
            <span className="text-xs text-muted">ลา/พักงาน</span>
          </div>
          <div className="text-3xl font-bold text-app mb-1">{onLeave}</div>
          <p className="text-sm text-muted">คน</p>
        </div>

        <div className="bg-gradient-to-br from-ptt-red/10 to-red-400/10 border border-ptt-red/20 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-3">
            <TrendingUp className="w-8 h-8 text-ptt-red" strokeWidth={1.5} />
            <span className="text-xs text-muted">มาสายเดือนนี้</span>
          </div>
          <div className="text-3xl font-bold text-app mb-1">{lateCount}</div>
          <p className="text-sm text-muted">ครั้ง</p>
        </div>
      </div>

      {/* Department Breakdown */}
      <div className="panel/40 border border-app rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-app mb-4 font-display">พนักงานแยกตามแผนก</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {["IT", "HR", "Account", "Marketing"].map((dept) => {
            const count = employees.filter(e => e.dept === dept).length;
            return (
              <div key={dept} className="bg-ink-800/40 rounded-xl p-4">
                <div className="text-sm text-muted mb-2">{dept}</div>
                <div className="text-2xl font-bold text-app">{count} คน</div>
                <div className="mt-2 h-2 bg-ink-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-ptt-blue to-ptt-cyan"
                    style={{ width: `${(count / employees.length) * 100}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Attendance Summary */}
      <div className="panel/40 border border-app rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-app mb-4 font-display">สรุปการเข้างาน (7 วันล่าสุด)</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-ink-800/60">
              <tr className="border-b border-app">
                <th className="px-6 py-3 text-left text-sm font-semibold text-app">วันที่</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-app">ตรงเวลา</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-app">สาย</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-app">ขาด</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {attendanceLogs.slice(0, 7).map((log) => (
                <tr key={log.id} className="hover:bg-soft">
                  <td className="px-6 py-3 text-sm text-app">{log.date}</td>
                  <td className="px-6 py-3 text-center">
                    <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg text-sm font-semibold">
                      {log.status === "ตรงเวลา" ? "✓" : "-"}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-center">
                    <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-lg text-sm font-semibold">
                      {log.status.includes("สาย") ? "!" : "-"}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-center">
                    <span className="px-3 py-1 bg-ptt-red/20 text-ptt-red rounded-lg text-sm font-semibold">
                      {log.status === "ขาดงาน" ? "✗" : "-"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Chart Placeholder */}
      <div className="panel/40 border border-app rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-app mb-4 font-display">แนวโน้มการเข้างานรายเดือน</h3>
        <div className="h-64 flex items-center justify-center border-2 border-dashed border-app rounded-xl">
          <p className="text-muted">📊 Chart Placeholder (ใช้ Recharts/Chart.js)</p>
        </div>
      </div>
    </motion.div>
  );
}

