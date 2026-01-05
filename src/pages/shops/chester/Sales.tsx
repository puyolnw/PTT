import { useState } from "react";
import { motion } from "framer-motion";
import {
  DollarSign,
  Plus,
  Upload,
  Download,
  Calendar,
  TrendingUp,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
  Drumstick,
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

// Mock data สำหรับร้านเชสเตอร์ - แยกตามเมนู (ไก่ทอด vs เฟรนช์ฟรายส์)
const initialSalesData = [
  {
    id: "1",
    date: "2024-12-15",
    items: [
      { name: "ไก่ทอดหมาล่า", quantity: 10, price: 100, total: 1000, menu: "ไก่ทอด" },
      { name: "เฟรนช์ฟรายส์", quantity: 5, price: 50, total: 250, menu: "เฟรนช์ฟรายส์" },
    ],
    total: 1250,
    paymentMethod: "PTT Card",
    customer: "ลูกค้าทั่วไป",
    source: "แอป Chester&apos;s",
  },
  {
    id: "2",
    date: "2024-12-15",
    items: [
      { name: "ไก่ทอดซอสเกาหลี", quantity: 8, price: 120, total: 960, menu: "ไก่ทอด" },
      { name: "เฟรนช์ฟรายส์ไก่ย่าง", quantity: 3, price: 99, total: 297, menu: "เฟรนช์ฟรายส์" },
    ],
    total: 1257,
    paymentMethod: "QR Code",
    customer: "ลูกค้าทั่วไป",
    source: "แอป Chester&apos;s",
  },
  {
    id: "3",
    date: "2024-12-14",
    items: [
      { name: "ไก่ทอดหมาล่า", quantity: 20, price: 100, total: 2000, menu: "ไก่ทอด" },
      { name: "ไก่ทอดซอสเกาหลี", quantity: 15, price: 120, total: 1800, menu: "ไก่ทอด" },
      { name: "เฟรนช์ฟรายส์", quantity: 10, price: 50, total: 500, menu: "เฟรนช์ฟรายส์" },
    ],
    total: 4300,
    paymentMethod: "เงินสด",
    customer: "ลูกค้าประจำ",
    source: "Manual",
  },
];

export default function Sales() {
  const { currentShop } = useShop();
  const shopName = currentShop?.name || "ร้านเชสเตอร์ (Chester&apos;s)";
  
  const [salesData, setSalesData] = useState(initialSalesData);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [menuFilter, setMenuFilter] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    items: [{ name: "", quantity: "", price: "", total: 0, menu: "ไก่ทอด" }],
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

  // Calculate sales by menu
  const salesByMenu = salesData.reduce((acc, sale) => {
    sale.items.forEach((item) => {
      if (!acc[item.menu]) {
        acc[item.menu] = 0;
      }
      acc[item.menu] += item.total;
    });
    return acc;
  }, {} as Record<string, number>);

  const totalSales = Object.values(salesByMenu).reduce((sum, val) => sum + val, 0);

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
    const matchesMenu = !menuFilter || sale.items.some((item) => item.menu === menuFilter);
    return matchesSearch && matchesDate && matchesPayment && matchesMenu;
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
        menu: item.menu,
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
      items: [{ name: "", quantity: "", price: "", total: 0, menu: "ไก่ทอด" }],
      paymentMethod: "เงินสด",
      customer: "",
    });
  };

  const addItemToForm = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { name: "", quantity: "", price: "", total: 0, menu: "ไก่ทอด" }],
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
  const menus = ["ไก่ทอด", "เฟรนช์ฟรายส์", "อื่นๆ"];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Simulate file processing from Chester&apos;s App
      alert(`กำลังประมวลผลไฟล์ ${file.name}...\n\nระบบจะนำเข้าข้อมูลยอดขายจากแอป Chester&apos;s (Excel)`);
      
      // Simulate adding sales from file
      const newSale = {
        id: String(salesData.length + 1),
        date: new Date().toISOString().split("T")[0],
        items: [
          { name: "ไก่ทอดหมาล่า", quantity: 5, price: 100, total: 500, menu: "ไก่ทอด" },
          { name: "ไก่ทอดซอสเกาหลี", quantity: 3, price: 120, total: 360, menu: "ไก่ทอด" },
        ],
        total: 860,
        paymentMethod: "PTT Card",
        customer: "ลูกค้าทั่วไป",
        source: "แอป Chester&apos;s",
      };
      setSalesData([newSale, ...salesData]);
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
          บันทึกยอดขายและดูรายงานยอดขายรายวัน/เดือน/ปี แยกตามเมนู (ไก่ทอด vs เฟรนช์ฟรายส์) นำเข้าจาก Excel จากแอป Chester&apos;s หรือกรอกด้วยมือ
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
            <Calendar className="w-8 h-8 text-purple-400" />
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
            <FileText className="w-8 h-8 text-orange-400" />
            <span className="text-sm text-muted">จากแอป Chester&apos;s</span>
          </div>
          <p className="text-2xl font-bold text-app">
            {salesData.filter((s) => s.source === "แอป Chester&apos;s").length}
          </p>
          <p className="text-sm text-muted">รายการ</p>
        </motion.div>
      </div>

      {/* Sales by Menu */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="panel rounded-2xl p-6"
      >
        <h3 className="text-xl font-semibold text-app mb-4">ยอดขายแยกตามเมนู (ไก่ทอด vs เฟรนช์ฟรายส์)</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
            <p className="text-sm text-muted mb-1">ไก่ทอด</p>
            <p className="text-2xl font-bold text-orange-400">
              {currencyFormatter.format(salesByMenu["ไก่ทอด"] || 0)}
            </p>
            <p className="text-xs text-muted mt-1">
              {totalSales > 0 ? ((salesByMenu["ไก่ทอด"] || 0) / totalSales * 100).toFixed(1) : 0}% ของยอดขาย
            </p>
          </div>
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
            <p className="text-sm text-muted mb-1">เฟรนช์ฟรายส์</p>
            <p className="text-2xl font-bold text-yellow-400">
              {currencyFormatter.format(salesByMenu["เฟรนช์ฟรายส์"] || 0)}
            </p>
            <p className="text-xs text-muted mt-1">
              {totalSales > 0 ? ((salesByMenu["เฟรนช์ฟรายส์"] || 0) / totalSales * 100).toFixed(1) : 0}% ของยอดขาย
            </p>
          </div>
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
            <p className="text-sm text-muted mb-1">อื่นๆ</p>
            <p className="text-2xl font-bold text-purple-400">
              {currencyFormatter.format(salesByMenu["อื่นๆ"] || 0)}
            </p>
            <p className="text-xs text-muted mt-1">
              {totalSales > 0 ? ((salesByMenu["อื่นๆ"] || 0) / totalSales * 100).toFixed(1) : 0}% ของยอดขาย
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
              label: "เมนู",
              value: menuFilter,
              options: [
                { value: "", label: "ทั้งหมด" },
                ...menus.map((menu) => ({ value: menu, label: menu })),
              ],
              onChange: setMenuFilter,
            },
          ]}
        />

        <div className="flex gap-2">
          <label className="flex items-center gap-2 px-4 py-2 bg-soft text-app rounded-lg hover:bg-app/10 transition-colors cursor-pointer">
            <Upload className="w-4 h-4" />
            <span>นำเข้า Excel จากแอป Chester&apos;s</span>
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
                      <Drumstick className="w-4 h-4 text-orange-400" />
                      <span className="text-muted">
                        {item.name} x {numberFormatter.format(item.quantity)}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-ptt-blue/10 text-ptt-cyan border border-ptt-blue/30">
                        {item.menu}
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
              <label htmlFor="sale-date" className="block text-sm font-medium text-app mb-2">วันที่</label>
              <input
                id="sale-date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
                required
              />
            </div>
            <div>
              <label htmlFor="payment-method" className="block text-sm font-medium text-app mb-2">วิธีชำระ</label>
              <select
                id="payment-method"
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
              >
                <option value="เงินสด">เงินสด</option>
                <option value="บัตร">บัตร</option>
                <option value="QR Code">QR Code</option>
                <option value="PTT Card">PTT Card</option>
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="customer" className="block text-sm font-medium text-app mb-2">ลูกค้า (ไม่บังคับ)</label>
            <input
              id="customer"
              type="text"
              value={formData.customer}
              onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
              className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
              placeholder="ลูกค้าทั่วไป"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="menu-items" className="block text-sm font-medium text-app">รายการเมนู</label>
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
                      placeholder="ชื่อเมนู"
                      className="w-full px-3 py-2 bg-soft border border-app rounded-lg text-app text-sm"
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <select
                      value={item.menu}
                      onChange={(e) => updateItemInForm(index, "menu", e.target.value)}
                      className="w-full px-3 py-2 bg-soft border border-app rounded-lg text-app text-sm"
                    >
                      <option value="ไก่ทอด">ไก่ทอด</option>
                      <option value="เฟรนช์ฟรายส์">เฟรนช์ฟรายส์</option>
                      <option value="อื่นๆ">อื่นๆ</option>
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
                  <div className="col-span-2 flex items-center gap-1">
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

