import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { X, Truck, User, MapPin, Droplet, Camera, AlertCircle } from "lucide-react";
import type { TruckOrder } from "@/pages/gas-station/TruckProfiles";
import { validateStartOdometer, getCurrentDateTime } from "@/utils/odometerValidation";

interface StartTripModalProps {
    isOpen: boolean;
    onClose: () => void;
    order: TruckOrder;
    lastOdometerReading?: number;
    lastOdometerDate?: string;
    onStartTrip: (startOdometer: number, startTime: string, photo?: string) => void;
}

const numberFormatter = new Intl.NumberFormat("th-TH", {
    maximumFractionDigits: 0,
});

export default function StartTripModal({
    isOpen,
    onClose,
    order,
    lastOdometerReading,
    lastOdometerDate,
    onStartTrip,
}: StartTripModalProps) {
    const [startOdometer, setStartOdometer] = useState("");
    const [startTime, setStartTime] = useState("");
    const [photo, setPhoto] = useState<string>("");
    const [error, setError] = useState<string>("");

    // Initialize start time when modal opens
    useEffect(() => {
        if (isOpen) {
            const now = getCurrentDateTime();
            setStartTime(now);
            setStartOdometer("");
            setPhoto("");
            setError("");
        }
    }, [isOpen]);

    const handleSubmit = () => {
        const odometerValue = parseFloat(startOdometer);

        if (!startOdometer || isNaN(odometerValue)) {
            setError("กรุณากรอกเลขไมล์เริ่มต้น");
            return;
        }

        // Validate odometer
        const validation = validateStartOdometer(odometerValue, lastOdometerReading);
        if (!validation.valid) {
            setError(validation.error || "เลขไมล์ไม่ถูกต้อง");
            return;
        }

        // Call parent handler
        onStartTrip(odometerValue, startTime, photo);
        onClose();
    };

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // In real app, upload to server and get URL
            // For now, just create a local URL
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
                                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                    <Truck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">เริ่มเดินทาง</h2>
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
                                <div className="flex items-center gap-2 text-sm">
                                    <Truck className="w-4 h-4 text-gray-500" />
                                    <span className="text-gray-600 dark:text-gray-400">รถ:</span>
                                    <span className="font-semibold text-gray-900 dark:text-white">
                                        {order.truckPlateNumber} / {order.trailerPlateNumber}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <User className="w-4 h-4 text-gray-500" />
                                    <span className="text-gray-600 dark:text-gray-400">คนขับ:</span>
                                    <span className="font-semibold text-gray-900 dark:text-white">{order.driver}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <MapPin className="w-4 h-4 text-gray-500" />
                                    <span className="text-gray-600 dark:text-gray-400">เส้นทาง:</span>
                                    <span className="font-semibold text-gray-900 dark:text-white">
                                        {order.fromBranch} → {order.toBranch}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <Droplet className="w-4 h-4 text-gray-500" />
                                    <span className="text-gray-600 dark:text-gray-400">น้ำมัน:</span>
                                    <span className="font-semibold text-gray-900 dark:text-white">
                                        {order.oilType} ({numberFormatter.format(order.quantity)} ลิตร)
                                    </span>
                                </div>
                            </div>

                            {/* Last Odometer Reading */}
                            {lastOdometerReading && (
                                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                    <label className="block text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                                        📊 เลขไมล์ล่าสุด (อ่านอย่างเดียว)
                                    </label>
                                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                        {numberFormatter.format(lastOdometerReading)} กม.
                                    </div>
                                    {lastOdometerDate && (
                                        <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                                            บันทึกเมื่อ: {new Date(lastOdometerDate).toLocaleDateString("th-TH")}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Start Odometer Input */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    📝 เลขไมล์เริ่มต้น <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    value={startOdometer}
                                    onChange={(e) => {
                                        setStartOdometer(e.target.value);
                                        setError("");
                                    }}
                                    placeholder="กรอกเลขไมล์ปัจจุบัน"
                                    className="w-full px-4 py-3 text-lg border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    autoFocus
                                />
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    ดูจากหน้าปัดรถและกรอกเลขไมล์ที่แสดง
                                </p>
                            </div>

                            {/* Start Time */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    🕐 เวลาเริ่มเดินทาง
                                </label>
                                <input
                                    type="datetime-local"
                                    value={startTime.slice(0, 16)}
                                    onChange={(e) => setStartTime(new Date(e.target.value).toISOString())}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    ระบบกรอกเวลาปัจจุบันให้อัตโนมัติ (สามารถแก้ไขได้)
                                </p>
                            </div>

                            {/* Photo Upload (Optional) */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    📷 ถ่ายรูปไมล์ (ถ้ามี)
                                </label>
                                <div className="flex items-center gap-3">
                                    <label className="flex-1 cursor-pointer">
                                        <div className="flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors">
                                            <Camera className="w-5 h-5 text-gray-400" />
                                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                                {photo ? "เปลี่ยนรูป" : "อัพโหลดรูป"}
                                            </span>
                                        </div>
                                        <input
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
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                            >
                                ยืนยันออกรถ
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
