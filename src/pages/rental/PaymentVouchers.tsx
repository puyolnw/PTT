import { motion } from "framer-motion";
import { FileText, Download, Plus, Eye, Building2, DollarSign } from "lucide-react";
import { useState } from "react";

const currencyFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 0,
});

// Mock data - Payment Vouchers
const mockPaymentVouchers = [
  {
    id: "PV-001",
    voucherNo: "PV-2024-001",
    date: "2024-12-15",
    payee: "เจ้าของที่ดิน A",
    description: "ค่าเช่าที่ดิน",
    branch: "สาขา A",
    amount: 20000,
    paymentMethod: "โอน",
    bankAccount: "123-456-7890",
    status: "approved",
    approvedBy: "ผู้จัดการใหญ่",
    approvedDate: "2024-12-15",
  },
  {
    id: "PV-002",
    voucherNo: "PV-2024-002",
    date: "2024-12-10",
    payee: "เจ้าของป้ายโฆษณา",
    description: "ค่าเช่าป้ายโฆษณา",
    branch: "สำนักงานใหญ่",
    amount: 15000,
    paymentMethod: "เช็ค",
    bankAccount: null,
    status: "pending",
    approvedBy: null,
    approvedDate: null,
  },
  {
    id: "PV-003",
    voucherNo: "PV-2024-003",
    date: "2024-12-05",
    payee: "เจ้าของที่ดิน B",
    description: "ค่าเช่าที่ดิน",
    branch: "สาขา B",
    amount: 25000,
    paymentMethod: "โอน",
    bankAccount: "987-654-3210",
    status: "approved",
    approvedBy: "ผู้จัดการใหญ่",
    approvedDate: "2024-12-05",
  },
];

export default function PaymentVouchers() {
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  const filteredVouchers = selectedStatus
    ? mockPaymentVouchers.filter(v => v.status === selectedStatus)
    : mockPaymentVouchers;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h2 className="text-3xl font-bold text-app mb-2 font-display">ใบสำคัญจ่าย</h2>
        <p className="text-muted font-light">
          ออกใบสำคัญจ่าย → บันทึกบัญชี สำหรับค่าเช่าที่ปั๊มจ่ายออก
        </p>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
            {mockPaymentVouchers.length}
          </p>
          <p className="text-xs text-muted mt-1">ใบสำคัญจ่าย</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="panel rounded-2xl p-6 shadow-app border-2 border-emerald-500/30"
        >
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="w-6 h-6 text-emerald-400" />
            <span className="text-xs text-muted">ยอดรวม</span>
          </div>
          <p className="text-2xl font-bold text-emerald-400">
            {currencyFormatter.format(
              mockPaymentVouchers.reduce((sum, v) => sum + v.amount, 0)
            )}
          </p>
          <p className="text-xs text-muted mt-1">บาท</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="panel rounded-2xl p-6 shadow-app"
        >
          <div className="flex items-center justify-between mb-4">
            <Building2 className="w-6 h-6 text-blue-400" />
            <span className="text-xs text-muted">รออนุมัติ</span>
          </div>
          <p className="text-2xl font-bold text-blue-400">
            {mockPaymentVouchers.filter(v => v.status === "pending").length}
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
          <option value="approved">อนุมัติแล้ว</option>
          <option value="pending">รออนุมัติ</option>
        </select>
        <button className="flex items-center gap-2 px-4 py-2 bg-ptt-blue/10 hover:bg-ptt-blue/20 border border-ptt-blue/30 rounded-xl text-ptt-cyan transition-colors">
          <Plus className="w-5 h-5" />
          <span>สร้างใบสำคัญจ่าย</span>
        </button>
      </div>

      {/* Vouchers List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="panel rounded-2xl p-6 shadow-app"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-app">รายการใบสำคัญจ่าย</h3>
            <p className="text-sm text-muted">
              {filteredVouchers.length} รายการ
            </p>
          </div>
          <FileText className="w-6 h-6 text-muted" />
        </div>
        <div className="space-y-3">
          {filteredVouchers.map((voucher) => (
            <div
              key={voucher.id}
              className={`p-4 rounded-xl border-2 ${
                voucher.status === "approved"
                  ? "bg-emerald-500/10 border-emerald-500/30"
                  : "bg-orange-500/10 border-orange-500/30"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-semibold text-app">{voucher.voucherNo}</h4>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      voucher.status === "approved"
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                    }`}>
                      {voucher.status === "approved" ? "อนุมัติแล้ว" : "รออนุมัติ"}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 text-sm mb-2">
                    <div>
                      <span className="text-muted">ผู้รับเงิน: </span>
                      <span className="text-app font-medium">{voucher.payee}</span>
                    </div>
                    <div>
                      <span className="text-muted">สาขา: </span>
                      <span className="text-app">{voucher.branch}</span>
                    </div>
                    <div>
                      <span className="text-muted">วันที่: </span>
                      <span className="text-app">
                        {new Date(voucher.date).toLocaleDateString("th-TH")}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted">ชำระด้วย: </span>
                      <span className="text-app">{voucher.paymentMethod}</span>
                    </div>
                  </div>
                  <div className="text-sm">
                    <p className="text-muted mb-1">{voucher.description}</p>
                    <div className="flex items-center gap-4">
                      <span className="text-muted">ยอดเงิน: </span>
                      <span className="text-xl font-bold text-ptt-cyan">
                        {currencyFormatter.format(voucher.amount)}
                      </span>
                      {voucher.bankAccount && (
                        <span className="text-xs text-muted">
                          บัญชี: {voucher.bankAccount}
                        </span>
                      )}
                    </div>
                    {voucher.approvedBy && (
                      <p className="text-xs text-muted mt-1">
                        อนุมัติโดย: {voucher.approvedBy} • {new Date(voucher.approvedDate!).toLocaleDateString("th-TH")}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button className="p-2 hover:bg-soft rounded-lg transition-colors" title="ดูรายละเอียด">
                    <Eye className="w-5 h-5 text-muted" />
                  </button>
                  <button className="p-2 hover:bg-soft rounded-lg transition-colors" title="ดาวน์โหลด PDF">
                    <Download className="w-5 h-5 text-muted" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

