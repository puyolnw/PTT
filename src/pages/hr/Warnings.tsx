import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Search, Download, Eye, Edit2, Trash2, User, CheckCircle, AlertCircle, XCircle, Plus } from "lucide-react";
import { warningRecords, employees, shifts, type WarningRecord } from "@/data/mockData";

export default function Warnings() {
  const [warnings, setWarnings] = useState<WarningRecord[]>(warningRecords);
  const [filteredWarnings, setFilteredWarnings] = useState<WarningRecord[]>(warnings);
  const [searchQuery, setSearchQuery] = useState("");
  const [warningTypeFilter, setWarningTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [shiftFilter, setShiftFilter] = useState<number | "">("");
  const [selectedWarning, setSelectedWarning] = useState<WarningRecord | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    reason: "",
    description: "",
    status: "" as WarningRecord["status"] | "",
  });
  const [addForm, setAddForm] = useState({
    empCode: "",
    warningType: "" as WarningRecord["warningType"] | "",
    reason: "",
    eventType: "",
    description: "",
    date: new Date().toISOString().split('T')[0],
    issuedBy: "",
    status: "ระหว่างดำเนินการ" as WarningRecord["status"],
    notes: "",
  });

  // Warning type colors and labels
  const warningTypeInfo: Record<WarningRecord["warningType"], { label: string; color: string; bgColor: string; borderColor: string }> = {
    "พูดคุย": {
      label: "พูดคุย (ไม่เป็นลายลักษณ์อักษร)",
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
      borderColor: "border-yellow-500/30"
    },
    "เอกสาร": {
      label: "เอกสาร (เป็นลายลักษณ์อักษร)",
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
      borderColor: "border-orange-500/30"
    },
    "พักงาน": {
      label: "พักงาน (ร้ายแรง)",
      color: "text-red-500",
      bgColor: "bg-red-500/10",
      borderColor: "border-red-500/30"
    },
    "ไล่ออก": {
      label: "ไล่ออกจากงาน (ร้ายแรงที่สุด)",
      color: "text-red-700",
      bgColor: "bg-red-700/10",
      borderColor: "border-red-700/30"
    }
  };

  const statusInfo: Record<WarningRecord["status"], { icon: typeof AlertCircle; color: string; bgColor: string }> = {
    "ระหว่างดำเนินการ": {
      icon: AlertCircle,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/20"
    },
    "เสร็จสิ้น": {
      icon: CheckCircle,
      color: "text-green-500",
      bgColor: "bg-green-500/20"
    },
    "ยกเลิก": {
      icon: XCircle,
      color: "text-gray-500",
      bgColor: "bg-gray-500/20"
    }
  };

  // Get employee info by code
  const getEmployeeInfo = (empCode: string) => {
    return employees.find(e => e.code === empCode);
  };

  // Check if warning is cleared (1 year passed)
  const isWarningCleared = (warning: WarningRecord): boolean => {
    if (warning.isCleared || warning.clearedDate) return true;
    
    const warningDate = new Date(warning.date);
    const oneYearLater = new Date(warningDate);
    oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
    
    return new Date() > oneYearLater;
  };

  // Get active warnings (not cleared within 1 year)
  const getActiveWarnings = (empCode: string, warningType: WarningRecord["warningType"]): WarningRecord[] => {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    
    return warnings.filter(w => 
      w.empCode === empCode && 
      w.warningType === warningType &&
      !w.isCleared &&
      !isWarningCleared(w) &&
      new Date(w.date) >= oneYearAgo
    );
  };

  // Calculate warning level based on employee's warning history (only count active warnings within 1 year)
  const calculateWarningLevel = (empCode: string, warningType: WarningRecord["warningType"]): number => {
    const activeWarnings = getActiveWarnings(empCode, warningType);
    
    if (warningType === "พูดคุย") {
      // สำหรับ "พูดคุย" นับเฉพาะประเภทเดียวกัน (สูงสุด 3 ครั้ง)
      return Math.min(activeWarnings.length + 1, 3);
    } else if (warningType === "เอกสาร") {
      // สำหรับ "เอกสาร" นับเฉพาะประเภทเดียวกัน (สูงสุด 3 ครั้ง)
      return Math.min(activeWarnings.length + 1, 3);
    } else if (warningType === "พักงาน") {
      // สำหรับ "พักงาน" เริ่มที่ระดับ 3
      return 3;
    } else if (warningType === "ไล่ออก") {
      // สำหรับ "ไล่ออก" เริ่มที่ระดับ 4
      return 4;
    }
    
    return 1;
  };

  // Handle clear warnings (ล้างทัณฑ์บน 1 ปี)
  const handleClearWarnings = (empCode: string) => {
    if (!confirm(`คุณต้องการล้างทัณฑ์บนให้พนักงาน ${employees.find(e => e.code === empCode)?.name || empCode} หรือไม่?\n\nการล้างทัณฑ์บนจะเริ่มนับใหม่จาก 1 ปี`)) {
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const updatedWarnings = warnings.map(w => 
      w.empCode === empCode && !w.isCleared && !isWarningCleared(w)
        ? { ...w, isCleared: true, clearedDate: today }
        : w
    );
    
    setWarnings(updatedWarnings);
    setFilteredWarnings(updatedWarnings);
    alert("ล้างทัณฑ์บนสำเร็จ! เริ่มนับใหม่จาก 1 ปี");
  };

  // Handle filter
  const handleFilter = () => {
    let filtered = warnings;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (warning) =>
          warning.empName.toLowerCase().includes(query) ||
          warning.empCode.toLowerCase().includes(query) ||
          warning.reason.toLowerCase().includes(query)
      );
    }

    if (warningTypeFilter) {
      filtered = filtered.filter((warning) => warning.warningType === warningTypeFilter);
    }

    if (statusFilter) {
      filtered = filtered.filter((warning) => warning.status === statusFilter);
    }

    if (deptFilter) {
      filtered = filtered.filter((warning) => {
        const employee = getEmployeeInfo(warning.empCode);
        return employee?.dept === deptFilter;
      });
    }

    if (shiftFilter !== "") {
      filtered = filtered.filter((warning) => {
        const employee = getEmployeeInfo(warning.empCode);
        return employee?.shiftId === shiftFilter;
      });
    }

    setFilteredWarnings(filtered);
  };

  // Update filter when any filter changes
  useEffect(() => {
    handleFilter();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [warnings, searchQuery, warningTypeFilter, statusFilter, deptFilter, shiftFilter]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = warnings.length;
    const byType = {
      "พูดคุย": warnings.filter(w => w.warningType === "พูดคุย").length,
      "เอกสาร": warnings.filter(w => w.warningType === "เอกสาร").length,
      "พักงาน": warnings.filter(w => w.warningType === "พักงาน").length,
      "ไล่ออก": warnings.filter(w => w.warningType === "ไล่ออก").length,
    };
    const ongoing = warnings.filter(w => w.status === "ระหว่างดำเนินการ").length;
    const completed = warnings.filter(w => w.status === "เสร็จสิ้น").length;
    const cancelled = warnings.filter(w => w.status === "ยกเลิก").length;

    // Employees with warnings
    const employeesWithWarnings = new Set(warnings.map(w => w.empCode)).size;
    
    // Employees with multiple warnings (3 or more - high risk)
    const highRiskEmployees = warnings.reduce((acc, warning) => {
      acc[warning.empCode] = (acc[warning.empCode] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const multipleWarningCount = Object.values(highRiskEmployees).filter(count => count >= 3).length;

    return {
      total,
      byType,
      ongoing,
      completed,
      cancelled,
      employeesWithWarnings,
      multipleWarningCount
    };
  }, [warnings]);

  // Handle edit
  const handleEdit = (warning: WarningRecord) => {
    setSelectedWarning(warning);
    setEditForm({
      reason: warning.reason,
      description: warning.description,
      status: warning.status
    });
    setIsEditModalOpen(true);
  };

  // Handle save edit
  const handleSaveEdit = () => {
    if (!selectedWarning) return;

    const updatedWarnings = warnings.map((warning) =>
      warning.id === selectedWarning.id
        ? {
            ...warning,
            reason: editForm.reason,
            description: editForm.description,
            status: editForm.status as WarningRecord["status"] || warning.status
          }
        : warning
    );

    setWarnings(updatedWarnings);
    setFilteredWarnings(updatedWarnings);
    setIsEditModalOpen(false);
    setSelectedWarning(null);
    setEditForm({
      reason: "",
      description: "",
      status: "" as WarningRecord["status"] | ""
    });
  };

  // Handle delete
  const handleDelete = (id: number) => {
    if (window.confirm("คุณแน่ใจหรือว่าต้องการลบการเตือนนี้?")) {
      const updatedWarnings = warnings.filter(w => w.id !== id);
      setWarnings(updatedWarnings);
      setFilteredWarnings(updatedWarnings);
    }
  };

  // Handle add new warning
  const handleAddWarning = () => {
    if (!addForm.empCode || !addForm.warningType || !addForm.reason || !addForm.description) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    const employee = getEmployeeInfo(addForm.empCode);
    if (!employee) {
      alert("ไม่พบข้อมูลพนักงาน");
      return;
    }

    const warningLevel = calculateWarningLevel(addForm.empCode, addForm.warningType);
    const newId = Math.max(...warnings.map(w => w.id), 0) + 1;

    const newWarning: WarningRecord = {
      id: newId,
      empCode: addForm.empCode,
      empName: employee.name,
      empCategory: employee.category || employee.dept,
      warningType: addForm.warningType,
      warningLevel: warningLevel,
      reason: addForm.reason,
      eventType: addForm.eventType || undefined,
      description: addForm.description,
      date: addForm.date,
      issuedBy: addForm.issuedBy || "หัวหน้าแผนก",
      status: addForm.status,
      notes: addForm.notes || undefined,
      isCleared: false,
    };

    const updatedWarnings = [...warnings, newWarning];
    setWarnings(updatedWarnings);
    setFilteredWarnings(updatedWarnings);
    setIsAddModalOpen(false);
    
    // Reset form
    setAddForm({
      empCode: "",
      warningType: "" as WarningRecord["warningType"] | "",
      reason: "",
      eventType: "",
      description: "",
      date: new Date().toISOString().split('T')[0],
      issuedBy: "",
      status: "ระหว่างดำเนินการ" as WarningRecord["status"],
      notes: "",
    });
  };

  // Export report
  const handleExportReport = () => {
    let csv = `"ลำดับ","รหัสพนักงาน","ชื่อ-สกุล","แผนก","ประเภทการเตือน","ระดับ","เหตุผล","วันที่","สถานะ"\n`;

    filteredWarnings.forEach((warning, idx) => {
      csv += `${idx + 1},"${warning.empCode}","${warning.empName}","${warning.empCategory}","${warning.warningType}",${warning.warningLevel},"${warning.reason}","${warning.date}","${warning.status}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `รายงานทันบน_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-app mb-2 font-display flex items-center gap-2">
            <AlertTriangle className="w-8 h-8 text-red-500" />
            ทันบน (การเตือนพนักงาน)
          </h1>
          <p className="text-muted font-light">
            บันทึกการเตือนพนักงานจากนายจ้าง ตามระดับความรุนแรง
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 
                     text-white rounded-xl transition-all duration-200 font-semibold 
                     shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            <Plus className="w-5 h-5" />
            ทันปน (เพิ่มการเตือน)
          </button>
          <button
            onClick={handleExportReport}
            className="inline-flex items-center gap-2 px-6 py-3 bg-ptt-cyan hover:bg-ptt-cyan/80 
                     text-app rounded-xl transition-all duration-200 font-semibold 
                     shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            <Download className="w-5 h-5" />
            Export Report
          </button>
        </div>
      </div>

      {/* Warning System Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-soft border border-app rounded-xl p-4"
      >
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h3 className="font-semibold text-app mb-2">ระบบการเตือนพนักงาน (ทันบน)</h3>
            <p className="text-sm text-muted mb-3">
              ประกอบด้วย 4 ระดับตามลำดับความรุนแรง:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { level: 1, type: "พูดคุย", desc: "ไม่เป็นลายลักษณ์อักษร", limit: "สูงสุด 3 ครั้ง", color: "yellow" },
                { level: 2, type: "เอกสาร", desc: "เป็นลายลักษณ์อักษร", limit: "สูงสุด 3 ครั้ง", color: "orange" },
                { level: 3, type: "พักงาน", desc: "กรณีร้ายแรง", limit: "ไม่มีขีดจำกัด", color: "red" },
                { level: 4, type: "ไล่ออก", desc: "กรณีร้ายแรงที่สุด", limit: "ไม่มีขีดจำกัด", color: "red" }
              ].map((item) => (
                <div key={item.level} className={`bg-soft/50 border border-app rounded-lg p-3 ${
                  item.color === "red" ? "border-red-500/30" : ""
                }`}>
                  <div className="text-xs text-muted mb-1">ระดับ {item.level}</div>
                  <div className="font-semibold text-app text-sm mb-1">{item.type}</div>
                  <div className="text-xs text-muted mb-1">{item.desc}</div>
                  <div className="text-xs font-semibold text-ptt-cyan">{item.limit}</div>
                </div>
              ))}
            </div>
            <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <p className="text-xs text-app">
                <strong>ระบบล้างทัณฑ์บน:</strong> ทัณฑ์บนจะถูกล้างอัตโนมัติเมื่อครบ 1 ปีนับจากวันที่ออกการเตือน 
                และเริ่มนับใหม่ (เฉพาะ "พูดคุย" และ "เอกสาร" จะนับใหม่ได้)
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-soft border border-app rounded-xl p-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/20 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p className="text-xs text-muted">ทั้งหมด</p>
              <p className="text-2xl font-bold text-app">{stats.total}</p>
              <p className="text-xs text-muted mt-1">รายการเตือน</p>
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
              <AlertCircle className="w-5 h-5 text-yellow-500" />
            </div>
            <div>
              <p className="text-xs text-muted">ระหว่างดำเนินการ</p>
              <p className="text-2xl font-bold text-app">{stats.ongoing}</p>
              <p className="text-xs text-muted mt-1">กำลังติดตาม</p>
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
            <div className="p-2 bg-green-500/20 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-xs text-muted">เสร็จสิ้น</p>
              <p className="text-2xl font-bold text-app">{stats.completed}</p>
              <p className="text-xs text-muted mt-1">ประมาณพฤติกรรม</p>
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
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <User className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-xs text-muted">พนักงานที่ได้รับเตือน</p>
              <p className="text-2xl font-bold text-app">{stats.employeesWithWarnings}</p>
              <p className="text-xs text-muted mt-1">คน</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-soft border border-app rounded-xl p-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/20 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <p className="text-xs text-muted">ความเสี่ยงสูง</p>
              <p className="text-2xl font-bold text-app">{stats.multipleWarningCount}</p>
              <p className="text-xs text-muted mt-1">คน (≥3 เตือน)</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Warnings Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-soft border border-app rounded-2xl overflow-hidden shadow-xl"
      >
        <div className="px-6 py-4 border-b border-app bg-soft">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
              <h3 className="text-lg font-semibold text-app font-display">
                รายการเตือนพนักงาน
              </h3>
              <p className="text-xs text-muted mt-1">
                แสดง {filteredWarnings.length} รายการ
              </p>
            </div>
          </div>
          
          {/* Filter Bar - Inline with table */}
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="ค้นหาชื่อพนักงาน, รหัส, หรือเหตุผล..."
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
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
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
                value={warningTypeFilter}
                onChange={(e) => {
                  setWarningTypeFilter(e.target.value);
                  handleFilter();
                }}
                className="px-4 py-2.5 bg-soft border border-app rounded-xl
                         text-app text-sm min-w-[150px]
                         focus:outline-none focus:ring-2 focus:ring-ptt-blue focus:border-transparent
                         transition-all cursor-pointer hover:border-app/50"
              >
                <option value="">ทุกประเภท</option>
                <option value="พูดคุย">พูดคุย</option>
                <option value="เอกสาร">เอกสาร</option>
                <option value="พักงาน">พักงาน</option>
                <option value="ไล่ออก">ไล่ออก</option>
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
                <option value="ระหว่างดำเนินการ">ระหว่างดำเนินการ</option>
                <option value="เสร็จสิ้น">เสร็จสิ้น</option>
                <option value="ยกเลิก">ยกเลิก</option>
              </select>
            </div>
          </div>
        </div>

        {filteredWarnings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-soft border-b border-app">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-app">ชื่อ-สกุล</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-app">ประเภท</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-app">ประเภทเหตุการณ์</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-app">ระดับ</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-app">เหตุผล</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-app">วันที่</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-app">สถานะ</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-app">ทัณฑ์บน</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-app">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-app">
                {filteredWarnings.map((warning, idx) => {
                  const typeInfo = warningTypeInfo[warning.warningType];
                  const status = statusInfo[warning.status];
                  const StatusIcon = status.icon;

                  return (
                    <motion.tr
                      key={warning.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      className="hover:bg-soft/50 transition-colors cursor-pointer"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div>
                            <p className="font-medium text-app">{warning.empName}</p>
                            <p className="text-xs text-muted">{warning.empCode}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${typeInfo.color} ${typeInfo.bgColor} border ${typeInfo.borderColor}`}>
                          {warning.warningType}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <p className="text-xs text-app">{warning.eventType || "-"}</p>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-ptt-blue/20 text-ptt-cyan font-bold text-xs">
                            {warning.warningLevel}
                          </span>
                          <span className="text-xs text-muted">/4</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-app font-medium">{warning.reason}</p>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <p className="text-sm text-app">
                          {new Date(warning.date).toLocaleDateString('th-TH')}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <StatusIcon className={`w-4 h-4 ${status.color}`} />
                          <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${status.bgColor}`}>
                            {warning.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {isWarningCleared(warning) || warning.isCleared ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs bg-green-500/20 text-green-400 border border-green-500/30">
                            <CheckCircle className="w-3 h-3" />
                            ถูกล้างแล้ว
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                            <AlertCircle className="w-3 h-3" />
                            ยังไม่ถูกล้าง
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedWarning(warning);
                              setIsDetailModalOpen(true);
                            }}
                            className="p-1.5 hover:bg-soft rounded-lg transition-colors text-muted hover:text-app"
                            title="ดูรายละเอียด"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(warning)}
                            className="p-1.5 hover:bg-soft rounded-lg transition-colors text-muted hover:text-ptt-cyan"
                            title="แก้ไข"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(warning.id)}
                            className="p-1.5 hover:bg-soft rounded-lg transition-colors text-muted hover:text-red-500"
                            title="ลบ"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <AlertTriangle className="w-12 h-12 text-muted mx-auto mb-4 opacity-30" />
            <p className="text-muted font-light">ไม่พบรายการเตือน</p>
          </div>
        )}
      </motion.div>

      {/* Detail Modal */}
      {isDetailModalOpen && selectedWarning && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-soft border border-app rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 px-6 py-4 border-b border-app bg-soft flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-red-500" />
                <div>
                  <h3 className="text-xl font-bold text-app">
                    {selectedWarning.empName}
                  </h3>
                  <p className="text-sm text-muted">{selectedWarning.empCode}</p>
                </div>
              </div>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="text-muted hover:text-app transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Warning Info */}
              <div className="bg-soft/50 border border-app rounded-xl p-4">
                <h4 className="font-semibold text-app mb-4">ข้อมูลการเตือน</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted mb-1">ประเภทการเตือน</p>
                    <span className={`text-sm font-semibold px-3 py-1 rounded-lg ${warningTypeInfo[selectedWarning.warningType].color} ${warningTypeInfo[selectedWarning.warningType].bgColor} border ${warningTypeInfo[selectedWarning.warningType].borderColor}`}>
                      {warningTypeInfo[selectedWarning.warningType].label}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-muted mb-1">ระดับ</p>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-ptt-blue/20 text-ptt-cyan font-bold">
                        {selectedWarning.warningLevel}
                      </span>
                      <span className="text-sm text-muted">/4</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted mb-1">ประเภทเหตุการณ์</p>
                    <p className="text-sm font-medium text-app">
                      {selectedWarning.eventType || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted mb-1">วันที่ออกการเตือน</p>
                    <p className="text-sm font-medium text-app">
                      {new Date(selectedWarning.date).toLocaleDateString('th-TH')}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted mb-1">สถานะ</p>
                    <div className="flex items-center gap-2">
                      {(() => {
                        const status = statusInfo[selectedWarning.status];
                        const Icon = status.icon;
                        return (
                          <>
                            <Icon className={`w-4 h-4 ${status.color}`} />
                            <span className="text-sm font-semibold">{selectedWarning.status}</span>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted mb-1">สถานะทัณฑ์บน</p>
                    {isWarningCleared(selectedWarning) || selectedWarning.isCleared ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs bg-green-500/20 text-green-400 border border-green-500/30">
                        <CheckCircle className="w-3 h-3" />
                        ถูกล้างแล้ว {selectedWarning.clearedDate && `(${new Date(selectedWarning.clearedDate).toLocaleDateString('th-TH')})`}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                        <AlertCircle className="w-3 h-3" />
                        ยังไม่ถูกล้าง (จะล้างอัตโนมัติเมื่อครบ 1 ปี)
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Reason and Description */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-app mb-2">เหตุการณ์/เหตุผลการเตือน</h4>
                  <p className="text-sm text-app bg-soft/50 border border-app rounded-lg p-3">
                    {selectedWarning.reason}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-app mb-2">รายละเอียดการเตือน</h4>
                  <p className="text-sm text-app bg-soft/50 border border-app rounded-lg p-3 whitespace-pre-wrap">
                    {selectedWarning.description}
                  </p>
                </div>
              </div>

              {/* Additional Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-soft/50 border border-app rounded-lg p-3">
                  <p className="text-xs text-muted mb-1">ออกโดย</p>
                  <p className="text-sm font-medium text-app">{selectedWarning.issuedBy}</p>
                </div>
                <div className="bg-soft/50 border border-app rounded-lg p-3">
                  <p className="text-xs text-muted mb-1">แผนก</p>
                  <p className="text-sm font-medium text-app">{selectedWarning.empCategory}</p>
                </div>
                {selectedWarning.notes && (
                  <div className="col-span-2 bg-soft/50 border border-app rounded-lg p-3">
                    <p className="text-xs text-muted mb-1">หมายเหตุ</p>
                    <p className="text-sm text-app">{selectedWarning.notes}</p>
                  </div>
                )}
              </div>

              {/* Warning History for this employee */}
              <div className="border-t border-app pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-app">ประวัติการเตือนทั้งหมด</h4>
                  <button
                    onClick={() => handleClearWarnings(selectedWarning.empCode)}
                    className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg text-xs font-medium transition-colors"
                    title="ล้างทัณฑ์บนทั้งหมด (1 ปี เริ่มนับใหม่)"
                  >
                    ล้างทัณฑ์บน
                  </button>
                </div>
                <div className="space-y-2">
                  {warnings
                    .filter(w => w.empCode === selectedWarning.empCode)
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((warning) => {
                      const isCleared = isWarningCleared(warning) || warning.isCleared;
                      return (
                        <div 
                          key={warning.id} 
                          className={`flex items-center justify-between border rounded-lg p-3 ${
                            isCleared 
                              ? "bg-gray-500/10 border-gray-500/30 opacity-60" 
                              : "bg-soft/50 border-app"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className={`text-xs font-bold px-2 py-1 rounded ${warningTypeInfo[warning.warningType].bgColor} ${warningTypeInfo[warning.warningType].color}`}>
                              {warning.warningLevel}
                            </span>
                            <div>
                              <p className="text-sm font-medium text-app">
                                {warning.reason}
                                {warning.eventType && (
                                  <span className="text-xs text-muted ml-2">({warning.eventType})</span>
                                )}
                              </p>
                              <p className="text-xs text-muted">
                                {new Date(warning.date).toLocaleDateString('th-TH')}
                                {isCleared && (
                                  <span className="ml-2 text-green-500">
                                    • ถูกล้างแล้ว {warning.clearedDate && `(${new Date(warning.clearedDate).toLocaleDateString('th-TH')})`}
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {(() => {
                              const status = statusInfo[warning.status];
                              const Icon = status.icon;
                              return <Icon className={`w-4 h-4 ${status.color}`} />;
                            })()}
                            {isCleared && (
                              <div title="ถูกล้างแล้ว">
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
                <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <p className="text-xs text-app">
                    <strong>หมายเหตุ:</strong> ทัณฑ์บนจะถูกล้างอัตโนมัติเมื่อครบ 1 ปีนับจากวันที่ออกการเตือน 
                    หรือสามารถล้างด้วยตนเองได้โดยคลิกปุ่ม "ล้างทัณฑ์บน"
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 px-6 py-4 border-t border-app bg-soft flex justify-end gap-2">
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="px-4 py-2 bg-soft border border-app hover:bg-soft/80 text-app 
                         font-medium rounded-lg transition-all duration-200"
              >
                ปิด
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Add Warning Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-soft border border-app rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 px-6 py-4 border-b border-app bg-soft flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-red-500" />
                <h3 className="text-xl font-bold text-app">ทันปน (เพิ่มการเตือนใหม่)</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-muted hover:text-app transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Employee Selection */}
              <div>
                <label className="block text-sm font-semibold text-app mb-2">
                  พนักงาน <span className="text-red-500">*</span>
                </label>
                <select
                  value={addForm.empCode}
                  onChange={(e) => {
                    const empCode = e.target.value;
                    setAddForm({ 
                      ...addForm, 
                      empCode,
                      warningType: "" as WarningRecord["warningType"] | "",
                    });
                  }}
                  className="w-full px-4 py-2.5 bg-app border border-app rounded-lg text-app 
                           focus:outline-none focus:ring-2 focus:ring-ptt-blue cursor-pointer"
                >
                  <option value="">เลือกพนักงาน</option>
                  {employees
                    .filter(e => e.status === "Active")
                    .map((emp) => (
                      <option key={emp.code} value={emp.code}>
                        {emp.code} - {emp.name} ({emp.dept})
                      </option>
                    ))}
                </select>
              </div>

              {/* Warning Type */}
              <div>
                <label className="block text-sm font-semibold text-app mb-2">
                  ประเภทการเตือน <span className="text-red-500">*</span>
                </label>
                <select
                  value={addForm.warningType}
                  onChange={(e) => setAddForm({ ...addForm, warningType: e.target.value as WarningRecord["warningType"] })}
                  className="w-full px-4 py-2.5 bg-app border border-app rounded-lg text-app 
                           focus:outline-none focus:ring-2 focus:ring-ptt-blue cursor-pointer"
                >
                  <option value="">เลือกประเภทการเตือน</option>
                  <option value="พูดคุย">พูดคุย (ไม่เป็นลายลักษณ์อักษร)</option>
                  <option value="เอกสาร">เอกสาร (เป็นลายลักษณ์อักษร)</option>
                  <option value="พักงาน">พักงาน (ร้ายแรง)</option>
                  <option value="ไล่ออก">ไล่ออก (ร้ายแรงที่สุด)</option>
                </select>
                {addForm.empCode && addForm.warningType && (() => {
                  const activeWarnings = getActiveWarnings(addForm.empCode, addForm.warningType);
                  const warningLevel = calculateWarningLevel(addForm.empCode, addForm.warningType);
                  return (
                    <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg mt-2">
                      <p className="text-xs font-semibold text-app mb-1">
                        ระดับการเตือนที่จะได้รับ: {warningLevel}/4
                      </p>
                      {addForm.warningType === "พูดคุย" || addForm.warningType === "เอกสาร" ? (
                        <p className="text-xs text-muted">
                          พนักงานนี้มีประวัติการเตือนประเภทนี้ที่ยังไม่ถูกล้าง: {activeWarnings.length} ครั้ง
                          {activeWarnings.length >= 2 && (
                            <span className="block mt-1 text-orange-500 font-semibold">
                              ⚠️ ใกล้ถึงขีดจำกัด (สูงสุด 3 ครั้ง)
                            </span>
                          )}
                        </p>
                      ) : null}
                      <p className="text-xs text-muted mt-1">
                        * ทัณฑ์บนจะถูกล้างอัตโนมัติเมื่อครบ 1 ปี
                      </p>
                    </div>
                  );
                })()}
              </div>

              {/* Event Type */}
              <div>
                <label className="block text-sm font-semibold text-app mb-2">
                  ประเภทเหตุการณ์ <span className="text-red-500">*</span>
                </label>
                <select
                  value={addForm.eventType}
                  onChange={(e) => setAddForm({ ...addForm, eventType: e.target.value })}
                  className="w-full px-4 py-2.5 bg-app border border-app rounded-lg text-app 
                           focus:outline-none focus:ring-2 focus:ring-ptt-blue cursor-pointer"
                >
                  <option value="">เลือกประเภทเหตุการณ์</option>
                  <option value="การร้องเรียนเฉพาะบุคคล">การร้องเรียนเฉพาะบุคคล</option>
                  <option value="การร้องเรียนทั่วไป">การร้องเรียนทั่วไป</option>
                  <option value="มาสาย">มาสาย</option>
                  <option value="ขาดงาน">ขาดงาน</option>
                  <option value="ทำงานไม่ถูกต้อง">ทำงานไม่ถูกต้อง</option>
                  <option value="ไม่ปฏิบัติตามระเบียบ">ไม่ปฏิบัติตามระเบียบ</option>
                  <option value="พฤติกรรมไม่เหมาะสม">พฤติกรรมไม่เหมาะสม</option>
                  <option value="อื่นๆ">อื่นๆ</option>
                </select>
              </div>

              {/* Reason */}
              <div>
                <label className="block text-sm font-semibold text-app mb-2">
                  เหตุการณ์/เหตุผลการเตือน <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={addForm.reason}
                  onChange={(e) => setAddForm({ ...addForm, reason: e.target.value })}
                  placeholder="เช่น การร้องเรียนจากลูกค้า, มาสาย, ขาดงาน"
                  className="w-full px-4 py-2.5 bg-app border border-app rounded-lg text-app 
                           focus:outline-none focus:ring-2 focus:ring-ptt-blue"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-app mb-2">
                  รายละเอียดการเตือน <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={addForm.description}
                  onChange={(e) => setAddForm({ ...addForm, description: e.target.value })}
                  rows={4}
                  placeholder="อธิบายรายละเอียดเหตุการณ์ที่เกิดขึ้น..."
                  className="w-full px-4 py-2.5 bg-app border border-app rounded-lg text-app 
                           focus:outline-none focus:ring-2 focus:ring-ptt-blue resize-none"
                />
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-semibold text-app mb-2">
                  วันที่ออกการเตือน
                </label>
                <input
                  type="date"
                  value={addForm.date}
                  onChange={(e) => setAddForm({ ...addForm, date: e.target.value })}
                  className="w-full px-4 py-2.5 bg-app border border-app rounded-lg text-app 
                           focus:outline-none focus:ring-2 focus:ring-ptt-blue"
                />
              </div>

              {/* Issued By */}
              <div>
                <label className="block text-sm font-semibold text-app mb-2">
                  ออกโดย
                </label>
                <input
                  type="text"
                  value={addForm.issuedBy}
                  onChange={(e) => setAddForm({ ...addForm, issuedBy: e.target.value })}
                  placeholder="เช่น หัวหน้าปั๊ม, หัวหน้าแผนก"
                  className="w-full px-4 py-2.5 bg-app border border-app rounded-lg text-app 
                           focus:outline-none focus:ring-2 focus:ring-ptt-blue"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-semibold text-app mb-2">
                  สถานะ
                </label>
                <select
                  value={addForm.status}
                  onChange={(e) => setAddForm({ ...addForm, status: e.target.value as WarningRecord["status"] })}
                  className="w-full px-4 py-2.5 bg-app border border-app rounded-lg text-app 
                           focus:outline-none focus:ring-2 focus:ring-ptt-blue cursor-pointer"
                >
                  <option value="ระหว่างดำเนินการ">ระหว่างดำเนินการ</option>
                  <option value="เสร็จสิ้น">เสร็จสิ้น</option>
                  <option value="ยกเลิก">ยกเลิก</option>
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-semibold text-app mb-2">
                  หมายเหตุ
                </label>
                <textarea
                  value={addForm.notes}
                  onChange={(e) => setAddForm({ ...addForm, notes: e.target.value })}
                  rows={2}
                  placeholder="หมายเหตุเพิ่มเติม (ถ้ามี)"
                  className="w-full px-4 py-2.5 bg-app border border-app rounded-lg text-app 
                           focus:outline-none focus:ring-2 focus:ring-ptt-blue resize-none"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 px-6 py-4 border-t border-app bg-soft flex justify-end gap-2">
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setAddForm({
                    empCode: "",
                    warningType: "" as WarningRecord["warningType"] | "",
                    reason: "",
                    eventType: "",
                    description: "",
                    date: new Date().toISOString().split('T')[0],
                    issuedBy: "",
                    status: "ระหว่างดำเนินการ" as WarningRecord["status"],
                    notes: "",
                  });
                }}
                className="px-4 py-2 bg-soft border border-app hover:bg-soft/80 text-app 
                         font-medium rounded-lg transition-all duration-200"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleAddWarning}
                className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white 
                         font-semibold rounded-lg transition-all duration-200"
              >
                บันทึกการเตือน
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && selectedWarning && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-soft border border-app rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 px-6 py-4 border-b border-app bg-soft flex items-center justify-between">
              <h3 className="text-xl font-bold text-app">แก้ไขการเตือน</h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-muted hover:text-app transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-app mb-2">เหตุผล</label>
                <input
                  type="text"
                  value={editForm.reason}
                  onChange={(e) => setEditForm({ ...editForm, reason: e.target.value })}
                  className="w-full px-4 py-2 bg-app border border-app rounded-lg text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-app mb-2">รายละเอียด</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 bg-app border border-app rounded-lg text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-app mb-2">สถานะ</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value as WarningRecord["status"] })}
                  className="w-full px-4 py-2 bg-app border border-app rounded-lg text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue"
                >
                  <option value="">เลือกสถานะ</option>
                  <option value="ระหว่างดำเนินการ">ระหว่างดำเนินการ</option>
                  <option value="เสร็จสิ้น">เสร็จสิ้น</option>
                  <option value="ยกเลิก">ยกเลิก</option>
                </select>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 px-6 py-4 border-t border-app bg-soft flex justify-end gap-2">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 bg-soft border border-app hover:bg-soft/80 text-app 
                         font-medium rounded-lg transition-all duration-200"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-6 py-2 bg-ptt-cyan hover:bg-ptt-cyan/80 text-app 
                         font-semibold rounded-lg transition-all duration-200"
              >
                บันทึก
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
