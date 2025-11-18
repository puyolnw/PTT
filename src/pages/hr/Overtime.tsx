import { useState } from "react";
import { motion } from "framer-motion";
import { Timer, AlertCircle, Play, Pause, Calendar, ChevronLeft, ChevronRight, Plus, Clock } from "lucide-react";
import ModalForm from "@/components/ModalForm";
import { attendanceLogs as initialAttendanceLogs, employees, shifts, type AttendanceLog } from "@/data/mockData";

export default function Overtime() {
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceLog[]>(initialAttendanceLogs);
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedShift, setSelectedShift] = useState<number | "">("");
  const [isAddOTModalOpen, setIsAddOTModalOpen] = useState(false);
  const [selectedOTDetail, setSelectedOTDetail] = useState<{
    log: AttendanceLog;
    otInfo: ReturnType<typeof getOTInfo>;
    employee: typeof employees[number];
    shift: typeof shifts[number] | null;
  } | null>(null);
  const [otForm, setOtForm] = useState({
    empCode: "",
    empName: "",
    date: "",
    otHours: "",
    otRate: "",
    otAmount: "",
    note: ""
  });

  // Get all unique categories
  const categories = Array.from(new Set(employees.map(e => e.category).filter(Boolean)));

  // Get employee's shift
  const getEmployeeShift = (empCode: string) => {
    const employee = employees.find(e => e.code === empCode);
    if (employee && employee.shiftId) {
      return shifts.find(s => s.id === employee.shiftId);
    }
    return shifts[0];
  };

  // Get employee's OT rate
  const getEmployeeOTRate = (empCode: string): number => {
    const employee = employees.find(e => e.code === empCode);
    return employee?.otRate || 0;
  };

  // Convert hours to hours and minutes format
  const formatHoursMinutes = (hours: number): string => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    if (m === 0) {
      return `${h} ชม.`;
    } else if (h === 0) {
      return `${m} นาที`;
    }
    return `${h} ชม. ${m} นาที`;
  };

  // Handle employee selection
  const handleEmployeeSelect = (empCode: string) => {
    const employee = employees.find(e => e.code === empCode);
    if (employee) {
      const otRate = employee.otRate || 0;
      setOtForm({
        ...otForm,
        empCode: employee.code,
        empName: employee.name,
        otRate: otRate.toString()
      });
    }
  };

  // Handle OT form change
  const handleOTFormChange = (field: string, value: string) => {
    if (field === "otHours" || field === "otRate") {
      const otHours = field === "otHours" ? parseFloat(value) || 0 : parseFloat(otForm.otHours) || 0;
      const otRate = field === "otRate" ? parseFloat(value) || 0 : parseFloat(otForm.otRate) || 0;
      const otAmount = otHours * otRate;
      setOtForm({
        ...otForm,
        [field]: value,
        otAmount: otAmount.toFixed(2)
      });
    } else {
      setOtForm({
        ...otForm,
        [field]: value
      });
    }
  };

  // Handle add OT
  const handleAddOT = () => {
    if (!otForm.empCode || !otForm.date || !otForm.otHours || !otForm.otRate) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วน (พนักงาน, วันที่, OT ชั่วโมง, OT Rate)");
      return;
    }

    const employee = employees.find(e => e.code === otForm.empCode);
    if (!employee) {
      alert("ไม่พบข้อมูลพนักงาน");
      return;
    }

    const shift = getEmployeeShift(otForm.empCode);
    const otHours = parseFloat(otForm.otHours);
    const otRate = parseFloat(otForm.otRate);
    const otAmount = otHours * otRate;

    // Check if attendance log already exists for this date
    const existingLog = attendanceLogs.find(
      l => l.empCode === otForm.empCode && l.date === otForm.date
    );

    if (existingLog) {
      // Update existing log with OT
      const updatedLogs = attendanceLogs.map(log =>
        log.id === existingLog.id
          ? {
              ...log,
              otHours: (log.otHours || 0) + otHours,
              otAmount: (log.otAmount || 0) + otAmount
            }
          : log
      );
      setAttendanceLogs(updatedLogs);
    } else {
      // Create new attendance log with OT
      const newLog: AttendanceLog = {
        id: Math.max(...attendanceLogs.map(l => l.id), 0) + 1,
        empCode: otForm.empCode,
        empName: otForm.empName,
        date: otForm.date,
        checkIn: shift?.startTime || "08:00",
        checkOut: shift?.endTime || "17:00",
        status: "ตรงเวลา",
        lateMinutes: 0,
        otHours: otHours,
        otAmount: otAmount
      };
      setAttendanceLogs([...attendanceLogs, newLog]);
    }

    // Reset form
    setOtForm({
      empCode: "",
      empName: "",
      date: "",
      otHours: "",
      otRate: "",
      otAmount: "",
      note: ""
    });
    setIsAddOTModalOpen(false);

    alert(`บันทึก OT สำเร็จ! ${otForm.empName}: ${otHours.toFixed(2)} ชม. (${otAmount.toFixed(2)} บาท)`);
  };

  // Generate days in month
  const getDaysInMonth = (year: number, month: number) => {
    const days: Date[] = [];
    const lastDay = new Date(year, month + 1, 0).getDate();
    for (let day = 1; day <= lastDay; day++) {
      days.push(new Date(year, month, day));
    }
    return days;
  };

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
    
    let actualShiftEnd = shiftEndMinutes;
    let actualCheckOut = checkOutMinutes;
    const [shiftStartHour, shiftStartMin] = shift.startTime.split(":").map(Number);
    const shiftStartMinutes = shiftStartHour * 60 + shiftStartMin;
    
    if (shiftEndMinutes < shiftStartMinutes) {
      if (checkOutMinutes < shiftEndMinutes) {
        actualCheckOut = checkOutMinutes + (24 * 60);
      }
      actualShiftEnd = shiftEndMinutes + (24 * 60);
    }

    const otStartTime = shiftEndTime;
    const hasStarted = actualCheckOut > actualShiftEnd;
    
    let otHoursDone = 0;
    if (hasStarted && log.checkOut !== "-") {
      const diffMinutes = actualCheckOut - actualShiftEnd;
      otHoursDone = diffMinutes / 60;
    }

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

  // Build mock OT calendar data
  const buildMockOTCalendarData = (days: Date[]) => {
    const mockEmployees = [
      { code: "EMP-0001", name: "สมชาย ใจดี", category: "ปั๊ม", shiftId: 1, otRate: 250 },
      { code: "EMP-0002", name: "สมหญิง รักงาน", category: "ปั๊ม", shiftId: 2, otRate: 200 },
      { code: "EMP-0003", name: "วรพล ตั้งใจ", category: "ปั๊ม", shiftId: 3, otRate: 220 },
      { code: "EMP-0004", name: "กิตติคุณ ใฝ่รู้", category: "เซเว่น", shiftId: 27, otRate: 180 },
      { code: "EMP-0005", name: "พิมพ์ชนก สมใจ", category: "ปึงหงี่เชียง", shiftId: 16, otRate: 300 },
      { code: "EMP-0008", name: "อัญชลี มีชัย", category: "ร้านเชสเตอร์", shiftId: 19, otRate: 250 },
      { code: "EMP-0013", name: "ประยุทธ์ กลางคืน", category: "ปั๊ม", shiftId: 4, otRate: 230 },
      { code: "EMP-0015", name: "นันทนา เซเว่น", category: "เซเว่น", shiftId: 28, otRate: 190 },
      { code: "EMP-0020", name: "อภิชัย อเมซอน", category: "Amazon", shiftId: 21, otRate: 220 },
      { code: "EMP-0023", name: "ประเสริฐ ช่าง", category: "ช่าง", shiftId: 7, otRate: 280 },
      { code: "EMP-0026", name: "นิดา ออฟฟิศ", category: "Office", shiftId: 13, otRate: 250 },
      { code: "EMP-0029", name: "ประยุทธ์ รปภ", category: "รักษาความปลอดภัย", shiftId: 11, otRate: 200 },
    ];

    // Filter mock employees based on selected filters
    let filteredMockEmployees = mockEmployees;
    if (selectedCategory) {
      filteredMockEmployees = filteredMockEmployees.filter(emp => emp.category === selectedCategory);
    }
    if (selectedShift !== "") {
      filteredMockEmployees = filteredMockEmployees.filter(emp => emp.shiftId === selectedShift);
    }

    const seededRandom = (seed: number) => {
      const x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    };

    return filteredMockEmployees.map((mockEmp, empIndex) => {
      const existingEmployee = employees.find(e => e.code === mockEmp.code);
      const employee = existingEmployee || {
        id: 9000 + empIndex,
        code: mockEmp.code,
        name: mockEmp.name,
        dept: mockEmp.category,
        position: "พนักงาน",
        status: "Active" as const,
        startDate: new Date().toISOString().split("T")[0],
        category: mockEmp.category,
        shiftId: mockEmp.shiftId,
        otRate: mockEmp.otRate
      } as typeof employees[number];
      
      const shift = employee.shiftId ? shifts.find(s => s.id === employee.shiftId) : null;
      
      const otData = days.map((day) => {
        const dayNum = day.getDate();
        const dateStr = day.toISOString().split('T')[0];
        const seed = empIndex * 1000 + dayNum;
        
        const hasOT = seededRandom(seed) < 0.3;
        
        if (!hasOT) {
          return {
            date: dateStr,
            day: dayNum,
            log: null,
            otHours: null,
            otAmount: null,
            otInfo: null
          };
        }
        
        const otHours = Math.round((seededRandom(seed + 1) * 4 + 1) * 10) / 10;
        const otRate = employee.otRate || mockEmp.otRate;
        const otAmount = Math.round(otHours * otRate * 100) / 100;
        
        const statusRand = seededRandom(seed + 2);
        let status: "pending" | "active" | "done";
        let progressHours = 0;
        
        if (statusRand < 0.3) {
          status = "pending";
          progressHours = 0;
        } else if (statusRand < 0.7) {
          status = "active";
          progressHours = Math.round((otHours * (0.3 + seededRandom(seed + 3) * 0.6)) * 10) / 10;
        } else {
          status = "done";
          progressHours = otHours;
        }
        
        const log: AttendanceLog = {
          id: Number(`${employee.id}${dayNum}`),
          empCode: employee.code,
          empName: employee.name,
          date: dateStr,
          checkIn: shift?.startTime || "08:00",
          checkOut: shift?.endTime || "17:00",
          status: "ตรงเวลา",
          lateMinutes: 0,
          otHours,
          otAmount
        };
        
        const otInfo = {
          otStartTime: shift?.endTime || "17:00",
          hasStarted: status !== "pending",
          otHoursDone: progressHours,
          otHoursRemaining: Math.max(otHours - progressHours, 0),
          otHoursPlanned: otHours,
          otAmount,
          otRate
        } as ReturnType<typeof getOTInfo>;
        
        return {
          date: dateStr,
          day: dayNum,
          log,
          otHours,
          otAmount,
          otInfo
        };
      });
      
      return {
        employee,
        shift,
        otData
      };
    });
  };

  // Get OT data for calendar view
  const getOTCalendarData = () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const days = getDaysInMonth(year, month - 1);
    
    let filteredEmployees = employees.filter(emp => emp.status === "Active");
    if (selectedCategory) {
      filteredEmployees = filteredEmployees.filter(emp => emp.category === selectedCategory);
    }
    if (selectedShift !== "") {
      filteredEmployees = filteredEmployees.filter(emp => emp.shiftId === selectedShift);
    }
    
    const otCalendarData = filteredEmployees.map(emp => {
      const empShift = emp.shiftId ? shifts.find(s => s.id === emp.shiftId) : null;
      const empOTData = days.map(day => {
        const dateStr = day.toISOString().split('T')[0];
        const log = attendanceLogs.find(
          l => l.empCode === emp.code && l.date === dateStr && l.otHours && l.otHours > 0
        );
        
        if (!log) {
          return {
            date: dateStr,
            day: day.getDate(),
            log: null,
            otHours: null,
            otAmount: null,
            otInfo: null
          };
        }
        
        const otInfo = getOTInfo(log);
        
        return {
          date: dateStr,
          day: day.getDate(),
          log: log,
          otHours: log.otHours || 0,
          otAmount: log.otAmount || 0,
          otInfo: otInfo
        };
      });
      
      return {
        employee: emp,
        shift: empShift,
        otData: empOTData
      };
    }).filter(data => data.otData.some(ot => ot.log !== null));
    
    if (otCalendarData.length === 0) {
      return { days, otCalendarData: buildMockOTCalendarData(days), isMock: true };
    }
    
    return { days, otCalendarData, isMock: false };
  };

  // Filter OT logs based on selected filters
  const getFilteredOTLogs = () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const monthStart = `${year}-${String(month).padStart(2, '0')}-01`;
    const monthEnd = `${year}-${String(month).padStart(2, '0')}-${new Date(year, month, 0).getDate()}`;
    
    let filteredLogs = attendanceLogs.filter(log => {
      // Filter by month
      if (log.date < monthStart || log.date > monthEnd) return false;
      // Filter by OT hours
      if (!log.otHours || log.otHours <= 0) return false;
      
      // Filter by category
      if (selectedCategory) {
        const employee = employees.find(e => e.code === log.empCode);
        if (!employee || employee.category !== selectedCategory) return false;
      }
      
      // Filter by shift
      if (selectedShift !== "") {
        const employee = employees.find(e => e.code === log.empCode);
        if (!employee || employee.shiftId !== selectedShift) return false;
      }
      
      return true;
    });
    
    return filteredLogs;
  };

  // Separate OT logs into pending and active
  const filteredOTLogs = getFilteredOTLogs();
  const pendingOT = filteredOTLogs.filter(log => {
    const info = getOTInfo(log);
    return info && !info.hasStarted;
  });
  const activeOT = filteredOTLogs.filter(log => {
    const info = getOTInfo(log);
    return info && info.hasStarted && info.otHoursRemaining > 0;
  });

  const { days, otCalendarData, isMock } = getOTCalendarData();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-app mb-2 font-display">
            การทำ OT (Overtime)
          </h1>
          <p className="text-muted font-light">
            จัดการและติดตามการทำ OT ของพนักงาน • พนักงานลงทะเบียน OT ไว้ที่เอกสารแล้ว HR/Admin จะเป็นคนเพิ่มในระบบ
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsAddOTModalOpen(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-ptt-cyan hover:bg-ptt-cyan/80 
                     text-app rounded-xl transition-all duration-200 font-semibold 
                     shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            <Plus className="w-5 h-5" />
            เพิ่ม OT
          </button>
        </div>
      </div>

      {/* OT Calendar View */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-soft border border-app rounded-2xl overflow-hidden shadow-xl"
      >
        {isMock && (
          <div className="px-6 py-3 bg-yellow-500/10 border-b border-yellow-500/30">
            <p className="text-xs text-yellow-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>แสดงข้อมูลตัวอย่าง (Mock Data) เพื่อให้เห็นภาพหน้าจอ • เมื่อมีข้อมูลจริง ระบบจะแสดงรายการ OT ของพนักงานอัตโนมัติ</span>
            </p>
          </div>
        )}
        <div className="px-6 py-4 border-b border-app bg-soft">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-app font-display flex items-center gap-2">
                <Timer className="w-5 h-5 text-yellow-400" />
                ตาราง OT (ปฏิทินรายบุคคล)
              </h3>
              <p className="text-xs text-muted mt-1">
                แสดงการทำ OT รายเดือน แยกตามแผนก {isMock && <span className="text-yellow-400">• ข้อมูลตัวอย่าง</span>}
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
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-soft border-b-2 border-app sticky top-0 z-10">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-semibold text-app border-r border-app sticky left-0 bg-soft z-20 min-w-[120px]">
                  NO
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-app border-r border-app sticky left-[120px] bg-soft z-20 min-w-[200px]">
                  ชื่อ-สกุล
                </th>
                <th className="px-3 py-3 text-center text-xs font-semibold text-app border-r border-app sticky left-[320px] bg-soft z-20 min-w-[100px]">
                  แผนก
                </th>
                <th className="px-3 py-3 text-center text-xs font-semibold text-app border-r border-app sticky left-[420px] bg-soft z-20 min-w-[120px]">
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
              {otCalendarData.map((data, empIndex) => (
                <motion.tr
                  key={data.employee.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: empIndex * 0.02 }}
                  className="hover:bg-soft/50 transition-colors"
                >
                  <td className="px-3 py-3 text-sm text-app font-medium border-r border-app sticky left-0 bg-soft z-10">
                    {empIndex + 1}
                  </td>
                  <td className="px-3 py-3 text-sm text-app font-medium border-r border-app sticky left-[120px] bg-soft z-10">
                    {data.employee.name}
                  </td>
                  <td className="px-3 py-3 text-sm text-center text-app border-r border-app sticky left-[320px] bg-soft z-10">
                    <span className="text-xs text-ptt-cyan">{data.employee.category || "-"}</span>
                  </td>
                  <td className="px-3 py-3 text-sm text-center text-app border-r border-app sticky left-[420px] bg-soft z-10">
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
                  {data.otData.map((ot, dayIndex) => {
                    const getCellColor = () => {
                      if (!ot.log || !ot.otInfo) return "";
                      if (ot.otInfo.hasStarted && ot.otInfo.otHoursRemaining > 0) {
                        return "bg-green-200/30";
                      } else if (!ot.otInfo.hasStarted) {
                        return "bg-yellow-200/30";
                      }
                      return "bg-blue-200/30";
                    };
                    
                    const getCellContent = () => {
                      if (!ot.log) return "";
                      if (!ot.otInfo) {
                        return ot.otHours ? formatHoursMinutes(ot.otHours) : "";
                      }
                      if (ot.otInfo.hasStarted && ot.otInfo.otHoursRemaining > 0) {
                        return `${formatHoursMinutes(ot.otInfo.otHoursDone)}/${formatHoursMinutes(ot.otHours)}`;
                      } else if (!ot.otInfo.hasStarted) {
                        return `รอ ${formatHoursMinutes(ot.otHours)}`;
                      }
                      return formatHoursMinutes(ot.otHours);
                    };
                    
                    const handleCellClick = () => {
                      if (!ot.log || !ot.otInfo) return;
                      const employee = employees.find(e => e.code === ot.log!.empCode);
                      const shift = getEmployeeShift(ot.log.empCode);
                      if (employee) {
                        setSelectedOTDetail({
                          log: ot.log,
                          otInfo: ot.otInfo,
                          employee,
                          shift
                        });
                      }
                    };
                    
                    return (
                      <td
                        key={dayIndex}
                        className={`px-2 py-2 text-center text-xs border-r border-app ${getCellColor()} ${
                          ot.log && ot.otInfo ? "cursor-pointer hover:opacity-80 transition-opacity" : ""
                        }`}
                        onClick={handleCellClick}
                        title={ot.log && ot.otInfo ? "คลิกเพื่อดูรายละเอียด" : ""}
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
        
        {/* Legend */}
        <div className="px-6 py-4 border-t border-app bg-soft">
          <div className="flex flex-wrap gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-200/30 border border-app rounded"></div>
              <span className="text-app">รอเริ่ม OT</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-200/30 border border-app rounded"></div>
              <span className="text-app">กำลังทำ OT (แสดง ชม.ทำแล้ว/ชม.ทั้งหมด)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-200/30 border border-app rounded"></div>
              <span className="text-app">ทำ OT เสร็จแล้ว</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* OT Tables */}
      {(pendingOT.length > 0 || activeOT.length > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-soft border border-app rounded-2xl overflow-hidden shadow-xl"
        >
          <div className="px-6 py-4 border-b border-app bg-soft">
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
                  <thead className="bg-soft border-b border-app">
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
                  <tbody className="divide-y divide-app">
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
                          className="hover:bg-soft transition-colors"
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
                  <thead className="bg-soft border-b border-app">
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
                  <tbody className="divide-y divide-app">
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
                          className="hover:bg-soft transition-colors"
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

      {/* Add OT Modal */}
      <ModalForm
        isOpen={isAddOTModalOpen}
        onClose={() => {
          setIsAddOTModalOpen(false);
          setOtForm({
            empCode: "",
            empName: "",
            date: "",
            otHours: "",
            otRate: "",
            otAmount: "",
            note: ""
          });
        }}
        title="เพิ่ม OT (Overtime)"
        onSubmit={handleAddOT}
        submitLabel="บันทึก OT"
      >
        <div className="space-y-4">
          <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <p className="text-xs text-yellow-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>พนักงานจะลงทะเบียน OT ไว้ที่เอกสารแล้ว HR/Admin จะเป็นคนมาเพิ่มข้อมูล OT ในระบบ</span>
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-app mb-2">
              เลือกพนักงาน <span className="text-red-400">*</span>
            </label>
            <select
              value={otForm.empCode}
              onChange={(e) => handleEmployeeSelect(e.target.value)}
              className="w-full px-4 py-2.5 bg-soft border border-app rounded-xl
                       text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue"
              required
            >
              <option value="">เลือกพนักงาน</option>
              {employees.filter(emp => emp.status === "Active").map((emp) => {
                const shift = emp.shiftId ? shifts.find(s => s.id === emp.shiftId) : null;
                return (
                  <option key={emp.id} value={emp.code}>
                    {emp.code} - {emp.name} {shift ? `(กะ${shift.name} ${shift.startTime}-${shift.endTime})` : ""}
                  </option>
                );
              })}
            </select>
          </div>

          {otForm.empCode && (() => {
            const employee = employees.find(e => e.code === otForm.empCode);
            const shift = employee?.shiftId ? shifts.find(s => s.id === employee.shiftId) : null;
            return (
              <div className="p-3 bg-soft rounded-lg border border-app">
                <p className="text-sm text-muted mb-1">ข้อมูลพนักงาน</p>
                <p className="text-app font-semibold">{otForm.empName}</p>
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
              วันที่ทำ OT <span className="text-red-400">*</span>
            </label>
            <input
              type="date"
              value={otForm.date}
              onChange={(e) => handleOTFormChange("date", e.target.value)}
              className="w-full px-4 py-2.5 bg-soft border border-app rounded-xl
                       text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-app mb-2">
                OT ชั่วโมง <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={otForm.otHours}
                onChange={(e) => handleOTFormChange("otHours", e.target.value)}
                className="w-full px-4 py-2.5 bg-soft border border-app rounded-xl
                         text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue"
                placeholder="0.0"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-app mb-2">
                OT Rate (บาท/ชั่วโมง) <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={otForm.otRate}
                onChange={(e) => handleOTFormChange("otRate", e.target.value)}
                className="w-full px-4 py-2.5 bg-soft border border-app rounded-xl
                         text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue"
                placeholder="0.00"
                required
              />
            </div>
          </div>

          {parseFloat(otForm.otHours || "0") > 0 && parseFloat(otForm.otRate || "0") > 0 && (
            <div className="p-3 bg-ptt-blue/10 border border-ptt-blue/30 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm text-app">เงิน OT:</span>
                <span className="text-lg font-bold text-green-400 font-mono">
                  {parseFloat(otForm.otAmount || "0").toFixed(2)} บาท
                </span>
              </div>
              <p className="text-xs text-muted mt-1">
                {parseFloat(otForm.otHours || "0").toFixed(2)} ชม. × {parseFloat(otForm.otRate || "0").toFixed(2)} บาท/ชม.
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-app mb-2">
              หมายเหตุ
            </label>
            <textarea
              rows={3}
              value={otForm.note}
              onChange={(e) => handleOTFormChange("note", e.target.value)}
              placeholder="ระบุหมายเหตุเพิ่มเติม (ถ้ามี)..."
              className="w-full px-4 py-2.5 bg-soft border border-app rounded-xl
                       text-app placeholder:text-muted
                       focus:outline-none focus:ring-2 focus:ring-ptt-blue resize-none"
            />
          </div>
        </div>
      </ModalForm>

      {/* OT Detail Modal */}
      <ModalForm
        isOpen={selectedOTDetail !== null}
        onClose={() => setSelectedOTDetail(null)}
        title="รายละเอียด OT (Overtime)"
        size="lg"
      >
        {selectedOTDetail && (
          <div className="space-y-6">
            {/* Employee Info */}
            <div className="p-4 bg-soft rounded-xl border border-app">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted mb-1">ชื่อพนักงาน</p>
                  <p className="text-sm font-semibold text-app">{selectedOTDetail.employee.name}</p>
                  <p className="text-xs text-muted mt-1">รหัส: {selectedOTDetail.employee.code}</p>
                </div>
                <div>
                  <p className="text-xs text-muted mb-1">แผนก</p>
                  <p className="text-sm font-semibold text-app">{selectedOTDetail.employee.category || "-"}</p>
                  {selectedOTDetail.shift && (
                    <p className="text-xs text-ptt-cyan mt-1">
                      กะ{selectedOTDetail.shift.name}: {selectedOTDetail.shift.startTime} - {selectedOTDetail.shift.endTime}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Date */}
            <div className="p-4 bg-soft rounded-xl border border-app">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-ptt-cyan" />
                <p className="text-xs text-muted">วันที่ทำ OT</p>
              </div>
              <p className="text-lg font-semibold text-app">
                {new Date(selectedOTDetail.log.date).toLocaleDateString("th-TH", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  weekday: "long"
                })}
              </p>
            </div>

            {/* OT Time Information */}
            <div className="space-y-3">
              <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                <div className="flex items-center gap-2 mb-3">
                  <Timer className="w-5 h-5 text-yellow-400" />
                  <p className="text-sm font-semibold text-yellow-400">เวลาที่ลงทะเบียนไว้</p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-app">OT ที่ลงทะเบียน:</span>
                    <span className="text-lg font-bold text-yellow-400 font-mono">
                      {formatHoursMinutes(selectedOTDetail.otInfo.otHoursPlanned)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-app">เวลาเริ่ม OT:</span>
                    <span className="text-base font-semibold text-app font-mono">
                      {selectedOTDetail.otInfo.otStartTime}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-app">OT Rate:</span>
                    <span className="text-base font-semibold text-green-400 font-mono">
                      {selectedOTDetail.otInfo.otRate} บาท/ชั่วโมง
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-yellow-500/20">
                    <span className="text-sm text-app">เงิน OT ทั้งหมด:</span>
                    <span className="text-xl font-bold text-green-400 font-mono">
                      {selectedOTDetail.otInfo.otAmount.toFixed(2)} บาท
                    </span>
                  </div>
                </div>
              </div>

              {/* Actual OT Time */}
              {selectedOTDetail.otInfo.hasStarted ? (
                <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                  <div className="flex items-center gap-2 mb-3">
                    <Play className="w-5 h-5 text-green-400" />
                    <p className="text-sm font-semibold text-green-400">เวลาที่ทำ OT จริง</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-app">เวลาเริ่มทำ OT:</span>
                      <span className="text-base font-semibold text-green-400 font-mono">
                        {selectedOTDetail.otInfo.otStartTime}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-app">เวลาสิ้นสุด OT (ออกงาน):</span>
                      <span className="text-base font-semibold text-app font-mono">
                        {selectedOTDetail.log.checkOut}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-app">OT ทำไปแล้ว:</span>
                      <span className="text-lg font-bold text-green-400 font-mono">
                        {formatHoursMinutes(selectedOTDetail.otInfo.otHoursDone)}
                      </span>
                    </div>
                    {selectedOTDetail.otInfo.otHoursRemaining > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-app">OT เหลือ:</span>
                        <span className="text-base font-semibold text-yellow-400 font-mono">
                          {formatHoursMinutes(selectedOTDetail.otInfo.otHoursRemaining)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between items-center pt-2 border-t border-green-500/20">
                      <span className="text-sm text-app">เงิน OT ที่ทำไปแล้ว:</span>
                      <span className="text-lg font-bold text-green-400 font-mono">
                        {(selectedOTDetail.otInfo.otHoursDone * selectedOTDetail.otInfo.otRate).toFixed(2)} บาท
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                  <div className="flex items-center gap-2 mb-3">
                    <Pause className="w-5 h-5 text-yellow-400" />
                    <p className="text-sm font-semibold text-yellow-400">สถานะ: รอเริ่มทำ OT</p>
                  </div>
                  <p className="text-sm text-app">
                    ยังไม่เริ่มทำ OT • จะเริ่มทำ OT หลังจากออกจากกะปกติ ({selectedOTDetail.otInfo.otStartTime})
                  </p>
                </div>
              )}

              {/* Work Time */}
              <div className="p-4 bg-soft rounded-xl border border-app">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-5 h-5 text-ptt-cyan" />
                  <p className="text-sm font-semibold text-app">เวลาทำงานปกติ</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted mb-1">เวลาเข้า</p>
                    <p className="text-sm font-semibold text-app font-mono">
                      {selectedOTDetail.log.checkIn}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted mb-1">เวลาออก</p>
                    <p className="text-sm font-semibold text-app font-mono">
                      {selectedOTDetail.log.checkOut}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </ModalForm>
    </div>
  );
}

