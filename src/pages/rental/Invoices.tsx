import { useState } from "react";
import { motion } from "framer-motion";
import {
  Receipt,
  Plus,
  Download,
  FileText,
  Building,
  DollarSign,
  Calendar,
} from "lucide-react";
import ModalForm from "@/components/ModalForm";
import FilterBar from "@/components/FilterBar";

const currencyFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 0,
});

const branches = ["สำนักงานใหญ่", "สาขา A", "สาขา B", "สาขา C", "สาขา D"];

// Mock data สำหรับใบแจ้งหนี้
const initialInvoices = [
  {
    id: "1",
    invoiceNumber: "INV-2024-10-001",
    shop: "FIT Auto",
    branch: "สำนักงานใหญ่",
    month: "ตุลาคม 2568",
    amount: 7000,
    status: "ชำระแล้ว",
    dueDate: "2024-10-05",
    paidDate: "2024-10-05",
    rentType: "คงที่",
  },
  {
    id: "2",
    invoiceNumber: "INV-2024-10-002",
    shop: "Chester's",
    branch: "สาขา A",
    month: "ตุลาคม 2568",
    amount: 25000,
    status: "ชำระแล้ว",
    dueDate: "2024-10-05",
    paidDate: "2024-10-05",
    rentType: "% จากยอดขาย",
    salesAmount: 500000,
    percentage: 5,
  },
  {
    id: "3",
    invoiceNumber: "INV-2024-10-003",
    shop: "Daiso",
    branch: "สาขา A",
    month: "ตุลาคม 2568",
    amount: 4000,
    status: "ค้างชำระ",
    dueDate: "2024-10-05",
    paidDate: null,
    rentType: "คงที่",
  },
];

export default function Invoices() {
  const [invoices, setInvoices] = useState(initialInvoices);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [branchFilter, setBranchFilter] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    shop: "",
    branch: "สำนักงานใหญ่",
    month: "",
    amount: "",
    dueDate: "",
    rentType: "คงที่",
  });

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch = invoice.shop.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !statusFilter || invoice.status === statusFilter;
    const matchesBranch = !branchFilter || invoice.branch === branchFilter;
    return matchesSearch && matchesStatus && matchesBranch;
  });

  const pendingAmount = invoices
    .filter((inv) => inv.status === "ค้างชำระ")
    .reduce((sum, inv) => sum + inv.amount, 0);

  const handleAddInvoice = () => {
    const newInvoice = {
      id: String(invoices.length + 1),
      invoiceNumber: `INV-${formData.month.replace(/\s/g, "-")}-${String(invoices.length + 1).padStart(3, "0")}`,
      ...formData,
      amount: Number(formData.amount),
      status: "ค้างชำระ",
      paidDate: null,
      rentType: formData.rentType,
    };
    setInvoices([newInvoice, ...invoices]);
    setIsAddModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      shop: "",
      branch: "สำนักงานใหญ่",
      month: "",
      amount: "",
      dueDate: "",
      rentType: "คงที่",
    });
  };

  const handleDownloadPDF = (invoice: typeof initialInvoices[0]) => {
    alert(`กำลังดาวน์โหลดใบแจ้งหนี้ ${invoice.invoiceNumber} เป็น PDF...`);
  };

  const statuses = Array.from(new Set(invoices.map((inv) => inv.status)));

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h2 className="text-3xl font-bold text-app mb-2 font-display">ใบแจ้งหนี้ - M2</h2>
        <p className="text-muted font-light">
          สร้างใบแจ้งหนี้ PDF รายเดือนสำหรับค่าเช่า (เช่น &quot;ใบแจ้งหนี้ค่าเช่า ต.ค. 2568&quot;) คำนวณอัตโนมัติจากสัญญาเช่า (คงที่ หรือ % จากยอดขาย)
        </p>
      </motion.div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="panel rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <Receipt className="w-8 h-8 text-ptt-cyan" />
            <span className="text-sm text-muted">ใบแจ้งหนี้ทั้งหมด</span>
          </div>
          <p className="text-2xl font-bold text-app">{invoices.length}</p>
          <p className="text-sm text-muted">ใบ</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="panel rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="w-8 h-8 text-emerald-400" />
            <span className="text-sm text-muted">ยอดรวม</span>
          </div>
          <p className="text-2xl font-bold text-app">
            {currencyFormatter.format(invoices.reduce((sum, inv) => sum + inv.amount, 0))}
          </p>
          <p className="text-sm text-muted">บาท</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="panel rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <FileText className="w-8 h-8 text-orange-400" />
            <span className="text-sm text-muted">ค้างชำระ</span>
          </div>
          <p className="text-2xl font-bold text-orange-400">{currencyFormatter.format(pendingAmount)}</p>
          <p className="text-sm text-muted">
            {invoices.filter((inv) => inv.status === "ค้างชำระ").length} ใบ
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="panel rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <Building className="w-8 h-8 text-purple-400" />
            <span className="text-sm text-muted">ชำระแล้ว</span>
          </div>
          <p className="text-2xl font-bold text-app">
            {invoices.filter((inv) => inv.status === "ชำระแล้ว").length}
          </p>
          <p className="text-sm text-muted">ใบ</p>
        </motion.div>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <FilterBar
          onSearch={setSearchQuery}
          filters={[
            {
              label: "สถานะ",
              value: statusFilter,
              options: [{ value: "", label: "ทั้งหมด" }, ...statuses.map((status) => ({ value: status, label: status }))],
              onChange: setStatusFilter,
            },
            {
              label: "สาขา",
              value: branchFilter,
              options: [{ value: "", label: "ทั้งหมด" }, ...branches.map((branch) => ({ value: branch, label: branch }))],
              onChange: setBranchFilter,
            },
          ]}
        />

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-ptt-blue text-white rounded-lg hover:bg-ptt-blue/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>สร้างใบแจ้งหนี้</span>
        </button>
      </div>

      {/* Invoices List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="panel rounded-2xl p-6"
      >
        <div className="space-y-4">
          {filteredInvoices.map((invoice) => (
            <div
              key={invoice.id}
              className={`p-4 rounded-xl border ${invoice.status === "ค้างชำระ"
                ? "bg-orange-500/10 border-orange-500/30"
                : "bg-soft border-app"
                } hover:border-ptt-blue/30 transition-colors`}
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-semibold text-app">{invoice.invoiceNumber}</p>
                  <p className="text-sm text-muted">{invoice.shop} • {invoice.branch}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-app">{currencyFormatter.format(invoice.amount)}</p>
                  <div className="flex items-center gap-2 mt-1 justify-end">
                    <span className={`text-xs px-2 py-1 rounded-full ${invoice.status === "ชำระแล้ว"
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                      : "bg-orange-500/10 text-orange-400 border border-orange-500/30"
                      }`}>
                      {invoice.status}
                    </span>
                    <span className="text-xs px-2 py-1 rounded-full bg-ptt-blue/10 text-ptt-cyan border border-ptt-blue/30">
                      {invoice.rentType}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted" />
                  <span className="text-muted">{invoice.month}</span>
                  {invoice.rentType === "% จากยอดขาย" && invoice.salesAmount && (
                    <span className="text-xs text-muted">
                      (ยอดขาย: {currencyFormatter.format(invoice.salesAmount)} × {invoice.percentage}%)
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {invoice.status === "ค้างชำระ" && (
                    <span className="text-xs text-orange-400">
                      ครบกำหนด: {new Date(invoice.dueDate).toLocaleDateString("th-TH")}
                    </span>
                  )}
                  {invoice.status === "ชำระแล้ว" && invoice.paidDate && (
                    <span className="text-xs text-muted">
                      ชำระ: {new Date(invoice.paidDate).toLocaleDateString("th-TH")}
                    </span>
                  )}
                  <button
                    onClick={() => handleDownloadPDF(invoice)}
                    className="p-1.5 hover:bg-soft rounded-lg transition-colors"
                    title="ดาวน์โหลด PDF"
                  >
                    <Download className="w-4 h-4 text-ptt-cyan" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {filteredInvoices.length === 0 && (
            <div className="text-center py-12 text-muted">
              ไม่พบข้อมูลใบแจ้งหนี้
            </div>
          )}
        </div>
      </motion.div>

      {/* Add Invoice Modal */}
      <ModalForm
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          resetForm();
        }}
        title="สร้างใบแจ้งหนี้"
        onSubmit={handleAddInvoice}
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="invoice-shop" className="block text-sm font-medium text-app mb-2">ชื่อร้าน</label>
            <input
              id="invoice-shop"
              type="text"
              value={formData.shop}
              onChange={(e) => setFormData({ ...formData, shop: e.target.value })}
              className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
              placeholder="เช่น FIT Auto, Chester's, Daiso"
              required
            />
          </div>
          <div>
            <label htmlFor="invoice-branch" className="block text-sm font-medium text-app mb-2">สาขา</label>
            <select
              id="invoice-branch"
              value={formData.branch}
              onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
              className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
            >
              {branches.map((branch) => (
                <option key={branch} value={branch}>
                  {branch}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="invoice-month" className="block text-sm font-medium text-app mb-2">เดือน</label>
              <input
                id="invoice-month"
                type="text"
                value={formData.month}
                onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
                placeholder="เช่น ตุลาคม 2568"
                required
              />
            </div>
            <div>
              <label htmlFor="invoice-due-date" className="block text-sm font-medium text-app mb-2">ครบกำหนดชำระ</label>
              <input
                id="invoice-due-date"
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
                required
              />
            </div>
          </div>
          <div>
            <label htmlFor="invoice-rent-type" className="block text-sm font-medium text-app mb-2">ประเภทค่าเช่า</label>
            <select
              id="invoice-rent-type"
              value={formData.rentType}
              onChange={(e) => setFormData({ ...formData, rentType: e.target.value })}
              className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
            >
              <option value="คงที่">คงที่</option>
              <option value="% จากยอดขาย">% จากยอดขาย (ดึงจาก M1)</option>
            </select>
          </div>
          <div>
            <label htmlFor="invoice-amount" className="block text-sm font-medium text-app mb-2">จำนวนเงิน (บาท)</label>
            <input
              id="invoice-amount"
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
              placeholder="ระบบจะคำนวณอัตโนมัติจากสัญญาเช่า"
              required
            />
            {formData.rentType === "% จากยอดขาย" && (
              <p className="text-xs text-muted mt-1">ระบบจะดึงยอดขายจาก M1 และคำนวณอัตโนมัติ</p>
            )}
          </div>
        </div>
      </ModalForm>
    </div>
  );
}

