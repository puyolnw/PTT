import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";
import {
  Droplet,
  BookOpen,
  Calendar,
  Search,
  Filter,
  Plus,
  X,
  Save,
  Check,
} from "lucide-react";

const integerFormatter = new Intl.NumberFormat("th-TH", {
  maximumFractionDigits: 0,
});

type TankEntry = {
  id: string;
  date: string; // รูปแบบ ด/ป/ว เช่น "2/1/68"
  fullDate: Date; // วันที่แบบเต็มสำหรับการกรอง
  tankId: number; // เช่น 34, 59, 18
  fuelType: string; // รหัสน้ำมัน เช่น HSD, 6SH91, E20
  qty: number; // จำนวน (ลิตร)
  priceA: number | null; // ราคา 1
  priceB: number | null; // ราคา 2 (บางรายการมี)
  factor: number | null; // ตัวคูณ เช่น 0.90
  net: number | null; // ผลลัพธ์ เช่น 3600
  ref: string; // อ้างอิง เช่น P67, P18, B หนองจิก
  note: string; // หมายเหตุ
  isVerified?: boolean; // มี checkmark หรือไม่
};

const formatNumberOrDash = (value: number | null | undefined) => {
  if (value === null || value === undefined) return "-";
  return integerFormatter.format(value);
};

const computeNet = (qty: number, factor: number | null) => {
  if (factor === null) return null;
  if (!Number.isFinite(qty) || !Number.isFinite(factor)) return null;
  return Math.round(qty * factor);
};

// Mock data ตามรูปภาพ - สมุดน้ำมันลงหลุม (ตัวอย่าง)
const initialTankEntries: TankEntry[] = [
  { id: "1", date: "2/1/68", fullDate: new Date(2025, 0, 2), tankId: 34, fuelType: "HSD", qty: 4000, priceA: 36.8, priceB: 33.49, factor: 0.9, net: 3600, ref: "P18", note: "", isVerified: true },
  { id: "2", date: "2/1/68", fullDate: new Date(2025, 0, 2), tankId: 34, fuelType: "HSD", qty: 9000, priceA: 33.49, priceB: null, factor: 0.9, net: 8100, ref: "P26", note: "", isVerified: true },
  { id: "3", date: "2/1/68", fullDate: new Date(2025, 0, 2), tankId: 18, fuelType: "6SH95", qty: 4000, priceA: 36.8, priceB: 35.9, factor: 0.9, net: 3600, ref: "P67", note: "", isVerified: true },
  { id: "4", date: "2/1/68", fullDate: new Date(2025, 0, 2), tankId: 83, fuelType: "E20", qty: 4000, priceA: 33.49, priceB: 32.59, factor: 0.9, net: 3600, ref: "B หนองจิก", note: "", isVerified: true },
  { id: "5", date: "3/1/68", fullDate: new Date(2025, 0, 3), tankId: 34, fuelType: "HSD", qty: 7000, priceA: 33.49, priceB: 32.59, factor: 0.9, net: 6300, ref: "P18", note: "", isVerified: true },
  { id: "6", date: "3/1/68", fullDate: new Date(2025, 0, 3), tankId: 59, fuelType: "6SH91", qty: 4000, priceA: 36.13, priceB: 35.23, factor: 0.9, net: 3600, ref: "P69", note: "", isVerified: true },
];

export default function TankEntryBook() {
  const [tankEntries, setTankEntries] = useState<TankEntry[]>(initialTankEntries);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [newEntry, setNewEntry] = useState<Omit<TankEntry, "id">>({
    date: "2/1/68",
    fullDate: new Date(2025, 0, 2),
    tankId: 34,
    fuelType: "",
    qty: 0,
    priceA: null,
    priceB: null,
    factor: 0.9,
    net: null,
    ref: "",
    note: "",
    isVerified: false,
  });

  // State สำหรับการกรอง
  const [selectedDay, setSelectedDay] = useState<number | "all">("all");
  const [selectedMonth, setSelectedMonth] = useState<number | "all">("all");
  const [selectedYear, setSelectedYear] = useState<number | "all">("all");

  // กรองข้อมูลตามวัน เดือน ปี
  const filteredTankEntries = useMemo(() => {
    return tankEntries.filter((entry) => {
      const term = searchTerm.trim().toLowerCase();
      const matchesSearch =
        term === "" ||
        entry.date.toLowerCase().includes(term) ||
        String(entry.tankId).includes(term) ||
        entry.fuelType.toLowerCase().includes(term) ||
        (entry.ref || "").toLowerCase().includes(term) ||
        (entry.note || "").toLowerCase().includes(term);

      const entryDate = entry.fullDate;
      const entryDay = entryDate.getDate();
      const entryMonth = entryDate.getMonth() + 1; // 1-12
      const entryYear = entryDate.getFullYear();

      const dayMatch = selectedDay === "all" || entryDay === selectedDay;
      const monthMatch = selectedMonth === "all" || entryMonth === selectedMonth;
      const yearMatch = selectedYear === "all" || entryYear === selectedYear;

      return matchesSearch && dayMatch && monthMatch && yearMatch;
    });
  }, [tankEntries, searchTerm, selectedDay, selectedMonth, selectedYear]);

  // คำนวณยอดรวมจากข้อมูลที่กรองแล้ว
  const totals = useMemo(() => {
    return {
      qty: filteredTankEntries.reduce((sum, e) => sum + (e.qty || 0), 0),
      net: filteredTankEntries.reduce((sum, e) => sum + (e.net || 0), 0),
    };
  }, [filteredTankEntries]);

  // สร้างรายการวันที่ เดือน ปี ที่มีในข้อมูล
  const availableDays = useMemo(() => {
    return Array.from(
      new Set(tankEntries.map((e) => e.fullDate.getDate()))
    ).sort((a, b) => a - b);
  }, [tankEntries]);

  const availableMonths = useMemo(() => {
    return Array.from(
      new Set(tankEntries.map((e) => e.fullDate.getMonth() + 1))
    ).sort((a, b) => a - b);
  }, [tankEntries]);

  const availableYears = useMemo(() => {
    return Array.from(
      new Set(tankEntries.map((e) => e.fullDate.getFullYear()))
    ).sort((a, b) => b - a);
  }, [tankEntries]);

  const monthNames = [
    "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
    "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
  ];

  // ฟังก์ชันล้างตัวกรอง
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedDay("all");
    setSelectedMonth("all");
    setSelectedYear("all");
  };

  // ฟังก์ชันเพิ่มรายการใหม่
  const handleAddEntry = () => {
    const newId = `entry-${Date.now()}`;
    const entry: TankEntry = {
      id: newId,
      ...newEntry,
    };
    setTankEntries(prev => [...prev, entry]);
    setShowAddModal(false);
    setNewEntry({
      date: "2/1/68",
      fullDate: new Date(2025, 0, 2),
      tankId: 34,
      fuelType: "",
      qty: 0,
      priceA: null,
      priceB: null,
      factor: 0.9,
      net: null,
      ref: "",
      note: "",
      isVerified: false,
    });
  };

  // จัดกลุ่มตามวันที่
  const groupedByDate = useMemo(() => {
    const groups: { [key: string]: TankEntry[] } = {};
    filteredTankEntries.forEach(entry => {
      if (!groups[entry.date]) {
        groups[entry.date] = [];
      }
      groups[entry.date].push(entry);
    });
    return groups;
  }, [filteredTankEntries]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8 space-y-6">
      {/* Header */}
      <header className="mb-2">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
              <div className="p-2 bg-emerald-500 rounded-2xl shadow-lg shadow-emerald-500/20">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              สมุดบันทึกน้ำมันลงหลุม
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">
              รูปแบบตารางเลียนแบบสมุดในรูป: เส้นบรรทัด + เส้นคอลัมน์สีแดง + ช่องอ้างอิงด้านขวา
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-bold shadow-lg shadow-emerald-500/20 transition-all active:scale-95 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              เพิ่มรายการ
            </button>
          </div>
        </div>
      </header>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl">
              <Droplet className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">รวมจำนวน</p>
              <p className="text-2xl font-black text-gray-900 dark:text-white">
                {integerFormatter.format(totals.qty)} ลิตร
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl">
              <Check className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">รวมสุทธิ</p>
              <p className="text-2xl font-black text-gray-900 dark:text-white">
                {integerFormatter.format(totals.net)} หน่วย
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filter Bar (match UndergroundBook) */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="ค้นหา: วันที่, รหัส, ชนิด, อ้างอิง, หมายเหตุ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900 dark:text-white font-medium"
          />
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto flex-wrap justify-end">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-400" />
            <select
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value === "all" ? "all" : Number(e.target.value))}
              className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 text-gray-800 dark:text-white transition-all duration-200 text-sm font-medium"
            >
              <option value="all">ทุกวัน</option>
              {availableDays.map((day) => (
                <option key={day} value={day}>
                  วันที่ {day}
                </option>
              ))}
            </select>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value === "all" ? "all" : Number(e.target.value))}
              className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 text-gray-800 dark:text-white transition-all duration-200 text-sm font-medium"
            >
              <option value="all">ทุกเดือน</option>
              {availableMonths.map((month) => (
                <option key={month} value={month}>
                  {monthNames[month - 1]}
                </option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value === "all" ? "all" : Number(e.target.value))}
              className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 text-gray-800 dark:text-white transition-all duration-200 text-sm font-medium"
            >
              <option value="all">ทุกปี</option>
              {availableYears.map((year) => (
                <option key={year} value={year}>
                  {year + 543}
                </option>
              ))}
            </select>
          </div>

          {(searchTerm !== "" || selectedDay !== "all" || selectedMonth !== "all" || selectedYear !== "all") && (
            <button
              onClick={clearFilters}
              className="px-4 py-3 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-2xl font-bold text-sm transition-colors flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              ล้างตัวกรอง
            </button>
          )}

          <div className="flex items-center gap-2 px-4 py-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-2xl border border-emerald-100 dark:border-emerald-800/50 shrink-0">
            <Filter className="w-4 h-4" />
            <span className="text-sm font-bold whitespace-nowrap">แสดง {filteredTankEntries.length} รายการ</span>
          </div>
        </div>
      </div>

      {/* Ledger Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-gray-900/50 text-[10px] uppercase tracking-widest font-black text-gray-400">
                <th className="px-6 py-4 text-left">
                  วันที่
                </th>
                <th className="px-6 py-4 text-center">
                  รหัส
                </th>
                <th className="px-6 py-4 text-left">
                  ชนิด
                </th>
                <th className="px-6 py-4 text-right">
                  จำนวน
                </th>
                <th className="px-6 py-4 text-right">
                  ราคา A
                </th>
                <th className="px-6 py-4 text-right">
                  ราคา B
                </th>
                <th className="px-6 py-4 text-right">
                  คูณ
                </th>
                <th className="px-6 py-4 text-right">
                  สุทธิ
                </th>
                <th className="px-6 py-4 text-left">
                  อ้างอิง
                </th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(groupedByDate).map(([date, entries]) => (
                <React.Fragment key={date}>
                  {entries.map((entry, index) => {
                    return (
                      <motion.tr
                        key={entry.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.25, delay: index * 0.02 }}
                        className={`border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                          index % 2 === 0 ? "bg-white dark:bg-gray-800" : "bg-gray-50/50 dark:bg-gray-900/30"
                        }`}
                      >
                        {/* วันที่ (แสดงเฉพาะแถวแรกของวัน) */}
                        <td className="px-6 py-4 text-sm font-semibold text-gray-800 dark:text-white whitespace-nowrap">
                          {index === 0 ? entry.date : ""}
                        </td>

                        {/* รหัส */}
                        <td className="px-6 py-4 text-sm text-center font-semibold text-gray-800 dark:text-white whitespace-nowrap">
                          {entry.tankId}
                        </td>

                        {/* ชนิด */}
                        <td className="px-6 py-4 text-sm font-semibold text-gray-800 dark:text-white whitespace-nowrap">
                          {entry.fuelType}
                        </td>

                        {/* จำนวน */}
                        <td className="px-6 py-4 text-sm text-right text-gray-600 dark:text-gray-400 whitespace-nowrap">
                          {integerFormatter.format(entry.qty)}
                        </td>

                        {/* ราคา A */}
                        <td className="px-6 py-4 text-sm text-right text-gray-600 dark:text-gray-400 whitespace-nowrap">
                          {entry.priceA ?? "-"}
                        </td>

                        {/* ราคา B */}
                        <td className="px-6 py-4 text-sm text-right text-gray-600 dark:text-gray-400 whitespace-nowrap">
                          {entry.priceB ?? "-"}
                        </td>

                        {/* คูณ */}
                        <td className="px-6 py-4 text-sm text-right text-gray-600 dark:text-gray-400 whitespace-nowrap">
                          {entry.factor ?? "-"}
                        </td>

                        {/* สุทธิ */}
                        <td className="px-6 py-4 text-sm text-right font-semibold text-gray-800 dark:text-white whitespace-nowrap">
                          {formatNumberOrDash(entry.net)}
                        </td>

                        {/* อ้างอิง */}
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                          {entry.ref || "-"}
                        </td>
                      </motion.tr>
                    );
                  })}
                </React.Fragment>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50">
                <td className="px-6 py-4 text-left text-sm font-semibold text-gray-800 dark:text-white" colSpan={3}>
                  รวม
                </td>
                <td className="px-6 py-4 text-right text-sm font-semibold text-gray-800 dark:text-white">
                  {integerFormatter.format(totals.qty)}
                </td>
                <td className="px-6 py-4 text-right text-sm text-gray-600 dark:text-gray-400">
                  -
                </td>
                <td className="px-6 py-4 text-right text-sm text-gray-600 dark:text-gray-400">
                  -
                </td>
                <td className="px-6 py-4 text-right text-sm text-gray-600 dark:text-gray-400">
                  -
                </td>
                <td className="px-6 py-4 text-right text-sm font-semibold text-gray-800 dark:text-white">
                  {integerFormatter.format(totals.net)}
                </td>
                <td className="px-6 py-4 text-left text-sm text-gray-600 dark:text-gray-400">
                  -
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </motion.div>

      {/* Add Entry Modal */}
      <AnimatePresence>
        {showAddModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="fixed inset-0 bg-black/50 z-50"
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">เพิ่มรายการใหม่</h2>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        วันที่ (ด/ป/ว)
                      </label>
                      <input
                        type="text"
                        value={newEntry.date}
                        onChange={(e) => setNewEntry({ ...newEntry, date: e.target.value })}
                        placeholder="7/7/68"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        รหัส (ID)
                      </label>
                      <input
                        type="number"
                        value={newEntry.tankId}
                        onChange={(e) => setNewEntry({ ...newEntry, tankId: Number(e.target.value) })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      ประเภทน้ำมัน
                    </label>
                    <input
                      type="text"
                      value={newEntry.fuelType}
                      onChange={(e) => setNewEntry({ ...newEntry, fuelType: e.target.value })}
                      placeholder="เช่น HSD, E20, 6SH91"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        จำนวน
                      </label>
                      <input
                        type="number"
                        value={newEntry.qty}
                        onChange={(e) => {
                          const qty = Number(e.target.value);
                          setNewEntry((prev) => ({ ...prev, qty, net: computeNet(qty, prev.factor) }));
                        }}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        ราคา A
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={newEntry.priceA ?? ""}
                        onChange={(e) =>
                          setNewEntry((prev) => ({
                            ...prev,
                            priceA: e.target.value === "" ? null : Number(e.target.value),
                          }))
                        }
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        ราคา B
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={newEntry.priceB ?? ""}
                        onChange={(e) =>
                          setNewEntry((prev) => ({
                            ...prev,
                            priceB: e.target.value === "" ? null : Number(e.target.value),
                          }))
                        }
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        คูณ
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={newEntry.factor ?? ""}
                        onChange={(e) => {
                          const factor = e.target.value === "" ? null : Number(e.target.value);
                          setNewEntry((prev) => ({ ...prev, factor, net: computeNet(prev.qty, factor) }));
                        }}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        สุทธิ (คำนวณ)
                      </label>
                      <input
                        type="number"
                        value={newEntry.net ?? ""}
                        onChange={(e) =>
                          setNewEntry((prev) => ({
                            ...prev,
                            net: e.target.value === "" ? null : Number(e.target.value),
                          }))
                        }
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        อ้างอิง
                      </label>
                      <input
                        type="text"
                        value={newEntry.ref}
                        onChange={(e) => setNewEntry((prev) => ({ ...prev, ref: e.target.value }))}
                        placeholder="เช่น P67, P18, B หนองจิก"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        หมายเหตุ
                      </label>
                      <input
                        type="text"
                        value={newEntry.note}
                        onChange={(e) => setNewEntry((prev) => ({ ...prev, note: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={newEntry.isVerified}
                      onChange={(e) => setNewEntry({ ...newEntry, isVerified: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <label className="text-sm text-gray-700 dark:text-gray-300">ยืนยันแล้ว (มี checkmark)</label>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    ยกเลิก
                  </button>
                  <button
                    onClick={handleAddEntry}
                    className="px-5 py-2.5 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors flex items-center gap-2 font-bold"
                  >
                    <Save className="w-4 h-4" />
                    บันทึก
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
