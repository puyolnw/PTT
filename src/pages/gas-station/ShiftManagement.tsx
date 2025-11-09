import { motion } from "framer-motion";
import { Clock, Users, Calendar, TrendingUp, AlertCircle, Plus } from "lucide-react";
import { useState } from "react";

// Mock data - Shift Management
const mockShiftData = {
  currentDate: "2024-12-15",
  shifts: [
    {
      id: "SHIFT-001",
      employee: "สมชาย ใจดี",
      employeeId: "EMP-001",
      branch: "สำนักงานใหญ่",
      shiftDate: "2024-12-15",
      shiftType: "เช้า",
      startTime: "06:00",
      endTime: "14:00",
      actualStart: "06:05",
      actualEnd: null,
      status: "working",
      otHours: 0,
      lateMinutes: 5,
      absent: false,
    },
    {
      id: "SHIFT-002",
      employee: "สมหญิง รักงาน",
      employeeId: "EMP-002",
      branch: "สาขา A",
      shiftDate: "2024-12-15",
      shiftType: "บ่าย",
      startTime: "14:00",
      endTime: "22:00",
      actualStart: "14:00",
      actualEnd: "22:00",
      status: "completed",
      otHours: 0,
      lateMinutes: 0,
      absent: false,
    },
    {
      id: "SHIFT-003",
      employee: "วิชัย ขยัน",
      employeeId: "EMP-003",
      branch: "สาขา B",
      shiftDate: "2024-12-15",
      shiftType: "ดึก",
      startTime: "22:00",
      endTime: "06:00",
      actualStart: null,
      actualEnd: null,
      status: "scheduled",
      otHours: 0,
      lateMinutes: 0,
      absent: false,
    },
    {
      id: "SHIFT-004",
      employee: "มาลี ขาดงาน",
      employeeId: "EMP-004",
      branch: "สาขา C",
      shiftDate: "2024-12-15",
      shiftType: "เช้า",
      startTime: "06:00",
      endTime: "14:00",
      actualStart: null,
      actualEnd: null,
      status: "absent",
      otHours: 0,
      lateMinutes: 0,
      absent: true,
    },
  ],
  summary: {
    totalEmployees: 4,
    working: 1,
    completed: 1,
    scheduled: 1,
    absent: 1,
    totalLate: 5,
    totalOT: 0,
  },
};

export default function ShiftManagement() {
  const [selectedDate, setSelectedDate] = useState(mockShiftData.currentDate);
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);

  const branches = Array.from(new Set(mockShiftData.shifts.map(s => s.branch)));
  const filteredShifts = selectedBranch
    ? mockShiftData.shifts.filter(s => s.branch === selectedBranch)
    : mockShiftData.shifts;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h2 className="text-3xl font-bold text-app mb-2 font-display">ระบบกะพนักงาน (Shift Management)</h2>
        <p className="text-muted font-light">
          บันทึกเข้า-ออกงาน, คำนวณ OT, ขาด, สาย → ส่งไป M3
        </p>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="panel rounded-2xl p-6 shadow-app"
        >
          <div className="flex items-center justify-between mb-4">
            <Users className="w-6 h-6 text-ptt-cyan" />
            <span className="text-xs text-muted">พนักงานทั้งหมด</span>
          </div>
          <p className="text-2xl font-bold text-app">
            {mockShiftData.summary.totalEmployees}
          </p>
          <p className="text-xs text-muted mt-1">คน</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="panel rounded-2xl p-6 shadow-app border-2 border-blue-500/30"
        >
          <div className="flex items-center justify-between mb-4">
            <Clock className="w-6 h-6 text-blue-400" />
            <span className="text-xs text-muted">กำลังทำงาน</span>
          </div>
          <p className="text-2xl font-bold text-blue-400">
            {mockShiftData.summary.working}
          </p>
          <p className="text-xs text-muted mt-1">คน</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="panel rounded-2xl p-6 shadow-app border-2 border-red-500/30"
        >
          <div className="flex items-center justify-between mb-4">
            <AlertCircle className="w-6 h-6 text-red-400" />
            <span className="text-xs text-muted">ขาดงาน</span>
          </div>
          <p className="text-2xl font-bold text-red-400">
            {mockShiftData.summary.absent}
          </p>
          <p className="text-xs text-muted mt-1">คน</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="panel rounded-2xl p-6 shadow-app"
        >
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="w-6 h-6 text-orange-400" />
            <span className="text-xs text-muted">สายรวม</span>
          </div>
          <p className="text-2xl font-bold text-orange-400">
            {mockShiftData.summary.totalLate}
          </p>
          <p className="text-xs text-muted mt-1">นาที</p>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="pl-10 pr-4 py-2 bg-soft border border-app rounded-xl text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue/30"
          />
        </div>
        <select
          value={selectedBranch || ""}
          onChange={(e) => setSelectedBranch(e.target.value || null)}
          className="px-4 py-2 bg-soft border border-app rounded-xl text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue/30"
        >
          <option value="">ทุกสาขา</option>
          {branches.map(branch => (
            <option key={branch} value={branch}>{branch}</option>
          ))}
        </select>
        <button className="flex items-center gap-2 px-4 py-2 bg-ptt-blue/10 hover:bg-ptt-blue/20 border border-ptt-blue/30 rounded-xl text-ptt-cyan transition-colors">
          <Plus className="w-5 h-5" />
          <span>เพิ่มกะใหม่</span>
        </button>
      </div>

      {/* Shifts List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="panel rounded-2xl p-6 shadow-app"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-app">รายการกะพนักงาน</h3>
            <p className="text-sm text-muted">
              วันที่: {new Date(selectedDate).toLocaleDateString("th-TH")}
            </p>
          </div>
          <Clock className="w-6 h-6 text-muted" />
        </div>
        <div className="space-y-3">
          {filteredShifts.map((shift) => (
            <div
              key={shift.id}
              className={`p-4 rounded-xl border-2 ${
                shift.status === "working"
                  ? "bg-blue-500/10 border-blue-500/30"
                  : shift.status === "completed"
                  ? "bg-emerald-500/10 border-emerald-500/30"
                  : shift.status === "absent"
                  ? "bg-red-500/10 border-red-500/30"
                  : "bg-soft border-app"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-semibold text-app">{shift.employee}</h4>
                    <span className="px-2 py-1 rounded-full bg-ptt-blue/10 text-ptt-cyan text-xs font-mono">
                      {shift.employeeId}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      shift.status === "working"
                        ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                        : shift.status === "completed"
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : shift.status === "absent"
                        ? "bg-red-500/20 text-red-400 border border-red-500/30"
                        : "bg-gray-500/20 text-gray-400 border border-gray-500/30"
                    }`}>
                      {shift.status === "working" ? "กำลังทำงาน" : 
                       shift.status === "completed" ? "เสร็จสิ้น" :
                       shift.status === "absent" ? "ขาดงาน" : "กำหนดการ"}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 text-sm">
                    <div>
                      <span className="text-muted">สาขา: </span>
                      <span className="text-app">{shift.branch}</span>
                    </div>
                    <div>
                      <span className="text-muted">กะ: </span>
                      <span className="text-app">{shift.shiftType}</span>
                    </div>
                    <div>
                      <span className="text-muted">เวลา: </span>
                      <span className="text-app">
                        {shift.startTime} - {shift.endTime}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted">เข้า-ออกจริง: </span>
                      <span className="text-app">
                        {shift.actualStart || "-"} - {shift.actualEnd || "-"}
                      </span>
                    </div>
                  </div>
                  {(shift.lateMinutes > 0 || shift.otHours > 0 || shift.absent) && (
                    <div className="mt-2 flex gap-2">
                      {shift.lateMinutes > 0 && (
                        <span className="px-2 py-1 rounded-full bg-orange-500/10 text-orange-400 text-xs border border-orange-500/30">
                          สาย {shift.lateMinutes} นาที
                        </span>
                      )}
                      {shift.otHours > 0 && (
                        <span className="px-2 py-1 rounded-full bg-purple-500/10 text-purple-400 text-xs border border-purple-500/30">
                          OT {shift.otHours} ชม.
                        </span>
                      )}
                      {shift.absent && (
                        <span className="px-2 py-1 rounded-full bg-red-500/10 text-red-400 text-xs border border-red-500/30">
                          ขาดงาน
                        </span>
                      )}
                    </div>
                  )}
                </div>
                {shift.status === "working" && (
                  <button className="ml-4 px-4 py-2 bg-ptt-blue/10 hover:bg-ptt-blue/20 border border-ptt-blue/30 rounded-xl text-ptt-cyan text-sm transition-colors">
                    บันทึกออกงาน
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Integration Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="panel rounded-2xl p-6 shadow-app bg-gradient-to-br from-ptt-blue/10 to-ptt-cyan/10 border border-ptt-blue/30"
      >
        <div className="flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-ptt-cyan mt-0.5" />
          <div>
            <h4 className="font-semibold text-app mb-2">การเชื่อมต่อกับ M3 (HR)</h4>
            <p className="text-sm text-muted">
              ข้อมูลกะ, OT, ขาด, สาย จะถูกส่งไปยังโมดูล M3 (HR) อัตโนมัติเพื่อคำนวณเงินเดือนและบันทึกการเข้างาน
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

