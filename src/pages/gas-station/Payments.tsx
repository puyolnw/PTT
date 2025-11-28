import { motion } from "framer-motion";
import { useState } from "react";
import {
  Search,
  Filter,
  CheckCircle,
  Clock,
  AlertTriangle,
  Eye,
  FileText,
  Download,
  DollarSign,
} from "lucide-react";

const currencyFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 0,
});

// Mock data
const mockPayments = [
  {
    id: "PAY-20241215-001",
    invoiceNo: "INV-20241215-001",
    deliveryNoteNo: "DN-20241215-001",
    legalEntity: "บริษัท A",
    dueDate: "2024-12-22",
    totalAmount: 1450000,
    discount: 14500,
    netAmount: 1435500,
    paymentMethod: "โอนผ่านธนาคาร",
    paymentDate: "2024-12-15",
    status: "ชำระแล้ว",
  },
  {
    id: "PAY-20241215-002",
    invoiceNo: "INV-20241215-002",
    deliveryNoteNo: "DN-20241215-002",
    legalEntity: "บริษัท B",
    dueDate: "2024-12-20",
    totalAmount: 1200000,
    discount: 12000,
    netAmount: 1188000,
    paymentMethod: null,
    paymentDate: null,
    status: "รอชำระ",
  },
  {
    id: "PAY-20241214-003",
    invoiceNo: "INV-20241214-003",
    deliveryNoteNo: "DN-20241214-003",
    legalEntity: "บริษัท C",
    dueDate: "2024-12-21",
    totalAmount: 980000,
    discount: 9800,
    netAmount: 970200,
    paymentMethod: "QR PromptPay",
    paymentDate: "2024-12-14",
    status: "ชำระแล้ว",
  },
];

export default function Payments() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ทั้งหมด");

  const filteredPayments = mockPayments.filter((payment) => {
    const matchesSearch = 
      payment.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.legalEntity.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === "ทั้งหมด" || payment.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ชำระแล้ว":
        return "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800";
      case "รอชำระ":
        return "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30 border-orange-200 dark:border-orange-800";
      case "เกินกำหนด":
        return "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800";
      default:
        return "text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700";
    }
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  const totalAmount = mockPayments.reduce((sum, p) => sum + p.netAmount, 0);
  const paidAmount = mockPayments.filter((p) => p.status === "ชำระแล้ว").reduce((sum, p) => sum + p.netAmount, 0);
  const pendingAmount = mockPayments.filter((p) => p.status === "รอชำระ").reduce((sum, p) => sum + p.netAmount, 0);
  const overdueCount = mockPayments.filter((p) => isOverdue(p.dueDate) && p.status === "รอชำระ").length;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">การชำระเงินซื้อน้ำมัน</h1>
            <p className="text-gray-600 dark:text-gray-400">จัดการการชำระเงินใบกำกับภาษี ปตท.</p>
          </div>
          <button className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl transition-all duration-200 font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export BAHTNET
          </button>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[
          {
            title: "ยอดรวมที่ต้องจ่าย",
            value: currencyFormatter.format(totalAmount),
            subtitle: "บาท",
            icon: DollarSign,
            iconColor: "bg-gradient-to-br from-blue-500 to-blue-600",
          },
          {
            title: "ชำระแล้ว",
            value: currencyFormatter.format(paidAmount),
            subtitle: "บาท",
            icon: CheckCircle,
            iconColor: "bg-gradient-to-br from-emerald-500 to-emerald-600",
            badge: "ชำระแล้ว",
            badgeColor: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800",
          },
          {
            title: "รอชำระ",
            value: currencyFormatter.format(pendingAmount),
            subtitle: "บาท",
            icon: Clock,
            iconColor: "bg-gradient-to-br from-orange-500 to-orange-600",
            badge: "รอชำระ",
            badgeColor: "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30 border-orange-200 dark:border-orange-800",
          },
          {
            title: "เกินกำหนด",
            value: overdueCount,
            subtitle: "รายการ",
            icon: AlertTriangle,
            iconColor: "bg-gradient-to-br from-red-500 to-red-600",
            badge: "เกินกำหนด",
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

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5 flex flex-col md:flex-row gap-4 mb-6"
      >
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="ค้นหาเลขที่ใบกำกับ, เลขที่ใบส่งของ, นิติบุคคล..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 text-gray-800 dark:text-white transition-all duration-200"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 text-gray-800 dark:text-white transition-all duration-200"
          >
            <option>ทั้งหมด</option>
            <option>ชำระแล้ว</option>
            <option>รอชำระ</option>
            <option>เกินกำหนด</option>
          </select>
        </div>
      </motion.div>

      {/* Payments Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden"
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-1">
            รายการชำระเงิน
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">รายการชำระเงินใบกำกับภาษี ปตท.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400">เลขที่ใบกำกับ</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400">เลขที่ใบส่งของ</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400">นิติบุคคล</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400">ครบกำหนดชำระ</th>
                <th className="text-right py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400">ยอดเงินเต็ม</th>
                <th className="text-right py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400">ส่วนลด</th>
                <th className="text-right py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400">ยอดสุทธิ</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400">วิธีชำระ</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400">สถานะ</th>
                <th className="text-center py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map((payment, index) => (
                <motion.tr
                  key={payment.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className={`border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                    isOverdue(payment.dueDate) && payment.status === "รอชำระ" ? "bg-red-50/50 dark:bg-red-900/10" : ""
                  }`}
                >
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-500" />
                      <span className="text-sm font-semibold text-gray-800 dark:text-white">{payment.invoiceNo}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">{payment.deliveryNoteNo}</td>
                  <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">{payment.legalEntity}</td>
                  <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      {payment.dueDate}
                      {isOverdue(payment.dueDate) && payment.status === "รอชำระ" && (
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-sm text-right text-gray-600 dark:text-gray-400">{currencyFormatter.format(payment.totalAmount)}</td>
                  <td className="py-4 px-6 text-sm text-right text-gray-600 dark:text-gray-400">{currencyFormatter.format(payment.discount)}</td>
                  <td className="py-4 px-6 text-sm text-right font-semibold text-gray-800 dark:text-white">{currencyFormatter.format(payment.netAmount)}</td>
                  <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">{payment.paymentMethod || "-"}</td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border ${getStatusColor(payment.status)}`}>
                      {payment.status === "ชำระแล้ว" && <CheckCircle className="w-3.5 h-3.5" />}
                      {payment.status === "รอชำระ" && <Clock className="w-3.5 h-3.5" />}
                      {payment.status === "เกินกำหนด" && <AlertTriangle className="w-3.5 h-3.5" />}
                      {payment.status}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-center gap-2">
                      <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors" title="ดูรายละเอียด">
                        <Eye className="w-4 h-4 text-gray-400 hover:text-blue-500" />
                      </button>
                      <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors" title="ดูเอกสาร">
                        <FileText className="w-4 h-4 text-gray-400 hover:text-purple-500" />
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
