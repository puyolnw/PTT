import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  DollarSign,
  Fuel,
  Calendar,
  Clock,
  Upload,
  Edit3,
  CheckCircle,
  AlertTriangle,
  History,
  Search,
  Filter,
  Check,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  X,
} from "lucide-react";
import { addPriceAdjustmentHistoryEntry } from "@/utils/priceAdjustmentHistory";

type OilTypeCode =
  | "PREMIUM_DIESEL"
  | "PREMIUM_GASOHOL_95"
  | "DIESEL"
  | "E85"
  | "E20"
  | "GASOHOL_91"
  | "GASOHOL_95";

type PriceStatus = "กำลังใช้งาน" | "ร่าง" | "รอมีผล";

type OilPrice = {
  id: string;
  branch: string;
  oilTypeCode: OilTypeCode;
  oilTypeName: string;
  currentPrice: number;
  proposedPrice?: number | null;
  effectiveDate?: string;
  effectiveTime?: string;
  lastUpdated: string;
  lastSource: "ไฟล์ ปตท." | "กรอกมือ" | "API";
  status: PriceStatus;
};

const currencyFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const oilTypeDisplayOrder: OilTypeCode[] = [
  "PREMIUM_DIESEL",
  "DIESEL",
  "GASOHOL_95",
  "GASOHOL_91",
  "E20",
  "E85",
  "PREMIUM_GASOHOL_95",
];

const initialPrices: OilPrice[] = [
  {
    id: "HX-PREMIUM_DIESEL",
    branch: "ปั๊มไฮโซ",
    oilTypeCode: "PREMIUM_DIESEL",
    oilTypeName: "Premium Diesel",
    currentPrice: 34.59,
    lastUpdated: "2024-12-15 05:00",
    lastSource: "ไฟล์ ปตท.",
    status: "กำลังใช้งาน",
  },
  {
    id: "HX-DIESEL",
    branch: "ปั๊มไฮโซ",
    oilTypeCode: "DIESEL",
    oilTypeName: "Diesel",
    currentPrice: 31.29,
    lastUpdated: "2024-12-15 05:00",
    lastSource: "ไฟล์ ปตท.",
    status: "กำลังใช้งาน",
  },
  {
    id: "HX-GASOHOL_95",
    branch: "ปั๊มไฮโซ",
    oilTypeCode: "GASOHOL_95",
    oilTypeName: "Gasohol 95",
    currentPrice: 35.45,
    lastUpdated: "2024-12-15 05:00",
    lastSource: "ไฟล์ ปตท.",
    status: "กำลังใช้งาน",
  },
  {
    id: "HX-GASOHOL_91",
    branch: "ปั๊มไฮโซ",
    oilTypeCode: "GASOHOL_91",
    oilTypeName: "Gasohol 91",
    currentPrice: 34.98,
    lastUpdated: "2024-12-15 05:00",
    lastSource: "ไฟล์ ปตท.",
    status: "กำลังใช้งาน",
  },
  {
    id: "HX-E20",
    branch: "ปั๊มไฮโซ",
    oilTypeCode: "E20",
    oilTypeName: "E20",
    currentPrice: 32.75,
    lastUpdated: "2024-12-15 05:00",
    lastSource: "ไฟล์ ปตท.",
    status: "กำลังใช้งาน",
  },
  {
    id: "HX-E85",
    branch: "ปั๊มไฮโซ",
    oilTypeCode: "E85",
    oilTypeName: "E85",
    currentPrice: 27.30,
    lastUpdated: "2024-12-15 05:00",
    lastSource: "ไฟล์ ปตท.",
    status: "กำลังใช้งาน",
  },
];

export default function PriceAdjustment() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [branchFilter, setBranchFilter] = useState<string>("ปั๊มไฮโซ");
  const [oilPrices, setOilPrices] = useState<OilPrice[]>(initialPrices);

  const [searchTerm, setSearchTerm] = useState("");
  const [columnFilters, setColumnFilters] = useState<{
    status: string;
    source: string;
  }>({
    status: "ทั้งหมด",
    source: "ทั้งหมด",
  });

  type FilterKey = "status" | "source";
  type SortKey =
    | "oilTypeName"
    | "currentPrice"
    | "proposedPrice"
    | "effectiveDate"
    | "lastUpdated"
    | "status";

  const [activeHeaderDropdown, setActiveHeaderDropdown] = useState<FilterKey | null>(null);
  const [sortConfig, setSortConfig] = useState<{
    key: SortKey;
    direction: "asc" | "desc" | null;
  }>({
    key: "oilTypeName",
    direction: null,
  });

  const [globalEffectiveDate, setGlobalEffectiveDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [globalEffectiveTime, setGlobalEffectiveTime] = useState<string>("05:00");

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAdjustedBy, setConfirmAdjustedBy] = useState<string>(user?.name ?? "");

  const employeeOptions = useMemo(() => {
    const base = ["พนักงาน A", "พนักงาน B", "พนักงาน C", "ผู้จัดการสถานี"];
    const current = (user?.name ?? "").trim();
    if (current && !base.includes(current)) return [current, ...base];
    return base;
  }, [user?.name]);

  const branchPrices = useMemo(() => oilPrices.filter((p) => p.branch === branchFilter), [oilPrices, branchFilter]);

  const filterOptions = useMemo(() => {
    return {
      status: ["ทั้งหมด", ...new Set(branchPrices.map((p) => p.status))],
      source: ["ทั้งหมด", ...new Set(branchPrices.map((p) => p.lastSource))],
    };
  }, [branchPrices]);

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

  const filteredPrices = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    let result = branchPrices.filter((p) => {
      const matchesSearch =
        term === "" ||
        p.oilTypeName.toLowerCase().includes(term) ||
        p.oilTypeCode.toLowerCase().includes(term);

      const matchesStatus = columnFilters.status === "ทั้งหมด" || p.status === (columnFilters.status as PriceStatus);
      const matchesSource =
        columnFilters.source === "ทั้งหมด" || p.lastSource === (columnFilters.source as OilPrice["lastSource"]);

      return matchesSearch && matchesStatus && matchesSource;
    });

    // Default ordering: keep OilType display order when no explicit sort
    if (!sortConfig.direction) {
      result = [...result].sort(
        (a, b) =>
          oilTypeDisplayOrder.indexOf(a.oilTypeCode) -
          oilTypeDisplayOrder.indexOf(b.oilTypeCode)
      );
      return result;
    }

    result = [...result].sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortConfig.key) {
        case "oilTypeName":
          aValue = a.oilTypeName;
          bValue = b.oilTypeName;
          break;
        case "currentPrice":
          aValue = a.currentPrice;
          bValue = b.currentPrice;
          break;
        case "proposedPrice":
          aValue = a.proposedPrice ?? -Infinity;
          bValue = b.proposedPrice ?? -Infinity;
          break;
        case "effectiveDate":
          aValue = (a.effectiveDate ?? "") + " " + (a.effectiveTime ?? "");
          bValue = (b.effectiveDate ?? "") + " " + (b.effectiveTime ?? "");
          break;
        case "lastUpdated":
          aValue = a.lastUpdated;
          bValue = b.lastUpdated;
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

    return result;
  }, [branchPrices, searchTerm, columnFilters, sortConfig]);

  const pendingChanges = useMemo(
    () =>
      filteredPrices.filter(
        (p) =>
          p.proposedPrice != null &&
          !Number.isNaN(p.proposedPrice) &&
          p.proposedPrice !== p.currentPrice
      ),
    [filteredPrices]
  );

  const hasPendingChanges = pendingChanges.length > 0;

  const summary = useMemo(() => {
    const totalOilTypes = filteredPrices.length;
    const changedCount = pendingChanges.length;
    const avgCurrentPrice =
      filteredPrices.length === 0
        ? 0
        : filteredPrices.reduce((sum, p) => sum + p.currentPrice, 0) /
          filteredPrices.length;
    const avgNewPrice =
      pendingChanges.length === 0
        ? null
        : pendingChanges.reduce(
            (sum, p) => sum + (p.proposedPrice ?? p.currentPrice),
            0
          ) / filteredPrices.length;

    return {
      totalOilTypes,
      changedCount,
      avgCurrentPrice,
      avgNewPrice,
    };
  }, [filteredPrices, pendingChanges]);

  const handleChangeProposedPrice = (id: string, value: string) => {
    const numeric = value === "" ? null : Number(value);
    if (numeric != null && Number.isNaN(numeric)) return;

    setOilPrices((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              proposedPrice: numeric,
              effectiveDate: p.effectiveDate ?? globalEffectiveDate,
              effectiveTime: p.effectiveTime ?? globalEffectiveTime,
              status: "ร่าง",
            }
          : p
      )
    );
  };

  const handleChangeEffectiveDate = (id: string, date: string) => {
    setOilPrices((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              effectiveDate: date,
              status: p.proposedPrice != null && p.proposedPrice !== p.currentPrice ? "รอมีผล" : p.status,
            }
          : p
      )
    );
  };

  const handleChangeEffectiveTime = (id: string, time: string) => {
    setOilPrices((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              effectiveTime: time,
              status: p.proposedPrice != null && p.proposedPrice !== p.currentPrice ? "รอมีผล" : p.status,
            }
          : p
      )
    );
  };

  const handleApplyAll = () => {
    if (!hasPendingChanges) return;
    setConfirmAdjustedBy((user?.name ?? "").trim());
    setShowConfirmModal(true);
  };

  const applyConfirmedChanges = () => {
    const now = new Date();
    const nowStr = now
      .toLocaleString("th-TH", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
      .replace(",", "");

    // Save history (based on pending changes at the time of confirmation)
    addPriceAdjustmentHistoryEntry({
      branch: branchFilter,
      appliedAtISO: now.toISOString(),
      appliedBy: confirmAdjustedBy || user?.name || "ระบบ",
      source: "กรอกมือ",
      changes: pendingChanges.map((p) => ({
        oilTypeCode: p.oilTypeCode,
        oilTypeName: p.oilTypeName,
        oldPrice: p.currentPrice,
        newPrice: p.proposedPrice ?? p.currentPrice,
        effectiveDate: p.effectiveDate ?? globalEffectiveDate,
        effectiveTime: p.effectiveTime ?? globalEffectiveTime,
      })),
    });

    setOilPrices((prev) =>
      prev.map((p) => {
        if (
          p.proposedPrice == null ||
          Number.isNaN(p.proposedPrice) ||
          p.proposedPrice === p.currentPrice
        ) {
          return p;
        }

        return {
          ...p,
          currentPrice: p.proposedPrice,
          lastUpdated: nowStr,
          lastSource: "กรอกมือ",
          status: "กำลังใช้งาน",
          proposedPrice: null,
        };
      })
    );

    setShowConfirmModal(false);
  };

  const getStatusBadgeClasses = (status: PriceStatus) => {
    if (status === "กำลังใช้งาน") {
      return "bg-emerald-50 text-emerald-600 border-emerald-200";
    }
    if (status === "รอมีผล") {
      return "bg-amber-50 text-amber-600 border-amber-200";
    }
    return "bg-gray-100 text-gray-600 border-gray-200";
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

    return (
      <th
        className={`px-6 py-4 relative group ${align === "right" ? "text-right" : align === "center" ? "text-center" : ""}`}
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
                  (filterKey === "status" ? columnFilters.status : columnFilters.source) !== "ทั้งหมด"
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
                      className="absolute left-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 z-20 py-1 overflow-hidden"
                    >
                      {options.map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => {
                            if (filterKey === "status") {
                              setColumnFilters((prev) => ({ ...prev, status: opt }));
                            } else {
                              setColumnFilters((prev) => ({ ...prev, source: opt }));
                            }
                            setActiveHeaderDropdown(null);
                          }}
                          className={`w-full text-left px-4 py-2 text-xs font-bold transition-colors flex items-center justify-between ${
                            (filterKey === "status" ? columnFilters.status : columnFilters.source) === opt
                              ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400"
                              : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                          }`}
                        >
                          {opt}
                          {(filterKey === "status" ? columnFilters.status : columnFilters.source) === opt && (
                            <Check className="w-3 h-3" />
                          )}
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

  const isAnyFilterActive = useMemo(() => {
    return searchTerm !== "" || columnFilters.status !== "ทั้งหมด" || columnFilters.source !== "ทั้งหมด";
  }, [searchTerm, columnFilters]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      {/* Header */}
      <header className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
              <div className="p-2 bg-emerald-500 rounded-2xl shadow-lg shadow-emerald-500/20">
                <DollarSign className="w-8 h-8 text-white" />
              </div>
              การปรับราคาน้ำมัน
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium flex items-center gap-2">
              <Fuel className="w-4 h-4" />
              จัดการราคาขายน้ำมันตามประเภทและสาขา รองรับการนำเข้าราคาจาก ปตท. และการปรับราคาเอง
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              className="px-4 py-3 text-sm rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/40 font-bold"
            >
              <option value="ปั๊มไฮโซ">ปั๊มไฮโซ (สำนักงานใหญ่)</option>
              <option value="ดินดำ">ดินดำ</option>
              <option value="หนองจิก">หนองจิก</option>
              <option value="ตักสิลา">ตักสิลา</option>
              <option value="บายพาส">บายพาส</option>
            </select>

            <button
              type="button"
              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-bold shadow-lg shadow-emerald-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Upload className="w-5 h-5" />
              นำเข้าราคาจากไฟล์ ปตท.
            </button>

            <button
              type="button"
              onClick={() => navigate("/app/gas-station/price-adjustment-history")}
              className="px-6 py-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-2xl font-bold border border-gray-100 dark:border-gray-700 shadow-sm transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <History className="w-5 h-5" />
              ดูประวัติ
            </button>
          </div>
        </div>
      </header>

      {/* Info banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-3xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6"
      >
        <div className="flex items-start gap-3">
          <CheckCircle className="w-6 h-6 text-emerald-500 mt-0.5" />
          <div className="text-sm text-emerald-900 dark:text-emerald-100 space-y-1">
            <p className="font-bold">
              ขั้นตอนการปรับราคา: นำเข้าราคาจาก ปตท. → ตรวจสอบ/แก้ไข → ตั้งวัน-เวลามีผล → ยืนยันใช้ราคาใหม่
            </p>
            <p>
              รองรับการอัปโหลดไฟล์ราคาจากเว็บ ปตท. (PricePerLiter) และเชื่อมกับสมุด Balance Petrol, สมุดขายน้ำมัน
              และแดชบอร์ดผู้บริหารอัตโนมัติ
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-emerald-900/80 dark:text-emerald-100">
          <AlertTriangle className="w-4 h-4" />
          ตั้งวันและเวลามีผลได้ทั้งแบบ “รวม” และ “รายประเภทน้ำมัน”
        </div>
      </motion.div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl">
              <Fuel className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">ประเภทน้ำมัน</p>
              <p className="text-2xl font-black text-gray-900 dark:text-white">{summary.totalOilTypes} ประเภท</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">ในสาขา {branchFilter}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-2xl">
              <Edit3 className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">รออนุมัติ</p>
              <p className="text-2xl font-black text-gray-900 dark:text-white">{summary.changedCount} รายการ</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">แก้ไขแล้ว ยังไม่ยืนยัน</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gray-50 dark:bg-gray-900/20 rounded-2xl">
              <History className="w-6 h-6 text-gray-500" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">ราคาเฉลี่ย</p>
              <p className="text-2xl font-black text-gray-900 dark:text-white">
                {currencyFormatter.format(summary.avgCurrentPrice)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">ทุกประเภทในสาขานี้</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Global effective date/time + action */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.25 }}
        className="bg-white dark:bg-gray-800 p-4 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          <div className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
            <p className="font-bold">
              ตั้งวันและเวลาที่ “ชุดราคาใหม่” จะมีผลกับทุกประเภทน้ำมันในสาขา (ปรับรายประเภทได้ในตาราง)
            </p>
            <p>เมื่อยืนยัน ระบบจะนำชุดราคาไปใช้เป็นราคาขายใหม่ (ตัวอย่างหน้าจอ)</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="date"
                value={globalEffectiveDate}
                onChange={(e) => setGlobalEffectiveDate(e.target.value)}
                className="pl-10 pr-4 py-3 text-sm rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/40 font-medium"
              />
            </div>
            <div className="relative">
              <Clock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="time"
                value={globalEffectiveTime}
                onChange={(e) => setGlobalEffectiveTime(e.target.value)}
                className="pl-10 pr-4 py-3 text-sm rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/40 font-medium"
              />
            </div>
          </div>
          <button
            type="button"
            onClick={handleApplyAll}
            disabled={!hasPendingChanges}
            className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-bold shadow-lg shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            ยืนยันใช้ราคาใหม่ (ตามที่แก้ไข)
          </button>
        </div>
      </motion.div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="ค้นหาประเภทน้ำมัน / code (เช่น DIESEL, GASOHOL_95)..."
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
                setColumnFilters({ status: "ทั้งหมด", source: "ทั้งหมด" });
                setActiveHeaderDropdown(null);
              }}
              className="px-4 py-3 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-2xl font-bold text-sm transition-colors flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              ล้างตัวกรอง
            </button>
          )}
          <div className="flex items-center gap-2 px-4 py-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-2xl border border-emerald-100 dark:border-emerald-800/50 shrink-0">
            <Fuel className="w-4 h-4" />
            <span className="text-sm font-bold whitespace-nowrap">พบ {filteredPrices.length} รายการ</span>
          </div>
        </div>
      </div>

      {/* Table of prices */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden"
      >
        <div className="border-b border-gray-200 dark:border-gray-700 p-6">
          <div>
            <h2 className="text-xl font-black text-gray-800 dark:text-white">ตารางปรับราคาน้ำมัน – {branchFilter}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              แก้ไข “ราคาขายใหม่” และถ้าต้องการกำหนดวัน-เวลามีผลรายประเภท ให้ปรับในคอลัมน์ “วันที่/เวลาเริ่มใช้”
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-gray-900/50 text-[10px] uppercase tracking-widest font-black text-gray-400">
                <HeaderWithFilter label="ประเภทน้ำมัน" columnKey="oilTypeName" />
                <HeaderWithFilter label="ราคาปัจจุบัน (บาท/ลิตร)" columnKey="currentPrice" align="right" />
                <HeaderWithFilter label="ราคาขายใหม่ (บาท/ลิตร)" columnKey="proposedPrice" align="right" />
                <HeaderWithFilter label="วันที่/เวลาเริ่มใช้" columnKey="effectiveDate" />
                <HeaderWithFilter label="แหล่งที่มา / ล่าสุดแก้ไข" filterKey="source" options={filterOptions.source} />
                <HeaderWithFilter
                  label="สถานะ"
                  columnKey="status"
                  filterKey="status"
                  options={filterOptions.status}
                  align="center"
                />
              </tr>
            </thead>
            <tbody>
              {filteredPrices.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="py-12 px-6 text-center text-sm text-gray-500 dark:text-gray-400"
                  >
                    ยังไม่มีการตั้งราคาน้ำมันสำหรับสาขานี้
                  </td>
                </tr>
              )}
              {filteredPrices.map((price, index) => {
                const hasChange =
                  price.proposedPrice != null &&
                  !Number.isNaN(price.proposedPrice) &&
                  price.proposedPrice !== price.currentPrice;

                const diff =
                  price.proposedPrice != null && !Number.isNaN(price.proposedPrice)
                    ? price.proposedPrice - price.currentPrice
                    : 0;

                return (
                  <motion.tr
                    key={price.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.25, delay: index * 0.03 }}
                    className={`border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                      index % 2 === 0 ? "bg-white dark:bg-gray-800" : "bg-gray-50/50 dark:bg-gray-900/30"
                    } ${hasChange ? "ring-1 ring-emerald-200/60 dark:ring-emerald-700/40" : ""}`}
                  >
                    <td className="py-4 px-6 align-top">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-50 dark:bg-gray-900/30 rounded-2xl">
                          <Fuel className="w-4 h-4 text-gray-500" />
                        </div>
                        <div>
                          <p className="text-sm font-black text-gray-900 dark:text-white">{price.oilTypeName}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{price.oilTypeCode}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right align-top">
                      <p className="text-sm font-bold text-gray-800 dark:text-gray-100">
                        {currencyFormatter.format(price.currentPrice)}
                      </p>
                    </td>
                    <td className="py-4 px-6 text-right align-top">
                      <div className="flex flex-col items-end gap-1">
                        <input
                          type="number"
                          step="0.01"
                          value={
                            price.proposedPrice != null && !Number.isNaN(price.proposedPrice)
                              ? price.proposedPrice
                              : ""
                          }
                          onChange={(e) => handleChangeProposedPrice(price.id, e.target.value)}
                          className={`w-32 px-4 py-3 text-sm rounded-2xl border ${
                            hasChange ? "border-emerald-300/60 dark:border-emerald-700/60" : "border-gray-200 dark:border-gray-700"
                          } bg-white dark:bg-gray-800 text-right text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/40 font-medium`}
                          placeholder={price.currentPrice.toFixed(2)}
                        />
                        {hasChange && (
                          <p
                            className={`text-xs font-bold ${
                              diff > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                            }`}
                          >
                            {diff > 0 ? "+" : ""}
                            {diff.toFixed(2)} บาท
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6 align-top">
                      <div className="flex flex-col sm:flex-row gap-2 text-sm">
                        <div className="relative">
                          <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="date"
                            value={price.effectiveDate ?? globalEffectiveDate}
                            onChange={(e) => handleChangeEffectiveDate(price.id, e.target.value)}
                            className="pl-10 pr-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/40 font-medium"
                          />
                        </div>
                        <div className="relative">
                          <Clock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="time"
                            value={price.effectiveTime ?? globalEffectiveTime}
                            onChange={(e) => handleChangeEffectiveTime(price.id, e.target.value)}
                            className="pl-10 pr-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/40 font-medium"
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 align-top text-sm text-gray-600 dark:text-gray-300">
                      <p className="font-medium">
                        แหล่งที่มา:{" "}
                        <span className="font-black text-gray-800 dark:text-gray-100">
                          {price.lastSource === "ไฟล์ ปตท."
                            ? "ไฟล์ราคาจาก ปตท."
                            : price.lastSource === "กรอกมือ"
                              ? "ปรับเอง (Manual)"
                              : "API/ระบบอัตโนมัติ"}
                        </span>
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">
                        แก้ไขล่าสุด: {price.lastUpdated}
                      </p>
                    </td>
                    <td className="py-4 px-6 align-top text-center">
                      <span className={"inline-flex px-3 py-1 rounded-full border text-xs font-bold " + getStatusBadgeClasses(price.status)}>
                        {price.status}
                      </span>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Confirm modal */}
      {showConfirmModal && hasPendingChanges && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden"
          >
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-amber-500 rounded-2xl shadow-lg shadow-amber-500/20">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-gray-900 dark:text-white">
                    ยืนยันใช้ราคาน้ำมันชุดใหม่ในสาขา {branchFilter}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                    ตรวจสอบรายการที่เปลี่ยนแปลงก่อนยืนยัน
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all duration-200 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:scale-110 active:scale-95"
                aria-label="ปิด"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 py-6 bg-gray-50 dark:bg-gray-900/50">
              <div className="max-h-72 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-2xl mb-4 bg-white dark:bg-gray-800">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="text-left py-3 px-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
                      ประเภทน้ำมัน
                    </th>
                    <th className="text-right py-3 px-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
                      เดิม
                    </th>
                    <th className="text-right py-3 px-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
                      ใหม่
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pendingChanges.map((p) => (
                    <tr
                      key={p.id}
                      className="border-b border-gray-200 dark:border-gray-700 last:border-b-0"
                    >
                      <td className="py-3 px-4">
                        <span className="font-black text-gray-800 dark:text-gray-100">
                          {p.oilTypeName}
                        </span>
                        <span className="block text-xs text-gray-500 dark:text-gray-400 font-medium">
                          {p.oilTypeCode}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-gray-700 dark:text-gray-200 font-bold">
                        {currencyFormatter.format(p.currentPrice)}
                      </td>
                      <td className="py-3 px-4 text-right font-black text-emerald-600 dark:text-emerald-400">
                        {currencyFormatter.format(p.proposedPrice ?? p.currentPrice)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 font-medium">
                วัน-เวลามีผลเริ่มต้นที่{" "}
                <span className="font-black text-gray-800 dark:text-gray-100">
                  {globalEffectiveDate} {globalEffectiveTime}
                </span>{" "}
                (สามารถปรับรายประเภทได้ในตารางหลัก)
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    ผู้ปรับราคา / ผู้ยืนยัน
                  </label>
                  <select
                    value={confirmAdjustedBy}
                    onChange={(e) => setConfirmAdjustedBy(e.target.value)}
                    className="w-full px-4 py-3 text-sm rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/40 font-bold"
                  >
                    <option value="">-- เลือกพนักงาน --</option>
                    {employeeOptions.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 font-medium">
                    * ชื่อนี้จะถูกบันทึกใน “ประวัติการปรับราคา”
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-all duration-200 font-bold hover:bg-gray-100 dark:hover:bg-gray-700 rounded-2xl"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={applyConfirmedChanges}
                disabled={!confirmAdjustedBy}
                className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-bold shadow-lg shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                ยืนยันใช้ราคาน้ำมันชุดใหม่
              </button>
            </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
