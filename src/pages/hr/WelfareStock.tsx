import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { 
  Package, 
  Gift, 
  Home as HomeIcon, 
  Fuel, 
  Plane, 
  HeartHandshake,
  GraduationCap,
  Plus,
  Search,
  Edit2,
  Trash2,
  AlertCircle,
  TrendingDown
} from "lucide-react";
import ModalForm from "@/components/ModalForm";

interface StockItem {
  id: number;
  type: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  minStock: number;
  maxStock: number;
  costPerUnit: number;
  totalCost: number;
  lastRestockDate: string;
  status: "ปกติ" | "เตือน" | "ไม่พอ";
  notes?: string;
}

export default function WelfareStock() {
  const [activeTab, setActiveTab] = useState<string>("benefits");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [stockItems, setStockItems] = useState<StockItem[]>([
    // การเบิก (benefits)
    { id: 1, type: "benefits", name: "ชุดฟอร์ม", category: "ปั๊ม", quantity: 45, unit: "ชุด", minStock: 20, maxStock: 100, costPerUnit: 500, totalCost: 22500, lastRestockDate: "2025-01-10", status: "ปกติ", notes: "ชุดฟอร์มสำหรับพนักงานปั๊ม" },
    { id: 2, type: "benefits", name: "เสื้อกันหนาว", category: "ปั๊ม", quantity: 38, unit: "ตัว", minStock: 15, maxStock: 80, costPerUnit: 800, totalCost: 30400, lastRestockDate: "2025-01-05", status: "ปกติ", notes: "เสื้อกันหนาวทุกแผนก" },
    { id: 3, type: "benefits", name: "รองเท้า", category: "ปั๊ม", quantity: 12, unit: "คู่", minStock: 20, maxStock: 60, costPerUnit: 1200, totalCost: 14400, lastRestockDate: "2024-12-20", status: "เตือน", notes: "รองเท้าอย่างดี - ต้องเบิกเพิ่ม" },
    { id: 4, type: "benefits", name: "ชุดฟอร์ม", category: "เซเว่น", quantity: 28, unit: "ชุด", minStock: 15, maxStock: 60, costPerUnit: 450, totalCost: 12600, lastRestockDate: "2025-01-12", status: "ปกติ" },
    { id: 5, type: "benefits", name: "เสื้อกันหนาว", category: "เซเว่น", quantity: 22, unit: "ตัว", minStock: 10, maxStock: 50, costPerUnit: 750, totalCost: 16500, lastRestockDate: "2025-01-08", status: "ปกติ" },

    // BONUS รายปี (bonus)
    { id: 6, type: "bonus", name: "งบประมาณ BONUS ระดับ 1", category: "ทั่วไป", quantity: 1, unit: "งบ", minStock: 1, maxStock: 1, costPerUnit: 2000000, totalCost: 2000000, lastRestockDate: "2025-01-01", status: "ปกติ", notes: "งบประมาณปลายปี - BONUS รางวัล" },
    { id: 7, type: "bonus", name: "งบประมาณ BONUS ระดับ 2", category: "ทั่วไป", quantity: 1, unit: "งบ", minStock: 1, maxStock: 1, costPerUnit: 1500000, totalCost: 1500000, lastRestockDate: "2025-01-01", status: "ปกติ" },

    // หอพัก (dormitory)
    { id: 8, type: "dormitory", name: "หอพัก A - ห้องว่าง", category: "หอพัก", quantity: 15, unit: "ห้อง", minStock: 5, maxStock: 20, costPerUnit: 3000, totalCost: 45000, lastRestockDate: "2025-01-01", status: "ปกติ", notes: "หอพัก A - พักฟรี + ค่าน้ำ/ไฟ" },
    { id: 9, type: "dormitory", name: "หอพัก B - ห้องว่าง", category: "หอพัก", quantity: 8, unit: "ห้อง", minStock: 3, maxStock: 15, costPerUnit: 3000, totalCost: 24000, lastRestockDate: "2025-01-01", status: "เตือน", notes: "หอพัก B - พักฟรี + ค่าน้ำ/ไฟ" },
    { id: 10, type: "dormitory", name: "หอพัก C - ห้องว่าง", category: "หอพัก", quantity: 20, unit: "ห้อง", minStock: 5, maxStock: 25, costPerUnit: 3000, totalCost: 60000, lastRestockDate: "2025-01-01", status: "ปกติ", notes: "หอพัก C - พักฟรี + ค่าน้ำ/ไฟ" },

    // ค่าน้ำมัน (fuel)
    { id: 11, type: "fuel", name: "งบค่าน้ำมัน", category: "ขับรถ", quantity: 125000, unit: "บาท", minStock: 50000, maxStock: 200000, costPerUnit: 1, totalCost: 125000, lastRestockDate: "2025-01-01", status: "ปกติ", notes: "งบค่าน้ำมันสำหรับคนขับรถและช่าง" },

    // ทัศนศึกษา (trip)
    { id: 12, type: "trip", name: "งบทัศนศึกษา - ในประเทศ", category: "ทัศนศึกษา", quantity: 1, unit: "งบ", minStock: 1, maxStock: 1, costPerUnit: 500000, totalCost: 500000, lastRestockDate: "2025-01-01", status: "ปกติ", notes: "งบทัศนศึกษาพาสุข - ในประเทศ" },
    { id: 13, type: "trip", name: "งบทัศนศึกษา - ต่างประเทศ", category: "ทัศนศึกษา", quantity: 1, unit: "งบ", minStock: 1, maxStock: 1, costPerUnit: 1000000, totalCost: 1000000, lastRestockDate: "2025-01-01", status: "ปกติ", notes: "งบทัศนศึกษาพาสุข - ต่างประเทศ" },

    // เยี่ยมไข้/คลอด/งานศพ (condolence)
    { id: 14, type: "condolence", name: "งบเยี่ยมไข้/คลอด/งานศพ", category: "สวัสดิการ", quantity: 250000, unit: "บาท", minStock: 50000, maxStock: 300000, costPerUnit: 1, totalCost: 250000, lastRestockDate: "2025-01-01", status: "ปกติ", notes: "งบใส่ซองให้พนักงาน เยี่ยมไข้ คลอด งานศพ" },

    // ทุนการศึกษา (scholarship)
    { id: 15, type: "scholarship", name: "งบทุนการศึกษาบุตร", category: "การศึกษา", quantity: 1, unit: "งบ", minStock: 1, maxStock: 1, costPerUnit: 500000, totalCost: 500000, lastRestockDate: "2025-01-01", status: "ปกติ", notes: "งบทุนการศึกษาบุตร - ปีละ 2 คน" },
  ]);

  const [formData, setFormData] = useState({
    type: "benefits",
    name: "",
    category: "",
    quantity: "",
    unit: "",
    minStock: "",
    maxStock: "",
    costPerUnit: "",
    lastRestockDate: new Date().toISOString().split('T')[0],
    notes: ""
  });

  const tabs = [
    { id: "benefits", label: "การเบิก", icon: Package },
    { id: "bonus", label: "BONUS รายปี", icon: Gift },
    { id: "dormitory", label: "หอพัก", icon: HomeIcon },
    { id: "fuel", label: "ค่าน้ำมัน", icon: Fuel },
    { id: "trip", label: "ทัศนศึกษา", icon: Plane },
    { id: "condolence", label: "เยี่ยมไข้/คลอด", icon: HeartHandshake },
    { id: "scholarship", label: "ทุนการศึกษา", icon: GraduationCap },
  ];

  // Filter and search
  const filteredItems = useMemo(() => {
    return stockItems.filter(item => {
      const matchesTab = item.type === activeTab;
      const matchesSearch = !searchQuery || 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [stockItems, activeTab, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const filtered = filteredItems;
    return {
      totalItems: filtered.length,
      lowStock: filtered.filter(item => item.status === "เตือน").length,
      outOfStock: filtered.filter(item => item.status === "ไม่พอ").length,
      totalValue: filtered.reduce((sum, item) => sum + item.totalCost, 0)
    };
  }, [filteredItems]);

  const handleSubmit = () => {
    if (!formData.name || !formData.category) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    const newItem: StockItem = {
      id: Math.max(...stockItems.map(item => item.id), 0) + 1,
      type: formData.type,
      name: formData.name,
      category: formData.category,
      quantity: parseInt(formData.quantity) || 0,
      unit: formData.unit || "ชิ้น",
      minStock: parseInt(formData.minStock) || 0,
      maxStock: parseInt(formData.maxStock) || 0,
      costPerUnit: parseFloat(formData.costPerUnit) || 0,
      totalCost: (parseInt(formData.quantity) || 0) * (parseFloat(formData.costPerUnit) || 0),
      lastRestockDate: formData.lastRestockDate,
      status: "ปกติ",
      notes: formData.notes
    };

    setStockItems([...stockItems, newItem]);
    setIsModalOpen(false);
    setFormData({
      type: activeTab,
      name: "",
      category: "",
      quantity: "",
      unit: "",
      minStock: "",
      maxStock: "",
      costPerUnit: "",
      lastRestockDate: new Date().toISOString().split('T')[0],
      notes: ""
    });
    alert("เพิ่มสต๊อกสำเร็จ!");
  };

  const handleDelete = (id: number) => {
    if (confirm("คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้?")) {
      setStockItems(stockItems.filter(item => item.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-app mb-2 font-display flex items-center gap-3">
            <Package className="w-8 h-8 text-ptt-cyan" />
            สต๊อกสวัสดิการ
          </h1>
          <p className="text-muted font-light">
            จัดการสต๊อกสินค้า และงบประมาณสวัสดิการพนักงาน
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-6 py-3 bg-ptt-cyan hover:bg-ptt-cyan/80 
                   text-app rounded-xl transition-all duration-200 font-semibold 
                   shadow-lg hover:shadow-xl hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5" />
          เพิ่มสต๊อก
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-soft border border-app rounded-xl p-6"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-muted text-sm">รายการสต๊อก</p>
          </div>
          <p className="text-2xl font-bold text-app">{stats.totalItems}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-soft border border-app rounded-xl p-6"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-yellow-400" />
            </div>
            <p className="text-muted text-sm">เตือนสต๊อกต่ำ</p>
          </div>
          <p className="text-2xl font-bold text-yellow-400">{stats.lowStock}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-soft border border-app rounded-xl p-6"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-red-400" />
            </div>
            <p className="text-muted text-sm">หมดสต๊อก</p>
          </div>
          <p className="text-2xl font-bold text-red-400">{stats.outOfStock}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-soft border border-app rounded-xl p-6"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
              <Gift className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-muted text-sm">มูลค่ารวม</p>
          </div>
          <p className="text-2xl font-bold text-app">
            {new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(stats.totalValue)}
          </p>
        </motion.div>
      </div>

      {/* Tabs and Content */}
      <div className="bg-soft border border-app rounded-2xl overflow-hidden">
        <div className="flex flex-wrap border-b border-app bg-soft overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-4 md:px-6 py-4 text-sm font-medium transition-all whitespace-nowrap
                  ${activeTab === tab.id
                    ? "text-ptt-cyan border-b-2 border-ptt-cyan bg-soft"
                    : "text-muted hover:text-app hover:bg-soft/50"
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-app font-display">
              สต๊อก{tabs.find(t => t.id === activeTab)?.label}
            </h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                type="text"
                placeholder="ค้นหา..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 bg-soft border border-app rounded-lg text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue"
              />
            </div>
          </div>

          {/* Stock Table */}
          {filteredItems.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-soft border-b border-app">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-app">รายการ</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-app">หมวดหมู่</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-app">จำนวน</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-app">สต๊อกต่ำสุด</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-app">ราคา/หน่วย</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-app">มูลค่ารวม</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-app">สถานะ</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-app">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-app">
                  {filteredItems.map((item) => (
                    <motion.tr
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="hover:bg-soft/50 transition-colors"
                    >
                      <td className="px-4 py-3 text-sm text-app font-medium">{item.name}</td>
                      <td className="px-4 py-3 text-sm text-muted">{item.category}</td>
                      <td className="px-4 py-3 text-center text-sm text-app">
                        {item.quantity} {item.unit}
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-muted">
                        {item.minStock} {item.unit}
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-app font-mono">
                        {new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(item.costPerUnit)}
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-app font-mono font-semibold">
                        {new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(item.totalCost)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                          item.status === "ปกติ" ? "bg-green-500/20 text-green-400 border border-green-500/30" :
                          item.status === "เตือน" ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30" :
                          "bg-red-500/20 text-red-400 border border-red-500/30"
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button className="p-1.5 hover:bg-soft rounded-lg transition-colors" title="แก้ไข">
                            <Edit2 className="w-4 h-4 text-ptt-cyan" />
                          </button>
                          <button 
                            onClick={() => handleDelete(item.id)}
                            className="p-1.5 hover:bg-soft rounded-lg transition-colors" 
                            title="ลบ"
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 bg-soft/30 rounded-xl border border-app">
              <Package className="w-12 h-12 text-muted mx-auto mb-3 opacity-50" />
              <p className="text-muted font-light">ยังไม่มีรายการสต๊อก</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Stock Modal */}
      <ModalForm
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setFormData({
            type: activeTab,
            name: "",
            category: "",
            quantity: "",
            unit: "",
            minStock: "",
            maxStock: "",
            costPerUnit: "",
            lastRestockDate: new Date().toISOString().split('T')[0],
            notes: ""
          });
        }}
        title="เพิ่มสต๊อกใหม่"
        onSubmit={handleSubmit}
        submitLabel="บันทึก"
        size="lg"
      >
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-app mb-1.5">
              ประเภท <span className="text-red-400">*</span>
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-4 py-3 bg-soft border border-app rounded-xl
                       text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue focus:border-ptt-blue/50
                       transition-all duration-200 hover:border-app/50 cursor-pointer"
            >
              {tabs.map((tab) => (
                <option key={tab.id} value={tab.id}>
                  {tab.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-app mb-1.5">
              ชื่อสินค้า/งบประมาณ <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="เช่น ชุดฟอร์ม, งบ BONUS ฯลฯ"
              className="w-full px-4 py-3 bg-soft border border-app rounded-xl
                       text-app placeholder:text-muted
                       focus:outline-none focus:ring-2 focus:ring-ptt-blue focus:border-ptt-blue/50
                       transition-all duration-200 hover:border-app/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-app mb-1.5">
                หมวดหมู่ <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="เช่น ปั๊ม, เซเว่น ฯลฯ"
                className="w-full px-4 py-3 bg-soft border border-app rounded-xl
                         text-app placeholder:text-muted
                         focus:outline-none focus:ring-2 focus:ring-ptt-blue focus:border-ptt-blue/50
                         transition-all duration-200 hover:border-app/50"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-app mb-1.5">
                หน่วยนับ
              </label>
              <input
                type="text"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                placeholder="เช่น ชิ้น, ชุด, บาท ฯลฯ"
                className="w-full px-4 py-3 bg-soft border border-app rounded-xl
                         text-app placeholder:text-muted
                         focus:outline-none focus:ring-2 focus:ring-ptt-blue focus:border-ptt-blue/50
                         transition-all duration-200 hover:border-app/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-5">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-app mb-1.5">
                จำนวนปัจจุบัน
              </label>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                placeholder="0"
                className="w-full px-4 py-3 bg-soft border border-app rounded-xl
                         text-app placeholder:text-muted
                         focus:outline-none focus:ring-2 focus:ring-ptt-blue focus:border-ptt-blue/50
                         transition-all duration-200 hover:border-app/50"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-app mb-1.5">
                สต๊อกต่ำสุด
              </label>
              <input
                type="number"
                value={formData.minStock}
                onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                placeholder="0"
                className="w-full px-4 py-3 bg-soft border border-app rounded-xl
                         text-app placeholder:text-muted
                         focus:outline-none focus:ring-2 focus:ring-ptt-blue focus:border-ptt-blue/50
                         transition-all duration-200 hover:border-app/50"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-app mb-1.5">
                สต๊อกสูงสุด
              </label>
              <input
                type="number"
                value={formData.maxStock}
                onChange={(e) => setFormData({ ...formData, maxStock: e.target.value })}
                placeholder="0"
                className="w-full px-4 py-3 bg-soft border border-app rounded-xl
                         text-app placeholder:text-muted
                         focus:outline-none focus:ring-2 focus:ring-ptt-blue focus:border-ptt-blue/50
                         transition-all duration-200 hover:border-app/50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-app mb-1.5">
              ราคา/หน่วย (บาท)
            </label>
            <input
              type="number"
              value={formData.costPerUnit}
              onChange={(e) => setFormData({ ...formData, costPerUnit: e.target.value })}
              placeholder="0.00"
              min="0"
              step="0.01"
              className="w-full px-4 py-3 bg-soft border border-app rounded-xl
                       text-app placeholder:text-muted
                       focus:outline-none focus:ring-2 focus:ring-ptt-blue focus:border-ptt-blue/50
                       transition-all duration-200 hover:border-app/50"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-app mb-1.5">
              วันที่เบิกครั้งสุดท้าย
            </label>
            <input
              type="date"
              value={formData.lastRestockDate}
              onChange={(e) => setFormData({ ...formData, lastRestockDate: e.target.value })}
              className="w-full px-4 py-3 bg-soft border border-app rounded-xl
                       text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue focus:border-ptt-blue/50
                       transition-all duration-200 hover:border-app/50 cursor-pointer"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-app mb-1.5">
              หมายเหตุ
            </label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="ระบุหมายเหตุ (ถ้ามี)..."
              className="w-full px-4 py-3 bg-soft border border-app rounded-xl
                       text-app placeholder:text-muted
                       focus:outline-none focus:ring-2 focus:ring-ptt-blue focus:border-ptt-blue/50
                       transition-all duration-200 hover:border-app/50 resize-none"
            />
          </div>
        </div>
      </ModalForm>
    </div>
  );
}
