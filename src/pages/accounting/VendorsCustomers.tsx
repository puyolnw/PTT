import { motion } from "framer-motion";
import { Users, Plus, Edit, Trash2, Building2, CreditCard, Search } from "lucide-react";
import { useState } from "react";

// Mock data - Vendors & Customers
const mockVendorsCustomers = {
  vendors: [
    {
      id: "V-001",
      code: "PTT",
      name: "บริษัท ปตท. จำกัด (มหาชน)",
      type: "Vendor",
      taxId: "0107536000011",
      creditTerms: 30,
      contact: "02-537-2000",
      email: "contact@pttplc.com",
      address: "555 ถนนวิภาวดีรังสิต กรุงเทพมหานคร",
      balance: 500000,
      status: "Active",
    },
    {
      id: "V-002",
      code: "SUPPLIER-001",
      name: "บริษัทจัดหาอุปกรณ์ จำกัด",
      type: "Vendor",
      taxId: "0123456789012",
      creditTerms: 15,
      contact: "02-123-4567",
      email: "info@supplier.co.th",
      address: "123 ถนนสุขุมวิท กรุงเทพมหานคร",
      balance: 200000,
      status: "Active",
    },
  ],
  customers: [
    {
      id: "C-001",
      code: "CUST-001",
      name: "บริษัท ABC จำกัด",
      type: "Customer",
      taxId: "0123456789013",
      creditTerms: 30,
      contact: "02-234-5678",
      email: "info@abc.co.th",
      address: "456 ถนนรัชดาภิเษก กรุงเทพมหานคร",
      balance: 500000,
      status: "Active",
    },
    {
      id: "C-002",
      code: "CUST-002",
      name: "ร้าน XYZ",
      type: "Customer",
      taxId: "0123456789014",
      creditTerms: 15,
      contact: "02-345-6789",
      email: "contact@xyz.com",
      address: "789 ถนนพหลโยธิน กรุงเทพมหานคร",
      balance: 300000,
      status: "Active",
    },
  ],
};

const currencyFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 0,
});

export default function VendorsCustomers() {
  const [selectedType, setSelectedType] = useState<"vendors" | "customers">("vendors");
  const [searchTerm, setSearchTerm] = useState("");

  const data = selectedType === "vendors" 
    ? mockVendorsCustomers.vendors 
    : mockVendorsCustomers.customers;

  const filteredData = data.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.taxId.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h2 className="text-3xl font-bold text-app mb-2 font-display">จัดการคู่ค้า</h2>
        <p className="text-muted font-light">
          กำหนดรหัส, ชื่อ, เลขผู้เสียภาษี (Tax ID), และเงื่อนไขเครดิต สำหรับเจ้าหนี้/ลูกหนี้
        </p>
      </motion.div>

      {/* Type Selection */}
      <div className="flex gap-4">
        <button
          onClick={() => setSelectedType("vendors")}
          className={`flex-1 px-6 py-4 rounded-xl border-2 transition-all ${
            selectedType === "vendors"
              ? "bg-ptt-blue/10 border-ptt-blue/30 text-ptt-cyan"
              : "bg-soft border-app text-muted hover:text-app"
          }`}
        >
          <div className="flex items-center justify-center gap-3">
            <Building2 className="w-5 h-5" />
            <span className="font-semibold">เจ้าหนี้ (Vendors)</span>
          </div>
        </button>
        <button
          onClick={() => setSelectedType("customers")}
          className={`flex-1 px-6 py-4 rounded-xl border-2 transition-all ${
            selectedType === "customers"
              ? "bg-ptt-blue/10 border-ptt-blue/30 text-ptt-cyan"
              : "bg-soft border-app text-muted hover:text-app"
          }`}
        >
          <div className="flex items-center justify-center gap-3">
            <Users className="w-5 h-5" />
            <span className="font-semibold">ลูกหนี้ (Customers)</span>
          </div>
        </button>
      </div>

      {/* Search and Actions */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
          <input
            type="text"
            placeholder="ค้นหาด้วยชื่อ, รหัส, หรือ Tax ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-soft border border-app rounded-xl text-app placeholder-muted focus:outline-none focus:ring-2 focus:ring-ptt-blue/30"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-ptt-blue/10 hover:bg-ptt-blue/20 border border-ptt-blue/30 rounded-xl text-ptt-cyan transition-colors">
          <Plus className="w-5 h-5" />
          <span>เพิ่ม{selectedType === "vendors" ? "เจ้าหนี้" : "ลูกหนี้"}ใหม่</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="panel rounded-2xl p-6 shadow-app"
        >
          <div className="flex items-center justify-between mb-4">
            <Users className="w-6 h-6 text-ptt-cyan" />
            <span className="text-xs text-muted">จำนวนทั้งหมด</span>
          </div>
          <p className="text-2xl font-bold text-app">
            {filteredData.length}
          </p>
          <p className="text-xs text-muted mt-1">
            {selectedType === "vendors" ? "เจ้าหนี้" : "ลูกหนี้"}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="panel rounded-2xl p-6 shadow-app"
        >
          <div className="flex items-center justify-between mb-4">
            <CreditCard className="w-6 h-6 text-emerald-400" />
            <span className="text-xs text-muted">ยอดรวม</span>
          </div>
          <p className="text-2xl font-bold text-emerald-400">
            {currencyFormatter.format(filteredData.reduce((sum, item) => sum + item.balance, 0))}
          </p>
          <p className="text-xs text-muted mt-1">ยอดหนี้รวม</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="panel rounded-2xl p-6 shadow-app"
        >
          <div className="flex items-center justify-between mb-4">
            <Building2 className="w-6 h-6 text-blue-400" />
            <span className="text-xs text-muted">เฉลี่ยเครดิต</span>
          </div>
          <p className="text-2xl font-bold text-blue-400">
            {filteredData.length > 0 
              ? Math.round(filteredData.reduce((sum, item) => sum + item.creditTerms, 0) / filteredData.length)
              : 0} วัน
          </p>
          <p className="text-xs text-muted mt-1">เงื่อนไขเครดิต</p>
        </motion.div>
      </div>

      {/* Vendors/Customers List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="panel rounded-2xl p-6 shadow-app"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-app">
            รายการ{selectedType === "vendors" ? "เจ้าหนี้" : "ลูกหนี้"}
          </h3>
          <Users className="w-6 h-6 text-muted" />
        </div>
        <div className="space-y-3">
          {filteredData.map((item) => (
            <div
              key={item.id}
              className="p-4 bg-soft rounded-xl border border-app hover:border-ptt-blue/30 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-semibold text-app">{item.name}</h4>
                    <span className="px-2 py-1 rounded-full bg-ptt-blue/10 text-ptt-cyan text-xs font-mono">
                      {item.code}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      item.status === "Active"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                        : "bg-gray-500/10 text-gray-400 border border-gray-500/30"
                    }`}>
                      {item.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted">Tax ID: </span>
                      <span className="text-app font-mono">{item.taxId}</span>
                    </div>
                    <div>
                      <span className="text-muted">เครดิต: </span>
                      <span className="text-app">{item.creditTerms} วัน</span>
                    </div>
                    <div>
                      <span className="text-muted">โทร: </span>
                      <span className="text-app">{item.contact}</span>
                    </div>
                    <div>
                      <span className="text-muted">อีเมล: </span>
                      <span className="text-app">{item.email}</span>
                    </div>
                    <div className="md:col-span-2">
                      <span className="text-muted">ที่อยู่: </span>
                      <span className="text-app">{item.address}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right ml-4">
                  <p className="text-sm text-muted mb-1">ยอดหนี้</p>
                  <p className="text-xl font-bold text-app">
                    {currencyFormatter.format(item.balance)}
                  </p>
                  <div className="flex items-center justify-end gap-2 mt-3">
                    <button className="p-2 hover:bg-soft rounded-lg transition-colors" title="แก้ไข">
                      <Edit className="w-4 h-4 text-muted" />
                    </button>
                    <button className="p-2 hover:bg-red-500/10 rounded-lg transition-colors" title="ลบ">
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {filteredData.length === 0 && (
            <div className="text-center py-8 text-muted">
              ไม่พบข้อมูล
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

