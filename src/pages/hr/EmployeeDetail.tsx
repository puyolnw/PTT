import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import ProfileCard from "@/components/ProfileCard";
import StatusTag, { getStatusVariant } from "@/components/StatusTag";
import { employees, attendanceLogs, leaves } from "@/data/mockData";

export default function EmployeeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("general");

  // Find employee
  const employee = employees.find((e) => e.id === Number(id));

  if (!employee) {
    return (
      <div className="text-center py-12">
        <p className="text-muted">ไม่พบข้อมูลพนักงาน</p>
      </div>
    );
  }

  // Get employee's recent data
  const recentAttendance = attendanceLogs
    .filter((log) => log.empCode === employee.code)
    .slice(0, 5);
    
  const recentLeaves = leaves
    .filter((leave) => leave.empCode === employee.code)
    .slice(0, 5);

  const tabs = [
    { id: "general", label: "ข้อมูลทั่วไป" },
    { id: "history", label: "ประวัติทำงาน" },
    { id: "leaves", label: "การลา" },
    { id: "attendance", label: "เวลาเข้าออก" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/app/employees")}
          className="p-2 hover:bg-ink-800 rounded-lg transition-colors text-muted hover:text-app"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-app font-display">
            ข้อมูลพนักงาน
          </h1>
          <p className="text-muted font-light">รายละเอียดและประวัติการทำงาน</p>
        </div>
      </div>

      {/* Profile Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <ProfileCard
          avatar={employee.avatar || ""}
          name={employee.name}
          code={employee.code}
          dept={employee.dept}
          position={employee.position}
          status={employee.status}
          startDate={employee.startDate}
          email={employee.email}
          phone={employee.phone}
        />
      </motion.div>

      {/* Tabs */}
      <div className="bg-white/5 border border-app rounded-2xl overflow-hidden shadow-xl">
        {/* Tab Headers */}
        <div className="flex border-b border-app overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "text-ptt-cyan border-b-2 border-ptt-cyan"
                  : "text-muted hover:text-app"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === "general" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-app mb-4 font-display">
                ข้อมูลทั่วไป
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted">รหัสพนักงาน</p>
                  <p className="text-app font-medium">{employee.code}</p>
                </div>
                <div>
                  <p className="text-sm text-muted">ชื่อ-นามสกุล</p>
                  <p className="text-app font-medium">{employee.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted">แผนก</p>
                  <p className="text-app font-medium">{employee.dept}</p>
                </div>
                <div>
                  <p className="text-sm text-muted">ตำแหน่ง</p>
                  <p className="text-app font-medium">{employee.position}</p>
                </div>
                <div>
                  <p className="text-sm text-muted">วันที่เริ่มงาน</p>
                  <p className="text-app font-medium">{employee.startDate}</p>
                </div>
                <div>
                  <p className="text-sm text-muted">สถานะ</p>
                  <StatusTag variant={getStatusVariant(employee.status)}>
                    {employee.status}
                  </StatusTag>
                </div>
              </div>
            </div>
          )}

          {activeTab === "history" && (
            <div>
              <h3 className="text-lg font-semibold text-app mb-4 font-display">
                ประวัติการทำงาน
              </h3>
              <div className="space-y-4">
                <div className="p-4 panel rounded-xl">
                  <p className="text-muted text-sm">
                    เริ่มงานเมื่อ: <span className="text-app">{employee.startDate}</span>
                  </p>
                  <p className="text-muted text-sm mt-2">
                    ระยะเวลา: <span className="text-app">
                      {Math.floor((new Date().getTime() - new Date(employee.startDate).getTime()) / (1000 * 60 * 60 * 24 * 30))} เดือน
                    </span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "leaves" && (
            <div>
              <h3 className="text-lg font-semibold text-app mb-4 font-display">
                การลา (ล่าสุด)
              </h3>
              {recentLeaves.length > 0 ? (
                <div className="space-y-3">
                  {recentLeaves.map((leave) => (
                    <div key={leave.id} className="p-4 panel rounded-xl flex items-center justify-between">
                      <div>
                        <p className="text-app font-medium">{leave.type}</p>
                        <p className="text-sm text-muted">
                          {leave.fromDate} - {leave.toDate} ({leave.days} วัน)
                        </p>
                      </div>
                      <StatusTag variant={getStatusVariant(leave.status)}>
                        {leave.status}
                      </StatusTag>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted text-center py-8">ไม่มีประวัติการลา</p>
              )}
            </div>
          )}

          {activeTab === "attendance" && (
            <div>
              <h3 className="text-lg font-semibold text-app mb-4 font-display">
                เวลาเข้าออก (ล่าสุด)
              </h3>
              {recentAttendance.length > 0 ? (
                <div className="space-y-3">
                  {recentAttendance.map((log) => (
                    <div key={log.id} className="p-4 panel rounded-xl">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-app font-medium">{log.date}</p>
                          <p className="text-sm text-muted">
                            เข้า: {log.checkIn} | ออก: {log.checkOut}
                          </p>
                        </div>
                        <StatusTag variant={getStatusVariant(log.status)}>
                          {log.status}
                        </StatusTag>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted text-center py-8">ไม่มีประวัติการเข้าออก</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

