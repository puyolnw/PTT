import { useState } from "react";
import {
  ShoppingCart,
  Plus,
  Upload,
  Fuel,
  Droplet,
} from "lucide-react";
import ModalForm from "@/components/ModalForm";
import FilterBar from "@/components/FilterBar";

const numberFormatter = new Intl.NumberFormat("th-TH");

// ชนิดน้ำมัน 8 ชนิด (ตามปั้ม.md)
const fuelTypes = [
  "Premium Diesel",
  "Premium Gasohol 95",
  "Diesel",
  "E85",
  "E20",
  "Gasohol 91",
  "Gasohol 95",
];

const branches = ["สำนักงานใหญ่", "สาขา A", "สาขา B", "สาขา C", "สาขา D"];

// Mock data สำหรับการซื้อเข้าน้ำมัน
const initialPurchases = [
  {
    id: "1",
    date: "2024-12-15",
    fuelType: "Gasohol 95",
    quantity: 50000,
    amount: 2000000,
    branch: "สำนักงานใหญ่",
    source: "PURCHASE_20241215.xlsx",
    status: "บันทึกแล้ว",
  },
  {
    id: "2",
    date: "2024-12-14",
    fuelType: "Diesel",
    quantity: 40000,
    amount: 1600000,
    branch: "สาขา A",
    source: "PURCHASE_20241214.xlsx",
    status: "บันทึกแล้ว",
  },
  {
    id: "3",
    date: "2024-12-13",
    fuelType: "Premium Gasohol 95",
    quantity: 20000,
    amount: 900000,
    branch: "สาขา B",
    source: "PURCHASE_20241213.xlsx",
    status: "บันทึกแล้ว",
  },
];

export default function Purchases() {
  const [purchases, setPurchases] = useState(initialPurchases);
  const [searchQuery, setSearchQuery] = useState("");
  const [fuelFilter, setFuelFilter] = useState("");
  const [branchFilter, setBranchFilter] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    fuelType: "Gasohol 95",
    quantity: "",
    amount: "",
    branch: "สำนักงานใหญ่",
    source: "Manual",
  });

  const filteredPurchases = purchases.filter((purchase) => {
    const matchesSearch = purchase.fuelType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      purchase.branch.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFuel = !fuelFilter || purchase.fuelType === fuelFilter;
    const matchesBranch = !branchFilter || purchase.branch === branchFilter;
    return matchesSearch && matchesFuel && matchesBranch;
  });

  const totalAmount = purchases.reduce((sum, p) => sum + p.amount, 0);
  const totalQuantity = purchases.reduce((sum, p) => sum + p.quantity, 0);

  const handleAddPurchase = () => {
    const newPurchase = {
      id: String(purchases.length + 1),
      ...formData,
      quantity: Number(formData.quantity),
      amount: Number(formData.amount),
      status: "บันทึกแล้ว",
    };
    setPurchases([newPurchase, ...purchases]);
    setIsAddModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split("T")[0],
      fuelType: "Gasohol 95",
      quantity: "",
      amount: "",
      branch: "สำนักงานใหญ่",
      source: "Manual",
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      alert(`กำลังประมวลผลไฟล์ ${file.name}...\n\nระบบจะสร้างใบรับสินค้าอัตโนมัติจากข้อมูล PTT BackOffice`);
    }
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6">
      {/* Header Section */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Droplet className="h-8 w-8 text-blue-600" />
          ซื้อเข้าน้ำมัน - M1
        </h2>
        <p className="text-slate-500 text-sm mt-1">
          ประมวลผลซื้อเข้าน้ำมันแยกตามชนิดน้ำมัน 8 ชนิด นำเข้า Excel จาก PTT BackOffice ระบบสร้างใบรับสินค้าอัตโนมัติ
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
          <div className="flex items-center gap-2 text-blue-700 mb-2">
            <ShoppingCart className="h-5 w-5" />
            <span className="font-bold">รายการทั้งหมด</span>
          </div>
          <div className="text-2xl font-bold text-blue-900">{purchases.length}</div>
          <div className="text-xs text-blue-600 mt-1">ใบรับสินค้า</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="text-xs text-gray-500 mb-1">ปริมาณรวม</div>
          <div className="text-xl font-bold text-slate-800">
            {numberFormatter.format(totalQuantity)} L
          </div>
          <div className="w-full bg-gray-100 h-1.5 rounded-full mt-2">
            <div
              className="bg-emerald-500 h-1.5 rounded-full"
              style={{ width: `${Math.min(100, (totalQuantity / 200000) * 100)}%` }}
            />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="text-xs text-gray-500 mb-1">ยอดรวม</div>
          <div className="text-xl font-bold text-slate-800">
            ฿{numberFormatter.format(totalAmount)}
          </div>
          <div className="w-full bg-gray-100 h-1.5 rounded-full mt-2">
            <div
              className="bg-purple-500 h-1.5 rounded-full"
              style={{ width: `${Math.min(100, (totalAmount / 10000000) * 100)}%` }}
            />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="text-xs text-gray-500 mb-1">จาก Excel</div>
          <div className="text-xl font-bold text-slate-800">
            {purchases.filter((p) => p.source.includes("PURCHASE")).length}
          </div>
          <div className="w-full bg-gray-100 h-1.5 rounded-full mt-2">
            <div
              className="bg-orange-500 h-1.5 rounded-full"
              style={{ width: `${(purchases.filter((p) => p.source.includes("PURCHASE")).length / purchases.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <FilterBar
          onSearch={setSearchQuery}
          filters={[
            {
              label: "ชนิดน้ำมัน",
              value: fuelFilter,
              options: [{ value: "", label: "ทั้งหมด" }, ...fuelTypes.map((fuel) => ({ value: fuel, label: fuel }))],
              onChange: setFuelFilter,
            },
            {
              label: "สาขา",
              value: branchFilter,
              options: [{ value: "", label: "ทั้งหมด" }, ...branches.map((branch) => ({ value: branch, label: branch }))],
              onChange: setBranchFilter,
            },
          ]}
        />

        <div className="flex gap-2">
          <label className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 rounded-lg text-sm font-medium transition-colors shadow-sm cursor-pointer">
            <Upload className="h-4 w-4" />
            <span>นำเข้า PURCHASE_YYYYMMDD.xlsx</span>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span>บันทึกการซื้อ</span>
          </button>
        </div>
      </div>

      {/* Purchases Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="font-bold text-slate-700">รายการซื้อเข้าน้ำมัน</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="p-3">วันที่</th>
                <th className="p-3">ชนิดน้ำมัน</th>
                <th className="p-3">สาขา</th>
                <th className="p-3 text-right">ปริมาณ (ลิตร)</th>
                <th className="p-3 text-right">จำนวนเงิน</th>
                <th className="p-3">แหล่งที่มา</th>
                <th className="p-3 text-center">สถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {filteredPurchases.map((purchase) => (
                <tr key={purchase.id} className="hover:bg-gray-50">
                  <td className="p-3 text-gray-600">
                    {new Date(purchase.date).toLocaleDateString("th-TH")}
                  </td>
                  <td className="p-3 font-medium text-slate-700">
                    <div className="flex items-center gap-2">
                      <Fuel className="w-4 h-4 text-blue-600" />
                      {purchase.fuelType}
                    </div>
                  </td>
                  <td className="p-3 text-gray-600">{purchase.branch}</td>
                  <td className="p-3 text-right font-mono text-slate-800">
                    {numberFormatter.format(purchase.quantity)}
                  </td>
                  <td className="p-3 text-right font-bold text-slate-800">
                    ฿{numberFormatter.format(purchase.amount)}
                  </td>
                  <td className="p-3">
                    <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 border border-blue-300">
                      {purchase.source}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">
                      {purchase.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredPurchases.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              ไม่พบข้อมูลการซื้อเข้าน้ำมัน
            </div>
          )}
        </div>
      </div>

      {/* Add Purchase Modal */}
      <ModalForm
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          resetForm();
        }}
        title="บันทึกการซื้อเข้าน้ำมัน"
        onSubmit={handleAddPurchase}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-app mb-2">วันที่</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-app mb-2">สาขา</label>
              <select
                value={formData.branch}
                onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {branches.map((branch) => (
                  <option key={branch} value={branch}>
                    {branch}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-app mb-2">ชนิดน้ำมัน</label>
            <select
              value={formData.fuelType}
              onChange={(e) => setFormData({ ...formData, fuelType: e.target.value })}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {fuelTypes.map((fuel) => (
                <option key={fuel} value={fuel}>
                  {fuel}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-app mb-2">ปริมาณ (ลิตร)</label>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-app mb-2">จำนวนเงิน (บาท)</label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-app mb-2">แหล่งที่มา</label>
            <select
              value={formData.source}
              onChange={(e) => setFormData({ ...formData, source: e.target.value })}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Manual">กรอกด้วยมือ</option>
              <option value="PURCHASE_YYYYMMDD.xlsx">PURCHASE_YYYYMMDD.xlsx (PTT BackOffice)</option>
            </select>
          </div>
        </div>
      </ModalForm>
    </div>
  );
}
