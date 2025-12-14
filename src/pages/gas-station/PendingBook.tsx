import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Trash2,
  Edit2,
  Calculator,
  FileText
} from "lucide-react";

// Interface for Ledger Entry
interface LedgerEntry {
  id: string;
  date: string; // "DD/MM/YY" e.g., "7/7/68"
  code: string; // e.g., "34", "59"
  product: string; // e.g., "HSD", "6SH91"
  breakdown: string; // e.g., "16000+8000+3000"
  price: number; // Unit price
}

// Mock Data based on the user's image
const initialData: LedgerEntry[] = [
  { id: "1", date: "7/7/68", code: "34", product: "HSD", breakdown: "16000+8000+3000+7000+8000+15000", price: 32.49 },
  { id: "2", date: "7/7/68", code: "59", product: "6SH91", breakdown: "3000+4000+4000", price: 33.03 },
  { id: "3", date: "7/7/68", code: "18", product: "6SH95", breakdown: "4000", price: 33.40 },
  { id: "4", date: "7/7/68", code: "83", product: "B 20", breakdown: "4000", price: 29.54 },
  { id: "5", date: "7/7/68", code: "91", product: "E 85", breakdown: "", price: 25.00 },
  { id: "6", date: "7/7/68", code: "75", product: "HSP", breakdown: "", price: 35.00 },
  { id: "7", date: "8/7/68", code: "34", product: "HSD", breakdown: "8000+15000+7000+8000", price: 32.49 },
  { id: "8", date: "8/7/68", code: "59", product: "6SH91", breakdown: "4000+4000", price: 33.03 },
];

export default function PendingBook() {
  const [entries, setEntries] = useState<LedgerEntry[]>(initialData);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // New Entry State
  const [newEntry, setNewEntry] = useState<Partial<LedgerEntry>>({
    date: "",
    code: "",
    product: "",
    breakdown: "",
    price: 0,
  });

  // Calculate sum from breakdown string (e.g., "1000+2000" -> 3000)
  const calculateVolume = (breakdown: string): number => {
    if (!breakdown) return 0;
    try {
      return breakdown
        .split("+")
        .map((val) => parseFloat(val.trim()) || 0)
        .reduce((acc, curr) => acc + curr, 0);
    } catch (e) {
      return 0;
    }
  };

  // Safe number formatter
  const formatNumber = (num: number, decimals: number = 0) => {
    return new Intl.NumberFormat("th-TH", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(num);
  };

  // CRUD Operations
  const handleAdd = () => {
    if (!newEntry.date || !newEntry.code) return; // Basic validation
    const entry: LedgerEntry = {
      id: Date.now().toString(),
      date: newEntry.date || "",
      code: newEntry.code || "",
      product: newEntry.product || "",
      breakdown: newEntry.breakdown || "",
      price: newEntry.price || 0,
    };
    setEntries([...entries, entry]);
    setNewEntry({ date: entry.date, code: "", product: "", breakdown: "", price: 0 }); // Keep date for convenience
    setIsAdding(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("ต้องการลบรายการนี้ใช่หรือไม่?")) {
      setEntries(entries.filter((e) => e.id !== id));
    }
  };

  const handleEdit = (entry: LedgerEntry) => {
    setEditingId(entry.id);
    setNewEntry({ ...entry });
  };

  const handleSaveEdit = () => {
    if (!editingId) return;
    setEntries(
      entries.map((e) =>
        e.id === editingId
          ? { ...e, ...newEntry } as LedgerEntry
          : e
      )
    );
    setEditingId(null);
    setNewEntry({ date: "", code: "", product: "", breakdown: "", price: 0 });
  };

  // Group entries by Date for visual separation
  const groupedEntries = useMemo(() => {
    const groups: { [key: string]: LedgerEntry[] } = {};
    entries.forEach((entry) => {
      if (!groups[entry.date]) groups[entry.date] = [];
      groups[entry.date].push(entry);
    });
    return groups;
  }, [entries]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-display">
              สมุดตั้งพัก
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              บันทึกรายการน้ำมันตั้งพัก (Suspense Ledger)
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          เพิ่มรายการ
        </button>
      </motion.div>

      {/* Add Entry Form */}
      <AnimatePresence>
        {(isAdding || editingId) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-blue-200 dark:border-blue-900 mb-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
                {editingId ? "แก้ไขรายการ" : "เพิ่มรายการใหม่"}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-500">วันที่ (ว/ด/ป)</label>
                  <input
                    type="text"
                    placeholder="7/7/68"
                    value={newEntry.date}
                    onChange={(e) => setNewEntry({ ...newEntry, date: e.target.value })}
                    className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-500">เบอร์</label>
                  <input
                    type="text"
                    placeholder="34"
                    value={newEntry.code}
                    onChange={(e) => setNewEntry({ ...newEntry, code: e.target.value })}
                    className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-500">สินค้า</label>
                  <input
                    type="text"
                    placeholder="HSD"
                    value={newEntry.product}
                    onChange={(e) => setNewEntry({ ...newEntry, product: e.target.value })}
                    className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
                <div className="md:col-span-2 space-y-1">
                  <label className="text-xs font-medium text-gray-500">
                    รายการคำนวณ (ใช้เครื่องหมาย +)
                  </label>
                  <div className="relative">
                    <Calculator className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="1000+2000+3000"
                      value={newEntry.breakdown}
                      onChange={(e) => setNewEntry({ ...newEntry, breakdown: e.target.value })}
                      className="w-full pl-9 p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 font-mono text-sm"
                    />
                  </div>
                  <div className="text-right text-xs text-blue-600 font-mono">
                    = {formatNumber(calculateVolume(newEntry.breakdown || ""))}
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-500">ราคา/หน่วย</label>
                  <input
                    type="number"
                    value={newEntry.price}
                    onChange={(e) => setNewEntry({ ...newEntry, price: parseFloat(e.target.value) })}
                    className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 text-right"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => {
                    setIsAdding(false);
                    setEditingId(null);
                    setNewEntry({ date: "", code: "", product: "", breakdown: "", price: 0 });
                  }}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={editingId ? handleSaveEdit : handleAdd}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-500/30"
                >
                  {editingId ? "บันทึกการแก้ไข" : "เพิ่มรายการ"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ledger Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px]">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700 text-left">
                <th className="py-4 px-4 font-semibold text-gray-600 dark:text-gray-300 w-32">วันที่</th>
                <th className="py-4 px-4 font-semibold text-gray-600 dark:text-gray-300 w-20 text-center">เบอร์</th>
                <th className="py-4 px-4 font-semibold text-gray-600 dark:text-gray-300 w-24">สินค้า</th>
                <th className="py-4 px-4 font-semibold text-gray-600 dark:text-gray-300">รายการคำนวณ</th>
                <th className="py-4 px-4 font-semibold text-gray-600 dark:text-gray-300 text-right w-32">ปริมาณรวม</th>
                <th className="py-4 px-4 font-semibold text-gray-600 dark:text-gray-300 text-right w-28">ราคา</th>
                <th className="py-4 px-4 font-semibold text-gray-600 dark:text-gray-300 text-right w-36">จำนวนเงิน</th>
                <th className="py-4 px-4 font-semibold text-gray-600 dark:text-gray-300 w-24 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {Object.keys(groupedEntries).map((date) => (
                <React.Fragment key={date}>
                  {groupedEntries[date].map((entry, index) => {
                    const totalVol = calculateVolume(entry.breakdown);
                    const totalAmount = totalVol * entry.price;
                    return (
                      <tr
                        key={entry.id}
                        className="hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors group"
                      >
                        {/* Display Date only on first row of the group, or transparently on others to keep alignment */}
                        <td className={`py-3 px-4 align-top ${index === 0 ? "text-gray-900 dark:text-white font-medium" : "text-transparent"}`}>
                          {index === 0 ? entry.date : entry.date}
                        </td>
                        <td className="py-3 px-4 text-center text-gray-500 dark:text-gray-400 font-mono">
                          {entry.code}
                        </td>
                        <td className="py-3 px-4 font-medium text-blue-600 dark:text-blue-400">
                          {entry.product}
                        </td>
                        <td className="py-3 px-4 text-gray-600 dark:text-gray-300 font-mono text-sm">
                          {entry.breakdown || "-"}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-gray-800 dark:text-white">
                          {formatNumber(totalVol)}
                        </td>
                        <td className="py-3 px-4 text-right text-gray-500 dark:text-gray-400">
                          {formatNumber(entry.price, 2)}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-emerald-600 dark:text-emerald-400">
                          {formatNumber(totalAmount, 2)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleEdit(entry)}
                              className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg dark:hover:bg-blue-900/30"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(entry.id)}
                              className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg dark:hover:bg-red-900/30"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {/* Ledger Line Separator after each date group */}
                  <tr className="bg-gray-100 dark:bg-gray-800 h-1">
                    <td colSpan={8} className="p-0 border-t border-double border-gray-300 dark:border-gray-600" />
                  </tr>
                </React.Fragment>
              ))}
              {entries.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400">
                    <div className="flex flex-col items-center gap-3">
                      <FileText className="w-12 h-12 text-gray-300 dark:text-gray-600" />
                      <p>ยังไม่มีรายการบันทึก</p>
                      <button
                        onClick={() => setIsAdding(true)}
                        className="text-blue-500 hover:text-blue-600 text-sm font-medium"
                      >
                        เพิ่มรายการแรก
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
