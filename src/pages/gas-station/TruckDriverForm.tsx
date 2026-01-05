import { useState, useMemo } from "react";
import { Plus } from "lucide-react";

const numberFormatter = new Intl.NumberFormat("th-TH", {
  maximumFractionDigits: 0,
});

interface TruckDriverFormProps {
  trucks: Array<{
    id: string;
    plateNumber: string;
    brand: string;
    model: string;
    compatibleTrailers: string[];
  }>;
  trailers: Array<{
    id: string;
    plateNumber: string;
    capacity: number;
    status: string;
  }>;
  drivers: Array<{
    id: number;
    code: string;
    name: string;
    position: string;
    dept: string;
  }>;
  onAdd: (truckDriver: {
    truckId: string;
    truckPlateNumber: string;
    trailerId: string;
    trailerPlateNumber: string;
    driverId: number;
    driverName: string;
    driverCode: string;
  }) => void;
}

export default function TruckDriverForm({ trucks, trailers, drivers, onAdd }: TruckDriverFormProps) {
  const [formData, setFormData] = useState({
    truckId: "",
    trailerId: "",
    driverId: "",
  });

  // หาหางที่ใช้ได้ตามรถที่เลือก
  const availableTrailers = useMemo(() => {
    if (!formData.truckId) return [];
    const truck = trucks.find((t) => t.id === formData.truckId);
    if (!truck) return [];
    return trailers.filter((trailer) => truck.compatibleTrailers.includes(trailer.id));
  }, [formData.truckId, trucks, trailers]);

  const handleAdd = () => {
    if (!formData.truckId || !formData.trailerId || !formData.driverId) {
      alert("กรุณาเลือกรถ หาง และคนขับให้ครบถ้วน");
      return;
    }

    const truck = trucks.find((t) => t.id === formData.truckId);
    const trailer = trailers.find((t) => t.id === formData.trailerId);
    const driver = drivers.find((d) => d.id === parseInt(formData.driverId));

    if (!truck || !trailer || !driver) {
      alert("ไม่พบข้อมูลที่เลือก");
      return;
    }

    onAdd({
      truckId: truck.id,
      truckPlateNumber: truck.plateNumber,
      trailerId: trailer.id,
      trailerPlateNumber: trailer.plateNumber,
      driverId: driver.id,
      driverName: driver.name,
      driverCode: driver.code,
    });

    // Reset form
    setFormData({
      truckId: "",
      trailerId: "",
      driverId: "",
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* เลือกรถ */}
        <div>
          <label htmlFor="truck-driver-truck-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            เลือกรถ <span className="text-red-500">*</span>
          </label>
          <select
            id="truck-driver-truck-select"
            value={formData.truckId}
            onChange={(e) => {
              setFormData({ ...formData, truckId: e.target.value, trailerId: "" });
            }}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          >
            <option value="">-- เลือกรถ --</option>
            {trucks.map((truck) => (
              <option key={truck.id} value={truck.id}>
                {truck.plateNumber} - {truck.brand} {truck.model}
              </option>
            ))}
          </select>
        </div>

        {/* เลือกหาง */}
        <div>
          <label htmlFor="truck-driver-trailer-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            เลือกหาง <span className="text-red-500">*</span>
          </label>
          <select
            id="truck-driver-trailer-select"
            value={formData.trailerId}
            onChange={(e) => setFormData({ ...formData, trailerId: e.target.value })}
            disabled={!formData.truckId || availableTrailers.length === 0}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">-- เลือกหาง --</option>
            {availableTrailers.map((trailer) => (
              <option key={trailer.id} value={trailer.id}>
                {trailer.plateNumber} - ความจุ {numberFormatter.format(trailer.capacity)} ลิตร
              </option>
            ))}
          </select>
          {!formData.truckId && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">กรุณาเลือกรถก่อน</p>
          )}
        </div>

        {/* เลือกคนขับ */}
        <div>
          <label htmlFor="truck-driver-driver-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            เลือกคนขับ <span className="text-red-500">*</span>
          </label>
          <select
            id="truck-driver-driver-select"
            value={formData.driverId}
            onChange={(e) => setFormData({ ...formData, driverId: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          >
            <option value="">-- เลือกคนขับ --</option>
            {drivers.map((driver) => (
              <option key={driver.id} value={driver.id}>
                {driver.name} ({driver.code}) - {driver.position}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        onClick={handleAdd}
        disabled={!formData.truckId || !formData.trailerId || !formData.driverId}
        className="w-full px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Plus className="w-4 h-4" />
        เพิ่มรถและคนขับ
      </button>
    </div>
  );
}

