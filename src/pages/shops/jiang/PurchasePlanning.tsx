import { useState } from "react";
import { motion } from "framer-motion";
import {
  Target,
  TrendingUp,
  Package,
  AlertTriangle,
  ShoppingCart,
  BarChart3,
  CheckCircle,
  DollarSign,
} from "lucide-react";
import { useShop } from "@/contexts/ShopContext";

const currencyFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat("th-TH");

// Mock data - วิเคราะห์ยอดขาย 7 วัน
const salesLast7Days = [
  { date: "2024-12-15", item: "ลูกชิ้นปลา", quantity: 50, unit: "กก." },
  { date: "2024-12-14", item: "ลูกชิ้นปลา", quantity: 45, unit: "กก." },
  { date: "2024-12-13", item: "ลูกชิ้นปลา", quantity: 55, unit: "กก." },
  { date: "2024-12-12", item: "ลูกชิ้นปลา", quantity: 48, unit: "กก." },
  { date: "2024-12-11", item: "ลูกชิ้นปลา", quantity: 52, unit: "กก." },
  { date: "2024-12-10", item: "ลูกชิ้นปลา", quantity: 47, unit: "กก." },
  { date: "2024-12-09", item: "ลูกชิ้นปลา", quantity: 50, unit: "กก." },
  { date: "2024-12-15", item: "ปลาสด", quantity: 25, unit: "กก." },
  { date: "2024-12-14", item: "ปลาสด", quantity: 30, unit: "กก." },
  { date: "2024-12-13", item: "ปลาสด", quantity: 28, unit: "กก." },
  { date: "2024-12-12", item: "ปลาสด", quantity: 32, unit: "กก." },
  { date: "2024-12-11", item: "ปลาสด", quantity: 27, unit: "กก." },
  { date: "2024-12-10", item: "ปลาสด", quantity: 29, unit: "กก." },
  { date: "2024-12-09", item: "ปลาสด", quantity: 26, unit: "กก." },
  { date: "2024-12-15", item: "เส้นก๋วยเตี๋ยว", quantity: 30, unit: "กก." },
  { date: "2024-12-14", item: "เส้นก๋วยเตี๋ยว", quantity: 28, unit: "กก." },
  { date: "2024-12-13", item: "เส้นก๋วยเตี๋ยว", quantity: 32, unit: "กก." },
  { date: "2024-12-12", item: "เส้นก๋วยเตี๋ยว", quantity: 29, unit: "กก." },
  { date: "2024-12-11", item: "เส้นก๋วยเตี๋ยว", quantity: 31, unit: "กก." },
  { date: "2024-12-10", item: "เส้นก๋วยเตี๋ยว", quantity: 27, unit: "กก." },
  { date: "2024-12-09", item: "เส้นก๋วยเตี๋ยว", quantity: 30, unit: "กก." },
];

// Calculate average daily usage
const calculateAverageUsage = (itemName: string) => {
  const itemSales = salesLast7Days.filter(s => s.item === itemName);
  const total = itemSales.reduce((sum, s) => sum + s.quantity, 0);
  return total / 7; // Average per day
};

// Current stock data
const currentStock = [
  { name: "ลูกชิ้นปลา", quantity: 50, unit: "กก.", threshold: 100, cost: 200 },
  { name: "ปลาสด", quantity: 25, unit: "กก.", threshold: 50, cost: 300 },
  { name: "เส้นก๋วยเตี๋ยว", quantity: 30, unit: "กก.", threshold: 80, cost: 50 },
  { name: "น้ำซุป", quantity: 100, unit: "ลิตร", threshold: 150, cost: 30 },
  { name: "ผักกาด", quantity: 15, unit: "กก.", threshold: 30, cost: 40 },
];

// Generate purchase recommendations
const generateRecommendations = () => {
  return currentStock.map(item => {
    const avgDailyUsage = calculateAverageUsage(item.name);
    const daysUntilThreshold = item.quantity / avgDailyUsage;
    const recommendedDays = 14; // Recommend 14 days stock
    const recommendedQuantity = Math.ceil(avgDailyUsage * recommendedDays);
    const currentStockPercentage = (item.quantity / item.threshold) * 100;
    
    let priority = "normal";
    let reason = "";
    
    if (currentStockPercentage <= 20) {
      priority = "critical";
      reason = "สต็อกวิกฤต (เหลือน้อยกว่า 20%)";
    } else if (currentStockPercentage <= 50) {
      priority = "high";
      reason = "สต็อกต่ำกว่าเกณฑ์ (เหลือน้อยกว่า 50%)";
    } else if (daysUntilThreshold < 7) {
      priority = "high";
      reason = `สต็อกจะหมดภายใน ${Math.ceil(daysUntilThreshold)} วัน`;
    } else {
      priority = "normal";
      reason = "สต็อกปกติ แต่แนะนำสั่งเพื่อความปลอดภัย";
    }
    
    return {
      ...item,
      avgDailyUsage,
      daysUntilThreshold: Math.ceil(daysUntilThreshold),
      recommendedQuantity,
      estimatedCost: recommendedQuantity * item.cost,
      priority,
      reason,
    };
  });
};

export default function PurchasePlanning() {
  const { currentShop } = useShop();
  const shopName = currentShop?.name || "ร้านเจียง (Jiang Fish Balls)";
  
  const [selectedPeriod, setSelectedPeriod] = useState<7 | 14 | 30>(7);
  const recommendations = generateRecommendations();
  const sortedRecommendations = [...recommendations].sort((a, b) => {
    const priorityOrder = { critical: 0, high: 1, normal: 2 };
    return priorityOrder[a.priority as keyof typeof priorityOrder] - priorityOrder[b.priority as keyof typeof priorityOrder];
  });

  const totalEstimatedCost = recommendations.reduce((sum, r) => sum + r.estimatedCost, 0);
  const criticalItems = recommendations.filter(r => r.priority === "critical").length;
  const highPriorityItems = recommendations.filter(r => r.priority === "high").length;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h2 className="text-3xl font-bold text-app mb-2 font-display">วางแผนการสั่งซื้ออัตโนมัติ - {shopName}</h2>
        <p className="text-muted font-light">
          วิเคราะห์ยอดขาย 7 วัน → แนะนำจำนวนสั่งซื้ออัตโนมัติ (ป้องกันสินค้าขาด)
        </p>
      </motion.div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="panel rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <Target className="w-8 h-8 text-ptt-cyan" />
            <span className="text-sm text-muted">รายการแนะนำ</span>
          </div>
          <p className="text-2xl font-bold text-app">{recommendations.length}</p>
          <p className="text-sm text-muted">สินค้า</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="panel rounded-2xl p-6 border-2 border-red-500/30"
        >
          <div className="flex items-center justify-between mb-4">
            <AlertTriangle className="w-8 h-8 text-red-400" />
            <span className="text-sm text-muted">วิกฤต</span>
          </div>
          <p className="text-2xl font-bold text-red-400">{criticalItems}</p>
          <p className="text-sm text-muted">รายการ</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="panel rounded-2xl p-6 border-2 border-orange-500/30"
        >
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="w-8 h-8 text-orange-400" />
            <span className="text-sm text-muted">ความสำคัญสูง</span>
          </div>
          <p className="text-2xl font-bold text-orange-400">{highPriorityItems}</p>
          <p className="text-sm text-muted">รายการ</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="panel rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="w-8 h-8 text-emerald-400" />
            <span className="text-sm text-muted">มูลค่าสั่งซื้อ</span>
          </div>
          <p className="text-2xl font-bold text-app">
            {currencyFormatter.format(totalEstimatedCost)}
          </p>
          <p className="text-sm text-muted">ประมาณการ</p>
        </motion.div>
      </div>

      {/* Period Selector */}
      <div className="flex gap-2">
        {[7, 14, 30].map((period) => (
          <button
            key={period}
            onClick={() => setSelectedPeriod(period as 7 | 14 | 30)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedPeriod === period
                ? "bg-ptt-blue text-white"
                : "bg-soft text-app hover:bg-app/10"
            }`}
          >
            วิเคราะห์ {period} วัน
          </button>
        ))}
      </div>

      {/* Recommendations List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="panel rounded-2xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-app">คำแนะนำการสั่งซื้อ</h3>
            <p className="text-sm text-muted">
              วิเคราะห์จากยอดขาย {selectedPeriod} วันล่าสุด
            </p>
          </div>
          <BarChart3 className="w-6 h-6 text-muted" />
        </div>
        <div className="space-y-4">
          {sortedRecommendations.map((item) => (
            <div
              key={item.name}
              className={`p-4 rounded-xl border-2 ${
                item.priority === "critical"
                  ? "bg-red-500/10 border-red-500/30"
                  : item.priority === "high"
                  ? "bg-orange-500/10 border-orange-500/30"
                  : "bg-soft border-app"
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Package className="w-5 h-5 text-ptt-cyan" />
                    <h4 className="font-semibold text-app">{item.name}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.priority === "critical"
                        ? "bg-red-500/20 text-red-400 border border-red-500/30"
                        : item.priority === "high"
                        ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                        : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    }`}>
                      {item.priority === "critical" ? "วิกฤต" : item.priority === "high" ? "สำคัญสูง" : "ปกติ"}
                    </span>
                  </div>
                  <p className="text-sm text-muted mb-2">{item.reason}</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                    <div>
                      <p className="text-xs text-muted">สต็อกปัจจุบัน</p>
                      <p className="text-sm font-medium text-app">
                        {numberFormatter.format(item.quantity)} {item.unit}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted">ใช้เฉลี่ย/วัน</p>
                      <p className="text-sm font-medium text-app">
                        {item.avgDailyUsage.toFixed(1)} {item.unit}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted">จะหมดใน</p>
                      <p className="text-sm font-medium text-orange-400">
                        {item.daysUntilThreshold} วัน
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted">เกณฑ์ต่ำสุด</p>
                      <p className="text-sm font-medium text-muted">
                        {numberFormatter.format(item.threshold)} {item.unit}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="text-right ml-4">
                  <div className="bg-ptt-blue/10 border border-ptt-blue/30 rounded-xl p-4 mb-2">
                    <p className="text-xs text-muted mb-1">แนะนำสั่ง</p>
                    <p className="text-xl font-bold text-ptt-cyan">
                      {numberFormatter.format(item.recommendedQuantity)} {item.unit}
                    </p>
                    <p className="text-xs text-muted mt-1">
                      {currencyFormatter.format(item.estimatedCost)}
                    </p>
                  </div>
                  <button className="w-full px-4 py-2 bg-ptt-blue text-white rounded-lg hover:bg-ptt-blue/90 transition-colors text-sm">
                    สร้าง PO
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Sales Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="panel rounded-2xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-app">วิเคราะห์ยอดขาย {selectedPeriod} วันล่าสุด</h3>
            <p className="text-sm text-muted">ข้อมูลที่ใช้ในการคำนวณ</p>
          </div>
          <TrendingUp className="w-6 h-6 text-muted" />
        </div>
        <div className="space-y-3">
          {Array.from(new Set(salesLast7Days.map(s => s.item))).map((itemName) => {
            const itemSales = salesLast7Days.filter(s => s.item === itemName);
            const total = itemSales.reduce((sum, s) => sum + s.quantity, 0);
            const avg = total / itemSales.length;
            return (
              <div key={itemName} className="p-3 bg-soft rounded-lg border border-app">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-app">{itemName}</p>
                    <p className="text-xs text-muted">
                      ใช้ไป {total} {itemSales[0]?.unit} ใน {itemSales.length} วัน
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-ptt-cyan">
                      เฉลี่ย {avg.toFixed(1)} {itemSales[0]?.unit}/วัน
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="panel/40 border border-app rounded-2xl p-6"
      >
        <h3 className="text-lg font-semibold text-app mb-4 font-display">การดำเนินการด่วน</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center gap-3 p-4 bg-ptt-blue/10 hover:bg-ptt-blue/20 border border-ptt-blue/30 rounded-xl transition-colors">
            <ShoppingCart className="w-5 h-5 text-ptt-cyan" />
            <span className="text-app font-medium">สร้าง PO ทั้งหมด</span>
          </button>
          <button className="flex items-center gap-3 p-4 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 rounded-xl transition-colors">
            <AlertTriangle className="w-5 h-5 text-orange-400" />
            <span className="text-app font-medium">สั่งซื้อรายการวิกฤต</span>
          </button>
          <button className="flex items-center gap-3 p-4 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-xl transition-colors">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <span className="text-app font-medium">ส่งออกรายงาน</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}

