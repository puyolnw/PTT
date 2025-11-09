import { motion } from "framer-motion";
import { DollarSign, RefreshCw, TrendingUp, TrendingDown, Calendar, Settings, AlertCircle } from "lucide-react";
import { useState } from "react";

const currencyFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 2,
});

// Mock data - Price Management
const mockPriceData = {
  lastUpdate: "2024-12-15T06:00:00",
  autoUpdate: true,
  updateTime: "06:00",
  source: "PTT API",
  prices: [
    {
      id: "1",
      fuelType: "Gasohol 95",
      currentPrice: 40.00,
      previousPrice: 39.50,
      change: 0.50,
      changePercent: 1.27,
      status: "updated",
    },
    {
      id: "2",
      fuelType: "Diesel",
      currentPrice: 35.00,
      previousPrice: 35.20,
      change: -0.20,
      changePercent: -0.57,
      status: "updated",
    },
    {
      id: "3",
      fuelType: "Premium Gasohol 95",
      currentPrice: 42.50,
      previousPrice: 42.00,
      change: 0.50,
      changePercent: 1.19,
      status: "updated",
    },
    {
      id: "4",
      fuelType: "E20",
      currentPrice: 38.00,
      previousPrice: 38.00,
      change: 0.00,
      changePercent: 0.00,
      status: "no_change",
    },
    {
      id: "5",
      fuelType: "E85",
      currentPrice: 32.00,
      previousPrice: 32.00,
      change: 0.00,
      changePercent: 0.00,
      status: "no_change",
    },
    {
      id: "6",
      fuelType: "Gasohol 91",
      currentPrice: 39.00,
      previousPrice: 38.50,
      change: 0.50,
      changePercent: 1.30,
      status: "updated",
    },
  ],
};

export default function PriceManagement() {
  const [autoUpdate, setAutoUpdate] = useState(mockPriceData.autoUpdate);
  const [updateTime, setUpdateTime] = useState(mockPriceData.updateTime);

  const updatedCount = mockPriceData.prices.filter(p => p.status === "updated").length;
  const totalChange = mockPriceData.prices.reduce((sum, p) => sum + p.change, 0);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h2 className="text-3xl font-bold text-app mb-2 font-display">ปรับราคาขายปลีกอัตโนมัติ</h2>
        <p className="text-muted font-light">
          ดึงราคาจาก PTT ทุกเช้า → ปรับราคาหน้าปั๊ม + ระบบ
        </p>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="panel rounded-2xl p-6 shadow-app"
        >
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="w-6 h-6 text-ptt-cyan" />
            <span className="text-xs text-muted">อัปเดตล่าสุด</span>
          </div>
          <p className="text-sm font-semibold text-app">
            {new Date(mockPriceData.lastUpdate).toLocaleString("th-TH")}
          </p>
          <p className="text-xs text-muted mt-1">จาก {mockPriceData.source}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="panel rounded-2xl p-6 shadow-app"
        >
          <div className="flex items-center justify-between mb-4">
            <RefreshCw className="w-6 h-6 text-blue-400" />
            <span className="text-xs text-muted">อัปเดตแล้ว</span>
          </div>
          <p className="text-2xl font-bold text-blue-400">
            {updatedCount}
          </p>
          <p className="text-xs text-muted mt-1">ชนิดน้ำมัน</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`panel rounded-2xl p-6 shadow-app ${
            totalChange > 0 ? "border-2 border-red-500/30" : totalChange < 0 ? "border-2 border-emerald-500/30" : ""
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            {totalChange > 0 ? (
              <TrendingUp className="w-6 h-6 text-red-400" />
            ) : totalChange < 0 ? (
              <TrendingDown className="w-6 h-6 text-emerald-400" />
            ) : (
              <DollarSign className="w-6 h-6 text-muted" />
            )}
            <span className="text-xs text-muted">การเปลี่ยนแปลง</span>
          </div>
          <p className={`text-2xl font-bold ${
            totalChange > 0 ? "text-red-400" : totalChange < 0 ? "text-emerald-400" : "text-app"
          }`}>
            {totalChange > 0 ? "+" : ""}
            {currencyFormatter.format(totalChange)}
          </p>
          <p className="text-xs text-muted mt-1">เฉลี่ยต่อลิตร</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="panel rounded-2xl p-6 shadow-app"
        >
          <div className="flex items-center justify-between mb-4">
            <Settings className="w-6 h-6 text-purple-400" />
            <span className="text-xs text-muted">อัปเดตอัตโนมัติ</span>
          </div>
          <p className={`text-2xl font-bold ${autoUpdate ? "text-emerald-400" : "text-muted"}`}>
            {autoUpdate ? "เปิด" : "ปิด"}
          </p>
          <p className="text-xs text-muted mt-1">เวลา: {updateTime}</p>
        </motion.div>
      </div>

      {/* Price List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="panel rounded-2xl p-6 shadow-app"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-app">ราคาน้ำมันปัจจุบัน</h3>
            <p className="text-sm text-muted">
              อัปเดตล่าสุด: {new Date(mockPriceData.lastUpdate).toLocaleString("th-TH")}
            </p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-ptt-blue/10 hover:bg-ptt-blue/20 border border-ptt-blue/30 rounded-xl text-ptt-cyan transition-colors">
            <RefreshCw className="w-5 h-5" />
            <span>อัปเดตราคา</span>
          </button>
        </div>
        <div className="space-y-3">
          {mockPriceData.prices.map((price) => (
            <div
              key={price.id}
              className={`p-4 rounded-xl border-2 ${
                price.status === "updated"
                  ? price.change > 0
                    ? "bg-red-500/10 border-red-500/30"
                    : "bg-emerald-500/10 border-emerald-500/30"
                  : "bg-soft border-app"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-semibold text-app">{price.fuelType}</h4>
                    {price.status === "updated" && (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        price.change > 0
                          ? "bg-red-500/20 text-red-400 border border-red-500/30"
                          : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      }`}>
                        {price.change > 0 ? "เพิ่มขึ้น" : "ลดลง"}
                      </span>
                    )}
                    {price.status === "no_change" && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-500/20 text-gray-400 border border-gray-500/30">
                        ไม่เปลี่ยนแปลง
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                    <div>
                      <span className="text-muted">ราคาปัจจุบัน: </span>
                      <span className="font-bold text-app">
                        {currencyFormatter.format(price.currentPrice)}/ลิตร
                      </span>
                    </div>
                    <div>
                      <span className="text-muted">ราคาก่อนหน้า: </span>
                      <span className="text-app">
                        {currencyFormatter.format(price.previousPrice)}/ลิตร
                      </span>
                    </div>
                    <div>
                      <span className="text-muted">เปลี่ยนแปลง: </span>
                      <span className={`font-bold ${
                        price.change > 0 ? "text-red-400" : price.change < 0 ? "text-emerald-400" : "text-muted"
                      }`}>
                        {price.change > 0 ? "+" : ""}
                        {currencyFormatter.format(price.change)} ({price.changePercent > 0 ? "+" : ""}{price.changePercent.toFixed(2)}%)
                      </span>
                    </div>
                  </div>
                </div>
                <div className="ml-4">
                  {price.change !== 0 && (
                    price.change > 0 ? (
                      <TrendingUp className="w-6 h-6 text-red-400" />
                    ) : (
                      <TrendingDown className="w-6 h-6 text-emerald-400" />
                    )
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="panel rounded-2xl p-6 shadow-app"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-app">ตั้งค่าการอัปเดตราคา</h3>
            <p className="text-sm text-muted">กำหนดเวลาและแหล่งข้อมูลการอัปเดตราคา</p>
          </div>
          <Settings className="w-6 h-6 text-muted" />
        </div>
        <div className="space-y-4">
          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={autoUpdate}
                onChange={(e) => setAutoUpdate(e.target.checked)}
                className="w-5 h-5 rounded border-app text-ptt-blue focus:ring-ptt-blue/30"
              />
              <span className="text-sm font-medium text-app">อัปเดตราคาอัตโนมัติ</span>
            </label>
            <p className="text-xs text-muted mt-1 ml-8">
              ดึงราคาจาก PTT API อัตโนมัติทุกวัน
            </p>
          </div>
          {autoUpdate && (
            <div>
              <label className="block text-sm font-medium text-muted mb-2">
                เวลาอัปเดต
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                <input
                  type="time"
                  value={updateTime}
                  onChange={(e) => setUpdateTime(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-soft border border-app rounded-xl text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue/30"
                />
              </div>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-muted mb-2">
              แหล่งข้อมูล
            </label>
            <select
              value={mockPriceData.source}
              className="w-full px-4 py-2 bg-soft border border-app rounded-xl text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue/30"
            >
              <option value="PTT API">PTT API</option>
              <option value="Excel Import">Excel Import</option>
              <option value="Manual">Manual</option>
            </select>
          </div>
          <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5" />
              <p className="text-sm text-blue-400/80">
                <strong>หมายเหตุ:</strong> ราคาจะถูกอัปเดตอัตโนมัติทุกวันเวลา {updateTime} จาก {mockPriceData.source}
                {autoUpdate && " (เปิดใช้งาน)"}
              </p>
            </div>
          </div>
          <button className="w-full px-4 py-2 bg-ptt-blue/10 hover:bg-ptt-blue/20 border border-ptt-blue/30 rounded-xl text-ptt-cyan transition-colors">
            บันทึกการตั้งค่า
          </button>
        </div>
      </motion.div>
    </div>
  );
}

