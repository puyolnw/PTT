import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";
import {
  FileText,
  Plus,
  Search,
  Eye,
  Download,
  CheckCircle,
  X,
  Save,
  Building2,
  Droplet,
} from "lucide-react";
import { useGasStation } from "@/contexts/GasStationContext";
import type { Quotation, PurchaseOrder } from "@/types/gasStation";

const currencyFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat("th-TH", {
  maximumFractionDigits: 0,
});

export default function Quotation() {
  const {
    quotations,
    purchaseOrders,
    branches,
    createQuotation,
    confirmQuotation,
    getNextRunningNumber,
    getOrderByNo,
    getBranchById,
  } = useGasStation();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "draft" | "sent" | "confirmed" | "rejected" | "cancelled">("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);
  const [selectedPurchaseOrder, setSelectedPurchaseOrder] = useState<PurchaseOrder | null>(null);

  // Form state for creating new quotation
  const [formData, setFormData] = useState({
    purchaseOrderNo: "",
    fromBranchId: 1,
    toBranchId: 2,
    items: [] as Array<{
      oilType: string;
      quantity: number;
      pricePerLiter: number;
      totalAmount: number;
    }>,
  });

  // Filter quotations
  const filteredQuotations = useMemo(() => {
    return quotations.filter((q) => {
      const branchNames = q.branches?.map((b) => b.branchName.toLowerCase()).join(" ") || "";
      const matchesSearch =
        q.quotationNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.fromBranchName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        branchNames.includes(searchTerm.toLowerCase()) ||
        q.purchaseOrderNo?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === "all" || q.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [quotations, searchTerm, filterStatus]);

  // Statistics
  const stats = useMemo(() => {
    return {
      total: quotations.length,
      draft: quotations.filter((q) => q.status === "draft").length,
      sent: quotations.filter((q) => q.status === "sent").length,
      confirmed: quotations.filter((q) => q.status === "confirmed").length,
      rejected: quotations.filter((q) => q.status === "rejected").length,
      totalAmount: quotations.reduce((sum, q) => sum + q.totalAmount, 0),
    };
  }, [quotations]);

  // Handle create quotation from Purchase Order
  const handleCreateFromPO = (orderNo: string) => {
    const order = getOrderByNo(orderNo);
    if (!order) {
      alert("ไม่พบใบสั่งซื้อ");
      return;
    }

    setSelectedPurchaseOrder(order);
    setFormData({
      purchaseOrderNo: orderNo,
      fromBranchId: order.branches[0]?.branchId || 1,
      toBranchId: order.branches[0]?.branchId || 2,
      items: order.items,
    });
    setShowCreateModal(true);
  };

  // Handle save quotation
  const handleSave = () => {
    if (formData.items.length === 0) {
      alert("กรุณาเลือกรายการสินค้า");
      return;
    }

    const quotationNo = getNextRunningNumber("quotation");
    const fromBranch = getBranchById(formData.fromBranchId);
    const toBranch = getBranchById(formData.toBranchId);

    if (!fromBranch || !toBranch) {
      alert("ไม่พบข้อมูลสาขา");
      return;
    }

    const totalAmount = formData.items.reduce((sum, item) => sum + item.totalAmount, 0);

    // สร้าง branches array จาก toBranch
    const branchTotalAmount = formData.items.reduce((sum, item) => sum + item.totalAmount, 0);
    const newQuotation: Quotation = {
      id: `QT-${Date.now()}`,
      quotationNo,
      quotationDate: new Date().toISOString().split("T")[0],
      purchaseOrderNo: formData.purchaseOrderNo || undefined,
      fromBranchId: formData.fromBranchId,
      fromBranchName: fromBranch.name,
      branches: [
        {
          branchId: formData.toBranchId,
          branchName: toBranch.name,
          legalEntityName: toBranch.legalEntityName,
          address: toBranch.address,
          items: formData.items.map((item, idx) => ({
            id: `item-${idx}`,
            oilType: item.oilType as Quotation["items"][0]["oilType"],
            quantity: item.quantity,
            pricePerLiter: item.pricePerLiter,
            totalAmount: item.totalAmount,
          })),
          totalAmount: branchTotalAmount,
          status: "รอยืนยัน",
        },
      ],
      items: formData.items.map((item, idx) => ({
        id: `item-${idx}`,
        oilType: item.oilType as Quotation["items"][0]["oilType"],
        quantity: item.quantity,
        pricePerLiter: item.pricePerLiter,
        totalAmount: item.totalAmount,
      })),
      totalAmount,
      status: "draft",
      createdAt: new Date().toISOString(),
      createdBy: "ผู้จัดการคลัง", // TODO: ดึงจาก session
    };

    createQuotation(newQuotation);
    setShowCreateModal(false);
    setFormData({
      purchaseOrderNo: "",
      fromBranchId: 1,
      toBranchId: 2,
      items: [],
    });
    alert("สร้างใบเสนอราคาสำเร็จ!");
  };

  // Handle confirm quotation
  const handleConfirm = (quotationId: string) => {
    if (window.confirm("คุณต้องการยืนยันใบเสนอราคานี้หรือไม่?")) {
      confirmQuotation(quotationId, "ผู้จัดการสาขา"); // TODO: ดึงจาก session
      alert("ยืนยันใบเสนอราคาเรียบร้อย!");
    }
  };

  // Handle view detail
  const handleViewDetail = (quotation: Quotation) => {
    setSelectedQuotation(quotation);
    setShowDetailModal(true);
  };

  const getStatusColor = (status: Quotation["status"]) => {
    switch (status) {
      case "draft":
        return "text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700";
      case "sent":
        return "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800";
      case "confirmed":
        return "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800";
      case "rejected":
        return "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800";
      case "cancelled":
        return "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30 border-orange-200 dark:border-orange-800";
      default:
        return "text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700";
    }
  };

  const getStatusLabel = (status: Quotation["status"]) => {
    switch (status) {
      case "draft":
        return "ร่าง";
      case "sent":
        return "ส่งแล้ว";
      case "confirmed":
        return "ยืนยันแล้ว";
      case "rejected":
        return "ปฏิเสธ";
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
                ใบเสนอราคา
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                จัดการใบเสนอราคาสำหรับการขายน้ำมันระหว่างสาขา
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              สร้างใบเสนอราคา
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
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">ยืนยันแล้ว</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.confirmed}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">ปฏิเสธ</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.rejected}</p>
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
                  placeholder="ค้นหาเลขที่ใบเสนอราคา, สาขา, เลขที่ PO..."
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
                <option value="confirmed">ยืนยันแล้ว</option>
                <option value="rejected">ปฏิเสธ</option>
                <option value="cancelled">ยกเลิก</option>
              </select>
            </div>
          </div>
        </div>

        {/* Quotations List */}
        {filteredQuotations.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center border border-gray-200 dark:border-gray-700">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              {quotations.length === 0 ? "ยังไม่มีใบเสนอราคา" : "ไม่พบใบเสนอราคาที่ค้นหา"}
            </p>
            {quotations.length === 0 && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-4 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
              >
                สร้างใบเสนอราคาแรก
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredQuotations.map((quotation) => (
              <motion.div
                key={quotation.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                        เลขที่: {quotation.quotationNo}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(quotation.status)}`}>
                        {getStatusLabel(quotation.status)}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">จาก</p>
                          <p className="font-semibold text-gray-800 dark:text-white">{quotation.fromBranchName}</p>
                        </div>
                        <span className="text-gray-400">→</span>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">ไป</p>
                          <p className="font-semibold text-gray-800 dark:text-white">
                            {quotation.branches && quotation.branches.length > 0
                              ? quotation.branches.length === 1
                                ? quotation.branches[0].branchName
                                : `${quotation.branches.length} สาขา`
                              : "หลายสาขา"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">วันที่</p>
                          <p className="font-semibold text-gray-800 dark:text-white">
                            {new Date(quotation.quotationDate).toLocaleDateString("th-TH")}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">มูลค่ารวม</p>
                          <p className="font-semibold text-green-600 dark:text-green-400">
                            {currencyFormatter.format(quotation.totalAmount)}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {quotation.items.map((item, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg text-sm"
                        >
                          <Droplet className="inline h-4 w-4 mr-1" />
                          {item.oilType}: {numberFormatter.format(item.quantity)} ลิตร
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleViewDetail(quotation)}
                      className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      ดูรายละเอียด
                    </button>
                    {quotation.status === "sent" && (
                      <button
                        onClick={() => handleConfirm(quotation.id)}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        ยืนยัน
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Purchase Orders List - สำหรับสร้างใบเสนอราคา */}
        {purchaseOrders.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
              ใบสั่งซื้อที่สามารถสร้างใบเสนอราคาได้
            </h2>
            <div className="space-y-4">
              {purchaseOrders
                .filter((po) => po.status === "รอเริ่ม" || po.status === "กำลังขนส่ง")
                .map((order) => (
                  <motion.div
                    key={order.orderNo}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">
                          {order.orderNo}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          วันที่: {new Date(order.orderDate).toLocaleDateString("th-TH")}
                        </p>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {order.items.map((item, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm"
                            >
                              {item.oilType}: {numberFormatter.format(item.quantity)} ลิตร
                            </span>
                          ))}
                        </div>
                        <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                          {currencyFormatter.format(order.totalAmount)}
                        </p>
                      </div>
                      <button
                        onClick={() => handleCreateFromPO(order.orderNo)}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        สร้างใบเสนอราคา
                      </button>
                    </div>
                  </motion.div>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreateModal(false)}
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
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white">สร้างใบเสนอราคา</h2>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <X className="h-5 w-5 text-gray-500" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-6">
                  {selectedPurchaseOrder ? (
                    <div className="space-y-4">
                      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                        <p className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2">
                          สร้างจากใบสั่งซื้อ: {selectedPurchaseOrder.orderNo}
                        </p>
                        <p className="text-xs text-blue-700 dark:text-blue-400">
                          มูลค่ารวม: {currencyFormatter.format(selectedPurchaseOrder.totalAmount)}
                        </p>
                      </div>
                      <div>
                        <label htmlFor="quotation-from-branch" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          จากสาขา
                        </label>
                        <select
                          id="quotation-from-branch"
                          value={formData.fromBranchId}
                          onChange={(e) => setFormData({ ...formData, fromBranchId: parseInt(e.target.value) })}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                        >
                          {branches
                            .sort((a, b) => {
                              const branchOrder = ["ปั้มไฮโซ", "ดินดำ", "หนองจิก", "ตักสิลา", "บายพาส"];
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
                        <label htmlFor="quotation-to-branch" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          ไปสาขา
                        </label>
                        <select
                          id="quotation-to-branch"
                          value={formData.toBranchId}
                          onChange={(e) => setFormData({ ...formData, toBranchId: parseInt(e.target.value) })}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                        >
                          {branches
                            .sort((a, b) => {
                              const branchOrder = ["ปั้มไฮโซ", "ดินดำ", "หนองจิก", "ตักสิลา", "บายพาส"];
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
                        <span className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          รายการสินค้า
                        </span>
                        <div className="space-y-2">
                          {formData.items.map((item, idx) => (
                            <div
                              key={idx}
                              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700/50"
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-semibold text-gray-800 dark:text-white">{item.oilType}</p>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {numberFormatter.format(item.quantity)} ลิตร ×{" "}
                                    {currencyFormatter.format(item.pricePerLiter)} ={" "}
                                    {currencyFormatter.format(item.totalAmount)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        กรุณาเลือกใบสั่งซื้อเพื่อสร้างใบเสนอราคา
                      </p>
                      <div className="space-y-2">
                        {purchaseOrders
                          .filter((po) => po.status === "รอเริ่ม" || po.status === "กำลังขนส่ง")
                          .map((order) => (
                            <button
                              key={order.orderNo}
                              onClick={() => handleCreateFromPO(order.orderNo)}
                              className="w-full p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-left"
                            >
                              <p className="font-semibold text-gray-800 dark:text-white">{order.orderNo}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {currencyFormatter.format(order.totalAmount)}
                              </p>
                            </button>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-end gap-3 px-6 py-5 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="px-6 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    ยกเลิก
                  </button>
                  {selectedPurchaseOrder && (
                    <button
                      onClick={handleSave}
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      บันทึก
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
        {showDetailModal && selectedQuotation && (
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
                    รายละเอียดใบเสนอราคา: {selectedQuotation.quotationNo}
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
                          {selectedQuotation.fromBranchName}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">ไปสาขา</p>
                        <p className="font-semibold text-gray-800 dark:text-white">
                          {selectedQuotation.branches && selectedQuotation.branches.length > 0
                            ? selectedQuotation.branches.length === 1
                              ? selectedQuotation.branches[0].branchName
                              : `${selectedQuotation.branches.length} สาขา`
                            : "หลายสาขา"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">วันที่</p>
                        <p className="font-semibold text-gray-800 dark:text-white">
                          {new Date(selectedQuotation.quotationDate).toLocaleDateString("th-TH", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">สถานะ</p>
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(selectedQuotation.status)}`}
                        >
                          {getStatusLabel(selectedQuotation.status)}
                        </span>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">รายการสินค้า</h3>
                      <div className="space-y-2">
                        {selectedQuotation.items.map((item, idx) => (
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
                        {currencyFormatter.format(selectedQuotation.totalAmount)}
                      </p>
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
                  {selectedQuotation.status === "sent" && (
                    <button
                      onClick={() => {
                        handleConfirm(selectedQuotation.id);
                        setShowDetailModal(false);
                      }}
                      className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      ยืนยันใบเสนอราคา
                    </button>
                  )}
                  <button
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    ดาวน์โหลด PDF
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
