import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Save } from "lucide-react";
import { shifts, type Employee } from "@/data/mockData";

export default function EmployeeNew() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    dept: "",
    position: "",
    email: "",
    phone: "",
    startDate: "",
    status: "Active" as Employee["status"],
    shiftId: "",
    otRate: "",
    category: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock submit
    console.log("New Employee:", formData);
    alert(`เพิ่มพนักงาน "${formData.name}" สำเร็จ!`);
    navigate("/app/employees");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

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
            เพิ่มพนักงานใหม่
          </h1>
          <p className="text-muted font-light">กรอกข้อมูลพนักงานใหม่</p>
        </div>
      </div>

      {/* Form */}
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-soft border border-app rounded-2xl p-6 shadow-xl"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-app mb-2">
              ชื่อ-นามสกุล <span className="text-ptt-red">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 panel border border-app rounded-xl
                       text-app placeholder:text-muted
                       focus:outline-none focus:ring-2 focus:ring-ptt-blue focus:border-transparent"
              placeholder="เช่น สมชาย ใจดี"
            />
          </div>

          {/* Department */}
          <div>
            <label className="block text-sm font-medium text-app mb-2">
              แผนก <span className="text-ptt-red">*</span>
            </label>
            <select
              name="dept"
              value={formData.dept}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 panel border border-app rounded-xl
                       text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue"
            >
              <option value="">เลือกแผนก</option>
              <option value="IT">IT</option>
              <option value="HR">HR</option>
              <option value="Account">Account</option>
              <option value="Marketing">Marketing</option>
              <option value="Sales">Sales</option>
            </select>
          </div>

          {/* Position */}
          <div>
            <label className="block text-sm font-medium text-app mb-2">
              ตำแหน่ง <span className="text-ptt-red">*</span>
            </label>
            <input
              type="text"
              name="position"
              value={formData.position}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 panel border border-app rounded-xl
                       text-app placeholder:text-muted
                       focus:outline-none focus:ring-2 focus:ring-ptt-blue"
              placeholder="เช่น Senior Developer"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-app mb-2">
              อีเมล
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2.5 panel border border-app rounded-xl
                       text-app placeholder:text-muted
                       focus:outline-none focus:ring-2 focus:ring-ptt-blue"
              placeholder="example@ptt.co.th"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-app mb-2">
              เบอร์โทร
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-2.5 panel border border-app rounded-xl
                       text-app placeholder:text-muted
                       focus:outline-none focus:ring-2 focus:ring-ptt-blue"
              placeholder="08X-XXX-XXXX"
            />
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-app mb-2">
              วันที่เริ่มงาน <span className="text-ptt-red">*</span>
            </label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 panel border border-app rounded-xl
                       text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue"
            />
          </div>

          {/* Shift */}
          <div>
            <label className="block text-sm font-medium text-app mb-2">
              กะการทำงาน
            </label>
            <select
              name="shiftId"
              value={formData.shiftId}
              onChange={handleChange}
              className="w-full px-4 py-2.5 panel border border-app rounded-xl
                       text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue"
            >
              <option value="">ไม่ระบุ</option>
              {shifts.map((shift) => (
                <option key={shift.id} value={shift.id}>
                  กะ{shift.name} ({shift.startTime} - {shift.endTime})
                </option>
              ))}
            </select>
          </div>

          {/* OT Rate */}
          <div>
            <label className="block text-sm font-medium text-app mb-2">
              OT Rate (บาท/ชั่วโมง)
            </label>
            <input
              type="number"
              name="otRate"
              value={formData.otRate}
              onChange={handleChange}
              min="0"
              step="1"
              className="w-full px-4 py-2.5 panel border border-app rounded-xl
                       text-app placeholder:text-muted
                       focus:outline-none focus:ring-2 focus:ring-ptt-blue"
              placeholder="เช่น 200"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-app mb-2">
              หมวดหมู่
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-2.5 panel border border-app rounded-xl
                       text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue"
            >
              <option value="">ไม่ระบุ</option>
              <option value="ปั๊ม">ปั๊ม</option>
              <option value="เซเว่น">เซเว่น</option>
              <option value="ปึงหงี่เชียง">ปึงหงี่เชียง</option>
              <option value="เจ้าสัว">เจ้าสัว</option>
              <option value="ร้านเจียง">ร้านเจียง</option>
              <option value="ร้านเชสเตอร์">ร้านเชสเตอร์</option>
              <option value="ร้านไดโซ">ร้านไดโซ</option>
              <option value="ร้านมอไซด์ไฟฟ้า">ร้านมอไซด์ไฟฟ้า</option>
              <option value="ร้าน Quick">ร้าน Quick</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-app mb-2">
              สถานะ
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-4 py-2.5 panel border border-app rounded-xl
                       text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue"
            >
              <option value="Active">Active</option>
              <option value="Leave">Leave</option>
              <option value="Resigned">Resigned</option>
            </select>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-app">
          <button
            type="button"
            onClick={() => navigate("/app/employees")}
            className="px-6 py-2.5 text-app hover:text-app transition-colors font-medium"
          >
            ยกเลิก
          </button>
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-ptt-blue hover:bg-ptt-blue/80 
                     text-app rounded-xl transition-all duration-200 font-semibold 
                     shadow-lg hover:shadow-xl"
          >
            <Save className="w-4 h-4" />
            บันทึก
          </button>
        </div>
      </motion.form>
    </div>
  );
}

