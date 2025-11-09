import { useState } from "react";
import { motion } from "framer-motion";
import {
  Building,
  Plus,
  AlertTriangle,
  DollarSign,
  Calendar,
  FileText,
  Edit,
  Trash2,
} from "lucide-react";
import ModalForm from "@/components/ModalForm";
import FilterBar from "@/components/FilterBar";

const currencyFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 0,
});

const branches = ["สำนักงานใหญ่", "สาขา A", "สาขา B", "สาขา C", "สาขา D"];

// Mock data สำหรับค่าเช่าภายนอก
const initialExternalRents = [
  {
    id: "1",
    type: "ที่ดิน",
    description: "เช่าที่ดินสำหรับป้ายโฆษณา",
    branch: "สำนักงานใหญ่",
    amount: 20000,
    dueDate: "2024-11-25",
    status: "รอชำระ",
    frequency: "รายเดือน",
  },
  {
    id: "2",
    type: "ป้ายโฆษณา",
    description: "ป้ายโฆษณา PTT",
    branch: "สาขา A",
    amount: 15000,
    dueDate: "2024-11-20",
    status: "ชำระแล้ว",
    frequency: "รายเดือน",
    paidDate: "2024-11-18",
  },
  {
    id: "3",
    type: "ที่ดิน",
    description: "เช่าที่ดินสำรอง",
    branch: "สาขา B",
    amount: 15000,
    dueDate: "2024-11-30",
    status: "รอชำระ",
    frequency: "รายเดือน",
  },
];

export default function ExternalRent() {
  const [externalRents, setExternalRents] = useState(initialExternalRents);
  const [searchQuery, setSearchQuery] = useState("");
  const [branchFilter, setBranchFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedRent, setSelectedRent] = useState<typeof initialExternalRents[0] | null>(null);
  const [formData, setFormData] = useState({
    type: "ที่ดิน",
    description: "",
    branch: "สำนักงานใหญ่",
    amount: "",
    dueDate: "",
    frequency: "รายเดือน",
  });

  const filteredRents = externalRents.filter((rent) => {
    const matchesSearch = rent.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rent.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBranch = !branchFilter || rent.branch === branchFilter;
    const matchesStatus = !statusFilter || rent.status === statusFilter;
    return matchesSearch && matchesBranch && matchesStatus;
  });

  const totalAmount = externalRents.reduce((sum, r) => sum + r.amount, 0);
  const pendingAmount = externalRents
    .filter((r) => r.status === "รอชำระ")
    .reduce((sum, r) => sum + r.amount, 0);

  // Check for upcoming due dates (within 7 days)
  const upcomingDue = externalRents.filter((rent) => {
    if (rent.status === "ชำระแล้ว") return false;
    const dueDate = new Date(rent.dueDate);
    const today = new Date();
    const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays >= 0;
  });

  const handleAddRent = () => {
    const newRent = {
      id: String(externalRents.length + 1),
      ...formData,
      amount: Number(formData.amount),
      status: "รอชำระ",
      paidDate: undefined,
    };
    setExternalRents([newRent, ...externalRents]);
    setIsAddModalOpen(false);
    resetForm();
  };

  const handleEditRent = () => {
    if (!selectedRent) return;
    setExternalRents(
      externalRents.map((rent) =>
        rent.id === selectedRent.id
          ? {
              ...selectedRent,
              ...formData,
              amount: Number(formData.amount),
            }
          : rent
      )
    );
    setIsEditModalOpen(false);
    setSelectedRent(null);
    resetForm();
  };

  const handleDeleteRent = (id: string) => {
    if (confirm("คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้?")) {
      setExternalRents(externalRents.filter((rent) => rent.id !== id));
    }
  };

  const handleMarkAsPaid = (id: string) => {
    setExternalRents(
      externalRents.map((rent) =>
        rent.id === id
          ? { ...rent, status: "ชำระแล้ว", paidDate: new Date().toISOString().split("T")[0] }
          : rent
      )
    );
  };

  const resetForm = () => {
    setFormData({
      type: "ที่ดิน",
      description: "",
      branch: "สำนักงานใหญ่",
      amount: "",
      dueDate: "",
      frequency: "รายเดือน",
    });
  };

  const openEditModal = (rent: typeof initialExternalRents[0]) => {
    setSelectedRent(rent);
    setFormData({
      type: rent.type,
      description: rent.description,
      branch: rent.branch,
      amount: String(rent.amount),
      dueDate: rent.dueDate,
      frequency: rent.frequency,
    });
    setIsEditModalOpen(true);
  };

  const statuses = Array.from(new Set(externalRents.map((r) => r.status)));

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h2 className="text-3xl font-bold text-app mb-2 font-display">ค่าเช่าภายนอก - M2</h2>
        <p className="text-muted font-light">
          บันทึกค่าเช่าที่ปั๊มไปเช่าที่อื่น (เช่น ป้ายโฆษณา, ที่ดิน) ออกใบสำคัญจ่าย ติดตามกำหนดชำระ แจ้งเตือนก่อนครบกำหนด
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
            <Building className="w-8 h-8 text-ptt-cyan" />
            <span className="text-sm text-muted">รายการทั้งหมด</span>
          </div>
          <p className="text-2xl font-bold text-app">{externalRents.length}</p>
          <p className="text-sm text-muted">รายการ</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="panel rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="w-8 h-8 text-red-400" />
            <span className="text-sm text-muted">ค่าใช้จ่ายรวม</span>
          </div>
          <p className="text-2xl font-bold text-app">{currencyFormatter.format(totalAmount)}</p>
          <p className="text-sm text-muted">บาท/เดือน</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="panel rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <AlertTriangle className="w-8 h-8 text-orange-400" />
            <span className="text-sm text-muted">รอชำระ</span>
          </div>
          <p className="text-2xl font-bold text-orange-400">{currencyFormatter.format(pendingAmount)}</p>
          <p className="text-sm text-muted">
            {externalRents.filter((r) => r.status === "รอชำระ").length} รายการ
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="panel rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <Calendar className="w-8 h-8 text-purple-400" />
            <span className="text-sm text-muted">ใกล้ครบกำหนด</span>
          </div>
          <p className="text-2xl font-bold text-app">{upcomingDue.length}</p>
          <p className="text-sm text-muted">รายการ (7 วัน)</p>
        </motion.div>
      </div>

      {/* Upcoming Due Alerts */}
      {upcomingDue.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="panel rounded-2xl p-6 border-2 border-orange-500/30 bg-orange-500/10"
        >
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-orange-400" />
            <h3 className="text-lg font-semibold text-app">แจ้งเตือน: ใกล้ครบกำหนดชำระ (7 วัน)</h3>
          </div>
          <div className="space-y-2">
            {upcomingDue.map((rent) => {
              const dueDate = new Date(rent.dueDate);
              const today = new Date();
              const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
              return (
                <div key={rent.id} className="flex items-center justify-between p-3 bg-app/50 rounded-lg border border-orange-500/20">
                  <div>
                    <p className="font-medium text-app">{rent.description}</p>
                    <p className="text-sm text-muted">{rent.branch}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-app">{currencyFormatter.format(rent.amount)}</p>
                    <p className="text-xs text-orange-400">เหลือ {diffDays} วัน</p>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

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
              options: [{ value: "", label: "ทั้งหมด" }, ...statuses.map((status) => ({ value: status, label: status }))],
              onChange: setStatusFilter,
            },
          ]}
        />

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-ptt-blue text-white rounded-lg hover:bg-ptt-blue/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>บันทึกค่าเช่าภายนอก</span>
        </button>
      </div>

      {/* External Rents List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="panel rounded-2xl p-6"
      >
        <div className="space-y-4">
          {filteredRents.map((rent) => {
            const dueDate = new Date(rent.dueDate);
            const today = new Date();
            const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            const isOverdue = diffDays < 0 && rent.status === "รอชำระ";
            const isUpcoming = diffDays <= 7 && diffDays >= 0 && rent.status === "รอชำระ";

            return (
              <div
                key={rent.id}
                className={`p-4 rounded-xl border ${
                  isOverdue
                    ? "bg-red-500/10 border-red-500/30"
                    : isUpcoming
                    ? "bg-orange-500/10 border-orange-500/30"
                    : rent.status === "ชำระแล้ว"
                    ? "bg-soft border-app"
                    : "bg-soft border-app"
                } hover:border-ptt-blue/30 transition-colors`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-semibold text-app">{rent.type}</p>
                    <p className="text-sm text-muted">{rent.description} • {rent.branch}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-app">{currencyFormatter.format(rent.amount)}</p>
                    <div className="flex items-center gap-2 mt-1 justify-end">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        rent.status === "ชำระแล้ว"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                          : isOverdue
                          ? "bg-red-500/10 text-red-400 border border-red-500/30"
                          : isUpcoming
                          ? "bg-orange-500/10 text-orange-400 border border-orange-500/30"
                          : "bg-gray-500/10 text-gray-400 border border-gray-500/30"
                      }`}>
                        {rent.status}
                      </span>
                      <span className="text-xs px-2 py-1 rounded-full bg-ptt-blue/10 text-ptt-cyan border border-ptt-blue/30">
                        {rent.frequency}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted" />
                    <span className="text-muted">
                      ครบกำหนด: {new Date(rent.dueDate).toLocaleDateString("th-TH", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                    {isOverdue && (
                      <span className="text-xs text-red-400">(เลยกำหนด {Math.abs(diffDays)} วัน)</span>
                    )}
                    {isUpcoming && (
                      <span className="text-xs text-orange-400">(เหลือ {diffDays} วัน)</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {rent.status === "ชำระแล้ว" && rent.paidDate && (
                      <span className="text-xs text-muted">
                        ชำระ: {new Date(rent.paidDate).toLocaleDateString("th-TH")}
                      </span>
                    )}
                    {rent.status === "รอชำระ" && (
                      <button
                        onClick={() => handleMarkAsPaid(rent.id)}
                        className="px-3 py-1 text-xs bg-emerald-500 text-white rounded-lg hover:bg-emerald-500/90 transition-colors"
                      >
                        ทำเครื่องหมายว่าชำระแล้ว
                      </button>
                    )}
                    <button
                      onClick={() => openEditModal(rent)}
                      className="p-1.5 hover:bg-soft rounded-lg transition-colors"
                      title="แก้ไข"
                    >
                      <Edit className="w-4 h-4 text-muted" />
                    </button>
                    <button
                      onClick={() => handleDeleteRent(rent.id)}
                      className="p-1.5 hover:bg-red-500/10 rounded-lg transition-colors"
                      title="ลบ"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </div>
                {rent.status === "รอชำระ" && (
                  <div className="mt-2 p-2 bg-ptt-blue/5 rounded-lg border border-ptt-blue/10">
                    <button className="flex items-center gap-2 text-xs text-ptt-cyan hover:text-ptt-blue">
                      <FileText className="w-3 h-3" />
                      <span>ออกใบสำคัญจ่าย</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
          {filteredRents.length === 0 && (
            <div className="text-center py-12 text-muted">
              ไม่พบข้อมูลค่าเช่าภายนอก
            </div>
          )}
        </div>
      </motion.div>

      {/* Add External Rent Modal */}
      <ModalForm
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          resetForm();
        }}
        title="บันทึกค่าเช่าภายนอก"
        onSubmit={handleAddRent}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-app mb-2">ประเภท</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
            >
              <option value="ที่ดิน">ที่ดิน</option>
              <option value="ป้ายโฆษณา">ป้ายโฆษณา</option>
              <option value="อื่นๆ">อื่นๆ</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-app mb-2">รายละเอียด</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
              placeholder="เช่น เช่าที่ดินสำหรับป้ายโฆษณา"
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-app mb-2">จำนวนเงิน (บาท)</label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-app mb-2">ความถี่</label>
              <select
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
              >
                <option value="รายเดือน">รายเดือน</option>
                <option value="รายปี">รายปี</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-app mb-2">ครบกำหนดชำระ</label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
              required
            />
            <p className="text-xs text-muted mt-1">ระบบจะแจ้งเตือนก่อนครบกำหนด 7 วัน</p>
          </div>
        </div>
      </ModalForm>

      {/* Edit External Rent Modal */}
      <ModalForm
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedRent(null);
          resetForm();
        }}
        title="แก้ไขค่าเช่าภายนอก"
        onSubmit={handleEditRent}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-app mb-2">ประเภท</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
            >
              <option value="ที่ดิน">ที่ดิน</option>
              <option value="ป้ายโฆษณา">ป้ายโฆษณา</option>
              <option value="อื่นๆ">อื่นๆ</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-app mb-2">รายละเอียด</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-app mb-2">จำนวนเงิน (บาท)</label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-app mb-2">ความถี่</label>
              <select
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
              >
                <option value="รายเดือน">รายเดือน</option>
                <option value="รายปี">รายปี</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-app mb-2">ครบกำหนดชำระ</label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
              required
            />
          </div>
        </div>
      </ModalForm>
    </div>
  );
}

