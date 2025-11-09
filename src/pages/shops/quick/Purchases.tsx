import { useState } from "react";
import { motion } from "framer-motion";
import {
  ShoppingCart,
  Plus,
  Upload,
  AlertCircle,
  DollarSign,
  Wrench,
} from "lucide-react";
import { useShop } from "@/contexts/ShopContext";
import ModalForm from "@/components/ModalForm";
import FilterBar from "@/components/FilterBar";

const currencyFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 0,
});

// Mock data สำหรับร้าน Quick - เน้นอะไหล่จาก PTT Lubricants
const initialPurchases = [
  {
    id: "1",
    date: "2024-12-15",
    supplier: "PTT Lubricants",
    items: "น้ำมันเครื่อง PTT 200 ลิตร",
    amount: 60000,
    status: "ชำระแล้ว",
    dueDate: "2024-12-15",
    source: "Stock Program",
    poNumber: "PO-2024-001",
  },
  {
    id: "2",
    date: "2024-12-10",
    supplier: "PTT",
    items: "ยางรถยนต์ 30 เส้น",
    amount: 120000,
    status: "ชำระแล้ว",
    dueDate: "2024-12-10",
    source: "Stock Program",
    poNumber: "PO-2024-002",
  },
  {
    id: "3",
    date: "2024-12-08",
    supplier: "ซัพพลายเออร์ A",
    items: "แบตเตอรี่ 20 ชิ้น",
    amount: 30000,
    status: "รอชำระ",
    dueDate: "2024-12-20",
    source: "Stock Program",
    poNumber: "PO-2024-003",
  },
];

export default function Purchases() {
  const { currentShop } = useShop();
  const shopName = currentShop?.name || "ร้าน Quick (B-Quik)";
  
  const [purchases, setPurchases] = useState(initialPurchases);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    supplier: "",
    items: "",
    amount: "",
    status: "รอชำระ",
    dueDate: "",
    source: "Manual",
  });

  const filteredPurchases = purchases.filter((purchase) => {
    const matchesSearch = purchase.supplier.toLowerCase().includes(searchQuery.toLowerCase()) ||
      purchase.items.toLowerCase().includes(searchQuery.toLowerCase()) ||
      purchase.poNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !statusFilter || purchase.status === statusFilter;
    const matchesSource = !sourceFilter || purchase.source === sourceFilter;
    return matchesSearch && matchesStatus && matchesSource;
  });

  const pendingAmount = purchases
    .filter((p) => p.status === "รอชำระ")
    .reduce((sum, p) => sum + p.amount, 0);

  const handleAddPurchase = () => {
    const newPurchase = {
      id: String(purchases.length + 1),
      ...formData,
      amount: Number(formData.amount),
      poNumber: formData.source === "Manual" ? "-" : `PO-2024-${String(purchases.length + 1).padStart(3, "0")}`,
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
      source: "Manual",
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Simulate file processing from Stock Program
      alert(`กำลังประมวลผลไฟล์ ${file.name}...\n\nระบบจะสร้างใบสั่งซื้อ (PO) อัตโนมัติจากข้อมูลใน Stock Program`);
      
      // Simulate adding a purchase from file
      const newPurchase = {
        id: String(purchases.length + 1),
        date: new Date().toISOString().split("T")[0],
        supplier: "PTT Lubricants",
        items: `อะไหล่จากไฟล์ Stock Program`,
        amount: Math.floor(Math.random() * 50000) + 10000,
        status: "รอชำระ",
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        source: "Stock Program",
        poNumber: `PO-2024-${String(purchases.length + 1).padStart(3, "0")}`,
      };
      setPurchases([newPurchase, ...purchases]);
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h2 className="text-3xl font-bold text-app mb-2 font-display">การซื้ออะไหล่เข้า - {shopName}</h2>
        <p className="text-muted font-light">
          บันทึกการซื้ออะไหล่ (ยางรถ, น้ำมันเครื่อง PTT Lubricants, แบตเตอรี่) จากซัพพลายเออร์ (เช่น PTT Lubricants) นำเข้าจาก Stock Program หรือกรอกด้วยมือ วางแผนการสั่งซื้อ
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="panel rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <Wrench className="w-8 h-8 text-purple-400" />
            <span className="text-sm text-muted">จาก Stock Program</span>
          </div>
          <p className="text-2xl font-bold text-app">
            {purchases.filter((p) => p.source === "Stock Program").length}
          </p>
          <p className="text-sm text-muted">รายการ</p>
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
            {
              label: "แหล่งที่มา",
              value: sourceFilter,
              options: [
                { value: "", label: "ทั้งหมด" },
                { value: "Stock Program", label: "Stock Program" },
                { value: "Manual", label: "กรอกด้วยมือ" },
              ],
              onChange: setSourceFilter,
            },
          ]}
        />

        <div className="flex gap-2">
          <label className="flex items-center gap-2 px-4 py-2 bg-soft text-app rounded-lg hover:bg-app/10 transition-colors cursor-pointer">
            <Upload className="w-4 h-4" />
            <span>นำเข้าจาก Stock Program</span>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
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
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Wrench className="w-5 h-5 text-ptt-cyan" />
                    <p className="font-semibold text-app">{purchase.supplier}</p>
                    {purchase.supplier.includes("PTT") && (
                      <span className="text-xs px-2 py-1 rounded-full bg-ptt-blue/10 text-ptt-cyan border border-ptt-blue/30">
                        PTT
                      </span>
                    )}
                    {purchase.poNumber !== "-" && (
                      <span className="text-xs px-2 py-1 rounded-full bg-ptt-blue/10 text-ptt-cyan border border-ptt-blue/30">
                        {purchase.poNumber}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted">{purchase.items}</p>
                </div>
                <div className="text-right ml-4">
                  <p className="text-xl font-bold text-app">
                    {currencyFormatter.format(purchase.amount)}
                  </p>
                  <div className="flex items-center gap-2 mt-2 justify-end">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        purchase.status === "ชำระแล้ว"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                          : "bg-orange-500/10 text-orange-400 border border-orange-500/30"
                      }`}
                    >
                      {purchase.status}
                    </span>
                    <span className="text-xs px-2 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/30">
                      {purchase.source}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm text-muted pt-3 border-t border-app/50">
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
        title="เพิ่มการซื้ออะไหล่"
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
              placeholder="เช่น PTT Lubricants, PTT, ซัพพลายเออร์ A"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-app mb-2">รายการอะไหล่</label>
            <textarea
              value={formData.items}
              onChange={(e) => setFormData({ ...formData, items: e.target.value })}
              className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
              placeholder="เช่น น้ำมันเครื่อง PTT 200 ลิตร, ยางรถยนต์ 30 เส้น, แบตเตอรี่ 20 ชิ้น"
              rows={3}
              required
            />
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
          <div>
            <label className="block text-sm font-medium text-app mb-2">แหล่งที่มา</label>
            <select
              value={formData.source}
              onChange={(e) => setFormData({ ...formData, source: e.target.value })}
              className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
            >
              <option value="Manual">กรอกด้วยมือ</option>
              <option value="Stock Program">Stock Program</option>
            </select>
          </div>
        </div>
      </ModalForm>
    </div>
  );
}

