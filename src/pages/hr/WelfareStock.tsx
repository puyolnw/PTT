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
  TrendingDown,
  Store,
  MapPin,
  Calendar,
  DollarSign,
  BarChart3,
  Filter,
  Clock,
  TrendingUp
} from "lucide-react";
import ModalForm from "@/components/ModalForm";

// Interface สำหรับสต๊อกสินค้า (benefits, dormitory)
interface StockItem {
  id: number;
  type: string;
  name: string;
  category: string;
  source: string;
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

// Interface สำหรับบันทึกการใช้เงิน (bonus, fuel, trip, condolence, scholarship)
interface MoneyUsageRecord {
  id: number;
  type: string;
  empCode: string;
  empName: string;
  category: string;
  amount: number;
  date: string;
  description?: string;
  notes?: string;
}

export default function WelfareStock() {
  const [activeTab, setActiveTab] = useState<string>("benefits");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState({ startDate: "", endDate: "" });

  // สต๊อกสินค้า (benefits, dormitory)
  const [stockItems, setStockItems] = useState<StockItem[]>([
    { id: 1, type: "benefits", name: "ชุดฟอร์ม", category: "ปั๊ม", source: "ร้านปั๊มน้ำมัน", quantity: 45, unit: "ชุด", minStock: 20, maxStock: 100, costPerUnit: 500, totalCost: 22500, lastRestockDate: "2025-01-10", status: "ปกติ", notes: "ชุดฟอร์มสำหรับพนักงานปั๊ม" },
    { id: 2, type: "benefits", name: "เสื้อกันหนาว", category: "ปั๊ม", source: "ร้านปั๊มน้ำมัน", quantity: 38, unit: "ตัว", minStock: 15, maxStock: 80, costPerUnit: 800, totalCost: 30400, lastRestockDate: "2025-01-05", status: "ปกติ", notes: "เสื้อกันหนาวทุกแผนก" },
    { id: 3, type: "benefits", name: "รองเท้า", category: "ปั๊ม", source: "ร้านปั๊มน้ำมัน", quantity: 12, unit: "คู่", minStock: 20, maxStock: 60, costPerUnit: 1200, totalCost: 14400, lastRestockDate: "2024-12-20", status: "เตือน", notes: "รองเท้าอย่างดี - ต้องเบิกเพิ่ม" },
    { id: 4, type: "benefits", name: "ชุดฟอร์ม", category: "เซเว่น", source: "ร้าน 7-Eleven", quantity: 28, unit: "ชุด", minStock: 15, maxStock: 60, costPerUnit: 450, totalCost: 12600, lastRestockDate: "2025-01-12", status: "ปกติ" },
    { id: 5, type: "benefits", name: "เสื้อกันหนาว", category: "เซเว่น", source: "ร้าน 7-Eleven", quantity: 22, unit: "ตัว", minStock: 10, maxStock: 50, costPerUnit: 750, totalCost: 16500, lastRestockDate: "2025-01-08", status: "ปกติ" },
    { id: 8, type: "dormitory", name: "หอพัก A - ห้องว่าง", category: "หอพัก", source: "หอพัก A", quantity: 15, unit: "ห้อง", minStock: 5, maxStock: 20, costPerUnit: 3000, totalCost: 45000, lastRestockDate: "2025-01-01", status: "ปกติ", notes: "หอพัก A - พักฟรี + ค่าน้ำ/ไฟ" },
    { id: 9, type: "dormitory", name: "หอพัก B - ห้องว่าง", category: "หอพัก", source: "หอพัก B", quantity: 8, unit: "ห้อง", minStock: 3, maxStock: 15, costPerUnit: 3000, totalCost: 24000, lastRestockDate: "2025-01-01", status: "เตือน", notes: "หอพัก B - พักฟรี + ค่าน้ำ/ไฟ" },
    { id: 10, type: "dormitory", name: "หอพัก C - ห้องว่าง", category: "หอพัก", source: "หอพัก C", quantity: 20, unit: "ห้อง", minStock: 5, maxStock: 25, costPerUnit: 3000, totalCost: 60000, lastRestockDate: "2025-01-01", status: "ปกติ", notes: "หอพัก C - พักฟรี + ค่าน้ำ/ไฟ" },
  ]);

  // บันทึกการใช้เงิน (bonus, fuel, trip, condolence, scholarship)
  const [moneyUsageRecords, setMoneyUsageRecords] = useState<MoneyUsageRecord[]>([
    { id: 1, type: "bonus", empCode: "EMP-0001", empName: "สมชาย ใจดี", category: "ปั๊ม", amount: 50000, date: "2025-01-15", description: "BONUS รายปี ระดับ 1" },
    { id: 2, type: "bonus", empCode: "EMP-0002", empName: "สมหญิง รักงาน", category: "ปั๊ม", amount: 30000, date: "2025-01-15", description: "BONUS รายปี ระดับ 2" },
    { id: 3, type: "fuel", empCode: "EMP-0032", empName: "สมศักดิ์ ขับรถ", category: "ขับรถ", amount: 5000, date: "2025-01-10", description: "ค่าน้ำมันประจำเดือน" },
    { id: 4, type: "fuel", empCode: "EMP-0023", empName: "ประเสริฐ ช่าง", category: "ช่าง", amount: 3000, date: "2025-01-12", description: "ค่าน้ำมัน" },
    { id: 5, type: "trip", empCode: "EMP-0001", empName: "สมชาย ใจดี", category: "ปั๊ม", amount: 15000, date: "2025-01-20", description: "ทัศนศึกษาในประเทศ" },
    { id: 6, type: "condolence", empCode: "EMP-0003", empName: "วรพล ตั้งใจ", category: "ปั๊ม", amount: 3000, date: "2025-01-05", description: "งานศพ - บิดา" },
    { id: 7, type: "condolence", empCode: "EMP-0004", empName: "กิตติคุณ ใฝ่รู้", category: "เซเว่น", amount: 250, date: "2025-01-08", description: "เยี่ยมไข้" },
    { id: 8, type: "scholarship", empCode: "EMP-0001", empName: "สมชาย ใจดี", category: "ปั๊ม", amount: 10000, date: "2025-01-18", description: "ทุนการศึกษาบุตร" },
  ]);

  const [formData, setFormData] = useState({
    type: "benefits",
    name: "",
    category: "",
    source: "",
    quantity: "",
    unit: "",
    minStock: "",
    maxStock: "",
    costPerUnit: "",
    lastRestockDate: new Date().toISOString().split('T')[0],
    notes: ""
  });

  const tabs = [
    { id: "benefits", label: "การเบิก", icon: Package, isMoney: false },
    { id: "bonus", label: "BONUS รายปี", icon: Gift, isMoney: true },
    { id: "dormitory", label: "หอพัก", icon: HomeIcon, isMoney: false },
    { id: "fuel", label: "ค่าน้ำมัน", icon: Fuel, isMoney: true },
    { id: "trip", label: "ทัศนศึกษา", icon: Plane, isMoney: true },
    { id: "condolence", label: "เยี่ยมไข้/คลอด", icon: HeartHandshake, isMoney: true },
    { id: "scholarship", label: "ทุนการศึกษา", icon: GraduationCap, isMoney: true },
  ];

  // Helper function to format date
  const formatDateShort = (dateString: string): string => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      const day = date.getDate();
      const month = date.toLocaleDateString('th-TH', { month: 'short' });
      const year = date.getFullYear() + 543;
      return `${day} ${month} ${year}`;
    } catch {
      return dateString;
    }
  };

  const formatDateDetailed = (dateString: string): string => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      const day = date.getDate();
      const month = date.toLocaleDateString('th-TH', { month: 'long' });
      const year = date.getFullYear() + 543;
      const dayOfWeek = date.toLocaleDateString('th-TH', { weekday: 'long' });
      return `${dayOfWeek}ที่ ${day} ${month} ${year}`;
    } catch {
      return dateString;
    }
  };

  // Check if current tab is money-based
  const currentTab = tabs.find(t => t.id === activeTab);
  const isMoneyTab = currentTab?.isMoney || false;

  // Filter stock items
  const filteredStockItems = useMemo(() => {
    return stockItems.filter(item => {
      const matchesTab = item.type === activeTab;
      const matchesSearch = !searchQuery ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.source.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [stockItems, activeTab, searchQuery]);

  // Filter money usage records with date filter
  const filteredMoneyRecords = useMemo(() => {
    return moneyUsageRecords.filter(record => {
      const matchesTab = record.type === activeTab;
      const matchesSearch = !searchQuery ||
        record.empName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.empCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.description?.toLowerCase().includes(searchQuery.toLowerCase());

      // Date filter
      let matchesDate = true;
      if (dateFilter.startDate) {
        matchesDate = matchesDate && new Date(record.date) >= new Date(dateFilter.startDate);
      }
      if (dateFilter.endDate) {
        matchesDate = matchesDate && new Date(record.date) <= new Date(dateFilter.endDate);
      }

      return matchesTab && matchesSearch && matchesDate;
    });
  }, [moneyUsageRecords, activeTab, searchQuery, dateFilter]);

  // Statistics for stock items
  const stockStats = useMemo(() => {
    const filtered = filteredStockItems;
    const totalQuantity = filtered.reduce((sum, item) => sum + item.quantity, 0);
    return {
      totalItems: filtered.length,
      totalQuantity: totalQuantity,
      lowStock: filtered.filter(item => item.status === "เตือน").length,
      outOfStock: filtered.filter(item => item.status === "ไม่พอ").length,
      totalValue: filtered.reduce((sum, item) => sum + item.totalCost, 0)
    };
  }, [filteredStockItems]);

  // Statistics for money usage
  const moneyStats = useMemo(() => {
    const filtered = filteredMoneyRecords;
    const totalUsed = filtered.reduce((sum, record) => sum + record.amount, 0);
    return {
      totalRecords: filtered.length,
      totalUsed: totalUsed,
      averageAmount: filtered.length > 0 ? totalUsed / filtered.length : 0,
      maxAmount: filtered.length > 0 ? Math.max(...filtered.map(r => r.amount)) : 0,
    };
  }, [filteredMoneyRecords]);

  const handleSubmit = () => {
    if (!isMoneyTab) {
      // Stock item submission
      if (!formData.name || !formData.category || !formData.source) {
        alert("กรุณากรอกข้อมูลให้ครบถ้วน (ชื่อสินค้า, หมวดหมู่, และที่มา)");
        return;
      }

      const newItem: StockItem = {
        id: Math.max(...stockItems.map(item => item.id), 0) + 1,
        type: formData.type,
        name: formData.name,
        category: formData.category,
        source: formData.source,
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
      alert("เพิ่มสต๊อกสำเร็จ!");
    }
    // Note: Money records should be added from Welfare page, not here
    setIsModalOpen(false);
    setFormData({
      type: activeTab,
      name: "",
      category: "",
      source: "",
      quantity: "",
      unit: "",
      minStock: "",
      maxStock: "",
      costPerUnit: "",
      lastRestockDate: new Date().toISOString().split('T')[0],
      notes: ""
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้?")) {
      if (isMoneyTab) {
        setMoneyUsageRecords(moneyUsageRecords.filter(r => r.id !== id));
      } else {
        setStockItems(stockItems.filter(item => item.id !== id));
      }
    }
  };

  const getStockPercentage = (item: StockItem): number => {
    if (item.maxStock === 0) return 0;
    return Math.min((item.quantity / item.maxStock) * 100, 100);
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
            {isMoneyTab
              ? "บันทึกประวัติการใช้เงินสวัสดิการ - ดึงเงินจากรายได้ปั๊ม"
              : "จัดการสต๊อกสินค้าสวัสดิการ - ดูที่มาและจำนวนคงเหลือ"
            }
          </p>
        </div>
        {!isMoneyTab && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-ptt-cyan hover:bg-ptt-cyan/80 
                     text-app rounded-xl transition-all duration-200 font-semibold 
                     shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            <Plus className="w-5 h-5" />
            เพิ่มสต๊อก
          </button>
        )}
      </div>

      {/* Statistics Cards */}
      {isMoneyTab ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/30 rounded-xl p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-blue-400" />
              </div>
              <BarChart3 className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-muted text-sm mb-1">จำนวนรายการ</p>
            <p className="text-3xl font-bold text-app">{moneyStats.totalRecords}</p>
            <p className="text-xs text-muted mt-2">บันทึกการใช้เงิน</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/30 rounded-xl p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-400" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-muted text-sm mb-1">ยอดรวมที่ใช้ไป</p>
            <p className="text-2xl font-bold text-app">
              {new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 }).format(moneyStats.totalUsed)}
            </p>
            <p className="text-xs text-muted mt-2">เงินที่ใช้แล้วทั้งหมด</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/30 rounded-xl p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-purple-400" />
              </div>
              <TrendingUp className="w-5 h-5 text-purple-400" />
            </div>
            <p className="text-muted text-sm mb-1">ค่าเฉลี่ยต่อรายการ</p>
            <p className="text-2xl font-bold text-app">
              {new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 }).format(moneyStats.averageAmount)}
            </p>
            <p className="text-xs text-muted mt-2">เฉลี่ยต่อครั้ง</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border border-orange-500/30 rounded-xl p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-orange-400" />
              </div>
              <DollarSign className="w-5 h-5 text-orange-400" />
            </div>
            <p className="text-muted text-sm mb-1">ยอดสูงสุด</p>
            <p className="text-2xl font-bold text-app">
              {new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 }).format(moneyStats.maxAmount)}
            </p>
            <p className="text-xs text-muted mt-2">รายการที่ใช้มากที่สุด</p>
          </motion.div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/30 rounded-xl p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-400" />
              </div>
              <BarChart3 className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-muted text-sm mb-1">รายการสต๊อก</p>
            <p className="text-3xl font-bold text-app">{stockStats.totalItems}</p>
            <p className="text-xs text-muted mt-2">รวม {stockStats.totalQuantity} {filteredStockItems[0]?.unit || "หน่วย"}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border border-yellow-500/30 rounded-xl p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-yellow-400" />
              </div>
              <TrendingDown className="w-5 h-5 text-yellow-400" />
            </div>
            <p className="text-muted text-sm mb-1">เตือนสต๊อกต่ำ</p>
            <p className="text-3xl font-bold text-yellow-400">{stockStats.lowStock}</p>
            <p className="text-xs text-muted mt-2">ต้องเติมสต๊อก</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-red-500/10 to-red-600/5 border border-red-500/30 rounded-xl p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-red-400" />
              </div>
              <AlertCircle className="w-5 h-5 text-red-400" />
            </div>
            <p className="text-muted text-sm mb-1">หมดสต๊อก</p>
            <p className="text-3xl font-bold text-red-400">{stockStats.outOfStock}</p>
            <p className="text-xs text-muted mt-2">ต้องเติมด่วน</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/30 rounded-xl p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-400" />
              </div>
              <BarChart3 className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-muted text-sm mb-1">มูลค่ารวม</p>
            <p className="text-2xl font-bold text-app">
              {new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 }).format(stockStats.totalValue)}
            </p>
            <p className="text-xs text-muted mt-2">มูลค่าสต๊อกทั้งหมด</p>
          </motion.div>
        </div>
      )}

      {/* Tabs and Content */}
      <div className="bg-soft border border-app rounded-2xl overflow-hidden shadow-lg">
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
                    ? "text-ptt-cyan border-b-2 border-ptt-cyan bg-soft font-semibold"
                    : "text-muted hover:text-app hover:bg-soft/50"
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {tab.isMoney && <DollarSign className="w-3 h-3 text-green-400" />}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-semibold text-app font-display mb-1">
                {isMoneyTab ? "บันทึกการใช้เงิน" : "สต๊อก"}{tabs.find(t => t.id === activeTab)?.label}
              </h2>
              <p className="text-xs text-muted">
                {isMoneyTab ? (
                  <>
                    จำนวนรายการ: {filteredMoneyRecords.length} รายการ |
                    ยอดรวม: {new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 }).format(moneyStats.totalUsed)}
                  </>
                ) : (
                  <>
                    จำนวนรายการ: {filteredStockItems.length} รายการ |
                    {filteredStockItems.length > 0 && (
                      <> จำนวนรวม: {filteredStockItems.reduce((sum, item) => sum + item.quantity, 0)} {filteredStockItems[0]?.unit || "หน่วย"}</>
                    )}
                  </>
                )}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {isMoneyTab && (
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={dateFilter.startDate}
                    onChange={(e) => setDateFilter({ ...dateFilter, startDate: e.target.value })}
                    placeholder="วันที่เริ่มต้น"
                    className="px-3 py-2 bg-soft border border-app rounded-lg text-app text-sm focus:outline-none focus:ring-2 focus:ring-ptt-blue"
                  />
                  <input
                    type="date"
                    value={dateFilter.endDate}
                    onChange={(e) => setDateFilter({ ...dateFilter, endDate: e.target.value })}
                    placeholder="วันที่สิ้นสุด"
                    className="px-3 py-2 bg-soft border border-app rounded-lg text-app text-sm focus:outline-none focus:ring-2 focus:ring-ptt-blue"
                  />
                  {(dateFilter.startDate || dateFilter.endDate) && (
                    <button
                      onClick={() => setDateFilter({ startDate: "", endDate: "" })}
                      className="px-3 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-sm hover:bg-red-500/30"
                    >
                      ล้าง
                    </button>
                  )}
                </div>
              )}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                  type="text"
                  placeholder="ค้นหา..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-soft border border-app rounded-lg text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue w-full md:w-64"
                />
              </div>
              <button className="px-4 py-2 bg-soft border border-app rounded-lg text-app hover:bg-soft/80 flex items-center gap-2">
                <Filter className="w-4 h-4" />
                <span className="hidden md:inline">กรอง</span>
              </button>
            </div>
          </div>

          {/* Money Usage Records Table */}
          {isMoneyTab && filteredMoneyRecords.length > 0 && (
            <div className="overflow-x-auto rounded-xl border border-app">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-b-2 border-green-500/30">
                  <tr>
                    <th className="px-4 py-4 text-left text-xs font-bold text-app uppercase tracking-wider min-w-[180px]">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        วัน เดือน ปี
                      </div>
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-bold text-app uppercase tracking-wider">รหัส</th>
                    <th className="px-4 py-4 text-left text-xs font-bold text-app uppercase tracking-wider">ชื่อ-นามสกุล</th>
                    <th className="px-4 py-4 text-left text-xs font-bold text-app uppercase tracking-wider">แผนก</th>
                    <th className="px-4 py-4 text-left text-xs font-bold text-app uppercase tracking-wider">รายละเอียด</th>
                    <th className="px-4 py-4 text-right text-xs font-bold text-app uppercase tracking-wider">
                      <div className="flex items-center justify-end gap-1">
                        <DollarSign className="w-3 h-3" />
                        จำนวนเงิน
                      </div>
                    </th>
                    <th className="px-4 py-4 text-center text-xs font-bold text-app uppercase tracking-wider">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-app/20">
                  {filteredMoneyRecords.map((record) => (
                    <motion.tr
                      key={record.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="hover:bg-soft/70 transition-colors"
                    >
                      <td className="px-4 py-4 min-w-[180px]">
                        {record.date ? (
                          <div className="flex flex-col gap-1">
                            <div className="font-semibold text-app text-sm whitespace-nowrap">
                              {formatDateShort(record.date)}
                            </div>
                            <div className="text-[10px] text-muted leading-tight border-t border-app/20 pt-1">
                              {formatDateDetailed(record.date)}
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted italic text-xs">ไม่มีข้อมูลวันที่</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-ptt-cyan font-medium">{record.empCode}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-app font-medium">{record.empName}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-muted">{record.category}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-app">{record.description || "-"}</span>
                        {record.notes && (
                          <p className="text-xs text-muted mt-1 italic">{record.notes}</p>
                        )}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <span className="text-sm font-bold text-app font-mono">
                          {new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(record.amount)}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            className="p-2 hover:bg-ptt-cyan/20 rounded-lg transition-colors"
                            title="แก้ไข"
                          >
                            <Edit2 className="w-4 h-4 text-ptt-cyan" />
                          </button>
                          <button
                            onClick={() => handleDelete(record.id)}
                            className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
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
          )}

          {/* Stock Items Table */}
          {!isMoneyTab && filteredStockItems.length > 0 && (
            <div className="overflow-x-auto rounded-xl border border-app">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-ptt-cyan/10 to-ptt-blue/10 border-b-2 border-ptt-cyan/30">
                  <tr>
                    <th className="px-4 py-4 text-left text-xs font-bold text-app uppercase tracking-wider">รายการ</th>
                    <th className="px-4 py-4 text-left text-xs font-bold text-app uppercase tracking-wider">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        ที่มา
                      </div>
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-bold text-app uppercase tracking-wider">หมวดหมู่</th>
                    <th className="px-4 py-4 text-center text-xs font-bold text-app uppercase tracking-wider">
                      <div className="flex items-center justify-center gap-1">
                        <Package className="w-3 h-3" />
                        จำนวนคงเหลือ
                      </div>
                    </th>
                    <th className="px-4 py-4 text-center text-xs font-bold text-app uppercase tracking-wider">สต๊อกต่ำสุด</th>
                    <th className="px-4 py-4 text-right text-xs font-bold text-app uppercase tracking-wider">ราคา/หน่วย</th>
                    <th className="px-4 py-4 text-right text-xs font-bold text-app uppercase tracking-wider">มูลค่ารวม</th>
                    <th className="px-4 py-4 text-center text-xs font-bold text-app uppercase tracking-wider">
                      <div className="flex items-center justify-center gap-1">
                        <Calendar className="w-3 h-3" />
                        วันที่เบิกล่าสุด
                      </div>
                    </th>
                    <th className="px-4 py-4 text-center text-xs font-bold text-app uppercase tracking-wider">สถานะ</th>
                    <th className="px-4 py-4 text-center text-xs font-bold text-app uppercase tracking-wider">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-app/20">
                  {filteredStockItems.map((item) => {
                    const stockPercentage = getStockPercentage(item);
                    const isLowStock = item.quantity <= item.minStock;
                    return (
                      <motion.tr
                        key={item.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`hover:bg-soft/70 transition-colors ${item.status === "เตือน" ? "bg-yellow-500/5" :
                          item.status === "ไม่พอ" ? "bg-red-500/5" : ""
                          }`}
                      >
                        <td className="px-4 py-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-app">{item.name}</span>
                            {item.notes && (
                              <span className="text-xs text-muted mt-1 italic">{item.notes}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <Store className="w-4 h-4 text-ptt-cyan" />
                            <span className="text-sm font-medium text-ptt-cyan">{item.source}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-sm text-muted">{item.category}</span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-col items-center gap-2">
                            <div className="flex items-center gap-2">
                              <span className={`text-lg font-bold ${isLowStock ? "text-red-400" : "text-app"
                                }`}>
                                {item.quantity}
                              </span>
                              <span className="text-xs text-muted">{item.unit}</span>
                            </div>
                            <div className="w-full max-w-[100px] h-2 bg-app/20 rounded-full overflow-hidden">
                              <motion.div
                                className={`h-full transition-all w-[var(--stock-percentage)] ${stockPercentage >= 50 ? "bg-green-400" :
                                  stockPercentage >= 25 ? "bg-yellow-400" :
                                    "bg-red-400"
                                  }`}
                                style={{ "--stock-percentage": `${stockPercentage}%` } as React.CSSProperties}
                              />
                            </div>
                            <span className="text-[10px] text-muted">
                              {stockPercentage.toFixed(0)}% ของสต๊อกสูงสุด
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className="text-sm text-muted">
                            {item.minStock} {item.unit}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <span className="text-sm text-app font-mono">
                            {new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 }).format(item.costPerUnit)}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <span className="text-sm font-semibold text-app font-mono">
                            {new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 }).format(item.totalCost)}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <div className="flex flex-col items-center gap-1">
                            <Calendar className="w-4 h-4 text-muted" />
                            <span className="text-xs text-muted">{formatDateShort(item.lastRestockDate)}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold ${item.status === "ปกติ" ? "bg-green-500/20 text-green-400 border border-green-500/30" :
                            item.status === "เตือน" ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30" :
                              "bg-red-500/20 text-red-400 border border-red-500/30"
                            }`}>
                            {item.status === "ปกติ" && "✓ "}
                            {item.status === "เตือน" && "⚠ "}
                            {item.status === "ไม่พอ" && "✗ "}
                            {item.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              className="p-2 hover:bg-ptt-cyan/20 rounded-lg transition-colors"
                              title="แก้ไข"
                            >
                              <Edit2 className="w-4 h-4 text-ptt-cyan" />
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                              title="ลบ"
                            >
                              <Trash2 className="w-4 h-4 text-red-400" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Empty State */}
          {((isMoneyTab && filteredMoneyRecords.length === 0) || (!isMoneyTab && filteredStockItems.length === 0)) && (
            <div className="text-center py-16 bg-soft/30 rounded-xl border-2 border-dashed border-app">
              {isMoneyTab ? (
                <>
                  <DollarSign className="w-16 h-16 text-muted mx-auto mb-4 opacity-50" />
                  <p className="text-muted font-light text-lg mb-2">ยังไม่มีบันทึกการใช้เงิน</p>
                  <p className="text-xs text-muted">บันทึกการใช้เงินจะถูกเพิ่มจากหน้า &ldquo;สวัสดิการพนักงาน&ldquo;</p>
                </>
              ) : (
                <>
                  <Package className="w-16 h-16 text-muted mx-auto mb-4 opacity-50" />
                  <p className="text-muted font-light text-lg mb-2">ยังไม่มีรายการสต๊อก</p>
                  <p className="text-xs text-muted">คลิกปุ่ม &quot;เพิ่มสต๊อก&quot; เพื่อเพิ่มรายการใหม่</p>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add Stock Modal (only for non-money tabs) */}
      {!isMoneyTab && (
        <ModalForm
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setFormData({
              type: activeTab,
              name: "",
              category: "",
              source: "",
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
              <label htmlFor="stock-type" className="block text-sm font-semibold text-app mb-1.5">
                ประเภท <span className="text-red-400">*</span>
              </label>
              <select
                id="stock-type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-4 py-3 bg-soft border border-app rounded-xl
                         text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue focus:border-ptt-blue/50
                         transition-all duration-200 hover:border-app/50 cursor-pointer"
              >
                {tabs.filter(t => !t.isMoney).map((tab) => (
                  <option key={tab.id} value={tab.id}>
                    {tab.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="stock-name" className="block text-sm font-semibold text-app mb-1.5">
                ชื่อสินค้า <span className="text-red-400">*</span>
              </label>
              <input
                id="stock-name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="เช่น ชุดฟอร์ม, เสื้อกันหนาว"
                className="w-full px-4 py-3 bg-soft border border-app rounded-xl
                         text-app placeholder:text-muted
                         focus:outline-none focus:ring-2 focus:ring-ptt-blue focus:border-ptt-blue/50
                         transition-all duration-200 hover:border-app/50"
              />
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-2">
                <label htmlFor="stock-source" className="block text-sm font-semibold text-app mb-1.5">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    ที่มา (ร้าน/บ้าน) <span className="text-red-400">*</span>
                  </div>
                </label>
                <input
                  id="stock-source"
                  type="text"
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  placeholder="เช่น ร้านปั๊มน้ำมัน, หอพัก A"
                  className="w-full px-4 py-3 bg-soft border border-app rounded-xl
                            text-app placeholder:text-muted
                            focus:outline-none focus:ring-2 focus:ring-ptt-blue focus:border-ptt-blue/50
                            transition-all duration-200 hover:border-app/50"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="stock-category" className="block text-sm font-semibold text-app mb-1.5">
                  หมวดหมู่ <span className="text-red-400">*</span>
                </label>
                <input
                  id="stock-category"
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="เช่น ปั๊ม, เซเว่น"
                  className="w-full px-4 py-3 bg-soft border border-app rounded-xl
                           text-app placeholder:text-muted
                           focus:outline-none focus:ring-2 focus:ring-ptt-blue focus:border-ptt-blue/50
                           transition-all duration-200 hover:border-app/50"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-2">
                <label htmlFor="stock-unit" className="block text-sm font-semibold text-app mb-1.5">
                  หน่วยนับ
                </label>
                <input
                  id="stock-unit"
                  type="text"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  placeholder="เช่น ชิ้น, ชุด, ห้อง"
                  className="w-full px-4 py-3 bg-soft border border-app rounded-xl
                           text-app placeholder:text-muted
                           focus:outline-none focus:ring-2 focus:ring-ptt-blue focus:border-ptt-blue/50
                           transition-all duration-200 hover:border-app/50"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="stock-last-restock-date" className="block text-sm font-semibold text-app mb-1.5">
                  วันที่เบิกครั้งสุดท้าย
                </label>
                <input
                  id="stock-last-restock-date"
                  type="date"
                  value={formData.lastRestockDate}
                  onChange={(e) => setFormData({ ...formData, lastRestockDate: e.target.value })}
                  className="w-full px-4 py-3 bg-soft border border-app rounded-xl
                           text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue focus:border-ptt-blue/50
                           transition-all duration-200 hover:border-app/50 cursor-pointer"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-5">
              <div className="space-y-2">
                <label htmlFor="stock-quantity" className="block text-sm font-semibold text-app mb-1.5">
                  <div className="flex items-center gap-1">
                    <Package className="w-3 h-3" />
                    จำนวนคงเหลือ
                  </div>
                </label>
                <input
                  id="stock-quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  placeholder="0"
                  min="0"
                  className="w-full px-4 py-3 bg-soft border border-app rounded-xl
                           text-app placeholder:text-muted
                           focus:outline-none focus:ring-2 focus:ring-ptt-blue focus:border-ptt-blue/50
                           transition-all duration-200 hover:border-app/50"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="stock-min" className="block text-sm font-semibold text-app mb-1.5">
                  สต๊อกต่ำสุด
                </label>
                <input
                  id="stock-min"
                  type="number"
                  value={formData.minStock}
                  onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                  placeholder="0"
                  min="0"
                  className="w-full px-4 py-3 bg-soft border border-app rounded-xl
                           text-app placeholder:text-muted
                           focus:outline-none focus:ring-2 focus:ring-ptt-blue focus:border-ptt-blue/50
                           transition-all duration-200 hover:border-app/50"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="stock-max" className="block text-sm font-semibold text-app mb-1.5">
                  สต๊อกสูงสุด
                </label>
                <input
                  id="stock-max"
                  type="number"
                  value={formData.maxStock}
                  onChange={(e) => setFormData({ ...formData, maxStock: e.target.value })}
                  placeholder="0"
                  min="0"
                  className="w-full px-4 py-3 bg-soft border border-app rounded-xl
                           text-app placeholder:text-muted
                           focus:outline-none focus:ring-2 focus:ring-ptt-blue focus:border-ptt-blue/50
                           transition-all duration-200 hover:border-app/50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="stock-cost-per-unit" className="block text-sm font-semibold text-app mb-1.5">
                ราคา/หน่วย (บาท)
              </label>
              <input
                id="stock-cost-per-unit"
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
              <label htmlFor="stock-notes" className="block text-sm font-semibold text-app mb-1.5">
                หมายเหตุ
              </label>
              <textarea
                id="stock-notes"
                rows={3}
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
      )}
    </div>
  );
}
