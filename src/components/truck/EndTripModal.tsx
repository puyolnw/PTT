import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useMemo } from "react";
import { X, CheckCircle, Camera, AlertCircle, MapPin, Clock } from "lucide-react";
import type { TruckOrder } from "@/types/truck";
import {
    validateEndOdometer,
    calculateTripMetrics,
    formatDuration,
    getCurrentDateTime,
    formatTime,
} from "@/utils/odometerValidation";

interface EndTripModalProps {
    isOpen: boolean;
    onClose: () => void;
    order: TruckOrder;
    onEndTrip: (endOdometer: number, endTime: string, photo?: string) => void;
}

const numberFormatter = new Intl.NumberFormat("th-TH", {
    maximumFractionDigits: 0,
});

export default function EndTripModal({ isOpen, onClose, order, onEndTrip }: EndTripModalProps) {
    const [endOdometer, setEndOdometer] = useState("");
    const [endTime, setEndTime] = useState("");
    const [photo, setPhoto] = useState<string>("");
    const [error, setError] = useState<string>("");

    // Initialize end time when modal opens
    useEffect(() => {
        if (isOpen) {
            const now = getCurrentDateTime();
            setEndTime(now);
            setEndOdometer("");
            setPhoto("");
            setError("");
        }
    }, [isOpen]);

    // Calculate trip metrics in real-time
    const tripMetrics = useMemo(() => {
        const odometerValue = parseFloat(endOdometer);
        if (!endOdometer || isNaN(odometerValue) || !order.startOdometer || !order.startTime) {
            return null;
        }

        return calculateTripMetrics(order.startOdometer, odometerValue, order.startTime, endTime);
    }, [endOdometer, endTime, order.startOdometer, order.startTime]);

    const handleSubmit = () => {
        const odometerValue = parseFloat(endOdometer);

        if (!endOdometer || isNaN(odometerValue)) {
            setError("กรุณากรอกเลขไมล์สิ้นสุด");
            return;
        }

        if (!order.startOdometer) {
            setError("ไม่พบข้อมูลเลขไมล์เริ่มต้น");
            return;
        }

        // Validate odometer
        const validation = validateEndOdometer(odometerValue, order.startOdometer);
        if (!validation.valid) {
            setError(validation.error || "เลขไมล์ไม่ถูกต้อง");
            return;
        }

        // Call parent handler
        onEndTrip(odometerValue, endTime, photo);
        onClose();
    };

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhoto(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                                    <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">สรุปงาน</h2>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{order.orderNo}</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-4">
                            {/* Order Info */}
                            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">รถ / หาง:</span>
                                    <span className="font-semibold text-gray-900 dark:text-white">
                                        {order.truckPlateNumber} / {order.trailerPlateNumber}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">คนขับ:</span>
                                    <span className="font-semibold text-gray-900 dark:text-white">{order.driver}</span>
                                </div>
                            </div>

                            {/* Start Odometer (Read-only) */}
                            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                <div className="block text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                                    📊 เลขไมล์เริ่มต้น (อ่านอย่างเดียว)
                                </div>
                                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                    {order.startOdometer ? numberFormatter.format(order.startOdometer) : "-"} กม.
                                </div>
                                {order.startTime && (
                                    <p className="text-xs text-blue-700 dark:text-blue-300 mt-1 flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        เวลาออก: {formatTime(order.startTime)}
                                    </p>
                                )}
                            </div>

                            {/* End Odometer Input */}
                            <div>
                                <label htmlFor="end-odometer" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    📝 เลขไมล์สิ้นสุด <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="end-odometer"
                                    type="number"
                                    value={endOdometer}
                                    onChange={(e) => {
                                        setEndOdometer(e.target.value);
                                        setError("");
                                    }}
                                    placeholder="กรอกเลขไมล์ปัจจุบัน"
                                    className="w-full px-4 py-3 text-lg border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                />
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    ดูจากหน้าปัดรถและกรอกเลขไมล์ที่แสดง
                                </p>
                            </div>

                            {/* Real-time Trip Summary */}
                            {tripMetrics && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800"
                                >
                                    <h3 className="font-semibold text-emerald-900 dark:text-emerald-100 mb-3 flex items-center gap-2">
                                        <CheckCircle className="w-5 h-5" />
                                        สรุปการเดินทาง
                                    </h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <p className="text-xs text-emerald-700 dark:text-emerald-300 mb-1 flex items-center gap-1">
                                                <MapPin className="w-3 h-3" />
                                                ระยะทางรวม
                                            </p>
                                            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                                                {numberFormatter.format(tripMetrics.totalDistance)} กม.
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-emerald-700 dark:text-emerald-300 mb-1 flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                ระยะเวลา
                                            </p>
                                            <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                                                {formatDuration(tripMetrics.tripDuration)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="mt-3 pt-3 border-t border-emerald-200 dark:border-emerald-800">
                                        <p className="text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            เวลาถึง: {formatTime(endTime)}
                                        </p>
                                    </div>
                                </motion.div>
                            )}

                            {/* End Time */}
                            <div>
                                <label htmlFor="end-time" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    🕐 เวลาถึงปลายทาง
                                </label>
                                <input
                                    id="end-time"
                                    type="datetime-local"
                                    value={endTime.slice(0, 16)}
                                    onChange={(e) => setEndTime(new Date(e.target.value).toISOString())}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                />
                            </div>

                            {/* Photo Upload (Optional) */}
                            <div>
                                <label htmlFor="end-photo-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    📷 ถ่ายรูปไมล์ (ถ้ามี)
                                </label>
                                <div className="flex items-center gap-3">
                                    <label htmlFor="end-photo-input" className="flex-1 cursor-pointer">
                                        <div className="flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-emerald-500 dark:hover:border-emerald-400 transition-colors">
                                            <Camera className="w-5 h-5 text-gray-400" />
                                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                                {photo ? "เปลี่ยนรูป" : "อัพโหลดรูป"}
                                            </span>
                                        </div>
                                        <input
                                            id="end-photo-input"
                                            type="file"
                                            accept="image/*"
                                            onChange={handlePhotoUpload}
                                            className="hidden"
                                        />
                                    </label>
                                    {photo && (
                                        <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                                            <img src={photo} alt="Odometer" className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2">
                                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                                    <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            >
                                ยกเลิก
                            </button>
                            <button
                                onClick={handleSubmit}
                                className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-semibold"
                            >
                                ยืนยันจบงาน
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
