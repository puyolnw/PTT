import { useMemo, useState } from "react";
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
const decimalFormatter = new Intl.NumberFormat("th-TH", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

interface StockItem {
  id: string;
  transferCode: string;
  category: string;
  categorySecondary: string;
  name: string;
  barcode: string;
  unit: string;
  quantity: number;
  cost: number;
  price: number;
  expiry: string;
  supplier: string;
  lowStockThreshold: number;
}

// Mock data matching legacy stock layout
const initialStockData: StockItem[] = [
  {
    id: "00540",
    transferCode: "001001",
    category: "อุปกรณ์ทำความสะอาด",
    categorySecondary: "03",
    name: "ไม้กวาดดอกหญ้า",
    barcode: "00540",
    unit: "ชิ้น",
    quantity: 0,
    cost: 28,
    price: 42,
    expiry: "2025-01-31",
    supplier: "คลังหลัก",
    lowStockThreshold: 50,
  },
  {
    id: "00541",
    transferCode: "001001",
    category: "อุปกรณ์ทำความสะอาด",
    categorySecondary: "03",
    name: "ม็อบดันฝุ่นสแตนเลส",
    barcode: "00541",
    unit: "ชิ้น",
    quantity: 0,
    cost: 30,
    price: 42,
    expiry: "2025-01-31",
    supplier: "คลังหลัก",
    lowStockThreshold: 50,
  },
  {
    id: "00542",
    transferCode: "001001",
    category: "อุปกรณ์ทำความสะอาด",
    categorySecondary: "03",
    name: "ม็อบกดเหล็กด้ามยาว",
    barcode: "00542",
    unit: "ชิ้น",
    quantity: 0,
    cost: 32,
    price: 45,
    expiry: "2025-01-31",
    supplier: "คลังหลัก",
    lowStockThreshold: 50,
  },
  {
    id: "00543",
    transferCode: "001001",
    category: "อุปกรณ์ทำความสะอาด",
    categorySecondary: "03",
    name: "ราวตักสิลาผ้าไม้ไผ่ยาว",
    barcode: "00543",
    unit: "ชิ้น",
    quantity: 0,
    cost: 33,
    price: 45,
    expiry: "2025-01-31",
    supplier: "คลังหลัก",
    lowStockThreshold: 40,
  },
  {
    id: "00544",
    transferCode: "001001",
    category: "อุปกรณ์ทำความสะอาด",
    categorySecondary: "03",
    name: "ด้ามถูพื้นไม้เนื้อแข็ง",
    barcode: "00544",
    unit: "ชิ้น",
    quantity: 0,
    cost: 20,
    price: 30,
    expiry: "2025-02-28",
    supplier: "คลังหลัก",
    lowStockThreshold: 40,
  },
  {
    id: "00545",
    transferCode: "001001",
    category: "อุปกรณ์ทำความสะอาด",
    categorySecondary: "03",
    name: "ม็อบเช็ดกระจกสแตนเลส",
    barcode: "00545",
    unit: "ชิ้น",
    quantity: 0,
    cost: 26,
    price: 39,
    expiry: "2025-02-28",
    supplier: "คลังหลัก",
    lowStockThreshold: 40,
  },
  {
    id: "00546",
    transferCode: "001001",
    category: "อุปกรณ์ทำความสะอาด",
    categorySecondary: "03",
    name: "ไม้กวาดพลาสติกสีแดง",
    barcode: "00546",
    unit: "ชิ้น",
    quantity: 0,
    cost: 26,
    price: 39,
    expiry: "2025-03-15",
    supplier: "คลังหลัก",
    lowStockThreshold: 40,
  },
  {
    id: "00547",
    transferCode: "001001",
    category: "อุปกรณ์ทำความสะอาด",
    categorySecondary: "03",
    name: "ไฮยีนครอสบาร์",
    barcode: "00547",
    unit: "ชุด",
    quantity: 0,
    cost: 14,
    price: 20,
    expiry: "2025-03-15",
    supplier: "ศูนย์จัดจำหน่าย",
    lowStockThreshold: 30,
  },
  {
    id: "00548",
    transferCode: "001001",
    category: "อุปกรณ์ทำความสะอาด",
    categorySecondary: "03",
    name: "ไม้กวาดทางมะพร้าว",
    barcode: "00548",
    unit: "ชิ้น",
    quantity: 0,
    cost: 12,
    price: 20,
    expiry: "2025-04-10",
    supplier: "ศูนย์จัดจำหน่าย",
    lowStockThreshold: 30,
  },
  {
    id: "00549",
    transferCode: "001001",
    category: "อุปกรณ์ทำความสะอาด",
    categorySecondary: "03",
    name: "ไฮยีนกลิ่นซีตรัส",
    barcode: "00549",
    unit: "ชิ้น",
    quantity: 0,
    cost: 5,
    price: 7,
    expiry: "2025-04-10",
    supplier: "ศูนย์จัดจำหน่าย",
    lowStockThreshold: 30,
  },
  {
    id: "01001",
    transferCode: "001001",
    category: "สินค้าอุปโภค",
    categorySecondary: "01",
    name: "แชมพูลูกปัด 1 ระดับ (ขวดเล็ก)",
    barcode: "01001",
    unit: "ขวด",
    quantity: 95,
    cost: 28,
    price: 40,
    expiry: "2025-05-05",
    supplier: "โรงงาน PNC",
    lowStockThreshold: 60,
  },
  {
    id: "01002",
    transferCode: "001001",
    category: "สินค้าอุปโภค",
    categorySecondary: "01",
    name: "แชมพูลูกปัด 2 ระดับ (ขวดใหญ่)",
    barcode: "01002",
    unit: "ขวด",
    quantity: 23,
    cost: 40,
    price: 60,
    expiry: "2025-05-05",
    supplier: "โรงงาน PNC",
    lowStockThreshold: 60,
  },
  {
    id: "01003",
    transferCode: "001001",
    category: "สินค้าอุปโภค",
    categorySecondary: "01",
    name: "น้ำยาปรับผ้านุ่ม 2.5 ลิตร",
    barcode: "01003",
    unit: "แกลลอน",
    quantity: 1,
    cost: 45,
    price: 70,
    expiry: "2025-05-05",
    supplier: "โรงงาน PNC",
    lowStockThreshold: 40,
  },
];

const getNextProductCode = (items: StockItem[]) => {
  const numericCodes = items
    .map((item) => Number(item.id))
    .filter((code) => !Number.isNaN(code));
  const nextCode = numericCodes.length ? Math.max(...numericCodes) + 1 : 1;
  return nextCode.toString().padStart(5, "0");
};

const createEmptyFormState = () => ({
  name: "",
  quantity: "",
  unit: "ชิ้น",
  cost: "",
  price: "",
  expiry: "",
  supplier: "",
  lowStockThreshold: "",
  category: "อุปกรณ์ทำความสะอาด",
  transferCode: "001001",
  categorySecondary: "01",
  barcode: "",
});

export default function Stock() {
  const { currentShop } = useShop();
  const shopName = currentShop?.name || "ปึงหงี่เชียง";

  const [stockData, setStockData] = useState<StockItem[]>(initialStockData);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<StockItem | null>(null);
  const [formData, setFormData] = useState(createEmptyFormState());
  const nextProductCode = useMemo(() => getNextProductCode(stockData), [stockData]);

  // Calculate stock status
  const getStockStatus = (item: StockItem) => {
    const percentage =
      item.lowStockThreshold > 0 ? (item.quantity / item.lowStockThreshold) * 100 : 100;
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
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !query ||
      item.name.toLowerCase().includes(query) ||
      item.supplier.toLowerCase().includes(query) ||
      item.id.toLowerCase().includes(query) ||
      item.transferCode.toLowerCase().includes(query) ||
      item.barcode.toLowerCase().includes(query);
    const matchesCategory = !categoryFilter || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Low stock items
  const lowStockItems = stockData.filter((item) => {
    const status = getStockStatus(item);
    return status.type === "critical" || status.type === "warning" || status.type === "expiring";
  });

  const handleAddItem = () => {
    const newProductCode = getNextProductCode(stockData);
    const newItem: StockItem = {
      id: newProductCode,
      transferCode: formData.transferCode || "001001",
      category: formData.category || "ไม่ระบุหมวดหมู่",
      categorySecondary: formData.categorySecondary || "01",
      name: formData.name,
      barcode: formData.barcode || newProductCode,
      unit: formData.unit,
      quantity: Number(formData.quantity) || 0,
      cost: Number(formData.cost) || 0,
      price: Number(formData.price) || 0,
      expiry: formData.expiry,
      supplier: formData.supplier,
      lowStockThreshold: Number(formData.lowStockThreshold) || 0,
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
              name: formData.name,
              quantity: Number(formData.quantity) || 0,
              unit: formData.unit,
              cost: Number(formData.cost) || 0,
              price: Number(formData.price) || 0,
              expiry: formData.expiry,
              supplier: formData.supplier,
              lowStockThreshold: Number(formData.lowStockThreshold) || 0,
              category: formData.category || selectedItem.category,
              transferCode: formData.transferCode || selectedItem.transferCode,
              categorySecondary: formData.categorySecondary || selectedItem.categorySecondary,
              barcode: formData.barcode || selectedItem.barcode,
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
    setFormData(createEmptyFormState());
  };

  const openEditModal = (item: StockItem) => {
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
      transferCode: item.transferCode,
      categorySecondary: item.categorySecondary,
      barcode: item.barcode,
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
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-sky-50 to-blue-50 border border-app/40 text-[11px] uppercase tracking-wide text-slate-600">
                <th className="py-3 px-3 text-center font-semibold">ลำดับ</th>
                <th className="py-3 px-3 text-left font-semibold">รหัสสินค้า</th>
                <th className="py-3 px-3 text-left font-semibold">รหัสโอน</th>
                <th className="py-3 px-3 text-left font-semibold">หมวดหลัก</th>
                <th className="py-3 px-3 text-left font-semibold">ชื่อสินค้า</th>
                <th className="py-3 px-3 text-center font-semibold">หมวดรอง</th>
                <th className="py-3 px-3 text-left font-semibold">รหัสบาร์โค้ด</th>
                <th className="py-3 px-3 text-left font-semibold">ชื่อหน่วย</th>
                <th className="py-3 px-3 text-right font-semibold">ราคาขาย</th>
                <th className="py-3 px-3 text-right font-semibold">คงเหลือ</th>
                <th className="py-3 px-3 text-right font-semibold">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {filteredStock.map((item, index) => {
                const status = getStockStatus(item);
                const qtyColor =
                  status.type === "critical"
                    ? "text-red-500"
                    : status.type === "warning"
                    ? "text-orange-500"
                    : status.type === "expiring"
                    ? "text-amber-500"
                    : "text-emerald-500";
                return (
                  <tr
                    key={item.id}
                    className="border-b border-app/30 hover:bg-sky-50/70 transition-colors"
                  >
                    <td className="py-2.5 px-3 text-center text-xs text-muted font-medium">
                      {String(index + 1).padStart(2, "0")}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-app">{item.id}</td>
                    <td className="py-2.5 px-3 font-mono text-xs text-muted">{item.transferCode}</td>
                    <td className="py-2.5 px-3 text-xs text-muted">{item.category}</td>
                    <td className="py-2.5 px-3 text-app font-medium">{item.name}</td>
                    <td className="py-2.5 px-3 text-center text-xs font-semibold text-app">
                      {item.categorySecondary}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-xs text-muted">{item.barcode}</td>
                    <td className="py-2.5 px-3 text-xs text-muted">{item.unit}</td>
                    <td className="py-2.5 px-3 text-right text-app font-semibold">
                      {decimalFormatter.format(item.price)}
                    </td>
                    <td className={`py-2.5 px-3 text-right font-semibold ${qtyColor}`}>
                      {numberFormatter.format(item.quantity)}
                    </td>
                    <td className="py-2.5 px-3">
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
          <div className="text-xs text-muted bg-soft border border-app rounded-lg px-3 py-2">
            รหัสสินค้าถัดไป:{" "}
            <span className="font-semibold text-app">{nextProductCode}</span>{" "}
            (ระบบจะสร้างให้อัตโนมัติเมื่อบันทึก)
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-app mb-2">รหัสโอน</label>
              <input
                type="text"
                value={formData.transferCode}
                onChange={(e) => setFormData({ ...formData, transferCode: e.target.value })}
                className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-app mb-2">หมวดหลัก</label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-app mb-2">หมวดรอง (รหัส)</label>
              <input
                type="text"
                value={formData.categorySecondary}
                onChange={(e) => setFormData({ ...formData, categorySecondary: e.target.value })}
                className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
              />
            </div>
          </div>
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
                <option value="ชุด">ชุด</option>
                <option value="ขวด">ขวด</option>
                <option value="แกลลอน">แกลลอน</option>
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
            <label className="block text-sm font-medium text-app mb-2">รหัสบาร์โค้ด</label>
            <input
              type="text"
              value={formData.barcode}
              onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
              className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
              placeholder="หากเว้นว่าง ระบบจะใช้รหัสสินค้า"
            />
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
          {selectedItem && (
            <div className="text-xs text-muted bg-soft border border-app rounded-lg px-3 py-2 flex flex-wrap gap-2">
              <span>
                รหัสสินค้า: <span className="font-semibold text-app">{selectedItem.id}</span>
              </span>
              <span>
                บาร์โค้ด: <span className="font-semibold text-app">{selectedItem.barcode}</span>
              </span>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-app mb-2">รหัสโอน</label>
              <input
                type="text"
                value={formData.transferCode}
                onChange={(e) => setFormData({ ...formData, transferCode: e.target.value })}
                className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-app mb-2">หมวดหลัก</label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-app mb-2">หมวดรอง (รหัส)</label>
              <input
                type="text"
                value={formData.categorySecondary}
                onChange={(e) => setFormData({ ...formData, categorySecondary: e.target.value })}
                className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
              />
            </div>
          </div>
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
                <option value="ชุด">ชุด</option>
                <option value="ขวด">ขวด</option>
                <option value="แกลลอน">แกลลอน</option>
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
            <label className="block text-sm font-medium text-app mb-2">รหัสบาร์โค้ด</label>
            <input
              type="text"
              value={formData.barcode}
              onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
              className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
            />
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
        </div>
      </ModalForm>
    </div>
  );
}

