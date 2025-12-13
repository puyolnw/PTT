import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
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
} from "lucide-react";
import { mockTrucks, mockTrailers, mockTruckOrders } from "./TruckProfiles";
import type { TruckOrder } from "./TruckProfiles";
import StartTripModal from "@/components/truck/StartTripModal";
import EndTripModal from "@/components/truck/EndTripModal";
import { calculateTripMetrics, formatDuration } from "@/utils/odometerValidation";

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
    const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "in-progress" | "completed" | "cancelled">("all");
    const [showCreateOrderModal, setShowCreateOrderModal] = useState(false);
    const [showOrderDetailModal, setShowOrderDetailModal] = useState(false);
    const [showStartTripModal, setShowStartTripModal] = useState(false);
    const [showEndTripModal, setShowEndTripModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<TruckOrder | null>(null);

    // Form state for creating new truck order (not oil order)
    const [newOrder, setNewOrder] = useState({
        orderDate: new Date().toISOString().split("T")[0],
        truckId: "",
        trailerId: "",
        notes: "",
    });

    // Filter orders
    const filteredOrders = mockTruckOrders.filter((order) => {
        const matchesSearch =
            order.orderNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.truckPlateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.driver.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === "all" || order.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    // Summary stats
    const stats = {
        total: mockTruckOrders.length,
        pending: mockTruckOrders.filter((o) => o.status === "pending").length,
        inProgress: mockTruckOrders.filter((o) => o.status === "in-progress").length,
        completed: mockTruckOrders.filter((o) => o.status === "completed").length,
    };

    const handleCreateOrder = () => {
        // In real app, this would call API
        console.log("Creating truck order:", newOrder);
        setShowCreateOrderModal(false);
        setNewOrder({
            orderDate: new Date().toISOString().split("T")[0],
            truckId: "",
            trailerId: "",
            notes: "",
        });
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
            case "pending":
                return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
            case "in-use":
                return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
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
            case "pending":
                return "รอดำเนินการ";
            case "in-use":
                return "กำลังใช้งาน";
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
            case "pending":
                return <Clock className="w-4 h-4" />;
            case "in-use":
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
                    { label: "รอดำเนินการ", value: stats.pending, color: "yellow", icon: Clock },
                    { label: "กำลังใช้งาน", value: stats.inProgress, color: "blue", icon: Activity },
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
                        <option value="pending">รอดำเนินการ</option>
                        <option value="in-progress">กำลังใช้งาน</option>
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
                                    วันที่
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    รถ / หาง
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    คนขับ
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    สถานะ
                                </th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    จัดการ
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
                                        <span
                                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getOrderStatusColor(
                                                order.status
                                            )}`}
                                        >
                                            {getOrderStatusIcon(order.status)}
                                            {getOrderStatusText(order.status)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                                        {order.status === "pending" && (
                                            <button
                                                onClick={() => handleStartTrip(order)}
                                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                                            >
                                                เริ่มเดินทาง
                                            </button>
                                        )}
                                        {order.status === "in-progress" && (
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
                                        <p className="text-sm text-gray-600 dark:text-gray-400">จากสาขา</p>
                                        <p className="font-semibold text-gray-900 dark:text-white">{selectedOrder.fromBranch}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">ไปสาขา</p>
                                        <p className="font-semibold text-gray-900 dark:text-white">{selectedOrder.toBranch}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">ประเภทน้ำมัน</p>
                                        <p className="font-semibold text-gray-900 dark:text-white">{selectedOrder.oilType}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">ปริมาณ</p>
                                        <p className="font-semibold text-gray-900 dark:text-white">
                                            {numberFormatter.format(selectedOrder.quantity)} ลิตร
                                        </p>
                                    </div>
                                </div>

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
