import { motion } from "framer-motion";
import { expenditures } from "@/data/mockData";
import { Plus, FileText } from "lucide-react";
import StatusTag, { getStatusVariant } from "@/components/StatusTag";

export default function Expenditures() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-ptt-cyan font-display">การเบิกจ่าย</h2>
          <p className="text-muted font-light">จัดการข้อมูลการเบิกจ่ายเงินกองทุน</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-ptt-red hover:bg-ptt-red/80 rounded-xl transition-colors">
          <Plus className="w-5 h-5" />
          <span>บันทึกการเบิกจ่าย</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="panel/40 border border-app rounded-2xl p-4">
        <div className="flex flex-wrap gap-3">
          <select className="px-3 py-2 bg-ink-800 border border-app rounded-lg text-sm">
            <option>แผนกทั้งหมด</option>
            <option>IT</option>
            <option>HR</option>
            <option>Account</option>
            <option>Marketing</option>
          </select>
          <select className="px-3 py-2 bg-ink-800 border border-app rounded-lg text-sm">
            <option>สถานะทั้งหมด</option>
            <option>อนุมัติแล้ว</option>
            <option>รออนุมัติ</option>
            <option>ไม่อนุมัติ</option>
          </select>
          <input
            type="date"
            className="px-3 py-2 bg-ink-800 border border-app rounded-lg text-sm"
          />
        </div>
      </div>

      {/* Expenditures Table */}
      <div className="panel/40 border border-app rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-ink-800/60">
              <tr className="border-b border-app">
                <th className="px-6 py-4 text-left text-sm font-semibold text-app">ผู้ขอเบิก</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-app">แผนก</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-app">จำนวนเงิน</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-app">วันที่</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-app">วัตถุประสงค์</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-app">ผู้อนุมัติ</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-app">สถานะ</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-app">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {expenditures.map((exp) => (
                <tr key={exp.id} className="hover:bg-soft transition-colors">
                  <td className="px-6 py-4 text-sm text-app font-medium">{exp.requestBy}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className="px-2 py-1 bg-ptt-blue/20 text-ptt-cyan rounded-lg text-xs">
                      {exp.dept}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-semibold text-ptt-red">
                    {exp.amount.toLocaleString()} ฿
                  </td>
                  <td className="px-6 py-4 text-sm text-muted">{exp.date}</td>
                  <td className="px-6 py-4 text-sm text-app">{exp.purpose}</td>
                  <td className="px-6 py-4 text-sm text-muted">
                    {exp.approvedBy || "-"}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <StatusTag variant={getStatusVariant(
                      exp.status === "Approved" ? "อนุมัติแล้ว" : 
                      exp.status === "Rejected" ? "ไม่อนุมัติ" : "รออนุมัติ"
                    )}>
                      {exp.status === "Approved" ? "อนุมัติแล้ว" : 
                       exp.status === "Rejected" ? "ไม่อนุมัติ" : "รออนุมัติ"}
                    </StatusTag>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button 
                      className="p-2 hover:bg-ink-800 rounded-lg transition-colors"
                      title="ดูใบเสร็จ"
                    >
                      <FileText className="w-4 h-4 text-muted" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      <div className="panel/40 border border-app rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <span className="text-app">ยอดรวมการเบิกจ่าย:</span>
          <span className="text-2xl font-bold text-ptt-red">
            {expenditures.reduce((sum, exp) => sum + exp.amount, 0).toLocaleString()} ฿
          </span>
        </div>
      </div>
    </motion.div>
  );
}

