import { useRouteError, useNavigate, Link } from "react-router-dom";
import { Home, AlertCircle, RefreshCw } from "lucide-react";

export default function ErrorPage() {
  const error = useRouteError() as Error & { status?: number; statusText?: string };
  const navigate = useNavigate();

  const is404 = error?.status === 404 || error?.statusText === "Not Found";

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center">
            <AlertCircle className="w-12 h-12 text-red-400" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-app font-display">
            {is404 ? "404" : "เกิดข้อผิดพลาด"}
          </h1>
          <p className="text-xl text-muted">
            {is404 ? "ไม่พบหน้าที่คุณกำลังมองหา" : "มีบางอย่างผิดพลาด"}
          </p>
        </div>

        <div className="bg-soft border border-app rounded-xl p-6 space-y-4">
          <p className="text-sm text-muted">
            {is404 ? (
              "หน้าที่คุณกำลังมองหาไม่มีอยู่ในระบบ กรุณาตรวจสอบ URL หรือกลับไปหน้าหลัก"
            ) : (
              <>
                <span className="font-semibold text-app">ข้อผิดพลาด:</span>
                <br />
                <span className="text-red-400 mt-2 block">
                  {error?.message || error?.statusText || "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ"}
                </span>
              </>
            )}
          </p>

          {(import.meta as unknown as { env: { MODE: string } }).env?.MODE === "development" && error?.stack && (
            <details className="text-left">
              <summary className="text-xs text-muted cursor-pointer hover:text-app">
                รายละเอียดข้อผิดพลาด (Development)
              </summary>
              <pre className="mt-2 text-xs text-red-400 bg-red-500/10 p-3 rounded overflow-auto max-h-40">
                {error.stack}
              </pre>
            </details>
          )}
        </div>

        <div className="flex gap-3 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-soft hover:bg-soft/80 
                     text-app rounded-xl transition-all duration-200 font-semibold 
                     border border-app"
          >
            <RefreshCw className="w-4 h-4" />
            ย้อนกลับ
          </button>
          <Link
            to="/app/hr"
            className="inline-flex items-center gap-2 px-6 py-3 bg-ptt-cyan hover:bg-ptt-cyan/80 
                     text-app rounded-xl transition-all duration-200 font-semibold 
                     shadow-lg hover:shadow-xl"
          >
            <Home className="w-4 h-4" />
            หน้าหลัก
          </Link>
        </div>
      </div>
    </div>
  );
}

