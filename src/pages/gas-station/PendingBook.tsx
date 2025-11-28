import { motion } from "framer-motion";
import { useState } from "react";
import {
  AlertTriangle,
  Eye,
  Search,
  Package,
  ShoppingCart,
} from "lucide-react";

const numberFormatter = new Intl.NumberFormat("th-TH", {
  maximumFractionDigits: 0,
});

// Mock data
const mockPendingBook = [
  {
    orderNo: "SO-20241215-001",
    branch: "ปั๊มไฮโซ",
    legalEntity: "บริษัท A",
    oilType: "Premium Diesel",
    quantityOrdered: 20000,
    quantityReceived: 0,
    quantityPending: 20000,
    orderDate: "2024-12-15",
    expectedDeliveryDate: "2024-12-16",
    daysPending: 1,
    status: "รอรับ",
  },
  {
    orderNo: "SO-20241214-002",
    branch: "สาขา 2",
    legalEntity: "บริษัท B",
    oilType: "Gasohol 95",
    quantityOrdered: 15000,
    quantityReceived: 10000,
    quantityPending: 5000,
    orderDate: "2024-12-14",
    expectedDeliveryDate: "2024-12-15",
    daysPending: 2,
    status: "รับบางส่วน",
  },
];

export default function PendingBook() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredData = mockPendingBook.filter(
    (item) =>
      item.orderNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.branch.toLowerCase().includes(searchTerm.toLowerCase())
  );


  const totalPending = mockPendingBook.reduce((sum, item) => sum + item.quantityPending, 0);
  const orderCount = mockPendingBook.length;
  const overdueCount = mockPendingBook.filter((item) => item.daysPending > 3).length;

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
        <p className="text-gray-600 dark:text-gray-400">รายการน้ำมันที่สั่งแล้วแต่ยังไม่ได้รับ</p>
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
          <p className="text-sm text-gray-600 dark:text-gray-400">รายการน้ำมันที่สั่งแล้วแต่ยังไม่ได้รับครบ</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400">เลขที่ใบสั่งซื้อ</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400">สาขา</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400">นิติบุคคล</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400">ประเภทน้ำมัน</th>
                <th className="text-right py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400">สั่ง (ลิตร)</th>
                <th className="text-right py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400">รับแล้ว (ลิตร)</th>
                <th className="text-right py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400">ตั้งพัก (ลิตร)</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400">วันที่คาดรับ</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400">ค้าง (วัน)</th>
                <th className="text-center py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item, index) => (
                <motion.tr
                  key={item.orderNo}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className={`border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                    item.daysPending > 3 ? "bg-red-50/50 dark:bg-red-900/10" : ""
                  }`}
                >
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <ShoppingCart className="w-4 h-4 text-blue-500" />
                      <span className="text-sm font-semibold text-gray-800 dark:text-white">{item.orderNo}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">{item.branch}</td>
                  <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">{item.legalEntity}</td>
                  <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">{item.oilType}</td>
                  <td className="py-4 px-6 text-sm text-right font-semibold text-gray-800 dark:text-white">{numberFormatter.format(item.quantityOrdered)}</td>
                  <td className="py-4 px-6 text-sm text-right text-emerald-600 dark:text-emerald-400">
                    {numberFormatter.format(item.quantityReceived)}
                  </td>
                  <td className="py-4 px-6 text-sm text-right font-semibold text-orange-600 dark:text-orange-400">
                    {numberFormatter.format(item.quantityPending)}
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">{item.expectedDeliveryDate}</td>
                  <td className="py-4 px-6 text-sm">
                    <div className="flex items-center gap-1">
                      <span className={`font-semibold ${item.daysPending > 3 ? "text-red-600 dark:text-red-400" : "text-gray-600 dark:text-gray-400"}`}>
                        {item.daysPending} วัน
                      </span>
                      {item.daysPending > 3 && <AlertTriangle className="w-4 h-4 text-red-500" />}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-center gap-2">
                      <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors" title="ดูรายละเอียด">
                        <Eye className="w-4 h-4 text-gray-400 hover:text-blue-500" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
