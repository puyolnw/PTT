import { useState } from "react";
import { motion } from "framer-motion";
import {
  Tag,
  Plus,
  Edit,
  Trash2,
  Percent,
  ShoppingBag,
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

// Mock data สำหรับโปรโมชัน
const initialPromotions = [
  {
    id: "1",
    name: "ซื้อ 5 แถม 1 - ข้าวตังหมูหยอง",
    type: "buy_x_get_y",
    description: "ซื้อข้าวตังหน้าหมูหยอง 5 ชิ้น แถม 1 ชิ้น",
    buyQuantity: 5,
    getQuantity: 1,
    discount: 0,
    discountPercent: 0,
    startDate: "2024-12-01",
    endDate: "2024-12-31",
    status: "active",
    product: "ข้าวตังหน้าหมูหยอง",
    usageCount: 150,
    totalDiscount: 12000,
  },
  {
    id: "2",
    name: "ลด 20% - ติ่มซำชุดใหญ่",
    type: "discount_percent",
    description: "ลดราคา 20% สำหรับติ่มซำชุดใหญ่",
    buyQuantity: 0,
    getQuantity: 0,
    discount: 0,
    discountPercent: 20,
    startDate: "2024-12-10",
    endDate: "2024-12-25",
    status: "active",
    product: "ติ่มซำชุดใหญ่",
    usageCount: 85,
    totalDiscount: 9000,
  },
  {
    id: "3",
    name: "แสตมป์ 10 ดวง แลก 1 ชิ้นฟรี",
    type: "stamp_card",
    description: "สะสมแสตมป์ 10 ดวง แลกของฝาก 1 ชิ้นฟรี",
    buyQuantity: 10,
    getQuantity: 1,
    discount: 0,
    discountPercent: 0,
    startDate: "2024-11-01",
    endDate: "2025-01-31",
    status: "active",
    product: "ของฝากทั้งหมด",
    usageCount: 45,
    totalDiscount: 8000,
  },
  {
    id: "4",
    name: "ลด 50 บาท - หมูหยอง",
    type: "discount_amount",
    description: "ลดราคา 50 บาท สำหรับหมูหยอง",
    buyQuantity: 0,
    getQuantity: 0,
    discount: 50,
    discountPercent: 0,
    startDate: "2024-12-15",
    endDate: "2024-12-20",
    status: "expired",
    product: "หมูหยอง",
    usageCount: 200,
    totalDiscount: 10000,
  },
];

export default function Promotions() {
  const { currentShop } = useShop();
  const shopName = currentShop?.name || "ร้านเจ้าสัว (Chaosua's)";

  const [promotions, setPromotions] = useState(initialPromotions);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState<typeof initialPromotions[0] | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    type: "buy_x_get_y",
    description: "",
    buyQuantity: "",
    getQuantity: "",
    discount: "",
    discountPercent: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
    product: "",
  });

  // Filter promotions
  const filteredPromotions = promotions.filter((promo) => {
    const matchesSearch = promo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      promo.product.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !statusFilter || promo.status === statusFilter;
    const matchesType = !typeFilter || promo.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  // Calculate stats
  const activePromotions = promotions.filter(p => p.status === "active").length;
  const totalUsage = promotions.reduce((sum, p) => sum + p.usageCount, 0);
  const totalDiscount = promotions.reduce((sum, p) => sum + p.totalDiscount, 0);

  const handleAddPromotion = () => {
    const newPromotion = {
      id: String(promotions.length + 1),
      ...formData,
      buyQuantity: Number(formData.buyQuantity) || 0,
      getQuantity: Number(formData.getQuantity) || 0,
      discount: Number(formData.discount) || 0,
      discountPercent: Number(formData.discountPercent) || 0,
      status: new Date(formData.endDate) >= new Date() ? "active" : "expired",
      usageCount: 0,
      totalDiscount: 0,
    };
    setPromotions([...promotions, newPromotion]);
    setIsAddModalOpen(false);
    resetForm();
  };

  const handleEditPromotion = () => {
    if (!selectedPromotion) return;
    setPromotions(
      promotions.map((p) =>
        p.id === selectedPromotion.id
          ? {
            ...selectedPromotion,
            ...formData,
            buyQuantity: Number(formData.buyQuantity) || 0,
            getQuantity: Number(formData.getQuantity) || 0,
            discount: Number(formData.discount) || 0,
            discountPercent: Number(formData.discountPercent) || 0,
          }
          : p
      )
    );
    setIsEditModalOpen(false);
    setSelectedPromotion(null);
    resetForm();
  };

  const handleDeletePromotion = (id: string) => {
    if (confirm("คุณแน่ใจหรือไม่ว่าต้องการลบโปรโมชันนี้?")) {
      setPromotions(promotions.filter((p) => p.id !== id));
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      type: "buy_x_get_y",
      description: "",
      buyQuantity: "",
      getQuantity: "",
      discount: "",
      discountPercent: "",
      startDate: new Date().toISOString().split("T")[0],
      endDate: "",
      product: "",
    });
  };

  const openEditModal = (promo: typeof initialPromotions[0]) => {
    setSelectedPromotion(promo);
    setFormData({
      name: promo.name,
      type: promo.type,
      description: promo.description,
      buyQuantity: String(promo.buyQuantity),
      getQuantity: String(promo.getQuantity),
      discount: String(promo.discount),
      discountPercent: String(promo.discountPercent),
      startDate: promo.startDate,
      endDate: promo.endDate,
      product: promo.product,
    });
    setIsEditModalOpen(true);
  };

  const getPromotionTypeLabel = (type: string) => {
    switch (type) {
      case "buy_x_get_y": return "ซื้อ X แถม Y";
      case "discount_percent": return "ลดเปอร์เซ็นต์";
      case "discount_amount": return "ลดจำนวนเงิน";
      case "stamp_card": return "แสตมป์";
      default: return type;
    }
  };


  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h2 className="text-3xl font-bold text-app mb-2 font-display">ระบบโปรโมชัน - {shopName}</h2>
        <p className="text-muted font-light">
          จัดการโปรโมชัน: ซื้อ 5 แถม 1, ลดราคา, แสตมป์ (ติ่มซำ + ของฝาก)
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
            <Tag className="w-8 h-8 text-ptt-cyan" />
            <span className="text-sm text-muted">โปรโมชันทั้งหมด</span>
          </div>
          <p className="text-2xl font-bold text-app">{promotions.length}</p>
          <p className="text-sm text-muted">รายการ</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="panel rounded-2xl p-6 border-2 border-emerald-500/30"
        >
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="w-8 h-8 text-emerald-400" />
            <span className="text-sm text-muted">กำลังใช้งาน</span>
          </div>
          <p className="text-2xl font-bold text-emerald-400">{activePromotions}</p>
          <p className="text-sm text-muted">รายการ</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="panel rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <ShoppingBag className="w-8 h-8 text-orange-400" />
            <span className="text-sm text-muted">ใช้ไปแล้ว</span>
          </div>
          <p className="text-2xl font-bold text-app">{numberFormatter.format(totalUsage)}</p>
          <p className="text-sm text-muted">ครั้ง</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="panel rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <Percent className="w-8 h-8 text-purple-400" />
            <span className="text-sm text-muted">ส่วนลดรวม</span>
          </div>
          <p className="text-2xl font-bold text-app">
            {currencyFormatter.format(totalDiscount)}
          </p>
          <p className="text-sm text-muted">บาท</p>
        </motion.div>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <FilterBar
          onSearch={setSearchQuery}
          filters={[
            {
              label: "สถานะ",
              value: statusFilter,
              options: [
                { value: "", label: "ทั้งหมด" },
                { value: "active", label: "กำลังใช้งาน" },
                { value: "expired", label: "หมดอายุ" },
              ],
              onChange: setStatusFilter,
            },
            {
              label: "ประเภท",
              value: typeFilter,
              options: [
                { value: "", label: "ทั้งหมด" },
                { value: "buy_x_get_y", label: "ซื้อ X แถม Y" },
                { value: "discount_percent", label: "ลดเปอร์เซ็นต์" },
                { value: "discount_amount", label: "ลดจำนวนเงิน" },
                { value: "stamp_card", label: "แสตมป์" },
              ],
              onChange: setTypeFilter,
            },
          ]}
        />

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-ptt-blue text-white rounded-lg hover:bg-ptt-blue/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>เพิ่มโปรโมชัน</span>
        </button>
      </div>

      {/* Promotions List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="panel rounded-2xl p-6"
      >
        <div className="space-y-4">
          {filteredPromotions.map((promo) => (
            <div
              key={promo.id}
              className={`p-4 rounded-xl border-2 ${promo.status === "active"
                ? "bg-emerald-500/10 border-emerald-500/30"
                : "bg-gray-500/10 border-gray-500/30"
                }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Tag className="w-5 h-5 text-ptt-cyan" />
                    <h4 className="font-semibold text-app">{promo.name}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${promo.status === "active"
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "bg-gray-500/20 text-gray-400 border border-gray-500/30"
                      }`}>
                      {promo.status === "active" ? "กำลังใช้งาน" : "หมดอายุ"}
                    </span>
                    <span className="px-2 py-1 rounded-full bg-ptt-blue/10 text-ptt-cyan text-xs">
                      {getPromotionTypeLabel(promo.type)}
                    </span>
                  </div>
                  <p className="text-sm text-muted mb-2">{promo.description}</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                    <div>
                      <p className="text-xs text-muted">สินค้า</p>
                      <p className="text-sm font-medium text-app">{promo.product}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted">ใช้ไปแล้ว</p>
                      <p className="text-sm font-medium text-app">{numberFormatter.format(promo.usageCount)} ครั้ง</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted">ส่วนลดรวม</p>
                      <p className="text-sm font-medium text-emerald-400">
                        {currencyFormatter.format(promo.totalDiscount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted">ระยะเวลา</p>
                      <p className="text-sm font-medium text-app">
                        {new Date(promo.startDate).toLocaleDateString("th-TH")} - {new Date(promo.endDate).toLocaleDateString("th-TH")}
                      </p>
                    </div>
                  </div>
                  {promo.type === "buy_x_get_y" && (
                    <div className="mt-2 p-2 bg-soft rounded-lg">
                      <p className="text-xs text-muted">
                        ซื้อ {promo.buyQuantity} แถม {promo.getQuantity}
                      </p>
                    </div>
                  )}
                  {(promo.type === "discount_percent" || promo.type === "discount_amount") && (
                    <div className="mt-2 p-2 bg-soft rounded-lg">
                      <p className="text-xs text-muted">
                        {promo.discountPercent > 0 ? `ลด ${promo.discountPercent}%` : `ลด ${currencyFormatter.format(promo.discount)}`}
                      </p>
                    </div>
                  )}
                  {promo.type === "stamp_card" && (
                    <div className="mt-2 p-2 bg-soft rounded-lg">
                      <p className="text-xs text-muted">
                        สะสม {promo.buyQuantity} ดวง แลก {promo.getQuantity} ชิ้นฟรี
                      </p>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => openEditModal(promo)}
                    className="p-2 hover:bg-soft rounded-lg transition-colors"
                    title="แก้ไข"
                  >
                    <Edit className="w-4 h-4 text-muted" />
                  </button>
                  <button
                    onClick={() => handleDeletePromotion(promo.id)}
                    className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                    title="ลบ"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {filteredPromotions.length === 0 && (
            <div className="text-center py-12 text-muted">
              ไม่พบโปรโมชัน
            </div>
          )}
        </div>
      </motion.div>

      {/* Add Modal */}
      <ModalForm
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          resetForm();
        }}
        title="เพิ่มโปรโมชัน"
        onSubmit={handleAddPromotion}
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="add-promo-name" className="block text-sm font-medium text-app mb-2">ชื่อโปรโมชัน</label>
            <input
              id="add-promo-name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
              placeholder="เช่น ซื้อ 5 แถม 1 - ข้าวตังหมูหยอง"
              required
            />
          </div>
          <div>
            <label htmlFor="add-promo-type" className="block text-sm font-medium text-app mb-2">ประเภทโปรโมชัน</label>
            <select
              id="add-promo-type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
            >
              <option value="buy_x_get_y">ซื้อ X แถม Y</option>
              <option value="discount_percent">ลดเปอร์เซ็นต์</option>
              <option value="discount_amount">ลดจำนวนเงิน</option>
              <option value="stamp_card">แสตมป์</option>
            </select>
          </div>
          <div>
            <label htmlFor="add-promo-description" className="block text-sm font-medium text-app mb-2">รายละเอียด</label>
            <textarea
              id="add-promo-description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
              rows={3}
              placeholder="อธิบายโปรโมชัน"
              required
            />
          </div>
          <div>
            <label htmlFor="add-promo-product" className="block text-sm font-medium text-app mb-2">สินค้า</label>
            <input
              id="add-promo-product"
              type="text"
              value={formData.product}
              onChange={(e) => setFormData({ ...formData, product: e.target.value })}
              className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
              placeholder="เช่น ข้าวตังหน้าหมูหยอง, ติ่มซำชุดใหญ่"
              required
            />
          </div>
          {formData.type === "buy_x_get_y" && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="add-promo-buy-qty" className="block text-sm font-medium text-app mb-2">ซื้อ (จำนวน)</label>
                  <input
                    id="add-promo-buy-qty"
                    type="number"
                    value={formData.buyQuantity}
                    onChange={(e) => setFormData({ ...formData, buyQuantity: e.target.value })}
                    className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="add-promo-get-qty" className="block text-sm font-medium text-app mb-2">แถม (จำนวน)</label>
                  <input
                    id="add-promo-get-qty"
                    type="number"
                    value={formData.getQuantity}
                    onChange={(e) => setFormData({ ...formData, getQuantity: e.target.value })}
                    className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
                    required
                  />
                </div>
              </div>
            </>
          )}
          {formData.type === "discount_percent" && (
            <div>
              <label htmlFor="add-promo-discount-percent" className="block text-sm font-medium text-app mb-2">ลด (%)</label>
              <input
                id="add-promo-discount-percent"
                type="number"
                value={formData.discountPercent}
                onChange={(e) => setFormData({ ...formData, discountPercent: e.target.value })}
                className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
                min="0"
                max="100"
                required
              />
            </div>
          )}
          {formData.type === "discount_amount" && (
            <div>
              <label htmlFor="add-promo-discount-amount" className="block text-sm font-medium text-app mb-2">ลด (บาท)</label>
              <input
                id="add-promo-discount-amount"
                type="number"
                value={formData.discount}
                onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
                min="0"
                required
              />
            </div>
          )}
          {formData.type === "stamp_card" && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="add-promo-stamp-buy" className="block text-sm font-medium text-app mb-2">สะสม (ดวง)</label>
                  <input
                    id="add-promo-stamp-buy"
                    type="number"
                    value={formData.buyQuantity}
                    onChange={(e) => setFormData({ ...formData, buyQuantity: e.target.value })}
                    className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="add-promo-stamp-get" className="block text-sm font-medium text-app mb-2">แลก (ชิ้น)</label>
                  <input
                    id="add-promo-stamp-get"
                    type="number"
                    value={formData.getQuantity}
                    onChange={(e) => setFormData({ ...formData, getQuantity: e.target.value })}
                    className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
                    required
                  />
                </div>
              </div>
            </>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="add-promo-start-date" className="block text-sm font-medium text-app mb-2">วันที่เริ่ม</label>
              <input
                id="add-promo-start-date"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
                required
              />
            </div>
            <div>
              <label htmlFor="add-promo-end-date" className="block text-sm font-medium text-app mb-2">วันที่สิ้นสุด</label>
              <input
                id="add-promo-end-date"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
                required
              />
            </div>
          </div>
        </div>
      </ModalForm>

      {/* Edit Modal */}
      <ModalForm
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedPromotion(null);
          resetForm();
        }}
        title="แก้ไขโปรโมชัน"
        onSubmit={handleEditPromotion}
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="edit-promo-name" className="block text-sm font-medium text-app mb-2">ชื่อโปรโมชัน</label>
            <input
              id="edit-promo-name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
              required
            />
          </div>
          <div>
            <label htmlFor="edit-promo-type" className="block text-sm font-medium text-app mb-2">ประเภทโปรโมชัน</label>
            <select
              id="edit-promo-type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
            >
              <option value="buy_x_get_y">ซื้อ X แถม Y</option>
              <option value="discount_percent">ลดเปอร์เซ็นต์</option>
              <option value="discount_amount">ลดจำนวนเงิน</option>
              <option value="stamp_card">แสตมป์</option>
            </select>
          </div>
          <div>
            <label htmlFor="edit-promo-description" className="block text-sm font-medium text-app mb-2">รายละเอียด</label>
            <textarea
              id="edit-promo-description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
              rows={3}
              required
            />
          </div>
          <div>
            <label htmlFor="edit-promo-product" className="block text-sm font-medium text-app mb-2">สินค้า</label>
            <input
              id="edit-promo-product"
              type="text"
              value={formData.product}
              onChange={(e) => setFormData({ ...formData, product: e.target.value })}
              className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
              required
            />
          </div>
          {formData.type === "buy_x_get_y" && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="edit-promo-buy-qty" className="block text-sm font-medium text-app mb-2">ซื้อ (จำนวน)</label>
                <input
                  id="edit-promo-buy-qty"
                  type="number"
                  value={formData.buyQuantity}
                  onChange={(e) => setFormData({ ...formData, buyQuantity: e.target.value })}
                  className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
                  required
                />
              </div>
              <div>
                <label htmlFor="edit-promo-get-qty" className="block text-sm font-medium text-app mb-2">แถม (จำนวน)</label>
                <input
                  id="edit-promo-get-qty"
                  type="number"
                  value={formData.getQuantity}
                  onChange={(e) => setFormData({ ...formData, getQuantity: e.target.value })}
                  className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
                  required
                />
              </div>
            </div>
          )}
          {formData.type === "discount_percent" && (
            <div>
              <label htmlFor="edit-promo-discount-percent" className="block text-sm font-medium text-app mb-2">ลด (%)</label>
              <input
                id="edit-promo-discount-percent"
                type="number"
                value={formData.discountPercent}
                onChange={(e) => setFormData({ ...formData, discountPercent: e.target.value })}
                className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
                min="0"
                max="100"
                required
              />
            </div>
          )}
          {formData.type === "discount_amount" && (
            <div>
              <label htmlFor="edit-promo-discount-amount" className="block text-sm font-medium text-app mb-2">ลด (บาท)</label>
              <input
                id="edit-promo-discount-amount"
                type="number"
                value={formData.discount}
                onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
                min="0"
                required
              />
            </div>
          )}
          {formData.type === "stamp_card" && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="edit-promo-stamp-buy" className="block text-sm font-medium text-app mb-2">สะสม (ดวง)</label>
                <input
                  id="edit-promo-stamp-buy"
                  type="number"
                  value={formData.buyQuantity}
                  onChange={(e) => setFormData({ ...formData, buyQuantity: e.target.value })}
                  className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
                  required
                />
              </div>
              <div>
                <label htmlFor="edit-promo-stamp-get" className="block text-sm font-medium text-app mb-2">แลก (ชิ้น)</label>
                <input
                  id="edit-promo-stamp-get"
                  type="number"
                  value={formData.getQuantity}
                  onChange={(e) => setFormData({ ...formData, getQuantity: e.target.value })}
                  className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
                  required
                />
              </div>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="edit-promo-start-date" className="block text-sm font-medium text-app mb-2">วันที่เริ่ม</label>
              <input
                id="edit-promo-start-date"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
                required
              />
            </div>
            <div>
              <label htmlFor="edit-promo-end-date" className="block text-sm font-medium text-app mb-2">วันที่สิ้นสุด</label>
              <input
                id="edit-promo-end-date"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
                required
              />
            </div>
          </div>
        </div>
      </ModalForm>
    </div>
  );
}

