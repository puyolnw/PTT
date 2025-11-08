import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Folder, 
  Plus, 
  Edit,
  Trash2,
  FileText
} from "lucide-react";
import ModalForm from "@/components/ModalForm";
import { 
  documentCategories,
  documents,
  type DocumentCategory
} from "@/data/mockData";

const categoryColors: Record<string, string> = {
  blue: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  green: "bg-green-500/20 text-green-400 border-green-500/30",
  purple: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  orange: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  red: "bg-red-500/20 text-red-400 border-red-500/30",
  yellow: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  gray: "bg-gray-500/20 text-gray-400 border-gray-500/30"
};

export default function Categories() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<DocumentCategory | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: "blue"
  });

  const handleAddCategory = () => {
    if (!formData.name) {
      alert("กรุณากรอกชื่อหมวดหมู่");
      return;
    }
    alert(`เพิ่มหมวดหมู่ "${formData.name}" สำเร็จ! (Mock)`);
    setFormData({ name: "", description: "", color: "blue" });
    setIsAddModalOpen(false);
  };

  const handleEditCategory = () => {
    if (!formData.name || !selectedCategory) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }
    alert(`แก้ไขหมวดหมู่ "${formData.name}" สำเร็จ! (Mock)`);
    setFormData({ name: "", description: "", color: "blue" });
    setSelectedCategory(null);
    setIsEditModalOpen(false);
  };

  const handleDeleteCategory = (category: DocumentCategory) => {
    const docCount = documents.filter(d => d.categoryId === category.id).length;
    if (docCount > 0) {
      alert(`ไม่สามารถลบหมวดหมู่นี้ได้ เนื่องจากมีเอกสาร ${docCount} รายการ`);
      return;
    }
    if (confirm(`ต้องการลบหมวดหมู่ "${category.name}" ใช่หรือไม่?`)) {
      alert(`ลบหมวดหมู่ "${category.name}" สำเร็จ! (Mock)`);
    }
  };

  const handleEditClick = (category: DocumentCategory) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      description: category.description || "",
      color: category.color || "blue"
    });
    setIsEditModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-app mb-2 font-display">
            หมวดหมู่เอกสาร
          </h1>
          <p className="text-muted font-light">
            จัดการหมวดหมู่เอกสารทั้งหมด {documentCategories.length} หมวดหมู่
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-6 py-3 bg-ptt-blue hover:bg-ptt-blue/80 
                   text-app rounded-xl transition-all duration-200 font-semibold 
                   shadow-lg hover:shadow-xl hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5" />
          เพิ่มหมวดหมู่
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {documentCategories.map((category, index) => {
          const docCount = documents.filter(d => d.categoryId === category.id).length;
          return (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-soft border border-app rounded-2xl p-6 hover:border-ptt-blue/30 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl ${
                    categoryColors[category.color || "blue"] || categoryColors.blue
                  }`}>
                    <Folder className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-app font-display">
                      {category.name}
                    </h3>
                    {category.description && (
                      <p className="text-sm text-muted mt-1">{category.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditClick(category)}
                    className="p-2 hover:bg-blue-500/20 text-blue-400 rounded-lg transition-colors"
                    title="แก้ไข"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(category)}
                    className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                    title="ลบ"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-app">
                <div className="flex items-center gap-2 text-sm text-muted">
                  <FileText className="w-4 h-4" />
                  <span>{docCount} เอกสาร</span>
                </div>
                <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium border ${
                  categoryColors[category.color || "blue"] || categoryColors.blue
                }`}>
                  {category.name}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Add Category Modal */}
      <ModalForm
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setFormData({ name: "", description: "", color: "blue" });
        }}
        title="เพิ่มหมวดหมู่ใหม่"
        onSubmit={handleAddCategory}
        submitLabel="บันทึก"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-app mb-2">
              ชื่อหมวดหมู่ <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2.5 bg-soft border border-app rounded-xl
                       text-app placeholder:text-muted
                       focus:outline-none focus:ring-2 focus:ring-ptt-blue"
              placeholder="เช่น ใบอนุญาต"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-app mb-2">
              คำอธิบาย
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2.5 bg-soft border border-app rounded-xl
                       text-app placeholder:text-muted
                       focus:outline-none focus:ring-2 focus:ring-ptt-blue"
              placeholder="อธิบายรายละเอียดหมวดหมู่"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-app mb-2">
              สี
            </label>
            <div className="grid grid-cols-7 gap-2">
              {Object.keys(categoryColors).map((color) => (
                <button
                  key={color}
                  onClick={() => setFormData({ ...formData, color })}
                  className={`h-10 rounded-lg border-2 transition-all ${
                    formData.color === color
                      ? "border-ptt-cyan scale-110"
                      : "border-app hover:border-ptt-blue/50"
                  } ${categoryColors[color]}`}
                />
              ))}
            </div>
          </div>
        </div>
      </ModalForm>

      {/* Edit Category Modal */}
      <ModalForm
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedCategory(null);
          setFormData({ name: "", description: "", color: "blue" });
        }}
        title={`แก้ไขหมวดหมู่ - ${selectedCategory?.name || ""}`}
        onSubmit={handleEditCategory}
        submitLabel="บันทึก"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-app mb-2">
              ชื่อหมวดหมู่ <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2.5 bg-soft border border-app rounded-xl
                       text-app placeholder:text-muted
                       focus:outline-none focus:ring-2 focus:ring-ptt-blue"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-app mb-2">
              คำอธิบาย
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2.5 bg-soft border border-app rounded-xl
                       text-app placeholder:text-muted
                       focus:outline-none focus:ring-2 focus:ring-ptt-blue"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-app mb-2">
              สี
            </label>
            <div className="grid grid-cols-7 gap-2">
              {Object.keys(categoryColors).map((color) => (
                <button
                  key={color}
                  onClick={() => setFormData({ ...formData, color })}
                  className={`h-10 rounded-lg border-2 transition-all ${
                    formData.color === color
                      ? "border-ptt-cyan scale-110"
                      : "border-app hover:border-ptt-blue/50"
                  } ${categoryColors[color]}`}
                />
              ))}
            </div>
          </div>
        </div>
      </ModalForm>
    </div>
  );
}

