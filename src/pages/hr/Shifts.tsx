import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Clock } from "lucide-react";
import ModalForm from "@/components/ModalForm";
import { shifts } from "@/data/mockData";

export default function Shifts() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddShift = () => {
    alert("เพิ่มกะการทำงานใหม่ (Mock)");
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-app mb-2 font-display">
            จัดการกะการทำงาน
          </h1>
          <p className="text-muted font-light">
            กำหนดและจัดการกะการทำงาน
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-6 py-3 bg-ptt-blue hover:bg-ptt-blue/80 
                   text-app rounded-xl transition-all duration-200 font-semibold 
                   shadow-lg hover:shadow-xl hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5" />
          เพิ่มกะใหม่
        </button>
      </div>

      {/* Shifts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {shifts.map((shift, index) => (
          <motion.div
            key={shift.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-soft border border-app rounded-2xl p-6 shadow-xl 
                     hover:border-ptt-blue/30 transition-all duration-200 hover:-translate-y-1"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-ptt-blue/20 rounded-xl">
                <Clock className="w-6 h-6 text-ptt-cyan" strokeWidth={1.5} />
              </div>
              <span className="text-xs text-muted font-light">ID: {shift.id}</span>
            </div>

            <h3 className="text-xl font-bold text-app mb-2 font-display">
              กะ{shift.name}
            </h3>
            
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">เวลาเริ่ม:</span>
                <span className="text-app font-mono font-medium">{shift.startTime}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">เวลาสิ้นสุด:</span>
                <span className="text-app font-mono font-medium">{shift.endTime}</span>
              </div>
            </div>

            {shift.description && (
              <p className="text-sm text-muted font-light">
                {shift.description}
              </p>
            )}

            <div className="mt-4 pt-4 border-t border-app flex gap-2">
              <button
                className="flex-1 px-4 py-2 text-sm bg-ink-800 hover:bg-ink-700 
                         text-slate-200 rounded-lg transition-colors font-medium"
              >
                แก้ไข
              </button>
              <button
                className="flex-1 px-4 py-2 text-sm bg-ptt-red/20 hover:bg-ptt-red/30 
                         text-ptt-red rounded-lg transition-colors font-medium"
              >
                ลบ
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add Shift Modal */}
      <ModalForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="เพิ่มกะการทำงานใหม่"
        onSubmit={handleAddShift}
        submitLabel="เพิ่มกะ"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              ชื่อกะ
            </label>
            <input
              type="text"
              placeholder="เช่น กะเช้า"
              className="w-full px-4 py-2.5 bg-ink-800 border border-app rounded-xl
                       text-app placeholder:text-muted
                       focus:outline-none focus:ring-2 focus:ring-ptt-blue"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                เวลาเริ่ม
              </label>
              <input
                type="time"
                className="w-full px-4 py-2.5 bg-ink-800 border border-app rounded-xl
                         text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                เวลาสิ้นสุด
              </label>
              <input
                type="time"
                className="w-full px-4 py-2.5 bg-ink-800 border border-app rounded-xl
                         text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              คำอธิบาย
            </label>
            <textarea
              rows={3}
              placeholder="รายละเอียดเพิ่มเติม..."
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

