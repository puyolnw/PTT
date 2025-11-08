import { motion } from "framer-motion";
import { Users, UserCircle } from "lucide-react";
import { organization } from "@/data/mockData";

export default function Organization() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-app mb-2 font-display">
          โครงสร้างองค์กร
          </h1>
        <p className="text-muted font-light">
          แผนผังแผนกและทีมงาน
        </p>
      </div>

      {/* Organization Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {organization.map((dept, index) => (
          <motion.div
            key={dept.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-soft border border-app rounded-2xl p-6 shadow-xl 
                     hover:border-ptt-blue/30 transition-all duration-200"
          >
            {/* Department Header */}
            <div className="flex items-center gap-4 mb-6 pb-4 border-b border-app">
              <div className="p-3 bg-gradient-to-br from-ptt-blue to-ptt-cyan rounded-xl">
                <Users className="w-6 h-6 text-app" strokeWidth={1.5} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-app font-display">
                  {dept.name}
                </h2>
                <p className="text-sm text-muted font-light">
                  {dept.memberCount} สมาชิก
                </p>
              </div>
            </div>

            {/* Head */}
            <div className="mb-4">
              <p className="text-xs text-muted uppercase tracking-wide mb-2">
                หัวหน้าแผนก
              </p>
              <div className="flex items-center gap-3 p-3 bg-soft rounded-xl">
                <UserCircle className="w-8 h-8 text-ptt-cyan" />
                <div>
                  <p className="text-app font-medium">{dept.head}</p>
                  <p className="text-xs text-muted">{dept.headCode}</p>
                </div>
              </div>
            </div>

            {/* Members */}
            {dept.memberCount > 0 && (
              <div>
                <p className="text-xs text-muted uppercase tracking-wide mb-2">
                  สมาชิก ({dept.memberCount})
                </p>
                <div className="space-y-2">
                  {dept.members.map((memberCode) => (
                    <div
                      key={memberCode}
                      className="flex items-center gap-3 p-2 bg-soft rounded-lg"
                    >
                      <div className="w-6 h-6 bg-ptt-blue/20 rounded-full flex items-center justify-center">
                        <span className="text-xs text-ptt-cyan">•</span>
                      </div>
                      <p className="text-sm text-app font-light">{memberCode}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {dept.memberCount === 0 && (
              <p className="text-sm text-muted text-center py-4 italic">
                ไม่มีสมาชิก
              </p>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

