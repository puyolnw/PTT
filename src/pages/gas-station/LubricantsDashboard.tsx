import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Droplet,
    TrendingUp,
    Package,
    AlertTriangle,
    ShoppingCart,
    Wrench,
    BarChart3,
    Calendar,
    ArrowUp,
    ArrowDown,
    Upload,
    RefreshCw,
    CheckCircle2,
} from "lucide-react";

const numberFormatter = new Intl.NumberFormat("th-TH", {
    maximumFractionDigits: 0,
});

const currencyFormatter = new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    maximumFractionDigits: 0,
});

export default function LubricantsDashboard() {
    const navigate = useNavigate();
    const [selectedPeriod, setSelectedPeriod] = useState<"today" | "week" | "month">("today");

    // Mock data - in real app, this would come from API
    const stats = {
        today: {
            totalSales: 45600,
            posSales: 28400,
            fitAutoSales: 17200,
            totalStock: 1250,
            stockValue: 312500,
            lowStockCount: 3,
            lastSync: "2024-12-13 09:30",
            elsaSyncStatus: "success" as "success" | "pending" | "error",
        },
        comparison: {
            sales: 12.5, // % change from yesterday
            pos: 8.3,
            fitAuto: 18.7,
        },
    };

    const topProducts = [
        { name: "น้ำมันเครื่อง 10W-40", posSales: 45, fitAutoSales: 32, total: 77 },
        { name: "น้ำมันเครื่อง 15W-40", posSales: 38, fitAutoSales: 28, total: 66 },
        { name: "น้ำมันเครื่อง 20W-50", posSales: 25, fitAutoSales: 18, total: 43 },
        { name: "น้ำมันเกียร์", posSales: 15, fitAutoSales: 22, total: 37 },
        { name: "น้ำมันเบรก", posSales: 12, fitAutoSales: 15, total: 27 },
    ];

    const channelData = [
        { channel: "POS หน้าปั๊ม", sales: stats.today.posSales, percentage: 62, color: "emerald" },
        { channel: "Fit Auto", sales: stats.today.fitAutoSales, percentage: 38, color: "purple" },
    ];

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between"
            >
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg shadow-lg">
                            <Droplet className="w-6 h-6 text-white" />
                        </div>
                        Dashboard น้ำมันเครื่อง & Lubricants
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        ภาพรวมยอดขายและสต็อกจากทุกช่องทาง
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <select
                        value={selectedPeriod}
                        onChange={(e) => setSelectedPeriod(e.target.value as any)}
                        className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                    >
                        <option value="today">วันนี้</option>
                        <option value="week">สัปดาห์นี้</option>
                        <option value="month">เดือนนี้</option>
                    </select>
                </div>
            </motion.div>

            {/* Main Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    {
                        title: "ยอดขายรวมวันนี้",
                        value: currencyFormatter.format(stats.today.totalSales),
                        change: stats.comparison.sales,
                        icon: TrendingUp,
                        color: "from-blue-500 to-blue-600",
                    },
                    {
                        title: "ขาย POS",
                        value: currencyFormatter.format(stats.today.posSales),
                        change: stats.comparison.pos,
                        icon: ShoppingCart,
                        color: "from-emerald-500 to-emerald-600",
                    },
                    {
                        title: "ขาย Fit Auto",
                        value: currencyFormatter.format(stats.today.fitAutoSales),
                        change: stats.comparison.fitAuto,
                        icon: Wrench,
                        color: "from-purple-500 to-purple-600",
                    },
                    {
                        title: "สต็อกต่ำ",
                        value: stats.today.lowStockCount,
                        subtitle: "รายการ",
                        icon: AlertTriangle,
                        color: "from-red-500 to-red-600",
                        alert: true,
                    },
                ].map((stat, index) => (
                    <motion.div
                        key={stat.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className={`p-3 bg-gradient-to-br ${stat.color} rounded-lg shadow-lg`}>
                                <stat.icon className="w-6 h-6 text-white" />
                            </div>
                            {stat.change !== undefined && (
                                <div
                                    className={`flex items-center gap-1 text-sm font-semibold ${stat.change >= 0 ? "text-emerald-600" : "text-red-600"
                                        }`}
                                >
                                    {stat.change >= 0 ? (
                                        <ArrowUp className="w-4 h-4" />
                                    ) : (
                                        <ArrowDown className="w-4 h-4" />
                                    )}
                                    {Math.abs(stat.change)}%
                                </div>
                            )}
                        </div>
                        <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-1">{stat.title}</h3>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                        {stat.subtitle && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{stat.subtitle}</p>
                        )}
                    </motion.div>
                ))}
            </div>

            {/* Channel Performance */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Sales by Channel */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-blue-600" />
                            ยอดขายตามช่องทาง
                        </h2>
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                            {stats.today.elsaSyncStatus === "success" ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            ) : (
                                <RefreshCw className="w-4 h-4 text-orange-500 animate-spin" />
                            )}
                            <span>Sync: {stats.today.lastSync}</span>
                        </div>
                    </div>
                    <div className="space-y-4">
                        {channelData.map((channel) => (
                            <div key={channel.channel}>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        {channel.channel}
                                    </span>
                                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                                        {currencyFormatter.format(channel.sales)}
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                                    <div
                                        className={`bg-gradient-to-r from-${channel.color}-500 to-${channel.color}-600 h-3 rounded-full transition-all duration-500`}
                                        style={{ width: `${channel.percentage}%` }}
                                    />
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {channel.percentage}% ของยอดขายรวม
                                </p>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Top Products */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6"
                >
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                        <Package className="w-5 h-5 text-purple-600" />
                        Top 5 สินค้าขายดี
                    </h2>
                    <div className="space-y-3">
                        {topProducts.map((product, index) => (
                            <div
                                key={product.name}
                                className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                            >
                                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                                    {index + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                        {product.name}
                                    </p>
                                    <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400 mt-1">
                                        <span>POS: {product.posSales}</span>
                                        <span>•</span>
                                        <span>Fit Auto: {product.fitAutoSales}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                                        {product.total}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">ลิตร</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Quick Actions */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6"
            >
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">เมนูด่วน</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        {
                            label: "จัดการสต็อก",
                            icon: Package,
                            path: "/app/gas-station/lubricants",
                            color: "emerald",
                        },
                        {
                            label: "น้ำมันเครื่อง",
                            icon: Droplet,
                            path: "/app/gas-station/engine-oil",
                            color: "blue",
                        },
                        {
                            label: "ประวัติการขาย",
                            icon: Calendar,
                            path: "/app/gas-station/product-sales-history",
                            color: "orange",
                        },
                        {
                            label: "Import Elsa",
                            icon: Upload,
                            path: "/app/gas-station/elsa-integration",
                            color: "purple",
                        },
                    ].map((action) => (
                        <button
                            key={action.label}
                            onClick={() => navigate(action.path)}
                            className={`p-4 bg-${action.color}-50 dark:bg-${action.color}-900/20 hover:bg-${action.color}-100 dark:hover:bg-${action.color}-900/30 rounded-lg transition-colors group`}
                        >
                            <action.icon
                                className={`w-6 h-6 text-${action.color}-600 dark:text-${action.color}-400 mx-auto mb-2 group-hover:scale-110 transition-transform`}
                            />
                            <p className={`text-sm font-medium text-${action.color}-900 dark:text-${action.color}-100`}>
                                {action.label}
                            </p>
                        </button>
                    ))}
                </div>
            </motion.div>

            {/* Stock Summary */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6"
            >
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Package className="w-5 h-5 text-emerald-600" />
                    สรุปสต็อก
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">สต็อกรวม</p>
                        <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                            {numberFormatter.format(stats.today.totalStock)} ลิตร
                        </p>
                    </div>
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">มูลค่าสต็อก</p>
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            {currencyFormatter.format(stats.today.stockValue)}
                        </p>
                    </div>
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">สต็อกต่ำ</p>
                        <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                            {stats.today.lowStockCount} รายการ
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
