import { useState, useMemo } from "react";
import {
    Truck,
    Package,
    MapPin,
    Droplet,
    CheckCircle,
    Activity,
    Home,
    ClipboardCheck,
    X,
    Download,
    Clock,
} from "lucide-react";

// SVG รถน้ำมัน (Tanker Truck)
function TankerTruckIcon({ className = "", style = {} }) {
    return (
        <svg viewBox="0 0 180 90" className={className} style={style} fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="30" y="35" width="110" height="30" rx="15" fill="#e0e7ef" stroke="#64748b" strokeWidth="3" />
            <rect x="140" y="45" width="20" height="20" rx="5" fill="#cbd5e1" stroke="#64748b" strokeWidth="3" />
            <rect x="20" y="50" width="10" height="15" rx="2" fill="#cbd5e1" stroke="#64748b" strokeWidth="2" />
            <rect x="10" y="60" width="10" height="8" rx="2" fill="#64748b" />
            <circle cx="50" cy="75" r="10" fill="#64748b" stroke="#334155" strokeWidth="3" />
            <circle cx="140" cy="75" r="10" fill="#64748b" stroke="#334155" strokeWidth="3" />
            <rect x="60" y="40" width="60" height="20" rx="8" fill="#f1f5f9" />
            <rect x="120" y="50" width="10" height="10" rx="2" fill="#fbbf24" />
            <rect x="35" y="40" width="15" height="20" rx="5" fill="#fbbf24" />
            <rect x="80" y="30" width="20" height="10" rx="3" fill="#64748b" />
        </svg>
    );
}
import { mockTrucks, mockTruckOrders, type TruckOrder } from "./TruckProfiles";
import type { TruckProfile } from "./TruckProfiles";
import { useGasStation } from "@/contexts/GasStationContext";

// Mock data สำหรับ Transport Delivery (เพื่อดูว่ารถกำลังส่งที่ไหน)
// เพิ่ม mock ให้เยอะขึ้นและหลากหลายขึ้น
const mockTransportDeliveries = [
    {
        transportNo: "TR-20241215-001",
        truckPlateNumber: "กก 1111",
        truckId: "TRUCK-001",
        status: "กำลังขนส่ง" as const,
        destinationBranchNames: ["ดินดำ", "หนองจิก"],
        destinationBranchIds: [2, 3],
        deliveryItems: [
            { branchName: "ดินดำ", oilType: "Premium Diesel", quantity: 22000 },
            { branchName: "หนองจิก", oilType: "Diesel", quantity: 20000 },
        ],
    },
    {
        transportNo: "TR-20241215-002",
        truckPlateNumber: "กก 2222",
        truckId: "TRUCK-002",
        status: "กำลังขนส่ง" as const,
        destinationBranchNames: ["ตักสิลา"],
        destinationBranchIds: [4],
        deliveryItems: [
            { branchName: "ตักสิลา", oilType: "Premium Diesel", quantity: 24000 },
        ],
    },
    {
        transportNo: "TR-20241215-003",
        truckPlateNumber: "กก 3333",
        truckId: "TRUCK-003",
        status: "กำลังขนส่ง" as const,
        destinationBranchNames: ["บายพาส", "สาขา 6", "สาขา 7"],
        destinationBranchIds: [5, 6, 7],
        deliveryItems: [
            { branchName: "บายพาส", oilType: "Gasohol 91", quantity: 15000 },
            { branchName: "สาขา 6", oilType: "Diesel B7", quantity: 18000 },
            { branchName: "สาขา 7", oilType: "Premium Diesel", quantity: 12000 },
        ],
    },
    {
        transportNo: "TR-20241215-004",
        truckPlateNumber: "กก 4444",
        truckId: "TRUCK-004",
        status: "กำลังขนส่ง" as const,
        destinationBranchNames: ["สาขา 8"],
        destinationBranchIds: [8],
        deliveryItems: [
            { branchName: "สาขา 8", oilType: "Gasohol 95", quantity: 20000 },
        ],
    },
    {
        transportNo: "TR-20241215-005",
        truckPlateNumber: "กก 5555",
        truckId: "TRUCK-005",
        status: "กำลังขนส่ง" as const,
        destinationBranchNames: ["สาขา 9", "สาขา 10"],
        destinationBranchIds: [9, 10],
        deliveryItems: [
            { branchName: "สาขา 9", oilType: "Diesel", quantity: 17000 },
            { branchName: "สาขา 10", oilType: "Gasohol 91", quantity: 13000 },
        ],
    },
];

const numberFormatter = new Intl.NumberFormat("th-TH", {
    maximumFractionDigits: 0,
});

// ประเภทสถานะสำหรับ process flow
type TruckStage = "preparing" | "picking-up" | "delivering" | "completed";

interface TruckStatus {
    truck: TruckProfile;
    currentOrder: TruckOrder | null;
    stage: TruckStage;
    remainingOil: number; // น้ำมันเหลือบนรถ (ลิตร)
    currentLocation: string;
    nextDestination?: string;
    transportDelivery?: {
        destinationBranchNames: string[];
        destinationBranchIds: number[];
        deliveryItems: Array<{
            branchName: string;
            oilType: string;
            quantity: number;
        }>;
    };
    // ข้อมูลหลักฐานจากพนักงานขับรถ
    startTrip?: {
        startedAt: string;
        startOdometer: number;
        startOdometerPhoto?: string;
    };
    pickupConfirmation?: {
        confirmedAt: string;
        photos: string[];
        odometerReading: number;
        notes?: string;
    };
    deliveryConfirmations?: Array<{
        branchId: number;
        branchName: string;
        confirmedAt: string;
        photos: string[];
        odometerReading: number;
        notes?: string;
    }>;
}

// แปลงสถานะ order เป็น stage
const getStageFromOrderStatus = (order: TruckOrder | null): TruckStage => {
    if (!order) return "preparing";
    
    switch (order.status) {
        case "draft":
        case "quotation-recorded":
        case "ready-to-pickup":
            return "preparing";
        case "picking-up":
            return "picking-up";
        default:
            return "completed";
    }
};

// คำนวณน้ำมันเหลือบนรถ
const calculateRemainingOil = (order: TruckOrder | null): number => {
    if (!order || order.status === "completed" || order.status === "cancelled") {
        return 0;
    }
    
    if (order.status === "draft" || order.status === "quotation-recorded" || order.status === "ready-to-pickup") {
        return 0;
    }
    
    return order.quantity || 0;
};

// คำนวณ % น้ำมันบนรถ (สมมติว่าความจุรถ = 30000 ลิตร)
const calculateOilPercentage = (remainingOil: number, capacity: number = 30000): number => {
    if (capacity === 0) return 0;
    return Math.min(100, Math.round((remainingOil / capacity) * 100));
};

// แปลง stage เป็นข้อความสถานะ
const getStageText = (stage: TruckStage): string => {
    switch (stage) {
        case "preparing":
            return "เตรียมการ";
        case "picking-up":
            return "กำลังไปรับ";
        case "delivering":
            return "กำลังส่ง";
        case "completed":
            return "เสร็จสิ้น";
    }
};

export default function TruckDashboard() {
    const { transportDeliveries, trucks, driverJobs } = useGasStation();
    const [selectedTruckId, setSelectedTruckId] = useState<string | null>(null);
    const [selectedStage, setSelectedStage] = useState<TruckStage | null>(null);
    const [stageDetailsModal, setStageDetailsModal] = useState(false);
    const filterBranch: number | "all" = "all";
    const searchTerm = "";

    // ฟังก์ชันหา transport delivery ที่เกี่ยวข้อง - ใช้ข้อมูลจาก context
    const getTransportDelivery = (truckId: string, truckPlateNumber: string) => {
        const allTransports = transportDeliveries.length > 0 ? transportDeliveries : mockTransportDeliveries;
        return allTransports.find(
            (transport) =>
                (transport.truckId === truckId || transport.truckPlateNumber === truckPlateNumber) &&
                transport.status === "กำลังขนส่ง"
        );
    };

    // รวมข้อมูลรถกับ order และสถานะ - ใช้ข้อมูลจาก context
    const allTrucks = trucks.length > 0 ? trucks : mockTrucks;
    
    // Filter trucks
    const filteredTrucks = useMemo(() => {
        return allTrucks.filter((truck) => {
            const matchesSearch =
                truck.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                truck.assignedDriverName?.toLowerCase().includes(searchTerm.toLowerCase());
            
            // Branch filter - ต้องหาจาก order หรือ transport delivery
            const matchesBranch = filterBranch === "all";
            // TODO: เพิ่ม branch filter เมื่อมีข้อมูล branch ใน truck
            
            return matchesSearch && matchesBranch;
        });
    }, [allTrucks, searchTerm, filterBranch]);
    
    const trucksWithStatus: TruckStatus[] = useMemo(() => {
        return filteredTrucks.map((truck) => {
            // หา order ล่าสุดที่ยังไม่เสร็จ
            const activeOrder = mockTruckOrders
                .filter((order) => order.truckId === truck.id)
                .filter((order) => order.status !== "completed" && order.status !== "cancelled")
                .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())[0] || null;

            const stage = getStageFromOrderStatus(activeOrder);
            const remainingOil = calculateRemainingOil(activeOrder);

            // หา transport delivery
            const transportDelivery = getTransportDelivery(truck.id, truck.plateNumber);

            // หาข้อมูล driver job ที่เกี่ยวข้อง
            const driverJob = driverJobs.find(
                (job) =>
                    (job.truckPlateNumber === truck.plateNumber || job.transportNo) &&
                    (job.status === "ออกเดินทางแล้ว" ||
                        job.status === "รับน้ำมันแล้ว" ||
                        job.status === "จัดเรียงเส้นทางแล้ว" ||
                        job.status === "กำลังส่ง" ||
                        job.status === "ส่งเสร็จ")
            );

            // กำหนดสถานที่ปัจจุบัน
            let currentLocation = truck.currentLocation || truck.homeDepot || "คลังหลัก";
            let nextDestination: string | undefined;

            if (activeOrder) {
                if (stage === "preparing") {
                    currentLocation = truck.homeDepot || "คลังหลัก";
                    nextDestination = activeOrder.fromBranch || "จุดรับน้ำมัน";
                } else if (stage === "picking-up") {
                    currentLocation = "กำลังเดินทางไปคลังน้ำมัน";
                    nextDestination = activeOrder.fromBranch || "จุดรับน้ำมัน";
                } else if (stage === "delivering") {
                    currentLocation = activeOrder.fromBranch || "จุดรับน้ำมัน";
                    if (transportDelivery && transportDelivery.destinationBranchNames.length > 0) {
                        nextDestination = transportDelivery.destinationBranchNames.join(", ");
                    } else {
                        nextDestination = activeOrder.toBranch || "จุดส่งน้ำมัน";
                    }
                }
            }

            // รวบรวม delivery confirmations จากแต่ละ branch
            const deliveryConfirmations = driverJob
                ? driverJob.destinationBranches
                      .filter((branch) => branch.deliveryConfirmation)
                      .map((branch) => ({
                          branchId: branch.branchId,
                          branchName: branch.branchName,
                          confirmedAt: branch.deliveryConfirmation!.confirmedAt,
                          photos: branch.deliveryConfirmation!.photos,
                          odometerReading: branch.deliveryConfirmation!.odometerReading,
                          notes: branch.deliveryConfirmation!.notes,
                      }))
                : [];

            return {
                truck,
                currentOrder: activeOrder,
                stage,
                remainingOil,
                currentLocation,
                nextDestination,
                transportDelivery: transportDelivery
                    ? {
                          destinationBranchNames: transportDelivery.destinationBranchNames,
                          destinationBranchIds: transportDelivery.destinationBranchIds,
                          deliveryItems: transportDelivery.deliveryItems,
                      }
                    : undefined,
                startTrip: driverJob?.startTrip,
                pickupConfirmation: driverJob?.pickupConfirmation,
                deliveryConfirmations: deliveryConfirmations,
            };
        });
    }, [driverJobs, filteredTrucks]);

    // สถิติรวม
    const stats = useMemo(() => {
        const activeTrucks = trucksWithStatus.filter((t) => t.truck.status === "active");
        const onTrip = trucksWithStatus.filter((t) => t.currentOrder !== null).length;
        const totalRemainingOil = trucksWithStatus.reduce((sum, t) => sum + t.remainingOil, 0);
        
        return {
            total: trucksWithStatus.length,
            active: activeTrucks.length,
            onTrip,
            totalRemainingOil,
        };
    }, [trucksWithStatus]);

    // Process flow stages
    const stages = [
        {
            id: "preparing" as TruckStage,
            label: "เตรียมการ",
            icon: ClipboardCheck,
            description: "คำสั่งเตรียมการ/รอไปรับน้ำมัน",
        },
        {
            id: "picking-up" as TruckStage,
            label: "กำลังไปรับ",
            icon: Package,
            description: "กำลังเดินทางไปรับน้ำมัน",
        },
        {
            id: "delivering" as TruckStage,
            label: "กำลังส่ง",
            icon: Truck,
            description: "กำลังส่งน้ำมันไปยังปลายทาง",
        },
        {
            id: "completed" as TruckStage,
            label: "เสร็จสิ้น",
            icon: Home,
            description: "ส่งน้ำมันเสร็จสิ้นแล้ว",
        },
    ];

    const getStageIndex = (stage: TruckStage): number => {
        return stages.findIndex((s) => s.id === stage);
    };

    // ฟังก์ชันเพื่อดึงข้อมูลตามแต่ละ stage
    const getStageData = (truckStatus: TruckStatus, stage: TruckStage) => {
        switch (stage) {
            case "preparing":
                return {
                    hasData: false,
                    data: null,
                };
            case "picking-up":
                return {
                    hasData: !!truckStatus.startTrip,
                    data: truckStatus.startTrip,
                };
            case "delivering":
                return {
                    hasData: !!truckStatus.pickupConfirmation,
                    data: truckStatus.pickupConfirmation,
                };
            case "completed":
                return {
                    hasData: (truckStatus.deliveryConfirmations && truckStatus.deliveryConfirmations.length > 0) || false,
                    data: truckStatus.deliveryConfirmations,
                };
            default:
                return {
                    hasData: false,
                    data: null,
                };
        }
    };

    const selectedTruck = selectedTruckId
        ? trucksWithStatus.find((t) => t.truck.id === selectedTruckId)
        : trucksWithStatus[0];

    // คำนวณ % น้ำมันบนรถ
    const oilPercentage = selectedTruck ? calculateOilPercentage(selectedTruck.remainingOil) : 0;

    // Modal สำหรับรายละเอียดน้ำมันบนรถ
    const [oilDetailModal, setOilDetailModal] = useState(false);

    // Last update time
    const lastUpdateTime = new Date().toLocaleString("th-TH", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });

    return (
        <div className="p-6 md:p-8 text-gray-800 dark:text-gray-200">
            {/* Header */}
            <header className="mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="flex items-center gap-3">
                        <Truck className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                        <h1 className="text-2xl font-bold text-gray-800 dark:text-white tracking-tight">Dashboard สถานะรถขนส่ง</h1>
                    </div>
                    <div className="flex items-center gap-2 mt-2 sm:mt-0">
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-semibold">
                            <Droplet className="h-4 w-4" /> น้ำมันรวม {numberFormatter.format(stats.totalRemainingOil)} ลิตร
                        </span>
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-semibold">
                            <CheckCircle className="h-4 w-4" /> พร้อมใช้งาน {stats.active} คัน
                        </span>
                    </div>
                </div>
                <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">
                    ติดตามสถานะรถขนส่งน้ำมันแบบเรียลไทม์ <span className="hidden sm:inline">ดูขั้นตอนการทำงานและน้ำมันเหลือบนรถ</span>
                </p>
            </header>

            {/* Summary Cards */}
            <section className="mb-8">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="rounded-2xl shadow bg-white dark:bg-gray-800 p-4 flex flex-col items-center gap-2 border-t-4 border-blue-400">
                        <Truck className="h-8 w-8 text-blue-500 mb-1" />
                        <span className="text-xs text-gray-500 dark:text-gray-400">รถทั้งหมด</span>
                        <span className="text-2xl font-bold text-gray-800 dark:text-white">{stats.total}</span>
                        <span className="text-xs text-gray-400">คัน</span>
                    </div>
                    <div className="rounded-2xl shadow bg-white dark:bg-gray-800 p-4 flex flex-col items-center gap-2 border-t-4 border-green-400">
                        <CheckCircle className="h-8 w-8 text-green-500 mb-1" />
                        <span className="text-xs text-gray-500 dark:text-gray-400">พร้อมใช้งาน</span>
                        <span className="text-2xl font-bold text-gray-800 dark:text-white">{stats.active}</span>
                        <span className="text-xs text-gray-400">คัน</span>
                    </div>
                    <div className="rounded-2xl shadow bg-white dark:bg-gray-800 p-4 flex flex-col items-center gap-2 border-t-4 border-orange-400">
                        <Activity className="h-8 w-8 text-orange-500 mb-1" />
                        <span className="text-xs text-gray-500 dark:text-gray-400">กำลังทำงาน</span>
                        <span className="text-2xl font-bold text-gray-800 dark:text-white">{stats.onTrip}</span>
                        <span className="text-xs text-gray-400">คัน</span>
                    </div>
                    <div className="rounded-2xl shadow bg-white dark:bg-gray-800 p-4 flex flex-col items-center gap-2 border-t-4 border-cyan-400">
                        <Droplet className="h-8 w-8 text-cyan-500 mb-1" />
                        <span className="text-xs text-gray-500 dark:text-gray-400">น้ำมันรวม</span>
                        <span className="text-2xl font-bold text-gray-800 dark:text-white">{numberFormatter.format(stats.totalRemainingOil)}</span>
                        <span className="text-xs text-gray-400">ลิตร</span>
                    </div>
                </div>
            </section>

            {/* Truck Selection */}
            <div className="mb-6">
                <h2 className="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-300">เลือกรถที่ต้องการดู</h2>
                <div className="flex gap-4 pb-2 overflow-x-auto">
                    {trucksWithStatus.map((truckStatus) => {
                        const isSelected = selectedTruckId === truckStatus.truck.id || (!selectedTruckId && truckStatus.truck.id === trucksWithStatus[0]?.truck.id);
                        return (
                            <button
                                key={truckStatus.truck.id}
                                onClick={() => setSelectedTruckId(truckStatus.truck.id)}
                                className={`flex-shrink-0 w-48 p-3 rounded-lg border-2 transition-all duration-200 ${
                                    isSelected
                                        ? "bg-teal-50 dark:bg-teal-900/20 border-teal-500 dark:border-teal-500 shadow"
                                        : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 hover:border-teal-400 dark:hover:border-teal-600"
                                }`}
                            >
                                <div className="flex items-center gap-3 text-left">
                                    <div
                                        className={`w-10 h-10 flex items-center justify-center rounded-md ${
                                            isSelected
                                                ? "bg-teal-500 text-white"
                                                : "bg-gray-100 dark:bg-gray-700 text-gray-500"
                                        }`}
                                    >
                                        <Truck className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-800 dark:text-white">
                                            {truckStatus.truck.plateNumber}
                                        </p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {truckStatus.truck.assignedDriverName || "ไม่มีคนขับ"}
                                        </p>
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Truck Detail */}
            {selectedTruck && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 space-y-8">
                    {/* Header with Status */}
                    <div>
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                                    สถานะรถ: {selectedTruck.truck.plateNumber}
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    คนขับ: {selectedTruck.truck.assignedDriverName || "ไม่มีคนขับ"}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-500 dark:text-gray-400">สถานะ</p>
                                <span className="px-3 py-1 text-sm font-semibold rounded-full bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400">
                                    {getStageText(selectedTruck.stage)}
                                </span>
                            </div>
                        </div>

                        {/* Big Truck Icon with Oil Percentage */}
                        <div className="flex flex-col items-center justify-center my-8">
                            <button
                                className="relative group focus:outline-none"
                                onClick={() => setOilDetailModal(true)}
                                title="ดูรายละเอียดน้ำมันบนรถ"
                                style={{ width: 240, height: 140 }}
                            >
                                <span className="block">
                                    <TankerTruckIcon className="w-[220px] h-[110px] mx-auto" style={{ filter: 'drop-shadow(0 4px 16px #0002)' }} />
                                </span>
                                <svg className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" width="140" height="140">
                                    <circle
                                        cx="70" cy="70" r="60"
                                        stroke="#e5e7eb" strokeWidth="12" fill="none"
                                    />
                                    <circle
                                        cx="70" cy="70" r="60"
                                        stroke="#22c55e"
                                        strokeWidth="12"
                                        fill="none"
                                        strokeDasharray={2 * Math.PI * 60}
                                        strokeDashoffset={2 * Math.PI * 60 * (1 - oilPercentage / 100)}
                                        strokeLinecap="round"
                                        style={{ transition: 'stroke-dashoffset 0.5s' }}
                                    />
                                </svg>
                                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl font-extrabold text-green-600 dark:text-green-400 drop-shadow pointer-events-none select-none">
                                    {oilPercentage}%
                                </span>
                                <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs bg-white/80 dark:bg-gray-900/80 px-2 py-0.5 rounded-full text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 shadow">
                                    กดดูรายละเอียด
                                </span>
                            </button>
                            <span className="mt-3 text-base font-semibold text-gray-600 dark:text-gray-300">น้ำมันบนรถ</span>

                                                        {/* แสดงรายละเอียดน้ำมันแต่ละประเภท เฉพาะเมื่อมีน้ำมันเหลืออยู่บนรถจริง */}
                                                        {selectedTruck.remainingOil > 0 && selectedTruck.transportDelivery && Array.isArray(selectedTruck.transportDelivery.deliveryItems) && selectedTruck.transportDelivery.deliveryItems.length > 0 &&
                                                            selectedTruck.transportDelivery.deliveryItems.some(item => item.quantity > 0) && (
                                                                <div className="w-full max-w-md mx-auto mt-4">
                                                                    <div className="space-y-2">
                                                                        {selectedTruck.transportDelivery.deliveryItems.filter(item => item.quantity > 0).map((item, idx) => (
                                                                            <div key={idx} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/40 rounded-lg px-4 py-2">
                                                                                <div className="flex flex-col">
                                                                                    <span className="font-semibold text-gray-800 dark:text-white">{item.oilType}</span>
                                                                                    <span className="text-xs text-gray-500 dark:text-gray-400">{item.branchName}</span>
                                                                                </div>
                                                                                <span className="font-bold text-green-600 dark:text-green-400">{numberFormatter.format(item.quantity)} ลิตร</span>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                        )}
                        </div>
                    </div>
            {/* Oil Detail Modal */}
            {oilDetailModal && selectedTruck && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 p-5">
                            <div className="flex items-center gap-2">
                                <Truck className="h-7 w-7 text-green-500" />
                                <h2 className="text-xl font-bold text-gray-800 dark:text-white">รายละเอียดน้ำมันบนรถ</h2>
                            </div>
                            <button
                                onClick={() => setOilDetailModal(false)}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="p-6">
                            <div className="mb-4">
                                <span className="text-lg font-bold text-green-600 dark:text-green-400">{oilPercentage}%</span>
                                <span className="ml-2 text-gray-500 dark:text-gray-400">ของความจุรถ (30,000 ลิตร)</span>
                            </div>
                            {/* Mock: แสดงน้ำมันแต่ละประเภทบนรถ */}
                            <div className="space-y-3">
                                {/* ในระบบจริงควรดึงจาก order/deliveryItems หรือ state จริง */}
                                {(selectedTruck.transportDelivery?.deliveryItems || [
                                    { branchName: "สาขา 1", oilType: "Diesel", quantity: 12000 },
                                    { branchName: "ดินดำ", oilType: "Gasohol 95", quantity: 8000 },
                                    { branchName: "หนองจิก", oilType: "Premium Diesel", quantity: 10000 },
                                ]).map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/40 rounded-lg px-4 py-2">
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-gray-800 dark:text-white">{item.oilType}</span>
                                            <span className="text-xs text-gray-500 dark:text-gray-400">{item.branchName}</span>
                                        </div>
                                        <span className="font-bold text-green-600 dark:text-green-400">{numberFormatter.format(item.quantity)} ลิตร</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

                    {/* Status Timeline */}
                    <div className="flex items-start w-full">
                        {stages.map((stage, index) => {
                            const StageIcon = stage.icon;
                            const currentStageIndex = getStageIndex(selectedTruck.stage);
                            const isActive = index <= currentStageIndex;
                            const isLast = index === stages.length - 1;
                            const hasData = getStageData(selectedTruck, stage.id).hasData;

                            return (
                                <div key={stage.id} className="flex items-start flex-1">
                                    <div className="flex flex-col items-center flex-1 w-full">
                                        <button
                                            onClick={() => {
                                                setSelectedStage(stage.id);
                                                setStageDetailsModal(true);
                                            }}
                                            disabled={!hasData}
                                            className={`w-12 h-12 rounded-full flex items-center justify-center relative z-10 transition-all ${
                                                !hasData
                                                    ? "cursor-not-allowed opacity-50"
                                                    : "hover:scale-110 hover:shadow-lg cursor-pointer"
                                            } ${
                                                isActive
                                                    ? "bg-teal-500 text-white"
                                                    : "bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400"
                                            }`}
                                            title={hasData ? `คลิกดูรายละเอียด ${stage.label}` : "ไม่มีข้อมูล"}
                                        >
                                            <StageIcon className="h-6 w-6" />
                                            {hasData && (
                                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                                                    <span className="text-xs text-white font-bold">✓</span>
                                                </div>
                                            )}
                                        </button>
                                        <p
                                            className={`text-sm font-semibold mt-2 text-center ${
                                                isActive
                                                    ? "text-gray-700 dark:text-gray-200"
                                                    : "text-gray-400 dark:text-gray-500"
                                            }`}
                                        >
                                            {stage.label}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 text-center px-1">
                                            {stage.description}
                                        </p>
                                    </div>
                                    {!isLast && (
                                        <div className="flex-1 h-1 bg-gray-200 dark:bg-gray-600 mt-5 relative mx-2">
                                            <div
                                                className={`h-1 absolute top-0 left-0 transition-all duration-300 ${
                                                    isActive ? "bg-teal-500 w-full" : "bg-transparent"
                                                }`}
                                            ></div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Location Information */}
                    <div className="bg-teal-50/50 dark:bg-teal-900/10 p-4 rounded-lg">
                        <div className="flex items-center mb-4">
                            <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/50 mr-4">
                                <MapPin className="h-6 w-6 text-blue-500 dark:text-blue-400" />
                            </div>
                            <h4 className="text-md font-semibold text-gray-800 dark:text-gray-200">ข้อมูลสถานที่</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-white/50 dark:bg-gray-800/50 p-3 rounded-md">
                                <p className="text-xs text-gray-500 dark:text-gray-400">สถานที่ปัจจุบัน</p>
                                <p className="font-semibold text-gray-700 dark:text-gray-300">
                                    {selectedTruck.currentLocation}
                                </p>
                            </div>
                            <div className="bg-white/50 dark:bg-gray-800/50 p-3 rounded-md">
                                <p className="text-xs text-gray-500 dark:text-gray-400">ปลายทางถัดไป</p>
                                {selectedTruck.stage === "delivering" && selectedTruck.transportDelivery ? (
                                    <div className="space-y-1">
                                        <p className="font-semibold text-gray-700 dark:text-gray-300">
                                            {selectedTruck.transportDelivery.destinationBranchNames.length} ปั๊ม
                                        </p>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {selectedTruck.transportDelivery.destinationBranchNames.map((branch, idx) => (
                                                <span
                                                    key={idx}
                                                    className="text-xs px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400"
                                                >
                                                    {branch}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <p className="font-semibold text-gray-700 dark:text-gray-300">
                                        {selectedTruck.nextDestination || "ไม่มีข้อมูล"}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Last Update */}
                    <div className="text-center mt-4">
                        <p className="text-xs text-gray-400 dark:text-gray-500">อัปเดตล่าสุด: {lastUpdateTime}</p>
                    </div>
                </div>
            )}

            {/* Stage Details Modal */}
            {stageDetailsModal && selectedStage && selectedTruck && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Header */}
                        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                                    {stages.find((s) => s.id === selectedStage)?.label}
                                </h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    รถ: {selectedTruck.truck.plateNumber}
                                </p>
                            </div>
                            <button
                                onClick={() => setStageDetailsModal(false)}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-6">
                            {selectedStage === "picking-up" && selectedTruck.startTrip && (
                                <div className="space-y-4">
                                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                                        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-4">
                                            ข้อมูลออกเดินทาง
                                        </h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">เวลาออกเดินทาง</p>
                                                <p className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2 mt-1">
                                                    <Clock className="h-5 w-5 text-blue-600" />
                                                    {new Date(selectedTruck.startTrip.startedAt).toLocaleTimeString("th-TH")}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">เลขไมล์เริ่มต้น</p>
                                                <p className="text-lg font-semibold text-gray-800 dark:text-white">
                                                    {numberFormatter.format(selectedTruck.startTrip.startOdometer)} ไมล์
                                                </p>
                                            </div>
                                        </div>

                                        {selectedTruck.startTrip.startOdometerPhoto && (
                                            <div className="mt-4">
                                                <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                                                    รูปหลักฐานเลขไมล์เริ่มต้น
                                                </p>
                                                <div className="relative">
                                                    <img
                                                        src={selectedTruck.startTrip.startOdometerPhoto}
                                                        alt="Start odometer"
                                                        className="w-full h-64 object-cover rounded-lg"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {selectedStage === "delivering" && selectedTruck.pickupConfirmation && (
                                <div className="space-y-4">
                                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                                        <h3 className="text-lg font-semibold text-green-900 dark:text-green-300 mb-4">
                                            ข้อมูลการรับน้ำมัน
                                        </h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">เวลายืนยันการรับ</p>
                                                <p className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2 mt-1">
                                                    <Clock className="h-5 w-5 text-green-600" />
                                                    {new Date(selectedTruck.pickupConfirmation.confirmedAt).toLocaleTimeString("th-TH")}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">เลขไมล์</p>
                                                <p className="text-lg font-semibold text-gray-800 dark:text-white">
                                                    {numberFormatter.format(selectedTruck.pickupConfirmation.odometerReading)} ไมล์
                                                </p>
                                            </div>
                                        </div>

                                        {selectedTruck.pickupConfirmation.notes && (
                                            <div className="mt-3">
                                                <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">หมายเหตุ</p>
                                                <p className="text-gray-700 dark:text-gray-300 mt-1">
                                                    {selectedTruck.pickupConfirmation.notes}
                                                </p>
                                            </div>
                                        )}

                                        {selectedTruck.pickupConfirmation.photos.length > 0 && (
                                            <div className="mt-4">
                                                <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3">
                                                    หลักฐานการรับน้ำมัน ({selectedTruck.pickupConfirmation.photos.length} รูป)
                                                </p>
                                                <div className="grid grid-cols-2 gap-3">
                                                    {selectedTruck.pickupConfirmation.photos.map((photo, idx) => (
                                                        <div key={idx} className="relative group">
                                                            <img
                                                                src={photo}
                                                                alt={`Pickup photo ${idx + 1}`}
                                                                className="w-full h-40 object-cover rounded-lg"
                                                            />
                                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                                                                <Download className="h-6 w-6 text-white" />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {selectedStage === "completed" && selectedTruck.deliveryConfirmations && selectedTruck.deliveryConfirmations.length > 0 && (
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                                        หลักฐานการส่งน้ำมัน ({selectedTruck.deliveryConfirmations.length} สาขา)
                                    </h3>

                                    {selectedTruck.deliveryConfirmations.map((delivery, idx) => (
                                        <div
                                            key={idx}
                                            className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800"
                                        >
                                            <div className="flex items-center justify-between mb-4">
                                                <h4 className="text-lg font-semibold text-purple-900 dark:text-purple-300">
                                                    {delivery.branchName}
                                                </h4>
                                                <span className="text-xs px-3 py-1 bg-purple-200 dark:bg-purple-900/50 text-purple-900 dark:text-purple-300 rounded-full font-semibold">
                                                    ส่งแล้ว
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 mb-4">
                                                <div>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">เวลายืนยันการส่ง</p>
                                                    <p className="text-base font-semibold text-gray-800 dark:text-white flex items-center gap-2 mt-1">
                                                        <Clock className="h-4 w-4 text-purple-600" />
                                                        {new Date(delivery.confirmedAt).toLocaleTimeString("th-TH")}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">เลขไมล์</p>
                                                    <p className="text-base font-semibold text-gray-800 dark:text-white">
                                                        {numberFormatter.format(delivery.odometerReading)} ไมล์
                                                    </p>
                                                </div>
                                            </div>

                                            {delivery.notes && (
                                                <div className="mb-4">
                                                    <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">หมายเหตุ</p>
                                                    <p className="text-gray-700 dark:text-gray-300 mt-1">{delivery.notes}</p>
                                                </div>
                                            )}

                                            {delivery.photos.length > 0 && (
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3">
                                                        หลักฐานการส่ง ({delivery.photos.length} รูป)
                                                    </p>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        {delivery.photos.map((photo, photIdx) => (
                                                            <div key={photIdx} className="relative group">
                                                                <img
                                                                    src={photo}
                                                                    alt={`Delivery photo ${photIdx + 1}`}
                                                                    className="w-full h-40 object-cover rounded-lg"
                                                                />
                                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                                                                    <Download className="h-6 w-6 text-white" />
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {!getStageData(selectedTruck, selectedStage).hasData && (
                                <div className="bg-gray-50 dark:bg-gray-700/50 p-8 rounded-lg text-center">
                                    <div className="text-gray-400 dark:text-gray-500 mb-2">
                                        <Package className="h-12 w-12 mx-auto mb-2" />
                                    </div>
                                    <p className="text-gray-600 dark:text-gray-400">ไม่มีข้อมูลหลักฐานสำหรับขั้นตอนนี้</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
