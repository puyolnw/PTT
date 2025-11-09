import { useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  Download,
  TrendingUp,
  Building2,
  FileText,
} from "lucide-react";

const currencyFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 0,
});

const branches = ["สำนักงานใหญ่", "สาขา A", "สาขา B", "สาขา C", "สาขา D"];

// Mock data สำหรับรายงาน
const salesReportData = {
  today: 500000,
  thisWeek: 3500000,
  thisMonth: 15000000,
  lastMonth: 14000000,
  byFuelType: {
    g95: 9000000,
    diesel: 6000000,
  },
};

export default function Reports() {
  const [selectedBranch, setSelectedBranch] = useState<string>("ทั้งหมด");
  const [reportPeriod, setReportPeriod] = useState<string>("เดือนนี้");

  const monthlyChange = ((salesReportData.thisMonth - salesReportData.lastMonth) / salesReportData.lastMonth) * 100;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h2 className="text-3xl font-bold text-app mb-2 font-display">รายงาน - M1</h2>
        <p className="text-muted font-light">
          รายงานยอดขายตามช่วงเวลา (รายวัน/รายสัปดาห์/รายเดือน/รายปี) แยกตามชนิดน้ำมัน + พนักงาน ออกรายงานเอกสาร (ใบรับสินค้า, ใบสั่งซื้อ, ใบเสร็จรับเงิน, สรุปสต็อก) พิมพ์ PDF ได้ทันที
        </p>
      </motion.div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex gap-4">
          <div>
            <label className="block text-sm font-medium text-app mb-2">สาขา</label>
            <select
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
            <label className="block text-sm font-medium text-app mb-2">ช่วงเวลา</label>
            <select
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
          <span>ส่งออกรายงาน PDF</span>
        </button>
      </div>

      {/* Sales Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="panel rounded-2xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-app">รายงานยอดขาย {reportPeriod}</h3>
          <BarChart3 className="w-6 h-6 text-muted" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
            <p className="text-sm text-muted mb-1">ยอดขายวันนี้</p>
            <p className="text-2xl font-bold text-emerald-400">
              {currencyFormatter.format(salesReportData.today)}
            </p>
          </div>
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
            <p className="text-sm text-muted mb-1">ยอดขายสัปดาห์นี้</p>
            <p className="text-2xl font-bold text-blue-400">
              {currencyFormatter.format(salesReportData.thisWeek)}
            </p>
          </div>
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
            <p className="text-sm text-muted mb-1">ยอดขายเดือนนี้</p>
            <p className="text-2xl font-bold text-purple-400">
              {currencyFormatter.format(salesReportData.thisMonth)}
            </p>
            <div className="flex items-center gap-1 text-xs text-emerald-400 mt-1">
              <TrendingUp className="w-3 h-3" />
              +{monthlyChange.toFixed(1)}% จากเดือนที่แล้ว
            </div>
          </div>
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
            <p className="text-sm text-muted mb-1">ยอดขายเดือนที่แล้ว</p>
            <p className="text-2xl font-bold text-orange-400">
              {currencyFormatter.format(salesReportData.lastMonth)}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Sales by Fuel Type */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="panel rounded-2xl p-6"
      >
        <h3 className="text-xl font-semibold text-app mb-4">ยอดขายแยกตามชนิดน้ำมัน</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-ptt-blue/10 border border-ptt-blue/30 rounded-xl p-4">
            <p className="text-sm text-muted mb-1">Gasohol 95</p>
            <p className="text-2xl font-bold text-ptt-cyan">
              {currencyFormatter.format(salesReportData.byFuelType.g95)}
            </p>
            <p className="text-xs text-muted mt-1">
              {((salesReportData.byFuelType.g95 / salesReportData.thisMonth) * 100).toFixed(1)}% ของยอดขาย
            </p>
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
            <p className="text-sm text-muted mb-1">Diesel</p>
            <p className="text-2xl font-bold text-emerald-400">
              {currencyFormatter.format(salesReportData.byFuelType.diesel)}
            </p>
            <p className="text-xs text-muted mt-1">
              {((salesReportData.byFuelType.diesel / salesReportData.thisMonth) * 100).toFixed(1)}% ของยอดขาย
            </p>
          </div>
        </div>
      </motion.div>

      {/* Sales by Employee (ตามปั้ม.md: แยกตามชนิดน้ำมัน + พนักงาน) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="panel rounded-2xl p-6"
      >
        <h3 className="text-xl font-semibold text-app mb-4">ยอดขายแยกตามพนักงาน (จากสมุด Balance Petrel)</h3>
        <div className="space-y-3">
          {[
            { name: "พนักงาน A", sales: 500000, fuelType: "Gasohol 95: 300,000, Diesel: 200,000" },
            { name: "พนักงาน B", sales: 450000, fuelType: "Gasohol 95: 270,000, Diesel: 180,000" },
            { name: "พนักงาน C", sales: 400000, fuelType: "Gasohol 95: 240,000, Diesel: 160,000" },
          ].map((emp, index) => (
            <div key={emp.name} className="flex items-center justify-between p-4 bg-soft rounded-xl border border-app">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  index === 0 ? "bg-ptt-blue/20 text-ptt-cyan" :
                  index === 1 ? "bg-emerald-500/20 text-emerald-400" :
                  "bg-muted/20 text-muted"
                }`}>
                  <span className="text-sm font-bold">{index + 1}</span>
                </div>
                <div>
                  <p className="font-medium text-app">{emp.name}</p>
                  <p className="text-xs text-muted">{emp.fuelType}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-app">
                  {currencyFormatter.format(emp.sales)}
                </p>
              </div>
            </div>
          ))}
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
          {branches.map((branch, index) => {
            const sales = 500000 - (index * 50000);
            const maxSales = 500000;
            const percentage = (sales / maxSales) * 100;
            return (
              <div key={branch} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-app font-medium">{branch}</span>
                  <span className="text-app font-semibold">
                    {currencyFormatter.format(sales)}
                  </span>
                </div>
                <div className="w-full h-2 bg-soft rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-ptt-blue to-ptt-cyan"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Document Reports */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="panel rounded-2xl p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-app">ออกรายงานเอกสาร</h3>
          <FileText className="w-6 h-6 text-muted" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="flex flex-col items-center gap-2 p-4 bg-ptt-blue/10 hover:bg-ptt-blue/20 border border-ptt-blue/30 rounded-xl transition-colors">
            <FileText className="w-8 h-8 text-ptt-cyan" />
            <span className="text-app font-medium text-sm">ใบรับสินค้า</span>
          </button>
          <button className="flex flex-col items-center gap-2 p-4 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-xl transition-colors">
            <FileText className="w-8 h-8 text-emerald-400" />
            <span className="text-app font-medium text-sm">ใบสั่งซื้อ</span>
          </button>
          <button className="flex flex-col items-center gap-2 p-4 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 rounded-xl transition-colors">
            <FileText className="w-8 h-8 text-purple-400" />
            <span className="text-app font-medium text-sm">ใบเสร็จรับเงิน</span>
          </button>
          <button className="flex flex-col items-center gap-2 p-4 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 rounded-xl transition-colors">
            <FileText className="w-8 h-8 text-orange-400" />
            <span className="text-app font-medium text-sm">สรุปสต็อก</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}

