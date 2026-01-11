import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Truck,
  Search,
  MapPin,
  Droplet,
  Activity,
  Plus,
  X,
  Eye,
  Filter,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  History,
  Check,
  Clock,
  FileText,
} from "lucide-react";
import TableActionMenu from "@/components/TableActionMenu";
import StatusTag from "@/components/StatusTag";

const numberFormatter = new Intl.NumberFormat("th-TH", {
  maximumFractionDigits: 0,
});

// const dateFormatter = new Intl.DateTimeFormat("th-TH", {
//   year: "numeric",
//   month: "long",
//   day: "numeric",
// });

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
  // Fuel tracking (optional)
  lastFuelReading?: number; // ปริมาณน้ำมันล่าสุด (ลิตร)
  lastFuelDate?: string; // วันที่บันทึกน้ำมันล่าสุด
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
  status: "draft" | "quotation-recorded" | "ready-to-pickup" | "picking-up" | "delivering" | "completed" | "cancelled";

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
  
  // Fuel tracking fields
  startFuel?: number; // น้ำมันตอนเริ่มต้น (ลิตร)
  endFuel?: number; // น้ำมันตอนสิ้นสุด (ลิตร)
  fuelConsumed?: number; // น้ำมันที่ใช้ไป (ลิตร)

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
    // Fuel (mock)
    lastFuelReading: 450,
    lastFuelDate: "2024-12-15",
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
    // Fuel (mock)
    lastFuelReading: 380,
    lastFuelDate: "2024-12-14",
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
    toBranch: "ดินดำ",
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
    toBranch: "หนองจิก",
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
    toBranch: "ตักสิลา",
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
  const [columnFilters, setColumnFilters] = useState<{
    status: string;
  }>({
    status: "ทั้งหมด"
  });
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' | null }>({ key: 'plateNumber', direction: 'asc' });
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");


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
    let result = trucksWithTrailers.filter((truck) => {
      const matchesSearch =
        truck.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        truck.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        truck.model.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Column Filters
      const matchesStatus = columnFilters.status === "ทั้งหมด" || truck.status === columnFilters.status;
      const matchesFilterStatus = filterStatus === "all" || truck.status === filterStatus;

      // Date Range Filter
      const matchesDateFrom = !filterDateFrom || (truck.lastTripDate && new Date(truck.lastTripDate) >= new Date(filterDateFrom));
      const matchesDateTo = !filterDateTo || (truck.lastTripDate && new Date(truck.lastTripDate) <= new Date(filterDateTo));

      return matchesSearch && matchesStatus && matchesFilterStatus && matchesDateFrom && matchesDateTo;
    });

    // Sorting
    if (sortConfig.key && sortConfig.direction) {
      result.sort((a, b) => {
        let aValue: any;
        let bValue: any;

        switch (sortConfig.key) {
          case 'plateNumber':
            aValue = a.plateNumber;
            bValue = b.plateNumber;
            break;
          case 'totalTrips':
            aValue = a.totalTrips;
            bValue = b.totalTrips;
            break;
          case 'totalDistance':
            aValue = a.totalDistance;
            bValue = b.totalDistance;
            break;
          case 'totalOilDelivered':
            aValue = a.totalOilDelivered;
            bValue = b.totalOilDelivered;
            break;
          default:
            aValue = (a as any)[sortConfig.key];
            bValue = (b as any)[sortConfig.key];
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [trucksWithTrailers, searchTerm, filterStatus, columnFilters, sortConfig, filterDateFrom, filterDateTo]);

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

  // ดึงค่า Unique สำหรับ Filter Dropdowns
  const filterOptions = useMemo(() => {
    return {
      status: ["ทั้งหมด", ...new Set(trucksWithTrailers.map(t => t.status))]
    };
  }, [trucksWithTrailers]);

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
                        {opt === "active" ? "ใช้งาน" : opt === "inactive" ? "ไม่ใช้งาน" : opt === "maintenance" ? "ซ่อมบำรุง" : opt}
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
           filterDateFrom !== "" ||
           filterDateTo !== "" ||
           searchTerm !== "" ||
           filterStatus !== "all";
  }, [columnFilters, filterDateFrom, filterDateTo, searchTerm, filterStatus]);

  const clearFilters = () => {
    setColumnFilters({
      status: "ทั้งหมด"
    });
    setSearchTerm("");
    setFilterDateFrom("");
    setFilterDateTo("");
    setFilterStatus("all");
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      {/* Header */}
      <header className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
              <div className="p-2 bg-emerald-500 rounded-2xl shadow-lg shadow-emerald-500/20">
                <Truck className="w-8 h-8 text-white" />
              </div>
              โปรไฟล์รถส่งน้ำมัน
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium flex items-center gap-2">
              <History className="w-4 h-4" />
              จัดการข้อมูลรถและหางส่งน้ำมัน รวมถึงประวัติการใช้งานและออเดอร์รถ
            </p>
          </div>
          <button
            onClick={() => setShowCreateTruckModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl shadow-lg shadow-emerald-500/20 transition-all font-bold"
          >
            <Plus className="w-5 h-5" />
            เพิ่มรถใหม่
          </button>
        </div>
      </header>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl">
              <Truck className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">รถที่ใช้งาน</p>
              <p className="text-2xl font-black text-gray-900 dark:text-white">{summary.activeTrucks} / {mockTrucks.length} คัน</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-2xl">
              <Activity className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">จำนวนเที่ยวทั้งหมด</p>
              <p className="text-2xl font-black text-gray-900 dark:text-white">{numberFormatter.format(summary.totalTrips)} เที่ยว</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-2xl">
              <MapPin className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">ระยะทางรวม</p>
              <p className="text-2xl font-black text-gray-900 dark:text-white">{numberFormatter.format(summary.totalDistance)} กม.</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl">
              <Droplet className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">น้ำมันส่งรวม</p>
              <p className="text-2xl font-black text-gray-900 dark:text-white">{numberFormatter.format(summary.totalOilDelivered)} ลิตร</p>
            </div>
          </div>
        </motion.div>
      </div>


      {/* Filter Bar */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="ค้นหาจากเลขทะเบียน, ยี่ห้อ, รุ่น..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900 dark:text-white font-medium"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:flex-initial">
            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="date"
              value={filterDateFrom}
              onChange={(e) => setFilterDateFrom(e.target.value)}
              className="pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900 dark:text-white font-medium text-sm"
              placeholder="จากวันที่"
            />
          </div>
          <span className="text-gray-400 font-bold">-</span>
          <div className="relative flex-1 md:flex-initial">
            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="date"
              value={filterDateTo}
              onChange={(e) => setFilterDateTo(e.target.value)}
              className="pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900 dark:text-white font-medium text-sm"
              placeholder="ถึงวันที่"
            />
          </div>
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
        </div>
      </div>



      {/* Trucks Table */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-gray-900/50 text-[10px] uppercase tracking-widest font-black text-gray-400">
                <HeaderWithFilter 
                  label="เลขทะเบียน" 
                  columnKey="plateNumber" 
                />
                <th className="px-6 py-4">
                  <div className="flex items-center gap-1.5">
                    <Truck className="w-3 h-3" />
                    ยี่ห้อ/รุ่น
                  </div>
                </th>
                <th className="px-6 py-4">
                  <div className="flex items-center gap-1.5">
                    <Droplet className="w-3 h-3" />
                    หางที่ใช้อยู่
                  </div>
                </th>
                <HeaderWithFilter 
                  label="จำนวนเที่ยว" 
                  columnKey="totalTrips" 
                />
                <HeaderWithFilter 
                  label="ระยะทางรวม" 
                  columnKey="totalDistance" 
                />
                <HeaderWithFilter 
                  label="น้ำมันส่งรวม" 
                  columnKey="totalOilDelivered" 
                />
                <HeaderWithFilter 
                  label="สถานะ" 
                  filterKey="status"
                  options={filterOptions.status}
                />
                <th className="px-6 py-4 text-center">การดำเนินการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700 text-sm">
              {filteredTrucks.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-400 italic font-medium">
                    <div className="flex flex-col items-center gap-2">
                      <Search className="w-8 h-8 opacity-20" />
                      ไม่พบข้อมูลรถ
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTrucks.map((truck) => (
                  <tr
                    key={truck.id}
                    className="group hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors font-medium"
                  >
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-900 dark:text-white">
                          {truck.plateNumber}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-700 dark:text-gray-300">
                          {truck.brand} {truck.model}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          ปี {truck.year}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {truck.currentTrailer ? (
                        <span className="font-bold text-gray-700 dark:text-gray-300">
                          {truck.currentTrailer.plateNumber}
                        </span>
                      ) : (
                        <span className="text-gray-400 italic">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-gray-700 dark:text-gray-300">
                        {numberFormatter.format(truck.totalTrips)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-gray-700 dark:text-gray-300">
                        {numberFormatter.format(truck.totalDistance)} กม.
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-gray-700 dark:text-gray-300">
                        {numberFormatter.format(truck.totalOilDelivered)} ลิตร
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusTag variant={
                        truck.status === "active" ? "success" :
                        truck.status === "maintenance" ? "warning" :
                        "neutral"
                      }>
                        {truck.status === "active" ? "ใช้งาน" : truck.status === "inactive" ? "ไม่ใช้งาน" : "ซ่อมบำรุง"}
                      </StatusTag>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <TableActionMenu
                          actions={[
                            {
                              label: "ดูรายละเอียด",
                              icon: Eye,
                              onClick: () => navigate(`/app/gas-station/truck-profiles/${truck.id}`)
                            }
                          ]}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>



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
              <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-emerald-50 dark:bg-emerald-900/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500 rounded-xl">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-emerald-800 dark:text-emerald-400">เพิ่มรถใหม่</h2>
                  </div>
                </div>
                <button
                  onClick={() => setShowCreateTruckModal(false)}
                  className="p-2 hover:bg-white dark:hover:bg-gray-700 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
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

              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                <button
                  onClick={() => setShowCreateTruckModal(false)}
                  className="px-6 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-2xl transition-colors font-bold"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleCreateTruck}
                  disabled={!newTruck.plateNumber || !newTruck.brand || !newTruck.model || !newTruck.engineNumber || !newTruck.chassisNumber}
                  className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl transition-colors font-bold shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
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

