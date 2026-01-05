import { useState } from "react";
import { motion } from "framer-motion";
import { Settings as SettingsIcon, Save, Link as LinkIcon } from "lucide-react";

export default function Settings() {
  const [settings, setSettings] = useState({
    connectToModule1: true, // เชื่อมต่อโมดูล M1 (ดึงยอดขายร้าน → คำนวณ % ค่าเช่า)
    connectToModule6: true, // เชื่อมต่อโมดูล M6 (ส่งค่าเช่าเข้า → รายได้ 4110 / ค่าใช้จ่าย 5120)
    connectToModule7: true, // เชื่อมต่อโมดูล M7 (แสดง "รายได้ค่าเช่า vs ค่าใช้จ่ายเช่า")
    alertDays: [7, 15, 30], // แจ้งเตือนหนี้ค้าง 7/15/30 วัน
    autoCalculate: true, // คำนวณค่าเช่าอัตโนมัติ
  });

  const handleSave = () => {
    alert("บันทึกการตั้งค่าเรียบร้อยแล้ว");
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h2 className="text-3xl font-bold text-app mb-2 font-display">ตั้งค่า - M2</h2>
        <p className="text-muted font-light">
          จัดการการตั้งค่าสำหรับโมดูลจัดการพื้นที่เช่า (M2) รองรับทุกประเภทร้านที่เช่าพื้นที่ในปั๊ม (FIT Auto, Chester&apos;s, Daiso, Quick, ร้าน EV, ฯลฯ) ครอบคลุม 5 ปั๊ม
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="panel rounded-2xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-app">การตั้งค่าการแจ้งเตือน</h3>
          <SettingsIcon className="w-6 h-6 text-muted" />
        </div>
        <div className="space-y-4">
          <div>
            <div className="block text-sm font-medium text-app mb-2">แจ้งเตือนหนี้ค้างชำระ (วัน)</div>
            <div className="flex gap-2">
              {settings.alertDays.map((day) => (
                <span key={day} className="px-3 py-2 bg-ptt-blue/10 text-ptt-cyan border border-ptt-blue/30 rounded-lg text-sm">
                  {day} วัน
                </span>
              ))}
            </div>
            <p className="text-xs text-muted mt-1">ระบบจะแจ้งเตือนเมื่อหนี้ค้างชำระ 7, 15, 30 วัน</p>
          </div>
          <div className="flex items-center gap-2">
            <input
              id="settings-auto-calc"
              type="checkbox"
              checked={settings.autoCalculate}
              onChange={(e) => setSettings({ ...settings, autoCalculate: e.target.checked })}
              className="w-4 h-4"
            />
            <label htmlFor="settings-auto-calc" className="text-sm text-app">คำนวณค่าเช่าอัตโนมัติจากสัญญาเช่า</label>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="panel rounded-2xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-app">การเชื่อมต่อโมดูล</h3>
          <LinkIcon className="w-6 h-6 text-muted" />
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-soft rounded-xl border border-app">
            <div className="flex items-center gap-3">
              <SettingsIcon className="w-5 h-5 text-ptt-cyan" />
              <div>
                <p className="font-medium text-app">M1: ดึงยอดขายร้าน → คำนวณ % ค่าเช่า</p>
                <p className="text-sm text-muted">
                  ดึงยอดขายร้าน (เช่น Chester&apos;s) จาก M1 → คำนวณ % ค่าเช่าอัตโนมัติ
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <span className="sr-only">เชื่อมต่อ M1</span>
              <input
                type="checkbox"
                checked={settings.connectToModule1}
                onChange={(e) => setSettings({ ...settings, connectToModule1: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-soft peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-app after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-ptt-blue"></div>
            </label>
          </div>
          <div className="flex items-center justify-between p-4 bg-soft rounded-xl border border-app">
            <div className="flex items-center gap-3">
              <SettingsIcon className="w-5 h-5 text-purple-400" />
              <div>
                <p className="font-medium text-app">M6: ส่งค่าเช่าเข้า → รายได้/ค่าใช้จ่าย</p>
                <p className="text-sm text-muted">
                  ส่งค่าเช่าเข้า → รายได้ (4110) / ค่าใช้จ่าย (5120)
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <span className="sr-only">เชื่อมต่อ M6</span>
              <input
                type="checkbox"
                checked={settings.connectToModule6}
                onChange={(e) => setSettings({ ...settings, connectToModule6: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-soft peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-app after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-ptt-blue"></div>
            </label>
          </div>
          <div className="flex items-center justify-between p-4 bg-soft rounded-xl border border-app">
            <div className="flex items-center gap-3">
              <SettingsIcon className="w-5 h-5 text-emerald-400" />
              <div>
                <p className="font-medium text-app">M7: แสดงในแดชบอร์ดรวม</p>
                <p className="text-sm text-muted">
                  แสดง &quot;รายได้ค่าเช่า vs ค่าใช้จ่ายเช่า&quot;
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <span className="sr-only">เชื่อมต่อ M7</span>
              <input
                type="checkbox"
                checked={settings.connectToModule7}
                onChange={(e) => setSettings({ ...settings, connectToModule7: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-soft peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-app after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-ptt-blue"></div>
            </label>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex justify-end"
      >
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-3 bg-ptt-blue text-white rounded-lg hover:bg-ptt-blue/90 transition-colors"
        >
          <Save className="w-4 h-4" />
          <span>บันทึกการตั้งค่า</span>
        </button>
      </motion.div>
    </div>
  );
}

