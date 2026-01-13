import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import {
  BookOpen,
  TrendingUp,
  TrendingDown,
  Droplet,
  Search,
  Filter,
  Check,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
} from "lucide-react";

const numberFormatter = new Intl.NumberFormat("th-TH", {
  maximumFractionDigits: 2,
});

type PumpCode =
  | "P18"
  | "P26"
  | "P34"
  | "P42"
  | "P59"
  | "P67"
  | "P75"
  | "P83"
  | "P91"
  | "P99";

type ProductCode = "D87" | "B" | "GSH95";

type BalanceRow = {
  date: string;
  fullDate: Date; // วันที่แบบเต็มสำหรับการกรอง
  receive: number;
  pay: number;
  balance: number;
  pumps: Record<PumpCode, number>;
  products: Record<ProductCode, number>;
};

const pumpCodes: PumpCode[] = [
  "P18",
  "P26",
  "P34",
  "P42",
  "P59",
  "P67",
  "P75",
  "P83",
  "P91",
  "P99",
];

const productPrices: Record<ProductCode, number> = {
  D87: 32.49,
  B: 54.0,
  GSH95: 41.49,
};

// Mock data เลียนแบบสมุดจริง (ตัวเลขสมมติ) - เพิ่มข้อมูลหลายเดือน
const mockBalanceRows: BalanceRow[] = [
  // เดือนพฤษภาคม 2568
  {
    date: "20/5/68",
    fullDate: new Date(2025, 4, 20),
    receive: 297430,
    pay: 442762.19,
    balance: 2393153.86,
    pumps: {
      P18: 17005.3,
      P26: 5377,
      P34: 3562.6,
      P42: 4662.2,
      P59: 0,
      P67: 0,
      P75: 4407.5,
      P83: 3623.8,
      P91: 4529.8,
      P99: 3323.9,
    },
    products: {
      D87: 29873.5,
      B: 12540.2,
      GSH95: 8740.0,
    },
  },
  {
    date: "21/5/68",
    fullDate: new Date(2025, 4, 21),
    receive: 263560,
    pay: 448747.43,
    balance: 2199821.67,
    pumps: {
      P18: 8663.3,
      P26: 15289.5,
      P34: 5315.5,
      P42: 3383.3,
      P59: 3927,
      P67: 5251.0,
      P75: 0,
      P83: 0,
      P91: 0,
      P99: 0,
    },
    products: {
      D87: 21540.0,
      B: 9520.7,
      GSH95: 6840.3,
    },
  },
  {
    date: "22/5/68",
    fullDate: new Date(2025, 4, 22),
    receive: 585540,
    pay: 412313.63,
    balance: 2157304.84,
    pumps: {
      P18: 15872.1,
      P26: 14328.3,
      P34: 5289.8,
      P42: 6202.2,
      P59: 3394.0,
      P67: 0,
      P75: 4984.3,
      P83: 4209.9,
      P91: 4685.0,
      P99: 2891.1,
    },
    products: {
      D87: 32580.4,
      B: 14290.8,
      GSH95: 9785.6,
    },
  },
  // เดือนมิถุนายน 2568
  {
    date: "1/6/68",
    fullDate: new Date(2025, 5, 1),
    receive: 320000,
    pay: 455000,
    balance: 2022304.84,
    pumps: {
      P18: 16500,
      P26: 6200,
      P34: 4100,
      P42: 5300,
      P59: 3800,
      P67: 4500,
      P75: 5200,
      P83: 4800,
      P91: 5100,
      P99: 3900,
    },
    products: {
      D87: 31200,
      B: 13800,
      GSH95: 9500,
    },
  },
  {
    date: "2/6/68",
    fullDate: new Date(2025, 5, 2),
    receive: 280000,
    pay: 430000,
    balance: 1872304.84,
    pumps: {
      P18: 15200,
      P26: 5800,
      P34: 3900,
      P42: 4900,
      P59: 3500,
      P67: 4200,
      P75: 4800,
      P83: 4400,
      P91: 4700,
      P99: 3600,
    },
    products: {
      D87: 28900,
      B: 12700,
      GSH95: 8800,
    },
  },
  // เดือนกรกฎาคม 2568
  {
    date: "1/7/68",
    fullDate: new Date(2025, 6, 1),
    receive: 350000,
    pay: 480000,
    balance: 1742304.84,
    pumps: {
      P18: 17800,
      P26: 6800,
      P34: 4500,
      P42: 5800,
      P59: 4200,
      P67: 5000,
      P75: 5700,
      P83: 5300,
      P91: 5600,
      P99: 4300,
    },
    products: {
      D87: 34500,
      B: 15200,
      GSH95: 10500,
    },
  },
  {
    date: "15/7/68",
    fullDate: new Date(2025, 6, 15),
    receive: 310000,
    pay: 445000,
    balance: 1607304.84,
    pumps: {
      P18: 16200,
      P26: 6200,
      P34: 4100,
      P42: 5300,
      P59: 3800,
      P67: 4600,
      P75: 5200,
      P83: 4900,
      P91: 5100,
      P99: 3900,
    },
    products: {
      D87: 31400,
      B: 13900,
      GSH95: 9600,
    },
  },
];

export default function BalancePetrol() {
  const rows = useMemo(() => mockBalanceRows, []);

  const [searchTerm, setSearchTerm] = useState("");
  const [columnFilters, setColumnFilters] = useState<{
    date: string;
    pump: PumpCode | "ทั้งหมด";
    product: ProductCode | "ทั้งหมด";
  }>({ date: "ทั้งหมด", pump: "ทั้งหมด", product: "ทั้งหมด" });

  type FilterKey = "date" | "pump" | "product";
  type SortKey = "date" | "receive" | "pay" | "balance";

  const [activeHeaderDropdown, setActiveHeaderDropdown] = useState<FilterKey | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: "asc" | "desc" | null }>({
    key: "date",
    direction: "desc",
  });

  const filterOptions = useMemo(() => {
    const uniqueDates = Array.from(new Set(rows.map((r) => r.date))).sort((a, b) => {
      const aRow = rows.find((x) => x.date === a);
      const bRow = rows.find((x) => x.date === b);
      const aT = aRow ? aRow.fullDate.getTime() : 0;
      const bT = bRow ? bRow.fullDate.getTime() : 0;
      return bT - aT;
    });

    return {
      date: ["ทั้งหมด", ...uniqueDates],
      pump: ["ทั้งหมด", ...pumpCodes],
      product: ["ทั้งหมด", "D87", "B", "GSH95"] as const,
    };
  }, [rows]);

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
    let result = rows.filter((row) => {
      const term = searchTerm.trim().toLowerCase();
      const matchesSearch =
        term === "" ||
        row.date.toLowerCase().includes(term) ||
        String(row.receive).includes(term) ||
        String(row.pay).includes(term) ||
        String(row.balance).includes(term);

      const matchesDate = columnFilters.date === "ทั้งหมด" || row.date === columnFilters.date;
      const matchesPump =
        columnFilters.pump === "ทั้งหมด" || (row.pumps[columnFilters.pump] ?? 0) > 0;
      const matchesProduct =
        columnFilters.product === "ทั้งหมด" || (row.products[columnFilters.product] ?? 0) > 0;

      return matchesSearch && matchesDate && matchesPump && matchesProduct;
    });

    if (sortConfig.key && sortConfig.direction) {
      const dir = sortConfig.direction === "asc" ? 1 : -1;
      result = [...result].sort((a, b) => {
        switch (sortConfig.key) {
          case "date":
            return (a.fullDate.getTime() - b.fullDate.getTime()) * dir;
          case "receive":
            return (a.receive - b.receive) * dir;
          case "pay":
            return (a.pay - b.pay) * dir;
          case "balance":
            return (a.balance - b.balance) * dir;
        }
      });
    }

    return result;
  }, [rows, searchTerm, columnFilters, sortConfig]);

  const totalReceive = filteredRows.reduce((sum, r) => sum + r.receive, 0);
  const totalPay = filteredRows.reduce((sum, r) => sum + r.pay, 0);
  const lastBalance =
    filteredRows.length > 0
      ? filteredRows[filteredRows.length - 1].balance
      : 0;

  const isAnyFilterActive = useMemo(() => {
    return (
      searchTerm !== "" ||
      columnFilters.date !== "ทั้งหมด" ||
      columnFilters.pump !== "ทั้งหมด" ||
      columnFilters.product !== "ทั้งหมด"
    );
  }, [searchTerm, columnFilters]);

  const HeaderWithFilter = ({
    label,
    columnKey,
    filterKey,
    options,
    align = "left",
    rowSpan,
  }: {
    label: string;
    columnKey?: SortKey;
    filterKey?: FilterKey;
    options?: readonly string[];
    align?: "left" | "right" | "center";
    rowSpan?: number;
  }) => {
    const justify =
      align === "right" ? "justify-end" : align === "center" ? "justify-center" : "justify-start";

    const getFilterValue = (key: FilterKey) => {
      if (key === "date") return columnFilters.date;
      if (key === "pump") return columnFilters.pump;
      return columnFilters.product;
    };

    const setFilterValue = (key: FilterKey, value: string) => {
      if (key === "date") {
        setColumnFilters((prev) => ({ ...prev, date: value }));
        return;
      }
      if (key === "pump") {
        setColumnFilters((prev) => ({ ...prev, pump: value as PumpCode | "ทั้งหมด" }));
        return;
      }
      setColumnFilters((prev) => ({ ...prev, product: value as ProductCode | "ทั้งหมด" }));
    };

    const currentFilterValue = filterKey ? getFilterValue(filterKey) : "ทั้งหมด";

    return (
      <th
        rowSpan={rowSpan}
        className={`px-3 py-3 relative ${align === "right" ? "text-right" : align === "center" ? "text-center" : ""}`}
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
                  currentFilterValue !== "ทั้งหมด"
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
                            setFilterValue(filterKey, opt);
                            setActiveHeaderDropdown(null);
                          }}
                          className={`w-full text-left px-4 py-2 text-xs font-bold transition-colors flex items-center justify-between ${
                            currentFilterValue === opt
                              ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400"
                              : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                          }`}
                        >
                          {opt}
                          {currentFilterValue === opt && <Check className="w-3 h-3" />}
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
      {/* Header */}
      <header className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
              <div className="p-2 bg-emerald-500 rounded-2xl shadow-lg shadow-emerald-500/20">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              สมุด Balance Petrol (หน้าลาน)
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">
              แสดงข้อมูลแบบตาราง และกรองข้อมูลได้จากหัวคอลัมน์ (วันที่/หัวจ่าย/ประเภทผลิตภัณฑ์)
            </p>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl">
              <TrendingUp className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">รับสะสม</p>
              <p className="text-2xl font-black text-gray-900 dark:text-white">
                {numberFormatter.format(totalReceive)}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-2xl">
              <TrendingDown className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">จ่ายสะสม</p>
              <p className="text-2xl font-black text-gray-900 dark:text-white">
                {numberFormatter.format(totalPay)}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl">
              <Droplet className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">คงเหลือล่าสุด</p>
              <p className="text-2xl font-black text-gray-900 dark:text-white">
                {numberFormatter.format(lastBalance)}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filter Bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 p-4 md:p-5 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm mb-6"
      >
        <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="ค้นหา: วันที่, รับ, จ่าย, คงเหลือ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 text-gray-800 dark:text-white transition-all duration-200"
            />
          </div>

          <div className="flex items-center gap-3">
            {isAnyFilterActive && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setColumnFilters({ date: "ทั้งหมด", pump: "ทั้งหมด", product: "ทั้งหมด" });
                  setActiveHeaderDropdown(null);
                }}
                className="px-5 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-2xl font-bold transition-all active:scale-95"
              >
                ล้างตัวกรอง
              </button>
            )}
            <div className="text-sm font-bold text-gray-500 dark:text-gray-400">
              แสดง {filteredRows.length} รายการ
            </div>
          </div>
        </div>
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              {/* แถวหัวข้อใหญ่ */}
              <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 text-[10px] uppercase tracking-widest font-black text-gray-400">
                <HeaderWithFilter
                  label="ด/ป/ว"
                  columnKey="date"
                  filterKey="date"
                  options={filterOptions.date}
                  rowSpan={2}
                />
                <HeaderWithFilter label="รับ" columnKey="receive" align="right" rowSpan={2} />
                <HeaderWithFilter label="จ่าย" columnKey="pay" align="right" rowSpan={2} />
                <HeaderWithFilter label="คงเหลือ" columnKey="balance" align="right" rowSpan={2} />
                <th
                  colSpan={pumpCodes.length}
                  className="py-2 px-3 text-center border-r border-gray-200 dark:border-gray-700 relative"
                >
                  <div className="flex items-center justify-center gap-2">
                    <span>ยอดขายตามจุดจ่าย (P18–P99)</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveHeaderDropdown(activeHeaderDropdown === "pump" ? null : "pump");
                      }}
                      className={`p-1 rounded-md transition-all ${
                        columnFilters.pump !== "ทั้งหมด"
                          ? "bg-emerald-500 text-white shadow-sm"
                          : "hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400"
                      }`}
                      aria-label="ตัวกรองหัวจ่าย"
                    >
                      <Filter className="w-3 h-3" />
                    </button>
                  </div>

                  <AnimatePresence>
                    {activeHeaderDropdown === "pump" && (
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
                          className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 z-20 py-1 overflow-hidden"
                        >
                          {filterOptions.pump.map((opt) => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => {
                                setColumnFilters((prev) => ({ ...prev, pump: opt as PumpCode | "ทั้งหมด" }));
                                setActiveHeaderDropdown(null);
                              }}
                              className={`w-full text-left px-4 py-2 text-xs font-bold transition-colors flex items-center justify-between ${
                                columnFilters.pump === opt
                                  ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400"
                                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                              }`}
                            >
                              {opt}
                              {columnFilters.pump === opt && <Check className="w-3 h-3" />}
                            </button>
                          ))}
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </th>
                <th
                  colSpan={4}
                  className="py-2 px-3 text-center relative"
                >
                  <div className="flex items-center justify-center gap-2">
                    <span>ประเภทผลิตภัณฑ์ / ราคาน้ำมันต่อลิตร / คงเหลือ</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveHeaderDropdown(activeHeaderDropdown === "product" ? null : "product");
                      }}
                      className={`p-1 rounded-md transition-all ${
                        columnFilters.product !== "ทั้งหมด"
                          ? "bg-emerald-500 text-white shadow-sm"
                          : "hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400"
                      }`}
                      aria-label="ตัวกรองประเภทผลิตภัณฑ์"
                    >
                      <Filter className="w-3 h-3" />
                    </button>
                  </div>

                  <AnimatePresence>
                    {activeHeaderDropdown === "product" && (
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
                          className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 z-20 py-1 overflow-hidden"
                        >
                          {filterOptions.product.map((opt) => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => {
                                setColumnFilters((prev) => ({ ...prev, product: opt as ProductCode | "ทั้งหมด" }));
                                setActiveHeaderDropdown(null);
                              }}
                              className={`w-full text-left px-4 py-2 text-xs font-bold transition-colors flex items-center justify-between ${
                                columnFilters.product === opt
                                  ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400"
                                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                              }`}
                            >
                              {opt}
                              {columnFilters.product === opt && <Check className="w-3 h-3" />}
                            </button>
                          ))}
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </th>
              </tr>
              {/* แถวหัวข้อย่อย */}
              <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 text-[10px] uppercase tracking-widest font-black text-gray-400">
                {pumpCodes.map((code, index) => (
                  <th
                    key={code}
                    className={`py-2 px-2 text-center font-semibold text-gray-600 dark:text-gray-300 ${index === 6
                      ? "border-l border-gray-300 dark:border-gray-600"
                      : ""
                      }`}
                  >
                    {code}
                  </th>
                ))}
                {(["D87", "B", "GSH95"] as ProductCode[]).map((code) => (
                  <th
                    key={code}
                    className="py-2 px-3 text-center font-semibold text-gray-600 dark:text-gray-300"
                  >
                    {code}
                    <div className="text-[10px] text-gray-500 dark:text-gray-400">
                      {productPrices[code].toFixed(2)} บาท/ลิตร
                    </div>
                  </th>
                ))}
                <th className="py-2 px-3 text-center font-semibold text-gray-600 dark:text-gray-300">
                  คงเหลือ
                  <div className="text-[10px] text-gray-500 dark:text-gray-400">บาท</div>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row, rowIndex) => (
                <motion.tr
                  key={row.date}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: rowIndex * 0.05 }}
                  className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900/40"
                >
                  {/* ด/ป/ว */}
                  <td className="py-2 px-3 text-left font-semibold text-gray-800 dark:text-gray-100 border-r border-gray-200 dark:border-gray-700">
                    {row.date}
                  </td>
                  {/* รับ */}
                  <td className="py-2 px-3 text-right text-gray-800 dark:text-gray-100">
                    {numberFormatter.format(row.receive)}
                  </td>
                  {/* จ่าย */}
                  <td className="py-2 px-3 text-right text-gray-800 dark:text-gray-100">
                    {numberFormatter.format(row.pay)}
                  </td>
                  {/* คงเหลือ */}
                  <td className="py-2 px-3 text-right text-gray-800 dark:text-gray-100 border-r border-gray-200 dark:border-gray-700">
                    {numberFormatter.format(row.balance)}
                  </td>
                  {/* ยอดหัวจ่าย P… */}
                  {pumpCodes.map((code, index) => {
                    const value = row.pumps[code];
                    return (
                      <td
                        key={code}
                        className={`py-2 px-2 text-right text-gray-700 dark:text-gray-200 ${index === 6
                          ? "border-l border-gray-300 dark:border-gray-600"
                          : ""
                          }`}
                      >
                        {value ? numberFormatter.format(value) : ""}
                      </td>
                    );
                  })}
                  {/* รวมตามประเภทผลิตภัณฑ์ */}
                  {(["D87", "B", "GSH95"] as ProductCode[]).map((code) => (
                    <td
                      key={code}
                      className="py-2 px-3 text-right text-gray-800 dark:text-gray-100"
                    >
                      {numberFormatter.format(row.products[code])}
                    </td>
                  ))}
                  {/* คงเหลือรวม (แสดงซ้ำเหมือนคอลัมน์คงเหลือด้านซ้าย เพื่อให้เหมือนคอลัมน์สุดท้ายในสมุดจริง) */}
                  <td className="py-2 px-3 text-right text-gray-800 dark:text-gray-100">
                    {numberFormatter.format(row.balance)}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
