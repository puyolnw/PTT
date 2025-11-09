import { useState } from "react";
import { motion } from "framer-motion";
import {
  DollarSign,
  Plus,
  Upload,
  Download,
  TrendingUp,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
  Wrench,
  CreditCard,
} from "lucide-react";
import { useShop } from "@/contexts/ShopContext";
import ModalForm from "@/components/ModalForm";
import FilterBar from "@/components/FilterBar";

const currencyFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat("th-TH");

// Mock data สำหรับร้าน Quick - แยกตามบริการ
const initialSalesData = [
  {
    id: "1",
    date: "2024-12-15",
    items: [
      { name: "ถ่ายน้ำมันเครื่อง (590 บาท)", quantity: 1, price: 590, total: 590, service: "ถ่ายน้ำมันเครื่อง" },
      { name: "ไส้กรองน้ำมันเครื่อง", quantity: 1, price: 200, total: 200, service: "ถ่ายน้ำมันเครื่อง" },
    ],
    total: 790,
    paymentMethod: "ผ่อน 0% 6 เดือน",
    customer: "ลูกค้าทั่วไป",
    source: "Stock Program",
  },
  {
    id: "2",
    date: "2024-12-15",
    items: [
      { name: "เปลี่ยนยาง", quantity: 4, price: 2000, total: 8000, service: "เปลี่ยนยาง" },
    ],
    total: 8000,
    paymentMethod: "บัตร",
    customer: "ลูกค้าทั่วไป",
    source: "Stock Program",
  },
  {
    id: "3",
    date: "2024-12-14",
    items: [
      { name: "ตรวจสภาพรถ", quantity: 1, price: 500, total: 500, service: "ตรวจสภาพรถ" },
      { name: "แบตเตอรี่", quantity: 1, price: 1500, total: 1500, service: "แบตเตอรี่" },
    ],
    total: 2000,
    paymentMethod: "QR Code",
    customer: "ลูกค้าประจำ",
    source: "Manual",
  },
];

export default function Sales() {
  const { currentShop } = useShop();
  const shopName = currentShop?.name || "ร้าน Quick (B-Quik)";
  
  const [salesData, setSalesData] = useState(initialSalesData);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [serviceFilter, setServiceFilter] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    items: [{ name: "", quantity: "", price: "", total: 0, service: "ถ่ายน้ำมันเครื่อง" }],
    paymentMethod: "เงินสด",
    customer: "",
  });

  // Calculate statistics
  const todaySales = salesData
    .filter((sale) => sale.date === new Date().toISOString().split("T")[0])
    .reduce((sum, sale) => sum + sale.total, 0);

  const thisMonthSales = salesData.reduce((sum, sale) => {
    const saleMonth = sale.date.substring(0, 7);
    const currentMonth = new Date().toISOString().substring(0, 7);
    return saleMonth === currentMonth ? sum + sale.total : sum;
  }, 0);

  // Calculate sales by service
  const salesByService = salesData.reduce((acc, sale) => {
    sale.items.forEach((item) => {
      if (!acc[item.service]) {
        acc[item.service] = 0;
      }
      acc[item.service] += item.total;
    });
    return acc;
  }, {} as Record<string, number>);

  const totalSales = Object.values(salesByService).reduce((sum, val) => sum + val, 0);

  // Calculate comparison with previous period
  const lastWeekSales = salesData
    .filter((sale) => {
      const saleDate = new Date(sale.date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return saleDate >= weekAgo && saleDate < new Date();
    })
    .reduce((sum, sale) => sum + sale.total, 0);

  const salesComparison = lastWeekSales > 0 
    ? ((todaySales - lastWeekSales) / lastWeekSales) * 100 
    : 0;

  // Filter sales data
  const filteredSales = salesData.filter((sale) => {
    const matchesSearch = sale.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sale.items.some((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesDate = !dateFilter || sale.date === dateFilter;
    const matchesPayment = !paymentFilter || sale.paymentMethod === paymentFilter;
    const matchesService = !serviceFilter || sale.items.some((item) => item.service === serviceFilter);
    return matchesSearch && matchesDate && matchesPayment && matchesService;
  });

  const handleAddSale = () => {
    const total = formData.items.reduce((sum, item) => {
      const itemTotal = Number(item.quantity) * Number(item.price);
      return sum + itemTotal;
    }, 0);

    const newSale = {
      id: String(salesData.length + 1),
      date: formData.date,
      items: formData.items.map((item) => ({
        name: item.name,
        quantity: Number(item.quantity),
        price: Number(item.price),
        total: Number(item.quantity) * Number(item.price),
        service: item.service,
      })),
      total,
      paymentMethod: formData.paymentMethod,
      customer: formData.customer || "ลูกค้าทั่วไป",
      source: "Manual",
    };

    setSalesData([newSale, ...salesData]);
    setIsAddModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split("T")[0],
      items: [{ name: "", quantity: "", price: "", total: 0, service: "ถ่ายน้ำมันเครื่อง" }],
      paymentMethod: "เงินสด",
      customer: "",
    });
  };

  const addItemToForm = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { name: "", quantity: "", price: "", total: 0, service: "ถ่ายน้ำมันเครื่อง" }],
    });
  };

  const removeItemFromForm = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    });
  };

  const updateItemInForm = (index: number, field: string, value: string) => {
    const updatedItems = [...formData.items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value,
      total: field === "quantity" || field === "price"
        ? Number(field === "quantity" ? value : updatedItems[index].quantity) *
          Number(field === "price" ? value : updatedItems[index].price)
        : updatedItems[index].total,
    };
    setFormData({ ...formData, items: updatedItems });
  };

  const paymentMethods = Array.from(new Set(salesData.map((sale) => sale.paymentMethod)));
  const services = ["ถ่ายน้ำมันเครื่อง", "เปลี่ยนยาง", "ตรวจสภาพรถ", "แบตเตอรี่", "ระบบแอร์/ช่วงล่าง"];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Simulate file processing from Stock Program
      alert(`กำลังประมวลผลไฟล์ ${file.name}...\n\nระบบจะนำเข้าข้อมูลยอดขายจาก Stock Program`);
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h2 className="text-3xl font-bold text-app mb-2 font-display">ยอดขาย - {shopName}</h2>
        <p className="text-muted font-light">
          บันทึกยอดขายและดูรายงานยอดขายรายวัน/เดือน/ปี แยกตามบริการ (ถ่ายน้ำมันเครื่อง 590 บาท, เปลี่ยนยาง, ตรวจสภาพรถ, แบตเตอรี่, ระบบแอร์/ช่วงล่าง) เปรียบเทียบช่วงเวลา รองรับโปรโมชันผ่อน 0% 6 เดือน เชื่อมกับ M1 สำหรับชำระเงิน
        </p>
      </motion.div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="panel rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="w-8 h-8 text-emerald-400" />
            <span className="text-sm text-muted">ยอดขายวันนี้</span>
          </div>
          <p className="text-2xl font-bold text-app">{currencyFormatter.format(todaySales)}</p>
          <p className="text-sm text-muted">
            {salesData.filter((s) => s.date === new Date().toISOString().split("T")[0]).length} รายการ
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="panel rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="w-8 h-8 text-ptt-cyan" />
            <span className="text-sm text-muted">ยอดขายเดือนนี้</span>
          </div>
          <p className="text-2xl font-bold text-app">{currencyFormatter.format(thisMonthSales)}</p>
          <div className={`flex items-center gap-1 text-xs mt-1 ${
            salesComparison >= 0 ? 'text-emerald-400' : 'text-red-400'
          }`}>
            {salesComparison >= 0 ? (
              <ArrowUpRight className="w-3 h-3" />
            ) : (
              <ArrowDownRight className="w-3 h-3" />
            )}
            {salesComparison >= 0 ? '+' : ''}{salesComparison.toFixed(1)}% จากสัปดาห์ที่แล้ว
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="panel rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <FileText className="w-8 h-8 text-purple-400" />
            <span className="text-sm text-muted">รายการทั้งหมด</span>
          </div>
          <p className="text-2xl font-bold text-app">{salesData.length}</p>
          <p className="text-sm text-muted">รายการขาย</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="panel rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <CreditCard className="w-8 h-8 text-green-400" />
            <span className="text-sm text-muted">ผ่อน 0%</span>
          </div>
          <p className="text-2xl font-bold text-app">
            {salesData.filter((s) => s.paymentMethod.includes("ผ่อน")).length}
          </p>
          <p className="text-sm text-muted">รายการ</p>
        </motion.div>
      </div>

      {/* Sales by Service */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="panel rounded-2xl p-6"
      >
        <h3 className="text-xl font-semibold text-app mb-4">ยอดขายแยกตามบริการ (ถ่ายน้ำมันเครื่อง 50%)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
            <p className="text-sm text-muted mb-1">ถ่ายน้ำมันเครื่อง</p>
            <p className="text-2xl font-bold text-orange-400">
              {currencyFormatter.format(salesByService["ถ่ายน้ำมันเครื่อง"] || 0)}
            </p>
            <p className="text-xs text-muted mt-1">
              {totalSales > 0 ? ((salesByService["ถ่ายน้ำมันเครื่อง"] || 0) / totalSales * 100).toFixed(1) : 0}% ของยอดขาย
            </p>
            <p className="text-xs text-ptt-cyan mt-1">590 บาท</p>
          </div>
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
            <p className="text-sm text-muted mb-1">เปลี่ยนยาง</p>
            <p className="text-2xl font-bold text-blue-400">
              {currencyFormatter.format(salesByService["เปลี่ยนยาง"] || 0)}
            </p>
            <p className="text-xs text-muted mt-1">
              {totalSales > 0 ? ((salesByService["เปลี่ยนยาง"] || 0) / totalSales * 100).toFixed(1) : 0}% ของยอดขาย
            </p>
          </div>
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
            <p className="text-sm text-muted mb-1">ตรวจสภาพรถ</p>
            <p className="text-2xl font-bold text-purple-400">
              {currencyFormatter.format(salesByService["ตรวจสภาพรถ"] || 0)}
            </p>
            <p className="text-xs text-muted mt-1">
              {totalSales > 0 ? ((salesByService["ตรวจสภาพรถ"] || 0) / totalSales * 100).toFixed(1) : 0}% ของยอดขาย
            </p>
          </div>
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
            <p className="text-sm text-muted mb-1">แบตเตอรี่</p>
            <p className="text-2xl font-bold text-green-400">
              {currencyFormatter.format(salesByService["แบตเตอรี่"] || 0)}
            </p>
            <p className="text-xs text-muted mt-1">
              {totalSales > 0 ? ((salesByService["แบตเตอรี่"] || 0) / totalSales * 100).toFixed(1) : 0}% ของยอดขาย
            </p>
          </div>
          <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4">
            <p className="text-sm text-muted mb-1">ระบบแอร์/ช่วงล่าง</p>
            <p className="text-2xl font-bold text-cyan-400">
              {currencyFormatter.format(salesByService["ระบบแอร์/ช่วงล่าง"] || 0)}
            </p>
            <p className="text-xs text-muted mt-1">
              {totalSales > 0 ? ((salesByService["ระบบแอร์/ช่วงล่าง"] || 0) / totalSales * 100).toFixed(1) : 0}% ของยอดขาย
            </p>
          </div>
        </div>
      </motion.div>

      {/* Actions Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <FilterBar
          onSearch={setSearchQuery}
          filters={[
            {
              label: "วันที่",
              value: dateFilter,
              options: [{ value: "", label: "ทั้งหมด" }],
              onChange: setDateFilter,
            },
            {
              label: "วิธีชำระ",
              value: paymentFilter,
              options: [
                { value: "", label: "ทั้งหมด" },
                ...paymentMethods.map((method) => ({ value: method, label: method })),
              ],
              onChange: setPaymentFilter,
            },
            {
              label: "บริการ",
              value: serviceFilter,
              options: [
                { value: "", label: "ทั้งหมด" },
                ...services.map((service) => ({ value: service, label: service })),
              ],
              onChange: setServiceFilter,
            },
          ]}
        />

        <div className="flex gap-2">
          <label className="flex items-center gap-2 px-4 py-2 bg-soft text-app rounded-lg hover:bg-app/10 transition-colors cursor-pointer">
            <Upload className="w-4 h-4" />
            <span>นำเข้าจาก Stock Program</span>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-ptt-blue text-white rounded-lg hover:bg-ptt-blue/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>บันทึกยอดขาย</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-soft text-app rounded-lg hover:bg-app/10 transition-colors">
            <Download className="w-4 h-4" />
            <span>ส่งออก</span>
          </button>
        </div>
      </div>

      {/* Sales List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="panel rounded-2xl p-6"
      >
        <div className="space-y-4">
          {filteredSales.map((sale) => (
            <div
              key={sale.id}
              className="p-4 bg-soft rounded-xl border border-app hover:border-ptt-blue/30 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-semibold text-app">
                    {new Date(sale.date).toLocaleDateString("th-TH", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                  <p className="text-sm text-muted">{sale.customer}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-app">{currencyFormatter.format(sale.total)}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs px-2 py-1 rounded-full bg-ptt-blue/10 text-ptt-cyan border border-ptt-blue/30">
                      {sale.paymentMethod}
                    </span>
                    {sale.paymentMethod.includes("ผ่อน") && (
                      <span className="text-xs px-2 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/30">
                        ผ่อน 0%
                      </span>
                    )}
                    <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      {sale.source}
                    </span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                {sale.items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Wrench className="w-4 h-4 text-ptt-cyan" />
                      <span className="text-muted">
                        {item.name} x {numberFormatter.format(item.quantity)}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-ptt-blue/10 text-ptt-cyan border border-ptt-blue/30">
                        {item.service}
                      </span>
                    </div>
                    <span className="text-app font-medium">
                      {currencyFormatter.format(item.total)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {filteredSales.length === 0 && (
            <div className="text-center py-12 text-muted">
              ไม่พบข้อมูลยอดขาย
            </div>
          )}
        </div>
      </motion.div>

      {/* Add Sale Modal */}
      <ModalForm
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          resetForm();
        }}
        title="บันทึกยอดขาย"
        onSubmit={handleAddSale}
      >
        <div className="space-y-4">
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
              <label className="block text-sm font-medium text-app mb-2">วิธีชำระ</label>
              <select
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
              >
                <option value="เงินสด">เงินสด</option>
                <option value="บัตร">บัตร</option>
                <option value="QR Code">QR Code</option>
                <option value="ผ่อน 0% 6 เดือน">ผ่อน 0% 6 เดือน</option>
                <option value="PTT Card">PTT Card</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-app mb-2">ลูกค้า (ไม่บังคับ)</label>
            <input
              type="text"
              value={formData.customer}
              onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
              className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
              placeholder="ลูกค้าทั่วไป"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-app">รายการบริการ</label>
              <button
                type="button"
                onClick={addItemToForm}
                className="text-sm text-ptt-cyan hover:text-ptt-blue"
              >
                + เพิ่มรายการ
              </button>
            </div>
            <div className="space-y-2">
              {formData.items.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-4">
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => updateItemInForm(index, "name", e.target.value)}
                      placeholder="ชื่อบริการ/อะไหล่"
                      className="w-full px-3 py-2 bg-soft border border-app rounded-lg text-app text-sm"
                      required
                    />
                  </div>
                  <div className="col-span-3">
                    <select
                      value={item.service}
                      onChange={(e) => updateItemInForm(index, "service", e.target.value)}
                      className="w-full px-3 py-2 bg-soft border border-app rounded-lg text-app text-sm"
                    >
                      <option value="ถ่ายน้ำมันเครื่อง">ถ่ายน้ำมันเครื่อง</option>
                      <option value="เปลี่ยนยาง">เปลี่ยนยาง</option>
                      <option value="ตรวจสภาพรถ">ตรวจสภาพรถ</option>
                      <option value="แบตเตอรี่">แบตเตอรี่</option>
                      <option value="ระบบแอร์/ช่วงล่าง">ระบบแอร์/ช่วงล่าง</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateItemInForm(index, "quantity", e.target.value)}
                      placeholder="จำนวน"
                      className="w-full px-3 py-2 bg-soft border border-app rounded-lg text-app text-sm"
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      value={item.price}
                      onChange={(e) => updateItemInForm(index, "price", e.target.value)}
                      placeholder="ราคา"
                      className="w-full px-3 py-2 bg-soft border border-app rounded-lg text-app text-sm"
                      required
                    />
                  </div>
                  <div className="col-span-1 flex items-center gap-1">
                    <span className="text-sm text-app font-medium">
                      {currencyFormatter.format(Number(item.quantity) * Number(item.price))}
                    </span>
                    {formData.items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItemFromForm(index)}
                        className="text-red-400 hover:text-red-500"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-app">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-app">รวมทั้งหมด</span>
                <span className="text-xl font-bold text-ptt-cyan">
                  {currencyFormatter.format(
                    formData.items.reduce(
                      (sum, item) => sum + Number(item.quantity) * Number(item.price),
                      0
                    )
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      </ModalForm>
    </div>
  );
}

