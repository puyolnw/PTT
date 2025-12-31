import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";
import {
  FileText,
  Search,
  Eye,
  Download,
  X,
  Building2,
  PackageCheck,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { useGasStation } from "@/contexts/GasStationContext";
import type { DeliveryNote, Receipt } from "@/types/gasStation";

const numberFormatter = new Intl.NumberFormat("th-TH", {
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("th-TH", {
  year: "numeric",
  month: "short",
  day: "numeric",
});

export default function InterBranchTransfer() {
  const { deliveryNotes, branches } = useGasStation();

  const [selectedBranchId, setSelectedBranchId] = useState<number>(1); // ปั๊มไฮโซเป็นค่าเริ่มต้น
  const [activeTab, setActiveTab] = useState<"outgoing" | "incoming">("outgoing");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState<string>("");
  const [filterDateTo, setFilterDateTo] = useState<string>("");
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedDeliveryNote, setSelectedDeliveryNote] = useState<DeliveryNote | null>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const [modalType, setModalType] = useState<"delivery" | "receipt">("delivery");

  // Helper function to check if date is in range
  const isDateInRange = (dateStr: string, from: string, to: string) => {
    if (!from && !to) return true;
    const date = new Date(dateStr);
    const fromDate = from ? new Date(from) : null;
    const toDate = to ? new Date(to) : null;
    
    if (fromDate && toDate) {
      fromDate.setHours(0, 0, 0, 0);
      toDate.setHours(23, 59, 59, 999);
      return date >= fromDate && date <= toDate;
    } else if (fromDate) {
      fromDate.setHours(0, 0, 0, 0);
      return date >= fromDate;
    } else if (toDate) {
      toDate.setHours(23, 59, 59, 999);
      return date <= toDate;
    }
    return true;
  };

  // กรองใบส่งของที่ปั๊มนี้เป็นผู้ส่ง (outgoing)
  const outgoingDeliveryNotes = useMemo(() => {
    return deliveryNotes.filter(
      (dn) =>
        dn.fromBranchId === selectedBranchId &&
        (dn.deliveryNoteNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
          dn.toBranchName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          dn.purchaseOrderNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          false)
    );
  }, [deliveryNotes, selectedBranchId, searchTerm]);

  // กรองใบส่งของที่ปั๊มนี้เป็นผู้รับ (incoming) - ใช้เป็นใบรับของ
  const incomingDeliveryNotes = useMemo(() => {
    return deliveryNotes.filter(
      (dn) =>
        dn.toBranchId === selectedBranchId &&
        isDateInRange(dn.deliveryDate, filterDateFrom, filterDateTo) &&
        (dn.deliveryNoteNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
          dn.fromBranchName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          dn.purchaseOrderNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          false)
    );
  }, [deliveryNotes, selectedBranchId, searchTerm, filterDateFrom, filterDateTo]);

  // กรองใบเสร็จรับเงินที่เกี่ยวข้อง (ถ้ามี) - ไม่ได้ใช้ตอนนี้
   
  // const _relatedReceipts = useMemo(() => {
  /*
    if (activeTab === "outgoing") {
      // ใบเสร็จที่ปั๊มนี้เป็นผู้ขาย (customer คือปั๊มอื่น)
      return receipts.filter(
        (r) =>
          r.customerName !== branches.find((b) => b.id === selectedBranchId)?.name &&
          (r.receiptNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.deliveryNoteNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            false)
      );
    } else {
      // ใบเสร็จที่ปั๊มนี้เป็นลูกค้า
      return receipts.filter(
        (r) =>
          r.customerName === branches.find((b) => b.id === selectedBranchId)?.name &&
          (r.receiptNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.deliveryNoteNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            false)
      );
    }
  }, [receipts, branches, selectedBranchId, searchTerm, activeTab]);
  */
  // const relatedReceipts = ... (commented out - not used)

  // const selectedBranch = branches.find((b) => b.id === selectedBranchId); // Not used

  // ฟังก์ชันสำหรับดาวน์โหลดใบส่งของเป็น PDF
  const handleDownloadDeliveryNotePDF = (deliveryNote: DeliveryNote & { transportNo?: string; trailerPlateNumber?: string; senderSignature?: string; senderSignedAt?: string; receiverSignature?: string; receiverSignedAt?: string }) => {
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="th">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>ใบส่งของ - ${deliveryNote.deliveryNoteNo}</title>
        <style>
          @page {
            size: A4;
            margin: 20mm;
          }
          body {
            font-family: 'Sarabun', 'TH Sarabun New', 'THSarabunNew', sans-serif;
            font-size: 14px;
            line-height: 1.6;
            color: #000;
            background: #fff;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #000;
            padding-bottom: 20px;
          }
          .header h1 {
            font-size: 24px;
            font-weight: bold;
            margin: 0;
            margin-bottom: 10px;
          }
          .header h2 {
            font-size: 20px;
            font-weight: bold;
            margin: 0;
          }
          .info-section {
            margin-bottom: 20px;
          }
          .info-row {
            display: flex;
            margin-bottom: 10px;
          }
          .info-label {
            width: 150px;
            font-weight: bold;
          }
          .info-value {
            flex: 1;
          }
          .two-columns {
            display: flex;
            gap: 40px;
            margin-bottom: 20px;
          }
          .column {
            flex: 1;
          }
          .table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
          }
          .table th,
          .table td {
            border: 1px solid #000;
            padding: 10px;
            text-align: left;
          }
          .table th {
            background-color: #f0f0f0;
            font-weight: bold;
            text-align: center;
          }
          .table td {
            text-align: right;
          }
          .table td:first-child {
            text-align: left;
          }
          .total-row {
            font-weight: bold;
            font-size: 16px;
          }
          .footer {
            margin-top: 40px;
            display: flex;
            justify-content: space-between;
          }
          .signature-box {
            width: 200px;
            text-align: center;
          }
          .signature-line {
            border-top: 1px solid #000;
            margin-top: 60px;
            padding-top: 5px;
          }
          @media print {
            body {
              margin: 0;
            }
            .no-print {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>ใบส่งของ (Delivery Note)</h1>
          <h2>เลขที่: ${deliveryNote.deliveryNoteNo}</h2>
        </div>

        <div class="info-section">
          <div class="info-row">
            <div class="info-label">วันที่ส่ง:</div>
            <div class="info-value">${dateFormatter.format(new Date(deliveryNote.deliveryDate))}</div>
          </div>
          ${deliveryNote.purchaseOrderNo ? `
          <div class="info-row">
            <div class="info-label">เลขที่ใบสั่งซื้อ:</div>
            <div class="info-value">${deliveryNote.purchaseOrderNo}</div>
          </div>
          ` : ''}
          ${(deliveryNote as any).transportNo ? `
          <div class="info-row">
            <div class="info-label">เลขที่ขนส่ง:</div>
            <div class="info-value">${(deliveryNote as any).transportNo}</div>
          </div>
          ` : ''}
        </div>

        <div class="two-columns">
          <div class="column">
            <div class="info-section">
              <div class="info-label" style="font-weight: bold; margin-bottom: 10px;">จาก (ผู้ส่ง):</div>
              <div class="info-value">${deliveryNote.fromBranchName}</div>
            </div>
          </div>
          <div class="column">
            <div class="info-section">
              <div class="info-label" style="font-weight: bold; margin-bottom: 10px;">ไป (ผู้รับ):</div>
              <div class="info-value">${deliveryNote.toBranchName}</div>
            </div>
          </div>
        </div>

        ${(deliveryNote.truckPlateNumber || deliveryNote.driverName) ? `
        <div class="info-section">
          <div class="info-label" style="font-weight: bold; margin-bottom: 10px;">ข้อมูลรถและคนขับ:</div>
          ${deliveryNote.truckPlateNumber ? `
          <div class="info-row">
            <div class="info-label">รถหัวลาก:</div>
            <div class="info-value">${deliveryNote.truckPlateNumber}</div>
          </div>
          ` : ''}
          ${(deliveryNote as any).trailerPlateNumber ? `
          <div class="info-row">
            <div class="info-label">หางบรรทุก:</div>
            <div class="info-value">${(deliveryNote as any).trailerPlateNumber}</div>
          </div>
          ` : ''}
          ${deliveryNote.driverName ? `
          <div class="info-row">
            <div class="info-label">คนขับ:</div>
            <div class="info-value">${deliveryNote.driverName}</div>
          </div>
          ` : ''}
        </div>
        ` : ''}

        <table class="table">
          <thead>
            <tr>
              <th style="width: 40%;">รายการ</th>
              <th style="width: 20%;">จำนวน (ลิตร)</th>
              <th style="width: 20%;">ราคาต่อลิตร (บาท)</th>
              <th style="width: 20%;">มูลค่ารวม (บาท)</th>
            </tr>
          </thead>
          <tbody>
            ${deliveryNote.items.map((item: any) => `
              <tr>
                <td>${item.oilType}</td>
                <td>${numberFormatter.format(item.quantity)}</td>
                <td>${numberFormatter.format(item.pricePerLiter)}</td>
                <td>${numberFormatter.format(item.totalAmount)}</td>
              </tr>
            `).join('')}
            <tr class="total-row">
              <td colspan="3" style="text-align: right;">รวมทั้งสิ้น:</td>
              <td>${numberFormatter.format(deliveryNote.totalAmount)}</td>
            </tr>
          </tbody>
        </table>

        <div class="footer">
          <div class="signature-box">
            <div class="signature-line">
              <div>ผู้ส่ง</div>
              ${(deliveryNote as any).senderSignature ? `<div style="margin-top: 5px;">${(deliveryNote as any).senderSignature}</div>` : ''}
            </div>
          </div>
          <div class="signature-box">
            <div class="signature-line">
              <div>ผู้รับ</div>
              ${deliveryNote.receiverName ? `<div style="margin-top: 5px;">${deliveryNote.receiverName}</div>` : ''}
              ${deliveryNote.signedAt ? `<div style="margin-top: 5px; font-size: 12px;">วันที่: ${dateFormatter.format(new Date(deliveryNote.signedAt))}</div>` : ''}
            </div>
          </div>
        </div>

        <div style="margin-top: 30px; text-align: center; font-size: 12px; color: #666;">
          <p>เอกสารนี้เป็นเอกสารอิเล็กทรอนิกส์ที่สร้างโดยระบบ</p>
          <p>สร้างเมื่อ: ${dateFormatter.format(new Date(deliveryNote.createdAt))} โดย ${deliveryNote.createdBy}</p>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ใบส่งของ_${deliveryNote.deliveryNoteNo}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.print();
      }, 250);
    }
  };

  // ฟังก์ชันสำหรับดาวน์โหลดใบเสร็จรับเงินเป็น PDF
  const handleDownloadReceiptPDF = (receipt: Receipt) => {
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="th">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${receipt.documentType} - ${receipt.receiptNo}</title>
        <style>
          @page {
            size: A4;
            margin: 20mm;
          }
          body {
            font-family: 'Sarabun', 'TH Sarabun New', 'THSarabunNew', sans-serif;
            font-size: 14px;
            line-height: 1.6;
            color: #000;
            background: #fff;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #000;
            padding-bottom: 20px;
          }
          .header h1 {
            font-size: 24px;
            font-weight: bold;
            margin: 0;
            margin-bottom: 10px;
          }
          .header h2 {
            font-size: 20px;
            font-weight: bold;
            margin: 0;
          }
          .info-section {
            margin-bottom: 20px;
          }
          .info-row {
            display: flex;
            margin-bottom: 10px;
          }
          .info-label {
            width: 150px;
            font-weight: bold;
          }
          .info-value {
            flex: 1;
          }
          .table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
          }
          .table th,
          .table td {
            border: 1px solid #000;
            padding: 10px;
            text-align: left;
          }
          .table th {
            background-color: #f0f0f0;
            font-weight: bold;
            text-align: center;
          }
          .table td {
            text-align: right;
          }
          .table td:first-child {
            text-align: left;
          }
          .total-row {
            font-weight: bold;
            font-size: 16px;
          }
          .footer {
            margin-top: 40px;
            text-align: center;
          }
          .signature-line {
            border-top: 1px solid #000;
            margin-top: 60px;
            padding-top: 5px;
            width: 200px;
            margin-left: auto;
            margin-right: auto;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${receipt.documentType}</h1>
          <h2>เลขที่: ${receipt.receiptNo}</h2>
        </div>

        <div class="info-section">
          <div class="info-row">
            <div class="info-label">วันที่ออก:</div>
            <div class="info-value">${dateFormatter.format(new Date(receipt.receiptDate))}</div>
          </div>
          ${receipt.deliveryNoteNo ? `
          <div class="info-row">
            <div class="info-label">เลขที่ใบส่งของ:</div>
            <div class="info-value">${receipt.deliveryNoteNo}</div>
          </div>
          ` : ''}
          <div class="info-row">
            <div class="info-label">ลูกค้า:</div>
            <div class="info-value">${receipt.customerName}</div>
          </div>
          <div class="info-row">
            <div class="info-label">ที่อยู่:</div>
            <div class="info-value">${receipt.customerAddress}</div>
          </div>
          ${receipt.customerTaxId ? `
          <div class="info-row">
            <div class="info-label">เลขประจำตัวผู้เสียภาษี:</div>
            <div class="info-value">${receipt.customerTaxId}</div>
          </div>
          ` : ''}
        </div>

        <table class="table">
          <thead>
            <tr>
              <th style="width: 40%;">รายการ</th>
              <th style="width: 20%;">จำนวน (ลิตร)</th>
              <th style="width: 20%;">ราคาต่อลิตร (บาท)</th>
              <th style="width: 20%;">มูลค่ารวม (บาท)</th>
            </tr>
          </thead>
          <tbody>
            ${receipt.items.map((item: any) => `
              <tr>
                <td>${item.oilType}</td>
                <td>${numberFormatter.format(item.quantity)}</td>
                <td>${numberFormatter.format(item.pricePerLiter)}</td>
                <td>${numberFormatter.format(item.totalAmount)}</td>
              </tr>
            `).join('')}
            <tr>
              <td colspan="3" style="text-align: right;">รวมก่อนภาษีมูลค่าเพิ่ม:</td>
              <td>${numberFormatter.format(receipt.totalAmount)}</td>
            </tr>
            <tr>
              <td colspan="3" style="text-align: right;">ภาษีมูลค่าเพิ่ม (7%):</td>
              <td>${numberFormatter.format(receipt.vatAmount)}</td>
            </tr>
            <tr class="total-row">
              <td colspan="3" style="text-align: right;">รวมทั้งสิ้น:</td>
              <td>${numberFormatter.format(receipt.totalAmount)}</td>
            </tr>
          </tbody>
        </table>

        <div class="footer">
          <div class="signature-line">
            <div>ผู้รับเงิน</div>
          </div>
        </div>

        <div style="margin-top: 30px; text-align: center; font-size: 12px; color: #666;">
          <p>เอกสารนี้เป็นเอกสารอิเล็กทรอนิกส์ที่สร้างโดยระบบ</p>
          <p>สร้างเมื่อ: ${dateFormatter.format(new Date(receipt.createdAt))} โดย ${receipt.createdBy}</p>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${receipt.documentType}_${receipt.receiptNo}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.print();
      }, 250);
    }
  };

  const handleViewDetail = (item: DeliveryNote | Receipt, type: "delivery" | "receipt") => {
    if (type === "delivery") {
      setSelectedDeliveryNote(item as DeliveryNote);
      setModalType("delivery");
    } else {
      setSelectedReceipt(item as Receipt);
      setModalType("receipt");
    }
    setShowDetailModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
      case "paid":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "sent":
      case "issued":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "draft":
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "delivered":
        return "ส่งแล้ว";
      case "sent":
        return "ส่งแล้ว";
      case "paid":
        return "ชำระแล้ว";
      case "issued":
        return "ออกแล้ว";
      case "draft":
        return "ร่าง";
      case "cancelled":
        return "ยกเลิก";
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">บันทึกข้อมูลการส่งน้ำมันระหว่างปั๊ม</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            ดูข้อมูลใบส่งของและใบรับของระหว่างปั๊มต่างๆ
          </p>
        </div>
      </div>

      {/* Branch Selector */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="flex items-center gap-4">
          <Building2 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">เลือกปั๊ม:</label>
          <select
            value={selectedBranchId}
            onChange={(e) => setSelectedBranchId(Number(e.target.value))}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {branches
              .sort((a, b) => {
                const branchOrder = ["ปั๊มไฮโซ", "ดินดำ", "หนองจิก", "ตักสิลา", "บายพาส"];
                return branchOrder.indexOf(a.name) - branchOrder.indexOf(b.name);
              })
              .map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <div className="flex">
            <button
              onClick={() => setActiveTab("outgoing")}
              className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                activeTab === "outgoing"
                  ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <ArrowRight className="w-5 h-5" />
                <span>ใบส่งของ ({outgoingDeliveryNotes.length})</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab("incoming")}
              className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                activeTab === "incoming"
                  ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <ArrowLeft className="w-5 h-5" />
                <span>ใบรับของ ({incomingDeliveryNotes.length})</span>
              </div>
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="ค้นหาเลขที่, ปั๊มปลายทาง, เลขที่ใบสั่งซื้อ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={filterDateFrom}
                onChange={(e) => setFilterDateFrom(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                title="วันที่เริ่มต้น"
              />
              <span className="text-gray-500 dark:text-gray-400 font-medium whitespace-nowrap">ถึง</span>
              <input
                type="date"
                value={filterDateTo}
                onChange={(e) => setFilterDateTo(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                title="วันที่สิ้นสุด"
              />
            </div>
            {(filterDateFrom || filterDateTo || searchTerm) && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilterDateFrom("");
                  setFilterDateTo("");
                }}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors border border-gray-300 dark:border-gray-600 whitespace-nowrap"
              >
                ล้างตัวกรอง
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  เลขที่
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  วันที่
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {activeTab === "outgoing" ? "ส่งไปยัง" : "รับจาก"}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  รายการ
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  มูลค่ารวม
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  สถานะ
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  การดำเนินการ
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {activeTab === "outgoing" ? (
                outgoingDeliveryNotes.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                      ไม่พบข้อมูลใบส่งของ
                    </td>
                  </tr>
                ) : (
                  outgoingDeliveryNotes.map((dn) => (
                    <tr key={dn.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{dn.deliveryNoteNo}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {dateFormatter.format(new Date(dn.deliveryDate))}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-900 dark:text-white">{dn.toBranchName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {dn.items.length} รายการ
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white text-right">
                        {numberFormatter.format(dn.totalAmount)} บาท
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(dn.status)}`}>
                          {getStatusText(dn.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleViewDetail(dn, "delivery")}
                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            title="ดูรายละเอียด"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDownloadDeliveryNotePDF(dn as any)}
                            className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                            title="ดาวน์โหลด PDF"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )
              ) : (
                incomingDeliveryNotes.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                      ไม่พบข้อมูลใบรับของ
                    </td>
                  </tr>
                ) : (
                  incomingDeliveryNotes.map((dn) => (
                    <tr key={dn.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <PackageCheck className="w-4 h-4 text-green-600 dark:text-green-400" />
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{dn.deliveryNoteNo}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {dateFormatter.format(new Date(dn.deliveryDate))}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-900 dark:text-white">{dn.fromBranchName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {dn.items.length} รายการ
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white text-right">
                        {numberFormatter.format(dn.totalAmount)} บาท
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(dn.status)}`}>
                          {getStatusText(dn.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleViewDetail(dn, "delivery")}
                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            title="ดูรายละเอียด"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDownloadDeliveryNotePDF(dn as any)}
                            className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                            title="ดาวน์โหลด PDF"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {showDetailModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowDetailModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              {modalType === "delivery" && selectedDeliveryNote && (
                <>
                  <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between z-10">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">รายละเอียดใบส่งของ</h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        เลขที่: {selectedDeliveryNote.deliveryNoteNo}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDownloadDeliveryNotePDF(selectedDeliveryNote as any)}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        ดาวน์โหลด PDF
                      </button>
                      <button
                        onClick={() => setShowDetailModal(false)}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="p-6 space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">วันที่ส่ง</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {dateFormatter.format(new Date(selectedDeliveryNote.deliveryDate))}
                        </p>
                      </div>
                      {selectedDeliveryNote.purchaseOrderNo && (
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">เลขที่ใบสั่งซื้อ</p>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {selectedDeliveryNote.purchaseOrderNo}
                          </p>
                        </div>
                      )}
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">จาก (ผู้ส่ง)</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {selectedDeliveryNote.fromBranchName}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">ไป (ผู้รับ)</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {selectedDeliveryNote.toBranchName}
                        </p>
                      </div>
                    </div>

                    {/* Truck & Driver Info */}
                    {(selectedDeliveryNote.truckPlateNumber || selectedDeliveryNote.driverName) && (
                      <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">ข้อมูลรถและคนขับ</p>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          {selectedDeliveryNote.truckPlateNumber && (
                            <div>
                              <span className="text-gray-600 dark:text-gray-400">รถหัวลาก:</span>
                              <span className="font-semibold text-gray-900 dark:text-white ml-2">
                                {selectedDeliveryNote.truckPlateNumber}
                              </span>
                            </div>
                          )}
                          {selectedDeliveryNote.driverName && (
                            <div>
                              <span className="text-gray-600 dark:text-gray-400">คนขับ:</span>
                              <span className="font-semibold text-gray-900 dark:text-white ml-2">
                                {selectedDeliveryNote.driverName}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Items */}
                    <div>
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">รายการน้ำมัน</p>
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="bg-gray-50 dark:bg-gray-700/50">
                              <th className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                                รายการ
                              </th>
                              <th className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-right text-sm font-medium text-gray-700 dark:text-gray-300">
                                จำนวน (ลิตร)
                              </th>
                              <th className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-right text-sm font-medium text-gray-700 dark:text-gray-300">
                                ราคาต่อลิตร
                              </th>
                              <th className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-right text-sm font-medium text-gray-700 dark:text-gray-300">
                                มูลค่ารวม
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedDeliveryNote.items.map((item, idx) => (
                              <tr key={idx}>
                                <td className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-sm text-gray-900 dark:text-white">
                                  {item.oilType}
                                </td>
                                <td className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-sm text-gray-900 dark:text-white text-right">
                                  {numberFormatter.format(item.quantity)}
                                </td>
                                <td className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-sm text-gray-900 dark:text-white text-right">
                                  {numberFormatter.format(item.pricePerLiter)}
                                </td>
                                <td className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-900 dark:text-white text-right">
                                  {numberFormatter.format(item.totalAmount)}
                                </td>
                              </tr>
                            ))}
                            <tr className="bg-gray-50 dark:bg-gray-700/30">
                              <td
                                colSpan={3}
                                className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-sm font-semibold text-gray-900 dark:text-white text-right"
                              >
                                รวมทั้งสิ้น:
                              </td>
                              <td className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-sm font-semibold text-gray-900 dark:text-white text-right">
                                {numberFormatter.format(selectedDeliveryNote.totalAmount)} บาท
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Status */}
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">สถานะ</p>
                      <span className={`mt-1 inline-block px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(selectedDeliveryNote.status)}`}>
                        {getStatusText(selectedDeliveryNote.status)}
                      </span>
                    </div>
                  </div>
                </>
              )}

              {modalType === "receipt" && selectedReceipt && (
                <>
                  <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between z-10">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">รายละเอียด{selectedReceipt.documentType}</h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        เลขที่: {selectedReceipt.receiptNo}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDownloadReceiptPDF(selectedReceipt)}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        ดาวน์โหลด PDF
                      </button>
                      <button
                        onClick={() => setShowDetailModal(false)}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="p-6 space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">วันที่ออก</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {dateFormatter.format(new Date(selectedReceipt.receiptDate))}
                        </p>
                      </div>
                      {selectedReceipt.deliveryNoteNo && (
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">เลขที่ใบส่งของ</p>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {selectedReceipt.deliveryNoteNo}
                          </p>
                        </div>
                      )}
                      <div className="col-span-2">
                        <p className="text-sm text-gray-600 dark:text-gray-400">ลูกค้า</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {selectedReceipt.customerName}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {selectedReceipt.customerAddress}
                        </p>
                      </div>
                    </div>

                    {/* Items */}
                    <div>
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">รายการน้ำมัน</p>
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="bg-gray-50 dark:bg-gray-700/50">
                              <th className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                                รายการ
                              </th>
                              <th className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-right text-sm font-medium text-gray-700 dark:text-gray-300">
                                จำนวน (ลิตร)
                              </th>
                              <th className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-right text-sm font-medium text-gray-700 dark:text-gray-300">
                                ราคาต่อลิตร
                              </th>
                              <th className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-right text-sm font-medium text-gray-700 dark:text-gray-300">
                                มูลค่ารวม
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedReceipt.items.map((item, idx) => (
                              <tr key={idx}>
                                <td className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-sm text-gray-900 dark:text-white">
                                  {item.oilType}
                                </td>
                                <td className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-sm text-gray-900 dark:text-white text-right">
                                  {numberFormatter.format(item.quantity)}
                                </td>
                                <td className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-sm text-gray-900 dark:text-white text-right">
                                  {numberFormatter.format(item.pricePerLiter)}
                                </td>
                                <td className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-900 dark:text-white text-right">
                                  {numberFormatter.format(item.totalAmount)}
                                </td>
                              </tr>
                            ))}
                            <tr>
                              <td
                                colSpan={3}
                                className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-sm text-gray-900 dark:text-white text-right"
                              >
                                รวมก่อนภาษีมูลค่าเพิ่ม:
                              </td>
                              <td className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-900 dark:text-white text-right">
                                {numberFormatter.format(selectedReceipt.totalAmount)} บาท
                              </td>
                            </tr>
                            <tr>
                              <td
                                colSpan={3}
                                className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-sm text-gray-900 dark:text-white text-right"
                              >
                                ภาษีมูลค่าเพิ่ม (7%):
                              </td>
                              <td className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-900 dark:text-white text-right">
                                {numberFormatter.format(selectedReceipt.vatAmount)} บาท
                              </td>
                            </tr>
                            <tr className="bg-gray-50 dark:bg-gray-700/30">
                              <td
                                colSpan={3}
                                className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-sm font-semibold text-gray-900 dark:text-white text-right"
                              >
                                รวมทั้งสิ้น:
                              </td>
                              <td className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-sm font-semibold text-gray-900 dark:text-white text-right">
                                {numberFormatter.format(selectedReceipt.totalAmount)} บาท
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Status */}
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">สถานะ</p>
                      <span className={`mt-1 inline-block px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(selectedReceipt.status)}`}>
                        {getStatusText(selectedReceipt.status)}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
