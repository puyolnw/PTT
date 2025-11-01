import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { UserPlus, Eye } from "lucide-react";
import FilterBar from "@/components/FilterBar";
import StatusTag, { getStatusVariant } from "@/components/StatusTag";
import { employees, type Employee } from "@/data/mockData";

export default function Employees() {
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>(employees);
  const [searchQuery, setSearchQuery] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

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
  useState(() => {
    handleFilter();
  });

  const departments = Array.from(new Set(employees.map((e) => e.dept)));
  const statuses = Array.from(new Set(employees.map((e) => e.status)));

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

        <Link
          to="/app/employees/new"
          className="inline-flex items-center gap-2 px-6 py-3 bg-ptt-blue hover:bg-ptt-blue/80 
                   text-app rounded-xl transition-all duration-200 font-semibold 
                   shadow-lg hover:shadow-xl hover:-translate-y-0.5"
        >
          <UserPlus className="w-5 h-5" />
          เพิ่มพนักงาน
        </Link>
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
                  <td className="px-6 py-4">
                    <StatusTag variant={getStatusVariant(employee.status)}>
                      {employee.status}
                    </StatusTag>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Link
                      to={`/app/employees/${employee.id}`}
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
    </div>
  );
}

