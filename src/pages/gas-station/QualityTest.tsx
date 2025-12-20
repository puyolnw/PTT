import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";
import {
  TestTube,
  Search,
  Eye,
  Building2,
  Calendar,
  CheckCircle,
  XCircle,
  Droplet,
  User,
  FileText,
  X,
  TrendingUp,
} from "lucide-react";
import { useGasStation } from "@/contexts/GasStationContext";
import type { QualityTest, OilType } from "@/types/gasStation";

const numberFormatter = new Intl.NumberFormat("th-TH", {
  maximumFractionDigits: 2,
});

const dateFormatter = new Intl.DateTimeFormat("th-TH", {
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

// Interface สำหรับ Quality Test Record ที่รวมข้อมูลจากหลายแหล่ง
interface QualityTestRecord {
  id: string;
  testDateTime: string;
  branchId?: number;
  branchName: string;
  sourceType: "oil-receipt" | "branch-receipt"; // มาจาก OilReceipt หรือ BranchOilReceipt
  sourceId: string;
  receiptNo: string;
  deliveryNoteNo?: string;
  purchaseOrderNo?: string;
  transportNo?: string;
  oilType: OilType;
  quantity: number;
  qualityTest: QualityTest;
  truckLicensePlate?: string;
  driverName?: string;
}

export default function QualityTest() {
  const { oilReceipts, branches, deliveryNotes, purchaseOrders } = useGasStation();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterBranch, setFilterBranch] = useState<number | "all">("all");
  const [filterDateFrom, setFilterDateFrom] = useState<string>("");
  const [filterDateTo, setFilterDateTo] = useState<string>("");
  const [filterTestResult, setFilterTestResult] = useState<"all" | "ผ่าน" | "ไม่ผ่าน">("all");
  const [filterOilType, setFilterOilType] = useState<OilType | "all">("all");
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<QualityTestRecord | null>(null);

  // Helper function to check if date is in range
  const isDateInRange = (dateStr: string, from: string, to: string) => {
    if (!from && !to) return true;
    const date = new Date(dateStr);
    const fromDate = from ? new Date(from) : null;
    const toDate = to ? new Date(to) : null;

    if (fromDate && toDate) {
      fromDate.setHours(0, 0, 0, 0);
      toDate.setHours(23, 59, 59, 999);
      return date >= fromDate && date <= toDate;
    } else if (fromDate) {
      fromDate.setHours(0, 0, 0, 0);
      return date >= fromDate;
    } else if (toDate) {
      toDate.setHours(23, 59, 59, 999);
      return date <= toDate;
    }
    return true;
  };

  // สร้าง Quality Test Records จาก OilReceipts
  const qualityTestRecords = useMemo(() => {
    const records: QualityTestRecord[] = [];

    // ดึงจาก OilReceipts
    oilReceipts.forEach((receipt) => {
      if (receipt.qualityTest) {
        // หา branch จาก deliveryNote หรือ purchaseOrder
        let branchName = "ไม่ระบุ";
        let branchId: number | undefined;
        let transportNo: string | undefined;

        if (receipt.deliveryNoteNo) {
          const deliveryNote = deliveryNotes.find((dn) => dn.deliveryNoteNo === receipt.deliveryNoteNo);
          if (deliveryNote) {
            branchName = deliveryNote.toBranchName;
            branchId = deliveryNote.toBranchId;
            transportNo = (deliveryNote as any).transportNo;
          }
        } else if (receipt.purchaseOrderNo) {
          const purchaseOrder = purchaseOrders.find((po) => po.orderNo === receipt.purchaseOrderNo);
          if (purchaseOrder && purchaseOrder.branches.length > 0) {
            branchName = purchaseOrder.branches[0].branchName;
            branchId = purchaseOrder.branches[0].branchId;
          }
        }

        // สร้าง record สำหรับแต่ละ oil type ใน receipt
        receipt.items.forEach((item) => {
          records.push({
            id: `${receipt.id}-${item.oilType}`,
            testDateTime: receipt.qualityTest.testDateTime,
            branchId,
            branchName,
            sourceType: "oil-receipt",
            sourceId: receipt.id,
            receiptNo: receipt.receiptNo,
            deliveryNoteNo: receipt.deliveryNoteNo,
            purchaseOrderNo: receipt.purchaseOrderNo,
            transportNo,
            oilType: item.oilType,
            quantity: item.quantityReceived,
            qualityTest: receipt.qualityTest,
            truckLicensePlate: receipt.truckLicensePlate,
            driverName: receipt.driverName,
          });
        });
      }
    });

    // TODO: เพิ่มการดึงจาก BranchOilReceipts เมื่อมีใน context
    // ในระบบจริงควรดึงจาก BranchOilReceipts ด้วย

    return records.sort((a, b) => new Date(b.testDateTime).getTime() - new Date(a.testDateTime).getTime());
  }, [oilReceipts, deliveryNotes, purchaseOrders]);

  // กรองข้อมูล
  const filteredRecords = useMemo(() => {
    return qualityTestRecords.filter((record) => {
      const matchesBranch = filterBranch === "all" || record.branchId === filterBranch;
      const matchesSearch =
        record.receiptNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.branchName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.oilType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.deliveryNoteNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.purchaseOrderNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.transportNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.truckLicensePlate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.driverName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.qualityTest.testedBy.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDate = isDateInRange(record.testDateTime, filterDateFrom, filterDateTo);
      const matchesTestResult = filterTestResult === "all" || record.qualityTest.testResult === filterTestResult;
      const matchesOilType = filterOilType === "all" || record.oilType === filterOilType;

      return matchesBranch && matchesSearch && matchesDate && matchesTestResult && matchesOilType;
    });
  }, [
    qualityTestRecords,
    filterBranch,
    searchTerm,
    filterDateFrom,
    filterDateTo,
    filterTestResult,
    filterOilType,
  ]);

  // สรุปข้อมูล
  const summary = useMemo(() => {
    const total = filteredRecords.length;
    const passed = filteredRecords.filter((r) => r.qualityTest.testResult === "ผ่าน").length;
    const failed = filteredRecords.filter((r) => r.qualityTest.testResult === "ไม่ผ่าน").length;
    const totalQuantity = filteredRecords.reduce((sum, r) => sum + r.quantity, 0);
    const branchesCount = new Set(filteredRecords.map((r) => r.branchId).filter((id) => id !== undefined)).size;

    return {
      total,
      passed,
      failed,
      totalQuantity,
      branchesCount,
      passRate: total > 0 ? ((passed / total) * 100).toFixed(1) : "0.0",
    };
  }, [filteredRecords]);

  // รวบรวมประเภทน้ำมันทั้งหมด
  const oilTypes = useMemo(() => {
    const types = new Set<OilType>();
    qualityTestRecords.forEach((record) => {
      types.add(record.oilType);
    });
    return Array.from(types).sort();
  }, [qualityTestRecords]);

  const handleViewDetail = (record: QualityTestRecord) => {
    setSelectedRecord(record);
    setShowDetailModal(true);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <div className="flex items-center gap-4 mb-3">
          <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
            <TestTube className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-1">การทดสอบน้ำมัน</h1>
            <p className="text-gray-600 dark:text-gray-400">
              บันทึกและดูผลการทดสอบคุณภาพน้ำมันทั้งหมดของทุกปั๊ม
            </p>
          </div>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {[
          {
            title: "รวมทั้งหมด",
            value: summary.total,
            subtitle: "รายการ",
            icon: TestTube,
            iconColor: "bg-gradient-to-br from-blue-500 to-cyan-500",
            bgGradient: "from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20",
            borderColor: "border-blue-200 dark:border-blue-800",
          },
          {
            title: "ผ่าน",
            value: summary.passed,
            subtitle: "รายการ",
            icon: CheckCircle,
            iconColor: "bg-gradient-to-br from-emerald-500 to-green-500",
            bgGradient: "from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20",
            borderColor: "border-emerald-200 dark:border-emerald-800",
          },
          {
            title: "ไม่ผ่าน",
            value: summary.failed,
            subtitle: "รายการ",
            icon: XCircle,
            iconColor: "bg-gradient-to-br from-red-500 to-orange-500",
            bgGradient: "from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20",
            borderColor: "border-red-200 dark:border-red-800",
          },
          {
            title: "อัตราการผ่าน",
            value: `${summary.passRate}%`,
            subtitle: "",
            icon: TrendingUp,
            iconColor: "bg-gradient-to-br from-purple-500 to-pink-500",
            bgGradient: "from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20",
            borderColor: "border-purple-200 dark:border-purple-800",
          },
          {
            title: "จำนวนปั๊ม",
            value: summary.branchesCount,
            subtitle: "ปั๊ม",
            icon: Building2,
            iconColor: "bg-gradient-to-br from-indigo-500 to-purple-500",
            bgGradient: "from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20",
            borderColor: "border-indigo-200 dark:border-indigo-800",
          },
        ].map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className={`bg-gradient-to-br ${stat.bgGradient} border ${stat.borderColor} rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group`}
          >
            <div className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`w-14 h-14 ${stat.iconColor} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}
                >
                  <stat.icon className="w-7 h-7 text-white" />
                </div>
              </div>
              <div>
                <h6 className="text-gray-600 dark:text-gray-400 text-xs font-semibold mb-1 uppercase tracking-wide">
                  {stat.title}
                </h6>
                <h6 className="text-gray-800 dark:text-white text-3xl font-extrabold mb-1">{stat.value}</h6>
                {stat.subtitle && <p className="text-gray-500 dark:text-gray-500 text-xs">{stat.subtitle}</p>}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5 mb-6"
      >
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="ค้นหาเลขที่ใบรับของ, สาขา, ประเภทน้ำมัน, เลขขนส่ง, ทะเบียนรถ, คนขับ, ผู้ตรวจสอบ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 text-gray-800 dark:text-white transition-all duration-200"
            />
          </div>

          {/* Filter Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <select
              value={filterBranch}
              onChange={(e) => setFilterBranch(e.target.value === "all" ? "all" : parseInt(e.target.value))}
              className="px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 text-gray-800 dark:text-white transition-all duration-200"
            >
              <option value="all">ทุกสาขา</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>

            <select
              value={filterTestResult}
              onChange={(e) => setFilterTestResult(e.target.value as "all" | "ผ่าน" | "ไม่ผ่าน")}
              className="px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 text-gray-800 dark:text-white transition-all duration-200"
            >
              <option value="all">ทุกผลการทดสอบ</option>
              <option value="ผ่าน">ผ่าน</option>
              <option value="ไม่ผ่าน">ไม่ผ่าน</option>
            </select>

            <select
              value={filterOilType}
              onChange={(e) => setFilterOilType(e.target.value as OilType | "all")}
              className="px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 text-gray-800 dark:text-white transition-all duration-200"
            >
              <option value="all">ทุกประเภทน้ำมัน</option>
              {oilTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>

            <div className="flex items-center gap-2">
              <input
                type="date"
                value={filterDateFrom}
                onChange={(e) => setFilterDateFrom(e.target.value)}
                className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 text-gray-800 dark:text-white transition-all duration-200"
                title="วันที่เริ่มต้น"
              />
              <span className="text-gray-500 dark:text-gray-400 font-medium whitespace-nowrap">ถึง</span>
              <input
                type="date"
                value={filterDateTo}
                onChange={(e) => setFilterDateTo(e.target.value)}
                className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 text-gray-800 dark:text-white transition-all duration-200"
                title="วันที่สิ้นสุด"
              />
            </div>

            {(filterDateFrom ||
              filterDateTo ||
              searchTerm ||
              filterBranch !== "all" ||
              filterTestResult !== "all" ||
              filterOilType !== "all") && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilterBranch("all");
                  setFilterDateFrom("");
                  setFilterDateTo("");
                  setFilterTestResult("all");
                  setFilterOilType("all");
                }}
                className="px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap"
              >
                ล้างตัวกรอง
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700"
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-1 flex items-center gap-2">
                <TestTube className="w-5 h-5 text-cyan-500" />
                รายการการทดสอบน้ำมัน
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                ผลการทดสอบคุณภาพน้ำมันทั้งหมดของทุกปั๊ม
              </p>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-300 dark:border-gray-600 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
                <th className="text-left py-4 px-6 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    วันที่ทดสอบ
                  </div>
                </th>
                <th className="text-left py-4 px-6 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    สาขา
                  </div>
                </th>
                <th className="text-left py-4 px-6 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <Droplet className="w-4 h-4" />
                    ประเภทน้ำมัน
                  </div>
                </th>
                <th className="text-right py-4 px-6 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  จำนวน (ลิตร)
                </th>
                <th className="text-left py-4 px-6 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    เลขที่ใบรับของ
                  </div>
                </th>
                <th className="text-center py-4 px-6 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  ผลการทดสอบ
                </th>
                <th className="text-left py-4 px-6 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    ผู้ตรวจสอบ
                  </div>
                </th>
                <th className="text-center py-4 px-6 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  จัดการ
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center">
                    <TestTube className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">ไม่พบข้อมูลการทดสอบน้ำมัน</p>
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record, index) => {
                  const isPassed = record.qualityTest.testResult === "ผ่าน";

                  return (
                    <motion.tr
                      key={record.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className={`border-b border-gray-200 dark:border-gray-700 hover:bg-gradient-to-r hover:from-cyan-50/50 hover:to-blue-50/50 dark:hover:from-cyan-900/10 dark:hover:to-blue-900/10 transition-all duration-200 ${
                        !isPassed ? "bg-red-50/30 dark:bg-red-900/10 border-l-4 border-l-red-500" : ""
                      }`}
                    >
                      <td className="py-4 px-6 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-700 dark:text-gray-300">
                            {dateFormatter.format(new Date(record.testDateTime))}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                            <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <span className="text-sm font-semibold text-gray-800 dark:text-white">
                            {record.branchName}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                            <Droplet className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                          </div>
                          <span className="text-sm font-semibold text-gray-800 dark:text-white">{record.oilType}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-sm text-right">
                        <span className="font-semibold text-gray-800 dark:text-white">
                          {numberFormatter.format(record.quantity)}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-700 dark:text-gray-300">{record.receiptNo}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold border flex items-center justify-center gap-1 ${
                            isPassed
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
                              : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800"
                          }`}
                        >
                          {isPassed ? (
                            <CheckCircle className="w-3 h-3" />
                          ) : (
                            <XCircle className="w-3 h-3" />
                          )}
                          {record.qualityTest.testResult}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-700 dark:text-gray-300">
                            {record.qualityTest.testedBy || "-"}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleViewDetail(record)}
                            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl transition-all duration-200 font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2"
                          >
                            <Eye className="w-4 h-4" />
                            ดูรายละเอียด
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Detail Modal */}
      <AnimatePresence>
        {showDetailModal && selectedRecord && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDetailModal(false)}
              className="fixed inset-0 bg-black/50 z-50"
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                      <TestTube className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-1">
                        รายละเอียดการทดสอบน้ำมัน
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {dateFormatter.format(new Date(selectedRecord.testDateTime))}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all duration-200 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-6 space-y-6">
                  {/* ข้อมูลทั่วไป */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span className="text-sm font-semibold text-gray-800 dark:text-white">สาขา</span>
                      </div>
                      <p className="text-lg font-bold text-gray-800 dark:text-white">{selectedRecord.branchName}</p>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Droplet className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        <span className="text-sm font-semibold text-gray-800 dark:text-white">ประเภทน้ำมัน</span>
                      </div>
                      <p className="text-lg font-bold text-gray-800 dark:text-white">{selectedRecord.oilType}</p>
                    </div>

                    <div className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-sm font-semibold text-gray-800 dark:text-white">เลขที่ใบรับของ</span>
                      </div>
                      <p className="text-lg font-bold text-gray-800 dark:text-white">{selectedRecord.receiptNo}</p>
                    </div>

                    <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Droplet className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                        <span className="text-sm font-semibold text-gray-800 dark:text-white">จำนวน</span>
                      </div>
                      <p className="text-lg font-bold text-gray-800 dark:text-white">
                        {numberFormatter.format(selectedRecord.quantity)} ลิตร
                      </p>
                    </div>
                  </div>

                  {/* ผลการทดสอบ */}
                  <div
                    className={`p-4 rounded-xl border ${
                      selectedRecord.qualityTest.testResult === "ผ่าน"
                        ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800"
                        : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-4">
                      {selectedRecord.qualityTest.testResult === "ผ่าน" ? (
                        <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                      )}
                      <h4 className="text-lg font-bold text-gray-800 dark:text-white">ผลการทดสอบ</h4>
                      <span
                        className={`ml-auto px-3 py-1 rounded-full text-sm font-semibold ${
                          selectedRecord.qualityTest.testResult === "ผ่าน"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        }`}
                      >
                        {selectedRecord.qualityTest.testResult}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">API Gravity</label>
                        <p className="text-sm font-semibold text-gray-800 dark:text-white">
                          {selectedRecord.qualityTest.apiGravity}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">
                          Water Content (%)
                        </label>
                        <p className="text-sm font-semibold text-gray-800 dark:text-white">
                          {selectedRecord.qualityTest.waterContent}%
                        </p>
                      </div>
                      <div>
                        <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">
                          Temperature (°C)
                        </label>
                        <p className="text-sm font-semibold text-gray-800 dark:text-white">
                          {selectedRecord.qualityTest.temperature}°C
                        </p>
                      </div>
                      <div>
                        <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">สี</label>
                        <p className="text-sm font-semibold text-gray-800 dark:text-white">
                          {selectedRecord.qualityTest.color || "-"}
                        </p>
                      </div>
                    </div>

                    {selectedRecord.qualityTest.testedBy && (
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">ผู้ตรวจสอบ</label>
                        <p className="text-sm font-semibold text-gray-800 dark:text-white">
                          {selectedRecord.qualityTest.testedBy}
                        </p>
                      </div>
                    )}

                    {selectedRecord.qualityTest.notes && (
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">หมายเหตุ</label>
                        <p className="text-sm text-gray-800 dark:text-white">{selectedRecord.qualityTest.notes}</p>
                      </div>
                    )}
                  </div>

                  {/* ข้อมูลเพิ่มเติม */}
                  {(selectedRecord.deliveryNoteNo ||
                    selectedRecord.purchaseOrderNo ||
                    selectedRecord.transportNo ||
                    selectedRecord.truckLicensePlate ||
                    selectedRecord.driverName) && (
                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                      <h4 className="text-sm font-semibold text-gray-800 dark:text-white mb-3">ข้อมูลเพิ่มเติม</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        {selectedRecord.deliveryNoteNo && (
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">เลขที่ใบส่งของ:</span>
                            <span className="font-semibold text-gray-800 dark:text-white ml-2">
                              {selectedRecord.deliveryNoteNo}
                            </span>
                          </div>
                        )}
                        {selectedRecord.purchaseOrderNo && (
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">เลขที่ใบสั่งซื้อ:</span>
                            <span className="font-semibold text-gray-800 dark:text-white ml-2">
                              {selectedRecord.purchaseOrderNo}
                            </span>
                          </div>
                        )}
                        {selectedRecord.transportNo && (
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">เลขขนส่ง:</span>
                            <span className="font-semibold text-gray-800 dark:text-white ml-2">
                              {selectedRecord.transportNo}
                            </span>
                          </div>
                        )}
                        {selectedRecord.truckLicensePlate && (
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">ทะเบียนรถ:</span>
                            <span className="font-semibold text-gray-800 dark:text-white ml-2">
                              {selectedRecord.truckLicensePlate}
                            </span>
                          </div>
                        )}
                        {selectedRecord.driverName && (
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">คนขับ:</span>
                            <span className="font-semibold text-gray-800 dark:text-white ml-2">
                              {selectedRecord.driverName}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
