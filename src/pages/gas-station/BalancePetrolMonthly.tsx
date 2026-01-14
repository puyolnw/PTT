import { AnimatePresence, motion } from "framer-motion";
import { useState, useMemo } from "react";
import {
  BookOpen,
  TrendingUp,
  TrendingDown,
  Droplet,
  Calendar,
  Download,
  ChevronDown,
  Search,
  Filter,
  Check,
  ChevronUp,
  ChevronsUpDown,
  X,
  Info,
} from "lucide-react";

const numberFormatter = new Intl.NumberFormat("th-TH", {
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
});

const integerFormatter = new Intl.NumberFormat("th-TH", {
  maximumFractionDigits: 0,
});

type OilType = "HSD" | "HSP" | "GSH91" | "E20" | "GSH95" | "E85" | "ULG";

type DailyBalanceRow = {
  date: number; // ว/ด/ป (วันที่)
  oilType: OilType;
  receive: number; // รับ (ลิตร)
  withdraw: number; // เบิกใช้ (ลิตร)
  pay: number; // จ่าย (ลิตร)
  balance: number; // คงเหลือ (ยอดยกมา + รับ - จ่าย)
  measuredBalance: number; // วัดได้จริง (ลิตร)
  difference: number; // ส่วนต่างลิตร (วัดได้จริง - คงเหลือ)
  tripNo?: string; // ใส่เที่ยว (เลขที่เที่ยวขนส่ง)
  accumulatedDifference: number; // สะสมลิตร (ยอดน้ำมันขาด/เกิน สะสม)
  pricePerLiter: number; // ราคา (บาท/ลิตร)
  moneyDifference: number; // เป็นเงินขาด/เกิน (ส่วนต่างลิตร x ราคา)
  accumulatedMoney: number; // สะสมเงิน (ยอดเงินขาด/เกิน สะสม)
};

type MonthlySummary = {
  month: string;
  year: number;
  rows: DailyBalanceRow[];
  totalReceive: number;
  totalWithdraw: number;
  totalPay: number;
  totalDifference: number;
  totalAccumulatedDifference: number;
  totalMoneyDifference: number;
  totalAccumulatedMoney: number;
};

// ชื่อเดือนภาษาไทย
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

// ฟังก์ชันแปลงปี พ.ศ. เป็น ค.ศ.
const getBuddhistYear = (date: Date): number => {
  return date.getFullYear() + 543;
};

const mockMonthlyDataMap: Record<string, MonthlySummary> = {
  "0": {
    month: "มกราคม",
    year: 2565,
    rows: [
      {
        date: 1,
        oilType: "HSD",
        receive: 230700,
        withdraw: 0,
        pay: 220116.7,
        balance: 16226.3,
        measuredBalance: 16124,
        difference: 16124 - 16226.3, // วัดได้จริง - คงเหลือ
        tripNo: "T001",
        accumulatedDifference: -102.3,
        pricePerLiter: 30.49,
        moneyDifference: (16124 - 16226.3) * 30.49,
        accumulatedMoney: -3119.13,
      },
      {
        date: 2,
        oilType: "HSD",
        receive: 164700,
        withdraw: 0,
        pay: 167744.5,
        balance: 8306.5,
        measuredBalance: 7948,
        difference: 7948 - 8306.5,
        tripNo: "T002",
        accumulatedDifference: -460.8,
        pricePerLiter: 30.49,
        moneyDifference: (7948 - 8306.5) * 30.49,
        accumulatedMoney: -14049.82,
      },
      {
        date: 3,
        oilType: "HSP",
        receive: 4000,
        withdraw: 0,
        pay: 5730.5,
        balance: 6073.5,
        measuredBalance: 6093,
        difference: 6093 - 6073.5,
        tripNo: "T003",
        accumulatedDifference: 19.5,
        pricePerLiter: 36.51,
        moneyDifference: (6093 - 6073.5) * 36.51,
        accumulatedMoney: 711.95,
      },
      {
        date: 4,
        oilType: "GSH91",
        receive: 31000,
        withdraw: 0,
        pay: 27845.2,
        balance: 9944.8,
        measuredBalance: 9841,
        difference: 9841 - 9944.8,
        tripNo: "T004",
        accumulatedDifference: -103.8,
        pricePerLiter: 34.33,
        moneyDifference: (9841 - 9944.8) * 34.33,
        accumulatedMoney: -3563.45,
      },
      {
        date: 5,
        oilType: "E20",
        receive: 34500,
        withdraw: 0,
        pay: 33283,
        balance: 7696,
        measuredBalance: 7649,
        difference: 7649 - 7696,
        tripNo: "T005",
        accumulatedDifference: -47,
        pricePerLiter: 33.39,
        moneyDifference: (7649 - 7696) * 33.39,
        accumulatedMoney: -1569.33,
      },
      {
        date: 6,
        oilType: "E20",
        receive: 73500,
        withdraw: 0,
        pay: 69967.7,
        balance: 7070.3,
        measuredBalance: 6918,
        difference: 6918 - 7070.3,
        tripNo: "T006",
        accumulatedDifference: -152.3,
        pricePerLiter: 34.6,
        moneyDifference: (6918 - 7070.3) * 34.6,
        accumulatedMoney: -5269.58,
      },
      {
        date: 7,
        oilType: "GSH95",
        receive: 14000,
        withdraw: 0,
        pay: 15608.1,
        balance: 8482.9,
        measuredBalance: 8444,
        difference: 8444 - 8482.9,
        tripNo: "T007",
        accumulatedDifference: -38.9,
        pricePerLiter: 26.19,
        moneyDifference: (8444 - 8482.9) * 26.19,
        accumulatedMoney: -1018.49,
      },
      {
        date: 8,
        oilType: "E85",
        receive: 62000,
        withdraw: 0,
        pay: 53956.1,
        balance: 9799.9,
        measuredBalance: 9746,
        difference: 9746 - 9799.9,
        tripNo: "T008",
        accumulatedDifference: -53.9,
        pricePerLiter: 34.33,
        moneyDifference: (9746 - 9799.9) * 34.33,
        accumulatedMoney: -1850.39,
      },
      {
        date: 9,
        oilType: "ULG",
        receive: 8000,
        withdraw: 0,
        pay: 2669.6,
        balance: 8850.4,
        measuredBalance: 8830,
        difference: 8830 - 8850.4,
        tripNo: "T009",
        accumulatedDifference: -20.4,
        pricePerLiter: 42.01,
        moneyDifference: (8830 - 8850.4) * 42.01,
        accumulatedMoney: -857.0,
      },
      {
        date: 10,
        oilType: "E20",
        receive: 17000,
        withdraw: 0,
        pay: 16484.6,
        balance: 7940.4,
        measuredBalance: 8099,
        difference: 8099 - 7940.4,
        tripNo: "T010",
        accumulatedDifference: 558.6,
        pricePerLiter: 33.39,
        moneyDifference: (8099 - 7940.4) * 33.39,
        accumulatedMoney: 18651.65,
      },
    ],
    totalReceive: 639900,
    totalWithdraw: 0,
    totalPay: 613406,
    totalDifference: -299,
    totalAccumulatedDifference: -299,
    totalMoneyDifference: -8834.19,
    totalAccumulatedMoney: 6144.71,
  },
  "1": {
    month: "กุมภาพันธ์",
    year: 2565,
    rows: [
      {
        date: 1,
        oilType: "HSD",
        receive: 215000,
        withdraw: 0,
        pay: 214752,
        balance: 15872,
        measuredBalance: 15859,
        difference: 15859 - 15872,
        tripNo: "T011",
        accumulatedDifference: -13,
        pricePerLiter: 29.69,
        moneyDifference: (15859 - 15872) * 29.69,
        accumulatedMoney: -385.94,
      },
      {
        date: 2,
        oilType: "HSP",
        receive: 18000,
        withdraw: 0,
        pay: 18234.5,
        balance: 7638.5,
        measuredBalance: 7521,
        difference: 7521 - 7638.5,
        tripNo: "T012",
        accumulatedDifference: -117.5,
        pricePerLiter: 36.81,
        moneyDifference: (7521 - 7638.5) * 36.81,
        accumulatedMoney: -4324.78,
      },
      {
        date: 3,
        oilType: "GSH91",
        receive: 28000,
        withdraw: 0,
        pay: 27543.2,
        balance: 10297.6,
        measuredBalance: 10185,
        difference: 10185 - 10297.6,
        tripNo: "T013",
        accumulatedDifference: -112.6,
        pricePerLiter: 34.33,
        moneyDifference: (10185 - 10297.6) * 34.33,
        accumulatedMoney: -3865.78,
      },
      {
        date: 4,
        oilType: "E20",
        receive: 32000,
        withdraw: 0,
        pay: 31567.5,
        balance: 8161.5,
        measuredBalance: 8089,
        difference: 8089 - 8161.5,
        tripNo: "T014",
        accumulatedDifference: -72.5,
        pricePerLiter: 33.39,
        moneyDifference: (8089 - 8161.5) * 33.39,
        accumulatedMoney: -2419.58,
      },
      {
        date: 5,
        oilType: "E20",
        receive: 30500,
        withdraw: 0,
        pay: 30176,
        balance: 7973,
        measuredBalance: 7869,
        difference: 7869 - 7973,
        tripNo: "T015",
        accumulatedDifference: -104,
        pricePerLiter: 35.99,
        moneyDifference: (7869 - 7973) * 35.99,
        accumulatedMoney: -3742.96,
      },
      {
        date: 6,
        oilType: "GSH95",
        receive: 15000,
        withdraw: 0,
        pay: 14892.3,
        balance: 8590.7,
        measuredBalance: 8521,
        difference: 8521 - 8590.7,
        tripNo: "T016",
        accumulatedDifference: -69.7,
        pricePerLiter: 33.39,
        moneyDifference: (8521 - 8590.7) * 33.39,
        accumulatedMoney: -2326.47,
      },
      {
        date: 7,
        oilType: "E85",
        receive: 58000,
        withdraw: 0,
        pay: 57123.4,
        balance: 9666.6,
        measuredBalance: 9612,
        difference: 9612 - 9666.6,
        tripNo: "T017",
        accumulatedDifference: -54.6,
        pricePerLiter: 34.6,
        moneyDifference: (9612 - 9666.6) * 34.6,
        accumulatedMoney: -1889.16,
      },
      {
        date: 8,
        oilType: "ULG",
        receive: 7500,
        withdraw: 0,
        pay: 7234.2,
        balance: 9116.2,
        measuredBalance: 9089,
        difference: 9089 - 9116.2,
        tripNo: "T018",
        accumulatedDifference: -27.2,
        pricePerLiter: 26.69,
        moneyDifference: (9089 - 9116.2) * 26.69,
        accumulatedMoney: -725.58,
      },
      {
        date: 9,
        oilType: "GSH91",
        receive: 25000,
        withdraw: 0,
        pay: 24876.3,
        balance: 10409.3,
        measuredBalance: 10321,
        difference: 10321 - 10409.3,
        tripNo: "T019",
        accumulatedDifference: -88.3,
        pricePerLiter: 34.33,
        moneyDifference: (10321 - 10409.3) * 34.33,
        accumulatedMoney: -3030.19,
      },
      {
        date: 10,
        oilType: "E20",
        receive: 12000,
        withdraw: 0,
        pay: 12201.4,
        balance: 7897.6,
        measuredBalance: 7910,
        difference: 7910 - 7897.6,
        tripNo: "T020",
        accumulatedDifference: 12.4,
        pricePerLiter: 35.99,
        moneyDifference: (7910 - 7897.6) * 35.99,
        accumulatedMoney: 446.28,
      },
    ],
    totalReceive: 553500,
    totalWithdraw: 0,
    totalPay: 555906.2,
    totalDifference: -299,
    totalAccumulatedDifference: -299,
    totalMoneyDifference: -16249.64,
    totalAccumulatedMoney: 4990.33,
  },
};

export default function BalancePetrolMonthly() {
  // ใช้เวลาปัจจุบันเป็นค่าเริ่มต้น
  const now = useMemo(() => new Date(), []);
  const currentBuddhistYear = getBuddhistYear(now);
  const currentMonth = now.getMonth();

  const [selectedYear, setSelectedYear] = useState(currentBuddhistYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [showYearDropdown, setShowYearDropdown] = useState(false);
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);

  // สร้างรายการปี (5 ปีย้อนหลัง ถึง 2 ปีข้างหน้า)
  const availableYears = useMemo(() => {
    const years: number[] = [];
    for (let i = currentBuddhistYear - 5; i <= currentBuddhistYear + 2; i++) {
      years.push(i);
    }
    return years;
  }, [currentBuddhistYear]);

  // ดึงข้อมูลตามเดือนและปีที่เลือก
  const template = mockMonthlyDataMap[String(selectedMonth)];
  const currentData: MonthlySummary =
    template || {
      month: thaiMonths[selectedMonth],
      year: selectedYear,
      rows: [],
      totalReceive: 0,
      totalWithdraw: 0,
      totalPay: 0,
      totalDifference: 0,
      totalAccumulatedDifference: 0,
      totalMoneyDifference: 0,
      totalAccumulatedMoney: 0,
    };

  const getGainLossColor = (value: number) => {
    if (value > 0) return "text-emerald-600 dark:text-emerald-400";
    if (value < 0) return "text-red-600 dark:text-red-400";
    return "text-gray-600 dark:text-gray-400";
  };

  const getDifferenceColor = (value: number) => {
    if (value > 0) return "text-emerald-600 dark:text-emerald-400";
    if (value < 0) return "text-red-600 dark:text-red-400";
    return "text-gray-600 dark:text-gray-400";
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [columnFilters, setColumnFilters] = useState<{
    oilType: string;
    tripNo: string;
  }>({
    oilType: "ทั้งหมด",
    tripNo: "ทั้งหมด",
  });

  type FilterKey = "oilType" | "tripNo";
  type SortKey =
    | "date"
    | "oilType"
    | "receive"
    | "withdraw"
    | "pay"
    | "balance"
    | "measuredBalance"
    | "difference"
    | "tripNo"
    | "accumulatedDifference"
    | "pricePerLiter"
    | "moneyDifference"
    | "accumulatedMoney";

  const [activeHeaderDropdown, setActiveHeaderDropdown] = useState<FilterKey | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: "asc" | "desc" | null }>({
    key: "date",
    direction: "asc",
  });

  const filterOptions = useMemo(() => {
    const oilTypes = Array.from(new Set(currentData.rows.map((r) => r.oilType))).sort((a, b) =>
      a.localeCompare(b)
    );
    const tripNos = Array.from(new Set(currentData.rows.map((r) => r.tripNo).filter(Boolean) as string[])).sort(
      (a, b) => a.localeCompare(b)
    );
    return {
      oilType: ["ทั้งหมด", ...oilTypes],
      tripNo: ["ทั้งหมด", ...tripNos],
    };
  }, [currentData.rows]);

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

    let rows = currentData.rows.filter((row) => {
      const matchesSearch =
        term === "" ||
        String(row.date).includes(term) ||
        row.oilType.toLowerCase().includes(term) ||
        String(row.tripNo ?? "").toLowerCase().includes(term);

      const matchesOilType = columnFilters.oilType === "ทั้งหมด" || row.oilType === columnFilters.oilType;
      const matchesTripNo = columnFilters.tripNo === "ทั้งหมด" || row.tripNo === columnFilters.tripNo;

      return matchesSearch && matchesOilType && matchesTripNo;
    });

    if (sortConfig.key && sortConfig.direction) {
      const dir = sortConfig.direction === "asc" ? 1 : -1;
      const compare = (a: string | number, b: string | number) => {
        if (a < b) return -1 * dir;
        if (a > b) return 1 * dir;
        return 0;
      };

      rows = rows.slice().sort((a, b) => {
        switch (sortConfig.key) {
          case "date":
            return compare(a.date, b.date);
          case "oilType":
            return compare(a.oilType, b.oilType);
          case "receive":
            return compare(a.receive, b.receive);
          case "withdraw":
            return compare(a.withdraw, b.withdraw);
          case "pay":
            return compare(a.pay, b.pay);
          case "balance":
            return compare(a.balance, b.balance);
          case "measuredBalance":
            return compare(a.measuredBalance, b.measuredBalance);
          case "difference":
            return compare(a.difference, b.difference);
          case "tripNo":
            return compare(a.tripNo ?? "", b.tripNo ?? "");
          case "accumulatedDifference":
            return compare(a.accumulatedDifference, b.accumulatedDifference);
          case "pricePerLiter":
            return compare(a.pricePerLiter, b.pricePerLiter);
          case "moneyDifference":
            return compare(a.moneyDifference, b.moneyDifference);
          case "accumulatedMoney":
            return compare(a.accumulatedMoney, b.accumulatedMoney);
        }
      });
    }

    return rows;
  }, [currentData.rows, searchTerm, columnFilters, sortConfig]);

  const isAnyFilterActive = useMemo(() => {
    return searchTerm !== "" || columnFilters.oilType !== "ทั้งหมด" || columnFilters.tripNo !== "ทั้งหมด";
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
      <th
        className={`px-6 py-4 relative group ${
          align === "right" ? "text-right" : align === "center" ? "text-center" : ""
        }`}
      >
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
                  isActiveFilter
                    ? "bg-emerald-500 text-white shadow-sm"
                    : "hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400"
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
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              Balance Petrol รายเดือน
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium flex items-center gap-2">
              <Droplet className="w-4 h-4" />
              รายงานสรุปยอดน้ำมันคงเหลือและการตรวจสอบน้ำมันขาด/เกิน (คอลัมน์เดิมครบ)
            </p>
          </div>

          <button
            type="button"
            className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-bold shadow-lg shadow-emerald-500/20 transition-all active:scale-95 flex items-center gap-2 justify-center"
          >
            <Download className="w-5 h-5" />
            ส่งออก
          </button>
        </div>
      </header>

      {/* Info Box */}
      <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-3xl p-4 mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Info className="w-6 h-6 text-emerald-500" />
          <div>
            <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">
              เพิ่มการค้นหา/กรองข้อมูลที่หัวคอลัมน์ (ชนิด/ใส่เที่ยว) และการเรียงข้อมูลเหมือนหน้า Master
            </p>
            <p className="text-xs text-emerald-800/80 dark:text-emerald-200/80 mt-1">
              ตารางยังคงคอลัมน์เดิมครบทุกคอลัมน์
            </p>
          </div>
        </div>
        <div className="text-xs text-emerald-900/80 dark:text-emerald-100 font-bold">
          {currentData.month} {currentData.year} • พบ {filteredRows.length} รายการ
        </div>
      </div>

      {/* Month & Year Selector */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm p-4"
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-gray-400" />
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">เลือกเดือนและปี:</span>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Year Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowYearDropdown(!showYearDropdown);
                  setShowMonthDropdown(false);
                }}
                className="px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 min-w-[140px] justify-between"
              >
                <span>{selectedYear}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showYearDropdown ? "rotate-180" : ""}`} />
              </button>
              {showYearDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowYearDropdown(false)}
                  />
                  <div className="absolute top-full left-0 mt-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-xl z-20 max-h-60 overflow-y-auto min-w-[140px] overflow-hidden">
                    {availableYears.map((year) => (
                      <button
                        key={year}
                        onClick={() => {
                          setSelectedYear(year);
                          setShowYearDropdown(false);
                        }}
                        className={`w-full px-4 py-2 text-left text-xs font-bold transition-colors flex items-center justify-between ${
                          selectedYear === year
                            ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400"
                            : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                        }`}
                      >
                        {year}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Month Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowMonthDropdown(!showMonthDropdown);
                  setShowYearDropdown(false);
                }}
                className="px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 min-w-[170px] justify-between"
              >
                <span>{thaiMonths[selectedMonth]}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showMonthDropdown ? "rotate-180" : ""}`} />
              </button>
              {showMonthDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowMonthDropdown(false)}
                  />
                  <div className="absolute top-full left-0 mt-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-xl z-20 max-h-60 overflow-y-auto min-w-[170px] overflow-hidden">
                    {thaiMonths.map((month, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setSelectedMonth(index);
                          setShowMonthDropdown(false);
                        }}
                        className={`w-full px-4 py-2 text-left text-xs font-bold transition-colors flex items-center justify-between ${
                          selectedMonth === index
                            ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400"
                            : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                        }`}
                      >
                        {month}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="ค้นหา: วัน / ชนิด / เที่ยวขนส่ง..."
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
                setColumnFilters({ oilType: "ทั้งหมด", tripNo: "ทั้งหมด" });
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl">
              <TrendingUp className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">รับรวม</p>
              <p className="text-2xl font-black text-gray-900 dark:text-white">{numberFormatter.format(currentData.totalReceive)}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">ลิตร</p>
            </div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-rose-50 dark:bg-rose-900/20 rounded-2xl">
              <TrendingDown className="w-6 h-6 text-rose-500" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">จ่ายรวม</p>
              <p className="text-2xl font-black text-gray-900 dark:text-white">{numberFormatter.format(currentData.totalPay)}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">ลิตร</p>
            </div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gray-50 dark:bg-gray-900/20 rounded-2xl">
              <Droplet className="w-6 h-6 text-gray-500" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">ส่วนต่างลิตร</p>
              <p className={`text-2xl font-black ${getDifferenceColor(currentData.totalDifference)}`}>
                {currentData.totalDifference > 0 ? "+" : ""}
                {numberFormatter.format(currentData.totalDifference)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">รวม</p>
            </div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gray-50 dark:bg-gray-900/20 rounded-2xl">
              <Droplet className="w-6 h-6 text-gray-500" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">สะสมเงิน</p>
              <p className={`text-2xl font-black ${getGainLossColor(currentData.totalAccumulatedMoney)}`}>
                {currentData.totalAccumulatedMoney > 0 ? "+" : ""}
                {numberFormatter.format(currentData.totalAccumulatedMoney)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">บาท</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Monthly Summary Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden"
      >
        <div className="border-b border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-black text-gray-800 dark:text-white">
            ประจำเดือน {currentData.month} {currentData.year}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            เรียง/กรองข้อมูลได้จากหัวคอลัมน์ (คอลัมน์เดิมครบเหมือนเดิม)
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-gray-900/50 text-[10px] uppercase tracking-widest font-black text-gray-400">
                <HeaderWithFilter label="ว/ด/ป" columnKey="date" align="center" />
                <HeaderWithFilter label="ชนิด" columnKey="oilType" filterKey="oilType" options={filterOptions.oilType} />
                <HeaderWithFilter label="รับ" columnKey="receive" align="right" />
                <HeaderWithFilter label="เบิกใช้" columnKey="withdraw" align="right" />
                <HeaderWithFilter label="จ่าย" columnKey="pay" align="right" />
                <HeaderWithFilter label="คงเหลือ" columnKey="balance" align="right" />
                <HeaderWithFilter label="วัดได้จริง" columnKey="measuredBalance" align="right" />
                <HeaderWithFilter label="ส่วนต่างลิตร" columnKey="difference" align="right" />
                <HeaderWithFilter
                  label="ใส่เที่ยว"
                  columnKey="tripNo"
                  filterKey="tripNo"
                  options={filterOptions.tripNo}
                  align="center"
                />
                <HeaderWithFilter label="สะสมลิตร" columnKey="accumulatedDifference" align="right" />
                <HeaderWithFilter label="ราคา" columnKey="pricePerLiter" align="right" />
                <HeaderWithFilter label="เป็นเงินขาด/เกิน" columnKey="moneyDifference" align="right" />
                <HeaderWithFilter label="สะสมเงิน" columnKey="accumulatedMoney" align="right" />
              </tr>
            </thead>
            <tbody>
              {filteredRows.length === 0 && (
                <tr>
                  <td colSpan={13} className="py-12 px-6 text-center text-sm text-gray-500 dark:text-gray-400">
                    ไม่พบข้อมูลที่ตรงกับเงื่อนไข
                  </td>
                </tr>
              )}

              {filteredRows.map((row, index) => (
                <motion.tr
                  key={`${row.date}-${row.oilType}-${index}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.25, delay: index * 0.02 }}
                  className={`border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                    index % 2 === 0 ? "bg-white dark:bg-gray-800" : "bg-gray-50/50 dark:bg-gray-900/30"
                  }`}
                >
                  <td className="text-center py-4 px-6 text-sm font-bold text-gray-800 dark:text-white">
                    {row.date}
                  </td>
                  <td className="py-4 px-6 text-sm font-bold text-gray-800 dark:text-white">{row.oilType}</td>
                  <td className="text-right py-4 px-6 text-sm font-bold text-gray-800 dark:text-white">
                    {row.receive > 0 ? numberFormatter.format(row.receive) : "-"}
                  </td>
                  <td className="text-right py-4 px-6 text-sm font-bold text-gray-800 dark:text-white">
                    {row.withdraw > 0 ? numberFormatter.format(row.withdraw) : "-"}
                  </td>
                  <td className="text-right py-4 px-6 text-sm font-bold text-gray-800 dark:text-white">
                    {numberFormatter.format(row.pay)}
                  </td>
                  <td className="text-right py-4 px-6 text-sm font-bold text-gray-800 dark:text-white">
                    {numberFormatter.format(row.balance)}
                  </td>
                  <td className="text-right py-4 px-6 text-sm font-bold text-gray-800 dark:text-white">
                    {integerFormatter.format(row.measuredBalance)}
                  </td>
                  <td className={`text-right py-4 px-6 text-sm font-black ${getDifferenceColor(row.difference)}`}>
                    {row.difference > 0 ? "+" : ""}
                    {numberFormatter.format(row.difference)}
                  </td>
                  <td className="text-center py-4 px-6 text-sm font-bold text-gray-800 dark:text-white">
                    {row.tripNo || "-"}
                  </td>
                  <td className={`text-right py-4 px-6 text-sm font-black ${getDifferenceColor(row.accumulatedDifference)}`}>
                    {row.accumulatedDifference > 0 ? "+" : ""}
                    {numberFormatter.format(row.accumulatedDifference)}
                  </td>
                  <td className="text-right py-4 px-6 text-sm font-bold text-gray-800 dark:text-white">
                    {numberFormatter.format(row.pricePerLiter)}
                  </td>
                  <td className={`text-right py-4 px-6 text-sm font-black ${getGainLossColor(row.moneyDifference)}`}>
                    {row.moneyDifference > 0 ? "+" : ""}
                    {numberFormatter.format(row.moneyDifference)}
                  </td>
                  <td className={`text-right py-4 px-6 text-sm font-black ${getGainLossColor(row.accumulatedMoney)}`}>
                    {row.accumulatedMoney > 0 ? "+" : ""}
                    {numberFormatter.format(row.accumulatedMoney)}
                  </td>
                </motion.tr>
              ))}
            </tbody>
            {/* Footer Summary */}
            <tfoot>
              <tr className="bg-gray-50/50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
                <td colSpan={2} className="py-4 px-6 text-right text-sm font-black text-gray-800 dark:text-white">
                  รวม
                </td>
                <td className="py-4 px-6 text-right text-sm font-black text-gray-800 dark:text-white">
                  {numberFormatter.format(currentData.totalReceive)}
                </td>
                <td className="py-4 px-6 text-right text-sm font-black text-gray-800 dark:text-white">
                  {numberFormatter.format(currentData.totalWithdraw)}
                </td>
                <td className="py-4 px-6 text-right text-sm font-black text-gray-800 dark:text-white">
                  {numberFormatter.format(currentData.totalPay)}
                </td>
                <td colSpan={2} className="py-4 px-6 text-center text-sm font-bold text-gray-500 dark:text-gray-400">
                  -
                </td>
                <td className={`py-4 px-6 text-right text-sm font-black ${getDifferenceColor(currentData.totalDifference)}`}>
                  {currentData.totalDifference > 0 ? "+" : ""}
                  {numberFormatter.format(currentData.totalDifference)}
                </td>
                <td className="py-4 px-6 text-center text-sm font-bold text-gray-500 dark:text-gray-400">
                  -
                </td>
                <td className={`py-4 px-6 text-right text-sm font-black ${getDifferenceColor(currentData.totalAccumulatedDifference)}`}>
                  {currentData.totalAccumulatedDifference > 0 ? "+" : ""}
                  {numberFormatter.format(currentData.totalAccumulatedDifference)}
                </td>
                <td className="py-4 px-6 text-center text-sm font-bold text-gray-500 dark:text-gray-400">
                  -
                </td>
                <td className={`py-4 px-6 text-right text-sm font-black ${getGainLossColor(currentData.totalMoneyDifference)}`}>
                  {currentData.totalMoneyDifference > 0 ? "+" : ""}
                  {numberFormatter.format(currentData.totalMoneyDifference)}
                </td>
                <td className={`py-4 px-6 text-right text-sm font-black ${getGainLossColor(currentData.totalAccumulatedMoney)}`}>
                  {currentData.totalAccumulatedMoney > 0 ? "+" : ""}
                  {numberFormatter.format(currentData.totalAccumulatedMoney)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </motion.div>
    </div>
  );
}

