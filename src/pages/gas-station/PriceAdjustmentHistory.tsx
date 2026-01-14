import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useBranch } from "@/contexts/BranchContext";
import {
  isAllNavbarBranchesSelected,
  isInSelectedNavbarBranches,
  selectedBranchNameSetFromNavbarIds,
} from "@/utils/branchFilter";
import {
  History,
  Filter,
  Search,
  ChevronLeft,
  Check,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Eye,
  X,
  Fuel,
} from "lucide-react";
import {
  loadPriceAdjustmentHistory,
  PriceAdjustmentHistoryEntry,
} from "@/utils/priceAdjustmentHistory";

const currencyFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

// Mock data (ใช้แสดงผลเมื่อยังไม่มีข้อมูลจริงใน localStorage)
const mockHistoryData: PriceAdjustmentHistoryEntry[] = [
  {
    id: "PAH-MOCK-001",
    branch: "ปั๊มไฮโซ",
    appliedAtISO: "2024-12-15T05:02:00.000Z",
    appliedBy: "พนักงาน A",
    source: "ไฟล์ ปตท.",
    changes: [
      {
        oilTypeCode: "DIESEL",
        oilTypeName: "Diesel",
        oldPrice: 31.29,
        newPrice: 31.79,
        effectiveDate: "2024-12-15",
        effectiveTime: "05:00",
      },
      {
        oilTypeCode: "GASOHOL_95",
        oilTypeName: "Gasohol 95",
        oldPrice: 35.45,
        newPrice: 35.95,
        effectiveDate: "2024-12-15",
        effectiveTime: "05:00",
      },
    ],
  },
  {
    id: "PAH-MOCK-002",
    branch: "ดินดำ",
    appliedAtISO: "2024-12-14T16:30:00.000Z",
    appliedBy: "ผู้จัดการสถานี",
    source: "กรอกมือ",
    changes: [
      {
        oilTypeCode: "E20",
        oilTypeName: "E20",
        oldPrice: 32.75,
        newPrice: 32.45,
        effectiveDate: "2024-12-15",
        effectiveTime: "05:00",
      },
      {
        oilTypeCode: "E85",
        oilTypeName: "E85",
        oldPrice: 27.30,
        newPrice: 27.10,
        effectiveDate: "2024-12-15",
        effectiveTime: "05:00",
      },
      {
        oilTypeCode: "PREMIUM_DIESEL",
        oilTypeName: "Premium Diesel",
        oldPrice: 34.59,
        newPrice: 34.99,
        effectiveDate: "2024-12-15",
        effectiveTime: "05:00",
      },
    ],
  },
  {
    id: "PAH-MOCK-003",
    branch: "บายพาส",
    appliedAtISO: "2024-12-13T11:15:00.000Z",
    appliedBy: "ระบบ",
    source: "API",
    changes: [
      {
        oilTypeCode: "GASOHOL_91",
        oilTypeName: "Gasohol 91",
        oldPrice: 34.98,
        newPrice: 34.68,
        effectiveDate: "2024-12-14",
        effectiveTime: "05:00",
      },
    ],
  },
];

function formatTHDateTime(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d
    .toLocaleString("th-TH", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
    .replace(",", "");
}

export default function PriceAdjustmentHistory() {
  const navigate = useNavigate();
  const { selectedBranches } = useBranch();
  const selectedNavbarBranchSet = useMemo(
    () => selectedBranchNameSetFromNavbarIds(selectedBranches),
    [selectedBranches]
  );

  const historyItems = useMemo(() => {
    const stored = loadPriceAdjustmentHistory();
    return stored.length > 0 ? stored : mockHistoryData;
  }, []);

  const [searchTerm, setSearchTerm] = useState("");
  const [columnFilters, setColumnFilters] = useState<{
    appliedDate: string;
    branch: string;
    appliedBy: string;
  }>({
    appliedDate: "ทั้งหมด",
    branch: "ทั้งหมด",
    appliedBy: "ทั้งหมด",
  });

  type FilterKey = "appliedDate" | "branch" | "appliedBy";
  type SortKey = "appliedAtISO" | "branch" | "appliedBy" | "changedCount";

  const [activeHeaderDropdown, setActiveHeaderDropdown] = useState<FilterKey | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: "asc" | "desc" | null }>({
    key: "appliedAtISO",
    direction: "desc",
  });

  const filterOptions = useMemo(() => {
    const appliedDates = Array.from(
      new Set(historyItems.map((h) => (h.appliedAtISO || "").split("T")[0]).filter(Boolean))
    ).sort((a, b) => b.localeCompare(a));

    const branches = Array.from(new Set(historyItems.map((h) => h.branch))).sort((a, b) => a.localeCompare(b));
    const appliedBy = Array.from(new Set(historyItems.map((h) => h.appliedBy))).sort((a, b) => a.localeCompare(b));

    return {
      appliedDate: ["ทั้งหมด", ...appliedDates],
      branch: ["ทั้งหมด", ...branches],
      appliedBy: ["ทั้งหมด", ...appliedBy],
    };
  }, [historyItems]);

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

  const filteredHistory = useMemo(() => {
    let result = historyItems.filter((item) => {
      const term = searchTerm.toLowerCase();

      const matchesNavbarBranch = isAllNavbarBranchesSelected(selectedBranches)
        ? true
        : selectedBranches.length === 0
          ? false
          : isInSelectedNavbarBranches(item.branch, selectedNavbarBranchSet);

      const appliedDate = (item.appliedAtISO || "").split("T")[0];
      const changedCount = (item.changes || []).length;

      const matchesSearch =
        item.branch.toLowerCase().includes(term) ||
        item.appliedBy.toLowerCase().includes(term) ||
        appliedDate.toLowerCase().includes(term) ||
        String(changedCount).includes(term) ||
        (item.changes || []).some(
          (c) => c.oilTypeCode.toLowerCase().includes(term) || c.oilTypeName.toLowerCase().includes(term)
        );

      const matchesAppliedDate = columnFilters.appliedDate === "ทั้งหมด" || appliedDate === columnFilters.appliedDate;
      const matchesBranch = columnFilters.branch === "ทั้งหมด" || item.branch === columnFilters.branch;
      const matchesAppliedBy = columnFilters.appliedBy === "ทั้งหมด" || item.appliedBy === columnFilters.appliedBy;

      return matchesNavbarBranch && matchesSearch && matchesAppliedDate && matchesBranch && matchesAppliedBy;
    });

    if (sortConfig.key && sortConfig.direction) {
      result = [...result].sort((a, b) => {
        const dir = sortConfig.direction === "asc" ? 1 : -1;

        const compare = (x: string | number, y: string | number) => {
          if (x < y) return -1 * dir;
          if (x > y) return 1 * dir;
          return 0;
        };

        const aCount = (a.changes || []).length;
        const bCount = (b.changes || []).length;

        switch (sortConfig.key) {
          case "appliedAtISO":
            return compare(new Date(a.appliedAtISO).getTime(), new Date(b.appliedAtISO).getTime());
          case "branch":
            return compare(a.branch, b.branch);
          case "appliedBy":
            return compare(a.appliedBy, b.appliedBy);
          case "changedCount":
            return compare(aCount, bCount);
        }
      });
    }

    return result;
  }, [historyItems, searchTerm, columnFilters, sortConfig, selectedBranches, selectedNavbarBranchSet]);

  const summary = useMemo(() => {
    const total = filteredHistory.length;
    const totalChanges = filteredHistory.reduce((sum, h) => sum + (h.changes || []).length, 0);
    const uniqueDates = new Set(filteredHistory.map((h) => (h.appliedAtISO || "").split("T")[0])).size;
    return { total, totalChanges, uniqueDates };
  }, [filteredHistory]);

  const [viewEntry, setViewEntry] = useState<PriceAdjustmentHistoryEntry | null>(null);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      {/* Header */}
      <header className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
              <div className="p-2 bg-emerald-500 rounded-2xl shadow-lg shadow-emerald-500/20">
                <History className="w-8 h-8 text-white" />
              </div>
              ประวัติการปรับราคาน้ำมัน
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">
              เก็บจากการกด “ยืนยันใช้ราคาใหม่” ในหน้า ปรับราคาน้ำมัน และสามารถกรองข้อมูลได้จากหัวคอลัมน์
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/app/gas-station/price-adjustment")}
              className="px-5 py-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-2xl font-bold border border-gray-100 dark:border-gray-700 shadow-sm transition-all active:scale-95 flex items-center gap-2"
            >
              <ChevronLeft className="w-5 h-5" />
              กลับไปหน้าปรับราคา
            </button>
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
              <History className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">ครั้งที่ปรับ</p>
              <p className="text-2xl font-black text-gray-900 dark:text-white">{summary.total}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl">
              <Fuel className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">รายการที่เปลี่ยน</p>
              <p className="text-2xl font-black text-gray-900 dark:text-white">{summary.totalChanges}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl">
              <Filter className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">จำนวนวัน</p>
              <p className="text-2xl font-black text-gray-900 dark:text-white">{summary.uniqueDates} วัน</p>
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
              placeholder="ค้นหา: วันที่, สาขา, ผู้ยืนยัน, ประเภทน้ำมัน..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 text-gray-800 dark:text-white transition-all duration-200"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                setColumnFilters({ appliedDate: "ทั้งหมด", branch: "ทั้งหมด", appliedBy: "ทั้งหมด" });
                setActiveHeaderDropdown(null);
              }}
              className="px-5 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-2xl font-bold transition-all active:scale-95"
            >
              ล้างตัวกรอง
            </button>
            <div className="text-sm font-bold text-gray-500 dark:text-gray-400">
              แสดง {filteredHistory.length} รายการ
            </div>
          </div>
        </div>
      </motion.div>

      {/* Table */}
      {filteredHistory.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm p-12 text-center"
        >
          <History className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 text-lg font-bold">ยังไม่มีประวัติการปรับราคา</p>
          <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">
            ไปที่หน้า “ปรับราคาน้ำมัน” แล้วกด “ยืนยันใช้ราคาใหม่” เพื่อสร้างรายการประวัติ
          </p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <HeaderWithFilter label="วันที่/เวลา" columnKey="appliedAtISO" filterKey="appliedDate" options={filterOptions.appliedDate} />
                  <HeaderWithFilter label="สาขา" columnKey="branch" filterKey="branch" options={filterOptions.branch} />
                  <HeaderWithFilter label="รายการที่เปลี่ยน" columnKey="changedCount" align="right" />
                  <HeaderWithFilter label="ผู้ยืนยัน" columnKey="appliedBy" filterKey="appliedBy" options={filterOptions.appliedBy} />
                  <th className="px-6 py-4 text-center">ดูรายละเอียด</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.map((item, index) => (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.25, delay: index * 0.02 }}
                    className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-bold text-gray-800 dark:text-white whitespace-nowrap">
                      {formatTHDateTime(item.appliedAtISO)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">
                      {item.branch}
                    </td>
                    <td className="px-6 py-4 text-sm text-right font-black text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                      {(item.changes || []).length} รายการ
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">
                      {item.appliedBy}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        type="button"
                        onClick={() => setViewEntry(item)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-100 dark:border-gray-700 font-bold transition-all active:scale-95"
                      >
                        <Eye className="w-4 h-4" />
                        ดู
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Detail Modal */}
      <AnimatePresence>
        {viewEntry && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setViewEntry(null)}
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
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-emerald-500 rounded-2xl shadow-lg shadow-emerald-500/20">
                      <Eye className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-gray-900 dark:text-white">รายละเอียดการปรับราคา</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                        {formatTHDateTime(viewEntry.appliedAtISO)} • {viewEntry.branch} • {viewEntry.appliedBy}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setViewEntry(null)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all duration-200 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:scale-110 active:scale-95"
                    aria-label="ปิด"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-6 bg-gray-50 dark:bg-gray-900/50">
                  <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                      <p className="font-black text-gray-900 dark:text-white">
                        รายการที่เปลี่ยนแปลง ({(viewEntry.changes || []).length} รายการ)
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        แสดงราคาเดิม → ราคาใหม่ และวัน/เวลาที่เริ่มมีผล
                      </p>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gray-50/50 dark:bg-gray-900/50 text-[10px] uppercase tracking-widest font-black text-gray-400">
                            <th className="px-6 py-4 text-left">ประเภทน้ำมัน</th>
                            <th className="px-6 py-4 text-right">ราคาเดิม</th>
                            <th className="px-6 py-4 text-right">ราคาใหม่</th>
                            <th className="px-6 py-4 text-left">วัน/เวลามีผล</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(viewEntry.changes || []).map((c, idx) => (
                            <tr
                              key={`${c.oilTypeCode}-${idx}`}
                              className={`border-b border-gray-200 dark:border-gray-700 ${
                                idx % 2 === 0 ? "bg-white dark:bg-gray-800" : "bg-gray-50/50 dark:bg-gray-900/30"
                              }`}
                            >
                              <td className="px-6 py-4">
                                <p className="font-black text-gray-900 dark:text-white">{c.oilTypeName}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{c.oilTypeCode}</p>
                              </td>
                              <td className="px-6 py-4 text-right text-sm font-bold text-gray-700 dark:text-gray-200">
                                {currencyFormatter.format(c.oldPrice)}
                              </td>
                              <td className="px-6 py-4 text-right text-sm font-black text-emerald-600 dark:text-emerald-400">
                                {currencyFormatter.format(c.newPrice)}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                                <span className="font-bold">{c.effectiveDate}</span> <span className="font-medium">{c.effectiveTime}</span>
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

