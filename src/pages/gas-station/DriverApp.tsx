import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGasStation } from "@/contexts/GasStationContext";
import type { DriverJob as DriverJobType } from "@/types/gasStation";
import {
    Truck,
    Package,
    MapPin,
    Camera,
    CheckCircle,
    Navigation,
    Droplet,
    Building2,
    ChevronRight,
    X,
    AlertCircle,
    Play,
    Route,
    ArrowRight,
    GripVertical,
    MoreHorizontal,
    FileText,
    ShoppingCart,
    Search,
    Eye,
} from "lucide-react";

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
        oilType: string;
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
        oilType?: string;
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
    const { driverJobs, updateDriverJob, createDriverJob, branches, purchaseOrders } = useGasStation();
    const [selectedJob, setSelectedJob] = useState<DriverJobType | null>(null);
    const [currentStep, setCurrentStep] = useState<Step>("start-trip");
    const [currentDeliveryIndex, setCurrentDeliveryIndex] = useState(0);
    const [routeOrder, setRouteOrder] = useState<number[]>([]); // ลำดับการส่ง
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null); // สำหรับ drag and drop
    const [viewingJobDetail, setViewingJobDetail] = useState<DriverJobType | null>(null); // สำหรับดูรายละเอียดรอบส่ง
    const [searchTerm, setSearchTerm] = useState("");
    const [filterDateFrom, setFilterDateFrom] = useState<string>("");
    const [filterDateTo, setFilterDateTo] = useState<string>("");
    const [filterBranch, setFilterBranch] = useState<number | "all">("all");
    const [filterOrderType, setFilterOrderType] = useState<"all" | "internal" | "external">("all");
    const [filterStatus, setFilterStatus] = useState<"all" | "active" | "completed">("all");

    // Form states for Step 1: Start Trip
    const [startOdometer, setStartOdometer] = useState("");
    const [startOdometerPhoto, setStartOdometerPhoto] = useState("");

    // Form states for Step 2: Warehouse Confirm (confirm PO / warehouse no)
    const [warehouseNo, setWarehouseNo] = useState("");
    const [warehousePhotos, setWarehousePhotos] = useState<string[]>([]);
    const [warehouseNotes, setWarehouseNotes] = useState("");

    // Form states for Step 3: Pickup Oil
    const [pickupPhotos, setPickupPhotos] = useState<string[]>([]);
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

    // Initialize mock data to context if empty
    useEffect(() => {
        if (driverJobs.length === 0 && mockDriverJobs.length > 0) {
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
    }, [driverJobs.length, createDriverJob]);

    // Helper function to check if date is in range
    const isDateInRange = (dateStr: string, from: string, to: string) => {
        if (!from && !to) return true;
        const date = new Date(dateStr);
        const fromDate = from ? new Date(from) : null;
        const toDate = to ? new Date(to) : null;

        if (fromDate && toDate) {
            fromDate.setHours(0, 0, 0, 0);
            toDate.setHours(23, 59, 59, 999);
            return date >= fromDate && date <= toDate;
        } else if (fromDate) {
            fromDate.setHours(0, 0, 0, 0);
            return date >= fromDate;
        } else if (toDate) {
            toDate.setHours(23, 59, 59, 999);
            return date <= toDate;
        }
        return true;
    };

    // Separate completed and active jobs - ใช้ข้อมูลจาก context หรือ mock data
    const allJobs = driverJobs.length > 0 ? driverJobs : mockDriverJobs;

    // Lookup PO (PurchaseOrder) for an external job, then expose approveNo/contractNo/orderNo for display
    const getPurchaseOrderMeta = (job: DriverJobType) => {
        const poNo = job.purchaseOrderNo;
        if (!poNo) return { approveNo: undefined as string | undefined, contractNo: undefined as string | undefined, orderNo: undefined as string | undefined };

        const match = purchaseOrders.find((po) =>
            po.orderNo === poNo ||
            po.supplierOrderNo === poNo ||
            po.billNo === poNo
        );

        return {
            approveNo: match?.approveNo,
            contractNo: match?.contractNo,
            orderNo: match?.orderNo || poNo,
        };
    };

    // Filter jobs
    const filteredJobs = useMemo(() => {
        return allJobs.filter((job) => {
            const matchesSearch =
                job.transportNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                job.truckPlateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                job.driverName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                job.sourceBranchName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                job.destinationBranches.some(b => b.branchName.toLowerCase().includes(searchTerm.toLowerCase()));

            const matchesDate = isDateInRange(job.transportDate, filterDateFrom, filterDateTo);

            const matchesBranch = filterBranch === "all" ||
                job.sourceBranchId === filterBranch ||
                job.destinationBranches.some(b => b.branchId === filterBranch);

            const matchesOrderType = filterOrderType === "all" ||
                (filterOrderType === "internal" && (job as any).orderType === "internal") ||
                (filterOrderType === "external" && (job as any).orderType === "external");

            const matchesStatus = filterStatus === "all" ||
                (filterStatus === "active" && job.status !== "ส่งเสร็จ") ||
                (filterStatus === "completed" && job.status === "ส่งเสร็จ");

            return matchesSearch && matchesDate && matchesBranch && matchesOrderType && matchesStatus;
        });
    }, [allJobs, searchTerm, filterDateFrom, filterDateTo, filterBranch, filterOrderType, filterStatus]);

    const completedJobs = useMemo(() => {
        return filteredJobs.filter((job) => job.status === "ส่งเสร็จ");
    }, [filteredJobs]);

    const activeJobs = useMemo(() => {
        return filteredJobs.filter((job) => job.status !== "ส่งเสร็จ");
    }, [filteredJobs]);

    const handleSelectJob = (job: DriverJobType) => {
        setSelectedJob(job);
        // Initialize route order if not set
        if (!job.routeOrder || job.routeOrder.length === 0) {
            const defaultOrder = job.destinationBranches.map((b) => b.branchId);
            setRouteOrder(defaultOrder);
        } else {
            setRouteOrder(job.routeOrder);
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
        setWarehouseNo("");
        setWarehousePhotos([]);
        setWarehouseNotes("");
        setPickupPhotos([]);
        setPickupOdometer("");
        setPickupNotes("");
        setDeliveryPhotos([]);
        setDeliveryOdometer("");
        setDeliveryNotes("");
        setDepotOdometer("");
        setDepotOdometerPhoto("");
        setDepotNotes("");
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
                if ((selectedJob as any).depotArrival) {
                    setDepotOdometer((selectedJob as any).depotArrival.endOdometer?.toString() || "");
                    if ((selectedJob as any).depotArrival.endOdometerPhoto) {
                        setDepotOdometerPhoto((selectedJob as any).depotArrival.endOdometerPhoto);
                    }
                    if ((selectedJob as any).depotArrival.notes) {
                        setDepotNotes((selectedJob as any).depotArrival.notes);
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
        if (pickupPhotos.length === 0) {
            alert("กรุณาถ่ายรูปบิลจากคลัง ปตท อย่างน้อย 1 รูป");
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

    const handleRemoveBranch = (branchId: number) => {
        if (window.confirm("คุณต้องการลบปั๊มนี้ออกจากเส้นทางการส่งหรือไม่?")) {
            const newOrder = routeOrder.filter((id) => id !== branchId);
            setRouteOrder(newOrder);
        }
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
        setCurrentDeliveryIndex(0);
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
                resetFormStates();
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
            { id: "start-trip", label: "ออกเดินทาง", completed: selectedJob.status !== "รอเริ่ม" },
            { id: "warehouse-confirm", label: "ยืนยันออเดอร์", completed: !!selectedJob.warehouseConfirmation },
            { id: "pickup-oil", label: "รับน้ำมัน", completed: selectedJob.status !== "รอเริ่ม" && selectedJob.status !== "ออกเดินทางแล้ว" && !!selectedJob.warehouseConfirmation },
            { id: "route-planning", label: "จัดเรียงเส้นทาง", completed: selectedJob.status !== "รอเริ่ม" && selectedJob.status !== "ออกเดินทางแล้ว" && selectedJob.status !== "รับน้ำมันแล้ว" },
            { id: "delivery", label: "ส่งน้ำมัน", completed: false },
            { id: "arrive-depot", label: "รถถึงโรงจอด", completed: (selectedJob as any).depotArrival ? true : false },
            { id: "completed", label: "เสร็จสิ้น", completed: selectedJob.status === "ส่งเสร็จ" && (selectedJob as any).depotArrival ? true : false },
        ];
        return steps;
    };

    const getCurrentStepIndex = () => {
        const steps = getSteps();
        return steps.findIndex((s) => s.id === currentStep);
    };

    // Job Detail View
    if (viewingJobDetail) {
        const job = viewingJobDetail;
        const poMeta = job.orderType === "external" ? getPurchaseOrderMeta(job) : null;
        const deliveredBranches = job.destinationBranches.filter((b) => b.status === "ส่งแล้ว");
        const undeliveredBranches = job.destinationBranches.filter((b) => b.status !== "ส่งแล้ว");

        return (
            <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900">
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
                                    {(job as any).orderType === "internal" && (
                                        <span className="px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full text-sm font-semibold flex items-center gap-1.5">
                                            <ShoppingCart className="w-4 h-4" />
                                            รอบส่งภายในปั๊ม
                                        </span>
                                    )}
                                    {(job as any).orderType === "external" && (
                                        <span className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-sm font-semibold flex items-center gap-1.5">
                                            <Truck className="w-4 h-4" />
                                            รอบส่งจาก PTT
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                                    {job.orderType === "internal" && job.internalOrderNo && (
                                        <span>
                                            <span className="font-medium">ออเดอร์ภายใน:</span> {job.internalOrderNo}
                                        </span>
                                    )}
                                    {job.orderType === "external" && job.purchaseOrderNo && (
                                        <span>
                                            <span className="font-medium">ใบสั่งซื้อเลขที่:</span> {poMeta?.orderNo || job.purchaseOrderNo}
                                        </span>
                                    )}
                                    {job.orderType === "external" && poMeta?.approveNo && (
                                        <span>
                                            <span className="font-medium">ใบอนุมัติขายเลขที่:</span> {poMeta.approveNo}
                                        </span>
                                    )}
                                    {job.orderType === "external" && poMeta?.contractNo && (
                                        <span>
                                            <span className="font-medium">Contract No.:</span> {poMeta.contractNo}
                                        </span>
                                    )}
                                    {job.orderType === "external" && job.pttQuotationNo && (
                                        <span>
                                            <span className="font-medium">ใบเสนอราคา PTT:</span> {job.pttQuotationNo}
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
                        <div className={`mb-6 p-4 border rounded-lg ${(job as any).orderType === "internal"
                            ? "bg-purple-50 dark:bg-purple-900/10 border-purple-200 dark:border-purple-800"
                            : "bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800"
                            }`}>
                            <div className="flex items-center gap-2 mb-3">
                                <h2 className="text-lg font-bold text-gray-800 dark:text-white">{job.transportNo}</h2>
                                {(job as any).orderType === "internal" && (
                                    <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full text-xs font-semibold">
                                        ภายในปั๊ม
                                    </span>
                                )}
                                {(job as any).orderType === "external" && (
                                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-xs font-semibold">
                                        รับจาก PTT
                                    </span>
                                )}
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
                                <div>
                                    <p className="text-gray-500 dark:text-gray-400 mb-1">ต้นทาง</p>
                                    <p className="font-semibold text-gray-800 dark:text-white">{job.sourceBranchName}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 dark:text-gray-400 mb-1">ปลายทาง</p>
                                    <p className="font-semibold text-gray-800 dark:text-white">
                                        {job.destinationBranches.length} สาขา
                                    </p>
                                </div>
                                {(job as any).driverName && (
                                    <div>
                                        <p className="text-gray-500 dark:text-gray-400 mb-1">คนขับ</p>
                                        <p className="font-semibold text-gray-800 dark:text-white">{(job as any).driverName}</p>
                                    </div>
                                )}
                                {(job as any).orderType === "internal" && (job as any).internalOrderNo && (
                                    <div>
                                        <p className="text-gray-500 dark:text-gray-400 mb-1">เลขที่ออเดอร์ภายใน</p>
                                        <p className="font-semibold text-purple-600 dark:text-purple-400">{(job as any).internalOrderNo}</p>
                                    </div>
                                )}
                                {job.orderType === "external" && job.purchaseOrderNo && (
                                    <div>
                                        <p className="text-gray-500 dark:text-gray-400 mb-1">เลขที่ใบสั่งซื้อ</p>
                                        <p className="font-semibold text-blue-600 dark:text-blue-400">{poMeta?.orderNo || job.purchaseOrderNo}</p>
                                    </div>
                                )}
                                {job.orderType === "external" && poMeta?.approveNo && (
                                    <div>
                                        <p className="text-gray-500 dark:text-gray-400 mb-1">ใบอนุมัติขายเลขที่</p>
                                        <p className="font-semibold text-blue-600 dark:text-blue-400">{poMeta.approveNo}</p>
                                    </div>
                                )}
                                {job.orderType === "external" && poMeta?.contractNo && (
                                    <div>
                                        <p className="text-gray-500 dark:text-gray-400 mb-1">Contract No.</p>
                                        <p className="font-semibold text-blue-600 dark:text-blue-400">{poMeta.contractNo}</p>
                                    </div>
                                )}
                                {job.orderType === "external" && job.pttQuotationNo && (
                                    <div>
                                        <p className="text-gray-500 dark:text-gray-400 mb-1">เลขที่ใบเสนอราคา PTT</p>
                                        <p className="font-semibold text-blue-600 dark:text-blue-400">{job.pttQuotationNo}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Delivered Branches */}
                        {deliveredBranches.length > 0 && (
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                    ปั๊มที่ส่งแล้ว ({deliveredBranches.length} ปั๊ม)
                                </h3>
                                <div className="space-y-3">
                                    {deliveredBranches.map((branch) => (
                                        <div
                                            key={branch.branchId}
                                            className="p-4 border-2 border-green-200 dark:border-green-800 rounded-lg bg-green-50 dark:bg-green-900/10"
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <Building2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                                                    <span className="font-semibold text-gray-800 dark:text-white">
                                                        {branch.branchName}
                                                    </span>
                                                </div>
                                                <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-semibold">
                                                    ✓ ส่งแล้ว
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{branch.address}</p>
                                            <div className="flex items-center gap-4 text-sm">
                                                <div className="flex items-center gap-1">
                                                    <Droplet className="h-4 w-4 text-blue-500" />
                                                    <span className="text-gray-600 dark:text-gray-400">{branch.oilType}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Package className="h-4 w-4 text-green-500" />
                                                    <span className="text-gray-600 dark:text-gray-400">
                                                        {numberFormatter.format(branch.quantity)} ลิตร
                                                    </span>
                                                </div>
                                            </div>
                                            {branch.deliveryConfirmation && (
                                                <div className="mt-3 pt-3 border-t border-green-200 dark:border-green-800">
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        ส่งเมื่อ:{" "}
                                                        {new Date(branch.deliveryConfirmation.confirmedAt).toLocaleString("th-TH")}
                                                    </p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        เลขไมล์: {numberFormatter.format(branch.deliveryConfirmation.odometerReading)}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Undelivered Branches */}
                        {undeliveredBranches.length > 0 && (
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
                                    <AlertCircle className="h-5 w-5 text-yellow-500" />
                                    ปั๊มที่ยังไม่ส่ง ({undeliveredBranches.length} ปั๊ม)
                                </h3>
                                <div className="space-y-3">
                                    {undeliveredBranches.map((branch) => (
                                        <div
                                            key={branch.branchId}
                                            className="p-4 border-2 border-yellow-200 dark:border-yellow-800 rounded-lg bg-yellow-50 dark:bg-yellow-900/10"
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <Building2 className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                                                    <span className="font-semibold text-gray-800 dark:text-white">
                                                        {branch.branchName}
                                                    </span>
                                                </div>
                                                <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full text-xs font-semibold">
                                                    ยังไม่ส่ง
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{branch.address}</p>
                                            <div className="flex items-center gap-4 text-sm mb-3">
                                                <div className="flex items-center gap-1">
                                                    <Droplet className="h-4 w-4 text-blue-500" />
                                                    <span className="text-gray-600 dark:text-gray-400">{branch.oilType}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Package className="h-4 w-4 text-green-500" />
                                                    <span className="text-gray-600 dark:text-gray-400">
                                                        {numberFormatter.format(branch.quantity)} ลิตร
                                                    </span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    setViewingJobDetail(null);
                                                    handleSelectJob(job);
                                                }}
                                                className="w-full px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-semibold transition-colors"
                                            >
                                                กลับไปส่งปั๊มนี้
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    if (!selectedJob) {
        return (
            <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900 flex flex-col">
                <header className="sticky top-0 z-20 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 px-6 py-4">
                    <div className="max-w-7xl mx-auto flex items-center gap-3">
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <Truck className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 dark:text-white leading-none">
                                เลือกงานขนส่ง
                            </h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                จัดการงานขนส่งและสถานะ
                            </p>
                        </div>
                    </div>
                </header>
                <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-6 space-y-6">
                    {/* Filters */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
                        <div className="space-y-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="ค้นหาเลขขนส่ง, รถ, คนขับ, ปั๊ม..."
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value as "all" | "active" | "completed")}
                                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="all">ทุกสถานะ</option>
                                    <option value="active">ยังไม่เสร็จ</option>
                                    <option value="completed">เสร็จแล้ว</option>
                                </select>

                                <select
                                    value={filterOrderType}
                                    onChange={(e) => setFilterOrderType(e.target.value as "all" | "internal" | "external")}
                                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="all">ทุกประเภท</option>
                                    <option value="internal">ส่งภายในปั๊ม</option>
                                    <option value="external">รับจาก PTT</option>
                                </select>

                                <select
                                    value={filterBranch === "all" ? "all" : filterBranch}
                                    onChange={(e) => setFilterBranch(e.target.value === "all" ? "all" : Number(e.target.value))}
                                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="all">ทุกปั๊ม</option>
                                    {branches
                                        .sort((a, b) => {
                                            const branchOrder = ["ปั๊มไฮโซ", "ดินดำ", "หนองจิก", "ตักสิลา", "บายพาส"];
                                            return branchOrder.indexOf(a.name) - branchOrder.indexOf(b.name);
                                        })
                                        .map((branch) => (
                                            <option key={branch.id} value={branch.id}>
                                                {branch.name}
                                            </option>
                                        ))}
                                </select>

                                <div className="flex items-center gap-2">
                                    <input
                                        type="date"
                                        value={filterDateFrom}
                                        onChange={(e) => setFilterDateFrom(e.target.value)}
                                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        title="วันที่เริ่มต้น"
                                    />
                                    <span className="text-gray-500 dark:text-gray-400 font-medium">ถึง</span>
                                    <input
                                        type="date"
                                        value={filterDateTo}
                                        onChange={(e) => setFilterDateTo(e.target.value)}
                                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        title="วันที่สิ้นสุด"
                                    />
                                </div>

                                {(filterDateFrom || filterDateTo || searchTerm || filterStatus !== "all" || filterBranch !== "all" || filterOrderType !== "all") && (
                                    <button
                                        onClick={() => {
                                            setSearchTerm("");
                                            setFilterStatus("all");
                                            setFilterBranch("all");
                                            setFilterOrderType("all");
                                            setFilterDateFrom("");
                                            setFilterDateTo("");
                                        }}
                                        className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors border border-gray-300 dark:border-gray-600 whitespace-nowrap"
                                    >
                                        ล้างตัวกรอง
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Jobs Table */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-gray-700/50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            เลขขนส่ง
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            วันที่/เวลา
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            ประเภท
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            รถ/คนขับ
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            จาก/ไป
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            จำนวนปั๊ม
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            สถานะ
                                        </th>
                                        <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            จัดการ
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                                    {filteredJobs.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                                ไม่พบรายการเที่ยวการส่งน้ำมัน
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredJobs.map((job) => {
                                            const deliveredBranches = job.destinationBranches.filter((b) => b.status === "ส่งแล้ว");
                                            const typedJob = job as DriverJobType;
                                            const isInternal = typedJob.orderType === "internal";
                                            const isExternal = typedJob.orderType === "external";
                                            const poMeta = isExternal ? getPurchaseOrderMeta(typedJob) : null;
                                            return (
                                                <tr
                                                    key={job.id}
                                                    onClick={() => handleSelectJob(job as DriverJobType)}
                                                    className="hover:bg-blue-50/50 dark:hover:bg-gray-700/70 transition-colors cursor-pointer"
                                                >
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-semibold text-gray-900 dark:text-white">{job.transportNo}</div>
                                                        {isExternal && typedJob.purchaseOrderNo && (
                                                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 space-y-0.5">
                                                                <div>ใบสั่งซื้อเลขที่: {poMeta?.orderNo || typedJob.purchaseOrderNo}</div>
                                                                <div>ใบอนุมัติขายเลขที่: {poMeta?.approveNo || "-"}</div>
                                                                <div>Contract No.: {poMeta?.contractNo || "-"}</div>
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900 dark:text-white">
                                                            {new Date(job.transportDate).toLocaleDateString("th-TH", { year: "numeric", month: "short", day: "numeric" })}
                                                        </div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400">{job.transportTime}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {isInternal ? (
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                                                                ส่งภายในปั๊ม
                                                            </span>
                                                        ) : isExternal ? (
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                                                รับจาก PTT
                                                            </span>
                                                        ) : (
                                                            <span className="text-xs text-gray-500 dark:text-gray-400">-</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900 dark:text-white">{job.truckPlateNumber}</div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400">{job.driverName || "-"}</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-sm text-gray-900 dark:text-white">{job.sourceBranchName}</div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                                            → {job.destinationBranches.length} ปั๊ม
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900 dark:text-white">{job.destinationBranches.length} ปั๊ม</div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                                            ส่งแล้ว: {deliveredBranches.length}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {job.status === "ส่งเสร็จ" ? (
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                                                เสร็จแล้ว
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                                                                กำลังดำเนินการ
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setViewingJobDetail(job as DriverJobType);
                                                            }}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                                            title="ดูรายละเอียด"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                        <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-500 dark:text-gray-400">
                                                            <MoreHorizontal className="w-5 h-5" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
                <main className="flex-1 w-full max-w-lg mx-auto px-2 py-4 space-y-8 hidden">
                    {/* Active Jobs */}
                    {activeJobs.length > 0 && (
                        <section>
                            <h2 className="text-base font-semibold text-blue-700 dark:text-blue-300 mb-3 flex items-center gap-2">
                                <span className="inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
                                งานที่ยังไม่เสร็จ <span className="text-xs">({activeJobs.length})</span>
                            </h2>
                            <div className="flex flex-col gap-4">
                                {activeJobs.map((job) => {
                                    const deliveredBranches = job.destinationBranches.filter((b) => b.status === "ส่งแล้ว");
                                    const undeliveredBranches = job.destinationBranches.filter((b) => b.status !== "ส่งแล้ว");
                                    const hasUndelivered = undeliveredBranches.length > 0;
                                    return (
                                        <motion.div
                                            key={job.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            onClick={() => handleSelectJob(job as DriverJobType)}
                                            className="rounded-2xl shadow-md bg-white dark:bg-gray-800 border border-blue-100 dark:border-gray-700 p-4 flex flex-col gap-2 cursor-pointer hover:shadow-xl transition-all"
                                        >
                                            <div className="flex items-center gap-3 mb-1">
                                                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30">
                                                    <Truck className="h-6 w-6 text-blue-500" />
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="text-lg font-bold text-gray-800 dark:text-white leading-tight">
                                                        {job.transportNo}
                                                    </h3>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        {new Date(job.transportDate).toLocaleDateString("th-TH", { year: "numeric", month: "short", day: "numeric" })} เวลา {job.transportTime}
                                                    </p>
                                                </div>
                                                <ArrowRight className="h-5 w-5 text-blue-400" />
                                            </div>
                                            <div className="flex flex-wrap gap-2 text-xs mt-1">
                                                <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                                                    <MapPin className="h-3 w-3" /> {job.sourceBranchName}
                                                </span>
                                                <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                                                    <Building2 className="h-3 w-3" /> {job.destinationBranches.length} สาขา
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 mt-2">
                                                <span className="flex items-center gap-1 text-green-600 dark:text-green-400 text-xs font-semibold">
                                                    <CheckCircle className="h-4 w-4" /> ส่งแล้ว: {deliveredBranches.length}
                                                </span>
                                                {hasUndelivered && (
                                                    <span className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400 text-xs font-semibold">
                                                        <AlertCircle className="h-4 w-4" /> ยังไม่ส่ง: {undeliveredBranches.length}
                                                    </span>
                                                )}
                                            </div>
                                            {hasUndelivered && (
                                                <div className="flex flex-wrap gap-1 mt-2">
                                                    {undeliveredBranches.map((branch) => (
                                                        <span
                                                            key={branch.branchId}
                                                            className="px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full text-xs font-medium"
                                                        >
                                                            {branch.branchName}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </section>
                    )}
                    {/* Completed Jobs */}
                    {completedJobs.length > 0 && (
                        <section>
                            <h2 className="text-base font-semibold text-green-700 dark:text-green-300 mb-3 flex items-center gap-2 mt-8">
                                <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                                งานที่เสร็จแล้ว <span className="text-xs">({completedJobs.length})</span>
                            </h2>
                            <div className="flex flex-col gap-4">
                                {completedJobs.map((job) => {
                                    const deliveredBranches = job.destinationBranches.filter((b) => b.status === "ส่งแล้ว");
                                    const undeliveredBranches = job.destinationBranches.filter((b) => b.status !== "ส่งแล้ว");
                                    const hasUndelivered = undeliveredBranches.length > 0;
                                    const isInternal = (job as any).orderType === "internal";
                                    const isExternal = (job as any).orderType === "external";
                                    return (
                                        <motion.div
                                            key={job.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            onClick={() => setViewingJobDetail(job as DriverJobType)}
                                            className="rounded-2xl shadow bg-white dark:bg-gray-800 border border-green-100 dark:border-gray-700 p-4 flex flex-col gap-2 cursor-pointer hover:shadow-xl transition-all"
                                        >
                                            <div className="flex items-center gap-3 mb-1">
                                                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-green-50 dark:bg-green-900/30">
                                                    <CheckCircle className="h-6 w-6 text-green-600" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h3 className="text-lg font-bold text-gray-800 dark:text-white leading-tight">
                                                            {job.transportNo}
                                                        </h3>
                                                        {isInternal && (
                                                            <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full text-xs font-semibold">
                                                                ภายในปั๊ม
                                                            </span>
                                                        )}
                                                        {isExternal && (
                                                            <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-xs font-semibold">
                                                                รับจาก PTT
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        {new Date(job.transportDate).toLocaleDateString("th-TH", { year: "numeric", month: "short", day: "numeric" })} เวลา {job.transportTime}
                                                    </p>
                                                    {(job as any).driverName && (
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                            คนขับ: {(job as any).driverName}
                                                        </p>
                                                    )}
                                                </div>
                                                <ArrowRight className="h-5 w-5 text-green-400" />
                                            </div>
                                            <div className="flex flex-wrap gap-2 text-xs mt-1">
                                                <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                                                    <MapPin className="h-3 w-3" /> {job.sourceBranchName}
                                                </span>
                                                <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                                                    <Building2 className="h-3 w-3" /> {job.destinationBranches.length} สาขา
                                                </span>
                                                {isInternal && (job as any).internalOrderNo && (
                                                    <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400">
                                                        <ShoppingCart className="h-3 w-3" /> {(job as any).internalOrderNo}
                                                    </span>
                                                )}
                                                {isExternal && (job as any).purchaseOrderNo && (
                                                    <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400">
                                                        <FileText className="h-3 w-3" /> {(job as any).purchaseOrderNo}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 mt-2">
                                                <span className="flex items-center gap-1 text-green-600 dark:text-green-400 text-xs font-semibold">
                                                    <CheckCircle className="h-4 w-4" /> ส่งแล้ว: {deliveredBranches.length}
                                                </span>
                                                {hasUndelivered && (
                                                    <span className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400 text-xs font-semibold">
                                                        <AlertCircle className="h-4 w-4" /> ยังไม่ส่ง: {undeliveredBranches.length}
                                                    </span>
                                                )}
                                            </div>
                                            {hasUndelivered && (
                                                <div className="flex flex-wrap gap-1 mt-2">
                                                    {undeliveredBranches.map((branch) => (
                                                        <span
                                                            key={branch.branchId}
                                                            className="px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full text-xs font-medium"
                                                        >
                                                            {branch.branchName}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </section>
                    )}
                </main>
            </div>
        );
    }

    const steps = getSteps();
    const currentStepIndex = getCurrentStepIndex();
    const orderedBranches = selectedJob ? getOrderedBranches(selectedJob) : [];

    const completedDeliveredBranches = selectedJob ? selectedJob.destinationBranches.filter((b) => b.status === "ส่งแล้ว") : [];
    const completedUndeliveredBranches = selectedJob ? selectedJob.destinationBranches.filter((b) => b.status !== "ส่งแล้ว") : [];
    const completedHasUndelivered = completedUndeliveredBranches.length > 0;

    const currentBranch = currentStep === "delivery" && orderedBranches.length > 0 ? orderedBranches[currentDeliveryIndex] : null;
    const selectedPoMeta = selectedJob && selectedJob.orderType === "external" ? getPurchaseOrderMeta(selectedJob) : null;

    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900">
            {/* Header */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10 transition-all duration-200">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                    <Truck className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold text-gray-900 dark:text-white leading-none">
                                        {selectedJob.transportNo}
                                    </h1>
                                </div>
                                {(selectedJob as any).orderType === "internal" && (
                                    <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full text-xs font-semibold flex items-center gap-1.5">
                                        <ShoppingCart className="w-3.5 h-3.5" />
                                        รอบส่งภายในปั๊ม
                                    </span>
                                )}
                                {(selectedJob as any).orderType === "external" && (
                                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-xs font-semibold flex items-center gap-1.5">
                                        <Truck className="w-3.5 h-3.5" />
                                        รอบส่งจาก PTT
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-4 text-sm">
                                <p className="text-gray-500 dark:text-gray-400">
                                    <span className="font-medium">รถ:</span> {selectedJob.truckPlateNumber} / {selectedJob.trailerPlateNumber}
                                </p>
                                {(selectedJob as any).driverName && (
                                    <p className="text-gray-500 dark:text-gray-400">
                                        <span className="font-medium">คนขับ:</span> {(selectedJob as any).driverName}
                                    </p>
                                )}
                                {(selectedJob as any).orderType === "internal" && (selectedJob as any).internalOrderNo && (
                                    <p className="text-purple-600 dark:text-purple-400">
                                        <span className="font-medium">ออเดอร์:</span> {(selectedJob as any).internalOrderNo}
                                    </p>
                                )}
                                {selectedJob.orderType === "external" && selectedJob.purchaseOrderNo && (
                                    <p className="text-blue-600 dark:text-blue-400">
                                        <span className="font-medium">ใบสั่งซื้อเลขที่:</span> {selectedPoMeta?.orderNo || selectedJob.purchaseOrderNo}
                                    </p>
                                )}
                                {selectedJob.orderType === "external" && selectedPoMeta?.approveNo && (
                                    <p className="text-blue-600 dark:text-blue-400">
                                        <span className="font-medium">ใบอนุมัติขายเลขที่:</span> {selectedPoMeta.approveNo}
                                    </p>
                                )}
                                {selectedJob.orderType === "external" && selectedPoMeta?.contractNo && (
                                    <p className="text-blue-600 dark:text-blue-400">
                                        <span className="font-medium">Contract No.:</span> {selectedPoMeta.contractNo}
                                    </p>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                setSelectedJob(null);
                                resetFormStates();
                            }}
                            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                            เปลี่ยนงาน
                        </button>
                    </div>

                    {/* Progress Steps */}
                    <div className="flex items-center justify-between">
                        {steps.map((step, index) => (
                            <div key={step.id} className="flex items-center flex-1">
                                <div className="flex flex-col items-center flex-1">
                                    <div
                                        className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${step.completed
                                            ? "bg-green-500 text-white"
                                            : index === currentStepIndex
                                                ? "bg-blue-500 text-white ring-4 ring-blue-200 dark:ring-blue-800"
                                                : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                                            }`}
                                    >
                                        {step.completed ? (
                                            <CheckCircle className="h-6 w-6" />
                                        ) : (
                                            index + 1
                                        )}
                                    </div>
                                    <p
                                        className={`text-xs mt-2 text-center font-medium ${index === currentStepIndex
                                            ? "text-blue-600 dark:text-blue-400"
                                            : step.completed
                                                ? "text-green-600 dark:text-green-400"
                                                : "text-gray-500 dark:text-gray-400"
                                            }`}
                                    >
                                        {step.label}
                                    </p>
                                </div>
                                {index < steps.length - 1 && (
                                    <div
                                        className={`flex-1 h-1 mx-2 ${step.completed ? "bg-green-500" : "bg-gray-200 dark:bg-gray-700"
                                            }`}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-6">
                <AnimatePresence mode="wait">
                    {/* Step 1: Start Trip */}
                    {currentStep === "start-trip" && (
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

                                <div className={`mb-6 p-4 border rounded-lg ${(selectedJob as any).orderType === "internal"
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
                                                ต้นทาง: {selectedJob.sourceBranchName}
                                            </p>
                                            <p className={`text-sm ${(selectedJob as any).orderType === "internal"
                                                ? "text-purple-700 dark:text-purple-400"
                                                : "text-blue-700 dark:text-blue-400"
                                                }`}>
                                                {selectedJob.sourceAddress}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Building2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                                        <div>
                                            <p className="font-semibold text-green-800 dark:text-green-300">
                                                ปลายทาง: {selectedJob.destinationBranches.length} สาขา
                                            </p>
                                            <p className="text-sm text-green-700 dark:text-green-400">
                                                {selectedJob.destinationBranches.map((b) => b.branchName).join(", ")}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        📏 เลขไมล์เริ่มต้น *
                                    </label>
                                    <input
                                        type="number"
                                        value={startOdometer}
                                        onChange={(e) => setStartOdometer(e.target.value)}
                                        placeholder="กรอกเลขไมล์"
                                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
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
                    )}

                    {/* Step 2: Warehouse Confirm */}
                    {currentStep === "warehouse-confirm" && (
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
                                        ขั้นตอนที่ 2: กรอกเลขที่คลัง (ยืนยันออเดอร์)
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
                                                กรุณากรอก “เลขที่คลัง” และถ่ายรูปหลักฐาน เพื่อยืนยันออเดอร์ที่จะไปรับ
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        🏷️ เลขที่คลัง *
                                    </label>
                                    <input
                                        type="text"
                                        value={warehouseNo}
                                        onChange={(e) => setWarehouseNo(e.target.value)}
                                        placeholder="เช่น WH-001 / Depot-12"
                                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                                    ยืนยันออเดอร์และไปขั้นตอนรับน้ำมัน
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* Step 3: Pickup Oil */}
                    {currentStep === "pickup-oil" && (
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

                                <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                                    <div className="flex items-start gap-3">
                                        <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-300 mb-1">
                                                ⚠️ ระวัง! 1 หลุม ใส่ได้ 1 ชนิดน้ำมันเท่านั้น
                                            </p>
                                            <p className="text-xs text-yellow-700 dark:text-yellow-400">
                                                กรุณาตรวจสอบให้แน่ใจว่าลงน้ำมันถูกช่องตามแผน
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Loading Plan */}
                                <div className="mb-6">
                                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                        แผนการลงน้ำมัน:
                                    </h3>
                                    <div className="space-y-2">
                                        {selectedJob.compartments.map((compartment) => (
                                            <div
                                                key={compartment.id || compartment.compartmentNumber}
                                                className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700/50"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                                        <span className="font-bold text-blue-600 dark:text-blue-400">
                                                            {compartment.compartmentNumber}
                                                        </span>
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-sm font-semibold text-gray-800 dark:text-white">
                                                            {compartment.oilType}
                                                        </p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                                            {compartment.quantity ? numberFormatter.format(compartment.quantity) : "-"} ลิตร → {compartment.destinationBranchName || "-"}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        📷 {selectedJob?.orderType === "external" ? "ถ่ายรูปบิลจากคลัง ปตท" : "ถ่ายรูปบิล/เอกสารรับน้ำมัน"} * (ทุกหน้า)
                                    </label>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                                        {selectedJob?.orderType === "external"
                                            ? "ใช้เป็นหลักฐานยืนยันออเดอร์และบิลที่ได้รับจากคลัง ปตท"
                                            : "ใช้เป็นหลักฐานการรับน้ำมัน"}
                                    </p>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                                        {pickupPhotos.map((photo, index) => (
                                            <div key={index} className="relative group">
                                                <img
                                                    src={photo}
                                                    alt={`หลักฐาน ${index + 1}`}
                                                    className="w-full h-32 object-cover rounded-lg border-2 border-gray-200 dark:border-gray-700"
                                                />
                                                <button
                                                    onClick={() => handleRemovePhoto(index, pickupPhotos, setPickupPhotos)}
                                                    className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            </div>
                                        ))}
                                        {pickupPhotos.length < 6 && (
                                            <label className="cursor-pointer">
                                                <div className="w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-blue-500 dark:hover:border-blue-400 transition-colors">
                                                    <Camera className="h-8 w-8 text-gray-400" />
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">เพิ่มรูป</span>
                                                </div>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    multiple
                                                    onChange={(e) => handlePhotoUpload(e, setPickupPhotos)}
                                                    className="hidden"
                                                />
                                            </label>
                                        )}
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

                                <div className="mb-6">
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        📝 หมายเหตุ (ถ้ามี)
                                    </label>
                                    <textarea
                                        value={pickupNotes}
                                        onChange={(e) => setPickupNotes(e.target.value)}
                                        placeholder="กรอกหมายเหตุเพิ่มเติม..."
                                        rows={3}
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
                    )}

                    {/* Step 4: Route Planning */}
                    {currentStep === "route-planning" && (
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
                                        ขั้นตอนที่ 4: จัดเรียงเส้นทางการส่งน้ำมัน
                                    </h2>
                                    <div className="w-24"></div>
                                </div>

                                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg">
                                    <div className="flex items-start gap-3">
                                        <Route className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-1">
                                                จัดเรียงลำดับการส่งปั๊ม
                                            </p>
                                            <p className="text-xs text-blue-700 dark:text-blue-400">
                                                ลากสลับลำดับได้โดยกดค้างที่ไอคอน <GripVertical className="inline h-3 w-3" /> และลากไปตำแหน่งที่ต้องการ หรือกดปุ่มลบเพื่อยกเลิกการส่งปั๊มนั้น
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {routeOrder.length === 0 ? (
                                    <div className="mb-6 p-8 text-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                                        <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                                        <p className="text-gray-600 dark:text-gray-400 font-semibold">
                                            ไม่มีปั๊มที่ต้องส่ง
                                        </p>
                                        <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                                            กรุณาเพิ่มปั๊มที่ต้องการส่ง
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-3 mb-6">
                                        {routeOrder.map((branchId, index) => {
                                            const branch = selectedJob.destinationBranches.find((b) => b.branchId === branchId);
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
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <Building2 className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                                                <p className="font-semibold text-gray-800 dark:text-white">
                                                                    {branch.branchName}
                                                                </p>
                                                            </div>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                                {branch.address}
                                                            </p>
                                                            <div className="flex items-center gap-3 mt-2">
                                                                <div className="flex items-center gap-1">
                                                                    <Droplet className="h-3 w-3 text-blue-500" />
                                                                    <span className="text-xs text-gray-600 dark:text-gray-400">
                                                                        {branch.oilType}
                                                                    </span>
                                                                </div>
                                                                <div className="flex items-center gap-1">
                                                                    <Package className="h-3 w-3 text-green-500" />
                                                                    <span className="text-xs text-gray-600 dark:text-gray-400">
                                                                        {numberFormatter.format(branch.quantity)} ลิตร
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => handleRemoveBranch(branchId)}
                                                            className="flex-shrink-0 p-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                                                            title="ลบปั๊มนี้ออกจากเส้นทาง"
                                                        >
                                                            <X className="h-5 w-5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <Navigation className="h-5 w-5 text-green-600 dark:text-green-400" />
                                        <p className="text-sm font-semibold text-green-800 dark:text-green-300">
                                            เส้นทางการส่ง: {routeOrder.map((branchId) => {
                                                const branch = selectedJob.destinationBranches.find((b) => b.branchId === branchId);
                                                return branch?.branchName;
                                            }).join(" → ")}
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={handleConfirmRoutePlanning}
                                    disabled={routeOrder.length === 0}
                                    className={`w-full px-6 py-4 rounded-lg font-semibold text-lg transition-colors flex items-center justify-center gap-2 ${routeOrder.length === 0
                                        ? "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                                        : "bg-purple-600 hover:bg-purple-700 text-white"
                                        }`}
                                >
                                    <CheckCircle className="h-6 w-6" />
                                    ยืนยันเส้นทางและเริ่มส่ง
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* Step 5: Delivery */}
                    {currentStep === "delivery" && currentBranch && (
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

                                {/* Progress */}
                                <div className="mb-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">ความคืบหน้า</span>
                                        <span className="text-sm font-semibold text-gray-800 dark:text-white">
                                            {orderedBranches.filter((b) => b.status === "ส่งแล้ว").length} / {orderedBranches.length}
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                        <div
                                            className="bg-green-500 h-2 rounded-full transition-all"
                                            style={{
                                                width: `${(orderedBranches.filter((b) => b.status === "ส่งแล้ว").length / orderedBranches.length) * 100}%`,
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Branch Info */}
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
                                    <div className="flex items-center gap-2 mt-3">
                                        <Droplet className="h-4 w-4 text-blue-500" />
                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                            {currentBranch.oilType} - {numberFormatter.format(currentBranch.quantity)} ลิตร
                                        </span>
                                    </div>
                                </div>

                                {/* Delivery Form */}
                                <div className="mb-6">
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                        📷 ถ่ายรูปหลักฐานการส่งน้ำมัน * (อย่างน้อย 1 รูป)
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
                                        {deliveryPhotos.length < 6 && (
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
                                        )}
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

                                <div className="mb-6">
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        📝 หมายเหตุ (ถ้ามี)
                                    </label>
                                    <textarea
                                        value={deliveryNotes}
                                        onChange={(e) => setDeliveryNotes(e.target.value)}
                                        placeholder="กรอกหมายเหตุเพิ่มเติม..."
                                        rows={3}
                                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    />
                                </div>

                                <button
                                    onClick={handleConfirmDelivery}
                                    className="w-full px-6 py-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold text-lg transition-colors flex items-center justify-center gap-2"
                                >
                                    <CheckCircle className="h-6 w-6" />
                                    {currentDeliveryIndex === orderedBranches.length - 1
                                        ? "ส่งเสร็จแล้ว - ไปโรงจอด"
                                        : "ยืนยันการส่งและไปปั๊มถัดไป"}
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* Step 6: Arrive Depot */}
                    {currentStep === "arrive-depot" && (
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
                                    <div className="w-24"></div>
                                </div>

                                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg">
                                    <div className="flex items-center gap-3 mb-3">
                                        <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                        <div>
                                            <p className="font-semibold text-blue-800 dark:text-blue-300">
                                                โรงจอด: {selectedJob.sourceBranchName}
                                            </p>
                                            <p className="text-sm text-blue-700 dark:text-blue-400">
                                                {selectedJob.sourceAddress}
                                            </p>
                                        </div>
                                    </div>
                                    {selectedJob.startTrip && (
                                        <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-800">
                                            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                                                เลขไมล์เริ่มต้น: {numberFormatter.format(selectedJob.startTrip.startOdometer)} กม.
                                            </p>
                                            {selectedJob.destinationBranches.length > 0 && selectedJob.destinationBranches[0].deliveryConfirmation && (
                                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                                    เลขไมล์หลังส่งปั๊มสุดท้าย: {numberFormatter.format(selectedJob.destinationBranches[selectedJob.destinationBranches.length - 1].deliveryConfirmation!.odometerReading)} กม.
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="mb-6">
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        📏 เลขไมล์เมื่อถึงโรงจอด *
                                    </label>
                                    <input
                                        type="number"
                                        value={depotOdometer}
                                        onChange={(e) => setDepotOdometer(e.target.value)}
                                        placeholder="กรอกเลขไมล์เมื่อถึงโรงจอด"
                                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                    {selectedJob.startTrip && depotOdometer && (
                                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                            ระยะทางรวม: {numberFormatter.format(parseFloat(depotOdometer) - selectedJob.startTrip.startOdometer)} กม.
                                        </p>
                                    )}
                                </div>

                                <div className="mb-6">
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        📷 ถ่ายรูปเลขไมล์ (ถ้ามี)
                                    </label>
                                    {depotOdometerPhoto ? (
                                        <div className="relative group">
                                            <img
                                                src={depotOdometerPhoto}
                                                alt="เลขไมล์เมื่อถึงโรงจอด"
                                                className="w-full h-48 object-cover rounded-lg border-2 border-gray-200 dark:border-gray-700"
                                            />
                                            <button
                                                onClick={() => setDepotOdometerPhoto("")}
                                                className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <label className="cursor-pointer">
                                            <div className="w-full h-48 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-blue-500 dark:hover:border-blue-400 transition-colors">
                                                <Camera className="h-12 w-12 text-gray-400" />
                                                <span className="text-sm text-gray-500 dark:text-gray-400">ถ่ายรูปเลขไมล์</span>
                                            </div>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        const reader = new FileReader();
                                                        reader.onloadend = () => {
                                                            setDepotOdometerPhoto(reader.result as string);
                                                        };
                                                        reader.readAsDataURL(file);
                                                    }
                                                }}
                                                className="hidden"
                                            />
                                        </label>
                                    )}
                                </div>

                                <div className="mb-6">
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        📝 หมายเหตุ (ถ้ามี)
                                    </label>
                                    <textarea
                                        value={depotNotes}
                                        onChange={(e) => setDepotNotes(e.target.value)}
                                        placeholder="กรอกหมายเหตุเพิ่มเติม..."
                                        rows={3}
                                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                <button
                                    onClick={handleConfirmArriveDepot}
                                    className="w-full px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-lg transition-colors flex items-center justify-center gap-2"
                                >
                                    <CheckCircle className="h-6 w-6" />
                                    ยืนยันการถึงโรงจอดและเสร็จสิ้น
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* Step 6: Completed */}
                    {currentStep === "completed" && (
                        <motion.div
                            key="completed"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                                <div className="flex items-center justify-start mb-6">
                                    <button
                                        onClick={handleGoBack}
                                        className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold transition-colors hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center gap-2"
                                    >
                                        <ChevronRight className="h-5 w-5 rotate-180" />
                                        กลับ
                                    </button>
                                </div>
                                {/* Get delivered and undelivered branches */}
                                <div className="text-center mb-6">
                                    <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                                        🎉 เสร็จสิ้นภาระกิจ!
                                    </h2>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        ส่งน้ำมันครบทุกปั๊มและกลับถึงโรงจอดเรียบร้อยแล้ว
                                    </p>
                                    {selectedJob.startTrip && (selectedJob as any).depotArrival && (
                                        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg">
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <p className="text-gray-600 dark:text-gray-400 mb-1">เลขไมล์เริ่มต้น</p>
                                                    <p className="font-semibold text-gray-800 dark:text-white">
                                                        {numberFormatter.format(selectedJob.startTrip.startOdometer)} กม.
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-600 dark:text-gray-400 mb-1">เลขไมล์เมื่อถึงโรงจอด</p>
                                                    <p className="font-semibold text-gray-800 dark:text-white">
                                                        {numberFormatter.format((selectedJob as any).depotArrival.endOdometer)} กม.
                                                    </p>
                                                </div>
                                                <div className="col-span-2">
                                                    <p className="text-gray-600 dark:text-gray-400 mb-1">ระยะทางรวม</p>
                                                    <p className="font-semibold text-blue-600 dark:text-blue-400 text-lg">
                                                        {numberFormatter.format((selectedJob as any).depotArrival.endOdometer - selectedJob.startTrip.startOdometer)} กม.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Delivered Branches */}
                                {completedDeliveredBranches.length > 0 && (
                                    <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-lg">
                                        <p className="text-sm font-semibold text-green-800 dark:text-green-300 mb-3">
                                            ✓ ปั๊มที่ส่งแล้ว ({completedDeliveredBranches.length} ปั๊ม):
                                        </p>
                                        <div className="space-y-2">
                                            {completedDeliveredBranches.map((branch, index) => (
                                                <div
                                                    key={branch.branchId}
                                                    className="flex items-center justify-between text-sm"
                                                >
                                                    <span className="text-gray-700 dark:text-gray-300">
                                                        {index + 1}. {branch.branchName}
                                                    </span>
                                                    <span className="text-green-600 dark:text-green-400 font-semibold">
                                                        ✓ ส่งแล้ว
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Undelivered Branches */}
                                {completedHasUndelivered && (
                                    <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                                        <div className="flex items-start gap-3 mb-3">
                                            <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                                            <div className="flex-1">
                                                <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-300 mb-1">
                                                    ⚠️ ปั๊มที่ยังไม่ส่ง ({completedUndeliveredBranches.length} ปั๊ม):
                                                </p>
                                                <p className="text-xs text-yellow-700 dark:text-yellow-400">
                                                    ปั๊มเหล่านี้ถูกลบออกจากเส้นทางหรือยังไม่ได้ส่ง
                                                </p>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            {completedUndeliveredBranches.map((branch) => (
                                                <div
                                                    key={branch.branchId}
                                                    className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-yellow-200 dark:border-yellow-800"
                                                >
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="flex items-center gap-2">
                                                            <Building2 className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                                                            <span className="font-semibold text-gray-800 dark:text-white">
                                                                {branch.branchName}
                                                            </span>
                                                        </div>
                                                        <span className="text-yellow-600 dark:text-yellow-400 font-semibold text-xs">
                                                            ยังไม่ส่ง
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                                        {branch.address}
                                                    </p>
                                                    <div className="flex items-center gap-3 text-xs">
                                                        <div className="flex items-center gap-1">
                                                            <Droplet className="h-3 w-3 text-blue-500" />
                                                            <span className="text-gray-600 dark:text-gray-400">
                                                                {branch.oilType}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Package className="h-3 w-3 text-green-500" />
                                                            <span className="text-gray-600 dark:text-gray-400">
                                                                {numberFormatter.format(branch.quantity)} ลิตร
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex gap-3">
                                    {completedHasUndelivered && (
                                        <button
                                            onClick={() => {
                                                // Add undelivered branches back to route order
                                                const undeliveredIds = completedUndeliveredBranches.map((b) => b.branchId);
                                                const newRouteOrder = [...routeOrder, ...undeliveredIds];
                                                setRouteOrder(newRouteOrder);
                                                const updatedJob = {
                                                    ...selectedJob,
                                                    routeOrder: newRouteOrder,
                                                    status: "กำลังส่ง" as const,
                                                };
                                                setSelectedJob(updatedJob);
                                                setCurrentStep("delivery");
                                                setCurrentDeliveryIndex(routeOrder.length);
                                                resetFormStates();
                                            }}
                                            className="flex-1 px-6 py-4 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-semibold text-lg transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Route className="h-6 w-6" />
                                            กลับไปส่งปั๊มที่เหลือ
                                        </button>
                                    )}
                                    <button
                                        onClick={() => {
                                            // Mark job as completed
                                            const updatedJob = {
                                                ...selectedJob,
                                                status: "ส่งเสร็จ" as const,
                                            };
                                            setSelectedJob(updatedJob);
                                            // Go back to job list
                                            setSelectedJob(null);
                                            resetFormStates();
                                        }}
                                        className={`px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-lg transition-colors ${completedHasUndelivered ? "flex-1" : "w-full"
                                            }`}
                                    >
                                        {completedHasUndelivered ? "เสร็จสิ้นเลย" : "กลับไปเลือกงานใหม่"}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
