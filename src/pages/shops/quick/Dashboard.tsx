import { motion } from "framer-motion";
import {
  DollarSign,
  TrendingUp,
  ShoppingCart,
  AlertTriangle,
  BarChart3,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
  Upload,
  Wrench,
  CreditCard,
} from "lucide-react";
import { useShop } from "@/contexts/ShopContext";

const currencyFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat("th-TH");

// Mock data สำหรับร้าน Quick (B-Quik)
const mockSalesData = {
  today: 28000,
  yesterday: 25000,
  thisMonth: 840000,
  lastMonth: 750000,
  byService: {
    oilChange: { amount: 14000, percentage: 50, name: "ถ่ายน้ำมันเครื่อง" },
    tireChange: { amount: 8400, percentage: 30, name: "เปลี่ยนยาง" },
    inspection: { amount: 2800, percentage: 10, name: "ตรวจสภาพรถ" },
    battery: { amount: 1400, percentage: 5, name: "แบตเตอรี่" },
    others: { amount: 1400, percentage: 5, name: "ระบบแอร์/ช่วงล่าง" },
  },
};

const mockStockData = [
  { name: "น้ำมันเครื่อง PTT", quantity: 50, unit: "ลิตร", lowStock: false, expiry: "2025-12-31", category: "อะไหล่" },
  { name: "ยางรถยนต์", quantity: 20, unit: "เส้น", lowStock: true, expiry: "2027-01-10", category: "อะไหล่" },
  { name: "แบตเตอรี่", quantity: 10, unit: "ชิ้น", lowStock: true, expiry: "2026-06-15", category: "อะไหล่" },
  { name: "ไส้กรองน้ำมันเครื่อง", quantity: 40, unit: "ชิ้น", lowStock: false, expiry: "2026-02-01", category: "อะไหล่" },
  { name: "น้ำยาทำความสะอาดระบบแอร์", quantity: 30, unit: "ขวด", lowStock: false, expiry: "2025-12-31", category: "อะไหล่" },
];

const mockFinancialData = {
  revenue: 28000,
  expenses: 6000,
  profit: 22000,
  rent: 5000,
  cost: 4000,
  labor: 2000,
};

const mockRecentPurchases = [
  { id: "1", supplier: "PTT Lubricants", item: "น้ำมันเครื่อง PTT 200 ลิตร", amount: 60000, date: "2024-12-15", status: "ชำระแล้ว", source: "Stock Program" },
  { id: "2", supplier: "PTT", item: "ยางรถยนต์ 30 เส้น", amount: 120000, date: "2024-12-10", status: "ชำระแล้ว", source: "Stock Program" },
  { id: "3", supplier: "ซัพพลายเออร์ A", item: "แบตเตอรี่ 20 ชิ้น", amount: 30000, date: "2024-12-08", status: "รอชำระ", source: "Stock Program" },
];

const mockTopSellingServices = [
  { name: "ถ่ายน้ำมันเครื่อง (590 บาท)", sales: 420000, quantity: 700, trend: "+18%", service: "ถ่ายน้ำมันเครื่อง", promotion: "ผ่อน 0% 6 เดือน" },
  { name: "เปลี่ยนยาง", sales: 252000, quantity: 120, trend: "+12%", service: "เปลี่ยนยาง" },
  { name: "ตรวจสภาพรถ", sales: 84000, quantity: 140, trend: "+25%", service: "ตรวจสภาพรถ" },
  { name: "แบตเตอรี่", sales: 42000, quantity: 28, trend: "+8%", service: "แบตเตอรี่" },
];

export default function QuickDashboard() {
  const { currentShop } = useShop();
  const shopName = currentShop?.name || "ร้าน Quick (B-Quik)";
  
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
      value: currencyFormatter.format(mockFinancialData.profit),
      subtitle: `รายรับ ${currencyFormatter.format(mockFinancialData.revenue)} - รายจ่าย ${currencyFormatter.format(mockFinancialData.expenses)}`,
      icon: BarChart3,
      gradient: "from-purple-500 to-pink-500",
    },
    {
      title: "อะไหล่ใกล้หมด",
      value: numberFormatter.format(lowStockItems.length),
      subtitle: `${mockStockData.length} รายการทั้งหมด`,
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
        <h2 className="text-3xl font-bold text-app mb-2 font-display">{shopName}</h2>
        <p className="text-muted font-light">
          ภาพรวมยอดขาย สต็อกอะไหล่ และการเงินของศูนย์บริการรถยนต์และอะไหล่ของ PTT (เปลี่ยนยาง, ถ่ายน้ำมันเครื่อง 590 บาท, ตรวจสภาพรถ, แบตเตอรี่, ระบบแอร์/ช่วงล่าง) มีโปรโมชันผ่อน 0% 6 เดือน
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

      {/* Sales by Service */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="panel rounded-2xl p-6 shadow-app"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-app">ยอดขายแยกตามบริการ</h3>
            <p className="text-sm text-muted">ยอดขายวันนี้ (ถ่ายน้ำมันเครื่อง 50%)</p>
          </div>
          <BarChart3 className="w-6 h-6 text-muted" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
            <p className="text-sm text-muted mb-1">{mockSalesData.byService.oilChange.name}</p>
            <p className="text-2xl font-bold text-orange-400">
              {currencyFormatter.format(mockSalesData.byService.oilChange.amount)}
            </p>
            <p className="text-xs text-muted mt-1">
              {mockSalesData.byService.oilChange.percentage}% ของยอดขาย
            </p>
            <p className="text-xs text-ptt-cyan mt-1">590 บาท</p>
          </div>
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
            <p className="text-sm text-muted mb-1">{mockSalesData.byService.tireChange.name}</p>
            <p className="text-2xl font-bold text-blue-400">
              {currencyFormatter.format(mockSalesData.byService.tireChange.amount)}
            </p>
            <p className="text-xs text-muted mt-1">
              {mockSalesData.byService.tireChange.percentage}% ของยอดขาย
            </p>
          </div>
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
            <p className="text-sm text-muted mb-1">{mockSalesData.byService.inspection.name}</p>
            <p className="text-2xl font-bold text-purple-400">
              {currencyFormatter.format(mockSalesData.byService.inspection.amount)}
            </p>
            <p className="text-xs text-muted mt-1">
              {mockSalesData.byService.inspection.percentage}% ของยอดขาย
            </p>
          </div>
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
            <p className="text-sm text-muted mb-1">{mockSalesData.byService.battery.name}</p>
            <p className="text-2xl font-bold text-green-400">
              {currencyFormatter.format(mockSalesData.byService.battery.amount)}
            </p>
            <p className="text-xs text-muted mt-1">
              {mockSalesData.byService.battery.percentage}% ของยอดขาย
            </p>
          </div>
          <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4">
            <p className="text-sm text-muted mb-1">{mockSalesData.byService.others.name}</p>
            <p className="text-2xl font-bold text-cyan-400">
              {currencyFormatter.format(mockSalesData.byService.others.amount)}
            </p>
            <p className="text-xs text-muted mt-1">
              {mockSalesData.byService.others.percentage}% ของยอดขาย
            </p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* สต็อกอะไหล่ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="panel rounded-2xl p-6 shadow-app xl:col-span-2"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-semibold text-app">สต็อกอะไหล่</h3>
              <p className="text-sm text-muted">สต็อกคงเหลือและสถานะ (ยางรถ, น้ำมันเครื่อง, แบตเตอรี่)</p>
            </div>
            <Wrench className="w-6 h-6 text-muted" />
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
                    <p className="font-medium text-app">{item.name}</p>
                    {item.lowStock && (
                      <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30">
                        ใกล้หมด
                      </span>
                    )}
                    {item.name.includes("PTT") && (
                      <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-ptt-blue/10 text-ptt-cyan border border-ptt-blue/30">
                        PTT
                      </span>
                    )}
                    <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-ptt-blue/10 text-ptt-cyan border border-ptt-blue/30">
                      {item.category}
                    </span>
                  </div>
                  <p className="text-sm text-muted mt-1">
                    คงเหลือ: {numberFormatter.format(item.quantity)} {item.unit}
                  </p>
                  <p className="text-xs text-muted mt-1">
                    หมดอายุ: {new Date(item.expiry).toLocaleDateString("th-TH")}
                  </p>
                </div>
                <div className="text-right">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                    item.lowStock 
                      ? "bg-orange-500/20 border-2 border-orange-500/50" 
                      : "bg-emerald-500/20 border-2 border-emerald-500/50"
                  }`}>
                    <Wrench className={`w-6 h-6 ${
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
              <p className="text-sm text-muted mb-1">ต้นทุน (อะไหล่)</p>
              <p className="text-2xl font-semibold text-red-400">
                {currencyFormatter.format(mockFinancialData.cost)}
              </p>
            </div>
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
              <p className="text-sm text-muted mb-1">ค่าแรงช่าง</p>
              <p className="text-2xl font-semibold text-orange-400">
                {currencyFormatter.format(mockFinancialData.labor)}
              </p>
            </div>
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
              <p className="text-sm text-muted mb-1">รายจ่ายอื่นๆ</p>
              <p className="text-2xl font-semibold text-purple-400">
                {currencyFormatter.format(mockFinancialData.expenses - mockFinancialData.labor)}
              </p>
            </div>
            <div className="bg-ptt-blue/10 border border-ptt-blue/30 rounded-xl p-4">
              <p className="text-sm text-muted mb-1">กำไรสุทธิ</p>
              <p className="text-2xl font-semibold text-ptt-cyan">
                {currencyFormatter.format(mockFinancialData.profit)}
              </p>
            </div>
            <div className="bg-soft border-app rounded-xl p-4">
              <p className="text-sm text-muted mb-1">ค่าเช่าพื้นที่ (รายเดือน)</p>
              <p className="text-lg font-semibold text-app">
                {currencyFormatter.format(mockFinancialData.rent)}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* บริการขายดี */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="panel rounded-2xl p-6 shadow-app"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-semibold text-app">บริการขายดี</h3>
              <p className="text-sm text-muted">ยอดขายรายเดือน (ฮิต: ถ่ายน้ำมันเครื่อง 590 บาท)</p>
            </div>
            <TrendingUp className="w-6 h-6 text-muted" />
          </div>
          <div className="space-y-3">
            {mockTopSellingServices.map((item, index) => (
              <div
                key={item.name}
                className="flex items-center justify-between p-4 bg-soft rounded-xl border-app"
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
                    <p className="font-medium text-app">{item.name}</p>
                    <p className="text-xs text-muted">
                      {numberFormatter.format(item.quantity)} ครั้ง • {item.service}
                    </p>
                    {item.promotion && (
                      <div className="flex items-center gap-1 mt-1">
                        <CreditCard className="w-3 h-3 text-green-400" />
                        <span className="text-xs text-green-400">{item.promotion}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-app">
                    {currencyFormatter.format(item.sales)}
                  </p>
                  <div className={`flex items-center gap-1 text-xs ${
                    item.trend.startsWith('+') ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    {item.trend.startsWith('+') ? (
                      <ArrowUpRight className="w-3 h-3" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3" />
                    )}
                    {item.trend}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* การซื้ออะไหล่เข้า */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="panel rounded-2xl p-6 shadow-app"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-semibold text-app">การซื้ออะไหล่เข้า</h3>
              <p className="text-sm text-muted">รายการล่าสุด (จาก PTT Lubricants)</p>
            </div>
            <ShoppingCart className="w-6 h-6 text-muted" />
          </div>
          <div className="space-y-3">
            {mockRecentPurchases.map((purchase) => (
              <div
                key={purchase.id}
                className="p-4 bg-soft rounded-xl border-app"
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-medium text-app">{purchase.item}</p>
                    <p className="text-xs text-muted">{purchase.supplier}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      purchase.status === "ชำระแล้ว"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                        : "bg-orange-500/10 text-orange-400 border border-orange-500/30"
                    }`}>
                      {purchase.status}
                    </span>
                    <span className="text-xs px-2 py-1 rounded-full bg-ptt-blue/10 text-ptt-cyan border border-ptt-blue/30">
                      {purchase.source}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted">
                    {new Date(purchase.date).toLocaleDateString("th-TH")}
                  </span>
                  <span className="font-semibold text-app">
                    {currencyFormatter.format(purchase.amount)}
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
          <button className="flex items-center gap-3 p-4 bg-ptt-blue/10 hover:bg-ptt-blue/20 border border-ptt-blue/30 rounded-xl transition-colors">
            <Upload className="w-5 h-5 text-ptt-cyan" />
            <span className="text-app font-medium">นำเข้าจาก Stock Program</span>
          </button>
          <button className="flex items-center gap-3 p-4 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-xl transition-colors">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            <span className="text-app font-medium">บันทึกยอดขาย</span>
          </button>
          <button className="flex items-center gap-3 p-4 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 rounded-xl transition-colors">
            <FileText className="w-5 h-5 text-purple-400" />
            <span className="text-app font-medium">รายงาน</span>
          </button>
          <button className="flex items-center gap-3 p-4 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 rounded-xl transition-colors">
            <CreditCard className="w-5 h-5 text-green-400" />
            <span className="text-app font-medium">โปรโมชันผ่อน 0%</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}

