import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Shield,
  User,
  Folder,
  FileText,
  Plus,
  Edit,
  Trash2,
  Check,
  X
} from "lucide-react";
import ModalForm from "@/components/ModalForm";
import {
  documents,
  documentCategories,
  employees
} from "@/data/mockData";

// Permission interface
interface DocumentPermission {
  id: number;
  documentId?: number;
  categoryId?: number;
  userId?: string;
  role?: string;
  read: boolean;
  write: boolean;
  update: boolean;
  delete: boolean;
}

// Mock permissions data
const mockPermissions: DocumentPermission[] = [
  {
    id: 1,
    documentId: 1,
    userId: "EMP-0001",
    read: true,
    write: true,
    update: true,
    delete: false
  },
  {
    id: 2,
    documentId: 1,
    userId: "EMP-0002",
    read: true,
    write: false,
    update: false,
    delete: false
  },
  {
    id: 3,
    categoryId: 4, // HR Documents
    role: "HR Manager",
    read: true,
    write: true,
    update: true,
    delete: true
  }
];

export default function Permissions() {
  const [permissions, setPermissions] = useState<DocumentPermission[]>(mockPermissions);
  const [filteredPermissions, setFilteredPermissions] = useState<DocumentPermission[]>(mockPermissions);
  const [filterType, setFilterType] = useState<"all" | "document" | "category" | "user" | "role">("all");
  const [selectedPermission, setSelectedPermission] = useState<DocumentPermission | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    type: "document" as "document" | "category" | "user" | "role",
    documentId: "",
    categoryId: "",
    userId: "",
    role: "",
    read: true,
    write: false,
    update: false,
    delete: false
  });

  useEffect(() => {
    const filtered = permissions.filter(p => {
      if (filterType === "all") return true;
      if (filterType === "document") return p.documentId !== undefined;
      if (filterType === "category") return p.categoryId !== undefined;
      if (filterType === "user") return p.userId !== undefined;
      if (filterType === "role") return p.role !== undefined;
      return true;
    });
    setFilteredPermissions(filtered);
  }, [filterType, permissions]);

  const getDocumentTitle = (documentId?: number) => {
    if (!documentId) return "-";
    return documents.find(d => d.id === documentId)?.title || `เอกสาร #${documentId}`;
  };

  const getCategoryName = (categoryId?: number) => {
    if (!categoryId) return "-";
    return documentCategories.find(c => c.id === categoryId)?.name || `หมวดหมู่ #${categoryId}`;
  };

  const getUserName = (userId?: string) => {
    if (!userId) return "-";
    return employees.find(e => e.code === userId)?.name || userId;
  };

  const handleSubmit = () => {
    const newPermission: DocumentPermission = {
      id: permissions.length + 1,
      documentId: formData.type === "document" ? Number(formData.documentId) : undefined,
      categoryId: formData.type === "category" ? Number(formData.categoryId) : undefined,
      userId: formData.type === "user" ? formData.userId : undefined,
      role: formData.type === "role" ? formData.role : undefined,
      read: formData.read,
      write: formData.write,
      update: formData.update,
      delete: formData.delete
    };
    setPermissions([...permissions, newPermission]);
    setIsAddModalOpen(false);
    setFormData({
      type: "document",
      documentId: "",
      categoryId: "",
      userId: "",
      role: "",
      read: true,
      write: false,
      update: false,
      delete: false
    });
    alert("เพิ่มสิทธิ์สำเร็จ! (Mock)");
  };

  const handleDelete = (id: number) => {
    if (confirm("ต้องการลบสิทธิ์นี้ใช่หรือไม่?")) {
      setPermissions(permissions.filter(p => p.id !== id));
      alert("ลบสิทธิ์สำเร็จ! (Mock)");
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-app mb-2 font-display">
            จัดการสิทธิ์เอกสาร
          </h1>
          <p className="text-muted font-light">
            กำหนดสิทธิ์การเข้าถึงเอกสาร (R/W/U/D) • แสดง {filteredPermissions.length} รายการ
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-6 py-3 bg-ptt-blue hover:bg-ptt-blue/80 
                   text-app rounded-xl transition-all duration-200 font-semibold 
                   shadow-lg hover:shadow-xl hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5" />
          เพิ่มสิทธิ์
        </button>
      </div>

      {/* Filter */}
      <div className="bg-soft border border-app rounded-2xl p-4">
        <div className="flex flex-wrap gap-2">
          {(["all", "document", "category", "user", "role"] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterType === type
                ? "bg-ptt-blue text-app"
                : "bg-soft text-app hover:bg-app/10"
                }`}
            >
              {type === "all" && "ทั้งหมด"}
              {type === "document" && "ตามเอกสาร"}
              {type === "category" && "ตามหมวดหมู่"}
              {type === "user" && "ตามผู้ใช้"}
              {type === "role" && "ตามบทบาท"}
            </button>
          ))}
        </div>
      </div>

      {/* Permissions Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-soft border border-app rounded-2xl overflow-hidden shadow-xl"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-soft border-b border-app">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-app">ประเภท</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-app">เอกสาร/หมวดหมู่/ผู้ใช้/บทบาท</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-app">Read</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-app">Write</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-app">Update</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-app">Delete</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-app">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-app">
              {filteredPermissions.map((perm, index) => (
                <motion.tr
                  key={perm.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-soft transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {perm.documentId && <FileText className="w-4 h-4 text-ptt-cyan" />}
                      {perm.categoryId && <Folder className="w-4 h-4 text-green-400" />}
                      {perm.userId && <User className="w-4 h-4 text-blue-400" />}
                      {perm.role && <Shield className="w-4 h-4 text-purple-400" />}
                      <span className="text-sm text-app">
                        {perm.documentId && "เอกสาร"}
                        {perm.categoryId && "หมวดหมู่"}
                        {perm.userId && "ผู้ใช้"}
                        {perm.role && "บทบาท"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-app">
                    {perm.documentId && getDocumentTitle(perm.documentId)}
                    {perm.categoryId && getCategoryName(perm.categoryId)}
                    {perm.userId && getUserName(perm.userId)}
                    {perm.role && perm.role}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {perm.read ? (
                      <Check className="w-5 h-5 text-green-400 mx-auto" />
                    ) : (
                      <X className="w-5 h-5 text-red-400 mx-auto" />
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {perm.write ? (
                      <Check className="w-5 h-5 text-green-400 mx-auto" />
                    ) : (
                      <X className="w-5 h-5 text-red-400 mx-auto" />
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {perm.update ? (
                      <Check className="w-5 h-5 text-green-400 mx-auto" />
                    ) : (
                      <X className="w-5 h-5 text-red-400 mx-auto" />
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {perm.delete ? (
                      <Check className="w-5 h-5 text-green-400 mx-auto" />
                    ) : (
                      <X className="w-5 h-5 text-red-400 mx-auto" />
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedPermission(perm);
                          setFormData({
                            type: perm.documentId ? "document" : perm.categoryId ? "category" : perm.userId ? "user" : "role",
                            documentId: perm.documentId?.toString() || "",
                            categoryId: perm.categoryId?.toString() || "",
                            userId: perm.userId || "",
                            role: perm.role || "",
                            read: perm.read,
                            write: perm.write,
                            update: perm.update,
                            delete: perm.delete
                          });
                        }}
                        className="p-2 hover:bg-blue-500/20 text-blue-400 rounded-lg transition-colors"
                        title="แก้ไข"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(perm.id)}
                        className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                        title="ลบ"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>

          {filteredPermissions.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted font-light">ไม่พบข้อมูลสิทธิ์</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Add/Edit Permission Modal */}
      <ModalForm
        isOpen={isAddModalOpen || selectedPermission !== null}
        onClose={() => {
          setIsAddModalOpen(false);
          setSelectedPermission(null);
          setFormData({
            type: "document",
            documentId: "",
            categoryId: "",
            userId: "",
            role: "",
            read: true,
            write: false,
            update: false,
            delete: false
          });
        }}
        title={selectedPermission ? "แก้ไขสิทธิ์" : "เพิ่มสิทธิ์ใหม่"}
        onSubmit={handleSubmit}
        submitLabel="บันทึก"
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="perm-type" className="block text-sm font-medium text-app mb-2">
              ประเภทสิทธิ์ <span className="text-red-400">*</span>
            </label>
            <select
              id="perm-type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as "document" | "category" | "user" | "role" })}
              className="w-full px-4 py-2.5 bg-soft border border-app rounded-xl
                       text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue"
            >
              <option value="document">ตามเอกสาร</option>
              <option value="category">ตามหมวดหมู่</option>
              <option value="user">ตามผู้ใช้</option>
              <option value="role">ตามบทบาท</option>
            </select>
          </div>

          {formData.type === "document" && (
            <div>
              <label htmlFor="perm-doc-id" className="block text-sm font-medium text-app mb-2">
                เลือกเอกสาร <span className="text-red-400">*</span>
              </label>
              <select
                id="perm-doc-id"
                value={formData.documentId}
                onChange={(e) => setFormData({ ...formData, documentId: e.target.value })}
                className="w-full px-4 py-2.5 bg-soft border border-app rounded-xl
                         text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue"
              >
                <option value="">เลือกเอกสาร</option>
                {documents.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {formData.type === "category" && (
            <div>
              <label htmlFor="perm-cat-id" className="block text-sm font-medium text-app mb-2">
                เลือกหมวดหมู่ <span className="text-red-400">*</span>
              </label>
              <select
                id="perm-cat-id"
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full px-4 py-2.5 bg-soft border border-app rounded-xl
                         text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue"
              >
                <option value="">เลือกหมวดหมู่</option>
                {documentCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {formData.type === "user" && (
            <div>
              <label htmlFor="perm-user-id" className="block text-sm font-medium text-app mb-2">
                เลือกผู้ใช้ <span className="text-red-400">*</span>
              </label>
              <select
                id="perm-user-id"
                value={formData.userId}
                onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                className="w-full px-4 py-2.5 bg-soft border border-app rounded-xl
                         text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue"
              >
                <option value="">เลือกผู้ใช้</option>
                {employees.map((emp) => (
                  <option key={emp.code} value={emp.code}>
                    {emp.name} ({emp.code})
                  </option>
                ))}
              </select>
            </div>
          )}

          {formData.type === "role" && (
            <div>
              <label htmlFor="perm-role" className="block text-sm font-medium text-app mb-2">
                บทบาท <span className="text-red-400">*</span>
              </label>
              <input
                id="perm-role"
                type="text"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-4 py-2.5 bg-soft border border-app rounded-xl
                         text-app placeholder:text-muted
                         focus:outline-none focus:ring-2 focus:ring-ptt-blue"
                placeholder="เช่น HR Manager, Admin"
              />
            </div>
          )}

          <div>
            <div className="block text-sm font-medium text-app mb-3">
              สิทธิ์การเข้าถึง
            </div>
            <div className="space-y-3">
              <label htmlFor="perm-checkbox-read" className="flex items-center gap-3 p-3 bg-soft rounded-lg cursor-pointer hover:bg-app/10 transition-colors">
                <input
                  id="perm-checkbox-read"
                  type="checkbox"
                  checked={formData.read}
                  onChange={(e) => setFormData({ ...formData, read: e.target.checked })}
                  className="w-5 h-5 text-ptt-blue rounded focus:ring-ptt-blue"
                />
                <span className="text-sm text-app">Read (R) - อ่านได้</span>
              </label>

              <label htmlFor="perm-checkbox-write" className="flex items-center gap-3 p-3 bg-soft rounded-lg cursor-pointer hover:bg-app/10 transition-colors">
                <input
                  id="perm-checkbox-write"
                  type="checkbox"
                  checked={formData.write}
                  onChange={(e) => setFormData({ ...formData, write: e.target.checked })}
                  className="w-5 h-5 text-ptt-blue rounded focus:ring-ptt-blue"
                />
                <span className="text-sm text-app">Write (W) - เขียน/สร้างได้</span>
              </label>

              <label htmlFor="perm-checkbox-update" className="flex items-center gap-3 p-3 bg-soft rounded-lg cursor-pointer hover:bg-app/10 transition-colors">
                <input
                  id="perm-checkbox-update"
                  type="checkbox"
                  checked={formData.update}
                  onChange={(e) => setFormData({ ...formData, update: e.target.checked })}
                  className="w-5 h-5 text-ptt-blue rounded focus:ring-ptt-blue"
                />
                <span className="text-sm text-app">Update (U) - แก้ไขได้</span>
              </label>

              <label htmlFor="perm-checkbox-delete" className="flex items-center gap-3 p-3 bg-soft rounded-lg cursor-pointer hover:bg-app/10 transition-colors">
                <input
                  id="perm-checkbox-delete"
                  type="checkbox"
                  checked={formData.delete}
                  onChange={(e) => setFormData({ ...formData, delete: e.target.checked })}
                  className="w-5 h-5 text-ptt-blue rounded focus:ring-ptt-blue"
                />
                <span className="text-sm text-app">Delete (D) - ลบได้</span>
              </label>
            </div>
          </div>
        </div>
      </ModalForm>
    </div>
  );
}

