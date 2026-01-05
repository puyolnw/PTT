import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";
import {
  PackageCheck,
  Search,
  Eye,
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
  Download,
} from "lucide-react";
import { mockApprovedOrders, mockPTTQuotations } from "../../data/gasStationOrders";
import { useGasStation } from "@/contexts/GasStationContext";
import type { QualityTest, DeliveryNote, PurchaseOrder } from "@/types/gasStation";
import type { ApprovedOrder } from "../../data/gasStationOrders";

const numberFormatter = new Intl.NumberFormat("th-TH", {
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("th-TH", {
  year: "numeric",
  month: "short",
  day: "numeric",
});

// Interface สำหรับ Branch Oil Receipt (รับน้ำมันของปั๊มย่อย)
interface BranchOilReceipt {
  id: string;
  receiptNo: string; // เลขที่ใบรับน้ำมัน
  purchaseOrderNo: string; // เลขที่ใบสั่งซื้อ
  transportNo: string; // เลขที่ขนส่ง
  branchId: number; // ID ปั๊มย่อย
  branchName: string; // ชื่อปั๊มย่อย
  receiveDate: string;
  receiveTime: string;
  // ข้อมูลรถและคนขับ
  truckPlateNumber: string;
  trailerPlateNumber: string;
  driverName: string;
  // รายการน้ำมันที่รับ
  items: Array<{
    oilType: string;
    quantityOrdered: number; // จำนวนที่สั่ง
    quantityReceived: number; // จำนวนที่รับจริง
    pricePerLiter: number;
    totalAmount: number;
  }>;
  totalAmount: number;
  // สถานะ
  status: "รอรับ" | "รับแล้ว" | "ปฏิเสธ" | "ยกเลิก";
  receivedBy: string;
  receivedByName: string;
  receivedAt?: string;
  rejectReason?: string; // เหตุผลในการปฏิเสธ
  rejectedBy?: string; // ผู้ปฏิเสธ
  rejectedAt?: string; // วันที่ปฏิเสธ
  notes?: string;
  createdAt: string;
  createdBy: string;
  qualityTest?: QualityTest;
}
// Interface for Truck Order (simplified for this view)
interface TruckOrder {
  id: string;
  purchaseOrderNo: string;
  transportNo: string;
  truckPlateNumber: string;
  trailerPlateNumber: string;
  driver: string;
  status: string;
  receivedBy?: string;
  receivedByName?: string;
  receivedAt?: string;
}

// Helper function - ดึงข้อมูล Branch Receipts จาก Purchase Orders และ Truck Orders
const generateBranchReceipts = (purchaseOrders: (PurchaseOrder | ApprovedOrder)[], truckOrders: TruckOrder[]): BranchOilReceipt[] => {
  const receipts: BranchOilReceipt[] = [];

  // ดึงข้อมูลจาก Purchase Orders และเชื่อมกับ Truck Orders
  purchaseOrders.forEach((po) => {
    // หา Truck Order ที่เชื่อมกับ Purchase Order นี้ (ผ่าน purchaseOrderNo)
    const truckOrder = truckOrders.find((to) => to.purchaseOrderNo === po.orderNo);
    const transportNo = truckOrder?.transportNo || `TP-${po.orderDate.replace(/-/g, '')}-001`;

    po.branches.forEach((branch) => {
      // สร้าง Branch Receipt สำหรับแต่ละปั๊ม
      const receipt: BranchOilReceipt = {
        id: `BR-${po.orderNo}-${branch.branchId}`,
        receiptNo: `BR-${po.orderNo}-${branch.branchId}`,
        purchaseOrderNo: po.orderNo,
        transportNo: transportNo,
        branchId: branch.branchId,
        branchName: branch.branchName,
        receiveDate: po.deliveryDate,
        receiveTime: "09:00",
        truckPlateNumber: truckOrder?.truckPlateNumber || ('truckPlateNumber' in po ? po.truckPlateNumber : undefined) || "-",
        trailerPlateNumber: truckOrder?.trailerPlateNumber || ('trailerPlateNumber' in po ? po.trailerPlateNumber : undefined) || "-",
        driverName: truckOrder?.driver || ('driverName' in po ? po.driverName : undefined) || "-",
        items: branch.items.map((item) => ({
          oilType: item.oilType,
          quantityOrdered: item.quantity,
          quantityReceived: 0, // ยังไม่รับ
          pricePerLiter: item.pricePerLiter,
          totalAmount: item.totalAmount,
        })),
        totalAmount: branch.totalAmount,
        status: branch.deliveryStatus === "ส่งสำเร็จ" ? "รับแล้ว" : "รอรับ",
        receivedBy: "",
        receivedByName: "",
        receivedAt: branch.deliveryStatus === "ส่งสำเร็จ" ? new Date().toISOString() : undefined,
        createdAt: po.approvedAt,
        createdBy: po.approvedBy,
      };

      receipts.push(receipt);
    });
  });

  return receipts;
};

export default function BranchOilReceipt() {
  const { purchaseOrders, deliveryNotes } = useGasStation();

  // ดึงข้อมูล Truck Orders โดยการสร้างจาก mockApprovedOrders และ mockPTTQuotations
  // ในระบบจริงจะดึงจาก context หรือ API ที่มี Truck Orders จริง
  const mockTruckOrders = useMemo(() => {
    return mockApprovedOrders.map((po) => {
      // หา Quotation ที่เชื่อมกับ Purchase Order
      const quotation = mockPTTQuotations.find((q) => q.purchaseOrderNo === po.orderNo);

      // สร้าง transport number จาก quotation หรือ order date
      const transportNo = quotation?.pttQuotationNo
        ? `TP-${po.orderDate.replace(/-/g, '')}-${quotation.pttQuotationNo.slice(-3)}`
        : `TP-${po.orderDate.replace(/-/g, '')}-${po.orderNo.slice(-3)}`;

      return {
        id: po.orderNo,
        purchaseOrderNo: po.orderNo,
        transportNo: transportNo,
        truckPlateNumber: po.truckPlateNumber || quotation?.truckPlateNumber || "-",
        trailerPlateNumber: po.trailerPlateNumber || quotation?.trailerPlateNumber || "-",
        driver: po.driverName || quotation?.driverName || "-",
        status: po.status === "ขนส่งสำเร็จ" ? "completed" : po.status === "กำลังขนส่ง" ? "picking-up" : "ready-to-pickup",
      };
    });
  }, []);

  // Generate branch receipts from purchase orders and truck orders
  const branchReceipts = useMemo(() => {
    const allPurchaseOrders = purchaseOrders.length > 0 ? purchaseOrders : mockApprovedOrders;
    return generateBranchReceipts(allPurchaseOrders, mockTruckOrders);
  }, [purchaseOrders, mockTruckOrders]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "รอรับ" | "รับแล้ว" | "ปฏิเสธ" | "ยกเลิก">("all");
  const [filterBranch, setFilterBranch] = useState<number | "all">("all");
  const [filterDateFrom, setFilterDateFrom] = useState<string>("");
  const [filterDateTo, setFilterDateTo] = useState<string>("");
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showDeliveryNoteModal, setShowDeliveryNoteModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<BranchOilReceipt | null>(null);
  const [selectedDeliveryNote, setSelectedDeliveryNote] = useState<DeliveryNote | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  // Form state for receiving oil
  const [receiveFormData, setReceiveFormData] = useState<{
    receiveDate: string;
    receiveTime: string;
    receivedByName: string;
    items: Array<{
      oilType: string;
      quantityOrdered: number;
      quantityReceived: number;
    }>;
    qualityTest: QualityTest;
    notes: string;
  }>({
    receiveDate: new Date().toISOString().split("T")[0],
    receiveTime: new Date().toTimeString().slice(0, 5),
    receivedByName: "",
    items: [],
    qualityTest: {
      apiGravity: 0,
      waterContent: 0,
      temperature: 0,
      color: "",
      testResult: "ผ่าน",
      testedBy: "",
      testDateTime: new Date().toISOString(),
      notes: "",
    },
    notes: "",
  });

  // Get unique branches from receipts
  const availableBranches = useMemo(() => {
    const branchMap = new Map<number, string>();
    branchReceipts.forEach((r) => {
      if (!branchMap.has(r.branchId)) {
        branchMap.set(r.branchId, r.branchName);
      }
    });
    return Array.from(branchMap.entries()).map(([id, name]) => ({ id, name }));
  }, [branchReceipts]);

  // Helper function to check if date is in range
  const isDateInRange = (dateStr: string, from: string, to: string) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    if (from && !to) return d >= new Date(from);
    if (!from && to) return d <= new Date(to);
    if (from && to) return d >= new Date(from) && d <= new Date(to);
    return true;
  };

  // Filter receipts
  const filteredReceipts = useMemo(() => {
    return branchReceipts.filter((r) => {
      const matchesSearch =
        r.receiptNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.purchaseOrderNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.transportNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.branchName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.truckPlateNumber.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === "all" || r.status === filterStatus;
      const matchesBranch = filterBranch === "all" || r.branchId === filterBranch;
      const matchesDate = isDateInRange(r.receiveDate, filterDateFrom, filterDateTo);
      return matchesSearch && matchesStatus && matchesBranch && matchesDate;
    });
  }, [branchReceipts, searchTerm, filterStatus, filterBranch, filterDateFrom, filterDateTo]);

  // Statistics
  const stats = useMemo(() => {
    const total = branchReceipts.length;
    const pending = branchReceipts.filter((r) => r.status === "รอรับ").length;
    const received = branchReceipts.filter((r) => r.status === "รับแล้ว").length;
    const rejected = branchReceipts.filter((r) => r.status === "ปฏิเสธ").length;
    const cancelled = branchReceipts.filter((r) => r.status === "ยกเลิก").length;
    return { total, pending, received, rejected, cancelled };
  }, [branchReceipts]);

  const handleViewDetail = (receipt: BranchOilReceipt) => {
    setSelectedReceipt(receipt);
    setShowDetailModal(true);
  };

  const handleReceive = (receipt: BranchOilReceipt) => {
    setSelectedReceipt(receipt);
    setReceiveFormData({
      receiveDate: new Date().toISOString().split("T")[0],
      receiveTime: new Date().toTimeString().slice(0, 5),
      receivedByName: "",
      items: receipt.items.map((item) => ({
        oilType: item.oilType,
        quantityOrdered: item.quantityOrdered,
        quantityReceived: item.quantityOrdered, // Default to ordered quantity
      })),
      qualityTest: {
        apiGravity: 0,
        waterContent: 0,
        temperature: 0,
        color: "",
        testResult: "ผ่าน" as QualityTest["testResult"],
        testedBy: "",
        testDateTime: new Date().toISOString(),
        notes: "",
      },
      notes: "",
    });
    setShowReceiveModal(true);
  };

  const handleSaveReceive = () => {
    if (!selectedReceipt || !receiveFormData.receivedByName) {
      alert("กรุณากรอกชื่อผู้รับ");
      return;
    }

    // Validate quality test if testResult is "ไม่ผ่าน"
    if (receiveFormData.qualityTest.testResult === "ไม่ผ่าน" && !receiveFormData.qualityTest.notes) {
      alert("กรุณาระบุหมายเหตุเมื่อผลการทดสอบไม่ผ่าน");
      return;
    }

    // หา Delivery Note ที่เกี่ยวข้อง
    const relatedDeliveryNote = deliveryNotes.find(
      (dn) => dn.purchaseOrderNo === selectedReceipt.purchaseOrderNo && dn.toBranchId === selectedReceipt.branchId
    );

    // In real app, this would call API
    console.log("Receiving oil:", {
      receiptId: selectedReceipt.id,
      ...receiveFormData,
      deliveryNoteNo: relatedDeliveryNote?.deliveryNoteNo,
      qualityTest: receiveFormData.qualityTest,
    });

    alert(`รับน้ำมันสำเร็จ!\n\nใบสั่งซื้อ: ${selectedReceipt.purchaseOrderNo}\nเลขขนส่ง: ${selectedReceipt.transportNo}\nปั๊ม: ${selectedReceipt.branchName}\nผลการทดสอบ: ${receiveFormData.qualityTest.testResult}`);
    setShowReceiveModal(false);
    setSelectedReceipt(null);
  };

  const handleReject = (receipt: BranchOilReceipt) => {
    setSelectedReceipt(receipt);
    setRejectReason("");
    setShowRejectModal(true);
  };

  const handleSaveReject = () => {
    if (!selectedReceipt || !rejectReason.trim()) {
      alert("กรุณาระบุเหตุผลในการปฏิเสธ");
      return;
    }

    // In real app, this would call API
    console.log("Rejecting receipt:", {
      receiptId: selectedReceipt.id,
      rejectReason: rejectReason,
      rejectedBy: "ผู้ใช้", // In real app, get from auth context
      rejectedAt: new Date().toISOString(),
    });

    alert(`ปฏิเสธการรับน้ำมันสำเร็จ!\n\nใบสั่งซื้อ: ${selectedReceipt.purchaseOrderNo}\nเลขขนส่ง: ${selectedReceipt.transportNo}\nปั๊ม: ${selectedReceipt.branchName}`);
    setShowRejectModal(false);
    setSelectedReceipt(null);
    setRejectReason("");
  };

  const getStatusColor = (status: BranchOilReceipt["status"]) => {
    switch (status) {
      case "รอรับ":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "รับแล้ว":
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
      case "ปฏิเสธ":
        return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
      case "ยกเลิก":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  const getStatusText = (status: BranchOilReceipt["status"]) => {
    switch (status) {
      case "รอรับ":
        return "รอรับ";
      case "รับแล้ว":
        return "รับแล้ว";
      case "ปฏิเสธ":
        return "ปฏิเสธ";
      case "ยกเลิก":
        return "ยกเลิก";
      default:
        return status;
    }
  };

  // ฟังก์ชันสำหรับดาวน์โหลดใบส่งของเป็น PDF
  const handleDownloadDeliveryNotePDF = (deliveryNote: DeliveryNote & { transportNo?: string; trailerPlateNumber?: string; senderSignature?: string; senderSignedAt?: string; receiverSignature?: string; receiverSignedAt?: string }) => {
    // สร้าง HTML สำหรับใบส่งของ
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
          ${deliveryNote.quotationNo ? `
          <div class="info-row">
            <div class="info-label">เลขที่ใบเสนอราคา:</div>
            <div class="info-value">${deliveryNote.quotationNo}</div>
          </div>
          ` : ''}
          ${deliveryNote.transportNo ? `
          <div class="info-row">
            <div class="info-label">เลขที่ขนส่ง:</div>
            <div class="info-value">${deliveryNote.transportNo}</div>
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
          ${deliveryNote.trailerPlateNumber ? `
          <div class="info-row">
            <div class="info-label">หางบรรทุก:</div>
            <div class="info-value">${deliveryNote.trailerPlateNumber}</div>
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
            ${deliveryNote.items.map((item) => `
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
              ${deliveryNote.senderSignature ? `<div style="margin-top: 5px;">${deliveryNote.senderSignature}</div>` : ''}
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

    // สร้าง Blob และดาวน์โหลด
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ใบส่งของ_${deliveryNote.deliveryNoteNo}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // เปิดหน้าต่างใหม่สำหรับพิมพ์/บันทึกเป็น PDF
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      // รอให้โหลดเสร็จแล้วแสดง dialog พิมพ์
      setTimeout(() => {
        printWindow.print();
      }, 250);
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <PackageCheck className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            รับน้ำมัน
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            รับน้ำมันจากตามใบสั่งซื้อและเลขขนส่ง
          </p>
        </div>
      </motion.div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">ทั้งหมด</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.total}</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">รอรับ</p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">{stats.pending}</p>
            </div>
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">รับแล้ว</p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{stats.received}</p>
            </div>
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
              <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">ยกเลิก</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">{stats.cancelled}</p>
            </div>
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <X className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-4"
      >
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              id="receipt-search"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ค้นหาเลขที่ใบสั่งซื้อ, เลขขนส่ง, ปั๊ม..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              aria-label="ค้นหาใบรับน้ำมัน"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <input
                id="receipt-date-from"
                type="date"
                value={filterDateFrom}
                onChange={(e) => setFilterDateFrom(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                title="วันที่เริ่มต้น"
                aria-label="วันที่เริ่มต้น"
              />
              <span className="text-gray-500 dark:text-gray-400 font-medium whitespace-nowrap">ถึง</span>
              <input
                id="receipt-date-to"
                type="date"
                value={filterDateTo}
                onChange={(e) => setFilterDateTo(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                title="วันที่สิ้นสุด"
                aria-label="วันที่สิ้นสุด"
              />
            </div>
            <select
              id="receipt-status-filter"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as BranchOilReceipt["status"] | "all")}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              aria-label="กรองข้อมูลตามสถานะ"
            >
              <option value="all">สถานะทั้งหมด</option>
              <option value="รอรับ">รอรับ</option>
              <option value="รับแล้ว">รับแล้ว</option>
              <option value="ปฏิเสธ">ปฏิเสธ</option>
              <option value="ยกเลิก">ยกเลิก</option>
            </select>
            <select
              id="receipt-branch-filter"
              value={filterBranch}
              onChange={(e) => setFilterBranch(e.target.value === "all" ? "all" : Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              aria-label="กรองข้อมูลตามปั๊ม"
            >
              <option value="all">ปั๊มทั้งหมด</option>
              {availableBranches
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
            {(filterDateFrom || filterDateTo || searchTerm || filterStatus !== "all" || filterBranch !== "all") && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilterStatus("all");
                  setFilterBranch("all");
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
      </motion.div>

      {/* Receipts Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-800">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    เลขที่ใบสั่งซื้อ
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4" />
                    เลขขนส่ง
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    ปั๊มย่อย
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    วันที่รับ
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4" />
                    รถ / หาง
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    คนขับ
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <Droplet className="w-4 h-4" />
                    รายการน้ำมัน
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">สถานะ</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">การดำเนินการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
              {filteredReceipts.map((receipt) => (
                <tr
                  key={receipt.id}
                  className="hover:bg-blue-50/50 dark:hover:bg-gray-700/70 cursor-pointer transition-all duration-200 group"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-md group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
                        <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">{receipt.purchaseOrderNo}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                      {receipt.transportNo}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{receipt.branchName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900 dark:text-white">
                      {dateFormatter.format(new Date(receipt.receiveDate))}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{receipt.truckPlateNumber}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                        <span className="ml-5">{receipt.trailerPlateNumber}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="p-1 bg-gray-100 dark:bg-gray-700 rounded-full">
                        <User className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
                      </div>
                      <span className="text-sm text-gray-900 dark:text-white">{receipt.driverName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">
                      {receipt.items.map((item, idx) => (
                        <div key={idx} className="mb-1">
                          <span className="font-medium text-gray-900 dark:text-white">{item.oilType}:</span>
                          <span className="text-gray-600 dark:text-gray-400 ml-1">
                            {numberFormatter.format(item.quantityOrdered)} ลิตร
                          </span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium shadow-sm ${getStatusColor(receipt.status)}`}>
                      {receipt.status === "รับแล้ว" && <CheckCircle className="w-3.5 h-3.5" />}
                      {receipt.status === "รอรับ" && <Clock className="w-3.5 h-3.5" />}
                      {receipt.status === "ปฏิเสธ" && <X className="w-3.5 h-3.5" />}
                      {receipt.status === "ยกเลิก" && <X className="w-3.5 h-3.5" />}
                      {getStatusText(receipt.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-2 justify-center">
                      {receipt.status === "รอรับ" && (
                        <>
                          <button
                            onClick={() => handleReceive(receipt)}
                            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium shadow-sm hover:shadow-md"
                          >
                            รับน้ำมัน
                          </button>
                          <button
                            onClick={() => handleReject(receipt)}
                            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium shadow-sm hover:shadow-md"
                          >
                            ปฏิเสธ
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleViewDetail(receipt)}
                        className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        title="ดูรายละเอียด"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredReceipts.length === 0 && (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
              <PackageCheck className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">ไม่พบรายการรับน้ำมัน</p>
          </div>
        )}
      </motion.div>

      {/* Detail Modal */}
      <AnimatePresence>
        {showDetailModal && selectedReceipt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowDetailModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  รายละเอียดการรับน้ำมัน - {selectedReceipt.branchName}
                </h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Status Badge */}
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-800 rounded-lg">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">สถานะ</span>
                  <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold shadow-sm ${getStatusColor(selectedReceipt.status)}`}>
                    {selectedReceipt.status === "รับแล้ว" && <CheckCircle className="w-4 h-4" />}
                    {selectedReceipt.status === "รอรับ" && <Clock className="w-4 h-4" />}
                    {getStatusText(selectedReceipt.status)}
                  </span>
                </div>

                {/* Basic Information */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      เลขที่ใบสั่งซื้อ
                    </p>
                    <p className="font-semibold text-gray-900 dark:text-white">{selectedReceipt.purchaseOrderNo}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                      <Truck className="w-3 h-3" />
                      เลขขนส่ง
                    </p>
                    <p className="font-semibold text-gray-900 dark:text-white">{selectedReceipt.transportNo}</p>
                  </div>
                  {(() => {
                    // หา Delivery Note ที่เชื่อมกับ Purchase Order นี้
                    const relatedDeliveryNote = deliveryNotes.find(
                      (dn) => dn.purchaseOrderNo === selectedReceipt.purchaseOrderNo && dn.toBranchId === selectedReceipt.branchId
                    );
                    return relatedDeliveryNote ? (
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800 col-span-2">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            <p className="text-sm font-semibold text-blue-800 dark:text-blue-300">ใบส่งของ (Delivery Note)</p>
                            <span className="text-xs text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-2 py-0.5 rounded">
                              {relatedDeliveryNote.deliveryNoteNo}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedDeliveryNote(relatedDeliveryNote);
                                setShowDeliveryNoteModal(true);
                              }}
                              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              ดูใบส่งของ
                            </button>
                            <button
                              onClick={() => {
                                handleDownloadDeliveryNotePDF(relatedDeliveryNote);
                              }}
                              className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
                            >
                              <Download className="w-3.5 h-3.5" />
                              ดาวน์โหลด PDF
                            </button>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-blue-700 dark:text-blue-400">วันที่ส่ง:</span>
                            <span className="font-semibold text-blue-900 dark:text-blue-200 ml-2">
                              {dateFormatter.format(new Date(relatedDeliveryNote.deliveryDate))}
                            </span>
                          </div>
                          <div>
                            <span className="text-blue-700 dark:text-blue-400">จาก:</span>
                            <span className="font-semibold text-blue-900 dark:text-blue-200 ml-2">{relatedDeliveryNote.fromBranchName}</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg border border-gray-200 dark:border-gray-600 col-span-2">
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                          <FileText className="w-4 h-4" />
                          <span>ยังไม่มีใบส่งของสำหรับรายการนี้</span>
                        </div>
                      </div>
                    );
                  })()}
                  <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                      <Building2 className="w-3 h-3" />
                      ปั๊มย่อย
                    </p>
                    <p className="font-semibold text-gray-900 dark:text-white">{selectedReceipt.branchName}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      วันที่รับ
                    </p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {dateFormatter.format(new Date(selectedReceipt.receiveDate))}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                      <Truck className="w-3 h-3" />
                      รถหัวลาก
                    </p>
                    <p className="font-semibold text-gray-900 dark:text-white">{selectedReceipt.truckPlateNumber}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                      <Truck className="w-3 h-3" />
                      หางบรรทุก
                    </p>
                    <p className="font-semibold text-gray-900 dark:text-white">{selectedReceipt.trailerPlateNumber}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                      <User className="w-3 h-3" />
                      คนขับ
                    </p>
                    <p className="font-semibold text-gray-900 dark:text-white">{selectedReceipt.driverName}</p>
                  </div>
                  {selectedReceipt.receivedByName && (
                    <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                        <User className="w-3 h-3" />
                        ผู้รับ
                      </p>
                      <p className="font-semibold text-gray-900 dark:text-white">{selectedReceipt.receivedByName}</p>
                    </div>
                  )}
                  {selectedReceipt.rejectReason && (
                    <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800 col-span-2">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                        <p className="text-xs font-semibold text-orange-800 dark:text-orange-300">เหตุผลในการปฏิเสธ</p>
                      </div>
                      <p className="text-sm text-orange-700 dark:text-orange-400">{selectedReceipt.rejectReason}</p>
                      {selectedReceipt.rejectedBy && (
                        <p className="text-xs text-orange-600 dark:text-orange-500 mt-2">
                          โดย: {selectedReceipt.rejectedBy}
                          {selectedReceipt.rejectedAt && ` - ${dateFormatter.format(new Date(selectedReceipt.rejectedAt))}`}
                        </p>
                      )}
                    </div>
                  )}
                  {selectedReceipt.qualityTest && (
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800 col-span-2">
                      <div className="flex items-center gap-2 mb-3">
                        <AlertCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                        <p className="text-xs font-semibold text-green-800 dark:text-green-300">ผลการทดสอบน้ำมัน</p>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div>
                          <span className="text-green-700 dark:text-green-400">API Gravity:</span>
                          <span className="font-semibold text-green-900 dark:text-green-200 ml-2">{selectedReceipt.qualityTest.apiGravity}</span>
                        </div>
                        <div>
                          <span className="text-green-700 dark:text-green-400">Water Content:</span>
                          <span className="font-semibold text-green-900 dark:text-green-200 ml-2">{selectedReceipt.qualityTest.waterContent}%</span>
                        </div>
                        <div>
                          <span className="text-green-700 dark:text-green-400">Temperature:</span>
                          <span className="font-semibold text-green-900 dark:text-green-200 ml-2">{selectedReceipt.qualityTest.temperature}°C</span>
                        </div>
                        <div>
                          <span className="text-green-700 dark:text-green-400">สี:</span>
                          <span className="font-semibold text-green-900 dark:text-green-200 ml-2">{selectedReceipt.qualityTest.color || "-"}</span>
                        </div>
                        <div>
                          <span className="text-green-700 dark:text-green-400">ผลการตรวจสอบ:</span>
                          <span className={`font-semibold ml-2 ${selectedReceipt.qualityTest.testResult === "ผ่าน"
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-600 dark:text-red-400"
                            }`}>
                            {selectedReceipt.qualityTest.testResult}
                          </span>
                        </div>
                        <div>
                          <span className="text-green-700 dark:text-green-400">ผู้ตรวจสอบ:</span>
                          <span className="font-semibold text-green-900 dark:text-green-200 ml-2">{selectedReceipt.qualityTest.testedBy || "-"}</span>
                        </div>
                      </div>
                      {selectedReceipt.qualityTest.notes && (
                        <div className="mt-3 pt-3 border-t border-green-200 dark:border-green-800">
                          <p className="text-xs text-green-700 dark:text-green-400">หมายเหตุ: {selectedReceipt.qualityTest.notes}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* รายการน้ำมัน */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-4">
                    <Droplet className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <p className="text-lg font-bold text-gray-900 dark:text-white">รายการน้ำมัน</p>
                  </div>
                  <div className="space-y-3">
                    {selectedReceipt.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700/50 dark:to-gray-800/50 p-4 rounded-xl border border-blue-200 dark:border-gray-600"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-bold text-gray-900 dark:text-white">{item.oilType}</p>
                            <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                              <div>
                                <span className="text-gray-600 dark:text-gray-400">จำนวนที่สั่ง:</span>
                                <span className="font-semibold text-gray-900 dark:text-white ml-2">
                                  {numberFormatter.format(item.quantityOrdered)} ลิตร
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-600 dark:text-gray-400">จำนวนที่รับ:</span>
                                <span className={`font-semibold ml-2 ${item.quantityReceived > 0
                                  ? "text-emerald-600 dark:text-emerald-400"
                                  : "text-gray-500 dark:text-gray-400"
                                  }`}>
                                  {item.quantityReceived > 0
                                    ? `${numberFormatter.format(item.quantityReceived)} ลิตร`
                                    : "ยังไม่รับ"}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-600 dark:text-gray-400">ราคาต่อลิตร:</span>
                                <span className="font-semibold text-gray-900 dark:text-white ml-2">
                                  {numberFormatter.format(item.pricePerLiter)} บาท
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-600 dark:text-gray-400">มูลค่ารวม:</span>
                                <span className="font-semibold text-blue-600 dark:text-blue-400 ml-2">
                                  {numberFormatter.format(item.totalAmount)} บาท
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold text-gray-900 dark:text-white">มูลค่ารวมทั้งหมด:</span>
                        <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {numberFormatter.format(selectedReceipt.totalAmount)} บาท
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Receive Modal */}
      <AnimatePresence>
        {showReceiveModal && selectedReceipt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowReceiveModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  รับน้ำมัน - {selectedReceipt.branchName}
                </h2>
                <button
                  onClick={() => setShowReceiveModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Order Info */}
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">เลขที่ใบสั่งซื้อ:</span>
                      <span className="font-semibold text-gray-900 dark:text-white ml-2">{selectedReceipt.purchaseOrderNo}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">เลขขนส่ง:</span>
                      <span className="font-semibold text-gray-900 dark:text-white ml-2">{selectedReceipt.transportNo}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">รถ:</span>
                      <span className="font-semibold text-gray-900 dark:text-white ml-2">
                        {selectedReceipt.truckPlateNumber} / {selectedReceipt.trailerPlateNumber}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">คนขับ:</span>
                      <span className="font-semibold text-gray-900 dark:text-white ml-2">{selectedReceipt.driverName}</span>
                    </div>
                  </div>
                </div>

                {/* Delivery Note Info */}
                {(() => {
                  const relatedDeliveryNote = deliveryNotes.find(
                    (dn) => dn.purchaseOrderNo === selectedReceipt.purchaseOrderNo && dn.toBranchId === selectedReceipt.branchId
                  );
                  return relatedDeliveryNote ? (
                    <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                          <p className="text-sm font-semibold text-indigo-800 dark:text-indigo-300">ใบส่งของ (Delivery Note)</p>
                          <span className="text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/30 px-2 py-0.5 rounded">
                            {relatedDeliveryNote.deliveryNoteNo}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedDeliveryNote(relatedDeliveryNote);
                              setShowDeliveryNoteModal(true);
                            }}
                            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            ดูใบส่งของ
                          </button>
                          <button
                            onClick={() => {
                              handleDownloadDeliveryNotePDF(relatedDeliveryNote);
                            }}
                            className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
                          >
                            <Download className="w-3.5 h-3.5" />
                            ดาวน์โหลด PDF
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-indigo-700 dark:text-indigo-400">วันที่ส่ง:</span>
                          <span className="font-semibold text-indigo-900 dark:text-indigo-200 ml-2">
                            {dateFormatter.format(new Date(relatedDeliveryNote.deliveryDate))}
                          </span>
                        </div>
                        <div>
                          <span className="text-indigo-700 dark:text-indigo-400">จาก:</span>
                          <span className="font-semibold text-indigo-900 dark:text-indigo-200 ml-2">{relatedDeliveryNote.fromBranchName}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-200 dark:border-gray-600">
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <FileText className="w-4 h-4" />
                        <span>ยังไม่มีใบส่งของสำหรับรายการนี้</span>
                      </div>
                    </div>
                  );
                })()}

                {/* Receive Form */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="receive-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      วันที่รับ *
                    </label>
                    <input
                      id="receive-date"
                      type="date"
                      value={receiveFormData.receiveDate}
                      onChange={(e) => setReceiveFormData({ ...receiveFormData, receiveDate: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="receive-time" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      เวลารับ *
                    </label>
                    <input
                      id="receive-time"
                      type="time"
                      value={receiveFormData.receiveTime}
                      onChange={(e) => setReceiveFormData({ ...receiveFormData, receiveTime: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="received-by-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    ชื่อผู้รับ *
                  </label>
                  <input
                    id="received-by-name"
                    type="text"
                    value={receiveFormData.receivedByName}
                    onChange={(e) => setReceiveFormData({ ...receiveFormData, receivedByName: e.target.value })}
                    placeholder="กรอกชื่อผู้รับน้ำมัน"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>

                {/* Items */}
                <div>
                  <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    รายการน้ำมันที่รับ
                  </span>
                  <div className="space-y-3">
                    {receiveFormData.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-200 dark:border-gray-600"
                      >
                        <div className="mb-2">
                          <p className="font-semibold text-gray-900 dark:text-white">{item.oilType}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            จำนวนที่สั่ง: {numberFormatter.format(item.quantityOrdered)} ลิตร
                          </p>
                        </div>
                        <div>
                          <label htmlFor={`receive-qty-${idx}`} className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                            จำนวนที่รับจริง (ลิตร) *
                          </label>
                          <input
                            id={`receive-qty-${idx}`}
                            type="number"
                            value={item.quantityReceived}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              setReceiveFormData({
                                ...receiveFormData,
                                items: receiveFormData.items.map((it, i) =>
                                  i === idx ? { ...it, quantityReceived: val } : it
                                ),
                              });
                            }}
                            placeholder="กรอกจำนวนที่รับจริง"
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            min="0"
                            step="0.1"
                            required
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quality Test */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-4">
                    <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">การทดสอบน้ำมัน</h3>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="api-gravity" className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                        API Gravity
                      </label>
                      <input
                        id="api-gravity"
                        type="number"
                        step="0.01"
                        value={receiveFormData.qualityTest.apiGravity}
                        onChange={(e) =>
                          setReceiveFormData({
                            ...receiveFormData,
                            qualityTest: { ...receiveFormData.qualityTest, apiGravity: parseFloat(e.target.value) || 0 },
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white text-sm"
                      />
                    </div>
                    <div>
                      <label htmlFor="water-content" className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                        Water Content (%)
                      </label>
                      <input
                        id="water-content"
                        type="number"
                        step="0.01"
                        value={receiveFormData.qualityTest.waterContent}
                        onChange={(e) =>
                          setReceiveFormData({
                            ...receiveFormData,
                            qualityTest: { ...receiveFormData.qualityTest, waterContent: parseFloat(e.target.value) || 0 },
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white text-sm"
                      />
                    </div>
                    <div>
                      <label htmlFor="test-temperature" className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                        Temperature (°C)
                      </label>
                      <input
                        id="test-temperature"
                        type="number"
                        step="0.1"
                        value={receiveFormData.qualityTest.temperature}
                        onChange={(e) =>
                          setReceiveFormData({
                            ...receiveFormData,
                            qualityTest: { ...receiveFormData.qualityTest, temperature: parseFloat(e.target.value) || 0 },
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white text-sm"
                      />
                    </div>
                    <div>
                      <label htmlFor="test-color" className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                        สี
                      </label>
                      <input
                        id="test-color"
                        type="text"
                        value={receiveFormData.qualityTest.color}
                        onChange={(e) =>
                          setReceiveFormData({
                            ...receiveFormData,
                            qualityTest: { ...receiveFormData.qualityTest, color: e.target.value },
                          })
                        }
                        placeholder="เช่น ใส, เหลืองอ่อน"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white text-sm"
                      />
                    </div>
                    <div>
                      <label htmlFor="test-result" className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                        ผลการตรวจสอบ
                      </label>
                      <select
                        id="test-result"
                        value={receiveFormData.qualityTest.testResult}
                        onChange={(e) =>
                          setReceiveFormData({
                            ...receiveFormData,
                            qualityTest: {
                              ...receiveFormData.qualityTest,
                              testResult: e.target.value as QualityTest["testResult"],
                            },
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white text-sm"
                      >
                        <option value="ผ่าน">ผ่าน</option>
                        <option value="ไม่ผ่าน">ไม่ผ่าน</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="tested-by" className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                        ผู้ตรวจสอบ
                      </label>
                      <input
                        id="tested-by"
                        type="text"
                        value={receiveFormData.qualityTest.testedBy}
                        onChange={(e) =>
                          setReceiveFormData({
                            ...receiveFormData,
                            qualityTest: { ...receiveFormData.qualityTest, testedBy: e.target.value },
                          })
                        }
                        placeholder="กรอกชื่อผู้ตรวจสอบ"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white text-sm"
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <label htmlFor="test-notes" className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                      หมายเหตุการทดสอบ
                    </label>
                    <textarea
                      id="test-notes"
                      value={receiveFormData.qualityTest.notes}
                      onChange={(e) =>
                        setReceiveFormData({
                          ...receiveFormData,
                          qualityTest: { ...receiveFormData.qualityTest, notes: e.target.value },
                        })
                      }
                      placeholder="ระบุหมายเหตุการทดสอบ (ถ้ามี)"
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="receive-notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    หมายเหตุ
                  </label>
                  <textarea
                    id="receive-notes"
                    value={receiveFormData.notes}
                    onChange={(e) => setReceiveFormData({ ...receiveFormData, notes: e.target.value })}
                    placeholder="ระบุหมายเหตุ (ถ้ามี)"
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setShowReceiveModal(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleSaveReceive}
                  className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-semibold"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    ยืนยันการรับน้ำมัน
                  </div>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Reject Modal */}
        <AnimatePresence>
          {showRejectModal && selectedReceipt && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowRejectModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    ปฏิเสธการรับน้ำมัน - {selectedReceipt.branchName}
                  </h2>
                  <button
                    onClick={() => setShowRejectModal(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                <div className="p-6 space-y-6">
                  {/* Order Info */}
                  <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">เลขที่ใบสั่งซื้อ:</span>
                        <span className="font-semibold text-gray-900 dark:text-white ml-2">{selectedReceipt.purchaseOrderNo}</span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">เลขขนส่ง:</span>
                        <span className="font-semibold text-gray-900 dark:text-white ml-2">{selectedReceipt.transportNo}</span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">รถ:</span>
                        <span className="font-semibold text-gray-900 dark:text-white ml-2">
                          {selectedReceipt.truckPlateNumber} / {selectedReceipt.trailerPlateNumber}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">คนขับ:</span>
                        <span className="font-semibold text-gray-900 dark:text-white ml-2">{selectedReceipt.driverName}</span>
                      </div>
                    </div>
                  </div>

                  {/* Delivery Note Info */}
                  {(() => {
                    const relatedDeliveryNote = deliveryNotes.find(
                      (dn) => dn.purchaseOrderNo === selectedReceipt.purchaseOrderNo && dn.toBranchId === selectedReceipt.branchId
                    );
                    return relatedDeliveryNote ? (
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            <p className="text-xs font-semibold text-blue-800 dark:text-blue-300">ใบส่งของ (Delivery Note)</p>
                            <span className="text-xs text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-2 py-0.5 rounded">
                              {relatedDeliveryNote.deliveryNoteNo}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedDeliveryNote(relatedDeliveryNote);
                                setShowDeliveryNoteModal(true);
                              }}
                              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              ดูใบส่งของ
                            </button>
                            <button
                              onClick={() => {
                                handleDownloadDeliveryNotePDF(relatedDeliveryNote);
                              }}
                              className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
                            >
                              <Download className="w-3.5 h-3.5" />
                              ดาวน์โหลด PDF
                            </button>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-blue-700 dark:text-blue-400">วันที่ส่ง:</span>
                            <span className="font-semibold text-blue-900 dark:text-blue-200 ml-2">
                              {dateFormatter.format(new Date(relatedDeliveryNote.deliveryDate))}
                            </span>
                          </div>
                          <div>
                            <span className="text-blue-700 dark:text-blue-400">จาก:</span>
                            <span className="font-semibold text-blue-900 dark:text-blue-200 ml-2">{relatedDeliveryNote.fromBranchName}</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-200 dark:border-gray-600">
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                          <FileText className="w-3 h-3" />
                          <span>ยังไม่มีใบส่งของสำหรับรายการนี้</span>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Reject Reason */}
                  <div>
                    <label htmlFor="reject-reason" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      เหตุผลในการปฏิเสธ *
                    </label>
                    <textarea
                      id="reject-reason"
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="กรุณาระบุเหตุผลในการปฏิเสธการรับน้ำมัน..."
                      rows={5}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-yellow-800 dark:text-yellow-300">
                        <p className="font-semibold mb-1">คำเตือน</p>
                        <p>การปฏิเสธการรับน้ำมันจะไม่สามารถยกเลิกได้ กรุณาตรวจสอบข้อมูลให้แน่ใจก่อนยืนยัน</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => {
                      setShowRejectModal(false);
                      setRejectReason("");
                    }}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    ยกเลิก
                  </button>
                  <button
                    onClick={handleSaveReject}
                    className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-semibold"
                  >
                    <div className="flex items-center gap-2">
                      <X className="w-4 h-4" />
                      ยืนยันการปฏิเสธ
                    </div>
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Delivery Note View Modal */}
        <AnimatePresence>
          {showDeliveryNoteModal && selectedDeliveryNote && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowDeliveryNoteModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">ใบส่งของ (Delivery Note)</h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{selectedDeliveryNote.deliveryNoteNo}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        handleDownloadDeliveryNotePDF(selectedDeliveryNote);
                      }}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      ดาวน์โหลด PDF
                    </button>
                    <button
                      onClick={() => setShowDeliveryNoteModal(false)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {/* Header Info */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">เลขที่ใบส่งของ</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{selectedDeliveryNote.deliveryNoteNo}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">วันที่ส่ง</p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {dateFormatter.format(new Date(selectedDeliveryNote.deliveryDate))}
                      </p>
                    </div>
                    {selectedDeliveryNote.purchaseOrderNo && (
                      <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">เลขที่ใบสั่งซื้อ</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{selectedDeliveryNote.purchaseOrderNo}</p>
                      </div>
                    )}
                    {selectedDeliveryNote.quotationNo && (
                      <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">เลขที่ใบเสนอราคา</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{selectedDeliveryNote.quotationNo}</p>
                      </div>
                    )}
                  </div>

                  {/* From/To Branch */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center gap-2 mb-2">
                        <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <p className="text-sm font-semibold text-blue-800 dark:text-blue-300">จาก (ผู้ส่ง)</p>
                      </div>
                      <p className="font-bold text-blue-900 dark:text-blue-200">{selectedDeliveryNote.fromBranchName}</p>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="flex items-center gap-2 mb-2">
                        <Building2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                        <p className="text-sm font-semibold text-green-800 dark:text-green-300">ไป (ผู้รับ)</p>
                      </div>
                      <p className="font-bold text-green-900 dark:text-green-200">{selectedDeliveryNote.toBranchName}</p>
                    </div>
                  </div>

                  {/* Truck & Driver Info */}
                  {(selectedDeliveryNote.truckPlateNumber || selectedDeliveryNote.driverName || selectedDeliveryNote.trailerPlateNumber || selectedDeliveryNote.transportNo) && (
                    <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">ข้อมูลรถและคนขับ</p>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        {selectedDeliveryNote.transportNo && (
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">เลขที่ขนส่ง:</span>
                            <span className="font-semibold text-gray-900 dark:text-white ml-2">{selectedDeliveryNote.transportNo}</span>
                          </div>
                        )}
                        {selectedDeliveryNote.truckPlateNumber && (
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">รถหัวลาก:</span>
                            <span className="font-semibold text-gray-900 dark:text-white ml-2">{selectedDeliveryNote.truckPlateNumber}</span>
                          </div>
                        )}
                        {selectedDeliveryNote.trailerPlateNumber && (
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">หางบรรทุก:</span>
                            <span className="font-semibold text-gray-900 dark:text-white ml-2">{selectedDeliveryNote.trailerPlateNumber}</span>
                          </div>
                        )}
                        {selectedDeliveryNote.driverName && (
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">คนขับ:</span>
                            <span className="font-semibold text-gray-900 dark:text-white ml-2">{selectedDeliveryNote.driverName}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Items */}
                  {selectedDeliveryNote.items && selectedDeliveryNote.items.length > 0 && (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700/50 dark:to-gray-800/50 p-4 rounded-lg border border-blue-200 dark:border-gray-600">
                      <div className="flex items-center gap-2 mb-4">
                        <Droplet className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        <p className="text-lg font-bold text-gray-900 dark:text-white">รายการน้ำมัน</p>
                      </div>
                      <div className="space-y-3">
                        {selectedDeliveryNote.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-blue-200 dark:border-gray-600"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-bold text-gray-900 dark:text-white text-lg">{item.oilType}</p>
                                <div className="mt-2 grid grid-cols-2 gap-3 text-sm">
                                  <div>
                                    <span className="text-gray-600 dark:text-gray-400">จำนวน:</span>
                                    <span className="font-semibold text-gray-900 dark:text-white ml-2">
                                      {numberFormatter.format(item.quantity)} ลิตร
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-gray-600 dark:text-gray-400">ราคาต่อลิตร:</span>
                                    <span className="font-semibold text-gray-900 dark:text-white ml-2">
                                      {numberFormatter.format(item.pricePerLiter)} บาท
                                    </span>
                                  </div>
                                  <div className="col-span-2">
                                    <span className="text-gray-600 dark:text-gray-400">มูลค่ารวม:</span>
                                    <span className="font-semibold text-blue-600 dark:text-blue-400 ml-2 text-lg">
                                      {numberFormatter.format(item.totalAmount)} บาท
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                        <div className="mt-4 pt-4 border-t border-blue-200 dark:border-gray-600">
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-semibold text-gray-900 dark:text-white">มูลค่ารวมทั้งหมด:</span>
                            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                              {numberFormatter.format(selectedDeliveryNote.totalAmount)} บาท
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Status */}
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-800 rounded-lg">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">สถานะ</span>
                    <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold shadow-sm ${selectedDeliveryNote.status === "delivered"
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : selectedDeliveryNote.status === "sent"
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                        : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                      }`}>
                      {selectedDeliveryNote.status === "delivered" && <CheckCircle className="w-4 h-4" />}
                      {selectedDeliveryNote.status === "sent" && <Clock className="w-4 h-4" />}
                      {selectedDeliveryNote.status === "draft" && "ร่าง"}
                      {selectedDeliveryNote.status === "sent" && "ส่งแล้ว"}
                      {selectedDeliveryNote.status === "delivered" && "ส่งสำเร็จ"}
                      {selectedDeliveryNote.status === "cancelled" && "ยกเลิก"}
                    </span>
                  </div>

                  {/* Signature Info */}
                  {(selectedDeliveryNote.senderSignature || selectedDeliveryNote.signedBy || selectedDeliveryNote.receiverName || selectedDeliveryNote.receiverSignature) && (
                    <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">ข้อมูลการส่งและรับ</p>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        {selectedDeliveryNote.senderSignature && (
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">ลายมือชื่อผู้ส่ง:</span>
                            <span className="font-semibold text-gray-900 dark:text-white ml-2">{selectedDeliveryNote.senderSignature}</span>
                          </div>
                        )}
                        {selectedDeliveryNote.senderSignedAt && (
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">วันที่ส่ง:</span>
                            <span className="font-semibold text-gray-900 dark:text-white ml-2">
                              {dateFormatter.format(new Date(selectedDeliveryNote.senderSignedAt))}
                            </span>
                          </div>
                        )}
                        {selectedDeliveryNote.receiverName && (
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">ผู้รับ:</span>
                            <span className="font-semibold text-gray-900 dark:text-white ml-2">{selectedDeliveryNote.receiverName}</span>
                          </div>
                        )}
                        {selectedDeliveryNote.receiverSignature && (
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">ลายมือชื่อผู้รับ:</span>
                            <span className="font-semibold text-gray-900 dark:text-white ml-2">{selectedDeliveryNote.receiverSignature}</span>
                          </div>
                        )}
                        {selectedDeliveryNote.receiverSignedAt && (
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">วันที่รับ:</span>
                            <span className="font-semibold text-gray-900 dark:text-white ml-2">
                              {dateFormatter.format(new Date(selectedDeliveryNote.receiverSignedAt))}
                            </span>
                          </div>
                        )}
                        {selectedDeliveryNote.signedAt && !selectedDeliveryNote.receiverSignedAt && (
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">วันที่รับ:</span>
                            <span className="font-semibold text-gray-900 dark:text-white ml-2">
                              {dateFormatter.format(new Date(selectedDeliveryNote.signedAt))}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </AnimatePresence>
    </div>
  );
}
