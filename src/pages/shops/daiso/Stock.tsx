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

// Mock data สำหรับร้านไดโซ - เน้นสินค้าของใช้ราคาถูก
const initialStockData = [
  {
    id: "1",
    name: "ขวดพลาสติก",
    quantity: 100,
    unit: "ชิ้น",
    cost: 30,
    price: 60,
    category: "ของใช้ในบ้าน",
    supplier: "Daiso Japan",
    lowStockThreshold: 200,
  },
  {
    id: "2",
    name: "ที่เก็บของ",
    quantity: 50,
    unit: "ชิ้น",
    cost: 30,
    price: 60,
    category: "ของใช้ในบ้าน",
    supplier: "Daiso Japan",
    lowStockThreshold: 150,
  },
  {
    id: "3",
    name: "ของตกแต่งเทศกาล",
    quantity: 200,
    unit: "ชิ้น",
    cost: 30,
    price: 60,
    category: "ของตกแต่ง",
    supplier: "Daiso Japan",
    lowStockThreshold: 300,
  },
  {
    id: "4",
    name: "อุปกรณ์ทำความสะอาด",
    quantity: 150,
    unit: "ชิ้น",
    cost: 30,
    price: 60,
    category: "ของใช้ในบ้าน",
    supplier: "Daiso Japan",
    lowStockThreshold: 250,
  },
  {
    id: "5",
    name: "ของชำ",
    quantity: 300,
    unit: "ชิ้น",
    cost: 30,
    price: 60,
    category: "ของชำ",
    supplier: "Daiso Japan",
    lowStockThreshold: 500,
  },
];

export default function Stock() {
  const { currentShop } = useShop();
  const shopName = currentShop?.name || "ร้านไดโซ (Daiso)";

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
    cost: "30",
    price: "60",
    category: "ของใช้ในบ้าน",
    supplier: "Daiso Japan",
    lowStockThreshold: "",
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
      cost: "30",
      price: "60",
      category: "ของใช้ในบ้าน",
      supplier: "Daiso Japan",
      lowStockThreshold: "",
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
      category: item.category,
      supplier: item.supplier,
      lowStockThreshold: String(item.lowStockThreshold),
    });
    setIsEditModalOpen(true);
  };

  const categories = Array.from(new Set(stockData.map((item) => item.category)));

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Simulate file processing from Excel (from Daiso app)
      alert(`กำลังประมวลผลไฟล์ ${file.name}...\n\nระบบจะอัปเดตสต็อกสินค้าจาก Excel (แอป Daiso)`);
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
          จัดการสต็อกสินค้า (ของใช้ในบ้าน, ของตกแต่ง, ของชำ) แจ้งเตือนใกล้หมด นำเข้าจาก Excel (แอป Daiso)
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
            <span className="text-sm text-muted">จาก Daiso Japan</span>
          </div>
          <p className="text-2xl font-bold text-app">
            {stockData.filter((item) => item.supplier === "Daiso Japan").length}
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
            <span>นำเข้าจาก Excel</span>
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
                <th className="text-left py-3 px-4 text-sm font-semibold text-app">ต้นทุน/ราคาขาย</th>
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
                        <Package className="w-4 h-4 text-ptt-cyan" />
                        <div>
                          <p className="font-medium text-app">{item.name}</p>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-ptt-blue/10 text-ptt-cyan border border-ptt-blue/30">
                            {item.category}
                          </span>
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
                          <motion.div
                            className={`h-full w-[var(--stock-percentage)] ${percentage <= 20
                              ? "bg-red-500"
                              : percentage <= 50
                                ? "bg-orange-500"
                                : "bg-emerald-500"
                              }`}
                            style={{ "--stock-percentage": `${Math.min(percentage, 100)}%` } as React.CSSProperties}
                          />
                        </div>
                        <span className="text-xs text-muted">{percentage.toFixed(0)}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-app">
                        {currencyFormatter.format(item.cost)}/{item.unit} → {currencyFormatter.format(item.price)}/{item.unit}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm text-app">{item.supplier}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${status.color === "red"
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
            <label htmlFor="add-name" className="block text-sm font-medium text-app mb-2">ชื่อสินค้า</label>
            <input
              id="add-name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
              placeholder="เช่น ขวดพลาสติก, ที่เก็บของ, ของตกแต่ง"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="add-quantity" className="block text-sm font-medium text-app mb-2">จำนวน</label>
              <input
                id="add-quantity"
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
                required
              />
            </div>
            <div>
              <label htmlFor="add-unit" className="block text-sm font-medium text-app mb-2">หน่วย</label>
              <select
                id="add-unit"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
              >
                <option value="ชิ้น">ชิ้น</option>
                <option value="แพ็ค">แพ็ค</option>
                <option value="ชุด">ชุด</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="add-cost" className="block text-sm font-medium text-app mb-2">ต้นทุน (บาท/{formData.unit})</label>
              <input
                id="add-cost"
                type="number"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
                required
              />
            </div>
            <div>
              <label htmlFor="add-price" className="block text-sm font-medium text-app mb-2">ราคาขาย (บาท/{formData.unit})</label>
              <input
                id="add-price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
                required
              />
            </div>
          </div>
          <div>
            <label htmlFor="add-category" className="block text-sm font-medium text-app mb-2">หมวดหมู่</label>
            <select
              id="add-category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
            >
              <option value="ของใช้ในบ้าน">ของใช้ในบ้าน</option>
              <option value="ของตกแต่ง">ของตกแต่ง</option>
              <option value="ของชำ">ของชำ</option>
            </select>
          </div>
          <div>
            <label htmlFor="add-supplier" className="block text-sm font-medium text-app mb-2">ซัพพลายเออร์</label>
            <input
              id="add-supplier"
              type="text"
              value={formData.supplier}
              onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
              className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
              placeholder="เช่น Daiso Japan"
              required
            />
          </div>
          <div>
            <label htmlFor="add-threshold" className="block text-sm font-medium text-app mb-2">เกณฑ์แจ้งเตือน (จำนวน)</label>
            <input
              id="add-threshold"
              type="number"
              value={formData.lowStockThreshold}
              onChange={(e) => setFormData({ ...formData, lowStockThreshold: e.target.value })}
              className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
              placeholder="ระบบจะแจ้งเตือนเมื่อสต็อกต่ำกว่า 20% ของเกณฑ์นี้"
              required
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
            <label htmlFor="edit-name" className="block text-sm font-medium text-app mb-2">ชื่อสินค้า</label>
            <input
              id="edit-name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="edit-quantity" className="block text-sm font-medium text-app mb-2">จำนวน</label>
              <input
                id="edit-quantity"
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
                required
              />
            </div>
            <div>
              <label htmlFor="edit-unit" className="block text-sm font-medium text-app mb-2">หน่วย</label>
              <select
                id="edit-unit"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
              >
                <option value="ชิ้น">ชิ้น</option>
                <option value="แพ็ค">แพ็ค</option>
                <option value="ชุด">ชุด</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="edit-cost" className="block text-sm font-medium text-app mb-2">ต้นทุน (บาท/{formData.unit})</label>
              <input
                id="edit-cost"
                type="number"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
                required
              />
            </div>
            <div>
              <label htmlFor="edit-price" className="block text-sm font-medium text-app mb-2">ราคาขาย (บาท/{formData.unit})</label>
              <input
                id="edit-price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
                required
              />
            </div>
          </div>
          <div>
            <label htmlFor="edit-category" className="block text-sm font-medium text-app mb-2">หมวดหมู่</label>
            <select
              id="edit-category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
            >
              <option value="ของใช้ในบ้าน">ของใช้ในบ้าน</option>
              <option value="ของตกแต่ง">ของตกแต่ง</option>
              <option value="ของชำ">ของชำ</option>
            </select>
          </div>
          <div>
            <label htmlFor="edit-supplier" className="block text-sm font-medium text-app mb-2">ซัพพลายเออร์</label>
            <input
              id="edit-supplier"
              type="text"
              value={formData.supplier}
              onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
              className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
              required
            />
          </div>
          <div>
            <label htmlFor="edit-threshold" className="block text-sm font-medium text-app mb-2">เกณฑ์แจ้งเตือน (จำนวน)</label>
            <input
              id="edit-threshold"
              type="number"
              value={formData.lowStockThreshold}
              onChange={(e) => setFormData({ ...formData, lowStockThreshold: e.target.value })}
              className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
              required
            />
          </div>
        </div>
      </ModalForm>
    </div>
  );
}

