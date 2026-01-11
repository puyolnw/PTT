import { useState, useMemo } from "react";
import {
  Search,
  X,
  Droplet,
  FileText,
  User,
  Eye,
  Plus,
  Trash2,
  DollarSign,
  Tag,
  MapPin,
  Check,
  Building,
  ShieldCheck,
  Printer,
  Clock,
  Filter,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useGasStation } from "@/contexts/GasStationContext";
import { useBranch } from "@/contexts/BranchContext";
import { useAuth } from "@/contexts/AuthContext";
import { InternalPumpSale, OilType } from "@/types/gasStation";
import StatusTag, { getStatusVariant } from "@/components/StatusTag";
import TableActionMenu from "@/components/TableActionMenu";
import { convertNumberToThaiWords } from "@/utils/numberToThaiWords";

export default function ExternalSectorSales() {
  const { 
    internalPumpSales, 
    addInternalPumpSale, 
    cancelInternalPumpSale,
    getNextRunningNumber,
    branches,
    purchaseOrders
  } = useGasStation();
  const { selectedBranches } = useBranch();
  const { user } = useAuth();

  const [searchTerm, setSearchTerm] = useState("");
  const [columnFilters, setColumnFilters] = useState<{
    customerType: string;
    status: string;
    paymentMethod: string;
  }>({
    customerType: "ทั้งหมด",
    status: "ทั้งหมด",
    paymentMethod: "ทั้งหมด"
  });
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' | null }>({ key: 'recordedAt', direction: 'desc' });
  const [filterDateFrom, setFilterDateFrom] = useState<string>("");
  const [filterDateTo, setFilterDateTo] = useState<string>("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedSale, setSelectedSale] = useState<InternalPumpSale | null>(null);

  // Form State for new external sale
  const [newSale, setNewSale] = useState<{
    saleDate: string;
    referencePoNo: string;
    items: Array<{
      oilType: OilType;
      quantity: number;
      pricePerLiter: number;
      totalAmount: number;
    }>;
    paymentMethod: "เงินสด" | "เงินโอน" | "เครดิต" | "อื่นๆ";
    customerName: string;
    customerType: "ภาครัฐ" | "เอกชน";
    customerTaxId: string;
    customerAddress: string;
    notes: string;
  }>({
    saleDate: new Date().toISOString().split("T")[0],
    referencePoNo: "",
    items: [{ oilType: "Diesel", quantity: 0, pricePerLiter: 0, totalAmount: 0 }],
    paymentMethod: "เงินโอน",
    customerName: "",
    customerType: "ภาครัฐ",
    customerTaxId: "",
    customerAddress: "",
    notes: ""
  });

  const selectedBranchIds = useMemo(() => selectedBranches.map(id => Number(id)), [selectedBranches]);
  
  // ตรวจสอบว่าเป็นพนักงานไฮโซหรือไม่
  const isHISO = useMemo(() => {
    return selectedBranchIds.includes(1) || (selectedBranchIds.length === 0 && (user as any)?.branchId === 1);
  }, [selectedBranchIds, user]);

  // กรองเฉพาะใบสั่งซื้อที่ส่งมอบแล้ว (เพื่อนำมาขายต่อ)
  const availableOrders = useMemo(() => {
    return purchaseOrders.filter(po => po.status === "ขนส่งสำเร็จ");
  }, [purchaseOrders]);

  // เมื่อเลือก PO อัตโนมัติ
  const handleSelectPO = (poNo: string) => {
    const selectedPO = availableOrders.find(po => po.orderNo === poNo);
    if (selectedPO) {
      setNewSale(prev => ({
        ...prev,
        referencePoNo: poNo,
        items: selectedPO.items.map(item => ({
          oilType: item.oilType,
          quantity: item.quantity,
          pricePerLiter: 0, // ให้พนักงานระบุราคาขายใหม่
          totalAmount: 0
        }))
      }));
    } else {
      setNewSale(prev => ({
        ...prev,
        referencePoNo: "",
        items: [{ oilType: "Diesel", quantity: 0, pricePerLiter: 0, totalAmount: 0 }]
      }));
    }
  };

  const numberFormatter = useMemo(() => new Intl.NumberFormat("th-TH"), []);
  const currencyFormatter = useMemo(() => new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
  }), []);

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
    const external = internalPumpSales.filter(s => s.customerType === "ภาครัฐ" || s.customerType === "เอกชน");
    return {
      customerType: ["ทั้งหมด", "ภาครัฐ", "เอกชน"],
      status: ["ทั้งหมด", ...new Set(external.map(s => s.status))],
      paymentMethod: ["ทั้งหมด", "เงินสด", "เงินโอน", "เครดิต", "อื่นๆ"]
    };
  }, [internalPumpSales]);

  const filteredSales = useMemo(() => {
    let result = internalPumpSales.filter(sale => {
      // กรองเฉพาะรายการที่เป็นภาครัฐหรือเอกชน และเป็นของสาขาไฮโซ
      const isExternalSector = sale.customerType === "ภาครัฐ" || sale.customerType === "เอกชน";
      if (!isExternalSector) return false;

      const matchesSearch = 
        sale.saleNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.customerTaxId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.items.some(item => item.oilType.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Column Filters
      const matchesCustomerType = columnFilters.customerType === "ทั้งหมด" || sale.customerType === columnFilters.customerType;
      const matchesStatus = columnFilters.status === "ทั้งหมด" || sale.status === columnFilters.status;
      const matchesPaymentMethod = columnFilters.paymentMethod === "ทั้งหมด" || sale.paymentMethod === columnFilters.paymentMethod;
      
      const saleDate = new Date(sale.saleDate);
      const matchesDate = (!filterDateFrom || saleDate >= new Date(filterDateFrom)) && 
                          (!filterDateTo || saleDate <= new Date(filterDateTo));
      
      return matchesSearch && matchesCustomerType && matchesStatus && matchesPaymentMethod && matchesDate;
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
      result.sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime());
    }

    return result;
  }, [internalPumpSales, searchTerm, columnFilters, filterDateFrom, filterDateTo, sortConfig]);

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
    return columnFilters.customerType !== "ทั้งหมด" || 
           columnFilters.status !== "ทั้งหมด" ||
           columnFilters.paymentMethod !== "ทั้งหมด" ||
           filterDateFrom !== "" ||
           filterDateTo !== "";
  }, [columnFilters, filterDateFrom, filterDateTo]);

  const clearFilters = () => {
    setColumnFilters({
      customerType: "ทั้งหมด",
      status: "ทั้งหมด",
      paymentMethod: "ทั้งหมด"
    });
    setSearchTerm("");
    setFilterDateFrom("");
    setFilterDateTo("");
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
    if (!isHISO) {
      alert("เฉพาะสาขาไฮโซเท่านั้นที่สามารถทำรายการนี้ได้");
      return;
    }

    if (!newSale.customerName || !newSale.customerTaxId) {
      alert("กรุณากรอกชื่อหน่วยงานและเลขผู้เสียภาษี");
      return;
    }

    if (newSale.items.some(i => i.quantity <= 0 || i.pricePerLiter <= 0)) {
      alert("กรุณากรอกจำนวนและราคาให้ถูกต้อง");
      return;
    }

    const hisoBranch = branches.find(b => b.id === 1);
    const saleNo = `SL-EXT-${new Date().toISOString().replace(/[-:T]/g, "").slice(0, 8)}-${getNextRunningNumber("internal-pump-sale").padStart(3, "0")}`;

    const saleData: InternalPumpSale = {
      id: `IPS-EXT-${Date.now()}`,
      saleNo,
      saleDate: newSale.saleDate,
      saleType: "📦 ขายจากคลัง",
      branchId: 1,
      branchName: hisoBranch?.name || "ปั๊มไฮโซ",
      customerName: newSale.customerName,
      customerType: newSale.customerType,
      customerTaxId: newSale.customerTaxId,
      customerAddress: newSale.customerAddress,
      items: newSale.items,
      totalAmount,
      paidAmount: newSale.paymentMethod === "เครดิต" ? 0 : totalAmount,
      paymentRequestStatus: "none",
      paymentMethod: newSale.paymentMethod,
      recordedBy: user?.name || "Unknown",
      recordedAt: new Date().toISOString(),
      notes: newSale.referencePoNo ? `อ้างอิง PO: ${newSale.referencePoNo}${newSale.notes ? ` | ${newSale.notes}` : ""}` : newSale.notes,
      status: "ปกติ"
    };

    addInternalPumpSale(saleData);
    setShowCreateModal(false);
    setNewSale({
      saleDate: new Date().toISOString().split("T")[0],
      referencePoNo: "",
      items: [{ oilType: "Diesel", quantity: 0, pricePerLiter: 0, totalAmount: 0 }],
      paymentMethod: "เงินโอน",
      customerName: "",
      customerType: "ภาครัฐ",
      customerTaxId: "",
      customerAddress: "",
      notes: ""
    });
  };

  const handleCancelSale = (sale: InternalPumpSale) => {
    if (confirm(`คุณต้องการยกเลิกรายการขาย ${sale.saleNo} ใช่หรือไม่?`)) {
      cancelInternalPumpSale(sale.id, user?.name || "Unknown");
    }
  };

  const handleDownloadInvoice = (sale: InternalPumpSale) => {
    const dateFormatter = new Intl.DateTimeFormat('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const formattedDate = dateFormatter.format(new Date(sale.saleDate));
    const vatRate = 0.07;
    const amountBeforeVat = sale.totalAmount / (1 + vatRate);
    const vatAmount = sale.totalAmount - amountBeforeVat;

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="th">
      <head>
        <meta charset="UTF-8">
        <title>ใบกำกับภาษี - ${sale.saleNo}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;700&display=swap');
          * { box-sizing: border-box; -webkit-print-color-adjust: exact; margin: 0; padding: 0; }
          @page { size: A4; margin: 15mm; }
          body { font-family: 'Sarabun', sans-serif; font-size: 14px; line-height: 1.6; color: #000; }
          .container { padding: 15mm; max-width: 210mm; margin: 0 auto; }
          .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
          .company-name { font-size: 22px; font-weight: bold; }
          .doc-title { text-align: center; font-size: 20px; font-weight: bold; margin: 20px 0; }
          .doc-info { display: flex; justify-content: space-between; margin-bottom: 20px; }
          .customer-section { border: 1px solid #000; padding: 10px; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { border: 1px solid #000; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; text-align: center; }
          .text-right { text-align: right; }
          .text-center { text-align: center; }
          .summary-table { width: 300px; margin-left: auto; }
          .baht-text { border: 1px solid #000; padding: 10px; text-align: center; font-weight: bold; margin-bottom: 30px; }
          .footer { display: flex; justify-content: flex-end; margin-top: 50px; }
          .signature { text-align: center; width: 250px; }
          .sig-line { border-top: 1px solid #000; margin-top: 60px; padding-top: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="company-name">PTT STATION (สาขาไฮโซ)</div>
            <div>1187 ถนน สุขาภิบาล 17 ตำบลบรบือ อำเภอบรบือ จังหวัดมหาสารคาม 44130</div>
            <div>โทร. 091-9535355 &nbsp; เลขประจำตัวผู้เสียภาษี 1350200036462</div>
          </div>
          <div class="doc-title">ใบกำกับภาษี / ใบเสร็จรับเงิน</div>
          <div class="doc-info">
            <div><strong>ลูกค้า:</strong> ${sale.customerName}</div>
            <div style="text-align: right;">
              <div><strong>เลขที่:</strong> ${sale.saleNo}</div>
              <div><strong>วันที่:</strong> ${formattedDate}</div>
            </div>
          </div>
          <div class="customer-section">
            <div><strong>ที่อยู่:</strong> ${sale.customerAddress || "-"}</div>
            <div><strong>เลขประจำตัวผู้เสียภาษี:</strong> ${sale.customerTaxId}</div>
          </div>
          <table>
            <thead>
              <tr>
                <th style="width: 10%;">ลำดับ</th>
                <th>รายการ</th>
                <th style="width: 15%;">จำนวน (ลิตร)</th>
                <th style="width: 15%;">ราคา/หน่วย</th>
                <th style="width: 20%;">จำนวนเงิน</th>
              </tr>
            </thead>
            <tbody>
              ${sale.items.map((item, idx) => `
                <tr>
                  <td class="text-center">${idx + 1}</td>
                  <td>น้ำมันเชื้อเพลิง ${item.oilType}</td>
                  <td class="text-right">${item.quantity.toLocaleString()}</td>
                  <td class="text-right">${item.pricePerLiter.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td class="text-right">${item.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <table class="summary-table">
            <tr>
              <td><strong>รวมเงิน</strong></td>
              <td class="text-right">${amountBeforeVat.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
            </tr>
            <tr>
              <td><strong>ภาษีมูลค่าเพิ่ม (7%)</strong></td>
              <td class="text-right">${vatAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
            </tr>
            <tr>
              <td><strong>จำนวนเงินทั้งสิ้น</strong></td>
              <td class="text-right"><strong>${sale.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong></td>
            </tr>
          </table>
          <div class="baht-text">(${convertNumberToThaiWords(sale.totalAmount)})</div>
          <div class="footer">
            <div class="signature">
              <div class="sig-line">ผู้รับเงิน / ผู้รับมอบอำนาจ</div>
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
    link.download = `TaxInvoice_${sale.saleNo}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!isHISO && selectedBranchIds.length > 0 && !selectedBranchIds.includes(1)) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-8">
        <div className="max-w-md w-full text-center space-y-6 bg-white dark:bg-gray-800 p-10 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700">
          <div className="w-20 h-20 bg-rose-100 dark:bg-rose-900/30 rounded-full flex items-center justify-center mx-auto text-rose-500">
            <ShieldCheck className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-gray-900 dark:text-white">เฉพาะสาขาไฮโซเท่านั้น</h1>
            <p className="text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
              ขออภัย หน้านี้ถูกจำกัดสิทธิ์ให้เข้าถึงได้เฉพาะผู้ดูแลระบบหรือพนักงานสาขาไฮโซ (สำนักงานใหญ่) เท่านั้น
            </p>
          </div>
          <div className="pt-4">
            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-100 dark:border-amber-800/50 flex items-center gap-3 text-left">
              <Building className="w-10 h-10 text-amber-500 shrink-0" />
              <p className="text-xs font-bold text-amber-700 dark:text-amber-400 leading-tight">
                กรุณาเลือก &ldquo;ปั๊มไฮโซ&rdquo; จากเมนูเลือกสาขาด้านบน เพื่อเข้าใช้งานระบบขายน้ำมันหน่วยงานภาครัฐและเอกชน
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      {/* Header */}
      <header className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-2xl shadow-lg shadow-blue-600/20">
                <Building className="w-8 h-8 text-white" />
              </div>
              ขายน้ำมัน (ภาครัฐ/เอกชน)
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              ระบบขายน้ำมันสำหรับหน่วยงานและบริษัทเอกชน เฉพาะสาขาไฮโซ
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold shadow-lg shadow-blue-600/20 transition-all active:scale-95"
          >
            <Plus className="w-5 h-5" />
            สร้างใบสั่งซื้อ/บันทึกการขาย
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
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">รายการขายภาครัฐ/เอกชน</p>
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
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">ปริมาณขายสะสม</p>
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
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">ยอดขายรวมสุทธิ</p>
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
            placeholder="ค้นหาชื่อหน่วยงาน, เลขผู้เสียภาษี, เลขที่ใบสั่งซื้อ..."
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
            <span className="text-sm font-bold whitespace-nowrap">สาขาไฮโซ (สำนักงานกลาง)</span>
          </div>
        </div>
      </div>

      {/* Sales List */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-gray-900/50 text-[10px] uppercase tracking-widest font-black text-gray-400">
                <HeaderWithFilter label="วันที่ - เลขที่รายการ" columnKey="saleDate" />
                <th className="px-6 py-4">หน่วยงาน / ลูกค้า</th>
                <HeaderWithFilter label="ประเภท" columnKey="customerType" filterKey="customerType" options={filterOptions.customerType} />
                <th className="px-6 py-4 text-right cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" onClick={() => handleSort('totalAmount')}>
                  <div className="flex items-center justify-end gap-2">ยอดรวมสุทธิ {getSortIcon('totalAmount')}</div>
                </th>
                <th className="px-6 py-4 text-right">ชำระแล้ว</th>
                <th className="px-6 py-4 text-right text-rose-500">ค้างรับ</th>
                <HeaderWithFilter label="การชำระ" columnKey="paymentMethod" filterKey="paymentMethod" options={filterOptions.paymentMethod} />
                <HeaderWithFilter label="สถานะ" columnKey="status" filterKey="status" options={filterOptions.status} />
                <th className="px-6 py-4 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700 text-sm font-medium">
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-gray-400">
                    <div className="flex flex-col items-center gap-2">
                      <FileText className="w-12 h-12 text-gray-300" />
                      <p className="text-sm font-bold">ไม่พบรายการขาย</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredSales.map((sale) => {
                  const unpaid = sale.totalAmount - (sale.paidAmount || 0);
                  return (
                    <tr key={sale.id} className="group hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
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
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-700 dark:text-gray-300 line-clamp-1">{sale.customerName}</span>
                          <span className="text-[10px] text-gray-400 font-bold tracking-tight">Tax ID: {sale.customerTaxId}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-lg text-[10px] font-bold border ${
                          sale.customerType === "ภาครัฐ" 
                            ? "bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800"
                            : "bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-800"
                        }`}>
                          {sale.customerType}
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
                        <span className={`px-2 py-1 rounded-lg text-[10px] font-black border ${
                          sale.paymentMethod === "เครดิต" 
                            ? "bg-amber-50 text-amber-600 border-amber-100" 
                            : "bg-emerald-50 text-emerald-600 border-emerald-100"
                        }`}>
                          {sale.paymentMethod}
                        </span>
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
                                label: "พิมพ์ใบกำกับภาษี",
                                icon: Printer,
                                onClick: () => handleDownloadInvoice(sale)
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

      {/* Create Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-emerald-50 dark:bg-emerald-900/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500 rounded-xl">
                    <Plus className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-emerald-800 dark:text-emerald-400">บันทึกการขาย (ภาครัฐ/เอกชน)</h2>
                    <p className="text-xs text-emerald-600 dark:text-emerald-500 font-bold">ทำรายการโดย: สำนักงานใหญ่ (ไฮโซ)</p>
                  </div>
                </div>
                <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-white dark:hover:bg-gray-700 rounded-full transition-colors">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Customer Info */}
                  <div className="space-y-4 p-5 bg-gray-50 dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-inner">
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                      <User className="w-3 h-3 text-blue-500" /> ข้อมูลหน่วยงาน / บริษัท
                    </h3>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        {(["ภาครัฐ", "เอกชน"] as const).map(type => (
                          <button
                            key={type}
                            onClick={() => setNewSale(prev => ({ ...prev, customerType: type }))}
                            className={`py-2.5 rounded-xl text-xs font-black transition-all border ${
                              newSale.customerType === type 
                                ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/30" 
                                : "bg-white dark:bg-gray-800 text-gray-400 border-gray-100 dark:border-gray-700 hover:bg-gray-50"
                            }`}
                          >
                            {type === "ภาครัฐ" ? "🏛️ " : "🏢 "} {type}
                          </button>
                        ))}
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1" htmlFor="customer-name-input">ชื่อหน่วยงาน / บริษัท</label>
                        <input
                          id="customer-name-input"
                          type="text"
                          value={newSale.customerName}
                          onChange={(e) => setNewSale(prev => ({ ...prev, customerName: e.target.value }))}
                          placeholder="เช่น องค์การบริหารส่วนจังหวัด..., บจก. ..."
                          className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1" htmlFor="tax-id-input">เลขประจำตัวผู้เสียภาษี (Tax ID)</label>
                        <input
                          id="tax-id-input"
                          type="text"
                          value={newSale.customerTaxId}
                          onChange={(e) => setNewSale(prev => ({ ...prev, customerTaxId: e.target.value }))}
                          placeholder="เลข 13 หลัก"
                          className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1" htmlFor="customer-address-input">ที่อยู่ออกใบกำกับภาษี</label>
                        <textarea
                          id="customer-address-input"
                          value={newSale.customerAddress}
                          onChange={(e) => setNewSale(prev => ({ ...prev, customerAddress: e.target.value }))}
                          placeholder="ระบุที่อยู่ให้ครบถ้วน..."
                          className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all h-20 resize-none text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Order & Payment Info */}
                  <div className="space-y-4 p-5 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-3xl border border-emerald-100 dark:border-emerald-800/50 shadow-inner">
                    <h3 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2 ml-1">
                      <Clock className="w-3 h-3" /> ข้อมูลการขายและชำระเงิน
                    </h3>
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest block ml-1" htmlFor="reference-po-select">อ้างอิงใบสั่งซื้อจาก ปตท.</label>
                        <select
                          id="reference-po-select"
                          value={newSale.referencePoNo}
                          onChange={(e) => handleSelectPO(e.target.value)}
                          className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-blue-200 rounded-xl font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                        >
                          <option value="">-- ไม่ระบุ (คีย์ข้อมูลเอง) --</option>
                          {availableOrders.map(po => (
                            <option key={po.orderNo} value={po.orderNo}>
                              {po.orderNo} ({new Date(po.deliveryDate || "").toLocaleDateString("th-TH")}) - {po.items.reduce((s, i) => s + i.quantity, 0).toLocaleString()} ลิตร
                            </option>
                          ))}
                        </select>
                        <p className="text-[9px] text-gray-400 mt-1 italic font-medium ml-1">
                          * เลือกเพื่อดึงรายการน้ำมันและจำนวนลิตรเข้าคลังอัตโนมัติ
                        </p>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest block ml-1" htmlFor="sale-date-input">วันที่ทำรายการ</label>
                        <input
                          id="sale-date-input"
                          type="date"
                          value={newSale.saleDate}
                          onChange={(e) => setNewSale(prev => ({ ...prev, saleDate: e.target.value }))}
                          className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-emerald-100 dark:border-emerald-800/50 rounded-xl font-bold outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-sm"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest block ml-1">วิธีการชำระเงิน</span>
                        <div className="grid grid-cols-2 gap-2">
                          {(["เงินสด", "เงินโอน", "เครดิต", "อื่นๆ"] as const).map(m => (
                            <button
                              key={m}
                              onClick={() => setNewSale(prev => ({ ...prev, paymentMethod: m }))}
                              className={`py-2 rounded-xl text-xs font-black transition-all border ${
                                newSale.paymentMethod === m 
                                  ? "bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/30" 
                                  : "bg-white dark:bg-gray-800 text-gray-400 border-emerald-100 dark:border-emerald-800/50 hover:bg-emerald-50"
                              }`}
                            >
                              {m}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest block ml-1" htmlFor="notes-textarea">หมายเหตุเพิ่มเติม</label>
                        <textarea
                          id="notes-textarea"
                          value={newSale.notes}
                          onChange={(e) => setNewSale(prev => ({ ...prev, notes: e.target.value }))}
                          placeholder="ระบุเลขที่สัญญาหรืองบประมาณ (ถ้ามี)..."
                          className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-emerald-100 dark:border-emerald-800/50 rounded-xl font-bold outline-none focus:ring-2 focus:ring-emerald-500 transition-all h-20 resize-none text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Oil Items */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between px-1">
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                      <Droplet className="w-3 h-3 text-blue-600" /> รายการน้ำมันที่จัดส่ง
                    </h3>
                    <button
                      onClick={handleAddItem}
                      className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl text-[10px] font-black border border-blue-100 dark:border-blue-800/50 hover:bg-blue-100 transition-colors flex items-center gap-1.5 shadow-sm"
                    >
                      <Plus className="w-3 h-3" /> เพิ่มรายการน้ำมัน
                    </button>
                  </div>

                  <div className="space-y-3">
                    {newSale.items.map((item, index) => (
                      <div key={index} className="p-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm space-y-4 relative group hover:border-blue-300 transition-colors">
                        {newSale.items.length > 1 && (
                          <button
                            onClick={() => handleRemoveItem(index)}
                            className="absolute -right-2 -top-2 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity active:scale-95 z-10"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1" htmlFor={`oil-type-${index}`}>ชนิดน้ำมัน</label>
                          <select
                            id={`oil-type-${index}`}
                            value={item.oilType}
                            onChange={(e) => handleUpdateItem(index, { oilType: e.target.value as OilType })}
                            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl font-bold text-gray-700 dark:text-gray-300 outline-none text-sm"
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
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1" htmlFor={`quantity-${index}`}>จำนวน (ลิตร)</label>
                          <div className="relative">
                            <input
                              id={`quantity-${index}`}
                              type="number"
                              value={item.quantity || ""}
                              onChange={(e) => handleUpdateItem(index, { quantity: Number(e.target.value) })}
                              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl font-black text-emerald-600 text-right pr-12 outline-none text-sm"
                              placeholder="0"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-300 uppercase">Liters</span>
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1" htmlFor={`price-${index}`}>ราคาต่อลิตร (บาท)</label>
                          <div className="relative">
                            <input
                              id={`price-${index}`}
                              type="number"
                              value={item.pricePerLiter || ""}
                              onChange={(e) => handleUpdateItem(index, { pricePerLiter: Number(e.target.value) })}
                              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl font-black text-blue-600 text-right pr-12 outline-none text-sm"
                              placeholder="0.00"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-300 uppercase">THB</span>
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

                {/* Total Summary Bar */}
                <div className="p-6 bg-blue-600 rounded-3xl shadow-xl shadow-blue-500/20 flex flex-col md:flex-row items-center justify-between text-white gap-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/20 rounded-2xl">
                      <DollarSign className="w-8 h-8" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-blue-100">ยอดรวมสุทธิ (Net Total)</p>
                      <p className="text-4xl font-black">{currencyFormatter.format(totalAmount)}</p>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-blue-100 italic">
                      ({convertNumberToThaiWords(totalAmount)})
                    </p>
                    <p className="text-xs font-bold text-blue-200">
                      รวมปริมาณน้ำมันทั้งหมด {newSale.items.reduce((s, i) => s + i.quantity, 0).toLocaleString()} ลิตร
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3 sticky bottom-0 z-10">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-10 py-3 bg-gray-900 dark:bg-gray-700 hover:bg-black dark:hover:bg-gray-600 text-white rounded-2xl font-black transition-all shadow-lg active:scale-95"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleSaveSale}
                  className="px-10 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black transition-all shadow-lg shadow-emerald-600/20 active:scale-95 flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  ยืนยันและบันทึกการขาย
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
              <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-emerald-50 dark:bg-emerald-900/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500 rounded-xl">
                    <Building className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-emerald-800 dark:text-emerald-400">รายละเอียดการขายภายนอก</h2>
                    <p className="text-xs text-emerald-600 dark:text-emerald-500 font-bold">เลขที่บิล: {selectedSale.saleNo}</p>
                  </div>
                </div>
                <button onClick={() => setShowDetailModal(false)} className="p-2 hover:bg-white dark:hover:bg-gray-700 rounded-full transition-colors">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-6">
                {/* Customer Dashboard */}
                <div className="p-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl text-white shadow-xl shadow-blue-500/20">
                  <div className="flex items-start justify-between mb-4">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-widest text-blue-100">ลูกค้า / หน่วยงาน</p>
                      <h3 className="text-2xl font-black">{selectedSale.customerName}</h3>
                      <div className="flex items-center gap-3 mt-1 text-sm font-bold text-blue-100">
                        <span className="px-2 py-0.5 bg-white/20 rounded-lg text-[10px] uppercase">{selectedSale.customerType}</span>
                        <span className="flex items-center gap-1.5"><Tag className="w-3 h-3" /> Tax ID: {selectedSale.customerTaxId}</span>
                      </div>
                    </div>
                    <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm">
                      <User className="w-8 h-8" />
                    </div>
                  </div>
                  <div className="p-4 bg-black/10 rounded-2xl backdrop-blur-sm border border-white/10 text-sm italic font-medium">
                    <p className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 mt-0.5 text-blue-200" />
                      {selectedSale.customerAddress || "ไม่ได้ระบุที่อยู่"}
                    </p>
                  </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-700">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">วันที่ขาย</span>
                    <p className="font-black text-gray-800 dark:text-white">{new Date(selectedSale.saleDate).toLocaleDateString('th-TH')}</p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-700">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">วิธีการชำระ</span>
                    <p className="font-black text-emerald-600">{selectedSale.paymentMethod}</p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-700">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">สถานะบิล</span>
                    <StatusTag variant={getStatusVariant(selectedSale.status)}>{selectedSale.status}</StatusTag>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-700">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">ผู้บันทึก</span>
                    <p className="font-black text-gray-800 dark:text-white truncate">{selectedSale.recordedBy}</p>
                  </div>
                </div>

                {/* Items Table */}
                <div className="space-y-3">
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 px-1">
                    <Droplet className="w-3 h-3 text-blue-600" /> รายการที่ขาย
                  </h3>
                  <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm">
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-gray-900/50">
                        <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                          <th className="px-6 py-4 text-left">ประเภทน้ำมัน</th>
                          <th className="px-6 py-4 text-right">จำนวน</th>
                          <th className="px-6 py-4 text-right">ราคา/ลิตร</th>
                          <th className="px-6 py-4 text-right">รวมเป็นเงิน</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {selectedSale.items.map((item, idx) => (
                          <tr key={idx} className="font-medium">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-2 h-8 bg-blue-500 rounded-full"></div>
                                <span className="font-black text-gray-800 dark:text-gray-200">{item.oilType}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right font-bold text-gray-700 dark:text-gray-300">{item.quantity.toLocaleString()} ลิตร</td>
                            <td className="px-6 py-4 text-right font-bold text-blue-600 dark:text-blue-400">{currencyFormatter.format(item.pricePerLiter)}</td>
                            <td className="px-6 py-4 text-right font-black text-gray-900 dark:text-white">{currencyFormatter.format(item.totalAmount)}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-blue-50/50 dark:bg-blue-900/10">
                        <tr>
                          <td colSpan={3} className="px-6 py-4 text-right">
                            <span className="text-xs font-black text-blue-600 uppercase tracking-widest">ยอดรวมสุทธิ</span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="text-xl font-black text-blue-600 dark:text-blue-400">{currencyFormatter.format(selectedSale.totalAmount)}</span>
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

                {/* Notes */}
                {selectedSale.notes && (
                  <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-100 dark:border-amber-800/50">
                    <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest block mb-1">หมายเหตุ</span>
                    <p className="text-sm font-medium text-amber-800 dark:text-amber-300 italic">&ldquo;{selectedSale.notes}&rdquo;</p>
                  </div>
                )}
              </div>

              <div className="p-6 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3 sticky bottom-0 z-10">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-10 py-3 bg-gray-900 dark:bg-gray-700 hover:bg-black dark:hover:bg-gray-600 text-white rounded-2xl font-black transition-all shadow-lg active:scale-95"
                >
                  ปิดหน้าต่าง
                </button>
                <button
                  onClick={() => handleDownloadInvoice(selectedSale)}
                  className="px-10 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black transition-all shadow-lg shadow-emerald-600/20 active:scale-95 flex items-center justify-center gap-2"
                >
                  <Printer className="w-5 h-5" />
                  ใบกำกับภาษี
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
