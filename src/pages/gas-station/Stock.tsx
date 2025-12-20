import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Droplet,
  Package,
  AlertTriangle,
  Search,
  Filter,
  BarChart3,
  CheckCircle,
  XCircle,
  Eye,
  ShoppingCart,
  RefreshCw,
  Settings,
  Save,
  X,
} from "lucide-react";

const numberFormatter = new Intl.NumberFormat("th-TH", {
  maximumFractionDigits: 0,
});

const currencyFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 0,
});

type OilType =
  | "Premium Diesel"
  | "Premium Gasohol 95"
  | "Diesel"
  | "E85"
  | "E20"
  | "Gasohol 91"
  | "Gasohol 95";

type StockStatus = "normal" | "warning" | "critical";

type StockItem = {
  id: string;
  branch: string;
  tankNumber: number; // หลุม
  oilType: OilType;
  currentStock: number; // ลิตร
  minThreshold: number; // เกณฑ์ต่ำสุด
  maxCapacity: number; // ความจุสูงสุด
  status: StockStatus;
  lastUpdated: string;
  pricePerLiter: number;
  totalValue: number;
  averageDailySales: number; // ยอดขายเฉลี่ยต่อวัน (ลิตร)
  daysRemaining: number; // จำนวนวันที่เหลือ (คำนวณจากยอดขายเฉลี่ย)
};

// Mock data - ทั้ง 5 ปั๊ม (ข้อมูลตามรูปภาพ)
const mockStockData: StockItem[] = [
  // ตักสิลา (ปตท. ตักสิดา) - 7 หลุม ตามรูปภาพที่ 1
  {
    id: "STK-301",
    branch: "ตักสิลา",
    tankNumber: 1,
    oilType: "Gasohol 95", // 695
    currentStock: 18000,
    minThreshold: 4000,
    maxCapacity: 20000,
    status: "normal",
    lastUpdated: "2024-12-15 18:30",
    pricePerLiter: 41.49,
    totalValue: 746820,
    averageDailySales: 3600,
    daysRemaining: 5,
  },
  {
    id: "STK-302",
    branch: "ตักสิลา",
    tankNumber: 2,
    oilType: "Gasohol 91", // 691
    currentStock: 19000,
    minThreshold: 4000,
    maxCapacity: 20000,
    status: "normal",
    lastUpdated: "2024-12-15 18:30",
    pricePerLiter: 38.49,
    totalValue: 731310,
    averageDailySales: 3800,
    daysRemaining: 5,
  },
  {
    id: "STK-303",
    branch: "ตักสิลา",
    tankNumber: 3,
    oilType: "Diesel", // HSD
    currentStock: 17000,
    minThreshold: 4000,
    maxCapacity: 20000,
    status: "normal",
    lastUpdated: "2024-12-15 18:30",
    pricePerLiter: 32.49,
    totalValue: 552330,
    averageDailySales: 3400,
    daysRemaining: 5,
  },
  {
    id: "STK-304",
    branch: "ตักสิลา",
    tankNumber: 4,
    oilType: "E85",
    currentStock: 9000,
    minThreshold: 2000,
    maxCapacity: 10000,
    status: "normal",
    lastUpdated: "2024-12-15 18:30",
    pricePerLiter: 28.49,
    totalValue: 256410,
    averageDailySales: 1800,
    daysRemaining: 5,
  },
  {
    id: "STK-305",
    branch: "ตักสิลา",
    tankNumber: 5,
    oilType: "Premium Diesel", // HSP
    currentStock: 7500,
    minThreshold: 2000,
    maxCapacity: 10000,
    status: "normal",
    lastUpdated: "2024-12-15 18:30",
    pricePerLiter: 33.49,
    totalValue: 251175,
    averageDailySales: 1500,
    daysRemaining: 5,
  },
  {
    id: "STK-306",
    branch: "ตักสิลา",
    tankNumber: 6,
    oilType: "E20",
    currentStock: 17000,
    minThreshold: 4000,
    maxCapacity: 20000,
    status: "normal",
    lastUpdated: "2024-12-15 18:30",
    pricePerLiter: 36.90,
    totalValue: 627300,
    averageDailySales: 3400,
    daysRemaining: 5,
  },
  {
    id: "STK-307",
    branch: "ตักสิลา",
    tankNumber: 7,
    oilType: "Premium Gasohol 95", // 695P
    currentStock: 13000,
    minThreshold: 4000,
    maxCapacity: 20000,
    status: "normal",
    lastUpdated: "2024-12-15 18:30",
    pricePerLiter: 41.49,
    totalValue: 539370,
    averageDailySales: 2600,
    daysRemaining: 5,
  },

  // ดินดำ - 5 หลุม ตามรูปภาพที่ 2
  {
    id: "STK-101",
    branch: "ดินดำ",
    tankNumber: 1,
    oilType: "Premium Diesel", // HSP
    currentStock: 19000,
    minThreshold: 700,
    maxCapacity: 20000,
    status: "normal",
    lastUpdated: "2024-12-15 18:30",
    pricePerLiter: 33.49,
    totalValue: 636310,
    averageDailySales: 3800,
    daysRemaining: 5,
  },
  {
    id: "STK-102",
    branch: "ดินดำ",
    tankNumber: 2,
    oilType: "Gasohol 95", // G95
    currentStock: 9600,
    minThreshold: 400,
    maxCapacity: 10000,
    status: "normal",
    lastUpdated: "2024-12-15 18:30",
    pricePerLiter: 41.49,
    totalValue: 398304,
    averageDailySales: 1920,
    daysRemaining: 5,
  },
  {
    id: "STK-103",
    branch: "ดินดำ",
    tankNumber: 3,
    oilType: "E20",
    currentStock: 9600,
    minThreshold: 400,
    maxCapacity: 10000,
    status: "normal",
    lastUpdated: "2024-12-15 18:30",
    pricePerLiter: 36.90,
    totalValue: 354240,
    averageDailySales: 1920,
    daysRemaining: 5,
  },
  {
    id: "STK-104",
    branch: "ดินดำ",
    tankNumber: 4,
    oilType: "Diesel", // HSD
    currentStock: 19400,
    minThreshold: 600,
    maxCapacity: 20000,
    status: "normal",
    lastUpdated: "2024-12-15 18:30",
    pricePerLiter: 32.49,
    totalValue: 630306,
    averageDailySales: 3880,
    daysRemaining: 5,
  },
  {
    id: "STK-105",
    branch: "ดินดำ",
    tankNumber: 5,
    oilType: "Gasohol 91", // G91
    currentStock: 19400,
    minThreshold: 600,
    maxCapacity: 20000,
    status: "normal",
    lastUpdated: "2024-12-15 18:30",
    pricePerLiter: 38.49,
    totalValue: 746706,
    averageDailySales: 3880,
    daysRemaining: 5,
  },

  // มายมาส (ปั๊ม ปตท. มายมาส) - 5 หลุม ตามรูปภาพที่ 3
  {
    id: "STK-501",
    branch: "มายมาส",
    tankNumber: 1,
    oilType: "Diesel", // ดีเซล
    currentStock: 28000,
    minThreshold: 6000,
    maxCapacity: 30000,
    status: "normal",
    lastUpdated: "2024-12-15 18:30",
    pricePerLiter: 32.49,
    totalValue: 909720,
    averageDailySales: 5600,
    daysRemaining: 5,
  },
  {
    id: "STK-502",
    branch: "มายมาส",
    tankNumber: 2,
    oilType: "Premium Diesel", // ดีเซลพรีเมียม
    currentStock: 14000,
    minThreshold: 3000,
    maxCapacity: 15000,
    status: "normal",
    lastUpdated: "2024-12-15 18:30",
    pricePerLiter: 33.49,
    totalValue: 468860,
    averageDailySales: 2800,
    daysRemaining: 5,
  },
  {
    id: "STK-503",
    branch: "มายมาส",
    tankNumber: 3,
    oilType: "E20",
    currentStock: 14000,
    minThreshold: 3000,
    maxCapacity: 15000,
    status: "normal",
    lastUpdated: "2024-12-15 18:30",
    pricePerLiter: 36.90,
    totalValue: 516600,
    averageDailySales: 2800,
    daysRemaining: 5,
  },
  {
    id: "STK-504",
    branch: "มายมาส",
    tankNumber: 4,
    oilType: "Gasohol 91", // แก๊ส 91
    currentStock: 14000,
    minThreshold: 3000,
    maxCapacity: 15000,
    status: "normal",
    lastUpdated: "2024-12-15 18:30",
    pricePerLiter: 38.49,
    totalValue: 538860,
    averageDailySales: 2800,
    daysRemaining: 5,
  },
  {
    id: "STK-505",
    branch: "มายมาส",
    tankNumber: 5,
    oilType: "Gasohol 95", // แก๊ส 95
    currentStock: 14000,
    minThreshold: 3000,
    maxCapacity: 15000,
    status: "normal",
    lastUpdated: "2024-12-15 18:30",
    pricePerLiter: 41.49,
    totalValue: 580860,
    averageDailySales: 2800,
    daysRemaining: 5,
  },

  // ปั๊มไฮโซ - 10 หลุม ตามรูปภาพ
  {
    id: "STK-001",
    branch: "ปั๊มไฮโซ",
    tankNumber: 1,
    oilType: "Diesel", // ดีเซล
    currentStock: 15000,
    minThreshold: 4000,
    maxCapacity: 20000,
    status: "normal",
    lastUpdated: "2024-12-15 18:30",
    pricePerLiter: 32.49,
    totalValue: 487350,
    averageDailySales: 3000,
    daysRemaining: 5,
  },
  {
    id: "STK-002",
    branch: "ปั๊มไฮโซ",
    tankNumber: 2,
    oilType: "Diesel", // ดีเซล
    currentStock: 18000,
    minThreshold: 4000,
    maxCapacity: 20000,
    status: "normal",
    lastUpdated: "2024-12-15 18:30",
    pricePerLiter: 32.49,
    totalValue: 584820,
    averageDailySales: 3600,
    daysRemaining: 5,
  },
  {
    id: "STK-003",
    branch: "ปั๊มไฮโซ",
    tankNumber: 3,
    oilType: "Premium Diesel", // ดีเซลพรีเมี่ยม
    currentStock: 8000,
    minThreshold: 2000,
    maxCapacity: 10000,
    status: "normal",
    lastUpdated: "2024-12-15 18:30",
    pricePerLiter: 33.49,
    totalValue: 267920,
    averageDailySales: 1600,
    daysRemaining: 5,
  },
  {
    id: "STK-004",
    branch: "ปั๊มไฮโซ",
    tankNumber: 4,
    oilType: "Gasohol 91", // แก๊ส 91
    currentStock: 7500,
    minThreshold: 2000,
    maxCapacity: 10000,
    status: "normal",
    lastUpdated: "2024-12-15 18:30",
    pricePerLiter: 38.49,
    totalValue: 288675,
    averageDailySales: 1500,
    daysRemaining: 5,
  },
  {
    id: "STK-005",
    branch: "ปั๊มไฮโซ",
    tankNumber: 5,
    oilType: "E20", // อี 20
    currentStock: 8500,
    minThreshold: 2000,
    maxCapacity: 10000,
    status: "normal",
    lastUpdated: "2024-12-15 18:30",
    pricePerLiter: 36.90,
    totalValue: 313650,
    averageDailySales: 1700,
    daysRemaining: 5,
  },
  {
    id: "STK-006",
    branch: "ปั๊มไฮโซ",
    tankNumber: 6,
    oilType: "Gasohol 95", // แก๊ส 95
    currentStock: 8000,
    minThreshold: 2000,
    maxCapacity: 10000,
    status: "normal",
    lastUpdated: "2024-12-15 18:30",
    pricePerLiter: 41.49,
    totalValue: 331920,
    averageDailySales: 1600,
    daysRemaining: 5,
  },
  {
    id: "STK-007",
    branch: "ปั๊มไฮโซ",
    tankNumber: 7,
    oilType: "E85", // อี 85
    currentStock: 6000,
    minThreshold: 2000,
    maxCapacity: 10000,
    status: "normal",
    lastUpdated: "2024-12-15 18:30",
    pricePerLiter: 34.49,
    totalValue: 206940,
    averageDailySales: 1200,
    daysRemaining: 5,
  },
  {
    id: "STK-008",
    branch: "ปั๊มไฮโซ",
    tankNumber: 8,
    oilType: "Gasohol 91", // แก๊ส 91
    currentStock: 8000,
    minThreshold: 2000,
    maxCapacity: 10000,
    status: "normal",
    lastUpdated: "2024-12-15 18:30",
    pricePerLiter: 38.49,
    totalValue: 307920,
    averageDailySales: 1600,
    daysRemaining: 5,
  },
  {
    id: "STK-009",
    branch: "ปั๊มไฮโซ",
    tankNumber: 9,
    oilType: "Premium Gasohol 95", // แก๊ส 95 พรีเมี่ยม
    currentStock: 7500,
    minThreshold: 2000,
    maxCapacity: 10000,
    status: "normal",
    lastUpdated: "2024-12-15 18:30",
    pricePerLiter: 46.49,
    totalValue: 348675,
    averageDailySales: 1500,
    daysRemaining: 5,
  },
  {
    id: "STK-010",
    branch: "ปั๊มไฮโซ",
    tankNumber: 10,
    oilType: "E20", // อี 20
    currentStock: 8000,
    minThreshold: 2000,
    maxCapacity: 10000,
    status: "normal",
    lastUpdated: "2024-12-15 18:30",
    pricePerLiter: 36.90,
    totalValue: 295200,
    averageDailySales: 1600,
    daysRemaining: 5,
  },

  // หนองจิก - 5 หลุม (ใช้ข้อมูลคล้ายรูปภาพที่ 4)
  {
    id: "STK-201",
    branch: "หนองจิก",
    tankNumber: 1,
    oilType: "Gasohol 95", // G95
    currentStock: 18000,
    minThreshold: 4000,
    maxCapacity: 20000,
    status: "normal",
    lastUpdated: "2024-12-15 18:30",
    pricePerLiter: 41.49,
    totalValue: 746820,
    averageDailySales: 3600,
    daysRemaining: 5,
  },
  {
    id: "STK-202",
    branch: "หนองจิก",
    tankNumber: 2,
    oilType: "Premium Diesel", // HSP
    currentStock: 7500,
    minThreshold: 2000,
    maxCapacity: 10000,
    status: "normal",
    lastUpdated: "2024-12-15 18:30",
    pricePerLiter: 33.49,
    totalValue: 251175,
    averageDailySales: 1500,
    daysRemaining: 5,
  },
  {
    id: "STK-203",
    branch: "หนองจิก",
    tankNumber: 3,
    oilType: "E20",
    currentStock: 8300,
    minThreshold: 2000,
    maxCapacity: 10000,
    status: "normal",
    lastUpdated: "2024-12-15 18:30",
    pricePerLiter: 36.90,
    totalValue: 306270,
    averageDailySales: 1660,
    daysRemaining: 5,
  },
  {
    id: "STK-204",
    branch: "หนองจิก",
    tankNumber: 4,
    oilType: "Diesel", // HSD
    currentStock: 17000,
    minThreshold: 4000,
    maxCapacity: 20000,
    status: "normal",
    lastUpdated: "2024-12-15 18:30",
    pricePerLiter: 32.49,
    totalValue: 552330,
    averageDailySales: 3400,
    daysRemaining: 5,
  },
  {
    id: "STK-205",
    branch: "หนองจิก",
    tankNumber: 5,
    oilType: "Gasohol 91", // G91
    currentStock: 19000,
    minThreshold: 4000,
    maxCapacity: 20000,
    status: "normal",
    lastUpdated: "2024-12-15 18:30",
    pricePerLiter: 38.49,
    totalValue: 731310,
    averageDailySales: 3800,
    daysRemaining: 5,
  },

  // บายพาส - 5 หลุม (ใช้ข้อมูลคล้ายรูปภาพที่ 4)
  {
    id: "STK-401",
    branch: "บายพาส",
    tankNumber: 1,
    oilType: "Gasohol 95", // G95
    currentStock: 18000,
    minThreshold: 4000,
    maxCapacity: 20000,
    status: "normal",
    lastUpdated: "2024-12-15 18:30",
    pricePerLiter: 41.49,
    totalValue: 746820,
    averageDailySales: 3600,
    daysRemaining: 5,
  },
  {
    id: "STK-402",
    branch: "บายพาส",
    tankNumber: 2,
    oilType: "Premium Diesel", // HSP
    currentStock: 7500,
    minThreshold: 2000,
    maxCapacity: 10000,
    status: "normal",
    lastUpdated: "2024-12-15 18:30",
    pricePerLiter: 33.49,
    totalValue: 251175,
    averageDailySales: 1500,
    daysRemaining: 5,
  },
  {
    id: "STK-403",
    branch: "บายพาส",
    tankNumber: 3,
    oilType: "E20",
    currentStock: 8300,
    minThreshold: 2000,
    maxCapacity: 10000,
    status: "normal",
    lastUpdated: "2024-12-15 18:30",
    pricePerLiter: 36.90,
    totalValue: 306270,
    averageDailySales: 1660,
    daysRemaining: 5,
  },
  {
    id: "STK-404",
    branch: "บายพาส",
    tankNumber: 4,
    oilType: "Diesel", // HSD
    currentStock: 17000,
    minThreshold: 4000,
    maxCapacity: 20000,
    status: "normal",
    lastUpdated: "2024-12-15 18:30",
    pricePerLiter: 32.49,
    totalValue: 552330,
    averageDailySales: 3400,
    daysRemaining: 5,
  },
  {
    id: "STK-405",
    branch: "บายพาส",
    tankNumber: 5,
    oilType: "Gasohol 91", // G91
    currentStock: 19000,
    minThreshold: 4000,
    maxCapacity: 20000,
    status: "normal",
    lastUpdated: "2024-12-15 18:30",
    pricePerLiter: 38.49,
    totalValue: 731310,
    averageDailySales: 3800,
    daysRemaining: 5,
  },
];

export default function Stock() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("ทั้งหมด");
  const [selectedOilType, setSelectedOilType] = useState("ทั้งหมด");
  const [selectedStatus, setSelectedStatus] = useState<"ทั้งหมด" | StockStatus>("ทั้งหมด");
  const [showThresholdModal, setShowThresholdModal] = useState(false);
  const [editingThresholds, setEditingThresholds] = useState<Record<string, number>>({});

  const filteredStock = mockStockData
    .filter((item) => {
      const matchesSearch =
        item.oilType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.branch.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.tankNumber.toString().includes(searchTerm);

      const matchesBranch = selectedBranch === "ทั้งหมด" || item.branch === selectedBranch;
      const matchesOilType = selectedOilType === "ทั้งหมด" || item.oilType === selectedOilType;
      const matchesStatus = selectedStatus === "ทั้งหมด" || item.status === selectedStatus;

      return matchesSearch && matchesBranch && matchesOilType && matchesStatus;
    })
    .sort((a, b) => {
      // เรียงตามสาขา (ไฮโซ -> ดินดำ -> หนองจิก -> ตักสิลา -> บายพาส -> มายมาส) แล้วตามหลุม
      if (a.branch !== b.branch) {
        const branchOrder = ["ปั๊มไฮโซ", "ดินดำ", "หนองจิก", "ตักสิลา", "บายพาส", "มายมาส"];
        return branchOrder.indexOf(a.branch) - branchOrder.indexOf(b.branch);
      }
      return a.tankNumber - b.tankNumber;
    });

  const summary = {
    totalItems: mockStockData.length,
    totalStock: mockStockData.reduce((sum, item) => sum + item.currentStock, 0),
    totalValue: mockStockData.reduce((sum, item) => sum + item.totalValue, 0),
    criticalCount: mockStockData.filter((item) => item.status === "critical").length,
    warningCount: mockStockData.filter((item) => item.status === "warning").length,
    normalCount: mockStockData.filter((item) => item.status === "normal").length,
  };

  const getStatusBadgeClasses = (status: StockStatus) => {
    if (status === "normal") {
      return "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800";
    }
    if (status === "warning") {
      return "bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800";
    }
    return "bg-red-50 text-red-600 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800";
  };

  const getStatusIcon = (status: StockStatus) => {
    if (status === "normal") return CheckCircle;
    if (status === "warning") return AlertTriangle;
    return XCircle;
  };

  const getStockPercentage = (item: StockItem) => {
    return (item.currentStock / item.maxCapacity) * 100;
  };

  const getStockColor = (percentage: number, status: StockStatus) => {
    if (status === "critical" || percentage < 20) return "bg-red-500";
    if (status === "warning" || percentage < 40) return "bg-orange-500";
    return "bg-emerald-500";
  };

  // ไปหน้าสั่งน้ำมันพร้อมเลือกน้ำมันที่เหลือน้อย
  const goToOrderLowStock = (oilType?: string) => {
    navigate("/app/gas-station/station-order", {
      state: {
        lowStockOil: oilType,
      },
    });
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2 flex items-center gap-3">
              <Package className="w-8 h-8 text-blue-500" />
              สต็อกน้ำมัน
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              ตรวจสอบและจัดการสต็อกน้ำมันทั้ง 5 ปั๊ม แยกตามสาขาและประเภทน้ำมัน พร้อมแจ้งเตือนสต็อกต่ำ
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowThresholdModal(true)}
              className="px-6 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl transition-all duration-200 font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2 whitespace-nowrap"
            >
              <Settings className="w-4 h-4" />
              ตั้งค่าเกณฑ์ต่ำสุด
            </button>
            <button
              onClick={() => navigate("/app/gas-station/update-stock")}
              className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl transition-all duration-200 font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2 whitespace-nowrap"
            >
              <RefreshCw className="w-4 h-4" />
              อัพเดตสต็อก
            </button>
          </div>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          {
            title: "สต็อกรวมทั้งหมด",
            value: numberFormatter.format(summary.totalStock),
            subtitle: `ลิตร (${currencyFormatter.format(summary.totalValue)})`,
            icon: Droplet,
            iconColor: "bg-gradient-to-br from-blue-500 to-blue-600",
          },
          {
            title: "มูลค่าสต็อกรวม",
            value: currencyFormatter.format(summary.totalValue),
            subtitle: "บาท",
            icon: BarChart3,
            iconColor: "bg-gradient-to-br from-purple-500 to-purple-600",
          },
          {
            title: "สต็อกปกติ",
            value: summary.normalCount,
            subtitle: "รายการ",
            icon: CheckCircle,
            iconColor: "bg-gradient-to-br from-emerald-500 to-emerald-600",
          },
          {
            title: "สต็อกต่ำ / วิกฤต",
            value: summary.criticalCount + summary.warningCount,
            subtitle: "รายการ",
            icon: AlertTriangle,
            iconColor: "bg-gradient-to-br from-red-500 to-red-600",
            alert: summary.criticalCount + summary.warningCount > 0,
          },
        ].map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
          >
            <div className="p-4">
              <div className="flex items-center">
                <div className={`w-16 h-16 ${stat.iconColor} rounded-lg flex items-center justify-center shadow-lg mr-4`}>
                  <stat.icon className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h6 className="text-gray-600 dark:text-gray-400 text-sm font-semibold mb-1">{stat.title}</h6>
                  <h6 className="text-gray-800 dark:text-white text-2xl font-extrabold mb-0">{stat.value}</h6>
                  <p className="text-gray-500 dark:text-gray-500 text-xs mt-1">{stat.subtitle}</p>
                </div>
              </div>
              {stat.alert && (
                <div className="mt-3 flex items-center justify-end">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5 flex flex-col md:flex-row gap-4 mb-6"
      >
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="ค้นหาสาขา, ประเภทน้ำมัน, รหัสสต็อก..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 text-gray-800 dark:text-white transition-all duration-200"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
        </div>
        <select
          value={selectedBranch}
          onChange={(e) => setSelectedBranch(e.target.value)}
          className="px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 text-gray-800 dark:text-white transition-all duration-200"
        >
          <option>ทั้งหมด</option>
          <option>ปั๊มไฮโซ</option>
          <option>ดินดำ</option>
          <option>หนองจิก</option>
          <option>ตักสิลา</option>
          <option>บายพาส</option>
          <option>มายมาส</option>
        </select>
        <select
          value={selectedOilType}
          onChange={(e) => setSelectedOilType(e.target.value)}
          className="px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 text-gray-800 dark:text-white transition-all duration-200"
        >
          <option>ทั้งหมด</option>
          <option>Premium Diesel</option>
          <option>Premium Gasohol 95</option>
          <option>Diesel</option>
          <option>E85</option>
          <option>E20</option>
          <option>Gasohol 91</option>
          <option>Gasohol 95</option>
        </select>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value as "ทั้งหมด" | StockStatus)}
          className="px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 text-gray-800 dark:text-white transition-all duration-200"
        >
          <option>ทั้งหมด</option>
          <option value="normal">ปกติ</option>
          <option value="warning">เตือน</option>
          <option value="critical">วิกฤต</option>
        </select>
      </motion.div>

      {/* Alert Section */}
      {(summary.criticalCount > 0 || summary.warningCount > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45 }}
          className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 dark:border-red-600 rounded-xl p-6 shadow-md"
        >
          <div className="flex items-start gap-4">
            <div className="p-2 bg-red-500/20 rounded-xl flex-shrink-0">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between flex-wrap gap-4 mb-3">
                <div>
                  <h3 className="text-lg font-bold text-red-900 dark:text-red-100 mb-1">
                    แจ้งเตือนสต็อกต่ำ
                  </h3>
                  <p className="text-sm text-red-800 dark:text-red-200">
                    มีสต็อกน้ำมันที่ต่ำกว่าเกณฑ์หรืออยู่ในระดับวิกฤต กรุณาตรวจสอบและสั่งซื้อน้ำมันเพิ่มเติม
                  </p>
                </div>
                <button
                  onClick={() => goToOrderLowStock()}
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl transition-all duration-200 font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2 whitespace-nowrap"
                >
                  <ShoppingCart className="w-4 h-4" />
                  สั่งน้ำมันที่เหลือน้อยทั้งหมด
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {mockStockData
                  .filter((item) => item.status === "critical" || item.status === "warning")
                  .sort((a, b) => a.currentStock - b.currentStock) // เรียงจากน้อยไปมาก
                  .map((item) => (
                    <div
                      key={item.id}
                      className="p-3 bg-white dark:bg-gray-800 border border-red-200 dark:border-red-800 rounded-lg flex items-center justify-between gap-3 hover:border-red-300 dark:hover:border-red-700 transition-colors"
                    >
                      <div className="flex items-center gap-2 flex-1">
                        <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-red-900 dark:text-red-100 text-sm truncate">
                            {item.branch} - {item.oilType}
                          </div>
                          <div className="text-xs text-red-700 dark:text-red-300">
                            ถังที่ {item.tankNumber} • เหลือ {numberFormatter.format(item.currentStock)} ลิตร ({currencyFormatter.format(item.totalValue)})
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => goToOrderLowStock(item.oilType)}
                        className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center gap-1.5 text-xs font-semibold whitespace-nowrap"
                        title={`สั่ง${item.oilType}`}
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        สั่ง
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Stock Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden"
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-1">รายการสต็อกน้ำมันทั้ง 5 ปั๊ม</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            สต็อกน้ำมันแยกตามสาขาและประเภทน้ำมัน พร้อมสถานะและแจ้งเตือน
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400">
                  สาขา
                </th>
                <th className="text-center py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400">
                  หลุม
                </th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400">
                  ประเภทน้ำมัน
                </th>
                <th className="text-right py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400">
                  สต็อกปัจจุบัน
                </th>
                <th className="text-right py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400">
                  เกณฑ์ต่ำสุด
                </th>
                <th className="text-right py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400">
                  ความจุสูงสุด
                </th>
                <th className="text-center py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400">
                  ระดับสต็อก
                </th>
                <th className="text-right py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400">
                  ราคาต่อลิตร
                </th>
                <th className="text-right py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400">
                  มูลค่า
                </th>
                <th className="text-right py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400">
                  ขายเฉลี่ย/วัน
                </th>
                <th className="text-right py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400">
                  เหลือ (วัน)
                </th>
                <th className="text-center py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400">สถานะ</th>
                <th className="text-center py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {filteredStock.length === 0 && (
                <tr>
                  <td colSpan={13} className="py-8 px-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    ไม่พบข้อมูลสต็อกที่ตรงกับเงื่อนไขค้นหา
                  </td>
                </tr>
              )}
              {filteredStock.map((item, index) => {
                const stockPercentage = getStockPercentage(item);
                const StatusIcon = getStatusIcon(item.status);
                return (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className={`border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${item.status === "critical" ? "bg-red-50/30 dark:bg-red-900/10" : ""
                      }`}
                  >
                    <td className="py-4 px-6 text-sm font-semibold text-gray-800 dark:text-white">{item.branch}</td>
                    <td className="py-4 px-6 text-sm text-center font-semibold text-gray-800 dark:text-white">
                      {item.tankNumber}
                    </td>
                    <td className="py-4 px-6 text-sm font-semibold text-gray-800 dark:text-white">
                      <div className="flex flex-col">
                        <span>{item.oilType}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 font-normal">ถังที่ {item.tankNumber}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-right font-semibold text-gray-800 dark:text-white">
                      <div className="flex flex-col items-end">
                        <span>{numberFormatter.format(item.currentStock)} ลิตร</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 font-normal">
                          {currencyFormatter.format(item.totalValue)}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-right text-gray-600 dark:text-gray-400">
                      {numberFormatter.format(item.minThreshold)}
                    </td>
                    <td className="py-4 px-6 text-sm text-right text-gray-600 dark:text-gray-400">
                      {numberFormatter.format(item.maxCapacity)}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center">
                        <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-500 ${getStockColor(
                              stockPercentage,
                              item.status
                            )}`}
                            style={{ width: `${Math.min(stockPercentage, 100)}%` }}
                          ></div>
                        </div>
                        <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                          {stockPercentage.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-right text-gray-600 dark:text-gray-400">
                      {numberFormatter.format(item.pricePerLiter)}
                    </td>
                    <td className="py-4 px-6 text-sm text-right font-semibold text-gray-800 dark:text-white">
                      {currencyFormatter.format(item.totalValue)}
                    </td>
                    <td className="py-4 px-6 text-sm text-right text-gray-600 dark:text-gray-400">
                      {numberFormatter.format(item.averageDailySales)}
                    </td>
                    <td className="py-4 px-6 text-sm text-right">
                      <span
                        className={`font-semibold ${item.daysRemaining <= 2
                          ? "text-red-600 dark:text-red-400"
                          : item.daysRemaining <= 3
                            ? "text-orange-600 dark:text-orange-400"
                            : "text-emerald-600 dark:text-emerald-400"
                          }`}
                      >
                        {item.daysRemaining}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border ${getStatusBadgeClasses(
                          item.status
                        )}`}
                      >
                        <StatusIcon className="w-3.5 h-3.5" />
                        {item.status === "normal" && "ปกติ"}
                        {item.status === "warning" && "เตือน"}
                        {item.status === "critical" && "วิกฤต"}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                          title="ดูรายละเอียด"
                        >
                          <Eye className="w-4 h-4 text-gray-400 hover:text-blue-500" />
                        </button>
                        {(item.status === "critical" || item.status === "warning") && (
                          <button
                            onClick={() => goToOrderLowStock(item.oilType)}
                            className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-xl transition-colors"
                            title="สั่งน้ำมัน"
                          >
                            <ShoppingCart className="w-4 h-4 text-blue-500 hover:text-blue-600" />
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Threshold Settings Modal */}
      {showThresholdModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Settings className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-1">
                    ตั้งค่าเกณฑ์ต่ำสุด (Low Level Alert)
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    ตั้งค่าเกณฑ์ต่ำสุดแยกรายถัง/รายปั๊ม - ปั๊ม Submersible ห้ามแห้งเด็ดขาด
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowThresholdModal(false);
                  setEditingThresholds({});
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all duration-200 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6 bg-gray-50 dark:bg-gray-900/50">
              <div className="space-y-4">
                {/* Info Alert */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
                        ข้อควรระวัง
                      </p>
                      <p className="text-xs text-blue-700 dark:text-blue-300">
                        ปั๊มแบบ Submersible (ปั๊มจุ่ม) ห้ามแห้งเด็ดขาด เนื่องจากเสี่ยงมอเตอร์ไหม้ 
                        ในขณะที่ปั๊ม Suction (ดูด) ยอมรับระดับต่ำกว่าได้ กรุณาตั้งค่าเกณฑ์ให้เหมาะสมกับประเภทปั๊ม
                      </p>
                    </div>
                  </div>
                </div>

                {/* Threshold Settings Table */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">สาขา</th>
                          <th className="text-center py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">ถังที่</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">ประเภทน้ำมัน</th>
                          <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">ความจุถัง (ลิตร)</th>
                          <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">เกณฑ์ต่ำสุดปัจจุบัน</th>
                          <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">ตั้งค่าใหม่ (ลิตร)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {mockStockData
                          .sort((a, b) => {
                            const branchOrder = ["ปั๊มไฮโซ", "ดินดำ", "หนองจิก", "ตักสิลา", "บายพาส", "มายมาส"];
                            if (a.branch !== b.branch) {
                              return branchOrder.indexOf(a.branch) - branchOrder.indexOf(b.branch);
                            }
                            return a.tankNumber - b.tankNumber;
                          })
                          .map((item) => (
                            <tr
                              key={item.id}
                              className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                            >
                              <td className="py-3 px-4 text-sm font-semibold text-gray-800 dark:text-white">{item.branch}</td>
                              <td className="py-3 px-4 text-sm text-center text-gray-800 dark:text-white">{item.tankNumber}</td>
                              <td className="py-3 px-4 text-sm text-gray-800 dark:text-white">{item.oilType}</td>
                              <td className="py-3 px-4 text-sm text-right text-gray-600 dark:text-gray-400">
                                {numberFormatter.format(item.maxCapacity)}
                              </td>
                              <td className="py-3 px-4 text-sm text-right text-gray-600 dark:text-gray-400">
                                {numberFormatter.format(item.minThreshold)}
                              </td>
                              <td className="py-3 px-4">
                                <input
                                  type="number"
                                  min="0"
                                  max={item.maxCapacity}
                                  defaultValue={editingThresholds[item.id] ?? item.minThreshold}
                                  onChange={(e) => {
                                    setEditingThresholds({
                                      ...editingThresholds,
                                      [item.id]: parseInt(e.target.value) || 0,
                                    });
                                  }}
                                  className="w-32 px-3 py-2 text-right bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 text-gray-800 dark:text-white text-sm"
                                />
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-5 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => {
                  setShowThresholdModal(false);
                  setEditingThresholds({});
                }}
                className="px-6 py-2.5 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-all duration-200 font-medium hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-700"
              >
                ยกเลิก
              </button>
              <button
                onClick={() => {
                  // ในระบบจริงจะบันทึกผ่าน API
                  console.log("บันทึกเกณฑ์ต่ำสุด:", editingThresholds);
                  alert("บันทึกการตั้งค่าเกณฑ์ต่ำสุดเรียบร้อยแล้ว");
                  setShowThresholdModal(false);
                  setEditingThresholds({});
                }}
                className="px-8 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl transition-all duration-200 font-semibold shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                บันทึกการตั้งค่า
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

