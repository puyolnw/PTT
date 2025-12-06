import { useState, useEffect, useRef, useMemo } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, CheckCircle, AlertCircle, Users, Plus, FileText, ChevronLeft, ChevronRight, ArrowRightLeft, BarChart3, XCircle, Trash2 } from "lucide-react";
import { attendanceLogs as initialAttendanceLogs, employees, shifts, shiftAssignments, type AttendanceLog } from "@/data/mockData";

export default function Attendance() {
  const [attendanceLogs] = useState<AttendanceLog[]>(initialAttendanceLogs);
  const [_filteredLogs, setFilteredLogs] = useState<AttendanceLog[]>(attendanceLogs);
  const [searchQuery] = useState("");
  const [statusFilter] = useState("");
  const [shiftFilter] = useState<number | "">("");
  const [categoryFilter] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [_isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AttendanceLog | null>(null);
  const [selectedCellData, setSelectedCellData] = useState<{
    employee: typeof employees[0];
    date: Date;
    log: AttendanceLog | null;
  } | null>(null);
  
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
    status: "ตรงเวลา" as AttendanceLog["status"]
  });
  const [_recordForm, _setRecordForm] = useState({
    empCode: "",
    empName: "",
    date: "",
    checkIn: "",
    checkOut: "",
    otHours: "",
    reason: ""
  });
  
  // Shift plan modal states
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [selectedShiftDate, setSelectedShiftDate] = useState<{ date: Date; shift: typeof shifts[0] } | null>(null);
  const [assignEmployeeForm, setAssignEmployeeForm] = useState({
    empCode: ""
  });
  
  // Holiday management states
  const [isHolidayModalOpen, setIsHolidayModalOpen] = useState(false);
  const [holidays, setHolidays] = useState<Array<{ id: number; date: string; name: string; type: "holiday" | "special" }>>(() => {
    // วันหยุดเริ่มต้น (วันสำคัญของไทย)
    const currentYear = new Date().getFullYear();
    return [
      { id: 1, date: `${currentYear}-01-01`, name: "วันขึ้นปีใหม่", type: "holiday" },
      { id: 2, date: `${currentYear}-04-13`, name: "วันสงกรานต์", type: "holiday" },
      { id: 3, date: `${currentYear}-04-14`, name: "วันสงกรานต์", type: "holiday" },
      { id: 4, date: `${currentYear}-04-15`, name: "วันสงกรานต์", type: "holiday" },
      { id: 5, date: `${currentYear}-05-01`, name: "วันแรงงานแห่งชาติ", type: "holiday" },
      { id: 6, date: `${currentYear}-12-05`, name: "วันพ่อแห่งชาติ", type: "holiday" },
      { id: 7, date: `${currentYear}-12-10`, name: "วันรัฐธรรมนูญ", type: "holiday" },
      { id: 8, date: `${currentYear}-12-31`, name: "วันสิ้นปี", type: "holiday" },
    ];
  });
  const [newHoliday, setNewHoliday] = useState({
    date: "",
    name: "",
    type: "holiday" as "holiday" | "special"
  });
  
  // Employee-specific holiday states
  const [selectedHolidayDate, setSelectedHolidayDate] = useState<string>("");
  const [selectedHolidayCategory, setSelectedHolidayCategory] = useState<string>("");
  const [selectedHolidayEmployees, setSelectedHolidayEmployees] = useState<string[]>([]);
  const [employeeHolidays, setEmployeeHolidays] = useState<Array<{
    id: number;
    date: string;
    empCode: string;
    empName: string;
    category: string;
    reason?: string;
  }>>([]);
  
  const shiftPlanRef = useRef<HTMLDivElement | null>(null);
  const shiftColorPalette = ["bg-green-500/20", "bg-blue-500/20", "bg-purple-500/20", "bg-orange-500/20", "bg-ptt-cyan/20"];



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


  // Get employees assigned to a specific shift and date
  const getEmployeesForShift = (shift: typeof shifts[0], date: Date) => {
    // Get all employees in the same category as the selected shift
    const categoryEmployees = employees.filter(
      emp => emp.status === "Active" && emp.category === shift.category
    );
    
    // Get employees who are assigned to this shift (from shiftAssignments)
    const assignedEmployees = shiftAssignments
      .filter(
        assignment =>
          assignment.shiftId === shift.id &&
          assignment.status === "Active" &&
          new Date(assignment.effectiveDate) <= date &&
          (!assignment.endDate || new Date(assignment.endDate) >= date)
      )
      .map(assignment => employees.find(emp => emp.code === assignment.empCode))
      .filter(Boolean) as typeof employees;
    
    return {
      assigned: assignedEmployees,
      available: categoryEmployees.filter(emp => !assignedEmployees.find(ae => ae.code === emp.code))
    };
  };

  // Handle opening shift modal
  const handleShiftClick = (date: Date, shift: typeof shifts[0]) => {
    setSelectedShiftDate({ date, shift });
    setIsShiftModalOpen(true);
    setAssignEmployeeForm({ empCode: "" });
  };

  // Handle closing shift modal
  const handleCloseShiftModal = () => {
    setIsShiftModalOpen(false);
    setSelectedShiftDate(null);
    setAssignEmployeeForm({ empCode: "" });
  };

  // Handle assigning employee to shift
  const handleAssignEmployeeToShift = () => {
    if (!selectedShiftDate || !assignEmployeeForm.empCode) {
      alert("กรุณาเลือกพนักงาน");
      return;
    }

    const employee = employees.find(e => e.code === assignEmployeeForm.empCode);
    if (!employee) {
      alert("ไม่พบข้อมูลพนักงาน");
      return;
    }

    // Update employee's shift (in real app, this would be persisted to database)
    // For now, just show confirmation
    alert(
      `บันทึกการมอบหมายสำเร็จ!\n` +
      `พนักงาน: ${employee.name}\n` +
      `กะ: ${selectedShiftDate.shift.name} (${selectedShiftDate.shift.startTime}-${selectedShiftDate.shift.endTime})\n` +
      `วันที่: ${selectedShiftDate.date.toLocaleDateString('th-TH')}`
    );
    
    setAssignEmployeeForm({ empCode: "" });
    // Optionally close modal
    // handleCloseShiftModal();
  };

  // Handle saving shift plan registration
  const handleSaveShiftRegistration = () => {
    if (!selectedShiftDate) return;

    const { assigned } = getEmployeesForShift(selectedShiftDate.shift, selectedShiftDate.date);
    
    if (assigned.length === 0) {
      alert("กรุณาเพิ่มพนักงานเข้ากะก่อนบันทึก");
      return;
    }

    // Format data for registration
    const registrationData = {
      shiftId: selectedShiftDate.shift.id,
      shiftName: selectedShiftDate.shift.name,
      shiftTime: `${selectedShiftDate.shift.startTime}-${selectedShiftDate.shift.endTime}`,
      registrationDate: selectedShiftDate.date.toLocaleDateString('th-TH'),
      employeeCount: assigned.length,
      employees: assigned.map(emp => `${emp.name} (${emp.code})`).join(", "),
      category: selectedShiftDate.shift.category,
      savedDate: new Date().toLocaleDateString('th-TH'),
      savedTime: new Date().toLocaleTimeString('th-TH')
    };

    // Show confirmation with detailed information
    alert(
      `✅ บันทึกการลงทะเบียนกะล่วงหน้าสำเร็จ!\n\n` +
      `📋 รายละเอียดการลงทะเบียน:\n` +
      `━━━━━━━━━━━━━━━━━━━━━\n` +
      `กะ: ${registrationData.shiftName}\n` +
      `เวลา: ${registrationData.shiftTime}\n` +
      `วันที่: ${registrationData.registrationDate}\n` +
      `แผนก: ${registrationData.category}\n` +
      `จำนวนพนักงาน: ${registrationData.employeeCount} คน\n\n` +
      `👥 พนักงานที่ลงทะเบียน:\n` +
      `${assigned.map(emp => `   • ${emp.name} (${emp.code})`).join("\n")}\n\n` +
      `⏰ บันทึกเมื่อ: ${registrationData.savedDate} ${registrationData.savedTime}`
    );

    handleCloseShiftModal();
  };

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

  const handleOpenAbsenceDashboard = () => {
    window.open("/app/hr/attendance-absence", "_blank");
  };

  // Holiday management functions
  const handleAddHoliday = () => {
    if (!newHoliday.date || !newHoliday.name.trim()) {
      alert("กรุณากรอกวันที่และชื่อวันหยุด");
      return;
    }

    // ตรวจสอบว่ามีวันหยุดซ้ำหรือไม่
    const isDuplicate = holidays.some(h => h.date === newHoliday.date);
    if (isDuplicate) {
      alert("วันหยุดนี้มีอยู่แล้วในระบบ");
      return;
    }

    const newId = Math.max(...holidays.map(h => h.id), 0) + 1;
    setHolidays([...holidays, { ...newHoliday, id: newId }]);
    setNewHoliday({ date: "", name: "", type: "holiday" });
    alert("เพิ่มวันหยุดสำเร็จ");
  };

  const handleDeleteHoliday = (id: number) => {
    if (confirm("คุณต้องการลบวันหยุดนี้หรือไม่?")) {
      setHolidays(holidays.filter(h => h.id !== id));
      alert("ลบวันหยุดสำเร็จ");
    }
  };

  // ตรวจสอบว่าวันที่นั้นเป็นวันหยุดหรือไม่ (สำหรับทุกคน)
  const isHoliday = (date: Date): boolean => {
    const dateStr = date.toISOString().split('T')[0];
    const dayOfWeek = date.getDay();
    
    // ตรวจสอบวันหยุดสุดสัปดาห์
    if (dayOfWeek === 0 || dayOfWeek === 6) return true;
    
    // ตรวจสอบวันหยุดพิเศษ
    return holidays.some(h => h.date === dateStr);
  };

  // ตรวจสอบว่าพนักงานคนนี้หยุดวันนี้หรือไม่
  const isEmployeeHoliday = (date: Date, empCode: string): boolean => {
    const dateStr = date.toISOString().split('T')[0];
    return employeeHolidays.some(eh => eh.date === dateStr && eh.empCode === empCode);
  };

  const getHolidayName = (date: Date): string | null => {
    const dateStr = date.toISOString().split('T')[0];
    const holiday = holidays.find(h => h.date === dateStr);
    return holiday ? holiday.name : null;
  };

  // Get employees by category
  const getEmployeesByCategory = (category: string) => {
    return employees.filter(emp => emp.category === category && emp.status === "Active");
  };

  // Handle adding employee holiday
  const handleAddEmployeeHoliday = () => {
    if (!selectedHolidayDate || !selectedHolidayCategory || selectedHolidayEmployees.length === 0) {
      alert("กรุณาเลือกวันที่ แผนก และพนักงาน");
      return;
    }

    const newEmployeeHolidays = selectedHolidayEmployees.map(empCode => {
      const emp = employees.find(e => e.code === empCode);
      if (!emp) return null;
      
      // ตรวจสอบว่ามีข้อมูลซ้ำหรือไม่
      const existing = employeeHolidays.find(
        eh => eh.date === selectedHolidayDate && eh.empCode === empCode
      );
      if (existing) return null;

      const newId = Math.max(...employeeHolidays.map(eh => eh.id), 0) + 1;
      return {
        id: newId,
        date: selectedHolidayDate,
        empCode: emp.code,
        empName: emp.name,
        category: emp.category || "",
        reason: ""
      };
    }).filter(Boolean) as typeof employeeHolidays;

    if (newEmployeeHolidays.length > 0) {
      setEmployeeHolidays([...employeeHolidays, ...newEmployeeHolidays]);
      setSelectedHolidayEmployees([]);
      alert(`เพิ่มวันหยุดให้พนักงาน ${newEmployeeHolidays.length} คนสำเร็จ`);
    } else {
      alert("พนักงานที่เลือกมีวันหยุดในวันนี้อยู่แล้ว");
    }
  };

  // Handle removing employee holiday
  const handleRemoveEmployeeHoliday = (id: number) => {
    if (confirm("คุณต้องการลบวันหยุดนี้หรือไม่?")) {
      setEmployeeHolidays(employeeHolidays.filter(eh => eh.id !== id));
      alert("ลบวันหยุดสำเร็จ");
    }
  };

  // Handle cell click to edit
  const handleCellClick = (employee: typeof employees[0], date: Date, log: AttendanceLog | null) => {
    // Skip if it's a holiday
    if (isHoliday(date) || isEmployeeHoliday(date, employee.code)) {
      return;
    }

    setSelectedCellData({ employee, date, log });
    
    if (log) {
      setEditForm({
        checkIn: log.checkIn !== "-" ? log.checkIn : "",
        checkOut: log.checkOut !== "-" ? log.checkOut : "",
        reason: "",
        status: log.status
      });
      setSelectedLog(log);
    } else {
      // New record
      const empShift = employee.shiftId ? shifts.find(s => s.id === employee.shiftId) : null;
      setEditForm({
        checkIn: empShift ? empShift.startTime : "",
        checkOut: empShift ? empShift.endTime : "",
        reason: "",
        status: "ตรงเวลา"
      });
      setSelectedLog(null);
    }
    
    setIsEditModalOpen(true);
  };

  // Handle save edit
  const handleSaveEdit = () => {
    if (!selectedCellData) return;

    const { employee, date, log } = selectedCellData;
    const dateStr = date.toISOString().split('T')[0];

    // Validate times
    if (editForm.checkIn && !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(editForm.checkIn)) {
      alert("รูปแบบเวลาเข้าไม่ถูกต้อง (ใช้รูปแบบ HH:MM)");
      return;
    }
    if (editForm.checkOut && !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(editForm.checkOut)) {
      alert("รูปแบบเวลาออกไม่ถูกต้อง (ใช้รูปแบบ HH:MM)");
      return;
    }

    // Calculate status based on check-in time
    let status: AttendanceLog["status"] = "ตรงเวลา";
    if (editForm.status === "ลา" || editForm.status === "ขาดงาน") {
      status = editForm.status;
    } else if (editForm.checkIn) {
      const empShift = employee.shiftId ? shifts.find(s => s.id === employee.shiftId) : null;
      if (empShift) {
        const [shiftHour, shiftMin] = empShift.startTime.split(':').map(Number);
        const [checkHour, checkMin] = editForm.checkIn.split(':').map(Number);
        const shiftMinutes = shiftHour * 60 + shiftMin;
        const checkMinutes = checkHour * 60 + checkMin;
        const lateMinutes = checkMinutes - shiftMinutes;
        
        if (lateMinutes > 0) {
          if (lateMinutes <= 1) status = "สาย 1 นาที";
          else if (lateMinutes <= 5) status = "สาย 5 นาที";
          else status = "สาย 15 นาที";
        }
      }
    }

    // Create or update log
    const updatedLog: AttendanceLog = {
      id: log?.id || Date.now(),
      empCode: employee.code,
      empName: employee.name,
      date: dateStr,
      checkIn: editForm.checkIn || "-",
      checkOut: editForm.checkOut || "-",
      status,
      lateMinutes: status.includes("สาย") ? (() => {
        const empShift = employee.shiftId ? shifts.find(s => s.id === employee.shiftId) : null;
        if (empShift && editForm.checkIn) {
          const [shiftHour, shiftMin] = empShift.startTime.split(':').map(Number);
          const [checkHour, checkMin] = editForm.checkIn.split(':').map(Number);
          return (checkHour * 60 + checkMin) - (shiftHour * 60 + shiftMin);
        }
        return 0;
      })() : undefined,
      otHours: 0,
      otAmount: 0
    };

    // In a real app, this would update the database
    // For now, we'll just show a confirmation
    // Note: updatedLog is created but not used in this mock implementation
    void updatedLog;
    alert(
      `บันทึกข้อมูลสำเร็จ!\n\n` +
      `พนักงาน: ${employee.name} (${employee.code})\n` +
      `วันที่: ${date.toLocaleDateString('th-TH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}\n` +
      `เวลาเข้า: ${editForm.checkIn || "-"}\n` +
      `เวลาออก: ${editForm.checkOut || "-"}\n` +
      `สถานะ: ${status}`
    );

    setIsEditModalOpen(false);
    setSelectedCellData(null);
    setSelectedLog(null);
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
            {viewMode === "calendar" ? "ลงทะเบียนกะล่วงหน้า" : "ตารางลงเวลาทำงาน"}
          </button>
          <button
            onClick={handleOpenAbsenceDashboard}
            className="inline-flex items-center gap-2 px-4 py-2 bg-soft hover:bg-soft/80 
                     text-app border border-app rounded-xl transition-all duration-200 font-medium"
          >
            <BarChart3 className="w-4 h-4 text-red-400" />
            แสดงพนักงานขาด/ลา
          </button>
          <button
            onClick={() => setIsHolidayModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-soft hover:bg-soft/80 
                     text-app border border-app rounded-xl transition-all duration-200 font-medium"
          >
            <XCircle className="w-4 h-4 text-orange-400" />
            จัดการวันหยุด
          </button>
          <button
            onClick={() => {
              if (viewMode === "list") {
                // When in shift plan view, show save registration button behavior
                alert("กรุณาเลือกกะเพื่อบันทึกการลงทะเบียน");
              } else {
                setIsRecordModalOpen(true);
              }
            }}
            className="inline-flex items-center gap-2 px-6 py-3 bg-ptt-cyan hover:bg-ptt-cyan/80 
                     text-app rounded-xl transition-all duration-200 font-semibold 
                     shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            <Plus className="w-5 h-5" />
            {viewMode === "list" ? "บันทึกข้อมูลลงทะเบียนกะ" : "บันทึกเวลาเข้าออกใหม่"}
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
                        {shift.shortCode ? `[${shift.shortCode}] ` : ""}{shift.shiftType ? `กะ${shift.shiftType}` : ""} {shift.name} {shift.description ? `(${shift.description})` : ""}
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
                            {data.shift.shortCode && (
                              <span className="bg-ptt-cyan/20 px-1.5 py-0.5 rounded text-[10px] font-bold mr-1">
                                {data.shift.shortCode}
                              </span>
                            )}
                            {data.shift.shiftType ? `กะ${data.shift.shiftType}` : ""} {data.shift.name}
                          </div>
                          <div className="text-muted text-[10px]">{data.shift.startTime}-{data.shift.endTime}</div>
                        </div>
                      ) : (
                        <span className="text-xs text-muted">-</span>
                      )}
                    </td>
                    {data.attendance.map((att, dayIndex) => {
                      // ตรวจสอบวันหยุด (วันเสาร์-อาทิตย์ และวันหยุดพิเศษ)
                      const day = days[dayIndex];
                      const isHolidayDay = isHoliday(day);
                      const isEmpHoliday = isEmployeeHoliday(day, data.employee.code);
                      const holidayName = getHolidayName(day);
                      
                      const getCellColor = () => {
                        if (isHolidayDay || isEmpHoliday) return "bg-gray-200/30";
                        if (!att.log) return "";
                        if (att.status === "ลา") return "bg-yellow-200/30";
                        if (att.status === "ขาดงาน") return "bg-red-200/30";
                        if (att.status?.includes("สาย")) return "bg-orange-200/30";
                        return "";
                      };
                      
                      const getCellContent = () => {
                        // ถ้าเป็นวันหยุดแสดง "off" (ทั้งวันหยุดทั่วไปและวันหยุดเฉพาะพนักงาน)
                        if (isHolidayDay || isEmpHoliday) {
                          return (
                            <div className="flex flex-col gap-0.5">
                              <div className="text-[10px] font-semibold text-gray-600 dark:text-gray-400">
                                off
                              </div>
                              {holidayName && (
                                <div className="text-[8px] text-gray-500 dark:text-gray-500 truncate" title={holidayName}>
                                  {holidayName.length > 6 ? holidayName.substring(0, 6) + "..." : holidayName}
                                </div>
                              )}
                            </div>
                          );
                        }
                        
                        if (!att.log) {
                          return (
                            <div className="text-[9px] text-muted">-</div>
                          );
                        }
                        
                        if (att.status === "ลา") {
                          return (
                            <div className="text-[9px] font-semibold text-yellow-700 dark:text-yellow-400">
                              ลา
                            </div>
                          );
                        }
                        
                        if (att.status === "ขาดงาน") {
                          return (
                            <div className="text-[9px] font-semibold text-red-700 dark:text-red-400">
                              ขาด
                            </div>
                          );
                        }
                        
                        // แสดงเวลาเข้าและเวลาออก
                        if (att.checkIn && att.checkOut && att.checkIn !== "-" && att.checkOut !== "-") {
                          return (
                            <div className="flex flex-col gap-0.5">
                              <div className={`text-[9px] font-medium ${
                                att.status?.includes("สาย") 
                                  ? "text-orange-700 dark:text-orange-400" 
                                  : "text-green-700 dark:text-green-400"
                              }`}>
                                {att.checkIn.replace(':', '.')}
                              </div>
                              <div className="text-[9px] text-blue-700 dark:text-blue-400">
                                {att.checkOut.replace(':', '.')}
                              </div>
                            </div>
                          );
                        }
                        
                        // ถ้ามีแค่เวลาเข้า
                        if (att.checkIn && att.checkIn !== "-") {
                          return (
                            <div className={`text-[9px] font-medium ${
                              att.status?.includes("สาย") 
                                ? "text-orange-700 dark:text-orange-400" 
                                : "text-green-700 dark:text-green-400"
                            }`}>
                              {att.checkIn.replace(':', '.')}
                            </div>
                          );
                        }
                        
                        return (
                          <div className="text-[9px] text-muted">-</div>
                        );
                      };
                      
                      const getTooltip = () => {
                        if (isHolidayDay || isEmpHoliday) {
                          if (isEmpHoliday && !isHolidayDay) {
                            return `วันหยุดเฉพาะพนักงาน\n${day.toLocaleDateString('th-TH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`;
                          }
                          if (holidayName) {
                            return `วันหยุด - ${holidayName}\n${day.toLocaleDateString('th-TH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`;
                          }
                          return `วันหยุด - ${day.toLocaleDateString('th-TH', { weekday: 'long' })}`;
                        }
                        if (!att.log) return `วันที่ ${day.getDate()} - ไม่มีข้อมูล`;
                        let tooltip = `${att.log.date}: ${att.log.status}`;
                        if (att.checkIn && att.checkIn !== "-") tooltip += `\nเข้า: ${att.checkIn}`;
                        if (att.checkOut && att.checkOut !== "-") tooltip += `\nออก: ${att.checkOut}`;
                        return tooltip;
                      };
                      
                      return (
                        <td
                          key={dayIndex}
                          onClick={() => handleCellClick(data.employee, day, att.log || null)}
                          className={`px-2 py-2 text-center border-r border-app ${getCellColor()} ${
                            !isHolidayDay && !isEmpHoliday ? "cursor-pointer hover:bg-soft/70 transition-colors" : ""
                          }`}
                          title={getTooltip() + (!isHolidayDay && !isEmpHoliday ? "\n(คลิกเพื่อแก้ไข)" : "")}
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

      {/* Shift Plan Table - Hide in calendar view */}
      {viewMode === "list" && (
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
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-2">
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
            </div>
          </div>
        </div>

        {shiftPlanRows.length > 0 ? (
          <>
            {/* Calendar Header - Weekdays */}
            <div className="bg-soft border-b border-app">
              <div className="grid grid-cols-7 border-b-2 border-app bg-ink-800">
                {['จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส', 'อา'].map((day) => (
                  <div
                    key={day}
                    className="px-3 py-3 text-center text-xs font-semibold text-app border-r border-app last:border-r-0"
                  >
                    {day}
                  </div>
                ))}
              </div>
              
              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-0">
                {/* Empty cells for days before month starts */}
                {planDays.length > 0 && Array.from({ length: planDays[0].getDay() }).map((_, idx) => (
                  <div
                    key={`empty-${idx}`}
                    className="min-h-[120px] border-r border-b border-app last:border-r-0 bg-ink-900/50"
                  />
                ))}
                
                {/* Calendar days */}
                {planDays.map((day, idx) => {
                  const dayOfWeek = day.getDay();
                  const isLastCol = dayOfWeek === 6;
                  const isLastRow = idx === planDays.length - 1;
                  
                  // Get all unique shifts to display for this day
                  let shiftsToDisplay: typeof shifts = [];
                  
                  if (selectedShift !== "") {
                    // If specific shift is selected, show only that shift
                    const specificShift = shifts.find(s => s.id === selectedShift);
                    if (specificShift) {
                      shiftsToDisplay = [specificShift];
                    }
                  } else if (selectedCategory) {
                    // If category is selected, show all shifts for that category
                    shiftsToDisplay = shifts.filter(s => s.category === selectedCategory);
                  } else {
                    // If no filter, show all shifts
                    shiftsToDisplay = shifts;
                  }
                  
                  return (
                    <div
                      key={`day-${idx}`}
                      className={`min-h-[200px] border-r border-b border-app p-2 bg-soft/50 hover:bg-soft transition-colors ${
                        isLastCol ? 'border-r-0' : ''
                      } ${isLastRow ? 'border-b-0' : ''}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-app">
                          {day.getDate()}
                        </span>
                        <span className="text-xs text-muted">
                          {day.toLocaleDateString('th-TH', { month: 'short' })}
                        </span>
                      </div>
                      
                      {/* Show all shifts for this category/day */}
                      <div className="space-y-2 text-xs">
                        {shiftsToDisplay.map((shift) => {
                          const shiftColor = shiftColorPalette[shift.id % shiftColorPalette.length];
                          
                          // Get employees assigned to this shift on this day
                          const employeesInShift = shiftAssignments
                            .filter(
                              assignment =>
                                assignment.shiftId === shift.id &&
                                assignment.status === "Active" &&
                                new Date(assignment.effectiveDate) <= day &&
                                (!assignment.endDate || new Date(assignment.endDate) >= day)
                            )
                            .map(assignment => employees.find(emp => emp.code === assignment.empCode))
                            .filter(Boolean) as typeof employees;
                          
                          return (
                            <div
                              key={`${shift.id}-${idx}`}
                              onClick={() => handleShiftClick(day, shift)}
                              className={`p-2 rounded text-[11px] font-medium ${shiftColor} cursor-pointer hover:shadow-md hover:scale-105 transition-all duration-200 border border-app/30`}
                              title={`${shift.name} (${shift.startTime}-${shift.endTime}) - คลิกเพื่อดูรายละเอียด`}
                            >
                              {/* Shift info */}
                              <div className="font-semibold text-app truncate mb-1">
                                {shift.shortCode && (
                                  <span className="bg-app/20 px-1 rounded text-[9px] font-bold mr-1">
                                    {shift.shortCode}
                                  </span>
                                )}
                                {shift.shiftType ? `กะ${shift.shiftType}` : shift.name}
                              </div>
                              <div className="text-[10px] text-muted mb-1">{shift.startTime}-{shift.endTime}</div>
                              
                              {/* Employees in shift */}
                              {employeesInShift.length > 0 ? (
                                <div className="bg-app/10 rounded px-1.5 py-1 mt-1">
                                  <div className="text-[9px] text-app font-semibold mb-0.5">
                                    👤 {employeesInShift.length} คน
                                  </div>
                                  <div className="space-y-0.5">
                                    {employeesInShift.map((emp) => (
                                      <div key={emp.code} className="text-[9px] text-app truncate">
                                        {emp.name.substring(0, 10)}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ) : (
                                <div className="bg-red-500/20 rounded px-1.5 py-1 mt-1 text-center text-[9px] text-red-700 font-semibold">
                                  ยังไม่มีคน
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted font-light">ไม่พบข้อมูลสำหรับเดือนที่เลือก</p>
          </div>
        )}
          <div className="px-6 py-4 border-t border-app bg-soft">
            <div className="flex flex-wrap gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500/20 border border-app rounded"></div>
                <span className="text-app">กะเช้า</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-500/20 border border-app rounded"></div>
                <span className="text-app">กะบ่าย</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-purple-500/20 border border-app rounded"></div>
                <span className="text-app">กะกลางคืน</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-orange-500/20 border border-app rounded"></div>
                <span className="text-app">กะอื่น ๆ</span>
              </div>
            </div>
          </div>
      </motion.div>
      )}

      {/* Shift Detail Modal */}
      {isShiftModalOpen && selectedShiftDate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-soft border border-app rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Modal Header */}
            <div className="sticky top-0 px-6 py-4 border-b border-app bg-soft flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-app font-display flex items-center gap-2">
                  {selectedShiftDate.shift.shortCode && (
                    <span className="bg-ptt-cyan/20 px-2 py-1 rounded text-sm font-bold">
                      {selectedShiftDate.shift.shortCode}
                    </span>
                  )}
                  {selectedShiftDate.shift.name}
                </h3>
                <p className="text-sm text-muted mt-1">
                  {selectedShiftDate.shift.startTime} - {selectedShiftDate.shift.endTime}
                  {selectedShiftDate.shift.description && ` • ${selectedShiftDate.shift.description}`}
                </p>
                <p className="text-sm text-ptt-cyan mt-1 font-medium">
                  {selectedShiftDate.date.toLocaleDateString('th-TH', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
              <button
                onClick={handleCloseShiftModal}
                className="text-muted hover:text-app transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Shift Info */}
              <div className="bg-soft/50 border border-app rounded-xl p-4">
                <h4 className="font-semibold text-app mb-3">ข้อมูลกะ</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted mb-1">ชื่อกะ</p>
                    <p className="text-sm font-medium text-app">{selectedShiftDate.shift.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted mb-1">ตัวย่อ</p>
                    <p className="text-sm font-medium text-app">
                      {selectedShiftDate.shift.shortCode || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted mb-1">ประเภท</p>
                    <p className="text-sm font-medium text-app">
                      {selectedShiftDate.shift.shiftType ? `กะ${selectedShiftDate.shift.shiftType}` : "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted mb-1">เวลาทำงาน</p>
                    <p className="text-sm font-medium text-app">{selectedShiftDate.shift.startTime} - {selectedShiftDate.shift.endTime}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted mb-1">แผนก</p>
                    <p className="text-sm font-medium text-app">{selectedShiftDate.shift.category || "-"}</p>
                  </div>
                </div>
              </div>

              {/* Assigned Employees */}
              {(() => {
                const { assigned } = getEmployeesForShift(selectedShiftDate.shift, selectedShiftDate.date);
                return (
                  <div>
                    <h4 className="font-semibold text-app mb-3 flex items-center gap-2">
                      <Users className="w-4 h-4 text-ptt-cyan" />
                      พนักงานในกะนี้ ({assigned.length})
                    </h4>
                    {assigned.length > 0 ? (
                      <div className="space-y-2">
                        {assigned.map((emp) => (
                          <div
                            key={emp.id}
                            className="flex items-center justify-between bg-soft/50 border border-app rounded-lg p-3 hover:bg-soft transition-colors"
                          >
                            <div>
                              <p className="font-medium text-app">{emp.name}</p>
                              <p className="text-xs text-muted">{emp.code}</p>
                            </div>
                            <span className="text-xs bg-green-500/20 text-green-600 px-2 py-1 rounded">
                              ได้รับมอบหมาย
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted bg-soft/50 rounded-lg p-4 text-center">
                        ยังไม่มีพนักงานในกะนี้
                      </p>
                    )}
                  </div>
                );
              })()}

              {/* Add Employee Section */}
              <div className="border-t border-app pt-6">
                <h4 className="font-semibold text-app mb-3 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-ptt-cyan" />
                  เพิ่มพนักงานเข้ากะ
                </h4>
                
                {(() => {
                  const { available } = getEmployeesForShift(selectedShiftDate.shift, selectedShiftDate.date);
                  return available.length > 0 ? (
                    <div className="space-y-3">
                      <select
                        value={assignEmployeeForm.empCode}
                        onChange={(e) => setAssignEmployeeForm({ empCode: e.target.value })}
                        className="w-full px-3 py-2 bg-soft border border-app rounded-lg text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue text-sm"
                      >
                        <option value="">เลือกพนักงาน</option>
                        {available.map((emp) => (
                          <option key={emp.id} value={emp.code}>
                            {emp.name} ({emp.code})
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={handleAssignEmployeeToShift}
                        disabled={!assignEmployeeForm.empCode}
                        className="w-full px-4 py-2 bg-ptt-cyan hover:bg-ptt-cyan/80 disabled:bg-muted disabled:cursor-not-allowed 
                                 text-app font-semibold rounded-lg transition-all duration-200"
                      >
                        <Plus className="w-4 h-4 inline mr-2" />
                        เพิ่มพนักงาน
                      </button>
                    </div>
                  ) : (
                    <p className="text-sm text-muted bg-soft/50 rounded-lg p-4 text-center">
                      ไม่มีพนักงานที่สามารถเพิ่มเข้ากะนี้ (ทุกคนได้รับมอบหมายแล้ว)
                    </p>
                  );
                })()}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 px-6 py-4 border-t border-app bg-soft flex justify-end gap-2">
              <button
                onClick={handleCloseShiftModal}
                className="px-4 py-2 bg-soft border border-app hover:bg-soft/80 text-app 
                         font-medium rounded-lg transition-all duration-200"
              >
                ปิด
              </button>
              <button
                onClick={handleSaveShiftRegistration}
                className="inline-flex items-center gap-2 px-6 py-2 bg-ptt-cyan hover:bg-ptt-cyan/80 
                         text-app font-semibold rounded-lg transition-all duration-200 
                         shadow-md hover:shadow-lg"
              >
                <CheckCircle className="w-5 h-5" />
                บันทึกการลงทะเบียน
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Holiday Management Modal */}
      {isHolidayModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-soft border border-app rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Modal Header */}
            <div className="sticky top-0 px-6 py-4 border-b border-app bg-soft flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-app font-display flex items-center gap-2">
                  <XCircle className="w-6 h-6 text-orange-400" />
                  จัดการวันหยุด
                </h3>
                <p className="text-sm text-muted mt-1">
                  เพิ่ม แก้ไข หรือลบวันหยุดประจำปี
                </p>
              </div>
              <button
                onClick={() => setIsHolidayModalOpen(false)}
                className="text-muted hover:text-app transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Add Holiday Form */}
              <div className="bg-soft/50 border border-app rounded-xl p-4">
                <h4 className="font-semibold text-app mb-4 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-ptt-cyan" />
                  เพิ่มวันหยุดใหม่
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-muted mb-2">วันที่</label>
                    <input
                      type="date"
                      value={newHoliday.date}
                      onChange={(e) => setNewHoliday({ ...newHoliday, date: e.target.value })}
                      className="w-full px-3 py-2 bg-soft border border-app rounded-lg text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-muted mb-2">ชื่อวันหยุด</label>
                    <input
                      type="text"
                      value={newHoliday.name}
                      onChange={(e) => setNewHoliday({ ...newHoliday, name: e.target.value })}
                      placeholder="เช่น วันสงกรานต์"
                      className="w-full px-3 py-2 bg-soft border border-app rounded-lg text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-muted mb-2">ประเภท</label>
                    <select
                      value={newHoliday.type}
                      onChange={(e) => setNewHoliday({ ...newHoliday, type: e.target.value as "holiday" | "special" })}
                      className="w-full px-3 py-2 bg-soft border border-app rounded-lg text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue text-sm"
                    >
                      <option value="holiday">วันหยุดประจำ</option>
                      <option value="special">วันหยุดพิเศษ</option>
                    </select>
                  </div>
                </div>
                <button
                  onClick={handleAddHoliday}
                  className="mt-4 w-full px-4 py-2 bg-ptt-cyan hover:bg-ptt-cyan/80 
                           text-app font-semibold rounded-lg transition-all duration-200 
                           shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  เพิ่มวันหยุด
                </button>
              </div>

              {/* Add Employee Holiday Section */}
              <div className="bg-soft/50 border border-app rounded-xl p-4">
                <h4 className="font-semibold text-app mb-4 flex items-center gap-2">
                  <Users className="w-4 h-4 text-ptt-cyan" />
                  เพิ่มวันหยุดให้พนักงาน
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-xs text-muted mb-2">วันที่</label>
                    <input
                      type="date"
                      value={selectedHolidayDate}
                      onChange={(e) => {
                        setSelectedHolidayDate(e.target.value);
                        setSelectedHolidayCategory("");
                        setSelectedHolidayEmployees([]);
                      }}
                      className="w-full px-3 py-2 bg-soft border border-app rounded-lg text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-muted mb-2">แผนก</label>
                    <select
                      value={selectedHolidayCategory}
                      onChange={(e) => {
                        setSelectedHolidayCategory(e.target.value);
                        setSelectedHolidayEmployees([]);
                      }}
                      disabled={!selectedHolidayDate}
                      className="w-full px-3 py-2 bg-soft border border-app rounded-lg text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="">เลือกแผนก</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat || ""}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-muted mb-2">พนักงาน</label>
                    <select
                      multiple
                      value={selectedHolidayEmployees}
                      onChange={(e) => {
                        const selected = Array.from(e.target.selectedOptions, option => option.value);
                        setSelectedHolidayEmployees(selected);
                      }}
                      disabled={!selectedHolidayCategory}
                      size={5}
                      className="w-full px-3 py-2 bg-soft border border-app rounded-lg text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {selectedHolidayCategory && getEmployeesByCategory(selectedHolidayCategory).map((emp) => {
                        const isAlreadyHoliday = employeeHolidays.some(
                          eh => eh.date === selectedHolidayDate && eh.empCode === emp.code
                        );
                        return (
                          <option 
                            key={emp.id} 
                            value={emp.code}
                            disabled={isAlreadyHoliday}
                            className={isAlreadyHoliday ? "opacity-50" : ""}
                          >
                            {emp.name} ({emp.code}) {isAlreadyHoliday ? " - มีวันหยุดแล้ว" : ""}
                          </option>
                        );
                      })}
                    </select>
                    <p className="text-xs text-muted mt-1">
                      กด Ctrl/Cmd + คลิกเพื่อเลือกหลายคน
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleAddEmployeeHoliday}
                  disabled={!selectedHolidayDate || !selectedHolidayCategory || selectedHolidayEmployees.length === 0}
                  className="w-full px-4 py-2 bg-ptt-cyan hover:bg-ptt-cyan/80 disabled:bg-muted disabled:cursor-not-allowed 
                           text-app font-semibold rounded-lg transition-all duration-200 
                           shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  เพิ่มวันหยุดให้พนักงาน ({selectedHolidayEmployees.length} คน)
                </button>
              </div>

              {/* Employee Holidays List */}
              <div>
                <h4 className="font-semibold text-app mb-4 flex items-center gap-2">
                  <Users className="w-4 h-4 text-ptt-cyan" />
                  รายการวันหยุดของพนักงาน ({employeeHolidays.length} รายการ)
                </h4>
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {employeeHolidays.length === 0 ? (
                    <div className="text-center py-8 text-muted">
                      <p>ยังไม่มีวันหยุดของพนักงาน</p>
                    </div>
                  ) : (
                    employeeHolidays
                      .sort((a, b) => {
                        const dateCompare = a.date.localeCompare(b.date);
                        if (dateCompare !== 0) return dateCompare;
                        return a.empName.localeCompare(b.empName);
                      })
                      .map((empHoliday) => {
                        const holidayDate = new Date(empHoliday.date);
                        return (
                          <div
                            key={empHoliday.id}
                            className="flex items-center justify-between bg-soft/50 border border-app rounded-lg p-4 hover:bg-soft transition-colors"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
                                  <Users className="w-6 h-6 text-orange-500" />
                                </div>
                                <div>
                                  <p className="font-medium text-app">{empHoliday.empName}</p>
                                  <p className="text-sm text-muted">{empHoliday.empCode} • {empHoliday.category}</p>
                                  <p className="text-xs text-muted mt-1">
                                    {holidayDate.toLocaleDateString('th-TH', {
                                      weekday: 'long',
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric'
                                    })}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => handleRemoveEmployeeHoliday(empHoliday.id)}
                              className="p-2 text-red-500 hover:bg-red-500/20 rounded-lg transition-colors"
                              title="ลบวันหยุด"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        );
                      })
                  )}
                </div>
              </div>

              {/* Holidays List */}
              <div>
                <h4 className="font-semibold text-app mb-4 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-ptt-cyan" />
                  รายการวันหยุด ({holidays.length} วัน)
                </h4>
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {holidays.length === 0 ? (
                    <div className="text-center py-8 text-muted">
                      <p>ยังไม่มีวันหยุดในระบบ</p>
                    </div>
                  ) : (
                    holidays
                      .sort((a, b) => a.date.localeCompare(b.date))
                      .map((holiday) => {
                        const holidayDate = new Date(holiday.date);
                        return (
                          <div
                            key={holiday.id}
                            className="flex items-center justify-between bg-soft/50 border border-app rounded-lg p-4 hover:bg-soft transition-colors"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-ptt-cyan/20 rounded-lg flex items-center justify-center">
                                  <Calendar className="w-6 h-6 text-ptt-cyan" />
                                </div>
                                <div>
                                  <p className="font-medium text-app">{holiday.name}</p>
                                  <p className="text-sm text-muted">
                                    {holidayDate.toLocaleDateString('th-TH', {
                                      weekday: 'long',
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric'
                                    })}
                                  </p>
                                  <span className={`text-xs px-2 py-0.5 rounded mt-1 inline-block ${
                                    holiday.type === "holiday"
                                      ? "bg-blue-500/20 text-blue-600"
                                      : "bg-purple-500/20 text-purple-600"
                                  }`}>
                                    {holiday.type === "holiday" ? "วันหยุดประจำ" : "วันหยุดพิเศษ"}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => handleDeleteHoliday(holiday.id)}
                              className="p-2 text-red-500 hover:bg-red-500/20 rounded-lg transition-colors"
                              title="ลบวันหยุด"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        );
                      })
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 px-6 py-4 border-t border-app bg-soft flex justify-end gap-2">
              <button
                onClick={() => setIsHolidayModalOpen(false)}
                className="px-6 py-2 bg-soft border border-app hover:bg-soft/80 text-app 
                         font-medium rounded-lg transition-all duration-200"
              >
                ปิด
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Edit Attendance Modal */}
      {isEditModalOpen && selectedCellData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-soft border border-app rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Modal Header */}
            <div className="sticky top-0 px-6 py-4 border-b border-app bg-soft flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-app font-display flex items-center gap-2">
                  <Clock className="w-6 h-6 text-ptt-cyan" />
                  {selectedLog ? "แก้ไขข้อมูลการลงเวลา" : "เพิ่มข้อมูลการลงเวลา"}
                </h3>
                <p className="text-sm text-muted mt-1">
                  {selectedCellData.employee.name} ({selectedCellData.employee.code})
                </p>
                <p className="text-sm text-ptt-cyan mt-1 font-medium">
                  {selectedCellData.date.toLocaleDateString('th-TH', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setSelectedCellData(null);
                  setSelectedLog(null);
                }}
                className="text-muted hover:text-app transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Employee Info */}
              <div className="bg-soft/50 border border-app rounded-xl p-4">
                <h4 className="font-semibold text-app mb-3">ข้อมูลพนักงาน</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted mb-1">ชื่อ-สกุล</p>
                    <p className="text-sm font-medium text-app">{selectedCellData.employee.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted mb-1">รหัสพนักงาน</p>
                    <p className="text-sm font-medium text-app">{selectedCellData.employee.code}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted mb-1">แผนก</p>
                    <p className="text-sm font-medium text-app">{selectedCellData.employee.category || "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted mb-1">กะ</p>
                    <p className="text-sm font-medium text-app">
                      {selectedCellData.employee.shiftId ? (() => {
                        const shift = shifts.find(s => s.id === selectedCellData.employee.shiftId);
                        return shift ? `${shift.name} (${shift.startTime}-${shift.endTime})` : "-";
                      })() : "-"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Edit Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-muted mb-2">เวลาเข้า</label>
                  <input
                    type="time"
                    value={editForm.checkIn}
                    onChange={(e) => setEditForm({ ...editForm, checkIn: e.target.value })}
                    className="w-full px-3 py-2 bg-soft border border-app rounded-lg text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue text-sm"
                    placeholder="HH:MM"
                  />
                </div>

                <div>
                  <label className="block text-xs text-muted mb-2">เวลาออก</label>
                  <input
                    type="time"
                    value={editForm.checkOut}
                    onChange={(e) => setEditForm({ ...editForm, checkOut: e.target.value })}
                    className="w-full px-3 py-2 bg-soft border border-app rounded-lg text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue text-sm"
                    placeholder="HH:MM"
                  />
                </div>

                <div>
                  <label className="block text-xs text-muted mb-2">สถานะ</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value as AttendanceLog["status"] })}
                    className="w-full px-3 py-2 bg-soft border border-app rounded-lg text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue text-sm"
                  >
                    <option value="ตรงเวลา">ตรงเวลา</option>
                    <option value="สาย 1 นาที">สาย 1 นาที</option>
                    <option value="สาย 5 นาที">สาย 5 นาที</option>
                    <option value="สาย 15 นาที">สาย 15 นาที</option>
                    <option value="ลา">ลา</option>
                    <option value="ขาดงาน">ขาดงาน</option>
                  </select>
                </div>

                {(editForm.status === "ลา" || editForm.status === "ขาดงาน") && (
                  <div>
                    <label className="block text-xs text-muted mb-2">หมายเหตุ</label>
                    <textarea
                      value={editForm.reason}
                      onChange={(e) => setEditForm({ ...editForm, reason: e.target.value })}
                      className="w-full px-3 py-2 bg-soft border border-app rounded-lg text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue text-sm"
                      rows={3}
                      placeholder="ระบุเหตุผล..."
                    />
                  </div>
                )}

                {selectedLog && (
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                    <p className="text-xs text-yellow-700 dark:text-yellow-400">
                      <strong>ข้อมูลเดิม:</strong> {selectedLog.status} | 
                      เข้า: {selectedLog.checkIn} | 
                      ออก: {selectedLog.checkOut}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 px-6 py-4 border-t border-app bg-soft flex justify-end gap-2">
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setSelectedCellData(null);
                  setSelectedLog(null);
                }}
                className="px-4 py-2 bg-soft border border-app hover:bg-soft/80 text-app 
                         font-medium rounded-lg transition-all duration-200"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleSaveEdit}
                className="inline-flex items-center gap-2 px-6 py-2 bg-ptt-cyan hover:bg-ptt-cyan/80 
                         text-app font-semibold rounded-lg transition-all duration-200 
                         shadow-md hover:shadow-lg"
              >
                <CheckCircle className="w-5 h-5" />
                บันทึก
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

