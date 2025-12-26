import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";
import {
  DollarSign,
  TrendingUp,
  FileText,
  Droplet,
  Search,
  X,
  Eye,
  FileDown,
  ArrowRight,
  Printer,
  Download,
  Truck,
  User,
  CheckCircle,
  AlertCircle,
  ShieldCheck,
  Thermometer,
} from "lucide-react";
import { useGasStation } from "@/contexts/GasStationContext";
import type { OilType, DeliveryNote, Receipt, OilReceipt } from "@/types/gasStation";

const currencyFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 2,
});

const numberFormatter = new Intl.NumberFormat("th-TH", {
  maximumFractionDigits: 0,
});

// Storage Keys (Sync with InternalPumpSales)
const SALES_TX_STORAGE_KEY = "ptt.delivery.internalSales.v1";

// Types (Sync with InternalPumpSales)
type SaleSource = "truck-remaining" | "recovered";

type SaleTx = {
  id: string;
  source: SaleSource;
  createdAt: string;
  fromBranchId: number;
  fromBranchName: string;
  toBranchId: number;
  toBranchName: string;
  oilType: OilType;
  quantity: number;
  pricePerLiter: number;
  totalAmount: number;
  deliveryNoteNo: string;
  receiptNo: string;
  transportNo?: string;
  purchaseOrderNo?: string;
  internalOrderNo?: string;
  recoveredItemId?: string;
};

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export default function DeliveryOilSales() {
  const { deliveryNotes, receipts, oilReceipts } = useGasStation();
  
  // State - Pull data from shared storage
  const [saleTxs] = useState<SaleTx[]>(() => 
    loadFromStorage<SaleTx[]>(SALES_TX_STORAGE_KEY, [])
  );

  const [search, setSearch] = useState("");
  const [selectedDoc, setSelectedDoc] = useState<{ type: "DN" | "RCP" | "OR", no: string } | null>(null);

  const filteredSales = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return saleTxs;
    return saleTxs.filter(t => 
      t.deliveryNoteNo.toLowerCase().includes(q) ||
      t.receiptNo.toLowerCase().includes(q) ||
      t.oilType.toLowerCase().includes(q) ||
      t.fromBranchName.toLowerCase().includes(q) ||
      t.toBranchName.toLowerCase().includes(q)
    );
  }, [saleTxs, search]);

  const summary = useMemo(() => {
    const totalQty = filteredSales.reduce((sum, s) => sum + s.quantity, 0);
    const totalVal = filteredSales.reduce((sum, s) => sum + s.totalAmount, 0);
    return { totalQty, totalVal, count: filteredSales.length };
  }, [filteredSales]);

  const handleViewDoc = (type: "DN" | "RCP" | "OR", no: string) => {
    if (!no) return;
    setSelectedDoc({ type, no });
  };

  const currentDocData = useMemo(() => {
    if (!selectedDoc) return null;
    if (selectedDoc.type === "DN") {
      return deliveryNotes.find(dn => dn.deliveryNoteNo === selectedDoc.no);
    }
    if (selectedDoc.type === "RCP") {
      return receipts.find(r => r.receiptNo === selectedDoc.no);
    }
    if (selectedDoc.type === "OR") {
      return oilReceipts.find(or => or.deliveryNoteNo === selectedDoc.no || or.receiptNo === selectedDoc.no);
    }
    return null;
  }, [selectedDoc, deliveryNotes, receipts, oilReceipts]);

  return (
    <div className="space-y-6 p-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-ptt-blue to-ptt-cyan rounded-2xl flex items-center justify-center shadow-lg shadow-ptt-blue/20">
            <DollarSign className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-app font-display">ประวัติการขายน้ำมัน</h1>
            <p className="text-sm text-muted">แสดงข้อมูลการขายน้ำมันภายในและการดูดน้ำมัน (จากหน้าขายน้ำมันภายในปั๊ม)</p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCard
          title="ยอดขายรวม"
          value={currencyFormatter.format(summary.totalVal)}
          icon={TrendingUp}
          color="blue"
        />
        <SummaryCard
          title="ปริมาณรวม"
          value={`${numberFormatter.format(summary.totalQty)} ลิตร`}
          icon={Droplet}
          color="cyan"
        />
        <SummaryCard
          title="รายการทั้งหมด"
          value={`${summary.count} รายการ`}
          icon={FileText}
          color="indigo"
        />
      </div>

      {/* Search and Table Section */}
      <div className="bg-white/5 border border-app rounded-3xl overflow-hidden backdrop-blur-sm">
        <div className="p-6 border-b border-app flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder="ค้นหาเลขที่ DN/RCP, สาขา, ชนิดน้ำมัน..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-black/20 border border-app rounded-xl focus:outline-none focus:ring-2 focus:ring-ptt-blue/50 text-app"
            />
          </div>
          <div className="flex gap-2">
            <button className="p-2 rounded-xl border border-app hover:bg-white/5 transition-colors text-muted hover:text-app">
              <FileDown className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/5 text-muted text-xs uppercase tracking-wider font-semibold">
                <th className="px-6 py-4">วันที่/เวลา</th>
                <th className="px-6 py-4">ประเภท/แหล่ง</th>
                <th className="px-6 py-4 text-center">สาขา (จาก → ไป)</th>
                <th className="px-6 py-4">ชนิดน้ำมัน</th>
                <th className="px-6 py-4 text-right">จำนวน (ลิตร)</th>
                <th className="px-6 py-4 text-right">ยอดรวม</th>
                <th className="px-6 py-4 text-center">เอกสาร</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-app">
              {filteredSales.map((tx) => (
                <tr key={tx.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-app">
                      {new Date(tx.createdAt).toLocaleDateString("th-TH")}
                    </div>
                    <div className="text-xs text-muted">
                      {new Date(tx.createdAt).toLocaleTimeString("th-TH", { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      tx.source === "truck-remaining" 
                        ? "bg-blue-500/10 text-blue-400 border-blue-500/20" 
                        : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    }`}>
                      {tx.source === "truck-remaining" ? "คงเหลือบนรถ" : "ดูดขึ้นมา"}
                    </span>
                    {tx.transportNo && <div className="text-[10px] text-muted mt-1 uppercase">รอบ {tx.transportNo}</div>}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2 text-xs">
                      <span className="font-semibold text-app">{tx.fromBranchName}</span>
                      <ArrowRight className="w-3 h-3 text-muted" />
                      <span className="font-semibold text-ptt-cyan">{tx.toBranchName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-ptt-blue/10 text-ptt-blue rounded-full text-xs font-bold border border-ptt-blue/20">
                      {tx.oilType}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-app">
                    {numberFormatter.format(tx.quantity)}
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-app">
                    {currencyFormatter.format(tx.totalAmount)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                       <DocButton 
                          label="DN" 
                          no={tx.deliveryNoteNo} 
                          onClick={() => handleViewDoc("DN", tx.deliveryNoteNo)} 
                       />
                       <DocButton 
                          label="RCP" 
                          no={tx.receiptNo} 
                          onClick={() => handleViewDoc("RCP", tx.receiptNo)} 
                       />
                       <DocButton 
                          label="OR" 
                          no={tx.deliveryNoteNo} // สำหรับหน้า Oil Receipt มักใช้เลข DN อ้างอิง
                          onClick={() => handleViewDoc("OR", tx.deliveryNoteNo)} 
                       />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredSales.length === 0 && (
            <div className="p-12 text-center text-muted">
              ไม่พบข้อมูลการขาย (ระบบจะดึงข้อมูลมาจากหน้า "ขายน้ำมันภายในปั๊ม")
            </div>
          )}
        </div>
      </div>

      {/* Document Viewer Modal */}
      <AnimatePresence>
        {selectedDoc && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-[var(--bg)] border border-app rounded-3xl w-full max-w-4xl max-h-[90vh] shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-app flex items-center justify-between bg-white/5">
                <div>
                  <h2 className="text-xl font-bold text-app flex items-center gap-3">
                    {selectedDoc.type === "DN" && <FileText className="w-6 h-6 text-blue-400" />}
                    {selectedDoc.type === "RCP" && <DollarSign className="w-6 h-6 text-emerald-400" />}
                    {selectedDoc.type === "OR" && <ShieldCheck className="w-6 h-6 text-orange-400" />}
                    {selectedDoc.type === "DN" ? "ใบส่งของ (Delivery Note)" : 
                     selectedDoc.type === "RCP" ? "ใบเสร็จรับเงิน/ใบกำกับภาษี" : 
                     "ใบรับน้ำมัน (Oil Receipt)"}
                  </h2>
                  <p className="text-sm text-muted">เลขที่เอกสาร: <span className="text-app font-bold">{selectedDoc.no}</span></p>
                </div>
                <div className="flex items-center gap-2">
                   <button className="p-2 hover:bg-white/10 rounded-xl transition-colors text-muted hover:text-app" title="Print">
                      <Printer className="w-5 h-5" />
                   </button>
                   <button className="p-2 hover:bg-white/10 rounded-xl transition-colors text-muted hover:text-app" title="Download">
                      <Download className="w-5 h-5" />
                   </button>
                   <div className="w-px h-6 bg-app mx-2" />
                   <button
                     onClick={() => setSelectedDoc(null)}
                     className="p-2 hover:bg-white/10 rounded-xl transition-colors text-muted hover:text-app"
                   >
                     <X className="w-6 h-6" />
                   </button>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-8 bg-white dark:bg-gray-900">
                {currentDocData ? (
                  <div className="max-w-3xl mx-auto space-y-8">
                    {selectedDoc.type === "DN" && <DNView data={currentDocData as DeliveryNote} />}
                    {selectedDoc.type === "RCP" && <RCPView data={currentDocData as Receipt} />}
                    {selectedDoc.type === "OR" && <ORView data={currentDocData as OilReceipt} />}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-muted">
                    <AlertCircle className="w-16 h-16 opacity-20 mb-4" />
                    <p className="text-xl font-bold">ไม่พบข้อมูลเอกสาร</p>
                    <p className="text-sm">เอกสารนี้อาจยังไม่ได้ถูกสร้างหรือระบบจัดเก็บข้อมูลขัดข้อง</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Sub-components for Document Viewing ---

function DNView({ data }: { data: DeliveryNote }) {
  return (
    <div className="space-y-6 text-black dark:text-white">
      <div className="grid grid-cols-2 gap-8 border-b dark:border-gray-700 pb-6">
        <div>
          <label className="text-xs font-bold text-gray-400 uppercase">จากสาขา</label>
          <p className="text-lg font-bold">{data.fromBranchName}</p>
        </div>
        <div>
          <label className="text-xs font-bold text-gray-400 uppercase">ถึงสาขา</label>
          <p className="text-lg font-bold">{data.toBranchName}</p>
        </div>
        <div>
          <label className="text-xs font-bold text-gray-400 uppercase">วันที่ส่ง</label>
          <p className="font-bold">{new Date(data.deliveryDate).toLocaleDateString("th-TH")}</p>
        </div>
        <div>
          <label className="text-xs font-bold text-gray-400 uppercase">สถานะ</label>
          <div className="flex items-center gap-2 mt-1">
             <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                data.status === "delivered" ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-blue-50 text-blue-600 border-blue-200"
             }`}>
                {data.status === "delivered" ? "ส่งถึงแล้ว" : "อยู่ระหว่างขนส่ง"}
             </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border dark:border-gray-700">
        <div className="flex items-center gap-3">
          <Truck className="w-5 h-5 text-gray-400" />
          <div>
            <label className="text-[10px] block text-gray-400 uppercase">ทะเบียนรถ</label>
            <p className="text-sm font-bold">{data.truckPlateNumber || "—"}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <User className="w-5 h-5 text-gray-400" />
          <div>
            <label className="text-[10px] block text-gray-400 uppercase">คนขับ</label>
            <p className="text-sm font-bold">{data.driverName || "—"}</p>
          </div>
        </div>
      </div>

      <div>
        <label className="text-xs font-bold text-gray-400 uppercase mb-3 block">รายการสินค้า</label>
        <div className="border dark:border-gray-700 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800/50 border-b dark:border-gray-700">
              <tr>
                <th className="px-4 py-3 text-left">รายละเอียด</th>
                <th className="px-4 py-3 text-right">จำนวน (ลิตร)</th>
                <th className="px-4 py-3 text-right">ราคา/ลิตร</th>
                <th className="px-4 py-3 text-right">ยอดรวม</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-gray-700 font-mono">
              {data.items.map((item, i) => (
                <tr key={i}>
                  <td className="px-4 py-3 font-sans font-bold">{item.oilType}</td>
                  <td className="px-4 py-3 text-right">{numberFormatter.format(item.quantity)}</td>
                  <td className="px-4 py-3 text-right">{item.pricePerLiter.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right font-bold">{currencyFormatter.format(item.totalAmount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-col items-end gap-1 p-6 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/30">
         <p className="text-sm font-bold text-blue-600 dark:text-blue-400">มูลค่ารวมสุทธิ</p>
         <p className="text-3xl font-bold dark:text-white">{currencyFormatter.format(data.totalAmount)}</p>
      </div>

      <div className="grid grid-cols-2 gap-8 pt-6 border-t dark:border-gray-700">
         <div className="text-center p-6 border dark:border-gray-700 rounded-2xl bg-gray-50 dark:bg-gray-800/50">
            <p className="text-[10px] text-gray-400 uppercase mb-8">ลายเซ็นผู้ส่ง</p>
            <div className="h-1px bg-gray-300 dark:bg-gray-600 mx-auto w-40" />
            <p className="text-sm mt-2 font-bold">{data.createdBy}</p>
         </div>
         <div className="text-center p-6 border dark:border-gray-700 rounded-2xl bg-gray-50 dark:bg-gray-800/50">
            <p className="text-[10px] text-gray-400 uppercase mb-4">ลายเซ็นผู้รับ</p>
            {data.signedBy ? (
              <div className="flex flex-col items-center">
                 <CheckCircle className="w-10 h-10 text-emerald-500 mb-2" />
                 <p className="text-sm font-bold">{data.signedBy}</p>
                 <p className="text-[10px] text-gray-400">{new Date(data.signedAt!).toLocaleString("th-TH")}</p>
              </div>
            ) : (
              <div className="h-20 flex items-center justify-center text-gray-300">
                 <p className="text-xs italic">ยังไม่มีการเซ็นรับ</p>
              </div>
            )}
         </div>
      </div>
    </div>
  );
}

function RCPView({ data }: { data: Receipt }) {
  return (
    <div className="space-y-6 text-black dark:text-white">
      <div className="flex justify-between items-start">
         <div>
            <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">TAX INVOICE / RECEIPT</h3>
            <p className="text-sm text-gray-500">ใบกำกับภาษี / ใบเสร็จรับเงิน</p>
         </div>
         <div className="text-right">
            <p className="text-xs font-bold text-gray-400 uppercase">วันที่ออกเอกสาร</p>
            <p className="font-bold">{new Date(data.receiptDate).toLocaleDateString("th-TH")}</p>
         </div>
      </div>

      <div className="grid grid-cols-2 gap-8 p-6 border dark:border-gray-700 rounded-2xl">
         <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase">ลูกค้า (Customer)</label>
            <p className="font-bold text-lg leading-tight">{data.customerName}</p>
            <p className="text-sm text-gray-500 mt-1">{data.customerAddress}</p>
            {data.customerTaxId && (
              <p className="text-xs font-mono mt-2 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded inline-block">
                TAX ID: {data.customerTaxId}
              </p>
            )}
         </div>
         <div className="text-right space-y-4">
            <div>
               <label className="text-[10px] font-bold text-gray-400 uppercase">เลขอ้างอิงใบส่งของ</label>
               <p className="font-bold">{data.deliveryNoteNo || "—"}</p>
            </div>
            {data.purchaseOrderNo && (
              <div>
                 <label className="text-[10px] font-bold text-gray-400 uppercase">เลขอ้างอิงใบสั่งซื้อ (PO)</label>
                 <p className="font-bold">{data.purchaseOrderNo}</p>
              </div>
            )}
         </div>
      </div>

      <div className="border dark:border-gray-700 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800/50 border-b dark:border-gray-700">
            <tr>
              <th className="px-4 py-3 text-left">รายการ (Description)</th>
              <th className="px-4 py-3 text-right">จำนวน</th>
              <th className="px-4 py-3 text-right">ราคา/หน่วย</th>
              <th className="px-4 py-3 text-right">จำนวนเงิน</th>
            </tr>
          </thead>
          <tbody className="divide-y dark:divide-gray-700">
            {data.items.map((item, i) => (
              <tr key={i}>
                <td className="px-4 py-3 font-bold">{item.oilType}</td>
                <td className="px-4 py-3 text-right font-mono">{numberFormatter.format(item.quantity)}</td>
                <td className="px-4 py-3 text-right font-mono">{item.pricePerLiter.toFixed(2)}</td>
                <td className="px-4 py-3 text-right font-mono font-bold">{currencyFormatter.format(item.totalAmount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end">
         <div className="w-72 space-y-2">
            <div className="flex justify-between text-sm">
               <span className="text-gray-500">รวมเป็นเงิน (Sub-total)</span>
               <span className="font-mono">{currencyFormatter.format(data.totalAmount - (data.vatAmount || 0))}</span>
            </div>
            <div className="flex justify-between text-sm">
               <span className="text-gray-500">ภาษีมูลค่าเพิ่ม (VAT 7%)</span>
               <span className="font-mono">{currencyFormatter.format(data.vatAmount || 0)}</span>
            </div>
            <div className="pt-2 border-t dark:border-gray-700 flex justify-between items-center font-bold">
               <span className="text-lg">ยอดเงินรวมสุทธิ</span>
               <span className="text-2xl text-emerald-600 dark:text-emerald-400">{currencyFormatter.format(data.grandTotal)}</span>
            </div>
         </div>
      </div>
      
      {data.amountInWords && (
         <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl text-center text-sm italic font-bold">
            ({data.amountInWords})
         </div>
      )}
    </div>
  );
}

function ORView({ data }: { data: OilReceipt }) {
  return (
    <div className="space-y-6 text-black dark:text-white">
      <div className="flex justify-between items-center">
         <h3 className="text-2xl font-bold text-orange-600 dark:text-orange-400">OIL RECEIVING RECORD</h3>
         <div className="text-right">
            <label className="text-[10px] font-bold text-gray-400 uppercase">วันที่รับของ</label>
            <p className="font-bold">{new Date(data.receiveDate).toLocaleDateString("th-TH")} {data.receiveTime}</p>
         </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
         <div className="p-4 border dark:border-gray-700 rounded-2xl flex items-center gap-4">
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
               <Truck className="w-5 h-5 text-orange-600" />
            </div>
            <div>
               <label className="text-[10px] text-gray-400 uppercase">ทะเบียนรถขนส่ง</label>
               <p className="font-bold">{data.truckLicensePlate}</p>
            </div>
         </div>
         <div className="p-4 border dark:border-gray-700 rounded-2xl flex items-center gap-4">
             <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
               <User className="w-5 h-5 text-orange-600" />
            </div>
            <div>
               <label className="text-[10px] text-gray-400 uppercase">พนักงานขับรถ</label>
               <p className="font-bold">{data.driverName}</p>
            </div>
         </div>
      </div>

      <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-2xl shadow-sm overflow-hidden">
         <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-b dark:border-gray-700 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            <h4 className="text-sm font-bold uppercase tracking-wider">Quality Test Results (ผลการตรวจสอบคุณภาพ)</h4>
         </div>
         <div className="p-6 grid grid-cols-3 gap-8">
            <div className="space-y-1">
               <div className="flex items-center gap-2 text-gray-400 mb-1">
                  <Thermometer className="w-4 h-4" />
                  <span className="text-[10px] font-bold uppercase">Temperature</span>
               </div>
               <p className="text-xl font-bold">{data.qualityTest.temperature}°C</p>
            </div>
            <div className="space-y-1">
               <div className="flex items-center gap-2 text-gray-400 mb-1">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-[10px] font-bold uppercase">API Gravity</span>
               </div>
               <p className="text-xl font-bold">{data.qualityTest.apiGravity}</p>
            </div>
            <div className="space-y-1">
               <div className="flex items-center gap-2 text-gray-400 mb-1">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <span className="text-[10px] font-bold uppercase">Result</span>
               </div>
               <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{data.qualityTest.testResult}</p>
            </div>
         </div>
      </div>

      <div>
        <label className="text-xs font-bold text-gray-400 uppercase mb-3 block">รายการที่รับเข้าถัง</label>
        <div className="border dark:border-gray-700 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800/50 border-b dark:border-gray-700">
              <tr>
                <th className="px-4 py-3 text-left">ชนิดน้ำมัน</th>
                <th className="px-4 py-3 text-center">ถังเลขที่</th>
                <th className="px-4 py-3 text-right">จำนวนสั่ง (L)</th>
                <th className="px-4 py-3 text-right">จำนวนรับ (L)</th>
                <th className="px-4 py-3 text-right">ส่วนต่าง (Gain/Loss)</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-gray-700 font-mono">
              {data.items.map((item, i) => (
                <tr key={i}>
                  <td className="px-4 py-3 font-sans font-bold">{item.oilType}</td>
                  <td className="px-4 py-3 text-center">#{item.tankNumber}</td>
                  <td className="px-4 py-3 text-right">{numberFormatter.format(item.quantityOrdered)}</td>
                  <td className="px-4 py-3 text-right font-bold text-blue-600 dark:text-blue-400">{numberFormatter.format(item.quantityReceived)}</td>
                  <td className={`px-4 py-3 text-right font-bold ${
                    item.differenceLiter < 0 ? "text-red-500" : item.differenceLiter > 0 ? "text-emerald-500" : "text-gray-400"
                  }`}>
                    {item.differenceLiter > 0 ? "+" : ""}{numberFormatter.format(item.differenceLiter)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function DocButton({ label, no, onClick }: { label: string, no: string, onClick: () => void }) {
  if (!no) return null;
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-2 py-1 bg-white/5 border border-app rounded-lg hover:bg-ptt-blue/10 hover:border-ptt-blue/30 transition-all text-[10px] font-bold text-muted hover:text-app"
      title={`ดู ${label}: ${no}`}
    >
      <Eye className="w-3 h-3" />
      {label}
    </button>
  );
}

interface SummaryCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
  color: "blue" | "cyan" | "indigo";
}

function SummaryCard({ title, value, icon: Icon, color }: SummaryCardProps) {
  const colors = {
    blue: "from-blue-500/10 to-blue-600/5 text-blue-500 border-blue-500/20 shadow-blue-500/5",
    cyan: "from-cyan-500/10 to-cyan-600/5 text-cyan-500 border-cyan-500/20 shadow-cyan-500/5",
    indigo: "from-indigo-500/10 to-indigo-600/5 text-indigo-500 border-indigo-500/20 shadow-indigo-500/5",
  };

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      className={`p-6 rounded-3xl bg-gradient-to-br ${colors[color]} border shadow-xl backdrop-blur-md`}
    >
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-2xl bg-white/10 dark:bg-black/20 flex items-center justify-center shadow-inner`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-bold text-muted uppercase tracking-[0.1em]">{title}</p>
          <p className="text-xl font-bold text-app mt-0.5 truncate">{value}</p>
        </div>
      </div>
    </motion.div>
  );
}
