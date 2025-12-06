import { motion } from "framer-motion";
import { useState, useMemo } from "react";
import {
  Receipt,
  ShoppingCart,
  Search,
  Filter,
  Download,
  Eye,
  Building2,
  Droplet,
  Calendar,
  DollarSign,
  CheckCircle,
  Clock,
  AlertTriangle,
  FileText,
  Truck,
  X,
} from "lucide-react";

const currencyFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat("th-TH", {
  maximumFractionDigits: 0,
});

// ประเภทใบสั่งซื้อ
type OrderStatus = "รออนุมัติ" | "อนุมัติแล้ว" | "ส่งแล้ว" | "รับแล้ว" | "ยกเลิก";

// ข้อมูลรายการในใบสั่งซื้อ
type OrderItem = {
  oilType: string;
  quantity: number;
  pricePerLiter: number;
  totalAmount: number;
};

// ข้อมูลสาขาในใบสั่งซื้อ
type BranchOrder = {
  branchId: number;
  branchName: string;
  legalEntityName: string;
  address: string;
  items: OrderItem[];
  totalAmount: number;
};

// ข้อมูลใบสั่งซื้อ
type Order = {
  id: string;
  orderNo: string;
  supplierOrderNo?: string;
  billNo?: string;
  orderDate: string;
  deliveryDate?: string;
  items: OrderItem[];
  branches: BranchOrder[];
  totalAmount: number;
  status: OrderStatus;
  approvedBy?: string;
  approvedAt?: string;
  requestedBy: string;
  requestedAt: string;
  notes?: string;
};

// Mock data - ประวัติการสั่งซื้อ
const mockOrderHistory: Order[] = [
  {
    id: "ORD-001",
    orderNo: "SO-20241215-001",
    supplierOrderNo: "PTT-20241215-001",
    billNo: "BILL-20241215-001",
    orderDate: "2024-12-15",
    deliveryDate: "2024-12-16",
    items: [
      { oilType: "Premium Diesel", quantity: 24000, pricePerLiter: 32.5, totalAmount: 780000 },
      { oilType: "Premium Gasohol 95", quantity: 18000, pricePerLiter: 41.49, totalAmount: 746820 },
    ],
    branches: [
      {
        branchId: 4,
        branchName: "สาขา 4",
        legalEntityName: "บริษัท D จำกัด",
        address: "123 ถนนสุขุมวิท กรุงเทพมหานคร 10110",
        items: [
          { oilType: "Premium Diesel", quantity: 24000, pricePerLiter: 32.5, totalAmount: 780000 },
        ],
        totalAmount: 780000,
      },
      {
        branchId: 1,
        branchName: "ปั๊มไฮโซ",
        legalEntityName: "บริษัท A จำกัด",
        address: "100 ถนนเพชรบุรี กรุงเทพมหานคร 10400",
        items: [
          { oilType: "Premium Gasohol 95", quantity: 18000, pricePerLiter: 41.49, totalAmount: 746820 },
        ],
        totalAmount: 746820,
      },
    ],
    totalAmount: 1526820,
    status: "ส่งแล้ว",
    approvedBy: "คุณนิด",
    approvedAt: "2024-12-15 14:30",
    requestedBy: "ผู้จัดการสาขา 4",
    requestedAt: "2024-12-15 09:45",
    notes: "ส่งน้ำมันตามกำหนด",
  },
  {
    id: "ORD-002",
    orderNo: "SO-20241214-002",
    supplierOrderNo: "PTT-20241214-002",
    billNo: "BILL-20241214-002",
    orderDate: "2024-12-14",
    deliveryDate: "2024-12-15",
    items: [
      { oilType: "Diesel", quantity: 30000, pricePerLiter: 32.49, totalAmount: 974700 },
      { oilType: "Gasohol 95", quantity: 20000, pricePerLiter: 40.99, totalAmount: 819800 },
    ],
    branches: [
      {
        branchId: 1,
        branchName: "ปั๊มไฮโซ",
        legalEntityName: "บริษัท A จำกัด",
        address: "100 ถนนเพชรบุรี กรุงเทพมหานคร 10400",
        items: [
          { oilType: "Diesel", quantity: 30000, pricePerLiter: 32.49, totalAmount: 974700 },
          { oilType: "Gasohol 95", quantity: 20000, pricePerLiter: 40.99, totalAmount: 819800 },
        ],
        totalAmount: 1794500,
      },
    ],
    totalAmount: 1794500,
    status: "รับแล้ว",
    approvedBy: "คุณนิด",
    approvedAt: "2024-12-14 11:30",
    requestedBy: "ผู้จัดการปั๊มไฮโซ",
    requestedAt: "2024-12-14 10:30",
  },
  {
    id: "ORD-003",
    orderNo: "SO-20241213-003",
    supplierOrderNo: "PTT-20241213-003",
    billNo: "BILL-20241213-003",
    orderDate: "2024-12-13",
    deliveryDate: "2024-12-14",
    items: [
      { oilType: "E20", quantity: 25000, pricePerLiter: 35.99, totalAmount: 899750 },
      { oilType: "E85", quantity: 15000, pricePerLiter: 28.99, totalAmount: 434850 },
    ],
    branches: [
      {
        branchId: 2,
        branchName: "สาขา 2",
        legalEntityName: "บริษัท B จำกัด",
        address: "456 ถนนพหลโยธิน กรุงเทพมหานคร 10400",
        items: [
          { oilType: "E20", quantity: 25000, pricePerLiter: 35.99, totalAmount: 899750 },
        ],
        totalAmount: 899750,
      },
      {
        branchId: 3,
        branchName: "สาขา 3",
        legalEntityName: "บริษัท C จำกัด",
        address: "789 ถนนรัชดาภิเษก กรุงเทพมหานคร 10320",
        items: [
          { oilType: "E85", quantity: 15000, pricePerLiter: 28.99, totalAmount: 434850 },
        ],
        totalAmount: 434850,
      },
    ],
    totalAmount: 1334600,
    status: "รับแล้ว",
    approvedBy: "คุณนิด",
    approvedAt: "2024-12-13 15:00",
    requestedBy: "ผู้จัดการสาขา 2",
    requestedAt: "2024-12-13 09:15",
  },
  {
    id: "ORD-004",
    orderNo: "SO-20241212-004",
    supplierOrderNo: "PTT-20241212-004",
    orderDate: "2024-12-12",
    items: [
      { oilType: "Gasohol 91", quantity: 22000, pricePerLiter: 38.99, totalAmount: 857780 },
    ],
    branches: [
      {
        branchId: 5,
        branchName: "สาขา 5",
        legalEntityName: "บริษัท E จำกัด",
        address: "321 ถนนสีลม กรุงเทพมหานคร 10500",
        items: [
          { oilType: "Gasohol 91", quantity: 22000, pricePerLiter: 38.99, totalAmount: 857780 },
        ],
        totalAmount: 857780,
      },
    ],
    totalAmount: 857780,
    status: "อนุมัติแล้ว",
    approvedBy: "คุณนิด",
    approvedAt: "2024-12-12 16:00",
    requestedBy: "ผู้จัดการสาขา 5",
    requestedAt: "2024-12-12 11:30",
  },
  {
    id: "ORD-005",
    orderNo: "SO-20241211-005",
    orderDate: "2024-12-11",
    items: [
      { oilType: "Premium Diesel", quantity: 28000, pricePerLiter: 33.49, totalAmount: 937720 },
      { oilType: "Diesel", quantity: 20000, pricePerLiter: 32.49, totalAmount: 649800 },
    ],
    branches: [
      {
        branchId: 1,
        branchName: "ปั๊มไฮโซ",
        legalEntityName: "บริษัท A จำกัด",
        address: "100 ถนนเพชรบุรี กรุงเทพมหานคร 10400",
        items: [
          { oilType: "Premium Diesel", quantity: 28000, pricePerLiter: 33.49, totalAmount: 937720 },
          { oilType: "Diesel", quantity: 20000, pricePerLiter: 32.49, totalAmount: 649800 },
        ],
        totalAmount: 1587520,
      },
    ],
    totalAmount: 1587520,
    status: "รออนุมัติ",
    requestedBy: "ผู้จัดการปั๊มไฮโซ",
    requestedAt: "2024-12-11 10:00",
  },
];

const getStatusIcon = (status: OrderStatus) => {
  switch (status) {
    case "รออนุมัติ":
      return Clock;
    case "อนุมัติแล้ว":
      return CheckCircle;
    case "ส่งแล้ว":
      return Truck;
    case "รับแล้ว":
      return CheckCircle;
    case "ยกเลิก":
      return AlertTriangle;
    default:
      return FileText;
  }
};

const getStatusColor = (status: OrderStatus) => {
  switch (status) {
    case "รออนุมัติ":
      return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800";
    case "อนุมัติแล้ว":
      return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800";
    case "ส่งแล้ว":
      return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800";
    case "รับแล้ว":
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800";
    case "ยกเลิก":
      return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800";
    default:
      return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400 border-gray-200 dark:border-gray-800";
  }
};

export default function OrderHistory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("ทั้งหมด");
  const [filterBranch, setFilterBranch] = useState<string>("ทั้งหมด");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // กรองข้อมูล
  const filteredOrders = useMemo(() => {
    return mockOrderHistory.filter((order) => {
      const matchesSearch =
        order.orderNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.supplierOrderNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.billNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.branches.some((b) => b.branchName.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus = filterStatus === "ทั้งหมด" || order.status === filterStatus;
      const matchesBranch =
        filterBranch === "ทั้งหมด" || order.branches.some((b) => b.branchName === filterBranch);

      // กรองตามวันที่
      let matchesDate = true;
      if (startDate || endDate) {
        const orderDate = new Date(order.orderDate);
        if (startDate) {
          const start = new Date(startDate);
          start.setHours(0, 0, 0, 0);
          if (orderDate < start) {
            matchesDate = false;
          }
        }
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          if (orderDate > end) {
            matchesDate = false;
          }
        }
      }

      return matchesSearch && matchesStatus && matchesBranch && matchesDate;
    });
  }, [searchTerm, filterStatus, filterBranch, startDate, endDate]);

  // สรุปรวม
  const summary = useMemo(() => {
    return {
      totalOrders: filteredOrders.length,
      totalAmount: filteredOrders.reduce((sum, o) => sum + o.totalAmount, 0),
      totalQuantity: filteredOrders.reduce(
        (sum, o) => sum + o.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
        0
      ),
      pendingCount: filteredOrders.filter((o) => o.status === "รออนุมัติ").length,
    };
  }, [filteredOrders]);

  // รายชื่อสาขาทั้งหมด
  const allBranches = useMemo(() => {
    const branchSet = new Set<string>();
    mockOrderHistory.forEach((order) => {
      order.branches.forEach((b) => branchSet.add(b.branchName));
    });
    return Array.from(branchSet).sort();
  }, []);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2 flex items-center gap-3">
          <Receipt className="w-8 h-8 text-blue-500" />
          ประวัติการสั่งซื้อ / บิล
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          ดูประวัติการสั่งซื้อน้ำมันทั้งหมดและบิลที่เกี่ยวข้อง
        </p>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          {
            title: "จำนวนใบสั่งซื้อ",
            value: summary.totalOrders,
            subtitle: "รายการ",
            icon: Receipt,
            iconColor: "bg-gradient-to-br from-blue-500 to-blue-600",
          },
          {
            title: "ยอดรวมทั้งหมด",
            value: currencyFormatter.format(summary.totalAmount),
            subtitle: "บาท",
            icon: DollarSign,
            iconColor: "bg-gradient-to-br from-emerald-500 to-emerald-600",
          },
          {
            title: "จำนวนลิตรรวม",
            value: numberFormatter.format(summary.totalQuantity),
            subtitle: "ลิตร",
            icon: Droplet,
            iconColor: "bg-gradient-to-br from-cyan-500 to-cyan-600",
          },
          {
            title: "รออนุมัติ",
            value: summary.pendingCount,
            subtitle: "รายการ",
            icon: Clock,
            iconColor: "bg-gradient-to-br from-yellow-500 to-yellow-600",
            alert: summary.pendingCount > 0,
          },
        ].map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5 border-l-4 border-transparent hover:shadow-lg transition-all duration-200"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-12 h-12 ${stat.iconColor} rounded-xl flex items-center justify-center shadow-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              {stat.alert && (
                <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse" />
              )}
            </div>
            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">{stat.title}</h3>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">{stat.value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{stat.subtitle}</p>
          </motion.div>
        ))}
      </div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5"
      >
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="ค้นหาเลขที่ใบสั่งซื้อ, บิล, สาขา..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 text-gray-800 dark:text-white"
            />
          </div>

          {/* Filters Row */}
          <div className="flex flex-col lg:flex-row gap-4 items-end">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">กรองข้อมูล:</span>
            </div>

            {/* Date Range Filter */}
            <div className="flex items-center gap-2 flex-1">
              <Calendar className="w-4 h-4 text-gray-400" />
              <div className="flex items-center gap-2 flex-1">
                <div className="flex-1">
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">วันที่เริ่มต้น</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 text-gray-800 dark:text-white text-sm"
                  />
                </div>
                <span className="text-gray-400 mt-6">ถึง</span>
                <div className="flex-1">
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">วันที่สิ้นสุด</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 text-gray-800 dark:text-white text-sm"
                  />
                </div>
                {(startDate || endDate) && (
                  <button
                    onClick={() => {
                      setStartDate("");
                      setEndDate("");
                    }}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors mt-6"
                    title="ล้างวันที่"
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                )}
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex-1 min-w-[150px]">
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">สถานะ</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-gray-800 dark:text-white"
              >
                <option value="ทั้งหมด">ทุกสถานะ</option>
                <option value="รออนุมัติ">รออนุมัติ</option>
                <option value="อนุมัติแล้ว">อนุมัติแล้ว</option>
                <option value="ส่งแล้ว">ส่งแล้ว</option>
                <option value="รับแล้ว">รับแล้ว</option>
                <option value="ยกเลิก">ยกเลิก</option>
              </select>
            </div>

            {/* Branch Filter */}
            <div className="flex-1 min-w-[150px]">
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">สาขา</label>
              <select
                value={filterBranch}
                onChange={(e) => setFilterBranch(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-gray-800 dark:text-white"
              >
                <option value="ทั้งหมด">ทุกสาขา</option>
                {allBranches.map((branch) => (
                  <option key={branch} value={branch}>
                    {branch}
                  </option>
                ))}
              </select>
            </div>

            {/* Export Button */}
            <button
              onClick={() => alert("ส่งออกข้อมูลเป็น Excel (ฟังก์ชันนี้จะเชื่อมต่อกับระบบจริง)")}
              className="px-4 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl transition-all duration-200 font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-2 whitespace-nowrap"
            >
              <Download className="w-4 h-4" />
              ส่งออก
            </button>
          </div>
        </div>
      </motion.div>

      {/* Orders Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                <th className="text-left py-4 px-6 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4" />
                    เลขที่ใบสั่งซื้อ
                  </div>
                </th>
                <th className="text-left py-4 px-6 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <Receipt className="w-4 h-4" />
                    เลขที่บิล
                  </div>
                </th>
                <th className="text-left py-4 px-6 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    วันที่สั่งซื้อ
                  </div>
                </th>
                <th className="text-left py-4 px-6 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    สาขา
                  </div>
                </th>
                <th className="text-right py-4 px-6 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  <div className="flex items-center justify-end gap-2">
                    <Droplet className="w-4 h-4" />
                    จำนวนลิตร
                  </div>
                </th>
                <th className="text-right py-4 px-6 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  <div className="flex items-center justify-end gap-2">
                    <DollarSign className="w-4 h-4" />
                    ยอดรวม
                  </div>
                </th>
                <th className="text-center py-4 px-6 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">สถานะ</th>
                <th className="text-center py-4 px-6 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center">
                    <Receipt className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">ไม่พบข้อมูลการสั่งซื้อ</p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order, index) => {
                  const StatusIcon = getStatusIcon(order.status);
                  const totalQuantity = order.items.reduce((sum, item) => sum + item.quantity, 0);
                  const branchNames = order.branches.map((b) => b.branchName).join(", ");

                  return (
                    <motion.tr
                      key={order.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <ShoppingCart className="w-4 h-4 text-blue-500" />
                          <span className="text-sm font-semibold text-gray-800 dark:text-white">{order.orderNo}</span>
                        </div>
                        {order.supplierOrderNo && (
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                            Supplier: {order.supplierOrderNo}
                          </p>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        {order.billNo ? (
                          <div className="flex items-center gap-2">
                            <Receipt className="w-4 h-4 text-purple-500" />
                            <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                              {order.billNo}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-800 dark:text-white">{order.orderDate}</span>
                        </div>
                        {order.deliveryDate && (
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                            ส่ง: {order.deliveryDate}
                          </p>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-800 dark:text-white">{branchNames}</span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          {order.branches.length} สาขา
                        </p>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                          {numberFormatter.format(totalQuantity)} ลิตร
                        </span>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          {order.items.length} ประเภท
                        </p>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                          {currencyFormatter.format(order.totalAmount)}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold border flex items-center justify-center gap-1 ${getStatusColor(
                            order.status
                          )}`}
                        >
                          <StatusIcon className="w-3 h-3" />
                          {order.status}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                            title="ดูรายละเอียด"
                          >
                            <Eye className="w-4 h-4 text-blue-500" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedOrder(null)}
            className="fixed inset-0 bg-black/50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col relative z-10"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Receipt className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-1">
                    รายละเอียดใบสั่งซื้อ
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{selectedOrder.orderNo}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all duration-200 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
              {/* Order Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">วันที่สั่งซื้อ</p>
                  <p className="text-sm font-semibold text-gray-800 dark:text-white">{selectedOrder.orderDate}</p>
                </div>
                {selectedOrder.deliveryDate && (
                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">วันที่ส่ง</p>
                    <p className="text-sm font-semibold text-gray-800 dark:text-white">{selectedOrder.deliveryDate}</p>
                  </div>
                )}
                {selectedOrder.billNo && (
                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">เลขที่บิล</p>
                    <p className="text-sm font-semibold text-purple-600 dark:text-purple-400">{selectedOrder.billNo}</p>
                  </div>
                )}
                {selectedOrder.supplierOrderNo && (
                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">เลขที่ Supplier</p>
                    <p className="text-sm font-semibold text-gray-800 dark:text-white">
                      {selectedOrder.supplierOrderNo}
                    </p>
                  </div>
                )}
              </div>

              {/* Branches */}
              {selectedOrder.branches.map((branch, branchIndex) => (
                <div
                  key={branchIndex}
                  className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Building2 className="w-5 h-5 text-blue-500" />
                      <div>
                        <h4 className="text-lg font-bold text-gray-800 dark:text-white">{branch.branchName}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{branch.legalEntityName}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{branch.address}</p>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                      {currencyFormatter.format(branch.totalAmount)}
                    </span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700">
                          <th className="text-left py-2 px-3 font-semibold text-gray-600 dark:text-gray-400">
                            ประเภทน้ำมัน
                          </th>
                          <th className="text-right py-2 px-3 font-semibold text-gray-600 dark:text-gray-400">
                            จำนวน (ลิตร)
                          </th>
                          <th className="text-right py-2 px-3 font-semibold text-gray-600 dark:text-gray-400">
                            ราคาต่อลิตร
                          </th>
                          <th className="text-right py-2 px-3 font-semibold text-gray-600 dark:text-gray-400">
                            ยอดรวม
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {branch.items.map((item, itemIndex) => (
                          <tr
                            key={itemIndex}
                            className="border-b border-gray-100 dark:border-gray-700"
                          >
                            <td className="py-2 px-3">
                              <div className="flex items-center gap-2">
                                <Droplet className="w-4 h-4 text-blue-500" />
                                <span className="text-gray-800 dark:text-white">{item.oilType}</span>
                              </div>
                            </td>
                            <td className="py-2 px-3 text-right text-gray-800 dark:text-white">
                              {numberFormatter.format(item.quantity)}
                            </td>
                            <td className="py-2 px-3 text-right text-gray-600 dark:text-gray-400">
                              {currencyFormatter.format(item.pricePerLiter)}
                            </td>
                            <td className="py-2 px-3 text-right font-semibold text-emerald-600 dark:text-emerald-400">
                              {currencyFormatter.format(item.totalAmount)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}

              {/* Summary */}
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-5">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-gray-800 dark:text-white">ยอดรวมทั้งสิ้น</span>
                  <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    {currencyFormatter.format(selectedOrder.totalAmount)}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

