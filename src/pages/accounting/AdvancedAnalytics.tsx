import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, DollarSign, BarChart3, Brain } from "lucide-react";
import { useState } from "react";

const currencyFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 0,
});

// Mock data - Advanced Analytics
const mockAnalytics = {
  cashFlowForecast: {
    currentMonth: 5000000,
    next3Months: [
      { month: "พฤศจิกายน 2568", forecast: 5200000, confidence: 85 },
      { month: "ธันวาคม 2568", forecast: 5500000, confidence: 80 },
      { month: "มกราคม 2569", forecast: 5300000, confidence: 75 },
    ],
    next6Months: [
      { month: "พฤศจิกายน 2568", forecast: 5200000, confidence: 85 },
      { month: "ธันวาคม 2568", forecast: 5500000, confidence: 80 },
      { month: "มกราคม 2569", forecast: 5300000, confidence: 75 },
      { month: "กุมภาพันธ์ 2569", forecast: 5100000, confidence: 70 },
      { month: "มีนาคม 2569", forecast: 5400000, confidence: 70 },
      { month: "เมษายน 2569", forecast: 5600000, confidence: 65 },
    ],
  },
  trendAnalysis: {
    revenue: {
      trend: "upward",
      growthRate: 5.8,
      months: [
        { month: "ก.ค. 2568", value: 4800000 },
        { month: "ส.ค. 2568", value: 5000000 },
        { month: "ก.ย. 2568", value: 5200000 },
        { month: "ต.ค. 2568", value: 5500000 },
      ],
    },
    expenses: {
      trend: "stable",
      growthRate: 2.1,
      months: [
        { month: "ก.ค. 2568", value: 4100000 },
        { month: "ส.ค. 2568", value: 4050000 },
        { month: "ก.ย. 2568", value: 4000000 },
        { month: "ต.ค. 2568", value: 4200000 },
      ],
    },
    profit: {
      trend: "upward",
      growthRate: 8.3,
      months: [
        { month: "ก.ค. 2568", value: 700000 },
        { month: "ส.ค. 2568", value: 950000 },
        { month: "ก.ย. 2568", value: 1200000 },
        { month: "ต.ค. 2568", value: 1300000 },
      ],
    },
  },
  varianceAnalysis: {
    budget: 5000000,
    actual: 5500000,
    variance: 500000,
    variancePercent: 10,
    status: "favorable",
  },
};

export default function AdvancedAnalytics() {
  const [forecastPeriod, setForecastPeriod] = useState<"3months" | "6months">("3months");

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h2 className="text-3xl font-bold text-app mb-2 font-display">การวิเคราะห์ขั้นสูง</h2>
        <p className="text-muted font-light">
          พยากรณ์กระแสเงินสด 3-6 เดือน, วิเคราะห์แนวโน้มกำไร (Trend Analysis), และวิเคราะห์ Variance กับงบประมาณ
        </p>
      </motion.div>

      {/* Cash Flow Forecasting */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="panel rounded-2xl p-6 shadow-app"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-app">พยากรณ์กระแสเงินสด</h3>
            <p className="text-sm text-muted">Cash Flow Forecasting</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setForecastPeriod("3months")}
              className={`px-4 py-2 rounded-xl text-sm transition-colors ${forecastPeriod === "3months"
                ? "bg-ptt-blue/10 text-ptt-cyan border border-ptt-blue/30"
                : "bg-soft text-muted border border-app"
                }`}
            >
              3 เดือน
            </button>
            <button
              onClick={() => setForecastPeriod("6months")}
              className={`px-4 py-2 rounded-xl text-sm transition-colors ${forecastPeriod === "6months"
                ? "bg-ptt-blue/10 text-ptt-cyan border border-ptt-blue/30"
                : "bg-soft text-muted border border-app"
                }`}
            >
              6 เดือน
            </button>
          </div>
        </div>
        <div className="mb-4 p-4 bg-ptt-blue/10 border border-ptt-blue/30 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted mb-1">ยอดเงินสดปัจจุบัน</p>
              <p className="text-2xl font-bold text-ptt-cyan">
                {currencyFormatter.format(mockAnalytics.cashFlowForecast.currentMonth)}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-ptt-cyan" />
          </div>
        </div>
        <div className="space-y-3">
          {(forecastPeriod === "3months"
            ? mockAnalytics.cashFlowForecast.next3Months
            : mockAnalytics.cashFlowForecast.next6Months
          ).map((forecast, index) => (
            <div
              key={forecast.month}
              className="p-4 bg-soft rounded-xl border border-app"
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="font-medium text-app">{forecast.month}</p>
                  <p className="text-xs text-muted">
                    ความมั่นใจ: {forecast.confidence}%
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-ptt-cyan">
                    {currencyFormatter.format(forecast.forecast)}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-muted mt-1">
                    {index > 0 && (
                      <>
                        {forecast.forecast > (forecastPeriod === "3months"
                          ? mockAnalytics.cashFlowForecast.next3Months[index - 1].forecast
                          : mockAnalytics.cashFlowForecast.next6Months[index - 1].forecast
                        ) ? (
                          <TrendingUp className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <TrendingDown className="w-3 h-3 text-red-400" />
                        )}
                        <span>
                          {((forecast.forecast - (forecastPeriod === "3months"
                            ? mockAnalytics.cashFlowForecast.next3Months[index - 1].forecast
                            : mockAnalytics.cashFlowForecast.next6Months[index - 1].forecast
                          )) / (forecastPeriod === "3months"
                            ? mockAnalytics.cashFlowForecast.next3Months[index - 1].forecast
                            : mockAnalytics.cashFlowForecast.next6Months[index - 1].forecast
                            ) * 100).toFixed(1)}%
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-2">
                <div className="h-2 bg-soft rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-ptt-blue to-ptt-cyan transition-all duration-300 w-[var(--confidence-width)]"
                    style={{ "--confidence-width": `${forecast.confidence}%` } as React.CSSProperties}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Trend Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="panel rounded-2xl p-6 shadow-app"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-app">วิเคราะห์แนวโน้ม (Trend Analysis)</h3>
            <p className="text-sm text-muted">AI-Powered Trend Analysis</p>
          </div>
          <Brain className="w-6 h-6 text-muted" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted">รายได้</span>
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            </div>
            <p className="text-2xl font-bold text-emerald-400 mb-2">
              +{mockAnalytics.trendAnalysis.revenue.growthRate}%
            </p>
            <p className="text-xs text-muted mb-3">แนวโน้ม: เพิ่มขึ้น</p>
            <div className="space-y-1">
              {mockAnalytics.trendAnalysis.revenue.months.map((item) => (
                <div key={item.month} className="flex justify-between text-xs">
                  <span className="text-muted">{item.month}</span>
                  <span className="text-app font-semibold">
                    {currencyFormatter.format(item.value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted">ค่าใช้จ่าย</span>
              <TrendingDown className="w-5 h-5 text-orange-400" />
            </div>
            <p className="text-2xl font-bold text-orange-400 mb-2">
              +{mockAnalytics.trendAnalysis.expenses.growthRate}%
            </p>
            <p className="text-xs text-muted mb-3">แนวโน้ม: คงที่</p>
            <div className="space-y-1">
              {mockAnalytics.trendAnalysis.expenses.months.map((item) => (
                <div key={item.month} className="flex justify-between text-xs">
                  <span className="text-muted">{item.month}</span>
                  <span className="text-app font-semibold">
                    {currencyFormatter.format(item.value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted">กำไรสุทธิ</span>
              <TrendingUp className="w-5 h-5 text-purple-400" />
            </div>
            <p className="text-2xl font-bold text-purple-400 mb-2">
              +{mockAnalytics.trendAnalysis.profit.growthRate}%
            </p>
            <p className="text-xs text-muted mb-3">แนวโน้ม: เพิ่มขึ้น</p>
            <div className="space-y-1">
              {mockAnalytics.trendAnalysis.profit.months.map((item) => (
                <div key={item.month} className="flex justify-between text-xs">
                  <span className="text-muted">{item.month}</span>
                  <span className="text-app font-semibold">
                    {currencyFormatter.format(item.value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Variance Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="panel rounded-2xl p-6 shadow-app"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-app">วิเคราะห์ Variance กับงบประมาณ</h3>
            <p className="text-sm text-muted">Budget vs Actual</p>
          </div>
          <BarChart3 className="w-6 h-6 text-muted" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
            <p className="text-sm text-muted mb-1">งบประมาณ</p>
            <p className="text-2xl font-bold text-blue-400">
              {currencyFormatter.format(mockAnalytics.varianceAnalysis.budget)}
            </p>
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
            <p className="text-sm text-muted mb-1">ยอดจริง</p>
            <p className="text-2xl font-bold text-emerald-400">
              {currencyFormatter.format(mockAnalytics.varianceAnalysis.actual)}
            </p>
          </div>
          <div className={`rounded-xl p-4 ${mockAnalytics.varianceAnalysis.status === "favorable"
            ? "bg-emerald-500/10 border border-emerald-500/30"
            : "bg-red-500/10 border border-red-500/30"
            }`}>
            <p className="text-sm text-muted mb-1">ส่วนต่าง (Variance)</p>
            <p className={`text-2xl font-bold ${mockAnalytics.varianceAnalysis.status === "favorable"
              ? "text-emerald-400"
              : "text-red-400"
              }`}>
              {mockAnalytics.varianceAnalysis.variance > 0 ? "+" : ""}
              {currencyFormatter.format(mockAnalytics.varianceAnalysis.variance)}
            </p>
            <p className="text-xs text-muted mt-1">
              ({mockAnalytics.varianceAnalysis.variancePercent > 0 ? "+" : ""}
              {mockAnalytics.varianceAnalysis.variancePercent}%)
            </p>
          </div>
        </div>
        <div className="mt-4 p-3 bg-soft rounded-lg border border-app">
          <p className="text-sm text-muted">
            <strong>หมายเหตุ:</strong> ส่วนต่างเป็นบวกหมายถึงยอดจริงสูงกว่างบประมาณ (ดี) ส่วนต่างเป็นลบหมายถึงยอดจริงต่ำกว่างบประมาณ (ต้องตรวจสอบ)
          </p>
        </div>
      </motion.div>
    </div>
  );
}

