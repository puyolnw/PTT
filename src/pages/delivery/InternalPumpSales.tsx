import { useState, useMemo, useEffect } from "react";
import {
  History,
  Search,
  CheckCircle,
  X,
  Droplet,
  FileText,
  Building2,
  Calendar,
  Clock,
  User,
  Eye,
  Plus,
  Trash2,
  CreditCard,
  DollarSign,
  Wallet,
  Tag,
  Briefcase,
  Filter,
  Download,
  MapPin,
  Check,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Receipt,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useGasStation } from "@/contexts/GasStationContext";
import { useBranch } from "@/contexts/BranchContext";
import { useAuth } from "@/contexts/AuthContext";
import { InternalPumpSale, OilType } from "@/types/gasStation";
import StatusTag, { getStatusVariant } from "@/components/StatusTag";
import TableActionMenu from "@/components/TableActionMenu";
import { convertNumberToThaiWords } from "@/utils/numberToThaiWords";

export default function InternalPumpSales() {
  const {
    internalPumpSales, 
    addInternalPumpSale, 
    cancelInternalPumpSale,
    getNextRunningNumber,
    branches
  } = useGasStation();
  const { selectedBranches } = useBranch();
  const { user } = useAuth();

  const [searchTerm, setSearchTerm] = useState("");
  const [columnFilters, setColumnFilters] = useState<{
    saleType: string;
    buyerBranch: string;
    status: string;
    paymentRequestStatus: string;
  }>({
    saleType: "ทั้งหมด",
    buyerBranch: "ทั้งหมด",
    status: "ทั้งหมด",
    paymentRequestStatus: "ทั้งหมด"
  });
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' | null }>({ key: 'recordedAt', direction: 'desc' });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedSale, setSelectedSale] = useState<InternalPumpSale | null>(null);

  // Form State for new sale
  const [newSale, setNewSale] = useState<{
    branchId: number;
    buyerBranchId: number;
    saleDate: string;
    saleType: "🚚 ขายน้ำมันค้างรถ" | "💉 ขายน้ำมันจากการดูด" | "📦 ขายจากคลัง";
    items: Array<{
    oilType: OilType;
      quantity: number;
      pricePerLiter: number;
      totalAmount: number;
    }>;
    paymentMethod: "เงินสด" | "เงินโอน" | "เครดิต" | "อื่นๆ";
    customerName: string;
    customerType: "ทั่วไป" | "สมาชิก" | "รถบริษัท";
    notes: string;
  }>({
    branchId: 0,
    buyerBranchId: 0,
    saleDate: new Date().toISOString().split("T")[0],
    saleType: "🚚 ขายน้ำมันค้างรถ",
    items: [{ oilType: "Diesel", quantity: 0, pricePerLiter: 0, totalAmount: 0 }],
    paymentMethod: "เงินสด",
    customerName: "",
    customerType: "ทั่วไป",
    notes: ""
  });

  const selectedBranchIds = useMemo(() => selectedBranches.map(id => Number(id)), [selectedBranches]);

  // Initial branch selection
  useEffect(() => {
    if (selectedBranchIds.length > 0) {
      setNewSale(prev => ({ ...prev, branchId: selectedBranchIds[0] }));
    } else if (branches.length > 0) {
      setNewSale(prev => ({ ...prev, branchId: branches[0].id }));
    }
  }, [selectedBranchIds, branches]);

  const numberFormatter = useMemo(() => new Intl.NumberFormat("th-TH"), []);
  const currencyFormatter = useMemo(() => new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
  }), []);

  const filteredSales = useMemo(() => {
    let result = internalPumpSales.filter(sale => {
      const matchesSearch = 
        sale.saleNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.items.some(item => item.oilType.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesBranch = selectedBranchIds.length === 0 || selectedBranchIds.includes(sale.branchId);
      
      // Column Filters
      const matchesSaleType = columnFilters.saleType === "ทั้งหมด" || sale.saleType === columnFilters.saleType;
      const matchesBuyerBranch = columnFilters.buyerBranch === "ทั้งหมด" || (sale.buyerBranchName || sale.customerName || "ทั่วไป") === columnFilters.buyerBranch;
      const matchesStatus = columnFilters.status === "ทั้งหมด" || sale.status === columnFilters.status;
      const matchesPaymentRequest = columnFilters.paymentRequestStatus === "ทั้งหมด" || (sale.paymentRequestStatus === "none" ? "ไม่ได้ขอ" : sale.paymentRequestStatus === "pending" ? "รอตรวจสอบ" : "อนุมัติแล้ว") === columnFilters.paymentRequestStatus;
      
      return matchesSearch && matchesBranch && matchesSaleType && matchesBuyerBranch && matchesStatus && matchesPaymentRequest;
    });

    if (sortConfig.key && sortConfig.direction) {
      result.sort((a, b) => {
        let aValue: any;
        let bValue: any;

        switch (sortConfig.key) {
          case 'saleDate':
            aValue = new Date(a.saleDate).getTime();
            bValue = new Date(b.saleDate).getTime();
            break;
          case 'unpaid':
            aValue = a.totalAmount - (a.paidAmount || 0);
            bValue = b.totalAmount - (b.paidAmount || 0);
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
      result.sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime());
    }

    return result;
  }, [internalPumpSales, searchTerm, selectedBranchIds, columnFilters, sortConfig]);

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

  // ดึงค่า Unique สำหรับ Filter Dropdowns
  const filterOptions = useMemo(() => {
    return {
      saleType: ["ทั้งหมด", ...new Set(internalPumpSales.map(s => s.saleType))],
      buyerBranch: ["ทั้งหมด", ...new Set(internalPumpSales.map(s => s.buyerBranchName || s.customerName || "ทั่วไป"))],
      status: ["ทั้งหมด", ...new Set(internalPumpSales.map(s => s.status))],
      paymentRequestStatus: ["ทั้งหมด", "รอตรวจสอบ", "อนุมัติแล้ว", "ไม่ได้ขอ"]
    };
  }, [internalPumpSales]);

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
    return columnFilters.saleType !== "ทั้งหมด" || 
           columnFilters.buyerBranch !== "ทั้งหมด" || 
           columnFilters.status !== "ทั้งหมด" || 
           columnFilters.paymentRequestStatus !== "ทั้งหมด";
  }, [columnFilters]);

  const clearFilters = () => {
    setColumnFilters({
      saleType: "ทั้งหมด",
      buyerBranch: "ทั้งหมด",
      status: "ทั้งหมด",
      paymentRequestStatus: "ทั้งหมด"
    });
    setSearchTerm("");
  };

  const stats = useMemo(() => {
    const active = filteredSales.filter(s => s.status === "ปกติ");
    return {
      totalSales: active.length,
      totalVolume: active.reduce((sum, s) => sum + s.items.reduce((is, i) => is + i.quantity, 0), 0),
      totalAmount: active.reduce((sum, s) => sum + s.totalAmount, 0),
    };
  }, [filteredSales]);

  const handleAddItem = () => {
    setNewSale(prev => ({
      ...prev,
      items: [...prev.items, { oilType: "Diesel", quantity: 0, pricePerLiter: 0, totalAmount: 0 }]
    }));
  };

  const handleRemoveItem = (index: number) => {
    if (newSale.items.length > 1) {
      const newItems = [...newSale.items];
      newItems.splice(index, 1);
      setNewSale(prev => ({ ...prev, items: newItems }));
    }
  };

  const handleUpdateItem = (index: number, updates: Partial<{
    oilType: OilType;
    quantity: number;
    pricePerLiter: number;
    totalAmount: number;
  }>) => {
    const newItems = [...newSale.items];
    newItems[index] = { ...newItems[index], ...updates };
    newItems[index].totalAmount = newItems[index].quantity * newItems[index].pricePerLiter;
    setNewSale(prev => ({ ...prev, items: newItems }));
  };

  const totalAmount = useMemo(() => {
    return newSale.items.reduce((sum, item) => sum + item.totalAmount, 0);
  }, [newSale.items]);

  const handleSaveSale = () => {
    if (newSale.items.some(i => i.quantity <= 0 || i.pricePerLiter <= 0)) {
      alert("กรุณากรอกจำนวนและราคาให้ถูกต้อง");
      return;
    }

    const branch = branches.find(b => b.id === newSale.branchId);
    const buyerBranch = branches.find(b => b.id === newSale.buyerBranchId);
    const saleNo = `SL-${new Date().toISOString().replace(/[-:T]/g, "").slice(0, 8)}-${getNextRunningNumber("internal-pump-sale").padStart(3, "0")}`;

    const saleData: InternalPumpSale = {
      id: `IPS-${Date.now()}`,
      saleNo,
      saleDate: newSale.saleDate,
      saleType: newSale.saleType,
      branchId: newSale.branchId,
      branchName: branch?.name || "ไม่ทราบสาขา",
      buyerBranchId: newSale.buyerBranchId,
      buyerBranchName: buyerBranch?.name || newSale.customerName || "ทั่วไป",
      items: newSale.items,
          totalAmount,
      paidAmount: newSale.paymentMethod === "เครดิต" ? 0 : totalAmount,
      paymentRequestStatus: "none",
      paymentMethod: newSale.paymentMethod,
      customerName: newSale.customerName,
      customerType: newSale.customerType,
      recordedBy: user?.name || "Unknown",
      recordedAt: new Date().toISOString(),
      notes: newSale.notes,
      status: "ปกติ"
    };

    addInternalPumpSale(saleData);
    setShowCreateModal(false);
    setNewSale({
      branchId: selectedBranchIds[0] || branches[0]?.id || 0,
      buyerBranchId: 0,
      saleDate: new Date().toISOString().split("T")[0],
      saleType: "🚚 ขายน้ำมันค้างรถ",
      items: [{ oilType: "Diesel", quantity: 0, pricePerLiter: 0, totalAmount: 0 }],
      paymentMethod: "เงินสด",
      customerName: "",
      customerType: "ทั่วไป",
      notes: ""
    });
  };

  const handleCancelSale = (sale: InternalPumpSale) => {
    if (confirm(`คุณต้องการยกเลิกรายการขาย ${sale.saleNo} ใช่หรือไม่?`)) {
      cancelInternalPumpSale(sale.id, user?.name || "Unknown");
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
    const vatRate = 0.07;
    const amountBeforeVat = invoice.amount / (1 + vatRate);
    const vatAmount = invoice.amount - amountBeforeVat;
    
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

          <div class="document-title">ใบกำกับภาษี / ใบเสร็จรับเงิน</div>

          <div class="document-info">
            <div>เลขที่ ${invoice.invoiceNo}</div>
            <div>วันที่ ${formattedDate}</div>
          </div>

          <div class="customer-info-section">
            <div class="info-row">
              <span class="info-label">นามลูกค้า</span>
              ${buyerBranch?.name || sale.buyerBranchName || sale.customerName || '-'}
            </div>
            <div class="info-row">
              <span class="info-label">ที่อยู่</span>
              ${buyerBranch?.address || sale.customerAddress || 'อำเภอบรบือ จังหวัดมหาสารคาม 44130'}
            </div>
            <div class="info-row">
              <span class="info-label">เลขผู้เสียภาษี</span>
              ${buyerBranch?.id === 1 ? '1350200036462' : (buyerBranch?.id === 2 ? '1350200036463' : (sale.customerTaxId || '............................................'))}
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 10%;">ลำดับ</th>
                <th style="width: 50%;">รายการ</th>
                <th style="width: 15%;">จำนวน</th>
                <th style="width: 12%;">ราคา/ลิตร</th>
                <th style="width: 13%;">รวมเงิน</th>
              </tr>
            </thead>
            <tbody>
              ${sale.items.map((item, idx) => {
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
                <td colspan="4" style="text-align: right; font-weight: bold;">รวมเงิน</td>
                <td class="text-right">${amountBeforeVat.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>
              <tr>
                <td colspan="4" style="text-align: right; font-weight: bold;">ภาษีมูลค่าเพิ่ม (7%)</td>
                <td class="text-right">${vatAmount.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>
              <tr class="total-row">
                <td colspan="4" style="text-align: right; font-weight: bold;">จำนวนเงินสุทธิ</td>
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
              <div className="p-2 bg-emerald-500 rounded-2xl shadow-lg shadow-emerald-500/20">
                <DollarSign className="w-8 h-8 text-white" />
              </div>
                ขายน้ำมันภายในปั๊ม
              </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium flex items-center gap-2">
              <History className="w-4 h-4" />
              บันทึกและจัดการรายการขายน้ำมันของแต่ละสาขา
            </p>
            </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-bold shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
          >
            <Plus className="w-5 h-5" />
            บันทึกการขายใหม่
          </button>
          </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl">
              <FileText className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">รายการขายทั้งหมด</p>
              <p className="text-2xl font-black text-gray-900 dark:text-white">{numberFormatter.format(stats.totalSales)} รายการ</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl">
              <Droplet className="w-6 h-6 text-emerald-500" />
          </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">ปริมาณขายรวม</p>
              <p className="text-2xl font-black text-gray-900 dark:text-white">{numberFormatter.format(stats.totalVolume)} ลิตร</p>
        </div>
      </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-2xl">
              <DollarSign className="w-6 h-6 text-amber-500" />
        </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">ยอดขายรวม</p>
              <p className="text-2xl font-black text-gray-900 dark:text-white">{currencyFormatter.format(stats.totalAmount)}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="ค้นหาเลขที่การขาย, ชื่อลูกค้า, ประเภทน้ำมัน..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900 dark:text-white font-medium"
          />
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

      {/* Sales List */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-gray-900/50 text-[10px] uppercase tracking-widest font-black text-gray-400">
                <HeaderWithFilter 
                  label="วันที่ - เลขที่ใบสั่งซื้อ" 
                  columnKey="saleDate" 
                />
                <HeaderWithFilter 
                  label="ประเภทการขาย" 
                  columnKey="saleType" 
                  filterKey="saleType"
                  options={filterOptions.saleType}
                />
                <HeaderWithFilter 
                  label="สาขาผู้ซื้อ" 
                  columnKey="buyerBranchName" 
                  filterKey="buyerBranch"
                  options={filterOptions.buyerBranch}
                />
                <th 
                  className="px-6 py-4 text-right cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  onClick={() => handleSort('totalAmount')}
                >
                  <div className="flex items-center justify-end gap-2">
                    ยอดรวม
                    {getSortIcon('totalAmount')}
            </div>
                </th>
                <th 
                  className="px-6 py-4 text-right cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  onClick={() => handleSort('paidAmount')}
                >
                  <div className="flex items-center justify-end gap-2">
                    รับเงินแล้ว
                    {getSortIcon('paidAmount')}
          </div>
                </th>
                <th 
                  className="px-6 py-4 text-right font-bold text-rose-500 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  onClick={() => handleSort('unpaid')}
                >
                  <div className="flex items-center justify-end gap-2">
                    ค้างรับ
                    {getSortIcon('unpaid')}
                  </div>
                </th>
                <HeaderWithFilter 
                  label="ร้องขอการชำระ" 
                  columnKey="paymentRequestStatus" 
                  filterKey="paymentRequestStatus"
                  options={filterOptions.paymentRequestStatus}
                />
                <HeaderWithFilter 
                  label="สถานะ" 
                  columnKey="status" 
                  filterKey="status"
                  options={filterOptions.status}
                />
                <th className="px-6 py-4 text-center">จัดการ</th>
                </tr>
              </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700 text-sm">
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-gray-400 italic font-medium">
                    <div className="flex flex-col items-center gap-2">
                      <Search className="w-8 h-8 opacity-20" />
                      ไม่พบรายการขายที่ค้นหา
                    </div>
                    </td>
                </tr>
              ) : (
                filteredSales.map((sale) => {
                  const unpaid = sale.totalAmount - (sale.paidAmount || 0);
                  return (
                    <tr key={sale.id} className="group hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors font-medium">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-900 dark:text-white">
                            {new Date(sale.saleDate).toLocaleDateString('th-TH')}
                      </span>
                          <span className="text-[10px] font-black text-blue-600 uppercase tracking-tighter mt-0.5 flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            {sale.saleNo}
                          </span>
                        </div>
                    </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-lg text-[10px] font-bold border ${
                          sale.saleType.includes("ค้างรถ") 
                            ? "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800"
                            : "bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800"
                        }`}>
                          {sale.saleType}
                        </span>
                    </td>
                      <td className="px-6 py-4 font-bold text-gray-700 dark:text-gray-300">
                        {sale.buyerBranchName || sale.customerName || "-"}
                    </td>
                      <td className="px-6 py-4 text-right font-bold text-gray-900 dark:text-white">
                        {currencyFormatter.format(sale.totalAmount)}
                    </td>
                      <td className="px-6 py-4 text-right text-emerald-600 font-bold">
                        {currencyFormatter.format(sale.paidAmount || 0)}
                    </td>
                      <td className="px-6 py-4 text-right font-black text-rose-600">
                        {currencyFormatter.format(unpaid)}
                    </td>
                      <td className="px-6 py-4 text-center">
                        {sale.paymentRequestStatus === "pending" ? (
                          <StatusTag variant="warning">รอตรวจสอบ</StatusTag>
                        ) : sale.paymentRequestStatus === "approved" ? (
                          <StatusTag variant="success">อนุมัติแล้ว</StatusTag>
                        ) : (
                          <span className="text-gray-400 font-bold">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <StatusTag variant={getStatusVariant(sale.status)}>
                          {sale.status}
                        </StatusTag>
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
                                label: "พิมพ์ใบเสร็จ (Internal)",
                                icon: Download,
                                onClick: () => alert("กำลังสร้างไฟล์ PDF...")
                              },
                              {
                                label: "ยกเลิกรายการ",
                                icon: Trash2,
                                variant: "danger",
                                hidden: sale.status === "ยกเลิก",
                                onClick: () => handleCancelSale(sale)
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

      {/* Create Sale Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-emerald-50 dark:bg-emerald-900/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500 rounded-xl">
                    <Plus className="w-6 h-6 text-white" />
                </div>
                  <div>
                    <h2 className="text-xl font-black text-emerald-800 dark:text-emerald-400">บันทึกการขายน้ำมัน</h2>
                    <p className="text-xs text-emerald-600 dark:text-emerald-500 font-bold">กรอกข้อมูลการขายและรายการน้ำมัน</p>
                </div>
              </div>
                <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-white dark:hover:bg-gray-700 rounded-full transition-colors">
                  <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

              <div className="p-6 overflow-y-auto space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-inner text-sm">
                  <div className="space-y-1.5">
                    <label htmlFor="branch-select" className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">สาขาที่ขาย</label>
                <select
                      id="branch-select"
                      value={newSale.branchId}
                      onChange={(e) => setNewSale(prev => ({ ...prev, branchId: Number(e.target.value) }))}
                      className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl font-bold text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                    >
                      {branches.map(b => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                </select>
              </div>
                  <div className="space-y-1.5">
                    <label htmlFor="sale-type-select" className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">ประเภทการขาย</label>
                    <select
                      id="sale-type-select"
                      value={newSale.saleType}
                      onChange={(e) => setNewSale(prev => ({ ...prev, saleType: e.target.value as "🚚 ขายน้ำมันค้างรถ" | "💉 ขายน้ำมันจากการดูด" | "📦 ขายจากคลัง" }))}
                      className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl font-bold text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                    >
                      <option value="🚚 ขายน้ำมันค้างรถ">🚚 ขายน้ำมันค้างรถ</option>
                      <option value="💉 ขายน้ำมันจากการดูด">💉 ขายน้ำมันจากการดูด</option>
                      <option value="📦 ขายจากคลัง">📦 ขายจากคลัง</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="sale-date" className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">วันที่ขาย</label>
                    <input
                      id="sale-date"
                      type="date"
                      value={newSale.saleDate}
                      onChange={(e) => setNewSale(prev => ({ ...prev, saleDate: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl font-bold text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                  </div>

                {/* Buyer Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-blue-50/30 dark:bg-blue-900/10 rounded-2xl border border-blue-100/50 dark:border-blue-800/50">
                  <div className="space-y-1.5 text-sm">
                    <label htmlFor="buyer-branch-select" className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest block ml-1">สาขาผู้ซื้อ</label>
                    <select
                      id="buyer-branch-select"
                      value={newSale.buyerBranchId}
                      onChange={(e) => setNewSale(prev => ({ ...prev, buyerBranchId: Number(e.target.value) }))}
                      className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-blue-100 dark:border-blue-800/50 rounded-xl font-bold text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value={0}>-- ลูกค้าภายนอก (ระบุชื่อด้านขวา) --</option>
                      {branches.map(b => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                      </div>
                  <div className="space-y-1.5 text-sm">
                    <label htmlFor="customer-name" className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest block ml-1">ชื่อลูกค้า (กรณีภายนอก)</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
                      <input
                        id="customer-name"
                        type="text"
                        placeholder="ระบุชื่อลูกค้า หรือชื่อบริษัท"
                        disabled={newSale.buyerBranchId !== 0}
                        value={newSale.customerName}
                        onChange={(e) => setNewSale(prev => ({ ...prev, customerName: e.target.value }))}
                        className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-blue-100 dark:border-blue-800/50 rounded-xl font-bold text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50 disabled:bg-gray-100"
                      />
                  </div>
                  </div>
                  <div className="space-y-1.5 text-sm">
                    <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest block ml-1">ประเภทลูกค้า</span>
                    <div className="flex gap-2">
                      {(["ทั่วไป", "รถบริษัท"] as const).map(type => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setNewSale(prev => ({ ...prev, customerType: type }))}
                          className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${
                            newSale.customerType === type 
                              ? "bg-blue-500 text-white shadow-lg shadow-blue-500/30" 
                              : "bg-white dark:bg-gray-800 text-gray-400 border border-blue-100 dark:border-blue-800/50 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                </div>
                </div>

                {/* Oil Items */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                      <Droplet className="w-4 h-4 text-emerald-500" />
                      รายการน้ำมันที่ขาย
                    </h3>
                    <button
                      onClick={handleAddItem}
                      className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl text-[10px] font-black border border-emerald-100 dark:border-emerald-800/50 hover:bg-emerald-100 transition-colors flex items-center gap-1.5"
                    >
                      <Plus className="w-3 h-3" /> เพิ่มรายการ
                    </button>
                  </div>

                  <div className="space-y-3">
                    {newSale.items.map((item, index) => (
                      <div key={index} className="p-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm space-y-4 relative group">
                        {newSale.items.length > 1 && (
                          <button
                            onClick={() => handleRemoveItem(index)}
                            className="absolute -right-2 -top-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity active:scale-95"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-1.5">
                            <label htmlFor={`oil-type-${index}`} className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">ประเภทน้ำมัน</label>
                  <select
                              id={`oil-type-${index}`}
                              value={item.oilType}
                              onChange={(e) => handleUpdateItem(index, { oilType: e.target.value as OilType })}
                              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl font-bold text-gray-700 dark:text-gray-300 outline-none"
                            >
                              <option value="Diesel">Diesel</option>
                              <option value="Premium Diesel">Premium Diesel</option>
                              <option value="Gasohol 95">Gasohol 95</option>
                              <option value="Premium Gasohol 95">Premium Gasohol 95</option>
                              <option value="Gasohol 91">Gasohol 91</option>
                              <option value="E20">E20</option>
                  </select>
                </div>
                          <div className="space-y-1.5">
                            <label htmlFor={`quantity-${index}`} className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">จำนวน (ลิตร)</label>
                            <div className="relative">
                  <input
                                id={`quantity-${index}`}
                                type="number"
                                value={item.quantity || ""}
                                onChange={(e) => handleUpdateItem(index, { quantity: Number(e.target.value) })}
                                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl font-bold text-emerald-600 text-right pr-12 outline-none"
                                placeholder="0"
                              />
                              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-300">ลิตร</span>
                </div>
              </div>
                          <div className="space-y-1.5">
                            <label htmlFor={`price-${index}`} className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">ราคา/ลิตร</label>
                            <div className="relative">
                  <input
                                id={`price-${index}`}
                    type="number"
                                value={item.pricePerLiter || ""}
                                onChange={(e) => handleUpdateItem(index, { pricePerLiter: Number(e.target.value) })}
                                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl font-bold text-blue-600 text-right pr-12 outline-none"
                                placeholder="0.00"
                              />
                              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-300">฿</span>
                </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-gray-50 dark:border-gray-800/50">
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">รวมรายการนี้</span>
                          <span className="font-black text-gray-900 dark:text-white">{currencyFormatter.format(item.totalAmount)}</span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

                {/* Footer Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-3xl border-2 border-dashed border-emerald-500/20">
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest block ml-1">วิธีการชำระเงิน</span>
                      <div className="flex gap-2">
                        {(["เงินสด", "เงินโอน", "เครดิต"] as const).map(method => (
                          <button
                            key={method}
                            onClick={() => setNewSale(prev => ({ ...prev, paymentMethod: method }))}
                            className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-2xl text-[10px] font-black transition-all ${
                              newSale.paymentMethod === method 
                                ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30" 
                                : "bg-white dark:bg-gray-800 text-gray-400 border border-emerald-100 dark:border-emerald-800/50 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                            }`}
                          >
                            {method === "เงินสด" ? <Wallet className="w-5 h-5" /> : method === "เงินโอน" ? <CheckCircle className="w-5 h-5" /> : <CreditCard className="w-5 h-5" />}
                            {method}
                          </button>
                        ))}
                  </div>
                </div>
                    <div className="space-y-1.5">
                      <label htmlFor="sale-notes" className="text-[10px] font-black text-emerald-600 uppercase tracking-widest block ml-1">หมายเหตุ</label>
                      <textarea
                        id="sale-notes"
                        value={newSale.notes}
                        onChange={(e) => setNewSale(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="ระบุหมายเหตุเพิ่มเติม (ถ้ามี)"
                        className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-emerald-100 dark:border-emerald-800/50 rounded-2xl font-bold text-gray-700 dark:text-gray-300 outline-none h-20 resize-none text-sm"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col justify-between items-end">
                    <div className="text-right">
                      <p className="text-xs font-black text-emerald-600 uppercase tracking-widest mb-1">ยอดรวมทั้งสิ้น</p>
                      <p className="text-5xl font-black text-gray-900 dark:text-white">{currencyFormatter.format(totalAmount)}</p>
                      <p className="text-sm font-bold text-gray-400 mt-2 italic">
                        จำนวนทั้งหมด {newSale.items.reduce((s, i) => s + i.quantity, 0).toLocaleString()} ลิตร
                      </p>
                    </div>
                    <div className="w-full mt-4 p-4 bg-white/50 dark:bg-gray-800/50 rounded-2xl border border-emerald-100 dark:border-emerald-800/50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                          <User className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-emerald-600 uppercase">ผู้บันทึกรายการ</p>
                          <p className="text-sm font-black text-gray-800 dark:text-gray-200">{user?.name || "ระบบ"}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
            </div>

              <div className="p-6 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700 flex gap-3">
              <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-6 py-4 bg-white dark:bg-gray-800 text-gray-500 font-black rounded-2xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 transition-all active:scale-95 uppercase tracking-widest text-sm"
              >
                ยกเลิก
              </button>
              <button
                  onClick={handleSaveSale}
                  className="flex-[2] px-6 py-4 bg-emerald-500 text-white font-black rounded-2xl shadow-xl shadow-emerald-500/30 hover:bg-emerald-600 transition-all active:scale-95 uppercase tracking-widest text-sm flex items-center justify-center gap-2"
              >
                  <Check className="w-5 h-5" />
                บันทึกการขาย
              </button>
            </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Detail Modal */}
      <AnimatePresence>
        {showDetailModal && selectedSale && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-blue-50 dark:bg-blue-900/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500 rounded-xl">
                    <FileText className="w-6 h-6 text-white" />
        </div>
                  <div>
                    <h2 className="text-xl font-black text-blue-800 dark:text-blue-400">รายละเอียดการขาย</h2>
                    <p className="text-xs text-blue-600 dark:text-blue-500 font-bold">เลขที่รายการ: {selectedSale.saleNo}</p>
                  </div>
                </div>
                <button onClick={() => setShowDetailModal(false)} className="p-2 hover:bg-white dark:hover:bg-gray-700 rounded-full transition-colors">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-6">
                {/* Summary Box */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 bg-gray-50 dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-inner">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">สาขาที่ขาย</span>
                        <p className="font-black text-gray-800 dark:text-white flex items-center gap-2 text-sm">
                          <Building2 className="w-4 h-4 text-blue-500" />
                          {selectedSale.branchName}
                        </p>
                      </div>
                      <div>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">ประเภทการขาย</span>
                        <p className="font-black text-blue-600 dark:text-blue-400 text-sm">
                          {selectedSale.saleType}
                        </p>
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">วันที่ขาย</span>
                      <p className="font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-emerald-500" />
                        {new Date(selectedSale.saleDate).toLocaleDateString('th-TH')}
                        <span className="text-gray-400 text-xs ml-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(selectedSale.recordedAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4 text-right">
                    <div>
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">สถานะรายการ</span>
                      <div className="flex justify-end">
                        <StatusTag variant={getStatusVariant(selectedSale.status)}>
                          {selectedSale.status}
                        </StatusTag>
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">วิธีการชำระ</span>
                      <p className="font-black text-emerald-600 dark:text-emerald-400 flex items-center justify-end gap-2 text-lg">
                        {selectedSale.paymentMethod === "เงินสด" ? <Wallet className="w-5 h-5" /> : <CreditCard className="w-5 h-5" />}
                        {selectedSale.paymentMethod}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800/50">
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest block mb-1">ยอดรวมทั้งสิ้น</span>
                    <p className="text-2xl font-black text-blue-700 dark:text-blue-300">{currencyFormatter.format(selectedSale.totalAmount)}</p>
                  </div>
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-800/50">
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest block mb-1">รับเงินแล้ว</span>
                    <p className="text-2xl font-black text-emerald-700 dark:text-emerald-300">{currencyFormatter.format(selectedSale.paidAmount || 0)}</p>
                  </div>
                  <div className="p-4 bg-rose-50 dark:bg-rose-900/20 rounded-2xl border border-rose-100 dark:border-rose-800/50">
                    <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest block mb-1">ยอดค้างรับ</span>
                    <p className="text-2xl font-black text-rose-700 dark:text-rose-300">{currencyFormatter.format(selectedSale.totalAmount - (selectedSale.paidAmount || 0))}</p>
                  </div>
                </div>

                {/* Buyer Info */}
                <div className="p-4 bg-blue-500/5 dark:bg-blue-500/10 rounded-2xl border border-blue-500/10">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
                      <User className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">ข้อมูลผู้ซื้อ / ลูกค้า</span>
                        <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-md text-[10px] font-black">{selectedSale.customerType}</span>
                      </div>
                      <p className="text-lg font-black text-gray-900 dark:text-white">{selectedSale.buyerBranchName || selectedSale.customerName || "ลูกค้าทั่วไป"}</p>
                    </div>
                  </div>
                </div>

                {/* Items Table */}
                <div className="space-y-3">
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 px-1">
                    <Tag className="w-3 h-3 text-amber-500" />
                    รายการที่ขาย
                  </h3>
                  <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm">
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-gray-900/50">
                        <tr className="text-[10px] font-black text-gray-400 uppercase tracking-wider">
                          <th className="px-4 py-3 text-left">ประเภทน้ำมัน</th>
                          <th className="px-4 py-3 text-right">จำนวน</th>
                          <th className="px-4 py-3 text-right">ราคา/ลิตร</th>
                          <th className="px-4 py-3 text-right">รวมเป็นเงิน</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50 text-sm">
                        {selectedSale.items.map((item, idx) => (
                          <tr key={idx}>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="w-1.5 h-6 bg-emerald-500 rounded-full"></div>
                                <span className="font-black text-gray-800 dark:text-gray-200">{item.oilType}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-right font-bold text-gray-700 dark:text-gray-300">{item.quantity.toLocaleString()} ลิตร</td>
                            <td className="px-4 py-3 text-right font-bold text-blue-600 dark:text-blue-400">{currencyFormatter.format(item.pricePerLiter)}</td>
                            <td className="px-4 py-3 text-right font-black text-gray-900 dark:text-white">{currencyFormatter.format(item.totalAmount)}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-emerald-50/50 dark:bg-emerald-900/10">
                        <tr>
                          <td colSpan={3} className="px-4 py-4 text-right">
                            <span className="text-xs font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-widest">ยอดรวมทั้งสิ้น</span>
                          </td>
                          <td className="px-4 py-4 text-right">
                            <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">{currencyFormatter.format(selectedSale.totalAmount)}</span>
                          </td>
                        </tr>
                      </tfoot>
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

                {/* Additional Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-700">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">หมายเหตุ</span>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 leading-relaxed italic">
                      {selectedSale.notes || "ไม่มีหมายเหตุเพิ่มเติม"}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-700 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                        <Briefcase className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div>
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">ผู้บันทึก</span>
                        <p className="text-xs font-black text-gray-800 dark:text-gray-200">{selectedSale.recordedBy}</p>
                      </div>
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
                {selectedSale.status === "ปกติ" && (
                  <button
                    onClick={() => {
                      handleCancelSale(selectedSale);
                      setShowDetailModal(false);
                    }}
                    className="flex-1 px-6 py-4 bg-red-50 text-red-600 font-black rounded-2xl border border-red-100 hover:bg-red-100 transition-all active:scale-95 uppercase tracking-widest text-sm flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-5 h-5" />
                    ยกเลิกรายการ
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
