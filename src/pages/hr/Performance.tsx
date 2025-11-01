import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Target } from "lucide-react";
import ModalForm from "@/components/ModalForm";
import StatusTag, { getStatusVariant } from "@/components/StatusTag";
import { evaluations } from "@/data/mockData";

export default function Performance() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCreateRound = () => {
    alert("สร้างรอบประเมินใหม่ (Mock)");
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-app mb-2 font-display">
            ประเมินผลการทำงาน
          </h1>
          <p className="text-muted font-light">
            ระบบประเมินผลพนักงานรายไตรมาส
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-6 py-3 bg-ptt-blue hover:bg-ptt-blue/80 
                   text-app rounded-xl transition-all duration-200 font-semibold 
                   shadow-lg hover:shadow-xl hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5" />
          สร้างรอบใหม่
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-soft border border-app rounded-2xl p-6 shadow-xl"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-ptt-blue/20 rounded-lg">
              <Target className="w-5 h-5 text-ptt-cyan" />
            </div>
            <p className="text-muted text-sm font-light">รอบล่าสุด</p>
          </div>
          <p className="text-2xl font-bold text-app font-display">Q3 2025</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-soft border border-app rounded-2xl p-6 shadow-xl"
        >
          <p className="text-muted text-sm mb-1 font-light">จำนวนผู้ประเมิน</p>
          <p className="text-2xl font-bold text-app font-display">{evaluations.length}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-soft border border-app rounded-2xl p-6 shadow-xl"
        >
          <p className="text-muted text-sm mb-1 font-light">คะแนนเฉลี่ย</p>
          <p className="text-2xl font-bold text-app font-display">
            {(evaluations.reduce((sum, e) => sum + e.score, 0) / evaluations.length).toFixed(2)}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-soft border border-app rounded-2xl p-6 shadow-xl"
        >
          <p className="text-muted text-sm mb-1 font-light">ดีเยี่ยม</p>
          <p className="text-2xl font-bold text-ptt-cyan font-display">
            {evaluations.filter(e => e.status === "ดีเยี่ยม").length}
          </p>
        </motion.div>
      </div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-soft border border-app rounded-2xl overflow-hidden shadow-xl"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-soft border-b border-app">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                  รหัส
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                  ชื่อ-นามสกุล
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-slate-300">
                  รอบ
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-slate-300">
                  คะแนน
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-slate-300">
                  สถานะ
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                  ผู้ประเมิน
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {evaluations.map((evaluation, index) => (
                <motion.tr
                  key={evaluation.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-soft transition-colors"
                >
                  <td className="px-6 py-4 text-sm text-ptt-cyan font-medium">
                    {evaluation.empCode}
                  </td>
                  <td className="px-6 py-4 text-sm text-app font-medium">
                    {evaluation.empName}
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-slate-300 font-light">
                    {evaluation.round}/{evaluation.year}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-lg font-bold text-ptt-cyan font-mono">
                      {evaluation.score.toFixed(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <StatusTag variant={getStatusVariant(evaluation.status)}>
                      {evaluation.status}
                    </StatusTag>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-300 font-light">
                    {evaluation.evaluatedBy}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Create Round Modal */}
      <ModalForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="สร้างรอบประเมินใหม่"
        onSubmit={handleCreateRound}
        submitLabel="สร้างรอบ"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              รอบประเมิน
            </label>
            <select className="w-full px-4 py-2.5 bg-ink-800 border border-app rounded-xl text-app">
              <option value="Q1">Q1</option>
              <option value="Q2">Q2</option>
              <option value="Q3">Q3</option>
              <option value="Q4">Q4</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              ปี
            </label>
            <input
              type="number"
              defaultValue={2025}
              className="w-full px-4 py-2.5 bg-ink-800 border border-app rounded-xl text-app"
            />
          </div>
        </div>
      </ModalForm>
    </div>
  );
}

