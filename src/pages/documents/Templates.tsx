import { useState } from "react";
import { motion } from "framer-motion";
import { 
  FileCode, 
  Plus, 
  Trash2,
  Copy
} from "lucide-react";
import ModalForm from "@/components/ModalForm";
import { documentCategories } from "@/data/mockData";

// Template interface
interface DocumentTemplate {
  id: number;
  name: string;
  description?: string;
  categoryId: number;
  templateContent: string;
  variables: string[]; // เช่น {companyName}, {date}, {amount}
  createdAt: string;
  createdBy: string;
}

// Mock templates
const mockTemplates: DocumentTemplate[] = [
  {
    id: 1,
    name: "เทมเพลตใบแจ้งหนี้",
    description: "เทมเพลตสำหรับสร้างใบแจ้งหนี้",
    categoryId: 5,
    templateContent: "ใบแจ้งหนี้\nบริษัท: {companyName}\nวันที่: {date}\nยอดรวม: {amount} บาท",
    variables: ["companyName", "date", "amount"],
    createdAt: "2025-01-01",
    createdBy: "EMP-0001"
  },
  {
    id: 2,
    name: "เทมเพลตสัญญาเช่า",
    description: "เทมเพลตสำหรับสร้างสัญญาเช่า",
    categoryId: 2,
    templateContent: "สัญญาเช่า\nผู้ให้เช่า: {lessorName}\nผู้เช่า: {lesseeName}\nระยะเวลา: {duration}\nค่าเช่า: {rentAmount} บาท/เดือน",
    variables: ["lessorName", "lesseeName", "duration", "rentAmount"],
    createdAt: "2025-01-15",
    createdBy: "EMP-0001"
  }
];

export default function Templates() {
  const [templates, setTemplates] = useState<DocumentTemplate[]>(mockTemplates);
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUseModalOpen, setIsUseModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    categoryId: "",
    templateContent: "",
    variables: [] as string[]
  });
  const [variableInput, setVariableInput] = useState("");

  const getCategoryName = (categoryId: number) => {
    return documentCategories.find(c => c.id === categoryId)?.name || "ไม่ระบุ";
  };

  const handleAddVariable = () => {
    if (variableInput.trim() && !formData.variables.includes(variableInput.trim())) {
      setFormData({
        ...formData,
        variables: [...formData.variables, variableInput.trim()]
      });
      setVariableInput("");
    }
  };

  const handleRemoveVariable = (variable: string) => {
    setFormData({
      ...formData,
      variables: formData.variables.filter(v => v !== variable)
    });
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.categoryId || !formData.templateContent) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }
    const newTemplate: DocumentTemplate = {
      id: templates.length + 1,
      name: formData.name,
      description: formData.description,
      categoryId: Number(formData.categoryId),
      templateContent: formData.templateContent,
      variables: formData.variables,
      createdAt: new Date().toISOString().split("T")[0],
      createdBy: "EMP-0001"
    };
    setTemplates([...templates, newTemplate]);
    setIsAddModalOpen(false);
    setFormData({
      name: "",
      description: "",
      categoryId: "",
      templateContent: "",
      variables: []
    });
    alert("สร้างเทมเพลตสำเร็จ! (Mock)");
  };

  const handleUseTemplate = (template: DocumentTemplate) => {
    setSelectedTemplate(template);
    setIsUseModalOpen(true);
  };

  const handleGenerateDocument = () => {
    if (!selectedTemplate) return;
    // Mock: Generate document from template
    alert(`สร้างเอกสารจากเทมเพลต "${selectedTemplate.name}" สำเร็จ! (Mock)`);
    setIsUseModalOpen(false);
    setSelectedTemplate(null);
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
            สร้างและจัดการเทมเพลตเอกสาร • {templates.length} เทมเพลต
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-6 py-3 bg-ptt-blue hover:bg-ptt-blue/80 
                   text-app rounded-xl transition-all duration-200 font-semibold 
                   shadow-lg hover:shadow-xl hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5" />
          สร้างเทมเพลต
        </button>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template, index) => (
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
                  <FileCode className="w-6 h-6 text-ptt-cyan" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-app font-display">
                    {template.name}
                  </h3>
                  <p className="text-xs text-muted mt-1">
                    {getCategoryName(template.categoryId)}
                  </p>
                </div>
              </div>
            </div>

            {template.description && (
              <p className="text-sm text-muted mb-4">{template.description}</p>
            )}

            <div className="mb-4">
              <p className="text-xs text-muted mb-2">ตัวแปร:</p>
              <div className="flex flex-wrap gap-2">
                {template.variables.map((variable) => (
                  <span
                    key={variable}
                    className="px-2 py-1 bg-ptt-blue/20 text-ptt-cyan rounded text-xs font-mono"
                  >
                    {`{${variable}}`}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-4 border-t border-app">
              <button
                onClick={() => handleUseTemplate(template)}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 
                         bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg
                         transition-colors font-medium"
              >
                <Copy className="w-4 h-4" />
                ใช้เทมเพลต
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
        ))}
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
            templateContent: "",
            variables: []
          });
        }}
        title="สร้างเทมเพลตใหม่"
        onSubmit={handleSubmit}
        submitLabel="สร้างเทมเพลต"
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
              เนื้อหาเทมเพลต <span className="text-red-400">*</span>
            </label>
            <textarea
              rows={8}
              value={formData.templateContent}
              onChange={(e) => setFormData({ ...formData, templateContent: e.target.value })}
              className="w-full px-4 py-2.5 bg-soft border border-app rounded-xl
                       text-app placeholder:text-muted font-mono text-sm
                       focus:outline-none focus:ring-2 focus:ring-ptt-blue"
              placeholder="เช่น ใบแจ้งหนี้&#10;บริษัท: {companyName}&#10;วันที่: {date}&#10;ยอดรวม: {amount} บาท"
            />
            <p className="text-xs text-muted mt-1">
              ใช้ {`{variableName}`} สำหรับตัวแปร
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-app mb-2">
              ตัวแปร
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={variableInput}
                onChange={(e) => setVariableInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAddVariable()}
                className="flex-1 px-4 py-2.5 bg-soft border border-app rounded-xl
                         text-app placeholder:text-muted
                         focus:outline-none focus:ring-2 focus:ring-ptt-blue"
                placeholder="ชื่อตัวแปร (เช่น companyName)"
              />
              <button
                onClick={handleAddVariable}
                className="px-4 py-2.5 bg-ptt-blue/20 hover:bg-ptt-blue/30 text-ptt-cyan rounded-xl transition-colors"
              >
                เพิ่ม
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.variables.map((variable) => (
                <span
                  key={variable}
                  className="inline-flex items-center gap-2 px-3 py-1 bg-ptt-blue/20 text-ptt-cyan rounded-lg text-sm"
                >
                  {`{${variable}}`}
                  <button
                    onClick={() => handleRemoveVariable(variable)}
                    className="hover:text-red-400"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
      </ModalForm>

      {/* Use Template Modal */}
      <ModalForm
        isOpen={isUseModalOpen}
        onClose={() => {
          setIsUseModalOpen(false);
          setSelectedTemplate(null);
        }}
        title={`ใช้เทมเพลต: ${selectedTemplate?.name || ""}`}
        onSubmit={handleGenerateDocument}
        submitLabel="สร้างเอกสาร"
        size="lg"
      >
        {selectedTemplate && (
          <div className="space-y-4">
            <div className="p-4 bg-soft rounded-lg">
              <p className="text-sm text-muted mb-2">ตัวอย่างเนื้อหา:</p>
              <pre className="text-sm text-app whitespace-pre-wrap font-mono">
                {selectedTemplate.templateContent}
              </pre>
            </div>

            <div>
              <label className="block text-sm font-medium text-app mb-2">
                กรอกค่าตัวแปร
              </label>
              <div className="space-y-3">
                {selectedTemplate.variables.map((variable) => (
                  <div key={variable}>
                    <label className="block text-xs text-muted mb-1">
                      {variable}
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2.5 bg-soft border border-app rounded-xl
                               text-app placeholder:text-muted
                               focus:outline-none focus:ring-2 focus:ring-ptt-blue"
                      placeholder={`กรอกค่า {${variable}}`}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </ModalForm>
    </div>
  );
}

