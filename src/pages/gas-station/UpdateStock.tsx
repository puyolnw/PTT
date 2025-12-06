import { motion } from "framer-motion";
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package,
  Save,
  RotateCcw,
  AlertCircle,
  CheckCircle,
  Calendar,
  Droplet,
  TrendingDown,
  History,
  Building2,
} from "lucide-react";

const numberFormatter = new Intl.NumberFormat("th-TH", {
  maximumFractionDigits: 0,
});

type OilType =
  | "Premium Diesel"
  | "Premium Gasohol 95"
  | "Diesel"
  | "E85"
  | "E20"
  | "Gasohol 91"
  | "Gasohol 95";

type StockUpdateItem = {
  id: string;
  branch: string;
  oilType: OilType;
  currentStock: number; // สต็อกปัจจุบัน (ลิตร)
  usageAmount: number; // จำนวนที่ใช้ไป (ลิตร) - สำหรับกรอก
  updatedStock: number; // สต็อกหลังอัพเดต (ลิตร) - คำนวณอัตโนมัติ
  lastUpdated: string;
  status: "pending" | "updated";
};

// สาขาทั้งหมด
const branches = [
  { id: 1, name: "ปั๊มไฮโซ", code: "HQ" },
  { id: 2, name: "สาขา 2", code: "B2" },
  { id: 3, name: "สาขา 3", code: "B3" },
  { id: 4, name: "สาขา 4", code: "B4" },
  { id: 5, name: "สาขา 5", code: "B5" },
];

// Mock data - ดึงข้อมูลสต็อกปัจจุบันสำหรับทุกสาขา
const generateInitialStockData = (): StockUpdateItem[] => {
  const oilTypes: OilType[] = [
    "Premium Diesel",
    "Premium Gasohol 95",
    "Diesel",
    "E85",
    "E20",
    "Gasohol 91",
    "Gasohol 95",
  ];
  
  const baseStocks: Record<OilType, number> = {
    "Premium Diesel": 45000,
    "Premium Gasohol 95": 38000,
    "Diesel": 52000,
    "E85": 15000,
    "E20": 28000,
    "Gasohol 91": 22000,
    "Gasohol 95": 35000,
  };

  const data: StockUpdateItem[] = [];
  branches.forEach((branch, branchIndex) => {
    oilTypes.forEach((oilType, oilIndex) => {
      // เพิ่มความหลากหลายให้แต่ละสาขามีสต็อกต่างกันเล็กน้อย
      const variation = (branchIndex * 1000) + (oilIndex * 500);
      const baseStock = baseStocks[oilType];
      const currentStock = baseStock + variation;
      
      data.push({
        id: `STK-${branch.code}-${oilIndex + 1}`,
        branch: branch.name,
        oilType,
        currentStock,
        usageAmount: 0,
        updatedStock: currentStock,
        lastUpdated: "2024-12-15 18:30",
        status: "pending",
      });
    });
  });
  
  return data;
};

const initialStockData = generateInitialStockData();

export default function UpdateStock() {
  const navigate = useNavigate();
  const [stockItems, setStockItems] = useState<StockUpdateItem[]>(initialStockData);
  const [selectedBranch, setSelectedBranch] = useState<string>("all"); // "all" หรือชื่อสาขา
  const [updateDate, setUpdateDate] = useState(new Date().toISOString().split("T")[0]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleUsageChange = (id: string, usageAmount: number) => {
    setStockItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updatedStock = Math.max(0, item.currentStock - usageAmount);
          return {
            ...item,
            usageAmount,
            updatedStock,
            status: usageAmount > 0 ? "updated" : "pending",
          };
        }
        return item;
      })
    );
  };

  // กรองข้อมูลตามสาขาที่เลือก
  const filteredStockItems = useMemo(() => {
    if (selectedBranch === "all") {
      return stockItems;
    }
    return stockItems.filter(item => item.branch === selectedBranch);
  }, [stockItems, selectedBranch]);

  // สรุปข้อมูลตามสาขา
  const branchSummary = useMemo(() => {
    const summary: Record<string, { totalUsage: number; updatedCount: number; totalItems: number }> = {};
    
    branches.forEach(branch => {
      const branchItems = stockItems.filter(item => item.branch === branch.name);
      summary[branch.name] = {
        totalUsage: branchItems.reduce((sum, item) => sum + item.usageAmount, 0),
        updatedCount: branchItems.filter(item => item.usageAmount > 0).length,
        totalItems: branchItems.length,
      };
    });
    
    return summary;
  }, [stockItems]);

  const handleReset = () => {
    setStockItems(initialStockData);
    setUpdateDate(new Date().toISOString().split("T")[0]);
    setSaveSuccess(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);

    // ตรวจสอบว่ามีการกรอกข้อมูลหรือไม่ (เฉพาะสาขาที่เลือก)
    const itemsToCheck = selectedBranch === "all" ? stockItems : filteredStockItems;
    const hasUpdates = itemsToCheck.some((item) => item.usageAmount > 0);
    if (!hasUpdates) {
      alert("กรุณากรอกจำนวนการใช้น้ำมันอย่างน้อย 1 รายการ");
      setIsSaving(false);
      return;
    }

    // จำลองการบันทึกข้อมูล
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // อัพเดตสถานะและวันที่
      const now = new Date();
      const timeString = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
      const dateString = `${updateDate} ${timeString}`;

      setStockItems((prev) =>
        prev.map((item) => ({
          ...item,
          lastUpdated: dateString,
          currentStock: item.updatedStock,
          usageAmount: 0,
          updatedStock: item.updatedStock,
          status: "pending",
        }))
      );

      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (error) {
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    } finally {
      setIsSaving(false);
    }
  };

  const totalUsage = filteredStockItems.reduce((sum, item) => sum + item.usageAmount, 0);
  const updatedCount = filteredStockItems.filter((item) => item.usageAmount > 0).length;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2 flex items-center gap-3">
              <Package className="w-8 h-8 text-blue-500" />
              อัพเดตสต็อกน้ำมัน
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              อัพเดตการใช้น้ำมันในระหว่างวัน สำหรับแต่ละชนิดน้ำมัน
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/app/gas-station/stock-update-history")}
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white rounded-xl transition-all duration-200 font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2"
            >
              <History className="w-4 h-4" />
              ดูประวัติการอัปเดตน้ำมัน
            </button>
            <button
              onClick={() => navigate("/app/gas-station/stock")}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors"
            >
              ← กลับไปหน้าสต็อก
            </button>
          </div>
        </div>

        {/* Branch Selector and Date Picker */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
            <Building2 className="w-5 h-5 text-gray-500" />
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">เลือกสาขา:</label>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 text-gray-800 dark:text-white"
            >
              <option value="all">ทุกสาขา</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.name}>
                  {branch.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-3 bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
            <Calendar className="w-5 h-5 text-gray-500" />
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">วันที่อัพเดต:</label>
            <input
              type="date"
              value={updateDate}
              onChange={(e) => setUpdateDate(e.target.value)}
              className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 text-gray-800 dark:text-white"
            />
          </div>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Droplet className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">จำนวนที่ใช้รวม</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {numberFormatter.format(totalUsage)} ลิตร
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">รายการที่อัพเดตแล้ว</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {updatedCount} / {filteredStockItems.length}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">รายการที่ยังไม่อัพเดต</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {filteredStockItems.length - updatedCount} / {filteredStockItems.length}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Success Message */}
      {saveSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="bg-emerald-50 dark:bg-emerald-900/20 border-l-4 border-emerald-500 rounded-xl p-4 flex items-center gap-3"
        >
          <CheckCircle className="w-5 h-5 text-emerald-500" />
          <p className="text-emerald-800 dark:text-emerald-200 font-semibold">
            บันทึกข้อมูลการอัพเดตสต็อกสำเร็จแล้ว
          </p>
        </motion.div>
      )}

      {/* Update Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden"
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-1">
                อัพเดตการใช้น้ำมันรายวัน
                {selectedBranch !== "all" && (
                  <span className="ml-2 text-base font-normal text-blue-600 dark:text-blue-400">
                    ({selectedBranch})
                  </span>
                )}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {selectedBranch === "all" 
                  ? "กรุณากรอกจำนวนน้ำมันที่ใช้ไปในระหว่างวันสำหรับแต่ละชนิดน้ำมันทุกสาขา"
                  : `กรุณากรอกจำนวนน้ำมันที่ใช้ไปในระหว่างวันสำหรับแต่ละชนิดน้ำมัน - ${selectedBranch}`
                }
              </p>
            </div>
            {selectedBranch === "all" && (
              <div className="text-right">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">สรุปทุกสาขา</p>
                <div className="flex flex-wrap gap-2 justify-end">
                  {branches.map((branch) => {
                    const summary = branchSummary[branch.name];
                    return (
                      <div
                        key={branch.id}
                        className="px-2 py-1 bg-blue-50 dark:bg-blue-900/20 rounded text-xs text-blue-700 dark:text-blue-300"
                      >
                        {branch.name}: {summary.updatedCount}/{summary.totalItems}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                {selectedBranch === "all" && (
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400">
                    สาขา
                  </th>
                )}
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400">
                  ประเภทน้ำมัน
                </th>
                <th className="text-right py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400">
                  สต็อกปัจจุบัน
                </th>
                <th className="text-right py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400">
                  จำนวนที่ใช้ (ลิตร)
                </th>
                <th className="text-right py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400">
                  สต็อกหลังอัพเดต
                </th>
                <th className="text-center py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400">
                  สถานะ
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredStockItems.map((item, index) => (
                <motion.tr
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className={`border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                    item.usageAmount > 0 ? "bg-blue-50/30 dark:bg-blue-900/10" : ""
                  }`}
                >
                  {selectedBranch === "all" && (
                    <td className="py-4 px-6 text-sm font-medium text-gray-700 dark:text-gray-300">
                      {item.branch}
                    </td>
                  )}
                  <td className="py-4 px-6 text-sm font-semibold text-gray-800 dark:text-white">
                    {item.oilType}
                  </td>
                  <td className="py-4 px-6 text-sm text-right text-gray-600 dark:text-gray-400">
                    {numberFormatter.format(item.currentStock)} ลิตร
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-end gap-2">
                      <input
                        type="number"
                        min="0"
                        max={item.currentStock}
                        step="0.01"
                        value={item.usageAmount || ""}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value) || 0;
                          handleUsageChange(item.id, value);
                        }}
                        placeholder="0"
                        className="w-32 px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 text-gray-800 dark:text-white text-right"
                      />
                      <span className="text-sm text-gray-500 dark:text-gray-400">ลิตร</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-sm text-right font-semibold text-gray-800 dark:text-white">
                    {numberFormatter.format(item.updatedStock)} ลิตร
                  </td>
                  <td className="py-4 px-6 text-center">
                    {item.usageAmount > 0 ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800">
                        <CheckCircle className="w-3.5 h-3.5" />
                        อัพเดตแล้ว
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-900/30 dark:text-gray-400 dark:border-gray-800">
                        <AlertCircle className="w-3.5 h-3.5" />
                        ยังไม่อัพเดต
                      </span>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Action Buttons */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between gap-4">
          <button
            onClick={handleReset}
            disabled={isSaving}
            className="px-6 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl transition-all duration-200 font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RotateCcw className="w-4 h-4" />
            รีเซ็ต
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || updatedCount === 0}
            className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl transition-all duration-200 font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                กำลังบันทึก...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                บันทึกการอัพเดต
              </>
            )}
          </button>
        </div>
      </motion.div>

      {/* Info Alert */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 dark:border-blue-600 rounded-xl p-4"
      >
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
              คำแนะนำการใช้งาน
            </h3>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-disc list-inside">
              <li>กรุณากรอกจำนวนน้ำมันที่ใช้ไปในระหว่างวันสำหรับแต่ละชนิดน้ำมัน</li>
              <li>ระบบจะคำนวณสต็อกหลังอัพเดตอัตโนมัติ (สต็อกปัจจุบัน - จำนวนที่ใช้)</li>
              <li>ควรอัพเดตข้อมูลทุกวันเพื่อให้สต็อกมีความถูกต้อง</li>
              <li>หลังจากบันทึกแล้ว สต็อกปัจจุบันจะถูกอัพเดตเป็นสต็อกหลังอัพเดต</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

