import { useState, useEffect, useRef, useMemo } from "react";
import { motion } from "framer-motion";
import { Calendar, Edit2, Clock, CheckCircle, AlertCircle, Users, Plus, FileText, ChevronLeft, ChevronRight, ArrowRightLeft } from "lucide-react";
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
  const [categoryFilter, setCategoryFilter] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AttendanceLog | null>(null);
  
  // Calendar view states
  const [viewMode, setViewMode] = useState<"list" | "calendar">("calendar");
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [shiftPlanMonth, setShiftPlanMonth] = useState<string>(() => {
    const next = new Date();
    next.setMonth(next.getMonth() + 1);
    return `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}`;
  });
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedShift, setSelectedShift] = useState<number | "">("");
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
  const shiftPlanRef = useRef<HTMLDivElement | null>(null);
  const shiftColorPalette = ["bg-green-500/20", "bg-blue-500/20", "bg-purple-500/20", "bg-orange-500/20", "bg-ptt-cyan/20"];

  // Standard work time: 08:30
  const STANDARD_CHECK_IN = "06:00";
  const STANDARD_CHECK_OUT = "12:00";

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

    if (categoryFilter) {
      filtered = filtered.filter((log) => {
        const employee = employees.find(e => e.code === log.empCode);
        return employee?.category === categoryFilter;
      });
    }

    setFilteredLogs(filtered);
  };

  useEffect(() => {
    handleFilter();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attendanceLogs, searchQuery, statusFilter, shiftFilter, categoryFilter]);

  const statuses = Array.from(new Set(attendanceLogs.map((l) => l.status)));

  // Get all unique categories
  const categories = Array.from(new Set(employees.map(e => e.category).filter(Boolean)));

  // Generate days in month (1st to last day of current month)
  const getDaysInMonth = (year: number, month: number) => {
    const days: Date[] = [];
    // Get the last day of the current month
    const lastDay = new Date(year, month + 1, 0).getDate();
    
    // Days from 1st to last day of current month
    for (let day = 1; day <= lastDay; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  // Get attendance data for calendar view
  const getCalendarData = () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const days = getDaysInMonth(year, month - 1);
    
    // Filter employees by category and shift
    let filteredEmployees = employees.filter(emp => emp.status === "Active");
    if (selectedCategory) {
      filteredEmployees = filteredEmployees.filter(emp => emp.category === selectedCategory);
    }
    if (selectedShift !== "") {
      filteredEmployees = filteredEmployees.filter(emp => emp.shiftId === selectedShift);
    }
    
    // Get attendance for each employee for each day
    const calendarData = filteredEmployees.map(emp => {
      const empShift = emp.shiftId ? shifts.find(s => s.id === emp.shiftId) : null;
      const empAttendance = days.map(day => {
        const dateStr = day.toISOString().split('T')[0];
        const log = attendanceLogs.find(
          l => l.empCode === emp.code && l.date === dateStr
        );
        
        return {
          date: dateStr,
          day: day.getDate(),
          log: log || null,
          status: log?.status || null,
          checkIn: log?.checkIn || null,
          checkOut: log?.checkOut || null
        };
      });
      
      return {
        employee: emp,
        shift: empShift,
        attendance: empAttendance
      };
    });
    
    return { days, calendarData };
  };


  // Export report for category
  const handleExportReport = () => {
    const { days, calendarData } = getCalendarData();
    const categoryName = selectedCategory || "ทั้งหมด";
    const monthName = new Date(selectedMonth + '-01').toLocaleDateString('th-TH', { year: 'numeric', month: 'long' });
    
    // Create report data
    let reportText = `รายงานการลงเวลา - แผนก${categoryName}\n`;
    reportText += `เดือน: ${monthName}\n`;
    reportText += `วันที่พิมพ์: ${new Date().toLocaleDateString('th-TH')}\n\n`;
    reportText += `="NO","ชื่อ-สกุล","แผนก"`;
    
    // Add date headers
    days.forEach(day => {
      reportText += `,"${day.getDate()}"`;
    });
    reportText += `\n`;
    
    // Add employee rows
    calendarData.forEach((data, index) => {
      reportText += `${index + 1},"${data.employee.name}","${data.employee.category || ''}"`;
      data.attendance.forEach(att => {
        if (att.log) {
          if (att.status === "ลา") {
            reportText += `,"ลา"`;
          } else if (att.status === "ขาดงาน") {
            reportText += `,"ขาด"`;
          } else if (att.status?.includes("สาย")) {
            reportText += `,"สาย"`;
          } else if (att.checkIn) {
            reportText += `,"${att.checkIn.replace(':', '.')}"`;
          } else {
            reportText += `,""`;
          }
        } else {
          reportText += `,""`;
        }
      });
      reportText += `\n`;
    });
    
    // Create and download file
    const blob = new Blob([reportText], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `รายงานการลงเวลา_${categoryName}_${selectedMonth}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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



  const formatTime = (hours: number): string => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h} ชม. ${m} นาที`;
  };

  const getShiftCellClass = (shift?: (typeof shifts)[number] | null) => {
    if (!shiftColorPalette.length || !shift) return "";
    const paletteIndex = shift.id % shiftColorPalette.length;
    return shiftColorPalette[paletteIndex];
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

  const shiftPlanDataset = useMemo(() => {
    const [year, month] = shiftPlanMonth.split('-').map(Number);
    if (!year || !month) {
      return { days: [] as Date[], planData: [] as Array<{ employee: typeof employees[number]; schedule: Array<{ date: string; day: number; shift: typeof shifts[number] | null }> }> };
    }
    const days = getDaysInMonth(year, month - 1);
    let filteredEmployees = employees.filter(emp => emp.status === "Active");
    if (selectedCategory) {
      filteredEmployees = filteredEmployees.filter(emp => emp.category === selectedCategory);
    }
    if (selectedShift !== "") {
      filteredEmployees = filteredEmployees.filter(emp => emp.shiftId === selectedShift);
    }
    const planData = filteredEmployees.map((emp, index) => {
      const baseIndex = emp.shiftId ? shifts.findIndex(s => s.id === emp.shiftId) : index;
      return {
        employee: emp,
        schedule: days.map((day, dayIndex) => {
          if (shifts.length === 0) {
            return {
              date: day.toISOString().split('T')[0],
              day: day.getDate(),
              shift: null
            };
          }
          const normalizedBase = baseIndex >= 0 ? baseIndex : 0;
          const plannedShift = shifts[(dayIndex + normalizedBase) % shifts.length];
          return {
            date: day.toISOString().split('T')[0],
            day: day.getDate(),
            shift: plannedShift
          };
        })
      };
    });
    return { days, planData };
  }, [shiftPlanMonth, selectedCategory, selectedShift]);

  const { days: planDays, planData: shiftPlanRows } = shiftPlanDataset;

  const handleShiftPlanScroll = () => {
    if (shiftPlanRef.current) {
      shiftPlanRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };


  const { days, calendarData } = getCalendarData();

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
        <div className="flex gap-2">

          <button
            onClick={() => {
              if (viewMode === "calendar") setViewMode("list");
              else if (viewMode === "list") setViewMode("calendar");
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-soft hover:bg-soft/80 
                     text-app border border-app rounded-xl transition-all duration-200 font-medium"
          >
            <Calendar className="w-4 h-4" />
            {viewMode === "calendar" ? "ลงทะเบียนกะล่วงหน้า" : "มุมมองปฏิทิน"}
          </button>
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


      {/* Calendar View */}
      {viewMode === "calendar" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-soft border border-app rounded-2xl overflow-hidden shadow-xl"
        >
          <div className="px-6 py-4 border-b border-app bg-soft">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-app font-display flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-ptt-cyan" />
                  ตารางการลงเวลา (ปฏิทินรายบุคคล)
                </h3>
                <p className="text-xs text-muted mt-1">
                  แสดงการลงเวลารายเดือน แยกตามแผนก
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const [year, month] = selectedMonth.split('-').map(Number);
                      const prevMonth = month === 1 ? 12 : month - 1;
                      const prevYear = month === 1 ? year - 1 : year;
                      setSelectedMonth(`${prevYear}-${String(prevMonth).padStart(2, '0')}`);
                    }}
                    className="p-2 bg-soft hover:bg-soft/80 border border-app rounded-lg transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4 text-app" />
                  </button>
                  <input
                    type="month"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="px-4 py-2 bg-soft border border-app rounded-lg text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue"
                  />
                  <button
                    onClick={() => {
                      const [year, month] = selectedMonth.split('-').map(Number);
                      const nextMonth = month === 12 ? 1 : month + 1;
                      const nextYear = month === 12 ? year + 1 : year;
                      setSelectedMonth(`${nextYear}-${String(nextMonth).padStart(2, '0')}`);
                    }}
                    className="p-2 bg-soft hover:bg-soft/80 border border-app rounded-lg transition-colors"
                  >
                    <ChevronRight className="w-4 h-4 text-app" />
                  </button>
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 bg-soft border border-app rounded-lg text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue"
                >
                  <option value="">ทุกแผนก</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat || ""}>
                      {cat}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedShift === "" ? "" : String(selectedShift)}
                  onChange={(e) => setSelectedShift(e.target.value === "" ? "" : Number(e.target.value))}
                  className="px-4 py-2 bg-soft border border-app rounded-lg text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue"
                >
                  <option value="">ทุกกะ</option>
                  {(() => {
                    // Filter shifts by selected category
                    let availableShifts = shifts;
                    if (selectedCategory) {
                      availableShifts = shifts.filter(s => s.category === selectedCategory);
                    }
                    return availableShifts.map((shift) => (
                      <option key={shift.id} value={String(shift.id)}>
                        {shift.shiftType ? `กะ${shift.shiftType}` : ""} {shift.name} {shift.description ? `(${shift.description})` : ""}
                      </option>
                    ));
                  })()}
                </select>
                <button
                  onClick={handleExportReport}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 
                           text-white rounded-lg transition-all duration-200 font-medium"
                >
                  <FileText className="w-4 h-4" />
                  Export Report
                </button>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-soft border-b-2 border-app sticky top-0 z-10">
                <tr>
                  <th className="px-2 py-3 text-center text-xs font-semibold text-app border-r border-app sticky left-0 bg-soft z-20 min-w-[30px] w-[30px]">
                    NO
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-app border-r border-app sticky left-[30px] bg-soft z-20 min-w-[200px]">
                    ชื่อ-สกุล
                  </th>
                  <th className="px-3 py-3 text-center text-xs font-semibold text-app border-r border-app sticky left-[230px] bg-soft z-20 min-w-[100px]">
                    แผนก
                  </th>
                  <th className="px-3 py-3 text-center text-xs font-semibold text-app border-r border-app sticky left-[330px] bg-soft z-20 min-w-[120px]">
                    กะ
                  </th>
                  {days.map((day, idx) => (
                    <th
                      key={idx}
                      className="px-2 py-3 text-center text-xs font-semibold text-app border-r border-app min-w-[50px]"
                    >
                      {day.getDate()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-app">
                {calendarData.map((data, empIndex) => (
                  <motion.tr
                    key={data.employee.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: empIndex * 0.02 }}
                    className="hover:bg-soft/50 transition-colors"
                  >
                    <td className="px-2 py-3 text-xs text-app font-semibold border-r border-app sticky left-0 bg-soft z-10 text-center min-w-[30px] w-[30px]">
                      {empIndex + 1}
                    </td>
                    <td className="px-3 py-3 text-sm text-app font-medium border-r border-app sticky left-[30px] bg-soft z-10">
                      {data.employee.name}
                    </td>
                    <td className="px-3 py-3 text-sm text-center text-app border-r border-app sticky left-[230px] bg-soft z-10">
                      <span className="text-xs text-ptt-cyan">{data.employee.category || "-"}</span>
                    </td>
                    <td className="px-3 py-3 text-sm text-center text-app border-r border-app sticky left-[330px] bg-soft z-10">
                      {data.shift ? (
                        <div className="text-xs">
                          <div className="text-ptt-cyan font-medium">
                            {data.shift.shiftType ? `กะ${data.shift.shiftType}` : ""} {data.shift.name}
                          </div>
                          <div className="text-muted text-[10px]">{data.shift.startTime}-{data.shift.endTime}</div>
                        </div>
                      ) : (
                        <span className="text-xs text-muted">-</span>
                      )}
                    </td>
                    {data.attendance.map((att, dayIndex) => {
                      const getCellColor = () => {
                        if (!att.log) return "";
                        if (att.status === "ลา") return "bg-yellow-200/30";
                        if (att.status === "ขาดงาน") return "bg-red-200/30";
                        if (att.status?.includes("สาย")) return "bg-orange-200/30";
                        return "";
                      };
                      
                      const getCellContent = () => {
                        if (!att.log) return "";
                        if (att.status === "ลา") return "ลา";
                        if (att.status === "ขาดงาน") return "ขาด";
                        if (att.status?.includes("สาย")) {
                          return att.checkIn ? att.checkIn.replace(':', '.') : "สาย";
                        }
                        if (att.checkIn) {
                          return att.checkIn.replace(':', '.');
                        }
                        return "";
                      };
                      
                      const getTooltip = () => {
                        if (!att.log) return "";
                        let tooltip = `${att.log.date}: ${att.log.status}`;
                        if (att.checkIn) tooltip += ` เข้า ${att.checkIn}`;
                        if (att.checkOut) tooltip += ` ออก ${att.checkOut}`;
                        return tooltip;
                      };
                      
                      return (
                        <td
                          key={dayIndex}
                          className={`px-2 py-2 text-center text-xs border-r border-app ${getCellColor()}`}
                          title={getTooltip()}
                        >
                          {getCellContent()}
                        </td>
                      );
                    })}
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {calendarData.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted font-light">ไม่พบข้อมูลพนักงานในแผนกที่เลือก</p>
            </div>
          )}
          
          {/* Legend */}
          <div className="px-6 py-4 border-t border-app bg-soft">
            <div className="flex flex-wrap gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-200/30 border border-app rounded"></div>
                <span className="text-app">ลา</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-200/30 border border-app rounded"></div>
                <span className="text-app">ขาด</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-orange-200/30 border border-app rounded"></div>
                <span className="text-app">มาสาย</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border border-app rounded"></div>
                <span className="text-app">ปกติ (แสดงเวลาเข้า)</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Shift Plan Table */}
      <motion.div
        ref={shiftPlanRef}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-soft border border-app rounded-2xl overflow-hidden shadow-xl"
      >
        <div className="px-6 py-4 border-b border-app bg-soft">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-app font-display flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5 text-ptt-cyan" />
                ตารางลงทะเบียนกะล่วงหน้า
              </h3>
              <p className="text-xs text-muted mt-1">
                วางแผนการโยกย้ายกะในเดือนถัดไป (ข้อมูลจำลองเพื่อการทดสอบ)
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => {
                  const [year, month] = shiftPlanMonth.split('-').map(Number);
                  const prevMonth = month === 1 ? 12 : month - 1;
                  const prevYear = month === 1 ? year - 1 : year;
                  setShiftPlanMonth(`${prevYear}-${String(prevMonth).padStart(2, '0')}`);
                }}
                className="p-2 bg-soft hover:bg-soft/80 border border-app rounded-lg transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-app" />
              </button>
              <input
                type="month"
                value={shiftPlanMonth}
                onChange={(e) => setShiftPlanMonth(e.target.value)}
                className="px-4 py-2 bg-soft border border-app rounded-lg text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue"
              />
              <button
                onClick={() => {
                  const [year, month] = shiftPlanMonth.split('-').map(Number);
                  const nextMonth = month === 12 ? 1 : month + 1;
                  const nextYear = month === 12 ? year + 1 : year;
                  setShiftPlanMonth(`${nextYear}-${String(nextMonth).padStart(2, '0')}`);
                }}
                className="p-2 bg-soft hover:bg-soft/80 border border-app rounded-lg transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-app" />
              </button>
            </div>
          </div>
        </div>

        {shiftPlanRows.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-soft border-b-2 border-app sticky top-0 z-10">
                <tr>
                  <th className="px-2 py-3 text-center text-xs font-semibold text-app border-r border-app sticky left-0 bg-soft z-20 min-w-[30px] w-[30px]">
                    NO
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-app border-r border-app sticky left-[30px] bg-soft z-20 min-w-[200px]">
                    ชื่อ-สกุล
                  </th>
                  <th className="px-3 py-3 text-center text-xs font-semibold text-app border-r border-app sticky left-[230px] bg-soft z-20 min-w-[100px]">
                    แผนก
                  </th>
                  <th className="px-3 py-3 text-center text-xs font-semibold text-app border-r border-app sticky left-[330px] bg-soft z-20 min-w-[120px]">
                    กะปัจจุบัน
                  </th>
                  {planDays.map((day, idx) => (
                    <th
                      key={`plan-day-${idx}`}
                      className="px-2 py-3 text-center text-xs font-semibold text-app border-r border-app min-w-[60px]"
                    >
                      {day.getDate()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-app">
                {shiftPlanRows.map((data, empIndex) => {
                  const currentShift = data.employee.shiftId
                    ? shifts.find((s) => s.id === data.employee.shiftId)
                    : undefined;
                  return (
                    <motion.tr
                      key={`plan-row-${data.employee.id}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: empIndex * 0.02 }}
                      className="hover:bg-soft/50 transition-colors"
                    >
                      <td className="px-2 py-3 text-xs text-app font-semibold border-r border-app sticky left-0 bg-soft z-10 text-center min-w-[30px] w-[30px]">
                        {empIndex + 1}
                      </td>
                      <td className="px-3 py-3 text-sm text-app font-medium border-r border-app sticky left-[30px] bg-soft z-10">
                        {data.employee.name}
                      </td>
                      <td className="px-3 py-3 text-sm text-center text-app border-r border-app sticky left-[230px] bg-soft z-10">
                        <span className="text-xs text-ptt-cyan">{data.employee.category || "-"}</span>
                      </td>
                      <td className="px-3 py-3 text-sm text-center text-app border-r border-app sticky left-[330px] bg-soft z-10">
                        {currentShift ? (
                          <div className="text-xs">
                            <div className="text-ptt-cyan font-medium">
                              {currentShift.shiftType ? `กะ${currentShift.shiftType}` : ""} {currentShift.name}
                            </div>
                            <div className="text-muted text-[10px]">
                              {currentShift.startTime}-{currentShift.endTime}
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-muted">-</span>
                        )}
                      </td>
                      {data.schedule.map((plan, scheduleIdx) => {
                        const shift = plan.shift;
                        const colorClass = getShiftCellClass(shift);
                        return (
                          <td
                            key={`plan-cell-${plan.date}-${scheduleIdx}`}
                            className={`px-2 py-2 text-center text-xs border-r border-app ${colorClass}`}
                            title={
                              shift
                                ? `${plan.date}: ${shift.name} (${shift.startTime}-${shift.endTime})`
                                : `${plan.date}: ยังไม่กำหนด`
                            }
                          >
                            {shift ? (
                              <>
                                <p className="text-app font-semibold">{shift.name}</p>
                                <p className="text-[10px] text-muted">
                                  {shift.startTime}-{shift.endTime}
                                </p>
                              </>
                            ) : (
                              <span className="text-muted">-</span>
                            )}
                          </td>
                        );
                      })}
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted font-light">ไม่พบข้อมูลสำหรับเดือนที่เลือก</p>
          </div>
        )}
        <div className="px-6 py-4 border-t border-app bg-soft text-xs text-muted">
          💡 สามารถใช้ตารางนี้เป็นต้นแบบในการจัดตารางโยกย้ายกะจริงได้ตามนโยบายขององค์กร
        </div>
      </motion.div>


    </div>
  );
}

