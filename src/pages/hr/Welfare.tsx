import { useState, useEffect } from "react";
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
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Warehouse
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

  const tabs = [
    { id: "benefits", label: "การเบิก", icon: Package },
    { id: "bonus", label: "BONUS รายปี", icon: Gift },
    { id: "dormitory", label: "หอพัก", icon: HomeIcon },
    { id: "fuel", label: "ค่าน้ำมัน", icon: Fuel },
    { id: "trip", label: "ทัศนศึกษาพาสุข", icon: Plane },
    { id: "holidays", label: "หยุดงานตามกฎหมาย", icon: CalendarIcon },
    { id: "condolence", label: "เยี่ยมไข้/คลอด/งานศพ", icon: HeartHandshake },
    { id: "scholarship", label: "ทุนการศึกษาบุตร", icon: GraduationCap },
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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-app mb-2 font-display flex items-center gap-3">
            <Heart className="w-8 h-8 text-ptt-cyan" />
            สวัสดิการพนักงาน
          </h1>
          <p className="text-muted font-light">
            ระบบคลังสินค้าสวัสดิการ + เชื่อมประกันชีวิต
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate("/app/hr/welfare-stock")}
            className="inline-flex items-center gap-2 px-6 py-3 bg-ptt-cyan/20 hover:bg-ptt-cyan/30 
                     text-ptt-cyan rounded-xl transition-all duration-200 font-semibold 
                     border border-ptt-cyan/50 hover:shadow-lg"
          >
            <Package className="w-5 h-5" />
            สต๊อกสวัสดิการ
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-ptt-cyan hover:bg-ptt-cyan/80 
                     text-app rounded-xl transition-all duration-200 font-semibold 
                     shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            <Plus className="w-5 h-5" />
            เพิ่มสวัสดิการ
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-soft border border-app rounded-2xl overflow-hidden">
        <div className="flex flex-wrap border-b border-app bg-soft">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all
                  ${activeTab === tab.id
                    ? "text-ptt-cyan border-b-2 border-ptt-cyan bg-soft"
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
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-app font-display">การเบิกสวัสดิการ</h2>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                    <input
                      type="text"
                      placeholder="ค้นหา..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2 bg-soft border border-app rounded-lg text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue"
                    />
                  </div>
                  <button className="px-4 py-2 bg-soft border border-app rounded-lg text-app hover:bg-soft/80 flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    กรอง
                  </button>
                </div>
              </div>

              {/* Records Table */}
              {filteredRecords.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-soft border-b border-app">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-app">วันที่</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-app">รหัส</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-app">ชื่อ-นามสกุล</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-app">แผนก</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-app">รายการ</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-app">จำนวนเงิน</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-app">สถานะ</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-app">จัดการ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-app">
                      {filteredRecords.map((record) => (
                        <motion.tr
                          key={record.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="hover:bg-soft/50 transition-colors"
                        >
                          <td className="px-4 py-3 text-sm text-app">
                            {new Date(record.date).toLocaleDateString('th-TH')}
                          </td>
                          <td className="px-4 py-3 text-sm text-ptt-cyan font-medium">{record.empCode}</td>
                          <td className="px-4 py-3 text-sm text-app font-medium">{record.empName}</td>
                          <td className="px-4 py-3 text-sm text-muted">{record.category}</td>
                          <td className="px-4 py-3 text-sm text-app">{record.item || "-"}</td>
                          <td className="px-4 py-3 text-sm text-app text-right font-mono">
                            {record.amount ? new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(record.amount) : "-"}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                              record.status === "อนุมัติ" ? "bg-green-500/20 text-green-400 border border-green-500/30" :
                              record.status === "ปฏิเสธ" ? "bg-red-500/20 text-red-400 border border-red-500/30" :
                              "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                            }`}>
                              {record.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button className="p-1.5 hover:bg-soft rounded-lg transition-colors" title="แก้ไข">
                                <Edit2 className="w-4 h-4 text-ptt-cyan" />
                              </button>
                              <button 
                                onClick={() => handleDelete(record.id)}
                                className="p-1.5 hover:bg-soft rounded-lg transition-colors" 
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
                <div className="text-center py-12 bg-soft/30 rounded-xl border border-app">
                  <Package className="w-12 h-12 text-muted mx-auto mb-3 opacity-50" />
                  <p className="text-muted font-light">ยังไม่มีรายการเบิกสวัสดิการ</p>
                  <p className="text-xs text-muted mt-1">คลิกปุ่ม "เพิ่มสวัสดิการ" เพื่อเพิ่มรายการใหม่</p>
                </div>
              )}

              {/* Info Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-soft border border-app rounded-xl p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <Package className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-app">ชุดฟอร์ม</h3>
                      <p className="text-xs text-muted">เบิกได้</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted">เบิกชุดฟอร์มสำหรับพนักงาน</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                  className="bg-soft border border-app rounded-xl p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <Package className="w-6 h-6 text-green-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-app">เสื้อกันหนาว</h3>
                      <p className="text-xs text-muted">ทุกแผนก</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted">เบิกเสื้อกันหนาวสำหรับทุกแผนก</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="bg-soft border border-app rounded-xl p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <Package className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-app">รองเท้า</h3>
                      <p className="text-xs text-muted">เบิกได้</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted">เบิกรองเท้าสำหรับพนักงาน</p>
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
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-app font-display">BONUS รายปี (รางวัลพนักงานดีเด่น)</h2>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                    <input
                      type="text"
                      placeholder="ค้นหา..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2 bg-soft border border-app rounded-lg text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue"
                    />
                  </div>
                </div>
              </div>
              <p className="text-muted">ระบบ: คีย์ชื่อพนักงาน → ออกรายงาน (ไม่มีพารามิเตอร์ชัด ขึ้นกับเจ้านาย + กรอบงาน)</p>
              <p className="text-muted">เงิน: ตามพิจารณา</p>
              
              {filteredRecords.length > 0 && (
                <div className="overflow-x-auto mt-4">
                  <table className="w-full">
                    <thead className="bg-soft border-b border-app">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-app">วันที่</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-app">รหัส</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-app">ชื่อ-นามสกุล</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-app">แผนก</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-app">จำนวนเงิน</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-app">สถานะ</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-app">จัดการ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-app">
                      {filteredRecords.map((record) => (
                        <motion.tr
                          key={record.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="hover:bg-soft/50 transition-colors"
                        >
                          <td className="px-4 py-3 text-sm text-app">
                            {new Date(record.date).toLocaleDateString('th-TH')}
                          </td>
                          <td className="px-4 py-3 text-sm text-ptt-cyan font-medium">{record.empCode}</td>
                          <td className="px-4 py-3 text-sm text-app font-medium">{record.empName}</td>
                          <td className="px-4 py-3 text-sm text-muted">{record.category}</td>
                          <td className="px-4 py-3 text-sm text-app text-right font-mono">
                            {record.amount ? new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(record.amount) : "-"}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                              record.status === "อนุมัติ" ? "bg-green-500/20 text-green-400 border border-green-500/30" :
                              record.status === "ปฏิเสธ" ? "bg-red-500/20 text-red-400 border border-red-500/30" :
                              "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                            }`}>
                              {record.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button className="p-1.5 hover:bg-soft rounded-lg transition-colors" title="แก้ไข">
                                <Edit2 className="w-4 h-4 text-ptt-cyan" />
                              </button>
                              <button 
                                onClick={() => handleDelete(record.id)}
                                className="p-1.5 hover:bg-soft rounded-lg transition-colors" 
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
              )}
            </motion.div>
          )}

          {activeTab === "dormitory" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-app font-display">หอพัก</h2>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                    <input
                      type="text"
                      placeholder="ค้นหา..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2 bg-soft border border-app rounded-lg text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue"
                    />
                  </div>
                </div>
              </div>
              <p className="text-muted">พักฟรี + จ่ายน้ำ/ไฟ (ระบุในระบบว่าใครใช้ + รวมบุคคลภายนอก)</p>
              
              {filteredRecords.length > 0 ? (
                <div className="overflow-x-auto mt-4">
                  <table className="w-full">
                    <thead className="bg-soft border-b border-app">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-app">วันที่</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-app">รหัส</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-app">ชื่อ-นามสกุล</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-app">แผนก</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-app">สถานะ</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-app">จัดการ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-app">
                      {filteredRecords.map((record) => (
                        <motion.tr
                          key={record.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="hover:bg-soft/50 transition-colors"
                        >
                          <td className="px-4 py-3 text-sm text-app">
                            {new Date(record.date).toLocaleDateString('th-TH')}
                          </td>
                          <td className="px-4 py-3 text-sm text-ptt-cyan font-medium">{record.empCode}</td>
                          <td className="px-4 py-3 text-sm text-app font-medium">{record.empName}</td>
                          <td className="px-4 py-3 text-sm text-muted">{record.category}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                              record.status === "อนุมัติ" ? "bg-green-500/20 text-green-400 border border-green-500/30" :
                              record.status === "ปฏิเสธ" ? "bg-red-500/20 text-red-400 border border-red-500/30" :
                              "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                            }`}>
                              {record.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button className="p-1.5 hover:bg-soft rounded-lg transition-colors" title="แก้ไข">
                                <Edit2 className="w-4 h-4 text-ptt-cyan" />
                              </button>
                              <button 
                                onClick={() => handleDelete(record.id)}
                                className="p-1.5 hover:bg-soft rounded-lg transition-colors" 
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
                <div className="text-center py-12 bg-soft/30 rounded-xl border border-app mt-4">
                  <HomeIcon className="w-12 h-12 text-muted mx-auto mb-3 opacity-50" />
                  <p className="text-muted font-light">ยังไม่มีรายการหอพัก</p>
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
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-app font-display">ค่าน้ำมัน</h2>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                    <input
                      type="text"
                      placeholder="ค้นหา..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2 bg-soft border border-app rounded-lg text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue"
                    />
                  </div>
                </div>
              </div>
              <p className="text-muted">เบิกได้</p>
              
              {filteredRecords.length > 0 ? (
                <div className="overflow-x-auto mt-4">
                  <table className="w-full">
                    <thead className="bg-soft border-b border-app">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-app">วันที่</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-app">รหัส</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-app">ชื่อ-นามสกุล</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-app">แผนก</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-app">รายการ</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-app">จำนวนเงิน</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-app">สถานะ</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-app">จัดการ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-app">
                      {filteredRecords.map((record) => (
                        <motion.tr
                          key={record.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="hover:bg-soft/50 transition-colors"
                        >
                          <td className="px-4 py-3 text-sm text-app">
                            {new Date(record.date).toLocaleDateString('th-TH')}
                          </td>
                          <td className="px-4 py-3 text-sm text-ptt-cyan font-medium">{record.empCode}</td>
                          <td className="px-4 py-3 text-sm text-app font-medium">{record.empName}</td>
                          <td className="px-4 py-3 text-sm text-muted">{record.category}</td>
                          <td className="px-4 py-3 text-sm text-app">{record.item || "-"}</td>
                          <td className="px-4 py-3 text-sm text-app text-right font-mono">
                            {record.amount ? new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(record.amount) : "-"}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                              record.status === "อนุมัติ" ? "bg-green-500/20 text-green-400 border border-green-500/30" :
                              record.status === "ปฏิเสธ" ? "bg-red-500/20 text-red-400 border border-red-500/30" :
                              "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                            }`}>
                              {record.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button className="p-1.5 hover:bg-soft rounded-lg transition-colors" title="แก้ไข">
                                <Edit2 className="w-4 h-4 text-ptt-cyan" />
                              </button>
                              <button 
                                onClick={() => handleDelete(record.id)}
                                className="p-1.5 hover:bg-soft rounded-lg transition-colors" 
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
                <div className="text-center py-12 bg-soft/30 rounded-xl border border-app mt-4">
                  <Fuel className="w-12 h-12 text-muted mx-auto mb-3 opacity-50" />
                  <p className="text-muted font-light">ยังไม่มีรายการเบิกค่าน้ำมัน</p>
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
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-app font-display">โครงการทัศนศึกษาพาสุข</h2>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                    <input
                      type="text"
                      placeholder="ค้นหา..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2 bg-soft border border-app rounded-lg text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue"
                    />
                  </div>
                </div>
              </div>
              <p className="text-muted">เที่ยวใน/นอกประเทศ (ตามตำแหน่ง/ผลงาน)</p>
              
              {filteredRecords.length > 0 ? (
                <div className="overflow-x-auto mt-4">
                  <table className="w-full">
                    <thead className="bg-soft border-b border-app">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-app">วันที่</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-app">รหัส</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-app">ชื่อ-นามสกุล</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-app">แผนก</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-app">สถานะ</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-app">จัดการ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-app">
                      {filteredRecords.map((record) => (
                        <motion.tr
                          key={record.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="hover:bg-soft/50 transition-colors"
                        >
                          <td className="px-4 py-3 text-sm text-app">
                            {new Date(record.date).toLocaleDateString('th-TH')}
                          </td>
                          <td className="px-4 py-3 text-sm text-ptt-cyan font-medium">{record.empCode}</td>
                          <td className="px-4 py-3 text-sm text-app font-medium">{record.empName}</td>
                          <td className="px-4 py-3 text-sm text-muted">{record.category}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                              record.status === "อนุมัติ" ? "bg-green-500/20 text-green-400 border border-green-500/30" :
                              record.status === "ปฏิเสธ" ? "bg-red-500/20 text-red-400 border border-red-500/30" :
                              "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                            }`}>
                              {record.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button className="p-1.5 hover:bg-soft rounded-lg transition-colors" title="แก้ไข">
                                <Edit2 className="w-4 h-4 text-ptt-cyan" />
                              </button>
                              <button 
                                onClick={() => handleDelete(record.id)}
                                className="p-1.5 hover:bg-soft rounded-lg transition-colors" 
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
                <div className="text-center py-12 bg-soft/30 rounded-xl border border-app mt-4">
                  <Plane className="w-12 h-12 text-muted mx-auto mb-3 opacity-50" />
                  <p className="text-muted font-light">ยังไม่มีรายการทัศนศึกษา</p>
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
              <h2 className="text-xl font-semibold text-app font-display">การหยุดงานตามกฎหมาย</h2>
              <p className="text-muted">หยุด 13 วัน/ปี: ตามปฏิทินปั๊มกำหนด + วันอื่นๆ (แรงงาน, ปิยมหาราช, สวรรคต)</p>
              <p className="text-muted">ยกเว้น: สงกรานต์/ปีใหม่ → อยู่ทำงานได้เงินพิเศษ (รอบละ 5 วัน)</p>
            </motion.div>
          )}

          {activeTab === "condolence" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-app font-display">เยี่ยมไข้/คลอด/งานศพ</h2>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                    <input
                      type="text"
                      placeholder="ค้นหา..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2 bg-soft border border-app rounded-lg text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue"
                    />
                  </div>
                </div>
              </div>
              <p className="text-muted">ใส่ซองให้พนักงาน</p>
              
              {filteredRecords.length > 0 ? (
                <div className="overflow-x-auto mt-4">
                  <table className="w-full">
                    <thead className="bg-soft border-b border-app">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-app">วันที่</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-app">รหัส</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-app">ชื่อ-นามสกุล</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-app">แผนก</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-app">จำนวนเงิน</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-app">สถานะ</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-app">จัดการ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-app">
                      {filteredRecords.map((record) => (
                        <motion.tr
                          key={record.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="hover:bg-soft/50 transition-colors"
                        >
                          <td className="px-4 py-3 text-sm text-app">
                            {new Date(record.date).toLocaleDateString('th-TH')}
                          </td>
                          <td className="px-4 py-3 text-sm text-ptt-cyan font-medium">{record.empCode}</td>
                          <td className="px-4 py-3 text-sm text-app font-medium">{record.empName}</td>
                          <td className="px-4 py-3 text-sm text-muted">{record.category}</td>
                          <td className="px-4 py-3 text-sm text-app text-right font-mono">
                            {record.amount ? new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(record.amount) : "-"}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                              record.status === "อนุมัติ" ? "bg-green-500/20 text-green-400 border border-green-500/30" :
                              record.status === "ปฏิเสธ" ? "bg-red-500/20 text-red-400 border border-red-500/30" :
                              "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                            }`}>
                              {record.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button className="p-1.5 hover:bg-soft rounded-lg transition-colors" title="แก้ไข">
                                <Edit2 className="w-4 h-4 text-ptt-cyan" />
                              </button>
                              <button 
                                onClick={() => handleDelete(record.id)}
                                className="p-1.5 hover:bg-soft rounded-lg transition-colors" 
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
                <div className="text-center py-12 bg-soft/30 rounded-xl border border-app mt-4">
                  <HeartHandshake className="w-12 h-12 text-muted mx-auto mb-3 opacity-50" />
                  <p className="text-muted font-light">ยังไม่มีรายการเยี่ยมไข้/คลอด/งานศพ</p>
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
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-app font-display">ทุนการศึกษาบุตร</h2>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                    <input
                      type="text"
                      placeholder="ค้นหา..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2 bg-soft border border-app rounded-lg text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue"
                    />
                  </div>
                </div>
              </div>
              <p className="text-muted">ขีดจำกัด: พนักงาน 1 คนขอ 1 บุตร / บริษัทปีละ 2 คน (6 เดือนละ 1)</p>
              <p className="text-muted">เงิน: ตามระดับการศึกษา</p>
              
              {filteredRecords.length > 0 ? (
                <div className="overflow-x-auto mt-4">
                  <table className="w-full">
                    <thead className="bg-soft border-b border-app">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-app">วันที่</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-app">รหัส</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-app">ชื่อ-นามสกุล</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-app">แผนก</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-app">จำนวนเงิน</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-app">สถานะ</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-app">จัดการ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-app">
                      {filteredRecords.map((record) => (
                        <motion.tr
                          key={record.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="hover:bg-soft/50 transition-colors"
                        >
                          <td className="px-4 py-3 text-sm text-app">
                            {new Date(record.date).toLocaleDateString('th-TH')}
                          </td>
                          <td className="px-4 py-3 text-sm text-ptt-cyan font-medium">{record.empCode}</td>
                          <td className="px-4 py-3 text-sm text-app font-medium">{record.empName}</td>
                          <td className="px-4 py-3 text-sm text-muted">{record.category}</td>
                          <td className="px-4 py-3 text-sm text-app text-right font-mono">
                            {record.amount ? new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(record.amount) : "-"}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                              record.status === "อนุมัติ" ? "bg-green-500/20 text-green-400 border border-green-500/30" :
                              record.status === "ปฏิเสธ" ? "bg-red-500/20 text-red-400 border border-red-500/30" :
                              "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                            }`}>
                              {record.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button className="p-1.5 hover:bg-soft rounded-lg transition-colors" title="แก้ไข">
                                <Edit2 className="w-4 h-4 text-ptt-cyan" />
                              </button>
                              <button 
                                onClick={() => handleDelete(record.id)}
                                className="p-1.5 hover:bg-soft rounded-lg transition-colors" 
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
                <div className="text-center py-12 bg-soft/30 rounded-xl border border-app mt-4">
                  <GraduationCap className="w-12 h-12 text-muted mx-auto mb-3 opacity-50" />
                  <p className="text-muted font-light">ยังไม่มีรายการทุนการศึกษา</p>
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

