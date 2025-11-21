import { useState, useMemo } from "react";
import {
  Droplet,
  Truck,
  ClipboardList,
  FileText,
  CheckCircle2,
  Plus,
  DollarSign,
  Receipt,
  Camera,
  CreditCard,
  Download,
  Upload,
  Eye,
  Calculator,
  Search,
  History,
  X,
} from "lucide-react";

const numberFormatter = new Intl.NumberFormat("th-TH");
const currencyFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  minimumFractionDigits: 2,
});

// Interface for PO History
interface POHistory {
  id: string;
  poNumber: string;
  requestDate: string; // วันที่สาขาส่งคำขอมา
  poDate: string; // วันที่สร้าง PO
  supplier: string;
  status: "รอชำระเงิน" | "ชำระเงินแล้ว" | "จัดส่งแล้ว" | "เสร็จสมบูรณ์";
  total: number;
  branches: string[];
  items: {
    type: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
}

// Mock data - Branch Requests (เพิ่ม requestDate)
const mockBranchRequests = [
  {
    id: "BR001",
    branch: "สาขา 1 (สำนักงานใหญ่)",
    requestDate: "2024-12-14", // วันที่ส่งคำขอ
    deliveryTime: "08:30",
    diesel: 5000,
    gasohol95: 3000,
    e20: 0,
    gasohol91: 2000,
    status: "รอสั่งซื้อ",
  },
  {
    id: "BR002",
    branch: "สาขา 2 (ตลาด)",
    requestDate: "2024-12-14",
    deliveryTime: "08:45",
    diesel: 4000,
    gasohol95: 4000,
    e20: 1500,
    gasohol91: 0,
    status: "รอสั่งซื้อ",
  },
  {
    id: "BR003",
    branch: "สาขา 3 (บายพาส)",
    requestDate: "2024-12-14",
    deliveryTime: "09:00",
    diesel: 10000,
    gasohol95: 5000,
    e20: 3000,
    gasohol91: 3000,
    status: "รอสั่งซื้อ",
  },
  {
    id: "BR004",
    branch: "สาขา 4 (ชุมชน)",
    requestDate: "2024-12-13",
    deliveryTime: "08:15",
    diesel: 2000,
    gasohol95: 2000,
    e20: 0,
    gasohol91: 1000,
    status: "รวมยอดแล้ว",
  },
  {
    id: "BR005",
    branch: "สาขา 5 (ทางหลวง)",
    requestDate: "2024-12-14",
    deliveryTime: "09:10",
    diesel: 8000,
    gasohol95: 6000,
    e20: 4000,
    gasohol91: 4000,
    status: "รอสั่งซื้อ",
  },
];

// Mock data - PO History (หลายบิล)
const mockPOHistory: POHistory[] = [
  {
    id: "PO001",
    poNumber: "PO-2024-001",
    requestDate: "2024-12-13",
    poDate: "2024-12-15",
    supplier: "บริษัท PTT จำกัด (มหาชน)",
    status: "ชำระเงินแล้ว",
    total: 2730240,
    branches: ["สาขา 4 (ชุมชน)"],
    items: [
      { type: "Diesel", quantity: 2000, unitPrice: 35.00, total: 70000 },
      { type: "Gasohol 95", quantity: 2000, unitPrice: 40.00, total: 80000 },
      { type: "Gasohol 91", quantity: 1000, unitPrice: 39.00, total: 39000 },
    ],
  },
  {
    id: "PO002",
    poNumber: "PO-2024-002",
    requestDate: "2024-12-14",
    poDate: "2024-12-15",
    supplier: "บริษัท PTT จำกัด (มหาชน)",
    status: "รอชำระเงิน",
    total: 2730240,
    branches: ["สาขา 1 (สำนักงานใหญ่)", "สาขา 2 (ตลาด)", "สาขา 3 (บายพาส)", "สาขา 5 (ทางหลวง)"],
    items: [
      { type: "Diesel", quantity: 27000, unitPrice: 35.00, total: 945000 },
      { type: "Gasohol 95", quantity: 18000, unitPrice: 40.00, total: 720000 },
      { type: "E20", quantity: 8500, unitPrice: 38.00, total: 323000 },
      { type: "Gasohol 91", quantity: 9000, unitPrice: 39.00, total: 351000 },
    ],
  },
  {
    id: "PO003",
    poNumber: "PO-2024-003",
    requestDate: "2024-12-10",
    poDate: "2024-12-12",
    supplier: "บริษัท PTT จำกัด (มหาชน)",
    status: "เสร็จสมบูรณ์",
    total: 1500000,
    branches: ["สาขา 1 (สำนักงานใหญ่)", "สาขา 2 (ตลาด)"],
    items: [
      { type: "Diesel", quantity: 15000, unitPrice: 35.00, total: 525000 },
      { type: "Gasohol 95", quantity: 10000, unitPrice: 40.00, total: 400000 },
      { type: "E20", quantity: 5000, unitPrice: 38.00, total: 190000 },
    ],
  },
];

// Mock data - Current Bulk PO
const mockBulkPO = {
  poNumber: "PO-2024-002",
  date: "2024-12-15",
  supplier: "บริษัท PTT จำกัด (มหาชน)",
  status: "รอชำระเงิน",
  items: [
    { type: "Diesel", quantity: 27000, unitPrice: 35.00, total: 945000 },
    { type: "Gasohol 95", quantity: 18000, unitPrice: 40.00, total: 720000 },
    { type: "E20", quantity: 8500, unitPrice: 38.00, total: 323000 },
    { type: "Gasohol 91", quantity: 9000, unitPrice: 39.00, total: 351000 },
  ],
  subtotal: 2339000,
  vat: 187120,
  total: 2526120,
  quotationFile: "quotation-2024-002.pdf",
  invoiceFile: null,
  receiptFile: null,
};

// Mock data - Delivery Records
const mockDeliveries = [
  {
    id: "DEL001",
    branch: "สาขา 1 (สำนักงานใหญ่)",
    deliveryDate: "2024-12-16",
    deliveryTime: "08:30",
    items: [
      { type: "Diesel", quantity: 5000, meterReading: "50000" },
      { type: "Gasohol 95", quantity: 3000, meterReading: "30000" },
      { type: "Gasohol 91", quantity: 2000, meterReading: "20000" },
    ],
    photos: ["photo1.jpg", "photo2.jpg"],
    status: "รับแล้ว",
    verified: true,
  },
  {
    id: "DEL002",
    branch: "สาขา 2 (ตลาด)",
    deliveryDate: "2024-12-16",
    deliveryTime: "08:45",
    items: [
      { type: "Diesel", quantity: 4000, meterReading: "40000" },
      { type: "Gasohol 95", quantity: 4000, meterReading: "40000" },
      { type: "E20", quantity: 1500, meterReading: "15000" },
    ],
    photos: ["photo3.jpg"],
    status: "รับแล้ว",
    verified: true,
  },
  {
    id: "DEL003",
    branch: "สาขา 3 (บายพาส)",
    deliveryDate: "2024-12-17",
    deliveryTime: "09:00",
    items: [
      { type: "Diesel", quantity: 10000, meterReading: "100000" },
      { type: "Gasohol 95", quantity: 5000, meterReading: "50000" },
      { type: "E20", quantity: 3000, meterReading: "30000" },
      { type: "Gasohol 91", quantity: 3000, meterReading: "30000" },
    ],
    photos: [],
    status: "รอส่ง",
    verified: false,
  },
];

// Mock data - Cost Distribution
const mockCostDistribution = [
  {
    branch: "สาขา 1 (สำนักงานใหญ่)",
    diesel: { quantity: 5000, cost: 175000 },
    gasohol95: { quantity: 3000, cost: 120000 },
    gasohol91: { quantity: 2000, cost: 78000 },
    total: 373000,
    internalInvoice: "INV-INT-001",
    paymentStatus: "รอชำระ",
  },
  {
    branch: "สาขา 2 (ตลาด)",
    diesel: { quantity: 4000, cost: 140000 },
    gasohol95: { quantity: 4000, cost: 160000 },
    e20: { quantity: 1500, cost: 57000 },
    total: 357000,
    internalInvoice: "INV-INT-002",
    paymentStatus: "รอชำระ",
  },
];

export default function Requisitions() {
  const [activeTab, setActiveTab] = useState<"requests" | "po" | "delivery" | "history">("requests");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [selectedPO, setSelectedPO] = useState<POHistory | null>(null);

  // Calculate totals
  const totals = {
    diesel: mockBranchRequests.reduce((sum, req) => sum + req.diesel, 0),
    gasohol95: mockBranchRequests.reduce((sum, req) => sum + req.gasohol95, 0),
    e20: mockBranchRequests.reduce((sum, req) => sum + req.e20, 0),
    gasohol91: mockBranchRequests.reduce((sum, req) => sum + req.gasohol91, 0),
  };

  const totalPending = totals.diesel + totals.gasohol95 + totals.e20 + totals.gasohol91;
  const branchesWithPending = mockBranchRequests.filter((req) => req.status === "รอสั่งซื้อ").length;

  // Calculate progress percentages
  const dieselProgress = 60;
  const gasohol95Progress = 45;
  const e20g91Progress = 30;

  // Filter PO History
  const filteredPOHistory = useMemo(() => {
    return mockPOHistory.filter((po) => {
      // Search filter
      const matchesSearch =
        searchQuery === "" ||
        po.poNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        po.supplier.toLowerCase().includes(searchQuery.toLowerCase()) ||
        po.branches.some((b) => b.toLowerCase().includes(searchQuery.toLowerCase()));

      // Status filter
      const matchesStatus = filterStatus === "all" || po.status === filterStatus;

      // Date filter
      const matchesDate =
        filterDateFrom === "" ||
        filterDateTo === "" ||
        (po.requestDate >= filterDateFrom && po.requestDate <= filterDateTo);

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [searchQuery, filterStatus, filterDateFrom, filterDateTo]);

  const handleConsolidate = () => {
    alert("กำลังรวมยอดและสร้างใบสั่งซื้อรวม (Bulk PO)...");
  };

  const handleUploadQuotation = () => {
    alert("อัปโหลดใบเสนอราคา");
  };

  const handleUploadInvoice = () => {
    alert("อัปโหลดใบกำกับภาษี");
  };

  const handleUploadReceipt = () => {
    alert("อัปโหลดใบเสร็จรับเงิน");
  };

  const handleMarkPaid = () => {
    alert("บันทึกการชำระเงินแล้ว");
  };

  const handleUploadDeliveryPhoto = (deliveryId: string) => {
    alert(`อัปโหลดรูปหลักฐานการรับน้ำมัน - ${deliveryId}`);
  };

  const handleVerifyDelivery = (deliveryId: string) => {
    alert(`ยืนยันการรับน้ำมัน - ${deliveryId}`);
  };

  const handleGenerateInternalInvoice = (branch: string) => {
    alert(`สร้างใบเสร็จภายในสำหรับ ${branch}`);
  };

  const handleViewPODetails = (po: POHistory) => {
    setSelectedPO(po);
  };

  const handleClosePODetails = () => {
    setSelectedPO(null);
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6">
      {/* Header Section */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Droplet className="h-8 w-8 text-blue-600" />
          ระบบสั่งซื้อน้ำมัน (Centralized Oil Ordering)
        </h2>
        <p className="text-slate-500 text-sm mt-1">
          รวบรวมคำขอจาก 5 สาขา → สั่งซื้อแบบ Bulk (ประหยัดต้นทุน) → จัดส่ง → กระจายต้นทุน
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
          <div className="flex items-center gap-2 text-blue-700 mb-2">
            <Truck className="h-5 w-5" />
            <span className="font-bold">รวมยอดรอสั่ง (Pending)</span>
          </div>
          <div className="text-2xl font-bold text-blue-900">
            {numberFormatter.format(totalPending)} ลิตร
          </div>
          <div className="text-xs text-blue-600 mt-1">จาก {branchesWithPending} สาขา</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="text-xs text-gray-500 mb-1">Diesel (รอสั่ง)</div>
          <div className="text-xl font-bold text-slate-800">
            {numberFormatter.format(totals.diesel)} L
          </div>
          <div className="w-full bg-gray-100 h-1.5 rounded-full mt-2">
            <div
              className="bg-yellow-400 h-1.5 rounded-full"
              style={{ width: `${dieselProgress}%` }}
            />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="text-xs text-gray-500 mb-1">Gasohol 95 (รอสั่ง)</div>
          <div className="text-xl font-bold text-slate-800">
            {numberFormatter.format(totals.gasohol95)} L
          </div>
          <div className="w-full bg-gray-100 h-1.5 rounded-full mt-2">
            <div
              className="bg-orange-500 h-1.5 rounded-full"
              style={{ width: `${gasohol95Progress}%` }}
            />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="text-xs text-gray-500 mb-1">E20 + G91 (รอสั่ง)</div>
          <div className="text-xl font-bold text-slate-800">
            {numberFormatter.format(totals.e20 + totals.gasohol91)} L
          </div>
          <div className="w-full bg-gray-100 h-1.5 rounded-full mt-2">
            <div
              className="bg-green-500 h-1.5 rounded-full"
              style={{ width: `${e20g91Progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-200 bg-white rounded-t-lg px-4 pt-2">
        <button
          onClick={() => setActiveTab("requests")}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "requests"
              ? "border-blue-600 text-blue-600 bg-blue-50/50"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <ClipboardList className="h-4 w-4" />
          1. รวบรวมคำขอ (Branch Requests)
        </button>
        <button
          onClick={() => setActiveTab("po")}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "po"
              ? "border-blue-600 text-blue-600 bg-blue-50/50"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <FileText className="h-4 w-4" />
          2. ใบสั่งซื้อรวม (Bulk PO)
        </button>
        <button
          onClick={() => setActiveTab("delivery")}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "delivery"
              ? "border-blue-600 text-blue-600 bg-blue-50/50"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <CheckCircle2 className="h-4 w-4" />
          3. ตรวจรับสินค้า (Delivery Check)
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "history"
              ? "border-blue-600 text-blue-600 bg-blue-50/50"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <History className="h-4 w-4" />
          4. ประวัติการสั่งซื้อ (PO History)
        </button>
      </div>

      {/* Content Section */}
      <div className="bg-white rounded-b-xl shadow-sm border border-t-0 border-gray-200 p-6">
        {/* Tab 1: Branch Requests */}
        {activeTab === "requests" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-slate-700 text-lg">
                  รายการความต้องการน้ำมันจากสาขา (ประจำวันนี้)
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  สาขาย่อยแจ้งความต้องการ → สำนักงานใหญ่รวบรวมคำขอทั้งหมด
                </p>
              </div>
              <button
                onClick={handleConsolidate}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm font-medium"
              >
                <Plus className="h-4 w-4" />
                รวมยอดและสร้าง PO (Consolidate)
              </button>
            </div>

            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                  <tr>
                    <th className="p-3">สาขา</th>
                    <th className="p-3 text-center">วันที่ส่งคำขอ</th>
                    <th className="p-3 text-center">เวลาส่ง</th>
                    <th className="p-3 text-right">Diesel (L)</th>
                    <th className="p-3 text-right">Gasohol 95 (L)</th>
                    <th className="p-3 text-right">E20 (L)</th>
                    <th className="p-3 text-right">Gasohol 91 (L)</th>
                    <th className="p-3 text-center">สถานะ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {mockBranchRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-gray-50">
                      <td className="p-3 font-medium text-slate-700">{req.branch}</td>
                      <td className="p-3 text-center text-gray-600">
                        {new Date(req.requestDate).toLocaleDateString("th-TH")}
                      </td>
                      <td className="p-3 text-center text-gray-500">{req.deliveryTime}</td>
                      <td className="p-3 text-right text-yellow-600 font-mono">
                        {req.diesel > 0 ? numberFormatter.format(req.diesel) : "-"}
                      </td>
                      <td className="p-3 text-right text-orange-600 font-mono">
                        {req.gasohol95 > 0 ? numberFormatter.format(req.gasohol95) : "-"}
                      </td>
                      <td className="p-3 text-right text-green-600 font-mono">
                        {req.e20 > 0 ? numberFormatter.format(req.e20) : "-"}
                      </td>
                      <td className="p-3 text-right text-green-800 font-mono">
                        {req.gasohol91 > 0 ? numberFormatter.format(req.gasohol91) : "-"}
                      </td>
                      <td className="p-3 text-center">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            req.status === "รวมยอดแล้ว"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {req.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-blue-50/50 font-bold text-slate-800">
                    <td colSpan={3} className="p-3 text-right">
                      รวมทั้งหมด
                    </td>
                    <td className="p-3 text-right">{numberFormatter.format(totals.diesel)}</td>
                    <td className="p-3 text-right">{numberFormatter.format(totals.gasohol95)}</td>
                    <td className="p-3 text-right">{numberFormatter.format(totals.e20)}</td>
                    <td className="p-3 text-right">{numberFormatter.format(totals.gasohol91)}</td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Bulk PO */}
        {activeTab === "po" && (
          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-slate-700 text-lg mb-1">
                ใบสั่งซื้อรวม (Bulk PO) - สั่งซื้อก้อนใหญ่ครั้งเดียว
              </h3>
              <p className="text-sm text-gray-500">
                สำนักงานใหญ่สั่งซื้อจากปั๊มน้ำมันใหญ่ → ได้ใบเสนอราคา → ชำระเงิน → ได้ใบกำกับภาษี/ใบเสร็จรับเงิน
              </p>
            </div>

            {/* PO Information */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">เลขที่ PO</p>
                  <p className="font-bold text-slate-800">{mockBulkPO.poNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">วันที่</p>
                  <p className="font-semibold text-slate-800">{mockBulkPO.date}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">สถานะ</p>
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">
                    {mockBulkPO.status}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">ซัพพลายเออร์</p>
                <p className="font-semibold text-slate-800">{mockBulkPO.supplier}</p>
              </div>
            </div>

            {/* PO Items */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-3 text-left">ชนิดน้ำมัน</th>
                    <th className="p-3 text-right">จำนวน (ลิตร)</th>
                    <th className="p-3 text-right">ราคาต่อลิตร</th>
                    <th className="p-3 text-right">รวม</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {mockBulkPO.items.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="p-3 font-medium text-slate-700">{item.type}</td>
                      <td className="p-3 text-right font-mono">{numberFormatter.format(item.quantity)}</td>
                      <td className="p-3 text-right">{currencyFormatter.format(item.unitPrice)}</td>
                      <td className="p-3 text-right font-bold">{currencyFormatter.format(item.total)}</td>
                    </tr>
                  ))}
                  <tr className="bg-gray-50 font-bold">
                    <td colSpan={3} className="p-3 text-right">ยอดรวมก่อน VAT</td>
                    <td className="p-3 text-right">{currencyFormatter.format(mockBulkPO.subtotal)}</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td colSpan={3} className="p-3 text-right">VAT 8%</td>
                    <td className="p-3 text-right">{currencyFormatter.format(mockBulkPO.vat)}</td>
                  </tr>
                  <tr className="bg-blue-50 font-bold text-lg">
                    <td colSpan={3} className="p-3 text-right">รวมทั้งสิ้น</td>
                    <td className="p-3 text-right text-blue-700">{currencyFormatter.format(mockBulkPO.total)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Documents Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <span className="font-semibold text-slate-800">ใบเสนอราคา</span>
                  </div>
                  {mockBulkPO.quotationFile && (
                    <button className="text-blue-600 hover:text-blue-700">
                      <Download className="h-4 w-4" />
                    </button>
                  )}
                </div>
                {mockBulkPO.quotationFile ? (
                  <p className="text-sm text-gray-600 mb-2">{mockBulkPO.quotationFile}</p>
                ) : (
                  <button
                    onClick={handleUploadQuotation}
                    className="w-full px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
                  >
                    <Upload className="h-4 w-4" />
                    อัปโหลดใบเสนอราคา
                  </button>
                )}
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Receipt className="h-5 w-5 text-green-600" />
                    <span className="font-semibold text-slate-800">ใบกำกับภาษี</span>
                  </div>
                  {mockBulkPO.invoiceFile && (
                    <button className="text-green-600 hover:text-green-700">
                      <Download className="h-4 w-4" />
                    </button>
                  )}
                </div>
                {mockBulkPO.invoiceFile ? (
                  <p className="text-sm text-gray-600 mb-2">{mockBulkPO.invoiceFile}</p>
                ) : (
                  <button
                    onClick={handleUploadInvoice}
                    className="w-full px-4 py-2 bg-green-50 hover:bg-green-100 text-green-600 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
                  >
                    <Upload className="h-4 w-4" />
                    อัปโหลดใบกำกับภาษี
                  </button>
                )}
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-purple-600" />
                    <span className="font-semibold text-slate-800">ใบเสร็จรับเงิน</span>
                  </div>
                  {mockBulkPO.receiptFile && (
                    <button className="text-purple-600 hover:text-purple-700">
                      <Download className="h-4 w-4" />
                    </button>
                  )}
                </div>
                {mockBulkPO.receiptFile ? (
                  <p className="text-sm text-gray-600 mb-2">{mockBulkPO.receiptFile}</p>
                ) : (
                  <button
                    onClick={handleUploadReceipt}
                    className="w-full px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-600 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
                  >
                    <Upload className="h-4 w-4" />
                    อัปโหลดใบเสร็จรับเงิน
                  </button>
                )}
              </div>
            </div>

            {/* Payment Section */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-800 mb-1">สถานะการชำระเงิน</p>
                  <p className="text-sm text-gray-600">รอชำระเงินก้อนใหญ่ให้บริษัทน้ำมัน</p>
                </div>
                <button
                  onClick={handleMarkPaid}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
                >
                  <DollarSign className="h-4 w-4" />
                  บันทึกการชำระเงิน
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Delivery Check */}
        {activeTab === "delivery" && (
          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-slate-700 text-lg mb-1">
                ตรวจรับสินค้าและกระจายต้นทุน
              </h3>
              <p className="text-sm text-gray-500">
                บริษัทน้ำมันจัดส่ง → สาขาถ่ายหลักฐาน → สำนักงานใหญ่กระจายต้นทุน → ออกใบเสร็จภายใน
              </p>
            </div>

            {/* Delivery Records */}
            <div className="space-y-4">
              <h4 className="font-semibold text-slate-700">บันทึกการจัดส่ง</h4>
              {mockDeliveries.map((delivery) => (
                <div
                  key={delivery.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Truck className="h-5 w-5 text-blue-600" />
                        <span className="font-bold text-slate-800">{delivery.branch}</span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            delivery.status === "รับแล้ว"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {delivery.status}
                        </span>
                        {delivery.verified && (
                          <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
                            ✓ ยืนยันแล้ว
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        วันที่ส่ง: {delivery.deliveryDate} เวลา: {delivery.deliveryTime}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {!delivery.verified && (
                        <button
                          onClick={() => handleVerifyDelivery(delivery.id)}
                          className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-medium transition-colors"
                        >
                          ยืนยันการรับ
                        </button>
                      )}
                      <button
                        onClick={() => handleUploadDeliveryPhoto(delivery.id)}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1"
                      >
                        <Camera className="h-3 w-3" />
                        อัปโหลดรูป
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-3">
                    {delivery.items.map((item, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">{item.type}</p>
                        <p className="font-semibold text-slate-800">
                          {numberFormatter.format(item.quantity)} ลิตร
                        </p>
                        <p className="text-xs text-gray-500 mt-1">มิเตอร์: {item.meterReading}</p>
                      </div>
                    ))}
                  </div>
                  {delivery.photos.length > 0 && (
                    <div className="mt-3 flex gap-2">
                      {delivery.photos.map((photo, index) => (
                        <button
                          key={index}
                          className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs text-gray-600 flex items-center gap-1"
                        >
                          <Eye className="h-3 w-3" />
                          {photo}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Cost Distribution */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-slate-700">กระจายต้นทุนไปยังสาขาย่อย</h4>
                <span className="text-xs text-gray-500">
                  คำนวณส่วนแบ่งเงิน → ออกใบเสร็จภายใน → สาขาโอนเงินคืน
                </span>
              </div>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="p-3 text-left">สาขา</th>
                      <th className="p-3 text-right">Diesel</th>
                      <th className="p-3 text-right">Gasohol 95</th>
                      <th className="p-3 text-right">E20</th>
                      <th className="p-3 text-right">Gasohol 91</th>
                      <th className="p-3 text-right">รวมต้นทุน</th>
                      <th className="p-3 text-center">ใบเสร็จภายใน</th>
                      <th className="p-3 text-center">สถานะ</th>
                      <th className="p-3 text-center">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {mockCostDistribution.map((dist, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="p-3 font-medium text-slate-700">{dist.branch}</td>
                        <td className="p-3 text-right text-gray-600">
                          {dist.diesel ? (
                            <>
                              {numberFormatter.format(dist.diesel.quantity)} L
                              <br />
                              <span className="text-xs">{currencyFormatter.format(dist.diesel.cost)}</span>
                            </>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="p-3 text-right text-gray-600">
                          {dist.gasohol95 ? (
                            <>
                              {numberFormatter.format(dist.gasohol95.quantity)} L
                              <br />
                              <span className="text-xs">{currencyFormatter.format(dist.gasohol95.cost)}</span>
                            </>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="p-3 text-right text-gray-600">
                          {dist.e20 ? (
                            <>
                              {numberFormatter.format(dist.e20.quantity)} L
                              <br />
                              <span className="text-xs">{currencyFormatter.format(dist.e20.cost)}</span>
                            </>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="p-3 text-right text-gray-600">
                          {dist.gasohol91 ? (
                            <>
                              {numberFormatter.format(dist.gasohol91.quantity)} L
                              <br />
                              <span className="text-xs">{currencyFormatter.format(dist.gasohol91.cost)}</span>
                            </>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="p-3 text-right font-bold text-slate-800">
                          {currencyFormatter.format(dist.total)}
                        </td>
                        <td className="p-3 text-center">
                          {dist.internalInvoice ? (
                            <span className="text-xs text-blue-600 font-mono">{dist.internalInvoice}</span>
                          ) : (
                            <span className="text-xs text-gray-400">-</span>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              dist.paymentStatus === "รอชำระ"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-green-100 text-green-700"
                            }`}
                          >
                            {dist.paymentStatus}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => handleGenerateInternalInvoice(dist.branch)}
                            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1"
                          >
                            <Calculator className="h-3 w-3" />
                            สร้างใบเสร็จ
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: PO History */}
        {activeTab === "history" && (
          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-slate-700 text-lg mb-1">
                ประวัติการสั่งซื้อ (PO History)
              </h3>
              <p className="text-sm text-gray-500">
                ดูประวัติการสั่งซื้อทั้งหมด ค้นหาและกรองข้อมูลตามต้องการ
              </p>
            </div>

            {/* Search and Filter Section */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Search */}
                <div className="md:col-span-2">
                  <label className="block text-xs text-gray-500 mb-2">ค้นหา</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="ค้นหาตาม PO Number, สาขา, ซัพพลายเออร์..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="block text-xs text-gray-500 mb-2">สถานะ</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">ทั้งหมด</option>
                    <option value="รอชำระเงิน">รอชำระเงิน</option>
                    <option value="ชำระเงินแล้ว">ชำระเงินแล้ว</option>
                    <option value="จัดส่งแล้ว">จัดส่งแล้ว</option>
                    <option value="เสร็จสมบูรณ์">เสร็จสมบูรณ์</option>
                  </select>
                </div>

                {/* Date Range Filter */}
                <div>
                  <label className="block text-xs text-gray-500 mb-2">วันที่ส่งคำขอ</label>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={filterDateFrom}
                      onChange={(e) => setFilterDateFrom(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="จาก"
                    />
                    <input
                      type="date"
                      value={filterDateTo}
                      onChange={(e) => setFilterDateTo(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="ถึง"
                    />
                  </div>
                </div>
              </div>

              {/* Clear Filters */}
              {(searchQuery || filterStatus !== "all" || filterDateFrom || filterDateTo) && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setFilterStatus("all");
                    setFilterDateFrom("");
                    setFilterDateTo("");
                  }}
                  className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <X className="h-3 w-3" />
                  ล้างตัวกรอง
                </button>
              )}
            </div>

            {/* PO History Table */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-3 text-left">เลขที่ PO</th>
                    <th className="p-3 text-center">วันที่ส่งคำขอ</th>
                    <th className="p-3 text-center">วันที่สร้าง PO</th>
                    <th className="p-3 text-left">ซัพพลายเออร์</th>
                    <th className="p-3 text-center">จำนวนสาขา</th>
                    <th className="p-3 text-right">ยอดรวม</th>
                    <th className="p-3 text-center">สถานะ</th>
                    <th className="p-3 text-center">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredPOHistory.map((po) => (
                    <tr key={po.id} className="hover:bg-gray-50">
                      <td className="p-3 font-bold text-blue-600">{po.poNumber}</td>
                      <td className="p-3 text-center text-gray-600">
                        {new Date(po.requestDate).toLocaleDateString("th-TH")}
                      </td>
                      <td className="p-3 text-center text-gray-600">
                        {new Date(po.poDate).toLocaleDateString("th-TH")}
                      </td>
                      <td className="p-3 text-gray-700">{po.supplier}</td>
                      <td className="p-3 text-center">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                          {po.branches.length} สาขา
                        </span>
                      </td>
                      <td className="p-3 text-right font-bold text-slate-800">
                        {currencyFormatter.format(po.total)}
                      </td>
                      <td className="p-3 text-center">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            po.status === "เสร็จสมบูรณ์"
                              ? "bg-green-100 text-green-700"
                              : po.status === "ชำระเงินแล้ว"
                              ? "bg-blue-100 text-blue-700"
                              : po.status === "จัดส่งแล้ว"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {po.status}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => handleViewPODetails(po)}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1"
                        >
                          <Eye className="h-3 w-3" />
                          ดูรายละเอียด
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredPOHistory.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <p>ไม่พบข้อมูลที่ค้นหา</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* PO Details Modal */}
      {selectedPO && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-800">รายละเอียดใบสั่งซื้อ</h3>
                <p className="text-sm text-gray-500 mt-1">{selectedPO.poNumber}</p>
              </div>
              <button
                onClick={handleClosePODetails}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* PO Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">วันที่ส่งคำขอ</p>
                  <p className="font-semibold text-slate-800">
                    {new Date(selectedPO.requestDate).toLocaleDateString("th-TH")}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">วันที่สร้าง PO</p>
                  <p className="font-semibold text-slate-800">
                    {new Date(selectedPO.poDate).toLocaleDateString("th-TH")}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">สถานะ</p>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      selectedPO.status === "เสร็จสมบูรณ์"
                        ? "bg-green-100 text-green-700"
                        : selectedPO.status === "ชำระเงินแล้ว"
                        ? "bg-blue-100 text-blue-700"
                        : selectedPO.status === "จัดส่งแล้ว"
                        ? "bg-purple-100 text-purple-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {selectedPO.status}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">ซัพพลายเออร์</p>
                <p className="font-semibold text-slate-800">{selectedPO.supplier}</p>
              </div>

              {/* Branches */}
              <div>
                <p className="text-xs text-gray-500 mb-2">สาขาที่เกี่ยวข้อง</p>
                <div className="flex flex-wrap gap-2">
                  {selectedPO.branches.map((branch, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium"
                    >
                      {branch}
                    </span>
                  ))}
                </div>
              </div>

              {/* Items */}
              <div>
                <p className="text-xs text-gray-500 mb-2">รายการสินค้า</p>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="p-3 text-left">ชนิดน้ำมัน</th>
                        <th className="p-3 text-right">จำนวน (ลิตร)</th>
                        <th className="p-3 text-right">ราคาต่อลิตร</th>
                        <th className="p-3 text-right">รวม</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {selectedPO.items.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="p-3 font-medium text-slate-700">{item.type}</td>
                          <td className="p-3 text-right font-mono">{numberFormatter.format(item.quantity)}</td>
                          <td className="p-3 text-right">{currencyFormatter.format(item.unitPrice)}</td>
                          <td className="p-3 text-right font-bold">{currencyFormatter.format(item.total)}</td>
                        </tr>
                      ))}
                      <tr className="bg-blue-50 font-bold text-lg">
                        <td colSpan={3} className="p-3 text-right">รวมทั้งสิ้น</td>
                        <td className="p-3 text-right text-blue-700">
                          {currencyFormatter.format(selectedPO.total)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
