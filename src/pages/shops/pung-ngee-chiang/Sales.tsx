import { useState } from "react";
import { motion } from "framer-motion";
import {
  DollarSign,
  Plus,
  Upload,
  Download,
  Calendar,
  TrendingUp,
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

// Mock data
const initialSalesData = [
  {
    id: "1",
    date: "2024-12-15",
    items: [
      { name: "หมูหยอง", quantity: 5, price: 350, total: 1750 },
      { name: "กุนเชียง", quantity: 10, price: 80, total: 800 },
    ],
    total: 2550,
    paymentMethod: "เงินสด",
    customer: "ลูกค้าทั่วไป",
  },
  {
    id: "2",
    date: "2024-12-15",
    items: [
      { name: "หมูแผ่น", quantity: 3, price: 50, total: 150 },
      { name: "แหนม", quantity: 2, price: 60, total: 120 },
    ],
    total: 270,
    paymentMethod: "บัตร",
    customer: "ลูกค้าทั่วไป",
  },
  {
    id: "3",
    date: "2024-12-14",
    items: [
      { name: "หมูหยอง", quantity: 10, price: 350, total: 3500 },
      { name: "กุนเชียง", quantity: 20, price: 80, total: 1600 },
      { name: "หมูแผ่น", quantity: 5, price: 50, total: 250 },
    ],
    total: 5350,
    paymentMethod: "PTT Card",
    customer: "ลูกค้าประจำ",
  },
];

export default function Sales() {
  const { currentShop } = useShop();
  const shopName = currentShop?.name || "ปึงหงี่เชียง";

  const [salesData, setSalesData] = useState(initialSalesData);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    items: [{ name: "", quantity: "", price: "", total: 0 }],
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

  // Filter sales data
  const filteredSales = salesData.filter((sale) => {
    const matchesSearch = sale.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sale.items.some((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesDate = !dateFilter || sale.date === dateFilter;
    const matchesPayment = !paymentFilter || sale.paymentMethod === paymentFilter;
    return matchesSearch && matchesDate && matchesPayment;
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
      })),
      total,
      paymentMethod: formData.paymentMethod,
      customer: formData.customer || "ลูกค้าทั่วไป",
    };

    setSalesData([newSale, ...salesData]);
    setIsAddModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split("T")[0],
      items: [{ name: "", quantity: "", price: "", total: 0 }],
      paymentMethod: "เงินสด",
      customer: "",
    });
  };

  const addItemToForm = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { name: "", quantity: "", price: "", total: 0 }],
    });
  };

  const removeItemFromForm = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    });
  };

  const updateItemInForm = (index: number, field: string, value: string) => {
    const updatedItems = formData.items.map((item, i) => {
      if (i !== index) return item;

      const updatedItem = { ...item, [field]: value };
      const quantity = field === "quantity" ? Number(value) : Number(item.quantity);
      const price = field === "price" ? Number(value) : Number(item.price);

      return {
        ...updatedItem,
        total: (quantity || 0) * (price || 0),
      };
    });

    setFormData({ ...formData, items: updatedItems });
  };

  const paymentMethods = Array.from(new Set(salesData.map((sale) => sale.paymentMethod)));

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h2 className="text-3xl font-bold text-app mb-2 font-display">ยอดขาย - {shopName}</h2>
        <p className="text-muted font-light">
          บันทึกยอดขายและดูรายงานยอดขายรายวัน/เดือน/ปี
        </p>
      </motion.div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
          <p className="text-sm text-muted">
            {salesData.filter((s) => {
              const saleMonth = s.date.substring(0, 7);
              const currentMonth = new Date().toISOString().substring(0, 7);
              return saleMonth === currentMonth;
            }).length} รายการ
          </p>
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
      </div>

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
          ]}
        />

        <div className="flex gap-2">
          <label htmlFor="pung-ngee-chiang-sales-upload" className="flex items-center gap-2 px-4 py-2 bg-soft text-app rounded-lg hover:bg-app/10 transition-colors cursor-pointer">
            <Upload className="w-4 h-4" />
            <span>นำเข้า Excel</span>
            <input
              id="pung-ngee-chiang-sales-upload"
              type="file"
              accept=".xlsx,.xls"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  alert(`กำลังนำเข้าข้อมูลยอดขายจากไฟล์ ${file.name}...\n\nระบบจะประมวลผลและเพิ่มข้อมูลยอดขายอัตโนมัติ`);
                }
              }}
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
        transition={{ delay: 0.4 }}
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
                  <span className="text-xs px-2 py-1 rounded-full bg-ptt-blue/10 text-ptt-cyan border border-ptt-blue/30">
                    {sale.paymentMethod}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                {sale.items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span className="text-muted">
                      {item.name} x {numberFormatter.format(item.quantity)}
                    </span>
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
              <label htmlFor="pung-ngee-chiang-sales-date" className="block text-sm font-medium text-app mb-2">วันที่</label>
              <input
                id="pung-ngee-chiang-sales-date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
                required
              />
            </div>
            <div>
              <label htmlFor="pung-ngee-chiang-sales-payment" className="block text-sm font-medium text-app mb-2">วิธีชำระ</label>
              <select
                id="pung-ngee-chiang-sales-payment"
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
              >
                <option value="เงินสด">เงินสด</option>
                <option value="บัตร">บัตร</option>
                <option value="PTT Card">PTT Card</option>
                <option value="QR Code">QR Code</option>
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="pung-ngee-chiang-sales-customer" className="block text-sm font-medium text-app mb-2">ลูกค้า (ไม่บังคับ)</label>
            <input
              id="pung-ngee-chiang-sales-customer"
              type="text"
              value={formData.customer}
              onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
              className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
              placeholder="ลูกค้าทั่วไป"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="block text-sm font-medium text-app">รายการสินค้า</span>
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
                  <div className="col-span-5">
                    <input
                      aria-label={`Product Name ${index + 1}`}
                      type="text"
                      value={item.name}
                      onChange={(e) => updateItemInForm(index, "name", e.target.value)}
                      placeholder="ชื่อสินค้า"
                      className="w-full px-3 py-2 bg-soft border border-app rounded-lg text-app text-sm"
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      aria-label={`Quantity ${index + 1}`}
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateItemInForm(index, "quantity", e.target.value)}
                      placeholder="จำนวน"
                      className="w-full px-3 py-2 bg-soft border border-app rounded-lg text-app text-sm"
                      required
                    />
                  </div>
                  <div className="col-span-3">
                    <input
                      aria-label={`Price ${index + 1}`}
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

