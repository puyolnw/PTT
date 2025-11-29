import { motion } from "framer-motion";
import { useState } from "react";
import {
  Plus,
  Search,
  Filter,
  Eye,
  FileText,
} from "lucide-react";

const numberFormatter = new Intl.NumberFormat("th-TH", {
  maximumFractionDigits: 0,
});

// Mock data
const mockReceivings = [
  {
    id: "RC-20241215-001",
    orderNo: "SO-20241215-001",
    deliveryNoteNo: "DN-20241215-001",
    branch: "ปั๊มไฮโซ",
    receiveDate: "2024-12-15",
    receiveTime: "14:30",
    oilType: "Premium Diesel",
    quantityOrdered: 20000,
    quantityReceived: 19950,
    difference: -50,
    differencePercent: -0.25,
    apiCheck: 35.2,
    driverName: "สมชาย ใจดี",
    truckLicensePlate: "กก-1234",
    receiverEmployee: "พนักงาน A",
    status: "รับแล้ว",
  },
  {
    id: "RC-20241215-002",
    orderNo: "SO-20241215-002",
    deliveryNoteNo: "DN-20241215-002",
    branch: "สาขา 2",
    receiveDate: "2024-12-15",
    receiveTime: "15:45",
    oilType: "Gasohol 95",
    quantityOrdered: 15000,
    quantityReceived: 15020,
    difference: 20,
    differencePercent: 0.13,
    apiCheck: 52.5,
    driverName: "สมหญิง รักดี",
    truckLicensePlate: "ขข-5678",
    receiverEmployee: "พนักงาน B",
    status: "รับแล้ว",
  },
];

export default function Receiving() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ทั้งหมด");

  const filteredReceivings = mockReceivings.filter((receiving) => {
    const matchesSearch = 
      receiving.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      receiving.orderNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      receiving.deliveryNoteNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      receiving.branch.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === "ทั้งหมด" || receiving.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getDifferenceColor = (_diff: number, percent: number) => {
    if (Math.abs(percent) <= 0.3) return "text-emerald-500";
    if (Math.abs(percent) <= 1.0) return "text-orange-500";
    return "text-red-500";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-[var(--accent)] mb-2">การรับน้ำมัน</h1>
          <p className="text-muted">บันทึกการรับน้ำมันจากรถขนส่ง ปตท.</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          เริ่มรับน้ำมันใหม่
        </button>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="panel p-4 rounded-xl flex flex-col md:flex-row gap-4"
      >
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
          <input
            type="text"
            placeholder="ค้นหาเลขที่รับ, เลขที่ใบสั่งซื้อ, เลขที่ใบส่งของ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[var(--bg)] border border-app rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/30"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-muted" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 bg-[var(--bg)] border border-app rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/30"
          >
            <option>ทั้งหมด</option>
            <option>รับแล้ว</option>
            <option>รอรับ</option>
          </select>
        </div>
      </motion.div>

      {/* Receivings Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="panel rounded-xl overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-app">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted">เลขที่รับ</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted">เลขที่ใบสั่งซื้อ</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted">เลขที่ใบส่งของ</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted">สาขา</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted">วันที่รับ</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted">ประเภทน้ำมัน</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted">สั่ง (ลิตร)</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted">รับ (ลิตร)</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted">ส่วนต่าง</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-muted">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {filteredReceivings.map((receiving, index) => (
                <motion.tr
                  key={receiving.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="border-b border-app hover:bg-app/50 transition-colors"
                >
                  <td className="py-3 px-4 text-sm font-medium text-[var(--accent)]">{receiving.id}</td>
                  <td className="py-3 px-4 text-sm text-muted">{receiving.orderNo}</td>
                  <td className="py-3 px-4 text-sm text-muted">{receiving.deliveryNoteNo}</td>
                  <td className="py-3 px-4 text-sm text-muted">{receiving.branch}</td>
                  <td className="py-3 px-4 text-sm text-muted">
                    {receiving.receiveDate} {receiving.receiveTime}
                  </td>
                  <td className="py-3 px-4 text-sm text-muted">{receiving.oilType}</td>
                  <td className="py-3 px-4 text-sm text-right">{numberFormatter.format(receiving.quantityOrdered)}</td>
                  <td className="py-3 px-4 text-sm text-right font-medium">{numberFormatter.format(receiving.quantityReceived)}</td>
                  <td className="py-3 px-4 text-sm text-right">
                    <span className={`font-medium ${getDifferenceColor(receiving.difference, receiving.differencePercent)}`}>
                      {receiving.difference > 0 ? '+' : ''}{numberFormatter.format(receiving.difference)} 
                      <span className="text-xs ml-1">({receiving.differencePercent > 0 ? '+' : ''}{receiving.differencePercent.toFixed(2)}%)</span>
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-center gap-2">
                      <button className="p-2 hover:bg-app rounded-lg transition-colors" title="ดูรายละเอียด">
                        <Eye className="w-4 h-4 text-muted" />
                      </button>
                      <button className="p-2 hover:bg-app rounded-lg transition-colors" title="ดูเอกสาร">
                        <FileText className="w-4 h-4 text-muted" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Summary Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <div className="panel p-4 rounded-xl">
          <p className="text-sm text-muted mb-1">รับน้ำมันวันนี้</p>
          <p className="text-2xl font-bold text-[var(--accent)]">
            {numberFormatter.format(mockReceivings.reduce((sum, r) => sum + r.quantityReceived, 0))} ลิตร
          </p>
        </div>
        <div className="panel p-4 rounded-xl">
          <p className="text-sm text-muted mb-1">จำนวนเที่ยว</p>
          <p className="text-2xl font-bold text-blue-500">{mockReceivings.length}</p>
        </div>
        <div className="panel p-4 rounded-xl">
          <p className="text-sm text-muted mb-1">ส่วนต่างเฉลี่ย</p>
          <p className="text-2xl font-bold text-emerald-500">
            {mockReceivings.length > 0 
              ? (mockReceivings.reduce((sum, r) => sum + Math.abs(r.differencePercent), 0) / mockReceivings.length).toFixed(2)
              : '0.00'}%
          </p>
        </div>
      </motion.div>
    </div>
  );
}

