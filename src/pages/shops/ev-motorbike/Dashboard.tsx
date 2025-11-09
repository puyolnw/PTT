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
  Zap,
  Battery,
  CreditCard,
} from "lucide-react";
import { useShop } from "@/contexts/ShopContext";

const currencyFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat("th-TH");

// Mock data สำหรับร้านมอเตอร์ไซค์ไฟฟ้า
const mockSalesData = {
  today: 15000,
  yesterday: 12000,
  thisMonth: 450000,
  lastMonth: 360000,
  byProduct: {
    scooter: { amount: 9000, percentage: 60, name: "สกู๊ตเตอร์ไฟฟ้า" },
    motorbike: { amount: 4000, percentage: 27, name: "มอเตอร์ไซค์ไฟฟ้า" },
    bicycle: { amount: 1500, percentage: 10, name: "จักรยานไฟฟ้า" },
    others: { amount: 500, percentage: 3, name: "สามล้อไฟฟ้า" },
  },
};

const mockStockData = [
  { name: "สกู๊ตเตอร์ไฟฟ้า 800W", quantity: 5, unit: "คัน", lowStock: true, category: "สกู๊ตเตอร์ไฟฟ้า", price: 25000, brand: "SKY Motorbike" },
  { name: "แบตเตอรี่ Graphene 60V", quantity: 10, unit: "ชุด", lowStock: true, category: "อะไหล่ EV", price: 8000, brand: "SAGASONIC" },
  { name: "มอเตอร์ไซค์ไฟฟ้า 800W", quantity: 8, unit: "คัน", lowStock: false, category: "มอเตอร์ไซค์ไฟฟ้า", price: 35000, brand: "SKY Motorbike" },
  { name: "จักรยานไฟฟ้า Sabaie Ice Cream", quantity: 12, unit: "คัน", lowStock: false, category: "จักรยานไฟฟ้า", price: 25000, brand: "Sabaie Bike" },
  { name: "อะไหล่ชาร์จ EV", quantity: 20, unit: "ชุด", lowStock: false, category: "อะไหล่ EV", price: 1500, brand: "SAGASONIC" },
];

const mockFinancialData = {
  revenue: 15000,
  expenses: 2000,
  profit: 13000,
  rent: 3500,
  cost: 10000,
  labor: 1000,
};

const mockRecentPurchases = [
  { id: "1", supplier: "SKY Motorbike มหาสารคาม", item: "สกู๊ตเตอร์ไฟฟ้า 800W 10 คัน", amount: 250000, date: "2024-12-15", status: "ชำระแล้ว", source: "Stock Program" },
  { id: "2", supplier: "SAGASONIC", item: "แบตเตอรี่ Graphene 60V 20 ชุด", amount: 160000, date: "2024-12-10", status: "ชำระแล้ว", source: "Stock Program" },
  { id: "3", supplier: "EV Proshop", item: "จักรยานไฟฟ้า Sabaie 5 คัน", amount: 125000, date: "2024-12-08", status: "รอชำระ", source: "Stock Program" },
];

const mockTopSellingProducts = [
  { name: "สกู๊ตเตอร์ไฟฟ้า 800W", sales: 270000, quantity: 12, trend: "+25%", category: "สกู๊ตเตอร์ไฟฟ้า", brand: "SKY Motorbike", promotion: "ผ่อน 0% 12 เดือน" },
  { name: "มอเตอร์ไซค์ไฟฟ้า 800W", sales: 140000, quantity: 4, trend: "+15%", category: "มอเตอร์ไซค์ไฟฟ้า", brand: "SKY Motorbike" },
  { name: "จักรยานไฟฟ้า Sabaie Ice Cream", sales: 75000, quantity: 3, trend: "+20%", category: "จักรยานไฟฟ้า", brand: "Sabaie Bike" },
  { name: "แบตเตอรี่ Graphene 60V", sales: 40000, quantity: 5, trend: "+10%", category: "อะไหล่ EV", brand: "SAGASONIC" },
];

export default function EVMotorbikeDashboard() {
  const { currentShop } = useShop();
  const shopName = currentShop?.name || "ร้านมอเตอร์ไซค์ไฟฟ้า (EV Motorbike Shop)";
  
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
      title: "สินค้าใกล้หมด",
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
          ภาพรวมยอดขาย สต็อกสินค้า และการเงินของร้านขายและบริการมอเตอร์ไซค์ไฟฟ้า จักรยานไฟฟ้า สกู๊ตเตอร์ไฟฟ้า สามล้อไฟฟ้า (SKY Motorbike, SAGASONIC, Sabaie Bike) ราคาเริ่มต้น 20,000-50,000 บาท มีบริการชาร์จ EV ที่ปั๊ม PTT รองรับผ่อน 0% 12 เดือน
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

      {/* Sales by Product */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="panel rounded-2xl p-6 shadow-app"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-app">ยอดขายแยกตามสินค้า</h3>
            <p className="text-sm text-muted">ยอดขายวันนี้ (สกู๊ตเตอร์ไฟฟ้า 60%)</p>
          </div>
          <BarChart3 className="w-6 h-6 text-muted" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
            <p className="text-sm text-muted mb-1">{mockSalesData.byProduct.scooter.name}</p>
            <p className="text-2xl font-bold text-orange-400">
              {currencyFormatter.format(mockSalesData.byProduct.scooter.amount)}
            </p>
            <p className="text-xs text-muted mt-1">
              {mockSalesData.byProduct.scooter.percentage}% ของยอดขาย
            </p>
          </div>
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
            <p className="text-sm text-muted mb-1">{mockSalesData.byProduct.motorbike.name}</p>
            <p className="text-2xl font-bold text-blue-400">
              {currencyFormatter.format(mockSalesData.byProduct.motorbike.amount)}
            </p>
            <p className="text-xs text-muted mt-1">
              {mockSalesData.byProduct.motorbike.percentage}% ของยอดขาย
            </p>
          </div>
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
            <p className="text-sm text-muted mb-1">{mockSalesData.byProduct.bicycle.name}</p>
            <p className="text-2xl font-bold text-purple-400">
              {currencyFormatter.format(mockSalesData.byProduct.bicycle.amount)}
            </p>
            <p className="text-xs text-muted mt-1">
              {mockSalesData.byProduct.bicycle.percentage}% ของยอดขาย
            </p>
          </div>
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
            <p className="text-sm text-muted mb-1">{mockSalesData.byProduct.others.name}</p>
            <p className="text-2xl font-bold text-green-400">
              {currencyFormatter.format(mockSalesData.byProduct.others.amount)}
            </p>
            <p className="text-xs text-muted mt-1">
              {mockSalesData.byProduct.others.percentage}% ของยอดขาย
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
              <p className="text-sm text-muted">สต็อกคงเหลือและสถานะ (มอเตอร์ไซค์ไฟฟ้า, จักรยานไฟฟ้า, สกู๊ตเตอร์ไฟฟ้า, อะไหล่ EV)</p>
            </div>
            <Battery className="w-6 h-6 text-muted" />
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
                    <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-ptt-blue/10 text-ptt-cyan border border-ptt-blue/30">
                      {item.brand}
                    </span>
                    <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/30">
                      {item.category}
                    </span>
                  </div>
                  <p className="text-sm text-muted mt-1">
                    คงเหลือ: {numberFormatter.format(item.quantity)} {item.unit} • ราคา: {currencyFormatter.format(item.price)}/{item.unit}
                  </p>
                </div>
                <div className="text-right">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                    item.lowStock 
                      ? "bg-orange-500/20 border-2 border-orange-500/50" 
                      : "bg-emerald-500/20 border-2 border-emerald-500/50"
                  }`}>
                    <Battery className={`w-6 h-6 ${
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
              <p className="text-sm text-muted mb-1">ต้นทุนสินค้า</p>
              <p className="text-2xl font-semibold text-red-400">
                {currencyFormatter.format(mockFinancialData.cost)}
              </p>
            </div>
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
              <p className="text-sm text-muted mb-1">ค่าแรง</p>
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
        {/* สินค้าขายดี */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="panel rounded-2xl p-6 shadow-app"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-semibold text-app">สินค้าขายดี</h3>
              <p className="text-sm text-muted">ยอดขายรายเดือน (ฮิต: สกู๊ตเตอร์ไฟฟ้า 800W)</p>
            </div>
            <TrendingUp className="w-6 h-6 text-muted" />
          </div>
          <div className="space-y-3">
            {mockTopSellingProducts.map((item, index) => (
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
                      {numberFormatter.format(item.quantity)} {item.category === "อะไหล่ EV" ? "ชุด" : "คัน"} • {item.brand}
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

        {/* การซื้อสินค้าเข้า */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="panel rounded-2xl p-6 shadow-app"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-semibold text-app">การซื้อสินค้าเข้า</h3>
              <p className="text-sm text-muted">รายการล่าสุด (จาก SKY Motorbike, SAGASONIC)</p>
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
            <Zap className="w-5 h-5 text-green-400" />
            <span className="text-app font-medium">ชาร์จ EV</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}

