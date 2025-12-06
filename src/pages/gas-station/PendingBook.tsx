import { motion, AnimatePresence } from "framer-motion";
import React from "react";
import { useState } from "react";
import {
  AlertTriangle,
  Search,
  Package,
  ShoppingCart,
  ChevronDown,
  ChevronUp,
  Truck,
  Building2,
  Droplet,
  Calendar,
  Clock,
  TrendingUp,
  Filter,
  Download,
  Eye,
  MapPin,
} from "lucide-react";

const numberFormatter = new Intl.NumberFormat("th-TH", {
  maximumFractionDigits: 0,
});

// Interface สำหรับรายการส่งออกไปแต่ละสาขา
interface DistributionItem {
  branch: string;
  quantity: number;
  status: "รอส่ง" | "ส่งแล้ว" | "ส่งบางส่วน";
}

// Interface สำหรับรายการตั้งพัก
interface PendingOrder {
  orderNo: string;
  orderDate: string;
  expectedDeliveryDate: string;
  daysPending: number;
  status: "รอรับ" | "รับบางส่วน" | "รับครบแล้ว";
  items: {
    oilType: string;
    quantityOrdered: number;
    quantityReceived: number;
    quantityPending: number;
    distributions: DistributionItem[]; // รายการส่งออกไปแต่ละสาขา
  }[];
}

// Mock data - สมุดตั้งพัก: รายการสั่งซื้อน้ำมันเข้าสาขาใหญ่ และส่งออกไปให้แต่ละสาขาย่อย
const mockPendingBook: PendingOrder[] = [
  {
    orderNo: "SO-20241215-001",
    orderDate: "2024-12-15",
    expectedDeliveryDate: "2024-12-16",
    daysPending: 1,
    status: "รอรับ",
    items: [
      {
        oilType: "Premium Diesel",
        quantityOrdered: 50000,
        quantityReceived: 0,
        quantityPending: 50000,
        distributions: [
          { branch: "ปั๊มไฮโซ", quantity: 20000, status: "รอส่ง" },
          { branch: "หนองจิก", quantity: 15000, status: "รอส่ง" },
          { branch: "ตักสิลา", quantity: 10000, status: "รอส่ง" },
          { branch: "บายพาส", quantity: 5000, status: "รอส่ง" },
        ],
      },
      {
        oilType: "Gasohol 95",
        quantityOrdered: 30000,
        quantityReceived: 0,
        quantityPending: 30000,
        distributions: [
          { branch: "ปั๊มไฮโซ", quantity: 12000, status: "รอส่ง" },
          { branch: "หนองจิก", quantity: 10000, status: "รอส่ง" },
          { branch: "ตักสิลา", quantity: 8000, status: "รอส่ง" },
        ],
      },
    ],
  },
  {
    orderNo: "SO-20241214-002",
    orderDate: "2024-12-14",
    expectedDeliveryDate: "2024-12-15",
    daysPending: 2,
    status: "รับบางส่วน",
    items: [
      {
        oilType: "Diesel",
        quantityOrdered: 40000,
        quantityReceived: 25000,
        quantityPending: 15000,
        distributions: [
          { branch: "ปั๊มไฮโซ", quantity: 15000, status: "ส่งบางส่วน" },
          { branch: "หนองจิก", quantity: 10000, status: "ส่งแล้ว" },
          { branch: "ตักสิลา", quantity: 8000, status: "ส่งแล้ว" },
          { branch: "บายพาส", quantity: 7000, status: "รอส่ง" },
        ],
      },
      {
        oilType: "Gasohol 91",
        quantityOrdered: 20000,
        quantityReceived: 20000,
        quantityPending: 0,
        distributions: [
          { branch: "ปั๊มไฮโซ", quantity: 10000, status: "ส่งแล้ว" },
          { branch: "หนองจิก", quantity: 6000, status: "ส่งแล้ว" },
          { branch: "ตักสิลา", quantity: 4000, status: "ส่งแล้ว" },
        ],
      },
    ],
  },
  {
    orderNo: "SO-20241213-003",
    orderDate: "2024-12-13",
    expectedDeliveryDate: "2024-12-14",
    daysPending: 3,
    status: "รอรับ",
    items: [
      {
        oilType: "E20",
        quantityOrdered: 25000,
        quantityReceived: 0,
        quantityPending: 25000,
        distributions: [
          { branch: "ปั๊มไฮโซ", quantity: 12000, status: "รอส่ง" },
          { branch: "หนองจิก", quantity: 8000, status: "รอส่ง" },
          { branch: "ตักสิลา", quantity: 5000, status: "รอส่ง" },
        ],
      },
    ],
  },
];

export default function PendingBook() {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());

  // คำนวณยอดรวมจากทุก order และทุก item
  const totalPending = mockPendingBook.reduce(
    (sum, order) =>
      sum + order.items.reduce((itemSum, item) => itemSum + item.quantityPending, 0),
    0
  );
  const orderCount = mockPendingBook.length;
  const overdueCount = mockPendingBook.filter((item) => item.daysPending > 3).length;
  
  // คำนวณยอดรวมที่สั่ง
  const totalOrdered = mockPendingBook.reduce(
    (sum, order) =>
      sum + order.items.reduce((itemSum, item) => itemSum + item.quantityOrdered, 0),
    0
  );
  
  // กรองข้อมูลตาม search term
  const filteredData = mockPendingBook.filter(
    (order) =>
      order.orderNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.items.some((item) =>
        item.oilType.toLowerCase().includes(searchTerm.toLowerCase())
      ) ||
      order.items.some((item) =>
        item.distributions.some((dist) =>
          dist.branch.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
  );

  const toggleOrderExpansion = (orderNo: string) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderNo)) {
      newExpanded.delete(orderNo);
    } else {
      newExpanded.add(orderNo);
    }
    setExpandedOrders(newExpanded);
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
        <div className="flex items-center gap-4 mb-3">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
            <Package className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-1">สมุดตั้งพัก</h1>
            <p className="text-gray-600 dark:text-gray-400">
              รายการสั่งซื้อน้ำมันเข้าสาขาใหญ่ และการส่งออกไปให้แต่ละสาขาย่อย
            </p>
          </div>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          {
            title: "ยอดตั้งพักรวม",
            value: numberFormatter.format(totalPending),
            subtitle: "ลิตร",
            icon: Package,
            iconColor: "bg-gradient-to-br from-blue-500 to-cyan-500",
            bgGradient: "from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20",
            borderColor: "border-blue-200 dark:border-blue-800",
          },
          {
            title: "จำนวนใบสั่งซื้อ",
            value: orderCount,
            subtitle: "รายการ",
            icon: ShoppingCart,
            iconColor: "bg-gradient-to-br from-purple-500 to-pink-500",
            bgGradient: "from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20",
            borderColor: "border-purple-200 dark:border-purple-800",
          },
          {
            title: "ค้างรับเกิน 3 วัน",
            value: overdueCount,
            subtitle: "รายการ",
            icon: AlertTriangle,
            iconColor: overdueCount > 0 ? "bg-gradient-to-br from-red-500 to-orange-500" : "bg-gradient-to-br from-emerald-500 to-green-500",
            bgGradient: overdueCount > 0 ? "from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20" : "from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20",
            borderColor: overdueCount > 0 ? "border-red-200 dark:border-red-800" : "border-emerald-200 dark:border-emerald-800",
            badge: overdueCount > 0 ? "เกินกำหนด" : "ปกติ",
            badgeColor: overdueCount > 0 ? "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800" : "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800",
          },
          {
            title: "ยอดรวมที่สั่ง",
            value: numberFormatter.format(totalOrdered),
            subtitle: "ลิตร",
            icon: TrendingUp,
            iconColor: "bg-gradient-to-br from-indigo-500 to-purple-500",
            bgGradient: "from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20",
            borderColor: "border-indigo-200 dark:border-indigo-800",
          },
        ].map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className={`bg-gradient-to-br ${stat.bgGradient} border ${stat.borderColor} rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group`}
          >
            <div className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-14 h-14 ${stat.iconColor} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className="w-7 h-7 text-white" />
                </div>
                {stat.badge && (
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${stat.badgeColor}`}>
                    {stat.badge}
                  </span>
                )}
              </div>
              <div>
                <h6 className="text-gray-600 dark:text-gray-400 text-xs font-semibold mb-1 uppercase tracking-wide">{stat.title}</h6>
                <h6 className="text-gray-800 dark:text-white text-3xl font-extrabold mb-1">{stat.value}</h6>
                <p className="text-gray-500 dark:text-gray-500 text-xs">{stat.subtitle}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5 mb-6"
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="ค้นหาเลขที่ใบสั่งซื้อ, ประเภทน้ำมัน, สาขา..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 text-gray-800 dark:text-white transition-all duration-200"
            />
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <Filter className="w-4 h-4" />
              กรอง
            </button>
            <button className="px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>
      </motion.div>

      {/* Pending Book Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700"
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-1 flex items-center gap-2">
                <Droplet className="w-5 h-5 text-blue-500" />
                รายการตั้งพัก
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                รายการสั่งซื้อน้ำมันเข้าสาขาใหญ่ และรายละเอียดการส่งออกไปให้แต่ละสาขาย่อย
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg border border-blue-200 dark:border-blue-800">
                <span className="font-semibold">รวม: </span>
                <span>{numberFormatter.format(totalPending)} ลิตร</span>
              </div>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-300 dark:border-gray-600 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
                <th className="text-left py-4 px-6 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4" />
                    เลขที่ใบสั่งซื้อ
                  </div>
                </th>
                <th className="text-left py-4 px-6 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    วันที่สั่ง
                  </div>
                </th>
                <th className="text-left py-4 px-6 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    วันที่คาดรับ
                  </div>
                </th>
                <th className="text-left py-4 px-6 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <Droplet className="w-4 h-4" />
                    ประเภทน้ำมัน
                  </div>
                </th>
                <th className="text-right py-4 px-6 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">สั่ง (ลิตร)</th>
                <th className="text-right py-4 px-6 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">รับแล้ว (ลิตร)</th>
                <th className="text-right py-4 px-6 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">ตั้งพัก (ลิตร)</th>
                <th className="text-center py-4 px-6 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">ค้าง (วัน)</th>
                <th className="text-center py-4 px-6 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">สถานะ</th>
                <th className="text-center py-4 px-6 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((order, orderIndex) => (
                <React.Fragment key={order.orderNo}>
                  {order.items.map((item, itemIndex) => {
                    const isFirstItem = itemIndex === 0;
                    const isExpanded = expandedOrders.has(`${order.orderNo}-${item.oilType}`);
                    
                    return (
                      <React.Fragment key={`${order.orderNo}-${item.oilType}`}>
                        <motion.tr
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: (orderIndex * 0.1) + (itemIndex * 0.05) }}
                          className={`border-b border-gray-200 dark:border-gray-700 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-cyan-50/50 dark:hover:from-blue-900/10 dark:hover:to-cyan-900/10 transition-all duration-200 ${
                            order.daysPending > 3 ? "bg-red-50/30 dark:bg-red-900/10 border-l-4 border-l-red-500" : ""
                          } ${isFirstItem ? "border-t-2 border-gray-300 dark:border-gray-600 bg-gray-50/30 dark:bg-gray-900/30" : ""}`}
                        >
                          {isFirstItem && (
                            <>
                              <td className="py-4 px-6" rowSpan={order.items.length}>
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                                    <ShoppingCart className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                  </div>
                                  <span className="text-sm font-bold text-gray-800 dark:text-white">{order.orderNo}</span>
                                </div>
                              </td>
                              <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400" rowSpan={order.items.length}>
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4 text-gray-400" />
                                  <span>{order.orderDate}</span>
                                </div>
                              </td>
                              <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400" rowSpan={order.items.length}>
                                <div className="flex items-center gap-2">
                                  <Clock className="w-4 h-4 text-gray-400" />
                                  <span>{order.expectedDeliveryDate}</span>
                                </div>
                              </td>
                            </>
                          )}
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                                <Droplet className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                              </div>
                              <span className="text-sm font-semibold text-gray-800 dark:text-white">{item.oilType}</span>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-sm text-right">
                            <span className="font-bold text-gray-800 dark:text-white">{numberFormatter.format(item.quantityOrdered)}</span>
                          </td>
                          <td className="py-4 px-6 text-sm text-right">
                            <span className="font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-lg">
                              {numberFormatter.format(item.quantityReceived)}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-sm text-right">
                            <span className="font-bold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30 px-2 py-1 rounded-lg">
                              {numberFormatter.format(item.quantityPending)}
                            </span>
                          </td>
                          {isFirstItem && (
                            <td className="py-4 px-6 text-sm text-center" rowSpan={order.items.length}>
                              <div className="flex items-center justify-center gap-1">
                                <span className={`font-semibold ${order.daysPending > 3 ? "text-red-600 dark:text-red-400" : "text-gray-600 dark:text-gray-400"}`}>
                                  {order.daysPending} วัน
                                </span>
                                {order.daysPending > 3 && <AlertTriangle className="w-4 h-4 text-red-500" />}
                              </div>
                            </td>
                          )}
                          {isFirstItem && (
                            <td className="py-4 px-6 text-sm text-center" rowSpan={order.items.length}>
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                order.status === "รับครบแล้ว"
                                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                  : order.status === "รับบางส่วน"
                                  ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                                  : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                              }`}>
                                {order.status}
                              </span>
                            </td>
                          )}
                          <td className="py-4 px-6">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => toggleOrderExpansion(`${order.orderNo}-${item.oilType}`)}
                                className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-xl transition-all duration-200 hover:scale-110 active:scale-95"
                                title="ดูรายละเอียดการส่งออก"
                              >
                                {isExpanded ? (
                                  <ChevronUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                ) : (
                                  <ChevronDown className="w-4 h-4 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400" />
                                )}
                              </button>
                              <button
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all duration-200 hover:scale-110 active:scale-95"
                                title="ดูรายละเอียด"
                              >
                                <Eye className="w-4 h-4 text-gray-400 hover:text-blue-500" />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                        
                        {/* รายละเอียดการส่งออกไปแต่ละสาขา */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.tr
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="bg-gradient-to-r from-blue-50/50 to-cyan-50/50 dark:from-blue-900/20 dark:to-cyan-900/20 border-l-4 border-l-blue-500"
                            >
                              <td colSpan={10} className="px-6 py-5">
                                <div className="space-y-4">
                                  <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                                        <Truck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                      </div>
                                      <div>
                                        <span className="text-sm font-bold text-gray-800 dark:text-white">
                                          รายการส่งออกไปให้แต่ละสาขาย่อย
                                        </span>
                                        <span className="ml-2 text-sm font-semibold text-blue-600 dark:text-blue-400">
                                          {item.oilType}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                      รวม {item.distributions.length} สาขา
                                    </div>
                                  </div>
                                  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
                                    <div className="overflow-x-auto">
                                      <table className="w-full">
                                        <thead>
                                          <tr className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 border-b border-gray-200 dark:border-gray-700">
                                            <th className="text-left py-3 px-4 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                              <div className="flex items-center gap-2">
                                                <MapPin className="w-3.5 h-3.5" />
                                                สาขาย่อย
                                              </div>
                                            </th>
                                            <th className="text-right py-3 px-4 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">จำนวน (ลิตร)</th>
                                            <th className="text-center py-3 px-4 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">สถานะ</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {item.distributions.map((dist, distIndex) => (
                                            <motion.tr
                                              key={distIndex}
                                              initial={{ opacity: 0, x: -10 }}
                                              animate={{ opacity: 1, x: 0 }}
                                              transition={{ duration: 0.2, delay: distIndex * 0.05 }}
                                              className="border-b border-gray-100 dark:border-gray-700 hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors"
                                            >
                                              <td className="py-3 px-4">
                                                <div className="flex items-center gap-2">
                                                  <div className="w-7 h-7 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                                                    <Building2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                                                  </div>
                                                  <span className="text-sm font-semibold text-gray-800 dark:text-white">{dist.branch}</span>
                                                </div>
                                              </td>
                                              <td className="py-3 px-4 text-sm text-right">
                                                <span className="font-bold text-gray-800 dark:text-white">
                                                  {numberFormatter.format(dist.quantity)}
                                                </span>
                                              </td>
                                              <td className="py-3 px-4 text-center">
                                                <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${
                                                  dist.status === "ส่งแล้ว"
                                                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800"
                                                    : dist.status === "ส่งบางส่วน"
                                                    ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800"
                                                    : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600"
                                                }`}>
                                                  {dist.status}
                                                </span>
                                              </td>
                                            </motion.tr>
                                          ))}
                                          <tr className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-t-2 border-blue-200 dark:border-blue-800 font-bold">
                                            <td className="py-3 px-4 text-sm text-gray-800 dark:text-white">
                                              <div className="flex items-center gap-2">
                                                <Package className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                                รวม
                                              </div>
                                            </td>
                                            <td className="py-3 px-4 text-sm text-right">
                                              <span className="text-blue-600 dark:text-blue-400">
                                                {numberFormatter.format(
                                                  item.distributions.reduce((sum, d) => sum + d.quantity, 0)
                                                )}
                                              </span>
                                            </td>
                                            <td className="py-3 px-4"></td>
                                          </tr>
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </motion.tr>
                          )}
                        </AnimatePresence>
                      </React.Fragment>
                    );
                  })}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
