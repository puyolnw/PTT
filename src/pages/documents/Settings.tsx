import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Bell,
  Mail,
  MessageSquare,
  Calendar,
  Save
} from "lucide-react";
import { documentCategories } from "@/data/mockData";

interface NotificationSettings {
  // Expiry notifications
  expiryAlertDays: number[]; // [30, 15, 7]
  expiryAlertChannels: ("email" | "line" | "system")[];
  expiryAlertCategories: number[]; // Category IDs
  
  // Approval notifications
  approvalAlertEnabled: boolean;
  approvalAlertChannels: ("email" | "line" | "system")[];
  
  // Email settings
  emailEnabled: boolean;
  emailAddress: string;
  emailSubject: string;
  
  // Line settings
  lineEnabled: boolean;
  lineToken: string;
  
  // Calendar integration
  calendarEnabled: boolean;
  calendarSyncDays: number; // Days to sync ahead
}

export default function DocumentSettings() {
  const [settings, setSettings] = useState<NotificationSettings>({
    expiryAlertDays: [30, 15, 7],
    expiryAlertChannels: ["email", "system"],
    expiryAlertCategories: [],
    approvalAlertEnabled: true,
    approvalAlertChannels: ["email", "system"],
    emailEnabled: true,
    emailAddress: "admin@ptt.com",
    emailSubject: "แจ้งเตือนเอกสารใกล้หมดอายุ",
    lineEnabled: false,
    lineToken: "",
    calendarEnabled: true,
    calendarSyncDays: 30
  });

  const [customDays, setCustomDays] = useState("");

  const handleSave = () => {
    // Update expiry alert days if custom days provided
    if (customDays) {
      const days = customDays.split(",").map(d => parseInt(d.trim())).filter(d => !isNaN(d));
      if (days.length > 0) {
        setSettings({ ...settings, expiryAlertDays: days });
      }
    }
    alert("บันทึกการตั้งค่าสำเร็จ! (Mock)");
  };

  const handleAddCategory = (categoryId: number) => {
    if (!settings.expiryAlertCategories.includes(categoryId)) {
      setSettings({
        ...settings,
        expiryAlertCategories: [...settings.expiryAlertCategories, categoryId]
      });
    }
  };

  const handleRemoveCategory = (categoryId: number) => {
    setSettings({
      ...settings,
      expiryAlertCategories: settings.expiryAlertCategories.filter(id => id !== categoryId)
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-app mb-2 font-display">
          ตั้งค่าระบบงานเอกสาร
        </h1>
        <p className="text-muted font-light">
          จัดการการตั้งค่าแจ้งเตือนและการบูรณาการ
        </p>
      </div>

      {/* Notification Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-soft border border-app rounded-2xl p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <Bell className="w-6 h-6 text-ptt-cyan" />
          <h2 className="text-xl font-semibold text-app font-display">การตั้งค่าแจ้งเตือน</h2>
        </div>

        {/* Expiry Alert Settings */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-app mb-3">
              แจ้งเตือนเอกสารใกล้หมดอายุ (วันล่วงหน้า)
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {settings.expiryAlertDays.map((day) => (
                <span
                  key={day}
                  className="inline-flex items-center gap-2 px-3 py-1 bg-ptt-blue/20 text-ptt-cyan rounded-lg text-sm"
                >
                  {day} วัน
                  <button
                    onClick={() => {
                      setSettings({
                        ...settings,
                        expiryAlertDays: settings.expiryAlertDays.filter(d => d !== day)
                      });
                    }}
                    className="hover:text-red-400"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={customDays}
                onChange={(e) => setCustomDays(e.target.value)}
                className="flex-1 px-4 py-2.5 bg-ink-800 border border-app rounded-xl
                         text-app placeholder:text-muted
                         focus:outline-none focus:ring-2 focus:ring-ptt-blue"
                placeholder="เพิ่มวัน (คั่นด้วยคอมม่า เช่น 60,45,30)"
              />
              <button
                onClick={() => {
                  const days = customDays.split(",").map(d => parseInt(d.trim())).filter(d => !isNaN(d));
                  if (days.length > 0) {
                    setSettings({
                      ...settings,
                      expiryAlertDays: [...settings.expiryAlertDays, ...days].filter((v, i, a) => a.indexOf(v) === i).sort((a, b) => b - a)
                    });
                    setCustomDays("");
                  }
                }}
                className="px-4 py-2.5 bg-ptt-blue/20 hover:bg-ptt-blue/30 text-ptt-cyan rounded-xl transition-colors"
              >
                เพิ่ม
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-app mb-3">
              ช่องทางการแจ้งเตือน
            </label>
            <div className="space-y-2">
              {(["email", "line", "system"] as const).map((channel) => (
                <label key={channel} className="flex items-center gap-3 p-3 bg-ink-800 rounded-lg cursor-pointer hover:bg-ink-700 transition-colors">
                  <input
                    type="checkbox"
                    checked={settings.expiryAlertChannels.includes(channel)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSettings({
                          ...settings,
                          expiryAlertChannels: [...settings.expiryAlertChannels, channel]
                        });
                      } else {
                        setSettings({
                          ...settings,
                          expiryAlertChannels: settings.expiryAlertChannels.filter(c => c !== channel)
                        });
                      }
                    }}
                    className="w-5 h-5 text-ptt-blue rounded focus:ring-ptt-blue"
                  />
                  <span className="text-sm text-app">
                    {channel === "email" && <><Mail className="w-4 h-4 inline mr-2" />Email</>}
                    {channel === "line" && <><MessageSquare className="w-4 h-4 inline mr-2" />Line</>}
                    {channel === "system" && <><Bell className="w-4 h-4 inline mr-2" />ในระบบ</>}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-app mb-3">
              แจ้งเตือนเฉพาะหมวดหมู่ (เว้นว่าง = ทุกหมวดหมู่)
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {settings.expiryAlertCategories.map((catId) => {
                const cat = documentCategories.find(c => c.id === catId);
                return cat ? (
                  <span
                    key={catId}
                    className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/20 text-green-400 rounded-lg text-sm"
                  >
                    {cat.name}
                    <button
                      onClick={() => handleRemoveCategory(catId)}
                      className="hover:text-red-400"
                    >
                      ×
                    </button>
                  </span>
                ) : null;
              })}
            </div>
            <select
              onChange={(e) => {
                if (e.target.value) {
                  handleAddCategory(Number(e.target.value));
                  e.target.value = "";
                }
              }}
              className="w-full px-4 py-2.5 bg-ink-800 border border-app rounded-xl
                       text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue"
            >
              <option value="">เลือกหมวดหมู่</option>
              {documentCategories
                .filter(cat => !settings.expiryAlertCategories.includes(cat.id))
                .map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
            </select>
          </div>
        </div>
      </motion.div>

      {/* Email Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-soft border border-app rounded-2xl p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <Mail className="w-6 h-6 text-ptt-cyan" />
          <h2 className="text-xl font-semibold text-app font-display">ตั้งค่า Email</h2>
        </div>

        <div className="space-y-4">
          <label className="flex items-center gap-3 p-3 bg-ink-800 rounded-lg cursor-pointer hover:bg-ink-700 transition-colors">
            <input
              type="checkbox"
              checked={settings.emailEnabled}
              onChange={(e) => setSettings({ ...settings, emailEnabled: e.target.checked })}
              className="w-5 h-5 text-ptt-blue rounded focus:ring-ptt-blue"
            />
            <span className="text-sm text-app">เปิดใช้งาน Email</span>
          </label>

          {settings.emailEnabled && (
            <>
              <div>
                <label className="block text-sm font-medium text-app mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={settings.emailAddress}
                  onChange={(e) => setSettings({ ...settings, emailAddress: e.target.value })}
                  className="w-full px-4 py-2.5 bg-ink-800 border border-app rounded-xl
                           text-app placeholder:text-muted
                           focus:outline-none focus:ring-2 focus:ring-ptt-blue"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-app mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  value={settings.emailSubject}
                  onChange={(e) => setSettings({ ...settings, emailSubject: e.target.value })}
                  className="w-full px-4 py-2.5 bg-ink-800 border border-app rounded-xl
                           text-app placeholder:text-muted
                           focus:outline-none focus:ring-2 focus:ring-ptt-blue"
                />
              </div>
            </>
          )}
        </div>
      </motion.div>

      {/* Line Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-soft border border-app rounded-2xl p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <MessageSquare className="w-6 h-6 text-ptt-cyan" />
          <h2 className="text-xl font-semibold text-app font-display">ตั้งค่า Line</h2>
        </div>

        <div className="space-y-4">
          <label className="flex items-center gap-3 p-3 bg-ink-800 rounded-lg cursor-pointer hover:bg-ink-700 transition-colors">
            <input
              type="checkbox"
              checked={settings.lineEnabled}
              onChange={(e) => setSettings({ ...settings, lineEnabled: e.target.checked })}
              className="w-5 h-5 text-ptt-blue rounded focus:ring-ptt-blue"
            />
            <span className="text-sm text-app">เปิดใช้งาน Line</span>
          </label>

          {settings.lineEnabled && (
            <div>
              <label className="block text-sm font-medium text-app mb-2">
                Line Token
              </label>
              <input
                type="text"
                value={settings.lineToken}
                onChange={(e) => setSettings({ ...settings, lineToken: e.target.value })}
                className="w-full px-4 py-2.5 bg-ink-800 border border-app rounded-xl
                         text-app placeholder:text-muted font-mono
                         focus:outline-none focus:ring-2 focus:ring-ptt-blue"
                placeholder="กรอก Line Token"
              />
            </div>
          )}
        </div>
      </motion.div>

      {/* Calendar Integration */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-soft border border-app rounded-2xl p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <Calendar className="w-6 h-6 text-ptt-cyan" />
          <h2 className="text-xl font-semibold text-app font-display">Calendar Integration</h2>
        </div>

        <div className="space-y-4">
          <label className="flex items-center gap-3 p-3 bg-ink-800 rounded-lg cursor-pointer hover:bg-ink-700 transition-colors">
            <input
              type="checkbox"
              checked={settings.calendarEnabled}
              onChange={(e) => setSettings({ ...settings, calendarEnabled: e.target.checked })}
              className="w-5 h-5 text-ptt-blue rounded focus:ring-ptt-blue"
            />
            <span className="text-sm text-app">เปิดใช้งาน Calendar Integration</span>
          </label>

          {settings.calendarEnabled && (
            <div>
              <label className="block text-sm font-medium text-app mb-2">
                จำนวนวันที่จะซิงค์ล่วงหน้า
              </label>
              <input
                type="number"
                value={settings.calendarSyncDays}
                onChange={(e) => setSettings({ ...settings, calendarSyncDays: Number(e.target.value) })}
                className="w-full px-4 py-2.5 bg-ink-800 border border-app rounded-xl
                         text-app placeholder:text-muted
                         focus:outline-none focus:ring-2 focus:ring-ptt-blue"
                min="1"
                max="365"
              />
            </div>
          )}
        </div>
      </motion.div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-500 
                   text-app rounded-xl transition-all duration-200 font-semibold 
                   shadow-lg hover:shadow-xl hover:-translate-y-0.5"
        >
          <Save className="w-5 h-5" />
          บันทึกการตั้งค่า
        </button>
      </div>
    </div>
  );
}

