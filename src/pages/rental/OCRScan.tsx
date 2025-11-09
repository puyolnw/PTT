import { motion } from "framer-motion";
import { Camera, Upload, FileText, CheckCircle, AlertCircle, Image as ImageIcon } from "lucide-react";
import { useState } from "react";

// Mock data - OCR Scan
const mockOCRScans = [
  {
    id: "OCR-001",
    fileName: "สัญญาเช่า_FIT_Auto.pdf",
    scanDate: "2024-12-15T10:30:00",
    type: "สัญญาเช่า",
    extractedData: {
      shop: "FIT Auto",
      branch: "สำนักงานใหญ่",
      startDate: "2024-01-01",
      endDate: "2024-12-31",
      rentAmount: 7000,
      rentType: "คงที่",
    },
    status: "success",
    confidence: 95,
  },
  {
    id: "OCR-002",
    fileName: "ใบแจ้งหนี้_Daiso_2024-12.pdf",
    scanDate: "2024-12-14T14:20:00",
    type: "ใบแจ้งหนี้",
    extractedData: {
      shop: "Daiso",
      branch: "สาขา A",
      amount: 4000,
      dueDate: "2024-12-20",
    },
    status: "success",
    confidence: 92,
  },
  {
    id: "OCR-003",
    fileName: "สลิปโอน_Chester_2024-12.jpg",
    scanDate: "2024-12-13T09:15:00",
    type: "สลิปโอน",
    extractedData: {
      shop: "Chester's",
      amount: 25000,
      paymentDate: "2024-12-13",
      bankAccount: "123-456-7890",
    },
    status: "success",
    confidence: 88,
  },
  {
    id: "OCR-004",
    fileName: "สัญญาเช่า_Quick.pdf",
    scanDate: "2024-12-12T16:45:00",
    type: "สัญญาเช่า",
    extractedData: null,
    status: "error",
    confidence: 0,
    error: "ไม่สามารถอ่านข้อมูลได้ กรุณาตรวจสอบคุณภาพไฟล์",
  },
];

export default function OCRScan() {
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const filteredScans = selectedType
    ? mockOCRScans.filter(s => s.type === selectedType)
    : mockOCRScans;

  const types = Array.from(new Set(mockOCRScans.map(s => s.type)));

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h2 className="text-3xl font-bold text-app mb-2 font-display">OCR สแกนสัญญา/บิล</h2>
        <p className="text-muted font-light">
          ถ่ายรูปบิล → ดึงข้อมูลอัตโนมัติ (สัญญาเช่า, ใบแจ้งหนี้, สลิปโอน)
        </p>
      </motion.div>

      {/* Upload Area */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="panel rounded-2xl p-6 shadow-app border-2 border-dashed border-ptt-blue/30"
      >
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-20 h-20 bg-ptt-blue/10 rounded-full flex items-center justify-center mb-4">
            <Camera className="w-10 h-10 text-ptt-cyan" />
          </div>
          <h3 className="text-xl font-semibold text-app mb-2">อัปโหลดไฟล์เพื่อสแกน</h3>
          <p className="text-sm text-muted mb-4">
            รองรับไฟล์ PDF, JPG, PNG (สัญญาเช่า, ใบแจ้งหนี้, สลิปโอน)
          </p>
          <button className="flex items-center gap-2 px-6 py-3 bg-ptt-blue/10 hover:bg-ptt-blue/20 border border-ptt-blue/30 rounded-xl text-ptt-cyan transition-colors">
            <Upload className="w-5 h-5" />
            <span>เลือกไฟล์</span>
          </button>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="panel rounded-2xl p-6 shadow-app"
        >
          <div className="flex items-center justify-between mb-4">
            <FileText className="w-6 h-6 text-ptt-cyan" />
            <span className="text-xs text-muted">ทั้งหมด</span>
          </div>
          <p className="text-2xl font-bold text-app">
            {mockOCRScans.length}
          </p>
          <p className="text-xs text-muted mt-1">ไฟล์</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="panel rounded-2xl p-6 shadow-app border-2 border-emerald-500/30"
        >
          <div className="flex items-center justify-between mb-4">
            <CheckCircle className="w-6 h-6 text-emerald-400" />
            <span className="text-xs text-muted">สำเร็จ</span>
          </div>
          <p className="text-2xl font-bold text-emerald-400">
            {mockOCRScans.filter(s => s.status === "success").length}
          </p>
          <p className="text-xs text-muted mt-1">ไฟล์</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="panel rounded-2xl p-6 shadow-app border-2 border-red-500/30"
        >
          <div className="flex items-center justify-between mb-4">
            <AlertCircle className="w-6 h-6 text-red-400" />
            <span className="text-xs text-muted">ผิดพลาด</span>
          </div>
          <p className="text-2xl font-bold text-red-400">
            {mockOCRScans.filter(s => s.status === "error").length}
          </p>
          <p className="text-xs text-muted mt-1">ไฟล์</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="panel rounded-2xl p-6 shadow-app"
        >
          <div className="flex items-center justify-between mb-4">
            <ImageIcon className="w-6 h-6 text-blue-400" />
            <span className="text-xs text-muted">เฉลี่ยความมั่นใจ</span>
          </div>
          <p className="text-2xl font-bold text-blue-400">
            {Math.round(
              mockOCRScans
                .filter(s => s.status === "success")
                .reduce((sum, s) => sum + s.confidence, 0) /
              mockOCRScans.filter(s => s.status === "success").length
            )}%
          </p>
          <p className="text-xs text-muted mt-1">ความแม่นยำ</p>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <select
          value={selectedType || ""}
          onChange={(e) => setSelectedType(e.target.value || null)}
          className="px-4 py-2 bg-soft border border-app rounded-xl text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue/30"
        >
          <option value="">ทุกประเภท</option>
          {types.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      {/* Scans List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="panel rounded-2xl p-6 shadow-app"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-app">ประวัติการสแกน</h3>
            <p className="text-sm text-muted">
              {filteredScans.length} รายการ
            </p>
          </div>
          <Camera className="w-6 h-6 text-muted" />
        </div>
        <div className="space-y-3">
          {filteredScans.map((scan) => (
            <div
              key={scan.id}
              className={`p-4 rounded-xl border-2 ${
                scan.status === "success"
                  ? "bg-emerald-500/10 border-emerald-500/30"
                  : "bg-red-500/10 border-red-500/30"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <FileText className="w-5 h-5 text-ptt-cyan" />
                    <h4 className="font-semibold text-app">{scan.fileName}</h4>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      scan.status === "success"
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-red-500/20 text-red-400 border border-red-500/30"
                    }`}>
                      {scan.status === "success" ? "สำเร็จ" : "ผิดพลาด"}
                    </span>
                    <span className="px-2 py-1 rounded-full bg-ptt-blue/10 text-ptt-cyan text-xs">
                      {scan.type}
                    </span>
                  </div>
                  {scan.status === "success" && scan.extractedData && (
                    <div className="mt-3 p-3 bg-soft rounded-lg border border-app">
                      <p className="text-xs text-muted mb-2">ข้อมูลที่ดึงได้:</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        {Object.entries(scan.extractedData).map(([key, value]) => (
                          <div key={key}>
                            <span className="text-muted">{key}: </span>
                            <span className="text-app font-medium">{String(value)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-2">
                        <span className="text-xs text-muted">ความมั่นใจ: </span>
                        <span className="text-xs font-semibold text-emerald-400">
                          {scan.confidence}%
                        </span>
                      </div>
                    </div>
                  )}
                  {scan.status === "error" && (
                    <div className="mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                      <p className="text-xs text-red-400">
                        <strong>ข้อผิดพลาด:</strong> {scan.error}
                      </p>
                    </div>
                  )}
                  <p className="text-xs text-muted mt-2">
                    สแกนเมื่อ: {new Date(scan.scanDate).toLocaleString("th-TH")}
                  </p>
                </div>
                {scan.status === "success" && (
                  <button className="ml-4 px-4 py-2 bg-ptt-blue/10 hover:bg-ptt-blue/20 border border-ptt-blue/30 rounded-xl text-ptt-cyan text-sm transition-colors">
                    ใช้ข้อมูล
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

