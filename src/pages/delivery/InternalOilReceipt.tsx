import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";
import {
  History,
  Search,
  CheckCircle,
  X,
  Droplet,
  Truck,
  FileText,
  Building2,
  Calendar,
  Clock,
  User,
  PackageCheck,
  MapPin,
  ClipboardCheck,
  Check,
  Navigation,
  ShoppingCart,
  Eye
} from "lucide-react";
import { useGasStation } from "@/contexts/GasStationContext";
import { useBranch } from "@/contexts/BranchContext";
import type { InternalOilOrder, OilType } from "@/types/gasStation";
import StatusTag, { getStatusVariant } from "@/components/StatusTag";
import TableActionMenu from "@/components/TableActionMenu";

export default function InternalOilReceipt() {
  const { internalOrders, updateInternalOrder, branches, driverJobs } = useGasStation();
  const { selectedBranches } = useBranch();
  const selectedBranchIds = useMemo(() => selectedBranches.map(id => Number(id)), [selectedBranches]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<InternalOilOrder | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [receivedItems, setReceivedItems] = useState<Array<{ oilType: OilType; quantity: number }>>([]);
  const [receiptNote, setReceiptNote] = useState("");
  const [receivedByName, setReceivedByName] = useState("");

  // Helper เพื่อดึงข้อมูลขนส่งที่ถูกต้องที่สุด
  const getTransportInfo = (order: InternalOilOrder) => {
    // 1. ลองหาจาก DriverJob ก่อน (เพราะมีข้อมูล Real-time ที่สุด)
    const job = driverJobs.find(j => j.transportNo === order.transportNo || j.internalOrderNo === order.orderNo);
    if (job) {
      return {
        transportNo: job.transportNo,
        truckPlate: job.truckPlateNumber,
        trailerPlate: job.trailerPlateNumber,
        driverName: job.driverName
      };
    }

    // 2. ถ้าไม่มีใน DriverJob ให้ใช้ข้อมูลที่มีใน Order เอง
    return {
      transportNo: order.transportNo || (order.items && order.items[0]?.transportNo) || "-",
      truckPlate: order.truckPlate || "-",
      trailerPlate: order.trailerPlate || "-",
      driverName: order.driverName || "-"
    };
  };

  const numberFormatter = useMemo(() => new Intl.NumberFormat("th-TH"), []);
  const currencyFormatter = useMemo(() => new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
  }), []);
  const dateFormatter = useMemo(() => new Intl.DateTimeFormat("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }), []);

  // ฟังก์ชันสำหรับดาวน์โหลดเอกสาร (PO/DN)
  const handleDownload = (type: "po" | "dn", order: InternalOilOrder) => {
    let htmlContent = "";

    if (type === "po") {
      htmlContent = `
        <!DOCTYPE html>
        <html lang="th">
        <head>
          <meta charset="UTF-8">
          <title>ใบสั่งซื้อน้ำมันภายใน - ${order.orderNo}</title>
          <style>
            @page { size: A4; margin: 20mm; }
            body { font-family: 'Sarabun', sans-serif; font-size: 14px; line-height: 1.6; color: #333; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #10b981; padding-bottom: 20px; }
            .header h1 { color: #059669; margin: 0; font-size: 24px; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
            .info-box { padding: 15px; bg-color: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb; }
            .label { font-weight: bold; color: #6b7280; font-size: 12px; text-transform: uppercase; margin-bottom: 4px; }
            .value { font-weight: bold; color: #111827; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background-color: #f3f4f6; color: #374151; font-weight: bold; padding: 12px; border: 1px solid #e5e7eb; text-align: left; }
            td { padding: 12px; border: 1px solid #e5e7eb; }
            .text-right { text-align: right; }
            .total-row { background-color: #f9fafb; font-weight: bold; }
            .footer { margin-top: 50px; display: grid; grid-template-columns: 1fr 1fr; gap: 50px; text-align: center; }
            .signature { border-top: 1px solid #9ca3af; margin-top: 40px; padding-top: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>ใบสั่งซื้อน้ำมันภายใน (Internal Purchase Order)</h1>
            <p>เลขที่: ${order.orderNo}</p>
          </div>
          <div class="info-grid">
            <div class="info-box">
              <div class="label">สั่งซื้อจากปั๊ม (ต้นทาง)</div>
              <div class="value">${order.assignedFromBranchName || "ปั๊มไฮโซ"}</div>
              <div style="margin-top: 10px;" class="label">ปั๊มที่สั่ง (ปลายทาง)</div>
              <div class="value">${order.fromBranchName}</div>
            </div>
            <div class="info-box">
              <div class="label">วันที่สั่งซื้อ</div>
              <div class="value">${dateFormatter.format(new Date(order.orderDate))}</div>
              <div style="margin-top: 10px;" class="label">วันที่ต้องการรับน้ำมัน</div>
              <div class="value">${dateFormatter.format(new Date(order.requestedDate))}</div>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>รายการน้ำมัน</th>
                <th class="text-right">จำนวน (ลิตร)</th>
                <th class="text-right">ราคาต่อลิตร</th>
                <th class="text-right">รวมเงิน</th>
              </tr>
            </thead>
            <tbody>
              ${order.items.map(item => `
                <tr>
                  <td>${item.oilType}</td>
                  <td class="text-right">${numberFormatter.format(item.requestedQuantity || item.quantity)}</td>
                  <td class="text-right">${item.pricePerLiter > 0 ? currencyFormatter.format(item.pricePerLiter) : "รอกำหนด"}</td>
                  <td class="text-right">${item.totalAmount > 0 ? currencyFormatter.format(item.totalAmount) : "รอกำหนด"}</td>
                </tr>
              `).join("")}
            </tbody>
            <tr class="total-row">
              <td colspan="3" class="text-right">ยอดรวมทั้งสิ้น</td>
              <td class="text-right">${order.totalAmount > 0 ? currencyFormatter.format(order.totalAmount) : "รอกำหนด"}</td>
            </tr>
          </table>
          <div class="footer">
            <div>
              <div class="signature">ผู้สั่งซื้อ</div>
              <p>${order.requestedBy}</p>
            </div>
            <div>
              <div class="signature">ผู้อนุมัติ</div>
              <p>${order.approvedBy || "พี่นิด"}</p>
            </div>
          </div>
          <script>window.print();</script>
        </body>
        </html>
      `;
    } else {
      htmlContent = `
        <!DOCTYPE html>
        <html lang="th">
        <head>
          <meta charset="UTF-8">
          <title>ใบส่งของภายใน - ${order.orderNo}</title>
          <style>
            @page { size: A4; margin: 20mm; }
            body { font-family: 'Sarabun', sans-serif; font-size: 14px; line-height: 1.6; color: #333; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #3b82f6; padding-bottom: 20px; }
            .header h1 { color: #1d4ed8; margin: 0; font-size: 24px; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
            .info-box { padding: 15px; bg-color: #f0f9ff; border-radius: 8px; border: 1px solid #bae6fd; }
            .label { font-weight: bold; color: #64748b; font-size: 11px; text-transform: uppercase; margin-bottom: 4px; }
            .value { font-weight: bold; color: #0f172a; }
            .transport-details { grid-column: span 2; background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background-color: #eff6ff; color: #1e40af; font-weight: bold; padding: 12px; border: 1px solid #bfdbfe; text-align: left; }
            td { padding: 12px; border: 1px solid #e2e8f0; }
            .text-right { text-align: right; }
            .footer { margin-top: 50px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 30px; text-align: center; }
            .signature { border-top: 1px solid #94a3b8; margin-top: 40px; padding-top: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>ใบส่งของภายใน (Internal Delivery Note)</h1>
            <p>อ้างอิงออเดอร์: ${order.orderNo} | เลขที่ขนส่ง: ${order.transportNo || "-"}</p>
          </div>
          <div class="info-grid">
            <div class="info-box">
              <div class="label">จาก (ผู้ส่ง)</div>
              <div class="value">${order.assignedFromBranchName || "ปั๊มไฮโซ"}</div>
            </div>
            <div class="info-box">
              <div class="label">ถึง (ผู้รับ)</div>
              <div class="value">${order.fromBranchName}</div>
            </div>
            <div class="transport-details">
              <div>
                <div class="label">พนักงานขับรถ</div>
                <div class="value">${order.driverName || "-"}</div>
              </div>
              <div>
                <div class="label">หัวรถ</div>
                <div class="value">${order.truckPlate || "-"}</div>
              </div>
              <div>
                <div class="label">หางรถ</div>
                <div class="value">${order.trailerPlate || "-"}</div>
              </div>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>รายการน้ำมัน</th>
                <th class="text-right">จำนวนที่ส่ง (ลิตร)</th>
                <th>แหล่งที่มา</th>
              </tr>
            </thead>
            <tbody>
              ${order.items.map(item => `
                <tr>
                  <td>${item.oilType}</td>
                  <td class="text-right font-bold">${numberFormatter.format(item.quantity)}</td>
                  <td>${item.deliverySource === "truck" ? "น้ำมันบนรถ" : item.deliverySource === "suction" ? "จากการดูด" : "-"}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
          <div class="footer">
            <div>
              <div class="signature">พนักงานขับรถ</div>
              <p>( ผู้ส่งของ )</p>
            </div>
            <div>
              <div class="signature">ผู้อนุมัติ</div>
              <p>( ฝ่ายบริหาร )</p>
            </div>
            <div>
              <div class="signature">ผู้รับของ</div>
              <p>( ........................................ )</p>
            </div>
          </div>
          <script>window.print();</script>
        </body>
        </html>
      `;
    }

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
    }
  };

  // กรองรายการสั่งซื้อภายในที่ต้องรับน้ำมัน
  const pendingReceipts = useMemo(() => {
    return internalOrders.filter(order => {
      // เฉพาะรายการของสาขาที่เลือก
      const matchBranch = selectedBranchIds.length === 0 || selectedBranchIds.includes(order.fromBranchId);
      
      // สถานะที่สามารถรับน้ำมันได้ (กำลังจัดส่ง หรือ อนุมัติแล้วแต่ระบุแหล่งที่มาแล้ว)
      const isDeliverable = order.status === "กำลังจัดส่ง" || (order.status === "อนุมัติแล้ว" && order.assignedFromBranchId);
      
      // ค้นหาตามเลขที่ออเดอร์หรือชื่อปั๊มต้นทาง
      const matchSearch = order.orderNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.assignedFromBranchName?.toLowerCase().includes(searchTerm.toLowerCase());

      return matchBranch && isDeliverable && matchSearch && order.status !== "ส่งแล้ว" && order.status !== "ยกเลิก";
    }).sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
  }, [internalOrders, selectedBranchIds, searchTerm]);

  // ประวัติการรับน้ำมัน
  const receiptHistory = useMemo(() => {
    return internalOrders.filter(order => {
      const matchBranch = selectedBranchIds.length === 0 || selectedBranchIds.includes(order.fromBranchId);
      const isReceived = order.status === "ส่งแล้ว";
      const matchSearch = order.orderNo.toLowerCase().includes(searchTerm.toLowerCase());
      return matchBranch && isReceived && matchSearch;
    }).sort((a, b) => new Date(b.updatedAt || b.orderDate).getTime() - new Date(a.updatedAt || a.orderDate).getTime());
  }, [internalOrders, selectedBranchIds, searchTerm]);

  const handleOpenReceiptModal = (order: InternalOilOrder) => {
    setSelectedOrder(order);
    setReceivedItems(order.items.map(item => ({
      oilType: item.oilType,
      quantity: item.quantity // เริ่มต้นด้วยจำนวนที่ส่งจริงจากต้นทาง
    })));
    setReceiptNote("");
    setReceivedByName("");
    setShowReceiptModal(true);
  };

  const handleConfirmReceipt = () => {
    if (!selectedOrder) return;
    if (!receivedByName.trim()) {
      alert("กรุณาระบุชื่อผู้กดรับน้ำมัน");
      return;
    }

    // อัปเดตรายการสินค้าพร้อมจำนวนที่รับจริง
    const updatedItems = selectedOrder.items.map((item, idx) => ({
      ...item,
      quantity: receivedItems[idx].quantity, // อัปเดตเป็นจำนวนที่รับจริง
      totalAmount: receivedItems[idx].quantity * item.pricePerLiter // คำนวณยอดเงินใหม่ตามที่รับจริง
    }));

    const totalAmount = updatedItems.reduce((sum, item) => sum + item.totalAmount, 0);

    updateInternalOrder(selectedOrder.id, {
      status: "ส่งแล้ว",
      items: updatedItems,
      totalAmount,
      notes: receiptNote ? `${selectedOrder.notes || ""}\n[บันทึกรับน้ำมัน]: ${receiptNote}` : selectedOrder.notes,
      receivedByName,
      updatedAt: new Date().toISOString()
    });

    setShowReceiptModal(false);
    setSelectedOrder(null);
    alert("บันทึกการรับน้ำมันสำเร็จ สต็อกน้ำมันจะถูกอัปเดตโดยอัตโนมัติ");
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200 dark:shadow-none">
            <ClipboardCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">รับน้ำมัน (ภายในปั๊ม)</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">ยืนยันการรับน้ำมันที่จัดส่งมาจากสาขาไฮโซหรือสาขาอื่น</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white/50 dark:bg-gray-800/50 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm backdrop-blur-sm">
          <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            สาขาที่กำลังดู: {selectedBranches.length === 0 ? "ทั้งหมด" : selectedBranches.map(id => branches.find(b => String(b.id) === id)?.name || id).join(", ")}
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="ค้นหาเลขที่ออเดอร์, สาขาต้นทาง..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
          />
        </div>
      </div>

      {/* Main Content Sections */}
      <div className="grid grid-cols-1 gap-8">
        {/* 1. รายการรอรับ (Pending) */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <Clock className="w-5 h-5 text-orange-500" />
            <h2 className="text-lg font-bold text-gray-800 dark:text-white">รายการที่อยู่ระหว่างจัดส่ง / รอรับ</h2>
            <span className="ml-2 px-2 py-0.5 bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 rounded-full text-xs font-bold">
              {pendingReceipts.length} รายการ
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingReceipts.length === 0 ? (
              <div className="col-span-full py-12 bg-gray-50 dark:bg-gray-900/50 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-800 flex flex-col items-center justify-center text-center">
                <PackageCheck className="w-12 h-12 text-gray-300 mb-3" />
                <p className="text-gray-500 dark:text-gray-400 font-medium">ไม่มีรายการน้ำมันที่รอรับในขณะนี้</p>
              </div>
            ) : (
              pendingReceipts.map((order) => (
                <motion.div
                  key={order.id}
                  layoutId={order.id}
                  className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm hover:shadow-md transition-all group"
                >
                  {(() => {
                    const transport = getTransportInfo(order);
                    return (
                      <>
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">เลขที่ออเดอร์</p>
                            <p className="text-lg font-black text-gray-900 dark:text-white group-hover:text-emerald-600 transition-colors">{order.orderNo}</p>
                          </div>
                          <StatusTag variant={getStatusVariant(order.status)}>{order.status}</StatusTag>
                        </div>

                        <div className="space-y-3 mb-6">
                          <div className="flex items-center gap-3 text-sm">
                            <Building2 className="w-4 h-4 text-emerald-500 shrink-0" />
                            <div>
                              <span className="text-gray-400">จาก:</span>
                              <span className="ml-1.5 font-bold text-gray-700 dark:text-gray-200">{order.assignedFromBranchName || "ปั๊มไฮโซ"}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 text-sm">
                            <Truck className="w-4 h-4 text-blue-500 shrink-0" />
                            <div>
                              <span className="text-gray-400">เลขขนส่ง:</span>
                              <span className="ml-1.5 font-bold text-gray-700 dark:text-gray-200">{transport.transportNo}</span>
                              <div className="text-[10px] text-gray-500 flex gap-2 mt-0.5">
                                <span>{transport.truckPlate}</span>
                                <span>/</span>
                                <span>{transport.trailerPlate}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 text-sm">
                            <User className="w-4 h-4 text-orange-400 shrink-0" />
                            <div>
                              <span className="text-gray-400">คนขับ:</span>
                              <span className="ml-1.5 font-bold text-gray-700 dark:text-gray-200">{transport.driverName}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 text-sm">
                            <Droplet className="w-4 h-4 text-cyan-500 shrink-0" />
                            <div>
                              <span className="text-gray-400">ปริมาณรวม:</span>
                              <span className="ml-1.5 font-bold text-gray-700 dark:text-gray-200">{numberFormatter.format(order.items.reduce((s, i) => s + i.quantity, 0))} ลิตร</span>
                            </div>
                          </div>
                    <div className="flex gap-2 pt-2 border-t border-gray-50 dark:border-gray-700">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload("po", order);
                        }}
                        className="flex-1 py-1.5 bg-gray-50 dark:bg-gray-900 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold rounded-lg border border-emerald-100 dark:border-emerald-800 transition-colors flex items-center justify-center gap-1.5"
                      >
                        <FileText className="w-3 h-3" /> ใบสั่งซื้อ (PO)
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload("dn", order);
                        }}
                        className="flex-1 py-1.5 bg-gray-50 dark:bg-gray-900 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[10px] font-bold rounded-lg border border-blue-100 dark:border-blue-800 transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Truck className="w-3 h-3" /> ใบส่งของ (DN)
                      </button>
                    </div>
                    {order.status === "ส่งแล้ว" && (
                      <div className="pt-2 border-t border-gray-50 dark:border-gray-700 space-y-1">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="text-gray-400 font-bold uppercase">วันที่รับ (จริง):</span>
                          <span className="text-emerald-600 font-bold">{order.updatedAt ? new Date(order.updatedAt).toLocaleDateString('th-TH') : "-"}</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="text-gray-400 font-bold uppercase">ผู้กดรับน้ำมัน:</span>
                          <span className="text-blue-600 font-bold">{order.receivedByName || "-"}</span>
                        </div>
                      </div>
                    )}
                  </div>

                        <button
                          onClick={() => handleOpenReceiptModal(order)}
                          className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-100 dark:shadow-none active:scale-95"
                        >
                          <CheckCircle className="w-5 h-5" />
                          ยืนยันการรับน้ำมัน
                        </button>
                      </>
                    );
                  })()}
                </motion.div>
              ))
            )}
          </div>
        </section>

        {/* 2. ประวัติการรับ (History) */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 px-1 pt-4 border-t border-gray-100 dark:border-gray-800">
            <History className="w-5 h-5 text-gray-400" />
            <h2 className="text-lg font-bold text-gray-800 dark:text-white">ประวัติการรับน้ำมันล่าสุด</h2>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 text-xs uppercase font-bold">
                  <tr>
                    <th className="px-6 py-4">เลขที่ออเดอร์</th>
                    <th className="px-6 py-4">จากสาขา</th>
                    <th className="px-6 py-4">วันที่รับ</th>
                    <th className="px-6 py-4">ผู้รับน้ำมัน</th>
                    <th className="px-6 py-4">รายการ</th>
                    <th className="px-6 py-4 text-center">สถานะ</th>
                    <th className="px-6 py-4 text-center">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {receiptHistory.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-400 italic">ไม่พบประวัติการรับน้ำมัน</td>
                    </tr>
                  ) : (
                    receiptHistory.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                        <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">{order.orderNo}</td>
                        <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{order.assignedFromBranchName}</td>
                        <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1.5 text-emerald-600 font-bold">
                              <Calendar className="w-3.5 h-3.5" />
                              {order.updatedAt ? new Date(order.updatedAt).toLocaleDateString('th-TH') : "-"}
                            </div>
                            <div className="text-[10px] text-gray-400 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {order.updatedAt ? new Date(order.updatedAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + " น." : "-"}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
                              <User className="w-3 h-3 text-emerald-600" />
                            </div>
                            <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{order.receivedByName || "-"}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs font-medium text-gray-500">
                            {order.items.length} รายการ ({numberFormatter.format(order.items.reduce((s, i) => s + i.quantity, 0))} ลิตร)
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="px-3 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-full text-[10px] font-black uppercase">รับสำเร็จ</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center">
                            <TableActionMenu
                              actions={[
                                {
                                  label: "ดูรายละเอียด",
                                  icon: Eye,
                                  onClick: () => {
                                    setSelectedOrder(order);
                                    setShowDetailModal(true);
                                  }
                                },
                                {
                                  label: "ดูใบสั่งซื้อ (PO)",
                                  icon: ShoppingCart,
                                  onClick: () => handleDownload("po", order)
                                },
                                {
                                  label: "ดูใบส่งของ (DN)",
                                  icon: Truck,
                                  onClick: () => handleDownload("dn", order)
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
        </section>
      </div>

      {/* Receipt Confirmation Modal */}
      <AnimatePresence>
        {showReceiptModal && selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-emerald-50 dark:bg-emerald-900/20">
                <div>
                  <h2 className="text-xl font-bold text-emerald-800 dark:text-emerald-400 flex items-center gap-2">
                    <ClipboardCheck />
                    บันทึกรับน้ำมันเข้าคลัง
                  </h2>
                  <p className="text-xs text-emerald-600 dark:text-emerald-500 font-bold mt-0.5">ออเดอร์: {selectedOrder.orderNo}</p>
                </div>
                <button onClick={() => setShowReceiptModal(false)} className="p-2 hover:bg-white dark:hover:bg-gray-700 rounded-full transition-colors">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-6">
                {/* Order Summary Info */}
                {(() => {
                  const transport = getTransportInfo(selectedOrder);
                  return (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-700">
                        <div>
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">สาขาต้นทาง (ผู้ส่ง)</span>
                          <p className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-emerald-500" />
                            {selectedOrder.assignedFromBranchName}
                          </p>
                        </div>
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">ปั๊มปลายทาง (ผู้รับ)</span>
                      <p className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-blue-500" />
                        {selectedOrder.fromBranchName}
                      </p>
                    </div>
                    <div className="pt-2 border-t border-gray-200 dark:border-gray-800">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">วันที่รับ (จริง)</span>
                      <p className="text-sm font-bold text-emerald-600">
                        {selectedOrder.updatedAt ? dateFormatter.format(new Date(selectedOrder.updatedAt)) : "-"}
                      </p>
                    </div>
                    <div className="pt-2 border-t border-gray-200 dark:border-gray-800">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">ผู้กดรับน้ำมัน</span>
                      <p className="text-sm font-bold text-blue-600">
                        {selectedOrder.receivedByName || "-"}
                      </p>
                    </div>
                  </div>

                      <div className="grid grid-cols-3 gap-4 p-4 bg-blue-50/30 dark:bg-blue-900/10 rounded-2xl border border-blue-100/50 dark:border-blue-800/50">
                        <div className="col-span-3 flex items-center justify-between mb-1 pb-2 border-b border-blue-100 dark:border-blue-800/50">
                          <div className="flex items-center gap-2">
                            <Navigation className="w-4 h-4 text-blue-600" />
                            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">ข้อมูลการจัดส่ง (Transport Info)</span>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => handleDownload("po", selectedOrder)} className="px-2 py-1 bg-white dark:bg-gray-800 text-[10px] font-bold text-emerald-600 border border-emerald-200 rounded-md hover:bg-emerald-50 transition-colors">
                              VIEW PO
                            </button>
                            <button onClick={() => handleDownload("dn", selectedOrder)} className="px-2 py-1 bg-white dark:bg-gray-800 text-[10px] font-bold text-blue-600 border border-blue-200 rounded-md hover:bg-blue-50 transition-colors">
                              VIEW DN
                            </button>
                          </div>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">เลขที่ขนส่ง</span>
                          <p className="font-black text-gray-900 dark:text-white text-sm">{transport.transportNo}</p>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">หัวรถ / หางรถ</span>
                          <p className="font-bold text-gray-800 dark:text-white text-sm">{transport.truckPlate} / {transport.trailerPlate}</p>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">พนักงานขับรถ</span>
                          <p className="font-bold text-gray-800 dark:text-white text-sm">{transport.driverName}</p>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Entry Fields */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">รายการน้ำมันและปริมาณที่ได้รับจริง</span>
                    <span className="text-[10px] text-gray-400">* กรุณาตรวจสอบปริมาณก่อนบันทึก</span>
                  </div>
                  
                  {receivedItems.map((item, index) => (
                    <div key={index} className="p-4 bg-white dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-8 bg-emerald-500 rounded-full"></div>
                          <span className="font-black text-gray-800 dark:text-gray-200 text-lg">{item.oilType}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-bold text-gray-400 uppercase">ส่งจากต้นทาง</p>
                          <p className="font-bold text-gray-600">{numberFormatter.format(selectedOrder.items[index].quantity)} ลิตร</p>
                        </div>
                      </div>
                      
                      <div className="flex items-end gap-4">
                        <div className="flex-1 space-y-1.5">
                          <label htmlFor={`received-qty-${index}`} className="text-xs font-bold text-emerald-600 dark:text-emerald-500 uppercase">จำนวนที่ได้รับจริง (ลิตร)</label>
                          <div className="relative">
                            <input
                              id={`received-qty-${index}`}
                              type="number"
                              value={item.quantity}
                              onChange={(e) => {
                                const newItems = [...receivedItems];
                                newItems[index].quantity = Number(e.target.value);
                                setReceivedItems(newItems);
                              }}
                              className="w-full pl-4 pr-12 py-3 bg-emerald-50/30 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800 rounded-xl font-black text-xl text-emerald-700 dark:text-emerald-400 focus:ring-2 focus:ring-emerald-500 outline-none"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-emerald-500/50">ลิตร</span>
                          </div>
                        </div>
                        
                        {/* ส่วนต่าง */}
                        <div className="w-32 pb-3 text-right">
                          <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">ส่วนต่าง</p>
                          <p className={`font-black text-lg ${item.quantity - selectedOrder.items[index].quantity === 0 ? "text-gray-400" : item.quantity - selectedOrder.items[index].quantity > 0 ? "text-blue-500" : "text-red-500"}`}>
                            {item.quantity - selectedOrder.items[index].quantity > 0 ? "+" : ""}{numberFormatter.format(item.quantity - selectedOrder.items[index].quantity)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="received-by-name" className="text-sm font-bold text-gray-500 uppercase tracking-wider">ชื่อผู้กดรับน้ำมัน *</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        id="received-by-name"
                        type="text"
                        value={receivedByName}
                        onChange={(e) => setReceivedByName(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 text-gray-700 dark:text-gray-300"
                        placeholder="ระบุชื่อผู้รับน้ำมัน..."
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="receipt-note" className="text-sm font-bold text-gray-500 uppercase tracking-wider">หมายเหตุ (ถ้ามี)</label>
                    <textarea
                      id="receipt-note"
                      value={receiptNote}
                      onChange={(e) => setReceiptNote(e.target.value)}
                      rows={1}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 resize-none text-gray-700 dark:text-gray-300"
                      placeholder="ระบุหมายเหตุเพิ่มเติม..."
                    />
                  </div>
                </div>
              </div>

              <div className="p-6 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3">
                <button
                  onClick={() => setShowReceiptModal(false)}
                  className="px-6 py-2.5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-xl font-bold transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleConfirmReceipt}
                  className="px-8 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 flex items-center gap-2 active:scale-95 transition-all"
                >
                  <Check className="w-5 h-5" />
                  ยืนยันการรับและบันทึกสต็อก
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Detail Modal */}
      <AnimatePresence>
        {showDetailModal && selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-blue-50 dark:bg-blue-900/20">
                <div>
                  <h2 className="text-xl font-bold text-blue-800 dark:text-blue-400 flex items-center gap-2">
                    <Eye />
                    รายละเอียดการรับน้ำมัน
                  </h2>
                  <p className="text-xs text-blue-600 dark:text-blue-500 font-bold mt-0.5">ออเดอร์: {selectedOrder.orderNo}</p>
                </div>
                <button 
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedOrder(null);
                  }} 
                  className="p-2 hover:bg-white dark:hover:bg-gray-700 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-700">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">ข้อมูลทั่วไป</span>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">วันที่สั่งซื้อ:</span>
                        <span className="font-bold">{dateFormatter.format(new Date(selectedOrder.orderDate))}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">วันที่รับ (จริง):</span>
                        <span className="font-bold text-emerald-600">{selectedOrder.updatedAt ? dateFormatter.format(new Date(selectedOrder.updatedAt)) : "-"}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">ผู้กดรับน้ำมัน:</span>
                        <span className="font-bold text-blue-600">{selectedOrder.receivedByName || "-"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-700">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">เส้นทาง</span>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                        <span className="text-gray-500">จาก:</span>
                        <span className="font-bold">{selectedOrder.assignedFromBranchName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <span className="text-gray-500">ถึง:</span>
                        <span className="font-bold">{selectedOrder.fromBranchName}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-blue-50/30 dark:bg-blue-900/10 rounded-2xl border border-blue-100/50 dark:border-blue-800/50">
                  {(() => {
                    const transport = getTransportInfo(selectedOrder);
                    return (
                      <>
                        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-blue-100 dark:border-blue-800/50 text-blue-600">
                          <Truck className="w-4 h-4" />
                          <span className="text-xs font-bold uppercase tracking-wider">ข้อมูลขนส่ง (Transport Info)</span>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">เลขขนส่ง</p>
                            <p className="font-black text-gray-900 dark:text-white">{transport.transportNo}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">ทะเบียนรถ</p>
                            <p className="font-bold">{transport.truckPlate} / {transport.trailerPlate}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">คนขับ</p>
                            <p className="font-bold">{transport.driverName}</p>
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>

                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2 text-sm uppercase tracking-wider">
                    <Droplet className="w-4 h-4 text-emerald-500" /> รายการน้ำมันที่ได้รับ
                  </h4>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-white dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                            <Droplet className="w-5 h-5 text-emerald-500" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 dark:text-white">{item.oilType}</p>
                            <p className="text-[10px] text-gray-400">ราคา {currencyFormatter.format(item.pricePerLiter)} / ลิตร</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">{numberFormatter.format(item.quantity)} ลิตร</p>
                          <p className="text-[10px] text-gray-400 font-bold">{currencyFormatter.format(item.totalAmount)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedOrder.notes && (
                  <div className="p-4 bg-orange-50/30 dark:bg-orange-900/10 rounded-2xl border border-orange-100 dark:border-orange-800/50">
                    <p className="text-[10px] text-orange-600 font-bold uppercase mb-1">หมายเหตุ</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">{selectedOrder.notes}</p>
                  </div>
                )}
              </div>

              <div className="p-6 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDownload("po", selectedOrder)}
                    className="px-4 py-2 bg-white dark:bg-gray-800 text-emerald-600 border border-emerald-200 rounded-xl text-xs font-bold hover:bg-emerald-50 transition-all flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4" /> พิมพ์ PO
                  </button>
                  <button
                    onClick={() => handleDownload("dn", selectedOrder)}
                    className="px-4 py-2 bg-white dark:bg-gray-800 text-blue-600 border border-blue-200 rounded-xl text-xs font-bold hover:bg-blue-50 transition-all flex items-center gap-2"
                  >
                    <Truck className="w-4 h-4" /> พิมพ์ DN
                  </button>
                </div>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedOrder(null);
                  }}
                  className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl font-bold hover:bg-gray-300 transition-all"
                >
                  ปิด
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

