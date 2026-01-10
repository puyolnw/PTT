import { useMemo } from "react";
import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  TrendingDown,
  Droplet,
  Store,
  Building,
  Fuel,
  Truck,
  PiggyBank,
  BarChart3,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Wallet,
  Package,
  LayoutGrid
} from "lucide-react";
import { motion } from "framer-motion";
import { useGasStation } from "@/contexts/GasStationContext";

export default function Dashboard() {
  const { purchaseOrders, allInternalPumpSales } = useGasStation();

  // Safety check: ตรวจสอบว่าข้อมูลมาจาก context หรือไม่
  const safeAllInternalPumpSales = useMemo(() => allInternalPumpSales || [], [allInternalPumpSales]);
  const safePurchaseOrders = useMemo(() => purchaseOrders || [], [purchaseOrders]);

  const currencyFormatter = useMemo(() => new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
  }), []);

  const numberFormatter = useMemo(() => new Intl.NumberFormat("th-TH"), []);

  // Mock data สำหรับกราฟยอดขาย (ใช้ถ้าไม่มีข้อมูลจริง)
  const mockSalesData = useMemo(() => {
    const baseValue = 700000;
    const variations = [0.85, 0.92, 0.88, 1.15, 1.08, 1.00]; // Variation for each month
    return variations.map(v => {
      const avg = baseValue * v;
      return {
        avg: avg,
        min: avg * 0.75, // ต่ำสุด 75% ของค่าเฉลี่ย
        max: avg * 1.25  // สูงสุด 125% ของค่าเฉลี่ย
      };
    });
  }, []);

  // คำนวณยอดขายรวม
  const salesData = useMemo(() => {
    const activeSales = safeAllInternalPumpSales.filter(s => s && s.status === "ปกติ");
    const totalSales = activeSales.reduce((sum, s) => sum + (s.totalAmount || 0), 0);
    const totalVolume = activeSales.reduce((sum, s) => sum + s.items.reduce((is, i) => is + (i.quantity || 0), 0), 0);
    
    // คำนวณยอดขาย 6 เดือนล่าสุด
    const monthlySales = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (5 - i));
      if (isNaN(date.getTime())) {
        date.setTime(Date.now());
        date.setMonth(new Date().getMonth() - (5 - i));
      }
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      const monthSales = activeSales.filter(s => {
        if (!s.saleDate) return false;
        try {
          const saleDate = new Date(s.saleDate);
          if (isNaN(saleDate.getTime())) return false;
          const saleMonth = saleDate.toISOString().substring(0, 7);
          return saleMonth === monthKey;
        } catch {
          return false;
        }
      });
      
      const actualValue = monthSales.reduce((sum, s) => sum + (s.totalAmount || 0), 0);
      const actualVolume = monthSales.reduce((sum, s) => sum + s.items.reduce((is, i) => is + (i.quantity || 0), 0), 0);
      
      // คำนวณ min/max จากข้อมูลจริง
      const actualValues = monthSales.map(s => s.totalAmount || 0).filter(v => v > 0);
      const actualMin = actualValues.length > 0 ? Math.min(...actualValues) : 0;
      const actualMax = actualValues.length > 0 ? Math.max(...actualValues) : 0;
      
      // ใช้ mock data ถ้าไม่มีข้อมูลจริง
      const mockData = mockSalesData[i] || { avg: 0, min: 0, max: 0 };
      const avg = actualValue > 0 ? actualValue : mockData.avg;
      const min = actualMin > 0 ? actualMin : mockData.min;
      const max = actualMax > 0 ? actualMax : mockData.max;
      const volume = actualVolume > 0 ? actualVolume : Math.round(avg / 31); // ประมาณ 31 บาท/ลิตร
      
      let monthLabel = '';
      try {
        monthLabel = date.toLocaleDateString('th-TH', { month: 'short', year: 'numeric' });
      } catch {
        const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
        monthLabel = `${months[date.getMonth()]} ${date.getFullYear() + 543}`;
      }
      
      return {
        month: monthLabel,
        value: avg,
        min: min,
        max: max,
        volume: volume
      };
    });

    // คำนวณ total ใหม่จาก monthly data (รวม mock data)
    const calculatedTotalSales = monthlySales.reduce((sum, m) => sum + m.value, 0);
    const calculatedTotalVolume = monthlySales.reduce((sum, m) => sum + m.volume, 0);

    return { 
      totalSales: totalSales > 0 ? totalSales : calculatedTotalSales, 
      totalVolume: totalVolume > 0 ? totalVolume : calculatedTotalVolume, 
      monthlySales 
    };
  }, [safeAllInternalPumpSales, mockSalesData]);

  // Mock data สำหรับกราฟยอดสั่งซื้อ (ใช้ถ้าไม่มีข้อมูลจริง)
  const mockPurchaseData = useMemo(() => {
    const baseValue = 2000000;
    const variations = [0.90, 1.05, 0.95, 1.20, 1.10, 1.00]; // Variation for each month
    return variations.map(v => {
      const avg = baseValue * v;
      return {
        avg: avg,
        min: avg * 0.70, // ต่ำสุด 70% ของค่าเฉลี่ย
        max: avg * 1.30, // สูงสุด 130% ของค่าเฉลี่ย
        count: Math.round(3 + (v - 1) * 2) // 3-5 orders per month
      };
    });
  }, []);

  // คำนวณยอดสั่งซื้อ
  const purchaseData = useMemo(() => {
    // PurchaseOrder status: "รอเริ่ม" | "กำลังขนส่ง" | "ขนส่งสำเร็จ" | "ยกเลิก"
    const activeOrders = safePurchaseOrders.filter(o => o && o.status !== "ยกเลิก");
    const totalPurchase = activeOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    
    // คำนวณยอดสั่งซื้อ 6 เดือนล่าสุด
    const monthlyPurchases = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (5 - i));
      if (isNaN(date.getTime())) {
        date.setTime(Date.now());
        date.setMonth(new Date().getMonth() - (5 - i));
      }
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      const monthOrders = activeOrders.filter(o => {
        const dateStr = o.orderDate || o.approvedAt;
        if (!dateStr) return false;
        try {
          const orderDate = new Date(dateStr);
          if (isNaN(orderDate.getTime())) return false;
          const orderMonth = orderDate.toISOString().substring(0, 7);
          return orderMonth === monthKey;
        } catch {
          return false;
        }
      });
      
      const actualValue = monthOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
      const actualCount = monthOrders.length;
      
      // คำนวณ min/max จากข้อมูลจริง
      const actualValues = monthOrders.map(o => o.totalAmount || 0).filter(v => v > 0);
      const actualMin = actualValues.length > 0 ? Math.min(...actualValues) : 0;
      const actualMax = actualValues.length > 0 ? Math.max(...actualValues) : 0;
      
      // ใช้ mock data ถ้าไม่มีข้อมูลจริง
      const mockPurchaseItem = mockPurchaseData[i] || { avg: 0, min: 0, max: 0, count: 0 };
      const avg = actualValue > 0 ? actualValue : mockPurchaseItem.avg;
      const min = actualMin > 0 ? actualMin : mockPurchaseItem.min;
      const max = actualMax > 0 ? actualMax : mockPurchaseItem.max;
      const count = actualCount > 0 ? actualCount : mockPurchaseItem.count;
      
      let monthLabel = '';
      try {
        monthLabel = date.toLocaleDateString('th-TH', { month: 'short', year: 'numeric' });
      } catch {
        const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
        monthLabel = `${months[date.getMonth()]} ${date.getFullYear() + 543}`;
      }
      
      return {
        month: monthLabel,
        value: avg,
        min: min,
        max: max,
        count: count
      };
    });

    // คำนวณ total ใหม่จาก monthly data (รวม mock data)
    const calculatedTotalPurchase = monthlyPurchases.reduce((sum, m) => sum + m.value, 0);
    const calculatedTotalCount = monthlyPurchases.reduce((sum, m) => sum + m.count, 0);

    return { 
      totalPurchase: totalPurchase > 0 ? totalPurchase : calculatedTotalPurchase, 
      monthlyPurchases,
      totalCount: calculatedTotalCount
    };
  }, [safePurchaseOrders, mockPurchaseData]);

  // คำนวณรายรับ/รายจ่าย/กำไร โดยโมดูล
  const moduleStats = useMemo(() => {
    // ปั๊มน้ำมัน
    const gasStationSales = salesData.totalSales;
    const gasStationPurchases = purchaseData.totalPurchase;
    const gasStationProfit = gasStationSales - gasStationPurchases;

    // Delivery (ใช้ข้อมูลจาก purchase orders)
    const deliveryPurchases = purchaseData.totalPurchase * 0.3; // ตัวอย่าง: 30% ของ purchase
    const deliverySales = salesData.totalSales * 0.15; // ตัวอย่าง: 15% ของ sales
    const deliveryProfit = deliverySales - deliveryPurchases;

    // ร้านค้า (Mock data)
    const shopSales = 1250000;
    const shopExpenses = 850000;
    const shopProfit = shopSales - shopExpenses;

    // เช่า (Mock data)
    const rentalIncome = 350000;
    const rentalExpenses = 120000;
    const rentalProfit = rentalIncome - rentalExpenses;

    // กองทุน (Mock data)
    const fundIncome = 450000;
    const fundExpenses = 320000;
    const fundProfit = fundIncome - fundExpenses;

    return [
      {
        name: "ระบบปั๊มน้ำมัน",
        icon: Fuel,
        revenue: gasStationSales,
        expenses: gasStationPurchases,
        profit: gasStationProfit,
        bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
        iconColor: "text-emerald-500"
      },
      {
        name: "ระบบ Delivery",
        icon: Truck,
        revenue: deliverySales,
        expenses: deliveryPurchases,
        profit: deliveryProfit,
        bgColor: "bg-blue-50 dark:bg-blue-900/20",
        iconColor: "text-blue-500"
      },
      {
        name: "ร้านค้าพื้นที่ปั๊ม",
        icon: Store,
        revenue: shopSales,
        expenses: shopExpenses,
        profit: shopProfit,
        bgColor: "bg-purple-50 dark:bg-purple-900/20",
        iconColor: "text-purple-500"
      },
      {
        name: "จัดการพื้นที่เช่า",
        icon: Building,
        revenue: rentalIncome,
        expenses: rentalExpenses,
        profit: rentalProfit,
        bgColor: "bg-amber-50 dark:bg-amber-900/20",
        iconColor: "text-amber-500"
      },
      {
        name: "ระบบกองทุน",
        icon: PiggyBank,
        revenue: fundIncome,
        expenses: fundExpenses,
        profit: fundProfit,
        bgColor: "bg-rose-50 dark:bg-rose-900/20",
        iconColor: "text-rose-500"
      }
    ];
  }, [salesData, purchaseData]);

  // สรุปภาพรวม
  const totalRevenue = useMemo(() => 
    moduleStats.reduce((sum, m) => sum + m.revenue, 0), 
    [moduleStats]
  );
  
  const totalExpenses = useMemo(() => 
    moduleStats.reduce((sum, m) => sum + m.expenses, 0), 
    [moduleStats]
  );
  
  const totalProfit = useMemo(() => 
    totalRevenue - totalExpenses, 
    [totalRevenue, totalExpenses]
  );

  // คำนวณเปอร์เซ็นต์การเปลี่ยนแปลง
  const salesTrend = useMemo(() => {
    if (salesData.monthlySales.length < 2) return { percent: 0, isPositive: true };
    const recent = salesData.monthlySales.slice(-2);
    if (recent[0].value === 0) {
      // ถ้าค่าแรกเป็น 0 ให้คำนวณจากค่าเฉลี่ยของเดือนก่อนหน้า
      const avgValue = salesData.monthlySales.slice(0, -2).reduce((sum, m) => sum + m.value, 0) / Math.max(1, salesData.monthlySales.length - 2);
      if (avgValue === 0) return { percent: 0, isPositive: true };
      const change = ((recent[1].value - avgValue) / avgValue) * 100;
      return { percent: Math.abs(change), isPositive: change >= 0 };
    }
    const change = ((recent[1].value - recent[0].value) / recent[0].value) * 100;
    return { 
      percent: isNaN(change) || !isFinite(change) ? 0 : Math.abs(change), 
      isPositive: change >= 0 
    };
  }, [salesData]);

  const purchaseTrend = useMemo(() => {
    if (purchaseData.monthlyPurchases.length < 2) return { percent: 0, isPositive: true };
    const recent = purchaseData.monthlyPurchases.slice(-2);
    if (recent[0].value === 0) {
      // ถ้าค่าแรกเป็น 0 ให้คำนวณจากค่าเฉลี่ยของเดือนก่อนหน้า
      const avgValue = purchaseData.monthlyPurchases.slice(0, -2).reduce((sum, m) => sum + m.value, 0) / Math.max(1, purchaseData.monthlyPurchases.length - 2);
      if (avgValue === 0) return { percent: 0, isPositive: true };
      const change = ((recent[1].value - avgValue) / avgValue) * 100;
      return { percent: Math.abs(change), isPositive: change >= 0 };
    }
    const change = ((recent[1].value - recent[0].value) / recent[0].value) * 100;
    return { 
      percent: isNaN(change) || !isFinite(change) ? 0 : Math.abs(change), 
      isPositive: change >= 0 
    };
  }, [purchaseData]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-ptt-cyan font-display flex items-center gap-3">
          <div className="p-2 bg-emerald-500 rounded-xl shadow-lg shadow-emerald-500/20">
            <LayoutGrid className="w-6 h-6 text-white" />
          </div>
          Dashboard
        </h2>
        <p className="text-muted font-light mt-2 flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          ภาพรวมทั้งหมดของทุกโมดูลและกิจการย่อยของปั๊ม
        </p>
      </div>

      {/* Summary Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="panel/40 border border-app rounded-2xl p-6"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl">
              <TrendingUp className="w-6 h-6 text-emerald-500" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted font-light">รายรับรวม</p>
              <p className="text-2xl font-bold text-app">{currencyFormatter.format(totalRevenue)}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-rose-50 dark:bg-rose-900/20 rounded-2xl">
              <TrendingDown className="w-6 h-6 text-rose-500" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">รายจ่ายรวม</p>
              <p className="text-2xl font-black text-gray-900 dark:text-white">{currencyFormatter.format(totalExpenses)}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-2xl ${totalProfit >= 0 ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
              <DollarSign className={`w-6 h-6 ${totalProfit >= 0 ? 'text-blue-500' : 'text-red-500'}`} />
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">กำไรสุทธิ</p>
              <p className={`text-2xl font-black ${totalProfit >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}`}>
                {currencyFormatter.format(totalProfit)}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-2xl">
              <Droplet className="w-6 h-6 text-purple-500" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">ยอดขายน้ำมันรวม</p>
              <p className="text-2xl font-black text-gray-900 dark:text-white">{numberFormatter.format(salesData.totalVolume)} ลิตร</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Sales Trend Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-500" />
                ยอดขาย (แนวโน้ม)
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">6 เดือนล่าสุด</p>
            </div>
            <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
              salesTrend.isPositive 
                ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' 
                : 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400'
            }`}>
              {salesTrend.isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {salesTrend.percent.toFixed(1)}%
            </div>
          </div>
          <div className="h-64 relative mb-8">
            <svg className="w-full h-full" viewBox="0 0 600 250" preserveAspectRatio="none">
              {(() => {
                const chartWidth = 600;
                const chartHeight = 250;
                const padding = 40;
                const graphWidth = chartWidth - padding * 2;
                const graphHeight = chartHeight - padding * 2;
                const pointCount = salesData.monthlySales.length;
                const pointSpacing = pointCount > 1 ? graphWidth / (pointCount - 1) : 0;
                
                // คำนวณค่าสูงสุดและต่ำสุดสำหรับ scaling
                const allValues = [
                  ...salesData.monthlySales.map(d => d.value || 0),
                  ...salesData.monthlySales.map(d => d.max || 0),
                  ...salesData.monthlySales.map(d => d.min || 0)
                ].filter(v => v > 0);
                const maxValue = Math.max(...allValues, 1);
                const minValue = Math.min(...allValues.filter(v => v > 0), 0);
                const valueRange = maxValue - minValue || 1;
                
                // สร้าง path สำหรับ min-max area
                const getMinY = (d: typeof salesData.monthlySales[0]) => 
                  padding + graphHeight - ((d.min || 0) - minValue) / valueRange * graphHeight;
                const getMaxY = (d: typeof salesData.monthlySales[0]) => 
                  padding + graphHeight - ((d.max || 0) - minValue) / valueRange * graphHeight;
                
                const minMaxAreaPath = salesData.monthlySales
                  .map((d, i) => {
                    const x = padding + (i * pointSpacing);
                    const maxY = getMaxY(d);
                    return `${i === 0 ? 'M' : 'L'} ${x} ${maxY}`;
                  })
                  .join(' ') +
                  ' ' +
                  salesData.monthlySales
                    .slice()
                    .reverse()
                    .map((d, i) => {
                      const idx = pointCount - 1 - i;
                      const x = padding + (idx * pointSpacing);
                      const minY = getMinY(d);
                      return `L ${x} ${minY}`;
                    })
                    .join(' ') +
                  ' Z';
                
                // สร้าง path สำหรับเส้นค่าเฉลี่ย
                const avgLinePath = salesData.monthlySales
                  .map((d, i) => {
                    const x = padding + (i * pointSpacing);
                    const y = padding + graphHeight - ((d.value || 0) - minValue) / valueRange * graphHeight;
                    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                  })
                  .join(' ');
                
                return (
                  <>
                    <defs>
                      <linearGradient id="salesGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#10b981" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    
                    {/* Min-Max Area Fill */}
                    <motion.path
                      d={minMaxAreaPath}
                      fill="url(#salesGradient)"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.2 }}
                      transition={{ duration: 0.8, delay: 0.5 }}
                    />
                    
                    {/* Average Line */}
                    <motion.path
                      d={avgLinePath}
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 1, delay: 0.7 }}
                    />
                    
                    {/* Data Points */}
                    {salesData.monthlySales.map((d, i) => {
                      const x = padding + (i * pointSpacing);
                      const y = padding + graphHeight - ((d.value || 0) - minValue) / valueRange * graphHeight;
                      const minY = getMinY(d);
                      const maxY = getMaxY(d);
                      
                      return (
                        <g key={i} className="group">
                          {/* Min-Max Lines */}
                          <motion.line
                            x1={x}
                            y1={minY}
                            x2={x}
                            y2={maxY}
                            stroke="#10b981"
                            strokeWidth="2"
                            strokeDasharray="4 4"
                            opacity={0.4}
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 0.5, delay: 0.8 + i * 0.1 }}
                          />
                          
                          {/* Average Point */}
                          <motion.circle
                            cx={x}
                            cy={y}
                            r="5"
                            fill="#10b981"
                            stroke="white"
                            strokeWidth="2"
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.3, delay: 0.9 + i * 0.1 }}
                            className="cursor-pointer group-hover:r-7"
                          />
                          
                          {/* Tooltip */}
                          <g opacity="0" className="group-hover:opacity-100 transition-opacity">
                            <rect
                              x={x - 60}
                              y={y - 70}
                              width="120"
                              height="60"
                              fill="rgba(17, 24, 39, 0.9)"
                              rx="4"
                            />
                            <text
                              x={x}
                              y={y - 50}
                              textAnchor="middle"
                              fill="white"
                              fontSize="10"
                              fontWeight="bold"
                            >
                              {d.month}
                            </text>
                            <text
                              x={x}
                              y={y - 35}
                              textAnchor="middle"
                              fill="#10b981"
                              fontSize="12"
                              fontWeight="bold"
                            >
                              {currencyFormatter.format(d.value)}
                            </text>
                            <text
                              x={x}
                              y={y - 20}
                              textAnchor="middle"
                              fill="#94a3b8"
                              fontSize="9"
                            >
                              ต่ำสุด: {currencyFormatter.format(d.min)} | สูงสุด: {currencyFormatter.format(d.max)}
                            </text>
                          </g>
                        </g>
                      );
                    })}
                    
                    {/* Month Labels */}
                    {salesData.monthlySales.map((d, i) => {
                      const x = padding + (i * pointSpacing);
                      const monthLabel = d.month.includes(' ') ? d.month.split(' ')[0] : d.month;
                      return (
                        <text
                          key={`label-${i}`}
                          x={x}
                          y={chartHeight - 10}
                          textAnchor="middle"
                          fill="#9ca3af"
                          fontSize="10"
                          fontWeight="bold"
                          className="fill-gray-400 dark:fill-gray-500"
                        >
                          {monthLabel}
                        </text>
                      );
                    })}
                  </>
                );
              })()}
            </svg>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">ยอดขายรวม</p>
              <p className="text-lg font-black text-gray-900 dark:text-white">{currencyFormatter.format(salesData.totalSales)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">ปริมาณรวม</p>
              <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">{numberFormatter.format(salesData.totalVolume)} ลิตร</p>
            </div>
          </div>
        </motion.div>

        {/* Purchase Orders Trend Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-blue-500" />
                ยอดสั่งซื้อ (แนวโน้ม)
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">6 เดือนล่าสุด</p>
            </div>
            <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
              purchaseTrend.isPositive 
                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' 
                : 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400'
            }`}>
              {purchaseTrend.isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {purchaseTrend.percent.toFixed(1)}%
            </div>
          </div>
          <div className="h-64 relative mb-8">
            <svg className="w-full h-full" viewBox="0 0 600 250" preserveAspectRatio="none">
              {(() => {
                const chartWidth = 600;
                const chartHeight = 250;
                const padding = 40;
                const graphWidth = chartWidth - padding * 2;
                const graphHeight = chartHeight - padding * 2;
                const pointCount = purchaseData.monthlyPurchases.length;
                const pointSpacing = pointCount > 1 ? graphWidth / (pointCount - 1) : 0;
                
                // คำนวณค่าสูงสุดและต่ำสุดสำหรับ scaling
                const allValues = [
                  ...purchaseData.monthlyPurchases.map(d => d.value || 0),
                  ...purchaseData.monthlyPurchases.map(d => d.max || 0),
                  ...purchaseData.monthlyPurchases.map(d => d.min || 0)
                ].filter(v => v > 0);
                const maxValue = Math.max(...allValues, 1);
                const minValue = Math.min(...allValues.filter(v => v > 0), 0);
                const valueRange = maxValue - minValue || 1;
                
                // สร้าง path สำหรับ min-max area
                const getPurchaseMinY = (d: typeof purchaseData.monthlyPurchases[0]) => 
                  padding + graphHeight - ((d.min || 0) - minValue) / valueRange * graphHeight;
                const getPurchaseMaxY = (d: typeof purchaseData.monthlyPurchases[0]) => 
                  padding + graphHeight - ((d.max || 0) - minValue) / valueRange * graphHeight;
                
                const minMaxAreaPath = purchaseData.monthlyPurchases
                  .map((d, i) => {
                    const x = padding + (i * pointSpacing);
                    const maxY = getPurchaseMaxY(d);
                    return `${i === 0 ? 'M' : 'L'} ${x} ${maxY}`;
                  })
                  .join(' ') +
                  ' ' +
                  purchaseData.monthlyPurchases
                    .slice()
                    .reverse()
                    .map((d, i) => {
                      const idx = pointCount - 1 - i;
                      const x = padding + (idx * pointSpacing);
                      const minY = getPurchaseMinY(d);
                      return `L ${x} ${minY}`;
                    })
                    .join(' ') +
                  ' Z';
                
                // สร้าง path สำหรับเส้นค่าเฉลี่ย
                const avgLinePath = purchaseData.monthlyPurchases
                  .map((d, i) => {
                    const x = padding + (i * pointSpacing);
                    const y = padding + graphHeight - ((d.value || 0) - minValue) / valueRange * graphHeight;
                    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                  })
                  .join(' ');
                
                return (
                  <>
                    <defs>
                      <linearGradient id="purchaseGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    
                    {/* Min-Max Area Fill */}
                    <motion.path
                      d={minMaxAreaPath}
                      fill="url(#purchaseGradient)"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.2 }}
                      transition={{ duration: 0.8, delay: 0.5 }}
                    />
                    
                    {/* Average Line */}
                    <motion.path
                      d={avgLinePath}
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 1, delay: 0.7 }}
                    />
                    
                    {/* Data Points */}
                    {purchaseData.monthlyPurchases.map((d, i) => {
                      const x = padding + (i * pointSpacing);
                      const y = padding + graphHeight - ((d.value || 0) - minValue) / valueRange * graphHeight;
                      const minY = getPurchaseMinY(d);
                      const maxY = getPurchaseMaxY(d);
                      
                      return (
                        <g key={i} className="group">
                          {/* Min-Max Lines */}
                          <motion.line
                            x1={x}
                            y1={minY}
                            x2={x}
                            y2={maxY}
                            stroke="#3b82f6"
                            strokeWidth="2"
                            strokeDasharray="4 4"
                            opacity={0.4}
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 0.5, delay: 0.8 + i * 0.1 }}
                          />
                          
                          {/* Average Point */}
                          <motion.circle
                            cx={x}
                            cy={y}
                            r="5"
                            fill="#3b82f6"
                            stroke="white"
                            strokeWidth="2"
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.3, delay: 0.9 + i * 0.1 }}
                            className="cursor-pointer group-hover:r-7"
                          />
                          
                          {/* Tooltip */}
                          <g opacity="0" className="group-hover:opacity-100 transition-opacity">
                            <rect
                              x={x - 60}
                              y={y - 70}
                              width="120"
                              height="60"
                              fill="rgba(17, 24, 39, 0.9)"
                              rx="4"
                            />
                            <text
                              x={x}
                              y={y - 50}
                              textAnchor="middle"
                              fill="white"
                              fontSize="10"
                              fontWeight="bold"
                            >
                              {d.month}
                            </text>
                            <text
                              x={x}
                              y={y - 35}
                              textAnchor="middle"
                              fill="#3b82f6"
                              fontSize="12"
                              fontWeight="bold"
                            >
                              {currencyFormatter.format(d.value)}
                            </text>
                            <text
                              x={x}
                              y={y - 20}
                              textAnchor="middle"
                              fill="#94a3b8"
                              fontSize="9"
                            >
                              ต่ำสุด: {currencyFormatter.format(d.min)} | สูงสุด: {currencyFormatter.format(d.max)}
                            </text>
                          </g>
                        </g>
                      );
                    })}
                    
                    {/* Month Labels */}
                    {purchaseData.monthlyPurchases.map((d, i) => {
                      const x = padding + (i * pointSpacing);
                      const monthLabel = d.month.includes(' ') ? d.month.split(' ')[0] : d.month;
                      return (
                        <text
                          key={`label-${i}`}
                          x={x}
                          y={chartHeight - 10}
                          textAnchor="middle"
                          fill="#9ca3af"
                          fontSize="10"
                          fontWeight="bold"
                          className="fill-gray-400 dark:fill-gray-500"
                        >
                          {monthLabel}
                        </text>
                      );
                    })}
                  </>
                );
              })()}
            </svg>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">ยอดสั่งซื้อรวม</p>
              <p className="text-lg font-black text-gray-900 dark:text-white">{currencyFormatter.format(purchaseData.totalPurchase)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">จำนวนรายการ</p>
              <p className="text-lg font-black text-blue-600 dark:text-blue-400">{purchaseData.totalCount || purchaseData.monthlyPurchases.reduce((sum, d) => sum + d.count, 0)} รายการ</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Module Stats Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm mb-8"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-emerald-500 rounded-xl">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-black text-gray-900 dark:text-white">ยอดของกิจการย่อย</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {moduleStats.map((module, index) => {
            const Icon = module.icon;
            const profitMargin = ((module.profit / module.revenue) * 100) || 0;
            
            return (
              <motion.div
                key={module.name}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                className="p-5 rounded-2xl border border-gray-100 dark:border-gray-700 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900/50 hover:shadow-lg transition-all"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-2 ${module.bgColor} rounded-xl`}>
                    <Icon className={`w-5 h-5 ${module.iconColor}`} />
                  </div>
                  <h3 className="font-black text-gray-900 dark:text-white text-sm">{module.name}</h3>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-emerald-500" />
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">รายรับ</span>
                    </div>
                    <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                      {currencyFormatter.format(module.revenue)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-rose-50 dark:bg-rose-900/20 rounded-xl">
                    <div className="flex items-center gap-2">
                      <TrendingDown className="w-4 h-4 text-rose-500" />
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">รายจ่าย</span>
                    </div>
                    <span className="text-sm font-black text-rose-600 dark:text-rose-400">
                      {currencyFormatter.format(module.expenses)}
                    </span>
                  </div>
                  
                  <div className={`flex items-center justify-between p-3 rounded-xl ${
                    module.profit >= 0 
                      ? 'bg-blue-50 dark:bg-blue-900/20' 
                      : 'bg-red-50 dark:bg-red-900/20'
                  }`}>
                    <div className="flex items-center gap-2">
                      <DollarSign className={`w-4 h-4 ${module.profit >= 0 ? 'text-blue-500' : 'text-red-500'}`} />
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">กำไร/ขาดทุน</span>
                    </div>
                    <div className="text-right">
                      <span className={`text-sm font-black ${
                        module.profit >= 0 
                          ? 'text-blue-600 dark:text-blue-400' 
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {currencyFormatter.format(module.profit)}
                      </span>
                      <p className="text-[10px] font-bold text-gray-400 mt-0.5">
                        {profitMargin >= 0 ? '+' : ''}{profitMargin.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-2xl">
              <Wallet className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">อัตรากำไรสุทธิ</p>
              <p className="text-2xl font-black text-gray-900 dark:text-white">
                {((totalProfit / totalRevenue) * 100 || 0).toFixed(2)}%
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl">
              <Package className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">รายการสั่งซื้อทั้งหมด</p>
              <p className="text-2xl font-black text-gray-900 dark:text-white">
                {safePurchaseOrders.filter(o => o && o.status !== "ยกเลิก").length} รายการ
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-2xl">
              <Activity className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">รายการขายทั้งหมด</p>
              <p className="text-2xl font-black text-gray-900 dark:text-white">
                {safeAllInternalPumpSales.filter(s => s && s.status === "ปกติ").length} รายการ
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
