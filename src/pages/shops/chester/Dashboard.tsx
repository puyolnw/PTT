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
  Drumstick,
} from "lucide-react";
import { useShop } from "@/contexts/ShopContext";

const currencyFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat("th-TH");

// Mock data สำหรับร้านเชสเตอร์
const mockSalesData = {
  today: 40000,
  yesterday: 38000,
  thisMonth: 1200000,
  lastMonth: 1100000,
  byMenu: {
    mala: { amount: 20000, percentage: 50, name: "ไก่ทอดหมาล่า" },
    korean: { amount: 12000, percentage: 30, name: "ไก่ทอดซอสเกาหลี" },
    fries: { amount: 5000, percentage: 12.5, name: "เฟรนช์ฟรายส์" },
    others: { amount: 3000, percentage: 7.5, name: "อื่นๆ" },
  },
};

const mockStockData = [
  { name: "ไก่สด", quantity: 30, unit: "กก.", lowStock: true, expiry: "2024-12-20", category: "วัตถุดิบ", supplier: "CP Foods" },
  { name: "ซอสเกาหลี", quantity: 25, unit: "ขวด", lowStock: true, expiry: "2025-06-15", category: "วัตถุดิบ", supplier: "ซัพพลายเออร์ A" },
  { name: "แป้งทอด", quantity: 50, unit: "กก.", lowStock: false, expiry: "2025-03-10", category: "วัตถุดิบ", supplier: "CP Foods" },
  { name: "มันฝรั่ง", quantity: 80, unit: "กก.", lowStock: false, expiry: "2024-12-25", category: "วัตถุดิบ", supplier: "CP Foods" },
  { name: "น้ำมันทอด", quantity: 100, unit: "ลิตร", lowStock: false, expiry: "2025-08-01", category: "วัตถุดิบ", supplier: "CP Foods" },
];

const mockFinancialData = {
  revenue: 40000,
  expenses: 5000,
  profit: 35000,
  rent: 5500,
  cost: 12000,
};

const mockRecentPurchases = [
  { id: "1", supplier: "CP Foods", item: "ไก่สด 50 กก.", amount: 15000, date: "2024-12-15", status: "ชำระแล้ว", source: "แอป Chester's" },
  { id: "2", supplier: "PTT", item: "ค่าน้ำ/ไฟ", amount: 3000, date: "2024-12-10", status: "ชำระแล้ว", source: "Manual" },
  { id: "3", supplier: "ซัพพลายเออร์ A", item: "ซอสเกาหลี 30 ขวด", amount: 4500, date: "2024-12-08", status: "รอชำระ", source: "แอป Chester's" },
];

const mockTopSellingItems = [
  { name: "ไก่ทอดหมาล่า", sales: 600000, quantity: 6000, trend: "+20%", menu: "ไก่ทอด" },
  { name: "ไก่ทอดซอสเกาหลี", sales: 360000, quantity: 3600, trend: "+15%", menu: "ไก่ทอด" },
  { name: "เฟรนช์ฟรายส์ไก่ย่าง", sales: 150000, quantity: 1500, trend: "+10%", menu: "เฟรนช์ฟรายส์" },
  { name: "ไก่ทอดรสพิเศษ", sales: 90000, quantity: 900, trend: "+25%", menu: "ไก่ทอด" },
];

export default function ChesterDashboard() {
  const { currentShop } = useShop();
  const shopName = currentShop?.name || "ร้านเชสเตอร์ (Chester's)";
  
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
      title: "สต็อกใกล้หมด",
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
          ภาพรวมยอดขาย สต็อก และการเงินของร้านอาหารฟาสต์ฟู้ดเกาหลี เน้นไก่ย่างเกาหลี (Korean Fried Chicken) กรอบนอกนุ่มใน รสชาติเผ็ดหวานสูตรเด็ด
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

      {/* Sales by Menu */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="panel rounded-2xl p-6 shadow-app"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-app">ยอดขายแยกตามเมนู</h3>
            <p className="text-sm text-muted">ยอดขายวันนี้ (ไก่หมาล่า 50%, ไก่ซอส 30%)</p>
          </div>
          <BarChart3 className="w-6 h-6 text-muted" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
            <p className="text-sm text-muted mb-1">{mockSalesData.byMenu.mala.name}</p>
            <p className="text-2xl font-bold text-orange-400">
              {currencyFormatter.format(mockSalesData.byMenu.mala.amount)}
            </p>
            <p className="text-xs text-muted mt-1">
              {mockSalesData.byMenu.mala.percentage}% ของยอดขาย
            </p>
          </div>
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
            <p className="text-sm text-muted mb-1">{mockSalesData.byMenu.korean.name}</p>
            <p className="text-2xl font-bold text-red-400">
              {currencyFormatter.format(mockSalesData.byMenu.korean.amount)}
            </p>
            <p className="text-xs text-muted mt-1">
              {mockSalesData.byMenu.korean.percentage}% ของยอดขาย
            </p>
          </div>
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
            <p className="text-sm text-muted mb-1">{mockSalesData.byMenu.fries.name}</p>
            <p className="text-2xl font-bold text-yellow-400">
              {currencyFormatter.format(mockSalesData.byMenu.fries.amount)}
            </p>
            <p className="text-xs text-muted mt-1">
              {mockSalesData.byMenu.fries.percentage}% ของยอดขาย
            </p>
          </div>
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
            <p className="text-sm text-muted mb-1">{mockSalesData.byMenu.others.name}</p>
            <p className="text-2xl font-bold text-purple-400">
              {currencyFormatter.format(mockSalesData.byMenu.others.amount)}
            </p>
            <p className="text-xs text-muted mt-1">
              {mockSalesData.byMenu.others.percentage}% ของยอดขาย
            </p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* สต็อกสินค้า */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="panel rounded-2xl p-6 shadow-app xl:col-span-2"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-semibold text-app">สต็อกสินค้า</h3>
              <p className="text-sm text-muted">สต็อกคงเหลือและสถานะ (ไก่สด, ซอสเกาหลี)</p>
            </div>
            <Drumstick className="w-6 h-6 text-muted" />
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
                        ใกล้หมด (&lt;20%)
                      </span>
                    )}
                    {item.supplier === "CP Foods" && (
                      <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-ptt-blue/10 text-ptt-cyan border border-ptt-blue/30">
                        CP Foods
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
                    หมดอายุ: {new Date(item.expiry).toLocaleDateString("th-TH")} • {item.supplier}
                  </p>
                </div>
                <div className="text-right">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                    item.lowStock 
                      ? "bg-orange-500/20 border-2 border-orange-500/50" 
                      : "bg-emerald-500/20 border-2 border-emerald-500/50"
                  }`}>
                    <Drumstick className={`w-6 h-6 ${
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
              <p className="text-sm text-muted mb-1">ต้นทุน (วัตถุดิบ)</p>
              <p className="text-2xl font-semibold text-red-400">
                {currencyFormatter.format(mockFinancialData.cost)}
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
        {/* เมนูขายดี */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="panel rounded-2xl p-6 shadow-app"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-semibold text-app">เมนูขายดี</h3>
              <p className="text-sm text-muted">ยอดขายรายเดือน (ฮิต: ไก่หมาล่า)</p>
            </div>
            <TrendingUp className="w-6 h-6 text-muted" />
          </div>
          <div className="space-y-3">
            {mockTopSellingItems.map((item, index) => (
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
                      {numberFormatter.format(item.quantity)} ชิ้น • {item.menu}
                    </p>
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

        {/* การสั่งซื้อวัตถุดิบ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="panel rounded-2xl p-6 shadow-app"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-semibold text-app">การสั่งซื้อวัตถุดิบ</h3>
              <p className="text-sm text-muted">รายการล่าสุด (จาก CP Foods)</p>
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
            <span className="text-app font-medium">นำเข้า Excel จากแอป Chester's</span>
          </button>
          <button className="flex items-center gap-3 p-4 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-xl transition-colors">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            <span className="text-app font-medium">บันทึกยอดขาย</span>
          </button>
          <button className="flex items-center gap-3 p-4 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 rounded-xl transition-colors">
            <FileText className="w-5 h-5 text-purple-400" />
            <span className="text-app font-medium">รายงาน</span>
          </button>
          <button className="flex items-center gap-3 p-4 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 rounded-xl transition-colors">
            <ShoppingCart className="w-5 h-5 text-orange-400" />
            <span className="text-app font-medium">สั่งซื้อวัตถุดิบ</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}

