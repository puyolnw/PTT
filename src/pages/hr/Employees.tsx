import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { UserPlus, Eye, Users, UserCheck, UserX, Building2 } from "lucide-react";
import ModalForm from "@/components/ModalForm";
import StatusTag, { getStatusVariant } from "@/components/StatusTag";
import { employees as initialEmployees, shifts, type Employee } from "@/data/mockData";

export default function Employees() {
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>(employees);
  const [searchQuery, setSearchQuery] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [shiftFilter, setShiftFilter] = useState<number | "">("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    dept: "",
    position: "",
    email: "",
    phone: "",
    startDate: "",
    status: "Active" as Employee["status"],
    shiftId: "",
    otRate: "",
    category: ""
  });

  // Handle filtering
  const handleFilter = () => {
    let filtered = employees;

    // Search across all fields
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (emp) =>
          emp.name.toLowerCase().includes(query) ||
          emp.code.toLowerCase().includes(query) ||
          emp.dept.toLowerCase().includes(query) ||
          emp.position.toLowerCase().includes(query) ||
          (emp.email && emp.email.toLowerCase().includes(query)) ||
          (emp.phone && emp.phone.includes(query)) ||
          (emp.category && emp.category.toLowerCase().includes(query))
      );
    }

    if (deptFilter) {
      filtered = filtered.filter((emp) => emp.dept === deptFilter);
    }

    if (statusFilter) {
      filtered = filtered.filter((emp) => emp.status === statusFilter);
    }

    if (shiftFilter !== "") {
      filtered = filtered.filter((emp) => emp.shiftId === shiftFilter);
    }

    setFilteredEmployees(filtered);
  };

  // Re-filter when any filter changes
  useEffect(() => {
    handleFilter();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employees, searchQuery, deptFilter, statusFilter, shiftFilter]);

  const departments = Array.from(new Set(employees.map((e) => e.dept)));
  const statuses = Array.from(new Set(employees.map((e) => e.status)));

  // Calculate statistics for dashboard
  const totalEmployees = employees.length;
  const activeEmployees = employees.filter(e => e.status === "Active").length;
  const leaveEmployees = employees.filter(e => e.status === "Leave").length;
  const resignedEmployees = employees.filter(e => e.status === "Resigned").length;
  
  // Get department with most employees
  const deptCounts = departments.map(dept => ({
    dept,
    count: employees.filter(e => e.dept === dept).length
  }));
  const topDept = deptCounts.sort((a, b) => b.count - a.count)[0];

  // Generate employee code
  const generateEmployeeCode = (): string => {
    const maxId = Math.max(...employees.map(e => parseInt(e.code.split("-")[1])), 0);
    const newId = maxId + 1;
    return `EMP-${String(newId).padStart(4, "0")}`;
  };

  // Handle form change
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle submit new employee
  const handleSubmitNewEmployee = () => {
    if (!formData.name || !formData.dept || !formData.position || !formData.startDate) {
      alert("กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน");
      return;
    }

    const newEmployee: Employee = {
      id: Math.max(...employees.map(e => e.id), 0) + 1,
      code: generateEmployeeCode(),
      name: formData.name,
      dept: formData.dept,
      position: formData.position,
      status: formData.status,
      startDate: formData.startDate,
      email: formData.email || undefined,
      phone: formData.phone || undefined,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=2867e0&color=fff`,
      shiftId: formData.shiftId ? Number(formData.shiftId) : undefined,
      otRate: formData.otRate ? Number(formData.otRate) : undefined,
      category: formData.category || undefined
    };

    setEmployees([...employees, newEmployee]);
    
    // Reset form
    setFormData({
      name: "",
      dept: "",
      position: "",
      email: "",
      phone: "",
      startDate: "",
      status: "Active",
      shiftId: "",
      otRate: "",
      category: ""
    });
    setIsAddModalOpen(false);
    
    alert(`เพิ่มพนักงาน "${newEmployee.name}" (${newEmployee.code}) สำเร็จ!`);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-app mb-2 font-display">
            จัดการพนักงาน
          </h1>
          <p className="text-muted font-light">
            รายการพนักงานทั้งหมด {filteredEmployees.length} คน
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-6 py-3 bg-ptt-blue hover:bg-ptt-blue/80 
                   text-app rounded-xl transition-all duration-200 font-semibold 
                   shadow-lg hover:shadow-xl hover:-translate-y-0.5"
        >
          <UserPlus className="w-5 h-5" />
          เพิ่มพนักงาน
        </button>
      </div>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-soft border border-app rounded-2xl p-6 shadow-xl"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-ptt-cyan/20 rounded-lg">
              <Users className="w-5 h-5 text-ptt-cyan" />
            </div>
            <p className="text-muted text-sm font-light">พนักงานทั้งหมด</p>
          </div>
          <p className="text-3xl font-bold text-app font-display">
            {totalEmployees}
          </p>
          <p className="text-xs text-muted mt-1">
            แสดง {filteredEmployees.length} คน
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-soft border border-app rounded-2xl p-6 shadow-xl"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <UserCheck className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-muted text-sm font-light">สถานะ Active</p>
          </div>
          <p className="text-3xl font-bold text-app font-display">
            {activeEmployees}
          </p>
          <p className="text-xs text-muted mt-1">
            {totalEmployees > 0 ? Math.round((activeEmployees / totalEmployees) * 100) : 0}% ของทั้งหมด
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-soft border border-app rounded-2xl p-6 shadow-xl"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-yellow-500/20 rounded-lg">
              <UserX className="w-5 h-5 text-yellow-400" />
            </div>
            <p className="text-muted text-sm font-light">สถานะ Leave</p>
          </div>
          <p className="text-3xl font-bold text-app font-display">
            {leaveEmployees}
          </p>
          <p className="text-xs text-muted mt-1">
            {totalEmployees > 0 ? Math.round((leaveEmployees / totalEmployees) * 100) : 0}% ของทั้งหมด
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-soft border border-app rounded-2xl p-6 shadow-xl"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-500/20 rounded-lg">
              <UserX className="w-5 h-5 text-red-400" />
            </div>
            <p className="text-muted text-sm font-light">สถานะ Resigned</p>
          </div>
          <p className="text-3xl font-bold text-app font-display">
            {resignedEmployees}
          </p>
          <p className="text-xs text-muted mt-1">
            {totalEmployees > 0 ? Math.round((resignedEmployees / totalEmployees) * 100) : 0}% ของทั้งหมด
          </p>
        </motion.div>
      </div>

      {/* Additional Stats Row */}
      {topDept && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-soft border border-app rounded-2xl p-6 shadow-xl"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Building2 className="w-5 h-5 text-blue-400" />
              </div>
              <p className="text-muted text-sm font-light">แผนกที่มีพนักงานมากที่สุด</p>
            </div>
            <p className="text-2xl font-bold text-app font-display">
              {topDept.dept}
            </p>
            <p className="text-xs text-muted mt-1">
              {topDept.count} คน
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-soft border border-app rounded-2xl p-6 shadow-xl"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Users className="w-5 h-5 text-purple-400" />
              </div>
              <p className="text-muted text-sm font-light">จำนวนแผนกทั้งหมด</p>
            </div>
            <p className="text-2xl font-bold text-app font-display">
              {departments.length}
            </p>
            <p className="text-xs text-muted mt-1">
              แผนก
            </p>
          </motion.div>
        </div>
      )}

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
                รายการพนักงาน
              </h3>
              <p className="text-xs text-muted mt-1">
                แสดงพนักงานทั้งหมด {filteredEmployees.length} คน
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
                {departments.map((d) => (
                  <option key={d} value={d}>
                    {d}
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
                  แผนก
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-app">
                  ตำแหน่ง
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-app">
                  หมวดหมู่
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-app">
                  กะ
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-app">
                  OT Rate
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-app">
                  สถานะ
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-app">
                  จัดการ
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredEmployees.map((employee, index) => (
                <motion.tr
                  key={employee.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-soft transition-colors"
                >
                  <td className="px-6 py-4 text-sm text-ptt-cyan font-medium">
                    {employee.code}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={employee.avatar}
                        alt={employee.name}
                        className="w-10 h-10 rounded-lg ring-2 ring-ptt-blue/30"
                      />
                      <span className="text-app font-medium">
                        {employee.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-app font-light">
                    {employee.dept}
                  </td>
                  <td className="px-6 py-4 text-sm text-app font-light">
                    {employee.position}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {employee.category ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium
                                     bg-ptt-cyan/20 text-ptt-cyan border border-ptt-cyan/30">
                        {employee.category}
                      </span>
                    ) : (
                      <span className="text-xs text-muted">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {employee.shiftId ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium
                                     bg-ptt-blue/20 text-ptt-cyan border border-ptt-blue/30">
                        {shifts.find(s => s.id === employee.shiftId)?.name || "ไม่ระบุ"}
                      </span>
                    ) : (
                      <span className="text-xs text-muted">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {employee.otRate ? (
                      <span className="text-sm text-app font-semibold font-mono">
                        ฿{employee.otRate.toLocaleString("th-TH")}
                        <span className="text-xs text-muted font-normal ml-1">/ชม.</span>
                      </span>
                    ) : (
                      <span className="text-xs text-muted">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <StatusTag variant={getStatusVariant(employee.status)}>
                      {employee.status}
                    </StatusTag>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Link
                      to={`/app/hr/employees/${employee.id}`}
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm 
                               text-ptt-cyan hover:text-ptt-blue transition-colors font-medium"
                    >
                      <Eye className="w-4 h-4" />
                      ดูข้อมูล
                    </Link>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>

          {filteredEmployees.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted font-light">ไม่พบข้อมูลพนักงาน</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Add Employee Modal */}
      <ModalForm
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setFormData({
            name: "",
            dept: "",
            position: "",
            email: "",
            phone: "",
            startDate: "",
            status: "Active",
            shiftId: "",
            otRate: "",
            category: ""
          });
        }}
        title="เพิ่มพนักงานใหม่"
        onSubmit={handleSubmitNewEmployee}
        submitLabel="บันทึก"
        size="lg"
      >
        <div className="space-y-6">
          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Name */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-app mb-1.5">
                ชื่อ-นามสกุล <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleFormChange}
                required
                className="w-full px-4 py-3 bg-soft border border-app rounded-xl
                         text-app placeholder:text-muted
                         focus:outline-none focus:ring-2 focus:ring-ptt-blue focus:border-ptt-blue/50
                         transition-all duration-200 hover:border-app/50"
                placeholder="เช่น สมชาย ใจดี"
              />
            </div>

            {/* Department */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-app mb-1.5">
                แผนก <span className="text-red-400">*</span>
              </label>
              <select
                name="dept"
                value={formData.dept}
                onChange={handleFormChange}
                required
                className="w-full px-4 py-3 bg-soft border border-app rounded-xl
                         text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue focus:border-ptt-blue/50
                         transition-all duration-200 hover:border-app/50 cursor-pointer"
              >
                <option value="">เลือกแผนก</option>
                <option value="IT">IT</option>
                <option value="HR">HR</option>
                <option value="Account">Account</option>
                <option value="Marketing">Marketing</option>
                <option value="Sales">Sales</option>
              </select>
            </div>

            {/* Position */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-app mb-1.5">
                ตำแหน่ง <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="position"
                value={formData.position}
                onChange={handleFormChange}
                required
                className="w-full px-4 py-3 bg-soft border border-app rounded-xl
                         text-app placeholder:text-muted
                         focus:outline-none focus:ring-2 focus:ring-ptt-blue focus:border-ptt-blue/50
                         transition-all duration-200 hover:border-app/50"
                placeholder="เช่น Senior Developer"
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-app mb-1.5">
                อีเมล
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleFormChange}
                className="w-full px-4 py-3 bg-soft border border-app rounded-xl
                         text-app placeholder:text-muted
                         focus:outline-none focus:ring-2 focus:ring-ptt-blue focus:border-ptt-blue/50
                         transition-all duration-200 hover:border-app/50"
                placeholder="example@ptt.co.th"
              />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-app mb-1.5">
                เบอร์โทร
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleFormChange}
                className="w-full px-4 py-3 bg-soft border border-app rounded-xl
                         text-app placeholder:text-muted
                         focus:outline-none focus:ring-2 focus:ring-ptt-blue focus:border-ptt-blue/50
                         transition-all duration-200 hover:border-app/50"
                placeholder="08X-XXX-XXXX"
              />
            </div>

            {/* Start Date */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-app mb-1.5">
                วันที่เริ่มงาน <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleFormChange}
                required
                className="w-full px-4 py-3 bg-soft border border-app rounded-xl
                         text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue focus:border-ptt-blue/50
                         transition-all duration-200 hover:border-app/50 cursor-pointer"
              />
            </div>

            {/* Shift */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-app mb-1.5">
                กะการทำงาน
              </label>
              <select
                name="shiftId"
                value={formData.shiftId}
                onChange={handleFormChange}
                className="w-full px-4 py-3 bg-soft border border-app rounded-xl
                         text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue focus:border-ptt-blue/50
                         transition-all duration-200 hover:border-app/50 cursor-pointer"
              >
                <option value="">ไม่ระบุ</option>
                {shifts.map((shift) => (
                  <option key={shift.id} value={shift.id}>
                    กะ{shift.name} ({shift.startTime} - {shift.endTime})
                  </option>
                ))}
              </select>
            </div>

            {/* OT Rate */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-app mb-1.5">
                OT Rate (บาท/ชั่วโมง)
              </label>
              <input
                type="number"
                name="otRate"
                value={formData.otRate}
                onChange={handleFormChange}
                min="0"
                step="1"
                className="w-full px-4 py-3 bg-soft border border-app rounded-xl
                         text-app placeholder:text-muted
                         focus:outline-none focus:ring-2 focus:ring-ptt-blue focus:border-ptt-blue/50
                         transition-all duration-200 hover:border-app/50"
                placeholder="เช่น 200"
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-app mb-1.5">
                หมวดหมู่
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleFormChange}
                className="w-full px-4 py-3 bg-soft border border-app rounded-xl
                         text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue focus:border-ptt-blue/50
                         transition-all duration-200 hover:border-app/50 cursor-pointer"
              >
                <option value="">ไม่ระบุ</option>
                <option value="ปั๊ม">ปั๊ม</option>
                <option value="เซเว่น">เซเว่น</option>
                <option value="ปึงหงี่เชียง">ปึงหงี่เชียง</option>
                <option value="เจ้าสัว">เจ้าสัว</option>
                <option value="ร้านเจียง">ร้านเจียง</option>
                <option value="ร้านเชสเตอร์">ร้านเชสเตอร์</option>
                <option value="ร้านไดโซ">ร้านไดโซ</option>
                <option value="ร้านมอไซด์ไฟฟ้า">ร้านมอไซด์ไฟฟ้า</option>
                <option value="ร้าน Quick">ร้าน Quick</option>
              </select>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-app mb-1.5">
                สถานะ
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleFormChange}
                className="w-full px-4 py-3 bg-soft border border-app rounded-xl
                         text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue focus:border-ptt-blue/50
                         transition-all duration-200 hover:border-app/50 cursor-pointer"
              >
                <option value="Active">Active</option>
                <option value="Leave">Leave</option>
                <option value="Resigned">Resigned</option>
              </select>
            </div>
          </div>

          {/* Info Card */}
          <div className="p-4 bg-gradient-to-r from-ptt-blue/10 via-ptt-cyan/10 to-ptt-blue/10 
                        border border-ptt-blue/30 rounded-xl shadow-sm">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-ptt-blue/20 rounded-lg">
                <svg className="w-5 h-5 text-ptt-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-app mb-1">ข้อมูลสำคัญ</p>
                <p className="text-xs text-muted leading-relaxed">
                  รหัสพนักงานจะถูกสร้างอัตโนมัติหลังจากบันทึกข้อมูล • ข้อมูลที่ทำเครื่องหมาย <span className="text-red-400">*</span> เป็นข้อมูลที่จำเป็นต้องกรอก
                </p>
              </div>
            </div>
          </div>
        </div>
      </ModalForm>
    </div>
  );
}

