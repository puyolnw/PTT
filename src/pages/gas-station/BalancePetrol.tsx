import { motion } from "framer-motion";
import { useState } from "react";
import {
  AlertTriangle,
  Eye,
  Droplet,
  CheckCircle,
} from "lucide-react";

const numberFormatter = new Intl.NumberFormat("th-TH", {
  maximumFractionDigits: 0,
});

// Mock data
const mockBalancePetrol = [
  {
    branch: "ปั๊มไฮโซ",
    oilType: "Premium Diesel",
    balance: 90000,
    measuredStock: 90000,
    difference: 0,
    differencePercent: 0,
    status: "ปกติ",
  },
  {
    branch: "สาขา 2",
    oilType: "Gasohol 95",
    balance: 68000,
    measuredStock: 68000,
    difference: 0,
    differencePercent: 0,
    status: "ปกติ",
  },
  {
    branch: "สาขา 3",
    oilType: "Diesel",
    balance: 53000,
    measuredStock: 52000,
    difference: -1000,
    differencePercent: -1.89,
    status: "ผิดปกติ",
  },
];

export default function BalancePetrol() {
  const [selectedBranch, setSelectedBranch] = useState("ทั้งหมด");

  const filteredData = mockBalancePetrol.filter(
    (item) => selectedBranch === "ทั้งหมด" || item.branch === selectedBranch
  );

  const getStatusColor = (status: string, diffPercent: number) => {
    if (status === "ปกติ" || Math.abs(diffPercent) <= 0.3) {
      return "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800";
    }
    if (Math.abs(diffPercent) <= 1.0) {
      return "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30 border-orange-200 dark:border-orange-800";
    }
    return "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800";
  };

  const getDifferenceColor = (_diff: number, percent: number) => {
    if (Math.abs(percent) <= 0.3) return "text-emerald-600 dark:text-emerald-400";
    if (Math.abs(percent) <= 1.0) return "text-orange-600 dark:text-orange-400";
    return "text-red-600 dark:text-red-400";
  };

  const totalBalance = mockBalancePetrol.reduce((sum, item) => sum + item.balance, 0);
  const normalCount = mockBalancePetrol.filter((item) => item.status === "ปกติ").length;
  const abnormalCount = mockBalancePetrol.filter((item) => item.status === "ผิดปกติ").length;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">สมุด Balance Petrol</h1>
        <p className="text-gray-600 dark:text-gray-400">เปรียบเทียบ Balance Petrol กับยอดวัดใต้ดิน</p>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[
          {
            title: "Balance Petrol รวม",
            value: numberFormatter.format(totalBalance),
            subtitle: "ลิตร",
            icon: Droplet,
            iconColor: "bg-gradient-to-br from-blue-500 to-blue-600",
          },
          {
            title: "สถานะปกติ",
            value: normalCount,
            subtitle: "รายการ",
            icon: CheckCircle,
            iconColor: "bg-gradient-to-br from-emerald-500 to-emerald-600",
            badge: "ปกติ",
            badgeColor: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800",
          },
          {
            title: "ผิดปกติ",
            value: abnormalCount,
            subtitle: "รายการ",
            icon: AlertTriangle,
            iconColor: "bg-gradient-to-br from-red-500 to-red-600",
            badge: "ผิดปกติ",
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

      {/* Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5 mb-6"
      >
        <select
          value={selectedBranch}
          onChange={(e) => setSelectedBranch(e.target.value)}
          className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 text-gray-800 dark:text-white transition-all duration-200"
        >
          <option>ทั้งหมด</option>
          <option>ปั๊มไฮโซ</option>
          <option>สาขา 2</option>
          <option>สาขา 3</option>
          <option>สาขา 4</option>
          <option>สาขา 5</option>
        </select>
      </motion.div>

      {/* Balance Petrol Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden"
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-1">
            รายการ Balance Petrol
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">เปรียบเทียบ Balance Petrol กับยอดวัดใต้ดิน</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400">สาขา</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400">ประเภทน้ำมัน</th>
                <th className="text-right py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400">Balance Petrol</th>
                <th className="text-right py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400">ยอดวัดใต้ดิน</th>
                <th className="text-right py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400">ส่วนต่าง</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400">สถานะ</th>
                <th className="text-center py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item, index) => (
                <motion.tr
                  key={`${item.branch}-${item.oilType}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <td className="py-4 px-6">
                    <span className="text-sm font-semibold text-gray-800 dark:text-white">{item.branch}</span>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">{item.oilType}</td>
                  <td className="py-4 px-6 text-sm text-right font-semibold text-gray-800 dark:text-white">
                    {numberFormatter.format(item.balance)}
                  </td>
                  <td className="py-4 px-6 text-sm text-right text-gray-600 dark:text-gray-400">
                    {numberFormatter.format(item.measuredStock)}
                  </td>
                  <td className="py-4 px-6 text-sm text-right">
                    <span className={`font-semibold ${getDifferenceColor(item.difference, item.differencePercent)}`}>
                      {item.difference > 0 ? '+' : ''}{numberFormatter.format(item.difference)}
                      <span className="text-xs ml-1">
                        ({item.differencePercent > 0 ? '+' : ''}{item.differencePercent.toFixed(2)}%)
                      </span>
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border ${getStatusColor(item.status, item.differencePercent)}`}>
                      {item.status === "ปกติ" && <CheckCircle className="w-3.5 h-3.5" />}
                      {item.status === "ผิดปกติ" && <AlertTriangle className="w-3.5 h-3.5" />}
                      {item.status}
                    </span>
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
