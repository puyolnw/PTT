import { useState } from "react";
import { Settings as SettingsIcon, Save, Fuel, Link as LinkIcon, Droplet } from "lucide-react";

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
    <div className="p-6 max-w-[1600px] mx-auto space-y-6">
      {/* Header Section */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Droplet className="h-8 w-8 text-blue-600" />
          ตั้งค่า - M1
        </h2>
        <p className="text-slate-500 text-sm mt-1">
          จัดการการตั้งค่าสำหรับโมดูลบริหารจัดการปั๊มน้ำมัน (M1) รองรับ 5 ปั๊ม (1 สำนักงานใหญ่ + 4 สาขา) นำเข้าข้อมูลจาก PTT BackOffice (Excel)
        </p>
      </div>

      {/* System Information */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-slate-800">ข้อมูลระบบ</h3>
          <Fuel className="w-6 h-6 text-gray-500" />
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">เส้นทาง Export จาก PTT BackOffice</label>
            <input
              type="text"
              value={settings.exportPath}
              onChange={(e) => setSettings({ ...settings, exportPath: e.target.value })}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="\\\\server\\ptt_exports\\"
            />
            <p className="text-xs text-gray-500 mt-1">
              Location: {settings.exportPath} (Owner: ผู้จัดการสถานี)
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">เวลานำเข้าอัตโนมัติ</label>
              <input
                type="time"
                value={settings.importTime}
                onChange={(e) => setSettings({ ...settings, importTime: e.target.value })}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">06:00-08:00 (แนะนำ)</p>
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.autoImport}
                  onChange={(e) => setSettings({ ...settings, autoImport: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-slate-800">นำเข้าอัตโนมัติ</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Module Connections */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-slate-800">การเชื่อมต่อโมดูล</h3>
          <LinkIcon className="w-6 h-6 text-gray-500" />
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
            <div className="flex items-center gap-3">
              <SettingsIcon className="w-5 h-5 text-purple-600" />
              <div>
                <p className="font-medium text-slate-800">M6: ส่งยอดขาย → ลงบัญชี</p>
                <p className="text-sm text-gray-500">
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
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
            <div className="flex items-center gap-3">
              <SettingsIcon className="w-5 h-5 text-emerald-600" />
              <div>
                <p className="font-medium text-slate-800">M7: แสดงในแดชบอร์ดรวม</p>
                <p className="text-sm text-gray-500">
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
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm"
        >
          <Save className="w-4 h-4" />
          <span>บันทึกการตั้งค่า</span>
        </button>
      </div>
    </div>
  );
}
