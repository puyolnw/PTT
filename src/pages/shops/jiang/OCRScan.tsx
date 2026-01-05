import { motion } from "framer-motion";
import { Camera, Upload, FileText, CheckCircle, AlertCircle, Image as ImageIcon, DollarSign, Receipt } from "lucide-react";
import { useState } from "react";
import { useShop } from "@/contexts/ShopContext";

const currencyFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 0,
});

interface OCRItem {
  name: string;
  quantity: number;
  price: number;
  total: number;
}

interface ExtractedData {
  date: string;
  total?: number;
  items?: OCRItem[] | string;
  paymentMethod?: string;
  supplier?: string;
  amount?: number;
  description?: string;
  dueDate?: string;
}

interface OCRScan {
  id: string;
  fileName: string;
  scanDate: string;
  type: string;
  extractedData: ExtractedData | null;
  status: "success" | "error";
  confidence: number;
  error?: string;
}

// Mock data - OCR Scan สำหรับร้านเจียง (บิลขาย/ค่าใช้จ่าย)
const mockOCRScans: OCRScan[] = [
  {
    id: "OCR-JIANG-001",
    fileName: "บิลขาย_2024-12-15.jpg",
    scanDate: "2024-12-15T10:30:00",
    type: "บิลขาย",
    extractedData: {
      date: "2024-12-15",
      total: 1700,
      items: [
        { name: "ก๋วยเตี๋ยวลูกชิ้นปลา", quantity: 20, price: 55, total: 1100 },
        { name: "เย็นตาโฟ", quantity: 10, price: 60, total: 600 },
      ],
      paymentMethod: "เงินสด",
    },
    status: "success",
    confidence: 95,
  },
  {
    id: "OCR-JIANG-002",
    fileName: "บิลค่าใช้จ่าย_น้ำไฟ_2024-12.pdf",
    scanDate: "2024-12-14T14:20:00",
    type: "ค่าใช้จ่าย",
    extractedData: {
      date: "2024-12-14",
      supplier: "PTT",
      amount: 3000,
      description: "ค่าน้ำ/ไฟ",
      dueDate: "2024-12-20",
    },
    status: "success",
    confidence: 92,
  },
  {
    id: "OCR-JIANG-003",
    fileName: "บิลซื้อวัตถุดิบ_ตลาดทะเล.jpg",
    scanDate: "2024-12-13T09:15:00",
    type: "บิลซื้อ",
    extractedData: {
      date: "2024-12-13",
      supplier: "ตลาดทะเล",
      amount: 25000,
      items: "ปลาสด 50 กก.",
      dueDate: "2024-12-20",
    },
    status: "success",
    confidence: 88,
  },
  {
    id: "OCR-JIANG-004",
    fileName: "บิลขาย_2024-12-12.jpg",
    scanDate: "2024-12-12T16:45:00",
    type: "บิลขาย",
    extractedData: null,
    status: "error",
    confidence: 0,
    error: "ไม่สามารถอ่านข้อมูลได้ กรุณาตรวจสอบคุณภาพไฟล์",
  },
];

export default function OCRScan() {
  const { currentShop } = useShop();
  const shopName = currentShop?.name || "ร้านเจียง (Jiang Fish Balls)";
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const filteredScans = selectedType
    ? mockOCRScans.filter(s => s.type === selectedType)
    : mockOCRScans;

  const types = Array.from(new Set(mockOCRScans.map(s => s.type)));

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      // Simulate OCR processing
      setTimeout(() => {
        alert(`กำลังประมวลผลไฟล์ ${file.name}...\n\nระบบจะดึงข้อมูลยอดขาย/ค่าใช้จ่ายจากบิลอัตโนมัติ`);
        setUploadedFile(null);
      }, 1000);
    }
  };

  const handleUseData = (scan: typeof mockOCRScans[0]) => {
    if (scan.type === "บิลขาย") {
      alert(`กำลังบันทึกยอดขาย: ${currencyFormatter.format(scan.extractedData?.total || 0)}\n\nวันที่: ${scan.extractedData?.date}`);
    } else if (scan.type === "ค่าใช้จ่าย" || scan.type === "บิลซื้อ") {
      alert(`กำลังบันทึกค่าใช้จ่าย: ${currencyFormatter.format(scan.extractedData?.amount || 0)}\n\nจาก: ${scan.extractedData?.supplier || "ไม่ระบุ"}`);
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h2 className="text-3xl font-bold text-app mb-2 font-display">OCR สแกนบิล - {shopName}</h2>
        <p className="text-muted font-light">
          ถ่ายรูปบิล → ดึงยอดขาย/ค่าใช้จ่ายอัตโนมัติ (บิลขาย, บิลซื้อ, ค่าใช้จ่าย)
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
          <h3 className="text-xl font-semibold text-app mb-2">อัปโหลดไฟล์บิลเพื่อสแกน</h3>
          <p className="text-sm text-muted mb-4">
            รองรับไฟล์ PDF, JPG, PNG (บิลขาย, บิลซื้อ, ค่าใช้จ่าย)
          </p>
          <label className="flex items-center gap-2 px-6 py-3 bg-ptt-blue/10 hover:bg-ptt-blue/20 border border-ptt-blue/30 rounded-xl text-ptt-cyan transition-colors cursor-pointer">
            <Upload className="w-5 h-5" />
            <span>เลือกไฟล์</span>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
          {uploadedFile && (
            <p className="text-sm text-muted mt-4">
              กำลังประมวลผล: {uploadedFile.name}
            </p>
          )}
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
              className={`p-4 rounded-xl border-2 ${scan.status === "success"
                ? "bg-emerald-500/10 border-emerald-500/30"
                : "bg-red-500/10 border-red-500/30"
                }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {scan.type === "บิลขาย" ? (
                      <Receipt className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <DollarSign className="w-5 h-5 text-orange-400" />
                    )}
                    <h4 className="font-semibold text-app">{scan.fileName}</h4>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${scan.status === "success"
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
                      {scan.type === "บิลขาย" && (
                        <div className="space-y-2">
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-muted">วันที่: </span>
                              <span className="text-app font-medium">{scan.extractedData.date}</span>
                            </div>
                            <div>
                              <span className="text-muted">รวม: </span>
                              <span className="text-app font-medium text-emerald-400">
                                {scan.extractedData.total ? currencyFormatter.format(scan.extractedData.total) : "-"}
                              </span>
                            </div>
                            <div>
                              <span className="text-muted">วิธีชำระ: </span>
                              <span className="text-app font-medium">{scan.extractedData.paymentMethod}</span>
                            </div>
                          </div>
                          {scan.extractedData.items && Array.isArray(scan.extractedData.items) && (
                            <div className="mt-2 pt-2 border-t border-app">
                              <p className="text-xs text-muted mb-1">รายการ:</p>
                              {scan.extractedData.items.map((item, idx) => (
                                <div key={idx} className="text-xs text-app">
                                  {item.name} x {item.quantity} = {currencyFormatter.format(item.total)}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                      {(scan.type === "ค่าใช้จ่าย" || scan.type === "บิลซื้อ") && (
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-muted">วันที่: </span>
                            <span className="text-app font-medium">{scan.extractedData.date}</span>
                          </div>
                          <div>
                            <span className="text-muted">จำนวนเงิน: </span>
                            <span className="text-app font-medium text-orange-400">
                              {scan.extractedData.amount ? currencyFormatter.format(scan.extractedData.amount) : "-"}
                            </span>
                          </div>
                          {scan.extractedData.supplier && (
                            <div>
                              <span className="text-muted">ซัพพลายเออร์: </span>
                              <span className="text-app font-medium">{scan.extractedData.supplier}</span>
                            </div>
                          )}
                          {scan.extractedData.description && (
                            <div>
                              <span className="text-muted">รายละเอียด: </span>
                              <span className="text-app font-medium">{scan.extractedData.description}</span>
                            </div>
                          )}
                          {scan.extractedData.dueDate && (
                            <div>
                              <span className="text-muted">ครบกำหนด: </span>
                              <span className="text-app font-medium">{scan.extractedData.dueDate}</span>
                            </div>
                          )}
                        </div>
                      )}
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
                  <button
                    onClick={() => handleUseData(scan)}
                    className="ml-4 px-4 py-2 bg-ptt-blue/10 hover:bg-ptt-blue/20 border border-ptt-blue/30 rounded-xl text-ptt-cyan text-sm transition-colors"
                  >
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

