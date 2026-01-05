import { useState } from "react";
import { motion } from "framer-motion";
import {
  Package,
  Plus,
  AlertTriangle,
  Calendar,
  Upload,
  Edit,
  Trash2,
  Drumstick,
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

// Mock data สำหรับร้านเชสเตอร์ - เน้นวัตถุดิบไก่และซอส
const initialStockData = [
  {
    id: "1",
    name: "ไก่สด",
    quantity: 30,
    unit: "กก.",
    cost: 300,
    price: 0,
    expiry: "2024-12-20",
    supplier: "CP Foods",
    lowStockThreshold: 50,
    category: "วัตถุดิบ",
  },
  {
    id: "2",
    name: "ซอสเกาหลี",
    quantity: 25,
    unit: "ขวด",
    cost: 150,
    price: 0,
    expiry: "2025-06-15",
    supplier: "ซัพพลายเออร์ A",
    lowStockThreshold: 50,
    category: "วัตถุดิบ",
  },
  {
    id: "3",
    name: "แป้งทอด",
    quantity: 50,
    unit: "กก.",
    cost: 80,
    price: 0,
    expiry: "2025-03-10",
    supplier: "CP Foods",
    lowStockThreshold: 100,
    category: "วัตถุดิบ",
  },
  {
    id: "4",
    name: "มันฝรั่ง",
    quantity: 80,
    unit: "กก.",
    cost: 40,
    price: 0,
    expiry: "2024-12-25",
    supplier: "CP Foods",
    lowStockThreshold: 100,
    category: "วัตถุดิบ",
  },
  {
    id: "5",
    name: "น้ำมันทอด",
    quantity: 100,
    unit: "ลิตร",
    cost: 60,
    price: 0,
    expiry: "2025-08-01",
    supplier: "CP Foods",
    lowStockThreshold: 150,
    category: "วัตถุดิบ",
  },
];

export default function Stock() {
  const { currentShop } = useShop();
  const shopName = currentShop?.name || "ร้านเชสเตอร์ (Chester&apos;s)";
  
  const [stockData, setStockData] = useState(initialStockData);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<typeof initialStockData[0] | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    quantity: "",
    unit: "กก.",
    cost: "",
    price: "",
    expiry: "",
    supplier: "",
    lowStockThreshold: "",
    category: "วัตถุดิบ",
  });

  // Calculate stock status - แจ้งเตือนเมื่อใกล้หมด (ต่ำกว่า 20%)
  const getStockStatus = (item: typeof initialStockData[0]) => {
    const percentage = (item.quantity / item.lowStockThreshold) * 100;
    if (percentage <= 20) return { type: "critical", label: "ใกล้หมด", color: "red" };
    if (percentage <= 50) return { type: "warning", label: "เหลือน้อย", color: "orange" };
    return { type: "normal", label: "ปกติ", color: "green" };
  };

  // Filter stock data
  const filteredStock = stockData.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.supplier.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !categoryFilter || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Low stock items - calculated inline where needed

  const handleAddItem = () => {
    const newItem = {
      id: String(stockData.length + 1),
      ...formData,
      quantity: Number(formData.quantity),
      cost: Number(formData.cost),
      price: Number(formData.price) || 0,
      lowStockThreshold: Number(formData.lowStockThreshold),
    };
    setStockData([...stockData, newItem]);
    setIsAddModalOpen(false);
    resetForm();
  };

  const handleEditItem = () => {
    if (!selectedItem) return;
    setStockData(
      stockData.map((item) =>
        item.id === selectedItem.id
          ? {
              ...selectedItem,
              ...formData,
              quantity: Number(formData.quantity),
              cost: Number(formData.cost),
              price: Number(formData.price) || 0,
              lowStockThreshold: Number(formData.lowStockThreshold),
            }
          : item
      )
    );
    setIsEditModalOpen(false);
    setSelectedItem(null);
    resetForm();
  };

  const handleDeleteItem = (id: string) => {
    if (confirm("คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้?")) {
      setStockData(stockData.filter((item) => item.id !== id));
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      quantity: "",
      unit: "กก.",
      cost: "",
      price: "",
      expiry: "",
      supplier: "",
      lowStockThreshold: "",
      category: "วัตถุดิบ",
    });
  };

  const openEditModal = (item: typeof initialStockData[0]) => {
    setSelectedItem(item);
    setFormData({
      name: item.name,
      quantity: String(item.quantity),
      unit: item.unit,
      cost: String(item.cost),
      price: String(item.price),
      expiry: item.expiry,
      supplier: item.supplier,
      lowStockThreshold: String(item.lowStockThreshold),
      category: item.category,
    });
    setIsEditModalOpen(true);
  };

  const categories = Array.from(new Set(stockData.map((item) => item.category)));

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Simulate file processing from Chester&apos;s App
      alert(`กำลังประมวลผลไฟล์ ${file.name}...\n\nระบบจะอัปเดตสต็อกจากแอป Chester&apos;s (Excel)`);
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h2 className="text-3xl font-bold text-app mb-2 font-display">สต็อกสินค้า - {shopName}</h2>
        <p className="text-muted font-light">
          จัดการสต็อกสินค้า (ไก่สด, ซอสเกาหลี) แจ้งเตือนเมื่อใกล้หมด (ต่ำกว่า 20%) อัปเดตจากยอดขาย นำเข้าจากแอป Chester&apos;s (Excel)
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
            <Drumstick className="w-8 h-8 text-ptt-cyan" />
            <span className="text-sm text-muted">สินค้าทั้งหมด</span>
          </div>
          <p className="text-2xl font-bold text-app">{stockData.length}</p>
          <p className="text-sm text-muted">รายการ</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="panel rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <AlertTriangle className="w-8 h-8 text-orange-400" />
            <span className="text-sm text-muted">ใกล้หมด (&lt;20%)</span>
          </div>
          <p className="text-2xl font-bold text-orange-400">
            {stockData.filter((item) => {
              const percentage = (item.quantity / item.lowStockThreshold) * 100;
              return percentage <= 20;
            }).length}
          </p>
          <p className="text-sm text-muted">รายการ</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="panel rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <Package className="w-8 h-8 text-emerald-400" />
            <span className="text-sm text-muted">มูลค่าสต็อก</span>
          </div>
          <p className="text-2xl font-bold text-app">
            {currencyFormatter.format(
              stockData.reduce((sum, item) => sum + item.quantity * item.cost, 0)
            )}
          </p>
          <p className="text-sm text-muted">รวมต้นทุน</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="panel rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <Calendar className="w-8 h-8 text-purple-400" />
            <span className="text-sm text-muted">จาก CP Foods</span>
          </div>
          <p className="text-2xl font-bold text-app">
            {stockData.filter((item) => item.supplier === "CP Foods").length}
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
              label: "หมวดหมู่",
              value: categoryFilter,
              options: [{ value: "", label: "ทั้งหมด" }, ...categories.map((cat) => ({ value: cat, label: cat }))],
              onChange: setCategoryFilter,
            },
          ]}
        />

        <div className="flex gap-2">
          <label className="flex items-center gap-2 px-4 py-2 bg-soft text-app rounded-lg hover:bg-app/10 transition-colors cursor-pointer">
            <Upload className="w-4 h-4" />
            <span>นำเข้าจากแอป Chester&apos;s</span>
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
            <span>เพิ่มสินค้า</span>
          </button>
        </div>
      </div>

      {/* Stock Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="panel rounded-2xl p-6"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-app">
                <th className="text-left py-3 px-4 text-sm font-semibold text-app">สินค้า</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-app">คงเหลือ</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-app">เกณฑ์</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-app">%</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-app">ต้นทุน</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-app">ซัพพลายเออร์</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-app">สถานะ</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-app">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {filteredStock.map((item) => {
                const status = getStockStatus(item);
                const percentage = (item.quantity / item.lowStockThreshold) * 100;
                return (
                  <tr key={item.id} className="border-b border-app/50 hover:bg-soft/50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Drumstick className="w-4 h-4 text-orange-400" />
                        <div>
                          <p className="font-medium text-app">{item.name}</p>
                          {item.supplier === "CP Foods" && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-ptt-blue/10 text-ptt-cyan border border-ptt-blue/30">
                              CP Foods
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-app">
                        {numberFormatter.format(item.quantity)} {item.unit}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm text-muted">
                        {numberFormatter.format(item.lowStockThreshold)} {item.unit}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-soft rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              percentage <= 20
                                ? "bg-red-500"
                                : percentage <= 50
                                ? "bg-orange-500"
                                : "bg-emerald-500"
                            }`}
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted">{percentage.toFixed(0)}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-app">{currencyFormatter.format(item.cost)}/{item.unit}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm text-app">{item.supplier}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          status.color === "red"
                            ? "bg-red-500/10 text-red-400 border border-red-500/30"
                            : status.color === "orange"
                            ? "bg-orange-500/10 text-orange-400 border border-orange-500/30"
                            : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                        }`}
                      >
                        {status.label}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-2 hover:bg-soft rounded-lg transition-colors"
                          title="แก้ไข"
                        >
                          <Edit className="w-4 h-4 text-muted" />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="ลบ"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredStock.length === 0 && (
            <div className="text-center py-12 text-muted">
              ไม่พบข้อมูลสินค้า
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
        title="เพิ่มสินค้าใหม่"
        onSubmit={handleAddItem}
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="stock-name" className="block text-sm font-medium text-app mb-2">ชื่อสินค้า</label>
            <input
              id="stock-name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
              placeholder="เช่น ไก่สด, ซอสเกาหลี, แป้งทอด"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="stock-quantity" className="block text-sm font-medium text-app mb-2">จำนวน</label>
              <input
                id="stock-quantity"
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
                required
              />
            </div>
            <div>
              <label htmlFor="stock-unit" className="block text-sm font-medium text-app mb-2">หน่วย</label>
              <select
                id="stock-unit"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
              >
                <option value="กก.">กก.</option>
                <option value="ขวด">ขวด</option>
                <option value="ลิตร">ลิตร</option>
                <option value="แพ็ค">แพ็ค</option>
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="stock-cost" className="block text-sm font-medium text-app mb-2">ต้นทุน (บาท/{formData.unit})</label>
            <input
              id="stock-cost"
              type="number"
              value={formData.cost}
              onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
              className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
              required
            />
          </div>
          <div>
            <label htmlFor="stock-expiry" className="block text-sm font-medium text-app mb-2">วันหมดอายุ</label>
            <input
              id="stock-expiry"
              type="date"
              value={formData.expiry}
              onChange={(e) => setFormData({ ...formData, expiry: e.target.value })}
              className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
              required
            />
          </div>
          <div>
            <label htmlFor="stock-supplier" className="block text-sm font-medium text-app mb-2">ซัพพลายเออร์</label>
            <input
              id="stock-supplier"
              type="text"
              value={formData.supplier}
              onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
              className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
              placeholder="เช่น CP Foods, ซัพพลายเออร์ A"
              required
            />
          </div>
          <div>
            <label htmlFor="stock-threshold" className="block text-sm font-medium text-app mb-2">เกณฑ์แจ้งเตือน (จำนวน)</label>
            <input
              id="stock-threshold"
              type="number"
              value={formData.lowStockThreshold}
              onChange={(e) => setFormData({ ...formData, lowStockThreshold: e.target.value })}
              className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
              placeholder="ระบบจะแจ้งเตือนเมื่อสต็อกต่ำกว่า 20% ของเกณฑ์นี้"
              required
            />
          </div>
          <div>
            <label htmlFor="stock-category" className="block text-sm font-medium text-app mb-2">หมวดหมู่</label>
            <select
              id="stock-category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
            >
              <option value="วัตถุดิบ">วัตถุดิบ</option>
            </select>
          </div>
        </div>
      </ModalForm>

      {/* Edit Modal */}
      <ModalForm
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedItem(null);
          resetForm();
        }}
        title="แก้ไขสินค้า"
        onSubmit={handleEditItem}
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="edit-stock-name" className="block text-sm font-medium text-app mb-2">ชื่อสินค้า</label>
            <input
              id="edit-stock-name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="edit-stock-quantity" className="block text-sm font-medium text-app mb-2">จำนวน</label>
              <input
                id="edit-stock-quantity"
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
                required
              />
            </div>
            <div>
              <label htmlFor="edit-stock-unit" className="block text-sm font-medium text-app mb-2">หน่วย</label>
              <select
                id="edit-stock-unit"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
              >
                <option value="กก.">กก.</option>
                <option value="ขวด">ขวด</option>
                <option value="ลิตร">ลิตร</option>
                <option value="แพ็ค">แพ็ค</option>
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="edit-stock-cost" className="block text-sm font-medium text-app mb-2">ต้นทุน (บาท/{formData.unit})</label>
            <input
              id="edit-stock-cost"
              type="number"
              value={formData.cost}
              onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
              className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
              required
            />
          </div>
          <div>
            <label htmlFor="edit-stock-expiry" className="block text-sm font-medium text-app mb-2">วันหมดอายุ</label>
            <input
              id="edit-stock-expiry"
              type="date"
              value={formData.expiry}
              onChange={(e) => setFormData({ ...formData, expiry: e.target.value })}
              className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
              required
            />
          </div>
          <div>
            <label htmlFor="edit-stock-supplier" className="block text-sm font-medium text-app mb-2">ซัพพลายเออร์</label>
            <input
              id="edit-stock-supplier"
              type="text"
              value={formData.supplier}
              onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
              className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
              required
            />
          </div>
          <div>
            <label htmlFor="edit-stock-threshold" className="block text-sm font-medium text-app mb-2">เกณฑ์แจ้งเตือน (จำนวน)</label>
            <input
              id="edit-stock-threshold"
              type="number"
              value={formData.lowStockThreshold}
              onChange={(e) => setFormData({ ...formData, lowStockThreshold: e.target.value })}
              className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
              required
            />
          </div>
          <div>
            <label htmlFor="edit-stock-category" className="block text-sm font-medium text-app mb-2">หมวดหมู่</label>
            <select
              id="edit-stock-category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
            >
              <option value="วัตถุดิบ">วัตถุดิบ</option>
            </select>
          </div>
        </div>
      </ModalForm>
    </div>
  );
}

