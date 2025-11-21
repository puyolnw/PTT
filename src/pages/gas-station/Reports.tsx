import { useState } from "react";
import {
  BarChart3,
  Download,
  TrendingUp,
  Building2,
  FileText,
  Droplet,
} from "lucide-react";

const currencyFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const numberFormatter = new Intl.NumberFormat("th-TH");

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
    <div className="p-6 max-w-[1600px] mx-auto space-y-6">
      {/* Header Section */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Droplet className="h-8 w-8 text-blue-600" />
          รายงาน - M1
        </h2>
        <p className="text-slate-500 text-sm mt-1">
          รายงานยอดขายตามช่วงเวลา (รายวัน/รายสัปดาห์/รายเดือน/รายปี) แยกตามชนิดน้ำมัน + พนักงาน ออกรายงานเอกสาร (ใบรับสินค้า, ใบสั่งซื้อ, ใบเสร็จรับเงิน, สรุปสต็อก) พิมพ์ PDF ได้ทันที
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">สาขา</label>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <label className="block text-sm font-medium text-slate-700 mb-2">ช่วงเวลา</label>
            <select
              value={reportPeriod}
              onChange={(e) => setReportPeriod(e.target.value)}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="วันนี้">วันนี้</option>
              <option value="สัปดาห์นี้">สัปดาห์นี้</option>
              <option value="เดือนนี้">เดือนนี้</option>
              <option value="ปีนี้">ปีนี้</option>
            </select>
          </div>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm">
          <Download className="h-4 w-4" />
          <span>ส่งออกรายงาน PDF</span>
        </button>
      </div>

      {/* Sales Summary */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-slate-800">รายงานยอดขาย {reportPeriod}</h3>
          <BarChart3 className="w-6 h-6 text-gray-500" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
            <p className="text-sm text-emerald-600 mb-1">ยอดขายวันนี้</p>
            <p className="text-2xl font-bold text-emerald-900">
              {currencyFormatter.format(salesReportData.today)}
            </p>
          </div>
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
            <p className="text-sm text-blue-600 mb-1">ยอดขายสัปดาห์นี้</p>
            <p className="text-2xl font-bold text-blue-900">
              {currencyFormatter.format(salesReportData.thisWeek)}
            </p>
          </div>
          <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
            <p className="text-sm text-purple-600 mb-1">ยอดขายเดือนนี้</p>
            <p className="text-2xl font-bold text-purple-900">
              {currencyFormatter.format(salesReportData.thisMonth)}
            </p>
            <div className="flex items-center gap-1 text-xs text-emerald-600 mt-1">
              <TrendingUp className="w-3 h-3" />
              +{monthlyChange.toFixed(1)}% จากเดือนที่แล้ว
            </div>
          </div>
          <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
            <p className="text-sm text-orange-600 mb-1">ยอดขายเดือนที่แล้ว</p>
            <p className="text-2xl font-bold text-orange-900">
              {currencyFormatter.format(salesReportData.lastMonth)}
            </p>
          </div>
        </div>
      </div>

      {/* Sales by Fuel Type */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-semibold text-slate-800 mb-4">ยอดขายแยกตามชนิดน้ำมัน</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
            <p className="text-sm text-blue-600 mb-1">Gasohol 95</p>
            <p className="text-2xl font-bold text-blue-900">
              {currencyFormatter.format(salesReportData.byFuelType.g95)}
            </p>
            <p className="text-xs text-blue-600 mt-1">
              {((salesReportData.byFuelType.g95 / salesReportData.thisMonth) * 100).toFixed(1)}% ของยอดขาย
            </p>
          </div>
          <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
            <p className="text-sm text-emerald-600 mb-1">Diesel</p>
            <p className="text-2xl font-bold text-emerald-900">
              {currencyFormatter.format(salesReportData.byFuelType.diesel)}
            </p>
            <p className="text-xs text-emerald-600 mt-1">
              {((salesReportData.byFuelType.diesel / salesReportData.thisMonth) * 100).toFixed(1)}% ของยอดขาย
            </p>
          </div>
        </div>
      </div>

      {/* Sales by Employee */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-semibold text-slate-800 mb-4">ยอดขายแยกตามพนักงาน (จากสมุด Balance Petrel)</h3>
        <div className="space-y-3">
          {[
            { name: "พนักงาน A", sales: 500000, fuelType: "Gasohol 95: 300,000, Diesel: 200,000" },
            { name: "พนักงาน B", sales: 450000, fuelType: "Gasohol 95: 270,000, Diesel: 180,000" },
            { name: "พนักงาน C", sales: 400000, fuelType: "Gasohol 95: 240,000, Diesel: 160,000" },
          ].map((emp, index) => (
            <div key={emp.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  index === 0 ? "bg-blue-100 text-blue-600" :
                  index === 1 ? "bg-emerald-100 text-emerald-600" :
                  "bg-gray-100 text-gray-600"
                }`}>
                  <span className="text-sm font-bold">{index + 1}</span>
                </div>
                <div>
                  <p className="font-medium text-slate-800">{emp.name}</p>
                  <p className="text-xs text-gray-500">{emp.fuelType}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-slate-800">
                  {currencyFormatter.format(emp.sales)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Branch Comparison */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-slate-800">เปรียบเทียบสาขา</h3>
          <Building2 className="w-6 h-6 text-gray-500" />
        </div>
        <div className="space-y-3">
          {branches.map((branch, index) => {
            const sales = 500000 - (index * 50000);
            const maxSales = 500000;
            const percentage = (sales / maxSales) * 100;
            return (
              <div key={branch} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-800 font-medium">{branch}</span>
                  <span className="text-slate-800 font-semibold">
                    {currencyFormatter.format(sales)}
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Document Reports */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-slate-800">ออกรายงานเอกสาร</h3>
          <FileText className="w-6 h-6 text-gray-500" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="flex flex-col items-center gap-2 p-4 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-colors">
            <FileText className="w-8 h-8 text-blue-600" />
            <span className="text-slate-800 font-medium text-sm">ใบรับสินค้า</span>
          </button>
          <button className="flex flex-col items-center gap-2 p-4 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors">
            <FileText className="w-8 h-8 text-emerald-600" />
            <span className="text-slate-800 font-medium text-sm">ใบสั่งซื้อ</span>
          </button>
          <button className="flex flex-col items-center gap-2 p-4 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl transition-colors">
            <FileText className="w-8 h-8 text-purple-600" />
            <span className="text-slate-800 font-medium text-sm">ใบเสร็จรับเงิน</span>
          </button>
          <button className="flex flex-col items-center gap-2 p-4 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-xl transition-colors">
            <FileText className="w-8 h-8 text-orange-600" />
            <span className="text-slate-800 font-medium text-sm">สรุปสต็อก</span>
          </button>
        </div>
      </div>
    </div>
  );
}
