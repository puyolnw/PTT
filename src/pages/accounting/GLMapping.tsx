import { motion } from "framer-motion";
import { Link2, Plus, Edit, Trash2, Package, CreditCard, Building2 } from "lucide-react";
import { useState } from "react";

// Mock data - GL Mapping
const mockGLMappings = [
  {
    id: "MAP-001",
    source: "M1",
    sourceType: "Product",
    sourceCode: "FUEL-G95",
    sourceName: "Gasohol 95",
    glAccount: "4111",
    glAccountName: "รายได้ขายน้ำมัน",
    type: "Revenue",
    status: "Active",
  },
  {
    id: "MAP-002",
    source: "M1",
    sourceType: "PaymentChannel",
    sourceCode: "QR",
    sourceName: "QR / KPLUS / PROMPTPAY",
    glAccount: "1120",
    glAccountName: "เงินฝากธนาคาร",
    type: "Asset",
    status: "Active",
  },
  {
    id: "MAP-003",
    source: "M2",
    sourceType: "Rental",
    sourceCode: "FIT-AUTO",
    sourceName: "FIT Auto",
    glAccount: "4112",
    glAccountName: "รายได้ค่าเช่า",
    type: "Revenue",
    status: "Active",
  },
  {
    id: "MAP-004",
    source: "M3",
    sourceType: "Expense",
    sourceCode: "SALARY",
    sourceName: "เงินเดือน",
    glAccount: "5121",
    glAccountName: "ค่าแรง",
    type: "Expense",
    status: "Active",
  },
  {
    id: "MAP-005",
    source: "M5",
    sourceType: "Loan",
    sourceCode: "LOAN",
    sourceName: "กู้ยืม",
    glAccount: "1130",
    glAccountName: "ลูกหนี้",
    type: "Asset",
    status: "Active",
  },
];

export default function GLMapping() {
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const filteredMappings = mockGLMappings.filter(mapping => {
    const matchesSource = !selectedSource || mapping.source === selectedSource;
    const matchesType = !selectedType || mapping.type === selectedType;
    return matchesSource && matchesType;
  });

  const sources = Array.from(new Set(mockGLMappings.map(m => m.source)));
  const types = Array.from(new Set(mockGLMappings.map(m => m.type)));

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h2 className="text-3xl font-bold text-app mb-2 font-display">การผูกบัญชีอัตโนมัติ (GL Mapping)</h2>
        <p className="text-muted font-light">
          ผูกบัญชี GL กับรหัสสินค้า/บริการ, ช่องทางรับชำระเงิน, และบัญชีธนาคาร เพื่อบันทึกบัญชีอัตโนมัติ
        </p>
      </motion.div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <select
          value={selectedSource || ""}
          onChange={(e) => setSelectedSource(e.target.value || null)}
          className="px-4 py-2 bg-soft border border-app rounded-xl text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue/30"
        >
          <option value="">ทุกโมดูล</option>
          {sources.map(source => (
            <option key={source} value={source}>{source}</option>
          ))}
        </select>
        <select
          value={selectedType || ""}
          onChange={(e) => setSelectedType(e.target.value || null)}
          className="px-4 py-2 bg-soft border border-app rounded-xl text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue/30"
        >
          <option value="">ทุกประเภท</option>
          {types.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
        <button className="flex items-center gap-2 px-4 py-2 bg-ptt-blue/10 hover:bg-ptt-blue/20 border border-ptt-blue/30 rounded-xl text-ptt-cyan transition-colors">
          <Plus className="w-5 h-5" />
          <span>เพิ่ม Mapping ใหม่</span>
        </button>
      </div>

      {/* GL Mappings List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="panel rounded-2xl p-6 shadow-app"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-app">รายการ Mapping</h3>
            <p className="text-sm text-muted">
              {filteredMappings.length} รายการ
            </p>
          </div>
          <Link2 className="w-6 h-6 text-muted" />
        </div>
        <div className="space-y-3">
          {filteredMappings.map((mapping) => (
            <div
              key={mapping.id}
              className="p-4 bg-soft rounded-xl border border-app hover:border-ptt-blue/30 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      {mapping.sourceType === "Product" && <Package className="w-5 h-5 text-ptt-cyan" />}
                      {mapping.sourceType === "PaymentChannel" && <CreditCard className="w-5 h-5 text-blue-400" />}
                      {mapping.sourceType === "Rental" && <Building2 className="w-5 h-5 text-emerald-400" />}
                      {mapping.sourceType === "Expense" && <Package className="w-5 h-5 text-orange-400" />}
                      {mapping.sourceType === "Loan" && <CreditCard className="w-5 h-5 text-purple-400" />}
                      <div>
                        <p className="font-semibold text-app">{mapping.sourceName}</p>
                        <p className="text-xs text-muted">
                          {mapping.source} • {mapping.sourceCode}
                        </p>
                      </div>
                    </div>
                    <Link2 className="w-4 h-4 text-muted" />
                    <div>
                      <p className="font-semibold text-ptt-cyan">{mapping.glAccountName}</p>
                      <p className="text-xs text-muted font-mono">
                        {mapping.glAccount} • {mapping.type}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 rounded-full bg-ptt-blue/10 text-ptt-cyan text-xs">
                      {mapping.source}
                    </span>
                    <span className="px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs">
                      {mapping.type}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      mapping.status === "Active"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                        : "bg-gray-500/10 text-gray-400 border border-gray-500/30"
                    }`}>
                      {mapping.status}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button className="p-2 hover:bg-soft rounded-lg transition-colors" title="แก้ไข">
                    <Edit className="w-4 h-4 text-muted" />
                  </button>
                  <button className="p-2 hover:bg-red-500/10 rounded-lg transition-colors" title="ลบ">
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {filteredMappings.length === 0 && (
            <div className="text-center py-8 text-muted">
              ไม่พบข้อมูล Mapping
            </div>
          )}
        </div>
      </motion.div>

      {/* Mapping Guide */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="panel rounded-2xl p-6 shadow-app bg-gradient-to-br from-ptt-blue/10 to-ptt-cyan/10 border border-ptt-blue/30"
      >
        <h3 className="text-lg font-semibold text-app mb-4">คำอธิบายการ Mapping</h3>
        <div className="space-y-2 text-sm text-muted">
          <p>• <strong>M1 (Product):</strong> ผูกรหัสสินค้า (เช่น Gasohol 95) กับบัญชีรายได้</p>
          <p>• <strong>M1 (PaymentChannel):</strong> ผูกช่องทางชำระเงิน (เช่น QR) กับบัญชีธนาคาร</p>
          <p>• <strong>M2 (Rental):</strong> ผูกร้านค้าเช่า (เช่น FIT Auto) กับบัญชีรายได้ค่าเช่า</p>
          <p>• <strong>M3 (Expense):</strong> ผูกค่าใช้จ่าย (เช่น เงินเดือน) กับบัญชีค่าใช้จ่าย</p>
          <p>• <strong>M5 (Loan):</strong> ผูกการกู้ยืมกับบัญชีลูกหนี้</p>
        </div>
      </motion.div>
    </div>
  );
}

