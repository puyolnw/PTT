import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";
import {
  ShoppingCart,
  Search,
  CheckCircle,
  Clock,
  X,
  Building2,
  FileText,
  Truck,
  Eye,
  Droplet,
  Plus,
  Trash2,
  PlusCircle,
  Filter,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Check,
  MapPin,
} from "lucide-react";
import { useGasStation } from "@/contexts/GasStationContext";
import { useAuth } from "@/contexts/AuthContext";
import { useBranch } from "@/contexts/BranchContext";
import type { InternalOilOrder, OilType } from "@/types/gasStation";
import StatusTag, { getStatusVariant } from "@/components/StatusTag";

// Mock data - จะใช้สำหรับเลือก "รอบรถ" ในการจัดส่ง (ยังไม่ใช้งาน)

const oilPrices: Record<OilType, number> = {
  "Premium Diesel": 32.50,
  "Diesel": 30.00,
  "Premium Gasohol 95": 45.00,
  "Gasohol 95": 43.00,
  "Gasohol 91": 38.00,
  "E20": 35.00,
  "E85": 33.00,
  "Gasohol E20": 35.00,
};

const oilTypes: OilType[] = [
  "Premium Diesel",
  "Diesel",
  "Premium Gasohol 95",
  "Gasohol 95",
  "Gasohol 91",
  "E20",
  "E85",
  "Gasohol E20",
];

const numberFormatter = new Intl.NumberFormat("th-TH", {
  maximumFractionDigits: 0,
});

interface DeliveryItem {
  oilType: OilType;
  quantity: number; 
  quantityToDeliver: number; 
  pricePerLiter: number;
  totalAmount: number;
  isFromOrder: boolean;
  sourceAvailableQty?: number; 
  assignedFromBranchId: number;
  deliverySource: "truck" | "suction"; 
  selectedTruckTripId?: string;
  transportNo?: string;
}

export default function DepotOilOrderManagement() {
  const { internalOrders, approveInternalOrder, branches, createInternalOrder, getNextRunningNumber } = useGasStation();
  const { user } = useAuth();
  const { selectedBranches } = useBranch();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [columnFilters, setColumnFilters] = useState<{
    status: string;
    branch: string;
  }>({
    status: "ทั้งหมด",
    branch: "ทั้งหมด"
  });
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' | null }>({ key: 'orderDate', direction: 'desc' });
  const [filterDateFrom, setFilterDateFrom] = useState<string>("");
  const [filterDateTo, setFilterDateTo] = useState<string>("");
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<InternalOilOrder | null>(null);
  const [deliveryItems, setDeliveryItems] = useState<DeliveryItem[]>([]);
  
  const selectedBranchIds = useMemo(() => selectedBranches.map(id => Number(id)), [selectedBranches]);

  // New Order State
  const [newOrderBranchId, setNewOrderBranchId] = useState<number>(0);
  const [newOrderRequestedDate, setNewOrderRequestedDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [newOrderItems, setNewOrderItems] = useState<Array<{ oilType: OilType; quantity: number; pricePerLiter: number }>>([
    { oilType: "Diesel", quantity: 0, pricePerLiter: 0 }
  ]);
  const [newOrderNotes, setNewOrderNotes] = useState("");

  // Update prices when oil type changes
  const handleUpdateNewOrderItem = (index: number, field: string, value: any) => {
    const updated = [...newOrderItems];
    if (field === "oilType") {
      updated[index].oilType = value;
      updated[index].pricePerLiter = oilPrices[value as OilType] || 0;
    } else if (field === "quantity") {
      updated[index].quantity = value;
    } else if (field === "pricePerLiter") {
      updated[index].pricePerLiter = value;
    }
    setNewOrderItems(updated);
  };

  const handleAddNewOrderItem = () => {
    setNewOrderItems([...newOrderItems, { oilType: "Diesel", quantity: 0, pricePerLiter: oilPrices["Diesel"] || 0 }]);
  };

  const handleRemoveNewOrderItem = (index: number) => {
    setNewOrderItems(newOrderItems.filter((_, i) => i !== index));
  };

  const handleSaveNewOrder = () => {
    if (newOrderBranchId === 0 || newOrderItems.some(i => i.quantity <= 0)) {
      alert("กรุณาระบุสาขาและจำนวนน้ำมันให้ถูกต้อง");
      return;
    }

    const branch = branches.find(b => b.id === newOrderBranchId);
    const orderNo = `DEPO-${getNextRunningNumber("internal-oil-order")}`;

    const newOrder: InternalOilOrder = {
      id: `DEPO-${Date.now()}`,
      orderNo,
      orderDate: new Date().toISOString().split("T")[0],
      requestedDate: newOrderRequestedDate,
      fromBranchId: newOrderBranchId,
      fromBranchName: branch?.name || "",
      assignedFromBranchId: 1, // ดำเนินการโดยไฮโซ
      assignedFromBranchName: "ปั๊มไฮโซ",
      items: newOrderItems.map(i => ({
        oilType: i.oilType,
        requestedQuantity: i.quantity,
        quantity: i.quantity,
        pricePerLiter: i.pricePerLiter,
        totalAmount: i.quantity * i.pricePerLiter
      })),
      totalAmount: newOrderItems.reduce((sum, i) => sum + (i.quantity * i.pricePerLiter), 0),
      status: "อนุมัติแล้ว", // เมื่อพี่นิดสั่งให้ ถือว่าอนุมัติแล้ว
      requestedBy: user?.name || "สำนักงานกลาง (พี่นิด)",
      requestedAt: new Date().toISOString(),
      approvedBy: user?.name || "สำนักงานกลาง (พี่นิด)",
      approvedAt: new Date().toISOString(),
      notes: newOrderNotes ? `${newOrderNotes} (สั่งโดยส่วนกลาง)` : "สั่งโดยส่วนกลาง",
      sourceType: "external"
    };

    createInternalOrder(newOrder);
    setShowCreateModal(false);
    setNewOrderBranchId(0);
    setNewOrderItems([{ oilType: "Diesel", quantity: 0, pricePerLiter: 0 }]);
    setNewOrderNotes("");
    alert("สร้างใบสั่งน้ำมันจากคลังสำเร็จ!");
  };

  // กรองเฉพาะ Depot Orders (sourceType: "external")
  const depotOrders = useMemo(() => {
    return internalOrders.filter(o => o.sourceType === "external");
  }, [internalOrders]);

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

  const filterOptions = useMemo(() => {
    return {
      status: ["ทั้งหมด", ...new Set(depotOrders.map(o => o.status))],
      branch: ["ทั้งหมด", ...new Set(depotOrders.map(o => o.fromBranchName))]
    };
  }, [depotOrders]);

  const filteredOrders = useMemo(() => {
    let result = depotOrders.filter((order) => {
      const matchesSearch =
        order.orderNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.fromBranchName.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesBranch = selectedBranchIds.length === 0 || selectedBranchIds.includes(order.fromBranchId);
      
      // Column Filters
      const matchesStatus = columnFilters.status === "ทั้งหมด" || order.status === columnFilters.status;
      const matchesBranchFilter = columnFilters.branch === "ทั้งหมด" || order.fromBranchName === columnFilters.branch;
      
      const orderDate = new Date(order.orderDate);
      const matchesDate = (!filterDateFrom || orderDate >= new Date(filterDateFrom)) && 
                          (!filterDateTo || orderDate <= new Date(filterDateTo));
      
      return matchesSearch && matchesBranch && matchesStatus && matchesBranchFilter && matchesDate;
    });

    if (sortConfig.key && sortConfig.direction) {
      result.sort((a, b) => {
        let aValue: any;
        let bValue: any;

        switch (sortConfig.key) {
          case 'orderDate':
            aValue = new Date(a.orderDate).getTime();
            bValue = new Date(b.orderDate).getTime();
            break;
          case 'totalAmount':
            aValue = a.totalAmount;
            bValue = b.totalAmount;
            break;
          default:
            aValue = (a as any)[sortConfig.key];
            bValue = (b as any)[sortConfig.key];
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    } else {
      result.sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
    }

    return result;
  }, [depotOrders, searchTerm, selectedBranchIds, columnFilters, filterDateFrom, filterDateTo, sortConfig]);

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
                        {opt}
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
           columnFilters.branch !== "ทั้งหมด" ||
           filterDateFrom !== "" ||
           filterDateTo !== "";
  }, [columnFilters, filterDateFrom, filterDateTo]);

  const clearFilters = () => {
    setColumnFilters({
      status: "ทั้งหมด",
      branch: "ทั้งหมด"
    });
    setSearchTerm("");
    setFilterDateFrom("");
    setFilterDateTo("");
  };

  const stats = useMemo(() => {
    const total = depotOrders.length;
    const pending = depotOrders.filter((o) => o.status === "รออนุมัติ").length;
    const approved = depotOrders.filter((o) => o.status === "อนุมัติแล้ว").length;
    const delivering = depotOrders.filter((o) => o.status === "กำลังจัดส่ง").length;
    return { total, pending, approved, delivering };
  }, [depotOrders]);

  const handleViewDetail = (order: InternalOilOrder) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  const handleApprove = (order: InternalOilOrder) => {
    setSelectedOrder(order);
    setDeliveryItems(order.items.map((item) => ({
      oilType: item.oilType,
      quantity: item.quantity,
      quantityToDeliver: item.quantity,
      pricePerLiter: item.pricePerLiter || oilPrices[item.oilType] || 0,
      totalAmount: item.totalAmount || (item.quantity * (item.pricePerLiter || oilPrices[item.oilType] || 0)),
      isFromOrder: true,
      assignedFromBranchId: 1, 
      deliverySource: "truck",
      selectedTruckTripId: "",
      transportNo: "",
    })));
    setShowAssignModal(true);
  };

  const handleUpdateDeliveryItem = (index: number, field: keyof DeliveryItem, value: any) => {
    setDeliveryItems((prev) => {
      const next = [...prev];
      const item = { ...next[index], [field]: value };
      if (field === "quantityToDeliver" || field === "pricePerLiter") {
        item.totalAmount = item.quantityToDeliver * item.pricePerLiter;
      }
      next[index] = item;
      return next;
    });
  };

  const handleAddDeliveryItem = () => {
    setDeliveryItems([...deliveryItems, {
      oilType: "Premium Diesel",
      quantity: 0,
      quantityToDeliver: 0,
      pricePerLiter: oilPrices["Premium Diesel"],
      totalAmount: 0,
      isFromOrder: false,
      assignedFromBranchId: 1,
      deliverySource: "truck",
      selectedTruckTripId: "",
      transportNo: "",
    }]);
  };

  const handleRemoveDeliveryItem = (index: number) => {
    setDeliveryItems(deliveryItems.filter((_, i) => i !== index));
  };

  const handleSaveAssignment = () => {
    if (!selectedOrder) return;
    approveInternalOrder(
      selectedOrder.id,
      "พี่นิด",
      1,
      deliveryItems.map((item) => ({
        oilType: item.oilType,
        quantity: item.quantityToDeliver,
        pricePerLiter: item.pricePerLiter,
        totalAmount: item.totalAmount,
        requestedQuantity: item.quantity,
        deliverySource: item.deliverySource,
        transportNo: item.transportNo || "",
        truckTripId: item.selectedTruckTripId,
      }))
    );
    setShowAssignModal(false);
    setSelectedOrder(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      {/* Header */}
      <header className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
              <div className="p-2 bg-emerald-600 rounded-2xl shadow-lg shadow-emerald-600/20">
                <ShoppingCart className="w-8 h-8 text-white" />
              </div>
              จัดการคำสั่งซื้อน้ำมันจากคลัง
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              จัดการคำขอจากปั๊มย่อยที่ต้องการให้นำน้ำมันจากคลัง ปตท. มาส่ง
            </p>
          </div>
          

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black shadow-lg shadow-emerald-600/20 flex items-center gap-2 active:scale-95"
          >
            <Plus className="w-5 h-5" />
            สร้างคำสั่งซื้อใหม่
          </button>
        </div>
      </header>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-6"
        >
          <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl">
            <Clock className="w-8 h-8 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">รายการรออนุมัติ</p>
            <p className="text-3xl font-black text-gray-900 dark:text-white">{stats.pending}</p>
            <p className="text-sm font-bold text-emerald-600 mt-1">ต้องดำเนินการ</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-6"
        >
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl">
            <Truck className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">กำลังจัดส่ง</p>
            <p className="text-3xl font-black text-gray-900 dark:text-white">{stats.delivering}</p>
            <p className="text-sm font-bold text-blue-600 mt-1">อยู่ระหว่างทาง</p>
          </div>
        </motion.div>
        
        <div className="md:col-span-2 bg-gradient-to-br from-emerald-600 to-teal-700 p-6 rounded-3xl shadow-xl shadow-emerald-500/20 flex items-center justify-between text-white">
          <div className="space-y-1">
            <p className="text-xs font-bold text-emerald-100 uppercase tracking-widest">คำขอจากคลังวันนี้</p>
            <p className="text-2xl font-black">
              {stats.total} รายการทั้งหมด
            </p>
            <p className="text-emerald-200 text-sm font-medium flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              จัดการคำขอสั่งซื้อน้ำมันจากคลัง ปตท.
            </p>
          </div>
          <div className="opacity-20">
            <ShoppingCart className="w-20 h-20" />
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="ค้นหาเลขที่ออเดอร์ หรือ ชื่อปั๊ม..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900 dark:text-white font-medium"
          />
        </div>
        <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 dark:bg-gray-900 rounded-2xl font-bold text-sm">
          <input type="date" value={filterDateFrom} onChange={e => setFilterDateFrom(e.target.value)} className="bg-transparent outline-none" />
          <span className="text-gray-400">-</span>
          <input type="date" value={filterDateTo} onChange={e => setFilterDateTo(e.target.value)} className="bg-transparent outline-none" />
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
          <div className="flex items-center gap-2 px-4 py-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-2xl border border-emerald-100 dark:border-emerald-800/50 shrink-0">
            <MapPin className="w-4 h-4" />
            <span className="text-sm font-bold whitespace-nowrap">
              {selectedBranchIds.length === 0 ? "ทุกสาขา" : `สาขาที่เลือก (${selectedBranchIds.length})`}
            </span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-gray-900/50 text-[10px] uppercase tracking-widest font-black text-gray-400">
                <HeaderWithFilter 
                  label="เลขที่ออเดอร์ / วันที่" 
                  columnKey="orderDate" 
                />
                <HeaderWithFilter 
                  label="ปั๊มที่สั่ง" 
                  columnKey="fromBranchName" 
                  filterKey="branch"
                  options={filterOptions.branch}
                />
                <th className="px-6 py-4">รายการ</th>
                <th 
                  className="px-6 py-4 text-right cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  onClick={() => handleSort('totalAmount')}
                >
                  <div className="flex items-center justify-end gap-2">
                    จำนวนรวม (ลิตร)
                    {getSortIcon('totalAmount')}
                  </div>
                </th>
                <HeaderWithFilter 
                  label="สถานะ" 
                  columnKey="status" 
                  filterKey="status"
                  options={filterOptions.status}
                />
                <th className="px-6 py-4 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700 font-medium">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    <div className="flex flex-col items-center gap-2">
                      <FileText className="w-12 h-12 text-gray-300" />
                      <p className="text-sm font-bold">ไม่พบรายการ</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="group hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-900 dark:text-white">
                          {new Date(order.orderDate).toLocaleDateString('th-TH')}
                        </span>
                        <span className="text-[10px] font-black text-blue-600 uppercase tracking-tighter mt-0.5 flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          {order.orderNo}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-700 dark:text-gray-300">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-gray-400" />
                        {order.fromBranchName}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-[10px] space-y-0.5">
                        {order.items.map((it, idx) => (
                          <div key={idx} className="font-bold">{it.oilType}: {it.quantity.toLocaleString()} ลิตร</div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-black text-gray-900 dark:text-white">
                      {order.items.reduce((sum, it) => sum + it.quantity, 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <StatusTag variant={getStatusVariant(order.status)}>{order.status}</StatusTag>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        {order.status === "รออนุมัติ" && (
                          <button 
                            onClick={() => handleApprove(order)} 
                            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black rounded-lg shadow-sm transition-colors"
                          >
                            อนุมัติ
                          </button>
                        )}
                        <button 
                          onClick={() => handleViewDetail(order)} 
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {showDetailModal && selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            >
              <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-emerald-50 dark:bg-emerald-900/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500 rounded-xl">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-emerald-800 dark:text-emerald-400">รายละเอียดคำขอซื้อน้ำมันจากคลัง</h2>
                    <p className="text-xs text-emerald-600 dark:text-emerald-500 font-bold">อ้างอิง: {selectedOrder.orderNo}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowDetailModal(false)} 
                  className="p-2 hover:bg-white dark:hover:bg-gray-700 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-700">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">สถานะ</span>
                    <StatusTag variant={getStatusVariant(selectedOrder.status)}>{selectedOrder.status}</StatusTag>
                  </div>
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100 dark:border-emerald-800">
                    <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest block mb-1">สาขาที่สั่ง</span>
                    <p className="text-lg font-black text-gray-900 dark:text-white">{selectedOrder.fromBranchName}</p>
                  </div>
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-800">
                    <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest block mb-1">วันที่ต้องการ</span>
                    <p className="text-lg font-black text-gray-900 dark:text-white">{selectedOrder.requestedDate}</p>
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-3xl overflow-hidden shadow-sm">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-800/50">
                      <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        <th className="px-6 py-4 text-left">ชนิดน้ำมัน</th>
                        <th className="px-6 py-4 text-right">จำนวน</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-800 font-bold">
                      {selectedOrder.items.map((it, idx) => (
                        <tr key={idx}>
                          <td className="px-6 py-4 text-gray-900 dark:text-white">{it.oilType}</td>
                          <td className="px-6 py-4 text-right text-gray-900 dark:text-white">{it.quantity.toLocaleString()} ลิตร</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-700 flex gap-3">
                <button 
                  onClick={() => setShowDetailModal(false)} 
                  className="flex-1 px-6 py-3 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-black rounded-2xl border border-gray-200 dark:border-gray-700 uppercase tracking-widest text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  ปิดหน้าต่าง
                </button>
                {selectedOrder.status === "รออนุมัติ" && (
                  <button 
                    onClick={() => { setShowDetailModal(false); handleApprove(selectedOrder); }} 
                    className="flex-[2] px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl shadow-xl shadow-emerald-600/30 uppercase tracking-widest text-sm flex items-center justify-center gap-2 transition-colors"
                  >
                    <CheckCircle className="w-5 h-5" />
                    ไปหน้าอนุมัติรายการ
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Assign Modal (Refined for Consistency) */}
      <AnimatePresence>
        {showAssignModal && selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            >
              <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-blue-50 dark:bg-blue-900/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500 rounded-xl">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-blue-800 dark:text-blue-400">อนุมัติคำขอสั่งซื้อจากคลัง</h2>
                    <p className="text-xs text-blue-600 dark:text-blue-500 font-bold">Bill No: {selectedOrder.orderNo}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowAssignModal(false)} 
                  className="p-2 hover:bg-white dark:hover:bg-gray-700 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="p-8 overflow-y-auto space-y-8 custom-scrollbar">
                {/* Section 1: Order Summary */}
                <div className="bg-gradient-to-br from-gray-50 to-blue-50/30 dark:from-gray-900 dark:to-blue-900/10 p-8 rounded-[2rem] border border-gray-100 dark:border-blue-900/30 flex flex-col md:flex-row justify-between items-center gap-8">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-center">
                      <Building2 className="w-8 h-8 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">ปั๊มที่สั่งซื้อ</p>
                      <p className="text-2xl font-black text-gray-900 dark:text-white">{selectedOrder.fromBranchName}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-12 text-right">
                    <div>
                      <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">ปริมาณรวม</p>
                      <p className="text-3xl font-black text-blue-600">{selectedOrder.items.reduce((sum, it) => sum + it.quantity, 0).toLocaleString()} <span className="text-xs font-normal opacity-50">ลิตร</span></p>
                    </div>
                    <div className="w-px h-12 bg-blue-200 dark:bg-blue-800/50"></div>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">วันที่ต้องการ</p>
                      <p className="text-xl font-black text-gray-900 dark:text-white">{selectedOrder.requestedDate}</p>
                    </div>
                  </div>
                </div>

                {/* Section 2: Logistics Assign per Item */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                        <PlusCircle className="w-4 h-4" />
                      </div>
                      <h4 className="text-sm font-black text-gray-800 dark:text-white uppercase tracking-widest">ยืนยันรายการจัดส่งและแหล่งที่มา</h4>
                    </div>
                    <button
                      onClick={handleAddDeliveryItem}
                      className="text-xs font-black text-blue-600 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl border border-blue-100 transition-all flex items-center gap-2 shadow-sm"
                    >
                      <Plus className="w-3 h-3" /> เพิ่มรายการใหม่
                    </button>
                  </div>

                  <div className="space-y-4 font-bold">
                    {deliveryItems.map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-6 rounded-[2rem] border-2 relative group transition-all shadow-sm ${
                          item.isFromOrder
                            ? "bg-white dark:bg-gray-800 border-blue-50 dark:border-blue-900/30"
                            : "bg-purple-50/20 dark:bg-purple-900/10 border-purple-50 dark:border-purple-800"
                        }`}
                      >
                        <button
                          onClick={() => handleRemoveDeliveryItem(index)}
                          className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-xl flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                          <div className="md:col-span-2 space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">ชนิดน้ำมัน</label>
                            {item.isFromOrder ? (
                              <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900 rounded-2xl text-sm font-black text-gray-700 dark:text-gray-300 border-2 border-transparent">
                                {item.oilType}
                              </div>
                            ) : (
                              <select
                                value={item.oilType}
                                onChange={e => {
                                  const newType = e.target.value as OilType;
                                  handleUpdateDeliveryItem(index, "oilType", newType);
                                  handleUpdateDeliveryItem(index, "pricePerLiter", oilPrices[newType] || 0);
                                }}
                                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-2xl focus:border-blue-500 text-sm font-black outline-none transition-all"
                              >
                                {oilTypes.map(t => <option key={t} value={t}>{t}</option>)}
                              </select>
                            )}
                          </div>

                          <div className="md:col-span-3 space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">แหล่งที่มาน้ำมัน *</label>
                            <select
                              value="depot"
                              disabled
                              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-700 rounded-2xl text-[10px] font-black uppercase outline-none"
                            >
                              <option value="depot">สั่งซื้อจากคลัง ปตท. โดยตรง</option>
                            </select>
                          </div>

                          <div className="md:col-span-2 space-y-2">
                            <label className="text-[10px] font-black text-purple-600 uppercase tracking-widest block ml-1">ราคาขาย/ลิตร (บาท)</label>
                            <div className="relative">
                              <input
                                type="number"
                                step="0.01"
                                value={item.pricePerLiter || ""}
                                onChange={e => handleUpdateDeliveryItem(index, "pricePerLiter", Number(e.target.value))}
                                className="w-full px-4 py-3 bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-100 dark:border-purple-800/50 rounded-2xl focus:border-purple-500 text-sm font-black text-purple-600 text-right outline-none shadow-inner"
                                placeholder="0.00"
                              />
                              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[9px] text-purple-400 font-black uppercase pointer-events-none tracking-tighter">Price</div>
                            </div>
                          </div>

                          <div className="md:col-span-2 space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">จำนวนส่งจริง (ลิตร)</label>
                            <div className="relative">
                              <input
                                type="number"
                                value={item.quantityToDeliver || ""}
                                onChange={e => handleUpdateDeliveryItem(index, "quantityToDeliver", Number(e.target.value))}
                                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-blue-100 dark:border-blue-900/30 rounded-2xl focus:border-blue-500 text-sm font-black text-blue-600 text-right outline-none shadow-inner"
                                placeholder="0"
                              />
                              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[9px] text-blue-400 font-black uppercase pointer-events-none tracking-tighter">Qty (L)</div>
                            </div>
                          </div>

                          <div className="md:col-span-3 space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1 text-right">มูลค่ารายการนี้</label>
                            <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-600/20 min-h-[48px] flex items-center justify-end">
                              <p className="text-xl font-black tracking-tight">฿{item.totalAmount.toLocaleString()}</p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="p-10 bg-gradient-to-br from-blue-700 to-indigo-800 rounded-[3rem] text-white shadow-2xl shadow-blue-600/20 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                  <div className="flex flex-col md:flex-row justify-between items-center gap-10 relative z-10">
                    <div className="flex gap-12">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 block mb-2">ปริมาณรวมทั้งสิ้น</span>
                        <p className="text-4xl font-black">{deliveryItems.reduce((sum, item) => sum + item.quantityToDeliver, 0).toLocaleString()} <span className="text-xs font-normal opacity-50">ลิตร</span></p>
                      </div>
                      <div className="w-px h-16 bg-white/10 hidden md:block"></div>
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 block mb-2">จำนวนรายการ</span>
                        <p className="text-4xl font-black">{deliveryItems.length} <span className="text-xs font-normal opacity-50">รายการ</span></p>
                      </div>
                    </div>
                    
                    <div className="text-right space-y-2">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 block">มูลค่ารวมที่อนุมัติ</span>
                      <p className="text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-blue-200">
                        ฿{numberFormatter.format(deliveryItems.reduce((sum, item) => sum + item.totalAmount, 0))}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border-2 border-dashed border-amber-200 dark:border-amber-800/50 text-xs font-bold text-amber-700 dark:text-amber-400 flex items-start gap-3">
                  <Clock className="w-5 h-5 shrink-0" />
                  <p className="leading-relaxed">
                    * เมื่อกดอนุมัติแล้ว ระบบจะปรับสถานะออเดอร์เป็น "อนุมัติแล้ว" สาขาปลายทางจะได้รับแจ้งเตือนเพื่อเตรียมรับน้ำมัน และคุณต้องดำเนินการเปิด PO กับ ปตท. ในขั้นตอนถัดไป
                  </p>
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-700 flex gap-3">
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="flex-1 px-6 py-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 font-black uppercase tracking-widest text-sm transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleSaveAssignment}
                  className="flex-[2] px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-xl shadow-blue-600/30 transition-colors uppercase tracking-widest text-sm flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  ยืนยันการอนุมัติออเดอร์
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Create Order Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            >
              <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-emerald-50 dark:bg-emerald-900/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500 rounded-xl">
                    <PlusCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-emerald-800 dark:text-emerald-400">สร้างคำสั่งซื้อน้ำมันจากคลัง (ส่วนกลางสั่งให้)</h2>
                    <p className="text-xs text-emerald-600 dark:text-emerald-500 font-bold">Central Depot Order Creation</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowCreateModal(false)} 
                  className="p-2 hover:bg-white dark:hover:bg-gray-700 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-8">
                {/* Branch & Date Selection */}
                <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <h4 className="text-sm font-black text-gray-800 dark:text-white uppercase tracking-widest">ข้อมูลพื้นฐานคำสั่งซื้อ</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-bold">
                    <div className="space-y-2">
                      <label htmlFor="newOrderBranch" className="text-[10px] font-black text-gray-400 uppercase tracking-widest">สั่งซื้อให้สาขาปลายทาง *</label>
                      <select
                        id="newOrderBranch"
                        value={newOrderBranchId}
                        onChange={e => setNewOrderBranchId(Number(e.target.value))}
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-2xl focus:border-emerald-500 text-sm font-black transition-all outline-none"
                      >
                        <option value={0}>เลือกสาขาปลายทาง</option>
                        {branches.filter(b => b.id !== 1).map(b => (
                          <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="newOrderDate" className="text-[10px] font-black text-gray-400 uppercase tracking-widest">วันที่ต้องการรับน้ำมัน *</label>
                      <input
                        id="newOrderDate"
                        type="date"
                        value={newOrderRequestedDate}
                        onChange={e => setNewOrderRequestedDate(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-2xl focus:border-emerald-500 text-sm font-black outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Oil Items Selection */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
                        <Droplet className="w-4 h-4" />
                      </div>
                      <h4 className="text-sm font-black text-gray-800 dark:text-white uppercase tracking-widest">รายการน้ำมันจากคลัง</h4>
                    </div>
                    <button
                      onClick={handleAddNewOrderItem}
                      className="text-xs font-black text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-4 py-2 rounded-xl border border-emerald-100 transition-all flex items-center gap-2"
                    >
                      <Plus className="w-3 h-3" /> เพิ่มรายการ
                    </button>
                  </div>

                  <div className="space-y-3 font-bold">
                    {newOrderItems.map((item, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="p-6 bg-white dark:bg-gray-900 border-2 border-gray-50 dark:border-gray-800 rounded-3xl shadow-sm flex flex-col md:flex-row gap-6 items-end"
                      >
                        <div className="flex-1 space-y-2 w-full">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">ประเภทน้ำมัน</label>
                          <select
                            value={item.oilType}
                            onChange={e => handleUpdateNewOrderItem(idx, "oilType", e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-2xl focus:border-emerald-500 text-sm font-black outline-none"
                          >
                            {oilTypes.map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                        </div>
                        <div className="w-full md:w-32 space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">จำนวน (ลิตร)</label>
                          <input
                            type="number"
                            value={item.quantity || ""}
                            onChange={e => handleUpdateNewOrderItem(idx, "quantity", Number(e.target.value))}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-2xl focus:border-emerald-500 text-sm font-black text-right outline-none"
                            placeholder="0"
                          />
                        </div>
                        <div className="w-full md:w-40 space-y-2">
                          <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">ราคา/ลิตร (บาท)</label>
                          <div className="relative">
                            <input
                              type="number"
                              step="0.01"
                              value={item.pricePerLiter || ""}
                              onChange={e => handleUpdateNewOrderItem(idx, "pricePerLiter", Number(e.target.value))}
                              className="w-full px-4 py-3 bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-100 dark:border-emerald-800 rounded-2xl focus:border-emerald-500 text-sm font-black text-emerald-600 text-right outline-none"
                            />
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[9px] text-emerald-400 font-black uppercase pointer-events-none">Price</div>
                          </div>
                        </div>
                        <div className="w-full md:w-48 space-y-2 text-right">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">ยอดรวม (บาท)</p>
                          <p className="text-lg font-black text-gray-900 dark:text-white py-2">
                            {(item.quantity * item.pricePerLiter).toLocaleString()}
                          </p>
                        </div>
                        {newOrderItems.length > 1 && (
                          <button
                            onClick={() => handleRemoveNewOrderItem(idx)}
                            className="p-3 text-red-500 hover:bg-red-50 rounded-2xl transition-all mb-1"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Notes & Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 px-1">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500">
                        <FileText className="w-4 h-4" />
                      </div>
                      <h4 className="text-sm font-black text-gray-800 dark:text-white uppercase tracking-widest">หมายเหตุเพิ่มเติม</h4>
                    </div>
                    <textarea
                      value={newOrderNotes}
                      onChange={e => setNewOrderNotes(e.target.value)}
                      rows={4}
                      placeholder="ระบุรายละเอียดเพิ่มเติมถึงสาขาปลายทาง..."
                      className="w-full p-5 bg-gray-50 dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-3xl focus:border-emerald-500 text-sm font-bold outline-none resize-none shadow-inner"
                    />
                  </div>
                  
                  <div className="p-8 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-[2.5rem] text-white shadow-xl shadow-emerald-600/20 space-y-6">
                    <p className="text-xs font-black uppercase tracking-[0.2em] opacity-80 border-b border-white/20 pb-4">สรุปมูลค่าคำสั่งซื้อรวม</p>
                    <div className="flex justify-between items-baseline">
                      <span className="text-sm font-bold opacity-80">รวมปริมาณทั้งสิ้น</span>
                      <span className="text-2xl font-black">{newOrderItems.reduce((sum, i) => sum + i.quantity, 0).toLocaleString()} <span className="text-xs font-normal opacity-70">ลิตร</span></span>
                    </div>
                    <div className="flex justify-between items-center py-4 border-y border-white/10">
                      <span className="text-sm font-bold opacity-80">มูลค่ารวม (สุทธิ)</span>
                      <div className="text-right">
                        <p className="text-4xl font-black tracking-tighter">฿{newOrderItems.reduce((sum, i) => sum + (i.quantity * i.pricePerLiter), 0).toLocaleString()}</p>
                        <p className="text-[10px] opacity-60 font-bold mt-1 uppercase tracking-widest">Inclusive of taxes</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 bg-white/10 rounded-2xl border border-white/10">
                      <CheckCircle className="w-5 h-5 text-emerald-300 shrink-0" />
                      <p className="text-[10px] font-bold leading-relaxed text-emerald-50">
                        เมื่อกดบันทึก รายการจะถูกส่งไปยังสาขาปลายทางโดยอัตโนมัติในสถานะ <span className="underline decoration-2 underline-offset-4">"อนุมัติแล้ว"</span> และพร้อมดำเนินการสั่งซื้อต่อกับทาง ปตท. ทันที
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-6 py-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 font-black uppercase tracking-widest text-sm transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleSaveNewOrder}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl shadow-xl shadow-emerald-600/30 uppercase tracking-widest text-sm flex items-center gap-2 transition-colors"
                >
                  <PlusCircle className="w-5 h-5" /> 
                  บันทึกและส่งออเดอร์
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
