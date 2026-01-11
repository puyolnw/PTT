import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useGasStation } from "@/contexts/GasStationContext";
import { useBranch } from "@/contexts/BranchContext";
import type { TankEntryRecord as TankEntryRecordType, OilType } from "@/types/gasStation";
import TableActionMenu from "@/components/TableActionMenu";

// Helper function to map local source to base source type
const mapSourceToBaseType = (source: "PTT" | "Branch" | "Other"): "รับจากปตท" | "รับจากสาขาอื่น" | "ย้ายจากหลุมอื่น" | "อื่นๆ" => {
    switch (source) {
        case "PTT":
            return "รับจากปตท";
        case "Branch":
            return "รับจากสาขาอื่น";
        case "Other":
            return "อื่นๆ";
        default:
            return "อื่นๆ";
    }
};
import {
    Droplet,
    Plus,
    Search,
    Filter,
    Clock,
    Eye,
    FileText,
    Truck,
    Download,
    X,
    Save,
    BookOpen,
    AlertTriangle,
    MapPin,
    ChevronUp,
    ChevronDown,
    ChevronsUpDown,
    Check
} from "lucide-react";
import { mockOilReceipts } from "@/data/gasStationReceipts";
import { logActivity } from "@/types/gasStationActivity";

// Mock data สำหรับ Transport Delivery (เพื่อดูว่ารถกำลังส่งที่ไหน)
// ในระบบจริงควรดึงจาก API หรือ shared data
const mockTransportDeliveries = [
    {
        transportNo: "TR-20241215-001",
        truckPlateNumber: "กก 1111",
        status: "กำลังขนส่ง" as const,
        destinationBranchNames: ["ดินดำ", "หนองจิก"],
    },
    {
        transportNo: "TR-20241215-002",
        truckPlateNumber: "กก 2222",
        status: "กำลังขนส่ง" as const,
        destinationBranchNames: ["ตักสิลา"],
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

// Interface สำหรับบันทึกน้ำมันลงหลุม (local type - ใช้ในไฟล์นี้เท่านั้น)
interface TankEntryRecordLocal {
    id: string;
    entryDate: string;
    entryTime: string;
    branchId?: number; // สาขาเจ้าของข้อมูล
    receiptNo?: string; // เชื่อมกับใบรับน้ำมัน (ถ้ามี)
    purchaseOrderNo?: string; // เชื่อมกับ PO (ถ้ามี)
    transportNo?: string; // เชื่อมกับรอบส่ง (ถ้ามี)
    source: "PTT" | "Branch" | "Other"; // ต้นทาง
    sourceBranchName?: string; // ชื่อสาขาต้นทาง (ถ้าเป็น Branch)
    
    // ข้อมูลรถและคนขับ
    truckLicensePlate?: string;
    driverName?: string;
    
    // ข้อมูลคนเอาน้ำมันลงหลุม
    operatorName?: string; // ชื่อคนที่เอาน้ำมันลงหลุม
    
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
interface IncorrectTankEntry extends TankEntryRecordLocal {
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
const mockTankEntryRecords: TankEntryRecordLocal[] = [
    {
        id: "TE-001",
        entryDate: new Date().toISOString().split("T")[0],
        entryTime: "09:30",
        receiptNo: "REC-20241214-001",
        purchaseOrderNo: "SO-20241215-001",
        source: "PTT",
        oilType: "Premium Diesel" as OilType,
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
        oilType: "Gasohol 95" as OilType,
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
        oilType: "Gasohol 95" as OilType, // ประเภทน้ำมันที่ลงผิด
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
        truckLicensePlate: "",
        driverName: "",
        operatorName: "นายประเสริฐ ดีใจ",
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
    const { 
        oilReceipts, 
        transportDeliveries, 
        tankEntries,
        createTankEntry,
        branches,
    } = useGasStation();
    const { selectedBranches } = useBranch();
    const selectedBranchIds = useMemo(() => selectedBranches.map(id => Number(id)), [selectedBranches]);
    const location = useLocation();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");
    const [columnFilters, setColumnFilters] = useState<{
        status: string;
        source: string;
        tank: string;
        incorrect: string;
    }>({
        status: "ทั้งหมด",
        source: "ทั้งหมด",
        tank: "ทั้งหมด",
        incorrect: "ทั้งหมด"
    });
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' | null }>({ key: 'entryDate', direction: 'desc' });
    const [filterDateFrom, setFilterDateFrom] = useState<string>("");
    const [filterDateTo, setFilterDateTo] = useState<string>("");
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showIncorrectEntryModal, setShowIncorrectEntryModal] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<TankEntryRecordLocal | IncorrectTankEntry | null>(null);

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
        operatorName: "",
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
        operatorName: "",
        
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

    // State for all records (normal + incorrect) - using local type with extended properties
    const [allRecords, setAllRecords] = useState<(TankEntryRecordLocal | IncorrectTankEntry)[]>([
        ...(tankEntries.length > 0 ? tankEntries.map(te => ({
            ...te,
            receiptNo: te.oilReceiptNo,
            purchaseOrderNo: undefined,
            transportNo: te.deliveryNoteNo,
            source: te.source === "รับจากปตท" ? "PTT" as const : te.source === "รับจากสาขาอื่น" ? "Branch" as const : "Other" as const,
            truckLicensePlate: undefined,
            driverName: undefined,
            operatorName: undefined,
            tankCode: "",
            beforeDip: 0,
            afterDip: 0,
            quantityReceived: te.quantity,
            pricePerLiter: 0,
            totalAmount: 0,
            pumpCode: undefined,
            description: undefined,
            status: "completed" as const,
            recordedByName: te.recordedBy,
            approvedBy: undefined,
            approvedByName: undefined,
            approvedAt: undefined,
            createdAt: te.recordedAt,
            updatedAt: te.recordedAt,
            isIncorrect: false,
        })) : mockTankEntryRecords),
        ...(mockIncorrectEntries.map((entry) => ({
            ...entry,
            oilType: entry.wrongOilType as OilType,
        }))),
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
        const receipt = oilReceipts.find((r) => r.receiptNo === receiptNo) || mockOilReceipts.find((r) => r.receiptNo === receiptNo);
        if (receipt && receipt.items && receipt.items.length > 0) {
            // Auto-fill basic info
            setFormData((prev) => ({
                ...prev,
                receiptNo: receiptNo,
                purchaseOrderNo: receipt.purchaseOrderNo || "",
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
                purchaseOrderNo: receipt.purchaseOrderNo || "",
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

    // ฟังก์ชันหา transport delivery ที่เกี่ยวข้องกับ record
    const getTransportDelivery = (record: TankEntryRecordLocal | IncorrectTankEntry) => {
        if (!record.truckLicensePlate && !record.transportNo) return null;
        
        const allTransports = transportDeliveries.length > 0 ? transportDeliveries : mockTransportDeliveries;
        return allTransports.find((transport) => {
            const matchesTruck = record.truckLicensePlate && 
                transport.truckPlateNumber === record.truckLicensePlate;
            const matchesTransportNo = record.transportNo && 
                transport.transportNo === record.transportNo;
            
            return (matchesTruck || matchesTransportNo) && transport.status === "กำลังขนส่ง";
        }) || null;
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

    const filterOptions = useMemo(() => {
        return {
            status: ["ทั้งหมด", "draft", "completed", "cancelled"],
            source: ["ทั้งหมด", "PTT", "Branch", "Other"],
            tank: ["ทั้งหมด", ...new Set(allRecords.map(r => r.tankNumber.toString()))],
            incorrect: ["ทั้งหมด", "ปกติ", "ผิด"]
        };
    }, [allRecords]);

    // Filter records
    const filteredRecords = useMemo(() => {
        let result = allRecords.filter((record) => {
            const matchesSearch =
                record.receiptNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                record.purchaseOrderNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                record.tankCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                record.oilType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (record.isIncorrect && (record as IncorrectTankEntry).wrongTankCode?.toLowerCase().includes(searchTerm.toLowerCase()));

            const matchesGlobalBranch = selectedBranchIds.length === 0 || 
                (record.branchId ? selectedBranchIds.includes(record.branchId) : true);

            // Column Filters
            const matchesStatus = columnFilters.status === "ทั้งหมด" || record.status === columnFilters.status;
            const matchesSource = columnFilters.source === "ทั้งหมด" || record.source === columnFilters.source;
            const matchesTank = columnFilters.tank === "ทั้งหมด" || record.tankNumber.toString() === columnFilters.tank;
            
            // Filter by incorrect status
            const matchesIncorrect = 
                columnFilters.incorrect === "ทั้งหมด" || 
                (columnFilters.incorrect === "ผิด" && record.isIncorrect) ||
                (columnFilters.incorrect === "ปกติ" && !record.isIncorrect);

            const entryDate = new Date(record.entryDate);
            const matchesDate = (!filterDateFrom || entryDate >= new Date(filterDateFrom)) && 
                              (!filterDateTo || entryDate <= new Date(filterDateTo));

            return matchesSearch && matchesGlobalBranch && matchesStatus && matchesSource && matchesTank && matchesIncorrect && matchesDate;
        });

        if (sortConfig.key && sortConfig.direction) {
            result.sort((a, b) => {
                let aValue: any;
                let bValue: any;

                switch (sortConfig.key) {
                    case 'entryDate':
                        aValue = new Date(a.entryDate).getTime();
                        bValue = new Date(b.entryDate).getTime();
                        break;
                    case 'quantity':
                        aValue = a.quantity;
                        bValue = b.quantity;
                        break;
                    case 'totalAmount':
                        aValue = a.totalAmount;
                        bValue = b.totalAmount;
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
            result.sort((a, b) => new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime());
        }

        return result;
    }, [searchTerm, columnFilters, filterDateFrom, filterDateTo, allRecords, selectedBranchIds, sortConfig]);

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
               columnFilters.source !== "ทั้งหมด" || 
               columnFilters.tank !== "ทั้งหมด" ||
               columnFilters.incorrect !== "ทั้งหมด" ||
               filterDateFrom !== "" ||
               filterDateTo !== "";
    }, [columnFilters, filterDateFrom, filterDateTo]);

    const clearFilters = () => {
        setColumnFilters({
            status: "ทั้งหมด",
            source: "ทั้งหมด",
            tank: "ทั้งหมด",
            incorrect: "ทั้งหมด"
        });
        setSearchTerm("");
        setFilterDateFrom("");
        setFilterDateTo("");
    };

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

        // สร้าง Tank Entry Record (base type for context)
        const recordId = `TE-${new Date().toISOString().split("T")[0].replace(/-/g, "")}-${Date.now().toString().slice(-4)}`;
        const entryNo = `ENTRY-${new Date().toISOString().split("T")[0].replace(/-/g, "")}-${Date.now().toString().slice(-4)}`;
        const newTankEntry: TankEntryRecordType = {
            id: recordId,
            entryNo: entryNo,
            branchId: selectedBranchIds[0] || 1,
            entryDate: formData.entryDate,
            entryTime: formData.entryTime,
            tankNumber: formData.tankNumber,
            oilType: formData.oilType as OilType,
            quantity: formData.quantity,
            source: mapSourceToBaseType(formData.source),
            sourceBranchName: formData.sourceBranchName || undefined,
            sourceBranchId: undefined, // TODO: map from branch name if needed
            oilReceiptNo: formData.receiptNo || undefined,
            deliveryNoteNo: formData.transportNo || undefined,
            notes: formData.notes || undefined,
            recordedBy: "EMP-001", // TODO: ดึงจาก session
            recordedAt: new Date().toISOString(),
        };

        // บันทึกใน context
        createTankEntry(newTankEntry);

        // Create local type record with extended properties for UI
        const localRecord: TankEntryRecordLocal = {
            id: recordId,
            entryDate: formData.entryDate,
            entryTime: formData.entryTime,
            receiptNo: formData.receiptNo || undefined,
            purchaseOrderNo: formData.purchaseOrderNo || undefined,
            transportNo: formData.transportNo || undefined,
            source: formData.source,
            sourceBranchName: formData.sourceBranchName || undefined,
            truckLicensePlate: formData.truckLicensePlate || undefined,
            driverName: formData.driverName || undefined,
            operatorName: formData.operatorName || undefined,
            oilType: formData.oilType as OilType,
            tankNumber: formData.tankNumber,
            tankCode: formData.tankCode,
            quantity: formData.quantity,
            beforeDip: formData.beforeDip,
            afterDip: formData.afterDip,
            quantityReceived: formData.quantity,
            pricePerLiter: formData.pricePerLiter,
            totalAmount: totalAmount,
            pumpCode: formData.pumpCode || undefined,
            description: formData.description || undefined,
            status: "completed",
            recordedBy: "EMP-001",
            recordedByName: "นายสมศักดิ์ ใจดี",
            notes: formData.notes || undefined,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isIncorrect: false,
        };

        // Add to local records
        setAllRecords((prev) => [...prev, localRecord]);

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
                oilType: formData.oilType as OilType,
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
            operatorName: "",
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
            operatorName: "",
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
            oilType: incorrectEntryForm.wrongOilType as OilType,
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

        // Convert to TankEntryRecordType for context (only base properties)
        const entryNo = `ENTRY-${new Date().toISOString().split("T")[0].replace(/-/g, "")}-${Date.now().toString().slice(-4)}`;
        const tankEntryRecord: TankEntryRecordType = {
            id: recordId,
            entryNo: entryNo,
            branchId: selectedBranchIds[0] || 1,
            entryDate: incorrectEntryForm.entryDate,
            entryTime: incorrectEntryForm.entryTime,
            tankNumber: incorrectEntryForm.wrongTankNumber,
            oilType: incorrectEntryForm.wrongOilType as OilType,
            quantity: incorrectEntryForm.quantity,
            source: mapSourceToBaseType(incorrectEntryForm.source),
            sourceBranchName: incorrectEntryForm.sourceBranchName || undefined,
            sourceBranchId: undefined,
            oilReceiptNo: incorrectEntryForm.receiptNo || undefined,
            deliveryNoteNo: incorrectEntryForm.transportNo || undefined,
            notes: incorrectEntryForm.notes || undefined,
            recordedBy: "EMP-001",
            recordedAt: now,
        };
        
        // บันทึกใน context
        createTankEntry(tankEntryRecord);
        
        // Add to records (use the local type with extended properties)
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

    const handleViewDetail = (record: TankEntryRecordLocal | IncorrectTankEntry) => {
        setSelectedRecord(record);
        setShowDetailModal(true);
    };

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200 dark:shadow-none">
                        <Droplet className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">บันทึกน้ำมันลงหลุม</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">บันทึกรายการน้ำมันที่ลงหลุมใต้ดิน แยกตามรหัสหลุม ประเภทน้ำมัน และหัวจ่าย</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 bg-white/50 dark:bg-gray-800/50 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm backdrop-blur-sm">
                    <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        สาขาที่กำลังดู: {selectedBranches.length === 0 ? "ทั้งหมด" : selectedBranches.map(id => branches.find(b => String(b.id) === id)?.name || id).join(", ")}
                    </span>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl">
                            <BookOpen className="w-6 h-6 text-blue-500" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">บันทึกวันนี้</p>
                            <p className="text-2xl font-black text-gray-900 dark:text-white">{stats.todayCount}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{numberFormatter.format(stats.todayQuantity)} ลิตร</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-cyan-50 dark:bg-cyan-900/20 rounded-2xl">
                            <Droplet className="w-6 h-6 text-cyan-500" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">ปริมาณวันนี้</p>
                            <p className="text-2xl font-black text-gray-900 dark:text-white">{numberFormatter.format(stats.todayQuantity)}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">ลิตร</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl">
                            <FileText className="w-6 h-6 text-emerald-500" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">มูลค่าวันนี้</p>
                            <p className="text-2xl font-black text-gray-900 dark:text-white">{currencyFormatter.format(stats.todayAmount)}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">บาท</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-2xl">
                            <Clock className="w-6 h-6 text-orange-500" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">รอดำเนินการ</p>
                            <p className="text-2xl font-black text-gray-900 dark:text-white">{stats.draft}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">รายการ</p>
                        </div>
                    </div>
                </motion.div>

                {stats.incorrect > 0 && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-2xl">
                                <AlertTriangle className="w-6 h-6 text-red-500" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">ลงหลุมผิด</p>
                                <p className="text-2xl font-black text-gray-900 dark:text-white">{stats.incorrect}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">รายการ</p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Filter Bar */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="bg-white dark:bg-gray-800 p-4 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center"
            >
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="ค้นหาเลขที่ใบรับ, PO, รหัสหลุม, ประเภทน้ำมัน..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900 dark:text-white font-medium"
                    />
                </div>
                <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 dark:bg-gray-900 rounded-2xl font-bold text-sm">
                    <input type="date" value={filterDateFrom} onChange={e => setFilterDateFrom(e.target.value)} className="bg-transparent outline-none" />
                    <span className="text-gray-400">-</span>
                    <input type="date" value={filterDateTo} onChange={e => setFilterDateTo(e.target.value)} className="bg-transparent outline-none" />
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
                            {selectedBranchIds.length === 0 ? "ทุกสาขา" : `สาขาที่เลือก (${selectedBranchIds.length})`}
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black shadow-lg shadow-emerald-600/20 transition-all active:scale-95 flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        บันทึกใหม่
                    </button>
                    <button
                        onClick={() => setShowIncorrectEntryModal(true)}
                        className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl font-black shadow-lg shadow-orange-600/20 transition-all active:scale-95 flex items-center gap-2"
                    >
                        <AlertTriangle className="w-5 h-5" />
                        บันทึกการลงน้ำมันผิด
                    </button>
                </div>
            </motion.div>

            {/* Records Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden"
            >
                {filteredRecords.length === 0 ? (
                    <div className="p-12 text-center">
                        <BookOpen className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400 text-lg">ไม่พบรายการบันทึก</p>
                        <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
                            {isAnyFilterActive
                                ? "ลองเปลี่ยนเงื่อนไขการค้นหาหรือกรอง"
                                : "คลิก 'บันทึกใหม่' เพื่อเริ่มต้น"}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-sm">
                            <thead>
                                <tr className="bg-gray-50/50 dark:bg-gray-900/50 text-[10px] uppercase tracking-widest font-black text-gray-400">
                                    <HeaderWithFilter 
                                        label="วันที่/เวลา" 
                                        columnKey="entryDate" 
                                    />
                                    <HeaderWithFilter 
                                        label="รหัสหลุม" 
                                        columnKey="tankCode" 
                                        filterKey="tank"
                                        options={filterOptions.tank}
                                    />
                                    <th className="px-6 py-4">ประเภทน้ำมัน</th>
                                    <th 
                                        className="px-6 py-4 text-right cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                        onClick={() => handleSort('quantity')}
                                    >
                                        <div className="flex items-center justify-end gap-2">
                                            จำนวน (ลิตร)
                                            {getSortIcon('quantity')}
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-right">ยอดก่อน/หลัง</th>
                                    <HeaderWithFilter 
                                        label="ต้นทาง" 
                                        columnKey="source" 
                                        filterKey="source"
                                        options={filterOptions.source}
                                    />
                                    <th className="px-6 py-4">ใบรับ/PO</th>
                                    <th className="px-6 py-4">รถ</th>
                                    <th className="px-6 py-4">กำลังส่งที่</th>
                                    <th className="px-6 py-4">หัวจ่าย</th>
                                    <HeaderWithFilter 
                                        label="สถานะ" 
                                        columnKey="status" 
                                        filterKey="status"
                                        options={filterOptions.status}
                                    />
                                    <th className="px-6 py-4 text-center">การดำเนินการ</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700 font-medium">
                                {filteredRecords.map((record, index) => {
                                    const isIncorrect = record.isIncorrect;
                                    const incorrectEntry = isIncorrect ? (record as IncorrectTankEntry) : null;
                                    
                                    return (
                                        <motion.tr
                                            key={record.id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ duration: 0.3, delay: index * 0.05 }}
                                            className={`group hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors ${
                                                isIncorrect 
                                                    ? "bg-red-50/50 dark:bg-red-900/10 border-l-4 border-red-500" 
                                                    : ""
                                            }`}
                                        >
                                            {/* วันที่/เวลา */}
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-gray-900 dark:text-white">{record.entryDate}</span>
                                                    <span className="text-[10px] text-gray-400">{record.entryTime}</span>
                                                </div>
                                            </td>

                                            {/* รหัสหลุม */}
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-2">
                                                    {isIncorrect && (
                                                        <AlertTriangle className="w-4 h-4 text-red-500" />
                                                    )}
                                                    <div>
                                                        <div className={`font-semibold ${
                                                            isIncorrect 
                                                                ? "text-red-700 dark:text-red-400" 
                                                                : "text-gray-800 dark:text-white"
                                                        }`}>
                                                            {isIncorrect && incorrectEntry?.wrongTankCode
                                                                ? incorrectEntry.wrongTankCode
                                                                : record.tankCode}
                                                        </div>
                                                        {isIncorrect && incorrectEntry?.correctTankCode && (
                                                            <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                                                                ควร: {incorrectEntry.correctTankCode}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>

                                            {/* ประเภทน้ำมัน */}
                                            <td className="py-3 px-4">
                                                <div>
                                                    <div className={`font-medium ${
                                                        isIncorrect 
                                                            ? "text-red-700 dark:text-red-400" 
                                                            : "text-gray-800 dark:text-white"
                                                    }`}>
                                                        {isIncorrect && incorrectEntry?.wrongOilType
                                                            ? incorrectEntry.wrongOilType
                                                            : record.oilType}
                                                    </div>
                                                    {isIncorrect && incorrectEntry?.correctOilType && (
                                                        <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                                                            ควร: {incorrectEntry.correctOilType}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>

                                            {/* จำนวน (ลิตร) */}
                                            <td className="py-3 px-4 text-right">
                                                <div className="font-semibold text-gray-800 dark:text-white">
                                                    {numberFormatter.format(record.quantity)}
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                    {currencyFormatter.format(record.totalAmount)}
                                                </div>
                                            </td>

                                            {/* ยอดก่อน/หลัง */}
                                            <td className="py-3 px-4 text-right">
                                                <div className="text-xs">
                                                    <div className="text-gray-600 dark:text-gray-400">
                                                        ก่อน: {numberFormatter.format(record.beforeDip)}
                                                    </div>
                                                    <div className="text-gray-600 dark:text-gray-400">
                                                        หลัง: {numberFormatter.format(record.afterDip)}
                                                    </div>
                                                </div>
                                            </td>

                                            {/* ต้นทาง */}
                                            <td className="py-3 px-4">
                                                <span className="text-xs font-semibold px-2 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                                    {getSourceText(record.source)}
                                                </span>
                                                {record.source === "Branch" && record.sourceBranchName && (
                                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                        {record.sourceBranchName}
                                                    </div>
                                                )}
                                            </td>

                                            {/* ใบรับ/PO */}
                                            <td className="py-3 px-4">
                                                <div className="text-xs space-y-1">
                                                    {record.receiptNo && (
                                                        <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                                            <FileText className="w-3 h-3" />
                                                            {record.receiptNo}
                                                        </div>
                                                    )}
                                                    {record.purchaseOrderNo && (
                                                        <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                                            <FileText className="w-3 h-3" />
                                                            PO: {record.purchaseOrderNo}
                                                        </div>
                                                    )}
                                                    {!record.receiptNo && !record.purchaseOrderNo && (
                                                        <span className="text-gray-400 dark:text-gray-500">-</span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* รถ */}
                                            <td className="py-3 px-4">
                                                {record.truckLicensePlate ? (
                                                    <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                                                        <Truck className="w-3 h-3" />
                                                        {record.truckLicensePlate}
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400 dark:text-gray-500 text-xs">-</span>
                                                )}
                                            </td>

                                            {/* กำลังส่งที่ */}
                                            <td className="py-3 px-4">
                                                {(() => {
                                                    const transport = getTransportDelivery(record);
                                                    if (transport && transport.destinationBranchNames.length > 0) {
                                                        return (
                                                            <div className="space-y-1">
                                                                <div className="flex items-center gap-1 text-xs text-orange-600 dark:text-orange-400 font-medium">
                                                                    <MapPin className="w-3 h-3" />
                                                                    กำลังส่ง
                                                                </div>
                                                                <div className="flex flex-wrap gap-1">
                                                                    {transport.destinationBranchNames.map((branch, idx) => (
                                                                        <span
                                                                            key={idx}
                                                                            className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                                                                        >
                                                                            {branch}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        );
                                                    }
                                                    return <span className="text-gray-400 dark:text-gray-500 text-xs">-</span>;
                                                })()}
                                            </td>

                                            {/* หัวจ่าย */}
                                            <td className="py-3 px-4">
                                                {record.pumpCode ? (
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-800 dark:text-white">
                                                            {record.pumpCode}
                                                        </div>
                                                        {record.description && (
                                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                                {record.description}
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400 dark:text-gray-500 text-xs">-</span>
                                                )}
                                            </td>

                                            {/* สถานะ */}
                                            <td className="py-3 px-4 text-center">
                                                <div className="flex flex-col items-center gap-1">
                                                    <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${getStatusColor(record.status)}`}>
                                                        {getStatusText(record.status)}
                                                    </span>
                                                    {isIncorrect && (
                                                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-500 text-white">
                                                            ⚠️ ลงหลุมผิด
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* การดำเนินการ */}
                                            <td className="py-3 px-4 text-center">
                                                <div className="flex justify-center">
                                                    <TableActionMenu
                                                        actions={[
                                                            {
                                                                label: "ดูรายละเอียด",
                                                                icon: Eye,
                                                                onClick: () => handleViewDetail(record),
                                                            }
                                                        ]}
                                                    />
                                                </div>
                                            </td>
                                        </motion.tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </motion.div>

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
                                className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
                            >
                                {/* Header */}
                                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-emerald-50 dark:bg-emerald-900/20">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-emerald-500 rounded-xl">
                                            <Plus className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-black text-emerald-800 dark:text-emerald-400">บันทึกน้ำมันลงหลุม</h2>
                                            <p className="text-xs text-emerald-600 dark:text-emerald-500 font-bold">
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
                                        className="p-2 hover:bg-white dark:hover:bg-gray-700 rounded-full transition-colors"
                                    >
                                        <X className="w-5 h-5 text-gray-400" />
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
                                                        placeholder="เช่น ดินดำ, หนองจิก"
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
                                                    {(oilReceipts.length > 0 ? oilReceipts : mockOilReceipts)
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
                                            {formData.receiptNo && (oilReceipts.length > 0 ? oilReceipts : mockOilReceipts).find((r) => r.receiptNo === formData.receiptNo) && (
                                                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                                                    <h5 className="text-sm font-semibold text-green-900 dark:text-green-300 mb-3">
                                                        รายการน้ำมันที่รับมา ({(oilReceipts.length > 0 ? oilReceipts : mockOilReceipts).find((r) => r.receiptNo === formData.receiptNo)?.items.length || 0} รายการ)
                                                    </h5>
                                                    <div className="space-y-2">
                                                        {(oilReceipts.length > 0 ? oilReceipts : mockOilReceipts)
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

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    คนเอาน้ำมันลงหลุม
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.operatorName}
                                                    onChange={(e) =>
                                                        setFormData({ ...formData, operatorName: e.target.value })
                                                    }
                                                    placeholder="นายสมศักดิ์ ใจดี"
                                                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 text-gray-800 dark:text-white"
                                                />
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
                                <div className="p-6 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center sticky bottom-0 z-10">
                                    <div className="text-sm text-gray-600 dark:text-gray-400 font-bold">
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
                                            className="px-10 py-3 bg-gray-900 dark:bg-gray-700 hover:bg-black dark:hover:bg-gray-600 text-white rounded-2xl font-black transition-all shadow-lg active:scale-95"
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
                                                className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-2xl font-black transition-all shadow-lg active:scale-95"
                                            >
                                                ข้ามรายการนี้
                                            </button>
                                        )}
                                        <button
                                            onClick={handleSave}
                                            className="px-10 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black transition-all shadow-lg shadow-emerald-600/20 active:scale-95 flex items-center justify-center gap-2"
                                        >
                                            <Save className="w-5 h-5" />
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
                                className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
                            >
                                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-emerald-50 dark:bg-emerald-900/20">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-xl ${
                                            selectedRecord.isIncorrect 
                                                ? "bg-red-500" 
                                                : "bg-emerald-500"
                                        }`}>
                                            {selectedRecord.isIncorrect ? (
                                                <AlertTriangle className="w-6 h-6 text-white" />
                                            ) : (
                                                <Eye className="w-6 h-6 text-white" />
                                            )}
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-black text-emerald-800 dark:text-emerald-400">
                                                {selectedRecord.isIncorrect 
                                                    ? "รายละเอียดการลงน้ำมันผิด" 
                                                    : "รายละเอียดการบันทึกน้ำมันลงหลุม"
                                                }
                                            </h2>
                                            <p className="text-xs text-emerald-600 dark:text-emerald-500 font-bold">
                                                {selectedRecord.isIncorrect && (selectedRecord as IncorrectTankEntry).wrongTankCode
                                                    ? `${(selectedRecord as IncorrectTankEntry).wrongTankCode} - ${(selectedRecord as IncorrectTankEntry).wrongOilType} ❌`
                                                    : `${selectedRecord.tankCode} - ${selectedRecord.oilType}`
                                                }
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setShowDetailModal(false)}
                                        className="p-2 hover:bg-white dark:hover:bg-gray-700 rounded-full transition-colors"
                                        aria-label="ปิด"
                                    >
                                        <X className="w-5 h-5 text-gray-400" />
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
                                        {(selectedRecord.truckLicensePlate || selectedRecord.driverName || selectedRecord.operatorName) && (
                                            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                                                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 font-semibold">ข้อมูลรถและผู้ปฏิบัติงาน</p>
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
                                                    {selectedRecord.operatorName && (
                                                        <div className="col-span-2">
                                                            <span className="text-gray-600 dark:text-gray-400">คนเอาน้ำมันลงหลุม:</span>
                                                            <span className="ml-2 font-semibold text-gray-800 dark:text-white">
                                                                {selectedRecord.operatorName}
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
                                <div className="p-6 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3 sticky bottom-0 z-10">
                                    <button
                                        onClick={() => setShowDetailModal(false)}
                                        className="px-10 py-3 bg-gray-900 dark:bg-gray-700 hover:bg-black dark:hover:bg-gray-600 text-white rounded-2xl font-black transition-all shadow-lg active:scale-95"
                                    >
                                        ปิดหน้าต่าง
                                    </button>
                                    <button className="px-10 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black transition-all shadow-lg shadow-emerald-600/20 active:scale-95 flex items-center justify-center gap-2">
                                        <Download className="w-5 h-5" />
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
                                className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
                            >
                                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-orange-50 dark:bg-orange-900/20">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-orange-500 rounded-xl">
                                            <AlertTriangle className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-black text-orange-800 dark:text-orange-400">บันทึกการลงน้ำมันผิด</h2>
                                            <p className="text-xs text-orange-600 dark:text-orange-500 font-bold">บันทึกรายการที่ลงน้ำมันผิดหลุมหรือผิดประเภท</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setShowIncorrectEntryModal(false)}
                                        className="p-2 hover:bg-white dark:hover:bg-gray-700 rounded-full transition-colors"
                                        aria-label="ปิด"
                                    >
                                        <X className="w-5 h-5 text-gray-400" />
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
                                <div className="p-6 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3 sticky bottom-0 z-10">
                                    <button
                                        onClick={() => {
                                            setShowIncorrectEntryModal(false);
                                            resetIncorrectEntryForm();
                                        }}
                                        className="px-10 py-3 bg-gray-900 dark:bg-gray-700 hover:bg-black dark:hover:bg-gray-600 text-white rounded-2xl font-black transition-all shadow-lg active:scale-95"
                                    >
                                        ยกเลิก
                                    </button>
                                    <button
                                        onClick={handleSaveIncorrectEntry}
                                        className="px-10 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl font-black transition-all shadow-lg shadow-orange-600/20 active:scale-95 flex items-center justify-center gap-2"
                                    >
                                        <AlertTriangle className="w-5 h-5" />
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
