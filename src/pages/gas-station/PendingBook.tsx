import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Plus,
  Trash2,
  Edit2,
  Calculator,
  FileText,
  Search,
  Filter,
  Check,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
} from "lucide-react";

// Interface for Ledger Entry
interface LedgerEntry {
  id: string;
  date: string; // "DD/MM/YY" e.g., "7/7/68"
  code: string; // e.g., "34", "59"
  product: string; // e.g., "HSD", "6SH91"
  breakdown: string; // e.g., "16000+8000+3000"
  price: number; // Unit price
}

// Mock Data based on the user's image
const initialData: LedgerEntry[] = [
  { id: "1", date: "7/7/68", code: "34", product: "HSD", breakdown: "16000+8000+3000+7000+8000+15000", price: 32.49 },
  { id: "2", date: "7/7/68", code: "59", product: "6SH91", breakdown: "3000+4000+4000", price: 33.03 },
  { id: "3", date: "7/7/68", code: "18", product: "6SH95", breakdown: "4000", price: 33.40 },
  { id: "4", date: "7/7/68", code: "83", product: "B 20", breakdown: "4000", price: 29.54 },
  { id: "5", date: "7/7/68", code: "91", product: "E 85", breakdown: "", price: 25.00 },
  { id: "6", date: "7/7/68", code: "75", product: "HSP", breakdown: "", price: 35.00 },
  { id: "7", date: "8/7/68", code: "34", product: "HSD", breakdown: "8000+15000+7000+8000", price: 32.49 },
  { id: "8", date: "8/7/68", code: "59", product: "6SH91", breakdown: "4000+4000", price: 33.03 },
];

export default function PendingBook() {
  const [entries, setEntries] = useState<LedgerEntry[]>(initialData);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [columnFilters, setColumnFilters] = useState<{ date: string; code: string; product: string }>({
    date: "ทั้งหมด",
    code: "ทั้งหมด",
    product: "ทั้งหมด",
  });

  type FilterKey = "date" | "code" | "product";
  type SortKey = "date" | "code" | "product" | "volume" | "price" | "amount";
  const [activeHeaderDropdown, setActiveHeaderDropdown] = useState<FilterKey | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: "asc" | "desc" | null }>({
    key: "date",
    direction: "desc",
  });

  // New Entry State
  const [newEntry, setNewEntry] = useState<Partial<LedgerEntry>>({
    date: "",
    code: "",
    product: "",
    breakdown: "",
    price: 0,
  });

  // Calculate sum from breakdown string (e.g., "1000+2000" -> 3000)
  const calculateVolume = (breakdown: string): number => {
    if (!breakdown) return 0;
    try {
      return breakdown
        .split("+")
        .map((val) => parseFloat(val.trim()) || 0)
        .reduce((acc, curr) => acc + curr, 0);
    } catch {
      return 0;
    }
  };

  // Safe number formatter
  const formatNumber = (num: number, decimals: number = 0) => {
    return new Intl.NumberFormat("th-TH", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(num);
  };

  // CRUD Operations
  const handleAdd = () => {
    if (!newEntry.date || !newEntry.code) return; // Basic validation
    const entry: LedgerEntry = {
      id: Date.now().toString(),
      date: newEntry.date || "",
      code: newEntry.code || "",
      product: newEntry.product || "",
      breakdown: newEntry.breakdown || "",
      price: newEntry.price || 0,
    };
    setEntries([...entries, entry]);
    setNewEntry({ date: entry.date, code: "", product: "", breakdown: "", price: 0 }); // Keep date for convenience
    setIsAdding(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("ต้องการลบรายการนี้ใช่หรือไม่?")) {
      setEntries(entries.filter((e) => e.id !== id));
    }
  };

  const handleEdit = (entry: LedgerEntry) => {
    setEditingId(entry.id);
    setNewEntry({ ...entry });
  };

  const handleSaveEdit = () => {
    if (!editingId) return;
    setEntries(
      entries.map((e) =>
        e.id === editingId
          ? { ...e, ...newEntry } as LedgerEntry
          : e
      )
    );
    setEditingId(null);
    setNewEntry({ date: "", code: "", product: "", breakdown: "", price: 0 });
  };

  const filterOptions = useMemo(() => {
    const dates = ["ทั้งหมด", ...Array.from(new Set(entries.map((e) => e.date)))];
    const codes = ["ทั้งหมด", ...Array.from(new Set(entries.map((e) => e.code)))];
    const products = ["ทั้งหมด", ...Array.from(new Set(entries.map((e) => e.product)))];
    return { dates, codes, products };
  }, [entries]);

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

  const isAnyFilterActive = useMemo(() => {
    return (
      searchTerm.trim() !== "" ||
      columnFilters.date !== "ทั้งหมด" ||
      columnFilters.code !== "ทั้งหมด" ||
      columnFilters.product !== "ทั้งหมด"
    );
  }, [searchTerm, columnFilters]);

  const filteredFlatEntries = useMemo(() => {
    let result = entries.filter((entry) => {
      const term = searchTerm.trim().toLowerCase();
      const volume = calculateVolume(entry.breakdown);
      const amount = volume * entry.price;

      const matchesSearch =
        term === "" ||
        entry.date.toLowerCase().includes(term) ||
        entry.code.toLowerCase().includes(term) ||
        entry.product.toLowerCase().includes(term) ||
        entry.breakdown.toLowerCase().includes(term) ||
        String(volume).includes(term) ||
        String(entry.price).includes(term) ||
        String(amount).includes(term);

      const matchesDate = columnFilters.date === "ทั้งหมด" || entry.date === columnFilters.date;
      const matchesCode = columnFilters.code === "ทั้งหมด" || entry.code === columnFilters.code;
      const matchesProduct = columnFilters.product === "ทั้งหมด" || entry.product === columnFilters.product;

      return matchesSearch && matchesDate && matchesCode && matchesProduct;
    });

    if (sortConfig.key && sortConfig.direction) {
      const dir = sortConfig.direction === "asc" ? 1 : -1;
      result = [...result].sort((a, b) => {
        const aVol = calculateVolume(a.breakdown);
        const bVol = calculateVolume(b.breakdown);
        const aAmt = aVol * a.price;
        const bAmt = bVol * b.price;

        switch (sortConfig.key) {
          case "date":
            return a.date.localeCompare(b.date) * dir;
          case "code":
            return a.code.localeCompare(b.code) * dir;
          case "product":
            return a.product.localeCompare(b.product) * dir;
          case "volume":
            return (aVol - bVol) * dir;
          case "price":
            return (a.price - b.price) * dir;
          case "amount":
            return (aAmt - bAmt) * dir;
        }
      });
    }

    return result;
  }, [entries, searchTerm, columnFilters, sortConfig]);

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
      if (key === "code") return columnFilters.code;
      return columnFilters.product;
    };

    const setFilterValue = (key: FilterKey, value: string) => {
      if (key === "date") return setColumnFilters((prev) => ({ ...prev, date: value }));
      if (key === "code") return setColumnFilters((prev) => ({ ...prev, code: value }));
      return setColumnFilters((prev) => ({ ...prev, product: value }));
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
                <FileText className="w-8 h-8 text-white" />
              </div>
              สมุดตั้งพัก (Pending Book)
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">
              แสดงข้อมูลเป็นตาราง พร้อมกรองข้อมูลได้ที่หัวคอลัมน์ (วันที่/เบอร์/สินค้า)
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsAdding(!isAdding)}
              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-bold shadow-lg shadow-emerald-500/20 transition-all active:scale-95 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              เพิ่มรายการ
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
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">รายการทั้งหมด</p>
              <p className="text-2xl font-black text-gray-900 dark:text-white">{filteredFlatEntries.length}</p>
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
              <Calculator className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">ปริมาณรวม</p>
              <p className="text-2xl font-black text-gray-900 dark:text-white">
                {formatNumber(filteredFlatEntries.reduce((sum, e) => sum + calculateVolume(e.breakdown), 0))}
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
              <FileText className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">มูลค่ารวม</p>
              <p className="text-2xl font-black text-gray-900 dark:text-white">
                {formatNumber(
                  filteredFlatEntries.reduce((sum, e) => sum + calculateVolume(e.breakdown) * e.price, 0),
                  2
                )}
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
              placeholder="ค้นหา: วันที่, เบอร์, สินค้า, รายการคำนวณ..."
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
                  setColumnFilters({ date: "ทั้งหมด", code: "ทั้งหมด", product: "ทั้งหมด" });
                  setActiveHeaderDropdown(null);
                }}
                className="px-5 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-2xl font-bold transition-all active:scale-95"
              >
                ล้างตัวกรอง
              </button>
            )}
            <div className="text-sm font-bold text-gray-500 dark:text-gray-400">
              แสดง {filteredFlatEntries.length} รายการ
            </div>
          </div>
        </div>
      </motion.div>

      {/* Add Entry Form */}
      <AnimatePresence>
        {(isAdding || editingId) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-blue-200 dark:border-blue-900 mb-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
                {editingId ? "แก้ไขรายการ" : "เพิ่มรายการใหม่"}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                <div className="space-y-1">
                  <label htmlFor="pending-date" className="text-xs font-medium text-gray-500">
                    วันที่ (ว/ด/ป)
                  </label>
                  <input
                    id="pending-date"
                    type="text"
                    placeholder="7/7/68"
                    value={newEntry.date}
                    onChange={(e) => setNewEntry({ ...newEntry, date: e.target.value })}
                    className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="pending-code" className="text-xs font-medium text-gray-500">
                    เบอร์
                  </label>
                  <input
                    id="pending-code"
                    type="text"
                    placeholder="34"
                    value={newEntry.code}
                    onChange={(e) => setNewEntry({ ...newEntry, code: e.target.value })}
                    className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="pending-product" className="text-xs font-medium text-gray-500">
                    สินค้า
                  </label>
                  <input
                    id="pending-product"
                    type="text"
                    placeholder="HSD"
                    value={newEntry.product}
                    onChange={(e) => setNewEntry({ ...newEntry, product: e.target.value })}
                    className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
                <div className="md:col-span-2 space-y-1">
                  <label htmlFor="pending-breakdown" className="text-xs font-medium text-gray-500">
                    รายการคำนวณ (ใช้เครื่องหมาย +)
                  </label>
                  <div className="relative">
                    <Calculator className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      id="pending-breakdown"
                      type="text"
                      placeholder="1000+2000+3000"
                      value={newEntry.breakdown}
                      onChange={(e) => setNewEntry({ ...newEntry, breakdown: e.target.value })}
                      className="w-full pl-9 p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 font-mono text-sm"
                    />
                  </div>
                  <div className="text-right text-xs text-blue-600 font-mono">
                    = {formatNumber(calculateVolume(newEntry.breakdown || ""))}
                  </div>
                </div>
                <div className="space-y-1">
                  <label htmlFor="pending-price" className="text-xs font-medium text-gray-500">
                    ราคา/หน่วย
                  </label>
                  <input
                    id="pending-price"
                    type="number"
                    value={newEntry.price}
                    onChange={(e) => setNewEntry({ ...newEntry, price: parseFloat(e.target.value) })}
                    className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 text-right"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => {
                    setIsAdding(false);
                    setEditingId(null);
                    setNewEntry({ date: "", code: "", product: "", breakdown: "", price: 0 });
                  }}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={editingId ? handleSaveEdit : handleAdd}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-500/30"
                >
                  {editingId ? "บันทึกการแก้ไข" : "เพิ่มรายการ"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px]">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <HeaderWithFilter
                  label="วันที่"
                  columnKey="date"
                  filterKey="date"
                  options={filterOptions.dates}
                />
                <HeaderWithFilter
                  label="เบอร์"
                  columnKey="code"
                  filterKey="code"
                  options={filterOptions.codes}
                  align="center"
                />
                <HeaderWithFilter
                  label="สินค้า"
                  columnKey="product"
                  filterKey="product"
                  options={filterOptions.products}
                />
                <th className="px-6 py-4 text-left">รายการคำนวณ</th>
                <HeaderWithFilter label="ปริมาณรวม" columnKey="volume" align="right" />
                <HeaderWithFilter label="ราคา" columnKey="price" align="right" />
                <HeaderWithFilter label="จำนวนเงิน" columnKey="amount" align="right" />
                <th className="px-6 py-4 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredFlatEntries.map((entry, rowIndex) => {
                const totalVol = calculateVolume(entry.breakdown);
                const totalAmount = totalVol * entry.price;
                return (
                  <motion.tr
                    key={entry.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.25, delay: rowIndex * 0.02 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-semibold text-gray-800 dark:text-white whitespace-nowrap">
                      {entry.date}
                    </td>
                    <td className="px-6 py-4 text-sm text-center text-gray-600 dark:text-gray-400 font-mono whitespace-nowrap">
                      {entry.code}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-800 dark:text-white whitespace-nowrap">
                      {entry.product}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 font-mono">
                      {entry.breakdown || "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-right font-bold text-gray-800 dark:text-white whitespace-nowrap">
                      {formatNumber(totalVol)}
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-gray-600 dark:text-gray-400 whitespace-nowrap">
                      {formatNumber(entry.price, 2)}
                    </td>
                    <td className="px-6 py-4 text-sm text-right font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                      {formatNumber(totalAmount, 2)}
                    </td>
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(entry)}
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-colors"
                          aria-label="แก้ไข"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(entry.id)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                          aria-label="ลบ"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}

              {filteredFlatEntries.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400">
                    <div className="flex flex-col items-center gap-3">
                      <FileText className="w-12 h-12 text-gray-300 dark:text-gray-600" />
                      <p>ไม่พบข้อมูลที่ตรงกับเงื่อนไข</p>
                      <button
                        onClick={() => setIsAdding(true)}
                        className="text-emerald-500 hover:text-emerald-600 text-sm font-bold"
                      >
                        เพิ่มรายการใหม่
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
