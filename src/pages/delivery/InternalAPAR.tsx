import { useMemo, useState } from "react";
import { 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertCircle,
  Building2,
  Receipt,
  FileText,
  Eye,
  Clock,
  Plus,
  Download,
  X
} from "lucide-react";
import TableActionMenu from "@/components/TableActionMenu";
import { motion, AnimatePresence } from "framer-motion";

import { useGasStation } from "@/contexts/GasStationContext";
import { useBranch } from "@/contexts/BranchContext";
import ChartCard from "@/components/ChartCard";
import StatusTag from "@/components/StatusTag";
import type { SaleTx } from "@/types/gasStation";

const currencyFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 2,
});

type PaymentStatusFilter = "all" | "unpaid" | "partial" | "paid";

export default function InternalAPAR() {
  const { branches, saleTxs, purchaseOrders, updateSaleTx } = useGasStation();
  const { selectedBranches } = useBranch();
  const selectedBranchIds = useMemo(() => selectedBranches.map(id => Number(id)), [selectedBranches]);
  const isSingleBranch = selectedBranchIds.length === 1;
  const ownBranchId = isSingleBranch ? selectedBranchIds[0] : null;

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<PaymentStatusFilter>("all");
  const [activeTab, setActiveTab] = useState<"summary" | "details">("summary");

  // State for Modals
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedTx, setSelectedTx] = useState<SaleTx | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);

  const [showTaxInvoiceModal, setShowTaxInvoiceModal] = useState(false);
  const [invoiceAmount, setInvoiceAmount] = useState<number>(0);

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [modalMode, setModalMode] = useState<"approve" | "notify">("notify");

  // Convert PurchaseOrders to internal virtual transactions
  // HQ (Branch 1) acts as the creditor for all sub-branches in a consolidated PTT order
  const virtualTxs = useMemo(() => {
    const vtxs: SaleTx[] = [];
    purchaseOrders.forEach(po => {
      po.branches.forEach(b => {
        if (b.branchId !== 1) { // Others owe HQ (ID 1)
          const isPartialExample = po.orderNo === "PO-20240101-002" || po.orderNo === "PO-20240104-005";
          
          vtxs.push({
            id: `po-${po.orderNo}-${b.branchId}`,
            source: "recovered", // Placeholder source
            createdAt: po.orderDate + "T09:00:00Z", // Mock time
            fromBranchId: 1,
            fromBranchName: "ปั้มไฮโซ",
            toBranchId: b.branchId,
            toBranchName: b.branchName,
            oilType: b.items[0]?.oilType || "Diesel", // Simplification
            quantity: b.items.reduce((sum, item) => sum + item.quantity, 0),
            pricePerLiter: b.items[0]?.pricePerLiter || 0,
            totalAmount: b.totalAmount,
            deliveryNoteNo: po.orderNo, // "เลขบิลคือเลขสั่งซื้อ"
            receiptNo: po.supplierOrderNo || po.orderNo,
            purchaseOrderNo: po.orderNo,
            paymentStatus: isPartialExample ? "partial" : "unpaid",
            paidAmount: isPartialExample ? b.totalAmount / 2 : 0,
            taxInvoices: isPartialExample ? [
              {
                invoiceNo: `INV-PTT-${po.orderNo}`,
                date: po.orderDate + "T10:30:00Z",
                amount: b.totalAmount / 2
              }
            ] : [],
            paymentHistory: isPartialExample ? [
              {
                date: po.orderDate + "T10:00:00Z",
                amount: b.totalAmount / 2,
                method: "หักลบกลบหนี้ (Settlement)"
              }
            ] : []
          });
        }
      });
    });
    // Only return ones that don't already exist in the real saleTxs list
    return vtxs.filter(vtx => !saleTxs.some(stx => stx.id === vtx.id));
  }, [purchaseOrders, saleTxs]);

  // Combine real saleTxs and virtualTxs from POs
  const allTxs = useMemo(() => {
    return [...saleTxs, ...virtualTxs];
  }, [saleTxs, virtualTxs]);

  // Summary per Branch ( perspectiva: "ที่ปั้มเราขายให้เขา")
  const branchSummaries = useMemo(() => {
    const map = new Map<number, {
      branchId: number;
      branchName: string;
      totalSales: number; 
      unpaidSales: number;
      totalPurchases: number;
      unpaidPurchases: number;
    }>();

    if (ownBranchId) {
      allTxs.forEach(tx => {
        if (tx.fromBranchId === ownBranchId) {
          // เราขายปั้มอื่น -> เขาเป็นลูกหนี้
          const otherId = tx.toBranchId;
          const entry = map.get(otherId) || { branchId: otherId, branchName: tx.toBranchName, totalSales: 0, unpaidSales: 0, totalPurchases: 0, unpaidPurchases: 0 };
          entry.totalSales += tx.totalAmount;
          if (tx.paymentStatus !== "paid") {
            entry.unpaidSales += (tx.totalAmount - (tx.paidAmount || 0));
          }
          map.set(otherId, entry);
        } else if (tx.toBranchId === ownBranchId) {
          // เราซื้อจากปั้มอื่น -> เขาเป็นเจ้าหนี้
          const otherId = tx.fromBranchId;
          const entry = map.get(otherId) || { branchId: otherId, branchName: tx.fromBranchName, totalSales: 0, unpaidSales: 0, totalPurchases: 0, unpaidPurchases: 0 };
          entry.totalPurchases += tx.totalAmount;
          if (tx.paymentStatus !== "paid") {
            entry.unpaidPurchases += (tx.totalAmount - (tx.paidAmount || 0));
          }
          map.set(otherId, entry);
        }
      });
    } else {
      // Global View: Summarize for each branch as a whole
      branches.forEach(b => {
        map.set(b.id, { branchId: b.id, branchName: b.name, totalSales: 0, unpaidSales: 0, totalPurchases: 0, unpaidPurchases: 0 });
      });
      allTxs.forEach(tx => {
        const seller = map.get(tx.fromBranchId);
        const buyer = map.get(tx.toBranchId);
        if (seller) {
          seller.totalSales += tx.totalAmount;
          if (tx.paymentStatus !== "paid") seller.unpaidSales += (tx.totalAmount - (tx.paidAmount || 0));
        }
        if (buyer) {
          buyer.totalPurchases += tx.totalAmount;
          if (tx.paymentStatus !== "paid") buyer.unpaidPurchases += (tx.totalAmount - (tx.paidAmount || 0));
        }
      });
    }

    return Array.from(map.values()).filter(s => 
      ownBranchId ? (s.totalSales > 0 || s.totalPurchases > 0) : true
    );
  }, [branches, allTxs, ownBranchId]);

  // Overall stats
  const stats = useMemo(() => {
    let sales = 0;
    let purchases = 0;

    branchSummaries.forEach(s => {
      sales += s.unpaidSales;
      purchases += s.unpaidPurchases;
    });

    return { 
      totalUnpaidAR: sales, 
      totalUnpaidAP: purchases,
      netBalance: sales - purchases
    };
  }, [branchSummaries]);

  // Filtered transactions (Perspective based on tab)
  const filteredTxs = useMemo(() => {
    return allTxs.filter(tx => {
      // Filter by status
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
  }, [allTxs, statusFilter, selectedBranchIds, searchTerm]);

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
              สรุปยอดหนี้จากการซื้อขายน้ำมันระหว่างสาขา (Inter-branch Transactions)
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
          <ChartCard title="ยอดลูกหนี้ (ค้างรับจากสาขาอื่น)" icon={ArrowUpRight} className="border-l-4 border-emerald-500">
            <div className="mt-2">
              <span className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                {currencyFormatter.format(stats.totalUnpaidAR)}
              </span>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                เงินที่จะได้รับจากการขายน้ำมันให้สาขาอื่น
              </p>
            </div>
          </ChartCard>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <ChartCard title="ยอดเจ้าหนี้ (ค้างจ่ายสาขาอื่น)" icon={ArrowDownLeft} className="border-l-4 border-rose-500">
            <div className="mt-2">
              <span className="text-3xl font-bold text-rose-600 dark:text-rose-400">
                {currencyFormatter.format(stats.totalUnpaidAP)}
              </span>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                น้ำมันที่รับมาแต่ยังไม่ได้ชำระเงินให้สาขาที่ส่ง
              </p>
            </div>
          </ChartCard>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <ChartCard title="ดุลการชำระคงเหลือ" icon={Building2} className="border-l-4 border-blue-500">
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
            รายการขาย (ลูกหนี้/ค้างรับ)
            {activeTab === "summary" && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400" />}
          </button>
          <button 
            onClick={() => setActiveTab("details")}
            className={`px-6 py-4 text-sm font-semibold transition-colors relative ${activeTab === "details" ? "text-blue-600 dark:text-blue-400" : "text-gray-500 hover:text-gray-700"}`}
          >
            รายการซื้อ (เจ้าหนี้/ค้างจ่าย)
            {activeTab === "details" && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400" />}
          </button>
        </div>

        <div className="p-6">
          {/* Search and Filters common for both tabs */}
          <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ค้นหา: เลขที่ใบสั่งซื้อ, สาขา..."
                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as PaymentStatusFilter)}
                className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="all">ทุกสถานะการเงิน</option>
                <option value="unpaid">ค้างชำระ</option>
                <option value="partial">ชำระบางส่วน</option>
                <option value="paid">ชำระแล้ว</option>
              </select>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === "summary" ? (
              <motion.div 
                key="summary"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                <div className="text-sm text-gray-500 dark:text-gray-400 italic">
                  * รายการน้ำมันที่สาขา {ownBranchId ? branches.find(b => b.id === ownBranchId)?.name : "(ทั้งหมด)"} ขายให้สาขาอื่น (เราเป็นผู้ขาย/ลูกหนี้)
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left bg-gray-50 dark:bg-gray-700/50">
                        <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-300 rounded-l-xl">วันที่ - เลขที่ใบสั่งซื้อ</th>
                        <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-300">สาขาผู้ซื้อ</th>
                        <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-300 text-right">ยอดรวม</th>
                        <th className="px-6 py-4 font-semibold text-emerald-600 dark:text-emerald-400 text-right">รับเงินแล้ว</th>
                        <th className="px-6 py-4 font-semibold text-rose-600 dark:text-rose-400 text-right">ค้างรับ</th>
                        <th className="px-6 py-4 font-semibold text-amber-600 dark:text-amber-400 text-center">ร้องขอการชำระ</th>
                        <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-300 text-center">สถานะ</th>
                        <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-300 text-center rounded-r-xl">ดำเนินการ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {filteredTxs
                        .filter(tx => ownBranchId ? tx.fromBranchId === ownBranchId : true)
                        .map((tx) => (
                        <tr key={tx.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                          <td className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">
                            <div className="flex flex-col">
                              <span className="font-medium text-gray-900 dark:text-white">{new Date(tx.createdAt).toLocaleDateString("th-TH")}</span>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className={`${tx.purchaseOrderNo ? 'text-blue-600 font-bold' : 'text-gray-500'}`}>
                                  {tx.purchaseOrderNo || tx.deliveryNoteNo}
                                </span>
                                {tx.id.startsWith('po-') && (
                                  <span className="px-1 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[9px] rounded font-bold">PO</span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 font-medium">{tx.toBranchName}</td>
                          <td className="px-6 py-4 text-right font-medium">
                            {currencyFormatter.format(tx.totalAmount)}
                          </td>
                          <td className="px-6 py-4 text-right text-emerald-600 font-medium">
                            {currencyFormatter.format(tx.paidAmount || 0)}
                          </td>
                          <td className="px-6 py-4 text-right text-rose-600 font-bold">
                            {currencyFormatter.format(tx.totalAmount - (tx.paidAmount || 0))}
                          </td>
                          <td className="px-6 py-4 text-center">
                            {tx.paymentRequest?.status === 'pending' ? (
                              <div className="flex flex-col items-center">
                                <StatusTag variant="warning">รอการยืนยัน</StatusTag>
                                <span className="text-[10px] text-gray-500 mt-0.5">{currencyFormatter.format(tx.paymentRequest.amount)}</span>
                              </div>
                            ) : tx.paymentRequest?.status === 'approved' ? (
                              <StatusTag variant="success">ยืนยันแล้ว</StatusTag>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-center">
                            {tx.paymentStatus === 'paid' ? (
                              <StatusTag variant="success">ชำระแล้ว</StatusTag>
                            ) : tx.paymentStatus === 'partial' ? (
                              <StatusTag variant="warning">บางส่วน</StatusTag>
                            ) : (
                              <StatusTag variant="danger">ค้างชำระ</StatusTag>
                            )}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex justify-center">
                              <TableActionMenu
                                actions={[
                                  ...(tx.paymentStatus !== 'paid' && (tx.paidAmount || 0) > 0 ? [{
                                    label: "ออกใบกำกับภาษี",
                                    icon: Receipt,
                                    onClick: () => {
                                      setSelectedTx(tx);
                                      setInvoiceAmount(tx.paidAmount || tx.totalAmount);
                                      setShowTaxInvoiceModal(true);
                                    },
                                    variant: "success" as const
                                  }] : []),
                                  ...(tx.paymentRequest?.status === 'pending' ? [{
                                    label: "ยืนยันรับชำระเงิน",
                                    icon: DollarSign,
                                    onClick: () => {
                                      setSelectedTx(tx);
                                      setPaymentAmount(tx.paymentRequest?.amount || 0);
                                      setModalMode("approve");
                                      setShowPaymentModal(true);
                                    },
                                    variant: "primary" as const
                                  }] : []),
                                  {
                                    label: "ดูรายละเอียดบิล",
                                    icon: Eye,
                                    onClick: () => {
                                      setSelectedTx(tx);
                                      setShowDetailModal(true);
                                    }
                                  }
                                ]}
                              />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="details"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="text-sm text-gray-500 dark:text-gray-400 italic">
                  * รายการที่สาขา {ownBranchId ? branches.find(b => b.id === ownBranchId)?.name : "(ทั้งหมด)"} ค้างชำระเงินให้กับสาขาอื่น (เราเป็นผู้ซื้อ/เจ้าหนี้)
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left bg-gray-50 dark:bg-gray-700/50">
                        <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-300 rounded-l-xl">วันที่ - เลขที่ใบสั่งซื้อ</th>
                        <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-300">สาขาเจ้าหนี้</th>
                        <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-300 text-right">ยอดรวม</th>
                        <th className="px-6 py-4 font-semibold text-emerald-600 dark:text-emerald-400 text-right">ชำระแล้ว</th>
                        <th className="px-6 py-4 font-semibold text-rose-600 dark:text-rose-400 text-right">คงค้าง</th>
                        <th className="px-6 py-4 font-semibold text-amber-600 dark:text-amber-400 text-center">ร้องขอการชำระ</th>
                        <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-300 text-center">สถานะ</th>
                        <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-300 text-center rounded-r-xl">ดำเนินการ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {filteredTxs
                        .filter(tx => ownBranchId ? tx.toBranchId === ownBranchId : true)
                        .map((tx) => (
                        <tr key={tx.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                          <td className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">
                            <div className="flex flex-col">
                              <span className="font-medium text-gray-900 dark:text-white">{new Date(tx.createdAt).toLocaleDateString("th-TH")}</span>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className={`${tx.purchaseOrderNo ? 'text-blue-600 font-bold' : 'text-gray-500'}`}>
                                  {tx.purchaseOrderNo || tx.deliveryNoteNo}
                                </span>
                                {tx.id.startsWith('po-') && (
                                  <span className="px-1 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[9px] rounded font-bold">PO</span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 font-medium">{tx.fromBranchName}</td>
                          <td className="px-6 py-4 text-right font-medium">
                            {currencyFormatter.format(tx.totalAmount)}
                          </td>
                          <td className="px-6 py-4 text-right text-emerald-600 font-medium">
                            {currencyFormatter.format(tx.paidAmount || 0)}
                          </td>
                          <td className="px-6 py-4 text-right text-rose-600 font-bold">
                            {currencyFormatter.format(tx.totalAmount - (tx.paidAmount || 0))}
                          </td>
                          <td className="px-6 py-4 text-center">
                            {tx.paymentRequest?.status === 'pending' ? (
                              <div className="flex flex-col items-center">
                                <StatusTag variant="warning">รอเจ้าหนี้ยืนยัน</StatusTag>
                                <span className="text-[10px] text-gray-500 mt-0.5">{currencyFormatter.format(tx.paymentRequest.amount)}</span>
                              </div>
                            ) : tx.paymentRequest?.status === 'approved' ? (
                              <StatusTag variant="success">เจ้าหนี้ยืนยันแล้ว</StatusTag>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-center">
                            {tx.paymentStatus === 'paid' ? (
                              <StatusTag variant="success">ชำระครบแล้ว</StatusTag>
                            ) : tx.paymentStatus === 'partial' ? (
                              <StatusTag variant="warning">ชำระบางส่วน</StatusTag>
                            ) : (
                              <StatusTag variant="danger">รอชำระ</StatusTag>
                            )}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex justify-center">
                              <TableActionMenu
                                actions={[
                                  ...(tx.paymentStatus !== 'paid' && tx.paymentRequest?.status !== 'pending' ? [{
                                    label: "แจ้งชำระเงิน",
                                    icon: DollarSign,
                                    onClick: () => {
                                      setSelectedTx(tx);
                                      setPaymentAmount(tx.totalAmount - (tx.paidAmount || 0));
                                      setModalMode("notify");
                                      setShowPaymentModal(true);
                                    },
                                    variant: "primary" as const
                                  }] : []),
                                  ...(tx.taxInvoices && tx.taxInvoices.length > 0 ? [{
                                    label: "ดาวน์โหลดใบกำกับภาษี",
                                    icon: Download,
                                    onClick: () => {
                                      const lastInvoice = tx.taxInvoices![tx.taxInvoices!.length - 1];
                                      alert(`กำลังดาวน์โหลดใบกำกับภาษี: ${lastInvoice.invoiceNo}\nจำนวนเงิน: ${lastInvoice.amount.toLocaleString()} ฿`);
                                    },
                                    variant: "success" as const
                                  }] : []),
                                  {
                                    label: "ดูรายละเอียดบิล",
                                    icon: Eye,
                                    onClick: () => {
                                      setSelectedTx(tx);
                                      setShowDetailModal(true);
                                    }
                                  }
                                ]}
                              />
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

      {/* Payment Modal */}
      <AnimatePresence>
        {showPaymentModal && selectedTx && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 w-full max-w-md overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <DollarSign className="w-6 h-6 text-blue-500" />
                  บันทึกการชำระเงิน
                </h3>
                <button onClick={() => setShowPaymentModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl">
                  <div className="text-sm text-blue-600 dark:text-blue-400 font-semibold mb-1">ยอดคงค้างทั้งหมด</div>
                  <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                    {currencyFormatter.format(selectedTx.totalAmount - (selectedTx.paidAmount || 0))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="payment-amount" className="text-sm font-semibold text-gray-700 dark:text-gray-300">จำนวนเงินที่ต้องการชำระ</label>
                  <div className="relative">
                    <input 
                      id="payment-amount"
                      type="number"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(Number(e.target.value))}
                      className="w-full pl-4 pr-12 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-lg"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">฿</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => setPaymentAmount(selectedTx.totalAmount - (selectedTx.paidAmount || 0))}
                    className="flex-1 py-2 px-4 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors"
                  >
                    ชำระเต็มจำนวน
                  </button>
                  <button 
                    onClick={() => setPaymentAmount((selectedTx.totalAmount - (selectedTx.paidAmount || 0)) / 2)}
                    className="flex-1 py-2 px-4 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors"
                  >
                    ชำระครึ่งหนึ่ง
                  </button>
                </div>
              </div>

              <div className="p-6 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700 flex gap-4">
                <button 
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all"
                >
                  ยกเลิก
                </button>
                <button 
                  onClick={() => {
                    if (modalMode === "notify") {
                      // Logic for Debtor requesting payment verification
                      updateSaleTx(selectedTx.id, {
                        paymentRequest: {
                          amount: paymentAmount,
                          date: new Date().toISOString(),
                          method: "โอนเงินเข้าบัญชี",
                          status: "pending"
                        }
                      }, selectedTx);
                      alert("ส่งคำร้องขอชำระเงินให้สาขาเจ้าหนี้แล้ว");
                    } else {
                      // Logic for Creditor approving payment
                      const newPaidTotal = (selectedTx.paidAmount || 0) + paymentAmount;
                      const newStatus = newPaidTotal >= selectedTx.totalAmount ? "paid" : "partial";
                      
                      // Auto-issue tax invoice based on confirmed payment
                      const newInvoice = {
                        invoiceNo: `INV-${Date.now()}`,
                        date: new Date().toISOString(),
                        amount: paymentAmount
                      };

                      updateSaleTx(selectedTx.id, {
                        paidAmount: newPaidTotal,
                        paymentStatus: newStatus,
                        paymentRequest: {
                          ...selectedTx.paymentRequest!,
                          status: "approved"
                        },
                        paymentHistory: [
                          ...(selectedTx.paymentHistory || []),
                          {
                            date: new Date().toISOString(),
                            amount: paymentAmount,
                            method: selectedTx.paymentRequest?.method || "โอนเงินเข้าบัญชี"
                          }
                        ],
                        taxInvoices: [
                          ...(selectedTx.taxInvoices || []),
                          newInvoice
                        ]
                      }, selectedTx);
                      alert(`ยืนยันการชำระเงินสำเร็จ\nออกใบกำกับภาษีเลขที่: ${newInvoice.invoiceNo}`);
                    }
                    setShowPaymentModal(false);
                  }}
                  className={`flex-1 py-3 ${modalMode === 'notify' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-blue-600 hover:bg-blue-700'} text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2`}
                >
                  <CheckCircle2 className="w-5 h-5" />
                  {modalMode === 'notify' ? 'ส่งคำร้องขอชำระ' : 'ยืนยันการชำระ'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Tax Invoice Modal */}
      <AnimatePresence>
        {showTaxInvoiceModal && selectedTx && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 w-full max-w-md overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Receipt className="w-6 h-6 text-emerald-500" />
                  ออกใบกำกับภาษี
                </h3>
                <button onClick={() => setShowTaxInvoiceModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl">
                  <div>
                    <div className="text-sm text-emerald-600 dark:text-emerald-400 font-semibold mb-1">ยอดที่ชำระแล้ว</div>
                    <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                      {currencyFormatter.format(selectedTx.paidAmount || 0)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500 dark:text-gray-400">จากยอดรวม</div>
                    <div className="text-sm font-semibold">{currencyFormatter.format(selectedTx.totalAmount)}</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="invoice-amount" className="text-sm font-semibold text-gray-700 dark:text-gray-300">จำนวนเงินในใบกำกับภาษี</label>
                  <div className="relative">
                    <input 
                      id="invoice-amount"
                      type="number"
                      value={invoiceAmount}
                      onChange={(e) => setInvoiceAmount(Number(e.target.value))}
                      className="w-full pl-4 pr-12 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-lg"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">฿</span>
                  </div>
                  <p className="text-xs text-gray-500 italic">* ปกติจะออกตามยอดที่ชำระเข้ามาล่าสุด</p>
                </div>
              </div>

              <div className="p-6 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700 flex gap-4">
                <button 
                  onClick={() => setShowTaxInvoiceModal(false)}
                  className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all"
                >
                  ยกเลิก
                </button>
                <button 
                  onClick={() => {
                    const newInvoice = {
                      invoiceNo: `INV-${Date.now()}`,
                      date: new Date().toISOString(),
                      amount: invoiceAmount
                    };
                    const existingInvoices = selectedTx.taxInvoices || [];
                    updateSaleTx(selectedTx.id, {
                      taxInvoices: [...existingInvoices, newInvoice]
                    });
                    setShowTaxInvoiceModal(false);
                    alert("ออกใบกำกับภาษีสำเร็จ: " + newInvoice.invoiceNo);
                  }}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/30 transition-all flex items-center justify-center gap-2"
                >
                  <FileText className="w-5 h-5" />
                  ออกเอกสาร
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Detail Modal */}
      <AnimatePresence>
        {showDetailModal && selectedTx && (() => {
          // If it's a virtual PO transaction, find the full PO details
          const linkedPO = selectedTx.id.startsWith('po-') 
            ? purchaseOrders.find(po => po.orderNo === selectedTx.purchaseOrderNo)
            : null;
          
          // Get specific branch items if it's a PO
          const branchDetail = linkedPO?.branches.find(b => b.branchId === selectedTx.toBranchId || b.branchId === selectedTx.fromBranchId);

          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 w-full max-w-2xl overflow-hidden"
              >
                <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-gray-50/50 dark:bg-gray-900/20">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <FileText className="w-6 h-6 text-blue-500" />
                      รายละเอียดเอกสาร
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      เลขที่: <span className="font-bold text-blue-600">{selectedTx.purchaseOrderNo || selectedTx.deliveryNoteNo}</span>
                      {linkedPO && <span className="ml-2 px-1.5 py-0.5 bg-blue-100 text-blue-600 text-[10px] rounded font-bold uppercase">PTT Order</span>}
                    </p>
                  </div>
                  <button onClick={() => setShowDetailModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                  {/* Summary Status */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                      <div className="text-[10px] text-gray-500 uppercase font-bold">วันที่</div>
                      <div className="text-sm font-semibold">{new Date(selectedTx.createdAt).toLocaleDateString("th-TH")}</div>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                      <div className="text-[10px] text-gray-500 uppercase font-bold">สถานะการชำระ</div>
                      <div className="mt-1">
                        <StatusTag variant={selectedTx.paymentStatus === 'paid' ? 'success' : 'warning'}>
                          {selectedTx.paymentStatus === 'paid' ? 'ชำระแล้ว' : 'ค้างชำระ'}
                        </StatusTag>
                      </div>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                      <div className="text-[10px] text-gray-500 uppercase font-bold">สาขาต้นทาง</div>
                      <div className="text-sm font-semibold truncate">{selectedTx.fromBranchName}</div>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                      <div className="text-[10px] text-gray-500 uppercase font-bold">สาขาปลายทาง</div>
                      <div className="text-sm font-semibold truncate">{selectedTx.toBranchName}</div>
                    </div>
                  </div>

                  {/* Items Table */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                       รายการน้ำมัน
                    </h4>
                    <div className="border border-gray-100 dark:border-gray-700 rounded-xl overflow-hidden text-sm">
                      <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-900/50">
                          <tr>
                            <th className="px-4 py-2 text-left font-semibold text-gray-600 dark:text-gray-400">ชนิดน้ำมัน</th>
                            <th className="px-4 py-2 text-right font-semibold text-gray-600 dark:text-gray-400">จำนวน (ลิตร)</th>
                            <th className="px-4 py-2 text-right font-semibold text-gray-600 dark:text-gray-400">ราคา/ลิตร</th>
                            <th className="px-4 py-2 text-right font-semibold text-gray-600 dark:text-gray-400">รวมเงิน</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                          {linkedPO && branchDetail ? (
                            branchDetail.items.map((item, idx) => (
                              <tr key={idx}>
                                <td className="px-4 py-3 font-medium">{item.oilType}</td>
                                <td className="px-4 py-3 text-right">{item.quantity.toLocaleString()}</td>
                                <td className="px-4 py-3 text-right">{item.pricePerLiter.toFixed(2)}</td>
                                <td className="px-4 py-3 text-right font-bold">{item.totalAmount.toLocaleString()} ฿</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td className="px-4 py-3 font-medium">{selectedTx.oilType}</td>
                              <td className="px-4 py-3 text-right">{selectedTx.quantity.toLocaleString()}</td>
                              <td className="px-4 py-3 text-right">{selectedTx.pricePerLiter?.toFixed(2) || '-'}</td>
                              <td className="px-4 py-3 text-right font-bold">{selectedTx.totalAmount.toLocaleString()} ฿</td>
                            </tr>
                          )}
                        </tbody>
                        <tfoot className="bg-gray-50/50 dark:bg-gray-900/30 font-bold border-t border-gray-100 dark:border-gray-700">
                          <tr>
                            <td colSpan={3} className="px-4 py-3 text-right text-gray-500 uppercase text-xs">ยอดรวมสุทธิ</td>
                            <td className="px-4 py-3 text-right text-blue-600 dark:text-blue-400 text-base">{selectedTx.totalAmount.toLocaleString()} ฿</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>

                  {/* Timeline section */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      ไทม์ไลน์การดำเนินการ
                    </h4>
                    
                    <div className="relative space-y-6 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent dark:before:via-gray-700">
                      
                      {/* Created Date */}
                      <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white dark:border-gray-800 bg-gray-100 dark:bg-gray-700 text-gray-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                          <Plus className="w-5 h-5" />
                        </div>
                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800/50 shadow-sm transition-all hover:shadow-md">
                          <div className="flex items-center justify-between space-x-2 mb-1">
                            <div className="font-bold text-gray-900 dark:text-gray-100">สร้างเอกสาร</div>
                            <time className="font-mono text-xs font-medium text-blue-500">{new Date(selectedTx.createdAt).toLocaleDateString("th-TH")}</time>
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 italic">ดำเนินการโดย: {selectedTx.source === 'recovered' ? 'ระบบกลาง' : 'พนักงาน'}</div>
                        </div>
                      </div>

                      {/* Payment Timeline */}
                      {(selectedTx.paymentHistory || []).map((pay, idx) => (
                        <div key={`pay-${idx}`} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                          <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white dark:border-gray-800 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                            <DollarSign className="w-5 h-5" />
                          </div>
                          <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-emerald-100 dark:border-emerald-900/10 bg-emerald-50/20 dark:bg-emerald-900/5 shadow-sm transition-all hover:shadow-md">
                            <div className="flex items-center justify-between space-x-2 mb-1">
                              <div className="font-bold text-emerald-700 dark:text-emerald-400">แจ้งชำระเงิน</div>
                              <time className="font-mono text-xs font-medium text-emerald-600">{new Date(pay.date).toLocaleString("th-TH")}</time>
                            </div>
                            <div className="text-base font-bold text-gray-900 dark:text-white mb-1">+{pay.amount.toLocaleString()} ฿</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{pay.method}</div>
                          </div>
                        </div>
                      ))}

                      {/* Tax Invoice Timeline */}
                      {(selectedTx.taxInvoices || []).map((inv, idx) => (
                        <div key={`inv-${idx}`} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                          <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white dark:border-gray-800 bg-blue-100 dark:bg-blue-900/30 text-blue-600 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                            <Receipt className="w-5 h-5" />
                          </div>
                          <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-blue-100 dark:border-blue-900/10 bg-blue-50/20 dark:bg-blue-900/5 shadow-sm transition-all hover:shadow-md">
                            <div className="flex items-center justify-between space-x-2 mb-1">
                              <div className="font-bold text-blue-700 dark:text-blue-400">ออกใบกำกับภาษี</div>
                              <time className="font-mono text-xs font-medium text-blue-600">{new Date(inv.date).toLocaleString("th-TH")}</time>
                            </div>
                            <div className="text-sm font-bold text-gray-900 dark:text-white mb-1">เลขที่: {inv.invoiceNo}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">ยอดเงิน: {inv.amount.toLocaleString()} ฿</div>
                          </div>
                        </div>
                      ))}

                    </div>
                  </div>
                </div>

                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700 flex justify-end">
                  <button 
                    onClick={() => setShowDetailModal(false)}
                    className="px-8 py-2.5 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 font-bold rounded-xl transition-all hover:scale-105"
                  >
                    ปิดหน้าต่าง
                  </button>
                </div>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}
