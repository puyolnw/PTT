import { useState } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Upload,
  AlertTriangle,
  Fuel,
  TrendingDown,
  TrendingUp,
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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      alert(`กำลังประมวลผลไฟล์ ${file.name}...\n\nระบบจะเปรียบเทียบ Dip Reading vs Balance Petrel → แจ้งเตือน Diff`);
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h2 className="text-3xl font-bold text-app mb-2 font-display">Balance Petrel / Dip Reading - M1</h2>
        <p className="text-muted font-light">
          ประมวลผลสมุดน้ำมันใต้ดิน (Dip Reading) และสมุด Balance Petrel เปรียบเทียบ Dip vs ขายจริง → แจ้งเตือน Diff (ป้องกันการรั่วไหล) นำเข้า Excel จาก PTT BackOffice
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
            <FileText className="w-8 h-8 text-ptt-cyan" />
            <span className="text-sm text-muted">รายการทั้งหมด</span>
          </div>
          <p className="text-2xl font-bold text-app">{balanceData.length}</p>
          <p className="text-sm text-muted">รายการ</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="panel rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <AlertTriangle className="w-8 h-8 text-orange-400" />
            <span className="text-sm text-muted">แจ้งเตือน Diff</span>
          </div>
          <p className="text-2xl font-bold text-orange-400">{alertItems.length}</p>
          <p className="text-sm text-muted">รายการ</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="panel rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <Fuel className="w-8 h-8 text-emerald-400" />
            <span className="text-sm text-muted">สถานะปกติ</span>
          </div>
          <p className="text-2xl font-bold text-app">
            {balanceData.filter(item => item.status === "ปกติ").length}
          </p>
          <p className="text-sm text-muted">รายการ</p>
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
          <p className="text-2xl font-bold text-app">BALANCE_YYYYMMDD.xlsx</p>
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
            {
              label: "สถานะ",
              value: statusFilter,
              options: [{ value: "", label: "ทั้งหมด" }, { value: "ปกติ", label: "ปกติ" }, { value: "แจ้งเตือน", label: "แจ้งเตือน" }],
              onChange: setStatusFilter,
            },
          ]}
        />

        <div className="flex gap-2">
          <label className="flex items-center gap-2 px-4 py-2 bg-soft text-app rounded-lg hover:bg-app/10 transition-colors cursor-pointer">
            <Upload className="w-4 h-4" />
            <span>นำเข้า BALANCE_YYYYMMDD.xlsx</span>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
          <label className="flex items-center gap-2 px-4 py-2 bg-soft text-app rounded-lg hover:bg-app/10 transition-colors cursor-pointer">
            <Upload className="w-4 h-4" />
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

      {/* Balance List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="panel rounded-2xl p-6"
      >
        <div className="space-y-4">
          {filteredBalance.map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-xl border ${
                item.status === "แจ้งเตือน"
                  ? "bg-orange-500/10 border-orange-500/30"
                  : "bg-soft border-app"
              } hover:border-ptt-blue/30 transition-colors`}
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-semibold text-app">{item.fuelType}</p>
                  <p className="text-sm text-muted">{item.branch} • {item.tank}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2">
                    {item.diff < 0 ? (
                      <TrendingDown className="w-5 h-5 text-red-400" />
                    ) : item.diff > 0 ? (
                      <TrendingUp className="w-5 h-5 text-emerald-400" />
                    ) : null}
                    <span className={`text-lg font-bold ${
                      item.diff < 0 ? "text-red-400" : item.diff > 0 ? "text-emerald-400" : "text-app"
                    }`}>
                      {item.diff > 0 ? "+" : ""}{item.diff} ลิตร
                    </span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full mt-1 inline-block ${
                    item.status === "แจ้งเตือน"
                      ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                      : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                  }`}>
                    {item.status}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-3">
                <div className="bg-ptt-blue/10 border border-ptt-blue/30 rounded-lg p-3">
                  <p className="text-xs text-muted mb-1">Dip Reading</p>
                  <p className="text-lg font-semibold text-ptt-cyan">
                    {numberFormatter.format(item.dipReading)} ลิตร
                  </p>
                </div>
                <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
                  <p className="text-xs text-muted mb-1">Balance Petrel</p>
                  <p className="text-lg font-semibold text-purple-400">
                    {numberFormatter.format(item.balancePetrel)} ลิตร
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm mt-3">
                <span className="text-muted">
                  วันที่: {new Date(item.date).toLocaleDateString("th-TH")}
                </span>
                <span className="text-xs px-2 py-1 rounded-full bg-ptt-blue/10 text-ptt-cyan border border-ptt-blue/30">
                  {item.source}
                </span>
              </div>
            </div>
          ))}
          {filteredBalance.length === 0 && (
            <div className="text-center py-12 text-muted">
              ไม่พบข้อมูล Balance Petrel
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

