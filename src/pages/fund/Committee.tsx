import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Users, 
  UserPlus, 
  Shield,
  FileText,
  DollarSign,
  CheckCircle
} from "lucide-react";
import ModalForm from "@/components/ModalForm";
import StatusTag, { getStatusVariant } from "@/components/StatusTag";
import { 
  fundCommittee,
  employees,
  type FundCommittee as CommitteeType
} from "@/data/mockData";

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const positionColors: Record<string, string> = {
  "ประธานกองทุน": "from-purple-500/20 to-purple-400/20 border-purple-500/30 text-purple-400",
  "กรรมการ": "from-blue-500/20 to-blue-400/20 border-blue-500/30 text-blue-400",
  "เหรัญญิก": "from-green-500/20 to-green-400/20 border-green-500/30 text-green-400",
  "เลขานุการ": "from-orange-500/20 to-orange-400/20 border-orange-500/30 text-orange-400"
};

export default function Committee() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<CommitteeType | null>(null);
  const [formData, setFormData] = useState({
    empCode: "",
    position: "" as CommitteeType["position"] | "",
    startDate: ""
  });

  // Group by position
  const chairman = fundCommittee.find(c => c.position === "ประธานกองทุน" && c.status === "Active");
  const treasurer = fundCommittee.find(c => c.position === "เหรัญญิก" && c.status === "Active");
  const secretary = fundCommittee.find(c => c.position === "เลขานุการ" && c.status === "Active");
  const boardMembers = fundCommittee.filter(c => c.position === "กรรมการ" && c.status === "Active");

  // Handle add committee member
  const handleAddMember = () => {
    if (!formData.empCode || !formData.position || !formData.startDate) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    // Check if position already exists
    if (formData.position !== "กรรมการ") {
      const existing = fundCommittee.find(
        c => c.position === formData.position && c.status === "Active"
      );
      if (existing) {
        alert(`ตำแหน่ง ${formData.position} มีผู้ดำรงตำแหน่งอยู่แล้ว`);
        return;
      }
    }

    alert(`เพิ่มกรรมการ "${formData.position}" สำเร็จ! (Mock)`);
    setFormData({
      empCode: "",
      position: "" as CommitteeType["position"] | "",
      startDate: ""
    });
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-app mb-2 font-display">
            การบริหารกองทุน
          </h1>
          <p className="text-muted font-light">
            จัดการกรรมการกองทุนและโครงสร้างการบริหาร
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-6 py-3 bg-ptt-blue hover:bg-ptt-blue/80 
                   text-app rounded-xl transition-all duration-200 font-semibold 
                   shadow-lg hover:shadow-xl hover:-translate-y-0.5"
        >
          <UserPlus className="w-5 h-5" />
          เพิ่มกรรมการ
        </button>
      </div>

      {/* Committee Structure */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chairman */}
        {chairman && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-purple-500/10 to-purple-400/10 border-2 border-purple-500/30 rounded-2xl p-6 shadow-xl"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-purple-400/20 rounded-xl flex items-center justify-center">
                <Shield className="w-8 h-8 text-purple-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-app font-display">ประธานกองทุน</h3>
                <p className="text-sm text-muted">ตำแหน่งสูงสุด</p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted mb-1">ชื่อ-นามสกุล:</p>
                <p className="text-lg font-semibold text-app">{chairman.empName}</p>
                <p className="text-sm text-ptt-cyan">{chairman.empCode}</p>
              </div>
              <div>
                <p className="text-sm text-muted mb-1">วันที่เริ่มดำรงตำแหน่ง:</p>
                <p className="text-app">{formatDate(chairman.startDate)}</p>
              </div>
              <div>
                <p className="text-sm text-muted mb-2">หน้าที่หลัก:</p>
                <ul className="space-y-1">
                  {chairman.responsibilities.map((resp, index) => (
                    <li key={index} className="text-sm text-app flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                      {resp}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        )}

        {/* Treasurer & Secretary */}
        <div className="space-y-4">
          {/* Treasurer */}
          {treasurer && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-green-500/10 to-green-400/10 border border-green-500/30 rounded-2xl p-6 shadow-xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500/20 to-green-400/20 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-app font-display">เหรัญญิก</h3>
                  <p className="text-xs text-muted">ดูแลบัญชี</p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="font-semibold text-app">{treasurer.empName}</p>
                <p className="text-sm text-ptt-cyan">{treasurer.empCode}</p>
                <div className="mt-3">
                  <p className="text-xs text-muted mb-1">หน้าที่:</p>
                  <ul className="space-y-1">
                    {treasurer.responsibilities.map((resp, index) => (
                      <li key={index} className="text-xs text-app flex items-start gap-2">
                        <CheckCircle className="w-3 h-3 text-green-400 mt-0.5 flex-shrink-0" />
                        {resp}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          )}

          {/* Secretary */}
          {secretary && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-orange-500/10 to-orange-400/10 border border-orange-500/30 rounded-2xl p-6 shadow-xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500/20 to-orange-400/20 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-orange-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-app font-display">เลขานุการ</h3>
                  <p className="text-xs text-muted">จัดเก็บเอกสาร</p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="font-semibold text-app">{secretary.empName}</p>
                <p className="text-sm text-ptt-cyan">{secretary.empCode}</p>
                <div className="mt-3">
                  <p className="text-xs text-muted mb-1">หน้าที่:</p>
                  <ul className="space-y-1">
                    {secretary.responsibilities.map((resp, index) => (
                      <li key={index} className="text-xs text-app flex items-start gap-2">
                        <CheckCircle className="w-3 h-3 text-orange-400 mt-0.5 flex-shrink-0" />
                        {resp}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Board Members */}
      <div className="bg-soft border border-app rounded-2xl p-6 shadow-xl">
        <h3 className="text-xl font-semibold text-app mb-4 font-display flex items-center gap-2">
          <Users className="w-6 h-6 text-ptt-cyan" />
          กรรมการ ({boardMembers.length} คน)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {boardMembers.map((member, index) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 bg-soft rounded-xl border border-app hover:border-blue-500/30 transition-colors cursor-pointer"
              onClick={() => setSelectedMember(member)}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-blue-400/20 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="font-semibold text-app">{member.empName}</p>
                  <p className="text-xs text-ptt-cyan">{member.empCode}</p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted">วันที่เริ่ม:</p>
                <p className="text-xs text-app">{formatDate(member.startDate)}</p>
              </div>
            </motion.div>
          ))}
          {boardMembers.length === 0 && (
            <div className="col-span-full text-center py-8 text-muted">
              ยังไม่มีกรรมการ
            </div>
          )}
        </div>
      </div>

      {/* All Committee Members Table */}
      <div className="bg-soft border border-app rounded-2xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-app">
          <h3 className="text-xl font-semibold text-app font-display">
            รายชื่อกรรมการทั้งหมด
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-soft border-b border-app">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-app">ตำแหน่ง</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-app">รหัส</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-app">ชื่อ-นามสกุล</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-app">วันที่เริ่ม</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-app">สถานะ</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-app">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-app">
              {fundCommittee.map((member, index) => (
                <motion.tr
                  key={member.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-soft transition-colors"
                >
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium border ${
                      positionColors[member.position] || "bg-muted/10 text-muted border-muted/20"
                    }`}>
                      {member.position}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-ptt-cyan font-medium">
                    {member.empCode}
                  </td>
                  <td className="px-6 py-4 text-sm text-app font-medium">
                    {member.empName}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted">
                    {formatDate(member.startDate)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <StatusTag variant={getStatusVariant(
                      member.status === "Active" ? "Active" : "Leave"
                    )}>
                      {member.status}
                    </StatusTag>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => setSelectedMember(member)}
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm 
                               bg-ptt-blue/20 hover:bg-ptt-blue/30 text-ptt-cyan rounded-lg
                               transition-colors font-medium"
                    >
                      <FileText className="w-4 h-4" />
                      ดูรายละเอียด
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Committee Member Modal */}
      <ModalForm
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setFormData({
            empCode: "",
            position: "" as CommitteeType["position"] | "",
            startDate: ""
          });
        }}
        title="เพิ่มกรรมการกองทุน"
        onSubmit={handleAddMember}
        submitLabel="บันทึก"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-app mb-2">
              พนักงาน <span className="text-red-400">*</span>
            </label>
            <select
              value={formData.empCode}
              onChange={(e) => setFormData({ ...formData, empCode: e.target.value })}
              className="w-full px-4 py-2.5 bg-soft border border-app rounded-xl
                       text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue"
            >
              <option value="">เลือกพนักงาน</option>
              {employees
                .filter(e => e.status === "Active")
                .map((emp) => (
                  <option key={emp.code} value={emp.code}>
                    {emp.code} - {emp.name}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-app mb-2">
              ตำแหน่ง <span className="text-red-400">*</span>
            </label>
            <select
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value as CommitteeType["position"] })}
              className="w-full px-4 py-2.5 bg-soft border border-app rounded-xl
                       text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue"
            >
              <option value="">เลือกตำแหน่ง</option>
              <option value="ประธานกองทุน">ประธานกองทุน (1 คน)</option>
              <option value="เหรัญญิก">เหรัญญิก (1 คน)</option>
              <option value="เลขานุการ">เลขานุการ (1 คน)</option>
              <option value="กรรมการ">กรรมการ (5-7 คน)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-app mb-2">
              วันที่เริ่มดำรงตำแหน่ง <span className="text-red-400">*</span>
            </label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className="w-full px-4 py-2.5 bg-soft border border-app rounded-xl
                       text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue"
            />
          </div>

          <div className="p-3 bg-ptt-blue/10 border border-ptt-blue/30 rounded-lg">
            <p className="text-xs text-ptt-cyan">
              💡 กรรมการจะต้องประชุมเดือนละ 1 ครั้ง และมีหน้าที่ตรวจสอบคำขอกู้
            </p>
          </div>
        </div>
      </ModalForm>

      {/* Member Detail Modal */}
      <ModalForm
        isOpen={selectedMember !== null}
        onClose={() => setSelectedMember(null)}
        title={`รายละเอียดกรรมการ - ${selectedMember?.empName || ""}`}
      >
        {selectedMember && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted mb-1">ตำแหน่ง:</p>
                <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium border ${
                  positionColors[selectedMember.position] || "bg-muted/10 text-muted border-muted/20"
                }`}>
                  {selectedMember.position}
                </span>
              </div>
              <div>
                <p className="text-muted mb-1">สถานะ:</p>
                <StatusTag variant={getStatusVariant(
                  selectedMember.status === "Active" ? "Active" : "Leave"
                )}>
                  {selectedMember.status}
                </StatusTag>
              </div>
              <div>
                <p className="text-muted mb-1">รหัสพนักงาน:</p>
                <p className="text-app font-medium">{selectedMember.empCode}</p>
              </div>
              <div>
                <p className="text-muted mb-1">วันที่เริ่ม:</p>
                <p className="text-app">{formatDate(selectedMember.startDate)}</p>
              </div>
              {selectedMember.endDate && (
                <div>
                  <p className="text-muted mb-1">วันที่สิ้นสุด:</p>
                  <p className="text-app">{formatDate(selectedMember.endDate)}</p>
                </div>
              )}
            </div>

            <div>
              <p className="text-muted mb-2">หน้าที่หลัก:</p>
              <ul className="space-y-2">
                {selectedMember.responsibilities.map((resp, index) => (
                  <li key={index} className="flex items-start gap-2 p-2 bg-soft rounded-lg">
                    <CheckCircle className="w-4 h-4 text-ptt-cyan mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-app">{resp}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </ModalForm>
    </div>
  );
}

