import { motion } from "framer-motion";
import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Truck,
  ArrowLeft,
  MapPin,
  Droplet,
  Activity,
  Wrench,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  User,
  Settings,
  Clock,
  Building2,
  FileText,
  AlertTriangle,
  History,
} from "lucide-react";

const numberFormatter = new Intl.NumberFormat("th-TH", {
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("th-TH", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

const dateFormatterShort = new Intl.DateTimeFormat("th-TH", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

const timeFormatter = new Intl.DateTimeFormat("th-TH", {
  hour: "2-digit",
  minute: "2-digit",
});


// Interface สำหรับหาง (Trailer)
interface Trailer {
  id: string;
  plateNumber: string; // ทะเบียนรถส่วนหาง (Tail License Plate)
  capacity: number;
  status: "available" | "in-use" | "maintenance";
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
  // เอกสารประจำหาง
  compulsoryInsuranceExpiry?: string;
  vehicleTaxExpiry?: string;
  insuranceExpiry?: string;
  hazmatLicenseExpiry?: string;
}

// Interface สำหรับรถ (Truck Head)
interface TruckProfile {
  id: string;
  plateNumber: string; // ทะเบียนรถส่วนหัว (Head License Plate)
  brand: string;
  model: string;
  year: number;
  engineNumber: string;
  chassisNumber: string;
  status: "active" | "inactive" | "maintenance";
  totalTrips: number;
  totalDistance: number;
  totalOilDelivered: number;
  lastTripDate?: string;
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
  compatibleTrailers: string[];
  currentTrailerId?: string;
  // เอกสารประจำรถหัวลาก
  compulsoryInsuranceExpiry?: string;
  vehicleTaxExpiry?: string;
  insuranceExpiry?: string;
  hazmatLicenseExpiry?: string;
  // ข้อมูลเพิ่มเติม
  lastOdometerReading?: number;
  lastOdometerDate?: string;
  lastFuelReading?: number;
  lastFuelDate?: string;
  currentDriverId?: string;
  currentDriverName?: string;
  purchaseDate?: string;
  purchasePrice?: number;
  registrationDate?: string;
  color?: string;
  fuelType?: string;
  engineCapacity?: string;
  transmission?: string;
}

// Interface สำหรับประวัติการใช้งาน
interface TripHistory {
  id: string;
  truckId: string;
  trailerId: string;
  date: string;
  fromBranch: string;
  toBranch: string;
  oilType: string;
  quantity: number;
  distance: number;
  driver: string;
  status: "completed" | "in-progress" | "cancelled";
  startTime?: string;
  endTime?: string;
  startOdometer?: number;
  endOdometer?: number;
  fuelConsumption?: number;
  cost?: number;
  transportNo?: string;
}

// Interface สำหรับประวัติการบำรุงรักษา
interface MaintenanceHistory {
  id: string;
  truckId: string;
  date: string;
  type: "routine" | "repair" | "inspection" | "emergency";
  description: string;
  cost: number;
  mileage: number;
  serviceProvider?: string;
  notes?: string;
  nextServiceDate?: string;
  parts?: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
  }>;
}

// Mock data - หาง 3 หาง
const mockTrailers: Trailer[] = [
  {
    id: "TRAILER-001",
    plateNumber: "กข 1234",
    capacity: 10000,
    status: "in-use",
    lastMaintenanceDate: "2024-11-15",
    nextMaintenanceDate: "2025-02-15",
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
    lastMaintenanceDate: "2024-10-20",
    nextMaintenanceDate: "2025-01-20",
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
    lastMaintenanceDate: "2024-12-01",
    nextMaintenanceDate: "2025-03-01",
    compulsoryInsuranceExpiry: "2025-09-15",
    vehicleTaxExpiry: "2025-04-20",
    insuranceExpiry: "2025-10-10",
    hazmatLicenseExpiry: "2025-12-25",
  },
];

// Mock data - รถ 2 คัน
const mockTrucks: TruckProfile[] = [
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
    compulsoryInsuranceExpiry: "2025-07-15",
    vehicleTaxExpiry: "2025-06-30",
    insuranceExpiry: "2025-09-20",
    hazmatLicenseExpiry: "2025-11-15",
    lastOdometerReading: 125450,
    lastOdometerDate: "2024-12-15",
    lastFuelReading: 350,
    lastFuelDate: "2024-12-15",
    currentDriverId: "DRIVER-001",
    currentDriverName: "สมชาย ใจดี",
    purchaseDate: "2020-03-15",
    purchasePrice: 3500000,
    registrationDate: "2020-03-20",
    color: "ขาว",
    fuelType: "ดีเซล",
    engineCapacity: "7,800 cc",
    transmission: "Manual 6-speed",
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
    lastMaintenanceDate: "2024-12-01",
    nextMaintenanceDate: "2025-03-01",
    compatibleTrailers: ["TRAILER-001", "TRAILER-002", "TRAILER-003"],
    currentTrailerId: "TRAILER-003",
    compulsoryInsuranceExpiry: "2025-01-10",
    vehicleTaxExpiry: "2025-05-25",
    insuranceExpiry: "2025-08-15",
    hazmatLicenseExpiry: "2025-10-30",
  },
];

// Mock data - ประวัติการใช้งาน
const mockTripHistory: TripHistory[] = [
  {
    id: "TRIP-001",
    truckId: "TRUCK-001",
    trailerId: "TRAILER-001",
    date: "2024-12-15",
    fromBranch: "ปั๊มไฮโซ",
    toBranch: "ดินดำ",
    oilType: "Premium Diesel",
    quantity: 10000,
    distance: 45,
    driver: "สมชาย ใจดี",
    status: "completed",
    startTime: "2024-12-15T08:00:00",
    endTime: "2024-12-15T10:30:00",
    startOdometer: 125405,
    endOdometer: 125450,
    fuelConsumption: 25,
    cost: 15000,
    transportNo: "TP-20241215-001",
  },
  {
    id: "TRIP-002",
    truckId: "TRUCK-001",
    trailerId: "TRAILER-001",
    date: "2024-12-14",
    fromBranch: "ปั๊มไฮโซ",
    toBranch: "หนองจิก",
    oilType: "Gasohol 95",
    quantity: 8000,
    distance: 60,
    driver: "สมชาย ใจดี",
    status: "completed",
    startTime: "2024-12-14T07:30:00",
    endTime: "2024-12-14T11:00:00",
    startOdometer: 125345,
    endOdometer: 125405,
    fuelConsumption: 30,
    cost: 12000,
    transportNo: "TP-20241214-001",
  },
  {
    id: "TRIP-003",
    truckId: "TRUCK-001",
    trailerId: "TRAILER-002",
    date: "2024-12-13",
    fromBranch: "ปั๊มไฮโซ",
    toBranch: "ตักสิลา",
    oilType: "Diesel",
    quantity: 12000,
    distance: 55,
    driver: "สมชาย ใจดี",
    status: "completed",
    startTime: "2024-12-13T09:00:00",
    endTime: "2024-12-13T12:15:00",
    startOdometer: 125290,
    endOdometer: 125345,
    fuelConsumption: 28,
    cost: 18000,
    transportNo: "TP-20241213-001",
  },
  {
    id: "TRIP-004",
    truckId: "TRUCK-001",
    trailerId: "TRAILER-003",
    date: "2024-12-12",
    fromBranch: "ปั๊มไฮโซ",
    toBranch: "บายพาส",
    oilType: "E20",
    quantity: 15000,
    distance: 100,
    driver: "สมชาย ใจดี",
    status: "completed",
    startTime: "2024-12-12T06:00:00",
    endTime: "2024-12-12T13:30:00",
    startOdometer: 125190,
    endOdometer: 125290,
    fuelConsumption: 50,
    cost: 25000,
    transportNo: "TP-20241212-001",
  },
  {
    id: "TRIP-005",
    truckId: "TRUCK-002",
    trailerId: "TRAILER-003",
    date: "2024-12-14",
    fromBranch: "ปั๊มไฮโซ",
    toBranch: "ตักสิลา",
    oilType: "Diesel",
    quantity: 12000,
    distance: 80,
    driver: "วิชัย รักงาน",
    status: "completed",
    startTime: "2024-12-14T08:00:00",
    endTime: "2024-12-14T13:00:00",
    startOdometer: 98000,
    endOdometer: 98080,
    fuelConsumption: 40,
    cost: 18000,
    transportNo: "TP-20241214-002",
  },
  {
    id: "TRIP-006",
    truckId: "TRUCK-002",
    trailerId: "TRAILER-002",
    date: "2024-12-13",
    fromBranch: "ปั๊มไฮโซ",
    toBranch: "บายพาส",
    oilType: "E20",
    quantity: 10000,
    distance: 100,
    driver: "วิชัย รักงาน",
    status: "completed",
    startTime: "2024-12-13T07:00:00",
    endTime: "2024-12-13T14:00:00",
    startOdometer: 97900,
    endOdometer: 98000,
    fuelConsumption: 50,
    cost: 20000,
    transportNo: "TP-20241213-002",
  },
];

// Mock data - ประวัติการบำรุงรักษา
const mockMaintenanceHistory: MaintenanceHistory[] = [
  {
    id: "MAINT-001",
    truckId: "TRUCK-001",
    date: "2024-11-20",
    type: "routine",
    description: "เปลี่ยนน้ำมันเครื่อง, เปลี่ยนกรองอากาศ, ตรวจเช็คระบบเบรก",
    cost: 8500,
    mileage: 123000,
    serviceProvider: "ศูนย์บริการ Isuzu",
    notes: "รถอยู่ในสภาพดี ไม่พบปัญหาอะไร",
    nextServiceDate: "2025-02-20",
    parts: [
      { name: "น้ำมันเครื่อง", quantity: 20, unitPrice: 250 },
      { name: "กรองอากาศ", quantity: 1, unitPrice: 1200 },
      { name: "กรองน้ำมันเครื่อง", quantity: 1, unitPrice: 800 },
    ],
  },
  {
    id: "MAINT-002",
    truckId: "TRUCK-001",
    date: "2024-08-15",
    type: "repair",
    description: "ซ่อมระบบเบรก, เปลี่ยนผ้าเบรกหน้า-หลัง",
    cost: 15000,
    mileage: 115000,
    serviceProvider: "อู่ซ่อมรถยนต์ ABC",
    notes: "ผ้าเบรกหมดอายุ ต้องเปลี่ยนใหม่",
    parts: [
      { name: "ผ้าเบรกหน้า", quantity: 2, unitPrice: 2500 },
      { name: "ผ้าเบรกหลัง", quantity: 2, unitPrice: 2000 },
      { name: "น้ำมันเบรก", quantity: 2, unitPrice: 500 },
    ],
  },
  {
    id: "MAINT-003",
    truckId: "TRUCK-001",
    date: "2024-05-10",
    type: "inspection",
    description: "ตรวจเช็คสภาพรถประจำปี, ตรวจเช็คระบบไฟฟ้า",
    cost: 3000,
    mileage: 108000,
    serviceProvider: "ศูนย์บริการ Isuzu",
    notes: "ผ่านการตรวจสอบทุกมาตรฐาน",
  },
  {
    id: "MAINT-004",
    truckId: "TRUCK-001",
    date: "2024-02-25",
    type: "routine",
    description: "เปลี่ยนน้ำมันเครื่อง, เปลี่ยนกรองน้ำมันเชื้อเพลิง, ตรวจเช็คยาง",
    cost: 7200,
    mileage: 100000,
    serviceProvider: "ศูนย์บริการ Isuzu",
    nextServiceDate: "2024-05-25",
    parts: [
      { name: "น้ำมันเครื่อง", quantity: 20, unitPrice: 250 },
      { name: "กรองน้ำมันเชื้อเพลิง", quantity: 1, unitPrice: 1500 },
    ],
  },
];

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

export default function TruckProfileDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState<"overview" | "trips" | "maintenance" | "documents">("overview");

  // หาข้อมูลรถ
  const truck = useMemo(() => {
    return mockTrucks.find((t) => t.id === id);
  }, [id]);

  // หาข้อมูลหางที่ใช้อยู่
  const currentTrailer = useMemo(() => {
    if (!truck?.currentTrailerId) return null;
    return mockTrailers.find((t) => t.id === truck.currentTrailerId);
  }, [truck]);

  // หาหางที่ใช้ได้ทั้งหมด
  const compatibleTrailers = useMemo(() => {
    if (!truck) return [];
    return truck.compatibleTrailers
      .map((trailerId) => mockTrailers.find((t) => t.id === trailerId))
      .filter((t): t is Trailer => t !== undefined);
  }, [truck]);

  // หาประวัติการใช้งาน
  const tripHistory = useMemo(() => {
    if (!truck) return [];
    return mockTripHistory
      .filter((trip) => trip.truckId === truck.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [truck]);

  // หาประวัติการบำรุงรักษา
  const maintenanceHistory = useMemo(() => {
    if (!truck) return [];
    return mockMaintenanceHistory
      .filter((maint) => maint.truckId === truck.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [truck]);

  // สรุปข้อมูล
  const stats = useMemo(() => {
    if (!truck) return null;

    const thisMonthTrips = tripHistory.filter((trip) => {
      const tripDate = new Date(trip.date);
      const now = new Date();
      return tripDate.getMonth() === now.getMonth() && tripDate.getFullYear() === now.getFullYear();
    });

    const thisMonthDistance = thisMonthTrips.reduce((sum, trip) => sum + trip.distance, 0);
    const thisMonthOil = thisMonthTrips.reduce((sum, trip) => sum + trip.quantity, 0);

    return {
      thisMonthTrips: thisMonthTrips.length,
      thisMonthDistance,
      thisMonthOil,
      averageDistance: tripHistory.length > 0 ? truck.totalDistance / truck.totalTrips : 0,
      averageOil: tripHistory.length > 0 ? truck.totalOilDelivered / truck.totalTrips : 0,
    };
  }, [truck, tripHistory]);

  if (!truck) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Truck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">ไม่พบข้อมูลรถ</p>
          <button
            onClick={() => navigate("/app/gas-station/truck-profiles")}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            กลับไปหน้ารายการ
          </button>
        </div>
      </div>
    );
  }

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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => navigate("/app/gas-station/truck-profiles")}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div className="flex-1">
            <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
              <div className="p-2 bg-emerald-500 rounded-2xl shadow-lg shadow-emerald-500/20">
                <Truck className="w-8 h-8 text-white" />
              </div>
              {truck.plateNumber}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium flex items-center gap-2">
              <History className="w-4 h-4" />
              {truck.brand} {truck.model} ({truck.year})
            </p>
          </div>
          <span
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(
              truck.status
            )}`}
          >
            {truck.status === "active" ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
            {truck.status === "active" ? "ใช้งาน" : truck.status === "inactive" ? "ไม่ใช้งาน" : "ซ่อมบำรุง"}
          </span>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700 mb-6">
        <button
          onClick={() => setSelectedTab("overview")}
          className={`px-6 py-3 font-bold transition-colors ${selectedTab === "overview"
            ? "text-emerald-600 dark:text-emerald-400 border-b-2 border-emerald-600 dark:border-emerald-400"
            : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
        >
          ภาพรวม
        </button>
        <button
          onClick={() => setSelectedTab("trips")}
          className={`px-6 py-3 font-bold transition-colors ${selectedTab === "trips"
            ? "text-emerald-600 dark:text-emerald-400 border-b-2 border-emerald-600 dark:border-emerald-400"
            : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
        >
          ประวัติการใช้งาน ({tripHistory.length})
        </button>
        <button
          onClick={() => setSelectedTab("documents")}
          className={`px-6 py-3 font-bold transition-colors ${selectedTab === "documents"
            ? "text-emerald-600 dark:text-emerald-400 border-b-2 border-emerald-600 dark:border-emerald-400"
            : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
        >
          เอกสาร
        </button>
        <button
          onClick={() => setSelectedTab("maintenance")}
          className={`px-6 py-3 font-bold transition-colors ${selectedTab === "maintenance"
            ? "text-emerald-600 dark:text-emerald-400 border-b-2 border-emerald-600 dark:border-emerald-400"
            : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
        >
          บำรุงรักษา
        </button>
      </div>

      {/* Overview Tab */}
      {selectedTab === "overview" && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl">
                  <Activity className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">เที่ยวทั้งหมด</p>
                  <p className="text-2xl font-black text-gray-900 dark:text-white">{numberFormatter.format(truck.totalTrips)} เที่ยว</p>
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
                <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-2xl">
                  <MapPin className="w-6 h-6 text-purple-500" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">ระยะทางรวม</p>
                  <p className="text-2xl font-black text-gray-900 dark:text-white">{numberFormatter.format(truck.totalDistance)} กม.</p>
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
                <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-2xl">
                  <Droplet className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">น้ำมันส่งรวม</p>
                  <p className="text-2xl font-black text-gray-900 dark:text-white">{numberFormatter.format(truck.totalOilDelivered)} ลิตร</p>
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
                  <TrendingUp className="w-6 h-6 text-emerald-500" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">เที่ยวเดือนนี้</p>
                  <p className="text-2xl font-black text-gray-900 dark:text-white">{stats?.thisMonthTrips || 0} เที่ยว</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Vehicle Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Truck Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm p-6"
            >
              <h3 className="text-lg font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5 text-emerald-500" />
                ข้อมูลรถ
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">เลขทะเบียน:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{truck.plateNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">ยี่ห้อ/รุ่น:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {truck.brand} {truck.model}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">ปีที่ผลิต:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{truck.year}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">เลขเครื่องยนต์:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{truck.engineNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">เลขตัวถัง:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{truck.chassisNumber}</span>
                </div>
                {truck.color && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">สี:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{truck.color}</span>
                  </div>
                )}
                {truck.fuelType && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">ประเภทเชื้อเพลิง:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{truck.fuelType}</span>
                  </div>
                )}
                {truck.engineCapacity && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">ขนาดเครื่องยนต์:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{truck.engineCapacity}</span>
                  </div>
                )}
                {truck.transmission && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">ระบบเกียร์:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{truck.transmission}</span>
                  </div>
                )}
                {truck.purchaseDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">วันที่ซื้อ:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {dateFormatter.format(new Date(truck.purchaseDate))}
                    </span>
                  </div>
                )}
                {truck.purchasePrice && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">ราคาซื้อ:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {numberFormatter.format(truck.purchasePrice)} บาท
                    </span>
                  </div>
                )}
                {truck.lastTripDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">เที่ยวล่าสุด:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {dateFormatter.format(new Date(truck.lastTripDate))}
                    </span>
                  </div>
                )}
                {truck.lastOdometerReading && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">เลขไมล์ล่าสุด:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {numberFormatter.format(truck.lastOdometerReading)} กม.
                      {truck.lastOdometerDate && ` (${dateFormatterShort.format(new Date(truck.lastOdometerDate))})`}
                    </span>
                  </div>
                )}
                {truck.lastFuelReading !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">น้ำมันล่าสุด:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {numberFormatter.format(truck.lastFuelReading)} ลิตร
                      {truck.lastFuelDate && ` (${dateFormatterShort.format(new Date(truck.lastFuelDate))})`}
                    </span>
                  </div>
                )}
                {truck.currentDriverName && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">คนขับปัจจุบัน:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{truck.currentDriverName}</span>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Current Trailer */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm p-6"
            >
              <h3 className="text-lg font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Droplet className="w-5 h-5 text-emerald-500" />
                หางที่ใช้อยู่
              </h3>
              {currentTrailer ? (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">เลขทะเบียน:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {currentTrailer.plateNumber}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">ความจุ:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {numberFormatter.format(currentTrailer.capacity)} ลิตร
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">สถานะ:</span>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${currentTrailer.status === "in-use"
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                        : currentTrailer.status === "available"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                          : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                        }`}
                    >
                      {currentTrailer.status === "in-use"
                        ? "ใช้งานอยู่"
                        : currentTrailer.status === "available"
                          ? "พร้อมใช้งาน"
                          : "ซ่อมบำรุง"}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">ไม่มีหางที่ใช้งานอยู่</p>
              )}
            </motion.div>
          </div>

          {/* Compatible Trailers */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm p-6"
          >
            <h3 className="text-lg font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Truck className="w-5 h-5 text-emerald-500" />
              หางที่ใช้ได้ ({compatibleTrailers.length} หาง)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {compatibleTrailers.map((trailer) => (
                <div
                  key={trailer.id}
                  className={`p-4 rounded-lg border-2 ${trailer.id === truck.currentTrailerId
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50"
                    }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {trailer.plateNumber}
                    </span>
                    {trailer.id === truck.currentTrailerId && (
                      <span className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-1 rounded">
                        ใช้งานอยู่
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    ความจุ: {numberFormatter.format(trailer.capacity)} ลิตร
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    สถานะ:{" "}
                    {trailer.status === "in-use"
                      ? "ใช้งานอยู่"
                      : trailer.status === "available"
                        ? "พร้อมใช้งาน"
                        : "ซ่อมบำรุง"}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}

      {/* Documents Tab */}
      {selectedTab === "documents" && (
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm p-6"
          >
            <h3 className="text-lg font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-500" />
              เอกสารประจำรถ
            </h3>

            {/* Truck Head Documents */}
            <div className="mb-6">
              <h4 className="text-md font-black text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                <Truck className="w-4 h-4 text-emerald-500" />
                เอกสารรถหัวลาก ({truck.plateNumber})
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* พ.ร.บ. */}
                <div className={`p-4 rounded-lg border-2 ${isDocumentExpired(truck.compulsoryInsuranceExpiry)
                  ? "border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-800"
                  : isDocumentExpiringSoon(truck.compulsoryInsuranceExpiry)
                    ? "border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800"
                    : "border-gray-200 bg-gray-50 dark:bg-gray-700/50 dark:border-gray-700"
                  }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">พ.ร.บ.</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {truck.compulsoryInsuranceExpiry
                          ? dateFormatter.format(new Date(truck.compulsoryInsuranceExpiry))
                          : "ไม่ระบุ"}
                      </p>
                      {truck.compulsoryInsuranceExpiry && isDocumentExpiringSoon(truck.compulsoryInsuranceExpiry) && (
                        <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-1">
                          เหลืออีก {getDaysUntilExpiry(truck.compulsoryInsuranceExpiry)} วัน
                        </p>
                      )}
                    </div>
                    {isDocumentExpired(truck.compulsoryInsuranceExpiry) ? (
                      <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                    ) : isDocumentExpiringSoon(truck.compulsoryInsuranceExpiry) ? (
                      <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                    ) : (
                      <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    )}
                  </div>
                </div>

                {/* ทะเบียนรถ */}
                <div className={`p-4 rounded-lg border-2 ${isDocumentExpired(truck.vehicleTaxExpiry)
                  ? "border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-800"
                  : isDocumentExpiringSoon(truck.vehicleTaxExpiry)
                    ? "border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800"
                    : "border-gray-200 bg-gray-50 dark:bg-gray-700/50 dark:border-gray-700"
                  }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">ทะเบียนรถ/ป้ายวงกลม</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {truck.vehicleTaxExpiry
                          ? dateFormatter.format(new Date(truck.vehicleTaxExpiry))
                          : "ไม่ระบุ"}
                      </p>
                      {truck.vehicleTaxExpiry && isDocumentExpiringSoon(truck.vehicleTaxExpiry) && (
                        <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-1">
                          เหลืออีก {getDaysUntilExpiry(truck.vehicleTaxExpiry)} วัน
                        </p>
                      )}
                    </div>
                    {isDocumentExpired(truck.vehicleTaxExpiry) ? (
                      <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                    ) : isDocumentExpiringSoon(truck.vehicleTaxExpiry) ? (
                      <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                    ) : (
                      <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    )}
                  </div>
                </div>

                {/* ประกันภัย */}
                <div className={`p-4 rounded-lg border-2 ${isDocumentExpired(truck.insuranceExpiry)
                  ? "border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-800"
                  : isDocumentExpiringSoon(truck.insuranceExpiry)
                    ? "border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800"
                    : "border-gray-200 bg-gray-50 dark:bg-gray-700/50 dark:border-gray-700"
                  }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">ประกันภัย</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {truck.insuranceExpiry
                          ? dateFormatter.format(new Date(truck.insuranceExpiry))
                          : "ไม่ระบุ"}
                      </p>
                      {truck.insuranceExpiry && isDocumentExpiringSoon(truck.insuranceExpiry) && (
                        <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-1">
                          เหลืออีก {getDaysUntilExpiry(truck.insuranceExpiry)} วัน
                        </p>
                      )}
                    </div>
                    {isDocumentExpired(truck.insuranceExpiry) ? (
                      <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                    ) : isDocumentExpiringSoon(truck.insuranceExpiry) ? (
                      <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                    ) : (
                      <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    )}
                  </div>
                </div>

                {/* ใบอนุญาตขนส่งวัตถุอันตราย */}
                <div className={`p-4 rounded-lg border-2 ${isDocumentExpired(truck.hazmatLicenseExpiry)
                  ? "border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-800"
                  : isDocumentExpiringSoon(truck.hazmatLicenseExpiry)
                    ? "border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800"
                    : "border-gray-200 bg-gray-50 dark:bg-gray-700/50 dark:border-gray-700"
                  }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">ใบอนุญาตขนส่งวัตถุอันตราย</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {truck.hazmatLicenseExpiry
                          ? dateFormatter.format(new Date(truck.hazmatLicenseExpiry))
                          : "ไม่ระบุ"}
                      </p>
                      {truck.hazmatLicenseExpiry && isDocumentExpiringSoon(truck.hazmatLicenseExpiry) && (
                        <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-1">
                          เหลืออีก {getDaysUntilExpiry(truck.hazmatLicenseExpiry)} วัน
                        </p>
                      )}
                    </div>
                    {isDocumentExpired(truck.hazmatLicenseExpiry) ? (
                      <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                    ) : isDocumentExpiringSoon(truck.hazmatLicenseExpiry) ? (
                      <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                    ) : (
                      <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Trailer Documents */}
            {currentTrailer && (
              <div>
                <h4 className="text-md font-black text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                  <Droplet className="w-4 h-4 text-emerald-500" />
                  เอกสารหาง ({currentTrailer.plateNumber})
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* พ.ร.บ. */}
                  <div className={`p-4 rounded-lg border-2 ${isDocumentExpired(currentTrailer.compulsoryInsuranceExpiry)
                    ? "border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-800"
                    : isDocumentExpiringSoon(currentTrailer.compulsoryInsuranceExpiry)
                      ? "border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800"
                      : "border-gray-200 bg-gray-50 dark:bg-gray-700/50 dark:border-gray-700"
                    }`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">พ.ร.บ.</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          {currentTrailer.compulsoryInsuranceExpiry
                            ? dateFormatter.format(new Date(currentTrailer.compulsoryInsuranceExpiry))
                            : "ไม่ระบุ"}
                        </p>
                        {currentTrailer.compulsoryInsuranceExpiry && isDocumentExpiringSoon(currentTrailer.compulsoryInsuranceExpiry) && (
                          <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-1">
                            เหลืออีก {getDaysUntilExpiry(currentTrailer.compulsoryInsuranceExpiry)} วัน
                          </p>
                        )}
                      </div>
                      {isDocumentExpired(currentTrailer.compulsoryInsuranceExpiry) ? (
                        <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                      ) : isDocumentExpiringSoon(currentTrailer.compulsoryInsuranceExpiry) ? (
                        <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                      ) : (
                        <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      )}
                    </div>
                  </div>

                  {/* ทะเบียนรถ */}
                  <div className={`p-4 rounded-lg border-2 ${isDocumentExpired(currentTrailer.vehicleTaxExpiry)
                    ? "border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-800"
                    : isDocumentExpiringSoon(currentTrailer.vehicleTaxExpiry)
                      ? "border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800"
                      : "border-gray-200 bg-gray-50 dark:bg-gray-700/50 dark:border-gray-700"
                    }`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">ทะเบียนรถ/ป้ายวงกลม</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          {currentTrailer.vehicleTaxExpiry
                            ? dateFormatter.format(new Date(currentTrailer.vehicleTaxExpiry))
                            : "ไม่ระบุ"}
                        </p>
                        {currentTrailer.vehicleTaxExpiry && isDocumentExpiringSoon(currentTrailer.vehicleTaxExpiry) && (
                          <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-1">
                            เหลืออีก {getDaysUntilExpiry(currentTrailer.vehicleTaxExpiry)} วัน
                          </p>
                        )}
                      </div>
                      {isDocumentExpired(currentTrailer.vehicleTaxExpiry) ? (
                        <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                      ) : isDocumentExpiringSoon(currentTrailer.vehicleTaxExpiry) ? (
                        <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                      ) : (
                        <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      )}
                    </div>
                  </div>

                  {/* ประกันภัย */}
                  <div className={`p-4 rounded-lg border-2 ${isDocumentExpired(currentTrailer.insuranceExpiry)
                    ? "border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-800"
                    : isDocumentExpiringSoon(currentTrailer.insuranceExpiry)
                      ? "border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800"
                      : "border-gray-200 bg-gray-50 dark:bg-gray-700/50 dark:border-gray-700"
                    }`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">ประกันภัย</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          {currentTrailer.insuranceExpiry
                            ? dateFormatter.format(new Date(currentTrailer.insuranceExpiry))
                            : "ไม่ระบุ"}
                        </p>
                        {currentTrailer.insuranceExpiry && isDocumentExpiringSoon(currentTrailer.insuranceExpiry) && (
                          <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-1">
                            เหลืออีก {getDaysUntilExpiry(currentTrailer.insuranceExpiry)} วัน
                          </p>
                        )}
                      </div>
                      {isDocumentExpired(currentTrailer.insuranceExpiry) ? (
                        <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                      ) : isDocumentExpiringSoon(currentTrailer.insuranceExpiry) ? (
                        <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                      ) : (
                        <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      )}
                    </div>
                  </div>

                  {/* ใบอนุญาตขนส่งวัตถุอันตราย */}
                  <div className={`p-4 rounded-lg border-2 ${isDocumentExpired(currentTrailer.hazmatLicenseExpiry)
                    ? "border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-800"
                    : isDocumentExpiringSoon(currentTrailer.hazmatLicenseExpiry)
                      ? "border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800"
                      : "border-gray-200 bg-gray-50 dark:bg-gray-700/50 dark:border-gray-700"
                    }`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">ใบอนุญาตขนส่งวัตถุอันตราย</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          {currentTrailer.hazmatLicenseExpiry
                            ? dateFormatter.format(new Date(currentTrailer.hazmatLicenseExpiry))
                            : "ไม่ระบุ"}
                        </p>
                        {currentTrailer.hazmatLicenseExpiry && isDocumentExpiringSoon(currentTrailer.hazmatLicenseExpiry) && (
                          <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-1">
                            เหลืออีก {getDaysUntilExpiry(currentTrailer.hazmatLicenseExpiry)} วัน
                          </p>
                        )}
                      </div>
                      {isDocumentExpired(currentTrailer.hazmatLicenseExpiry) ? (
                        <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                      ) : isDocumentExpiringSoon(currentTrailer.hazmatLicenseExpiry) ? (
                        <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                      ) : (
                        <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}

      {/* Trips Tab */}
      {selectedTab === "trips" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-gray-900/50 text-[10px] uppercase tracking-widest font-black text-gray-400">
                  <th className="px-6 py-4">วันที่</th>
                  <th className="px-6 py-4">หาง</th>
                  <th className="px-6 py-4">จาก</th>
                  <th className="px-6 py-4">ไป</th>
                  <th className="px-6 py-4">ประเภทน้ำมัน</th>
                  <th className="px-6 py-4">ปริมาณ</th>
                  <th className="px-6 py-4">ระยะทาง</th>
                  <th className="px-6 py-4">คนขับ</th>
                  <th className="px-6 py-4">เวลา</th>
                  <th className="px-6 py-4">เลขไมล์</th>
                  <th className="px-6 py-4">น้ำมันใช้</th>
                  <th className="px-6 py-4">ค่าใช้จ่าย</th>
                  <th className="px-6 py-4">สถานะ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700 text-sm">
                {tripHistory.length === 0 ? (
                  <tr>
                    <td colSpan={13} className="px-6 py-12 text-center text-gray-400 italic font-medium">
                      <div className="flex flex-col items-center gap-2">
                        <Activity className="w-8 h-8 opacity-20" />
                        ไม่มีประวัติการใช้งาน
                      </div>
                    </td>
                  </tr>
                ) : (
                  tripHistory.map((trip) => {
                    const trailer = mockTrailers.find((t) => t.id === trip.trailerId);
                    return (
                      <tr key={trip.id} className="group hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors font-medium">
                        <td className="px-6 py-4">
                          <span className="font-bold text-gray-700 dark:text-gray-300">
                            {dateFormatterShort.format(new Date(trip.date))}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-bold text-gray-700 dark:text-gray-300">
                            {trailer?.plateNumber || trip.trailerId}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-gray-400" />
                            <span className="font-bold text-gray-700 dark:text-gray-300">{trip.fromBranch}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-emerald-500" />
                            <span className="font-bold text-gray-700 dark:text-gray-300">{trip.toBranch}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Droplet className="w-4 h-4 text-orange-500" />
                            <span className="font-bold text-gray-700 dark:text-gray-300">{trip.oilType}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-bold text-gray-700 dark:text-gray-300">
                            {numberFormatter.format(trip.quantity)} ลิตร
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-bold text-gray-700 dark:text-gray-300">
                            {numberFormatter.format(trip.distance)} กม.
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <span className="font-bold text-gray-700 dark:text-gray-300">{trip.driver}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {trip.startTime && trip.endTime ? (
                            <div className="flex flex-col">
                              <span className="font-bold text-gray-700 dark:text-gray-300">{timeFormatter.format(new Date(trip.startTime))} - {timeFormatter.format(new Date(trip.endTime))}</span>
                              {trip.transportNo && (
                                <span className="text-xs text-gray-500">{trip.transportNo}</span>
                              )}
                            </div>
                          ) : "-"}
                        </td>
                        <td className="px-6 py-4">
                          {trip.startOdometer && trip.endOdometer ? (
                            <div className="flex flex-col">
                              <span className="font-bold text-gray-700 dark:text-gray-300">{numberFormatter.format(trip.startOdometer)} - {numberFormatter.format(trip.endOdometer)}</span>
                              <span className="text-xs text-gray-500">({numberFormatter.format(trip.endOdometer - trip.startOdometer)} กม.)</span>
                            </div>
                          ) : "-"}
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-bold text-gray-700 dark:text-gray-300">
                            {trip.fuelConsumption ? `${numberFormatter.format(trip.fuelConsumption)} ลิตร` : "-"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-bold text-gray-700 dark:text-gray-300">
                            {trip.cost ? `${numberFormatter.format(trip.cost)} บาท` : "-"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-bold ${trip.status === "completed"
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                              : trip.status === "in-progress"
                                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                              }`}
                          >
                            {trip.status === "completed"
                              ? "เสร็จสิ้น"
                              : trip.status === "in-progress"
                                ? "กำลังดำเนินการ"
                                : "ยกเลิก"}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Maintenance Tab */}
      {selectedTab === "maintenance" && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {truck.lastMaintenanceDate && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">บำรุงรักษาล่าสุด</p>
                    <p className="text-lg font-black text-gray-900 dark:text-white mt-1">
                      {dateFormatter.format(new Date(truck.lastMaintenanceDate))}
                    </p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-emerald-500" />
                </div>
              </motion.div>
            )}
            {truck.nextMaintenanceDate && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-amber-50 dark:bg-amber-900/20 rounded-3xl border border-amber-200 dark:border-amber-800 shadow-sm p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">บำรุงรักษาครั้งถัดไป</p>
                    <p className="text-lg font-black text-gray-900 dark:text-white mt-1">
                      {dateFormatter.format(new Date(truck.nextMaintenanceDate))}
                    </p>
                    {truck.nextMaintenanceDate && (
                      <p className="text-xs text-amber-700 dark:text-amber-400 mt-1 font-bold">
                        เหลืออีก {getDaysUntilExpiry(truck.nextMaintenanceDate)} วัน
                      </p>
                    )}
                  </div>
                  <Clock className="w-8 h-8 text-amber-500" />
                </div>
              </motion.div>
            )}
          </div>

          {/* Maintenance History */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm p-6"
          >
            <h3 className="text-lg font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Wrench className="w-5 h-5 text-emerald-500" />
              ประวัติการบำรุงรักษา ({maintenanceHistory.length} รายการ)
            </h3>
            <div className="space-y-4">
              {maintenanceHistory.length === 0 ? (
                <div className="text-center py-12">
                  <Wrench className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">ไม่มีประวัติการบำรุงรักษา</p>
                </div>
              ) : (
                maintenanceHistory.map((maint) => {
                  const getTypeColor = (type: string) => {
                    switch (type) {
                      case "routine":
                        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
                      case "repair":
                        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
                      case "inspection":
                        return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
                      case "emergency":
                        return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
                      default:
                        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
                    }
                  };

                  const getTypeText = (type: string) => {
                    switch (type) {
                      case "routine":
                        return "บำรุงรักษาปกติ";
                      case "repair":
                        return "ซ่อมแซม";
                      case "inspection":
                        return "ตรวจเช็ค";
                      case "emergency":
                        return "ฉุกเฉิน";
                      default:
                        return type;
                    }
                  };

                  return (
                    <div
                      key={maint.id}
                      className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(maint.type)}`}>
                              {getTypeText(maint.type)}
                            </span>
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">
                              {dateFormatter.format(new Date(maint.date))}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              เลขไมล์: {numberFormatter.format(maint.mileage)} กม.
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{maint.description}</p>
                          {maint.serviceProvider && (
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              รับบริการที่: {maint.serviceProvider}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900 dark:text-white">
                            {numberFormatter.format(maint.cost)} บาท
                          </p>
                        </div>
                      </div>
                      {maint.parts && maint.parts.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                          <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">รายการอะไหล่:</p>
                          <div className="space-y-1">
                            {maint.parts.map((part, idx) => (
                              <div key={idx} className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                                <span>
                                  {part.name} x {part.quantity}
                                </span>
                                <span className="font-medium">
                                  {numberFormatter.format(part.quantity * part.unitPrice)} บาท
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {maint.notes && (
                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                          <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">หมายเหตุ:</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">{maint.notes}</p>
                        </div>
                      )}
                      {maint.nextServiceDate && (
                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            บำรุงรักษาครั้งถัดไป: {dateFormatter.format(new Date(maint.nextServiceDate))}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

