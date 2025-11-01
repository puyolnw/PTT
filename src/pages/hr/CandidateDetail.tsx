import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, Phone, Calendar, Star } from "lucide-react";
import StatusTag, { getStatusVariant } from "@/components/StatusTag";
import { candidates } from "@/data/mockData";

export default function CandidateDetail() {
  const { candidateId } = useParams();
  const navigate = useNavigate();

  const candidate = candidates.find((c) => c.id === Number(candidateId));

  if (!candidate) {
    return (
      <div className="text-center py-12">
        <p className="text-muted">ไม่พบข้อมูลผู้สมัคร</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/app/recruitment")}
          className="p-2 hover:bg-ink-800 rounded-lg transition-colors text-muted hover:text-app"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-app font-display">
            ข้อมูลผู้สมัคร
          </h1>
          <p className="text-muted font-light">รายละเอียดและสถานะการสมัคร</p>
        </div>
      </div>

      {/* Candidate Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-soft border border-app rounded-2xl p-6 shadow-xl"
      >
        <div className="flex flex-col md:flex-row items-start gap-6">
          {/* Avatar */}
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-ptt-blue to-ptt-cyan 
                        flex items-center justify-center text-app text-3xl font-bold font-display">
            {candidate.name.charAt(0)}
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold text-app font-display">
                {candidate.name}
              </h2>
              <StatusTag variant={getStatusVariant(candidate.status)}>
                {candidate.status}
              </StatusTag>
            </div>

            <p className="text-muted text-sm mb-4">
              ตำแหน่งที่สมัคร: <span className="text-app font-medium">{candidate.position}</span>
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 text-app">
                <Mail className="w-4 h-4 text-ptt-cyan" />
                <span className="font-light">{candidate.email}</span>
              </div>
              
              <div className="flex items-center gap-2 text-app">
                <Phone className="w-4 h-4 text-ptt-cyan" />
                <span className="font-light">{candidate.phone}</span>
              </div>
              
              <div className="flex items-center gap-2 text-app">
                <Calendar className="w-4 h-4 text-ptt-cyan" />
                <span className="font-light">สมัครเมื่อ: {candidate.appliedDate}</span>
              </div>

              {candidate.interviewDate && (
                <div className="flex items-center gap-2 text-app">
                  <Calendar className="w-4 h-4 text-ptt-cyan" />
                  <span className="font-light">วันสัมภาษณ์: {candidate.interviewDate}</span>
                </div>
              )}

              {candidate.score && (
                <div className="flex items-center gap-2 text-app">
                  <Star className="w-4 h-4 text-ptt-cyan" />
                  <span className="font-light">คะแนนสัมภาษณ์: {candidate.score}/100</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6 pt-6 border-t border-app">
          <button
            className="px-6 py-2.5 bg-ptt-blue hover:bg-ptt-blue/80 text-app rounded-xl 
                     transition-all duration-200 font-semibold"
          >
            อนุมัติ
          </button>
          <button
            className="px-6 py-2.5 bg-yellow-600 hover:bg-yellow-700 text-app rounded-xl 
                     transition-all duration-200 font-semibold"
          >
            นัดสัมภาษณ์
          </button>
          <button
            className="px-6 py-2.5 bg-ptt-red/20 hover:bg-ptt-red/30 text-ptt-red rounded-xl 
                     transition-all duration-200 font-semibold"
          >
            ไม่อนุมัติ
          </button>
        </div>
      </motion.div>
    </div>
  );
}

