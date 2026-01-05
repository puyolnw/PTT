import { motion } from "framer-motion";
import {
  DollarSign,
  AlertTriangle,
  BarChart3,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
  Building,
  CreditCard,
  Bell,
  TrendingUp,
  Clock,
  FileCheck,
  Camera,
  BarChart2,
  Receipt,
} from "lucide-react";
import { Link } from "react-router-dom";

const currencyFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 0,
});

// Mock data สำหรับ M2 - จัดการพื้นที่เช่า
const mockRentalData = {
  thisMonth: {
    income: 150000, // รายได้ค่าเช่า (5 ปั๊ม)
    expenses: 50000, // ค่าเช่าภายนอก
    netProfit: 100000, // กำไรสุทธิ
    overdue: 20000, // หนี้ค้าง
  },
  lastMonth: {
    income: 140000,
    expenses: 48000,
    netProfit: 92000,
  },
  byShop: {
    "FIT Auto": { amount: 35000, type: "คงที่", rate: "7,000 บาท/เดือน", branches: 5 },
    "Chester's": { amount: 25000, type: "% จากยอดขาย", rate: "5%", branches: 3 },
    "Daiso": { amount: 20000, type: "คงที่", rate: "4,000 บาท/เดือน", branches: 5 },
    "Quick": { amount: 30000, type: "คงที่", rate: "6,000 บาท/เดือน", branches: 5 },
    "ร้าน EV": { amount: 17500, type: "คงที่", rate: "3,500 บาท/เดือน", branches: 5 },
    "อื่นๆ": { amount: 22500, type: "คงที่", rate: "4,500 บาท/เดือน", branches: 5 },
  },
  overdueShops: [
    { name: "Daiso", amount: 20000, days: 30, branch: "สาขา A" },
  ],
  recentPayments: [
    { id: "1", shop: "FIT Auto", amount: 7000, date: "2024-12-15", method: "โอน", branch: "สำนักงานใหญ่" },
    { id: "2", shop: "Chester's", amount: 25000, date: "2024-12-14", method: "หักจากยอดขาย", branch: "สาขา A" },
    { id: "3", shop: "Quick", amount: 6000, date: "2024-12-13", method: "เงินสด", branch: "สาขา B" },
  ],
};

export default function RentalDashboard() {
  const monthlyChange = ((mockRentalData.thisMonth.income - mockRentalData.lastMonth.income) / mockRentalData.lastMonth.income) * 100;

  const overviewStats = [
    {
      title: "รายได้ค่าเช่าเดือนนี้",
      value: currencyFormatter.format(mockRentalData.thisMonth.income),
      subtitle: `เดือนที่แล้ว ${currencyFormatter.format(mockRentalData.lastMonth.income)}`,
      icon: DollarSign,
      gradient: "from-emerald-500 to-teal-500",
      change: monthlyChange > 0 ? `+${monthlyChange.toFixed(1)}%` : `${monthlyChange.toFixed(1)}%`,
    },
    {
      title: "ค่าเช่าภายนอก",
      value: currencyFormatter.format(mockRentalData.thisMonth.expenses),
      subtitle: `ค่าใช้จ่ายที่ปั๊มจ่ายออก`,
      icon: Building,
      gradient: "from-red-500 to-orange-500",
    },
    {
      title: "กำไรสุทธิ",
      value: currencyFormatter.format(mockRentalData.thisMonth.netProfit),
      subtitle: `รายได้ - ค่าใช้จ่าย`,
      icon: BarChart3,
      gradient: "from-purple-500 to-pink-500",
    },
    {
      title: "หนี้ค้างชำระ",
      value: currencyFormatter.format(mockRentalData.thisMonth.overdue),
      subtitle: `${mockRentalData.overdueShops.length} ร้าน`,
      icon: AlertTriangle,
      gradient: "from-orange-500 to-red-500",
    },
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h2 className="text-3xl font-bold text-app mb-2 font-display">M2: จัดการพื้นที่เช่า</h2>
        <p className="text-muted font-light">
          ภาพรวมค่าเช่าที่เก็บจากร้านค้าในปั๊ม (FIT Auto, Chester&apos;s, Daiso, Quick, ร้าน EV, ฯลฯ) และค่าเช่าที่ปั๊มจ่ายออก (ป้ายโฆษณา, ที่ดิน) สำหรับ 5 ปั๊ม
        </p>
        <p className="text-xs text-muted/70">
          อัปเดตล่าสุด: {new Date().toLocaleDateString("th-TH", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
          })}
        </p>
      </motion.div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {overviewStats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="panel rounded-2xl p-6 hover:border-ptt-blue/30 transition-all duration-200 shadow-app"
          >
            <div className="flex items-center justify-between mb-5">
              <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient}`}>
                <stat.icon className="w-6 h-6 text-app" />
              </div>
              {stat.change && (
                <div className={`flex items-center gap-1 text-sm font-medium ${stat.change.startsWith('+') ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                  {stat.change.startsWith('+') ? (
                    <ArrowUpRight className="w-4 h-4" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4" />
                  )}
                  {stat.change}
                </div>
              )}
            </div>
            <h3 className="text-muted text-sm mb-2">{stat.title}</h3>
            <p className="text-2xl font-bold text-app mb-1">{stat.value}</p>
            <p className="text-sm text-muted">{stat.subtitle}</p>
          </motion.div>
        ))}
      </div>

      {/* รายได้ค่าเช่าแยกตามร้าน */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="panel rounded-2xl p-6 shadow-app"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-app">รายได้ค่าเช่าแยกตามร้าน (5 ปั๊ม)</h3>
            <p className="text-sm text-muted">รวมค่าเช่าทั้ง 5 ปั๊ม: {currencyFormatter.format(mockRentalData.thisMonth.income)}</p>
          </div>
          <BarChart3 className="w-6 h-6 text-muted" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(mockRentalData.byShop).map(([shop, data]) => (
            <div key={shop} className="bg-ptt-blue/10 border border-ptt-blue/30 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold text-app">{shop}</p>
                <span className="text-xs px-2 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/30">
                  {data.type}
                </span>
              </div>
              <p className="text-2xl font-bold text-ptt-cyan">
                {currencyFormatter.format(data.amount)}
              </p>
              <p className="text-xs text-muted mt-1">
                {data.rate} • {data.branches} สาขา
              </p>
            </div>
          ))}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* หนี้ค้างชำระ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="panel rounded-2xl p-6 shadow-app"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-semibold text-app">หนี้ค้างชำระ</h3>
              <p className="text-sm text-muted">แจ้งเตือน 7/15/30 วัน</p>
            </div>
            <AlertTriangle className="w-6 h-6 text-orange-400" />
          </div>
          <div className="space-y-3">
            {mockRentalData.overdueShops.map((shop) => (
              <div
                key={shop.name}
                className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-xl"
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-semibold text-app">{shop.name}</p>
                    <p className="text-sm text-muted">{shop.branch}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-orange-400">
                      {currencyFormatter.format(shop.amount)}
                    </p>
                    <p className="text-xs text-muted">ค้าง {shop.days} วัน</p>
                  </div>
                </div>
              </div>
            ))}
            {mockRentalData.overdueShops.length === 0 && (
              <div className="text-center py-8 text-muted">
                ไม่มีหนี้ค้างชำระ
              </div>
            )}
          </div>
        </motion.div>

        {/* การชำระเงินล่าสุด */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="panel rounded-2xl p-6 shadow-app"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-semibold text-app">การชำระเงินล่าสุด</h3>
              <p className="text-sm text-muted">เงินสด / โอน / หักจากยอดขาย</p>
            </div>
            <CreditCard className="w-6 h-6 text-muted" />
          </div>
          <div className="space-y-3">
            {mockRentalData.recentPayments.map((payment) => (
              <div
                key={payment.id}
                className="p-4 bg-soft rounded-xl border border-app"
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-semibold text-app">{payment.shop}</p>
                    <p className="text-sm text-muted">{payment.branch}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-app">
                      {currencyFormatter.format(payment.amount)}
                    </p>
                    <span className="text-xs px-2 py-1 rounded-full bg-ptt-blue/10 text-ptt-cyan border border-ptt-blue/30 mt-1 inline-block">
                      {payment.method}
                    </span>
                  </div>
                </div>
                <div className="text-sm text-muted">
                  {new Date(payment.date).toLocaleDateString("th-TH", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* สรุปการเงิน */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="panel rounded-2xl p-6 shadow-app"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-app">สรุปการเงิน - เดือนตุลาคม 2568</h3>
          <FileText className="w-6 h-6 text-muted" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
            <p className="text-sm text-muted mb-1">รายได้ค่าเช่า (5 ปั๊ม)</p>
            <p className="text-2xl font-bold text-emerald-400">
              {currencyFormatter.format(mockRentalData.thisMonth.income)}
            </p>
            <div className="mt-2 space-y-1">
              {Object.entries(mockRentalData.byShop).slice(0, 3).map(([shop, data]) => (
                <p key={shop} className="text-xs text-muted">
                  - {shop}: {currencyFormatter.format(data.amount)}
                </p>
              ))}
            </div>
          </div>
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
            <p className="text-sm text-muted mb-1">ค่าเช่าภายนอก</p>
            <p className="text-2xl font-bold text-red-400">
              {currencyFormatter.format(mockRentalData.thisMonth.expenses)}
            </p>
            <p className="text-xs text-muted mt-1">ที่ดิน/ป้าย/โฆษณา</p>
          </div>
          <div className="bg-ptt-blue/10 border border-ptt-blue/30 rounded-xl p-4">
            <p className="text-sm text-muted mb-1">กำไรสุทธิ</p>
            <p className="text-2xl font-bold text-ptt-cyan">
              {currencyFormatter.format(mockRentalData.thisMonth.netProfit)}
            </p>
            <p className="text-xs text-muted mt-1">
              {mockRentalData.thisMonth.overdue > 0 && (
                <span className="text-orange-400">
                  ⚠️ หนี้ค้าง: {currencyFormatter.format(mockRentalData.thisMonth.overdue)}
                </span>
              )}
            </p>
          </div>
        </div>
      </motion.div>

      {/* ฟีเจอร์เพิ่มเติม */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="panel rounded-2xl p-6 shadow-app"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-app">ฟีเจอร์เพิ่มเติม</h3>
            <p className="text-sm text-muted">เข้าถึงฟีเจอร์ใหม่ทั้งหมด</p>
          </div>
          <BarChart2 className="w-6 h-6 text-muted" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/app/rental/lease-dashboard"
            className="p-4 bg-ptt-blue/10 hover:bg-ptt-blue/20 border border-ptt-blue/30 rounded-xl transition-all hover:scale-105"
          >
            <BarChart2 className="w-6 h-6 text-ptt-cyan mb-2" />
            <p className="font-semibold text-app text-sm">แดชบอร์ดพื้นที่เช่า</p>
            <p className="text-xs text-muted mt-1">ดูภาพรวมทุกสาขา</p>
          </Link>
          <Link
            to="/app/rental/variable-rent"
            className="p-4 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 rounded-xl transition-all hover:scale-105"
          >
            <TrendingUp className="w-6 h-6 text-purple-400 mb-2" />
            <p className="font-semibold text-app text-sm">ค่าเช่าผันแปร</p>
            <p className="text-xs text-muted mt-1">% จากยอดขาย (M1)</p>
          </Link>
          <Link
            to="/app/rental/lease-alerts"
            className="p-4 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 rounded-xl transition-all hover:scale-105"
          >
            <Bell className="w-6 h-6 text-orange-400 mb-2" />
            <p className="font-semibold text-app text-sm">แจ้งเตือน</p>
            <p className="text-xs text-muted mt-1">สัญญาใกล้หมด/ครบกำหนด</p>
          </Link>
          <Link
            to="/app/rental/aging-report"
            className="p-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-xl transition-all hover:scale-105"
          >
            <Clock className="w-6 h-6 text-red-400 mb-2" />
            <p className="font-semibold text-app text-sm">รายงานอายุหนี้</p>
            <p className="text-xs text-muted mt-1">Aging Report</p>
          </Link>
          <Link
            to="/app/rental/payment-vouchers"
            className="p-4 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-xl transition-all hover:scale-105"
          >
            <FileCheck className="w-6 h-6 text-emerald-400 mb-2" />
            <p className="font-semibold text-app text-sm">ใบสำคัญจ่าย</p>
            <p className="text-xs text-muted mt-1">สำหรับค่าเช่าที่จ่าย</p>
          </Link>
          <Link
            to="/app/rental/receipts"
            className="p-4 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded-xl transition-all hover:scale-105"
          >
            <Receipt className="w-6 h-6 text-blue-400 mb-2" />
            <p className="font-semibold text-app text-sm">ใบเสร็จรับเงิน</p>
            <p className="text-xs text-muted mt-1">ให้เจ้าของที่ดิน</p>
          </Link>
          <Link
            to="/app/rental/ocr-scan"
            className="p-4 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 rounded-xl transition-all hover:scale-105"
          >
            <Camera className="w-6 h-6 text-cyan-400 mb-2" />
            <p className="font-semibold text-app text-sm">OCR สแกน</p>
            <p className="text-xs text-muted mt-1">สัญญา/บิลอัตโนมัติ</p>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

