import { useState } from "react";
import { motion } from "framer-motion";
import {
  Save,
  ToggleLeft,
  ToggleRight,
  Mail,
  Phone,
  MapPin,
  Users,
  Shield,
  Leaf,
} from "lucide-react";
import { useShop } from "@/contexts/ShopContext";

export default function OtopSettings() {
  const { currentShop } = useShop();
  const shopName = currentShop?.name || "ร้าน OTOP ชุมชน";

  const [formState, setFormState] = useState({
    contactName: "คุณธัญญ์นภัส วงค์วัฒนะ",
    contactPhone: "081-234-5678",
    contactEmail: "otop-community@ptt.co.th",
    location: "อาคารโซนหน้าปั๊ม ติดร้านกาแฟ Café Amazon",
    openTime: "08:00",
    closeTime: "20:00",
    warehouseLocation: "โกดังกลางปั๊ม (คลัง OTOP)",
    supportLine: "Line OA: @OTOPINPTT",
    remarks: "เช็คสินค้าชุมชนล่วงหน้า 3 วันก่อนจัดกิจกรรม",
  });

  const [toggles, setToggles] = useState({
    allowPreOrder: true,
    allowCoupon: true,
    autoNotifyLowStock: true,
    shareSalesToCommunity: false,
  });

  const handleToggle = (key: keyof typeof toggles) => {
    setToggles((prev) => {
      switch (key) {
        case "allowPreOrder":
          return { ...prev, allowPreOrder: !prev.allowPreOrder };
        case "allowCoupon":
          return { ...prev, allowCoupon: !prev.allowCoupon };
        case "autoNotifyLowStock":
          return { ...prev, autoNotifyLowStock: !prev.autoNotifyLowStock };
        case "shareSalesToCommunity":
          return { ...prev, shareSalesToCommunity: !prev.shareSalesToCommunity };
        default:
          return prev;
      }
    });
  };

  const handleChange = (field: keyof typeof formState, value: string) => {
    setFormState((prev) => {
      switch (field) {
        case "contactName":
          return { ...prev, contactName: value };
        case "contactPhone":
          return { ...prev, contactPhone: value };
        case "contactEmail":
          return { ...prev, contactEmail: value };
        case "location":
          return { ...prev, location: value };
        case "openTime":
          return { ...prev, openTime: value };
        case "closeTime":
          return { ...prev, closeTime: value };
        case "warehouseLocation":
          return { ...prev, warehouseLocation: value };
        case "supportLine":
          return { ...prev, supportLine: value };
        case "remarks":
          return { ...prev, remarks: value };
        default:
          return prev;
      }
    });
  };

  const handleSave = () => {
    alert("บันทึกการตั้งค่าเรียบร้อย (mock)");
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
          ตั้งค่าข้อมูลติดต่อช่องทางชุมชน เวลาทำการ และกฎการแจ้งเตือนพิเศษสำหรับสินค้า OTOP
        </p>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="panel rounded-2xl p-6 shadow-app xl:col-span-2 space-y-5"
        >
          <h3 className="text-xl font-semibold text-app flex items-center gap-2">
            <Users className="w-5 h-5 text-ptt-cyan" />
            ข้อมูลติดต่อหลัก
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="otop-settings-contact-name" className="text-sm text-muted mb-1 block">ผู้ประสานงาน</label>
              <input
                id="otop-settings-contact-name"
                type="text"
                value={formState.contactName}
                onChange={(e) => handleChange("contactName", e.target.value)}
                className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
              />
            </div>
            <div>
              <label htmlFor="otop-settings-phone" className="text-sm text-muted mb-1 block">เบอร์ติดต่อ</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-muted absolute left-3 top-3" />
                <input
                  id="otop-settings-phone"
                  type="tel"
                  value={formState.contactPhone}
                  onChange={(e) => handleChange("contactPhone", e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-soft border border-app rounded-lg text-app"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="otop-settings-email" className="text-sm text-muted mb-1 block">อีเมล</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-muted absolute left-3 top-3" />
                <input
                  id="otop-settings-email"
                  type="email"
                  value={formState.contactEmail}
                  onChange={(e) => handleChange("contactEmail", e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-soft border border-app rounded-lg text-app"
                />
              </div>
            </div>
            <div>
              <label htmlFor="otop-settings-social" className="text-sm text-muted mb-1 block">Line / Social</label>
              <input
                id="otop-settings-social"
                type="text"
                value={formState.supportLine}
                onChange={(e) => handleChange("supportLine", e.target.value)}
                className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
                placeholder="@OTOPINPTT"
              />
            </div>
          </div>

          <div>
            <label htmlFor="otop-settings-location" className="text-sm text-muted mb-1 block">ที่ตั้งในปั๊ม</label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-muted absolute left-3 top-3" />
              <textarea
                id="otop-settings-location"
                value={formState.location}
                onChange={(e) => handleChange("location", e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-soft border border-app rounded-lg text-sm text-app"
                rows={2}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="otop-settings-open" className="text-sm text-muted mb-1 block">เปิด</label>
              <input
                id="otop-settings-open"
                type="time"
                value={formState.openTime}
                onChange={(e) => handleChange("openTime", e.target.value)}
                className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
              />
            </div>
            <div>
              <label htmlFor="otop-settings-close" className="text-sm text-muted mb-1 block">ปิด</label>
              <input
                id="otop-settings-close"
                type="time"
                value={formState.closeTime}
                onChange={(e) => handleChange("closeTime", e.target.value)}
                className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
              />
            </div>
            <div>
              <label htmlFor="otop-settings-warehouse" className="text-sm text-muted mb-1 block">คลังสินค้า</label>
              <input
                id="otop-settings-warehouse"
                type="text"
                value={formState.warehouseLocation}
                onChange={(e) => handleChange("warehouseLocation", e.target.value)}
                className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
              />
            </div>
          </div>

          <div>
            <label htmlFor="otop-settings-remarks" className="text-sm text-muted mb-1 block">หมายเหตุ</label>
            <textarea
              id="otop-settings-remarks"
              value={formState.remarks}
              onChange={(e) => handleChange("remarks", e.target.value)}
              className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-sm text-app"
              rows={3}
              placeholder="ระบุการเตรียมสินค้าก่อนจัดกิจกรรม / การส่งเอกสาร"
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="panel rounded-2xl p-6 shadow-app space-y-4"
        >
          <h3 className="text-xl font-semibold text-app flex items-center gap-2">
            <Shield className="w-5 h-5 text-orange-400" />
            นโยบายและการแจ้งเตือน
          </h3>

          {[
            {
              key: "allowPreOrder" as const,
              label: "เปิดรับพรีออเดอร์จากลูกค้าองค์กร/ทัวร์",
              description: "แสดงปุ่มสั่งจองล่วงหน้าบนหน้าร้านออนไลน์",
            },
            {
              key: "allowCoupon" as const,
              label: "เปิดใช้งานคูปอง PTT Blue Card",
              description: "ให้ลูกค้าแลกคูปองกับสินค้า OTOP",
            },
            {
              key: "autoNotifyLowStock" as const,
              label: "แจ้งเตือนสินค้าต่ำกว่าเกณฑ์",
              description: "ส่ง LINE OA ไปยังผู้ดูแลและชุมชนผู้ผลิต",
            },
            {
              key: "shareSalesToCommunity" as const,
              label: "แชร์ยอดขายรายสัปดาห์ให้ชุมชนอัตโนมัติ",
              description: "ส่งรายงานสรุปยอดขายไปยังอีเมลวิสาหกิจ",
            },
          ].map((toggle) => (
            <div
              key={toggle.key}
              className="flex items-start justify-between p-4 bg-soft rounded-xl border border-app"
            >
              <div>
                <p className="font-medium text-app">{toggle.label}</p>
                <p className="text-xs text-muted mt-1">{toggle.description}</p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle(toggle.key)}
                className="ml-4 text-ptt-cyan hover:text-ptt-blue"
              >
                {toggles[toggle.key] ? (
                  <ToggleRight className="w-10 h-10" />
                ) : (
                  <ToggleLeft className="w-10 h-10 text-muted" />
                )}
              </button>
            </div>
          ))}

          <div className="p-4 rounded-xl border border-dashed border-ptt-blue/40 bg-ptt-blue/5 text-sm text-muted flex items-start gap-3">
            <Leaf className="w-5 h-5 text-ptt-cyan mt-0.5" />
            <p>
              ระบบจะส่งอีเมลรายงานอัตโนมัติให้สำนักงานพัฒนาชุมชนและ PTT HQ ทุกวันที่ 5 ของเดือน
              หากเปิดการแชร์ยอดขายรายสัปดาห์
            </p>
          </div>
        </motion.div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="inline-flex items-center gap-2 px-6 py-3 bg-ptt-blue text-white rounded-xl font-semibold hover:bg-ptt-blue/90 transition"
        >
          <Save className="w-4 h-4" />
          บันทึกการตั้งค่า
        </button>
      </div>
    </div>
  );
}


