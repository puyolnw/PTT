import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Package,
  Plus,
  ShoppingBag,
  TrendingUp,
  Store,
  AlertCircle,
  ClipboardList,
  Search,
  Gift,
  Upload,
  Download,
} from "lucide-react";
import ModalForm from "@/components/ModalForm";

const currencyFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const numberFormatter = new Intl.NumberFormat("th-TH");

interface StockItem {
  id: string;
  name: string;
  category: string;
  sourceVillage: string;
  quantity: number;
  unit: string;
  cost: number;
  price: number;
  expiry: string;
  supplier: string;
  lowStockThreshold: number;
  artisanCode: string;
  lastOrdered?: string;
}

const initialStockData: StockItem[] = [
  {
    id: "P-001",
    name: "ข้าวตังหน้าหมูหยอง 80g",
    category: "ขนมขบเคี้ยว",
    sourceVillage: "",
    quantity: 5,
    unit: "ชิ้น",
    cost: 0,
    price: 0,
    expiry: "",
    supplier: "",
    lowStockThreshold: 10,
    artisanCode: "",
    lastOrdered: "24/08/25",
  },
  {
    id: "P-002",
    name: "แหนมเนือง",
    category: "อาหารสด",
    sourceVillage: "",
    quantity: 150,
    unit: "ชิ้น",
    cost: 0,
    price: 0,
    expiry: "",
    supplier: "",
    lowStockThreshold: 50,
    artisanCode: "",
    lastOrdered: "24/08/25",
  },
  {
    id: "P-003",
    name: "เค้กมะพร้าวเนยสด",
    category: "เบเกอรี่",
    sourceVillage: "",
    quantity: 2,
    unit: "ชิ้น",
    cost: 0,
    price: 0,
    expiry: "",
    supplier: "",
    lowStockThreshold: 8,
    artisanCode: "",
    lastOrdered: "20/08/25",
  },
  {
    id: "P-004",
    name: "คุกกี้สิงค์โปร์",
    category: "ขนมขบเคี้ยว",
    sourceVillage: "",
    quantity: 45,
    unit: "ชิ้น",
    cost: 0,
    price: 0,
    expiry: "",
    supplier: "",
    lowStockThreshold: 20,
    artisanCode: "",
    lastOrdered: "24/08/25",
  },
  {
    id: "P-005",
    name: "หมูหยอง 1 ขีด",
    category: "ของแห้ง",
    sourceVillage: "",
    quantity: 8,
    unit: "ชิ้น",
    cost: 0,
    price: 0,
    expiry: "",
    supplier: "",
    lowStockThreshold: 15,
    artisanCode: "",
    lastOrdered: "24/08/25",
  },
];

export default function OtopStock() {
  const [stockData, setStockData] = useState(initialStockData);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"inventory" | "transactions" | "planning">("inventory");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: "ขนมขบเคี้ยว",
    sourceVillage: "",
    quantity: "",
    unit: "ชิ้น",
    cost: "",
    price: "",
    expiry: "",
    supplier: "",
    lowStockThreshold: "",
    artisanCode: "",
  });

  const categories = useMemo(
    () => ["ขนมขบเคี้ยว", "อาหารสด", "เบเกอรี่", "ของแห้ง", "สุขภาพ", "หัตถกรรม"],
    []
  );

  const getStockStatus = (item: StockItem) => {
    if (item.quantity === 0) {
      return { label: "สินค้าหมด", color: "red" };
    }
    if (item.quantity < item.lowStockThreshold) {
      return { label: "ใกล้หมด", color: "orange" };
    }
    return { label: "ปกติ", color: "green" };
  };

  const filteredStock = stockData.filter((item) => {
    if (!searchQuery) return true;
    return (
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const inventoryValue = stockData.reduce((sum, item) => sum + item.quantity * item.price, 0);
  const totalPurchaseValue = 61887.75; // Mock value from image
  const itemsToReorder = stockData.filter(
    (item) => item.quantity < item.lowStockThreshold || item.quantity === 0
  ).length;

  const handleAddItem = () => {
    const today = new Date();
    const formattedDate = `${String(today.getDate()).padStart(2, "0")}/${String(today.getMonth() + 1).padStart(2, "0")}/${String(today.getFullYear()).slice(-2)}`;
    
    const newItem: StockItem = {
      id: `P-${(stockData.length + 1).toString().padStart(3, "0")}`,
      name: formData.name,
      category: formData.category,
      sourceVillage: formData.sourceVillage,
      quantity: Number(formData.quantity) || 0,
      unit: formData.unit,
      cost: Number(formData.cost) || 0,
      price: Number(formData.price) || 0,
      expiry: formData.expiry,
      supplier: formData.supplier,
      lowStockThreshold: Number(formData.lowStockThreshold) || 0,
      artisanCode: formData.artisanCode || "N/A",
      lastOrdered: formattedDate,
    };

    setStockData([newItem, ...stockData]);
    setIsAddModalOpen(false);
    resetForm();
  };


  const resetForm = () => {
    setFormData({
      name: "",
      category: "ขนมขบเคี้ยว",
      sourceVillage: "",
      quantity: "",
      unit: "ชิ้น",
      cost: "",
      price: "",
      expiry: "",
      supplier: "",
      lowStockThreshold: "",
      artisanCode: "",
    });
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h2 className="text-2xl font-bold text-app mb-2 font-display flex items-center gap-2">
          <Gift className="w-8 h-8 text-purple-600" />
          จัดการสต็อก - ศูนย์ OTOP คอมมูนิตี้
        </h2>
        <p className="text-muted text-sm mt-1">
          บริหารจัดการคลังสินค้า OTOP นำเข้าข้อมูลจากไฟล์ Stock และวางแผนการสั่งซื้อ
        </p>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4"
        >
          <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
            <ShoppingBag className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <div className="text-xs text-gray-500">รายการสินค้าทั้งหมด</div>
            <div className="text-xl font-bold text-slate-800">{stockData.length} รายการ</div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4"
        >
          <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
            <TrendingUp className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <div className="text-xs text-gray-500">ยอดซื้อรวม (Buy+Vat)</div>
            <div className="text-xl font-bold text-slate-800">{currencyFormatter.format(totalPurchaseValue)}</div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4"
        >
          <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
            <Store className="h-6 w-6 text-emerald-600" />
          </div>
          <div>
            <div className="text-xs text-gray-500">มูลค่าสต็อกขาย</div>
            <div className="text-xl font-bold text-slate-800">{currencyFormatter.format(inventoryValue)}</div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4"
        >
          <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center shrink-0">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <div className="text-xs text-gray-500">สินค้าต้องสั่งซื้อเพิ่ม</div>
            <div className="text-xl font-bold text-red-600">{itemsToReorder} รายการ</div>
          </div>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-white rounded-t-lg px-4 pt-2">
        <button
          onClick={() => setActiveTab("inventory")}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "inventory"
              ? "border-purple-600 text-purple-600 bg-purple-50/50"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <Package className="h-4 w-4" />
          สต็อกคงเหลือ (Inventory)
        </button>
        <button
          onClick={() => setActiveTab("transactions")}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "transactions"
              ? "border-purple-600 text-purple-600 bg-purple-50/50"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          

          <ClipboardList className="h-4 w-4" />
          วางแผนสั่งซื้อ (Planning)
        </button>
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-b-xl shadow-sm border border-t-0 border-gray-200 overflow-hidden p-4">
        {/* Search and Add Button */}
        <div className="flex flex-col lg:flex-row justify-between items-center gap-4 mb-4">
          <div className="relative flex-1 lg:w-80 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              placeholder="ค้นหาชื่อสินค้า, รหัส..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              type="text"
            />
          </div>
          <div className="flex gap-2">
            <label className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 rounded-lg text-sm font-medium transition-colors shadow-sm cursor-pointer">
              <Upload className="h-4 w-4" />
              นำเข้า Excel
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    alert(`กำลังนำเข้าข้อมูลจากไฟล์ ${file.name}\n\n(ฟังก์ชันนี้ยังเป็น Mock - ระบบจะอ่านไฟล์และอัปเดตสต็อกอัตโนมัติ)`);
                  }
                  e.target.value = "";
                }}
                className="hidden"
              />
            </label>
            <button
              onClick={() => {
                alert("กำลังส่งออกข้อมูลสต็อกเป็นไฟล์ Excel...\n\n(ฟังก์ชันนี้ยังเป็น Mock)");
              }}
              className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 rounded-lg text-sm font-medium transition-colors shadow-sm"
            >
              <Download className="h-4 w-4" />
              ส่งออก
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
            >
              <Plus className="h-4 w-4" />
              เพิ่มรายการ
            </button>
          </div>
        </div>

        {/* Table */}
        {activeTab === "inventory" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider border-b border-gray-200">
                  <th className="px-6 py-4 font-medium">รหัส/ชื่อสินค้า</th>
                  <th className="px-6 py-4 font-medium">หมวดหมู่</th>
                  <th className="px-6 py-4 font-medium text-center">คงเหลือ (On Hand)</th>
                  <th className="px-6 py-4 font-medium text-center">จุดสั่งซื้อ (Min)</th>
                  <th className="px-6 py-4 font-medium text-center">สถานะ</th>
                  <th className="px-6 py-4 font-medium">สั่งซื้อล่าสุด</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filteredStock.map((item) => {
                  const status = getStockStatus(item);
                  const statusClass =
                    status.color === "red"
                      ? "bg-red-100 text-red-700"
                      : status.color === "orange"
                      ? "bg-orange-100 text-orange-700"
                      : "bg-green-100 text-green-700";

                  return (
                    <tr key={item.id} className="hover:bg-purple-50/20">
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-800">{item.name}</div>
                        <div className="text-xs text-gray-400">{item.id}</div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{item.category}</td>
                      <td className="px-6 py-4 text-center font-bold text-slate-700">
                        {numberFormatter.format(item.quantity)}
                      </td>
                      <td className="px-6 py-4 text-center text-gray-500">
                        {item.lowStockThreshold}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClass}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500">{item.lastOrdered || "-"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filteredStock.length === 0 && (
              <div className="text-center py-12 text-muted">ไม่พบข้อมูลสินค้า</div>
            )}
          </div>
        )}

        {activeTab === "transactions" && (
          <div className="text-center py-12 text-muted">
            กำลังพัฒนาระบบประวัติการซื้อเข้า
          </div>
        )}

        {activeTab === "planning" && (
          <div className="text-center py-12 text-muted">
            กำลังพัฒนาระบบวางแผนสั่งซื้อ
          </div>
        )}
      </div>

      <ModalForm
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          resetForm();
        }}
        title="เพิ่มสินค้า OTOP"
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-app mb-2">หมวดหมู่</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-app mb-2">หมู่บ้าน/จังหวัด</label>
              <input
                type="text"
                value={formData.sourceVillage}
                onChange={(e) => setFormData({ ...formData, sourceVillage: e.target.value })}
                className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
                placeholder="เช่น บ้านโคก สุรินทร์"
              />
            </div>
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
                <option value="ผืน">ผืน</option>
                <option value="กล่อง">กล่อง</option>
                <option value="ชุด">ชุด</option>
                <option value="ลัง">ลัง</option>
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-app mb-2">วันหมดอายุ / รอบจัดงาน</label>
              <input
                type="date"
                value={formData.expiry}
                onChange={(e) => setFormData({ ...formData, expiry: e.target.value })}
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
                placeholder="เช่น 20"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-app mb-2">ผู้ผลิต / กลุ่มชุมชน</label>
              <input
                type="text"
                value={formData.supplier}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-app mb-2">Artisan Code</label>
              <input
                type="text"
                value={formData.artisanCode}
                onChange={(e) => setFormData({ ...formData, artisanCode: e.target.value })}
                className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
                placeholder="เช่น SRN-01"
              />
            </div>
          </div>
        </div>
      </ModalForm>
    </div>
  );
}


