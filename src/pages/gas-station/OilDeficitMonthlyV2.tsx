import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { useBranch } from "@/contexts/BranchContext";
import {
  isAllNavbarBranchesSelected,
  isInSelectedNavbarBranches,
  selectedBranchNameSetFromNavbarIds,
} from "@/utils/branchFilter";
import {
  AlertCircle,
  Check,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Eye,
  Filter,
  Info,
  LayoutGrid,
  List,
  Search,
  X,
} from "lucide-react";

const numberFormatter = new Intl.NumberFormat("th-TH", { maximumFractionDigits: 0 });

type BranchKey = "HISO" | "Dindam" | "NongChik" | "Taksila" | "Bypass";
type OilType = "HSP" | "95" | "E20" | "B7" | "91";

type DeficitStatus = "ขาด" | "เกิน" | "พอดี";

type WellDailyRow = {
  date: number; // day of month
  receive: number;
  pay: number;
  balance: number;
  measuredByMachine: number;
  differenceMachine: number;
  measuredByHand: number;
  differenceHand: number;
};

type WellMonthly = {
  id: string;
  year: number; // พ.ศ.
  monthIndex: number; // 0-11
  branch: string; // human label e.g. ปั๊มไฮโซ
  branchKey: BranchKey;
  wellNo: number;
  oilType: OilType;
  capacityLiters: number;
  totalReceive: number;
  totalPay: number;
  balance: number;
  measuredByMachine: number;
  differenceMachine: number;
  measuredByHand: number;
  differenceHand: number;
  variancePercent: number;
  status: DeficitStatus;
  daily: WellDailyRow[];
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

const branchOptions: { key: BranchKey; label: string; wells: number }[] = [
  { key: "HISO", label: "ปั๊มไฮโซ", wells: 10 },
  { key: "Dindam", label: "ดินดำ", wells: 6 },
  { key: "NongChik", label: "หนองจิก", wells: 6 },
  { key: "Taksila", label: "ตักสิลา", wells: 6 },
  { key: "Bypass", label: "บายพาส", wells: 6 },
];

const oilTypeLabel = (oil: OilType) => {
  const labels: Record<OilType, string> = {
    HSP: "HSP (ดีเซล)",
    "95": "95",
    E20: "E20",
    B7: "B7",
    "91": "91",
  };
  return labels[oil];
};

function seedRand(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function computeStatus(diff: number): DeficitStatus {
  if (diff < -1) return "ขาด";
  if (diff > 1) return "เกิน";
  return "พอดี";
}

function statusBadge(status: DeficitStatus) {
  if (status === "ขาด") return "bg-rose-50 text-rose-600 border-rose-200";
  if (status === "เกิน") return "bg-amber-50 text-amber-600 border-amber-200";
  return "bg-emerald-50 text-emerald-600 border-emerald-200";
}

function diffColor(diff: number) {
  if (diff < 0) return "text-rose-600 dark:text-rose-400";
  if (diff > 0) return "text-emerald-600 dark:text-emerald-400";
  return "text-gray-600 dark:text-gray-400";
}

function generateMonthlyWells(year: number, monthIndex: number, branchKey: BranchKey): WellMonthly[] {
  const branch = branchOptions.find((b) => b.key === branchKey)?.label ?? branchKey;
  const wellsCount = branchOptions.find((b) => b.key === branchKey)?.wells ?? 6;
  const oilTypes: OilType[] = ["HSP", "95", "E20", "B7", "91"];

  return Array.from({ length: wellsCount }).map((_, i) => {
    const wellNo = i + 1;
    const oilType = oilTypes[i % oilTypes.length];
    const rng = seedRand(year * 1000 + monthIndex * 100 + i * 7 + branchKey.length * 13);

    const capacityLiters = 25000 + Math.floor(rng() * 35000); // 25k - 60k
    let balance = 35000 + Math.floor(rng() * 15000);
    const daily: WellDailyRow[] = [];

    let totalReceive = 0;
    let totalPay = 0;
    let measuredByMachineSum = 0;
    let diffMachineSum = 0;
    let measuredByHandSum = 0;
    let diffHandSum = 0;

    // mock 10 days
    for (let day = 1; day <= 10; day += 1) {
      const receive = rng() < 0.25 ? Math.floor(rng() * 20000) + 5000 : 0;
      const pay = Math.floor(rng() * 12000) + 7000;
      balance = Math.max(0, Math.min(capacityLiters, balance + receive - pay));

      const measuredByMachine = balance + (rng() * 240 - 120);
      const differenceMachine = measuredByMachine - balance;
      const measuredByHand = balance + (rng() * 360 - 180);
      const differenceHand = measuredByHand - balance;

      totalReceive += receive;
      totalPay += pay;
      measuredByMachineSum += measuredByMachine;
      diffMachineSum += differenceMachine;
      measuredByHandSum += measuredByHand;
      diffHandSum += differenceHand;

      daily.push({
        date: day,
        receive,
        pay,
        balance: Math.round(balance),
        measuredByMachine: Math.round(measuredByMachine),
        differenceMachine: Math.round(differenceMachine),
        measuredByHand: Math.round(measuredByHand),
        differenceHand: Math.round(differenceHand),
      });
    }

    const measuredByMachine = Math.round(measuredByMachineSum / daily.length);
    const differenceMachine = Math.round(diffMachineSum); // monthly sum diff
    const measuredByHand = Math.round(measuredByHandSum / daily.length);
    const differenceHand = Math.round(diffHandSum);

    const variancePercent = balance > 0 ? (differenceMachine / Math.max(balance, 1)) * 100 : 0;
    const status = computeStatus(differenceMachine);

    return {
      id: `WELL-${branchKey}-${year}-${monthIndex}-${wellNo}`,
      year,
      monthIndex,
      branch,
      branchKey,
      wellNo,
      oilType,
      capacityLiters,
      totalReceive,
      totalPay,
      balance,
      measuredByMachine,
      differenceMachine,
      measuredByHand,
      differenceHand,
      variancePercent: Number.isFinite(variancePercent) ? variancePercent : 0,
      status,
      daily,
    };
  });
}

export default function OilDeficitMonthlyV2() {
  const now = useMemo(() => new Date(), []);
  const buddhistYear = now.getFullYear() + 543;
  const currentMonthIndex = now.getMonth();

  const { selectedBranches } = useBranch();
  const selectedNavbarBranchSet = useMemo(
    () => selectedBranchNameSetFromNavbarIds(selectedBranches),
    [selectedBranches]
  );

  const [selectedYear, setSelectedYear] = useState(buddhistYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonthIndex);
  const [selectedBranchKey, setSelectedBranchKey] = useState<BranchKey>("HISO");
  const [viewMode, setViewMode] = useState<"wells" | "table">("wells");

  const [searchTerm, setSearchTerm] = useState("");
  const [columnFilters, setColumnFilters] = useState<{ oilType: string; status: string }>({
    oilType: "ทั้งหมด",
    status: "ทั้งหมด",
  });

  type FilterKey = "oilType" | "status";
  type SortKey =
    | "wellNo"
    | "oilType"
    | "capacityLiters"
    | "totalReceive"
    | "totalPay"
    | "differenceMachine"
    | "differenceHand"
    | "variancePercent"
    | "status";

  const [activeHeaderDropdown, setActiveHeaderDropdown] = useState<FilterKey | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: "asc" | "desc" | null }>({
    key: "wellNo",
    direction: "asc",
  });

  const allWells = useMemo(
    () => generateMonthlyWells(selectedYear, selectedMonth, selectedBranchKey),
    [selectedYear, selectedMonth, selectedBranchKey]
  );

  const selectedBranchLabel = useMemo(
    () => branchOptions.find((b) => b.key === selectedBranchKey)?.label ?? selectedBranchKey,
    [selectedBranchKey]
  );

  const filterOptions = useMemo(() => {
    return {
      oilType: ["ทั้งหมด", ...new Set(allWells.map((w) => oilTypeLabel(w.oilType)))],
      status: ["ทั้งหมด", ...new Set(allWells.map((w) => w.status))],
    };
  }, [allWells]);

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

  const filteredWells = useMemo(() => {
    let result = allWells.filter((w) => {
      const term = searchTerm.trim().toLowerCase();

      const matchesNavbarBranch = isAllNavbarBranchesSelected(selectedBranches)
        ? true
        : selectedBranches.length === 0
          ? false
          : isInSelectedNavbarBranches(w.branch, selectedNavbarBranchSet);

      const matchesSearch =
        term === "" ||
        String(w.wellNo).includes(term) ||
        oilTypeLabel(w.oilType).toLowerCase().includes(term) ||
        w.status.toLowerCase().includes(term);

      const matchesOilType = columnFilters.oilType === "ทั้งหมด" || oilTypeLabel(w.oilType) === columnFilters.oilType;
      const matchesStatus = columnFilters.status === "ทั้งหมด" || w.status === (columnFilters.status as DeficitStatus);

      return matchesNavbarBranch && matchesSearch && matchesOilType && matchesStatus;
    });

    if (sortConfig.key && sortConfig.direction) {
      const dir = sortConfig.direction === "asc" ? 1 : -1;
      const cmp = (a: string | number, b: string | number) => (a < b ? -1 * dir : a > b ? 1 * dir : 0);

      result = [...result].sort((a, b) => {
        switch (sortConfig.key) {
          case "wellNo":
            return cmp(a.wellNo, b.wellNo);
          case "oilType":
            return cmp(oilTypeLabel(a.oilType), oilTypeLabel(b.oilType));
          case "capacityLiters":
            return cmp(a.capacityLiters, b.capacityLiters);
          case "totalReceive":
            return cmp(a.totalReceive, b.totalReceive);
          case "totalPay":
            return cmp(a.totalPay, b.totalPay);
          case "differenceMachine":
            return cmp(a.differenceMachine, b.differenceMachine);
          case "differenceHand":
            return cmp(a.differenceHand, b.differenceHand);
          case "variancePercent":
            return cmp(a.variancePercent, b.variancePercent);
          case "status":
            return cmp(a.status, b.status);
        }
      });
    }

    return result;
  }, [allWells, searchTerm, columnFilters, sortConfig, selectedBranches, selectedNavbarBranchSet]);

  const isAnyFilterActive = useMemo(() => {
    return searchTerm !== "" || columnFilters.oilType !== "ทั้งหมด" || columnFilters.status !== "ทั้งหมด";
  }, [searchTerm, columnFilters]);

  const summary = useMemo(() => {
    const totalWells = filteredWells.length;
    const deficitWells = filteredWells.filter((w) => w.status === "ขาด").length;
    const surplusWells = filteredWells.filter((w) => w.status === "เกิน").length;
    const totalDeficitLiters = filteredWells.reduce((sum, w) => sum + Math.max(0, -w.differenceMachine), 0);
    return { totalWells, deficitWells, surplusWells, totalDeficitLiters };
  }, [filteredWells]);

  const [viewWell, setViewWell] = useState<WellMonthly | null>(null);

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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      <header className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
              <div className="p-2 bg-emerald-500 rounded-2xl shadow-lg shadow-emerald-500/20">
                <AlertCircle className="w-8 h-8 text-white" />
              </div>
              รายงานน้ำมันขาดรายเดือน (แยกตามหลุม)
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">
              เลือกเดือน/ปี/สาขา แล้วดูข้อมูลแบบ “หลุม” (เช่น ปั๊มไฮโซ 10 หลุม) หรือดูแบบตารางพร้อมตัวกรองหัวคอลัมน์
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <select
              value={selectedBranchKey}
              onChange={(e) => setSelectedBranchKey(e.target.value as BranchKey)}
              className="px-4 py-3 text-sm rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/40 font-bold"
            >
              {branchOptions.map((b) => (
                <option key={b.key} value={b.key}>
                  {b.label} ({b.wells} หลุม)
                </option>
              ))}
            </select>

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="px-4 py-3 text-sm rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/40 font-bold"
            >
              {Array.from({ length: 8 }).map((_, idx) => {
                const y = buddhistYear - 5 + idx;
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

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setViewMode("wells")}
                className={`px-4 py-3 rounded-2xl font-bold border transition-all active:scale-95 flex items-center gap-2 ${
                  viewMode === "wells"
                    ? "bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/20"
                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                <LayoutGrid className="w-5 h-5" />
                มุมมองหลุม
              </button>
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`px-4 py-3 rounded-2xl font-bold border transition-all active:scale-95 flex items-center gap-2 ${
                  viewMode === "table"
                    ? "bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/20"
                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                <List className="w-5 h-5" />
                มุมมองตาราง
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl">
              <LayoutGrid className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">จำนวนหลุม</p>
              <p className="text-2xl font-black text-gray-900 dark:text-white">{summary.totalWells} หลุม</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{selectedBranchLabel}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-rose-50 dark:bg-rose-900/20 rounded-2xl">
              <AlertCircle className="w-6 h-6 text-rose-500" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">หลุมที่ขาด</p>
              <p className="text-2xl font-black text-gray-900 dark:text-white">{summary.deficitWells} หลุม</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">ตาม ATG (เครื่อง)</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-2xl">
              <AlertCircle className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">หลุมที่เกิน</p>
              <p className="text-2xl font-black text-gray-900 dark:text-white">{summary.surplusWells} หลุม</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">ตาม ATG (เครื่อง)</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gray-50 dark:bg-gray-900/20 rounded-2xl">
              <AlertCircle className="w-6 h-6 text-gray-500" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">รวมขาด (ลิตร)</p>
              <p className="text-2xl font-black text-gray-900 dark:text-white">
                {numberFormatter.format(summary.totalDeficitLiters)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">ยอดรวมเฉพาะค่าติดลบ</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Info Box */}
      <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-3xl p-4 mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Info className="w-6 h-6 text-emerald-500" />
          <div>
            <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">
              แนวคิด “หลุม”: 1 หลุม = 1 ถังเก็บน้ำมัน (ผูกกับ 1 ประเภทน้ำมัน)
            </p>
            <p className="text-xs text-emerald-800/80 dark:text-emerald-200/80 mt-1">
              หน้านี้ทำเป็น mock up เพื่อให้เห็นภาพการแยกตามหลุม และยังคงมีตารางที่กรองได้จากหัวคอลัมน์ตามมาตรฐาน Master
            </p>
          </div>
        </div>
        <div className="text-xs text-emerald-900/80 dark:text-emerald-100 font-bold">
          {thaiMonths[selectedMonth]} {selectedYear} • {selectedBranchLabel}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="ค้นหา: หมายเลขหลุม / ประเภทน้ำมัน / สถานะ..."
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
                setColumnFilters({ oilType: "ทั้งหมด", status: "ทั้งหมด" });
                setActiveHeaderDropdown(null);
              }}
              className="px-4 py-3 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-2xl font-bold text-sm transition-colors flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              ล้างตัวกรอง
            </button>
          )}
          <div className="flex items-center gap-2 px-4 py-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-2xl border border-emerald-100 dark:border-emerald-800/50 shrink-0">
            <LayoutGrid className="w-4 h-4" />
            <span className="text-sm font-bold whitespace-nowrap">พบ {filteredWells.length} หลุม</span>
          </div>
        </div>
      </div>

      {viewMode === "wells" ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredWells.map((w) => (
            <div
              key={w.id}
              className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">หลุมที่</p>
                  <p className="text-2xl font-black text-gray-900 dark:text-white">#{w.wellNo}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300 font-bold mt-1">{oilTypeLabel(w.oilType)}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-1">
                    ความจุ {numberFormatter.format(w.capacityLiters)} ลิตร
                  </p>
                </div>
                <span className={"inline-flex px-3 py-1 rounded-full border text-xs font-bold " + statusBadge(w.status)}>
                  {w.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-5">
                <div className="bg-gray-50 dark:bg-gray-900/30 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">ส่วนต่าง (เครื่อง)</p>
                  <p className={"text-lg font-black mt-1 " + diffColor(w.differenceMachine)}>
                    {w.differenceMachine > 0 ? "+" : ""}
                    {numberFormatter.format(w.differenceMachine)} ลิตร
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/30 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">%คลาดเคลื่อน</p>
                  <p className={"text-lg font-black mt-1 " + diffColor(w.variancePercent)}>
                    {w.variancePercent > 0 ? "+" : ""}
                    {w.variancePercent.toFixed(2)}%
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between mt-5">
                <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                  รับ {numberFormatter.format(w.totalReceive)} • จ่าย {numberFormatter.format(w.totalPay)}
                </div>
                <button
                  type="button"
                  onClick={() => setViewWell(w)}
                  className="px-4 py-2 rounded-2xl bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-100 dark:border-gray-700 font-bold transition-all active:scale-95 flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  ดูรายละเอียด
                </button>
              </div>
            </div>
          ))}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden"
        >
          <div className="border-b border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-black text-gray-800 dark:text-white">ตารางสรุปน้ำมันขาดรายเดือน – {selectedBranchLabel}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              กรองข้อมูลได้จากหัวคอลัมน์ (ประเภทน้ำมัน/สถานะ) และเรียงข้อมูลได้จากหัวตาราง
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-gray-900/50 text-[10px] uppercase tracking-widest font-black text-gray-400">
                  <HeaderWithFilter label="หลุม" columnKey="wellNo" />
                  <HeaderWithFilter label="ประเภทน้ำมัน" columnKey="oilType" filterKey="oilType" options={filterOptions.oilType} />
                  <HeaderWithFilter label="ความจุ (ลิตร)" columnKey="capacityLiters" align="right" />
                  <HeaderWithFilter label="รับรวม" columnKey="totalReceive" align="right" />
                  <HeaderWithFilter label="จ่ายรวม" columnKey="totalPay" align="right" />
                  <HeaderWithFilter label="ส่วนต่าง (เครื่อง)" columnKey="differenceMachine" align="right" />
                  <HeaderWithFilter label="ส่วนต่าง (มือ)" columnKey="differenceHand" align="right" />
                  <HeaderWithFilter label="%คลาดเคลื่อน" columnKey="variancePercent" align="right" />
                  <HeaderWithFilter label="สถานะ" columnKey="status" filterKey="status" options={filterOptions.status} align="center" />
                  <th className="px-6 py-4 text-center">ดู</th>
                </tr>
              </thead>
              <tbody>
                {filteredWells.map((w, idx) => (
                  <tr
                    key={w.id}
                    className={`border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                      idx % 2 === 0 ? "bg-white dark:bg-gray-800" : "bg-gray-50/50 dark:bg-gray-900/30"
                    }`}
                  >
                    <td className="py-4 px-6">
                      <span className="font-black text-gray-900 dark:text-white">#{w.wellNo}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-bold text-gray-900 dark:text-white">{oilTypeLabel(w.oilType)}</span>
                    </td>
                    <td className="py-4 px-6 text-right text-sm text-gray-600 dark:text-gray-300 font-bold">
                      {numberFormatter.format(w.capacityLiters)}
                    </td>
                    <td className="py-4 px-6 text-right text-sm text-gray-600 dark:text-gray-300 font-bold">
                      {numberFormatter.format(w.totalReceive)}
                    </td>
                    <td className="py-4 px-6 text-right text-sm text-gray-600 dark:text-gray-300 font-bold">
                      {numberFormatter.format(w.totalPay)}
                    </td>
                    <td className={"py-4 px-6 text-right text-sm font-black " + diffColor(w.differenceMachine)}>
                      {w.differenceMachine > 0 ? "+" : ""}
                      {numberFormatter.format(w.differenceMachine)}
                    </td>
                    <td className={"py-4 px-6 text-right text-sm font-black " + diffColor(w.differenceHand)}>
                      {w.differenceHand > 0 ? "+" : ""}
                      {numberFormatter.format(w.differenceHand)}
                    </td>
                    <td className={"py-4 px-6 text-right text-sm font-black " + diffColor(w.variancePercent)}>
                      {w.variancePercent > 0 ? "+" : ""}
                      {w.variancePercent.toFixed(2)}%
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className={"inline-flex px-3 py-1 rounded-full border text-xs font-bold " + statusBadge(w.status)}>
                        {w.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <button
                        type="button"
                        onClick={() => setViewWell(w)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                        aria-label="ดูรายละเอียด"
                      >
                        <Eye className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Well detail modal */}
      <AnimatePresence>
        {viewWell && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setViewWell(null)}
              className="fixed inset-0 bg-black/50 z-50"
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-3xl shadow-2xl max-w-4xl w-full overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-5 flex items-center justify-between z-10">
                  <div>
                    <h3 className="text-xl font-black text-gray-900 dark:text-white">
                      หลุม #{viewWell.wellNo} • {oilTypeLabel(viewWell.oilType)} • {viewWell.branch}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                      {thaiMonths[viewWell.monthIndex]} {viewWell.year} • ความจุ {numberFormatter.format(viewWell.capacityLiters)} ลิตร
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setViewWell(null)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all duration-200 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:scale-110 active:scale-95"
                    aria-label="ปิด"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-6 bg-gray-50 dark:bg-gray-900/50">
                  <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between gap-4">
                      <div>
                        <p className="font-black text-gray-900 dark:text-white">รายละเอียดรายวัน (mock 10 วันแรก)</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          แสดง รับ/จ่าย/คงเหลือ และส่วนต่างเครื่อง/มือ ของแต่ละวัน
                        </p>
                      </div>
                      <span className={"inline-flex px-3 py-1 rounded-full border text-xs font-bold " + statusBadge(viewWell.status)}>
                        สถานะ: {viewWell.status}
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-gray-50/50 dark:bg-gray-900/50 text-[10px] uppercase tracking-widest font-black text-gray-400">
                            <th className="px-6 py-4 text-left">วัน</th>
                            <th className="px-6 py-4 text-right">รับ</th>
                            <th className="px-6 py-4 text-right">จ่าย</th>
                            <th className="px-6 py-4 text-right">คงเหลือ</th>
                            <th className="px-6 py-4 text-right">วัดเครื่อง</th>
                            <th className="px-6 py-4 text-right">ส่วนต่างเครื่อง</th>
                            <th className="px-6 py-4 text-right">วัดมือ</th>
                            <th className="px-6 py-4 text-right">ส่วนต่างมือ</th>
                          </tr>
                        </thead>
                        <tbody>
                          {viewWell.daily.map((d, idx) => (
                            <tr
                              key={`${viewWell.id}-${d.date}`}
                              className={`border-b border-gray-200 dark:border-gray-700 ${
                                idx % 2 === 0 ? "bg-white dark:bg-gray-800" : "bg-gray-50/50 dark:bg-gray-900/30"
                              }`}
                            >
                              <td className="py-4 px-6 font-bold text-gray-900 dark:text-white">{d.date}</td>
                              <td className="py-4 px-6 text-right font-bold text-gray-700 dark:text-gray-200">
                                {d.receive === 0 ? "-" : numberFormatter.format(d.receive)}
                              </td>
                              <td className="py-4 px-6 text-right font-bold text-gray-700 dark:text-gray-200">
                                {numberFormatter.format(d.pay)}
                              </td>
                              <td className="py-4 px-6 text-right font-bold text-gray-700 dark:text-gray-200">
                                {numberFormatter.format(d.balance)}
                              </td>
                              <td className="py-4 px-6 text-right font-bold text-gray-700 dark:text-gray-200">
                                {numberFormatter.format(d.measuredByMachine)}
                              </td>
                              <td className={"py-4 px-6 text-right font-black " + diffColor(d.differenceMachine)}>
                                {d.differenceMachine > 0 ? "+" : ""}
                                {numberFormatter.format(d.differenceMachine)}
                              </td>
                              <td className="py-4 px-6 text-right font-bold text-gray-700 dark:text-gray-200">
                                {numberFormatter.format(d.measuredByHand)}
                              </td>
                              <td className={"py-4 px-6 text-right font-black " + diffColor(d.differenceHand)}>
                                {d.differenceHand > 0 ? "+" : ""}
                                {numberFormatter.format(d.differenceHand)}
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

