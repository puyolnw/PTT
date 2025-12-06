import { motion } from "framer-motion";
import { useState } from "react";
import {
  Plus,
  Save,
  Droplet,
  Building2,
  MapPin,
  Trash2,
  ShoppingCart,
} from "lucide-react";

const numberFormatter = new Intl.NumberFormat("th-TH", {
  maximumFractionDigits: 0,
});

type Branch = {
  id: number;
  name: string;
  code: string;
  address: string;
  legalEntityName: string;
};

type LegalEntity = {
  id: number;
  name: string;
};

type OrderItem = {
  branchId: number;
  branchName: string;
  oilType: string;
  quantity: number;
  legalEntityId: number;
  legalEntityName: string;
};

type NewOrderFormProps = {
  branches: Branch[];
  legalEntities: LegalEntity[];
  items: OrderItem[];
  onItemsChange: (items: OrderItem[]) => void;
  onClose: () => void;
  onSave: (items: OrderItem[]) => void;
};

const oilTypes = [
  "Premium Diesel",
  "Premium Gasohol 95",
  "Diesel",
  "E85",
  "E20",
  "Gasohol 91",
  "Gasohol 95",
];

export default function NewOrderForm({
  branches,
  legalEntities,
  items,
  onItemsChange,
  onClose,
  onSave,
}: NewOrderFormProps) {
  const [selectedBranch, setSelectedBranch] = useState<number>(branches[0]?.id || 1);
  const [selectedOilType, setSelectedOilType] = useState<string>("");
  const [selectedQuantity, setSelectedQuantity] = useState<string>("");
  const [selectedLegalEntity, setSelectedLegalEntity] = useState<number>(legalEntities[0]?.id || 1);

  const addItem = () => {
    if (!selectedOilType || !selectedQuantity || parseFloat(selectedQuantity) <= 0) {
      alert("กรุณาเลือกประเภทน้ำมันและกรอกจำนวน");
      return;
    }

    const branch = branches.find((b) => b.id === selectedBranch);
    const legalEntity = legalEntities.find((le) => le.id === selectedLegalEntity);

    if (!branch || !legalEntity) {
      alert("ไม่พบข้อมูลสาขาหรือนิติบุคคล");
      return;
    }

    const newItem: OrderItem = {
      branchId: selectedBranch,
      branchName: branch.name,
      oilType: selectedOilType,
      quantity: parseFloat(selectedQuantity),
      legalEntityId: selectedLegalEntity,
      legalEntityName: legalEntity.name,
    };

    onItemsChange([...items, newItem]);
    setSelectedOilType("");
    setSelectedQuantity("");
  };

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    onItemsChange(newItems);
  };

  const updateItem = (index: number, field: keyof OrderItem, value: string | number) => {
    const newItems = [...items];
    (newItems[index] as any)[field] = value;
    
    // ถ้าเปลี่ยน legalEntityId ให้อัพเดต legalEntityName ด้วย
    if (field === "legalEntityId") {
      const legalEntity = legalEntities.find((le) => le.id === value);
      if (legalEntity) {
        newItems[index].legalEntityName = legalEntity.name;
      }
    }
    
    onItemsChange(newItems);
  };

  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const uniqueBranches = new Set(items.map((i) => i.branchId)).size;

  return (
    <div className="space-y-6">
      {/* Add Item Form */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm">
        <h4 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5 text-blue-500" />
          เพิ่มรายการสั่งซื้อ
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* เลือกสาขา */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              สาขา *
            </label>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(parseInt(e.target.value))}
              className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 text-gray-800 dark:text-white"
            >
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>
          </div>

          {/* เลือกประเภทน้ำมัน */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              ประเภทน้ำมัน *
            </label>
            <select
              value={selectedOilType}
              onChange={(e) => setSelectedOilType(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 text-gray-800 dark:text-white"
            >
              <option value="">เลือกประเภทน้ำมัน</option>
              {oilTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* จำนวน */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              จำนวน (ลิตร) *
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={selectedQuantity}
              onChange={(e) => setSelectedQuantity(e.target.value)}
              placeholder="0"
              className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 text-gray-800 dark:text-white"
            />
          </div>

          {/* นิติบุคคล */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              นิติบุคคล *
            </label>
            <select
              value={selectedLegalEntity}
              onChange={(e) => setSelectedLegalEntity(parseInt(e.target.value))}
              className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 text-gray-800 dark:text-white"
            >
              {legalEntities.map((entity) => (
                <option key={entity.id} value={entity.id}>
                  {entity.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            onClick={addItem}
            className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl transition-all duration-200 font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            เพิ่มรายการ
          </button>
        </div>
      </div>

      {/* Items List */}
      {items.length > 0 && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h4 className="text-lg font-bold text-gray-800 dark:text-white mb-1">
              รายการสั่งซื้อ ({uniqueBranches} สาขา, {items.length} รายการ)
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              ยอดรวม: {numberFormatter.format(totalQuantity)} ลิตร
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">สาขา</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">ประเภทน้ำมัน</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">จำนวน (ลิตร)</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">นิติบุคคล</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <motion.tr
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-blue-500" />
                        <span className="text-sm font-semibold text-gray-800 dark:text-white">{item.branchName}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Droplet className="w-4 h-4 text-blue-500" />
                        <select
                          value={item.oilType}
                          onChange={(e) => updateItem(index, "oilType", e.target.value)}
                          className="px-2 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-gray-800 dark:text-white text-sm"
                        >
                          {oilTypes.map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, "quantity", parseFloat(e.target.value) || 0)}
                        className="w-32 px-2 py-1 text-right bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-gray-800 dark:text-white text-sm"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={item.legalEntityId}
                        onChange={(e) => updateItem(index, "legalEntityId", parseInt(e.target.value))}
                        className="w-full px-2 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-gray-800 dark:text-white text-sm"
                      >
                        {legalEntities.map((entity) => (
                          <option key={entity.id} value={entity.id}>
                            {entity.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => removeItem(index)}
                        className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                        title="ลบรายการ"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {items.length === 0 && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-12 text-center">
          <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">ยังไม่มีรายการสั่งซื้อ</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">กรุณาเพิ่มรายการสั่งซื้อด้านบน</p>
        </div>
      )}

      {/* Summary */}
      {items.length > 0 && (
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
          <h4 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-500" />
            สรุปยอดรวม
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1 font-semibold">จำนวนสาขา</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{uniqueBranches} สาขา</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1 font-semibold">จำนวนรายการ</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{items.length} รายการ</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1 font-semibold">ยอดรวม (ลิตร)</p>
              <p className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">
                {numberFormatter.format(totalQuantity)} ลิตร
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Footer Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={onClose}
          className="px-6 py-2.5 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-all duration-200 font-medium hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
        >
          ยกเลิก
        </button>
        <button
          onClick={() => onSave(items)}
          disabled={items.length === 0}
          className="px-8 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl transition-all duration-200 font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
        >
          <Save className="w-4 h-4" />
          บันทึกใบสั่งซื้อ
        </button>
      </div>
    </div>
  );
}

