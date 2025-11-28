import { motion } from "framer-motion";
import { useState } from "react";
import {
  Fuel,
  Search,
  DollarSign,
  Droplet,
  BarChart3,
  Calendar,
  CreditCard,
  QrCode,
  Wallet,
} from "lucide-react";

const currencyFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat("th-TH", {
  maximumFractionDigits: 0,
});

// Mock data
const mockSales = [
  {
    id: "SALE-20241215-001",
    branch: "ปั๊มไฮโซ",
    date: "2024-12-15",
    time: "08:30",
    oilType: "Premium Diesel",
    quantity: 45.5,
    amount: 1250,
    paymentMethod: "เงินสด",
    nozzle: "Nozzle 1",
  },
  {
    id: "SALE-20241215-002",
    branch: "ปั๊มไฮโซ",
    date: "2024-12-15",
    time: "08:45",
    oilType: "Gasohol 95",
    quantity: 30.0,
    amount: 900,
    paymentMethod: "QR PromptPay",
    nozzle: "Nozzle 2",
  },
  {
    id: "SALE-20241215-003",
    branch: "สาขา 2",
    date: "2024-12-15",
    time: "09:15",
    oilType: "Diesel",
    quantity: 50.0,
    amount: 1400,
    paymentMethod: "บัตรเครดิต",
    nozzle: "Nozzle 3",
  },
];

const mockSalesSummary = {
  today: {
    totalAmount: 1250000,
    totalLiters: 45000,
    transactions: 1250,
    byPaymentMethod: {
      cash: 600000,
      card: 400000,
      qr: 200000,
      fleet: 50000,
    },
    byOilType: {
      "Premium Diesel": 500000,
      "Gasohol 95": 400000,
      "Diesel": 250000,
      "E20": 100000,
    },
  },
};

export default function Sales() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("ทั้งหมด");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const filteredSales = mockSales.filter((sale) => {
    const matchesSearch = 
      sale.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.branch.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.oilType.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesBranch = selectedBranch === "ทั้งหมด" || sale.branch === selectedBranch;
    
    return matchesSearch && matchesBranch;
  });

  const avgPerTransaction = mockSalesSummary.today.totalAmount / mockSalesSummary.today.transactions;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">การขายน้ำมัน</h1>
        <p className="text-gray-600 dark:text-gray-400">รายการขายน้ำมันจากหัวจ่ายทั้ง 5 สาขา</p>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[
          {
            title: "ยอดขายวันนี้",
            value: currencyFormatter.format(mockSalesSummary.today.totalAmount),
            subtitle: "บาท",
            icon: DollarSign,
            iconColor: "bg-gradient-to-br from-emerald-500 to-emerald-600",
            change: "+5.2%",
          },
          {
            title: "จำนวนลิตร",
            value: numberFormatter.format(mockSalesSummary.today.totalLiters),
            subtitle: "ลิตร",
            icon: Droplet,
            iconColor: "bg-gradient-to-br from-blue-500 to-blue-600",
          },
          {
            title: "จำนวนรายการ",
            value: numberFormatter.format(mockSalesSummary.today.transactions),
            subtitle: "รายการ",
            icon: Fuel,
            iconColor: "bg-gradient-to-br from-purple-500 to-purple-600",
          },
          {
            title: "เฉลี่ยต่อรายการ",
            value: currencyFormatter.format(avgPerTransaction),
            subtitle: "บาท",
            icon: BarChart3,
            iconColor: "bg-gradient-to-br from-orange-500 to-orange-600",
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
              {stat.change && (
                <div className="mt-3 flex items-center justify-end">
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-full">
                    {stat.change}
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
            placeholder="ค้นหาเลขที่รายการ, สาขา, ประเภทน้ำมัน..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 text-gray-800 dark:text-white transition-all duration-200"
          />
        </div>
        <select
          value={selectedBranch}
          onChange={(e) => setSelectedBranch(e.target.value)}
          className="px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 text-gray-800 dark:text-white transition-all duration-200"
        >
          <option>ทั้งหมด</option>
          <option>ปั๊มไฮโซ</option>
          <option>สาขา 2</option>
          <option>สาขา 3</option>
          <option>สาขา 4</option>
          <option>สาขา 5</option>
        </select>
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-gray-400" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 text-gray-800 dark:text-white transition-all duration-200"
          />
        </div>
      </motion.div>

      {/* Sales Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden mb-6"
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-1">
            รายการขายน้ำมัน
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">รายการขายน้ำมันจากหัวจ่าย</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400">เลขที่รายการ</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400">สาขา</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400">วันที่/เวลา</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400">ประเภทน้ำมัน</th>
                <th className="text-right py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400">จำนวน (ลิตร)</th>
                <th className="text-right py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400">ยอดเงิน</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400">วิธีชำระ</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400">หัวจ่าย</th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.map((sale, index) => (
                <motion.tr
                  key={sale.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <td className="py-4 px-6">
                    <span className="text-sm font-semibold text-gray-800 dark:text-white">{sale.id}</span>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">{sale.branch}</td>
                  <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">
                    {sale.date} {sale.time}
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">{sale.oilType}</td>
                  <td className="py-4 px-6 text-sm text-right font-semibold text-gray-800 dark:text-white">{sale.quantity.toFixed(2)}</td>
                  <td className="py-4 px-6 text-sm text-right font-semibold text-gray-800 dark:text-white">{currencyFormatter.format(sale.amount)}</td>
                  <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">{sale.paymentMethod}</td>
                  <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">{sale.nozzle}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Payment Method Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6"
      >
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">ยอดขายแยกตามวิธีชำระเงิน</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="w-5 h-5 text-emerald-500" />
              <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">เงินสด</p>
            </div>
            <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
              {currencyFormatter.format(mockSalesSummary.today.byPaymentMethod.cash)}
            </p>
          </div>
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="w-5 h-5 text-blue-500" />
              <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">บัตรเครดิต</p>
            </div>
            <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
              {currencyFormatter.format(mockSalesSummary.today.byPaymentMethod.card)}
            </p>
          </div>
          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
            <div className="flex items-center gap-2 mb-2">
              <QrCode className="w-5 h-5 text-purple-500" />
              <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">QR PromptPay</p>
            </div>
            <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
              {currencyFormatter.format(mockSalesSummary.today.byPaymentMethod.qr)}
            </p>
          </div>
          <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-200 dark:border-orange-800">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="w-5 h-5 text-orange-500" />
              <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">Fleet Card</p>
            </div>
            <p className="text-xl font-bold text-orange-600 dark:text-orange-400">
              {currencyFormatter.format(mockSalesSummary.today.byPaymentMethod.fleet)}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
