import { useState } from "react";
import { motion } from "framer-motion";
import { Settings as SettingsIcon, Save, Store, Link as LinkIcon, Bell, Mail, MessageCircle } from "lucide-react";
import { useShop } from "@/contexts/ShopContext";

export default function Settings() {
  const { currentShop } = useShop();
  const shopName = currentShop?.name || "ร้านเจ้าสัว (Chaosua's)";

  const [settings, setSettings] = useState({
    shopName: shopName,
    rent: 6000,
    lowStockThreshold: 15, // เปอร์เซ็นต์
    expiryWarningDays: 7, // สำคัญสำหรับอาหารแปรรูป
    email: "",
    phone: "",
    address: "",
    connectToModule6: true, // เชื่อมต่อโมดูล M6 (ค่าเช่า)
    connectToModule7: true, // เชื่อมต่อโมดูล M7 (แดชบอร์ดรวม)
    // การแจ้งเตือน
    alertEmail: true, // แจ้งเตือนผ่านอีเมล
    alertLine: false, // แจ้งเตือนผ่าน Line
    alertEmailAddress: "", // อีเมลสำหรับรับแจ้งเตือน
    alertLineToken: "", // Line Token สำหรับรับแจ้งเตือน
    alertLowStock: true, // แจ้งเตือนสินค้าใกล้หมด
    alertExpiry: true, // แจ้งเตือนสินค้าใกล้หมดอายุ
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
        <h2 className="text-3xl font-bold text-app mb-2 font-display">ตั้งค่า - {shopName}</h2>
        <p className="text-muted font-light">
          จัดการการตั้งค่าสำหรับร้านอาหารไทย-จีน ของฝากชื่อดังจากนครราชสีมา
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="panel rounded-2xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-app">ข้อมูลร้าน</h3>
          <Store className="w-6 h-6 text-muted" />
        </div>
        <div className="space-y-4">
          <div>
            <label htmlFor="settings-shop-name" className="block text-sm font-medium text-app mb-2">ชื่อร้าน</label>
            <input
              id="settings-shop-name"
              type="text"
              value={settings.shopName}
              onChange={(e) => setSettings({ ...settings, shopName: e.target.value })}
              className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
            />
          </div>
          <div>
            <label htmlFor="settings-address" className="block text-sm font-medium text-app mb-2">ที่อยู่</label>
            <input
              id="settings-address"
              type="text"
              value={settings.address}
              onChange={(e) => setSettings({ ...settings, address: e.target.value })}
              className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
              placeholder="ที่อยู่ร้าน"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="settings-email" className="block text-sm font-medium text-app mb-2">อีเมล</label>
              <input
                id="settings-email"
                type="email"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
                placeholder="email@example.com"
              />
            </div>
            <div>
              <label htmlFor="settings-phone" className="block text-sm font-medium text-app mb-2">เบอร์โทร</label>
              <input
                id="settings-phone"
                type="tel"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
                placeholder="081-234-5678"
              />
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
          <h3 className="text-xl font-semibold text-app">การตั้งค่าสต็อก</h3>
          <SettingsIcon className="w-6 h-6 text-muted" />
        </div>
        <div className="space-y-4">
          <div>
            <label htmlFor="settings-threshold" className="block text-sm font-medium text-app mb-2">
              เกณฑ์แจ้งเตือนสต็อกต่ำ (%)
            </label>
            <input
              id="settings-threshold"
              type="number"
              value={settings.lowStockThreshold}
              onChange={(e) => setSettings({ ...settings, lowStockThreshold: Number(e.target.value) })}
              className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
              min="0"
              max="100"
            />
            <p className="text-xs text-muted mt-1">
              ระบบจะแจ้งเตือนเมื่อสต็อกต่ำกว่า {settings.lowStockThreshold}% ของเกณฑ์ที่กำหนด
            </p>
          </div>
          <div>
            <label htmlFor="settings-expiry-days" className="block text-sm font-medium text-app mb-2">
              แจ้งเตือนก่อนหมดอายุ (วัน)
            </label>
            <input
              id="settings-expiry-days"
              type="number"
              value={settings.expiryWarningDays}
              onChange={(e) => setSettings({ ...settings, expiryWarningDays: Number(e.target.value) })}
              className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
              min="1"
            />
            <p className="text-xs text-muted mt-1">
              ระบบจะแจ้งเตือนเมื่อสินค้าเหลืออายุ {settings.expiryWarningDays} วัน (เหมาะกับอาหารแปรรูป)
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="panel rounded-2xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-app">ค่าเช่า</h3>
          <SettingsIcon className="w-6 h-6 text-muted" />
        </div>
        <div>
          <label htmlFor="settings-rent" className="block text-sm font-medium text-app mb-2">ค่าเช่าพื้นที่ (บาท/เดือน)</label>
          <input
            id="settings-rent"
            type="number"
            value={settings.rent}
            onChange={(e) => setSettings({ ...settings, rent: Number(e.target.value) })}
            className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
          />
          <p className="text-xs text-muted mt-1">
            ค่าเช่านี้จะถูกบันทึกเป็นรายได้ในโมดูล M6 อัตโนมัติ + VAT
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="panel rounded-2xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-app">การแจ้งเตือน</h3>
          <Bell className="w-6 h-6 text-muted" />
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-soft rounded-xl border border-app">
            <div>
              <p className="font-medium text-app">แจ้งเตือนสินค้าใกล้หมด</p>
              <p className="text-sm text-muted">
                ระบบจะแจ้งเตือนเมื่อสต็อกต่ำกว่าเกณฑ์ที่กำหนด
              </p>
            </div>
            <label htmlFor="settings-alert-low-stock" className="relative inline-flex items-center cursor-pointer">
              <input
                id="settings-alert-low-stock"
                type="checkbox"
                checked={settings.alertLowStock}
                onChange={(e) => setSettings({ ...settings, alertLowStock: e.target.checked })}
                className="sr-only peer"
                aria-label="แจ้งเตือนสินค้าใกล้หมด"
              />
              <div className="w-11 h-6 bg-soft peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-ptt-blue/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-app after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-ptt-blue"></div>
            </label>
          </div>
          <div className="flex items-center justify-between p-4 bg-soft rounded-xl border border-app">
            <div>
              <p className="font-medium text-app">แจ้งเตือนสินค้าใกล้หมดอายุ</p>
              <p className="text-sm text-muted">
                ระบบจะแจ้งเตือนเมื่อสินค้าเหลืออายุน้อยกว่า {settings.expiryWarningDays} วัน
              </p>
            </div>
            <label htmlFor="settings-alert-expiry" className="relative inline-flex items-center cursor-pointer">
              <input
                id="settings-alert-expiry"
                type="checkbox"
                checked={settings.alertExpiry}
                onChange={(e) => setSettings({ ...settings, alertExpiry: e.target.checked })}
                className="sr-only peer"
                aria-label="แจ้งเตือนสินค้าใกล้หมดอายุ"
              />
              <div className="w-11 h-6 bg-soft peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-ptt-blue/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-app after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-ptt-blue"></div>
            </label>
          </div>
          <div className="flex items-center justify-between p-4 bg-soft rounded-xl border border-app">
            <div>
              <p className="font-medium text-app flex items-center gap-2">
                <Mail className="w-4 h-4" />
                แจ้งเตือนผ่านอีเมล
              </p>
              <p className="text-sm text-muted">
                ระบบจะส่งอีเมลแจ้งเตือนเมื่อมีสินค้าใกล้หมดหรือใกล้หมดอายุ
              </p>
            </div>
            <label htmlFor="settings-alert-email" className="relative inline-flex items-center cursor-pointer">
              <input
                id="settings-alert-email"
                type="checkbox"
                checked={settings.alertEmail}
                onChange={(e) => setSettings({ ...settings, alertEmail: e.target.checked })}
                className="sr-only peer"
                aria-label="แจ้งเตือนผ่านอีเมล"
              />
              <div className="w-11 h-6 bg-soft peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-ptt-blue/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-app after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-ptt-blue"></div>
            </label>
          </div>
          {settings.alertEmail && (
            <div>
              <label htmlFor="settings-alert-email-address" className="block text-sm font-medium text-app mb-2">อีเมลสำหรับรับแจ้งเตือน</label>
              <input
                id="settings-alert-email-address"
                type="email"
                value={settings.alertEmailAddress}
                onChange={(e) => setSettings({ ...settings, alertEmailAddress: e.target.value })}
                className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
                placeholder="alert@example.com"
              />
            </div>
          )}
          <div className="flex items-center justify-between p-4 bg-soft rounded-xl border border-app">
            <div>
              <p className="font-medium text-app flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                แจ้งเตือนผ่าน Line
              </p>
              <p className="text-sm text-muted">
                ระบบจะส่งข้อความ Line แจ้งเตือนเมื่อมีสินค้าใกล้หมดหรือใกล้หมดอายุ
              </p>
            </div>
            <label htmlFor="settings-alert-line" className="relative inline-flex items-center cursor-pointer">
              <input
                id="settings-alert-line"
                type="checkbox"
                checked={settings.alertLine}
                onChange={(e) => setSettings({ ...settings, alertLine: e.target.checked })}
                className="sr-only peer"
                aria-label="แจ้งเตือนผ่าน Line"
              />
              <div className="w-11 h-6 bg-soft peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-ptt-blue/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-app after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-ptt-blue"></div>
            </label>
          </div>
          {settings.alertLine && (
            <div>
              <label htmlFor="settings-alert-line-token" className="block text-sm font-medium text-app mb-2">Line Token</label>
              <input
                id="settings-alert-line-token"
                type="text"
                value={settings.alertLineToken}
                onChange={(e) => setSettings({ ...settings, alertLineToken: e.target.value })}
                className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
                placeholder="xxxxxxxxxxxxxxxxxxxx"
              />
              <p className="text-xs text-muted mt-1">
                Line Token สำหรับส่งข้อความแจ้งเตือน (สามารถขอได้จาก Line Notify)
              </p>
            </div>
          )}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="panel rounded-2xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-app">เชื่อมต่อโมดูลอื่น</h3>
          <LinkIcon className="w-6 h-6 text-muted" />
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-soft rounded-xl border border-app">
            <div>
              <p className="font-medium text-app">โมดูล M6: บันทึกค่าเช่าเป็นรายได้</p>
              <p className="text-sm text-muted">
                ค่าเช่าร้านเจ้าสัวจะถูกบันทึกเป็นรายได้ประจำเดือนอัตโนมัติ + VAT
              </p>
            </div>
            <label htmlFor="settings-connect-m6" className="relative inline-flex items-center cursor-pointer">
              <input
                id="settings-connect-m6"
                type="checkbox"
                checked={settings.connectToModule6}
                onChange={(e) => setSettings({ ...settings, connectToModule6: e.target.checked })}
                className="sr-only peer"
                aria-label="โมดูล M6: บันทึกค่าเช่าเป็นรายได้"
              />
              <div className="w-11 h-6 bg-soft peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-ptt-blue/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-app after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-ptt-blue"></div>
            </label>
          </div>
          <div className="flex items-center justify-between p-4 bg-soft rounded-xl border border-app">
            <div>
              <p className="font-medium text-app">โมดูล M7: แสดงในแดชบอร์ดรวม</p>
              <p className="text-sm text-muted">
                ข้อมูลยอดขายและกำไรจะแสดงในแดชบอร์ดรวมอัตโนมัติ (เปรียบเทียบกับร้านอื่น)
              </p>
            </div>
            <label htmlFor="settings-connect-m7" className="relative inline-flex items-center cursor-pointer">
              <input
                id="settings-connect-m7"
                type="checkbox"
                checked={settings.connectToModule7}
                onChange={(e) => setSettings({ ...settings, connectToModule7: e.target.checked })}
                className="sr-only peer"
                aria-label="โมดูล M7: แสดงในแดชบอร์ดรวม"
              />
              <div className="w-11 h-6 bg-soft peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-ptt-blue/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-app after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-ptt-blue"></div>
            </label>
          </div>
        </div>
      </motion.div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-3 bg-ptt-blue text-white rounded-lg hover:bg-ptt-blue/90 transition-colors"
        >
          <Save className="w-4 h-4" />
          <span>บันทึกการตั้งค่า</span>
        </button>
      </div>
    </div>
  );
}

