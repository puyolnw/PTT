import { useMemo, useState } from "react";
import { 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Building2,
  Receipt
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { useGasStation } from "@/contexts/GasStationContext";
import { useBranch } from "@/contexts/BranchContext";
import ChartCard from "@/components/ChartCard";
import StatusTag from "@/components/StatusTag";

const currencyFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 2,
});

type PaymentStatus = "paid" | "unpaid";

export default function InternalAPAR() {
  const { branches, saleTxs } = useGasStation();
  const { selectedBranches } = useBranch();
  const selectedBranchIds = useMemo(() => selectedBranches.map(id => Number(id)), [selectedBranches]);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | "all">("all");
  const [activeTab, setActiveTab] = useState<"summary" | "details">("summary");

  // Summary per Branch
  const branchSummaries = useMemo(() => {
    const map = new Map<number, {
      branchId: number;
      branchName: string;
      totalAR: number; // ลูกหนี้ (เงินที่จะได้)
      totalAP: number; // เจ้าหนี้ (เงินที่ต้องจ่าย)
      unpaidAR: number;
      unpaidAP: number;
    }>();

    // Initialize map with all branches
    branches.forEach(b => {
      map.set(b.id, {
        branchId: b.id,
        branchName: b.name,
        totalAR: 0,
        totalAP: 0,
        unpaidAR: 0,
        unpaidAP: 0
      });
    });

    // Process transactions
    saleTxs.forEach(tx => {
      const seller = map.get(tx.fromBranchId);
      const buyer = map.get(tx.toBranchId);

      if (seller) {
        seller.totalAR += tx.totalAmount;
        if (tx.paymentStatus === "unpaid") seller.unpaidAR += tx.totalAmount;
      }
      if (buyer) {
        buyer.totalAP += tx.totalAmount;
        if (tx.paymentStatus === "unpaid") buyer.unpaidAP += tx.totalAmount;
      }
    });

    return Array.from(map.values()).filter(s => 
      selectedBranchIds.length === 0 || selectedBranchIds.includes(s.branchId)
    );
  }, [branches, saleTxs, selectedBranchIds]);

  // Overall stats
  const stats = useMemo(() => {
    let ar = 0;
    let ap = 0;

    branchSummaries.forEach(s => {
      ar += s.unpaidAR;
      ap += s.unpaidAP;
    });

    return { 
      totalUnpaidAR: ar, 
      totalUnpaidAP: ap,
      netBalance: ar - ap
    };
  }, [branchSummaries]);

  // Filtered transactions
  const filteredTxs = useMemo(() => {
    return saleTxs.filter(tx => {
      const matchStatus = statusFilter === "all" || tx.paymentStatus === statusFilter;
      const matchBranch = selectedBranchIds.length === 0 || 
                         selectedBranchIds.includes(tx.fromBranchId) || 
                         selectedBranchIds.includes(tx.toBranchId);
      const s = searchTerm.toLowerCase();
      const matchSearch = !s || 
                         tx.fromBranchName.toLowerCase().includes(s) ||
                         tx.toBranchName.toLowerCase().includes(s) ||
                         tx.deliveryNoteNo.toLowerCase().includes(s) ||
                         tx.receiptNo.toLowerCase().includes(s);
      
      return matchStatus && matchBranch && matchSearch;
    }).sort((a,b) => b.createdAt.localeCompare(a.createdAt));
  }, [saleTxs, statusFilter, selectedBranchIds, searchTerm]);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600 dark:text-blue-400">
            <DollarSign className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              ระบบเจ้าหนี้ / ลูกหนี้ ภายใน
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              สรุปยอดหนี้จากการขายน้ำมันระหว่างสาขา (Inter-branch Transactions)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white/50 dark:bg-gray-800/50 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm backdrop-blur-sm">
          <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            สาขาที่กำลังดู: {selectedBranches.length === 0 ? "ทั้งหมด" : selectedBranches.map(id => branches.find(b => String(b.id) === id)?.name || id).join(", ")}
          </span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <ChartCard title="ยอดลูกหนี้ (ค้างรับ)" icon={ArrowUpRight} className="border-l-4 border-emerald-500">
            <div className="mt-2">
              <span className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                {currencyFormatter.format(stats.totalUnpaidAR)}
              </span>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                จาก {filteredTxs.filter(t => t.paymentStatus === 'unpaid').length} รายการ
              </p>
            </div>
          </ChartCard>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <ChartCard title="ยอดเจ้าหนี้ (ค้างจ่าย)" icon={ArrowDownLeft} className="border-l-4 border-rose-500">
            <div className="mt-2">
              <span className="text-3xl font-bold text-rose-600 dark:text-rose-400">
                {currencyFormatter.format(stats.totalUnpaidAP)}
              </span>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                น้ำมันที่รับมาแต่ยังไม่ได้ชำระเงิน
              </p>
            </div>
          </ChartCard>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <ChartCard title="ดุลการชำระรวม" icon={Building2} className="border-l-4 border-blue-500">
            <div className="mt-2">
              <span className={`text-3xl font-bold ${stats.netBalance >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-rose-600'}`}>
                {currencyFormatter.format(Math.abs(stats.netBalance))}
              </span>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                {stats.netBalance >= 0 ? 'สถานะ: เกินดุล (ค้างรับมากกว่า)' : 'สถานะ: ขาดดุล (ค้างจ่ายมากกว่า)'}
              </p>
            </div>
          </ChartCard>
        </motion.div>
      </div>

      {/* Main Content Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="flex border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <button 
            onClick={() => setActiveTab("summary")}
            className={`px-6 py-4 text-sm font-semibold transition-colors relative ${activeTab === "summary" ? "text-blue-600 dark:text-blue-400" : "text-gray-500 hover:text-gray-700"}`}
          >
            สรุปยอดรายสาขา
            {activeTab === "summary" && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400" />}
          </button>
          <button 
            onClick={() => setActiveTab("details")}
            className={`px-6 py-4 text-sm font-semibold transition-colors relative ${activeTab === "details" ? "text-blue-600 dark:text-blue-400" : "text-gray-500 hover:text-gray-700"}`}
          >
            รายการค้างชำระทั้งหมด
            {activeTab === "details" && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400" />}
          </button>
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            {activeTab === "summary" ? (
              <motion.div 
                key="summary"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="overflow-x-auto"
              >
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left bg-gray-50 dark:bg-gray-700/50">
                      <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-300 rounded-l-xl">สาขา</th>
                      <th className="px-6 py-4 font-semibold text-emerald-600 dark:text-emerald-400 text-right">ลูกหนี้ (เงินรอเข้า)</th>
                      <th className="px-6 py-4 font-semibold text-rose-600 dark:text-rose-400 text-right">เจ้าหนี้ (เงินรอจ่าย)</th>
                      <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-300 text-right">ดุลค้างชำระ</th>
                      <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-300 text-center rounded-r-xl">สถานะ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {branchSummaries.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500">ไม่พบข้อมูล</td>
                      </tr>
                    ) : (
                      branchSummaries.map((s) => (
                        <tr key={s.branchId} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 text-[10px] font-bold">
                                {s.branchId}
                              </div>
                              <span className="font-medium text-gray-900 dark:text-white">{s.branchName}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right font-medium text-emerald-600 dark:text-emerald-400">
                            {currencyFormatter.format(s.unpaidAR)}
                          </td>
                          <td className="px-6 py-4 text-right font-medium text-rose-600 dark:text-rose-400">
                            {currencyFormatter.format(s.unpaidAP)}
                          </td>
                          <td className="px-6 py-4 text-right font-bold text-gray-900 dark:text-white">
                            {currencyFormatter.format(s.unpaidAR - s.unpaidAP)}
                          </td>
                          <td className="px-6 py-4 text-center">
                            {(s.unpaidAR === 0 && s.unpaidAP === 0) ? (
                              <StatusTag variant="neutral">ไม่มีค้าง</StatusTag>
                            ) : (
                              <StatusTag variant={s.unpaidAR >= s.unpaidAP ? "success" : "danger"}>
                                {s.unpaidAR >= s.unpaidAP ? "ค้างรับมากกว่า" : "ค้างจ่ายมากกว่า"}
                              </StatusTag>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </motion.div>
            ) : (
              <motion.div 
                key="details"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* Search and Filters */}
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  <div className="relative flex-1">
                    <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input 
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="ค้นหา: เลขที่บิล, สาขาต้นทาง/ปลายทาง..."
                      className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-400" />
                    <select 
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as PaymentStatus | "all")}
                      className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="all">ทุกสถานะการเงิน</option>
                      <option value="unpaid">ค้างชำระ</option>
                      <option value="paid">ชำระแล้ว</option>
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left bg-gray-50 dark:bg-gray-700/50">
                        <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-300 rounded-l-xl">วันที่ - บิล</th>
                        <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-300">ลูกหนี้ (ผู้ซื้อ)</th>
                        <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-300">เจ้าหนี้ (ผู้ขาย)</th>
                        <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-300 text-right">จำนวนเงิน</th>
                        <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-300 text-center">สถานะ</th>
                        <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-300 text-center rounded-r-xl">ดำเนินการ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {filteredTxs.map((tx) => (
                        <tr key={tx.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="font-medium text-gray-900 dark:text-white">{new Date(tx.createdAt).toLocaleDateString("th-TH")}</span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">{tx.deliveryNoteNo}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="p-1.5 bg-rose-50 dark:bg-rose-900/20 rounded-lg text-rose-600">
                                <ArrowDownLeft className="w-3.5 h-3.5" />
                              </div>
                              <span className="font-medium">{tx.toBranchName}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="p-1.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg text-emerald-600">
                                <ArrowUpRight className="w-3.5 h-3.5" />
                              </div>
                              <span className="font-medium">{tx.fromBranchName}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right font-bold text-gray-900 dark:text-white">
                            {currencyFormatter.format(tx.totalAmount)}
                          </td>
                          <td className="px-6 py-4 text-center">
                            {tx.paymentStatus === 'paid' ? (
                              <div className="flex items-center justify-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                                <CheckCircle2 className="w-4 h-4" />
                                <span>ชำระแล้ว</span>
                              </div>
                            ) : (
                              <div className="flex items-center justify-center gap-1.5 text-orange-600 dark:text-orange-400 font-semibold">
                                <Clock className="w-4 h-4" />
                                <span>ค้างชำระ</span>
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              {tx.paymentStatus === 'unpaid' && (
                                <button className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all shadow-md active:scale-95" title="ทำรายการชำระ">
                                  <DollarSign className="w-4 h-4" />
                                </button>
                              )}
                              <button className="p-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-all" title="พิมพ์หลักฐาน">
                                <Receipt className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Footer Info */}
      <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 p-4 rounded-xl flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-amber-800 dark:text-amber-200">
          <p className="font-semibold">หมายเหตุสำหรับการเคลียร์หนี้</p>
          <p className="mt-1 opacity-80">
            ระบบลูกหนี้/เจ้าหนี้เกิดจากการขายน้ำมันข้ามสาขา (ทิ้งน้ำมันค้างรถ หรือ ดูดน้ำมันมาขายต่อ) 
            การชำระเงินสามารถทำได้โดยตรงหรือหักลบกลบหนี้ (Settlement) ระหว่างสาขาได้ในช่วงสิ้นเดือน 
            ข้อมูลนี้จะส่งต่อไปยังระบบบัญชีส่วนกลางเพื่อทำใบลดหนี้/เพิ่มหนี้อย่างเป็นทางการ
          </p>
        </div>
      </div>
    </div>
  );
}
