import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { 
  DollarSign, 
  FileText, 
  Search, 
  Filter, 
  CheckCircle, 
  Clock, 
  CreditCard,
  Building2,
  Calendar
} from "lucide-react";
import ChartCard from "@/components/ChartCard";
import StatusTag from "@/components/StatusTag";
import { DeliveryPurchaseOrder, loadPurchaseOrders, savePurchaseOrders } from "@/pages/delivery/_storage";
import { useBranch } from "@/contexts/BranchContext";
import { useGasStation } from "@/contexts/GasStationContext";

const currencyFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 0,
});

export default function OrderPayments() {
  const { selectedBranches } = useBranch();
  const { branches } = useGasStation();
  const selectedBranchIds = useMemo(() => selectedBranches.map(id => Number(id)), [selectedBranches]);
  
  const [list, setList] = useState<DeliveryPurchaseOrder[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ทั้งหมด");

  useEffect(() => {
    setList(loadPurchaseOrders());
  }, []);

  const filteredList = useMemo(() => {
    return list.filter(po => {
      const matchesBranch = selectedBranchIds.length === 0 || selectedBranchIds.includes(po.branchId);
      const matchesSearch = 
        po.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        po.approveNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        po.id.toLowerCase().includes(searchTerm.toLowerCase());
      
      let statusText: string = po.status;
      if (statusText === "จ่ายเงินแล้ว") statusText = "ชำระแล้ว";
      if (statusText === "รอรับของ" || statusText === "รอตรวจสอบ") statusText = "รอชำระ";

      const matchesStatus = filterStatus === "ทั้งหมด" || statusText === filterStatus;
      
      return matchesBranch && matchesSearch && matchesStatus;
    });
  }, [list, selectedBranchIds, searchTerm, filterStatus]);

  const stats = useMemo(() => {
    const total = filteredList.reduce((sum, po) => sum + (po.netAmount || 0), 0);
    const paid = filteredList.filter(po => po.status === "จ่ายเงินแล้ว").reduce((sum, po) => sum + (po.netAmount || 0), 0);
    const pending = total - paid;
    return { total, paid, pending };
  }, [filteredList]);

  const handleUpdateStatus = (id: string, newStatus: DeliveryPurchaseOrder["status"]) => {
    const updated = list.map(item => item.id === id ? { ...item, status: newStatus } : item);
    setList(updated);
    savePurchaseOrders(updated);
  };

  return (
    <div className="space-y-6 pb-20 p-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200 dark:shadow-emerald-900/20">
            <DollarSign className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white font-display">
              ชำระค่าซื้อน้ำมัน
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              ตรวจสอบและบันทึกการชำระเงินสำหรับใบสั่งซื้อน้ำมัน
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white/50 dark:bg-gray-800/50 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm backdrop-blur-sm">
          <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            สาขา: {selectedBranches.length === 0 ? "ทั้งหมด" : selectedBranches.map(id => branches.find(b => String(b.id) === id)?.name || id).join(", ")}
          </span>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ChartCard title="ยอดรวมทั้งหมดที่สั่งซื้อ" icon={CreditCard} className="shadow-lg border-none ring-1 ring-gray-100 dark:ring-gray-800">
          <div className="text-3xl font-bold text-gray-800 dark:text-white">{currencyFormatter.format(stats.total)}</div>
        </ChartCard>
        <ChartCard title="ชำระเงินแล้ว" icon={CheckCircle} className="shadow-lg border-none ring-1 ring-gray-100 dark:ring-gray-800">
          <div className="text-3xl font-bold text-emerald-600">{currencyFormatter.format(stats.paid)}</div>
        </ChartCard>
        <ChartCard title="ค้างชำระ" icon={Clock} className="shadow-lg border-none ring-1 ring-gray-100 dark:ring-gray-800">
          <div className="text-3xl font-bold text-orange-600">{currencyFormatter.format(stats.pending)}</div>
        </ChartCard>
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-4 flex flex-col md:flex-row gap-4 border border-gray-100 dark:border-gray-700"
      >
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="ค้นหา Approve No, Invoice No..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-gray-800 dark:text-white transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-gray-800 dark:text-white"
          >
            <option>ทั้งหมด</option>
            <option>ชำระแล้ว</option>
            <option>รอชำระ</option>
          </select>
        </div>
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
              <tr>
                <th className="py-4 px-6 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">สาขา</th>
                <th className="py-4 px-6 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">เลขที่ออเดอร์ (Approve/Invoice)</th>
                <th className="py-4 px-6 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">วันที่สั่งซื้อ</th>
                <th className="py-4 px-6 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">รายการสินค้า</th>
                <th className="py-4 px-6 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">ยอดเงินสุทธิ</th>
                <th className="py-4 px-6 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">สถานะ</th>
                <th className="py-4 px-6 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">การดำเนินการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredList.map((po) => (
                <tr key={po.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors">
                  <td className="py-4 px-6 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {branches.find(b => b.id === po.branchId)?.name || `สาขา ${po.branchId}`}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-gray-800 dark:text-white">{po.approveNo}</span>
                      <span className="text-xs text-gray-500">{po.invoiceNo}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Calendar className="w-4 h-4" />
                      {new Date(po.createdAt).toLocaleDateString("th-TH")}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex flex-wrap gap-1">
                      {po.items.map((item, idx) => (
                        <span key={idx} className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-gray-600 dark:text-gray-300">
                          {item.product}: {item.liters.toLocaleString()} ลิตร
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-right whitespace-nowrap">
                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                      {currencyFormatter.format(po.netAmount || 0)}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <StatusTag variant={po.status === "จ่ายเงินแล้ว" ? "success" : "warning"}>
                      {po.status === "จ่ายเงินแล้ว" ? "ชำระแล้ว" : "รอชำระ"}
                    </StatusTag>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-center gap-2">
                      {po.status !== "จ่ายเงินแล้ว" ? (
                        <button
                          onClick={() => handleUpdateStatus(po.id, "จ่ายเงินแล้ว")}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1 shadow-sm"
                        >
                          <CheckCircle className="w-3 h-3" /> ยืนยันชำระเงิน
                        </button>
                      ) : (
                        <button 
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-400 hover:text-blue-500 transition-colors"
                          title="ดูเอกสาร"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredList.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500 italic">
                    ไม่พบข้อมูลการสั่งซื้อ
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
