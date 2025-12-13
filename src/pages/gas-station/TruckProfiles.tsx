import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Truck,
  Search,
  Calendar,
  MapPin,
  Droplet,
  Activity,
  ChevronRight,
  Wrench,
  AlertCircle,
  CheckCircle,
  Plus,
  X,
} from "lucide-react";

const numberFormatter = new Intl.NumberFormat("th-TH", {
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("th-TH", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

// Interface สำหรับหาง (Trailer)
export interface Trailer {
  id: string;
  plateNumber: string; // ทะเบียนรถส่วนหาง (Tail License Plate)
  capacity: number; // ความจุ (ลิตร)
  status: "available" | "in-use" | "maintenance";
  // Physical Specifications
  brand?: string; // ยี่ห้อ
  model?: string; // รุ่น
  year?: number; // ปีที่ผลิต
  chassisNumber?: string; // เลขตัวถัง
  // Dimensions & Weight
  length?: number; // ความยาว (เมตร)
  width?: number; // ความกว้าง (เมตร)
  height?: number; // ความสูง (เมตร)
  emptyWeight?: number; // น้ำหนักเปล่า (กก.)
  maxLoadWeight?: number; // น้ำหนักบรรทุกสูงสุด (กก.)
  // Usage Statistics
  totalTrips?: number; // จำนวนเที่ยวทั้งหมด
  totalOilDelivered?: number; // ปริมาณน้ำมันที่ส่งทั้งหมด (ลิตร)
  lastTripDate?: string; // วันที่เดินทางล่าสุด
  // Maintenance
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
  totalMaintenanceCost?: number; // ค่าซ่อมบำรุงสะสม (บาท)
  lastMajorRepair?: string; // การซ่อมใหญ่ครั้งล่าสุด
  lastMajorRepairDate?: string; // วันที่ซ่อมใหญ่ครั้งล่าสุด
  // Additional Info
  color?: string; // สีหาง
  purchaseDate?: string; // วันที่ซื้อ
  purchasePrice?: number; // ราคาซื้อ (บาท)
  currentTruckId?: string; // รถที่ใช้อยู่ตอนนี้
  notes?: string; // หมายเหตุเพิ่มเติม
  // เอกสารประจำหาง
  compulsoryInsuranceExpiry?: string; // พ.ร.บ.
  vehicleTaxExpiry?: string; // ทะเบียนรถ/ป้ายวงกลม
  insuranceExpiry?: string; // ประกันภัย
  hazmatLicenseExpiry?: string; // ใบอนุญาตขนส่งวัตถุอันตราย
}

// Interface สำหรับรถ (Truck Head)
export interface TruckProfile {
  id: string;
  plateNumber: string; // ทะเบียนรถส่วนหัว (Head License Plate)
  brand: string;
  model: string;
  year: number;
  engineNumber: string;
  chassisNumber: string;
  status: "active" | "inactive" | "maintenance";
  totalTrips: number;
  totalDistance: number; // กิโลเมตร
  totalOilDelivered: number; // ลิตร
  lastTripDate?: string;
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
  compatibleTrailers: string[]; // ID ของหางที่ใช้ได้
  currentTrailerId?: string; // หางที่ใช้อยู่ตอนนี้
  // Driver Assignment
  assignedDriverId?: string; // ID ของคนขับประจำ
  assignedDriverName?: string; // ชื่อคนขับประจำ
  // Location & Depot
  currentLocation?: string; // ที่จอดรถปัจจุบัน/คลัง
  homeDepot?: string; // คลังหลัก/ฐานที่ตั้ง
  // Fuel Efficiency
  fuelEfficiency?: number; // อัตราการใช้น้ำมันเฉลี่ย (กม./ลิตร)
  lastFuelEfficiencyUpdate?: string; // วันที่อัปเดตข้อมูลล่าสุด
  // Maintenance History (summary)
  totalMaintenanceCost?: number; // ค่าซ่อมบำรุงสะสม (บาท)
  lastMajorRepair?: string; // การซ่อมใหญ่ครั้งล่าสุด
  lastMajorRepairDate?: string; // วันที่ซ่อมใหญ่ครั้งล่าสุด
  // Additional Info
  color?: string; // สีรถ
  purchaseDate?: string; // วันที่ซื้อ
  purchasePrice?: number; // ราคาซื้อ (บาท)
  notes?: string; // หมายเหตุเพิ่มเติม
  // Odometer tracking
  lastOdometerReading?: number; // เลขไมล์ล่าสุด (กม.)
  lastOdometerDate?: string; // วันที่บันทึกไมล์ล่าสุด
  // เอกสารประจำรถหัวลาก
  compulsoryInsuranceExpiry?: string; // พ.ร.บ.
  vehicleTaxExpiry?: string; // ทะเบียนรถ/ป้ายวงกลม
  insuranceExpiry?: string; // ประกันภัย
  hazmatLicenseExpiry?: string; // ใบอนุญาตขนส่งวัตถุอันตราย
}

// Interface สำหรับบันทึกประวัติการซ่อมบำรุง
export interface MaintenanceRecord {
  id: string;
  vehicleId: string; // ID ของรถหรือหาง
  vehicleType: "truck" | "trailer"; // ประเภทยานพาหนะ
  date: string; // วันที่ซ่อม
  type: "routine" | "repair" | "major"; // ประเภทการซ่อม
  description: string; // รายละเอียดงานซ่อม
  cost: number; // ค่าใช้จ่าย (บาท)
  mileage?: number; // เลขไมล์ขณะซ่อม (สำหรับรถ)
  performedBy: string; // ช่างผู้ทำ/ศูนย์บริการ
  nextServiceDue?: string; // วันที่ต้องเข้าซ่อมครั้งถัดไป
  notes?: string; // หมายเหตุ
}


// Interface สำหรับออเดอร์รถน้ำมัน
export interface TruckOrder {
  id: string;
  orderNo: string; // เลขที่รอบรับน้ำมัน
  orderDate: string;
  purchaseOrderNo?: string; // เลขที่ใบสั่งซื้อที่เชื่อมกับ PO
  transportNo: string; // เลขที่ขนส่ง (TR-YYYYMMDD-XXX)
  truckId: string;
  truckPlateNumber: string;
  trailerId: string;
  trailerPlateNumber: string;
  driver: string;
  fromBranch: string;
  toBranch: string;
  oilType: string;
  quantity: number; // ลิตร
  status: "draft" | "quotation-recorded" | "ready-to-pickup" | "picking-up" | "completed" | "cancelled";

  // PTT Quotation fields (ใบเสนอราคาจาก ปตท.)
  pttQuotationNo?: string; // เลขที่ใบเสนอราคาจาก ปตท.
  pttQuotationDate?: string; // วันที่ใบเสนอราคา
  pttQuotationAmount?: number; // มูลค่ารวมในใบเสนอราคา
  pttQuotationAttachment?: string; // ไฟล์แนบใบเสนอราคา

  // Scheduled pickup (วันนัดรับ)
  scheduledPickupDate?: string; // วันที่นัดไปรับน้ำมัน
  scheduledPickupTime?: string; // เวลาที่นัดไปรับ

  // Odometer tracking fields
  currentOdometer?: number; // เลขไมล์ปัจจุบันก่อนออกวิ่ง
  startOdometer?: number; // เลขไมล์เริ่มต้น (กม.)
  endOdometer?: number; // เลขไมล์สิ้นสุด (กม.)
  totalDistance?: number; // ระยะทางรวม (กม.)
  startTime?: string; // เวลาเริ่มเดินทาง
  endTime?: string; // เวลาถึงปลายทาง
  tripDuration?: number; // ระยะเวลา (นาที)
  odometerStartPhoto?: string; // รูปไมล์ตอนออก (optional)
  odometerEndPhoto?: string; // รูปไมล์ตอนกลับ (optional)

  // Integration with Oil Receipt
  deliveryNoteNo?: string; // เลขที่ใบส่งของจาก PTT
  oilReceiptId?: string; // ID ของใบรับน้ำมัน (เชื่อมกับ OilReceipt)
  selectedBranches?: number[]; // สาขาที่จะส่ง
  usedInOrderId?: string; // ID ของออเดอร์น้ำมันที่เรียกใช้ออเดอร์รถนี้
  notes?: string;
  createdAt: string;
  createdBy: string;
}

// Mock data - หาง 3 หาง
export const mockTrailers: Trailer[] = [
  {
    id: "TRAILER-001",
    plateNumber: "กข 1234",
    capacity: 10000,
    status: "in-use",
    // Physical Specifications
    brand: "Thai Tank",
    model: "TT-10000",
    year: 2019,
    chassisNumber: "TT2019001",
    // Dimensions & Weight
    length: 8.5,
    width: 2.5,
    height: 3.2,
    emptyWeight: 3500,
    maxLoadWeight: 12000,
    // Usage Statistics
    totalTrips: 450,
    totalOilDelivered: 4500000,
    lastTripDate: "2024-12-15",
    // Maintenance
    lastMaintenanceDate: "2024-11-15",
    nextMaintenanceDate: "2025-02-15",
    totalMaintenanceCost: 85000,
    lastMajorRepair: "เปลี่ยนวาล์วล้วม",
    lastMajorRepairDate: "2024-05-10",
    // Additional Info
    color: "เงิน",
    purchaseDate: "2019-03-20",
    purchasePrice: 1200000,
    currentTruckId: "TRUCK-001",
    notes: "หางประจำรถ กก 1111",
    // เอกสาร
    compulsoryInsuranceExpiry: "2025-06-30",
    vehicleTaxExpiry: "2025-03-15",
    insuranceExpiry: "2025-08-20",
    hazmatLicenseExpiry: "2025-12-31",
  },
  {
    id: "TRAILER-002",
    plateNumber: "กข 5678",
    capacity: 12000,
    status: "available",
    // Physical Specifications
    brand: "Siam Tank",
    model: "ST-12000",
    year: 2020,
    chassisNumber: "ST2020002",
    // Dimensions & Weight
    length: 9.0,
    width: 2.5,
    height: 3.3,
    emptyWeight: 3800,
    maxLoadWeight: 14000,
    // Usage Statistics
    totalTrips: 320,
    totalOilDelivered: 3840000,
    lastTripDate: "2024-12-10",
    // Maintenance
    lastMaintenanceDate: "2024-10-20",
    nextMaintenanceDate: "2025-01-20",
    totalMaintenanceCost: 62000,
    lastMajorRepair: "ซ่อมระบบเบรก",
    lastMajorRepairDate: "2024-03-15",
    // Additional Info
    color: "ขาว",
    purchaseDate: "2020-06-15",
    purchasePrice: 1350000,
    notes: "หางสำรอง",
    // เอกสาร
    compulsoryInsuranceExpiry: "2025-01-15",
    vehicleTaxExpiry: "2025-05-10",
    insuranceExpiry: "2025-07-25",
    hazmatLicenseExpiry: "2025-11-30",
  },
  {
    id: "TRAILER-003",
    plateNumber: "กข 9012",
    capacity: 15000,
    status: "in-use",
    // Physical Specifications
    brand: "Premium Tank",
    model: "PT-15000",
    year: 2021,
    chassisNumber: "PT2021003",
    // Dimensions & Weight
    length: 10.0,
    width: 2.5,
    height: 3.5,
    emptyWeight: 4200,
    maxLoadWeight: 18000,
    // Usage Statistics
    totalTrips: 280,
    totalOilDelivered: 4200000,
    lastTripDate: "2024-12-14",
    // Maintenance
    lastMaintenanceDate: "2024-12-01",
    nextMaintenanceDate: "2025-03-01",
    totalMaintenanceCost: 45000,
    lastMajorRepair: "ตรวจเช็คประจำปี",
    lastMajorRepairDate: "2024-11-25",
    // Additional Info
    color: "น้ำเงิน",
    purchaseDate: "2021-01-10",
    purchasePrice: 1650000,
    currentTruckId: "TRUCK-002",
    notes: "หางใหม่ ความจุสูงสุด",
    // เอกสาร
    compulsoryInsuranceExpiry: "2025-09-15",
    vehicleTaxExpiry: "2025-04-20",
    insuranceExpiry: "2025-10-10",
    hazmatLicenseExpiry: "2025-12-25",
  },
];

// Mock data - รถ 2 คัน
export const mockTrucks: TruckProfile[] = [
  {
    id: "TRUCK-001",
    plateNumber: "กก 1111",
    brand: "Isuzu",
    model: "FVR 34-260",
    year: 2020,
    engineNumber: "ENG-2020-001",
    chassisNumber: "CHS-2020-001",
    status: "active",
    totalTrips: 245,
    totalDistance: 125000,
    totalOilDelivered: 2500000,
    lastTripDate: "2024-12-15",
    lastMaintenanceDate: "2024-11-20",
    nextMaintenanceDate: "2025-02-20",
    compatibleTrailers: ["TRAILER-001", "TRAILER-002", "TRAILER-003"],
    currentTrailerId: "TRAILER-001",
    // Driver Assignment
    assignedDriverName: "สมชาย ใจดี",
    // Location & Depot
    currentLocation: "คลังปั๊มไฮโซ",
    homeDepot: "คลังกรุงเทพ",
    // Fuel Efficiency
    fuelEfficiency: 3.5, // กม./ลิตร
    lastFuelEfficiencyUpdate: "2024-12-01",
    // Maintenance History
    totalMaintenanceCost: 125000,
    lastMajorRepair: "เปลี่ยนเครื่องยนต์",
    lastMajorRepairDate: "2024-06-15",
    // Additional Info
    color: "ขาว",
    purchaseDate: "2020-01-15",
    purchasePrice: 2500000,
    notes: "รถหลัก สภาพดี",
    // Odometer
    lastOdometerReading: 125500,
    lastOdometerDate: "2024-12-15",
    // เอกสาร
    compulsoryInsuranceExpiry: "2025-07-15",
    vehicleTaxExpiry: "2025-06-30",
    insuranceExpiry: "2025-09-20",
    hazmatLicenseExpiry: "2025-11-15",
  },
  {
    id: "TRUCK-002",
    plateNumber: "กก 2222",
    brand: "Hino",
    model: "300 Series",
    year: 2021,
    engineNumber: "ENG-2021-002",
    chassisNumber: "CHS-2021-002",
    status: "active",
    totalTrips: 198,
    totalDistance: 98000,
    totalOilDelivered: 1980000,
    lastTripDate: "2024-12-14",
    lastMaintenanceDate: "2024-12-05",
    nextMaintenanceDate: "2025-03-01",
    compatibleTrailers: ["TRAILER-001", "TRAILER-002", "TRAILER-003"],
    currentTrailerId: "TRAILER-003",
    // Driver Assignment
    assignedDriverName: "วิชัย รักงาน",
    // Location & Depot
    currentLocation: "คลังปั๊มไฮโซ",
    homeDepot: "คลังกรุงเทพ",
    // Fuel Efficiency
    fuelEfficiency: 3.8, // กม./ลิตร
    lastFuelEfficiencyUpdate: "2024-11-15",
    // Maintenance History
    totalMaintenanceCost: 95000,
    lastMajorRepair: "ซ่อมระบบเกียร์",
    lastMajorRepairDate: "2024-08-20",
    // Additional Info
    color: "เงิน",
    purchaseDate: "2021-03-10",
    purchasePrice: 2800000,
    notes: "รถสำรอง ประหยัดน้ำมัน",
    // Odometer
    lastOdometerReading: 98350,
    lastOdometerDate: "2024-12-14",
    // เอกสาร
    compulsoryInsuranceExpiry: "2025-01-10",
    vehicleTaxExpiry: "2025-05-25",
    insuranceExpiry: "2025-08-15",
    hazmatLicenseExpiry: "2025-10-30",
  },
];

// Mock data - ออเดอร์รถน้ำมัน
export const mockTruckOrders: TruckOrder[] = [
  {
    id: "TO-001",
    orderNo: "TO-20241215-001",
    orderDate: "2024-12-15",
    purchaseOrderNo: "SO-20241215-001",
    transportNo: "TR-20241215-001",
    truckId: "TRUCK-001",
    truckPlateNumber: "กก 1111",
    trailerId: "TRAILER-001",
    trailerPlateNumber: "กข 1234",
    driver: "สมชาย ใจดี",
    fromBranch: "ปั๊มไฮโซ",
    toBranch: "สาขา 2",
    oilType: "Premium Diesel",
    quantity: 10000,
    status: "picking-up",
    startOdometer: 125000,
    startTime: "2024-12-15T08:00:00",
    selectedBranches: [2, 3],
    usedInOrderId: "SO-20241215-001",
    notes: "รับน้ำมันจากปั๊มไฮโซ",
    createdAt: "2024-12-15 08:00:00",
    createdBy: "ผู้จัดการ",
  },
  {
    id: "TO-002",
    orderNo: "TO-20241215-002",
    orderDate: "2024-12-15",
    purchaseOrderNo: "SO-20241215-002",
    transportNo: "TR-20241215-002",
    truckId: "TRUCK-002",
    truckPlateNumber: "กก 2222",
    trailerId: "TRAILER-003",
    trailerPlateNumber: "กข 9012",
    driver: "วิชัย รักงาน",
    fromBranch: "ปั๊มไฮโซ",
    toBranch: "สาขา 3",
    oilType: "Gasohol 95",
    quantity: 12000,
    status: "draft",
    selectedBranches: [3, 4],
    notes: "",
    createdAt: "2024-12-15 09:00:00",
    createdBy: "ผู้จัดการ",
  },
  {
    id: "TO-003",
    orderNo: "TO-20241214-001",
    orderDate: "2024-12-14",
    purchaseOrderNo: "SO-20241214-001",
    transportNo: "TR-20241214-001",
    truckId: "TRUCK-001",
    truckPlateNumber: "กก 1111",
    trailerId: "TRAILER-002",
    trailerPlateNumber: "กข 5678",
    driver: "สมชาย ใจดี",
    fromBranch: "ปั๊มไฮโซ",
    toBranch: "สาขา 4",
    oilType: "Diesel",
    quantity: 8000,
    status: "completed",
    startOdometer: 98000,
    endOdometer: 98350,
    totalDistance: 350,
    startTime: "2024-12-14T10:00:00",
    endTime: "2024-12-14T15:30:00",
    tripDuration: 330, // 5 hours 30 minutes
    deliveryNoteNo: "PTT-DN-20241214-001",
    oilReceiptId: "REC-20241214-001",
    selectedBranches: [4],
    usedInOrderId: "SO-20241214-001",
    notes: "",
    createdAt: "2024-12-14 10:00:00",
    createdBy: "ผู้จัดการ",
  },
];









export default function TruckProfiles() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive" | "maintenance">("all");
  const [showCreateTruckModal, setShowCreateTruckModal] = useState(false);


  // Form state for creating new truck
  const [newTruck, setNewTruck] = useState({
    plateNumber: "",
    brand: "",
    model: "",
    year: new Date().getFullYear(),
    engineNumber: "",
    chassisNumber: "",
    status: "active" as "active" | "inactive" | "maintenance",
    compatibleTrailers: [] as string[],
  });

  // รวมข้อมูลรถกับหาง
  const trucksWithTrailers = useMemo(() => {
    return mockTrucks.map((truck) => {
      const currentTrailer = truck.currentTrailerId
        ? mockTrailers.find((t) => t.id === truck.currentTrailerId)
        : null;
      const compatibleTrailers = truck.compatibleTrailers
        .map((id) => mockTrailers.find((t) => t.id === id))
        .filter((t): t is Trailer => t !== undefined);

      return {
        ...truck,
        currentTrailer,
        compatibleTrailers,
      };
    });
  }, []);

  // กรองข้อมูล
  const filteredTrucks = useMemo(() => {
    return trucksWithTrailers.filter((truck) => {
      const matchesSearch =
        truck.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        truck.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        truck.model.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === "all" || truck.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [trucksWithTrailers, searchTerm, filterStatus]);

  // สรุปข้อมูล
  const summary = useMemo(() => {
    const activeTrucks = mockTrucks.filter((t) => t.status === "active").length;
    const totalTrips = mockTrucks.reduce((sum, t) => sum + t.totalTrips, 0);
    const totalDistance = mockTrucks.reduce((sum, t) => sum + t.totalDistance, 0);
    const totalOilDelivered = mockTrucks.reduce((sum, t) => sum + t.totalOilDelivered, 0);

    return {
      activeTrucks,
      totalTrips,
      totalDistance,
      totalOilDelivered,
    };
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
      case "inactive":
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
      case "maintenance":
        return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="w-4 h-4" />;
      case "inactive":
        return <AlertCircle className="w-4 h-4" />;
      case "maintenance":
        return <Wrench className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };





  const handleCreateTruck = () => {
    // In real app, this would call API
    console.log("Creating truck:", newTruck);
    setShowCreateTruckModal(false);
    setNewTruck({
      plateNumber: "",
      brand: "",
      model: "",
      year: new Date().getFullYear(),
      engineNumber: "",
      chassisNumber: "",
      status: "active",
      compatibleTrailers: [],
    });
    alert("เพิ่มรถใหม่สำเร็จ");
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
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Truck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            โปรไฟล์รถส่งน้ำมัน
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            จัดการข้อมูลรถและหางส่งน้ำมัน รวมถึงประวัติการใช้งานและออเดอร์รถ
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowCreateTruckModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            เพิ่มรถใหม่
          </button>
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
              <p className="text-sm text-gray-600 dark:text-gray-400">รถที่ใช้งาน</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {summary.activeTrucks} / {mockTrucks.length}
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Truck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
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
              <p className="text-sm text-gray-600 dark:text-gray-400">จำนวนเที่ยวทั้งหมด</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {numberFormatter.format(summary.totalTrips)}
              </p>
            </div>
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
              <Activity className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
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
              <p className="text-sm text-gray-600 dark:text-gray-400">ระยะทางรวม</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {numberFormatter.format(summary.totalDistance)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">กิโลเมตร</p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <MapPin className="w-6 h-6 text-purple-600 dark:text-purple-400" />
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
              <p className="text-sm text-gray-600 dark:text-gray-400">น้ำมันส่งรวม</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {numberFormatter.format(summary.totalOilDelivered)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">ลิตร</p>
            </div>
            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <Droplet className="w-6 h-6 text-orange-600 dark:text-orange-400" />
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
              placeholder="ค้นหาจากเลขทะเบียน, ยี่ห้อ, รุ่น..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">สถานะทั้งหมด</option>
              <option value="active">ใช้งาน</option>
              <option value="inactive">ไม่ใช้งาน</option>
              <option value="maintenance">ซ่อมบำรุง</option>
            </select>
          </div>
        </div>
      </motion.div>



      {/* Trucks List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredTrucks.map((truck, index) => (
          <motion.div
            key={truck.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => navigate(`/app/gas-station/truck-profiles/${truck.id}`)}
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Truck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {truck.plateNumber}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {truck.brand} {truck.model} ({truck.year})
                    </p>
                  </div>
                </div>
                <span
                  className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                    truck.status
                  )}`}
                >
                  {getStatusIcon(truck.status)}
                  {truck.status === "active" ? "ใช้งาน" : truck.status === "inactive" ? "ไม่ใช้งาน" : "ซ่อมบำรุง"}
                </span>
              </div>

              {/* Current Trailer */}
              {truck.currentTrailer && (
                <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Droplet className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">หางที่ใช้อยู่:</span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {truck.currentTrailer.plateNumber}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-500">
                      ความจุ {numberFormatter.format(truck.currentTrailer.capacity)} ลิตร
                    </span>
                  </div>
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {numberFormatter.format(truck.totalTrips)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">เที่ยว</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {numberFormatter.format(truck.totalDistance)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">กม.</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {numberFormatter.format(truck.totalOilDelivered)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">ลิตร</p>
                </div>
              </div>

              {/* Compatible Trailers */}
              <div className="mb-4">
                <p className="text-xs text-gray-500 dark:text-gray-500 mb-2">
                  หางที่ใช้ได้ ({truck.compatibleTrailers.length} หาง):
                </p>
                <div className="flex flex-wrap gap-2">
                  {truck.compatibleTrailers.map((trailer) => (
                    <span
                      key={trailer.id}
                      className={`text-xs px-2 py-1 rounded ${trailer.id === truck.currentTrailerId
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                        : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                        }`}
                    >
                      {trailer.plateNumber}
                    </span>
                  ))}
                </div>
              </div>

              {/* Last Trip */}
              {
                truck.lastTripDate && (
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Calendar className="w-4 h-4" />
                      <span>เที่ยวล่าสุด: {dateFormatter.format(new Date(truck.lastTripDate))}</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                )
              }
            </div >
          </motion.div >
        ))
        }
      </div >



      {filteredTrucks.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700"
        >
          <Truck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">ไม่พบข้อมูลรถ</p>
        </motion.div>
      )}



      {/* Create Truck Modal */}
      <AnimatePresence>
        {showCreateTruckModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowCreateTruckModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">เพิ่มรถใหม่</h2>
                <button
                  onClick={() => setShowCreateTruckModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    ทะเบียนรถ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newTruck.plateNumber}
                    onChange={(e) => setNewTruck({ ...newTruck, plateNumber: e.target.value })}
                    placeholder="เช่น กก 1234"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      ยี่ห้อ <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newTruck.brand}
                      onChange={(e) => setNewTruck({ ...newTruck, brand: e.target.value })}
                      placeholder="เช่น Isuzu, Hino"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      รุ่น <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newTruck.model}
                      onChange={(e) => setNewTruck({ ...newTruck, model: e.target.value })}
                      placeholder="เช่น FVR 34-260"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    ปีรถ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={newTruck.year}
                    onChange={(e) => setNewTruck({ ...newTruck, year: parseInt(e.target.value) })}
                    min="1990"
                    max={new Date().getFullYear() + 1}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      เลขเครื่องยนต์ <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newTruck.engineNumber}
                      onChange={(e) => setNewTruck({ ...newTruck, engineNumber: e.target.value })}
                      placeholder="เช่น ENG-2020-001"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      เลขตัวถัง <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newTruck.chassisNumber}
                      onChange={(e) => setNewTruck({ ...newTruck, chassisNumber: e.target.value })}
                      placeholder="เช่น CHS-2020-001"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    สถานะ
                  </label>
                  <select
                    value={newTruck.status}
                    onChange={(e) => setNewTruck({ ...newTruck, status: e.target.value as "active" | "inactive" | "maintenance" })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="active">ใช้งานอยู่</option>
                    <option value="inactive">ไม่ได้ใช้งาน</option>
                    <option value="maintenance">ซ่อมบำรุง</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    หางที่ใช้ได้
                  </label>
                  <div className="space-y-2 max-h-40 overflow-y-auto p-3 border border-gray-300 dark:border-gray-600 rounded-lg">
                    {mockTrailers.map((trailer) => (
                      <label key={trailer.id} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newTruck.compatibleTrailers.includes(trailer.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewTruck({
                                ...newTruck,
                                compatibleTrailers: [...newTruck.compatibleTrailers, trailer.id],
                              });
                            } else {
                              setNewTruck({
                                ...newTruck,
                                compatibleTrailers: newTruck.compatibleTrailers.filter((id) => id !== trailer.id),
                              });
                            }
                          }}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                        <span className="text-sm text-gray-900 dark:text-white">
                          {trailer.plateNumber} - {numberFormatter.format(trailer.capacity)} ลิตร
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setShowCreateTruckModal(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleCreateTruck}
                  disabled={!newTruck.plateNumber || !newTruck.brand || !newTruck.model || !newTruck.engineNumber || !newTruck.chassisNumber}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  เพิ่มรถ
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div >
  );
}

