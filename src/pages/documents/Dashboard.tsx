import { motion } from "framer-motion";
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Folder,
  TrendingUp,
  DollarSign,
  Bell,
  Calendar,
  Download
} from "lucide-react";
import { 
  documents, 
  documentCategories,
  documentNotifications,
  documentApprovals
} from "@/data/mockData";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    maximumFractionDigits: 0,
  }).format(amount);
};

// คำนวณวันหมดอายุ
const getDaysUntilExpiry = (expiryDate?: string): number | null => {
  if (!expiryDate) return null;
  const today = new Date();
  const expiry = new Date(expiryDate);
  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

export default function DocumentsDashboard() {
  const totalDocuments = documents.length;
  const activeDocuments = documents.filter(d => d.status === "Active").length;
  const expiringDocuments = documents.filter(d => {
    const days = getDaysUntilExpiry(d.expiryDate);
    return days !== null && days <= 30 && days > 0;
  }).length;
  const pendingApprovals = documentApprovals.filter(a => a.status === "Pending").length;
  const totalRenewalCost = documents
    .filter(d => {
      const days = getDaysUntilExpiry(d.expiryDate);
      return days !== null && days <= 30 && d.renewalCost;
    })
    .reduce((sum, d) => sum + (d.renewalCost || 0), 0);

  // เอกสารใกล้หมดอายุ (30 วัน)
  const expiringSoon = documents
    .filter(d => {
      const days = getDaysUntilExpiry(d.expiryDate);
      return days !== null && days <= 30 && days > 0;
    })
    .sort((a, b) => {
      const daysA = getDaysUntilExpiry(a.expiryDate) || 999;
      const daysB = getDaysUntilExpiry(b.expiryDate) || 999;
      return daysA - daysB;
    });

  // การแจ้งเตือนล่าสุด
  const recentNotifications = documentNotifications
    .sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime())
    .slice(0, 5);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-ptt-cyan font-display">ภาพรวมระบบงานเอกสาร</h2>
        <p className="text-muted font-light">สรุปข้อมูลเอกสารและการแจ้งเตือนทั้งหมด</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Documents */}
        <div className="bg-gradient-to-br from-ptt-blue/10 to-ptt-cyan/10 border border-ptt-blue/20 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-3">
            <FileText className="w-8 h-8 text-ptt-cyan" strokeWidth={1.5} />
            <span className="text-xs text-muted">เอกสารทั้งหมด</span>
          </div>
          <div className="text-3xl font-bold text-app mb-1">
            {totalDocuments}
          </div>
          <p className="text-sm text-muted">
            Active: {activeDocuments} รายการ
          </p>
        </div>

        {/* Expiring Documents */}
        <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-400/10 border border-yellow-500/20 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-3">
            <Clock className="w-8 h-8 text-yellow-400" strokeWidth={1.5} />
            <span className="text-xs text-muted">ใกล้หมดอายุ</span>
          </div>
          <div className="text-3xl font-bold text-app mb-1">
            {expiringDocuments}
          </div>
          <p className="text-sm text-muted">
            ภายใน 30 วัน
          </p>
        </div>

        {/* Pending Approvals */}
        <div className="bg-gradient-to-br from-blue-500/10 to-blue-400/10 border border-blue-500/20 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-3">
            <CheckCircle className="w-8 h-8 text-blue-400" strokeWidth={1.5} />
            <span className="text-xs text-muted">รออนุมัติ</span>
          </div>
          <div className="text-3xl font-bold text-app mb-1">
            {pendingApprovals}
          </div>
          <p className="text-sm text-muted">
            รายการ
          </p>
        </div>

        {/* Renewal Cost */}
        <div className="bg-gradient-to-br from-green-500/10 to-green-400/10 border border-green-500/20 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-3">
            <DollarSign className="w-8 h-8 text-green-400" strokeWidth={1.5} />
            <span className="text-xs text-muted">ค่าต่ออายุ</span>
          </div>
          <div className="text-3xl font-bold text-app mb-1">
            {formatCurrency(totalRenewalCost)}
          </div>
          <p className="text-sm text-muted">
            ภายใน 30 วัน
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="panel/40 border border-app rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-app mb-4 font-display">การดำเนินการด่วน</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button className="flex items-center gap-3 p-4 bg-ptt-blue/10 hover:bg-ptt-blue/20 border border-ptt-blue/30 rounded-xl transition-colors">
            <FileText className="w-5 h-5 text-ptt-cyan" />
            <span className="text-app">อัปโหลดเอกสาร</span>
          </button>
          <button className="flex items-center gap-3 p-4 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 rounded-xl transition-colors">
            <Folder className="w-5 h-5 text-green-400" />
            <span className="text-app">สร้างหมวดหมู่</span>
          </button>
          <button className="flex items-center gap-3 p-4 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 rounded-xl transition-colors">
            <Clock className="w-5 h-5 text-yellow-400" />
            <span className="text-app">ตรวจสอบหมดอายุ</span>
          </button>
          <button className="flex items-center gap-3 p-4 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 rounded-xl transition-colors">
            <CheckCircle className="w-5 h-5 text-purple-400" />
            <span className="text-app">อนุมัติเอกสาร</span>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expiring Documents */}
        <div className="panel/40 border border-app rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-app mb-4 font-display flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
            เอกสารใกล้หมดอายุ
          </h3>
          <div className="space-y-3">
            {expiringSoon.map((doc) => {
              const days = getDaysUntilExpiry(doc.expiryDate);
              const category = documentCategories.find(c => c.id === doc.categoryId);
              return (
                <div key={doc.id} className="flex items-center justify-between p-3 bg-ink-800 rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-app">{doc.title}</p>
                    <p className="text-xs text-muted">
                      {category?.name} • หมดอายุ: {doc.expiryDate}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-semibold ${
                      days && days <= 7 ? "text-red-400" :
                      days && days <= 15 ? "text-orange-400" : "text-yellow-400"
                    }`}>
                      {days !== null ? `${days} วัน` : "-"}
                    </p>
                    {doc.renewalCost && (
                      <p className="text-xs text-muted">{formatCurrency(doc.renewalCost)}</p>
                    )}
                  </div>
                </div>
              );
            })}
            {expiringSoon.length === 0 && (
              <p className="text-center py-4 text-muted text-sm">ไม่มีเอกสารใกล้หมดอายุ</p>
            )}
          </div>
        </div>

        {/* Recent Notifications */}
        <div className="panel/40 border border-app rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-app mb-4 font-display flex items-center gap-2">
            <Bell className="w-5 h-5 text-ptt-cyan" />
            การแจ้งเตือนล่าสุด
          </h3>
          <div className="space-y-3">
            {recentNotifications.map((notif) => {
              const doc = documents.find(d => d.id === notif.documentId);
              return (
                <div key={notif.id} className="flex items-start gap-3 p-3 bg-ink-800 rounded-lg">
                  <div className={`p-1.5 rounded-lg ${
                    notif.type === "Expiring" ? "bg-yellow-500/20" :
                    notif.type === "Expired" ? "bg-red-500/20" :
                    notif.type === "Approval" ? "bg-blue-500/20" : "bg-green-500/20"
                  }`}>
                    {notif.type === "Expiring" && <Clock className="w-4 h-4 text-yellow-400" />}
                    {notif.type === "Expired" && <AlertTriangle className="w-4 h-4 text-red-400" />}
                    {notif.type === "Approval" && <CheckCircle className="w-4 h-4 text-blue-400" />}
                    {notif.type === "Update" && <TrendingUp className="w-4 h-4 text-green-400" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-app">{notif.message}</p>
                    <p className="text-xs text-muted">
                      {doc?.title} • {new Date(notif.sentAt).toLocaleDateString("th-TH")}
                    </p>
                  </div>
                </div>
              );
            })}
            {recentNotifications.length === 0 && (
              <p className="text-center py-4 text-muted text-sm">ยังไม่มีการแจ้งเตือน</p>
            )}
          </div>
        </div>
      </div>

      {/* Statistics by Category */}
      <div className="panel/40 border border-app rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-app mb-4 font-display">เอกสารแยกตามหมวดหมู่</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {documentCategories.map((category) => {
            const count = documents.filter(d => d.categoryId === category.id).length;
            return (
              <div key={category.id} className="p-4 bg-ink-800 rounded-xl border border-app">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-app">{category.name}</p>
                  <Folder className={`w-4 h-4 text-${category.color}-400`} />
                </div>
                <p className="text-2xl font-bold text-app">{count}</p>
                <p className="text-xs text-muted">เอกสาร</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Calendar Integration */}
      <div className="panel/40 border border-app rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Calendar className="w-5 h-5 text-ptt-cyan" />
          <h3 className="text-lg font-semibold text-app font-display">ปฏิทินเอกสารใกล้หมดอายุ</h3>
        </div>
        <div className="bg-ink-800 rounded-xl p-4">
          <div className="grid grid-cols-7 gap-2 mb-2">
            {["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"].map((day) => (
              <div key={day} className="text-center text-sm font-medium text-muted py-2">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 35 }, (_, i) => {
              const date = new Date();
              date.setDate(date.getDate() + (i - date.getDay()));
              const dateStr = date.toISOString().split("T")[0];
              const expiringDocs = documents.filter(d => {
                if (!d.expiryDate) return false;
                const expiryDate = new Date(d.expiryDate).toISOString().split("T")[0];
                return expiryDate === dateStr;
              });
              const isToday = dateStr === new Date().toISOString().split("T")[0];
              const daysUntilExpiry = expiringDocs.length > 0 
                ? getDaysUntilExpiry(expiringDocs[0].expiryDate)
                : null;
              return (
                <div
                  key={i}
                  className={`aspect-square p-1 rounded-lg border cursor-pointer hover:scale-105 transition-all ${
                    isToday
                      ? "bg-ptt-blue/20 border-ptt-cyan"
                      : expiringDocs.length > 0
                      ? daysUntilExpiry !== null && daysUntilExpiry <= 7
                        ? "bg-red-500/10 border-red-500/30"
                        : daysUntilExpiry !== null && daysUntilExpiry <= 15
                        ? "bg-orange-500/10 border-orange-500/30"
                        : "bg-yellow-500/10 border-yellow-500/30"
                      : "bg-ink-800 border-app"
                  }`}
                  title={expiringDocs.length > 0 
                    ? expiringDocs.map(d => d.title).join(", ")
                    : ""}
                >
                  <div className="text-xs text-app font-medium mb-1">
                    {date.getDate()}
                  </div>
                  {expiringDocs.length > 0 && (
                    <div className={`text-[10px] font-semibold ${
                      daysUntilExpiry !== null && daysUntilExpiry <= 7
                        ? "text-red-400"
                        : daysUntilExpiry !== null && daysUntilExpiry <= 15
                        ? "text-orange-400"
                        : "text-yellow-400"
                    }`}>
                      {expiringDocs.length} ไฟล์
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex items-center gap-4 text-xs text-muted flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-ptt-blue/20 border border-ptt-cyan rounded" />
              <span>วันนี้</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500/10 border border-red-500/30 rounded" />
              <span>≤ 7 วัน</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500/10 border border-orange-500/30 rounded" />
              <span>8-15 วัน</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500/10 border border-yellow-500/30 rounded" />
              <span>16-30 วัน</span>
            </div>
          </div>
          
          {/* รายการเอกสารใกล้หมดอายุ */}
          <div className="mt-6 space-y-2">
            <h4 className="text-sm font-semibold text-app mb-3">รายการเอกสารใกล้หมดอายุ (30 วัน)</h4>
            {expiringSoon.map((doc) => {
              const days = getDaysUntilExpiry(doc.expiryDate);
              const category = documentCategories.find(c => c.id === doc.categoryId);
              return (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-3 bg-ink-800 rounded-lg hover:bg-ink-700 transition-colors"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-app">{doc.title}</p>
                    <p className="text-xs text-muted">
                      {category?.name} • หมดอายุ: {doc.expiryDate}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-semibold ${
                      days && days <= 7 ? "text-red-400" :
                      days && days <= 15 ? "text-orange-400" : "text-yellow-400"
                    }`}>
                      {days !== null ? `${days} วัน` : "-"}
                    </p>
                    {doc.renewalCost && (
                      <p className="text-xs text-muted">{formatCurrency(doc.renewalCost)}</p>
                    )}
                  </div>
                </div>
              );
            })}
            {expiringSoon.length === 0 && (
              <p className="text-center py-4 text-muted text-sm">ไม่มีเอกสารใกล้หมดอายุ</p>
            )}
          </div>

          <button className="mt-4 w-full px-4 py-2 bg-ptt-blue/20 hover:bg-ptt-blue/30 text-ptt-cyan rounded-lg transition-colors text-sm font-medium">
            <Download className="w-4 h-4 inline mr-2" />
            Export เป็น iCal/Google Calendar
          </button>
        </div>
      </div>
    </motion.div>
  );
}

