import { DollarSign, Settings, AlertCircle, Droplet, Bell, Clock, Edit, History } from "lucide-react";
import { useState } from "react";

const currencyFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

// Interface สำหรับประวัติการปรับราคา
interface PriceHistory {
  id: string;
  fuelType: string;
  oldPrice: number;
  newPrice: number;
  changedAt: string;
  changedBy: string;
  changeType: "manual" | "scheduled" | "auto";
}

// Interface สำหรับราคา
interface Price {
  id: string;
  fuelType: string;
  currentPrice: number;
  previousPrice: number;
  newPrice: number | null;
  scheduledPrice: number | null;
  status: "active" | "pending_update" | "scheduled";
}

// Mock data - Price Management
const initialPrices: Price[] = [
  {
    id: "1",
    fuelType: "Gasohol 95",
    currentPrice: 40.00,
    previousPrice: 39.50,
    newPrice: null as number | null,
    scheduledPrice: null as number | null,
    status: "active" as const,
  },
  {
    id: "2",
    fuelType: "Diesel",
    currentPrice: 35.00,
    previousPrice: 35.20,
    newPrice: null,
    scheduledPrice: null,
    status: "active" as const,
  },
  {
    id: "3",
    fuelType: "Premium Gasohol 95",
    currentPrice: 42.50,
    previousPrice: 42.00,
    newPrice: null,
    scheduledPrice: null,
    status: "active" as const,
  },
  {
    id: "4",
    fuelType: "E20",
    currentPrice: 38.00,
    previousPrice: 38.00,
    newPrice: null,
    scheduledPrice: null,
    status: "active" as const,
  },
  {
    id: "5",
    fuelType: "E85",
    currentPrice: 32.00,
    previousPrice: 32.00,
    newPrice: null,
    scheduledPrice: null,
    status: "active" as const,
  },
  {
    id: "6",
    fuelType: "Gasohol 91",
    currentPrice: 39.00,
    previousPrice: 38.50,
    newPrice: null,
    scheduledPrice: null,
    status: "active" as const,
  },
];

// Mock ประวัติการปรับราคา
const initialPriceHistory: PriceHistory[] = [
  {
    id: "H1",
    fuelType: "Gasohol 95",
    oldPrice: 39.50,
    newPrice: 40.00,
    changedAt: "2024-12-15T05:00:00",
    changedBy: "ระบบอัตโนมัติ",
    changeType: "auto",
  },
  {
    id: "H2",
    fuelType: "Diesel",
    oldPrice: 35.20,
    newPrice: 35.00,
    changedAt: "2024-12-15T05:00:00",
    changedBy: "ระบบอัตโนมัติ",
    changeType: "auto",
  },
  {
    id: "H3",
    fuelType: "Premium Gasohol 95",
    oldPrice: 42.00,
    newPrice: 42.50,
    changedAt: "2024-12-14T05:00:00",
    changedBy: "ระบบอัตโนมัติ",
    changeType: "auto",
  },
  {
    id: "H4",
    fuelType: "Gasohol 91",
    oldPrice: 38.50,
    newPrice: 39.00,
    changedAt: "2024-12-14T05:00:00",
    changedBy: "ระบบอัตโนมัติ",
    changeType: "auto",
  },
];

export default function PriceManagement() {
  const [prices, setPrices] = useState(initialPrices);
  const [priceHistory, setPriceHistory] = useState<PriceHistory[]>(initialPriceHistory);
  const [pttNotification, setPttNotification] = useState<{
    received: boolean;
    receivedTime: string | null;
    notifiedBy: string | null;
  }>({
    received: false,
    receivedTime: null,
    notifiedBy: null,
  });
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<number>(0);
  const [autoChangeTime, setAutoChangeTime] = useState("05:00");
  const [autoChangeEnabled, setAutoChangeEnabled] = useState(true);

  // ราคาที่รอการปรับ (PTT แจ้งมาแล้วแต่ยังไม่ได้กรอก)
  const pendingUpdates = prices.filter(p => p.newPrice !== null && p.scheduledPrice === null);
  
  // ราคาที่ตั้งเวลาไว้แล้ว (รอเปลี่ยนตอน 05:00)
  const scheduledUpdates = prices.filter(p => p.scheduledPrice !== null);

  const handlePttNotification = () => {
    const now = new Date().toISOString();
    setPttNotification({
      received: true,
      receivedTime: now,
      notifiedBy: "PTT Call Center",
    });
    alert("บันทึกการแจ้งจาก PTT แล้ว\nกรุณากรอกราคาใหม่สำหรับแต่ละชนิดน้ำมัน");
  };

  const handleEditPrice = (priceId: string, currentPrice: number) => {
    setEditingPriceId(priceId);
    setEditPrice(currentPrice);
  };

  const handleSavePrice = (priceId: string) => {
    const price = prices.find(p => p.id === priceId);
    if (!price) return;

    setPrices(prices.map(p => {
      if (p.id === priceId) {
        return {
          ...p,
          newPrice: editPrice,
          status: "pending_update" as const,
        };
      }
      return p;
    }));
    setEditingPriceId(null);
    setEditPrice(0);
  };

  const handleSchedulePrice = (priceId: string) => {
    const price = prices.find(p => p.id === priceId);
    if (price && price.newPrice !== null) {
      // บันทึกประวัติเมื่อตั้งเวลาเปลี่ยนราคา
      const newHistory: PriceHistory = {
        id: `H${Date.now()}`,
        fuelType: price.fuelType,
        oldPrice: price.currentPrice,
        newPrice: price.newPrice,
        changedAt: new Date().toISOString(),
        changedBy: "พนักงาน (ตั้งเวลา)",
        changeType: "scheduled",
      };
      setPriceHistory([newHistory, ...priceHistory]);

      setPrices(prices.map(p => {
        if (p.id === priceId) {
          return {
            ...p,
            scheduledPrice: price.newPrice,
            status: "scheduled" as const,
          };
        }
        return p;
      }));
    }
  };

  const handleCancelSchedule = (priceId: string) => {
    setPrices(prices.map(p => {
      if (p.id === priceId) {
        return {
          ...p,
          newPrice: null,
          scheduledPrice: null,
          status: "active" as const,
        };
      }
      return p;
    }));
  };

  // จำลองการเปลี่ยนราคาอัตโนมัติ (เมื่อถึงเวลา 05:00)
  const handleApplyScheduledPrice = (priceId: string) => {
    const price = prices.find(p => p.id === priceId);
    if (price && price.scheduledPrice !== null) {
      // บันทึกประวัติเมื่อราคาเปลี่ยนอัตโนมัติ
      const newHistory: PriceHistory = {
        id: `H${Date.now()}`,
        fuelType: price.fuelType,
        oldPrice: price.currentPrice,
        newPrice: price.scheduledPrice,
        changedAt: new Date().toISOString(),
        changedBy: "ระบบอัตโนมัติ",
        changeType: "auto",
      };
      setPriceHistory([newHistory, ...priceHistory]);

      setPrices(prices.map(p => {
        if (p.id === priceId) {
          return {
            ...p,
            currentPrice: price.scheduledPrice!,
            previousPrice: price.currentPrice,
            newPrice: null,
            scheduledPrice: null,
            status: "active" as const,
          };
        }
        return p;
      }));
    }
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6">
      {/* Header Section */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Droplet className="h-8 w-8 text-blue-600" />
          ปรับราคาขายปลีกอัตโนมัติ
        </h2>
        <p className="text-slate-500 text-sm mt-1">
          PTT แจ้งราคาใหม่ตอน 18:00 → พนักงานปรับราคาในระบบ → ราคาเปลี่ยนอัตโนมัติตอน 05:00
        </p>
      </div>

      {/* PTT Notification Section */}
      <div className="bg-orange-50 rounded-xl shadow-sm border border-orange-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Bell className="w-6 h-6 text-orange-600" />
            <div>
              <h3 className="text-lg font-semibold text-slate-800">การแจ้งราคาจาก PTT</h3>
              <p className="text-sm text-gray-600">PTT จะโทมาแจ้งราคาใหม่ตอน 18:00</p>
            </div>
          </div>
          {!pttNotification.received ? (
            <button
              onClick={handlePttNotification}
              className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors text-sm font-medium shadow-sm"
            >
              <Bell className="w-4 h-4" />
              <span>บันทึกการแจ้งจาก PTT</span>
            </button>
          ) : (
            <div className="text-right">
              <p className="text-sm font-medium text-green-700">✓ ได้รับการแจ้งแล้ว</p>
              <p className="text-xs text-gray-600">
                {pttNotification.receivedTime && new Date(pttNotification.receivedTime).toLocaleString("th-TH")}
              </p>
            </div>
          )}
        </div>
        {pttNotification.received && (
          <div className="mt-4 p-3 bg-white rounded-lg border border-orange-200">
            <p className="text-sm text-slate-800">
              <strong>สถานะ:</strong> ได้รับการแจ้งจาก PTT แล้ว กรุณากรอกราคาใหม่สำหรับแต่ละชนิดน้ำมันด้านล่าง
            </p>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
          <div className="flex items-center gap-2 text-blue-700 mb-2">
            <DollarSign className="h-5 w-5" />
            <span className="font-bold">ราคาปัจจุบัน</span>
          </div>
          <div className="text-2xl font-bold text-blue-900">
            {prices.filter(p => p.status === "active").length}
          </div>
          <div className="text-xs text-blue-600 mt-1">ชนิดน้ำมัน</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="text-xs text-gray-500 mb-1">รอการปรับราคา</div>
          <div className="text-xl font-bold text-slate-800">
            {pendingUpdates.length}
          </div>
          <div className="w-full bg-gray-100 h-1.5 rounded-full mt-2">
            <div
              className="bg-orange-500 h-1.5 rounded-full"
              style={{ width: `${(pendingUpdates.length / prices.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="text-xs text-gray-500 mb-1">ตั้งเวลาเปลี่ยนแล้ว</div>
          <div className="text-xl font-bold text-slate-800">
            {scheduledUpdates.length}
          </div>
          <div className="w-full bg-gray-100 h-1.5 rounded-full mt-2">
            <div
              className="bg-green-500 h-1.5 rounded-full"
              style={{ width: `${(scheduledUpdates.length / prices.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="text-xs text-gray-500 mb-1">เวลาที่จะเปลี่ยน</div>
          <div className="text-xl font-bold text-slate-800">
            {autoChangeTime}
          </div>
          <div className="w-full bg-gray-100 h-1.5 rounded-full mt-2">
            <div
              className={`h-1.5 rounded-full ${autoChangeEnabled ? "bg-green-500" : "bg-gray-400"}`}
              style={{ width: autoChangeEnabled ? "100%" : "0%" }}
            />
          </div>
        </div>
      </div>

      {/* Current Prices */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-slate-800">ราคาน้ำมันปัจจุบัน</h3>
            <p className="text-sm text-gray-500">
              ราคาที่ใช้งานอยู่ในปัจจุบัน
            </p>
          </div>
        </div>
        <div className="space-y-3">
          {prices.map((price) => {
            return (
              <div
                key={price.id}
                className="p-4 rounded-xl border bg-gray-50 border-gray-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-slate-800">{price.fuelType}</h4>
                      {price.status === "scheduled" && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-300">
                          ตั้งเวลาแล้ว (จะเปลี่ยน {autoChangeTime})
                        </span>
                      )}
                      {price.status === "pending_update" && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700 border border-orange-300">
                          รอการตั้งเวลา
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500">ราคาปัจจุบัน: </span>
                        <span className="font-bold text-slate-800">
                          {currencyFormatter.format(price.currentPrice)}/ลิตร
                        </span>
                      </div>
                      {price.scheduledPrice !== null && (
                        <div>
                          <span className="text-gray-500">ราคาใหม่ (จะเปลี่ยน {autoChangeTime}): </span>
                          <span className="font-bold text-green-600">
                            {currencyFormatter.format(price.scheduledPrice)}/ลิตร
                          </span>
                        </div>
                      )}
                      {price.newPrice !== null && price.scheduledPrice === null && (
                        <div>
                          <span className="text-gray-500">ราคาใหม่ (รอตั้งเวลา): </span>
                          <span className="font-bold text-orange-600">
                            {currencyFormatter.format(price.newPrice)}/ลิตร
                          </span>
                        </div>
                      )}
                      {price.newPrice === null && price.scheduledPrice === null && (
                        <div>
                          <span className="text-gray-500">ราคาก่อนหน้า: </span>
                          <span className="text-slate-800">
                            {currencyFormatter.format(price.previousPrice)}/ลิตร
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="ml-4 flex items-center gap-2">
                    {pttNotification.received && price.newPrice === null && price.scheduledPrice === null && (
                      <button
                        onClick={() => handleEditPrice(price.id, price.currentPrice)}
                        className="flex items-center gap-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-xs font-medium shadow-sm"
                      >
                        <Edit className="w-4 h-4" />
                        <span>กรอกราคาใหม่</span>
                      </button>
                    )}
                    {price.status === "pending_update" && (
                      <button
                        onClick={() => handleSchedulePrice(price.id)}
                        className="flex items-center gap-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-xs font-medium shadow-sm"
                      >
                        <Clock className="w-4 h-4" />
                        <span>ตั้งเวลาเปลี่ยน</span>
                      </button>
                    )}
                    {price.status === "scheduled" && (
                      <>
                        <button
                          onClick={() => handleApplyScheduledPrice(price.id)}
                          className="flex items-center gap-1 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-xs font-medium shadow-sm"
                        >
                          <span>เปลี่ยนทันที</span>
                        </button>
                        <button
                          onClick={() => handleCancelSchedule(price.id)}
                          className="flex items-center gap-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-xs font-medium shadow-sm"
                        >
                          <span>ยกเลิก</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Edit Price Modal (Inline) */}
      {editingPriceId && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-800">กรอกราคาใหม่</h3>
            <button
              onClick={() => setEditingPriceId(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                ราคาใหม่ (บาท/ลิตร)
              </label>
              <input
                type="number"
                step="0.01"
                value={editPrice}
                onChange={(e) => setEditPrice(Number(e.target.value))}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="กรอกราคาใหม่"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleSavePrice(editingPriceId)}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium shadow-sm"
              >
                บันทึก
              </button>
              <button
                onClick={() => setEditingPriceId(null)}
                className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-slate-800 rounded-lg transition-colors text-sm font-medium"
              >
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Scheduled Price Changes */}
      {scheduledUpdates.length > 0 && (
        <div className="bg-green-50 rounded-xl shadow-sm border border-green-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Clock className="w-6 h-6 text-green-600" />
              <div>
                <h3 className="text-lg font-semibold text-slate-800">ราคาที่จะเปลี่ยนอัตโนมัติ</h3>
                <p className="text-sm text-gray-600">
                  ราคาจะเปลี่ยนอัตโนมัติเมื่อถึงเวลา {autoChangeTime}
                </p>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            {scheduledUpdates.map((price) => (
              <div key={price.id} className="p-3 bg-white rounded-lg border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-800">{price.fuelType}</p>
                    <p className="text-sm text-gray-600">
                      จาก {currencyFormatter.format(price.currentPrice)} → {currencyFormatter.format(price.scheduledPrice!)}/ลิตร
                    </p>
                  </div>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-300">
                    จะเปลี่ยน {autoChangeTime}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Price History */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
              <History className="w-5 h-5 text-blue-600" />
              ประวัติการปรับราคา
            </h3>
            <p className="text-sm text-gray-500">
              ประวัติการเปลี่ยนแปลงราคาทั้งหมด
            </p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="p-3">วันที่/เวลา</th>
                <th className="p-3">ชนิดน้ำมัน</th>
                <th className="p-3 text-right">ราคาเก่า</th>
                <th className="p-3 text-right">ราคาใหม่</th>
                <th className="p-3 text-right">เปลี่ยนแปลง</th>
                <th className="p-3">ผู้ปรับ</th>
                <th className="p-3 text-center">ประเภท</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {priceHistory.map((history) => {
                const change = history.newPrice - history.oldPrice;
                const changePercent = ((change / history.oldPrice) * 100);
                return (
                  <tr key={history.id} className="hover:bg-gray-50">
                    <td className="p-3 text-gray-600">
                      {new Date(history.changedAt).toLocaleString("th-TH", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="p-3 font-medium text-slate-800">{history.fuelType}</td>
                    <td className="p-3 text-right font-mono text-slate-800">
                      {currencyFormatter.format(history.oldPrice)}
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-slate-800">
                      {currencyFormatter.format(history.newPrice)}
                    </td>
                    <td className="p-3 text-right">
                      <span className={`font-bold ${
                        change > 0 ? "text-red-600" : change < 0 ? "text-green-600" : "text-gray-600"
                      }`}>
                        {change > 0 ? "+" : ""}
                        {currencyFormatter.format(change)} ({changePercent > 0 ? "+" : ""}{changePercent.toFixed(2)}%)
                      </span>
                    </td>
                    <td className="p-3 text-gray-600">{history.changedBy}</td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        history.changeType === "auto"
                          ? "bg-green-100 text-green-700 border border-green-300"
                          : history.changeType === "scheduled"
                          ? "bg-blue-100 text-blue-700 border border-blue-300"
                          : "bg-orange-100 text-orange-700 border border-orange-300"
                      }`}>
                        {history.changeType === "auto" ? "อัตโนมัติ" : history.changeType === "scheduled" ? "ตั้งเวลา" : "ปรับเอง"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {priceHistory.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              ยังไม่มีประวัติการปรับราคา
            </div>
          )}
        </div>
      </div>

      {/* Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-slate-800">ตั้งค่าการเปลี่ยนราคาอัตโนมัติ</h3>
            <p className="text-sm text-gray-500">กำหนดเวลาที่ราคาจะเปลี่ยนอัตโนมัติ</p>
          </div>
          <Settings className="w-6 h-6 text-gray-500" />
        </div>
        <div className="space-y-4">
          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={autoChangeEnabled}
                onChange={(e) => setAutoChangeEnabled(e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-slate-800">เปิดใช้งานการเปลี่ยนราคาอัตโนมัติ</span>
            </label>
            <p className="text-xs text-gray-500 mt-1 ml-8">
              ราคาจะเปลี่ยนอัตโนมัติตามเวลาที่กำหนด
            </p>
          </div>
          {autoChangeEnabled && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                เวลาที่จะเปลี่ยนราคา (แนะนำ: 05:00)
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="time"
                  value={autoChangeTime}
                  onChange={(e) => setAutoChangeTime(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-700">
                <p className="font-semibold mb-1">ขั้นตอนการทำงาน:</p>
                <ol className="list-decimal list-inside space-y-1 text-xs">
                  <li>PTT โทมาแจ้งราคาใหม่ตอน 18:00 → กดปุ่ม "บันทึกการแจ้งจาก PTT"</li>
                  <li>พนักงานกรอกราคาใหม่สำหรับแต่ละชนิดน้ำมัน</li>
                  <li>กดปุ่ม "ตั้งเวลาเปลี่ยน" เพื่อตั้งให้ราคาเปลี่ยนอัตโนมัติตอน {autoChangeTime}</li>
                  <li>ระบบจะเปลี่ยนราคาอัตโนมัติเมื่อถึงเวลา {autoChangeTime} และบันทึกประวัติอัตโนมัติ</li>
                </ol>
              </div>
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
