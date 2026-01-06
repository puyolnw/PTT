import { 
  Navigation,
} from "lucide-react";
import { useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useBranch } from "@/contexts/BranchContext";
import { Navigate } from "react-router-dom";

const TransportTracking = () => {
  const { user } = useAuth();
  const { selectedBranches } = useBranch();

  // Role and Branch Check
  const isAuthorized = useMemo(() => {
    if (user?.role === "admin") return true;
    return selectedBranches.includes("1");
  }, [user, selectedBranches]);

  // Mock data
  const tripsData = [
    {
      id: "TRIP-240107-001",
      driver: "นายสมชาย ใจดี",
      truck: "ทะเบียน 82-9999",
      from: "คลังน้ำมัน ปตท. ชลบุรี",
      to: "ปั๊มไฮโซ",
      status: "in_transit",
      progress: 65,
      startTime: "08:00",
      eta: "10:30",
      cargo: [
        { type: "เบนซิน 95", amount: 10000, color: "bg-red-500" },
        { type: "ดีเซล B7", amount: 20000, color: "bg-blue-600" }
      ],
      location: "ถนนสุขุมวิท กม. 45"
    }
  ];

  if (!isAuthorized) {
    return <Navigate to="/app/delivery" replace />;
  }

  return (
    <div className="p-6 md:p-8 space-y-8 bg-[#F8FAFC] min-h-screen font-sans">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-gray-200">
        <div>
          <h1 className="text-4xl font-black text-gray-900 flex items-center gap-4">
            <Navigation className="w-8 h-8 text-ptt-blue" />
            ติดตามสถานะการขนส่ง
          </h1>
          <p className="text-gray-500 mt-2">ตรวจสอบสถานะการจัดส่งน้ำมันแบบ Real-time (ปั๊มไฮโซ / Admin)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Simplified stats */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
           <p className="text-sm text-gray-500">กำลังจัดส่ง</p>
           <h3 className="text-2xl font-bold">2</h3>
        </div>
      </div>

      <div className="space-y-4">
        {tripsData.map(trip => (
          <div key={trip.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
             <div className="flex justify-between items-center mb-4">
               <h4 className="font-bold">{trip.id} - {trip.truck}</h4>
               <span className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full uppercase font-bold">{trip.status}</span>
             </div>
             <p className="text-sm text-gray-500">คนขับ: {trip.driver}</p>
             <div className="mt-4 bg-gray-100 h-2 rounded-full overflow-hidden">
               <div className="bg-ptt-blue h-full" style={{ width: `${trip.progress}%` }} />
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TransportTracking;
