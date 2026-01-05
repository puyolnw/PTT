import { useState } from "react";
import { motion } from "framer-motion";
import { Settings as SettingsIcon, Save, Store } from "lucide-react";
import { useShop } from "@/contexts/ShopContext";

export default function Settings() {
  const { currentShop } = useShop();
  const shopName = currentShop?.name || "ปึงหงี่เชียง";

  const [settings, setSettings] = useState({
    shopName: shopName,
    rent: 5000,
    lowStockThreshold: 20,
    expiryWarningDays: 7,
    email: "",
    phone: "",
    address: "",
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
          จัดการการตั้งค่าสำหรับร้าน
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
            <label htmlFor="pung-ngee-chiang-settings-shop-name" className="block text-sm font-medium text-app mb-2">ชื่อร้าน</label>
            <input
              id="pung-ngee-chiang-settings-shop-name"
              type="text"
              value={settings.shopName}
              onChange={(e) => setSettings({ ...settings, shopName: e.target.value })}
              className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
            />
          </div>
          <div>
            <label htmlFor="pung-ngee-chiang-settings-address" className="block text-sm font-medium text-app mb-2">ที่อยู่</label>
            <input
              id="pung-ngee-chiang-settings-address"
              type="text"
              value={settings.address}
              onChange={(e) => setSettings({ ...settings, address: e.target.value })}
              className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
              placeholder="ที่อยู่ร้าน"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="pung-ngee-chiang-settings-email" className="block text-sm font-medium text-app mb-2">อีเมล</label>
              <input
                id="pung-ngee-chiang-settings-email"
                type="email"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
                placeholder="email@example.com"
              />
            </div>
            <div>
              <label htmlFor="pung-ngee-chiang-settings-phone" className="block text-sm font-medium text-app mb-2">เบอร์โทร</label>
              <input
                id="pung-ngee-chiang-settings-phone"
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
            <label htmlFor="pung-ngee-chiang-settings-low-stock" className="block text-sm font-medium text-app mb-2">
              เกณฑ์แจ้งเตือนสต็อกต่ำ (%)
            </label>
            <input
              id="pung-ngee-chiang-settings-low-stock"
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
            <label htmlFor="pung-ngee-chiang-settings-expiry" className="block text-sm font-medium text-app mb-2">
              แจ้งเตือนก่อนหมดอายุ (วัน)
            </label>
            <input
              id="pung-ngee-chiang-settings-expiry"
              type="number"
              value={settings.expiryWarningDays}
              onChange={(e) => setSettings({ ...settings, expiryWarningDays: Number(e.target.value) })}
              className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
              min="1"
            />
            <p className="text-xs text-muted mt-1">
              ระบบจะแจ้งเตือนเมื่อสินค้าเหลืออายุ {settings.expiryWarningDays} วัน
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
          <label htmlFor="pung-ngee-chiang-settings-rent" className="block text-sm font-medium text-app mb-2">ค่าเช่าพื้นที่ (บาท/เดือน)</label>
          <input
            id="pung-ngee-chiang-settings-rent"
            type="number"
            value={settings.rent}
            onChange={(e) => setSettings({ ...settings, rent: Number(e.target.value) })}
            className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
          />
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

