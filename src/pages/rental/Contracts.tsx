import { useState } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Plus,
  Edit,
  Trash2,
  Building,
  Calendar,
  DollarSign,
} from "lucide-react";
import ModalForm from "@/components/ModalForm";
import FilterBar from "@/components/FilterBar";

const currencyFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 0,
});

const branches = ["สำนักงานใหญ่", "สาขา A", "สาขา B", "สาขา C", "สาขา D"];

// Mock data สำหรับสัญญาเช่า
const initialContracts = [
  {
    id: "1",
    shop: "FIT Auto",
    branch: "สำนักงานใหญ่",
    startDate: "2024-01-01",
    endDate: "2024-12-31",
    rentType: "คงที่",
    rentAmount: 7000,
    percentage: null,
    status: "ใช้งาน",
  },
  {
    id: "2",
    shop: "Chester's",
    branch: "สาขา A",
    startDate: "2024-01-01",
    endDate: "2024-12-31",
    rentType: "% จากยอดขาย",
    rentAmount: null,
    percentage: 5,
    status: "ใช้งาน",
  },
  {
    id: "3",
    shop: "Daiso",
    branch: "สาขา A",
    startDate: "2024-01-01",
    endDate: "2024-12-31",
    rentType: "คงที่",
    rentAmount: 4000,
    percentage: null,
    status: "ใช้งาน",
  },
  {
    id: "4",
    shop: "Quick",
    branch: "สาขา B",
    startDate: "2024-01-01",
    endDate: "2024-12-31",
    rentType: "คงที่",
    rentAmount: 6000,
    percentage: null,
    status: "ใช้งาน",
  },
  {
    id: "5",
    shop: "ร้าน EV",
    branch: "สำนักงานใหญ่",
    startDate: "2024-01-01",
    endDate: "2024-12-31",
    rentType: "คงที่",
    rentAmount: 3500,
    percentage: null,
    status: "ใช้งาน",
  },
];

export default function Contracts() {
  const [contracts, setContracts] = useState(initialContracts);
  const [searchQuery, setSearchQuery] = useState("");
  const [branchFilter, setBranchFilter] = useState("");
  const [rentTypeFilter, setRentTypeFilter] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<typeof initialContracts[0] | null>(null);
  const [formData, setFormData] = useState({
    shop: "",
    branch: "สำนักงานใหญ่",
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
    rentType: "คงที่",
    rentAmount: "",
    percentage: "",
  });

  const filteredContracts = contracts.filter((contract) => {
    const matchesSearch = contract.shop.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contract.branch.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBranch = !branchFilter || contract.branch === branchFilter;
    const matchesRentType = !rentTypeFilter || contract.rentType === rentTypeFilter;
    return matchesSearch && matchesBranch && matchesRentType;
  });

  const handleAddContract = () => {
    const newContract = formData.rentType === "คงที่"
      ? {
        id: String(contracts.length + 1),
        shop: formData.shop,
        branch: formData.branch,
        startDate: formData.startDate,
        endDate: formData.endDate,
        rentType: formData.rentType,
        rentAmount: Number(formData.rentAmount),
        percentage: null,
        status: "ใช้งาน" as const,
      }
      : {
        id: String(contracts.length + 1),
        shop: formData.shop,
        branch: formData.branch,
        startDate: formData.startDate,
        endDate: formData.endDate,
        rentType: formData.rentType,
        rentAmount: null,
        percentage: Number(formData.percentage),
        status: "ใช้งาน" as const,
      };
    setContracts([newContract, ...contracts]);
    setIsAddModalOpen(false);
    resetForm();
  };

  const handleEditContract = () => {
    if (!selectedContract) return;
    setContracts(
      contracts.map((contract) => {
        if (contract.id === selectedContract.id) {
          return formData.rentType === "คงที่"
            ? {
              id: contract.id,
              shop: formData.shop,
              branch: formData.branch,
              startDate: formData.startDate,
              endDate: formData.endDate,
              rentType: formData.rentType,
              rentAmount: Number(formData.rentAmount),
              percentage: null,
              status: contract.status,
            }
            : {
              id: contract.id,
              shop: formData.shop,
              branch: formData.branch,
              startDate: formData.startDate,
              endDate: formData.endDate,
              rentType: formData.rentType,
              rentAmount: null,
              percentage: Number(formData.percentage),
              status: contract.status,
            };
        }
        return contract;
      })
    );
    setIsEditModalOpen(false);
    setSelectedContract(null);
    resetForm();
  };

  const handleDeleteContract = (id: string) => {
    if (confirm("คุณแน่ใจหรือไม่ว่าต้องการลบสัญญานี้?")) {
      setContracts(contracts.filter((contract) => contract.id !== id));
    }
  };

  const resetForm = () => {
    setFormData({
      shop: "",
      branch: "สำนักงานใหญ่",
      startDate: new Date().toISOString().split("T")[0],
      endDate: "",
      rentType: "คงที่",
      rentAmount: "",
      percentage: "",
    });
  };

  const openEditModal = (contract: typeof initialContracts[0]) => {
    setSelectedContract(contract);
    setFormData({
      shop: contract.shop,
      branch: contract.branch,
      startDate: contract.startDate,
      endDate: contract.endDate,
      rentType: contract.rentType,
      rentAmount: contract.rentAmount ? String(contract.rentAmount) : "",
      percentage: contract.percentage ? String(contract.percentage) : "",
    });
    setIsEditModalOpen(true);
  };

  const rentTypes = Array.from(new Set(contracts.map((c) => c.rentType)));

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h2 className="text-3xl font-bold text-app mb-2 font-display">สัญญาเช่า - M2</h2>
        <p className="text-muted font-light">
          บันทึกสัญญาเช่าพื้นที่แต่ละร้าน (เริ่ม-สิ้นสุด, อัตราค่าเช่า) รองรับค่าเช่าคงที่และ % จากยอดขาย (ดึงจาก M1) สำหรับทุกประเภทร้านที่เช่าพื้นที่ในปั๊ม
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
            <FileText className="w-8 h-8 text-ptt-cyan" />
            <span className="text-sm text-muted">สัญญาทั้งหมด</span>
          </div>
          <p className="text-2xl font-bold text-app">{contracts.length}</p>
          <p className="text-sm text-muted">สัญญา</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="panel rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <Building className="w-8 h-8 text-emerald-400" />
            <span className="text-sm text-muted">ร้านทั้งหมด</span>
          </div>
          <p className="text-2xl font-bold text-app">
            {new Set(contracts.map((c) => c.shop)).size}
          </p>
          <p className="text-sm text-muted">ร้าน</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="panel rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="w-8 h-8 text-purple-400" />
            <span className="text-sm text-muted">ค่าเช่าคงที่</span>
          </div>
          <p className="text-2xl font-bold text-app">
            {contracts.filter((c) => c.rentType === "คงที่").length}
          </p>
          <p className="text-sm text-muted">สัญญา</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="panel rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="w-8 h-8 text-orange-400" />
            <span className="text-sm text-muted">% จากยอดขาย</span>
          </div>
          <p className="text-2xl font-bold text-app">
            {contracts.filter((c) => c.rentType === "% จากยอดขาย").length}
          </p>
          <p className="text-sm text-muted">สัญญา</p>
        </motion.div>
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
              label: "ประเภทค่าเช่า",
              value: rentTypeFilter,
              options: [{ value: "", label: "ทั้งหมด" }, ...rentTypes.map((type) => ({ value: type, label: type }))],
              onChange: setRentTypeFilter,
            },
          ]}
        />

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-ptt-blue text-white rounded-lg hover:bg-ptt-blue/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>สร้างสัญญาเช่า</span>
        </button>
      </div>

      {/* Contracts Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="panel rounded-2xl p-6"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-app">
                <th className="text-left py-3 px-4 text-sm font-semibold text-app">ร้าน</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-app">สาขา</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-app">ระยะเวลา</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-app">ประเภทค่าเช่า</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-app">อัตรา</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-app">สถานะ</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-app">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {filteredContracts.map((contract) => (
                <tr key={contract.id} className="border-b border-app/50 hover:bg-soft/50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-ptt-cyan" />
                      <p className="font-medium text-app">{contract.shop}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-app">{contract.branch}</p>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted" />
                      <div>
                        <p className="text-sm text-app">
                          {new Date(contract.startDate).toLocaleDateString("th-TH", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                        <p className="text-xs text-muted">
                          ถึง {new Date(contract.endDate).toLocaleDateString("th-TH", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${contract.rentType === "คงที่"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                        : "bg-purple-500/10 text-purple-400 border border-purple-500/30"
                      }`}>
                      {contract.rentType}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-app font-medium">
                      {contract.rentType === "คงที่"
                        ? currencyFormatter.format(contract.rentAmount || 0) + "/เดือน"
                        : `${contract.percentage}% จากยอดขาย`}
                    </p>
                    {contract.rentType === "% จากยอดขาย" && (
                      <p className="text-xs text-muted">(ดึงจาก M1)</p>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 text-xs rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      {contract.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(contract)}
                        className="p-2 hover:bg-soft rounded-lg transition-colors"
                        title="แก้ไข"
                      >
                        <Edit className="w-4 h-4 text-muted" />
                      </button>
                      <button
                        onClick={() => handleDeleteContract(contract.id)}
                        className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="ลบ"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredContracts.length === 0 && (
            <div className="text-center py-12 text-muted">
              ไม่พบข้อมูลสัญญาเช่า
            </div>
          )}
        </div>
      </motion.div>

      {/* Add Contract Modal */}
      <ModalForm
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          resetForm();
        }}
        title="สร้างสัญญาเช่า"
        onSubmit={handleAddContract}
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="add-shop-name" className="block text-sm font-medium text-app mb-2">ชื่อร้าน</label>
            <input
              id="add-shop-name"
              type="text"
              value={formData.shop}
              onChange={(e) => setFormData({ ...formData, shop: e.target.value })}
              className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
              placeholder="เช่น FIT Auto, Chester's, Daiso, Quick, ร้าน EV"
              required
            />
          </div>
          <div>
            <label htmlFor="add-branch" className="block text-sm font-medium text-app mb-2">สาขา</label>
            <select
              id="add-branch"
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="add-start-date" className="block text-sm font-medium text-app mb-2">วันที่เริ่มสัญญา</label>
              <input
                id="add-start-date"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
                required
              />
            </div>
            <div>
              <label htmlFor="add-end-date" className="block text-sm font-medium text-app mb-2">วันที่สิ้นสุดสัญญา</label>
              <input
                id="add-end-date"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
                required
              />
            </div>
          </div>
          <div>
            <label htmlFor="add-rent-type" className="block text-sm font-medium text-app mb-2">ประเภทค่าเช่า</label>
            <select
              id="add-rent-type"
              value={formData.rentType}
              onChange={(e) => setFormData({ ...formData, rentType: e.target.value })}
              className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
            >
              <option value="คงที่">คงที่</option>
              <option value="% จากยอดขาย">% จากยอดขาย (ดึงจาก M1)</option>
            </select>
          </div>
          {formData.rentType === "คงที่" ? (
            <div>
              <label htmlFor="add-rent-amount" className="block text-sm font-medium text-app mb-2">อัตราค่าเช่า (บาท/เดือน)</label>
              <input
                id="add-rent-amount"
                type="number"
                value={formData.rentAmount}
                onChange={(e) => setFormData({ ...formData, rentAmount: e.target.value })}
                className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
                placeholder="เช่น 7000"
                required
              />
            </div>
          ) : (
            <div>
              <label htmlFor="add-percentage" className="block text-sm font-medium text-app mb-2">เปอร์เซ็นต์จากยอดขาย (%)</label>
              <input
                id="add-percentage"
                type="number"
                value={formData.percentage}
                onChange={(e) => setFormData({ ...formData, percentage: e.target.value })}
                className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
                placeholder="เช่น 5"
                required
              />
              <p className="text-xs text-muted mt-1">ระบบจะดึงยอดขายจาก M1 อัตโนมัติ</p>
            </div>
          )}
        </div>
      </ModalForm>

      {/* Edit Contract Modal */}
      <ModalForm
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedContract(null);
          resetForm();
        }}
        title="แก้ไขสัญญาเช่า"
        onSubmit={handleEditContract}
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="edit-shop-name" className="block text-sm font-medium text-app mb-2">ชื่อร้าน</label>
            <input
              id="edit-shop-name"
              type="text"
              value={formData.shop}
              onChange={(e) => setFormData({ ...formData, shop: e.target.value })}
              className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
              required
            />
          </div>
          <div>
            <label htmlFor="edit-branch" className="block text-sm font-medium text-app mb-2">สาขา</label>
            <select
              id="edit-branch"
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="edit-start-date" className="block text-sm font-medium text-app mb-2">วันที่เริ่มสัญญา</label>
              <input
                id="edit-start-date"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
                required
              />
            </div>
            <div>
              <label htmlFor="edit-end-date" className="block text-sm font-medium text-app mb-2">วันที่สิ้นสุดสัญญา</label>
              <input
                id="edit-end-date"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
                required
              />
            </div>
          </div>
          <div>
            <label htmlFor="edit-rent-type" className="block text-sm font-medium text-app mb-2">ประเภทค่าเช่า</label>
            <select
              id="edit-rent-type"
              value={formData.rentType}
              onChange={(e) => setFormData({ ...formData, rentType: e.target.value })}
              className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
            >
              <option value="คงที่">คงที่</option>
              <option value="% จากยอดขาย">% จากยอดขาย (ดึงจาก M1)</option>
            </select>
          </div>
          {formData.rentType === "คงที่" ? (
            <div>
              <label htmlFor="edit-rent-amount" className="block text-sm font-medium text-app mb-2">อัตราค่าเช่า (บาท/เดือน)</label>
              <input
                id="edit-rent-amount"
                type="number"
                value={formData.rentAmount}
                onChange={(e) => setFormData({ ...formData, rentAmount: e.target.value })}
                className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
                required
              />
            </div>
          ) : (
            <div>
              <label htmlFor="edit-percentage" className="block text-sm font-medium text-app mb-2">เปอร์เซ็นต์จากยอดขาย (%)</label>
              <input
                id="edit-percentage"
                type="number"
                value={formData.percentage}
                onChange={(e) => setFormData({ ...formData, percentage: e.target.value })}
                className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
                required
              />
              <p className="text-xs text-muted mt-1">ระบบจะดึงยอดขายจาก M1 อัตโนมัติ</p>
            </div>
          )}
        </div>
      </ModalForm>
    </div>
  );
}

