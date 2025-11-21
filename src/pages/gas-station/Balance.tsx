import { useState } from "react";
import {
  FileText,
  Upload,
  TrendingDown,
  TrendingUp,
  Droplet,
  BookOpen,
} from "lucide-react";
import FilterBar from "@/components/FilterBar";

const numberFormatter = new Intl.NumberFormat("th-TH", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const decimalFormatter = new Intl.NumberFormat("th-TH", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

// Interface for Balance Petrel Data
interface BalanceItem {
  id: string;
  row: number;
  col1: number | null;
  col2: number;
  col3: number;
  col4: number;
  diff: number;
  col1A_1: number;
  col1A_2: number;
  col1B_1: number;
  col1B_2: number;
  col1C_1: number;
  col1C_2: number;
  col1D_1: number;
  col1D_2: number;
  col1E_1: number;
  col1E_2: number;
  col1F_1: number;
  col1F_2: number;
}

// Interface for Dip Reading Data
interface DipReadingItem {
  id: string;
  row: number;
  dateOrValue: string; // วันที่ (เช่น "3/5/60") หรือตัวเลข (เช่น "8000")
  hyphen: string; // "-" หรือค่าว่าง
  col1: number; // คอลัมน์ตัวเลขทศนิยม
  col2: number; // คอลัมน์ตัวเลขเต็ม
  diff: number; // คอลัมน์ที่มีเครื่องหมาย + (delta)
  col3: number; // คอลัมน์ตัวเลขทศนิยม
  col4: number; // คอลัมน์ตัวเลขทศนิยม
  // ส่วนขวา: 1B, 1C, 1D, 1E, 1F (แต่ละส่วนมีหลายคอลัมน์)
  col1B_1: number;
  col1B_2: number;
  col1B_3: number;
  col1B_4: number;
  col1B_5: number;
  col1C_1: number;
  col1C_2: number;
  col1C_3: number;
  col1C_4: number;
  col1C_5: number;
  col1D_1: number;
  col1D_2: number;
  col1D_3: number;
  col1D_4: number;
  col1D_5: number;
  col1E_1: number;
  col1E_2: number;
  col1E_3: number;
  col1E_4: number;
  col1E_5: number;
  col1F_1: number;
  col1F_2: number;
  col1F_3: number;
  col1F_4: number;
  col1F_5: number;
}

// Mock data - Balance Petrel
const initialBalanceData: BalanceItem[] = [
  {
    id: "1",
    row: 1,
    col1: 8000,
    col2: 3.5,
    col3: 12404.4,
    col4: 12350,
    diff: -94.4,
    col1A_1: 148945.1,
    col1A_2: 1770.9,
    col1B_1: 879079.8,
    col1B_2: 445.6,
    col1C_1: 508138,
    col1C_2: 2316.5,
    col1D_1: 143093,
    col1D_2: 272.4,
    col1E_1: 826014,
    col1E_2: 894.3,
    col1F_1: 457798.1,
    col1F_2: 146.9,
  },
  ...Array.from({ length: 29 }, (_, i) => ({
    id: `${2 + i}`,
    row: 2 + i,
    col1: i % 2 === 0 ? 8000 + i * 100 : null,
    col2: 5000 + i * 100 + Math.random() * 100,
    col3: 12000 + i * 200 + Math.random() * 200,
    col4: 12000 + i * 200 + Math.random() * 150,
    diff: (i % 3 === 0 ? -1 : 1) * (100 + i * 20 + Math.random() * 50),
    col1A_1: 150000 + i * 2000 + Math.random() * 1000,
    col1A_2: 2000 + i * 100 + Math.random() * 50,
    col1B_1: 880000 + i * 1000 + Math.random() * 500,
    col1B_2: 500 + i * 50 + Math.random() * 30,
    col1C_1: 510000 + i * 2000 + Math.random() * 1000,
    col1C_2: 2400 + i * 100 + Math.random() * 50,
    col1D_1: 144000 + i * 1000 + Math.random() * 500,
    col1D_2: 280 + i * 10 + Math.random() * 5,
    col1E_1: 828000 + i * 1000 + Math.random() * 500,
    col1E_2: 1000 + i * 50 + Math.random() * 30,
    col1F_1: 458000 + i * 1000 + Math.random() * 500,
    col1F_2: 200 + i * 20 + Math.random() * 10,
  })),
];

// Mock data - Dip Reading (สมุดน้ำมันใต้ดิน)
const initialDipReadingData: DipReadingItem[] = [
  {
    id: "D1",
    row: 1,
    dateOrValue: "3/5/60",
    hyphen: "-",
    col1: 5693.2,
    col2: 14996,
    diff: 34.2,
    col3: 23599.4,
    col4: 1802.9,
    col1B_1: 848162.5,
    col1B_2: 614.4,
    col1B_3: 398406.4,
    col1B_4: 2364.2,
    col1B_5: 620803.8,
    col1C_1: 274.8,
    col1C_2: 965286,
    col1C_3: 803,
    col1C_4: 49143.7,
    col1C_5: 33.9,
    col1D_1: 508138,
    col1D_2: 2316.5,
    col1D_3: 143093,
    col1D_4: 272.4,
    col1D_5: 826014,
    col1E_1: 894.3,
    col1E_2: 457798.1,
    col1E_3: 146.9,
    col1E_4: 148945.1,
    col1E_5: 1770.9,
    col1F_1: 879079.8,
    col1F_2: 445.6,
    col1F_3: 508138,
    col1F_4: 2316.5,
    col1F_5: 143093,
  },
  {
    id: "D2",
    row: 2,
    dateOrValue: "8000",
    hyphen: "-",
    col1: 14981.8,
    col2: 8819,
    diff: 12.8,
    col3: 25809.8,
    col4: 1960.4,
    col1B_1: 850000.2,
    col1B_2: 650.1,
    col1B_3: 400000.5,
    col1B_4: 2400.3,
    col1B_5: 625000.1,
    col1C_1: 280.5,
    col1C_2: 970000,
    col1C_3: 810,
    col1C_4: 49500.2,
    col1C_5: 35.2,
    col1D_1: 510000,
    col1D_2: 2350.1,
    col1D_3: 144000,
    col1D_4: 275.1,
    col1D_5: 828000,
    col1E_1: 900.1,
    col1E_2: 460000.2,
    col1E_3: 150.2,
    col1E_4: 150000.2,
    col1E_5: 1800.1,
    col1F_1: 880000.1,
    col1F_2: 450.2,
    col1F_3: 510000,
    col1F_4: 2350.1,
    col1F_5: 144000,
  },
  {
    id: "D3",
    row: 3,
    dateOrValue: "14000",
    hyphen: "-",
    col1: 6275.6,
    col2: 9882,
    diff: 35.8,
    col3: 28020.2,
    col4: 2117.9,
    col1B_1: 851837.9,
    col1B_2: 685.8,
    col1B_3: 401594.6,
    col1B_4: 2436.4,
    col1B_5: 629196.4,
    col1C_1: 286.2,
    col1C_2: 974714,
    col1C_3: 817,
    col1C_4: 49856.7,
    col1C_5: 36.5,
    col1D_1: 511862,
    col1D_2: 2383.7,
    col1D_3: 144907,
    col1D_4: 277.8,
    col1D_5: 829986,
    col1E_1: 905.9,
    col1E_2: 462202.3,
    col1E_3: 153.5,
    col1E_4: 151055.3,
    col1E_5: 1829.3,
    col1F_1: 880920.4,
    col1F_2: 454.8,
    col1F_3: 511862,
    col1F_4: 2383.7,
    col1F_5: 144907,
  },
  {
    id: "D4",
    row: 4,
    dateOrValue: "9000",
    hyphen: "-",
    col1: 8806.2,
    col2: 14981,
    diff: 105.3,
    col3: 30230.6,
    col4: 2275.4,
    col1B_1: 853675.6,
    col1B_2: 721.5,
    col1B_3: 403188.7,
    col1B_4: 2472.5,
    col1B_5: 633392.7,
    col1C_1: 291.9,
    col1C_2: 979428,
    col1C_3: 824,
    col1C_4: 50213.2,
    col1C_5: 37.8,
    col1D_1: 513724,
    col1D_2: 2417.3,
    col1D_3: 145814,
    col1D_4: 280.5,
    col1D_5: 831972,
    col1E_1: 911.7,
    col1E_2: 464404.4,
    col1E_3: 156.8,
    col1E_4: 152110.4,
    col1E_5: 1858.5,
    col1F_1: 881840.7,
    col1F_2: 459.4,
    col1F_3: 513724,
    col1F_4: 2417.3,
    col1F_5: 145814,
  },
  {
    id: "D5",
    row: 5,
    dateOrValue: "13000",
    hyphen: "-",
    col1: 14981.8,
    col2: 8819,
    diff: 99.8,
    col3: 32441.0,
    col4: 2432.9,
    col1B_1: 855513.3,
    col1B_2: 757.2,
    col1B_3: 404782.8,
    col1B_4: 2508.6,
    col1B_5: 637589.0,
    col1C_1: 297.6,
    col1C_2: 984142,
    col1C_3: 831,
    col1C_4: 50569.7,
    col1C_5: 39.1,
    col1D_1: 515586,
    col1D_2: 2450.9,
    col1D_3: 146721,
    col1D_4: 283.2,
    col1D_5: 833958,
    col1E_1: 917.5,
    col1E_2: 466606.5,
    col1E_3: 160.1,
    col1E_4: 153165.5,
    col1E_5: 1887.7,
    col1F_1: 882760.0,
    col1F_2: 464.0,
    col1F_3: 515586,
    col1F_4: 2450.9,
    col1F_5: 146721,
  },
  ...Array.from({ length: 18 }, (_, i) => ({
    id: `D${6 + i}`,
    row: 6 + i,
    dateOrValue: i % 3 === 0 ? `${3 + i}/5/60` : `${8000 + i * 1000}`,
    hyphen: "-",
    col1: 5000 + i * 200 + Math.random() * 100,
    col2: 8000 + i * 300 + Math.random() * 200,
    diff: 20 + i * 10 + Math.random() * 50,
    col3: 20000 + i * 1000 + Math.random() * 500,
    col4: 1500 + i * 50 + Math.random() * 30,
    col1B_1: 850000 + i * 5000 + Math.random() * 2000,
    col1B_2: 600 + i * 20 + Math.random() * 10,
    col1B_3: 400000 + i * 3000 + Math.random() * 1500,
    col1B_4: 2400 + i * 30 + Math.random() * 15,
    col1B_5: 620000 + i * 4000 + Math.random() * 2000,
    col1C_1: 270 + i * 5 + Math.random() * 3,
    col1C_2: 960000 + i * 8000 + Math.random() * 4000,
    col1C_3: 800 + i * 10 + Math.random() * 5,
    col1C_4: 49000 + i * 500 + Math.random() * 250,
    col1C_5: 33 + i * 0.5 + Math.random() * 0.3,
    col1D_1: 508000 + i * 2000 + Math.random() * 1000,
    col1D_2: 2300 + i * 20 + Math.random() * 10,
    col1D_3: 143000 + i * 1000 + Math.random() * 500,
    col1D_4: 270 + i * 2 + Math.random() * 1,
    col1D_5: 826000 + i * 2000 + Math.random() * 1000,
    col1E_1: 890 + i * 5 + Math.random() * 3,
    col1E_2: 457000 + i * 2000 + Math.random() * 1000,
    col1E_3: 145 + i * 2 + Math.random() * 1,
    col1E_4: 148000 + i * 1500 + Math.random() * 750,
    col1E_5: 1770 + i * 10 + Math.random() * 5,
    col1F_1: 879000 + i * 2000 + Math.random() * 1000,
    col1F_2: 445 + i * 2 + Math.random() * 1,
    col1F_3: 508000 + i * 2000 + Math.random() * 1000,
    col1F_4: 2300 + i * 20 + Math.random() * 10,
    col1F_5: 143000 + i * 1000 + Math.random() * 500,
  })),
];

export default function Balance() {
  const [activeTab, setActiveTab] = useState<"balance" | "dip">("balance");
  const [balanceData] = useState(initialBalanceData);
  const [dipReadingData] = useState(initialDipReadingData);
  const [searchQuery, setSearchQuery] = useState("");
  const [branchFilter, setBranchFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const filteredBalance = balanceData.filter((item) => {
    const matchesSearch = searchQuery === "" || 
      item.row.toString().includes(searchQuery) ||
      item.col1?.toString().includes(searchQuery) ||
      item.col2.toString().includes(searchQuery);
    return matchesSearch;
  });

  const filteredDipReading = dipReadingData.filter((item) => {
    const matchesSearch = searchQuery === "" || 
      item.row.toString().includes(searchQuery) ||
      item.dateOrValue.includes(searchQuery) ||
      item.col1.toString().includes(searchQuery);
    return matchesSearch;
  });

  const alertItems = balanceData.filter(item => Math.abs(item.diff) > 50);
  const normalItems = balanceData.filter(item => Math.abs(item.diff) <= 50);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      alert(`กำลังประมวลผลไฟล์ ${file.name}...\n\nระบบจะเปรียบเทียบ Dip Reading vs Balance Petrel → แจ้งเตือน Diff`);
    }
  };

  return (
    <div className="p-6 max-w-[1800px] mx-auto space-y-6">
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
          <div className="text-2xl font-bold text-blue-900">
            {activeTab === "balance" ? balanceData.length : dipReadingData.length}
          </div>
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
          <div className="text-xl font-bold text-slate-800">
            {activeTab === "balance" ? "BALANCE" : "DIP"}
          </div>
          <div className="w-full bg-gray-100 h-1.5 rounded-full mt-2">
            <div
              className="bg-purple-500 h-1.5 rounded-full"
              style={{ width: "100%" }}
            />
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-200 bg-white rounded-t-lg px-4 pt-2">
        <button
          onClick={() => setActiveTab("balance")}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "balance"
              ? "border-blue-600 text-blue-600 bg-blue-50/50"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <FileText className="h-4 w-4" />
          สมุด Balance Petrel
        </button>
        <button
          onClick={() => setActiveTab("dip")}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "dip"
              ? "border-blue-600 text-blue-600 bg-blue-50/50"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <BookOpen className="h-4 w-4" />
          สมุดน้ำมันใต้ดิน (Dip Reading)
        </button>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between bg-white rounded-b-lg px-6 pb-4">
        <FilterBar
          onSearch={setSearchQuery}
          filters={[
            {
              label: "สาขา",
              value: branchFilter,
              options: [{ value: "", label: "ทั้งหมด" }],
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

      {/* Content Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Balance Petrel Table */}
        {activeTab === "balance" && (
          <div>
            <div className="p-6 border-b border-gray-200">
              <h3 className="font-bold text-slate-700">รายการ Balance Petrel</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 uppercase text-gray-500 sticky top-0">
                  <tr>
                    <th rowSpan={2} className="p-2 border border-gray-300 text-center">#</th>
                    <th colSpan={5} className="p-2 border border-gray-300 text-center bg-blue-50">ส่วนซ้าย</th>
                    <th colSpan={12} className="p-2 border border-gray-300 text-center bg-green-50">ส่วนขวา</th>
                  </tr>
                  <tr>
                    <th className="p-2 border border-gray-300 text-center">1</th>
                    <th className="p-2 border border-gray-300 text-center">2</th>
                    <th className="p-2 border border-gray-300 text-center">3</th>
                    <th className="p-2 border border-gray-300 text-center">4</th>
                    <th className="p-2 border border-gray-300 text-center">Diff</th>
                    <th className="p-2 border border-gray-300 text-center">1A-1</th>
                    <th className="p-2 border border-gray-300 text-center">1A-2</th>
                    <th className="p-2 border border-gray-300 text-center">1B-1</th>
                    <th className="p-2 border border-gray-300 text-center">1B-2</th>
                    <th className="p-2 border border-gray-300 text-center">1C-1</th>
                    <th className="p-2 border border-gray-300 text-center">1C-2</th>
                    <th className="p-2 border border-gray-300 text-center">1D-1</th>
                    <th className="p-2 border border-gray-300 text-center">1D-2</th>
                    <th className="p-2 border border-gray-300 text-center">1E-1</th>
                    <th className="p-2 border border-gray-300 text-center">1E-2</th>
                    <th className="p-2 border border-gray-300 text-center">1F-1</th>
                    <th className="p-2 border border-gray-300 text-center">1F-2</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredBalance.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="p-2 border border-gray-200 text-center font-semibold text-gray-700">
                        {item.row}
                      </td>
                      <td className="p-2 border border-gray-200 text-right font-mono text-slate-800">
                        {item.col1 !== null ? numberFormatter.format(item.col1) : "-"}
                      </td>
                      <td className="p-2 border border-gray-200 text-right font-mono text-slate-800">
                        {decimalFormatter.format(item.col2)}
                      </td>
                      <td className="p-2 border border-gray-200 text-right font-mono text-slate-800">
                        {decimalFormatter.format(item.col3)}
                      </td>
                      <td className="p-2 border border-gray-200 text-right font-mono text-slate-800">
                        {decimalFormatter.format(item.col4)}
                      </td>
                      <td className="p-2 border border-gray-200 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {item.diff < 0 ? (
                            <TrendingDown className="w-3 h-3 text-red-500" />
                          ) : item.diff > 0 ? (
                            <TrendingUp className="w-3 h-3 text-green-500" />
                          ) : null}
                          <span className={`font-mono font-bold text-xs ${
                            item.diff < 0 ? "text-red-600" : item.diff > 0 ? "text-green-600" : "text-gray-600"
                          }`}>
                            {item.diff > 0 ? "+" : ""}{decimalFormatter.format(item.diff)}
                          </span>
                        </div>
                      </td>
                      <td className="p-2 border border-gray-200 text-right font-mono text-slate-800">
                        {decimalFormatter.format(item.col1A_1)}
                      </td>
                      <td className="p-2 border border-gray-200 text-right font-mono text-slate-800">
                        {decimalFormatter.format(item.col1A_2)}
                      </td>
                      <td className="p-2 border border-gray-200 text-right font-mono text-slate-800">
                        {decimalFormatter.format(item.col1B_1)}
                      </td>
                      <td className="p-2 border border-gray-200 text-right font-mono text-slate-800">
                        {decimalFormatter.format(item.col1B_2)}
                      </td>
                      <td className="p-2 border border-gray-200 text-right font-mono text-slate-800">
                        {numberFormatter.format(item.col1C_1)}
                      </td>
                      <td className="p-2 border border-gray-200 text-right font-mono text-slate-800">
                        {decimalFormatter.format(item.col1C_2)}
                      </td>
                      <td className="p-2 border border-gray-200 text-right font-mono text-slate-800">
                        {decimalFormatter.format(item.col1D_1)}
                      </td>
                      <td className="p-2 border border-gray-200 text-right font-mono text-slate-800">
                        {decimalFormatter.format(item.col1D_2)}
                      </td>
                      <td className="p-2 border border-gray-200 text-right font-mono text-slate-800">
                        {numberFormatter.format(item.col1E_1)}
                      </td>
                      <td className="p-2 border border-gray-200 text-right font-mono text-slate-800">
                        {decimalFormatter.format(item.col1E_2)}
                      </td>
                      <td className="p-2 border border-gray-200 text-right font-mono text-slate-800">
                        {decimalFormatter.format(item.col1F_1)}
                      </td>
                      <td className="p-2 border border-gray-200 text-right font-mono text-slate-800">
                        {decimalFormatter.format(item.col1F_2)}
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
        )}

        {/* Dip Reading Table */}
        {activeTab === "dip" && (
          <div>
            <div className="p-6 border-b border-gray-200">
              <h3 className="font-bold text-slate-700">รายการสมุดน้ำมันใต้ดิน (Dip Reading)</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 uppercase text-gray-500 sticky top-0">
                  <tr>
                    <th rowSpan={2} className="p-2 border border-gray-300 text-center">#</th>
                    <th colSpan={7} className="p-2 border border-gray-300 text-center bg-blue-50">ส่วนซ้าย (JA)</th>
                    <th colSpan={25} className="p-2 border border-gray-300 text-center bg-green-50">ส่วนขวา</th>
                  </tr>
                  <tr>
                    {/* ส่วนซ้าย */}
                    <th className="p-2 border border-gray-300 text-center">วัน/เดือน/ปี</th>
                    <th className="p-2 border border-gray-300 text-center">-</th>
                    <th className="p-2 border border-gray-300 text-center">ค่า</th>
                    <th className="p-2 border border-gray-300 text-center">รวม</th>
                    <th className="p-2 border border-gray-300 text-center">+</th>
                    <th className="p-2 border border-gray-300 text-center">ค่า</th>
                    <th className="p-2 border border-gray-300 text-center">ค่า</th>
                    {/* ส่วนขวา - 1B */}
                    <th colSpan={5} className="p-2 border border-gray-300 text-center bg-yellow-50">1B</th>
                    {/* ส่วนขวา - 1C */}
                    <th colSpan={5} className="p-2 border border-gray-300 text-center bg-orange-50">1C</th>
                    {/* ส่วนขวา - 1D */}
                    <th colSpan={5} className="p-2 border border-gray-300 text-center bg-pink-50">1D</th>
                    {/* ส่วนขวา - 1E */}
                    <th colSpan={5} className="p-2 border border-gray-300 text-center bg-purple-50">1E</th>
                    {/* ส่วนขวา - 1F */}
                    <th colSpan={5} className="p-2 border border-gray-300 text-center bg-indigo-50">1F</th>
                  </tr>
                  <tr className="bg-gray-100">
                    <th className="p-1 border border-gray-300"></th>
                    <th className="p-1 border border-gray-300"></th>
                    <th className="p-1 border border-gray-300"></th>
                    <th className="p-1 border border-gray-300"></th>
                    <th className="p-1 border border-gray-300"></th>
                    <th className="p-1 border border-gray-300"></th>
                    <th className="p-1 border border-gray-300"></th>
                    <th className="p-1 border border-gray-300"></th>
                    {/* 1B sub-columns */}
                    <th className="p-1 border border-gray-300 text-center">1</th>
                    <th className="p-1 border border-gray-300 text-center">2</th>
                    <th className="p-1 border border-gray-300 text-center">3</th>
                    <th className="p-1 border border-gray-300 text-center">4</th>
                    <th className="p-1 border border-gray-300 text-center">5</th>
                    {/* 1C sub-columns */}
                    <th className="p-1 border border-gray-300 text-center">1</th>
                    <th className="p-1 border border-gray-300 text-center">2</th>
                    <th className="p-1 border border-gray-300 text-center">3</th>
                    <th className="p-1 border border-gray-300 text-center">4</th>
                    <th className="p-1 border border-gray-300 text-center">5</th>
                    {/* 1D sub-columns */}
                    <th className="p-1 border border-gray-300 text-center">1</th>
                    <th className="p-1 border border-gray-300 text-center">2</th>
                    <th className="p-1 border border-gray-300 text-center">3</th>
                    <th className="p-1 border border-gray-300 text-center">4</th>
                    <th className="p-1 border border-gray-300 text-center">5</th>
                    {/* 1E sub-columns */}
                    <th className="p-1 border border-gray-300 text-center">1</th>
                    <th className="p-1 border border-gray-300 text-center">2</th>
                    <th className="p-1 border border-gray-300 text-center">3</th>
                    <th className="p-1 border border-gray-300 text-center">4</th>
                    <th className="p-1 border border-gray-300 text-center">5</th>
                    {/* 1F sub-columns */}
                    <th className="p-1 border border-gray-300 text-center">1</th>
                    <th className="p-1 border border-gray-300 text-center">2</th>
                    <th className="p-1 border border-gray-300 text-center">3</th>
                    <th className="p-1 border border-gray-300 text-center">4</th>
                    <th className="p-1 border border-gray-300 text-center">5</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredDipReading.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="p-2 border border-gray-200 text-center font-semibold text-gray-700">
                        {item.row}
                      </td>
                      {/* ส่วนซ้าย */}
                      <td className="p-2 border border-gray-200 text-center font-mono text-slate-800">
                        {item.dateOrValue}
                      </td>
                      <td className="p-2 border border-gray-200 text-center text-gray-400">
                        {item.hyphen}
                      </td>
                      <td className="p-2 border border-gray-200 text-right font-mono text-slate-800">
                        {decimalFormatter.format(item.col1)}
                      </td>
                      <td className="p-2 border border-gray-200 text-right font-mono text-slate-800">
                        {numberFormatter.format(item.col2)}
                      </td>
                      <td className="p-2 border border-gray-200 text-right">
                        <span className="font-mono font-bold text-xs text-green-600">
                          +{decimalFormatter.format(item.diff)}
                        </span>
                      </td>
                      <td className="p-2 border border-gray-200 text-right font-mono text-slate-800">
                        {decimalFormatter.format(item.col3)}
                      </td>
                      <td className="p-2 border border-gray-200 text-right font-mono text-slate-800">
                        {decimalFormatter.format(item.col4)}
                      </td>
                      {/* ส่วนขวา - 1B */}
                      <td className="p-2 border border-gray-200 text-right font-mono text-slate-800 bg-yellow-50/30">
                        {decimalFormatter.format(item.col1B_1)}
                      </td>
                      <td className="p-2 border border-gray-200 text-right font-mono text-slate-800 bg-yellow-50/30">
                        {decimalFormatter.format(item.col1B_2)}
                      </td>
                      <td className="p-2 border border-gray-200 text-right font-mono text-slate-800 bg-yellow-50/30">
                        {decimalFormatter.format(item.col1B_3)}
                      </td>
                      <td className="p-2 border border-gray-200 text-right font-mono text-slate-800 bg-yellow-50/30">
                        {decimalFormatter.format(item.col1B_4)}
                      </td>
                      <td className="p-2 border border-gray-200 text-right font-mono text-slate-800 bg-yellow-50/30">
                        {decimalFormatter.format(item.col1B_5)}
                      </td>
                      {/* ส่วนขวา - 1C */}
                      <td className="p-2 border border-gray-200 text-right font-mono text-slate-800 bg-orange-50/30">
                        {decimalFormatter.format(item.col1C_1)}
                      </td>
                      <td className="p-2 border border-gray-200 text-right font-mono text-slate-800 bg-orange-50/30">
                        {numberFormatter.format(item.col1C_2)}
                      </td>
                      <td className="p-2 border border-gray-200 text-right font-mono text-slate-800 bg-orange-50/30">
                        {numberFormatter.format(item.col1C_3)}
                      </td>
                      <td className="p-2 border border-gray-200 text-right font-mono text-slate-800 bg-orange-50/30">
                        {decimalFormatter.format(item.col1C_4)}
                      </td>
                      <td className="p-2 border border-gray-200 text-right font-mono text-slate-800 bg-orange-50/30">
                        {decimalFormatter.format(item.col1C_5)}
                      </td>
                      {/* ส่วนขวา - 1D */}
                      <td className="p-2 border border-gray-200 text-right font-mono text-slate-800 bg-pink-50/30">
                        {numberFormatter.format(item.col1D_1)}
                      </td>
                      <td className="p-2 border border-gray-200 text-right font-mono text-slate-800 bg-pink-50/30">
                        {decimalFormatter.format(item.col1D_2)}
                      </td>
                      <td className="p-2 border border-gray-200 text-right font-mono text-slate-800 bg-pink-50/30">
                        {numberFormatter.format(item.col1D_3)}
                      </td>
                      <td className="p-2 border border-gray-200 text-right font-mono text-slate-800 bg-pink-50/30">
                        {decimalFormatter.format(item.col1D_4)}
                      </td>
                      <td className="p-2 border border-gray-200 text-right font-mono text-slate-800 bg-pink-50/30">
                        {numberFormatter.format(item.col1D_5)}
                      </td>
                      {/* ส่วนขวา - 1E */}
                      <td className="p-2 border border-gray-200 text-right font-mono text-slate-800 bg-purple-50/30">
                        {decimalFormatter.format(item.col1E_1)}
                      </td>
                      <td className="p-2 border border-gray-200 text-right font-mono text-slate-800 bg-purple-50/30">
                        {decimalFormatter.format(item.col1E_2)}
                      </td>
                      <td className="p-2 border border-gray-200 text-right font-mono text-slate-800 bg-purple-50/30">
                        {decimalFormatter.format(item.col1E_3)}
                      </td>
                      <td className="p-2 border border-gray-200 text-right font-mono text-slate-800 bg-purple-50/30">
                        {decimalFormatter.format(item.col1E_4)}
                      </td>
                      <td className="p-2 border border-gray-200 text-right font-mono text-slate-800 bg-purple-50/30">
                        {decimalFormatter.format(item.col1E_5)}
                      </td>
                      {/* ส่วนขวา - 1F */}
                      <td className="p-2 border border-gray-200 text-right font-mono text-slate-800 bg-indigo-50/30">
                        {decimalFormatter.format(item.col1F_1)}
                      </td>
                      <td className="p-2 border border-gray-200 text-right font-mono text-slate-800 bg-indigo-50/30">
                        {decimalFormatter.format(item.col1F_2)}
                      </td>
                      <td className="p-2 border border-gray-200 text-right font-mono text-slate-800 bg-indigo-50/30">
                        {numberFormatter.format(item.col1F_3)}
                      </td>
                      <td className="p-2 border border-gray-200 text-right font-mono text-slate-800 bg-indigo-50/30">
                        {decimalFormatter.format(item.col1F_4)}
                      </td>
                      <td className="p-2 border border-gray-200 text-right font-mono text-slate-800 bg-indigo-50/30">
                        {numberFormatter.format(item.col1F_5)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredDipReading.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  ไม่พบข้อมูลสมุดน้ำมันใต้ดิน
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
