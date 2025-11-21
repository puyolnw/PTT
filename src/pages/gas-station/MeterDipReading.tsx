import { Gauge, Droplets, TrendingUp, TrendingDown, AlertCircle, Calendar, Plus, Droplet } from "lucide-react";
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

  const totalTanks = mockMeterDipData.branches.reduce((sum, b) => sum + b.tanks.length, 0);
  const totalSales = mockMeterDipData.branches.reduce((sum, branch) => {
    return sum + branch.tanks.reduce((tankSum, tank) => tankSum + tank.sales, 0);
  }, 0);
  const warningTanks = mockMeterDipData.branches.reduce((sum, branch) => {
    return sum + branch.tanks.filter(t => t.status === "warning" || t.status === "error").length;
  }, 0);

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6">
      {/* Header Section */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Droplet className="h-8 w-8 text-blue-600" />
          Meter & Dip Reading
        </h2>
        <p className="text-slate-500 text-sm mt-1">
          บันทึกมิเตอร์หัวจ่าย + Dip ถังทุกวัน → คำนวณ Loss/Gain อัตโนมัติ
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
          <div className="flex items-center gap-2 text-blue-700 mb-2">
            <Gauge className="h-5 w-5" />
            <span className="font-bold">ถังทั้งหมด</span>
          </div>
          <div className="text-2xl font-bold text-blue-900">
            {totalTanks}
          </div>
          <div className="text-xs text-blue-600 mt-1">ถัง</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="text-xs text-gray-500 mb-1">Loss/Gain รวม</div>
          <div className={`text-xl font-bold ${
            totalLossGain < 0 ? "text-red-600" : "text-green-600"
          }`}>
            {totalLossGain > 0 ? "+" : ""}
            {numberFormatter.format(totalLossGain)} L
          </div>
          <div className="w-full bg-gray-100 h-1.5 rounded-full mt-2">
            <div
              className={`h-1.5 rounded-full ${
                totalLossGain < 0 ? "bg-red-500" : "bg-green-500"
              }`}
              style={{ width: `${Math.min(100, Math.abs(totalLossGain) / 10)}%` }}
            />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="text-xs text-gray-500 mb-1">ยอดขายรวม</div>
          <div className="text-xl font-bold text-slate-800">
            {numberFormatter.format(totalSales)} L
          </div>
          <div className="w-full bg-gray-100 h-1.5 rounded-full mt-2">
            <div
              className="bg-emerald-500 h-1.5 rounded-full"
              style={{ width: `${Math.min(100, (totalSales / 10000) * 100)}%` }}
            />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="text-xs text-gray-500 mb-1">เตือน</div>
          <div className="text-xl font-bold text-slate-800">
            {warningTanks} ถัง
          </div>
          <div className="w-full bg-gray-100 h-1.5 rounded-full mt-2">
            <div
              className="bg-orange-500 h-1.5 rounded-full"
              style={{ width: `${(warningTanks / totalTanks) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={selectedBranch || ""}
          onChange={(e) => setSelectedBranch(e.target.value || null)}
          className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">ทุกสาขา</option>
          {mockMeterDipData.branches.map(branch => (
            <option key={branch.id} value={branch.id}>{branch.name}</option>
          ))}
        </select>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium shadow-sm">
          <Plus className="w-5 h-5" />
          <span>บันทึก Meter/Dip</span>
        </button>
      </div>

      {/* Meter & Dip Reading List */}
      {filteredBranches.map((branch) => (
        <div
          key={branch.id}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-semibold text-slate-800">{branch.name}</h3>
              <p className="text-sm text-gray-500">วันที่: {new Date(selectedDate).toLocaleDateString("th-TH")}</p>
            </div>
            <Gauge className="w-6 h-6 text-gray-500" />
          </div>
          <div className="space-y-4">
            {branch.tanks.map((tank) => (
              <div
                key={tank.id}
                className={`p-4 rounded-xl border ${
                  tank.status === "ok"
                    ? "bg-gray-50 border-gray-200"
                    : tank.status === "warning"
                    ? "bg-orange-50 border-orange-200"
                    : "bg-red-50 border-red-200"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-slate-800">{tank.fuelType}</h4>
                    <p className="text-xs text-gray-500">ถัง: {tank.id}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    tank.status === "ok"
                      ? "bg-green-100 text-green-700 border border-green-300"
                      : tank.status === "warning"
                      ? "bg-orange-100 text-orange-700 border border-orange-300"
                      : "bg-red-100 text-red-700 border border-red-300"
                  }`}>
                    {tank.status === "ok" ? "ปกติ" : tank.status === "warning" ? "เตือน" : "ผิดปกติ"}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">มิเตอร์หัวจ่าย</p>
                    <div className="flex items-center gap-2">
                      <Gauge className="w-4 h-4 text-blue-600" />
                      <p className="text-lg font-bold text-slate-800">
                        {numberFormatter.format(tank.meterReading)} ลิตร
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      ก่อนหน้า: {numberFormatter.format(tank.previousMeter)} ลิตร
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Dip ถัง</p>
                    <div className="flex items-center gap-2">
                      <Droplets className="w-4 h-4 text-blue-600" />
                      <p className="text-lg font-bold text-slate-800">
                        {numberFormatter.format(tank.dipReading)} ลิตร
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      ก่อนหน้า: {numberFormatter.format(tank.previousDip)} ลิตร
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">ยอดขาย</p>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      <p className="text-lg font-bold text-green-600">
                        {numberFormatter.format(tank.sales)} ลิตร
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      = มิเตอร์ - Dip
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Loss/Gain</p>
                    <div className="flex items-center gap-2">
                      {tank.lossGain < 0 ? (
                        <TrendingDown className="w-4 h-4 text-red-600" />
                      ) : (
                        <TrendingUp className="w-4 h-4 text-green-600" />
                      )}
                      <p className={`text-lg font-bold ${
                        tank.lossGain < 0 ? "text-red-600" : "text-green-600"
                      }`}>
                        {tank.lossGain > 0 ? "+" : ""}
                        {numberFormatter.format(tank.lossGain)} ลิตร
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      ({tank.lossGainPercent > 0 ? "+" : ""}{tank.lossGainPercent.toFixed(2)}%)
                    </p>
                  </div>
                </div>
                {Math.abs(tank.lossGainPercent) > 0.5 && (
                  <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <p className="text-xs text-orange-700">
                      <strong>เตือน:</strong> Loss/Gain เกิน 0.5% ควรตรวจสอบสาเหตุ (รั่วไหล, ระเหย, ความคลาดเคลื่อน)
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
