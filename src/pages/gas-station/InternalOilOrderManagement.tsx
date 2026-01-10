import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo, useEffect, useCallback } from "react";
import {
  ShoppingCart,
  Search,
  CheckCircle,
  Clock,
  X,
  Building2,
  FileText,
  Truck,
  Calendar,
  Eye,
  MapPin,
  Droplet,
  Plus,
  Trash2,
  Download,
  FileCheck,
  Navigation,
  Save,
  PlusCircle,
  Paperclip as AttachmentIcon,
  Lock
} from "lucide-react";
import { useGasStation } from "@/contexts/GasStationContext";
import { useBranch } from "@/contexts/BranchContext";
import { useAuth } from "@/contexts/AuthContext";
import type { InternalOilOrder, OilType } from "@/types/gasStation";
import { convertNumberToThaiWords } from "@/utils/numberToThaiWords";

// Mock Current Prices (Based on previous work)
const currentOilPrices: Record<string, number> = {
  "Premium Diesel": 34.59,
  "Diesel": 31.29,
  "Gasohol 95": 35.45,
  "Gasohol 91": 34.98,
  "E20": 32.75,
  "E85": 27.30,
};

const priceFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const currencyFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 0,
});

// Mock data - Internal Transport Orders ที่ยังไม่เลยเวลาส่ง (ดึงจาก InternalTransport.tsx)
// ในระบบจริงจะดึงจาก context หรือ API
// หมายเหตุ: ข้อมูลนี้ยังไม่ถูกใช้งาน แต่เก็บไว้สำหรับอนาคต

// Mock data for Suction Oil (น้ำมันจากการดูด)
const mockSuctionOilRecords = [
  {
    id: "SUC-001",
    branchId: 1,
    branchName: "ปั๊มไฮโซ",
    date: "2024-12-18",
    items: [
      { oilType: "Diesel", quantity: 800, pricePerLiter: 30.0 },
    ],
    notes: "ดูดจากถังพักน้ำมัน",
  },
  {
    id: "SUC-002",
    branchId: 2,
    branchName: "ดินดำ",
    date: "2024-12-18",
    items: [
      { oilType: "Premium Diesel", quantity: 500, pricePerLiter: 32.5 },
    ],
    notes: "ดูดจากการล้างถัง",
  }
];

// Mock data - ราคาน้ำมันต่อลิตร
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

const dateFormatter = new Intl.DateTimeFormat("th-TH", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

interface DeliveryItem {
  oilType: OilType;
  quantity: number; // จำนวนที่สั่งมาเดิม
  quantityToDeliver: number; // จำนวนที่จะส่งจริง (user input)
  pricePerLiter: number;
  totalAmount: number;
  isFromOrder: boolean;
  sourceAvailableQty?: number; // จำนวนที่มีในแหล่งที่มา (รถ/ดูด)
  branchTotalAvailable?: number; // จำนวนน้ำมันทั้งหมดที่มีในปั๊ม (สำหรับชนิดน้ำมันนี้)
  assignedFromBranchId: number;
  deliverySource: "truck" | "suction"; // เอา "none" ออก
  selectedTruckTripId?: string;
  transportNo?: string;
  sourceRefId?: string;
  sourceLabel?: string;
}

export default function InternalOilOrderManagement() {
  const { 
    internalOrders, 
    updateInternalOrder, 
    approveInternalOrder, 
    cancelInternalOrder, 
    branches,
    createInternalOrder,
    getNextRunningNumber,
    purchaseOrders
  } = useGasStation();
  const { selectedBranches } = useBranch();
  const { user } = useAuth();
  
  // ตรวจสอบว่ามีการเลือกปั๊มไฮโซ (ID: 1) ใน Global Filter หรือไม่
  const isHisoSelected = useMemo(() => {
    return selectedBranches.length === 0 || selectedBranches.includes("1");
  }, [selectedBranches]);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | InternalOilOrder["status"]>("all");
  const [filterBranch, setFilterBranch] = useState<number | "all">("all");
  const [filterDateFrom, setFilterDateFrom] = useState<string>("");
  const [filterDateTo, setFilterDateTo] = useState<string>("");
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<InternalOilOrder | null>(null);
  const [deliveryDate, setDeliveryDate] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  // --- New Order Form State ---
  const [approveNo, setApproveNo] = useState("");
  const [referenceOrderNo, setReferenceOrderNo] = useState("");
  const [supplyingBranchId, setSupplyingBranchId] = useState<number>(1);
  
  // Item Entry State
  const [entryBranchId, setEntryBranchId] = useState<number>(0);
  const [entryOilType, setEntryOilType] = useState<OilType>("Diesel");
  const [entryQuantity, setEntryQuantity] = useState<number>(0);
  const [entryPrice, setEntryPrice] = useState<number>(currentOilPrices["Diesel"] || 0);
  const [entrySourceId, setEntrySourceId] = useState<string>("");

  const [newOrderItems, setNewOrderItems] = useState<Array<{ 
    branchId: number;
    branchName: string;
    oilType: OilType;
    quantity: number; 
    pricePerLiter: number;
    sourceType?: "remaining" | "transit" | "sucked";
    sourceRefId?: string;
    sourceLabel?: string;
  }>>([]);

  const [newOrderNotes, setNewOrderNotes] = useState("");

  // Update entry price & reset source when oil type changes
  useEffect(() => {
    if (entryOilType) {
      setEntryPrice(currentOilPrices[entryOilType] || 0);
      setEntrySourceId(""); // Reset source when oil type changes to keep dropdown consistent
    }
  }, [entryOilType]);

  // Helper to get available sources for a specific branch and oil type
  const getAvailableSources = useCallback((branchId: number, oilType: OilType) => {
    if (!branchId || !oilType) return [];

    const sources: Array<{ 
      id: string; 
      orderNo?: string; 
      oilType: OilType; 
      quantity: number; 
      sourceType: "remaining" | "transit" | "sucked"; 
      label: string; 
      refId?: string 
    }> = [];

    // 1. Remaining on Truck (🚚)
    // - From Internal Orders (Orders delivered TO this branch)
    internalOrders
      .filter(o => o.fromBranchId === branchId && o.status === "ส่งแล้ว")
      .forEach(o => o.items
        .filter(i => (i.keptOnTruckQuantity || 0) > 0 && i.oilType === oilType)
        .forEach(i => sources.push({
          id: `REM-${o.orderNo}-${i.oilType}`,
          orderNo: o.orderNo,
          oilType: i.oilType,
          quantity: i.keptOnTruckQuantity || 0,
          sourceType: "remaining",
          label: `🚚 ค้างรถ (${o.orderNo}) - ${(i.keptOnTruckQuantity || 0).toLocaleString()} ล.`
        }))
      );
    
    // - From PTT Purchase Orders (Orders delivered TO this branch)
    purchaseOrders
      .filter(o => o.branches.some(b => b.branchId === branchId) && o.status === "ขนส่งสำเร็จ")
      .forEach(o => o.branches
        .filter(b => b.branchId === branchId)
        .forEach(b => b.items
          .filter(i => (i.keptOnTruckQuantity || 0) > 0 && i.oilType === oilType)
          .forEach(i => sources.push({
            id: `PTT-REM-${o.orderNo}-${i.oilType}`,
            orderNo: o.orderNo,
            oilType: i.oilType,
            quantity: i.keptOnTruckQuantity || 0,
            sourceType: "remaining",
            label: `🚚 ค้างรถ (PTT:${o.orderNo}) - ${(i.keptOnTruckQuantity || 0).toLocaleString()} ล.`
          }))
        )
      );

    // 2. In Transit (🚛)
    // - From Internal Orders (Orders heading TO this branch)
    internalOrders
      .filter(o => o.fromBranchId === branchId && o.status === "กำลังจัดส่ง")
      .forEach(o => o.items
        .filter(i => i.oilType === oilType)
        .forEach(i => sources.push({
          id: `TRA-${o.orderNo}-${i.oilType}`,
          orderNo: o.orderNo,
          oilType: i.oilType,
          quantity: i.quantity,
          sourceType: "transit",
          label: `🚛 กำลังส่ง (${o.orderNo}) - ${i.quantity.toLocaleString()} ล.`
        }))
      );
    
    // - From PTT Purchase Orders (Orders heading TO this branch)
    purchaseOrders
      .filter(o => o.branches.some(b => b.branchId === branchId) && o.status === "กำลังขนส่ง")
      .forEach(o => o.branches
        .filter(b => b.branchId === branchId)
        .forEach(b => b.items
          .filter(i => i.oilType === oilType)
          .forEach(i => sources.push({
            id: `PTT-TRA-${o.orderNo}-${i.oilType}`,
            orderNo: o.orderNo,
            oilType: i.oilType,
            quantity: i.quantity,
            sourceType: "transit",
            label: `🚛 กำลังส่ง (PTT:${o.orderNo}) - ${i.quantity.toLocaleString()} ล.`
          }))
        )
      );

    // 3. Sucked Oil (💉)
    mockSuctionOilRecords
      .filter(r => r.branchId === branchId)
      .forEach(r => r.items
        .filter((i: any) => i.oilType === oilType)
        .forEach((i: any) => sources.push({
          id: `SUC-${r.id}-${i.oilType}`,
          refId: r.id,
          oilType: i.oilType as OilType,
          quantity: i.quantity,
          sourceType: "sucked",
          label: `💉 ดูดคืน (${r.date}) - ${i.quantity.toLocaleString()} ล.`
        })));

    return sources;
  }, [internalOrders, purchaseOrders]);

  // Available Oil Sources for selected Supplying Branch & Selected Oil Type (Used in New Order Modal)
  const availableSources = useMemo(() => {
    return getAvailableSources(supplyingBranchId, entryOilType);
  }, [supplyingBranchId, entryOilType, getAvailableSources]);

  // --- สรุปน้ำมันที่มีในสาขาต้นทาง (Inventory Summary) ---
  const branchInventory = useMemo(() => {
    if (!supplyingBranchId) return [];
    
    const summary: Record<string, { oilType: OilType; remaining: number; transit: number; sucked: number }> = {};

    // Helper to get or create entry
    const getEntry = (type: OilType) => {
      if (!summary[type]) {
        summary[type] = { oilType: type, remaining: 0, transit: 0, sucked: 0 };
      }
      return summary[type];
    };

    // 1. Remaining on Truck
    // - Internal Orders
    internalOrders
      .filter(o => o.fromBranchId === supplyingBranchId && o.status === "ส่งแล้ว")
      .forEach(o => o.items.forEach(i => {
        if ((i.keptOnTruckQuantity || 0) > 0) {
          getEntry(i.oilType).remaining += (i.keptOnTruckQuantity || 0);
        }
      }));
    // - PTT Orders
    purchaseOrders
      .filter(o => o.branches.some(b => b.branchId === supplyingBranchId) && o.status === "ขนส่งสำเร็จ")
      .forEach(o => o.branches
        .filter(b => b.branchId === supplyingBranchId)
        .forEach(b => b.items.forEach(i => {
          if ((i.keptOnTruckQuantity || 0) > 0) {
            getEntry(i.oilType).remaining += (i.keptOnTruckQuantity || 0);
          }
        })));

    // 2. In Transit
    // - Internal Orders
    internalOrders
      .filter(o => o.fromBranchId === supplyingBranchId && o.status === "กำลังจัดส่ง")
      .forEach(o => o.items.forEach(i => {
        getEntry(i.oilType).transit += i.quantity;
      }));
    // - PTT Orders
    purchaseOrders
      .filter(o => o.branches.some(b => b.branchId === supplyingBranchId) && o.status === "กำลังขนส่ง")
      .forEach(o => o.branches
        .filter(b => b.branchId === supplyingBranchId)
        .forEach(b => b.items.forEach(i => {
          getEntry(i.oilType).transit += i.quantity;
        })));

    // 3. Sucked Oil
    mockSuctionOilRecords
      .filter(r => r.branchId === supplyingBranchId)
      .forEach(r => r.items.forEach((i: any) => {
        getEntry(i.oilType as OilType).sucked += i.quantity;
      }));

    return Object.values(summary).filter(item => (item.remaining + item.transit + item.sucked) > 0);
  }, [supplyingBranchId, internalOrders, purchaseOrders]);
  // --- End Inventory Summary ---

  // Helper function to calculate branch inventory for a specific branchId
  const calculateBranchInventoryForBranch = useCallback((branchId: number, oilType: OilType): number => {
    if (!branchId) return 0;
    
    let total = 0;

    // 1. Remaining on Truck from Internal Orders
    internalOrders
      .filter(o => o.fromBranchId === branchId && o.status === "ส่งแล้ว")
      .forEach(o => o.items.forEach(i => {
        if (i.oilType === oilType && (i.keptOnTruckQuantity || 0) > 0) {
          total += (i.keptOnTruckQuantity || 0);
        }
      }));

    // 2. Remaining on Truck from PTT Orders
    purchaseOrders
      .filter(o => o.branches.some(b => b.branchId === branchId) && o.status === "ขนส่งสำเร็จ")
      .forEach(o => o.branches
        .filter(b => b.branchId === branchId)
        .forEach(b => b.items.forEach(i => {
          if (i.oilType === oilType && (i.keptOnTruckQuantity || 0) > 0) {
            total += (i.keptOnTruckQuantity || 0);
          }
        })));

    // 3. In Transit from Internal Orders
    internalOrders
      .filter(o => o.fromBranchId === branchId && o.status === "กำลังจัดส่ง")
      .forEach(o => o.items.forEach(i => {
        if (i.oilType === oilType) {
          total += i.quantity;
        }
      }));

    // 4. In Transit from PTT Orders
    purchaseOrders
      .filter(o => o.branches.some(b => b.branchId === branchId) && o.status === "กำลังขนส่ง")
      .forEach(o => o.branches
        .filter(b => b.branchId === branchId)
        .forEach(b => b.items.forEach(i => {
          if (i.oilType === oilType) {
            total += i.quantity;
          }
        })));

    // 5. Sucked Oil
    mockSuctionOilRecords
      .filter(r => r.branchId === branchId)
      .forEach(r => r.items.forEach((i: any) => {
        if (i.oilType === oilType) {
          total += i.quantity;
        }
      }));

    return total;
  }, [internalOrders, purchaseOrders]);

  // Helper function to get total available oil for a specific oil type from branch inventory
  const getBranchTotalAvailable = (oilType: OilType): number => {
    if (!supplyingBranchId) return 0;
    return calculateBranchInventoryForBranch(supplyingBranchId, oilType);
  };

  const handleAddItem = () => {
    if (entryBranchId === 0 || entryQuantity <= 0) {
      alert("กรุณาเลือกสาขาและระบุจำนวนลิตร");
      return;
    }

    const branch = branches.find(b => b.id === entryBranchId);
    const source = availableSources.find((s: any) => s.id === entrySourceId);

    const newItem = {
      branchId: entryBranchId,
      branchName: branch?.name || "",
      oilType: entryOilType,
      quantity: entryQuantity,
      pricePerLiter: entryPrice,
      totalAmount: entryQuantity * entryPrice,
      sourceType: source?.sourceType as "remaining" | "transit" | "sucked" | undefined,
      sourceRefId: source?.id,
      sourceLabel: source?.label
    };

    setNewOrderItems([...newOrderItems, newItem]);
    setEntryQuantity(0);
    setEntrySourceId("");
  };

  const handleSaveOrder = () => {
    if (newOrderItems.length === 0 || !supplyingBranchId) {
      alert("กรุณาเพิ่มรายการสั่งซื้อ");
      return;
    }

    const supplyingBranch = branches.find(b => b.id === supplyingBranchId);
    const branchGroups = newOrderItems.reduce((acc, item) => {
      if (!acc[item.branchId]) acc[item.branchId] = [];
      acc[item.branchId].push(item);
      return acc;
    }, {} as Record<number, typeof newOrderItems>);

    Object.entries(branchGroups).forEach(([branchId, items], idx) => {
      const orderingBranch = branches.find(b => b.id === Number(branchId));
      // ใช้ prefix REQ- เพื่อให้สอดคล้องกับหน้า "สั่งน้ำมันจากสาขาไฮโซ" ของสาขาย่อย
      const generatedOrderNo = `REQ-${getNextRunningNumber("internal-oil-order")}`;
      
      const newOrder: InternalOilOrder = {
        id: `REQ-${Date.now()}-${idx}`,
        orderNo: generatedOrderNo,
        orderDate: new Date().toISOString().split("T")[0],
        requestedDate: new Date().toISOString().split("T")[0],
        fromBranchId: Number(branchId),
        fromBranchName: orderingBranch?.name || "",
        assignedFromBranchId: supplyingBranchId,
        assignedFromBranchName: supplyingBranch?.name || "",
        items: items.map(i => ({
          oilType: i.oilType,
          requestedQuantity: i.quantity,
          quantity: i.quantity,
          pricePerLiter: i.pricePerLiter,
          totalAmount: i.quantity * i.pricePerLiter,
          deliverySource: i.sourceType === "remaining" ? "truck" : i.sourceType === "sucked" ? "suction" : "none",
          sourceRefId: i.sourceRefId
        })),
        totalAmount: items.reduce((sum, i) => sum + (i.quantity * i.pricePerLiter), 0),
        // เมื่อส่วนกลาง (พี่นิด) เป็นคนสั่งให้ ให้สถานะเป็น "อนุมัติแล้ว" ทันทีเพื่อให้เด้งไปที่สาขาย่อยแบบพร้อมดำเนินการ
        status: "อนุมัติแล้ว",
        requestedBy: user?.name || "สำนักงานกลาง (พี่นิด)",
        requestedAt: new Date().toISOString(),
        approvedBy: user?.name || "สำนักงานกลาง (พี่นิด)",
        approvedAt: new Date().toISOString(),
        notes: newOrderNotes ? `${newOrderNotes} (สั่งโดยส่วนกลาง)` : "สั่งโดยส่วนกลาง",
        approveNo: approveNo || undefined
      };
      createInternalOrder(newOrder);
    });

    setShowCreateModal(false);
    setNewOrderItems([]);
    setApproveNo("");
    setReferenceOrderNo("");
    setNewOrderNotes("");
    alert("สร้างใบสั่งซื้อภายในสำเร็จ!");
  };
  // --- End New Order Logic ---

  // State for managing oil items (แสดงและแก้ไขรายการน้ำมัน)
  const [deliveryItems, setDeliveryItems] = useState<DeliveryItem[]>([]);

  // Helper function to check if date is in range
  const isDateInRange = (dateStr: string, from: string, to: string) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    if (from && !to) return d >= new Date(from);
    if (!from && to) return d <= new Date(to);
    if (from && to) return d >= new Date(from) && d <= new Date(to);
    return true;
  };

  // Filter orders
  const filteredOrders = useMemo(() => {
    // ถ้าไม่ได้เลือกปั๊มไฮโซ ไม่ต้องแสดงข้อมูลใดๆ
    if (!isHisoSelected) return [];

    return internalOrders.filter((order) => {
      // เฉพาะออเดอร์ที่สั่งมายังไฮโซ (หรือยังไม่ได้ระบุผู้ส่ง ซึ่งถือว่าเป็นไฮโซ)
      const isMeantForHiso = order.assignedFromBranchId === 1 || order.status === "รออนุมัติ";
      if (!isMeantForHiso) return false;

      const matchesSearch =
        order.orderNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.fromBranchName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.assignedFromBranchName?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === "all" || order.status === filterStatus;
      
      // หน้านี้ไม่รองรับการกรองสาขาจากหน้าบาร์ (ยกเว้นการเช็คว่าต้องเป็นไฮโซถึงจะเห็น)
      // แต่ยังรองรับการกรองจาก Dropdown ภายในหน้าเอง (filterBranch)
      const matchesBranch = filterBranch === "all" || order.fromBranchId === filterBranch;

      const matchesDate = isDateInRange(order.orderDate, filterDateFrom, filterDateTo);
      return matchesSearch && matchesStatus && matchesBranch && matchesDate;
    });
  }, [internalOrders, searchTerm, filterStatus, filterBranch, filterDateFrom, filterDateTo, isHisoSelected]);

  // Statistics
  const stats = useMemo(() => {
    if (!isHisoSelected) {
      return { total: 0, pending: 0, approved: 0, delivering: 0, completed: 0 };
    }
    const hisoOrders = internalOrders.filter(o => o.assignedFromBranchId === 1 || o.status === "รออนุมัติ");
    const total = hisoOrders.length;
    const pending = hisoOrders.filter((o) => o.status === "รออนุมัติ").length;
    const approved = hisoOrders.filter((o) => o.status === "อนุมัติแล้ว").length;
    const delivering = hisoOrders.filter((o) => o.status === "กำลังจัดส่ง").length;
    const completed = hisoOrders.filter((o) => o.status === "ส่งแล้ว").length;
    return { total, pending, approved, delivering, completed };
  }, [internalOrders, isHisoSelected]);

  const handleViewDetail = (order: InternalOilOrder) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  const handleApprove = (order: InternalOilOrder) => {
    setSelectedOrder(order);
    setDeliveryDate(order.requestedDate);
    setNotes("");
    
    // ตั้งค่าปั๊มต้นทางตามที่ระบุมาในออเดอร์ หรือถ้าไม่มีให้เป็นไฮโซ (Branch 1)
    const initialSupplyingBranchId = order.assignedFromBranchId || 1;
    setSupplyingBranchId(initialSupplyingBranchId);

    // Initialize delivery items from order items with default source/branch
    setDeliveryItems(order.items.map((item) => {
      // Get total available for this oil type from the branch inventory
      const branchTotalAvailable = calculateBranchInventoryForBranch(initialSupplyingBranchId, item.oilType);
      
      return {
      oilType: item.oilType,
      quantity: item.quantity, // จำนวนที่สั่ง
      quantityToDeliver: item.quantity, // Default: ส่งตามที่สั่ง
        pricePerLiter: item.pricePerLiter || oilPrices[item.oilType] || 0,
        totalAmount: item.totalAmount || (item.quantity * (oilPrices[item.oilType] || 0)),
      isFromOrder: true, // มาจากออเดอร์
        assignedFromBranchId: initialSupplyingBranchId,
        branchTotalAvailable,
        deliverySource: "truck",
        selectedTruckTripId: "",
        transportNo: "",
        sourceRefId: "",
        sourceLabel: ""
      };
    }));
    setShowAssignModal(true);
  };

  const handleAddDeliveryItem = () => {
    const newOilType: OilType = "Premium Diesel";
    const branchTotalAvailable = getBranchTotalAvailable(newOilType);
    
    setDeliveryItems([...deliveryItems, {
      oilType: newOilType,
      quantity: 0, // ไม่มีในออเดอร์
      quantityToDeliver: 0,
      pricePerLiter: oilPrices[newOilType],
      totalAmount: 0,
      isFromOrder: false, // เพิ่มใหม่
      assignedFromBranchId: supplyingBranchId || 1,
      branchTotalAvailable,
      deliverySource: "truck", // เปลี่ยนจาก none เป็น truck
      selectedTruckTripId: "",
      transportNo: "",
    }]);
  };

  const handleRemoveDeliveryItem = (index: number) => {
    setDeliveryItems(deliveryItems.filter((_, i) => i !== index));
  };

  const handleUpdateDeliveryItem = (index: number, field: keyof DeliveryItem, value: any) => {
    handleUpdateDeliveryItemMultiple(index, { [field]: value });
  };

  const handleUpdateDeliveryItemMultiple = (index: number, updates: Partial<DeliveryItem>) => {
    setDeliveryItems((prev) => {
      const next = [...prev];
      const item = { ...next[index], ...updates };

      // Update branchTotalAvailable when oilType or supplyingBranchId changes
      const currentBranchId = updates.assignedFromBranchId !== undefined ? updates.assignedFromBranchId : (item.assignedFromBranchId || supplyingBranchId);
      if (updates.oilType !== undefined || updates.assignedFromBranchId !== undefined || !item.branchTotalAvailable) {
        item.branchTotalAvailable = calculateBranchInventoryForBranch(currentBranchId, item.oilType);
      }

      // Recalculate total if quantity or price changed
      if (updates.quantityToDeliver !== undefined || updates.pricePerLiter !== undefined) {
        item.totalAmount = item.quantityToDeliver * item.pricePerLiter;
      }

      next[index] = item;
      return next;
    });
  };

  const handleSaveAssignment = () => {
    if (!selectedOrder) return;
    
    if (deliveryItems.length === 0) {
      alert("กรุณาเพิ่มรายการน้ำมันที่จะส่ง");
      return;
    }
    if (deliveryItems.some((item) => item.quantityToDeliver <= 0)) {
      alert("กรุณากรอกจำนวนน้ำมันที่จะส่งให้ถูกต้อง");
      return;
    }

    // Validate that quantityToDeliver doesn't exceed branchTotalAvailable
    const invalidItems = deliveryItems.filter((item) => 
      item.branchTotalAvailable !== undefined && item.quantityToDeliver > item.branchTotalAvailable
    );

    if (invalidItems.length > 0) {
      const invalidItemsText = invalidItems.map(item => 
        `- ${item.oilType}: ขาย ${item.quantityToDeliver.toLocaleString()} ลิตร แต่มีเพียง ${item.branchTotalAvailable?.toLocaleString()} ลิตร`
      ).join('\n');
      alert(`มีน้ำมันไม่พอสำหรับรายการต่อไปนี้:\n\n${invalidItemsText}\n\nกรุณาปรับจำนวนให้ถูกต้อง`);
      return;
    }

    // Update order with delivery items using context
    approveInternalOrder(
      selectedOrder.id,
      user?.name || "พี่นิด", 
      supplyingBranchId,
      deliveryItems.map((item) => ({
            oilType: item.oilType,
            quantity: item.quantityToDeliver, // จำนวนที่จะส่งจริง
            pricePerLiter: item.pricePerLiter,
            totalAmount: item.totalAmount,
        requestedQuantity: item.quantity, // เก็บจำนวนที่ขอมาตอนแรก
        deliverySource: item.deliverySource,
        transportNo: item.transportNo || "",
        truckTripId: item.selectedTruckTripId,
        sourceRefId: item.sourceRefId
      }))
    );

    setShowAssignModal(false);
    setSelectedOrder(null);
    setDeliveryItems([]);
    alert(`อนุมัติออเดอร์สำเร็จ!\n\nเลขที่ออเดอร์: ${selectedOrder.orderNo}\nมูลค่ารวม: ${numberFormatter.format(deliveryItems.reduce((sum, item) => sum + item.totalAmount, 0))} บาท`);
  };

  const handleCancelOrder = (order: InternalOilOrder) => {
    if (confirm(`คุณต้องการยกเลิกคำสั่งซื้อเลขที่ ${order.orderNo} ใช่หรือไม่?`)) {
      cancelInternalOrder(order.id, "พี่นิด");
      alert("ยกเลิกคำสั่งซื้อเรียบร้อยแล้ว");
    }
  };

  const handleUpdateStatus = (orderId: string, newStatus: InternalOilOrder["status"]) => {
    updateInternalOrder(orderId, { status: newStatus });
  };

  // ฟังก์ชันสำหรับดาวน์โหลดเอกสาร (จำลองการสร้าง PDF ด้วยการพิมพ์ HTML)
  const handleDownload = (type: "po" | "dn" | "inv", order: InternalOilOrder) => {
    const isPO = type === "po";
    const isINV = type === "inv";
    let title = "";
    if (isPO) title = "ใบสั่งซื้อน้ำมันภายใน (Internal PO)";
    else if (isINV) title = "ใบเสร็จรับเงิน/ใบกำกับภาษี (Tax Invoice/Receipt)";
    else title = "ใบส่งของน้ำมันภายใน (Internal DN)";
    
    const thaiAmountWords = convertNumberToThaiWords(order.totalAmount);
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${title} - ${order.orderNo}</title>
        <meta charset="utf-8">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;700&display=swap');
          body { font-family: 'Sarabun', sans-serif; padding: 40px; color: #333; line-height: 1.6; max-width: 900px; margin: 0 auto; background: white; }
          .header-container { display: flex; align-items: flex-start; gap: 20px; margin-bottom: 30px; }
          .logo-img { width: 100px; height: auto; object-fit: contain; }
          .company-details { flex-grow: 1; }
          .company-name { font-size: 24px; font-weight: bold; margin-bottom: 5px; }
          .address-info { font-size: 14px; color: #444; }
          
          .document-title { text-align: center; font-size: 26px; font-weight: bold; margin: 30px 0; text-decoration: none; }
          
          .customer-section { display: flex; justify-content: space-between; margin-bottom: 30px; font-size: 14px; }
          .customer-info { width: 60%; }
          .document-meta { width: 35%; text-align: right; }
          .customer-label { display: inline-block; width: 80px; font-weight: bold; }
          
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; border: 1px solid #333; }
          th { background-color: #60a5fa; color: white; padding: 10px; border: 1px solid #333; font-size: 14px; }
          td { padding: 8px 12px; border: 1px solid #333; font-size: 14px; }
          .col-no { width: 40px; text-align: center; }
          .col-qty { width: 80px; text-align: right; }
          .col-price { width: 100px; text-align: right; }
          .col-amount { width: 120px; text-align: right; }
          
          .summary-container { display: flex; justify-content: space-between; align-items: flex-start; }
          .amount-words-box { border: 1px solid #333; padding: 10px 30px; min-width: 400px; text-align: center; font-weight: bold; margin-top: 10px; border-radius: 4px; }
          .summary-table { width: 300px; border: none; }
          .summary-table td { border: 1px solid #333; padding: 5px 10px; }
          .summary-label { font-weight: bold; }
          
          .signature-section { margin-top: 80px; display: flex; justify-content: flex-end; padding-right: 50px; }
          .signature-box { text-align: center; width: 250px; }
          
          @media print { 
            .no-print { display: none; }
            body { padding: 20px; }
          }
        </style>
      </head>
      <body>
        <div class="header-container">
          <img src="https://upload.wikimedia.org/wikipedia/en/thumb/0/03/PTT_Public_Company_Limited_logo.svg/1200px-PTT_Public_Company_Limited_logo.svg.png" class="logo-img" alt="PTT Logo">
          <div class="company-details">
            <div class="company-name">PTT STATION</div>
            <div class="address-info">1187 ถนน สุขาภิบาล 17 ตำบลบรบือ</div>
            <div class="address-info">อำเภอบรบือ จังหวัดมหาสารคาม 44130</div>
            <div class="address-info">โทร. 091-9535355  ทะเบียนพาณิชย์ 1350200036462</div>
          </div>
        </div>

        <div class="document-title">${isINV ? 'ใบเสร็จรับเงิน' : isPO ? 'ใบสั่งซื้อ' : 'ใบส่งของ'}</div>

        <div class="customer-section">
          <div class="customer-info">
            <div><span class="customer-label">นามลูกค้า</span> ${order.fromBranchName}</div>
            <div style="margin-top: 5px;"><span class="customer-label">ที่อยู่</span> 200 หมู่ 10 ตำบลต้นธง อำเภอเมืองลำพูน</div>
            <div>จังหวัดลำพูน 51000</div>
            <div style="margin-top: 5px;"><span class="customer-label">เบอร์โทร</span> 053 534 775</div>
            <div><span class="customer-label">เลขผู้เสียภาษี</span> ............................................</div>
          </div>
          <div class="document-meta">
            <div><b>เลขที่</b> ${isINV ? '26 เล่มที่ 4' : order.orderNo}</div>
            <div><b>วันที่</b> ${dateFormatter.format(new Date(order.orderDate))}</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th class="col-no">ลำดับ</th>
              <th>รายการ</th>
              <th class="col-qty">จำนวน</th>
              <th class="col-price">ราคา/หน่วย</th>
              <th class="col-amount"></th>
            </tr>
          </thead>
          <tbody>
            ${order.items.map((item, index) => `
              <tr>
                <td class="col-no">${index + 1}.</td>
                <td>
                  <div style="font-weight: bold;">น้ำมันเชื้อเพลิงประเภท ${item.oilType}</div>
                  <div style="font-size: 12px; color: #444; margin-top: 4px;">- จำนวน ${item.quantity.toLocaleString()} ลิตร</div>
                </td>
                <td class="col-qty">${item.quantity.toLocaleString()}</td>
                <td class="col-price">${item.pricePerLiter.toFixed(2)}</td>
                <td class="col-amount">${item.totalAmount.toLocaleString()}</td>
              </tr>
            `).join('')}
            <tr>
              <td class="col-no">&nbsp;</td>
              <td>&nbsp;</td>
              <td class="col-qty">&nbsp;</td>
              <td class="col-price">&nbsp;</td>
              <td class="col-amount">&nbsp;</td>
            </tr>
          </tbody>
        </table>

        <div class="summary-container">
          <div class="amount-words-box">
            (${thaiAmountWords})
          </div>
          <table class="summary-table">
            <tr>
              <td class="summary-label">รวมเงิน</td>
              <td style="text-align: right;">${order.totalAmount.toLocaleString()}</td>
            </tr>
            <tr>
              <td class="summary-label">ภาษีมูลค่าเพิ่ม</td>
              <td style="text-align: right;">-</td>
            </tr>
            <tr style="background: #f1f5f9;">
              <td class="summary-label">รวมเงินทั้งสิ้น</td>
              <td style="text-align: right; font-weight: bold;">${order.totalAmount.toLocaleString()}</td>
            </tr>
          </table>
        </div>

        <div class="signature-section" style="margin-top: 100px;">
          <div class="signature-box">
            <div style="margin-bottom: 10px;">ผู้รับเงิน</div>
            <div style="margin-top: 40px;">( ...................................................... )</div>
          </div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 500);
          };
        </script>
      </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
    }
  };

  const getStatusColor = (status: InternalOilOrder["status"]) => {
    switch (status) {
      case "รออนุมัติ":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "อนุมัติแล้ว":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      case "กำลังจัดส่ง":
        return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
      case "ส่งแล้ว":
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
      case "ยกเลิก":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      {/* Header */}
      <header className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
              <div className="p-2 bg-purple-600 rounded-2xl shadow-lg shadow-purple-600/20">
                <ShoppingCart className="w-8 h-8 text-white" />
            </div>
              จัดการคำสั่งซื้อ (สาขาไฮโซ)
          </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium flex items-center gap-2">
              <Building2 className="w-4 h-4" />
            ดูและจัดการการสั่งซื้อน้ำมันจากปั๊มต่างๆ ในเครือข่าย
          </p>
        </div>
          
          <div className="flex bg-white dark:bg-gray-800 p-1 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <button
              onClick={() => setFilterStatus("all")}
              className={`px-6 py-2 rounded-xl text-sm font-black transition-all ${
                filterStatus === "all" 
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-600/20" 
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              ทั้งหมด
            </button>
            <button
              onClick={() => setFilterStatus("รออนุมัติ")}
              className={`px-6 py-2 rounded-xl text-sm font-black transition-all ${
                filterStatus === "รออนุมัติ" 
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-600/20" 
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              รออนุมัติ
            </button>
            </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-2xl font-black transition-all shadow-lg shadow-purple-600/20 active:scale-95"
          >
            <Plus className="w-5 h-5" />
            สร้างการสั่งซื้อ (ภายใน)
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
          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-2xl">
            <Clock className="w-8 h-8 text-purple-600" />
          </div>
            <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">รายการรออนุมัติ</p>
            <p className="text-3xl font-black text-gray-900 dark:text-white">{stats.pending}</p>
            <p className="text-sm font-bold text-purple-600 mt-1">ต้องดำเนินการ</p>
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
        
        <div className="md:col-span-2 bg-gradient-to-br from-purple-600 to-indigo-700 p-6 rounded-3xl shadow-xl shadow-purple-500/20 flex items-center justify-between text-white">
          <div className="space-y-1">
            <p className="text-xs font-bold text-purple-100 uppercase tracking-widest">คำสั่งซื้อวันนี้</p>
            <p className="text-2xl font-black">
              {stats.total} รายการทั้งหมด
            </p>
            <p className="text-purple-200 text-sm font-medium flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              จัดการและอนุมัติรายการสั่งซื้อระหว่างสาขา
            </p>
            </div>
          <div className="opacity-20">
            <ShoppingCart className="w-20 h-20" />
            </div>
          </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm mb-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="ค้นหาเลขที่ออเดอร์ หรือ ชื่อปั๊ม..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-purple-600 outline-none text-gray-900 dark:text-white font-medium"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterBranch}
              onChange={(e) => setFilterBranch(e.target.value === "all" ? "all" : Number(e.target.value))}
              className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-purple-600 outline-none text-gray-900 dark:text-white font-bold text-sm min-w-[150px]"
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
            <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900 px-4 py-2 rounded-2xl font-bold text-sm">
              <input
                type="date"
                value={filterDateFrom}
                onChange={(e) => setFilterDateFrom(e.target.value)}
                className="bg-transparent border-none outline-none text-gray-900 dark:text-white"
              />
              <span className="text-gray-400">-</span>
              <input
                type="date"
                value={filterDateTo}
                onChange={(e) => setFilterDateTo(e.target.value)}
                className="bg-transparent border-none outline-none text-gray-900 dark:text-white"
              />
            </div>
            {(filterDateFrom || filterDateTo || searchTerm || filterBranch !== "all") && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilterBranch("all");
                  setFilterDateFrom("");
                  setFilterDateTo("");
                }}
                className="p-3 bg-gray-100 dark:bg-gray-700 text-gray-500 rounded-2xl hover:bg-gray-200 transition-colors"
                title="ล้างตัวกรอง"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-gray-900/50 text-[10px] uppercase tracking-widest font-black text-gray-400">
                <th className="px-6 py-4">เลขที่ออเดอร์ / วันที่</th>
                <th className="px-6 py-4">ปั๊มที่สั่ง</th>
                <th className="px-6 py-4">ปั๊มที่ส่ง</th>
                <th className="px-6 py-4 text-right">จำนวนน้ำมัน (ลิตร)</th>
                <th className="px-6 py-4 text-right">มูลค่ารวม</th>
                <th className="px-6 py-4 text-center">สถานะ</th>
                <th className="px-6 py-4 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700 font-medium">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400 italic font-medium">
                    <div className="flex flex-col items-center gap-2">
                      <ShoppingCart className="w-8 h-8 opacity-20" />
                      ไม่พบรายการสั่งซื้อ
                    </div>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="group hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-900 dark:text-white">
                          {order.orderNo}
                    </span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] font-black text-purple-600 uppercase tracking-tighter flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(order.orderDate).toLocaleDateString('th-TH')}
                          </span>
                          {order.sourceType === "external" && (
                            <span className="text-[9px] font-black bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded border border-emerald-100 uppercase tracking-tighter">
                              สั่งจากคลัง
                            </span>
                          )}
                        </div>
                      </div>
                  </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-900 flex items-center justify-center border border-gray-200 dark:border-gray-700">
                          <Building2 className="w-4 h-4 text-blue-500" />
                        </div>
                        <span className="font-bold text-gray-700 dark:text-gray-300">{order.fromBranchName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3 font-bold text-gray-700 dark:text-gray-300">
                    {order.assignedFromBranchName ? (
                          <>
                            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center border border-emerald-100 dark:border-emerald-800">
                              <MapPin className="w-4 h-4 text-emerald-500" />
                      </div>
                            <span>{order.assignedFromBranchName}</span>
                          </>
                    ) : (
                          <span className="text-gray-400 italic font-medium">ยังไม่ได้กำหนด</span>
                    )}
                      </div>
                  </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex flex-col items-end">
                      {order.items.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-gray-400 uppercase">{item.oilType}</span>
                            <span className="font-bold text-gray-700 dark:text-gray-300">{item.quantity.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </td>
                    <td className="px-6 py-4 text-right font-black text-blue-600 dark:text-blue-400">
                      {numberFormatter.format(order.totalAmount)}
                  </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold border shadow-sm ${getStatusColor(order.status)}`}>
                      {getStatusText(order.status)}
                    </span>
                  </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                      {order.status === "รออนุมัติ" && (
                          <>
                        <button
                          onClick={() => handleApprove(order)}
                              className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-[10px] font-black rounded-lg transition-colors shadow-sm"
                        >
                          อนุมัติ
                        </button>
                            <button
                              onClick={() => handleCancelOrder(order)}
                              className="px-4 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-[10px] font-black rounded-lg border border-red-100 transition-colors shadow-sm"
                            >
                              ยกเลิก
                            </button>
                          </>
                      )}
                      {order.status === "อนุมัติแล้ว" && (
                        <button
                          onClick={() => handleUpdateStatus(order.id, "กำลังจัดส่ง")}
                            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black rounded-lg transition-colors shadow-sm"
                        >
                          เริ่มจัดส่ง
                        </button>
                      )}
                      {order.status === "กำลังจัดส่ง" && (
                        <button
                          onClick={() => handleUpdateStatus(order.id, "ส่งแล้ว")}
                            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black rounded-lg transition-colors shadow-sm"
                        >
                            ยืนยันการรับ
                        </button>
                      )}
                      <button
                        onClick={() => handleViewDetail(order)}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors group"
                      >
                          <Eye className="w-4 h-4 text-gray-400 group-hover:text-purple-600" />
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
              className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-purple-50 dark:bg-purple-900/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-600 rounded-xl shadow-lg">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-purple-800 dark:text-purple-400 uppercase tracking-tight flex items-center gap-2">
                      รายละเอียดคำสั่งซื้อ
                      {selectedOrder.sourceType === "external" && (
                        <span className="text-[10px] bg-emerald-500 text-white px-2 py-0.5 rounded-full">สั่งซื้อจากคลัง (ปตท.)</span>
                      )}
                </h2>
                    <p className="text-xs text-purple-600 dark:text-purple-500 font-bold">อ้างอิง: {selectedOrder.orderNo}</p>
                  </div>
                </div>
                <button onClick={() => setShowDetailModal(false)} className="p-2 hover:bg-white dark:hover:bg-gray-700 rounded-full transition-colors group">
                  <X className="w-5 h-5 text-gray-400 group-hover:rotate-90 transition-transform" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-6">
                {/* Status Dashboard */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-bold">
                  <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-700">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">สถานะปัจจุบัน</span>
                    <p className="text-lg font-black text-gray-900 dark:text-white">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold border shadow-sm ${getStatusColor(selectedOrder.status)}`}>
                    {getStatusText(selectedOrder.status)}
                  </span>
                    </p>
                  </div>
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/10 rounded-2xl border border-purple-100 dark:border-purple-800/50">
                    <span className="text-[10px] font-black text-purple-600 uppercase tracking-widest block mb-1">มูลค่ารวมทั้งหมด</span>
                    <p className="text-2xl font-black text-purple-600">{numberFormatter.format(selectedOrder.totalAmount)} บาท</p>
                  </div>
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-800/50">
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest block mb-1">วันที่ต้องการ</span>
                    <p className="text-lg font-black text-blue-600">{dateFormatter.format(new Date(selectedOrder.requestedDate))}</p>
                    </div>
                    </div>

                {/* Branches Info (Matching InternalOilPayment style) */}
                <div className="flex flex-col md:flex-row items-center gap-4 bg-purple-50/30 dark:bg-purple-900/10 p-6 rounded-3xl border border-purple-100 dark:border-purple-800/50 relative">
                  <div className="flex-1 text-center md:text-left space-y-1">
                    <span className="text-[10px] font-black text-purple-500 uppercase tracking-widest block">สาขาที่สั่ง (ผู้ซื้อ)</span>
                    <p className="text-lg font-black text-gray-900 dark:text-white flex items-center justify-center md:justify-start gap-2">
                      <Building2 className="w-5 h-5 text-purple-500" />
                      {selectedOrder.fromBranchName}
                    </p>
                  </div>
                  <div className="flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-lg">
                      <Navigation className="w-5 h-5 rotate-90" />
                    </div>
                  </div>
                  <div className="flex-1 text-center md:text-right space-y-1 font-bold">
                    <span className="text-[10px] font-black text-purple-500 uppercase tracking-widest block">สาขาที่ส่ง (ผู้ขาย)</span>
                    <p className="text-lg font-black text-gray-900 dark:text-white flex items-center justify-center md:justify-end gap-2 uppercase">
                      {selectedOrder.assignedFromBranchName || "ปั๊มไฮโซ"}
                      <MapPin className="w-5 h-5 text-rose-500" />
                    </p>
                    </div>
                </div>

                {/* Oil Details */}
                <div className="space-y-3 font-bold">
                  <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest flex items-center gap-2 px-1">
                    <Droplet className="w-4 h-4 text-purple-500" />
                    รายการน้ำมันในธุรกรรม
                  </h3>
                  <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-3xl overflow-hidden shadow-sm">
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-gray-800/50">
                        <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                          <th className="px-6 py-4 text-left">ชนิดน้ำมัน</th>
                          <th className="px-6 py-4 text-right">จำนวนที่สั่ง</th>
                          <th className="px-6 py-4 text-right">ราคา/ลิตร</th>
                          <th className="px-6 py-4 text-right">รวมเป็นเงิน</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                    {selectedOrder.items.map((item, idx) => (
                          <tr key={idx}>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3 font-bold">
                                <div className="w-2 h-8 bg-purple-500 rounded-full"></div>
                                <span className="font-black text-gray-800 dark:text-gray-200">{item.oilType}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right text-gray-700 dark:text-gray-300">{(item.requestedQuantity || item.quantity).toLocaleString()} ลิตร</td>
                            <td className="px-6 py-4 text-right text-purple-600 dark:text-purple-400">฿{item.pricePerLiter.toFixed(2)}</td>
                            <td className="px-6 py-4 text-right font-black text-gray-900 dark:text-white">฿{item.totalAmount.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                              </div>
                            </div>

                {/* Logistics & Docs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-bold">
                  <div className="space-y-4">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                      <Truck className="w-4 h-4 text-purple-500" />
                      ข้อมูลการจัดส่ง
                    </h3>
                    <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 space-y-3">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500">เลขที่ขนส่งอ้างอิง:</span>
                        <span className="font-black text-gray-900 dark:text-white">{selectedOrder.transportNo || "-"}</span>
                          </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500">ผู้อนุมัติ:</span>
                        <span className="font-black text-gray-900 dark:text-white">{selectedOrder.approvedBy || "-"}</span>
                          </div>
                        </div>
                      </div>

                  <div className="space-y-4">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                      <FileText className="w-4 h-4 text-emerald-500" />
                      ดาวน์โหลดเอกสาร
                    </h3>
                    <div className="grid grid-cols-1 gap-2">
                      {selectedOrder.status !== "รออนุมัติ" && selectedOrder.status !== "ยกเลิก" ? (
                        <>
                          <button 
                            onClick={() => handleDownload("po", selectedOrder)}
                            className="flex items-center justify-between p-3 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-800/50 shadow-sm hover:bg-blue-100 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <FileCheck className="w-5 h-5 text-blue-600" />
                              <span className="text-xs font-black text-blue-700">ใบสั่งซื้อ (PO)</span>
                      </div>
                            <Download className="w-4 h-4 text-blue-400" />
                          </button>
                          <button 
                            onClick={() => handleDownload("dn", selectedOrder)}
                            className="flex items-center justify-between p-3 bg-purple-50/50 dark:bg-purple-900/10 rounded-2xl border border-purple-100 dark:border-purple-800/50 shadow-sm hover:bg-purple-100 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <Truck className="w-5 h-5 text-purple-600" />
                              <span className="text-xs font-black text-purple-700">ใบส่งของ (DN)</span>
                    </div>
                            <Download className="w-4 h-4 text-purple-400" />
                          </button>
                        </>
                      ) : (
                        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                          จะแสดงเอกสารเมื่ออนุมัติแล้ว
                  </div>
                      )}
                </div>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700 flex gap-3">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="flex-1 px-6 py-4 bg-white dark:bg-gray-800 text-gray-500 font-black rounded-2xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 transition-all active:scale-95 uppercase tracking-widest text-sm"
                >
                  ปิดหน้าต่าง
                </button>
                {selectedOrder.status === "รออนุมัติ" && (
                  <button
                    onClick={() => {
                      setShowDetailModal(false);
                      handleApprove(selectedOrder);
                    }}
                    className="flex-[2] px-6 py-4 bg-purple-600 text-white font-black rounded-2xl shadow-xl shadow-purple-600/30 hover:bg-purple-700 transition-all active:scale-95 uppercase tracking-widest text-sm flex items-center justify-center gap-2"
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

      {/* Assign Modal (Approval & Logistics) */}
      <AnimatePresence>
        {showAssignModal && selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-[85%] overflow-hidden flex flex-col max-h-[95vh]"
            >
              <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-blue-50 dark:bg-blue-900/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-600 rounded-xl shadow-lg">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-blue-800 dark:text-blue-400 uppercase tracking-tight">อนุมัติและกำหนดการจัดส่ง</h2>
                    <p className="text-xs text-blue-600 dark:text-blue-500 font-bold tracking-widest uppercase">Approve & Assign Shipping Logic</p>
                  </div>
                </div>
                <button onClick={() => setShowAssignModal(false)} className="p-2 hover:bg-white dark:hover:bg-gray-700 rounded-full transition-colors group">
                  <X className="w-5 h-5 text-gray-400 group-hover:rotate-90 transition-transform" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-8 bg-gray-50/30 dark:bg-gray-900/10">
                {/* Section 1: Supplying Branch & Order Summary */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-3xl p-6 shadow-sm space-y-6">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                          <Building2 className="w-4 h-4" />
                  </div>
                        <h4 className="text-sm font-black text-gray-800 dark:text-white uppercase tracking-widest">ข้อมูลต้นทางและกำหนดการ</h4>
                </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-bold">
                        <div className="space-y-2">
                          <label htmlFor="assignSupplyingBranch" className="text-[10px] font-black text-gray-400 uppercase tracking-widest">ปั๊มต้นทาง (ผู้จัดส่ง) *</label>
                  <select
                            id="assignSupplyingBranch"
                            value={supplyingBranchId}
                            onChange={(e) => {
                              const newBranchId = Number(e.target.value);
                              setSupplyingBranchId(newBranchId);
                              // Update all items to new branch and recalculate branchTotalAvailable
                              setDeliveryItems(prev => prev.map(item => ({
                                ...item,
                                assignedFromBranchId: newBranchId,
                                branchTotalAvailable: calculateBranchInventoryForBranch(newBranchId, item.oilType),
                                selectedTruckTripId: "",
                                transportNo: "",
                                sourceRefId: "",
                                sourceLabel: "",
                                sourceAvailableQty: undefined
                              })));
                            }}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-700 rounded-2xl outline-none focus:border-blue-500 text-sm font-black transition-all"
                          >
                            {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
                        <div className="space-y-2">
                          <label htmlFor="assignDeliveryDate" className="text-[10px] font-black text-gray-400 uppercase tracking-widest">วันที่จัดส่ง *</label>
                  <input
                            id="assignDeliveryDate"
                    type="date"
                    value={deliveryDate}
                            onChange={e => setDeliveryDate(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-700 rounded-2xl outline-none focus:border-blue-500 text-sm font-black transition-all"
                  />
                </div>
                        <div className="space-y-2">
                          <label htmlFor="assignNotes" className="text-[10px] font-black text-gray-400 uppercase tracking-widest">หมายเหตุ</label>
                          <input
                            id="assignNotes"
                            type="text"
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            placeholder="ระบุหมายเหตุ (ถ้ามี)"
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-700 rounded-2xl outline-none focus:border-blue-500 text-sm font-black transition-all"
                          />
                        </div>
                        </div>
                        </div>

                    {/* Inventory Summary for Supplying Branch */}
                    {branchInventory.length > 0 && (
                      <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-3xl p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                            <Droplet className="w-4 h-4" />
                        </div>
                          <p className="text-sm font-black text-gray-800 dark:text-white uppercase tracking-widest">น้ำมันที่มีพร้อมส่งในสาขานี้</p>
                        </div>
                        <div className="flex flex-wrap gap-4">
                          {branchInventory.map((item: any, idx: number) => (
                            <div key={idx} className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 rounded-2xl p-4 flex items-center gap-4 shadow-sm min-w-[200px]">
                              <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
                                <Droplet className="w-6 h-6" />
                        </div>
                          <div className="space-y-1">
                                <p className="text-xs font-black text-gray-800 dark:text-white uppercase">{item.oilType}</p>
                                <div className="flex flex-col gap-1 text-[9px] font-bold">
                                  {item.remaining > 0 && <span className="text-emerald-600">🚚 ค้างรถ: {item.remaining.toLocaleString()} ล.</span>}
                                  {item.transit > 0 && <span className="text-blue-600">🚛 กำลังส่ง: {item.transit.toLocaleString()} ล.</span>}
                                  {item.sucked > 0 && <span className="text-orange-600">💉 ดูดคืน: {item.sucked.toLocaleString()} ล.</span>}
                                </div>
                              </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                  {/* Order Request Summary (From Buyer) */}
                  <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[2.5rem] p-8 text-white shadow-xl shadow-indigo-500/20 flex flex-col justify-between">
                    <div className="space-y-6">
                      <div className="pb-6 border-b border-white/10 space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">สรุปคำร้องขอ (ผู้ซื้อ)</p>
                        <h3 className="text-2xl font-black">{selectedOrder.fromBranchName}</h3>
                </div>

                      <div className="space-y-4">
                        {selectedOrder.items.map((it, idx) => (
                          <div key={idx} className="flex justify-between items-center bg-white/5 p-3 rounded-2xl border border-white/10">
                            <span className="text-sm font-bold opacity-80">{it.oilType}</span>
                            <span className="text-lg font-black">{(it.requestedQuantity || it.quantity).toLocaleString()} <span className="text-[10px] font-normal opacity-60">ลิตร</span></span>
                          </div>
                        ))}
                      </div>
                </div>

                    <div className="mt-8 pt-6 border-t border-white/10 flex justify-between items-end">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-60 text-indigo-200">มูลค่ารวม (โดยประมาณ)</p>
                        <p className="text-3xl font-black tracking-tighter">฿{selectedOrder.totalAmount.toLocaleString()}</p>
                      </div>
                      <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                        <ShoppingCart className="w-6 h-6 opacity-40" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 2: Assign Logistics per Item */}
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
                      className="text-xs font-black text-blue-600 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl border border-blue-100 transition-all flex items-center gap-2 shadow-sm active:scale-95"
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
                        className={`p-6 rounded-[2rem] border-2 relative group transition-all shadow-sm min-h-[120px] ${
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
                                  handleUpdateDeliveryItemMultiple(index, { 
                                    oilType: newType, 
                                    pricePerLiter: oilPrices[newType] || 0,
                                    selectedTruckTripId: "",
                                    sourceRefId: "",
                                    sourceLabel: "",
                                    sourceAvailableQty: undefined
                                  });
                                }}
                                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-2xl focus:border-blue-500 text-sm font-black outline-none"
                              >
                                {oilTypes.map(t => <option key={t} value={t}>{t}</option>)}
                              </select>
                            )}
                          </div>

                          <div className="md:col-span-3 space-y-2">
                            <label htmlFor={`sourceRefId-${index}`} className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">แหล่งที่มาน้ำมัน *</label>
                            <select
                              id={`sourceRefId-${index}`}
                              value={item.sourceRefId || ""}
                              onChange={e => {
                                const refId = e.target.value;
                                if (refId === "depot") {
                                  handleUpdateDeliveryItemMultiple(index, {
                                    sourceRefId: "depot",
                                    sourceLabel: "จากคลัง (ทั่วไป)",
                                    deliverySource: "truck",
                                    selectedTruckTripId: "",
                                    transportNo: "",
                                    sourceAvailableQty: undefined
                                  });
                                } else {
                                  const sources = getAvailableSources(supplyingBranchId, item.oilType);
                                  const source = sources.find((s: any) => s.id === refId);
                                  if (source) {
                                    handleUpdateDeliveryItemMultiple(index, {
                                      sourceRefId: refId,
                                      sourceLabel: source.label,
                                      deliverySource: source.sourceType === "remaining" ? "truck" : source.sourceType === "sucked" ? "suction" : "truck",
                                      selectedTruckTripId: refId,
                                      transportNo: source.orderNo || "",
                                      sourceAvailableQty: source.quantity,
                                      quantityToDeliver: item.quantityToDeliver > source.quantity ? source.quantity : item.quantityToDeliver
                                    });
                                  }
                                }
                              }}
                              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-700 rounded-2xl focus:border-blue-500 text-[10px] font-black uppercase outline-none"
                            >
                              <option value="">-- เลือกแหล่งที่มา --</option>
                              <option value="depot">จากคลัง (ทั่วไป)</option>
                              {getAvailableSources(supplyingBranchId, item.oilType).map((s: any) => (
                                <option key={s.id} value={s.id}>{s.label}</option>
                                  ))}
                                </select>
                              </div>

                          <div className="md:col-span-2 space-y-2">
                            <label htmlFor={`pricePerLiter-${index}`} className="text-[10px] font-black text-purple-600 uppercase tracking-widest block ml-1">ราคาขาย/ลิตร (บาท)</label>
                            <div className="relative">
                                  <input
                                id={`pricePerLiter-${index}`}
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

                          <div className="md:col-span-2 flex flex-col">
                            {/* Info messages - shown above input to avoid pushing layout */}
                            <div className="mb-1 space-y-0.5 min-h-[20px]">
                              {item.branchTotalAvailable !== undefined && (
                                <div className="flex items-center gap-2 px-1">
                                  <Droplet className="w-3 h-3 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                                  <p className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-tighter">
                                    มีในปั๊ม: {item.branchTotalAvailable.toLocaleString()} ลิตร
                                  </p>
                                </div>
                              )}
                              {item.branchTotalAvailable !== undefined && item.quantityToDeliver > item.branchTotalAvailable && item.branchTotalAvailable > 0 && (
                                <div className="flex items-center gap-2 px-1">
                                  <X className="w-3 h-3 text-red-600 dark:text-red-400 flex-shrink-0" />
                                  <p className="text-[9px] font-black text-red-600 dark:text-red-400 uppercase tracking-tighter">
                                    มีน้ำมันไม่พอ (ต้องการ {item.quantityToDeliver.toLocaleString()} ลิตร)
                                  </p>
                                </div>
                              )}
                              {item.sourceAvailableQty !== undefined && (
                                <div className="flex items-center gap-2 px-1">
                                  <Truck className="w-3 h-3 text-blue-500 dark:text-blue-400 flex-shrink-0" />
                                  <p className="text-[9px] font-black text-blue-500 dark:text-blue-400 uppercase tracking-tighter">
                                    แหล่งที่มา: {item.sourceAvailableQty.toLocaleString()} ลิตร
                                  </p>
                                </div>
                              )}
                            </div>
                            <label htmlFor={`quantityToDeliver-${index}`} className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1 mb-2">จำนวนส่งจริง (ลิตร)</label>
                            <div className="relative">
                              {/* Check if should be locked */}
                              {(() => {
                                const hasNoOil = item.branchTotalAvailable !== undefined && item.branchTotalAvailable === 0;
                                const exceedsAvailable = item.branchTotalAvailable !== undefined && item.quantityToDeliver > item.branchTotalAvailable && item.branchTotalAvailable > 0;
                                const isLocked = hasNoOil || exceedsAvailable;
                                const displayValue = hasNoOil 
                                  ? "ไม่มีน้ำมันในปั๊ม" 
                                  : exceedsAvailable && item.branchTotalAvailable !== undefined
                                    ? `เกินจำนวน (มี ${item.branchTotalAvailable.toLocaleString()} ลิตร)` 
                                    : "";
                                
                                if (isLocked) {
                                  // Show locked div with message
                                  return (
                                    <div className="w-full px-4 py-3 bg-red-50/60 dark:bg-red-900/20 border-2 border-red-400 dark:border-red-700/50 rounded-2xl shadow-inner">
                                      <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2 flex-1 min-w-0">
                                          <Lock className="w-4 h-4 text-red-500 dark:text-red-400 flex-shrink-0" />
                                          <span className="text-[11px] text-red-600 dark:text-red-400 font-bold truncate">
                                            {displayValue}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                }
                                
                                // Show normal input
                                return (
                                  <>
                                <input
                                      id={`quantityToDeliver-${index}`}
                                  type="number"
                                      value={item.quantityToDeliver || ""}
                                      onChange={e => handleUpdateDeliveryItem(index, "quantityToDeliver", Number(e.target.value))}
                                      className={`w-full px-4 py-3 pr-12 bg-white dark:bg-gray-800 border-2 rounded-2xl text-sm font-black text-right outline-none shadow-inner transition-all ${
                                        item.branchTotalAvailable !== undefined && item.quantityToDeliver > item.branchTotalAvailable
                                          ? "border-red-500 focus:border-red-600 text-red-600"
                                          : "border-blue-100 dark:border-blue-900/30 focus:border-blue-500 text-blue-600"
                                      }`}
                                      placeholder="0"
                                    />
                                    {/* Qty Label */}
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[9px] text-blue-400 dark:text-blue-500 font-black uppercase pointer-events-none tracking-tighter">
                                      Qty (L)
                              </div>
                                  </>
                                );
                              })()}
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

                {/* Section 3: Final Grand Total Card */}
                <div className="p-10 bg-gradient-to-br from-blue-700 to-indigo-800 rounded-[3rem] text-white shadow-2xl shadow-blue-600/20 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400/10 rounded-full -ml-32 -mb-32 blur-3xl"></div>
                  
                  <div className="flex flex-col md:flex-row justify-between items-center gap-10 relative z-10">
                    <div className="flex gap-12 text-center md:text-left">
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
                    
                    <div className="text-center md:text-right space-y-2">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 block">มูลค่ารวมที่อนุมัติจัดส่ง</span>
                      <p className="text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-blue-200">
                        ฿{numberFormatter.format(deliveryItems.reduce((sum, item) => sum + item.totalAmount, 0))}
                      </p>
                      <p className="text-[10px] opacity-40 font-bold uppercase tracking-[0.1em]">* อนุมัติโดยสำนักงานกลาง (พี่นิด)</p>
                          </div>
                  </div>
                </div>
              </div>

              <div className="p-8 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex gap-4">
                          <button
                  onClick={() => setShowAssignModal(false)}
                  className="flex-1 px-8 py-4 text-gray-400 hover:text-gray-600 font-black uppercase tracking-widest text-xs transition-all active:scale-95"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleSaveAssignment}
                  className="flex-[2] px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-3xl shadow-xl shadow-blue-600/30 transition-all active:scale-95 uppercase tracking-[0.2em] text-sm flex items-center justify-center gap-3"
                >
                  <CheckCircle className="w-6 h-6" />
                  ยืนยันการอนุมัติจัดส่ง
                          </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* New Order Modal (Integrated from previous Turn) */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-800 rounded-[2rem] shadow-2xl w-full max-w-[85%] overflow-hidden flex flex-col max-h-[95vh]"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between relative bg-purple-50 dark:bg-purple-900/20">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center shadow-lg text-white">
                    <Plus className="w-6 h-6" />
                            </div>
                              <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white uppercase tracking-tight">สร้างใบสั่งซื้อใหม่ - ภายใน</h2>
                    <p className="text-xs text-purple-600 dark:text-purple-400 font-bold">สั่งน้ำมันจากปั๊มต้นทางโอนไปยังสาขาต่างๆ</p>
                  </div>
                </div>
                <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-white dark:hover:bg-gray-700 rounded-full text-gray-400 group transition-colors">
                  <X className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-8">
                {/* Reference Numbers Section */}
                <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-6 shadow-sm space-y-4">
                  <p className="text-sm font-bold text-gray-800 dark:text-white mb-2 uppercase tracking-widest flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-purple-500" />
                    ปั๊มต้นทาง (ผู้จัดส่ง) & เลขที่อ้างอิง
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-bold">
                    <div className="space-y-2">
                      <label htmlFor="supplyingBranch" className="text-[10px] font-black text-gray-400 uppercase tracking-widest">ปั๊มต้นทาง *</label>
                                <select
                        id="supplyingBranch"
                        value={supplyingBranchId}
                        onChange={(e) => {
                          setSupplyingBranchId(Number(e.target.value));
                          setNewOrderItems([]); 
                        }}
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-700 rounded-xl outline-none focus:border-purple-500 text-sm font-black"
                      >
                        {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                </select>
                              </div>
                    <div className="space-y-2">
                      <label htmlFor="approveNoInput" className="text-[10px] font-black text-gray-400 uppercase tracking-widest">ใบอนุมัติขายเลขที่</label>
                                  <input
                        id="approveNoInput"
                                    type="text"
                        placeholder="เช่น 1234567890"
                        value={approveNo}
                        onChange={e => setApproveNo(e.target.value)}
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-700 rounded-xl outline-none focus:border-purple-500 text-sm font-black"
                                  />
                                </div>
                    <div className="space-y-2">
                      <label htmlFor="refOrderNo" className="text-[10px] font-black text-gray-400 uppercase tracking-widest">ใบสั่งซื้อเลขที่ (อ้างอิง)</label>
                      <input
                        id="refOrderNo"
                        type="text"
                        placeholder="เช่น SO-20241215-001"
                        value={referenceOrderNo}
                        onChange={e => setReferenceOrderNo(e.target.value)}
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-700 rounded-xl outline-none focus:border-purple-500 text-sm font-black"
                      />
                    </div>
                  </div>

                  {/* Available Inventory Summary for Supplying Branch */}
                  {branchInventory.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-dashed border-gray-100 dark:border-gray-700">
                      <p className="text-[10px] font-black text-purple-600 uppercase tracking-widest mb-3">น้ำมันที่มีพร้อมส่งในสาขานี้</p>
                      <div className="flex flex-wrap gap-3">
                        {branchInventory.map((item: any, idx: number) => (
                          <div key={idx} className="bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800 rounded-2xl p-3 flex items-center gap-4 shadow-sm">
                            <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center text-white shadow-md shadow-purple-600/20">
                              <Droplet className="w-5 h-5" />
                            </div>
                            <div className="space-y-0.5">
                              <p className="text-xs font-black text-gray-800 dark:text-white uppercase">{item.oilType}</p>
                              <div className="flex gap-3 text-[9px] font-bold">
                                {item.remaining > 0 && <span className="text-emerald-600">🚚 ค้างรถ: {item.remaining.toLocaleString()} ล.</span>}
                                {item.transit > 0 && <span className="text-blue-600">🚛 กำลังส่ง: {item.transit.toLocaleString()} ล.</span>}
                                {item.sucked > 0 && <span className="text-orange-600">💉 ดูดคืน: {item.sucked.toLocaleString()} ล.</span>}
                              </div>
                        </div>
                      </div>
                    ))}
                      </div>
                      </div>
                    )}
                  </div>

                {/* Add Item Form Bar */}
                <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-6 shadow-sm">
                  <h4 className="text-sm font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2 uppercase tracking-widest">
                    <PlusCircle className="w-4 h-4 text-purple-500" /> เพิ่มรายการสั่งซื้อ
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end font-bold">
                    <div className="space-y-2">
                      <label htmlFor="entryBranch" className="text-[10px] font-black text-gray-400 uppercase tracking-widest">สาขาปลายทาง *</label>
                      <select
                        id="entryBranch"
                        value={entryBranchId}
                        onChange={e => setEntryBranchId(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-xl focus:border-purple-500 text-sm font-black"
                      >
                        <option value={0}>เลือกสาขา</option>
                        {branches.filter(b => b.id !== supplyingBranchId).map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                      </select>
                      </div>
                    <div className="space-y-2">
                      <label htmlFor="entryOilType" className="text-[10px] font-black text-gray-400 uppercase tracking-widest">ประเภทน้ำมัน *</label>
                      <select
                        id="entryOilType"
                        value={entryOilType}
                        onChange={e => setEntryOilType(e.target.value as OilType)}
                        className="w-full px-3 py-2 bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-xl focus:border-purple-500 text-sm font-black"
                      >
                        {Object.keys(currentOilPrices).map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="entryPrice" className="text-[10px] font-black uppercase tracking-widest text-purple-600">ราคา/ลิตร (บาท)</label>
                      <div className="relative">
                                <input
                          id="entryPrice"
                                  type="number"
                          step="0.01"
                          value={entryPrice || ""}
                          onChange={e => setEntryPrice(Number(e.target.value))}
                          className="w-full px-3 py-2 bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-100 dark:border-purple-800 rounded-xl focus:border-purple-500 text-sm font-black text-purple-600 text-right"
                          placeholder="0.00"
                        />
                        <div className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-purple-400 font-black uppercase pointer-events-none tracking-tighter">Price</div>
                              </div>
                            </div>
                    <div className="space-y-2">
                      <label htmlFor="entryQty" className="text-[10px] font-black text-gray-400 uppercase tracking-widest">จำนวน (ลิตร) *</label>
                      <input
                        id="entryQty"
                        type="number"
                        value={entryQuantity || ""}
                        onChange={e => setEntryQuantity(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-xl focus:border-purple-500 text-sm font-black text-right"
                        placeholder="ระบุจำนวน"
                      />
                              </div>
                    <div className="space-y-2">
                      <label htmlFor="entrySource" className="text-[10px] font-black text-gray-400 uppercase tracking-widest">แหล่งที่มา *</label>
                      <select
                        id="entrySource"
                        value={entrySourceId}
                        onChange={e => setEntrySourceId(e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-xl focus:border-purple-500 text-[10px] font-black uppercase"
                      >
                        <option value="">-- แหล่งที่มา --</option>
                        <option value="depot">จากคลัง (ทั่วไป)</option>
                        {availableSources.map((s: any) => <option key={s.id} value={s.id}>{s.label}</option>)}
                      </select>
                              </div>
                          <button
                      onClick={handleAddItem}
                      className="h-[42px] px-6 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-all font-black shadow-lg shadow-purple-600/20 flex items-center justify-center gap-2 active:scale-95"
                    >
                      <Plus className="w-4 h-4" /> เพิ่มรายการ
                          </button>
                            </div>
                  <p className="mt-2 text-[10px] text-gray-400 font-bold italic tracking-tight">* ราคาเริ่มต้นอ้างอิงจากราคานำเข้าราคาล่าสุดในสาขาต้นทาง</p>
                          </div>

                {/* Items List Table */}
                <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-3xl overflow-hidden shadow-sm">
                  <table className="w-full font-bold">
                    <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-700">
                      <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        <th className="text-left py-4 px-6">สาขาปลายทาง</th>
                        <th className="text-left py-4 px-6">ประเภทน้ำมัน</th>
                        <th className="text-right py-4 px-6 text-purple-600">ราคา/ลิตร</th>
                        <th className="text-right py-4 px-6">จำนวน (ลิตร)</th>
                        <th className="text-right py-4 px-6">ยอดรวม</th>
                        <th className="text-left py-4 px-6">แหล่งที่มา</th>
                        <th className="text-center py-4 px-6">จัดการ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                      {newOrderItems.length > 0 ? newOrderItems.map((item, idx) => (
                        <tr key={idx} className="hover:bg-purple-50/20 dark:hover:bg-purple-900/5 transition-colors">
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-purple-500" />
                              <span className="font-black text-gray-800 dark:text-white uppercase text-xs">{item.branchName}</span>
                      </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              <Droplet className="w-4 h-4 text-purple-500" />
                              <span className="text-gray-800 dark:text-white font-black text-xs">{item.oilType}</span>
                  </div>
                          </td>
                          <td className="py-4 px-6 text-right font-black text-purple-600">
                            {priceFormatter.format(item.pricePerLiter)}
                          </td>
                          <td className="py-4 px-6 text-right font-black text-gray-900 dark:text-white">
                            {item.quantity.toLocaleString()}
                          </td>
                          <td className="py-4 px-6 text-right font-black text-indigo-600">
                            {currencyFormatter.format(item.pricePerLiter * item.quantity)}
                          </td>
                          <td className="py-4 px-6">
                            <span className="text-[9px] font-black text-gray-400 bg-gray-50 px-2 py-1 rounded border uppercase tracking-tighter shadow-sm">{item.sourceLabel || "คลัง ปตท."}</span>
                          </td>
                          <td className="py-4 px-6 text-center">
                          <button
                              onClick={() => setNewOrderItems(newOrderItems.filter((_, i) => i !== idx))}
                              className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl text-red-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={7} className="py-24 text-center">
                            <div className="flex flex-col items-center gap-4 text-gray-300">
                              <div className="p-6 bg-gray-50 dark:bg-gray-900 rounded-full">
                                <ShoppingCart className="w-16 h-16 opacity-20" />
                        </div>
                              <div className="text-center">
                                <p className="text-lg font-black text-gray-400 uppercase tracking-widest">ยังไม่มีรายการสั่งซื้อ</p>
                                <p className="text-xs text-gray-400 font-bold">กรุณาเพิ่มรายการสั่งซื้อจากฟอร์มด้านบน</p>
                      </div>
                      </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                    {newOrderItems.length > 0 && (
                      <tfoot className="bg-purple-50/30 dark:bg-purple-900/10 font-black">
                        <tr className="text-gray-900 dark:text-white uppercase tracking-tighter">
                          <td colSpan={3} className="py-4 px-6 text-right text-[10px] text-purple-600 font-black">รวมทั้งสิ้น</td>
                          <td className="py-4 px-6 text-right text-lg">
                            {newOrderItems.reduce((sum, i) => sum + i.quantity, 0).toLocaleString()} ลิตร
                          </td>
                          <td className="py-4 px-6 text-right text-2xl text-purple-600">
                            {currencyFormatter.format(newOrderItems.reduce((sum, i) => sum + (i.pricePerLiter * i.quantity), 0))}
                          </td>
                          <td colSpan={2}></td>
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>

                {/* Footer Attachment Info */}
                <div className="flex items-center gap-3 text-xs font-black text-purple-600 bg-purple-50/50 dark:bg-purple-900/20 p-5 rounded-2xl border-2 border-dashed border-purple-200 dark:border-purple-800 uppercase tracking-widest">
                  <AttachmentIcon className="w-5 h-5" />
                  หลักฐานใบเสนอราคา (0 ไฟล์)
                  <div className="ml-auto flex gap-2">
                    <span className="px-3 py-1 bg-white dark:bg-gray-800 rounded-full border border-purple-100 shadow-sm cursor-pointer hover:bg-purple-50">เลือกไฟล์</span>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-8 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-4 bg-gray-50/50 dark:bg-gray-900/50">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-8 py-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl font-black text-gray-500 hover:bg-gray-50 transition-all uppercase tracking-widest text-sm"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleSaveOrder}
                  disabled={newOrderItems.length === 0}
                  className="px-12 py-4 bg-gradient-to-br from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white rounded-2xl font-black shadow-xl shadow-purple-600/30 flex items-center gap-3 transform active:scale-95 transition-all disabled:opacity-50 disabled:grayscale uppercase tracking-widest text-sm"
                >
                  <Save className="w-5 h-5" />
                  บันทึกใบสั่งซื้อภายใน
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function getStatusText(status: InternalOilOrder["status"]): string {
  return status;
}
