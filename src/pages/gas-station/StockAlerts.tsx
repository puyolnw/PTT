import { Bell, AlertCircle, Settings, Fuel, Droplet } from "lucide-react";
import { useState } from "react";

const numberFormatter = new Intl.NumberFormat("th-TH");

// Mock data - Stock Alerts
const mockStockAlerts = {
  settings: {
    lowStockThreshold: 10000, // ลิตร
    criticalStockThreshold: 5000, // ลิตร
    alertChannels: ["email", "line", "sms"],
    alertFrequency: "realtime",
  },
  alerts: [
    {
      id: "1",
      branch: "สำนักงานใหญ่",
      fuelType: "Premium Gasohol 95",
      tank: "TK-003",
      currentStock: 15000,
      threshold: 10000,
      status: "warning",
      alertTime: "2024-12-15T08:30:00",
    },
    {
      id: "2",
      branch: "สาขา A",
      fuelType: "E20",
      tank: "TK-004",
      currentStock: 8000,
      threshold: 10000,
      status: "critical",
      alertTime: "2024-12-15T09:15:00",
    },
    {
      id: "3",
      branch: "สาขา B",
      fuelType: "Gasohol 91",
      tank: "TK-005",
      currentStock: 12000,
      threshold: 10000,
      status: "ok",
      alertTime: null,
    },
  ],
};

export default function StockAlerts() {
  const [settings, setSettings] = useState(mockStockAlerts.settings);

  const activeAlerts = mockStockAlerts.alerts.filter(a => a.status !== "ok");
  const warningAlerts = activeAlerts.filter(a => a.status === "warning");
  const criticalAlerts = activeAlerts.filter(a => a.status === "critical");

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6">
      {/* Header Section */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Droplet className="h-8 w-8 text-blue-600" />
          แจ้งเตือนสต็อกต่ำ
        </h2>
        <p className="text-slate-500 text-sm mt-1">
          ตั้งระดับต่ำสุด → แจ้งเตือนผ่านแอป/ไลน์/อีเมล เมื่อสต็อก &lt; ระดับต่ำสุด
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
          <div className="flex items-center gap-2 text-blue-700 mb-2">
            <AlertCircle className="h-5 w-5" />
            <span className="font-bold">เตือน (Warning)</span>
          </div>
          <div className="text-2xl font-bold text-blue-900">
            {warningAlerts.length}
          </div>
          <div className="text-xs text-blue-600 mt-1">ถัง</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="text-xs text-gray-500 mb-1">วิกฤต (Critical)</div>
          <div className="text-xl font-bold text-slate-800">
            {criticalAlerts.length}
          </div>
          <div className="w-full bg-gray-100 h-1.5 rounded-full mt-2">
            <div
              className="bg-red-500 h-1.5 rounded-full"
              style={{ width: `${(criticalAlerts.length / activeAlerts.length) * 100 || 0}%` }}
            />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="text-xs text-gray-500 mb-1">ช่องทางแจ้งเตือน</div>
          <div className="text-xl font-bold text-slate-800">
            {settings.alertChannels.length}
          </div>
          <div className="w-full bg-gray-100 h-1.5 rounded-full mt-2">
            <div
              className="bg-green-500 h-1.5 rounded-full"
              style={{ width: `${(settings.alertChannels.length / 3) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Active Alerts */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-slate-800">แจ้งเตือนที่ยังไม่แก้ไข</h3>
            <p className="text-sm text-gray-500">
              {activeAlerts.length} รายการ
            </p>
          </div>
          <Bell className="w-6 h-6 text-gray-500" />
        </div>
        <div className="space-y-3">
          {activeAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 rounded-xl border ${
                alert.status === "critical"
                  ? "bg-red-50 border-red-200"
                  : "bg-orange-50 border-orange-200"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Fuel className="w-5 h-5 text-blue-600" />
                    <h4 className="font-semibold text-slate-800">{alert.fuelType}</h4>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      alert.status === "critical"
                        ? "bg-red-100 text-red-700 border border-red-300"
                        : "bg-orange-100 text-orange-700 border border-orange-300"
                    }`}>
                      {alert.status === "critical" ? "วิกฤต" : "เตือน"}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                    <div>
                      <span className="text-gray-500">สาขา: </span>
                      <span className="text-slate-800">{alert.branch}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">ถัง: </span>
                      <span className="text-slate-800">{alert.tank}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">สต็อกปัจจุบัน: </span>
                      <span className={`font-bold ${
                        alert.status === "critical" ? "text-red-600" : "text-orange-600"
                      }`}>
                        {numberFormatter.format(alert.currentStock)} ลิตร
                      </span>
                    </div>
                  </div>
                  <div className="mt-2">
                    <p className="text-xs text-gray-500">
                      ระดับต่ำสุด: {numberFormatter.format(alert.threshold)} ลิตร
                      {alert.currentStock < alert.threshold && (
                        <span className="text-red-600 ml-2">
                          (ต่ำกว่า {numberFormatter.format(alert.threshold - alert.currentStock)} ลิตร)
                        </span>
                      )}
                    </p>
                    {alert.alertTime && (
                      <p className="text-xs text-gray-500 mt-1">
                        แจ้งเตือนเมื่อ: {new Date(alert.alertTime).toLocaleString("th-TH")}
                      </p>
                    )}
                  </div>
                </div>
                <button className="ml-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors shadow-sm">
                  ตรวจสอบ
                </button>
              </div>
            </div>
          ))}
          {activeAlerts.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              ไม่มีแจ้งเตือนสต็อกต่ำ
            </div>
          )}
        </div>
      </div>

      {/* Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-slate-800">ตั้งค่าแจ้งเตือน</h3>
            <p className="text-sm text-gray-500">กำหนดระดับต่ำสุดและช่องทางแจ้งเตือน</p>
          </div>
          <Settings className="w-6 h-6 text-gray-500" />
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              ระดับต่ำสุด (Warning) - ลิตร
            </label>
            <input
              type="number"
              value={settings.lowStockThreshold}
              onChange={(e) => setSettings({ ...settings, lowStockThreshold: Number(e.target.value) })}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              ระดับวิกฤต (Critical) - ลิตร
            </label>
            <input
              type="number"
              value={settings.criticalStockThreshold}
              onChange={(e) => setSettings({ ...settings, criticalStockThreshold: Number(e.target.value) })}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              ช่องทางแจ้งเตือน
            </label>
            <div className="flex gap-4">
              {["email", "line", "sms"].map((channel) => (
                <label key={channel} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.alertChannels.includes(channel)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSettings({ ...settings, alertChannels: [...settings.alertChannels, channel] });
                      } else {
                        setSettings({ ...settings, alertChannels: settings.alertChannels.filter(c => c !== channel) });
                      }
                    }}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-slate-800 capitalize">{channel}</span>
                </label>
              ))}
            </div>
          </div>
          <button className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium shadow-sm">
            บันทึกการตั้งค่า
          </button>
        </div>
      </div>
    </div>
  );
}
