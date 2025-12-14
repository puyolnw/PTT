import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
    Droplet,
    Plus,
    Search,
    Filter,
    Clock,
    Eye,
    FileText,
    Truck,
    Calendar,
    Download,
    X,
    ChevronRight,
    Save,
    BookOpen,
    AlertTriangle,
} from "lucide-react";
import { mockOilReceipts } from "@/data/gasStationReceipts";
import { logActivity } from "@/types/gasStationActivity";

const currencyFormatter = new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat("th-TH", {
    maximumFractionDigits: 0,
});

// Interface สำหรับบันทึกน้ำมันลงหลุม
export interface TankEntryRecord {
    id: string;
    entryDate: string;
    entryTime: string;
    receiptNo?: string; // เชื่อมกับใบรับน้ำมัน (ถ้ามี)
    purchaseOrderNo?: string; // เชื่อมกับ PO (ถ้ามี)
    transportNo?: string; // เชื่อมกับรอบส่ง (ถ้ามี)
    source: "PTT" | "Branch" | "Other"; // ต้นทาง
    sourceBranchName?: string; // ชื่อสาขาต้นทาง (ถ้าเป็น Branch)
    
    // ข้อมูลรถและคนขับ
    truckLicensePlate?: string;
    driverName?: string;
    
    // ข้อมูลการลงหลุม
    oilType: string; // ประเภทน้ำมัน
    tankNumber: number; // หมายเลขถังใต้ดิน (1, 2, 3, ...)
    tankCode: string; // รหัสหลุม เช่น "34 HSD", "83 E 20"
    quantity: number; // จำนวนลิตรที่ลงหลุม
    beforeDip: number; // ยอดก่อนลงหลุม (ลิตร)
    afterDip: number; // ยอดหลังลงหลุม (ลิตร)
    quantityReceived: number; // จำนวนที่รับจริง = afterDip - beforeDip
    
    // ราคา
    pricePerLiter: number; // ราคาต่อลิตร
    totalAmount: number; // มูลค่ารวม
    
    // หัวจ่าย
    pumpCode?: string; // รหัสหัวจ่าย เช่น "P18", "P26"
    description?: string; // คำอธิบาย เช่น "E สินสา", "B หนอง"
    
    // สถานะ
    status: "draft" | "completed" | "cancelled";
    
    // ผู้บันทึก
    recordedBy: string;
    recordedByName: string;
    approvedBy?: string;
    approvedByName?: string;
    approvedAt?: string;
    
    // หมายเหตุ
    notes?: string;
    
    createdAt: string;
    updatedAt: string;
    
    // สำหรับการลงหลุมผิด
    isIncorrect?: boolean; // บ่งบอกว่าเป็นรายการลงหลุมผิด
}

// Interface สำหรับบันทึกการลงน้ำมันผิด
export interface IncorrectTankEntry extends TankEntryRecord {
    isIncorrect: true;
    
    // ข้อมูลการลงหลุมผิด
    wrongTankNumber: number; // หลุมที่ลงผิด
    wrongTankCode: string; // รหัสหลุมที่ลงผิด
    wrongOilType: string; // ประเภทน้ำมันที่ลงผิด
    
    correctTankNumber: number; // หลุมที่ควรลง
    correctTankCode: string; // รหัสหลุมที่ควรลง
    correctOilType: string; // ประเภทน้ำมันที่ควรลง
    
    // ข้อมูลเพิ่มเติม
    reason: string; // เหตุผลที่ลงผิด
    impact: string; // ผลกระทบ (เช่น น้ำมันปนกัน, ต้องถ่ายออก, เสียทิ้ง)
    correctiveAction: string; // การแก้ไข (เช่น ถ่ายออกไปบำบัด, เสียทิ้ง)
    resolutionStatus: "pending" | "in_progress" | "resolved" | "written_off"; // สถานะการแก้ไข
    estimatedLoss?: number; // มูลค่าความเสียหาย (บาท)
    
    // ข้อมูลการแก้ไข
    resolvedBy?: string;
    resolvedByName?: string;
    resolvedAt?: string;
    resolutionNotes?: string; // หมายเหตุการแก้ไข
}

// Mock data - ถังใต้ดินที่มีในระบบ
const mockUndergroundTanks = [
    { id: 1, code: "34 HSD", oilType: "Premium Diesel", capacity: 50000, currentStock: 25000, pumpCode: "P18", description: "E สินสา" },
    { id: 2, code: "83 E 20", oilType: "Gasohol E20", capacity: 45000, currentStock: 22000, pumpCode: "P26", description: "B หนอง" },
    { id: 3, code: "18 63H95", oilType: "Gasohol 95", capacity: 40000, currentStock: 18000, pumpCode: "P59", description: "B 5" },
    { id: 4, code: "59 69H91", oilType: "Gasohol 91", capacity: 35000, currentStock: 15000, pumpCode: "P67", description: "B สมาคม" },
    { id: 5, code: "12 HSD", oilType: "Diesel", capacity: 48000, currentStock: 20000, pumpCode: "P12", description: "E หลัก" },
];

// Mock data - บันทึกน้ำมันลงหลุม
const mockTankEntryRecords: TankEntryRecord[] = [
    {
        id: "TE-001",
        entryDate: new Date().toISOString().split("T")[0],
        entryTime: "09:30",
        receiptNo: "REC-20241214-001",
        purchaseOrderNo: "SO-20241215-001",
        source: "PTT",
        oilType: "Premium Diesel",
        tankNumber: 1,
        tankCode: "34 HSD",
        quantity: 32000,
        beforeDip: 5000,
        afterDip: 37000,
        quantityReceived: 32000,
        pricePerLiter: 32.5,
        totalAmount: 1040000,
        pumpCode: "P18",
        description: "E สินสา",
        status: "completed",
        recordedBy: "EMP-001",
        recordedByName: "นายสมศักดิ์ ใจดี",
        approvedBy: "EMP-MANAGER",
        approvedByName: "คุณนิด",
        approvedAt: "2024-12-14 10:00",
        createdAt: "2024-12-14 09:30",
        updatedAt: "2024-12-14 10:00",
        isIncorrect: false,
    },
    {
        id: "TE-002",
        entryDate: new Date().toISOString().split("T")[0],
        entryTime: "10:15",
        receiptNo: "REC-20241214-001",
        purchaseOrderNo: "SO-20241215-001",
        source: "PTT",
        oilType: "Gasohol 95",
        tankNumber: 3,
        tankCode: "18 63H95",
        quantity: 28000,
        beforeDip: 3000,
        afterDip: 31000,
        quantityReceived: 28000,
        pricePerLiter: 35.0,
        totalAmount: 980000,
        pumpCode: "P59",
        description: "B 5",
        status: "completed",
        recordedBy: "EMP-001",
        recordedByName: "นายสมศักดิ์ ใจดี",
        createdAt: "2024-12-14 10:15",
        updatedAt: "2024-12-14 10:15",
        isIncorrect: false,
    },
];

// Mock data - บันทึกการลงน้ำมันผิด
const mockIncorrectEntries: IncorrectTankEntry[] = [
    {
        id: "IE-001",
        entryDate: new Date().toISOString().split("T")[0],
        entryTime: "14:20",
        receiptNo: "REC-20241214-002",
        purchaseOrderNo: "SO-20241215-002",
        source: "PTT",
        oilType: "Gasohol 95", // ประเภทน้ำมันที่ลงผิด
        tankNumber: 2, // หลุมที่ลงผิด
        tankCode: "83 E 20", // รหัสหลุมที่ลงผิด
        quantity: 15000,
        beforeDip: 22000,
        afterDip: 37000,
        quantityReceived: 15000,
        pricePerLiter: 35.0,
        totalAmount: 525000,
        pumpCode: "P26",
        description: "B หนอง",
        status: "completed",
        recordedBy: "EMP-002",
        recordedByName: "นายประเสริฐ ดีใจ",
        createdAt: "2024-12-14 14:20",
        updatedAt: "2024-12-14 14:20",
        isIncorrect: true,
        wrongTankNumber: 2,
        wrongTankCode: "83 E 20",
        wrongOilType: "Gasohol 95",
        correctTankNumber: 3,
        correctTankCode: "18 63H95",
        correctOilType: "Gasohol 95",
        reason: "คนขับรถเติมน้ำมันผิดช่อง เนื่องจากสับสนระหว่างช่องที่ 2 และช่องที่ 3",
        impact: "น้ำมันปนกัน - Gasohol 95 ปนกับ Gasohol E20 ในหลุมเดียวกัน ต้องถ่ายออกทั้งหมด",
        correctiveAction: "ถ่ายน้ำมันออกทั้งหมดไปบำบัด เนื่องจากน้ำมันปนกันแล้ว",
        resolutionStatus: "in_progress",
        estimatedLoss: 525000,
        notes: "แจ้งเตือนผู้จัดการสาขาแล้ว กำลังดำเนินการถ่ายน้ำมันออก",
    },
];

export default function RecordTankEntry() {
    const location = useLocation();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("ทั้งหมด");
    const [filterSource, setFilterSource] = useState("ทั้งหมด");
    const [filterTank] = useState("ทั้งหมด");
    const [filterIncorrect, setFilterIncorrect] = useState<"ทั้งหมด" | "ปกติ" | "ผิด">("ทั้งหมด");
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showIncorrectEntryModal, setShowIncorrectEntryModal] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<TankEntryRecord | null>(null);

    // Form state for creating new tank entry
    const [formData, setFormData] = useState({
        entryDate: new Date().toISOString().split("T")[0],
        entryTime: new Date().toTimeString().slice(0, 5),
        receiptNo: "",
        purchaseOrderNo: "",
        transportNo: "",
        source: "PTT" as "PTT" | "Branch" | "Other",
        sourceBranchName: "",
        truckLicensePlate: "",
        driverName: "",
        oilType: "",
        tankNumber: 0,
        tankCode: "",
        quantity: 0,
        beforeDip: 0,
        afterDip: 0,
        pricePerLiter: 0,
        pumpCode: "",
        description: "",
        notes: "",
    });

    // State for pending measurements from ReceiveFromBranch
    const [pendingMeasurements, setPendingMeasurements] = useState<any[]>([]);
    const [currentMeasurementIndex, setCurrentMeasurementIndex] = useState(0);

    // Form state for incorrect entry
    const [incorrectEntryForm, setIncorrectEntryForm] = useState({
        entryDate: new Date().toISOString().split("T")[0],
        entryTime: new Date().toTimeString().slice(0, 5),
        receiptNo: "",
        purchaseOrderNo: "",
        transportNo: "",
        source: "PTT" as "PTT" | "Branch" | "Other",
        sourceBranchName: "",
        truckLicensePlate: "",
        driverName: "",
        
        // ข้อมูลการลงหลุมผิด
        wrongTankNumber: 0,
        wrongTankCode: "",
        wrongOilType: "",
        correctTankNumber: 0,
        correctTankCode: "",
        correctOilType: "",
        quantity: 0,
        beforeDip: 0,
        afterDip: 0,
        pricePerLiter: 0,
        
        // ข้อมูลเพิ่มเติม
        reason: "",
        impact: "",
        correctiveAction: "",
        resolutionStatus: "pending" as "pending" | "in_progress" | "resolved" | "written_off",
        estimatedLoss: 0,
        notes: "",
    });

    // State for all records (normal + incorrect)
    const [allRecords, setAllRecords] = useState<TankEntryRecord[]>([
        ...mockTankEntryRecords,
        ...mockIncorrectEntries,
    ]);

    // Auto-fill from ReceiveFromBranch
    useEffect(() => {
        const state = location.state as any;
        if (state?.fromReceiveFromBranch && state?.data) {
            const data = state.data;
            
            // Store all measurements for batch processing
            if (data.measurements && data.measurements.length > 0) {
                setPendingMeasurements(data.measurements);
                
                // Auto-fill basic info
                setFormData((prev) => ({
                    ...prev,
                    transportNo: data.transportNo || "",
                    source: data.source || "Branch",
                    sourceBranchName: data.sourceBranchName || "",
                    truckLicensePlate: data.truckLicensePlate || "",
                    driverName: data.driverName || "",
                    entryDate: data.receiveDate || prev.entryDate,
                    entryTime: data.receiveTime || prev.entryTime,
                }));

                // Fill first measurement
                fillMeasurementData(data.measurements[0], 0);
                
                // Auto-open create modal
                setShowCreateModal(true);
            }
        }
    }, [location.state]);

    // Helper function to fill measurement data
    const fillMeasurementData = (measurement: any, index: number) => {
        // Try to find tank by id first, then by oilType
        let tank = mockUndergroundTanks.find((t) => t.id === measurement.tankId);
        if (!tank && measurement.oilType) {
            // If tankId doesn't match, find by oilType (for compatibility with ReceiveFromBranch)
            const tanksByOilType = mockUndergroundTanks.filter((t) => t.oilType === measurement.oilType);
            if (tanksByOilType.length > 0) {
                tank = tanksByOilType[0]; // Use first matching tank
            }
        }
        
        if (tank) {
            setFormData((prev) => ({
                ...prev,
                oilType: measurement.oilType,
                tankNumber: tank.id,
                tankCode: measurement.tankCode || tank.code,
                pumpCode: measurement.pumpCode || tank.pumpCode,
                description: measurement.description || tank.description,
                beforeDip: measurement.beforeDip || 0,
                afterDip: measurement.afterDip || 0,
                quantity: 0, // Don't auto-fill - user must enter actual quantity
                pricePerLiter: measurement.pricePerLiter || prev.pricePerLiter || 0, // Auto-fill price from receipt
            }));
            setCurrentMeasurementIndex(index);
        } else {
            // If tank not found, still set basic info from measurement
            setFormData((prev) => ({
                ...prev,
                oilType: measurement.oilType,
                tankNumber: measurement.tankId || 0,
                tankCode: measurement.tankCode || "",
                pumpCode: measurement.pumpCode || "",
                description: measurement.description || "",
                beforeDip: measurement.beforeDip || 0,
                afterDip: measurement.afterDip || 0,
                quantity: 0, // Don't auto-fill - user must enter actual quantity
                pricePerLiter: measurement.pricePerLiter || prev.pricePerLiter || 0, // Auto-fill price from receipt
            }));
            setCurrentMeasurementIndex(index);
        }
    };

    // Get selected receipt/PO for auto-fill (for future use)
    // const selectedReceipt = mockOilReceipts.find((r) => r.receiptNo === formData.receiptNo);
    // const selectedPO = mockApprovedOrders.find((po) => po.orderNo === formData.purchaseOrderNo);

    // Get available tanks for selected oil type
    const availableTanks = useMemo(() => {
        if (!formData.oilType) return [];
        return mockUndergroundTanks.filter((tank) => tank.oilType === formData.oilType);
    }, [formData.oilType]);

    // Calculate quantity received from dip measurements (for reference only)
    // User must enter actual quantity that went into tank
    const calculatedQuantityReceived = useMemo(() => {
        if (formData.beforeDip > 0 && formData.afterDip > 0) {
            return formData.afterDip - formData.beforeDip;
        }
        return 0;
    }, [formData.beforeDip, formData.afterDip]);

    // Auto-fill from receipt
    const handleReceiptChange = (receiptNo: string) => {
        const receipt = mockOilReceipts.find((r) => r.receiptNo === receiptNo);
        if (receipt && receipt.items && receipt.items.length > 0) {
            // Auto-fill basic info
            setFormData((prev) => ({
                ...prev,
                receiptNo: receiptNo,
                purchaseOrderNo: receipt.purchaseOrderNo,
                truckLicensePlate: receipt.truckLicensePlate,
                driverName: receipt.driverName,
                source: "PTT",
                entryDate: receipt.receiveDate,
                entryTime: receipt.receiveTime,
            }));

            // Convert receipt items to pending measurements
            const measurements = receipt.items.map((item) => {
                const tank = mockUndergroundTanks.find((t) => t.id === item.tankNumber);
                return {
                    oilType: item.oilType,
                    tankId: item.tankNumber,
                    tankCode: tank?.code || "",
                    pumpCode: tank?.pumpCode || "",
                    description: tank?.description || "",
                    beforeDip: item.beforeDip || 0,
                    afterDip: item.afterDip || 0,
                    quantity: item.quantityReceived || 0,
                    quantityOrdered: item.quantityOrdered || 0,
                    pricePerLiter: item.pricePerLiter || 0,
                };
            });

            // Set pending measurements
            setPendingMeasurements(measurements);

            // Fill first measurement
            if (measurements.length > 0) {
                fillMeasurementData(measurements[0], 0);
                // Auto-open create modal
                setShowCreateModal(true);
            }
        } else if (receipt) {
            // Receipt exists but no items
            setFormData((prev) => ({
                ...prev,
                receiptNo: receiptNo,
                purchaseOrderNo: receipt.purchaseOrderNo,
                truckLicensePlate: receipt.truckLicensePlate,
                driverName: receipt.driverName,
                source: "PTT",
                entryDate: receipt.receiveDate,
                entryTime: receipt.receiveTime,
            }));
        }
    };

    // Auto-fill tank info when tank is selected
    const handleTankChange = (tankNumber: number) => {
        const tank = availableTanks.find((t) => t.id === tankNumber);
        if (tank) {
            setFormData({
                ...formData,
                tankNumber: tankNumber,
                tankCode: tank.code,
                pumpCode: tank.pumpCode,
                description: tank.description,
                beforeDip: tank.currentStock, // Auto-fill current stock as beforeDip
            });
        }
    };

    // Filter records
    const filteredRecords = useMemo(() => {
        return allRecords.filter((record) => {
            const matchesSearch =
                record.receiptNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                record.purchaseOrderNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                record.tankCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                record.oilType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (record.isIncorrect && (record as IncorrectTankEntry).wrongTankCode?.toLowerCase().includes(searchTerm.toLowerCase()));

            const matchesStatus = filterStatus === "ทั้งหมด" || record.status === filterStatus;
            const matchesSource = filterSource === "ทั้งหมด" || record.source === filterSource;
            const matchesTank = filterTank === "ทั้งหมด" || record.tankNumber.toString() === filterTank;
            
            // Filter by incorrect status
            const matchesIncorrect = 
                filterIncorrect === "ทั้งหมด" || 
                (filterIncorrect === "ผิด" && record.isIncorrect) ||
                (filterIncorrect === "ปกติ" && !record.isIncorrect);

            return matchesSearch && matchesStatus && matchesSource && matchesTank && matchesIncorrect;
        });
    }, [searchTerm, filterStatus, filterSource, filterTank, filterIncorrect, allRecords]);

    // Summary stats
    const stats = useMemo(() => {
        const today = new Date().toISOString().split("T")[0];
        const todayRecords = allRecords.filter((r) => r.entryDate === today);

        const totalQuantity = todayRecords.reduce((sum, record) => sum + record.quantity, 0);
        const totalAmount = todayRecords.reduce((sum, record) => sum + record.totalAmount, 0);

        return {
            total: allRecords.length,
            todayCount: todayRecords.length,
            todayQuantity: totalQuantity,
            todayAmount: totalAmount,
            draft: allRecords.filter((r) => r.status === "draft").length,
            completed: allRecords.filter((r) => r.status === "completed").length,
            incorrect: allRecords.filter((r) => r.isIncorrect).length,
        };
    }, [allRecords]);

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

    const getSourceText = (source: string) => {
        switch (source) {
            case "PTT":
                return "ปตท.";
            case "Branch":
                return "สาขา";
            case "Other":
                return "อื่นๆ";
            default:
                return source;
        }
    };

    const handleSave = () => {
        // Validation
        if (!formData.oilType) {
            alert("กรุณาเลือกประเภทน้ำมัน");
            return;
        }
        if (!formData.tankNumber || formData.tankNumber === 0) {
            alert("กรุณาเลือกถังใต้ดิน");
            return;
        }
        if (formData.beforeDip === 0 || formData.afterDip === 0) {
            alert("กรุณากรอกยอดก่อนและหลังลงหลุม");
            return;
        }
        if (formData.quantity === 0 || formData.quantity < 0) {
            alert("กรุณากรอกจำนวนที่ลงหลุมจริง");
            return;
        }
        if (formData.pricePerLiter === 0) {
            alert("กรุณากรอกราคาต่อลิตร");
            return;
        }

        // Calculate total amount
        const totalAmount = formData.quantity * formData.pricePerLiter;

        // In real app, this would call API
        const recordId = `TE-${new Date().toISOString().split("T")[0].replace(/-/g, "")}-${Date.now().toString().slice(-4)}`;
        console.log("Saving tank entry:", {
            ...formData,
            totalAmount,
            quantityReceived: formData.quantity,
        });

        // บันทึกประวัติการทำงาน
        logActivity({
            module: "บันทึกน้ำมันลงหลุม",
            action: "create",
            recordId: recordId,
            recordType: "TankEntry",
            userId: "EMP-001", // TODO: ดึงจาก session
            userName: "นายสมศักดิ์ ใจดี", // TODO: ดึงจาก session
            description: `บันทึกน้ำมันลงหลุม: ${formData.oilType} จำนวน ${numberFormatter.format(formData.quantity)} ลิตร ลงถัง #${formData.tankNumber} (${formData.tankCode})`,
            details: {
                oilType: formData.oilType,
                tankNumber: formData.tankNumber,
                tankCode: formData.tankCode,
                quantity: formData.quantity,
                beforeDip: formData.beforeDip,
                afterDip: formData.afterDip,
                pricePerLiter: formData.pricePerLiter,
                totalAmount: totalAmount,
                receiptNo: formData.receiptNo,
                purchaseOrderNo: formData.purchaseOrderNo,
            },
            status: "success",
        });

        // Check if there are more measurements to process
        if (pendingMeasurements.length > currentMeasurementIndex + 1) {
            // Move to next measurement
            const nextIndex = currentMeasurementIndex + 1;
            const nextMeasurement = pendingMeasurements[nextIndex];
            fillMeasurementData(nextMeasurement, nextIndex);
            
            // Reset price for next measurement (user needs to enter new price)
            setFormData((prev) => ({
                ...prev,
                pricePerLiter: 0,
            }));
        } else {
            // All measurements processed
            alert("บันทึกน้ำมันลงหลุมทั้งหมดสำเร็จ!");
            setShowCreateModal(false);
            setPendingMeasurements([]);
            setCurrentMeasurementIndex(0);
            resetForm();
            // Clear location state
            navigate("/app/gas-station/record-tank-entry", { replace: true });
        }
    };

    const resetForm = () => {
        setFormData({
            entryDate: new Date().toISOString().split("T")[0],
            entryTime: new Date().toTimeString().slice(0, 5),
            receiptNo: "",
            purchaseOrderNo: "",
            transportNo: "",
            source: "PTT",
            sourceBranchName: "",
            truckLicensePlate: "",
            driverName: "",
            oilType: "",
            tankNumber: 0,
            tankCode: "",
            quantity: 0,
            beforeDip: 0,
            afterDip: 0,
            pricePerLiter: 0,
            pumpCode: "",
            description: "",
            notes: "",
        });
        setPendingMeasurements([]);
        setCurrentMeasurementIndex(0);
    };

    const resetIncorrectEntryForm = () => {
        setIncorrectEntryForm({
            entryDate: new Date().toISOString().split("T")[0],
            entryTime: new Date().toTimeString().slice(0, 5),
            receiptNo: "",
            purchaseOrderNo: "",
            transportNo: "",
            source: "PTT",
            sourceBranchName: "",
            truckLicensePlate: "",
            driverName: "",
            wrongTankNumber: 0,
            wrongTankCode: "",
            wrongOilType: "",
            correctTankNumber: 0,
            correctTankCode: "",
            correctOilType: "",
            quantity: 0,
            beforeDip: 0,
            afterDip: 0,
            pricePerLiter: 0,
            reason: "",
            impact: "",
            correctiveAction: "",
            resolutionStatus: "pending",
            estimatedLoss: 0,
            notes: "",
        });
    };

    const handleSaveIncorrectEntry = () => {
        // Validation
        if (!incorrectEntryForm.wrongOilType) {
            alert("กรุณาเลือกประเภทน้ำมันที่ลงผิด");
            return;
        }
        if (!incorrectEntryForm.correctOilType) {
            alert("กรุณาเลือกประเภทน้ำมันที่ควรลง");
            return;
        }
        if (!incorrectEntryForm.wrongTankNumber || incorrectEntryForm.wrongTankNumber === 0) {
            alert("กรุณาเลือกหลุมที่ลงผิด");
            return;
        }
        if (!incorrectEntryForm.correctTankNumber || incorrectEntryForm.correctTankNumber === 0) {
            alert("กรุณาเลือกหลุมที่ควรลง");
            return;
        }
        if (incorrectEntryForm.quantity === 0 || incorrectEntryForm.quantity < 0) {
            alert("กรุณากรอกจำนวนลิตรที่ลงผิด");
            return;
        }
        if (!incorrectEntryForm.reason) {
            alert("กรุณากรอกเหตุผลที่ลงผิด");
            return;
        }
        if (!incorrectEntryForm.impact) {
            alert("กรุณากรอกผลกระทบ");
            return;
        }
        if (!incorrectEntryForm.correctiveAction) {
            alert("กรุณากรอกการแก้ไข");
            return;
        }

        // Calculate total amount and estimated loss
        const totalAmount = incorrectEntryForm.quantity * incorrectEntryForm.pricePerLiter;
        const estimatedLoss = incorrectEntryForm.estimatedLoss || totalAmount;

        // Create incorrect entry record
        const recordId = `IE-${new Date().toISOString().split("T")[0].replace(/-/g, "")}-${Date.now().toString().slice(-4)}`;
        const now = new Date().toISOString();
        
        const newIncorrectEntry: IncorrectTankEntry = {
            id: recordId,
            entryDate: incorrectEntryForm.entryDate,
            entryTime: incorrectEntryForm.entryTime,
            receiptNo: incorrectEntryForm.receiptNo || undefined,
            purchaseOrderNo: incorrectEntryForm.purchaseOrderNo || undefined,
            transportNo: incorrectEntryForm.transportNo || undefined,
            source: incorrectEntryForm.source,
            sourceBranchName: incorrectEntryForm.sourceBranchName || undefined,
            truckLicensePlate: incorrectEntryForm.truckLicensePlate || undefined,
            driverName: incorrectEntryForm.driverName || undefined,
            oilType: incorrectEntryForm.wrongOilType,
            tankNumber: incorrectEntryForm.wrongTankNumber,
            tankCode: incorrectEntryForm.wrongTankCode,
            quantity: incorrectEntryForm.quantity,
            beforeDip: incorrectEntryForm.beforeDip,
            afterDip: incorrectEntryForm.afterDip,
            quantityReceived: incorrectEntryForm.quantity,
            pricePerLiter: incorrectEntryForm.pricePerLiter,
            totalAmount: totalAmount,
            pumpCode: mockUndergroundTanks.find(t => t.id === incorrectEntryForm.wrongTankNumber)?.pumpCode || undefined,
            description: mockUndergroundTanks.find(t => t.id === incorrectEntryForm.wrongTankNumber)?.description || undefined,
            status: "completed",
            recordedBy: "EMP-001", // TODO: ดึงจาก session
            recordedByName: "นายสมศักดิ์ ใจดี", // TODO: ดึงจาก session
            notes: incorrectEntryForm.notes || undefined,
            createdAt: now,
            updatedAt: now,
            isIncorrect: true,
            wrongTankNumber: incorrectEntryForm.wrongTankNumber,
            wrongTankCode: incorrectEntryForm.wrongTankCode,
            wrongOilType: incorrectEntryForm.wrongOilType,
            correctTankNumber: incorrectEntryForm.correctTankNumber,
            correctTankCode: incorrectEntryForm.correctTankCode,
            correctOilType: incorrectEntryForm.correctOilType,
            reason: incorrectEntryForm.reason,
            impact: incorrectEntryForm.impact,
            correctiveAction: incorrectEntryForm.correctiveAction,
            resolutionStatus: incorrectEntryForm.resolutionStatus,
            estimatedLoss: estimatedLoss,
        };

        // Add to records
        setAllRecords((prev) => [...prev, newIncorrectEntry]);

        // บันทึกประวัติการทำงาน
        logActivity({
            module: "บันทึกการลงน้ำมันผิด",
            action: "create",
            recordId: recordId,
            recordType: "IncorrectTankEntry",
            userId: "EMP-001",
            userName: "นายสมศักดิ์ ใจดี",
            description: `บันทึกการลงน้ำมันผิด: ${incorrectEntryForm.wrongOilType} ลงผิดหลุม #${incorrectEntryForm.wrongTankNumber} (${incorrectEntryForm.wrongTankCode}) แทนที่จะลงหลุม #${incorrectEntryForm.correctTankNumber} (${incorrectEntryForm.correctTankCode})`,
            details: {
                wrongTank: `${incorrectEntryForm.wrongTankCode} (${incorrectEntryForm.wrongOilType})`,
                correctTank: `${incorrectEntryForm.correctTankCode} (${incorrectEntryForm.correctOilType})`,
                quantity: incorrectEntryForm.quantity,
                reason: incorrectEntryForm.reason,
                impact: incorrectEntryForm.impact,
                estimatedLoss: estimatedLoss,
            },
            status: "success",
        });

        alert("บันทึกการลงน้ำมันผิดสำเร็จ!\n\nกรุณาดำเนินการแก้ไขตามที่ระบุไว้");
        setShowIncorrectEntryModal(false);
        resetIncorrectEntryForm();
    };

    const handleViewDetail = (record: TankEntryRecord) => {
        setSelectedRecord(record);
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
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2 flex items-center gap-3">
                    <Droplet className="w-8 h-8 text-teal-500" />
                    บันทึกน้ำมันลงหลุม
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    บันทึกรายการน้ำมันที่ลงหลุมใต้ดิน แยกตามรหัสหลุม ประเภทน้ำมัน และหัวจ่าย
                </p>
            </motion.div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {[
                    {
                        title: "บันทึกวันนี้",
                        value: stats.todayCount,
                        subtitle: "รายการ",
                        detail: `${numberFormatter.format(stats.todayQuantity)} ลิตร`,
                        icon: BookOpen,
                        iconColor: "bg-gradient-to-br from-blue-500 to-blue-600",
                    },
                    {
                        title: "ปริมาณวันนี้",
                        value: numberFormatter.format(stats.todayQuantity),
                        subtitle: "ลิตร",
                        icon: Droplet,
                        iconColor: "bg-gradient-to-br from-cyan-500 to-cyan-600",
                    },
                    {
                        title: "มูลค่าวันนี้",
                        value: currencyFormatter.format(stats.todayAmount),
                        subtitle: "บาท",
                        icon: FileText,
                        iconColor: "bg-gradient-to-br from-emerald-500 to-emerald-600",
                    },
                    {
                        title: "รอดำเนินการ",
                        value: stats.draft,
                        subtitle: "รายการ",
                        icon: Clock,
                        iconColor: "bg-gradient-to-br from-orange-500 to-orange-600",
                    },
                    ...(stats.incorrect > 0 ? [{
                        title: "ลงหลุมผิด",
                        value: stats.incorrect,
                        subtitle: "รายการ",
                        icon: AlertTriangle,
                        iconColor: "bg-gradient-to-br from-red-500 to-red-600",
                    }] : []),
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
                        placeholder="ค้นหาเลขที่ใบรับ, PO, รหัสหลุม, ประเภทน้ำมัน..."
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
                <div className="flex items-center gap-2">
                    <select
                        value={filterSource}
                        onChange={(e) => setFilterSource(e.target.value)}
                        className="px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 text-gray-800 dark:text-white transition-all duration-200"
                    >
                        <option>ทั้งหมด</option>
                        <option value="PTT">ปตท.</option>
                        <option value="Branch">สาขา</option>
                        <option value="Other">อื่นๆ</option>
                    </select>
                </div>
                <div className="flex items-center gap-2">
                    <select
                        value={filterIncorrect}
                        onChange={(e) => setFilterIncorrect(e.target.value as "ทั้งหมด" | "ปกติ" | "ผิด")}
                        className="px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/50 text-gray-800 dark:text-white transition-all duration-200"
                    >
                        <option value="ทั้งหมด">ทั้งหมด</option>
                        <option value="ปกติ">บันทึกปกติ</option>
                        <option value="ผิด">ลงหลุมผิด</option>
                    </select>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="px-6 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white rounded-xl transition-all duration-200 font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        บันทึกใหม่
                    </button>
                    <button
                        onClick={() => setShowIncorrectEntryModal(true)}
                        className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl transition-all duration-200 font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2"
                    >
                        <AlertTriangle className="w-4 h-4" />
                        บันทึกการลงน้ำมันผิด
                    </button>
                </div>
            </motion.div>

            {/* Records List */}
            <div className="space-y-4">
                {filteredRecords.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-12 text-center"
                    >
                        <BookOpen className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400 text-lg">ไม่พบรายการบันทึก</p>
                        <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
                            {searchTerm || filterStatus !== "ทั้งหมด" || filterSource !== "ทั้งหมด"
                                ? "ลองเปลี่ยนเงื่อนไขการค้นหาหรือกรอง"
                                : "คลิก 'บันทึกใหม่' เพื่อเริ่มต้น"}
                        </p>
                    </motion.div>
                ) : (
                    filteredRecords.map((record, index) => {
                        return (
                            <motion.div
                                key={record.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.05 }}
                                className={`rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow ${
                                    record.isIncorrect 
                                        ? "bg-red-50 dark:bg-red-900/10 border-2 border-red-300 dark:border-red-800" 
                                        : "bg-white dark:bg-gray-800"
                                }`}
                            >
                                <div className="p-5">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4 flex-1">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${
                                                record.isIncorrect 
                                                    ? "bg-gradient-to-br from-red-500 to-red-600" 
                                                    : "bg-gradient-to-br from-teal-500 to-cyan-600"
                                            }`}>
                                                {record.isIncorrect ? (
                                                    <AlertTriangle className="w-6 h-6 text-white" />
                                                ) : (
                                                    <Droplet className="w-6 h-6 text-white" />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-1 flex-wrap">
                                                    <h3 className={`text-lg font-bold ${
                                                        record.isIncorrect 
                                                            ? "text-red-800 dark:text-red-300" 
                                                            : "text-gray-800 dark:text-white"
                                                    }`}>
                                                        {record.isIncorrect && (record as IncorrectTankEntry).wrongTankCode 
                                                            ? `${(record as IncorrectTankEntry).wrongTankCode} - ${(record as IncorrectTankEntry).wrongOilType} ❌`
                                                            : `${record.tankCode} - ${record.oilType}`
                                                        }
                                                    </h3>
                                                    {record.isIncorrect && (
                                                        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-red-500 text-white border border-red-600">
                                                            ⚠️ ลงหลุมผิด
                                                        </span>
                                                    )}
                                                    <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${getStatusColor(record.status)}`}>
                                                        {getStatusText(record.status)}
                                                    </span>
                                                    <span className="text-xs font-semibold px-2 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                                        {getSourceText(record.source)}
                                                    </span>
                                                </div>
                                                {record.isIncorrect && (record as IncorrectTankEntry).correctTankCode && (
                                                    <div className="mb-2 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                                                        <p className="text-xs text-green-700 dark:text-green-400">
                                                            <strong>ควรลง:</strong> {(record as IncorrectTankEntry).correctTankCode} - {(record as IncorrectTankEntry).correctOilType}
                                                        </p>
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-2">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="w-4 h-4" />
                                                        {record.entryDate} {record.entryTime}
                                                    </span>
                                                    {record.receiptNo && (
                                                        <span className="flex items-center gap-1">
                                                            <FileText className="w-4 h-4" />
                                                            ใบรับ: {record.receiptNo}
                                                        </span>
                                                    )}
                                                    {record.purchaseOrderNo && (
                                                        <span className="flex items-center gap-1">
                                                            <FileText className="w-4 h-4" />
                                                            PO: {record.purchaseOrderNo}
                                                        </span>
                                                    )}
                                                    {record.truckLicensePlate && (
                                                        <span className="flex items-center gap-1">
                                                            <Truck className="w-4 h-4" />
                                                            {record.truckLicensePlate}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500">
                                                    <span className="flex items-center gap-1">
                                                        <Droplet className="w-3 h-3" />
                                                        ลงหลุม: {numberFormatter.format(record.quantity)} ลิตร
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        ยอดก่อน: {numberFormatter.format(record.beforeDip)} ลิตร
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        ยอดหลัง: {numberFormatter.format(record.afterDip)} ลิตร
                                                    </span>
                                                    {record.pumpCode && (
                                                        <span className="flex items-center gap-1">
                                                            หัวจ่าย: {record.pumpCode}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => handleViewDetail(record)}
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

            {/* Create Entry Modal */}
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
                                        <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
                                            <Plus className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-1">
                                                บันทึกน้ำมันลงหลุม
                                            </h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                {pendingMeasurements.length > 0 
                                                    ? `บันทึกรายการที่ ${currentMeasurementIndex + 1} จาก ${pendingMeasurements.length}`
                                                    : "บันทึกรายการน้ำมันที่ลงหลุมใต้ดิน"
                                                }
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

                                {/* Form Content */}
                                <div className="flex-1 overflow-y-auto px-6 py-6">
                                    <div className="space-y-6">
                                        {/* Progress indicator for multiple measurements */}
                                        {pendingMeasurements.length > 1 && (
                                            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-sm font-semibold text-blue-700 dark:text-blue-400">
                                                        ความคืบหน้า: {currentMeasurementIndex + 1} / {pendingMeasurements.length}
                                                    </span>
                                                </div>
                                                <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
                                                    <div 
                                                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                                        style={{ width: `${((currentMeasurementIndex + 1) / pendingMeasurements.length) * 100}%` }}
                                                    />
                                                </div>
                                                <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                                                    รายการปัจจุบัน: {pendingMeasurements[currentMeasurementIndex]?.oilType} → ถัง #{pendingMeasurements[currentMeasurementIndex]?.tankId}
                                                </p>
                                            </div>
                                        )}

                                        {/* Step 1: Source and Reference */}
                                        <div className="space-y-4">
                                            <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                                                1. ข้อมูลต้นทางและเอกสารอ้างอิง
                                            </h4>
                                            
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        วันที่ลงหลุม <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="date"
                                                        value={formData.entryDate}
                                                        onChange={(e) =>
                                                            setFormData({ ...formData, entryDate: e.target.value })
                                                        }
                                                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 text-gray-800 dark:text-white"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        เวลา <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="time"
                                                        value={formData.entryTime}
                                                        onChange={(e) =>
                                                            setFormData({ ...formData, entryTime: e.target.value })
                                                        }
                                                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 text-gray-800 dark:text-white"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    ต้นทาง <span className="text-red-500">*</span>
                                                </label>
                                                <select
                                                    value={formData.source}
                                                    onChange={(e) =>
                                                        setFormData({ ...formData, source: e.target.value as "PTT" | "Branch" | "Other" })
                                                    }
                                                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 text-gray-800 dark:text-white"
                                                >
                                                    <option value="PTT">ปตท.</option>
                                                    <option value="Branch">สาขา</option>
                                                    <option value="Other">อื่นๆ</option>
                                                </select>
                                            </div>

                                            {formData.source === "Branch" && (
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        ชื่อสาขาต้นทาง <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={formData.sourceBranchName}
                                                        onChange={(e) =>
                                                            setFormData({ ...formData, sourceBranchName: e.target.value })
                                                        }
                                                        placeholder="เช่น สาขา 2, สาขา 3"
                                                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 text-gray-800 dark:text-white"
                                                    />
                                                </div>
                                            )}

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    เลขที่ใบรับน้ำมัน <span className="text-red-500">*</span>
                                                </label>
                                                <select
                                                    value={formData.receiptNo}
                                                    onChange={(e) => handleReceiptChange(e.target.value)}
                                                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 text-gray-800 dark:text-white"
                                                >
                                                    <option value="">-- เลือกใบรับน้ำมัน --</option>
                                                    {mockOilReceipts
                                                        .filter((r) => r.status === "completed") // แสดงเฉพาะที่เสร็จสมบูรณ์
                                                        .map((receipt) => (
                                                            <option key={receipt.id} value={receipt.receiptNo}>
                                                                {receipt.receiptNo} - {receipt.purchaseOrderNo} ({receipt.items.length} รายการ)
                                                            </option>
                                                        ))}
                                                </select>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                    เลือกใบรับน้ำมันเพื่อดึงข้อมูลการวัดยอดและประเภทน้ำมันทั้งหมด
                                                </p>
                                            </div>

                                            {/* Show receipt items summary */}
                                            {formData.receiptNo && mockOilReceipts.find((r) => r.receiptNo === formData.receiptNo) && (
                                                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                                                    <h5 className="text-sm font-semibold text-green-900 dark:text-green-300 mb-3">
                                                        รายการน้ำมันที่รับมา ({mockOilReceipts.find((r) => r.receiptNo === formData.receiptNo)?.items.length || 0} รายการ)
                                                    </h5>
                                                    <div className="space-y-2">
                                                        {mockOilReceipts
                                                            .find((r) => r.receiptNo === formData.receiptNo)
                                                            ?.items.map((item, idx) => {
                                                                const tank = mockUndergroundTanks.find((t) => t.id === item.tankNumber);
                                                                return (
                                                                    <div
                                                                        key={idx}
                                                                        className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-green-200 dark:border-green-700"
                                                                    >
                                                                        <div className="flex items-center justify-between">
                                                                            <div className="flex-1">
                                                                                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                                                                    {item.oilType}
                                                                                </p>
                                                                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                                                                    ถัง #{item.tankNumber} ({tank?.code || ""})
                                                                                </p>
                                                                            </div>
                                                                            <div className="text-right">
                                                                                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                                                                    {numberFormatter.format(item.quantityReceived)} ลิตร
                                                                                </p>
                                                                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                                                                    ราคา: {currencyFormatter.format(item.pricePerLiter)}/ลิตร
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                        <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-gray-600 dark:text-gray-400">
                                                                            <div>
                                                                                <span>ก่อนรับ: </span>
                                                                                <span className="font-semibold">{numberFormatter.format(item.beforeDip)} ลิตร</span>
                                                                            </div>
                                                                            <div>
                                                                                <span>หลังรับ: </span>
                                                                                <span className="font-semibold">{numberFormatter.format(item.afterDip)} ลิตร</span>
                                                                            </div>
                                                                            <div>
                                                                                <span>รับจริง: </span>
                                                                                <span className="font-semibold text-green-600 dark:text-green-400">
                                                                                    {numberFormatter.format(item.quantityReceived)} ลิตร
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                    </div>
                                                    {pendingMeasurements.length > 0 && (
                                                        <div className="mt-3 pt-3 border-t border-green-200 dark:border-green-700">
                                                            <p className="text-xs text-green-700 dark:text-green-400 font-semibold">
                                                                ✓ ข้อมูลพร้อมบันทึก {pendingMeasurements.length} รายการ
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        เลขที่ใบสั่งซื้อ (PO)
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={formData.purchaseOrderNo}
                                                        onChange={(e) =>
                                                            setFormData({ ...formData, purchaseOrderNo: e.target.value })
                                                        }
                                                        placeholder="SO-20241215-001"
                                                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 text-gray-800 dark:text-white"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        เลขที่รอบส่ง (Transport)
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={formData.transportNo}
                                                        onChange={(e) =>
                                                            setFormData({ ...formData, transportNo: e.target.value })
                                                        }
                                                        placeholder="TR-20241215-001"
                                                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 text-gray-800 dark:text-white"
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        ทะเบียนรถ
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={formData.truckLicensePlate}
                                                        onChange={(e) =>
                                                            setFormData({ ...formData, truckLicensePlate: e.target.value })
                                                        }
                                                        placeholder="กก-1234"
                                                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 text-gray-800 dark:text-white"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        ชื่อคนขับ
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={formData.driverName}
                                                        onChange={(e) =>
                                                            setFormData({ ...formData, driverName: e.target.value })
                                                        }
                                                        placeholder="สมชาย ใจดี"
                                                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 text-gray-800 dark:text-white"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Step 2: Oil Type and Tank Selection - Only show if no receipt selected */}
                                        {!formData.receiptNo && (
                                            <div className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-6">
                                                <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                                                    2. เลือกประเภทน้ำมันและถังใต้ดิน
                                                </h4>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        ประเภทน้ำมัน <span className="text-red-500">*</span>
                                                    </label>
                                                    <select
                                                        value={formData.oilType}
                                                        onChange={(e) =>
                                                            setFormData({ ...formData, oilType: e.target.value, tankNumber: 0, tankCode: "" })
                                                        }
                                                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 text-gray-800 dark:text-white"
                                                    >
                                                        <option value="">-- เลือกประเภทน้ำมัน --</option>
                                                        {Array.from(new Set(mockUndergroundTanks.map((t) => t.oilType))).map((oilType) => (
                                                            <option key={oilType} value={oilType}>
                                                                {oilType}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>

                                                {formData.oilType && availableTanks.length > 0 && (
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                            ถังใต้ดิน <span className="text-red-500">*</span>
                                                        </label>
                                                        <select
                                                            value={formData.tankNumber}
                                                            onChange={(e) => handleTankChange(Number(e.target.value))}
                                                            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 text-gray-800 dark:text-white"
                                                        >
                                                            <option value="0">-- เลือกถังใต้ดิน --</option>
                                                            {availableTanks.map((tank) => (
                                                                <option key={tank.id} value={tank.id}>
                                                                    {tank.code} - {tank.oilType} (ความจุ: {numberFormatter.format(tank.capacity)} ลิตร, คงเหลือ: {numberFormatter.format(tank.currentStock)} ลิตร)
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                )}

                                                {formData.tankNumber > 0 && (
                                                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                                                        <h5 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-3">
                                                            ข้อมูลถังใต้ดิน
                                                        </h5>
                                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                                            <div>
                                                                <p className="text-gray-600 dark:text-gray-400">รหัสหลุม:</p>
                                                                <p className="font-semibold text-gray-900 dark:text-white">{formData.tankCode}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-gray-600 dark:text-gray-400">หัวจ่าย:</p>
                                                                <p className="font-semibold text-gray-900 dark:text-white">{formData.pumpCode}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-gray-600 dark:text-gray-400">คำอธิบาย:</p>
                                                                <p className="font-semibold text-gray-900 dark:text-white">{formData.description}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-gray-600 dark:text-gray-400">ถังหมายเลข:</p>
                                                                <p className="font-semibold text-gray-900 dark:text-white">#{formData.tankNumber}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Show selected oil type and tank info when receipt is selected */}
                                        {formData.receiptNo && formData.oilType && formData.tankNumber > 0 && (
                                            <div className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-6">
                                                <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                                                    2. ข้อมูลน้ำมันและถังใต้ดิน (จากใบรับน้ำมัน)
                                                </h4>
                                                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                                        <div>
                                                            <p className="text-gray-600 dark:text-gray-400">ประเภทน้ำมัน:</p>
                                                            <p className="font-semibold text-gray-900 dark:text-white">{formData.oilType}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-gray-600 dark:text-gray-400">ถังหมายเลข:</p>
                                                            <p className="font-semibold text-gray-900 dark:text-white">#{formData.tankNumber}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-gray-600 dark:text-gray-400">รหัสหลุม:</p>
                                                            <p className="font-semibold text-gray-900 dark:text-white">{formData.tankCode}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-gray-600 dark:text-gray-400">หัวจ่าย:</p>
                                                            <p className="font-semibold text-gray-900 dark:text-white">{formData.pumpCode}</p>
                                                        </div>
                                                        {formData.description && (
                                                            <div className="col-span-2">
                                                                <p className="text-gray-600 dark:text-gray-400">คำอธิบาย:</p>
                                                                <p className="font-semibold text-gray-900 dark:text-white">{formData.description}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Step 3: Measurements */}
                                        <div className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-6">
                                            <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                                                {formData.receiptNo ? "3. วัดยอดน้ำมัน (จากใบรับน้ำมัน)" : "2. วัดยอดน้ำมัน"}
                                            </h4>

                                            {formData.receiptNo && formData.beforeDip > 0 && formData.afterDip > 0 ? (
                                                <div className="space-y-4">
                                                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                                                        <p className="text-sm font-semibold text-green-700 dark:text-green-400 mb-2">
                                                            ✓ ข้อมูลการวัดยอดจากใบรับน้ำมัน
                                                        </p>
                                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                                            <div>
                                                                <p className="text-gray-600 dark:text-gray-400">ยอดก่อนลงหลุม:</p>
                                                                <p className="font-semibold text-gray-900 dark:text-white">
                                                                    {numberFormatter.format(formData.beforeDip)} ลิตร
                                                                </p>
                                                            </div>

                                                            <div className="col-span-2">
                                                                <p className="text-gray-600 dark:text-gray-400">จำนวนที่รับมา (คำนวณ):</p>
                                                                <p className="font-semibold text-gray-900 dark:text-white">
                                                                    {numberFormatter.format(formData.afterDip - formData.beforeDip)} ลิตร
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                            จำนวนที่ลงหลุมจริง (ลิตร) <span className="text-red-500">*</span>
                                                        </label>
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            value={formData.quantity || ""}
                                                            onChange={(e) => {
                                                                const qty = parseFloat(e.target.value) || 0;
                                                                setFormData({ ...formData, quantity: qty });
                                                            }}
                                                            placeholder="0"
                                                            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 text-gray-800 dark:text-white"
                                                        />
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                            กรอกจำนวนที่ลงหลุมจริง (อาจไม่ตรงกับที่รับมา)
                                                        </p>
                                                        {formData.quantity > 0 && calculatedQuantityReceived > 0 && (
                                                            <div className="mt-2">
                                                                {formData.quantity !== calculatedQuantityReceived && (
                                                                    <div className={`p-2 rounded-lg text-xs ${
                                                                        formData.quantity < calculatedQuantityReceived
                                                                            ? "bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-400"
                                                                            : "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400"
                                                                    }`}>
                                                                        {formData.quantity < calculatedQuantityReceived ? (
                                                                            <span>
                                                                                ⚠️ น้อยกว่าที่รับมา {numberFormatter.format(calculatedQuantityReceived - formData.quantity)} ลิตร
                                                                            </span>
                                                                        ) : (
                                                                            <span>
                                                                                ℹ️ มากกว่าที่รับมา {numberFormatter.format(formData.quantity - calculatedQuantityReceived)} ลิตร
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                            ยอดก่อนลงหลุม (ลิตร) <span className="text-red-500">*</span>
                                                        </label>
                                                        <input
                                                            type="number"
                                                            value={formData.beforeDip || ""}
                                                            onChange={(e) =>
                                                                setFormData({ ...formData, beforeDip: parseFloat(e.target.value) || 0 })
                                                            }
                                                            placeholder="0"
                                                            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 text-gray-800 dark:text-white"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                            ยอดหลังลงหลุม (ลิตร) <span className="text-red-500">*</span>
                                                        </label>
                                                        <input
                                                            type="number"
                                                            value={formData.afterDip || ""}
                                                            onChange={(e) =>
                                                                setFormData({ ...formData, afterDip: parseFloat(e.target.value) || 0 })
                                                            }
                                                            placeholder="0"
                                                            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 text-gray-800 dark:text-white"
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            {!formData.receiptNo && formData.beforeDip > 0 && formData.afterDip > 0 && (
                                                <div className="space-y-4">
                                                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-sm font-semibold text-green-700 dark:text-green-400">
                                                                จำนวนที่รับมา (คำนวณ):
                                                            </span>
                                                            <span className="text-lg font-bold text-green-700 dark:text-green-400">
                                                                {numberFormatter.format(calculatedQuantityReceived)} ลิตร
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                            จำนวนที่ลงหลุมจริง (ลิตร) <span className="text-red-500">*</span>
                                                        </label>
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            value={formData.quantity || ""}
                                                            onChange={(e) => {
                                                                const qty = parseFloat(e.target.value) || 0;
                                                                setFormData({ ...formData, quantity: qty });
                                                            }}
                                                            placeholder="0"
                                                            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 text-gray-800 dark:text-white"
                                                        />
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                            กรอกจำนวนที่ลงหลุมจริง (อาจไม่ตรงกับที่คำนวณ)
                                                        </p>
                                                        {formData.quantity > 0 && calculatedQuantityReceived > 0 && formData.quantity !== calculatedQuantityReceived && (
                                                            <div className={`mt-2 p-2 rounded-lg text-xs ${
                                                                formData.quantity < calculatedQuantityReceived
                                                                    ? "bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-400"
                                                                    : "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400"
                                                            }`}>
                                                                {formData.quantity < calculatedQuantityReceived ? (
                                                                    <span>
                                                                        ⚠️ น้อยกว่าที่รับมา {numberFormatter.format(calculatedQuantityReceived - formData.quantity)} ลิตร
                                                                    </span>
                                                                ) : (
                                                                    <span>
                                                                        ℹ️ มากกว่าที่รับมา {numberFormatter.format(formData.quantity - calculatedQuantityReceived)} ลิตร
                                                                    </span>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Step 4: Price */}
                                        <div className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-6">
                                            <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                                                {formData.receiptNo ? "4. ราคา (จากใบรับน้ำมัน)" : "3. ราคา"}
                                            </h4>

                                            {formData.receiptNo && formData.pricePerLiter > 0 ? (
                                                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                                                    <p className="text-sm font-semibold text-green-700 dark:text-green-400 mb-2">
                                                        ✓ ราคาจากใบรับน้ำมัน
                                                    </p>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-gray-600 dark:text-gray-400">ราคาต่อลิตร:</span>
                                                        <span className="text-lg font-bold text-green-600 dark:text-green-400">
                                                            {currencyFormatter.format(formData.pricePerLiter)}
                                                        </span>
                                                    </div>
                                                    <div className="mt-3 pt-3 border-t border-green-200 dark:border-green-700 flex items-center justify-between">
                                                        <span className="text-gray-600 dark:text-gray-400">มูลค่ารวม:</span>
                                                        <span className="text-xl font-bold text-green-600 dark:text-green-400">
                                                            {currencyFormatter.format(formData.quantity * formData.pricePerLiter)}
                                                        </span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        ราคาต่อลิตร (บาท) <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        value={formData.pricePerLiter || ""}
                                                        onChange={(e) => {
                                                            const price = parseFloat(e.target.value) || 0;
                                                            setFormData({ ...formData, pricePerLiter: price });
                                                        }}
                                                        placeholder="0.00"
                                                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 text-gray-800 dark:text-white"
                                                    />
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                        ราคาต่อลิตรของน้ำมันที่รับมา (จากใบกำกับภาษีหรือใบเสร็จ)
                                                    </p>
                                                </div>
                                            )}

                                            {formData.pricePerLiter > 0 && formData.quantity > 0 && (
                                                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm font-semibold text-blue-700 dark:text-blue-400">
                                                            มูลค่ารวม:
                                                        </span>
                                                        <span className="text-lg font-bold text-blue-700 dark:text-blue-400">
                                                            {currencyFormatter.format(formData.quantity * formData.pricePerLiter)}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Step 5: Notes */}
                                        <div className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-6">
                                            <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                                                {formData.receiptNo ? "5. หมายเหตุ" : "4. หมายเหตุ"}
                                            </h4>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    หมายเหตุเพิ่มเติม
                                                </label>
                                                <textarea
                                                    value={formData.notes}
                                                    onChange={(e) =>
                                                        setFormData({ ...formData, notes: e.target.value })
                                                    }
                                                    rows={3}
                                                    placeholder="ระบุหมายเหตุเพิ่มเติม (ถ้ามี)"
                                                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 text-gray-800 dark:text-white resize-none"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer Buttons */}
                                <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                        {pendingMeasurements.length > 0 && (
                                            <span>
                                                รายการที่ {currentMeasurementIndex + 1} จาก {pendingMeasurements.length}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => {
                                                setShowCreateModal(false);
                                                resetForm();
                                            }}
                                            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl transition-colors font-semibold"
                                        >
                                            ยกเลิก
                                        </button>
                                        {pendingMeasurements.length > currentMeasurementIndex + 1 && (
                                            <button
                                                onClick={() => {
                                                    // Skip current and move to next
                                                    const nextIndex = currentMeasurementIndex + 1;
                                                    fillMeasurementData(pendingMeasurements[nextIndex], nextIndex);
                                                }}
                                                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl transition-colors font-semibold"
                                            >
                                                ข้ามรายการนี้
                                            </button>
                                        )}
                                        <button
                                            onClick={handleSave}
                                            className="px-6 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white rounded-xl transition-all duration-200 font-semibold shadow-lg hover:shadow-xl flex items-center gap-2"
                                        >
                                            <Save className="w-4 h-4" />
                                            {pendingMeasurements.length > currentMeasurementIndex + 1 
                                                ? "บันทึกและถัดไป" 
                                                : "บันทึก"
                                            }
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </>
                )}
            </AnimatePresence>

            {/* Detail Modal */}
            <AnimatePresence>
                {showDetailModal && selectedRecord && (
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
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${
                                            selectedRecord.isIncorrect 
                                                ? "bg-gradient-to-br from-red-500 to-red-600" 
                                                : "bg-gradient-to-br from-teal-500 to-cyan-600"
                                        }`}>
                                            {selectedRecord.isIncorrect ? (
                                                <AlertTriangle className="w-6 h-6 text-white" />
                                            ) : (
                                                <Eye className="w-6 h-6 text-white" />
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-1">
                                                {selectedRecord.isIncorrect 
                                                    ? "รายละเอียดการลงน้ำมันผิด" 
                                                    : "รายละเอียดการบันทึกน้ำมันลงหลุม"
                                                }
                                            </h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                {selectedRecord.isIncorrect && (selectedRecord as IncorrectTankEntry).wrongTankCode
                                                    ? `${(selectedRecord as IncorrectTankEntry).wrongTankCode} - ${(selectedRecord as IncorrectTankEntry).wrongOilType} ❌`
                                                    : `${selectedRecord.tankCode} - ${selectedRecord.oilType}`
                                                }
                                            </p>
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
                                        {/* Basic Info */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                                                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">วันที่และเวลา</p>
                                                <p className="text-sm font-semibold text-gray-800 dark:text-white">
                                                    {selectedRecord.entryDate} {selectedRecord.entryTime}
                                                </p>
                                            </div>
                                            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                                                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">สถานะ</p>
                                                <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full border ${getStatusColor(selectedRecord.status)}`}>
                                                    {getStatusText(selectedRecord.status)}
                                                </span>
                                            </div>
                                            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                                                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">ต้นทาง</p>
                                                <p className="text-sm font-semibold text-gray-800 dark:text-white">
                                                    {getSourceText(selectedRecord.source)}
                                                </p>
                                            </div>
                                            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                                                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">ถังใต้ดิน</p>
                                                <p className="text-sm font-semibold text-gray-800 dark:text-white">
                                                    {selectedRecord.tankCode} (ถัง #{selectedRecord.tankNumber})
                                                </p>
                                            </div>
                                        </div>

                                        {/* Oil Info - Only show for normal entries */}
                                        {!selectedRecord.isIncorrect && (
                                            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                                                <p className="text-xs text-blue-600 dark:text-blue-400 mb-2 font-semibold">ข้อมูลน้ำมัน</p>
                                                <div className="grid grid-cols-2 gap-4 text-sm">
                                                    <div>
                                                        <span className="text-gray-600 dark:text-gray-400">ประเภท:</span>
                                                        <span className="ml-2 font-semibold text-gray-800 dark:text-white">{selectedRecord.oilType}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-600 dark:text-gray-400">จำนวน:</span>
                                                        <span className="ml-2 font-semibold text-gray-800 dark:text-white">
                                                            {numberFormatter.format(selectedRecord.quantity)} ลิตร
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-600 dark:text-gray-400">ราคาต่อลิตร:</span>
                                                        <span className="ml-2 font-semibold text-gray-800 dark:text-white">
                                                            {currencyFormatter.format(selectedRecord.pricePerLiter)}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-600 dark:text-gray-400">มูลค่ารวม:</span>
                                                        <span className="ml-2 font-semibold text-gray-800 dark:text-white">
                                                            {currencyFormatter.format(selectedRecord.totalAmount)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Measurements - Only show for normal entries */}
                                        {!selectedRecord.isIncorrect && (
                                            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                                                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 font-semibold">ยอดวัด</p>
                                                <div className="grid grid-cols-3 gap-4 text-sm">
                                                    <div>
                                                        <span className="text-gray-600 dark:text-gray-400">ยอดก่อนลงหลุม:</span>
                                                        <span className="ml-2 font-semibold text-gray-800 dark:text-white">
                                                            {numberFormatter.format(selectedRecord.beforeDip)} ลิตร
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-600 dark:text-gray-400">ยอดหลังลงหลุม:</span>
                                                        <span className="ml-2 font-semibold text-gray-800 dark:text-white">
                                                            {numberFormatter.format(selectedRecord.afterDip)} ลิตร
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-600 dark:text-gray-400">จำนวนที่รับจริง:</span>
                                                        <span className="ml-2 font-semibold text-gray-800 dark:text-white">
                                                            {numberFormatter.format(selectedRecord.quantityReceived)} ลิตร
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Reference Info */}
                                        {(selectedRecord.receiptNo || selectedRecord.purchaseOrderNo || selectedRecord.transportNo) && (
                                            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                                                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 font-semibold">เอกสารอ้างอิง</p>
                                                <div className="space-y-2 text-sm">
                                                    {selectedRecord.receiptNo && (
                                                        <div>
                                                            <span className="text-gray-600 dark:text-gray-400">ใบรับน้ำมัน:</span>
                                                            <span className="ml-2 font-semibold text-gray-800 dark:text-white">
                                                                {selectedRecord.receiptNo}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {selectedRecord.purchaseOrderNo && (
                                                        <div>
                                                            <span className="text-gray-600 dark:text-gray-400">ใบสั่งซื้อ:</span>
                                                            <span className="ml-2 font-semibold text-gray-800 dark:text-white">
                                                                {selectedRecord.purchaseOrderNo}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {selectedRecord.transportNo && (
                                                        <div>
                                                            <span className="text-gray-600 dark:text-gray-400">รอบส่ง:</span>
                                                            <span className="ml-2 font-semibold text-gray-800 dark:text-white">
                                                                {selectedRecord.transportNo}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Vehicle Info */}
                                        {(selectedRecord.truckLicensePlate || selectedRecord.driverName) && (
                                            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                                                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 font-semibold">ข้อมูลรถ</p>
                                                <div className="grid grid-cols-2 gap-4 text-sm">
                                                    {selectedRecord.truckLicensePlate && (
                                                        <div>
                                                            <span className="text-gray-600 dark:text-gray-400">ทะเบียนรถ:</span>
                                                            <span className="ml-2 font-semibold text-gray-800 dark:text-white">
                                                                {selectedRecord.truckLicensePlate}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {selectedRecord.driverName && (
                                                        <div>
                                                            <span className="text-gray-600 dark:text-gray-400">คนขับ:</span>
                                                            <span className="ml-2 font-semibold text-gray-800 dark:text-white">
                                                                {selectedRecord.driverName}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Pump Info */}
                                        {selectedRecord.pumpCode && (
                                            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                                                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 font-semibold">หัวจ่าย</p>
                                                <div className="text-sm">
                                                    <span className="text-gray-600 dark:text-gray-400">รหัสหัวจ่าย:</span>
                                                    <span className="ml-2 font-semibold text-gray-800 dark:text-white">
                                                        {selectedRecord.pumpCode}
                                                    </span>
                                                    {selectedRecord.description && (
                                                        <>
                                                            <span className="mx-2 text-gray-400">•</span>
                                                            <span className="text-gray-600 dark:text-gray-400">{selectedRecord.description}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Incorrect Entry Details */}
                                        {selectedRecord.isIncorrect && (() => {
                                            const incorrectRecord = selectedRecord as IncorrectTankEntry;
                                            return (
                                                <>
                                                    {/* Warning Banner */}
                                                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-800 rounded-xl">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                                                            <p className="text-sm font-bold text-red-800 dark:text-red-300">
                                                                ⚠️ รายการลงน้ำมันผิดหลุม/ผิดประเภท
                                                            </p>
                                                        </div>
                                                        <p className="text-xs text-red-700 dark:text-red-400">
                                                            น้ำมันปนกันต้องถ่ายออกไปบำบัดหรือเสียทิ้ง
                                                        </p>
                                                    </div>

                                                    {/* Wrong vs Correct Tank Comparison */}
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-800 rounded-xl">
                                                            <p className="text-xs text-red-600 dark:text-red-400 mb-2 font-semibold flex items-center gap-2">
                                                                <AlertTriangle className="w-4 h-4" />
                                                                หลุมที่ลงผิด
                                                            </p>
                                                            <div className="space-y-2 text-sm">
                                                                <div>
                                                                    <span className="text-gray-600 dark:text-gray-400">รหัสหลุม:</span>
                                                                    <span className="ml-2 font-semibold text-red-800 dark:text-red-300">
                                                                        {incorrectRecord.wrongTankCode} (ถัง #{incorrectRecord.wrongTankNumber})
                                                                    </span>
                                                                </div>
                                                                <div>
                                                                    <span className="text-gray-600 dark:text-gray-400">ประเภทน้ำมัน:</span>
                                                                    <span className="ml-2 font-semibold text-red-800 dark:text-red-300">
                                                                        {incorrectRecord.wrongOilType}
                                                                    </span>
                                                                </div>
                                                                <div>
                                                                    <span className="text-gray-600 dark:text-gray-400">จำนวนที่ลงผิด:</span>
                                                                    <span className="ml-2 font-bold text-lg text-red-800 dark:text-red-300">
                                                                        {numberFormatter.format(incorrectRecord.quantity)} ลิตร
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="p-4 bg-green-50 dark:bg-green-900/20 border-2 border-green-300 dark:border-green-800 rounded-xl">
                                                            <p className="text-xs text-green-600 dark:text-green-400 mb-2 font-semibold flex items-center gap-2">
                                                                <span className="text-green-600">✓</span>
                                                                หลุมที่ควรลง
                                                            </p>
                                                            <div className="space-y-2 text-sm">
                                                                <div>
                                                                    <span className="text-gray-600 dark:text-gray-400">รหัสหลุม:</span>
                                                                    <span className="ml-2 font-semibold text-green-800 dark:text-green-300">
                                                                        {incorrectRecord.correctTankCode} (ถัง #{incorrectRecord.correctTankNumber})
                                                                    </span>
                                                                </div>
                                                                <div>
                                                                    <span className="text-gray-600 dark:text-gray-400">ประเภทน้ำมัน:</span>
                                                                    <span className="ml-2 font-semibold text-green-800 dark:text-green-300">
                                                                        {incorrectRecord.correctOilType}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Reason */}
                                                    {incorrectRecord.reason && (
                                                        <div className="p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl">
                                                            <p className="text-xs text-orange-600 dark:text-orange-400 mb-2 font-semibold">เหตุผลที่ลงผิด</p>
                                                            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                                                {incorrectRecord.reason}
                                                            </p>
                                                        </div>
                                                    )}

                                                    {/* Impact */}
                                                    {incorrectRecord.impact && (
                                                        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                                                            <p className="text-xs text-red-600 dark:text-red-400 mb-2 font-semibold">ผลกระทบ</p>
                                                            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                                                {incorrectRecord.impact}
                                                            </p>
                                                        </div>
                                                    )}

                                                    {/* Corrective Action */}
                                                    {incorrectRecord.correctiveAction && (
                                                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                                                            <p className="text-xs text-blue-600 dark:text-blue-400 mb-2 font-semibold">การแก้ไข</p>
                                                            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                                                {incorrectRecord.correctiveAction}
                                                            </p>
                                                        </div>
                                                    )}

                                                    {/* Resolution Status and Estimated Loss */}
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                                                            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 font-semibold">สถานะการแก้ไข</p>
                                                            <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full border ${
                                                                incorrectRecord.resolutionStatus === "resolved" 
                                                                    ? "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800"
                                                                    : incorrectRecord.resolutionStatus === "in_progress"
                                                                    ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800"
                                                                    : incorrectRecord.resolutionStatus === "written_off"
                                                                    ? "text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/30 border-gray-200 dark:border-gray-800"
                                                                    : "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30 border-orange-200 dark:border-orange-800"
                                                            }`}>
                                                                {incorrectRecord.resolutionStatus === "pending" && "รอดำเนินการ"}
                                                                {incorrectRecord.resolutionStatus === "in_progress" && "กำลังดำเนินการ"}
                                                                {incorrectRecord.resolutionStatus === "resolved" && "แก้ไขเสร็จสิ้น"}
                                                                {incorrectRecord.resolutionStatus === "written_off" && "ตัดเป็นค่าใช้จ่าย"}
                                                            </span>
                                                        </div>
                                                        {incorrectRecord.estimatedLoss && incorrectRecord.estimatedLoss > 0 && (
                                                            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                                                                <p className="text-xs text-red-600 dark:text-red-400 mb-2 font-semibold">มูลค่าความเสียหาย</p>
                                                                <p className="text-lg font-bold text-red-800 dark:text-red-300">
                                                                    {currencyFormatter.format(incorrectRecord.estimatedLoss)}
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Resolution Info */}
                                                    {incorrectRecord.resolvedBy && (
                                                        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                                                            <p className="text-xs text-green-600 dark:text-green-400 mb-2 font-semibold">ข้อมูลการแก้ไข</p>
                                                            <div className="space-y-2 text-sm">
                                                                <div>
                                                                    <span className="text-gray-600 dark:text-gray-400">แก้ไขโดย:</span>
                                                                    <span className="ml-2 font-semibold text-gray-800 dark:text-white">
                                                                        {incorrectRecord.resolvedByName}
                                                                    </span>
                                                                </div>
                                                                {incorrectRecord.resolvedAt && (
                                                                    <div>
                                                                        <span className="text-gray-600 dark:text-gray-400">วันที่แก้ไข:</span>
                                                                        <span className="ml-2 font-semibold text-gray-800 dark:text-white">
                                                                            {incorrectRecord.resolvedAt}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                                {incorrectRecord.resolutionNotes && (
                                                                    <div>
                                                                        <span className="text-gray-600 dark:text-gray-400">หมายเหตุการแก้ไข:</span>
                                                                        <p className="mt-1 text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                                                            {incorrectRecord.resolutionNotes}
                                                                        </p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </>
                                            );
                                        })()}

                                        {/* Notes */}
                                        {selectedRecord.notes && (
                                            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                                                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 font-semibold">หมายเหตุ</p>
                                                <p className="text-sm text-gray-700 dark:text-gray-300">{selectedRecord.notes}</p>
                                            </div>
                                        )}

                                        {/* Recorded By */}
                                        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                                            <p className="text-xs text-green-600 dark:text-green-400 mb-2 font-semibold">ข้อมูลการบันทึก</p>
                                            <div className="space-y-2 text-sm">
                                                <div>
                                                    <span className="text-gray-600 dark:text-gray-400">บันทึกโดย:</span>
                                                    <span className="ml-2 font-semibold text-gray-800 dark:text-white">
                                                        {selectedRecord.recordedByName}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-600 dark:text-gray-400">วันที่บันทึก:</span>
                                                    <span className="ml-2 font-semibold text-gray-800 dark:text-white">
                                                        {selectedRecord.createdAt}
                                                    </span>
                                                </div>
                                                {selectedRecord.approvedBy && (
                                                    <div>
                                                        <span className="text-gray-600 dark:text-gray-400">อนุมัติโดย:</span>
                                                        <span className="ml-2 font-semibold text-gray-800 dark:text-white">
                                                            {selectedRecord.approvedByName} ({selectedRecord.approvedAt})
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end gap-3">
                                    <button
                                        onClick={() => setShowDetailModal(false)}
                                        className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl transition-colors font-semibold"
                                    >
                                        ปิด
                                    </button>
                                    <button className="px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white rounded-xl transition-all duration-200 font-semibold shadow-lg hover:shadow-xl flex items-center gap-2">
                                        <Download className="w-4 h-4" />
                                        Export
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    </>
                )}
            </AnimatePresence>

            {/* Incorrect Entry Modal */}
            <AnimatePresence>
                {showIncorrectEntryModal && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowIncorrectEntryModal(false)}
                            className="fixed inset-0 bg-black/50 z-50"
                        />
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
                            >
                                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                                            <AlertTriangle className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-1">
                                                บันทึกการลงน้ำมันผิด
                                            </h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                บันทึกรายการที่ลงน้ำมันผิดหลุมหรือผิดประเภท
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setShowIncorrectEntryModal(false)}
                                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all duration-200 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:scale-110 active:scale-95"
                                        aria-label="ปิด"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="flex-1 overflow-y-auto px-6 py-6">
                                    <div className="space-y-6">
                                        {/* Warning Notice */}
                                        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-4">
                                            <p className="text-sm text-orange-800 dark:text-orange-200">
                                                <strong>⚠️ คำเตือน:</strong> การลงน้ำมันผิดหลุมหรือผิดประเภทเป็นเรื่องร้ายแรง น้ำมันปนกันต้องถ่ายออกไปบำบัดหรือเสียทิ้ง 
                                                กรุณากรอกข้อมูลให้ครบถ้วนเพื่อการตรวจสอบและแก้ไขต่อไป
                                            </p>
                                        </div>

                                        {/* Basic Information */}
                                        <div className="space-y-4">
                                            <h4 className="text-lg font-semibold text-gray-800 dark:text-white">ข้อมูลพื้นฐาน</h4>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        วันที่ <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="date"
                                                        value={incorrectEntryForm.entryDate}
                                                        onChange={(e) => setIncorrectEntryForm({ ...incorrectEntryForm, entryDate: e.target.value })}
                                                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/30 text-gray-800 dark:text-white"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        เวลา <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="time"
                                                        value={incorrectEntryForm.entryTime}
                                                        onChange={(e) => setIncorrectEntryForm({ ...incorrectEntryForm, entryTime: e.target.value })}
                                                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/30 text-gray-800 dark:text-white"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        ใบรับน้ำมัน
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={incorrectEntryForm.receiptNo}
                                                        onChange={(e) => setIncorrectEntryForm({ ...incorrectEntryForm, receiptNo: e.target.value })}
                                                        placeholder="REC-XXXXXX-XXX"
                                                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/30 text-gray-800 dark:text-white"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        ใบสั่งซื้อ (PO)
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={incorrectEntryForm.purchaseOrderNo}
                                                        onChange={(e) => setIncorrectEntryForm({ ...incorrectEntryForm, purchaseOrderNo: e.target.value })}
                                                        placeholder="SO-XXXXXX-XXX"
                                                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/30 text-gray-800 dark:text-white"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Wrong Entry Information */}
                                        <div className="space-y-4">
                                            <h4 className="text-lg font-semibold text-red-600 dark:text-red-400">❌ ข้อมูลการลงหลุมผิด</h4>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        หลุมที่ลงผิด <span className="text-red-500">*</span>
                                                    </label>
                                                    <select
                                                        value={incorrectEntryForm.wrongTankNumber}
                                                        onChange={(e) => {
                                                            const tankId = parseInt(e.target.value);
                                                            const tank = mockUndergroundTanks.find(t => t.id === tankId);
                                                            setIncorrectEntryForm({
                                                                ...incorrectEntryForm,
                                                                wrongTankNumber: tankId,
                                                                wrongTankCode: tank?.code || "",
                                                                wrongOilType: tank?.oilType || "",
                                                            });
                                                        }}
                                                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-red-300 dark:border-red-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/30 text-gray-800 dark:text-white"
                                                    >
                                                        <option value={0}>เลือกหลุมที่ลงผิด</option>
                                                        {mockUndergroundTanks.map((tank) => (
                                                            <option key={tank.id} value={tank.id}>
                                                                #{tank.id} - {tank.code} ({tank.oilType})
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        ประเภทน้ำมันที่ลงผิด <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={incorrectEntryForm.wrongOilType}
                                                        readOnly
                                                        className="w-full px-4 py-2.5 bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-800 rounded-xl text-gray-800 dark:text-white"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Correct Entry Information */}
                                        <div className="space-y-4">
                                            <h4 className="text-lg font-semibold text-green-600 dark:text-green-400">✅ ข้อมูลที่ควรลง</h4>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        หลุมที่ควรลง <span className="text-red-500">*</span>
                                                    </label>
                                                    <select
                                                        value={incorrectEntryForm.correctTankNumber}
                                                        onChange={(e) => {
                                                            const tankId = parseInt(e.target.value);
                                                            const tank = mockUndergroundTanks.find(t => t.id === tankId);
                                                            setIncorrectEntryForm({
                                                                ...incorrectEntryForm,
                                                                correctTankNumber: tankId,
                                                                correctTankCode: tank?.code || "",
                                                                correctOilType: tank?.oilType || "",
                                                            });
                                                        }}
                                                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-green-300 dark:border-green-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/30 text-gray-800 dark:text-white"
                                                    >
                                                        <option value={0}>เลือกหลุมที่ควรลง</option>
                                                        {mockUndergroundTanks.map((tank) => (
                                                            <option key={tank.id} value={tank.id}>
                                                                #{tank.id} - {tank.code} ({tank.oilType})
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        ประเภทน้ำมันที่ควรลง <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={incorrectEntryForm.correctOilType}
                                                        readOnly
                                                        className="w-full px-4 py-2.5 bg-green-50 dark:bg-green-900/20 border border-green-300 dark:border-green-800 rounded-xl text-gray-800 dark:text-white"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Quantity and Price */}
                                        <div className="space-y-4">
                                            <h4 className="text-lg font-semibold text-gray-800 dark:text-white">ข้อมูลจำนวนและราคา</h4>
                                            <div className="grid grid-cols-3 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        จำนวนลิตรที่ลงผิด <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="number"
                                                        value={incorrectEntryForm.quantity || ""}
                                                        onChange={(e) => setIncorrectEntryForm({ ...incorrectEntryForm, quantity: parseFloat(e.target.value) || 0 })}
                                                        placeholder="0"
                                                        min="0"
                                                        step="0.01"
                                                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/30 text-gray-800 dark:text-white"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        ราคาต่อลิตร <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="number"
                                                        value={incorrectEntryForm.pricePerLiter || ""}
                                                        onChange={(e) => setIncorrectEntryForm({ ...incorrectEntryForm, pricePerLiter: parseFloat(e.target.value) || 0 })}
                                                        placeholder="0.00"
                                                        min="0"
                                                        step="0.01"
                                                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/30 text-gray-800 dark:text-white"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        มูลค่าความเสียหาย (บาท)
                                                    </label>
                                                    <input
                                                        type="number"
                                                        value={incorrectEntryForm.estimatedLoss || ""}
                                                        onChange={(e) => setIncorrectEntryForm({ ...incorrectEntryForm, estimatedLoss: parseFloat(e.target.value) || 0 })}
                                                        placeholder="0.00"
                                                        min="0"
                                                        step="0.01"
                                                        className="w-full px-4 py-2.5 bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/30 text-gray-800 dark:text-white"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Reason and Impact */}
                                        <div className="space-y-4">
                                            <h4 className="text-lg font-semibold text-gray-800 dark:text-white">รายละเอียดเหตุการณ์</h4>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    เหตุผลที่ลงผิด <span className="text-red-500">*</span>
                                                </label>
                                                <textarea
                                                    value={incorrectEntryForm.reason}
                                                    onChange={(e) => setIncorrectEntryForm({ ...incorrectEntryForm, reason: e.target.value })}
                                                    placeholder="อธิบายเหตุผลที่ทำให้ลงน้ำมันผิดหลุมหรือผิดประเภท..."
                                                    rows={3}
                                                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/30 text-gray-800 dark:text-white"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    ผลกระทบ <span className="text-red-500">*</span>
                                                </label>
                                                <textarea
                                                    value={incorrectEntryForm.impact}
                                                    onChange={(e) => setIncorrectEntryForm({ ...incorrectEntryForm, impact: e.target.value })}
                                                    placeholder="อธิบายผลกระทบ เช่น น้ำมันปนกัน ต้องถ่ายออกไปบำบัด เสียทิ้ง..."
                                                    rows={3}
                                                    className="w-full px-4 py-2.5 bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/30 text-gray-800 dark:text-white"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    การแก้ไข <span className="text-red-500">*</span>
                                                </label>
                                                <textarea
                                                    value={incorrectEntryForm.correctiveAction}
                                                    onChange={(e) => setIncorrectEntryForm({ ...incorrectEntryForm, correctiveAction: e.target.value })}
                                                    placeholder="อธิบายวิธีการแก้ไข เช่น ถ่ายน้ำมันออกไปบำบัด เสียทิ้ง..."
                                                    rows={3}
                                                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/30 text-gray-800 dark:text-white"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    สถานะการแก้ไข <span className="text-red-500">*</span>
                                                </label>
                                                <select
                                                    value={incorrectEntryForm.resolutionStatus}
                                                    onChange={(e) => setIncorrectEntryForm({ ...incorrectEntryForm, resolutionStatus: e.target.value as "pending" | "in_progress" | "resolved" | "written_off" })}
                                                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/30 text-gray-800 dark:text-white"
                                                >
                                                    <option value="pending">รอดำเนินการ</option>
                                                    <option value="in_progress">กำลังดำเนินการ</option>
                                                    <option value="resolved">แก้ไขเสร็จสิ้น</option>
                                                    <option value="written_off">ตัดเป็นค่าใช้จ่าย</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    หมายเหตุเพิ่มเติม
                                                </label>
                                                <textarea
                                                    value={incorrectEntryForm.notes}
                                                    onChange={(e) => setIncorrectEntryForm({ ...incorrectEntryForm, notes: e.target.value })}
                                                    placeholder="หมายเหตุเพิ่มเติม..."
                                                    rows={2}
                                                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/30 text-gray-800 dark:text-white"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end gap-3">
                                    <button
                                        onClick={() => {
                                            setShowIncorrectEntryModal(false);
                                            resetIncorrectEntryForm();
                                        }}
                                        className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl transition-colors font-semibold"
                                    >
                                        ยกเลิก
                                    </button>
                                    <button
                                        onClick={handleSaveIncorrectEntry}
                                        className="px-6 py-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl transition-all duration-200 font-semibold shadow-lg hover:shadow-xl flex items-center gap-2"
                                    >
                                        <AlertTriangle className="w-4 h-4" />
                                        บันทึกการลงน้ำมันผิด
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
