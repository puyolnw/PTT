import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Store, DollarSign, TrendingUp, Package } from "lucide-react";

const shops = [
  { 
    id: "seven-eleven", 
    name: "เซเว่น (7-Eleven)", 
    path: "/app/shops/seven-eleven",
    color: "red",
    sales: 150000,
    status: "เปิดดำเนินการ"
  },
  { 
    id: "pung-ngee-chiang", 
    name: "ปึงหงี่เชียง", 
    path: "/app/shops/pung-ngee-chiang",
    color: "blue",
    sales: 450000,
    status: "เปิดดำเนินการ"
  },
  { 
    id: "jao-sua", 
    name: "ร้านเจ้าสัว (Chaosua's)", 
    path: "/app/shops/jao-sua",
    color: "green",
    sales: 750000,
    status: "เปิดดำเนินการ"
  },
  { 
    id: "jiang", 
    name: "ร้านเจียง (Jiang Fish Balls)", 
    path: "/app/shops/jiang",
    color: "cyan",
    sales: 540000,
    status: "เปิดดำเนินการ"
  },
  { 
    id: "fit-auto", 
    name: "FIT Auto", 
    path: "/app/shops/fit-auto",
    color: "blue",
    sales: 900000,
    status: "เปิดดำเนินการ"
  },
  { 
    id: "chester", 
    name: "ร้านเชสเตอร์ (Chester's)", 
    path: "/app/shops/chester",
    color: "red",
    sales: 1200000,
    status: "เปิดดำเนินการ"
  },
  { 
    id: "daiso", 
    name: "ร้านไดโซ (Daiso)", 
    path: "/app/shops/daiso",
    color: "cyan",
    sales: 750000,
    status: "เปิดดำเนินการ"
  },
];

const currencyFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 0,
});

export default function ShopsDashboard() {
  const navigate = useNavigate();
  const totalSales = shops.reduce((sum, shop) => sum + shop.sales, 0);

  const colorClasses = {
    red: "bg-red-500/10 hover:bg-red-500/20 border-red-500/30 text-red-400",
    blue: "bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/30 text-blue-400",
    green: "bg-green-500/10 hover:bg-green-500/20 border-green-500/30 text-green-400",
    cyan: "bg-cyan-500/10 hover:bg-cyan-500/20 border-cyan-500/30 text-cyan-400",
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h2 className="text-3xl font-bold text-app mb-2 font-display">ร้านค้าในพื้นที่เช่า</h2>
        <p className="text-muted font-light">
          ภาพรวมร้านค้าทั้งหมดในพื้นที่เช่าของปั๊ม PTT
        </p>
      </motion.div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="panel rounded-2xl p-6 hover:border-ptt-blue/30 transition-all duration-200 shadow-app"
        >
          <div className="flex items-center justify-between mb-5">
            <div className="p-3 rounded-xl bg-gradient-to-br from-ptt-blue to-ptt-cyan">
              <Store className="w-6 h-6 text-app" />
            </div>
            <TrendingUp className="w-5 h-5 text-muted" />
          </div>
          <h3 className="text-muted text-sm mb-2">ร้านทั้งหมด</h3>
          <p className="text-2xl font-bold text-app mb-1">{shops.length}</p>
          <p className="text-sm text-muted">ร้านค้าในพื้นที่เช่า</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="panel rounded-2xl p-6 hover:border-ptt-blue/30 transition-all duration-200 shadow-app"
        >
          <div className="flex items-center justify-between mb-5">
            <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500">
              <DollarSign className="w-6 h-6 text-app" />
            </div>
            <TrendingUp className="w-5 h-5 text-muted" />
          </div>
          <h3 className="text-muted text-sm mb-2">ยอดขายรวม</h3>
          <p className="text-2xl font-bold text-app mb-1">
            {currencyFormatter.format(totalSales)}
          </p>
          <p className="text-sm text-muted">ยอดขายรวมทั้งหมด</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="panel rounded-2xl p-6 hover:border-ptt-blue/30 transition-all duration-200 shadow-app"
        >
          <div className="flex items-center justify-between mb-5">
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
              <Package className="w-6 h-6 text-app" />
            </div>
            <TrendingUp className="w-5 h-5 text-muted" />
          </div>
          <h3 className="text-muted text-sm mb-2">ร้านที่เปิด</h3>
          <p className="text-2xl font-bold text-app mb-1">
            {shops.filter(s => s.status === "เปิดดำเนินการ").length}
          </p>
          <p className="text-sm text-muted">ร้านที่เปิดดำเนินการ</p>
        </motion.div>
      </div>

      {/* Shops List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="panel/40 border border-app rounded-2xl p-6"
      >
        <h3 className="text-lg font-semibold text-app mb-4 font-display">เลือกร้านที่ต้องการจัดการ</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {shops.map((shop) => (
            <button
              key={shop.id}
              onClick={() => navigate(shop.path)}
              className={`flex flex-col items-start gap-3 p-6 ${colorClasses[shop.color as keyof typeof colorClasses]} rounded-xl transition-all hover:scale-105 active:scale-95`}
            >
              <div className="flex items-center gap-3 w-full">
                <Store className="w-6 h-6" />
                <span className="font-semibold text-lg">{shop.name}</span>
              </div>
              <div className="w-full pt-3 border-t border-current/20">
                <p className="text-sm opacity-80 mb-1">ยอดขายเดือนนี้</p>
                <p className="text-xl font-bold">{currencyFormatter.format(shop.sales)}</p>
              </div>
              <div className="w-full">
                <span className="text-xs px-2 py-1 rounded-full bg-current/20 border border-current/30">
                  {shop.status}
                </span>
              </div>
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
