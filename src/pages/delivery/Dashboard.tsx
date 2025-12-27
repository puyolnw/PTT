import { useMemo } from "react";
import { motion } from "framer-motion";
import { Truck, FileText, AlertTriangle, Gauge, CheckCircle2 } from "lucide-react";
import SummaryStats from "@/components/SummaryStats";
import ChartCard from "@/components/ChartCard";
import StatusTag from "@/components/StatusTag";
import { loadPurchaseOrders, loadTrips } from "@/pages/delivery/_storage";

export default function DeliveryDashboard() {
  const { pos, trips } = useMemo(() => {
    return {
      pos: loadPurchaseOrders(),
      trips: loadTrips(),
    };
  }, []);

  const poWaiting = pos.filter((p) => p.status === "รอรับของ").length;
  const tripsInProgress = trips.filter((t) => t.status !== "ส่งมอบสำเร็จ").length;

  const odometerAlerts = trips.filter((t) => {
    if (!t.startOdometer || !t.endOdometer) return false;
    return t.endOdometer <= t.startOdometer;
  }).length;

  const stats = [
    {
      label: "PO รอรับของ",
      value: poWaiting,
      icon: FileText,
      color: "from-amber-400 to-orange-500",
    },
    {
      label: "เที่ยวขนส่งที่กำลังดำเนินการ",
      value: tripsInProgress,
      icon: Truck,
      color: "from-blue-500 to-cyan-500",
    },
    {
      label: "แจ้งเตือนเลขไมล์ผิดปกติ",
      value: odometerAlerts,
      icon: AlertTriangle,
      color: "from-red-500 to-rose-500",
    },
    {
      label: "ข้อมูลประสิทธิภาพ (พร้อมคำนวณ)",
      value: trips.filter((t) => typeof t.fueledLiters === "number" && !!t.endOdometer).length,
      icon: Gauge,
      color: "from-emerald-500 to-teal-500",
    },
  ];

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200 dark:shadow-blue-900/20">
            <Truck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white font-display">
              ระบบ Delivery
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              จัดการการขนส่ง สั่งซื้อ และติดตามสถานะน้ำมัน
            </p>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <SummaryStats stats={stats} />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tracking Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <ChartCard
            title="สถานะเที่ยวขนส่ง (Tracking)"
            subtitle="ติดตามสถานะการจัดส่งล่าสุด"
            icon={Truck}
            className="h-full shadow-lg border-none ring-1 ring-gray-100 dark:ring-gray-800"
          >
            <div className="space-y-3 mt-2">
              {trips.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                  <Truck className="w-12 h-12 mb-2 opacity-50" />
                  <p>ยังไม่มีข้อมูลเที่ยวขนส่ง</p>
                </div>
              ) : (
                trips
                  .slice()
                  .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
                  .slice(0, 6)
                  .map((t) => (
                    <div
                      key={t.id}
                      className="group flex items-center justify-between gap-4 p-4 rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-md transition-all duration-200"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-gray-800 dark:text-white">
                            {t.id.slice(0, 8)}...
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500">
                            Trip
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <Truck className="w-3 h-3" /> {t.driverName}
                          </span>
                          <span className="w-1 h-1 rounded-full bg-gray-300" />
                          <span className="flex items-center gap-1">
                            <FileText className="w-3 h-3" /> PO: {t.poId.slice(0, 8)}...
                          </span>
                        </div>
                      </div>
                      <StatusTag variant={t.status === "ส่งมอบสำเร็จ" ? "success" : "info"}>
                        {t.status}
                      </StatusTag>
                    </div>
                  ))
              )}
            </div>
          </ChartCard>
        </motion.div>

        {/* Feature Context */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <ChartCard
            title="ความสามารถของระบบ"
            subtitle="ฟีเจอร์ที่รองรับการทำงานจริง"
            icon={CheckCircle2}
            className="h-full shadow-lg border-none ring-1 ring-gray-100 dark:ring-gray-800"
          >
            <div className="space-y-4 text-sm mt-2">
              <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/30 space-y-3">
                <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" /> การจัดการเอกสาร
                </h4>
                <ul className="space-y-2 text-blue-800 dark:text-blue-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 text-blue-500 shrink-0" />
                    <span>บันทึก PO พร้อม Approve No. และ Invoice No.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 text-blue-500 shrink-0" />
                    <span>แนบไฟล์ Invoice (e-Tax) และ Receipt เพื่อตรวจสอบ</span>
                  </li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/30 space-y-3">
                <h4 className="font-semibold text-emerald-900 dark:text-emerald-200 mb-2 flex items-center gap-2">
                  <Truck className="w-4 h-4" /> การขนส่ง
                </h4>
                <ul className="space-y-2 text-emerald-800 dark:text-emerald-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 text-emerald-500 shrink-0" />
                    <span>สร้างเที่ยวขนส่ง ระบุรถ คนขับ และเลขไมล์</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 text-emerald-500 shrink-0" />
                    <span>กระจายน้ำมันหลายสาขาในเที่ยวเดียว (Route Planning)</span>
                  </li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-800/30 space-y-3">
                <h4 className="font-semibold text-purple-900 dark:text-purple-200 mb-2 flex items-center gap-2">
                  <Gauge className="w-4 h-4" /> การติดตามและวิเคราะห์
                </h4>
                <ul className="space-y-2 text-purple-800 dark:text-purple-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 text-purple-500 shrink-0" />
                    <span>คำนวณอัตราสิ้นเปลือง (Fuel Efficiency)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 text-purple-500 shrink-0" />
                    <span>แจ้งเตือนเมื่อเลขไมล์หรือการส่งมอบผิดปกติ</span>
                  </li>
                </ul>
              </div>
            </div>
          </ChartCard>
        </motion.div>
      </div>
    </div>
  );
}


