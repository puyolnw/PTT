import { motion } from "framer-motion";
import { Gauge, Droplets, TrendingUp, TrendingDown, AlertTriangle, Calendar, Plus } from "lucide-react";
import { useState } from "react";

const numberFormatter = new Intl.NumberFormat("th-TH", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

// Mock data - Meter & Dip Reading
const mockMeterDipData = {
  date: "2024-12-15",
  branches: [
    {
      id: "BR-001",
      name: "สำนักงานใหญ่",
      tanks: [
        {
          id: "TK-001",
          fuelType: "Gasohol 95",
          meterReading: 125000.50, // มิเตอร์หัวจ่าย (ลิตร)
          dipReading: 28500.00, // Dip ถัง (ลิตร)
          previousMeter: 120000.00,
          previousDip: 30000.00,
          sales: 5000.50, // ขายจริง
          lossGain: -4.50, // Loss/Gain
          lossGainPercent: -0.09,
          status: "ok",
        },
        {
          id: "TK-002",
          fuelType: "Diesel",
          meterReading: 98000.25,
          dipReading: 32000.00,
          previousMeter: 95000.00,
          previousDip: 33000.00,
          sales: 3000.25,
          lossGain: 0.25,
          lossGainPercent: 0.01,
          status: "ok",
        },
      ],
    },
    {
      id: "BR-002",
      name: "สาขา A",
      tanks: [
        {
          id: "TK-003",
          fuelType: "Premium Gasohol 95",
          meterReading: 45000.00,
          dipReading: 15000.00,
          previousMeter: 44000.00,
          previousDip: 16000.00,
          sales: 1000.00,
          lossGain: -5.00,
          lossGainPercent: -0.50,
          status: "warning",
        },
      ],
    },
  ],
};

export default function MeterDipReading() {
  const [selectedDate, setSelectedDate] = useState("2024-12-15");
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);

  const filteredBranches = selectedBranch
    ? mockMeterDipData.branches.filter(b => b.id === selectedBranch)
    : mockMeterDipData.branches;

  const totalLossGain = mockMeterDipData.branches.reduce((sum, branch) => {
    return sum + branch.tanks.reduce((tankSum, tank) => tankSum + tank.lossGain, 0);
  }, 0);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h2 className="text-3xl font-bold text-app mb-2 font-display">Meter & Dip Reading</h2>
        <p className="text-muted font-light">
          บันทึกมิเตอร์หัวจ่าย + Dip ถังทุกวัน → คำนวณ Loss/Gain อัตโนมัติ
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
            <Gauge className="w-6 h-6 text-ptt-cyan" />
            <span className="text-xs text-muted">ถังทั้งหมด</span>
          </div>
          <p className="text-2xl font-bold text-app">
            {mockMeterDipData.branches.reduce((sum, b) => sum + b.tanks.length, 0)}
          </p>
          <p className="text-xs text-muted mt-1">ถัง</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="panel rounded-2xl p-6 shadow-app"
        >
          <div className="flex items-center justify-between mb-4">
            <Droplets className="w-6 h-6 text-blue-400" />
            <span className="text-xs text-muted">Loss/Gain รวม</span>
          </div>
          <p className={`text-2xl font-bold ${
            totalLossGain < 0 ? "text-red-400" : "text-emerald-400"
          }`}>
            {totalLossGain > 0 ? "+" : ""}
            {numberFormatter.format(totalLossGain)}
          </p>
          <p className="text-xs text-muted mt-1">ลิตร</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="panel rounded-2xl p-6 shadow-app"
        >
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="w-6 h-6 text-emerald-400" />
            <span className="text-xs text-muted">ยอดขายรวม</span>
          </div>
          <p className="text-2xl font-bold text-emerald-400">
            {numberFormatter.format(
              mockMeterDipData.branches.reduce((sum, branch) => {
                return sum + branch.tanks.reduce((tankSum, tank) => tankSum + tank.sales, 0);
              }, 0)
            )}
          </p>
          <p className="text-xs text-muted mt-1">ลิตร</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="panel rounded-2xl p-6 shadow-app"
        >
          <div className="flex items-center justify-between mb-4">
            <AlertTriangle className="w-6 h-6 text-orange-400" />
            <span className="text-xs text-muted">เตือน</span>
          </div>
          <p className="text-2xl font-bold text-orange-400">
            {mockMeterDipData.branches.reduce((sum, branch) => {
              return sum + branch.tanks.filter(t => t.status === "warning" || t.status === "error").length;
            }, 0)}
          </p>
          <p className="text-xs text-muted mt-1">ถัง</p>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="pl-10 pr-4 py-2 bg-soft border border-app rounded-xl text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue/30"
          />
        </div>
        <select
          value={selectedBranch || ""}
          onChange={(e) => setSelectedBranch(e.target.value || null)}
          className="px-4 py-2 bg-soft border border-app rounded-xl text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue/30"
        >
          <option value="">ทุกสาขา</option>
          {mockMeterDipData.branches.map(branch => (
            <option key={branch.id} value={branch.id}>{branch.name}</option>
          ))}
        </select>
        <button className="flex items-center gap-2 px-4 py-2 bg-ptt-blue/10 hover:bg-ptt-blue/20 border border-ptt-blue/30 rounded-xl text-ptt-cyan transition-colors">
          <Plus className="w-5 h-5" />
          <span>บันทึก Meter/Dip</span>
        </button>
      </div>

      {/* Meter & Dip Reading List */}
      {filteredBranches.map((branch) => (
        <motion.div
          key={branch.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="panel rounded-2xl p-6 shadow-app"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-semibold text-app">{branch.name}</h3>
              <p className="text-sm text-muted">วันที่: {new Date(selectedDate).toLocaleDateString("th-TH")}</p>
            </div>
            <Gauge className="w-6 h-6 text-muted" />
          </div>
          <div className="space-y-4">
            {branch.tanks.map((tank) => (
              <div
                key={tank.id}
                className={`p-4 rounded-xl border-2 ${
                  tank.status === "ok"
                    ? "bg-soft border-app"
                    : tank.status === "warning"
                    ? "bg-orange-500/10 border-orange-500/30"
                    : "bg-red-500/10 border-red-500/30"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-app">{tank.fuelType}</h4>
                    <p className="text-xs text-muted">ถัง: {tank.id}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    tank.status === "ok"
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                      : tank.status === "warning"
                      ? "bg-orange-500/10 text-orange-400 border border-orange-500/30"
                      : "bg-red-500/10 text-red-400 border border-red-500/30"
                  }`}>
                    {tank.status === "ok" ? "ปกติ" : tank.status === "warning" ? "เตือน" : "ผิดปกติ"}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-muted mb-1">มิเตอร์หัวจ่าย</p>
                    <div className="flex items-center gap-2">
                      <Gauge className="w-4 h-4 text-ptt-cyan" />
                      <p className="text-lg font-bold text-app">
                        {numberFormatter.format(tank.meterReading)} ลิตร
                      </p>
                    </div>
                    <p className="text-xs text-muted mt-1">
                      ก่อนหน้า: {numberFormatter.format(tank.previousMeter)} ลิตร
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted mb-1">Dip ถัง</p>
                    <div className="flex items-center gap-2">
                      <Droplets className="w-4 h-4 text-blue-400" />
                      <p className="text-lg font-bold text-app">
                        {numberFormatter.format(tank.dipReading)} ลิตร
                      </p>
                    </div>
                    <p className="text-xs text-muted mt-1">
                      ก่อนหน้า: {numberFormatter.format(tank.previousDip)} ลิตร
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted mb-1">ยอดขาย</p>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                      <p className="text-lg font-bold text-emerald-400">
                        {numberFormatter.format(tank.sales)} ลิตร
                      </p>
                    </div>
                    <p className="text-xs text-muted mt-1">
                      = มิเตอร์ - Dip
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted mb-1">Loss/Gain</p>
                    <div className="flex items-center gap-2">
                      {tank.lossGain < 0 ? (
                        <TrendingDown className="w-4 h-4 text-red-400" />
                      ) : (
                        <TrendingUp className="w-4 h-4 text-emerald-400" />
                      )}
                      <p className={`text-lg font-bold ${
                        tank.lossGain < 0 ? "text-red-400" : "text-emerald-400"
                      }`}>
                        {tank.lossGain > 0 ? "+" : ""}
                        {numberFormatter.format(tank.lossGain)} ลิตร
                      </p>
                    </div>
                    <p className="text-xs text-muted mt-1">
                      ({tank.lossGainPercent > 0 ? "+" : ""}{tank.lossGainPercent.toFixed(2)}%)
                    </p>
                  </div>
                </div>
                {Math.abs(tank.lossGainPercent) > 0.5 && (
                  <div className="mt-3 p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                    <p className="text-xs text-orange-400">
                      <strong>เตือน:</strong> Loss/Gain เกิน 0.5% ควรตรวจสอบสาเหตุ (รั่วไหล, ระเหย, ความคลาดเคลื่อน)
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

