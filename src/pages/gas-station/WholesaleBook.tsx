import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import {
  FileCheck,
  Search,
  Filter,
  DollarSign,
  Droplet,
  TrendingUp,
  ShoppingCart,
  Eye,
  X,
  Check,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
} from "lucide-react";

const numberFormatter = new Intl.NumberFormat("th-TH", {
  maximumFractionDigits: 0,
});

const currencyFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 0,
});

type LedgerEntry = {
  id: string;
  date: string;
  hsdPurchase: number; // ลิตร
  dieselPurchase: number; // ลิตร
  lpgPurchase: number; // ลิตร
  wholesaleSales: number; // บาท
  retailSales: number; // บาท
  totalSales: number; // บาท
  remarks: string;
};

// Mock data - สมุดบัญชีขายส่งขายปลีก
const mockLedgerData: LedgerEntry[] = [
  {
    id: "WB-20241201",
    date: "2024-12-01",
    hsdPurchase: 8000,
    dieselPurchase: 7000,
    lpgPurchase: 0,
    wholesaleSales: 8000,
    retailSales: 4000,
    totalSales: 12000,
    remarks: "ขายส่งปกติ",
  },
  {
    id: "WB-20241202",
    date: "2024-12-02",
    hsdPurchase: 8000,
    dieselPurchase: 0,
    lpgPurchase: 4000,
    wholesaleSales: 0,
    retailSales: 4000,
    totalSales: 4000,
    remarks: "",
  },
  {
    id: "WB-20241203",
    date: "2024-12-03",
    hsdPurchase: 8000,
    dieselPurchase: 0,
    lpgPurchase: 0,
    wholesaleSales: 0,
    retailSales: 4000,
    totalSales: 4000,
    remarks: "",
  },
  {
    id: "WB-20241204",
    date: "2024-12-04",
    hsdPurchase: 0,
    dieselPurchase: 0,
    lpgPurchase: 0,
    wholesaleSales: 0,
    retailSales: 0,
    totalSales: 0,
    remarks: "ปิดทำการ",
  },
  {
    id: "WB-20241205",
    date: "2024-12-05",
    hsdPurchase: 11000,
    dieselPurchase: 7000,
    lpgPurchase: 0,
    wholesaleSales: 0,
    retailSales: 4000,
    totalSales: 4000,
    remarks: "",
  },
  {
    id: "WB-20241206",
    date: "2024-12-06",
    hsdPurchase: 8000,
    dieselPurchase: 0,
    lpgPurchase: 0,
    wholesaleSales: 0,
    retailSales: 4000,
    totalSales: 4000,
    remarks: "",
  },
  {
    id: "WB-20241207",
    date: "2024-12-07",
    hsdPurchase: 8000,
    dieselPurchase: 0,
    lpgPurchase: 4000,
    wholesaleSales: 4000,
    retailSales: 0,
    totalSales: 4000,
    remarks: "ขายส่งพิเศษ",
  },
  {
    id: "WB-20241208",
    date: "2024-12-08",
    hsdPurchase: 8000,
    dieselPurchase: 4000,
    lpgPurchase: 5000,
    wholesaleSales: 0,
    retailSales: 4000,
    totalSales: 4000,
    remarks: "",
  },
  {
    id: "WB-20241209",
    date: "2024-12-09",
    hsdPurchase: 8000,
    dieselPurchase: 0,
    lpgPurchase: 0,
    wholesaleSales: 8000,
    retailSales: 0,
    totalSales: 8000,
    remarks: "ขายส่งเท่านั้น",
  },
  {
    id: "WB-20241210",
    date: "2024-12-10",
    hsdPurchase: 8000,
    dieselPurchase: 0,
    lpgPurchase: 4000,
    wholesaleSales: 0,
    retailSales: 4000,
    totalSales: 4000,
    remarks: "",
  },
  {
    id: "WB-20241211",
    date: "2024-12-11",
    hsdPurchase: 8000,
    dieselPurchase: 4000,
    lpgPurchase: 5000,
    wholesaleSales: 6000,
    retailSales: 8000,
    totalSales: 14000,
    remarks: "ยอดขายดี",
  },
  {
    id: "WB-20241212",
    date: "2024-12-12",
    hsdPurchase: 8000,
    dieselPurchase: 0,
    lpgPurchase: 0,
    wholesaleSales: 0,
    retailSales: 4000,
    totalSales: 4000,
    remarks: "",
  },
  {
    id: "WB-20241213",
    date: "2024-12-13",
    hsdPurchase: 8000,
    dieselPurchase: 0,
    lpgPurchase: 4000,
    wholesaleSales: 4000,
    retailSales: 0,
    totalSales: 4000,
    remarks: "",
  },
  {
    id: "WB-20241214",
    date: "2024-12-14",
    hsdPurchase: 8000,
    dieselPurchase: 1000,
    lpgPurchase: 5000,
    wholesaleSales: 0,
    retailSales: 4000,
    totalSales: 4000,
    remarks: "",
  },
  {
    id: "WB-20241215",
    date: "2024-12-15",
    hsdPurchase: 10000,
    dieselPurchase: 0,
    lpgPurchase: 0,
    wholesaleSales: 0,
    retailSales: 4000,
    totalSales: 4000,
    remarks: "",
  },
];

export default function WholesaleBook() {
  const [ledgerData] = useState<LedgerEntry[]>(mockLedgerData);
  const [selectedItem, setSelectedItem] = useState<LedgerEntry | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [columnFilters, setColumnFilters] = useState<{
    date: string;
    remarks: string;
  }>({ date: "ทั้งหมด", remarks: "ทั้งหมด" });

  type FilterKey = "date" | "remarks";
  type SortKey =
    | "date"
    | "hsdPurchase"
    | "dieselPurchase"
    | "lpgPurchase"
    | "wholesaleSales"
    | "retailSales"
    | "totalSales";

  const [activeHeaderDropdown, setActiveHeaderDropdown] = useState<FilterKey | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: "asc" | "desc" | null }>({
    key: "date",
    direction: "desc",
  });

  const filterOptions = useMemo(() => {
    const uniqueDates = ["ทั้งหมด", ...Array.from(new Set(ledgerData.map((d) => d.date)))].sort(
      (a, b) => b.localeCompare(a)
    );
    const uniqueRemarks = [
      "ทั้งหมด",
      "มีหมายเหตุ",
      "ไม่มีหมายเหตุ",
      ...Array.from(new Set(ledgerData.map((d) => d.remarks).filter((r) => r.trim() !== ""))),
    ];

    return { dates: uniqueDates, remarks: uniqueRemarks };
  }, [ledgerData]);

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

  const filteredLedger = useMemo(() => {
    let result = ledgerData.filter((item) => {
      const term = searchTerm.trim().toLowerCase();
      const matchesSearch =
        term === "" ||
        item.date.toLowerCase().includes(term) ||
        item.remarks.toLowerCase().includes(term);

      const matchesDate = columnFilters.date === "ทั้งหมด" || item.date === columnFilters.date;

      const matchesRemarks =
        columnFilters.remarks === "ทั้งหมด" ||
        (columnFilters.remarks === "มีหมายเหตุ" ? item.remarks.trim() !== "" : item.remarks.trim() === "") ||
        item.remarks === columnFilters.remarks;

      return matchesSearch && matchesDate && matchesRemarks;
    });

    if (sortConfig.key && sortConfig.direction) {
      const dir = sortConfig.direction === "asc" ? 1 : -1;
      result = [...result].sort((a, b) => {
        if (sortConfig.key === "date") return a.date.localeCompare(b.date) * dir;
        return ((a[sortConfig.key] as number) - (b[sortConfig.key] as number)) * dir;
      });
    }

    return result;
  }, [ledgerData, searchTerm, columnFilters, sortConfig]);

  const summary = useMemo(() => {
    return {
      totalEntries: filteredLedger.length,
      totalHsdPurchase: filteredLedger.reduce((sum, item) => sum + item.hsdPurchase, 0),
      totalDieselPurchase: filteredLedger.reduce((sum, item) => sum + item.dieselPurchase, 0),
      totalLpgPurchase: filteredLedger.reduce((sum, item) => sum + item.lpgPurchase, 0),
      totalWholesaleSales: filteredLedger.reduce((sum, item) => sum + item.wholesaleSales, 0),
      totalRetailSales: filteredLedger.reduce((sum, item) => sum + item.retailSales, 0),
      totalSales: filteredLedger.reduce((sum, item) => sum + item.totalSales, 0),
    };
  }, [filteredLedger]);

  const isAnyFilterActive = useMemo(() => {
    return (
      searchTerm.trim() !== "" ||
      columnFilters.date !== "ทั้งหมด" ||
      columnFilters.remarks !== "ทั้งหมด"
    );
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

    const getFilterValue = (key: FilterKey) => {
      if (key === "date") return columnFilters.date;
      return columnFilters.remarks;
    };

    const setFilterValue = (key: FilterKey, value: string) => {
      if (key === "date") return setColumnFilters((prev) => ({ ...prev, date: value }));
      return setColumnFilters((prev) => ({ ...prev, remarks: value }));
    };

    const current = filterKey ? getFilterValue(filterKey) : "ทั้งหมด";

    return (
      <th className={`px-6 py-4 relative ${align === "right" ? "text-right" : align === "center" ? "text-center" : ""}`}>
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
                  current !== "ทั้งหมด"
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
                            current === opt
                              ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400"
                              : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                          }`}
                        >
                          {opt}
                          {current === opt && <Check className="w-3 h-3" />}
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
                <FileCheck className="w-8 h-8 text-white" />
              </div>
              สมุดขายส่งขายปลีก (Wholesale Book)
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">
              แสดงข้อมูลเป็นตาราง และกรองข้อมูลได้ที่หัวคอลัมน์
            </p>
          </div>
        </div>
      </header>

      {/* Stats (match TankEntryBook style) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl">
              <ShoppingCart className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">ขายส่งรวม</p>
              <p className="text-2xl font-black text-gray-900 dark:text-white">
                {currencyFormatter.format(summary.totalWholesaleSales)}
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
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl">
              <TrendingUp className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">ขายปลีกรวม</p>
              <p className="text-2xl font-black text-gray-900 dark:text-white">
                {currencyFormatter.format(summary.totalRetailSales)}
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
              <DollarSign className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">ยอดขายรวม</p>
              <p className="text-2xl font-black text-gray-900 dark:text-white">
                {currencyFormatter.format(summary.totalSales)}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filter Bar (match TankEntryBook style) */}
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
              placeholder="ค้นหา: วันที่ หรือหมายเหตุ..."
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
                  setColumnFilters({ date: "ทั้งหมด", remarks: "ทั้งหมด" });
                  setActiveHeaderDropdown(null);
                }}
                className="px-5 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-2xl font-bold transition-all active:scale-95"
              >
                ล้างตัวกรอง
              </button>
            )}
            <div className="text-sm font-bold text-gray-500 dark:text-gray-400">
              แสดง {filteredLedger.length} รายการ
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
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <HeaderWithFilter
                  label="วันที่"
                  columnKey="date"
                  filterKey="date"
                  options={filterOptions.dates}
                />
                <HeaderWithFilter label="HSD ซื้อ (ลิตร)" columnKey="hsdPurchase" align="right" />
                <HeaderWithFilter label="ดีเซล ซื้อ (ลิตร)" columnKey="dieselPurchase" align="right" />
                <HeaderWithFilter label="LPG ซื้อ (ลิตร)" columnKey="lpgPurchase" align="right" />
                <HeaderWithFilter label="ขายส่ง (บาท)" columnKey="wholesaleSales" align="right" />
                <HeaderWithFilter label="ขายปลีก (บาท)" columnKey="retailSales" align="right" />
                <HeaderWithFilter label="รวมยอดขาย (บาท)" columnKey="totalSales" align="right" />
                <HeaderWithFilter
                  label="หมายเหตุ"
                  filterKey="remarks"
                  options={filterOptions.remarks}
                />
                <th className="px-6 py-4 text-center">ดู</th>
              </tr>
            </thead>
            <tbody>
              {filteredLedger.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-gray-400">
                    ไม่พบข้อมูลที่ตรงกับเงื่อนไข
                  </td>
                </tr>
              )}
              {filteredLedger.map((item, index) => (
                <motion.tr
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.25, delay: index * 0.02 }}
                  className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors"
                >
                  <td className="px-6 py-4 text-sm font-semibold text-gray-800 dark:text-white whitespace-nowrap">
                    {item.date}
                  </td>
                  <td className="px-6 py-4 text-sm text-right text-gray-600 dark:text-gray-400 whitespace-nowrap">
                    {item.hsdPurchase > 0 ? numberFormatter.format(item.hsdPurchase) : "-"}
                  </td>
                  <td className="px-6 py-4 text-sm text-right text-gray-600 dark:text-gray-400 whitespace-nowrap">
                    {item.dieselPurchase > 0 ? numberFormatter.format(item.dieselPurchase) : "-"}
                  </td>
                  <td className="px-6 py-4 text-sm text-right text-gray-600 dark:text-gray-400 whitespace-nowrap">
                    {item.lpgPurchase > 0 ? numberFormatter.format(item.lpgPurchase) : "-"}
                  </td>
                  <td className="px-6 py-4 text-sm text-right font-semibold text-gray-800 dark:text-white whitespace-nowrap">
                    {item.wholesaleSales > 0 ? currencyFormatter.format(item.wholesaleSales) : "-"}
                  </td>
                  <td className="px-6 py-4 text-sm text-right font-semibold text-gray-800 dark:text-white whitespace-nowrap">
                    {item.retailSales > 0 ? currencyFormatter.format(item.retailSales) : "-"}
                  </td>
                  <td className="px-6 py-4 text-sm text-right font-black text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                    {item.totalSales > 0 ? currencyFormatter.format(item.totalSales) : "-"}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {item.remarks || "-"}
                  </td>
                  <td className="px-6 py-4 text-center whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => setSelectedItem(item)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                      aria-label="ดูรายละเอียด"
                    >
                      <Eye className="w-4 h-4 text-gray-400 hover:text-emerald-500" />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedItem && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedItem(null)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between rounded-t-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center">
                      <FileCheck className="w-6 h-6 text-amber-500" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-800 dark:text-white">รายละเอียดรายการ</h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{selectedItem.date}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedItem(null)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                {/* Modal Content */}
                <div className="p-6 space-y-6">
                  {/* Purchase Information */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-3 mb-4">
                      <Droplet className="w-6 h-6 text-blue-500" />
                      <h3 className="text-lg font-bold text-gray-800 dark:text-white">ข้อมูลการซื้อน้ำมัน</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">HSD ซื้อ</p>
                        <p className="text-lg font-bold text-gray-800 dark:text-white">
                          {numberFormatter.format(selectedItem.hsdPurchase)} ลิตร
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">ดีเซล ซื้อ</p>
                        <p className="text-lg font-bold text-gray-800 dark:text-white">
                          {numberFormatter.format(selectedItem.dieselPurchase)} ลิตร
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">LPG ซื้อ</p>
                        <p className="text-lg font-bold text-gray-800 dark:text-white">
                          {numberFormatter.format(selectedItem.lpgPurchase)} ลิตร
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Sales Information */}
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
                    <div className="flex items-center gap-3 mb-4">
                      <DollarSign className="w-6 h-6 text-purple-500" />
                      <h3 className="text-lg font-bold text-gray-800 dark:text-white">ข้อมูลยอดขาย</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2 border-b border-purple-200 dark:border-purple-800">
                        <span className="text-sm text-gray-600 dark:text-gray-400">ขายส่ง</span>
                        <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
                          {currencyFormatter.format(selectedItem.wholesaleSales)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-purple-200 dark:border-purple-800">
                        <span className="text-sm text-gray-600 dark:text-gray-400">ขายปลีก</span>
                        <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                          {currencyFormatter.format(selectedItem.retailSales)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-3 bg-white dark:bg-gray-800 rounded-lg px-4 mt-2">
                        <span className="text-base font-bold text-gray-800 dark:text-white">รวมยอดขาย</span>
                        <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                          {currencyFormatter.format(selectedItem.totalSales)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Remarks */}
                  {selectedItem.remarks && (
                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4">
                      <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">หมายเหตุ</h3>
                      <p className="text-base text-gray-800 dark:text-white">{selectedItem.remarks}</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
