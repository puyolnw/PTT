import { motion } from "framer-motion";
import { Receipt, Download, Plus, Eye, Building2, DollarSign } from "lucide-react";

const currencyFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 0,
});

// Mock data - Receipts
const mockReceipts = [
  {
    id: "RCP-001",
    receiptNo: "RCP-2024-001",
    date: "2024-12-15",
    payer: "เจ้าของที่ดิน A",
    description: "รับค่าเช่าที่ดิน",
    branch: "สาขา A",
    amount: 20000,
    paymentMethod: "โอน",
    bankAccount: "123-456-7890",
    status: "issued",
    issuedBy: "ผู้จัดการสาขา A",
  },
  {
    id: "RCP-002",
    receiptNo: "RCP-2024-002",
    date: "2024-12-10",
    payer: "เจ้าของป้ายโฆษณา",
    description: "รับค่าเช่าป้ายโฆษณา",
    branch: "สำนักงานใหญ่",
    amount: 15000,
    paymentMethod: "เช็ค",
    bankAccount: null,
    status: "issued",
    issuedBy: "ผู้จัดการใหญ่",
  },
];

export default function Receipts() {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h2 className="text-3xl font-bold text-app mb-2 font-display">ใบเสร็จรับเงิน</h2>
        <p className="text-muted font-light">
          ออกใบเสร็จรับเงินให้เจ้าของที่ดิน สำหรับค่าเช่าที่ปั๊มจ่ายออก
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
            <Receipt className="w-6 h-6 text-ptt-cyan" />
            <span className="text-xs text-muted">ทั้งหมด</span>
          </div>
          <p className="text-2xl font-bold text-app">
            {mockReceipts.length}
          </p>
          <p className="text-xs text-muted mt-1">ใบเสร็จ</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="panel rounded-2xl p-6 shadow-app"
        >
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="w-6 h-6 text-emerald-400" />
            <span className="text-xs text-muted">ยอดรวม</span>
          </div>
          <p className="text-2xl font-bold text-emerald-400">
            {currencyFormatter.format(
              mockReceipts.reduce((sum, r) => sum + r.amount, 0)
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
            <span className="text-xs text-muted">ออกแล้ว</span>
          </div>
          <p className="text-2xl font-bold text-blue-400">
            {mockReceipts.filter(r => r.status === "issued").length}
          </p>
          <p className="text-xs text-muted mt-1">ใบเสร็จ</p>
        </motion.div>
      </div>

      {/* Receipts List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="panel rounded-2xl p-6 shadow-app"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-app">รายการใบเสร็จรับเงิน</h3>
            <p className="text-sm text-muted">
              {mockReceipts.length} รายการ
            </p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-ptt-blue/10 hover:bg-ptt-blue/20 border border-ptt-blue/30 rounded-xl text-ptt-cyan transition-colors">
            <Plus className="w-5 h-5" />
            <span>ออกใบเสร็จใหม่</span>
          </button>
        </div>
        <div className="space-y-3">
          {mockReceipts.map((receipt) => (
            <div
              key={receipt.id}
              className="p-4 bg-soft rounded-xl border border-app hover:border-ptt-blue/30 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-semibold text-app">{receipt.receiptNo}</h4>
                    <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs border border-emerald-500/30">
                      ออกแล้ว
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 text-sm mb-2">
                    <div>
                      <span className="text-muted">ผู้จ่ายเงิน: </span>
                      <span className="text-app font-medium">{receipt.payer}</span>
                    </div>
                    <div>
                      <span className="text-muted">สาขา: </span>
                      <span className="text-app">{receipt.branch}</span>
                    </div>
                    <div>
                      <span className="text-muted">วันที่: </span>
                      <span className="text-app">
                        {new Date(receipt.date).toLocaleDateString("th-TH")}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted">ชำระด้วย: </span>
                      <span className="text-app">{receipt.paymentMethod}</span>
                    </div>
                  </div>
                  <div className="text-sm">
                    <p className="text-muted mb-1">{receipt.description}</p>
                    <div className="flex items-center gap-4">
                      <span className="text-muted">ยอดเงิน: </span>
                      <span className="text-xl font-bold text-ptt-cyan">
                        {currencyFormatter.format(receipt.amount)}
                      </span>
                      {receipt.bankAccount && (
                        <span className="text-xs text-muted">
                          บัญชี: {receipt.bankAccount}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted mt-1">
                      ออกโดย: {receipt.issuedBy}
                    </p>
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

