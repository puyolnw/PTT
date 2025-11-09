import { useState } from "react";
import { motion } from "framer-motion";
import {
  Ticket,
  Plus,
  Upload,
  DollarSign,
  TrendingUp,
  Fuel,
} from "lucide-react";
import ModalForm from "@/components/ModalForm";
import FilterBar from "@/components/FilterBar";

const currencyFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 0,
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
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h2 className="text-3xl font-bold text-app mb-2 font-display">ระบบคูปองสถานี - M1</h2>
        <p className="text-muted font-light">
          จัดการคูปองสถานี (PaymentType = Coupon) คูปองใน M1 เป็นช่องทางการชำระเงินเท่านั้น ไม่มีการหักส่วนลด ยอดขายยังคงเต็มราคา (Full Price) ตามข้อมูลจาก PTT BackOffice
        </p>
      </motion.div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="panel rounded-2xl p-6 border-2 border-orange-500/30 bg-gradient-to-br from-orange-500/10 to-orange-500/5"
        >
          <div className="flex items-center justify-between mb-4">
            <Ticket className="w-8 h-8 text-orange-400" />
            <span className="text-sm text-muted">คูปองทั้งหมด</span>
          </div>
          <p className="text-2xl font-bold text-orange-400">{totalCoupons}</p>
          <p className="text-sm text-muted">ใบ</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="panel rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="w-8 h-8 text-emerald-400" />
            <span className="text-sm text-muted">ยอดขายด้วยคูปอง</span>
          </div>
          <p className="text-2xl font-bold text-app">{currencyFormatter.format(totalAmount)}</p>
          <p className="text-sm text-muted">บาท (เต็มราคา)</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="panel rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="w-8 h-8 text-ptt-cyan" />
            <span className="text-sm text-muted">คูปองที่ใช้แล้ว</span>
          </div>
          <p className="text-2xl font-bold text-app">{usedCoupons}</p>
          <p className="text-sm text-muted">ใบ</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="panel rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <Upload className="w-8 h-8 text-purple-400" />
            <span className="text-sm text-muted">จาก Excel</span>
          </div>
          <p className="text-2xl font-bold text-app">
            {coupons.filter((c) => c.source.includes("SALES")).length}
          </p>
          <p className="text-sm text-muted">รายการ</p>
        </motion.div>
      </div>

      {/* Important Notice */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="panel rounded-2xl p-6 border-2 border-orange-500/30 bg-gradient-to-br from-orange-500/10 to-orange-500/5"
      >
        <div className="flex items-start gap-3">
          <Ticket className="w-6 h-6 text-orange-400 mt-1" />
          <div>
            <h3 className="text-lg font-semibold text-app mb-2">หมายเหตุสำคัญ: ระบบคูปองสถานี</h3>
            <ul className="text-sm text-muted space-y-1">
              <li>• คูปองสถานีใน M1 เป็น <strong className="text-app">ช่องทางการชำระเงินเท่านั้น</strong> (PaymentType = Coupon)</li>
              <li>• <strong className="text-app">ไม่มีการหักส่วนลด</strong> - ยอดขายยังคงเต็มราคา (Full Price)</li>
              <li>• ข้อมูลมาจาก PTT BackOffice (SALES_YYYYMMDD.xlsx) - คอลัมน์ PaymentType = "Coupon"</li>
              <li>• ระบบจะบันทึก CouponCode และยอดขายเต็มราคา ไม่มีคอลัมน์ Discount</li>
              <li>• ลงบัญชี (M6) เป็นรายได้จากการขายน้ำมัน (4110) เต็มจำนวน</li>
            </ul>
          </div>
        </div>
      </motion.div>

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
          <label className="flex items-center gap-2 px-4 py-2 bg-soft text-app rounded-lg hover:bg-app/10 transition-colors cursor-pointer">
            <Upload className="w-4 h-4" />
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
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-500/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>บันทึกคูปอง</span>
          </button>
        </div>
      </div>

      {/* Coupons List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="panel rounded-2xl p-6"
      >
        <div className="space-y-4">
          {filteredCoupons.map((coupon) => (
            <div
              key={coupon.id}
              className="p-4 bg-soft rounded-xl border border-app hover:border-orange-500/30 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-orange-500/20 border border-orange-500/30">
                    <Ticket className="w-5 h-5 text-orange-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-app">คูปอง: {coupon.couponCode}</p>
                    <p className="text-sm text-muted">{coupon.branch}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-app">{currencyFormatter.format(coupon.amount)}</p>
                  <div className="flex items-center gap-2 mt-1 justify-end">
                    <span className="text-xs px-2 py-1 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/30">
                      {coupon.status}
                    </span>
                    <span className="text-xs px-2 py-1 rounded-full bg-ptt-blue/10 text-ptt-cyan border border-ptt-blue/30">
                      {coupon.paymentType}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Fuel className="w-4 h-4 text-ptt-cyan" />
                  <span className="text-muted">
                    {coupon.fuelType} • {numberFormatter.format(coupon.quantity)} ลิตร
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted">
                    วันที่: {new Date(coupon.date).toLocaleDateString("th-TH", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                  <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    {coupon.source}
                  </span>
                </div>
              </div>
              <div className="mt-2 p-2 bg-orange-500/5 rounded-lg border border-orange-500/10">
                <p className="text-xs text-orange-400/80">
                  <strong>ยอดขายเต็มราคา:</strong> {currencyFormatter.format(coupon.amount)} (ไม่มีการหักส่วนลด)
                </p>
              </div>
            </div>
          ))}
          {filteredCoupons.length === 0 && (
            <div className="text-center py-12 text-muted">
              ไม่พบข้อมูลคูปองสถานี
            </div>
          )}
        </div>
      </motion.div>

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
          <div className="p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
            <p className="text-xs text-orange-400/80">
              <strong>หมายเหตุ:</strong> คูปองสถานีเป็นช่องทางการชำระเงินเท่านั้น ไม่มีการหักส่วนลด ยอดขายยังคงเต็มราคา
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-app mb-2">รหัสคูปอง (CouponCode)</label>
            <input
              type="text"
              value={formData.couponCode}
              onChange={(e) => setFormData({ ...formData, couponCode: e.target.value })}
              className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
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
                className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-app mb-2">สาขา</label>
              <select
                value={formData.branch}
                onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
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
              className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
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
                className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-app mb-2">ยอดขาย (บาท) - เต็มราคา</label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
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
              className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
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

