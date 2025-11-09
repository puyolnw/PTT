import { useState } from "react";
import { motion } from "framer-motion";
import {
  ShoppingCart,
  Plus,
  Upload,
  DollarSign,
  Fuel,
} from "lucide-react";
import ModalForm from "@/components/ModalForm";
import FilterBar from "@/components/FilterBar";

const currencyFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat("th-TH");

// ชนิดน้ำมัน 8 ชนิด (ตามปั้ม.md)
const fuelTypes = [
  "Premium Diesel",
  "Premium Gasohol 95",
  "Diesel",
  "E85",
  "E20",
  "Gasohol 91",
  "Gasohol 95",
];

const branches = ["สำนักงานใหญ่", "สาขา A", "สาขา B", "สาขา C", "สาขา D"];

// Mock data สำหรับการซื้อเข้าน้ำมัน
const initialPurchases = [
  {
    id: "1",
    date: "2024-12-15",
    fuelType: "Gasohol 95",
    quantity: 50000,
    amount: 2000000,
    branch: "สำนักงานใหญ่",
    source: "PURCHASE_20241215.xlsx",
    status: "บันทึกแล้ว",
  },
  {
    id: "2",
    date: "2024-12-14",
    fuelType: "Diesel",
    quantity: 40000,
    amount: 1600000,
    branch: "สาขา A",
    source: "PURCHASE_20241214.xlsx",
    status: "บันทึกแล้ว",
  },
  {
    id: "3",
    date: "2024-12-13",
    fuelType: "Premium Gasohol 95",
    quantity: 20000,
    amount: 900000,
    branch: "สาขา B",
    source: "PURCHASE_20241213.xlsx",
    status: "บันทึกแล้ว",
  },
];

export default function Purchases() {
  const [purchases, setPurchases] = useState(initialPurchases);
  const [searchQuery, setSearchQuery] = useState("");
  const [fuelFilter, setFuelFilter] = useState("");
  const [branchFilter, setBranchFilter] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    fuelType: "Gasohol 95",
    quantity: "",
    amount: "",
    branch: "สำนักงานใหญ่",
    source: "Manual",
  });

  const filteredPurchases = purchases.filter((purchase) => {
    const matchesSearch = purchase.fuelType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      purchase.branch.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFuel = !fuelFilter || purchase.fuelType === fuelFilter;
    const matchesBranch = !branchFilter || purchase.branch === branchFilter;
    return matchesSearch && matchesFuel && matchesBranch;
  });

  const totalAmount = purchases.reduce((sum, p) => sum + p.amount, 0);
  const totalQuantity = purchases.reduce((sum, p) => sum + p.quantity, 0);

  const handleAddPurchase = () => {
    const newPurchase = {
      id: String(purchases.length + 1),
      ...formData,
      quantity: Number(formData.quantity),
      amount: Number(formData.amount),
      status: "บันทึกแล้ว",
    };
    setPurchases([newPurchase, ...purchases]);
    setIsAddModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split("T")[0],
      fuelType: "Gasohol 95",
      quantity: "",
      amount: "",
      branch: "สำนักงานใหญ่",
      source: "Manual",
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Simulate file processing from PTT BackOffice
      alert(`กำลังประมวลผลไฟล์ ${file.name}...\n\nระบบจะสร้างใบรับสินค้าอัตโนมัติจากข้อมูล PTT BackOffice`);
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h2 className="text-3xl font-bold text-app mb-2 font-display">ซื้อเข้าน้ำมัน - M1</h2>
        <p className="text-muted font-light">
          ประมวลผลซื้อเข้าน้ำมันแยกตามชนิดน้ำมัน 8 ชนิด (Premium Diesel, Premium Gasohol 95, Diesel, E85, E20, Gasohol 91, Gasohol 95) นำเข้า Excel จาก PTT BackOffice ระบบสร้างใบรับสินค้าอัตโนมัติ
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
          <p className="text-sm text-muted">ใบรับสินค้า</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="panel rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <Fuel className="w-8 h-8 text-emerald-400" />
            <span className="text-sm text-muted">ปริมาณรวม</span>
          </div>
          <p className="text-2xl font-bold text-app">
            {numberFormatter.format(totalQuantity)} ลิตร
          </p>
          <p className="text-sm text-muted">น้ำมันทั้งหมด</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="panel rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="w-8 h-8 text-purple-400" />
            <span className="text-sm text-muted">ยอดรวม</span>
          </div>
          <p className="text-2xl font-bold text-app">{currencyFormatter.format(totalAmount)}</p>
          <p className="text-sm text-muted">บาท</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="panel rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <Upload className="w-8 h-8 text-orange-400" />
            <span className="text-sm text-muted">จาก Excel</span>
          </div>
          <p className="text-2xl font-bold text-app">
            {purchases.filter((p) => p.source.includes("PURCHASE")).length}
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
              label: "ชนิดน้ำมัน",
              value: fuelFilter,
              options: [{ value: "", label: "ทั้งหมด" }, ...fuelTypes.map((fuel) => ({ value: fuel, label: fuel }))],
              onChange: setFuelFilter,
            },
            {
              label: "สาขา",
              value: branchFilter,
              options: [{ value: "", label: "ทั้งหมด" }, ...branches.map((branch) => ({ value: branch, label: branch }))],
              onChange: setBranchFilter,
            },
          ]}
        />

        <div className="flex gap-2">
          <label className="flex items-center gap-2 px-4 py-2 bg-soft text-app rounded-lg hover:bg-app/10 transition-colors cursor-pointer">
            <Upload className="w-4 h-4" />
            <span>นำเข้า PURCHASE_YYYYMMDD.xlsx</span>
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
            <span>บันทึกการซื้อ</span>
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
                <div className="flex items-center gap-3">
                  <Fuel className="w-5 h-5 text-ptt-cyan" />
                  <div>
                    <p className="font-semibold text-app">{purchase.fuelType}</p>
                    <p className="text-sm text-muted">{purchase.branch}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-app">{currencyFormatter.format(purchase.amount)}</p>
                  <p className="text-sm text-muted">
                    {numberFormatter.format(purchase.quantity)} ลิตร
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">
                  วันที่: {new Date(purchase.date).toLocaleDateString("th-TH", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    {purchase.status}
                  </span>
                  <span className="text-xs px-2 py-1 rounded-full bg-ptt-blue/10 text-ptt-cyan border border-ptt-blue/30">
                    {purchase.source}
                  </span>
                </div>
              </div>
            </div>
          ))}
          {filteredPurchases.length === 0 && (
            <div className="text-center py-12 text-muted">
              ไม่พบข้อมูลการซื้อเข้าน้ำมัน
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
        title="บันทึกการซื้อเข้าน้ำมัน"
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
          </div>
          <div>
            <label className="block text-sm font-medium text-app mb-2">ชนิดน้ำมัน</label>
            <select
              value={formData.fuelType}
              onChange={(e) => setFormData({ ...formData, fuelType: e.target.value })}
              className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
            >
              {fuelTypes.map((fuel) => (
                <option key={fuel} value={fuel}>
                  {fuel}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-app mb-2">ปริมาณ (ลิตร)</label>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
                required
              />
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
          <div>
            <label className="block text-sm font-medium text-app mb-2">แหล่งที่มา</label>
            <select
              value={formData.source}
              onChange={(e) => setFormData({ ...formData, source: e.target.value })}
              className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
            >
              <option value="Manual">กรอกด้วยมือ</option>
              <option value="PURCHASE_YYYYMMDD.xlsx">PURCHASE_YYYYMMDD.xlsx (PTT BackOffice)</option>
            </select>
          </div>
        </div>
      </ModalForm>
    </div>
  );
}

