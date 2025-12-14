import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Trash2,
  Edit2,
  FileText
} from "lucide-react";

// Interface for Purchase Ledger Entry
interface PurchaseEntry {
  id: string;
  date: string; // "DD/MM/YY"
  code: string; // Code e.g. "34", "59"
  product: string; // Product e.g. "HSD"
  remark: string; // Remark e.g. "เปิดจาก..."
  volume: number; // Liters
  priceA: number; // Ex-VAT Price
  priceB: number; // Reference Price (e.g. Market Price)
  amount: number; // Total Amount (inc. VAT)
}

// Mock Data based on the user's image (approximate values)
// Calculation Logic found: Amount = Volume * PriceA * 1.07 (VAT 7%)
const initialData: PurchaseEntry[] = [
  {
    id: "1",
    date: "17/10/68",
    code: "83",
    product: "E 20",
    remark: "(เปิดจาก ตค.)",
    volume: 500,
    priceA: 30.49,
    priceB: 30.49,
    amount: 15245.00 // 500 * 30.49 = 15245 (Seems no VAT or included? Image says 15245) - Let's assume this one is flat.
  },
  {
    id: "2",
    date: "17/10/68",
    code: "59",
    product: "6SH91",
    remark: "",
    volume: 4000,
    priceA: 28.8372,
    priceB: 32.33,
    amount: 123423.22 // 4000 * 28.8372 * 1.07 = 123,423.216 Correct.
  },
  {
    id: "3",
    date: "17/10/68",
    code: "18",
    product: "6SH95",
    remark: "",
    volume: 4000,
    priceA: 29.1830,
    priceB: 32.70,
    amount: 124903.24 // 4000 * 29.1830 * 1.07 = 124,903.24 Correct.
  },
  {
    id: "4",
    date: "17/10/68",
    code: "34",
    product: "HSD",
    remark: "ป/ต",
    volume: 7000,
    priceA: 28.5227,
    priceB: 31.99,
    amount: 213635.02 // 7000 * 28.5227 * 1.07 = 213,635.023 Correct.
  }
];

export default function PurchaseBook() {
  const [entries, setEntries] = useState<PurchaseEntry[]>(initialData);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // New Entry State
  const [newEntry, setNewEntry] = useState<Partial<PurchaseEntry>>({
    date: "",
    code: "",
    product: "",
    remark: "",
    volume: 0,
    priceA: 0,
    priceB: 0,
    amount: 0,
  });

  // Helper Formatter
  const formatNumber = (num: number, decimals: number = 2) => {
    return new Intl.NumberFormat("th-TH", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(num);
  };

  // Helper Calculator
  const calculateAmount = (vol: number, priceA: number) => {
    // Logic: Volume * PriceA * 1.07 (VAT 7%)
    return Number((vol * priceA * 1.07).toFixed(2));
  };

  const handleRecalculate = () => {
    const vol = Number(newEntry.volume) || 0;
    const prA = Number(newEntry.priceA) || 0;
    const amt = calculateAmount(vol, prA);
    setNewEntry({ ...newEntry, amount: amt });
  };

  // CRUD
  const handleAdd = () => {
    if (!newEntry.date || !newEntry.product) return;
    const entry: PurchaseEntry = {
      id: Date.now().toString(),
      date: newEntry.date || "",
      code: newEntry.code || "",
      product: newEntry.product || "",
      remark: newEntry.remark || "",
      volume: Number(newEntry.volume) || 0,
      priceA: Number(newEntry.priceA) || 0,
      priceB: Number(newEntry.priceB) || 0,
      amount: Number(newEntry.amount) || 0,
    };
    setEntries([...entries, entry]);
    setNewEntry({ ...newEntry, code: "", product: "", remark: "", volume: 0, priceA: 0, priceB: 0, amount: 0 }); // reset fields but keep date
    setIsAdding(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("ต้องการลบรายการนี้ใช่หรือไม่?")) {
      setEntries(entries.filter(e => e.id !== id));
    }
  };

  const handleEdit = (entry: PurchaseEntry) => {
    setEditingId(entry.id);
    setNewEntry({ ...entry });
  };

  const handleSaveEdit = () => {
    if (!editingId) return;
    setEntries(entries.map(e => e.id === editingId ? { ...e, ...newEntry } as PurchaseEntry : e));
    setEditingId(null);
    setNewEntry({ date: "", code: "", product: "", remark: "", volume: 0, priceA: 0, priceB: 0, amount: 0 });
  };

  // Grouping
  const groupedEntries = useMemo(() => {
    const groups: { [key: string]: PurchaseEntry[] } = {};
    entries.forEach(entry => {
      if (!groups[entry.date]) groups[entry.date] = [];
      groups[entry.date].push(entry);
    });
    return groups;
  }, [entries]);

  // Totals
  const totalVolume = entries.reduce((sum, e) => sum + e.volume, 0);
  const totalAmount = entries.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-display">
              สมุดซื้อน้ำมัน
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              บันทึกการซื้อน้ำมัน (Purchase Ledger)
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden md:block">
            <p className="text-xs text-gray-500">ยอดรวมทั้งหมด</p>
            <p className="text-xl font-bold text-emerald-600">{formatNumber(totalAmount)} บ.</p>
          </div>
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            เพิ่มรายการ
          </button>
        </div>
      </motion.div>

      {/* Form */}
      <AnimatePresence>
        {(isAdding || editingId) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-indigo-200 dark:border-indigo-900 mb-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
                {editingId ? "แก้ไขรายการ" : "เพิ่มรายการใหม่"}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-8 gap-4">
                <div className="md:col-span-1 space-y-1">
                  <label className="text-xs font-medium text-gray-500">วันที่</label>
                  <input type="text" placeholder="17/10/68" value={newEntry.date} onChange={e => setNewEntry({ ...newEntry, date: e.target.value })} className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600" />
                </div>
                <div className="md:col-span-1 space-y-1">
                  <label className="text-xs font-medium text-gray-500">เบอร์</label>
                  <input type="text" placeholder="34" value={newEntry.code} onChange={e => setNewEntry({ ...newEntry, code: e.target.value })} className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600" />
                </div>
                <div className="md:col-span-1 space-y-1">
                  <label className="text-xs font-medium text-gray-500">สินค้า</label>
                  <input type="text" placeholder="HSD" value={newEntry.product} onChange={e => setNewEntry({ ...newEntry, product: e.target.value })} className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600" />
                </div>
                <div className="md:col-span-1 space-y-1">
                  <label className="text-xs font-medium text-gray-500">หมายเหตุ</label>
                  <input type="text" placeholder="" value={newEntry.remark} onChange={e => setNewEntry({ ...newEntry, remark: e.target.value })} className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600" />
                </div>
                <div className="md:col-span-1 space-y-1">
                  <label className="text-xs font-medium text-gray-500">ปริมาณ (ลิตร)</label>
                  <input type="number" placeholder="0" value={newEntry.volume}
                    onChange={e => {
                      const val = parseFloat(e.target.value);
                      setNewEntry({ ...newEntry, volume: val });
                    }}
                    onBlur={handleRecalculate}
                    className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 text-right" />
                </div>
                <div className="md:col-span-1 space-y-1">
                  <label className="text-xs font-medium text-gray-500">ราคาซื้อ (Ex-VAT)</label>
                  <input type="number" placeholder="0.0000" value={newEntry.priceA}
                    onChange={e => {
                      const val = parseFloat(e.target.value);
                      setNewEntry({ ...newEntry, priceA: val });
                    }}
                    onBlur={handleRecalculate}
                    className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 text-right" />
                </div>
                <div className="md:col-span-1 space-y-1">
                  <label className="text-xs font-medium text-gray-500">ราคาหน้าป้าย</label>
                  <input type="number" placeholder="0.00" value={newEntry.priceB} onChange={e => setNewEntry({ ...newEntry, priceB: parseFloat(e.target.value) })} className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 text-right" />
                </div>
                <div className="md:col-span-1 space-y-1">
                  <label className="text-xs font-medium text-gray-500">จำนวนเงิน (Inc.VAT)</label>
                  <div className="relative">
                    <input type="number" value={newEntry.amount} onChange={e => setNewEntry({ ...newEntry, amount: parseFloat(e.target.value) })} className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 text-right font-bold text-emerald-600" />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button onClick={() => { setIsAdding(false); setEditingId(null); }} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg dark:text-gray-300 dark:hover:bg-gray-700">ยกเลิก</button>
                <button onClick={editingId ? handleSaveEdit : handleAdd} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-lg shadow-indigo-500/30">
                  {editingId ? "บันทึก" : "เพิ่ม"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px]">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700 text-left text-xs uppercase tracking-wider text-gray-500 font-semibold">
                <th className="py-4 px-4 w-32">วันที่</th>
                <th className="py-4 px-4 w-16 text-center">เบอร์</th>
                <th className="py-4 px-4 w-24">สินค้า</th>
                <th className="py-4 px-4">รายการ</th>
                <th className="py-4 px-4 text-right w-32">ปริมาณ</th>
                <th className="py-4 px-4 text-right w-28">ราคาซื้อ</th>
                <th className="py-4 px-4 text-right w-28">ราคาป้าย</th>
                <th className="py-4 px-4 text-right w-36">จำนวนเงิน</th>
                <th className="py-4 px-4 text-center w-24">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {Object.keys(groupedEntries).map(date => (
                <React.Fragment key={date}>
                  {groupedEntries[date].map((entry, index) => (
                    <tr key={entry.id} className="hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-colors group">
                      <td className={`py-3 px-4 align-top ${index === 0 ? "text-gray-900 dark:text-white font-medium" : "text-transparent"}`}>
                        {index === 0 ? entry.date : entry.date}
                      </td>
                      <td className="py-3 px-4 text-center text-gray-500 dark:text-gray-400">{entry.code}</td>
                      <td className="py-3 px-4 font-medium text-indigo-600 dark:text-indigo-400">{entry.product}</td>
                      <td className="py-3 px-4 text-gray-500 dark:text-gray-400 text-sm">{entry.remark}</td>
                      <td className="py-3 px-4 text-right font-bold text-gray-800 dark:text-white">{formatNumber(entry.volume, 0)}</td>
                      <td className="py-3 px-4 text-right text-gray-600 dark:text-gray-300">{formatNumber(entry.priceA, 4)}</td>
                      <td className="py-3 px-4 text-right text-gray-500 dark:text-gray-400">{formatNumber(entry.priceB, 2)}</td>
                      <td className="py-3 px-4 text-right font-bold text-emerald-600 dark:text-emerald-400">{formatNumber(entry.amount, 2)}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleEdit(entry)} className="p-1.5 text-indigo-600 hover:bg-indigo-100 rounded-lg dark:hover:bg-indigo-900/30">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(entry.id)} className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg dark:hover:bg-red-900/30">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-gray-50 dark:bg-gray-800/50">
                    <td colSpan={9} className="h-1 p-0 border-t border-gray-200 dark:border-gray-700"></td>
                  </tr>
                </React.Fragment>
              ))}
              {/* Total Row */}
              {entries.length > 0 && (
                <tr className="bg-indigo-50 dark:bg-indigo-900/20 font-bold text-gray-900 dark:text-white">
                  <td colSpan={4} className="py-4 px-4 text-right">รวมทั้งสิ้น</td>
                  <td className="py-4 px-4 text-right">{formatNumber(totalVolume, 0)}</td>
                  <td colSpan={2}></td>
                  <td className="py-4 px-4 text-right text-emerald-600 dark:text-emerald-400">{formatNumber(totalAmount, 2)}</td>
                  <td></td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
