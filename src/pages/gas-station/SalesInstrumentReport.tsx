import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import {
  FileText,
  Download,
  Calendar,
  Search,
  Printer,
  Filter,
  Check,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
} from "lucide-react";

const numberFormatter = new Intl.NumberFormat("th-TH", {
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
});

const currencyFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 2,
});

type SalesInstrumentType = {
  id: number;
  type: string;
  transactionCount: number;
  amount: number;
};

// Mock data ตามรูปภาพ
const mockSalesInstruments: SalesInstrumentType[] = [
  { id: 1, type: "เงินสด", transactionCount: 627, amount: 275755.53 },
  { id: 2, type: "Master", transactionCount: 11, amount: 10076.15 },
  { id: 3, type: "VISA", transactionCount: 12, amount: 10897.49 },
  { id: 4, type: "KBANK-CARD", transactionCount: 3, amount: 2870.15 },
  { id: 5, type: "PTT Privilege", transactionCount: 2, amount: 1484.72 },
  { id: 6, type: "Energy Card", transactionCount: 17, amount: 11553.1 },
  { id: 7, type: "Synergy Card", transactionCount: 2, amount: 3430.0 },
  { id: 8, type: "Fleet Card", transactionCount: 12, amount: 16594.5 },
  { id: 9, type: "ลูกค้าเงินเชื่อ", transactionCount: 8, amount: 12707.2 },
  { id: 10, type: "Top up Card ttb", transactionCount: 1, amount: 360.0 },
  { id: 11, type: "Fill&Go+", transactionCount: 1, amount: 1900.0 },
  { id: 12, type: "BBL Fleet Card", transactionCount: 2, amount: 2000.0 },
  { id: 13, type: "Visa Local Card", transactionCount: 5, amount: 2334.13 },
  { id: 14, type: "QR| KPLUS", transactionCount: 70, amount: 31756.56 },
  { id: 15, type: "QR| PROMPTPAY", transactionCount: 169, amount: 86371.07 },
  { id: 16, type: "คูปองของสถานี", transactionCount: 1, amount: 100.0 },
];

// ฟังก์ชันสร้างวันที่ไทย
const getCurrentThaiDate = () => {
  const now = new Date();
  const day = now.getDate();
  const month = now.getMonth() + 1;
  const year = now.getFullYear() + 543; // แปลงเป็น พ.ศ.
  return `${day}/${month}/${year}`;
};

export default function SalesInstrumentReport() {
  const [startDate, setStartDate] = useState(getCurrentThaiDate());
  const [endDate, setEndDate] = useState(getCurrentThaiDate());
  const [searchTerm, setSearchTerm] = useState("");

  const instruments = useMemo(() => mockSalesInstruments, []);

  const [columnFilters, setColumnFilters] = useState<{ type: string }>(() => ({ type: "ทั้งหมด" }));
  type FilterKey = "type";
  type SortKey = "type" | "transactionCount" | "amount";
  const [activeHeaderDropdown, setActiveHeaderDropdown] = useState<FilterKey | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: "asc" | "desc" | null }>({
    key: "amount",
    direction: "desc",
  });

  const filterOptions = useMemo(() => {
    const types = ["ทั้งหมด", ...Array.from(new Set(instruments.map((i) => i.type)))];
    return { types };
  }, [instruments]);

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

  const filteredInstruments = useMemo(() => {
    let result = instruments.filter((item) => {
      const term = searchTerm.trim().toLowerCase();
      const matchesSearch = term === "" || item.type.toLowerCase().includes(term);
      const matchesType = columnFilters.type === "ทั้งหมด" || item.type === columnFilters.type;
      return matchesSearch && matchesType;
    });

    if (sortConfig.key && sortConfig.direction) {
      const dir = sortConfig.direction === "asc" ? 1 : -1;
      result = [...result].sort((a, b) => {
        switch (sortConfig.key) {
          case "type":
            return a.type.localeCompare(b.type) * dir;
          case "transactionCount":
            return (a.transactionCount - b.transactionCount) * dir;
          case "amount":
            return (a.amount - b.amount) * dir;
        }
      });
    }

    return result;
  }, [instruments, searchTerm, columnFilters, sortConfig]);

  const totalAmount = filteredInstruments.reduce((sum, item) => sum + item.amount, 0);
  const totalTransactions = filteredInstruments.reduce((sum, item) => sum + item.transactionCount, 0);

  const isAnyFilterActive = useMemo(() => {
    return searchTerm.trim() !== "" || columnFilters.type !== "ทั้งหมด";
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

    const current = filterKey ? columnFilters.type : "ทั้งหมด";

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
                      className="absolute left-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 z-20 py-1 overflow-hidden"
                    >
                      {options.map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => {
                            setColumnFilters({ type: opt });
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

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    // ในอนาคตจะ export เป็น Excel หรือ PDF
    alert("กำลังส่งออกข้อมูล...");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      {/* Header */}
      <header className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
              <div className="p-2 bg-emerald-500 rounded-2xl shadow-lg shadow-emerald-500/20">
                <FileText className="w-8 h-8 text-white" />
              </div>
              รายงานตราสารยอดขาย
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">
              ตารางสรุปยอดขายแยกตามประเภทตราสาร (วิธีการชำระเงิน)
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handlePrint}
              className="px-5 py-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-2xl font-bold border border-gray-100 dark:border-gray-700 shadow-sm transition-all active:scale-95 flex items-center gap-2"
            >
              <Printer className="w-5 h-5" />
              พิมพ์
            </button>
            <button
              type="button"
              onClick={handleExport}
              className="px-5 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-bold shadow-lg shadow-emerald-500/20 transition-all active:scale-95 flex items-center gap-2"
            >
              <Download className="w-5 h-5" />
              ส่งออก
            </button>
          </div>
        </div>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl">
              <FileText className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">จำนวนรายการ</p>
              <p className="text-2xl font-black text-gray-900 dark:text-white">
                {filteredInstruments.length}
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
              <Printer className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">จำนวนฉบับรวม</p>
              <p className="text-2xl font-black text-gray-900 dark:text-white">
                {numberFormatter.format(totalTransactions)}
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
              <Download className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">ยอดรวม</p>
              <p className="text-2xl font-black text-gray-900 dark:text-white">
                {currencyFormatter.format(totalAmount)}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filter Bar (match tank-entry-book style) */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 p-4 md:p-5 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm mb-6"
      >
        <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
          <div className="flex flex-col md:flex-row gap-3 flex-1">
            <div className="flex items-center gap-2 flex-1">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div className="flex-1">
                <label htmlFor="sir-start" className="text-xs font-bold text-gray-500 dark:text-gray-400">
                  เริ่มต้น
                </label>
                <input
                  id="sir-start"
                  type="text"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  placeholder="ด/ป/ว"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 text-gray-800 dark:text-white transition-all duration-200"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 flex-1">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div className="flex-1">
                <label htmlFor="sir-end" className="text-xs font-bold text-gray-500 dark:text-gray-400">
                  จนถึง
                </label>
                <input
                  id="sir-end"
                  type="text"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  placeholder="ด/ป/ว"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 text-gray-800 dark:text-white transition-all duration-200"
                />
              </div>
            </div>

            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ค้นหาประเภทตราสาร..."
                className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 text-gray-800 dark:text-white transition-all duration-200"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isAnyFilterActive && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setColumnFilters({ type: "ทั้งหมด" });
                  setActiveHeaderDropdown(null);
                }}
                className="px-5 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-2xl font-bold transition-all active:scale-95"
              >
                ล้างตัวกรอง
              </button>
            )}
            <div className="text-sm font-bold text-gray-500 dark:text-gray-400">
              แสดง {filteredInstruments.length} รายการ
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
                <th className="px-6 py-4 text-center w-24">ลำดับ</th>
                <HeaderWithFilter
                  label="ประเภทตราสาร"
                  columnKey="type"
                  filterKey="type"
                  options={filterOptions.types}
                />
                <HeaderWithFilter label="จำนวนฉบับ" columnKey="transactionCount" align="right" />
                <HeaderWithFilter label="จำนวนเงิน" columnKey="amount" align="right" />
              </tr>
            </thead>
            <tbody>
              {filteredInstruments.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-gray-400">
                    ไม่พบข้อมูลที่ตรงกับเงื่อนไข
                  </td>
                </tr>
              ) : (
                filteredInstruments.map((item, index) => (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.25, delay: index * 0.02 }}
                    className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors"
                  >
                    <td className="px-6 py-4 text-center text-gray-600 dark:text-gray-400">
                      {item.id}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-800 dark:text-white">
                      {item.type}
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-gray-600 dark:text-gray-400">
                      {numberFormatter.format(item.transactionCount)}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-black text-emerald-600 dark:text-emerald-400">
                      {currencyFormatter.format(item.amount)}
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
            <tfoot>
              <tr className="border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50">
                <td colSpan={2} className="px-6 py-4 text-right font-bold text-gray-800 dark:text-white">
                  รวม
                </td>
                <td className="px-6 py-4 text-right font-bold text-gray-800 dark:text-white">
                  {numberFormatter.format(totalTransactions)}
                </td>
                <td className="px-6 py-4 text-right font-black text-gray-800 dark:text-white">
                  {currencyFormatter.format(totalAmount)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </motion.div>
    </div>
  );
}

