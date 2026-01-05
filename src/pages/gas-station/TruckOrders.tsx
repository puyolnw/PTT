import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, CheckCircle, Clock, Activity, XCircle, X, PackageCheck, User, GripVertical, Truck, MapPin, Eye, Droplet, Search, MoreHorizontal } from "lucide-react";
import { mockApprovedOrders, mockPTTQuotations } from "../../data/gasStationOrders";
import { mockTrucks, mockTrailers } from "../gas-station/TruckProfiles";
import { mockDrivers } from "../../data/mockData";
import { mockOilReceipts } from "../../data/gasStationReceipts";
import { useGasStation } from "@/contexts/GasStationContext";
import StartTripModal from "../../components/truck/StartTripModal";
import EndTripModal from "../../components/truck/EndTripModal";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useBranch } from "@/contexts/BranchContext";
import { CSS } from "@dnd-kit/utilities";

// Helper functions (moved from missing utils or reconstructed)
const generateTransportNo = () => {
    const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `TP-${date}-${random}`;
};

const formatDuration = (ms?: number) => {
    if (!ms) return '-';
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours} ชม. ${minutes} นาที`;
};

const calculateTripMetrics = (startOdo: number, endOdo: number, startTime: string, endTime: string) => {
    const totalDistance = endOdo - startOdo;
    const duration = new Date(endTime).getTime() - new Date(startTime).getTime();
    return { totalDistance, tripDuration: duration };
};

const numberFormatter = new Intl.NumberFormat("th-TH");
const dateFormatter = new Intl.DateTimeFormat("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long"
});
const dateFormatterShort = new Intl.DateTimeFormat("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric"
});

// Import TruckOrder type from TruckProfiles
import type { TruckOrder } from "./TruckProfiles";

// Extended interface for local use (with branches)
interface ExtendedTruckOrder extends TruckOrder {
    branches?: any[];
    departureDate?: string;
}

// Sortable Branch Item Component
function SortableBranchItem({ branch, index }: { branch: any; index: number }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: branch.branchId });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border border-gray-200 dark:border-gray-600 flex items-start gap-3"
        >
            <div
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing mt-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
                <GripVertical className="w-5 h-5" />
            </div>
            <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-semibold">
                        {index + 1}
                    </span>
                    <p className="font-semibold text-gray-800 dark:text-gray-200">{branch.branchName}</p>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{branch.address}</p>
                <ul className="list-disc ml-5 mt-2 space-y-1">
                    {branch.items.map((item: any, i: number) => (
                        <li key={i} className="text-sm text-gray-600 dark:text-gray-300">
                            <span className="font-medium">{item.oilType}</span>: {numberFormatter.format(item.quantity)} ลิตร
                        </li>
                    ))}
                </ul>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    รวม: {numberFormatter.format(branch.totalAmount)} บาท
                </p>
            </div>
        </div>
    );
}

export default function TruckOrders() {
    const { branches } = useGasStation();
    const { selectedBranches } = useBranch();
    const selectedBranchIds = useMemo(() => selectedBranches.map(id => Number(id)), [selectedBranches]);

    // State definitions
    const [newOrder, setNewOrder] = useState({
        orderDate: new Date().toISOString().split("T")[0],
        departureDate: "",
        purchaseOrderNo: "",
        transportNo: generateTransportNo(), // เลขขนส่งอัตโนมัติ
        truckId: "",
        trailerId: "",
        driverId: "",
        currentOdometer: 0,
        startFuel: 0, // น้ำมันตอนเริ่มต้น (ลิตร)
        notes: "",
    });
    const [showCreateOrderModal, setShowCreateOrderModal] = useState(false);
    const [showOrderDetailModal, setShowOrderDetailModal] = useState(false);
    const [showStartTripModal, setShowStartTripModal] = useState(false);
    const [showEndTripModal, setShowEndTripModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<ExtendedTruckOrder | null>(null);
    const [orderedBranches, setOrderedBranches] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [filterDateFrom, setFilterDateFrom] = useState<string>("");
    const [filterDateTo, setFilterDateTo] = useState<string>("");
    const [filterBranch, setFilterBranch] = useState<number | "all">("all");

    // DnD Sensors
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Helper: get selected purchase order
    const selectedPurchaseOrder = useMemo(() => {
        return mockApprovedOrders.find((o) => o.orderNo === newOrder.purchaseOrderNo) || null;
    }, [newOrder.purchaseOrderNo]);

    // Get selected truck and trailer info
    const selectedTruck = useMemo(() => {
        return mockTrucks.find((t: any) => t.id === newOrder.truckId) || null;
    }, [newOrder.truckId]);

    const selectedTrailer = useMemo(() => {
        return mockTrailers.find((t: any) => t.id === newOrder.trailerId) || null;
    }, [newOrder.trailerId]);

    const selectedDriver = useMemo(() => {
        return mockDrivers.find((d: any) => String(d.id) === newOrder.driverId) || null;
    }, [newOrder.driverId]);

    // Auto-fill data when purchase order is selected
    useEffect(() => {
        if (selectedPurchaseOrder) {
            // Auto-fill branches
            if (selectedPurchaseOrder.branches) {
                setOrderedBranches([...selectedPurchaseOrder.branches]);
            } else {
                setOrderedBranches([]);
            }

            // Auto-fill truck, trailer, driver, and odometer from purchase order
            if (selectedPurchaseOrder.truckId || selectedPurchaseOrder.truckPlateNumber) {
                setNewOrder((prev) => ({
                    ...prev,
                    truckId: selectedPurchaseOrder.truckId || prev.truckId,
                    trailerId: selectedPurchaseOrder.trailerId || prev.trailerId,
                    driverId: selectedPurchaseOrder.driverId || prev.driverId,
                    currentOdometer: selectedPurchaseOrder.currentOdometer || prev.currentOdometer,
                }));
            }
        } else {
            setOrderedBranches([]);
        }
    }, [selectedPurchaseOrder]);

    // Auto-fill odometer when truck is selected (fallback if not in purchase order)
    useEffect(() => {
        if (selectedTruck && selectedTruck.lastOdometerReading && !selectedPurchaseOrder?.currentOdometer) {
            setNewOrder((prev) => ({
                ...prev,
                currentOdometer: selectedTruck.lastOdometerReading || 0,
            }));
        }
    }, [selectedTruck, selectedPurchaseOrder]);

    // Auto-fill start fuel when truck is selected (fallback from Truck Profile)
    useEffect(() => {
        if (!selectedTruck) return;
        if (typeof selectedTruck.lastFuelReading !== "number") return;
        // Only auto-fill when user hasn't entered anything yet
        if (newOrder.startFuel && newOrder.startFuel > 0) return;
        setNewOrder((prev) => ({
            ...prev,
            startFuel: selectedTruck.lastFuelReading ?? prev.startFuel,
        }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedTruck?.id]);

    // Generate transport number when modal opens
    useEffect(() => {
        if (showCreateOrderModal) {
            setNewOrder((prev) => ({
                ...prev,
                transportNo: generateTransportNo(),
            }));
        }
    }, [showCreateOrderModal]);

    // Handle drag end for branch reordering
    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setOrderedBranches((items) => {
                const oldIndex = items.findIndex((item) => item.branchId === active.id);
                const newIndex = items.findIndex((item) => item.branchId === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    // Data Merging Logic
    const combinedOrders = useMemo(() => {
        return mockApprovedOrders.map((order) => {
            // Find matching PTT Quotation
            const quotation = mockPTTQuotations.find(q => q.purchaseOrderNo === order.orderNo);

            // Base merged order structure - ดึงข้อมูลจาก Purchase Order ก่อน
            let mergedOrder: ExtendedTruckOrder = {
                id: order.orderNo, // Use orderNo as ID
                orderNo: order.orderNo,
                orderDate: order.orderDate,
                purchaseOrderNo: order.orderNo,
                transportNo: (quotation as any)?.transportNo || generateTransportNo(),
                truckId: order.truckId || "",
                truckPlateNumber: order.truckPlateNumber || quotation?.truckPlateNumber || "-",
                trailerId: order.trailerId || "",
                trailerPlateNumber: order.trailerPlateNumber || quotation?.trailerPlateNumber || "-",
                driver: order.driverName || quotation?.driverName || "-",
                currentOdometer: order.currentOdometer || 0,
                startFuel: 0, // จะถูกบันทึกเมื่อเริ่มเที่ยว
                fromBranch: order.branches[0]?.branchName || "สาขาใหญ่",
                toBranch: order.branches.length > 0
                    ? order.branches.map((b: any) => b.branchName).join(", ")
                    : "หลายสาขา",
                oilType: order.items[0]?.oilType || "Premium Diesel",
                quantity: order.items.reduce((sum: number, item: any) => sum + item.quantity, 0),
                status: order.status as TruckOrder["status"],
                branches: order.branches,
                createdAt: order.approvedAt || new Date().toISOString(),
                createdBy: order.approvedBy || "ระบบ"
            };

            // Update details from Quotation if exists (fallback ถ้า Purchase Order ไม่มีข้อมูล)
            if (quotation) {
                // Get truck and trailer IDs from quotation if not already set from Purchase Order
                const truckFromQuotation = !mergedOrder.truckId
                    ? mockTrucks.find((t: any) => t.plateNumber === quotation.truckPlateNumber)
                    : null;
                const trailerFromQuotation = !mergedOrder.trailerId
                    ? mockTrailers.find((t: any) => t.plateNumber === quotation.trailerPlateNumber)
                    : null;

                mergedOrder = {
                    ...mergedOrder,
                    truckId: mergedOrder.truckId || truckFromQuotation?.id || "",
                    truckPlateNumber: mergedOrder.truckPlateNumber || quotation.truckPlateNumber,
                    trailerId: mergedOrder.trailerId || trailerFromQuotation?.id || "",
                    trailerPlateNumber: mergedOrder.trailerPlateNumber || quotation.trailerPlateNumber,
                    driver: mergedOrder.driver || quotation.driverName,
                    pttQuotationNo: quotation.pttQuotationNo,
                    pttQuotationDate: quotation.pttQuotationDate,
                    pttQuotationAmount: quotation.pttQuotationAmount,
                    scheduledPickupDate: quotation.scheduledPickupDate,
                    scheduledPickupTime: quotation.scheduledPickupTime,
                    // Update status logic
                    status: (quotation.status === "confirmed" || quotation.status === "ready-to-pickup")
                        ? "quotation-recorded"
                        : (mergedOrder.status as TruckOrder["status"]),
                };
            }

            // Find matching Oil Receipt
            // Note: In real app, we need a better link than implicit orderNo or logic
            const receipt = mockOilReceipts?.find(r => r.deliveryNoteNo === order.supplierOrderNo); // Example link

            if (receipt) {
                mergedOrder.deliveryNoteNo = receipt.deliveryNoteNo;
                mergedOrder.oilReceiptId = receipt.id;
                mergedOrder.status = receipt.status === "completed" ? "completed" : mergedOrder.status;
            }

            return mergedOrder;
        });
    }, []);

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

            // Date filter
            const matchesDate = isDateInRange(order.orderDate, filterDateFrom, filterDateTo);

            // Branch filter
            const matchesBranch = filterBranch === "all" ||
                (order.branches && order.branches.some((b: any) => b.branchId === filterBranch));

            // Global branch filter
            const matchesGlobalBranch = selectedBranchIds.length === 0 ||
                (order.branches && order.branches.some((b: any) => selectedBranchIds.includes(b.branchId)));

            return matchesSearch && matchesStatus && matchesDate && matchesBranch && matchesGlobalBranch;
        });
    }, [searchTerm, filterStatus, filterDateFrom, filterDateTo, filterBranch, combinedOrders, selectedBranchIds]);

    const handleCreateOrder = () => {
        if (!newOrder.purchaseOrderNo || !newOrder.truckId || !newOrder.trailerId || !newOrder.driverId) {
            alert("กรุณากรอกข้อมูลให้ครบถ้วน");
            return;
        }

        // In real app, this would call API
        console.log("Creating truck order:", {
            ...newOrder,
            transportNo: newOrder.transportNo,
            orderedBranches,
            truckPlateNumber: selectedTruck?.plateNumber,
            trailerPlateNumber: selectedTrailer?.plateNumber,
            driverName: selectedDriver ? selectedDriver.name : "",
        });
        setShowCreateOrderModal(false);
        setNewOrder({
            orderDate: new Date().toISOString().split("T")[0],
            departureDate: "",
            purchaseOrderNo: "",
            transportNo: generateTransportNo(), // สร้างเลขขนส่งใหม่สำหรับรอบถัดไป
            truckId: "",
            trailerId: "",
            driverId: "",
            currentOdometer: 0,
            startFuel: 0,
            notes: "",
        });
        setOrderedBranches([]);
    };

    const handleViewOrderDetail = (order: ExtendedTruckOrder) => {
        setSelectedOrder(order);
        setShowOrderDetailModal(true);
    };

    const handleStartTrip = (order: ExtendedTruckOrder) => {
        setSelectedOrder(order);
        setShowStartTripModal(true);
    };

    const handleEndTrip = (order: ExtendedTruckOrder) => {
        setSelectedOrder(order);
        setShowEndTripModal(true);
    };

    const onStartTrip = (startOdometer: number, startTime: string, photo?: string, startFuel?: number) => {
        if (!selectedOrder) return;
        console.log("Starting trip:", {
            orderId: selectedOrder.id,
            startOdometer,
            startTime,
            startFuel,
            photo,
        });
        alert(`เริ่มเดินทางสำเร็จ!\n\nออเดอร์: ${selectedOrder.orderNo}\nเลขไมล์เริ่มต้น: ${startOdometer.toLocaleString()} กม.\nน้ำมันตอนเริ่มต้น: ${startFuel ? `${startFuel.toLocaleString()} ลิตร` : '-'}`);
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
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                            <Truck className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                รายการขนส่ง (Truck Orders)
                            </h1>
                            <p className="text-gray-500 dark:text-gray-400 mt-1">
                                จัดการเที่ยวรถขนส่ง บันทึกเลขไมล์ และติดตามสถานะการจัดส่ง
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-4">
                        <div className="flex items-center gap-2 bg-white/50 dark:bg-gray-800/50 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm backdrop-blur-sm">
                            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                สาขาที่กำลังดู: {selectedBranches.length === 0 ? "ทั้งหมด" : selectedBranches.map(id => branches.find(b => String(b.id) === id)?.name || id).join(", ")}
                            </span>
                        </div>
                        <button
                            onClick={() => setShowCreateOrderModal(true)}
                            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium"
                        >
                            <PackageCheck className="w-5 h-5" />
                            สร้างการขนส่งใหม่
                        </button>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
                <div className="space-y-4">
                    {/* Row 1: Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="ค้นหาเลขออเดอร์, เลขขนส่ง, รถ, คนขับ..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    {/* Row 2: Filters */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="all">สถานะทั้งหมด</option>
                            <option value="draft">ร่าง</option>
                            <option value="quotation-recorded">บันทึกใบเสนอราคาแล้ว</option>
                            <option value="ready-to-pickup">พร้อมรับ</option>
                            <option value="picking-up">กำลังไปรับ</option>
                            <option value="completed">เสร็จสิ้น</option>
                            <option value="cancelled">ยกเลิก</option>
                        </select>

                        <select
                            value={filterBranch === "all" ? "all" : filterBranch}
                            onChange={(e) => setFilterBranch(e.target.value === "all" ? "all" : Number(e.target.value))}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="all">ทุกปั๊ม</option>
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

                        <div className="flex items-center gap-2">
                            <input
                                type="date"
                                value={filterDateFrom}
                                onChange={(e) => setFilterDateFrom(e.target.value)}
                                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                title="วันที่เริ่มต้น"
                            />
                            <span className="text-gray-500 dark:text-gray-400 font-medium">ถึง</span>
                            <input
                                type="date"
                                value={filterDateTo}
                                onChange={(e) => setFilterDateTo(e.target.value)}
                                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                title="วันที่สิ้นสุด"
                            />
                        </div>

                        {(filterDateFrom || filterDateTo || searchTerm || filterStatus !== "all" || filterBranch !== "all") && (
                            <button
                                onClick={() => {
                                    setSearchTerm("");
                                    setFilterStatus("all");
                                    setFilterDateFrom("");
                                    setFilterDateTo("");
                                    setFilterBranch("all");
                                }}
                                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors border border-gray-300 dark:border-gray-600 whitespace-nowrap"
                            >
                                ล้างตัวกรอง
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    <div className="flex items-center gap-2">
                                        <FileText className="w-4 h-4" />
                                        เลขออเดอร์
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    <div className="flex items-center gap-2">
                                        <Truck className="w-4 h-4" />
                                        เลขที่ขนส่ง
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4" />
                                        วันที่
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    <div className="flex items-center gap-2">
                                        <Truck className="w-4 h-4" />
                                        รถ / หาง
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    <div className="flex items-center gap-2">
                                        <User className="w-4 h-4" />
                                        คนขับ
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    <div className="flex items-center gap-2">
                                        <Activity className="w-4 h-4" />
                                        เลขไมล์
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    <div className="flex items-center gap-2">
                                        <Droplet className="w-4 h-4" />
                                        น้ำมันเริ่มต้น
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4" />
                                        ปลายทาง
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">สถานะ</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">สถานะรับน้ำมัน</th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                            {filteredOrders.map((order) => (
                                <tr
                                    key={order.id}
                                    onClick={() => handleViewOrderDetail(order)}
                                    className="hover:bg-blue-50/50 dark:hover:bg-gray-700/70 cursor-pointer transition-all duration-200 group"
                                >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-md group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
                                                <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <span className="text-sm font-semibold text-gray-900 dark:text-white">{order.orderNo}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                                            {order.transportNo}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm text-gray-900 dark:text-white">
                                            {dateFormatterShort.format(new Date(order.orderDate))}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-1.5">
                                                <Truck className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                                                <span className="text-sm font-medium text-gray-900 dark:text-white">{order.truckPlateNumber}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                                                <span className="ml-5">{order.trailerPlateNumber}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <div className="p-1 bg-gray-100 dark:bg-gray-700 rounded-full">
                                                <User className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
                                            </div>
                                            <span className="text-sm text-gray-900 dark:text-white">{order.driver}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                                            {order.currentOdometer ? `${numberFormatter.format(order.currentOdometer)} กม.` : '-'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <Droplet className="w-4 h-4 text-blue-500" />
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                {order.startFuel ? `${numberFormatter.format(order.startFuel)} ลิตร` : '-'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-4 h-4 text-gray-400" />
                                            <span className="text-sm text-gray-700 dark:text-gray-300">
                                                {order.branches && order.branches.length > 0
                                                    ? `${order.branches.length} ปั๊ม`
                                                    : order.toBranch || '-'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium shadow-sm ${getOrderStatusColor(order.status)}`}>
                                            {getOrderStatusIcon(order.status)}
                                            {getOrderStatusText(order.status)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium shadow-sm ${order.oilReceiptId ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"}`}>
                                            {order.oilReceiptId ? (
                                                <>
                                                    <CheckCircle className="w-3.5 h-3.5" />
                                                    รับแล้ว
                                                </>
                                            ) : (
                                                <>
                                                    <Clock className="w-3.5 h-3.5" />
                                                    ยังไม่รับ
                                                </>
                                            )}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                                        <div className="flex items-center gap-2 justify-center">
                                            {order.status === "ready-to-pickup" && (
                                                <button
                                                    onClick={() => handleStartTrip(order)}
                                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm hover:shadow-md"
                                                >
                                                    เริ่มเดินทาง
                                                </button>
                                            )}
                                            {order.status === "picking-up" && !order.oilReceiptId && (
                                                <>
                                                    <button
                                                        onClick={() => window.location.href = `/app/gas-station/oil-receipt?orderId=${order.id}`}
                                                        className="flex items-center gap-1.5 px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium shadow-sm hover:shadow-md"
                                                    >
                                                        <PackageCheck className="w-4 h-4" />
                                                        บันทึกการรับน้ำมัน
                                                    </button>
                                                    <button
                                                        onClick={() => handleEndTrip(order)}
                                                        className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium shadow-sm hover:shadow-md"
                                                    >
                                                        จบงาน
                                                    </button>
                                                </>
                                            )}
                                            {order.status === "picking-up" && order.oilReceiptId && (
                                                <button
                                                    onClick={() => handleEndTrip(order)}
                                                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium shadow-sm hover:shadow-md"
                                                >
                                                    จบงาน
                                                </button>
                                            )}
                                            {order.status === "completed" && order.totalDistance && (
                                                <div className="text-sm text-center bg-emerald-50 dark:bg-emerald-900/20 px-3 py-2 rounded-lg">
                                                    <div className="font-semibold text-emerald-600 dark:text-emerald-400">{numberFormatter.format(order.totalDistance)} กม.</div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">{order.tripDuration && formatDuration(order.tripDuration)}</div>
                                                </div>
                                            )}
                                            <button
                                                onClick={() => handleViewOrderDetail(order)}
                                                className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                                title="ดูรายละเอียด"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-500 dark:text-gray-400">
                                                <MoreHorizontal className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>

                            ))
                            }
                        </tbody >
                    </table >
                </div >
                {
                    filteredOrders.length === 0 && (
                        <div className="text-center py-16">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
                                <FileText className="w-8 h-8 text-gray-400" />
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">ไม่พบรายการขนส่ง</p>
                            <p className="text-gray-500 dark:text-gray-500 text-sm mt-1">คลิกปุ่ม "สร้างการขนส่งใหม่" เพื่อเพิ่มรายการ</p>
                        </div>
                    )
                }
            </div >

            {/* Create Order Modal */}
            <AnimatePresence>
                {
                    showCreateOrderModal && (
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
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">สร้างการขนส่งใหม่</h2>
                                    <button
                                        onClick={() => setShowCreateOrderModal(false)}
                                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                    >
                                        <X className="w-5 h-5 text-gray-500" />
                                    </button>
                                </div>

                                <div className="p-6 space-y-4">
                                    {/* เลขขนส่ง */}
                                    <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            เลขขนส่ง (Transport No.) *
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="text"
                                                value={newOrder.transportNo}
                                                onChange={(e) => setNewOrder({ ...newOrder, transportNo: e.target.value })}
                                                className="flex-1 px-4 py-2 border border-blue-300 dark:border-blue-700 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-semibold focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="TP-YYYYMMDD-XXX"
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setNewOrder({ ...newOrder, transportNo: generateTransportNo() })}
                                                className="text-xs text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-700 px-3 py-2 rounded border border-blue-300 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors whitespace-nowrap"
                                                title="สร้างเลขขนส่งใหม่"
                                            >
                                                สร้างใหม่
                                            </button>
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            💡 เลขขนส่งจะถูกสร้างอัตโนมัติเมื่อเปิดฟอร์มนี้ หรือคลิกปุ่ม "สร้างใหม่" เพื่อสร้างเลขใหม่
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                วันที่สร้างออเดอร์รถ *
                                            </label>
                                            <input
                                                type="date"
                                                value={newOrder.orderDate}
                                                onChange={(e) => setNewOrder({ ...newOrder, orderDate: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                วันที่ออกไปรับ *
                                            </label>
                                            <input
                                                type="date"
                                                value={newOrder.departureDate}
                                                onChange={(e) => setNewOrder({ ...newOrder, departureDate: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            เลือกใบสั่งซื้อ (Purchase Order) *
                                        </label>
                                        <select
                                            value={newOrder.purchaseOrderNo}
                                            onChange={(e) => setNewOrder({ ...newOrder, purchaseOrderNo: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                            required
                                        >
                                            <option value="">เลือกใบสั่งซื้อ</option>
                                            {mockApprovedOrders.map((order) => (
                                                <option key={order.orderNo} value={order.orderNo}>
                                                    {order.orderNo} - {order.supplierOrderNo} ({order.branches.length} ปั๊ม)
                                                </option>
                                            ))}
                                        </select>
                                        {selectedPurchaseOrder && (
                                            <div className="mt-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                                <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                                                    📋 สรุปใบสั่งซื้อ: {selectedPurchaseOrder.orderNo}
                                                </p>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs mb-3">
                                                    <div className="bg-white/70 dark:bg-gray-800/40 border border-blue-100 dark:border-blue-900/40 rounded-lg p-2">
                                                        <p className="text-gray-600 dark:text-gray-400">ใบอนุมัติขายเลขที่</p>
                                                        <p className="font-semibold text-gray-900 dark:text-white">{selectedPurchaseOrder.approveNo || "-"}</p>
                                                    </div>
                                                    <div className="bg-white/70 dark:bg-gray-800/40 border border-blue-100 dark:border-blue-900/40 rounded-lg p-2">
                                                        <p className="text-gray-600 dark:text-gray-400">ใบสั่งซื้อเลขที่</p>
                                                        <p className="font-semibold text-gray-900 dark:text-white">{selectedPurchaseOrder.orderNo}</p>
                                                    </div>
                                                    <div className="bg-white/70 dark:bg-gray-800/40 border border-blue-100 dark:border-blue-900/40 rounded-lg p-2">
                                                        <p className="text-gray-600 dark:text-gray-400">Contract No.</p>
                                                        <p className="font-semibold text-gray-900 dark:text-white">{selectedPurchaseOrder.contractNo || "-"}</p>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2 text-xs">
                                                    <div>
                                                        <span className="text-gray-600 dark:text-gray-400">จำนวนน้ำมันรวม:</span>
                                                        <span className="font-semibold text-blue-600 dark:text-blue-400 ml-1">
                                                            {numberFormatter.format(
                                                                selectedPurchaseOrder.branches.reduce((sum, branch) =>
                                                                    sum + branch.items.reduce((s, item) => s + item.quantity, 0), 0
                                                                )
                                                            )} ลิตร
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-600 dark:text-gray-400">จำนวนปั๊ม:</span>
                                                        <span className="font-semibold text-blue-600 dark:text-blue-400 ml-1">
                                                            {selectedPurchaseOrder.branches.length} ปั๊ม
                                                        </span>
                                                    </div>
                                                </div>
                                                {(selectedPurchaseOrder.truckPlateNumber || selectedPurchaseOrder.driverName) && (
                                                    <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-800">
                                                        <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">ข้อมูลที่ fix มากับใบสั่งซื้อ:</p>
                                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                                            {selectedPurchaseOrder.truckPlateNumber && (
                                                                <div>
                                                                    <span className="text-gray-600 dark:text-gray-400">รถ:</span>
                                                                    <span className="font-medium text-gray-900 dark:text-white ml-1">
                                                                        {selectedPurchaseOrder.truckPlateNumber}
                                                                    </span>
                                                                </div>
                                                            )}
                                                            {selectedPurchaseOrder.trailerPlateNumber && (
                                                                <div>
                                                                    <span className="text-gray-600 dark:text-gray-400">หาง:</span>
                                                                    <span className="font-medium text-gray-900 dark:text-white ml-1">
                                                                        {selectedPurchaseOrder.trailerPlateNumber}
                                                                    </span>
                                                                </div>
                                                            )}
                                                            {selectedPurchaseOrder.driverName && (
                                                                <div>
                                                                    <span className="text-gray-600 dark:text-gray-400">คนขับ:</span>
                                                                    <span className="font-medium text-gray-900 dark:text-white ml-1">
                                                                        {selectedPurchaseOrder.driverName}
                                                                    </span>
                                                                </div>
                                                            )}
                                                            {selectedPurchaseOrder.currentOdometer && (
                                                                <div>
                                                                    <span className="text-gray-600 dark:text-gray-400">เลขไมล์:</span>
                                                                    <span className="font-medium text-gray-900 dark:text-white ml-1">
                                                                        {numberFormatter.format(selectedPurchaseOrder.currentOdometer)} กม.
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                                <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-800">
                                                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">เลขไมล์ / น้ำมัน (ดึงอัตโนมัติ):</p>
                                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                                        <div>
                                                            <span className="text-gray-600 dark:text-gray-400">เลขไมล์ปัจจุบัน:</span>
                                                            <span className="font-medium text-gray-900 dark:text-white ml-1">
                                                                {newOrder.currentOdometer ? `${numberFormatter.format(newOrder.currentOdometer)} กม.` : "-"}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-600 dark:text-gray-400">น้ำมันตอนเริ่มต้น:</span>
                                                            <span className="font-medium text-gray-900 dark:text-white ml-1">
                                                                {newOrder.startFuel ? `${numberFormatter.format(newOrder.startFuel)} ลิตร` : "-"}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                                                        เลขไมล์: ดึงจากใบสั่งซื้อก่อน ถ้าไม่มีจะดึงจาก Profile รถ • น้ำมัน: ดึงจาก Profile รถ (ถ้ามี) และยังแก้ไขได้
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                รถหัวลาก (ดึงจาก Profile รถ) *
                                            </label>
                                            <select
                                                value={newOrder.truckId}
                                                onChange={(e) => setNewOrder({ ...newOrder, truckId: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                                required
                                            >
                                                <option value="">เลือกรถ</option>
                                                {mockTrucks.map((truck: any) => (
                                                    <option key={truck.id} value={truck.id}>
                                                        {truck.plateNumber} - {truck.brand} {truck.model}
                                                    </option>
                                                ))}
                                            </select>
                                            {selectedTruck && (
                                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                    💡 เลขไมล์ล่าสุด: {selectedTruck.lastOdometerReading?.toLocaleString() || "-"} กม.
                                                    {selectedTruck.lastOdometerDate && ` (${dateFormatterShort.format(new Date(selectedTruck.lastOdometerDate))})`}
                                                </p>
                                            )}
                                            {selectedPurchaseOrder?.truckId && !newOrder.truckId && (
                                                <p className="mt-1 text-xs text-blue-600 dark:text-blue-400 font-medium">
                                                    ✅ ข้อมูลถูกดึงมาจากใบสั่งซื้ออัตโนมัติ
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                หางลาก (ดึงจาก Profile รถ) *
                                            </label>
                                            <select
                                                value={newOrder.trailerId}
                                                onChange={(e) => setNewOrder({ ...newOrder, trailerId: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                                required
                                            >
                                                <option value="">เลือกหาง</option>
                                                {mockTrailers.map((trailer: any) => (
                                                    <option key={trailer.id} value={trailer.id}>
                                                        {trailer.plateNumber} - ความจุ {numberFormatter.format(trailer.capacity)} ลิตร
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            คนขับรถ *
                                        </label>
                                        <select
                                            value={newOrder.driverId}
                                            onChange={(e) => setNewOrder({ ...newOrder, driverId: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                            required
                                        >
                                            <option value="">เลือกคนขับ</option>
                                            {mockDrivers.map((driver) => (
                                                <option key={driver.id} value={driver.id}>
                                                    {driver.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                เลขไมล์ปัจจุบัน (กม.) - แก้ไขได้ *
                                            </label>
                                            <input
                                                type="number"
                                                value={newOrder.currentOdometer}
                                                onChange={(e) => setNewOrder({ ...newOrder, currentOdometer: Number(e.target.value) })}
                                                placeholder="เลขไมล์จะดึงมาจาก Profile รถอัตโนมัติ (แก้ไขได้)"
                                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                                required
                                            />
                                            {selectedPurchaseOrder?.currentOdometer && (
                                                <p className="mt-1 text-xs text-blue-600 dark:text-blue-400 font-medium">
                                                    ✅ ดึงมาจากใบสั่งซื้อ: {numberFormatter.format(selectedPurchaseOrder.currentOdometer)} กม. (แก้ไขได้)
                                                </p>
                                            )}
                                            {!selectedPurchaseOrder?.currentOdometer && selectedTruck && selectedTruck.lastOdometerReading && (
                                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                    💡 ดึงมาจาก Profile รถ: {selectedTruck.lastOdometerReading.toLocaleString()} กม. (แก้ไขได้)
                                                </p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                <div className="flex items-center gap-2">
                                                    <Droplet className="w-4 h-4 text-blue-500" />
                                                    น้ำมันตอนเริ่มต้น (ลิตร) *
                                                </div>
                                            </label>
                                            <input
                                                type="number"
                                                value={newOrder.startFuel}
                                                onChange={(e) => setNewOrder({ ...newOrder, startFuel: Number(e.target.value) })}
                                                placeholder="กรอกจำนวนน้ำมันในถังตอนเริ่มต้น"
                                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                                required
                                                min="0"
                                                step="0.1"
                                            />
                                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                💡 บันทึกจำนวนน้ำมันในถังรถขนส่งตอนเริ่มต้นเที่ยว
                                            </p>
                                        </div>
                                    </div>

                                    {/* รายการน้ำมันแต่ละปั๊ม - Drag & Drop */}
                                    {selectedPurchaseOrder && orderedBranches.length > 0 && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                รายการน้ำมันแต่ละปั๊ม - จัดเรียงลำดับการส่ง (ลากวางเพื่อจัดเรียง)
                                            </label>
                                            <DndContext
                                                sensors={sensors}
                                                collisionDetection={closestCenter}
                                                onDragEnd={handleDragEnd}
                                            >
                                                <SortableContext
                                                    items={orderedBranches.map((b) => b.branchId)}
                                                    strategy={verticalListSortingStrategy}
                                                >
                                                    <div className="space-y-3 max-h-96 overflow-y-auto">
                                                        {orderedBranches.map((branch, index) => (
                                                            <SortableBranchItem
                                                                key={branch.branchId}
                                                                branch={branch}
                                                                index={index}
                                                            />
                                                        ))}
                                                    </div>
                                                </SortableContext>
                                            </DndContext>
                                            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                                💡 ลากไอคอน <GripVertical className="w-3 h-3 inline" /> เพื่อจัดเรียงลำดับการส่งน้ำมัน
                                            </p>
                                        </div>
                                    )}

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
                                        สร้างรายการขนส่ง
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )
                }
            </AnimatePresence >

            {/* Order Detail Modal */}
            <AnimatePresence>
                {
                    showOrderDetailModal && selectedOrder && (
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
                                        รายละเอียดการขนส่ง {selectedOrder.transportNo}
                                    </h2>
                                    <button
                                        onClick={() => setShowOrderDetailModal(false)}
                                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                    >
                                        <X className="w-5 h-5 text-gray-500" />
                                    </button>
                                </div>

                                <div className="p-6 space-y-6">
                                    {/* Status Badge */}
                                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-800 rounded-lg">
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">สถานะการขนส่ง</span>
                                        <span
                                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold shadow-sm ${getOrderStatusColor(
                                                selectedOrder.status
                                            )}`}
                                        >
                                            {getOrderStatusIcon(selectedOrder.status)}
                                            {getOrderStatusText(selectedOrder.status)}
                                        </span>
                                    </div>

                                    {/* Basic Information */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                วันที่
                                            </p>
                                            <p className="font-semibold text-gray-900 dark:text-white">
                                                {dateFormatter.format(new Date(selectedOrder.orderDate))}
                                            </p>
                                            {selectedOrder.departureDate && (
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                    วันที่ออกไปรับ: {dateFormatterShort.format(new Date(selectedOrder.departureDate))}
                                                </p>
                                            )}
                                        </div>
                                        <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                                                <Truck className="w-3 h-3" />
                                                เลขที่ขนส่ง
                                            </p>
                                            <p className="font-semibold text-gray-900 dark:text-white">
                                                {selectedOrder.transportNo || "-"}
                                            </p>
                                        </div>
                                        <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                                                <Truck className="w-3 h-3" />
                                                รถหัวลาก
                                            </p>
                                            <p className="font-semibold text-gray-900 dark:text-white">
                                                {selectedOrder.truckPlateNumber}
                                            </p>
                                        </div>
                                        <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                                                <Truck className="w-3 h-3" />
                                                หางบรรทุก
                                            </p>
                                            <p className="font-semibold text-gray-900 dark:text-white">
                                                {selectedOrder.trailerPlateNumber}
                                            </p>
                                        </div>
                                        <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                                                <User className="w-3 h-3" />
                                                คนขับ
                                            </p>
                                            <p className="font-semibold text-gray-900 dark:text-white">{selectedOrder.driver}</p>
                                        </div>
                                        <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                                                <Activity className="w-3 h-3" />
                                                เลขไมล์
                                            </p>
                                            <p className="font-semibold text-gray-900 dark:text-white">
                                                {selectedOrder.currentOdometer ? `${numberFormatter.format(selectedOrder.currentOdometer)} กม.` : "-"}
                                            </p>
                                        </div>
                                        <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                                                <Droplet className="w-3 h-3 text-blue-500" />
                                                น้ำมันตอนเริ่มต้น
                                            </p>
                                            <p className="font-semibold text-gray-900 dark:text-white">
                                                {selectedOrder.startFuel ? `${numberFormatter.format(selectedOrder.startFuel)} ลิตร` : "-"}
                                            </p>
                                        </div>
                                        {selectedOrder.pttQuotationDate && (
                                            <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                                                    <FileText className="w-3 h-3" />
                                                    วันที่ใบเสนอราคา
                                                </p>
                                                <p className="font-semibold text-gray-900 dark:text-white">
                                                    {dateFormatterShort.format(new Date(selectedOrder.pttQuotationDate))}
                                                </p>
                                            </div>
                                        )}
                                        {selectedOrder.scheduledPickupDate && (
                                            <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    วันที่นัดไปรับ
                                                </p>
                                                <p className="font-semibold text-gray-900 dark:text-white">
                                                    {dateFormatterShort.format(new Date(selectedOrder.scheduledPickupDate))}
                                                    {selectedOrder.scheduledPickupTime && ` เวลา ${selectedOrder.scheduledPickupTime}`}
                                                </p>
                                            </div>
                                        )}
                                        {selectedOrder.startTime && (
                                            <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    เวลาเริ่มเดินทาง
                                                </p>
                                                <p className="font-semibold text-gray-900 dark:text-white">
                                                    {dateFormatterShort.format(new Date(selectedOrder.startTime))}
                                                    {selectedOrder.startTime && ` ${new Date(selectedOrder.startTime).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })}`}
                                                </p>
                                            </div>
                                        )}
                                        {selectedOrder.endTime && (
                                            <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                                                    <CheckCircle className="w-3 h-3" />
                                                    เวลาถึงปลายทาง
                                                </p>
                                                <p className="font-semibold text-gray-900 dark:text-white">
                                                    {dateFormatterShort.format(new Date(selectedOrder.endTime))}
                                                    {selectedOrder.endTime && ` ${new Date(selectedOrder.endTime).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })}`}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* รายการน้ำมันแต่ละปั๊ม */}
                                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                                        <div className="flex items-center gap-2 mb-4">
                                            <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                            <p className="text-lg font-bold text-gray-900 dark:text-white">รายการส่งน้ำมันแต่ละปั๊ม</p>
                                        </div>
                                        {selectedOrder.branches && selectedOrder.branches.length > 0 ? (
                                            <div className="space-y-3">
                                                {selectedOrder.branches.map((branch: any, idx: number) => (
                                                    <div
                                                        key={idx}
                                                        className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700/50 dark:to-gray-800/50 p-5 rounded-xl border border-blue-200 dark:border-gray-600 shadow-sm hover:shadow-md transition-shadow"
                                                    >
                                                        <div className="flex items-start justify-between mb-3">
                                                            <div className="flex items-center gap-3">
                                                                <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full font-bold text-sm shadow-sm">
                                                                    {idx + 1}
                                                                </div>
                                                                <div>
                                                                    <p className="font-bold text-gray-900 dark:text-white text-base">{branch.branchName}</p>
                                                                    {branch.address && (
                                                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-1">
                                                                            <MapPin className="w-3 h-3" />
                                                                            {branch.address}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            {branch.totalAmount && (
                                                                <div className="text-right">
                                                                    <p className="text-xs text-gray-500 dark:text-gray-400">มูลค่ารวม</p>
                                                                    <p className="font-semibold text-blue-600 dark:text-blue-400">
                                                                        {numberFormatter.format(branch.totalAmount)} บาท
                                                                    </p>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="ml-11 space-y-2">
                                                            <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">รายการน้ำมัน:</p>
                                                            <div className="grid grid-cols-1 gap-2">
                                                                {branch.items.map((item: any, i: number) => (
                                                                    <div
                                                                        key={i}
                                                                        className="flex items-center justify-between bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-600"
                                                                    >
                                                                        <div className="flex items-center gap-2">
                                                                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                                            <span className="font-medium text-gray-900 dark:text-white">{item.oilType}</span>
                                                                        </div>
                                                                        <span className="font-semibold text-blue-600 dark:text-blue-400">
                                                                            {numberFormatter.format(item.quantity)} ลิตร
                                                                        </span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                    รวมทั้งหมด: <span className="font-semibold text-gray-900 dark:text-white">
                                                                        {numberFormatter.format(
                                                                            branch.items.reduce((sum: number, item: any) => sum + item.quantity, 0)
                                                                        )} ลิตร
                                                                    </span>
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-8 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                                                <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                                <p className="text-gray-500 dark:text-gray-400">ไม่มีข้อมูลรายการส่งสินค้า</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )
                }
            </AnimatePresence >

            {/* Start Trip Modal */}
            {
                selectedOrder && (
                    <StartTripModal
                        isOpen={showStartTripModal}
                        onClose={() => setShowStartTripModal(false)}
                        order={selectedOrder}
                        lastOdometerReading={mockTrucks.find((t: any) => t.id === newOrder.truckId)?.lastOdometerReading || 0}
                        lastOdometerDate={mockTrucks.find((t: any) => t.id === newOrder.truckId)?.lastOdometerDate || new Date().toISOString()}
                        onStartTrip={onStartTrip}
                    />
                )
            }

            {/* End Trip Modal */}
            {
                selectedOrder && (
                    <EndTripModal
                        isOpen={showEndTripModal}
                        onClose={() => setShowEndTripModal(false)}
                        order={selectedOrder}
                        onEndTrip={onEndTrip}
                    />
                )
            }
        </div >
    );
}
