import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";
import {
  Receipt as ReceiptIcon,
  Plus,
  Search,
  Eye,
  Download,
  CheckCircle,
  X,
  Save,
  Droplet,
  DollarSign,
  PenTool,
  Edit,
  Trash2,
} from "lucide-react";
import { useGasStation } from "@/contexts/GasStationContext";
import type { Receipt } from "@/types/gasStation";
import { convertNumberToThaiWords } from "@/utils/numberToThaiWords";

const currencyFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat("th-TH", {
  maximumFractionDigits: 0,
});

export default function ReceiptPage() {
  const {
    receipts,
    deliveryNotes,
    createReceipt,
    updateReceipt,
    deleteReceipt,
    issueReceipt,
    getNextRunningNumber,
    getDeliveryNoteByNo,
    getBranchById,
  } = useGasStation();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "draft" | "issued" | "paid" | "cancelled">("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showSignModal, setShowSignModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const [signature, setSignature] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  // Form state for creating/editing receipt
  const [formData, setFormData] = useState({
    documentType: "ใบเสร็จรับเงิน / ใบกำกับภาษี" as Receipt["documentType"],
    deliveryNoteNo: "",
    quotationNo: "",
    purchaseOrderNo: "",
    customerName: "",
    customerAddress: "",
    customerTaxId: "",
    items: [] as Array<{
      id?: string;
      oilType: string;
      quantity: number;
      pricePerLiter: number;
      totalAmount: number;
    }>,
    vatRate: 7, // VAT 7%
  });

  // Form state for adding/editing item
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);
  const [itemForm, setItemForm] = useState({
    oilType: "",
    quantity: "",
    pricePerLiter: "",
  });

  // Filter receipts
  const filteredReceipts = useMemo(() => {
    return receipts.filter((r) => {
      const matchesSearch =
        r.receiptNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.deliveryNoteNo?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === "all" || r.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [receipts, searchTerm, filterStatus]);

  // Statistics
  const stats = useMemo(() => {
    return {
      total: receipts.length,
      draft: receipts.filter((r) => r.status === "draft").length,
      issued: receipts.filter((r) => r.status === "issued").length,
      paid: receipts.filter((r) => r.status === "paid").length,
      totalAmount: receipts.reduce((sum, r) => sum + r.totalAmount, 0),
      totalVat: receipts.reduce((sum, r) => sum + r.vatAmount, 0),
    };
  }, [receipts]);

  // Handle create from Delivery Note
  const handleCreateFromDeliveryNote = (deliveryNoteNo: string) => {
    const deliveryNote = getDeliveryNoteByNo(deliveryNoteNo);
    if (!deliveryNote) {
      alert("ไม่พบใบส่งของ");
      return;
    }

    const toBranch = getBranchById(deliveryNote.toBranchId);

    setFormData({
      documentType: "ใบเสร็จรับเงิน / ใบกำกับภาษี",
      deliveryNoteNo,
      quotationNo: deliveryNote.quotationNo || "",
      purchaseOrderNo: deliveryNote.purchaseOrderNo || "",
      customerName: toBranch?.name || "",
      customerAddress: toBranch?.address || "",
      customerTaxId: "", // TODO: ดึงจาก branch profile
      items: deliveryNote.items,
      vatRate: 7,
    });
    setShowCreateModal(true);
  };

  // Calculate VAT
  const calculateVAT = (amount: number, vatRate: number = 7): { beforeVat: number; vat: number; total: number } => {
    const beforeVat = amount / (1 + vatRate / 100);
    const vat = amount - beforeVat;
    return {
      beforeVat: Math.round(beforeVat * 100) / 100,
      vat: Math.round(vat * 100) / 100,
      total: amount,
    };
  };

  // Handle save receipt
  const handleSave = () => {
    if (formData.items.length === 0) {
      alert("กรุณาเลือกรายการสินค้า");
      return;
    }
    if (!formData.customerName) {
      alert("กรุณากรอกชื่อลูกค้า");
      return;
    }
    if (!formData.customerAddress) {
      alert("กรุณากรอกที่อยู่ลูกค้า");
      return;
    }
    if (!formData.customerTaxId) {
      alert("กรุณากรอกเลขประจำตัวผู้เสียภาษี");
      return;
    }

    const receiptNo = getNextRunningNumber("receipt");
    const totalAmount = formData.items.reduce((sum, item) => sum + item.totalAmount, 0);
    const { beforeVat, vat } = calculateVAT(totalAmount, formData.vatRate);
    const amountInWords = convertNumberToThaiWords(totalAmount);

    const newReceipt: Receipt = {
      id: `REC-${Date.now()}`,
      receiptNo,
      receiptDate: new Date().toISOString().split("T")[0],
      documentType: formData.documentType,
      customerName: formData.customerName,
      customerAddress: formData.customerAddress,
      customerTaxId: formData.customerTaxId,
      items: formData.items.map((item, idx) => ({
        id: `item-${idx}`,
        oilType: item.oilType as Receipt["items"][0]["oilType"],
        quantity: item.quantity,
        pricePerLiter: item.pricePerLiter,
        totalAmount: item.totalAmount,
      })),
      amountBeforeVat: beforeVat,
      vatAmount: vat,
      totalAmount,
      amountInWords,
      purchaseOrderNo: formData.purchaseOrderNo || undefined,
      deliveryNoteNo: formData.deliveryNoteNo || undefined,
      quotationNo: formData.quotationNo || undefined,
      status: "draft",
      createdAt: new Date().toISOString(),
      createdBy: "ผู้จัดการคลัง", // TODO: ดึงจาก session
    };

    createReceipt(newReceipt);
    setShowCreateModal(false);
    setFormData({
      documentType: "ใบเสร็จรับเงิน / ใบกำกับภาษี",
      deliveryNoteNo: "",
      quotationNo: "",
      purchaseOrderNo: "",
      customerName: "",
      customerAddress: "",
      customerTaxId: "",
      items: [],
      vatRate: 7,
    });
    alert("สร้างใบเสร็จรับเงินสำเร็จ!");
  };

  // Handle issue receipt
  const handleIssue = (receiptId: string) => {
    if (window.confirm("คุณต้องการออกใบเสร็จรับเงินนี้หรือไม่?")) {
      issueReceipt(receiptId);
      alert("ออกใบเสร็จรับเงินเรียบร้อย!");
    }
  };

  // Handle sign receipt
  const handleSign = (receiptId: string) => {
    if (!signature.trim()) {
      alert("กรุณากรอกลายเซ็น");
      return;
    }

    updateReceipt(receiptId, {
      receiverSignature: signature,
      receiverSignedAt: new Date().toISOString(),
      receiverName: signature,
    });
    setShowSignModal(false);
    setSignature("");
    setSelectedReceipt(null);
    alert("เซ็นรับเงินเรียบร้อย!");
  };

  // Handle view detail
  const handleViewDetail = (receipt: Receipt) => {
    setSelectedReceipt(receipt);
    setShowDetailModal(true);
  };

  // Handle edit receipt
  const handleEdit = (receipt: Receipt) => {
    setSelectedReceipt(receipt);
    setFormData({
      documentType: receipt.documentType,
      deliveryNoteNo: receipt.deliveryNoteNo || "",
      quotationNo: receipt.quotationNo || "",
      purchaseOrderNo: receipt.purchaseOrderNo || "",
      customerName: receipt.customerName,
      customerAddress: receipt.customerAddress,
      customerTaxId: receipt.customerTaxId,
      items: receipt.items.map((item) => ({
        oilType: item.oilType,
        quantity: item.quantity,
        pricePerLiter: item.pricePerLiter,
        totalAmount: item.totalAmount,
      })),
      vatRate: 7,
    });
    setIsEditing(true);
    setShowEditModal(true);
  };

  // Handle update receipt
  const handleUpdate = () => {
    if (!selectedReceipt) return;
    if (formData.items.length === 0) {
      alert("กรุณาเลือกรายการสินค้า");
      return;
    }
    if (!formData.customerName) {
      alert("กรุณากรอกชื่อลูกค้า");
      return;
    }
    if (!formData.customerAddress) {
      alert("กรุณากรอกที่อยู่ลูกค้า");
      return;
    }
    if (!formData.customerTaxId) {
      alert("กรุณากรอกเลขประจำตัวผู้เสียภาษี");
      return;
    }

    const totalAmount = formData.items.reduce((sum, item) => sum + item.totalAmount, 0);
    const { beforeVat, vat } = calculateVAT(totalAmount, formData.vatRate);
    const amountInWords = convertNumberToThaiWords(totalAmount);

    updateReceipt(selectedReceipt.id, {
      documentType: formData.documentType,
      customerName: formData.customerName,
      customerAddress: formData.customerAddress,
      customerTaxId: formData.customerTaxId,
      items: formData.items.map((item, idx) => ({
        id: `item-${idx}`,
        oilType: item.oilType as Receipt["items"][0]["oilType"],
        quantity: item.quantity,
        pricePerLiter: item.pricePerLiter,
        totalAmount: item.totalAmount,
      })),
      amountBeforeVat: beforeVat,
      vatAmount: vat,
      totalAmount,
      amountInWords,
      purchaseOrderNo: formData.purchaseOrderNo || undefined,
      deliveryNoteNo: formData.deliveryNoteNo || undefined,
      quotationNo: formData.quotationNo || undefined,
    });

    setShowEditModal(false);
    setIsEditing(false);
    setSelectedReceipt(null);
    setFormData({
      documentType: "ใบเสร็จรับเงิน / ใบกำกับภาษี",
      deliveryNoteNo: "",
      quotationNo: "",
      purchaseOrderNo: "",
      customerName: "",
      customerAddress: "",
      customerTaxId: "",
      items: [],
      vatRate: 7,
    });
    alert("แก้ไขใบเสร็จรับเงินสำเร็จ!");
  };

  // Handle delete receipt
  const handleDelete = (receiptId: string) => {
    if (window.confirm("คุณต้องการลบใบเสร็จรับเงินนี้หรือไม่?")) {
      deleteReceipt(receiptId);
      alert("ลบใบเสร็จรับเงินสำเร็จ!");
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

  const getStatusColor = (status: Receipt["status"]) => {
    switch (status) {
      case "draft":
        return "text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700";
      case "issued":
        return "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800";
      case "paid":
        return "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800";
      case "cancelled":
        return "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800";
      default:
        return "text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700";
    }
  };

  const getStatusLabel = (status: Receipt["status"]) => {
    switch (status) {
      case "draft":
        return "ร่าง";
      case "issued":
        return "ออกแล้ว";
      case "paid":
        return "ชำระแล้ว";
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
                <ReceiptIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                ใบเสร็จรับเงิน / ใบกำกับภาษี
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                จัดการใบเสร็จรับเงินและใบกำกับภาษีสำหรับการขายน้ำมัน
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              สร้างใบเสร็จรับเงิน
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
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">ออกแล้ว</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.issued}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">ชำระแล้ว</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.paid}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">มูลค่ารวม</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {currencyFormatter.format(stats.totalAmount)}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">VAT รวม</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {currencyFormatter.format(stats.totalVat)}
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
                  placeholder="ค้นหาเลขที่ใบเสร็จ, ชื่อลูกค้า, เลขที่ใบส่งของ..."
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
                <option value="issued">ออกแล้ว</option>
                <option value="paid">ชำระแล้ว</option>
                <option value="cancelled">ยกเลิก</option>
              </select>
            </div>
          </div>
        </div>

        {/* Receipts List */}
        {filteredReceipts.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center border border-gray-200 dark:border-gray-700">
            <ReceiptIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              {receipts.length === 0 ? "ยังไม่มีใบเสร็จรับเงิน" : "ไม่พบใบเสร็จรับเงินที่ค้นหา"}
            </p>
            {receipts.length === 0 && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-4 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
              >
                สร้างใบเสร็จรับเงินแรก
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReceipts.map((receipt) => (
              <motion.div
                key={receipt.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                        เลขที่: {receipt.receiptNo}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(receipt.status)}`}
                      >
                        {getStatusLabel(receipt.status)}
                      </span>
                      <span className="px-3 py-1 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 rounded-full text-xs font-semibold border border-purple-200 dark:border-purple-800">
                        {receipt.documentType}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">ลูกค้า</p>
                        <p className="font-semibold text-gray-800 dark:text-white">{receipt.customerName}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{receipt.customerAddress}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          เลขประจำตัวผู้เสียภาษี: {receipt.customerTaxId}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">วันที่</p>
                          <p className="font-semibold text-gray-800 dark:text-white">
                            {new Date(receipt.receiptDate).toLocaleDateString("th-TH")}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">ยอดรวมสุทธิ</p>
                          <p className="font-semibold text-green-600 dark:text-green-400">
                            {currencyFormatter.format(receipt.totalAmount)}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {receipt.items.map((item, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg text-sm"
                        >
                          <Droplet className="inline h-4 w-4 mr-1" />
                          {item.oilType}: {numberFormatter.format(item.quantity)} ลิตร
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-400">
                          ก่อน VAT: {currencyFormatter.format(receipt.amountBeforeVat)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4 text-purple-400" />
                        <span className="text-purple-600 dark:text-purple-400">
                          VAT: {currencyFormatter.format(receipt.vatAmount)}
                        </span>
                      </div>
                      {receipt.receiverSignature ? (
                        <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                          <CheckCircle className="h-4 w-4" />
                          <span>เซ็นรับเงินแล้ว</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-gray-400">
                          <PenTool className="h-4 w-4" />
                          <span>รอเซ็นรับเงิน</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleViewDetail(receipt)}
                      className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      ดูรายละเอียด
                    </button>
                    {receipt.status === "draft" && (
                      <>
                        <button
                          onClick={() => handleEdit(receipt)}
                          className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors flex items-center gap-2"
                        >
                          <Edit className="w-4 h-4" />
                          แก้ไข
                        </button>
                        <button
                          onClick={() => handleDelete(receipt.id)}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          ลบ
                        </button>
                        <button
                          onClick={() => handleIssue(receipt.id)}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          ออกใบเสร็จ
                        </button>
                      </>
                    )}
                    {receipt.status === "issued" && !receipt.receiverSignature && (
                      <button
                        onClick={() => {
                          setSelectedReceipt(receipt);
                          setShowSignModal(true);
                        }}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2"
                      >
                        <PenTool className="w-4 h-4" />
                        เซ็นรับเงิน
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Delivery Notes List - สำหรับสร้างใบเสร็จ */}
        {deliveryNotes.filter((dn) => dn.status === "delivered").length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
              ใบส่งของที่ส่งถึงแล้ว (สามารถสร้างใบเสร็จได้)
            </h2>
            <div className="space-y-4">
              {deliveryNotes
                .filter((dn) => dn.status === "delivered")
                .slice(0, 5)
                .map((deliveryNote) => (
                  <motion.div
                    key={deliveryNote.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">
                          {deliveryNote.deliveryNoteNo}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          {deliveryNote.fromBranchName} → {deliveryNote.toBranchName}
                        </p>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {deliveryNote.items.map((item, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm"
                            >
                              {item.oilType}: {numberFormatter.format(item.quantity)} ลิตร
                            </span>
                          ))}
                        </div>
                        <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                          {currencyFormatter.format(deliveryNote.totalAmount)}
                        </p>
                      </div>
                      <button
                        onClick={() => handleCreateFromDeliveryNote(deliveryNote.deliveryNoteNo)}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        สร้างใบเสร็จ
                      </button>
                    </div>
                  </motion.div>
                ))}
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
                setSelectedReceipt(null);
                setFormData({
                  documentType: "ใบเสร็จรับเงิน / ใบกำกับภาษี",
                  deliveryNoteNo: "",
                  quotationNo: "",
                  purchaseOrderNo: "",
                  customerName: "",
                  customerAddress: "",
                  customerTaxId: "",
                  items: [],
                  vatRate: 7,
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
                    {isEditing ? "แก้ไขใบเสร็จรับเงิน" : "สร้างใบเสร็จรับเงิน"}
                  </h2>
                  <button
                    onClick={() => {
                      setShowCreateModal(false);
                      setShowEditModal(false);
                      setIsEditing(false);
                      setSelectedReceipt(null);
                      setFormData({
                        documentType: "ใบเสร็จรับเงิน / ใบกำกับภาษี",
                        deliveryNoteNo: "",
                        quotationNo: "",
                        purchaseOrderNo: "",
                        customerName: "",
                        customerAddress: "",
                        customerTaxId: "",
                        items: [],
                        vatRate: 7,
                      });
                    }}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <X className="h-5 w-5 text-gray-500" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="space-y-4">
                    {formData.deliveryNoteNo && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                        <p className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2">
                          สร้างจากใบส่งของ: {formData.deliveryNoteNo}
                        </p>
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        ประเภทเอกสาร
                      </label>
                      <select
                        value={formData.documentType}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            documentType: e.target.value as Receipt["documentType"],
                          })
                        }
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                      >
                        <option value="ใบเสร็จรับเงิน">ใบเสร็จรับเงิน</option>
                        <option value="ใบกำกับภาษี">ใบกำกับภาษี</option>
                        <option value="ใบเสร็จรับเงิน / ใบกำกับภาษี">ใบเสร็จรับเงิน / ใบกำกับภาษี</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        ชื่อลูกค้า / นิติบุคคล *
                      </label>
                      <input
                        type="text"
                        value={formData.customerName}
                        onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                        placeholder="กรอกชื่อลูกค้าหรือชื่อนิติบุคคล"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        ที่อยู่ลูกค้า *
                      </label>
                      <textarea
                        value={formData.customerAddress}
                        onChange={(e) => setFormData({ ...formData, customerAddress: e.target.value })}
                        placeholder="กรอกที่อยู่ลูกค้า"
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        เลขประจำตัวผู้เสียภาษี (13 หลัก) *
                      </label>
                      <input
                        type="text"
                        value={formData.customerTaxId}
                        onChange={(e) => setFormData({ ...formData, customerTaxId: e.target.value })}
                        placeholder="กรอกเลขประจำตัวผู้เสียภาษี 13 หลัก"
                        maxLength={13}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
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
                      {formData.items.length > 0 && (
                        <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600 dark:text-gray-400">ราคาก่อน VAT</span>
                            <span className="font-semibold text-gray-800 dark:text-white">
                              {currencyFormatter.format(
                                calculateVAT(
                                  formData.items.reduce((sum, item) => sum + item.totalAmount, 0),
                                  formData.vatRate
                                ).beforeVat
                              )}
                            </span>
                          </div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600 dark:text-gray-400">VAT ({formData.vatRate}%)</span>
                            <span className="font-semibold text-purple-600 dark:text-purple-400">
                              {currencyFormatter.format(
                                calculateVAT(
                                  formData.items.reduce((sum, item) => sum + item.totalAmount, 0),
                                  formData.vatRate
                                ).vat
                              )}
                            </span>
                          </div>
                          <div className="flex items-center justify-between pt-2 border-t border-green-200 dark:border-green-800">
                            <span className="text-lg font-semibold text-gray-800 dark:text-white">ยอดรวมสุทธิ</span>
                            <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                              {currencyFormatter.format(
                                formData.items.reduce((sum, item) => sum + item.totalAmount, 0)
                              )}
                            </span>
                          </div>
                          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            ({convertNumberToThaiWords(
                              formData.items.reduce((sum, item) => sum + item.totalAmount, 0)
                            )})
                          </p>
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
                      setSelectedReceipt(null);
                      setFormData({
                        documentType: "ใบเสร็จรับเงิน / ใบกำกับภาษี",
                        deliveryNoteNo: "",
                        quotationNo: "",
                        purchaseOrderNo: "",
                        customerName: "",
                        customerAddress: "",
                        customerTaxId: "",
                        items: [],
                        vatRate: 7,
                      });
                    }}
                    className="px-6 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    ยกเลิก
                  </button>
                  {formData.items.length > 0 && formData.customerName && formData.customerAddress && formData.customerTaxId && (
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
        {showDetailModal && selectedReceipt && (
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
                    รายละเอียดใบเสร็จรับเงิน: {selectedReceipt.receiptNo}
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
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">ประเภทเอกสาร</p>
                        <p className="font-semibold text-gray-800 dark:text-white">{selectedReceipt.documentType}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">วันที่</p>
                        <p className="font-semibold text-gray-800 dark:text-white">
                          {new Date(selectedReceipt.receiptDate).toLocaleDateString("th-TH", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">ลูกค้า</p>
                        <p className="font-semibold text-gray-800 dark:text-white">{selectedReceipt.customerName}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{selectedReceipt.customerAddress}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          เลขประจำตัวผู้เสียภาษี: {selectedReceipt.customerTaxId}
                        </p>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">รายการสินค้า</h3>
                      <div className="space-y-2">
                        {selectedReceipt.items.map((item, idx) => (
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
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <span className="text-gray-700 dark:text-gray-300">ราคาก่อน VAT</span>
                        <span className="font-semibold text-gray-800 dark:text-white">
                          {currencyFormatter.format(selectedReceipt.amountBeforeVat)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                        <span className="text-purple-700 dark:text-purple-300">VAT (7%)</span>
                        <span className="font-semibold text-purple-600 dark:text-purple-400">
                          {currencyFormatter.format(selectedReceipt.vatAmount)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                        <span className="text-lg font-semibold text-gray-800 dark:text-white">ยอดรวมสุทธิ</span>
                        <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                          {currencyFormatter.format(selectedReceipt.totalAmount)}
                        </span>
                      </div>
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">คำอ่านภาษาไทย</p>
                        <p className="font-semibold text-blue-800 dark:text-blue-300 text-lg">
                          {selectedReceipt.amountInWords}
                        </p>
                      </div>
                    </div>
                    {/* Signature */}
                    <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        ลายเซ็นผู้รับเงิน
                      </p>
                      {selectedReceipt.receiverSignature ? (
                        <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                          <CheckCircle className="h-5 w-5" />
                          <span>{selectedReceipt.receiverName || selectedReceipt.receiverSignature}</span>
                          {selectedReceipt.receiverSignedAt && (
                            <span className="text-xs text-gray-500">
                              {new Date(selectedReceipt.receiverSignedAt).toLocaleString("th-TH")}
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-gray-400">
                          <PenTool className="h-5 w-5" />
                          <span>รอเซ็นรับเงิน</span>
                        </div>
                      )}
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
                  {selectedReceipt.status === "draft" && (
                    <>
                      <button
                        onClick={() => {
                          setShowDetailModal(false);
                          handleEdit(selectedReceipt);
                        }}
                        className="px-6 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
                      >
                        <Edit className="w-4 h-4" />
                        แก้ไข
                      </button>
                      <button
                        onClick={() => {
                          setShowDetailModal(false);
                          handleDelete(selectedReceipt.id);
                        }}
                        className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        ลบ
                      </button>
                      <button
                        onClick={() => {
                          handleIssue(selectedReceipt.id);
                          setShowDetailModal(false);
                        }}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        ออกใบเสร็จ
                      </button>
                    </>
                  )}
                  {selectedReceipt.status === "issued" && !selectedReceipt.receiverSignature && (
                    <button
                      onClick={() => {
                        setShowSignModal(true);
                      }}
                      className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
                    >
                      <PenTool className="w-4 h-4" />
                      เซ็นรับเงิน
                    </button>
                  )}
                  <button className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2">
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
        {showSignModal && selectedReceipt && (
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
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white">เซ็นรับเงิน</h2>
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
                      กรอกลายเซ็นผู้รับเงิน *
                    </label>
                    <input
                      type="text"
                      value={signature}
                      onChange={(e) => setSignature(e.target.value)}
                      placeholder="กรอกชื่อ-นามสกุลผู้รับเงิน"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      * จำเป็นต้องมีลายเซ็นผู้รับเงินตามมาตรฐานการตรวจสอบบัญชี
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowSignModal(false)}
                      className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      ยกเลิก
                    </button>
                    <button
                      onClick={() => handleSign(selectedReceipt.id)}
                      className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
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
    </div>
  );
}
