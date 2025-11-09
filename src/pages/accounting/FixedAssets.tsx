import { motion } from "framer-motion";
import { Package, Plus, Edit, Trash2, TrendingDown, Calendar, MapPin } from "lucide-react";
import { useState } from "react";

const currencyFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 0,
});

// Mock data - Fixed Assets
const mockFixedAssets = [
  {
    id: "FA-001",
    code: "TANK-001",
    name: "ถังน้ำมัน Gasohol 95",
    category: "ถังน้ำมัน",
    location: "สำนักงานใหญ่",
    purchaseDate: "2020-01-15",
    purchasePrice: 2000000,
    usefulLife: 10, // ปี
    depreciationMethod: "Straight-Line",
    accumulatedDepreciation: 800000,
    netBookValue: 1200000,
    status: "Active",
  },
  {
    id: "FA-002",
    code: "PUMP-001",
    name: "ปั๊มจ่ายน้ำมัน",
    category: "อุปกรณ์",
    location: "สาขา A",
    purchaseDate: "2021-06-20",
    purchasePrice: 500000,
    usefulLife: 5,
    depreciationMethod: "Straight-Line",
    accumulatedDepreciation: 200000,
    netBookValue: 300000,
    status: "Active",
  },
  {
    id: "FA-003",
    code: "BUILD-001",
    name: "อาคารสำนักงาน",
    category: "อาคาร",
    location: "สำนักงานใหญ่",
    purchaseDate: "2018-03-10",
    purchasePrice: 10000000,
    usefulLife: 20,
    depreciationMethod: "Straight-Line",
    accumulatedDepreciation: 3000000,
    netBookValue: 7000000,
    status: "Active",
  },
];

export default function FixedAssets() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = Array.from(new Set(mockFixedAssets.map(asset => asset.category)));
  const filteredAssets = selectedCategory 
    ? mockFixedAssets.filter(asset => asset.category === selectedCategory)
    : mockFixedAssets;

  const totalAssets = mockFixedAssets.reduce((sum, asset) => sum + asset.purchasePrice, 0);
  const totalDepreciation = mockFixedAssets.reduce((sum, asset) => sum + asset.accumulatedDepreciation, 0);
  const totalNetBookValue = mockFixedAssets.reduce((sum, asset) => sum + asset.netBookValue, 0);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h2 className="text-3xl font-bold text-app mb-2 font-display">จัดการสินทรัพย์ถาวร</h2>
        <p className="text-muted font-light">
          บันทึกทะเบียนสินทรัพย์, คำนวณค่าเสื่อมราคาอัตโนมัติ, และผูกบัญชีค่าเสื่อม
        </p>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="panel rounded-2xl p-6 shadow-app"
        >
          <div className="flex items-center justify-between mb-4">
            <Package className="w-6 h-6 text-ptt-cyan" />
            <span className="text-xs text-muted">มูลค่าซื้อ</span>
          </div>
          <p className="text-2xl font-bold text-app">
            {currencyFormatter.format(totalAssets)}
          </p>
          <p className="text-xs text-muted mt-1">{mockFixedAssets.length} รายการ</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="panel rounded-2xl p-6 shadow-app"
        >
          <div className="flex items-center justify-between mb-4">
            <TrendingDown className="w-6 h-6 text-orange-400" />
            <span className="text-xs text-muted">ค่าเสื่อมสะสม</span>
          </div>
          <p className="text-2xl font-bold text-orange-400">
            {currencyFormatter.format(totalDepreciation)}
          </p>
          <p className="text-xs text-muted mt-1">
            {((totalDepreciation / totalAssets) * 100).toFixed(1)}% ของมูลค่าซื้อ
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="panel rounded-2xl p-6 shadow-app"
        >
          <div className="flex items-center justify-between mb-4">
            <Package className="w-6 h-6 text-emerald-400" />
            <span className="text-xs text-muted">มูลค่าตามบัญชี</span>
          </div>
          <p className="text-2xl font-bold text-emerald-400">
            {currencyFormatter.format(totalNetBookValue)}
          </p>
          <p className="text-xs text-muted mt-1">มูลค่าสุทธิ</p>
        </motion.div>
      </div>

      {/* Filters and Actions */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-1 gap-4 items-center">
          <select
            value={selectedCategory || ""}
            onChange={(e) => setSelectedCategory(e.target.value || null)}
            className="px-4 py-2 bg-soft border border-app rounded-xl text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue/30"
          >
            <option value="">ทุกประเภท</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-ptt-blue/10 hover:bg-ptt-blue/20 border border-ptt-blue/30 rounded-xl text-ptt-cyan transition-colors">
          <Plus className="w-5 h-5" />
          <span>เพิ่มสินทรัพย์ใหม่</span>
        </button>
      </div>

      {/* Fixed Assets List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="panel rounded-2xl p-6 shadow-app"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-app">รายการสินทรัพย์ถาวร</h3>
          <Package className="w-6 h-6 text-muted" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-app">
                <th className="text-left py-3 px-4 text-sm font-semibold text-muted">รหัส</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-muted">ชื่อสินทรัพย์</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-muted">ประเภท</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-muted">สถานที่</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-muted">มูลค่าซื้อ</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-muted">ค่าเสื่อมสะสม</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-muted">มูลค่าตามบัญชี</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-muted">การจัดการ</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssets.map((asset) => (
                <tr
                  key={asset.id}
                  className="border-b border-app/50 hover:bg-soft/50 transition-colors"
                >
                  <td className="py-3 px-4">
                    <span className="font-mono font-semibold text-app">{asset.code}</span>
                  </td>
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium text-app">{asset.name}</p>
                      <p className="text-xs text-muted">
                        ซื้อ: {new Date(asset.purchaseDate).toLocaleDateString("th-TH")}
                      </p>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 rounded-full bg-ptt-blue/10 text-ptt-cyan text-xs">
                      {asset.category}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted" />
                      <span className="text-sm text-app">{asset.location}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="font-semibold text-app">
                      {currencyFormatter.format(asset.purchasePrice)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="font-semibold text-orange-400">
                      {currencyFormatter.format(asset.accumulatedDepreciation)}
                    </span>
                    <p className="text-xs text-muted">
                      ({((asset.accumulatedDepreciation / asset.purchasePrice) * 100).toFixed(1)}%)
                    </p>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="font-bold text-emerald-400">
                      {currencyFormatter.format(asset.netBookValue)}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-center gap-2">
                      <button className="p-2 hover:bg-soft rounded-lg transition-colors" title="แก้ไข">
                        <Edit className="w-4 h-4 text-muted" />
                      </button>
                      <button className="p-2 hover:bg-red-500/10 rounded-lg transition-colors" title="ลบ">
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Depreciation Schedule */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="panel rounded-2xl p-6 shadow-app"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-app">ตารางค่าเสื่อมราคา</h3>
            <p className="text-sm text-muted">คำนวณค่าเสื่อมราคาอัตโนมัติ (Straight-Line Method)</p>
          </div>
          <Calendar className="w-6 h-6 text-muted" />
        </div>
        <div className="space-y-3">
          {mockFixedAssets.map((asset) => {
            const monthlyDepreciation = asset.purchasePrice / (asset.usefulLife * 12);
            return (
              <div
                key={asset.id}
                className="p-4 bg-soft rounded-xl border border-app"
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-medium text-app">{asset.name} ({asset.code})</p>
                    <p className="text-xs text-muted">
                      อายุการใช้งาน: {asset.usefulLife} ปี • วิธี: {asset.depreciationMethod}
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-ptt-blue/10 text-ptt-cyan text-xs">
                    {asset.depreciationMethod}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                  <div>
                    <p className="text-xs text-muted mb-1">ค่าเสื่อมรายเดือน</p>
                    <p className="text-lg font-semibold text-app">
                      {currencyFormatter.format(monthlyDepreciation)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted mb-1">ค่าเสื่อมสะสม</p>
                    <p className="text-lg font-semibold text-orange-400">
                      {currencyFormatter.format(asset.accumulatedDepreciation)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted mb-1">มูลค่าตามบัญชี</p>
                    <p className="text-lg font-semibold text-emerald-400">
                      {currencyFormatter.format(asset.netBookValue)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}

