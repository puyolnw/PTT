import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, Edit2, Clock, CheckCircle, AlertCircle, TrendingUp, Users, Plus, Timer, Play, Pause } from "lucide-react";
import FilterBar from "@/components/FilterBar";
import ModalForm from "@/components/ModalForm";
import StatusTag, { getStatusVariant } from "@/components/StatusTag";
import { attendanceLogs as initialAttendanceLogs, employees, shifts, type AttendanceLog } from "@/data/mockData";

export default function Attendance() {
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceLog[]>(initialAttendanceLogs);
  const [filteredLogs, setFilteredLogs] = useState<AttendanceLog[]>(attendanceLogs);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [shiftFilter, setShiftFilter] = useState<number | "">("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AttendanceLog | null>(null);
  const [editForm, setEditForm] = useState({
    checkIn: "",
    checkOut: "",
    reason: "",
    status: "" as AttendanceLog["status"] | ""
  });
  const [recordForm, setRecordForm] = useState({
    empCode: "",
    empName: "",
    date: "",
    checkIn: "",
    checkOut: "",
    otHours: "",
    reason: ""
  });

  // Standard work time: 08:30
  const STANDARD_CHECK_IN = "08:30";
  const STANDARD_CHECK_OUT = "17:00";

  // Get employee's shift
  const getEmployeeShift = (empCode: string) => {
    const employee = employees.find(e => e.code === empCode);
    if (employee && employee.shiftId) {
      return shifts.find(s => s.id === employee.shiftId);
    }
    return shifts[0]; // Default to morning shift
  };

  // Get employee's OT rate
  const getEmployeeOTRate = (empCode: string): number => {
    const employee = employees.find(e => e.code === empCode);
    return employee?.otRate || 0;
  };

  // Calculate OT hours based on shift
  const calculateOTHours = (empCode: string, checkIn: string, checkOut: string): number => {
    if (checkIn === "-" || checkOut === "-") return 0;
    
    const shift = getEmployeeShift(empCode);
    if (!shift) return 0;

    const [inHour, inMin] = checkIn.split(":").map(Number);
    const [outHour, outMin] = checkOut.split(":").map(Number);
    const [shiftStartHour, shiftStartMin] = shift.startTime.split(":").map(Number);
    const [shiftEndHour, shiftEndMin] = shift.endTime.split(":").map(Number);

    const inMinutes = inHour * 60 + inMin;
    const outMinutes = outHour * 60 + outMin;
    const shiftStartMinutes = shiftStartHour * 60 + shiftStartMin;
    const shiftEndMinutes = shiftEndHour * 60 + shiftEndMin;

    // Handle overnight shifts
    let shiftEnd = shiftEndMinutes;
    if (shiftEndMinutes < shiftStartMinutes) {
      shiftEnd = shiftEndMinutes + (24 * 60);
    }

    // Calculate actual working hours
    let actualEnd = outMinutes;
    if (outMinutes < inMinutes) {
      actualEnd = outMinutes + (24 * 60);
    }

    const actualWorkingMinutes = actualEnd - inMinutes;
    const shiftDurationMinutes = shiftEnd - shiftStartMinutes;

    // OT = actual working hours - shift duration
    const otMinutes = actualWorkingMinutes - shiftDurationMinutes;
    return otMinutes > 0 ? otMinutes / 60 : 0;
  };

  // Calculate status based on check-in time and shift
  const calculateStatus = (checkIn: string, currentStatus: AttendanceLog["status"], empCode?: string): AttendanceLog["status"] => {
    // If already on leave, keep it
    if (currentStatus === "ลา") {
      return "ลา";
    }

    // If no check-in, it's absent
    if (!checkIn || checkIn === "-") {
      return "ขาดงาน";
    }

    // Get shift time for employee
    const shift = empCode ? getEmployeeShift(empCode) : null;
    const standardTime = shift ? shift.startTime : STANDARD_CHECK_IN;

    // Parse time
    const [checkInHour, checkInMinute] = checkIn.split(":").map(Number);
    const [standardHour, standardMinute] = standardTime.split(":").map(Number);

    const checkInTime = checkInHour * 60 + checkInMinute;
    const standardTimeMinutes = standardHour * 60 + standardMinute;

    // Handle overnight shifts
    let lateMinutes = checkInTime - standardTimeMinutes;
    if (shift && shift.endTime < shift.startTime) {
      // For overnight shifts, check if check-in is after midnight
      if (checkInTime < standardTimeMinutes) {
        lateMinutes = checkInTime + (24 * 60) - standardTimeMinutes;
      }
    }

    if (lateMinutes <= 0) {
      return "ตรงเวลา";
    } else if (lateMinutes === 1) {
      return "สาย 1 นาที";
    } else if (lateMinutes <= 15) {
      return "สาย 15 นาที";
    } else {
      return "สาย 15 นาที";
    }
  };

  const handleFilter = () => {
    let filtered = attendanceLogs;

    if (searchQuery) {
      filtered = filtered.filter(
        (log) =>
          log.empName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          log.empCode.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter) {
      filtered = filtered.filter((log) => log.status === statusFilter);
    }

    if (shiftFilter !== "") {
      filtered = filtered.filter((log) => {
        const employee = employees.find(e => e.code === log.empCode);
        return employee?.shiftId === shiftFilter;
      });
    }

    setFilteredLogs(filtered);
  };

  useEffect(() => {
    handleFilter();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attendanceLogs, searchQuery, statusFilter, shiftFilter]);

  const statuses = Array.from(new Set(attendanceLogs.map((l) => l.status)));

  // Calculate working hours
  const calculateWorkingHours = (checkIn: string, checkOut: string): number => {
    if (checkIn === "-" || checkOut === "-") return 0;
    const [inHour, inMin] = checkIn.split(":").map(Number);
    const [outHour, outMin] = checkOut.split(":").map(Number);
    const inMinutes = inHour * 60 + inMin;
    const outMinutes = outHour * 60 + outMin;
    const diffMinutes = outMinutes - inMinutes;
    return diffMinutes / 60; // Convert to hours
  };

  // Calculate statistics
  const totalLogs = attendanceLogs.length;
  const onTimeCount = attendanceLogs.filter(log => log.status === "ตรงเวลา").length;
  const lateCount = attendanceLogs.filter(log => log.status.includes("สาย")).length;
  const absentCount = attendanceLogs.filter(log => log.status === "ขาดงาน").length;
  const leaveCount = attendanceLogs.filter(log => log.status === "ลา").length;
  const attendanceRate = totalLogs > 0 ? ((onTimeCount + lateCount) / totalLogs * 100).toFixed(1) : "0.0";

  // Calculate working hours
  const workingHoursData = attendanceLogs
    .filter(log => log.checkIn !== "-" && log.checkOut !== "-")
    .map(log => ({
      ...log,
      hours: calculateWorkingHours(log.checkIn, log.checkOut)
    }));

  const totalWorkingHours = workingHoursData.reduce((sum, log) => sum + log.hours, 0);
  const avgWorkingHours = workingHoursData.length > 0 
    ? totalWorkingHours / workingHoursData.length 
    : 0;

  // Calculate late statistics
  const lateLogs = attendanceLogs.filter(log => log.status.includes("สาย"));
  const totalLateMinutes = lateLogs.reduce((sum, log) => {
    if (log.lateMinutes) return sum + log.lateMinutes;
    const match = log.status.match(/(\d+)/);
    return sum + (match ? parseInt(match[1]) : 0);
  }, 0);
  const avgLateMinutes = lateLogs.length > 0 ? totalLateMinutes / lateLogs.length : 0;

  // Group by date for daily summary
  const dailySummary = attendanceLogs.reduce((acc, log) => {
    if (!acc[log.date]) {
      acc[log.date] = {
        date: log.date,
        total: 0,
        onTime: 0,
        late: 0,
        absent: 0,
        leave: 0,
        workingHours: 0,
        employees: new Set<string>()
      };
    }
    acc[log.date].total++;
    acc[log.date].employees.add(log.empCode);
    if (log.status === "ตรงเวลา") acc[log.date].onTime++;
    else if (log.status.includes("สาย")) acc[log.date].late++;
    else if (log.status === "ขาดงาน") acc[log.date].absent++;
    else if (log.status === "ลา") acc[log.date].leave++;

    if (log.checkIn !== "-" && log.checkOut !== "-") {
      acc[log.date].workingHours += calculateWorkingHours(log.checkIn, log.checkOut);
    }
    return acc;
  }, {} as Record<string, {
    date: string;
    total: number;
    onTime: number;
    late: number;
    absent: number;
    leave: number;
    workingHours: number;
    employees: Set<string>;
  }>);

  const dailySummaryList = Object.values(dailySummary)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 7); // Show last 7 days

  const formatTime = (hours: number): string => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h} ชม. ${m} นาที`;
  };

  // Handle edit button click
  const handleEdit = (log: AttendanceLog) => {
    setSelectedLog(log);
    setEditForm({
      checkIn: log.checkIn === "-" ? "" : log.checkIn,
      checkOut: log.checkOut === "-" ? "" : log.checkOut,
      reason: "",
      status: log.status
    });
    setIsEditModalOpen(true);
  };

  // Handle save edit
  const handleSaveEdit = () => {
    if (!selectedLog) return;

    // Determine new status
    let newStatus: AttendanceLog["status"];
    let lateMinutes: number | undefined = undefined;

    // If manual status is selected, use it
    if (editForm.status) {
      newStatus = editForm.status;
    } else if (editForm.checkIn) {
      // Calculate status from check-in time
      newStatus = calculateStatus(editForm.checkIn, selectedLog.status, selectedLog.empCode);
    } else if (!editForm.checkIn && !editForm.checkOut) {
      // If both empty, set to absent
      newStatus = "ขาดงาน";
    } else {
      // Keep current status
      newStatus = selectedLog.status;
    }

    // Calculate late minutes if late
    if (editForm.checkIn && newStatus.includes("สาย")) {
      const shift = getEmployeeShift(selectedLog.empCode);
      const standardTime = shift ? shift.startTime : STANDARD_CHECK_IN;
      const [checkInHour, checkInMinute] = editForm.checkIn.split(":").map(Number);
      const [standardHour, standardMinute] = standardTime.split(":").map(Number);
      const checkInTime = checkInHour * 60 + checkInMinute;
      const standardTimeMinutes = standardHour * 60 + standardMinute;
      
      // Handle overnight shifts
      if (shift && shift.endTime < shift.startTime) {
        if (checkInTime < standardTimeMinutes) {
          lateMinutes = checkInTime + (24 * 60) - standardTimeMinutes;
        } else {
          lateMinutes = checkInTime - standardTimeMinutes;
        }
      } else {
        lateMinutes = checkInTime - standardTimeMinutes;
      }
    }

    // Update attendance log
    const updatedLogs = attendanceLogs.map((log) =>
      log.id === selectedLog.id
        ? {
            ...log,
            checkIn: editForm.checkIn || "-",
            checkOut: editForm.checkOut || "-",
            status: newStatus,
            lateMinutes: lateMinutes
          }
        : log
    );

    setAttendanceLogs(updatedLogs);
    setIsEditModalOpen(false);
    setSelectedLog(null);
    setEditForm({
      checkIn: "",
      checkOut: "",
      reason: "",
      status: "" as AttendanceLog["status"] | ""
    });

    // Show success message
    alert(`แก้ไขข้อมูลลงเวลาสำเร็จ! ${editForm.reason ? `เหตุผล: ${editForm.reason}` : ""}`);
  };

  // Handle record new attendance
  const handleRecordAttendance = () => {
    if (!recordForm.empCode || !recordForm.date || !recordForm.checkIn || !recordForm.checkOut) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    const employee = employees.find(e => e.code === recordForm.empCode);
    if (!employee) {
      alert("ไม่พบข้อมูลพนักงาน");
      return;
    }

    // Calculate status
    const newStatus = calculateStatus(recordForm.checkIn, "ตรงเวลา" as AttendanceLog["status"], recordForm.empCode);
    
    // Calculate late minutes
    let lateMinutes: number | undefined = undefined;
    if (newStatus.includes("สาย")) {
      const shift = getEmployeeShift(recordForm.empCode);
      if (shift) {
        const [checkInHour, checkInMinute] = recordForm.checkIn.split(":").map(Number);
        const [shiftStartHour, shiftStartMinute] = shift.startTime.split(":").map(Number);
        const checkInTime = checkInHour * 60 + checkInMinute;
        const shiftStartTime = shiftStartHour * 60 + shiftStartMinute;
        lateMinutes = checkInTime - shiftStartTime;
      }
    }

    // Calculate OT hours
    const otHours = calculateOTHours(recordForm.empCode, recordForm.checkIn, recordForm.checkOut);
    const otRate = getEmployeeOTRate(recordForm.empCode);
    const otAmount = otHours * otRate;

    const newLog: AttendanceLog = {
      id: Math.max(...attendanceLogs.map(l => l.id), 0) + 1,
      empCode: recordForm.empCode,
      empName: recordForm.empName,
      date: recordForm.date,
      checkIn: recordForm.checkIn,
      checkOut: recordForm.checkOut,
      status: newStatus,
      lateMinutes: lateMinutes,
      otHours: otHours,
      otAmount: otAmount
    };

    setAttendanceLogs([...attendanceLogs, newLog]);

    // Reset form
    setRecordForm({
      empCode: "",
      empName: "",
      date: "",
      checkIn: "",
      checkOut: "",
      otHours: "",
      reason: ""
    });
    setIsRecordModalOpen(false);

    alert(`บันทึกเวลาเข้าออกสำเร็จ! ${otHours > 0 ? `OT: ${otHours.toFixed(2)} ชั่วโมง (${otAmount.toFixed(2)} บาท)` : ""}`);
  };

  // Handle employee selection for record
  const handleEmployeeSelect = (empCode: string) => {
    const employee = employees.find(e => e.code === empCode);
    if (employee) {
      setRecordForm({
        ...recordForm,
        empCode: employee.code,
        empName: employee.name
      });
    }
  };

  // Group logs by shift
  const logsByShift = filteredLogs.reduce((acc, log) => {
    const employee = employees.find(e => e.code === log.empCode);
    const shiftId = employee?.shiftId || 0;
    const shift = shifts.find(s => s.id === shiftId);
    const shiftName = shift?.name || "ไม่ระบุ";

    if (!acc[shiftName]) {
      acc[shiftName] = {
        shiftId: shiftId,
        shiftName: shiftName,
        shift: shift,
        logs: []
      };
    }
    acc[shiftName].logs.push(log);
    return acc;
  }, {} as Record<string, {
    shiftId: number;
    shiftName: string;
    shift: typeof shifts[0] | undefined;
    logs: AttendanceLog[];
  }>);

  // Calculate OT status and info
  const getOTInfo = (log: AttendanceLog) => {
    const employee = employees.find(e => e.code === log.empCode);
    const shift = getEmployeeShift(log.empCode);
    if (!shift || !log.otHours || log.otHours <= 0) return null;

    const shiftEndTime = shift.endTime;
    const [shiftEndHour, shiftEndMin] = shiftEndTime.split(":").map(Number);
    const [checkOutHour, checkOutMin] = log.checkOut.split(":").map(Number);
    
    const shiftEndMinutes = shiftEndHour * 60 + shiftEndMin;
    const checkOutMinutes = checkOutHour * 60 + checkOutMin;
    
    // Handle overnight shifts
    let actualShiftEnd = shiftEndMinutes;
    let actualCheckOut = checkOutMinutes;
    const [shiftStartHour, shiftStartMin] = shift.startTime.split(":").map(Number);
    const shiftStartMinutes = shiftStartHour * 60 + shiftStartMin;
    
    if (shiftEndMinutes < shiftStartMinutes) {
      // Overnight shift
      if (checkOutMinutes < shiftEndMinutes) {
        actualCheckOut = checkOutMinutes + (24 * 60);
      }
      actualShiftEnd = shiftEndMinutes + (24 * 60);
    }

    // OT start time = shift end time
    const otStartTime = shiftEndTime;
    
    // Check if OT has started (checkOut > shiftEnd)
    const hasStarted = actualCheckOut > actualShiftEnd;
    
    // Calculate OT hours done
    let otHoursDone = 0;
    if (hasStarted && log.checkOut !== "-") {
      const diffMinutes = actualCheckOut - actualShiftEnd;
      otHoursDone = diffMinutes / 60;
    }

    // OT hours remaining
    const otHoursRemaining = log.otHours - otHoursDone;

    return {
      otStartTime,
      hasStarted,
      otHoursDone: Math.max(0, Math.min(otHoursDone, log.otHours)),
      otHoursRemaining: Math.max(0, otHoursRemaining),
      otHoursPlanned: log.otHours,
      otAmount: log.otAmount || 0,
      otRate: employee?.otRate || 0
    };
  };

  // Separate OT logs into pending and active
  const otLogs = filteredLogs.filter(log => log.otHours && log.otHours > 0);
  const pendingOT = otLogs.filter(log => {
    const info = getOTInfo(log);
    return info && !info.hasStarted;
  });
  const activeOT = otLogs.filter(log => {
    const info = getOTInfo(log);
    return info && info.hasStarted && info.otHoursRemaining > 0;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-app mb-2 font-display">
            บันทึกเวลาเข้าออก
          </h1>
          <p className="text-muted font-light">
            รายการเวลาเข้าออกงานของพนักงาน วันที่ {new Date().toLocaleDateString("th-TH")}
          </p>
        </div>
        <button
          onClick={() => setIsRecordModalOpen(true)}
          className="inline-flex items-center gap-2 px-6 py-3 bg-ptt-cyan hover:bg-ptt-cyan/80 
                   text-app rounded-xl transition-all duration-200 font-semibold 
                   shadow-lg hover:shadow-xl hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5" />
          บันทึกเวลาเข้าออกใหม่
        </button>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-soft border border-app rounded-xl p-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-xs text-muted">อัตราการเข้างาน</p>
              <p className="text-lg font-bold text-app">{attendanceRate}%</p>
              <p className="text-xs text-muted mt-1">
                {onTimeCount + lateCount} / {totalLogs} วัน
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-soft border border-app rounded-xl p-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/20 rounded-lg">
              <AlertCircle className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-xs text-muted">มาสาย / ขาดงาน</p>
              <p className="text-lg font-bold text-app">{lateCount} / {absentCount}</p>
              <p className="text-xs text-muted mt-1">
                {avgLateMinutes > 0 ? `เฉลี่ย ${Math.round(avgLateMinutes)} นาที` : "ไม่มีข้อมูล"}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-soft border border-app rounded-xl p-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Clock className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-muted">ชั่วโมงทำงานรวม</p>
              <p className="text-lg font-bold text-app font-mono">
                {formatTime(totalWorkingHours)}
              </p>
              <p className="text-xs text-muted mt-1">
                เฉลี่ย {formatTime(avgWorkingHours)}/วัน
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-soft border border-app rounded-xl p-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-ptt-cyan/20 rounded-lg">
              <Users className="w-5 h-5 text-ptt-cyan" />
            </div>
            <div>
              <p className="text-xs text-muted">พนักงานทั้งหมด</p>
              <p className="text-lg font-bold text-app">
                {new Set(attendanceLogs.map(l => l.empCode)).size} คน
              </p>
              <p className="text-xs text-muted mt-1">
                {totalLogs} บันทึก • ลา {leaveCount} ครั้ง
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Daily Summary */}
      {dailySummaryList.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-soft border border-app rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold text-app mb-4 font-display flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-ptt-cyan" />
            สรุปการเข้างานรายวัน (7 วันล่าสุด)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-ink-800/50 border-b border-app">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-app">วันที่</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-app">พนักงาน</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-app">ตรงเวลา</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-app">มาสาย</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-app">ขาดงาน</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-app">ลา</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-app">ชั่วโมงทำงาน</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-app">อัตรา</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {dailySummaryList.map((day) => {
                  const dayRate = day.total > 0 
                    ? ((day.onTime / day.total) * 100).toFixed(1) 
                    : "0.0";
                  return (
                    <tr key={day.date} className="hover:bg-ink-800/30 transition-colors">
                      <td className="px-4 py-3 text-sm text-app font-medium">
                        {new Date(day.date).toLocaleDateString("th-TH", { 
                          weekday: "short", 
                          year: "numeric", 
                          month: "short", 
                          day: "numeric" 
                        })}
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-app">
                        {day.employees.size} คน
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-green-400 font-semibold">{day.onTime}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-yellow-400 font-semibold">{day.late}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-red-400 font-semibold">{day.absent}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-blue-400 font-semibold">{day.leave}</span>
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-app font-mono">
                        {formatTime(day.workingHours)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-ptt-cyan font-semibold">{dayRate}%</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Filter Bar */}
      <FilterBar
        placeholder="ค้นหาชื่อหรือรหัสพนักงาน..."
        onSearch={(query) => {
          setSearchQuery(query);
          handleFilter();
        }}
        filters={[
          {
            label: "ทุกสถานะ",
            value: statusFilter,
            options: statuses.map((s) => ({ label: s, value: s })),
            onChange: (value) => {
              setStatusFilter(value);
              handleFilter();
            },
          },
          {
            label: "ทุกกะ",
            value: shiftFilter === "" ? "" : String(shiftFilter),
            options: [
              { label: "ทุกกะ", value: "" },
              ...shifts.map((s) => ({ label: `กะ${s.name} (${s.startTime}-${s.endTime})`, value: String(s.id) })),
            ],
            onChange: (value) => {
              setShiftFilter(value === "" ? "" : Number(value));
              handleFilter();
            },
          },
        ]}
      />

      {/* OT Table */}
      {(pendingOT.length > 0 || activeOT.length > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-soft border border-app rounded-2xl overflow-hidden shadow-xl"
        >
          <div className="px-6 py-4 border-b border-app bg-ink-800/50">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-app font-display flex items-center gap-2">
                  <Timer className="w-5 h-5 text-ptt-cyan" />
                  ตาราง OT (Overtime)
                </h3>
                <p className="text-xs text-muted mt-1">
                  {pendingOT.length} รายการรอเริ่ม • {activeOT.length} รายการกำลังทำ OT
                </p>
              </div>
            </div>
          </div>

          {/* Pending OT */}
          {pendingOT.length > 0 && (
            <div className="border-b border-app">
              <div className="px-6 py-3 bg-yellow-500/10 border-b border-yellow-500/20">
                <h4 className="text-sm font-semibold text-yellow-400 flex items-center gap-2">
                  <Pause className="w-4 h-4" />
                  รอเริ่ม OT ({pendingOT.length} รายการ)
                </h4>
                <p className="text-xs text-muted mt-1">ลง OT ไว้แล้ว แต่ยังไม่เริ่มทำ (รอให้ออกจากกะปกติก่อน)</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-ink-800/30 border-b border-app">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-app">วันที่</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-app">รหัส</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-app">ชื่อ-นามสกุล</th>
                      <th className="px-6 py-3 text-center text-xs font-semibold text-app">กะ</th>
                      <th className="px-6 py-3 text-center text-xs font-semibold text-app">เวลาออกจากกะ</th>
                      <th className="px-6 py-3 text-center text-xs font-semibold text-app">เวลาเริ่ม OT</th>
                      <th className="px-6 py-3 text-center text-xs font-semibold text-app">OT ที่ลงไว้</th>
                      <th className="px-6 py-3 text-center text-xs font-semibold text-app">เงิน OT</th>
                      <th className="px-6 py-3 text-center text-xs font-semibold text-app">สถานะ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {pendingOT.map((log, index) => {
                      const info = getOTInfo(log);
                      const shift = getEmployeeShift(log.empCode);
                      if (!info) return null;
                      
                      return (
                        <motion.tr
                          key={log.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="hover:bg-ink-800/20 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-muted" />
                              <span className="text-sm text-app font-light">{log.date}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-ptt-cyan font-medium">{log.empCode}</td>
                          <td className="px-6 py-4 text-sm text-app font-medium">{log.empName}</td>
                          <td className="px-6 py-4 text-center text-sm text-app">
                            {shift && <span className="text-ptt-cyan">กะ{shift.name}</span>}
                          </td>
                          <td className="px-6 py-4 text-center text-sm text-app font-mono">
                            {shift?.endTime || "-"}
                          </td>
                          <td className="px-6 py-4 text-center text-sm font-semibold text-yellow-400 font-mono">
                            {info.otStartTime}
                          </td>
                          <td className="px-6 py-4 text-center text-sm font-semibold text-ptt-cyan">
                            {info.otHoursPlanned.toFixed(2)} ชม.
                          </td>
                          <td className="px-6 py-4 text-center text-sm font-semibold text-green-400 font-mono">
                            {info.otAmount.toFixed(2)} บาท
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                              <Pause className="w-3 h-3" />
                              รอเริ่ม
                            </span>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Active OT */}
          {activeOT.length > 0 && (
            <div>
              <div className="px-6 py-3 bg-green-500/10 border-b border-green-500/20">
                <h4 className="text-sm font-semibold text-green-400 flex items-center gap-2">
                  <Play className="w-4 h-4" />
                  กำลังทำ OT ({activeOT.length} รายการ)
                </h4>
                <p className="text-xs text-muted mt-1">เริ่มทำ OT แล้ว (กำลังทำงาน OT อยู่)</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-ink-800/30 border-b border-app">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-app">วันที่</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-app">รหัส</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-app">ชื่อ-นามสกุล</th>
                      <th className="px-6 py-3 text-center text-xs font-semibold text-app">กะ</th>
                      <th className="px-6 py-3 text-center text-xs font-semibold text-app">เวลาเริ่ม OT</th>
                      <th className="px-6 py-3 text-center text-xs font-semibold text-app">เวลาออกปัจจุบัน</th>
                      <th className="px-6 py-3 text-center text-xs font-semibold text-app">OT ทำไปแล้ว</th>
                      <th className="px-6 py-3 text-center text-xs font-semibold text-app">OT เหลือ</th>
                      <th className="px-6 py-3 text-center text-xs font-semibold text-app">เงิน OT</th>
                      <th className="px-6 py-3 text-center text-xs font-semibold text-app">สถานะ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {activeOT.map((log, index) => {
                      const info = getOTInfo(log);
                      const shift = getEmployeeShift(log.empCode);
                      if (!info) return null;
                      
                      return (
                        <motion.tr
                          key={log.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="hover:bg-ink-800/20 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-muted" />
                              <span className="text-sm text-app font-light">{log.date}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-ptt-cyan font-medium">{log.empCode}</td>
                          <td className="px-6 py-4 text-sm text-app font-medium">{log.empName}</td>
                          <td className="px-6 py-4 text-center text-sm text-app">
                            {shift && <span className="text-ptt-cyan">กะ{shift.name}</span>}
                          </td>
                          <td className="px-6 py-4 text-center text-sm font-semibold text-green-400 font-mono">
                            {info.otStartTime}
                          </td>
                          <td className="px-6 py-4 text-center text-sm font-semibold text-app font-mono">
                            {log.checkOut}
                          </td>
                          <td className="px-6 py-4 text-center text-sm font-semibold text-green-400">
                            {info.otHoursDone.toFixed(2)} ชม.
                          </td>
                          <td className="px-6 py-4 text-center text-sm font-semibold text-yellow-400">
                            {info.otHoursRemaining.toFixed(2)} ชม.
                          </td>
                          <td className="px-6 py-4 text-center text-sm font-semibold text-green-400 font-mono">
                            {(info.otHoursDone * info.otRate).toFixed(2)} บาท
                            <span className="block text-xs text-muted mt-1">
                              (รวม {info.otAmount.toFixed(2)} บาท)
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs bg-green-500/20 text-green-400 border border-green-500/30">
                              <Play className="w-3 h-3" />
                              กำลังทำ
                            </span>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Tables by Shift */}
      {Object.keys(logsByShift).length > 0 ? (
        Object.values(logsByShift).map((shiftData, shiftIndex) => (
          <motion.div
            key={shiftData.shiftName}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: shiftIndex * 0.1 }}
            className="bg-soft border border-app rounded-2xl overflow-hidden shadow-xl"
          >
            <div className="px-6 py-4 border-b border-app bg-ink-800/50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-app font-display flex items-center gap-2">
                    <Clock className="w-5 h-5 text-ptt-cyan" />
                    กะ{shiftData.shiftName}
                    {shiftData.shift && (
                      <span className="text-sm font-normal text-muted">
                        ({shiftData.shift.startTime} - {shiftData.shift.endTime})
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-muted mt-1">
                    {shiftData.logs.length} รายการ
                    {shiftData.logs.reduce((sum, log) => sum + (log.otHours || 0), 0) > 0 && (
                      <span className="ml-2 text-ptt-cyan">
                        • OT รวม: {shiftData.logs.reduce((sum, log) => sum + (log.otHours || 0), 0).toFixed(2)} ชม.
                        ({shiftData.logs.reduce((sum, log) => sum + (log.otAmount || 0), 0).toFixed(2)} บาท)
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-soft border-b border-app">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-app">
                      วันที่
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-app">
                      รหัส
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-app">
                      ชื่อ-นามสกุล
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-app">
                      เวลาเข้า
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-app">
                      เวลาออก
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-app">
                      ชั่วโมงทำงาน
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-app">
                      สถานะ
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-app">
                      จัดการ
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {shiftData.logs.map((log, index) => (
                      <motion.tr
                        key={log.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-soft transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-muted" />
                            <span className="text-sm text-app font-light">
                              {log.date}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-ptt-cyan font-medium">
                          {log.empCode}
                        </td>
                        <td className="px-6 py-4 text-sm text-app font-medium">
                          {log.empName}
                        </td>
                        <td className="px-6 py-4 text-center text-sm text-app font-mono">
                          {log.checkIn}
                        </td>
                        <td className="px-6 py-4 text-center text-sm text-app font-mono">
                          {log.checkOut}
                        </td>
                        <td className="px-6 py-4 text-center text-sm text-app font-mono">
                          {log.checkIn !== "-" && log.checkOut !== "-" ? (
                            <span className="text-ptt-cyan">
                              {formatTime(calculateWorkingHours(log.checkIn, log.checkOut))}
                            </span>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <StatusTag variant={getStatusVariant(log.status)}>
                            {log.status}
                          </StatusTag>
                          {log.lateMinutes && log.lateMinutes > 0 && (
                            <p className="text-xs text-yellow-400 mt-1">
                              สาย {log.lateMinutes} นาที
                            </p>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => handleEdit(log)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs 
                                     bg-ptt-blue/20 hover:bg-ptt-blue/30 text-ptt-cyan 
                                     rounded-lg transition-colors font-medium"
                            title="แก้ไขข้อมูลลงเวลา"
                          >
                            <Edit2 className="w-3 h-3" />
                            แก้ไข
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                </tbody>
              </table>

              {shiftData.logs.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted font-light">ไม่พบข้อมูลสำหรับกะนี้</p>
                </div>
              )}
            </div>
          </motion.div>
        ))
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-soft border border-app rounded-2xl overflow-hidden shadow-xl"
        >
          <div className="text-center py-12">
            <p className="text-muted font-light">ไม่พบข้อมูล</p>
          </div>
        </motion.div>
      )}

      {/* Record Attendance Modal */}
      <ModalForm
        isOpen={isRecordModalOpen}
        onClose={() => {
          setIsRecordModalOpen(false);
          setRecordForm({
            empCode: "",
            empName: "",
            date: "",
            checkIn: "",
            checkOut: "",
            otHours: "",
            reason: ""
          });
        }}
        title="บันทึกเวลาเข้าออกใหม่"
        onSubmit={handleRecordAttendance}
        submitLabel="บันทึก"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-app mb-2">
              เลือกพนักงาน <span className="text-red-400">*</span>
            </label>
            <select
              value={recordForm.empCode}
              onChange={(e) => handleEmployeeSelect(e.target.value)}
              className="w-full px-4 py-2.5 bg-ink-800 border border-app rounded-xl
                       text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue"
              required
            >
              <option value="">เลือกพนักงาน</option>
              {employees.map((emp) => {
                const shift = emp.shiftId ? shifts.find(s => s.id === emp.shiftId) : null;
                return (
                  <option key={emp.id} value={emp.code}>
                    {emp.code} - {emp.name} {shift ? `(กะ${shift.name} ${shift.startTime}-${shift.endTime})` : ""}
                  </option>
                );
              })}
            </select>
          </div>

          {recordForm.empCode && (() => {
            const employee = employees.find(e => e.code === recordForm.empCode);
            const shift = employee?.shiftId ? shifts.find(s => s.id === employee.shiftId) : null;
            return (
              <div className="p-3 bg-ink-800/50 rounded-lg border border-app">
                <p className="text-sm text-muted mb-1">ข้อมูลพนักงาน</p>
                <p className="text-app font-semibold">{recordForm.empName}</p>
                {shift && (
                  <p className="text-xs text-ptt-cyan mt-1">
                    กะ{shift.name}: {shift.startTime} - {shift.endTime}
                  </p>
                )}
                {employee?.otRate && (
                  <p className="text-xs text-yellow-400 mt-1">
                    OT Rate: {employee.otRate} บาท/ชั่วโมง
                  </p>
                )}
              </div>
            );
          })()}

          <div>
            <label className="block text-sm font-medium text-app mb-2">
              วันที่ <span className="text-red-400">*</span>
            </label>
            <input
              type="date"
              value={recordForm.date}
              onChange={(e) => setRecordForm({ ...recordForm, date: e.target.value })}
              className="w-full px-4 py-2.5 bg-ink-800 border border-app rounded-xl
                       text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-app mb-2">
                เวลาเข้า <span className="text-red-400">*</span>
              </label>
              <input
                type="time"
                value={recordForm.checkIn}
                onChange={(e) => {
                  const newCheckIn = e.target.value;
                  setRecordForm({ ...recordForm, checkIn: newCheckIn });
                  // Auto-calculate OT if both times are filled
                  if (newCheckIn && recordForm.checkOut) {
                    const otHours = calculateOTHours(recordForm.empCode, newCheckIn, recordForm.checkOut);
                    setRecordForm(prev => ({ ...prev, otHours: otHours.toFixed(2) }));
                  }
                }}
                className="w-full px-4 py-2.5 bg-ink-800 border border-app rounded-xl
                         text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue"
                required
              />
              {recordForm.empCode && (() => {
                const shift = getEmployeeShift(recordForm.empCode);
                return shift && (
                  <p className="text-xs text-muted mt-1">เวลามาตรฐาน: {shift.startTime}</p>
                );
              })()}
            </div>
            <div>
              <label className="block text-sm font-medium text-app mb-2">
                เวลาออก <span className="text-red-400">*</span>
              </label>
              <input
                type="time"
                value={recordForm.checkOut}
                onChange={(e) => {
                  const newCheckOut = e.target.value;
                  setRecordForm({ ...recordForm, checkOut: newCheckOut });
                  // Auto-calculate OT if both times are filled
                  if (recordForm.checkIn && newCheckOut) {
                    const otHours = calculateOTHours(recordForm.empCode, recordForm.checkIn, newCheckOut);
                    setRecordForm(prev => ({ ...prev, otHours: otHours.toFixed(2) }));
                  }
                }}
                className="w-full px-4 py-2.5 bg-ink-800 border border-app rounded-xl
                         text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue"
                required
              />
              {recordForm.empCode && (() => {
                const shift = getEmployeeShift(recordForm.empCode);
                return shift && (
                  <p className="text-xs text-muted mt-1">เวลามาตรฐาน: {shift.endTime}</p>
                );
              })()}
            </div>
          </div>

          {recordForm.checkIn && recordForm.checkOut && recordForm.empCode && (
            <div className="p-3 bg-ptt-blue/10 border border-ptt-blue/30 rounded-lg space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-app">ชั่วโมงทำงาน:</span>
                <span className="text-sm font-semibold text-ptt-cyan">
                  {formatTime(calculateWorkingHours(recordForm.checkIn, recordForm.checkOut))}
                </span>
              </div>
              {parseFloat(recordForm.otHours || "0") > 0 && (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-app">OT ชั่วโมง:</span>
                    <span className="text-sm font-semibold text-green-400">
                      {parseFloat(recordForm.otHours || "0").toFixed(2)} ชม.
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-app">เงิน OT:</span>
                    <span className="text-sm font-semibold text-yellow-400">
                      {(parseFloat(recordForm.otHours || "0") * getEmployeeOTRate(recordForm.empCode)).toFixed(2)} บาท
                    </span>
                  </div>
                </>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-app mb-2">
              หมายเหตุ
            </label>
            <textarea
              rows={3}
              value={recordForm.reason}
              onChange={(e) => setRecordForm({ ...recordForm, reason: e.target.value })}
              placeholder="ระบุหมายเหตุ (ถ้ามี)..."
              className="w-full px-4 py-2.5 bg-ink-800 border border-app rounded-xl
                       text-app placeholder:text-muted
                       focus:outline-none focus:ring-2 focus:ring-ptt-blue resize-none"
            />
          </div>
        </div>
      </ModalForm>

      {/* Edit Attendance Modal */}
      <ModalForm
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedLog(null);
          setEditForm({
            checkIn: "",
            checkOut: "",
            reason: "",
            status: "" as AttendanceLog["status"] | ""
          });
        }}
        title="แก้ไขข้อมูลลงเวลา"
        onSubmit={handleSaveEdit}
        submitLabel="บันทึกการแก้ไข"
      >
        {selectedLog && (
          <div className="space-y-4">
            {/* Employee Info */}
            <div className="p-4 bg-ink-800/50 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-muted">พนักงาน:</span>
                <span className="text-app font-medium">{selectedLog.empName} ({selectedLog.empCode})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">วันที่:</span>
                <span className="text-app font-medium">{selectedLog.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">สถานะปัจจุบัน:</span>
                <StatusTag variant={getStatusVariant(selectedLog.status)}>
                  {selectedLog.status}
                </StatusTag>
              </div>
            </div>

            {/* Time Inputs */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-app mb-2">
                  เวลาเข้า
                </label>
                <input
                  type="time"
                  value={editForm.checkIn}
                  onChange={(e) => {
                    const newCheckIn = e.target.value;
                    // Reset status to auto-calculate when check-in changes
                    setEditForm({
                      ...editForm,
                      checkIn: newCheckIn,
                      status: "" as AttendanceLog["status"] | ""
                    });
                  }}
                  className="w-full px-4 py-2.5 bg-ink-800 border border-app rounded-xl
                           text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue"
                />
                <p className="text-xs text-muted mt-1">เวลามาตรฐาน: {STANDARD_CHECK_IN}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-app mb-2">
                  เวลาออก
                </label>
                <input
                  type="time"
                  value={editForm.checkOut}
                  onChange={(e) => setEditForm({ ...editForm, checkOut: e.target.value })}
                  className="w-full px-4 py-2.5 bg-ink-800 border border-app rounded-xl
                           text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue"
                />
                <p className="text-xs text-muted mt-1">เวลามาตรฐาน: {STANDARD_CHECK_OUT}</p>
              </div>
            </div>

            {/* Manual Status Override */}
            <div>
              <label className="block text-sm font-medium text-app mb-2">
                กำหนดสถานะเอง (ถ้าต้องการ)
              </label>
              <select
                value={editForm.status}
                onChange={(e) => setEditForm({ ...editForm, status: e.target.value as AttendanceLog["status"] })}
                className="w-full px-4 py-2.5 bg-ink-800 border border-app rounded-xl
                         text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue"
              >
                <option value="">คำนวณอัตโนมัติจากเวลาเข้า</option>
                <option value="ตรงเวลา">ตรงเวลา</option>
                <option value="สาย 1 นาที">สาย 1 นาที</option>
                <option value="สาย 15 นาที">สาย 15 นาที</option>
                <option value="ขาดงาน">ขาดงาน</option>
                <option value="ลา">ลา</option>
              </select>
              <p className="text-xs text-muted mt-1">
                ถ้าไม่เลือก ระบบจะคำนวณสถานะจากเวลาเข้าโดยอัตโนมัติ
              </p>
            </div>

            {/* Preview New Status */}
            {(editForm.checkIn || editForm.status) && (
              <div className="p-3 bg-ptt-blue/10 border border-ptt-blue/30 rounded-lg">
                  <p className="text-sm text-ptt-cyan">
                    สถานะที่จะบันทึก: <span className="font-semibold">
                      {editForm.status || (editForm.checkIn ? calculateStatus(editForm.checkIn, selectedLog.status, selectedLog.empCode) : selectedLog.status)}
                    </span>
                  </p>
                {editForm.checkIn && editForm.status && (
                  <p className="text-xs text-muted mt-1">
                    (สถานะที่เลือกจะถูกใช้แทนการคำนวณอัตโนมัติ)
                  </p>
                )}
              </div>
            )}

            {/* Reason for Edit */}
            <div>
              <label className="block text-sm font-medium text-app mb-2">
                เหตุผลในการแก้ไข <span className="text-muted text-xs">(เช่น สแกนผิด, ลืมสแกน, ระบบผิดพลาด)</span>
              </label>
              <textarea
                rows={3}
                value={editForm.reason}
                onChange={(e) => setEditForm({ ...editForm, reason: e.target.value })}
                placeholder="ระบุเหตุผลในการแก้ไขข้อมูล..."
                className="w-full px-4 py-2.5 bg-ink-800 border border-app rounded-xl
                         text-app placeholder:text-muted
                         focus:outline-none focus:ring-2 focus:ring-ptt-blue resize-none"
              />
            </div>

            {/* Warning */}
            <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <p className="text-sm text-yellow-400">
                ⚠️ การแก้ไขข้อมูลลงเวลาจะส่งผลต่อรายงานการเข้างานและสถิติของพนักงาน
              </p>
            </div>
          </div>
        )}
      </ModalForm>
    </div>
  );
}

