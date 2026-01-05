import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import {
  FileCheck,
  FileText,
  Search,
  Filter,
  RefreshCw,
  ScanLine,
  User,
  Calendar,
  ArrowRight,
  Clock,
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
  const [filterStatus, setFilterStatus] = useState<"ทั้งหมด" | CouponStatus>("ทั้งหมด");

  // ฟอร์มออกใบฝากใหม่
  const [customerName, setCustomerName] = useState("");
  const [branch, setBranch] = useState("ปั๊มไฮโซ");
  const [amount, setAmount] = useState<number | "">("");
  const [issueDate, setIssueDate] = useState(formatDate(new Date()));

  // Modal ใช้คูปอง
  const [activeSlip, setActiveSlip] = useState<DepositSlip | null>(null);
  const [useAmount, setUseAmount] = useState<number | "">("");

  // Modal ฝากต่อ/ฝากเพิ่ม
  const [activeTopupSlip, setActiveTopupSlip] = useState<DepositSlip | null>(null);
  const [topupAmount, setTopupAmount] = useState<number | "">("");

  const expiryDateForForm = useMemo(
    () => formatDate(addMonths(new Date(issueDate), 6)),
    [issueDate]
  );

  const filteredSlips = useMemo(
    () =>
      slips.filter((slip) => {
        const term = searchTerm.toLowerCase();
        const matchesSearch =
          slip.slipNo.toLowerCase().includes(term) ||
          slip.customerName.toLowerCase().includes(term) ||
          slip.branch.toLowerCase().includes(term);

        const matchesStatus =
          filterStatus === "ทั้งหมด" ? true : slip.status === filterStatus;

        return matchesSearch && matchesStatus;
      }),
    [slips, searchTerm, filterStatus]
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
  };

  const handleRenew = (slipId: string) => {
    setSlips((prev) =>
      prev.map((slip) => {
        if (slip.id !== slipId) return slip;
        const baseDate =
          new Date(slip.expiryDate) > new Date() ? new Date(slip.expiryDate) : new Date();
        const newExpiry = formatDate(addMonths(baseDate, 6));
        return {
          ...slip,
          expiryDate: newExpiry,
          status: "ใช้งานอยู่",
          lastAction: "ต่ออายุใบคูปอง 6 เดือน",
        };
      })
    );
  };

  const openUseModal = (slip: DepositSlip) => {
    setActiveSlip(slip);
    setUseAmount("");
  };

  const openTopupModal = (slip: DepositSlip) => {
    setActiveTopupSlip(slip);
    setTopupAmount("");
  };

  const handleUseAndReDeposit = () => {
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

        const newExpiry = formatDate(addMonths(new Date(), 6));
        return {
          ...slip,
          balance: newBalance,
          expiryDate: newExpiry,
          status: "ใช้งานอยู่",
          lastAction: `ใช้คูปอง ${currencyFormatter.format(
            useValue
          )} ฝากต่อ ${currencyFormatter.format(newBalance)}`,
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

  const closeTopupModal = () => {
    setActiveTopupSlip(null);
    setTopupAmount("");
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

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-4"
      >
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
          การจัดการใบฝากคูปองน้ำมัน
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          ออกใบฝากคูปองให้ลูกค้า ต่ออายุใบคูปอง และฝากต่อจากยอดคงเหลือ (อายุใบคูปอง 6 เดือน)
        </p>
      </motion.div>

      {/* ขั้นตอนการทำงานสั้น ๆ */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <FileCheck className="w-8 h-8 text-blue-500" />
          <div>
            <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
              ลำดับขั้นตอน: ลูกค้า ➝ พนักงานออกใบฝากคูปอง (ใบสี / ใบเหลืองสำเนา) ➝ พนักงานสแกนใบฝากคูปองเข้าสู่ระบบ
            </p>
            <p className="text-xs text-blue-800/80 dark:text-blue-200/80">
              ใบฝากถือเป็นคูปองเงินสดสำหรับเติมน้ำมัน สามารถต่ออายุได้ 6 เดือน และฝากต่อจากยอดคงเหลือได้
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-blue-900/80 dark:text-blue-100">
          <ScanLine className="w-4 h-4" />
          รองรับการสแกนเลขที่ใบฝาก/คูปอง เพื่อดึงข้อมูลเข้าระบบ
        </div>
      </motion.div>

      {/* สรุปสถิติใบคูปอง */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
            <FileCheck className="w-6 h-6 text-emerald-500" />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">ใบคูปองที่ใช้งานอยู่</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {summary.totalActiveCount} ใบ
            </p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400">
              มูลค่าคงเหลือ {currencyFormatter.format(summary.totalActiveBalance)}
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
            <Clock className="w-6 h-6 text-orange-500" />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">ใกล้หมดอายุ (ภายใน 30 วัน)</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {summary.expiringSoonCount} ใบ
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
            <FileText className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">หมดอายุแล้ว</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {summary.expiredCount} ใบ
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-lg bg-gray-500/10 flex items-center justify-center">
            <User className="w-6 h-6 text-gray-500" />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">ใช้ครบแล้ว</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {summary.usedCount} ใบ
            </p>
          </div>
        </motion.div>
      </div>

      {/* ฟอร์มออกใบฝาก + การอธิบายใบสี/ใบเหลือง */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ฟอร์มออกใบฝากใหม่ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-md p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-blue-500" />
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                ออกใบฝากคูปองน้ำมันใหม่
              </h2>
            </div>
          </div>

          <form onSubmit={handleCreateSlip} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="slip-customer" className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
                  ชื่อลูกค้า / บริษัท
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="slip-customer"
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="เช่น บริษัท ขนส่ง A"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="slip-branch" className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
                  สาขา
                </label>
                <select
                  id="slip-branch"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
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
                <label htmlFor="slip-amount" className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
                  มูลค่าใบฝาก (บาท)
                </label>
                <input
                  id="slip-amount"
                  type="number"
                  min={0}
                  value={amount}
                  onChange={(e) =>
                    setAmount(e.target.value === "" ? "" : Number(e.target.value))
                  }
                  placeholder="เช่น 1,000"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                />
              </div>
              <div>
                <label htmlFor="slip-issue-date" className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
                  วันที่ออกใบฝาก
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="slip-issue-date"
                    type="date"
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="slip-expiry-date" className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
                  วันที่หมดอายุ (อายุ 6 เดือน)
                </label>
                <input
                  id="slip-expiry-date"
                  type="date"
                  value={expiryDateForForm}
                  readOnly
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-900/60 text-gray-700 dark:text-gray-300"
                />
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 px-3 py-2">
              <FileText className="w-4 h-4 text-blue-500 mt-0.5" />
              <div className="text-xs text-blue-900/90 dark:text-blue-100 space-y-1">
                <p className="font-semibold">รูปแบบเอกสารใบฝากคูปอง</p>
                <p>
                  ใบสี (ฉบับจริง){" "}
                  <span className="font-semibold">ให้ลูกค้าเก็บไว้</span> และใบเหลือง{" "}
                  <span className="font-semibold">เป็นสำเนาเก็บที่ปั๊ม</span> เพื่อใช้เทียบกับข้อมูลในระบบ
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <ArrowRight className="w-3 h-3" />
                เมื่อบันทึกแล้ว ระบบจะสร้างเลขที่ใบฝากและรอให้{" "}
                <span className="font-semibold">สแกนใบคูปองเข้าระบบ</span>
              </div>
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium shadow hover:bg-blue-700 transition-colors"
              >
                <FileCheck className="w-4 h-4" />
                บันทึกออกใบฝากคูปอง
              </button>
            </div>
          </form>
        </motion.div>

        {/* กล่องอธิบายการต่ออายุและฝากต่อ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5 space-y-4"
        >
          <div className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-emerald-500" />
            <h2 className="text-sm font-semibold text-gray-800 dark:text-white">
              การต่ออายุ &amp; ฝากต่อใบคูปอง
            </h2>
          </div>
          <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
            <p>
              <span className="font-semibold">5.4.2 ต่ออายุใบคูปอง:</span>{" "}
              เลือกใบคูปองที่ใกล้หมดอายุแล้วกดปุ่ม{" "}
              <span className="font-semibold text-emerald-600">“ต่ออายุ 6 เดือน”</span>{" "}
              ระบบจะเลื่อนวันหมดอายุออกไป 6 เดือน
            </p>
            <p>
              <span className="font-semibold">5.4.3 ฝากต่อจากยอดคงเหลือ:</span>{" "}
              เช่น ใบฝาก 1,000 บาท ใช้ไป 800 บาท เหลือ 200 บาท กดปุ่ม{" "}
              <span className="font-semibold text-blue-600">“ใช้/ฝากต่อ”</span>{" "}
              ระบุจำนวนที่ใช้ ระบบจะคำนวณยอด{" "}
              <span className="font-semibold">ฝากต่อ</span> และเลื่อนวันหมดอายุให้ยอดที่ฝากต่ออีก 6 เดือน
            </p>
          </div>
        </motion.div>
      </div>

      {/* ตัวกรอง + ตารางรายการใบฝาก */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-md"
      >
        <div className="border-b border-gray-200 dark:border-gray-700 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
              รายการใบฝากคูปองน้ำมัน
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              ค้นหาใบฝากคูปองตามเลขที่ใบฝาก ชื่อลูกค้า หรือสาขา คลิกที่ชื่อเพื่อใช้คูปอง และใช้ปุ่มด้านขวาในการใช้คูปองหรือฝากต่อ/ฝากเพิ่ม
            </p>
          </div>
          <div className="flex flex-col md:flex-row gap-3 md:items-center">
            <div className="relative">
              <label htmlFor="search-slips" className="sr-only">ค้นหาใบฝากคูปอง</label>
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="search-slips"
                type="text"
                placeholder="ค้นหาเลขที่ใบฝาก / ชื่อลูกค้า / สาขา..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full md:w-64 pl-9 pr-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <label htmlFor="slip-status-filter" className="sr-only">กรองสถานะ</label>
              <select
                id="slip-status-filter"
                value={filterStatus}
                onChange={(e) =>
                  setFilterStatus(e.target.value as "ทั้งหมด" | CouponStatus)
                }
                className="px-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              >
                <option value="ทั้งหมด">ทั้งหมด</option>
                <option value="ใช้งานอยู่">ใช้งานอยู่</option>
                <option value="หมดอายุ">หมดอายุ</option>
                <option value="ใช้ครบแล้ว">ใช้ครบแล้ว</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900/40 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400">
                  เลขที่ใบฝาก
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400">
                  ชื่อลูกค้า
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400">
                  สาขา
                </th>
                <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400">
                  มูลค่าใบฝาก
                </th>
                <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400">
                  ยอดคงเหลือ
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400">
                  วันที่ออก / หมดอายุ
                </th>
                <th className="text-center py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400">
                  สถานะ
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400">
                  การเคลื่อนไหวล่าสุด
                </th>
                <th className="text-center py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400">
                  จัดการ
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredSlips.length === 0 && (
                <tr>
                  <td
                    colSpan={9}
                    className="py-8 px-4 text-center text-xs text-gray-500 dark:text-gray-400"
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
                  <motion.tr
                    key={slip.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.25, delay: index * 0.03 }}
                    className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50/60 dark:hover:bg-gray-900/40"
                  >
                    <td className="py-3 px-4 align-top">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {slip.slipNo}
                      </span>
                    </td>
                    <td className="py-3 px-4 align-top">
                      <button
                        type="button"
                        onClick={() => openUseModal(slip)}
                        className="text-gray-800 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 underline-offset-2 hover:underline cursor-pointer text-left"
                      >
                        {slip.customerName}
                      </button>
                    </td>
                    <td className="py-3 px-4 align-top">
                      <span className="text-gray-600 dark:text-gray-300">
                        {slip.branch}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right align-top">
                      <span className="text-gray-800 dark:text-gray-100 font-medium">
                        {currencyFormatter.format(slip.amount)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right align-top">
                      <span className="text-blue-600 dark:text-blue-400 font-semibold">
                        {currencyFormatter.format(slip.balance)}
                      </span>
                    </td>
                    <td className="py-3 px-4 align-top text-xs text-gray-600 dark:text-gray-300">
                      <div>{slip.issueDate}</div>
                      <div className="flex items-center gap-1">
                        <span>{slip.expiryDate}</span>
                        {isExpiringSoon && (
                          <span className="inline-flex px-2 py-0.5 rounded-full bg-orange-50 text-orange-600 border border-orange-200 text-[10px]">
                            ใกล้หมดอายุ
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 align-top text-center">
                      <span
                        className={
                          "inline-flex px-2 py-0.5 rounded-full border text-[11px] " +
                          getStatusBadgeClasses(slip.status)
                        }
                      >
                        {slip.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 align-top text-xs text-gray-600 dark:text-gray-300">
                      {slip.lastAction}
                    </td>
                    <td className="py-3 px-4 align-top">
                      <div className="flex flex-col gap-1 items-center">
                        <button
                          type="button"
                          onClick={() => openUseModal(slip)}
                          disabled={slip.status !== "ใช้งานอยู่" || slip.balance <= 0}
                          className="px-2 py-1 rounded-md text-[11px] bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 disabled:opacity-40 disabled:cursor-not-allowed w-full"
                        >
                          ใช้คูปอง
                        </button>
                        <button
                          type="button"
                          onClick={() => openTopupModal(slip)}
                          className="px-2 py-1 rounded-md text-[11px] bg-indigo-50 text-indigo-600 border border-indigo-200 hover:bg-indigo-100 w-full"
                        >
                          ฝากต่อ / ฝากเพิ่ม
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRenew(slip.id)}
                          disabled={slip.status === "ใช้ครบแล้ว"}
                          className="px-2 py-1 rounded-md text-[11px] bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100 disabled:opacity-40 disabled:cursor-not-allowed w-full"
                        >
                          ต่ออายุ 6 เดือน
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Modal ใช้คูปอง */}
      {activeSlip && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-md p-5"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              ใช้คูปองจากใบฝาก
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              ใบฝาก {activeSlip.slipNo} - {activeSlip.customerName} | ยอดคงเหลือ{" "}
              {currencyFormatter.format(activeSlip.balance)}
            </p>

            <div className="space-y-3 mb-4">
              <div className="grid grid-cols-2 gap-3 text-xs text-gray-600 dark:text-gray-300">
                <div>
                  <span className="block text-[11px] text-gray-500">มูลค่าใบฝาก</span>
                  <span className="font-semibold">
                    {currencyFormatter.format(activeSlip.amount)}
                  </span>
                </div>
                <div>
                  <span className="block text-[11px] text-gray-500">ยอดคงเหลือปัจจุบัน</span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400">
                    {currencyFormatter.format(activeSlip.balance)}
                  </span>
                </div>
              </div>

              <div>
                <label htmlFor="use-amount" className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
                  จำนวนที่ใช้ในรอบนี้ (บาท)
                </label>
                <input
                  id="use-amount"
                  type="number"
                  min={0}
                  max={activeSlip.balance}
                  value={useAmount}
                  onChange={(e) =>
                    setUseAmount(e.target.value === "" ? "" : Number(e.target.value))
                  }
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                />
              </div>

              <div className="text-xs text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 space-y-1">
                <p>
                  ยอดคูปองเดิม{" "}
                  <span className="font-semibold">
                    {currencyFormatter.format(activeSlip.balance)}
                  </span>
                </p>
                <p>
                  ใช้ไป{" "}
                  <span className="font-semibold">
                    {useAmount === ""
                      ? currencyFormatter.format(0)
                      : currencyFormatter.format(Number(useAmount))}
                  </span>
                </p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  หลังจากบันทึก ระบบจะลดยอดคงเหลือของใบฝากตามจำนวนที่ใช้
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between mt-4">
              <button
                type="button"
                onClick={closeModal}
                className="px-3 py-2 text-xs rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleUseAndReDeposit}
                className="px-4 py-2 text-xs rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700"
              >
                บันทึกการใช้คูปอง
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal ฝากต่อ/ฝากเพิ่มคูปอง */}
      {activeTopupSlip && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-md p-5"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              ฝากต่อ / ฝากเพิ่มใบคูปอง
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              ใบฝาก {activeTopupSlip.slipNo} - {activeTopupSlip.customerName} | ยอดคงเหลือปัจจุบัน{" "}
              {currencyFormatter.format(activeTopupSlip.balance)}
            </p>

            <div className="space-y-3 mb-4">
              <div className="grid grid-cols-2 gap-3 text-xs text-gray-600 dark:text-gray-300">
                <div>
                  <span className="block text-[11px] text-gray-500">มูลค่าใบฝากเดิม</span>
                  <span className="font-semibold">
                    {currencyFormatter.format(activeTopupSlip.amount)}
                  </span>
                </div>
                <div>
                  <span className="block text-[11px] text-gray-500">ยอดคงเหลือปัจจุบัน</span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400">
                    {currencyFormatter.format(activeTopupSlip.balance)}
                  </span>
                </div>
              </div>

              <div>
                <label htmlFor="topup-amount" className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
                  จำนวนที่ต้องการฝากเพิ่ม (บาท)
                </label>
                <input
                  id="topup-amount"
                  type="number"
                  min={0}
                  value={topupAmount}
                  onChange={(e) =>
                    setTopupAmount(e.target.value === "" ? "" : Number(e.target.value))
                  }
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                />
              </div>

              <div className="text-xs text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 space-y-1">
                <p>
                  ยอดคงเหลือเดิม{" "}
                  <span className="font-semibold">
                    {currencyFormatter.format(activeTopupSlip.balance)}
                  </span>
                </p>
                <p>
                  ฝากเพิ่ม{" "}
                  <span className="font-semibold">
                    {topupAmount === ""
                      ? currencyFormatter.format(0)
                      : currencyFormatter.format(Number(topupAmount))}
                  </span>
                </p>
                <p>
                  ยอดคงเหลือใหม่หลังฝากเพิ่ม{" "}
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {topupAmount === ""
                      ? currencyFormatter.format(activeTopupSlip.balance)
                      : currencyFormatter.format(
                        activeTopupSlip.balance + Number(topupAmount)
                      )}
                  </span>
                </p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  ระบบจะต่ออายุใบคูปองจากวันที่ฝากเพิ่มอีก 6 เดือน
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between mt-4">
              <button
                type="button"
                onClick={closeTopupModal}
                className="px-3 py-2 text-xs rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!activeTopupSlip || topupAmount === "" || topupAmount <= 0) return;
                  const addValue = Number(topupAmount);

                  setSlips((prev) =>
                    prev.map((slip) => {
                      if (slip.id !== activeTopupSlip.id) return slip;
                      const newAmount = slip.amount + addValue;
                      const newBalance = slip.balance + addValue;
                      const newExpiry = formatDate(addMonths(new Date(), 6));
                      return {
                        ...slip,
                        amount: newAmount,
                        balance: newBalance,
                        expiryDate: newExpiry,
                        status: "ใช้งานอยู่",
                        lastAction: `ฝากเพิ่ม ${currencyFormatter.format(
                          addValue
                        )} ยอดรวมใหม่ ${currencyFormatter.format(newBalance)}`,
                      };
                    })
                  );

                  closeTopupModal();
                }}
                className="px-4 py-2 text-xs rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700"
              >
                บันทึกการฝากต่อ / ฝากเพิ่ม
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
