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
} from "lucide-react";
import { mockTrucks, mockTruckOrders, type TruckOrder } from "./TruckProfiles";
import type { TruckProfile } from "./TruckProfiles";

// Mock data สำหรับ Transport Delivery (เพื่อดูว่ารถกำลังส่งที่ไหน)
// ในระบบจริงควรดึงจาก API หรือ shared data
const mockTransportDeliveries = [
    {
        transportNo: "TR-20241215-001",
        truckPlateNumber: "กก 1111",
        truckId: "TRUCK-001",
        status: "กำลังขนส่ง" as const,
        destinationBranchNames: ["สาขา 2", "สาขา 3"],
        destinationBranchIds: [2, 3],
        deliveryItems: [
            { branchName: "สาขา 2", oilType: "Premium Diesel", quantity: 22000 },
            { branchName: "สาขา 3", oilType: "Diesel", quantity: 20000 },
        ],
    },
    {
        transportNo: "TR-20241215-002",
        truckPlateNumber: "กก 2222",
        truckId: "TRUCK-002",
        status: "กำลังขนส่ง" as const,
        destinationBranchNames: ["สาขา 4"],
        destinationBranchIds: [4],
        deliveryItems: [
            { branchName: "สาขา 4", oilType: "Premium Diesel", quantity: 24000 },
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
    const [selectedTruckId, setSelectedTruckId] = useState<string | null>(null);

    // ฟังก์ชันหา transport delivery ที่เกี่ยวข้อง
    const getTransportDelivery = (truckId: string, truckPlateNumber: string) => {
        return mockTransportDeliveries.find(
            (transport) =>
                (transport.truckId === truckId || transport.truckPlateNumber === truckPlateNumber) &&
                transport.status === "กำลังขนส่ง"
        );
    };

    // รวมข้อมูลรถกับ order และสถานะ
    const trucksWithStatus: TruckStatus[] = useMemo(() => {
        return mockTrucks.map((truck) => {
            // หา order ล่าสุดที่ยังไม่เสร็จ
            const activeOrder = mockTruckOrders
                .filter((order) => order.truckId === truck.id)
                .filter((order) => order.status !== "completed" && order.status !== "cancelled")
                .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())[0] || null;

            const stage = getStageFromOrderStatus(activeOrder);
            const remainingOil = calculateRemainingOil(activeOrder);

            // หา transport delivery
            const transportDelivery = getTransportDelivery(truck.id, truck.plateNumber);

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
            };
        });
    }, []);

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

    const selectedTruck = selectedTruckId
        ? trucksWithStatus.find((t) => t.truck.id === selectedTruckId)
        : trucksWithStatus[0];

    // คำนวณ % น้ำมันบนรถ
    const oilPercentage = selectedTruck ? calculateOilPercentage(selectedTruck.remainingOil) : 0;

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
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Dashboard สถานะรถ</h1>
                <p className="text-gray-500 dark:text-gray-400">
                    ติดตามสถานะรถส่งน้ำมันแบบเรียลไทม์ ดูขั้นตอนการทำงานและน้ำมันเหลือบนรถ
                </p>
            </header>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* รถทั้งหมด */}
                <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm flex items-center gap-5">
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-blue-100 dark:bg-blue-900/50">
                        <Truck className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">รถทั้งหมด</p>
                        <p className="text-2xl font-bold text-gray-800 dark:text-white">
                            {stats.total} <span className="text-base font-medium text-gray-500">คัน</span>
                        </p>
                    </div>
                </div>

                {/* รถพร้อมใช้งาน */}
                <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm flex items-center gap-5">
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-green-100 dark:bg-green-900/50">
                        <CheckCircle className="h-7 w-7 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">รถพร้อมใช้งาน</p>
                        <p className="text-2xl font-bold text-gray-800 dark:text-white">
                            {stats.active} <span className="text-base font-medium text-gray-500">คัน</span>
                        </p>
                    </div>
                </div>

                {/* รถกำลังทำงาน */}
                <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm flex items-center gap-5">
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-orange-100 dark:bg-orange-900/50">
                        <Activity className="h-7 w-7 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">รถกำลังทำงาน</p>
                        <p className="text-2xl font-bold text-gray-800 dark:text-white">
                            {stats.onTrip} <span className="text-base font-medium text-gray-500">คัน</span>
                        </p>
                    </div>
                </div>

                {/* น้ำมันเหลือบนรถ */}
                <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm flex items-center gap-5">
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-cyan-100 dark:bg-cyan-900/50">
                        <Droplet className="h-7 w-7 text-cyan-600 dark:text-cyan-400" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">น้ำมันเหลือบนรถ</p>
                        <p className="text-2xl font-bold text-gray-800 dark:text-white">
                            {numberFormatter.format(stats.totalRemainingOil)}{" "}
                            <span className="text-base font-medium text-gray-500">ลิตร</span>
                        </p>
                    </div>
                </div>
            </div>

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

                        {/* Fuel Level Bar */}
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">น้ำมันบนรถ</span>
                                <span className="text-sm font-bold text-green-500">{oilPercentage}%</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                                <div
                                    className="h-2.5 rounded-full transition-all duration-500 ease-out bg-green-500"
                                    style={{ width: `${oilPercentage}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>

                    {/* Status Timeline */}
                    <div className="flex items-start w-full">
                        {stages.map((stage, index) => {
                            const StageIcon = stage.icon;
                            const currentStageIndex = getStageIndex(selectedTruck.stage);
                            const isActive = index <= currentStageIndex;
                            const isLast = index === stages.length - 1;

                            return (
                                <div key={stage.id} className="flex items-start flex-1">
                                    <div className="flex flex-col items-center flex-1 w-full">
                                        <div
                                            className={`w-12 h-12 rounded-full flex items-center justify-center relative z-10 ${
                                                isActive
                                                    ? "bg-teal-500 text-white"
                                                    : "bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400"
                                            }`}
                                        >
                                            <StageIcon className="h-6 w-6" />
                                        </div>
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
        </div>
    );
}
