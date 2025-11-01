import { motion } from "framer-motion";
import { Megaphone, Plus, Calendar } from "lucide-react";
import StatusTag from "@/components/StatusTag";
import { announcements } from "@/data/mockData";

export default function Announcements() {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "ด่วน":
        return "danger";
      case "สำคัญ":
        return "warning";
      default:
        return "info";
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-app mb-2 font-display">
            ข่าวสารและประกาศ
          </h1>
          <p className="text-muted font-light">
            ข่าวสารและประกาศสำหรับพนักงาน
          </p>
        </div>

        <button
          onClick={() => alert("สร้างประกาศใหม่ (Mock)")}
          className="inline-flex items-center gap-2 px-6 py-3 bg-ptt-blue hover:bg-ptt-blue/80 
                   text-app rounded-xl transition-all duration-200 font-semibold 
                   shadow-lg hover:shadow-xl hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5" />
          สร้างประกาศ
        </button>
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {announcements.map((announcement, index) => (
          <motion.div
            key={announcement.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-soft border border-app rounded-2xl p-6 shadow-xl 
                     hover:border-ptt-blue/30 transition-all duration-200 hover:-translate-y-1"
          >
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div className="p-3 bg-ptt-blue/20 rounded-xl shrink-0">
                <Megaphone className="w-6 h-6 text-ptt-cyan" strokeWidth={1.5} />
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h3 className="text-xl font-bold text-app font-display">
                    {announcement.title}
                  </h3>
                  <StatusTag variant={getCategoryColor(announcement.category)}>
                    {announcement.category}
                  </StatusTag>
                </div>

                <p className="text-app font-light mb-4">
                  {announcement.content}
                </p>

                <div className="flex items-center gap-4 text-sm text-muted">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{announcement.date}</span>
                  </div>
                  <span>•</span>
                  <span>โพสต์โดย: {announcement.postedBy}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

