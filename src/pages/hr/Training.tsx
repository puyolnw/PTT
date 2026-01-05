import { motion } from "framer-motion";
import { GraduationCap, Users, Plus } from "lucide-react";
import StatusTag from "@/components/StatusTag";
import { getStatusVariant } from "@/utils/statusHelpers";
import { courses } from "@/data/mockData";

export default function Training() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-app mb-2 font-display">
            ฝึกอบรม
          </h1>
          <p className="text-muted font-light">
            รายการคอร์สฝึกอบรมสำหรับพนักงาน
          </p>
        </div>

        <button
          onClick={() => alert("สร้างคอร์สใหม่ (Mock)")}
          className="inline-flex items-center gap-2 px-6 py-3 bg-ptt-blue hover:bg-ptt-blue/80 
                   text-app rounded-xl transition-all duration-200 font-semibold 
                   shadow-lg hover:shadow-xl hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5" />
          สร้างคอร์สใหม่
        </button>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course, index) => (
          <motion.div
            key={course.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-soft border border-app rounded-2xl p-6 shadow-xl 
                     hover:border-ptt-blue/30 transition-all duration-200 hover:-translate-y-1"
          >
            {/* Icon + Status */}
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-ptt-blue/20 rounded-xl">
                <GraduationCap className="w-6 h-6 text-ptt-cyan" strokeWidth={1.5} />
              </div>
              <StatusTag variant={getStatusVariant(course.status)}>
                {course.status}
              </StatusTag>
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold text-app mb-2 font-display line-clamp-2">
              {course.title}
            </h3>

            {/* Description */}
            <p className="text-sm text-muted mb-4 font-light line-clamp-2">
              {course.description}
            </p>

            {/* Info */}
            <div className="space-y-2 mb-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted">วันที่อบรม:</span>
                <span className="text-app font-medium">{course.date}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted">ระยะเวลา:</span>
                <span className="text-app font-medium">{course.duration}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted">ผู้สอน:</span>
                <span className="text-app font-medium">{course.instructor}</span>
              </div>
            </div>

            {/* Seats */}
            <div className="pt-4 border-t border-app">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-muted">
                  <Users className="w-4 h-4" />
                  <span className="text-sm">ที่นั่ง</span>
                </div>
                <span className="text-sm text-app font-medium">
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-ink-800 rounded-full h-2">
                <motion.div
                  className="bg-gradient-to-r from-ptt-blue to-ptt-cyan h-2 rounded-full transition-all w-[var(--progress-width)]"
                  style={{ "--progress-width": `${(course.enrolled / course.seats) * 100}%` } as React.CSSProperties}
                />
              </div>
            </div>

            {/* Button */}
            <button
              className="w-full mt-4 px-4 py-2 bg-ink-800 hover:bg-ink-700 
                       text-slate-200 rounded-lg transition-colors font-medium text-sm"
            >
              ดูรายละเอียด
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

