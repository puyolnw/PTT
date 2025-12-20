import { motion } from "framer-motion";
import { useMemo, useState } from "react";
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
} from "lucide-react";

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
  const [branchFilter, setBranchFilter] = useState<string>("ปั๊มไฮโซ");
  const [oilPrices, setOilPrices] = useState<OilPrice[]>(initialPrices);

  const [globalEffectiveDate, setGlobalEffectiveDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [globalEffectiveTime, setGlobalEffectiveTime] = useState<string>("05:00");

  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const filteredPrices = useMemo(
    () =>
      oilPrices
        .filter((p) => p.branch === branchFilter)
        .sort(
          (a, b) =>
            oilTypeDisplayOrder.indexOf(a.oilTypeCode) -
            oilTypeDisplayOrder.indexOf(b.oilTypeCode)
        ),
    [oilPrices, branchFilter]
  );

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
              status: p.proposedPrice && p.proposedPrice !== p.currentPrice ? "รอมีผล" : p.status,
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
              status: p.proposedPrice && p.proposedPrice !== p.currentPrice ? "รอมีผล" : p.status,
            }
          : p
      )
    );
  };

  const handleApplyAll = () => {
    if (!hasPendingChanges) return;
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

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-4"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2 flex items-center gap-3">
              <DollarSign className="w-8 h-8 text-emerald-500" />
              การปรับราคาน้ำมัน
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              จัดการราคาขายน้ำมันตามประเภทและสาขา รองรับการนำเข้าราคาจาก ปตท. และการปรับราคาเองของคุณนิด
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              className="px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            >
              <option value="ปั๊มไฮโซ">ปั๊มไฮโซ (สำนักงานใหญ่)</option>
              <option value="ดินดำ">ดินดำ</option>
              <option value="หนองจิก">หนองจิก</option>
              <option value="ตักสิลา">ตักสิลา</option>
              <option value="บายพาส">บายพาส</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Info banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
      >
        <div className="flex items-start gap-3">
          <CheckCircle className="w-6 h-6 text-emerald-500 mt-0.5" />
          <div className="text-xs text-emerald-900 dark:text-emerald-100 space-y-1">
            <p className="font-semibold">
              ขั้นตอนการปรับราคา: นำเข้าราคาจาก ปตท. → ตรวจสอบ/แก้ไข → ตั้งวัน-เวลามีผล → ยืนยันใช้ราคาใหม่
            </p>
            <p>
              รองรับการอัปโหลดไฟล์ราคาจากเว็บ ปตท. (PricePerLiter) และเชื่อมกับสมุด Balance Petrol, สมุดขายน้ำมัน
              และแดชบอร์ดผู้บริหารอัตโนมัติ
            </p>
          </div>
        </div>
        <div className="flex flex-col md:items-end gap-2 text-xs">
          <button
            type="button"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-emerald-950 text-emerald-700 dark:text-emerald-100 border border-emerald-300 dark:border-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/60 text-xs font-medium"
          >
            <Upload className="w-4 h-4" />
            นำเข้าราคาจากไฟล์ ปตท. (Excel)
          </button>
          <p className="text-[11px] text-emerald-800/80 dark:text-emerald-200/80">
            * ในเวอร์ชันจริงปุ่มนี้จะเปิดฟอร์มอัปโหลดไฟล์ Excel ราคาน้ำมันจาก Back Office ปตท.
          </p>
        </div>
      </motion.div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
            <Fuel className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">จำนวนประเภทน้ำมันในสาขานี้</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {summary.totalOilTypes} ประเภท
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
            <Edit3 className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">รายการที่มีการแก้ไขราคาแต่ยังไม่ยืนยัน</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {summary.changedCount} รายการ
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
            <History className="w-5 h-5 text-purple-500" />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">ราคาขายเฉลี่ย (ทุกประเภทในสาขานี้)</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {currencyFormatter.format(summary.avgCurrentPrice)}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Global effective date/time + action */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.25 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          <div className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
            <p className="font-semibold">
              ตั้งวันและเวลาที่ราคาชุดนี้จะมีผลกับทุกประเภทน้ำมันในสาขานี้
            </p>
            <p>
              ระบบจริงจะส่งราคานี้ไปยัง POS, Back Office ปตท., สมุดขายน้ำมัน และ Balance Petrol
              เพื่อคำนวณต้นทุนและภาษีขายอัตโนมัติ
            </p>
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
                className="pl-9 pr-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              />
            </div>
            <div className="relative">
              <Clock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="time"
                value={globalEffectiveTime}
                onChange={(e) => setGlobalEffectiveTime(e.target.value)}
                className="pl-9 pr-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              />
            </div>
          </div>
          <button
            type="button"
            onClick={handleApplyAll}
            disabled={!hasPendingChanges}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <CheckCircle className="w-4 h-4" />
            ยืนยันใช้ราคาใหม่ทั้งหมดในสาขานี้
          </button>
        </div>
      </motion.div>

      {/* Table of prices */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden"
      >
        <div className="border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
              ตารางปรับราคาน้ำมัน – {branchFilter}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              แก้ไขช่อง “ราคาขายใหม่” และถ้าต้องการกำหนดวัน-เวลามีผลเฉพาะแต่ละประเภท ให้ปรับในคอลัมน์ “วันที่/เวลาเริ่มใช้”
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900/40 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400">
                  ประเภทน้ำมัน
                </th>
                <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400">
                  ราคาขายปัจจุบัน (บาท/ลิตร)
                </th>
                <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400">
                  ราคาขายใหม่ (บาท/ลิตร)
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400">
                  วันที่/เวลาเริ่มใช้
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400">
                  แหล่งที่มา / ล่าสุดแก้ไข
                </th>
                <th className="text-center py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400">
                  สถานะ
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredPrices.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="py-8 px-4 text-center text-xs text-gray-500 dark:text-gray-400"
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
                    className={`border-b border-gray-100 dark:border-gray-700 ${
                      hasChange ? "bg-emerald-50/40 dark:bg-emerald-900/10" : ""
                    }`}
                  >
                    <td className="py-3 px-4 align-top">
                      <div className="flex items-center gap-2">
                        <Fuel className="w-4 h-4 text-gray-500" />
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {price.oilTypeName}
                          </p>
                          <p className="text-[11px] text-gray-500 dark:text-gray-400">
                            {price.oilTypeCode}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right align-top">
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                        {currencyFormatter.format(price.currentPrice)}
                      </p>
                    </td>
                    <td className="py-3 px-4 text-right align-top">
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
                          className="w-28 px-2 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-right text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                          placeholder={price.currentPrice.toFixed(2)}
                        />
                        {hasChange && (
                          <p
                            className={`text-[11px] ${
                              diff > 0
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-red-500"
                            }`}
                          >
                            {diff > 0 ? "+" : ""}
                            {diff.toFixed(2)} บาท
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 align-top">
                      <div className="flex flex-col sm:flex-row gap-2 text-xs">
                        <div className="relative">
                          <Calendar className="w-3.5 h-3.5 text-gray-400 absolute left-2 top-1/2 -translate-y-1/2" />
                          <input
                            type="date"
                            value={price.effectiveDate ?? globalEffectiveDate}
                            onChange={(e) => handleChangeEffectiveDate(price.id, e.target.value)}
                            className="pl-7 pr-2 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/40"
                          />
                        </div>
                        <div className="relative">
                          <Clock className="w-3.5 h-3.5 text-gray-400 absolute left-2 top-1/2 -translate-y-1/2" />
                          <input
                            type="time"
                            value={price.effectiveTime ?? globalEffectiveTime}
                            onChange={(e) => handleChangeEffectiveTime(price.id, e.target.value)}
                            className="pl-7 pr-2 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/40"
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 align-top text-xs text-gray-600 dark:text-gray-300">
                      <p>
                        แหล่งที่มา:{" "}
                        <span className="font-semibold">
                          {price.lastSource === "ไฟล์ ปตท."
                            ? "ไฟล์ราคาจาก ปตท."
                            : price.lastSource === "กรอกมือ"
                            ? "ปรับเองโดยคุณนิด"
                            : "API/ระบบอัตโนมัติ"}
                        </span>
                      </p>
                      <p>แก้ไขล่าสุด: {price.lastUpdated}</p>
                    </td>
                    <td className="py-3 px-4 align-top text-center">
                      <span
                        className={
                          "inline-flex px-2 py-0.5 rounded-full border text-[11px] " +
                          getStatusBadgeClasses(price.status)
                        }
                      >
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
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-lg p-5"
          >
            <div className="flex items-center gap-3 mb-3">
              <AlertTriangle className="w-6 h-6 text-amber-500" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  ยืนยันใช้ราคาน้ำมันชุดใหม่ในสาขา {branchFilter}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  เมื่อยืนยันแล้ว ระบบจะบันทึกเป็นราคาขายใหม่และเชื่อมต่อไปยัง POS / Back Office ปตท. /
                  สมุด Balance Petrol และแดชบอร์ด เพื่อคำนวณต้นทุนและภาษีขาย
                </p>
              </div>
            </div>

            <div className="max-h-64 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg mb-4">
              <table className="w-full text-xs">
                <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="text-left py-2 px-3 font-medium text-gray-600 dark:text-gray-300">
                      ประเภทน้ำมัน
                    </th>
                    <th className="text-right py-2 px-3 font-medium text-gray-600 dark:text-gray-300">
                      เดิม
                    </th>
                    <th className="text-right py-2 px-3 font-medium text-gray-600 dark:text-gray-300">
                      ใหม่
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pendingChanges.map((p) => (
                    <tr
                      key={p.id}
                      className="border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                    >
                      <td className="py-2 px-3">
                        <span className="font-semibold text-gray-800 dark:text-gray-100">
                          {p.oilTypeName}
                        </span>
                        <span className="block text-[10px] text-gray-500 dark:text-gray-400">
                          {p.oilTypeCode}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right text-gray-700 dark:text-gray-200">
                        {currencyFormatter.format(p.currentPrice)}
                      </td>
                      <td className="py-2 px-3 text-right font-semibold text-emerald-600 dark:text-emerald-400">
                        {currencyFormatter.format(p.proposedPrice ?? p.currentPrice)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-4">
              วัน-เวลามีผลเริ่มต้นที่{" "}
              <span className="font-semibold">
                {globalEffectiveDate} {globalEffectiveTime}
              </span>{" "}
              (สามารถปรับรายประเภทได้ในตารางหลัก)
            </p>

            <div className="flex items-center justify-between mt-3">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-3 py-2 text-xs rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={applyConfirmedChanges}
                className="px-4 py-2 text-xs rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700"
              >
                ยืนยันใช้ราคาน้ำมันชุดใหม่
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
