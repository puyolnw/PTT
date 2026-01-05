import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Truck,
  Search,
  MapPin,
  Droplet,
  Activity,
  Wrench,
  AlertCircle,
  CheckCircle,
  Plus,
  X,
  Eye,
} from "lucide-react";

const numberFormatter = new Intl.NumberFormat("th-TH", {
  maximumFractionDigits: 0,
});

// const dateFormatter = new Intl.DateTimeFormat("th-TH", {
//   year: "numeric",
//   month: "long",
//   day: "numeric",
// });

import type { Trailer } from "@/types/truck";
import { mockTrailers, mockTrucks } from "@/data/truckData";









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
            <label htmlFor="truck-profiles-search" className="sr-only">ค้นหา</label>
            <input
              id="truck-profiles-search"
              type="text"
              placeholder="ค้นหาจากเลขทะเบียน, ยี่ห้อ, รุ่น..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <label htmlFor="truck-profiles-filter-status" className="sr-only">สถานะ</label>
            <select
              id="truck-profiles-filter-status"
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



      {/* Trucks Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-800">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  เลขทะเบียน
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  ยี่ห้อ/รุ่น
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  หางที่ใช้อยู่
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  จำนวนเที่ยว
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  ระยะทางรวม
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  น้ำมันส่งรวม
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  สถานะ
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  การดำเนินการ
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
              {filteredTrucks.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    ไม่พบข้อมูลรถ
                  </td>
                </tr>
              ) : (
                filteredTrucks.map((truck) => (
                  <tr
                    key={truck.id}
                    onClick={() => navigate(`/app/gas-station/truck-profiles/${truck.id}`)}
                    className="hover:bg-blue-50/50 dark:hover:bg-gray-700/70 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">
                          {truck.plateNumber}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {truck.brand} {truck.model}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        ปี {truck.year}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {truck.currentTrailer ? (
                        <div className="text-sm text-gray-900 dark:text-white">
                          {truck.currentTrailer.plateNumber}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 dark:text-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {numberFormatter.format(truck.totalTrips)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {numberFormatter.format(truck.totalDistance)} กม.
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {numberFormatter.format(truck.totalOilDelivered)} ลิตร
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          truck.status
                        )}`}
                      >
                        {getStatusIcon(truck.status)}
                        {truck.status === "active" ? "ใช้งาน" : truck.status === "inactive" ? "ไม่ใช้งาน" : "ซ่อมบำรุง"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/app/gas-station/truck-profiles/${truck.id}`);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        title="ดูรายละเอียด"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>



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
                  <label htmlFor="truck-profiles-plate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    ทะเบียนรถ <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="truck-profiles-plate"
                    type="text"
                    value={newTruck.plateNumber}
                    onChange={(e) => setNewTruck({ ...newTruck, plateNumber: e.target.value })}
                    placeholder="เช่น กก 1234"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="truck-profiles-brand" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      ยี่ห้อ <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="truck-profiles-brand"
                      type="text"
                      value={newTruck.brand}
                      onChange={(e) => setNewTruck({ ...newTruck, brand: e.target.value })}
                      placeholder="เช่น Isuzu, Hino"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label htmlFor="truck-profiles-model" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      รุ่น <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="truck-profiles-model"
                      type="text"
                      value={newTruck.model}
                      onChange={(e) => setNewTruck({ ...newTruck, model: e.target.value })}
                      placeholder="เช่น FVR 34-260"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="truck-profiles-year" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    ปีรถ <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="truck-profiles-year"
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
                    <label htmlFor="truck-profiles-engine" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      เลขเครื่องยนต์ <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="truck-profiles-engine"
                      type="text"
                      value={newTruck.engineNumber}
                      onChange={(e) => setNewTruck({ ...newTruck, engineNumber: e.target.value })}
                      placeholder="เช่น ENG-2020-001"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label htmlFor="truck-profiles-chassis" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      เลขตัวถัง <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="truck-profiles-chassis"
                      type="text"
                      value={newTruck.chassisNumber}
                      onChange={(e) => setNewTruck({ ...newTruck, chassisNumber: e.target.value })}
                      placeholder="เช่น CHS-2020-001"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="truck-profiles-status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    สถานะ
                  </label>
                  <select
                    id="truck-profiles-status"
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
                  <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    หางที่ใช้ได้
                  </span>
                  <div className="space-y-2 max-h-40 overflow-y-auto p-3 border border-gray-300 dark:border-gray-600 rounded-lg">
                    {mockTrailers.map((trailer) => (
                      <label key={trailer.id} htmlFor={`truck-profiles-trailer-${trailer.id}`} className="flex items-center gap-2 cursor-pointer">
                        <input
                          id={`truck-profiles-trailer-${trailer.id}`}
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

