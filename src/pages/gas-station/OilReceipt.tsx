import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";
import {
  PackageCheck,
  Plus,
  Search,
  Eye,
  CheckCircle,
  X,
  Save,
  Droplet,
  Truck,
  User,
  FileText,
  Edit,
  Trash2,
  Building2,
  Calendar,
  Clock,
} from "lucide-react";
import { useGasStation } from "@/contexts/GasStationContext";
import type { OilReceipt, QualityTest, DipMeasurement } from "@/types/gasStation";

const currencyFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat("th-TH", {
  maximumFractionDigits: 0,
});

export default function OilReceiptPage() {
  const {
    oilReceipts,
    deliveryNotes,
    createOilReceipt,
    updateOilReceipt,
    deleteOilReceipt,
    getNextRunningNumber,
    getDeliveryNoteByNo,
  } = useGasStation();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "draft" | "completed" | "cancelled">("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedOilReceipt, setSelectedOilReceipt] = useState<OilReceipt | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Form state for creating/editing oil receipt
  const [formData, setFormData] = useState({
    deliveryNoteNo: "", // เลือกจาก DeliveryNote
    purchaseOrderNo: "",
    receiveDate: new Date().toISOString().split("T")[0],
    receiveTime: new Date().toTimeString().slice(0, 5),
    truckLicensePlate: "",
    driverName: "",
    driverLicense: "",
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
    items: [] as Array<{
      oilType: string;
      tankNumber: number;
      quantityOrdered: number;
      beforeDip: number;
      afterDip: number;
      quantityReceived: number;
      differenceLiter: number;
      differenceAmount: number;
      pricePerLiter: number;
      gainLossReason?: string;
    }>,
    notes: "",
  });

  // Filter oil receipts
  const filteredOilReceipts = useMemo(() => {
    return oilReceipts.filter((or) => {
      const matchesSearch =
        or.receiptNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        or.deliveryNoteNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        or.truckLicensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
        or.driverName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === "all" || or.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [oilReceipts, searchTerm, filterStatus]);

  // Statistics
  const stats = useMemo(() => {
    return {
      total: oilReceipts.length,
      draft: oilReceipts.filter((or) => or.status === "draft").length,
      completed: oilReceipts.filter((or) => or.status === "completed").length,
      cancelled: oilReceipts.filter((or) => or.status === "cancelled").length,
    };
  }, [oilReceipts]);

  // Handle create from Delivery Note
  const handleCreateFromDeliveryNote = (deliveryNoteNo: string) => {
    const deliveryNote = getDeliveryNoteByNo(deliveryNoteNo);
    if (!deliveryNote) {
      alert("ไม่พบข้อมูลใบส่งของ");
      return;
    }

    // ดึงข้อมูลทั้งหมดจาก DeliveryNote มาแสดง
    setFormData({
      deliveryNoteNo: deliveryNote.deliveryNoteNo,
      purchaseOrderNo: deliveryNote.purchaseOrderNo || "",
      receiveDate: new Date().toISOString().split("T")[0],
      receiveTime: new Date().toTimeString().slice(0, 5),
      truckLicensePlate: deliveryNote.truckPlateNumber || "",
      driverName: deliveryNote.driverName || "",
      driverLicense: "",
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
      items: deliveryNote.items.map((item) => ({
        oilType: item.oilType,
        tankNumber: 0, // ต้องเลือกถังเอง
        quantityOrdered: item.quantity,
        beforeDip: 0,
        afterDip: 0,
        quantityReceived: 0,
        differenceLiter: 0,
        differenceAmount: 0,
        pricePerLiter: item.pricePerLiter,
        gainLossReason: "",
      })),
      notes: "",
    });
    setShowCreateModal(true);
  };

  // Handle save oil receipt
  const handleSave = () => {
    if (!formData.deliveryNoteNo) {
      alert("กรุณาเลือกใบส่งของ");
      return;
    }
    if (formData.items.length === 0) {
      alert("กรุณาเพิ่มรายการน้ำมัน");
      return;
    }
    if (!formData.truckLicensePlate) {
      alert("กรุณากรอกทะเบียนรถ");
      return;
    }
    if (!formData.driverName) {
      alert("กรุณากรอกชื่อคนขับ");
      return;
    }

    const receiptNo = getNextRunningNumber("receipt"); // ใช้ receipt running number
    const deliveryNote = getDeliveryNoteByNo(formData.deliveryNoteNo);
    if (!deliveryNote) {
      alert("ไม่พบข้อมูลใบส่งของ");
      return;
    }

    const newOilReceipt: OilReceipt = {
      id: `OR-${Date.now()}`,
      receiptNo,
      purchaseOrderNo: formData.purchaseOrderNo || deliveryNote.purchaseOrderNo || "",
      deliveryNoteNo: formData.deliveryNoteNo,
      receiveDate: formData.receiveDate,
      receiveTime: formData.receiveTime,
      truckLicensePlate: formData.truckLicensePlate,
      driverName: formData.driverName,
      driverLicense: formData.driverLicense || undefined,
      qualityTest: {
        ...formData.qualityTest,
        testedBy: formData.qualityTest.testedBy || "ผู้ตรวจสอบ",
        testDateTime: formData.qualityTest.testDateTime || new Date().toISOString(),
      },
      items: formData.items.map((item) => ({
        oilType: item.oilType as DipMeasurement["oilType"],
        tankNumber: item.tankNumber,
        quantityOrdered: item.quantityOrdered,
        beforeDip: item.beforeDip,
        afterDip: item.afterDip,
        quantityReceived: item.quantityReceived,
        differenceLiter: item.differenceLiter,
        differenceAmount: item.differenceAmount,
        pricePerLiter: item.pricePerLiter,
        gainLossReason: item.gainLossReason || undefined,
      })),
      attachments: [],
      status: "draft",
      receivedBy: "EMP-001", // TODO: ดึงจาก session
      receivedByName: "ผู้รับของ", // TODO: ดึงจาก session
      notes: formData.notes || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    createOilReceipt(newOilReceipt);
    setShowCreateModal(false);
    setFormData({
      deliveryNoteNo: "",
      purchaseOrderNo: "",
      receiveDate: new Date().toISOString().split("T")[0],
      receiveTime: new Date().toTimeString().slice(0, 5),
      truckLicensePlate: "",
      driverName: "",
      driverLicense: "",
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
      items: [],
      notes: "",
    });
  };

  // Handle edit oil receipt
  const handleEdit = (oilReceipt: OilReceipt) => {
    setSelectedOilReceipt(oilReceipt);
    setFormData({
      deliveryNoteNo: oilReceipt.deliveryNoteNo,
      purchaseOrderNo: oilReceipt.purchaseOrderNo,
      receiveDate: oilReceipt.receiveDate,
      receiveTime: oilReceipt.receiveTime,
      truckLicensePlate: oilReceipt.truckLicensePlate,
      driverName: oilReceipt.driverName,
      driverLicense: oilReceipt.driverLicense || "",
      qualityTest: {
        ...oilReceipt.qualityTest,
        notes: oilReceipt.qualityTest.notes || "",
      },
      items: oilReceipt.items.map((item) => ({
        oilType: item.oilType,
        tankNumber: item.tankNumber,
        quantityOrdered: item.quantityOrdered,
        beforeDip: item.beforeDip,
        afterDip: item.afterDip,
        quantityReceived: item.quantityReceived,
        differenceLiter: item.differenceLiter,
        differenceAmount: item.differenceAmount,
        pricePerLiter: item.pricePerLiter,
        gainLossReason: item.gainLossReason || "",
      })),
      notes: oilReceipt.notes || "",
    });
    setIsEditing(true);
    setShowEditModal(true);
  };

  // Handle update oil receipt
  const handleUpdate = () => {
    if (!selectedOilReceipt) return;

    updateOilReceipt(selectedOilReceipt.id, {
      receiveDate: formData.receiveDate,
      receiveTime: formData.receiveTime,
      truckLicensePlate: formData.truckLicensePlate,
      driverName: formData.driverName,
      driverLicense: formData.driverLicense || undefined,
      qualityTest: formData.qualityTest,
      items: formData.items.map((item) => ({
        oilType: item.oilType as DipMeasurement["oilType"],
        tankNumber: item.tankNumber,
        quantityOrdered: item.quantityOrdered,
        beforeDip: item.beforeDip,
        afterDip: item.afterDip,
        quantityReceived: item.quantityReceived,
        differenceLiter: item.differenceLiter,
        differenceAmount: item.differenceAmount,
        pricePerLiter: item.pricePerLiter,
        gainLossReason: item.gainLossReason || undefined,
      })),
      notes: formData.notes || undefined,
      updatedAt: new Date().toISOString(),
    });

    setShowEditModal(false);
    setIsEditing(false);
    setSelectedOilReceipt(null);
    setFormData({
      deliveryNoteNo: "",
      purchaseOrderNo: "",
      receiveDate: new Date().toISOString().split("T")[0],
      receiveTime: new Date().toTimeString().slice(0, 5),
      truckLicensePlate: "",
      driverName: "",
      driverLicense: "",
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
      items: [],
      notes: "",
    });
  };

  // Handle delete oil receipt
  const handleDelete = (id: string) => {
    if (confirm("คุณแน่ใจหรือไม่ว่าต้องการลบใบรับของนี้?")) {
      deleteOilReceipt(id);
    }
  };

  // Handle view detail
  const handleViewDetail = (oilReceipt: OilReceipt) => {
    setSelectedOilReceipt(oilReceipt);
    setShowDetailModal(true);
  };

  // Update item calculations
  const updateItemCalculations = (index: number) => {
    const item = formData.items[index];
    if (item.afterDip > 0 && item.beforeDip >= 0) {
      const quantityReceived = item.afterDip - item.beforeDip;
      const differenceLiter = quantityReceived - item.quantityOrdered;
      const differenceAmount = differenceLiter * item.pricePerLiter;

      const updatedItems = [...formData.items];
      updatedItems[index] = {
        ...item,
        quantityReceived,
        differenceLiter,
        differenceAmount,
      };
      setFormData({ ...formData, items: updatedItems });
    }
  };

  // Get available delivery notes (delivered status)
  const availableDeliveryNotes = useMemo(() => {
    return deliveryNotes.filter(
      (dn) => dn.status === "delivered" && !oilReceipts.some((or) => or.deliveryNoteNo === dn.deliveryNoteNo)
    );
  }, [deliveryNotes, oilReceipts]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
            <PackageCheck className="w-8 h-8 text-orange-500" />
            ใบรับของ
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">จัดการใบรับของจากใบส่งของ</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          สร้างใบรับของ
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">ทั้งหมด</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats.total}</p>
            </div>
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">ร่าง</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.draft}</p>
            </div>
            <FileText className="w-8 h-8 text-yellow-400" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">เสร็จสมบูรณ์</p>
              <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">ยกเลิก</p>
              <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
            </div>
            <X className="w-8 h-8 text-red-400" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="ค้นหาใบรับของ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="all">ทั้งหมด</option>
            <option value="draft">ร่าง</option>
            <option value="completed">เสร็จสมบูรณ์</option>
            <option value="cancelled">ยกเลิก</option>
          </select>
        </div>
      </div>

      {/* Create from Delivery Note Section */}
      {availableDeliveryNotes.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
            สร้างใบรับของจากใบส่งของ
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableDeliveryNotes.slice(0, 6).map((deliveryNote) => (
              <motion.div
                key={deliveryNote.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-orange-500 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">
                      {deliveryNote.deliveryNoteNo}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      <Building2 className="inline w-4 h-4 mr-1" />
                      {deliveryNote.fromBranchName} → {deliveryNote.toBranchName}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {deliveryNote.items.map((item, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs"
                        >
                          <Droplet className="inline w-3 h-3 mr-1" />
                          {item.oilType}: {numberFormatter.format(item.quantity)} ลิตร
                        </span>
                      ))}
                    </div>
                    {deliveryNote.truckPlateNumber && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                        <Truck className="inline w-3 h-3 mr-1" />
                        {deliveryNote.truckPlateNumber}
                      </p>
                    )}
                    {deliveryNote.driverName && (
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        <User className="inline w-3 h-3 mr-1" />
                        {deliveryNote.driverName}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleCreateFromDeliveryNote(deliveryNote.deliveryNoteNo)}
                  className="w-full px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  สร้างใบรับของ
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Oil Receipts List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">รายการใบรับของ</h2>
        </div>
        {filteredOilReceipts.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            <PackageCheck className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>ไม่มีข้อมูลใบรับของ</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredOilReceipts.map((oilReceipt) => (
              <motion.div
                key={oilReceipt.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                        {oilReceipt.receiptNo}
                      </h3>
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          oilReceipt.status === "completed"
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                            : oilReceipt.status === "draft"
                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                            : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                        }`}
                      >
                        {oilReceipt.status === "completed"
                          ? "เสร็จสมบูรณ์"
                          : oilReceipt.status === "draft"
                          ? "ร่าง"
                          : "ยกเลิก"}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      <FileText className="inline w-4 h-4 mr-1" />
                      ใบส่งของ: {oilReceipt.deliveryNoteNo}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      <Calendar className="inline w-4 h-4 mr-1" />
                      วันที่รับ: {oilReceipt.receiveDate} <Clock className="inline w-4 h-4 ml-2 mr-1" />
                      {oilReceipt.receiveTime}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      <Truck className="inline w-4 h-4 mr-1" />
                      {oilReceipt.truckLicensePlate} | <User className="inline w-4 h-4 ml-2 mr-1" />
                      {oilReceipt.driverName}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {oilReceipt.items.map((item, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs"
                        >
                          <Droplet className="inline w-3 h-3 mr-1" />
                          {item.oilType}: {numberFormatter.format(item.quantityReceived)} ลิตร
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handleViewDetail(oilReceipt)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      ดูรายละเอียด
                    </button>
                    {oilReceipt.status === "draft" && (
                      <>
                        <button
                          onClick={() => handleEdit(oilReceipt)}
                          className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors flex items-center gap-2"
                        >
                          <Edit className="w-4 h-4" />
                          แก้ไข
                        </button>
                        <button
                          onClick={() => handleDelete(oilReceipt.id)}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          ลบ
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
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
                setSelectedOilReceipt(null);
                setFormData({
                  deliveryNoteNo: "",
                  purchaseOrderNo: "",
                  receiveDate: new Date().toISOString().split("T")[0],
                  receiveTime: new Date().toTimeString().slice(0, 5),
                  truckLicensePlate: "",
                  driverName: "",
                  driverLicense: "",
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
                  items: [],
                  notes: "",
                });
              }}
              className="fixed inset-0 bg-black/50 z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                    {isEditing ? "แก้ไขใบรับของ" : "สร้างใบรับของ"}
                  </h2>
                  <button
                    onClick={() => {
                      setShowCreateModal(false);
                      setShowEditModal(false);
                      setIsEditing(false);
                      setSelectedOilReceipt(null);
                      setFormData({
                        deliveryNoteNo: "",
                        purchaseOrderNo: "",
                        receiveDate: new Date().toISOString().split("T")[0],
                        receiveTime: new Date().toTimeString().slice(0, 5),
                        truckLicensePlate: "",
                        driverName: "",
                        driverLicense: "",
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
                        items: [],
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
                    {/* เลือกใบส่งของ */}
                    {!isEditing && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          เลือกใบส่งของ *
                        </label>
                        <select
                          value={formData.deliveryNoteNo}
                          onChange={(e) => {
                            const deliveryNoteNo = e.target.value;
                            handleCreateFromDeliveryNote(deliveryNoteNo);
                          }}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                        >
                          <option value="">-- เลือกใบส่งของ --</option>
                          {deliveryNotes
                            .filter((dn) => dn.status === "delivered")
                            .map((dn) => (
                              <option key={dn.deliveryNoteNo} value={dn.deliveryNoteNo}>
                                {dn.deliveryNoteNo} - {dn.fromBranchName} → {dn.toBranchName} - {dn.deliveryDate}
                              </option>
                            ))}
                        </select>
                      </div>
                    )}

                    {/* แสดงข้อมูลจาก DeliveryNote */}
                    {formData.deliveryNoteNo && (() => {
                      const deliveryNote = getDeliveryNoteByNo(formData.deliveryNoteNo);
                      if (deliveryNote) {
                        return (
                          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                            <p className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2">
                              ข้อมูลจากใบส่งของ: {deliveryNote.deliveryNoteNo}
                            </p>
                            <div className="grid grid-cols-2 gap-2 text-xs text-blue-700 dark:text-blue-400">
                              <p>
                                <Building2 className="inline w-3 h-3 mr-1" />
                                {deliveryNote.fromBranchName} → {deliveryNote.toBranchName}
                              </p>
                              <p>
                                <Calendar className="inline w-3 h-3 mr-1" />
                                {deliveryNote.deliveryDate}
                              </p>
                              {deliveryNote.truckPlateNumber && (
                                <p>
                                  <Truck className="inline w-3 h-3 mr-1" />
                                  {deliveryNote.truckPlateNumber}
                                </p>
                              )}
                              {deliveryNote.driverName && (
                                <p>
                                  <User className="inline w-3 h-3 mr-1" />
                                  {deliveryNote.driverName}
                                </p>
                              )}
                            </div>
                            <div className="mt-2 pt-2 border-t border-blue-200 dark:border-blue-800">
                              <p className="text-xs font-semibold text-blue-800 dark:text-blue-300 mb-1">
                                รายการน้ำมัน:
                              </p>
                              <div className="space-y-1">
                                {deliveryNote.items.map((item, idx) => (
                                  <div key={idx} className="text-xs text-blue-700 dark:text-blue-400">
                                    • {item.oilType}: {numberFormatter.format(item.quantity)} ลิตร ×{" "}
                                    {currencyFormatter.format(item.pricePerLiter)} ={" "}
                                    {currencyFormatter.format(item.totalAmount)}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })()}

                    {/* วันที่และเวลารับ */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          วันที่รับ *
                        </label>
                        <input
                          type="date"
                          value={formData.receiveDate}
                          onChange={(e) => setFormData({ ...formData, receiveDate: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          เวลารับ *
                        </label>
                        <input
                          type="time"
                          value={formData.receiveTime}
                          onChange={(e) => setFormData({ ...formData, receiveTime: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                        />
                      </div>
                    </div>

                    {/* ข้อมูลรถและคนขับ */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          ทะเบียนรถ *
                        </label>
                        <input
                          type="text"
                          value={formData.truckLicensePlate}
                          onChange={(e) => setFormData({ ...formData, truckLicensePlate: e.target.value })}
                          placeholder="กรอกทะเบียนรถ"
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          ชื่อคนขับ *
                        </label>
                        <input
                          type="text"
                          value={formData.driverName}
                          onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
                          placeholder="กรอกชื่อคนขับ"
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        เลขใบขับขี่
                      </label>
                      <input
                        type="text"
                        value={formData.driverLicense}
                        onChange={(e) => setFormData({ ...formData, driverLicense: e.target.value })}
                        placeholder="กรอกเลขใบขับขี่ (ถ้ามี)"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                      />
                    </div>

                    {/* Quality Test */}
                    <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-700">
                      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                        การตรวจสอบคุณภาพน้ำมัน
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                            API Gravity
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={formData.qualityTest.apiGravity}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                qualityTest: { ...formData.qualityTest, apiGravity: parseFloat(e.target.value) || 0 },
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
                            value={formData.qualityTest.waterContent}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                qualityTest: { ...formData.qualityTest, waterContent: parseFloat(e.target.value) || 0 },
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
                            value={formData.qualityTest.temperature}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                qualityTest: { ...formData.qualityTest, temperature: parseFloat(e.target.value) || 0 },
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
                            value={formData.qualityTest.color}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                qualityTest: { ...formData.qualityTest, color: e.target.value },
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
                            value={formData.qualityTest.testResult}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                qualityTest: {
                                  ...formData.qualityTest,
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
                            value={formData.qualityTest.testedBy}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                qualityTest: { ...formData.qualityTest, testedBy: e.target.value },
                              })
                            }
                            placeholder="กรอกชื่อผู้ตรวจสอบ"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white text-sm"
                          />
                        </div>
                      </div>
                    </div>

                    {/* รายการน้ำมัน */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                        รายการน้ำมันที่รับ
                      </h3>
                      {formData.items.length > 0 ? (
                        <div className="space-y-3">
                          {formData.items.map((item, idx) => (
                            <div
                              key={idx}
                              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700/50"
                            >
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                                <div>
                                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                                    ชนิดน้ำมัน
                                  </label>
                                  <div className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-sm">
                                    {item.oilType}
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                                    จำนวนที่สั่ง (ลิตร)
                                  </label>
                                  <div className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-sm">
                                    {numberFormatter.format(item.quantityOrdered)}
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                                    ยอดก่อนลงหลุม (ลิตร)
                                  </label>
                                  <input
                                    type="number"
                                    value={item.beforeDip || ""}
                                    onChange={(e) => {
                                      const updatedItems = [...formData.items];
                                      updatedItems[idx] = {
                                        ...item,
                                        beforeDip: parseFloat(e.target.value) || 0,
                                      };
                                      setFormData({ ...formData, items: updatedItems });
                                      setTimeout(() => updateItemCalculations(idx), 100);
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white text-sm"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                                    ยอดหลังลงหลุม (ลิตร)
                                  </label>
                                  <input
                                    type="number"
                                    value={item.afterDip || ""}
                                    onChange={(e) => {
                                      const updatedItems = [...formData.items];
                                      updatedItems[idx] = {
                                        ...item,
                                        afterDip: parseFloat(e.target.value) || 0,
                                      };
                                      setFormData({ ...formData, items: updatedItems });
                                      setTimeout(() => updateItemCalculations(idx), 100);
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white text-sm"
                                  />
                                </div>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <div>
                                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                                    จำนวนที่รับจริง (ลิตร)
                                  </label>
                                  <div className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-sm font-semibold">
                                    {numberFormatter.format(item.quantityReceived)}
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                                    ส่วนต่าง (ลิตร)
                                  </label>
                                  <div
                                    className={`px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-sm font-semibold ${
                                      item.differenceLiter > 0
                                        ? "text-green-600"
                                        : item.differenceLiter < 0
                                        ? "text-red-600"
                                        : ""
                                    }`}
                                  >
                                    {item.differenceLiter > 0 ? "+" : ""}
                                    {numberFormatter.format(item.differenceLiter)}
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                                    ส่วนต่าง (บาท)
                                  </label>
                                  <div
                                    className={`px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-sm font-semibold ${
                                      item.differenceAmount > 0
                                        ? "text-green-600"
                                        : item.differenceAmount < 0
                                        ? "text-red-600"
                                        : ""
                                    }`}
                                  >
                                    {item.differenceAmount > 0 ? "+" : ""}
                                    {currencyFormatter.format(item.differenceAmount)}
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                                    หมายเลขถัง
                                  </label>
                                  <input
                                    type="number"
                                    value={item.tankNumber || ""}
                                    onChange={(e) => {
                                      const updatedItems = [...formData.items];
                                      updatedItems[idx] = {
                                        ...item,
                                        tankNumber: parseInt(e.target.value) || 0,
                                      };
                                      setFormData({ ...formData, items: updatedItems });
                                    }}
                                    placeholder="หมายเลขถัง"
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white text-sm"
                                  />
                                </div>
                              </div>
                              {item.differenceLiter !== 0 && (
                                <div className="mt-3">
                                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                                    เหตุผลส่วนต่าง
                                  </label>
                                  <input
                                    type="text"
                                    value={item.gainLossReason || ""}
                                    onChange={(e) => {
                                      const updatedItems = [...formData.items];
                                      updatedItems[idx] = {
                                        ...item,
                                        gainLossReason: e.target.value,
                                      };
                                      setFormData({ ...formData, items: updatedItems });
                                    }}
                                    placeholder="อธิบายเหตุผลส่วนต่าง (เช่น ระเหย, หก, วัดผิด)"
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white text-sm"
                                  />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                          เลือกใบส่งของเพื่อดึงข้อมูลรายการน้ำมัน
                        </p>
                      )}
                    </div>

                    {/* หมายเหตุ */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        หมายเหตุ
                      </label>
                      <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="กรอกหมายเหตุ (ถ้ามี)"
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => {
                      setShowCreateModal(false);
                      setShowEditModal(false);
                      setIsEditing(false);
                      setSelectedOilReceipt(null);
                      setFormData({
                        deliveryNoteNo: "",
                        purchaseOrderNo: "",
                        receiveDate: new Date().toISOString().split("T")[0],
                        receiveTime: new Date().toTimeString().slice(0, 5),
                        truckLicensePlate: "",
                        driverName: "",
                        driverLicense: "",
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
                        items: [],
                  notes: "",
                });
              }}
                    className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    ยกเลิก
                  </button>
                  <button
                    onClick={isEditing ? handleUpdate : handleSave}
                    className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {isEditing ? "บันทึกการแก้ไข" : "สร้างใบรับของ"}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Detail Modal */}
      <AnimatePresence>
        {showDetailModal && selectedOilReceipt && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowDetailModal(false);
                setSelectedOilReceipt(null);
              }}
              className="fixed inset-0 bg-black/50 z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                    รายละเอียดใบรับของ: {selectedOilReceipt.receiptNo}
                  </h2>
                  <button
                    onClick={() => {
                      setShowDetailModal(false);
                      setSelectedOilReceipt(null);
                    }}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <X className="h-5 w-5 text-gray-500" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">เลขที่ใบรับของ</p>
                        <p className="text-lg font-semibold text-gray-800 dark:text-white">
                          {selectedOilReceipt.receiptNo}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">เลขที่ใบส่งของ</p>
                        <p className="text-lg font-semibold text-gray-800 dark:text-white">
                          {selectedOilReceipt.deliveryNoteNo}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">วันที่รับ</p>
                        <p className="text-lg font-semibold text-gray-800 dark:text-white">
                          {selectedOilReceipt.receiveDate} {selectedOilReceipt.receiveTime}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">สถานะ</p>
                        <span
                          className={`px-3 py-1 rounded text-sm font-semibold ${
                            selectedOilReceipt.status === "completed"
                              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                              : selectedOilReceipt.status === "draft"
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                              : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                          }`}
                        >
                          {selectedOilReceipt.status === "completed"
                            ? "เสร็จสมบูรณ์"
                            : selectedOilReceipt.status === "draft"
                            ? "ร่าง"
                            : "ยกเลิก"}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">ทะเบียนรถ</p>
                        <p className="text-lg font-semibold text-gray-800 dark:text-white">
                          {selectedOilReceipt.truckLicensePlate}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">ชื่อคนขับ</p>
                        <p className="text-lg font-semibold text-gray-800 dark:text-white">
                          {selectedOilReceipt.driverName}
                        </p>
                      </div>
                    </div>

                    <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                        การตรวจสอบคุณภาพ
                      </h3>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">API Gravity: </span>
                          <span className="font-semibold">{selectedOilReceipt.qualityTest.apiGravity}</span>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Water Content: </span>
                          <span className="font-semibold">{selectedOilReceipt.qualityTest.waterContent}%</span>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Temperature: </span>
                          <span className="font-semibold">{selectedOilReceipt.qualityTest.temperature}°C</span>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">สี: </span>
                          <span className="font-semibold">{selectedOilReceipt.qualityTest.color || "-"}</span>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">ผลการตรวจสอบ: </span>
                          <span
                            className={`font-semibold ${
                              selectedOilReceipt.qualityTest.testResult === "ผ่าน"
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {selectedOilReceipt.qualityTest.testResult}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">ผู้ตรวจสอบ: </span>
                          <span className="font-semibold">{selectedOilReceipt.qualityTest.testedBy || "-"}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                        รายการน้ำมันที่รับ
                      </h3>
                      <div className="space-y-3">
                        {selectedOilReceipt.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700/50"
                          >
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                              <div>
                                <p className="text-gray-600 dark:text-gray-400">ชนิดน้ำมัน</p>
                                <p className="font-semibold">{item.oilType}</p>
                              </div>
                              <div>
                                <p className="text-gray-600 dark:text-gray-400">จำนวนที่สั่ง</p>
                                <p className="font-semibold">{numberFormatter.format(item.quantityOrdered)} ลิตร</p>
                              </div>
                              <div>
                                <p className="text-gray-600 dark:text-gray-400">จำนวนที่รับจริง</p>
                                <p className="font-semibold">{numberFormatter.format(item.quantityReceived)} ลิตร</p>
                              </div>
                              <div>
                                <p className="text-gray-600 dark:text-gray-400">ส่วนต่าง</p>
                                <p
                                  className={`font-semibold ${
                                    item.differenceLiter > 0
                                      ? "text-green-600"
                                      : item.differenceLiter < 0
                                      ? "text-red-600"
                                      : ""
                                  }`}
                                >
                                  {item.differenceLiter > 0 ? "+" : ""}
                                  {numberFormatter.format(item.differenceLiter)} ลิตร
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-600 dark:text-gray-400">หมายเลขถัง</p>
                                <p className="font-semibold">{item.tankNumber || "-"}</p>
                              </div>
                              <div>
                                <p className="text-gray-600 dark:text-gray-400">ราคาต่อลิตร</p>
                                <p className="font-semibold">{currencyFormatter.format(item.pricePerLiter)}</p>
                              </div>
                              <div>
                                <p className="text-gray-600 dark:text-gray-400">ส่วนต่าง (บาท)</p>
                                <p
                                  className={`font-semibold ${
                                    item.differenceAmount > 0
                                      ? "text-green-600"
                                      : item.differenceAmount < 0
                                      ? "text-red-600"
                                      : ""
                                  }`}
                                >
                                  {item.differenceAmount > 0 ? "+" : ""}
                                  {currencyFormatter.format(item.differenceAmount)}
                                </p>
                              </div>
                              {item.gainLossReason && (
                                <div className="col-span-2">
                                  <p className="text-gray-600 dark:text-gray-400">เหตุผลส่วนต่าง</p>
                                  <p className="font-semibold">{item.gainLossReason}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {selectedOilReceipt.notes && (
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">หมายเหตุ</p>
                        <p className="text-gray-800 dark:text-white">{selectedOilReceipt.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => {
                      setShowDetailModal(false);
                      setSelectedOilReceipt(null);
                    }}
                    className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                  >
                    ปิด
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
