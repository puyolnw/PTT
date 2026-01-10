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
import type { PurchaseOrder, OilType } from "@/types/gasStation";
import StatusTag from "@/components/StatusTag";
import TableActionMenu from "@/components/TableActionMenu";

export default function DepotOilReceipt() {
  const { purchaseOrders, updatePurchaseOrder, branches, driverJobs } = useGasStation();
  const { selectedBranches } = useBranch();
  
  const selectedBranchIds = useMemo(() => selectedBranches.map(id => Number(id)), [selectedBranches]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  // State for confirming receipt
  const [receivedItems, setReceivedItems] = useState<Array<{ 
    oilType: OilType; 
    quantity: number; 
    unloadedQuantity: number; 
    keptOnTruckQuantity: number 
  }>>([]);
  const [receiptNote, setReceiptNote] = useState("");
  const [receivedByName, setReceivedByName] = useState("");


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

  const currentBranchName = useMemo(() => {
    if (selectedBranchIds.length === 1) {
      return branches.find(b => b.id === selectedBranchIds[0])?.name || "ไม่ระบุสาขา";
    }
    return "ทุกสาขา";
  }, [selectedBranchIds, branches]);

  // Helper เพื่อดึงข้อมูลขนส่งที่ถูกต้องที่สุด
  const getTransportInfo = (order: any) => {
    // หา DriverJob ที่เชื่อมกับ PO หรือ IO นี้
    const job = driverJobs.find(j => 
      j.purchaseOrderNo === order.orderNo || 
      j.internalOrderNo === order.orderNo ||
      j.transportNo === order.transportNo
    );
    
    if (job) {
      return {
        transportNo: job.transportNo || "-",
        truckPlate: job.truckPlateNumber || "-",
        trailerPlate: job.trailerPlateNumber || "-",
        driverName: job.driverName || "-",
        odometer: job.startTrip?.startOdometer || 0,
        approveNo: order.approveNo || order.supplierOrderNo || "-",
        supplier: "PTT Station",
        destinations: job.destinationBranches?.map(b => b.branchName) || []
      };
    }

    return {
      transportNo: order.transportNo || "-",
      truckPlate: order.truckPlate || "-",
      trailerPlate: order.trailerPlate || "-",
      driverName: order.driverName || order.approvedBy || "-",
      odometer: 0,
      approveNo: order.approveNo || order.supplierOrderNo || "-",
      supplier: "PTT Station",
      destinations: []
    };
  };

  // ฟังก์ชันสำหรับดาวน์โหลดเอกสาร (PO/DN)
  const handleDownload = (type: "po" | "dn", order: PurchaseOrder) => {
    const isPO = type === "po";
    const title = isPO ? "ใบสั่งซื้อ (ปตท.)" : "ใบส่งของ (ปตท.)";
    const subTitle = isPO ? "PURCHASE ORDER" : "DELIVERY NOTE";
    
    const totalAmount = order.totalAmount || 0;
    const vat = 0; 
    const grandTotal = totalAmount + vat;

    const bahtText = (n: number) => {
      if (n === 0) return "ศูนย์บาทถ้วน";
      return `(${n.toLocaleString()}บาทถ้วน)`; 
    };

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${title} - ${order.orderNo}</title>
        <meta charset="utf-8">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;700&display=swap');
          * { box-sizing: border-box; -webkit-print-color-adjust: exact; margin: 0; padding: 0; }
          @page { size: A4; margin: 12mm; }
          body { 
            font-family: 'Sarabun', sans-serif; 
            padding: 0; 
            color: #000; 
            line-height: 1.3;
            background-color: white;
            font-size: 12px;
          }
          
          .page-container {
            padding: 12mm;
            max-height: 100vh;
            overflow: hidden;
          }

          .header-section {
            display: flex;
            align-items: flex-start;
            gap: 12px;
            margin-bottom: 10px;
          }

          .logo-box { 
            width: 60px; 
            height: 60px; 
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }
          .logo-img {
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
          }

          .company-info { flex: 1; font-size: 11px; line-height: 1.3; }
          .company-name { font-weight: bold; font-size: 15px; margin-bottom: 2px; }

          .doc-title { text-align: center; margin: 8px 0; }
          .doc-title h1 { font-size: 16px; margin: 0; font-weight: bold; }
          .doc-title p { font-size: 11px; margin: 1px 0 0 0; font-weight: bold; }

          .customer-info-grid {
            display: grid;
            grid-template-columns: 1.5fr 1fr;
            gap: 12px;
            margin-bottom: 10px;
            font-size: 11px;
          }

          .info-label { font-weight: bold; display: inline-block; width: 70px; }
          .info-row { margin-bottom: 1px; line-height: 1.3; }

          table { width: 100%; border-collapse: collapse; margin-bottom: 6px; font-size: 11px; border: 1px solid #000; }
          th { background-color: #5c93d1; color: white; padding: 5px 3px; border: 1px solid #000; text-align: center; font-weight: bold; font-size: 10px; }
          td { padding: 5px 3px; border: 1px solid #000; vertical-align: top; font-size: 11px; }
          
          .text-center { text-align: center; }
          .text-right { text-align: right; }

          .summary-section {
            display: grid;
            grid-template-columns: 1.5fr 1fr;
            gap: 8px;
            margin-top: 6px;
            font-size: 11px;
          }
          .baht-text-box {
            border: 1px solid #000;
            padding: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            min-height: 50px;
            font-size: 11px;
          }
          .summary-table { width: 100%; border-collapse: collapse; border: 1px solid #000; }
          .summary-table td { border: 1px solid #000; padding: 5px 6px; font-size: 11px; }
          .summary-label { font-weight: bold; background-color: white; width: 60%; }

          .footer-signature {
            margin-top: 15px;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 60px;
            text-align: center;
            font-size: 11px;
          }
          .signature-line { border-top: 0px solid #333; margin-top: 25px; }

          .bottom-contact {
            margin-top: 12px;
            display: flex;
            justify-content: space-between;
            font-size: 9px;
            color: #555;
            border-top: 1px solid #eee;
            padding-top: 6px;
          }

          @media print {
            body { padding: 0; }
            .page-container { padding: 12mm; max-height: 277mm; }
            @page { margin: 12mm; size: A4; }
          }
        </style>
      </head>
      <body>
        <div class="page-container">
          <div class="header-section">
            <div class="logo-box">
              <img src="${window.location.origin}/images/PTT-01.svg (1).png" alt="PTT Logo" class="logo-img" />
            </div>
            <div class="company-info">
              <div class="company-name">บริษัท ปตท. น้ำมันและการค้าปลีก จำกัด (มหาชน)</div>
              <div>555 ถนนวิภาวดีรังสิต แขวงจตุจักร เขตจตุจักร</div>
              <div>กรุงเทพมหานคร 10900</div>
              <div>โทร. 1365 &nbsp; ทะเบียนพาณิชย์ 0107561000013</div>
            </div>
          </div>

          <div class="doc-title">
            <h1>${title}</h1>
            <p>${subTitle}</p>
          </div>

          <div class="customer-info-grid">
            <div>
              <div class="info-row"><span class="info-label">นามลูกค้า</span> ${currentBranchName}</div>
              <div class="info-row"><span class="info-label">ที่อยู่</span> 1187 ถนน สุขาภิบาล 17 ตำบลบรบือ</div>
              <div class="info-row"><span class="info-label"></span> จังหวัดมหาสารคาม 44130</div>
              <div class="info-row"><span class="info-label">เบอร์โทร</span> 091-9535355</div>
              <div class="info-row"><span class="info-label">เลขผู้เสียภาษี</span> 1350200036462</div>
            </div>
            <div style="text-align: right;">
              <div class="info-row">เลขที่ &nbsp; ${order.orderNo}</div>
              <div class="info-row">วันที่ &nbsp; ${dateFormatter.format(new Date(order.orderDate))}</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 5%;">ลำดับ</th>
                <th style="width: 50%;">รายการ</th>
                <th style="width: 12%;">จำนวน</th>
                <th style="width: 15%;">ราคา/หน่วย</th>
                <th style="width: 18%;">จำนวนเงิน</th>
              </tr>
            </thead>
            <tbody>
              ${order.items.map((item, index) => `
                <tr>
                  <td class="text-center">${index + 1}.</td>
                  <td>
                    <div style="font-weight: bold; font-size: 11px;">น้ำมันเชื้อเพลิง ${item.oilType}</div>
                    <div style="font-size: 9px; margin-top: 2px; color: #333; line-height: 1.2;">
                      - รับจากคลัง ปตท.<br>
                      - เลขที่บิลอ้างอิง: ${order.billNo || '-'}
                    </div>
                  </td>
                  <td class="text-right">${item.quantity.toLocaleString()}</td>
                  <td class="text-right">${item.pricePerLiter > 0 ? item.pricePerLiter.toFixed(2) : '-'}</td>
                  <td class="text-right">${item.totalAmount > 0 ? item.totalAmount.toLocaleString() : '-'}</td>
                </tr>
              `).join('')}
              ${Array(Math.max(0, 5 - order.items.length)).fill(0).map(() => `
                <tr>
                  <td style="height: 25px; border-top: 1px solid #000;"></td>
                  <td style="border-top: 1px solid #000;"></td>
                  <td style="border-top: 1px solid #000;"></td>
                  <td style="border-top: 1px solid #000;"></td>
                  <td style="border-top: 1px solid #000;"></td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="summary-section">
            <div class="baht-text-box">${bahtText(grandTotal)}</div>
            <table class="summary-table">
              <tr><td class="summary-label">รวมเงิน</td><td class="text-right">${totalAmount > 0 ? totalAmount.toLocaleString() : '-'}</td></tr>
              <tr><td class="summary-label">ภาษีมูลค่าเพิ่ม</td><td class="text-right">-</td></tr>
              <tr><td class="summary-label">รวมเงินทั้งสิ้น</td><td class="text-right" style="font-weight: bold;">${grandTotal > 0 ? grandTotal.toLocaleString() : '-'}</td></tr>
            </table>
          </div>

          <div class="footer-signature">
            <div class="signature-box">
              <div style="margin-bottom: 25px;">ผู้รับของ (${currentBranchName})</div>
              <div>(......................................................)</div>
            </div>
            <div class="signature-box">
              <div style="margin-bottom: 25px;">ผู้ส่งของ (ปตท.)</div>
              <div>(......................................................)</div>
            </div>
          </div>

          <div class="bottom-contact">
            <div>Tel: 1365</div><div>Line: @PTTOR</div><div>E-mail: contact@pttor.com</div><div>www.pttor.com</div>
          </div>
        </div>
        <script>window.onload = function() { window.print(); };</script>
      </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
    }
  };

  // กรองรายการสั่งซื้อ ปตท. ที่ต้องรับน้ำมัน
  const pendingReceipts = useMemo(() => {
    return purchaseOrders.filter(order => {
      const isDeliverable = order.status === "กำลังขนส่ง";
      const matchSearch = order.orderNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (order.billNo || "").toLowerCase().includes(searchTerm.toLowerCase());
      
      // กรองตามสาขาที่เลือก หรือสาขาที่ผู้ใช้สังกัด
      const matchesBranch = selectedBranchIds.length === 0 || 
                           order.branches.some(b => selectedBranchIds.includes(b.branchId));

      return isDeliverable && matchSearch && matchesBranch;
    }).sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
  }, [purchaseOrders, searchTerm, selectedBranchIds]);

  // ประวัติการรับน้ำมัน
  const receiptHistory = useMemo(() => {
    return purchaseOrders.filter(order => {
      const isReceived = order.status === "ขนส่งสำเร็จ";
      const matchSearch = order.orderNo.toLowerCase().includes(searchTerm.toLowerCase());
      
      // กรองตามสาขาที่เลือก หรือสาขาที่ผู้ใช้สังกัด
      const matchesBranch = selectedBranchIds.length === 0 || 
                           order.branches.some(b => selectedBranchIds.includes(b.branchId));

      return isReceived && matchSearch && matchesBranch;
    }).sort((a, b) => new Date(b.deliveryDate || b.orderDate).getTime() - new Date(a.deliveryDate || a.orderDate).getTime());
  }, [purchaseOrders, searchTerm, selectedBranchIds]);

  const handleOpenReceiptModal = (order: PurchaseOrder) => {
    setSelectedOrder(order);
    
    // หาข้อมูลรายการสินค้าของสาขาปัจจุบัน (หรือสาขาแรกที่พบถ้าเลือก "ทั้งหมด")
    const myBranchInfo = order.branches.find(b => selectedBranchIds.includes(b.branchId)) || order.branches[0];
    
    setReceivedItems(myBranchInfo.items.map(item => ({
      oilType: item.oilType,
      quantity: item.quantity,
      unloadedQuantity: item.quantity,
      keptOnTruckQuantity: 0
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

    // อัปเดตสถานะ PO ปตท. ในระดับสาขา
    updatePurchaseOrder(selectedOrder.orderNo, {
      status: "ขนส่งสำเร็จ",
      deliveryDate: new Date().toISOString(),
      // ปรับปรุง logic เพื่อเก็บข้อมูลการรับของแต่ละสาขาใน PurchaseOrder.branches หากจำเป็น
    });

    setShowReceiptModal(false);
    setSelectedOrder(null);
    alert(`บันทึกการรับน้ำมันเข้าสาขา ${currentBranchName} สำเร็จ!`);
  };

  return (
    <div className="space-y-6 pb-20 p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200 dark:shadow-none">
            <ClipboardCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">รับน้ำมันจากคลัง (ปตท.)</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">บันทึกการรับน้ำมันที่ส่วนกลางสั่งซื้อจากคลัง ปตท. มาส่งที่สาขา</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white/50 dark:bg-gray-800/50 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm backdrop-blur-sm">
          <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            สาขาที่รับ: {currentBranchName}
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="ค้นหาเลขที่ PO ปตท., เลขที่บิล..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
        </div>
      </div>

      {/* Main Content Sections */}
      <div className="grid grid-cols-1 gap-8">
        {/* 1. รายการรอรับ (Pending) */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <Clock className="w-5 h-5 text-orange-500" />
            <h2 className="text-lg font-bold text-gray-800 dark:text-white">รายการที่อยู่ระหว่างขนส่งจากคลัง</h2>
            <span className="ml-2 px-2 py-0.5 bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 rounded-full text-xs font-bold">
              {pendingReceipts.length} รายการ
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingReceipts.length === 0 ? (
              <div className="col-span-full py-12 bg-gray-50 dark:bg-gray-900/50 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-800 flex flex-col items-center justify-center text-center">
                <PackageCheck className="w-12 h-12 text-gray-300 mb-3" />
                <p className="text-gray-500 dark:text-gray-400 font-medium">ไม่มีรายการน้ำมันรอรับจากคลังในขณะนี้</p>
              </div>
            ) : (
              pendingReceipts.map((order) => (
                <motion.div
                  key={order.orderNo}
                  layoutId={order.orderNo}
                  className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm hover:shadow-md transition-all group"
                >
                  {(() => {
                    const transport = getTransportInfo(order);
                    return (
                      <>
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">เลขที่ PO ปตท.</p>
                            <p className="text-lg font-black text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">{order.orderNo}</p>
                          </div>
                          <StatusTag variant="warning">กำลังขนส่ง</StatusTag>
                        </div>

                        <div className="space-y-3 mb-6">
                          <div className="flex items-center gap-3 text-sm">
                            <Building2 className="w-4 h-4 text-blue-500 shrink-0" />
                            <div>
                              <span className="text-gray-400">จากคลัง:</span>
                              <span className="ml-1.5 font-bold text-gray-700 dark:text-gray-200">ปตท. (PTT Depot)</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 text-sm">
                            <FileText className="w-4 h-4 text-emerald-500 shrink-0" />
                            <div>
                              <span className="text-gray-400">เลขที่บิล:</span>
                              <span className="ml-1.5 font-bold text-gray-700 dark:text-gray-200">{order.billNo || "-"}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 text-sm">
                            <Truck className="w-4 h-4 text-indigo-500 shrink-0" />
                            <div>
                              <span className="text-gray-400">ขนส่งโดย:</span>
                              <span className="ml-1.5 font-bold text-gray-700 dark:text-gray-200">{transport.transportNo}</span>
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
                              className="flex-1 py-1.5 bg-gray-50 dark:bg-gray-900 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[10px] font-bold rounded-lg border border-blue-100 dark:border-blue-800 transition-colors flex items-center justify-center gap-1.5"
                            >
                              <FileText className="w-3 h-3" /> เอกสาร PO
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownload("dn", order);
                              }}
                              className="flex-1 py-1.5 bg-gray-50 dark:bg-gray-900 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold rounded-lg border border-emerald-100 dark:border-emerald-800 transition-colors flex items-center justify-center gap-1.5"
                            >
                              <Truck className="w-3 h-3" /> เอกสาร DN
                            </button>
                          </div>
                        </div>

                        <button
                          onClick={() => handleOpenReceiptModal(order)}
                          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-100 dark:shadow-none active:scale-95"
                        >
                          <CheckCircle className="w-5 h-5" />
                          ยืนยันการรับน้ำมันเข้าคลัง
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
                    <th className="px-6 py-4">เลขที่ PO ปตท.</th>
                    <th className="px-6 py-4">เลขที่บิล</th>
                    <th className="px-6 py-4">วันที่รับ</th>
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
                      <tr key={order.orderNo} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                        <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">{order.orderNo}</td>
                        <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{order.billNo || "-"}</td>
                        <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1.5 text-blue-600 font-bold">
                              <Calendar className="w-3.5 h-3.5" />
                              {order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString('th-TH') : "-"}
                            </div>
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
              <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-blue-50 dark:bg-blue-900/20">
                <div>
                  <h2 className="text-xl font-bold text-blue-800 dark:text-blue-400 flex items-center gap-2">
                    <ClipboardCheck />
                    บันทึกรับน้ำมันจากคลัง ปตท.
                  </h2>
                  <p className="text-xs text-blue-600 dark:text-blue-500 font-bold mt-0.5">PO เลขที่: {selectedOrder.orderNo}</p>
                </div>
                <button onClick={() => setShowReceiptModal(false)} className="p-2 hover:bg-white dark:hover:bg-gray-700 rounded-full transition-colors">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-6">
                {/* Order Summary Info */}
                {(() => {
                  const transport = getTransportInfo(selectedOrder);
                  const totalLiters = selectedOrder.items.reduce((s: number, i: any) => s + i.quantity, 0);
                  
                  return (
                    <div className="space-y-4">
                      {/* External PO Info Box */}
                      <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                        <div className="flex items-center gap-2 mb-3 text-blue-600">
                          <FileText className="w-4 h-4" />
                          <span className="text-xs font-bold uppercase tracking-wider">ใบสั่งซื้อจาก ปตท. (External PO)</span>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4">
                          <div className="p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                            <span className="text-[10px] font-bold text-gray-400 uppercase block mb-1">ใบอนุมัติขายเลขที่</span>
                            <p className="font-bold text-gray-900 dark:text-white text-sm">{transport.approveNo}</p>
                          </div>
                          <div className="p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                            <span className="text-[10px] font-bold text-gray-400 uppercase block mb-1">เลขที่ออเดอร์</span>
                            <p className="font-bold text-gray-900 dark:text-white text-sm">{selectedOrder.orderNo}</p>
                          </div>
                          <div className="p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                            <span className="text-[10px] font-bold text-gray-400 uppercase block mb-1">รับเข้าที่สาขา</span>
                            <p className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">{currentBranchName}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-3">
                          <div className="flex items-center justify-between px-3">
                            <span className="text-xs text-gray-500 font-bold">จำนวนน้ำมันรวม: <span className="text-blue-600">{numberFormatter.format(totalLiters)} ลิตร</span></span>
                            <span className="text-xs text-gray-500 font-bold">จำนวนปั๊ม: <span className="text-blue-600">{transport.destinations.length || 1} ปั๊ม</span></span>
                          </div>
                        </div>

                        {/* Destinations */}
                        {transport.destinations.length > 0 && (
                          <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                            <span className="text-[10px] font-bold text-gray-400 uppercase block mb-2">ส่งให้ปั๊ม (ปลายทาง):</span>
                            <div className="flex flex-wrap gap-2">
                              {transport.destinations.map((name: string, idx: number) => (
                                <div key={idx} className="flex items-center gap-1.5 px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg text-[10px] font-bold border border-blue-100 dark:border-blue-800/50">
                                  <MapPin className="w-3 h-3" />
                                  {name}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Transport Info Box */}
                      <div className="grid grid-cols-3 gap-4 p-4 bg-indigo-50/30 dark:bg-indigo-900/10 rounded-2xl border border-indigo-100/50 dark:border-indigo-800/50">
                        <div className="col-span-3 flex items-center justify-between mb-1 pb-2 border-b border-indigo-100 dark:border-indigo-800/50">
                          <div className="flex items-center gap-2">
                            <Navigation className="w-4 h-4 text-indigo-600" />
                            <span className="text-xs font-bold text-indigo-600 dark:text-blue-400 uppercase tracking-wider">ข้อมูลรถขนส่ง</span>
                          </div>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">รถ: {transport.truckPlate}</span>
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">หาง: {transport.trailerPlate}</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">คนขับ</span>
                          <p className="font-bold text-gray-800 dark:text-white text-sm">{transport.driverName}</p>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">เลขไมล์</span>
                          <p className="font-bold text-gray-800 dark:text-white text-sm">{transport.odometer.toLocaleString()} กม.</p>
                        </div>
                        <div className="col-span-3 pt-2 border-t border-indigo-100/50 dark:border-indigo-800/50">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest inline-block mr-2">เลขที่ขนส่ง (TRANSPORT NO):</span>
                          <span className="font-bold text-blue-600 text-sm">{transport.transportNo}</span>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Entry Fields */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">รายการน้ำมันจากคลัง</span>
                    <span className="text-[10px] text-gray-400">* ตรวจสอบปริมาณรับจริงเข้าคลังไฮโซ</span>
                  </div>
                  
                  {receivedItems.map((item, index) => (
                    <div key={index} className="p-4 bg-white dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-8 bg-blue-500 rounded-full"></div>
                          <span className="font-black text-gray-800 dark:text-gray-200 text-lg">{item.oilType}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-bold text-gray-400 uppercase">สั่งจาก ปตท.</p>
                          <p className="font-bold text-gray-600">{numberFormatter.format(selectedOrder.items[index].quantity)} ลิตร</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label htmlFor={`unloaded-qty-${index}`} className="text-[10px] font-bold text-gray-400 uppercase">รับเข้าหลุม{currentBranchName} (ลิตร)</label>
                          <div className="relative">
                            <input
                              id={`unloaded-qty-${index}`}
                              type="number"
                              value={item.unloadedQuantity}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                const newItems = [...receivedItems];
                                newItems[index].unloadedQuantity = val;
                                newItems[index].quantity = val + newItems[index].keptOnTruckQuantity;
                                setReceivedItems(newItems);
                              }}
                              className="w-full pl-3 pr-10 py-2 bg-blue-50/20 border border-blue-100 rounded-lg font-bold text-blue-700 outline-none focus:ring-1 focus:ring-blue-500"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-blue-500/50">ลิตร</span>
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label htmlFor={`kept-qty-${index}`} className="text-[10px] font-bold text-indigo-600 uppercase">เหลืออยู่บนรถ (ลิตร)</label>
                          <div className="relative">
                            <input
                              id={`kept-qty-${index}`}
                              type="number"
                              value={item.keptOnTruckQuantity}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                const newItems = [...receivedItems];
                                newItems[index].keptOnTruckQuantity = val;
                                newItems[index].quantity = val + newItems[index].unloadedQuantity;
                                setReceivedItems(newItems);
                              }}
                              className="w-full pl-3 pr-10 py-2 bg-indigo-50/20 border border-indigo-100 rounded-lg font-bold text-indigo-700 outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-indigo-500/50">ลิตร</span>
                          </div>
                        </div>
                        <div className="space-y-1.5 md:col-span-2">
                          <label className="text-[10px] font-bold text-gray-400 uppercase">หลุมที่รับเข้า</label>
                          <select className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg font-bold text-sm outline-none">
                            <option>T-01 (คลัง{currentBranchName})</option>
                            <option>T-02 (คลัง{currentBranchName})</option>
                            <option>T-03 (คลัง{currentBranchName})</option>
                            <option>T-04 (คลัง{currentBranchName})</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-gray-50 dark:border-gray-700">
                        <div className="flex-1 space-y-1">
                          <p className="text-[10px] font-bold text-gray-400 uppercase">รวมที่ได้รับจริง</p>
                          <p className="text-xl font-black text-blue-600">{numberFormatter.format(item.quantity)} ลิตร</p>
                        </div>
                        
                        <div className="w-32 text-right">
                          <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">ส่วนต่างจาก ปตท.</p>
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
                    <label htmlFor="received-by-name" className="text-sm font-bold text-gray-500 uppercase tracking-wider">ชื่อผู้ตรวจสอบรับของ *</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        id="received-by-name"
                        type="text"
                        value={receivedByName}
                        onChange={(e) => setReceivedByName(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 dark:text-gray-300"
                        placeholder="ระบุชื่อ..."
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="receipt-note" className="text-sm font-bold text-gray-500 uppercase tracking-wider">หมายเหตุคลัง (ถ้ามี)</label>
                    <textarea
                      id="receipt-note"
                      value={receiptNote}
                      onChange={(e) => setReceiptNote(e.target.value)}
                      rows={1}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 resize-none text-gray-700 dark:text-gray-300"
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
                  className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 flex items-center gap-2 active:scale-95 transition-all"
                >
                  <Check className="w-5 h-5" />
                  ยืนยันการรับเข้าคลังและอัปเดตสต็อก
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
              <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-indigo-50 dark:bg-indigo-900/20">
                <div>
                  <h2 className="text-xl font-bold text-indigo-800 dark:text-indigo-400 flex items-center gap-2">
                    <Eye />
                    รายละเอียดการรับจากคลัง ปตท.
                  </h2>
                  <p className="text-xs text-indigo-600 dark:text-indigo-500 font-bold mt-0.5">PO: {selectedOrder.orderNo}</p>
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
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">ข้อมูลการสั่งซื้อ</span>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">วันที่สั่งซื้อ:</span>
                        <span className="font-bold">{dateFormatter.format(new Date(selectedOrder.orderDate))}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">เลขที่บิล ปตท:</span>
                        <span className="font-bold">{selectedOrder.billNo || "-"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-700">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">การรับสินค้า</span>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">วันที่รับจริง:</span>
                        <span className="font-bold text-blue-600">{selectedOrder.deliveryDate ? dateFormatter.format(new Date(selectedOrder.deliveryDate)) : "-"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">จุดรับเข้า:</span>
                        <span className="font-bold text-emerald-600">{currentBranchName}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-indigo-50/30 dark:bg-indigo-900/10 rounded-2xl border border-indigo-100/50 dark:border-indigo-800/50">
                  {(() => {
                    const transport = getTransportInfo(selectedOrder);
                    return (
                      <>
                        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-indigo-100 dark:border-indigo-800/50 text-indigo-600">
                          <Truck className="w-4 h-4" />
                          <span className="text-xs font-bold uppercase tracking-wider">ข้อมูลขนส่ง</span>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">เลขขนส่ง/บิล</p>
                            <p className="font-black text-gray-900 dark:text-white">{transport.transportNo}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">ทะเบียนรถ</p>
                            <p className="font-bold">{transport.truckPlate || "-"}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">พนักงานขับรถ</p>
                            <p className="font-bold">{transport.driverName}</p>
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>

                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2 text-sm uppercase tracking-wider">
                    <Droplet className="w-4 h-4 text-blue-500" /> รายการน้ำมันที่ได้รับจากคลัง
                  </h4>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-white dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                            <Droplet className="w-5 h-5 text-blue-500" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 dark:text-white">{item.oilType}</p>
                            <p className="text-[10px] text-gray-400">จำนวนที่สั่ง {numberFormatter.format(item.quantity)} ลิตร</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-black text-blue-600 dark:text-blue-400">{numberFormatter.format(item.quantity)} ลิตร</p>
                          <p className="text-[10px] text-gray-400 font-bold">{currencyFormatter.format(item.totalAmount)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDownload("po", selectedOrder)}
                    className="px-4 py-2 bg-white dark:bg-gray-800 text-blue-600 border border-blue-200 rounded-xl text-xs font-bold hover:bg-blue-50 transition-all flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4" /> พิมพ์ PO
                  </button>
                  <button
                    onClick={() => handleDownload("dn", selectedOrder)}
                    className="px-4 py-2 bg-white dark:bg-gray-800 text-emerald-600 border border-emerald-200 rounded-xl text-xs font-bold hover:bg-emerald-50 transition-all flex items-center gap-2"
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
