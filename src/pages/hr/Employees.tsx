import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { UserPlus, Eye } from "lucide-react";
import FilterBar from "@/components/FilterBar";
import ModalForm from "@/components/ModalForm";
import StatusTag, { getStatusVariant } from "@/components/StatusTag";
import { employees as initialEmployees, shifts, type Employee } from "@/data/mockData";

export default function Employees() {
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>(employees);
  const [searchQuery, setSearchQuery] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
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
    otRate: ""
  });

  // Handle filtering
  const handleFilter = () => {
    let filtered = employees;

    if (searchQuery) {
      filtered = filtered.filter(
        (emp) =>
          emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          emp.code.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (deptFilter) {
      filtered = filtered.filter((emp) => emp.dept === deptFilter);
    }

    if (statusFilter) {
      filtered = filtered.filter((emp) => emp.status === statusFilter);
    }

    setFilteredEmployees(filtered);
  };

  // Re-filter when any filter changes
  useEffect(() => {
    handleFilter();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employees, searchQuery, deptFilter, statusFilter]);

  const departments = Array.from(new Set(employees.map((e) => e.dept)));
  const statuses = Array.from(new Set(employees.map((e) => e.status)));

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
      otRate: formData.otRate ? Number(formData.otRate) : undefined
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
      otRate: ""
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

      {/* Filter Bar */}
      <FilterBar
        placeholder="ค้นหาชื่อหรือรหัสพนักงาน..."
        onSearch={(query) => {
          setSearchQuery(query);
          handleFilter();
        }}
        filters={[
          {
            label: "ทุกแผนก",
            value: deptFilter,
            options: departments.map((d) => ({ label: d, value: d })),
            onChange: (value) => {
              setDeptFilter(value);
              handleFilter();
            },
          },
          {
            label: "ทุกสถานะ",
            value: statusFilter,
            options: statuses.map((s) => ({ label: s, value: s })),
            onChange: (value) => {
              setStatusFilter(value);
              handleFilter();
            },
          },
        ]}
      />

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-soft border border-app rounded-2xl overflow-hidden shadow-xl"
      >
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
            otRate: ""
          });
        }}
        title="เพิ่มพนักงานใหม่"
        onSubmit={handleSubmitNewEmployee}
        submitLabel="บันทึก"
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-app mb-2">
                ชื่อ-นามสกุล <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleFormChange}
                required
                className="w-full px-4 py-2.5 bg-ink-800 border border-app rounded-xl
                         text-app placeholder:text-muted
                         focus:outline-none focus:ring-2 focus:ring-ptt-blue"
                placeholder="เช่น สมชาย ใจดี"
              />
            </div>

            {/* Department */}
            <div>
              <label className="block text-sm font-medium text-app mb-2">
                แผนก <span className="text-red-400">*</span>
              </label>
              <select
                name="dept"
                value={formData.dept}
                onChange={handleFormChange}
                required
                className="w-full px-4 py-2.5 bg-ink-800 border border-app rounded-xl
                         text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue"
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
            <div>
              <label className="block text-sm font-medium text-app mb-2">
                ตำแหน่ง <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="position"
                value={formData.position}
                onChange={handleFormChange}
                required
                className="w-full px-4 py-2.5 bg-ink-800 border border-app rounded-xl
                         text-app placeholder:text-muted
                         focus:outline-none focus:ring-2 focus:ring-ptt-blue"
                placeholder="เช่น Senior Developer"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-app mb-2">
                อีเมล
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleFormChange}
                className="w-full px-4 py-2.5 bg-ink-800 border border-app rounded-xl
                         text-app placeholder:text-muted
                         focus:outline-none focus:ring-2 focus:ring-ptt-blue"
                placeholder="example@ptt.co.th"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-app mb-2">
                เบอร์โทร
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleFormChange}
                className="w-full px-4 py-2.5 bg-ink-800 border border-app rounded-xl
                         text-app placeholder:text-muted
                         focus:outline-none focus:ring-2 focus:ring-ptt-blue"
                placeholder="08X-XXX-XXXX"
              />
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-app mb-2">
                วันที่เริ่มงาน <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleFormChange}
                required
                className="w-full px-4 py-2.5 bg-ink-800 border border-app rounded-xl
                         text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue"
              />
            </div>

            {/* Shift */}
            <div>
              <label className="block text-sm font-medium text-app mb-2">
                กะการทำงาน
              </label>
              <select
                name="shiftId"
                value={formData.shiftId}
                onChange={handleFormChange}
                className="w-full px-4 py-2.5 bg-ink-800 border border-app rounded-xl
                         text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue"
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
            <div>
              <label className="block text-sm font-medium text-app mb-2">
                OT Rate (บาท/ชั่วโมง)
              </label>
              <input
                type="number"
                name="otRate"
                value={formData.otRate}
                onChange={handleFormChange}
                min="0"
                step="1"
                className="w-full px-4 py-2.5 bg-ink-800 border border-app rounded-xl
                         text-app placeholder:text-muted
                         focus:outline-none focus:ring-2 focus:ring-ptt-blue"
                placeholder="เช่น 200"
              />
            </div>

            {/* Status */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-app mb-2">
                สถานะ
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleFormChange}
                className="w-full px-4 py-2.5 bg-ink-800 border border-app rounded-xl
                         text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue"
              >
                <option value="Active">Active</option>
                <option value="Leave">Leave</option>
                <option value="Resigned">Resigned</option>
              </select>
            </div>
          </div>

          {/* Info */}
          <div className="p-3 bg-ptt-blue/10 border border-ptt-blue/30 rounded-lg">
            <p className="text-xs text-ptt-cyan">
              💡 รหัสพนักงานจะถูกสร้างอัตโนมัติหลังจากบันทึก
            </p>
          </div>
        </div>
      </ModalForm>
    </div>
  );
}

