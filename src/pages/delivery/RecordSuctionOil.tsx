import { useMemo, useState } from "react";
import { Droplet, Plus, Search, X, Filter, ChevronUp, ChevronDown, ChevronsUpDown, Check, FileText, MapPin, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useGasStation } from "@/contexts/GasStationContext";
import { useBranch } from "@/contexts/BranchContext";
import type { OilType } from "@/types/gasStation";

type SuctionMode = "sell" | "clean";

type SuctionLog = {
  id: string;
  createdAt: string;
  mode: SuctionMode; // sell = ดูดขึ้นมาขาย, clean = ดูดเพื่อล้างถัง
  branchId: number;
  branchName: string;
  tankNumber?: number;
  oilType: OilType;
  quantity: number;
  notes?: string;
};

type RecoveredOilItem = {
  id: string;
  createdAt: string;
  fromBranchId: number;
  fromBranchName: string;
  tankNumber?: number;
  oilType: OilType;
  quantityAvailable: number;
  notes?: string;
};

const SUCTION_LOG_STORAGE_KEY = "ptt.delivery.suctionLogs.v1";
const RECOVERED_STORAGE_KEY = "ptt.delivery.recoveredOil.v1"; // shared with InternalPumpSales

function safeParseJson<T>(raw: string | null, fallback: T): T {
  try {
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    if (typeof window === "undefined") return fallback;
    return safeParseJson<T>(window.localStorage.getItem(key), fallback);
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, value: T) {
  try {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

const numberFormatter = new Intl.NumberFormat("th-TH", { maximumFractionDigits: 0 });

function ModeBadge({ mode }: { mode: SuctionMode }) {
  const cls =
    mode === "sell"
      ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
      : "bg-yellow-500/15 text-yellow-300 border-yellow-500/30";
  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold border ${cls}`}>
      {mode === "sell" ? "ดูดขึ้นมาขาย" : "ดูดเพื่อล้างถัง"}
    </span>
  );
}

export default function RecordSuctionOil() {
  const { branches, getBranchById } = useGasStation();
  const { selectedBranches } = useBranch();
  const selectedBranchIds = useMemo(() => selectedBranches.map(id => Number(id)), [selectedBranches]);

  const [logs, setLogs] = useState<SuctionLog[]>(() =>
    loadFromStorage<SuctionLog[]>(SUCTION_LOG_STORAGE_KEY, [
      {
        id: "SUC-001",
        createdAt: "2024-12-16T09:10:00+07:00",
        mode: "sell",
        branchId: 1,
        branchName: "ปั๊มไฮโซ",
        tankNumber: 5,
        oilType: "Diesel",
        quantity: 1200,
        notes: "ดูดขึ้นมาจากหลุมผิด (ตัวอย่าง)",
      },
      {
        id: "SUC-002",
        createdAt: "2024-12-16T09:40:00+07:00",
        mode: "clean",
        branchId: 2,
        branchName: "ดินดำ",
        tankNumber: 2,
        oilType: "Gasohol 95",
        quantity: 300,
        notes: "ดูดเพื่อล้างถังหลังซ่อมปั๊ม (ตัวอย่าง)",
      },
    ])
  );

  const [search, setSearch] = useState("");
  const [columnFilters, setColumnFilters] = useState<{
    mode: string;
    branch: string;
    oilType: string;
  }>({
    mode: "ทั้งหมด",
    branch: "ทั้งหมด",
    oilType: "ทั้งหมด"
  });
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' | null }>({ key: 'createdAt', direction: 'desc' });
  const [filterDateFrom, setFilterDateFrom] = useState<string>("");
  const [filterDateTo, setFilterDateTo] = useState<string>("");
  const [addOpen, setAddOpen] = useState(false);

  const [mode, setMode] = useState<SuctionMode>("sell");
  const [branchId, setBranchId] = useState<number>(branches[0]?.id || 1);
  const [tankNumber, setTankNumber] = useState<string>("");
  const [oilType, setOilType] = useState<OilType>("Diesel");
  const [quantity, setQuantity] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  const handleSort = (key: string) => {
    setSortConfig(prev => {
      if (prev.key === key) {
        if (prev.direction === 'asc') return { key, direction: 'desc' };
        if (prev.direction === 'desc') return { key, direction: null };
        return { key, direction: 'asc' };
      }
      return { key, direction: 'asc' };
    });
  };

  const getSortIcon = (key: string) => {
    if (sortConfig.key !== key || !sortConfig.direction) return <ChevronsUpDown className="w-3 h-3 opacity-30" />;
    return sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3 text-emerald-500" /> : <ChevronDown className="w-3 h-3 text-emerald-500" />;
  };

  const filterOptions = useMemo(() => {
    return {
      mode: ["ทั้งหมด", "ดูดขึ้นมาขาย", "ดูดเพื่อล้างถัง"],
      branch: ["ทั้งหมด", ...new Set(logs.map(l => l.branchName))],
      oilType: ["ทั้งหมด", ...new Set(logs.map(l => l.oilType))]
    };
  }, [logs]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let result = logs.filter((l) => {
      const matchSearch = !q ||
        l.branchName.toLowerCase().includes(q) ||
        l.oilType.toLowerCase().includes(q) ||
        (l.notes || "").toLowerCase().includes(q) ||
        `${l.tankNumber || ""}`.includes(q) ||
        (l.mode === "sell" ? "ขาย" : "ล้าง").includes(q);

      const matchBranch = selectedBranchIds.length === 0 || selectedBranchIds.includes(l.branchId);

      // Column Filters
      const matchesMode = columnFilters.mode === "ทั้งหมด" || 
                         (columnFilters.mode === "ดูดขึ้นมาขาย" && l.mode === "sell") ||
                         (columnFilters.mode === "ดูดเพื่อล้างถัง" && l.mode === "clean");
      const matchesBranchFilter = columnFilters.branch === "ทั้งหมด" || l.branchName === columnFilters.branch;
      const matchesOilType = columnFilters.oilType === "ทั้งหมด" || l.oilType === columnFilters.oilType;

      const createdAt = new Date(l.createdAt);
      const matchesDate = (!filterDateFrom || createdAt >= new Date(filterDateFrom)) && 
                          (!filterDateTo || createdAt <= new Date(filterDateTo));

      return matchSearch && matchBranch && matchesMode && matchesBranchFilter && matchesOilType && matchesDate;
    });

    if (sortConfig.key && sortConfig.direction) {
      result.sort((a, b) => {
        let aValue: any;
        let bValue: any;

        switch (sortConfig.key) {
          case 'createdAt':
            aValue = new Date(a.createdAt).getTime();
            bValue = new Date(b.createdAt).getTime();
            break;
          case 'quantity':
            aValue = a.quantity;
            bValue = b.quantity;
            break;
          default:
            aValue = (a as any)[sortConfig.key];
            bValue = (b as any)[sortConfig.key];
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    } else {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return result;
  }, [logs, search, selectedBranchIds, columnFilters, filterDateFrom, filterDateTo, sortConfig]);

  const HeaderWithFilter = ({ label, columnKey, filterKey, options }: { 
    label: string, 
    columnKey?: string, 
    filterKey?: keyof typeof columnFilters, 
    options?: string[] 
  }) => (
    <th className="px-6 py-4 relative group">
      <div className="flex items-center gap-2">
        <div 
          className={`flex items-center gap-1.5 cursor-pointer hover:text-gray-900 dark:hover:text-white transition-colors ${sortConfig.key === columnKey ? 'text-emerald-600' : ''}`}
          onClick={() => columnKey && handleSort(columnKey)}
        >
          {label}
          {columnKey && getSortIcon(columnKey)}
        </div>
        
        {filterKey && options && (
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveDropdown(activeDropdown === filterKey ? null : filterKey);
              }}
              className={`p-1 rounded-md transition-all ${columnFilters[filterKey] !== "ทั้งหมด" ? "bg-emerald-500 text-white shadow-sm" : "hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400"}`}
            >
              <Filter className="w-3 h-3" />
            </button>
            
            <AnimatePresence>
              {activeDropdown === filterKey && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setActiveDropdown(null)} 
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
                        onClick={() => {
                          setColumnFilters(prev => ({ ...prev, [filterKey]: opt }));
                          setActiveDropdown(null);
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

  const isAnyFilterActive = useMemo(() => {
    return columnFilters.mode !== "ทั้งหมด" || 
           columnFilters.branch !== "ทั้งหมด" ||
           columnFilters.oilType !== "ทั้งหมด" ||
           filterDateFrom !== "" ||
           filterDateTo !== "";
  }, [columnFilters, filterDateFrom, filterDateTo]);

  const clearFilters = () => {
    setColumnFilters({
      mode: "ทั้งหมด",
      branch: "ทั้งหมด",
      oilType: "ทั้งหมด"
    });
    setSearch("");
    setFilterDateFrom("");
    setFilterDateTo("");
  };

  const summary = useMemo(() => {
    const sellLiters = filtered.filter((x) => x.mode === "sell").reduce((s, x) => s + x.quantity, 0);
    const cleanLiters = filtered.filter((x) => x.mode === "clean").reduce((s, x) => s + x.quantity, 0);
    return { sellLiters, cleanLiters, count: filtered.length };
  }, [filtered]);

  const openAdd = () => {
    setMode("sell");
    setBranchId(branches[0]?.id || 1);
    setTankNumber("");
    setOilType("Diesel");
    setQuantity("");
    setNotes("");
    setAddOpen(true);
  };

  const saveLog = () => {
    const b = getBranchById(branchId);
    if (!b) {
      alert("ไม่พบข้อมูลสาขา");
      return;
    }
    const qty = parseFloat(quantity);
    if (!Number.isFinite(qty) || qty <= 0) {
      alert("กรุณากรอกจำนวนลิตรให้ถูกต้อง");
      return;
    }

    const tankNo = tankNumber.trim() ? parseInt(tankNumber.trim(), 10) : undefined;
    const log: SuctionLog = {
      id: `SUC-${Date.now()}`,
      createdAt: new Date().toISOString(),
      mode,
      branchId: b.id,
      branchName: b.name,
      tankNumber: Number.isFinite(tankNo as number) ? tankNo : undefined,
      oilType,
      quantity: qty,
      notes: notes.trim() || undefined,
    };

    setLogs((prev) => {
      const next = [log, ...prev];
      saveToStorage(SUCTION_LOG_STORAGE_KEY, next);
      return next;
    });

    // If "ดูดขึ้นมาขาย" => add into recovered inventory for InternalPumpSales
    if (mode === "sell") {
      const recovered = loadFromStorage<RecoveredOilItem[]>(RECOVERED_STORAGE_KEY, []);
      const newItem: RecoveredOilItem = {
        id: `RCV-${Date.now()}`,
        createdAt: log.createdAt,
        fromBranchId: b.id,
        fromBranchName: b.name,
        tankNumber: log.tankNumber,
        oilType: log.oilType,
        quantityAvailable: log.quantity,
        notes: log.notes ? `ดูดขึ้นมาขาย: ${log.notes}` : "ดูดขึ้นมาขาย",
      };
      const nextRecovered = [newItem, ...recovered];
      saveToStorage(RECOVERED_STORAGE_KEY, nextRecovered);
    }

    alert(mode === "sell" ? "บันทึกการดูดขึ้นมาขายแล้ว (เพิ่มเข้าสต็อกขาย)" : "บันทึกการดูดเพื่อล้างถังแล้ว");
    setAddOpen(false);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200 dark:shadow-none">
            <Droplet className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">บันทึกการดูดน้ำมัน</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">มี 2 แบบ: ดูดขึ้นมาขาย (จะเพิ่มเข้าสต็อกขาย) และ ดูดเพื่อล้างถัง (บันทึกประวัติ)</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white/50 dark:bg-gray-800/50 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm backdrop-blur-sm">
          <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            สาขาที่กำลังดู: {selectedBranches.length === 0 ? "ทั้งหมด" : selectedBranches.map(id => branches.find(b => String(b.id) === id)?.name || id).join(", ")}
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl">
              <FileText className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">รายการทั้งหมด</p>
              <p className="text-2xl font-black text-gray-900 dark:text-white">{summary.count.toLocaleString()} รายการ</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl">
              <Droplet className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">ดูดขึ้นมาขาย</p>
              <p className="text-2xl font-black text-gray-900 dark:text-white">{numberFormatter.format(summary.sellLiters)} ลิตร</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-2xl">
              <Droplet className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">ดูดล้างถัง</p>
              <p className="text-2xl font-black text-gray-900 dark:text-white">{numberFormatter.format(summary.cleanLiters)} ลิตร</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="ค้นหา: สาขา / หลุม / ชนิดน้ำมัน / หมายเหตุ / ขาย / ล้าง"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900 dark:text-white font-medium"
          />
        </div>
        <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 dark:bg-gray-900 rounded-2xl font-bold text-sm">
          <input type="date" value={filterDateFrom} onChange={e => setFilterDateFrom(e.target.value)} className="bg-transparent outline-none" />
          <span className="text-gray-400">-</span>
          <input type="date" value={filterDateTo} onChange={e => setFilterDateTo(e.target.value)} className="bg-transparent outline-none" />
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          {isAnyFilterActive && (
            <button
              onClick={clearFilters}
              className="px-4 py-3 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-2xl font-bold text-sm transition-colors flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              ล้างตัวกรอง
            </button>
          )}
          <div className="flex items-center gap-2 px-4 py-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-2xl border border-emerald-100 dark:border-emerald-800/50 shrink-0">
            <MapPin className="w-4 h-4" />
            <span className="text-sm font-bold whitespace-nowrap">
              {selectedBranchIds.length === 0 ? "ทุกสาขา" : `สาขาที่เลือก (${selectedBranchIds.length})`}
            </span>
          </div>
        </div>
        <button
          onClick={openAdd}
          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black shadow-lg shadow-emerald-600/20 transition-all active:scale-95 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          เพิ่มรายการดูดน้ำมัน
        </button>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-gray-900/50 text-[10px] uppercase tracking-widest font-black text-gray-400">
                <HeaderWithFilter label="เวลา" columnKey="createdAt" />
                <HeaderWithFilter label="ประเภท" columnKey="mode" filterKey="mode" options={filterOptions.mode} />
                <HeaderWithFilter label="สาขา" columnKey="branchName" filterKey="branch" options={filterOptions.branch} />
                <th className="px-6 py-4">หลุม</th>
                <HeaderWithFilter label="ชนิดน้ำมัน" columnKey="oilType" filterKey="oilType" options={filterOptions.oilType} />
                <th className="px-6 py-4 text-right cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" onClick={() => handleSort('quantity')}>
                  <div className="flex items-center justify-end gap-2">จำนวน (ลิตร) {getSortIcon('quantity')}</div>
                </th>
                <th className="px-6 py-4">หมายเหตุ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700 font-medium">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                    <div className="flex flex-col items-center gap-2">
                      <FileText className="w-12 h-12 text-gray-300" />
                      <p className="text-sm font-bold">ไม่พบรายการ</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((l) => (
                  <tr key={l.id} className="group hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-900 dark:text-white">
                          {new Date(l.createdAt).toLocaleDateString('th-TH')}
                        </span>
                        <span className="text-[10px] text-gray-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(l.createdAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <ModeBadge mode={l.mode} />
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-700 dark:text-gray-300">{l.branchName}</td>
                    <td className="px-6 py-4 font-bold text-gray-700 dark:text-gray-300">{l.tankNumber ?? "-"}</td>
                    <td className="px-6 py-4 font-bold text-gray-700 dark:text-gray-300">{l.oilType}</td>
                    <td className="px-6 py-4 text-right font-bold text-gray-900 dark:text-white">
                      {numberFormatter.format(l.quantity)}
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{l.notes || "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {addOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-emerald-50 dark:bg-emerald-900/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500 rounded-xl">
                    <Plus className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-emerald-800 dark:text-emerald-400">เพิ่มรายการดูดน้ำมัน</h2>
                    <p className="text-xs text-emerald-600 dark:text-emerald-500 font-bold">ถ้าเลือก "ดูดขึ้นมาขาย" ระบบจะเพิ่มเข้าสต็อกขายในหน้า "ขายน้ำมันภายในปั๊ม"</p>
                  </div>
                </div>
                <button
                  onClick={() => setAddOpen(false)}
                  className="p-2 hover:bg-white dark:hover:bg-gray-700 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">ประเภทการดูด</label>
                    <select
                      value={mode}
                      onChange={(e) => setMode(e.target.value as SuctionMode)}
                      className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl font-bold text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                    >
                      <option value="sell">ดูดขึ้นมาขาย</option>
                      <option value="clean">ดูดเพื่อล้างถัง</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">สาขา</label>
                    <select
                      value={branchId}
                      onChange={(e) => setBranchId(parseInt(e.target.value, 10))}
                      className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl font-bold text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                    >
                      {branches.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">เลขหลุม (ถ้ามี)</label>
                    <input
                      value={tankNumber}
                      onChange={(e) => setTankNumber(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl font-bold text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                      placeholder="เช่น 5"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">ชนิดน้ำมัน</label>
                    <select
                      value={oilType}
                      onChange={(e) => setOilType(e.target.value as OilType)}
                      className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl font-bold text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                    >
                      <option value="Premium Diesel">Premium Diesel</option>
                      <option value="Diesel">Diesel</option>
                      <option value="Premium Gasohol 95">Premium Gasohol 95</option>
                      <option value="Gasohol 95">Gasohol 95</option>
                      <option value="Gasohol 91">Gasohol 91</option>
                      <option value="E20">E20</option>
                      <option value="E85">E85</option>
                      <option value="Gasohol E20">Gasohol E20</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">จำนวนลิตร</label>
                    <input
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl font-bold text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                      placeholder="เช่น 300"
                    />
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">หมายเหตุ</label>
                    <input
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl font-bold text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                      placeholder="เช่น ดูดล้างถัง / ดูดจากหลุมผิด"
                    />
                  </div>
                </div>
              </div>

              <div className="p-6 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3 sticky bottom-0 z-10">
                <button
                  onClick={() => setAddOpen(false)}
                  className="px-10 py-3 bg-gray-900 dark:bg-gray-700 hover:bg-black dark:hover:bg-gray-600 text-white rounded-2xl font-black transition-all shadow-lg active:scale-95"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={saveLog}
                  className="px-10 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black transition-all shadow-lg shadow-emerald-600/20 active:scale-95 flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  บันทึก
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}


