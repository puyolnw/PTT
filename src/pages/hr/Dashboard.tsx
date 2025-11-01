import { motion } from "framer-motion";
import { TrendingUp, Users, DollarSign, Activity } from "lucide-react";

const stats = [
  {
    title: "รายได้รวม",
    value: "฿2,350,000",
    change: "+12.5%",
    icon: DollarSign,
    color: "from-ptt-blue to-ptt-cyan",
  },
  {
    title: "ผู้ใช้งาน",
    value: "1,234",
    change: "+5.2%",
    icon: Users,
    color: "from-purple-500 to-pink-500",
  },
  {
    title: "การเติบโต",
    value: "23.5%",
    change: "+2.1%",
    icon: TrendingUp,
    color: "from-green-500 to-emerald-500",
  },
  {
    title: "กิจกรรม",
    value: "892",
    change: "+8.3%",
    icon: Activity,
    color: "from-orange-500 to-red-500",
  },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h2 className="text-3xl font-bold text-app mb-2 font-display">
          ภาพรวมระบบ
        </h2>
        <p className="text-muted font-light">
          ข้อมูลสรุปและสถิติของระบบ PTT
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="panel rounded-2xl p-6 hover:border-ptt-blue/30 transition-all duration-200 shadow-app"
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className={`p-3 rounded-xl bg-gradient-to-br ${stat.color}`}
              >
                <stat.icon className="w-6 h-6 text-app" />
              </div>
              <span className="text-green-400 text-sm font-medium">
                {stat.change}
              </span>
            </div>
            <h3 className="text-muted text-sm mb-1">{stat.title}</h3>
            <p className="text-2xl font-bold text-app">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Chart Placeholder */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="panel rounded-2xl p-6 shadow-app"
      >
        <h3 className="text-xl font-semibold mb-4 text-app">
          กราฟแสดงข้อมูล
        </h3>
        <div className="h-64 bg-soft rounded-xl flex items-center justify-center border-app">
          <p className="text-muted">Chart visualization area</p>
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="panel rounded-2xl p-6 shadow-app"
      >
        <h3 className="text-xl font-semibold mb-4 text-app">
          กิจกรรมล่าสุด
        </h3>
        <div className="space-y-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="flex items-center justify-between p-4 bg-soft rounded-xl border-app"
            >
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-ptt-cyan rounded-full"></div>
                <div>
                  <p className="text-app">
                    กิจกรรมที่ {item}
                  </p>
                  <p className="text-sm text-muted">
                    เมื่อ {item} นาทีที่แล้ว
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

