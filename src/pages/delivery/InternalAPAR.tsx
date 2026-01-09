import { useState, useMemo } from "react";
import {
  History,
  Search,
  X,
  Droplet,
  FileText,
  Building2,
  Clock,
  MapPin,
  Check,
  Navigation,
  Eye,
  DollarSign,
  ArrowUpRight,
  ArrowDownLeft,
  Filter,
  Download,
  Receipt
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useGasStation } from "@/contexts/GasStationContext";
import { useBranch } from "@/contexts/BranchContext";
import { SaleTx } from "@/types/gasStation";
import StatusTag, { getStatusVariant } from "@/components/StatusTag";
import TableActionMenu from "@/components/TableActionMenu";

export default function InternalAPAR() {
  const { 
    branches, 
    saleTxs, 
    purchaseOrders
  } = useGasStation();
  const { selectedBranches } = useBranch();

  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"AR" | "AP">("AR"); // AR = ค้างรับ (Sales), AP = ค้างจ่าย (Purchases)
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTx, setSelectedTx] = useState<SaleTx | null>(null);

  // Formatting
  const currencyFormatter = useMemo(() => new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
  }), []);
  const numberFormatter = useMemo(() => new Intl.NumberFormat("th-TH"), []);

  const selectedBranchIds = useMemo(() => selectedBranches.map(id => Number(id)), [selectedBranches]);
  const ownBranchId = selectedBranchIds.length === 1 ? selectedBranchIds[0] : null;

  // Convert PurchaseOrders to internal virtual transactions
  const virtualTxs = useMemo(() => {
    const vtxs: SaleTx[] = [];
    purchaseOrders.forEach(po => {
      po.branches.forEach(b => {
        if (b.branchId !== 1) { // Others owe HQ (ID 1)
          vtxs.push({
            id: `po-${po.orderNo}-${b.branchId}`,
            source: "warehouse", 
            createdAt: po.orderDate + "T09:00:00Z",
            fromBranchId: 1,
            fromBranchName: "ปั๊มไฮโซ",
            toBranchId: b.branchId,
            toBranchName: b.branchName,
            oilType: b.items[0]?.oilType || "Diesel",
            quantity: b.items.reduce((sum, item) => sum + item.quantity, 0),
            pricePerLiter: b.items[0]?.pricePerLiter || 0,
            totalAmount: b.totalAmount,
            deliveryNoteNo: po.orderNo,
            receiptNo: po.supplierOrderNo || po.orderNo,
            purchaseOrderNo: po.orderNo,
            paymentStatus: "unpaid",
            paidAmount: 0,
            taxInvoices: [],
            paymentHistory: []
          });
        }
      });
    });
    return vtxs.filter(vtx => !saleTxs.some(stx => stx.id === vtx.id));
  }, [purchaseOrders, saleTxs]);

  const allTxs = useMemo(() => [...saleTxs, ...virtualTxs], [saleTxs, virtualTxs]);

  // Combined stats
  const stats = useMemo(() => {
    let ar = 0; // ค้างรับ
    let ap = 0; // ค้างจ่าย
    
    allTxs.forEach(tx => {
      const unpaid = tx.totalAmount - (tx.paidAmount || 0);
      if (ownBranchId) {
        if (tx.fromBranchId === ownBranchId) ar += unpaid;
        if (tx.toBranchId === ownBranchId) ap += unpaid;
      } else {
        // Global view logic: just sum everything for visibility
        // In real app, this might be more complex
        ar += unpaid; 
      }
    });

    return { ar, ap, net: ar - ap };
  }, [allTxs, ownBranchId]);

  const filteredTxs = useMemo(() => {
    return allTxs.filter(tx => {
      // Filter by Tab
      const isAR = ownBranchId ? tx.fromBranchId === ownBranchId : true;
      const isAP = ownBranchId ? tx.toBranchId === ownBranchId : true;
      
      if (activeTab === "AR" && !isAR) return false;
      if (activeTab === "AP" && !isAP) return false;

      // Filter by Branch Filter
      const matchesBranch = selectedBranchIds.length === 0 || 
                           selectedBranchIds.includes(tx.fromBranchId) || 
                           selectedBranchIds.includes(tx.toBranchId);
      if (!matchesBranch) return false;

      // Search
      const s = searchTerm.toLowerCase();
      const matchesSearch = !s || 
                           tx.fromBranchName.toLowerCase().includes(s) ||
                           tx.toBranchName.toLowerCase().includes(s) ||
                           tx.purchaseOrderNo?.toLowerCase().includes(s) ||
                           tx.deliveryNoteNo.toLowerCase().includes(s);
      
      return matchesSearch;
    }).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [allTxs, activeTab, selectedBranchIds, ownBranchId, searchTerm]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      {/* Header */}
      <header className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-2xl shadow-lg shadow-blue-600/20">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              เจ้าหนี้ / ลูกหนี้ ภายใน
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium flex items-center gap-2">
              <History className="w-4 h-4" />
              สรุปยอดหนี้จากการซื้อขายน้ำมันระหว่างสาขา
            </p>
          </div>
          <div className="flex items-center gap-2 bg-white/50 dark:bg-gray-800/50 px-4 py-2 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm backdrop-blur-sm">
            <MapPin className="w-4 h-4 text-blue-500" />
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              สาขาที่กำลังดู: {selectedBranches.length === 0 ? "ทั้งหมด" : selectedBranches.map(id => branches.find(b => String(b.id) === id)?.name || id).join(", ")}
            </span>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-gray-800 p-6 rounded-3xl border-l-4 border-emerald-500 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl">
              <ArrowUpRight className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">ยอดลูกหนี้ (ค้างรับ)</p>
              <p className="text-2xl font-black text-gray-900 dark:text-white">{currencyFormatter.format(stats.ar)}</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white dark:bg-gray-800 p-6 rounded-3xl border-l-4 border-rose-500 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-rose-50 dark:bg-rose-900/20 rounded-2xl">
              <ArrowDownLeft className="w-6 h-6 text-rose-500" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">ยอดเจ้าหนี้ (ค้างจ่าย)</p>
              <p className="text-2xl font-black text-gray-900 dark:text-white">{currencyFormatter.format(stats.ap)}</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white dark:bg-gray-800 p-6 rounded-3xl border-l-4 border-blue-500 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl">
              <DollarSign className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">ดุลการชำระคงเหลือ</p>
              <p className={`text-2xl font-black ${stats.net >= 0 ? 'text-blue-600' : 'text-rose-600'}`}>
                {currencyFormatter.format(Math.abs(stats.net))}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Tabs & Filter Bar */}
      <div className="flex flex-col gap-6 mb-6">
        <div className="flex p-1.5 bg-gray-100 dark:bg-gray-800 rounded-2xl w-fit">
          <button
            onClick={() => setActiveTab("AR")}
            className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all flex items-center gap-2 ${activeTab === "AR" ? "bg-white dark:bg-gray-700 text-blue-600 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
          >
            <ArrowUpRight className="w-4 h-4" />
            รายการขาย (ค้างรับ)
          </button>
          <button
            onClick={() => setActiveTab("AP")}
            className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all flex items-center gap-2 ${activeTab === "AP" ? "bg-white dark:bg-gray-700 text-rose-600 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
          >
            <ArrowDownLeft className="w-4 h-4" />
            รายการซื้อ (ค้างจ่าย)
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="ค้นหาเลขที่บิล, สาขา, ชนิดน้ำมัน..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white font-medium"
            />
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-2xl border border-blue-100 dark:border-blue-800/50">
            <Filter className="w-4 h-4" />
            <span className="text-sm font-bold">กรองตามเงื่อนไข</span>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden text-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-gray-900/50 text-[10px] uppercase tracking-widest font-black text-gray-400">
                <th className="px-6 py-4">วันที่ / เลขที่บิล</th>
                <th className="px-6 py-4">ประเภท</th>
                <th className="px-6 py-4">{activeTab === "AR" ? "สาขาผู้ซื้อ (ลูกหนี้)" : "สาขาผู้ขาย (เจ้าหนี้)"}</th>
                <th className="px-6 py-4 text-right">ยอดรวม</th>
                <th className="px-6 py-4 text-right">รับ/จ่ายแล้ว</th>
                <th className="px-6 py-4 text-right font-bold text-rose-500">คงค้าง</th>
                <th className="px-6 py-4 text-center">สถานะ</th>
                <th className="px-6 py-4 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredTxs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-400 italic font-medium">
                    <div className="flex flex-col items-center gap-2">
                      <Search className="w-8 h-8 opacity-20" />
                      ไม่พบรายการที่ค้นหา
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTxs.map((tx) => {
                  const unpaid = tx.totalAmount - (tx.paidAmount || 0);
                  return (
                    <tr key={tx.id} className="group hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-900 dark:text-white">{new Date(tx.createdAt).toLocaleDateString('th-TH')}</span>
                          <span className="text-[10px] font-black text-blue-600 uppercase tracking-tighter mt-0.5 flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            {tx.purchaseOrderNo || tx.deliveryNoteNo}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {tx.source === 'warehouse' ? (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded text-[10px] font-black uppercase">PTT Order</span>
                        ) : tx.source === 'truck-remaining' ? (
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded text-[10px] font-black uppercase">ค้างรถ</span>
                        ) : (
                          <span className="px-2 py-0.5 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 rounded text-[10px] font-black uppercase">ดูดคืน</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-xl bg-gray-50 dark:bg-gray-900 flex items-center justify-center border border-gray-100 dark:border-gray-700 group-hover:scale-110 transition-transform">
                            <Building2 className="w-4 h-4 text-blue-500" />
                          </div>
                          <span className="font-bold text-gray-700 dark:text-gray-300">{activeTab === "AR" ? tx.toBranchName : tx.fromBranchName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-gray-900 dark:text-white">
                        {numberFormatter.format(tx.totalAmount)}
                      </td>
                      <td className="px-6 py-4 text-right text-emerald-600 font-bold">
                        {numberFormatter.format(tx.paidAmount || 0)}
                      </td>
                      <td className="px-6 py-4 text-right font-black text-rose-600">
                        {numberFormatter.format(unpaid)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <StatusTag variant={getStatusVariant(tx.paymentStatus === 'paid' ? 'ชำระแล้ว' : tx.paymentStatus === 'partial' ? 'บางส่วน' : 'ค้างชำระ')}>
                          {tx.paymentStatus === 'paid' ? 'ชำระแล้ว' : tx.paymentStatus === 'partial' ? 'บางส่วน' : 'ค้างชำระ'}
                        </StatusTag>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          <TableActionMenu
                            actions={[
                              {
                                label: "ดูรายละเอียด",
                                icon: Eye,
                                onClick: () => {
                                  setSelectedTx(tx);
                                  setShowDetailModal(true);
                                }
                              },
                              {
                                label: activeTab === "AR" ? "ยืนยันรับเงิน" : "แจ้งชำระเงิน",
                                icon: DollarSign,
                                hidden: tx.paymentStatus === "paid",
                                variant: "primary",
                                onClick: () => {
                                  // Simplified for UI demonstration
                                  alert(activeTab === "AR" ? "เปิดหน้าต่างยืนยันรับเงิน" : "เปิดหน้าต่างอัปโหลดหลักฐานการชำระ");
                                }
                              },
                              {
                                label: "ดาวน์โหลดเอกสาร",
                                icon: Download,
                                onClick: () => alert("กำลังสร้างไฟล์ PDF...")
                              }
                            ]}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modern Detail Modal */}
      <AnimatePresence>
        {showDetailModal && selectedTx && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-blue-50 dark:bg-blue-900/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-600 rounded-xl shadow-lg">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-blue-800 dark:text-blue-400 uppercase tracking-tight">รายละเอียดรายการธุรกรรมภายใน</h2>
                    <p className="text-xs text-blue-600 dark:text-blue-500 font-bold">อ้างอิง: {selectedTx.purchaseOrderNo || selectedTx.deliveryNoteNo}</p>
                  </div>
                </div>
                <button onClick={() => setShowDetailModal(false)} className="p-2 hover:bg-white dark:hover:bg-gray-700 rounded-full transition-colors group">
                  <X className="w-5 h-5 text-gray-400 group-hover:rotate-90 transition-transform" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-6">
                {/* Status Dashboard */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-700">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">ยอดรวมธุรกรรม</span>
                    <p className="text-2xl font-black text-gray-900 dark:text-white">{currencyFormatter.format(selectedTx.totalAmount)}</p>
                  </div>
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100 dark:border-emerald-800/50">
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest block mb-1">ชำระแล้ว</span>
                    <p className="text-2xl font-black text-emerald-600">{currencyFormatter.format(selectedTx.paidAmount || 0)}</p>
                  </div>
                  <div className="p-4 bg-rose-50 dark:bg-rose-900/10 rounded-2xl border border-rose-100 dark:border-rose-800/50">
                    <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest block mb-1">ยอดค้างชำระ</span>
                    <p className="text-2xl font-black text-rose-600">{currencyFormatter.format(selectedTx.totalAmount - (selectedTx.paidAmount || 0))}</p>
                  </div>
                </div>

                {/* Branches Info */}
                <div className="flex flex-col md:flex-row items-center gap-4 bg-blue-50/30 dark:bg-blue-900/10 p-6 rounded-3xl border border-blue-100 dark:border-blue-800/50 relative">
                  <div className="flex-1 text-center md:text-left space-y-1">
                    <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest block">สาขาต้นทาง (ผู้ขาย)</span>
                    <p className="text-lg font-black text-gray-900 dark:text-white flex items-center justify-center md:justify-start gap-2">
                      <Building2 className="w-5 h-5 text-emerald-500" />
                      {selectedTx.fromBranchName}
                    </p>
                  </div>
                  <div className="flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg">
                      <Navigation className="w-5 h-5 rotate-90" />
                    </div>
                  </div>
                  <div className="flex-1 text-center md:text-right space-y-1">
                    <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest block">สาขาปลายทาง (ผู้ซื้อ)</span>
                    <p className="text-lg font-black text-gray-900 dark:text-white flex items-center justify-center md:justify-end gap-2">
                      {selectedTx.toBranchName}
                      <MapPin className="w-5 h-5 text-rose-500" />
                    </p>
                  </div>
                </div>

                {/* Oil Details */}
                <div className="space-y-3">
                  <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest flex items-center gap-2 px-1">
                    <Droplet className="w-4 h-4 text-blue-500" />
                    รายการน้ำมันในธุรกรรม
                  </h3>
                  <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-3xl overflow-hidden shadow-sm">
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-gray-800/50">
                        <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                          <th className="px-6 py-4 text-left">ชนิดน้ำมัน</th>
                          <th className="px-6 py-4 text-right">จำนวน</th>
                          <th className="px-6 py-4 text-right">ราคา/ลิตร</th>
                          <th className="px-6 py-4 text-right">รวมเป็นเงิน</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                        <tr>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-2 h-8 bg-blue-500 rounded-full"></div>
                              <span className="font-black text-gray-800 dark:text-gray-200">{selectedTx.oilType}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right font-bold text-gray-700 dark:text-gray-300">{selectedTx.quantity.toLocaleString()} ลิตร</td>
                          <td className="px-6 py-4 text-right font-bold text-blue-600 dark:text-blue-400">{currencyFormatter.format(selectedTx.pricePerLiter)}</td>
                          <td className="px-6 py-4 text-right font-black text-gray-900 dark:text-white">{currencyFormatter.format(selectedTx.totalAmount)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Timeline & Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-500" />
                      ประวัติการชำระเงิน
                    </h3>
                    <div className="space-y-3">
                      {(selectedTx.paymentHistory || []).length === 0 ? (
                        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 text-center text-xs text-gray-400 font-bold uppercase tracking-widest">
                          ไม่มีประวัติการชำระเงิน
                        </div>
                      ) : (
                        selectedTx.paymentHistory?.map((pay, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100 dark:border-emerald-800/50">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
                                <Check className="w-4 h-4" />
                              </div>
                              <div>
                                <p className="text-xs font-black text-gray-800 dark:text-gray-200">{pay.method || 'เงินโอน'}</p>
                                <p className="text-[10px] font-bold text-gray-400">{new Date(pay.date).toLocaleDateString('th-TH')}</p>
                              </div>
                            </div>
                            <span className="font-black text-emerald-600">+{currencyFormatter.format(pay.amount)}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                      <Receipt className="w-4 h-4 text-emerald-500" />
                      ใบกำกับภาษี / เอกสารอ้างอิง
                    </h3>
                    <div className="space-y-3">
                      {(selectedTx.taxInvoices || []).length === 0 ? (
                        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 text-center text-xs text-gray-400 font-bold uppercase tracking-widest">
                          ยังไม่มีการออกใบกำกับภาษี
                        </div>
                      ) : (
                        selectedTx.taxInvoices?.map((inv, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-800/50">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/20">
                                <FileText className="w-4 h-4" />
                              </div>
                              <div>
                                <p className="text-xs font-black text-gray-800 dark:text-gray-200">{inv.invoiceNo}</p>
                                <p className="text-[10px] font-bold text-gray-400">{new Date(inv.date).toLocaleDateString('th-TH')}</p>
                              </div>
                            </div>
                            <button className="p-2 hover:bg-white dark:hover:bg-gray-800 rounded-lg transition-colors text-blue-600">
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700 flex gap-3">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="flex-1 px-6 py-4 bg-white dark:bg-gray-800 text-gray-500 font-black rounded-2xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 transition-all active:scale-95 uppercase tracking-widest text-sm"
                >
                  ปิดหน้าต่าง
                </button>
                <button
                  onClick={() => alert("กำลังส่งออกข้อมูล...")}
                  className="flex-1 px-6 py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-600/30 hover:bg-blue-700 transition-all active:scale-95 uppercase tracking-widest text-sm flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  ดาวน์โหลด PDF
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
