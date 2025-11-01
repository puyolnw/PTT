import { motion } from "framer-motion";
import { FileSpreadsheet, FileText, Download, Calendar } from "lucide-react";

export default function Export() {
  const reportTypes = [
    {
      id: 1,
      name: "รายงานพนักงานทั้งหมด",
      desc: "ข้อมูลพนักงาน, แผนก, ตำแหน่ง, สถานะ",
      icon: FileSpreadsheet,
      formats: ["Excel", "PDF", "CSV"]
    },
    {
      id: 2,
      name: "รายงานการเข้างาน",
      desc: "บันทึกเวลาเข้า-ออก, มาสาย, ขาดงาน",
      icon: Calendar,
      formats: ["Excel", "PDF"]
    },
    {
      id: 3,
      name: "รายงานกองทุน",
      desc: "รายรับ-รายจ่าย, ยอดคงเหลือ",
      icon: FileText,
      formats: ["Excel", "PDF"]
    },
    {
      id: 4,
      name: "รายงานประสิทธิภาพ",
      desc: "KPI, ผลการประเมิน, คะแนนพนักงาน",
      icon: FileText,
      formats: ["Excel", "PDF"]
    },
    {
      id: 5,
      name: "รายงานการลา",
      desc: "ประเภทการลา, สถานะอนุมัติ, วันลาคงเหลือ",
      icon: Calendar,
      formats: ["Excel", "PDF", "CSV"]
    },
    {
      id: 6,
      name: "รายงานเงินเดือน",
      desc: "เงินเดือน, โบนัส, หักลดหย่อน",
      icon: FileSpreadsheet,
      formats: ["Excel", "PDF"]
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-ptt-cyan font-display">ส่งออกรายงาน</h2>
        <p className="text-muted font-light">ศูนย์ส่งออก PDF/Excel/CSV</p>
      </div>

      {/* Export Options */}
      <div className="panel/40 border border-app rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-app mb-4 font-display">เลือกช่วงวันที่</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm text-muted mb-2">วันที่เริ่มต้น</label>
            <input 
              type="date" 
              className="w-full px-4 py-2 bg-ink-800 border border-app rounded-lg text-app"
              defaultValue="2025-01-01"
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm text-muted mb-2">วันที่สิ้นสุด</label>
            <input 
              type="date" 
              className="w-full px-4 py-2 bg-ink-800 border border-app rounded-lg text-app"
              defaultValue="2025-12-31"
            />
          </div>
        </div>
      </div>

      {/* Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reportTypes.map((report) => (
          <div 
            key={report.id}
            className="panel/40 border border-app rounded-2xl p-6 hover:border-ptt-blue/30 transition-colors"
          >
            {/* Header */}
            <div className="flex items-start gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-ptt-blue/20 to-ptt-cyan/20 rounded-xl flex items-center justify-center">
                <report.icon className="w-6 h-6 text-ptt-cyan" strokeWidth={1.5} />
              </div>
              <div className="flex-1">
                <h4 className="text-base font-semibold text-app mb-1">{report.name}</h4>
                <p className="text-xs text-muted">{report.desc}</p>
              </div>
            </div>

            {/* Format Buttons */}
            <div className="space-y-2">
              <p className="text-xs text-muted mb-2">รูปแบบไฟล์:</p>
              {report.formats.map((format) => (
                <button
                  key={format}
                  className="w-full flex items-center justify-between px-4 py-2 bg-ink-800/60 hover:bg-ptt-blue/20 border border-app hover:border-ptt-blue/30 rounded-lg transition-colors group"
                >
                  <span className="text-sm text-app group-hover:text-app">
                    {format === "Excel" ? "📊 Excel (.xlsx)" : 
                     format === "PDF" ? "📄 PDF (.pdf)" : 
                     "📝 CSV (.csv)"}
                  </span>
                  <Download className="w-4 h-4 text-muted group-hover:text-ptt-cyan" strokeWidth={1.5} />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Export History */}
      <div className="panel/40 border border-app rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-app mb-4 font-display">ประวัติการส่งออกล่าสุด</h3>
        <div className="space-y-2">
          {[
            { name: "รายงานพนักงาน_2025-01.xlsx", date: "2025-01-30 14:30", size: "2.5 MB" },
            { name: "รายงานกองทุน_2025-01.pdf", date: "2025-01-28 10:15", size: "1.2 MB" },
            { name: "รายงานการเข้างาน_2025-01.csv", date: "2025-01-25 16:45", size: "850 KB" }
          ].map((file, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-ink-800/40 rounded-lg hover:bg-ink-800/60 transition-colors">
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="w-5 h-5 text-ptt-cyan" strokeWidth={1.5} />
                <div>
                  <div className="text-sm font-medium text-app">{file.name}</div>
                  <div className="text-xs text-muted">{file.date} • {file.size}</div>
                </div>
              </div>
              <button className="p-2 hover:bg-ink-700 rounded-lg transition-colors">
                <Download className="w-4 h-4 text-muted" strokeWidth={1.5} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

