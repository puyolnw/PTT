import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo, useEffect } from "react";
import {
  History,
  Search,
  CheckCircle,
  X,
  Droplet,
  Truck,
  FileText,
  Building2,
  Calendar,
  Clock,
  User,
  AlertCircle,
  PackageCheck,
} from "lucide-react";
import { useGasStation } from "@/contexts/GasStationContext";
import type { BranchOilReceipt, PurchaseOrder, DriverJob, DeliveryNote, Receipt } from "@/types/gasStation";

// --- Storage Utilities ---

const STORAGE_KEY = "ptt.gasStation.branchOilReceipts.v1";

const loadBranchReceiptsFromStorage = (): Partial<BranchOilReceipt>[] => {
  try {
    if (typeof window === "undefined") return [];
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Partial<BranchOilReceipt>[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const generateBranchReceipts = (purchaseOrders: PurchaseOrder[], driverJobs: DriverJob[]): BranchOilReceipt[] => {
  const receipts: BranchOilReceipt[] = [];
  purchaseOrders.forEach((po) => {
    const relatedJobs = driverJobs.filter((j) => j.orderType === "external" && j.purchaseOrderNo === po.orderNo);
    po.branches.forEach((branch) => {
      const jobForBranch = relatedJobs.find((j) => j.destinationBranches?.some((b) => b.branchId === branch.branchId)) || relatedJobs[0];
      const transportNo = jobForBranch?.transportNo || "TP-" + po.orderDate.replace(/-/g, "") + "-" + po.orderNo.slice(-3);
      
      receipts.push({
        id: "BR-" + po.orderNo + "-" + branch.branchId,
        receiptNo: "BR-" + po.orderNo + "-" + branch.branchId,
        purchaseOrderNo: po.orderNo,
        approveNo: po.approveNo,
        contractNo: po.contractNo,
        transportNo: transportNo,
        branchId: branch.branchId,
        branchName: branch.branchName,
        receiveDate: po.deliveryDate,
        receiveTime: "09:00",
        truckPlateNumber: jobForBranch?.truckPlateNumber || "-",
        trailerPlateNumber: jobForBranch?.trailerPlateNumber || "-",
        driverName: jobForBranch?.driverName || "-",
        items: branch.items.map((item) => ({
          oilType: item.oilType,
          quantityOrdered: item.quantity,
          quantityReceived: 0,
          pricePerLiter: item.pricePerLiter,
          totalAmount: item.totalAmount,
        })),
        totalAmount: branch.totalAmount,
        status: "รอรับ",
        receivedBy: "",
        receivedByName: "",
        receivedAt: undefined,
        createdAt: po.approvedAt,
        createdBy: po.approvedBy,
      });
    });
  });
  return receipts;
};

const SAMPLE_COMPLETED_RECEIPTS: Partial<BranchOilReceipt>[] = [
  {
    id: "SAMPLE-BR-001",
    receiptNo: "RC-20231025-001",
    purchaseOrderNo: "PO-20231025-001",
    approveNo: "AP-9988-22",
    transportNo: "TP-BK-7755",
    branchId: 1,
    branchName: "สาขาสวัสดิการ 1",
    receiveDate: "2023-10-25",
    receiveTime: "10:30",
    truckPlateNumber: "70-9876",
    trailerPlateNumber: "70-9877",
    driverName: "นายมงคล ใจซื่อ",
    items: [
      { oilType: "Gasohol 95", quantityOrdered: 12000, quantityReceived: 12005, pricePerLiter: 38.45, totalAmount: 461400 },
      { oilType: "Diesel B7", quantityOrdered: 8000, quantityReceived: 7998, pricePerLiter: 32.94, totalAmount: 263520 }
    ],
    totalAmount: 724920,
    status: "รับแล้ว",
    receivedByName: "นายนพดล ประจำปั๊ม",
    receivedAt: "2023-10-25T03:30:00.000Z",
    qualityTest: { apiGravity: 45.2, temperature: 30.5, waterContent: 0, testResult: "ผ่าน", color: "ใส", testedBy: "นายมงคล ใจซื่อ", testDateTime: "2023-10-25T03:30:00.000Z" }
  },
  {
    id: "SAMPLE-BR-002",
    receiptNo: "RC-20231024-002",
    purchaseOrderNo: "PO-20231024-002",
    approveNo: "AP-9988-23",
    transportNo: "TP-BK-8899",
    branchId: 2,
    branchName: "สาขาสวัสดิการ 2",
    receiveDate: "2023-10-24",
    receiveTime: "14:20",
    truckPlateNumber: "71-5544",
    trailerPlateNumber: "-",
    driverName: "นายสมเกียรติ พุ่มพวง",
    items: [
      { oilType: "Gasohol 91", quantityOrdered: 10000, quantityReceived: 10000, pricePerLiter: 37.95, totalAmount: 379500 }
    ],
    totalAmount: 379500,
    status: "รับแล้ว",
    receivedByName: "นางสาวสมรักษ์ ปลายทาง",
    receivedAt: "2023-10-24T07:20:00.000Z",
    qualityTest: { apiGravity: 44.8, temperature: 29.8, waterContent: 0.01, testResult: "ผ่าน", color: "ใส", testedBy: "นายสมเกียรติ พุ่มพวง", testDateTime: "2023-10-24T07:20:00.000Z" }
  }
];

const buildReceipts = (base: BranchOilReceipt[], overrides: Partial<BranchOilReceipt>[]) => {
  const byId = new Map<string, Partial<BranchOilReceipt>>();
  overrides.forEach((o) => { if (o.id) byId.set(o.id, o); });
  
  const merged = base.map((r) => ({ ...r, ...(byId.get(r.id) || {}) }));
  
  // Also add samples if they are not in base but we have them in overrides
  overrides.forEach(o => {
    if (o.id && !base.find(b => b.id === o.id)) {
        merged.push(o as BranchOilReceipt);
    }
  });

  return merged;
};

// --- Component ---

export default function ReceiveOil() {
  const { purchaseOrders, driverJobs, branches, deliveryNotes, receipts: allReceipts } = useGasStation();
  
  const baseReceipts = useMemo(() => generateBranchReceipts(purchaseOrders, driverJobs), [purchaseOrders, driverJobs]);
  const [receipts, setReceipts] = useState<BranchOilReceipt[]>([]);

  useEffect(() => {
    const overrides = loadBranchReceiptsFromStorage();
    // If NO overrides in storage, use sample data for the first time
    const finalOverrides = overrides.length > 0 ? overrides : SAMPLE_COMPLETED_RECEIPTS;
    setReceipts(buildReceipts(baseReceipts, finalOverrides));
  }, [baseReceipts]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBranchFilterId, setSelectedBranchFilterId] = useState<number | "all">("all");
  
  // Document Viewing State
  const [selectedDoc, setSelectedDoc] = useState<DeliveryNote | Receipt | BranchOilReceipt | null>(null);
  const [docType, setDocType] = useState<'dn' | 'tax-invoice' | 'receipt' | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Helper to find related documents
  const getRelatedDN = (r: BranchOilReceipt) => {
    return deliveryNotes.find(dn => dn.purchaseOrderNo === r.purchaseOrderNo && dn.toBranchId === r.branchId);
  };

  const getRelatedTaxInvoice = (r: BranchOilReceipt) => {
    const dn = getRelatedDN(r);
    return allReceipts.find(rec => 
      (rec.purchaseOrderNo === r.purchaseOrderNo || (dn && rec.deliveryNoteNo === dn.deliveryNoteNo)) && 
      rec.documentType === "ใบกำกับภาษี"
    );
  };

  // Filtered Receipts
  const filteredReceipts = useMemo(() => {
    return receipts.filter(r => {
      // Only show successfully received items
      if (r.status !== "รับแล้ว") return false;

      const matchSearch = r.receiptNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.purchaseOrderNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.branchName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.truckPlateNumber.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchBranch = selectedBranchFilterId === "all" || r.branchId === selectedBranchFilterId;
      
      return matchSearch && matchBranch;
    }).sort((a, b) => new Date(b.receiveDate).getTime() - new Date(a.receiveDate).getTime());
  }, [receipts, searchTerm, selectedBranchFilterId]);

  // Summary Stats
  const stats = useMemo(() => {
    const received = filteredReceipts.filter(r => r.status === "รับแล้ว").length;
    const totalAmount = filteredReceipts.reduce((sum, r) => sum + r.totalAmount, 0);

    return { received, totalAmount };
  }, [filteredReceipts]);

  // Helper Formats
  const currencyFormatter = new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
  });

  const numberFormatter = new Intl.NumberFormat("th-TH");

  const getStatusColor = (status: BranchOilReceipt["status"]) => {
    switch (status) {
      case "รอรับ": return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800";
      case "รับแล้ว": return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800";
      case "ปฏิเสธ": return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800";
      default: return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-lg shadow-orange-200 dark:shadow-none">
                <History className="w-6 h-6 text-white" />
              </div>
              ประวัติการรับน้ำมัน (รายสาขา)
            </h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2">
              <p className="text-gray-600 dark:text-gray-400">
                ตรวจสอบประวัติการรับและลงสมุดของทุกลูกน้ำมันแต่ละปั๊ม
              </p>
              <div className="h-4 w-px bg-gray-300 dark:bg-gray-700 hidden md:block" />
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-gray-500 dark:text-gray-400">เลือกสาขา:</span>
                <select
                  value={selectedBranchFilterId}
                  onChange={(e) => setSelectedBranchFilterId(e.target.value === "all" ? "all" : Number(e.target.value))}
                  className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1 text-sm font-bold text-orange-600 dark:text-orange-400 outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="all">ทุกสาขา</option>
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Info Alerts */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800 dark:text-blue-300">
            <p className="font-semibold mb-1">คำแนะนำการใช้งาน</p>
            <ul className="list-disc list-inside space-y-1 opacity-90">
              <li>แสดงเฉพาะรายการที่ได้รับน้ำมันเข้าคลังสาขาสำเร็จแล้ว</li>
              <li>สามารถตรวจสอบเอกสาร ใบส่งของ, ใบกำกับภาษี และใบรับของได้ที่ปุ่มในตาราง</li>
              <li>ใช้ตัวกรองสาขาด้านบนเพื่อดูข้อมูลแยกตามแต่ละสถานี</li>
            </ul>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SummaryCard 
            title="รายการรับสำเร็จ" 
            value={stats.received.toString()} 
            unit="รายการ" 
            icon={CheckCircle} 
            color="bg-emerald-500" 
          />
          <SummaryCard 
            title="ปริมาณรวม" 
            value={numberFormatter.format(filteredReceipts.reduce((sum, r) => sum + r.items.reduce((s, i) => s + (i.quantityReceived || i.quantityOrdered), 0), 0))} 
            unit="ลิตร" 
            icon={Droplet} 
            color="bg-blue-500" 
          />
          <SummaryCard 
            title="มูลค่ารวม" 
            value={currencyFormatter.format(stats.totalAmount)} 
            unit="" 
            icon={FileText} 
            color="bg-orange-500" 
          />
        </div>

        {/* History Table */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">ประวัติการรับน้ำมัน</h2>
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text"
                placeholder="ค้นหา PO, ทะเบียนรถ, เลขที่รับ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm transition-all focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">รายการ / สาขา</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">วันที่รับน้ำมัน</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">ข้อมูลรถบรรทุก</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">เอกสารอ้างอิง</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">ปริมาณรวม</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">สถานะการตรวจสอบ</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">ดูเอกสาร</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {filteredReceipts.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900 dark:text-white">{r.receiptNo}</div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Building2 className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-xs font-bold text-orange-600 dark:text-orange-400">{r.branchName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        {r.receiveDate}
                      </div>
                      {r.receivedAt && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mt-1">
                          <Clock className="w-3.5 h-3.5 text-gray-400" />
                          {new Date(r.receivedAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5 text-gray-400" />
                        {r.truckPlateNumber} {r.trailerPlateNumber !== "-" ? "/ " + r.trailerPlateNumber : ""}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mt-1">
                        <User className="w-3.5 h-3.5 text-gray-400" />
                        {r.driverName}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs text-gray-500 dark:text-gray-400">PO: <span className="font-bold text-gray-700 dark:text-gray-300">{r.purchaseOrderNo}</span></div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">TP: <span className="font-bold text-gray-700 dark:text-gray-300">{r.transportNo}</span></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-gray-900 dark:text-white">
                        {numberFormatter.format(r.items.reduce((s: number, i) => s + (i.quantityReceived || i.quantityOrdered), 0))} ลิตร
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {currencyFormatter.format(r.totalAmount)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-col items-center">
                         <span className={"px-2.5 py-1 rounded-lg text-xs font-bold border " + getStatusColor(r.status)}>
                          {r.status === "รับแล้ว" ? "รับเสร็จเพิ่มสต็อกแล้ว" : r.status}
                        </span>
                        {r.qualityTest?.testResult && (
                          <span className={"text-xs mt-1 font-bold " + (r.qualityTest.testResult === 'ผ่าน' ? 'text-emerald-600' : 'text-red-600')}>
                            ผลทดสอบ: {r.qualityTest.testResult}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => {
                            setSelectedDoc(getRelatedDN(r) || null);
                            setDocType('dn');
                            setShowModal(true);
                          }}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors flex flex-col items-center gap-0.5"
                          title="ดูใบส่งของ"
                        >
                          <FileText className="w-5 h-5" />
                          <span className="text-[10px] font-bold">ใบส่งของ</span>
                        </button>
                        <button 
                          onClick={() => {
                            const rec = getRelatedTaxInvoice(r);
                            setSelectedDoc(rec || null);
                            setDocType('tax-invoice');
                            setShowModal(true);
                          }}
                          className="p-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg transition-colors flex flex-col items-center gap-0.5"
                          title="ดูใบภาษี"
                        >
                          <FileText className="w-5 h-5" />
                          <span className="text-[10px] font-bold">ใบภาษี</span>
                        </button>
                        <button 
                          onClick={() => {
                            setSelectedDoc(r);
                            setDocType('receipt');
                            setShowModal(true);
                          }}
                          className="p-2 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/30 rounded-lg transition-colors flex flex-col items-center gap-0.5"
                          title="ดูใบรับของ"
                        >
                          <PackageCheck className="w-5 h-5" />
                          <span className="text-[10px] font-bold">ใบรับของ</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredReceipts.length === 0 && (
              <div className="py-20 text-center">
                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-10 h-10 text-gray-300" />
                </div>
                <p className="text-gray-500 dark:text-gray-400">ไม่พบรายการบันทึกรับน้ำมัน</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showModal && selectedDoc && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-3xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-gray-700/50">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    {docType === 'dn' ? (
                      <><FileText className="w-5 h-5 text-indigo-500" /> รายละเอียดใบส่งของ (Delivery Note)</>
                    ) : docType === 'tax-invoice' ? (
                      <><FileText className="w-5 h-5 text-emerald-500" /> รายละเอียดใบกำกับภาษี / ใบเสร็จ</>
                    ) : (
                      <><PackageCheck className="w-5 h-5 text-orange-500" /> รายละเอียดการรับของ (Goods Receipt)</>
                    )}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    เลขที่: {docType === 'dn' ? (selectedDoc as DeliveryNote).deliveryNoteNo : 
                          docType === 'tax-invoice' ? (selectedDoc as Receipt).receiptNo : 
                          (selectedDoc as BranchOilReceipt).receiptNo}
                  </p>
                </div>
                <button onClick={() => setShowModal(false)} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto">
                {docType === 'dn' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-200 dark:border-gray-700">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">วันที่ส่ง</p>
                        <p className="font-bold text-gray-900 dark:text-white">{(selectedDoc as DeliveryNote).deliveryDate}</p>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-200 dark:border-gray-700">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">จาก</p>
                        <p className="font-bold text-gray-900 dark:text-white">{(selectedDoc as DeliveryNote).fromBranchName}</p>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-200 dark:border-gray-700">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">ถึง</p>
                        <p className="font-bold text-gray-900 dark:text-white">{(selectedDoc as DeliveryNote).toBranchName}</p>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-200 dark:border-gray-700">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">รถบรรทุก</p>
                        <p className="font-bold text-gray-900 dark:text-white">{(selectedDoc as DeliveryNote).truckPlateNumber || '-'}</p>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-200 dark:border-gray-700">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">คนขับ</p>
                        <p className="font-bold text-gray-900 dark:text-white">{(selectedDoc as DeliveryNote).driverName || '-'}</p>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-200 dark:border-gray-700">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">อ้างอิง PO</p>
                        <p className="font-bold text-gray-900 dark:text-white">{(selectedDoc as DeliveryNote).purchaseOrderNo || '-'}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <Droplet className="w-4 h-4 text-blue-500" /> รายการสินค้า
                      </h4>
                      <table className="w-full border-collapse border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">ชนิดน้ำมัน</th>
                            <th className="px-4 py-2 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">จำนวน (ลิตร)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                          {(selectedDoc as DeliveryNote).items.map((item, idx) => (
                            <tr key={idx}>
                              <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">{item.oilType}</td>
                              <td className="px-4 py-2 text-sm text-right font-bold text-gray-900 dark:text-white">{numberFormatter.format(item.quantity)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {docType === 'tax-invoice' && (
                  <div className="space-y-6">
                    <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/50 rounded-xl">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider">ผู้รับเงิน / ลูกค้า</p>
                          <p className="text-lg font-bold text-gray-900 dark:text-white">{(selectedDoc as Receipt).customerName}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-md">{(selectedDoc as Receipt).customerAddress}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider">วันที่ออกเอกสาร</p>
                          <p className="text-lg font-bold text-gray-900 dark:text-white">{(selectedDoc as Receipt).receiptDate}</p>
                        </div>
                      </div>
                    </div>

                    <div>
                       <h4 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2 text-sm">
                        <FileText className="w-4 h-4 text-emerald-500" /> รายการภาษี
                      </h4>
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                          <tr className="border-b border-gray-200 dark:border-gray-700">
                            <th className="px-4 py-3 text-left font-bold text-gray-600 dark:text-gray-300">รายละเอียด</th>
                            <th className="px-4 py-3 text-right font-bold text-gray-600 dark:text-gray-300">จำนวนเงิน</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                          {(selectedDoc as Receipt).items.map((item, idx) => (
                            <tr key={idx}>
                              <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{item.oilType} ({numberFormatter.format(item.quantity)} ลิตร)</td>
                              <td className="px-4 py-3 text-right font-bold text-gray-900 dark:text-white">{currencyFormatter.format(item.totalAmount)}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-gray-50/50 dark:bg-gray-700/30">
                          <tr className="border-t border-gray-200 dark:border-gray-700">
                            <td className="px-4 py-2 text-right font-medium text-gray-500 dark:text-gray-400">จำนวนเงินสุทธิ</td>
                            <td className="px-4 py-2 text-right font-bold text-gray-900 dark:text-white">{currencyFormatter.format((selectedDoc as Receipt).totalAmount)}</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-2 text-right font-medium text-gray-500 dark:text-gray-400">ภาษีมูลค่าเพิ่ม (7%)</td>
                            <td className="px-4 py-2 text-right font-bold text-gray-900 dark:text-white">{currencyFormatter.format((selectedDoc as Receipt).vatAmount)}</td>
                          </tr>
                          <tr className="border-t-2 border-gray-200 dark:border-gray-600">
                            <td className="px-4 py-3 text-right text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">ยอดเงินรวมทั้งสิ้น</td>
                            <td className="px-4 py-3 text-right text-lg font-black text-emerald-600 dark:text-emerald-400">{currencyFormatter.format((selectedDoc as Receipt).grandTotal)}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                )}

                {docType === 'receipt' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                       <div className="p-3 bg-orange-50/50 dark:bg-orange-900/10 rounded-lg border border-orange-100 dark:border-orange-800/50">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1"><Building2 className="w-3 h-3" /> สาขาที่รับ</p>
                        <p className="font-bold text-gray-900 dark:text-white">{(selectedDoc as BranchOilReceipt).branchName}</p>
                      </div>
                      <div className="p-3 bg-orange-50/50 dark:bg-orange-900/10 rounded-lg border border-orange-100 dark:border-orange-800/50">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1"><Calendar className="w-3 h-3" /> วันที่รับ</p>
                        <p className="font-bold text-gray-900 dark:text-white">{(selectedDoc as BranchOilReceipt).receiveDate}</p>
                      </div>
                      <div className="p-3 bg-orange-50/50 dark:bg-orange-900/10 rounded-lg border border-orange-100 dark:border-orange-800/50">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1"><User className="w-3 h-3" /> ผู้รับ</p>
                        <p className="font-bold text-gray-900 dark:text-white">{(selectedDoc as BranchOilReceipt).receivedByName || '-'}</p>
                      </div>
                      <div className="p-3 bg-orange-50/50 dark:bg-orange-900/10 rounded-lg border border-orange-100 dark:border-orange-800/50">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1"><Clock className="w-3 h-3" /> เมื่อตอน</p>
                        <p className="font-bold text-gray-900 dark:text-white">{(selectedDoc as BranchOilReceipt).receivedAt ? new Date((selectedDoc as BranchOilReceipt).receivedAt!).toLocaleTimeString('th-TH') : '-'}</p>
                      </div>
                    </div>

                    {/* Quality Test Results */}
                    {(selectedDoc as BranchOilReceipt).qualityTest && (
                      <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800/50 rounded-xl">
                        <h4 className="font-bold text-emerald-800 dark:text-emerald-300 mb-3 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" /> ผลการทดสอบคุณภาพน้ำมัน
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mt-2">
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">API Gravity:</span>
                            <span className="font-bold text-gray-900 dark:text-white ml-2">{(selectedDoc as BranchOilReceipt).qualityTest?.apiGravity}</span>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Temp:</span>
                            <span className="font-bold text-gray-900 dark:text-white ml-2">{(selectedDoc as BranchOilReceipt).qualityTest?.temperature}°C</span>
                          </div>
                           <div>
                            <span className="text-gray-600 dark:text-gray-400">น้ำเจือปน:</span>
                            <span className="font-bold text-gray-900 dark:text-white ml-2">{(selectedDoc as BranchOilReceipt).qualityTest?.waterContent}%</span>
                          </div>
                           <div>
                            <span className="text-gray-600 dark:text-gray-400">ผลทดสอบ:</span>
                            <span className={"font-black ml-2 uppercase tracking-tight " + ((selectedDoc as BranchOilReceipt).qualityTest?.testResult === 'ผ่าน' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500')}>
                              {(selectedDoc as BranchOilReceipt).qualityTest?.testResult}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 dark:bg-gray-700/50">
                        <tr className="border-b border-gray-200 dark:border-gray-700 font-bold text-gray-500 dark:text-gray-400">
                          <th className="px-4 py-3 text-left">ชนิดน้ำมัน</th>
                          <th className="px-4 py-3 text-right">จำนวนที่สั่ง</th>
                          <th className="px-4 py-3 text-right">จำนวนที่รับจริง</th>
                          <th className="px-4 py-3 text-right">ส่วนต่าง</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {(selectedDoc as BranchOilReceipt).items.map((item, idx) => (
                          <tr key={idx} className="text-gray-700 dark:text-gray-300">
                            <td className="px-4 py-3 font-semibold">{item.oilType}</td>
                            <td className="px-4 py-3 text-right">{numberFormatter.format(item.quantityOrdered)} ลิตร</td>
                            <td className="px-4 py-3 text-right font-bold text-emerald-600 dark:text-emerald-400">{numberFormatter.format(item.quantityReceived)} ลิตร</td>
                            <td className="px-4 py-3 text-right text-xs">
                              <span className={item.quantityReceived - item.quantityOrdered >= 0 ? "text-emerald-600" : "text-red-500"}>
                                {item.quantityReceived - item.quantityOrdered > 0 ? "+" : ""}{numberFormatter.format(item.quantityReceived - item.quantityOrdered)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3 bg-gray-50 dark:bg-gray-700/50">
                <button 
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-bold shadow-sm"
                >
                  ปิดหน้าต่าง
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Sub-components ---

function SummaryCard({ title, value, unit, icon: Icon, color }: { title: string; value: string; unit: string; icon: React.ElementType; color: string }) {
  const textColor = color.replace('bg-', 'text-');
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 flex items-center gap-5 transition-all hover:shadow-md">
      <div className={"p-4 rounded-2xl bg-opacity-10 " + color}>
        <Icon className={"w-8 h-8 " + textColor} />
      </div>
      <div>
        <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">{title}</p>
        <div className="flex items-baseline gap-1">
          <p className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">{value}</p>
          {unit && <span className="text-xs font-bold text-gray-400">{unit}</span>}
        </div>
      </div>
    </div>
  );
}
