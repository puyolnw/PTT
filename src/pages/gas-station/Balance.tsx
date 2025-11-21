import { useState } from "react";
import {
  FileText,
  Upload,
  AlertCircle,
  Fuel,
  TrendingDown,
  TrendingUp,
  Droplet,
} from "lucide-react";
import FilterBar from "@/components/FilterBar";

const numberFormatter = new Intl.NumberFormat("th-TH");

const branches = ["สำนักงานใหญ่", "สาขา A", "สาขา B", "สาขา C", "สาขา D"];

// Mock data สำหรับ Balance Petrel และ Dip Reading
const initialBalanceData = [
  {
    id: "1",
    date: "2024-12-15",
    fuelType: "Gasohol 95",
    dipReading: 28500,
    balancePetrel: 28550,
    diff: -50,
    branch: "สำนักงานใหญ่",
    tank: "TK-001",
    source: "BALANCE_20241215.xlsx",
    status: "ปกติ",
  },
  {
    id: "2",
    date: "2024-12-15",
    fuelType: "Diesel",
    dipReading: 32000,
    balancePetrel: 32000,
    diff: 0,
    branch: "สาขา A",
    tank: "TK-002",
    source: "BALANCE_20241215.xlsx",
    status: "ปกติ",
  },
  {
    id: "3",
    date: "2024-12-14",
    fuelType: "Premium Gasohol 95",
    dipReading: 15000,
    balancePetrel: 15100,
    diff: -100,
    branch: "สาขา B",
    tank: "TK-003",
    source: "BALANCE_20241214.xlsx",
    status: "แจ้งเตือน",
  },
];

export default function Balance() {
  const [balanceData] = useState(initialBalanceData);
  const [searchQuery, setSearchQuery] = useState("");
  const [branchFilter, setBranchFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const filteredBalance = balanceData.filter((item) => {
    const matchesSearch = item.fuelType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tank.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBranch = !branchFilter || item.branch === branchFilter;
    const matchesStatus = !statusFilter || item.status === statusFilter;
    return matchesSearch && matchesBranch && matchesStatus;
  });

  const alertItems = balanceData.filter(item => Math.abs(item.diff) > 50);
  const normalItems = balanceData.filter(item => item.status === "ปกติ");

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      alert(`กำลังประมวลผลไฟล์ ${file.name}...\n\nระบบจะเปรียบเทียบ Dip Reading vs Balance Petrel → แจ้งเตือน Diff`);
    }
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6">
      {/* Header Section */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Droplet className="h-8 w-8 text-blue-600" />
          Balance Petrel / Dip Reading - M1
        </h2>
        <p className="text-slate-500 text-sm mt-1">
          ประมวลผลสมุดน้ำมันใต้ดิน (Dip Reading) และสมุด Balance Petrel เปรียบเทียบ Dip vs ขายจริง → แจ้งเตือน Diff (ป้องกันการรั่วไหล) นำเข้า Excel จาก PTT BackOffice
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
          <div className="flex items-center gap-2 text-blue-700 mb-2">
            <FileText className="h-5 w-5" />
            <span className="font-bold">รายการทั้งหมด</span>
          </div>
          <div className="text-2xl font-bold text-blue-900">{balanceData.length}</div>
          <div className="text-xs text-blue-600 mt-1">รายการ</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="text-xs text-gray-500 mb-1">แจ้งเตือน Diff</div>
          <div className="text-xl font-bold text-slate-800">{alertItems.length}</div>
          <div className="w-full bg-gray-100 h-1.5 rounded-full mt-2">
            <div
              className="bg-orange-500 h-1.5 rounded-full"
              style={{ width: `${(alertItems.length / balanceData.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="text-xs text-gray-500 mb-1">สถานะปกติ</div>
          <div className="text-xl font-bold text-slate-800">{normalItems.length}</div>
          <div className="w-full bg-gray-100 h-1.5 rounded-full mt-2">
            <div
              className="bg-green-500 h-1.5 rounded-full"
              style={{ width: `${(normalItems.length / balanceData.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="text-xs text-gray-500 mb-1">จาก Excel</div>
          <div className="text-xl font-bold text-slate-800">BALANCE</div>
          <div className="w-full bg-gray-100 h-1.5 rounded-full mt-2">
            <div
              className="bg-purple-500 h-1.5 rounded-full"
              style={{ width: "100%" }}
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
            {
              label: "สถานะ",
              value: statusFilter,
              options: [{ value: "", label: "ทั้งหมด" }, { value: "ปกติ", label: "ปกติ" }, { value: "แจ้งเตือน", label: "แจ้งเตือน" }],
              onChange: setStatusFilter,
            },
          ]}
        />

        <div className="flex gap-2">
          <label className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 rounded-lg text-sm font-medium transition-colors shadow-sm cursor-pointer">
            <Upload className="h-4 w-4" />
            <span>นำเข้า BALANCE_YYYYMMDD.xlsx</span>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
          <label className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 rounded-lg text-sm font-medium transition-colors shadow-sm cursor-pointer">
            <Upload className="h-4 w-4" />
            <span>นำเข้า DIP_YYYYMMDD.xlsx</span>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Balance Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="font-bold text-slate-700">รายการ Balance Petrel / Dip Reading</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="p-3">วันที่</th>
                <th className="p-3">ชนิดน้ำมัน</th>
                <th className="p-3">สาขา / ถัง</th>
                <th className="p-3 text-right">Dip Reading (L)</th>
                <th className="p-3 text-right">Balance Petrel (L)</th>
                <th className="p-3 text-right">Diff (L)</th>
                <th className="p-3 text-center">สถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {filteredBalance.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="p-3 text-gray-600">
                    {new Date(item.date).toLocaleDateString("th-TH")}
                  </td>
                  <td className="p-3 font-medium text-slate-700">
                    <div className="flex items-center gap-2">
                      <Fuel className="w-4 h-4 text-blue-600" />
                      {item.fuelType}
                    </div>
                  </td>
                  <td className="p-3 text-gray-600">
                    {item.branch} • {item.tank}
                  </td>
                  <td className="p-3 text-right font-mono text-slate-800">
                    {numberFormatter.format(item.dipReading)}
                  </td>
                  <td className="p-3 text-right font-mono text-slate-800">
                    {numberFormatter.format(item.balancePetrel)}
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {item.diff < 0 ? (
                        <TrendingDown className="w-4 h-4 text-red-500" />
                      ) : item.diff > 0 ? (
                        <TrendingUp className="w-4 h-4 text-green-500" />
                      ) : null}
                      <span className={`font-mono font-bold ${
                        item.diff < 0 ? "text-red-600" : item.diff > 0 ? "text-green-600" : "text-gray-600"
                      }`}>
                        {item.diff > 0 ? "+" : ""}{item.diff}
                      </span>
                    </div>
                  </td>
                  <td className="p-3 text-center">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        item.status === "แจ้งเตือน"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredBalance.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              ไม่พบข้อมูล Balance Petrel
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
