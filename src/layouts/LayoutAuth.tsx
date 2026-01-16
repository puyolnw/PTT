import { toast } from "sonner";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Lock, User, Building2 } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import AppVersion from "@/components/AppVersion";
import { useAuth } from "@/contexts/AuthContext";
// import { handleError } from "@/utils/errorHandler";

export default function LayoutAuth() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login({
        username,
        password,
        role: "admin",
      });
      navigate("/app");
    } catch (error) {
      console.error("Login failed", error);
      toast.error("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-app relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-ptt-blue/5 via-transparent to-ptt-cyan/5 dark:from-ptt-blue/10 dark:to-ptt-cyan/10"></div>

      <div className="absolute top-4 right-4 md:top-6 md:right-6 z-50">
        <ThemeToggle />
      </div>

      <AppVersion />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md mx-4"
      >
        <div className="panel rounded-2xl shadow-2xl p-8 md:p-10 relative z-10">
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1 }}
              className="w-16 h-16 bg-gradient-to-br from-ptt-blue to-ptt-cyan rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
            >
              <Building2 className="w-9 h-9 text-white" strokeWidth={2} />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-2xl md:text-3xl font-bold text-app font-display mb-2"
            >
              Smart PTT System
            </motion.h1>
            <p className="text-muted text-sm">
              ระบบจัดการภายในสำหรับพนักงาน
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-app mb-2">
                ชื่อผู้ใช้
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="กรอกชื่อผู้ใช้"
                  className="w-full pl-11 pr-4 py-3 bg-soft text-app border border-app rounded-xl focus:ring-2 ring-ptt-blue/50 outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-app mb-2">
                รหัสผ่าน
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="กรอกรหัสผ่าน"
                  className="w-full pl-11 pr-4 py-3 bg-soft text-app border border-app rounded-xl focus:ring-2 ring-ptt-blue/50 outline-none transition-all"
                  required
                />
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-ptt-blue to-ptt-cyan hover:from-ptt-blue/90 hover:to-ptt-cyan/90 text-white font-semibold py-3.5 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  กำลังเข้าสู่ระบบ...
                </span>
              ) : (
                "เข้าสู่ระบบ"
              )}
            </motion.button>
          </form>

          <div className="mt-6 pt-6 border-t border-app text-center">
            <p className="text-xs text-muted">
              🔒 ระบบภายในสำหรับพนักงานเท่านั้น
            </p>
            <p className="text-xs text-muted mt-1">
              ติดต่อ IT Support: ext. 1234
            </p>
          </div>
        </div>

        <div className="text-center mt-6 text-xs text-muted">
          © 2024 PTT Organization. All rights reserved.
        </div>
      </motion.div>
    </div>
  );
}
