import { motion } from "framer-motion";
import {
  DollarSign,
  TrendingUp,
  Package,
  ShoppingBag,
  ShoppingCart,
  AlertTriangle,
  Leaf,
  Calendar,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
  Upload,
} from "lucide-react";
import { useShop } from "@/contexts/ShopContext";

const currencyFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat("th-TH");

const mockSalesData = {
  today: 32000,
  yesterday: 28000,
  thisMonth: 610000,
  lastMonth: 580000,
  mix: [
    { name: "ผ้าไหมทอมือ", amount: 180000, percentage: 30, badge: "OTOP 5 ดาว" },
    { name: "เครื่องปั้นดินเผา", amount: 120000, percentage: 20, badge: "แนะนำ" },
    { name: "สมุนไพรอบแห้ง", amount: 90000, percentage: 15, badge: "สุขภาพ" },
    { name: "ของฝากพื้นบ้าน", amount: 220000, percentage: 35, badge: "Top Seller" },
  ],
};

const mockStockData = [
  {
    name: "ผ้าไหมยกดอก",
    quantity: 42,
    unit: "ผืน",
    lowStock: false,
    expiry: "2025-12-31",
    supplier: "กลุ่มทอผ้าบ้านโคก",
  },
  {
    name: "ข้าวแต๋นน้ำแตงโม",
    quantity: 18,
    unit: "ลัง",
    lowStock: true,
    expiry: "2024-12-25",
    supplier: "วิสาหกิจแม่สมพร",
  },
  {
    name: "เครื่องปั้นลายคราม",
    quantity: 25,
    unit: "ชุด",
    lowStock: false,
    expiry: "2026-03-15",
    supplier: "ชุมชนบ้านด่านเกวียน",
  },
  {
    name: "ชาสมุนไพรใบหม่อน",
    quantity: 12,
    unit: "ลัง",
    lowStock: true,
    expiry: "2025-01-20",
    supplier: "กลุ่มสมุนไพรแม่แจ่ม",
  },
];

const mockRecentOrders = [
  {
    id: "ORD-24001",
    supplier: "กลุ่มทอผ้าบ้านโคก",
    item: "ผ้าไหมมัดหมี่ 30 ผืน",
    amount: 120000,
    date: "2024-12-15",
    status: "รับสินค้าแล้ว",
  },
  {
    id: "ORD-24002",
    supplier: "ชุมชนบ้านด่านเกวียน",
    item: "เครื่องปั้น 20 ชุด",
    amount: 90000,
    date: "2024-12-14",
    status: "รอส่งมอบ",
  },
  {
    id: "ORD-24003",
    supplier: "กลุ่มสมุนไพรแม่แจ่ม",
    item: "ชาสมุนไพร 40 ลัง",
    amount: 65000,
    date: "2024-12-13",
    status: "กำลังจัดส่ง",
  },
];

const mockVisitors = [
  { channel: "ลูกค้าเดินทาง", value: 55, trend: "+8%" },
  { channel: "คูปอง PTT", value: 25, trend: "+3%" },
  { channel: "สั่งล่วงหน้า", value: 12, trend: "-1%" },
  { channel: "ออนไลน์ (FB/LINE)", value: 8, trend: "+10%" },
];

export default function OtopDashboard() {
  const { currentShop } = useShop();
  const shopName = currentShop?.name || "ร้าน OTOP ชุมชน";

  const salesChange =
    ((mockSalesData.today - mockSalesData.yesterday) / mockSalesData.yesterday) * 100;
  const monthlyChange =
    ((mockSalesData.thisMonth - mockSalesData.lastMonth) / mockSalesData.lastMonth) * 100;
  const lowStockItems = mockStockData.filter((item) => item.lowStock);

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
      title: "สินค้าพื้นบ้านเด่น",
      value: mockSalesData.mix[0].name,
      subtitle: `${mockSalesData.mix[0].percentage}% ของยอดขายวันนี้`,
      icon: Leaf,
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
          ภาพรวมยอดขาย สต็อก และการเตรียมสินค้าท้องถิ่นจากชุมชนเครือข่าย OTOP ที่อยู่ในพื้นที่ปั๊ม
        </p>
        <p className="text-xs text-muted/70">
          อัปเดตล่าสุด:{" "}
          {new Date().toLocaleDateString("th-TH", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </motion.div>

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
                <div
                  className={`flex items-center gap-1 text-sm font-medium ${
                    stat.change.startsWith("+") ? "text-emerald-400" : "text-red-400"
                  }`}
                >
                  {stat.change.startsWith("+") ? (
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

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 xl:grid-cols-3 gap-6"
      >
        <div className="panel rounded-2xl p-6 shadow-app xl:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-semibold text-app">ช่องทางจำหน่าย</h3>
              <p className="text-sm text-muted">ลูกค้าที่มาเยือนร้าน OTOP ในพื้นที่ปั๊ม</p>
            </div>
            <ShoppingBag className="w-6 h-6 text-muted" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mockVisitors.map((channel) => (
              <div
                key={channel.channel}
                className="p-4 border border-app rounded-xl flex items-center justify-between bg-soft"
              >
                <div>
                  <p className="text-sm text-muted">{channel.channel}</p>
                  <p className="text-2xl font-bold text-app">
                    {numberFormatter.format(channel.value)}%
                  </p>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    channel.trend.startsWith("+")
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : "bg-red-500/10 text-red-400 border border-red-500/20"
                  }`}
                >
                  {channel.trend}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="panel rounded-2xl p-6 shadow-app space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-app">ยอดขายตามหมวดสินค้า</h3>
            <FileText className="w-5 h-5 text-muted" />
          </div>
          <div className="space-y-3">
            {mockSalesData.mix.map((item) => (
              <div
                key={item.name}
                className="p-4 rounded-xl border border-app flex items-center justify-between bg-soft"
              >
                <div>
                  <p className="font-medium text-app">{item.name}</p>
                  <p className="text-xs text-muted">{item.badge}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-app">{currencyFormatter.format(item.amount)}</p>
                  <p className="text-xs text-muted">{item.percentage}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="panel rounded-2xl p-6 shadow-app xl:col-span-2"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-semibold text-app">สต็อกสินค้า OTOP</h3>
              <p className="text-sm text-muted">ตรวจสอบสถานะสินค้าพื้นบ้านและรับแจ้งเตือน</p>
            </div>
            <Package className="w-6 h-6 text-muted" />
          </div>
          <div className="space-y-3">
            {mockStockData.map((item) => (
              <div
                key={item.name}
                className={`flex items-center justify-between p-4 rounded-xl border ${
                  item.lowStock ? "bg-orange-500/10 border-orange-500/30" : "bg-soft border-app"
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-app">{item.name}</p>
                    {item.lowStock && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-500 border border-orange-500/30">
                        ใกล้หมด
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted">
                    คงเหลือ {numberFormatter.format(item.quantity)} {item.unit} • หมดอายุ{" "}
                    {new Date(item.expiry).toLocaleDateString("th-TH")}
                  </p>
                  <p className="text-xs text-muted">โดย {item.supplier}</p>
                </div>
                <Leaf className="w-8 h-8 text-emerald-400" />
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="panel rounded-2xl p-6 shadow-app"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-semibold text-app">คำสั่งซื้อสินค้าชุมชน</h3>
              <p className="text-sm text-muted">อัปเดตการรับสินค้าจากเครือข่าย OTOP</p>
            </div>
            <ShoppingCart className="w-6 h-6 text-muted" />
          </div>
          <div className="space-y-3">
            {mockRecentOrders.map((order) => (
              <div key={order.id} className="p-4 rounded-xl border border-app bg-soft">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-app">{order.item}</p>
                    <p className="text-xs text-muted">{order.supplier}</p>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      order.status === "รับสินค้าแล้ว"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                        : "bg-ptt-blue/10 text-ptt-cyan border border-ptt-blue/30"
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-muted">
                    {new Date(order.date).toLocaleDateString("th-TH")}
                  </span>
                  <span className="font-semibold text-app">
                    {currencyFormatter.format(order.amount)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="panel/40 border border-app rounded-2xl p-6"
      >
        <h3 className="text-lg font-semibold text-app mb-4 font-display">การดำเนินการด่วน</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button className="flex items-center gap-3 p-4 bg-ptt-blue/10 hover:bg-ptt-blue/20 border border-ptt-blue/30 rounded-xl transition-colors">
            <Upload className="w-5 h-5 text-ptt-cyan" />
            <span className="text-app font-medium">นำเข้ายอดขาย (Excel)</span>
          </button>
          <button className="flex items-center gap-3 p-4 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-xl transition-colors">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            <span className="text-app font-medium">บันทึกยอดขายหน้าร้าน</span>
          </button>
          <button className="flex items-center gap-3 p-4 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 rounded-xl transition-colors">
            <Calendar className="w-5 h-5 text-purple-400" />
            <span className="text-app font-medium">วางแผนกิจกรรมชุมชน</span>
          </button>
          <button className="flex items-center gap-3 p-4 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 rounded-xl transition-colors">
            <FileText className="w-5 h-5 text-orange-400" />
            <span className="text-app font-medium">ออกรายงาน OTOP</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}


