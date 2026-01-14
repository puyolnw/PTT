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
  Droplet,
  Check,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
} from "lucide-react";

const numberFormatter = new Intl.NumberFormat("th-TH", {
  maximumFractionDigits: 0,
});

type OilType =
  | "Premium Diesel"
  | "Premium Gasohol 95"
  | "Diesel"
  | "E85"
  | "E20"
  | "Gasohol 91"
  | "Gasohol 95";

type StockUpdateHistoryItem = {
  id: string;
  updateDate: string; // วันที่อัพเดต
  updateTime: string; // เวลาอัพเดต
  branch: string; // สาขา (รองรับการกรองจาก navbar)
  oilType: OilType;
  previousStock: number; // สต็อกก่อนอัพเดต
  usageAmount: number; // จำนวนที่ใช้ไป
  updatedStock: number; // สต็อกหลังอัพเดต
  updatedBy: string; // ผู้อัพเดต
};

// Mock data - ประวัติการอัพเดต
const mockHistoryData: StockUpdateHistoryItem[] = [
  {
    id: "HIS-001",
    updateDate: "2024-12-15",
    updateTime: "18:30",
    branch: "ปั๊มไฮโซ",
    oilType: "Premium Diesel",
    previousStock: 48000,
    usageAmount: 3000,
    updatedStock: 45000,
    updatedBy: "พนักงาน A",
  },
  {
    id: "HIS-002",
    updateDate: "2024-12-15",
    updateTime: "18:30",
    branch: "ปั๊มไฮโซ",
    oilType: "Premium Gasohol 95",
    previousStock: 41000,
    usageAmount: 3000,
    updatedStock: 38000,
    updatedBy: "พนักงาน A",
  },
  {
    id: "HIS-003",
    updateDate: "2024-12-15",
    updateTime: "18:30",
    branch: "ดินดำ",
    oilType: "Diesel",
    previousStock: 55000,
    usageAmount: 3000,
    updatedStock: 52000,
    updatedBy: "พนักงาน A",
  },
  {
    id: "HIS-004",
    updateDate: "2024-12-14",
    updateTime: "18:00",
    branch: "ดินดำ",
    oilType: "Premium Diesel",
    previousStock: 51000,
    usageAmount: 3000,
    updatedStock: 48000,
    updatedBy: "พนักงาน B",
  },
  {
    id: "HIS-005",
    updateDate: "2024-12-14",
    updateTime: "18:00",
    branch: "หนองจิก",
    oilType: "E85",
    previousStock: 18000,
    usageAmount: 3000,
    updatedStock: 15000,
    updatedBy: "พนักงาน B",
  },
  {
    id: "HIS-006",
    updateDate: "2024-12-13",
    updateTime: "18:15",
    branch: "หนองจิก",
    oilType: "Gasohol 95",
    previousStock: 38000,
    usageAmount: 3000,
    updatedStock: 35000,
    updatedBy: "พนักงาน C",
  },
  {
    id: "HIS-007",
    updateDate: "2024-12-13",
    updateTime: "18:15",
    branch: "ตักสิลา",
    oilType: "E20",
    previousStock: 31000,
    usageAmount: 3000,
    updatedStock: 28000,
    updatedBy: "พนักงาน C",
  },
  {
    id: "HIS-008",
    updateDate: "2024-12-12",
    updateTime: "18:45",
    branch: "ตักสิลา",
    oilType: "Gasohol 91",
    previousStock: 25000,
    usageAmount: 3000,
    updatedStock: 22000,
    updatedBy: "พนักงาน A",
  },
  {
    id: "HIS-009",
    updateDate: "2024-12-11",
    updateTime: "19:00",
    branch: "บายพาส",
    oilType: "Premium Diesel",
    previousStock: 54000,
    usageAmount: 3000,
    updatedStock: 51000,
    updatedBy: "พนักงาน B",
  },
  {
    id: "HIS-010",
    updateDate: "2024-12-10",
    updateTime: "18:30",
    branch: "บายพาส",
    oilType: "Diesel",
    previousStock: 58000,
    usageAmount: 3000,
    updatedStock: 55000,
    updatedBy: "พนักงาน C",
  },
];

export default function StockUpdateHistory() {
  const navigate = useNavigate();
  const historyItems = useMemo(() => mockHistoryData, []);
  const { selectedBranches } = useBranch();
  const selectedNavbarBranchSet = useMemo(
    () => selectedBranchNameSetFromNavbarIds(selectedBranches),
    [selectedBranches]
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [columnFilters, setColumnFilters] = useState<{
    updateDate: string;
    branch: string;
    oilType: string;
    updatedBy: string;
  }>({
    updateDate: "ทั้งหมด",
    branch: "ทั้งหมด",
    oilType: "ทั้งหมด",
    updatedBy: "ทั้งหมด",
  });

  type FilterKey = "updateDate" | "branch" | "oilType" | "updatedBy";
  type SortKey =
    | "id"
    | "updateDate"
    | "updateTime"
    | "branch"
    | "oilType"
    | "previousStock"
    | "usageAmount"
    | "updatedStock"
    | "updatedBy";

  const [activeHeaderDropdown, setActiveHeaderDropdown] = useState<FilterKey | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: "asc" | "desc" | null }>({
    key: "updateDate",
    direction: "desc",
  });

  const filterOptions = useMemo(() => {
    const uniqueDates = Array.from(new Set(historyItems.map((h) => h.updateDate))).sort((a, b) =>
      b.localeCompare(a)
    );
    const uniqueBranches = Array.from(new Set(historyItems.map((h) => h.branch))).sort((a, b) =>
      a.localeCompare(b)
    );
    const uniqueOilTypes = Array.from(new Set(historyItems.map((h) => h.oilType))).sort((a, b) =>
      a.localeCompare(b)
    );
    const uniqueUpdaters = Array.from(new Set(historyItems.map((h) => h.updatedBy))).sort((a, b) =>
      a.localeCompare(b)
    );

    return {
      updateDate: ["ทั้งหมด", ...uniqueDates],
      branch: ["ทั้งหมด", ...uniqueBranches],
      oilType: ["ทั้งหมด", ...uniqueOilTypes],
      updatedBy: ["ทั้งหมด", ...uniqueUpdaters],
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

  const filteredHistory = useMemo(() => {
    let result = historyItems.filter((item) => {
      const term = searchTerm.toLowerCase();

      const matchesNavbarBranch = isAllNavbarBranchesSelected(selectedBranches)
        ? true
        : selectedBranches.length === 0
          ? false
          : isInSelectedNavbarBranches(item.branch, selectedNavbarBranchSet);

      const matchesSearch =
        item.id.toLowerCase().includes(term) ||
        item.branch.toLowerCase().includes(term) ||
        item.oilType.toLowerCase().includes(term) ||
        item.updatedBy.toLowerCase().includes(term) ||
        item.updateDate.toLowerCase().includes(term) ||
        item.updateTime.toLowerCase().includes(term);

      const matchesDate = columnFilters.updateDate === "ทั้งหมด" || item.updateDate === columnFilters.updateDate;
      const matchesBranch = columnFilters.branch === "ทั้งหมด" || item.branch === columnFilters.branch;
      const matchesOilType = columnFilters.oilType === "ทั้งหมด" || item.oilType === columnFilters.oilType;
      const matchesUpdatedBy = columnFilters.updatedBy === "ทั้งหมด" || item.updatedBy === columnFilters.updatedBy;

      return matchesNavbarBranch && matchesSearch && matchesDate && matchesBranch && matchesOilType && matchesUpdatedBy;
    });

    if (sortConfig.key && sortConfig.direction) {
      result = [...result].sort((a, b) => {
        const dir = sortConfig.direction === "asc" ? 1 : -1;

        const compare = (x: string | number, y: string | number) => {
          if (x < y) return -1 * dir;
          if (x > y) return 1 * dir;
          return 0;
        };

        switch (sortConfig.key) {
          case "id":
            return compare(a.id, b.id);
          case "updateDate": {
            const c = compare(new Date(a.updateDate).getTime(), new Date(b.updateDate).getTime());
            if (c !== 0) return c;
            return compare(a.updateTime, b.updateTime);
          }
          case "updateTime":
            return compare(a.updateTime, b.updateTime);
          case "branch":
            return compare(a.branch, b.branch);
          case "oilType":
            return compare(a.oilType, b.oilType);
          case "previousStock":
            return compare(a.previousStock, b.previousStock);
          case "usageAmount":
            return compare(a.usageAmount, b.usageAmount);
          case "updatedStock":
            return compare(a.updatedStock, b.updatedStock);
          case "updatedBy":
            return compare(a.updatedBy, b.updatedBy);
        }
      });
    }

    return result;
  }, [historyItems, searchTerm, columnFilters, sortConfig, selectedBranches, selectedNavbarBranchSet]);

  // สรุปข้อมูล
  const summary = {
    totalRecords: filteredHistory.length,
    totalUsage: filteredHistory.reduce((sum, item) => sum + item.usageAmount, 0),
    uniqueDates: new Set(filteredHistory.map((item) => item.updateDate)).size,
  };

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
              ประวัติการอัปเดตสต็อกน้ำมัน
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">
              แสดงรายการอัปเดตสต็อกแบบตาราง และกรองข้อมูลได้จากหัวคอลัมน์
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/app/gas-station/update-stock")}
              className="px-5 py-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-2xl font-bold border border-gray-100 dark:border-gray-700 shadow-sm transition-all active:scale-95 flex items-center gap-2"
            >
              <ChevronLeft className="w-5 h-5" />
              กลับไปหน้าอัปเดตสต็อก
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
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">รายการ</p>
              <p className="text-2xl font-black text-gray-900 dark:text-white">{summary.totalRecords}</p>
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
              <Droplet className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">ใช้ไปทั้งหมด</p>
              <p className="text-2xl font-black text-gray-900 dark:text-white">
                {numberFormatter.format(summary.totalUsage)} ลิตร
              </p>
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
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">จำนวนวันที่อัปเดต</p>
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
              placeholder="ค้นหา: รหัส, วันที่, เวลา, ประเภทน้ำมัน, ผู้อัปเดต..."
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
                setColumnFilters({ updateDate: "ทั้งหมด", branch: "ทั้งหมด", oilType: "ทั้งหมด", updatedBy: "ทั้งหมด" });
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
          <p className="text-gray-600 dark:text-gray-400 text-lg font-bold">ไม่พบข้อมูลที่ตรงกับเงื่อนไข</p>
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
                  <HeaderWithFilter
                    label="รหัส"
                    columnKey="id"
                  />
                  <HeaderWithFilter
                    label="วันที่"
                    columnKey="updateDate"
                    filterKey="updateDate"
                    options={filterOptions.updateDate}
                  />
                  <HeaderWithFilter
                    label="เวลา"
                    columnKey="updateTime"
                  />
                  <HeaderWithFilter
                    label="สาขา"
                    columnKey="branch"
                    filterKey="branch"
                    options={filterOptions.branch}
                  />
                  <HeaderWithFilter
                    label="ประเภทน้ำมัน"
                    columnKey="oilType"
                    filterKey="oilType"
                    options={filterOptions.oilType}
                  />
                  <HeaderWithFilter
                    label="สต็อกก่อนอัปเดต"
                    columnKey="previousStock"
                    align="right"
                  />
                  <HeaderWithFilter
                    label="จำนวนที่ใช้"
                    columnKey="usageAmount"
                    align="right"
                  />
                  <HeaderWithFilter
                    label="สต็อกหลังอัปเดต"
                    columnKey="updatedStock"
                    align="right"
                  />
                  <HeaderWithFilter
                    label="ผู้อัปเดต"
                    columnKey="updatedBy"
                    filterKey="updatedBy"
                    options={filterOptions.updatedBy}
                  />
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
                      {item.id}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">
                      {item.updateDate}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">
                      {item.updateTime}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">
                      {item.branch}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-800 dark:text-white whitespace-nowrap">
                      {item.oilType}
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-gray-600 dark:text-gray-300 whitespace-nowrap">
                      {numberFormatter.format(item.previousStock)} ลิตร
                    </td>
                    <td className="px-6 py-4 text-sm text-right font-black text-red-600 dark:text-red-400 whitespace-nowrap">
                      -{numberFormatter.format(item.usageAmount)} ลิตร
                    </td>
                    <td className="px-6 py-4 text-sm text-right font-black text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                      {numberFormatter.format(item.updatedStock)} ลิตร
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">
                      {item.updatedBy}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
}

