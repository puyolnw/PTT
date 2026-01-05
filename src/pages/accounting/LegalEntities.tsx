import { motion } from "framer-motion";
import { Building2, Plus, Edit, Globe, DollarSign } from "lucide-react";
import { useState } from "react";

const currencyFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 0,
});

// Mock data - Legal Entities
const mockLegalEntities = [
  {
    id: "LE-001",
    code: "LE-001",
    name: "บริษัท เอ บี ซี จำกัด",
    taxId: "0123456789012",
    currency: "THB",
    vatRate: 7,
    address: "123 ถนนสุขุมวิท กรุงเทพมหานคร 10110",
    phone: "02-123-4567",
    email: "info@abc.co.th",
    status: "Active",
    branches: [
      { id: "BR-001", name: "สำนักงานใหญ่", code: "HQ" },
      { id: "BR-002", name: "สาขา A", code: "BR-A" },
      { id: "BR-003", name: "สาขา B", code: "BR-B" },
      { id: "BR-004", name: "สาขา C", code: "BR-C" },
      { id: "BR-005", name: "สาขา D", code: "BR-D" },
    ],
    totalRevenue: 5500000,
    totalAssets: 15000000,
  },
];

export default function LegalEntities() {
  const [selectedEntity, setSelectedEntity] = useState(mockLegalEntities[0].id);

  const entity = mockLegalEntities.find(e => e.id === selectedEntity) || mockLegalEntities[0];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h2 className="text-3xl font-bold text-app mb-2 font-display">จัดการนิติบุคคล</h2>
        <p className="text-muted font-light">
          รองรับการทำบัญชีสำหรับหลายนิติบุคคล (Consolidation Support) เช่น สำนักงานใหญ่และสาขา 5 แห่ง
        </p>
      </motion.div>

      {/* Entity Selection */}
      <div className="flex gap-4">
        {mockLegalEntities.map((ent) => (
          <button
            key={ent.id}
            onClick={() => setSelectedEntity(ent.id)}
            className={`flex-1 px-6 py-4 rounded-xl border-2 transition-all ${selectedEntity === ent.id
                ? "bg-ptt-blue/10 border-ptt-blue/30 text-ptt-cyan"
                : "bg-soft border-app text-muted hover:text-app"
              }`}
          >
            <div className="flex items-center justify-center gap-3">
              <Building2 className="w-5 h-5" />
              <span className="font-semibold">{ent.name}</span>
            </div>
          </button>
        ))}
        <button className="px-6 py-4 rounded-xl border-2 border-app bg-soft hover:bg-soft/80 text-muted transition-colors">
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Entity Details */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="panel rounded-2xl p-6 shadow-app"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-app">{entity.name}</h3>
            <p className="text-sm text-muted">รหัส: {entity.code}</p>
          </div>
          <button className="p-2 hover:bg-soft rounded-lg transition-colors" title="แก้ไข">
            <Edit className="w-5 h-5 text-muted" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <div className="block text-sm font-medium text-muted mb-2">เลขประจำตัวผู้เสียภาษี</div>
              <p className="text-app font-mono">{entity.taxId}</p>
            </div>
            <div>
              <div className="block text-sm font-medium text-muted mb-2">สกุลเงิน</div>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-muted" />
                <p className="text-app">{entity.currency}</p>
              </div>
            </div>
            <div>
              <div className="block text-sm font-medium text-muted mb-2">อัตรา VAT</div>
              <p className="text-app">{entity.vatRate}%</p>
            </div>
            <div>
              <div className="block text-sm font-medium text-muted mb-2">ที่อยู่</div>
              <p className="text-app">{entity.address}</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <div className="block text-sm font-medium text-muted mb-2">โทรศัพท์</div>
              <p className="text-app">{entity.phone}</p>
            </div>
            <div>
              <div className="block text-sm font-medium text-muted mb-2">อีเมล</div>
              <p className="text-app">{entity.email}</p>
            </div>
            <div>
              <div className="block text-sm font-medium text-muted mb-2">สถานะ</div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${entity.status === "Active"
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                  : "bg-gray-500/10 text-gray-400 border border-gray-500/30"
                }`}>
                {entity.status}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Branches */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="panel rounded-2xl p-6 shadow-app"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-app">สาขา ({entity.branches.length} แห่ง)</h3>
            <p className="text-sm text-muted">สำนักงานใหญ่และสาขาทั้งหมด</p>
          </div>
          <Building2 className="w-6 h-6 text-muted" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {entity.branches.map((branch) => (
            <div
              key={branch.id}
              className="p-4 bg-soft rounded-xl border border-app hover:border-ptt-blue/30 transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="font-semibold text-app">{branch.name}</p>
                  <p className="text-xs text-muted font-mono">{branch.code}</p>
                </div>
                {branch.code === "HQ" && (
                  <span className="px-2 py-1 rounded-full bg-ptt-blue/10 text-ptt-cyan text-xs">
                    สำนักงานใหญ่
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Financial Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        <div className="panel rounded-2xl p-6 shadow-app">
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="w-6 h-6 text-emerald-400" />
            <span className="text-xs text-muted">รายได้รวม</span>
          </div>
          <p className="text-2xl font-bold text-emerald-400">
            {currencyFormatter.format(entity.totalRevenue)}
          </p>
          <p className="text-xs text-muted mt-1">เดือนปัจจุบัน</p>
        </div>
        <div className="panel rounded-2xl p-6 shadow-app">
          <div className="flex items-center justify-between mb-4">
            <Building2 className="w-6 h-6 text-blue-400" />
            <span className="text-xs text-muted">สินทรัพย์รวม</span>
          </div>
          <p className="text-2xl font-bold text-blue-400">
            {currencyFormatter.format(entity.totalAssets)}
          </p>
          <p className="text-xs text-muted mt-1">ณ วันที่ล่าสุด</p>
        </div>
      </motion.div>
    </div>
  );
}

