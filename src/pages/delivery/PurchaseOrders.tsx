import { useEffect, useState, useMemo } from "react";
import { FileText, Plus, Upload, Truck, Search, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ChartCard from "@/components/ChartCard";
import StatusTag, { getStatusVariant } from "@/components/StatusTag";
import TableActionMenu from "@/components/TableActionMenu";
import { DeliveryPurchaseOrder, loadPurchaseOrders, savePurchaseOrders, uid } from "@/pages/delivery/_storage";
import { useNavigate } from "react-router-dom";
import { useBranch } from "@/contexts/BranchContext";
import { useGasStation } from "@/contexts/GasStationContext";

const defaultProducts = [
  { product: "ดีเซล", liters: 0 },
  { product: "เบนซิน", liters: 0 },
];

export default function PurchaseOrders() {
  const navigate = useNavigate();
  const { selectedBranches } = useBranch();
  const { branches } = useGasStation();
  const selectedBranchIds = useMemo(() => selectedBranches.map(id => Number(id)), [selectedBranches]);
  const [list, setList] = useState<DeliveryPurchaseOrder[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form State
  const [targetBranchId, setTargetBranchId] = useState<number>(0);
  const [approveNo, setApproveNo] = useState("");
  const [invoiceNo, setInvoiceNo] = useState("");
  const [status, setStatus] = useState<DeliveryPurchaseOrder["status"]>("จ่ายเงินแล้ว");
  const [items, setItems] = useState(defaultProducts);
  const [invoicePdfName, setInvoicePdfName] = useState<string | undefined>();
  const [receiptPdfName, setReceiptPdfName] = useState<string | undefined>();

  useEffect(() => {
    if (selectedBranchIds.length > 0 && !targetBranchId) {
      setTargetBranchId(selectedBranchIds[0]);
    } else if (branches.length > 0 && !targetBranchId) {
      setTargetBranchId(branches[0].id);
    }
  }, [selectedBranchIds, branches, targetBranchId]);

  const filteredList = useMemo(() => {
    return list.filter(po => selectedBranchIds.length === 0 || selectedBranchIds.includes(po.branchId));
  }, [list, selectedBranchIds]);

  useEffect(() => {
    setList(loadPurchaseOrders());
  }, []);



  const createPO = () => {
    const cleanApprove = approveNo.trim();
    const cleanInvoice = invoiceNo.trim();
    if (!cleanApprove || !cleanInvoice) {
      alert("กรุณากรอก Approve No. และ Invoice No.");
      return;
    }
    const cleanItems = items
      .map((i) => ({ ...i, liters: Number(i.liters || 0) }))
      .filter((i) => i.product.trim() && i.liters > 0);
    if (cleanItems.length === 0) {
      alert("กรุณาระบุชนิดน้ำมันและจำนวนลิตรอย่างน้อย 1 รายการ");
      return;
    }

    const next: DeliveryPurchaseOrder = {
      id: uid("po"),
      branchId: targetBranchId,
      createdAt: new Date().toISOString(),
      approveNo: cleanApprove,
      invoiceNo: cleanInvoice,
      status,
      items: cleanItems,
      invoicePdfName,
      receiptPdfName,
    };

    const updated = [next, ...list];
    setList(updated);
    savePurchaseOrders(updated);

    // Reset Form
    setApproveNo("");
    setInvoiceNo("");
    setStatus("จ่ายเงินแล้ว");
    setItems(defaultProducts);
    setInvoicePdfName(undefined);
    setReceiptPdfName(undefined);
    setShowCreateModal(false);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-200 dark:shadow-purple-900/20">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white font-display">
              ใบสั่งซื้อ (Purchase Orders)
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              จัดการรายการสั่งซื้อจาก ปตท. และแนบเอกสารสำคัญ
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-white/50 dark:bg-gray-800/50 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm backdrop-blur-sm">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              สาขาที่กำลังดู: {selectedBranches.length === 0 ? "ทั้งหมด" : selectedBranches.map(id => branches.find(b => String(b.id) === id)?.name || id).join(", ")}
            </span>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 flex items-center gap-2 font-medium"
          >
            <Plus className="w-5 h-5" />
            สร้างใบสั่งซื้อใหม่
          </button>
        </div>
      </motion.div>

      {/* Stats Cards (Optional Summary) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ChartCard title="PO ทั้งหมด" icon={FileText} className="shadow-sm border-none ring-1 ring-gray-200 dark:ring-gray-700">
          <div className="text-2xl font-bold text-gray-800 dark:text-white">{filteredList.length}</div>
        </ChartCard>
        <ChartCard title="รอรับของ" icon={Truck} className="shadow-sm border-none ring-1 ring-gray-200 dark:ring-gray-700">
          <div className="text-2xl font-bold text-amber-600">{filteredList.filter(i => i.status === 'รอรับของ').length}</div>
        </ChartCard>
        <ChartCard title="ปริมาณรวม (ลิตร)" icon={Upload} className="shadow-sm border-none ring-1 ring-gray-200 dark:ring-gray-700">
          <div className="text-2xl font-bold text-blue-600">
            {filteredList.reduce((sum, item) => sum + item.items.reduce((s, i) => s + i.liters, 0), 0).toLocaleString()}
          </div>
        </ChartCard>
      </div>

      {/* Table Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden"
      >
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-gray-400" />
            รายการใบสั่งซื้อล่าสุด
          </h3>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                placeholder="ค้นหา..."
                className="pl-9 pr-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/50 dark:bg-gray-900/50">
              <tr>
                <th className="py-4 px-6 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Approve No.</th>
                <th className="py-4 px-6 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Invoice No.</th>
                <th className="py-4 px-6 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">น้ำมัน</th>
                <th className="py-4 px-6 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">ไฟล์แนบ</th>
                <th className="py-4 px-6 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">สถานะ</th>
                <th className="py-4 px-6 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted">
                    ยังไม่มีข้อมูลใบสั่งซื้อ
                  </td>
                </tr>
              ) : (
                filteredList.map((po) => (
                  <tr key={po.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="py-4 px-6 text-sm font-medium text-gray-900 dark:text-white">{po.approveNo}</td>
                    <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-300">{po.invoiceNo}</td>
                    <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-300">
                      {po.items.map((i) => `${i.product} ${i.liters.toLocaleString()}L`).join(", ")}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col gap-1 text-xs text-gray-500">
                        {po.invoicePdfName && <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> {po.invoicePdfName.slice(0, 15)}...</span>}
                        {po.receiptPdfName && <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> {po.receiptPdfName.slice(0, 15)}...</span>}
                        {!po.invoicePdfName && !po.receiptPdfName && <span>-</span>}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <StatusTag variant={getStatusVariant(po.status)}>{po.status}</StatusTag>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <TableActionMenu
                        actions={[
                          {
                            label: "จัดการรอบส่ง",
                            icon: Truck,
                            onClick: () => navigate(`/app/delivery/manage-trips`),
                          },
                        ]}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Create Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreateModal(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
              >
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    <Plus className="w-5 h-5 text-blue-500" />
                    สร้างใบสั่งซื้อใหม่
                  </h3>
                  <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      สาขาที่สั่งซื้อ
                    </label>
                    <select
                      value={targetBranchId}
                      onChange={(e) => setTargetBranchId(Number(e.target.value))}
                      className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium appearance-none"
                    >
                      {branches.map(b => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        เลขที่ใบอนุมัติขาย (Approve No.)
                      </label>
                      <input
                        value={approveNo}
                        onChange={(e) => setApproveNo(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                        placeholder="เช่น 1234567890"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        เลขที่ใบกำกับภาษี (Invoice No.)
                      </label>
                      <input
                        value={invoiceNo}
                        onChange={(e) => setInvoiceNo(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                        placeholder="เช่น INV-PTT-xxxx"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      สถานะเริ่มต้น
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as DeliveryPurchaseOrder["status"])}
                      className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                    >
                      <option value="จ่ายเงินแล้ว">จ่ายเงินแล้ว</option>
                      <option value="รอรับของ">รอรับของ</option>
                      <option value="รับแล้ว">รับแล้ว</option>
                      <option value="รอตรวจสอบ">รอตรวจสอบ</option>
                    </select>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex justify-between items-center">
                      <span>รายการน้ำมัน</span>
                      <button
                        onClick={() => setItems([...items, { product: "", liters: 0 }])}
                        className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" /> เพิ่มรายการ
                      </button>
                    </label>
                    <div className="space-y-2">
                      {items.map((it, idx) => (
                        <div key={idx} className="flex gap-2">
                          <input
                            value={it.product}
                            onChange={(e) => {
                              const next = [...items];
                              next[idx] = { ...next[idx], product: e.target.value };
                              setItems(next);
                            }}
                            className="flex-1 px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm"
                            placeholder="ชนิดน้ำมัน"
                          />
                          <input
                            value={it.liters}
                            onChange={(e) => {
                              const next = [...items];
                              next[idx] = { ...next[idx], liters: Number(e.target.value || 0) };
                              setItems(next);
                            }}
                            type="number"
                            className="w-32 px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm"
                            placeholder="จำนวนลิตร"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">เอกสารแนบ</div>
                    <div className="grid grid-cols-2 gap-3">
                      <label className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all cursor-pointer group">
                        <Upload className="w-6 h-6 text-gray-400 group-hover:text-blue-500 mb-2" />
                        <span className="text-xs text-gray-500 group-hover:text-blue-600">แนบ Invoice (e-Tax)</span>
                        <input type="file" className="hidden" accept="application/pdf" onChange={(e) => setInvoicePdfName(e.target.files?.[0]?.name)} />
                        {invoicePdfName && <span className="text-[10px] text-green-600 mt-1 truncate max-w-full px-2">{invoicePdfName}</span>}
                      </label>
                      <label className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-purple-400 dark:hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-all cursor-pointer group">
                        <Upload className="w-6 h-6 text-gray-400 group-hover:text-purple-500 mb-2" />
                        <span className="text-xs text-gray-500 group-hover:text-purple-600">แนบ Receipt</span>
                        <input type="file" className="hidden" accept="application/pdf" onChange={(e) => setReceiptPdfName(e.target.files?.[0]?.name)} />
                        {receiptPdfName && <span className="text-[10px] text-green-600 mt-1 truncate max-w-full px-2">{receiptPdfName}</span>}
                      </label>
                    </div>
                  </div>

                </div>

                <div className="p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30 flex justify-end gap-3 rounded-b-2xl">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="px-5 py-2.5 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 font-medium transition-colors"
                  >
                    ยกเลิก
                  </button>
                  <button
                    onClick={createPO}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 font-bold"
                  >
                    บันทึกใบสั่งซื้อ
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


