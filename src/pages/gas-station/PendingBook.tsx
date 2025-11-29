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
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">สมุดตั้งพัก</h1>
        <p className="text-gray-600 dark:text-gray-400">
          รายการสั่งซื้อน้ำมันเข้าสาขาใหญ่ และการส่งออกไปให้แต่ละสาขาย่อย
        </p>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[
          {
            title: "ยอดตั้งพักรวม",
            value: numberFormatter.format(totalPending),
            subtitle: "ลิตร",
            icon: Package,
            iconColor: "bg-gradient-to-br from-blue-500 to-blue-600",
          },
          {
            title: "จำนวนใบสั่งซื้อ",
            value: orderCount,
            subtitle: "รายการ",
            icon: ShoppingCart,
            iconColor: "bg-gradient-to-br from-purple-500 to-purple-600",
          },
          {
            title: "ค้างรับเกิน 3 วัน",
            value: overdueCount,
            subtitle: "รายการ",
            icon: AlertTriangle,
            iconColor: "bg-gradient-to-br from-red-500 to-red-600",
            badge: overdueCount > 0 ? "เกินกำหนด" : undefined,
            badgeColor: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800",
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
              {stat.badge && (
                <div className="mt-3 flex items-center justify-end">
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${stat.badgeColor}`}>
                    {stat.badge}
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5 mb-6"
      >
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="ค้นหาเลขที่ใบสั่งซื้อ, สาขา..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 text-gray-800 dark:text-white transition-all duration-200"
          />
        </div>
      </motion.div>

      {/* Pending Book Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden"
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-1">
            รายการตั้งพัก
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            รายการสั่งซื้อน้ำมันเข้าสาขาใหญ่ และรายละเอียดการส่งออกไปให้แต่ละสาขาย่อย
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50">
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">เลขที่ใบสั่งซื้อ</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">วันที่สั่ง</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">วันที่คาดรับ</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">ประเภทน้ำมัน</th>
                <th className="text-right py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">สั่ง (ลิตร)</th>
                <th className="text-right py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">รับแล้ว (ลิตร)</th>
                <th className="text-right py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">ตั้งพัก (ลิตร)</th>
                <th className="text-center py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">ค้าง (วัน)</th>
                <th className="text-center py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">สถานะ</th>
                <th className="text-center py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">จัดการ</th>
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
                          className={`border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                            order.daysPending > 3 ? "bg-red-50/50 dark:bg-red-900/10" : ""
                          } ${isFirstItem ? "border-t-2 border-gray-300 dark:border-gray-600" : ""}`}
                        >
                          {isFirstItem && (
                            <>
                              <td className="py-4 px-6" rowSpan={order.items.length}>
                                <div className="flex items-center gap-2">
                                  <ShoppingCart className="w-4 h-4 text-blue-500" />
                                  <span className="text-sm font-semibold text-gray-800 dark:text-white">{order.orderNo}</span>
                                </div>
                              </td>
                              <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400" rowSpan={order.items.length}>
                                {order.orderDate}
                              </td>
                              <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400" rowSpan={order.items.length}>
                                {order.expectedDeliveryDate}
                              </td>
                            </>
                          )}
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              <Package className="w-4 h-4 text-purple-500" />
                              <span className="text-sm font-medium text-gray-800 dark:text-white">{item.oilType}</span>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-sm text-right font-semibold text-gray-800 dark:text-white">
                            {numberFormatter.format(item.quantityOrdered)}
                          </td>
                          <td className="py-4 px-6 text-sm text-right text-emerald-600 dark:text-emerald-400">
                            {numberFormatter.format(item.quantityReceived)}
                          </td>
                          <td className="py-4 px-6 text-sm text-right font-semibold text-orange-600 dark:text-orange-400">
                            {numberFormatter.format(item.quantityPending)}
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
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                                title="ดูรายละเอียดการส่งออก"
                              >
                                {isExpanded ? (
                                  <ChevronUp className="w-4 h-4 text-blue-500" />
                                ) : (
                                  <ChevronDown className="w-4 h-4 text-gray-400 hover:text-blue-500" />
                                )}
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
                              className="bg-blue-50/30 dark:bg-blue-900/10"
                            >
                              <td colSpan={10} className="px-6 py-4">
                                <div className="space-y-3">
                                  <div className="flex items-center gap-2 mb-3">
                                    <Truck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                    <span className="text-sm font-semibold text-gray-800 dark:text-white">
                                      รายการส่งออกไปให้แต่ละสาขาย่อย - {item.oilType}
                                    </span>
                                  </div>
                                  <div className="overflow-x-auto">
                                    <table className="w-full">
                                      <thead>
                                        <tr className="border-b border-gray-300 dark:border-gray-600">
                                          <th className="text-left py-2 px-4 text-xs font-semibold text-gray-700 dark:text-gray-300">สาขาย่อย</th>
                                          <th className="text-right py-2 px-4 text-xs font-semibold text-gray-700 dark:text-gray-300">จำนวน (ลิตร)</th>
                                          <th className="text-center py-2 px-4 text-xs font-semibold text-gray-700 dark:text-gray-300">สถานะ</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {item.distributions.map((dist, distIndex) => (
                                          <tr
                                            key={distIndex}
                                            className="border-b border-gray-200 dark:border-gray-700 hover:bg-white/50 dark:hover:bg-gray-800/50"
                                          >
                                            <td className="py-2 px-4">
                                              <div className="flex items-center gap-2">
                                                <Building2 className="w-3.5 h-3.5 text-gray-500" />
                                                <span className="text-sm text-gray-700 dark:text-gray-300">{dist.branch}</span>
                                              </div>
                                            </td>
                                            <td className="py-2 px-4 text-sm text-right font-semibold text-gray-800 dark:text-white">
                                              {numberFormatter.format(dist.quantity)}
                                            </td>
                                            <td className="py-2 px-4 text-center">
                                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                                dist.status === "ส่งแล้ว"
                                                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                                  : dist.status === "ส่งบางส่วน"
                                                  ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                                                  : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                                              }`}>
                                                {dist.status}
                                              </span>
                                            </td>
                                          </tr>
                                        ))}
                                        <tr className="bg-gray-100 dark:bg-gray-800/50 font-semibold">
                                          <td className="py-2 px-4 text-sm text-gray-800 dark:text-white">รวม</td>
                                          <td className="py-2 px-4 text-sm text-right text-gray-800 dark:text-white">
                                            {numberFormatter.format(
                                              item.distributions.reduce((sum, d) => sum + d.quantity, 0)
                                            )}
                                          </td>
                                          <td className="py-2 px-4"></td>
                                        </tr>
                                      </tbody>
                                    </table>
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
