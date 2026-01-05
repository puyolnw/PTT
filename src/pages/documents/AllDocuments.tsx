import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Plus,
  Download,
  Eye,
  Edit,
  Shield,
  Link as LinkIcon
} from "lucide-react";
import FilterBar from "@/components/FilterBar";
import ModalForm from "@/components/ModalForm";
import StatusTag from "@/components/StatusTag";
import { getStatusVariant } from "@/utils/statusHelpers";
import {
  documents,
  documentCategories,
  employees,
  type Document as DocumentType
} from "@/data/mockData";

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const getDaysUntilExpiry = (expiryDate?: string): number | null => {
  if (!expiryDate) return null;
  const today = new Date();
  const expiry = new Date(expiryDate);
  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

const getSecurityLevelColor = (level: DocumentType["securityLevel"]) => {
  switch (level) {
    case "Public":
      return "bg-green-500/10 text-green-400 border-green-500/30";
    case "Internal":
      return "bg-yellow-500/10 text-yellow-400 border-yellow-500/30";
    case "Confidential":
      return "bg-red-500/10 text-red-400 border-red-500/30";
    default:
      return "bg-muted/10 text-muted border-muted/20";
  }
};

export default function AllDocuments() {
  const [filteredDocuments, setFilteredDocuments] = useState<DocumentType[]>(documents);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [securityFilter, setSecurityFilter] = useState("");
  const [selectedDocument, setSelectedDocument] = useState<DocumentType | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // Handle filtering
  const handleFilter = () => {
    let filtered = documents;

    if (searchQuery) {
      filtered = filtered.filter(
        (doc) =>
          doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          doc.documentNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          doc.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          doc.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (categoryFilter) {
      filtered = filtered.filter((doc) => doc.categoryId === Number(categoryFilter));
    }

    if (statusFilter) {
      filtered = filtered.filter((doc) => doc.status === statusFilter);
    }

    if (securityFilter) {
      filtered = filtered.filter((doc) => doc.securityLevel === securityFilter);
    }

    setFilteredDocuments(filtered);
  };

  useEffect(() => {
    handleFilter();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, categoryFilter, statusFilter, securityFilter]);

  const getCategoryName = (categoryId: number) => {
    return documentCategories.find(c => c.id === categoryId)?.name || "ไม่ระบุ";
  };

  const getCreatorName = (empCode: string) => {
    return employees.find(e => e.code === empCode)?.name || empCode;
  };

  const handleSubmitNewDocument = () => {
    alert("อัปโหลดเอกสารใหม่ (Mock)");
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-app mb-2 font-display">
            เอกสารทั้งหมด
          </h1>
          <p className="text-muted font-light">
            จัดการเอกสารทั้งหมด {filteredDocuments.length} รายการ
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-6 py-3 bg-ptt-blue hover:bg-ptt-blue/80 
                   text-app rounded-xl transition-all duration-200 font-semibold 
                   shadow-lg hover:shadow-xl hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5" />
          อัปโหลดเอกสาร
        </button>
      </div>

      {/* Filter Bar */}
      <FilterBar
        placeholder="ค้นหาชื่อเอกสาร, เลขที่เอกสาร, หรือคำอธิบาย..."
        onSearch={(query) => {
          setSearchQuery(query);
          handleFilter();
        }}
        filters={[
          {
            label: "ทุกหมวดหมู่",
            value: categoryFilter,
            options: [
              { label: "ทุกหมวดหมู่", value: "" },
              ...documentCategories.map((cat) => ({
                label: cat.name,
                value: cat.id.toString()
              }))
            ],
            onChange: (value) => {
              setCategoryFilter(value);
              handleFilter();
            },
          },
          {
            label: "ทุกสถานะ",
            value: statusFilter,
            options: [
              { label: "ทุกสถานะ", value: "" },
              { label: "Active", value: "Active" },
              { label: "Archived", value: "Archived" },
              { label: "Draft", value: "Draft" },
              { label: "Pending", value: "Pending" },
            ],
            onChange: (value) => {
              setStatusFilter(value);
              handleFilter();
            },
          },
          {
            label: "ทุกระดับความลับ",
            value: securityFilter,
            options: [
              { label: "ทุกระดับความลับ", value: "" },
              { label: "Public", value: "Public" },
              { label: "Internal", value: "Internal" },
              { label: "Confidential", value: "Confidential" },
            ],
            onChange: (value) => {
              setSecurityFilter(value);
              handleFilter();
            },
          },
        ]}
      />

      {/* Documents Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-soft border border-app rounded-2xl overflow-hidden shadow-xl"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-soft border-b border-app">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-app">เลขที่เอกสาร</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-app">ชื่อเอกสาร</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-app">หมวดหมู่</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-app">ประเภทไฟล์</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-app">เวอร์ชัน</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-app">วันหมดอายุ</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-app">สถานะ</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-app">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-app">
              {filteredDocuments.map((doc, index) => {
                const days = getDaysUntilExpiry(doc.expiryDate);
                return (
                  <motion.tr
                    key={doc.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-soft transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-ptt-cyan font-medium">
                      {doc.documentNumber}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-ptt-blue/20 rounded-lg">
                          <FileText className="w-4 h-4 text-ptt-cyan" />
                        </div>
                        <div>
                          <p className="text-app font-medium">{doc.title}</p>
                          {doc.description && (
                            <p className="text-xs text-muted">{doc.description}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-app">
                      {getCategoryName(doc.categoryId)}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted">
                      {doc.fileType} • {formatFileSize(doc.fileSize)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-soft text-app">
                        v{doc.version}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {doc.expiryDate ? (
                        <div>
                          <p className="text-app">{formatDate(doc.expiryDate)}</p>
                          {days !== null && (
                            <p className={`text-xs ${days <= 0 ? "text-red-400" :
                                days <= 7 ? "text-orange-400" :
                                  days <= 30 ? "text-yellow-400" : "text-muted"
                              }`}>
                              {days <= 0 ? "หมดอายุแล้ว" : `เหลือ ${days} วัน`}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-col gap-1 items-center">
                        <StatusTag variant={getStatusVariant(
                          doc.status === "Active" ? "Active" :
                            doc.status === "Pending" ? "รออนุมัติ" :
                              doc.status === "Archived" ? "Leave" : "รออนุมัติ"
                        )}>
                          {doc.status}
                        </StatusTag>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${getSecurityLevelColor(doc.securityLevel)
                          }`}>
                          <Shield className="w-3 h-3 mr-1" />
                          {doc.securityLevel === "Public" ? "สาธารณะ" :
                            doc.securityLevel === "Internal" ? "ภายใน" : "ลับ"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedDocument(doc);
                            setIsViewModalOpen(true);
                          }}
                          className="p-2 hover:bg-ptt-blue/20 text-ptt-cyan rounded-lg transition-colors"
                          title="ดูรายละเอียด"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          className="p-2 hover:bg-green-500/20 text-green-400 rounded-lg transition-colors"
                          title="ดาวน์โหลด"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          className="p-2 hover:bg-blue-500/20 text-blue-400 rounded-lg transition-colors"
                          title="แก้ไข"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>

          {filteredDocuments.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted font-light">ไม่พบข้อมูลเอกสาร</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Add Document Modal */}
      <ModalForm
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="อัปโหลดเอกสารใหม่"
        onSubmit={handleSubmitNewDocument}
        submitLabel="อัปโหลด"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="add-doc-title" className="block text-sm font-medium text-app mb-2">
              ชื่อเอกสาร <span className="text-red-400">*</span>
            </label>
            <input
              id="add-doc-title"
              type="text"
              className="w-full px-4 py-2.5 bg-soft border border-app rounded-xl
                       text-app placeholder:text-muted
                       focus:outline-none focus:ring-2 focus:ring-ptt-blue"
              placeholder="เช่น ใบอนุญาตปั๊มน้ำมันสาขา 1"
            />
          </div>

          <div>
            <label htmlFor="add-doc-category" className="block text-sm font-medium text-app mb-2">
              หมวดหมู่ <span className="text-red-400">*</span>
            </label>
            <select
              id="add-doc-category"
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

          <div>
            <label htmlFor="add-doc-desc" className="block text-sm font-medium text-app mb-2">
              คำอธิบาย
            </label>
            <textarea
              id="add-doc-desc"
              rows={3}
              className="w-full px-4 py-2.5 bg-soft border border-app rounded-xl
                       text-app placeholder:text-muted
                       focus:outline-none focus:ring-2 focus:ring-ptt-blue"
              placeholder="อธิบายรายละเอียดเอกสาร"
            />
          </div>

          <div>
            <label htmlFor="add-doc-file" className="block text-sm font-medium text-app mb-2">
              อัปโหลดไฟล์ <span className="text-red-400">*</span>
            </label>
            <label htmlFor="add-doc-file" className="block border-2 border-dashed border-app rounded-xl p-6 text-center cursor-pointer">
              <FileText className="w-12 h-12 text-muted mx-auto mb-2" />
              <p className="text-sm text-muted mb-2">ลากไฟล์มาวางที่นี่ หรือคลิกเพื่อเลือกไฟล์</p>
              <p className="text-xs text-muted">รองรับ PDF, JPG, PNG, DOC, DOCX, XLS, XLSX</p>
              <input
                id="add-doc-file"
                type="file"
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
              />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="add-doc-security" className="block text-sm font-medium text-app mb-2">
                ระดับความลับ
              </label>
              <select
                id="add-doc-security"
                className="w-full px-4 py-2.5 bg-soft border border-app rounded-xl
                         text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue"
              >
                <option value="Public">สาธารณะ</option>
                <option value="Internal">ภายใน</option>
                <option value="Confidential">ลับ</option>
              </select>
            </div>
            <div>
              <label htmlFor="add-doc-expiry" className="block text-sm font-medium text-app mb-2">
                วันหมดอายุ (ถ้ามี)
              </label>
              <input
                id="add-doc-expiry"
                type="date"
                className="w-full px-4 py-2.5 bg-soft border border-app rounded-xl
                         text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue"
              />
            </div>
          </div>

          <div>
            <label htmlFor="add-doc-tags" className="block text-sm font-medium text-app mb-2">
              Tags (คั่นด้วยคอมม่า)
            </label>
            <input
              id="add-doc-tags"
              type="text"
              className="w-full px-4 py-2.5 bg-soft border border-app rounded-xl
                       text-app placeholder:text-muted
                       focus:outline-none focus:ring-2 focus:ring-ptt-blue"
              placeholder="เช่น ใบอนุญาต, ปั๊มน้ำมัน, สาขา 1"
            />
          </div>
        </div>
      </ModalForm>

      {/* View Document Modal */}
      <ModalForm
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedDocument(null);
        }}
        title={`รายละเอียดเอกสาร - ${selectedDocument?.title || ""}`}
        size="lg"
      >
        {selectedDocument && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted mb-1">เลขที่เอกสาร:</p>
                <p className="text-app font-medium">{selectedDocument.documentNumber}</p>
              </div>
              <div>
                <p className="text-muted mb-1">หมวดหมู่:</p>
                <p className="text-app">{getCategoryName(selectedDocument.categoryId)}</p>
              </div>
              <div>
                <p className="text-muted mb-1">ประเภทไฟล์:</p>
                <p className="text-app">{selectedDocument.fileType}</p>
              </div>
              <div>
                <p className="text-muted mb-1">ขนาดไฟล์:</p>
                <p className="text-app">{formatFileSize(selectedDocument.fileSize)}</p>
              </div>
              <div>
                <p className="text-muted mb-1">เวอร์ชัน:</p>
                <p className="text-app">v{selectedDocument.version}</p>
              </div>
              <div>
                <p className="text-muted mb-1">สถานะ:</p>
                <StatusTag variant={getStatusVariant(
                  selectedDocument.status === "Active" ? "Active" :
                    selectedDocument.status === "Pending" ? "รออนุมัติ" :
                      selectedDocument.status === "Archived" ? "Leave" : "รออนุมัติ"
                )}>
                  {selectedDocument.status}
                </StatusTag>
              </div>
              <div>
                <p className="text-muted mb-1">ระดับความลับ:</p>
                <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border ${getSecurityLevelColor(selectedDocument.securityLevel)
                  }`}>
                  <Shield className="w-3 h-3 mr-1" />
                  {selectedDocument.securityLevel === "Public" ? "สาธารณะ" :
                    selectedDocument.securityLevel === "Internal" ? "ภายใน" : "ลับ"}
                </span>
              </div>
              {selectedDocument.expiryDate && (
                <div>
                  <p className="text-muted mb-1">วันหมดอายุ:</p>
                  <p className="text-app">{formatDate(selectedDocument.expiryDate)}</p>
                  {(() => {
                    const days = getDaysUntilExpiry(selectedDocument.expiryDate);
                    return days !== null && (
                      <p className={`text-xs ${days <= 0 ? "text-red-400" :
                          days <= 7 ? "text-orange-400" :
                            days <= 30 ? "text-yellow-400" : "text-muted"
                        }`}>
                        {days <= 0 ? "หมดอายุแล้ว" : `เหลือ ${days} วัน`}
                      </p>
                    );
                  })()}
                </div>
              )}
              {selectedDocument.renewalCost && (
                <div>
                  <p className="text-muted mb-1">ค่าต่ออายุ:</p>
                  <p className="text-ptt-cyan font-semibold">
                    {new Intl.NumberFormat("th-TH", {
                      style: "currency",
                      currency: "THB",
                    }).format(selectedDocument.renewalCost)}
                  </p>
                </div>
              )}
              <div>
                <p className="text-muted mb-1">ผู้สร้าง:</p>
                <p className="text-app">{getCreatorName(selectedDocument.createdBy)}</p>
                <p className="text-xs text-muted">{formatDate(selectedDocument.createdAt)}</p>
              </div>
              {selectedDocument.updatedBy && (
                <div>
                  <p className="text-muted mb-1">แก้ไขล่าสุด:</p>
                  <p className="text-app">{getCreatorName(selectedDocument.updatedBy)}</p>
                  <p className="text-xs text-muted">
                    {selectedDocument.updatedAt && formatDate(selectedDocument.updatedAt)}
                  </p>
                </div>
              )}
              {selectedDocument.approvedBy && (
                <div>
                  <p className="text-muted mb-1">ผู้อนุมัติ:</p>
                  <p className="text-app">{selectedDocument.approvedBy}</p>
                  <p className="text-xs text-muted">
                    {selectedDocument.approvedAt && formatDate(selectedDocument.approvedAt)}
                  </p>
                </div>
              )}
            </div>

            {selectedDocument.description && (
              <div>
                <p className="text-muted mb-1">คำอธิบาย:</p>
                <p className="text-app">{selectedDocument.description}</p>
              </div>
            )}

            {selectedDocument.tags && selectedDocument.tags.length > 0 && (
              <div>
                <p className="text-muted mb-2">Tags:</p>
                <div className="flex flex-wrap gap-2">
                  {selectedDocument.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-ptt-blue/20 text-ptt-cyan rounded-lg text-xs font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {selectedDocument.linkedModule && (
              <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <p className="text-sm text-blue-400 flex items-center gap-2 mb-2">
                  <LinkIcon className="w-4 h-4" />
                  เชื่อมโยงกับโมดูล: {selectedDocument.linkedModule}
                </p>
                {selectedDocument.linkedTransactionId && (
                  <p className="text-xs text-muted">
                    Transaction ID: {selectedDocument.linkedTransactionId}
                  </p>
                )}
                <button className="mt-2 text-xs text-ptt-cyan hover:underline">
                  ดูรายละเอียดที่เชื่อมโยง →
                </button>
              </div>
            )}

            {!selectedDocument.linkedModule && (
              <div className="p-3 bg-soft rounded-lg">
                <p className="text-sm text-muted mb-2">เชื่อมโยงกับโมดูลอื่น:</p>
                <div className="flex gap-2">
                  <button className="px-3 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded text-xs transition-colors">
                    เชื่อมโยงกับ HR
                  </button>
                  <button className="px-3 py-1 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded text-xs transition-colors">
                    เชื่อมโยงกับ Fund
                  </button>
                  <button className="px-3 py-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded text-xs transition-colors">
                    เชื่อมโยงกับ Accounting
                  </button>
                </div>
              </div>
            )}

            {selectedDocument.metadata && (
              <div className="p-3 bg-soft rounded-lg">
                <p className="text-sm text-muted mb-2">ข้อมูลเพิ่มเติม:</p>
                <div className="space-y-1 text-sm">
                  {Object.entries(selectedDocument.metadata).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-muted">{key}:</span>
                      <span className="text-app">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4 border-t border-app">
              <button className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 
                               bg-ptt-blue/20 hover:bg-ptt-blue/30 text-ptt-cyan rounded-lg
                               transition-colors font-medium">
                <Download className="w-4 h-4" />
                ดาวน์โหลด
              </button>
              <button className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 
                               bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg
                               transition-colors font-medium">
                <Edit className="w-4 h-4" />
                แก้ไข
              </button>
            </div>
          </div>
        )}
      </ModalForm>
    </div>
  );
}

