import { useState } from "react";
import { motion } from "framer-motion";
import {
  CreditCard,
  Plus,
  DollarSign,
  Building,
  Calendar,
  Receipt,
} from "lucide-react";
import ModalForm from "@/components/ModalForm";
import FilterBar from "@/components/FilterBar";

const currencyFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 0,
});

const branches = ["สำนักงานใหญ่", "สาขา A", "สาขา B", "สาขา C", "สาขา D"];

// Mock data สำหรับการชำระเงิน
const initialPayments = [
  {
    id: "1",
    invoiceNumber: "INV-2024-10-001",
    shop: "FIT Auto",
    branch: "สำนักงานใหญ่",
    amount: 7000,
    date: "2024-10-05",
    method: "โอน",
    status: "ชำระแล้ว",
  },
  {
    id: "2",
    invoiceNumber: "INV-2024-10-002",
    shop: "Chester's",
    branch: "สาขา A",
    amount: 25000,
    date: "2024-10-05",
    method: "หักจากยอดขาย",
    status: "ชำระแล้ว",
  },
  {
    id: "3",
    invoiceNumber: "INV-2024-10-003",
    shop: "Quick",
    branch: "สาขา B",
    amount: 6000,
    date: "2024-10-04",
    method: "เงินสด",
    status: "ชำระแล้ว",
  },
];

export default function Payments() {
  const [payments, setPayments] = useState(initialPayments);
  const [searchQuery, setSearchQuery] = useState("");
  const [methodFilter, setMethodFilter] = useState("");
  const [branchFilter, setBranchFilter] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    invoiceNumber: "",
    shop: "",
    branch: "สำนักงานใหญ่",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    method: "เงินสด",
  });

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch = payment.shop.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMethod = !methodFilter || payment.method === methodFilter;
    const matchesBranch = !branchFilter || payment.branch === branchFilter;
    return matchesSearch && matchesMethod && matchesBranch;
  });

  const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);

  const handleAddPayment = () => {
    const newPayment = {
      id: String(payments.length + 1),
      ...formData,
      amount: Number(formData.amount),
      status: "ชำระแล้ว",
    };
    setPayments([newPayment, ...payments]);
    setIsAddModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      invoiceNumber: "",
      shop: "",
      branch: "สำนักงานใหญ่",
      amount: "",
      date: new Date().toISOString().split("T")[0],
      method: "เงินสด",
    });
  };

  const paymentMethods = Array.from(new Set(payments.map((p) => p.method)));

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h2 className="text-3xl font-bold text-app mb-2 font-display">การชำระเงิน - M2</h2>
        <p className="text-muted font-light">
          บันทึกการชำระเงินค่าเช่า (เงินสด / โอน / หักจากยอดขาย) ระบบจะส่งข้อมูลไป M6 อัตโนมัติ (เดบิต เงินสด, เครดิต รายได้ค่าเช่า)
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
            <CreditCard className="w-8 h-8 text-ptt-cyan" />
            <span className="text-sm text-muted">รายการทั้งหมด</span>
          </div>
          <p className="text-2xl font-bold text-app">{payments.length}</p>
          <p className="text-sm text-muted">รายการ</p>
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
          <p className="text-2xl font-bold text-app">{currencyFormatter.format(totalAmount)}</p>
          <p className="text-sm text-muted">บาท</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="panel rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <Receipt className="w-8 h-8 text-purple-400" />
            <span className="text-sm text-muted">เงินสด</span>
          </div>
          <p className="text-2xl font-bold text-app">
            {currencyFormatter.format(
              payments.filter((p) => p.method === "เงินสด").reduce((sum, p) => sum + p.amount, 0)
            )}
          </p>
          <p className="text-sm text-muted">บาท</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="panel rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <Building className="w-8 h-8 text-orange-400" />
            <span className="text-sm text-muted">หักจากยอดขาย</span>
          </div>
          <p className="text-2xl font-bold text-app">
            {currencyFormatter.format(
              payments.filter((p) => p.method === "หักจากยอดขาย").reduce((sum, p) => sum + p.amount, 0)
            )}
          </p>
          <p className="text-sm text-muted">บาท</p>
        </motion.div>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <FilterBar
          onSearch={setSearchQuery}
          filters={[
            {
              label: "วิธีชำระ",
              value: methodFilter,
              options: [{ value: "", label: "ทั้งหมด" }, ...paymentMethods.map((method) => ({ value: method, label: method }))],
              onChange: setMethodFilter,
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
          <span>บันทึกการชำระเงิน</span>
        </button>
      </div>

      {/* Payments List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="panel rounded-2xl p-6"
      >
        <div className="space-y-4">
          {filteredPayments.map((payment) => (
            <div
              key={payment.id}
              className="p-4 bg-soft rounded-xl border border-app hover:border-ptt-blue/30 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-semibold text-app">{payment.shop}</p>
                  <p className="text-sm text-muted">{payment.branch} • {payment.invoiceNumber}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-app">{currencyFormatter.format(payment.amount)}</p>
                  <div className="flex items-center gap-2 mt-1 justify-end">
                    <span className="text-xs px-2 py-1 rounded-full bg-ptt-blue/10 text-ptt-cyan border border-ptt-blue/30">
                      {payment.method}
                    </span>
                    <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      {payment.status}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted" />
                  <span className="text-muted">
                    วันที่: {new Date(payment.date).toLocaleDateString("th-TH", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <span className="text-xs text-muted">ส่งไป M6 อัตโนมัติ</span>
              </div>
            </div>
          ))}
          {filteredPayments.length === 0 && (
            <div className="text-center py-12 text-muted">
              ไม่พบข้อมูลการชำระเงิน
            </div>
          )}
        </div>
      </motion.div>

      {/* Add Payment Modal */}
      <ModalForm
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          resetForm();
        }}
        title="บันทึกการชำระเงิน"
        onSubmit={handleAddPayment}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-app mb-2">เลขที่ใบแจ้งหนี้</label>
            <input
              type="text"
              value={formData.invoiceNumber}
              onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
              className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
              placeholder="เช่น INV-2024-10-001"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-app mb-2">ชื่อร้าน</label>
            <input
              type="text"
              value={formData.shop}
              onChange={(e) => setFormData({ ...formData, shop: e.target.value })}
              className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-app mb-2">สาขา</label>
              <select
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
            <div>
              <label className="block text-sm font-medium text-app mb-2">วันที่ชำระ</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-app mb-2">จำนวนเงิน (บาท)</label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-app mb-2">วิธีชำระ</label>
              <select
                value={formData.method}
                onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
              >
                <option value="เงินสด">เงินสด</option>
                <option value="โอน">โอน</option>
                <option value="หักจากยอดขาย">หักจากยอดขาย</option>
              </select>
            </div>
          </div>
          <div className="p-3 bg-ptt-blue/10 rounded-lg border border-ptt-blue/20">
            <p className="text-xs text-ptt-cyan">
              <strong>หมายเหตุ:</strong> ระบบจะส่งข้อมูลไป M6 อัตโนมัติ (เดบิต เงินสด, เครดิต รายได้ค่าเช่า 4110)
            </p>
          </div>
        </div>
      </ModalForm>
    </div>
  );
}

