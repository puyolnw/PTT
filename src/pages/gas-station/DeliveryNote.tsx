import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";
import {
  FileText,
  Plus,
  Search,
  Download,
  CheckCircle,
  X,
  Save,
  Building2,
  Droplet,
  Truck,
  Eye,
  User,
  PenTool,
  Edit,
  Trash2,
} from "lucide-react";
import { useGasStation } from "@/contexts/GasStationContext";
import type { DeliveryNote, Receipt } from "@/types/gasStation";
import { convertNumberToThaiWords } from "@/utils/numberToThaiWords";

import { mockDrivers } from "@/data/mockData";

const currencyFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat("th-TH", {
  maximumFractionDigits: 0,
});

const getDriverById = (id: string) => {
  return mockDrivers.find(d => d.id.toString() === id || d.code === id);
};

export default function DeliveryNotePage() {
  const {
    deliveryNotes,
    quotations,
    purchaseOrders,
    transportDeliveries,
    branches,
    receipts,
    createDeliveryNote,
    updateDeliveryNote,
    deleteDeliveryNote,
    signDeliveryNote,
    createReceipt,
    getNextRunningNumber,
    getQuotationByNo,
    getOrderByNo,
    getTransportByNo,
    getBranchById,
  } = useGasStation();

  // const [filterBranch, setFilterBranch] = useState<number | "all">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "draft" | "sent" | "delivered" | "cancelled">("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showSignModal, setShowSignModal] = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [selectedDeliveryNote, setSelectedDeliveryNote] = useState<DeliveryNote | null>(null);
  const [isReceiverSign, setIsReceiverSign] = useState(false);
  const [signature, setSignature] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [receiveFormData, setReceiveFormData] = useState({
    receiverSignature: "",
    receiverName: "",
    notes: "",
    endOdometer: "",
  });

  // Form state for creating/editing delivery note
  const [formData, setFormData] = useState({
    purchaseOrderNo: "", // เลือกจาก PurchaseOrder
    billNo: "", // เลือกบิลจาก PurchaseOrder (ถ้ามีหลายบิล)
    selectedBranchId: "", // เลือกสาขาจาก PurchaseOrder
    quotationNo: "",
    transportNo: "",
    fromBranchId: 1,
    toBranchId: 2,
    truckId: "",
    trailerId: "",
    driverId: "",
    startOdometer: "",
    items: [] as Array<{
      id?: string;
      oilType: string;
      quantity: number;
      pricePerLiter: number;
      totalAmount: number;
    }>,
  });

  // Form state for adding/editing item
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);
  const [itemForm, setItemForm] = useState({
    oilType: "",
    quantity: "",
    pricePerLiter: "",
  });

  // Filter delivery notes
  const filteredDeliveryNotes = useMemo(() => {
    return deliveryNotes.filter((dn) => {
      const matchesSearch =
        dn.deliveryNoteNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dn.fromBranchName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dn.toBranchName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        false;
      const matchesStatus = filterStatus === "all" || dn.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [deliveryNotes, searchTerm, filterStatus]);

  // Statistics
  // const _relatedReceipts = useMemo(() => {
  //   if (!deliveryNotes) return [];
  //   return receipts.filter(r => deliveryNotes.some(bn => bn.receiptNo === r.receiptNo));
  // }, [deliveryNotes, receipts]);
  const stats = useMemo(() => {
    return {
      total: deliveryNotes.length,
      draft: deliveryNotes.filter((dn) => dn.status === "draft").length,
      sent: deliveryNotes.filter((dn) => dn.status === "sent").length,
      inTransit: 0, // in-transit status not in type definition
      delivered: deliveryNotes.filter((dn) => dn.status === "delivered").length,
      totalAmount: deliveryNotes.reduce((sum, dn) => sum + dn.totalAmount, 0),
    };
  }, [deliveryNotes]);

  // Handle create from Quotation - เลือกสาขาที่จะส่ง
  const [showQuotationBranchModal, setShowQuotationBranchModal] = useState(false);
  const [pendingQuotationNo, setPendingQuotationNo] = useState<string>("");

  const handleCreateFromQuotation = (quotationNo: string) => {
    const quotation = getQuotationByNo(quotationNo);
    if (!quotation) {
      alert("ไม่พบใบเสนอราคา");
      return;
    }

    // ถ้าใบเสนอราคามีหลายสาขา ให้เลือกสาขาก่อน
    if (quotation.branches && quotation.branches.length > 1) {
      setPendingQuotationNo(quotationNo);
      setShowQuotationBranchModal(true);
      return;
    }

    // ถ้ามีสาขาเดียวหรือไม่มี branches (backward compatibility)
    const branch = quotation.branches?.[0];
    if (branch) {
    setFormData({
        purchaseOrderNo: quotation.purchaseOrderNo || "",
        billNo: "",
        selectedBranchId: "",
        quotationNo,
        transportNo: "",
        fromBranchId: quotation.fromBranchId,
        toBranchId: branch.branchId,
        items: branch.items,
        truckId: "",
        trailerId: "",
        driverId: "",
        startOdometer: "",
      });
      setShowCreateModal(true);
    } else {
      // Backward compatibility: ถ้าไม่มี branches ใช้โครงสร้างเดิม
      setFormData({
      purchaseOrderNo: quotation.purchaseOrderNo || "",
        billNo: "",
        selectedBranchId: "",
        quotationNo,
      transportNo: "",
      fromBranchId: quotation.fromBranchId,
        toBranchId: (quotation as any).toBranchId || 2,
      items: quotation.items,
      truckId: "",
      trailerId: "",
      driverId: "",
      startOdometer: "",
    });
    setShowCreateModal(true);
    }
  };

  // Handle select branch from quotation
  const handleSelectQuotationBranch = (branchId: number) => {
    const quotation = getQuotationByNo(pendingQuotationNo);
    if (!quotation) return;

    const branch = quotation.branches?.find((b) => b.branchId === branchId);
    if (branch) {
      setFormData({
        purchaseOrderNo: quotation.purchaseOrderNo || "",
        billNo: "",
        selectedBranchId: branch.branchId.toString(),
        quotationNo: pendingQuotationNo,
        transportNo: "",
        fromBranchId: quotation.fromBranchId,
        toBranchId: branch.branchId,
        items: branch.items,
        truckId: "",
        trailerId: "",
        driverId: "",
        startOdometer: "",
      });
      setShowQuotationBranchModal(false);
      setPendingQuotationNo("");
      setShowCreateModal(true);
    }
  };

  // Handle create from Transport
  const handleCreateFromTransport = (transportNo: string) => {
    const transport = getTransportByNo(transportNo);
    if (!transport) {
      alert("ไม่พบรอบส่ง");
      return;
    }

    const items = transport.deliveryItems.map((item) => ({
      oilType: item.oilType,
      quantity: item.quantity,
      pricePerLiter: item.pricePerLiter,
      totalAmount: item.totalAmount,
    }));

    setFormData({
      purchaseOrderNo: "",
      billNo: "",
      selectedBranchId: "",
      quotationNo: "",
      fromBranchId: transport.sourceBranchId,
      toBranchId: transport.destinationBranchIds[0] || 1,
      items,
      transportNo: transportNo, // Use the passed transportNo
      truckId: transport.truckId || "",
      trailerId: transport.trailerId || "",
      driverId: transport.driverId || "",
      startOdometer: transport.startOdometer?.toString() || "",
    });
    setShowCreateModal(true);
  };

  // Handle save delivery note
  const handleSave = () => {
    if (!formData.purchaseOrderNo) {
      alert("กรุณาเลือกใบสั่งซื้อจากบันทึกใบเสนอราคาจากปตท.");
      return;
    }
    if (!formData.selectedBranchId) {
      alert("กรุณาเลือกปั๊ม (สาขา) ที่จะส่งของ");
      return;
    }
    if (formData.items.length === 0) {
      alert("กรุณาเลือกรายการสินค้า");
      return;
    }

    const deliveryNoteNo = getNextRunningNumber("delivery-note");
    const fromBranch = getBranchById(formData.fromBranchId);
    const toBranch = getBranchById(formData.toBranchId);

    if (!fromBranch || !toBranch) {
      alert("ไม่พบข้อมูลสาขา");
      return;
    }

    const totalAmount = formData.items.reduce((sum, item) => sum + item.totalAmount, 0);
    // const transport = formData.transportNo ? getTransportByNo(formData.transportNo) : null;

    const newDeliveryNote: DeliveryNote = {
      id: `DN-${Date.now()}`,
      deliveryNoteNo,
      deliveryDate: new Date().toISOString().split("T")[0],
      quotationNo: formData.quotationNo || undefined,
      purchaseOrderNo: formData.purchaseOrderNo, // ต้องมี PurchaseOrderNo
      fromBranchId: formData.fromBranchId,
      fromBranchName: fromBranch.name,
      toBranchId: formData.toBranchId,
      toBranchName: toBranch.name,
      items: formData.items.map((item, idx) => ({
        ...item,
        id: `item-${idx}`,
        oilType: item.oilType as DeliveryNote["items"][0]["oilType"],
      })),
      totalAmount,
      truckPlateNumber: formData.truckId || undefined,
      driverName: formData.driverId ? getDriverById(formData.driverId)?.name : undefined,
      status: "draft",
      createdAt: new Date().toISOString(),
      createdBy: "ผู้จัดการคลัง", // TODO: ดึงจาก session
    };

    createDeliveryNote(newDeliveryNote);
    setShowCreateModal(false);
    setFormData({
      purchaseOrderNo: "",
      billNo: "",
      selectedBranchId: "",
      quotationNo: "",
      transportNo: "",
      fromBranchId: 1,
      toBranchId: 2,
      items: [],
      truckId: "",
      trailerId: "",
      driverId: "",
      startOdometer: "",
    });
    alert("สร้างใบส่งของสำเร็จ!");
  };

  // Handle sign delivery note
  const handleSign = (deliveryNoteId: string, isReceiver: boolean) => {
    if (!signature.trim()) {
      alert("กรุณากรอกลายเซ็น");
      return;
    }

    signDeliveryNote(deliveryNoteId, signature, isReceiver);
    setShowSignModal(false);
    setSignature("");
    setSelectedDeliveryNote(null);
    alert(isReceiver ? "เซ็นรับของเรียบร้อย!" : "เซ็นส่งของเรียบร้อย!");
  };

  // Handle receive delivery note (ปั๊มย่อยรับของ)
  const handleReceiveDeliveryNote = (deliveryNote: DeliveryNote) => {
    setSelectedDeliveryNote(deliveryNote);
    setReceiveFormData({
      receiverSignature: "",
      receiverName: "",
      notes: "",
      endOdometer: "",
    });
    setShowReceiveModal(true);
  };

  // Handle confirm receive
  const handleConfirmReceive = () => {
    if (!selectedDeliveryNote) return;
    if (!receiveFormData.receiverSignature.trim()) {
      alert("กรุณากรอกลายเซ็นผู้รับ");
      return;
    }
    if (!receiveFormData.receiverName.trim()) {
      alert("กรุณากรอกชื่อผู้รับ");
      return;
    }

    const now = new Date().toISOString();
    updateDeliveryNote(selectedDeliveryNote.id, {
      signedBy: receiveFormData.receiverSignature,
      signedAt: now,
      receiverName: receiveFormData.receiverName,
      status: "delivered",
    });

    setShowReceiveModal(false);
    setSelectedDeliveryNote(null);
    setReceiveFormData({
      receiverSignature: "",
      receiverName: "",
      endOdometer: "",
      notes: "",
    });
    alert("รับของเรียบร้อย! สามารถออกใบเสร็จรับเงินได้แล้ว");
  };

  // Handle create receipt from delivery note
  const handleCreateReceiptFromDeliveryNote = (deliveryNote: DeliveryNote) => {
    // ตรวจสอบว่ามีใบเสร็จอยู่แล้วหรือไม่
    const existingReceipt = receipts.find((r) => r.deliveryNoteNo === deliveryNote.deliveryNoteNo);
    if (existingReceipt) {
      alert(`ใบส่งของนี้มีใบเสร็จรับเงินแล้ว: ${existingReceipt.receiptNo}`);
      return;
    }

    const toBranch = getBranchById(deliveryNote.toBranchId);
    if (!toBranch) {
      alert("ไม่พบข้อมูลสาขา");
      return;
    }

    // คำนวณ VAT
    const calculateVAT = (amount: number, vatRate: number = 7) => {
      const beforeVat = amount / (1 + vatRate / 100);
      const vat = amount - beforeVat;
      return {
        beforeVat: Math.round(beforeVat * 100) / 100,
        vat: Math.round(vat * 100) / 100,
        total: amount,
      };
    };

    const { vat } = calculateVAT(deliveryNote.totalAmount, 7);
    // const { beforeVat, vat } = calculateVAT(totalAmount, formData.vatRate);
    // const amountInWords = convertNumberToThaiWords(totalAmount);
    const amountInWords = convertNumberToThaiWords(deliveryNote.totalAmount);

    const receiptNo = getNextRunningNumber("receipt");

    const newReceipt: Receipt = {
      id: `REC-${Date.now()}`,
      receiptNo,
      receiptDate: new Date().toISOString().split("T")[0],
      documentType: "ใบเสร็จรับเงิน",
      customerName: toBranch.name,
      customerAddress: toBranch.address,
      customerTaxId: "", // TODO: ดึงจาก branch profile
      items: deliveryNote.items.map((item, idx) => ({
        id: `item-${idx}`,
        oilType: item.oilType as Receipt["items"][0]["oilType"],
        quantity: item.quantity,
        pricePerLiter: item.pricePerLiter,
        totalAmount: item.totalAmount,
      })),
      vatAmount: vat,
      totalAmount: deliveryNote.totalAmount,
      grandTotal: deliveryNote.totalAmount, // Assuming inclusive VAT or same as total for now
      amountInWords,
      purchaseOrderNo: deliveryNote.purchaseOrderNo || undefined,
      deliveryNoteNo: deliveryNote.deliveryNoteNo,
      quotationNo: deliveryNote.quotationNo || undefined,
      status: "draft",
      createdAt: new Date().toISOString(),
      createdBy: "ผู้จัดการสาขา", // TODO: ดึงจาก session
    };

    createReceipt(newReceipt);
    alert(`สร้างใบเสร็จรับเงินสำเร็จ! เลขที่: ${receiptNo}\nสามารถไปแก้ไขและออกใบเสร็จได้ที่หน้าใบเสร็จรับเงิน`);
  };

  // Handle view detail
  const handleViewDetail = (deliveryNote: DeliveryNote) => {
    setSelectedDeliveryNote(deliveryNote);
    setShowDetailModal(true);
  };

  // Handle edit delivery note
  const handleEdit = (deliveryNote: DeliveryNote) => {
    setSelectedDeliveryNote(deliveryNote);
    // หาสาขาจาก PurchaseOrder
    let selectedBranchId = "";
    let billNo = "";
    if (deliveryNote.purchaseOrderNo) {
      const purchaseOrder = getOrderByNo(deliveryNote.purchaseOrderNo);
      if (purchaseOrder) {
        billNo = purchaseOrder.billNo || "";
        const branch = purchaseOrder.branches.find((b) => b.branchId === deliveryNote.toBranchId);
        if (branch) {
          selectedBranchId = branch.branchId.toString();
        }
      }
    }
    setFormData({
      purchaseOrderNo: deliveryNote.purchaseOrderNo || "",
      billNo,
      selectedBranchId,
      quotationNo: deliveryNote.quotationNo || "",
      fromBranchId: deliveryNote.fromBranchId,
      toBranchId: deliveryNote.toBranchId,
      items: deliveryNote.items.map((item) => ({
        oilType: item.oilType,
        quantity: item.quantity,
        pricePerLiter: item.pricePerLiter,
        totalAmount: item.totalAmount,
      })),
      transportNo: deliveryNote.transportNo || "", // Ensure transportNo is set
      truckId: deliveryNote.truckPlateNumber || "",
      trailerId: deliveryNote.trailerPlateNumber || "",
      driverId: deliveryNote.driverName || "",
      startOdometer: deliveryNote.startOdometer?.toString() || "",
    });
    setIsEditing(true);
    setShowEditModal(true);
  };

  // Handle update delivery note
  const handleUpdate = () => {
    if (!selectedDeliveryNote) return;
    if (formData.items.length === 0) {
      alert("กรุณาเลือกรายการสินค้า");
      return;
    }

    const fromBranch = getBranchById(formData.fromBranchId);
    const toBranch = getBranchById(formData.toBranchId);

    if (!fromBranch || !toBranch) {
      alert("ไม่พบข้อมูลสาขา");
      return;
    }

    const totalAmount = formData.items.reduce((sum, item) => sum + item.totalAmount, 0);
    // const transport = formData.transportNo ? getTransportByNo(formData.transportNo) : null;

    updateDeliveryNote(selectedDeliveryNote.id, {
      quotationNo: formData.quotationNo || undefined,
      purchaseOrderNo: formData.purchaseOrderNo || undefined,
      fromBranchId: formData.fromBranchId,
      fromBranchName: fromBranch.name,
      toBranchId: formData.toBranchId,
      toBranchName: toBranch.name,
      items: formData.items.map((item, idx) => ({
        id: `item-${idx}`,
        oilType: item.oilType as DeliveryNote["items"][0]["oilType"],
        quantity: item.quantity,
        pricePerLiter: item.pricePerLiter,
        totalAmount: item.totalAmount,
      })),
      totalAmount,
      truckPlateNumber: undefined,
      driverName: undefined,
    });

    setShowEditModal(false);
    setIsEditing(false);
    setSelectedDeliveryNote(null);
    setFormData({
      purchaseOrderNo: "",
      billNo: "",
      selectedBranchId: "",
      quotationNo: "",
      transportNo: "",
      fromBranchId: 1,
      toBranchId: 2,
      items: [],
      truckId: "",
      trailerId: "",
      driverId: "",
      startOdometer: "",
    });
    alert("แก้ไขใบส่งของสำเร็จ!");
  };

  // Handle delete delivery note
  const handleDelete = (deliveryNoteId: string) => {
    if (window.confirm("คุณต้องการลบใบส่งของนี้หรือไม่?")) {
      deleteDeliveryNote(deliveryNoteId);
      alert("ลบใบส่งของสำเร็จ!");
    }
  };

  // Handle add item
  const handleAddItem = () => {
    setEditingItemIndex(null);
    setItemForm({ oilType: "", quantity: "", pricePerLiter: "" });
    setShowItemModal(true);
  };

  // Handle edit item
  const handleEditItem = (index: number) => {
    const item = formData.items[index];
    setEditingItemIndex(index);
    setItemForm({
      oilType: item.oilType,
      quantity: item.quantity.toString(),
      pricePerLiter: item.pricePerLiter.toString(),
    });
    setShowItemModal(true);
  };

  // Handle delete item
  const handleDeleteItem = (index: number) => {
    if (window.confirm("คุณต้องการลบรายการนี้หรือไม่?")) {
      const newItems = formData.items.filter((_, i) => i !== index);
      setFormData({ ...formData, items: newItems });
    }
  };

  // Handle save item
  const handleSaveItem = () => {
    if (!itemForm.oilType) {
      alert("กรุณาเลือกประเภทน้ำมัน");
      return;
    }
    if (!itemForm.quantity || parseFloat(itemForm.quantity) <= 0) {
      alert("กรุณากรอกจำนวนลิตร");
      return;
    }
    if (!itemForm.pricePerLiter || parseFloat(itemForm.pricePerLiter) <= 0) {
      alert("กรุณากรอกราคาต่อลิตร");
      return;
    }

    const quantity = parseFloat(itemForm.quantity);
    const pricePerLiter = parseFloat(itemForm.pricePerLiter);
    const totalAmount = quantity * pricePerLiter;

    const newItem = {
      oilType: itemForm.oilType,
      quantity,
      pricePerLiter,
      totalAmount,
    };

    if (editingItemIndex !== null) {
      // Edit existing item
      const newItems = [...formData.items];
      newItems[editingItemIndex] = newItem;
      setFormData({ ...formData, items: newItems });
    } else {
      // Add new item
      setFormData({ ...formData, items: [...formData.items, newItem] });
    }

    setShowItemModal(false);
    setEditingItemIndex(null);
    setItemForm({ oilType: "", quantity: "", pricePerLiter: "" });
  };

  const getStatusColor = (status: DeliveryNote["status"]) => {
    switch (status) {
      case "draft":
        return "text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700";
      case "sent":
        return "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800";
      case "delivered":
        return "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800";
      case "cancelled":
        return "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800";
      default:
        return "text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700";
    }
  };

  const getStatusLabel = (status: DeliveryNote["status"]) => {
    switch (status) {
      case "draft":
        return "ร่าง";
      case "sent":
        return "ส่งแล้ว";
      case "delivered":
        return "ส่งถึงแล้ว";
      case "cancelled":
        return "ยกเลิก";
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2 flex items-center gap-3">
                <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                ใบส่งของ
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                จัดการใบส่งของสำหรับการส่งน้ำมันระหว่างสาขา
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              สร้างใบส่งของ
            </button>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">ทั้งหมด</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats.total}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">ร่าง</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats.draft}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">ส่งแล้ว</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.sent}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">ระหว่างขนส่ง</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.inTransit}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">ส่งถึงแล้ว</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.delivered}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">มูลค่ารวม</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {currencyFormatter.format(stats.totalAmount)}
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="ค้นหาเลขที่ใบส่งของ, สาขา, เลขที่ขนส่ง..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
                className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">ทั้งหมด</option>
                <option value="draft">ร่าง</option>
                <option value="sent">ส่งแล้ว</option>
                <option value="in-transit">ระหว่างขนส่ง</option>
                <option value="delivered">ส่งถึงแล้ว</option>
                <option value="cancelled">ยกเลิก</option>
              </select>
            </div>
          </div>
        </div>

        {/* Delivery Notes List */}
        {filteredDeliveryNotes.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center border border-gray-200 dark:border-gray-700">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              {deliveryNotes.length === 0 ? "ยังไม่มีใบส่งของ" : "ไม่พบใบส่งของที่ค้นหา"}
            </p>
            {deliveryNotes.length === 0 && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-4 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
              >
                สร้างใบส่งของแรก
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredDeliveryNotes.map((deliveryNote) => (
              <motion.div
                key={deliveryNote.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                        เลขที่: {deliveryNote.deliveryNoteNo}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(deliveryNote.status)}`}
                      >
                        {getStatusLabel(deliveryNote.status)}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">จาก</p>
                          <p className="font-semibold text-gray-800 dark:text-white">
                            {deliveryNote.fromBranchName}
                          </p>
                        </div>
                        <span className="text-gray-400">→</span>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">ไป</p>
                          <p className="font-semibold text-gray-800 dark:text-white">
                            {deliveryNote.toBranchName}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">วันที่</p>
                          <p className="font-semibold text-gray-800 dark:text-white">
                            {new Date(deliveryNote.deliveryDate).toLocaleDateString("th-TH")}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">มูลค่ารวม</p>
                          <p className="font-semibold text-green-600 dark:text-green-400">
                            {currencyFormatter.format(deliveryNote.totalAmount)}
                          </p>
                        </div>
                      </div>
                    </div>
                    {deliveryNote.truckPlateNumber && (
                      <div className="flex items-center gap-4 mb-3 text-sm">
                        <div className="flex items-center gap-1">
                          <Truck className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600 dark:text-gray-400">
                            {deliveryNote.truckPlateNumber}
                          </span>
                        </div>
                        {deliveryNote.driverName && (
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-600 dark:text-gray-400">
                              {deliveryNote.driverName}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {deliveryNote.items.map((item, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg text-sm"
                        >
                          <Droplet className="inline h-4 w-4 mr-1" />
                          {item.oilType}: {numberFormatter.format(item.quantity)} ลิตร
                        </span>
                      ))}
                    </div>
                    {/* Signature Status */}
                    <div className="mt-4 flex items-center gap-4 text-sm">
                      {deliveryNote.senderSignature ? (
                        <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                          <CheckCircle className="h-4 w-4" />
                          <span>ผู้ส่งเซ็นแล้ว</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-gray-400">
                          <PenTool className="h-4 w-4" />
                          <span>รอผู้ส่งเซ็น</span>
                        </div>
                      )}
                      {deliveryNote.signedBy ? (
                        <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                          <CheckCircle className="h-4 w-4" />
                          <span>ผู้รับเซ็นแล้ว</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-gray-400">
                          <PenTool className="h-4 w-4" />
                          <span>รอผู้รับเซ็น</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleViewDetail(deliveryNote)}
                      className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      ดูรายละเอียด
                    </button>
                    {deliveryNote.status === "draft" && (
                      <button
                        onClick={() => handleEdit(deliveryNote)}
                        className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors flex items-center gap-2"
                      >
                        <Edit className="w-4 h-4" />
                        แก้ไข
                      </button>
                    )}
                    {deliveryNote.status === "draft" && (
                      <button
                        onClick={() => handleDelete(deliveryNote.id)}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        ลบ
                      </button>
                    )}
                    {deliveryNote.status === "sent" ? (
                      !deliveryNote.signedBy ? (
                        <button
                          onClick={() => handleReceiveDeliveryNote(deliveryNote)}
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          รับของ
                        </button>
                      ) : null
                    ) : deliveryNote.status === "delivered" && !deliveryNote.signedBy ? (
                      <button
                        onClick={() => handleReceiveDeliveryNote(deliveryNote)}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        รับของ
                      </button>
                    ) : null}
                    {deliveryNote.status === "delivered" && deliveryNote.signedBy && (
                      <>
                        {!receipts.find((r) => r.deliveryNoteNo === deliveryNote.deliveryNoteNo) ? (
                          <button
                            onClick={() => handleCreateReceiptFromDeliveryNote(deliveryNote)}
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2"
                          >
                            <FileText className="w-4 h-4" />
                            ออกใบเสร็จรับเงิน
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              const receipt = receipts.find((r) => r.deliveryNoteNo === deliveryNote.deliveryNoteNo);
                              if (receipt) {
                                alert(`ใบส่งของนี้มีใบเสร็จรับเงินแล้ว: ${receipt.receiptNo}`);
                              }
                            }}
                            className="px-4 py-2 bg-gray-400 text-white rounded-lg transition-colors flex items-center gap-2 cursor-not-allowed"
                            disabled
                          >
                            <CheckCircle className="w-4 h-4" />
                            มีใบเสร็จแล้ว
                          </button>
                        )}
                      </>
                    )}
                    {!deliveryNote.signedBy && deliveryNote.status !== "delivered" && (
                      <button
                        onClick={() => {
                          setSelectedDeliveryNote(deliveryNote);
                          setIsReceiverSign(true);
                          setShowSignModal(true);
                        }}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
                      >
                        <PenTool className="w-4 h-4" />
                        {"เซ็นรับ"}
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Create from Quotation or Transport */}
        {(quotations.filter((q) => q.status === "confirmed").length > 0 ||
          transportDeliveries.filter((t) => t.status === "กำลังขนส่ง").length > 0) && (
          <div className="mt-8">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
              สร้างใบส่งของจาก
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* From Quotations */}
              {quotations.filter((q) => q.status === "confirmed").length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    ใบเสนอราคาที่ยืนยันแล้ว
                  </h3>
                  <div className="space-y-2">
                    {quotations
                      .filter((q) => q.status === "confirmed")
                      .slice(0, 3)
                      .map((quotation) => {
                        // แสดงข้อมูลหลายสาขาถ้ามี
                        const branches = quotation.branches || [];
                        const hasMultipleBranches = branches.length > 1;
                        
                        return (
                        <button
                          key={quotation.id}
                          onClick={() => handleCreateFromQuotation(quotation.quotationNo)}
                          className="w-full p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-left"
                        >
                          <p className="font-semibold text-gray-800 dark:text-white">
                            {quotation.quotationNo}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                              {quotation.fromBranchName} → {hasMultipleBranches 
                                ? `${branches.length} สาขา` 
                                : ((quotation as any).toBranchName || branches[0]?.branchName || "หลายสาขา")}
                          </p>
                            {hasMultipleBranches && (
                              <div className="mt-2 space-y-1">
                                {branches.map((branch, idx) => (
                                  <div key={idx} className="text-xs text-gray-600 dark:text-gray-400">
                                    • {branch.branchName}: {branch.items.map(i => `${i.oilType} ${numberFormatter.format(i.quantity)}L`).join(", ")}
                                  </div>
                                ))}
                              </div>
                            )}
                            <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                            {currencyFormatter.format(quotation.totalAmount)}
                          </p>
                        </button>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* From Transport */}
              {transportDeliveries.filter((t) => t.status === "กำลังขนส่ง").length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    รอบส่งที่กำลังขนส่ง
                  </h3>
                  <div className="space-y-2">
                    {transportDeliveries
                      .filter((t) => t.status === "กำลังขนส่ง")
                      .slice(0, 3)
                      .map((transport) => (
                        <button
                          key={transport.id}
                          onClick={() => handleCreateFromTransport(transport.transportNo)}
                          className="w-full p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-left"
                        >
                          <p className="font-semibold text-gray-800 dark:text-white">
                            {transport.transportNo}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {transport.sourceBranchName} → {transport.destinationBranchNames.join(", ")}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {transport.truckPlateNumber} - {transport.driverName}
                          </p>
                        </button>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {(showCreateModal || showEditModal) && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowCreateModal(false);
                setShowEditModal(false);
                setIsEditing(false);
                setSelectedDeliveryNote(null);
                setFormData({
                  purchaseOrderNo: "",
                  billNo: "",
                  selectedBranchId: "",
                  quotationNo: "",
                  transportNo: "",
                  fromBranchId: 1,
                  toBranchId: 2,
                  items: [],
                  truckId: "",
                  trailerId: "",
                  driverId: "",
                  startOdometer: "",
                });
              }}
              className="fixed inset-0 bg-black/50 z-50"
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
              >
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                    {isEditing ? "แก้ไขใบส่งของ" : "สร้างใบส่งของ"}
                  </h2>
                  <button
                    onClick={() => {
                      setShowCreateModal(false);
                      setShowEditModal(false);
                      setIsEditing(false);
                      setSelectedDeliveryNote(null);
                      setFormData({
                        purchaseOrderNo: "",
                        billNo: "",
                        selectedBranchId: "",
                        quotationNo: "",
                        transportNo: "",
                        fromBranchId: 1,
                        toBranchId: 2,
                        items: [],
                        truckId: "",
                        trailerId: "",
                        driverId: "",
                        startOdometer: "",
                      });
                    }}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <X className="h-5 w-5 text-gray-500" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="space-y-4">
                    {/* เลือก Purchase Order จากบันทึกใบเสนอราคาจากปตท. */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        เลือกใบสั่งซื้อจากบันทึกใบเสนอราคาจากปตท. *
                      </label>
                      <select
                        value={formData.purchaseOrderNo}
                        onChange={(e) => {
                          const orderNo = e.target.value;
                          const purchaseOrder = getOrderByNo(orderNo);
                          if (purchaseOrder) {
                            // ตั้งค่าเริ่มต้นจาก PurchaseOrder - ดึงข้อมูลทั้งหมดมา
                            setFormData({
                              ...formData,
                              purchaseOrderNo: orderNo,
                              billNo: purchaseOrder.billNo || "", // ตั้งค่า billNo ถ้ามี
                              selectedBranchId: "",
                              fromBranchId: 1, // TODO: ดึงจาก context หรือตั้งค่าเริ่มต้น
                              toBranchId: 2,
                              items: [],
                            });
                          } else {
                            setFormData({
                              ...formData,
                              purchaseOrderNo: orderNo,
                              billNo: "",
                              selectedBranchId: "",
                              items: [],
                            });
                          }
                        }}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                      >
                        <option value="">-- เลือกใบสั่งซื้อ --</option>
                        {purchaseOrders
                          .filter((po) => po.status !== "ยกเลิก")
                          .map((po) => (
                            <option key={po.orderNo} value={po.orderNo}>
                              {po.orderNo} {po.billNo ? `(บิล: ${po.billNo})` : ""} - {po.orderDate} - {currencyFormatter.format(po.totalAmount)}
                            </option>
                          ))}
                      </select>
                      {formData.purchaseOrderNo && (() => {
                        const purchaseOrder = getOrderByNo(formData.purchaseOrderNo);
                        if (purchaseOrder) {
                          return (
                            <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                              <p className="text-xs font-semibold text-blue-800 dark:text-blue-300 mb-2">
                                ใบสั่งซื้อ: {purchaseOrder.orderNo}
                              </p>
                              {purchaseOrder.billNo && (
                                <p className="text-xs text-blue-700 dark:text-blue-400">
                                  บิล: {purchaseOrder.billNo}
                                </p>
                              )}
                              {purchaseOrder.supplierOrderNo && (
                                <p className="text-xs text-blue-700 dark:text-blue-400">
                                  เลขที่สั่งซื้อผู้ขาย: {purchaseOrder.supplierOrderNo}
                                </p>
                              )}
                              <p className="text-xs text-blue-700 dark:text-blue-400">
                                วันที่: {purchaseOrder.orderDate} | วันที่ส่ง: {purchaseOrder.deliveryDate}
                              </p>
                              <p className="text-xs text-blue-700 dark:text-blue-400">
                                มูลค่ารวม: {currencyFormatter.format(purchaseOrder.totalAmount)}
                              </p>
                              <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                                มี {purchaseOrder.branches.length} สาขา
                              </p>
                              {/* แสดงรายการสาขาทั้งหมด */}
                              <div className="mt-2 pt-2 border-t border-blue-200 dark:border-blue-800">
                                <p className="text-xs font-semibold text-blue-800 dark:text-blue-300 mb-1">
                                  รายการสาขาทั้งหมด:
                                </p>
                                <div className="space-y-1 max-h-32 overflow-y-auto">
                                  {purchaseOrder.branches.map((branch, idx) => (
                                    <div key={idx} className="text-xs text-blue-700 dark:text-blue-400">
                                      • {branch.branchName} - {currencyFormatter.format(branch.totalAmount)} ({branch.items.length} รายการ)
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      })()}
                    </div>

                    {/* แสดงบิล (ถ้ามี) */}
                    {formData.purchaseOrderNo && (() => {
                      const purchaseOrder = getOrderByNo(formData.purchaseOrderNo);
                      if (purchaseOrder && purchaseOrder.billNo) {
                        return (
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                              บิล
                            </label>
                            <div className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-white">
                              {purchaseOrder.billNo}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })()}

                    {/* เลือกปั๊ม (สาขา) จาก PurchaseOrder */}
                    {formData.purchaseOrderNo && (() => {
                      const purchaseOrder = getOrderByNo(formData.purchaseOrderNo);
                      if (purchaseOrder && purchaseOrder.branches.length > 0) {
                        return (
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                              เลือกปั๊ม (สาขา) ที่จะส่งของ *
                            </label>
                            <select
                              value={formData.selectedBranchId}
                              onChange={(e) => {
                                const branchId = parseInt(e.target.value);
                                const branch = purchaseOrder.branches.find((b) => b.branchId === branchId);
                                if (branch) {
                                  // ดึงข้อมูลทั้งหมดจาก PurchaseOrder มาแสดง
                                  setFormData({
                                    ...formData,
                                    selectedBranchId: e.target.value,
                                    billNo: purchaseOrder.billNo || "",
                                    toBranchId: branch.branchId,
                                    items: branch.items.map((item) => ({
                                      oilType: item.oilType,
                                      quantity: item.quantity,
                                      pricePerLiter: item.pricePerLiter,
                                      totalAmount: item.totalAmount,
                                    })),
                                  });
                                }
                              }}
                              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                            >
                              <option value="">-- เลือกปั๊ม (สาขา) --</option>
                              {purchaseOrder.branches.map((branch) => (
                                <option key={branch.branchId} value={branch.branchId}>
                                  {branch.branchName} - {currencyFormatter.format(branch.totalAmount)} ({branch.items.length} รายการ)
                                </option>
                              ))}
                            </select>
                            {formData.selectedBranchId && (() => {
                              const selectedBranch = purchaseOrder.branches.find(
                                (b) => b.branchId === parseInt(formData.selectedBranchId)
                              );
                              if (selectedBranch) {
                                return (
                                  <div className="mt-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                                    <p className="text-xs font-semibold text-green-800 dark:text-green-300 mb-2">
                                      ปั๊ม (สาขา): {selectedBranch.branchName}
                                    </p>
                                    <p className="text-xs text-green-700 dark:text-green-400">
                                      นิติบุคคล: {selectedBranch.legalEntityName}
                                    </p>
                                    <p className="text-xs text-green-700 dark:text-green-400">
                                      ที่อยู่: {selectedBranch.address}
                                    </p>
                                    <div className="mt-2 pt-2 border-t border-green-200 dark:border-green-800">
                                      <p className="text-xs font-semibold text-green-800 dark:text-green-300 mb-1">
                                        รายการน้ำมันทั้งหมด:
                                      </p>
                                      <div className="space-y-1">
                                        {selectedBranch.items.map((item, idx) => (
                                          <div key={idx} className="text-xs text-green-700 dark:text-green-400 flex items-center justify-between">
                                            <span>
                                              <Droplet className="inline h-3 w-3 mr-1" />
                                              {item.oilType}
                                            </span>
                                            <span className="font-semibold">
                                              {numberFormatter.format(item.quantity)} ลิตร × {currencyFormatter.format(item.pricePerLiter)} = {currencyFormatter.format(item.totalAmount)}
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                    <p className="text-xs font-semibold text-green-800 dark:text-green-300 mt-2 pt-2 border-t border-green-200 dark:border-green-800">
                                      รวมทั้งสิ้น: {currencyFormatter.format(selectedBranch.totalAmount)}
                                    </p>
                                  </div>
                                );
                              }
                              return null;
                            })()}
                          </div>
                        );
                      }
                      return null;
                    })()}

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        จากสาขา
                      </label>
                      <select
                        value={formData.fromBranchId}
                        onChange={(e) => setFormData({ ...formData, fromBranchId: parseInt(e.target.value) })}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
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
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        ไปสาขา
                      </label>
                      <select
                        value={formData.toBranchId}
                        onChange={(e) => setFormData({ ...formData, toBranchId: parseInt(e.target.value) })}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                        disabled={!!formData.selectedBranchId}
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
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                          รายการสินค้า
                        </label>
                        <button
                          type="button"
                          onClick={handleAddItem}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors flex items-center gap-1"
                        >
                          <Plus className="w-4 h-4" />
                          เพิ่มรายการ
                        </button>
                      </div>
                      {formData.items.length > 0 ? (
                        <div className="space-y-2">
                          {formData.items.map((item, idx) => (
                            <div
                              key={idx}
                              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700/50"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <p className="font-semibold text-gray-800 dark:text-white">{item.oilType}</p>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {numberFormatter.format(item.quantity)} ลิตร ×{" "}
                                    {currencyFormatter.format(item.pricePerLiter)} ={" "}
                                    {currencyFormatter.format(item.totalAmount)}
                                  </p>
                                </div>
                                <div className="flex gap-2 ml-4">
                                  <button
                                    type="button"
                                    onClick={() => handleEditItem(idx)}
                                    className="px-3 py-1.5 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-sm transition-colors flex items-center gap-1"
                                  >
                                    <Edit className="w-3 h-3" />
                                    แก้ไข
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteItem(idx)}
                                    className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors flex items-center gap-1"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                    ลบ
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-center text-gray-500 dark:text-gray-400">
                          ยังไม่มีรายการสินค้า
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-3 px-6 py-5 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => {
                      setShowCreateModal(false);
                      setShowEditModal(false);
                      setIsEditing(false);
                      setSelectedDeliveryNote(null);
                      setFormData({
                        purchaseOrderNo: "",
                        billNo: "",
                        selectedBranchId: "",
                        quotationNo: "",
                        transportNo: "",
                        fromBranchId: 1,
                        toBranchId: 2,
                        items: [],
                        truckId: "",
                        trailerId: "",
                        driverId: "",
                        startOdometer: "",
                      });
                    }}
                    className="px-6 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    ยกเลิก
                  </button>
                  {formData.items.length > 0 && (
                    <button
                      onClick={isEditing ? handleUpdate : handleSave}
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      {isEditing ? "บันทึกการแก้ไข" : "บันทึก"}
                    </button>
                  )}
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Detail Modal */}
      <AnimatePresence>
        {showDetailModal && selectedDeliveryNote && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDetailModal(false)}
              className="fixed inset-0 bg-black/50 z-50"
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
              >
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                    รายละเอียดใบส่งของ: {selectedDeliveryNote.deliveryNoteNo}
                  </h2>
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <X className="h-5 w-5 text-gray-500" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">จากสาขา</p>
                        <p className="font-semibold text-gray-800 dark:text-white">
                          {selectedDeliveryNote.fromBranchName}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">ไปสาขา</p>
                        <p className="font-semibold text-gray-800 dark:text-white">
                          {selectedDeliveryNote.toBranchName}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">วันที่</p>
                        <p className="font-semibold text-gray-800 dark:text-white">
                          {new Date(selectedDeliveryNote.deliveryDate).toLocaleDateString("th-TH", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">สถานะ</p>
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(selectedDeliveryNote.status)}`}
                        >
                          {getStatusLabel(selectedDeliveryNote.status)}
                        </span>
                      </div>
                    </div>
                    {selectedDeliveryNote.truckPlateNumber && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">รถ</p>
                          <p className="font-semibold text-gray-800 dark:text-white">
                            {selectedDeliveryNote.truckPlateNumber}
                          </p>
                        </div>
                        {selectedDeliveryNote.driverName && (
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">คนขับ</p>
                            <p className="font-semibold text-gray-800 dark:text-white">
                              {selectedDeliveryNote.driverName}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">รายการสินค้า</h3>
                      <div className="space-y-2">
                        {selectedDeliveryNote.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700/50"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-semibold text-gray-800 dark:text-white">{item.oilType}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {numberFormatter.format(item.quantity)} ลิตร ×{" "}
                                  {currencyFormatter.format(item.pricePerLiter)}
                                </p>
                              </div>
                              <p className="font-semibold text-green-600 dark:text-green-400">
                                {currencyFormatter.format(item.totalAmount)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <p className="text-lg font-semibold text-gray-800 dark:text-white">ยอดรวมสุทธิ</p>
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {currencyFormatter.format(selectedDeliveryNote.totalAmount)}
                      </p>
                    </div>
                    {/* Signatures */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          ลายเซ็นผู้ส่ง (ต้นทาง)
                        </p>
                        {selectedDeliveryNote.status === "sent" ? (
                          <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                            <CheckCircle className="h-5 w-5" />
                            <span>ส่งแล้ว</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-gray-400">
                            <PenTool className="h-5 w-5" />
                            <span>รอส่ง</span>
                          </div>
                        )}
                      </div>
                      <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          ลายเซ็นผู้รับ (ปลายทาง)
                        </p>
                        {selectedDeliveryNote.signedBy ? (
                          <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                            <CheckCircle className="h-5 w-5" />
                            <span>เซ็นแล้ว</span>
                            {selectedDeliveryNote.signedAt && (
                              <span className="text-xs text-gray-500">
                                {new Date(selectedDeliveryNote.signedAt).toLocaleString("th-TH")}
                              </span>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-gray-400">
                            <PenTool className="h-5 w-5" />
                            <span>รอเซ็น</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-3 px-6 py-5 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="px-6 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    ปิด
                  </button>
                  {selectedDeliveryNote.status === "draft" && (
                    <button
                      onClick={() => {
                        setShowDetailModal(false);
                        handleEdit(selectedDeliveryNote);
                      }}
                      className="px-6 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      แก้ไข
                    </button>
                  )}
                  {selectedDeliveryNote.status === "draft" && (
                    <button
                      onClick={() => {
                        setShowDetailModal(false);
                        handleDelete(selectedDeliveryNote.id);
                      }}
                      className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      ลบ
                    </button>
                  )}
                  {selectedDeliveryNote.status === "sent" && !selectedDeliveryNote.signedBy && (
                    <button
                      onClick={() => {
                        setShowDetailModal(false);
                        handleReceiveDeliveryNote(selectedDeliveryNote);
                      }}
                      className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      รับของ
                    </button>
                  )}
                  {selectedDeliveryNote.status === "delivered" && selectedDeliveryNote.signedBy && (
                    <>
                      {!receipts.find((r) => r.deliveryNoteNo === selectedDeliveryNote.deliveryNoteNo) ? (
                        <button
                          onClick={() => {
                            setShowDetailModal(false);
                            handleCreateReceiptFromDeliveryNote(selectedDeliveryNote);
                          }}
                          className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
                        >
                          <FileText className="w-4 h-4" />
                          ออกใบเสร็จรับเงิน
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            const receipt = receipts.find((r) => r.deliveryNoteNo === selectedDeliveryNote.deliveryNoteNo);
                            if (receipt) {
                              alert(`ใบส่งของนี้มีใบเสร็จรับเงินแล้ว: ${receipt.receiptNo}`);
                            }
                          }}
                          className="px-6 py-2 bg-gray-400 text-white rounded-lg font-semibold transition-colors flex items-center gap-2 cursor-not-allowed"
                          disabled
                        >
                          <CheckCircle className="w-4 h-4" />
                          มีใบเสร็จแล้ว
                        </button>
                      )}
                    </>
                  )}
                  {!selectedDeliveryNote.signedBy && selectedDeliveryNote.status !== "delivered" && (
                    <button
                      onClick={() => {
                        setIsReceiverSign(true);
                        setShowSignModal(true);
                      }}
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
                    >
                      <PenTool className="w-4 h-4" />
                      เซ็นรับ
                    </button>
                  )}
                  <button className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    ดาวน์โหลด PDF
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Sign Modal */}
      <AnimatePresence>
        {showSignModal && selectedDeliveryNote && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSignModal(false)}
              className="fixed inset-0 bg-black/50 z-50"
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full"
              >
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                    {isReceiverSign ? "เซ็นรับของ" : "เซ็นส่งของ"}
                  </h2>
                  <button
                    onClick={() => setShowSignModal(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <X className="h-5 w-5 text-gray-500" />
                  </button>
                </div>
                <div className="p-6">
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      กรอกลายเซ็น
                    </label>
                    <input
                      type="text"
                      value={signature}
                      onChange={(e) => setSignature(e.target.value)}
                      placeholder="กรอกชื่อ-นามสกุล"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowSignModal(false)}
                      className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      ยกเลิก
                    </button>
                    <button
                      onClick={() => handleSign(selectedDeliveryNote.id, isReceiverSign)}
                      className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                    >
                      ยืนยัน
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Add/Edit Item Modal */}
      <AnimatePresence>
        {showItemModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowItemModal(false);
                setEditingItemIndex(null);
                setItemForm({ oilType: "", quantity: "", pricePerLiter: "" });
              }}
              className="fixed inset-0 bg-black/50 z-50"
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full"
              >
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                    {editingItemIndex !== null ? "แก้ไขรายการสินค้า" : "เพิ่มรายการสินค้า"}
                  </h2>
                  <button
                    onClick={() => {
                      setShowItemModal(false);
                      setEditingItemIndex(null);
                      setItemForm({ oilType: "", quantity: "", pricePerLiter: "" });
                    }}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <X className="h-5 w-5 text-gray-500" />
                  </button>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      ประเภทน้ำมัน *
                    </label>
                    <select
                      value={itemForm.oilType}
                      onChange={(e) => setItemForm({ ...itemForm, oilType: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">เลือกประเภทน้ำมัน</option>
                      <option value="Premium Diesel">Premium Diesel</option>
                      <option value="Diesel">Diesel</option>
                      <option value="Premium Gasohol 95">Premium Gasohol 95</option>
                      <option value="Gasohol 95">Gasohol 95</option>
                      <option value="Gasohol 91">Gasohol 91</option>
                      <option value="E20">E20</option>
                      <option value="E85">E85</option>
                      <option value="Gasohol E20">Gasohol E20</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      จำนวนลิตร *
                    </label>
                    <input
                      type="number"
                      value={itemForm.quantity}
                      onChange={(e) => setItemForm({ ...itemForm, quantity: e.target.value })}
                      placeholder="กรอกจำนวนลิตร"
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      ราคาต่อลิตร (บาท) *
                    </label>
                    <input
                      type="number"
                      value={itemForm.pricePerLiter}
                      onChange={(e) => setItemForm({ ...itemForm, pricePerLiter: e.target.value })}
                      placeholder="กรอกราคาต่อลิตร"
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  {itemForm.quantity && itemForm.pricePerLiter && (
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">ยอดรวม</p>
                      <p className="text-lg font-bold text-green-600 dark:text-green-400">
                        {currencyFormatter.format(parseFloat(itemForm.quantity) * parseFloat(itemForm.pricePerLiter))}
                      </p>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-end gap-3 px-6 py-5 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => {
                      setShowItemModal(false);
                      setEditingItemIndex(null);
                      setItemForm({ oilType: "", quantity: "", pricePerLiter: "" });
                    }}
                    className="px-6 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    ยกเลิก
                  </button>
                  <button
                    onClick={handleSaveItem}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {editingItemIndex !== null ? "บันทึกการแก้ไข" : "เพิ่มรายการ"}
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Receive Delivery Note Modal */}
      <AnimatePresence>
        {showReceiveModal && selectedDeliveryNote && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowReceiveModal(false);
                setSelectedDeliveryNote(null);
                setReceiveFormData({
                  receiverSignature: "",
                  receiverName: "",
                  endOdometer: "",
                  notes: "",
                });
              }}
              className="fixed inset-0 bg-black/50 z-50"
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
              >
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                    รับของ: {selectedDeliveryNote.deliveryNoteNo}
                  </h2>
                  <button
                    onClick={() => {
                      setShowReceiveModal(false);
                      setSelectedDeliveryNote(null);
                      setReceiveFormData({
                        receiverSignature: "",
                        receiverName: "",
                        endOdometer: "",
                        notes: "",
                      });
                    }}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <X className="h-5 w-5 text-gray-500" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="space-y-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <p className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2">
                        ข้อมูลใบส่งของ
                      </p>
                      <p className="text-sm text-blue-700 dark:text-blue-400">
                        จาก: {selectedDeliveryNote.fromBranchName} → ไป: {selectedDeliveryNote.toBranchName}
                      </p>
                      <div className="mt-2 space-y-1">
                        {selectedDeliveryNote.items.map((item, idx) => (
                          <div key={idx} className="text-xs text-blue-700 dark:text-blue-400">
                            • {item.oilType}: {numberFormatter.format(item.quantity)} ลิตร
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        ชื่อผู้รับ * (ลายเซ็น)
                      </label>
                      <input
                        type="text"
                        value={receiveFormData.receiverName}
                        onChange={(e) => setReceiveFormData({ ...receiveFormData, receiverName: e.target.value })}
                        placeholder="กรอกชื่อ-นามสกุลผู้รับ"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        ลายเซ็นผู้รับ *
                      </label>
                      <input
                        type="text"
                        value={receiveFormData.receiverSignature}
                        onChange={(e) => setReceiveFormData({ ...receiveFormData, receiverSignature: e.target.value })}
                        placeholder="กรอกลายเซ็น (ชื่อ-นามสกุล)"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    {selectedDeliveryNote.startOdometer && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          เลขไมล์สิ้นสุด (กม.)
                        </label>
                        <input
                          type="number"
                          value={receiveFormData.endOdometer}
                          onChange={(e) => setReceiveFormData({ ...receiveFormData, endOdometer: e.target.value })}
                          placeholder={`เลขไมล์เริ่มต้น: ${numberFormatter.format(selectedDeliveryNote.startOdometer || 0)} กม.`}
                          min={selectedDeliveryNote.startOdometer || 0}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        {receiveFormData.endOdometer && selectedDeliveryNote.startOdometer && (
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            ระยะทาง: {numberFormatter.format(parseInt(receiveFormData.endOdometer) - selectedDeliveryNote.startOdometer)} กม.
                          </p>
                        )}
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        หมายเหตุ (ถ้ามี)
                      </label>
                      <textarea
                        value={receiveFormData.notes}
                        onChange={(e) => setReceiveFormData({ ...receiveFormData, notes: e.target.value })}
                        placeholder="กรอกหมายเหตุเพิ่มเติม"
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-3 px-6 py-5 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => {
                      setShowReceiveModal(false);
                      setSelectedDeliveryNote(null);
                      setReceiveFormData({
                        receiverSignature: "",
                        receiverName: "",
                        endOdometer: "",
                        notes: "",
                      });
                    }}
                    className="px-6 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    ยกเลิก
                  </button>
                  <button
                    onClick={handleConfirmReceive}
                    className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    ยืนยันรับของ
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Quotation Branch Selection Modal */}
      <AnimatePresence>
        {showQuotationBranchModal && pendingQuotationNo && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowQuotationBranchModal(false);
                setPendingQuotationNo("");
              }}
              className="fixed inset-0 bg-black/50 z-50"
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
              >
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                    เลือกสาขาที่จะส่งของ
                  </h2>
                  <button
                    onClick={() => {
                      setShowQuotationBranchModal(false);
                      setPendingQuotationNo("");
                    }}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <X className="h-5 w-5 text-gray-500" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-6">
                  {(() => {
                    const quotation = getQuotationByNo(pendingQuotationNo);
                    if (!quotation || !quotation.branches) return null;

                    return (
                      <div className="space-y-4">
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                          <p className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-1">
                            ใบเสนอราคา: {quotation.quotationNo}
                          </p>
                          <p className="text-xs text-blue-700 dark:text-blue-400">
                            จาก: {quotation.fromBranchName}
                          </p>
                          <p className="text-xs text-blue-700 dark:text-blue-400">
                            มี {quotation.branches.length} สาขาที่สั่งน้ำมัน
                          </p>
                        </div>
                        <div className="space-y-3">
                          {quotation.branches.map((branch) => (
                            <button
                              key={branch.branchId}
                              onClick={() => handleSelectQuotationBranch(branch.branchId)}
                              className="w-full p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-left transition-colors"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <p className="font-semibold text-gray-800 dark:text-white mb-2">
                                    {branch.branchName}
                                  </p>
                                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                                    {branch.address}
                                  </p>
                                  <div className="space-y-1">
                                    {branch.items.map((item, idx) => (
                                      <div key={idx} className="flex items-center justify-between text-sm">
                                        <span className="text-gray-700 dark:text-gray-300">
                                          <Droplet className="inline h-3 w-3 mr-1" />
                                          {item.oilType}
                                        </span>
                                        <span className="text-gray-700 dark:text-gray-300 font-semibold">
                                          {numberFormatter.format(item.quantity)} ลิตร
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                <div className="ml-4 text-right">
                                  <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                                    {currencyFormatter.format(branch.totalAmount)}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {branch.status === "ยืนยันแล้ว" ? "✓ ยืนยันแล้ว" : "รอยืนยัน"}
                                  </p>
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </div>
                <div className="flex items-center justify-end gap-3 px-6 py-5 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => {
                      setShowQuotationBranchModal(false);
                      setPendingQuotationNo("");
                    }}
                    className="px-6 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    ยกเลิก
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
