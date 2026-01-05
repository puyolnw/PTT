import { useState } from "react";
import { motion } from "framer-motion";
import {
  RotateCcw,
  Plus,
  Edit,
  Trash2,
  DollarSign,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { useShop } from "@/contexts/ShopContext";
import ModalForm from "@/components/ModalForm";
import FilterBar from "@/components/FilterBar";

const currencyFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat("th-TH");

// Mock data สำหรับการคืนสินค้า
const initialReturns = [
  {
    id: "1",
    date: "2024-12-15",
    product: "ข้าวตังหน้าหมูหยอง",
    quantity: 2,
    unit: "ชิ้น",
    reason: "สินค้าเสียหาย",
    originalSaleDate: "2024-12-14",
    originalSaleAmount: 160,
    refundAmount: 160,
    status: "approved",
    approvedBy: "ผู้จัดการ",
    stockAdjusted: true,
  },
  {
    id: "2",
    date: "2024-12-14",
    product: "ติ่มซำชุดใหญ่",
    quantity: 1,
    unit: "ชุด",
    reason: "ลูกค้าไม่พอใจ",
    originalSaleDate: "2024-12-13",
    originalSaleAmount: 150,
    refundAmount: 150,
    status: "pending",
    approvedBy: "",
    stockAdjusted: false,
  },
  {
    id: "3",
    date: "2024-12-13",
    product: "หมูหยอง",
    quantity: 1,
    unit: "ถุง",
    reason: "สินค้าหมดอายุ",
    originalSaleDate: "2024-12-10",
    originalSaleAmount: 200,
    refundAmount: 200,
    status: "approved",
    approvedBy: "ผู้จัดการ",
    stockAdjusted: true,
  },
];

export default function ProductReturns() {
  const { currentShop } = useShop();
  const shopName = currentShop?.name || "ร้านเจ้าสัว (Chaosua's)";

  const [returns, setReturns] = useState(initialReturns);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState<typeof initialReturns[0] | null>(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    product: "",
    quantity: "",
    unit: "ชิ้น",
    reason: "",
    originalSaleDate: "",
    originalSaleAmount: "",
    refundAmount: "",
  });

  // Filter returns
  const filteredReturns = returns.filter((ret) => {
    const matchesSearch = ret.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ret.reason.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !statusFilter || ret.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate stats
  const pendingReturns = returns.filter(r => r.status === "pending").length;
  const totalRefund = returns
    .filter(r => r.status === "approved")
    .reduce((sum, r) => sum + r.refundAmount, 0);
  const totalReturns = returns.length;

  const handleAddReturn = () => {
    const newReturn = {
      id: String(returns.length + 1),
      ...formData,
      quantity: Number(formData.quantity),
      originalSaleAmount: Number(formData.originalSaleAmount),
      refundAmount: Number(formData.refundAmount) || Number(formData.originalSaleAmount),
      status: "pending" as const,
      approvedBy: "",
      stockAdjusted: false,
    };
    setReturns([...returns, newReturn]);
    setIsAddModalOpen(false);
    resetForm();
  };

  const handleApproveReturn = (id: string) => {
    if (confirm("คุณแน่ใจหรือไม่ว่าต้องการอนุมัติการคืนสินค้านี้? ระบบจะปรับสต็อกและคืนเงินให้ลูกค้าอัตโนมัติ")) {
      setReturns(
        returns.map((r) =>
          r.id === id
            ? {
              ...r,
              status: "approved" as const,
              approvedBy: "ผู้จัดการ",
              stockAdjusted: true,
            }
            : r
        )
      );
      alert("อนุมัติการคืนสินค้าเรียบร้อยแล้ว ระบบได้ปรับสต็อกและบันทึกการคืนเงินแล้ว");
    }
  };

  const handleRejectReturn = (id: string) => {
    if (confirm("คุณแน่ใจหรือไม่ว่าต้องการปฏิเสธการคืนสินค้านี้?")) {
      setReturns(
        returns.map((r) =>
          r.id === id
            ? {
              ...r,
              status: "rejected" as const,
            }
            : r
        )
      );
    }
  };

  const handleDeleteReturn = (id: string) => {
    if (confirm("คุณแน่ใจหรือไม่ว่าต้องการลบรายการคืนสินค้านี้?")) {
      setReturns(returns.filter((r) => r.id !== id));
    }
  };

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split("T")[0],
      product: "",
      quantity: "",
      unit: "ชิ้น",
      reason: "",
      originalSaleDate: "",
      originalSaleAmount: "",
      refundAmount: "",
    });
  };

  const openEditModal = (ret: typeof initialReturns[0]) => {
    setSelectedReturn(ret);
    setFormData({
      date: ret.date,
      product: ret.product,
      quantity: String(ret.quantity),
      unit: ret.unit,
      reason: ret.reason,
      originalSaleDate: ret.originalSaleDate,
      originalSaleAmount: String(ret.originalSaleAmount),
      refundAmount: String(ret.refundAmount),
    });
    setIsEditModalOpen(true);
  };


  const getStatusLabel = (status: string) => {
    switch (status) {
      case "approved": return "อนุมัติแล้ว";
      case "pending": return "รออนุมัติ";
      case "rejected": return "ปฏิเสธ";
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h2 className="text-3xl font-bold text-app mb-2 font-display">ระบบคืนสินค้า - {shopName}</h2>
        <p className="text-muted font-light">
          บันทึกการคืนสินค้า → ปรับสต็อก + คืนเงินให้ลูกค้า (ติ่มซำ + ของฝาก)
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
            <RotateCcw className="w-8 h-8 text-ptt-cyan" />
            <span className="text-sm text-muted">รายการทั้งหมด</span>
          </div>
          <p className="text-2xl font-bold text-app">{totalReturns}</p>
          <p className="text-sm text-muted">รายการ</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="panel rounded-2xl p-6 border-2 border-orange-500/30"
        >
          <div className="flex items-center justify-between mb-4">
            <AlertCircle className="w-8 h-8 text-orange-400" />
            <span className="text-sm text-muted">รออนุมัติ</span>
          </div>
          <p className="text-2xl font-bold text-orange-400">{pendingReturns}</p>
          <p className="text-sm text-muted">รายการ</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="panel rounded-2xl p-6 border-2 border-emerald-500/30"
        >
          <div className="flex items-center justify-between mb-4">
            <CheckCircle className="w-8 h-8 text-emerald-400" />
            <span className="text-sm text-muted">อนุมัติแล้ว</span>
          </div>
          <p className="text-2xl font-bold text-emerald-400">
            {returns.filter(r => r.status === "approved").length}
          </p>
          <p className="text-sm text-muted">รายการ</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="panel rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="w-8 h-8 text-red-400" />
            <span className="text-sm text-muted">คืนเงินรวม</span>
          </div>
          <p className="text-2xl font-bold text-app">
            {currencyFormatter.format(totalRefund)}
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
              label: "สถานะ",
              value: statusFilter,
              options: [
                { value: "", label: "ทั้งหมด" },
                { value: "pending", label: "รออนุมัติ" },
                { value: "approved", label: "อนุมัติแล้ว" },
                { value: "rejected", label: "ปฏิเสธ" },
              ],
              onChange: setStatusFilter,
            },
          ]}
        />

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-ptt-blue text-white rounded-lg hover:bg-ptt-blue/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>บันทึกการคืนสินค้า</span>
        </button>
      </div>

      {/* Returns List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="panel rounded-2xl p-6"
      >
        <div className="space-y-4">
          {filteredReturns.map((ret) => (
            <div
              key={ret.id}
              className={`p-4 rounded-xl border-2 ${ret.status === "approved"
                ? "bg-emerald-500/10 border-emerald-500/30"
                : ret.status === "pending"
                  ? "bg-orange-500/10 border-orange-500/30"
                  : "bg-red-500/10 border-red-500/30"
                }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <RotateCcw className="w-5 h-5 text-ptt-cyan" />
                    <h4 className="font-semibold text-app">{ret.product}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${ret.status === "approved"
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : ret.status === "pending"
                        ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                        : "bg-red-500/20 text-red-400 border border-red-500/30"
                      }`}>
                      {getStatusLabel(ret.status)}
                    </span>
                    {ret.stockAdjusted && (
                      <span className="px-2 py-1 rounded-full bg-ptt-blue/10 text-ptt-cyan text-xs border border-ptt-blue/30">
                        ปรับสต็อกแล้ว
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted mb-2">เหตุผล: {ret.reason}</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                    <div>
                      <p className="text-xs text-muted">จำนวน</p>
                      <p className="text-sm font-medium text-app">
                        {numberFormatter.format(ret.quantity)} {ret.unit}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted">ยอดขายเดิม</p>
                      <p className="text-sm font-medium text-app">
                        {currencyFormatter.format(ret.originalSaleAmount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted">คืนเงิน</p>
                      <p className="text-sm font-medium text-red-400">
                        {currencyFormatter.format(ret.refundAmount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted">วันที่ขายเดิม</p>
                      <p className="text-sm font-medium text-app">
                        {new Date(ret.originalSaleDate).toLocaleDateString("th-TH")}
                      </p>
                    </div>
                  </div>
                  {ret.status === "approved" && ret.approvedBy && (
                    <div className="mt-2 p-2 bg-emerald-500/10 rounded-lg">
                      <p className="text-xs text-muted">
                        อนุมัติโดย: {ret.approvedBy} • {new Date(ret.date).toLocaleDateString("th-TH")}
                      </p>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 ml-4">
                  {ret.status === "pending" && (
                    <>
                      <button
                        onClick={() => handleApproveReturn(ret.id)}
                        className="px-3 py-1.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors text-sm"
                      >
                        อนุมัติ
                      </button>
                      <button
                        onClick={() => handleRejectReturn(ret.id)}
                        className="px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                      >
                        ปฏิเสธ
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => openEditModal(ret)}
                    className="p-2 hover:bg-soft rounded-lg transition-colors"
                    title="แก้ไข"
                  >
                    <Edit className="w-4 h-4 text-muted" />
                  </button>
                  <button
                    onClick={() => handleDeleteReturn(ret.id)}
                    className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                    title="ลบ"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {filteredReturns.length === 0 && (
            <div className="text-center py-12 text-muted">
              ไม่พบรายการคืนสินค้า
            </div>
          )}
        </div>
      </motion.div>

      {/* Add Modal */}
      <ModalForm
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          resetForm();
        }}
        title="บันทึกการคืนสินค้า"
        onSubmit={handleAddReturn}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="add-return-date" className="block text-sm font-medium text-app mb-2">วันที่คืน</label>
              <input
                id="add-return-date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
                required
              />
            </div>
            <div>
              <label htmlFor="add-return-original-date" className="block text-sm font-medium text-app mb-2">วันที่ขายเดิม</label>
              <input
                id="add-return-original-date"
                type="date"
                value={formData.originalSaleDate}
                onChange={(e) => setFormData({ ...formData, originalSaleDate: e.target.value })}
                className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
                required
              />
            </div>
          </div>
          <div>
            <label htmlFor="add-return-product" className="block text-sm font-medium text-app mb-2">สินค้า</label>
            <input
              id="add-return-product"
              type="text"
              value={formData.product}
              onChange={(e) => setFormData({ ...formData, product: e.target.value })}
              className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
              placeholder="เช่น ข้าวตังหน้าหมูหยอง, ติ่มซำชุดใหญ่"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="add-return-quantity" className="block text-sm font-medium text-app mb-2">จำนวน</label>
              <input
                id="add-return-quantity"
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
                required
              />
            </div>
            <div>
              <label htmlFor="add-return-unit" className="block text-sm font-medium text-app mb-2">หน่วย</label>
              <select
                id="add-return-unit"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
              >
                <option value="ชิ้น">ชิ้น</option>
                <option value="ชุด">ชุด</option>
                <option value="ถุง">ถุง</option>
                <option value="กรัม">กรัม</option>
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="add-return-reason" className="block text-sm font-medium text-app mb-2">เหตุผล</label>
            <textarea
              id="add-return-reason"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
              rows={3}
              placeholder="เช่น สินค้าเสียหาย, ลูกค้าไม่พอใจ, สินค้าหมดอายุ"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="add-return-original-amount" className="block text-sm font-medium text-app mb-2">ยอดขายเดิม (บาท)</label>
              <input
                id="add-return-original-amount"
                type="number"
                value={formData.originalSaleAmount}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    originalSaleAmount: e.target.value,
                    refundAmount: e.target.value, // Auto set refund = original
                  });
                }}
                className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
                required
              />
            </div>
            <div>
              <label htmlFor="add-return-refund-amount" className="block text-sm font-medium text-app mb-2">คืนเงิน (บาท)</label>
              <input
                id="add-return-refund-amount"
                type="number"
                value={formData.refundAmount}
                onChange={(e) => setFormData({ ...formData, refundAmount: e.target.value })}
                className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
                required
              />
            </div>
          </div>
        </div>
      </ModalForm>

      {/* Edit Modal */}
      <ModalForm
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedReturn(null);
          resetForm();
        }}
        title="แก้ไขการคืนสินค้า"
        onSubmit={() => {
          if (!selectedReturn) return;
          setReturns(
            returns.map((r) =>
              r.id === selectedReturn.id
                ? {
                  ...r,
                  ...formData,
                  quantity: Number(formData.quantity),
                  originalSaleAmount: Number(formData.originalSaleAmount),
                  refundAmount: Number(formData.refundAmount),
                }
                : r
            )
          );
          setIsEditModalOpen(false);
          setSelectedReturn(null);
          resetForm();
        }}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="edit-return-date" className="block text-sm font-medium text-app mb-2">วันที่คืน</label>
              <input
                id="edit-return-date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
                required
              />
            </div>
            <div>
              <label htmlFor="edit-return-original-date" className="block text-sm font-medium text-app mb-2">วันที่ขายเดิม</label>
              <input
                id="edit-return-original-date"
                type="date"
                value={formData.originalSaleDate}
                onChange={(e) => setFormData({ ...formData, originalSaleDate: e.target.value })}
                className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
                required
              />
            </div>
          </div>
          <div>
            <label htmlFor="edit-return-product" className="block text-sm font-medium text-app mb-2">สินค้า</label>
            <input
              id="edit-return-product"
              type="text"
              value={formData.product}
              onChange={(e) => setFormData({ ...formData, product: e.target.value })}
              className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="edit-return-quantity" className="block text-sm font-medium text-app mb-2">จำนวน</label>
              <input
                id="edit-return-quantity"
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
                required
              />
            </div>
            <div>
              <label htmlFor="edit-return-unit" className="block text-sm font-medium text-app mb-2">หน่วย</label>
              <select
                id="edit-return-unit"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
              >
                <option value="ชิ้น">ชิ้น</option>
                <option value="ชุด">ชุด</option>
                <option value="ถุง">ถุง</option>
                <option value="กรัม">กรัม</option>
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="edit-return-reason" className="block text-sm font-medium text-app mb-2">เหตุผล</label>
            <textarea
              id="edit-return-reason"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
              rows={3}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="edit-return-original-amount" className="block text-sm font-medium text-app mb-2">ยอดขายเดิม (บาท)</label>
              <input
                id="edit-return-original-amount"
                type="number"
                value={formData.originalSaleAmount}
                onChange={(e) => setFormData({ ...formData, originalSaleAmount: e.target.value })}
                className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
                required
              />
            </div>
            <div>
              <label htmlFor="edit-return-refund-amount" className="block text-sm font-medium text-app mb-2">คืนเงิน (บาท)</label>
              <input
                id="edit-return-refund-amount"
                type="number"
                value={formData.refundAmount}
                onChange={(e) => setFormData({ ...formData, refundAmount: e.target.value })}
                className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
                required
              />
            </div>
          </div>
        </div>
      </ModalForm>
    </div>
  );
}

