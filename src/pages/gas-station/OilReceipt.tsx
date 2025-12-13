import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
    PackageCheck,
    Plus,
    Search,
    Filter,
    CheckCircle,
    Clock,
    XCircle,
    Eye,
    FileText,
    Truck,
    Calendar,
    AlertTriangle,
    Download,
    Droplet,
    Building2,
    User,
    X,
    ChevronRight,
} from "lucide-react";
import { mockOilReceipts, type OilReceipt } from "@/data/gasStationReceipts";
import { mockApprovedOrders } from "@/data/gasStationOrders";
import { mockTruckOrders } from "./TruckProfiles";

// Import mock transport deliveries for auto-filling
const mockTransportDeliveries = [
    {
        transportNo: "TR-20241215-001",
        orderNo: "SO-20241215-001",
        truckPlateNumber: "กก 1111",
        trailerPlateNumber: "กข 1234",
        driverName: "สมชาย ใจดี",
        startOdometer: 125000,
    },
    {
        transportNo: "TR-20241215-002",
        orderNo: "SO-20241215-002",
        truckPlateNumber: "กก 2222",
        trailerPlateNumber: "กข 5678",
        driverName: "วิชัย รักงาน",
        startOdometer: 98500,
    },
];

const currencyFormatter = new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat("th-TH", {
    maximumFractionDigits: 0,
});

export default function OilReceipt() {
    const [searchParams] = useSearchParams();
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("ทั้งหมด");
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedReceipt, setSelectedReceipt] = useState<OilReceipt | null>(null);

    // Create form state
    const [createStep, setCreateStep] = useState(1);
    const [formData, setFormData] = useState({
        purchaseOrderNo: "",
        transportNo: "",
        deliveryNoteNo: "",
        receiveDate: new Date().toISOString().split("T")[0],
        receiveTime: new Date().toTimeString().slice(0, 5),
        truckLicensePlate: "",
        trailerLicensePlate: "",
        driverName: "",
        mileageBefore: 0,
        mileageAfter: 0,
        qualityTest: {
            apiGravity: 0,
            waterContent: 0,
            temperature: 0,
            color: "",
        },
        measurements: [] as Array<{
            oilType: string;
            tankNumber: number;
            quantityOrdered: number;
            beforeDip: number;
            afterDip: number;
        }>,
    });

    // Auto-fill from URL parameter (orderId from TruckOrders)
    useEffect(() => {
        const orderId = searchParams.get('orderId');
        if (orderId) {
            const truckOrder = mockTruckOrders.find(order => order.id === orderId);
            if (truckOrder && truckOrder.purchaseOrderNo) {
                // Auto-fill form data from TruckOrder
                setFormData({
                    ...formData,
                    purchaseOrderNo: truckOrder.purchaseOrderNo,
                    transportNo: truckOrder.transportNo,
                    truckLicensePlate: truckOrder.truckPlateNumber,
                    trailerLicensePlate: truckOrder.trailerPlateNumber,
                    driverName: truckOrder.driver,
                    mileageBefore: truckOrder.startOdometer || 0,
                });
                // Auto-open create modal
                setShowCreateModal(true);
            }
        }
    }, [searchParams]);

    const selectedPO = mockApprovedOrders.find((po) => po.orderNo === formData.purchaseOrderNo);

    // Auto-fill transport data when PO is selected
    const handlePOChange = (orderNo: string) => {
        const transport = mockTransportDeliveries.find((t) => t.orderNo === orderNo);
        if (transport) {
            setFormData({
                ...formData,
                purchaseOrderNo: orderNo,
                transportNo: transport.transportNo,
                truckLicensePlate: transport.truckPlateNumber,
                trailerLicensePlate: transport.trailerPlateNumber,
                driverName: transport.driverName,
                mileageBefore: transport.startOdometer,
            });
        } else {
            setFormData({
                ...formData,
                purchaseOrderNo: orderNo,
            });
        }
    };

    const resetForm = () => {
        setCreateStep(1);
        setFormData({
            purchaseOrderNo: "",
            transportNo: "",
            deliveryNoteNo: "",
            receiveDate: new Date().toISOString().split("T")[0],
            receiveTime: new Date().toTimeString().slice(0, 5),
            truckLicensePlate: "",
            trailerLicensePlate: "",
            driverName: "",
            mileageBefore: 0,
            mileageAfter: 0,
            qualityTest: {
                apiGravity: 0,
                waterContent: 0,
                temperature: 0,
                color: "",
            },
            measurements: [],
        });
    };

    // Filter receipts
    const filteredReceipts = useMemo(() => {
        return mockOilReceipts.filter((receipt) => {
            const matchesSearch =
                receipt.receiptNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                receipt.purchaseOrderNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                receipt.deliveryNoteNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                receipt.truckLicensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
                receipt.driverName.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesStatus = filterStatus === "ทั้งหมด" || receipt.status === filterStatus;

            return matchesSearch && matchesStatus;
        });
    }, [searchTerm, filterStatus]);

    // Summary stats
    const stats = useMemo(() => {
        const today = new Date().toISOString().split("T")[0];
        const todayReceipts = mockOilReceipts.filter((r) => r.receiveDate === today);

        const totalQuantity = todayReceipts.reduce((sum, receipt) => {
            return sum + receipt.items.reduce((itemSum, item) => itemSum + item.quantityReceived, 0);
        }, 0);

        const toleranceExceeded = mockOilReceipts.filter((r) =>
            r.items.some((item) => Math.abs((item.differenceLiter / item.quantityOrdered) * 100) > 0.5)
        ).length;

        return {
            total: mockOilReceipts.length,
            todayCount: todayReceipts.length,
            todayQuantity: totalQuantity,
            draft: mockOilReceipts.filter((r) => r.status === "draft").length,
            completed: mockOilReceipts.filter((r) => r.status === "completed").length,
            toleranceExceeded,
        };
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case "draft":
                return "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30 border-orange-200 dark:border-orange-800";
            case "completed":
                return "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800";
            case "cancelled":
                return "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800";
            default:
                return "text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700";
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case "draft":
                return "ร่าง";
            case "completed":
                return "เสร็จสมบูรณ์";
            case "cancelled":
                return "ยกเลิก";
            default:
                return status;
        }
    };

    const handleViewDetail = (receipt: OilReceipt) => {
        setSelectedReceipt(receipt);
        setShowDetailModal(true);
    };

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-6"
            >
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">รับน้ำมันจาก ปตท</h1>
                <p className="text-gray-600 dark:text-gray-400">บันทึกการรับน้ำมันจากปตท. พร้อมทดสอบคุณภาพและวัดยอด</p>
            </motion.div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {[
                    {
                        title: "รับวันนี้",
                        value: stats.todayCount,
                        subtitle: "รายการ",
                        detail: `${numberFormatter.format(stats.todayQuantity)} ลิตร`,
                        icon: PackageCheck,
                        iconColor: "bg-gradient-to-br from-blue-500 to-blue-600",
                    },
                    {
                        title: "รอดำเนินการ",
                        value: stats.draft,
                        subtitle: "รายการ",
                        icon: Clock,
                        iconColor: "bg-gradient-to-br from-orange-500 to-orange-600",
                    },
                    {
                        title: "เสร็จสมบูรณ์",
                        value: stats.completed,
                        subtitle: "รายการ",
                        icon: CheckCircle,
                        iconColor: "bg-gradient-to-br from-emerald-500 to-emerald-600",
                    },
                    {
                        title: "ส่วนต่างเกินเกณฑ์",
                        value: stats.toleranceExceeded,
                        subtitle: "รายการ",
                        icon: AlertTriangle,
                        iconColor: "bg-gradient-to-br from-red-500 to-red-600",
                    },
                ].map((stat, index) => (
                    <motion.div
                        key={stat.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
                    >
                        <div className="p-4">
                            <div className="flex items-center">
                                <div className={`w-16 h-16 ${stat.iconColor} rounded-lg flex items-center justify-center shadow-lg mr-4`}>
                                    <stat.icon className="w-8 h-8 text-white" />
                                </div>
                                <div className="flex-1">
                                    <h6 className="text-gray-600 dark:text-gray-400 text-sm font-semibold mb-1">{stat.title}</h6>
                                    <h6 className="text-gray-800 dark:text-white text-2xl font-extrabold mb-0">{stat.value}</h6>
                                    <p className="text-gray-500 dark:text-gray-500 text-xs mt-1">
                                        {stat.detail || stat.subtitle}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Filters */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5 flex flex-col md:flex-row gap-4 mb-6"
            >
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="ค้นหาเลขที่ใบรับ, PO, ทะเบียนรถ, คนขับ..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 text-gray-800 dark:text-white transition-all duration-200"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-gray-400" />
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 text-gray-800 dark:text-white transition-all duration-200"
                    >
                        <option>ทั้งหมด</option>
                        <option value="draft">ร่าง</option>
                        <option value="completed">เสร็จสมบูรณ์</option>
                        <option value="cancelled">ยกเลิก</option>
                    </select>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl transition-all duration-200 font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    สร้างใบรับน้ำมันใหม่
                </button>
            </motion.div>

            {/* Receipt List */}
            <div className="space-y-4">
                {filteredReceipts.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-12 text-center"
                    >
                        <PackageCheck className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400 text-lg">ไม่พบรายการรับน้ำมัน</p>
                        <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
                            {searchTerm || filterStatus !== "ทั้งหมด"
                                ? "ลองเปลี่ยนเงื่อนไขการค้นหาหรือกรอง"
                                : "คลิก 'สร้างใบรับน้ำมันใหม่' เพื่อเริ่มต้น"}
                        </p>
                    </motion.div>
                ) : (
                    filteredReceipts.map((receipt, index) => {
                        const totalQuantity = receipt.items.reduce((sum, item) => sum + item.quantityReceived, 0);
                        const totalDifference = receipt.items.reduce((sum, item) => sum + item.differenceLiter, 0);
                        const hasToleranceIssue = receipt.items.some(
                            (item) => Math.abs((item.differenceLiter / item.quantityOrdered) * 100) > 0.5
                        );

                        return (
                            <motion.div
                                key={receipt.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.05 }}
                                className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                            >
                                <div className="p-5">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4 flex-1">
                                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                                                <PackageCheck className="w-6 h-6 text-white" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-1">
                                                    <h3 className="text-lg font-bold text-gray-800 dark:text-white">{receipt.receiptNo}</h3>
                                                    <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${getStatusColor(receipt.status)}`}>
                                                        {getStatusText(receipt.status)}
                                                    </span>
                                                    {hasToleranceIssue && (
                                                        <span className="text-xs font-semibold px-2 py-1 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 flex items-center gap-1">
                                                            <AlertTriangle className="w-3 h-3" />
                                                            ส่วนต่างเกิน
                                                        </span>
                                                    )}
                                                    {receipt.qualityTest.testResult === "ไม่ผ่าน" && (
                                                        <span className="text-xs font-semibold px-2 py-1 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 flex items-center gap-1">
                                                            <XCircle className="w-3 h-3" />
                                                            ไม่ผ่านการทดสอบ
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-2">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="w-4 h-4" />
                                                        {receipt.receiveDate} {receipt.receiveTime}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <FileText className="w-4 h-4" />
                                                        PO: {receipt.purchaseOrderNo}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Truck className="w-4 h-4" />
                                                        {receipt.truckLicensePlate}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <User className="w-4 h-4" />
                                                        {receipt.driverName}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500">
                                                    <span className="flex items-center gap-1">
                                                        <Droplet className="w-3 h-3" />
                                                        รับ: {numberFormatter.format(totalQuantity)} ลิตร
                                                    </span>
                                                    {totalDifference !== 0 && (
                                                        <span className={`flex items-center gap-1 ${totalDifference > 0 ? "text-green-600" : "text-red-600"}`}>
                                                            ส่วนต่าง: {totalDifference > 0 ? "+" : ""}
                                                            {numberFormatter.format(totalDifference)} ลิตร
                                                        </span>
                                                    )}
                                                    <span className="flex items-center gap-1">
                                                        <Building2 className="w-3 h-3" />
                                                        {receipt.items.length} รายการ
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => handleViewDetail(receipt)}
                                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-2 text-blue-600 dark:text-blue-400"
                                                title="ดูรายละเอียด"
                                            >
                                                <Eye className="w-4 h-4" />
                                                <span className="text-sm font-medium">ดูรายละเอียด</span>
                                                <ChevronRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })
                )}
            </div>

            {/* Create Receipt Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => {
                                setShowCreateModal(false);
                                resetForm();
                            }}
                            className="fixed inset-0 bg-black/50 z-50"
                        />
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                onClick={(e) => e.stopPropagation()}
                                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
                            >
                                {/* Header */}
                                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                                            <Plus className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-1">
                                                สร้างใบรับน้ำมันใหม่
                                            </h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                ขั้นตอนที่ {createStep} จาก 6
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setShowCreateModal(false);
                                            resetForm();
                                        }}
                                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all duration-200 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:scale-110 active:scale-95"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Progress Bar */}
                                <div className="px-6 pt-4">
                                    <div className="flex items-center justify-between mb-2">
                                        {[1, 2, 3, 4, 5, 6].map((step) => (
                                            <div
                                                key={step}
                                                className={`flex-1 h-2 rounded-full mx-1 transition-all ${step <= createStep
                                                    ? "bg-blue-500"
                                                    : "bg-gray-200 dark:bg-gray-700"
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* Form Content */}
                                <div className="flex-1 overflow-y-auto px-6 py-6">
                                    {/* Step 1: Select Purchase Order */}
                                    {createStep === 1 && (
                                        <div className="space-y-4">
                                            <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                                                เลือกใบสั่งซื้อ (Purchase Order)
                                            </h4>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    เลขที่ใบสั่งซื้อ <span className="text-red-500">*</span>
                                                </label>
                                                <select
                                                    value={formData.purchaseOrderNo}
                                                    onChange={(e) => handlePOChange(e.target.value)}
                                                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-gray-800 dark:text-white"
                                                >
                                                    <option value="">-- เลือกใบสั่งซื้อ --</option>
                                                    {mockApprovedOrders.map((po) => (
                                                        <option key={po.orderNo} value={po.orderNo}>
                                                            {po.orderNo} - {po.supplierOrderNo} (
                                                            {po.branches.length} ปั๊ม)
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            {selectedPO && (
                                                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-4">
                                                    <h5 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-3">
                                                        รายละเอียดใบสั่งซื้อ
                                                    </h5>
                                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                                        <div>
                                                            <p className="text-gray-600 dark:text-gray-400">
                                                                วันที่สั่ง
                                                            </p>
                                                            <p className="font-semibold text-gray-900 dark:text-white">
                                                                {selectedPO.orderDate}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p className="text-gray-600 dark:text-gray-400">
                                                                จำนวนปั๊ม
                                                            </p>
                                                            <p className="font-semibold text-gray-900 dark:text-white">
                                                                {selectedPO.branches.length} ปั๊ม
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Step 2: Delivery Information */}
                                    {createStep === 2 && (
                                        <div className="space-y-4">
                                            <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                                                ข้อมูลการจัดส่ง
                                            </h4>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        วันที่รับ <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="date"
                                                        value={formData.receiveDate}
                                                        onChange={(e) =>
                                                            setFormData({ ...formData, receiveDate: e.target.value })
                                                        }
                                                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-gray-800 dark:text-white"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        เวลา <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="time"
                                                        value={formData.receiveTime}
                                                        onChange={(e) =>
                                                            setFormData({ ...formData, receiveTime: e.target.value })
                                                        }
                                                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-gray-800 dark:text-white"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    เลขที่ใบส่งของ (จาก ปตท.) <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.deliveryNoteNo}
                                                    onChange={(e) =>
                                                        setFormData({ ...formData, deliveryNoteNo: e.target.value })
                                                    }
                                                    placeholder="PTT-DN-20241214-001"
                                                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-gray-800 dark:text-white"
                                                />
                                            </div>

                                            {/* Auto-filled fields from Transport Delivery */}
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        ทะเบียนหัว
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={formData.truckLicensePlate}
                                                        readOnly
                                                        className="w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-800 dark:text-white cursor-not-allowed"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        ทะเบียนหาง
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={formData.trailerLicensePlate}
                                                        readOnly
                                                        className="w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-800 dark:text-white cursor-not-allowed"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    ชื่อคนขับ
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.driverName}
                                                    readOnly
                                                    className="w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-800 dark:text-white cursor-not-allowed"
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        เลขไมล์ก่อน (กม.)
                                                    </label>
                                                    <input
                                                        type="number"
                                                        value={formData.mileageBefore || ""}
                                                        readOnly
                                                        className="w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-800 dark:text-white cursor-not-allowed"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        เลขไมล์หลัง (กม.) <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="number"
                                                        value={formData.mileageAfter || ""}
                                                        onChange={(e) =>
                                                            setFormData({ ...formData, mileageAfter: parseFloat(e.target.value) || 0 })
                                                        }
                                                        placeholder="125350"
                                                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-gray-800 dark:text-white"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Step 3: Quality Test */}
                                    {createStep === 3 && (
                                        <div className="space-y-4">
                                            <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                                                ทดสอบคุณภาพน้ำมัน (บังคับ)
                                            </h4>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        API Gravity <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="number"
                                                        step="0.1"
                                                        value={formData.qualityTest.apiGravity || ""}
                                                        onChange={(e) =>
                                                            setFormData({
                                                                ...formData,
                                                                qualityTest: {
                                                                    ...formData.qualityTest,
                                                                    apiGravity: parseFloat(e.target.value) || 0,
                                                                },
                                                            })
                                                        }
                                                        placeholder="30-45"
                                                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-gray-800 dark:text-white"
                                                    />
                                                    <p className="text-xs text-gray-500 mt-1">ช่วงมาตรฐาน: 30-45</p>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        ปริมาณน้ำ (%) <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        value={formData.qualityTest.waterContent || ""}
                                                        onChange={(e) =>
                                                            setFormData({
                                                                ...formData,
                                                                qualityTest: {
                                                                    ...formData.qualityTest,
                                                                    waterContent: parseFloat(e.target.value) || 0,
                                                                },
                                                            })
                                                        }
                                                        placeholder="< 0.05"
                                                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-gray-800 dark:text-white"
                                                    />
                                                    <p className="text-xs text-gray-500 mt-1">ต้องไม่เกิน 0.05%</p>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        อุณหภูมิ (°C) <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="number"
                                                        value={formData.qualityTest.temperature || ""}
                                                        onChange={(e) =>
                                                            setFormData({
                                                                ...formData,
                                                                qualityTest: {
                                                                    ...formData.qualityTest,
                                                                    temperature: parseFloat(e.target.value) || 0,
                                                                },
                                                            })
                                                        }
                                                        placeholder="15-35"
                                                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-gray-800 dark:text-white"
                                                    />
                                                    <p className="text-xs text-gray-500 mt-1">ช่วงมาตรฐาน: 15-35°C</p>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        สี <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={formData.qualityTest.color}
                                                        onChange={(e) =>
                                                            setFormData({
                                                                ...formData,
                                                                qualityTest: {
                                                                    ...formData.qualityTest,
                                                                    color: e.target.value,
                                                                },
                                                            })
                                                        }
                                                        placeholder="ใส, เหลืองอ่อน"
                                                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-gray-800 dark:text-white"
                                                    />
                                                </div>
                                            </div>

                                            {/* Quality Test Result */}
                                            {formData.qualityTest.apiGravity > 0 && (
                                                <div
                                                    className={`p-4 rounded-lg border ${formData.qualityTest.apiGravity >= 30 &&
                                                        formData.qualityTest.apiGravity <= 45 &&
                                                        formData.qualityTest.waterContent <= 0.05 &&
                                                        formData.qualityTest.temperature >= 15 &&
                                                        formData.qualityTest.temperature <= 35
                                                        ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                                                        : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                                                        }`}
                                                >
                                                    <p
                                                        className={`text-sm font-semibold ${formData.qualityTest.apiGravity >= 30 &&
                                                            formData.qualityTest.apiGravity <= 45 &&
                                                            formData.qualityTest.waterContent <= 0.05 &&
                                                            formData.qualityTest.temperature >= 15 &&
                                                            formData.qualityTest.temperature <= 35
                                                            ? "text-green-700 dark:text-green-400"
                                                            : "text-red-700 dark:text-red-400"
                                                            }`}
                                                    >
                                                        {formData.qualityTest.apiGravity >= 30 &&
                                                            formData.qualityTest.apiGravity <= 45 &&
                                                            formData.qualityTest.waterContent <= 0.05 &&
                                                            formData.qualityTest.temperature >= 15 &&
                                                            formData.qualityTest.temperature <= 35
                                                            ? "✓ ผ่านการทดสอบคุณภาพ"
                                                            : "✗ ไม่ผ่านการทดสอบคุณภาพ - ไม่สามารถดำเนินการต่อได้"}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Step 4: Measurements */}
                                    {createStep === 4 && (
                                        <div className="space-y-4">
                                            <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                                                วัดยอดน้ำมัน
                                            </h4>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                                กรอกยอดก่อนและหลังรับน้ำมันสำหรับแต่ละรายการ
                                            </p>

                                            {selectedPO && selectedPO.items.length > 0 ? (
                                                <div className="space-y-3">
                                                    {selectedPO.items.map((item, index) => (
                                                        <div
                                                            key={index}
                                                            className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                                                        >
                                                            <div className="flex items-center justify-between mb-3">
                                                                <div>
                                                                    <h5 className="font-semibold text-gray-900 dark:text-white">
                                                                        {item.oilType}
                                                                    </h5>
                                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                                        จำนวนสั่ง: {numberFormatter.format(item.quantity)} ลิตร
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-3">
                                                                <div>
                                                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                                        ยอดก่อนรับ (ลิตร)
                                                                    </label>
                                                                    <input
                                                                        type="number"
                                                                        value={item.quantity}
                                                                        readOnly
                                                                        className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-800 dark:text-white cursor-not-allowed"
                                                                    />
                                                                    <p className="text-xs text-gray-500 mt-1">
                                                                        จำนวนที่สั่งจาก PO
                                                                    </p>
                                                                </div>
                                                                <div>
                                                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                                        ยอดหลังรับ (ลิตร) <span className="text-red-500">*</span>
                                                                    </label>
                                                                    <input
                                                                        type="number"
                                                                        placeholder="0"
                                                                        className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                                                    <p className="text-center text-gray-500 dark:text-gray-400">
                                                        กรุณาเลือก PO ในขั้นตอนที่ 1 ก่อน
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Step 5: Attachments */}
                                    {createStep === 5 && (
                                        <div className="space-y-4">
                                            <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                                                แนบเอกสาร
                                            </h4>
                                            <div className="space-y-3">
                                                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                                                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                                        ลากไฟล์มาวางที่นี่ หรือคลิกเพื่อเลือกไฟล์
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        รองรับ: PDF, JPG, PNG (สูงสุด 10MB)
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Step 6: Review */}
                                    {createStep === 6 && (
                                        <div className="space-y-4">
                                            <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                                                ตรวจสอบข้อมูล
                                            </h4>
                                            <div className="space-y-3">
                                                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                                                    <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                        ใบสั่งซื้อ
                                                    </h5>
                                                    <p className="text-sm text-gray-900 dark:text-white">
                                                        {formData.purchaseOrderNo || "-"}
                                                    </p>
                                                </div>
                                                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                                                    <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                        ข้อมูลการจัดส่ง
                                                    </h5>
                                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                                        <div>
                                                            <span className="text-gray-600 dark:text-gray-400">
                                                                วันที่:
                                                            </span>{" "}
                                                            <span className="text-gray-900 dark:text-white">
                                                                {formData.receiveDate}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-600 dark:text-gray-400">
                                                                เวลา:
                                                            </span>{" "}
                                                            <span className="text-gray-900 dark:text-white">
                                                                {formData.receiveTime}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-600 dark:text-gray-400">
                                                                ทะเบียนรถ:
                                                            </span>{" "}
                                                            <span className="text-gray-900 dark:text-white">
                                                                {formData.truckLicensePlate}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-600 dark:text-gray-400">
                                                                คนขับ:
                                                            </span>{" "}
                                                            <span className="text-gray-900 dark:text-white">
                                                                {formData.driverName}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-600 dark:text-gray-400">
                                                                เลขไมล์:
                                                            </span>{" "}
                                                            <span className="text-gray-900 dark:text-white">
                                                                {formData.mileageBefore} กม. → {formData.mileageAfter} กม.
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                                                    <h5 className="text-sm font-semibold text-green-700 dark:text-green-400 mb-2">
                                                        ✓ ผ่านการทดสอบคุณภาพ
                                                    </h5>
                                                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-400">
                                                        <div>API: {formData.qualityTest.apiGravity}</div>
                                                        <div>น้ำ: {formData.qualityTest.waterContent}%</div>
                                                        <div>อุณหภูมิ: {formData.qualityTest.temperature}°C</div>
                                                        <div>สี: {formData.qualityTest.color}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Footer Buttons */}
                                <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                                    <button
                                        onClick={() => setCreateStep(Math.max(1, createStep - 1))}
                                        disabled={createStep === 1}
                                        className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        ย้อนกลับ
                                    </button>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => {
                                                setShowCreateModal(false);
                                                resetForm();
                                            }}
                                            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                        >
                                            ยกเลิก
                                        </button>
                                        {createStep < 6 ? (
                                            <button
                                                onClick={() => {
                                                    // Validation for each step
                                                    if (createStep === 1 && !formData.purchaseOrderNo) {
                                                        alert("กรุณาเลือกใบสั่งซื้อ");
                                                        return;
                                                    }
                                                    if (
                                                        createStep === 2 &&
                                                        (!formData.deliveryNoteNo ||
                                                            formData.mileageAfter === 0)
                                                    ) {
                                                        alert("กรุณากรอกเลขที่ใบส่งของและเลขไมล์หลัง");
                                                        return;
                                                    }
                                                    setCreateStep(createStep + 1);
                                                }}
                                                className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-medium"
                                            >
                                                ถัดไป
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => {
                                                    alert("บันทึกใบรับน้ำมันสำเร็จ!");
                                                    setShowCreateModal(false);
                                                    resetForm();
                                                }}
                                                className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors font-medium"
                                            >
                                                บันทึก
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </>
                )}
            </AnimatePresence>

            {/* Detail Modal - Placeholder */}
            <AnimatePresence>
                {showDetailModal && selectedReceipt && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowDetailModal(false)}
                            className="fixed inset-0 bg-black/50 z-50"
                        />
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
                            >
                                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                                            <Eye className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-1">รายละเอียดใบรับน้ำมัน</h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">{selectedReceipt.receiptNo}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setShowDetailModal(false)}
                                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all duration-200 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:scale-110 active:scale-95"
                                        aria-label="ปิด"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="flex-1 overflow-y-auto px-6 py-6">
                                    <div className="space-y-6">
                                        {/* Status and Basic Info */}
                                        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4">
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                <div>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">สถานะ</p>
                                                    <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${getStatusColor(selectedReceipt.status)}`}>
                                                        {getStatusText(selectedReceipt.status)}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">วันที่รับ</p>
                                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                                        {selectedReceipt.receiveDate}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">เวลา</p>
                                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                                        {selectedReceipt.receiveTime}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">ผู้รับ</p>
                                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                                        {selectedReceipt.receivedByName}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Delivery Information */}
                                        <div>
                                            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                                                <Truck className="w-4 h-4" />
                                                ข้อมูลการจัดส่ง
                                            </h4>
                                            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">เลขที่ใบสั่งซื้อ (PO)</p>
                                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                                            {selectedReceipt.purchaseOrderNo}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">เลขที่ใบส่งของ</p>
                                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                                            {selectedReceipt.deliveryNoteNo}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">ทะเบียนรถ</p>
                                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                                            {selectedReceipt.truckLicensePlate}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">คนขับ</p>
                                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                                            {selectedReceipt.driverName}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Quality Test Results */}
                                        <div>
                                            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                                                <CheckCircle className="w-4 h-4" />
                                                ผลการทดสอบคุณภาพ
                                            </h4>
                                            <div className={`border rounded-lg p-4 ${selectedReceipt.qualityTest.testResult === "ผ่าน"
                                                ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                                                : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                                                }`}>
                                                <div className="flex items-center justify-between mb-3">
                                                    <span className={`text-sm font-semibold ${selectedReceipt.qualityTest.testResult === "ผ่าน"
                                                        ? "text-green-700 dark:text-green-400"
                                                        : "text-red-700 dark:text-red-400"
                                                        }`}>
                                                        {selectedReceipt.qualityTest.testResult === "ผ่าน" ? "✓ ผ่านการทดสอบ" : "✗ ไม่ผ่านการทดสอบ"}
                                                    </span>
                                                    <span className="text-xs text-gray-600 dark:text-gray-400">
                                                        ทดสอบโดย: {selectedReceipt.qualityTest.testedBy} | {selectedReceipt.qualityTest.testDateTime}
                                                    </span>
                                                </div>
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                    <div>
                                                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">API Gravity</p>
                                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                                            {selectedReceipt.qualityTest.apiGravity}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">ปริมาณน้ำ (%)</p>
                                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                                            {selectedReceipt.qualityTest.waterContent}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">อุณหภูมิ (°C)</p>
                                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                                            {selectedReceipt.qualityTest.temperature}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">สี</p>
                                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                                            {selectedReceipt.qualityTest.color}
                                                        </p>
                                                    </div>
                                                </div>
                                                {selectedReceipt.qualityTest.notes && (
                                                    <div className="mt-3 pt-3 border-t border-gray-300 dark:border-gray-600">
                                                        <p className="text-xs text-gray-600 dark:text-gray-400">หมายเหตุ: {selectedReceipt.qualityTest.notes}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Measurements Table */}
                                        <div>
                                            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                                                <Droplet className="w-4 h-4" />
                                                รายการวัดยอด
                                            </h4>
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-sm">
                                                    <thead>
                                                        <tr className="bg-gray-100 dark:bg-gray-700">
                                                            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">ชนิดน้ำมัน</th>
                                                            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">ถัง</th>
                                                            <th className="px-4 py-2 text-right text-xs font-semibold text-gray-700 dark:text-gray-300">สั่ง (ลิตร)</th>
                                                            <th className="px-4 py-2 text-right text-xs font-semibold text-gray-700 dark:text-gray-300">ก่อนรับ</th>
                                                            <th className="px-4 py-2 text-right text-xs font-semibold text-gray-700 dark:text-gray-300">หลังรับ</th>
                                                            <th className="px-4 py-2 text-right text-xs font-semibold text-gray-700 dark:text-gray-300">รับจริง</th>
                                                            <th className="px-4 py-2 text-right text-xs font-semibold text-gray-700 dark:text-gray-300">ส่วนต่าง</th>
                                                            <th className="px-4 py-2 text-right text-xs font-semibold text-gray-700 dark:text-gray-300">มูลค่า</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                                        {selectedReceipt.items.map((item, idx) => {
                                                            const isToleranceExceeded = Math.abs((item.differenceLiter / item.quantityOrdered) * 100) > 0.5;
                                                            return (
                                                                <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                                                    <td className="px-4 py-3 text-gray-900 dark:text-white font-medium">{item.oilType}</td>
                                                                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">#{item.tankNumber}</td>
                                                                    <td className="px-4 py-3 text-right text-gray-900 dark:text-white">
                                                                        {numberFormatter.format(item.quantityOrdered)}
                                                                    </td>
                                                                    <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-400">
                                                                        {numberFormatter.format(item.beforeDip)}
                                                                    </td>
                                                                    <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-400">
                                                                        {numberFormatter.format(item.afterDip)}
                                                                    </td>
                                                                    <td className="px-4 py-3 text-right text-gray-900 dark:text-white font-semibold">
                                                                        {numberFormatter.format(item.quantityReceived)}
                                                                    </td>
                                                                    <td className={`px-4 py-3 text-right font-semibold ${item.differenceLiter > 0
                                                                        ? "text-green-600 dark:text-green-400"
                                                                        : item.differenceLiter < 0
                                                                            ? "text-red-600 dark:text-red-400"
                                                                            : "text-gray-600 dark:text-gray-400"
                                                                        }`}>
                                                                        {item.differenceLiter > 0 ? "+" : ""}
                                                                        {numberFormatter.format(item.differenceLiter)}
                                                                        {isToleranceExceeded && (
                                                                            <AlertTriangle className="w-3 h-3 inline ml-1 text-red-500" />
                                                                        )}
                                                                    </td>
                                                                    <td className={`px-4 py-3 text-right font-semibold ${item.differenceAmount > 0
                                                                        ? "text-green-600 dark:text-green-400"
                                                                        : item.differenceAmount < 0
                                                                            ? "text-red-600 dark:text-red-400"
                                                                            : "text-gray-600 dark:text-gray-400"
                                                                        }`}>
                                                                        {currencyFormatter.format(item.differenceAmount)}
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                    <tfoot className="bg-gray-100 dark:bg-gray-700">
                                                        <tr>
                                                            <td colSpan={5} className="px-4 py-3 text-right font-semibold text-gray-700 dark:text-gray-300">
                                                                รวม:
                                                            </td>
                                                            <td className="px-4 py-3 text-right font-bold text-gray-900 dark:text-white">
                                                                {numberFormatter.format(
                                                                    selectedReceipt.items.reduce((sum, item) => sum + item.quantityReceived, 0)
                                                                )}
                                                            </td>
                                                            <td className={`px-4 py-3 text-right font-bold ${selectedReceipt.items.reduce((sum, item) => sum + item.differenceLiter, 0) > 0
                                                                ? "text-green-600 dark:text-green-400"
                                                                : selectedReceipt.items.reduce((sum, item) => sum + item.differenceLiter, 0) < 0
                                                                    ? "text-red-600 dark:text-red-400"
                                                                    : "text-gray-900 dark:text-white"
                                                                }`}>
                                                                {selectedReceipt.items.reduce((sum, item) => sum + item.differenceLiter, 0) > 0 ? "+" : ""}
                                                                {numberFormatter.format(
                                                                    selectedReceipt.items.reduce((sum, item) => sum + item.differenceLiter, 0)
                                                                )}
                                                            </td>
                                                            <td className={`px-4 py-3 text-right font-bold ${selectedReceipt.items.reduce((sum, item) => sum + item.differenceAmount, 0) > 0
                                                                ? "text-green-600 dark:text-green-400"
                                                                : selectedReceipt.items.reduce((sum, item) => sum + item.differenceAmount, 0) < 0
                                                                    ? "text-red-600 dark:text-red-400"
                                                                    : "text-gray-900 dark:text-white"
                                                                }`}>
                                                                {currencyFormatter.format(
                                                                    selectedReceipt.items.reduce((sum, item) => sum + item.differenceAmount, 0)
                                                                )}
                                                            </td>
                                                        </tr>
                                                    </tfoot>
                                                </table>
                                            </div>
                                        </div>

                                        {/* Gain/Loss Reasons */}
                                        {selectedReceipt.items.some(item => item.gainLossReason) && (
                                            <div>
                                                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                                    เหตุผลส่วนต่าง
                                                </h4>
                                                <div className="space-y-2">
                                                    {selectedReceipt.items.filter(item => item.gainLossReason).map((item, idx) => (
                                                        <div key={idx} className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3">
                                                            <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                                                                {item.oilType}
                                                            </p>
                                                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                                                {item.gainLossReason}
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Attachments */}
                                        {selectedReceipt.attachments.length > 0 && (
                                            <div>
                                                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                                                    <FileText className="w-4 h-4" />
                                                    เอกสารแนบ ({selectedReceipt.attachments.length})
                                                </h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    {selectedReceipt.attachments.map((attachment) => (
                                                        <div
                                                            key={attachment.id}
                                                            className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700"
                                                        >
                                                            <FileText className="w-8 h-8 text-blue-500" />
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                                    {attachment.fileName}
                                                                </p>
                                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                    {attachment.type === "delivery_note" && "ใบส่งของ"}
                                                                    {attachment.type === "tax_invoice" && "ใบกำกับภาษี"}
                                                                    {attachment.type === "photo" && "รูปถ่าย"}
                                                                    {attachment.type === "other" && "อื่นๆ"}
                                                                </p>
                                                            </div>
                                                            <button className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors">
                                                                <Download className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Notes */}
                                        {selectedReceipt.notes && (
                                            <div>
                                                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                                    หมายเหตุ
                                                </h4>
                                                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                                                    <p className="text-sm text-gray-700 dark:text-gray-300">
                                                        {selectedReceipt.notes}
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Approval Info */}
                                        {selectedReceipt.approvedBy && (
                                            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                                                    <span className="text-sm font-semibold text-green-700 dark:text-green-400">
                                                        อนุมัติแล้ว
                                                    </span>
                                                </div>
                                                <div className="text-xs text-gray-600 dark:text-gray-400">
                                                    <p>ผู้อนุมัติ: {selectedReceipt.approvedByName}</p>
                                                    <p>วันที่: {selectedReceipt.approvedAt}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
