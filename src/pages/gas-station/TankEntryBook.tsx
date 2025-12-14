import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";
import { Droplet, BookOpen, Calendar, Filter, Edit, Trash2, Plus, X, Save, Check } from "lucide-react";

const integerFormatter = new Intl.NumberFormat("th-TH", {
  maximumFractionDigits: 0,
});

type TankEntry = {
  id: string;
  date: string; // รูปแบบ ด/ป/ว เช่น "7/7/68"
  fullDate: Date; // วันที่แบบเต็มสำหรับการกรอง
  tankId: number; // ID ตัวเลข เช่น 34, 59, 18
  fuelType: string; // รหัสน้ำมัน เช่น "HSD", "6SH91", "E20"
  quantity1: string; // คอลัมน์ที่ 1 (อาจเป็นผลรวม เช่น "16000+9000+8000")
  quantity2: string; // คอลัมน์ที่ 2
  quantity3: string; // คอลัมน์ที่ 3
  isVerified?: boolean; // มี checkmark หรือไม่
};

// ฟังก์ชันคำนวณผลรวมจาก string เช่น "16000+9000+8000" = 33000
const calculateSum = (value: string): number => {
  if (!value || value.trim() === "") return 0;
  return value
    .split("+")
    .map(v => parseFloat(v.trim().replace(/,/g, "")))
    .filter(v => !isNaN(v))
    .reduce((sum, v) => sum + v, 0);
};

// ฟังก์ชันจัดรูปแบบผลรวม เช่น "16000+9000" -> "16,000+9,000"
const formatQuantity = (value: string): string => {
  if (!value || value.trim() === "") return "";
  return value
    .split("+")
    .map(v => {
      const num = parseFloat(v.trim().replace(/,/g, ""));
      return isNaN(num) ? v.trim() : integerFormatter.format(num);
    })
    .join("+");
};

// Mock data ตามรูปภาพ - สมุดตั้งพัก
const initialTankEntries: TankEntry[] = [
  // วันที่ 7/7/68
  { id: "1", date: "7/7/68", fullDate: new Date(2024, 6, 7), tankId: 34, fuelType: "HSD", quantity1: "16000+9000+8000+1000+8000+15000", quantity2: "8000", quantity3: "8000", isVerified: true },
  { id: "2", date: "7/7/68", fullDate: new Date(2024, 6, 7), tankId: 59, fuelType: "6SH91", quantity1: "3000+4000+4000", quantity2: "4000+4000", quantity3: "4000", isVerified: true },
  { id: "3", date: "7/7/68", fullDate: new Date(2024, 6, 7), tankId: 18, fuelType: "63495", quantity1: "4000", quantity2: "4000", quantity3: "1000", isVerified: true },
  { id: "4", date: "7/7/68", fullDate: new Date(2024, 6, 7), tankId: 83, fuelType: "E20", quantity1: "4000", quantity2: "1000", quantity3: "1000+", isVerified: true },
  { id: "5", date: "7/7/68", fullDate: new Date(2024, 6, 7), tankId: 91, fuelType: "E85", quantity1: "", quantity2: "", quantity3: "1000+", isVerified: false },
  { id: "6", date: "7/7/68", fullDate: new Date(2024, 6, 7), tankId: 75, fuelType: "HSP", quantity1: "", quantity2: "", quantity3: "", isVerified: false },
  { id: "7", date: "7/7/68", fullDate: new Date(2024, 6, 7), tankId: 26, fuelType: "695PM", quantity1: "", quantity2: "", quantity3: "", isVerified: false },
  
  // วันที่ 8/7/68
  { id: "8", date: "8/7/68", fullDate: new Date(2024, 6, 8), tankId: 34, fuelType: "HBD", quantity1: "8000+15000+1000+8000", quantity2: "8000", quantity3: "8000", isVerified: true },
  { id: "9", date: "8/7/68", fullDate: new Date(2024, 6, 8), tankId: 59, fuelType: "69491", quantity1: "4000+4000", quantity2: "4000", quantity3: "4000", isVerified: true },
  { id: "10", date: "8/7/68", fullDate: new Date(2024, 6, 8), tankId: 18, fuelType: "66495", quantity1: "4000", quantity2: "4000+4000", quantity3: "3000", isVerified: true },
  { id: "11", date: "8/7/68", fullDate: new Date(2024, 6, 8), tankId: 83, fuelType: "820", quantity1: "4000", quantity2: "", quantity3: "", isVerified: true },
  { id: "12", date: "8/7/68", fullDate: new Date(2024, 6, 8), tankId: 91, fuelType: "885", quantity1: "", quantity2: "", quantity3: "", isVerified: false },
  { id: "13", date: "8/7/68", fullDate: new Date(2024, 6, 8), tankId: 75, fuelType: "HSP", quantity1: "", quantity2: "", quantity3: "", isVerified: false },
  { id: "14", date: "8/7/68", fullDate: new Date(2024, 6, 8), tankId: 26, fuelType: "695 PM", quantity1: "", quantity2: "", quantity3: "", isVerified: false },
  
  // วันที่ 9/9/68
  { id: "15", date: "9/9/68", fullDate: new Date(2024, 8, 9), tankId: 34, fuelType: "HSD", quantity1: "8000+7000+8000", quantity2: "7000", quantity3: "8000", isVerified: true },
  { id: "16", date: "9/9/68", fullDate: new Date(2024, 8, 9), tankId: 59, fuelType: "68H91", quantity1: "4000", quantity2: "8000", quantity3: "3000", isVerified: true },
  { id: "17", date: "9/9/68", fullDate: new Date(2024, 8, 9), tankId: 18, fuelType: "68495", quantity1: "4000", quantity2: "4000", quantity3: "1000", isVerified: true },
  { id: "18", date: "9/9/68", fullDate: new Date(2024, 8, 9), tankId: 83, fuelType: "820", quantity1: "4000", quantity2: "", quantity3: "", isVerified: true },
  { id: "19", date: "9/9/68", fullDate: new Date(2024, 8, 9), tankId: 91, fuelType: "885", quantity1: "", quantity2: "", quantity3: "", isVerified: false },
  { id: "20", date: "9/9/68", fullDate: new Date(2024, 8, 9), tankId: 75, fuelType: "HSP", quantity1: "", quantity2: "", quantity3: "", isVerified: false },
  { id: "21", date: "9/9/68", fullDate: new Date(2024, 8, 9), tankId: 26, fuelType: "695 PM", quantity1: "", quantity2: "", quantity3: "", isVerified: false },
];

export default function TankEntryBook() {
  const [tankEntries, setTankEntries] = useState<TankEntry[]>(initialTankEntries);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<TankEntry | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEntry, setNewEntry] = useState<Omit<TankEntry, "id">>({
    date: "7/7/68",
    fullDate: new Date(2024, 6, 7),
    tankId: 34,
    fuelType: "",
    quantity1: "",
    quantity2: "",
    quantity3: "",
    isVerified: false,
  });

  // State สำหรับการกรอง
  const [selectedDay, setSelectedDay] = useState<number | "all">("all");
  const [selectedMonth, setSelectedMonth] = useState<number | "all">("all");
  const [selectedYear, setSelectedYear] = useState<number | "all">("all");

  // กรองข้อมูลตามวัน เดือน ปี
  const filteredTankEntries = useMemo(() => {
    return tankEntries.filter((entry) => {
      const entryDate = entry.fullDate;
      const entryDay = entryDate.getDate();
      const entryMonth = entryDate.getMonth() + 1; // 1-12
      const entryYear = entryDate.getFullYear();

      const dayMatch = selectedDay === "all" || entryDay === selectedDay;
      const monthMatch = selectedMonth === "all" || entryMonth === selectedMonth;
      const yearMatch = selectedYear === "all" || entryYear === selectedYear;

      return dayMatch && monthMatch && yearMatch;
    });
  }, [tankEntries, selectedDay, selectedMonth, selectedYear]);

  // คำนวณยอดรวมจากข้อมูลที่กรองแล้ว
  const totals = useMemo(() => {
    const q1Total = filteredTankEntries.reduce((sum, e) => sum + calculateSum(e.quantity1), 0);
    const q2Total = filteredTankEntries.reduce((sum, e) => sum + calculateSum(e.quantity2), 0);
    const q3Total = filteredTankEntries.reduce((sum, e) => sum + calculateSum(e.quantity3), 0);
    return {
      quantity1: q1Total,
      quantity2: q2Total,
      quantity3: q3Total,
      total: q1Total + q2Total + q3Total,
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
    setSelectedDay("all");
    setSelectedMonth("all");
    setSelectedYear("all");
  };

  // ฟังก์ชันลบ
  const handleDelete = (id: string) => {
    if (window.confirm("คุณต้องการลบรายการนี้หรือไม่?")) {
      setTankEntries(prev => prev.filter(entry => entry.id !== id));
    }
  };

  // ฟังก์ชันเริ่มแก้ไข
  const handleStartEdit = (entry: TankEntry) => {
    setEditingId(entry.id);
    setEditForm({ ...entry });
  };

  // ฟังก์ชันบันทึกการแก้ไข
  const handleSaveEdit = () => {
    if (!editForm) return;
    setTankEntries(prev => prev.map(entry => 
      entry.id === editForm.id ? editForm : entry
    ));
    setEditingId(null);
    setEditForm(null);
  };

  // ฟังก์ชันยกเลิกการแก้ไข
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm(null);
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
      date: "7/7/68",
      fullDate: new Date(2024, 6, 7),
      tankId: 34,
      fuelType: "",
      quantity1: "",
      quantity2: "",
      quantity3: "",
      isVerified: false,
    });
  };

  // ฟังก์ชัน toggle verification
  const handleToggleVerify = (id: string) => {
    setTankEntries(prev => prev.map(entry => 
      entry.id === id ? { ...entry, isVerified: !entry.isVerified } : entry
    ));
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
    <div className="space-y-6 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-4"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2 flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-teal-500" />
              สมุดตั้งพัก
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              บันทึกรายการน้ำมันที่ลงหลุม แยกตามวันที่ รหัสหลุม และประเภทน้ำมัน
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            เพิ่มรายการ
          </button>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
            <Droplet className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">รวมคอลัมน์ 1</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {integerFormatter.format(totals.quantity1)} ลิตร
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
            <Droplet className="w-6 h-6 text-green-500" />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">รวมคอลัมน์ 2</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {integerFormatter.format(totals.quantity2)} ลิตร
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
            <Droplet className="w-6 h-6 text-purple-500" />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">รวมคอลัมน์ 3</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {integerFormatter.format(totals.quantity3)} ลิตร
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
            <Droplet className="w-6 h-6 text-emerald-500" />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">รวมทั้งหมด</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {integerFormatter.format(totals.total)} ลิตร
            </p>
          </div>
        </motion.div>
      </div>

      {/* Date Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4"
      >
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">กรองข้อมูล:</span>
          </div>

          {/* Day Filter */}
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <select
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value === "all" ? "all" : Number(e.target.value))}
              className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="all">ทุกวัน</option>
              {availableDays.map((day) => (
                <option key={day} value={day}>
                  วันที่ {day}
                </option>
              ))}
            </select>
          </div>

          {/* Month Filter */}
          <div>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value === "all" ? "all" : Number(e.target.value))}
              className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="all">ทุกเดือน</option>
              {availableMonths.map((month) => (
                <option key={month} value={month}>
                  {monthNames[month - 1]}
                </option>
              ))}
            </select>
          </div>

          {/* Year Filter */}
          <div>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value === "all" ? "all" : Number(e.target.value))}
              className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="all">ทุกปี</option>
              {availableYears.map((year) => (
                <option key={year} value={year}>
                  {year + 543}
                </option>
              ))}
            </select>
          </div>

          {/* Clear Filters Button */}
          {(selectedDay !== "all" || selectedMonth !== "all" || selectedYear !== "all") && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors"
            >
              ล้างตัวกรอง
            </button>
          )}

          {/* Results Count */}
          <div className="ml-auto text-sm text-gray-600 dark:text-gray-400">
            แสดง <span className="font-semibold text-teal-600 dark:text-teal-400">{filteredTankEntries.length}</span> รายการ
          </div>
        </div>
      </motion.div>

      {/* Tank Entry Book Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden"
      >
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-800 dark:text-white">
              สมุดตั้งพัก (รูปแบบสมุดบันทึก)
            </h2>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              บันทึกรายการน้ำมันที่ลงหลุม แยกตามวันที่ รหัสหลุม และประเภทน้ำมัน
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b-2 border-red-300 dark:border-red-700 bg-gray-50 dark:bg-gray-900/60">
                <th className="py-3 px-4 text-left font-semibold text-gray-600 dark:text-gray-300 border-r border-red-200 dark:border-red-800">
                  ด/ป/ว
                </th>
                <th className="py-3 px-4 text-center font-semibold text-gray-600 dark:text-gray-300 border-r border-red-200 dark:border-red-800">
                  รหัส
                </th>
                <th className="py-3 px-4 text-left font-semibold text-gray-600 dark:text-gray-300 border-r border-red-200 dark:border-red-800">
                  ประเภทน้ำมัน
                </th>
                <th className="py-3 px-4 text-right font-semibold text-gray-600 dark:text-gray-300 border-r border-red-200 dark:border-red-800">
                  จำนวน 1
                </th>
                <th className="py-3 px-4 text-right font-semibold text-gray-600 dark:text-gray-300 border-r border-red-200 dark:border-red-800">
                  จำนวน 2
                </th>
                <th className="py-3 px-4 text-right font-semibold text-gray-600 dark:text-gray-300 border-r border-red-200 dark:border-red-800">
                  จำนวน 3
                </th>
                <th className="py-3 px-4 text-center font-semibold text-gray-600 dark:text-gray-300">
                  การดำเนินการ
                </th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(groupedByDate).map(([date, entries]) => (
                <React.Fragment key={date}>
                  {entries.map((entry, index) => {
                    const isEditing = editingId === entry.id;
                    const displayEntry = isEditing && editForm ? editForm : entry;

                    return (
                      <motion.tr
                        key={entry.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className={`border-b border-red-200 dark:border-red-800 hover:bg-gray-50 dark:hover:bg-gray-900/40 ${
                          index === 0 ? "border-t-2 border-red-300 dark:border-red-700" : ""
                        }`}
                      >
                        {/* ด/ป/ว */}
                        <td className="py-2 px-4 text-left font-semibold text-gray-800 dark:text-gray-100 border-r border-red-200 dark:border-red-800">
                          {isEditing ? (
                            <input
                              type="text"
                              value={displayEntry.date}
                              onChange={(e) => setEditForm(prev => prev ? { ...prev, date: e.target.value } : null)}
                              className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-white text-sm"
                            />
                          ) : (
                            entry.date
                          )}
                        </td>

                        {/* รหัส */}
                        <td className="py-2 px-4 text-center font-semibold text-gray-800 dark:text-gray-100 border-r border-red-200 dark:border-red-800">
                          {isEditing ? (
                            <input
                              type="number"
                              value={displayEntry.tankId}
                              onChange={(e) => setEditForm(prev => prev ? { ...prev, tankId: Number(e.target.value) } : null)}
                              className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-white text-sm text-center"
                            />
                          ) : (
                            entry.tankId
                          )}
                        </td>

                        {/* ประเภทน้ำมัน */}
                        <td className="py-2 px-4 text-left text-gray-800 dark:text-gray-100 border-r border-red-200 dark:border-red-800">
                          {isEditing ? (
                            <input
                              type="text"
                              value={displayEntry.fuelType}
                              onChange={(e) => setEditForm(prev => prev ? { ...prev, fuelType: e.target.value } : null)}
                              className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-white text-sm"
                            />
                          ) : (
                            entry.fuelType
                          )}
                        </td>

                        {/* จำนวน 1 */}
                        <td className="py-2 px-4 text-right text-gray-800 dark:text-gray-100 border-r border-red-200 dark:border-red-800">
                          {isEditing ? (
                            <input
                              type="text"
                              value={displayEntry.quantity1}
                              onChange={(e) => setEditForm(prev => prev ? { ...prev, quantity1: e.target.value } : null)}
                              placeholder="เช่น 16000+9000"
                              className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-white text-sm text-right"
                            />
                          ) : (
                            <span>{formatQuantity(entry.quantity1) || "-"}</span>
                          )}
                        </td>

                        {/* จำนวน 2 */}
                        <td className="py-2 px-4 text-right text-gray-800 dark:text-gray-100 border-r border-red-200 dark:border-red-800">
                          {isEditing ? (
                            <input
                              type="text"
                              value={displayEntry.quantity2}
                              onChange={(e) => setEditForm(prev => prev ? { ...prev, quantity2: e.target.value } : null)}
                              placeholder="เช่น 8000"
                              className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-white text-sm text-right"
                            />
                          ) : (
                            <span>{formatQuantity(entry.quantity2) || "-"}</span>
                          )}
                        </td>

                        {/* จำนวน 3 */}
                        <td className="py-2 px-4 text-right text-gray-800 dark:text-gray-100 border-r border-red-200 dark:border-red-800">
                          {isEditing ? (
                            <input
                              type="text"
                              value={displayEntry.quantity3}
                              onChange={(e) => setEditForm(prev => prev ? { ...prev, quantity3: e.target.value } : null)}
                              placeholder="เช่น 8000"
                              className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-white text-sm text-right"
                            />
                          ) : (
                            <span>{formatQuantity(entry.quantity3) || "-"}</span>
                          )}
                        </td>

                        {/* การดำเนินการ */}
                        <td className="py-2 px-4 text-center border-r border-red-200 dark:border-red-800">
                          <div className="flex items-center justify-center gap-2">
                            {isEditing ? (
                              <>
                                <button
                                  onClick={handleSaveEdit}
                                  className="p-1.5 bg-green-500 hover:bg-green-600 text-white rounded transition-colors"
                                  title="บันทึก"
                                >
                                  <Save className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={handleCancelEdit}
                                  className="p-1.5 bg-gray-500 hover:bg-gray-600 text-white rounded transition-colors"
                                  title="ยกเลิก"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleStartEdit(entry)}
                                  className="p-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
                                  title="แก้ไข"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete(entry.id)}
                                  className="p-1.5 bg-red-500 hover:bg-red-600 text-white rounded transition-colors"
                                  title="ลบ"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleToggleVerify(entry.id)}
                                  className={`p-1.5 rounded transition-colors ${
                                    entry.isVerified
                                      ? "bg-green-500 hover:bg-green-600 text-white"
                                      : "bg-gray-300 hover:bg-gray-400 text-gray-700 dark:bg-gray-600 dark:text-gray-300"
                                  }`}
                                  title={entry.isVerified ? "ยกเลิกการยืนยัน" : "ยืนยัน"}
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </React.Fragment>
              ))}
            </tbody>
            {/* Footer Summary */}
            <tfoot>
              <tr className="border-t-2 border-red-300 dark:border-red-700 bg-gray-50 dark:bg-gray-900/60">
                <td className="py-3 px-4 text-left font-bold text-gray-800 dark:text-white border-r border-red-200 dark:border-red-800" colSpan={3}>
                  รวม
                </td>
                <td className="py-3 px-4 text-right font-bold text-gray-800 dark:text-white border-r border-red-200 dark:border-red-800">
                  {integerFormatter.format(totals.quantity1)}
                </td>
                <td className="py-3 px-4 text-right font-bold text-gray-800 dark:text-white border-r border-red-200 dark:border-red-800">
                  {integerFormatter.format(totals.quantity2)}
                </td>
                <td className="py-3 px-4 text-right font-bold text-gray-800 dark:text-white border-r border-red-200 dark:border-red-800">
                  {integerFormatter.format(totals.quantity3)}
                </td>
                <td className="py-3 px-4 text-center text-gray-600 dark:text-gray-400">
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

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        จำนวน 1
                      </label>
                      <input
                        type="text"
                        value={newEntry.quantity1}
                        onChange={(e) => setNewEntry({ ...newEntry, quantity1: e.target.value })}
                        placeholder="เช่น 16000+9000"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        จำนวน 2
                      </label>
                      <input
                        type="text"
                        value={newEntry.quantity2}
                        onChange={(e) => setNewEntry({ ...newEntry, quantity2: e.target.value })}
                        placeholder="เช่น 8000"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        จำนวน 3
                      </label>
                      <input
                        type="text"
                        value={newEntry.quantity3}
                        onChange={(e) => setNewEntry({ ...newEntry, quantity3: e.target.value })}
                        placeholder="เช่น 8000"
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
                    className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors flex items-center gap-2"
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
