import { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, Calendar, Wallet, TrendingUp, AlertCircle, CheckCircle, XCircle, FileText, Download, Eye, Image as ImageIcon, ZoomIn, Filter, CalendarDays, CalendarRange, Award, AlertTriangle, ArrowRightLeft, Briefcase, DollarSign, ChevronRight, Edit, Settings, ChevronDown } from "lucide-react";
import ProfileCard from "@/components/ProfileCard";
import StatusTag, { getStatusVariant } from "@/components/StatusTag";
import ModalForm from "@/components/ModalForm";
import { 
  employees, 
  shifts, 
  attendanceLogs, 
  leaves, 
  payroll,
  salaryHistory,
  rewardPenaltyHistory,
  positionTransferHistory,
  workHistory
} from "@/data/mockData";

type ViewMode = "day" | "month" | "year";

export default function EmployeeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("general");
  const [selectedPayslip, setSelectedPayslip] = useState<typeof payroll[0] | null>(null);
  const [selectedReceiptImage, setSelectedReceiptImage] = useState<string | null>(null);
  
  // View mode states
  const [attendanceViewMode, setAttendanceViewMode] = useState<ViewMode>("day");
  const [leavesViewMode, setLeavesViewMode] = useState<ViewMode>("day");
  
  // Modal states for history details
  const [showWorkHistoryModal, setShowWorkHistoryModal] = useState(false);
  const [showSalaryHistoryModal, setShowSalaryHistoryModal] = useState(false);
  const [showRewardPenaltyModal, setShowRewardPenaltyModal] = useState(false);
  const [showTransferHistoryModal, setShowTransferHistoryModal] = useState(false);
  
  // Management states
  const [showManagementDropdown, setShowManagementDropdown] = useState(false);
  const [showSalaryAdjustModal, setShowSalaryAdjustModal] = useState(false);
  const [showRewardPenaltyManageModal, setShowRewardPenaltyManageModal] = useState(false);
  const [showTransferPositionModal, setShowTransferPositionModal] = useState(false);
  
  // Form states for modals
  const [salaryFormData, setSalaryFormData] = useState({
    type: "ขึ้นเงินเดือน",
    oldSalary: 0,
    newSalary: 0,
    changeAmount: 0,
    reason: "",
    note: "",
    date: new Date().toISOString().split('T')[0]
  });
  
  const [rewardPenaltyFormData, setRewardPenaltyFormData] = useState({
    type: "ทันบน",
    category: "",
    title: "",
    description: "",
    amount: "",
    date: new Date().toISOString().split('T')[0],
    note: "",
    issuedBy: ""
  });
  
  const [transferFormData, setTransferFormData] = useState({
    type: "โยกย้าย",
    oldPosition: "",
    oldDept: "",
    newPosition: "",
    newDept: "",
    date: new Date().toISOString().split('T')[0],
    reason: "",
    note: "",
    approvedBy: ""
  });
  
  // Date range filters
  const [attendanceDateFrom, setAttendanceDateFrom] = useState("");
  const [attendanceDateTo, setAttendanceDateTo] = useState("");
  const [leavesDateFrom, setLeavesDateFrom] = useState("");
  const [leavesDateTo, setLeavesDateTo] = useState("");

  // Find employee
  const employee = employees.find((e) => e.id === Number(id));

  // Get employee's shift (safe access)
  const employeeShift = employee?.shiftId ? shifts.find(s => s.id === employee.shiftId) : null;

  // Work duration calculation (safe access)
  const startDate = employee ? new Date(employee.startDate) : new Date();
  const today = new Date();
  const workDuration = employee ? Math.floor(
    (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
  ) : 0;
  
  // Filter data to show only since employee started working
  // Attendance: only from start date onwards
  const allAttendance = employee ? attendanceLogs
    .filter((log) => {
      if (log.empCode !== employee.code) return false;
      const logDate = new Date(log.date);
      if (logDate < startDate) return false;
      
      // Apply date range filter if set
      if (attendanceDateFrom) {
        const fromDate = new Date(attendanceDateFrom);
        if (logDate < fromDate) return false;
      }
      if (attendanceDateTo) {
        const toDate = new Date(attendanceDateTo);
        toDate.setHours(23, 59, 59, 999); // Include the entire day
        if (logDate > toDate) return false;
      }
      
      return true;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) : [];

  // Leaves: only from start date onwards
  const allLeaves = employee ? leaves
    .filter((leave) => {
      if (leave.empCode !== employee.code) return false;
      const leaveDate = new Date(leave.fromDate);
      if (leaveDate < startDate) return false;
      
      // Apply date range filter if set
      if (leavesDateFrom) {
        const fromDate = new Date(leavesDateFrom);
        if (leaveDate < fromDate) return false;
      }
      if (leavesDateTo) {
        const toDate = new Date(leavesDateTo);
        toDate.setHours(23, 59, 59, 999);
        if (leaveDate > toDate) return false;
      }
      
      return true;
    })
    .sort((a, b) => new Date(b.fromDate).getTime() - new Date(a.fromDate).getTime()) : [];

  // Payroll: only from start date onwards (compare by month)
  const allPayroll = employee ? payroll
    .filter((p) => {
      if (p.empCode !== employee.code) return false;
      const payMonth = new Date(p.month + "-01");
      return payMonth >= startDate;
    })
    .sort((a, b) => new Date(b.month + "-01").getTime() - new Date(a.month + "-01").getTime()) : [];

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

  // Payroll statistics
  const avgSalary = allPayroll.length > 0 
    ? allPayroll.reduce((sum, p) => sum + p.salary, 0) / allPayroll.length 
    : 0;
  const totalOT = allPayroll.reduce((sum, p) => sum + p.ot, 0);
  const avgOTRate = employee?.otRate || 200;
  const totalOTHours = Math.round(totalOT / avgOTRate);
  const avgNetPay = allPayroll.length > 0
    ? allPayroll.reduce((sum, p) => sum + p.net, 0) / allPayroll.length
    : 0;
  
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

  // Group attendance by view mode (must be before early return)
  const groupedAttendance = useMemo(() => {
    if (!employee || allAttendance.length === 0) return [];
    if (attendanceViewMode === "day") {
      return allAttendance.map(log => ({
        key: log.date,
        label: new Date(log.date).toLocaleDateString("th-TH", { 
          year: "numeric", 
          month: "short", 
          day: "numeric",
          weekday: "short"
        }),
        logs: [log],
        date: log.date
      }));
    } else if (attendanceViewMode === "month") {
      const grouped = allAttendance.reduce((acc, log) => {
        const month = log.date.substring(0, 7); // YYYY-MM
        if (!acc[month]) {
          acc[month] = [];
        }
        acc[month].push(log);
        return acc;
      }, {} as Record<string, typeof allAttendance>);
      
      return Object.entries(grouped)
        .sort((a, b) => b[0].localeCompare(a[0]))
        .map(([month, logs]) => ({
          key: month,
          label: new Date(month + "-01").toLocaleDateString("th-TH", { 
            year: "numeric", 
            month: "long" 
          }),
          logs,
          date: month
        }));
    } else { // year
      const grouped = allAttendance.reduce((acc, log) => {
        const year = log.date.substring(0, 4); // YYYY
        if (!acc[year]) {
          acc[year] = [];
        }
        acc[year].push(log);
        return acc;
      }, {} as Record<string, typeof allAttendance>);
      
      return Object.entries(grouped)
        .sort((a, b) => b[0].localeCompare(a[0]))
        .map(([year, logs]) => ({
          key: year,
          label: `ปี ${year}`,
          logs,
          date: year
        }));
    }
  }, [allAttendance, attendanceViewMode, employee]);

  // Group leaves by view mode (must be before early return)
  const groupedLeaves = useMemo(() => {
    if (!employee || allLeaves.length === 0) return [];
    if (leavesViewMode === "day") {
      return allLeaves.map(leave => ({
        key: leave.id.toString(),
        label: new Date(leave.fromDate).toLocaleDateString("th-TH", { 
          year: "numeric", 
          month: "short", 
          day: "numeric"
        }),
        leaves: [leave],
        date: leave.fromDate
      }));
    } else if (leavesViewMode === "month") {
      const grouped = allLeaves.reduce((acc, leave) => {
        const month = leave.fromDate.substring(0, 7); // YYYY-MM
        if (!acc[month]) {
          acc[month] = [];
        }
        acc[month].push(leave);
        return acc;
      }, {} as Record<string, typeof allLeaves>);
      
      return Object.entries(grouped)
        .sort((a, b) => b[0].localeCompare(a[0]))
        .map(([month, leaves]) => ({
          key: month,
          label: new Date(month + "-01").toLocaleDateString("th-TH", { 
            year: "numeric", 
            month: "long" 
          }),
          leaves,
          date: month
        }));
    } else { // year
      const grouped = allLeaves.reduce((acc, leave) => {
        const year = leave.fromDate.substring(0, 4); // YYYY
        if (!acc[year]) {
          acc[year] = [];
        }
        acc[year].push(leave);
        return acc;
      }, {} as Record<string, typeof allLeaves>);
      
      return Object.entries(grouped)
        .sort((a, b) => b[0].localeCompare(a[0]))
        .map(([year, leaves]) => ({
          key: year,
          label: `ปี ${year}`,
          leaves,
          date: year
        }));
    }
  }, [allLeaves, leavesViewMode, employee]);

  // Reset date filters when view mode changes
  const handleAttendanceViewModeChange = (mode: ViewMode) => {
    setAttendanceViewMode(mode);
    setAttendanceDateFrom("");
    setAttendanceDateTo("");
  };

  const handleLeavesViewModeChange = (mode: ViewMode) => {
    setLeavesViewMode(mode);
    setLeavesDateFrom("");
    setLeavesDateTo("");
  };

  // Initialize form data when modals open
  useEffect(() => {
    if (showSalaryAdjustModal && employee) {
      const currentSalary = allPayroll.length > 0 
        ? allPayroll[allPayroll.length - 1].salary 
        : 0;
      setSalaryFormData({
        type: "ขึ้นเงินเดือน",
        oldSalary: currentSalary,
        newSalary: currentSalary,
        changeAmount: 0,
        reason: "",
        note: "",
        date: new Date().toISOString().split('T')[0]
      });
    }
  }, [showSalaryAdjustModal, employee, allPayroll]);

  useEffect(() => {
    if (showRewardPenaltyManageModal) {
      setRewardPenaltyFormData({
        type: "ทันบน",
        category: "",
        title: "",
        description: "",
        amount: "",
        date: new Date().toISOString().split('T')[0],
        note: "",
        issuedBy: ""
      });
    }
  }, [showRewardPenaltyManageModal]);

  useEffect(() => {
    if (showTransferPositionModal && employee) {
      setTransferFormData({
        type: "โยกย้าย",
        oldPosition: employee.position,
        oldDept: employee.dept,
        newPosition: "",
        newDept: "",
        date: new Date().toISOString().split('T')[0],
        reason: "",
        note: "",
        approvedBy: ""
      });
    }
  }, [showTransferPositionModal, employee]);

  // Early return if employee not found (after all hooks)
  if (!employee) {
    return (
      <div className="text-center py-12">
        <p className="text-muted">ไม่พบข้อมูลพนักงาน</p>
      </div>
    );
  }

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
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/app/hr/employees")}
            className="p-2 hover:bg-soft rounded-lg transition-colors text-muted hover:text-app"
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
        
        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/app/hr/employees/${id}/edit`)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-ptt-blue/20 hover:bg-ptt-blue/30 
                     text-ptt-cyan rounded-lg transition-colors font-medium"
          >
            <Edit className="w-4 h-4" />
            แก้ไขพนักงาน
          </button>
          
          {/* Management Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowManagementDropdown(!showManagementDropdown)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-soft hover:bg-app/10 
                       text-app rounded-lg transition-colors font-medium border border-app"
            >
              <Settings className="w-4 h-4" />
              จัดการ
              <ChevronDown className={`w-4 h-4 transition-transform ${showManagementDropdown ? 'rotate-180' : ''}`} />
            </button>
            
            {showManagementDropdown && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowManagementDropdown(false)}
                />
                <div className="absolute right-0 mt-2 w-56 bg-soft border border-app rounded-lg shadow-xl z-50 overflow-hidden">
                  <button
                    onClick={() => {
                      setShowSalaryAdjustModal(true);
                      setShowManagementDropdown(false);
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-app/10 transition-colors flex items-center gap-3 text-app"
                  >
                    <DollarSign className="w-4 h-4 text-ptt-cyan" />
                    <span>ปรับเปลี่ยนเงินเดือน</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowRewardPenaltyManageModal(true);
                      setShowManagementDropdown(false);
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-app/10 transition-colors flex items-center gap-3 text-app border-t border-app"
                  >
                    <Award className="w-4 h-4 text-yellow-400" />
                    <span>จัดการทันบน</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowTransferPositionModal(true);
                      setShowManagementDropdown(false);
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-app/10 transition-colors flex items-center gap-3 text-app border-t border-app"
                  >
                    <ArrowRightLeft className="w-4 h-4 text-blue-400" />
                    <span>โยกย้ายตำแหน่ง</span>
                  </button>
                </div>
              </>
            )}
          </div>
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
      <div className="bg-soft border border-app rounded-2xl overflow-hidden shadow-xl">
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
                <div>
                  <p className="text-sm text-muted">หมวดหมู่</p>
                  {employee.category ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium
                                     bg-ptt-cyan/20 text-ptt-cyan border border-ptt-cyan/30">
                      {employee.category}
                    </span>
                  ) : (
                    <p className="text-app font-medium">-</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "history" && (() => {
            // Filter data for current employee
            const empSalaryHistory = salaryHistory.filter(s => s.empCode === employee.code)
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            const empRewardPenalty = rewardPenaltyHistory.filter(r => r.empCode === employee.code)
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            const empTransfers = positionTransferHistory.filter(t => t.empCode === employee.code)
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            const empWorkHistory = workHistory.filter(w => w.empCode === employee.code)
              .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

            return (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-app mb-4 font-display">
                  ประวัติการทำงาน
                </h3>
                
                {/* Work Duration */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-soft rounded-xl">
                    <p className="text-sm text-muted mb-1">เริ่มงานเมื่อ</p>
                    <p className="text-app font-semibold">{employee.startDate}</p>
                  </div>
                  <div className="p-4 bg-soft rounded-xl">
                    <p className="text-sm text-muted mb-1">ระยะเวลาทำงาน</p>
                    <p className="text-app font-semibold">{workDuration} เดือน</p>
                  </div>
                </div>

                {/* Work History Timeline */}
                {empWorkHistory.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-md font-semibold text-app font-display flex items-center gap-2">
                        <Briefcase className="w-4 h-4" />
                        ประวัติการทำงานและระยะเวลา
                      </h4>
                      <button
                        onClick={() => setShowWorkHistoryModal(true)}
                        className="text-sm text-ptt-cyan hover:text-ptt-blue flex items-center gap-1 transition-colors"
                      >
                        ดูทั้งหมด ({empWorkHistory.length})
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="space-y-3">
                      {empWorkHistory.slice(0, 3).map((work) => {
                        const startDate = new Date(work.startDate);
                        const endDate = work.endDate ? new Date(work.endDate) : new Date();
                        const durationMs = endDate.getTime() - startDate.getTime();
                        const durationDays = Math.floor(durationMs / (1000 * 60 * 60 * 24));
                        const durationMonths = Math.floor(durationDays / 30);
                        const durationYears = Math.floor(durationMonths / 12);
                        const remainingMonths = durationMonths % 12;
                        const remainingDays = durationDays % 30;
                        
                        let durationText = "";
                        if (durationYears > 0) {
                          durationText = `${durationYears} ปี`;
                          if (remainingMonths > 0) {
                            durationText += ` ${remainingMonths} เดือน`;
                          }
                        } else if (durationMonths > 0) {
                          durationText = `${durationMonths} เดือน`;
                          if (remainingDays > 0 && durationMonths < 3) {
                            durationText += ` ${remainingDays} วัน`;
                          }
                        } else {
                          durationText = `${durationDays} วัน`;
                        }
                        
                        return (
                          <div key={work.id} className="p-4 bg-soft rounded-xl border border-app">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <p className="font-semibold text-app">{work.position}</p>
                                <p className="text-sm text-muted">{work.dept}</p>
                              </div>
                              <StatusTag variant={work.status === "Active" ? "success" : work.status === "Transferred" ? "warning" : "neutral"}>
                                {work.status === "Active" ? "กำลังทำงาน" : work.status === "Transferred" ? "โยกย้าย" : "เสร็จสิ้น"}
                              </StatusTag>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted mb-2">
                              <span>{startDate.toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" })}</span>
                              {work.endDate && (
                                <>
                                  <span>ถึง</span>
                                  <span>{endDate.toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" })}</span>
                                </>
                              )}
                              {!work.endDate && <span className="text-ptt-cyan">ถึงปัจจุบัน</span>}
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-ptt-blue/20 text-ptt-cyan border border-ptt-blue/30">
                                อายุการทำงาน: {durationText}
                              </span>
                            </div>
                            {work.description && (
                              <p className="text-xs text-muted mt-2">{work.description}</p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

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
                  <div className="p-3 bg-soft rounded-lg">
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
                  <div className="p-3 bg-soft rounded-lg">
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

              {/* Salary History */}
              {empSalaryHistory.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-md font-semibold text-app font-display flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      ประวัติการขึ้น-ลดเงินเดือน
                    </h4>
                    <button
                      onClick={() => setShowSalaryHistoryModal(true)}
                      className="text-sm text-ptt-cyan hover:text-ptt-blue flex items-center gap-1 transition-colors"
                    >
                      ดูทั้งหมด ({empSalaryHistory.length})
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="space-y-3">
                    {empSalaryHistory.slice(0, 2).map((salary) => (
                      <div key={salary.id} className="p-4 bg-soft rounded-xl border border-app">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`px-3 py-1 rounded-lg text-xs font-medium ${
                                salary.type === "ขึ้นเงินเดือน" 
                                  ? "bg-green-500/20 text-green-400 border border-green-500/30"
                                  : salary.type === "ลดเงินเดือน"
                                  ? "bg-red-500/20 text-red-400 border border-red-500/30"
                                  : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                              }`}>
                                {salary.type}
                              </span>
                              <span className="text-sm text-muted">
                                {new Date(salary.date).toLocaleDateString("th-TH", { 
                                  year: "numeric", 
                                  month: "long", 
                                  day: "numeric" 
                                })}
                              </span>
                            </div>
                            <p className="text-sm text-muted mb-2">{salary.reason}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted">เปลี่ยน</p>
                            <p className={`text-sm font-semibold ${
                              salary.changeAmount > 0 ? "text-green-400" : "text-red-400"
                            }`}>
                              {salary.changeAmount > 0 ? "+" : ""}{formatCurrency(salary.changeAmount)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="text-xs text-muted">เงินเดือนเดิม</p>
                            <p className="text-sm font-semibold text-app font-mono">{formatCurrency(salary.oldSalary)}</p>
                          </div>
                          <ArrowRightLeft className="w-4 h-4 text-muted" />
                          <div>
                            <p className="text-xs text-muted">เงินเดือนใหม่</p>
                            <p className="text-sm font-semibold text-ptt-cyan font-mono">{formatCurrency(salary.newSalary)}</p>
                          </div>
                        </div>
                        <div className="mt-3 p-3 bg-ptt-blue/10 border border-ptt-blue/30 rounded-lg">
                          <p className="text-xs text-muted mb-1">หมายเหตุ:</p>
                          <p className="text-sm text-app">{salary.note}</p>
                          <p className="text-xs text-muted mt-2">อนุมัติโดย: {salary.approvedBy}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reward & Penalty History */}
              {empRewardPenalty.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-md font-semibold text-app font-display flex items-center gap-2">
                      <Award className="w-4 h-4" />
                      ประวัติทันบนและการลงโทษ
                    </h4>
                    <button
                      onClick={() => setShowRewardPenaltyModal(true)}
                      className="text-sm text-ptt-cyan hover:text-ptt-blue flex items-center gap-1 transition-colors"
                    >
                      ดูทั้งหมด ({empRewardPenalty.length})
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="space-y-3">
                    {empRewardPenalty.slice(0, 2).map((item) => (
                      <div key={item.id} className={`p-4 rounded-xl border ${
                        item.type === "ทันบน"
                          ? "bg-green-500/10 border-green-500/30"
                          : "bg-red-500/10 border-red-500/30"
                      }`}>
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              {item.type === "ทันบน" ? (
                                <Award className="w-4 h-4 text-green-400" />
                              ) : (
                                <AlertTriangle className="w-4 h-4 text-red-400" />
                              )}
                              <span className={`px-3 py-1 rounded-lg text-xs font-medium ${
                                item.type === "ทันบน"
                                  ? "bg-green-500/20 text-green-400 border border-green-500/30"
                                  : "bg-red-500/20 text-red-400 border border-red-500/30"
                              }`}>
                                {item.category}
                              </span>
                              <span className="text-sm text-muted">
                                {new Date(item.date).toLocaleDateString("th-TH", { 
                                  year: "numeric", 
                                  month: "long", 
                                  day: "numeric" 
                                })}
                              </span>
                            </div>
                            <p className="text-sm font-semibold text-app mb-1">{item.title}</p>
                            <p className="text-sm text-muted">{item.description}</p>
                          </div>
                          {item.amount && (
                            <div className="text-right">
                              <p className="text-xs text-muted">รางวัล</p>
                              <p className="text-sm font-semibold text-green-400 font-mono">{formatCurrency(item.amount)}</p>
                            </div>
                          )}
                        </div>
                        <div className="mt-3 p-3 bg-soft rounded-lg border border-app">
                          <p className="text-xs text-muted mb-1">หมายเหตุ:</p>
                          <p className="text-sm text-app">{item.note}</p>
                          <p className="text-xs text-muted mt-2">ออกโดย: {item.issuedBy}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Position Transfer History */}
              {empTransfers.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-md font-semibold text-app font-display flex items-center gap-2">
                      <ArrowRightLeft className="w-4 h-4" />
                      ประวัติการโยก-ย้ายตำแหน่ง
                    </h4>
                    <button
                      onClick={() => setShowTransferHistoryModal(true)}
                      className="text-sm text-ptt-cyan hover:text-ptt-blue flex items-center gap-1 transition-colors"
                    >
                      ดูทั้งหมด ({empTransfers.length})
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="space-y-3">
                    {empTransfers.slice(0, 2).map((transfer) => (
                      <div key={transfer.id} className="p-4 bg-soft rounded-xl border border-app">
                        <div className="flex items-center justify-between mb-3">
                          <span className={`px-3 py-1 rounded-lg text-xs font-medium ${
                            transfer.type === "เลื่อนตำแหน่ง"
                              ? "bg-green-500/20 text-green-400 border border-green-500/30"
                              : transfer.type === "ลดตำแหน่ง"
                              ? "bg-red-500/20 text-red-400 border border-red-500/30"
                              : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                          }`}>
                            {transfer.type}
                          </span>
                          <span className="text-sm text-muted">
                            {new Date(transfer.date).toLocaleDateString("th-TH", { 
                              year: "numeric", 
                              month: "long", 
                              day: "numeric" 
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mb-3">
                          <div className="flex-1 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                            <p className="text-xs text-muted mb-1">เดิม</p>
                            <p className="text-sm font-semibold text-app">{transfer.oldPosition}</p>
                            <p className="text-xs text-muted">{transfer.oldDept}</p>
                          </div>
                          <ArrowRightLeft className="w-5 h-5 text-muted flex-shrink-0" />
                          <div className="flex-1 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                            <p className="text-xs text-muted mb-1">ใหม่</p>
                            <p className="text-sm font-semibold text-ptt-cyan">{transfer.newPosition}</p>
                            <p className="text-xs text-muted">{transfer.newDept}</p>
                          </div>
                        </div>
                        <div className="mb-2">
                          <p className="text-sm text-muted mb-1">เหตุผล:</p>
                          <p className="text-sm text-app">{transfer.reason}</p>
                        </div>
                        <div className="mt-3 p-3 bg-ptt-blue/10 border border-ptt-blue/30 rounded-lg">
                          <p className="text-xs text-muted mb-1">หมายเหตุ:</p>
                          <p className="text-sm text-app">{transfer.note}</p>
                          <p className="text-xs text-muted mt-2">อนุมัติโดย: {transfer.approvedBy}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            );
          })()}

          {activeTab === "leaves" && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-app font-display">
                    ประวัติการลา
                  </h3>
                  <p className="text-xs text-muted mt-1">
                    ตั้งแต่ {employee.startDate} (ระยะเวลา {workDuration} เดือน)
                  </p>
                </div>
                <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
                  {/* View Mode Selector - Button Group */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs text-muted flex items-center gap-1">
                      <Filter className="w-3 h-3" />
                      แสดงข้อมูลแบบ:
                    </label>
                    <div className="flex items-center gap-1 bg-soft p-1 rounded-lg border border-app">
                      <button
                        onClick={() => handleLeavesViewModeChange("day")}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
                          leavesViewMode === "day"
                            ? "bg-ptt-blue text-ptt-cyan shadow-lg shadow-ptt-blue/20"
                            : "text-muted hover:text-app hover:bg-app/10"
                        }`}
                        title="แสดงรายละเอียดแต่ละวัน"
                      >
                        <CalendarDays className="w-3.5 h-3.5" />
                        วัน
                      </button>
                      <button
                        onClick={() => handleLeavesViewModeChange("month")}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
                          leavesViewMode === "month"
                            ? "bg-ptt-blue text-ptt-cyan shadow-lg shadow-ptt-blue/20"
                            : "text-muted hover:text-app hover:bg-app/10"
                        }`}
                        title="จัดกลุ่มตามเดือน"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        เดือน
                      </button>
                      <button
                        onClick={() => handleLeavesViewModeChange("year")}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
                          leavesViewMode === "year"
                            ? "bg-ptt-blue text-ptt-cyan shadow-lg shadow-ptt-blue/20"
                            : "text-muted hover:text-app hover:bg-app/10"
                        }`}
                        title="จัดกลุ่มตามปี"
                      >
                        <CalendarRange className="w-3.5 h-3.5" />
                        ปี
                      </button>
                    </div>
                  </div>
                  
                  {/* Date Range Filters */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs text-muted flex items-center gap-1">
                      <CalendarRange className="w-3 h-3" />
                      กรองตามวันที่:
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="date"
                        value={leavesDateFrom}
                        onChange={(e) => setLeavesDateFrom(e.target.value)}
                        className="px-3 py-1.5 bg-soft border border-app rounded-lg text-sm text-app
                                 focus:outline-none focus:ring-2 focus:ring-ptt-blue focus:border-ptt-blue"
                        placeholder="จากวันที่"
                      />
                      <span className="text-muted text-sm">ถึง</span>
                      <input
                        type="date"
                        value={leavesDateTo}
                        onChange={(e) => setLeavesDateTo(e.target.value)}
                        className="px-3 py-1.5 bg-soft border border-app rounded-lg text-sm text-app
                                 focus:outline-none focus:ring-2 focus:ring-ptt-blue focus:border-ptt-blue"
                        placeholder="ถึงวันที่"
                      />
                      {(leavesDateFrom || leavesDateTo) && (
                        <button
                          onClick={() => {
                            setLeavesDateFrom("");
                            setLeavesDateTo("");
                          }}
                          className="px-3 py-1.5 text-xs bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors font-medium"
                          title="ล้างการกรอง"
                        >
                          ล้าง
                        </button>
                      )}
                    </div>
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
                      <div key={type} className="p-3 bg-soft rounded-lg border border-app">
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
                      <thead className="bg-soft border-b border-app">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-app">เดือน</th>
                          <th className="px-4 py-3 text-center text-xs font-semibold text-app">จำนวนรายการ</th>
                          <th className="px-4 py-3 text-center text-xs font-semibold text-app">วันลา</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-app">ประเภท</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-app">
                        {monthlyLeavesSummary.map((month) => (
                          <tr key={month.month} className="hover:bg-soft transition-colors">
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
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-md font-semibold text-app font-display flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    รายละเอียดการลา
                  </h4>
                  <div className="flex items-center gap-2">
                    {leavesViewMode === "day" && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs bg-ptt-blue/20 text-ptt-cyan border border-ptt-blue/30">
                        <CalendarDays className="w-3 h-3" />
                        แสดงรายวัน
                      </span>
                    )}
                    {leavesViewMode === "month" && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs bg-ptt-blue/20 text-ptt-cyan border border-ptt-blue/30">
                        <Calendar className="w-3 h-3" />
                        จัดกลุ่มตามเดือน
                      </span>
                    )}
                    {leavesViewMode === "year" && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs bg-ptt-blue/20 text-ptt-cyan border border-ptt-blue/30">
                        <CalendarRange className="w-3 h-3" />
                        จัดกลุ่มตามปี
                      </span>
                    )}
                  </div>
                </div>
                {allLeaves.length > 0 ? (
                  <div className="space-y-4">
                    {groupedLeaves.map((group) => (
                      <div key={group.key} className="border border-app rounded-xl overflow-hidden">
                        {(leavesViewMode === "month" || leavesViewMode === "year") && (
                          <div className="px-4 py-3 bg-soft border-b border-app">
                            <h5 className="text-sm font-semibold text-ptt-cyan">
                              {group.label}
                              <span className="text-xs text-muted font-normal ml-2">
                                ({group.leaves.length} รายการ • {group.leaves.reduce((sum, l) => sum + l.days, 0)} วัน)
                              </span>
                            </h5>
                          </div>
                        )}
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-soft border-b border-app">
                              <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-app">ประเภท</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-app">วันที่</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-app">จำนวนวัน</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-app">เหตุผล</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-app">สถานะ</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-app">
                              {group.leaves.map((leave) => {
                                const fromDate = new Date(leave.fromDate);
                                const toDate = new Date(leave.toDate);
                                const isPast = toDate < today;
                                const isCurrent = fromDate <= today && toDate >= today;
                                return (
                                  <tr key={leave.id} className="hover:bg-soft transition-colors">
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
                      </div>
                    ))}
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
                    <div className="p-4 bg-soft rounded-xl">
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
                      <thead className="bg-soft border-b border-app">
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
                      <tbody className="divide-y divide-app">
                        {allPayroll.map((pay) => (
                          <tr key={pay.id} className="hover:bg-soft transition-colors">
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
                <div className="p-4 bg-soft rounded-xl border border-app">
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
                    <div className="flex items-center justify-between p-3 bg-soft rounded-lg">
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
                      className="relative group cursor-pointer bg-soft rounded-lg overflow-hidden border border-app"
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
                className="relative max-w-4xl max-h-[90vh] bg-soft rounded-xl overflow-hidden"
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

          {/* Work History Modal */}
          <ModalForm
            isOpen={showWorkHistoryModal}
            onClose={() => setShowWorkHistoryModal(false)}
            title="ประวัติการทำงานและระยะเวลาทั้งหมด"
            size="lg"
          >
            {(() => {
              const empWorkHistory = workHistory.filter(w => w.empCode === employee.code)
                .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
              
              return (
                <div className="space-y-4">
                  {empWorkHistory.map((work) => {
                    const startDate = new Date(work.startDate);
                    const endDate = work.endDate ? new Date(work.endDate) : new Date();
                    const durationMs = endDate.getTime() - startDate.getTime();
                    const durationDays = Math.floor(durationMs / (1000 * 60 * 60 * 24));
                    const durationMonths = Math.floor(durationDays / 30);
                    const durationYears = Math.floor(durationMonths / 12);
                    const remainingMonths = durationMonths % 12;
                    const remainingDays = durationDays % 30;
                    
                    let durationText = "";
                    if (durationYears > 0) {
                      durationText = `${durationYears} ปี`;
                      if (remainingMonths > 0) {
                        durationText += ` ${remainingMonths} เดือน`;
                      }
                    } else if (durationMonths > 0) {
                      durationText = `${durationMonths} เดือน`;
                      if (remainingDays > 0 && durationMonths < 3) {
                        durationText += ` ${remainingDays} วัน`;
                      }
                    } else {
                      durationText = `${durationDays} วัน`;
                    }
                    
                    return (
                      <div key={work.id} className="p-4 bg-soft rounded-xl border border-app">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-semibold text-app">{work.position}</p>
                            <p className="text-sm text-muted">{work.dept}</p>
                          </div>
                          <StatusTag variant={work.status === "Active" ? "success" : work.status === "Transferred" ? "warning" : "neutral"}>
                            {work.status === "Active" ? "กำลังทำงาน" : work.status === "Transferred" ? "โยกย้าย" : "เสร็จสิ้น"}
                          </StatusTag>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted mb-2">
                          <span>{startDate.toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" })}</span>
                          {work.endDate && (
                            <>
                              <span>ถึง</span>
                              <span>{endDate.toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" })}</span>
                            </>
                          )}
                          {!work.endDate && <span className="text-ptt-cyan">ถึงปัจจุบัน</span>}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-ptt-blue/20 text-ptt-cyan border border-ptt-blue/30">
                            อายุการทำงาน: {durationText}
                          </span>
                        </div>
                        {work.description && (
                          <p className="text-xs text-muted mt-2">{work.description}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </ModalForm>

          {/* Salary History Modal */}
          <ModalForm
            isOpen={showSalaryHistoryModal}
            onClose={() => setShowSalaryHistoryModal(false)}
            title="ประวัติการขึ้น-ลดเงินเดือนทั้งหมด"
            size="lg"
          >
            {(() => {
              const empSalaryHistory = salaryHistory.filter(s => s.empCode === employee.code)
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
              
              return (
                <div className="space-y-4">
                  {empSalaryHistory.map((salary) => (
                    <div key={salary.id} className="p-4 bg-soft rounded-xl border border-app">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`px-3 py-1 rounded-lg text-xs font-medium ${
                              salary.type === "ขึ้นเงินเดือน" 
                                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                                : salary.type === "ลดเงินเดือน"
                                ? "bg-red-500/20 text-red-400 border border-red-500/30"
                                : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                            }`}>
                              {salary.type}
                            </span>
                            <span className="text-sm text-muted">
                              {new Date(salary.date).toLocaleDateString("th-TH", { 
                                year: "numeric", 
                                month: "long", 
                                day: "numeric" 
                              })}
                            </span>
                          </div>
                          <p className="text-sm text-muted mb-2">{salary.reason}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted">เปลี่ยน</p>
                          <p className={`text-sm font-semibold ${
                            salary.changeAmount > 0 ? "text-green-400" : "text-red-400"
                          }`}>
                            {salary.changeAmount > 0 ? "+" : ""}{formatCurrency(salary.changeAmount)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="text-xs text-muted">เงินเดือนเดิม</p>
                          <p className="text-sm font-semibold text-app font-mono">{formatCurrency(salary.oldSalary)}</p>
                        </div>
                        <ArrowRightLeft className="w-4 h-4 text-muted" />
                        <div>
                          <p className="text-xs text-muted">เงินเดือนใหม่</p>
                          <p className="text-sm font-semibold text-ptt-cyan font-mono">{formatCurrency(salary.newSalary)}</p>
                        </div>
                      </div>
                      <div className="mt-3 p-3 bg-ptt-blue/10 border border-ptt-blue/30 rounded-lg">
                        <p className="text-xs text-muted mb-1">หมายเหตุ:</p>
                        <p className="text-sm text-app">{salary.note}</p>
                        <p className="text-xs text-muted mt-2">อนุมัติโดย: {salary.approvedBy}</p>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </ModalForm>

          {/* Reward & Penalty History Modal */}
          <ModalForm
            isOpen={showRewardPenaltyModal}
            onClose={() => setShowRewardPenaltyModal(false)}
            title="ประวัติทันบนและการลงโทษทั้งหมด"
            size="lg"
          >
            {(() => {
              const empRewardPenalty = rewardPenaltyHistory.filter(r => r.empCode === employee.code)
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
              
              return (
                <div className="space-y-4">
                  {empRewardPenalty.map((item) => (
                    <div key={item.id} className={`p-4 rounded-xl border ${
                      item.type === "ทันบน"
                        ? "bg-green-500/10 border-green-500/30"
                        : "bg-red-500/10 border-red-500/30"
                    }`}>
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            {item.type === "ทันบน" ? (
                              <Award className="w-4 h-4 text-green-400" />
                            ) : (
                              <AlertTriangle className="w-4 h-4 text-red-400" />
                            )}
                            <span className={`px-3 py-1 rounded-lg text-xs font-medium ${
                              item.type === "ทันบน"
                                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                                : "bg-red-500/20 text-red-400 border border-red-500/30"
                            }`}>
                              {item.category}
                            </span>
                            <span className="text-sm text-muted">
                              {new Date(item.date).toLocaleDateString("th-TH", { 
                                year: "numeric", 
                                month: "long", 
                                day: "numeric" 
                              })}
                            </span>
                          </div>
                          <p className="text-sm font-semibold text-app mb-1">{item.title}</p>
                          <p className="text-sm text-muted">{item.description}</p>
                        </div>
                        {item.amount && (
                          <div className="text-right">
                            <p className="text-xs text-muted">รางวัล</p>
                            <p className="text-sm font-semibold text-green-400 font-mono">{formatCurrency(item.amount)}</p>
                          </div>
                        )}
                      </div>
                      <div className="mt-3 p-3 bg-soft rounded-lg border border-app">
                        <p className="text-xs text-muted mb-1">หมายเหตุ:</p>
                        <p className="text-sm text-app">{item.note}</p>
                        <p className="text-xs text-muted mt-2">ออกโดย: {item.issuedBy}</p>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </ModalForm>

          {/* Position Transfer History Modal */}
          <ModalForm
            isOpen={showTransferHistoryModal}
            onClose={() => setShowTransferHistoryModal(false)}
            title="ประวัติการโยก-ย้ายตำแหน่งทั้งหมด"
            size="lg"
          >
            {(() => {
              const empTransfers = positionTransferHistory.filter(t => t.empCode === employee.code)
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
              
              return (
                <div className="space-y-4">
                  {empTransfers.map((transfer) => (
                    <div key={transfer.id} className="p-4 bg-soft rounded-xl border border-app">
                      <div className="flex items-center justify-between mb-3">
                        <span className={`px-3 py-1 rounded-lg text-xs font-medium ${
                          transfer.type === "เลื่อนตำแหน่ง"
                            ? "bg-green-500/20 text-green-400 border border-green-500/30"
                            : transfer.type === "ลดตำแหน่ง"
                            ? "bg-red-500/20 text-red-400 border border-red-500/30"
                            : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                        }`}>
                          {transfer.type}
                        </span>
                        <span className="text-sm text-muted">
                          {new Date(transfer.date).toLocaleDateString("th-TH", { 
                            year: "numeric", 
                            month: "long", 
                            day: "numeric" 
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mb-3">
                        <div className="flex-1 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                          <p className="text-xs text-muted mb-1">เดิม</p>
                          <p className="text-sm font-semibold text-app">{transfer.oldPosition}</p>
                          <p className="text-xs text-muted">{transfer.oldDept}</p>
                        </div>
                        <ArrowRightLeft className="w-5 h-5 text-muted flex-shrink-0" />
                        <div className="flex-1 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                          <p className="text-xs text-muted mb-1">ใหม่</p>
                          <p className="text-sm font-semibold text-ptt-cyan">{transfer.newPosition}</p>
                          <p className="text-xs text-muted">{transfer.newDept}</p>
                        </div>
                      </div>
                      <div className="mb-2">
                        <p className="text-sm text-muted mb-1">เหตุผล:</p>
                        <p className="text-sm text-app">{transfer.reason}</p>
                      </div>
                      <div className="mt-3 p-3 bg-ptt-blue/10 border border-ptt-blue/30 rounded-lg">
                        <p className="text-xs text-muted mb-1">หมายเหตุ:</p>
                        <p className="text-sm text-app">{transfer.note}</p>
                        <p className="text-xs text-muted mt-2">อนุมัติโดย: {transfer.approvedBy}</p>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </ModalForm>

          {activeTab === "attendance" && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-app font-display">
                    เวลาเข้าออก
                  </h3>
                  <p className="text-xs text-muted mt-1">
                    ตั้งแต่ {employee.startDate} (ระยะเวลา {workDuration} เดือน)
                  </p>
                </div>
                <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
                  {/* View Mode Selector - Button Group */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs text-muted flex items-center gap-1">
                      <Filter className="w-3 h-3" />
                      แสดงข้อมูลแบบ:
                    </label>
                    <div className="flex items-center gap-1 bg-soft p-1 rounded-lg border border-app">
                      <button
                        onClick={() => handleAttendanceViewModeChange("day")}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
                          attendanceViewMode === "day"
                            ? "bg-ptt-blue text-ptt-cyan shadow-lg shadow-ptt-blue/20"
                            : "text-muted hover:text-app hover:bg-app/10"
                        }`}
                        title="แสดงรายละเอียดแต่ละวัน"
                      >
                        <CalendarDays className="w-3.5 h-3.5" />
                        วัน
                      </button>
                      <button
                        onClick={() => handleAttendanceViewModeChange("month")}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
                          attendanceViewMode === "month"
                            ? "bg-ptt-blue text-ptt-cyan shadow-lg shadow-ptt-blue/20"
                            : "text-muted hover:text-app hover:bg-app/10"
                        }`}
                        title="จัดกลุ่มตามเดือน"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        เดือน
                      </button>
                      <button
                        onClick={() => handleAttendanceViewModeChange("year")}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
                          attendanceViewMode === "year"
                            ? "bg-ptt-blue text-ptt-cyan shadow-lg shadow-ptt-blue/20"
                            : "text-muted hover:text-app hover:bg-app/10"
                        }`}
                        title="จัดกลุ่มตามปี"
                      >
                        <CalendarRange className="w-3.5 h-3.5" />
                        ปี
                      </button>
                    </div>
                  </div>
                  
                  {/* Date Range Filters */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs text-muted flex items-center gap-1">
                      <CalendarRange className="w-3 h-3" />
                      กรองตามวันที่:
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="date"
                        value={attendanceDateFrom}
                        onChange={(e) => setAttendanceDateFrom(e.target.value)}
                        className="px-3 py-1.5 bg-soft border border-app rounded-lg text-sm text-app
                                 focus:outline-none focus:ring-2 focus:ring-ptt-blue focus:border-ptt-blue"
                        placeholder="จากวันที่"
                      />
                      <span className="text-muted text-sm">ถึง</span>
                      <input
                        type="date"
                        value={attendanceDateTo}
                        onChange={(e) => setAttendanceDateTo(e.target.value)}
                        className="px-3 py-1.5 bg-soft border border-app rounded-lg text-sm text-app
                                 focus:outline-none focus:ring-2 focus:ring-ptt-blue focus:border-ptt-blue"
                        placeholder="ถึงวันที่"
                      />
                      {(attendanceDateFrom || attendanceDateTo) && (
                        <button
                          onClick={() => {
                            setAttendanceDateFrom("");
                            setAttendanceDateTo("");
                          }}
                          className="px-3 py-1.5 text-xs bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors font-medium"
                          title="ล้างการกรอง"
                        >
                          ล้าง
                        </button>
                      )}
                    </div>
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
              </div>

              {/* Summary Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-soft rounded-xl border border-app">
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
                      <thead className="bg-soft border-b border-app">
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
                      <tbody className="divide-y divide-app">
                        {monthlySummary.map((month) => {
                          const monthRate = month.total > 0 
                            ? ((month.onTime / month.total) * 100).toFixed(1) 
                            : "0.0";
                          return (
                            <tr key={month.month} className="hover:bg-soft transition-colors">
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
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-md font-semibold text-app font-display flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    รายละเอียดการเข้างาน
                  </h4>
                  <div className="flex items-center gap-2">
                    {attendanceViewMode === "day" && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs bg-ptt-blue/20 text-ptt-cyan border border-ptt-blue/30">
                        <CalendarDays className="w-3 h-3" />
                        แสดงรายวัน
                      </span>
                    )}
                    {attendanceViewMode === "month" && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs bg-ptt-blue/20 text-ptt-cyan border border-ptt-blue/30">
                        <Calendar className="w-3 h-3" />
                        จัดกลุ่มตามเดือน
                      </span>
                    )}
                    {attendanceViewMode === "year" && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs bg-ptt-blue/20 text-ptt-cyan border border-ptt-blue/30">
                        <CalendarRange className="w-3 h-3" />
                        จัดกลุ่มตามปี
                      </span>
                    )}
                  </div>
                </div>
                {allAttendance.length > 0 ? (
                  <div className="space-y-4">
                    {groupedAttendance.map((group) => {
                      const groupOnTime = group.logs.filter(l => l.status === "ตรงเวลา").length;
                      const groupLate = group.logs.filter(l => l.status.includes("สาย")).length;
                      const groupAbsent = group.logs.filter(l => l.status === "ขาดงาน").length;
                      const groupLeave = group.logs.filter(l => l.status === "ลา").length;
                      const groupWorkingHours = group.logs
                        .filter(l => l.checkIn !== "-" && l.checkOut !== "-")
                        .reduce((sum, l) => sum + calculateWorkingHours(l.checkIn, l.checkOut), 0);
                      
                      return (
                        <div key={group.key} className="border border-app rounded-xl overflow-hidden">
                          {(attendanceViewMode === "month" || attendanceViewMode === "year") && (
                            <div className="px-4 py-3 bg-soft border-b border-app">
                              <div className="flex items-center justify-between">
                                <h5 className="text-sm font-semibold text-ptt-cyan">
                                  {group.label}
                                  <span className="text-xs text-muted font-normal ml-2">
                                    ({group.logs.length} วัน)
                                  </span>
                                </h5>
                                <div className="flex items-center gap-3 text-xs">
                                  <span className="text-green-400">ตรงเวลา: {groupOnTime}</span>
                                  <span className="text-yellow-400">สาย: {groupLate}</span>
                                  <span className="text-red-400">ขาด: {groupAbsent}</span>
                                  <span className="text-blue-400">ลา: {groupLeave}</span>
                                  {groupWorkingHours > 0 && (
                                    <span className="text-ptt-cyan">ชม.: {formatTime(groupWorkingHours)}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <thead className="bg-soft border-b border-app">
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
                              <tbody className="divide-y divide-app">
                                {group.logs.map((log) => {
                                  const hours = log.checkIn !== "-" && log.checkOut !== "-" 
                                    ? calculateWorkingHours(log.checkIn, log.checkOut) 
                                    : 0;
                                  const otHours = employeeShift && hours > shiftHours ? hours - shiftHours : 0;
                                  return (
                                    <tr key={log.id} className="hover:bg-soft transition-colors">
                                      <td className="px-4 py-3 text-sm text-app">
                                        {attendanceViewMode === "day" 
                                          ? new Date(log.date).toLocaleDateString("th-TH", { 
                                              year: "numeric", 
                                              month: "short", 
                                              day: "numeric",
                                              weekday: "short"
                                            })
                                          : log.date
                                        }
                                      </td>
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
                        </div>
                      );
                    })}
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

      {/* Salary Adjustment Modal */}
      <ModalForm
        isOpen={showSalaryAdjustModal}
        onClose={() => setShowSalaryAdjustModal(false)}
        title="ปรับเปลี่ยนเงินเดือน"
        size="md"
      >
        {employee && (() => {
          const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
            const { name, value } = e.target;
            if (name === "newSalary") {
              const newSalary = parseFloat(value) || 0;
              const changeAmount = newSalary - salaryFormData.oldSalary;
              setSalaryFormData({ ...salaryFormData, newSalary, changeAmount });
            } else if (name === "changeAmount") {
              const changeAmount = parseFloat(value) || 0;
              const newSalary = salaryFormData.oldSalary + changeAmount;
              setSalaryFormData({ ...salaryFormData, newSalary, changeAmount });
            } else {
              setSalaryFormData({ ...salaryFormData, [name]: value });
            }
          };

          const handleSubmit = (e: React.FormEvent) => {
            e.preventDefault();
            alert(`บันทึกการ${salaryFormData.type} สำหรับ ${employee.name} สำเร็จ! (Mock)`);
            setShowSalaryAdjustModal(false);
          };

          return (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-app mb-2">ประเภทการเปลี่ยนแปลง</label>
                  <select
                  name="type"
                  value={salaryFormData.type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-soft border border-app rounded-lg text-sm text-app
                           focus:outline-none focus:ring-2 focus:ring-ptt-blue focus:border-ptt-blue"
                >
                  <option value="ขึ้นเงินเดือน">ขึ้นเงินเดือน</option>
                  <option value="ลดเงินเดือน">ลดเงินเดือน</option>
                  <option value="ปรับเงินเดือน">ปรับเงินเดือน</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-app mb-2">เงินเดือนเดิม</label>
                  <input
                    type="number"
                    name="oldSalary"
                    value={salaryFormData.oldSalary}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-soft border border-app rounded-lg text-sm text-app font-mono
                             focus:outline-none focus:ring-2 focus:ring-ptt-blue focus:border-ptt-blue"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-app mb-2">เงินเดือนใหม่</label>
                  <input
                    type="number"
                    name="newSalary"
                    value={salaryFormData.newSalary}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-soft border border-app rounded-lg text-sm text-app font-mono
                             focus:outline-none focus:ring-2 focus:ring-ptt-blue focus:border-ptt-blue"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-app mb-2">จำนวนเงินที่เปลี่ยนแปลง</label>
                <input
                  type="number"
                  name="changeAmount"
                  value={salaryFormData.changeAmount}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 bg-soft border border-app rounded-lg text-sm font-mono
                             focus:outline-none focus:ring-2 focus:ring-ptt-blue focus:border-ptt-blue
                             ${salaryFormData.changeAmount > 0 ? 'text-green-400' : salaryFormData.changeAmount < 0 ? 'text-red-400' : 'text-app'}`}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-app mb-2">วันที่เปลี่ยนแปลง</label>
                <input
                  type="date"
                  name="date"
                  value={salaryFormData.date}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-soft border border-app rounded-lg text-sm text-app
                           focus:outline-none focus:ring-2 focus:ring-ptt-blue focus:border-ptt-blue"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-app mb-2">เหตุผล</label>
                <textarea
                  name="reason"
                  value={salaryFormData.reason}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 bg-soft border border-app rounded-lg text-sm text-app
                           focus:outline-none focus:ring-2 focus:ring-ptt-blue focus:border-ptt-blue"
                  placeholder="ระบุเหตุผลในการเปลี่ยนแปลงเงินเดือน"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-app mb-2">หมายเหตุ</label>
                <textarea
                  name="note"
                  value={salaryFormData.note}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-3 py-2 bg-soft border border-app rounded-lg text-sm text-app
                           focus:outline-none focus:ring-2 focus:ring-ptt-blue focus:border-ptt-blue"
                  placeholder="หมายเหตุเพิ่มเติม (ถ้ามี)"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-app">
                <button
                  type="button"
                  onClick={() => setShowSalaryAdjustModal(false)}
                  className="px-4 py-2 text-sm text-muted hover:text-app transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-ptt-blue hover:bg-ptt-blue/80 text-ptt-cyan rounded-lg transition-colors font-medium"
                >
                  บันทึก
                </button>
              </div>
            </form>
          );
        })()}
      </ModalForm>

      {/* Reward & Penalty Management Modal */}
      <ModalForm
        isOpen={showRewardPenaltyManageModal}
        onClose={() => setShowRewardPenaltyManageModal(false)}
        title="จัดการทันบนและการลงโทษ"
        size="md"
      >
        {employee && (() => {
          const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
            setRewardPenaltyFormData({ ...rewardPenaltyFormData, [e.target.name]: e.target.value });
          };

          const handleSubmit = (e: React.FormEvent) => {
            e.preventDefault();
            alert(`บันทึก${rewardPenaltyFormData.type} สำหรับ ${employee.name} สำเร็จ! (Mock)`);
            setShowRewardPenaltyManageModal(false);
          };

          return (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-app mb-2">ประเภท</label>
                <select
                  name="type"
                  value={rewardPenaltyFormData.type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-soft border border-app rounded-lg text-sm text-app
                           focus:outline-none focus:ring-2 focus:ring-ptt-blue focus:border-ptt-blue"
                >
                  <option value="ทันบน">ทันบน</option>
                  <option value="การลงโทษ">การลงโทษ</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-app mb-2">หมวดหมู่</label>
                <input
                  type="text"
                  name="category"
                  value={rewardPenaltyFormData.category}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-soft border border-app rounded-lg text-sm text-app
                           focus:outline-none focus:ring-2 focus:ring-ptt-blue focus:border-ptt-blue"
                  placeholder="เช่น การทำงานดีเด่น, การมาสาย, การขาดงาน"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-app mb-2">หัวข้อ</label>
                <input
                  type="text"
                  name="title"
                  value={rewardPenaltyFormData.title}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-soft border border-app rounded-lg text-sm text-app
                           focus:outline-none focus:ring-2 focus:ring-ptt-blue focus:border-ptt-blue"
                  placeholder="ระบุหัวข้อ"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-app mb-2">รายละเอียด</label>
                <textarea
                  name="description"
                  value={rewardPenaltyFormData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 bg-soft border border-app rounded-lg text-sm text-app
                           focus:outline-none focus:ring-2 focus:ring-ptt-blue focus:border-ptt-blue"
                  placeholder="ระบุรายละเอียด"
                  required
                />
              </div>

              {rewardPenaltyFormData.type === "ทันบน" && (
                <div>
                  <label className="block text-sm font-medium text-app mb-2">จำนวนเงินรางวัล (บาท)</label>
                  <input
                    type="number"
                    name="amount"
                    value={rewardPenaltyFormData.amount}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-soft border border-app rounded-lg text-sm text-app font-mono
                             focus:outline-none focus:ring-2 focus:ring-ptt-blue focus:border-ptt-blue"
                    placeholder="0"
                    min="0"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-app mb-2">วันที่</label>
                <input
                  type="date"
                  name="date"
                  value={rewardPenaltyFormData.date}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-soft border border-app rounded-lg text-sm text-app
                           focus:outline-none focus:ring-2 focus:ring-ptt-blue focus:border-ptt-blue"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-app mb-2">หมายเหตุ</label>
                <textarea
                  name="note"
                  value={rewardPenaltyFormData.note}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-3 py-2 bg-soft border border-app rounded-lg text-sm text-app
                           focus:outline-none focus:ring-2 focus:ring-ptt-blue focus:border-ptt-blue"
                  placeholder="หมายเหตุเพิ่มเติม (ถ้ามี)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-app mb-2">ออกโดย</label>
                <input
                  type="text"
                  name="issuedBy"
                  value={rewardPenaltyFormData.issuedBy}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-soft border border-app rounded-lg text-sm text-app
                           focus:outline-none focus:ring-2 focus:ring-ptt-blue focus:border-ptt-blue"
                  placeholder="ชื่อผู้ออกทันบน/การลงโทษ"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-app">
                <button
                  type="button"
                  onClick={() => setShowRewardPenaltyManageModal(false)}
                  className="px-4 py-2 text-sm text-muted hover:text-app transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-ptt-blue hover:bg-ptt-blue/80 text-ptt-cyan rounded-lg transition-colors font-medium"
                >
                  บันทึก
                </button>
              </div>
            </form>
          );
        })()}
      </ModalForm>

      {/* Position Transfer Modal */}
      <ModalForm
        isOpen={showTransferPositionModal}
        onClose={() => setShowTransferPositionModal(false)}
        title="โยกย้ายตำแหน่ง"
        size="md"
      >
        {employee && (() => {
          const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
            setTransferFormData({ ...transferFormData, [e.target.name]: e.target.value });
          };

          const handleSubmit = (e: React.FormEvent) => {
            e.preventDefault();
            alert(`บันทึกการ${transferFormData.type} สำหรับ ${employee.name} สำเร็จ! (Mock)`);
            setShowTransferPositionModal(false);
          };

          return (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-app mb-2">ประเภทการเปลี่ยนแปลง</label>
                <select
                  name="type"
                  value={transferFormData.type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-soft border border-app rounded-lg text-sm text-app
                           focus:outline-none focus:ring-2 focus:ring-ptt-blue focus:border-ptt-blue"
                >
                  <option value="โยกย้าย">โยกย้าย</option>
                  <option value="เลื่อนตำแหน่ง">เลื่อนตำแหน่ง</option>
                  <option value="ลดตำแหน่ง">ลดตำแหน่ง</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-app mb-2">ตำแหน่งเดิม</label>
                  <input
                    type="text"
                    name="oldPosition"
                    value={transferFormData.oldPosition}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-soft border border-app rounded-lg text-sm text-app
                             focus:outline-none focus:ring-2 focus:ring-ptt-blue focus:border-ptt-blue"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-app mb-2">แผนกเดิม</label>
                  <input
                    type="text"
                    name="oldDept"
                    value={transferFormData.oldDept}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-soft border border-app rounded-lg text-sm text-app
                             focus:outline-none focus:ring-2 focus:ring-ptt-blue focus:border-ptt-blue"
                    readOnly
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-app mb-2">ตำแหน่งใหม่</label>
                  <input
                    type="text"
                    name="newPosition"
                    value={transferFormData.newPosition}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-soft border border-app rounded-lg text-sm text-app
                             focus:outline-none focus:ring-2 focus:ring-ptt-blue focus:border-ptt-blue"
                    placeholder="ระบุตำแหน่งใหม่"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-app mb-2">แผนกใหม่</label>
                  <input
                    type="text"
                    name="newDept"
                    value={transferFormData.newDept}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-soft border border-app rounded-lg text-sm text-app
                             focus:outline-none focus:ring-2 focus:ring-ptt-blue focus:border-ptt-blue"
                    placeholder="ระบุแผนกใหม่"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-app mb-2">วันที่เปลี่ยนแปลง</label>
                <input
                  type="date"
                  name="date"
                  value={transferFormData.date}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-soft border border-app rounded-lg text-sm text-app
                           focus:outline-none focus:ring-2 focus:ring-ptt-blue focus:border-ptt-blue"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-app mb-2">เหตุผล</label>
                <textarea
                  name="reason"
                  value={transferFormData.reason}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 bg-soft border border-app rounded-lg text-sm text-app
                           focus:outline-none focus:ring-2 focus:ring-ptt-blue focus:border-ptt-blue"
                  placeholder="ระบุเหตุผลในการโยกย้าย/เลื่อน/ลดตำแหน่ง"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-app mb-2">หมายเหตุ</label>
                <textarea
                  name="note"
                  value={transferFormData.note}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-3 py-2 bg-soft border border-app rounded-lg text-sm text-app
                           focus:outline-none focus:ring-2 focus:ring-ptt-blue focus:border-ptt-blue"
                  placeholder="หมายเหตุเพิ่มเติม (ถ้ามี)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-app mb-2">อนุมัติโดย</label>
                <input
                  type="text"
                  name="approvedBy"
                  value={transferFormData.approvedBy}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-soft border border-app rounded-lg text-sm text-app
                           focus:outline-none focus:ring-2 focus:ring-ptt-blue focus:border-ptt-blue"
                  placeholder="ชื่อผู้อนุมัติ"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-app">
                <button
                  type="button"
                  onClick={() => setShowTransferPositionModal(false)}
                  className="px-4 py-2 text-sm text-muted hover:text-app transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-ptt-blue hover:bg-ptt-blue/80 text-ptt-cyan rounded-lg transition-colors font-medium"
                >
                  บันทึก
                </button>
              </div>
            </form>
          );
        })()}
      </ModalForm>
    </div>
  );
}

