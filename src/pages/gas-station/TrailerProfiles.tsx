import { motion } from "framer-motion";
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
    Droplet,
    Search,
    Calendar,
    Activity,
    CheckCircle,
    AlertCircle,
    Wrench,
    ChevronRight,
    Truck,
    AlertTriangle,
} from "lucide-react";
import { mockTrailers, mockTrucks } from "./TruckProfiles";
import type { Trailer } from "./TruckProfiles";

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

const hasDocumentIssues = (trailer: Trailer): boolean => {
    const documents = [
        trailer.compulsoryInsuranceExpiry,
        trailer.vehicleTaxExpiry,
        trailer.insuranceExpiry,
        trailer.hazmatLicenseExpiry,
    ];

    return documents.some(doc => isDocumentExpired(doc) || isDocumentExpiringSoon(doc));
};

export default function TrailerProfiles() {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState<"all" | "available" | "in-use" | "maintenance">("all");

    // รวมข้อมูลหางกับรถที่ใช้อยู่
    const trailersWithTrucks = useMemo(() => {
        return mockTrailers.map((trailer) => {
            const currentTruck = mockTrucks.find((t) => t.currentTrailerId === trailer.id);
            const compatibleTrucks = mockTrucks.filter((t) =>
                t.compatibleTrailers.includes(trailer.id)
            );

            return {
                ...trailer,
                currentTruck,
                compatibleTrucks,
            };
        });
    }, []);

    // กรองข้อมูล
    const filteredTrailers = useMemo(() => {
        return trailersWithTrucks.filter((trailer) => {
            const matchesSearch =
                trailer.plateNumber.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = filterStatus === "all" || trailer.status === filterStatus;
            return matchesSearch && matchesStatus;
        });
    }, [trailersWithTrucks, searchTerm, filterStatus]);

    // สรุปข้อมูล
    const summary = useMemo(() => {
        const availableTrailers = mockTrailers.filter((t) => t.status === "available").length;
        const inUseTrailers = mockTrailers.filter((t) => t.status === "in-use").length;
        const totalCapacity = mockTrailers.reduce((sum, t) => sum + t.capacity, 0);
        const trailersWithIssues = mockTrailers.filter(t => hasDocumentIssues(t)).length;

        return {
            availableTrailers,
            inUseTrailers,
            totalCapacity,
            trailersWithIssues,
            total: mockTrailers.length,
        };
    }, []);

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

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "available":
                return <CheckCircle className="w-4 h-4" />;
            case "in-use":
                return <Activity className="w-4 h-4" />;
            case "maintenance":
                return <Wrench className="w-4 h-4" />;
            default:
                return <AlertCircle className="w-4 h-4" />;
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
                className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
            >
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                            <Droplet className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                        </div>
                        โปรไฟล์หางรถน้ำมัน
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                        จัดการข้อมูลหางบรรจุน้ำมัน รวมถึงประวัติการใช้งานและเอกสาร
                    </p>
                </div>
            </motion.div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">หางทั้งหมด</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                {summary.total}
                            </p>
                        </div>
                        <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                            <Droplet className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">พร้อมใช้งาน</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                {summary.availableTrailers}
                            </p>
                        </div>
                        <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                            <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">ความจุรวม</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                {numberFormatter.format(summary.totalCapacity)}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">ลิตร</p>
                        </div>
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <Activity className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">เอกสารใกล้หมดอายุ</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                {summary.trailersWithIssues}
                            </p>
                        </div>
                        <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                            <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Search and Filter */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 border border-gray-200 dark:border-gray-700"
            >
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="ค้นหาจากเลขทะเบียน..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                    </div>
                    <div className="flex gap-2">
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        >
                            <option value="all">สถานะทั้งหมด</option>
                            <option value="available">พร้อมใช้งาน</option>
                            <option value="in-use">ใช้งานอยู่</option>
                            <option value="maintenance">ซ่อมบำรุง</option>
                        </select>
                    </div>
                </div>
            </motion.div>

            {/* Trailers List */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredTrailers.map((trailer, index) => (
                    <motion.div
                        key={trailer.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * index }}
                        className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={() => navigate(`/app/gas-station/trailer-profiles/${trailer.id}`)}
                    >
                        <div className="p-6">
                            {/* Header */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                                        <Droplet className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                            {trailer.plateNumber}
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            ความจุ {numberFormatter.format(trailer.capacity)} ลิตร
                                        </p>
                                    </div>
                                </div>
                                <span
                                    className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                        trailer.status
                                    )}`}
                                >
                                    {getStatusIcon(trailer.status)}
                                    {getStatusText(trailer.status)}
                                </span>
                            </div>

                            {/* Current Truck */}
                            {trailer.currentTruck && (
                                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Truck className="w-4 h-4 text-blue-500" />
                                            <span className="text-sm text-gray-600 dark:text-gray-400">รถที่ใช้อยู่:</span>
                                            <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                                {trailer.currentTruck.plateNumber}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Document Alert */}
                            {hasDocumentIssues(trailer) && (
                                <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                                        <span className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                                            มีเอกสารใกล้หมดอายุหรือหมดอายุแล้ว
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Compatible Trucks */}
                            <div className="mb-4">
                                <p className="text-xs text-gray-500 dark:text-gray-500 mb-2">
                                    รถที่ใช้ได้ ({trailer.compatibleTrucks.length} คัน):
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {trailer.compatibleTrucks.slice(0, 3).map((truck) => (
                                        <span
                                            key={truck.id}
                                            className={`text-xs px-2 py-1 rounded ${truck.id === trailer.currentTruck?.id
                                                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                                : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                                                }`}
                                        >
                                            {truck.plateNumber}
                                        </span>
                                    ))}
                                    {trailer.compatibleTrucks.length > 3 && (
                                        <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                                            +{trailer.compatibleTrucks.length - 3}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Maintenance Info */}
                            {trailer.nextMaintenanceDate && (
                                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                        <Calendar className="w-4 h-4" />
                                        <span>บำรุงรักษาครั้งถัดไป: {dateFormatter.format(new Date(trailer.nextMaintenanceDate))}</span>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-gray-400" />
                                </div>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>

            {filteredTrailers.length === 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700"
                >
                    <Droplet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">ไม่พบข้อมูลหาง</p>
                </motion.div>
            )}
        </div>
    );
}
