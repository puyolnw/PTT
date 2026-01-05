import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
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
import { useGasStation } from "@/contexts/GasStationContext";
import { useBranch } from "@/contexts/BranchContext";
import type { DeliveryNote, DriverJob, PurchaseOrder, QualityTest, Receipt } from "@/types/gasStation";

const numberFormatter = new Intl.NumberFormat("th-TH", {
  maximumFractionDigits: 0,
});

const currencyFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 2,
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
  approveNo?: string; // ใบอนุมัติขายเลขที่ (จาก PO)
  contractNo?: string; // Contract No. (จาก PO)
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
  qualityTest?: QualityTest;
  createdAt: string;
  createdBy: string;
}

const BRANCH_RECEIPTS_STORAGE_KEY = "ptt.gasStation.branchOilReceipts.v1";
const INTERNAL_SALES_STORAGE_KEY = "ptt.delivery.internalSales.v1";

type SourceType = "จากคลังน้ำมัน" | "จากการดูด" | "จากน้ำมันที่เหลือบนรถ";
type InternalSaleTxLite = { source: "truck-remaining" | "recovered"; deliveryNoteNo: string; receiptNo: string };

function loadInternalSalesFromStorage(): InternalSaleTxLite[] {
  try {
    if (typeof window === "undefined") return [];
    const raw = window.localStorage.getItem(INTERNAL_SALES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((x) => x as Partial<InternalSaleTxLite>)
      .filter((x) => !!x.deliveryNoteNo && !!x.receiptNo && (x.source === "truck-remaining" || x.source === "recovered"))
      .map((x) => ({ source: x.source as InternalSaleTxLite["source"], deliveryNoteNo: x.deliveryNoteNo!, receiptNo: x.receiptNo! }));
  } catch {
    return [];
  }
}

function loadBranchReceiptsFromStorage(): Partial<BranchOilReceipt>[] {
  try {
    if (typeof window === "undefined") return [];
    const raw = window.localStorage.getItem(BRANCH_RECEIPTS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Partial<BranchOilReceipt>[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveBranchReceiptsToStorage(receipts: Partial<BranchOilReceipt>[]) {
  try {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(BRANCH_RECEIPTS_STORAGE_KEY, JSON.stringify(receipts));
  } catch {
    // ignore
  }
}

// Helper function - ดึงข้อมูล Branch Receipts จาก Purchase Orders และ Driver Jobs (รอบส่งจริง)
const generateBranchReceipts = (purchaseOrders: PurchaseOrder[], driverJobs: DriverJob[]): BranchOilReceipt[] => {
  const receipts: BranchOilReceipt[] = [];

  // ดึงข้อมูลจาก Purchase Orders และเชื่อมกับ Driver Jobs
  purchaseOrders.forEach((po) => {
    const relatedJobs = driverJobs.filter((j) => j.orderType === "external" && j.purchaseOrderNo === po.orderNo);

    po.branches.forEach((branch) => {
      const jobForBranch =
        relatedJobs.find((j) => j.destinationBranches?.some((b) => b.branchId === branch.branchId)) || relatedJobs[0];
      const transportNo =
        jobForBranch?.transportNo || `TP-${po.orderDate.replace(/-/g, "")}-${po.orderNo.slice(-3)}`;

      // สร้าง Branch Receipt สำหรับแต่ละปั๊ม
      const receipt: BranchOilReceipt = {
        id: `BR-${po.orderNo}-${branch.branchId}`,
        receiptNo: `BR-${po.orderNo}-${branch.branchId}`,
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
          quantityReceived: 0, // ยังไม่รับ
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
      };

      receipts.push(receipt);
    });
  });

  return receipts;
};

export default function BranchOilReceipt() {
  const { purchaseOrders, deliveryNotes, driverJobs, receipts, branches } = useGasStation();
  const { selectedBranches } = useBranch();
  const selectedBranchIds = useMemo(() => selectedBranches.map(id => Number(id)), [selectedBranches]);

  const poByNo = useMemo(() => {
    const m = new Map<string, PurchaseOrder>();
    purchaseOrders.forEach((po) => m.set(po.orderNo, po));
    return m;
  }, [purchaseOrders]);

  const internalSales = useMemo(() => loadInternalSalesFromStorage(), []);
  const internalSaleByDeliveryNoteNo = useMemo(() => {
    const m = new Map<string, InternalSaleTxLite>();
    internalSales.forEach((t) => m.set(t.deliveryNoteNo, t));
    return m;
  }, [internalSales]);
  const internalSaleByReceiptNo = useMemo(() => {
    const m = new Map<string, InternalSaleTxLite>();
    internalSales.forEach((t) => m.set(t.receiptNo, t));
    return m;
  }, [internalSales]);

  // Generate base receipts from PO + driverJobs, then merge persisted overrides from localStorage
  const baseReceipts = useMemo(() => {
    return generateBranchReceipts(purchaseOrders, driverJobs);
  }, [purchaseOrders, driverJobs]);

  const buildReceipts = (base: BranchOilReceipt[], overrides: Partial<BranchOilReceipt>[]) => {
    const byId = new Map<string, Partial<BranchOilReceipt>>();
    overrides.forEach((o) => {
      if (o.id) byId.set(o.id, o);
    });

    // Mock up: ถ้ายังไม่มี override เลย ให้โชว์อย่างน้อย 1 รายการเป็น “รับแล้ว” เพื่อเห็นสถานะรับเสร็จแล้ว
    const hasOverrides = overrides.length > 0;
    const now = new Date();
    const mockReceivedAt = new Date(now.getTime() - 45 * 60 * 1000).toISOString(); // 45 นาทีที่แล้ว

    return base.map((r, idx) => {
      const merged = { ...r, ...(byId.get(r.id) || {}) } as BranchOilReceipt;
      if (!hasOverrides && idx === 0) {
        return {
          ...merged,
          status: "รับแล้ว",
          receivedByName: merged.receivedByName || "ผู้รับตัวอย่าง",
          receivedBy: merged.receivedBy || "ผู้รับตัวอย่าง",
          receivedAt: merged.receivedAt || mockReceivedAt,
          items: merged.items.map((it) => ({
            ...it,
            quantityReceived: it.quantityOrdered,
            totalAmount: it.quantityOrdered * it.pricePerLiter,
          })),
          totalAmount: merged.items.reduce((sum, it) => sum + it.quantityOrdered * it.pricePerLiter, 0),
        };
      }
      return merged;
    }) as BranchOilReceipt[];
  };

  const [branchReceiptsState, setBranchReceiptsState] = useState<BranchOilReceipt[]>(() => {
    const overrides = loadBranchReceiptsFromStorage();
    return buildReceipts(baseReceipts, overrides);
  });

  useEffect(() => {
    // Rebuild when base list changes (new PO/branches) but keep stored status/received info
    const overrides = loadBranchReceiptsFromStorage();
    setBranchReceiptsState(buildReceipts(baseReceipts, overrides));
  }, [baseReceipts]);

  const persistOverride = (receipt: BranchOilReceipt) => {
    const overrides = loadBranchReceiptsFromStorage();
    const next = [
      // replace same id
      ...overrides.filter((o) => o.id !== receipt.id),
      {
        id: receipt.id,
        status: receipt.status,
        receivedBy: receipt.receivedBy,
        receivedByName: receipt.receivedByName,
        receivedAt: receipt.receivedAt,
        rejectReason: receipt.rejectReason,
        rejectedBy: receipt.rejectedBy,
        rejectedAt: receipt.rejectedAt,
        notes: receipt.notes,
        items: receipt.items,
      } satisfies Partial<BranchOilReceipt>,
    ];
    saveBranchReceiptsToStorage(next);
  };
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
  const [selectedDeliveryNote, setSelectedDeliveryNote] = useState<any>(null);
  const [showTaxInvoiceModal, setShowTaxInvoiceModal] = useState(false);
  const [selectedTaxInvoice, setSelectedTaxInvoice] = useState<Receipt | null>(null);
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
    branchReceiptsState.forEach((r) => {
      if (!branchMap.has(r.branchId)) {
        branchMap.set(r.branchId, r.branchName);
      }
    });
    return Array.from(branchMap.entries()).map(([id, name]) => ({ id, name }));
  }, [branchReceiptsState]);

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
    return branchReceiptsState.filter((r) => {
      const po = poByNo.get(r.purchaseOrderNo);
      const approveNo = po?.approveNo || r.approveNo || "";
      const contractNo = po?.contractNo || r.contractNo || "";
      const matchesSearch =
        r.receiptNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.purchaseOrderNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.transportNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.branchName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.truckPlateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        approveNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contractNo.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === "all" || r.status === filterStatus;
        const matchGlobalBranch = selectedBranchIds.length === 0 || selectedBranchIds.includes(r.branchId);
        const matchesLocalBranch = filterBranch === "all" || r.branchId === filterBranch;
        const matchesBranch = matchGlobalBranch && matchesLocalBranch;
        const matchesDate = isDateInRange(r.receiveDate, filterDateFrom, filterDateTo);
        return matchesSearch && matchesStatus && matchesBranch && matchesDate;
      });
  }, [branchReceiptsState, poByNo, searchTerm, filterStatus, filterBranch, filterDateFrom, filterDateTo, selectedBranchIds]);

  // Statistics
  const stats = useMemo(() => {
    const total = branchReceiptsState.length;
    const pending = branchReceiptsState.filter((r) => r.status === "รอรับ").length;
    const received = branchReceiptsState.filter((r) => r.status === "รับแล้ว").length;
    const rejected = branchReceiptsState.filter((r) => r.status === "ปฏิเสธ").length;
    const cancelled = branchReceiptsState.filter((r) => r.status === "ยกเลิก").length;
    return { total, pending, received, rejected, cancelled };
  }, [branchReceiptsState]);

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
    const deliveryNoteNo = relatedDeliveryNote?.deliveryNoteNo;

    const now = new Date().toISOString();
    const updatedReceipt: BranchOilReceipt = {
      ...selectedReceipt,
      status: "รับแล้ว",
      receiveDate: receiveFormData.receiveDate,
      receiveTime: receiveFormData.receiveTime,
      receivedByName: receiveFormData.receivedByName,
      receivedBy: receiveFormData.receivedByName,
      receivedAt: now,
      notes: receiveFormData.notes || undefined,
      items: selectedReceipt.items.map((it) => {
        const matched = receiveFormData.items.find((x) => x.oilType === it.oilType);
        const qtyReceived = matched ? matched.quantityReceived : it.quantityOrdered;
        return {
          ...it,
          quantityReceived: qtyReceived,
          totalAmount: qtyReceived * it.pricePerLiter,
        };
      }),
      totalAmount: selectedReceipt.items.reduce((sum, it) => {
        const matched = receiveFormData.items.find((x) => x.oilType === it.oilType);
        const qtyReceived = matched ? matched.quantityReceived : it.quantityOrdered;
        return sum + qtyReceived * it.pricePerLiter;
      }, 0),
    };

    // Persist override + update UI state
    setBranchReceiptsState((prev) => prev.map((r) => (r.id === updatedReceipt.id ? updatedReceipt : r)));
    persistOverride(updatedReceipt);

    alert(
      `รับน้ำมันสำเร็จ!\n\nใบสั่งซื้อ: ${selectedReceipt.purchaseOrderNo}\nเลขขนส่ง: ${selectedReceipt.transportNo}\nใบส่งของ: ${deliveryNoteNo || "-"
      }\nปั๊ม: ${selectedReceipt.branchName}\nผลการทดสอบ: ${receiveFormData.qualityTest.testResult}`
    );
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

    const now = new Date().toISOString();
    const updatedReceipt: BranchOilReceipt = {
      ...selectedReceipt,
      status: "ปฏิเสธ",
      rejectReason: rejectReason,
      rejectedBy: "ผู้ใช้",
      rejectedAt: now,
    };

    setBranchReceiptsState((prev) => prev.map((r) => (r.id === updatedReceipt.id ? updatedReceipt : r)));
    persistOverride(updatedReceipt);

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
        return "รับเสร็จแล้ว";
      case "ปฏิเสธ":
        return "ปฏิเสธ";
      case "ยกเลิก":
        return "ยกเลิก";
      default:
        return status;
    }
  };

  const getSourceType = (args: { po?: PurchaseOrder; deliveryNoteNo?: string; receiptNo?: string }): SourceType => {
    if (args.po) return "จากคลังน้ำมัน";
    const byDn = args.deliveryNoteNo ? internalSaleByDeliveryNoteNo.get(args.deliveryNoteNo) : undefined;
    const byRcp = args.receiptNo ? internalSaleByReceiptNo.get(args.receiptNo) : undefined;
    const tx = byDn || byRcp;
    if (!tx) return "จากคลังน้ำมัน";
    return tx.source === "recovered" ? "จากการดูด" : "จากน้ำมันที่เหลือบนรถ";
  };

  const findRelatedTaxInvoice = (args: { branchName: string; deliveryNoteNo?: string; purchaseOrderNo?: string }) => {
    // 1) Exact link by Delivery Note No (preferred)
    if (args.deliveryNoteNo) {
      const exact = receipts.find((r) => r.deliveryNoteNo === args.deliveryNoteNo);
      if (exact) return exact;
    }
    // 2) Fallback for legacy/mock data: match by customer name (branch) (and PO if present)
    const byName = receipts.find((r) => {
      if (r.customerName !== args.branchName) return false;
      if (args.purchaseOrderNo && r.purchaseOrderNo && r.purchaseOrderNo !== args.purchaseOrderNo) return false;
      return true;
    });
    return byName;
  };

  // ฟังก์ชันสำหรับดาวน์โหลดเอกสารเป็น PDF (Unified)
  const handleDownload = (
    type: "delivery-note" | "tax-invoice" | "branch-oil-receipt",
    data: any // Keeping any for now as data can have varying extended properties in some contexts, but internal casts are added.
  ) => {
    let htmlContent = "";
    let fileName = "";

    if (type === "delivery-note") {
      const dn = data as DeliveryNote & { transportNo?: string; trailerPlateNumber?: string; senderSignature?: string; senderSignedAt?: string; receiverSignature?: string; receiverSignedAt?: string };
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
            .footer { margin-top: 40px; display: flex; justify-content: space-between; }
            .signature-box { width: 200px; text-align: center; }
            .signature-line { border-top: 1px solid #000; margin-top: 60px; padding-top: 5px; }
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
            ${dn.transportNo ? `<div class="info-row"><div class="info-label">เลขที่ขนส่ง:</div><div class="info-value">${dn.transportNo}</div></div>` : ""}
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
            <thead><tr><th>รายการ</th><th>จำนวน (ลิต)</th><th>ราคา/ลิตร</th><th>รวม</th></tr></thead>
            <tbody>
              ${dn.items.map((it: any) => `<tr><td>${it.oilType}</td><td>${numberFormatter.format(it.quantity)}</td><td>${numberFormatter.format(it.pricePerLiter)}</td><td>${numberFormatter.format(it.totalAmount)}</td></tr>`).join("")}
              <tr class="total-row"><td colspan="3" style="text-align:right">รวมทั้งสิ้น:</td><td>${numberFormatter.format(dn.totalAmount)}</td></tr>
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
            <thead><tr><th>รายการ</th><th>จำนวน (ลิตร)</th><th>ราคา/ลิตร</th><th>รวม</th></tr></thead>
            <tbody>
              ${receipt.items.map((it: any) => `<tr><td>${it.oilType}</td><td>${numberFormatter.format(it.quantity)}</td><td>${it.pricePerLiter.toFixed(2)}</td><td>${currencyFormatter.format(it.totalAmount)}</td></tr>`).join("")}
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
    } else if (type === "branch-oil-receipt") {
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
            <thead><tr><th>รายการ</th><th>สั่ง (ลิตร)</th><th>รับจริง (ลิตร)</th><th>ราคา/ลิตร</th><th>รวม</th></tr></thead>
            <tbody>
              ${br.items.map(it => `<tr><td>${it.oilType}</td><td>${numberFormatter.format(it.quantityOrdered)}</td><td>${numberFormatter.format(it.quantityReceived)}</td><td>${numberFormatter.format(it.pricePerLiter)}</td><td>${numberFormatter.format(it.totalAmount)}</td></tr>`).join("")}
              <tr style="font-weight:bold"><td colspan="4" style="text-align:right">รวมทั้งสิ้น:</td><td>${numberFormatter.format(br.totalAmount)}</td></tr>
            </tbody>
          </table>
          <div class="footer">
            <div class="sig"><div class="sig-line">ผู้ส่งน้ำมัน</div></div>
            <div class="sig"><div class="sig-line">ผู้รับน้ำมัน (${br.receivedByName || "...................."})</div></div>
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

    // Optional: Trigger download as HTML
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


  return (
    <div className="space-y-6 p-6">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
            <PackageCheck className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 font-display">รับน้ำมัน (Branch Receipt)</h1>
            <p className="text-sm text-gray-500 mt-1">รับน้ำมันตามใบสั่งซื้อและเลขใบขนส่ง</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white/50 dark:bg-gray-800/50 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm backdrop-blur-sm">
          <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            สาขาที่กำลังดู: {selectedBranches.length === 0 ? "ทั้งหมด" : selectedBranches.map(id => branches.find(b => String(b.id) === id)?.name || id).join(", ")}
          </span>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4"
        >
          <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
            <FileText className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <div className="text-xs text-gray-500">ทั้งหมด</div>
            <div className="text-xl font-bold text-gray-800">{stats.total} รายการ</div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4"
        >
          <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center shrink-0">
            <Clock className="h-6 w-6 text-yellow-600" />
          </div>
          <div>
            <div className="text-xs text-gray-500">รอรับ</div>
            <div className="text-xl font-bold text-gray-800">{stats.pending} รายการ</div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4"
        >
          <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
            <CheckCircle className="h-6 w-6 text-emerald-600" />
          </div>
          <div>
            <div className="text-xs text-gray-500">รับแล้ว</div>
            <div className="text-xl font-bold text-gray-800">{stats.received} รายการ</div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4"
        >
          <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
            <X className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <div className="text-xs text-gray-500">ปฏิเสธ</div>
            <div className="text-xl font-bold text-gray-800">{stats.rejected} รายการ</div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4"
        >
          <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center shrink-0">
            <X className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <div className="text-xs text-gray-500">ยกเลิก</div>
            <div className="text-xl font-bold text-gray-800">{stats.cancelled} รายการ</div>
          </div>
        </motion.div>
      </div>

      {/* Filters and Table Container */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Filter Header */}
        <div className="p-4 border-b border-gray-200 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          <div className="flex-1 w-full md:w-auto relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ค้นหาเลขที่ใบสั่งซื้อ, เลขขนส่ง, ปั๊ม..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Date Filter */}
            <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-lg border border-gray-200">
              <input
                type="date"
                value={filterDateFrom}
                onChange={(e) => setFilterDateFrom(e.target.value)}
                className="bg-transparent text-sm border-none focus:ring-0 p-1 text-gray-600 w-32 outline-none"
              />
              <span className="text-gray-400 text-xs">-</span>
              <input
                type="date"
                value={filterDateTo}
                onChange={(e) => setFilterDateTo(e.target.value)}
                className="bg-transparent text-sm border-none focus:ring-0 p-1 text-gray-600 w-32 outline-none"
              />
            </div>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2 outline-none"
            >
              <option value="all">สถานะทั้งหมด</option>
              <option value="รอรับ">รอรับ</option>
              <option value="รับแล้ว">รับแล้ว</option>
              <option value="ปฏิเสธ">ปฏิเสธ</option>
              <option value="ยกเลิก">ยกเลิก</option>
            </select>

            {/* Branch Filter */}
            <select
              value={filterBranch}
              onChange={(e) => setFilterBranch(e.target.value === "all" ? "all" : Number(e.target.value))}
              className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2 outline-none"
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
                className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium whitespace-nowrap"
              >
                ล้างตัวกรอง
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider border-b border-gray-200">
                <th className="px-6 py-4 font-medium">ใบสั่งซื้อ / ขนส่ง</th>
                <th className="px-6 py-4 font-medium">สาขา / วันที่</th>
                <th className="px-6 py-4 font-medium">ข้อมูลรถ</th>
                <th className="px-6 py-4 font-medium">รายการน้ำมัน</th>
                <th className="px-6 py-4 font-medium text-center">สถานะ</th>
                <th className="px-6 py-4 font-medium text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {filteredReceipts.map((receipt) => (
                <tr
                  key={receipt.id}
                  className="hover:bg-blue-50/10 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-800">{receipt.purchaseOrderNo}</span>
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-gray-100 text-gray-600 border border-gray-200">
                          {getSourceType({ po: poByNo.get(receipt.purchaseOrderNo) })}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Truck className="w-3 h-3" />
                        <span>{receipt.transportNo}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-800 mb-1">{receipt.branchName}</div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" />
                      {dateFormatter.format(new Date(receipt.receiveDate))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 text-sm font-medium text-gray-800">
                        <Truck className="w-3.5 h-3.5 text-gray-400" />
                        {receipt.truckPlateNumber}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <span className="ml-5">{receipt.trailerPlateNumber}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
                        <User className="w-3.5 h-3.5 text-gray-400" />
                        {receipt.driverName}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      {receipt.items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs gap-4">
                          <span className="font-medium text-gray-700">{item.oilType}</span>
                          <span className="text-gray-500">{numberFormatter.format(item.quantityOrdered)} ล.</span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${receipt.status === "รับแล้ว" ? "bg-emerald-100 text-emerald-700 border-emerald-200" :
                        receipt.status === "รอรับ" ? "bg-yellow-100 text-yellow-700 border-yellow-200" :
                          receipt.status === "ปฏิเสธ" ? "bg-orange-100 text-orange-700 border-orange-200" :
                            "bg-gray-100 text-gray-700 border-gray-200"
                      }`}>
                      {receipt.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {receipt.status === "รอรับ" && (
                        <>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleReceive(receipt); }}
                            className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-xs font-bold shadow-sm"
                          >
                            รับน้ำมัน
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleReject(receipt); }}
                            className="px-3 py-1.5 bg-white text-orange-600 border border-orange-200 rounded-lg hover:bg-orange-50 transition-colors text-xs font-bold"
                          >
                            ปฏิเสธ
                          </button>
                        </>
                      )}
                      {receipt.status === "รับแล้ว" && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDownload("branch-oil-receipt", receipt); }}
                          className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors border border-transparent hover:border-green-200"
                          title="ดาวน์โหลด PDF"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); handleViewDetail(receipt); }}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-200"
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
          {filteredReceipts.length === 0 && (
            <div className="py-20 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500">ไม่พบรายการที่ค้นหา</p>
            </div>
          )}
        </div>
      </div>

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
                <div className="flex items-center gap-2">
                  {selectedReceipt.status === "รับแล้ว" && (
                    <button
                      onClick={() => handleDownload("branch-oil-receipt", selectedReceipt)}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      ดาวน์โหลด PDF
                    </button>
                  )}
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
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
                  {(() => {
                    const po = poByNo.get(selectedReceipt.purchaseOrderNo);
                    const approveNo = po?.approveNo || selectedReceipt.approveNo;
                    const contractNo = po?.contractNo || selectedReceipt.contractNo;
                    return (
                      <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          ใบอนุมัติขายเลขที่ / Contract No.
                        </p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {approveNo || "-"}{" "}
                          <span className="text-gray-500 dark:text-gray-400 font-medium">•</span>{" "}
                          {contractNo || "-"}
                        </p>
                      </div>
                    );
                  })()}
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
                    const relatedTaxInvoice = findRelatedTaxInvoice({
                      branchName: selectedReceipt.branchName,
                      deliveryNoteNo: relatedDeliveryNote?.deliveryNoteNo,
                      purchaseOrderNo: selectedReceipt.purchaseOrderNo,
                    });
                    const po = poByNo.get(selectedReceipt.purchaseOrderNo);
                    const sourceType = getSourceType({
                      po,
                      deliveryNoteNo: relatedDeliveryNote?.deliveryNoteNo,
                      receiptNo: relatedTaxInvoice?.receiptNo,
                    });
                    return relatedDeliveryNote ? (
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800 col-span-2">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            <p className="text-sm font-semibold text-blue-800 dark:text-blue-300">ใบส่งของ (Delivery Note)</p>
                            <span className="text-xs text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-2 py-0.5 rounded">
                              {relatedDeliveryNote.deliveryNoteNo}
                            </span>
                            <span className="text-xs text-gray-700 dark:text-gray-200 bg-white/70 dark:bg-gray-800/40 px-2 py-0.5 rounded border border-blue-200/60 dark:border-blue-800/40">
                              {sourceType}
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
                                handleDownload("delivery-note", relatedDeliveryNote);
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
                          <div className="col-span-2 mt-2 pt-2 border-t border-blue-200/60 dark:border-blue-800/40">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2 text-sm">
                                <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                <span className="font-semibold text-blue-800 dark:text-blue-300">ใบกำกับภาษี/ใบเสร็จ</span>
                                <span className="text-xs text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-2 py-0.5 rounded">
                                  {relatedTaxInvoice ? relatedTaxInvoice.receiptNo : "-"}
                                </span>
                                {relatedTaxInvoice?.documentType && (
                                  <span className="text-xs text-gray-700 dark:text-gray-200 bg-white/70 dark:bg-gray-800/40 px-2 py-0.5 rounded border border-blue-200/60 dark:border-blue-800/40">
                                    {relatedTaxInvoice.documentType}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  disabled={!relatedTaxInvoice}
                                  onClick={() => {
                                    if (!relatedTaxInvoice) return;
                                    setSelectedTaxInvoice(relatedTaxInvoice);
                                    setShowTaxInvoiceModal(true);
                                  }}
                                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  ดูใบกำกับภาษี
                                </button>
                                <button
                                  disabled={!relatedTaxInvoice}
                                  onClick={() => {
                                    if (!relatedTaxInvoice) return;
                                    handleDownload("tax-invoice", relatedTaxInvoice);
                                  }}
                                  className="px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                  ดาวน์โหลด PDF
                                </button>
                              </div>
                            </div>
                            {!relatedTaxInvoice && (
                              <div className="mt-2 text-xs text-blue-700 dark:text-blue-400">
                                ยังไม่มีใบกำกับภาษี/ใบเสร็จผูกกับใบส่งของนี้
                              </div>
                            )}
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
                  const relatedTaxInvoice = findRelatedTaxInvoice({
                    branchName: selectedReceipt.branchName,
                    deliveryNoteNo: relatedDeliveryNote?.deliveryNoteNo,
                    purchaseOrderNo: selectedReceipt.purchaseOrderNo,
                  });
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
                              handleDownload("delivery-note", relatedDeliveryNote);
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
                        <div className="col-span-2 mt-2 pt-2 border-t border-indigo-200/60 dark:border-indigo-800/40">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 text-sm">
                              <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                              <span className="font-semibold text-indigo-800 dark:text-indigo-300">ใบกำกับภาษี/ใบเสร็จ</span>
                              <span className="text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/30 px-2 py-0.5 rounded">
                                {relatedTaxInvoice ? relatedTaxInvoice.receiptNo : "-"}
                              </span>
                              {relatedTaxInvoice?.documentType && (
                                <span className="text-xs text-gray-700 dark:text-gray-200 bg-white/70 dark:bg-gray-800/40 px-2 py-0.5 rounded border border-indigo-200/60 dark:border-indigo-800/40">
                                  {relatedTaxInvoice.documentType}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                disabled={!relatedTaxInvoice}
                                onClick={() => {
                                  if (!relatedTaxInvoice) return;
                                  setSelectedTaxInvoice(relatedTaxInvoice);
                                  setShowTaxInvoiceModal(true);
                                }}
                                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                ดูใบกำกับภาษี
                              </button>
                              <button
                                disabled={!relatedTaxInvoice}
                                onClick={() => {
                                  if (!relatedTaxInvoice) return;
                                  handleDownload("tax-invoice", relatedTaxInvoice);
                                }}
                                className="px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
                              >
                                <Download className="w-3.5 h-3.5" />
                                ดาวน์โหลด PDF
                              </button>
                            </div>
                          </div>
                          {!relatedTaxInvoice && (
                            <div className="mt-2 text-xs text-indigo-700 dark:text-indigo-400">
                              ยังไม่มีใบกำกับภาษี/ใบเสร็จสำหรับรายการนี้
                            </div>
                          )}
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
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      วันที่รับ *
                    </label>
                    <input
                      type="date"
                      value={receiveFormData.receiveDate}
                      onChange={(e) => setReceiveFormData({ ...receiveFormData, receiveDate: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      เวลารับ *
                    </label>
                    <input
                      type="time"
                      value={receiveFormData.receiveTime}
                      onChange={(e) => setReceiveFormData({ ...receiveFormData, receiveTime: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    ชื่อผู้รับ *
                  </label>
                  <input
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    รายการน้ำมันที่รับ
                  </label>
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
                          <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                            จำนวนที่รับจริง (ลิตร) *
                          </label>
                          <input
                            type="number"
                            value={item.quantityReceived}
                            onChange={(e) => {
                              const newItems = [...receiveFormData.items];
                              newItems[idx].quantityReceived = Number(e.target.value);
                              setReceiveFormData({ ...receiveFormData, items: newItems });
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
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                        API Gravity
                      </label>
                      <input
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
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                        Water Content (%)
                      </label>
                      <input
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
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                        Temperature (°C)
                      </label>
                      <input
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
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                        สี
                      </label>
                      <input
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
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                        ผลการตรวจสอบ
                      </label>
                      <select
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
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                        ผู้ตรวจสอบ
                      </label>
                      <input
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
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                      หมายเหตุการทดสอบ
                    </label>
                    <textarea
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    หมายเหตุ
                  </label>
                  <textarea
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
                                handleDownload("delivery-note", relatedDeliveryNote);
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
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      เหตุผลในการปฏิเสธ *
                    </label>
                    <textarea
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
                        handleDownload("delivery-note", selectedDeliveryNote);
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
                  {(selectedDeliveryNote.truckPlateNumber || selectedDeliveryNote.driverName || (selectedDeliveryNote as any).trailerPlateNumber || (selectedDeliveryNote as any).transportNo) && (
                    <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">ข้อมูลรถและคนขับ</p>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        {(selectedDeliveryNote as any).transportNo && (
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">เลขที่ขนส่ง:</span>
                            <span className="font-semibold text-gray-900 dark:text-white ml-2">{(selectedDeliveryNote as any).transportNo}</span>
                          </div>
                        )}
                        {selectedDeliveryNote.truckPlateNumber && (
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">รถหัวลาก:</span>
                            <span className="font-semibold text-gray-900 dark:text-white ml-2">{selectedDeliveryNote.truckPlateNumber}</span>
                          </div>
                        )}
                        {(selectedDeliveryNote as any).trailerPlateNumber && (
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">หางบรรทุก:</span>
                            <span className="font-semibold text-gray-900 dark:text-white ml-2">{(selectedDeliveryNote as any).trailerPlateNumber}</span>
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
                        {selectedDeliveryNote.items.map((item: any, idx: number) => (
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
                  {((selectedDeliveryNote as any).senderSignature || selectedDeliveryNote.signedBy || selectedDeliveryNote.receiverName || (selectedDeliveryNote as any).receiverSignature) && (
                    <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">ข้อมูลการส่งและรับ</p>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        {(selectedDeliveryNote as any).senderSignature && (
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">ลายมือชื่อผู้ส่ง:</span>
                            <span className="font-semibold text-gray-900 dark:text-white ml-2">{(selectedDeliveryNote as any).senderSignature}</span>
                          </div>
                        )}
                        {(selectedDeliveryNote as any).senderSignedAt && (
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">วันที่ส่ง:</span>
                            <span className="font-semibold text-gray-900 dark:text-white ml-2">
                              {dateFormatter.format(new Date((selectedDeliveryNote as any).senderSignedAt))}
                            </span>
                          </div>
                        )}
                        {selectedDeliveryNote.receiverName && (
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">ผู้รับ:</span>
                            <span className="font-semibold text-gray-900 dark:text-white ml-2">{selectedDeliveryNote.receiverName}</span>
                          </div>
                        )}
                        {(selectedDeliveryNote as any).receiverSignature && (
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">ลายมือชื่อผู้รับ:</span>
                            <span className="font-semibold text-gray-900 dark:text-white ml-2">{(selectedDeliveryNote as any).receiverSignature}</span>
                          </div>
                        )}
                        {(selectedDeliveryNote as any).receiverSignedAt && (
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">วันที่รับ:</span>
                            <span className="font-semibold text-gray-900 dark:text-white ml-2">
                              {dateFormatter.format(new Date((selectedDeliveryNote as any).receiverSignedAt))}
                            </span>
                          </div>
                        )}
                        {selectedDeliveryNote.signedAt && !(selectedDeliveryNote as any).receiverSignedAt && (
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

        {/* Tax Invoice / Receipt View Modal */}
        <AnimatePresence>
          {showTaxInvoiceModal && selectedTaxInvoice && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowTaxInvoiceModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        ใบกำกับภาษี/ใบเสร็จ
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {selectedTaxInvoice.documentType} • {selectedTaxInvoice.receiptNo}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDownload("tax-invoice", selectedTaxInvoice)}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      ดาวน์โหลด PDF
                    </button>
                    <button
                      onClick={() => setShowTaxInvoiceModal(false)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">เลขที่</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{selectedTaxInvoice.receiptNo}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">วันที่</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{selectedTaxInvoice.receiptDate}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">อ้างอิงใบส่งของ</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{selectedTaxInvoice.deliveryNoteNo || "-"}</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">ผู้ซื้อ/ผู้รับ</p>
                    <div className="text-sm text-gray-900 dark:text-white font-semibold">{selectedTaxInvoice.customerName}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">{selectedTaxInvoice.customerAddress}</div>
                  </div>

                  <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                    <table className="w-full">
                      <thead className="bg-gray-100 dark:bg-gray-700">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">รายการ</th>
                          <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300">จำนวน (ลิตร)</th>
                          <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300">ราคา/ลิตร</th>
                          <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300">จำนวนเงิน</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                        {selectedTaxInvoice.items.map((it, idx) => (
                          <tr key={idx}>
                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{it.oilType}</td>
                            <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">{numberFormatter.format(it.quantity)}</td>
                            <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">{it.pricePerLiter.toFixed(2)}</td>
                            <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">{currencyFormatter.format(it.totalAmount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex justify-end">
                    <div className="w-full max-w-sm bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">มูลค่าก่อน VAT</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{currencyFormatter.format(selectedTaxInvoice.totalAmount)}</span>
                      </div>
                      <div className="flex justify-between text-sm mt-1">
                        <span className="text-gray-600 dark:text-gray-400">VAT</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{currencyFormatter.format(selectedTaxInvoice.vatAmount)}</span>
                      </div>
                      <div className="flex justify-between text-sm mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                        <span className="text-gray-700 dark:text-gray-300 font-semibold">รวมทั้งสิ้น</span>
                        <span className="font-bold text-gray-900 dark:text-white">{currencyFormatter.format(selectedTaxInvoice.grandTotal)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </AnimatePresence>
    </div>
  );
}
