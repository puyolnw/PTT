import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, CheckCircle, Clock, Activity, XCircle, X, User, GripVertical, Truck, MapPin, Eye, Droplet, Search, Save, Filter, ChevronUp, ChevronDown, ChevronsUpDown, Check, History, Plus } from "lucide-react";
import { useGasStation } from "@/contexts/GasStationContext";
import { useAuth } from "@/contexts/AuthContext";
import { mockDrivers } from "@/data/mockData";
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
import { CSS } from "@dnd-kit/utilities";

// Helper functions
const generateTransportNo = () => {
    const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `IT-${date}-${random}`; // IT = Internal Transport
};

const formatDuration = (ms?: number) => {
    if (!ms) return '-';
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours} ชม. ${minutes} นาที`;
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

// Interface สำหรับ Internal Transport Order
interface InternalTransportOrder {
    id: string;
    transportNo: string;
    orderDate: string;
    departureDate: string;
    internalOrderNo: string; // เลขที่ออเดอร์จาก InternalOilOrder
    fromBranchId: number; // ปั๊มที่จะส่งน้ำมัน
    fromBranchName: string;
    toBranchId: number; // ปั๊มที่สั่งซื้อ
    toBranchName: string;
    truckId: string;
    truckPlateNumber: string;
    trailerId: string;
    trailerPlateNumber: string;
    driverId: string;
    driverName: string;
    currentOdometer: number;
    startFuel: number;
    items: Array<{
        oilType: string;
        quantity: number;
    }>;
    totalAmount: number;
    status: "draft" | "ready-to-pickup" | "picking-up" | "completed" | "cancelled";
    startOdometer?: number;
    endOdometer?: number;
    startTime?: string;
    endTime?: string;
    tripDuration?: number;
    totalDistance?: number;
    notes?: string;
    createdAt: string;
    createdBy: string;
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
    } = useSortable({ id: branch.branchId || index });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="flex items-center gap-3 p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm"
        >
            <div
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
            >
                <GripVertical className="w-5 h-5 text-gray-400" />
            </div>
            <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full font-bold text-sm">
                {index + 1}
            </div>
            <div className="flex-1">
                <p className="font-semibold text-gray-900 dark:text-white">{branch.branchName}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{branch.address}</p>
            </div>
            <div className="text-right">
                <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                    {numberFormatter.format(branch.totalAmount)} บาท
                </p>
            </div>
        </div>
    );
}

export default function InternalTransport() {
    const { 
        internalOrders, 
        branches, 
        trucks, 
        trailers, 
        allDriverJobs,
        createDriverJob,
        updateInternalOrder,
        updateDriverJob
    } = useGasStation();
    const { user } = useAuth();

    // Mapping DriverJobs to InternalTransportOrders for display
    const internalTransports = useMemo(() => {
        return allDriverJobs
            .filter(job => job.orderType === "internal")
            .map(job => {
                const order = internalOrders.find(o => o.orderNo === job.internalOrderNo);
                return {
                    id: job.id,
                    transportNo: job.transportNo,
                    orderDate: job.transportDate,
                    departureDate: job.transportDate,
                    internalOrderNo: job.internalOrderNo || "",
                    fromBranchId: job.sourceBranchId,
                    fromBranchName: job.sourceBranchName,
                    toBranchId: job.destinationBranches[0]?.branchId || 0,
                    toBranchName: job.destinationBranches[0]?.branchName || "",
                    truckId: "", // Not directly in DriverJob as ID
                    truckPlateNumber: job.truckPlateNumber,
                    trailerId: "", // Not directly in DriverJob as ID
                    trailerPlateNumber: job.trailerPlateNumber,
                    driverId: job.driverId || "",
                    driverName: job.driverName || "",
                    currentOdometer: job.startTrip?.startOdometer || 0,
                    startFuel: job.startTrip?.startFuel || 0,
                    items: job.destinationBranches.map(db => ({
                        oilType: db.oilType,
                        quantity: db.quantity
                    })),
                    totalAmount: order?.totalAmount || 0,
                    status: job.status === "รอเริ่ม" ? "ready-to-pickup" : 
                            job.status === "กำลังส่ง" ? "picking-up" : 
                            job.status === "ส่งเสร็จ" ? "completed" : "draft",
                    startOdometer: job.startTrip?.startOdometer,
                    endOdometer: job.endOdometer,
                    startTime: job.startTrip?.startedAt,
                    endTime: job.updatedAt, // Using updatedAt as approx for endTime if not explicit
                    notes: job.notes,
                    createdAt: job.createdAt || "",
                    createdBy: job.createdBy || ""
                } as InternalTransportOrder;
            });
    }, [allDriverJobs, internalOrders]);

    // State definitions
    const [newOrder, setNewOrder] = useState({
        orderDate: new Date().toISOString().split("T")[0],
        departureDate: new Date().toISOString().split("T")[0],
        internalOrderNo: "",
        transportNo: "",
        truckId: "",
        trailerId: "",
        driverId: "",
        currentOdometer: 0,
        startFuel: 0,
        notes: "",
    });
    const [showCreateOrderModal, setShowCreateOrderModal] = useState(false);
    const [showOrderDetailModal, setShowOrderDetailModal] = useState(false);
    const [showStartTripModal, setShowStartTripModal] = useState(false);
    const [showEndTripModal, setShowEndTripModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<InternalTransportOrder | null>(null);
    const [orderedBranches, setOrderedBranches] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterDateFrom, setFilterDateFrom] = useState<string>("");
    const [filterDateTo, setFilterDateTo] = useState<string>("");
    const [filterBranch, setFilterBranch] = useState<number | "all">("all");
    const [columnFilters, setColumnFilters] = useState<{
        status: string;
        branch: string;
    }>({
        status: "ทั้งหมด",
        branch: "ทั้งหมด"
    });
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' | null }>({ key: 'orderDate', direction: 'desc' });

    // DnD Sensors
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Helper: get selected internal order
    const selectedInternalOrder = useMemo(() => {
        return internalOrders.find((o) => o.orderNo === newOrder.internalOrderNo) || null;
    }, [newOrder.internalOrderNo, internalOrders]);

    // Get selected truck and trailer info
    const selectedTruck = useMemo(() => {
        return trucks.find((t: any) => t.id === newOrder.truckId) || null;
    }, [newOrder.truckId, trucks]);

    const selectedTrailer = useMemo(() => {
        return trailers.find((t: any) => t.id === newOrder.trailerId) || null;
    }, [newOrder.trailerId, trailers]);

    const selectedDriver = useMemo(() => {
        return mockDrivers.find((d: any) => String(d.id) === newOrder.driverId) || null;
    }, [newOrder.driverId]);

    // Auto-fill data when internal order is selected
    useEffect(() => {
        if (selectedInternalOrder) {
            // Auto-fill branches
            if (selectedInternalOrder.assignedFromBranchId && selectedInternalOrder.fromBranchId) {
                const toBranch = branches.find((b) => b.id === selectedInternalOrder.fromBranchId);
                
                if (toBranch) {
                    setOrderedBranches([{
                        branchId: toBranch.id,
                        branchName: toBranch.name,
                        address: toBranch.address,
                        items: selectedInternalOrder.items.map((item) => ({
                            oilType: item.oilType,
                            quantity: item.quantity,
                        })),
                        totalAmount: selectedInternalOrder.totalAmount,
                    }]);
                }
            }

            // Auto-fill truck, trailer, driver if available in internal order
            if (selectedInternalOrder.truckId || selectedInternalOrder.driverId) {
                setNewOrder(prev => ({
                    ...prev,
                    truckId: selectedInternalOrder.truckId || prev.truckId,
                    trailerId: selectedInternalOrder.trailerId || prev.trailerId,
                    driverId: selectedInternalOrder.driverId ? String(selectedInternalOrder.driverId) : prev.driverId,
                }));
            }
        } else {
            setOrderedBranches([]);
        }
    }, [selectedInternalOrder, branches]);

    // Auto-fill odometer when truck is selected
    useEffect(() => {
        if (selectedTruck && selectedTruck.lastOdometerReading) {
            setNewOrder((prev) => ({
                ...prev,
                currentOdometer: selectedTruck.lastOdometerReading || 0,
            }));
        }
    }, [selectedTruck]);

    // Generate new transport number when modal opens
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
                const oldIndex = items.findIndex((item) => (item.branchId || 0) === active.id);
                const newIndex = items.findIndex((item) => (item.branchId || 0) === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    // Filter orders
    const filteredOrders = useMemo(() => {
        let result = internalTransports.filter((order) => {
            const matchesSearch =
                order.transportNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.internalOrderNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.fromBranchName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.toBranchName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.truckPlateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.driverName.toLowerCase().includes(searchTerm.toLowerCase());
            
            // Column Filters
            const matchesStatus = columnFilters.status === "ทั้งหมด" || 
                getOrderStatusText(order.status) === columnFilters.status;
            
            // Branch filter
            const matchesBranch = columnFilters.branch === "ทั้งหมด" || 
                order.fromBranchId === (filterBranch === "all" ? -1 : filterBranch) || 
                order.toBranchId === (filterBranch === "all" ? -1 : filterBranch);
            
            // Date filter
            let matchesDate = true;
            if (filterDateFrom || filterDateTo) {
                const orderDate = new Date(order.orderDate);
                const fromDate = filterDateFrom ? new Date(filterDateFrom) : null;
                const toDate = filterDateTo ? new Date(filterDateTo) : null;
                
                if (fromDate && toDate) {
                    fromDate.setHours(0, 0, 0, 0);
                    toDate.setHours(23, 59, 59, 999);
                    matchesDate = orderDate >= fromDate && orderDate <= toDate;
                } else if (fromDate) {
                    fromDate.setHours(0, 0, 0, 0);
                    matchesDate = orderDate >= fromDate;
                } else if (toDate) {
                    toDate.setHours(23, 59, 59, 999);
                    matchesDate = orderDate <= toDate;
                }
            }
            
            return matchesSearch && matchesStatus && matchesBranch && matchesDate;
        });

        // Sorting
        if (sortConfig.key && sortConfig.direction) {
            result.sort((a, b) => {
                let aValue: any;
                let bValue: any;

                switch (sortConfig.key) {
                    case 'orderDate':
                        aValue = new Date(a.orderDate).getTime();
                        bValue = new Date(b.orderDate).getTime();
                        break;
                    case 'transportNo':
                        aValue = a.transportNo;
                        bValue = b.transportNo;
                        break;
                    case 'fromBranchName':
                        aValue = a.fromBranchName;
                        bValue = b.fromBranchName;
                        break;
                    default:
                        aValue = (a as any)[sortConfig.key];
                        bValue = (b as any)[sortConfig.key];
                }

                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        } else {
            result.sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
        }

        return result;
    }, [searchTerm, filterBranch, filterDateFrom, filterDateTo, internalTransports, columnFilters, sortConfig]);

    const handleCreateOrder = () => {
        if (!newOrder.internalOrderNo || !newOrder.truckId || !newOrder.trailerId || !newOrder.driverId) {
            alert("กรุณากรอกข้อมูลให้ครบถ้วน");
            return;
        }

        if (orderedBranches.length === 0) {
            alert("กรุณาเลือกออเดอร์ที่ต้องการส่ง");
            return;
        }

        if (!selectedInternalOrder) return;

        // 1. สร้าง DriverJob สำหรับ App คนขับ
        const newJob: any = {
            id: `JOB-${Date.now()}`,
            transportNo: newOrder.transportNo,
            transportDate: newOrder.departureDate,
            transportTime: "08:00", // Default time
            orderType: "internal",
            internalOrderNo: newOrder.internalOrderNo,
            sourceBranchId: selectedInternalOrder.assignedFromBranchId || 1,
            sourceBranchName: selectedInternalOrder.assignedFromBranchName || "ปั๊มไฮโซ",
            sourceAddress: branches.find(b => b.id === (selectedInternalOrder.assignedFromBranchId || 1))?.address || "",
            destinationBranches: orderedBranches.map(branch => ({
                branchId: branch.branchId,
                branchName: branch.branchName,
                address: branch.address,
                oilType: branch.items[0]?.oilType || "Diesel",
                quantity: branch.items[0]?.quantity || 0,
                status: "รอส่ง"
            })),
            truckPlateNumber: selectedTruck?.plateNumber || "",
            trailerPlateNumber: selectedTrailer?.plateNumber || "",
            driverId: newOrder.driverId,
            driverName: selectedDriver?.name || "",
            status: "รอเริ่ม",
            createdAt: new Date().toISOString(),
            createdBy: user?.name || "ระบบ",
            notes: newOrder.notes,
            compartments: [] // Will be filled by driver or automatically
        };

        createDriverJob(newJob);

        // 2. อัปเดตสถานะของ InternalOilOrder เป็น "กำลังจัดส่ง"
        updateInternalOrder(selectedInternalOrder.id, {
            status: "กำลังจัดส่ง",
            transportNo: newOrder.transportNo,
            deliveryDate: newOrder.departureDate,
            truckId: newOrder.truckId,
            truckPlate: selectedTruck?.plateNumber,
            trailerId: newOrder.trailerId,
            trailerPlate: selectedTrailer?.plateNumber,
            driverId: Number(newOrder.driverId),
            driverName: selectedDriver?.name,
            updatedAt: new Date().toISOString()
        });

        setShowCreateOrderModal(false);
        setNewOrder({
            orderDate: new Date().toISOString().split("T")[0],
            departureDate: new Date().toISOString().split("T")[0],
            internalOrderNo: "",
            transportNo: generateTransportNo(),
            truckId: "",
            trailerId: "",
            driverId: "",
            currentOdometer: 0,
            startFuel: 0,
            notes: "",
        });
        setOrderedBranches([]);
        alert(`สร้างรายการขนส่งและส่งงานให้คนขับสำเร็จ!\n\nเลขที่ขนส่ง: ${newJob.transportNo}`);
    };

    const handleViewOrderDetail = (order: InternalTransportOrder) => {
        setSelectedOrder(order);
        setShowOrderDetailModal(true);
    };

    const handleStartTrip = (order: InternalTransportOrder) => {
        setSelectedOrder(order);
        setShowStartTripModal(true);
    };

    const handleEndTrip = (order: InternalTransportOrder) => {
        setSelectedOrder(order);
        setShowEndTripModal(true);
    };

    const onStartTrip = (startOdometer: number, startTime: string, photo?: string, startFuel?: number) => {
        if (!selectedOrder) return;
        
        // ค้นหา Job ID จาก transportNo
        const job = allDriverJobs.find(j => j.transportNo === selectedOrder.transportNo);
        if (job) {
            updateDriverJob(job.id, {
                status: "ออกเดินทางแล้ว",
                startTrip: {
                    startedAt: startTime,
                    startOdometer,
                    startOdometerPhoto: photo,
                    startFuel: startFuel || 0
                }
            });
        }

        setShowStartTripModal(false);
        alert(`เริ่มเที่ยวขนส่งสำเร็จ!\n\nเลขที่ขนส่ง: ${selectedOrder.transportNo}`);
    };

    const onEndTrip = (endOdometer: number, endTime: string) => {
        if (!selectedOrder) return;

        const job = allDriverJobs.find(j => j.transportNo === selectedOrder.transportNo);
        if (job && job.startTrip) {
            const totalDistance = endOdometer - job.startTrip.startOdometer;
            updateDriverJob(job.id, {
                status: "ส่งเสร็จ",
                endOdometer,
                updatedAt: endTime,
                notes: `ระยะทางรวม ${totalDistance} กม.`
            });
        }

        setShowEndTripModal(false);
        alert(`จบเที่ยวขนส่งสำเร็จ!\n\nเลขที่ขนส่ง: ${selectedOrder.transportNo}`);
    };

    const getOrderStatusColor = (status: InternalTransportOrder["status"]) => {
        switch (status) {
            case "draft":
                return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
            case "ready-to-pickup":
                return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
            case "picking-up":
                return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
            case "completed":
                return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
            case "cancelled":
                return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
            default:
                return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
        }
    };

    const getOrderStatusText = (status: InternalTransportOrder["status"]) => {
        switch (status) {
            case "draft":
                return "ร่าง";
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

    const getOrderStatusIcon = (status: InternalTransportOrder["status"]) => {
        switch (status) {
            case "draft":
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

    const handleSort = (key: string) => {
        setSortConfig(prev => {
            if (prev.key === key) {
                if (prev.direction === 'asc') return { key, direction: 'desc' };
                if (prev.direction === 'desc') return { key, direction: null };
                return { key, direction: 'asc' };
            }
            return { key, direction: 'asc' };
        });
    };

    const getSortIcon = (key: string) => {
        if (sortConfig.key !== key || !sortConfig.direction) return <ChevronsUpDown className="w-3 h-3 opacity-30" />;
        return sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3 text-emerald-500" /> : <ChevronDown className="w-3 h-3 text-emerald-500" />;
    };

    // ดึงค่า Unique สำหรับ Filter Dropdowns
    const filterOptions = useMemo(() => {
        return {
            status: ["ทั้งหมด", "ร่าง", "พร้อมรับ", "กำลังไปรับ", "เสร็จสิ้น", "ยกเลิก"],
            branch: ["ทั้งหมด", ...branches.map(b => b.name)]
        };
    }, [branches]);

    const HeaderWithFilter = ({ label, columnKey, filterKey, options }: { 
        label: string, 
        columnKey?: string, 
        filterKey?: keyof typeof columnFilters, 
        options?: string[] 
    }) => (
        <th className="px-6 py-4 relative group">
            <div className="flex items-center gap-2">
                <div 
                    className={`flex items-center gap-1.5 cursor-pointer hover:text-gray-900 dark:hover:text-white transition-colors ${sortConfig.key === columnKey ? 'text-emerald-600' : ''}`}
                    onClick={() => columnKey && handleSort(columnKey)}
                >
                    {label}
                    {columnKey && getSortIcon(columnKey)}
                </div>
                
                {filterKey && options && (
                    <div className="relative">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setActiveDropdown(activeDropdown === filterKey ? null : filterKey);
                            }}
                            className={`p-1 rounded-md transition-all ${columnFilters[filterKey] !== "ทั้งหมด" ? "bg-emerald-500 text-white shadow-sm" : "hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400"}`}
                        >
                            <Filter className="w-3 h-3" />
                        </button>
                        
                        <AnimatePresence>
                            {activeDropdown === filterKey && (
                                <>
                                    <div 
                                        className="fixed inset-0 z-10" 
                                        onClick={() => setActiveDropdown(null)} 
                                    />
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute left-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 z-20 py-1 overflow-hidden"
                                    >
                                        {options.map((opt) => (
                                            <button
                                                key={opt}
                                                onClick={() => {
                                                    setColumnFilters(prev => ({ ...prev, [filterKey]: opt }));
                                                    setActiveDropdown(null);
                                                }}
                                                className={`w-full text-left px-4 py-2 text-xs font-bold transition-colors flex items-center justify-between ${
                                                    columnFilters[filterKey] === opt 
                                                        ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400" 
                                                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                                                }`}
                                            >
                                                {opt}
                                                {columnFilters[filterKey] === opt && <Check className="w-3 h-3" />}
                                            </button>
                                        ))}
                                    </motion.div>
                                </>
                              )}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </th>
    );

    const isAnyFilterActive = useMemo(() => {
        return columnFilters.status !== "ทั้งหมด" || 
               columnFilters.branch !== "ทั้งหมด" ||
               filterDateFrom !== "" ||
               filterDateTo !== "" ||
               searchTerm !== "";
    }, [columnFilters, filterDateFrom, filterDateTo, searchTerm]);

    const clearFilters = () => {
        setColumnFilters({
            status: "ทั้งหมด",
            branch: "ทั้งหมด"
        });
        setSearchTerm("");
        setFilterDateFrom("");
        setFilterDateTo("");
        setFilterBranch("all");
    };

    const stats = useMemo(() => {
        const all = filteredOrders.length;
        const active = filteredOrders.filter(o => o.status === "ready-to-pickup" || o.status === "picking-up").length;
        const completed = filteredOrders.filter(o => o.status === "completed").length;
        return { all, active, completed };
    }, [filteredOrders]);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
            {/* Header */}
            <header className="mb-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                            <div className="p-2 bg-emerald-500 rounded-2xl shadow-lg shadow-emerald-500/20">
                                <Truck className="w-8 h-8 text-white" />
                            </div>
                            ระบบขนส่งภายในปั๊ม
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium flex items-center gap-2">
                            <History className="w-4 h-4" />
                            จัดการเที่ยวรถขนส่งน้ำมันภายในเครือข่ายปั๊ม
                        </p>
                    </div>
                    <button
                        onClick={() => setShowCreateOrderModal(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-bold shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
                    >
                        <Plus className="w-5 h-5" />
                        สร้างรายการขนส่งใหม่
                    </button>
                </div>
            </header>

            {/* Stats Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm"
                >
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl">
                            <FileText className="w-6 h-6 text-blue-500" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">รายการทั้งหมด</p>
                            <p className="text-2xl font-black text-gray-900 dark:text-white">{stats.all} รายการ</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm"
                >
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-2xl">
                            <Activity className="w-6 h-6 text-amber-500" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">กำลังดำเนินอยู่</p>
                            <p className="text-2xl font-black text-gray-900 dark:text-white">{stats.active} รายการ</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm"
                >
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl">
                            <CheckCircle className="w-6 h-6 text-emerald-500" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">เสร็จแล้ว</p>
                            <p className="text-2xl font-black text-gray-900 dark:text-white">{stats.completed} รายการ</p>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="ค้นหาเลขขนส่ง, ออเดอร์, ปั๊ม..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900 dark:text-white font-medium"
                    />
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:flex-initial">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="date"
                            value={filterDateFrom}
                            onChange={(e) => setFilterDateFrom(e.target.value)}
                            className="pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900 dark:text-white font-medium text-sm"
                            placeholder="จากวันที่"
                        />
                    </div>
                    <span className="text-gray-400 font-bold">-</span>
                    <div className="relative flex-1 md:flex-initial">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="date"
                            value={filterDateTo}
                            onChange={(e) => setFilterDateTo(e.target.value)}
                            className="pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900 dark:text-white font-medium text-sm"
                            placeholder="ถึงวันที่"
                        />
                    </div>
                </div>
                <div className="flex items-center gap-4 w-full md:w-auto">
                    {isAnyFilterActive && (
                        <button
                            onClick={clearFilters}
                            className="px-4 py-3 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-2xl font-bold text-sm transition-colors flex items-center gap-2"
                        >
                            <X className="w-4 h-4" />
                            ล้างตัวกรอง
                        </button>
                    )}
                    <div className="flex items-center gap-2 px-4 py-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-2xl border border-emerald-100 dark:border-emerald-800/50 shrink-0">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm font-bold whitespace-nowrap">
                            {filterBranch === "all" ? "ทุกปั๊ม" : branches.find(b => b.id === filterBranch)?.name || "ทุกปั๊ม"}
                        </span>
                    </div>
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 dark:bg-gray-900/50 text-[10px] uppercase tracking-widest font-black text-gray-400">
                                <HeaderWithFilter 
                                    label="เลขที่ขนส่ง" 
                                    columnKey="transportNo" 
                                />
                                <th className="px-6 py-4">
                                    <div className="flex items-center gap-1.5">
                                        <FileText className="w-3 h-3" />
                                        เลขที่ออเดอร์
                                    </div>
                                </th>
                                <HeaderWithFilter 
                                    label="วันที่" 
                                    columnKey="orderDate" 
                                />
                                <HeaderWithFilter 
                                    label="ต้นทาง → ปลายทาง" 
                                    columnKey="fromBranchName" 
                                    filterKey="branch"
                                    options={filterOptions.branch}
                                />
                                <th className="px-6 py-4">
                                    <div className="flex items-center gap-1.5">
                                        <Truck className="w-3 h-3" />
                                        รถ / หาง
                                    </div>
                                </th>
                                <th className="px-6 py-4">
                                    <div className="flex items-center gap-1.5">
                                        <User className="w-3 h-3" />
                                        คนขับ
                                    </div>
                                </th>
                                <th className="px-6 py-4">
                                    <div className="flex items-center gap-1.5">
                                        <Droplet className="w-3 h-3" />
                                        น้ำมันเริ่มต้น
                                    </div>
                                </th>
                                <HeaderWithFilter 
                                    label="สถานะ" 
                                    filterKey="status"
                                    options={filterOptions.status}
                                />
                                <th className="px-6 py-4 text-center">การดำเนินการ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700 text-sm">
                            {filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="px-6 py-12 text-center text-gray-400 italic font-medium">
                                        <div className="flex flex-col items-center gap-2">
                                            <Search className="w-8 h-8 opacity-20" />
                                            ไม่พบรายการที่ค้นหา
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredOrders.map((order) => (
                                <tr
                                    key={order.id}
                                    className="group hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors font-medium"
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-gray-900 dark:text-white">
                                                {order.transportNo}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-[10px] font-black text-blue-600 uppercase tracking-tighter flex items-center gap-1">
                                            <FileText className="w-3 h-3" />
                                            {order.internalOrderNo}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-bold text-gray-700 dark:text-gray-300">
                                            {dateFormatterShort.format(new Date(order.orderDate))}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-1.5">
                                                <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                                                <span className="font-bold text-gray-900 dark:text-white">{order.fromBranchName}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                                                <span className="ml-5">→ {order.toBranchName}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-1.5">
                                                <Truck className="w-3.5 h-3.5 text-blue-500" />
                                                <span className="font-bold text-gray-900 dark:text-white">{order.truckPlateNumber}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                                                <span className="ml-5">{order.trailerPlateNumber}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-900 flex items-center justify-center border border-gray-200 dark:border-gray-700">
                                                <User className="w-4 h-4 text-blue-500" />
                                            </div>
                                            <span className="font-bold text-gray-700 dark:text-gray-300">{order.driverName}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1.5">
                                            <Droplet className="w-4 h-4 text-blue-500" />
                                            <span className="font-bold text-gray-900 dark:text-white">
                                                {order.startFuel ? `${numberFormatter.format(order.startFuel)} ลิตร` : "-"}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${getOrderStatusColor(order.status)}`}>
                                            {getOrderStatusIcon(order.status)}
                                            {getOrderStatusText(order.status)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                                        <div className="flex items-center gap-2 justify-center">
                                            {order.status === "ready-to-pickup" && (
                                                <button
                                                    onClick={() => handleStartTrip(order)}
                                                    className="px-4 py-2 bg-emerald-500 text-white rounded-2xl hover:bg-emerald-600 transition-all text-sm font-black shadow-lg shadow-emerald-500/20 active:scale-95"
                                                >
                                                    เริ่มเที่ยว
                                                </button>
                                            )}
                                            {order.status === "picking-up" && (
                                                <button
                                                    onClick={() => handleEndTrip(order)}
                                                    className="px-4 py-2 bg-emerald-500 text-white rounded-2xl hover:bg-emerald-600 transition-all text-sm font-black shadow-lg shadow-emerald-500/20 active:scale-95"
                                                >
                                                    จบเที่ยว
                                                </button>
                                            )}
                                            {order.status === "completed" && order.totalDistance && (
                                                <div className="text-sm text-center bg-emerald-50 dark:bg-emerald-900/20 px-3 py-2 rounded-2xl">
                                                    <div className="font-black text-emerald-600 dark:text-emerald-400">{numberFormatter.format(order.totalDistance)} กม.</div>
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
                                        </div>
                                    </td>
                                </tr>
                            ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

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
                            className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-emerald-50 dark:bg-emerald-900/20">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-emerald-500 rounded-xl">
                                        <Plus className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black text-emerald-800 dark:text-emerald-400">สร้างรายการขนส่งใหม่</h2>
                                        <p className="text-xs text-emerald-600 dark:text-emerald-500 font-bold">กรอกข้อมูลการขนส่งและเลือกรถ/คนขับ</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowCreateOrderModal(false)}
                                    className="p-2 hover:bg-white dark:hover:bg-gray-700 rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-400" />
                                </button>
                            </div>

                            <div className="p-6 space-y-4">
                                {/* เลขขนส่ง */}
                                <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        เลขขนส่ง (Transport No.) *
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            value={newOrder.transportNo}
                                            onChange={(e) => setNewOrder({ ...newOrder, transportNo: e.target.value })}
                                            className="flex-1 px-4 py-2 border border-purple-300 dark:border-purple-700 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-semibold focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                            placeholder="IT-YYYYMMDD-XXX"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setNewOrder({ ...newOrder, transportNo: generateTransportNo() })}
                                            className="text-xs text-purple-600 dark:text-purple-400 bg-white dark:bg-gray-700 px-3 py-2 rounded border border-purple-300 dark:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors whitespace-nowrap"
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
                                            วันที่จัดส่ง *
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
                                        เลือกออเดอร์ภายในปั๊ม (Internal Order) *
                                    </label>
                                    <select
                                        value={newOrder.internalOrderNo}
                                        onChange={(e) => setNewOrder({ ...newOrder, internalOrderNo: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        required
                                    >
                                        <option value="">เลือกออเดอร์ภายในปั๊ม</option>
                                        {internalOrders
                                            .filter((order) => order.status === "อนุมัติแล้ว")
                                            .map((order) => (
                                                <option key={order.id} value={order.orderNo}>
                                                    {order.orderNo} - {order.fromBranchName} ← {order.assignedFromBranchName} ({order.items.length} รายการ)
                                                </option>
                                            ))}
                                    </select>
                                    {selectedInternalOrder && (
                                        <div className="mt-3 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                                            <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                                                📋 สรุปออเดอร์: {selectedInternalOrder.orderNo}
                                            </p>
                                            <div className="grid grid-cols-2 gap-2 text-xs">
                                                <div>
                                                    <span className="text-gray-600 dark:text-gray-400">ปั๊มที่สั่ง:</span>
                                                    <span className="font-medium text-gray-900 dark:text-white ml-1">
                                                        {selectedInternalOrder.fromBranchName}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-600 dark:text-gray-400">ปั๊มที่จะส่ง:</span>
                                                    <span className="font-medium text-green-600 dark:text-green-400 ml-1">
                                                        {selectedInternalOrder.assignedFromBranchName || "-"}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-600 dark:text-gray-400">จำนวนน้ำมันรวม:</span>
                                                    <span className="font-semibold text-purple-600 dark:text-purple-400 ml-1">
                                                        {numberFormatter.format(
                                                            selectedInternalOrder.items.reduce((sum, item) => sum + item.quantity, 0)
                                                        )} ลิตร
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-600 dark:text-gray-400">มูลค่ารวม:</span>
                                                    <span className="font-semibold text-purple-600 dark:text-purple-400 ml-1">
                                                        {numberFormatter.format(selectedInternalOrder.totalAmount)} บาท
                                                    </span>
                                                </div>
                                                <div className="col-span-2">
                                                    <span className="text-gray-600 dark:text-gray-400">รายการน้ำมัน:</span>
                                                    <div className="mt-1 space-y-1">
                                                        {selectedInternalOrder.items.map((item, idx) => (
                                                            <div key={idx} className="text-xs bg-white dark:bg-gray-700 px-2 py-1 rounded">
                                                                <span className="font-medium">{item.oilType}:</span>{" "}
                                                                <span>{numberFormatter.format(item.quantity)} ลิตร</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            {selectedInternalOrder.transportNo && (
                                                <div className="mt-2 pt-2 border-t border-purple-200 dark:border-purple-800">
                                                    <span className="text-xs text-gray-600 dark:text-gray-400">เลขที่ขนส่งเดิม:</span>
                                                    <span className="text-xs font-medium text-purple-600 dark:text-purple-400 ml-1">
                                                        {selectedInternalOrder.transportNo}
                                                    </span>
                                                </div>
                                            )}
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
                                            {trucks.map((truck: any) => (
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
                                            {trailers.map((trailer: any) => (
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
                                        {mockDrivers.map((driver: any) => (
                                            <option key={driver.id} value={String(driver.id)}>
                                                {driver.name} ({driver.code})
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
                                        {!selectedTruck?.lastOdometerReading && (
                                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                💡 เลขไมล์จะถูกดึงมาจาก Profile รถเมื่อเลือกรถ (แก้ไขได้)
                                            </p>
                                        )}
                                        {selectedTruck && selectedTruck.lastOdometerReading && (
                                            <p className="mt-1 text-xs text-blue-600 dark:text-blue-400 font-medium">
                                                ✅ ดึงมาจาก Profile รถ: {numberFormatter.format(selectedTruck.lastOdometerReading)} กม. (แก้ไขได้)
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

                                {/* รายการน้ำมันที่จะส่ง */}
                                {orderedBranches.length > 0 && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            รายการส่งน้ำมัน
                                        </label>
                                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                                            <SortableContext items={orderedBranches.map((b, i) => b.branchId || i)} strategy={verticalListSortingStrategy}>
                                                <div className="space-y-2">
                                                    {orderedBranches.map((branch, index) => (
                                                        <SortableBranchItem key={branch.branchId || index} branch={branch} index={index} />
                                                    ))}
                                                </div>
                                            </SortableContext>
                                        </DndContext>
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

                            <div className="p-6 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700 flex gap-3">
                                <button
                                    onClick={() => setShowCreateOrderModal(false)}
                                    className="flex-1 px-6 py-4 bg-white dark:bg-gray-800 text-gray-500 font-black rounded-2xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 transition-all uppercase tracking-widest text-sm"
                                >
                                    ยกเลิก
                                </button>
                                <button
                                    onClick={handleCreateOrder}
                                    className="flex-[2] px-6 py-4 bg-emerald-500 text-white font-black rounded-2xl shadow-xl shadow-emerald-500/30 hover:bg-emerald-600 transition-all active:scale-95 uppercase tracking-widest text-sm flex items-center justify-center gap-2"
                                >
                                    <Save className="w-5 h-5" />
                                    บันทึกรายการขนส่ง
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
                            className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-emerald-50 dark:bg-emerald-900/20">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-emerald-500 rounded-xl">
                                        <FileText className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black text-emerald-800 dark:text-emerald-400">รายละเอียดการขนส่ง</h2>
                                        <p className="text-xs text-emerald-600 dark:text-emerald-500 font-bold">เลขขนส่ง: {selectedOrder.transportNo}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowOrderDetailModal(false)}
                                    className="p-2 hover:bg-white dark:hover:bg-gray-700 rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-400" />
                                </button>
                            </div>

                            <div className="p-6 space-y-6">
                                {/* Status Badge */}
                                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-gray-700 dark:to-gray-800 rounded-lg">
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
                                    </div>
                                    <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                                            <Truck className="w-3 h-3" />
                                            เลขที่ขนส่ง
                                        </p>
                                        <p className="font-semibold text-gray-900 dark:text-white">
                                            {selectedOrder.transportNo}
                                        </p>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                                            <FileText className="w-3 h-3" />
                                            เลขที่ออเดอร์
                                        </p>
                                        <p className="font-semibold text-gray-900 dark:text-white">
                                            {selectedOrder.internalOrderNo}
                                        </p>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                                            <MapPin className="w-3 h-3" />
                                            ต้นทาง
                                        </p>
                                        <p className="font-semibold text-gray-900 dark:text-white">
                                            {selectedOrder.fromBranchName}
                                        </p>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                                            <MapPin className="w-3 h-3" />
                                            ปลายทาง
                                        </p>
                                        <p className="font-semibold text-gray-900 dark:text-white">
                                            {selectedOrder.toBranchName}
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
                                        <p className="font-semibold text-gray-900 dark:text-white">{selectedOrder.driverName}</p>
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
                                </div>

                                {/* รายการน้ำมัน */}
                                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Droplet className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                        <p className="text-lg font-bold text-gray-900 dark:text-white">รายการน้ำมัน</p>
                                    </div>
                                    <div className="space-y-3">
                                        {selectedOrder.items.map((item, idx) => (
                                            <div
                                                key={idx}
                                                className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-gray-700/50 dark:to-gray-800/50 p-4 rounded-xl border border-purple-200 dark:border-gray-600"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="font-bold text-gray-900 dark:text-white">{item.oilType}</p>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                            จำนวน: {numberFormatter.format(item.quantity)} ลิตร
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Start Trip Modal */}
            {showStartTripModal && selectedOrder && (
                <StartTripModal
                    order={{
                        id: selectedOrder.id,
                        orderNo: selectedOrder.transportNo,
                        currentOdometer: selectedOrder.currentOdometer,
                        startFuel: selectedOrder.startFuel,
                    } as any}
                    isOpen={showStartTripModal}
                    onStartTrip={onStartTrip}
                    onClose={() => setShowStartTripModal(false)}
                />
            )}

            {/* End Trip Modal */}
            {showEndTripModal && selectedOrder && (
                <EndTripModal
                    order={{
                        id: selectedOrder.id,
                        orderNo: selectedOrder.transportNo,
                        startOdometer: selectedOrder.startOdometer,
                        startTime: selectedOrder.startTime,
                    } as any}
                    isOpen={showEndTripModal}
                    onEndTrip={onEndTrip}
                    onClose={() => setShowEndTripModal(false)}
                />
            )}
        </div>
    );
}
