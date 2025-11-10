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

// Mock data
const initialStockData = [
  {
    id: "1",
    name: "กุนเชียง",
    quantity: 500,
    unit: "ชิ้น",
    cost: 50,
    price: 80,
    expiry: "2024-12-31",
    supplier: "ตลาดสด",
    lowStockThreshold: 100,
    category: "อาหารแปรรูป",
  },
  {
    id: "2",
    name: "หมูหยอง",
    quantity: 100,
    unit: "กรัม",
    cost: 200,
    price: 350,
    expiry: "2024-12-25",
    supplier: "ตลาดสด",
    lowStockThreshold: 200,
    category: "อาหารแปรรูป",
  },
  {
    id: "3",
    name: "หมูแผ่น",
    quantity: 300,
    unit: "ชิ้น",
    cost: 30,
    price: 50,
    expiry: "2025-01-15",
    supplier: "ซัพพลายเออร์ A",
    lowStockThreshold: 150,
    category: "อาหารแปรรูป",
  },
  {
    id: "4",
    name: "แหนม",
    quantity: 50,
    unit: "ชิ้น",
    cost: 40,
    price: 60,
    expiry: "2024-12-20",
    supplier: "ตลาดสด",
    lowStockThreshold: 100,
    category: "อาหารแปรรูป",
  },
];

export default function Stock() {
  const { currentShop } = useShop();
  const shopName = currentShop?.name || "ปึงหงี่เชียง";
  
  const [stockData, setStockData] = useState(initialStockData);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<typeof initialStockData[0] | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    quantity: "",
    unit: "ชิ้น",
    cost: "",
    price: "",
    expiry: "",
    supplier: "",
    lowStockThreshold: "",
    category: "อาหารแปรรูป",
  });

  // Calculate stock status
  const getStockStatus = (item: typeof initialStockData[0]) => {
    const percentage = (item.quantity / item.lowStockThreshold) * 100;
    const daysUntilExpiry = Math.ceil(
      (new Date(item.expiry).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );

    if (percentage <= 20) return { type: "critical", label: "ใกล้หมด", color: "red" };
    if (percentage <= 50) return { type: "warning", label: "เหลือน้อย", color: "orange" };
    if (daysUntilExpiry <= 7) return { type: "expiring", label: "ใกล้หมดอายุ", color: "orange" };
    return { type: "normal", label: "ปกติ", color: "green" };
  };

  // Filter stock data
  const filteredStock = stockData.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.supplier.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !categoryFilter || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Low stock items
  const lowStockItems = stockData.filter((item) => {
    const status = getStockStatus(item);
    return status.type === "critical" || status.type === "warning" || status.type === "expiring";
  });

  const handleAddItem = () => {
    const newItem = {
      id: String(stockData.length + 1),
      ...formData,
      quantity: Number(formData.quantity),
      cost: Number(formData.cost),
      price: Number(formData.price),
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
              price: Number(formData.price),
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
      unit: "ชิ้น",
      cost: "",
      price: "",
      expiry: "",
      supplier: "",
      lowStockThreshold: "",
      category: "อาหารแปรรูป",
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

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h2 className="text-3xl font-bold text-app mb-2 font-display">สต็อกสินค้า - {shopName}</h2>
        <p className="text-muted font-light">
          จัดการสต็อกสินค้า แจ้งเตือนใกล้หมด และอายุสินค้า
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
            <Package className="w-8 h-8 text-ptt-cyan" />
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
            <span className="text-sm text-muted">ใกล้หมด</span>
          </div>
          <p className="text-2xl font-bold text-orange-400">{lowStockItems.length}</p>
          <p className="text-sm text-muted">รายการ</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="panel rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <Calendar className="w-8 h-8 text-red-400" />
            <span className="text-sm text-muted">ใกล้หมดอายุ</span>
          </div>
          <p className="text-2xl font-bold text-red-400">
            {stockData.filter((item) => {
              const days = Math.ceil(
                (new Date(item.expiry).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
              );
              return days <= 7 && days > 0;
            }).length}
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
            <span>นำเข้า Excel</span>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  alert(`กำลังนำเข้าข้อมูลสต็อกสินค้าจากไฟล์ ${file.name}...\n\nระบบจะประมวลผลและเพิ่มข้อมูลสต็อกอัตโนมัติ`);
                }
              }}
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
                <th className="text-left py-3 px-4 text-sm font-semibold text-app">ต้นทุน</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-app">ราคาขาย</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-app">หมดอายุ</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-app">ซัพพลายเออร์</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-app">สถานะ</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-app">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {filteredStock.map((item) => {
                const status = getStockStatus(item);
                return (
                  <tr key={item.id} className="border-b border-app/50 hover:bg-soft/50">
                    <td className="py-3 px-4">
                      <p className="font-medium text-app">{item.name}</p>
                      <p className="text-xs text-muted">{item.category}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-app">
                        {numberFormatter.format(item.quantity)} {item.unit}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-app">{currencyFormatter.format(item.cost)}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-app font-semibold">{currencyFormatter.format(item.price)}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-app">
                        {new Date(item.expiry).toLocaleDateString("th-TH")}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm text-muted">{item.supplier}</p>
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
            <label className="block text-sm font-medium text-app mb-2">ชื่อสินค้า</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-app mb-2">จำนวน</label>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-app mb-2">หน่วย</label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
              >
                <option value="ชิ้น">ชิ้น</option>
                <option value="กรัม">กรัม</option>
                <option value="กิโลกรัม">กิโลกรัม</option>
                <option value="แพ็ค">แพ็ค</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-app mb-2">ต้นทุน (บาท)</label>
              <input
                type="number"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-app mb-2">ราคาขาย (บาท)</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-app mb-2">วันหมดอายุ</label>
            <input
              type="date"
              value={formData.expiry}
              onChange={(e) => setFormData({ ...formData, expiry: e.target.value })}
              className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-app mb-2">ซัพพลายเออร์</label>
            <input
              type="text"
              value={formData.supplier}
              onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
              className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-app mb-2">เกณฑ์แจ้งเตือน (จำนวน)</label>
            <input
              type="number"
              value={formData.lowStockThreshold}
              onChange={(e) => setFormData({ ...formData, lowStockThreshold: e.target.value })}
              className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
              placeholder="ระบบจะแจ้งเตือนเมื่อสต็อกต่ำกว่า"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-app mb-2">หมวดหมู่</label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
            />
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
            <label className="block text-sm font-medium text-app mb-2">ชื่อสินค้า</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-app mb-2">จำนวน</label>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-app mb-2">หน่วย</label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
              >
                <option value="ชิ้น">ชิ้น</option>
                <option value="กรัม">กรัม</option>
                <option value="กิโลกรัม">กิโลกรัม</option>
                <option value="แพ็ค">แพ็ค</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-app mb-2">ต้นทุน (บาท)</label>
              <input
                type="number"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-app mb-2">ราคาขาย (บาท)</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-app mb-2">วันหมดอายุ</label>
            <input
              type="date"
              value={formData.expiry}
              onChange={(e) => setFormData({ ...formData, expiry: e.target.value })}
              className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-app mb-2">ซัพพลายเออร์</label>
            <input
              type="text"
              value={formData.supplier}
              onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
              className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-app mb-2">เกณฑ์แจ้งเตือน (จำนวน)</label>
            <input
              type="number"
              value={formData.lowStockThreshold}
              onChange={(e) => setFormData({ ...formData, lowStockThreshold: e.target.value })}
              className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-app mb-2">หมวดหมู่</label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
            />
          </div>
        </div>
      </ModalForm>
    </div>
  );
}

