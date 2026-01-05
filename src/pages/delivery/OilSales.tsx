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
import { useBranch } from "@/contexts/BranchContext";
import deliveryMockData from "@/data/delivery_mock_data.json";
import type { OilType, DeliveryNote, Receipt, OilReceipt } from "@/types/gasStation";

const currencyFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 2,
});

const numberFormatter = new Intl.NumberFormat("th-TH", {
  maximumFractionDigits: 0,
});

// Storage Keys (Sync with InternalPumpSales) - DEPRECATED / MOCKED
// const SALES_TX_STORAGE_KEY = "ptt.delivery.internalSales.v1";

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
  paymentStatus?: "unpaid" | "paid";
};

// function loadFromStorage<T>(key: string, fallback: T): T {
//   try {
//     const raw = window.localStorage.getItem(key);
//     return raw ? JSON.parse(raw) : fallback;
//   } catch {
//     return fallback;
//   }
// }

export default function DeliveryOilSales() {
  const { deliveryNotes, receipts, oilReceipts, branches } = useGasStation();
  const { selectedBranches } = useBranch();
  const selectedBranchIds = useMemo(() => selectedBranches.map(id => Number(id)), [selectedBranches]);

  // State - Use Mock Data from JSON
  const [saleTxs] = useState<SaleTx[]>(deliveryMockData.saleTxs as SaleTx[]);

  const [search, setSearch] = useState("");
  const [selectedDoc, setSelectedDoc] = useState<{ type: "DN" | "RCP" | "OR", no: string } | null>(null);

  const filteredSales = useMemo(() => {
    const q = search.toLowerCase().trim();
    return saleTxs.filter(t => {
      const matchSearch = !q ||
        t.deliveryNoteNo.toLowerCase().includes(q) ||
        t.receiptNo.toLowerCase().includes(q) ||
        t.oilType.toLowerCase().includes(q) ||
        t.fromBranchName.toLowerCase().includes(q) ||
        t.toBranchName.toLowerCase().includes(q);
      
      const matchBranch = selectedBranchIds.length === 0 || 
        selectedBranchIds.includes(t.fromBranchId) || 
        selectedBranchIds.includes(t.toBranchId);

      return matchSearch && matchBranch;
    });
  }, [saleTxs, search, selectedBranchIds]);

  const summary = useMemo(() => {
    const totalQty = filteredSales.reduce((sum, s) => sum + s.quantity, 0);
    const totalVal = filteredSales.reduce((sum, s) => sum + s.totalAmount, 0);
    return { totalQty, totalVal, count: filteredSales.length };
  }, [filteredSales]);

  const handleViewDoc = (type: "DN" | "RCP" | "OR", no: string) => {
    if (!no) return;
    setSelectedDoc({ type, no });
  };

  // Mock Document Generators
  const generateMockDN = (tx: SaleTx): DeliveryNote => ({
    id: `MOCK-DN-${tx.id}`,
    deliveryNoteNo: tx.deliveryNoteNo,
    deliveryDate: tx.createdAt,
    fromBranchId: tx.fromBranchId,
    fromBranchName: tx.fromBranchName,
    toBranchId: tx.toBranchId,
    toBranchName: tx.toBranchName,
    items: [{
      id: "MOCK-ITEM-1",
      oilType: tx.oilType,
      quantity: tx.quantity,
      pricePerLiter: tx.pricePerLiter,
      totalAmount: tx.totalAmount
    }],
    totalAmount: tx.totalAmount,
    status: "delivered",
    truckPlateNumber: "70-1234",
    driverName: "นายสมชาย ใจดี",
    createdBy: "System Admin",
    createdAt: tx.createdAt,
    signedBy: "ผู้รับสินค้าปลายทาง",
    signedAt: new Date().toISOString()
  });

  const generateMockReceipt = (tx: SaleTx): Receipt => ({
    id: `MOCK-RCP-${tx.id}`,
    receiptNo: tx.receiptNo,
    branchId: tx.fromBranchId,
    receiptDate: tx.createdAt,
    deliveryNoteNo: tx.deliveryNoteNo,
    customerName: tx.toBranchName,
    customerAddress: "ที่อยู่สาขาปลายทาง (Mock Address)",
    items: [{
      id: "MOCK-ITEM-1",
      oilType: tx.oilType,
      quantity: tx.quantity,
      pricePerLiter: tx.pricePerLiter,
      totalAmount: tx.totalAmount
    }],
    totalAmount: tx.totalAmount,
    vatAmount: tx.totalAmount * 0.07,
    grandTotal: tx.totalAmount * 1.07,
    documentType: "ใบกำกับภาษี",
    status: "issued",
    createdAt: tx.createdAt,
    createdBy: "System Admin"
  });

  const generateMockOR = (tx: SaleTx): OilReceipt => ({
    id: `MOCK-OR-${tx.id}`,
    receiptNo: `OR-${tx.receiptNo}`,
    branchId: tx.fromBranchId,
    deliveryNoteNo: tx.deliveryNoteNo,
    receiveDate: tx.createdAt.split("T")[0],
    receiveTime: tx.createdAt.split("T")[1].substring(0, 5),
    truckLicensePlate: "70-1234",
    driverName: "นายสมชาย ใจดี",
    totalAmount: tx.totalAmount,
    status: "completed",
    qualityTest: {
      apiGravity: 32.5,
      waterContent: 0,
      temperature: 28.5,
      color: "ผ่านเกณฑ์",
      testResult: "ผ่าน",
      testedBy: "จนท. ตรวจสอบ",
      testDateTime: tx.createdAt
    },
    items: [{
      oilType: tx.oilType,
      tankNumber: 1,
      quantityOrdered: tx.quantity,
      beforeDip: 1000,
      afterDip: 1000 + tx.quantity,
      quantityReceived: tx.quantity,
      differenceLiter: 0,
      differenceAmount: 0,
      pricePerLiter: tx.pricePerLiter
    }],
    createdAt: tx.createdAt,
    createdBy: "System Admin"
  });

  const currentDocData = useMemo(() => {
    if (!selectedDoc) return null;

    // First try to find in context (real data)
    let foundDoc = null;
    if (selectedDoc.type === "DN") {
      foundDoc = deliveryNotes.find(dn => dn.deliveryNoteNo === selectedDoc.no);
    } else if (selectedDoc.type === "RCP") {
      foundDoc = receipts.find(r => r.receiptNo === selectedDoc.no);
    } else if (selectedDoc.type === "OR") {
      foundDoc = oilReceipts.find(or => or.deliveryNoteNo === selectedDoc.no || or.receiptNo === selectedDoc.no);
    }

    if (foundDoc) return foundDoc;

    // Fallback: Generate mock data from saleTxs if corresponds
    const relatedTx = saleTxs.find(tx =>
      tx.deliveryNoteNo === selectedDoc.no ||
      tx.receiptNo === selectedDoc.no
    );

    if (relatedTx) {
      if (selectedDoc.type === "DN") return generateMockDN(relatedTx);
      if (selectedDoc.type === "RCP") return generateMockReceipt(relatedTx);
      if (selectedDoc.type === "OR") return generateMockOR(relatedTx);
    }

    return null;
  }, [selectedDoc, deliveryNotes, receipts, oilReceipts, saleTxs]);

  // Formatter for dates
  const dateFormatter = new Intl.DateTimeFormat("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const handleDocAction = (action: "print" | "download") => {
    if (!selectedDoc || !currentDocData) return;

    let htmlContent = "";
    let fileName = "";
    const type = selectedDoc.type;
    const data = currentDocData;

    if (type === "DN") {
      const dn = data as DeliveryNote;
      fileName = `ใบส่งของ_${dn.deliveryNoteNo}.html`;
      htmlContent = `
        <!DOCTYPE html>
        <html lang="th">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>ใบส่งของ - ${dn.deliveryNoteNo}</title>
          <style>
            @page { size: A4; margin: 20mm; }
            body { font-family: 'Sarabun', 'TH Sarabun New', sans-serif; font-size: 14px; line-height: 1.6; color: #000; background: #fff; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #000; padding-bottom: 20px; }
            .header h1 { font-size: 24px; font-weight: bold; margin: 0 0 10px 0; }
            .header h2 { font-size: 20px; font-weight: bold; margin: 0; }
            .info-section { margin-bottom: 20px; }
            .info-row { display: flex; margin-bottom: 10px; }
            .info-label { width: 150px; font-weight: bold; }
            .info-value { flex: 1; }
            .two-columns { display: flex; gap: 40px; margin-bottom: 20px; }
            .column { flex: 1; }
            .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .table th, .table td { border: 1px solid #000; padding: 10px; text-align: left; }
            .table th { background-color: #f0f0f0; font-weight: bold; text-align: center; }
            .table td { text-align: right; }
            .table td:first-child { text-align: left; }
            .footer { margin-top: 50px; display: grid; grid-template-columns: 1fr 1fr; gap: 50px; }
            .sig { text-align: center; border-top: 1px solid #000; padding-top: 10px; margin-top: 40px; }
            @media print { body { margin: 0; } .no-print { display: none; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>ใบส่งของ (Delivery Note)</h1>
            <h2>เลขที่: ${dn.deliveryNoteNo}</h2>
          </div>
          <div class="info-section">
            <div class="info-row"><div class="info-label">วันที่ส่ง:</div><div class="info-value">${dateFormatter.format(new Date(dn.deliveryDate))}</div></div>
            ${dn.purchaseOrderNo ? `<div class="info-row"><div class="info-label">เลขที่ใบสั่งซื้อ:</div><div class="info-value">${dn.purchaseOrderNo}</div></div>` : ""}
          </div>
          <div class="two-columns">
            <div class="column">
              <div class="info-label">จาก (ผู้ส่ง):</div>
              <div class="info-value">${dn.fromBranchName}</div>
            </div>
            <div class="column">
              <div class="info-label">ไป (ผู้รับ):</div>
              <div class="info-value">${dn.toBranchName}</div>
            </div>
          </div>
          <div class="two-columns">
            <div class="column">
               <div class="info-row"><div class="info-label">ทะเบียนรถ:</div><div class="info-value">${dn.truckPlateNumber || "-"}</div></div>
            </div>
            <div class="column">
               <div class="info-row"><div class="info-label">คนขับ:</div><div class="info-value">${dn.driverName || "-"}</div></div>
            </div>
          </div>
          <table class="table">
            <thead><tr><th>รายการ</th><th>จำนวน (ลิตร)</th></tr></thead>
            <tbody>
              ${dn.items.map((it) => `<tr><td>${it.oilType}</td><td>${numberFormatter.format(it.quantity)}</td></tr>`).join("")}
            </tbody>
          </table>
          <div class="footer">
            <div class="sig">
              <div>${dn.createdBy}</div>
              <div style="font-size: 12px; color: #666;">ผู้ส่งสินค้า</div>
            </div>
            <div class="sig">
              <div>${dn.signedBy || ".........................................."}</div>
              <div style="font-size: 12px; color: #666;">ผู้รับสินค้า</div>
            </div>
          </div>
          ${action === "print" ? "<script>window.print();</script>" : ""}
        </body>
        </html>
      `;
    } else if (type === "RCP") {
      const receipt = data as Receipt;
      fileName = `ใบกำกับภาษี_${receipt.receiptNo}.html`;
      htmlContent = `
        <!DOCTYPE html>
        <html lang="th">
        <head>
          <meta charset="UTF-8">
          <title>${receipt.documentType} - ${receipt.receiptNo}</title>
          <style>
            @page { size: A4; margin: 20mm; }
            body { font-family: 'Sarabun', sans-serif; font-size: 14px; color: #000; }
            .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 10px; }
            .header h1 { font-size: 20px; margin: 0 0 5px 0; }
            .row { display: flex; gap: 20px; margin-bottom: 8px; }
            .label { width: 160px; font-weight: bold; }
            .value { flex: 1; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            th, td { border: 1px solid #000; padding: 8px; }
            th { background: #f0f0f0; text-align: center; }
            td { text-align: right; }
            td:first-child { text-align: left; }
            .totals { margin-top: 10px; display: flex; justify-content: flex-end; }
            .totals div { width: 300px; }
            .totals .line { display: flex; justify-content: space-between; margin-top: 5px; }
            .strong { font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header"><h1>${receipt.documentType}</h1><div><strong>เลขที่:</strong> ${receipt.receiptNo}</div></div>
          <div class="row"><div class="label">วันที่:</div><div class="value">${dateFormatter.format(new Date(receipt.receiptDate))}</div></div>
          <div class="row"><div class="label">ผู้ซื้อ/ผู้รับ:</div><div class="value">${receipt.customerName}</div></div>
          <div class="row"><div class="label">ที่อยู่:</div><div class="value">${receipt.customerAddress}</div></div>
          ${receipt.customerTaxId ? `<div class="row"><div class="label">เลขประจำตัวผู้เสียภาษี:</div><div class="value">${receipt.customerTaxId}</div></div>` : ""}
          <table>
            <thead><tr><th>รายการ</th><th>จำนวน</th><th>ราคา/หน่วย</th><th>จำนวนเงิน</th></tr></thead>
            <tbody>
              ${receipt.items.map((it) => `<tr><td>${it.oilType}</td><td>${numberFormatter.format(it.quantity)}</td><td>${it.pricePerLiter.toFixed(2)}</td><td>${currencyFormatter.format(it.totalAmount)}</td></tr>`).join("")}
            </tbody>
          </table>
          <div class="totals">
            <div>
              <div class="line"><span>มูลค่าก่อน VAT</span><span>${currencyFormatter.format(receipt.totalAmount)}</span></div>
              <div class="line"><span>VAT (7%)</span><span>${currencyFormatter.format(receipt.vatAmount)}</span></div>
              <div class="line strong"><span>รวมทั้งสิ้น</span><span>${currencyFormatter.format(receipt.grandTotal)}</span></div>
            </div>
          </div>
          ${receipt.amountInWords ? `<div style="margin-top: 20px; text-align: center; font-weight: bold;">(${receipt.amountInWords})</div>` : ""}
          ${action === "print" ? "<script>window.print();</script>" : ""}
        </body>
        </html>
      `;
    } else if (type === "OR") {
      const or = data as OilReceipt;
      fileName = `ใบรับน้ำมัน_${or.receiptNo}.html`;
      htmlContent = `
        <!DOCTYPE html>
        <html lang="th">
        <head>
          <meta charset="UTF-8">
          <title>ใบรับน้ำมัน - ${or.receiptNo}</title>
          <style>
            @page { size: A4; margin: 20mm; }
            body { font-family: 'Sarabun', 'TH Sarabun New', sans-serif; font-size: 14px; line-height: 1.6; color: #000; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #000; padding-bottom: 20px; }
            .header h1 { font-size: 24px; font-weight: bold; margin: 0 0 10px 0; }
            .info-section { margin-bottom: 20px; }
            .info-row { display: flex; margin-bottom: 8px; }
            .info-label { width: 140px; font-weight: bold; }
            .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .table th, .table td { border: 1px solid #000; padding: 10px; }
            .table th { background: #f0f0f0; text-align: center; }
            .table td { text-align: right; }
            .table td:first-child { text-align: left; }
            .footer { margin-top: 40px; display: flex; justify-content: space-around; }
            .sig { text-align: center; width: 200px; border-top: 1px solid #000; padding-top: 10px; }
          </style>
        </head>
        <body>
          <div class="header"><h1>ใบรับน้ำมัน (Oil Receipt)</h1><h2>เลขที่: ${or.receiptNo}</h2></div>
          <div class="info-section">
            <div class="info-row"><div class="info-label">วันที่รับ:</div><div>${dateFormatter.format(new Date(or.receiveDate))} ${or.receiveTime}</div></div>
            <div class="info-row"><div class="info-label">ทะเบียนรถ:</div><div>${or.truckLicensePlate}</div></div>
            <div class="info-row"><div class="info-label">คนขับ:</div><div>${or.driverName}</div></div>
          </div>
          
          <div style="border: 1px solid #000; padding: 15px; margin-bottom: 20px;">
             <strong>ผลการตรวจสอบคุณภาพ:</strong>
             <div style="display: flex; gap: 30px; margin-top: 10px;">
                <div>Temperature: ${or.qualityTest.temperature}°C</div>
                <div>API: ${or.qualityTest.apiGravity}</div>
                <div>Result: ${or.qualityTest.testResult}</div>
             </div>
          </div>

          <table class="table">
            <thead><tr><th>รายการ</th><th>ถังที่</th><th>จำนวนสั่ง (ลิตร)</th><th>รับจริง (ลิตร)</th><th>ส่วนต่าง</th></tr></thead>
            <tbody>
               ${or.items.map(it => `
                  <tr>
                    <td>${it.oilType}</td>
                    <td style="text-align: center;">${it.tankNumber}</td>
                    <td>${numberFormatter.format(it.quantityOrdered)}</td>
                    <td>${numberFormatter.format(it.quantityReceived)}</td>
                    <td style="${it.differenceLiter !== 0 ? 'color: red;' : ''}">${numberFormatter.format(it.differenceLiter)}</td>
                  </tr>
               `).join("")}
            </tbody>
          </table>
          
          <div class="footer">
             <div class="sig">ผู้ส่งมอบ (คนขับ)</div>
             <div class="sig">ผู้รับมอบ (จนท. คลัง)</div>
          </div>

          ${action === "print" ? "<script>window.print();</script>" : ""}
        </body>
        </html>
      `;
    }

    if (action === "print") {
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
      } else {
        alert("ไม่สามารถเปิดหน้าต่างพิมพ์ได้ (กรุณาอนุญาต pop-up)");
      }
    } else if (action === "download") {
      const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
            <DollarSign className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 font-display">ประวัติการขายน้ำมัน</h1>
            <p className="text-sm text-gray-500 mt-1">แสดงข้อมูลการขายน้ำมันภายในและการดูดน้ำมัน (จากหน้าขายน้ำมันภายในปั๊ม)</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-white/50 dark:bg-gray-800/50 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm backdrop-blur-sm">
          <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            สาขาที่กำลังดู: {selectedBranches.length === 0 ? "ทั้งหมด" : selectedBranches.map(id => branches.find(b => String(b.id) === id)?.name || id).join(", ")}
          </span>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4"
        >
          <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
            <TrendingUp className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <div className="text-xs text-gray-500">ยอดขายรวม</div>
            <div className="text-xl font-bold text-gray-800">{currencyFormatter.format(summary.totalVal)}</div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4"
        >
          <div className="h-12 w-12 rounded-full bg-cyan-100 flex items-center justify-center shrink-0">
            <Droplet className="h-6 w-6 text-cyan-600" />
          </div>
          <div>
            <div className="text-xs text-gray-500">ปริมาณรวม</div>
            <div className="text-xl font-bold text-gray-800">{numberFormatter.format(summary.totalQty)} ลิตร</div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4"
        >
          <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
            <FileText className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <div className="text-xs text-gray-500">รายการทั้งหมด</div>
            <div className="text-xl font-bold text-gray-800">{summary.count} รายการ</div>
          </div>
        </motion.div>
      </div>

      {/* Search and Table Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="ค้นหาเลขที่ DN/RCP, สาขา, ชนิดน้ำมัน..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
            />
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 rounded-lg text-sm font-medium transition-colors shadow-sm">
              <FileDown className="w-4 h-4" />
              ส่งออก
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider border-b border-gray-200">
                <th className="px-6 py-4 font-medium">วันที่/เวลา</th>
                <th className="px-6 py-4 font-medium">ประเภท/แหล่ง</th>
                <th className="px-6 py-4 font-medium text-center">สาขา (จาก → ไป)</th>
                <th className="px-6 py-4 font-medium">ชนิดน้ำมัน</th>
                <th className="px-6 py-4 font-medium text-right">จำนวน (ลิตร)</th>
                <th className="px-6 py-4 font-medium text-right">ยอดรวม</th>
                <th className="px-6 py-4 font-medium text-center">เอกสาร</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {filteredSales.map((tx) => (
                <tr key={tx.id} className="hover:bg-blue-50/10 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-app">
                      {new Date(tx.createdAt).toLocaleDateString("th-TH")}
                    </div>
                    <div className="text-xs text-muted">
                      {new Date(tx.createdAt).toLocaleTimeString("th-TH", { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${tx.source === "truck-remaining"
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
              ไม่พบข้อมูลการขาย (ระบบจะดึงข้อมูลมาจากหน้า &ldquo;ขายน้ำมันภายในปั๊ม&rdquo;)
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
                  <button onClick={() => handleDocAction("print")} className="p-2 hover:bg-white/10 rounded-xl transition-colors text-muted hover:text-app" title="Print">
                    <Printer className="w-5 h-5" />
                  </button>
                  <button onClick={() => handleDocAction("download")} className="p-2 hover:bg-white/10 rounded-xl transition-colors text-muted hover:text-app" title="Download">
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
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${data.status === "delivered" ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-blue-50 text-blue-600 border-blue-200"
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
                  <td className={`px-4 py-3 text-right font-bold ${item.differenceLiter < 0 ? "text-red-500" : item.differenceLiter > 0 ? "text-emerald-500" : "text-gray-400"
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


