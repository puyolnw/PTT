import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import {
  Plus,
  Save,
  Droplet,
  Building2,
  MapPin,
  Trash2,
  ShoppingCart,
  Truck,
  CheckCircle,
  X,
  User,
  Info,
  Search,
  ChevronDown,
} from "lucide-react";
import { mockTrucks, mockTrailers } from "@/data/truckData";
import { employees } from "@/data/mockData";

const numberFormatter = new Intl.NumberFormat("th-TH", {
  maximumFractionDigits: 0,
});

// ตัวเลือกปริมาณมาตรฐาน (ลิตร) สำหรับ dropdown
const quantityOptions = [
  1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000,
  12000, 15000,
];

type Branch = {
  id: number;
  name: string;
  code: string;
  address: string;
  legalEntityName: string;
};

type LegalEntity = {
  id: number;
  name: string;
};

type OrderItem = {
  branchId: number;
  branchName: string;
  oilType: string;
  quantity: number;
  legalEntityId: number;
  legalEntityName: string;
};

type TruckDriverPair = {
  truckOrderId: string;
  truckOrderNo: string;
  truckId: string;
  truckPlateNumber: string;
  trailerId: string;
  trailerPlateNumber: string;
  isPTTTruck?: boolean; // เป็นรถของ PTT หรือไม่
  driverId?: string; // ID ของคนขับ
  driverName?: string; // ชื่อคนขับ
  driverCode?: string; // รหัสพนักงานคนขับ
};

type NewOrderFormProps = {
  branches: Branch[];
  legalEntities: LegalEntity[];
  items: OrderItem[];
  onItemsChange: (items: OrderItem[]) => void;
  onClose: () => void;
  onSave: (items: OrderItem[], selectedTrucksAndDrivers: TruckDriverPair[]) => void;
};

const oilTypes = [
  "Premium Diesel",
  "Premium Gasohol 95",
  "Diesel",
  "E85",
  "E20",
  "Gasohol 91",
  "Gasohol 95",
];

export default function NewOrderForm({
  branches,
  legalEntities,
  items,
  onItemsChange,
  onClose,
  onSave,
}: NewOrderFormProps) {
  const [selectedBranch, setSelectedBranch] = useState<number>(branches[0]?.id || 1);
  const [selectedOilType, setSelectedOilType] = useState<string>("");
  const [selectedQuantity, setSelectedQuantity] = useState<string>("");
  const [selectedLegalEntity, setSelectedLegalEntity] = useState<number>(legalEntities[0]?.id || 1);
  const [selectedTrucksAndDrivers, setSelectedTrucksAndDrivers] = useState<TruckDriverPair[]>([]);
  const [showTruckDriverModal, setShowTruckDriverModal] = useState(false);

  // Form state for adding truck order
  const [truckDriverForm, setTruckDriverForm] = useState({
    truckOrderId: "",
    truckId: "",
    trailerId: "",
    driverId: "",
  });
  const [isPTTTruckSelected, setIsPTTTruckSelected] = useState(false);
  const [driverSearchQuery, setDriverSearchQuery] = useState("");
  const [isDriverDropdownOpen, setIsDriverDropdownOpen] = useState(false);

  // Filter employees who can be drivers (อาจจะกรองตาม position หรือ dept)
  const availableDrivers = employees.filter((emp) => emp.status === "Active");

  // Filter drivers based on search query
  const filteredDrivers = availableDrivers.filter((driver) => {
    const searchLower = driverSearchQuery.toLowerCase();
    return (
      driver.name.toLowerCase().includes(searchLower) ||
      driver.code.toLowerCase().includes(searchLower) ||
      driver.position.toLowerCase().includes(searchLower) ||
      (driver.dept && driver.dept.toLowerCase().includes(searchLower))
    );
  });

  // Get selected driver info
  const selectedDriver = availableDrivers.find((d) => d.id.toString() === truckDriverForm.driverId);

  // Ref for driver dropdown
  const driverDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (driverDropdownRef.current && !driverDropdownRef.current.contains(event.target as Node)) {
        setIsDriverDropdownOpen(false);
      }
    };

    if (isDriverDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDriverDropdownOpen]);

  // ตรวจสอบว่ามีการสั่งน้ำมัน Premium Diesel หรือไม่
  const hasPremiumDiesel = items.some((item) =>
    item.oilType.toLowerCase().includes("premium") &&
    item.oilType.toLowerCase().includes("diesel")
  );


  const handleAddTruckDriver = () => {
    if (hasPremiumDiesel) {
      // กรณี Premium Diesel - ใช้รถของ PTT โดยไม่ต้องเลือกรถและหาง
      if (!isPTTTruckSelected) {
        alert("กรุณาเลือกรถของ PTT");
        return;
      }

      // สร้าง orderNo สำหรับรถ PTT
      const orderNo = `PTT-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${String(selectedTrucksAndDrivers.length + 1).padStart(3, '0')}`;

      const newPair: TruckDriverPair = {
        truckOrderId: `PTT-${Date.now()}`,
        truckOrderNo: orderNo,
        truckId: "PTT-TRUCK",
        truckPlateNumber: "รถของ PTT",
        trailerId: "PTT-TRAILER",
        trailerPlateNumber: "หางของ PTT",
        isPTTTruck: true,
      };

      setSelectedTrucksAndDrivers([...selectedTrucksAndDrivers, newPair]);
      setIsPTTTruckSelected(false);
      setTruckDriverForm({ truckOrderId: "", truckId: "", trailerId: "", driverId: "" });
    } else {
      // กรณีปกติ - เลือกหัวรถ, หางรถ, และคนขับแยกกัน
      if (!truckDriverForm.truckId) {
        alert("กรุณาเลือกหัวรถ");
        return;
      }

      if (!truckDriverForm.trailerId) {
        alert("กรุณาเลือกหางรถ");
        return;
      }

      if (!truckDriverForm.driverId) {
        alert("กรุณาเลือกคนขับรถ");
        return;
      }

      const truck = mockTrucks.find((t) => t.id === truckDriverForm.truckId);
      const trailer = mockTrailers.find((t) => t.id === truckDriverForm.trailerId);
      const driver = availableDrivers.find((d) => d.id.toString() === truckDriverForm.driverId);

      if (!truck) {
        alert("ไม่พบข้อมูลรถที่เลือก");
        return;
      }

      if (!trailer) {
        alert("ไม่พบข้อมูลหางรถที่เลือก");
        return;
      }

      if (!driver) {
        alert("ไม่พบข้อมูลคนขับที่เลือก");
        return;
      }

      // สร้าง orderNo
      const orderNo = `TO-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${String(selectedTrucksAndDrivers.length + 1).padStart(3, '0')}`;

      const newPair: TruckDriverPair = {
        truckOrderId: `TO-${Date.now()}`,
        truckOrderNo: orderNo,
        truckId: truck.id,
        truckPlateNumber: truck.plateNumber,
        trailerId: trailer.id,
        trailerPlateNumber: trailer.plateNumber,
        isPTTTruck: false,
        driverId: driver.id.toString(),
        driverName: driver.name,
        driverCode: driver.code,
      };

      setSelectedTrucksAndDrivers([...selectedTrucksAndDrivers, newPair]);
      setTruckDriverForm({ truckOrderId: "", truckId: "", trailerId: "", driverId: "" });
    }
  };

  const handleCloseModal = () => {
    setShowTruckDriverModal(false);
    setIsPTTTruckSelected(false);
    setTruckDriverForm({ truckOrderId: "", truckId: "", trailerId: "", driverId: "" });
    setDriverSearchQuery("");
    setIsDriverDropdownOpen(false);
  };

  const addItem = () => {
    if (!selectedOilType || !selectedQuantity || parseFloat(selectedQuantity) <= 0) {
      alert("กรุณาเลือกประเภทน้ำมันและกรอกจำนวน");
      return;
    }

    const branch = branches.find((b) => b.id === selectedBranch);
    const legalEntity = legalEntities.find((le) => le.id === selectedLegalEntity);

    if (!branch || !legalEntity) {
      alert("ไม่พบข้อมูลสาขาหรือนิติบุคคล");
      return;
    }

    const newItem: OrderItem = {
      branchId: selectedBranch,
      branchName: branch.name,
      oilType: selectedOilType,
      quantity: parseFloat(selectedQuantity),
      legalEntityId: selectedLegalEntity,
      legalEntityName: legalEntity.name,
    };

    onItemsChange([...items, newItem]);
    setSelectedOilType("");
    setSelectedQuantity("");
  };

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    onItemsChange(newItems);
  };

  const updateItem = (index: number, field: keyof OrderItem, value: string | number) => {
    let updatedItems = items.map((item, i) =>
      i === index ? ({ ...item, [field]: value } as OrderItem) : item
    );

    if (field === "legalEntityId") {
      const legalEntity = legalEntities.find((le) => le.id === value);
      if (legalEntity) {
        updatedItems = updatedItems.map((item, i) =>
          i === index ? { ...item, legalEntityName: legalEntity.name } : item
        );
      }
    }

    onItemsChange(updatedItems);
  };

  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const uniqueBranches = new Set(items.map((i) => i.branchId)).size;

  return (
    <div className="space-y-6">
      {/* Add Item Form */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm">
        <h4 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5 text-blue-500" />
          เพิ่มรายการสั่งซื้อ
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* เลือกสาขา */}
          <div>
            <label htmlFor="branch-select" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              สาขา *
            </label>
            <select
              id="branch-select"
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(parseInt(e.target.value))}
              className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 text-gray-800 dark:text-white"
            >
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
          </div>

          {/* เลือกประเภทน้ำมัน */}
          <div>
            <label htmlFor="oil-type-select" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              ประเภทน้ำมัน *
            </label>
            <select
              id="oil-type-select"
              value={selectedOilType}
              onChange={(e) => setSelectedOilType(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 text-gray-800 dark:text-white"
            >
              <option value="">เลือกประเภทน้ำมัน</option>
              {oilTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* จำนวน */}
          <div>
            <label htmlFor="quantity-select" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              จำนวน (ลิตร) *
            </label>
            <select
              id="quantity-select"
              value={selectedQuantity}
              onChange={(e) => setSelectedQuantity(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 text-gray-800 dark:text-white"
            >
              <option value="">เลือกปริมาณ</option>
              {quantityOptions.map((qty) => (
                <option key={qty} value={qty}>
                  {numberFormatter.format(qty)} ลิตร
                </option>
              ))}
            </select>
          </div>

          {/* นิติบุคคล */}
          <div>
            <label htmlFor="legal-entity-select" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              นิติบุคคล *
            </label>
            <select
              id="legal-entity-select"
              value={selectedLegalEntity}
              onChange={(e) => setSelectedLegalEntity(parseInt(e.target.value))}
              className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 text-gray-800 dark:text-white"
            >
              {legalEntities.map((entity) => (
                <option key={entity.id} value={entity.id}>
                  {entity.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            onClick={addItem}
            className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl transition-all duration-200 font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            เพิ่มรายการ
          </button>
        </div>
      </div>

      {/* Items List */}
      {items.length > 0 && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h4 className="text-lg font-bold text-gray-800 dark:text-white mb-1">
              รายการสั่งซื้อ ({uniqueBranches} สาขา, {items.length} รายการ)
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              ยอดรวม: {numberFormatter.format(totalQuantity)} ลิตร
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">สาขา</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">ประเภทน้ำมัน</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">จำนวน (ลิตร)</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">นิติบุคคล</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <motion.tr
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-blue-500" />
                        <span className="text-sm font-semibold text-gray-800 dark:text-white">{item.branchName}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Droplet className="w-4 h-4 text-blue-500" />
                        <label htmlFor={`oil-type-${index}`} className="sr-only">ประเภทน้ำมัน</label>
                        <select
                          id={`oil-type-${index}`}
                          value={item.oilType}
                          onChange={(e) => updateItem(index, "oilType", e.target.value)}
                          className="px-2 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-gray-800 dark:text-white text-sm"
                        >
                          {oilTypes.map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <label htmlFor={`item-quantity-${index}`} className="sr-only">จำนวน (ลิตร)</label>
                      <select
                        id={`item-quantity-${index}`}
                        value={item.quantity}
                        onChange={(e) => updateItem(index, "quantity", parseFloat(e.target.value) || 0)}
                        className="w-32 px-2 py-1 text-right bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-gray-800 dark:text-white text-sm"
                      >
                        {quantityOptions.map((qty) => (
                          <option key={qty} value={qty}>
                            {numberFormatter.format(qty)}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3 px-4">
                      <label htmlFor={`item-legal-entity-${index}`} className="sr-only">นิติบุคคล</label>
                      <select
                        id={`item-legal-entity-${index}`}
                        value={item.legalEntityId}
                        onChange={(e) => updateItem(index, "legalEntityId", parseInt(e.target.value))}
                        className="w-full px-2 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-gray-800 dark:text-white text-sm"
                      >
                        {legalEntities.map((entity) => (
                          <option key={entity.id} value={entity.id}>
                            {entity.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => removeItem(index)}
                        className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                        title="ลบรายการ"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {items.length === 0 && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-12 text-center">
          <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">ยังไม่มีรายการสั่งซื้อ</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">กรุณาเพิ่มรายการสั่งซื้อด้านบน</p>
        </div>
      )}

      {/* Selected Trucks and Drivers */}
      {selectedTrucksAndDrivers.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <Truck className="w-5 h-5 text-blue-500" />
              รถและคนขับที่เลือก ({selectedTrucksAndDrivers.length} คัน)
            </h4>
            <button
              onClick={() => setShowTruckDriverModal(true)}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              เพิ่มออเดอร์รถ
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {selectedTrucksAndDrivers.map((pair, index) => {
              const truck = mockTrucks.find((t) => t.id === pair.truckId);
              const trailer = mockTrailers.find((t) => t.id === pair.trailerId);

              return (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-blue-200 dark:border-blue-700"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-gray-900 dark:text-white text-sm">
                          {pair.truckOrderNo}
                        </span>
                        {pair.isPTTTruck && (
                          <span className="px-2 py-0.5 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded text-xs font-medium">
                            รถ PTT
                          </span>
                        )}
                      </div>
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center gap-2">
                          <Truck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                          <span className="text-gray-600 dark:text-gray-400">
                            รถ: {pair.truckPlateNumber}
                            {truck && ` (${truck.brand} ${truck.model})`}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Droplet className="w-3.5 h-3.5 text-orange-500" />
                          <span className="text-gray-600 dark:text-gray-400">
                            หาง: {pair.trailerPlateNumber}
                            {trailer && ` (${numberFormatter.format(trailer.capacity)} ลิตร)`}
                          </span>
                        </div>
                        {pair.driverName && (
                          <div className="flex items-center gap-2">
                            <User className="w-3.5 h-3.5 text-purple-500" />
                            <span className="text-gray-600 dark:text-gray-400">
                              คนขับ: {pair.driverName}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedTrucksAndDrivers(selectedTrucksAndDrivers.filter((_, i) => i !== index))}
                      className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded ml-2"
                    >
                      <X className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Truck Selection Button */}
      {selectedTrucksAndDrivers.length === 0 && items.length > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Truck className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              <div>
                <p className="text-sm font-semibold text-gray-800 dark:text-white">
                  {hasPremiumDiesel
                    ? "กรุณาเลือกออเดอร์รถของ PTT สำหรับจัดส่ง Premium Diesel"
                    : "กรุณาเลือกออเดอร์รถสำหรับจัดส่ง"
                  }
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {hasPremiumDiesel
                    ? "การสั่งน้ำมัน Premium Diesel ต้องใช้รถของ PTT เท่านั้น"
                    : "เลือกออเดอร์รถจากรายการที่มีอยู่"
                  }
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowTruckDriverModal(true)}
              className="px-6 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl transition-all duration-200 font-semibold shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              <Truck className="w-4 h-4" />
              เลือกออเดอร์รถ
            </button>
          </div>
        </div>
      )}

      {/* Summary */}
      {items.length > 0 && (
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
          <h4 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-500" />
            สรุปยอดรวม
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1 font-semibold">จำนวนสาขา</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{uniqueBranches} สาขา</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1 font-semibold">จำนวนรายการ</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{items.length} รายการ</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1 font-semibold">ยอดรวม (ลิตร)</p>
              <p className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">
                {numberFormatter.format(totalQuantity)} ลิตร
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Footer Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={onClose}
          className="px-6 py-2.5 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-all duration-200 font-medium hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
        >
          ยกเลิก
        </button>
        <button
          onClick={() => {
            if (selectedTrucksAndDrivers.length === 0) {
              alert(hasPremiumDiesel
                ? "กรุณาเลือกออเดอร์รถของ PTT สำหรับจัดส่ง Premium Diesel"
                : "กรุณาเลือกออเดอร์รถสำหรับจัดส่ง"
              );
              setShowTruckDriverModal(true);
              return;
            }
            onSave(items, selectedTrucksAndDrivers);
          }}
          disabled={items.length === 0}
          className="px-8 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl transition-all duration-200 font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
        >
          <Save className="w-4 h-4" />
          บันทึกใบสั่งซื้อ
        </button>
      </div>

      {/* Truck and Driver Selection Modal */}
      <AnimatePresence>
        {showTruckDriverModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              className="fixed inset-0 bg-black/50 z-50"
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col"
              >
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
                      <Truck className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-1">
                        เลือกออเดอร์รถ
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {hasPremiumDiesel
                          ? "เลือกออเดอร์รถของ PTT สำหรับจัดส่ง Premium Diesel"
                          : "เลือกออเดอร์รถสำหรับจัดส่ง"
                        }
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleCloseModal}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all duration-200 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-6 bg-gray-50 dark:bg-gray-900/50">
                  <div className="space-y-6">
                    {/* Add Truck Order and Driver Form */}
                    <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
                          <Plus className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="text-xl font-bold text-gray-900 dark:text-white">
                            เพิ่มออเดอร์รถ
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                            {hasPremiumDiesel
                              ? "เลือกออเดอร์รถของ PTT สำหรับจัดส่ง Premium Diesel"
                              : "เลือกออเดอร์รถสำหรับจัดส่ง"
                            }
                          </p>
                        </div>
                      </div>

                      {hasPremiumDiesel && (
                        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border-2 border-red-200 dark:border-red-800">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Info className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <p className="font-semibold text-red-900 dark:text-red-100">
                                การสั่งน้ำมัน Premium Diesel
                              </p>
                              <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                                ต้องใช้รถของ PTT เท่านั้น รถที่ทาง PTT จัดส่งน้ำมันดีเชลพรีเมี่ยมโดยเฉพาะ
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="space-y-3">
                        {hasPremiumDiesel ? (
                          <>
                            {/* เลือกรถของ PTT */}
                            <div>
                              <label htmlFor="ptt-truck-btn" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                <span className="flex items-center gap-2">
                                  <Truck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                  เลือกรถของ PTT
                                  <span className="text-red-500">*</span>
                                </span>
                              </label>
                              <button
                                type="button"
                                id="ptt-truck-btn"
                                onClick={() => setIsPTTTruckSelected(!isPTTTruckSelected)}
                                className={`w-full px-4 py-4 border-2 rounded-xl transition-all duration-200 font-medium shadow-sm flex items-center justify-center gap-3 ${isPTTTruckSelected
                                  ? "bg-gradient-to-r from-emerald-500 to-teal-500 border-emerald-500 text-white hover:from-emerald-600 hover:to-teal-600"
                                  : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white hover:border-emerald-500 dark:hover:border-emerald-500"
                                  }`}
                              >
                                <Truck className={`w-6 h-6 ${isPTTTruckSelected ? "text-white" : "text-emerald-600 dark:text-emerald-400"}`} />
                                <span className="text-lg font-semibold">รถของ PTT</span>
                                {isPTTTruckSelected && (
                                  <CheckCircle className="w-5 h-5 text-white" />
                                )}
                              </button>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                                รถที่ทาง PTT จัดส่งน้ำมันดีเชลพรีเมี่ยมโดยเฉพาะ
                              </p>
                            </div>
                          </>
                        ) : (
                          <>
                            {/* เลือกหัวรถ */}
                            <div>
                              <label htmlFor="truck-id-select" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                <span className="flex items-center gap-2">
                                  <Truck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                  เลือกหัวรถ
                                  <span className="text-red-500">*</span>
                                </span>
                              </label>
                              <select
                                id="truck-id-select"
                                value={truckDriverForm.truckId}
                                onChange={(e) => setTruckDriverForm({ ...truckDriverForm, truckId: e.target.value })}
                                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                              >
                                <option value="">-- เลือกหัวรถ --</option>
                                {mockTrucks.map((truck) => (
                                  <option key={truck.id} value={truck.id}>
                                    {truck.plateNumber} - {truck.brand} {truck.model}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* เลือกหางรถ */}
                            <div>
                              <label htmlFor="trailer-id-select" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                <span className="flex items-center gap-2">
                                  <Droplet className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                                  เลือกหางรถ
                                  <span className="text-red-500">*</span>
                                </span>
                              </label>
                              <select
                                id="trailer-id-select"
                                value={truckDriverForm.trailerId}
                                onChange={(e) => setTruckDriverForm({ ...truckDriverForm, trailerId: e.target.value })}
                                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                              >
                                <option value="">-- เลือกหางรถ --</option>
                                {mockTrailers.map((trailer) => (
                                  <option key={trailer.id} value={trailer.id}>
                                    {trailer.plateNumber} - {numberFormatter.format(trailer.capacity)} ลิตร
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* เลือกคนขับ */}
                            <div className="relative" ref={driverDropdownRef}>
                              <label htmlFor="driver-select-btn" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                <span className="flex items-center gap-2">
                                  <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                  เลือกคนขับรถ
                                  <span className="text-red-500">*</span>
                                </span>
                              </label>

                              {/* Dropdown Button */}
                              <button
                                type="button"
                                id="driver-select-btn"
                                onClick={() => setIsDriverDropdownOpen(!isDriverDropdownOpen)}
                                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 font-medium shadow-sm hover:border-blue-500 dark:hover:border-blue-500 flex items-center justify-between gap-3"
                              >
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                  {selectedDriver ? (
                                    <>
                                      {selectedDriver.avatar ? (
                                        <img
                                          src={selectedDriver.avatar}
                                          alt={selectedDriver.name}
                                          className="w-10 h-10 rounded-full border-2 border-gray-200 dark:border-gray-700 flex-shrink-0"
                                        />
                                      ) : (
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center text-white font-semibold flex-shrink-0">
                                          {selectedDriver.name.charAt(0)}
                                        </div>
                                      )}
                                      <div className="flex-1 min-w-0 text-left">
                                        <p className="font-semibold text-gray-900 dark:text-white truncate">
                                          {selectedDriver.name}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                          {selectedDriver.code} • {selectedDriver.position}
                                        </p>
                                      </div>
                                    </>
                                  ) : (
                                    <span className="text-gray-500 dark:text-gray-400">-- เลือกคนขับรถ --</span>
                                  )}
                                </div>
                                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 flex-shrink-0 ${isDriverDropdownOpen ? "rotate-180" : ""}`} />
                              </button>

                              {/* Dropdown Menu */}
                              <AnimatePresence>
                                {isDriverDropdownOpen && (
                                  <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="absolute z-10 w-full mt-2 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 rounded-xl shadow-xl overflow-hidden"
                                  >
                                    {/* Search Input */}
                                    <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                                      <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                          type="text"
                                          placeholder="ค้นหาพนักงาน..."
                                          value={driverSearchQuery}
                                          onChange={(e) => setDriverSearchQuery(e.target.value)}
                                          className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                        />
                                      </div>
                                    </div>

                                    {/* Driver List */}
                                    <div className="max-h-64 overflow-y-auto">
                                      {filteredDrivers.length > 0 ? (
                                        filteredDrivers.map((driver) => {
                                          const isSelected = truckDriverForm.driverId === driver.id.toString();
                                          return (
                                            <button
                                              key={driver.id}
                                              type="button"
                                              onClick={() => {
                                                setTruckDriverForm({ ...truckDriverForm, driverId: driver.id.toString() });
                                                setIsDriverDropdownOpen(false);
                                                setDriverSearchQuery("");
                                              }}
                                              className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${isSelected ? "bg-blue-50 dark:bg-blue-900/20" : ""
                                                }`}
                                            >
                                              {driver.avatar ? (
                                                <img
                                                  src={driver.avatar}
                                                  alt={driver.name}
                                                  className="w-10 h-10 rounded-full border-2 border-gray-200 dark:border-gray-700 flex-shrink-0"
                                                />
                                              ) : (
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center text-white font-semibold flex-shrink-0">
                                                  {driver.name.charAt(0)}
                                                </div>
                                              )}
                                              <div className="flex-1 text-left min-w-0">
                                                <p className="font-semibold text-gray-900 dark:text-white truncate">
                                                  {driver.name}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                  {driver.code} • {driver.position}
                                                </p>
                                              </div>
                                              {isSelected && (
                                                <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />
                                              )}
                                            </button>
                                          );
                                        })
                                      ) : (
                                        <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                                          <p className="text-sm">ไม่พบพนักงานที่ค้นหา</p>
                                        </div>
                                      )}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          </>
                        )}

                        {/* Selected Truck/Trailer Info Card */}
                        {hasPremiumDiesel ? (
                          isPTTTruckSelected && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="mt-4 p-4 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-xl border-2 border-red-200 dark:border-red-800 shadow-md"
                            >
                              <div className="space-y-3">
                                <div className="flex items-center gap-2 mb-3">
                                  <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                                    <Truck className="w-4 h-4 text-white" />
                                  </div>
                                  <div>
                                    <p className="font-bold text-red-900 dark:text-red-100 text-sm">
                                      รถของ PTT
                                    </p>
                                    <p className="text-xs text-red-700 dark:text-red-300">
                                      สำหรับ Premium Diesel
                                    </p>
                                  </div>
                                </div>

                                <div className="p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg">
                                  <p className="text-sm font-semibold text-gray-900 dark:text-white text-center">
                                    รถที่ทาง PTT จัดส่งน้ำมันดีเชลพรีเมี่ยมโดยเฉพาะ
                                  </p>
                                </div>
                              </div>
                            </motion.div>
                          )
                        ) : null}
                      </div>

                      <div className="mt-6 flex justify-end">
                        <button
                          onClick={handleAddTruckDriver}
                          disabled={hasPremiumDiesel
                            ? !isPTTTruckSelected
                            : !truckDriverForm.truckId || !truckDriverForm.trailerId || !truckDriverForm.driverId
                          }
                          className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl transition-all duration-200 font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-lg"
                        >
                          <Plus className="w-5 h-5" />
                          {hasPremiumDiesel ? "เพิ่มรถ PTT" : "เพิ่มออเดอร์รถ"}
                        </button>
                      </div>
                    </div>

                    {/* Selected Trucks List */}
                    {selectedTrucksAndDrivers.length > 0 && (
                      <div>
                        <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                          ออเดอร์รถที่เลือก ({selectedTrucksAndDrivers.length} ออเดอร์)
                        </h4>
                        <div className="space-y-3">
                          {selectedTrucksAndDrivers.map((pair, index) => {
                            const truck = mockTrucks.find((t) => t.id === pair.truckId);
                            const trailer = mockTrailers.find((t) => t.id === pair.trailerId);

                            return (
                              <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white dark:bg-gray-800 rounded-xl p-4 border-2 border-emerald-200 dark:border-emerald-700"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-3">
                                      <h5 className="font-semibold text-gray-900 dark:text-white">{pair.truckOrderNo}</h5>
                                      <span className="px-2 py-1 bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 rounded text-xs font-medium">
                                        รอเรียกใช้
                                      </span>
                                      {pair.isPTTTruck && (
                                        <span className="px-2 py-1 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded text-xs font-medium">
                                          รถ PTT
                                        </span>
                                      )}
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div>
                                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">รถ</p>
                                        <div className="flex items-center gap-2">
                                          <Truck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                          <p className="font-semibold text-gray-900 dark:text-white">
                                            {pair.truckPlateNumber}
                                          </p>
                                          {truck && (
                                            <span className="text-xs text-gray-500 dark:text-gray-500">
                                              ({truck.brand} {truck.model})
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                      <div>
                                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">หาง</p>
                                        <div className="flex items-center gap-2">
                                          <Droplet className="w-4 h-4 text-orange-500" />
                                          <p className="font-semibold text-gray-900 dark:text-white">
                                            {pair.trailerPlateNumber}
                                          </p>
                                          {trailer && (
                                            <span className="text-xs text-gray-500 dark:text-gray-500">
                                              ({numberFormatter.format(trailer.capacity)} ลิตร)
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                      {pair.driverName && (
                                        <div className="md:col-span-2">
                                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">คนขับ</p>
                                          <div className="flex items-center gap-2">
                                            <User className="w-4 h-4 text-purple-500" />
                                            <p className="font-semibold text-gray-900 dark:text-white">
                                              {pair.driverName}
                                            </p>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => setSelectedTrucksAndDrivers(selectedTrucksAndDrivers.filter((_, i) => i !== index))}
                                    className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg ml-4 transition-colors"
                                  >
                                    <X className="w-5 h-5 text-red-500" />
                                  </button>
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between px-6 py-5 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    เลือกแล้ว {selectedTrucksAndDrivers.length} ออเดอร์
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleCloseModal}
                      className="px-6 py-2.5 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-all duration-200 font-medium hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-700"
                    >
                      ยกเลิก
                    </button>
                    <button
                      onClick={handleCloseModal}
                      className="px-8 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl transition-all duration-200 font-semibold shadow-lg hover:shadow-xl flex items-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      ยืนยัน ({selectedTrucksAndDrivers.length})
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )
        }
      </AnimatePresence >
    </div >
  );
}

