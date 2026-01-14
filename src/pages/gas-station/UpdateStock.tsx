import { motion, AnimatePresence } from "framer-motion";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useBranch } from "@/contexts/BranchContext";
import {
  isAllNavbarBranchesSelected,
  isInSelectedNavbarBranches,
  selectedBranchNameSetFromNavbarIds,
} from "@/utils/branchFilter";
import {
  Package,
  Save,
  RotateCcw,
  AlertCircle,
  CheckCircle,
  Calendar,
  Droplet,
  TrendingDown,
  History,
  Search,
  Filter,
  Check,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  X,
} from "lucide-react";

const numberFormatter = new Intl.NumberFormat("th-TH", {
  maximumFractionDigits: 0,
});

const currencyFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
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

type StockUpdateItem = {
  id: string;
  branch: string;
  tankNumber: number; // หลุม
  oilType: OilType;
  currentStock: number; // สต็อกปัจจุบัน (ลิตร)
  usageAmount: number; // จำนวนที่ใช้ไป (ลิตร) - สำหรับกรอก
  updatedStock: number; // สต็อกหลังอัพเดต (ลิตร) - คำนวณอัตโนมัติ
  lastUpdated: string;
  status: "pending" | "updated";
  pricePerLiter: number;
  totalValue: number;
  maxCapacity: number;
};

// สาขาทั้งหมด (ตรงกับ Stock.tsx - ไม่รวมมายมาส)
// ลำดับ: ไฮโซ -> ดินดำ -> หนองจิก -> ตักสิลา -> บายพาส
const branches = [
  { id: 1, name: "ปั๊มไฮโซ", code: "HQ" },
  { id: 2, name: "ดินดำ", code: "DD" },
  { id: 3, name: "หนองจิก", code: "NJ" },
  { id: 4, name: "ตักสิลา", code: "TK" },
  { id: 5, name: "บายพาส", code: "BP" },
];

// Mock data จาก Stock.tsx - ใช้ข้อมูลเดียวกัน
// เรียงตามลำดับ: ปั๊มไฮโซ -> ดินดำ -> หนองจิก -> ตักสิลา -> บายพาส (ไม่รวมมายมาส)
const mockStockDataFromStock = [
  // ปั๊มไฮโซ - 5 หลุม
  { id: "STK-001", branch: "ปั๊มไฮโซ", tankNumber: 1, oilType: "Gasohol 95" as OilType, currentStock: 18000, minThreshold: 4000, maxCapacity: 20000, pricePerLiter: 41.49, totalValue: 746820 },
  { id: "STK-002", branch: "ปั๊มไฮโซ", tankNumber: 2, oilType: "Premium Diesel" as OilType, currentStock: 7500, minThreshold: 2000, maxCapacity: 10000, pricePerLiter: 33.49, totalValue: 251175 },
  { id: "STK-003", branch: "ปั๊มไฮโซ", tankNumber: 3, oilType: "E20" as OilType, currentStock: 8300, minThreshold: 2000, maxCapacity: 10000, pricePerLiter: 36.90, totalValue: 306270 },
  { id: "STK-004", branch: "ปั๊มไฮโซ", tankNumber: 4, oilType: "Diesel" as OilType, currentStock: 17000, minThreshold: 4000, maxCapacity: 20000, pricePerLiter: 32.49, totalValue: 552330 },
  { id: "STK-005", branch: "ปั๊มไฮโซ", tankNumber: 5, oilType: "Gasohol 91" as OilType, currentStock: 19000, minThreshold: 4000, maxCapacity: 20000, pricePerLiter: 38.49, totalValue: 731310 },
  // ดินดำ - 5 หลุม
  { id: "STK-101", branch: "ดินดำ", tankNumber: 1, oilType: "Premium Diesel" as OilType, currentStock: 19000, minThreshold: 700, maxCapacity: 20000, pricePerLiter: 33.49, totalValue: 636310 },
  { id: "STK-102", branch: "ดินดำ", tankNumber: 2, oilType: "Gasohol 95" as OilType, currentStock: 9600, minThreshold: 400, maxCapacity: 10000, pricePerLiter: 41.49, totalValue: 398304 },
  { id: "STK-103", branch: "ดินดำ", tankNumber: 3, oilType: "E20" as OilType, currentStock: 9600, minThreshold: 400, maxCapacity: 10000, pricePerLiter: 36.90, totalValue: 354240 },
  { id: "STK-104", branch: "ดินดำ", tankNumber: 4, oilType: "Diesel" as OilType, currentStock: 19400, minThreshold: 600, maxCapacity: 20000, pricePerLiter: 32.49, totalValue: 630306 },
  { id: "STK-105", branch: "ดินดำ", tankNumber: 5, oilType: "Gasohol 91" as OilType, currentStock: 19400, minThreshold: 600, maxCapacity: 20000, pricePerLiter: 38.49, totalValue: 746706 },
  // หนองจิก - 5 หลุม
  { id: "STK-201", branch: "หนองจิก", tankNumber: 1, oilType: "Gasohol 95" as OilType, currentStock: 18000, minThreshold: 4000, maxCapacity: 20000, pricePerLiter: 41.49, totalValue: 746820 },
  { id: "STK-202", branch: "หนองจิก", tankNumber: 2, oilType: "Premium Diesel" as OilType, currentStock: 7500, minThreshold: 2000, maxCapacity: 10000, pricePerLiter: 33.49, totalValue: 251175 },
  { id: "STK-203", branch: "หนองจิก", tankNumber: 3, oilType: "E20" as OilType, currentStock: 8300, minThreshold: 2000, maxCapacity: 10000, pricePerLiter: 36.90, totalValue: 306270 },
  { id: "STK-204", branch: "หนองจิก", tankNumber: 4, oilType: "Diesel" as OilType, currentStock: 17000, minThreshold: 4000, maxCapacity: 20000, pricePerLiter: 32.49, totalValue: 552330 },
  { id: "STK-205", branch: "หนองจิก", tankNumber: 5, oilType: "Gasohol 91" as OilType, currentStock: 19000, minThreshold: 4000, maxCapacity: 20000, pricePerLiter: 38.49, totalValue: 731310 },
  // ตักสิลา (ปตท. ตักสิดา) - 7 หลุม
  { id: "STK-301", branch: "ตักสิลา", tankNumber: 1, oilType: "Gasohol 95" as OilType, currentStock: 18000, minThreshold: 4000, maxCapacity: 20000, pricePerLiter: 41.49, totalValue: 746820 },
  { id: "STK-302", branch: "ตักสิลา", tankNumber: 2, oilType: "Gasohol 91" as OilType, currentStock: 19000, minThreshold: 4000, maxCapacity: 20000, pricePerLiter: 38.49, totalValue: 731310 },
  { id: "STK-303", branch: "ตักสิลา", tankNumber: 3, oilType: "Diesel" as OilType, currentStock: 17000, minThreshold: 4000, maxCapacity: 20000, pricePerLiter: 32.49, totalValue: 552330 },
  { id: "STK-304", branch: "ตักสิลา", tankNumber: 4, oilType: "E85" as OilType, currentStock: 9000, minThreshold: 2000, maxCapacity: 10000, pricePerLiter: 28.49, totalValue: 256410 },
  { id: "STK-305", branch: "ตักสิลา", tankNumber: 5, oilType: "Premium Diesel" as OilType, currentStock: 7500, minThreshold: 2000, maxCapacity: 10000, pricePerLiter: 33.49, totalValue: 251175 },
  { id: "STK-306", branch: "ตักสิลา", tankNumber: 6, oilType: "E20" as OilType, currentStock: 17000, minThreshold: 4000, maxCapacity: 20000, pricePerLiter: 36.90, totalValue: 627300 },
  { id: "STK-307", branch: "ตักสิลา", tankNumber: 7, oilType: "Premium Gasohol 95" as OilType, currentStock: 13000, minThreshold: 4000, maxCapacity: 20000, pricePerLiter: 41.49, totalValue: 539370 },
  // บายพาส - 5 หลุม
  { id: "STK-401", branch: "บายพาส", tankNumber: 1, oilType: "Gasohol 95" as OilType, currentStock: 18000, minThreshold: 4000, maxCapacity: 20000, pricePerLiter: 41.49, totalValue: 746820 },
  { id: "STK-402", branch: "บายพาส", tankNumber: 2, oilType: "Premium Diesel" as OilType, currentStock: 7500, minThreshold: 2000, maxCapacity: 10000, pricePerLiter: 33.49, totalValue: 251175 },
  { id: "STK-403", branch: "บายพาส", tankNumber: 3, oilType: "E20" as OilType, currentStock: 8300, minThreshold: 2000, maxCapacity: 10000, pricePerLiter: 36.90, totalValue: 306270 },
  { id: "STK-404", branch: "บายพาส", tankNumber: 4, oilType: "Diesel" as OilType, currentStock: 17000, minThreshold: 4000, maxCapacity: 20000, pricePerLiter: 32.49, totalValue: 552330 },
  { id: "STK-405", branch: "บายพาส", tankNumber: 5, oilType: "Gasohol 91" as OilType, currentStock: 19000, minThreshold: 4000, maxCapacity: 20000, pricePerLiter: 38.49, totalValue: 731310 },
];

// แปลงข้อมูลจาก Stock.tsx เป็น StockUpdateItem
const generateInitialStockData = (): StockUpdateItem[] => {
  return mockStockDataFromStock.map((item) => ({
    id: item.id,
    branch: item.branch,
    tankNumber: item.tankNumber,
    oilType: item.oilType,
    currentStock: item.currentStock,
    usageAmount: 0,
    updatedStock: item.currentStock,
    lastUpdated: "2024-12-15 18:30",
    status: "pending",
    pricePerLiter: item.pricePerLiter,
    totalValue: item.totalValue,
    maxCapacity: item.maxCapacity,
  }));
};

const initialStockData = generateInitialStockData();

export default function UpdateStock() {
  const navigate = useNavigate();
  const { selectedBranches } = useBranch();
  const selectedNavbarBranchSet = useMemo(
    () => selectedBranchNameSetFromNavbarIds(selectedBranches),
    [selectedBranches]
  );
  const [stockItems, setStockItems] = useState<StockUpdateItem[]>(initialStockData);
  const [searchTerm, setSearchTerm] = useState("");
  const [updateDate, setUpdateDate] = useState(new Date().toISOString().split("T")[0]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Column filters (match DepositSlips / Stock pattern)
  const [columnFilters, setColumnFilters] = useState<{
    branch: string;
    oilType: string;
    status: string; // "ทั้งหมด" | "pending" | "updated"
  }>({
    branch: "ทั้งหมด",
    oilType: "ทั้งหมด",
    status: "ทั้งหมด",
  });

  type FilterKey = "branch" | "oilType" | "status";
  type SortKey =
    | "branch"
    | "tankNumber"
    | "oilType"
    | "currentStock"
    | "usageAmount"
    | "updatedStock"
    | "status";

  const [activeHeaderDropdown, setActiveHeaderDropdown] = useState<FilterKey | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: "asc" | "desc" | null }>({
    key: "branch",
    direction: null,
  });

  const filterOptions = useMemo(() => {
    return {
      branch: ["ทั้งหมด", ...new Set(stockItems.filter(i => i.branch !== "มายมาส").map((s) => s.branch))],
      oilType: ["ทั้งหมด", ...new Set(stockItems.filter(i => i.branch !== "มายมาส").map((s) => s.oilType))],
      status: ["ทั้งหมด", "pending", "updated"],
    };
  }, [stockItems]);

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

  const handleUsageChange = (id: string, usageAmount: number) => {
    setStockItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updatedStock = Math.max(0, item.currentStock - usageAmount);
          const updatedTotalValue = updatedStock * item.pricePerLiter;
          return {
            ...item,
            usageAmount,
            updatedStock,
            totalValue: updatedTotalValue,
            status: usageAmount > 0 ? "updated" : "pending",
          };
        }
        return item;
      })
    );
  };

  // กรองข้อมูลตาม filter ในหัวคอลัมน์ และเรียงลำดับ
  const filteredStockItems = useMemo(() => {
    // กรองออกมายมาส และกรองตามสาขาที่เลือก
    let filtered = stockItems.filter(item => item.branch !== "มายมาส");

    // Navbar branch filter (global)
    if (!isAllNavbarBranchesSelected(selectedBranches)) {
      filtered = filtered.filter((item) =>
        selectedBranches.length === 0 ? false : isInSelectedNavbarBranches(item.branch, selectedNavbarBranchSet)
      );
    }

    const term = searchTerm.toLowerCase();
    filtered = filtered.filter((item) => {
      const matchesSearch =
        item.oilType.toLowerCase().includes(term) ||
        item.branch.toLowerCase().includes(term) ||
        item.id.toLowerCase().includes(term) ||
        item.tankNumber.toString().includes(searchTerm);

      const matchesBranch = columnFilters.branch === "ทั้งหมด" || item.branch === columnFilters.branch;
      const matchesOilType = columnFilters.oilType === "ทั้งหมด" || item.oilType === (columnFilters.oilType as OilType);
      const matchesStatus =
        columnFilters.status === "ทั้งหมด" || item.status === (columnFilters.status as StockUpdateItem["status"]);

      return matchesSearch && matchesBranch && matchesOilType && matchesStatus;
    });

    // Default sort (old behavior)
    if (!sortConfig.direction) {
      const branchOrder = ["ปั๊มไฮโซ", "ดินดำ", "หนองจิก", "ตักสิลา", "บายพาส"];
      return [...filtered].sort((a, b) => {
        if (a.branch !== b.branch) return branchOrder.indexOf(a.branch) - branchOrder.indexOf(b.branch);
        return a.tankNumber - b.tankNumber;
      });
    }

    // Active sort
    return [...filtered].sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortConfig.key) {
        case "branch":
          aValue = a.branch;
          bValue = b.branch;
          break;
        case "tankNumber":
          aValue = a.tankNumber;
          bValue = b.tankNumber;
          break;
        case "oilType":
          aValue = a.oilType;
          bValue = b.oilType;
          break;
        case "currentStock":
          aValue = a.currentStock;
          bValue = b.currentStock;
          break;
        case "usageAmount":
          aValue = a.usageAmount;
          bValue = b.usageAmount;
          break;
        case "updatedStock":
          aValue = a.updatedStock;
          bValue = b.updatedStock;
          break;
        case "status":
          aValue = a.status;
          bValue = b.status;
          break;
      }

      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [stockItems, searchTerm, columnFilters, sortConfig, selectedBranches, selectedNavbarBranchSet]);

  // สรุปข้อมูลตามสาขา (ไม่รวมมายมาส)
  const branchSummary = useMemo(() => {
    const summary: Record<string, { totalUsage: number; updatedCount: number; totalItems: number }> = {};
    
    branches.forEach(branch => {
      const branchItems = stockItems.filter(item => item.branch === branch.name && item.branch !== "มายมาส");
      summary[branch.name] = {
        totalUsage: branchItems.reduce((sum, item) => sum + item.usageAmount, 0),
        updatedCount: branchItems.filter(item => item.usageAmount > 0).length,
        totalItems: branchItems.length,
      };
    });
    
    return summary;
  }, [stockItems]);

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

    return (
      <th
        className={`px-6 py-4 relative group text-[10px] uppercase tracking-widest font-black text-gray-400 ${
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
            disabled={!columnKey}
            aria-label={columnKey ? `เรียงข้อมูลคอลัมน์ ${label}` : label}
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
                  (filterKey === "branch"
                    ? columnFilters.branch
                    : filterKey === "oilType"
                      ? columnFilters.oilType
                      : columnFilters.status) !== "ทั้งหมด"
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
                      {options.map((opt) => {
                        const current =
                          filterKey === "branch"
                            ? columnFilters.branch
                            : filterKey === "oilType"
                              ? columnFilters.oilType
                              : columnFilters.status;
                        const selected = current === opt;
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => {
                              if (filterKey === "branch") {
                                setColumnFilters((prev) => ({ ...prev, branch: opt }));
                              } else if (filterKey === "oilType") {
                                setColumnFilters((prev) => ({ ...prev, oilType: opt }));
                              } else {
                                setColumnFilters((prev) => ({ ...prev, status: opt }));
                              }
                              setActiveHeaderDropdown(null);
                            }}
                            className={`w-full text-left px-4 py-2 text-xs font-bold transition-colors flex items-center justify-between ${
                              selected
                                ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400"
                                : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                            }`}
                          >
                            {opt}
                            {selected && <Check className="w-3 h-3" />}
                          </button>
                        );
                      })}
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

  const isAnyFilterActive = useMemo(() => {
    return (
      searchTerm !== "" ||
      columnFilters.branch !== "ทั้งหมด" ||
      columnFilters.oilType !== "ทั้งหมด" ||
      columnFilters.status !== "ทั้งหมด" ||
      sortConfig.direction !== null
    );
  }, [searchTerm, columnFilters, sortConfig.direction]);

  const handleReset = () => {
    setStockItems(initialStockData);
    setUpdateDate(new Date().toISOString().split("T")[0]);
    setSaveSuccess(false);
    setSearchTerm("");
    setColumnFilters({ branch: "ทั้งหมด", oilType: "ทั้งหมด", status: "ทั้งหมด" });
    setActiveHeaderDropdown(null);
    setSortConfig({ key: "branch", direction: null });
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);

    // ตรวจสอบว่ามีการกรอกข้อมูลหรือไม่ (เฉพาะสาขาที่เลือกใน filter branch)
    const itemsToCheck = columnFilters.branch === "ทั้งหมด"
      ? stockItems
      : stockItems.filter((i) => i.branch === columnFilters.branch);
    const hasUpdates = itemsToCheck.some((item) => item.usageAmount > 0);
    if (!hasUpdates) {
      alert("กรุณากรอกจำนวนการใช้น้ำมันอย่างน้อย 1 รายการ");
      setIsSaving(false);
      return;
    }

    // จำลองการบันทึกข้อมูล
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // อัพเดตสถานะและวันที่
      const now = new Date();
      const timeString = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
      const dateString = `${updateDate} ${timeString}`;

      setStockItems((prev) =>
        prev.map((item) => ({
          ...item,
          lastUpdated: dateString,
          currentStock: item.updatedStock,
          usageAmount: 0,
          updatedStock: item.updatedStock,
          status: "pending",
        }))
      );

      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (error) {
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    } finally {
      setIsSaving(false);
    }
  };

  const totalUsage = filteredStockItems.reduce((sum, item) => sum + item.usageAmount, 0);
  const updatedCount = filteredStockItems.filter((item) => item.usageAmount > 0).length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      {/* Header */}
      <header className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
              <div className="p-2 bg-emerald-500 rounded-2xl shadow-lg shadow-emerald-500/20">
                <Package className="w-8 h-8 text-white" />
              </div>
              อัพเดตสต็อกน้ำมัน
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium flex items-center gap-2">
              <Droplet className="w-4 h-4" />
              อัพเดตการใช้น้ำมันในระหว่างวัน สำหรับแต่ละชนิดน้ำมัน
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/app/gas-station/stock-update-history")}
              className="px-6 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-2xl font-bold transition-all active:scale-95 flex items-center gap-2"
            >
              <History className="w-5 h-5" />
              ดูประวัติการอัปเดตน้ำมัน
            </button>
            <button
              onClick={() => navigate("/app/gas-station/stock")}
              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-bold shadow-lg shadow-emerald-500/20 transition-all active:scale-95 flex items-center gap-2"
            >
              ← กลับไปหน้าสต็อก
            </button>
          </div>
        </div>
      </header>

      {/* Filter Bar (Search + Date + Clear + Count) */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="ค้นหาสาขา, ประเภทน้ำมัน, รหัสสต็อก..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900 dark:text-white font-medium"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:flex-initial">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="date"
              value={updateDate}
              onChange={(e) => setUpdateDate(e.target.value)}
              className="pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900 dark:text-white font-medium text-sm"
            />
          </div>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          {isAnyFilterActive && (
            <button
              onClick={() => {
                setSearchTerm("");
                setColumnFilters({ branch: "ทั้งหมด", oilType: "ทั้งหมด", status: "ทั้งหมด" });
                setActiveHeaderDropdown(null);
                setSortConfig({ key: "branch", direction: null });
              }}
              className="px-4 py-3 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-2xl font-bold text-sm transition-colors flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              ล้างตัวกรอง
            </button>
          )}
          <div className="flex items-center gap-2 px-4 py-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-2xl border border-emerald-100 dark:border-emerald-800/50 shrink-0">
            <Package className="w-4 h-4" />
            <span className="text-sm font-bold whitespace-nowrap">พบ {filteredStockItems.length} รายการ</span>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm p-6"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-emerald-500 rounded-2xl shadow-lg shadow-emerald-500/20 flex items-center justify-center">
              <Droplet className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">จำนวนที่ใช้รวม</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {numberFormatter.format(totalUsage)} ลิตร
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                มูลค่า: {currencyFormatter.format(filteredStockItems.reduce((sum, item) => sum + (item.usageAmount * item.pricePerLiter), 0))}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm p-6"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-emerald-500 rounded-2xl shadow-lg shadow-emerald-500/20 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">รายการที่อัพเดตแล้ว</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {updatedCount} / {filteredStockItems.length}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm p-6"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-amber-500 rounded-2xl shadow-lg shadow-amber-500/20 flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">รายการที่ยังไม่อัพเดต</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {filteredStockItems.length - updatedCount} / {filteredStockItems.length}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Success Message */}
      {saveSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="bg-emerald-50 dark:bg-emerald-900/20 border-l-4 border-emerald-500 rounded-xl p-4 flex items-center gap-3"
        >
          <CheckCircle className="w-5 h-5 text-emerald-500" />
          <p className="text-emerald-800 dark:text-emerald-200 font-semibold">
            บันทึกข้อมูลการอัพเดตสต็อกสำเร็จแล้ว
          </p>
        </motion.div>
      )}

      {/* Update Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden"
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-1">
                อัพเดตการใช้น้ำมันรายวัน
                {columnFilters.branch !== "ทั้งหมด" && (
                  <span className="ml-2 text-base font-normal text-emerald-600 dark:text-emerald-400">
                    ({columnFilters.branch})
                  </span>
                )}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {columnFilters.branch === "ทั้งหมด" 
                  ? "กรุณากรอกจำนวนน้ำมันที่ใช้ไปในระหว่างวันสำหรับแต่ละชนิดน้ำมันทุกสาขา"
                  : `กรุณากรอกจำนวนน้ำมันที่ใช้ไปในระหว่างวันสำหรับแต่ละชนิดน้ำมัน - ${columnFilters.branch}`
                }
              </p>
            </div>
            {columnFilters.branch === "ทั้งหมด" && (
              <div className="text-right">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">สรุปทุกสาขา</p>
                <div className="flex flex-wrap gap-2 justify-end">
                  {branches.map((branch) => {
                    const summary = branchSummary[branch.name];
                    return (
                      <div
                        key={branch.id}
                        className="px-2 py-1 bg-emerald-50 dark:bg-emerald-900/20 rounded text-xs text-emerald-700 dark:text-emerald-300"
                      >
                        {branch.name}: {summary.updatedCount}/{summary.totalItems}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-gray-900/50">
                <HeaderWithFilter label="สาขา" columnKey="branch" filterKey="branch" options={filterOptions.branch} />
                <HeaderWithFilter label="หลุม" columnKey="tankNumber" align="center" />
                <HeaderWithFilter label="ประเภทน้ำมัน" columnKey="oilType" filterKey="oilType" options={filterOptions.oilType} />
                <HeaderWithFilter label="สต็อกปัจจุบัน" columnKey="currentStock" align="right" />
                <HeaderWithFilter label="จำนวนที่ใช้ (ลิตร)" columnKey="usageAmount" align="right" />
                <HeaderWithFilter label="สต็อกหลังอัพเดต" columnKey="updatedStock" align="right" />
                <HeaderWithFilter label="สถานะ" columnKey="status" filterKey="status" options={filterOptions.status} align="center" />
              </tr>
            </thead>
            <tbody>
              {filteredStockItems.map((item, index) => (
                <motion.tr
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className={`border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                    item.usageAmount > 0 ? "bg-blue-50/30 dark:bg-blue-900/10" : ""
                  }`}
                >
                  <td className="py-4 px-6 text-sm font-medium text-gray-700 dark:text-gray-300">
                    {item.branch}
                  </td>
                  <td className="py-4 px-6 text-sm text-center font-semibold text-gray-800 dark:text-white">
                    {item.tankNumber}
                  </td>
                  <td className="py-4 px-6 text-sm font-semibold text-gray-800 dark:text-white">
                    <div className="flex flex-col">
                      <span>{item.oilType}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-normal">ถังที่ {item.tankNumber}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-sm text-right font-semibold text-gray-800 dark:text-white">
                    <div className="flex flex-col items-end">
                      <span>{numberFormatter.format(item.currentStock)} ลิตร</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-normal">
                        {currencyFormatter.format(item.totalValue)}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-end gap-2">
                      <input
                        type="number"
                        min="0"
                        max={item.currentStock}
                        step="0.01"
                        value={item.usageAmount || ""}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value) || 0;
                          handleUsageChange(item.id, value);
                        }}
                        placeholder="0"
                        className="w-32 px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 text-gray-800 dark:text-white text-right"
                      />
                      <span className="text-sm text-gray-500 dark:text-gray-400">ลิตร</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-sm text-right font-semibold text-gray-800 dark:text-white">
                    <div className="flex flex-col items-end">
                      <span>{numberFormatter.format(item.updatedStock)} ลิตร</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-normal">
                        {currencyFormatter.format(item.updatedStock * item.pricePerLiter)}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-center">
                    {item.usageAmount > 0 ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800">
                        <CheckCircle className="w-3.5 h-3.5" />
                        อัพเดตแล้ว
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-900/30 dark:text-gray-400 dark:border-gray-800">
                        <AlertCircle className="w-3.5 h-3.5" />
                        ยังไม่อัพเดต
                      </span>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Action Buttons */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between gap-4">
          <button
            onClick={handleReset}
            disabled={isSaving}
            className="px-6 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl transition-all duration-200 font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RotateCcw className="w-4 h-4" />
            รีเซ็ต
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || updatedCount === 0}
            className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl transition-all duration-200 font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                กำลังบันทึก...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                บันทึกการอัพเดต
              </>
            )}
          </button>
        </div>
      </motion.div>

      {/* Info Alert */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 dark:border-blue-600 rounded-xl p-4"
      >
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
              คำแนะนำการใช้งาน
            </h3>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-disc list-inside">
              <li>กรุณากรอกจำนวนน้ำมันที่ใช้ไปในระหว่างวันสำหรับแต่ละชนิดน้ำมัน</li>
              <li>ระบบจะคำนวณสต็อกหลังอัพเดตอัตโนมัติ (สต็อกปัจจุบัน - จำนวนที่ใช้)</li>
              <li>ควรอัพเดตข้อมูลทุกวันเพื่อให้สต็อกมีความถูกต้อง</li>
              <li>หลังจากบันทึกแล้ว สต็อกปัจจุบันจะถูกอัพเดตเป็นสต็อกหลังอัพเดต</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

