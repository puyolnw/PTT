import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar } from "lucide-react";
import FilterBar from "@/components/FilterBar";
import StatusTag, { getStatusVariant } from "@/components/StatusTag";
import { attendanceLogs, type AttendanceLog } from "@/data/mockData";

export default function Attendance() {
  const [filteredLogs, setFilteredLogs] = useState<AttendanceLog[]>(attendanceLogs);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

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

    setFilteredLogs(filtered);
  };

  const statuses = Array.from(new Set(attendanceLogs.map((l) => l.status)));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-app mb-2 font-display">
          บันทึกเวลาเข้าออก
        </h1>
        <p className="text-muted font-light">
          รายการเวลาเข้าออกงานของพนักงาน วันที่ {new Date().toLocaleDateString("th-TH")}
        </p>
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
                  วันที่
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-app">
                  รหัส
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-app">
                  ชื่อ-นามสกุล
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-app">
                  เวลาเข้า
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-app">
                  เวลาออก
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-app">
                  สถานะ
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredLogs.map((log, index) => (
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
                      <span className="text-sm text-app font-light">
                        {log.date}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-ptt-cyan font-medium">
                    {log.empCode}
                  </td>
                  <td className="px-6 py-4 text-sm text-app font-medium">
                    {log.empName}
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-app font-mono">
                    {log.checkIn}
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-app font-mono">
                    {log.checkOut}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <StatusTag variant={getStatusVariant(log.status)}>
                      {log.status}
                    </StatusTag>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>

          {filteredLogs.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted font-light">ไม่พบข้อมูล</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

