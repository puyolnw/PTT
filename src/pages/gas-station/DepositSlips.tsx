import { motion, AnimatePresence } from "framer-motion";
import React, { useMemo, useState } from "react";
import {
  FileCheck,
  FileText,
  Search,
  Filter,
  Check,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  RefreshCw,
  ScanLine,
  User,
  Calendar,
  ArrowRight,
  Clock,
  Plus,
  X,
  Info,
  Receipt,
  MoreVertical,
  CreditCard,
} from "lucide-react";

type CouponStatus = "ใช้งานอยู่" | "หมดอายุ" | "ใช้ครบแล้ว";

type DepositSlip = {
  id: string;
  slipNo: string;
  customerName: string;
  branch: string;
  amount: number;
  balance: number;
  issueDate: string;
  expiryDate: string;
  status: CouponStatus;
  lastAction: string;
};

const currencyFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 0,
});

const addMonths = (date: Date, months: number) => {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
};

const formatDate = (date: Date) => date.toISOString().split("T")[0];

const initialSlips: DepositSlip[] = [
  {
    id: "DS-20241215-001",
    slipNo: "DS-20241215-001",
    customerName: "บริษัท ขนส่ง A",
    branch: "ปั๊มไฮโซ",
    amount: 1000,
    balance: 1000,
    issueDate: "2024-12-15",
    expiryDate: formatDate(addMonths(new Date("2024-12-15"), 6)),
    status: "ใช้งานอยู่",
    lastAction: "ออกใบฝากครั้งแรก",
  },
  {
    id: "DS-20241201-002",
    slipNo: "DS-20241201-002",
    customerName: "ลูกค้าเงินสด B",
    branch: "ดินดำ",
    amount: 1000,
    balance: 200,
    issueDate: "2024-12-01",
    expiryDate: formatDate(addMonths(new Date("2024-12-01"), 6)),
    status: "ใช้งานอยู่",
    lastAction: "ใช้คูปอง 800 บาท ฝากต่อ 200 บาท",
  },
];

export default function DepositSlips() {
  const [slips, setSlips] = useState<DepositSlip[]>(initialSlips);

  const [searchTerm, setSearchTerm] = useState("");
  const [columnFilters, setColumnFilters] = useState<{
    branch: string;
    status: string;
  }>({
    branch: "ทั้งหมด",
    status: "ทั้งหมด",
  });

  type FilterKey = "branch" | "status";
  type SortKey =
    | "slipNo"
    | "customerName"
    | "branch"
    | "amount"
    | "balance"
    | "issueDate"
    | "expiryDate"
    | "status";

  const [activeHeaderDropdown, setActiveHeaderDropdown] = useState<FilterKey | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: "asc" | "desc" | null }>({
    key: "issueDate",
    direction: "desc",
  });

  // ฟอร์มออกใบฝากใหม่
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [branch, setBranch] = useState("ปั๊มไฮโซ");
  const [amount, setAmount] = useState<number | "">("");
  const [issueDate, setIssueDate] = useState(formatDate(new Date()));

  // Modal ใช้คูปอง
  const [activeSlip, setActiveSlip] = useState<DepositSlip | null>(null);
  const [useAmount, setUseAmount] = useState<number | "">("");


  // Dropdown menu state
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; right: number } | null>(null);

  const expiryDateForForm = useMemo(
    () => formatDate(addMonths(new Date(issueDate), 6)),
    [issueDate]
  );

  const filterOptions = useMemo(() => {
    return {
      branch: ["ทั้งหมด", ...new Set(slips.map((s) => s.branch))],
      status: ["ทั้งหมด", ...new Set(slips.map((s) => s.status))],
    };
  }, [slips]);

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

  const filteredSlips = useMemo(() => {
    let result = slips.filter((slip) => {
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        slip.slipNo.toLowerCase().includes(term) ||
        slip.customerName.toLowerCase().includes(term) ||
        slip.branch.toLowerCase().includes(term);

      const matchesBranch = columnFilters.branch === "ทั้งหมด" || slip.branch === columnFilters.branch;
      const matchesStatus = columnFilters.status === "ทั้งหมด" || slip.status === (columnFilters.status as CouponStatus);

      return matchesSearch && matchesBranch && matchesStatus;
    });

    // Sorting (optional)
    if (sortConfig.key && sortConfig.direction) {
      result = [...result].sort((a, b) => {
        let aValue: string | number;
        let bValue: string | number;

        switch (sortConfig.key) {
          case "slipNo":
            aValue = a.slipNo;
            bValue = b.slipNo;
            break;
          case "customerName":
            aValue = a.customerName;
            bValue = b.customerName;
            break;
          case "branch":
            aValue = a.branch;
            bValue = b.branch;
            break;
          case "amount":
            aValue = a.amount;
            bValue = b.amount;
            break;
          case "balance":
            aValue = a.balance;
            bValue = b.balance;
            break;
          case "issueDate":
            aValue = new Date(a.issueDate).getTime();
            bValue = new Date(b.issueDate).getTime();
            break;
          case "expiryDate":
            aValue = new Date(a.expiryDate).getTime();
            bValue = new Date(b.expiryDate).getTime();
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
    }

    return result;
  }, [slips, searchTerm, columnFilters, sortConfig]);

  const activeDropdownSlip = useMemo(
    () => filteredSlips.find(s => s.id === openDropdownId),
    [filteredSlips, openDropdownId]
  );

  const handleCreateSlip = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !branch || !amount || amount <= 0) return;

    const newSlipNo = `DS-${issueDate.replace(/-/g, "")}-${(slips.length + 1)
      .toString()
      .padStart(3, "0")}`;

    const newSlip: DepositSlip = {
      id: newSlipNo,
      slipNo: newSlipNo,
      customerName,
      branch,
      amount: Number(amount),
      balance: Number(amount),
      issueDate,
      expiryDate: expiryDateForForm,
      status: "ใช้งานอยู่",
      lastAction: "ออกใบฝากครั้งแรก",
    };

    setSlips((prev) => [newSlip, ...prev]);
    setCustomerName("");
    setAmount("");
    setIssueDate(formatDate(new Date()));
    setShowCreateModal(false);
  };

  const openCreateModal = () => {
    setShowCreateModal(true);
    setCustomerName("");
    setAmount("");
    setIssueDate(formatDate(new Date()));
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
    setCustomerName("");
    setAmount("");
    setIssueDate(formatDate(new Date()));
  };

  const handleRenew = (slipId: string) => {
    setSlips((prev) => {
      const oldSlip = prev.find((s) => s.id === slipId);
      if (!oldSlip) return prev;

      // สร้างใบฝากใหม่
      const renewDate = formatDate(new Date());
      // นับจำนวนใบที่ออกในวันเดียวกันเพื่อสร้างเลขที่ใหม่
      const sameDaySlips = prev.filter(
        (s) => s.issueDate === renewDate && s.slipNo.startsWith(`DS-${renewDate.replace(/-/g, "")}`)
      );
      const sequenceNumber = (sameDaySlips.length + 1).toString().padStart(3, "0");
      const newSlipNo = `DS-${renewDate.replace(/-/g, "")}-${sequenceNumber}`;
      const newExpiryDate = formatDate(addMonths(new Date(), 6));

      const newSlip: DepositSlip = {
        id: newSlipNo,
        slipNo: newSlipNo,
        customerName: oldSlip.customerName,
        branch: oldSlip.branch,
        amount: oldSlip.amount,
        balance: oldSlip.balance,
        issueDate: renewDate,
        expiryDate: newExpiryDate,
        status: "ใช้งานอยู่",
        lastAction: `ต่ออายุจากใบเก่า ${oldSlip.slipNo}`,
      };

      // ลบใบเก่าและเพิ่มใบใหม่
      return [newSlip, ...prev.filter((s) => s.id !== slipId)];
    });
  };

  const openUseModal = (slip: DepositSlip) => {
    setActiveSlip(slip);
    setUseAmount("");
  };


  const handleUseCoupon = () => {
    if (!activeSlip || useAmount === "" || useAmount <= 0) return;
    const useValue = Number(useAmount);
    if (useValue > activeSlip.balance) return;

    setSlips((prev) =>
      prev.map((slip) => {
        if (slip.id !== activeSlip.id) return slip;
        const newBalance = slip.balance - useValue;
        if (newBalance <= 0) {
          return {
            ...slip,
            balance: 0,
            status: "ใช้ครบแล้ว",
            lastAction: `ใช้คูปองครบ ${currencyFormatter.format(slip.amount)} แล้ว`,
          };
        }

        return {
          ...slip,
          balance: newBalance,
          status: "ใช้งานอยู่",
          lastAction: `ใช้คูปอง ${currencyFormatter.format(useValue)} เหลือ ${currencyFormatter.format(newBalance)}`,
        };
      })
    );

    setActiveSlip(null);
    setUseAmount("");
  };

  const closeModal = () => {
    setActiveSlip(null);
    setUseAmount("");
  };


  const now = useMemo(() => new Date(), []);

  const summary = useMemo(() => {
    const totalActive = slips.filter((s) => s.status === "ใช้งานอยู่");
    const totalExpired = slips.filter((s) => s.status === "หมดอายุ");
    const totalUsed = slips.filter((s) => s.status === "ใช้ครบแล้ว");
    const expiringSoon = slips.filter((s) => {
      const d = new Date(s.expiryDate);
      const diffDays = (d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      return diffDays >= 0 && diffDays <= 30 && s.status === "ใช้งานอยู่";
    });

    return {
      totalActiveCount: totalActive.length,
      totalActiveBalance: totalActive.reduce((sum, s) => sum + s.balance, 0),
      expiringSoonCount: expiringSoon.length,
      expiredCount: totalExpired.length,
      usedCount: totalUsed.length,
    };
  }, [slips, now]);

  const getStatusBadgeClasses = (status: CouponStatus) => {
    if (status === "ใช้งานอยู่") {
      return "bg-emerald-50 text-emerald-600 border-emerald-200";
    }
    if (status === "หมดอายุ") {
      return "bg-orange-50 text-orange-600 border-orange-200";
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
                  (filterKey === "branch" ? columnFilters.branch : columnFilters.status) !== "ทั้งหมด"
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
                            if (filterKey === "branch") {
                              setColumnFilters((prev) => ({ ...prev, branch: opt }));
                            } else {
                              setColumnFilters((prev) => ({ ...prev, status: opt }));
                            }
                            setActiveHeaderDropdown(null);
                          }}
                          className={`w-full text-left px-4 py-2 text-xs font-bold transition-colors flex items-center justify-between ${
                            (filterKey === "branch" ? columnFilters.branch : columnFilters.status) === opt
                              ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400"
                              : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                          }`}
                        >
                          {opt}
                          {(filterKey === "branch" ? columnFilters.branch : columnFilters.status) === opt && (
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
    return (
      searchTerm !== "" ||
      columnFilters.branch !== "ทั้งหมด" ||
      columnFilters.status !== "ทั้งหมด"
    );
  }, [searchTerm, columnFilters]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      {/* Header */}
      <header className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
              <div className="p-2 bg-emerald-500 rounded-2xl shadow-lg shadow-emerald-500/20">
                <Receipt className="w-8 h-8 text-white" />
              </div>
          การจัดการใบฝากคูปองน้ำมัน
        </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium flex items-center gap-2">
              <FileCheck className="w-4 h-4" />
          ออกใบฝากคูปองให้ลูกค้า ต่ออายุใบคูปอง และฝากต่อจากยอดคงเหลือ (อายุใบคูปอง 6 เดือน)
        </p>
          </div>
        <div className="flex items-center gap-3">
            <button
              onClick={openCreateModal}
              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-bold shadow-lg shadow-emerald-500/20 transition-all active:scale-95 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              ออกใบฝากใหม่
            </button>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl">
            <FileCheck className="w-6 h-6 text-emerald-500" />
          </div>
          <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">ใช้งานอยู่</p>
              <p className="text-2xl font-black text-gray-900 dark:text-white">{summary.totalActiveCount} ใบ</p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                มูลค่า {currencyFormatter.format(summary.totalActiveBalance)}
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
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-2xl">
              <Clock className="w-6 h-6 text-amber-500" />
          </div>
          <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">ใกล้หมดอายุ</p>
              <p className="text-2xl font-black text-gray-900 dark:text-white">{summary.expiringSoonCount} ใบ</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">ภายใน 30 วัน</p>
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
            <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-2xl">
            <FileText className="w-6 h-6 text-red-500" />
          </div>
          <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">หมดอายุแล้ว</p>
              <p className="text-2xl font-black text-gray-900 dark:text-white">{summary.expiredCount} ใบ</p>
          </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gray-50 dark:bg-gray-900/20 rounded-2xl">
              <User className="w-6 h-6 text-gray-500" />
            </div>
              <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">ใช้ครบแล้ว</p>
              <p className="text-2xl font-black text-gray-900 dark:text-white">{summary.usedCount} ใบ</p>
                </div>
              </div>
        </motion.div>
            </div>

      {/* Info Box */}
      <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-3xl p-4 mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Info className="w-6 h-6 text-emerald-500" />
              <div>
            <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">
              ลำดับขั้นตอน: ลูกค้า ➝ พนักงานออกใบฝากคูปอง (ใบสี / ใบเหลืองสำเนา) ➝ พนักงานสแกนใบฝากคูปองเข้าสู่ระบบ
            </p>
            <p className="text-xs text-emerald-800/80 dark:text-emerald-200/80 mt-1">
              ใบฝากถือเป็นคูปองเงินสดสำหรับเติมน้ำมัน สามารถต่ออายุได้ 6 เดือน และฝากต่อจากยอดคงเหลือได้
                </p>
              </div>
            </div>
        <div className="flex items-center gap-2 text-xs text-emerald-900/80 dark:text-emerald-100">
          <ScanLine className="w-4 h-4" />
          รองรับการสแกนเลขที่ใบฝาก/คูปอง
              </div>
            </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="ค้นหาเลขที่ใบฝาก / ชื่อลูกค้า / สาขา..."
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
                setColumnFilters({ branch: "ทั้งหมด", status: "ทั้งหมด" });
                setActiveHeaderDropdown(null);
              }}
              className="px-4 py-3 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-2xl font-bold text-sm transition-colors flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              ล้างตัวกรอง
            </button>
          )}
          <div className="flex items-center gap-2 px-4 py-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-2xl border border-emerald-100 dark:border-emerald-800/50 shrink-0">
            <FileCheck className="w-4 h-4" />
            <span className="text-sm font-bold whitespace-nowrap">
              พบ {filteredSlips.length} ใบ
            </span>
          </div>
          </div>
      </div>

      {/* ตัวกรอง + ตารางรายการใบฝาก */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden"
      >
        <div className="border-b border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-black text-gray-800 dark:text-white">
            รายการใบฝากคูปองน้ำมัน
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            ค้นหาใบฝากคูปองตามเลขที่ใบฝาก ชื่อลูกค้า หรือสาขา คลิกที่ชื่อเพื่อใช้คูปอง และใช้ปุ่มด้านขวาในการใช้คูปองหรือฝากต่อ/ฝากเพิ่ม
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-gray-900/50 text-[10px] uppercase tracking-widest font-black text-gray-400">
                <HeaderWithFilter label="เลขที่ใบฝาก" columnKey="slipNo" />
                <HeaderWithFilter label="ชื่อลูกค้า" columnKey="customerName" />
                <HeaderWithFilter label="สาขา" columnKey="branch" filterKey="branch" options={filterOptions.branch} />
                <HeaderWithFilter label="มูลค่าใบฝาก" columnKey="amount" align="right" />
                <HeaderWithFilter label="ยอดคงเหลือ" columnKey="balance" align="right" />
                <th className="px-6 py-4">
                  <button
                    type="button"
                    className={`flex items-center gap-1.5 hover:text-gray-900 dark:hover:text-white transition-colors ${
                      sortConfig.key === "issueDate" ? "text-emerald-600" : ""
                    }`}
                    onClick={() => handleSort("issueDate")}
                    aria-label="เรียงข้อมูลวันที่ออกใบฝาก"
                  >
                    <span>วันที่ออก / หมดอายุ</span>
                    {getSortIcon("issueDate")}
                  </button>
                </th>
                <HeaderWithFilter
                  label="สถานะ"
                  columnKey="status"
                  filterKey="status"
                  options={filterOptions.status}
                  align="center"
                />
                <HeaderWithFilter label="การเคลื่อนไหวล่าสุด" />
                <th className="px-6 py-4 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {filteredSlips.length === 0 && (
                <tr>
                  <td
                    colSpan={9}
                    className="py-12 px-6 text-center text-sm text-gray-500 dark:text-gray-400"
                  >
                    ไม่มีข้อมูลใบฝากคูปองที่ตรงกับเงื่อนไขค้นหา
                  </td>
                </tr>
              )}
              {filteredSlips.map((slip, index) => {
                const expiry = new Date(slip.expiryDate);
                const diffDays =
                  (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
                const isExpiringSoon =
                  diffDays >= 0 && diffDays <= 30 && slip.status === "ใช้งานอยู่";

                return (
                  <tr
                    key={slip.id}
                    className={`border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                      index % 2 === 0 ? "bg-white dark:bg-gray-800" : "bg-gray-50/50 dark:bg-gray-900/30"
                    }`}
                  >
                    <td className="py-4 px-6">
                      <span className="font-bold text-gray-900 dark:text-white">
                        {slip.slipNo}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <button
                        type="button"
                        onClick={() => openUseModal(slip)}
                        className="text-gray-800 dark:text-gray-100 hover:text-emerald-600 dark:hover:text-emerald-400 underline-offset-2 hover:underline cursor-pointer text-left font-medium"
                      >
                        {slip.customerName}
                      </button>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-gray-600 dark:text-gray-300 font-medium">
                        {slip.branch}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <span className="text-gray-800 dark:text-gray-100 font-bold">
                        {currencyFormatter.format(slip.amount)}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <span className="text-emerald-600 dark:text-emerald-400 font-black">
                        {currencyFormatter.format(slip.balance)}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-300">
                      <div className="font-medium">{slip.issueDate}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span>{slip.expiryDate}</span>
                        {isExpiringSoon && (
                          <span className="inline-flex px-2 py-1 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 text-[10px] font-bold">
                            ใกล้หมดอายุ
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span
                        className={
                          "inline-flex px-3 py-1 rounded-full border text-xs font-bold " +
                          getStatusBadgeClasses(slip.status)
                        }
                      >
                        {slip.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-300">
                      {slip.lastAction}
                    </td>
                    <td className="py-4 px-6">
                      <div className="relative">
                        <button
                          type="button"
                          onClick={(e) => {
                            const button = e.currentTarget;
                            const rect = button.getBoundingClientRect();
                            setDropdownPosition({
                              top: rect.bottom + 8,
                              right: window.innerWidth - rect.right,
                            });
                            setOpenDropdownId(openDropdownId === slip.id ? null : slip.id);
                          }}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          aria-label="จัดการ"
                        >
                          <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {openDropdownId && dropdownPosition && activeDropdownSlip && (
          <React.Fragment key={activeDropdownSlip.id}>
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              type="button"
              className="fixed inset-0 z-[15] bg-transparent"
              onClick={() => {
                setOpenDropdownId(null);
                setDropdownPosition(null);
              }}
              aria-label="ปิดเมนู"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              style={{
                position: 'fixed',
                top: `${dropdownPosition.top}px`,
                right: `${dropdownPosition.right}px`,
                zIndex: 20,
              }}
              className="w-56 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  openUseModal(activeDropdownSlip);
                  setOpenDropdownId(null);
                  setDropdownPosition(null);
                }}
                disabled={activeDropdownSlip.status !== "ใช้งานอยู่" || activeDropdownSlip.balance <= 0}
                className="w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-sm border-b border-gray-100 dark:border-gray-700"
              >
                <CreditCard className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-gray-700 dark:text-gray-300 font-medium">ใช้คูปอง</span>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRenew(activeDropdownSlip.id);
                  setOpenDropdownId(null);
                  setDropdownPosition(null);
                }}
                disabled={activeDropdownSlip.status === "ใช้ครบแล้ว"}
                className="w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-sm"
              >
                <RefreshCw className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span className="text-gray-700 dark:text-gray-300 font-medium">ต่ออายุ 6 เดือน</span>
              </button>
            </motion.div>
          </React.Fragment>
        )}
      </AnimatePresence>

      {/* Modal ออกใบฝากใหม่ */}
      <AnimatePresence>
        {showCreateModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeCreateModal}
              className="fixed inset-0 bg-black/50 z-50"
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-5 flex items-center justify-between z-10">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-emerald-500 rounded-2xl shadow-lg shadow-emerald-500/20">
                      <FileCheck className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-gray-900 dark:text-white">
                        ออกใบฝากคูปองน้ำมันใหม่
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                        กรอกข้อมูลเพื่อออกใบฝากคูปองให้ลูกค้า
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={closeCreateModal}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all duration-200 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:scale-110 active:scale-95"
                    aria-label="ปิด"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-6 bg-gray-50 dark:bg-gray-900/50">
                  <form id="createSlipForm" onSubmit={handleCreateSlip} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="modalCustomerName" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                          ชื่อลูกค้า / บริษัท
                        </label>
                        <div className="relative">
                          <User className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                          <input
                            id="modalCustomerName"
                            type="text"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            placeholder="เช่น บริษัท ขนส่ง A"
                            className="w-full pl-12 pr-4 py-3 text-sm rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 transition-all"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label htmlFor="modalBranch" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                          สาขา
                        </label>
                        <select
                          id="modalBranch"
                          value={branch}
                          onChange={(e) => setBranch(e.target.value)}
                          className="w-full px-4 py-3 text-sm rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 transition-all"
                          required
                        >
                          <option value="ปั๊มไฮโซ">ปั๊มไฮโซ</option>
                          <option value="ดินดำ">ดินดำ</option>
                          <option value="หนองจิก">หนองจิก</option>
                          <option value="ตักสิลา">ตักสิลา</option>
                          <option value="บายพาส">บายพาส</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label htmlFor="modalAmount" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                          มูลค่าใบฝาก (บาท)
                        </label>
                        <input
                          id="modalAmount"
                          type="number"
                          min={0}
                          value={amount}
                          onChange={(e) =>
                            setAmount(e.target.value === "" ? "" : Number(e.target.value))
                          }
                          placeholder="เช่น 1,000"
                          className="w-full px-4 py-3 text-sm rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 transition-all"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="modalIssueDate" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                          วันที่ออกใบฝาก
                        </label>
                        <div className="relative">
                          <Calendar className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                          <input
                            id="modalIssueDate"
                            type="date"
                            value={issueDate}
                            onChange={(e) => setIssueDate(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 text-sm rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 transition-all"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label htmlFor="modalExpiryDate" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                          วันที่หมดอายุ (อายุ 6 เดือน)
                        </label>
                        <input
                          id="modalExpiryDate"
                          type="date"
                          value={expiryDateForForm}
                          readOnly
                          className="w-full px-4 py-3 text-sm rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-900/60 text-gray-700 dark:text-gray-300"
                        />
                      </div>
                    </div>

                    <div className="flex items-start gap-3 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 px-4 py-3">
                      <FileText className="w-5 h-5 text-emerald-500 mt-0.5" />
                      <div className="text-sm text-emerald-900/90 dark:text-emerald-100 space-y-1">
                        <p className="font-bold">รูปแบบเอกสารใบฝากคูปอง</p>
                        <p>
                          ใบสี (ฉบับจริง){" "}
                          <span className="font-bold">ให้ลูกค้าเก็บไว้</span> และใบเหลือง{" "}
                          <span className="font-bold">เป็นสำเนาเก็บที่ปั๊ม</span> เพื่อใช้เทียบกับข้อมูลในระบบ
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3">
                      <ArrowRight className="w-4 h-4" />
                      <span>
                        เมื่อบันทึกแล้ว ระบบจะสร้างเลขที่ใบฝากและรอให้{" "}
                        <span className="font-bold">สแกนใบคูปองเข้าระบบ</span>
                      </span>
                    </div>
                  </form>
                </div>

                <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-5 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={closeCreateModal}
                    className="px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-all duration-200 font-bold hover:bg-gray-100 dark:hover:bg-gray-700 rounded-2xl"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    form="createSlipForm"
                    className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-bold shadow-lg shadow-emerald-500/20 transition-all active:scale-95 flex items-center gap-2"
                  >
                    <FileCheck className="w-5 h-5" />
                    บันทึกออกใบฝากคูปอง
                  </button>
        </div>
      </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Modal ใช้คูปอง */}
      <AnimatePresence>
      {activeSlip && (
          <>
          <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="fixed inset-0 bg-black/50 z-50"
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-5 flex items-center justify-between z-10">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-emerald-500 rounded-2xl shadow-lg shadow-emerald-500/20">
                      <FileCheck className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-gray-900 dark:text-white">
              ใช้คูปองจากใบฝาก
            </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                        {activeSlip.slipNo} - {activeSlip.customerName}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={closeModal}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all duration-200 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:scale-110 active:scale-95"
                    aria-label="ปิด"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-6 bg-gray-50 dark:bg-gray-900/50">
                  <div className="space-y-4">
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-2xl shadow-sm">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                          <span className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">มูลค่าใบฝาก</span>
                          <span className="font-black text-gray-900 dark:text-white text-lg">
                    {currencyFormatter.format(activeSlip.amount)}
                  </span>
                </div>
                <div>
                          <span className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">ยอดคงเหลือปัจจุบัน</span>
                          <span className="font-black text-emerald-600 dark:text-emerald-400 text-lg">
                    {currencyFormatter.format(activeSlip.balance)}
                  </span>
                        </div>
                </div>
              </div>

              <div>
                      <label htmlFor="useAmount" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  จำนวนที่ใช้ในรอบนี้ (บาท)
                </label>
                <input
                        id="useAmount"
                  type="number"
                  min={0}
                  max={activeSlip.balance}
                  value={useAmount}
                  onChange={(e) =>
                    setUseAmount(e.target.value === "" ? "" : Number(e.target.value))
                  }
                        className="w-full px-4 py-3 text-sm rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 transition-all font-medium"
                />
              </div>

                    <div className="text-sm text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium">ยอดคูปองเดิม</span>
                        <span className="font-bold text-gray-900 dark:text-white">
                    {currencyFormatter.format(activeSlip.balance)}
                  </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">ใช้ไป</span>
                        <span className="font-bold text-red-600 dark:text-red-400">
                    {useAmount === ""
                      ? currencyFormatter.format(0)
                      : currencyFormatter.format(Number(useAmount))}
                  </span>
                      </div>
                      <div className="pt-2 border-t border-gray-200 dark:border-gray-700 flex justify-between">
                        <span className="font-bold">ยอดคงเหลือใหม่</span>
                        <span className="font-black text-emerald-600 dark:text-emerald-400">
                          {useAmount === ""
                            ? currencyFormatter.format(activeSlip.balance)
                            : currencyFormatter.format(activeSlip.balance - Number(useAmount))}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 pt-1">
                  หลังจากบันทึก ระบบจะลดยอดคงเหลือของใบฝากตามจำนวนที่ใช้
                </p>
                    </div>
              </div>
            </div>

                <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-5 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={closeModal}
                    className="px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-all duration-200 font-bold hover:bg-gray-100 dark:hover:bg-gray-700 rounded-2xl"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleUseCoupon}
                    className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-bold shadow-lg shadow-emerald-500/20 transition-all active:scale-95 flex items-center gap-2"
              >
                    <FileCheck className="w-5 h-5" />
                บันทึกการใช้คูปอง
              </button>
            </div>
          </motion.div>
        </div>
          </>
      )}
      </AnimatePresence>

    </div>
  );
}
