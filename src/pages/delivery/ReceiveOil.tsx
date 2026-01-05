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
  ShoppingCart,
  Eye,
  Download,
} from "lucide-react";
import { useGasStation } from "@/contexts/GasStationContext";
import { useBranch } from "@/contexts/BranchContext";
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
  const { purchaseOrders, driverJobs, branches, deliveryNotes, receipts: contextReceipts } = useGasStation();

  const baseReceipts = useMemo(() => generateBranchReceipts(purchaseOrders, driverJobs), [purchaseOrders, driverJobs]);
  const [receipts, setReceipts] = useState<BranchOilReceipt[]>([]);

  useEffect(() => {
    const overrides = loadBranchReceiptsFromStorage();
    // If NO overrides in storage, use sample data for the first time
    const finalOverrides = overrides.length > 0 ? overrides : SAMPLE_COMPLETED_RECEIPTS;
    setReceipts(buildReceipts(baseReceipts, finalOverrides));
  }, [baseReceipts]);

  const { selectedBranches } = useBranch();
  const selectedBranchIds = useMemo(() => selectedBranches.map(id => Number(id)), [selectedBranches]);

  const [searchTerm, setSearchTerm] = useState("");

  // Document Viewing State
  const [selectedDoc, setSelectedDoc] = useState<DeliveryNote | Receipt | BranchOilReceipt | PurchaseOrder | null>(null);
  const [activeReceipt, setActiveReceipt] = useState<BranchOilReceipt | null>(null);
  const [docType, setDocType] = useState<"dn" | "tax-invoice" | "receipt" | "po" | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Formatter for dates
  const dateFormatter = new Intl.DateTimeFormat("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // ฟังก์ชันสำหรับดาวน์โหลดเอกสารเป็น PDF (Unified)
  const handleDownload = (
    type: "dn" | "tax-invoice" | "receipt" | "po",
    data: DeliveryNote | Receipt | BranchOilReceipt | PurchaseOrder
  ) => {
    let htmlContent = "";
    let fileName = "";

    if (type === "dn") {
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
            .total-row { font-weight: bold; font-size: 16px; }
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
          <table class="table">
            <thead><tr><th>รายการ</th><th>จำนวน (ลิตร)</th></tr></thead>
            <tbody>
              ${dn.items.map((it: { oilType: string, quantity: number }) => `<tr><td>${it.oilType}</td><td>${numberFormatter.format(it.quantity)}</td></tr>`).join("")}
            </tbody>
          </table>
          <script>window.print();</script>
        </body>
        </html>
      `;
    } else if (type === "tax-invoice") {
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
          <div class="row"><div class="label">วันที่:</div><div class="value">${receipt.receiptDate}</div></div>
          <div class="row"><div class="label">ผู้ซื้อ/ผู้รับ:</div><div class="value">${receipt.customerName}</div></div>
          <table>
            <thead><tr><th>รายการ</th><th>จำนวนเงิน</th></tr></thead>
            <tbody>
              ${receipt.items.map((it: { oilType: string, quantity: number, totalAmount: number }) => `<tr><td>${it.oilType} (${numberFormatter.format(it.quantity)} ลิตร)</td><td>${currencyFormatter.format(it.totalAmount)}</td></tr>`).join("")}
            </tbody>
          </table>
          <div class="totals">
            <div>
              <div class="line"><span>มูลค่าก่อน VAT</span><span>${currencyFormatter.format(receipt.totalAmount)}</span></div>
              <div class="line"><span>VAT (7%)</span><span>${currencyFormatter.format(receipt.vatAmount)}</span></div>
              <div class="line strong"><span>รวมทั้งสิ้น</span><span>${currencyFormatter.format(receipt.grandTotal)}</span></div>
            </div>
          </div>
          <script>window.print();</script>
        </body>
        </html>
      `;
    } else if (type === "receipt") {
      const br = data as BranchOilReceipt;
      fileName = `ใบรับน้ำมัน_${br.receiptNo}.html`;
      htmlContent = `
        <!DOCTYPE html>
        <html lang="th">
        <head>
          <meta charset="UTF-8">
          <title>ใบรับน้ำมัน - ${br.receiptNo}</title>
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
            .sig { text-align: center; width: 200px; }
            .sig-line { border-top: 1px solid #000; margin-top: 50px; }
          </style>
        </head>
        <body>
          <div class="header"><h1>ใบรับน้ำมัน (Branch Oil Receipt)</h1><h2>เลขที่: ${br.receiptNo}</h2></div>
          <div class="info-section">
            <div class="info-row"><div class="info-label">เลขที่ใบสั่งซื้อ:</div><div>${br.purchaseOrderNo}</div></div>
            <div class="info-row"><div class="info-label">วันที่รับ:</div><div>${dateFormatter.format(new Date(br.receiveDate))} ${br.receiveTime}</div></div>
            <div class="info-row"><div class="info-label">ปั๊มที่รับ:</div><div>${br.branchName}</div></div>
            <div class="info-row"><div class="info-label">รถ/หาง:</div><div>${br.truckPlateNumber} / ${br.trailerPlateNumber}</div></div>
            <div class="info-row"><div class="info-label">คนขับ:</div><div>${br.driverName}</div></div>
          </div>
          <table class="table">
            <thead><tr><th>รายการ</th><th>สั่ง (ลิตร)</th><th>รับจริง (ลิตร)</th></tr></thead>
            <tbody>
      `;
    } else if (type === "po") {
      const po = data as PurchaseOrder;
      fileName = `ใบสั่งซื้อ_${po.orderNo}.html`;
      htmlContent = `
        <!DOCTYPE html>
        <html lang="th">
        <head>
          <meta charset="UTF-8">
          <title>ใบสั่งซื้อ - ${po.orderNo}</title>
          <style>
            @page { size: A4; margin: 20mm; }
            body { font-family: 'Sarabun', sans-serif; font-size: 14px; color: #000; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #000; padding-bottom: 10px; }
            .header h1 { font-size: 22px; margin: 0 0 10px 0; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
            .info-row { display: flex; margin-bottom: 5px; }
            .label { font-weight: bold; width: 120px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #000; padding: 10px; text-align: right; }
            th { background: #f0f0f0; text-align: center; font-weight: bold; }
            td:first-child { text-align: left; }
            .totals { margin-top: 20px; text-align: right; }
            .grand-total { font-size: 18px; font-weight: bold; margin-top: 10px; }
            .footer { margin-top: 50px; display: grid; grid-template-columns: 1fr 1fr; gap: 50px; }
            .sig { text-align: center; border-top: 1px solid #000; padding-top: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>ใบสั่งซื้อรวม (Combined Purchase Order)</h1>
            <div>เลขที่: ${po.orderNo} | อ้างอิง: ${po.supplierOrderNo}</div>
          </div>
          <div class="info-grid">
            <div>
              <div class="info-row"><div class="label">วันที่สั่ง:</div><div>${dateFormatter.format(new Date(po.orderDate))}</div></div>
              <div class="info-row"><div class="label">วันที่จัดส่ง:</div><div>${dateFormatter.format(new Date(po.deliveryDate))}</div></div>
              <div class="info-row"><div class="label">อ้างอิง PTT:</div><div>${po.approveNo || "-"}</div></div>
            </div>
            <div>
              <div class="info-row"><div class="label">สถานะ:</div><div>${po.status}</div></div>
              <div class="info-row"><div class="label">ผู้อนุมัติ:</div><div>${po.approvedBy}</div></div>
              <div class="info-row"><div class="label">Contract:</div><div>${po.contractNo || "-"}</div></div>
            </div>
          </div>
          <table>
            <thead><tr><th>ประเภทน้ำมัน</th><th>จำนวน (ลิตร)</th><th>ราคา/ลิตร</th><th>จำนวนเงิน</th></tr></thead>
            <tbody>
              ${po.items.map(it => `<tr><td>${it.oilType}</td><td>${numberFormatter.format(it.quantity)}</td><td>${it.pricePerLiter.toFixed(2)}</td><td>${currencyFormatter.format(it.totalAmount)}</td></tr>`).join("")}
            </tbody>
          </table>
          <div class="totals">
            <div class="grand-total">ยอดรวมทั้งสิ้น: ${currencyFormatter.format(po.totalAmount)}</div>
          </div>
          <div class="footer">
            <div class="sig">ผู้อนุมัติสั่งซื้อ</div>
            <div class="sig">เจ้าหน้าที่บริหาร</div>
          </div>
          <script>window.print();</script>
        </body>
        </html>
      `;
    }

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
    } else {
      alert("ไม่สามารถเปิดหน้าต่างพิมพ์ได้ (กรุณาอนุญาต pop-up)");
    }

    // Trigger download as HTML
    const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Helper to find related documents
  const getRelatedPO = (r: BranchOilReceipt) => purchaseOrders.find(o => o.orderNo === r.purchaseOrderNo);

  const getRelatedDN = (r: BranchOilReceipt) => {
    return deliveryNotes.find(dn => dn.purchaseOrderNo === r.purchaseOrderNo && dn.toBranchId === r.branchId);
  };

  const getRelatedTaxInvoice = (r: BranchOilReceipt) => {
    const dn = getRelatedDN(r);
    return contextReceipts.find((rec: Receipt) =>
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

      const matchBranch = selectedBranchIds.length === 0 || selectedBranchIds.includes(r.branchId);

      return matchSearch && matchBranch;
    }).sort((a, b) => new Date(b.receiveDate).getTime() - new Date(a.receiveDate).getTime());
  }, [receipts, searchTerm, selectedBranchIds]);

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



  return (
    <div className="space-y-6">
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center shrink-0">
              <History className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800 font-display">ประวัติการรับน้ำมัน (รายสาขา)</h1>
              <p className="text-sm text-gray-500 mt-1">ตรวจสอบประวัติการรับและลงสมุดของทุกลูกน้ำมันแต่ละปั๊ม</p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-white/50 dark:bg-gray-800/50 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm backdrop-blur-sm">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              สาขาที่กำลังดู: {selectedBranches.length === 0 ? "ทั้งหมด" : selectedBranches.map(id => branches.find(b => String(b.id) === id)?.name || id).join(", ")}
            </span>
          </div>
        </motion.div>

        {/* Info Alerts */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3"
        >
          <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-1">คำแนะนำการใช้งาน</p>
            <ul className="list-disc list-inside space-y-1 opacity-90">
              <li>แสดงเฉพาะรายการที่ได้รับน้ำมันเข้าคลังสาขาสำเร็จแล้ว</li>
              <li>สามารถตรวจสอบเอกสาร ใบส่งของ, ใบกำกับภาษี และใบรับของได้ที่ปุ่มในตาราง</li>
            </ul>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4"
          >
            <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
              <CheckCircle className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <div className="text-xs text-gray-500">รายการรับสำเร็จ</div>
              <div className="text-xl font-bold text-gray-800">{stats.received} รายการ</div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4"
          >
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
              <Droplet className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <div className="text-xs text-gray-500">ปริมาณรวม</div>
              <div className="text-xl font-bold text-gray-800">
                {numberFormatter.format(filteredReceipts.reduce((sum, r) => sum + r.items.reduce((s, i) => s + (i.quantityReceived || i.quantityOrdered), 0), 0))} ลิตร
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4"
          >
            <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
              <FileText className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <div className="text-xs text-gray-500">มูลค่ารวม</div>
              <div className="text-xl font-bold text-gray-800">{currencyFormatter.format(stats.totalAmount)}</div>
            </div>
          </motion.div>
        </div>

        {/* History Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-lg font-bold text-gray-800">รายการรับน้ำมัน</h2>
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="ค้นหา PO, ทะเบียนรถ, เลขที่รับ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-800"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider border-b border-gray-200">
                  <th className="px-6 py-4 font-medium">รายการ / สาขา</th>
                  <th className="px-6 py-4 font-medium">วันที่รับน้ำมัน</th>
                  <th className="px-6 py-4 font-medium">ข้อมูลรถบรรทุก</th>
                  <th className="px-6 py-4 font-medium">เอกสารอ้างอิง</th>
                  <th className="px-6 py-4 font-medium">ปริมาณรวม</th>
                  <th className="px-6 py-4 font-medium text-center">สถานะ</th>
                  <th className="px-6 py-4 font-medium text-right">ดูเอกสาร</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filteredReceipts.map((r) => (
                  <tr key={r.id} className="hover:bg-orange-50/10 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-800">{r.receiptNo}</div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Building2 className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-xs font-bold text-orange-600">{r.branchName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        {r.receiveDate}
                      </div>
                      {r.receivedAt && (
                        <div className="text-xs text-gray-500 flex items-center gap-1.5 mt-1">
                          <Clock className="w-3.5 h-3.5 text-gray-400" />
                          {new Date(r.receivedAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5 text-gray-400" />
                        {r.truckPlateNumber} {r.trailerPlateNumber !== "-" ? "/ " + r.trailerPlateNumber : ""}
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-1.5 mt-1">
                        <User className="w-3.5 h-3.5 text-gray-400" />
                        {r.driverName}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs text-gray-500 mb-1">PO: <span className="font-bold text-gray-700">{r.purchaseOrderNo}</span></div>
                      <div className="text-xs text-gray-500">TP: <span className="font-bold text-gray-700">{r.transportNo}</span></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-gray-800">
                        {numberFormatter.format(r.items.reduce((s: number, i) => s + (i.quantityReceived || i.quantityOrdered), 0))} ลิตร
                      </div>
                      <div className="text-xs text-gray-500">
                        {currencyFormatter.format(r.totalAmount)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-col items-center">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${r.status === "รับแล้ว" ? "bg-emerald-100 text-emerald-700 border-emerald-200" :
                          r.status === "รอรับ" ? "bg-yellow-100 text-yellow-700 border-yellow-200" :
                            "bg-gray-100 text-gray-700 border-gray-200"
                          }`}>
                          {r.status === "รับแล้ว" ? "รับเสร็จเพิ่มสต็อกแล้ว" : r.status}
                        </span>
                        {r.qualityTest?.testResult && (
                          <span className={`text-[10px] mt-1 font-bold ${r.qualityTest.testResult === 'ผ่าน' ? 'text-emerald-600' : 'text-red-600'}`}>
                            ผลทดสอบ: {r.qualityTest.testResult}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <div className="flex flex-col items-center gap-1">
                          <button
                            onClick={() => {
                              setSelectedDoc(getRelatedPO(r) || null);
                              setActiveReceipt(r);
                              setDocType('po');
                              setShowModal(true);
                            }}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-200"
                            title="ดูใบสั่งซื้อ"
                          >
                            <ShoppingCart className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="flex flex-col items-center gap-1">
                          <button
                            onClick={() => {
                              setSelectedDoc(getRelatedDN(r) || null);
                              setActiveReceipt(r);
                              setDocType('dn');
                              setShowModal(true);
                            }}
                            className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-transparent hover:border-indigo-200"
                            title="ดูใบส่งของ"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="flex flex-col items-center gap-1">
                          <button
                            onClick={() => {
                              const rec = getRelatedTaxInvoice(r);
                              setSelectedDoc(rec || null);
                              setActiveReceipt(r);
                              setDocType('tax-invoice');
                              setShowModal(true);
                            }}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors border border-transparent hover:border-emerald-200"
                            title="ดูใบภาษี"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="flex flex-col items-center gap-1">
                          <button
                            onClick={() => {
                              setSelectedDoc(r);
                              setActiveReceipt(r);
                              setDocType('receipt');
                              setShowModal(true);
                            }}
                            className="p-1.5 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors border border-transparent hover:border-orange-200"
                            title="ดูใบรับของ"
                          >
                            <PackageCheck className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredReceipts.length === 0 && (
              <div className="py-20 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500">ไม่พบรายการบันทึกรับน้ำมัน</p>
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
                    ) : docType === 'po' ? (
                      <><ShoppingCart className="w-5 h-5 text-blue-500" /> รายละเอียดใบสั่งซื้อ (Purchase Order)</>
                    ) : (
                      <><PackageCheck className="w-5 h-5 text-orange-500" /> รายละเอียดการรับของ (Goods Receipt)</>
                    )}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    เลขที่: {docType === 'dn' ? (selectedDoc as DeliveryNote).deliveryNoteNo :
                      docType === 'tax-invoice' ? (selectedDoc as Receipt).receiptNo :
                        docType === 'po' ? (selectedDoc as PurchaseOrder).orderNo :
                          (selectedDoc as BranchOilReceipt).receiptNo}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (selectedDoc && docType) {
                        handleDownload(docType, selectedDoc);
                      }
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-200 dark:shadow-none transition-all"
                  >
                    <History className="w-4 h-4 rotate-180" />
                    ดาวน์โหลด PDF
                  </button>
                  <button onClick={() => setShowModal(false)} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto">
                {/* Navigation between documents using activeReceipt */}
                {activeReceipt && (
                  <div className="no-print mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-700">
                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">เอกสารที่เกี่ยวข้อง</p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => {
                          setSelectedDoc(getRelatedPO(activeReceipt) || null);
                          setDocType('po');
                        }}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${docType === 'po' ? 'bg-blue-600 text-white shadow-md' : 'bg-white dark:bg-gray-800 text-blue-600 border border-blue-200 dark:border-blue-900/50 hover:bg-blue-50 dark:hover:bg-blue-900/30'}`}
                      >
                        <Eye className="w-3.5 h-3.5" /> ใบสั่งซื้อ
                      </button>
                      <button
                        onClick={() => {
                          setSelectedDoc(getRelatedDN(activeReceipt) || null);
                          setDocType('dn');
                        }}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${docType === 'dn' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white dark:bg-gray-800 text-indigo-600 border border-indigo-200 dark:border-indigo-900/50 hover:bg-indigo-50 dark:hover:bg-indigo-900/30'}`}
                      >
                        <Eye className="w-3.5 h-3.5" /> ใบส่งของ
                      </button>
                      <button
                        onClick={() => {
                          const rec = getRelatedTaxInvoice(activeReceipt);
                          setSelectedDoc(rec || null);
                          setDocType('tax-invoice');
                        }}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${docType === 'tax-invoice' ? 'bg-emerald-600 text-white shadow-md' : 'bg-white dark:bg-gray-800 text-emerald-600 border border-emerald-200 dark:border-emerald-900/50 hover:bg-emerald-50 dark:hover:bg-emerald-900/30'}`}
                      >
                        <Eye className="w-3.5 h-3.5" /> ใบภาษี
                      </button>
                      <button
                        onClick={() => {
                          setSelectedDoc(activeReceipt);
                          setDocType('receipt');
                        }}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${docType === 'receipt' ? 'bg-orange-600 text-white shadow-md' : 'bg-white dark:bg-gray-800 text-orange-600 border border-orange-200 dark:border-orange-900/50 hover:bg-orange-50 dark:hover:bg-orange-900/30'}`}
                      >
                        <Eye className="w-3.5 h-3.5" /> ใบรับของ
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <button
                        onClick={() => {
                          const po = getRelatedPO(activeReceipt);
                          if (po) handleDownload('po', po);
                        }}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold bg-white dark:bg-gray-800 text-gray-600 border border-gray-200 dark:border-gray-700 hover:bg-gray-50"
                      >
                        <Download className="w-3 h-3" /> รับไฟล์ PO
                      </button>
                      <button
                        onClick={() => {
                          const dn = getRelatedDN(activeReceipt);
                          if (dn) handleDownload('dn', dn);
                        }}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold bg-white dark:bg-gray-800 text-gray-600 border border-gray-200 dark:border-gray-700 hover:bg-gray-50"
                      >
                        <Download className="w-3 h-3" /> รับไฟล์ DN
                      </button>
                      <button
                        onClick={() => {
                          const rec = getRelatedTaxInvoice(activeReceipt);
                          if (rec) handleDownload('tax-invoice', rec);
                        }}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold bg-white dark:bg-gray-800 text-gray-600 border border-gray-200 dark:border-gray-700 hover:bg-gray-50"
                      >
                        <Download className="w-3 h-3" /> รับไฟล์ TAX
                      </button>
                    </div>
                  </div>
                )}
                {docType === 'po' && selectedDoc && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="p-3 bg-blue-50/50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-800/50">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> วันที่สั่ง</p>
                        <p className="font-bold text-gray-900 dark:text-white">{(selectedDoc as PurchaseOrder).orderDate}</p>
                      </div>
                      <div className="p-3 bg-blue-50/50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-800/50">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> วันที่จัดส่ง</p>
                        <p className="font-bold text-gray-900 dark:text-white">{(selectedDoc as PurchaseOrder).deliveryDate}</p>
                      </div>
                      <div className="p-3 bg-blue-50/50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-800/50">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1"><User className="w-3.5 h-3.5" /> ผู้อนุมัติ</p>
                        <p className="font-bold text-gray-900 dark:text-white">{(selectedDoc as PurchaseOrder).approvedBy}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <Droplet className="w-4 h-4 text-blue-500" /> รายการสั่งซื้อรวม
                      </h4>
                      <table className="w-full border-collapse border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">ชนิดน้ำมัน</th>
                            <th className="px-4 py-2 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">จำนวน (ลิตร)</th>
                            <th className="px-4 py-2 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">ราคา/ลิตร</th>
                            <th className="px-4 py-2 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">ยอดเงิน</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                          {(selectedDoc as PurchaseOrder).items.map((item, idx) => (
                            <tr key={idx}>
                              <td className="px-4 py-2 text-gray-900 dark:text-white">{item.oilType}</td>
                              <td className="px-4 py-2 text-right font-bold text-gray-900 dark:text-white">{numberFormatter.format(item.quantity)}</td>
                              <td className="px-4 py-2 text-right text-gray-500">{item.pricePerLiter.toFixed(2)}</td>
                              <td className="px-4 py-2 text-right font-bold text-blue-600">{currencyFormatter.format(item.totalAmount)}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-gray-50/50 dark:bg-gray-700/30">
                          <tr className="border-t-2 border-gray-200 dark:border-gray-600">
                            <td colSpan={3} className="px-4 py-3 text-right font-bold text-gray-900 dark:text-white uppercase tracking-tight">ยอดเงินรวมทั้งสิ้น</td>
                            <td className="px-4 py-3 text-right font-black text-blue-600 dark:text-blue-400">{currencyFormatter.format((selectedDoc as PurchaseOrder).totalAmount)}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                )}
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
                  onClick={() => {
                    setShowModal(false);
                    setActiveReceipt(null);
                  }}
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


