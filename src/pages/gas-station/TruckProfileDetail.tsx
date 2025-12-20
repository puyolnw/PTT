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
    <div className="space-y-6 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4"
      >
        <button
          onClick={() => navigate("/app/gas-station/truck-profiles")}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Truck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            {truck.plateNumber}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
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
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setSelectedTab("overview")}
          className={`px-6 py-3 font-medium transition-colors ${selectedTab === "overview"
            ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
            : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
        >
          ภาพรวม
        </button>
        <button
          onClick={() => setSelectedTab("trips")}
          className={`px-6 py-3 font-medium transition-colors ${selectedTab === "trips"
            ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
            : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
        >
          ประวัติการใช้งาน ({tripHistory.length})
        </button>
        <button
          onClick={() => setSelectedTab("documents")}
          className={`px-6 py-3 font-medium transition-colors ${selectedTab === "documents"
            ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
            : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
        >
          เอกสาร
        </button>
        <button
          onClick={() => setSelectedTab("maintenance")}
          className={`px-6 py-3 font-medium transition-colors ${selectedTab === "maintenance"
            ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">เที่ยวทั้งหมด</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {numberFormatter.format(truck.totalTrips)}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Activity className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">ระยะทางรวม</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {numberFormatter.format(truck.totalDistance)}
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
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">น้ำมันส่งรวม</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {numberFormatter.format(truck.totalOilDelivered)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">ลิตร</p>
                </div>
                <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                  <Droplet className="w-6 h-6 text-orange-600 dark:text-orange-400" />
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
                  <p className="text-sm text-gray-600 dark:text-gray-400">เที่ยวเดือนนี้</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {stats?.thisMonthTrips || 0}
                  </p>
                </div>
                <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
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
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700"
            >
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5" />
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
                {truck.lastTripDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">เที่ยวล่าสุด:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {dateFormatter.format(new Date(truck.lastTripDate))}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Current Trailer */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700"
            >
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Droplet className="w-5 h-5" />
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
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700"
          >
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Truck className="w-5 h-5" />
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
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700"
          >
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              เอกสารประจำรถ
            </h3>

            {/* Truck Head Documents */}
            <div className="mb-6">
              <h4 className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                <Truck className="w-4 h-4" />
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
                <h4 className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                  <Droplet className="w-4 h-4" />
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
          className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    วันที่
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    หาง
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    จาก
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    ไป
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    ประเภทน้ำมัน
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    ปริมาณ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    ระยะทาง
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    คนขับ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    สถานะ
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {tripHistory.map((trip) => {
                  const trailer = mockTrailers.find((t) => t.id === trip.trailerId);
                  return (
                    <tr key={trip.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {dateFormatter.format(new Date(trip.date))}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {trailer?.plateNumber || trip.trailerId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-gray-400" />
                          {trip.fromBranch}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-blue-500" />
                          {trip.toBranch}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        <div className="flex items-center gap-2">
                          <Droplet className="w-4 h-4 text-orange-500" />
                          {trip.oilType}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">
                        {numberFormatter.format(trip.quantity)} ลิตร
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {numberFormatter.format(trip.distance)} กม.
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          {trip.driver}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${trip.status === "completed"
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
                })}
              </tbody>
            </table>
          </div>
          {tripHistory.length === 0 && (
            <div className="text-center py-12">
              <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">ไม่มีประวัติการใช้งาน</p>
            </div>
          )}
        </motion.div>
      )}

      {/* Maintenance Tab */}
      {selectedTab === "maintenance" && (
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700"
          >
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Wrench className="w-5 h-5" />
              ประวัติการบำรุงรักษา
            </h3>
            <div className="space-y-4">
              {truck.lastMaintenanceDate && (
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">บำรุงรักษาล่าสุด</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {dateFormatter.format(new Date(truck.lastMaintenanceDate))}
                      </p>
                    </div>
                    <CheckCircle className="w-6 h-6 text-emerald-500" />
                  </div>
                </div>
              )}
              {truck.nextMaintenanceDate && (
                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">บำรุงรักษาครั้งถัดไป</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {dateFormatter.format(new Date(truck.nextMaintenanceDate))}
                      </p>
                    </div>
                    <Clock className="w-6 h-6 text-amber-500" />
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

