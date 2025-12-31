import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { UserPlus, Calendar, CheckCircle, Clock, X, View, FileText, Download, Upload, UserCheck, AlertCircle, Printer } from "lucide-react";
import ModalForm from "@/components/ModalForm";
import StatusTag, { getStatusVariant } from "@/components/StatusTag";
import { leaves as initialLeaves, attendanceLogs as initialAttendanceLogs, employees as initialEmployees, shifts, type Leave, type AttendanceLog } from "@/data/mockData";
import { useBranch } from "@/contexts/BranchContext";

export default function Leaves() {
  const { selectedBranches } = useBranch();

  // Filter core data based on branch
  const employees = useMemo(() =>
    initialEmployees.filter(emp => selectedBranches.includes(String(emp.branchId))),
    [selectedBranches]
  );

  const empCodes = useMemo(() => new Set(employees.map(e => e.code)), [employees]);

  const currentBranchLeaves = useMemo(() =>
    initialLeaves.filter(leave => empCodes.has(leave.empCode)),
    [empCodes]
  );

  const currentBranchLogs = useMemo(() =>
    initialAttendanceLogs.filter(log => empCodes.has(log.empCode)),
    [empCodes]
  );

  const [leaves, setLeaves] = useState<Leave[]>(currentBranchLeaves);
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceLog[]>(currentBranchLogs);

  // Update local state when branch changes
  useEffect(() => {
    setLeaves(currentBranchLeaves);
    setAttendanceLogs(currentBranchLogs);
  }, [currentBranchLeaves, currentBranchLogs]);

  const [filteredLeaves, setFilteredLeaves] = useState<Leave[]>(leaves);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [shiftFilter, setShiftFilter] = useState<number | "">("");

  // Modal states
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState<Leave | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Form states for record leave
  const [recordForm, setRecordForm] = useState({
    empCode: "",
    empName: "",
    type: "" as Leave["type"] | "",
    fromDate: "",
    toDate: "",
    reason: "",
    isPartialLeave: false,
    fromTime: "",
    toTime: "",
    replacementEmpCode: "",
    replacementEmpName: "",
    attachments: [] as Array<{ id: string; fileName: string; fileUrl: string; fileSize: number; uploadedAt: string }>,
    createdBy: "manager" as "employee" | "manager" | "hr"
  });

  // Form states for edit leave
  const [editForm, setEditForm] = useState<{
    id: number | null;
    empCode: string;
    empName: string;
    type: Leave["type"];
    fromDate: string;
    toDate: string;
    reason: string;
  }>({
    id: null,
    empCode: "",
    empName: "",
    type: "ลาพักร้อน",
    fromDate: "",
    toDate: "",
    reason: ""
  });

  const handleFilter = () => {
    // Show all leaves including "รออนุมัติ"
    let filtered = leaves;

    if (searchQuery) {
      filtered = filtered.filter(
        (leave) =>
          leave.empName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          leave.empCode.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (typeFilter) {
      filtered = filtered.filter((leave) => leave.type === typeFilter);
    }

    if (statusFilter) {
      filtered = filtered.filter((leave) => leave.status === statusFilter);
    }

    if (categoryFilter) {
      filtered = filtered.filter((leave) => {
        const employee = employees.find(e => e.code === leave.empCode);
        return employee?.category === categoryFilter;
      });
    }

    if (deptFilter) {
      filtered = filtered.filter((leave) => {
        const employee = employees.find(e => e.code === leave.empCode);
        return employee?.dept === deptFilter;
      });
    }

    if (shiftFilter !== "") {
      filtered = filtered.filter((leave) => {
        const employee = employees.find(e => e.code === leave.empCode);
        return employee?.shiftId === shiftFilter;
      });
    }

    // Sort by fromDate (most recent first) and limit to 10
    filtered = filtered
      .sort((a, b) => new Date(b.fromDate).getTime() - new Date(a.fromDate).getTime())
      .slice(0, 10);

    setFilteredLeaves(filtered);
  };

  useEffect(() => {
    handleFilter();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leaves, searchQuery, typeFilter, statusFilter, categoryFilter, deptFilter, shiftFilter]);

  const types = Array.from(new Set(leaves.map((l) => l.type)));
  // Include all statuses
  const statuses = Array.from(new Set(leaves.map((l) => l.status)));

  // Get employees in same department for replacement
  const getEmployeesInSameDept = (empCode: string) => {
    const employee = employees.find(e => e.code === empCode);
    if (!employee) return [];
    return employees.filter(e =>
      e.code !== empCode &&
      e.dept === employee.dept &&
      e.status === "Active"
    );
  };

  // Calculate statistics
  const totalLeaves = leaves.length;
  const approvedLeaves = leaves.filter(l => l.status === "อนุมัติแล้ว");
  const pendingManager = leaves.filter(l => l.status === "รอผู้จัดการ");
  const pendingHR = leaves.filter(l => l.status === "รอ HR");
  const pendingAdmin = leaves.filter(l => l.status === "รอหัวหน้าสถานี");
  const totalLeaveDays = leaves.reduce((sum, l) => sum + l.days, 0);
  const approvedDays = approvedLeaves.reduce((sum, l) => sum + l.days, 0);

  // Check if leave is current (today is between fromDate and toDate)
  const isLeaveCurrent = (leave: Leave): boolean => {
    const today = new Date();
    const from = new Date(leave.fromDate);
    const to = new Date(leave.toDate);
    return from <= today && to >= today;
  };

  // Check if leave is upcoming (fromDate is in the future)
  const isLeaveUpcoming = (leave: Leave): boolean => {
    const today = new Date();
    const from = new Date(leave.fromDate);
    return from > today;
  };

  // Get current and upcoming leaves
  const currentLeaves = leaves.filter(l => isLeaveCurrent(l));
  const upcomingLeaves = leaves.filter(l => isLeaveUpcoming(l));

  // Calculate days between dates
  const calculateDays = (fromDate: string, toDate: string): number => {
    const from = new Date(fromDate);
    const to = new Date(toDate);
    const diffTime = Math.abs(to.getTime() - from.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1; // Include both start and end date
  };

  // Generate dates between fromDate and toDate
  const generateDateRange = (fromDate: string, toDate: string): string[] => {
    const dates: string[] = [];
    const from = new Date(fromDate);
    const to = new Date(toDate);
    const current = new Date(from);

    while (current <= to) {
      dates.push(current.toISOString().split('T')[0]);
      current.setDate(current.getDate() + 1);
    }

    return dates;
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const fileId = `file-${Date.now()}-${Math.random()}`;
      const newAttachment = {
        id: fileId,
        fileName: file.name,
        fileUrl: URL.createObjectURL(file), // Mock URL
        fileSize: file.size,
        uploadedAt: new Date().toISOString()
      };
      setRecordForm({
        ...recordForm,
        attachments: [...recordForm.attachments, newAttachment]
      });
    });
  };

  // Handle remove attachment
  const handleRemoveAttachment = (fileId: string) => {
    setRecordForm({
      ...recordForm,
      attachments: recordForm.attachments.filter(a => a.id !== fileId)
    });
  };

  // Handle record leave for employee (Manager/HR records)
  const handleRecordLeave = () => {
    if (!recordForm.empCode || !recordForm.type || !recordForm.fromDate || !recordForm.toDate) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    if (recordForm.isPartialLeave && (!recordForm.fromTime || !recordForm.toTime)) {
      alert("กรุณากรอกเวลาเริ่มและเวลาสิ้นสุดสำหรับการลาระหว่างวัน");
      return;
    }

    const days = recordForm.isPartialLeave ? 0.5 : calculateDays(recordForm.fromDate, recordForm.toDate);

    const newLeave: Leave = {
      id: Math.max(...leaves.map(l => l.id), 0) + 1,
      empCode: recordForm.empCode,
      empName: recordForm.empName,
      type: recordForm.type as Leave["type"],
      fromDate: recordForm.fromDate,
      toDate: recordForm.toDate,
      days: days,
      status: recordForm.createdBy === "hr" ? "รอหัวหน้าสถานี" : "รอผู้จัดการ",
      reason: recordForm.reason || "",
      isPartialLeave: recordForm.isPartialLeave,
      fromTime: recordForm.fromTime || undefined,
      toTime: recordForm.toTime || undefined,
      replacementEmpCode: recordForm.replacementEmpCode || undefined,
      replacementEmpName: recordForm.replacementEmpName || undefined,
      attachments: recordForm.attachments.length > 0 ? recordForm.attachments : undefined,
      submittedDate: new Date().toISOString().split('T')[0],
      createdBy: recordForm.createdBy
    };

    setLeaves([...leaves, newLeave]);

    // Update attendance logs
    const dates = generateDateRange(recordForm.fromDate, recordForm.toDate);
    const updatedLogs = [...attendanceLogs];

    dates.forEach((date) => {
      const existingLog = updatedLogs.find(
        (log) => log.empCode === recordForm.empCode && log.date === date
      );

      if (existingLog) {
        existingLog.status = "ลา";
        existingLog.checkIn = "-";
        existingLog.checkOut = "-";
      } else {
        const newLog: AttendanceLog = {
          id: Math.max(...updatedLogs.map(l => l.id), 0) + 1,
          empCode: recordForm.empCode,
          empName: recordForm.empName,
          date: date,
          checkIn: "-",
          checkOut: "-",
          status: "ลา"
        };
        updatedLogs.push(newLog);
      }
    });

    setAttendanceLogs(updatedLogs);

    // Reset form
    setRecordForm({
      empCode: "",
      empName: "",
      type: "" as Leave["type"] | "",
      fromDate: "",
      toDate: "",
      reason: "",
      isPartialLeave: false,
      fromTime: "",
      toTime: "",
      replacementEmpCode: "",
      replacementEmpName: "",
      attachments: [],
      createdBy: "manager"
    });
    setIsRecordModalOpen(false);

    // Show success message
    alert(`บันทึกการลาสำเร็จ! บันทึกการลา ${days} ${recordForm.isPartialLeave ? 'ชั่วโมง' : 'วัน'} สำหรับ ${recordForm.empName}`);
  };

  // Handle employee selection for record leave
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


  // Handle update leave
  const handleUpdateLeave = () => {
    if (!editForm.id || !editForm.toDate) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    const newDays = calculateDays(editForm.fromDate, editForm.toDate);

    // Update leave
    const updatedLeaves = leaves.map(leave => {
      if (leave.id === editForm.id) {
        return {
          ...leave,
          toDate: editForm.toDate,
          days: newDays,
          reason: editForm.reason || leave.reason
        };
      }
      return leave;
    });

    setLeaves(updatedLeaves);

    // Update attendance logs - remove "ลา" status for dates after new toDate
    const oldLeave = leaves.find(l => l.id === editForm.id);
    if (oldLeave) {
      const oldDates = generateDateRange(oldLeave.fromDate, oldLeave.toDate);
      const newDates = generateDateRange(editForm.fromDate, editForm.toDate);
      const datesToRemove = oldDates.filter(date => !newDates.includes(date));

      const updatedLogs = attendanceLogs.map(log => {
        if (log.empCode === editForm.empCode && datesToRemove.includes(log.date) && log.status === "ลา") {
          // Remove leave status for dates that are no longer in leave period
          return {
            ...log,
            status: "ขาดงาน" as AttendanceLog["status"],
            checkIn: "-",
            checkOut: "-"
          };
        }
        return log;
      });

      setAttendanceLogs(updatedLogs);
    }

    // Reset form and close modal
    setEditForm({
      id: null,
      empCode: "",
      empName: "",
      type: "ลาพักร้อน",
      fromDate: "",
      toDate: "",
      reason: ""
    });
    setIsEditModalOpen(false);

    // Show success message
    alert(`แก้ไขการลาสำเร็จ! วันที่สิ้นสุดเปลี่ยนเป็น ${editForm.toDate} (${newDays} วัน)`);
  };

  // Handle approve leave by manager
  const handleManagerApprove = (leave: Leave) => {
    const comment = prompt("ความคิดเห็น (ถ้ามี):");
    const updatedLeaves = leaves.map(l => {
      if (l.id === leave.id) {
        return {
          ...l,
          status: "รอ HR" as Leave["status"],
          managerApprovedDate: new Date().toISOString().split('T')[0],
          managerComment: comment || undefined
        };
      }
      return l;
    });
    setLeaves(updatedLeaves);
    alert(`อนุมัติการลาแล้ว ส่งต่อให้ HR`);
  };

  // Handle approve leave by HR
  const handleHRApprove = (leave: Leave) => {
    const comment = prompt("ความคิดเห็น (ถ้ามี):");
    const updatedLeaves = leaves.map(l => {
      if (l.id === leave.id) {
        return {
          ...l,
          status: "รอหัวหน้าสถานี" as Leave["status"],
          hrApprovedDate: new Date().toISOString().split('T')[0],
          hrComment: comment || undefined
        };
      }
      return l;
    });
    setLeaves(updatedLeaves);
    alert(`อนุมัติการลาแล้ว ส่งต่อให้หัวหน้าสถานี`);
  };

  // Handle approve leave by admin
  const handleAdminApprove = (leave: Leave) => {
    if (!confirm(`คุณต้องการอนุมัติการลาของ ${leave.empName} (${leave.days} ${leave.isPartialLeave ? 'ชั่วโมง' : 'วัน'}) หรือไม่?`)) {
      return;
    }

    const comment = prompt("ความคิดเห็น (ถ้ามี):");
    const updatedLeaves = leaves.map(l => {
      if (l.id === leave.id) {
        return {
          ...l,
          status: "อนุมัติแล้ว" as Leave["status"],
          adminApprovedDate: new Date().toISOString().split('T')[0],
          adminComment: comment || undefined
        };
      }
      return l;
    });

    setLeaves(updatedLeaves);

    // Update attendance logs
    const dates = generateDateRange(leave.fromDate, leave.toDate);
    const updatedLogs = [...attendanceLogs];

    dates.forEach((date) => {
      const existingLog = updatedLogs.find(
        (log) => log.empCode === leave.empCode && log.date === date
      );

      if (existingLog) {
        existingLog.status = "ลา";
        existingLog.checkIn = "-";
        existingLog.checkOut = "-";
      } else {
        const newLog: AttendanceLog = {
          id: Math.max(...updatedLogs.map(l => l.id), 0) + 1,
          empCode: leave.empCode,
          empName: leave.empName,
          date: date,
          checkIn: "-",
          checkOut: "-",
          status: "ลา"
        };
        updatedLogs.push(newLog);
      }
    });

    setAttendanceLogs(updatedLogs);
    alert(`อนุมัติการลาสำเร็จ! ${leave.empName} ลา ${leave.days} วัน`);
  };

  // Handle reject leave
  const handleRejectLeave = (leave: Leave, rejectedBy: "manager" | "hr" | "admin") => {
    if (!confirm(`คุณต้องการปฏิเสธการลาของ ${leave.empName} (${leave.days} ${leave.isPartialLeave ? 'ชั่วโมง' : 'วัน'}) หรือไม่?`)) {
      return;
    }

    const comment = prompt("ระบุเหตุผลการปฏิเสธ:");
    const updatedLeaves = leaves.map(l => {
      if (l.id === leave.id) {
        return {
          ...l,
          status: "ไม่อนุมัติ" as Leave["status"],
          [`${rejectedBy}Comment`]: comment || undefined
        };
      }
      return l;
    });

    setLeaves(updatedLeaves);
    alert(`ปฏิเสธการลาสำเร็จ! ${leave.empName}`);
  };

  // Handle print leave form
  const handlePrintLeave = (leave: Leave) => {
    setSelectedLeave(leave);
    setIsPrintModalOpen(true);

    // Update printed info
    const updatedLeaves = leaves.map(l => {
      if (l.id === leave.id) {
        return {
          ...l,
          printedBy: "HR",
          printedDate: new Date().toISOString().split('T')[0]
        };
      }
      return l;
    });
    setLeaves(updatedLeaves);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-app mb-2 font-display">
            การลา
          </h1>
          <p className="text-muted font-light">
            รายการพนักงานที่ลาทั้งหมด 10 คนล่าสุด
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setIsRecordModalOpen(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-ptt-cyan hover:bg-ptt-cyan/80 
                     text-app rounded-xl transition-all duration-200 font-semibold 
                     shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            <UserPlus className="w-5 h-5" />
            บันทึกการลาแทนพนักงาน
          </button>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-soft border border-app rounded-xl p-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-ptt-cyan/20 rounded-lg">
              <Calendar className="w-5 h-5 text-ptt-cyan" />
            </div>
            <div>
              <p className="text-xs text-muted">การลาทั้งหมด</p>
              <p className="text-lg font-bold text-app">{totalLeaves} รายการ</p>
              <p className="text-xs text-muted mt-1">{totalLeaveDays} วัน</p>
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
            <div className="p-2 bg-green-500/20 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-xs text-muted">อนุมัติแล้ว</p>
              <p className="text-lg font-bold text-green-400">{approvedLeaves.length} รายการ</p>
              <p className="text-xs text-muted mt-1">{approvedDays} วัน</p>
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
              <p className="text-xs text-muted">กำลังลา / กำลังจะลา</p>
              <p className="text-lg font-bold text-blue-400">
                {currentLeaves.length} / {upcomingLeaves.length}
              </p>
              <p className="text-xs text-muted mt-1">
                {currentLeaves.reduce((sum, l) => sum + l.days, 0)} วัน / {upcomingLeaves.reduce((sum, l) => sum + l.days, 0)} วัน
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
            <div className="p-2 bg-yellow-500/20 rounded-lg">
              <AlertCircle className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-xs text-muted">รออนุมัติ</p>
              <p className="text-lg font-bold text-yellow-400">
                {pendingManager.length} / {pendingHR.length} / {pendingAdmin.length}
              </p>
              <p className="text-xs text-muted mt-1">
                ผู้จัดการ / HR / หัวหน้าสถานี
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-soft border border-app rounded-2xl overflow-hidden shadow-xl"
      >
        <div className="px-6 py-4 border-b border-app bg-soft">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
              <h3 className="text-lg font-semibold text-app font-display">
                รายการพนักงานที่ลา
              </h3>
              <p className="text-xs text-muted mt-1">
                แสดงรายการพนักงานที่ลาทั้งหมด {filteredLeaves.length} รายการ
              </p>
            </div>
          </div>

          {/* Filter Bar - Inline with table */}
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="ค้นหาชื่อหรือรหัสพนักงาน..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  handleFilter();
                }}
                className="w-full pl-10 pr-4 py-2.5 bg-soft border border-app rounded-xl
                         text-app placeholder:text-muted
                         focus:outline-none focus:ring-2 focus:ring-ptt-blue focus:border-transparent
                         transition-all font-light"
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

            {/* Filter Dropdowns */}
            <div className="flex flex-wrap gap-3">
              <select
                value={deptFilter}
                onChange={(e) => {
                  setDeptFilter(e.target.value);
                  handleFilter();
                }}
                className="px-4 py-2.5 bg-soft border border-app rounded-xl
                         text-app text-sm min-w-[150px]
                         focus:outline-none focus:ring-2 focus:ring-ptt-blue focus:border-transparent
                         transition-all cursor-pointer hover:border-app/50"
              >
                <option value="">ทุกแผนก</option>
                {Array.from(new Set(employees.map(e => e.dept))).map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>

              <select
                value={shiftFilter === "" ? "" : String(shiftFilter)}
                onChange={(e) => {
                  setShiftFilter(e.target.value === "" ? "" : Number(e.target.value));
                  handleFilter();
                }}
                className="px-4 py-2.5 bg-soft border border-app rounded-xl
                         text-app text-sm min-w-[150px]
                         focus:outline-none focus:ring-2 focus:ring-ptt-blue focus:border-transparent
                         transition-all cursor-pointer hover:border-app/50"
              >
                <option value="">ทุกกะ</option>
                {shifts.map((shift) => (
                  <option key={shift.id} value={String(shift.id)}>
                    {shift.shiftType ? `กะ${shift.shiftType}` : ""} {shift.name} {shift.description ? `(${shift.description})` : ""}
                  </option>
                ))}
              </select>

              <select
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value);
                  handleFilter();
                }}
                className="px-4 py-2.5 bg-soft border border-app rounded-xl
                         text-app text-sm min-w-[150px]
                         focus:outline-none focus:ring-2 focus:ring-ptt-blue focus:border-transparent
                         transition-all cursor-pointer hover:border-app/50"
              >
                <option value="">ทุกประเภท</option>
                {types.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  handleFilter();
                }}
                className="px-4 py-2.5 bg-soft border border-app rounded-xl
                         text-app text-sm min-w-[150px]
                         focus:outline-none focus:ring-2 focus:ring-ptt-blue focus:border-transparent
                         transition-all cursor-pointer hover:border-app/50"
              >
                <option value="">ทุกสถานะ</option>
                {statuses.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>

              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  handleFilter();
                }}
                className="px-4 py-2.5 bg-soft border border-app rounded-xl
                         text-app text-sm min-w-[150px]
                         focus:outline-none focus:ring-2 focus:ring-ptt-blue focus:border-transparent
                         transition-all cursor-pointer hover:border-app/50"
              >
                <option value="">ทุกหมวดหมู่</option>
                {Array.from(new Set(employees.map(e => e.category).filter(Boolean))).map((c) => (
                  <option key={c} value={c || ""}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-soft border-b border-app">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-app">
                  รหัส
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-app">
                  ชื่อ-นามสกุล
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-app">
                  ประเภท
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-app">
                  วันที่เริ่ม
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-app">
                  วันที่สิ้นสุด
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-app">
                  จำนวนวัน
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-app">
                  เหตุผล
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-app">
                  สถานะ
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-app">
                  การจัดการ
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-app">
                  พิมพ์ใบลา
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-app">
              {filteredLeaves.map((leave, index) => (
                <motion.tr
                  key={leave.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-soft transition-colors"
                >
                  <td className="px-6 py-4 text-sm text-ptt-cyan font-medium">
                    {leave.empCode}
                  </td>
                  <td className="px-6 py-4 text-sm text-app font-medium">
                    {leave.empName}
                  </td>
                  <td className="px-6 py-4 text-sm text-app font-light">
                    {leave.type}
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-app font-light">
                    {leave.fromDate}
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-app font-light">
                    {leave.toDate}
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-app font-semibold">
                    {leave.days} วัน
                  </td>
                  <td className="px-6 py-4 text-sm text-muted max-w-xs">
                    <div className="truncate" title={leave.reason || "-"}>
                      {leave.reason || "-"}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <StatusTag variant={getStatusVariant(leave.status)}>
                        {leave.status}
                      </StatusTag>
                      {isLeaveCurrent(leave) && (
                        <span className="text-xs text-blue-400">● กำลังลา</span>
                      )}
                      {isLeaveUpcoming(leave) && (
                        <span className="text-xs text-yellow-400">● กำลังจะลา</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      {leave.status === "รอผู้จัดการ" ? (
                        <>
                          <button
                            onClick={() => handleManagerApprove(leave)}
                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 
                                     text-emerald-400 rounded-lg transition-all duration-200 text-xs font-medium
                                     border border-emerald-500/30"
                            title="อนุมัติ (ส่งต่อ HR)"
                          >
                            <CheckCircle className="w-3 h-3" />
                            อนุมัติ
                          </button>
                          <button
                            onClick={() => handleRejectLeave(leave, "manager")}
                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 
                                     text-red-400 rounded-lg transition-all duration-200 text-xs font-medium
                                     border border-red-500/30"
                            title="ปฏิเสธ"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </>
                      ) : leave.status === "รอ HR" ? (
                        <>
                          <button
                            onClick={() => handleHRApprove(leave)}
                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 
                                     text-emerald-400 rounded-lg transition-all duration-200 text-xs font-medium
                                     border border-emerald-500/30"
                            title="อนุมัติ (ส่งต่อหัวหน้าสถานี)"
                          >
                            <CheckCircle className="w-3 h-3" />
                            อนุมัติ
                          </button>
                          <button
                            onClick={() => handleRejectLeave(leave, "hr")}
                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 
                                     text-red-400 rounded-lg transition-all duration-200 text-xs font-medium
                                     border border-red-500/30"
                            title="ปฏิเสธ"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </>
                      ) : leave.status === "รอหัวหน้าสถานี" ? (
                        <>
                          <button
                            onClick={() => handleAdminApprove(leave)}
                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 
                                     text-emerald-400 rounded-lg transition-all duration-200 text-xs font-medium
                                     border border-emerald-500/30"
                            title="อนุมัติ"
                          >
                            <CheckCircle className="w-3 h-3" />
                            อนุมัติ
                          </button>
                          <button
                            onClick={() => handleRejectLeave(leave, "admin")}
                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 
                                     text-red-400 rounded-lg transition-all duration-200 text-xs font-medium
                                     border border-red-500/30"
                            title="ปฏิเสธ"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedLeave(leave);
                            setIsDetailModalOpen(true);
                          }}
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-ptt-blue/20 hover:bg-ptt-blue/30 
                                   text-ptt-cyan rounded-lg transition-all duration-200 text-xs font-medium
                                   border border-ptt-blue/30"
                          title="ดูรายละเอียด"
                        >
                          <View className="w-3 h-3" />
                          ดู
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {leave.status === "อนุมัติแล้ว" ? (
                      <button
                        onClick={() => handlePrintLeave(leave)}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 
                                 text-blue-400 rounded-lg transition-all duration-200 text-xs font-medium
                                 border border-blue-500/30"
                        title="พิมพ์ใบลา"
                      >
                        <Printer className="w-3 h-3" />
                        พิมพ์
                      </button>
                    ) : (
                      <span className="text-xs text-muted">-</span>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>

          {filteredLeaves.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted font-light">ไม่พบข้อมูล</p>
            </div>
          )}

          {filteredLeaves.length > 0 && (
            <div className="text-center py-4 border-t border-app bg-soft">
              <p className="text-xs text-muted">
                แสดง {filteredLeaves.length} คนจากทั้งหมด {leaves.length} คน
                {filteredLeaves.length >= 10 && " (จำกัด 10 คนแรก)"}
              </p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Edit Leave Modal */}
      <ModalForm
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="ตรวจสอบ"
        onSubmit={handleUpdateLeave}
        submitLabel="บันทึก"
      >
        <div className="space-y-4">
          <div className="p-3 bg-soft rounded-lg border border-app">
            <p className="text-sm text-muted mb-1">พนักงาน</p>
            <p className="text-app font-semibold">{editForm.empName}</p>
            <p className="text-xs text-ptt-cyan">{editForm.empCode}</p>
          </div>

          <div>
            <label htmlFor="edit-type" className="block text-sm font-medium text-app mb-2">
              ประเภทการลา
            </label>
            <input
              id="edit-type"
              type="text"
              value={editForm.type}
              disabled
              className="w-full px-4 py-2.5 bg-soft border border-app rounded-xl
                       text-muted cursor-not-allowed"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="edit-fromDate" className="block text-sm font-medium text-app mb-2">
                วันที่เริ่ม
              </label>
              <input
                id="edit-fromDate"
                type="date"
                value={editForm.fromDate}
                disabled
                className="w-full px-4 py-2.5 bg-soft border border-app rounded-xl
                         text-muted cursor-not-allowed"
              />
            </div>
            <div>
              <label htmlFor="edit-toDate" className="block text-sm font-medium text-app mb-2">
                วันที่สิ้นสุด <span className="text-red-400">*</span>
                <span className="text-xs text-yellow-400 ml-2">(แก้ไขได้)</span>
              </label>
              <input
                id="edit-toDate"
                type="date"
                value={editForm.toDate}
                onChange={(e) => setEditForm({ ...editForm, toDate: e.target.value })}
                min={editForm.fromDate}
                className="w-full px-4 py-2.5 bg-soft border border-app rounded-xl
                         text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="edit-reason" className="block text-sm font-medium text-app mb-2">
              เหตุผลการลา
            </label>
            <textarea
              id="edit-reason"
              rows={4}
              value={editForm.reason}
              onChange={(e) => setEditForm({ ...editForm, reason: e.target.value })}
              placeholder="ระบุเหตุผล (ถ้ามี)..."
              className="w-full px-4 py-2.5 bg-soft border border-app rounded-xl
                       text-app placeholder:text-muted
                       focus:outline-none focus:ring-2 focus:ring-ptt-blue resize-none"
            />
          </div>

          {editForm.fromDate && editForm.toDate && (
            <div className="p-3 bg-ptt-blue/10 border border-ptt-blue/30 rounded-lg">
              <p className="text-sm text-ptt-cyan">
                จำนวนวันลาใหม่: <span className="font-semibold">{calculateDays(editForm.fromDate, editForm.toDate)} วัน</span>
              </p>
              {editForm.id && (() => {
                const oldLeave = leaves.find(l => l.id === editForm.id);
                if (oldLeave) {
                  const oldDays = oldLeave.days;
                  const newDays = calculateDays(editForm.fromDate, editForm.toDate);
                  const diff = oldDays - newDays;
                  if (diff > 0) {
                    return (
                      <p className="text-xs text-green-400 mt-1">
                        ลดลง {diff} วัน (จาก {oldDays} วัน เป็น {newDays} วัน)
                      </p>
                    );
                  }
                }
                return null;
              })()}
            </div>
          )}

          <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <p className="text-xs text-yellow-400">
              ⚠️ การแก้ไขนี้จะอัปเดตวันที่สิ้นสุดการลาและจำนวนวันลาให้ตรงกับวันที่ที่พนักงานกลับมาทำงานจริง
            </p>
          </div>
        </div>
      </ModalForm>

      {/* Record Leave Modal (Manager/HR records) */}
      <ModalForm
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
        title="บันทึกการลาแทนพนักงาน"
        onSubmit={handleRecordLeave}
        submitLabel="บันทึก"
      >
        <div className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="record-emp" className="block text-sm font-semibold text-app mb-1.5">
              เลือกพนักงาน <span className="text-red-400">*</span>
            </label>
            <select
              id="record-emp"
              value={recordForm.empCode}
              onChange={(e) => handleEmployeeSelect(e.target.value)}
              className="w-full px-4 py-3 bg-soft border border-app rounded-xl
                       text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue focus:border-ptt-blue/50
                       transition-all duration-200 hover:border-app/50 cursor-pointer"
              required
            >
              <option value="">เลือกพนักงาน</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.code}>
                  {emp.code} - {emp.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="record-type" className="block text-sm font-semibold text-app mb-1.5">
              ประเภทการลา <span className="text-red-400">*</span>
            </label>
            <select
              id="record-type"
              value={recordForm.type}
              onChange={(e) => setRecordForm({ ...recordForm, type: e.target.value as Leave["type"] | "" })}
              className="w-full px-4 py-3 bg-soft border border-app rounded-xl
                       text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue focus:border-ptt-blue/50
                       transition-all duration-200 hover:border-app/50 cursor-pointer"
              required
            >
              <option value="">เลือกประเภท</option>
              <option value="ลาพักร้อน">ลาพักร้อน</option>
              <option value="ลาป่วย">ลาป่วย</option>
              <option value="ลากิจ">ลากิจ</option>
              <option value="ลาคลอด">ลาคลอด</option>
              <option value="ลางานศพ">ลางานศพ (3-7 วัน)</option>
            </select>
          </div>

          {/* Partial Leave Checkbox */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isPartialLeave"
              checked={recordForm.isPartialLeave}
              onChange={(e) => setRecordForm({ ...recordForm, isPartialLeave: e.target.checked })}
              className="w-4 h-4 rounded border-app text-ptt-cyan focus:ring-ptt-blue"
            />
            <label htmlFor="isPartialLeave" className="text-sm text-app cursor-pointer">
              ลาระหว่างวัน (ไม่ใช่ทั้งวัน)
            </label>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-2">
              <label htmlFor="record-fromDate" className="block text-sm font-semibold text-app mb-1.5">
                วันที่เริ่ม <span className="text-red-400">*</span>
              </label>
              <input
                id="record-fromDate"
                type="date"
                value={recordForm.fromDate}
                onChange={(e) => setRecordForm({ ...recordForm, fromDate: e.target.value })}
                className="w-full px-4 py-3 bg-soft border border-app rounded-xl
                         text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue focus:border-ptt-blue/50
                         transition-all duration-200 hover:border-app/50 cursor-pointer"
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="record-toDate" className="block text-sm font-semibold text-app mb-1.5">
                วันที่สิ้นสุด <span className="text-red-400">*</span>
              </label>
              <input
                id="record-toDate"
                type="date"
                value={recordForm.toDate}
                onChange={(e) => setRecordForm({ ...recordForm, toDate: e.target.value })}
                min={recordForm.fromDate}
                className="w-full px-4 py-3 bg-soft border border-app rounded-xl
                         text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue focus:border-ptt-blue/50
                         transition-all duration-200 hover:border-app/50 cursor-pointer"
                required
              />
            </div>
          </div>

          {/* Partial Leave Time */}
          {recordForm.isPartialLeave && (
            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-2">
                <label htmlFor="record-fromTime" className="block text-sm font-semibold text-app mb-1.5">
                  เวลาเริ่ม <span className="text-red-400">*</span>
                </label>
                <input
                  id="record-fromTime"
                  type="time"
                  value={recordForm.fromTime}
                  onChange={(e) => setRecordForm({ ...recordForm, fromTime: e.target.value })}
                  className="w-full px-4 py-3 bg-soft border border-app rounded-xl
                           text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue focus:border-ptt-blue/50
                           transition-all duration-200 hover:border-app/50 cursor-pointer"
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="record-toTime" className="block text-sm font-semibold text-app mb-1.5">
                  เวลาสิ้นสุด <span className="text-red-400">*</span>
                </label>
                <input
                  id="record-toTime"
                  type="time"
                  value={recordForm.toTime}
                  onChange={(e) => setRecordForm({ ...recordForm, toTime: e.target.value })}
                  className="w-full px-4 py-3 bg-soft border border-app rounded-xl
                           text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue focus:border-ptt-blue/50
                           transition-all duration-200 hover:border-app/50 cursor-pointer"
                  required
                />
              </div>
            </div>
          )}

          {/* Replacement Employee */}
          {recordForm.empCode && (
            <div className="space-y-2">
              <label htmlFor="record-replacement" className="block text-sm font-semibold text-app mb-1.5">
                <UserCheck className="w-4 h-4 inline mr-1" />
                คนมาทำงานแทน <span className="text-red-400">*</span>
              </label>
              <select
                id="record-replacement"
                value={recordForm.replacementEmpCode}
                onChange={(e) => {
                  const emp = employees.find(em => em.code === e.target.value);
                  setRecordForm({
                    ...recordForm,
                    replacementEmpCode: e.target.value,
                    replacementEmpName: emp?.name || ""
                  });
                }}
                className="w-full px-4 py-3 bg-soft border border-app rounded-xl
                         text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue focus:border-ptt-blue/50
                         transition-all duration-200 hover:border-app/50 cursor-pointer"
                required
              >
                <option value="">เลือกพนักงานที่มาทำงานแทน (ในแผนกเดียวกัน)</option>
                {getEmployeesInSameDept(recordForm.empCode).map((emp) => (
                  <option key={emp.id} value={emp.code}>
                    {emp.code} - {emp.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted">ต้องมีคนมาทำงานแทนในแผนกของตัวเอง</p>
            </div>
          )}

          {/* File Upload */}
          <div className="space-y-2">
            <label htmlFor="record-files" className="block text-sm font-semibold text-app mb-1.5">
              <Upload className="w-4 h-4 inline mr-1" />
              แนบเอกสาร (ถ้ามี)
            </label>
            <input
              id="record-files"
              type="file"
              multiple
              onChange={handleFileUpload}
              className="w-full px-4 py-3 bg-soft border border-app rounded-xl
                       text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue focus:border-ptt-blue/50
                       transition-all duration-200 hover:border-app/50 cursor-pointer"
            />
            {recordForm.attachments.length > 0 && (
              <div className="mt-2 space-y-2">
                {recordForm.attachments.map((file) => (
                  <div key={file.id} className="flex items-center justify-between p-2 bg-soft/50 border border-app rounded-lg">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-ptt-cyan" />
                      <span className="text-sm text-app">{file.fileName}</span>
                      <span className="text-xs text-muted">({(file.fileSize / 1024).toFixed(2)} KB)</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveAttachment(file.id)}
                      className="text-red-400 hover:text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <p className="text-xs text-muted">พนักงานต้องแนบเอกสารที่ตนเองลา (เช่น ใบรับรองแพทย์, เอกสารอื่นๆ)</p>
          </div>

          <div className="space-y-2">
            <label htmlFor="record-reason" className="block text-sm font-semibold text-app mb-1.5">
              เหตุผลการลา
            </label>
            <textarea
              id="record-reason"
              rows={4}
              value={recordForm.reason}
              onChange={(e) => setRecordForm({ ...recordForm, reason: e.target.value })}
              placeholder="ระบุเหตุผล (ถ้ามี)..."
              className="w-full px-4 py-3 bg-soft border border-app rounded-xl
                       text-app placeholder:text-muted
                       focus:outline-none focus:ring-2 focus:ring-ptt-blue focus:border-ptt-blue/50
                       transition-all duration-200 hover:border-app/50 resize-none"
            />
          </div>

          {recordForm.fromDate && recordForm.toDate && (
            <div className="p-4 bg-gradient-to-r from-ptt-blue/10 via-ptt-cyan/10 to-ptt-blue/10 
                          border border-ptt-blue/30 rounded-xl shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-ptt-blue/20 rounded-lg">
                  <svg className="w-5 h-5 text-ptt-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-app mb-1">จำนวน{recordForm.isPartialLeave ? 'ชั่วโมง' : 'วัน'}ลา</p>
                  <p className="text-xs text-muted">
                    รวมทั้งหมด <span className="text-ptt-cyan font-bold text-base">
                      {recordForm.isPartialLeave ? '0.5' : calculateDays(recordForm.fromDate, recordForm.toDate)}
                    </span> {recordForm.isPartialLeave ? 'ชั่วโมง' : 'วัน'}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <p className="text-xs text-yellow-400">
              ⚠️ <strong>หมายเหตุ:</strong> กรณีลาเกินกำหนด มีผลต่อการประเมินเงินเดือนและการทดลองงาน
            </p>
          </div>
        </div>
      </ModalForm>

      {/* Detail Modal */}
      {isDetailModalOpen && selectedLeave && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-soft border border-app rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 px-6 py-4 border-b border-app bg-soft flex items-center justify-between">
              <h3 className="text-xl font-bold text-app">รายละเอียดการลา</h3>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="text-muted hover:text-app"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Employee Info */}
              <div className="bg-soft/50 border border-app rounded-xl p-4">
                <h4 className="font-semibold text-app mb-3">ข้อมูลพนักงาน</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted mb-1">รหัสพนักงาน</p>
                    <p className="text-sm font-medium text-app">{selectedLeave.empCode}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted mb-1">ชื่อ-สกุล</p>
                    <p className="text-sm font-medium text-app">{selectedLeave.empName}</p>
                  </div>
                </div>
              </div>

              {/* Leave Info */}
              <div className="bg-soft/50 border border-app rounded-xl p-4">
                <h4 className="font-semibold text-app mb-3">ข้อมูลการลา</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted mb-1">ประเภทการลา</p>
                    <p className="text-sm font-medium text-app">{selectedLeave.type}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted mb-1">จำนวน{selectedLeave.isPartialLeave ? 'ชั่วโมง' : 'วัน'}</p>
                    <p className="text-sm font-medium text-app">
                      {selectedLeave.days} {selectedLeave.isPartialLeave ? 'ชั่วโมง' : 'วัน'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted mb-1">วันที่เริ่ม</p>
                    <p className="text-sm font-medium text-app">{selectedLeave.fromDate}</p>
                    {selectedLeave.fromTime && (
                      <p className="text-xs text-muted">เวลา: {selectedLeave.fromTime}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-muted mb-1">วันที่สิ้นสุด</p>
                    <p className="text-sm font-medium text-app">{selectedLeave.toDate}</p>
                    {selectedLeave.toTime && (
                      <p className="text-xs text-muted">เวลา: {selectedLeave.toTime}</p>
                    )}
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-muted mb-1">เหตุผล</p>
                    <p className="text-sm text-app">{selectedLeave.reason || "-"}</p>
                  </div>
                </div>
              </div>

              {/* Replacement Employee */}
              {selectedLeave.replacementEmpCode && (
                <div className="bg-soft/50 border border-app rounded-xl p-4">
                  <h4 className="font-semibold text-app mb-3 flex items-center gap-2">
                    <UserCheck className="w-4 h-4" />
                    คนมาทำงานแทน
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted mb-1">รหัสพนักงาน</p>
                      <p className="text-sm font-medium text-app">{selectedLeave.replacementEmpCode}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted mb-1">ชื่อ-สกุล</p>
                      <p className="text-sm font-medium text-app">{selectedLeave.replacementEmpName}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Attachments */}
              {selectedLeave.attachments && selectedLeave.attachments.length > 0 && (
                <div className="bg-soft/50 border border-app rounded-xl p-4">
                  <h4 className="font-semibold text-app mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    เอกสารแนบ
                  </h4>
                  <div className="space-y-2">
                    {selectedLeave.attachments.map((file) => (
                      <div key={file.id} className="flex items-center justify-between p-2 bg-soft border border-app rounded-lg">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-ptt-cyan" />
                          <span className="text-sm text-app">{file.fileName}</span>
                          <span className="text-xs text-muted">({(file.fileSize / 1024).toFixed(2)} KB)</span>
                        </div>
                        <button
                          onClick={() => window.open(file.fileUrl, '_blank')}
                          className="text-ptt-cyan hover:text-ptt-blue"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Workflow Status */}
              <div className="bg-soft/50 border border-app rounded-xl p-4">
                <h4 className="font-semibold text-app mb-3">สถานะการอนุมัติ</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-app">ผู้จัดการแผนก</span>
                    {selectedLeave.managerApprovedDate ? (
                      <span className="text-xs text-green-400">✓ อนุมัติแล้ว ({selectedLeave.managerApprovedDate})</span>
                    ) : selectedLeave.status === "รอผู้จัดการ" ? (
                      <span className="text-xs text-yellow-400">⏳ รออนุมัติ</span>
                    ) : (
                      <span className="text-xs text-muted">-</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-app">HR</span>
                    {selectedLeave.hrApprovedDate ? (
                      <span className="text-xs text-green-400">✓ อนุมัติแล้ว ({selectedLeave.hrApprovedDate})</span>
                    ) : selectedLeave.status === "รอ HR" ? (
                      <span className="text-xs text-yellow-400">⏳ รออนุมัติ</span>
                    ) : (
                      <span className="text-xs text-muted">-</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-app">หัวหน้าสถานี</span>
                    {selectedLeave.adminApprovedDate ? (
                      <span className="text-xs text-green-400">✓ อนุมัติแล้ว ({selectedLeave.adminApprovedDate})</span>
                    ) : selectedLeave.status === "รอหัวหน้าสถานี" ? (
                      <span className="text-xs text-yellow-400">⏳ รออนุมัติ</span>
                    ) : (
                      <span className="text-xs text-muted">-</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Comments */}
              {(selectedLeave.managerComment || selectedLeave.hrComment || selectedLeave.adminComment) && (
                <div className="bg-soft/50 border border-app rounded-xl p-4">
                  <h4 className="font-semibold text-app mb-3">ความคิดเห็น</h4>
                  <div className="space-y-2">
                    {selectedLeave.managerComment && (
                      <div>
                        <p className="text-xs text-muted mb-1">ผู้จัดการ:</p>
                        <p className="text-sm text-app">{selectedLeave.managerComment}</p>
                      </div>
                    )}
                    {selectedLeave.hrComment && (
                      <div>
                        <p className="text-xs text-muted mb-1">HR:</p>
                        <p className="text-sm text-app">{selectedLeave.hrComment}</p>
                      </div>
                    )}
                    {selectedLeave.adminComment && (
                      <div>
                        <p className="text-xs text-muted mb-1">หัวหน้าสถานี:</p>
                        <p className="text-sm text-app">{selectedLeave.adminComment}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="sticky bottom-0 px-6 py-4 border-t border-app bg-soft flex justify-end gap-2">
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="px-4 py-2 bg-soft border border-app hover:bg-soft/80 text-app rounded-lg"
              >
                ปิด
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Print Leave Form Modal */}
      {isPrintModalOpen && selectedLeave && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-soft border border-app rounded-2xl shadow-2xl max-w-2xl w-full"
          >
            <div className="sticky top-0 px-6 py-4 border-b border-app bg-soft flex items-center justify-between">
              <h3 className="text-xl font-bold text-app flex items-center gap-2">
                <Printer className="w-5 h-5" />
                พิมพ์ใบลา
              </h3>
              <button
                onClick={() => setIsPrintModalOpen(false)}
                className="text-muted hover:text-app"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              <div className="bg-white border-2 border-gray-300 rounded-lg p-8 space-y-6" id="leave-form-print">
                <div className="text-center">
                  <h2 className="text-2xl font-bold mb-4">ใบลา</h2>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-semibold">รหัสพนักงาน:</p>
                      <p className="text-sm">{selectedLeave.empCode}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold">ชื่อ-สกุล:</p>
                      <p className="text-sm">{selectedLeave.empName}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-semibold">ประเภทการลา:</p>
                    <p className="text-sm">{selectedLeave.type}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-semibold">วันที่เริ่ม:</p>
                      <p className="text-sm">{selectedLeave.fromDate} {selectedLeave.fromTime && `เวลา ${selectedLeave.fromTime}`}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold">วันที่สิ้นสุด:</p>
                      <p className="text-sm">{selectedLeave.toDate} {selectedLeave.toTime && `เวลา ${selectedLeave.toTime}`}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-semibold">จำนวน{selectedLeave.isPartialLeave ? 'ชั่วโมง' : 'วัน'}:</p>
                    <p className="text-sm">{selectedLeave.days} {selectedLeave.isPartialLeave ? 'ชั่วโมง' : 'วัน'}</p>
                  </div>
                  {selectedLeave.replacementEmpName && (
                    <div>
                      <p className="text-sm font-semibold">คนมาทำงานแทน:</p>
                      <p className="text-sm">{selectedLeave.replacementEmpName} ({selectedLeave.replacementEmpCode})</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold">เหตุผล:</p>
                    <p className="text-sm">{selectedLeave.reason || "-"}</p>
                  </div>
                  <div className="mt-8 pt-4 border-t border-gray-300">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-sm font-semibold mb-8">ผู้ยื่นลา</p>
                        <p className="text-sm">({selectedLeave.empName})</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold mb-8">ผู้จัดการแผนก</p>
                        <p className="text-sm">(ลงนาม)</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold mb-8">หัวหน้าสถานี</p>
                        <p className="text-sm">(ลงนาม)</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <button
                  onClick={() => setIsPrintModalOpen(false)}
                  className="px-4 py-2 bg-soft border border-app hover:bg-soft/80 text-app rounded-lg"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={() => {
                    window.print();
                  }}
                  className="px-6 py-2 bg-ptt-cyan hover:bg-ptt-cyan/80 text-app rounded-lg font-semibold"
                >
                  <Printer className="w-4 h-4 inline mr-2" />
                  พิมพ์
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
}

