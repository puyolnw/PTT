import { motion } from "framer-motion";
import { FileText, CheckCircle, XCircle, Clock, Plus, Eye, AlertCircle } from "lucide-react";
import { useState } from "react";

const currencyFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat("th-TH");

// Mock data - Requisitions
const mockRequisitions = [
  {
    id: "REQ-001",
    branch: "สาขา A",
    requestedBy: "ผู้จัดการสาขา A",
    requestedDate: "2024-12-14",
    fuelType: "Gasohol 95",
    quantity: 50000, // ลิตร
    unitPrice: 38.00,
    totalAmount: 1900000,
    status: "pending",
    approvedBy: null,
    approvedDate: null,
    notes: "สต็อกใกล้หมด ต้องเติมก่อน 20 ธ.ค.",
  },
  {
    id: "REQ-002",
    branch: "สาขา B",
    requestedBy: "ผู้จัดการสาขา B",
    requestedDate: "2024-12-13",
    fuelType: "Diesel",
    quantity: 30000,
    unitPrice: 33.00,
    totalAmount: 990000,
    status: "approved",
    approvedBy: "ผู้จัดการใหญ่",
    approvedDate: "2024-12-13",
    notes: "อนุมัติแล้ว ส่งมอบ 15 ธ.ค.",
  },
  {
    id: "REQ-003",
    branch: "สาขา C",
    requestedBy: "ผู้จัดการสาขา C",
    requestedDate: "2024-12-12",
    fuelType: "Premium Gasohol 95",
    quantity: 20000,
    unitPrice: 40.00,
    totalAmount: 800000,
    status: "rejected",
    approvedBy: "ผู้จัดการใหญ่",
    approvedDate: "2024-12-12",
    notes: "ปฏิเสธ - สต็อกยังเพียงพอ",
  },
];

export default function Requisitions() {
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  const filteredRequisitions = selectedStatus
    ? mockRequisitions.filter(r => r.status === selectedStatus)
    : mockRequisitions;

  const statusCounts = {
    pending: mockRequisitions.filter(r => r.status === "pending").length,
    approved: mockRequisitions.filter(r => r.status === "approved").length,
    rejected: mockRequisitions.filter(r => r.status === "rejected").length,
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h2 className="text-3xl font-bold text-app mb-2 font-display">ระบบสั่งซื้อน้ำมัน (Requisition)</h2>
        <p className="text-muted font-light">
          สาขาเสนอคำสั่งซื้อ → HQ อนุมัติ → บันทึกลูกหนี้
        </p>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="panel rounded-2xl p-6 shadow-app"
        >
          <div className="flex items-center justify-between mb-4">
            <FileText className="w-6 h-6 text-ptt-cyan" />
            <span className="text-xs text-muted">ทั้งหมด</span>
          </div>
          <p className="text-2xl font-bold text-app">
            {mockRequisitions.length}
          </p>
          <p className="text-xs text-muted mt-1">รายการ</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="panel rounded-2xl p-6 shadow-app border-2 border-orange-500/30"
        >
          <div className="flex items-center justify-between mb-4">
            <Clock className="w-6 h-6 text-orange-400" />
            <span className="text-xs text-muted">รออนุมัติ</span>
          </div>
          <p className="text-2xl font-bold text-orange-400">
            {statusCounts.pending}
          </p>
          <p className="text-xs text-muted mt-1">รายการ</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="panel rounded-2xl p-6 shadow-app border-2 border-emerald-500/30"
        >
          <div className="flex items-center justify-between mb-4">
            <CheckCircle className="w-6 h-6 text-emerald-400" />
            <span className="text-xs text-muted">อนุมัติแล้ว</span>
          </div>
          <p className="text-2xl font-bold text-emerald-400">
            {statusCounts.approved}
          </p>
          <p className="text-xs text-muted mt-1">รายการ</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="panel rounded-2xl p-6 shadow-app border-2 border-red-500/30"
        >
          <div className="flex items-center justify-between mb-4">
            <XCircle className="w-6 h-6 text-red-400" />
            <span className="text-xs text-muted">ปฏิเสธ</span>
          </div>
          <p className="text-2xl font-bold text-red-400">
            {statusCounts.rejected}
          </p>
          <p className="text-xs text-muted mt-1">รายการ</p>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <select
          value={selectedStatus || ""}
          onChange={(e) => setSelectedStatus(e.target.value || null)}
          className="px-4 py-2 bg-soft border border-app rounded-xl text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue/30"
        >
          <option value="">ทุกสถานะ</option>
          <option value="pending">รออนุมัติ</option>
          <option value="approved">อนุมัติแล้ว</option>
          <option value="rejected">ปฏิเสธ</option>
        </select>
        <button className="flex items-center gap-2 px-4 py-2 bg-ptt-blue/10 hover:bg-ptt-blue/20 border border-ptt-blue/30 rounded-xl text-ptt-cyan transition-colors">
          <Plus className="w-5 h-5" />
          <span>สร้างคำสั่งซื้อใหม่</span>
        </button>
      </div>

      {/* Requisitions List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="panel rounded-2xl p-6 shadow-app"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-app">รายการคำสั่งซื้อ</h3>
            <p className="text-sm text-muted">
              {filteredRequisitions.length} รายการ
            </p>
          </div>
          <FileText className="w-6 h-6 text-muted" />
        </div>
        <div className="space-y-3">
          {filteredRequisitions.map((req) => (
            <div
              key={req.id}
              className={`p-4 rounded-xl border-2 ${
                req.status === "pending"
                  ? "bg-orange-500/10 border-orange-500/30"
                  : req.status === "approved"
                  ? "bg-emerald-500/10 border-emerald-500/30"
                  : "bg-red-500/10 border-red-500/30"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-semibold text-app">{req.id}</h4>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      req.status === "pending"
                        ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                        : req.status === "approved"
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-red-500/20 text-red-400 border border-red-500/30"
                    }`}>
                      {req.status === "pending" ? "รออนุมัติ" : req.status === "approved" ? "อนุมัติแล้ว" : "ปฏิเสธ"}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 text-sm mb-2">
                    <div>
                      <span className="text-muted">สาขา: </span>
                      <span className="text-app font-medium">{req.branch}</span>
                    </div>
                    <div>
                      <span className="text-muted">ชนิดน้ำมัน: </span>
                      <span className="text-app font-medium">{req.fuelType}</span>
                    </div>
                    <div>
                      <span className="text-muted">จำนวน: </span>
                      <span className="text-app font-medium">
                        {numberFormatter.format(req.quantity)} ลิตร
                      </span>
                    </div>
                    <div>
                      <span className="text-muted">มูลค่ารวม: </span>
                      <span className="text-app font-bold">
                        {currencyFormatter.format(req.totalAmount)}
                      </span>
                    </div>
                  </div>
                  <div className="text-xs text-muted space-y-1">
                    <p>
                      ขอโดย: {req.requestedBy} • วันที่: {new Date(req.requestedDate).toLocaleDateString("th-TH")}
                    </p>
                    {req.approvedBy && (
                      <p>
                        อนุมัติโดย: {req.approvedBy} • วันที่: {new Date(req.approvedDate!).toLocaleDateString("th-TH")}
                      </p>
                    )}
                    {req.notes && (
                      <p className="text-orange-400/80">
                        <strong>หมายเหตุ:</strong> {req.notes}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  {req.status === "pending" && (
                    <>
                      <button className="p-2 hover:bg-emerald-500/10 rounded-lg transition-colors" title="อนุมัติ">
                        <CheckCircle className="w-5 h-5 text-emerald-400" />
                      </button>
                      <button className="p-2 hover:bg-red-500/10 rounded-lg transition-colors" title="ปฏิเสธ">
                        <XCircle className="w-5 h-5 text-red-400" />
                      </button>
                    </>
                  )}
                  <button className="p-2 hover:bg-soft rounded-lg transition-colors" title="ดูรายละเอียด">
                    <Eye className="w-5 h-5 text-muted" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {filteredRequisitions.length === 0 && (
            <div className="text-center py-8 text-muted">
              ไม่พบรายการคำสั่งซื้อ
            </div>
          )}
        </div>
      </motion.div>

      {/* Workflow Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="panel rounded-2xl p-6 shadow-app bg-gradient-to-br from-ptt-blue/10 to-ptt-cyan/10 border border-ptt-blue/30"
      >
        <div className="flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-ptt-cyan mt-0.5" />
          <div>
            <h4 className="font-semibold text-app mb-2">ขั้นตอนการอนุมัติ (Workflow)</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-muted">
              <li>สาขาเสนอคำสั่งซื้อ → ระบุชนิดน้ำมัน, จำนวน, หมายเหตุ</li>
              <li>HQ ตรวจสอบ → ดูสต็อกปัจจุบัน, ประวัติการสั่งซื้อ</li>
              <li>HQ อนุมัติ/ปฏิเสธ → บันทึกเหตุผล</li>
              <li>ระบบบันทึกลูกหนี้ → ส่งข้อมูลไป M6 (บัญชี) อัตโนมัติ</li>
              <li>จัดส่งน้ำมัน → อัปเดตสต็อกเมื่อได้รับ</li>
            </ol>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

