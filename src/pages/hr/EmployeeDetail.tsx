import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, Calendar, Wallet, TrendingUp, AlertCircle, CheckCircle, XCircle, FileText, Download, Eye, Image as ImageIcon, ZoomIn } from "lucide-react";
import ProfileCard from "@/components/ProfileCard";
import StatusTag, { getStatusVariant } from "@/components/StatusTag";
import ModalForm from "@/components/ModalForm";
import { employees, shifts, attendanceLogs, leaves, payroll } from "@/data/mockData";

export default function EmployeeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("general");
  const [selectedPayslip, setSelectedPayslip] = useState<typeof payroll[0] | null>(null);
  const [selectedReceiptImage, setSelectedReceiptImage] = useState<string | null>(null);

  // Find employee
  const employee = employees.find((e) => e.id === Number(id));

  if (!employee) {
    return (
      <div className="text-center py-12">
        <p className="text-muted">ไม่พบข้อมูลพนักงาน</p>
      </div>
    );
  }

  // Get employee's shift
  const employeeShift = employee.shiftId ? shifts.find(s => s.id === employee.shiftId) : null;

  // Work duration calculation
  const startDate = new Date(employee.startDate);
  const today = new Date();
  const workDuration = Math.floor(
    (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
  );
  
  // Filter data to show only since employee started working
  // Attendance: only from start date onwards
  const allAttendance = attendanceLogs
    .filter((log) => {
      if (log.empCode !== employee.code) return false;
      const logDate = new Date(log.date);
      return logDate >= startDate;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Leaves: only from start date onwards
  const allLeaves = leaves
    .filter((leave) => {
      if (leave.empCode !== employee.code) return false;
      const leaveDate = new Date(leave.fromDate);
      return leaveDate >= startDate;
    })
    .sort((a, b) => new Date(b.fromDate).getTime() - new Date(a.fromDate).getTime());

  // Payroll: only from start date onwards (compare by month)
  const allPayroll = payroll
    .filter((p) => {
      if (p.empCode !== employee.code) return false;
      const payMonth = new Date(p.month + "-01");
      return payMonth >= startDate;
    })
    .sort((a, b) => new Date(b.month + "-01").getTime() - new Date(a.month + "-01").getTime());

  // Calculate statistics (only from start date)
  const totalDays = allAttendance.length;
  const onTimeCount = allAttendance.filter(log => log.status === "ตรงเวลา").length;
  const lateCount = allAttendance.filter(log => log.status.includes("สาย")).length;
  const absentCount = allAttendance.filter(log => log.status === "ขาดงาน").length;
  const leaveCount = allAttendance.filter(log => log.status === "ลา").length;
  const attendanceRate = totalDays > 0 ? ((onTimeCount / totalDays) * 100).toFixed(1) : "0.0";
  
  // Leave statistics
  const totalLeaveDays = allLeaves.reduce((sum, leave) => sum + leave.days, 0);
  const approvedLeaves = allLeaves.filter(l => l.status === "อนุมัติแล้ว");
  const pendingLeaves = allLeaves.filter(l => l.status === "รออนุมัติ");
  const rejectedLeaves = allLeaves.filter(l => l.status === "ไม่อนุมัติ");
  
  // Group leaves by type
  const leavesByType = allLeaves.reduce((acc, leave) => {
    if (!acc[leave.type]) {
      acc[leave.type] = { count: 0, days: 0, approved: 0, pending: 0, rejected: 0 };
    }
    acc[leave.type].count++;
    acc[leave.type].days += leave.days;
    if (leave.status === "อนุมัติแล้ว") acc[leave.type].approved++;
    else if (leave.status === "รออนุมัติ") acc[leave.type].pending++;
    else if (leave.status === "ไม่อนุมัติ") acc[leave.type].rejected++;
    return acc;
  }, {} as Record<string, { count: number; days: number; approved: number; pending: number; rejected: number }>);

  // Group leaves by month
  const monthlyLeaves = allLeaves.reduce((acc, leave) => {
    const month = leave.fromDate.substring(0, 7); // YYYY-MM
    if (!acc[month]) {
      acc[month] = {
        month,
        total: 0,
        days: 0,
        byType: {} as Record<string, number>
      };
    }
    acc[month].total++;
    acc[month].days += leave.days;
    if (!acc[month].byType[leave.type]) {
      acc[month].byType[leave.type] = 0;
    }
    acc[month].byType[leave.type] += leave.days;
    return acc;
  }, {} as Record<string, {
    month: string;
    total: number;
    days: number;
    byType: Record<string, number>;
  }>);

  const monthlyLeavesSummary = Object.values(monthlyLeaves)
    .sort((a, b) => b.month.localeCompare(a.month));

  // Calculate leave balance (approximate - should be from actual leave balance system)
  const leaveTypes = ["ลาพักร้อน", "ลาป่วย", "ลากิจ", "ลาคลอด"] as const;
  const leaveTypeLabels: Record<string, string> = {
    "ลาพักร้อน": "ลาพักร้อน",
    "ลาป่วย": "ลาป่วย",
    "ลากิจ": "ลากิจ",
    "ลาคลอด": "ลาคลอด"
  };
  
  // Payroll statistics
  const avgSalary = allPayroll.length > 0 
    ? allPayroll.reduce((sum, p) => sum + p.salary, 0) / allPayroll.length 
    : 0;
  const totalOT = allPayroll.reduce((sum, p) => sum + p.ot, 0);
  const avgOTRate = employee.otRate || 200;
  const totalOTHours = Math.round(totalOT / avgOTRate);
  const avgNetPay = allPayroll.length > 0
    ? allPayroll.reduce((sum, p) => sum + p.net, 0) / allPayroll.length
    : 0;
  
  // Calculate working days (excluding weekends, approximate)
  const workingDaysSinceStart = Math.floor(
    (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  const expectedWorkingDays = Math.floor(workingDaysSinceStart * 5 / 7); // Approximate: 5 working days per week

  // Calculate working hours from attendance logs
  const calculateWorkingHours = (checkIn: string, checkOut: string): number => {
    if (checkIn === "-" || checkOut === "-") return 0;
    const [inHour, inMin] = checkIn.split(":").map(Number);
    const [outHour, outMin] = checkOut.split(":").map(Number);
    const inMinutes = inHour * 60 + inMin;
    const outMinutes = outHour * 60 + outMin;
    const diffMinutes = outMinutes - inMinutes;
    return diffMinutes / 60; // Convert to hours
  };

  // Calculate total working hours
  const workingHoursData = allAttendance
    .filter(log => log.checkIn !== "-" && log.checkOut !== "-")
    .map(log => ({
      ...log,
      hours: calculateWorkingHours(log.checkIn, log.checkOut)
    }));

  const totalWorkingHours = workingHoursData.reduce((sum, log) => sum + log.hours, 0);
  const avgWorkingHours = workingHoursData.length > 0 
    ? totalWorkingHours / workingHoursData.length 
    : 0;

  // Calculate late minutes
  const lateLogs = allAttendance.filter(log => log.status.includes("สาย"));
  const totalLateMinutes = lateLogs.reduce((sum, log) => {
    if (log.lateMinutes) return sum + log.lateMinutes;
    // Parse from status if lateMinutes not available
    const match = log.status.match(/(\d+)/);
    return sum + (match ? parseInt(match[1]) : 0);
  }, 0);
  const avgLateMinutes = lateLogs.length > 0 ? totalLateMinutes / lateLogs.length : 0;

  // Calculate overtime hours (if work more than shift hours)
  const shiftHours = employeeShift ? (() => {
    const [startHour, startMin] = employeeShift.startTime.split(":").map(Number);
    const [endHour, endMin] = employeeShift.endTime.split(":").map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    let diffMinutes = endMinutes - startMinutes;
    if (diffMinutes < 0) diffMinutes += 24 * 60; // Handle overnight shifts
    return diffMinutes / 60;
  })() : 8; // Default 8 hours

  const overtimeHoursData = workingHoursData
    .filter(log => log.hours > shiftHours)
    .map(log => ({
      ...log,
      otHours: log.hours - shiftHours
    }));

  const totalOTHoursFromAttendance = overtimeHoursData.reduce((sum, log) => sum + log.otHours, 0);

  // Group by month for monthly summary
  const monthlyAttendance = allAttendance.reduce((acc, log) => {
    const month = log.date.substring(0, 7); // YYYY-MM
    if (!acc[month]) {
      acc[month] = {
        month,
        total: 0,
        onTime: 0,
        late: 0,
        absent: 0,
        leave: 0,
        workingHours: 0,
        workingDays: 0
      };
    }
    acc[month].total++;
    if (log.status === "ตรงเวลา") acc[month].onTime++;
    else if (log.status.includes("สาย")) acc[month].late++;
    else if (log.status === "ขาดงาน") acc[month].absent++;
    else if (log.status === "ลา") acc[month].leave++;

    if (log.checkIn !== "-" && log.checkOut !== "-") {
      acc[month].workingHours += calculateWorkingHours(log.checkIn, log.checkOut);
      acc[month].workingDays++;
    }
    return acc;
  }, {} as Record<string, {
    month: string;
    total: number;
    onTime: number;
    late: number;
    absent: number;
    leave: number;
    workingHours: number;
    workingDays: number;
  }>);

  const monthlySummary = Object.values(monthlyAttendance)
    .sort((a, b) => b.month.localeCompare(a.month));

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
    }).format(amount);
  };

  const formatTime = (hours: number): string => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h} ชม. ${m} นาที`;
  };

  // Handle view payslip
  const handleViewPayslip = (pay: typeof payroll[0]) => {
    setSelectedPayslip(pay);
  };

  // Handle download payslip
  const handleDownloadPayslip = (pay: typeof payroll[0]) => {
    alert(`กำลังดาวน์โหลดสลิปเงินเดือน ${pay.month} สำหรับ ${employee.name} (Mock)`);
    // In real application, this would download the PDF file
  };

  // Mock receipt images - in real app, these would come from the database
  const getReceiptImage = (pay: typeof payroll[0]): string | null => {
    // Mock: Generate a placeholder image URL based on employee code and month
    // In real application, this would be the actual receipt image URL from database
    return `https://via.placeholder.com/800x600/2867e0/ffffff?text=หลักฐานการโอนเงิน+${pay.month}+${employee.code}`;
  };

  const tabs = [
    { id: "general", label: "ข้อมูลทั่วไป" },
    { id: "history", label: "ประวัติทำงาน" },
    { id: "attendance", label: "เวลาเข้าออก" },
    { id: "leaves", label: "การลา" },
    { id: "payroll", label: "เงินเดือน" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/app/hr/employees")}
          className="p-2 hover:bg-ink-800 rounded-lg transition-colors text-muted hover:text-app"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-app font-display">
            ข้อมูลพนักงาน
          </h1>
          <p className="text-muted font-light">รายละเอียดและประวัติการทำงาน</p>
        </div>
      </div>

      {/* Profile Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <ProfileCard
          avatar={employee.avatar || ""}
          name={employee.name}
          code={employee.code}
          dept={employee.dept}
          position={employee.position}
          status={employee.status}
          startDate={employee.startDate}
          email={employee.email}
          phone={employee.phone}
        />
      </motion.div>

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
              <Calendar className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-muted">วันลาทั้งหมด</p>
              <p className="text-lg font-bold text-app">{totalLeaveDays} วัน</p>
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
              <Wallet className="w-5 h-5 text-ptt-cyan" />
            </div>
            <div>
              <p className="text-xs text-muted">เงินเดือนเฉลี่ย</p>
              <p className="text-lg font-bold text-app font-mono">{formatCurrency(avgSalary)}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="bg-white/5 border border-app rounded-2xl overflow-hidden shadow-xl">
        {/* Tab Headers */}
        <div className="flex border-b border-app overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "text-ptt-cyan border-b-2 border-ptt-cyan"
                  : "text-muted hover:text-app"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === "general" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-app mb-4 font-display">
                ข้อมูลทั่วไป
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted">รหัสพนักงาน</p>
                  <p className="text-app font-medium">{employee.code}</p>
                </div>
                <div>
                  <p className="text-sm text-muted">ชื่อ-นามสกุล</p>
                  <p className="text-app font-medium">{employee.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted">แผนก</p>
                  <p className="text-app font-medium">{employee.dept}</p>
                </div>
                <div>
                  <p className="text-sm text-muted">ตำแหน่ง</p>
                  <p className="text-app font-medium">{employee.position}</p>
                </div>
                <div>
                  <p className="text-sm text-muted">วันที่เริ่มงาน</p>
                  <p className="text-app font-medium">{employee.startDate}</p>
                </div>
                <div>
                  <p className="text-sm text-muted">สถานะ</p>
                  <StatusTag variant={getStatusVariant(employee.status)}>
                    {employee.status}
                  </StatusTag>
                </div>
                <div>
                  <p className="text-sm text-muted">กะการทำงาน</p>
                  {employeeShift ? (
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium
                                     bg-ptt-blue/20 text-ptt-cyan border border-ptt-blue/30">
                        กะ{employeeShift.name}
                      </span>
                      <span className="text-xs text-muted">
                        ({employeeShift.startTime} - {employeeShift.endTime})
                      </span>
                    </div>
                  ) : (
                    <p className="text-app font-medium">-</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-muted">OT Rate</p>
                  {employee.otRate ? (
                    <p className="text-app font-semibold font-mono">
                      ฿{employee.otRate.toLocaleString("th-TH")}
                      <span className="text-xs text-muted font-normal ml-1">/ชั่วโมง</span>
                    </p>
                  ) : (
                    <p className="text-app font-medium">-</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "history" && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-app mb-4 font-display">
                ประวัติการทำงาน
              </h3>
              
              {/* Work Duration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-ink-800/50 rounded-xl">
                  <p className="text-sm text-muted mb-1">เริ่มงานเมื่อ</p>
                  <p className="text-app font-semibold">{employee.startDate}</p>
                </div>
                <div className="p-4 bg-ink-800/50 rounded-xl">
                  <p className="text-sm text-muted mb-1">ระยะเวลาทำงาน</p>
                  <p className="text-app font-semibold">{workDuration} เดือน</p>
                </div>
              </div>

              {/* Attendance Summary */}
              <div>
                <h4 className="text-md font-semibold text-app mb-3 font-display flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  สรุปการเข้างาน (ตั้งแต่เริ่มงาน)
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <p className="text-xs text-muted">เข้างานตรงเวลา</p>
                    <p className="text-lg font-bold text-green-400">{onTimeCount} ครั้ง</p>
                    <p className="text-xs text-muted mt-1">
                      {totalDays > 0 ? ((onTimeCount / totalDays) * 100).toFixed(0) : 0}% ของทั้งหมด
                    </p>
                  </div>
                  <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                    <p className="text-xs text-muted">มาสาย</p>
                    <p className="text-lg font-bold text-yellow-400">{lateCount} ครั้ง</p>
                    <p className="text-xs text-muted mt-1">
                      {totalDays > 0 ? ((lateCount / totalDays) * 100).toFixed(0) : 0}% ของทั้งหมด
                    </p>
                  </div>
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <p className="text-xs text-muted">ขาดงาน</p>
                    <p className="text-lg font-bold text-red-400">{absentCount} ครั้ง</p>
                    <p className="text-xs text-muted mt-1">
                      {totalDays > 0 ? ((absentCount / totalDays) * 100).toFixed(0) : 0}% ของทั้งหมด
                    </p>
                  </div>
                  <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <p className="text-xs text-muted">ลา</p>
                    <p className="text-lg font-bold text-blue-400">{leaveCount} ครั้ง</p>
                    <p className="text-xs text-muted mt-1">
                      {totalDays > 0 ? ((leaveCount / totalDays) * 100).toFixed(0) : 0}% ของทั้งหมด
                    </p>
                  </div>
                </div>
                <div className="mt-3 p-3 bg-ptt-blue/10 border border-ptt-blue/30 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted">อัตราการเข้างาน: <span className="text-ptt-cyan font-semibold">{attendanceRate}%</span></p>
                      <p className="text-xs text-muted mt-1">จากทั้งหมด {totalDays} วัน (ตั้งแต่ {employee.startDate})</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted">ระยะเวลาทำงาน</p>
                      <p className="text-sm font-semibold text-ptt-cyan">{workDuration} เดือน</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Leave Summary */}
              <div>
                <h4 className="text-md font-semibold text-app mb-3 font-display flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  สรุปการลา (ตั้งแต่เริ่มงาน)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-3 bg-ink-800/50 rounded-lg">
                    <p className="text-xs text-muted">การลาทั้งหมด</p>
                    <p className="text-lg font-bold text-app">{allLeaves.length} รายการ</p>
                    <p className="text-xs text-muted mt-1">{totalLeaveDays} วัน</p>
                    <p className="text-xs text-ptt-cyan mt-1">
                      เฉลี่ย {workDuration > 0 ? (totalLeaveDays / workDuration).toFixed(1) : 0} วัน/เดือน
                    </p>
                  </div>
                  <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <p className="text-xs text-muted">อนุมัติแล้ว</p>
                    <p className="text-lg font-bold text-green-400">{approvedLeaves.length} รายการ</p>
                    <p className="text-xs text-muted mt-1">
                      {approvedLeaves.reduce((sum, l) => sum + l.days, 0)} วัน
                    </p>
                  </div>
                  <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                    <p className="text-xs text-muted">รออนุมัติ</p>
                    <p className="text-lg font-bold text-yellow-400">{pendingLeaves.length} รายการ</p>
                    <p className="text-xs text-muted mt-1">
                      {pendingLeaves.reduce((sum, l) => sum + l.days, 0)} วัน
                    </p>
                  </div>
                </div>
              </div>

              {/* Payroll Summary */}
              <div>
                <h4 className="text-md font-semibold text-app mb-3 font-display flex items-center gap-2">
                  <Wallet className="w-4 h-4" />
                  สรุปเงินเดือน (ตั้งแต่เริ่มงาน)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-3 bg-ink-800/50 rounded-lg">
                    <p className="text-xs text-muted">เงินเดือนเฉลี่ย</p>
                    <p className="text-lg font-bold text-app font-mono">{formatCurrency(avgSalary)}</p>
                    <p className="text-xs text-muted mt-1">
                      จาก {allPayroll.length} เดือนที่ทำงาน
                    </p>
                  </div>
                  <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <p className="text-xs text-muted">OT สะสม</p>
                    <p className="text-lg font-bold text-green-400 font-mono">{formatCurrency(totalOT)}</p>
                    <p className="text-xs text-muted mt-1">
                      {totalOTHours} ชั่วโมง
                      {workDuration > 0 && (
                        <span className="ml-1">(เฉลี่ย {Math.round(totalOTHours / workDuration)} ชม./เดือน)</span>
                      )}
                    </p>
                  </div>
                  <div className="p-3 bg-ptt-blue/10 border border-ptt-blue/30 rounded-lg">
                    <p className="text-xs text-muted">รับสุทธิเฉลี่ย</p>
                    <p className="text-lg font-bold text-ptt-cyan font-mono">{formatCurrency(avgNetPay)}</p>
                    <p className="text-xs text-muted mt-1">
                      รวมทั้งหมด {formatCurrency(allPayroll.reduce((sum, p) => sum + p.net, 0))}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "leaves" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-app font-display">
                    ประวัติการลา
                  </h3>
                  <p className="text-xs text-muted mt-1">
                    ตั้งแต่ {employee.startDate} (ระยะเวลา {workDuration} เดือน)
                  </p>
                </div>
                <div className="text-sm text-right">
                  <div>
                    <span className="text-muted">รวมทั้งหมด: </span>
                    <span className="text-app font-semibold">{totalLeaveDays} วัน</span>
                  </div>
                  {workDuration > 0 && (
                    <div className="text-xs text-muted mt-1">
                      เฉลี่ย {(totalLeaveDays / workDuration).toFixed(1)} วัน/เดือน
                    </div>
                  )}
                </div>
              </div>

              {/* Summary Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-ink-800/50 rounded-xl border border-app">
                  <div className="flex items-center gap-3 mb-2">
                    <Calendar className="w-5 h-5 text-ptt-cyan" />
                    <p className="text-xs text-muted">การลาทั้งหมด</p>
                  </div>
                  <p className="text-2xl font-bold text-app">
                    {allLeaves.length} รายการ
                  </p>
                  <p className="text-xs text-muted mt-1">
                    {totalLeaveDays} วัน
                  </p>
                </div>

                <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                  <div className="flex items-center gap-3 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <p className="text-xs text-muted">อนุมัติแล้ว</p>
                  </div>
                  <p className="text-2xl font-bold text-green-400">
                    {approvedLeaves.length} รายการ
                  </p>
                  <p className="text-xs text-muted mt-1">
                    {approvedLeaves.reduce((sum, l) => sum + l.days, 0)} วัน
                  </p>
                </div>

                <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                  <div className="flex items-center gap-3 mb-2">
                    <AlertCircle className="w-5 h-5 text-yellow-400" />
                    <p className="text-xs text-muted">รออนุมัติ</p>
                  </div>
                  <p className="text-2xl font-bold text-yellow-400">
                    {pendingLeaves.length} รายการ
                  </p>
                  <p className="text-xs text-muted mt-1">
                    {pendingLeaves.reduce((sum, l) => sum + l.days, 0)} วัน
                  </p>
                </div>

                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                  <div className="flex items-center gap-3 mb-2">
                    <XCircle className="w-5 h-5 text-red-400" />
                    <p className="text-xs text-muted">ไม่อนุมัติ</p>
                  </div>
                  <p className="text-2xl font-bold text-red-400">
                    {rejectedLeaves.length} รายการ
                  </p>
                  <p className="text-xs text-muted mt-1">
                    {rejectedLeaves.reduce((sum, l) => sum + l.days, 0)} วัน
                  </p>
                </div>
              </div>

              {/* Leave by Type */}
              {Object.keys(leavesByType).length > 0 && (
                <div>
                  <h4 className="text-md font-semibold text-app mb-3 font-display flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    สรุปการลาตามประเภท
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    {Object.entries(leavesByType).map(([type, data]) => (
                      <div key={type} className="p-3 bg-ink-800/50 rounded-lg border border-app">
                        <p className="text-xs text-muted mb-2">{type}</p>
                        <p className="text-lg font-bold text-app">{data.count} รายการ</p>
                        <p className="text-sm text-ptt-cyan mt-1">{data.days} วัน</p>
                        <div className="mt-2 space-y-1">
                          {data.approved > 0 && (
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-green-400">อนุมัติ</span>
                              <span className="text-app">{data.approved} รายการ</span>
                            </div>
                          )}
                          {data.pending > 0 && (
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-yellow-400">รอ</span>
                              <span className="text-app">{data.pending} รายการ</span>
                            </div>
                          )}
                          {data.rejected > 0 && (
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-red-400">ปฏิเสธ</span>
                              <span className="text-app">{data.rejected} รายการ</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Monthly Summary */}
              {monthlyLeavesSummary.length > 0 && (
                <div>
                  <h4 className="text-md font-semibold text-app mb-3 font-display flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    สรุปการลารายเดือน
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-ink-800/50 border-b border-app">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-app">เดือน</th>
                          <th className="px-4 py-3 text-center text-xs font-semibold text-app">จำนวนรายการ</th>
                          <th className="px-4 py-3 text-center text-xs font-semibold text-app">วันลา</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-app">ประเภท</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {monthlyLeavesSummary.map((month) => (
                          <tr key={month.month} className="hover:bg-ink-800/30 transition-colors">
                            <td className="px-4 py-3 text-sm text-app font-medium">
                              {new Date(month.month + "-01").toLocaleDateString("th-TH", { 
                                year: "numeric", 
                                month: "long" 
                              })}
                            </td>
                            <td className="px-4 py-3 text-center text-sm text-app font-semibold">
                              {month.total}
                            </td>
                            <td className="px-4 py-3 text-center text-sm text-ptt-cyan font-semibold">
                              {month.days} วัน
                            </td>
                            <td className="px-4 py-3 text-sm text-muted">
                              <div className="flex flex-wrap gap-1">
                                {Object.entries(month.byType).map(([type, days]) => (
                                  <span 
                                    key={type}
                                    className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-ptt-blue/20 text-ptt-cyan border border-ptt-blue/30"
                                  >
                                    {type}: {days} วัน
                                  </span>
                                ))}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Detailed Table */}
              <div>
                <h4 className="text-md font-semibold text-app mb-3 font-display">
                  รายละเอียดการลา
                </h4>
                {allLeaves.length > 0 ? (
                  <div className="space-y-3">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-ink-800/50 border-b border-app">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-app">ประเภท</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-app">วันที่</th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-app">จำนวนวัน</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-app">เหตุผล</th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-app">สถานะ</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {allLeaves.map((leave) => {
                            const fromDate = new Date(leave.fromDate);
                            const toDate = new Date(leave.toDate);
                            const isPast = toDate < today;
                            const isCurrent = fromDate <= today && toDate >= today;
                            return (
                              <tr key={leave.id} className="hover:bg-ink-800/30 transition-colors">
                                <td className="px-4 py-3">
                                  <span className="text-sm text-app font-medium">{leave.type}</span>
                                </td>
                                <td className="px-4 py-3 text-sm text-app">
                                  <div>
                                    <div className="font-medium">
                                      {fromDate.toLocaleDateString("th-TH", { 
                                        year: "numeric", 
                                        month: "short", 
                                        day: "numeric" 
                                      })}
                                    </div>
                                    <div className="text-xs text-muted">
                                      ถึง {toDate.toLocaleDateString("th-TH", { 
                                        year: "numeric", 
                                        month: "short", 
                                        day: "numeric" 
                                      })}
                                    </div>
                                    {(isPast || isCurrent) && (
                                      <div className="text-xs mt-1">
                                        {isCurrent ? (
                                          <span className="text-blue-400">● กำลังลา</span>
                                        ) : (
                                          <span className="text-muted">● ลาเสร็จแล้ว</span>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <span className="text-sm text-app font-semibold">{leave.days} วัน</span>
                                </td>
                                <td className="px-4 py-3 text-sm text-muted max-w-xs">
                                  <div className="truncate" title={leave.reason || "-"}>
                                    {leave.reason || "-"}
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <StatusTag variant={getStatusVariant(leave.status)}>
                                    {leave.status}
                                  </StatusTag>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                    <div className="text-center pt-4">
                      <p className="text-xs text-muted">
                        แสดงทั้งหมด {allLeaves.length} รายการ • 
                        รวม {totalLeaveDays} วัน • 
                        เฉลี่ย {workDuration > 0 ? (totalLeaveDays / workDuration).toFixed(1) : 0} วัน/เดือน
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted text-center py-8">ไม่มีประวัติการลา</p>
                )}
              </div>
            </div>
          )}

          {activeTab === "payroll" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-app mb-1 font-display">
                  ประวัติเงินเดือน
                </h3>
                <p className="text-xs text-muted">
                  ตั้งแต่ {employee.startDate} (ระยะเวลา {workDuration} เดือน) - แสดง {allPayroll.length} เดือน
                </p>
              </div>

              {allPayroll.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-ink-800/50 rounded-xl">
                      <p className="text-xs text-muted mb-1">เงินเดือนเฉลี่ย</p>
                      <p className="text-xl font-bold text-app font-mono">{formatCurrency(avgSalary)}</p>
                    </div>
                    <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                      <p className="text-xs text-muted mb-1">OT สะสม</p>
                      <p className="text-xl font-bold text-green-400 font-mono">{formatCurrency(totalOT)}</p>
                      <p className="text-xs text-muted mt-1">{totalOTHours} ชั่วโมง</p>
                    </div>
                    <div className="p-4 bg-ptt-blue/10 border border-ptt-blue/30 rounded-xl">
                      <p className="text-xs text-muted mb-1">รับสุทธิเฉลี่ย</p>
                      <p className="text-xl font-bold text-ptt-cyan font-mono">{formatCurrency(avgNetPay)}</p>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-ink-800/50 border-b border-app">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-app">เดือน</th>
                          <th className="px-4 py-3 text-right text-xs font-semibold text-app">เงินเดือน</th>
                          <th className="px-4 py-3 text-right text-xs font-semibold text-app">OT</th>
                          <th className="px-4 py-3 text-right text-xs font-semibold text-app">โบนัส</th>
                          <th className="px-4 py-3 text-right text-xs font-semibold text-app">หัก</th>
                          <th className="px-4 py-3 text-right text-xs font-semibold text-app">สุทธิ</th>
                          <th className="px-4 py-3 text-center text-xs font-semibold text-app">หลักฐาน</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {allPayroll.map((pay) => (
                          <tr key={pay.id} className="hover:bg-ink-800/30 transition-colors">
                            <td className="px-4 py-3 text-sm text-app font-medium">
                              {new Date(pay.month + "-01").toLocaleDateString("th-TH", { 
                                year: "numeric", 
                                month: "long" 
                              })}
                            </td>
                            <td className="px-4 py-3 text-right text-sm text-app font-mono">{formatCurrency(pay.salary)}</td>
                            <td className="px-4 py-3 text-right text-sm text-green-400 font-mono">
                              {pay.ot > 0 ? `+${formatCurrency(pay.ot)}` : "-"}
                            </td>
                            <td className="px-4 py-3 text-right text-sm text-green-400 font-mono">
                              {pay.bonus > 0 ? `+${formatCurrency(pay.bonus)}` : "-"}
                            </td>
                            <td className="px-4 py-3 text-right text-sm text-red-400 font-mono">
                              {pay.deduction > 0 ? `-${formatCurrency(pay.deduction)}` : "-"}
                            </td>
                            <td className="px-4 py-3 text-right text-sm text-ptt-cyan font-bold font-mono">{formatCurrency(pay.net)}</td>
                            <td className="px-4 py-3 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => handleViewPayslip(pay)}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs 
                                           bg-ptt-blue/20 hover:bg-ptt-blue/30 text-ptt-cyan rounded-lg
                                           transition-colors font-medium"
                                  title="ดูสลิปเงินเดือน"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  ดู
                                </button>
                                <button
                                  onClick={() => handleDownloadPayslip(pay)}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs 
                                           bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg
                                           transition-colors font-medium"
                                  title="ดาวน์โหลดสลิป"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <p className="text-muted text-center py-8">ไม่มีประวัติเงินเดือน</p>
              )}
            </div>
          )}

          {/* Payslip Modal */}
          <ModalForm
            isOpen={selectedPayslip !== null}
            onClose={() => setSelectedPayslip(null)}
            title={`สลิปเงินเดือน - ${selectedPayslip ? new Date(selectedPayslip.month + "-01").toLocaleDateString("th-TH", { year: "numeric", month: "long" }) : ""}`}
            size="lg"
          >
            {selectedPayslip && (
              <div className="space-y-6">
                {/* Employee Info */}
                <div className="p-4 bg-ink-800/50 rounded-xl border border-app">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted mb-1">ชื่อพนักงาน</p>
                      <p className="text-sm font-semibold text-app">{employee.name}</p>
                      <p className="text-xs text-muted mt-1">รหัส: {employee.code}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted mb-1">เดือน</p>
                      <p className="text-sm font-semibold text-app">
                        {new Date(selectedPayslip.month + "-01").toLocaleDateString("th-TH", { 
                          year: "numeric", 
                          month: "long" 
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Payroll Details */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-app">รายละเอียดเงินเดือน</h4>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-ink-800/30 rounded-lg">
                      <span className="text-sm text-muted">เงินเดือน</span>
                      <span className="text-sm font-semibold text-app font-mono">{formatCurrency(selectedPayslip.salary)}</span>
                    </div>
                    
                    {selectedPayslip.ot > 0 && (
                      <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg">
                        <span className="text-sm text-muted">ค่าล่วงเวลา (OT)</span>
                        <span className="text-sm font-semibold text-green-400 font-mono">+{formatCurrency(selectedPayslip.ot)}</span>
                      </div>
                    )}
                    
                    {selectedPayslip.bonus > 0 && (
                      <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg">
                        <span className="text-sm text-muted">โบนัส</span>
                        <span className="text-sm font-semibold text-green-400 font-mono">+{formatCurrency(selectedPayslip.bonus)}</span>
                      </div>
                    )}
                    
                    {selectedPayslip.deduction > 0 && (
                      <div className="flex items-center justify-between p-3 bg-red-500/10 rounded-lg">
                        <span className="text-sm text-muted">หักลดหย่อน</span>
                        <span className="text-sm font-semibold text-red-400 font-mono">-{formatCurrency(selectedPayslip.deduction)}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between p-4 bg-ptt-blue/10 border border-ptt-blue/30 rounded-lg mt-3">
                      <span className="text-base font-semibold text-app">รับสุทธิ</span>
                      <span className="text-xl font-bold text-ptt-cyan font-mono">{formatCurrency(selectedPayslip.net)}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Receipt */}
                {getReceiptImage(selectedPayslip) && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-app flex items-center gap-2">
                      <ImageIcon className="w-4 h-4" />
                      หลักฐานการโอนเงิน
                    </h4>
                    <div 
                      className="relative group cursor-pointer bg-ink-800/30 rounded-lg overflow-hidden border border-app"
                      onClick={() => setSelectedReceiptImage(getReceiptImage(selectedPayslip))}
                    >
                      <img
                        src={getReceiptImage(selectedPayslip) || ""}
                        alt={`หลักฐานการโอนเงิน ${selectedPayslip.month}`}
                        className="w-full h-auto object-contain max-h-64"
                        onError={(e) => {
                          // Fallback if image fails to load
                          e.currentTarget.src = "https://via.placeholder.com/800x600/cccccc/666666?text=ไม่มีหลักฐานการโอนเงิน";
                        }}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 px-3 py-2 bg-ptt-blue/80 rounded-lg">
                          <ZoomIn className="w-4 h-4 text-app" />
                          <span className="text-sm text-app font-medium">คลิกเพื่อขยาย</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-muted text-center">
                      คลิกที่รูปภาพเพื่อดูขนาดเต็ม
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-app">
                  <button
                    onClick={() => handleDownloadPayslip(selectedPayslip)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 
                             text-green-400 rounded-lg transition-colors font-medium"
                  >
                    <Download className="w-4 h-4" />
                    ดาวน์โหลด PDF
                  </button>
                  <button
                    onClick={() => {
                      alert(`กำลังพิมพ์สลิปเงินเดือน ${selectedPayslip.month} สำหรับ ${employee.name} (Mock)`);
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-ptt-blue/20 hover:bg-ptt-blue/30 
                             text-ptt-cyan rounded-lg transition-colors font-medium"
                  >
                    <FileText className="w-4 h-4" />
                    พิมพ์
                  </button>
                </div>

                {/* Note */}
                <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <p className="text-xs text-yellow-400">
                    💡 นี่เป็นข้อมูลตัวอย่าง สำหรับการใช้งานจริง ควรเชื่อมต่อกับระบบจัดเก็บเอกสารจริง
                  </p>
                </div>
              </div>
            )}
          </ModalForm>

          {/* Receipt Image Modal */}
          {selectedReceiptImage && (
            <div 
              className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
              onClick={() => setSelectedReceiptImage(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative max-w-4xl max-h-[90vh] bg-ink-900 rounded-xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="absolute top-4 right-4 z-10">
                  <button
                    onClick={() => setSelectedReceiptImage(null)}
                    className="p-2 bg-black/60 hover:bg-black/80 rounded-lg transition-colors text-app"
                    aria-label="ปิด"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>
                <img
                  src={selectedReceiptImage}
                  alt="หลักฐานการโอนเงิน"
                  className="w-full h-auto max-h-[90vh] object-contain"
                  onError={(e) => {
                    e.currentTarget.src = "https://via.placeholder.com/800x600/cccccc/666666?text=ไม่พบรูปภาพ";
                  }}
                />
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="bg-black/60 rounded-lg p-3 text-center">
                    <p className="text-sm text-app">
                      หลักฐานการโอนเงิน - {selectedPayslip && new Date(selectedPayslip.month + "-01").toLocaleDateString("th-TH", { year: "numeric", month: "long" })}
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          {activeTab === "attendance" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-app font-display">
                    เวลาเข้าออก
                  </h3>
                  <p className="text-xs text-muted mt-1">
                    ตั้งแต่ {employee.startDate} (ระยะเวลา {workDuration} เดือน)
                  </p>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                    <span className="text-muted">ตรงเวลา: {onTimeCount}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                    <span className="text-muted">สาย: {lateCount}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded"></div>
                    <span className="text-muted">ขาด: {absentCount}</span>
                  </div>
                </div>
              </div>

              {/* Summary Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-ink-800/50 rounded-xl border border-app">
                  <div className="flex items-center gap-3 mb-2">
                    <Clock className="w-5 h-5 text-ptt-cyan" />
                    <p className="text-xs text-muted">ชั่วโมงทำงานรวม</p>
                  </div>
                  <p className="text-2xl font-bold text-app font-mono">
                    {formatTime(totalWorkingHours)}
                  </p>
                  <p className="text-xs text-muted mt-1">
                    เฉลี่ย {formatTime(avgWorkingHours)}/วัน ({workingHoursData.length} วัน)
                  </p>
                </div>

                <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                  <div className="flex items-center gap-3 mb-2">
                    <AlertCircle className="w-5 h-5 text-yellow-400" />
                    <p className="text-xs text-muted">มาสายเฉลี่ย</p>
                  </div>
                  <p className="text-2xl font-bold text-yellow-400 font-mono">
                    {avgLateMinutes > 0 ? `${Math.round(avgLateMinutes)} นาที` : "-"}
                  </p>
                  <p className="text-xs text-muted mt-1">
                    รวม {totalLateMinutes} นาที ({lateCount} ครั้ง)
                  </p>
                </div>

                <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                  <div className="flex items-center gap-3 mb-2">
                    <TrendingUp className="w-5 h-5 text-green-400" />
                    <p className="text-xs text-muted">OT จากเวลาเข้างาน</p>
                  </div>
                  <p className="text-2xl font-bold text-green-400 font-mono">
                    {formatTime(totalOTHoursFromAttendance)}
                  </p>
                  <p className="text-xs text-muted mt-1">
                    {employeeShift ? `กะ${employeeShift.name}: ${shiftHours} ชม./วัน` : "กะมาตรฐาน: 8 ชม./วัน"}
                  </p>
                </div>

                <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                  <div className="flex items-center gap-3 mb-2">
                    <CheckCircle className="w-5 h-5 text-blue-400" />
                    <p className="text-xs text-muted">อัตราการเข้างาน</p>
                  </div>
                  <p className="text-2xl font-bold text-blue-400">
                    {attendanceRate}%
                  </p>
                  <p className="text-xs text-muted mt-1">
                    {onTimeCount + lateCount} / {totalDays} วัน
                  </p>
                </div>
              </div>

              {/* Monthly Summary */}
              {monthlySummary.length > 0 && (
                <div>
                  <h4 className="text-md font-semibold text-app mb-3 font-display flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    สรุปการเข้างานรายเดือน
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-ink-800/50 border-b border-app">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-app">เดือน</th>
                          <th className="px-4 py-3 text-center text-xs font-semibold text-app">วันทำงาน</th>
                          <th className="px-4 py-3 text-center text-xs font-semibold text-app">ตรงเวลา</th>
                          <th className="px-4 py-3 text-center text-xs font-semibold text-app">มาสาย</th>
                          <th className="px-4 py-3 text-center text-xs font-semibold text-app">ขาดงาน</th>
                          <th className="px-4 py-3 text-center text-xs font-semibold text-app">ลา</th>
                          <th className="px-4 py-3 text-right text-xs font-semibold text-app">ชั่วโมงทำงาน</th>
                          <th className="px-4 py-3 text-center text-xs font-semibold text-app">อัตรา</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {monthlySummary.map((month) => {
                          const monthRate = month.total > 0 
                            ? ((month.onTime / month.total) * 100).toFixed(1) 
                            : "0.0";
                          return (
                            <tr key={month.month} className="hover:bg-ink-800/30 transition-colors">
                              <td className="px-4 py-3 text-sm text-app font-medium">
                                {new Date(month.month + "-01").toLocaleDateString("th-TH", { 
                                  year: "numeric", 
                                  month: "long" 
                                })}
                              </td>
                              <td className="px-4 py-3 text-center text-sm text-app">{month.workingDays}</td>
                              <td className="px-4 py-3 text-center">
                                <span className="text-green-400 font-semibold">{month.onTime}</span>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span className="text-yellow-400 font-semibold">{month.late}</span>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span className="text-red-400 font-semibold">{month.absent}</span>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span className="text-blue-400 font-semibold">{month.leave}</span>
                              </td>
                              <td className="px-4 py-3 text-right text-sm text-app font-mono">
                                {formatTime(month.workingHours)}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span className="text-ptt-cyan font-semibold">{monthRate}%</span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Shift Comparison */}
              {employeeShift && (
                <div className="p-4 bg-ptt-blue/10 border border-ptt-blue/30 rounded-xl">
                  <h4 className="text-sm font-semibold text-app mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    เปรียบเทียบกับกะการทำงาน
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-muted mb-1">กะการทำงาน</p>
                      <p className="text-sm font-semibold text-app">
                        กะ{employeeShift.name}: {employeeShift.startTime} - {employeeShift.endTime}
                      </p>
                      <p className="text-xs text-muted mt-1">
                        {shiftHours} ชั่วโมง/วัน
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted mb-1">ชั่วโมงทำงานเฉลี่ย</p>
                      <p className="text-sm font-semibold text-ptt-cyan font-mono">
                        {formatTime(avgWorkingHours)}/วัน
                      </p>
                      <p className="text-xs text-muted mt-1">
                        {avgWorkingHours > shiftHours 
                          ? `มากกว่ากะ ${(avgWorkingHours - shiftHours).toFixed(1)} ชม.` 
                          : avgWorkingHours < shiftHours
                          ? `น้อยกว่ากะ ${(shiftHours - avgWorkingHours).toFixed(1)} ชม.`
                          : "ตรงกับกะ"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted mb-1">OT จากเวลาเข้างาน</p>
                      <p className="text-sm font-semibold text-green-400 font-mono">
                        {formatTime(totalOTHoursFromAttendance)}
                      </p>
                      <p className="text-xs text-muted mt-1">
                        {overtimeHoursData.length} วันที่มี OT
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Detailed Table */}
              <div>
                <h4 className="text-md font-semibold text-app mb-3 font-display">
                  รายละเอียดการเข้างาน
                </h4>
                {allAttendance.length > 0 ? (
                  <div className="space-y-2">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-ink-800/50 border-b border-app">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-app">วันที่</th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-app">เวลาเข้า</th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-app">เวลาออก</th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-app">ชั่วโมงทำงาน</th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-app">สถานะ</th>
                            {employeeShift && (
                              <th className="px-4 py-3 text-center text-xs font-semibold text-app">OT</th>
                            )}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {allAttendance.map((log) => {
                            const hours = log.checkIn !== "-" && log.checkOut !== "-" 
                              ? calculateWorkingHours(log.checkIn, log.checkOut) 
                              : 0;
                            const otHours = employeeShift && hours > shiftHours ? hours - shiftHours : 0;
                            return (
                              <tr key={log.id} className="hover:bg-ink-800/30 transition-colors">
                                <td className="px-4 py-3 text-sm text-app">{log.date}</td>
                                <td className="px-4 py-3 text-center text-sm text-app font-mono">
                                  {log.checkIn !== "-" ? log.checkIn : "-"}
                                </td>
                                <td className="px-4 py-3 text-center text-sm text-app font-mono">
                                  {log.checkOut !== "-" ? log.checkOut : "-"}
                                </td>
                                <td className="px-4 py-3 text-center text-sm text-app font-mono">
                                  {hours > 0 ? formatTime(hours) : "-"}
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <StatusTag variant={getStatusVariant(log.status)}>
                                    {log.status}
                                  </StatusTag>
                                </td>
                                {employeeShift && (
                                  <td className="px-4 py-3 text-center">
                                    {otHours > 0 ? (
                                      <span className="text-green-400 font-semibold text-xs">
                                        +{formatTime(otHours)}
                                      </span>
                                    ) : (
                                      <span className="text-muted text-xs">-</span>
                                    )}
                                  </td>
                                )}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                    <div className="text-center pt-4">
                      <p className="text-xs text-muted">
                        แสดงทั้งหมด {allAttendance.length} รายการ • 
                        ชั่วโมงทำงานรวม: {formatTime(totalWorkingHours)} • 
                        เฉลี่ย: {formatTime(avgWorkingHours)}/วัน
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted text-center py-8">ไม่มีประวัติการเข้าออก</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

