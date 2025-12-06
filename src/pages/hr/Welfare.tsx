import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Heart, 
  Package, 
  Gift, 
  Home as HomeIcon, 
  Fuel, 
  Plane, 
  Calendar as CalendarIcon,
  HeartHandshake,
  GraduationCap,
  Shield,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2
} from "lucide-react";
import ModalForm from "@/components/ModalForm";
import { employees, welfareRecords as initialWelfareRecords } from "@/data/mockData";

interface WelfareRecord {
  id: number;
  type: string;
  empCode: string;
  empName: string;
  category: string;
  item?: string;
  amount?: number;
  date: string;
  status: "รออนุมัติ" | "อนุมัติ" | "ปฏิเสธ";
  notes?: string;
}

export default function Welfare() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>("benefits");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [welfareRecords, setWelfareRecords] = useState<WelfareRecord[]>(initialWelfareRecords);
  const [formData, setFormData] = useState({
    type: "benefits",
    empCode: "",
    empName: "",
    category: "",
    item: "",
    amount: "",
    date: new Date().toISOString().split('T')[0],
    notes: ""
  });

  // Helper function to format date with day, month, year
  const formatDateDetailed = (dateString: string): string => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString; // Return original if invalid
      const day = date.getDate();
      const month = date.toLocaleDateString('th-TH', { month: 'long' });
      const year = date.getFullYear() + 543; // Convert to Buddhist Era
      const dayOfWeek = date.toLocaleDateString('th-TH', { weekday: 'long' });
      return `${dayOfWeek}ที่ ${day} ${month} ${year}`;
    } catch (error) {
      return dateString;
    }
  };

  // Helper function to format date short (for table display)
  const formatDateShort = (dateString: string): string => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString; // Return original if invalid
      const day = date.getDate();
      const month = date.toLocaleDateString('th-TH', { month: 'short' });
      const year = date.getFullYear() + 543;
      return `${day} ${month} ${year}`;
    } catch (error) {
      return dateString;
    }
  };

  const tabs = [
    { id: "benefits", label: "การเบิก", icon: Package },
    { id: "bonus", label: "BONUS รายปี", icon: Gift },
    { id: "dormitory", label: "หอพัก", icon: HomeIcon },
    { id: "fuel", label: "ค่าน้ำมัน", icon: Fuel },
    { id: "trip", label: "ทัศนศึกษาพาสุข", icon: Plane },
    { id: "holidays", label: "หยุดงานตามกฎหมาย", icon: CalendarIcon },
    { id: "condolence", label: "เยี่ยมไข้/คลอด/งานศพ", icon: HeartHandshake },
    { id: "scholarship", label: "ทุนการศึกษาบุตร", icon: GraduationCap },
    { id: "insurance", label: "ประกันชีวิตหัวหน้างาน", icon: Shield },
  ];

  // Filter records by active tab
  const filteredRecords = welfareRecords.filter(record => {
    const matchesTab = record.type === activeTab;
    const matchesSearch = !searchQuery || 
      record.empName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.empCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.item?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  // Handle employee selection
  const handleEmployeeSelect = (empCode: string) => {
    const employee = employees.find(e => e.code === empCode);
    if (employee) {
      setFormData({
        ...formData,
        empCode: employee.code,
        empName: employee.name,
        category: employee.category || ""
      });
    }
  };

  // Handle form submit
  const handleSubmit = () => {
    if (!formData.empCode || !formData.date) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    const newRecord: WelfareRecord = {
      id: welfareRecords.length > 0 ? Math.max(...welfareRecords.map(r => r.id)) + 1 : 1,
      type: formData.type,
      empCode: formData.empCode,
      empName: formData.empName,
      category: formData.category,
      item: formData.item || undefined,
      amount: formData.amount ? parseFloat(formData.amount) : undefined,
      date: formData.date,
      status: "รออนุมัติ",
      notes: formData.notes || undefined
    };

    setWelfareRecords([...welfareRecords, newRecord]);
    setIsModalOpen(false);
    setFormData({
      type: activeTab,
      empCode: "",
      empName: "",
      category: "",
      item: "",
      amount: "",
      date: new Date().toISOString().split('T')[0],
      notes: ""
    });
    alert("เพิ่มสวัสดิการสำเร็จ!");
  };

  // Handle delete
  const handleDelete = (id: number) => {
    if (confirm("คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้?")) {
      setWelfareRecords(welfareRecords.filter(r => r.id !== id));
    }
  };

  // Update form type when tab changes
  useEffect(() => {
    setFormData(prev => ({ ...prev, type: activeTab }));
  }, [activeTab]);

  // Statistics
  const stats = useMemo(() => {
    const filtered = filteredRecords;
    const totalAmount = filtered.reduce((sum, r) => sum + (r.amount || 0), 0);
    const approvedCount = filtered.filter(r => r.status === "อนุมัติ").length;
    const pendingCount = filtered.filter(r => r.status === "รออนุมัติ").length;
    const rejectedCount = filtered.filter(r => r.status === "ปฏิเสธ").length;
    return {
      totalRecords: filtered.length,
      totalAmount: totalAmount,
      approvedCount: approvedCount,
      pendingCount: pendingCount,
      rejectedCount: rejectedCount,
    };
  }, [filteredRecords]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-app mb-2 font-display flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-ptt-cyan/20 to-ptt-blue/20 rounded-xl flex items-center justify-center border border-ptt-cyan/30">
              <Heart className="w-7 h-7 text-ptt-cyan" />
            </div>
            สวัสดิการพนักงาน
          </h1>
          <p className="text-muted font-light ml-16">
            ระบบคลังสินค้าสวัสดิการ + เชื่อมประกันชีวิต
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate("/app/hr/welfare-stock")}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-ptt-cyan/20 to-ptt-blue/20 hover:from-ptt-cyan/30 hover:to-ptt-blue/30 
                     text-ptt-cyan rounded-xl transition-all duration-200 font-semibold 
                     border border-ptt-cyan/50 hover:shadow-lg hover:-translate-y-0.5"
          >
            <Package className="w-5 h-5" />
            สต๊อกสวัสดิการ
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-ptt-cyan to-ptt-blue hover:from-ptt-cyan/90 hover:to-ptt-blue/90 
                     text-app rounded-xl transition-all duration-200 font-semibold 
                     shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            <Plus className="w-5 h-5" />
            เพิ่มสวัสดิการ
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      {filteredRecords.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/30 rounded-xl p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-400" />
              </div>
            </div>
            <p className="text-muted text-sm mb-1">จำนวนรายการ</p>
            <p className="text-3xl font-bold text-app">{stats.totalRecords}</p>
            <p className="text-xs text-muted mt-2">รายการทั้งหมด</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/30 rounded-xl p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                <Gift className="w-6 h-6 text-green-400" />
              </div>
            </div>
            <p className="text-muted text-sm mb-1">อนุมัติแล้ว</p>
            <p className="text-3xl font-bold text-green-400">{stats.approvedCount}</p>
            <p className="text-xs text-muted mt-2">รายการที่อนุมัติ</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border border-yellow-500/30 rounded-xl p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                <CalendarIcon className="w-6 h-6 text-yellow-400" />
              </div>
            </div>
            <p className="text-muted text-sm mb-1">รออนุมัติ</p>
            <p className="text-3xl font-bold text-yellow-400">{stats.pendingCount}</p>
            <p className="text-xs text-muted mt-2">รายการที่รอ</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/30 rounded-xl p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <Gift className="w-6 h-6 text-purple-400" />
              </div>
            </div>
            <p className="text-muted text-sm mb-1">ยอดรวม</p>
            <p className="text-2xl font-bold text-app">
              {new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 }).format(stats.totalAmount)}
            </p>
            <p className="text-xs text-muted mt-2">ยอดเงินทั้งหมด</p>
          </motion.div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-soft border border-app rounded-2xl overflow-hidden shadow-lg">
        <div className="flex flex-wrap border-b border-app bg-soft overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-4 md:px-6 py-4 text-sm font-medium transition-all whitespace-nowrap
                  ${activeTab === tab.id
                    ? "text-ptt-cyan border-b-2 border-ptt-cyan bg-soft font-semibold"
                    : "text-muted hover:text-app hover:bg-soft/50"
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === "benefits" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-app font-display mb-2">การเบิกสวัสดิการ</h2>
                  <p className="text-sm text-muted">
                    จำนวนรายการ: <span className="font-semibold text-app">{filteredRecords.length}</span> รายการ
                    {filteredRecords.length > 0 && (
                      <>
                        {" | "}วันที่ล่าสุด: <span className="font-semibold text-ptt-cyan">{formatDateShort(filteredRecords.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].date)}</span>
                      </>
                    )}
                  </p>
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                    <input
                      type="text"
                      placeholder="ค้นหา..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2.5 bg-soft border border-app rounded-lg text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue w-full md:w-64"
                    />
                  </div>
                  <button className="px-4 py-2.5 bg-soft border border-app rounded-lg text-app hover:bg-soft/80 flex items-center gap-2 transition-colors">
                    <Filter className="w-4 h-4" />
                    <span className="hidden md:inline">กรอง</span>
                  </button>
                </div>
              </div>

              {/* Records Table */}
              {filteredRecords.length > 0 ? (
                <div className="overflow-x-auto rounded-xl border border-app">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-ptt-cyan/10 to-ptt-blue/10 border-b-2 border-ptt-cyan/30">
                      <tr>
                        <th className="px-4 py-4 text-left text-xs font-bold text-app uppercase tracking-wider min-w-[180px]">
                          <div className="flex items-center gap-1">
                            <CalendarIcon className="w-3 h-3" />
                            วัน เดือน ปี
                          </div>
                        </th>
                        <th className="px-4 py-4 text-left text-xs font-bold text-app uppercase tracking-wider">รหัส</th>
                        <th className="px-4 py-4 text-left text-xs font-bold text-app uppercase tracking-wider">ชื่อ-นามสกุล</th>
                        <th className="px-4 py-4 text-left text-xs font-bold text-app uppercase tracking-wider">แผนก</th>
                        <th className="px-4 py-4 text-left text-xs font-bold text-app uppercase tracking-wider">รายการ</th>
                        <th className="px-4 py-4 text-right text-xs font-bold text-app uppercase tracking-wider">จำนวนเงิน</th>
                        <th className="px-4 py-4 text-center text-xs font-bold text-app uppercase tracking-wider">สถานะ</th>
                        <th className="px-4 py-4 text-center text-xs font-bold text-app uppercase tracking-wider">จัดการ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-app/20">
                      {filteredRecords.map((record) => (
                        <motion.tr
                          key={record.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`hover:bg-soft/70 transition-colors ${
                            record.status === "อนุมัติ" ? "bg-green-500/5" :
                            record.status === "ปฏิเสธ" ? "bg-red-500/5" :
                            "bg-yellow-500/5"
                          }`}
                          title={`วันที่เบิก: ${formatDateDetailed(record.date)}`}
                        >
                          <td className="px-4 py-4 text-sm text-app min-w-[180px]">
                            {record.date ? (
                              <div className="flex flex-col gap-1">
                                <div className="font-semibold text-app text-sm whitespace-nowrap">
                                  {formatDateShort(record.date)}
                                </div>
                                <div className="text-[10px] text-muted leading-tight border-t border-app/20 pt-1">
                                  {formatDateDetailed(record.date)}
                                </div>
                              </div>
                            ) : (
                              <span className="text-muted italic text-xs">ไม่มีข้อมูลวันที่</span>
                            )}
                          </td>
                          <td className="px-4 py-4">
                            <span className="text-sm text-ptt-cyan font-semibold">{record.empCode}</span>
                          </td>
                          <td className="px-4 py-4">
                            <span className="text-sm text-app font-medium">{record.empName}</span>
                          </td>
                          <td className="px-4 py-4">
                            <span className="text-sm text-muted">{record.category}</span>
                          </td>
                          <td className="px-4 py-4">
                            <span className="text-sm text-app">{record.item || "-"}</span>
                          </td>
                          <td className="px-4 py-4 text-right">
                            {record.amount ? (
                              <span className="text-sm font-bold text-app font-mono">
                                {new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(record.amount)}
                              </span>
                            ) : (
                              <span className="text-sm text-muted">-</span>
                            )}
                          </td>
                          <td className="px-4 py-4 text-center">
                            <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold ${
                              record.status === "อนุมัติ" ? "bg-green-500/20 text-green-400 border border-green-500/30" :
                              record.status === "ปฏิเสธ" ? "bg-red-500/20 text-red-400 border border-red-500/30" :
                              "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                            }`}>
                              {record.status === "อนุมัติ" && "✓ "}
                              {record.status === "ปฏิเสธ" && "✗ "}
                              {record.status === "รออนุมัติ" && "⏳ "}
                              {record.status}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button 
                                className="p-2 hover:bg-ptt-cyan/20 rounded-lg transition-colors" 
                                title="แก้ไข"
                              >
                                <Edit2 className="w-4 h-4 text-ptt-cyan" />
                              </button>
                              <button 
                                onClick={() => handleDelete(record.id)}
                                className="p-2 hover:bg-red-500/20 rounded-lg transition-colors" 
                                title="ลบ"
                              >
                                <Trash2 className="w-4 h-4 text-red-400" />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-16 bg-soft/30 rounded-xl border-2 border-dashed border-app">
                  <Package className="w-16 h-16 text-muted mx-auto mb-4 opacity-50" />
                  <p className="text-muted font-light text-lg mb-2">ยังไม่มีรายการเบิกสวัสดิการ</p>
                  <p className="text-xs text-muted">คลิกปุ่ม "เพิ่มสวัสดิการ" เพื่อเพิ่มรายการใหม่</p>
                </div>
              )}

              {/* Info Cards */}
              <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-xl p-6 mb-6 shadow-lg">
                <h3 className="text-base font-bold text-app mb-3 flex items-center gap-2">
                  <div className="w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                    <Package className="w-5 h-5 text-cyan-400" />
                  </div>
                  สวัสดิการชุดยูนิฟอร์มพนักงาน
                </h3>
                <ul className="text-sm text-muted space-y-2 ml-10 list-disc">
                  <li className="flex items-start gap-2">
                    <span className="font-semibold text-app">อายุงาน 6 เดือนขึ้นไป:</span>
                    <span>ได้รับยูนิฟอร์ม 1 ชุด</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-semibold text-app">อายุงาน 1 ปีขึ้นไป:</span>
                    <span>ได้รับยูนิฟอร์ม 2 ชุด</span>
                  </li>
                </ul>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/30 rounded-xl p-6 hover:shadow-xl transition-all hover:-translate-y-1"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-14 h-14 bg-blue-500/20 rounded-xl flex items-center justify-center">
                      <Package className="w-7 h-7 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-app text-lg">ชุดฟอร์ม</h3>
                      <p className="text-xs text-muted font-medium">เบิกได้</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted leading-relaxed">เบิกชุดฟอร์มสำหรับพนักงานทุกแผนก</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                  className="bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/30 rounded-xl p-6 hover:shadow-xl transition-all hover:-translate-y-1"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-14 h-14 bg-green-500/20 rounded-xl flex items-center justify-center">
                      <Package className="w-7 h-7 text-green-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-app text-lg">เสื้อกันหนาว</h3>
                      <p className="text-xs text-muted font-medium">ทุกแผนก</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted leading-relaxed">เบิกเสื้อกันหนาวสำหรับทุกแผนก</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/30 rounded-xl p-6 hover:shadow-xl transition-all hover:-translate-y-1"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-14 h-14 bg-purple-500/20 rounded-xl flex items-center justify-center">
                      <Package className="w-7 h-7 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-app text-lg">รองเท้า</h3>
                      <p className="text-xs text-muted font-medium">เบิกได้</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted leading-relaxed">เบิกรองเท้าสำหรับพนักงาน</p>
                </motion.div>
              </div>
            </motion.div>
          )}

          {activeTab === "bonus" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-app font-display mb-2">สวัสดิการโบนัสประจำปี</h2>
                  <p className="text-sm text-muted">
                    จำนวนรายการ: <span className="font-semibold text-app">{filteredRecords.length}</span> รายการ
                    {filteredRecords.length > 0 && (
                      <>
                        {" | "}วันที่ล่าสุด: <span className="font-semibold text-ptt-cyan">{formatDateShort(filteredRecords.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].date)}</span>
                      </>
                    )}
                  </p>
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                    <input
                      type="text"
                      placeholder="ค้นหา..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2.5 bg-soft border border-app rounded-lg text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue w-full md:w-64"
                    />
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/30 rounded-xl p-6 mb-6 shadow-lg">
                <h3 className="text-base font-bold text-app mb-3 flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <Gift className="w-5 h-5 text-blue-400" />
                  </div>
                  เงื่อนไขการรับโบนัสประจำปี
                </h3>
                <ul className="text-sm text-muted space-y-2 ml-10 list-disc">
                  <li>พนักงานที่ทำงานในบริษัทครบตามคุณสมบัติ จะได้รับโบนัสประจำปี</li>
                  <li>สามารถแจ้งความประสงค์เพื่อรับโบนัสได้ตามประกาศบริษัท</li>
                </ul>
              </div>
              
              {filteredRecords.length > 0 ? (
                <div className="overflow-x-auto rounded-xl border border-app mt-4">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border-b-2 border-blue-500/30">
                      <tr>
                        <th className="px-4 py-4 text-left text-xs font-bold text-app uppercase tracking-wider min-w-[180px]">
                          <div className="flex items-center gap-1">
                            <CalendarIcon className="w-3 h-3" />
                            วัน เดือน ปี
                          </div>
                        </th>
                        <th className="px-4 py-4 text-left text-xs font-bold text-app uppercase tracking-wider">รหัส</th>
                        <th className="px-4 py-4 text-left text-xs font-bold text-app uppercase tracking-wider">ชื่อ-นามสกุล</th>
                        <th className="px-4 py-4 text-left text-xs font-bold text-app uppercase tracking-wider">แผนก</th>
                        <th className="px-4 py-4 text-right text-xs font-bold text-app uppercase tracking-wider">จำนวนเงิน</th>
                        <th className="px-4 py-4 text-center text-xs font-bold text-app uppercase tracking-wider">สถานะ</th>
                        <th className="px-4 py-4 text-center text-xs font-bold text-app uppercase tracking-wider">จัดการ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-app/20">
                      {filteredRecords.map((record) => (
                        <motion.tr
                          key={record.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`hover:bg-soft/70 transition-colors ${
                            record.status === "อนุมัติ" ? "bg-green-500/5" :
                            record.status === "ปฏิเสธ" ? "bg-red-500/5" :
                            "bg-yellow-500/5"
                          }`}
                          title={`วันที่เบิก: ${formatDateDetailed(record.date)}`}
                        >
                          <td className="px-4 py-4 text-sm text-app min-w-[180px]">
                            {record.date ? (
                              <div className="flex flex-col gap-1">
                                <div className="font-semibold text-app text-sm whitespace-nowrap">
                                  {formatDateShort(record.date)}
                                </div>
                                <div className="text-[10px] text-muted leading-tight border-t border-app/20 pt-1">
                                  {formatDateDetailed(record.date)}
                                </div>
                              </div>
                            ) : (
                              <span className="text-muted italic text-xs">ไม่มีข้อมูลวันที่</span>
                            )}
                          </td>
                          <td className="px-4 py-4">
                            <span className="text-sm text-ptt-cyan font-semibold">{record.empCode}</span>
                          </td>
                          <td className="px-4 py-4">
                            <span className="text-sm text-app font-medium">{record.empName}</span>
                          </td>
                          <td className="px-4 py-4">
                            <span className="text-sm text-muted">{record.category}</span>
                          </td>
                          <td className="px-4 py-4 text-right">
                            {record.amount ? (
                              <span className="text-sm font-bold text-app font-mono">
                                {new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(record.amount)}
                              </span>
                            ) : (
                              <span className="text-sm text-muted">-</span>
                            )}
                          </td>
                          <td className="px-4 py-4 text-center">
                            <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold ${
                              record.status === "อนุมัติ" ? "bg-green-500/20 text-green-400 border border-green-500/30" :
                              record.status === "ปฏิเสธ" ? "bg-red-500/20 text-red-400 border border-red-500/30" :
                              "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                            }`}>
                              {record.status === "อนุมัติ" && "✓ "}
                              {record.status === "ปฏิเสธ" && "✗ "}
                              {record.status === "รออนุมัติ" && "⏳ "}
                              {record.status}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button 
                                className="p-2 hover:bg-ptt-cyan/20 rounded-lg transition-colors" 
                                title="แก้ไข"
                              >
                                <Edit2 className="w-4 h-4 text-ptt-cyan" />
                              </button>
                              <button 
                                onClick={() => handleDelete(record.id)}
                                className="p-2 hover:bg-red-500/20 rounded-lg transition-colors" 
                                title="ลบ"
                              >
                                <Trash2 className="w-4 h-4 text-red-400" />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-16 bg-soft/30 rounded-xl border-2 border-dashed border-app mt-4">
                  <Gift className="w-16 h-16 text-muted mx-auto mb-4 opacity-50" />
                  <p className="text-muted font-light text-lg mb-2">ยังไม่มีรายการโบนัส</p>
                  <p className="text-xs text-muted">คลิกปุ่ม "เพิ่มสวัสดิการ" เพื่อเพิ่มรายการใหม่</p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "dormitory" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-app font-display mb-2">สวัสดิการหอพัก</h2>
                  <p className="text-sm text-muted">
                    จำนวนรายการ: <span className="font-semibold text-app">{filteredRecords.length}</span> รายการ
                    {filteredRecords.length > 0 && (
                      <>
                        {" | "}วันที่ล่าสุด: <span className="font-semibold text-ptt-cyan">{formatDateShort(filteredRecords.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].date)}</span>
                      </>
                    )}
                  </p>
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                    <input
                      type="text"
                      placeholder="ค้นหา..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2.5 bg-soft border border-app rounded-lg text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue w-full md:w-64"
                    />
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl p-6 mb-6 shadow-lg">
                <h3 className="text-base font-bold text-app mb-3 flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <HomeIcon className="w-5 h-5 text-green-400" />
                  </div>
                  เงื่อนไขการเข้าพักหอพัก
                </h3>
                <ul className="text-sm text-muted space-y-2 ml-10 list-disc">
                  <li>ต้องเป็นพนักงานของบริษัทที่มีอายุงานตั้งแต่ 1 เดือนขึ้นไป</li>
                  <li>สามารถแจ้งความประสงค์เข้าพักได้</li>
                  <li>พักฟรี + จ่ายน้ำ/ไฟ (ระบุในระบบว่าใครใช้ + รวมบุคคลภายนอก)</li>
                </ul>
              </div>
              
              {filteredRecords.length > 0 ? (
                <div className="overflow-x-auto rounded-xl border border-app mt-4">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-b-2 border-green-500/30">
                      <tr>
                        <th className="px-4 py-4 text-left text-xs font-bold text-app uppercase tracking-wider min-w-[180px]">
                          <div className="flex items-center gap-1">
                            <CalendarIcon className="w-3 h-3" />
                            วัน เดือน ปี
                          </div>
                        </th>
                        <th className="px-4 py-4 text-left text-xs font-bold text-app uppercase tracking-wider">รหัส</th>
                        <th className="px-4 py-4 text-left text-xs font-bold text-app uppercase tracking-wider">ชื่อ-นามสกุล</th>
                        <th className="px-4 py-4 text-left text-xs font-bold text-app uppercase tracking-wider">แผนก</th>
                        <th className="px-4 py-4 text-center text-xs font-bold text-app uppercase tracking-wider">สถานะ</th>
                        <th className="px-4 py-4 text-center text-xs font-bold text-app uppercase tracking-wider">จัดการ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-app/20">
                      {filteredRecords.map((record) => (
                        <motion.tr
                          key={record.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`hover:bg-soft/70 transition-colors ${
                            record.status === "อนุมัติ" ? "bg-green-500/5" :
                            record.status === "ปฏิเสธ" ? "bg-red-500/5" :
                            "bg-yellow-500/5"
                          }`}
                          title={`วันที่เบิก: ${formatDateDetailed(record.date)}`}
                        >
                          <td className="px-4 py-4 text-sm text-app min-w-[180px]">
                            {record.date ? (
                              <div className="flex flex-col gap-1">
                                <div className="font-semibold text-app text-sm whitespace-nowrap">
                                  {formatDateShort(record.date)}
                                </div>
                                <div className="text-[10px] text-muted leading-tight border-t border-app/20 pt-1">
                                  {formatDateDetailed(record.date)}
                                </div>
                              </div>
                            ) : (
                              <span className="text-muted italic text-xs">ไม่มีข้อมูลวันที่</span>
                            )}
                          </td>
                          <td className="px-4 py-4">
                            <span className="text-sm text-ptt-cyan font-semibold">{record.empCode}</span>
                          </td>
                          <td className="px-4 py-4">
                            <span className="text-sm text-app font-medium">{record.empName}</span>
                          </td>
                          <td className="px-4 py-4">
                            <span className="text-sm text-muted">{record.category}</span>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold ${
                              record.status === "อนุมัติ" ? "bg-green-500/20 text-green-400 border border-green-500/30" :
                              record.status === "ปฏิเสธ" ? "bg-red-500/20 text-red-400 border border-red-500/30" :
                              "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                            }`}>
                              {record.status === "อนุมัติ" && "✓ "}
                              {record.status === "ปฏิเสธ" && "✗ "}
                              {record.status === "รออนุมัติ" && "⏳ "}
                              {record.status}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button 
                                className="p-2 hover:bg-ptt-cyan/20 rounded-lg transition-colors" 
                                title="แก้ไข"
                              >
                                <Edit2 className="w-4 h-4 text-ptt-cyan" />
                              </button>
                              <button 
                                onClick={() => handleDelete(record.id)}
                                className="p-2 hover:bg-red-500/20 rounded-lg transition-colors" 
                                title="ลบ"
                              >
                                <Trash2 className="w-4 h-4 text-red-400" />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-16 bg-soft/30 rounded-xl border-2 border-dashed border-app mt-4">
                  <HomeIcon className="w-16 h-16 text-muted mx-auto mb-4 opacity-50" />
                  <p className="text-muted font-light text-lg mb-2">ยังไม่มีรายการหอพัก</p>
                  <p className="text-xs text-muted">คลิกปุ่ม "เพิ่มสวัสดิการ" เพื่อเพิ่มรายการใหม่</p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "fuel" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-app font-display mb-2">ค่าน้ำมัน</h2>
                  <p className="text-sm text-muted">
                    จำนวนรายการ: <span className="font-semibold text-app">{filteredRecords.length}</span> รายการ
                    {filteredRecords.length > 0 && (
                      <>
                        {" | "}วันที่ล่าสุด: <span className="font-semibold text-ptt-cyan">{formatDateShort(filteredRecords.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].date)}</span>
                      </>
                    )}
                  </p>
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                    <input
                      type="text"
                      placeholder="ค้นหา..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2.5 bg-soft border border-app rounded-lg text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue w-full md:w-64"
                    />
                  </div>
                </div>
              </div>
              <p className="text-muted">เบิกได้</p>
              
              {filteredRecords.length > 0 ? (
                <div className="overflow-x-auto rounded-xl border border-app mt-4">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-orange-500/10 to-amber-500/10 border-b-2 border-orange-500/30">
                      <tr>
                        <th className="px-4 py-4 text-left text-xs font-bold text-app uppercase tracking-wider min-w-[180px]">
                          <div className="flex items-center gap-1">
                            <CalendarIcon className="w-3 h-3" />
                            วัน เดือน ปี
                          </div>
                        </th>
                        <th className="px-4 py-4 text-left text-xs font-bold text-app uppercase tracking-wider">รหัส</th>
                        <th className="px-4 py-4 text-left text-xs font-bold text-app uppercase tracking-wider">ชื่อ-นามสกุล</th>
                        <th className="px-4 py-4 text-left text-xs font-bold text-app uppercase tracking-wider">แผนก</th>
                        <th className="px-4 py-4 text-left text-xs font-bold text-app uppercase tracking-wider">รายการ</th>
                        <th className="px-4 py-4 text-right text-xs font-bold text-app uppercase tracking-wider">จำนวนเงิน</th>
                        <th className="px-4 py-4 text-center text-xs font-bold text-app uppercase tracking-wider">สถานะ</th>
                        <th className="px-4 py-4 text-center text-xs font-bold text-app uppercase tracking-wider">จัดการ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-app/20">
                      {filteredRecords.map((record) => (
                        <motion.tr
                          key={record.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`hover:bg-soft/70 transition-colors ${
                            record.status === "อนุมัติ" ? "bg-green-500/5" :
                            record.status === "ปฏิเสธ" ? "bg-red-500/5" :
                            "bg-yellow-500/5"
                          }`}
                          title={`วันที่เบิก: ${formatDateDetailed(record.date)}`}
                        >
                          <td className="px-4 py-4 text-sm text-app min-w-[180px]">
                            {record.date ? (
                              <div className="flex flex-col gap-1">
                                <div className="font-semibold text-app text-sm whitespace-nowrap">
                                  {formatDateShort(record.date)}
                                </div>
                                <div className="text-[10px] text-muted leading-tight border-t border-app/20 pt-1">
                                  {formatDateDetailed(record.date)}
                                </div>
                              </div>
                            ) : (
                              <span className="text-muted italic text-xs">ไม่มีข้อมูลวันที่</span>
                            )}
                          </td>
                          <td className="px-4 py-4">
                            <span className="text-sm text-ptt-cyan font-semibold">{record.empCode}</span>
                          </td>
                          <td className="px-4 py-4">
                            <span className="text-sm text-app font-medium">{record.empName}</span>
                          </td>
                          <td className="px-4 py-4">
                            <span className="text-sm text-muted">{record.category}</span>
                          </td>
                          <td className="px-4 py-4">
                            <span className="text-sm text-app">{record.item || "-"}</span>
                          </td>
                          <td className="px-4 py-4 text-right">
                            {record.amount ? (
                              <span className="text-sm font-bold text-app font-mono">
                                {new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(record.amount)}
                              </span>
                            ) : (
                              <span className="text-sm text-muted">-</span>
                            )}
                          </td>
                          <td className="px-4 py-4 text-center">
                            <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold ${
                              record.status === "อนุมัติ" ? "bg-green-500/20 text-green-400 border border-green-500/30" :
                              record.status === "ปฏิเสธ" ? "bg-red-500/20 text-red-400 border border-red-500/30" :
                              "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                            }`}>
                              {record.status === "อนุมัติ" && "✓ "}
                              {record.status === "ปฏิเสธ" && "✗ "}
                              {record.status === "รออนุมัติ" && "⏳ "}
                              {record.status}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button 
                                className="p-2 hover:bg-ptt-cyan/20 rounded-lg transition-colors" 
                                title="แก้ไข"
                              >
                                <Edit2 className="w-4 h-4 text-ptt-cyan" />
                              </button>
                              <button 
                                onClick={() => handleDelete(record.id)}
                                className="p-2 hover:bg-red-500/20 rounded-lg transition-colors" 
                                title="ลบ"
                              >
                                <Trash2 className="w-4 h-4 text-red-400" />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-16 bg-soft/30 rounded-xl border-2 border-dashed border-app mt-4">
                  <Fuel className="w-16 h-16 text-muted mx-auto mb-4 opacity-50" />
                  <p className="text-muted font-light text-lg mb-2">ยังไม่มีรายการเบิกค่าน้ำมัน</p>
                  <p className="text-xs text-muted">คลิกปุ่ม "เพิ่มสวัสดิการ" เพื่อเพิ่มรายการใหม่</p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "trip" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-app font-display mb-2">สวัสดิการทัศนศึกษาพาสุข</h2>
                  <p className="text-sm text-muted">
                    จำนวนรายการ: <span className="font-semibold text-app">{filteredRecords.length}</span> รายการ
                    {filteredRecords.length > 0 && (
                      <>
                        {" | "}วันที่ล่าสุด: <span className="font-semibold text-ptt-cyan">{formatDateShort(filteredRecords.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].date)}</span>
                      </>
                    )}
                  </p>
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                    <input
                      type="text"
                      placeholder="ค้นหา..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2.5 bg-soft border border-app rounded-lg text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue w-full md:w-64"
                    />
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-6 mb-6 shadow-lg">
                <h3 className="text-base font-bold text-app mb-3 flex items-center gap-2">
                  <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <Plane className="w-5 h-5 text-purple-400" />
                  </div>
                  เงื่อนไขการเข้าร่วมทัศนศึกษา
                </h3>
                <ul className="text-sm text-muted space-y-2 ml-10 list-disc">
                  <li>ต้องมีอายุงานตั้งแต่ 1 ปีขึ้นไป</li>
                  <li>สามารถนำผู้ติดตามเข้าร่วมได้ 1 คน</li>
                  <li>เที่ยวใน/นอกประเทศ (ตามตำแหน่ง/ผลงาน)</li>
                </ul>
              </div>
              
              {filteredRecords.length > 0 ? (
                <div className="overflow-x-auto rounded-xl border border-app mt-4">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-b-2 border-purple-500/30">
                      <tr>
                        <th className="px-4 py-4 text-left text-xs font-bold text-app uppercase tracking-wider min-w-[180px]">
                          <div className="flex items-center gap-1">
                            <CalendarIcon className="w-3 h-3" />
                            วัน เดือน ปี
                          </div>
                        </th>
                        <th className="px-4 py-4 text-left text-xs font-bold text-app uppercase tracking-wider">รหัส</th>
                        <th className="px-4 py-4 text-left text-xs font-bold text-app uppercase tracking-wider">ชื่อ-นามสกุล</th>
                        <th className="px-4 py-4 text-left text-xs font-bold text-app uppercase tracking-wider">แผนก</th>
                        <th className="px-4 py-4 text-center text-xs font-bold text-app uppercase tracking-wider">สถานะ</th>
                        <th className="px-4 py-4 text-center text-xs font-bold text-app uppercase tracking-wider">จัดการ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-app/20">
                      {filteredRecords.map((record) => (
                        <motion.tr
                          key={record.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`hover:bg-soft/70 transition-colors ${
                            record.status === "อนุมัติ" ? "bg-green-500/5" :
                            record.status === "ปฏิเสธ" ? "bg-red-500/5" :
                            "bg-yellow-500/5"
                          }`}
                          title={`วันที่เบิก: ${formatDateDetailed(record.date)}`}
                        >
                          <td className="px-4 py-4 text-sm text-app min-w-[180px]">
                            {record.date ? (
                              <div className="flex flex-col gap-1">
                                <div className="font-semibold text-app text-sm whitespace-nowrap">
                                  {formatDateShort(record.date)}
                                </div>
                                <div className="text-[10px] text-muted leading-tight border-t border-app/20 pt-1">
                                  {formatDateDetailed(record.date)}
                                </div>
                              </div>
                            ) : (
                              <span className="text-muted italic text-xs">ไม่มีข้อมูลวันที่</span>
                            )}
                          </td>
                          <td className="px-4 py-4">
                            <span className="text-sm text-ptt-cyan font-semibold">{record.empCode}</span>
                          </td>
                          <td className="px-4 py-4">
                            <span className="text-sm text-app font-medium">{record.empName}</span>
                          </td>
                          <td className="px-4 py-4">
                            <span className="text-sm text-muted">{record.category}</span>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold ${
                              record.status === "อนุมัติ" ? "bg-green-500/20 text-green-400 border border-green-500/30" :
                              record.status === "ปฏิเสธ" ? "bg-red-500/20 text-red-400 border border-red-500/30" :
                              "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                            }`}>
                              {record.status === "อนุมัติ" && "✓ "}
                              {record.status === "ปฏิเสธ" && "✗ "}
                              {record.status === "รออนุมัติ" && "⏳ "}
                              {record.status}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button 
                                className="p-2 hover:bg-ptt-cyan/20 rounded-lg transition-colors" 
                                title="แก้ไข"
                              >
                                <Edit2 className="w-4 h-4 text-ptt-cyan" />
                              </button>
                              <button 
                                onClick={() => handleDelete(record.id)}
                                className="p-2 hover:bg-red-500/20 rounded-lg transition-colors" 
                                title="ลบ"
                              >
                                <Trash2 className="w-4 h-4 text-red-400" />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-16 bg-soft/30 rounded-xl border-2 border-dashed border-app mt-4">
                  <Plane className="w-16 h-16 text-muted mx-auto mb-4 opacity-50" />
                  <p className="text-muted font-light text-lg mb-2">ยังไม่มีรายการทัศนศึกษา</p>
                  <p className="text-xs text-muted">คลิกปุ่ม "เพิ่มสวัสดิการ" เพื่อเพิ่มรายการใหม่</p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "holidays" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <h2 className="text-xl font-semibold text-app font-display">วันหยุดตามกฎหมายแรงงาน</h2>
              <div className="bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/30 rounded-xl p-6 mb-6 shadow-lg">
                <h3 className="text-base font-bold text-app mb-3 flex items-center gap-2">
                  <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
                    <CalendarIcon className="w-5 h-5 text-orange-400" />
                  </div>
                  ข้อมูลวันหยุดตามกฎหมาย
                </h3>
                <ul className="text-sm text-muted space-y-2 ml-10 list-disc">
                  <li>บริษัทกำหนดให้จำนวน 13 วันต่อปี</li>
                  <li>วันหยุดเป็นไปตามประกาศของบริษัท</li>
                  <li>หยุด 13 วัน/ปี: ตามปฏิทินปั๊มกำหนด + วันอื่นๆ (แรงงาน, ปิยมหาราช, สวรรคต)</li>
                  <li>ยกเว้น: สงกรานต์/ปีใหม่ → อยู่ทำงานได้เงินพิเศษ (รอบละ 5 วัน)</li>
                </ul>
              </div>
            </motion.div>
          )}

          {activeTab === "condolence" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-app font-display mb-2">เยี่ยมไข้/คลอด/งานศพ</h2>
                  <p className="text-sm text-muted">
                    จำนวนรายการ: <span className="font-semibold text-app">{filteredRecords.length}</span> รายการ
                    {filteredRecords.length > 0 && (
                      <>
                        {" | "}วันที่ล่าสุด: <span className="font-semibold text-ptt-cyan">{formatDateShort(filteredRecords.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].date)}</span>
                      </>
                    )}
                  </p>
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                    <input
                      type="text"
                      placeholder="ค้นหา..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2.5 bg-soft border border-app rounded-lg text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue w-full md:w-64"
                    />
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-r from-red-500/10 to-rose-500/10 border border-red-500/30 rounded-xl p-6 mb-6 shadow-lg">
                <h3 className="text-base font-bold text-app mb-3 flex items-center gap-2">
                  <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center">
                    <HeartHandshake className="w-5 h-5 text-red-400" />
                  </div>
                  สวัสดิการเยี่ยมไข้กรณีเจ็บป่วย
                </h3>
                <ul className="text-sm text-muted space-y-2 ml-10 list-disc mb-6">
                  <li>พนักงานทุกคนที่ปฏิบัติงานในสาขาของบริษัท จะได้รับสวัสดิการเยี่ยมไข้</li>
                  <li>วงเงิน 200–250 บาทต่อคนต่อครั้ง</li>
                </ul>
                <h3 className="text-base font-bold text-app mb-3 mt-6 flex items-center gap-2">
                  <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center">
                    <HeartHandshake className="w-5 h-5 text-red-400" />
                  </div>
                  สวัสดิการกรณีงานศพ
                </h3>
                <div className="text-sm text-muted space-y-3 ml-10">
                  <div>
                    <p className="font-semibold text-app mb-2">กรณีทำบุญงานศพในนามองค์กร (เฉพาะญาติสายตรง สายเลือดเดียวกัน)</p>
                    <ul className="list-disc ml-4 space-y-2">
                      <li><strong className="text-app">บิดา / มารดา / บุตร:</strong> ใส่ซอง 3,000 บาท | บริษัทเป็นเจ้าภาพงาน 1 วัน | พวงหรีด 1 ชิ้น</li>
                      <li><strong className="text-app">พี่ / น้อง (พ่อ–แม่เดียวกัน):</strong> ใส่ซอง 1,000 บาท</li>
                    </ul>
                  </div>
                  <div className="mt-3 p-3 bg-app/5 rounded-lg border border-app/20">
                    <p className="font-semibold text-app mb-1">กรณีญาติอื่น ๆ</p>
                    <p>ถือเป็นเรื่องส่วนตัวของเพื่อนร่วมงาน ไม่สามารถเบิกในนามองค์กรได้</p>
                  </div>
                </div>
              </div>
              
              {filteredRecords.length > 0 ? (
                <div className="overflow-x-auto rounded-xl border border-app mt-4">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-red-500/10 to-rose-500/10 border-b-2 border-red-500/30">
                      <tr>
                        <th className="px-4 py-4 text-left text-xs font-bold text-app uppercase tracking-wider min-w-[180px]">
                          <div className="flex items-center gap-1">
                            <CalendarIcon className="w-3 h-3" />
                            วัน เดือน ปี
                          </div>
                        </th>
                        <th className="px-4 py-4 text-left text-xs font-bold text-app uppercase tracking-wider">รหัส</th>
                        <th className="px-4 py-4 text-left text-xs font-bold text-app uppercase tracking-wider">ชื่อ-นามสกุล</th>
                        <th className="px-4 py-4 text-left text-xs font-bold text-app uppercase tracking-wider">แผนก</th>
                        <th className="px-4 py-4 text-right text-xs font-bold text-app uppercase tracking-wider">จำนวนเงิน</th>
                        <th className="px-4 py-4 text-center text-xs font-bold text-app uppercase tracking-wider">สถานะ</th>
                        <th className="px-4 py-4 text-center text-xs font-bold text-app uppercase tracking-wider">จัดการ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-app/20">
                      {filteredRecords.map((record) => (
                        <motion.tr
                          key={record.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`hover:bg-soft/70 transition-colors ${
                            record.status === "อนุมัติ" ? "bg-green-500/5" :
                            record.status === "ปฏิเสธ" ? "bg-red-500/5" :
                            "bg-yellow-500/5"
                          }`}
                          title={`วันที่เบิก: ${formatDateDetailed(record.date)}`}
                        >
                          <td className="px-4 py-4 text-sm text-app min-w-[180px]">
                            {record.date ? (
                              <div className="flex flex-col gap-1">
                                <div className="font-semibold text-app text-sm whitespace-nowrap">
                                  {formatDateShort(record.date)}
                                </div>
                                <div className="text-[10px] text-muted leading-tight border-t border-app/20 pt-1">
                                  {formatDateDetailed(record.date)}
                                </div>
                              </div>
                            ) : (
                              <span className="text-muted italic text-xs">ไม่มีข้อมูลวันที่</span>
                            )}
                          </td>
                          <td className="px-4 py-4">
                            <span className="text-sm text-ptt-cyan font-semibold">{record.empCode}</span>
                          </td>
                          <td className="px-4 py-4">
                            <span className="text-sm text-app font-medium">{record.empName}</span>
                          </td>
                          <td className="px-4 py-4">
                            <span className="text-sm text-muted">{record.category}</span>
                          </td>
                          <td className="px-4 py-4 text-right">
                            {record.amount ? (
                              <span className="text-sm font-bold text-app font-mono">
                                {new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(record.amount)}
                              </span>
                            ) : (
                              <span className="text-sm text-muted">-</span>
                            )}
                          </td>
                          <td className="px-4 py-4 text-center">
                            <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold ${
                              record.status === "อนุมัติ" ? "bg-green-500/20 text-green-400 border border-green-500/30" :
                              record.status === "ปฏิเสธ" ? "bg-red-500/20 text-red-400 border border-red-500/30" :
                              "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                            }`}>
                              {record.status === "อนุมัติ" && "✓ "}
                              {record.status === "ปฏิเสธ" && "✗ "}
                              {record.status === "รออนุมัติ" && "⏳ "}
                              {record.status}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button 
                                className="p-2 hover:bg-ptt-cyan/20 rounded-lg transition-colors" 
                                title="แก้ไข"
                              >
                                <Edit2 className="w-4 h-4 text-ptt-cyan" />
                              </button>
                              <button 
                                onClick={() => handleDelete(record.id)}
                                className="p-2 hover:bg-red-500/20 rounded-lg transition-colors" 
                                title="ลบ"
                              >
                                <Trash2 className="w-4 h-4 text-red-400" />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-16 bg-soft/30 rounded-xl border-2 border-dashed border-app mt-4">
                  <HeartHandshake className="w-16 h-16 text-muted mx-auto mb-4 opacity-50" />
                  <p className="text-muted font-light text-lg mb-2">ยังไม่มีรายการเยี่ยมไข้/คลอด/งานศพ</p>
                  <p className="text-xs text-muted">คลิกปุ่ม "เพิ่มสวัสดิการ" เพื่อเพิ่มรายการใหม่</p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "scholarship" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-app font-display mb-2">สวัสดิการทุนการศึกษา (ทัศนคติทุนการศึกษา)</h2>
                  <p className="text-sm text-muted">
                    จำนวนรายการ: <span className="font-semibold text-app">{filteredRecords.length}</span> รายการ
                    {filteredRecords.length > 0 && (
                      <>
                        {" | "}วันที่ล่าสุด: <span className="font-semibold text-ptt-cyan">{formatDateShort(filteredRecords.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].date)}</span>
                      </>
                    )}
                  </p>
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                    <input
                      type="text"
                      placeholder="ค้นหา..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2.5 bg-soft border border-app rounded-lg text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue w-full md:w-64"
                    />
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-r from-indigo-500/10 to-violet-500/10 border border-indigo-500/30 rounded-xl p-6 mb-6 shadow-lg">
                <h3 className="text-base font-bold text-app mb-3 flex items-center gap-2">
                  <div className="w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center">
                    <GraduationCap className="w-5 h-5 text-indigo-400" />
                  </div>
                  เงื่อนไขการรับทุนการศึกษา
                </h3>
                <ul className="text-sm text-muted space-y-2 ml-10 list-disc">
                  <li>อายุงาน 1 ปีขึ้นไป : สามารถนำบุตรเข้ารับทุนได้ 2 คน</li>
                  <li>อายุงาน 6 เดือนขึ้นไป : สามารถนำบุตรเข้ารับทุนได้ 1 คน</li>
                  <li>ขีดจำกัด: พนักงาน 1 คนขอ 1 บุตร / บริษัทปีละ 2 คน (6 เดือนละ 1)</li>
                  <li>เงิน: ตามระดับการศึกษา</li>
                </ul>
              </div>
              
              {filteredRecords.length > 0 ? (
                <div className="overflow-x-auto rounded-xl border border-app mt-4">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-indigo-500/10 to-violet-500/10 border-b-2 border-indigo-500/30">
                      <tr>
                        <th className="px-4 py-4 text-left text-xs font-bold text-app uppercase tracking-wider min-w-[180px]">
                          <div className="flex items-center gap-1">
                            <CalendarIcon className="w-3 h-3" />
                            วัน เดือน ปี
                          </div>
                        </th>
                        <th className="px-4 py-4 text-left text-xs font-bold text-app uppercase tracking-wider">รหัส</th>
                        <th className="px-4 py-4 text-left text-xs font-bold text-app uppercase tracking-wider">ชื่อ-นามสกุล</th>
                        <th className="px-4 py-4 text-left text-xs font-bold text-app uppercase tracking-wider">แผนก</th>
                        <th className="px-4 py-4 text-right text-xs font-bold text-app uppercase tracking-wider">จำนวนเงิน</th>
                        <th className="px-4 py-4 text-center text-xs font-bold text-app uppercase tracking-wider">สถานะ</th>
                        <th className="px-4 py-4 text-center text-xs font-bold text-app uppercase tracking-wider">จัดการ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-app/20">
                      {filteredRecords.map((record) => (
                        <motion.tr
                          key={record.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`hover:bg-soft/70 transition-colors ${
                            record.status === "อนุมัติ" ? "bg-green-500/5" :
                            record.status === "ปฏิเสธ" ? "bg-red-500/5" :
                            "bg-yellow-500/5"
                          }`}
                          title={`วันที่เบิก: ${formatDateDetailed(record.date)}`}
                        >
                          <td className="px-4 py-4 text-sm text-app min-w-[180px]">
                            {record.date ? (
                              <div className="flex flex-col gap-1">
                                <div className="font-semibold text-app text-sm whitespace-nowrap">
                                  {formatDateShort(record.date)}
                                </div>
                                <div className="text-[10px] text-muted leading-tight border-t border-app/20 pt-1">
                                  {formatDateDetailed(record.date)}
                                </div>
                              </div>
                            ) : (
                              <span className="text-muted italic text-xs">ไม่มีข้อมูลวันที่</span>
                            )}
                          </td>
                          <td className="px-4 py-4">
                            <span className="text-sm text-ptt-cyan font-semibold">{record.empCode}</span>
                          </td>
                          <td className="px-4 py-4">
                            <span className="text-sm text-app font-medium">{record.empName}</span>
                          </td>
                          <td className="px-4 py-4">
                            <span className="text-sm text-muted">{record.category}</span>
                          </td>
                          <td className="px-4 py-4 text-right">
                            {record.amount ? (
                              <span className="text-sm font-bold text-app font-mono">
                                {new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(record.amount)}
                              </span>
                            ) : (
                              <span className="text-sm text-muted">-</span>
                            )}
                          </td>
                          <td className="px-4 py-4 text-center">
                            <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold ${
                              record.status === "อนุมัติ" ? "bg-green-500/20 text-green-400 border border-green-500/30" :
                              record.status === "ปฏิเสธ" ? "bg-red-500/20 text-red-400 border border-red-500/30" :
                              "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                            }`}>
                              {record.status === "อนุมัติ" && "✓ "}
                              {record.status === "ปฏิเสธ" && "✗ "}
                              {record.status === "รออนุมัติ" && "⏳ "}
                              {record.status}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button 
                                className="p-2 hover:bg-ptt-cyan/20 rounded-lg transition-colors" 
                                title="แก้ไข"
                              >
                                <Edit2 className="w-4 h-4 text-ptt-cyan" />
                              </button>
                              <button 
                                onClick={() => handleDelete(record.id)}
                                className="p-2 hover:bg-red-500/20 rounded-lg transition-colors" 
                                title="ลบ"
                              >
                                <Trash2 className="w-4 h-4 text-red-400" />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-16 bg-soft/30 rounded-xl border-2 border-dashed border-app mt-4">
                  <GraduationCap className="w-16 h-16 text-muted mx-auto mb-4 opacity-50" />
                  <p className="text-muted font-light text-lg mb-2">ยังไม่มีรายการทุนการศึกษา</p>
                  <p className="text-xs text-muted">คลิกปุ่ม "เพิ่มสวัสดิการ" เพื่อเพิ่มรายการใหม่</p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "insurance" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-app font-display mb-2">ประกันชีวิตระดับหัวหน้างาน</h2>
                  <p className="text-sm text-muted">
                    จำนวนรายการ: <span className="font-semibold text-app">{filteredRecords.length}</span> รายการ
                    {filteredRecords.length > 0 && (
                      <>
                        {" | "}วันที่ล่าสุด: <span className="font-semibold text-ptt-cyan">{formatDateShort(filteredRecords.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].date)}</span>
                      </>
                    )}
                  </p>
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                    <input
                      type="text"
                      placeholder="ค้นหา..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2.5 bg-soft border border-app rounded-lg text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue w-full md:w-64"
                    />
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-r from-teal-500/10 to-cyan-500/10 border border-teal-500/30 rounded-xl p-6 mb-6 shadow-lg">
                <h3 className="text-base font-bold text-app mb-3 flex items-center gap-2">
                  <div className="w-8 h-8 bg-teal-500/20 rounded-lg flex items-center justify-center">
                    <Shield className="w-5 h-5 text-teal-400" />
                  </div>
                  ข้อมูลประกันชีวิตหัวหน้างาน
                </h3>
                <ul className="text-sm text-muted space-y-2 ml-10 list-disc">
                  <li>ทุนประกันภัย : 100,000 บาทขึ้นไป</li>
                  <li>สำหรับพนักงานระดับหัวหน้างาน</li>
                </ul>
              </div>
              
              {filteredRecords.length > 0 ? (
                <div className="overflow-x-auto rounded-xl border border-app mt-4">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-teal-500/10 to-cyan-500/10 border-b-2 border-teal-500/30">
                      <tr>
                        <th className="px-4 py-4 text-left text-xs font-bold text-app uppercase tracking-wider min-w-[180px]">
                          <div className="flex items-center gap-1">
                            <CalendarIcon className="w-3 h-3" />
                            วัน เดือน ปี
                          </div>
                        </th>
                        <th className="px-4 py-4 text-left text-xs font-bold text-app uppercase tracking-wider">รหัส</th>
                        <th className="px-4 py-4 text-left text-xs font-bold text-app uppercase tracking-wider">ชื่อ-นามสกุล</th>
                        <th className="px-4 py-4 text-left text-xs font-bold text-app uppercase tracking-wider">แผนก</th>
                        <th className="px-4 py-4 text-right text-xs font-bold text-app uppercase tracking-wider">ทุนประกันภัย</th>
                        <th className="px-4 py-4 text-center text-xs font-bold text-app uppercase tracking-wider">สถานะ</th>
                        <th className="px-4 py-4 text-center text-xs font-bold text-app uppercase tracking-wider">จัดการ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-app/20">
                      {filteredRecords.map((record) => (
                        <motion.tr
                          key={record.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`hover:bg-soft/70 transition-colors ${
                            record.status === "อนุมัติ" ? "bg-green-500/5" :
                            record.status === "ปฏิเสธ" ? "bg-red-500/5" :
                            "bg-yellow-500/5"
                          }`}
                          title={`วันที่เบิก: ${formatDateDetailed(record.date)}`}
                        >
                          <td className="px-4 py-4 text-sm text-app min-w-[180px]">
                            {record.date ? (
                              <div className="flex flex-col gap-1">
                                <div className="font-semibold text-app text-sm whitespace-nowrap">
                                  {formatDateShort(record.date)}
                                </div>
                                <div className="text-[10px] text-muted leading-tight border-t border-app/20 pt-1">
                                  {formatDateDetailed(record.date)}
                                </div>
                              </div>
                            ) : (
                              <span className="text-muted italic text-xs">ไม่มีข้อมูลวันที่</span>
                            )}
                          </td>
                          <td className="px-4 py-4">
                            <span className="text-sm text-ptt-cyan font-semibold">{record.empCode}</span>
                          </td>
                          <td className="px-4 py-4">
                            <span className="text-sm text-app font-medium">{record.empName}</span>
                          </td>
                          <td className="px-4 py-4">
                            <span className="text-sm text-muted">{record.category}</span>
                          </td>
                          <td className="px-4 py-4 text-right">
                            {record.amount ? (
                              <span className="text-sm font-bold text-app font-mono">
                                {new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(record.amount)}
                              </span>
                            ) : (
                              <span className="text-sm text-muted">-</span>
                            )}
                          </td>
                          <td className="px-4 py-4 text-center">
                            <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold ${
                              record.status === "อนุมัติ" ? "bg-green-500/20 text-green-400 border border-green-500/30" :
                              record.status === "ปฏิเสธ" ? "bg-red-500/20 text-red-400 border border-red-500/30" :
                              "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                            }`}>
                              {record.status === "อนุมัติ" && "✓ "}
                              {record.status === "ปฏิเสธ" && "✗ "}
                              {record.status === "รออนุมัติ" && "⏳ "}
                              {record.status}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button 
                                className="p-2 hover:bg-ptt-cyan/20 rounded-lg transition-colors" 
                                title="แก้ไข"
                              >
                                <Edit2 className="w-4 h-4 text-ptt-cyan" />
                              </button>
                              <button 
                                onClick={() => handleDelete(record.id)}
                                className="p-2 hover:bg-red-500/20 rounded-lg transition-colors" 
                                title="ลบ"
                              >
                                <Trash2 className="w-4 h-4 text-red-400" />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-16 bg-soft/30 rounded-xl border-2 border-dashed border-app mt-4">
                  <Shield className="w-16 h-16 text-muted mx-auto mb-4 opacity-50" />
                  <p className="text-muted font-light text-lg mb-2">ยังไม่มีรายการประกันชีวิต</p>
                  <p className="text-xs text-muted">คลิกปุ่ม "เพิ่มสวัสดิการ" เพื่อเพิ่มรายการใหม่</p>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>

      {/* Add Welfare Modal */}
      <ModalForm
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setFormData({
            type: activeTab,
            empCode: "",
            empName: "",
            category: "",
            item: "",
            amount: "",
            date: new Date().toISOString().split('T')[0],
            notes: ""
          });
        }}
        title="เพิ่มสวัสดิการ"
        onSubmit={handleSubmit}
        submitLabel="บันทึก"
        size="lg"
      >
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-app mb-1.5">
              ประเภทสวัสดิการ <span className="text-red-400">*</span>
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-4 py-3 bg-soft border border-app rounded-xl
                       text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue focus:border-ptt-blue/50
                       transition-all duration-200 hover:border-app/50 cursor-pointer"
              required
            >
              {tabs.map((tab) => (
                <option key={tab.id} value={tab.id}>
                  {tab.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-app mb-1.5">
              เลือกพนักงาน <span className="text-red-400">*</span>
            </label>
            <select
              value={formData.empCode}
              onChange={(e) => handleEmployeeSelect(e.target.value)}
              className="w-full px-4 py-3 bg-soft border border-app rounded-xl
                       text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue focus:border-ptt-blue/50
                       transition-all duration-200 hover:border-app/50 cursor-pointer"
              required
            >
              <option value="">เลือกพนักงาน</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.code}>
                  {emp.code} - {emp.name} ({emp.category || emp.dept})
                </option>
              ))}
            </select>
          </div>

          {formData.empCode && (
            <div className="p-3 bg-soft rounded-lg border border-app">
              <p className="text-sm text-muted mb-1">ข้อมูลพนักงาน</p>
              <p className="text-app font-semibold">{formData.empName}</p>
              <p className="text-xs text-ptt-cyan mt-1">แผนก: {formData.category}</p>
            </div>
          )}

          {(formData.type === "benefits" || formData.type === "fuel") && (
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-app mb-1.5">
                รายการ {formData.type === "benefits" ? "(ชุดฟอร์ม, เสื้อกันหนาว, รองเท้า)" : "(ค่าน้ำมัน)"}
              </label>
              <input
                type="text"
                value={formData.item}
                onChange={(e) => setFormData({ ...formData, item: e.target.value })}
                placeholder="ระบุรายการ..."
                className="w-full px-4 py-3 bg-soft border border-app rounded-xl
                         text-app placeholder:text-muted
                         focus:outline-none focus:ring-2 focus:ring-ptt-blue focus:border-ptt-blue/50
                         transition-all duration-200 hover:border-app/50"
              />
            </div>
          )}

          {(formData.type === "bonus" || formData.type === "fuel" || formData.type === "condolence" || formData.type === "scholarship") && (
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-app mb-1.5">
                จำนวนเงิน (บาท)
              </label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0.00"
                min="0"
                step="0.01"
                className="w-full px-4 py-3 bg-soft border border-app rounded-xl
                         text-app placeholder:text-muted
                         focus:outline-none focus:ring-2 focus:ring-ptt-blue focus:border-ptt-blue/50
                         transition-all duration-200 hover:border-app/50"
              />
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-app mb-1.5">
              วันที่ <span className="text-red-400">*</span>
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-4 py-3 bg-soft border border-app rounded-xl
                       text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue focus:border-ptt-blue/50
                       transition-all duration-200 hover:border-app/50 cursor-pointer"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-app mb-1.5">
              หมายเหตุ
            </label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="ระบุหมายเหตุ (ถ้ามี)..."
              className="w-full px-4 py-3 bg-soft border border-app rounded-xl
                       text-app placeholder:text-muted
                       focus:outline-none focus:ring-2 focus:ring-ptt-blue focus:border-ptt-blue/50
                       transition-all duration-200 hover:border-app/50 resize-none"
            />
          </div>
        </div>
      </ModalForm>
    </div>
  );
}

