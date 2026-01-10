import { useState, useMemo } from "react";
import {
  CreditCard,
  Search,
  X,
  Droplet,
  FileText,
  Building2,
  Clock,
  Eye,
  DollarSign,
  Wallet,
  Upload,
  Check,
  AlertCircle,
  Navigation,
  MapPin,
  Download,
  Receipt
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useGasStation } from "@/contexts/GasStationContext";
import { useBranch } from "@/contexts/BranchContext";
import { InternalPumpSale, Branch } from "@/types/gasStation";
import StatusTag from "@/components/StatusTag";
import TableActionMenu from "@/components/TableActionMenu";
import { convertNumberToThaiWords } from "@/utils/numberToThaiWords";

export default function InternalOilPayment() {
  const { allInternalPumpSales, recordInternalPayment, branches } = useGasStation();
  const { selectedBranches } = useBranch();

  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"pending" | "completed">("pending");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedSale, setSelectedSale] = useState<InternalPumpSale | null>(null);

  // Form State for payment
  const [paymentForm, setPaymentForm] = useState({
    amount: 0,
    paymentDate: new Date().toISOString().split("T")[0],
    paymentTime: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', hour12: false }),
    method: "เงินโอน" as "เงินสด" | "เงินโอน" | "เครดิต" | "อื่นๆ",
    bank: "",
    slipImage: null as string | null,
    notes: ""
  });

  const selectedBranchIds = useMemo(() => selectedBranches.map(id => Number(id)), [selectedBranches]);

  const currencyFormatter = useMemo(() => new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
  }), []);

  // กรองตามสาขาที่เลือก - แสดงว่าสาขาที่เลือกติดหนี้สาขาไหนบ้าง
  // ถ้าเลือกปั้มดินดำ แสดงว่าปั้มดินดำติดหนี้ปั้มไหนบ้าง (กรองตาม buyerBranchId = สาขาที่เลือก)
  const myPurchases = useMemo(() => {
    return allInternalPumpSales.filter(sale => {
      // กรองตามสาขาที่เลือกเป็นผู้ซื้อ (buyer) - แสดงว่าสาขาที่เลือกติดหนี้สาขาไหนบ้าง
      const matchesBranchFilter = selectedBranchIds.length === 0 || selectedBranchIds.includes(sale.buyerBranchId || 0);
      
      const matchesSearch = 
        sale.saleNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.branchName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (sale.buyerBranchName || "").toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesTab = activeTab === "pending" 
        ? (sale.totalAmount > (sale.paidAmount || 0) && sale.status === "ปกติ")
        : (sale.totalAmount <= (sale.paidAmount || 0) || sale.status === "ยกเลิก");

      return matchesBranchFilter && matchesSearch && matchesTab;
    }).sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime());
  }, [allInternalPumpSales, searchTerm, selectedBranchIds, activeTab]);

  const stats = useMemo(() => {
    // กรองเฉพาะรายการที่สาขาที่เลือกเป็นผู้ซื้อ (buyer/debtor)
    const relevantSales = allInternalPumpSales.filter(s => 
      selectedBranchIds.length === 0 || selectedBranchIds.includes(s.buyerBranchId || 0)
    );
    
    const pending = relevantSales.filter(s => 
      s.totalAmount > (s.paidAmount || 0) && 
      s.status === "ปกติ"
    );
    
    // หาชื่อสาขาที่เลือก (ผู้ซื้อ/ลูกหนี้) - สาขาที่ติดหนี้
    let buyerBranchName: string;
    if (selectedBranchIds.length === 1) {
      const selectedBranch = branches.find((b: Branch) => b.id === selectedBranchIds[0]);
      buyerBranchName = selectedBranch?.name || "ไม่พบข้อมูลสาขา";
    } else if (selectedBranchIds.length === 0) {
      buyerBranchName = "ทุกสาขาที่รับผิดชอบ";
    } else {
      // ถ้าเลือกหลายสาขา แสดงสาขาแรก
      const firstBranch = branches.find((b: Branch) => b.id === selectedBranchIds[0]);
      buyerBranchName = firstBranch?.name || "หลายสาขา";
    }
    
    return {
      pendingCount: pending.length,
      pendingAmount: pending.reduce((sum, s) => sum + (s.totalAmount - (s.paidAmount || 0)), 0),
      buyerBranchName: buyerBranchName, // แสดงสาขาที่เลือกเป็นผู้ซื้อ (ลูกหนี้)
    };
  }, [allInternalPumpSales, selectedBranchIds, branches]);

  const handleOpenPayment = (sale: InternalPumpSale) => {
    setSelectedSale(sale);
    setPaymentForm({
      amount: sale.totalAmount - (sale.paidAmount || 0),
      paymentDate: new Date().toISOString().split("T")[0],
      paymentTime: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', hour12: false }),
      method: "เงินโอน",
      bank: "",
      slipImage: null,
      notes: ""
    });
    setShowPaymentModal(true);
  };

  const handleConfirmPayment = () => {
    if (!paymentForm.amount || paymentForm.amount <= 0) {
      alert("กรุณาระบุยอดเงินที่ถูกต้อง");
      return;
    }
    
    if (selectedSale) {
      recordInternalPayment(
        selectedSale.id,
        paymentForm.amount,
        paymentForm.method,
        paymentForm.notes
      );
      alert("ชำระเงินเรียบร้อยแล้ว ระบบได้ออกใบกำกับภาษีให้คุณโดยอัตโนมัติ");
      setShowPaymentModal(false);
    }
  };

  const handleDownloadTaxInvoice = (sale: InternalPumpSale, invoice: { invoiceNo: string; date: string; amount: number }) => {
    // หาข้อมูลสาขา
    const buyerBranch = branches.find(b => b.id === sale.buyerBranchId);

    const dateFormatter = new Intl.DateTimeFormat('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const invoiceDate = new Date(invoice.date);
    const formattedDate = dateFormatter.format(invoiceDate);

    // คำนวณภาษีมูลค่าเพิ่ม (7%)
    // สำหรับการชำระเงินบางส่วน ให้คำนวณ VAT จากยอดที่ชำระ
    const vatRate = 0.07;
    const amountBeforeVat = invoice.amount / (1 + vatRate);
    const vatAmount = invoice.amount - amountBeforeVat;
    
    // สำหรับการชำระบางส่วน ต้องแสดงเฉพาะรายการที่ชำระไป
    // แต่ในใบกำกับภาษีนี้จะแสดงเฉพาะยอดที่ชำระไปในครั้งนี้

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="th">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>ใบกำกับภาษี - ${invoice.invoiceNo}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;700&display=swap');
          * { box-sizing: border-box; -webkit-print-color-adjust: exact; margin: 0; padding: 0; }
          @page { size: A4; margin: 15mm; }
          body { 
            font-family: 'Sarabun', sans-serif; 
            padding: 0; 
            color: #000; 
            line-height: 1.4;
            background-color: white;
            font-size: 14px;
          }
          
          .page-container {
            padding: 15mm;
            max-width: 210mm;
            margin: 0 auto;
          }

          .header-section {
            text-align: center;
            margin-bottom: 15px;
            border-bottom: 2px solid #000;
            padding-bottom: 10px;
          }
          
          .company-name {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 5px;
          }
          
          .company-info {
            font-size: 14px;
            line-height: 1.6;
          }

          .document-title {
            text-align: center;
            margin: 15px 0;
            font-size: 18px;
            font-weight: bold;
          }

          .document-info {
            text-align: right;
            margin-bottom: 15px;
            font-size: 14px;
          }

          .customer-info-section {
            margin-bottom: 15px;
            font-size: 14px;
          }

          .info-row {
            margin-bottom: 4px;
            line-height: 1.6;
          }

          .info-label {
            font-weight: bold;
            display: inline-block;
            width: 120px;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
            font-size: 14px;
          }

          th, td {
            border: 1px solid #000;
            padding: 8px;
            text-align: left;
          }

          th {
            background-color: #f0f0f0;
            font-weight: bold;
            text-align: center;
          }

          .text-center {
            text-align: center;
          }

          .text-right {
            text-align: right;
          }

          .summary-section {
            margin-top: 10px;
            display: flex;
            justify-content: flex-end;
          }

          .summary-table {
            width: 400px;
            border-collapse: collapse;
          }

          .summary-table td {
            padding: 6px 10px;
            border: 1px solid #000;
          }

          .summary-label {
            text-align: right;
            font-weight: bold;
            width: 60%;
          }

          .summary-value {
            text-align: right;
            width: 40%;
          }

          .total-row {
            font-weight: bold;
            font-size: 16px;
          }

          .amount-in-words {
            margin-top: 10px;
            padding: 8px;
            border: 1px solid #000;
            text-align: center;
            font-weight: bold;
            font-size: 14px;
            min-height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .footer-section {
            margin-top: 30px;
            text-align: right;
            font-size: 14px;
          }

          .signature-line {
            border-top: 1px solid #000;
            margin-top: 40px;
            padding-top: 5px;
            display: inline-block;
            min-width: 200px;
          }

          @media print {
            body { padding: 0; }
            .page-container { padding: 15mm; }
            @page { margin: 15mm; size: A4; }
          }
        </style>
      </head>
      <body>
        <div class="page-container">
          <div class="header-section">
            <div class="company-name">PTT STATION</div>
            <div class="company-info">
              1187 ถนน สุขาภิบาล 17 ตำบลบรบือ<br>
              อำเภอบรบือ จังหวัดมหาสารคาม 44130<br>
              โทร. 091-9535355 &nbsp; ทะเบียนพาณิชย์ 1350200036462
            </div>
          </div>

          <div class="document-title">ใบเสร็จรับเงิน</div>

          <div class="document-info">
            <div>เลขที่ ${invoice.invoiceNo.replace('INV-', '')} &nbsp; เล่มที่ 4</div>
            <div>วันที่ ${formattedDate}</div>
          </div>

          <div class="customer-info-section">
            <div class="info-row">
              <span class="info-label">นามลูกค้า</span>
              ${buyerBranch?.name || sale.buyerBranchName || '-'}
            </div>
            <div class="info-row">
              <span class="info-label">ที่อยู่</span>
              ${buyerBranch?.id === 1 ? 'อำเภอเมืองมหาสารคาม จังหวัดมหาสารคาม 44000' : (buyerBranch?.address ? `${buyerBranch.address} อำเภอบรบือ จังหวัดมหาสารคาม 44130` : 'อำเภอบรบือ จังหวัดมหาสารคาม 44130')}
            </div>
            <div class="info-row">
              <span class="info-label">เบอร์โทร</span>
              ${buyerBranch?.code === 'HQ' ? '043-123456' : '091-9535355'}
            </div>
            <div class="info-row">
              <span class="info-label">เลขผู้เสียภาษี</span>
              ${buyerBranch?.id === 1 ? '1350200036462' : (buyerBranch?.id === 2 ? '1350200036463' : '............................................')}
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 5%;">ลำดับ</th>
                <th style="width: 55%;">รายการ</th>
                <th style="width: 15%;">จำนวน</th>
                <th style="width: 12%;">ราคา/หน่วย</th>
                <th style="width: 13%;">จำนวนเงิน</th>
              </tr>
            </thead>
            <tbody>
              ${sale.items.map((item, idx) => {
                // สำหรับการชำระบางส่วน ให้คำนวณสัดส่วนที่ชำระ
                const paymentRatio = invoice.amount / sale.totalAmount;
                const paidQuantity = Math.round(item.quantity * paymentRatio);
                const paidAmount = item.totalAmount * paymentRatio;
                
                return `
                <tr>
                  <td class="text-center">${idx + 1}</td>
                  <td>${item.oilType}${paymentRatio < 1 ? ` (ชำระบางส่วน)` : ''}</td>
                  <td class="text-right">${paymentRatio < 1 ? paidQuantity.toLocaleString('th-TH') : item.quantity.toLocaleString('th-TH')} ลิตร</td>
                  <td class="text-right">${item.pricePerLiter.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td class="text-right">${(paymentRatio < 1 ? paidAmount : item.totalAmount).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                </tr>
              `;
              }).join('')}
              <tr>
                <td colspan="4" class="text-right summary-label">รวมเงิน</td>
                <td class="text-right">${amountBeforeVat.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>
              <tr>
                <td colspan="4" class="text-right summary-label">ภาษีมูลค่าเพิ่ม (7%)</td>
                <td class="text-right">${vatAmount.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>
              <tr class="total-row">
                <td colspan="4" class="text-right">รวมเงินทั้งสิ้น</td>
                <td class="text-right">${invoice.amount.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>
            </tbody>
          </table>

          <div class="amount-in-words">
            (${convertNumberToThaiWords(invoice.amount)})
          </div>

          <div class="footer-section">
            <div class="signature-line">
              ผู้รับเงิน
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ใบกำกับภาษี_${invoice.invoiceNo}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      {/* Header */}
      <header className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
              <div className="p-2 bg-rose-500 rounded-2xl shadow-lg shadow-rose-500/20">
                <CreditCard className="w-8 h-8 text-white" />
              </div>
              ชำระค่าน้ำมัน (ภายใน)
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium flex items-center gap-2">
              <Wallet className="w-4 h-4" />
              จัดการยอดค้างชำระจากการสั่งซื้อน้ำมันระหว่างสาขา
            </p>
          </div>
          
          <div className="flex bg-white dark:bg-gray-800 p-1 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <button
              onClick={() => setActiveTab("pending")}
              className={`px-6 py-2 rounded-xl text-sm font-black transition-all ${
                activeTab === "pending" 
                  ? "bg-rose-500 text-white shadow-lg shadow-rose-500/20" 
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              รายการที่ต้องชำระ
            </button>
            <button
              onClick={() => setActiveTab("completed")}
              className={`px-6 py-2 rounded-xl text-sm font-black transition-all ${
                activeTab === "completed" 
                  ? "bg-rose-500 text-white shadow-lg shadow-rose-500/20" 
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              ประวัติการชำระ
            </button>
          </div>
        </div>
      </header>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-6"
        >
          <div className="p-4 bg-rose-50 dark:bg-rose-900/20 rounded-2xl">
            <AlertCircle className="w-8 h-8 text-rose-500" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">ยอดค้างชำระรวม</p>
            <p className="text-3xl font-black text-gray-900 dark:text-white">{currencyFormatter.format(stats.pendingAmount)}</p>
            <p className="text-sm font-bold text-rose-500 mt-1">{stats.pendingCount} รายการที่รอการชำระ</p>
          </div>
        </motion.div>
        
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-3xl shadow-xl shadow-blue-500/20 flex items-center justify-between text-white">
          <div className="space-y-1">
            <p className="text-xs font-bold text-blue-100 uppercase tracking-widest">สาขาที่สั่งซื้อ</p>
            <p className="text-2xl font-black">
              {stats.buyerBranchName}
            </p>
            <p className="text-blue-200 text-sm font-medium flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              ตรวจสอบยอดหนี้และแจ้งชำระเงิน
            </p>
          </div>
          <div className="opacity-20">
            <Building2 className="w-20 h-20" />
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm mb-6 flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="ค้นหาเลขที่บิล หรือ ชื่อสาขาผู้ขาย..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-rose-500 outline-none text-gray-900 dark:text-white font-medium"
          />
        </div>
      </div>

      {/* Payment List */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-gray-900/50 text-[10px] uppercase tracking-widest font-black text-gray-400">
                <th className="px-6 py-4">วันที่บิล / เลขที่บิล</th>
                <th className="px-6 py-4">สาขาผู้ขาย (เจ้าหนี้)</th>
                <th className="px-6 py-4">ประเภทรายการ</th>
                <th className="px-6 py-4 text-right">ยอดเงินรวม</th>
                <th className="px-6 py-4 text-right text-emerald-600">ชำระแล้ว</th>
                <th className="px-6 py-4 text-right font-black text-rose-500">ยอดคงค้าง</th>
                <th className="px-6 py-4 text-center">การชำระเงิน</th>
                <th className="px-6 py-4 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700 font-medium">
              {myPurchases.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-400 italic font-medium">
                    <div className="flex flex-col items-center gap-2">
                      <CreditCard className="w-8 h-8 opacity-20" />
                      ไม่พบรายการสั่งซื้อที่ต้องชำระ
                    </div>
                  </td>
                </tr>
              ) : (
                myPurchases.map((sale) => {
                  const unpaid = sale.totalAmount - (sale.paidAmount || 0);
                  return (
                    <tr key={sale.id} className="group hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="px-6 py-4 text-sm">
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-900 dark:text-white">
                            {new Date(sale.saleDate).toLocaleDateString('th-TH')}
                          </span>
                          <span className="text-[10px] font-black text-blue-600 uppercase tracking-tighter flex items-center gap-1 mt-0.5">
                            <FileText className="w-3 h-3" />
                            {sale.saleNo}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-900 flex items-center justify-center border border-gray-200 dark:border-gray-700">
                            <Building2 className="w-4 h-4 text-blue-500" />
                          </div>
                          <span className="font-bold text-gray-700 dark:text-gray-300">{sale.branchName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${
                          sale.saleType.includes("ค้างรถ") 
                            ? "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400"
                            : "bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-900/20 dark:text-purple-400"
                        }`}>
                          {sale.saleType}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-black text-gray-900 dark:text-white">
                        {currencyFormatter.format(sale.totalAmount)}
                      </td>
                      <td className="px-6 py-4 text-right text-emerald-600 font-bold">
                        {currencyFormatter.format(sale.paidAmount || 0)}
                      </td>
                      <td className="px-6 py-4 text-right font-black text-rose-500">
                        {currencyFormatter.format(unpaid)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {sale.paymentRequestStatus === "pending" ? (
                          <StatusTag variant="warning">รอตรวจสอบ</StatusTag>
                        ) : sale.totalAmount <= (sale.paidAmount || 0) ? (
                          <StatusTag variant="success">ชำระครบแล้ว</StatusTag>
                        ) : (
                          <button
                            onClick={() => handleOpenPayment(sale)}
                            className="px-4 py-1.5 bg-rose-500 hover:bg-rose-600 text-white text-[10px] font-black rounded-lg transition-colors shadow-sm"
                          >
                            แจ้งชำระเงิน
                          </button>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          <TableActionMenu
                            actions={[
                              {
                                label: "ดูรายละเอียด",
                                icon: Eye,
                                onClick: () => {
                                  setSelectedSale(sale);
                                  setShowDetailModal(true);
                                }
                              },
                              {
                                label: "แจ้งชำระเงิน",
                                icon: DollarSign,
                                hidden: unpaid <= 0,
                                variant: "primary",
                                onClick: () => handleOpenPayment(sale)
                              },
                              {
                                label: "พิมพ์ใบสั่งซื้อ",
                                icon: FileText,
                                onClick: () => alert("กำลังสร้างไฟล์...")
                              }
                            ]}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Modal */}
      <AnimatePresence>
        {showPaymentModal && selectedSale && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm font-medium">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[95vh]"
            >
              <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-rose-50 dark:bg-rose-900/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-rose-500 rounded-xl">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-rose-800 dark:text-rose-400">แจ้งชำระค่าน้ำมัน</h2>
                    <p className="text-xs text-rose-600 dark:text-rose-500 font-bold">อ้างอิงบิลเลขที่: {selectedSale.saleNo}</p>
                  </div>
                </div>
                <button onClick={() => setShowPaymentModal(false)} className="p-2 hover:bg-white dark:hover:bg-gray-700 rounded-full transition-colors">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-6">
                {/* Sale Summary Summary */}
                <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 flex items-center justify-between">
                  <div className="space-y-1 text-sm">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">สาขาเจ้าหนี้ (ผู้ขาย)</p>
                    <p className="font-black text-gray-800 dark:text-white flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-blue-500" />
                      {selectedSale.branchName}
                    </p>
                  </div>
                  <div className="text-right space-y-1 text-sm">
                    <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest">ยอดที่ต้องชำระ (คงเหลือ)</p>
                    <p className="text-2xl font-black text-rose-600">
                      {currencyFormatter.format(selectedSale.totalAmount - (selectedSale.paidAmount || 0))}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="payment-amount" className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">ยอดเงินที่ชำระ (บาท)</label>
                    <input
                      id="payment-amount"
                      type="number"
                      value={paymentForm.amount}
                      onChange={(e) => setPaymentForm(prev => ({ ...prev, amount: Number(e.target.value) }))}
                      className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-2xl font-black text-xl text-emerald-600 outline-none focus:border-rose-500 transition-colors"
                    />
                  </div>
                  <div className="space-y-2 text-sm">
                    <label htmlFor="payment-date" className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">วันที่และเวลาที่ชำระ</label>
                    <div className="flex gap-2 font-bold">
                      <input
                        id="payment-date"
                        type="date"
                        value={paymentForm.paymentDate}
                        onChange={(e) => setPaymentForm(prev => ({ ...prev, paymentDate: e.target.value }))}
                        className="flex-[2] px-4 py-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl outline-none"
                      />
                      <input
                        id="payment-time"
                        type="time"
                        value={paymentForm.paymentTime}
                        onChange={(e) => setPaymentForm(prev => ({ ...prev, paymentTime: e.target.value }))}
                        className="flex-1 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">ช่องทางการชำระเงิน</span>
                  <div className="grid grid-cols-3 gap-2">
                    {(["เงินสด", "เงินโอน", "อื่นๆ"] as const).map((m: "เงินสด" | "เงินโอน" | "เครดิต" | "อื่นๆ") => (
                      <button
                        key={m}
                        onClick={() => setPaymentForm(prev => ({ ...prev, method: m }))}
                        className={`py-3 rounded-2xl text-[10px] font-black transition-all border ${
                          paymentForm.method === m 
                            ? "bg-rose-500 text-white border-rose-500 shadow-lg shadow-rose-500/20" 
                            : "bg-white dark:bg-gray-800 text-gray-400 border-gray-100 dark:border-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">หลักฐานการโอนเงิน (Slip)</span>
                  <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-3xl p-8 flex flex-col items-center justify-center gap-4 hover:border-rose-500 transition-colors cursor-pointer bg-gray-50/50 dark:bg-gray-900/50 group">
                    <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm group-hover:scale-110 transition-transform">
                      <Upload className="w-8 h-8 text-gray-400 group-hover:text-rose-500" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-black text-gray-600 dark:text-gray-300">คลิกเพื่ออัปโหลดรูปภาพหลักฐาน</p>
                      <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-tighter">JPG, PNG, PDF ไม่เกิน 5MB</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <label htmlFor="payment-notes" className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">หมายเหตุเพิ่มเติม</label>
                  <textarea
                    id="payment-notes"
                    value={paymentForm.notes}
                    onChange={(e) => setPaymentForm(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="ระบุหมายเหตุการโอนเงิน (ถ้ามี)"
                    className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl outline-none focus:border-rose-500 transition-colors h-24 resize-none"
                  />
                </div>
              </div>

              <div className="p-6 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700 flex gap-3">
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 px-6 py-4 bg-white dark:bg-gray-800 text-gray-500 font-black rounded-2xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 transition-all uppercase tracking-widest text-sm"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleConfirmPayment}
                  className="flex-[2] px-6 py-4 bg-rose-500 text-white font-black rounded-2xl shadow-xl shadow-rose-500/30 hover:bg-rose-600 transition-all active:scale-95 uppercase tracking-widest text-sm flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  ยืนยันการชำระเงิน
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Detail Modal (Modern UI matching image) */}
      <AnimatePresence>
        {showDetailModal && selectedSale && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-blue-50 dark:bg-blue-900/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-600 rounded-xl shadow-lg">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-blue-800 dark:text-blue-400 uppercase tracking-tight">รายละเอียดรายการธุรกรรมภายใน</h2>
                    <p className="text-xs text-blue-600 dark:text-blue-500 font-bold">อ้างอิง: {selectedSale.saleNo}</p>
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
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">ยอดรวมธุรกรรม</span>
                    <p className="text-2xl font-black text-gray-900 dark:text-white">{currencyFormatter.format(selectedSale.totalAmount)}</p>
                  </div>
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100 dark:border-emerald-800/50">
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest block mb-1">ชำระแล้ว</span>
                    <p className="text-2xl font-black text-emerald-600">{currencyFormatter.format(selectedSale.paidAmount || 0)}</p>
                  </div>
                  <div className="p-4 bg-rose-50 dark:bg-rose-900/10 rounded-2xl border border-rose-100 dark:border-rose-800/50">
                    <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest block mb-1">ยอดค้างชำระ</span>
                    <p className="text-2xl font-black text-rose-600">{currencyFormatter.format(selectedSale.totalAmount - (selectedSale.paidAmount || 0))}</p>
                  </div>
                </div>

                {/* Branches Info */}
                <div className="flex flex-col md:flex-row items-center gap-4 bg-blue-50/30 dark:bg-blue-900/10 p-6 rounded-3xl border border-blue-100 dark:border-blue-800/50 relative">
                  <div className="flex-1 text-center md:text-left space-y-1">
                    <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest block">สาขาต้นทาง (ผู้ขาย)</span>
                    <p className="text-lg font-black text-gray-900 dark:text-white flex items-center justify-center md:justify-start gap-2">
                      <Building2 className="w-5 h-5 text-emerald-500" />
                      {selectedSale.branchName}
                    </p>
                  </div>
                  <div className="flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg">
                      <Navigation className="w-5 h-5 rotate-90" />
                    </div>
                  </div>
                  <div className="flex-1 text-center md:text-right space-y-1 font-bold">
                    <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest block">สาขาปลายทาง (ผู้ซื้อ)</span>
                    <p className="text-lg font-black text-gray-900 dark:text-white flex items-center justify-center md:justify-end gap-2 uppercase">
                      {selectedSale.buyerBranchName || "ปั๊มไฮโซ"}
                      <MapPin className="w-5 h-5 text-rose-500" />
                    </p>
                  </div>
                </div>

                {/* Oil Details */}
                <div className="space-y-3 font-bold">
                  <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest flex items-center gap-2 px-1">
                    <Droplet className="w-4 h-4 text-blue-500" />
                    รายการน้ำมันในธุรกรรม
                  </h3>
                  <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-3xl overflow-hidden shadow-sm">
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-gray-800/50">
                        <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                          <th className="px-6 py-4 text-left">ชนิดน้ำมัน</th>
                          <th className="px-6 py-4 text-right">จำนวน</th>
                          <th className="px-6 py-4 text-right">ราคา/ลิตร</th>
                          <th className="px-6 py-4 text-right">รวมเป็นเงิน</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                        {selectedSale.items.map((item, idx) => (
                          <tr key={idx}>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3 font-bold">
                                <div className="w-2 h-8 bg-blue-500 rounded-full"></div>
                                <span className="font-black text-gray-800 dark:text-gray-200">{item.oilType}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right text-gray-700 dark:text-gray-300">{item.quantity.toLocaleString()} ลิตร</td>
                            <td className="px-6 py-4 text-right text-blue-600 dark:text-blue-400">{currencyFormatter.format(item.pricePerLiter)}</td>
                            <td className="px-6 py-4 text-right font-black text-gray-900 dark:text-white">{currencyFormatter.format(item.totalAmount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Timeline & Invoices */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-bold">
                  <div className="space-y-4">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-500" />
                      ประวัติการชำระเงิน
                    </h3>
                    <div className="space-y-3">
                      {(!selectedSale.paymentHistory || selectedSale.paymentHistory.length === 0) ? (
                        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                          ไม่มีประวัติการชำระเงิน
                        </div>
                      ) : (
                        selectedSale.paymentHistory.map((pay, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100 dark:border-emerald-800/50 shadow-sm">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
                                <Check className="w-4 h-4" />
                              </div>
                              <div>
                                <p className="text-xs font-black text-gray-800 dark:text-gray-200">{pay.method || 'เงินโอน'}</p>
                                <p className="text-[10px] font-bold text-gray-400">{new Date(pay.date).toLocaleDateString('th-TH')}</p>
                              </div>
                            </div>
                            <span className="font-black text-emerald-600">+{currencyFormatter.format(pay.amount)}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                      <Receipt className="w-4 h-4 text-emerald-500" />
                      ใบกำกับภาษี / เอกสารอ้างอิง
                    </h3>
                    <div className="space-y-3">
                      {(!selectedSale.taxInvoices || selectedSale.taxInvoices.length === 0) ? (
                        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                          ยังไม่มีการออกใบกำกับภาษี
                        </div>
                      ) : (
                        selectedSale.taxInvoices.map((inv, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-800/50 shadow-sm">
                            <div className="flex items-center gap-3 flex-1">
                              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/20">
                                <FileText className="w-4 h-4" />
                              </div>
                              <div className="flex-1">
                                <p className="text-xs font-black text-gray-800 dark:text-gray-200">{inv.invoiceNo}</p>
                                <p className="text-[10px] font-bold text-gray-400">{new Date(inv.date).toLocaleDateString('th-TH')}</p>
                                <p className="text-[10px] font-bold text-blue-600 mt-0.5">{currencyFormatter.format(inv.amount)}</p>
                              </div>
                            </div>
                            <button 
                              onClick={() => handleDownloadTaxInvoice(selectedSale, inv)}
                              className="p-2 hover:bg-white dark:hover:bg-gray-800 rounded-lg transition-colors text-blue-600"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                        ))
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
                <button
                  onClick={() => {
                    if (selectedSale && selectedSale.taxInvoices && selectedSale.taxInvoices.length > 0) {
                      // ดาวน์โหลดใบกำกับภาษีล่าสุด
                      const latestInvoice = selectedSale.taxInvoices[selectedSale.taxInvoices.length - 1];
                      handleDownloadTaxInvoice(selectedSale, latestInvoice);
                    } else {
                      alert("ยังไม่มีใบกำกับภาษีสำหรับรายการนี้");
                    }
                  }}
                  className="flex-1 px-6 py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-600/30 hover:bg-blue-700 transition-all active:scale-95 uppercase tracking-widest text-sm flex items-center justify-center gap-2"
                  disabled={!selectedSale || !selectedSale.taxInvoices || selectedSale.taxInvoices.length === 0}
                >
                  <Download className="w-5 h-5" />
                  ดาวน์โหลดใบกำกับภาษี
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

