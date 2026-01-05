import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { UserPlus, Eye } from "lucide-react";
import FilterBar from "@/components/FilterBar";
import ModalForm from "@/components/ModalForm";
import StatusTag from "@/components/StatusTag";
import { getStatusVariant } from "@/utils/statusHelpers";
import { candidates, type Candidate } from "@/data/mockData";

export default function Recruitment() {
  const [filteredCandidates, setFilteredCandidates] = useState<Candidate[]>(candidates);
  const [statusFilter, setStatusFilter] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleFilter = () => {
    let filtered = candidates;
    if (statusFilter) {
      filtered = filtered.filter((c) => c.status === statusFilter);
    }
    setFilteredCandidates(filtered);
  };

  const statuses = Array.from(new Set(candidates.map((c) => c.status)));

  const handleAddCandidate = () => {
    alert("เพิ่มผู้สมัครใหม่ (Mock)");
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-app mb-2 font-display">
            รับสมัครงาน
          </h1>
          <p className="text-muted font-light">
            รายการผู้สมัครงานทั้งหมด {filteredCandidates.length} คน
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-6 py-3 bg-ptt-blue hover:bg-ptt-blue/80 
                   text-app rounded-xl transition-all duration-200 font-semibold 
                   shadow-lg hover:shadow-xl hover:-translate-y-0.5"
        >
          <UserPlus className="w-5 h-5" />
          เพิ่มผู้สมัคร
        </button>
      </div>

      {/* Filter */}
      <FilterBar
        placeholder="ค้นหาชื่อหรือตำแหน่ง..."
        filters={[
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
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                  ชื่อ-นามสกุล
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                  ตำแหน่งที่สมัคร
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-slate-300">
                  วันที่สมัคร
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-slate-300">
                  สถานะ
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-slate-300">
                  จัดการ
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredCandidates.map((candidate, index) => (
                <motion.tr
                  key={candidate.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-soft transition-colors"
                >
                  <td className="px-6 py-4 text-sm text-app font-medium">
                    {candidate.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-300 font-light">
                    {candidate.position}
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-slate-300 font-light">
                    {candidate.appliedDate}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <StatusTag variant={getStatusVariant(candidate.status)}>
                      {candidate.status}
                    </StatusTag>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Link
                      to={`/app/recruitment/${candidate.id}`}
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
        </div>
      </motion.div>

      {/* Add Candidate Modal */}
      <ModalForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="เพิ่มผู้สมัครใหม่"
        onSubmit={handleAddCandidate}
        submitLabel="เพิ่ม"
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="cand-name" className="block text-sm font-medium text-slate-300 mb-2">ชื่อ-นามสกุล</label>
            <input
              id="cand-name"
              type="text"
              className="w-full px-4 py-2.5 bg-ink-800 border border-app rounded-xl text-app"
            />
          </div>
          <div>
            <label htmlFor="cand-pos" className="block text-sm font-medium text-slate-300 mb-2">ตำแหน่ง</label>
            <input
              id="cand-pos"
              type="text"
              className="w-full px-4 py-2.5 bg-ink-800 border border-app rounded-xl text-app"
            />
          </div>
          <div>
            <label htmlFor="cand-email" className="block text-sm font-medium text-slate-300 mb-2">อีเมล</label>
            <input
              id="cand-email"
              type="email"
              className="w-full px-4 py-2.5 bg-ink-800 border border-app rounded-xl text-app"
            />
          </div>
          <div>
            <label htmlFor="cand-tel" className="block text-sm font-medium text-slate-300 mb-2">เบอร์โทร</label>
            <input
              id="cand-tel"
              type="tel"
              className="w-full px-4 py-2.5 bg-ink-800 border border-app rounded-xl text-app"
            />
          </div>
        </div>
      </ModalForm>
    </div>
  );
}
