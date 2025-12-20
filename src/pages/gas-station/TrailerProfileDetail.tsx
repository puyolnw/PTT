import { motion } from "framer-motion";
import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    Droplet,
    Calendar,
    Wrench,
    Truck,
    CheckCircle,
    AlertCircle,
    AlertTriangle,
    FileText,
    Activity,
} from "lucide-react";
import { mockTrailers, mockTrucks } from "./TruckProfiles";

const numberFormatter = new Intl.NumberFormat("th-TH", {
    maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
});

// Helper functions for document expiry checking
const getDaysUntilExpiry = (expiryDate: string): number => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
};

const isDocumentExpiringSoon = (expiryDate: string | undefined, daysThreshold: number = 30): boolean => {
    if (!expiryDate) return false;
    const daysUntil = getDaysUntilExpiry(expiryDate);
    return daysUntil <= daysThreshold && daysUntil > 0;
};

const isDocumentExpired = (expiryDate: string | undefined): boolean => {
    if (!expiryDate) return false;
    return getDaysUntilExpiry(expiryDate) <= 0;
};

// Mock trip history data
const mockTripHistory = [
    {
        id: "TRIP-001",
        date: "2024-12-15",
        truckId: "TRUCK-001",
        truckPlate: "กก 1111",
        from: "คลังน้ำมันบางจาก",
        to: "ปั๊ม PTT สาขา 1",
        oilType: "Diesel",
        volume: 10000,
        distance: 45,
    },
    {
        id: "TRIP-002",
        date: "2024-12-14",
        truckId: "TRUCK-001",
        truckPlate: "กก 1111",
        from: "คลังน้ำมันบางจาก",
        to: "ปั๊ม PTT ดินดำ",
        oilType: "Gasohol 91",
        volume: 8000,
        distance: 32,
    },
    {
        id: "TRIP-003",
        date: "2024-12-13",
        truckId: "TRUCK-002",
        truckPlate: "กก 2222",
        from: "คลังน้ำมันเชลล์",
        to: "ปั๊ม Shell หนองจิก",
        oilType: "Diesel",
        volume: 10000,
        distance: 28,
    },
];

export default function TrailerProfileDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [selectedTab, setSelectedTab] = useState<"overview" | "trips" | "documents" | "maintenance">("overview");

    // หาข้อมูลหาง
    const trailer = useMemo(() => {
        return mockTrailers.find((t) => t.id === id);
    }, [id]);

    // หารถที่ใช้หางนี้อยู่
    const currentTruck = useMemo(() => {
        if (!trailer) return null;
        return mockTrucks.find((t) => t.currentTrailerId === trailer.id);
    }, [trailer]);

    // หารถที่ใช้ได้กับหางนี้
    const compatibleTrucks = useMemo(() => {
        if (!trailer) return [];
        return mockTrucks.filter((t) => t.compatibleTrailers.includes(trailer.id));
    }, [trailer]);

    // หาประวัติการใช้งาน
    const tripHistory = useMemo(() => {
        if (!trailer) return [];
        return mockTripHistory.filter((trip) => {
            const truck = mockTrucks.find((t) => t.id === trip.truckId);
            return truck?.currentTrailerId === trailer.id;
        });
    }, [trailer]);

    if (!trailer) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <Droplet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-xl text-gray-600 dark:text-gray-400">ไม่พบข้อมูลหาง</p>
                    <button
                        onClick={() => navigate("/app/gas-station/trailer-profiles")}
                        className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                    >
                        กลับไปหน้ารายการ
                    </button>
                </div>
            </div>
        );
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "available":
                return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
            case "in-use":
                return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
            case "maintenance":
                return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
            default:
                return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case "available":
                return "พร้อมใช้งาน";
            case "in-use":
                return "ใช้งานอยู่";
            case "maintenance":
                return "ซ่อมบำรุง";
            default:
                return status;
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
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate("/app/gas-station/trailer-profiles")}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                                <Droplet className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                            </div>
                            {trailer.plateNumber}
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            ความจุ {numberFormatter.format(trailer.capacity)} ลิตร
                        </p>
                    </div>
                </div>
                <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(trailer.status)}`}>
                    {getStatusText(trailer.status)}
                </span>
            </motion.div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
                <button
                    onClick={() => setSelectedTab("overview")}
                    className={`px-6 py-3 font-medium transition-colors ${selectedTab === "overview"
                        ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                        }`}
                >
                    ภาพรวม
                </button>
                <button
                    onClick={() => setSelectedTab("trips")}
                    className={`px-6 py-3 font-medium transition-colors ${selectedTab === "trips"
                        ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                        }`}
                >
                    ประวัติการใช้งาน ({tripHistory.length})
                </button>
                <button
                    onClick={() => setSelectedTab("documents")}
                    className={`px-6 py-3 font-medium transition-colors ${selectedTab === "documents"
                        ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                        }`}
                >
                    เอกสาร
                </button>
                <button
                    onClick={() => setSelectedTab("maintenance")}
                    className={`px-6 py-3 font-medium transition-colors ${selectedTab === "maintenance"
                        ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                        }`}
                >
                    บำรุงรักษา
                </button>
            </div>

            {/* Overview Tab */}
            {selectedTab === "overview" && (
                <div className="space-y-6">
                    {/* Current Truck */}
                    {currentTruck && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700"
                        >
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <Truck className="w-5 h-5" />
                                รถที่ใช้อยู่ปัจจุบัน
                            </h3>
                            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-semibold text-gray-900 dark:text-white">{currentTruck.plateNumber}</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {currentTruck.brand} {currentTruck.model} ({currentTruck.year})
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => navigate(`/app/gas-station/truck-profiles/${currentTruck.id}`)}
                                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                    >
                                        ดูรายละเอียด
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Specifications */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700"
                    >
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">ข้อมูลทั่วไป</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">ทะเบียนหาง</p>
                                <p className="font-semibold text-gray-900 dark:text-white">{trailer.plateNumber}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">ความจุ</p>
                                <p className="font-semibold text-gray-900 dark:text-white">
                                    {numberFormatter.format(trailer.capacity)} ลิตร
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">สถานะ</p>
                                <p className="font-semibold text-gray-900 dark:text-white">{getStatusText(trailer.status)}</p>
                            </div>
                            {trailer.lastMaintenanceDate && (
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">บำรุงรักษาครั้งล่าสุด</p>
                                    <p className="font-semibold text-gray-900 dark:text-white">
                                        {dateFormatter.format(new Date(trailer.lastMaintenanceDate))}
                                    </p>
                                </div>
                            )}
                            {trailer.nextMaintenanceDate && (
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">บำรุงรักษาครั้งถัดไป</p>
                                    <p className="font-semibold text-gray-900 dark:text-white">
                                        {dateFormatter.format(new Date(trailer.nextMaintenanceDate))}
                                    </p>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Compatible Trucks */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700"
                    >
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                            รถที่ใช้ได้ ({compatibleTrucks.length} คัน)
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {compatibleTrucks.map((truck) => (
                                <div
                                    key={truck.id}
                                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${truck.id === currentTruck?.id
                                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                                        }`}
                                    onClick={() => navigate(`/app/gas-station/truck-profiles/${truck.id}`)}
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        <Truck className="w-4 h-4 text-gray-500" />
                                        <p className="font-semibold text-gray-900 dark:text-white">{truck.plateNumber}</p>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {truck.brand} {truck.model}
                                    </p>
                                    {truck.id === currentTruck?.id && (
                                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">● ใช้งานอยู่</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Trips Tab */}
            {selectedTab === "trips" && (
                <div className="space-y-6">
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
                                            วันที่
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            รถ
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            จาก
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            ไป
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            ประเภทน้ำมัน
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            ปริมาณ (ลิตร)
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            ระยะทาง (กม.)
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {tripHistory.map((trip) => (
                                        <tr key={trip.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                {dateFormatter.format(new Date(trip.date))}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                {trip.truckPlate}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{trip.from}</td>
                                            <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{trip.to}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                {trip.oilType}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                {numberFormatter.format(trip.volume)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                {trip.distance}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {tripHistory.length === 0 && (
                            <div className="text-center py-12">
                                <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-600 dark:text-gray-400">ยังไม่มีประวัติการใช้งาน</p>
                            </div>
                        )}
                    </motion.div>
                </div>
            )}

            {/* Documents Tab */}
            {selectedTab === "documents" && (
                <div className="space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700"
                    >
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <FileText className="w-5 h-5" />
                            เอกสารประจำหาง
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* พ.ร.บ. */}
                            <div
                                className={`p-4 rounded-lg border-2 ${isDocumentExpired(trailer.compulsoryInsuranceExpiry)
                                    ? "border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-800"
                                    : isDocumentExpiringSoon(trailer.compulsoryInsuranceExpiry)
                                        ? "border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800"
                                        : "border-gray-200 bg-gray-50 dark:bg-gray-700/50 dark:border-gray-700"
                                    }`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <p className="font-semibold text-gray-900 dark:text-white text-sm">พ.ร.บ.</p>
                                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                            {trailer.compulsoryInsuranceExpiry
                                                ? dateFormatter.format(new Date(trailer.compulsoryInsuranceExpiry))
                                                : "ไม่ระบุ"}
                                        </p>
                                        {trailer.compulsoryInsuranceExpiry &&
                                            isDocumentExpiringSoon(trailer.compulsoryInsuranceExpiry) && (
                                                <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-1">
                                                    เหลืออีก {getDaysUntilExpiry(trailer.compulsoryInsuranceExpiry)} วัน
                                                </p>
                                            )}
                                    </div>
                                    {isDocumentExpired(trailer.compulsoryInsuranceExpiry) ? (
                                        <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                                    ) : isDocumentExpiringSoon(trailer.compulsoryInsuranceExpiry) ? (
                                        <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                                    ) : (
                                        <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                    )}
                                </div>
                            </div>

                            {/* ทะเบียนรถ */}
                            <div
                                className={`p-4 rounded-lg border-2 ${isDocumentExpired(trailer.vehicleTaxExpiry)
                                    ? "border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-800"
                                    : isDocumentExpiringSoon(trailer.vehicleTaxExpiry)
                                        ? "border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800"
                                        : "border-gray-200 bg-gray-50 dark:bg-gray-700/50 dark:border-gray-700"
                                    }`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <p className="font-semibold text-gray-900 dark:text-white text-sm">ทะเบียนรถ/ป้ายวงกลม</p>
                                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                            {trailer.vehicleTaxExpiry
                                                ? dateFormatter.format(new Date(trailer.vehicleTaxExpiry))
                                                : "ไม่ระบุ"}
                                        </p>
                                        {trailer.vehicleTaxExpiry && isDocumentExpiringSoon(trailer.vehicleTaxExpiry) && (
                                            <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-1">
                                                เหลืออีก {getDaysUntilExpiry(trailer.vehicleTaxExpiry)} วัน
                                            </p>
                                        )}
                                    </div>
                                    {isDocumentExpired(trailer.vehicleTaxExpiry) ? (
                                        <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                                    ) : isDocumentExpiringSoon(trailer.vehicleTaxExpiry) ? (
                                        <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                                    ) : (
                                        <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                    )}
                                </div>
                            </div>

                            {/* ประกันภัย */}
                            <div
                                className={`p-4 rounded-lg border-2 ${isDocumentExpired(trailer.insuranceExpiry)
                                    ? "border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-800"
                                    : isDocumentExpiringSoon(trailer.insuranceExpiry)
                                        ? "border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800"
                                        : "border-gray-200 bg-gray-50 dark:bg-gray-700/50 dark:border-gray-700"
                                    }`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <p className="font-semibold text-gray-900 dark:text-white text-sm">ประกันภัย</p>
                                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                            {trailer.insuranceExpiry
                                                ? dateFormatter.format(new Date(trailer.insuranceExpiry))
                                                : "ไม่ระบุ"}
                                        </p>
                                        {trailer.insuranceExpiry && isDocumentExpiringSoon(trailer.insuranceExpiry) && (
                                            <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-1">
                                                เหลืออีก {getDaysUntilExpiry(trailer.insuranceExpiry)} วัน
                                            </p>
                                        )}
                                    </div>
                                    {isDocumentExpired(trailer.insuranceExpiry) ? (
                                        <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                                    ) : isDocumentExpiringSoon(trailer.insuranceExpiry) ? (
                                        <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                                    ) : (
                                        <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                    )}
                                </div>
                            </div>

                            {/* ใบอนุญาตขนส่งวัตถุอันตราย */}
                            <div
                                className={`p-4 rounded-lg border-2 ${isDocumentExpired(trailer.hazmatLicenseExpiry)
                                    ? "border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-800"
                                    : isDocumentExpiringSoon(trailer.hazmatLicenseExpiry)
                                        ? "border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800"
                                        : "border-gray-200 bg-gray-50 dark:bg-gray-700/50 dark:border-gray-700"
                                    }`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <p className="font-semibold text-gray-900 dark:text-white text-sm">
                                            ใบอนุญาตขนส่งวัตถุอันตราย
                                        </p>
                                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                            {trailer.hazmatLicenseExpiry
                                                ? dateFormatter.format(new Date(trailer.hazmatLicenseExpiry))
                                                : "ไม่ระบุ"}
                                        </p>
                                        {trailer.hazmatLicenseExpiry && isDocumentExpiringSoon(trailer.hazmatLicenseExpiry) && (
                                            <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-1">
                                                เหลืออีก {getDaysUntilExpiry(trailer.hazmatLicenseExpiry)} วัน
                                            </p>
                                        )}
                                    </div>
                                    {isDocumentExpired(trailer.hazmatLicenseExpiry) ? (
                                        <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                                    ) : isDocumentExpiringSoon(trailer.hazmatLicenseExpiry) ? (
                                        <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                                    ) : (
                                        <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Maintenance Tab */}
            {selectedTab === "maintenance" && (
                <div className="space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700"
                    >
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <Wrench className="w-5 h-5" />
                            ประวัติการบำรุงรักษา
                        </h3>
                        <div className="space-y-4">
                            {trailer.lastMaintenanceDate && (
                                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Calendar className="w-4 h-4 text-gray-500" />
                                        <p className="font-semibold text-gray-900 dark:text-white">
                                            {dateFormatter.format(new Date(trailer.lastMaintenanceDate))}
                                        </p>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">การบำรุงรักษาครั้งล่าสุด</p>
                                </div>
                            )}
                            {trailer.nextMaintenanceDate && (
                                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Calendar className="w-4 h-4 text-blue-500" />
                                        <p className="font-semibold text-gray-900 dark:text-white">
                                            {dateFormatter.format(new Date(trailer.nextMaintenanceDate))}
                                        </p>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">กำหนดบำรุงรักษาครั้งถัดไป</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
