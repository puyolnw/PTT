import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  CheckCircle, 
  XCircle,
  Clock,
  FileText,
  PenTool,
  Upload,
  X
} from "lucide-react";
import { useRef } from "react";
import FilterBar from "@/components/FilterBar";
import ModalForm from "@/components/ModalForm";
import StatusTag, { getStatusVariant } from "@/components/StatusTag";
import { 
  documentApprovals,
  documents,
  documentCategories,
  type DocumentApproval
} from "@/data/mockData";

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
};

export default function Approvals() {
  const [filteredApprovals, setFilteredApprovals] = useState<DocumentApproval[]>(documentApprovals);
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedApproval, setSelectedApproval] = useState<DocumentApproval | null>(null);
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [signatureMode, setSignatureMode] = useState<"draw" | "upload">("draw");
  const [signatureData, setSignatureData] = useState<string>("");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Handle filtering
  const handleFilter = () => {
    let filtered = documentApprovals;

    if (statusFilter) {
      filtered = filtered.filter((a) => a.status === statusFilter);
    }

    setFilteredApprovals(filtered);
  };

  useEffect(() => {
    handleFilter();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const getDocument = (documentId: number) => {
    return documents.find(d => d.id === documentId);
  };

  const getCategoryName = (categoryId: number) => {
    return documentCategories.find(c => c.id === categoryId)?.name || "ไม่ระบุ";
  };

  // Group approvals by document
  const approvalsByDocument = filteredApprovals.reduce((acc, approval) => {
    if (!acc[approval.documentId]) {
      acc[approval.documentId] = [];
    }
    acc[approval.documentId].push(approval);
    return acc;
  }, {} as Record<number, DocumentApproval[]>);

  const pendingCount = filteredApprovals.filter(a => a.status === "Pending").length;
  const approvedCount = filteredApprovals.filter(a => a.status === "Approved").length;
  const rejectedCount = filteredApprovals.filter(a => a.status === "Rejected").length;

  const handleApprove = (approval: DocumentApproval, signature?: string) => {
    if (signature) {
      alert(`อนุมัติเอกสารพร้อมลายเซ็น (ขั้นตอนที่ ${approval.step}) สำเร็จ! (Mock)`);
    } else {
      alert(`อนุมัติเอกสาร (ขั้นตอนที่ ${approval.step}) สำเร็จ! (Mock)`);
    }
  };

  const handleReject = (approval: DocumentApproval) => {
    const reason = prompt("กรุณาระบุเหตุผลที่ไม่อนุมัติ:");
    if (reason) {
      alert(`ไม่อนุมัติเอกสาร (ขั้นตอนที่ ${approval.step})\nเหตุผล: ${reason} (Mock)`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-app mb-2 font-display">
          การอนุมัติเอกสาร
        </h1>
        <p className="text-muted font-light">
          จัดการการอนุมัติเอกสารตาม Workflow • แสดง {filteredApprovals.length} รายการ
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-6 h-6 text-yellow-400" />
            <p className="text-muted text-sm font-light">รออนุมัติ</p>
          </div>
          <p className="text-3xl font-bold text-app font-display">{pendingCount}</p>
          <p className="text-xs text-muted mt-1">รายการ</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-green-500/10 border border-green-500/30 rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="w-6 h-6 text-green-400" />
            <p className="text-muted text-sm font-light">อนุมัติแล้ว</p>
          </div>
          <p className="text-3xl font-bold text-app font-display">{approvedCount}</p>
          <p className="text-xs text-muted mt-1">รายการ</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <XCircle className="w-6 h-6 text-red-400" />
            <p className="text-muted text-sm font-light">ไม่อนุมัติ</p>
          </div>
          <p className="text-3xl font-bold text-app font-display">{rejectedCount}</p>
          <p className="text-xs text-muted mt-1">รายการ</p>
        </motion.div>
      </div>

      {/* Filter Bar */}
      <FilterBar
        placeholder="ค้นหาเอกสาร..."
        onSearch={() => {}}
        filters={[
          {
            label: "ทุกสถานะ",
            value: statusFilter,
            options: [
              { label: "ทุกสถานะ", value: "" },
              { label: "Pending", value: "Pending" },
              { label: "Approved", value: "Approved" },
              { label: "Rejected", value: "Rejected" },
              { label: "Cancelled", value: "Cancelled" },
            ],
            onChange: (value) => {
              setStatusFilter(value);
              handleFilter();
            },
          },
        ]}
      />

      {/* Approvals List */}
      <div className="space-y-4">
        {Object.entries(approvalsByDocument).map(([docId, approvals]) => {
          const doc = getDocument(Number(docId));
          if (!doc) return null;

          const sortedApprovals = approvals.sort((a, b) => a.step - b.step);
          const currentStep = sortedApprovals.find(a => a.status === "Pending");

          return (
            <motion.div
              key={docId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-soft border border-app rounded-2xl p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-ptt-blue/20 rounded-lg">
                      <FileText className="w-5 h-5 text-ptt-cyan" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-app font-display">
                        {doc.title}
                      </h3>
                      <p className="text-sm text-muted">
                        {doc.documentNumber} • {getCategoryName(doc.categoryId)}
                      </p>
                    </div>
                  </div>
                </div>
                <StatusTag variant={getStatusVariant(
                  currentStep ? "รออนุมัติ" :
                  sortedApprovals.some(a => a.status === "Rejected") ? "ไม่อนุมัติ" : "อนุมัติแล้ว"
                )}>
                  {currentStep ? "รออนุมัติ" :
                   sortedApprovals.some(a => a.status === "Rejected") ? "ไม่อนุมัติ" : "อนุมัติแล้ว"}
                </StatusTag>
              </div>

              {/* Approval Steps */}
              <div className="space-y-3">
                {sortedApprovals.map((approval) => (
                  <div
                    key={approval.id}
                    className={`flex items-center justify-between p-4 rounded-xl border ${
                      approval.status === "Approved" ? "bg-green-500/10 border-green-500/30" :
                      approval.status === "Rejected" ? "bg-red-500/10 border-red-500/30" :
                      approval.status === "Pending" ? "bg-yellow-500/10 border-yellow-500/30" :
                      "bg-soft border-app"
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        approval.status === "Approved" ? "bg-green-500/20" :
                        approval.status === "Rejected" ? "bg-red-500/20" :
                        approval.status === "Pending" ? "bg-yellow-500/20" :
                        "bg-soft"
                      }`}>
                        {approval.status === "Approved" && <CheckCircle className="w-5 h-5 text-green-400" />}
                        {approval.status === "Rejected" && <XCircle className="w-5 h-5 text-red-400" />}
                        {approval.status === "Pending" && <Clock className="w-5 h-5 text-yellow-400" />}
                        {approval.status === "Cancelled" && <XCircle className="w-5 h-5 text-muted" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-medium text-app">
                            ขั้นตอนที่ {approval.step}: {approval.approverName}
                          </p>
                          <StatusTag variant={getStatusVariant(
                            approval.status === "Approved" ? "อนุมัติแล้ว" :
                            approval.status === "Rejected" ? "ไม่อนุมัติ" :
                            approval.status === "Pending" ? "รออนุมัติ" : "ยกเลิก"
                          )}>
                            {approval.status === "Pending" && "รออนุมัติ"}
                            {approval.status === "Approved" && "อนุมัติแล้ว"}
                            {approval.status === "Rejected" && "ไม่อนุมัติ"}
                            {approval.status === "Cancelled" && "ยกเลิก"}
                          </StatusTag>
                        </div>
                        <p className="text-xs text-muted">
                          สร้างเมื่อ: {formatDate(approval.createdAt)}
                          {approval.signedAt && ` • ลงลายเซ็น: ${formatDate(approval.signedAt)}`}
                        </p>
                        {approval.comment && (
                          <p className="text-sm text-app mt-1">{approval.comment}</p>
                        )}
                      </div>
                    </div>
                    {approval.status === "Pending" && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(approval)}
                          className="inline-flex items-center gap-2 px-4 py-2 text-sm 
                                   bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg
                                   transition-colors font-medium"
                        >
                          <CheckCircle className="w-4 h-4" />
                          อนุมัติ
                        </button>
                        <button
                          onClick={() => handleReject(approval)}
                          className="inline-flex items-center gap-2 px-4 py-2 text-sm 
                                   bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg
                                   transition-colors font-medium"
                        >
                          <XCircle className="w-4 h-4" />
                          ไม่อนุมัติ
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          );
        })}

        {Object.keys(approvalsByDocument).length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted font-light">ไม่พบข้อมูลการอนุมัติ</p>
          </div>
        )}
      </div>

      {/* Approval Detail Modal */}
      <ModalForm
        isOpen={selectedApproval !== null}
        onClose={() => setSelectedApproval(null)}
        title="รายละเอียดการอนุมัติ"
      >
        {selectedApproval && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted mb-1">ขั้นตอนที่:</p>
                <p className="text-app font-medium">{selectedApproval.step}</p>
              </div>
              <div>
                <p className="text-muted mb-1">ผู้อนุมัติ:</p>
                <p className="text-app font-medium">{selectedApproval.approverName}</p>
              </div>
              <div>
                <p className="text-muted mb-1">สถานะ:</p>
                <StatusTag variant={getStatusVariant(
                  selectedApproval.status === "Approved" ? "อนุมัติแล้ว" :
                  selectedApproval.status === "Rejected" ? "ไม่อนุมัติ" :
                  selectedApproval.status === "Pending" ? "รออนุมัติ" : "ยกเลิก"
                )}>
                  {selectedApproval.status}
                </StatusTag>
              </div>
              {selectedApproval.signedAt && (
                <div>
                  <p className="text-muted mb-1">วันที่ลงลายเซ็น:</p>
                  <p className="text-app">{formatDate(selectedApproval.signedAt)}</p>
                </div>
              )}
            </div>
            {selectedApproval.comment && (
              <div>
                <p className="text-muted mb-1">ความคิดเห็น:</p>
                <p className="text-app">{selectedApproval.comment}</p>
              </div>
            )}
            {selectedApproval.eSignature && (
              <div>
                <p className="text-muted mb-1">ลายเซ็นอิเล็กทรอนิกส์:</p>
                <div className="p-3 bg-soft rounded-lg">
                  <p className="text-sm text-app font-mono">{selectedApproval.eSignature}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </ModalForm>

      {/* E-Signature Modal */}
      <ModalForm
        isOpen={isSignatureModalOpen}
        onClose={() => {
          setIsSignatureModalOpen(false);
          setSignatureData("");
          setSignatureMode("draw");
        }}
        title="ลงลายเซ็นอิเล็กทรอนิกส์"
        onSubmit={() => {
          if (signatureData) {
            alert("ลงลายเซ็นสำเร็จ! (Mock)");
            if (selectedApproval) {
              handleApprove(selectedApproval, signatureData);
            }
            setIsSignatureModalOpen(false);
            setSignatureData("");
            setSelectedApproval(null);
          } else {
            alert("กรุณาลงลายเซ็น");
          }
        }}
        submitLabel="บันทึกลายเซ็น"
        size="lg"
      >
        <div className="space-y-4">
          {/* Signature Mode Tabs */}
          <div className="flex gap-2 border-b border-app">
            <button
              onClick={() => setSignatureMode("draw")}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                signatureMode === "draw"
                  ? "text-ptt-cyan border-b-2 border-ptt-cyan"
                  : "text-muted hover:text-app"
              }`}
            >
              <PenTool className="w-4 h-4 inline mr-2" />
              วาดลายเซ็น
            </button>
            <button
              onClick={() => setSignatureMode("upload")}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                signatureMode === "upload"
                  ? "text-ptt-cyan border-b-2 border-ptt-cyan"
                  : "text-muted hover:text-app"
              }`}
            >
              <Upload className="w-4 h-4 inline mr-2" />
              อัปโหลดรูปภาพ
            </button>
          </div>

          {/* Draw Signature */}
          {signatureMode === "draw" && (
            <div>
              <label className="block text-sm font-medium text-app mb-2">
                วาดลายเซ็นของคุณ
              </label>
              <div className="border-2 border-dashed border-app rounded-xl p-4 bg-soft">
                <canvas
                  ref={canvasRef}
                  width={600}
                  height={200}
                  className="w-full border border-app rounded-lg bg-white cursor-crosshair"
                  onMouseDown={(e) => {
                    setIsDrawing(true);
                    const canvas = canvasRef.current;
                    if (!canvas) return;
                    const rect = canvas.getBoundingClientRect();
                    const ctx = canvas.getContext("2d");
                    if (ctx) {
                      ctx.beginPath();
                      ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
                    }
                  }}
                  onMouseMove={(e) => {
                    if (!isDrawing) return;
                    const canvas = canvasRef.current;
                    if (!canvas) return;
                    const rect = canvas.getBoundingClientRect();
                    const ctx = canvas.getContext("2d");
                    if (ctx) {
                      ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
                      ctx.strokeStyle = "#000";
                      ctx.lineWidth = 2;
                      ctx.stroke();
                    }
                  }}
                  onMouseUp={() => {
                    setIsDrawing(false);
                    const canvas = canvasRef.current;
                    if (canvas) {
                      setSignatureData(canvas.toDataURL());
                    }
                  }}
                  onMouseLeave={() => setIsDrawing(false)}
                />
              </div>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => {
                    const canvas = canvasRef.current;
                    if (canvas) {
                      const ctx = canvas.getContext("2d");
                      if (ctx) {
                        ctx.clearRect(0, 0, canvas.width, canvas.height);
                        setSignatureData("");
                      }
                    }
                  }}
                  className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors text-sm"
                >
                  <X className="w-4 h-4 inline mr-2" />
                  ล้าง
                </button>
              </div>
            </div>
          )}

          {/* Upload Signature */}
          {signatureMode === "upload" && (
            <div>
              <label className="block text-sm font-medium text-app mb-2">
                อัปโหลดรูปภาพลายเซ็น
              </label>
              <div className="border-2 border-dashed border-app rounded-xl p-6 text-center">
                <Upload className="w-12 h-12 text-muted mx-auto mb-2" />
                <p className="text-sm text-muted mb-2">ลากไฟล์มาวางที่นี่ หรือคลิกเพื่อเลือกไฟล์</p>
                <p className="text-xs text-muted">รองรับ JPG, PNG, GIF</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        setSignatureData(event.target?.result as string);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="hidden"
                  id="signature-upload"
                />
                <label
                  htmlFor="signature-upload"
                  className="inline-block mt-4 px-4 py-2 bg-ptt-blue/20 hover:bg-ptt-blue/30 text-ptt-cyan rounded-lg cursor-pointer transition-colors"
                >
                  เลือกไฟล์
                </label>
              </div>
              {signatureData && (
                <div className="mt-4 p-4 bg-soft rounded-lg">
                  <p className="text-sm text-muted mb-2">ตัวอย่างลายเซ็น:</p>
                  <img src={signatureData} alt="Signature" className="max-w-full h-32 object-contain" />
                </div>
              )}
            </div>
          )}

          {signatureData && (
            <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
              <p className="text-sm text-green-400">✓ ลายเซ็นพร้อมบันทึก</p>
            </div>
          )}
        </div>
      </ModalForm>
    </div>
  );
}

