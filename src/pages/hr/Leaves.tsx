import { useState } from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import FilterBar from "@/components/FilterBar";
import ModalForm from "@/components/ModalForm";
import StatusTag, { getStatusVariant } from "@/components/StatusTag";
import { leaves, type Leave } from "@/data/mockData";

export default function Leaves() {
  const [filteredLeaves, setFilteredLeaves] = useState<Leave[]>(leaves);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleFilter = () => {
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

    setFilteredLeaves(filtered);
  };

  const types = Array.from(new Set(leaves.map((l) => l.type)));
  const statuses = Array.from(new Set(leaves.map((l) => l.status)));

  const handleRequestLeave = () => {
    alert("ขออนุมัติลาใหม่ (Mock)");
    setIsModalOpen(false);
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
            รายการคำขอลาทั้งหมด {filteredLeaves.length} รายการ
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-6 py-3 bg-ptt-blue hover:bg-ptt-blue/80 
                   text-app rounded-xl transition-all duration-200 font-semibold 
                   shadow-lg hover:shadow-xl hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5" />
          ขออนุมัติลา
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
            label: "ประเภททั้งหมด",
            value: typeFilter,
            options: types.map((t) => ({ label: t, value: t })),
            onChange: (value) => {
              setTypeFilter(value);
              handleFilter();
            },
          },
          {
            label: "สถานะทั้งหมด",
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
                <th className="px-6 py-4 text-center text-sm font-semibold text-app">
                  สถานะ
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
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
                    {leave.days}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <StatusTag variant={getStatusVariant(leave.status)}>
                      {leave.status}
                    </StatusTag>
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
        </div>
      </motion.div>

      {/* Request Leave Modal */}
      <ModalForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="ขออนุมัติลา"
        onSubmit={handleRequestLeave}
        submitLabel="ส่งคำขอ"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-app mb-2">
              ประเภทการลา
            </label>
            <select
              className="w-full px-4 py-2.5 bg-ink-800 border border-app rounded-xl
                       text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue"
            >
              <option value="">เลือกประเภท</option>
              <option value="ลาพักร้อน">ลาพักร้อน</option>
              <option value="ลาป่วย">ลาป่วย</option>
              <option value="ลากิจ">ลากิจ</option>
              <option value="ลาคลอด">ลาคลอด</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-app mb-2">
                วันที่เริ่ม
              </label>
              <input
                type="date"
                className="w-full px-4 py-2.5 bg-ink-800 border border-app rounded-xl
                         text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-app mb-2">
                วันที่สิ้นสุด
              </label>
              <input
                type="date"
                className="w-full px-4 py-2.5 bg-ink-800 border border-app rounded-xl
                         text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-app mb-2">
              เหตุผลการลา
            </label>
            <textarea
              rows={4}
              placeholder="ระบุเหตุผล..."
              className="w-full px-4 py-2.5 bg-ink-800 border border-app rounded-xl
                       text-app placeholder:text-muted
                       focus:outline-none focus:ring-2 focus:ring-ptt-blue resize-none"
            />
          </div>
        </div>
      </ModalForm>
    </div>
  );
}

