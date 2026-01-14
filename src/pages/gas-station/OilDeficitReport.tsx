import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import {
  Check,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Download,
  Droplet,
  Eye,
  Filter,
  Info,
  Search,
  X,
} from "lucide-react";

const numberFormatter = new Intl.NumberFormat("th-TH", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const currencyFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

// ประเภทสาขา
type BranchType = "HISO" | "Dindam" | "NongChik" | "Taksila" | "Bypass";

// ชนิดน้ำมัน
type OilType =
  | "Premium Diesel"
  | "Premium Gasohol 95"
  | "Diesel"
  | "E85"
  | "E20"
  | "Gasohol 91"
  | "Gasohol 95";

// ข้อมูลจำนวนลิตรที่ขายแยกตามชนิดน้ำมัน
interface OilQuantity {
  oilType: OilType;
  quantity: number; // จำนวนลิตร
  sales: number; // ยอดขาย (เงิน)
}

// ข้อมูลรายงานรายเดือนของแต่ละสาขา
interface BranchMonthlyData {
  id: string;
  branch: BranchType;
  year: number;
  month: number; // 1..12
  sales: number; // ยอดขายรวม (เงิน)
  quantitySold: number; // จำนวนลิตรรวมที่ขายไป
  oilQuantities: OilQuantity[]; // จำนวนลิตรแยกตามชนิดน้ำมัน
}

const thaiMonths = [
  "มกราคม",
  "กุมภาพันธ์",
  "มีนาคม",
  "เมษายน",
  "พฤษภาคม",
  "มิถุนายน",
  "กรกฎาคม",
  "สิงหาคม",
  "กันยายน",
  "ตุลาคม",
  "พฤศจิกายน",
  "ธันวาคม",
];

// ราคาต่อลิตรของแต่ละชนิดน้ำมัน (บาท)
const oilPrices: Record<OilType, number> = {
  "Premium Diesel": 33.49,
  "Premium Gasohol 95": 41.49,
  Diesel: 32.49,
  E85: 28.99,
  E20: 35.99,
  "Gasohol 91": 38.99,
  "Gasohol 95": 40.99,
};

// ชื่อภาษาไทยของแต่ละชนิดน้ำมัน
const getOilTypeLabel = (oilType: OilType): string => {
  const labels: Record<OilType, string> = {
    "Premium Diesel": "ดีเซลพรีเมียม",
    "Premium Gasohol 95": "แก๊สโซฮอล์ 95 พรีเมียม",
    Diesel: "ดีเซล",
    E85: "E85",
    E20: "E20",
    "Gasohol 91": "แก๊สโซฮอล์ 91",
    "Gasohol 95": "แก๊สโซฮอล์ 95",
  };
  return labels[oilType];
};

const getBranchLabel = (branch: BranchType): string => {
  const labels: Record<BranchType, string> = {
    HISO: "ปั๊มไฮโซ",
    Dindam: "ดินดำ",
    NongChik: "หนองจิก",
    Taksila: "ตักสิลา",
    Bypass: "บายพาส",
  };
  return labels[branch];
};

// Mock data - สร้างข้อมูลรายเดือนของแต่ละสาขา
const generateBranchData = (): BranchMonthlyData[] => {
  const branches: BranchType[] = ["HISO", "Dindam", "NongChik", "Taksila", "Bypass"];
  const oilTypes: OilType[] = [
    "Premium Diesel",
    "Premium Gasohol 95",
    "Diesel",
    "E85",
    "E20",
    "Gasohol 91",
    "Gasohol 95",
  ];
  const data: BranchMonthlyData[] = [];

  // สัดส่วนการขายของแต่ละชนิดน้ำมัน (เปอร์เซ็นต์)
  const oilDistribution: Record<OilType, number> = {
    "Premium Diesel": 25,
    "Premium Gasohol 95": 20,
    Diesel: 30,
    E85: 5,
    E20: 8,
    "Gasohol 91": 7,
    "Gasohol 95": 5,
  };

  const buildYear = (year: number, baseStart: number, branchStep: number, monthStep: number) => {
    branches.forEach((branch, branchIdx) => {
      for (let month = 1; month <= 12; month++) {
        const baseSales = baseStart + branchIdx * branchStep + month * monthStep;
        const oilQuantities: OilQuantity[] = [];
        let totalQuantity = 0;

        oilTypes.forEach((oilType) => {
          const percentage = oilDistribution[oilType];
          const oilSales = Math.round((baseSales * percentage) / 100);
          const price = oilPrices[oilType];
          const quantity = Math.round(oilSales / price);

          oilQuantities.push({ oilType, quantity, sales: oilSales });
          totalQuantity += quantity;
        });

        data.push({
          id: `${branch}-${year}-${String(month).padStart(2, "0")}`,
          branch,
          year,
          month,
          sales: baseSales,
          quantitySold: totalQuantity,
          oilQuantities,
        });
      }
    });
  };

  buildYear(2567, 400_000, 50_000, 2_000);
  buildYear(2566, 500_000, 60_000, 2_500);
  return data;
};

type FilterKey = "month" | "branch";
type SortKey = "month" | "branch" | "sales" | "quantitySold";

export default function OilDeficitReport() {
  const [selectedYear, setSelectedYear] = useState<number>(2567);
  const [searchTerm, setSearchTerm] = useState("");
  const [columnFilters, setColumnFilters] = useState<{ month: string; branch: string }>({
    month: "ทั้งหมด",
    branch: "ทั้งหมด",
  });
  const [activeHeaderDropdown, setActiveHeaderDropdown] = useState<FilterKey | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: "asc" | "desc" | null }>({
    key: "month",
    direction: "asc",
  });

  const [viewRow, setViewRow] = useState<BranchMonthlyData | null>(null);

  const allRows = useMemo(() => generateBranchData(), []);
  const yearRows = useMemo(() => allRows.filter((r) => r.year === selectedYear), [allRows, selectedYear]);

  const filterOptions = useMemo(() => {
    const monthOpts = Array.from(new Set(yearRows.map((r) => r.month)))
      .sort((a, b) => a - b)
      .map((m) => thaiMonths[m - 1]);
    const branchOpts = Array.from(new Set(yearRows.map((r) => r.branch))).sort((a, b) => a.localeCompare(b));

    return {
      month: ["ทั้งหมด", ...monthOpts],
      branch: ["ทั้งหมด", ...branchOpts.map((b) => getBranchLabel(b))],
    };
  }, [yearRows]);

  const handleSort = (key: SortKey) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        if (prev.direction === "asc") return { key, direction: "desc" };
        if (prev.direction === "desc") return { key, direction: null };
        return { key, direction: "asc" };
      }
      return { key, direction: "asc" };
    });
  };

  const getSortIcon = (key: SortKey) => {
    if (sortConfig.key !== key || !sortConfig.direction) {
      return <ChevronsUpDown className="w-3 h-3 opacity-30" />;
    }
    return sortConfig.direction === "asc" ? (
      <ChevronUp className="w-3 h-3 text-emerald-500" />
    ) : (
      <ChevronDown className="w-3 h-3 text-emerald-500" />
    );
  };

  const filteredRows = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    let rows = yearRows.filter((r) => {
      const monthLabel = thaiMonths[r.month - 1] ?? String(r.month);
      const branchLabel = getBranchLabel(r.branch);

      const matchesSearch =
        term === "" ||
        monthLabel.toLowerCase().includes(term) ||
        branchLabel.toLowerCase().includes(term) ||
        r.oilQuantities.some((o) => getOilTypeLabel(o.oilType).toLowerCase().includes(term));

      const matchesMonth = columnFilters.month === "ทั้งหมด" || monthLabel === columnFilters.month;
      const matchesBranch = columnFilters.branch === "ทั้งหมด" || branchLabel === columnFilters.branch;

      return matchesSearch && matchesMonth && matchesBranch;
    });

    if (sortConfig.key && sortConfig.direction) {
      const dir = sortConfig.direction === "asc" ? 1 : -1;
      rows = rows.slice().sort((a, b) => {
        switch (sortConfig.key) {
          case "month":
            return (a.month - b.month) * dir;
          case "branch":
            return getBranchLabel(a.branch).localeCompare(getBranchLabel(b.branch)) * dir;
          case "sales":
            return (a.sales - b.sales) * dir;
          case "quantitySold":
            return (a.quantitySold - b.quantitySold) * dir;
        }
      });
    }

    return rows;
  }, [yearRows, searchTerm, columnFilters, sortConfig]);

  const summary = useMemo(() => {
    const totalSales = filteredRows.reduce((sum, r) => sum + r.sales, 0);
    const totalLiters = filteredRows.reduce((sum, r) => sum + r.quantitySold, 0);
    const months = new Set(filteredRows.map((r) => r.month)).size;
    const branches = new Set(filteredRows.map((r) => r.branch)).size;
    return { totalSales, totalLiters, months, branches };
  }, [filteredRows]);

  const isAnyFilterActive = useMemo(() => {
    return searchTerm !== "" || columnFilters.month !== "ทั้งหมด" || columnFilters.branch !== "ทั้งหมด";
  }, [searchTerm, columnFilters]);

  const HeaderWithFilter = ({
    label,
    columnKey,
    filterKey,
    options,
    align = "left",
  }: {
    label: string;
    columnKey?: SortKey;
    filterKey?: FilterKey;
    options?: string[];
    align?: "left" | "right" | "center";
  }) => {
    const justify =
      align === "right" ? "justify-end" : align === "center" ? "justify-center" : "justify-start";
    const isActiveFilter = filterKey ? columnFilters[filterKey] !== "ทั้งหมด" : false;

    return (
      <th className={`px-6 py-4 relative group ${align === "right" ? "text-right" : align === "center" ? "text-center" : ""}`}>
        <div className={`flex items-center gap-2 ${justify}`}>
          <button
            type="button"
            className={`flex items-center gap-1.5 hover:text-gray-900 dark:hover:text-white transition-colors ${
              sortConfig.key === columnKey ? "text-emerald-600" : ""
            } ${columnKey ? "cursor-pointer" : "cursor-default"}`}
            onClick={() => columnKey && handleSort(columnKey)}
            aria-label={columnKey ? `เรียงข้อมูลคอลัมน์ ${label}` : label}
            disabled={!columnKey}
          >
            <span>{label}</span>
            {columnKey && getSortIcon(columnKey)}
          </button>

          {filterKey && options && (
            <div className="relative">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveHeaderDropdown(activeHeaderDropdown === filterKey ? null : filterKey);
                }}
                className={`p-1 rounded-md transition-all ${
                  isActiveFilter ? "bg-emerald-500 text-white shadow-sm" : "hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400"
                }`}
                aria-label={`ตัวกรองคอลัมน์ ${label}`}
              >
                <Filter className="w-3 h-3" />
              </button>

              <AnimatePresence>
                {activeHeaderDropdown === filterKey && (
                  <>
                    <button
                      type="button"
                      className="fixed inset-0 z-10 bg-transparent"
                      onClick={() => setActiveHeaderDropdown(null)}
                      aria-label="ปิดตัวกรอง"
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute left-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 z-20 py-1 overflow-hidden"
                    >
                      {options.map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => {
                            setColumnFilters((prev) => ({ ...prev, [filterKey]: opt }));
                            setActiveHeaderDropdown(null);
                          }}
                          className={`w-full text-left px-4 py-2 text-xs font-bold transition-colors flex items-center justify-between ${
                            columnFilters[filterKey] === opt
                              ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400"
                              : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                          }`}
                        >
                          {opt}
                          {columnFilters[filterKey] === opt && <Check className="w-3 h-3" />}
                        </button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </th>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      <header className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
              <div className="p-2 bg-emerald-500 rounded-2xl shadow-lg shadow-emerald-500/20">
                <Droplet className="w-8 h-8 text-white" />
              </div>
              รายงานยอดขาดน้ำมัน
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">
              แสดงยอดขายและปริมาณจำหน่ายรายเดือน แยกตามสาขา (Mock data)
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <select
              value={selectedYear}
              onChange={(e) => {
                setSelectedYear(Number(e.target.value));
                setSearchTerm("");
                setColumnFilters({ month: "ทั้งหมด", branch: "ทั้งหมด" });
                setActiveHeaderDropdown(null);
              }}
              className="px-4 py-3 text-sm rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/40 font-bold"
            >
              <option value={2567}>2567</option>
              <option value={2566}>2566</option>
            </select>

            <button
              type="button"
              onClick={() => alert("ส่งออกข้อมูลเป็น Excel (ฟังก์ชันนี้จะเชื่อมต่อกับระบบจริง)")}
              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-bold shadow-lg shadow-emerald-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              ส่งออก Excel
            </button>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl">
              <Droplet className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">ยอดขายรวม</p>
              <p className="text-2xl font-black text-gray-900 dark:text-white">{currencyFormatter.format(summary.totalSales)}</p>
            </div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl">
              <Filter className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">ลิตรที่ขายรวม</p>
              <p className="text-2xl font-black text-gray-900 dark:text-white">{numberFormatter.format(summary.totalLiters)} ลิตร</p>
            </div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl">
              <Filter className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">จำนวนเดือน</p>
              <p className="text-2xl font-black text-gray-900 dark:text-white">{summary.months} เดือน</p>
            </div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl">
              <Filter className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">จำนวนสาขา</p>
              <p className="text-2xl font-black text-gray-900 dark:text-white">{summary.branches} สาขา</p>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-3xl p-4 mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Info className="w-6 h-6 text-emerald-500" />
          <div>
            <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">
              ค้นหา/กรองได้ที่หัวคอลัมน์ (เดือน/สาขา) และกดปุ่ม “ดู” เพื่อดูรายละเอียดตามชนิดน้ำมัน
            </p>
            <p className="text-xs text-emerald-800/80 dark:text-emerald-200/80 mt-1">
              หมายเหตุ: เป็นข้อมูลตัวอย่าง (mock) เพื่อจัดมาตรฐาน UI/UX ให้เหมือนหน้า Master
            </p>
          </div>
        </div>
        <div className="text-xs text-emerald-900/80 dark:text-emerald-100 font-bold">
          ปี {selectedYear} • พบ {filteredRows.length} รายการ
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="ค้นหา: เดือน / สาขา / ประเภทน้ำมัน..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900 dark:text-white font-medium"
          />
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          {isAnyFilterActive && (
            <button
              onClick={() => {
                setSearchTerm("");
                setColumnFilters({ month: "ทั้งหมด", branch: "ทั้งหมด" });
                setActiveHeaderDropdown(null);
              }}
              className="px-4 py-3 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-2xl font-bold text-sm transition-colors flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              ล้างตัวกรอง
            </button>
          )}
          <div className="flex items-center gap-2 px-4 py-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-2xl border border-emerald-100 dark:border-emerald-800/50 shrink-0">
            <Droplet className="w-4 h-4" />
            <span className="text-sm font-bold whitespace-nowrap">พบ {filteredRows.length} รายการ</span>
          </div>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="border-b border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-black text-gray-800 dark:text-white">รายงานรายเดือน – ปี {selectedYear}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">ตารางสไตล์เดียวกับหน้า Master (deposit-slips)</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-gray-900/50 text-[10px] uppercase tracking-widest font-black text-gray-400">
                <HeaderWithFilter label="เดือน" columnKey="month" filterKey="month" options={filterOptions.month} />
                <HeaderWithFilter label="สาขา" columnKey="branch" filterKey="branch" options={filterOptions.branch} />
                <HeaderWithFilter label="ยอดขาย (บาท)" columnKey="sales" align="right" />
                <HeaderWithFilter label="จำนวนลิตรรวม" columnKey="quantitySold" align="right" />
                <th className="px-6 py-4 text-left">ตัวอย่างชนิดน้ำมัน</th>
                <th className="px-6 py-4 text-center">ดู</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 px-6 text-center text-sm text-gray-500 dark:text-gray-400">
                    ไม่พบข้อมูลที่ตรงกับเงื่อนไข
                  </td>
                </tr>
              )}
              {filteredRows.map((r, idx) => {
                const sample = r.oilQuantities.slice(0, 3);
                return (
                  <tr
                    key={r.id}
                    className={`border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                      idx % 2 === 0 ? "bg-white dark:bg-gray-800" : "bg-gray-50/50 dark:bg-gray-900/30"
                    }`}
                  >
                    <td className="py-4 px-6 text-sm font-bold text-gray-900 dark:text-white whitespace-nowrap">
                      {thaiMonths[r.month - 1]}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-300 font-medium whitespace-nowrap">
                      {getBranchLabel(r.branch)}
                    </td>
                    <td className="py-4 px-6 text-right text-sm font-black text-gray-900 dark:text-white whitespace-nowrap">
                      {currencyFormatter.format(r.sales)}
                    </td>
                    <td className="py-4 px-6 text-right text-sm font-black text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                      {numberFormatter.format(r.quantitySold)} ลิตร
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-wrap gap-2">
                        {sample.map((o) => (
                          <span
                            key={`${r.id}-${o.oilType}`}
                            className="inline-flex px-3 py-1 rounded-full bg-gray-50 dark:bg-gray-900/30 border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-700 dark:text-gray-200"
                          >
                            {getOilTypeLabel(o.oilType)}: {numberFormatter.format(o.quantity)} ลิตร
                          </span>
                        ))}
                        {r.oilQuantities.length > 3 && (
                          <span className="text-xs text-gray-500 dark:text-gray-400 font-bold self-center">
                            +{r.oilQuantities.length - 3} รายการ
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <button
                        type="button"
                        onClick={() => setViewRow(r)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                        aria-label="ดูรายละเอียด"
                      >
                        <Eye className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>

      <AnimatePresence>
        {viewRow && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setViewRow(null)}
              className="fixed inset-0 bg-black/50 z-50"
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-3xl shadow-2xl max-w-3xl w-full overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-5 flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-black text-gray-900 dark:text-white">
                      {getBranchLabel(viewRow.branch)} • {thaiMonths[viewRow.month - 1]} {viewRow.year}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                      ยอดขาย {currencyFormatter.format(viewRow.sales)} • {numberFormatter.format(viewRow.quantitySold)} ลิตร
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setViewRow(null)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all duration-200 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:scale-110 active:scale-95"
                    aria-label="ปิด"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-6 bg-gray-50 dark:bg-gray-900/50">
                  <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                      <p className="font-black text-gray-900 dark:text-white">รายละเอียดตามชนิดน้ำมัน</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        ปริมาณ (ลิตร) และยอดขายประมาณการ (mock)
                      </p>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-gray-50/50 dark:bg-gray-900/50 text-[10px] uppercase tracking-widest font-black text-gray-400">
                            <th className="px-6 py-4">ชนิดน้ำมัน</th>
                            <th className="px-6 py-4 text-right">ปริมาณ (ลิตร)</th>
                            <th className="px-6 py-4 text-right">ยอดขาย (บาท)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {viewRow.oilQuantities.map((o, idx) => (
                            <tr
                              key={`${viewRow.id}-${o.oilType}`}
                              className={`border-b border-gray-200 dark:border-gray-700 ${
                                idx % 2 === 0 ? "bg-white dark:bg-gray-800" : "bg-gray-50/50 dark:bg-gray-900/30"
                              }`}
                            >
                              <td className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-white">
                                {getOilTypeLabel(o.oilType)}
                              </td>
                              <td className="px-6 py-4 text-right text-sm font-bold text-gray-700 dark:text-gray-200">
                                {numberFormatter.format(o.quantity)}
                              </td>
                              <td className="px-6 py-4 text-right text-sm font-black text-emerald-600 dark:text-emerald-400">
                                {currencyFormatter.format(o.sales)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

