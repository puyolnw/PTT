import { motion } from "framer-motion";
import {
  Fuel,
  TrendingUp,
  ShoppingCart,
  Package,
  DollarSign,
  AlertTriangle,
  Droplet,
  BarChart3,
  Clock,
  CheckCircle,
  XCircle,
  Activity,
  History,
} from "lucide-react";

const currencyFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat("th-TH", {
  maximumFractionDigits: 0,
});

// Mock data สำหรับระบบปั๊มน้ำมัน
const mockGasStationData = {
  today: {
    sales: {
      total: 1250000,
      liters: 45000,
      transactions: 1250,
    },
    purchases: {
      total: 980000,
      liters: 35000,
      orders: 3,
    },
    stock: {
      totalLiters: 280000,
      lowStockAlerts: 2,
    },
    gainLoss: {
      today: 45,
      percentage: 0.1,
      status: "normal" as "normal" | "warning" | "critical",
    },
  },
  branches: [
    { id: 1, name: "ปั๊มไฮโซ", sales: 350000, stock: 85000, status: "normal" },
    { id: 2, name: "ดินดำ", sales: 280000, stock: 65000, status: "normal" },
    { id: 3, name: "หนองจิก", sales: 220000, stock: 50000, status: "warning" },
    { id: 4, name: "ตักสิลา", sales: 250000, stock: 55000, status: "normal" },
    { id: 5, name: "บายพาส", sales: 150000, stock: 25000, status: "critical" },
  ],
  pendingOrders: 2,
  pendingReceiving: 1,
  pendingPayments: 3,
  undergroundBookStatus: {
    completed: 4,
    pending: 1,
    overdue: 0,
  },
};

export default function GasStationDashboard() {
  const overviewStats = [
    {
      title: "ยอดขายวันนี้",
      value: currencyFormatter.format(mockGasStationData.today.sales.total),
      subtitle: `${numberFormatter.format(mockGasStationData.today.sales.liters)} ลิตร`,
      icon: Fuel,
      gradient: "from-emerald-500 to-teal-500",
      change: "+5.2%",
    },
    {
      title: "ยอดซื้อวันนี้",
      value: currencyFormatter.format(mockGasStationData.today.purchases.total),
      subtitle: `${numberFormatter.format(mockGasStationData.today.purchases.liters)} ลิตร`,
      icon: ShoppingCart,
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      title: "สต็อกรวม",
      value: numberFormatter.format(mockGasStationData.today.stock.totalLiters),
      subtitle: "ลิตร",
      icon: Droplet,
      gradient: "from-purple-500 to-pink-500",
      alert: mockGasStationData.today.stock.lowStockAlerts > 0,
    },
    {
      title: "Gain/Loss วันนี้",
      value: `${mockGasStationData.today.gainLoss.today > 0 ? '+' : ''}${mockGasStationData.today.gainLoss.today}`,
      subtitle: `${mockGasStationData.today.gainLoss.percentage}%`,
      icon: TrendingUp,
      gradient: mockGasStationData.today.gainLoss.today >= 0 ? "from-green-500 to-emerald-500" : "from-red-500 to-orange-500",
    },
  ];

  const quickActions = [
    { label: "ใบสั่งซื้อรออนุมัติ", count: mockGasStationData.pendingOrders, icon: ShoppingCart, color: "orange" },
    { label: "รอรับน้ำมัน", count: mockGasStationData.pendingReceiving, icon: Package, color: "blue" },
    { label: "รอชำระเงิน", count: mockGasStationData.pendingPayments, icon: DollarSign, color: "green" },
    { label: "สมุดใต้ดินยังไม่ครบ", count: mockGasStationData.undergroundBookStatus.pending, icon: Droplet, color: "red" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      {/* Header */}
      <header className="mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
            <div className="p-2 bg-emerald-500 rounded-2xl shadow-lg shadow-emerald-500/20">
              <Fuel className="w-8 h-8 text-white" />
            </div>
            แดชบอร์ดระบบปั๊มน้ำมัน
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium flex items-center gap-2">
            <History className="w-4 h-4" />
            ภาพรวมการดำเนินงานปั๊มน้ำมันทั้ง 5 สาขา
          </p>
        </div>
      </header>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {overviewStats.map((stat, index) => {
          const iconBgColors = [
            "bg-blue-50 dark:bg-blue-900/20",
            "bg-purple-50 dark:bg-purple-900/20",
            "bg-emerald-50 dark:bg-emerald-900/20",
            "bg-amber-50 dark:bg-amber-900/20",
          ];
          const iconTextColors = [
            "text-blue-500",
            "text-purple-500",
            "text-emerald-500",
            "text-amber-500",
          ];
          const iconBg = iconBgColors[index % iconBgColors.length];
          const iconText = iconTextColors[index % iconTextColors.length];
          
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 ${iconBg} rounded-2xl`}>
                  <stat.icon className={`w-6 h-6 ${iconText}`} />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{stat.title}</p>
                  <p className="text-2xl font-black text-gray-900 dark:text-white">{stat.value}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{stat.subtitle}</p>
                </div>
              </div>
              {(stat.change || stat.alert) && (
                <div className="mt-3 flex items-center justify-end">
                  {stat.change && (
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-full">
                      {stat.change}
                    </span>
                  )}
                  {stat.alert && (
                    <AlertTriangle className="w-4 h-4 text-orange-500 ml-2" />
                  )}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 mb-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-black text-gray-900 dark:text-white">งานที่ต้องดำเนินการ</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => {
            const colorClasses = {
              orange: {
                bg: "bg-orange-50 dark:bg-orange-900/20",
                border: "border-orange-200 dark:border-orange-800",
                icon: "text-orange-600 dark:text-orange-400",
                badge: "bg-orange-500 text-white",
                hover: "hover:bg-orange-100 dark:hover:bg-orange-900/30",
              },
              blue: {
                bg: "bg-blue-50 dark:bg-blue-900/20",
                border: "border-blue-200 dark:border-blue-800",
                icon: "text-blue-600 dark:text-blue-400",
                badge: "bg-blue-500 text-white",
                hover: "hover:bg-blue-100 dark:hover:bg-blue-900/30",
              },
              green: {
                bg: "bg-green-50 dark:bg-green-900/20",
                border: "border-green-200 dark:border-green-800",
                icon: "text-green-600 dark:text-green-400",
                badge: "bg-green-500 text-white",
                hover: "hover:bg-green-100 dark:hover:bg-green-900/30",
              },
              red: {
                bg: "bg-red-50 dark:bg-red-900/20",
                border: "border-red-200 dark:border-red-800",
                icon: "text-red-600 dark:text-red-400",
                badge: "bg-red-500 text-white",
                hover: "hover:bg-red-100 dark:hover:bg-red-900/30",
              },
            };
            const colors = colorClasses[action.color as keyof typeof colorClasses];
            
            return (
              <motion.div
                key={action.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                className={`p-5 rounded-xl border-2 ${colors.border} ${colors.bg} ${colors.hover} transition-all cursor-pointer`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-3 ${colors.bg} rounded-lg`}>
                    <action.icon className={`w-6 h-6 ${colors.icon}`} />
                  </div>
                  {action.count > 0 && (
                    <span className={`text-xs font-bold ${colors.badge} px-3 py-1 rounded-full shadow-sm`}>
                      {action.count}
                    </span>
                  )}
                </div>
                <p className="text-sm font-semibold text-gray-800 dark:text-white">{action.label}</p>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Branch Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 mb-6 overflow-hidden"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-black text-gray-900 dark:text-white">สถานะสาขา</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-gray-900/50 text-[10px] uppercase tracking-widest font-black text-gray-400">
                <th className="px-6 py-4">สาขา</th>
                <th className="px-6 py-4 text-right">ยอดขายวันนี้</th>
                <th className="px-6 py-4 text-right">สต็อก (ลิตร)</th>
                <th className="px-6 py-4 text-center">สถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700 text-sm">
              {mockGasStationData.branches.map((branch) => (
                <tr key={branch.id} className="group hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors font-medium">
                  <td className="px-6 py-4">
                    <span className="font-bold text-gray-700 dark:text-gray-300">{branch.name}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-bold text-gray-700 dark:text-gray-300">{currencyFormatter.format(branch.sales)}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-bold text-gray-700 dark:text-gray-300">{numberFormatter.format(branch.stock)}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {branch.status === "normal" && (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1.5 rounded-full">
                        <CheckCircle className="w-3.5 h-3.5" />
                        ปกติ
                      </span>
                    )}
                    {branch.status === "warning" && (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30 px-3 py-1.5 rounded-full">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        เตือน
                      </span>
                    )}
                    {branch.status === "critical" && (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 px-3 py-1.5 rounded-full">
                        <XCircle className="w-3.5 h-3.5" />
                        วิกฤต
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Sales Chart Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black text-gray-900 dark:text-white">ยอดขายรายวัน</h2>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>
          <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-900/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <Activity className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">กราฟยอดขายรายวัน</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">จะแสดงข้อมูลเมื่อเชื่อมต่อ Chart Library</p>
            </div>
          </div>
        </motion.div>

        {/* Stock Distribution Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.9 }}
          className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black text-gray-900 dark:text-white">การกระจายสต็อก</h2>
            <Droplet className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {mockGasStationData.branches.slice(0, 3).map((branch, index) => {
              const colors = [
                { bg: "bg-blue-500", text: "text-blue-600 dark:text-blue-400" },
                { bg: "bg-green-500", text: "text-green-600 dark:text-green-400" },
                { bg: "bg-purple-500", text: "text-purple-600 dark:text-purple-400" },
              ];
              const color = colors[index % colors.length];
              const maxStock = Math.max(...mockGasStationData.branches.map(b => b.stock));
              const percentage = (branch.stock / maxStock) * 100;
              
              return (
                <div key={branch.id}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${color.bg}`}></div>
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{branch.name}</span>
                    </div>
                    <span className={`text-sm font-bold ${color.text}`}>{numberFormatter.format(branch.stock)} ลิตร</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={`${color.bg} h-2 rounded-full transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Underground Book Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1.0 }}
        className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-black text-gray-900 dark:text-white">สถานะสมุดใต้ดิน</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-4 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-200 dark:border-emerald-800">
            <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-md">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">กรอกแล้ว</p>
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{mockGasStationData.undergroundBookStatus.completed} สาขา</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-2xl border border-orange-200 dark:border-orange-800">
            <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center shadow-md">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">รอกรอก</p>
              <p className="text-2xl font-black text-orange-600 dark:text-orange-400">{mockGasStationData.undergroundBookStatus.pending} สาขา</p>
            </div>
          </div>
          {mockGasStationData.undergroundBookStatus.overdue > 0 && (
            <div className="flex items-center gap-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-200 dark:border-red-800">
              <div className="w-12 h-12 bg-red-500 rounded-2xl flex items-center justify-center shadow-md">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">เกินเวลา</p>
                <p className="text-2xl font-black text-red-600 dark:text-red-400">{mockGasStationData.undergroundBookStatus.overdue} สาขา</p>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

