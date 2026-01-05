import { useState, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import {
  ShoppingCart,
  ClipboardList,
  Clock,
  Save,
  Trash2,
  Plus,
  Upload,
  X,
  Eye,
  FileText,
} from "lucide-react";

const currencyFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

interface PurchaseItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  totalPrice: number;
  supplier: string;
  paymentMethod: "cash" | "transfer" | "credit";
}

interface PurchaseEntry {
  id: string;
  date: string;
  items: PurchaseItem[];
  total: number;
  recorder: string;
  status: "สำเร็จ" | "รอดำเนินการ";
}

// Mock stock products for dropdown
const mockStockProducts = [
  { id: "P-001", name: "ข้าวตังหน้าหมูหยอง 80g", stock: 5 },
  { id: "P-002", name: "แหนมเนือง", stock: 150 },
  { id: "P-003", name: "เค้กมะพร้าวเนยสด", stock: 2 },
  { id: "P-004", name: "คุกกี้สิงค์โปร์", stock: 45 },
  { id: "P-005", name: "หมูหยอง 1 ขีด", stock: 8 },
];

// Mock history
const mockHistory: PurchaseEntry[] = [
  {
    id: "PE-001",
    date: "25/08/2568",
    items: [
      { id: "1", productId: "P-002", productName: "แหนมเนือง", quantity: 50, unit: "ชุด", pricePerUnit: 200, totalPrice: 10000, supplier: "ร้าน A", paymentMethod: "cash" },
      { id: "2", productId: "P-001", productName: "ข้าวตัง", quantity: 10, unit: "ถุง", pricePerUnit: 101.75, totalPrice: 1017.5, supplier: "ร้าน B", paymentMethod: "transfer" },
    ],
    total: 11017.5,
    recorder: "พนักงานขาย A",
    status: "สำเร็จ",
  },
  {
    id: "PE-002",
    date: "24/08/2568",
    items: [
      { id: "1", productId: "NEW", productName: "ถุงพลาสติก", quantity: 100, unit: "ชิ้น", pricePerUnit: 5, totalPrice: 500, supplier: "ร้าน C", paymentMethod: "cash" },
      { id: "2", productId: "NEW", productName: "กล่องโฟม", quantity: 50, unit: "ชิ้น", pricePerUnit: 15, totalPrice: 750, supplier: "ร้าน C", paymentMethod: "cash" },
    ],
    total: 1250,
    recorder: "พนักงานขาย B",
    status: "สำเร็จ",
  },
];

export default function OtopPurchases() {
  const [transactionDate, setTransactionDate] = useState("2025-11-21");
  const [purchaseItems, setPurchaseItems] = useState<PurchaseItem[]>([
    {
      id: "1",
      productId: "",
      productName: "",
      quantity: 0,
      unit: "ชิ้น",
      pricePerUnit: 0,
      totalPrice: 0,
      supplier: "",
      paymentMethod: "cash",
    },
  ]);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importDate, setImportDate] = useState({
    month: "",
    year: "",
    startDate: "",
    endDate: "",
  });
  const [selectedBillId, setSelectedBillId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const months = [
    "มกราคม",
    "กุมภาพันธ์",
    "มีนาคม",
    "เมษายน",
    "พฤษภาคม",
    "มิถุนายน",
    "กรกฎาคม",
    "สิงหาคม",
    "กันยายน",
    "ตุลาคม",
    "พฤศจิกายน",
    "ธันวาคม",
  ];

  const years = Array.from({ length: 10 }, (_, i) => 2568 - i); // 2568 ถึง 2559

  const netTotal = useMemo(() => {
    return purchaseItems.reduce((sum, item) => sum + item.totalPrice, 0);
  }, [purchaseItems]);

  const handleProductSelect = (itemId: string, productId: string) => {
    setPurchaseItems((items) =>
      items.map((item) => {
        if (item.id === itemId) {
          if (productId === "NEW") {
            return { ...item, productId: "NEW", productName: "" };
          }
          const selectedProduct = mockStockProducts.find((p) => p.id === productId);
          if (selectedProduct) {
            return { ...item, productId: selectedProduct.id, productName: selectedProduct.name };
          }
        }
        return item;
      })
    );
  };

  const handleItemChange = (itemId: string, field: keyof PurchaseItem, value: string | number) => {
    setPurchaseItems((items) =>
      items.map((item) => {
        if (item.id === itemId) {
          const updated = { ...item, [field]: value };
          if (field === "quantity" || field === "pricePerUnit") {
            updated.totalPrice = updated.quantity * updated.pricePerUnit;
          }
          return updated;
        }
        return item;
      })
    );
  };

  const addItem = () => {
    const newItem: PurchaseItem = {
      id: Date.now().toString(),
      productId: "",
      productName: "",
      quantity: 0,
      unit: "ชิ้น",
      pricePerUnit: 0,
      totalPrice: 0,
      supplier: "",
      paymentMethod: "cash",
    };
    setPurchaseItems([...purchaseItems, newItem]);
  };

  const removeItem = (itemId: string) => {
    if (purchaseItems.length > 1) {
      setPurchaseItems(purchaseItems.filter((item) => item.id !== itemId));
    }
  };

  const handleSave = () => {
    const hasValidItems = purchaseItems.some(
      (item) => item.productName && item.quantity > 0 && item.pricePerUnit > 0
    );

    if (!hasValidItems) {
      alert("กรุณากรอกข้อมูลสินค้าอย่างน้อย 1 รายการ");
      return;
    }

    const validItems = purchaseItems.filter(
      (item) => item.productName && item.quantity > 0 && item.pricePerUnit > 0
    );

    alert(
      `บันทึกข้อมูลเข้าสต็อกสำเร็จ\n\nรายการ: ${validItems.length} รายการ\nยอดรวม: ${currencyFormatter.format(netTotal)}\n\n(ฟังก์ชันนี้ยังเป็น Mock)`
    );

    // Reset form
    setPurchaseItems([
      {
        id: "1",
        productId: "",
        productName: "",
        quantity: 0,
        unit: "ชิ้น",
        pricePerUnit: 0,
        totalPrice: 0,
        supplier: "",
        paymentMethod: "cash",
      },
    ]);
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <ShoppingCart className="h-8 w-8 text-purple-600" />
            บันทึกการซื้อสินค้าเข้า (Purchase Entry)
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            สำหรับบันทึกรายการสินค้าที่พนักงานดำเนินการสั่งซื้อจากร้านภายนอกด้วยตนเอง
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            <Upload className="h-4 w-4" />
            นำเข้า Excel
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file && importDate.month && importDate.year) {
                const dateRange =
                  importDate.startDate && importDate.endDate
                    ? `\nช่วงวันที่: ${importDate.startDate} ถึง ${importDate.endDate}`
                    : "";
                alert(
                  `กำลังนำเข้าข้อมูลการซื้อสินค้าเข้า\nเดือน: ${importDate.month} ${importDate.year}${dateRange}\nจากไฟล์: ${file.name}\n\n(ฟังก์ชันนี้ยังเป็น Mock - ระบบจะอ่านไฟล์และอัปเดตข้อมูลอัตโนมัติ)`
                );
                setIsImportModalOpen(false);
                setImportDate({ month: "", year: "", startDate: "", endDate: "" });
              }
              if (e.target) {
                e.target.value = "";
              }
            }}
            className="hidden"
          />
          <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600">
            <label htmlFor="otop-transaction-date" className="mr-2">วันที่ทำรายการ:</label>
            <input
              id="otop-transaction-date"
              type="date"
              value={transactionDate}
              onChange={(e) => setTransactionDate(e.target.value)}
              className="font-medium text-slate-800 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Purchase Items Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
        <div className="p-4 bg-purple-50 border-b border-purple-100 flex justify-between items-center">
          <h3 className="font-bold text-purple-900 flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            รายการสินค้าที่สั่งซื้อ
          </h3>
          <div className="text-sm text-purple-700">
            * กรุณาเลือกสินค้าจากรายการ หรือพิมพ์ชื่อสินค้าใหม่หากไม่มีในระบบ
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-gray-50 text-gray-700 text-sm">
                <th className="p-4 w-12 text-center">#</th>
                <th className="p-4 w-64">สินค้า (เลือก/ระบุ)</th>
                <th className="p-4 w-32 text-center">จำนวน</th>
                <th className="p-4 w-24 text-center">หน่วย</th>
                <th className="p-4 w-32 text-right">ราคา/หน่วย</th>
                <th className="p-4 w-32 text-right">ราคารวม</th>
                <th className="p-4 w-48">ร้านค้า/ซัพพลายเออร์</th>
                <th className="p-4 w-32">การชำระ</th>
                <th className="p-4 w-16 text-center">ลบ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {purchaseItems.map((item, index) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 text-center text-gray-400">{index + 1}</td>
                  <td className="p-4">
                    <div className="space-y-1">
                      <select
                        aria-label={`Product Select ${index + 1}`}
                        value={item.productId}
                        onChange={(e) => handleProductSelect(item.id, e.target.value)}
                        className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                      >
                        <option value="">-- เลือกสินค้า --</option>
                        {mockStockProducts.map((product) => (
                          <option key={product.id} value={product.id}>
                            {product.name} (คงเหลือ: {product.stock})
                          </option>
                        ))}
                        <option value="NEW">+ สินค้าใหม่ (ระบุเอง)</option>
                      </select>
                      <input
                        aria-label={`Product Name ${index + 1}`}
                        placeholder="ระบุชื่อสินค้า..."
                        value={item.productName}
                        onChange={(e) => handleItemChange(item.id, "productName", e.target.value)}
                        className="w-full border border-gray-200 rounded px-2 py-1 text-xs bg-gray-50 focus:bg-white focus:outline-none"
                        type="text"
                      />
                    </div>
                  </td>
                  <td className="p-4">
                    <input
                      aria-label={`Quantity ${index + 1}`}
                      min="0"
                      value={item.quantity || ""}
                      onChange={(e) => handleItemChange(item.id, "quantity", Number(e.target.value) || 0)}
                      className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm text-center font-medium focus:outline-none focus:border-purple-500"
                      type="number"
                    />
                  </td>
                  <td className="p-4">
                    <input
                      aria-label={`Unit ${index + 1}`}
                      value={item.unit}
                      onChange={(e) => handleItemChange(item.id, "unit", e.target.value)}
                      className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm text-center bg-gray-50"
                      type="text"
                    />
                  </td>
                  <td className="p-4">
                    <input
                      aria-label={`Price Per Unit ${index + 1}`}
                      min="0"
                      value={item.pricePerUnit || ""}
                      onChange={(e) => handleItemChange(item.id, "pricePerUnit", Number(e.target.value) || 0)}
                      className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm text-right focus:outline-none focus:border-purple-500"
                      type="number"
                    />
                  </td>
                  <td className="p-4 text-right font-bold text-slate-700">
                    {currencyFormatter.format(item.totalPrice)}
                  </td>
                  <td className="p-4">
                    <input
                      aria-label={`Supplier ${index + 1}`}
                      value={item.supplier}
                      onChange={(e) => handleItemChange(item.id, "supplier", e.target.value)}
                      className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-purple-500"
                      placeholder="ระบุร้านค้า"
                      type="text"
                    />
                  </td>
                  <td className="p-4">
                    <select
                      aria-label={`Payment Method ${index + 1}`}
                      value={item.paymentMethod}
                      onChange={(e) =>
                        handleItemChange(item.id, "paymentMethod", e.target.value as PurchaseItem["paymentMethod"])
                      }
                      className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none"
                    >
                      <option value="cash">เงินสด</option>
                      <option value="transfer">โอนเงิน</option>
                      <option value="credit">เครดิต</option>
                    </select>
                  </td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50 border-t border-gray-200">
                <td colSpan={9} className="p-2">
                  <button
                    onClick={addItem}
                    className="w-full py-2 border-2 border-dashed border-gray-300 rounded text-gray-500 hover:text-purple-600 hover:border-purple-300 hover:bg-purple-50 transition-all flex items-center justify-center gap-2 text-sm font-medium"
                  >
                    <Plus className="h-5 w-5" />
                    เพิ่มรายการสินค้า
                  </button>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="p-6 bg-gray-50 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-gray-500">
            รายการทั้งหมด <span className="font-bold text-slate-800">{purchaseItems.length}</span> รายการ
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-xs text-gray-500">ยอดรวมสุทธิ</div>
              <div className="text-2xl font-bold text-purple-700">{currencyFormatter.format(netTotal)}</div>
            </div>
            <button
              onClick={handleSave}
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg shadow-sm flex items-center gap-2 font-medium transition-transform active:scale-95"
            >
              <Save className="h-5 w-5" />
              บันทึกข้อมูลเข้าสต็อก
            </button>
          </div>
        </div>
      </div>

      {/* History Section */}
      <div className="mt-8">
        <h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5 text-gray-400" />
          ประวัติการบันทึกล่าสุด
        </h3>
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="p-3 pl-4">เลขที่บิล</th>
                <th className="p-3">วันที่</th>
                <th className="p-3">รายการสินค้า</th>
                <th className="p-3 text-right">ยอดรวม</th>
                <th className="p-3">ผู้บันทึก</th>
                <th className="p-3 text-center">สถานะ</th>
                <th className="p-3 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {mockHistory.map((entry) => (
                <tr key={entry.id} className="text-gray-600 hover:bg-gray-50 transition-colors">
                  <td className="p-3 pl-4 font-mono text-purple-600 font-semibold">{entry.id}</td>
                  <td className="p-3">{entry.date}</td>
                  <td className="p-3">
                    <div className="max-w-md truncate">
                      {entry.items.map((item) => `${item.productName} ${item.quantity} ${item.unit}`).join(", ")}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {entry.items.length} รายการ
                    </div>
                  </td>
                  <td className="p-3 text-right font-medium">{currencyFormatter.format(entry.total)}</td>
                  <td className="p-3">{entry.recorder}</td>
                  <td className="p-3 text-center">
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">
                      {entry.status}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => setSelectedBillId(entry.id)}
                      className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 px-2 py-1 rounded transition-colors flex items-center gap-1 text-xs font-medium"
                    >
                      <Eye className="h-4 w-4" />
                      ดูรายละเอียด
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Upload className="h-5 w-5 text-purple-600" />
                นำเข้าข้อมูลการซื้อสินค้าเข้า
              </h3>
              <button
                onClick={() => {
                  setIsImportModalOpen(false);
                  setImportDate({ month: "", year: "", startDate: "", endDate: "" });
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              กรุณาเลือกช่วงวันที่ของข้อมูลที่ต้องการนำเข้าจากไฟล์ Excel
            </p>

            {/* Date Selection */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="text-sm font-semibold text-gray-700 mb-3">ช่วงวันที่ของข้อมูล</div>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label htmlFor="otop-import-month" className="block text-xs text-gray-600 mb-1">เดือน</label>
                  <select
                    id="otop-import-month"
                    value={importDate.month}
                    onChange={(e) => setImportDate({ ...importDate, month: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">เลือกเดือน</option>
                    {months.map((month, index) => (
                      <option key={index} value={month}>
                        {month}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="otop-import-year" className="block text-xs text-gray-600 mb-1">ปี (พ.ศ.)</label>
                  <select
                    id="otop-import-year"
                    value={importDate.year}
                    onChange={(e) => setImportDate({ ...importDate, year: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">เลือกปี</option>
                    {years.map((year) => (
                      <option key={year} value={year.toString()}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="otop-import-start-date" className="block text-xs text-gray-600 mb-1">วันที่เริ่มต้น</label>
                  <input
                    id="otop-import-start-date"
                    type="date"
                    value={importDate.startDate}
                    onChange={(e) => setImportDate({ ...importDate, startDate: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label htmlFor="otop-import-end-date" className="block text-xs text-gray-600 mb-1">วันที่สิ้นสุด</label>
                  <input
                    id="otop-import-end-date"
                    type="date"
                    value={importDate.endDate}
                    onChange={(e) => setImportDate({ ...importDate, endDate: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            </div>

            <div className="mb-6">
              <div className="text-sm font-semibold text-gray-700 mb-3">ข้อมูลที่จะนำเข้า</div>
              <div className="p-4 border-2 border-purple-200 rounded-lg bg-purple-50">
                <div className="flex items-center gap-3">
                  <ShoppingCart className="h-6 w-6 text-purple-600" />
                  <div>
                    <div className="font-semibold text-slate-800">ข้อมูลการซื้อสินค้าเข้า</div>
                    <div className="text-sm text-gray-500">นำเข้าข้อมูลรายการสินค้าที่สั่งซื้อ</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setIsImportModalOpen(false);
                  setImportDate({ month: "", year: "", startDate: "", endDate: "" });
                }}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ยกเลิก
              </button>
              <button
                onClick={() => {
                  if (!importDate.month || !importDate.year) {
                    alert("กรุณาเลือกเดือนและปีก่อน");
                    return;
                  }
                  setTimeout(() => {
                    fileInputRef.current?.click();
                  }, 100);
                }}
                disabled={!importDate.month || !importDate.year}
                className={`px-6 py-2 rounded-lg transition-colors font-medium ${!importDate.month || !importDate.year
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-purple-600 text-white hover:bg-purple-700"
                  }`}
              >
                เลือกไฟล์
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Bill Detail Modal */}
      {selectedBillId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto"
          >
            {(() => {
              const selectedBill = mockHistory.find((entry) => entry.id === selectedBillId);
              if (!selectedBill) return null;

              return (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <FileText className="h-6 w-6 text-purple-600" />
                        รายละเอียดบิล {selectedBill.id}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">วันที่: {selectedBill.date}</p>
                    </div>
                    <button
                      onClick={() => setSelectedBillId(null)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Bill Info */}
                  <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">ผู้บันทึก</div>
                      <div className="font-semibold text-slate-800">{selectedBill.recorder}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">สถานะ</div>
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
                        {selectedBill.status}
                      </span>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">จำนวนรายการ</div>
                      <div className="font-semibold text-slate-800">{selectedBill.items.length} รายการ</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">ยอดรวม</div>
                      <div className="font-bold text-purple-700 text-lg">
                        {currencyFormatter.format(selectedBill.total)}
                      </div>
                    </div>
                  </div>

                  {/* Items Table */}
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">รายการสินค้า</h4>
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="p-3 text-left text-xs font-semibold text-gray-600">ลำดับ</th>
                            <th className="p-3 text-left text-xs font-semibold text-gray-600">ชื่อสินค้า</th>
                            <th className="p-3 text-center text-xs font-semibold text-gray-600">จำนวน</th>
                            <th className="p-3 text-center text-xs font-semibold text-gray-600">หน่วย</th>
                            <th className="p-3 text-right text-xs font-semibold text-gray-600">ราคา/หน่วย</th>
                            <th className="p-3 text-right text-xs font-semibold text-gray-600">ราคารวม</th>
                            <th className="p-3 text-left text-xs font-semibold text-gray-600">ร้านค้า</th>
                            <th className="p-3 text-left text-xs font-semibold text-gray-600">การชำระ</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {selectedBill.items.map((item, index) => (
                            <tr key={item.id} className="hover:bg-gray-50">
                              <td className="p-3 text-center text-gray-500">{index + 1}</td>
                              <td className="p-3 font-medium text-slate-800">{item.productName}</td>
                              <td className="p-3 text-center">{item.quantity}</td>
                              <td className="p-3 text-center text-gray-600">{item.unit}</td>
                              <td className="p-3 text-right text-gray-600">
                                {currencyFormatter.format(item.pricePerUnit)}
                              </td>
                              <td className="p-3 text-right font-semibold text-slate-800">
                                {currencyFormatter.format(item.totalPrice)}
                              </td>
                              <td className="p-3 text-gray-600">{item.supplier}</td>
                              <td className="p-3">
                                <span
                                  className={`px-2 py-1 rounded text-xs ${item.paymentMethod === "cash"
                                      ? "bg-green-100 text-green-700"
                                      : item.paymentMethod === "transfer"
                                        ? "bg-blue-100 text-blue-700"
                                        : "bg-orange-100 text-orange-700"
                                    }`}
                                >
                                  {item.paymentMethod === "cash"
                                    ? "เงินสด"
                                    : item.paymentMethod === "transfer"
                                      ? "โอนเงิน"
                                      : "เครดิต"}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-purple-50 border-t-2 border-purple-200">
                          <tr>
                            <td colSpan={5} className="p-3 text-right font-semibold text-gray-700">
                              ยอดรวมสุทธิ:
                            </td>
                            <td colSpan={3} className="p-3 text-right">
                              <span className="text-xl font-bold text-purple-700">
                                {currencyFormatter.format(selectedBill.total)}
                              </span>
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={() => setSelectedBillId(null)}
                      className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium"
                    >
                      ปิด
                    </button>
                  </div>
                </>
              );
            })()}
          </motion.div>
        </div>
      )}
    </div>
  );
}
