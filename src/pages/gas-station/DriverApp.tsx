import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGasStation } from "@/contexts/GasStationContext";
import type { DriverJob as DriverJobType, OilType } from "@/types/gasStation";
import {
    Truck,
    MapPin,
    Camera,
    CheckCircle,
    Navigation,
    Droplet,
    Building2,
    ChevronRight,
    ArrowLeft,
    X,
    Play,
    GripVertical,
    FileText,
    ShoppingCart,
    Lightbulb,
    Check,
} from "lucide-react";
import DriverBottomNav from "@/components/DriverBottomNav";

const numberFormatter = new Intl.NumberFormat("th-TH", {
    maximumFractionDigits: 0,
});

// Interface สำหรับงานที่ต้องทำ
interface DriverJob {
    id: string;
    transportNo: string;
    transportDate: string;
    transportTime: string;
    orderType: "internal" | "external"; // ประเภทเที่ยว: ภายในปั๊ม หรือ รับจาก PTT
    // สำหรับ Internal Transport
    internalOrderNo?: string; // เลขที่ออเดอร์ภายในปั๊ม
    // สำหรับ External Transport (PTT)
    purchaseOrderNo?: string; // เลขที่ใบสั่งซื้อ
    pttQuotationNo?: string; // เลขที่ใบเสนอราคาจาก PTT
    sourceBranchId: number;
    sourceBranchName: string;
    sourceAddress: string;
    destinationBranches: Array<{
        branchId: number;
        branchName: string;
        address: string;
        oilType: OilType;
        quantity: number;
        status: "รอส่ง" | "กำลังส่ง" | "ส่งแล้ว";
        deliveryConfirmation?: {
            confirmedAt: string;
            photos: string[];
            odometerReading: number;
            notes?: string;
        };
    }>;
    compartments: Array<{
        id: string;
        compartmentNumber: number;
        capacity: number;
        oilType?: OilType;
        quantity?: number;
        destinationBranchId?: number;
        destinationBranchName?: string;
    }>;
    truckPlateNumber: string;
    trailerPlateNumber: string;
    driverName?: string; // ชื่อคนขับ
    status: "รอเริ่ม" | "ออกเดินทางแล้ว" | "รับน้ำมันแล้ว" | "จัดเรียงเส้นทางแล้ว" | "กำลังส่ง" | "ส่งเสร็จ";
    routeOrder?: number[]; // ลำดับการส่ง (branchId)
    startTrip?: {
        startedAt: string;
        startOdometer: number;
        startOdometerPhoto?: string;
        startFuel?: number; // น้ำมันตอนเริ่มต้น
    };
    pickupConfirmation?: {
        confirmedAt: string;
        photos: string[];
        odometerReading: number;
        notes?: string;
    };
    warehouseConfirmation?: {
        confirmedAt: string;
        warehouseNo: string;
        depotDocumentNo?: string;
        photos: string[];
        notes?: string;
    };
    depotArrival?: {
        arrivedAt: string;
        endOdometer: number;
        endOdometerPhoto?: string;
        notes?: string;
    };
    createdAt?: string;
    createdBy?: string;
}

// Mock data - งานของคนขับ
const mockDriverJobs: DriverJob[] = [
    {
        id: "JOB-001",
        transportNo: "TP-20241215-001",
        transportDate: "2024-12-15",
        transportTime: "08:00",
        orderType: "external", // รับจาก PTT
        purchaseOrderNo: "SO-20241215-001",
        pttQuotationNo: "QT-20241215-001",
        sourceBranchId: 1,
        sourceBranchName: "ปั๊มไฮโซ",
        sourceAddress: "100 ถนนเพชรบุรี กรุงเทพมหานคร 10400",
        destinationBranches: [
            {
                branchId: 2,
                branchName: "ดินดำ",
                address: "456 ถนนพหลโยธิน กรุงเทพมหานคร 10400",
                oilType: "Premium Diesel",
                quantity: 22000,
                status: "ส่งแล้ว",
                deliveryConfirmation: {
                    confirmedAt: "2024-12-15T10:30:00+07:00",
                    photos: [
                        "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
                        "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80"
                    ],
                    odometerReading: 123456,
                    notes: "ส่งน้ำมันเรียบร้อย ไม่มีปัญหา"
                }
            },
            {
                branchId: 3,
                branchName: "หนองจิก",
                address: "789 ถนนรัชดาภิเษก กรุงเทพมหานคร 10320",
                oilType: "Diesel",
                quantity: 20000,
                status: "ส่งแล้ว",
                deliveryConfirmation: {
                    confirmedAt: "2024-12-15T11:00:00+07:00",
                    photos: [
                        "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80"
                    ],
                    odometerReading: 123789,
                    notes: "ส่งน้ำมันครบถ้วน"
                }
            },
            {
                branchId: 4,
                branchName: "ตักสิลา",
                address: "123 ถนนสุขุมวิท กรุงเทพมหานคร 10110",
                oilType: "Premium Gasohol 95",
                quantity: 15000,
                status: "รอส่ง",
            },
        ],
        compartments: [
            { id: "1", compartmentNumber: 1, capacity: 3000, oilType: "Premium Diesel", quantity: 3000, destinationBranchId: 2, destinationBranchName: "ดินดำ" },
            { id: "2", compartmentNumber: 2, capacity: 7000, oilType: "Premium Diesel", quantity: 7000, destinationBranchId: 2, destinationBranchName: "ดินดำ" },
            { id: "3", compartmentNumber: 3, capacity: 12000, oilType: "Premium Diesel", quantity: 12000, destinationBranchId: 2, destinationBranchName: "ดินดำ" },
            { id: "4", compartmentNumber: 4, capacity: 20000, oilType: "Diesel", quantity: 20000, destinationBranchId: 3, destinationBranchName: "หนองจิก" },
            { id: "5", compartmentNumber: 5, capacity: 15000, oilType: "Premium Gasohol 95", quantity: 15000, destinationBranchId: 4, destinationBranchName: "ตักสิลา" },
        ],
        truckPlateNumber: "กก 1111",
        trailerPlateNumber: "กข 1234",
        driverName: "สมศักดิ์ ขับรถ",
        status: "กำลังส่ง",
        startTrip: {
            startedAt: "2024-12-15T08:00:00+07:00",
            startOdometer: 123000,
            startOdometerPhoto: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80"
        },
        pickupConfirmation: {
            confirmedAt: "2024-12-15T09:00:00+07:00",
            photos: [
                "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80"
            ],
            odometerReading: 123100,
            notes: "รับน้ำมันครบถัง"
        }
    },
    // Internal Transport Order (ส่งภายในปั๊ม)
    {
        id: "JOB-002",
        transportNo: "IT-20241216-001",
        transportDate: "2024-12-16",
        transportTime: "09:00",
        orderType: "internal", // ส่งภายในปั๊ม
        internalOrderNo: "IO-20241215-002",
        sourceBranchId: 1,
        sourceBranchName: "ปั๊มไฮโซ",
        sourceAddress: "100 ถนนเพชรบุรี กรุงเทพมหานคร 10400",
        destinationBranches: [
            {
                branchId: 3,
                branchName: "หนองจิก",
                address: "789 ถนนรัชดาภิเษก กรุงเทพมหานคร 10320",
                oilType: "Diesel",
                quantity: 4000,
                status: "รอส่ง",
            },
        ],
        compartments: [
            { id: "1", compartmentNumber: 1, capacity: 4000, oilType: "Diesel", quantity: 4000, destinationBranchId: 3, destinationBranchName: "หนองจิก" },
        ],
        truckPlateNumber: "กก 2222",
        trailerPlateNumber: "กข 2345",
        driverName: "สมชาย ขับรถ",
        status: "รอเริ่ม",
        createdAt: "2024-12-16T09:00:00+07:00",
        createdBy: "ระบบ",
    },
];

type Step = "start-trip" | "warehouse-confirm" | "pickup-oil" | "route-planning" | "delivery" | "arrive-depot" | "completed";

export default function DriverApp() {
    const { allDriverJobs, updateDriverJob, createDriverJob } = useGasStation();
    // Use DriverBottomNav hook-like behavior or just render it
    const [selectedJob, setSelectedJob] = useState<DriverJobType | null>(null);
    const [currentStep, setCurrentStep] = useState<Step>("start-trip");
    const [currentDeliveryIndex, setCurrentDeliveryIndex] = useState(0);
    const [routeOrder, setRouteOrder] = useState<number[]>([]); // ลำดับการส่ง
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null); // สำหรับ drag and drop
    const [viewingJobDetail, setViewingJobDetail] = useState<DriverJobType | null>(null); // สำหรับดูรายละเอียดรอบส่ง

    // Form states for Step 1: Start Trip
    // ... rest of the component

    // Form states for Step 1: Start Trip
    const [startOdometer, setStartOdometer] = useState("");
    const [startOdometerPhoto, setStartOdometerPhoto] = useState("");

    // Form states for Step 2: Warehouse Confirm (confirm PO / warehouse no)
    const [warehouseNo, setWarehouseNo] = useState("519895412");
    const [warehousePhotos, setWarehousePhotos] = useState<string[]>([]);
    const [warehouseNotes, setWarehouseNotes] = useState("");

    // Form states for Step 3: Pickup Oil
    const [pickupPhotos, setPickupPhotos] = useState<string[]>([]);
    // Specific photos for Step 3
    const [taxInvoicePhotos, setTaxInvoicePhotos] = useState<string[]>([]);
    const [deliveryNotePhotos, setDeliveryNotePhotos] = useState<string[]>([]);
    const [transportManifestPhotos, setTransportManifestPhotos] = useState<string[]>([]);
    const [warehouseTransferPhotos, setWarehouseTransferPhotos] = useState<string[]>([]);
    const [pickupOdometer, setPickupOdometer] = useState("");
    const [pickupNotes, setPickupNotes] = useState("");

    // Form states for Step 4: Delivery
    const [deliveryPhotos, setDeliveryPhotos] = useState<string[]>([]);
    const [deliveryOdometer, setDeliveryOdometer] = useState("");
    const [deliveryNotes, setDeliveryNotes] = useState("");

    // Form states for Step 5: Arrive Depot
    const [depotOdometer, setDepotOdometer] = useState("");
    const [depotOdometerPhoto, setDepotOdometerPhoto] = useState("");
    const [depotNotes, setDepotNotes] = useState("");

    // New Sub-step State: Arrive Branch
    const [isArrivedAtBranch, setIsArrivedAtBranch] = useState(false);

    // Fuel states
    const [startFuel, setStartFuel] = useState("");
    const [depotFuel, setDepotFuel] = useState("");

    // Initialize mock data to context if empty
    useEffect(() => {
        if (allDriverJobs.length === 0 && mockDriverJobs.length > 0) {
            mockDriverJobs.forEach((job) => {
                createDriverJob({
                    ...job,
                    destinationBranches: job.destinationBranches.map((b) => ({
                        ...b,
                        oilType: b.oilType as DriverJobType["destinationBranches"][0]["oilType"],
                    })),
                    compartments: job.compartments.map((c) => ({
                        id: c.id || `comp-${c.compartmentNumber}`,
                        compartmentNumber: c.compartmentNumber,
                        capacity: c.capacity,
                        oilType: c.oilType ? (c.oilType as DriverJobType["compartments"][0]["oilType"]) : undefined,
                        quantity: c.quantity,
                        destinationBranchId: c.destinationBranchId,
                        destinationBranchName: c.destinationBranchName,
                    })),
                    createdAt: job.createdAt || new Date().toISOString(),
                    createdBy: job.createdBy || "ระบบ",
                });
            });
        }
    }, [allDriverJobs.length, createDriverJob]);


    // Separate completed and active jobs - ใช้ข้อมูลจาก context โดยตรง (allDriverJobs คือข้อมูลดิบไม่ผ่านฟิลเตอร์สาขาจาก navbar)
    const allJobs = allDriverJobs;

    // Lookup PO (PurchaseOrder) for an external job, then expose approveNo/contractNo/orderNo for display
    // const getPurchaseOrderMeta = (job: DriverJobType) => { ... };

    // Filter jobs - แสดงเพียงรายการเดียว (ล่าสุด) ตามคำขอของผู้ใช้
    const filteredJobs = useMemo(() => {
        // กรองเอาเฉพาะงานที่ยังไม่เสร็จหรือกำลังดำเนินการ เพื่อแสดงเป็น "รอบส่งปัจจุบัน"
        const sorted = [...allJobs].sort((a, b) => {
            const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return timeB - timeA;
        });
        
        // กรองเอางานที่ 'รอเริ่ม', 'ออกเดินทางแล้ว', 'รับน้ำมันแล้ว', 'จัดเรียงเส้นทางแล้ว', 'กำลังส่ง'
        return sorted.filter(job => job.status !== "ส่งเสร็จ").slice(0, 1);
    }, [allJobs]);

    const handleSelectJob = (job: DriverJobType) => {
        setSelectedJob(job);
        // Initialize route order if not set
        if (!job.routeOrder || job.routeOrder.length === 0) {
            const defaultOrder = job.destinationBranches.map((b) => b.branchId);
            setRouteOrder(defaultOrder);
        } else {
            setRouteOrder(job.routeOrder);
        }
        // Initialize startTrip info if exists, otherwise set defaults for "automatic" display
        if (job.startTrip) {
            setStartOdometer(job.startTrip.startOdometer.toString());
            setStartFuel(job.startTrip.startFuel?.toString() || "");
        } else {
            // "Automatic" default values based on screenshot
            setStartOdometer("125500"); 
            setStartFuel("450");
        }

        // Initialize depot info if exists
        if (job.depotArrival) {
            setDepotOdometer(job.depotArrival.endOdometer.toString());
            setDepotFuel(job.depotArrival.endFuel?.toString() || "");
        }

        // Determine current step based on job status
        if (job.status === "รอเริ่ม") {
            setCurrentStep("start-trip");
        } else if (job.status === "ออกเดินทางแล้ว") {
            // New step before pickup oil
            setCurrentStep(job.warehouseConfirmation ? "pickup-oil" : "warehouse-confirm");
        } else if (job.status === "รับน้ำมันแล้ว") {
            setCurrentStep("route-planning");
        } else if (job.status === "จัดเรียงเส้นทางแล้ว") {
            setCurrentStep("delivery");
            // Find first branch that hasn't been delivered based on route order
            const orderedBranches = getOrderedBranches(job);
            const firstPendingIndex = orderedBranches.findIndex((b) => b.status !== "ส่งแล้ว");
            setCurrentDeliveryIndex(firstPendingIndex >= 0 ? firstPendingIndex : 0);
        } else if (job.status === "กำลังส่ง") {
            setCurrentStep("delivery");
            const orderedBranches = getOrderedBranches(job);
            const firstPendingIndex = orderedBranches.findIndex((b) => b.status !== "ส่งแล้ว");
            setCurrentDeliveryIndex(firstPendingIndex >= 0 ? firstPendingIndex : 0);
        }
        // Reset form states
        resetFormStates();
    };

    // Get branches in route order
    const getOrderedBranches = (job: DriverJobType) => {
        if (!job.routeOrder || job.routeOrder.length === 0) {
            return job.destinationBranches;
        }
        return job.routeOrder.map((branchId) => job.destinationBranches.find((b) => b.branchId === branchId)!).filter(Boolean);
    };

    const resetFormStates = () => {
        setStartOdometer("");
        setStartOdometerPhoto("");
        setWarehouseNo("519895412");
        setWarehousePhotos([]);
        setWarehouseNotes("");
        setWarehouseNotes("");
        setPickupPhotos([]);
        setTaxInvoicePhotos([]);
        setDeliveryNotePhotos([]);
        setTransportManifestPhotos([]);
        setWarehouseTransferPhotos([]);
        setPickupOdometer("");
        setPickupNotes("");
        setDeliveryPhotos([]);
        setDeliveryOdometer("");
        setDeliveryNotes("");
        setDepotOdometer("");
        setDepotOdometerPhoto("");
        setDepotNotes("");
        // Reset fuel states
        setStartFuel("");
        setDepotFuel("");
        // Reset sub-step arrive branch
        setIsArrivedAtBranch(false);
    };

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, setPhotos: React.Dispatch<React.SetStateAction<string[]>>) => {
        const files = e.target.files;
        if (files) {
            Array.from(files).forEach((file) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPhotos((prev: string[]) => [...prev, reader.result as string]);
                };
                reader.readAsDataURL(file);
            });
        }
    };

    const handleRemovePhoto = (index: number, photos: string[], setPhotos: (photos: string[]) => void) => {
        setPhotos(photos.filter((_, i) => i !== index));
    };

    // Function to go back to previous step
    const handleGoBack = () => {
        if (!selectedJob) return;

        switch (currentStep) {
            case "warehouse-confirm": {
                // Go back to start-trip
                setCurrentStep("start-trip");
                // Load existing data if available
                if (selectedJob.startTrip) {
                    setStartOdometer(selectedJob.startTrip.startOdometer.toString());
                    if (selectedJob.startTrip.startOdometerPhoto) {
                        setStartOdometerPhoto(selectedJob.startTrip.startOdometerPhoto);
                    }
                }
                break;
            }
            case "pickup-oil": {
                // Go back to warehouse-confirm
                setCurrentStep("warehouse-confirm");
                if (selectedJob.warehouseConfirmation) {
                    setWarehouseNo(selectedJob.warehouseConfirmation.warehouseNo);
                    setWarehousePhotos(selectedJob.warehouseConfirmation.photos);
                    setWarehouseNotes(selectedJob.warehouseConfirmation.notes || "");
                }
                break;
            }
            case "route-planning": {
                // Go back to pickup-oil
                setCurrentStep("pickup-oil");
                // Load existing data if available
                if (selectedJob.pickupConfirmation) {
                    setPickupPhotos(selectedJob.pickupConfirmation.photos);
                    setPickupOdometer(selectedJob.pickupConfirmation.odometerReading.toString());
                    if (selectedJob.pickupConfirmation.notes) {
                        setPickupNotes(selectedJob.pickupConfirmation.notes);
                    }
                }
                break;
            }
            case "delivery": {
                // Go back to route-planning
                setCurrentStep("route-planning");
                break;
            }
            case "arrive-depot": {
                // Go back to delivery
                setCurrentStep("delivery");
                break;
            }
            case "completed": {
                // Go back to arrive-depot
                setCurrentStep("arrive-depot");
                // Load existing data if available
                if (selectedJob.depotArrival) {
                    setDepotOdometer(selectedJob.depotArrival.endOdometer?.toString() || "");
                    if (selectedJob.depotArrival.endOdometerPhoto) {
                        setDepotOdometerPhoto(selectedJob.depotArrival.endOdometerPhoto);
                    }
                    if (selectedJob.depotArrival.notes) {
                        setDepotNotes(selectedJob.depotArrival.notes);
                    }
                }
                break;
            }
            default:
                break;
        }
    };

    // Step 1: Start Trip
    const handleStartTrip = () => {
        if (!selectedJob) return;
        if (!startOdometer) {
            alert("กรุณากรอกเลขไมล์เริ่มต้น");
            return;
        }

        const updatedJob = {
            ...selectedJob,
            status: "ออกเดินทางแล้ว" as const,
            startTrip: {
                startedAt: new Date().toISOString(),
                startOdometer: parseFloat(startOdometer),
                startOdometerPhoto: startOdometerPhoto || undefined,
                startFuel: startFuel ? parseFloat(startFuel) : undefined,
            },
        };

        // อัปเดตใน context
        updateDriverJob(selectedJob.id, {
            ...updatedJob,
            destinationBranches: updatedJob.destinationBranches.map((b) => ({
                ...b,
                oilType: b.oilType as DriverJobType["destinationBranches"][0]["oilType"],
            })),
            compartments: updatedJob.compartments?.map((c) => ({
                ...c,
                oilType: c.oilType ? (c.oilType as DriverJobType["compartments"][0]["oilType"]) : undefined,
            })),
        });
        setSelectedJob(updatedJob);
        setCurrentStep("warehouse-confirm");
        resetFormStates();
    };

    // Step 2: Warehouse Confirm (confirm PO / warehouse no)
    const handleConfirmWarehouse = () => {
        if (!selectedJob) return;
        if (!warehouseNo.trim()) {
            alert("กรุณากรอกเลขที่คลัง");
            return;
        }
        if (warehousePhotos.length === 0) {
            alert("กรุณาถ่ายรูปหลักฐานอย่างน้อย 1 รูป");
            return;
        }

        const updatedJob = {
            ...selectedJob,
            // Keep status as 'ออกเดินทางแล้ว' (still en route) but record confirmation
            status: "ออกเดินทางแล้ว" as const,
            warehouseConfirmation: {
                confirmedAt: new Date().toISOString(),
                warehouseNo: warehouseNo.trim(),
                photos: warehousePhotos,
                notes: warehouseNotes || undefined,
            },
        };

        updateDriverJob(selectedJob.id, {
            ...updatedJob,
            destinationBranches: updatedJob.destinationBranches.map((b) => ({
                ...b,
                oilType: b.oilType as DriverJobType["destinationBranches"][0]["oilType"],
            })),
            compartments: updatedJob.compartments?.map((c) => ({
                ...c,
                oilType: c.oilType ? (c.oilType as DriverJobType["compartments"][0]["oilType"]) : undefined,
            })),
        });
        setSelectedJob(updatedJob);
        setCurrentStep("pickup-oil");
        resetFormStates();
    };

    // Step 2: Pickup Oil
    const handleConfirmPickup = () => {
        if (!selectedJob) return;
        
        // Aggregate all photos
        const allPhotos = [
            ...taxInvoicePhotos,
            ...deliveryNotePhotos,
            ...transportManifestPhotos,
            ...warehouseTransferPhotos
        ];

        // Ensure at least one photo is uploaded across all categories
        if (allPhotos.length === 0) {
            alert("กรุณาถ่ายรูปเอกสารอย่างน้อย 1 รายการ");
            return;
        }

        // Update main pickupPhotos state (though it might not be used directly in UI anymore, useful for data submission logic if it relies on it)
        setPickupPhotos(allPhotos);

        // Or we can just use allPhotos for the update logic below
        const photosToSave = allPhotos.length > 0 ? allPhotos : pickupPhotos; 

        if (photosToSave.length === 0) {
             alert("กรุณาถ่ายรูปเอกสารอย่างน้อย 1 รายการ");
             return;
        }
        if (!pickupOdometer) {
            alert("กรุณากรอกเลขไมล์");
            return;
        }

        const updatedJob = {
            ...selectedJob,
            status: "รับน้ำมันแล้ว" as const,
            pickupConfirmation: {
                confirmedAt: new Date().toISOString(),
                photos: pickupPhotos,
                odometerReading: parseFloat(pickupOdometer),
                notes: pickupNotes || undefined,
            },
        };

        // อัปเดตใน context
        updateDriverJob(selectedJob.id, {
            ...updatedJob,
            destinationBranches: updatedJob.destinationBranches.map((b) => ({
                ...b,
                oilType: b.oilType as DriverJobType["destinationBranches"][0]["oilType"],
            })),
            compartments: updatedJob.compartments?.map((c) => ({
                ...c,
                oilType: c.oilType ? (c.oilType as DriverJobType["compartments"][0]["oilType"]) : undefined,
            })),
        });
        setSelectedJob(updatedJob);
        setCurrentStep("route-planning");
        resetFormStates();
    };

    // Step 3: Route Planning
    const handleDragStart = (index: number) => {
        setDraggedIndex(index);
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === index) return;

        const newOrder = [...routeOrder];
        const draggedItem = newOrder[draggedIndex];
        newOrder.splice(draggedIndex, 1);
        newOrder.splice(index, 0, draggedItem);
        setRouteOrder(newOrder);
        setDraggedIndex(index);
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
    };


    const handleConfirmRoutePlanning = () => {
        if (!selectedJob) return;
        const updatedJob = {
            ...selectedJob,
            status: "จัดเรียงเส้นทางแล้ว" as const,
            routeOrder: routeOrder,
        };
        // อัปเดตใน context
        updateDriverJob(selectedJob.id, {
            ...updatedJob,
            destinationBranches: updatedJob.destinationBranches.map((b) => ({
                ...b,
                oilType: b.oilType as DriverJobType["destinationBranches"][0]["oilType"],
            })),
            compartments: updatedJob.compartments?.map((c) => ({
                ...c,
                oilType: c.oilType ? (c.oilType as DriverJobType["compartments"][0]["oilType"]) : undefined,
            })),
        });
        setSelectedJob(updatedJob);
        setCurrentStep("delivery");
        setSelectedJob(updatedJob);
        setCurrentStep("delivery");
        setCurrentDeliveryIndex(0);
        setIsArrivedAtBranch(false); // Reset arrival for first branch
    };

    // Sub-step: Arrive at Branch
    const handleConfirmArrivalAtBranch = () => {
        if (!selectedJob) return;
        
        const orderedBranches = getOrderedBranches(selectedJob);
        const currentBranch = orderedBranches[currentDeliveryIndex];

        // Save arrival time to context
        const updatedBranches = selectedJob.destinationBranches.map(b => 
            b.branchId === currentBranch.branchId 
            ? { ...b, arrivalConfirmation: { confirmedAt: new Date().toISOString() } }
            : b
        );

        const updatedJob = {
            ...selectedJob,
            destinationBranches: updatedBranches,
        };

        updateDriverJob(selectedJob.id, updatedJob);
        setSelectedJob(updatedJob);
        setIsArrivedAtBranch(true);
    };

    // Step 4: Delivery
    const handleConfirmDelivery = () => {
        if (!selectedJob) return;
        if (deliveryPhotos.length === 0) {
            alert("กรุณาถ่ายรูปหลักฐานการส่งน้ำมันอย่างน้อย 1 รูป");
            return;
        }
        if (!deliveryOdometer) {
            alert("กรุณากรอกเลขไมล์");
            return;
        }

        const orderedBranches = getOrderedBranches(selectedJob);
        const currentBranch = orderedBranches[currentDeliveryIndex];

        // Update the branch in the original array
        const updatedBranches = selectedJob.destinationBranches.map((b) =>
            b.branchId === currentBranch.branchId
                ? {
                    ...b,
                    status: "ส่งแล้ว" as const,
                    deliveryConfirmation: {
                        confirmedAt: new Date().toISOString(),
                        photos: deliveryPhotos,
                        odometerReading: parseFloat(deliveryOdometer),
                        notes: deliveryNotes || undefined,
                    },
                }
                : b
        );

        // Check if all branches are delivered
        const allDelivered = updatedBranches.every((b) => b.status === "ส่งแล้ว");
        const newStatus = allDelivered ? ("ส่งเสร็จ" as const) : ("กำลังส่ง" as const);

        const updatedJob = {
            ...selectedJob,
            destinationBranches: updatedBranches,
            status: newStatus,
        };

        // อัปเดตใน context
        updateDriverJob(selectedJob.id, {
            ...updatedJob,
            destinationBranches: updatedJob.destinationBranches.map((b) => ({
                ...b,
                oilType: b.oilType as DriverJobType["destinationBranches"][0]["oilType"],
            })),
            compartments: updatedJob.compartments?.map((c) => ({
                ...c,
                oilType: c.oilType ? (c.oilType as DriverJobType["compartments"][0]["oilType"]) : undefined,
            })),
        });
        setSelectedJob(updatedJob);

        if (allDelivered) {
            // Update status to "ส่งเสร็จ" when all branches are delivered
            const finalUpdatedJob = {
                ...updatedJob,
                status: "ส่งเสร็จ" as const,
            };
            updateDriverJob(selectedJob.id, {
                ...finalUpdatedJob,
                destinationBranches: finalUpdatedJob.destinationBranches.map((b) => ({
                    ...b,
                    oilType: b.oilType as DriverJobType["destinationBranches"][0]["oilType"],
                })),
                compartments: finalUpdatedJob.compartments?.map((c) => ({
                    ...c,
                    oilType: c.oilType ? (c.oilType as DriverJobType["compartments"][0]["oilType"]) : undefined,
                })),
            });
            setSelectedJob(finalUpdatedJob);
            setCurrentStep("arrive-depot");
            resetFormStates();
        } else {
            // Move to next branch based on route order
            const orderedBranches = getOrderedBranches(updatedJob);
            const nextIndex = orderedBranches.findIndex((b) => b.status !== "ส่งแล้ว");
            if (nextIndex >= 0) {
                setCurrentDeliveryIndex(nextIndex);
                setCurrentDeliveryIndex(nextIndex);
                resetFormStates();
                setIsArrivedAtBranch(false); // Reset for next branch
            }
        }
    };

    // Step 5: Arrive Depot
    const handleConfirmArriveDepot = () => {
        if (!selectedJob) return;
        if (!depotOdometer) {
            alert("กรุณากรอกเลขไมล์เมื่อถึงโรงจอด");
            return;
        }

        const updatedJob = {
            ...selectedJob,
            status: "ส่งเสร็จ" as const,
            depotArrival: {
                arrivedAt: new Date().toISOString(),
                endOdometer: parseFloat(depotOdometer),
                endOdometerPhoto: depotOdometerPhoto || undefined,
                endFuel: depotFuel ? parseFloat(depotFuel) : undefined,
                notes: depotNotes || undefined,
            },
        };

        // อัปเดตใน context
        updateDriverJob(selectedJob.id, {
            ...updatedJob,
            destinationBranches: updatedJob.destinationBranches.map((b) => ({
                ...b,
                oilType: b.oilType as DriverJobType["destinationBranches"][0]["oilType"],
            })),
            compartments: updatedJob.compartments?.map((c) => ({
                ...c,
                oilType: c.oilType ? (c.oilType as DriverJobType["compartments"][0]["oilType"]) : undefined,
            })),
        });
        setSelectedJob(updatedJob);
        setCurrentStep("completed");
        resetFormStates();
    };

    const getSteps = () => {
        if (!selectedJob) return [];
        const steps = [
            { id: "start-trip", label: "เริ่มงาน (ไมล์)", completed: selectedJob.status !== "รอเริ่ม" },
            { id: "warehouse-confirm", label: "ยืนยันรับน้ำมัน", completed: !!selectedJob.warehouseConfirmation },
            { id: "pickup-oil", label: "รับน้ำมัน", completed: selectedJob.status !== "รอเริ่ม" && selectedJob.status !== "ออกเดินทางแล้ว" && !!selectedJob.warehouseConfirmation },
            { id: "route-planning", label: "จัดเรียงเส้นทาง", completed: selectedJob.status !== "รอเริ่ม" && selectedJob.status !== "ออกเดินทางแล้ว" && selectedJob.status !== "รับน้ำมันแล้ว" },
            { id: "delivery", label: "ส่งน้ำมัน", completed: false },
            { id: "arrive-depot", label: "จบงาน (ไมล์)", completed: (selectedJob as any).depotArrival ? true : false },
            { id: "completed", label: "เสร็จสิ้น", completed: selectedJob.status === "ส่งเสร็จ" && (selectedJob as any).depotArrival ? true : false },
        ];
        return steps;
    };


    const renderStartTrip = () => (
        <motion.div
            key="start-trip"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
        >
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">
                    ขั้นตอนที่ 1: ออกเดินทาง
                </h2>

                <div className={`mb-6 p-4 border rounded-lg ${selectedJob?.orderType === "internal"
                    ? "bg-purple-50 dark:bg-purple-900/10 border-purple-200 dark:border-purple-800"
                    : "bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800"
                    }`}>
                    <div className="flex items-center gap-2 mb-3">
                        {(selectedJob as any).orderType === "internal" && (
                            <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full text-xs font-semibold">
                                ภายในปั๊ม
                            </span>
                        )}
                        {(selectedJob as any).orderType === "external" && (
                            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-xs font-semibold">
                                รับจาก PTT
                            </span>
                        )}
                        {(selectedJob as any).internalOrderNo && (
                            <span className="px-2 py-1 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-full text-xs">
                                ออเดอร์: {(selectedJob as any).internalOrderNo}
                            </span>
                        )}
                        {(selectedJob as any).purchaseOrderNo && (
                            <span className="px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full text-xs">
                                PO: {(selectedJob as any).purchaseOrderNo}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-3 mb-3">
                        <MapPin className={`h-5 w-5 ${(selectedJob as any).orderType === "internal"
                            ? "text-purple-600 dark:text-purple-400"
                            : "text-blue-600 dark:text-blue-400"
                            }`} />
                        <div>
                            <p className={`font-semibold ${(selectedJob as any).orderType === "internal"
                                ? "text-purple-800 dark:text-purple-300"
                                : "text-blue-800 dark:text-blue-300"
                                }`}>
                                ต้นทาง: {selectedJob?.sourceBranchName}
                            </p>
                            <p className={`text-sm ${(selectedJob as any).orderType === "internal"
                                ? "text-purple-700 dark:text-purple-400"
                                : "text-blue-700 dark:text-blue-400"
                                }`}>
                                {selectedJob?.sourceAddress}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Building2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                        <div>
                            <p className="font-semibold text-green-800 dark:text-green-300">
                                ปลายทาง: {selectedJob?.destinationBranches.length} สาขา
                            </p>
                            <p className="text-sm text-green-700 dark:text-green-400">
                                {selectedJob?.destinationBranches.map((b) => b.branchName).join(", ")}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                            เลขไมล์ปัจจุบัน (กม.) - แก้ไขได้ *
                        </label>
                        <input
                            type="number"
                            value={startOdometer}
                            onChange={(e) => setStartOdometer(e.target.value)}
                            placeholder="125500"
                            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all shadow-sm"
                        />
                        <div className="mt-2 flex items-center gap-1 text-[10px] text-green-600 dark:text-green-400 font-semibold bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-lg w-fit">
                            <Check className="w-3 h-3" />
                            ดึงมาจากใบสั่งซื้อ: {numberFormatter.format(Number(startOdometer || 125500))} กม. (แก้ไขได้)
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1.5">
                            <Droplet className="w-3.5 h-3.5 text-blue-500 fill-blue-500/20" />
                            น้ำมันตอนเริ่มต้น (ลิตร) *
                        </label>
                        <input
                            type="number"
                            value={startFuel}
                            onChange={(e) => setStartFuel(e.target.value)}
                            placeholder="450"
                            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all shadow-sm"
                        />
                        <div className="mt-2 flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400 font-semibold bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-lg w-fit">
                            <Lightbulb className="w-3 h-3" />
                            บันทึกจำนวนน้ำมันในถังรถขนส่งตอนเริ่มต้นเที่ยว
                        </div>
                    </div>
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        📷 ถ่ายรูปไมล์เริ่มต้น (ถ้ามี)
                    </label>
                    <div className="flex items-center gap-4">
                        {startOdometerPhoto ? (
                            <div className="relative group">
                                <img
                                    src={startOdometerPhoto}
                                    alt="ไมล์เริ่มต้น"
                                    className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200 dark:border-gray-700"
                                />
                                <button
                                    onClick={() => setStartOdometerPhoto("")}
                                    className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        ) : (
                            <label className="cursor-pointer">
                                <div className="w-32 h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-blue-500 dark:hover:border-blue-400 transition-colors">
                                    <Camera className="h-8 w-8 text-gray-400" />
                                    <span className="text-xs text-gray-500 dark:text-gray-400">เพิ่มรูป</span>
                                </div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            const reader = new FileReader();
                                            reader.onloadend = () => {
                                                setStartOdometerPhoto(reader.result as string);
                                            };
                                            reader.readAsDataURL(file);
                                        }
                                    }}
                                    className="hidden"
                                />
                            </label>
                        )}
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={handleStartTrip}
                        className="flex-1 px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-lg transition-colors flex items-center justify-center gap-2"
                    >
                        <Play className="h-6 w-6" />
                        ออกเดินทาง
                    </button>
                </div>
            </div>
        </motion.div>
    );

    const renderWarehouseConfirm = () => (
        <motion.div
            key="warehouse-confirm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
        >
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={handleGoBack}
                        className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold transition-colors hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center gap-2"
                    >
                        <ChevronRight className="h-5 w-5 rotate-180" />
                        กลับ
                    </button>
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                        ขั้นตอนที่ 2: ยืนยันการรับน้ำมัน
                    </h2>
                    <div className="w-24"></div>
                </div>

                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="flex items-start gap-3">
                        <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-1">
                                ยืนยันออเดอร์ก่อนเข้ารับน้ำมัน
                            </p>
                            <p className="text-xs text-blue-700 dark:text-blue-400">
                                กรุณากรอก “เลขใบอนุมัติขาย” และถ่ายรูปหลักฐาน เพื่อยืนยันออเดอร์ที่จะไปรับ
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        🏷️ เลขใบอนุมัติขาย *
                    </label>
                    <input
                        type="text"
                        value={warehouseNo}
                        readOnly
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed focus:outline-none"
                    />
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                        📷 ถ่ายรูปหลักฐาน * (อย่างน้อย 1 รูป)
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                        {warehousePhotos.map((photo, index) => (
                            <div key={index} className="relative group">
                                <img
                                    src={photo}
                                    alt={`หลักฐานคลัง ${index + 1}`}
                                    className="w-full h-32 object-cover rounded-lg border-2 border-gray-200 dark:border-gray-700"
                                />
                                <button
                                    onClick={() => handleRemovePhoto(index, warehousePhotos, setWarehousePhotos)}
                                    className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        ))}
                        {warehousePhotos.length < 6 && (
                            <label className="cursor-pointer">
                                <div className="w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-blue-500 dark:hover:border-blue-400 transition-colors">
                                    <Camera className="h-8 w-8 text-gray-400" />
                                    <span className="text-xs text-gray-500 dark:text-gray-400">เพิ่มรูป</span>
                                </div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={(e) => handlePhotoUpload(e, setWarehousePhotos)}
                                    className="hidden"
                                />
                            </label>
                        )}
                    </div>
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        📝 หมายเหตุ (ถ้ามี)
                    </label>
                    <textarea
                        value={warehouseNotes}
                        onChange={(e) => setWarehouseNotes(e.target.value)}
                        placeholder="กรอกหมายเหตุเพิ่มเติม..."
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                <button
                    onClick={handleConfirmWarehouse}
                    className="w-full px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-lg transition-colors flex items-center justify-center gap-2"
                >
                    <CheckCircle className="h-6 w-6" />
                    ยืนยันออเดอร์
                </button>
            </div>
        </motion.div>
    );

    const renderPickupOil = () => (
        <motion.div
            key="pickup-oil"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
        >
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={handleGoBack}
                        className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold transition-colors hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center gap-2"
                    >
                        <ChevronRight className="h-5 w-5 rotate-180" />
                        กลับ
                    </button>
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                        ขั้นตอนที่ 3: รับน้ำมัน
                    </h2>
                    <div className="w-24"></div>
                </div>
                {/* ... existing pickup logic ... */}
                <div className="mb-6">
                <div className="space-y-6 mb-6">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        📷 ถ่ายรูปเอกสาร (เลือกถ่ายหัวข้อที่เกี่ยวข้อง) *
                    </h3>
                    
                    {/* 1. Tax Invoice / Invoice */}
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="w-2 h-2 bg-blue-500 rounded-full" />
                            <span className="text-sm font-medium text-gray-900 dark:text-white">ใบกำกับภาษี / ใบแจ้งหนี้</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {taxInvoicePhotos.map((photo, index) => (
                                <div key={index} className="relative group aspect-square">
                                    <img src={photo} alt="Tax Invoice" className="w-full h-full object-cover rounded-lg border dark:border-gray-600" />
                                    <button onClick={() => handleRemovePhoto(index, taxInvoicePhotos, setTaxInvoicePhotos)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                            ))}
                            {/* Simple Add Button */}
                             <label className="cursor-pointer aspect-square border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex flex-col items-center justify-center hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors">
                                <Camera className="h-6 w-6 text-gray-400" />
                                <span className="text-[10px] text-gray-500 mt-1">เพิ่มรูป</span>
                                <input type="file" accept="image/*" multiple onChange={(e) => handlePhotoUpload(e, setTaxInvoicePhotos)} className="hidden" />
                            </label>
                        </div>
                    </div>

                    {/* 2. Delivery Note */}
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="w-2 h-2 bg-blue-500 rounded-full" />
                             <span className="text-sm font-medium text-gray-900 dark:text-white">ใบส่งของ</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                             {deliveryNotePhotos.map((photo, index) => (
                                <div key={index} className="relative group aspect-square">
                                    <img src={photo} alt="Delivery Note" className="w-full h-full object-cover rounded-lg border dark:border-gray-600" />
                                    <button onClick={() => handleRemovePhoto(index, deliveryNotePhotos, setDeliveryNotePhotos)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                            ))}
                             <label className="cursor-pointer aspect-square border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex flex-col items-center justify-center hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors">
                                <Camera className="h-6 w-6 text-gray-400" />
                                <span className="text-[10px] text-gray-500 mt-1">เพิ่มรูป</span>
                                <input type="file" accept="image/*" multiple onChange={(e) => handlePhotoUpload(e, setDeliveryNotePhotos)} className="hidden" />
                            </label>
                        </div>
                    </div>

                    {/* 3. Transport Manifest */}
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
                         <div className="flex items-center gap-2 mb-3">
                            <span className="w-2 h-2 bg-blue-500 rounded-full" />
                             <span className="text-sm font-medium text-gray-900 dark:text-white">ใบกำกับการขนส่ง</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                             {transportManifestPhotos.map((photo, index) => (
                                <div key={index} className="relative group aspect-square">
                                    <img src={photo} alt="Manifest" className="w-full h-full object-cover rounded-lg border dark:border-gray-600" />
                                    <button onClick={() => handleRemovePhoto(index, transportManifestPhotos, setTransportManifestPhotos)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                            ))}
                             <label className="cursor-pointer aspect-square border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex flex-col items-center justify-center hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors">
                                <Camera className="h-6 w-6 text-gray-400" />
                                <span className="text-[10px] text-gray-500 mt-1">เพิ่มรูป</span>
                                <input type="file" accept="image/*" multiple onChange={(e) => handlePhotoUpload(e, setTransportManifestPhotos)} className="hidden" />
                            </label>
                        </div>
                    </div>

                    {/* 4. Warehouse Transfer */}
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="w-2 h-2 bg-blue-500 rounded-full" />
                             <span className="text-sm font-medium text-gray-900 dark:text-white">เอกสารโอนคลัง</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                             {warehouseTransferPhotos.map((photo, index) => (
                                <div key={index} className="relative group aspect-square">
                                    <img src={photo} alt="Transfer" className="w-full h-full object-cover rounded-lg border dark:border-gray-600" />
                                    <button onClick={() => handleRemovePhoto(index, warehouseTransferPhotos, setWarehouseTransferPhotos)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                            ))}
                             <label className="cursor-pointer aspect-square border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex flex-col items-center justify-center hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors">
                                <Camera className="h-6 w-6 text-gray-400" />
                                <span className="text-[10px] text-gray-500 mt-1">เพิ่มรูป</span>
                                <input type="file" accept="image/*" multiple onChange={(e) => handlePhotoUpload(e, setWarehouseTransferPhotos)} className="hidden" />
                            </label>
                        </div>
                    </div>
                </div>
                </div>
                <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        📏 เลขไมล์หลังรับน้ำมัน *
                    </label>
                    <input
                        type="number"
                        value={pickupOdometer}
                        onChange={(e) => setPickupOdometer(e.target.value)}
                        placeholder="กรอกเลขไมล์"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
                <button
                    onClick={handleConfirmPickup}
                    className="w-full px-6 py-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold text-lg transition-colors flex items-center justify-center gap-2"
                >
                    <CheckCircle className="h-6 w-6" />
                    ยืนยันการรับน้ำมัน
                </button>
            </div>
        </motion.div>
    );

    const renderRoutePlanning = () => (
        <motion.div
            key="route-planning"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
        >
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                 <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={handleGoBack}
                        className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold transition-colors hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center gap-2"
                    >
                        <ChevronRight className="h-5 w-5 rotate-180" />
                        กลับ
                    </button>
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                        ขั้นตอนที่ 4: จัดเรียงเส้นทาง
                    </h2>
                    <div className="w-24"></div>
                </div>
                <div className="space-y-3 mb-6">
                    {routeOrder.map((branchId, index) => {
                        const branch = selectedJob?.destinationBranches.find((b) => b.branchId === branchId);
                        if (!branch) return null;
                        return (
                            <div
                                key={branchId}
                                draggable
                                onDragStart={() => handleDragStart(index)}
                                onDragOver={(e) => handleDragOver(e, index)}
                                onDragEnd={handleDragEnd}
                                className={`p-4 border-2 rounded-lg transition-all cursor-move ${draggedIndex === index
                                    ? "border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20 opacity-50"
                                    : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 hover:border-blue-500 dark:hover:border-blue-400"
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="flex-shrink-0 cursor-grab active:cursor-grabbing">
                                        <GripVertical className="h-6 w-6 text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors" />
                                    </div>
                                    <div className="flex-shrink-0">
                                        <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                            <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                                {index + 1}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-gray-800 dark:text-white">
                                            {branch.branchName}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                            {branch.address}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
                <button
                    onClick={handleConfirmRoutePlanning}
                    disabled={routeOrder.length === 0}
                    className="w-full px-6 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold text-lg transition-colors flex items-center justify-center gap-2"
                >
                    <CheckCircle className="h-6 w-6" />
                    ยืนยันเส้นทาง
                </button>
            </div>
        </motion.div>
    );

    const renderArriveAtBranch = (branch: any) => (
        <motion.div
            key="arrive-branch"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
        >
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-center">
                    <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={handleGoBack}
                        className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold transition-colors hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center gap-2"
                    >
                        <ChevronRight className="h-5 w-5 rotate-180" />
                        กลับ
                    </button>
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                        ยืนยันการถึงปั๊ม
                    </h2>
                    <div className="w-24"></div>
                </div>

                <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                    <div className="absolute inset-0 border-4 border-blue-500 rounded-full animate-ping opacity-20"></div>
                    <MapPin className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    คุณถึงปั๊ม "{branch.branchName}" แล้วใช่ไหม?
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-8">
                    {branch.address}
                </p>

                <button
                    onClick={handleConfirmArrivalAtBranch}
                    className="w-full px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
                >
                    <CheckCircle className="h-6 w-6" />
                    ยืนยันถึงปั๊มแล้ว
                </button>
            </div>
        </motion.div>
    );

    const renderDelivery = () => {
        const orderedBranches = selectedJob ? getOrderedBranches(selectedJob) : [];
        const currentBranch = orderedBranches[currentDeliveryIndex];
        if (!currentBranch) return null;

        // Condition check: Arrive First?
        const isArrived = isArrivedAtBranch || !!currentBranch.arrivalConfirmation;
        if (!isArrived) {
            return renderArriveAtBranch(currentBranch);
        }

        return (
            <motion.div
                key={`delivery-${currentDeliveryIndex}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
            >
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <button
                            onClick={handleGoBack}
                            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold transition-colors hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center gap-2"
                        >
                            <ChevronRight className="h-5 w-5 rotate-180" />
                            กลับ
                        </button>
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                            ขั้นตอนที่ 5: ส่งน้ำมัน
                        </h2>
                        <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full text-sm font-semibold">
                            ปั๊มที่ {currentDeliveryIndex + 1} / {orderedBranches.length}
                        </span>
                    </div>

                    <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-lg">
                        <div className="flex items-center gap-3 mb-3">
                            <Building2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                            <div>
                                <p className="font-semibold text-green-800 dark:text-green-300 text-lg">
                                    {currentBranch.branchName}
                                </p>
                                <p className="text-sm text-green-700 dark:text-green-400">
                                    {currentBranch.address}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                            📷 ถ่ายรูปหลักฐาน *
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                            {deliveryPhotos.map((photo, index) => (
                                <div key={index} className="relative group">
                                    <img
                                        src={photo}
                                        alt={`หลักฐาน ${index + 1}`}
                                        className="w-full h-32 object-cover rounded-lg border-2 border-gray-200 dark:border-gray-700"
                                    />
                                    <button
                                        onClick={() => handleRemovePhoto(index, deliveryPhotos, setDeliveryPhotos)}
                                        className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}
                            <label className="cursor-pointer">
                                <div className="w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-green-500 dark:hover:border-green-400 transition-colors">
                                    <Camera className="h-8 w-8 text-gray-400" />
                                    <span className="text-xs text-gray-500 dark:text-gray-400">เพิ่มรูป</span>
                                </div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={(e) => handlePhotoUpload(e, setDeliveryPhotos)}
                                    className="hidden"
                                />
                            </label>
                        </div>
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            📏 เลขไมล์หลังส่ง *
                        </label>
                        <input
                            type="number"
                            value={deliveryOdometer}
                            onChange={(e) => setDeliveryOdometer(e.target.value)}
                            placeholder="กรอกเลขไมล์"
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                    </div>

                    <button
                        onClick={handleConfirmDelivery}
                        className="w-full px-6 py-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold text-lg transition-colors flex items-center justify-center gap-2"
                    >
                        <CheckCircle className="h-6 w-6" />
                        ยืนยันการส่ง
                    </button>
                </div>
            </motion.div>
        );
    };

    const renderArriveDepot = () => (
        <motion.div
            key="arrive-depot"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
        >
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={handleGoBack}
                        className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold transition-colors hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center gap-2"
                    >
                        <ChevronRight className="h-5 w-5 rotate-180" />
                        กลับ
                    </button>
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                        ขั้นตอนที่ 6: รถถึงโรงจอด
                    </h2>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            เลขไมล์เมื่อถึงโรงจอด (กม.) *
                        </label>
                        <input
                            type="number"
                            value={depotOdometer}
                            onChange={(e) => setDepotOdometer(e.target.value)}
                            placeholder="กรอกเลขไมล์"
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1.5">
                            <Droplet className="w-3.5 h-3.5 text-blue-500" />
                            น้ำมันเมื่อถึงโรงจอด (ลิตร) *
                        </label>
                        <input
                            type="number"
                            value={depotFuel}
                            onChange={(e) => setDepotFuel(e.target.value)}
                            placeholder="กรอกจำนวนลิตร"
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                    </div>
                </div>
                 <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        📷 ถ่ายรูปเลขไมล์ (ถ้ามี)
                    </label>
                    {depotOdometerPhoto ? (
                        <div className="relative group">
                            <img
                                src={depotOdometerPhoto}
                                alt="เลขไมล์"
                                className="w-full h-48 object-cover rounded-lg border-2 border-gray-200 dark:border-gray-700"
                            />
                            <button
                                onClick={() => setDepotOdometerPhoto("")}
                                className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    ) : (
                        <label className="cursor-pointer">
                            <div className="w-full h-48 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-blue-500">
                                <Camera className="h-12 w-12 text-gray-400" />
                                <span className="text-sm text-gray-500">ถ่ายรูปเลขไมล์</span>
                            </div>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        const reader = new FileReader();
                                        reader.onloadend = () => setDepotOdometerPhoto(reader.result as string);
                                        reader.readAsDataURL(file);
                                    }
                                }}
                                className="hidden"
                            />
                        </label>
                    )}
                </div>
                <button
                    onClick={handleConfirmArriveDepot}
                    className="w-full px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-lg transition-colors flex items-center justify-center gap-2"
                >
                    <CheckCircle className="h-6 w-6" />
                    ยืนยันเสร็จสิ้น
                </button>
            </div>
        </motion.div>
    );

    const renderCompleted = () => (
        <motion.div
            key="completed"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
        >
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-center">
                 <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                    🎉 เสร็จสิ้นภาระกิจ!
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                    ส่งน้ำมันครบทุกปั๊มและกลับถึงโรงจอดเรียบร้อยแล้ว
                </p>
                <button
                    onClick={() => {
                        setSelectedJob(null);
                        resetFormStates();
                    }}
                    className="w-full px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-lg transition-colors"
                >
                    กลับไปเลือกงานใหม่
                </button>
            </div>
        </motion.div>
    );

    // Job Detail View
    if (viewingJobDetail) {
        const job = viewingJobDetail;
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans pb-24">
                <div className="max-w-4xl mx-auto px-4 py-8">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <div className="flex items-center justify-between mb-8">
                             <div className="flex-1">
                                <div className="flex items-center gap-4 mb-3">
                                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                                        <Truck className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div>
                                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white leading-none">
                                            รายละเอียดรอบส่ง
                                        </h1>
                                    </div>
                                    {job.orderType === "internal" && (
                                        <span className="px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full text-sm font-semibold flex items-center gap-1.5">
                                            <ShoppingCart className="w-4 h-4" />
                                            รอบส่งภายในปั๊ม
                                        </span>
                                    )}
                                    {job.orderType === "external" && (
                                        <span className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-sm font-semibold flex items-center gap-1.5">
                                            <Truck className="w-4 h-4" />
                                            รอบส่งจาก PTT
                                        </span>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={() => setViewingJobDetail(null)}
                                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            >
                                กลับ
                            </button>
                        </div>

                        {/* Job Info */}
                        <div className={`mb-6 p-4 border rounded-lg ${job.orderType === "internal"
                            ? "bg-purple-50 dark:bg-purple-900/10 border-purple-200 dark:border-purple-800"
                            : "bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800"
                            }`}>
                            <div className="flex items-center gap-2 mb-3">
                                <h2 className="text-lg font-bold text-gray-800 dark:text-white">{job.transportNo}</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-gray-500 dark:text-gray-400 mb-1">วันที่</p>
                                    <p className="font-semibold text-gray-800 dark:text-white">
                                        {new Date(job.transportDate).toLocaleDateString("th-TH", {
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                        })}{" "}
                                        เวลา {job.transportTime}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-gray-500 dark:text-gray-400 mb-1">รถ</p>
                                    <p className="font-semibold text-gray-800 dark:text-white">
                                        {job.truckPlateNumber} / {job.trailerPlateNumber}
                                    </p>
                                </div>
                            </div>
                        </div>

                       {/* Destinations */}
                       <div className="space-y-4">
                           <h3 className="font-bold text-gray-800 dark:text-white">รายการส่ง ({job.destinationBranches.length} สาขา)</h3>
                           {job.destinationBranches.map((branch, index) => (
                               <div key={index} className="p-4 border border-gray-100 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                                   <div className="flex justify-between mb-2">
                                       <span className="font-bold">{branch.branchName}</span>
                                       <span className={`text-xs px-2 py-0.5 rounded-full ${branch.status === "ส่งแล้ว" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                                           {branch.status}
                                       </span>
                                   </div>
                               </div>
                           ))}
                       </div>
                    </div>
                </div>
                 <DriverBottomNav />
            </div>
        );
    }

    if (!selectedJob) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24 font-sans">
                <div className="p-5 space-y-6">
                    {/* Page Title Section per screenshot */}
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400">
                            <Truck className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 dark:text-white">แอปคนขับ</h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400">ระบบจัดการงานขนส่ง</p>
                        </div>
                    </div>

                    <motion.div
                        key="job-list"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-4"
                    >
                        {filteredJobs.length === 0 ? (
                             <div className="text-center py-10 text-gray-500">ไม่พบงาน</div>
                        ) : (
                            filteredJobs.map((job) => {
                                return (
                                    <div
                                        key={job.id}
                                        className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.08)] border border-gray-100 dark:border-gray-700 relative overflow-hidden"
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <p className="text-gray-500 text-sm mb-1">รอบส่งปัจจุบัน</p>
                                                <h3 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
                                                    {job.transportNo}
                                                </h3>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${job.status === "กำลังส่ง" ? "bg-blue-50 text-blue-600" :
                                                job.status === "ส่งเสร็จ" ? "bg-emerald-50 text-emerald-600" :
                                                    "bg-gray-100 text-gray-600"
                                                }`}>
                                                {job.status === "กำลังส่ง" ? "กำลังดำเนินการ" : job.status}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-8 mb-6">
                                            <div>
                                                <p className="text-xs text-gray-400 mb-1">ทะเบียนรถ</p>
                                                <p className="font-bold text-gray-800 dark:text-gray-200">{job.truckPlateNumber}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-400 mb-1">หางรอ</p>
                                                <p className="font-bold text-gray-800 dark:text-gray-200">{job.trailerPlateNumber}</p>
                                            </div>
                                        </div>

                                        <div className="space-y-6 relative pl-2">
                                            {/* Connecting Line */}
                                            <div className="absolute left-[11px] top-2 bottom-8 w-0.5 bg-gray-200 dark:bg-gray-700" />

                                            <div className="relative flex items-start gap-4">
                                                <div className="w-6 h-6 rounded-full bg-blue-500 border-4 border-white dark:border-gray-800 shadow-sm z-10 flex items-center justify-center shrink-0">
                                                    <MapPin className="w-3 h-3 text-white" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-400 mb-0.5">ต้นทาง</p>
                                                    <p className="font-bold text-gray-900 dark:text-white">{job.sourceBranchName}</p>
                                                </div>
                                            </div>

                                            <div className="relative flex items-start gap-4">
                                                <div className="w-6 h-6 rounded-full bg-emerald-500 border-4 border-white dark:border-gray-800 shadow-sm z-10 flex items-center justify-center shrink-0">
                                                    <Navigation className="w-3 h-3 text-white" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-400 mb-0.5">ปลายทาง ({job.destinationBranches.length} สาขา)</p>
                                                    <p className="font-bold text-gray-900 dark:text-white">
                                                        {job.destinationBranches.map(b => b.branchName).join(", ")}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => handleSelectJob(job)}
                                            className="mt-6 w-full py-3.5 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] transition-all rounded-xl text-white font-bold text-sm shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
                                        >
                                            เริ่มดำเนินการ <ChevronRight className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={() => setViewingJobDetail(job)}
                                            className="mt-3 w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm rounded-xl"
                                        >
                                            ดูรายละเอียด
                                        </button>
                                    </div>
                                );
                            })
                        )}
                    </motion.div>
                </div>

                <DriverBottomNav />
            </div>
        );
    }

    // Main Steps View
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24 font-sans">
            {/* Header matches screenshot */}
            <div className="bg-white dark:bg-gray-800 sticky top-0 z-30 px-4 py-3 shadow-sm border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                <button
                    onClick={() => setSelectedJob(null)} 
                    className="p-2 -ml-2 text-gray-600 dark:text-gray-300 flex items-center gap-2"
                >
                    <ArrowLeft className="w-6 h-6" />
                    <span className="text-sm font-medium">กลับ</span>
                </button>
                 <div className="flex items-center gap-3">
                     <span className="font-bold text-gray-800 dark:text-white">{selectedJob.transportNo}</span>
                 </div>
                 <div className="w-10"></div> {/* Spacer */}
            </div>

            <div className="p-5 space-y-6">
                {/* Stepper */}
                <div className="w-full overflow-x-auto pb-4 mb-2 -mx-5 px-5 no-scrollbar">
                    <div className="flex items-center justify-between min-w-[700px]">
                        {getSteps().map((step, index) => {
                            const steps = getSteps();
                            const currentIdx = steps.findIndex(s => s.id === currentStep);
                            const isCompleted = index < currentIdx;
                            const isCurrent = index === currentIdx;
                            
                            return (
                                <div key={step.id} className="flex-1 flex flex-col items-center relative">
                                    {/* Line */}
                                    {index < steps.length - 1 && (
                                        <div className={`absolute top-4 left-1/2 w-full h-[2px] ${
                                            index < currentIdx ? "bg-green-500" : "bg-gray-200 dark:bg-gray-700"
                                        }`} />
                                    )}
                                    
                                    {/* Circle */}
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center relative z-10 text-xs font-bold transition-all duration-300 border-2 ${
                                        isCompleted 
                                            ? "bg-green-500 border-green-500 text-white"
                                            : isCurrent
                                                ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/30 scale-110"
                                                : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400"
                                    }`}>
                                        {isCompleted ? <CheckCircle className="w-5 h-5" /> : index + 1}
                                    </div>

                                    {/* Label */}
                                    <span className={`text-[10px] mt-2 font-medium transition-colors duration-300 ${
                                        isCompleted
                                            ? "text-green-600 dark:text-green-400"
                                            : isCurrent
                                                ? "text-blue-600 dark:text-blue-400"
                                                : "text-gray-400"
                                    }`}>
                                        {step.label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
                <AnimatePresence mode="wait">
                    {currentStep === "start-trip" && renderStartTrip()}
                    {currentStep === "warehouse-confirm" && renderWarehouseConfirm()}
                    {currentStep === "pickup-oil" && renderPickupOil()}
                    {currentStep === "route-planning" && renderRoutePlanning()}
                    {currentStep === "delivery" && renderDelivery()}
                    {currentStep === "arrive-depot" && renderArriveDepot()}
                    {currentStep === "completed" && renderCompleted()}
                </AnimatePresence>
            </div>
            <DriverBottomNav />
        </div>
    );
}

