import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  FileText, 
  Download,
  RotateCcw,
  GitCompare,
  Clock,
  User
} from "lucide-react";
import FilterBar from "@/components/FilterBar";
import ModalForm from "@/components/ModalForm";
import { 
  documentVersions,
  documents,
  employees,
  type DocumentVersion
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

export default function DocumentVersions() {
  const [filteredVersions, setFilteredVersions] = useState<DocumentVersion[]>(documentVersions);
  const [documentFilter, setDocumentFilter] = useState("");
  const [compareVersions, setCompareVersions] = useState<{v1: DocumentVersion | null, v2: DocumentVersion | null}>({v1: null, v2: null});

  // Group versions by document
  const versionsByDocument = filteredVersions.reduce((acc, version) => {
    if (!acc[version.documentId]) {
      acc[version.documentId] = [];
    }
    acc[version.documentId].push(version);
    acc[version.documentId].sort((a, b) => b.version - a.version);
    return acc;
  }, {} as Record<number, DocumentVersion[]>);

  useEffect(() => {
    let filtered = documentVersions;
    if (documentFilter) {
      filtered = filtered.filter(v => v.documentId === Number(documentFilter));
    }
    setFilteredVersions(filtered);
  }, [documentFilter]);

  const getUserName = (userId: string) => {
    return employees.find(e => e.code === userId)?.name || userId;
  };

  const handleRestore = (version: DocumentVersion) => {
    if (confirm(`ต้องการย้อนกลับไปใช้เวอร์ชัน ${version.version} ใช่หรือไม่?`)) {
      alert(`ย้อนกลับไปใช้เวอร์ชัน ${version.version} สำเร็จ! (Mock)`);
    }
  };

  const handleCompare = (v1: DocumentVersion, v2: DocumentVersion) => {
    setCompareVersions({ v1, v2 });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-app mb-2 font-display">
          เวอร์ชันเอกสาร
        </h1>
        <p className="text-muted font-light">
          จัดการเวอร์ชันเอกสารทั้งหมด • แสดง {filteredVersions.length} เวอร์ชัน
        </p>
      </div>

      {/* Filter */}
      <FilterBar
        placeholder="ค้นหาเอกสาร..."
        onSearch={() => {}}
        filters={[
          {
            label: "ทุกเอกสาร",
            value: documentFilter,
            options: [
              { label: "ทุกเอกสาร", value: "" },
              ...documents.map((doc) => ({
                label: doc.title,
                value: doc.id.toString()
              }))
            ],
            onChange: (value) => {
              setDocumentFilter(value);
            },
          },
        ]}
      />

      {/* Versions by Document */}
      <div className="space-y-6">
        {Object.entries(versionsByDocument).map(([docId, versions]) => {
          const doc = documents.find(d => d.id === Number(docId));
          if (!doc) return null;

          return (
            <motion.div
              key={docId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-soft border border-app rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-app font-display flex items-center gap-2">
                    <FileText className="w-5 h-5 text-ptt-cyan" />
                    {doc.title}
                  </h3>
                  <p className="text-sm text-muted mt-1">
                    {doc.documentNumber} • {versions.length} เวอร์ชัน
                  </p>
                </div>
                <span className="px-3 py-1 bg-ptt-blue/20 text-ptt-cyan rounded-lg text-sm font-medium">
                  เวอร์ชันล่าสุด: v{versions[0]?.version || doc.version}
                </span>
              </div>

              <div className="space-y-3">
                {versions.map((version, index) => (
                  <div
                    key={version.id}
                    className={`flex items-center justify-between p-4 rounded-xl border ${
                      index === 0
                        ? "bg-green-500/10 border-green-500/30"
                        : "bg-ink-800 border-app"
                    }`}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        index === 0
                          ? "bg-green-500/20"
                          : "bg-ink-800"
                      }`}>
                        <span className={`text-lg font-bold ${
                          index === 0 ? "text-green-400" : "text-muted"
                        }`}>
                          v{version.version}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-medium text-app">
                            เวอร์ชัน {version.version}
                            {index === 0 && (
                              <span className="ml-2 px-2 py-0.5 bg-green-500/20 text-green-400 rounded text-xs">
                                ปัจจุบัน
                              </span>
                            )}
                          </p>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted">
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {getUserName(version.createdBy)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDate(version.createdAt)}
                          </div>
                          <div>
                            {formatFileSize(version.fileSize)}
                          </div>
                        </div>
                        {version.changeNote && (
                          <p className="text-sm text-muted mt-2 italic">
                            "{version.changeNote}"
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {index !== 0 && (
                        <>
                          <button
                            onClick={() => handleRestore(version)}
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm 
                                     bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg
                                     transition-colors font-medium"
                            title="ย้อนกลับไปใช้เวอร์ชันนี้"
                          >
                            <RotateCcw className="w-4 h-4" />
                            ย้อนกลับ
                          </button>
                          <button
                            onClick={() => {
                              if (versions[0]) {
                                handleCompare(versions[0], version);
                              }
                            }}
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm 
                                     bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg
                                     transition-colors font-medium"
                            title="เปรียบเทียบกับเวอร์ชันล่าสุด"
                          >
                            <GitCompare className="w-4 h-4" />
                            เปรียบเทียบ
                          </button>
                        </>
                      )}
                      <button
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm 
                                 bg-ptt-blue/20 hover:bg-ptt-blue/30 text-ptt-cyan rounded-lg
                                 transition-colors font-medium"
                        title="ดาวน์โหลดเวอร์ชันนี้"
                      >
                        <Download className="w-4 h-4" />
                        ดาวน์โหลด
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Compare Versions Modal */}
      <ModalForm
        isOpen={compareVersions.v1 !== null && compareVersions.v2 !== null}
        onClose={() => setCompareVersions({ v1: null, v2: null })}
        title="เปรียบเทียบเวอร์ชัน"
        size="xl"
      >
        {compareVersions.v1 && compareVersions.v2 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <h4 className="font-semibold text-app mb-2">เวอร์ชัน {compareVersions.v1.version}</h4>
                <div className="space-y-2 text-sm">
                  <p className="text-muted">สร้างโดย: {getUserName(compareVersions.v1.createdBy)}</p>
                  <p className="text-muted">วันที่: {formatDate(compareVersions.v1.createdAt)}</p>
                  <p className="text-muted">ขนาด: {formatFileSize(compareVersions.v1.fileSize)}</p>
                  {compareVersions.v1.changeNote && (
                    <p className="text-app mt-2">{compareVersions.v1.changeNote}</p>
                  )}
                </div>
              </div>
              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                <h4 className="font-semibold text-app mb-2">เวอร์ชัน {compareVersions.v2.version}</h4>
                <div className="space-y-2 text-sm">
                  <p className="text-muted">สร้างโดย: {getUserName(compareVersions.v2.createdBy)}</p>
                  <p className="text-muted">วันที่: {formatDate(compareVersions.v2.createdAt)}</p>
                  <p className="text-muted">ขนาด: {formatFileSize(compareVersions.v2.fileSize)}</p>
                  {compareVersions.v2.changeNote && (
                    <p className="text-app mt-2">{compareVersions.v2.changeNote}</p>
                  )}
                </div>
              </div>
            </div>
            <div className="p-4 bg-ink-800 rounded-lg">
              <p className="text-sm text-muted mb-2">ความแตกต่าง:</p>
              <p className="text-app">
                {compareVersions.v1.changeNote || "ไม่มีหมายเหตุ"} → {compareVersions.v2.changeNote || "ไม่มีหมายเหตุ"}
              </p>
            </div>
            <div className="flex gap-3">
              <button className="flex-1 px-4 py-2 bg-ptt-blue/20 hover:bg-ptt-blue/30 text-ptt-cyan rounded-lg transition-colors">
                <Download className="w-4 h-4 inline mr-2" />
                ดาวน์โหลดทั้งสองเวอร์ชัน
              </button>
            </div>
          </div>
        )}
      </ModalForm>
    </div>
  );
}

