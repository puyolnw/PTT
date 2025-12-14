import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";
import {
    Truck,
    Plus,
    Search,
    User,
    FileText,
    X,
    CheckCircle,
    Clock,
    XCircle,
    Activity,
    PackageCheck,
} from "lucide-react";
import { mockTrucks, mockTrailers, mockTruckOrders } from "./TruckProfiles";
import type { TruckOrder } from "./TruckProfiles";
import StartTripModal from "@/components/truck/StartTripModal";
import EndTripModal from "@/components/truck/EndTripModal";
import { calculateTripMetrics, formatDuration } from "@/utils/odometerValidation";
import { mockApprovedOrders, mockPTTQuotations } from "@/data/gasStationOrders";
import { mockOilReceipts } from "@/data/gasStationReceipts";
import { generateTransportNo } from "@/utils/truckOrderHelpers";

const numberFormatter = new Intl.NumberFormat("th-TH", {
    maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
});

export default function TruckOrders() {
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState<"all" | "draft" | "quotation-recorded" | "ready-to-pickup" | "picking-up" | "completed" | "cancelled">("all");
    const [showCreateOrderModal, setShowCreateOrderModal] = useState(false);
    const [showOrderDetailModal, setShowOrderDetailModal] = useState(false);
    const [showStartTripModal, setShowStartTripModal] = useState(false);
    const [showEndTripModal, setShowEndTripModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<TruckOrder | null>(null);


    // Form state for creating new truck order (not oil order)
    const [newOrder, setNewOrder] = useState({
        orderDate: new Date().toISOString().split("T")[0],
        purchaseOrderNo: "", // เลขที่ใบสั่งซื้อที่จะส่ง
        truckId: "",
        trailerId: "",
        currentOdometer: 0,
        notes: "",
    });

    // State for selected branches to deliver
    const [selectedBranches, setSelectedBranches] = useState<number[]>([]);

    // Get selected purchase order details
    const selectedPurchaseOrder = mockApprovedOrders.find(
        (order) => order.orderNo === newOrder.purchaseOrderNo
    );

    // Combine data from PTTQuotation and OilReceipt
    const combinedOrders = useMemo(() => {
        return mockTruckOrders.map((order) => {
            // Find matching PTT Quotation by purchaseOrderNo
            const quotation = mockPTTQuotations.find(
                (q) => q.purchaseOrderNo === order.purchaseOrderNo
            );

            // Find matching Oil Receipt by purchaseOrderNo or oilReceiptId
            const receipt = mockOilReceipts.find(
                (r) => r.purchaseOrderNo === order.purchaseOrderNo || r.id === order.oilReceiptId
            );

            // Merge data
            const mergedOrder: TruckOrder = {
                ...order,
                // Update from PTT Quotation if exists
                ...(quotation && {
                    pttQuotationNo: quotation.pttQuotationNo,
                    pttQuotationDate: quotation.pttQuotationDate,
                    pttQuotationAmount: quotation.pttQuotationAmount,
                    pttQuotationAttachment: quotation.pttQuotationAttachment,
                    scheduledPickupDate: quotation.scheduledPickupDate,
                    scheduledPickupTime: quotation.scheduledPickupTime,
                    // Update status if quotation exists
                    status: quotation.status === "confirmed" || quotation.status === "ready-to-pickup" 
                        ? "quotation-recorded" 
                        : order.status,
                }),
                // Update from Oil Receipt if exists
                ...(receipt && {
                    deliveryNoteNo: receipt.deliveryNoteNo,
                    oilReceiptId: receipt.id,
                    // Update status to completed if receipt exists
                    status: receipt.status === "completed" ? "completed" : order.status,
                }),
            };

            return mergedOrder;
        });
    }, []);

    // Filter orders
    const filteredOrders = useMemo(() => {
        return combinedOrders.filter((order) => {
            const matchesSearch =
                order.orderNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.transportNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.truckPlateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.driver.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.purchaseOrderNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.pttQuotationNo?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = filterStatus === "all" || order.status === filterStatus;
            return matchesSearch && matchesStatus;
        });
    }, [searchTerm, filterStatus, combinedOrders]);

    // Summary stats
    const stats = useMemo(() => {
        return {
            total: combinedOrders.length,
            draft: combinedOrders.filter((o) => o.status === "draft").length,
            quotationRecorded: combinedOrders.filter((o) => o.status === "quotation-recorded").length,
            pickingUp: combinedOrders.filter((o) => o.status === "picking-up").length,
            completed: combinedOrders.filter((o) => o.status === "completed").length,
        };
    }, [combinedOrders]);

    const handleCreateOrder = () => {
        // Generate transport number
        const transportNo = generateTransportNo();

        // In real app, this would call API
        console.log("Creating truck order:", {
            ...newOrder,
            transportNo,
            selectedBranches,
        });
        setShowCreateOrderModal(false);
        setNewOrder({
            orderDate: new Date().toISOString().split("T")[0],
            purchaseOrderNo: "",
            truckId: "",
            trailerId: "",
            currentOdometer: 0,
            notes: "",
        });
        setSelectedBranches([]);
    };

    const handleViewOrderDetail = (order: TruckOrder) => {
        setSelectedOrder(order);
        setShowOrderDetailModal(true);
    };

    const handleStartTrip = (order: TruckOrder) => {
        setSelectedOrder(order);
        setShowStartTripModal(true);
    };

    const handleEndTrip = (order: TruckOrder) => {
        setSelectedOrder(order);
        setShowEndTripModal(true);
    };

    const onStartTrip = (startOdometer: number, startTime: string, photo?: string) => {
        if (!selectedOrder) return;
        // In real app, this would call API to update order
        console.log("Starting trip:", {
            orderId: selectedOrder.id,
            startOdometer,
            startTime,
            photo,
        });
        alert(`เริ่มเดินทางสำเร็จ!\n\nออเดอร์: ${selectedOrder.orderNo}\nเลขไมล์เริ่มต้น: ${startOdometer.toLocaleString()} กม.`);
        setShowStartTripModal(false);
    };

    const onEndTrip = (endOdometer: number, endTime: string, photo?: string) => {
        if (!selectedOrder || !selectedOrder.startOdometer || !selectedOrder.startTime) return;

        const metrics = calculateTripMetrics(
            selectedOrder.startOdometer,
            endOdometer,
            selectedOrder.startTime,
            endTime
        );

        // In real app, this would call API to update order
        console.log("Ending trip:", {
            orderId: selectedOrder.id,
            endOdometer,
            endTime,
            ...metrics,
            photo,
        });

        alert(
            `จบงานสำเร็จ!\n\nออเดอร์: ${selectedOrder.orderNo}\nระยะทาง: ${metrics.totalDistance.toLocaleString()} กม.\nระยะเวลา: ${formatDuration(metrics.tripDuration)}`
        );
        setShowEndTripModal(false);
    };

    const getOrderStatusColor = (status: string) => {
        switch (status) {
            case "draft":
                return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
            case "quotation-recorded":
                return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
            case "ready-to-pickup":
                return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
            case "picking-up":
                return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
            case "completed":
                return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
            case "cancelled":
                return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
            default:
                return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
        }
    };

    const getOrderStatusText = (status: string) => {
        switch (status) {
            case "draft":
                return "ร่าง";
            case "quotation-recorded":
                return "บันทึกใบเสนอราคาแล้ว";
            case "ready-to-pickup":
                return "พร้อมรับ";
            case "picking-up":
                return "กำลังไปรับ";
            case "completed":
                return "เสร็จสิ้น";
            case "cancelled":
                return "ยกเลิก";
            default:
                return status;
        }
    };

    const getOrderStatusIcon = (status: string) => {
        switch (status) {
            case "draft":
                return <FileText className="w-4 h-4" />;
            case "quotation-recorded":
                return <FileText className="w-4 h-4" />;
            case "ready-to-pickup":
                return <Clock className="w-4 h-4" />;
            case "picking-up":
                return <Activity className="w-4 h-4" />;
            case "completed":
                return <CheckCircle className="w-4 h-4" />;
            case "cancelled":
                return <XCircle className="w-4 h-4" />;
            default:
                return null;
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
                            <Truck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        รอบรับน้ำมัน
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        จัดการรอบรับน้ำมันด้วยรถและหาง
                    </p>
                </div>
                <button
                    onClick={() => setShowCreateOrderModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    สร้างออเดอร์ใหม่
                </button>
            </motion.div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { label: "ออเดอร์ทั้งหมด", value: stats.total, color: "blue", icon: FileText },
                    { label: "ร่าง", value: stats.draft, color: "gray", icon: Clock },
                    { label: "กำลังไปรับ", value: stats.pickingUp, color: "orange", icon: Activity },
                    { label: "เสร็จสิ้น", value: stats.completed, color: "emerald", icon: CheckCircle },
                ].map((stat, index) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</p>
                            </div>
                            <div className={`p-3 bg-${stat.color}-100 dark:bg-${stat.color}-900/30 rounded-lg`}>
                                <stat.icon className={`w-6 h-6 text-${stat.color}-600 dark:text-${stat.color}-400`} />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Search and Filter */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 border border-gray-200 dark:border-gray-700"
            >
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="ค้นหาจากเลขออเดอร์, ทะเบียนรถ, หรือชื่อคนขับ..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="all">สถานะทั้งหมด</option>
                        <option value="draft">ร่าง</option>
                        <option value="quotation-recorded">บันทึกใบเสนอราคาแล้ว</option>
                        <option value="ready-to-pickup">พร้อมรับ</option>
                        <option value="picking-up">กำลังไปรับ</option>
                        <option value="completed">เสร็จสิ้น</option>
                        <option value="cancelled">ยกเลิก</option>
                    </select>
                </div>
            </motion.div>

            {/* Orders Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    เลขออเดอร์
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    เลขที่ขนส่ง
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    เลขที่ PO
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    วันที่
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    รถ / หาง
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    คนขับ
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    ใบเสนอราคา ปตท.
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    สถานะ
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    สถานะรับน้ำมัน
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    การดำเนินการ
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredOrders.map((order) => (
                                <tr
                                    key={order.id}
                                    onClick={() => handleViewOrderDetail(order)}
                                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                                >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <FileText className="w-4 h-4 text-gray-400" />
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                {order.orderNo}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                                        {order.transportNo}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                                        {order.purchaseOrderNo || "-"}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                        {dateFormatter.format(new Date(order.orderDate))}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm">
                                            <div className="font-medium text-gray-900 dark:text-white">
                                                {order.truckPlateNumber}
                                            </div>
                                            <div className="text-gray-500 dark:text-gray-400">{order.trailerPlateNumber}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <User className="w-4 h-4 text-gray-400" />
                                            <span className="text-sm text-gray-900 dark:text-white">{order.driver}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {order.pttQuotationNo ? (
                                            <div className="text-sm">
                                                <div className="font-medium text-blue-600 dark:text-blue-400">
                                                    {order.pttQuotationNo}
                                                </div>
                                                {order.pttQuotationDate && (
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                                        {new Date(order.pttQuotationDate).toLocaleDateString("th-TH")}
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="text-sm text-gray-400 dark:text-gray-500">-</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span
                                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getOrderStatusColor(
                                                order.status
                                            )}`}
                                        >
                                            {getOrderStatusIcon(order.status)}
                                            {getOrderStatusText(order.status)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span
                                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${order.oilReceiptId
                                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                                : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                                                }`}
                                        >
                                            {order.oilReceiptId ? (
                                                <>
                                                    <CheckCircle className="w-3 h-3" />
                                                    รับแล้ว
                                                </>
                                            ) : (
                                                <>
                                                    <Clock className="w-3 h-3" />
                                                    ยังไม่รับ
                                                </>
                                            )}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                                        <div className="flex items-center gap-2">
                                            {order.status === "ready-to-pickup" && (
                                                <button
                                                    onClick={() => handleStartTrip(order)}
                                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                                                >
                                                    เริ่มเดินทาง
                                                </button>
                                            )}
                                            {order.status === "picking-up" && !order.oilReceiptId && (
                                                <>
                                                    <button
                                                        onClick={() => window.location.href = `/app/gas-station/oil-receipt?orderId=${order.id}`}
                                                        className="flex items-center gap-1 px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
                                                    >
                                                        <PackageCheck className="w-4 h-4" />
                                                        บันทึกการรับน้ำมัน
                                                    </button>
                                                    <button
                                                        onClick={() => handleEndTrip(order)}
                                                        className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium"
                                                    >
                                                        จบงาน
                                                    </button>
                                                </>
                                            )}
                                            {order.status === "picking-up" && order.oilReceiptId && (
                                                <button
                                                    onClick={() => handleEndTrip(order)}
                                                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium"
                                                >
                                                    จบงาน
                                                </button>
                                            )}
                                            {order.status === "completed" && order.totalDistance && (
                                                <div className="text-sm text-gray-600 dark:text-gray-400 text-center">
                                                    <div className="font-semibold text-emerald-600 dark:text-emerald-400">
                                                        {numberFormatter.format(order.totalDistance)} กม.
                                                    </div>
                                                    <div className="text-xs">{formatDuration(order.tripDuration)}</div>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredOrders.length === 0 && (
                    <div className="text-center py-12">
                        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 dark:text-gray-400">ไม่พบออเดอร์</p>
                    </div>
                )}
            </motion.div>

            {/* Create Order Modal */}
            <AnimatePresence>
                {showCreateOrderModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        onClick={() => setShowCreateOrderModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">สร้างออเดอร์รถใหม่</h2>
                                <button
                                    onClick={() => setShowCreateOrderModal(false)}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>

                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        วันที่ออเดอร์
                                    </label>
                                    <input
                                        type="date"
                                        value={newOrder.orderDate}
                                        onChange={(e) => setNewOrder({ ...newOrder, orderDate: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        เลขที่ใบสั่งซื้อ (Purchase Order)
                                    </label>
                                    <select
                                        value={newOrder.purchaseOrderNo}
                                        onChange={(e) => setNewOrder({ ...newOrder, purchaseOrderNo: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    >
                                        <option value="">เลือกใบสั่งซื้อ</option>
                                        {mockApprovedOrders.map((order) => (
                                            <option key={order.orderNo} value={order.orderNo}>
                                                {order.orderNo} - {order.supplierOrderNo} ({order.branches.length} ปั๊ม)
                                            </option>
                                        ))}
                                    </select>
                                    {selectedPurchaseOrder && (
                                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                            จำนวนน้ำมันรวม: {numberFormatter.format(
                                                selectedPurchaseOrder.branches.reduce((sum, branch) =>
                                                    sum + branch.items.reduce((s, item) => s + item.quantity, 0), 0
                                                )
                                            )} ลิตร
                                        </p>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            รถหัวลาก
                                        </label>
                                        <select
                                            value={newOrder.truckId}
                                            onChange={(e) => setNewOrder({ ...newOrder, truckId: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        >
                                            <option value="">เลือกรถ</option>
                                            {mockTrucks.map((truck) => (
                                                <option key={truck.id} value={truck.id}>
                                                    {truck.plateNumber} - {truck.brand} {truck.model}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            หางบรรทุก
                                        </label>
                                        <select
                                            value={newOrder.trailerId}
                                            onChange={(e) => setNewOrder({ ...newOrder, trailerId: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        >
                                            <option value="">เลือกหาง</option>
                                            {mockTrailers.map((trailer) => (
                                                <option key={trailer.id} value={trailer.id}>
                                                    {trailer.plateNumber} - {numberFormatter.format(trailer.capacity)} ลิตร
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        เลขไมล์ปัจจุบัน (กม.)
                                    </label>
                                    <input
                                        type="number"
                                        value={newOrder.currentOdometer}
                                        onChange={(e) => setNewOrder({ ...newOrder, currentOdometer: Number(e.target.value) })}
                                        placeholder="กรอกเลขไมล์ปัจจุบันของรถ"
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        หมายเหตุ
                                    </label>
                                    <textarea
                                        value={newOrder.notes}
                                        onChange={(e) => setNewOrder({ ...newOrder, notes: e.target.value })}
                                        placeholder="ระบุหมายเหตุ (ถ้ามี)"
                                        rows={3}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                                <button
                                    onClick={() => setShowCreateOrderModal(false)}
                                    className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                >
                                    ยกเลิก
                                </button>
                                <button
                                    onClick={handleCreateOrder}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    สร้างออเดอร์
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Order Detail Modal */}
            <AnimatePresence>
                {showOrderDetailModal && selectedOrder && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        onClick={() => setShowOrderDetailModal(false)}
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
                                    รายละเอียดออเดอร์ {selectedOrder.orderNo}
                                </h2>
                                <button
                                    onClick={() => setShowOrderDetailModal(false)}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>

                            <div className="p-6 space-y-6">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">สถานะ</span>
                                    <span
                                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getOrderStatusColor(
                                            selectedOrder.status
                                        )}`}
                                    >
                                        {getOrderStatusIcon(selectedOrder.status)}
                                        {getOrderStatusText(selectedOrder.status)}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">วันที่ออเดอร์</p>
                                        <p className="font-semibold text-gray-900 dark:text-white">
                                            {dateFormatter.format(new Date(selectedOrder.orderDate))}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">เลขที่ PO</p>
                                        <p className="font-semibold text-gray-900 dark:text-white">
                                            {selectedOrder.purchaseOrderNo || "-"}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">รถหัวลาก</p>
                                        <p className="font-semibold text-gray-900 dark:text-white">
                                            {selectedOrder.truckPlateNumber}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">หางบรรทุก</p>
                                        <p className="font-semibold text-gray-900 dark:text-white">
                                            {selectedOrder.trailerPlateNumber}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">คนขับ</p>
                                        <p className="font-semibold text-gray-900 dark:text-white">{selectedOrder.driver}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">เลขที่ขนส่ง</p>
                                        <p className="font-semibold text-gray-900 dark:text-white">
                                            {selectedOrder.transportNo}
                                        </p>
                                    </div>
                                </div>

                                {/* PTT Quotation Info */}
                                {selectedOrder.pttQuotationNo && (
                                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                        <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-3">ใบเสนอราคา ปตท.</p>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <p className="text-gray-600 dark:text-gray-400">เลขที่ใบเสนอราคา</p>
                                                <p className="font-semibold text-gray-900 dark:text-white">
                                                    {selectedOrder.pttQuotationNo}
                                                </p>
                                            </div>
                                            {selectedOrder.pttQuotationDate && (
                                                <div>
                                                    <p className="text-gray-600 dark:text-gray-400">วันที่ใบเสนอราคา</p>
                                                    <p className="font-semibold text-gray-900 dark:text-white">
                                                        {dateFormatter.format(new Date(selectedOrder.pttQuotationDate))}
                                                    </p>
                                                </div>
                                            )}
                                            {selectedOrder.pttQuotationAmount && (
                                                <div>
                                                    <p className="text-gray-600 dark:text-gray-400">มูลค่ารวม</p>
                                                    <p className="font-semibold text-gray-900 dark:text-white">
                                                        {new Intl.NumberFormat("th-TH", {
                                                            style: "currency",
                                                            currency: "THB",
                                                            maximumFractionDigits: 0,
                                                        }).format(selectedOrder.pttQuotationAmount)}
                                                    </p>
                                                </div>
                                            )}
                                            {selectedOrder.scheduledPickupDate && (
                                                <div>
                                                    <p className="text-gray-600 dark:text-gray-400">วันนัดรับ</p>
                                                    <p className="font-semibold text-gray-900 dark:text-white">
                                                        {dateFormatter.format(new Date(selectedOrder.scheduledPickupDate))}
                                                        {selectedOrder.scheduledPickupTime && ` ${selectedOrder.scheduledPickupTime}`}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Oil Receipt Info */}
                                {selectedOrder.oilReceiptId && (() => {
                                    const receipt = mockOilReceipts.find(r => r.id === selectedOrder.oilReceiptId);
                                    return receipt ? (
                                        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                                            <p className="text-sm font-semibold text-green-600 dark:text-green-400 mb-3">ข้อมูลการรับน้ำมัน</p>
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <p className="text-gray-600 dark:text-gray-400">เลขที่ใบรับน้ำมัน</p>
                                                    <p className="font-semibold text-gray-900 dark:text-white">
                                                        {receipt.receiptNo}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-600 dark:text-gray-400">เลขที่ใบส่งของ</p>
                                                    <p className="font-semibold text-gray-900 dark:text-white">
                                                        {receipt.deliveryNoteNo}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-600 dark:text-gray-400">วันที่รับ</p>
                                                    <p className="font-semibold text-gray-900 dark:text-white">
                                                        {dateFormatter.format(new Date(receipt.receiveDate))} {receipt.receiveTime}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-600 dark:text-gray-400">จำนวนรายการ</p>
                                                    <p className="font-semibold text-gray-900 dark:text-white">
                                                        {receipt.items.length} รายการ
                                                    </p>
                                                </div>
                                                <div className="col-span-2">
                                                    <p className="text-gray-600 dark:text-gray-400 mb-2">รายการน้ำมันที่รับ</p>
                                                    <div className="space-y-2">
                                                        {receipt.items.map((item, idx) => (
                                                            <div key={idx} className="p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                                                                <div className="flex justify-between items-center">
                                                                    <span className="font-medium text-gray-900 dark:text-white">{item.oilType}</span>
                                                                    <span className="text-gray-600 dark:text-gray-400">
                                                                        {numberFormatter.format(item.quantityReceived)} ลิตร
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : null;
                                })()}

                                {selectedOrder.notes && (
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">หมายเหตุ</p>
                                        <p className="text-gray-900 dark:text-white">{selectedOrder.notes}</p>
                                    </div>
                                )}

                                {selectedOrder.usedInOrderId && (
                                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">ใช้ในออเดอร์น้ำมัน</p>
                                        <p className="font-semibold text-blue-600 dark:text-blue-400">
                                            {selectedOrder.usedInOrderId}
                                        </p>
                                    </div>
                                )}

                                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <p className="text-gray-600 dark:text-gray-400">สร้างเมื่อ</p>
                                            <p className="text-gray-900 dark:text-white">{selectedOrder.createdAt}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-600 dark:text-gray-400">สร้างโดย</p>
                                            <p className="text-gray-900 dark:text-white">{selectedOrder.createdBy}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Start Trip Modal */}
            {selectedOrder && (
                <StartTripModal
                    isOpen={showStartTripModal}
                    onClose={() => setShowStartTripModal(false)}
                    order={selectedOrder}
                    lastOdometerReading={mockTrucks.find(t => t.id === selectedOrder.truckId)?.lastOdometerReading}
                    lastOdometerDate={mockTrucks.find(t => t.id === selectedOrder.truckId)?.lastOdometerDate}
                    onStartTrip={onStartTrip}
                />
            )}

            {/* End Trip Modal */}
            {selectedOrder && (
                <EndTripModal
                    isOpen={showEndTripModal}
                    onClose={() => setShowEndTripModal(false)}
                    order={selectedOrder}
                    onEndTrip={onEndTrip}
                />
            )}
        </div>
    );
}
