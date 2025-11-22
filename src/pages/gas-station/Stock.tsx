import { useState } from "react";
import {
  Upload,
  Fuel,
  Droplet,
} from "lucide-react";
import FilterBar from "@/components/FilterBar";

const numberFormatter = new Intl.NumberFormat("th-TH");

const branches = ["สำนักงานใหญ่", "สาขา A", "สาขา B", "สาขา C", "สาขา D"];

// Mock data สำหรับสต็อกน้ำมัน
const initialStockData = [
  { id: "1", fuelType: "Gasohol 95", quantity: 28500, unit: "ลิตร", tank: "TK-001", branch: "สำนักงานใหญ่", lowStock: false },
  { id: "2", fuelType: "Diesel", quantity: 32000, unit: "ลิตร", tank: "TK-002", branch: "สำนักงานใหญ่", lowStock: false },
  { id: "3", fuelType: "Premium Gasohol 95", quantity: 15000, unit: "ลิตร", tank: "TK-003", branch: "สำนักงานใหญ่", lowStock: true },
  { id: "4", fuelType: "E20", quantity: 8000, unit: "ลิตร", tank: "TK-004", branch: "สาขา A", lowStock: true },
  { id: "5", fuelType: "Gasohol 91", quantity: 12000, unit: "ลิตร", tank: "TK-005", branch: "สาขา B", lowStock: false },
];

export default function Stock() {
  const [stockData] = useState(initialStockData);
  const [searchQuery, setSearchQuery] = useState("");
  const [branchFilter, setBranchFilter] = useState("");

  const filteredStock = stockData.filter((item) => {
    const matchesSearch = item.fuelType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tank.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBranch = !branchFilter || item.branch === branchFilter;
    return matchesSearch && matchesBranch;
  });

  const totalStock = stockData.reduce((sum, item) => sum + item.quantity, 0);
  const lowStockItems = stockData.filter(item => item.lowStock);
  const dieselStock = stockData.filter(item => item.fuelType === "Diesel").reduce((sum, item) => sum + item.quantity, 0);
  const g95Stock = stockData.filter(item => item.fuelType === "Gasohol 95").reduce((sum, item) => sum + item.quantity, 0);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      alert(`กำลังประมวลผลไฟล์ ${file.name}...\n\nระบบจะอัปเดตสต็อกน้ำมันทุกถัง แยกตามปั๊มและชนิด`);
    }
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6">
      {/* Header Section */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Droplet className="h-8 w-8 text-blue-600" />
          สต็อกน้ำมัน - M1
        </h2>
        <p className="text-slate-500 text-sm mt-1">
          ติดตามสต็อกน้ำมันทุกถัง แยกตามปั๊มและชนิด นำเข้า Excel จาก PTT BackOffice
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
          <div className="flex items-center gap-2 text-blue-700 mb-2">
            <Fuel className="h-5 w-5" />
            <span className="font-bold">สต็อกรวม</span>
          </div>
          <div className="text-2xl font-bold text-blue-900">
            {numberFormatter.format(totalStock)} ลิตร
          </div>
          <div className="text-xs text-blue-600 mt-1">จาก {stockData.length} ถัง</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="text-xs text-gray-500 mb-1">Diesel</div>
          <div className="text-xl font-bold text-slate-800">
            {numberFormatter.format(dieselStock)} L
          </div>
          <div className="w-full bg-gray-100 h-1.5 rounded-full mt-2">
            <div
              className="bg-yellow-400 h-1.5 rounded-full"
              style={{ width: `${(dieselStock / totalStock) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="text-xs text-gray-500 mb-1">Gasohol 95</div>
          <div className="text-xl font-bold text-slate-800">
            {numberFormatter.format(g95Stock)} L
          </div>
          <div className="w-full bg-gray-100 h-1.5 rounded-full mt-2">
            <div
              className="bg-orange-500 h-1.5 rounded-full"
              style={{ width: `${(g95Stock / totalStock) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="text-xs text-gray-500 mb-1">สต็อกใกล้หมด</div>
          <div className="text-xl font-bold text-slate-800">
            {lowStockItems.length} ถัง
          </div>
          <div className="w-full bg-gray-100 h-1.5 rounded-full mt-2">
            <div
              className="bg-orange-500 h-1.5 rounded-full"
              style={{ width: `${(lowStockItems.length / stockData.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <FilterBar
          onSearch={setSearchQuery}
          filters={[
            {
              label: "สาขา",
              value: branchFilter,
              options: [{ value: "", label: "ทั้งหมด" }, ...branches.map((branch) => ({ value: branch, label: branch }))],
              onChange: setBranchFilter,
            },
          ]}
        />

        <div className="flex gap-2">
          <label className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 rounded-lg text-sm font-medium transition-colors shadow-sm cursor-pointer">
            <Upload className="h-4 w-4" />
            <span>นำเข้า STOCK_YYYYMMDD.xlsx</span>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Stock Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="font-bold text-slate-700">รายการสต็อกน้ำมันทั้งหมด</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="p-3">ชนิดน้ำมัน</th>
                <th className="p-3">ถัง</th>
                <th className="p-3">สาขา</th>
                <th className="p-3 text-right">คงเหลือ</th>
                <th className="p-3 text-center">สถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {filteredStock.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="p-3 font-medium text-slate-700">
                    <div className="flex items-center gap-2">
                      <Fuel className="w-4 h-4 text-blue-600" />
                      {item.fuelType}
                    </div>
                  </td>
                  <td className="p-3 text-slate-700">{item.tank}</td>
                  <td className="p-3 text-gray-600">{item.branch}</td>
                  <td className="p-3 text-right font-mono text-slate-800">
                    {numberFormatter.format(item.quantity)} {item.unit}
                  </td>
                  <td className="p-3 text-center">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        item.lowStock
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {item.lowStock ? "ใกล้หมด" : "ปกติ"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredStock.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              ไม่พบข้อมูลสต็อกน้ำมัน
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
