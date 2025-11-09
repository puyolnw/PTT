import { motion } from "framer-motion";
import { Save, Building, Calculator, FileText } from "lucide-react";
import { useState } from "react";

// Mock data - Settings
const mockSettings = {
  company: {
    name: "บริษัท เอ บี ซี จำกัด",
    code: "LE-001",
    taxId: "0123456789012",
    address: "123 ถนนสุขุมวิท กรุงเทพมหานคร 10110",
    phone: "02-123-4567",
    email: "info@abc.co.th",
  },
  accounting: {
    currency: "THB",
    vatRate: 7,
    fiscalYearStart: "01-01",
    fiscalYearEnd: "12-31",
    autoPostJournal: true,
    autoCalculateTax: true,
  },
  integration: {
    m1Enabled: true,
    m2Enabled: true,
    m3Enabled: true,
    m5Enabled: true,
    autoSync: true,
    syncInterval: "daily",
  },
};

export default function AccountingSettings() {
  const [settings, setSettings] = useState(mockSettings);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h2 className="text-3xl font-bold text-app mb-2 font-display">ตั้งค่าระบบบัญชี</h2>
        <p className="text-muted font-light">
          ตั้งค่าบริษัท, ภาษี, และการเชื่อมต่อกับโมดูลอื่น
        </p>
      </motion.div>

      {/* Company Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="panel rounded-2xl p-6 shadow-app"
      >
        <div className="flex items-center gap-3 mb-6">
          <Building className="w-6 h-6 text-ptt-cyan" />
          <h3 className="text-xl font-semibold text-app">ข้อมูลบริษัท</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-muted mb-2">ชื่อบริษัท</label>
            <input
              type="text"
              value={settings.company.name}
              onChange={(e) => setSettings({ ...settings, company: { ...settings.company, name: e.target.value } })}
              className="w-full px-4 py-2 bg-soft border border-app rounded-xl text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue/30"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted mb-2">รหัสนิติบุคคล</label>
            <input
              type="text"
              value={settings.company.code}
              onChange={(e) => setSettings({ ...settings, company: { ...settings.company, code: e.target.value } })}
              className="w-full px-4 py-2 bg-soft border border-app rounded-xl text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue/30"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted mb-2">เลขประจำตัวผู้เสียภาษี</label>
            <input
              type="text"
              value={settings.company.taxId}
              onChange={(e) => setSettings({ ...settings, company: { ...settings.company, taxId: e.target.value } })}
              className="w-full px-4 py-2 bg-soft border border-app rounded-xl text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue/30"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted mb-2">เบอร์โทรศัพท์</label>
            <input
              type="text"
              value={settings.company.phone}
              onChange={(e) => setSettings({ ...settings, company: { ...settings.company, phone: e.target.value } })}
              className="w-full px-4 py-2 bg-soft border border-app rounded-xl text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue/30"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-muted mb-2">ที่อยู่</label>
            <textarea
              value={settings.company.address}
              onChange={(e) => setSettings({ ...settings, company: { ...settings.company, address: e.target.value } })}
              rows={3}
              className="w-full px-4 py-2 bg-soft border border-app rounded-xl text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue/30"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-muted mb-2">อีเมล</label>
            <input
              type="email"
              value={settings.company.email}
              onChange={(e) => setSettings({ ...settings, company: { ...settings.company, email: e.target.value } })}
              className="w-full px-4 py-2 bg-soft border border-app rounded-xl text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue/30"
            />
          </div>
        </div>
      </motion.div>

      {/* Accounting Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="panel rounded-2xl p-6 shadow-app"
      >
        <div className="flex items-center gap-3 mb-6">
          <Calculator className="w-6 h-6 text-ptt-cyan" />
          <h3 className="text-xl font-semibold text-app">ตั้งค่าบัญชี</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-muted mb-2">สกุลเงิน</label>
            <select
              value={settings.accounting.currency}
              onChange={(e) => setSettings({ ...settings, accounting: { ...settings.accounting, currency: e.target.value } })}
              className="w-full px-4 py-2 bg-soft border border-app rounded-xl text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue/30"
            >
              <option value="THB">THB (บาทไทย)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted mb-2">อัตรา VAT (%)</label>
            <input
              type="number"
              value={settings.accounting.vatRate}
              onChange={(e) => setSettings({ ...settings, accounting: { ...settings.accounting, vatRate: Number(e.target.value) } })}
              className="w-full px-4 py-2 bg-soft border border-app rounded-xl text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue/30"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted mb-2">ปีบัญชีเริ่มต้น</label>
            <input
              type="date"
              value={`2024-${settings.accounting.fiscalYearStart}`}
              onChange={(e) => {
                const date = e.target.value.split("-");
                setSettings({ ...settings, accounting: { ...settings.accounting, fiscalYearStart: `${date[2]}-${date[1]}` } });
              }}
              className="w-full px-4 py-2 bg-soft border border-app rounded-xl text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue/30"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted mb-2">ปีบัญชีสิ้นสุด</label>
            <input
              type="date"
              value={`2024-${settings.accounting.fiscalYearEnd}`}
              onChange={(e) => {
                const date = e.target.value.split("-");
                setSettings({ ...settings, accounting: { ...settings.accounting, fiscalYearEnd: `${date[2]}-${date[1]}` } });
              }}
              className="w-full px-4 py-2 bg-soft border border-app rounded-xl text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue/30"
            />
          </div>
          <div className="md:col-span-2">
            <div className="flex items-center justify-between p-4 bg-soft rounded-xl border border-app">
              <div>
                <p className="font-medium text-app">ลงบัญชีอัตโนมัติ</p>
                <p className="text-sm text-muted">ลง Journal Entry อัตโนมัติเมื่อได้รับข้อมูลจากโมดูลอื่น</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.accounting.autoPostJournal}
                  onChange={(e) => setSettings({ ...settings, accounting: { ...settings.accounting, autoPostJournal: e.target.checked } })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-ptt-blue/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-app after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-app after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-ptt-blue"></div>
              </label>
            </div>
          </div>
          <div className="md:col-span-2">
            <div className="flex items-center justify-between p-4 bg-soft rounded-xl border border-app">
              <div>
                <p className="font-medium text-app">คำนวณภาษีอัตโนมัติ</p>
                <p className="text-sm text-muted">คำนวณ VAT และภาษีหัก ณ ที่จ่ายอัตโนมัติ</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.accounting.autoCalculateTax}
                  onChange={(e) => setSettings({ ...settings, accounting: { ...settings.accounting, autoCalculateTax: e.target.checked } })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-ptt-blue/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-app after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-app after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-ptt-blue"></div>
              </label>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Integration Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="panel rounded-2xl p-6 shadow-app"
      >
        <div className="flex items-center gap-3 mb-6">
          <FileText className="w-6 h-6 text-ptt-cyan" />
          <h3 className="text-xl font-semibold text-app">การเชื่อมต่อกับโมดูลอื่น</h3>
        </div>
        <div className="space-y-4">
          {[
            { key: "m1Enabled", label: "M1 - บริหารจัดการปั๊มน้ำมัน", description: "รับข้อมูลยอดขาย, ซื้อเข้า, คูปอง" },
            { key: "m2Enabled", label: "M2 - จัดการพื้นที่เช่า", description: "รับข้อมูลค่าเช่ารับ, ค่าเช่าจ่าย" },
            { key: "m3Enabled", label: "M3 - ระบบบุคคล", description: "รับข้อมูลเงินเดือน, OT, ประกันสังคม" },
            { key: "m5Enabled", label: "M5 - ระบบกองทุน", description: "รับข้อมูลกู้ยืม, ชำระหนี้, ดอกเบี้ย" },
          ].map((module) => (
            <div key={module.key} className="flex items-center justify-between p-4 bg-soft rounded-xl border border-app">
              <div>
                <p className="font-medium text-app">{module.label}</p>
                <p className="text-sm text-muted">{module.description}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.integration[module.key as keyof typeof settings.integration] as boolean}
                  onChange={(e) => setSettings({ ...settings, integration: { ...settings.integration, [module.key]: e.target.checked } })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-ptt-blue/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-app after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-app after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-ptt-blue"></div>
              </label>
            </div>
          ))}
          <div className="flex items-center justify-between p-4 bg-soft rounded-xl border border-app">
            <div>
              <p className="font-medium text-app">ซิงค์ข้อมูลอัตโนมัติ</p>
              <p className="text-sm text-muted">ซิงค์ข้อมูลจากโมดูลอื่นอัตโนมัติ</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.integration.autoSync}
                onChange={(e) => setSettings({ ...settings, integration: { ...settings.integration, autoSync: e.target.checked } })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-ptt-blue/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-app after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-app after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-ptt-blue"></div>
            </label>
          </div>
        </div>
      </motion.div>

      {/* Save Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex justify-end"
      >
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-3 bg-ptt-blue/10 hover:bg-ptt-blue/20 border border-ptt-blue/30 rounded-xl text-ptt-cyan font-semibold transition-colors disabled:opacity-50"
        >
          <Save className="w-5 h-5" />
          <span>{isSaving ? "กำลังบันทึก..." : "บันทึกการตั้งค่า"}</span>
        </button>
      </motion.div>
    </div>
  );
}

