import { motion } from "framer-motion";
import { User, Lock, Bell, Palette, Globe, Clock, Calendar, Settings as SettingsIcon } from "lucide-react";

const settingsSections = [
  {
    title: "ข้อมูลส่วนตัว",
    description: "จัดการข้อมูลโปรไฟล์และบัญชีของคุณ",
    icon: User,
    color: "from-ptt-blue to-ptt-cyan",
  },
  {
    title: "ความปลอดภัย",
    description: "ตั้งค่ารหัสผ่านและการรักษาความปลอดภัย",
    icon: Lock,
    color: "from-purple-500 to-pink-500",
  },
  {
    title: "การแจ้งเตือน",
    description: "จัดการการแจ้งเตือนและอีเมล",
    icon: Bell,
    color: "from-green-500 to-emerald-500",
  },
  {
    title: "ธีมและการแสดงผล",
    description: "ปรับแต่งรูปแบบการแสดงผล",
    icon: Palette,
    color: "from-orange-500 to-red-500",
  },
  {
    title: "ภาษา",
    description: "เลือกภาษาที่ต้องการใช้งาน",
    icon: Globe,
    color: "from-blue-500 to-indigo-500",
  },
  {
    title: "เวลาเข้า-ออกงาน",
    description: "กำหนดเวลามาตรฐานและค่าความคลาดเคลื่อน",
    icon: Clock,
    color: "from-cyan-500 to-blue-500",
  },
  {
    title: "ประเภทการลา",
    description: "จัดการประเภทการลาและโควตา",
    icon: Calendar,
    color: "from-yellow-500 to-orange-500",
  },
  {
    title: "สิทธิ์การใช้งาน",
    description: "กำหนด Role และ Permission ของผู้ใช้",
    icon: SettingsIcon,
    color: "from-red-500 to-pink-500",
  },
];

export default function Settings() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h2 className="text-3xl font-bold text-app mb-2 font-display">
          ตั้งค่า
        </h2>
        <p className="text-muted font-light">
          จัดการการตั้งค่าและความต้องการของคุณ
        </p>
      </motion.div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {settingsSections.map((section, index) => (
          <motion.button
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="panel border border-app rounded-2xl p-6 hover:border-ptt-blue/30 transition-all duration-200 text-left"
          >
            <div className="flex items-start space-x-4">
              <div
                className={`p-3 rounded-xl bg-gradient-to-br ${section.color} shrink-0`}
              >
                <section.icon className="w-6 h-6 text-app" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-app mb-1">
                  {section.title}
                </h3>
                <p className="text-sm text-muted">
                  {section.description}
                </p>
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Account Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="panel border border-app rounded-2xl p-6 mt-8"
      >
        <h3 className="text-xl font-semibold mb-4 text-app">
          ข้อมูลบัญชี
        </h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center p-4 bg-soft rounded-xl">
            <span className="text-muted">อีเมล</span>
            <span className="text-app">user@ptt.com</span>
          </div>
          <div className="flex justify-between items-center p-4 bg-soft rounded-xl">
            <span className="text-muted">บทบาท</span>
            <span className="text-ptt-cyan font-medium">ผู้ดูแลระบบ</span>
          </div>
          <div className="flex justify-between items-center p-4 bg-soft rounded-xl">
            <span className="text-muted">สมาชิกตั้งแต่</span>
            <span className="text-app">1 มกราคม 2024</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

