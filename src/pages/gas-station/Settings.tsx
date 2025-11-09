import { useState } from "react";
import { motion } from "framer-motion";
import { Settings as SettingsIcon, Save, Fuel, Link as LinkIcon } from "lucide-react";

export default function Settings() {
  const [settings, setSettings] = useState({
    connectToModule6: true, // เชื่อมต่อโมดูล M6 (ส่งยอดขาย → ลงบัญชี)
    connectToModule7: true, // เชื่อมต่อโมดูล M7 (แสดงแดชบอร์ดรวม)
    exportPath: "\\\\server\\ptt_exports\\",
    autoImport: false,
    importTime: "06:00",
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
        <h2 className="text-3xl font-bold text-app mb-2 font-display">ตั้งค่า - M1</h2>
        <p className="text-muted font-light">
          จัดการการตั้งค่าสำหรับโมดูลบริหารจัดการปั๊มน้ำมัน (M1) รองรับ 5 ปั๊ม (1 สำนักงานใหญ่ + 4 สาขา) นำเข้าข้อมูลจาก PTT BackOffice (Excel)
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="panel rounded-2xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-app">ข้อมูลระบบ</h3>
          <Fuel className="w-6 h-6 text-muted" />
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-app mb-2">เส้นทาง Export จาก PTT BackOffice</label>
            <input
              type="text"
              value={settings.exportPath}
              onChange={(e) => setSettings({ ...settings, exportPath: e.target.value })}
              className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
              placeholder="\\\\server\\ptt_exports\\"
            />
            <p className="text-xs text-muted mt-1">
              Location: {settings.exportPath} (Owner: ผู้จัดการสถานี)
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-app mb-2">เวลานำเข้าอัตโนมัติ</label>
              <input
                type="time"
                value={settings.importTime}
                onChange={(e) => setSettings({ ...settings, importTime: e.target.value })}
                className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
              />
              <p className="text-xs text-muted mt-1">06:00-08:00 (แนะนำ)</p>
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.autoImport}
                  onChange={(e) => setSettings({ ...settings, autoImport: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-sm text-app">นำเข้าอัตโนมัติ</span>
              </label>
            </div>
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
              <SettingsIcon className="w-5 h-5 text-purple-400" />
              <div>
                <p className="font-medium text-app">M6: ส่งยอดขาย → ลงบัญชี</p>
                <p className="text-sm text-muted">
                  ยอดขาย → รายได้ 4110
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
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
                  เปรียบเทียบกับโมดูลอื่น
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
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

