import { useNavigate } from "react-router-dom";
import { Lock, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function Forbidden() {
    const navigate = useNavigate();
    const { logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] p-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-orange-500/5"></div>

            <div className="max-w-md w-full text-center space-y-8 relative z-10">
                <div className="flex justify-center">
                    <div className="w-24 h-24 bg-red-500/10 rounded-3xl flex items-center justify-center shadow-xl shadow-red-500/20 rotate-12">
                        <Lock className="w-12 h-12 text-red-500" strokeWidth={1.5} />
                    </div>
                </div>

                <div className="space-y-3">
                    <h1 className="text-4xl font-bold text-app font-display">
                        Access Denied
                    </h1>
                    <p className="text-lg text-muted">
                        คุณไม่มีสิทธิ์เข้าถึงหน้านี้ (403 Forbidden)
                    </p>
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 inline-block">
                        <p className="text-xs text-red-500">
                            กรุณาตรวจสอบสิทธิ์การใช้งานกับผู้ดูแลระบบ
                        </p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="px-6 py-3 bg-soft hover:bg-soft/80 text-app rounded-xl transition-all font-medium border border-app hover:scale-105 active:scale-95"
                    >
                        ย้อนกลับ
                    </button>

                    <button
                        onClick={handleLogout}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-all font-medium hover:scale-105 active:scale-95 shadow-lg shadow-red-500/20"
                    >
                        <LogOut className="w-4 h-4" />
                        ออกจากระบบ
                    </button>
                </div>
            </div>
        </div>
    );
}
