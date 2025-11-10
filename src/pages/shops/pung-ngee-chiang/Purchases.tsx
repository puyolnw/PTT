import { useState } from "react";
import { motion } from "framer-motion";
import {
  ShoppingCart,
  Plus,
  AlertCircle,
  DollarSign,
} from "lucide-react";
import { useShop } from "@/contexts/ShopContext";
import ModalForm from "@/components/ModalForm";
import FilterBar from "@/components/FilterBar";

const currencyFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 0,
});

// Mock data
const initialPurchases = [
  {
    id: "1",
    date: "2024-12-15",
    supplier: "ตลาดสด",
    items: "เนื้อหมู 100 กก.",
    amount: 50000,
    status: "ชำระแล้ว",
    dueDate: "2024-12-15",
    type: "สินค้า",
  },
  {
    id: "2",
    date: "2024-12-10",
    supplier: "PTT",
    items: "ค่าน้ำ/ไฟ",
    amount: 3000,
    status: "ชำระแล้ว",
    dueDate: "2024-12-10",
    type: "ค่าใช้จ่ายอื่น",
  },
  {
    id: "3",
    date: "2024-12-08",
    supplier: "ซัพพลายเออร์ A",
    items: "วัตถุดิบ",
    amount: 15000,
    status: "รอชำระ",
    dueDate: "2024-12-20",
    type: "สินค้า",
  },
  {
    id: "4",
    date: "2024-12-05",
    supplier: "บริษัทขนส่ง",
    items: "ค่าขนส่ง",
    amount: 2000,
    status: "ชำระแล้ว",
    dueDate: "2024-12-05",
    type: "ค่าใช้จ่ายอื่น",
  },
  {
    id: "5",
    date: "2024-12-01",
    supplier: "ช่างซ่อม",
    items: "ค่าซ่อม",
    amount: 5000,
    status: "ชำระแล้ว",
    dueDate: "2024-12-01",
    type: "ค่าใช้จ่ายอื่น",
  },
];

export default function Purchases() {
  const { currentShop } = useShop();
  const shopName = currentShop?.name || "ปึงหงี่เชียง";
  
  const [purchases, setPurchases] = useState(initialPurchases);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    supplier: "",
    items: "",
    amount: "",
    status: "รอชำระ",
    dueDate: "",
    type: "สินค้า",
  });

  const filteredPurchases = purchases.filter((purchase) => {
    const matchesSearch = purchase.supplier.toLowerCase().includes(searchQuery.toLowerCase()) ||
      purchase.items.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !statusFilter || purchase.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingAmount = purchases
    .filter((p) => p.status === "รอชำระ")
    .reduce((sum, p) => sum + p.amount, 0);

  const handleAddPurchase = () => {
    const newPurchase = {
      id: String(purchases.length + 1),
      ...formData,
      amount: Number(formData.amount),
    };
    setPurchases([newPurchase, ...purchases]);
    setIsAddModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split("T")[0],
      supplier: "",
      items: "",
      amount: "",
      status: "รอชำระ",
      dueDate: "",
      type: "สินค้า",
    });
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h2 className="text-3xl font-bold text-app mb-2 font-display">การซื้อสินค้าเข้าและค่าใช้จ่าย - {shopName}</h2>
        <p className="text-muted font-light">
          บันทึกการสั่งซื้อสินค้าเข้าและค่าใช้จ่ายอื่นๆ (ค่าน้ำ/ไฟ, ค่าขนส่ง, ค่าทิ้งของเสีย, ค่าซ่อม) - กรอกมือทั้งหมด
        </p>
      </motion.div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="panel rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <ShoppingCart className="w-8 h-8 text-ptt-cyan" />
            <span className="text-sm text-muted">รายการทั้งหมด</span>
          </div>
          <p className="text-2xl font-bold text-app">{purchases.length}</p>
          <p className="text-sm text-muted">รายการ</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="panel rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <AlertCircle className="w-8 h-8 text-orange-400" />
            <span className="text-sm text-muted">รอชำระ</span>
          </div>
          <p className="text-2xl font-bold text-orange-400">
            {currencyFormatter.format(pendingAmount)}
          </p>
          <p className="text-sm text-muted">
            {purchases.filter((p) => p.status === "รอชำระ").length} รายการ
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="panel rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="w-8 h-8 text-emerald-400" />
            <span className="text-sm text-muted">ชำระแล้ว</span>
          </div>
          <p className="text-2xl font-bold text-emerald-400">
            {currencyFormatter.format(
              purchases
                .filter((p) => p.status === "ชำระแล้ว")
                .reduce((sum, p) => sum + p.amount, 0)
            )}
          </p>
          <p className="text-sm text-muted">
            {purchases.filter((p) => p.status === "ชำระแล้ว").length} รายการ
          </p>
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
                { value: "ชำระแล้ว", label: "ชำระแล้ว" },
                { value: "รอชำระ", label: "รอชำระ" },
              ],
              onChange: setStatusFilter,
            },
          ]}
        />

        <div className="flex gap-2">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-ptt-blue text-white rounded-lg hover:bg-ptt-blue/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>เพิ่มการซื้อ</span>
          </button>
        </div>
      </div>

      {/* Purchases List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="panel rounded-2xl p-6"
      >
        <div className="space-y-4">
          {filteredPurchases.map((purchase) => (
            <div
              key={purchase.id}
              className="p-4 bg-soft rounded-xl border border-app hover:border-ptt-blue/30 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-semibold text-app">{purchase.supplier}</p>
                  <p className="text-sm text-muted">{purchase.items}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-app">
                    {currencyFormatter.format(purchase.amount)}
                  </p>
                  <div className="flex items-center gap-2 mt-2 justify-end flex-wrap">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        purchase.status === "ชำระแล้ว"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                          : "bg-orange-500/10 text-orange-400 border border-orange-500/30"
                      }`}
                    >
                      {purchase.status}
                    </span>
                    {purchase.type && (
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        purchase.type === "ค่าใช้จ่ายอื่น"
                          ? "bg-orange-500/10 text-orange-400 border border-orange-500/30"
                          : "bg-blue-500/10 text-blue-400 border border-blue-500/30"
                      }`}>
                        {purchase.type}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm text-muted">
                <span>
                  วันที่: {new Date(purchase.date).toLocaleDateString("th-TH")}
                </span>
                {purchase.status === "รอชำระ" && (
                  <span>
                    ครบกำหนด: {new Date(purchase.dueDate).toLocaleDateString("th-TH")}
                  </span>
                )}
              </div>
            </div>
          ))}
          {filteredPurchases.length === 0 && (
            <div className="text-center py-12 text-muted">
              ไม่พบข้อมูลการซื้อ
            </div>
          )}
        </div>
      </motion.div>

      {/* Add Purchase Modal */}
      <ModalForm
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          resetForm();
        }}
        title="เพิ่มการซื้อสินค้า"
        onSubmit={handleAddPurchase}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-app mb-2">วันที่</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-app mb-2">สถานะ</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
              >
                <option value="รอชำระ">รอชำระ</option>
                <option value="ชำระแล้ว">ชำระแล้ว</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-app mb-2">ซัพพลายเออร์</label>
            <input
              type="text"
              value={formData.supplier}
              onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
              className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
              placeholder="เช่น ตลาดสด, PTT"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-app mb-2">รายการ</label>
            <input
              type="text"
              value={formData.items}
              onChange={(e) => setFormData({ ...formData, items: e.target.value })}
              className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
              placeholder="เช่น เนื้อหมู 100 กก."
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-app mb-2">ประเภท</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
              >
                <option value="สินค้า">สินค้า</option>
                <option value="ค่าใช้จ่ายอื่น">ค่าใช้จ่ายอื่น (ค่าน้ำ/ไฟ, ค่าขนส่ง, ค่าทิ้งของเสีย, ค่าซ่อม)</option>
              </select>
            </div>
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
          </div>
          {formData.status === "รอชำระ" && (
            <div>
              <label className="block text-sm font-medium text-app mb-2">ครบกำหนด</label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
              />
            </div>
          )}
        </div>
      </ModalForm>
    </div>
  );
}

