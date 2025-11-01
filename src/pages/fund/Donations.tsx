import { motion } from "framer-motion";
import { donations } from "@/data/mockData";
import { Plus, FileText } from "lucide-react";
import StatusTag, { getStatusVariant } from "@/components/StatusTag";

export default function Donations() {
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
          <h2 className="text-2xl font-semibold text-ptt-cyan font-display">การบริจาค</h2>
          <p className="text-muted font-light">จัดการข้อมูลผู้บริจาคและรายการบริจาค</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-ptt-blue hover:bg-ptt-blue/80 rounded-xl transition-colors">
          <Plus className="w-5 h-5" />
          <span>บันทึกการบริจาค</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="panel/40 border border-app rounded-2xl p-4">
        <div className="flex flex-wrap gap-3">
          <select className="px-3 py-2 bg-ink-800 border border-app rounded-lg text-sm">
            <option>ทั้งหมด</option>
            <option>บุคคล</option>
            <option>บริษัท</option>
          </select>
          <select className="px-3 py-2 bg-ink-800 border border-app rounded-lg text-sm">
            <option>สถานะทั้งหมด</option>
            <option>ยืนยันแล้ว</option>
            <option>รอดำเนินการ</option>
          </select>
          <input
            type="date"
            className="px-3 py-2 bg-ink-800 border border-app rounded-lg text-sm"
          />
        </div>
      </div>

      {/* Donations Table */}
      <div className="panel/40 border border-app rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-ink-800/60">
              <tr className="border-b border-app">
                <th className="px-6 py-4 text-left text-sm font-semibold text-app">เลขที่ใบเสร็จ</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-app">ผู้บริจาค</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-app">ประเภท</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-app">จำนวนเงิน</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-app">วันที่</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-app">วัตถุประสงค์</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-app">สถานะ</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-app">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {donations.map((d) => (
                <tr key={d.id} className="hover:bg-soft transition-colors">
                  <td className="px-6 py-4 text-sm text-app font-mono">{d.receiptNo}</td>
                  <td className="px-6 py-4 text-sm text-app font-medium">{d.donorName}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-1 rounded-lg text-xs ${
                      d.donorType === "Company" 
                        ? "bg-ptt-blue/20 text-ptt-cyan" 
                        : "bg-purple-500/20 text-purple-300"
                    }`}>
                      {d.donorType === "Company" ? "บริษัท" : "บุคคล"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-semibold text-green-400">
                    {d.amount.toLocaleString()} ฿
                  </td>
                  <td className="px-6 py-4 text-sm text-muted">{d.date}</td>
                  <td className="px-6 py-4 text-sm text-app">{d.purpose}</td>
                  <td className="px-6 py-4 text-center">
                    <StatusTag variant={getStatusVariant(d.status === "Confirmed" ? "อนุมัติแล้ว" : "รออนุมัติ")}>
                      {d.status === "Confirmed" ? "ยืนยันแล้ว" : "รอดำเนินการ"}
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
          <span className="text-app">ยอดรวมรายการบริจาค:</span>
          <span className="text-2xl font-bold text-green-400">
            {donations.reduce((sum, d) => sum + d.amount, 0).toLocaleString()} ฿
          </span>
        </div>
      </div>
    </motion.div>
  );
}

