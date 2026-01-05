import { useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  Download,
  TrendingUp,
  Building2,
  CreditCard,
} from "lucide-react";
import { useShop } from "@/contexts/ShopContext";

const currencyFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 0,
});

// Mock data สำหรับร้านมอเตอร์ไซค์ไฟฟ้า - รองรับหลายสาขาและแยกตามสินค้า
const branches = ["สาขา A", "สาขา B", "สาขา C", "สาขา D", "สำนักงานใหญ่"];

const profitLossDataByBranch: Record<string, {
  revenue: number;
  cost: number;
  profit: number;
  expenses: number;
  rent: number;
  netProfit: number;
  byProduct: {
    scooter: number;
    motorbike: number;
    bicycle: number;
    parts: number;
  };
}> = {
  "สาขา A": {
    revenue: 450000,
    cost: 225000,
    profit: 225000,
    expenses: 15000,
    rent: 3500,
    netProfit: 206500,
    byProduct: { scooter: 270000, motorbike: 140000, bicycle: 30000, parts: 10000 },
  },
  "สาขา B": {
    revenue: 400000,
    cost: 200000,
    profit: 200000,
    expenses: 13000,
    rent: 3500,
    netProfit: 183500,
    byProduct: { scooter: 240000, motorbike: 120000, bicycle: 30000, parts: 10000 },
  },
  "สาขา C": {
    revenue: 360000,
    cost: 180000,
    profit: 180000,
    expenses: 12000,
    rent: 3500,
    netProfit: 164500,
    byProduct: { scooter: 216000, motorbike: 108000, bicycle: 27000, parts: 9000 },
  },
  "สาขา D": {
    revenue: 330000,
    cost: 165000,
    profit: 165000,
    expenses: 11000,
    rent: 3500,
    netProfit: 150500,
    byProduct: { scooter: 198000, motorbike: 99000, bicycle: 25000, parts: 8000 },
  },
  "สำนักงานใหญ่": {
    revenue: 500000,
    cost: 250000,
    profit: 250000,
    expenses: 18000,
    rent: 3500,
    netProfit: 228500,
    byProduct: { scooter: 300000, motorbike: 150000, bicycle: 40000, parts: 10000 },
  },
};

// Calculate totals across all branches
const totalProfitLoss = Object.values(profitLossDataByBranch).reduce((acc, data) => {
  acc.revenue += data.revenue;
  acc.cost += data.cost;
  acc.profit += data.profit;
  acc.expenses += data.expenses;
  acc.rent += data.rent;
  acc.netProfit += data.netProfit;
  return acc;
}, { revenue: 0, cost: 0, profit: 0, expenses: 0, rent: 0, netProfit: 0 });

const topSellingItems = [
  { name: "สกู๊ตเตอร์ไฟฟ้า 800W", sales: 270000, cost: 200000, profit: 70000, category: "สกู๊ตเตอร์ไฟฟ้า", brand: "SKY Motorbike", trend: "+25%", promotion: "ผ่อน 0% 12 เดือน" },
  { name: "มอเตอร์ไซค์ไฟฟ้า 800W", sales: 140000, cost: 112000, profit: 28000, category: "มอเตอร์ไซค์ไฟฟ้า", brand: "SKY Motorbike", trend: "+15%" },
  { name: "จักรยานไฟฟ้า Sabaie Ice Cream", sales: 75000, cost: 50000, profit: 25000, category: "จักรยานไฟฟ้า", brand: "Sabaie Bike", trend: "+20%" },
  { name: "แบตเตอรี่ Graphene 60V", sales: 40000, cost: 30000, profit: 10000, category: "อะไหล่ EV", brand: "SAGASONIC", trend: "+10%" },
];

export default function Reports() {
  const { currentShop } = useShop();
  const shopName = currentShop?.name || "ร้านมอเตอร์ไซค์ไฟฟ้า (EV Motorbike Shop)";

  const [selectedBranch, setSelectedBranch] = useState<string>("ทั้งหมด");
  const [reportPeriod, setReportPeriod] = useState<string>("เดือนนี้");

  const displayData = selectedBranch === "ทั้งหมด"
    ? totalProfitLoss
    : Object.entries(profitLossDataByBranch).find(([key]) => key === selectedBranch)?.[1] || totalProfitLoss;

  const displayByProduct = selectedBranch === "ทั้งหมด"
    ? Object.values(profitLossDataByBranch).reduce((acc, data) => {
      acc.scooter += data.byProduct.scooter;
      acc.motorbike += data.byProduct.motorbike;
      acc.bicycle += data.byProduct.bicycle;
      acc.parts += data.byProduct.parts;
      return acc;
    }, { scooter: 0, motorbike: 0, bicycle: 0, parts: 0 })
    : Object.entries(profitLossDataByBranch).find(([key]) => key === selectedBranch)?.[1]?.byProduct || { scooter: 0, motorbike: 0, bicycle: 0, parts: 0 };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h2 className="text-3xl font-bold text-app mb-2 font-display">รายงาน - {shopName}</h2>
        <p className="text-muted font-light">
          ดูรายงานกำไรและขาดทุน เปรียบเทียบสาขา วิเคราะห์สินค้าขายดี (สกู๊ตเตอร์ไฟฟ้า 800W ฮิต) รายงานยอดขายรายวัน/เดือน/ปี แยกตามสินค้า (มอเตอร์ไซค์ไฟฟ้า vs จักรยานไฟฟ้า) เปรียบเทียบช่วงเวลา
        </p>
      </motion.div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex gap-4">
          <div>
            <label htmlFor="branch-select" className="block text-sm font-medium text-app mb-2">สาขา</label>
            <select
              id="branch-select"
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="px-4 py-2 bg-soft border border-app rounded-lg text-app"
            >
              <option value="ทั้งหมด">ทั้งหมด</option>
              {branches.map((branch) => (
                <option key={branch} value={branch}>
                  {branch}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="period-select" className="block text-sm font-medium text-app mb-2">ช่วงเวลา</label>
            <select
              id="period-select"
              value={reportPeriod}
              onChange={(e) => setReportPeriod(e.target.value)}
              className="px-4 py-2 bg-soft border border-app rounded-lg text-app"
            >
              <option value="วันนี้">วันนี้</option>
              <option value="สัปดาห์นี้">สัปดาห์นี้</option>
              <option value="เดือนนี้">เดือนนี้</option>
              <option value="ปีนี้">ปีนี้</option>
            </select>
          </div>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-ptt-blue text-white rounded-lg hover:bg-ptt-blue/90 transition-colors">
          <Download className="w-4 h-4" />
          <span>ส่งออกรายงาน</span>
        </button>
      </div>

      {/* Profit & Loss Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="panel rounded-2xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-app">
            รายงานกำไรและขาดทุน {selectedBranch !== "ทั้งหมด" && `- ${selectedBranch}`}
          </h3>
          <BarChart3 className="w-6 h-6 text-muted" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
            <p className="text-sm text-muted mb-1">รายรับ</p>
            <p className="text-2xl font-bold text-emerald-400">
              {currencyFormatter.format(displayData.revenue)}
            </p>
          </div>
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
            <p className="text-sm text-muted mb-1">ต้นทุน</p>
            <p className="text-2xl font-bold text-red-400">
              {currencyFormatter.format(displayData.cost)}
            </p>
          </div>
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
            <p className="text-sm text-muted mb-1">กำไรขั้นต้น</p>
            <p className="text-2xl font-bold text-blue-400">
              {currencyFormatter.format(displayData.profit)}
            </p>
          </div>
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
            <p className="text-sm text-muted mb-1">รายจ่าย</p>
            <p className="text-2xl font-bold text-orange-400">
              {currencyFormatter.format(displayData.expenses)}
            </p>
          </div>
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
            <p className="text-sm text-muted mb-1">ค่าเช่า (M6)</p>
            <p className="text-2xl font-bold text-purple-400">
              {currencyFormatter.format(displayData.rent)}
            </p>
          </div>
          <div className="bg-ptt-blue/10 border border-ptt-blue/30 rounded-xl p-4">
            <p className="text-sm text-muted mb-1">กำไรสุทธิ</p>
            <p className="text-2xl font-bold text-ptt-cyan">
              {currencyFormatter.format(displayData.netProfit)}
            </p>
            <p className="text-xs text-muted mt-1">
              กำไรสูงจากโปรโมชันผ่อน 0% 12 เดือน
            </p>
          </div>
        </div>
      </motion.div>

      {/* Sales by Product */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="panel rounded-2xl p-6"
      >
        <h3 className="text-xl font-semibold text-app mb-4">ยอดขายแยกตามสินค้า (สกู๊ตเตอร์ไฟฟ้า 60%)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
            <p className="text-sm text-muted mb-1">สกู๊ตเตอร์ไฟฟ้า</p>
            <p className="text-2xl font-bold text-orange-400">
              {currencyFormatter.format(displayByProduct.scooter)}
            </p>
            <p className="text-xs text-muted mt-1">
              {displayData.revenue > 0 ? ((displayByProduct.scooter / displayData.revenue) * 100).toFixed(1) : 0}% ของยอดขาย
            </p>
          </div>
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
            <p className="text-sm text-muted mb-1">มอเตอร์ไซค์ไฟฟ้า</p>
            <p className="text-2xl font-bold text-blue-400">
              {currencyFormatter.format(displayByProduct.motorbike)}
            </p>
            <p className="text-xs text-muted mt-1">
              {displayData.revenue > 0 ? ((displayByProduct.motorbike / displayData.revenue) * 100).toFixed(1) : 0}% ของยอดขาย
            </p>
          </div>
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
            <p className="text-sm text-muted mb-1">จักรยานไฟฟ้า</p>
            <p className="text-2xl font-bold text-purple-400">
              {currencyFormatter.format(displayByProduct.bicycle)}
            </p>
            <p className="text-xs text-muted mt-1">
              {displayData.revenue > 0 ? ((displayByProduct.bicycle / displayData.revenue) * 100).toFixed(1) : 0}% ของยอดขาย
            </p>
          </div>
          <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4">
            <p className="text-sm text-muted mb-1">อะไหล่ EV</p>
            <p className="text-2xl font-bold text-cyan-400">
              {currencyFormatter.format(displayByProduct.parts)}
            </p>
            <p className="text-xs text-muted mt-1">
              {displayData.revenue > 0 ? ((displayByProduct.parts / displayData.revenue) * 100).toFixed(1) : 0}% ของยอดขาย
            </p>
          </div>
        </div>
      </motion.div>

      {/* Branch Comparison */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="panel rounded-2xl p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-app">เปรียบเทียบสาขา</h3>
          <Building2 className="w-6 h-6 text-muted" />
        </div>
        <div className="space-y-3">
          {branches.map((branch) => {
            const data = Object.entries(profitLossDataByBranch).find(([key]) => key === branch)?.[1] || profitLossDataByBranch["สาขา A"];
            const maxRevenue = Math.max(...Object.values(profitLossDataByBranch).map(d => d.revenue));
            const percentage = (data.revenue / maxRevenue) * 100;
            return (
              <div key={branch} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-app font-medium">{branch}</span>
                  <span className="text-app font-semibold">
                    {currencyFormatter.format(data.revenue)}
                  </span>
                </div>
                <div className="w-full h-2 bg-soft rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-ptt-blue to-ptt-cyan w-[var(--revenue-percentage)]"
                    style={{ "--revenue-percentage": `${percentage}%` } as React.CSSProperties}
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-muted">
                  <span>กำไรสุทธิ: {currencyFormatter.format(data.netProfit)}</span>
                  <span>ค่าเช่า: {currencyFormatter.format(data.rent)}/เดือน</span>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Top Selling Items */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="panel rounded-2xl p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-app">สินค้าขายดี (ฮิต: สกู๊ตเตอร์ไฟฟ้า 800W)</h3>
          <TrendingUp className="w-6 h-6 text-muted" />
        </div>
        <div className="space-y-3">
          {topSellingItems.map((item, index) => (
            <div
              key={item.name}
              className="flex items-center justify-between p-4 bg-soft rounded-xl border border-app"
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${index === 0 ? "bg-ptt-blue/20 text-ptt-cyan" :
                  index === 1 ? "bg-emerald-500/20 text-emerald-400" :
                    "bg-muted/20 text-muted"
                  }`}>
                  <span className="text-sm font-bold">{index + 1}</span>
                </div>
                <div>
                  <p className="font-medium text-app">{item.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-ptt-blue/10 text-ptt-cyan border border-ptt-blue/30">
                      {item.category}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/30">
                      {item.brand}
                    </span>
                    {item.promotion && (
                      <div className="flex items-center gap-1">
                        <CreditCard className="w-3 h-3 text-green-400" />
                        <span className="text-xs text-green-400">{item.promotion}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-app">{currencyFormatter.format(item.sales)}</p>
                <p className="text-sm text-muted">กำไร: {currencyFormatter.format(item.profit)}</p>
                <div className="flex items-center gap-1 text-xs text-emerald-400 mt-1">
                  <TrendingUp className="w-3 h-3" />
                  {item.trend}
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

