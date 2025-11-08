import { motion } from "framer-motion";
import { 
  FileSpreadsheet, 
  Download,
  FileText,
  Clock,
  DollarSign,
  TrendingUp,
  Folder
} from "lucide-react";
import { 
  documents, 
  documentCategories
} from "@/data/mockData";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
};

const getDaysUntilExpiry = (expiryDate?: string): number | null => {
  if (!expiryDate) return null;
  const today = new Date();
  const expiry = new Date(expiryDate);
  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

export default function DocumentsReports() {
  const totalDocuments = documents.length;
  const totalFileSize = documents.reduce((sum, d) => sum + d.fileSize, 0);
  const expiringThisMonth = documents.filter(d => {
    const days = getDaysUntilExpiry(d.expiryDate);
    return days !== null && days > 0 && days <= 30;
  }).length;
  const totalRenewalCost = documents
    .filter(d => {
      const days = getDaysUntilExpiry(d.expiryDate);
      return days !== null && days > 0 && days <= 30 && d.renewalCost;
    })
    .reduce((sum, d) => sum + (d.renewalCost || 0), 0);

  // Documents by category
  const documentsByCategory = documentCategories.map(cat => ({
    category: cat.name,
    count: documents.filter(d => d.categoryId === cat.id).length,
    totalSize: documents
      .filter(d => d.categoryId === cat.id)
      .reduce((sum, d) => sum + d.fileSize, 0)
  }));

  // Documents by status
  const documentsByStatus = {
    Active: documents.filter(d => d.status === "Active").length,
    Archived: documents.filter(d => d.status === "Archived").length,
    Draft: documents.filter(d => d.status === "Draft").length,
    Pending: documents.filter(d => d.status === "Pending").length
  };

  // Documents by security level
  const documentsBySecurity = {
    Public: documents.filter(d => d.securityLevel === "Public").length,
    Internal: documents.filter(d => d.securityLevel === "Internal").length,
    Confidential: documents.filter(d => d.securityLevel === "Confidential").length
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-ptt-cyan font-display">รายงานระบบงานเอกสาร</h2>
          <p className="text-muted font-light">สรุปรายงานและส่งออกข้อมูลเอกสาร</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 rounded-xl transition-colors">
          <FileSpreadsheet className="w-5 h-5" />
          <span>ส่งออก Excel</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-soft border border-app rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="w-6 h-6 text-ptt-cyan" />
            <p className="text-muted text-sm">เอกสารทั้งหมด</p>
          </div>
          <p className="text-3xl font-bold text-app font-display">{totalDocuments}</p>
          <p className="text-xs text-muted mt-1">รายการ</p>
        </div>

        <div className="bg-soft border border-app rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-6 h-6 text-blue-400" />
            <p className="text-muted text-sm">ขนาดไฟล์รวม</p>
          </div>
          <p className="text-3xl font-bold text-app font-display">{formatFileSize(totalFileSize)}</p>
          <p className="text-xs text-muted mt-1">พื้นที่จัดเก็บ</p>
        </div>

        <div className="bg-soft border border-app rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-6 h-6 text-yellow-400" />
            <p className="text-muted text-sm">ใกล้หมดอายุ</p>
          </div>
          <p className="text-3xl font-bold text-app font-display">{expiringThisMonth}</p>
          <p className="text-xs text-muted mt-1">ภายใน 30 วัน</p>
        </div>

        <div className="bg-soft border border-app rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="w-6 h-6 text-green-400" />
            <p className="text-muted text-sm">ค่าต่ออายุ</p>
          </div>
          <p className="text-3xl font-bold text-app font-display">{formatCurrency(totalRenewalCost)}</p>
          <p className="text-xs text-muted mt-1">ภายใน 30 วัน</p>
        </div>
      </div>

      {/* Statistics Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Documents by Category */}
        <div className="bg-soft border border-app rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-app mb-4 font-display flex items-center gap-2">
            <Folder className="w-5 h-5 text-ptt-cyan" />
            เอกสารแยกตามหมวดหมู่
          </h3>
          <div className="space-y-3">
            {documentsByCategory.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-soft rounded-lg"
              >
                <div>
                  <p className="text-sm font-medium text-app">{item.category}</p>
                  <p className="text-xs text-muted">{formatFileSize(item.totalSize)}</p>
                </div>
                <p className="text-sm font-semibold text-ptt-cyan">{item.count} เอกสาร</p>
              </div>
            ))}
          </div>
        </div>

        {/* Documents by Status */}
        <div className="bg-soft border border-app rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-app mb-4 font-display flex items-center gap-2">
            <FileText className="w-5 h-5 text-ptt-cyan" />
            เอกสารแยกตามสถานะ
          </h3>
          <div className="space-y-3">
            {Object.entries(documentsByStatus).map(([status, count]) => (
              <div
                key={status}
                className="flex items-center justify-between p-3 bg-soft rounded-lg"
              >
                <p className="text-sm font-medium text-app">{status}</p>
                <p className="text-sm font-semibold text-ptt-cyan">{count} เอกสาร</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Documents by Security Level */}
      <div className="bg-soft border border-app rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-app mb-4 font-display flex items-center gap-2">
          <FileText className="w-5 h-5 text-ptt-cyan" />
          เอกสารแยกตามระดับความลับ
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(documentsBySecurity).map(([level, count]) => (
            <div
              key={level}
              className="p-4 bg-soft rounded-xl border border-app"
            >
              <p className="text-sm text-muted mb-1">
                {level === "Public" ? "สาธารณะ" :
                 level === "Internal" ? "ภายใน" : "ลับ"}
              </p>
              <p className="text-2xl font-bold text-app">{count}</p>
              <p className="text-xs text-muted">เอกสาร</p>
            </div>
          ))}
        </div>
      </div>

      {/* Charts Section */}
      <div className="bg-soft border border-app rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-app mb-4 font-display">กราฟวิเคราะห์</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Documents by Category Chart */}
          <div>
            <h4 className="text-sm font-medium text-app mb-3">จำนวนเอกสารตามหมวดหมู่</h4>
            <div className="space-y-2">
              {documentsByCategory.map((item) => {
                const percentage = (item.count / totalDocuments) * 100;
                return (
                  <div key={item.category} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-app">{item.category}</span>
                      <span className="text-ptt-cyan font-semibold">{item.count}</span>
                    </div>
                    <div className="w-full bg-soft rounded-full h-2">
                      <div
                        className="bg-ptt-cyan h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Documents by Status Chart */}
          <div>
            <h4 className="text-sm font-medium text-app mb-3">สถานะเอกสาร</h4>
            <div className="space-y-2">
              {Object.entries(documentsByStatus).map(([status, count]) => {
                const percentage = (count / totalDocuments) * 100;
                return (
                  <div key={status} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-app">{status}</span>
                      <span className="text-ptt-cyan font-semibold">{count}</span>
                    </div>
                    <div className="w-full bg-soft rounded-full h-2">
                      <div
                        className="bg-blue-400 h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className="bg-soft border border-app rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-app mb-4 font-display">ส่งออกรายงาน</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => alert("ส่งออก Excel: รายงานเอกสารทั้งหมด (Mock)")}
            className="flex items-center gap-3 p-4 bg-ptt-blue/20 hover:bg-ptt-blue/30 border border-ptt-blue/30 rounded-xl transition-colors"
          >
            <Download className="w-5 h-5 text-ptt-cyan" />
            <div className="text-left">
              <p className="text-sm font-semibold text-app">รายงานเอกสารทั้งหมด</p>
              <p className="text-xs text-muted">Excel / PDF / CSV</p>
            </div>
          </button>
          <button
            onClick={() => alert("ส่งออก Excel: รายงานเอกสารใกล้หมดอายุ (Mock)")}
            className="flex items-center gap-3 p-4 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/30 rounded-xl transition-colors"
          >
            <Download className="w-5 h-5 text-yellow-400" />
            <div className="text-left">
              <p className="text-sm font-semibold text-app">รายงานเอกสารใกล้หมดอายุ</p>
              <p className="text-xs text-muted">Excel / PDF / CSV</p>
            </div>
          </button>
          <button
            onClick={() => alert("ส่งออก Excel: รายงานค่าต่ออายุ (Mock)")}
            className="flex items-center gap-3 p-4 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-xl transition-colors"
          >
            <Download className="w-5 h-5 text-green-400" />
            <div className="text-left">
              <p className="text-sm font-semibold text-app">รายงานค่าต่ออายุ</p>
              <p className="text-xs text-muted">Excel / PDF / CSV</p>
            </div>
          </button>
          <button
            onClick={() => alert("ส่งออก Google Sheets: รายงานสรุปทั้งหมด (Mock)")}
            className="flex items-center gap-3 p-4 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-xl transition-colors"
          >
            <FileSpreadsheet className="w-5 h-5 text-purple-400" />
            <div className="text-left">
              <p className="text-sm font-semibold text-app">รายงานสรุปทั้งหมด</p>
              <p className="text-xs text-muted">Google Sheets</p>
            </div>
          </button>
        </div>
      </div>
    </motion.div>
  );
}

