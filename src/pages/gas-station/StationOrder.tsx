import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  Plus,
  Search,
  Filter,
  CheckCircle,
  Clock,
  AlertTriangle,
  Edit,
  Eye,
  X,
  Save,
  Droplet,
  Calendar,
  FileText,
  Building2,
  Truck,
} from "lucide-react";

const numberFormatter = new Intl.NumberFormat("th-TH", {
  maximumFractionDigits: 0,
});

// Mock data - ปั๊มปัจจุบัน (สมมติว่าเป็นปั๊มไฮโซ)
const currentBranch = {
  id: 1,
  name: "ปั๊มไฮโซ",
  code: "HQ",
  address: "100 ถนนเพชรบุรี กรุงเทพมหานคร 10400",
  legalEntityName: "บริษัท A จำกัด",
};

// ประเภทน้ำมัน
const oilTypes = [
  "Premium Diesel",
  "Premium Gasohol 95",
  "Diesel",
  "E85",
  "E20",
  "Gasohol 91",
  "Gasohol 95",
];

// นิติบุคคล
const legalEntities = [
  { id: 1, name: "บริษัท A จำกัด" },
  { id: 2, name: "บริษัท B จำกัด" },
  { id: 3, name: "บริษัท C จำกัด" },
  { id: 4, name: "บริษัท D จำกัด" },
  { id: 5, name: "บริษัท E จำกัด" },
];

// Mock data - สต็อกปัจจุบันของปั๊ม
const mockCurrentStock = [
  {
    oilType: "Premium Diesel",
    currentStock: 45000,
    minThreshold: 20000,
    maxCapacity: 100000,
    averageDailySales: 8500,
    daysRemaining: 5,
    lowStockAlert: false,
    systemRecommended: 0, // จะคำนวณจากระบบ
  },
  {
    oilType: "Premium Gasohol 95",
    currentStock: 38000,
    minThreshold: 15000,
    maxCapacity: 80000,
    averageDailySales: 7200,
    daysRemaining: 5,
    lowStockAlert: false,
    systemRecommended: 0,
  },
  {
    oilType: "Diesel",
    currentStock: 52000,
    minThreshold: 25000,
    maxCapacity: 120000,
    averageDailySales: 12000,
    daysRemaining: 4,
    lowStockAlert: false,
    systemRecommended: 0,
  },
  {
    oilType: "E85",
    currentStock: 8000, // เหลือน้อย
    minThreshold: 10000,
    maxCapacity: 50000,
    averageDailySales: 3000,
    daysRemaining: 2,
    lowStockAlert: true,
    systemRecommended: 0,
  },
  {
    oilType: "E20",
    currentStock: 28000,
    minThreshold: 12000,
    maxCapacity: 60000,
    averageDailySales: 5500,
    daysRemaining: 5,
    lowStockAlert: false,
    systemRecommended: 0,
  },
  {
    oilType: "Gasohol 91",
    currentStock: 9000, // เหลือน้อย
    minThreshold: 10000,
    maxCapacity: 50000,
    averageDailySales: 4500,
    daysRemaining: 2,
    lowStockAlert: true,
    systemRecommended: 0,
  },
  {
    oilType: "Gasohol 95",
    currentStock: 12000, // เหลือน้อย
    minThreshold: 15000,
    maxCapacity: 80000,
    averageDailySales: 6800,
    daysRemaining: 1,
    lowStockAlert: true,
    systemRecommended: 0,
  },
];

type OrderItem = {
  id: string;
  oilType: string;
  quantity: number;
  legalEntityId: number;
  notes?: string;
};

type OrderStatus = "รออนุมัติ" | "อนุมัติแล้ว" | "ส่งแล้ว";

type Order = {
  id: string;
  orderNo: string;
  orderDate: string;
  items: OrderItem[];
  legalEntityId: number;
  status: OrderStatus;
  requestedBy: string;
  requestedAt: string;
  approvedBy?: string;
  approvedAt?: string;
  deliveryDate?: string;
};

// Mock data - คำสั่งซื้อที่เคยสั่งไปแล้ว
const mockOrders: Order[] = [
  {
    id: "ORD-001",
    orderNo: "SO-20241214-001",
    orderDate: "2024-12-14",
    items: [
      { id: "1", oilType: "Premium Diesel", quantity: 25000, legalEntityId: 1 },
      { id: "2", oilType: "Gasohol 95", quantity: 20000, legalEntityId: 1 },
    ],
    legalEntityId: 1,
    status: "อนุมัติแล้ว",
    requestedBy: "ผู้จัดการปั๊มไฮโซ",
    requestedAt: "2024-12-14 10:30",
    approvedBy: "คุณนิด",
    approvedAt: "2024-12-14 14:00",
    deliveryDate: "2024-12-16",
  },
  {
    id: "ORD-002",
    orderNo: "SO-20241213-002",
    orderDate: "2024-12-13",
    items: [
      { id: "1", oilType: "Diesel", quantity: 30000, legalEntityId: 1 },
    ],
    legalEntityId: 1,
    status: "ส่งแล้ว",
    requestedBy: "ผู้จัดการปั๊มไฮโซ",
    requestedAt: "2024-12-13 09:15",
    approvedBy: "คุณนิด",
    approvedAt: "2024-12-13 11:30",
    deliveryDate: "2024-12-14",
  },
];

export default function StationOrder() {
  const navigate = useNavigate();
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [selectedOilType, setSelectedOilType] = useState("");
  const [selectedQuantity, setSelectedQuantity] = useState("");
  const [selectedLegalEntity, setSelectedLegalEntity] = useState(1);
  const [notes, setNotes] = useState("");
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ทั้งหมด");
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);

  // คำนวณยอดแนะนำจากระบบ (ตัวอย่าง: ต้องการให้มีสต็อกเพียงพอ 7 วัน)
  const calculateRecommended = (oilType: string) => {
    const stock = mockCurrentStock.find((s) => s.oilType === oilType);
    if (!stock) return 0;
    const daysNeeded = 7;
    const recommended = stock.averageDailySales * daysNeeded - stock.currentStock;
    return Math.max(0, recommended);
  };


  // ลบรายการสั่งซื้อ
  const removeOrderItem = (id: string) => {
    setOrderItems(orderItems.filter((item) => item.id !== id));
  };

  // แก้ไขรายการสั่งซื้อ
  const editOrderItem = (index: number) => {
    const item = orderItems.find((_, i) => i === index);
    if (!item) return;
    setSelectedOilType(item.oilType);
    setSelectedQuantity(item.quantity.toString());
    setSelectedLegalEntity(item.legalEntityId);
    setNotes(item.notes || "");
    setEditingItemIndex(index);
  };

  // บันทึกการแก้ไข
  const saveEdit = () => {
    if (editingItemIndex === null || !selectedOilType || !selectedQuantity) return;

    const updatedItems = orderItems.map((item, i) =>
      i === editingItemIndex ? {
        ...item,
        oilType: selectedOilType,
        quantity: parseInt(selectedQuantity),
        legalEntityId: selectedLegalEntity,
        notes: notes || undefined,
      } as OrderItem : item
    );

    setOrderItems(updatedItems);
    setEditingItemIndex(null);
    setSelectedOilType("");
    setSelectedQuantity("");
    setNotes("");
  };

  // ยกเลิกการแก้ไข
  const cancelEdit = () => {
    setEditingItemIndex(null);
    setSelectedOilType("");
    setSelectedQuantity("");
    setNotes("");
  };

  // ส่งคำสั่งซื้อ
  const submitOrder = () => {
    if (orderItems.length === 0) {
      alert("กรุณาเพิ่มรายการสั่งซื้อ");
      return;
    }

    // สร้างคำสั่งซื้อใหม่
    const newOrder: Order = {
      id: `ORD-${Date.now()}`,
      orderNo: `SO-${new Date().toISOString().split("T")[0].replace(/-/g, "")}-${String(orders.length + 1).padStart(3, "0")}`,
      orderDate: new Date().toISOString().split("T")[0],
      items: orderItems,
      legalEntityId: selectedLegalEntity,
      status: "รออนุมัติ",
      requestedBy: "ผู้จัดการปั๊มไฮโซ",
      requestedAt: new Date().toLocaleString("th-TH"),
    };

    // เพิ่มคำสั่งซื้อใหม่
    setOrders([newOrder, ...orders]);

    // Reset form
    setOrderItems([]);
    setShowOrderForm(false);
    setSelectedOilType("");
    setSelectedQuantity("");
    setNotes("");

    // แสดงข้อความสำเร็จ
    alert("ส่งคำสั่งซื้อสำเร็จ! คำสั่งซื้อจะไปสรุปรวมที่หน้า 'การสั่งซื้อน้ำมัน'");

    // Navigate ไปหน้า Orders (หน้าเดิมที่สรุปทั้ง 5 สาขา)
    navigate("/app/gas-station/orders");
  };

  // กรองคำสั่งซื้อ
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.items.some((item) => item.oilType.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = filterStatus === "ทั้งหมด" || order.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case "รออนุมัติ":
        return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700";
      case "อนุมัติแล้ว":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-700";
      case "ส่งแล้ว":
        return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-300 dark:border-green-700";
      default:
        return "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 border-gray-300 dark:border-gray-700";
    }
  };

  // หาน้ำมันที่เหลือน้อย
  const lowStockOils = mockCurrentStock.filter((stock) => stock.lowStockAlert);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                สั่งน้ำมันของปั้ม
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                สร้างคำสั่งซื้อน้ำมันสำหรับปั๊ม {currentBranch.name}
              </p>
            </div>
            <button
              onClick={() => setShowOrderForm(!showOrderForm)}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl transition-all duration-200 font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              {showOrderForm ? "ปิดฟอร์ม" : "สร้างคำสั่งซื้อใหม่"}
            </button>
          </div>
        </motion.div>

        {/* Low Stock Alert */}
        {lowStockOils.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-6 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 dark:border-red-600 rounded-xl p-5 shadow-md"
          >
            <div className="flex items-start gap-4">
              <div className="p-2 bg-red-500/20 rounded-xl flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-red-600 dark:text-red-400 mb-2">
                  แจ้งเตือน: น้ำมันที่เหลือน้อย
                </h3>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                  มีน้ำมัน {lowStockOils.length} ชนิดที่เหลือน้อยกว่าเกณฑ์ที่กำหนด
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {lowStockOils.map((stock) => (
                    <div
                      key={stock.oilType}
                      className="bg-white dark:bg-gray-800 border border-red-200 dark:border-red-800 rounded-lg p-3 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <Droplet className="w-4 h-4 text-red-500" />
                        <span className="font-semibold text-gray-800 dark:text-white">
                          {stock.oilType}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-red-600 dark:text-red-400">
                          {numberFormatter.format(stock.currentStock)} ลิตร
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          เหลือ {stock.daysRemaining} วัน
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => {
                    setShowOrderForm(true);
                    // Auto-select low stock oils
                    const lowStockItems = lowStockOils.map((stock) => {
                      const recommended = calculateRecommended(stock.oilType);
                      return {
                        id: Date.now().toString() + Math.random(),
                        oilType: stock.oilType,
                        quantity: recommended > 0 ? recommended : stock.minThreshold,
                        legalEntityId: selectedLegalEntity,
                      };
                    });
                    setOrderItems(lowStockItems);
                  }}
                  className="mt-4 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center gap-2 text-sm font-semibold"
                >
                  <Plus className="w-4 h-4" />
                  สั่งน้ำมันที่เหลือน้อยทั้งหมด
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Order Form */}
        <AnimatePresence>
          {showOrderForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden mb-6"
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                  สร้างคำสั่งซื้อใหม่
                </h2>

                {/* Form Fields */}
                <div className="space-y-4">
                  {/* Quick Add - เลือกน้ำมันหลายชนิดพร้อมกัน */}
                  <div>
                    <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      เลือกน้ำมันหลายชนิดพร้อมกัน
                    </span>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {oilTypes.map((type) => {
                        const stock = mockCurrentStock.find((s) => s.oilType === type);
                        const isSelected = orderItems.some((item) => item.oilType === type);
                        const isLowStock = stock?.lowStockAlert || false;
                        const recommended = stock ? calculateRecommended(type) : 0;

                        return (
                          <button
                            key={type}
                            type="button"
                            onClick={() => {
                              if (isSelected) {
                                // ถ้าเลือกอยู่แล้ว ให้ลบออก
                                setOrderItems(orderItems.filter((item) => item.oilType !== type));
                              } else {
                                // ถ้ายังไม่เลือก ให้เพิ่มเข้าไป
                                const newItem: OrderItem = {
                                  id: Date.now().toString() + Math.random(),
                                  oilType: type,
                                  quantity: recommended > 0 ? recommended : (stock?.minThreshold || 0),
                                  legalEntityId: selectedLegalEntity,
                                };
                                setOrderItems([...orderItems, newItem]);
                              }
                            }}
                            className={`p-3 rounded-xl border-2 transition-all text-left ${isSelected
                              ? "bg-blue-50 dark:bg-blue-900/30 border-blue-500 dark:border-blue-600 shadow-md"
                              : isLowStock
                                ? "bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700 hover:border-red-500"
                                : "bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600"
                              }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <Droplet className={`w-4 h-4 ${isLowStock ? "text-red-500" : "text-blue-500"}`} />
                                <span className={`text-sm font-semibold ${isSelected
                                  ? "text-blue-700 dark:text-blue-300"
                                  : "text-gray-800 dark:text-white"
                                  }`}>
                                  {type}
                                </span>
                              </div>
                              {isSelected && (
                                <CheckCircle className="w-4 h-4 text-blue-500" />
                              )}
                            </div>
                            {stock && (
                              <div className="text-xs text-gray-600 dark:text-gray-400">
                                <div>คงเหลือ: {numberFormatter.format(stock.currentStock)} ลิตร</div>
                                {isLowStock && (
                                  <div className="text-red-600 dark:text-red-400 font-semibold mt-1">
                                    ⚠️ เหลือน้อย
                                  </div>
                                )}
                                {recommended > 0 && (
                                  <div className="text-blue-600 dark:text-blue-400 mt-1">
                                    แนะนำ: {numberFormatter.format(recommended)} ลิตร
                                  </div>
                                )}
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                    {orderItems.length > 0 && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                        เลือกแล้ว {orderItems.length} ชนิด - คลิกเพื่อเพิ่ม/ลบ
                      </p>
                    )}
                  </div>

                  {/* นิติบุคคล */}
                  <div>
                    <label htmlFor="station-order-legal-entity" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      นิติบุคคล * (ใช้กับทุกรายการ)
                    </label>
                    <select
                      id="station-order-legal-entity"
                      value={selectedLegalEntity}
                      onChange={(e) => {
                        const newEntityId = parseInt(e.target.value);
                        setSelectedLegalEntity(newEntityId);
                        // อัพเดท legalEntityId ของทุกรายการ
                        setOrderItems(orderItems.map(item => ({
                          ...item,
                          legalEntityId: newEntityId
                        })));
                      }}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 text-gray-800 dark:text-white"
                    >
                      {legalEntities.map((entity) => (
                        <option key={entity.id} value={entity.id}>
                          {entity.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* หมายเหตุ */}
                  <div>
                    <label htmlFor="station-order-notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      หมายเหตุ (ถ้ามี) - ใช้กับทุกรายการ
                    </label>
                    <textarea
                      id="station-order-notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="ระบุหมายเหตุเพิ่มเติม..."
                      rows={2}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 text-gray-800 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Order Items List */}
              {orderItems.length > 0 && (
                <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                      รายการสั่งซื้อ ({orderItems.length} ชนิด)
                    </h3>
                    <button
                      onClick={() => {
                        if (confirm("ต้องการล้างรายการทั้งหมดหรือไม่?")) {
                          setOrderItems([]);
                        }
                      }}
                      className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 flex items-center gap-1"
                    >
                      <X className="w-4 h-4" />
                      ล้างทั้งหมด
                    </button>
                  </div>
                  <div className="space-y-3 mb-4">
                    {orderItems.map((item, index) => {
                      const stock = mockCurrentStock.find((s) => s.oilType === item.oilType);
                      const isLowStock = stock?.lowStockAlert || false;
                      const recommended = stock ? calculateRecommended(item.oilType) : 0;
                      const isEditing = editingItemIndex === index;

                      return (
                        <div
                          key={item.id}
                          className={`p-4 rounded-lg border-2 transition-all ${isLowStock
                            ? "bg-red-50/50 dark:bg-red-900/10 border-red-200 dark:border-red-800"
                            : "bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                            }`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-3">
                                <Droplet className={`w-5 h-5 ${isLowStock ? "text-red-500" : "text-blue-500"}`} />
                                <span className="font-semibold text-gray-800 dark:text-white">
                                  {item.oilType}
                                </span>
                                {isLowStock && (
                                  <span className="text-xs font-semibold text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 px-2 py-1 rounded-full">
                                    ⚠️ เหลือน้อย
                                  </span>
                                )}
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                  <label htmlFor={`station-order-item-quantity-${item.id}`} className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">
                                    จำนวน (ลิตร) *
                                  </label>
                                  {isEditing ? (
                                    <input
                                      id={`station-order-item-quantity-${item.id}`}
                                      type="number"
                                      value={selectedQuantity}
                                      onChange={(e) => setSelectedQuantity(e.target.value)}
                                      className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-gray-800 dark:text-white"

                                    />
                                  ) : (
                                    <div className="flex items-center gap-2">
                                      <span className="font-semibold text-gray-800 dark:text-white">
                                        {numberFormatter.format(item.quantity)} ลิตร
                                      </span>
                                      {recommended > 0 && recommended !== item.quantity && (
                                        <span className="text-xs text-blue-600 dark:text-blue-400">
                                          (แนะนำ: {numberFormatter.format(recommended)})
                                        </span>
                                      )}
                                    </div>
                                  )}
                                  {stock && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                      สต็อกปัจจุบัน: {numberFormatter.format(stock.currentStock)} ลิตร
                                    </p>
                                  )}
                                </div>
                                <div>
                                  <span className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">
                                    นิติบุคคล
                                  </span>
                                  <span className="font-semibold text-gray-800 dark:text-white">
                                    {legalEntities.find((e) => e.id === item.legalEntityId)?.name}
                                  </span>
                                </div>
                                {item.notes && (
                                  <div>
                                    <span className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">
                                      หมายเหตุ
                                    </span>
                                    <span className="text-sm text-gray-800 dark:text-white">{item.notes}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {isEditing ? (
                                <>
                                  <button
                                    onClick={saveEdit}
                                    className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                                    title="บันทึก"
                                  >
                                    <Save className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={cancelEdit}
                                    className="p-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors"
                                    title="ยกเลิก"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() => editOrderItem(index)}
                                    className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                    title="แก้ไข"
                                  >
                                    <Edit className="w-4 h-4 text-gray-400 hover:text-blue-500" />
                                  </button>
                                  <button
                                    onClick={() => removeOrderItem(item.id)}
                                    className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                    title="ลบ"
                                  >
                                    <X className="w-4 h-4 text-gray-400 hover:text-red-500" />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Summary */}
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-4 mb-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">จำนวนรายการ</div>
                        <div className="text-lg font-bold text-gray-800 dark:text-white">
                          {orderItems.length} ชนิด
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">ยอดรวมทั้งหมด</div>
                        <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                          {numberFormatter.format(orderItems.reduce((sum, item) => sum + item.quantity, 0))} ลิตร
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">นิติบุคคล</div>
                        <div className="text-sm font-semibold text-gray-800 dark:text-white">
                          {legalEntities.find((e) => e.id === selectedLegalEntity)?.name}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">น้ำมันที่เหลือน้อย</div>
                        <div className="text-lg font-bold text-red-600 dark:text-red-400">
                          {orderItems.filter(item => {
                            const stock = mockCurrentStock.find(s => s.oilType === item.oilType);
                            return stock?.lowStockAlert;
                          }).length} ชนิด
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => {
                        setOrderItems([]);
                        setShowOrderForm(false);
                      }}
                      className="px-6 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-semibold"
                    >
                      ยกเลิก
                    </button>
                    <button
                      onClick={submitOrder}
                      className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl transition-all duration-200 font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2"
                    >
                      <ShoppingCart className="w-5 h-5" />
                      ส่งคำสั่งซื้อ ({orderItems.length} ชนิด)
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search and Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 mb-6 flex flex-wrap items-center gap-4"
        >
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <label htmlFor="station-order-search" className="sr-only">ค้นหา</label>
            <input
              id="station-order-search"
              type="text"
              placeholder="ค้นหาหมายเลขคำสั่งซื้อ, ประเภทน้ำมัน..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 text-gray-800 dark:text-white transition-all duration-200"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <label htmlFor="station-order-filter-status" className="sr-only">สถานะ</label>
            <select
              id="station-order-filter-status"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 text-gray-800 dark:text-white transition-all duration-200"
            >
              <option>ทั้งหมด</option>
              <option>รออนุมัติ</option>
              <option>อนุมัติแล้ว</option>
              <option>ส่งแล้ว</option>
            </select>
          </div>
        </motion.div>

        {/* Orders List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden"
        >
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">
              ประวัติคำสั่งซื้อ
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              รายการคำสั่งซื้อที่ส่งไปแล้ว (จะไปสรุปรวมที่หน้า &quot;การสั่งซื้อน้ำมัน&quot;)
            </p>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="p-12 text-center">
              <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">ยังไม่มีคำสั่งซื้อ</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredOrders.map((order, index) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-start justify-between flex-wrap gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <FileText className="w-5 h-5 text-blue-500" />
                        <span className="font-bold text-lg text-gray-800 dark:text-white">
                          {order.orderNo}
                        </span>
                        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border ${getStatusColor(order.status)}`}>
                          {order.status === "รออนุมัติ" && <Clock className="w-3.5 h-3.5" />}
                          {order.status === "อนุมัติแล้ว" && <CheckCircle className="w-3.5 h-3.5" />}
                          {order.status === "ส่งแล้ว" && <CheckCircle className="w-3.5 h-3.5" />}
                          {order.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600 dark:text-gray-400">วันที่สั่ง: </span>
                            <span className="font-semibold text-gray-800 dark:text-white">
                              {new Date(order.orderDate).toLocaleDateString("th-TH")}
                            </span>
                          </div>
                          {order.deliveryDate && (
                            <div className="flex items-center gap-2 text-sm">
                              <Truck className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600 dark:text-gray-400">วันที่ส่ง: </span>
                              <span className="font-semibold text-gray-800 dark:text-white">
                                {new Date(order.deliveryDate).toLocaleDateString("th-TH")}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-sm">
                            <Building2 className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600 dark:text-gray-400">นิติบุคคล: </span>
                            <span className="font-semibold text-gray-800 dark:text-white">
                              {legalEntities.find((e) => e.id === order.legalEntityId)?.name}
                            </span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="text-sm">
                            <span className="text-gray-600 dark:text-gray-400">ผู้ขอ: </span>
                            <span className="font-semibold text-gray-800 dark:text-white">
                              {order.requestedBy}
                            </span>
                          </div>
                          <div className="text-sm">
                            <span className="text-gray-600 dark:text-gray-400">วันที่ขอ: </span>
                            <span className="font-semibold text-gray-800 dark:text-white">
                              {order.requestedAt}
                            </span>
                          </div>
                          {order.approvedBy && (
                            <div className="text-sm">
                              <span className="text-gray-600 dark:text-gray-400">ผู้อนุมัติ: </span>
                              <span className="font-semibold text-gray-800 dark:text-white">
                                {order.approvedBy}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mt-4">
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          รายการน้ำมัน:
                        </h4>
                        <div className="space-y-2">
                          {order.items.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg"
                            >
                              <div className="flex items-center gap-2">
                                <Droplet className="w-4 h-4 text-blue-500" />
                                <span className="text-sm font-medium text-gray-800 dark:text-white">
                                  {item.oilType}
                                </span>
                              </div>
                              <span className="text-sm font-semibold text-gray-800 dark:text-white">
                                {numberFormatter.format(item.quantity)} ลิตร
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigate("/app/gas-station/orders")}
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center gap-2 text-sm"
                        title="ดูสรุปที่หน้า Orders"
                      >
                        <Eye className="w-4 h-4" />
                        ดูสรุป
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

