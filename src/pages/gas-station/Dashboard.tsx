import { motion } from "framer-motion";
import {
  DollarSign,
  TrendingUp,
  Package,
  AlertTriangle,
  BarChart3,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
  Upload,
  Fuel,
  Building2,
  Ticket,
} from "lucide-react";

const currencyFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat("th-TH");

// Mock data สำหรับ M1 - บริหารจัดการปั๊มน้ำมัน
const mockSalesData = {
  today: 500000,
  yesterday: 480000,
  thisMonth: 15000000,
  lastMonth: 14000000,
  byPaymentMethod: {
    cash: { amount: 300000, percentage: 60, name: "เงินสด" },
    qr: { amount: 125000, percentage: 25, name: "QR / KPLUS / PROMPTPAY" },
    card: { amount: 50000, percentage: 10, name: "Master / VISA" },
    coupon: { amount: 2950, percentage: 0.6, name: "คูปองสถานี" },
    others: { amount: 22050, percentage: 4.4, name: "อื่นๆ" },
  },
  byFuelType: {
    g95: { amount: 300000, percentage: 60, name: "Gasohol 95" },
    diesel: { amount: 200000, percentage: 40, name: "Diesel" },
  },
};

const mockStockData = [
  { name: "Gasohol 95", quantity: 28500, unit: "ลิตร", tank: "TK-001", branch: "สำนักงานใหญ่", lowStock: false },
  { name: "Diesel", quantity: 32000, unit: "ลิตร", tank: "TK-002", branch: "สำนักงานใหญ่", lowStock: false },
  { name: "Premium Gasohol 95", quantity: 15000, unit: "ลิตร", tank: "TK-003", branch: "สำนักงานใหญ่", lowStock: true },
  { name: "E20", quantity: 8000, unit: "ลิตร", tank: "TK-004", branch: "สาขา A", lowStock: true },
];

const mockFinancialData = {
  revenue: 500000,
  cost: 400000,
  profit: 100000,
  expenses: 15000,
  netProfit: 85000,
};

const mockRecentPurchases = [
  { id: "1", date: "2024-12-15", fuelType: "Gasohol 95", quantity: 50000, amount: 2000000, branch: "สำนักงานใหญ่", source: "PURCHASE_20241215.xlsx" },
  { id: "2", date: "2024-12-14", fuelType: "Diesel", quantity: 40000, amount: 1600000, branch: "สาขา A", source: "PURCHASE_20241214.xlsx" },
  { id: "3", date: "2024-12-13", fuelType: "Premium Gasohol 95", quantity: 20000, amount: 900000, branch: "สาขา B", source: "PURCHASE_20241213.xlsx" },
];

const mockTopSellingBranches = [
  { name: "สำนักงานใหญ่", sales: 500000, trend: "+10%", profit: 85000 },
  { name: "สาขา A", sales: 450000, trend: "+8%", profit: 76500 },
  { name: "สาขา B", sales: 400000, trend: "+12%", profit: 68000 },
  { name: "สาขา C", sales: 350000, trend: "+5%", profit: 59500 },
  { name: "สาขา D", sales: 300000, trend: "+15%", profit: 51000 },
];

export default function GasStationDashboard() {
  const salesChange = ((mockSalesData.today - mockSalesData.yesterday) / mockSalesData.yesterday) * 100;
  const monthlyChange = ((mockSalesData.thisMonth - mockSalesData.lastMonth) / mockSalesData.lastMonth) * 100;
  const lowStockItems = mockStockData.filter(item => item.lowStock);

  const overviewStats = [
    {
      title: "ยอดขายวันนี้",
      value: currencyFormatter.format(mockSalesData.today),
      subtitle: `เมื่อวาน ${currencyFormatter.format(mockSalesData.yesterday)}`,
      icon: DollarSign,
      gradient: "from-emerald-500 to-teal-500",
      change: salesChange > 0 ? `+${salesChange.toFixed(1)}%` : `${salesChange.toFixed(1)}%`,
    },
    {
      title: "ยอดขายเดือนนี้",
      value: currencyFormatter.format(mockSalesData.thisMonth),
      subtitle: `เดือนที่แล้ว ${currencyFormatter.format(mockSalesData.lastMonth)}`,
      icon: TrendingUp,
      gradient: "from-ptt-blue to-ptt-cyan",
      change: monthlyChange > 0 ? `+${monthlyChange.toFixed(1)}%` : `${monthlyChange.toFixed(1)}%`,
    },
    {
      title: "กำไรสุทธิวันนี้",
      value: currencyFormatter.format(mockFinancialData.netProfit),
      subtitle: `รายรับ ${currencyFormatter.format(mockFinancialData.revenue)} - ต้นทุน ${currencyFormatter.format(mockFinancialData.cost)}`,
      icon: BarChart3,
      gradient: "from-purple-500 to-pink-500",
    },
    {
      title: "สต็อกใกล้หมด",
      value: numberFormatter.format(lowStockItems.length),
      subtitle: `${mockStockData.length} ถังทั้งหมด`,
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
        <h2 className="text-3xl font-bold text-app mb-2 font-display">M1: บริหารจัดการปั๊มน้ำมัน</h2>
        <p className="text-muted font-light">
          ภาพรวมยอดขาย สต็อก กำไรแบบเรียลไทม์ สำหรับ 5 ปั๊ม (1 สำนักงานใหญ่ + 4 สาขา) นำเข้าข้อมูลจาก PTT BackOffice (Excel)
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
                <div className={`flex items-center gap-1 text-sm font-medium ${
                  stat.change.startsWith('+') ? 'text-emerald-400' : 'text-red-400'
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

      {/* คูปองสถานี - ส่วนสรุปแยกต่างหาก */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="panel rounded-2xl p-6 shadow-app border-2 border-orange-500/30 bg-gradient-to-br from-orange-500/10 to-orange-500/5"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-orange-500/20 border border-orange-500/30">
              <Ticket className="w-6 h-6 text-orange-400" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-app">ระบบคูปองสถานี</h3>
              <p className="text-sm text-muted">ยอดขายด้วยคูปองสถานี (ยอดขายเต็มราคา - ไม่มีส่วนลด)</p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-app/50 rounded-xl p-4 border border-orange-500/20">
            <p className="text-sm text-muted mb-1">ยอดขายด้วยคูปองวันนี้</p>
            <p className="text-2xl font-bold text-orange-400">
              {currencyFormatter.format(mockSalesData.byPaymentMethod.coupon.amount)}
            </p>
            <p className="text-xs text-muted mt-1">
              {mockSalesData.byPaymentMethod.coupon.percentage}% ของยอดขายทั้งหมด
            </p>
          </div>
          <div className="bg-app/50 rounded-xl p-4 border border-orange-500/20">
            <p className="text-sm text-muted mb-1">จำนวนคูปองที่ใช้</p>
            <p className="text-2xl font-bold text-orange-400">2 ใบ</p>
            <p className="text-xs text-muted mt-1">C001, C002</p>
          </div>
          <div className="bg-app/50 rounded-xl p-4 border border-orange-500/20">
            <p className="text-sm text-muted mb-1">สถานะ</p>
            <p className="text-2xl font-bold text-emerald-400">ปกติ</p>
            <p className="text-xs text-muted mt-1">ยอดขายเต็มราคา - ไม่หักส่วนลด</p>
          </div>
        </div>
        <div className="mt-4 p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
          <p className="text-xs text-orange-400/80">
            <strong>หมายเหตุ:</strong> คูปองสถานีใน M1 เป็นช่องทางการชำระเงินเท่านั้น (PaymentType = Coupon) ไม่มีการหักส่วนลด 
            ยอดขายยังคงเต็มราคา (Full Price) ตามข้อมูลจาก PTT BackOffice
          </p>
        </div>
      </motion.div>

      {/* Sales by Payment Method */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="panel rounded-2xl p-6 shadow-app"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-app">ยอดขายแยกตามช่องทางชำระเงิน</h3>
            <p className="text-sm text-muted">ยอดขายวันนี้: {currencyFormatter.format(mockSalesData.today)} (เงินสด 60%, QR 25%, คูปองสถานี {mockSalesData.byPaymentMethod.coupon.percentage}%)</p>
          </div>
          <BarChart3 className="w-6 h-6 text-muted" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
            <p className="text-sm text-muted mb-1">{mockSalesData.byPaymentMethod.cash.name}</p>
            <p className="text-2xl font-bold text-emerald-400">
              {currencyFormatter.format(mockSalesData.byPaymentMethod.cash.amount)}
            </p>
            <p className="text-xs text-muted mt-1">
              {mockSalesData.byPaymentMethod.cash.percentage}% ของยอดขาย
            </p>
          </div>
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
            <p className="text-sm text-muted mb-1">{mockSalesData.byPaymentMethod.qr.name}</p>
            <p className="text-2xl font-bold text-blue-400">
              {currencyFormatter.format(mockSalesData.byPaymentMethod.qr.amount)}
            </p>
            <p className="text-xs text-muted mt-1">
              {mockSalesData.byPaymentMethod.qr.percentage}% ของยอดขาย
            </p>
          </div>
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
            <p className="text-sm text-muted mb-1">{mockSalesData.byPaymentMethod.card.name}</p>
            <p className="text-2xl font-bold text-purple-400">
              {currencyFormatter.format(mockSalesData.byPaymentMethod.card.amount)}
            </p>
            <p className="text-xs text-muted mt-1">
              {mockSalesData.byPaymentMethod.card.percentage}% ของยอดขาย
            </p>
          </div>
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
            <p className="text-sm text-muted mb-1">{mockSalesData.byPaymentMethod.coupon.name}</p>
            <p className="text-2xl font-bold text-orange-400">
              {currencyFormatter.format(mockSalesData.byPaymentMethod.coupon.amount)}
            </p>
            <p className="text-xs text-muted mt-1">
              {mockSalesData.byPaymentMethod.coupon.percentage}% ของยอดขาย
            </p>
            <p className="text-xs text-orange-400/70 mt-1 italic">
              (ยอดขายเต็มราคา - ไม่มีส่วนลด)
            </p>
          </div>
          <div className="bg-gray-500/10 border border-gray-500/30 rounded-xl p-4">
            <p className="text-sm text-muted mb-1">{mockSalesData.byPaymentMethod.others.name}</p>
            <p className="text-2xl font-bold text-gray-400">
              {currencyFormatter.format(mockSalesData.byPaymentMethod.others.amount)}
            </p>
            <p className="text-xs text-muted mt-1">
              {mockSalesData.byPaymentMethod.others.percentage}% ของยอดขาย
            </p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* สต็อกน้ำมัน */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="panel rounded-2xl p-6 shadow-app xl:col-span-2"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-semibold text-app">สต็อกน้ำมัน</h3>
              <p className="text-sm text-muted">สต็อกน้ำมันทุกถัง แยกตามปั๊มและชนิด (สต็อกรวม: 120,000 ลิตร)</p>
            </div>
            <Fuel className="w-6 h-6 text-muted" />
          </div>
          <div className="space-y-3">
            {mockStockData.map((item) => (
              <div
                key={item.name}
                className={`flex items-center justify-between p-4 rounded-xl border ${
                  item.lowStock 
                    ? "bg-orange-500/10 border-orange-500/30" 
                    : "bg-soft border-app"
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <Fuel className="w-5 h-5 text-ptt-cyan" />
                    <p className="font-medium text-app">{item.name}</p>
                    {item.lowStock && (
                      <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30">
                        ใกล้หมด
                      </span>
                    )}
                    <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-ptt-blue/10 text-ptt-cyan border border-ptt-blue/30">
                      {item.branch}
                    </span>
                  </div>
                  <p className="text-sm text-muted mt-1">
                    ถัง: {item.tank} • คงเหลือ: {numberFormatter.format(item.quantity)} {item.unit}
                  </p>
                </div>
                <div className="text-right">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                    item.lowStock 
                      ? "bg-orange-500/20 border-2 border-orange-500/50" 
                      : "bg-emerald-500/20 border-2 border-emerald-500/50"
                  }`}>
                    <Fuel className={`w-6 h-6 ${
                      item.lowStock ? "text-orange-400" : "text-emerald-400"
                    }`} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* สรุปการเงิน */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="panel rounded-2xl p-6 shadow-app"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-app">สรุปการเงินวันนี้</h3>
            <DollarSign className="w-5 h-5 text-muted" />
          </div>
          <div className="space-y-4">
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
              <p className="text-sm text-muted mb-1">รายรับ</p>
              <p className="text-2xl font-semibold text-emerald-400">
                {currencyFormatter.format(mockFinancialData.revenue)}
              </p>
            </div>
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
              <p className="text-sm text-muted mb-1">ต้นทุน</p>
              <p className="text-2xl font-semibold text-red-400">
                {currencyFormatter.format(mockFinancialData.cost)}
              </p>
            </div>
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
              <p className="text-sm text-muted mb-1">กำไรขั้นต้น</p>
              <p className="text-2xl font-semibold text-blue-400">
                {currencyFormatter.format(mockFinancialData.profit)}
              </p>
            </div>
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
              <p className="text-sm text-muted mb-1">รายจ่าย</p>
              <p className="text-2xl font-semibold text-orange-400">
                {currencyFormatter.format(mockFinancialData.expenses)}
              </p>
            </div>
            <div className="bg-ptt-blue/10 border border-ptt-blue/30 rounded-xl p-4">
              <p className="text-sm text-muted mb-1">กำไรสุทธิ</p>
              <p className="text-2xl font-semibold text-ptt-cyan">
                {currencyFormatter.format(mockFinancialData.netProfit)}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* สาขาขายดี */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="panel rounded-2xl p-6 shadow-app"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-semibold text-app">ยอดขายแยกตามสาขา</h3>
              <p className="text-sm text-muted">เปรียบเทียบ 5 ปั๊ม</p>
            </div>
            <Building2 className="w-6 h-6 text-muted" />
          </div>
          <div className="space-y-3">
            {mockTopSellingBranches.map((branch, index) => (
              <div
                key={branch.name}
                className="flex items-center justify-between p-4 bg-soft rounded-xl border border-app"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    index === 0 ? "bg-ptt-blue/20 text-ptt-cyan" :
                    index === 1 ? "bg-emerald-500/20 text-emerald-400" :
                    "bg-muted/20 text-muted"
                  }`}>
                    <span className="text-sm font-bold">{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium text-app">{branch.name}</p>
                    <p className="text-xs text-muted">กำไร: {currencyFormatter.format(branch.profit)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-app">
                    {currencyFormatter.format(branch.sales)}
                  </p>
                  <div className={`flex items-center gap-1 text-xs text-emerald-400 mt-1`}>
                    <TrendingUp className="w-3 h-3" />
                    {branch.trend}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* การซื้อน้ำมันเข้า */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="panel rounded-2xl p-6 shadow-app"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-semibold text-app">การซื้อน้ำมันเข้า</h3>
              <p className="text-sm text-muted">รายการล่าสุด (จาก PTT BackOffice)</p>
            </div>
            <Package className="w-6 h-6 text-muted" />
          </div>
          <div className="space-y-3">
            {mockRecentPurchases.map((purchase) => (
              <div
                key={purchase.id}
                className="p-4 bg-soft rounded-xl border border-app"
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-medium text-app">{purchase.fuelType}</p>
                    <p className="text-xs text-muted">{purchase.branch}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-app">
                      {currencyFormatter.format(purchase.amount)}
                    </p>
                    <p className="text-xs text-muted">
                      {numberFormatter.format(purchase.quantity)} ลิตร
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted">
                    {new Date(purchase.date).toLocaleDateString("th-TH")}
                  </span>
                  <span className="text-xs px-2 py-1 rounded-full bg-ptt-blue/10 text-ptt-cyan border border-ptt-blue/30">
                    {purchase.source}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="panel/40 border border-app rounded-2xl p-6"
      >
        <h3 className="text-lg font-semibold text-app mb-4 font-display">การดำเนินการด่วน</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <label className="flex items-center gap-3 p-4 bg-ptt-blue/10 hover:bg-ptt-blue/20 border border-ptt-blue/30 rounded-xl transition-colors cursor-pointer">
            <Upload className="w-5 h-5 text-ptt-cyan" />
            <span className="text-app font-medium">นำเข้า Excel จาก PTT BackOffice</span>
            <input
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
            />
          </label>
          <button className="flex items-center gap-3 p-4 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-xl transition-colors">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            <span className="text-app font-medium">ดูรายงานยอดขาย</span>
          </button>
          <button className="flex items-center gap-3 p-4 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 rounded-xl transition-colors">
            <FileText className="w-5 h-5 text-purple-400" />
            <span className="text-app font-medium">ออกรายงาน PDF</span>
          </button>
          <button className="flex items-center gap-3 p-4 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 rounded-xl transition-colors">
            <BarChart3 className="w-5 h-5 text-orange-400" />
            <span className="text-app font-medium">ส่งข้อมูลไป M6</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}

