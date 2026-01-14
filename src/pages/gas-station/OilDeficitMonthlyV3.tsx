import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import {
  AlertCircle,
  BookOpen,
  Calendar,
  Check,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Download,
  Filter,
  Info,
  Search,
  X,
} from "lucide-react";

const numberFormatter = new Intl.NumberFormat("th-TH", {
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
});

// ประเภทสาขา
type BranchType = "HISO" | "Dindam" | "NongChik" | "Taksila" | "Bypass";

// ชนิดน้ำมัน
type OilType = "HSP" | "95" | "E20" | "B7" | "91";

type DailyDeficitRow = {
  date: number; // วันที่ในเดือน (1..31)
  oilType: OilType;
  receive: number;
  down: number;
  pay: number;
  balance: number;
  measuredByMachine: number;
  differenceMachine: number;
  measuredByHand: number;
  differenceHand: number;
  notes: string;
  previousBalance: number;
};

type WellMonthly = {
  wellNo: number;
  oilType: OilType;
  rows: DailyDeficitRow[];
  totalReceive: number;
  totalDown: number;
  totalPay: number;
  totalBalance: number;
  totalMeasuredByMachine: number;
  totalDifferenceMachine: number;
  totalMeasuredByHand: number;
  totalDifferenceHand: number;
};

type MonthlySummary = {
  month: string;
  year: number; // พ.ศ.
  branch: BranchType;
  wells: WellMonthly[];
};

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

const getBuddhistYear = (date: Date): number => date.getFullYear() + 543;

const getOilTypeLabel = (oilType: OilType): string => {
  const labels: Record<OilType, string> = {
    HSP: "HSP (ดีเซล)",
    "95": "95",
    E20: "E20",
    B7: "B7",
    "91": "91",
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

const wellsCountByBranch: Record<BranchType, number> = {
  HISO: 10,
  Dindam: 6,
  NongChik: 6,
  Taksila: 6,
  Bypass: 6,
};

const generateMockData = (): Record<string, MonthlySummary> => {
  const data: Record<string, MonthlySummary> = {};
  const branches: BranchType[] = ["HISO", "Dindam", "NongChik", "Taksila", "Bypass"];
  const oilTypes: OilType[] = ["HSP", "95", "E20", "B7", "91"];

  let seed = 12345;
  const random = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

  for (let year = 2565; year <= 2570; year++) {
    branches.forEach((branch) => {
      for (let month = 0; month < 12; month++) {
        const key = `${year}-${month}-${branch}`;
        const wellsCount = wellsCountByBranch[branch] ?? 6;

        const wells: WellMonthly[] = Array.from({ length: wellsCount }).map((_, idx) => {
          const wellNo = idx + 1;
          const oilType = oilTypes[idx % oilTypes.length];
          const rows: DailyDeficitRow[] = [];
          let previousBalance = 50000 + Math.floor(random() * 5000); // ยอดยกมาเริ่มต้น

          for (let day = 1; day <= 10; day++) {
            const receive = Math.floor(random() * 50000) + 10000;
            const down = Math.floor(receive * (0.95 + random() * 0.05));
            const pay = Math.floor(random() * 40000) + 20000;
            const balance = previousBalance + receive - pay;

            const measuredByMachine = balance + (random() * 200 - 100);
            const differenceMachine = measuredByMachine - balance;

            const measuredByHand = balance + (random() * 300 - 150);
            const differenceHand = measuredByHand - balance;

            const variancePercent = balance > 0 ? (differenceMachine / balance) * 100 : 0;
            const notes =
              variancePercent !== 0
                ? `${variancePercent > 0 ? "+" : ""}${variancePercent.toFixed(2)}%`
                : "0%";

            rows.push({
              date: day,
              oilType,
              receive,
              down,
              pay,
              balance: Math.round(balance * 100) / 100,
              measuredByMachine: Math.round(measuredByMachine * 100) / 100,
              differenceMachine: Math.round(differenceMachine * 100) / 100,
              measuredByHand: Math.round(measuredByHand * 100) / 100,
              differenceHand: Math.round(differenceHand * 100) / 100,
              notes,
              previousBalance,
            });

            previousBalance = balance;
          }

          const totalReceive = rows.reduce((sum, r) => sum + r.receive, 0);
          const totalDown = rows.reduce((sum, r) => sum + r.down, 0);
          const totalPay = rows.reduce((sum, r) => sum + r.pay, 0);
          const totalBalance = rows[rows.length - 1]?.balance || 0;
          const totalMeasuredByMachine = rows.reduce((sum, r) => sum + r.measuredByMachine, 0);
          const totalDifferenceMachine = rows.reduce((sum, r) => sum + r.differenceMachine, 0);
          const totalMeasuredByHand = rows.reduce((sum, r) => sum + r.measuredByHand, 0);
          const totalDifferenceHand = rows.reduce((sum, r) => sum + r.differenceHand, 0);

          return {
            wellNo,
            oilType,
            rows,
            totalReceive,
            totalDown,
            totalPay,
            totalBalance,
            totalMeasuredByMachine,
            totalDifferenceMachine,
            totalMeasuredByHand,
            totalDifferenceHand,
          };
        });

        data[key] = {
          month: thaiMonths[month],
          year,
          branch,
          wells,
        };
      }
    });
  }

  return data;
};

type FilterKey = "oilType";
type SortKey =
  | "wellNo"
  | "oilType"
  | "receive"
  | "down"
  | "pay"
  | "balance"
  | "measuredByMachine"
  | "differenceMachine"
  | "measuredByHand"
  | "differenceHand"
  | "notes";

export default function OilDeficitMonthlyV3() {
  const now = useMemo(() => new Date(), []);
  const currentBuddhistYear = getBuddhistYear(now);
  const currentMonth = now.getMonth();

  const [selectedYear, setSelectedYear] = useState(currentBuddhistYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedBranch, setSelectedBranch] = useState<BranchType>("HISO");

  const mockMonthlyDataMap = useMemo(() => generateMockData(), []);

  const dataKey = `${selectedYear}-${selectedMonth}-${selectedBranch}`;
  const currentData = mockMonthlyDataMap[dataKey] || {
    month: thaiMonths[selectedMonth],
    year: selectedYear,
    branch: selectedBranch,
    wells: [],
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [columnFilters, setColumnFilters] = useState<{ oilType: string }>({ oilType: "ทั้งหมด" });
  const [activeHeaderDropdown, setActiveHeaderDropdown] = useState<FilterKey | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: "asc" | "desc" | null }>({
    key: "wellNo",
    direction: "asc",
  });

  const filterOptions = useMemo(() => {
    const oilTypeOptions = Array.from(
      new Set(currentData.wells.map((w) => getOilTypeLabel(w.oilType)))
    ).sort((a, b) => a.localeCompare(b));
    return {
      oilType: ["ทั้งหมด", ...oilTypeOptions],
    };
  }, [currentData.wells]);

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
    const justify = align === "right" ? "justify-end" : align === "center" ? "justify-center" : "justify-start";
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

  const filteredWells = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    let wells = currentData.wells.filter((w) => {
      const label = getOilTypeLabel(w.oilType);

      const matchesWellOrOil =
        term === "" ||
        String(w.wellNo).includes(term) ||
        `หลุม ${w.wellNo}`.includes(term) ||
        label.toLowerCase().includes(term);

      const matchesOilType = columnFilters.oilType === "ทั้งหมด" || label === columnFilters.oilType;
      return matchesWellOrOil && matchesOilType;
    });

    // 1 หลุม = 1 ชนิดน้ำมัน (สรุปต่อเดือนเป็น 1 แถวต่อหลุม)
    // Sorting should apply at "well" level (not daily rows)
    if (sortConfig.key && sortConfig.direction) {
      const dir = sortConfig.direction === "desc" ? -1 : 1;

      const compare = (a: string | number, b: string | number) => {
        if (a < b) return -1 * dir;
        if (a > b) return 1 * dir;
        return 0;
      };

      const lastRow = (w: WellMonthly) => w.rows[w.rows.length - 1];

      wells = wells.slice().sort((wa, wb) => {
        const la = lastRow(wa);
        const lb = lastRow(wb);

        switch (sortConfig.key) {
          case "wellNo":
            return compare(wa.wellNo, wb.wellNo);
          case "oilType":
            return compare(getOilTypeLabel(wa.oilType), getOilTypeLabel(wb.oilType));
          case "receive":
            return compare(wa.totalReceive, wb.totalReceive);
          case "down":
            return compare(wa.totalDown, wb.totalDown);
          case "pay":
            return compare(wa.totalPay, wb.totalPay);
          case "balance":
            return compare(la?.balance ?? 0, lb?.balance ?? 0);
          case "measuredByMachine":
            return compare(la?.measuredByMachine ?? 0, lb?.measuredByMachine ?? 0);
          case "differenceMachine":
            return compare(la?.differenceMachine ?? 0, lb?.differenceMachine ?? 0);
          case "measuredByHand":
            return compare(la?.measuredByHand ?? 0, lb?.measuredByHand ?? 0);
          case "differenceHand":
            return compare(la?.differenceHand ?? 0, lb?.differenceHand ?? 0);
          case "notes":
            return compare(la?.notes ?? "", lb?.notes ?? "");
        }
      });
    } else {
      wells = wells.slice().sort((a, b) => a.wellNo - b.wellNo);
    }

    return wells;
  }, [currentData.wells, searchTerm, columnFilters, sortConfig]);

  const flattenedRowsCount = useMemo(
    () => filteredWells.length,
    [filteredWells]
  );

  const summary = useMemo(() => {
    const totalReceive = filteredWells.reduce((sum, w) => sum + w.totalReceive, 0);
    const totalDown = filteredWells.reduce((sum, w) => sum + w.totalDown, 0);
    const totalPay = filteredWells.reduce((sum, w) => sum + w.totalPay, 0);
    const totalDiffMachine = filteredWells.reduce((sum, w) => sum + w.totalDifferenceMachine, 0);
    return { totalReceive, totalDown, totalPay, totalDiffMachine };
  }, [filteredWells]);

  const isAnyFilterActive = useMemo(() => {
    return searchTerm !== "" || columnFilters.oilType !== "ทั้งหมด";
  }, [searchTerm, columnFilters]);

  const diffColor = (value: number) => {
    if (value > 0) return "text-emerald-600 dark:text-emerald-400";
    if (value < 0) return "text-rose-600 dark:text-rose-400";
    return "text-gray-600 dark:text-gray-400";
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      {/* Header */}
      <header className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
              <div className="p-2 bg-emerald-500 rounded-2xl shadow-lg shadow-emerald-500/20">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              สมุดน้ำมันขาดเกินรายเดือน
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">
              แสดงผลเป็นตารางคอลัมน์ครบเหมือนเดิม และจัดกลุ่มเป็น “หลุม” (เช่น ปั๊มไฮโซ 10 หลุม)
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value as BranchType)}
              className="px-4 py-3 text-sm rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/40 font-bold"
            >
              {(Object.keys(wellsCountByBranch) as BranchType[]).map((b) => (
                <option key={b} value={b}>
                  {getBranchLabel(b)} ({wellsCountByBranch[b]} หลุม)
                </option>
              ))}
            </select>

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="px-4 py-3 text-sm rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/40 font-bold"
            >
              {Array.from({ length: 8 }).map((_, idx) => {
                const y = currentBuddhistYear - 5 + idx;
                return (
                  <option key={y} value={y}>
                    ปี {y}
                  </option>
                );
              })}
            </select>

            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="px-4 py-3 text-sm rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/40 font-bold"
            >
              {thaiMonths.map((m, idx) => (
                <option key={m} value={idx}>
                  {m}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => alert("ส่งออกข้อมูลเป็น Excel (mock)")}
              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-bold shadow-lg shadow-emerald-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              ส่งออก
            </button>
          </div>
        </div>
      </header>

      {/* Info Box */}
      <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-3xl p-4 mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Info className="w-6 h-6 text-emerald-500" />
          <div>
            <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">
              ตารางเดิม “คอลัมน์ครบ” เหมือนเดิมทุกช่อง — เพิ่มแค่การจัดกลุ่มเป็นหลุมเพื่ออ่านง่ายขึ้น
            </p>
            <p className="text-xs text-emerald-800/80 dark:text-emerald-200/80 mt-1">
              ใช้ตัวกรองหัวคอลัมน์ที่ “ชนิด” เพื่อเลือกประเภทน้ำมัน และสามารถค้นหาด้วยคำว่า “หลุม 1”, “E20”, “95” เป็นต้น
            </p>
          </div>
        </div>
        <div className="text-xs text-emerald-900/80 dark:text-emerald-100 font-bold flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          {thaiMonths[selectedMonth]} {selectedYear} • {getBranchLabel(selectedBranch)}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="ค้นหา: หลุม 1 / 95 / E20 / B7 ..."
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
                setColumnFilters({ oilType: "ทั้งหมด" });
                setActiveHeaderDropdown(null);
              }}
              className="px-4 py-3 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-2xl font-bold text-sm transition-colors flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              ล้างตัวกรอง
            </button>
          )}
          <div className="flex items-center gap-2 px-4 py-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-2xl border border-emerald-100 dark:border-emerald-800/50 shrink-0">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm font-bold whitespace-nowrap">
              แสดง {flattenedRowsCount} หลุม
            </span>
          </div>
        </div>
      </div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden"
      >
        <div className="border-b border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-black text-gray-800 dark:text-white">
            {getBranchLabel(selectedBranch)} – ประจำเดือน {currentData.month} {currentData.year}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            ตารางแสดงรายวัน (mock 10 วันแรก) โดยจัดกลุ่มเป็น “หลุม” และกรองประเภทน้ำมันได้จากหัวคอลัมน์ “ชนิด”
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-gray-900/50 text-[10px] uppercase tracking-widest font-black text-gray-400">
                <HeaderWithFilter label="หลุม" columnKey="wellNo" align="center" />
                <HeaderWithFilter label="ชนิด" columnKey="oilType" filterKey="oilType" options={filterOptions.oilType} />
                <HeaderWithFilter label="รับ" columnKey="receive" align="right" />
                <HeaderWithFilter label="ลง (ลิตร)" columnKey="down" align="right" />
                <HeaderWithFilter label="จ่าย" columnKey="pay" align="right" />
                <HeaderWithFilter label="คงเหลือ" columnKey="balance" align="right" />
                <HeaderWithFilter label="วัดได้/วัดโดย (เครื่อง)" columnKey="measuredByMachine" align="right" />
                <HeaderWithFilter label="ส่วนต่าง (เครื่อง)" columnKey="differenceMachine" align="right" />
                <HeaderWithFilter label="วัดได้/วัดโดย (มือ)" columnKey="measuredByHand" align="right" />
                <HeaderWithFilter label="ส่วนต่าง (มือ)" columnKey="differenceHand" align="right" />
                <HeaderWithFilter label="หมายเหตุ / %หาย" columnKey="notes" align="right" />
              </tr>
            </thead>
            <tbody>
              {filteredWells.length === 0 && (
                <tr>
                  <td colSpan={11} className="py-12 px-6 text-center text-sm text-gray-500 dark:text-gray-400">
                    ไม่พบข้อมูลที่ตรงกับเงื่อนไข
                  </td>
                </tr>
              )}

              {filteredWells.map((well, idx) => {
                const last = well.rows[well.rows.length - 1];
                if (!last) return null;

                return (
                  <tr
                    key={`well-row-${well.wellNo}`}
                    className={`border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                      idx % 2 === 0 ? "bg-white dark:bg-gray-800" : "bg-gray-50/50 dark:bg-gray-900/30"
                    }`}
                  >
                    <td className="text-center py-4 px-6 text-sm text-gray-800 dark:text-white font-black whitespace-nowrap">
                      {well.wellNo}
                    </td>
                    <td className="py-4 px-6 text-sm font-black text-gray-800 dark:text-white whitespace-nowrap">
                      {getOilTypeLabel(well.oilType)}
                    </td>
                    <td className="text-right py-4 px-6 text-sm text-gray-800 dark:text-white font-bold whitespace-nowrap">
                      {numberFormatter.format(well.totalReceive)}
                    </td>
                    <td className="text-right py-4 px-6 text-sm text-gray-800 dark:text-white font-bold whitespace-nowrap">
                      {numberFormatter.format(well.totalDown)}
                    </td>
                    <td className="text-right py-4 px-6 text-sm text-gray-800 dark:text-white font-bold whitespace-nowrap">
                      {numberFormatter.format(well.totalPay)}
                    </td>
                    <td className="text-right py-4 px-6 text-sm text-gray-800 dark:text-white font-bold whitespace-nowrap">
                      {numberFormatter.format(last.balance)}
                    </td>
                    <td className="text-right py-4 px-6 text-sm text-gray-800 dark:text-white font-bold whitespace-nowrap">
                      {numberFormatter.format(last.measuredByMachine)}
                    </td>
                    <td className={`text-right py-4 px-6 text-sm font-black whitespace-nowrap ${diffColor(last.differenceMachine)}`}>
                      {last.differenceMachine > 0 ? "+" : ""}
                      {numberFormatter.format(last.differenceMachine)}
                    </td>
                    <td className="text-right py-4 px-6 text-sm text-gray-800 dark:text-white font-bold whitespace-nowrap">
                      {numberFormatter.format(last.measuredByHand)}
                    </td>
                    <td className={`text-right py-4 px-6 text-sm font-black whitespace-nowrap ${diffColor(last.differenceHand)}`}>
                      {last.differenceHand > 0 ? "+" : ""}
                      {numberFormatter.format(last.differenceHand)}
                    </td>
                    <td className="text-right py-4 px-6 text-sm whitespace-nowrap">
                      <span
                        className={`font-black ${
                          last.notes.includes("-")
                            ? "text-rose-600 dark:text-rose-400"
                            : last.notes.includes("+")
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-gray-600 dark:text-gray-400"
                        }`}
                      >
                        {last.notes}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            {filteredWells.length > 0 && (
              <tfoot>
                <tr className="bg-gray-50/50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
                  <td colSpan={2} className="py-4 px-6 text-right text-sm font-black text-gray-800 dark:text-white">
                    รวมทั้งหมด (หลุมที่เลือก)
                  </td>
                  <td className="py-4 px-6 text-right text-sm font-black text-gray-800 dark:text-white">
                    {numberFormatter.format(summary.totalReceive)}
                  </td>
                  <td className="py-4 px-6 text-right text-sm font-black text-gray-800 dark:text-white">
                    {numberFormatter.format(summary.totalDown)}
                  </td>
                  <td className="py-4 px-6 text-right text-sm font-black text-gray-800 dark:text-white">
                    {numberFormatter.format(summary.totalPay)}
                  </td>
                  <td className="py-4 px-6 text-right text-sm font-black text-gray-600 dark:text-gray-300">-</td>
                  <td className="py-4 px-6 text-right text-sm font-black text-gray-600 dark:text-gray-300">-</td>
                  <td className={`py-4 px-6 text-right text-sm font-black ${diffColor(summary.totalDiffMachine)}`}>
                    {summary.totalDiffMachine > 0 ? "+" : ""}
                    {numberFormatter.format(summary.totalDiffMachine)}
                  </td>
                  <td className="py-4 px-6 text-right text-sm font-black text-gray-600 dark:text-gray-300">-</td>
                  <td className="py-4 px-6 text-right text-sm font-black text-gray-600 dark:text-gray-300">-</td>
                  <td className="py-4 px-6 text-right text-sm font-black text-gray-600 dark:text-gray-300">-</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </motion.div>

      {/* Small note */}
      <div className="mt-6 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
        <AlertCircle className="w-4 h-4" />
        ข้อมูลในหน้านี้เป็น mock up เพื่อสาธิต UI/UX และแนวคิด “แยกตามหลุม”
      </div>
    </div>
  );
}

