import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";
import {
  DollarSign,
  TrendingUp,
  FileText,
  Droplet,
  Search,
  X,
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
import TableActionMenu from "@/components/TableActionMenu";
import { useGasStation } from "@/contexts/GasStationContext";
import { useBranch } from "@/contexts/BranchContext";
import type { DeliveryNote, Receipt, OilReceipt, SaleTx } from "@/types/gasStation";

const currencyFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 2,
});

const numberFormatter = new Intl.NumberFormat("th-TH", {
  maximumFractionDigits: 0,
});

export default function DeliveryOilSales() {
  const { deliveryNotes, receipts, oilReceipts, branches, saleTxs } = useGasStation();
  const { selectedBranches } = useBranch();
  const selectedBranchIds = useMemo(() => selectedBranches.map(id => Number(id)), [selectedBranches]);

  const [search, setSearch] = useState("");
  const [selectedDoc, setSelectedDoc] = useState<{ type: "DN" | "RCP" | "OR", no: string } | null>(null);

  const filteredSales = useMemo(() => {
    const q = search.toLowerCase().trim();
    return saleTxs.filter((t: SaleTx) => {
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
    const totalQty = filteredSales.reduce((sum: number, s: SaleTx) => sum + s.quantity, 0);
    const totalVal = filteredSales.reduce((sum: number, s: SaleTx) => sum + s.totalAmount, 0);
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
    documentType: "ใบเสร็จรับเงิน",
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
      foundDoc = deliveryNotes.find((dn: DeliveryNote) => dn.deliveryNoteNo === selectedDoc.no);
    } else if (selectedDoc.type === "RCP") {
      foundDoc = receipts.find((r: Receipt) => r.receiptNo === selectedDoc.no);
    } else if (selectedDoc.type === "OR") {
      foundDoc = oilReceipts.find((or: OilReceipt) => or.deliveryNoteNo === selectedDoc.no || or.receiptNo === selectedDoc.no);
    }

    if (foundDoc) return foundDoc;

    // Fallback: Generate mock data from saleTxs if corresponds
    const relatedTx = saleTxs.find((tx: SaleTx) =>
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
            <thead><tr><th>รายการ</th><th>ถังที่</th><th>จำนวนสั่ง (ลิตรส)</th><th>รับจริง (ลิตร)</th><th>ส่วนต่าง</th></tr></thead>
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
            สาขาที่กำลังดู: {selectedBranches.length === 0 ? "ทั้งหมด" : selectedBranches.map((id: string) => branches.find((b) => String(b.id) === id)?.name || id).join(", ")}
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
              {filteredSales.map((tx: SaleTx) => (
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
                    <div className="flex justify-center">
                      <TableActionMenu
                        actions={[
                          ...(tx.deliveryNoteNo ? [{
                            label: "ดูใบส่งของ (DN)",
                            icon: FileText,
                            onClick: () => handleViewDoc("DN", tx.deliveryNoteNo),
                            variant: "primary" as const
                          }] : []),
                          ...(tx.receiptNo ? [{
                            label: "ดูใบเสร็จรับเงิน (RCP)",
                            icon: DollarSign,
                            onClick: () => handleViewDoc("RCP", tx.receiptNo),
                            variant: "success" as const
                          }] : []),
                          ...(tx.deliveryNoteNo ? [{
                            label: "ดูใบรับน้ำมัน (OR)",
                            icon: ShieldCheck,
                            onClick: () => handleViewDoc("OR", tx.deliveryNoteNo),
                            variant: "warning" as const
                          }] : [])
                        ]}
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
  const numberFormatter = new Intl.NumberFormat("th-TH", {
    maximumFractionDigits: 0,
  });
  const currencyFormatter = new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    maximumFractionDigits: 2,
  });

  return (
    <div className="space-y-6 text-black dark:text-white">
      <div className="grid grid-cols-2 gap-8 border-b dark:border-gray-700 pb-6">
        <div>
          <div className="text-xs font-bold text-gray-400 uppercase">จากสาขา</div>
          <p className="text-lg font-bold">{data.fromBranchName}</p>
        </div>
        <div>
          <div className="text-xs font-bold text-gray-400 uppercase">ถึงสาขา</div>
          <p className="text-lg font-bold">{data.toBranchName}</p>
        </div>
        <div>
          <div className="text-xs font-bold text-gray-400 uppercase">วันที่ส่ง</div>
          <p className="font-bold">{new Date(data.deliveryDate).toLocaleDateString("th-TH")}</p>
        </div>
        <div>
          <div className="text-xs font-bold text-gray-400 uppercase">สถานะ</div>
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
            <span className="text-[10px] block text-gray-400 uppercase">ทะเบียนรถ</span>
            <p className="text-sm font-bold">{data.truckPlateNumber || "—"}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <User className="w-5 h-5 text-gray-400" />
          <div>
            <span className="text-[10px] block text-gray-400 uppercase">คนขับ</span>
            <p className="text-sm font-bold">{data.driverName || "—"}</p>
          </div>
        </div>
      </div>

      <div>
        <div className="text-xs font-bold text-gray-400 uppercase mb-3 block">รายการสินค้า</div>
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
              ..........................................
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function RCPView({ data }: { data: Receipt }) {
  const numberFormatter = new Intl.NumberFormat("th-TH", {
    maximumFractionDigits: 0,
  });
  const currencyFormatter = new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    maximumFractionDigits: 2,
  });

  return (
    <div className="space-y-6 text-black dark:text-white">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <h3 className="text-2xl font-black text-ptt-blue uppercase tracking-tight">PTT STATION</h3>
          <p className="text-xs text-muted max-w-[240px]">สำนักงานใหญ่: 123 ถ.วิภาวดีรังสิต แขวงจตุจักร เขตจตุจักร กรุงเทพฯ 10900</p>
        </div>
        <div className="text-right">
          <div className="text-xs font-bold text-gray-400 uppercase">เลขที่เอกสาร</div>
          <p className="text-xl font-black text-app">{data.receiptNo}</p>
        </div>
      </div>

      <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-3xl border dark:border-gray-700 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-[10px] text-gray-400 uppercase font-bold">ชื่อลูกค้า / สาขา</div>
            <p className="font-bold">{data.customerName}</p>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-gray-400 uppercase font-bold">วันที่</div>
            <p className="font-bold">{new Date(data.receiptDate).toLocaleDateString("th-TH")}</p>
          </div>
        </div>
        <div>
          <div className="text-[10px] text-gray-400 uppercase font-bold">ที่อยู่</div>
          <p className="text-sm">{data.customerAddress}</p>
        </div>
        {data.customerTaxId && (
          <div>
            <div className="text-[10px] text-gray-400 uppercase font-bold">เลขประจำตัวผู้เสียภาษี</div>
            <p className="text-sm font-mono">{data.customerTaxId}</p>
          </div>
        )}
      </div>

      <div className="border dark:border-gray-700 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800 border-b dark:border-gray-700">
            <tr>
              <th className="px-4 py-3 text-left">รายละเอียด</th>
              <th className="px-4 py-3 text-right">จำนวน</th>
              <th className="px-4 py-3 text-right">ราคา/หน่วย</th>
              <th className="px-4 py-3 text-right">ยอดรวม</th>
            </tr>
          </thead>
          <tbody className="divide-y dark:divide-gray-700 font-mono">
            {data.items.map((it, i) => (
              <tr key={i}>
                <td className="px-4 py-3 font-sans font-bold">{it.oilType}</td>
                <td className="px-4 py-3 text-right">{numberFormatter.format(it.quantity)}</td>
                <td className="px-4 py-3 text-right">{it.pricePerLiter.toFixed(2)}</td>
                <td className="px-4 py-3 text-right font-bold">{currencyFormatter.format(it.totalAmount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted">มูลค่ารวมสุทธิ (ก่อนภาษี)</span>
          <span className="font-mono">{currencyFormatter.format(data.totalAmount)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted">ภาษีมูลค่าเพิ่ม (7%)</span>
          <span className="font-mono">{currencyFormatter.format(data.vatAmount)}</span>
        </div>
        <div className="flex justify-between p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
          <span className="font-bold text-emerald-600 dark:text-emerald-400">จำนวนเงินรวมทั้งสิ้น</span>
          <span className="text-xl font-black dark:text-white font-mono">{currencyFormatter.format(data.grandTotal)}</span>
        </div>
      </div>
    </div>
  );
}

function ORView({ data }: { data: OilReceipt }) {
  const numberFormatter = new Intl.NumberFormat("th-TH", {
    maximumFractionDigits: 0,
  });

  return (
    <div className="space-y-6 text-black dark:text-white">
      <div className="flex items-center gap-4 bg-orange-50 dark:bg-orange-900/10 p-4 rounded-2xl border border-orange-100 dark:border-orange-900/30">
        <AlertCircle className="w-6 h-6 text-orange-500" />
        <p className="text-sm font-medium text-orange-700 dark:text-orange-400">ข้อมูลการรับทรัพยากร (Oil Receipt) เพื่อยืนยันปริมาณน้ำมันลงสต็อก</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <div className="text-xs font-bold text-gray-400 uppercase">วันที่/เวลา รับน้ำมัน</div>
            <p className="font-bold">{new Date(data.receiveDate).toLocaleDateString("th-TH")} @ {data.receiveTime}</p>
          </div>
          <div>
            <div className="text-xs font-bold text-gray-400 uppercase">ผู้บันทึกระบบ</div>
            <p className="font-bold">{data.createdBy}</p>
          </div>
        </div>
        <div className="space-y-4 text-right">
          <div>
            <div className="text-xs font-bold text-gray-400 uppercase">อ้างอิงใบส่งของ</div>
            <p className="font-bold text-blue-500">{data.deliveryNoteNo}</p>
          </div>
        </div>
      </div>

      <div className="p-6 border dark:border-gray-700 rounded-2xl space-y-4 bg-white dark:bg-gray-800">
        <h4 className="text-xs font-bold text-gray-400 uppercase border-b dark:border-gray-700 pb-2">ผลการตรวจสอบคุณภาพ (Quality Test)</h4>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 rounded-xl bg-gray-50 dark:bg-gray-900/50 border dark:border-gray-700">
            <Thermometer className="w-4 h-4 text-red-400 mx-auto mb-1" />
            <span className="text-[10px] block text-gray-400 uppercase">อุณหภูมิ</span>
            <span className="font-bold">{data.qualityTest.temperature}°C</span>
          </div>
          <div className="text-center p-3 rounded-xl bg-gray-50 dark:bg-gray-900/50 border dark:border-gray-700">
            <ShieldCheck className="w-4 h-4 text-blue-400 mx-auto mb-1" />
            <span className="text-[10px] block text-gray-400 uppercase">API Gravity</span>
            <span className="font-bold">{data.qualityTest.apiGravity}</span>
          </div>
          <div className="text-center p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/30">
            <CheckCircle className="w-4 h-4 text-emerald-500 mx-auto mb-1" />
            <span className="text-[10px] block text-emerald-600 dark:text-emerald-400 uppercase">ผลการทดสอบ</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">{data.qualityTest.testResult}</span>
          </div>
        </div>
      </div>

      <div>
        <div className="text-xs font-bold text-gray-400 uppercase mb-3 block">รายการรับจริงแยกตามถัง</div>
        <div className="border dark:border-gray-700 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800 border-b dark:border-gray-700">
              <tr>
                <th className="px-4 py-3 text-left">ชนิดน้ำมัน</th>
                <th className="px-4 py-3 text-center">ถังที่</th>
                <th className="px-4 py-3 text-right">สั่ง (ลิตร)</th>
                <th className="px-4 py-3 text-right font-bold">รับจริง (ลิตร)</th>
                <th className="px-4 py-3 text-right">ผลต่าง</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-gray-700 font-mono">
              {data.items.map((it, i) => (
                <tr key={i}>
                  <td className="px-4 py-3 font-sans font-bold">{it.oilType}</td>
                  <td className="px-4 py-3 text-center font-bold">{it.tankNumber}</td>
                  <td className="px-4 py-3 text-right text-muted">{numberFormatter.format(it.quantityOrdered)}</td>
                  <td className="px-4 py-3 text-right font-bold text-emerald-500">{numberFormatter.format(it.quantityReceived)}</td>
                  <td className={`px-4 py-3 text-right ${it.differenceLiter < 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                    {it.differenceLiter > 0 ? '+' : ''}{numberFormatter.format(it.differenceLiter)}
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
