import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Clock, 
  AlertTriangle,
  DollarSign,
  FileText
} from "lucide-react";
import FilterBar from "@/components/FilterBar";
import ModalForm from "@/components/ModalForm";
import { 
  documents, 
  documentCategories,
  employees,
  type Document as DocumentType
} from "@/data/mockData";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    maximumFractionDigits: 0,
  }).format(amount);
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

export default function Expiring() {
  const [filteredDocuments, setFilteredDocuments] = useState<DocumentType[]>([]);
  const [daysFilter, setDaysFilter] = useState("");
  const [selectedDocument, setSelectedDocument] = useState<DocumentType | null>(null);

  // Filter documents by expiry
  useEffect(() => {
    let filtered = documents.filter(d => {
      const days = getDaysUntilExpiry(d.expiryDate);
      if (days === null) return false;
      
      if (daysFilter === "expired") {
        return days <= 0;
      } else if (daysFilter === "7") {
        return days > 0 && days <= 7;
      } else if (daysFilter === "15") {
        return days > 7 && days <= 15;
      } else if (daysFilter === "30") {
        return days > 15 && days <= 30;
      } else {
        return days <= 30;
      }
    });

    // Sort by days until expiry (ascending)
    filtered.sort((a, b) => {
      const daysA = getDaysUntilExpiry(a.expiryDate) || 999;
      const daysB = getDaysUntilExpiry(b.expiryDate) || 999;
      return daysA - daysB;
    });

    setFilteredDocuments(filtered);
  }, [daysFilter]);

  const getCategoryName = (categoryId: number) => {
    return documentCategories.find(c => c.id === categoryId)?.name || "ไม่ระบุ";
  };

  const getCreatorName = (empCode: string) => {
    return employees.find(e => e.code === empCode)?.name || empCode;
  };

  // Calculate statistics
  const expiredCount = documents.filter(d => {
    const days = getDaysUntilExpiry(d.expiryDate);
    return days !== null && days <= 0;
  }).length;

  const expiring7Days = documents.filter(d => {
    const days = getDaysUntilExpiry(d.expiryDate);
    return days !== null && days > 0 && days <= 7;
  }).length;

  const expiring15Days = documents.filter(d => {
    const days = getDaysUntilExpiry(d.expiryDate);
    return days !== null && days > 7 && days <= 15;
  }).length;

  const expiring30Days = documents.filter(d => {
    const days = getDaysUntilExpiry(d.expiryDate);
    return days !== null && days > 15 && days <= 30;
  }).length;

  const totalRenewalCost = filteredDocuments
    .filter(d => d.renewalCost)
    .reduce((sum, d) => sum + (d.renewalCost || 0), 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-app mb-2 font-display">
          เอกสารใกล้หมดอายุ
        </h1>
        <p className="text-muted font-light">
          ติดตามเอกสารที่ใกล้หมดอายุและต้องต่ออายุ • แสดง {filteredDocuments.length} รายการ
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="w-6 h-6 text-red-400" />
            <p className="text-muted text-sm font-light">หมดอายุแล้ว</p>
          </div>
          <p className="text-3xl font-bold text-app font-display">{expiredCount}</p>
          <p className="text-xs text-muted mt-1">รายการ</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-orange-500/10 border border-orange-500/30 rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-6 h-6 text-orange-400" />
            <p className="text-muted text-sm font-light">หมดอายุใน 7 วัน</p>
          </div>
          <p className="text-3xl font-bold text-app font-display">{expiring7Days}</p>
          <p className="text-xs text-muted mt-1">รายการ</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-6 h-6 text-yellow-400" />
            <p className="text-muted text-sm font-light">หมดอายุใน 15 วัน</p>
          </div>
          <p className="text-3xl font-bold text-app font-display">{expiring15Days}</p>
          <p className="text-xs text-muted mt-1">รายการ</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-6 h-6 text-blue-400" />
            <p className="text-muted text-sm font-light">หมดอายุใน 30 วัน</p>
          </div>
          <p className="text-3xl font-bold text-app font-display">{expiring30Days}</p>
          <p className="text-xs text-muted mt-1">รายการ</p>
        </motion.div>
      </div>

      {/* Total Renewal Cost */}
      {totalRenewalCost > 0 && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted text-sm mb-1">ค่าต่ออายุรวม (จากรายการที่แสดง)</p>
              <p className="text-3xl font-bold text-green-400 font-display">
                {formatCurrency(totalRenewalCost)}
              </p>
            </div>
            <DollarSign className="w-12 h-12 text-green-400 opacity-50" />
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <FilterBar
        placeholder="ค้นหาเอกสาร..."
        onSearch={() => {}}
        filters={[
          {
            label: "ช่วงเวลา",
            value: daysFilter,
            options: [
              { label: "ทั้งหมด (≤ 30 วัน)", value: "" },
              { label: "หมดอายุแล้ว", value: "expired" },
              { label: "≤ 7 วัน", value: "7" },
              { label: "8-15 วัน", value: "15" },
              { label: "16-30 วัน", value: "30" },
            ],
            onChange: (value) => {
              setDaysFilter(value);
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
                <th className="px-6 py-4 text-center text-sm font-semibold text-app">วันหมดอายุ</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-app">เหลือเวลา</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-app">ค่าต่ออายุ</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-app">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredDocuments.map((doc, index) => {
                const days = getDaysUntilExpiry(doc.expiryDate);
                return (
                  <motion.tr
                    key={doc.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`hover:bg-soft transition-colors ${
                      days !== null && days <= 0 ? "bg-red-500/5" :
                      days !== null && days <= 7 ? "bg-orange-500/5" :
                      days !== null && days <= 15 ? "bg-yellow-500/5" : ""
                    }`}
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
                    <td className="px-6 py-4 text-center text-sm text-app">
                      {doc.expiryDate ? formatDate(doc.expiryDate) : "-"}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {days !== null ? (
                        <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium ${
                          days <= 0 ? "bg-red-500/20 text-red-400 border border-red-500/30" :
                          days <= 7 ? "bg-orange-500/20 text-orange-400 border border-orange-500/30" :
                          days <= 15 ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30" :
                          "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                        }`}>
                          <Clock className="w-3 h-3 mr-1" />
                          {days <= 0 ? "หมดอายุแล้ว" : `เหลือ ${days} วัน`}
                        </span>
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right text-sm">
                      {doc.renewalCost ? (
                        <p className="text-ptt-cyan font-mono font-semibold">
                          {formatCurrency(doc.renewalCost)}
                        </p>
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => setSelectedDocument(doc)}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm 
                                 bg-ptt-blue/20 hover:bg-ptt-blue/30 text-ptt-cyan rounded-lg
                                 transition-colors font-medium"
                      >
                        <FileText className="w-4 h-4" />
                        ดูรายละเอียด
                      </button>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>

          {filteredDocuments.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted font-light">ไม่พบเอกสารใกล้หมดอายุ</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Document Detail Modal */}
      <ModalForm
        isOpen={selectedDocument !== null}
        onClose={() => setSelectedDocument(null)}
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
                <p className="text-muted mb-1">วันหมดอายุ:</p>
                <p className="text-app">
                  {selectedDocument.expiryDate ? formatDate(selectedDocument.expiryDate) : "-"}
                </p>
              </div>
              <div>
                <p className="text-muted mb-1">เหลือเวลา:</p>
                {(() => {
                  const days = getDaysUntilExpiry(selectedDocument.expiryDate);
                  return days !== null ? (
                    <p className={`font-semibold ${
                      days <= 0 ? "text-red-400" :
                      days <= 7 ? "text-orange-400" :
                      days <= 15 ? "text-yellow-400" : "text-blue-400"
                    }`}>
                      {days <= 0 ? "หมดอายุแล้ว" : `เหลือ ${days} วัน`}
                    </p>
                  ) : (
                    <p className="text-muted">-</p>
                  );
                })()}
              </div>
              {selectedDocument.renewalCost && (
                <div>
                  <p className="text-muted mb-1">ค่าต่ออายุ:</p>
                  <p className="text-ptt-cyan font-semibold">
                    {formatCurrency(selectedDocument.renewalCost)}
                  </p>
                </div>
              )}
              <div>
                <p className="text-muted mb-1">ผู้สร้าง:</p>
                <p className="text-app">{getCreatorName(selectedDocument.createdBy)}</p>
              </div>
            </div>

            {selectedDocument.description && (
              <div>
                <p className="text-muted mb-1">คำอธิบาย:</p>
                <p className="text-app">{selectedDocument.description}</p>
              </div>
            )}

            <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <p className="text-sm text-yellow-400 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                เอกสารนี้ใกล้หมดอายุ กรุณาตรวจสอบและดำเนินการต่ออายุ
              </p>
            </div>
          </div>
        )}
      </ModalForm>
    </div>
  );
}

