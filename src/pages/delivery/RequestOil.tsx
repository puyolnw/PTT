import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart,
  Plus,
  Search,
  X,
  Building2,
  FileText,
  Eye,
  Droplet,
  Calendar,
  CheckCircle2,
  Download,
  FileCheck,
  Truck,
  Navigation,
  MapPin,
  Clock,
  User,
  Fuel,
  Check,
  CheckCircle
} from "lucide-react";
import { useGasStation } from "@/contexts/GasStationContext";
import { useBranch } from "@/contexts/BranchContext";
import { useAuth } from "@/contexts/AuthContext";
import type { InternalOilOrder, OilType, DriverJob } from "@/types/gasStation";
import StatusTag, { getStatusVariant } from "@/components/StatusTag";
import GasStationWrap from "./gs/_GasStationWrap";

// --- Helper Components from TransportTracking ---
const StepIcon = ({ name, className }: { name: string, className?: string }) => {
    switch (name) {
        case "truck": return <Truck className={className} />;
        case "map-pin": return <MapPin className={className} />;
        case "droplet": return <Droplet className={className} />;
        case "download": return <Download className={className} />;
        case "check": return <Check className={className} />;
        case "check-circle": return <CheckCircle className={className} />;
        case "fuel": return <Fuel className={className} />;
        default: return <Check className={className} />;
    }
};

const JobTimeline = ({ job }: { job: DriverJob }) => {
    const timelineItems = useMemo(() => {
        if (!job) return [];
        interface TimelineItem {
            id: string;
            title: string;
            timestamp: string;
            dateTime?: string;
            status: string;
            icon: string;
            sequence?: number;
        }
        const items: TimelineItem[] = [];
        
        const isJobFinished = job.status === "ส่งเสร็จ";
        
        const formatTime = (isoString?: string, fallbackText: string = "ยังไม่ถึง") => {
            if (isoString) {
                return new Date(isoString).toLocaleTimeString("th-TH", { hour: '2-digit', minute: '2-digit' }) + " น.";
            }
            if (isJobFinished) return "เสร็จสิ้น";
            return fallbackText;
        };

        // 1. Job Received
        items.push({
            id: "step-1-received",
            title: "ได้รับงาน",
            timestamp: formatTime(job.createdAt, "08:00 น."),
            dateTime: job.createdAt,
            status: "completed",
            icon: "check"
        });

        // 2. Start Trip
        const isStarted = !!job.startTrip || isJobFinished;
        items.push({
            id: "step-2-start",
            title: `ออกจากปั๊มต้นทาง (${job.sourceBranchName})`,
            timestamp: isStarted ? formatTime(job.startTrip?.startedAt) : "ยังไม่เริ่ม",
            dateTime: job.startTrip?.startedAt,
            status: isStarted ? "completed" : "active",
            icon: "truck"
        });

        // 3. Arrive Depot
        const isArrivedDepot = !!job.warehouseConfirmation || isJobFinished;
        items.push({
            id: "step-3-warehouse",
            title: `ถึงคลังน้ำมัน`, 
            timestamp: isArrivedDepot ? formatTime(job.warehouseConfirmation?.confirmedAt) : "รอดำเนินการ",
            dateTime: job.warehouseConfirmation?.confirmedAt,
            status: isArrivedDepot ? "completed" : (isStarted ? "active" : "pending"),
            icon: "map-pin"
        });

        // 4. Pickup Oil
        const isPickedUp = !!job.pickupConfirmation || isJobFinished;
        items.push({
            id: "step-4-pickup",
            title: "รับน้ำมัน",
            timestamp: isPickedUp ? formatTime(job.pickupConfirmation?.confirmedAt) : "รอดำเนินการ",
            dateTime: job.pickupConfirmation?.confirmedAt,
            status: isPickedUp ? "completed" : (isArrivedDepot ? "active" : "pending"),
            icon: "droplet"
        });

        // 5. Destinations
        const branches = [...job.destinationBranches];
        if (job.routeOrder && job.routeOrder.length > 0) {
            branches.sort((a, b) => {
                const indexA = job.routeOrder!.indexOf(a.branchId);
                const indexB = job.routeOrder!.indexOf(b.branchId);
                return indexA - indexB;
            });
        }

        let firstNextPendingAdded = false;
        branches.forEach((branch) => {
            const isDelivered = branch.status === "ส่งแล้ว" || isJobFinished;
            const isArrivedBranch = !!branch.arrivalConfirmation || isDelivered;

            // Arrival
            let arrivalStatus = "pending";
             if (isArrivedBranch) arrivalStatus = "completed";
             else if (isPickedUp && !firstNextPendingAdded) { arrivalStatus = "active"; firstNextPendingAdded = true; }

            items.push({
                id: `step-branch-${branch.branchId}-arrive`,
                title: `ถึงปั๊ม (${branch.branchName})`,
                timestamp: arrivalStatus === "completed" ? formatTime(branch.arrivalConfirmation?.confirmedAt || (isDelivered ? branch.deliveryConfirmation?.confirmedAt : undefined)) : (arrivalStatus === "active" ? "กำลังเดินทาง" : "รอดำเนินการ"),
                dateTime: branch.arrivalConfirmation?.confirmedAt,
                status: arrivalStatus,
                icon: "map-pin",
                sequence: items.length
            });

             // Unload
            let unloadStatus = "pending";
            if (isDelivered) unloadStatus = "completed";
            else if (arrivalStatus === "completed" && !firstNextPendingAdded) { unloadStatus = "active"; firstNextPendingAdded = true; }

            items.push({
                id: `step-branch-${branch.branchId}-unload`,
                title: `ลงน้ำมัน (${branch.branchName})`,
                timestamp: isDelivered ? formatTime(branch.deliveryConfirmation?.confirmedAt) : "รอดำเนินการ",
                dateTime: branch.deliveryConfirmation?.confirmedAt,
                status: unloadStatus,
                icon: "download",
                sequence: items.length
            });
        });

        // 6. Finish
        const isFinished = isJobFinished && (!!job.depotArrival || !!job.endOdometer);
        const allDelivered = job.destinationBranches.every(b => b.status === "ส่งแล้ว" || isJobFinished);
        items.push({
            id: "step-end",
            title: "กลับถึงปั๊ม (จบงาน)",
            timestamp: isFinished ? formatTime(job.depotArrival?.arrivedAt) : "รอดำเนินการ",
            status: isFinished ? "completed" : (allDelivered ? "active" : "pending"),
            icon: "check-circle",
            sequence: items.length
        });

        return items;
    }, [job]);

    return (
        <div className="relative pl-2 space-y-4">
            {timelineItems.map((item, index) => {
                const isLast = index === timelineItems.length - 1;
                return (
                    <div key={item.id} className="relative flex gap-3">
                        {!isLast && (
                            <div className="absolute left-[9px] top-6 bottom-[-20px] w-0.5 border-l border-dashed border-gray-200 dark:border-gray-700" />
                        )}
                        <div className="relative z-10 shrink-0">
                             <div className={`w-5 h-5 rounded-full flex items-center justify-center shadow-sm ${
                                item.status === "completed" ? "bg-green-500 text-white" : 
                                item.status === "active" ? "bg-blue-500 text-white animate-pulse" : 
                                "bg-gray-100 text-gray-400 dark:bg-gray-700"
                            }`}>
                                <StepIcon name={item.icon} className="w-3 h-3" />
                            </div>
                        </div>
                        <div className={`${item.status === "active" ? "pt-0 -mt-0.5" : "pt-0.5"}`}>
                            <h4 className={`font-bold text-xs ${
                                item.status === "active" ? "text-blue-600 dark:text-blue-400" :
                                item.status === "completed" ? "text-gray-900 dark:text-white" :
                                "text-gray-400 dark:text-gray-500"
                            }`}>
                                {item.title}
                            </h4>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400">
                                {item.timestamp}
                            </p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

const oilTypes: OilType[] = [
  "Premium Diesel",
  "Diesel",
  "Premium Gasohol 95",
  "Gasohol 95",
  "Gasohol 91",
  "E20",
  "E85"
];

function RequestOilContent() {
  const { 
    branches, 
    internalOrders, 
    createInternalOrder, 
    getNextRunningNumber,
    getDriverJobByTransportNo,
  } = useGasStation();
  const { selectedBranches } = useBranch();
  const selectedBranchIds = useMemo(() => selectedBranches.map(id => Number(id)), [selectedBranches]);
  const { user } = useAuth();

  const dateFormatter = new Intl.DateTimeFormat("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedOrderDetail, setSelectedOrderDetail] = useState<InternalOilOrder | null>(null);

  // ฟังก์ชันสำหรับดาวน์โหลดเอกสาร (จำลองการสร้าง PDF ด้วยการพิมพ์ HTML)
  const handleDownload = (type: "po" | "dn", order: InternalOilOrder) => {
    const isPO = type === "po";
    const title = isPO ? "ใบสั่งซื้อน้ำมันภายใน (Internal PO)" : "ใบส่งของน้ำมันภายใน (Internal DN)";
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${title} - ${order.orderNo}</title>
        <meta charset="utf-8">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;700&display=swap');
          body { font-family: 'Sarabun', sans-serif; padding: 40px; color: #333; line-height: 1.6; }
          .header { display: flex; justify-content: space-between; border-bottom: 2px solid #3b82f6; padding-bottom: 20px; margin-bottom: 30px; }
          .logo { font-size: 24px; font-bold: true; color: #1e40af; }
          .title { font-size: 20px; font-weight: bold; text-align: center; margin-bottom: 30px; text-transform: uppercase; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
          .info-box { border: 1px solid #e5e7eb; padding: 15px; rounded: 8px; }
          .info-label { font-size: 12px; color: #6b7280; font-weight: bold; margin-bottom: 5px; }
          .info-value { font-size: 14px; font-weight: bold; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          th { background-color: #f3f4f6; text-align: left; padding: 12px; border-bottom: 2px solid #e5e7eb; font-size: 14px; }
          td { padding: 12px; border-bottom: 1px solid #e5e7eb; font-size: 14px; }
          .total-row { font-weight: bold; background-color: #f9fafb; }
          .footer { margin-top: 50px; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; text-align: center; }
          .signature-line { border-top: 1px solid #333; margin-top: 60px; padding-top: 10px; font-size: 12px; }
          @media print { .no-print { display: none; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">PTT - ${isPO ? 'Purchase Order' : 'Delivery Note'}</div>
          <div style="text-align: right">
            <div style="font-weight: bold; font-size: 18px;">${order.orderNo}</div>
            <div style="font-size: 12px; color: #666;">วันที่: ${dateFormatter.format(new Date(order.orderDate))}</div>
          </div>
        </div>

        <div class="title">${title}</div>

        <div class="info-grid">
          <div class="info-box">
            <div class="info-label">${isPO ? 'ผู้สั่งซื้อ / ปลายทาง' : 'ผู้รับสินค้า / ปลายทาง'}</div>
            <div class="info-value">${order.fromBranchName}</div>
            <div class="info-label" style="margin-top: 10px;">ผู้ทำรายการ</div>
            <div class="info-value">${order.requestedBy}</div>
          </div>
          <div class="info-box">
            <div class="info-label">${isPO ? 'ผู้จำหน่าย / ต้นทาง' : 'ผู้ส่งสินค้า / ต้นทาง'}</div>
            <div class="info-value">${order.assignedFromBranchName || "ปั๊มไฮโซ"}</div>
            <div class="info-label" style="margin-top: 10px;">เลขที่ขนส่ง / วันที่ส่ง</div>
            <div class="info-value">${order.transportNo || '-'} / ${order.deliveryDate ? dateFormatter.format(new Date(order.deliveryDate)) : '-'}</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 50px;">ลำดับ</th>
              <th>รายการน้ำมัน</th>
              <th style="text-align: right;">จำนวน (ลิตร)</th>
              <th style="text-align: right;">ราคา/ลิตร</th>
              <th style="text-align: right;">จำนวนเงิน (บาท)</th>
            </tr>
          </thead>
          <tbody>
            ${order.items.map((item, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>${item.oilType}</td>
                <td style="text-align: right;">${item.quantity.toLocaleString()}</td>
                <td style="text-align: right;">${item.pricePerLiter.toFixed(2)}</td>
                <td style="text-align: right;">${item.totalAmount.toLocaleString()}</td>
              </tr>
            `).join('')}
            <tr class="total-row">
              <td colspan="2" style="text-align: right;">รวมทั้งสิ้น</td>
              <td style="text-align: right;">${order.items.reduce((sum, i) => sum + i.quantity, 0).toLocaleString()}</td>
              <td></td>
              <td style="text-align: right;">${order.totalAmount.toLocaleString()}</td>
            </tr>
          </tbody>
        </table>

        <div class="info-box" style="margin-bottom: 40px;">
          <div class="info-label">หมายเหตุ</div>
          <div class="info-value">${order.notes || '-'}</div>
        </div>

        <div class="footer">
          <div>
            <div class="signature-line">ผู้สั่งซื้อ / ผู้รับสินค้า</div>
            <div style="margin-top: 5px;">(......................................................)</div>
          </div>
          <div>
            <div class="signature-line">ผู้อนุมัติ / ผู้ส่งสินค้า</div>
            <div style="margin-top: 5px;">(......................................................)</div>
          </div>
          <div>
            <div class="signature-line">เจ้าหน้าที่คลังน้ำมัน</div>
            <div style="margin-top: 5px;">(......................................................)</div>
          </div>
        </div>

        <script>
          window.onload = function() {
            window.print();
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
  
  // Modal branch selection
  const modalBranches = useMemo(() => {
    const filtered = branches.filter(b => {
      if (b.id === 1) return false; // ไม่รวมปั๊มไฮโซในการสั่งซื้อ
      if (selectedBranchIds.length > 0) {
        return selectedBranchIds.includes(b.id);
      }
      return true;
    });
    return filtered;
  }, [branches, selectedBranchIds]);

  // Form State
  const [selectedBranchId, setSelectedBranchId] = useState<number>(0);

  // Initialize selectedBranchId when modal opens or filter changes
  useEffect(() => {
    if (showCreateModal && modalBranches.length > 0) {
      if (!selectedBranchId || !modalBranches.find(b => b.id === selectedBranchId)) {
        setSelectedBranchId(modalBranches[0].id);
      }
    }
  }, [showCreateModal, modalBranches, selectedBranchId]);

  const [requestedDate, setRequestedDate] = useState<string>("");
  const [items, setItems] = useState<Array<{ oilType: OilType; quantity: number }>>([
    { oilType: "Diesel", quantity: 0 }
  ]);
  const [notes, setNotes] = useState("");

  const filteredOrders = useMemo(() => {
    return internalOrders.filter(order => {
      const matchesSearch = order.orderNo.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           order.fromBranchName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesBranch = selectedBranchIds.length === 0 || selectedBranchIds.includes(order.fromBranchId);
      return matchesSearch && matchesBranch;
    });
  }, [internalOrders, searchTerm, selectedBranchIds]);

  const handleAddProduct = () => {
    setItems([...items, { oilType: "Diesel", quantity: 0 }]);
  };

  const handleRemoveProduct = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleUpdateProduct = (index: number, field: keyof typeof items[0], value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleSubmit = () => {
    if (!requestedDate) {
      alert("กรุณาระบุวันที่ต้องการรับน้ำมัน");
      return;
    }
    if (items.some(i => i.quantity <= 0)) {
      alert("กรุณาระบุจำนวนลิตรให้ถูกต้อง");
      return;
    }

    const branch = branches.find(b => b.id === selectedBranchId);
    const orderNo = `REQ-${getNextRunningNumber("internal-oil-order")}`;

    const newOrder: InternalOilOrder = {
      id: `REQ-${Date.now()}`,
      orderNo,
      orderDate: new Date().toISOString().split("T")[0],
      requestedDate,
      fromBranchId: selectedBranchId,
      fromBranchName: branch?.name || "",
      items: items.map(i => ({
        ...i,
        requestedQuantity: i.quantity, // เก็บค่าที่ร้องขอไว้
        pricePerLiter: 0,
        totalAmount: 0
      })),
      totalAmount: 0,
      status: "รออนุมัติ",
      requestedBy: user?.name || "Anonymous",
      requestedAt: new Date().toISOString(),
      notes,
    };

    createInternalOrder(newOrder);
    setShowCreateModal(false);
    // Reset form
    setItems([{ oilType: "Diesel", quantity: 0 }]);
    setRequestedDate("");
    setNotes("");
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
            <ShoppingCart className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">สั่งน้ำมันจากสาขาไฮโซ</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">สร้างคำร้องขอซื้อน้ำมันสำหรับปั๊มย่อย</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-white/50 dark:bg-gray-800/50 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm backdrop-blur-sm">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              สาขาที่กำลังดู: {selectedBranches.length === 0 ? "ทั้งหมด" : selectedBranches.map(id => branches.find(b => String(b.id) === id)?.name || id).join(", ")}
            </span>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            disabled={modalBranches.length === 0}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-all shadow-lg flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            สร้างใบสั่งน้ำมันใหม่
          </button>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="ค้นหาเลขที่ใบสั่งซื้อ หรือชื่อสาขา..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-900 text-gray-500 text-xs uppercase font-bold">
              <tr>
                <th className="px-6 py-4">เลขที่ใบสั่ง</th>
                <th className="px-6 py-4">สาขาที่สั่ง</th>
                <th className="px-6 py-4">วันที่ต้องการรับ</th>
                <th className="px-6 py-4">รายการ</th>
                <th className="px-6 py-4 text-center">สถานะ</th>
                <th className="px-6 py-4 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    ไม่พบข้อมูลคำสั่งน้ำมัน
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-blue-600 dark:text-blue-400">{order.orderNo}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-gray-400" />
                        <span>{order.fromBranchName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>{order.requestedDate}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {order.items.length} รายการ ({order.items.reduce((sum, i) => sum + i.quantity, 0).toLocaleString()} ลิตร)
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <StatusTag variant={getStatusVariant(order.status)}>{order.status}</StatusTag>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => setSelectedOrderDetail(order)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        <Eye className="w-5 h-5 text-gray-400" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Plus className="text-blue-600" />
                  สร้างใบสั่งน้ำมันใหม่
                </h2>
                <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="order-to-branch" className="text-sm font-bold text-gray-500 uppercase">สั่งให้สาขา</label>
                    <select
                      id="order-to-branch"
                      value={selectedBranchId}
                      onChange={(e) => setSelectedBranchId(Number(e.target.value))}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {modalBranches.map(b => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="requested-receive-date" className="text-sm font-bold text-gray-500 uppercase">วันที่ต้องการรับน้ำมัน</label>
                    <input
                      id="requested-receive-date"
                      type="date"
                      value={requestedDate}
                      onChange={(e) => setRequestedDate(e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-gray-500 uppercase">รายการน้ำมัน</span>
                    <button onClick={handleAddProduct} className="text-xs font-bold text-blue-600 flex items-center gap-1 hover:underline">
                      <Plus className="w-3 h-3" /> เพิ่มรายการ
                    </button>
                  </div>
                  <div className="space-y-3">
                    {items.map((item, index) => (
                      <div key={index} className="flex gap-3 items-end p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-700 relative group">
                        <div className="flex-1 space-y-1.5">
                          <label htmlFor={`oil-type-${index}`} className="text-[10px] font-bold text-gray-400 uppercase">ชนิดน้ำมัน</label>
                          <select
                            id={`oil-type-${index}`}
                            value={item.oilType}
                            onChange={(e) => handleUpdateProduct(index, "oilType", e.target.value)}
                            className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm outline-none"
                          >
                            {oilTypes.map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                        </div>
                        <div className="w-32 space-y-1.5">
                          <label htmlFor={`quantity-${index}`} className="text-[10px] font-bold text-gray-400 uppercase">จำนวน (ลิตร)</label>
                          <input
                            id={`quantity-${index}`}
                            type="number"
                            value={item.quantity || ""}
                            onChange={(e) => handleUpdateProduct(index, "quantity", Number(e.target.value))}
                            className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm outline-none text-right"
                            placeholder="0"
                          />
                        </div>
                        {items.length > 1 && (
                          <button onClick={() => handleRemoveProduct(index)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="notes-textarea" className="text-sm font-bold text-gray-500 uppercase">หมายเหตุ (ถ้ามี)</label>
                  <textarea
                    id="notes-textarea"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="ระบุข้อมูลเพิ่มเติม..."
                  />
                </div>
              </div>

              <div className="p-6 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-6 py-2.5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-xl font-bold transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 flex items-center gap-2"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  ส่งคำสั่งซื้อ
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedOrderDetail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-white dark:bg-gray-800 sticky top-0 z-10">
                <h2 className="text-xl font-bold flex items-center gap-2 text-blue-600">
                  <FileText />
                  รายละเอียดคำสั่งซื้อและติดตามการจัดส่ง
                </h2>
                <button onClick={() => setSelectedOrderDetail(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-gray-100 dark:divide-gray-700">
                  {/* ฝั่งซ้าย: ข้อมูลออเดอร์และรายการสินค้า */}
                  <div className="p-6 space-y-8">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">เลขที่ใบสั่งซื้อ</p>
                        <p className="text-lg font-black text-gray-900 dark:text-white">{selectedOrderDetail.orderNo}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">สถานะปัจจุบัน</p>
                        <StatusTag variant={getStatusVariant(selectedOrderDetail.status)}>{selectedOrderDetail.status}</StatusTag>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">สาขาที่สั่ง</p>
                        <p className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-blue-600" />
                          {selectedOrderDetail.fromBranchName}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">วันที่ต้องการรับ</p>
                        <p className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-blue-600" />
                          {selectedOrderDetail.requestedDate}
                        </p>
                      </div>
                      {selectedOrderDetail.assignedFromBranchName && (
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">ปั๊มที่จะส่งให้</p>
                          <p className="font-bold text-green-600 dark:text-green-400 flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            {selectedOrderDetail.assignedFromBranchName}
                          </p>
                        </div>
                      )}
                      {selectedOrderDetail.status !== "รออนุมัติ" && selectedOrderDetail.status !== "ยกเลิก" && (
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">มูลค่ารวมทั้งสิ้น</p>
                          <p className="text-xl font-black text-blue-600 tracking-tight">฿{selectedOrderDetail.totalAmount.toLocaleString()}</p>
                        </div>
                      )}
                    </div>

                    {/* สรุปข้อมูลการจัดส่ง (เหมือนในรูปที่ User ต้องการ) */}
                    {selectedOrderDetail.status !== "รออนุมัติ" && selectedOrderDetail.status !== "ยกเลิก" && (
                      <div className="mt-6 p-5 bg-gradient-to-br from-gray-50 to-blue-50/30 dark:from-gray-900/50 dark:to-blue-900/10 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-inner">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                          <ShoppingCart className="w-3 h-3" /> สรุปข้อมูลการจัดส่งทั้งหมด
                        </p>

                        {/* รายละเอียดหลักของออเดอร์ในส่วนสรุป */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">เลขที่ใบสั่งซื้อ</span>
                            <span className="text-sm font-black text-gray-900 dark:text-white">{selectedOrderDetail.orderNo}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">สั่งซื้อจากปั๊ม</span>
                            <span className="text-sm font-black text-blue-600 dark:text-blue-400">{selectedOrderDetail.fromBranchName}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">เลขที่ขนส่งอ้างอิง</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {Array.from(new Set(selectedOrderDetail.items.map(item => item.transportNo).filter(Boolean))).length > 0 ? (
                                Array.from(new Set(selectedOrderDetail.items.map(item => item.transportNo).filter(Boolean))).map((no, idx) => (
                                  <span key={idx} className="inline-block px-2 py-1 bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 rounded-lg text-[10px] font-bold shadow-sm">
                                    {no}
                                  </span>
                                ))
                              ) : (
                                <span className="text-xs text-gray-400 italic font-medium">รอดำเนินการ...</span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            {selectedOrderDetail.items.map((item, idx) => (
                              <div key={idx} className="flex justify-between items-center text-sm">
                                <span className="text-gray-600 dark:text-gray-400 font-medium">{item.oilType}</span>
                                <span className="font-bold text-gray-900 dark:text-white">{item.quantity.toLocaleString()} ลิตร</span>
                              </div>
                            ))}
                            <div className="pt-2 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center text-sm font-black">
                              <span className="text-blue-600 dark:text-blue-400 uppercase text-[10px] tracking-widest">รวมจำนวนลิตรทั้งสิ้น:</span>
                              <span className="text-blue-600 dark:text-blue-400 underline decoration-double text-lg">
                                {selectedOrderDetail.items.reduce((sum, item) => sum + item.quantity, 0).toLocaleString()} ลิตร
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-col justify-end items-end border-l border-gray-200 dark:border-gray-700 pl-6">
                            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">มูลค่ารวมที่จะส่งทั้งสิ้น</span>
                            <span className="text-3xl font-black text-blue-600 dark:text-blue-400 tracking-tighter">
                              ฿{selectedOrderDetail.totalAmount.toLocaleString()}
                            </span>
                            <span className="text-[10px] text-gray-400 font-medium mt-1">* ราคานี้รวมภาษีมูลค่าเพิ่มแล้ว (ถ้ามี)</span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="space-y-4">
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                        <Droplet className="w-3 h-3" /> รายการสินค้าที่สั่งซื้อ
                      </p>
                      <div className="space-y-3">
                        {selectedOrderDetail.items.map((item, idx) => (
                          <div key={idx} className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm transition-all hover:shadow-md">
                            <div className="flex items-center justify-between mb-3">
                              <span className="font-black text-gray-800 dark:text-gray-200">{item.oilType}</span>
                              {selectedOrderDetail.status !== "รออนุมัติ" && selectedOrderDetail.status !== "ยกเลิก" && (
                                <span className="text-xs font-black text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-lg border border-blue-100 dark:border-blue-800">
                                  ฿{item.pricePerLiter.toFixed(2)} / ลิตร
                                </span>
                              )}
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1 p-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                                <p className="text-[9px] font-bold text-gray-400 uppercase">จำนวนที่สั่ง</p>
                                <p className="font-black text-gray-600">{(item.requestedQuantity || item.quantity).toLocaleString()} <span className="text-[10px] font-normal">ลิตร</span></p>
                              </div>
                              <div className="space-y-1 p-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                                <p className="text-[9px] font-bold text-gray-400 uppercase">จำนวนที่ได้รับ</p>
                                <p className={`font-black ${selectedOrderDetail.status === "รออนุมัติ" ? "text-gray-400 italic font-normal" : "text-green-600"}`}>
                                  {selectedOrderDetail.status === "รออนุมัติ" ? "รอการยืนยัน" : `${item.quantity.toLocaleString()} ลิตร`}
                                </p>
                              </div>
                            </div>

                            {selectedOrderDetail.status !== "รออนุมัติ" && selectedOrderDetail.status !== "ยกเลิก" && (
                              <div className="mt-3 space-y-3">
                                {item.deliverySource && (
                                  <div className="flex items-center justify-between text-[10px] font-bold uppercase p-2 bg-blue-50/50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-900/30">
                                    <div className="flex flex-col">
                                      <span className="text-gray-400">แหล่งที่มา</span>
                                      <span className="text-blue-600 dark:text-blue-400">
                                        {item.deliverySource === "truck" ? "ขายจากน้ำมันในรถ" : "ขายจากการดูด"}
                                      </span>
                                    </div>
                                    {item.transportNo && (
                                      <div className="flex flex-col text-right">
                                        <span className="text-gray-400">เลขขนส่งอ้างอิง</span>
                                        <span className="text-purple-600 dark:text-purple-400">{item.transportNo}</span>
                                      </div>
                                    )}
                                  </div>
                                )}
                                <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
                                  <span className="text-[10px] font-bold text-gray-400 uppercase">รวมมูลค่ารายการนี้</span>
                                  <span className="font-black text-blue-600 text-lg">฿{item.totalAmount.toLocaleString()}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {selectedOrderDetail.notes && (
                      <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-100 dark:border-amber-900/30">
                        <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                          <FileText className="w-3 h-3" /> หมายเหตุ
                        </p>
                        <p className="text-sm text-amber-800 dark:text-amber-200 leading-relaxed">{selectedOrderDetail.notes}</p>
                      </div>
                    )}
                  </div>

                  {/* ฝั่งขวา: ติดตามการจัดส่งและเอกสาร */}
                  <div className="p-6 space-y-8 bg-gray-50/50 dark:bg-gray-900/20">
                    {selectedOrderDetail.status !== "รออนุมัติ" && selectedOrderDetail.status !== "ยกเลิก" ? (
                      <div className="space-y-6">
                        <div className="space-y-4">
                          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                            <Navigation className="w-3 h-3" /> ติดตามสถานะการจัดส่ง
                          </p>
                          <div className="space-y-4">
                            {Array.from(new Set(selectedOrderDetail.items.map(i => i.transportNo).filter(Boolean))).map((tNo) => {
                              const job = getDriverJobByTransportNo(tNo!);
                              if (!job) return (
                                <div key={tNo} className="p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <div className="p-2 bg-orange-50 dark:bg-orange-900/30 rounded-lg text-orange-600">
                                        <Truck className="w-5 h-5" />
                                      </div>
                                      <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase">เลขที่ขนส่ง</p>
                                        <p className="font-black text-gray-900 dark:text-white">{tNo}</p>
                                      </div>
                                    </div>
                                    <span className="text-[10px] font-bold text-orange-500 bg-orange-50 dark:bg-orange-900/30 px-3 py-1 rounded-full border border-orange-100 dark:border-orange-800 animate-pulse">
                                      กำลังจัดเตรียมภาระงาน
                                    </span>
                                  </div>
                                </div>
                              );
                              return (
                                <div key={tNo} className="bg-white dark:bg-gray-800 rounded-3xl border border-blue-100 dark:border-blue-900/30 shadow-sm overflow-hidden border-t-4 border-t-blue-500">
                                  <div className="p-5 space-y-6">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-3">
                                        <div className="p-2.5 bg-blue-50 dark:bg-blue-900/30 rounded-xl text-blue-600">
                                          <Truck className="w-6 h-6" />
                                        </div>
                                        <div>
                                          <p className="text-[10px] font-bold text-gray-400 uppercase">เลขที่ขนส่ง</p>
                                          <p className="text-lg font-black text-gray-900 dark:text-white leading-none">{tNo}</p>
                                        </div>
                                      </div>
                                      <span className={`text-[10px] px-3 py-1.5 rounded-full font-black uppercase tracking-wider shadow-sm ${
                                        job.status === "ส่งเสร็จ" ? "bg-green-500 text-white" : 
                                        "bg-blue-600 text-white animate-pulse"
                                      }`}>
                                        {job.status}
                                      </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                      <div className="flex flex-col gap-1 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-2xl">
                                        <span className="text-gray-400 font-bold uppercase text-[9px]">พนักงานขับรถ</span>
                                        <span className="font-black text-gray-700 dark:text-gray-300 flex items-center gap-1.5 text-sm">
                                          <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                                            <User className="w-3 h-3 text-blue-600" />
                                          </div>
                                          {job.driverName || "ไม่ระบุ"}
                                        </span>
                                      </div>
                                      <div className="flex flex-col gap-1 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-2xl">
                                        <span className="text-gray-400 font-bold uppercase text-[9px]">ทะเบียนรถ</span>
                                        <span className="font-black text-gray-700 dark:text-gray-300 text-sm">{job.truckPlateNumber}</span>
                                      </div>
                                    </div>

                                    <div className="space-y-4 pt-2">
                                      <p className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1.5">
                                        <Clock className="w-3.5 h-3.5 text-blue-500" /> ลำดับสถานะการจัดส่งแบบ Real-time
                                      </p>
                                      <div className="max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                        <JobTimeline job={job} />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                            <FileCheck className="w-3 h-3" /> เอกสารดิจิทัลประกอบออเดอร์
                          </p>
                          <div className="grid grid-cols-2 gap-4">
                            <button 
                              onClick={() => handleDownload("po", selectedOrderDetail)}
                              className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 text-blue-600 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-blue-500 transition-all shadow-sm group"
                            >
                              <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                <FileCheck className="w-5 h-5" />
                              </div>
                              <div className="text-left">
                                <p className="text-[9px] font-bold uppercase text-gray-400">ใบสั่งซื้อ</p>
                                <p className="text-sm font-black">Internal PO</p>
                              </div>
                              <Download className="w-4 h-4 ml-auto text-gray-300 group-hover:text-blue-500" />
                            </button>
                            <button 
                              onClick={() => handleDownload("dn", selectedOrderDetail)}
                              className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 text-purple-600 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-purple-500 transition-all shadow-sm group"
                            >
                              <div className="p-2 bg-purple-50 dark:bg-purple-900/30 rounded-lg group-hover:bg-purple-600 group-hover:text-white transition-colors">
                                <Truck className="w-5 h-5" />
                              </div>
                              <div className="text-left">
                                <p className="text-[9px] font-bold uppercase text-gray-400">ใบส่งของ</p>
                                <p className="text-sm font-black">Internal DN</p>
                              </div>
                              <Download className="w-4 h-4 ml-auto text-gray-300 group-hover:text-purple-500" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-center p-12 space-y-4 opacity-50">
                        <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                          <Clock className="w-10 h-10 text-gray-400" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-500 uppercase tracking-widest text-xs">อยู่ระหว่างรอการดำเนินการ</p>
                          <p className="text-sm text-gray-400 mt-1 max-w-[200px]">เมื่อออเดอร์ได้รับการอนุมัติ คุณจะสามารถติดตามสถานะการจัดส่งได้ที่นี่</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-6 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 flex justify-end sticky bottom-0 z-10">
                <button
                  onClick={() => setSelectedOrderDetail(null)}
                  className="px-10 py-3 bg-gray-900 dark:bg-gray-700 hover:bg-black dark:hover:bg-gray-600 text-white rounded-2xl font-black transition-all shadow-lg active:scale-95"
                >
                  ปิดหน้าต่าง
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function RequestOil() {
  return (
    <GasStationWrap>
      <RequestOilContent />
    </GasStationWrap>
  );
}

