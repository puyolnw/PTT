import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  User,
  Clock,
  Download,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  FileDown
} from "lucide-react";
import FilterBar from "@/components/FilterBar";
import ModalForm from "@/components/ModalForm";
import {
  documentAuditLogs,
  documents,
  employees,
  type DocumentAuditLog
} from "@/data/mockData";

const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
};

const getActionIcon = (action: DocumentAuditLog["action"]) => {
  switch (action) {
    case "Created":
      return <FileText className="w-4 h-4 text-green-400" />;
    case "Updated":
      return <Edit className="w-4 h-4 text-blue-400" />;
    case "Deleted":
      return <Trash2 className="w-4 h-4 text-red-400" />;
    case "Viewed":
      return <Eye className="w-4 h-4 text-ptt-cyan" />;
    case "Downloaded":
      return <Download className="w-4 h-4 text-purple-400" />;
    case "Approved":
      return <CheckCircle className="w-4 h-4 text-green-400" />;
    case "Rejected":
      return <XCircle className="w-4 h-4 text-red-400" />;
    default:
      return <FileText className="w-4 h-4 text-muted" />;
  }
};

const getActionLabel = (action: DocumentAuditLog["action"]) => {
  switch (action) {
    case "Created":
      return "สร้าง";
    case "Updated":
      return "แก้ไข";
    case "Deleted":
      return "ลบ";
    case "Viewed":
      return "ดู";
    case "Downloaded":
      return "ดาวน์โหลด";
    case "Approved":
      return "อนุมัติ";
    case "Rejected":
      return "ไม่อนุมัติ";
    default:
      return action;
  }
};

const getActionColor = (action: DocumentAuditLog["action"]) => {
  switch (action) {
    case "Created":
    case "Approved":
      return "bg-green-500/10 text-green-400 border-green-500/30";
    case "Updated":
      return "bg-blue-500/10 text-blue-400 border-blue-500/30";
    case "Deleted":
    case "Rejected":
      return "bg-red-500/10 text-red-400 border-red-500/30";
    case "Viewed":
      return "bg-ptt-blue/10 text-ptt-cyan border-ptt-blue/30";
    case "Downloaded":
      return "bg-purple-500/10 text-purple-400 border-purple-500/30";
    default:
      return "bg-muted/10 text-muted border-muted/20";
  }
};

export default function AuditTrail() {
  const [filteredLogs, setFilteredLogs] = useState<DocumentAuditLog[]>(documentAuditLogs);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [userFilter, setUserFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedLog, setSelectedLog] = useState<DocumentAuditLog | null>(null);

  // Handle filtering
  const handleFilter = () => {
    let filtered = documentAuditLogs;

    if (searchQuery) {
      filtered = filtered.filter(
        (log) =>
          log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          log.details?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          documents.find(d => d.id === log.documentId)?.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (actionFilter) {
      filtered = filtered.filter((log) => log.action === actionFilter);
    }

    if (userFilter) {
      filtered = filtered.filter((log) => log.userId === userFilter);
    }

    if (dateFrom) {
      filtered = filtered.filter((log) => new Date(log.timestamp) >= new Date(dateFrom));
    }

    if (dateTo) {
      filtered = filtered.filter((log) => new Date(log.timestamp) <= new Date(dateTo + "T23:59:59"));
    }

    // Sort by timestamp (newest first)
    filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    setFilteredLogs(filtered);
  };

  useEffect(() => {
    handleFilter();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, actionFilter, userFilter, dateFrom, dateTo]);

  const getDocumentTitle = (documentId: number) => {
    return documents.find(d => d.id === documentId)?.title || `เอกสาร #${documentId}`;
  };

  const getUserName = (userId: string) => {
    return employees.find(e => e.code === userId)?.name || userId;
  };

  const handleExport = () => {
    alert("ส่งออกรายงาน Audit Trail (Mock)");
  };

  // Statistics
  const actionCounts = documentAuditLogs.reduce((acc, log) => {
    acc[log.action] = (acc[log.action] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const uniqueUsers = new Set(documentAuditLogs.map(log => log.userId)).size;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-app mb-2 font-display">
            ประวัติการเปลี่ยนแปลง (Audit Trail)
          </h1>
          <p className="text-muted font-light">
            ติดตามประวัติการเปลี่ยนแปลงเอกสารทั้งหมด • แสดง {filteredLogs.length} รายการ
          </p>
        </div>

        <button
          onClick={handleExport}
          className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-500 
                   text-app rounded-xl transition-all duration-200 font-semibold 
                   shadow-lg hover:shadow-xl hover:-translate-y-0.5"
        >
          <FileDown className="w-5 h-5" />
          ส่งออกรายงาน
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-soft border border-app rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <FileText className="w-6 h-6 text-ptt-cyan" />
            <p className="text-muted text-sm">บันทึกทั้งหมด</p>
          </div>
          <p className="text-3xl font-bold text-app font-display">{documentAuditLogs.length}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-soft border border-app rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <User className="w-6 h-6 text-blue-400" />
            <p className="text-muted text-sm">ผู้ใช้ที่เกี่ยวข้อง</p>
          </div>
          <p className="text-3xl font-bold text-app font-display">{uniqueUsers}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-soft border border-app rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <Edit className="w-6 h-6 text-yellow-400" />
            <p className="text-muted text-sm">การแก้ไข</p>
          </div>
          <p className="text-3xl font-bold text-app font-display">{actionCounts["Updated"] || 0}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-soft border border-app rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <Eye className="w-6 h-6 text-ptt-cyan" />
            <p className="text-muted text-sm">การดู</p>
          </div>
          <p className="text-3xl font-bold text-app font-display">{actionCounts["Viewed"] || 0}</p>
        </motion.div>
      </div>

      {/* Filter Bar */}
      <FilterBar
        placeholder="ค้นหาชื่อผู้ใช้, เอกสาร, หรือรายละเอียด..."
        onSearch={(query) => {
          setSearchQuery(query);
          handleFilter();
        }}
        filters={[
          {
            label: "ทุกการกระทำ",
            value: actionFilter,
            options: [
              { label: "ทุกการกระทำ", value: "" },
              { label: "สร้าง", value: "Created" },
              { label: "แก้ไข", value: "Updated" },
              { label: "ลบ", value: "Deleted" },
              { label: "ดู", value: "Viewed" },
              { label: "ดาวน์โหลด", value: "Downloaded" },
              { label: "อนุมัติ", value: "Approved" },
              { label: "ไม่อนุมัติ", value: "Rejected" },
            ],
            onChange: (value) => {
              setActionFilter(value);
              handleFilter();
            },
          },
          {
            label: "ทุกผู้ใช้",
            value: userFilter,
            options: [
              { label: "ทุกผู้ใช้", value: "" },
              ...Array.from(new Set(documentAuditLogs.map(log => log.userId))).map(userId => ({
                label: getUserName(userId),
                value: userId
              }))
            ],
            onChange: (value) => {
              setUserFilter(value);
              handleFilter();
            },
          },
        ]}
      />

      {/* Date Range Filter */}
      <div className="bg-soft border border-app rounded-2xl p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="audit-date-from" className="block text-sm font-medium text-app mb-2">
              ตั้งแต่วันที่
            </label>
            <input
              id="audit-date-from"
              type="date"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value);
                handleFilter();
              }}
              className="w-full px-4 py-2.5 bg-soft border border-app rounded-xl
                       text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue"
            />
          </div>
          <div>
            <label htmlFor="audit-date-to" className="block text-sm font-medium text-app mb-2">
              ถึงวันที่
            </label>
            <input
              id="audit-date-to"
              type="date"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value);
                handleFilter();
              }}
              className="w-full px-4 py-2.5 bg-soft border border-app rounded-xl
                       text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue"
            />
          </div>
        </div>
      </div>

      {/* Audit Logs Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-soft border border-app rounded-2xl overflow-hidden shadow-xl"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-soft border-b border-app">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-app">เวลา</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-app">การกระทำ</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-app">เอกสาร</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-app">ผู้ทำ</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-app">รายละเอียด</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-app">IP Address</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-app">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-app">
              {filteredLogs.map((log, index) => (
                <motion.tr
                  key={log.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-soft transition-colors"
                >
                  <td className="px-6 py-4 text-sm text-muted">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {formatDateTime(log.timestamp)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-medium border ${getActionColor(log.action)}`}>
                      {getActionIcon(log.action)}
                      {getActionLabel(log.action)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-ptt-cyan" />
                      <span className="text-sm text-app font-medium">
                        {getDocumentTitle(log.documentId)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted" />
                      <span className="text-sm text-app">{log.userName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted">
                    {log.details || "-"}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted font-mono">
                    {log.ipAddress || "-"}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => setSelectedLog(log)}
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm 
                               bg-ptt-blue/20 hover:bg-ptt-blue/30 text-ptt-cyan rounded-lg
                               transition-colors font-medium"
                    >
                      <Eye className="w-4 h-4" />
                      ดูรายละเอียด
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>

          {filteredLogs.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted font-light">ไม่พบข้อมูล Audit Trail</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Log Detail Modal */}
      <ModalForm
        isOpen={selectedLog !== null}
        onClose={() => setSelectedLog(null)}
        title="รายละเอียด Audit Trail"
        size="lg"
      >
        {selectedLog && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted mb-1">เวลา:</p>
                <p className="text-app font-medium">{formatDateTime(selectedLog.timestamp)}</p>
              </div>
              <div>
                <p className="text-muted mb-1">การกระทำ:</p>
                <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-medium border ${getActionColor(selectedLog.action)}`}>
                  {getActionIcon(selectedLog.action)}
                  {getActionLabel(selectedLog.action)}
                </span>
              </div>
              <div>
                <p className="text-muted mb-1">เอกสาร:</p>
                <p className="text-app font-medium">{getDocumentTitle(selectedLog.documentId)}</p>
              </div>
              <div>
                <p className="text-muted mb-1">ผู้ทำ:</p>
                <p className="text-app font-medium">{selectedLog.userName}</p>
                <p className="text-xs text-muted">({selectedLog.userId})</p>
              </div>
              {selectedLog.ipAddress && (
                <div>
                  <p className="text-muted mb-1">IP Address:</p>
                  <p className="text-app font-mono">{selectedLog.ipAddress}</p>
                </div>
              )}
              {selectedLog.userAgent && (
                <div>
                  <p className="text-muted mb-1">User Agent:</p>
                  <p className="text-app text-xs">{selectedLog.userAgent}</p>
                </div>
              )}
            </div>

            {selectedLog.details && (
              <div>
                <p className="text-muted mb-1">รายละเอียด:</p>
                <p className="text-app">{selectedLog.details}</p>
              </div>
            )}
          </div>
        )}
      </ModalForm>
    </div>
  );
}

