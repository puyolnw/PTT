import { motion } from "framer-motion";
import { Target, Award, TrendingUp, Users } from "lucide-react";
import { performanceReviews, employees, type PerformanceReview } from "@/data/mockData";

export default function PerformanceReport() {
  const avgScore = performanceReviews.reduce((sum: number, p: PerformanceReview) => sum + p.score, 0) / performanceReviews.length;
  const excellentCount = performanceReviews.filter((p: PerformanceReview) => p.rating === "Excellent").length;
  const goodCount = performanceReviews.filter((p: PerformanceReview) => p.rating === "Good").length;
  const needsImprovement = performanceReviews.filter((p: PerformanceReview) => p.rating === "Needs Improvement").length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-ptt-cyan font-display">รายงานประสิทธิภาพ</h2>
        <p className="text-muted font-light">KPI พนักงาน และผลการประเมิน</p>
      </div>

      {/* Performance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-ptt-blue/10 to-ptt-cyan/10 border border-ptt-blue/20 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-3">
            <Target className="w-8 h-8 text-ptt-cyan" strokeWidth={1.5} />
            <span className="text-xs text-muted">คะแนนเฉลี่ย</span>
          </div>
          <div className="text-3xl font-bold text-app mb-1">
            {avgScore.toFixed(1)}
          </div>
          <p className="text-sm text-muted">คะแนน</p>
        </div>

        <div className="bg-gradient-to-br from-green-500/10 to-green-400/10 border border-green-500/20 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-3">
            <Award className="w-8 h-8 text-green-400" strokeWidth={1.5} />
            <span className="text-xs text-muted">ดีเยี่ยม</span>
          </div>
          <div className="text-3xl font-bold text-app mb-1">
            {excellentCount}
          </div>
          <p className="text-sm text-muted">คน</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-400/10 border border-yellow-500/20 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-3">
            <TrendingUp className="w-8 h-8 text-yellow-400" strokeWidth={1.5} />
            <span className="text-xs text-muted">ดี</span>
          </div>
          <div className="text-3xl font-bold text-app mb-1">
            {goodCount}
          </div>
          <p className="text-sm text-muted">คน</p>
        </div>

        <div className="bg-gradient-to-br from-ptt-red/10 to-red-400/10 border border-ptt-red/20 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-3">
            <Users className="w-8 h-8 text-ptt-red" strokeWidth={1.5} />
            <span className="text-xs text-muted">ต้องพัฒนา</span>
          </div>
          <div className="text-3xl font-bold text-app mb-1">
            {needsImprovement}
          </div>
          <p className="text-sm text-muted">คน</p>
        </div>
      </div>

      {/* Performance Distribution */}
      <div className="panel/40 border border-app rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-app mb-4 font-display">การกระจายคะแนนประสิทธิภาพ</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-app">ดีเยี่ยม (90-100)</span>
              <Award className="w-5 h-5 text-green-400" strokeWidth={1.5} />
            </div>
            <div className="text-3xl font-bold text-green-400 mb-2">{excellentCount}</div>
            <div className="h-2 bg-ink-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-400"
                style={{ width: `${(excellentCount / performanceReviews.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-app">ดี (70-89)</span>
              <TrendingUp className="w-5 h-5 text-yellow-400" strokeWidth={1.5} />
            </div>
            <div className="text-3xl font-bold text-yellow-400 mb-2">{goodCount}</div>
            <div className="h-2 bg-ink-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-yellow-400"
                style={{ width: `${(goodCount / performanceReviews.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="bg-ptt-red/10 border border-ptt-red/20 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-app">ต้องพัฒนา (&lt;70)</span>
              <Users className="w-5 h-5 text-ptt-red" strokeWidth={1.5} />
            </div>
            <div className="text-3xl font-bold text-ptt-red mb-2">{needsImprovement}</div>
            <div className="h-2 bg-ink-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-ptt-red"
                style={{ width: `${(needsImprovement / performanceReviews.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Top Performers */}
      <div className="panel/40 border border-app rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-app mb-4 font-display">พนักงานที่มีผลงานดีเยี่ยม</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {performanceReviews
            .filter((p: PerformanceReview) => p.rating === "Excellent")
            .map((perf: PerformanceReview) => {
              const emp = employees.find(e => e.code === perf.empCode);
              return (
                <div key={perf.id} className="bg-gradient-to-br from-green-500/10 to-green-400/10 border border-green-500/20 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <img 
                      src={emp?.avatar} 
                      alt={emp?.name}
                      className="w-12 h-12 rounded-full ring-2 ring-green-400/30"
                    />
                    <div>
                      <div className="font-semibold text-app">{emp?.name}</div>
                      <div className="text-xs text-muted">{emp?.position}</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-app">คะแนน:</span>
                    <span className="text-2xl font-bold text-green-400">{perf.score}</span>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Performance Trend Chart Placeholder */}
      <div className="panel/40 border border-app rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-app mb-4 font-display">แนวโน้มประสิทธิภาพรายเดือน</h3>
        <div className="h-64 flex items-center justify-center border-2 border-dashed border-app rounded-xl">
          <p className="text-muted">📊 Chart Placeholder (ใช้ Recharts/Chart.js)</p>
        </div>
      </div>
    </motion.div>
  );
}

