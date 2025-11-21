import { useState } from "react";
import {
  Ticket,
  Plus,
  Upload,
  DollarSign,
  Fuel,
  Droplet,
} from "lucide-react";
import ModalForm from "@/components/ModalForm";
import FilterBar from "@/components/FilterBar";

const currencyFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const numberFormatter = new Intl.NumberFormat("th-TH");

const branches = ["สำนักงานใหญ่", "สาขา A", "สาขา B", "สาขา C", "สาขา D"];

// Mock data สำหรับคูปองสถานี
const initialCoupons = [
  {
    id: "1",
    couponCode: "C001",
    date: "2024-12-15",
    fuelType: "Gasohol 95",
    quantity: 30,
    amount: 1200,
    branch: "สำนักงานใหญ่",
    status: "ใช้แล้ว",
    source: "SALES_20241215.xlsx",
    paymentType: "Coupon",
  },
  {
    id: "2",
    couponCode: "C002",
    date: "2024-12-14",
    fuelType: "Diesel",
    quantity: 50,
    amount: 1750,
    branch: "สาขา A",
    status: "ใช้แล้ว",
    source: "SALES_20241214.xlsx",
    paymentType: "Coupon",
  },
  {
    id: "3",
    couponCode: "C003",
    date: "2024-12-13",
    fuelType: "Gasohol 95",
    quantity: 25,
    amount: 1000,
    branch: "สาขา B",
    status: "ใช้แล้ว",
    source: "SALES_20241213.xlsx",
    paymentType: "Coupon",
  },
];

export default function Coupons() {
  const [coupons, setCoupons] = useState(initialCoupons);
  const [searchQuery, setSearchQuery] = useState("");
  const [branchFilter, setBranchFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    couponCode: "",
    date: new Date().toISOString().split("T")[0],
    fuelType: "Gasohol 95",
    quantity: "",
    amount: "",
    branch: "สำนักงานใหญ่",
    source: "Manual",
  });

  const filteredCoupons = coupons.filter((coupon) => {
    const matchesSearch = coupon.couponCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      coupon.fuelType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      coupon.branch.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBranch = !branchFilter || coupon.branch === branchFilter;
    const matchesStatus = !statusFilter || coupon.status === statusFilter;
    return matchesSearch && matchesBranch && matchesStatus;
  });

  const totalAmount = coupons.reduce((sum, c) => sum + c.amount, 0);
  const totalCoupons = coupons.length;
  const usedCoupons = coupons.filter((c) => c.status === "ใช้แล้ว").length;

  const handleAddCoupon = () => {
    const newCoupon = {
      id: String(coupons.length + 1),
      ...formData,
      quantity: Number(formData.quantity),
      amount: Number(formData.amount),
      status: "ใช้แล้ว",
      paymentType: "Coupon",
    };
    setCoupons([newCoupon, ...coupons]);
    setIsAddModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      couponCode: "",
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
      alert(`กำลังประมวลผลไฟล์ ${file.name}...\n\nระบบจะดึงข้อมูลคูปองสถานีจาก SALES_YYYYMMDD.xlsx (PaymentType = Coupon)`);
    }
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6">
      {/* Header Section */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Droplet className="h-8 w-8 text-blue-600" />
          ระบบคูปองสถานี - M1
        </h2>
        <p className="text-slate-500 text-sm mt-1">
          จัดการคูปองสถานี (PaymentType = Coupon) คูปองใน M1 เป็นช่องทางการชำระเงินเท่านั้น ไม่มีการหักส่วนลด ยอดขายยังคงเต็มราคา (Full Price) ตามข้อมูลจาก PTT BackOffice
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
          <div className="flex items-center gap-2 text-blue-700 mb-2">
            <Ticket className="h-5 w-5" />
            <span className="font-bold">คูปองทั้งหมด</span>
          </div>
          <div className="text-2xl font-bold text-blue-900">{totalCoupons}</div>
          <div className="text-xs text-blue-600 mt-1">ใบ</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="text-xs text-gray-500 mb-1">ยอดขายด้วยคูปอง</div>
          <div className="text-xl font-bold text-slate-800">
            ฿{numberFormatter.format(totalAmount)}
          </div>
          <div className="w-full bg-gray-100 h-1.5 rounded-full mt-2">
            <div
              className="bg-orange-500 h-1.5 rounded-full"
              style={{ width: `${Math.min(100, (totalAmount / 10000) * 100)}%` }}
            />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="text-xs text-gray-500 mb-1">คูปองที่ใช้แล้ว</div>
          <div className="text-xl font-bold text-slate-800">{usedCoupons}</div>
          <div className="w-full bg-gray-100 h-1.5 rounded-full mt-2">
            <div
              className="bg-green-500 h-1.5 rounded-full"
              style={{ width: `${(usedCoupons / totalCoupons) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="text-xs text-gray-500 mb-1">จาก Excel</div>
          <div className="text-xl font-bold text-slate-800">
            {coupons.filter((c) => c.source.includes("SALES")).length}
          </div>
          <div className="w-full bg-gray-100 h-1.5 rounded-full mt-2">
            <div
              className="bg-purple-500 h-1.5 rounded-full"
              style={{ width: `${(coupons.filter((c) => c.source.includes("SALES")).length / totalCoupons) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Important Notice */}
      <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
        <div className="flex items-start gap-3">
          <Ticket className="w-6 h-6 text-orange-600 mt-1" />
          <div>
            <h3 className="text-sm font-semibold text-orange-900 mb-2">หมายเหตุสำคัญ: ระบบคูปองสถานี</h3>
            <ul className="text-xs text-orange-800 space-y-1">
              <li>• คูปองสถานีใน M1 เป็น <strong>ช่องทางการชำระเงินเท่านั้น</strong> (PaymentType = Coupon)</li>
              <li>• <strong>ไม่มีการหักส่วนลด</strong> - ยอดขายยังคงเต็มราคา (Full Price)</li>
              <li>• ข้อมูลมาจาก PTT BackOffice (SALES_YYYYMMDD.xlsx) - คอลัมน์ PaymentType = "Coupon"</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <FilterBar
          onSearch={setSearchQuery}
          filters={[
            {
              label: "สาขา",
              value: branchFilter,
              options: [{ value: "", label: "ทั้งหมด" }, ...branches.map((branch) => ({ value: branch, label: branch }))],
              onChange: setBranchFilter,
            },
            {
              label: "สถานะ",
              value: statusFilter,
              options: [{ value: "", label: "ทั้งหมด" }, { value: "ใช้แล้ว", label: "ใช้แล้ว" }, { value: "ยังไม่ใช้", label: "ยังไม่ใช้" }],
              onChange: setStatusFilter,
            },
          ]}
        />

        <div className="flex gap-2">
          <label className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 rounded-lg text-sm font-medium transition-colors shadow-sm cursor-pointer">
            <Upload className="h-4 w-4" />
            <span>นำเข้าจาก SALES_YYYYMMDD.xlsx</span>
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
            <span>บันทึกคูปอง</span>
          </button>
        </div>
      </div>

      {/* Coupons Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="font-bold text-slate-700">รายการคูปองสถานี</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="p-3">รหัสคูปอง</th>
                <th className="p-3">วันที่</th>
                <th className="p-3">ชนิดน้ำมัน</th>
                <th className="p-3">สาขา</th>
                <th className="p-3 text-right">ปริมาณ (ลิตร)</th>
                <th className="p-3 text-right">ยอดขาย (บาท)</th>
                <th className="p-3">แหล่งที่มา</th>
                <th className="p-3 text-center">สถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {filteredCoupons.map((coupon) => (
                <tr key={coupon.id} className="hover:bg-gray-50">
                  <td className="p-3 font-medium text-slate-700">
                    <div className="flex items-center gap-2">
                      <Ticket className="w-4 h-4 text-orange-600" />
                      {coupon.couponCode}
                    </div>
                  </td>
                  <td className="p-3 text-gray-600">
                    {new Date(coupon.date).toLocaleDateString("th-TH")}
                  </td>
                  <td className="p-3 text-gray-600">
                    <div className="flex items-center gap-2">
                      <Fuel className="w-4 h-4 text-blue-600" />
                      {coupon.fuelType}
                    </div>
                  </td>
                  <td className="p-3 text-gray-600">{coupon.branch}</td>
                  <td className="p-3 text-right font-mono text-slate-800">
                    {numberFormatter.format(coupon.quantity)}
                  </td>
                  <td className="p-3 text-right font-bold text-slate-800">
                    ฿{numberFormatter.format(coupon.amount)}
                  </td>
                  <td className="p-3">
                    <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 border border-blue-300">
                      {coupon.source}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">
                      {coupon.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredCoupons.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              ไม่พบข้อมูลคูปองสถานี
            </div>
          )}
        </div>
      </div>

      {/* Add Coupon Modal */}
      <ModalForm
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          resetForm();
        }}
        title="บันทึกคูปองสถานี"
        onSubmit={handleAddCoupon}
      >
        <div className="space-y-4">
          <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
            <p className="text-xs text-orange-700">
              <strong>หมายเหตุ:</strong> คูปองสถานีเป็นช่องทางการชำระเงินเท่านั้น ไม่มีการหักส่วนลด ยอดขายยังคงเต็มราคา
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-app mb-2">รหัสคูปอง (CouponCode)</label>
            <input
              type="text"
              value={formData.couponCode}
              onChange={(e) => setFormData({ ...formData, couponCode: e.target.value })}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="เช่น C001, C002"
              required
            />
          </div>
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
              <option value="Premium Diesel">Premium Diesel</option>
              <option value="Premium Gasohol 95">Premium Gasohol 95</option>
              <option value="Diesel">Diesel</option>
              <option value="E85">E85</option>
              <option value="E20">E20</option>
              <option value="Gasohol 91">Gasohol 91</option>
              <option value="Gasohol 95">Gasohol 95</option>
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
              <label className="block text-sm font-medium text-app mb-2">ยอดขาย (บาท) - เต็มราคา</label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="ยอดขายเต็มราคา (ไม่หักส่วนลด)"
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
              <option value="SALES_YYYYMMDD.xlsx">SALES_YYYYMMDD.xlsx (PTT BackOffice)</option>
            </select>
          </div>
        </div>
      </ModalForm>
    </div>
  );
}
