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

// Mock data - ทั้ง 5 ปั๊ม
const mockStockData: StockItem[] = [
  // ปั๊มไฮโซ
  {
    id: "STK-001",
    branch: "ปั๊มไฮโซ",
    oilType: "Premium Diesel",
    currentStock: 45000,
    minThreshold: 20000,
    maxCapacity: 100000,
    status: "normal",
    lastUpdated: "2024-12-15 18:30",
    pricePerLiter: 33.49,
    totalValue: 1507050,
    averageDailySales: 8500,
    daysRemaining: 5,
  },
  {
    id: "STK-002",
    branch: "ปั๊มไฮโซ",
    oilType: "Premium Gasohol 95",
    currentStock: 38000,
    minThreshold: 15000,
    maxCapacity: 80000,
    status: "normal",
    lastUpdated: "2024-12-15 18:30",
    pricePerLiter: 41.49,
    totalValue: 1576620,
    averageDailySales: 7200,
    daysRemaining: 5,
  },
  {
    id: "STK-003",
    branch: "ปั๊มไฮโซ",
    oilType: "Diesel",
    currentStock: 52000,
    minThreshold: 25000,
    maxCapacity: 120000,
    status: "normal",
    lastUpdated: "2024-12-15 18:30",
    pricePerLiter: 32.49,
    totalValue: 1689480,
    averageDailySales: 12000,
    daysRemaining: 4,
  },
  {
    id: "STK-004",
    branch: "ปั๊มไฮโซ",
    oilType: "E85",
    currentStock: 15000,
    minThreshold: 10000,
    maxCapacity: 40000,
    status: "warning",
    lastUpdated: "2024-12-15 18:30",
    pricePerLiter: 28.49,
    totalValue: 427350,
    averageDailySales: 4500,
    daysRemaining: 3,
  },
  {
    id: "STK-005",
    branch: "ปั๊มไฮโซ",
    oilType: "E20",
    currentStock: 28000,
    minThreshold: 15000,
    maxCapacity: 60000,
    status: "normal",
    lastUpdated: "2024-12-15 18:30",
    pricePerLiter: 36.90,
    totalValue: 1033200,
    averageDailySales: 6800,
    daysRemaining: 4,
  },
  {
    id: "STK-006",
    branch: "ปั๊มไฮโซ",
    oilType: "Gasohol 91",
    currentStock: 22000,
    minThreshold: 12000,
    maxCapacity: 50000,
    status: "normal",
    lastUpdated: "2024-12-15 18:30",
    pricePerLiter: 38.49,
    totalValue: 846780,
    averageDailySales: 5500,
    daysRemaining: 4,
  },
  {
    id: "STK-007",
    branch: "ปั๊มไฮโซ",
    oilType: "Gasohol 95",
    currentStock: 35000,
    minThreshold: 18000,
    maxCapacity: 70000,
    status: "normal",
    lastUpdated: "2024-12-15 18:30",
    pricePerLiter: 41.49,
    totalValue: 1452150,
    averageDailySales: 7800,
    daysRemaining: 4,
  },

  // ปั๊มธรรมดา 1
  {
    id: "STK-101",
    branch: "ปั๊มธรรมดา 1",
    oilType: "Premium Diesel",
    currentStock: 32000,
    minThreshold: 15000,
    maxCapacity: 80000,
    status: "normal",
    lastUpdated: "2024-12-15 18:30",
    pricePerLiter: 33.49,
    totalValue: 1071680,
    averageDailySales: 6500,
    daysRemaining: 5,
  },
  {
    id: "STK-102",
    branch: "ปั๊มธรรมดา 1",
    oilType: "Premium Gasohol 95",
    currentStock: 25000,
    minThreshold: 12000,
    maxCapacity: 60000,
    status: "normal",
    lastUpdated: "2024-12-15 18:30",
    pricePerLiter: 41.49,
    totalValue: 1037250,
    averageDailySales: 5500,
    daysRemaining: 5,
  },
  {
    id: "STK-103",
    branch: "ปั๊มธรรมดา 1",
    oilType: "Diesel",
    currentStock: 18000,
    minThreshold: 20000,
    maxCapacity: 100000,
    status: "critical",
    lastUpdated: "2024-12-15 18:30",
    pricePerLiter: 32.49,
    totalValue: 584820,
    averageDailySales: 9500,
    daysRemaining: 2,
  },
  {
    id: "STK-104",
    branch: "ปั๊มธรรมดา 1",
    oilType: "E85",
    currentStock: 12000,
    minThreshold: 8000,
    maxCapacity: 35000,
    status: "normal",
    lastUpdated: "2024-12-15 18:30",
    pricePerLiter: 28.49,
    totalValue: 341880,
    averageDailySales: 3500,
    daysRemaining: 3,
  },
  {
    id: "STK-105",
    branch: "ปั๊มธรรมดา 1",
    oilType: "E20",
    currentStock: 22000,
    minThreshold: 12000,
    maxCapacity: 50000,
    status: "normal",
    lastUpdated: "2024-12-15 18:30",
    pricePerLiter: 36.90,
    totalValue: 811800,
    averageDailySales: 5200,
    daysRemaining: 4,
  },
  {
    id: "STK-106",
    branch: "ปั๊มธรรมดา 1",
    oilType: "Gasohol 91",
    currentStock: 16000,
    minThreshold: 10000,
    maxCapacity: 40000,
    status: "normal",
    lastUpdated: "2024-12-15 18:30",
    pricePerLiter: 38.49,
    totalValue: 615840,
    averageDailySales: 4200,
    daysRemaining: 4,
  },
  {
    id: "STK-107",
    branch: "ปั๊มธรรมดา 1",
    oilType: "Gasohol 95",
    currentStock: 28000,
    minThreshold: 15000,
    maxCapacity: 60000,
    status: "normal",
    lastUpdated: "2024-12-15 18:30",
    pricePerLiter: 41.49,
    totalValue: 1161720,
    averageDailySales: 6200,
    daysRemaining: 5,
  },

  // ปั๊มธรรมดา 2
  {
    id: "STK-201",
    branch: "ปั๊มธรรมดา 2",
    oilType: "Premium Diesel",
    currentStock: 38000,
    minThreshold: 15000,
    maxCapacity: 80000,
    status: "normal",
    lastUpdated: "2024-12-15 18:30",
    pricePerLiter: 33.49,
    totalValue: 1272620,
    averageDailySales: 7000,
    daysRemaining: 5,
  },
  {
    id: "STK-202",
    branch: "ปั๊มธรรมดา 2",
    oilType: "Premium Gasohol 95",
    currentStock: 30000,
    minThreshold: 12000,
    maxCapacity: 60000,
    status: "normal",
    lastUpdated: "2024-12-15 18:30",
    pricePerLiter: 41.49,
    totalValue: 1244700,
    averageDailySales: 5800,
    daysRemaining: 5,
  },
  {
    id: "STK-203",
    branch: "ปั๊มธรรมดา 2",
    oilType: "Diesel",
    currentStock: 42000,
    minThreshold: 20000,
    maxCapacity: 100000,
    status: "normal",
    lastUpdated: "2024-12-15 18:30",
    pricePerLiter: 32.49,
    totalValue: 1364580,
    averageDailySales: 10000,
    daysRemaining: 4,
  },
  {
    id: "STK-204",
    branch: "ปั๊มธรรมดา 2",
    oilType: "E85",
    currentStock: 8500,
    minThreshold: 8000,
    maxCapacity: 35000,
    status: "warning",
    lastUpdated: "2024-12-15 18:30",
    pricePerLiter: 28.49,
    totalValue: 242165,
    averageDailySales: 3800,
    daysRemaining: 2,
  },
  {
    id: "STK-205",
    branch: "ปั๊มธรรมดา 2",
    oilType: "E20",
    currentStock: 25000,
    minThreshold: 12000,
    maxCapacity: 50000,
    status: "normal",
    lastUpdated: "2024-12-15 18:30",
    pricePerLiter: 36.90,
    totalValue: 922500,
    averageDailySales: 5500,
    daysRemaining: 5,
  },
  {
    id: "STK-206",
    branch: "ปั๊มธรรมดา 2",
    oilType: "Gasohol 91",
    currentStock: 18000,
    minThreshold: 10000,
    maxCapacity: 40000,
    status: "normal",
    lastUpdated: "2024-12-15 18:30",
    pricePerLiter: 38.49,
    totalValue: 692820,
    averageDailySales: 4500,
    daysRemaining: 4,
  },
  {
    id: "STK-207",
    branch: "ปั๊มธรรมดา 2",
    oilType: "Gasohol 95",
    currentStock: 32000,
    minThreshold: 15000,
    maxCapacity: 60000,
    status: "normal",
    lastUpdated: "2024-12-15 18:30",
    pricePerLiter: 41.49,
    totalValue: 1327680,
    averageDailySales: 6500,
    daysRemaining: 5,
  },

  // ปั๊มธรรมดา 3
  {
    id: "STK-301",
    branch: "ปั๊มธรรมดา 3",
    oilType: "Premium Diesel",
    currentStock: 28000,
    minThreshold: 15000,
    maxCapacity: 80000,
    status: "normal",
    lastUpdated: "2024-12-15 18:30",
    pricePerLiter: 33.49,
    totalValue: 937720,
    averageDailySales: 6000,
    daysRemaining: 5,
  },
  {
    id: "STK-302",
    branch: "ปั๊มธรรมดา 3",
    oilType: "Premium Gasohol 95",
    currentStock: 20000,
    minThreshold: 12000,
    maxCapacity: 60000,
    status: "normal",
    lastUpdated: "2024-12-15 18:30",
    pricePerLiter: 41.49,
    totalValue: 829800,
    averageDailySales: 5000,
    daysRemaining: 4,
  },
  {
    id: "STK-303",
    branch: "ปั๊มธรรมดา 3",
    oilType: "Diesel",
    currentStock: 35000,
    minThreshold: 20000,
    maxCapacity: 100000,
    status: "normal",
    lastUpdated: "2024-12-15 18:30",
    pricePerLiter: 32.49,
    totalValue: 1137150,
    averageDailySales: 8500,
    daysRemaining: 4,
  },
  {
    id: "STK-304",
    branch: "ปั๊มธรรมดา 3",
    oilType: "E85",
    currentStock: 10000,
    minThreshold: 8000,
    maxCapacity: 35000,
    status: "normal",
    lastUpdated: "2024-12-15 18:30",
    pricePerLiter: 28.49,
    totalValue: 284900,
    averageDailySales: 3200,
    daysRemaining: 3,
  },
  {
    id: "STK-305",
    branch: "ปั๊มธรรมดา 3",
    oilType: "E20",
    currentStock: 11000,
    minThreshold: 12000,
    maxCapacity: 50000,
    status: "critical",
    lastUpdated: "2024-12-15 18:30",
    pricePerLiter: 36.90,
    totalValue: 405900,
    averageDailySales: 4800,
    daysRemaining: 2,
  },
  {
    id: "STK-306",
    branch: "ปั๊มธรรมดา 3",
    oilType: "Gasohol 91",
    currentStock: 14000,
    minThreshold: 10000,
    maxCapacity: 40000,
    status: "normal",
    lastUpdated: "2024-12-15 18:30",
    pricePerLiter: 38.49,
    totalValue: 538860,
    averageDailySales: 3800,
    daysRemaining: 4,
  },
  {
    id: "STK-307",
    branch: "ปั๊มธรรมดา 3",
    oilType: "Gasohol 95",
    currentStock: 24000,
    minThreshold: 15000,
    maxCapacity: 60000,
    status: "normal",
    lastUpdated: "2024-12-15 18:30",
    pricePerLiter: 41.49,
    totalValue: 995760,
    averageDailySales: 5500,
    daysRemaining: 4,
  },

  // ปั๊มธรรมดา 4
  {
    id: "STK-401",
    branch: "ปั๊มธรรมดา 4",
    oilType: "Premium Diesel",
    currentStock: 35000,
    minThreshold: 15000,
    maxCapacity: 80000,
    status: "normal",
    lastUpdated: "2024-12-15 18:30",
    pricePerLiter: 33.49,
    totalValue: 1172150,
    averageDailySales: 6800,
    daysRemaining: 5,
  },
  {
    id: "STK-402",
    branch: "ปั๊มธรรมดา 4",
    oilType: "Premium Gasohol 95",
    currentStock: 27000,
    minThreshold: 12000,
    maxCapacity: 60000,
    status: "normal",
    lastUpdated: "2024-12-15 18:30",
    pricePerLiter: 41.49,
    totalValue: 1120230,
    averageDailySales: 5400,
    daysRemaining: 5,
  },
  {
    id: "STK-403",
    branch: "ปั๊มธรรมดา 4",
    oilType: "Diesel",
    currentStock: 48000,
    minThreshold: 20000,
    maxCapacity: 100000,
    status: "normal",
    lastUpdated: "2024-12-15 18:30",
    pricePerLiter: 32.49,
    totalValue: 1559520,
    averageDailySales: 11000,
    daysRemaining: 4,
  },
  {
    id: "STK-404",
    branch: "ปั๊มธรรมดา 4",
    oilType: "E85",
    currentStock: 13000,
    minThreshold: 8000,
    maxCapacity: 35000,
    status: "normal",
    lastUpdated: "2024-12-15 18:30",
    pricePerLiter: 28.49,
    totalValue: 370370,
    averageDailySales: 3900,
    daysRemaining: 3,
  },
  {
    id: "STK-405",
    branch: "ปั๊มธรรมดา 4",
    oilType: "E20",
    currentStock: 26000,
    minThreshold: 12000,
    maxCapacity: 50000,
    status: "normal",
    lastUpdated: "2024-12-15 18:30",
    pricePerLiter: 36.90,
    totalValue: 959400,
    averageDailySales: 5600,
    daysRemaining: 5,
  },
  {
    id: "STK-406",
    branch: "ปั๊มธรรมดา 4",
    oilType: "Gasohol 91",
    currentStock: 19000,
    minThreshold: 10000,
    maxCapacity: 40000,
    status: "normal",
    lastUpdated: "2024-12-15 18:30",
    pricePerLiter: 38.49,
    totalValue: 731310,
    averageDailySales: 4600,
    daysRemaining: 4,
  },
  {
    id: "STK-407",
    branch: "ปั๊มธรรมดา 4",
    oilType: "Gasohol 95",
    currentStock: 30000,
    minThreshold: 15000,
    maxCapacity: 60000,
    status: "normal",
    lastUpdated: "2024-12-15 18:30",
    pricePerLiter: 41.49,
    totalValue: 1244700,
    averageDailySales: 6300,
    daysRemaining: 5,
  },
];

export default function Stock() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("ทั้งหมด");
  const [selectedOilType, setSelectedOilType] = useState("ทั้งหมด");
  const [selectedStatus, setSelectedStatus] = useState<"ทั้งหมด" | StockStatus>("ทั้งหมด");

  const filteredStock = mockStockData
    .filter((item) => {
      const matchesSearch =
        item.oilType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.branch.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.id.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesBranch = selectedBranch === "ทั้งหมด" || item.branch === selectedBranch;
      const matchesOilType = selectedOilType === "ทั้งหมด" || item.oilType === selectedOilType;
      const matchesStatus = selectedStatus === "ทั้งหมด" || item.status === selectedStatus;

      return matchesSearch && matchesBranch && matchesOilType && matchesStatus;
    })
    .sort((a, b) => {
      // เรียงตาม currentStock จากน้อยไปมาก (เหลือน้อยสุดไว้บนสุด)
      return a.currentStock - b.currentStock;
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
          <button
            onClick={() => navigate("/app/gas-station/update-stock")}
            className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl transition-all duration-200 font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2 whitespace-nowrap"
          >
            <RefreshCw className="w-4 h-4" />
            อัพเดตสต็อก
          </button>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          {
            title: "สต็อกรวมทั้งหมด",
            value: numberFormatter.format(summary.totalStock),
            subtitle: "ลิตร",
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
          <option>ปั๊มธรรมดา 1</option>
          <option>ปั๊มธรรมดา 2</option>
          <option>ปั๊มธรรมดา 3</option>
          <option>ปั๊มธรรมดา 4</option>
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
                            {item.oilType}
                          </div>
                          <div className="text-xs text-red-700 dark:text-red-300">
                            เหลือ {numberFormatter.format(item.currentStock)} ลิตร
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
                  <td colSpan={12} className="py-8 px-4 text-center text-sm text-gray-500 dark:text-gray-400">
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
                    <td className="py-4 px-6 text-sm font-semibold text-gray-800 dark:text-white">{item.oilType}</td>
                    <td className="py-4 px-6 text-sm text-right font-semibold text-gray-800 dark:text-white">
                      {numberFormatter.format(item.currentStock)}
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
    </div>
  );
}

