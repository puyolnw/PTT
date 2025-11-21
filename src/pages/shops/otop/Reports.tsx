import { motion } from "framer-motion";
import {
  BarChart3,
  PieChart,
  Activity,
  Target,
  Award,
  Leaf,
  Calendar,
  TrendingUp,
} from "lucide-react";
import { useShop } from "@/contexts/ShopContext";

const currencyFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat("th-TH");

const kpis = [
  { title: "ยอดขายรวมเดือนนี้", value: 610000, change: "+6.2%" },
  { title: "กำไรขั้นต้น", value: 190000, change: "+3.5%" },
  { title: "สัดส่วนสินค้า OTOP 5 ดาว", value: 54, suffix: "%", change: "+2%" },
  { title: "ลูกค้าใช้คูปอง PTT", value: 420, suffix: " คน", change: "+12%" },
];

const mix = [
  { label: "งานผ้า", value: 32 },
  { label: "อาหาร/ของฝาก", value: 28 },
  { label: "สุขภาพ/สมุนไพร", value: 18 },
  { label: "หัตถกรรม", value: 15 },
  { label: "อื่น ๆ", value: 7 },
];

const provinces = [
  { name: "สุรินทร์", orders: 18, value: 120000 },
  { name: "เชียงใหม่", orders: 14, value: 98000 },
  { name: "ลำพูน", orders: 10, value: 64000 },
  { name: "นครราชสีมา", orders: 9, value: 72000 },
  { name: "สุโขทัย", orders: 7, value: 54000 },
];

const milestones = [
  {
    title: "OTOP New Year Fair",
    date: "ธ.ค. 2024",
    target: "ยอดขาย 800k",
    progress: 75,
  },
  {
    title: "คูปอง PTT Blue Card",
    date: "ม.ค. 2025",
    target: "แลกใช้ 1,000 ใบ",
    progress: 48,
  },
  {
    title: "โครงการอบรมชุมชน",
    date: "ก.พ. 2025",
    target: "เพิ่ม Artisan 10 กลุ่ม",
    progress: 30,
  },
];

export default function OtopReports() {
  const { currentShop } = useShop();
  const shopName = currentShop?.name || "ร้าน OTOP ชุมชน";

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h2 className="text-3xl font-bold text-app mb-2 font-display">รายงาน - {shopName}</h2>
        <p className="text-muted font-light">
          รายงานประจำเดือนสำหรับสินค้าชุมชนในพื้นที่ปั๊ม ครอบคลุมยอดขาย สต็อก และกิจกรรมการตลาด OTOP
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {kpis.map((kpi, index) => (
          <motion.div
            key={kpi.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="panel rounded-2xl p-6 hover:border-ptt-blue/30 transition-all duration-200 shadow-app"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-xl bg-ptt-blue/10">
                <BarChart3 className="w-5 h-5 text-ptt-cyan" />
              </div>
              <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {kpi.change}
              </span>
            </div>
            <p className="text-sm text-muted">{kpi.title}</p>
            <p className="text-2xl font-bold text-app mt-1">
              {kpi.suffix ? `${kpi.value}${kpi.suffix}` : currencyFormatter.format(kpi.value)}
            </p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="panel rounded-2xl p-6 shadow-app xl:col-span-2"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-semibold text-app">ยอดขายตามหมวดสินค้า</h3>
              <p className="text-sm text-muted">สัดส่วนหมวดหลักของสินค้า OTOP เดือนปัจจุบัน</p>
            </div>
            <PieChart className="w-6 h-6 text-muted" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mix.map((item) => (
              <div key={item.label} className="p-4 rounded-xl border border-app flex items-center justify-between bg-soft">
                <div>
                  <p className="font-medium text-app">{item.label}</p>
                  <p className="text-xs text-muted">หมวดหลักในพื้นที่</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-ptt-blue">{item.value}%</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="panel rounded-2xl p-6 shadow-app"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-app">Top Provinces</h3>
            <Award className="w-5 h-5 text-muted" />
          </div>
          <div className="space-y-3">
            {provinces.map((prov, idx) => (
              <div key={prov.name} className="flex items-center justify-between p-3 bg-soft rounded-xl border border-app">
                <div>
                  <p className="font-semibold text-app">
                    {idx + 1}. {prov.name}
                  </p>
                  <p className="text-xs text-muted">{numberFormatter.format(prov.orders)} คำสั่งซื้อ</p>
                </div>
                <p className="text-sm font-semibold text-app">
                  {currencyFormatter.format(prov.value)}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="panel rounded-2xl p-6 shadow-app"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-app">กิจกรรมเด่น</h3>
            <Activity className="w-5 h-5 text-muted" />
          </div>
          <div className="space-y-4">
            {milestones.map((milestone) => (
              <div key={milestone.title} className="p-4 rounded-xl border border-app bg-soft">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-app">{milestone.title}</p>
                    <p className="text-xs text-muted">{milestone.date}</p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-ptt-blue/10 text-ptt-cyan border border-ptt-blue/30">
                    {milestone.target}
                  </span>
                </div>
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs text-muted mb-1">
                    <span>ความคืบหน้า</span>
                    <span>{milestone.progress}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-soft">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-ptt-blue to-ptt-cyan"
                      style={{ width: `${milestone.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="panel rounded-2xl p-6 shadow-app xl:col-span-2"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xlฟ font-semibold text-app">Timeline รายงาน</h3>
              <p className="text-sm text-muted">รอบส่งรายงานแก่สำนักงานพัฒนาชุมชน</p>
            </div>
            <Calendar className="w-5 h-5 text-muted" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border border-app rounded-xl bg-soft">
              <p className="text-xs text-muted uppercase tracking-wide mb-1">Weekly</p>
              <p className="text-lg font-semibold text-app">ยอดขาย + สต็อก</p>
              <p className="text-xs text-muted mt-2">ส่งทุกวันจันทร์ 09:00 น.</p>
            </div>
            <div className="p-4 border border-app rounded-xl bg-soft">
              <p className="text-xs text-muted uppercase tracking-wide mb-1">Monthly</p>
              <p className="text-lg font-semibold text-app">Summary to PTT HQ</p>
              <p className="text-xs text-muted mt-2">วันที่ 5 ของทุกเดือน</p>
            </div>
            <div className="p-4 border border-app rounded-xl bg-soft">
              <p className="text-xs text-muted uppercase tracking-wide mb-1">Quarterly</p>
              <p className="text-lg font-semibold text-app">OTOP Activity KPI</p>
              <p className="text-xs text-muted mt-2">รอบ Q1-Q4 สำหรับจังหวัด</p>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="panel/40 border border-app rounded-2xl p-6"
      >
        <h3 className="text-lg font-semibold text-app mb-4 font-display">สรุปข้อเสนอแนะ</h3>
        <ul className="space-y-3 text-sm text-muted">
          <li className="p-3 bg-soft rounded-xl border border-app">
            • เพิ่มกิจกรรม Live สดโปรโมตสินค้า 5 ดาวก่อนเทศกาลปีใหม่
          </li>
          <li className="p-3 bg-soft rounded-xl border border-app">
            • จัดชุดของฝากรวม (Bundle) สำหรับลูกค้าองค์กรที่เข้าปั๊ม
          </li>
          <li className="p-3 bg-soft rounded-xl border border-app">
            • อัปเดตข้อมูลผู้ผลิตรายใหม่ในระบบ POS เพื่อรองรับ Artisan ใหม่ 12 กลุ่ม
          </li>
        </ul>
      </motion.div>
    </div>
  );
}


