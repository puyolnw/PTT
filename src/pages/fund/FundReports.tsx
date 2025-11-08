import { motion } from "framer-motion";
import { 
  monthlyReports, 
  loans
} from "@/data/mockData";
import { FileSpreadsheet, Download, PiggyBank, CreditCard, AlertTriangle, Calendar } from "lucide-react";
import StatusTag, { getStatusVariant } from "@/components/StatusTag";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatMonthLabel = (month: string) => {
  const [year, monthIndex] = month.split("-").map(Number);
  if (!year || !monthIndex) {
    return month;
  }
  const date = new Date(year, monthIndex - 1, 1);
  return date.toLocaleDateString("th-TH", {
    month: "long",
    year: "numeric",
  });
};

export default function FundReports() {
  const latestReport = monthlyReports[0];
  const overdueMembers = loans
    .filter(l => l.status === "Overdue" || l.overdueCount > 0)
    .map(l => l.empName);

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
          <h2 className="text-2xl font-semibold text-ptt-cyan font-display">รายงานกองทุนสัจจะออมทรัพย์</h2>
          <p className="text-muted font-light">รายงานประจำเดือนและส่งออกข้อมูลกองทุน</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 rounded-xl transition-colors">
          <FileSpreadsheet className="w-5 h-5" />
          <span>ส่งออก Excel</span>
        </button>
      </div>

      {/* Monthly Report Summary */}
      {latestReport && (
        <div className="bg-soft border border-app rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold text-app font-display">
                รายงานประจำเดือน {formatMonthLabel(latestReport.month)}
              </h3>
              <p className="text-sm text-muted">
                ส่งรายงานเมื่อ {new Date(latestReport.reportDate).toLocaleDateString("th-TH")}
              </p>
            </div>
            <StatusTag variant={getStatusVariant(
              latestReport.status === "Submitted" ? "อนุมัติแล้ว" : "รออนุมัติ"
            )}>
              {latestReport.status === "Submitted" ? "ส่งแล้ว" : "ร่าง"}
            </StatusTag>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-soft rounded-xl border border-app">
              <div className="flex items-center gap-2 mb-2">
                <PiggyBank className="w-5 h-5 text-ptt-cyan" />
                <p className="text-sm text-muted">ยอดเงินสัจจะรวม</p>
              </div>
              <p className="text-2xl font-bold text-app font-mono">
                {formatCurrency(latestReport.totalSavings)}
              </p>
            </div>
            <div className="p-4 bg-soft rounded-xl border border-app">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="w-5 h-5 text-blue-400" />
                <p className="text-sm text-muted">ยอดเงินกู้คงเหลือ</p>
              </div>
              <p className="text-2xl font-bold text-app font-mono">
                {formatCurrency(latestReport.totalLoansOutstanding)}
              </p>
            </div>
            <div className="p-4 bg-soft rounded-xl border border-app">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <p className="text-sm text-muted">กู้ที่ผิดนัด</p>
              </div>
              <p className="text-2xl font-bold text-app font-mono">
                {latestReport.overdueLoans}
              </p>
            </div>
            <div className="p-4 bg-soft rounded-xl border border-app">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-green-400" />
                <p className="text-sm text-muted">สมาชิกใหม่</p>
              </div>
              <p className="text-2xl font-bold text-app font-mono">
                {latestReport.newMembers}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Overdue Members List */}
      {overdueMembers.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-app mb-4 font-display flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            รายชื่อผู้ค้างชำระ ({overdueMembers.length} คน)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {overdueMembers.map((name, index) => (
              <div
                key={index}
                className="p-3 bg-soft rounded-lg border border-red-500/30"
              >
                <p className="text-sm font-medium text-app">{name}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Monthly Reports List */}
      <div className="bg-soft border border-app rounded-2xl p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-app mb-4 font-display">รายงานประจำเดือน</h3>
        <div className="space-y-3">
          {monthlyReports.map((report) => (
            <div
              key={report.id}
              className="flex items-center justify-between p-4 bg-soft rounded-xl border-app hover:border-ptt-blue/30 transition-colors"
            >
              <div>
                <p className="font-semibold text-app">
                  รายงานประจำเดือน {formatMonthLabel(report.month)}
                </p>
                <p className="text-sm text-muted">
                  ส่งเมื่อ {new Date(report.reportDate).toLocaleDateString("th-TH")}
                  {report.submittedBy && ` โดย ${report.submittedBy}`}
                </p>
                <div className="flex items-center gap-4 mt-2 text-xs text-muted">
                  <span>เงินสัจจะ: {formatCurrency(report.totalSavings)}</span>
                  <span>•</span>
                  <span>เงินกู้คงเหลือ: {formatCurrency(report.totalLoansOutstanding)}</span>
                  <span>•</span>
                  <span>ผิดนัด: {report.overdueLoans} รายการ</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <StatusTag variant={getStatusVariant(
                  report.status === "Submitted" ? "อนุมัติแล้ว" : "รออนุมัติ"
                )}>
                  {report.status === "Submitted" ? "ส่งแล้ว" : "ร่าง"}
                </StatusTag>
                <button className="inline-flex items-center gap-2 px-4 py-2 text-sm 
                                 bg-ptt-blue/20 hover:bg-ptt-blue/30 text-ptt-cyan rounded-lg
                                 transition-colors font-medium">
                  <Download className="w-4 h-4" />
                  ดาวน์โหลด
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Export Options */}
      <div className="panel/40 border border-app rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-app mb-4 font-display">ส่งออกรายงาน</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="flex items-center gap-3 p-4 bg-ptt-blue/20 hover:bg-ptt-blue/30 border border-ptt-blue/30 rounded-xl transition-colors">
            <Download className="w-5 h-5 text-ptt-cyan" />
            <div className="text-left">
              <p className="text-sm font-semibold text-app">รายงานเงินสัจจะ</p>
              <p className="text-xs text-muted">Excel / PDF</p>
            </div>
          </button>
          <button className="flex items-center gap-3 p-4 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-xl transition-colors">
            <Download className="w-5 h-5 text-blue-400" />
            <div className="text-left">
              <p className="text-sm font-semibold text-app">รายงานการกู้ยืม</p>
              <p className="text-xs text-muted">Excel / PDF</p>
            </div>
          </button>
          <button className="flex items-center gap-3 p-4 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-xl transition-colors">
            <Download className="w-5 h-5 text-red-400" />
            <div className="text-left">
              <p className="text-sm font-semibold text-app">รายงานผู้ค้างชำระ</p>
              <p className="text-xs text-muted">Excel / PDF</p>
            </div>
          </button>
          <button className="flex items-center gap-3 p-4 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-xl transition-colors">
            <Download className="w-5 h-5 text-green-400" />
            <div className="text-left">
              <p className="text-sm font-semibold text-app">รายงานสรุปทั้งหมด</p>
              <p className="text-xs text-muted">Excel / PDF</p>
            </div>
          </button>
        </div>
      </div>
    </motion.div>
  );
}

