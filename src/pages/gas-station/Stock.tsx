import { useState } from "react";
import { motion } from "framer-motion";
import {
  Package,
  Upload,
  AlertTriangle,
  Fuel,
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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      alert(`กำลังประมวลผลไฟล์ ${file.name}...\n\nระบบจะอัปเดตสต็อกน้ำมันทุกถัง แยกตามปั๊มและชนิด`);
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h2 className="text-3xl font-bold text-app mb-2 font-display">สต็อกน้ำมัน - M1</h2>
        <p className="text-muted font-light">
          ติดตามสต็อกน้ำมันทุกถัง แยกตามปั๊มและชนิด (สต็อกรวม: 120,000 ลิตร - Diesel 40%, G95 30%) นำเข้า Excel จาก PTT BackOffice
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
            <Fuel className="w-8 h-8 text-ptt-cyan" />
            <span className="text-sm text-muted">สต็อกรวม</span>
          </div>
          <p className="text-2xl font-bold text-app">{numberFormatter.format(totalStock)}</p>
          <p className="text-sm text-muted">ลิตร</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="panel rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <Package className="w-8 h-8 text-emerald-400" />
            <span className="text-sm text-muted">ถังทั้งหมด</span>
          </div>
          <p className="text-2xl font-bold text-app">{stockData.length}</p>
          <p className="text-sm text-muted">ถัง</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="panel rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <AlertTriangle className="w-8 h-8 text-orange-400" />
            <span className="text-sm text-muted">ใกล้หมด</span>
          </div>
          <p className="text-2xl font-bold text-orange-400">{lowStockItems.length}</p>
          <p className="text-sm text-muted">ถัง</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="panel rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <Upload className="w-8 h-8 text-purple-400" />
            <span className="text-sm text-muted">จาก Excel</span>
          </div>
          <p className="text-2xl font-bold text-app">STOCK_YYYYMMDD.xlsx</p>
          <p className="text-sm text-muted">PTT BackOffice</p>
        </motion.div>
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
          <label className="flex items-center gap-2 px-4 py-2 bg-soft text-app rounded-lg hover:bg-app/10 transition-colors cursor-pointer">
            <Upload className="w-4 h-4" />
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="panel rounded-2xl p-6"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-app">
                <th className="text-left py-3 px-4 text-sm font-semibold text-app">ชนิดน้ำมัน</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-app">ถัง</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-app">สาขา</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-app">คงเหลือ</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-app">สถานะ</th>
              </tr>
            </thead>
            <tbody>
              {filteredStock.map((item) => (
                <tr key={item.id} className="border-b border-app/50 hover:bg-soft/50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Fuel className="w-4 h-4 text-ptt-cyan" />
                      <p className="font-medium text-app">{item.fuelType}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-app">{item.tank}</p>
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-app">{item.branch}</p>
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-app">
                      {numberFormatter.format(item.quantity)} {item.unit}
                    </p>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        item.lowStock
                          ? "bg-orange-500/10 text-orange-400 border border-orange-500/30"
                          : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
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
            <div className="text-center py-12 text-muted">
              ไม่พบข้อมูลสต็อกน้ำมัน
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

