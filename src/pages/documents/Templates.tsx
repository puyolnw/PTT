import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  FileText, 
  Plus, 
  Trash2,
  Download,
  Eye,
  Upload,
  Search
} from "lucide-react";
import ModalForm from "@/components/ModalForm";
import FilterBar from "@/components/FilterBar";
import { documentCategories, employees } from "@/data/mockData";

// Template interface
interface DocumentTemplate {
  id: number;
  name: string;
  description?: string;
  categoryId: number;
  department?: string; // แผนก
  fileName: string;
  fileUrl: string;
  fileType: "PDF" | "DOC" | "DOCX" | "XLS" | "XLSX" | "OTHER";
  fileSize: number; // bytes
  createdAt: string;
  createdBy: string;
}

// Helper functions
const getEmployeeDept = (empCode: string): string => {
  const employee = employees.find(emp => emp.code === empCode);
  return employee?.dept || "ไม่ระบุ";
};

const getUniqueDepartments = (): string[] => {
  const depts = new Set<string>();
  employees.forEach(emp => {
    if (emp.dept) depts.add(emp.dept);
  });
  return Array.from(depts).sort();
};

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
};

const getFileIcon = (fileType: DocumentTemplate["fileType"]) => {
  switch (fileType) {
    case "PDF":
      return "📄";
    case "DOC":
    case "DOCX":
      return "📝";
    case "XLS":
    case "XLSX":
      return "📊";
    default:
      return "📎";
  }
};

const getFileTypeColor = (fileType: DocumentTemplate["fileType"]) => {
  switch (fileType) {
    case "PDF":
      return "bg-red-500/20 text-red-400 border-red-500/30";
    case "DOC":
    case "DOCX":
      return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    case "XLS":
    case "XLSX":
      return "bg-green-500/20 text-green-400 border-green-500/30";
    default:
      return "bg-gray-500/20 text-gray-400 border-gray-500/30";
  }
};

// Mock templates
const mockTemplates: DocumentTemplate[] = [
  {
    id: 1,
    name: "เทมเพลตใบแจ้งหนี้",
    description: "เทมเพลตสำหรับสร้างใบแจ้งหนี้",
    categoryId: 5,
    department: "Account",
    fileName: "ใบแจ้งหนี้.pdf",
    fileUrl: "/templates/invoice-template.pdf",
    fileType: "PDF",
    fileSize: 245760,
    createdAt: "2025-01-01",
    createdBy: "EMP-0001"
  },
  {
    id: 2,
    name: "เทมเพลตสัญญาเช่า",
    description: "เทมเพลตสำหรับสร้างสัญญาเช่า",
    categoryId: 2,
    department: "Account",
    fileName: "สัญญาเช่า.docx",
    fileUrl: "/templates/lease-contract.docx",
    fileType: "DOCX",
    fileSize: 153600,
    createdAt: "2025-01-15",
    createdBy: "EMP-0001"
  },
  {
    id: 3,
    name: "ใบสมัครงาน",
    description: "เทมเพลตใบสมัครงานสำหรับผู้สมัครงาน",
    categoryId: 4,
    department: "HR",
    fileName: "ใบสมัครงาน.doc",
    fileUrl: "/templates/job-application.doc",
    fileType: "DOC",
    fileSize: 98304,
    createdAt: "2025-01-20",
    createdBy: "EMP-0001"
  },
  {
    id: 4,
    name: "ใบลาออก",
    description: "เทมเพลตใบลาออกสำหรับพนักงาน",
    categoryId: 4,
    department: "HR",
    fileName: "ใบลาออก.pdf",
    fileUrl: "/templates/resignation-letter.pdf",
    fileType: "PDF",
    fileSize: 81920,
    createdAt: "2025-01-25",
    createdBy: "EMP-0001"
  },
  {
    id: 5,
    name: "ใบลา",
    description: "เทมเพลตใบลาป่วย/ลาพักร้อน",
    categoryId: 4,
    department: "HR",
    fileName: "ใบลา.docx",
    fileUrl: "/templates/leave-request.docx",
    fileType: "DOCX",
    fileSize: 65536,
    createdAt: "2025-01-30",
    createdBy: "EMP-0001"
  },
  {
    id: 6,
    name: "ใบขอเบิกเงิน",
    description: "เทมเพลตใบขอเบิกเงิน",
    categoryId: 7,
    department: "Account",
    fileName: "ใบขอเบิกเงิน.xlsx",
    fileUrl: "/templates/expense-request.xlsx",
    fileType: "XLSX",
    fileSize: 122880,
    createdAt: "2025-02-01",
    createdBy: "EMP-0001"
  },
  {
    id: 7,
    name: "ใบขออนุมัติ",
    description: "เทมเพลตใบขออนุมัติทั่วไป",
    categoryId: 7,
    department: "IT",
    fileName: "ใบขออนุมัติ.doc",
    fileUrl: "/templates/approval-request.doc",
    fileType: "DOC",
    fileSize: 73728,
    createdAt: "2025-02-05",
    createdBy: "EMP-0001"
  },
  {
    id: 8,
    name: "สัญญาจ้างงาน",
    description: "เทมเพลตสัญญาจ้างงาน",
    categoryId: 4,
    department: "HR",
    fileName: "สัญญาจ้างงาน.pdf",
    fileUrl: "/templates/employment-contract.pdf",
    fileType: "PDF",
    fileSize: 307200,
    createdAt: "2025-02-10",
    createdBy: "EMP-0001"
  },
  {
    id: 9,
    name: "รายงานการประชุม",
    description: "เทมเพลตรายงานการประชุม",
    categoryId: 7,
    department: "IT",
    fileName: "รายงานการประชุม.docx",
    fileUrl: "/templates/meeting-minutes.docx",
    fileType: "DOCX",
    fileSize: 90112,
    createdAt: "2025-02-15",
    createdBy: "EMP-0001"
  },
  {
    id: 10,
    name: "รายงานยอดขาย",
    description: "เทมเพลตรายงานยอดขายรายเดือน",
    categoryId: 7,
    department: "Marketing",
    fileName: "รายงานยอดขาย.xlsx",
    fileUrl: "/templates/sales-report.xlsx",
    fileType: "XLSX",
    fileSize: 204800,
    createdAt: "2025-02-20",
    createdBy: "EMP-0001"
  },
  {
    id: 11,
    name: "เทมเพลตสัญญาเช่าปั๊ม",
    description: "เทมเพลตสัญญาเช่าพื้นที่ปั๊มน้ำมัน",
    categoryId: 2,
    department: "ปั๊มน้ำมัน",
    fileName: "สัญญาเช่าปั๊ม.pdf",
    fileUrl: "/templates/gas-station-lease.pdf",
    fileType: "PDF",
    fileSize: 189440,
    createdAt: "2025-02-25",
    createdBy: "EMP-0002"
  },
  {
    id: 12,
    name: "รายงานการตรวจสอบ",
    description: "เทมเพลตรายงานการตรวจสอบอุปกรณ์",
    categoryId: 7,
    department: "IT",
    fileName: "รายงานการตรวจสอบ.xlsx",
    fileUrl: "/templates/inspection-report.xlsx",
    fileType: "XLSX",
    fileSize: 163840,
    createdAt: "2025-03-01",
    createdBy: "EMP-0001"
  }
];

export default function Templates() {
  const [templates, setTemplates] = useState<DocumentTemplate[]>(mockTemplates);
  const [filteredTemplates, setFilteredTemplates] = useState<DocumentTemplate[]>(mockTemplates);
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    categoryId: "",
    department: "",
    file: null as File | null
  });

  const getCategoryName = (categoryId: number) => {
    return documentCategories.find(c => c.id === categoryId)?.name || "ไม่ระบุ";
  };

  // Handle filtering
  const handleFilter = () => {
    let filtered = templates;

    if (searchQuery) {
      filtered = filtered.filter(
        (template) =>
          template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          template.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          template.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (categoryFilter) {
      filtered = filtered.filter((template) => template.categoryId === Number(categoryFilter));
    }

    if (departmentFilter) {
      filtered = filtered.filter((template) => template.department === departmentFilter);
    }

    setFilteredTemplates(filtered);
  };

  useEffect(() => {
    handleFilter();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, categoryFilter, departmentFilter, templates]);

  const getFileTypeFromFile = (file: File): DocumentTemplate["fileType"] => {
    const extension = file.name.split('.').pop()?.toUpperCase();
    switch (extension) {
      case "PDF":
        return "PDF";
      case "DOC":
        return "DOC";
      case "DOCX":
        return "DOCX";
      case "XLS":
        return "XLS";
      case "XLSX":
        return "XLSX";
      default:
        return "OTHER";
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file type
      const allowedTypes = [".pdf", ".doc", ".docx", ".xls", ".xlsx"];
      const fileExtension = "." + file.name.split('.').pop()?.toLowerCase();
      if (!allowedTypes.includes(fileExtension)) {
        alert("กรุณาเลือกไฟล์ประเภท PDF, DOC, DOCX, XLS, หรือ XLSX เท่านั้น");
        return;
      }
      setFormData({ ...formData, file });
    }
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.categoryId || !formData.file) {
      alert("กรุณากรอกข้อมูลและอัปโหลดไฟล์ให้ครบถ้วน");
      return;
    }
    const fileType = getFileTypeFromFile(formData.file);
    const newTemplate: DocumentTemplate = {
      id: templates.length + 1,
      name: formData.name,
      description: formData.description,
      categoryId: Number(formData.categoryId),
      department: formData.department || undefined,
      fileName: formData.file.name,
      fileUrl: URL.createObjectURL(formData.file), // Mock: Create object URL
      fileType: fileType,
      fileSize: formData.file.size,
      createdAt: new Date().toISOString().split("T")[0],
      createdBy: "EMP-0001"
    };
    setTemplates([...templates, newTemplate]);
    setIsAddModalOpen(false);
    setFormData({
      name: "",
      description: "",
      categoryId: "",
      department: "",
      file: null
    });
    alert("อัปโหลดเทมเพลตสำเร็จ! (Mock)");
  };

  const handleViewTemplate = (template: DocumentTemplate) => {
    setSelectedTemplate(template);
    setIsViewModalOpen(true);
  };

  const handleDownloadTemplate = (template: DocumentTemplate) => {
    // Mock: Download file
    const link = document.createElement('a');
    link.href = template.fileUrl;
    link.download = template.fileName;
    link.click();
    alert(`กำลังดาวน์โหลด "${template.fileName}" (Mock)`);
  };

  const handleDelete = (id: number) => {
    if (confirm("ต้องการลบเทมเพลตนี้ใช่หรือไม่?")) {
      setTemplates(templates.filter(t => t.id !== id));
      alert("ลบเทมเพลตสำเร็จ! (Mock)");
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-app mb-2 font-display">
            เทมเพลตเอกสาร
          </h1>
          <p className="text-muted font-light">
            จัดการและเก็บไฟล์เทมเพลตเอกสารต่างๆ • {filteredTemplates.length} จาก {templates.length} เทมเพลต
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-6 py-3 bg-ptt-blue hover:bg-ptt-blue/80 
                   text-app rounded-xl transition-all duration-200 font-semibold 
                   shadow-lg hover:shadow-xl hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5" />
          อัปโหลดเทมเพลต
        </button>
      </div>

      {/* Search and Filter Bar */}
      <FilterBar
        placeholder="ค้นหาเทมเพลต..."
        onSearch={setSearchQuery}
        filters={[
          {
            label: "หมวดหมู่",
            value: categoryFilter,
            onChange: setCategoryFilter,
            options: [
              { value: "", label: "ทั้งหมด" },
              ...documentCategories.map((cat) => ({
                value: String(cat.id),
                label: cat.name
              }))
            ]
          },
          {
            label: "แผนก",
            value: departmentFilter,
            onChange: setDepartmentFilter,
            options: [
              { value: "", label: "ทั้งหมด" },
              ...getUniqueDepartments().map((dept) => ({
                value: dept,
                label: dept
              }))
            ]
          }
        ]}
      />

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <FileText className="w-16 h-16 text-muted mx-auto mb-4" />
            <p className="text-muted text-lg">ไม่พบเทมเพลตที่ค้นหา</p>
            <p className="text-muted text-sm mt-2">ลองเปลี่ยนคำค้นหาหรือตัวกรอง</p>
          </div>
        ) : (
          filteredTemplates.map((template, index) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-soft border border-app rounded-2xl p-6 hover:border-ptt-blue/30 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-ptt-blue/20 rounded-xl">
                    <FileText className="w-6 h-6 text-ptt-cyan" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-app font-display">
                      {template.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs text-muted">
                        {getCategoryName(template.categoryId)}
                      </p>
                      {template.department && (
                        <>
                          <span className="text-xs text-muted">•</span>
                          <p className="text-xs text-ptt-cyan font-medium">
                            {template.department}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {template.description && (
                <p className="text-sm text-muted mb-4">{template.description}</p>
              )}

              <div className="mb-4 p-3 bg-soft rounded-lg border border-app">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{getFileIcon(template.fileType)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-app truncate" title={template.fileName}>
                      {template.fileName}
                    </p>
                    <p className="text-xs text-muted">{formatFileSize(template.fileSize)}</p>
                  </div>
                </div>
                <span className={`inline-block px-2 py-1 rounded text-xs border ${getFileTypeColor(template.fileType)}`}>
                  {template.fileType}
                </span>
              </div>

              <div className="flex items-center gap-2 pt-4 border-t border-app">
                <button
                  onClick={() => handleViewTemplate(template)}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 
                           bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg
                           transition-colors font-medium"
                >
                  <Eye className="w-4 h-4" />
                  ดู
                </button>
                <button
                  onClick={() => handleDownloadTemplate(template)}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 
                           bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg
                           transition-colors font-medium"
                >
                  <Download className="w-4 h-4" />
                  ดาวน์โหลด
                </button>
                <button
                  onClick={() => handleDelete(template.id)}
                  className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                  title="ลบ"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Add Template Modal */}
      <ModalForm
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setFormData({
            name: "",
            description: "",
            categoryId: "",
            department: "",
            file: null
          });
        }}
        title="อัปโหลดเทมเพลตใหม่"
        onSubmit={handleSubmit}
        submitLabel="อัปโหลด"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-app mb-2">
              ชื่อเทมเพลต <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2.5 bg-soft border border-app rounded-xl
                       text-app placeholder:text-muted
                       focus:outline-none focus:ring-2 focus:ring-ptt-blue"
              placeholder="เช่น เทมเพลตใบแจ้งหนี้"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-app mb-2">
              คำอธิบาย
            </label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2.5 bg-soft border border-app rounded-xl
                       text-app placeholder:text-muted
                       focus:outline-none focus:ring-2 focus:ring-ptt-blue"
              placeholder="อธิบายเทมเพลต"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-app mb-2">
                หมวดหมู่ <span className="text-red-400">*</span>
              </label>
              <select
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
            <div>
              <label className="block text-sm font-medium text-app mb-2">
                แผนก
              </label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-4 py-2.5 bg-soft border border-app rounded-xl
                         text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue"
              >
                <option value="">เลือกแผนก (ไม่บังคับ)</option>
                {getUniqueDepartments().map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-app mb-2">
              อัปโหลดไฟล์เอกสาร <span className="text-red-400">*</span>
            </label>
            <div className="border-2 border-dashed border-app rounded-xl p-6 text-center hover:border-ptt-blue/50 transition-colors">
              {formData.file ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-3xl">{getFileIcon(getFileTypeFromFile(formData.file))}</span>
                    <div className="text-left">
                      <p className="text-sm font-medium text-app">{formData.file.name}</p>
                      <p className="text-xs text-muted">{formatFileSize(formData.file.size)}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, file: null })}
                    className="text-xs text-red-400 hover:text-red-300"
                  >
                    ลบไฟล์
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="w-12 h-12 text-muted mx-auto mb-2" />
                  <p className="text-sm text-muted mb-2">ลากไฟล์มาวางที่นี่ หรือคลิกเพื่อเลือกไฟล์</p>
                  <p className="text-xs text-muted mb-4">รองรับ PDF, DOC, DOCX, XLS, XLSX</p>
                  <label className="inline-flex items-center gap-2 px-4 py-2 bg-ptt-blue/20 hover:bg-ptt-blue/30 text-ptt-cyan rounded-lg cursor-pointer transition-colors">
                    <Upload className="w-4 h-4" />
                    <span>เลือกไฟล์</span>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.xls,.xlsx"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </>
              )}
            </div>
          </div>
        </div>
      </ModalForm>

      {/* View Template Modal */}
      <ModalForm
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedTemplate(null);
        }}
        title={`ดูเทมเพลต: ${selectedTemplate?.name || ""}`}
        onSubmit={() => {
          if (selectedTemplate) {
            handleDownloadTemplate(selectedTemplate);
          }
        }}
        submitLabel="ดาวน์โหลด"
        size="lg"
      >
        {selectedTemplate && (
          <div className="space-y-4">
            <div className="p-4 bg-soft rounded-lg border border-app">
              <div className="flex items-center gap-4 mb-4">
                <span className="text-4xl">{getFileIcon(selectedTemplate.fileType)}</span>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-app mb-1">{selectedTemplate.fileName}</h3>
                  <div className="flex items-center gap-3 text-sm text-muted">
                    <span>{formatFileSize(selectedTemplate.fileSize)}</span>
                    <span>•</span>
                    <span className={`px-2 py-1 rounded border ${getFileTypeColor(selectedTemplate.fileType)}`}>
                      {selectedTemplate.fileType}
                    </span>
                  </div>
                </div>
              </div>
              {selectedTemplate.description && (
                <p className="text-sm text-muted mt-3">{selectedTemplate.description}</p>
              )}
            </div>

            <div className="p-4 bg-ink-900 rounded-lg border border-app">
              <p className="text-xs text-muted mb-2">ข้อมูลไฟล์:</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted">หมวดหมู่:</span>
                  <span className="text-app">{getCategoryName(selectedTemplate.categoryId)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">วันที่สร้าง:</span>
                  <span className="text-app">
                    {new Date(selectedTemplate.createdAt).toLocaleDateString("th-TH", {
                      year: "numeric",
                      month: "long",
                      day: "numeric"
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">สร้างโดย:</span>
                  <span className="text-app">{selectedTemplate.createdBy}</span>
                </div>
                {selectedTemplate.department && (
                  <div className="flex justify-between">
                    <span className="text-muted">แผนก:</span>
                    <span className="text-app">{selectedTemplate.department}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <p className="text-sm text-yellow-400">
                💡 <strong>หมายเหตุ:</strong> ไฟล์นี้เป็นเทมเพลตสำหรับใช้เป็นต้นแบบในการสร้างเอกสารใหม่
              </p>
            </div>
          </div>
        )}
      </ModalForm>
    </div>
  );
}
