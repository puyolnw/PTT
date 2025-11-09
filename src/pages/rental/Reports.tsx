import { useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  Download,
  TrendingUp,
  Building2,
} from "lucide-react";

const currencyFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 0,
});

const branches = ["สำนักงานใหญ่", "สาขา A", "สาขา B", "สาขา C", "สาขา D"];

// Mock data สำหรับรายงาน
const rentalReportData = {
  thisMonth: {
    income: 150000,
    expenses: 50000,
    netProfit: 100000,
  },
  lastMonth: {
    income: 140000,
    expenses: 48000,
    netProfit: 92000,
  },
  byShop: {
    "FIT Auto": 35000,
    "Chester's": 25000,
    "Daiso": 20000,
    "Quick": 30000,
    "ร้าน EV": 17500,
    "อื่นๆ": 22500,
  },
  byBranch: {
    "สำนักงานใหญ่": 50000,
    "สาขา A": 40000,
    "สาขา B": 35000,
    "สาขา C": 30000,
    "สาขา D": 25000,
  },
};

export default function Reports() {
  const [selectedBranch, setSelectedBranch] = useState<string>("ทั้งหมด");
  const [reportPeriod, setReportPeriod] = useState<string>("เดือนนี้");

  const monthlyChange = ((rentalReportData.thisMonth.income - rentalReportData.lastMonth.income) / rentalReportData.lastMonth.income) * 100;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h2 className="text-3xl font-bold text-app mb-2 font-display">รายงาน - M2</h2>
        <p className="text-muted font-light">
          รายงานรายได้ค่าเช่ารายปั๊ม / รายเดือน / รายร้าน และรายงานค่าใช้จ่ายค่าเช่าภายนอกแยกตามปั๊ม
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
          <span>ส่งออกรายงาน</span>
        </button>
      </div>

      {/* Summary Report */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="panel rounded-2xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-app">รายงานค่าเช่า - เดือนตุลาคม 2568</h3>
          <BarChart3 className="w-6 h-6 text-muted" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
            <p className="text-sm text-muted mb-1">รายได้ค่าเช่า (5 ปั๊ม)</p>
            <p className="text-2xl font-bold text-emerald-400">
              {currencyFormatter.format(rentalReportData.thisMonth.income)}
            </p>
            <div className="flex items-center gap-1 text-xs text-emerald-400 mt-1">
              <TrendingUp className="w-3 h-3" />
              +{monthlyChange.toFixed(1)}% จากเดือนที่แล้ว
            </div>
          </div>
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
            <p className="text-sm text-muted mb-1">ค่าเช่าภายนอก</p>
            <p className="text-2xl font-bold text-red-400">
              {currencyFormatter.format(rentalReportData.thisMonth.expenses)}
            </p>
            <p className="text-xs text-muted mt-1">ที่ดิน/ป้าย/โฆษณา</p>
          </div>
          <div className="bg-ptt-blue/10 border border-ptt-blue/30 rounded-xl p-4">
            <p className="text-sm text-muted mb-1">กำไรสุทธิ</p>
            <p className="text-2xl font-bold text-ptt-cyan">
              {currencyFormatter.format(rentalReportData.thisMonth.netProfit)}
            </p>
            <p className="text-xs text-muted mt-1">รายได้ - ค่าใช้จ่าย</p>
          </div>
        </div>
      </motion.div>

      {/* Income by Shop */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="panel rounded-2xl p-6"
      >
        <h3 className="text-xl font-semibold text-app mb-4">รายได้ค่าเช่าแยกตามร้าน</h3>
        <div className="space-y-3">
          {Object.entries(rentalReportData.byShop)
            .sort(([, a], [, b]) => b - a)
            .map(([shop, amount]) => {
              const percentage = (amount / rentalReportData.thisMonth.income) * 100;
              return (
                <div key={shop} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-app font-medium">{shop}</span>
                    <span className="text-app font-semibold">
                      {currencyFormatter.format(amount)}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-soft rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-ptt-blue to-ptt-cyan"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted">{percentage.toFixed(1)}% ของรายได้ทั้งหมด</p>
                </div>
              );
            })}
        </div>
      </motion.div>

      {/* Income by Branch */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="panel rounded-2xl p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-app">รายได้ค่าเช่าแยกตามปั๊ม</h3>
          <Building2 className="w-6 h-6 text-muted" />
        </div>
        <div className="space-y-3">
          {Object.entries(rentalReportData.byBranch)
            .sort(([, a], [, b]) => b - a)
            .map(([branch, amount]) => {
              const maxAmount = Math.max(...Object.values(rentalReportData.byBranch));
              const percentage = (amount / maxAmount) * 100;
              return (
                <div key={branch} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-app font-medium">{branch}</span>
                    <span className="text-app font-semibold">
                      {currencyFormatter.format(amount)}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-soft rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
        </div>
      </motion.div>
    </div>
  );
}

