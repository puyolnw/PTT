import { motion } from "framer-motion";
import { History, Download, User, Calendar, FileText } from "lucide-react";
import { useState } from "react";

// Mock data - Audit Trail
const mockAuditTrail = [
  {
    id: "AUDIT-001",
    timestamp: "2024-12-15T10:30:00",
    user: "ผู้ดูแลระบบ",
    action: "สร้าง",
    module: "Journal Entry",
    recordId: "JE-001",
    description: "M1 ขายน้ำมัน 500,000 บาท",
    changes: null,
    ipAddress: "192.168.1.100",
  },
  {
    id: "AUDIT-002",
    timestamp: "2024-12-15T09:15:00",
    user: "บัญชี 01",
    action: "แก้ไข",
    module: "Chart of Accounts",
    recordId: "4110",
    description: "แก้ไขชื่อบัญชี: รายได้ → รายได้รวม",
    changes: {
      before: { name: "รายได้" },
      after: { name: "รายได้รวม" },
    },
    ipAddress: "192.168.1.101",
  },
  {
    id: "AUDIT-003",
    timestamp: "2024-12-14T16:45:00",
    user: "ผู้ดูแลระบบ",
    action: "ลบ",
    module: "Journal Entry",
    recordId: "JE-099",
    description: "ลบรายการบัญชีที่ผิดพลาด",
    changes: null,
    ipAddress: "192.168.1.100",
  },
  {
    id: "AUDIT-004",
    timestamp: "2024-12-14T14:20:00",
    user: "บัญชี 02",
    action: "ปิดงบดุล",
    module: "Month End Closing",
    recordId: "CLOSE-2024-10",
    description: "ปิดงบดุลเดือนตุลาคม 2568",
    changes: null,
    ipAddress: "192.168.1.102",
  },
  {
    id: "AUDIT-005",
    timestamp: "2024-12-13T11:30:00",
    user: "ผู้ดูแลระบบ",
    action: "กระทบยอด",
    module: "Bank Reconciliation",
    recordId: "RECON-2024-10",
    description: "กระทบยอดธนาคารเดือนตุลาคม 2568",
    changes: {
      before: { matchRate: 98.5 },
      after: { matchRate: 99.8 },
    },
    ipAddress: "192.168.1.100",
  },
];

export default function AuditTrail() {
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<string>("");

  const modules = Array.from(new Set(mockAuditTrail.map(a => a.module)));
  const actions = Array.from(new Set(mockAuditTrail.map(a => a.action)));

  const filteredTrail = mockAuditTrail.filter(entry => {
    const matchesModule = !selectedModule || entry.module === selectedModule;
    const matchesAction = !selectedAction || entry.action === selectedAction;
    const matchesDate = !dateFilter || entry.timestamp.startsWith(dateFilter);
    return matchesModule && matchesAction && matchesDate;
  });

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h2 className="text-3xl font-bold text-app mb-2 font-display">Audit Trail</h2>
        <p className="text-muted font-light">
          บันทึกประวัติทุกธุรกรรมเพื่อตรวจสอบย้อนหลัง พร้อมรายงานสำหรับผู้ตรวจสอบบัญชี
        </p>
      </motion.div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="pl-10 pr-4 py-2 bg-soft border border-app rounded-xl text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue/30"
          />
        </div>
        <select
          value={selectedModule || ""}
          onChange={(e) => setSelectedModule(e.target.value || null)}
          className="px-4 py-2 bg-soft border border-app rounded-xl text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue/30"
        >
          <option value="">ทุกโมดูล</option>
          {modules.map(module => (
            <option key={module} value={module}>{module}</option>
          ))}
        </select>
        <select
          value={selectedAction || ""}
          onChange={(e) => setSelectedAction(e.target.value || null)}
          className="px-4 py-2 bg-soft border border-app rounded-xl text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue/30"
        >
          <option value="">ทุกการกระทำ</option>
          {actions.map(action => (
            <option key={action} value={action}>{action}</option>
          ))}
        </select>
        <button className="flex items-center gap-2 px-4 py-2 bg-ptt-blue/10 hover:bg-ptt-blue/20 border border-ptt-blue/30 rounded-xl text-ptt-cyan transition-colors">
          <Download className="w-5 h-5" />
          <span>ส่งออก</span>
        </button>
      </div>

      {/* Audit Trail List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="panel rounded-2xl p-6 shadow-app"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-app">ประวัติการเปลี่ยนแปลง</h3>
            <p className="text-sm text-muted">
              {filteredTrail.length} รายการ
            </p>
          </div>
          <History className="w-6 h-6 text-muted" />
        </div>
        <div className="space-y-3">
          {filteredTrail.map((entry) => (
            <div
              key={entry.id}
              className="p-4 bg-soft rounded-xl border border-app hover:border-ptt-blue/30 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      entry.action === "สร้าง"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                        : entry.action === "แก้ไข"
                        ? "bg-blue-500/10 text-blue-400 border border-blue-500/30"
                        : entry.action === "ลบ"
                        ? "bg-red-500/10 text-red-400 border border-red-500/30"
                        : "bg-purple-500/10 text-purple-400 border border-purple-500/30"
                    }`}>
                      {entry.action}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-ptt-blue/10 text-ptt-cyan text-xs">
                      {entry.module}
                    </span>
                    <span className="text-xs text-muted font-mono">
                      {entry.recordId}
                    </span>
                  </div>
                  <p className="font-medium text-app mb-1">{entry.description}</p>
                  {entry.changes && (
                    <div className="mt-2 p-3 bg-app/50 rounded-lg border border-app">
                      <p className="text-xs text-muted mb-1">การเปลี่ยนแปลง:</p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-red-400">ก่อน: </span>
                          <span className="text-app">{JSON.stringify(entry.changes.before)}</span>
                        </div>
                        <div>
                          <span className="text-emerald-400">หลัง: </span>
                          <span className="text-app">{JSON.stringify(entry.changes.after)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-muted">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    <span>{entry.user}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>
                      {new Date(entry.timestamp).toLocaleString("th-TH", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FileText className="w-3 h-3" />
                    <span>IP: {entry.ipAddress}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {filteredTrail.length === 0 && (
            <div className="text-center py-8 text-muted">
              ไม่พบข้อมูล Audit Trail
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

