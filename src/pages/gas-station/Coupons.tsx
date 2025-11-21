import { useState, useMemo } from "react";
import {
  Ticket,
  Fuel,
  Droplet,
  Users,
  UserPlus,
  AlertCircle,
  RefreshCw,
  History,
} from "lucide-react";
import ModalForm from "@/components/ModalForm";
import FilterBar from "@/components/FilterBar";

const numberFormatter = new Intl.NumberFormat("th-TH");

const branches = ["สำนักงานใหญ่", "สาขา A", "สาขา B", "สาขา C", "สาขา D"];

// Interface for Member
interface Member {
  id: string;
  memberCode: string;
  name: string;
  phone: string;
  email: string;
  registeredDate: string;
  status: "active" | "inactive";
}

// Interface for Member Coupon
interface MemberCoupon {
  id: string;
  memberId: string;
  memberName: string;
  couponCode: string;
  issueDate: string;
  expiryDate: string;
  fuelType?: string; // ไม่บังคับ - คูปองใช้ได้กับทุกน้ำมัน
  quantity: number;
  amount: number; // ยอดรวมทั้งหมด
  usedAmount: number; // ยอดที่ใช้ไปแล้ว
  branch: string;
  status: "active" | "used" | "expired";
  usedDate: string | null;
  renewals: number; // จำนวนครั้งที่ต่ออายุ
}

// Interface for Coupon Usage History
interface CouponUsageHistory {
  id: string;
  couponId: string;
  couponCode: string;
  memberId: string;
  memberName: string;
  usedDate: string;
  usedAmount: number;
  fuelType: string; // ชนิดน้ำมันที่ใช้จริง
  quantity: number; // ปริมาณที่เติม (ลิตร)
  branch: string;
  notes?: string;
}

// Mock data - Members
const initialMembers: Member[] = [
  {
    id: "M001",
    memberCode: "MEM001",
    name: "สมชาย ใจดี",
    phone: "081-234-5678",
    email: "somchai@example.com",
    registeredDate: "2024-01-15",
    status: "active",
  },
  {
    id: "M002",
    memberCode: "MEM002",
    name: "สมหญิง รักน้ำมัน",
    phone: "082-345-6789",
    email: "somying@example.com",
    registeredDate: "2024-02-20",
    status: "active",
  },
  {
    id: "M003",
    memberCode: "MEM003",
    name: "วิชัย ขับรถ",
    phone: "083-456-7890",
    email: "wichai@example.com",
    registeredDate: "2024-03-10",
    status: "active",
  },
];

// Mock data - Member Coupons
const initialMemberCoupons: MemberCoupon[] = [
  {
    id: "MC001",
    memberId: "M001",
    memberName: "สมชาย ใจดี",
    couponCode: "COUPON-MEM001-001",
    issueDate: "2024-12-01",
    expiryDate: "2024-12-31",
    fuelType: "Gasohol 95",
    quantity: 50,
    amount: 2000,
    usedAmount: 500, // ใช้ไปแล้ว 500 บาท
    branch: "สำนักงานใหญ่",
    status: "active",
    usedDate: null,
    renewals: 0,
  },
  {
    id: "MC002",
    memberId: "M001",
    memberName: "สมชาย ใจดี",
    couponCode: "COUPON-MEM001-002",
    issueDate: "2024-11-15",
    expiryDate: "2024-12-20", // ใกล้หมดอายุ
    fuelType: "Diesel",
    quantity: 100,
    amount: 3500,
    usedAmount: 0,
    branch: "สำนักงานใหญ่",
    status: "active",
    usedDate: null,
    renewals: 1,
  },
  {
    id: "MC003",
    memberId: "M002",
    memberName: "สมหญิง รักน้ำมัน",
    couponCode: "COUPON-MEM002-001",
    issueDate: "2024-12-10",
    expiryDate: "2025-01-10",
    fuelType: "Gasohol 95",
    quantity: 30,
    amount: 1200,
    usedAmount: 800, // ใช้ไปแล้ว 800 บาท
    branch: "สาขา A",
    status: "active",
    usedDate: null,
    renewals: 0,
  },
  {
    id: "MC004",
    memberId: "M002",
    memberName: "สมหญิง รักน้ำมัน",
    couponCode: "COUPON-MEM002-002",
    issueDate: "2024-10-01",
    expiryDate: "2024-12-18", // ใกล้หมดอายุ
    fuelType: "Premium Gasohol 95",
    quantity: 25,
    amount: 1000,
    usedAmount: 0,
    branch: "สาขา A",
    status: "active",
    usedDate: null,
    renewals: 2,
  },
  {
    id: "MC005",
    memberId: "M003",
    memberName: "วิชัย ขับรถ",
    couponCode: "COUPON-MEM003-001",
    issueDate: "2024-11-20",
    expiryDate: "2024-12-19", // ใกล้หมดอายุ
    fuelType: "Diesel",
    quantity: 80,
    amount: 2800,
    usedAmount: 0,
    branch: "สาขา B",
    status: "active",
    usedDate: null,
    renewals: 0,
  },
  {
    id: "MC006",
    memberId: "M001",
    memberName: "สมชาย ใจดี",
    couponCode: "COUPON-MEM001-003",
    issueDate: "2024-10-15",
    expiryDate: "2024-11-15",
    fuelType: "E20",
    quantity: 40,
    amount: 1520,
    usedAmount: 1520, // ใช้หมดแล้ว
    branch: "สำนักงานใหญ่",
    status: "used",
    usedDate: "2024-11-10",
    renewals: 0,
  },
];

export default function Coupons() {
  const [activeTab, setActiveTab] = useState<"members" | "expiring" | "history">("members");
  const [members, setMembers] = useState(initialMembers);
  const [memberCoupons, setMemberCoupons] = useState(initialMemberCoupons);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [isAddMemberCouponModalOpen, setIsAddMemberCouponModalOpen] = useState(false);
  const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);
  const [isUseCouponModalOpen, setIsUseCouponModalOpen] = useState(false);
  const [selectedMemberCoupon, setSelectedMemberCoupon] = useState<MemberCoupon | null>(null);
  const [selectedMember, setSelectedMember] = useState<string>("");
  const [useCouponAmount, setUseCouponAmount] = useState<string>("");
  const [useCouponSelectedMemberId, setUseCouponSelectedMemberId] = useState<string>("");
  const [useCouponSelectedCouponId, setUseCouponSelectedCouponId] = useState<string>("");
  const [usageHistory, setUsageHistory] = useState<CouponUsageHistory[]>([]);
  const [useCouponFuelType, setUseCouponFuelType] = useState<string>("");
  const [useCouponQuantity, setUseCouponQuantity] = useState<string>("");

  const [memberFormData, setMemberFormData] = useState({
    memberCode: "",
    name: "",
    phone: "",
    email: "",
    registeredDate: new Date().toISOString().split("T")[0],
  });

  const [memberCouponFormData, setMemberCouponFormData] = useState({
    memberId: "",
    couponCode: "",
    issueDate: new Date().toISOString().split("T")[0],
    expiryDate: "",
    fuelType: "Gasohol 95",
    quantity: "",
    amount: "",
    branch: "สำนักงานใหญ่",
  });

  // Calculate expiring coupons (within 7 days)
  const expiringCoupons = useMemo(() => {
    const today = new Date();
    const sevenDaysLater = new Date();
    sevenDaysLater.setDate(today.getDate() + 7);
    
    return memberCoupons.filter((coupon) => {
      if (coupon.status !== "active") return false;
      const expiryDate = new Date(coupon.expiryDate);
      return expiryDate >= today && expiryDate <= sevenDaysLater;
    }).sort((a, b) => {
      return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
    });
  }, [memberCoupons]);

  // Calculate days until expiry
  const getDaysUntilExpiry = (expiryDate: string): number => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(expiryDate);
    expiry.setHours(0, 0, 0, 0);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };


  const filteredMembers = members.filter((member) => {
    const matchesSearch = searchQuery === "" ||
      member.memberCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.phone.includes(searchQuery);
    return matchesSearch;
  });


  const totalMembers = members.length;
  const activeMemberCoupons = memberCoupons.filter((c) => c.status === "active").length;
  const usedMemberCoupons = memberCoupons.filter((c) => c.status === "used").length;


  const handleAddMember = () => {
    const newMember: Member = {
      id: `M${String(members.length + 1).padStart(3, "0")}`,
      memberCode: memberFormData.memberCode || `MEM${String(members.length + 1).padStart(3, "0")}`,
      name: memberFormData.name,
      phone: memberFormData.phone,
      email: memberFormData.email,
      registeredDate: memberFormData.registeredDate,
      status: "active",
    };
    setMembers([newMember, ...members]);
    setIsAddMemberModalOpen(false);
    resetMemberForm();
  };

  const handleAddMemberCoupon = () => {
    const member = members.find((m) => m.id === memberCouponFormData.memberId);
    if (!member) return;

    const newMemberCoupon: MemberCoupon = {
      id: `MC${String(memberCoupons.length + 1).padStart(3, "0")}`,
      memberId: memberCouponFormData.memberId,
      memberName: member.name,
      couponCode: memberCouponFormData.couponCode || `COUPON-${member.memberCode}-${String(memberCoupons.filter(c => c.memberId === memberCouponFormData.memberId).length + 1).padStart(3, "0")}`,
      issueDate: memberCouponFormData.issueDate,
      expiryDate: memberCouponFormData.expiryDate,
      fuelType: memberCouponFormData.fuelType || undefined,
      quantity: Number(memberCouponFormData.quantity),
      amount: Number(memberCouponFormData.amount),
      branch: memberCouponFormData.branch,
      status: "active",
      usedAmount: 0,
      usedDate: null,
      renewals: 0,
    };
    setMemberCoupons([newMemberCoupon, ...memberCoupons]);
    setIsAddMemberCouponModalOpen(false);
    resetMemberCouponForm();
  };

  const handleRenewCoupon = (coupon: MemberCoupon) => {
    const newExpiryDate = new Date(coupon.expiryDate);
    newExpiryDate.setMonth(newExpiryDate.getMonth() + 1); // ต่ออายุ 1 เดือน

    setMemberCoupons(memberCoupons.map((c) => {
      if (c.id === coupon.id) {
        return {
          ...c,
          expiryDate: newExpiryDate.toISOString().split("T")[0],
          renewals: c.renewals + 1,
        };
      }
      return c;
    }));
    setIsRenewModalOpen(false);
    setSelectedMemberCoupon(null);
    alert(`ต่ออายุคูปอง ${coupon.couponCode} เรียบร้อย\nวันหมดอายุใหม่: ${newExpiryDate.toLocaleDateString("th-TH")}`);
  };

  const handleUseCoupon = (coupon?: MemberCoupon) => {
    const couponToUse = coupon || memberCoupons.find(c => c.id === useCouponSelectedCouponId);
    if (!couponToUse) {
      alert("กรุณาเลือกคูปอง");
      return;
    }

    const useAmount = Number(useCouponAmount);
    const remainingAmount = couponToUse.amount - couponToUse.usedAmount;
    
    if (useAmount <= 0) {
      alert("กรุณากรอกจำนวนเงินที่ต้องการใช้");
      return;
    }
    
    if (useAmount > remainingAmount) {
      alert(`ยอดคงเหลือไม่พอ\nยอดคงเหลือ: ฿${numberFormatter.format(remainingAmount)}`);
      return;
    }

    if (!useCouponFuelType) {
      alert("กรุณาเลือกชนิดน้ำมัน");
      return;
    }

    const newUsedAmount = couponToUse.usedAmount + useAmount;
    const isFullyUsed = newUsedAmount >= couponToUse.amount;

    // อัปเดตคูปอง
    setMemberCoupons(memberCoupons.map((c) => {
      if (c.id === couponToUse.id) {
        return {
          ...c,
          usedAmount: newUsedAmount,
          status: isFullyUsed ? ("used" as const) : ("active" as const),
          usedDate: isFullyUsed ? new Date().toISOString().split("T")[0] : c.usedDate,
        };
      }
      return c;
    }));

    // บันทึกประวัติการใช้คูปอง
    const newHistory: CouponUsageHistory = {
      id: `H${String(usageHistory.length + 1).padStart(3, "0")}`,
      couponId: couponToUse.id,
      couponCode: couponToUse.couponCode,
      memberId: couponToUse.memberId,
      memberName: couponToUse.memberName,
      usedDate: new Date().toISOString().split("T")[0],
      usedAmount: useAmount,
      fuelType: useCouponFuelType,
      quantity: Number(useCouponQuantity) || 0,
      branch: couponToUse.branch,
    };
    setUsageHistory([newHistory, ...usageHistory]);
    
    setIsUseCouponModalOpen(false);
    setUseCouponAmount("");
    setUseCouponFuelType("");
    setUseCouponQuantity("");
    setUseCouponSelectedMemberId("");
    setUseCouponSelectedCouponId("");
    setSelectedMemberCoupon(null);
    alert(`บันทึกการใช้คูปองเรียบร้อย\nใช้ไป: ฿${numberFormatter.format(useAmount)}\nยอดคงเหลือ: ฿${numberFormatter.format(couponToUse.amount - newUsedAmount)}`);
  };

  const resetMemberForm = () => {
    setMemberFormData({
      memberCode: "",
      name: "",
      phone: "",
      email: "",
      registeredDate: new Date().toISOString().split("T")[0],
    });
  };

  const resetMemberCouponForm = () => {
    const defaultExpiryDate = new Date();
    defaultExpiryDate.setMonth(defaultExpiryDate.getMonth() + 1);
    
    setMemberCouponFormData({
      memberId: "",
      couponCode: "",
      issueDate: new Date().toISOString().split("T")[0],
      expiryDate: defaultExpiryDate.toISOString().split("T")[0],
      fuelType: "",
      quantity: "",
      amount: "",
      branch: "สำนักงานใหญ่",
    });
  };


  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6">
      {/* Header Section */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Droplet className="h-8 w-8 text-blue-600" />
          ระบบคูปองสถานี - M1
        </h2>
        <p className="text-slate-500 text-sm mt-1">
          จัดการสมาชิก คูปองสมาชิก และคูปองสถานี (PaymentType = Coupon) - คูปองใน M1 เป็นช่องทางการชำระเงินเท่านั้น ไม่มีการหักส่วนลด
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
          <div className="flex items-center gap-2 text-blue-700 mb-2">
            <Users className="h-5 w-5" />
            <span className="font-bold">สมาชิกทั้งหมด</span>
          </div>
          <div className="text-2xl font-bold text-blue-900">{totalMembers}</div>
          <div className="text-xs text-blue-600 mt-1">คน</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="text-xs text-gray-500 mb-1">คูปองสมาชิก (ใช้งานได้)</div>
          <div className="text-xl font-bold text-slate-800">{activeMemberCoupons}</div>
          <div className="w-full bg-gray-100 h-1.5 rounded-full mt-2">
            <div
              className="bg-green-500 h-1.5 rounded-full"
              style={{ width: `${(activeMemberCoupons / memberCoupons.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="text-xs text-gray-500 mb-1">คูปองใกล้หมดอายุ</div>
          <div className="text-xl font-bold text-slate-800">{expiringCoupons.length}</div>
          <div className="w-full bg-gray-100 h-1.5 rounded-full mt-2">
            <div
              className="bg-orange-500 h-1.5 rounded-full"
              style={{ width: `${(expiringCoupons.length / activeMemberCoupons) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="text-xs text-gray-500 mb-1">คูปองที่ใช้แล้ว</div>
          <div className="text-xl font-bold text-slate-800">{usedMemberCoupons}</div>
          <div className="w-full bg-gray-100 h-1.5 rounded-full mt-2">
            <div
              className="bg-purple-500 h-1.5 rounded-full"
              style={{ width: `${(usedMemberCoupons / memberCoupons.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-200 bg-white rounded-t-lg px-4 pt-2">
        <button
          onClick={() => setActiveTab("members")}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "members"
              ? "border-blue-600 text-blue-600 bg-blue-50/50"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <Users className="h-4 w-4" />
          สมาชิก
        </button>
        <button
          onClick={() => setActiveTab("expiring")}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "expiring"
              ? "border-blue-600 text-blue-600 bg-blue-50/50"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <AlertCircle className="h-4 w-4" />
          คูปองใกล้หมดอายุ
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "history"
              ? "border-blue-600 text-blue-600 bg-blue-50/50"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <History className="h-4 w-4" />
          ประวัติการใช้คูปอง
        </button>
      </div>

      {/* Content Section */}
      <div className="bg-white rounded-b-xl shadow-sm border border-t-0 border-gray-200 p-6">
        {/* Tab: Members */}
        {activeTab === "members" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-slate-700 text-lg">รายชื่อสมาชิก</h3>
                <p className="text-sm text-gray-500 mt-1">จัดการข้อมูลสมาชิกทั้งหมด</p>
              </div>
              <button
                onClick={() => setIsAddMemberModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm"
              >
                <UserPlus className="h-4 w-4" />
                <span>เพิ่มสมาชิก</span>
              </button>
            </div>

            <FilterBar
              onSearch={setSearchQuery}
              filters={[]}
            />

            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                  <tr>
                    <th className="p-3">รหัสสมาชิก</th>
                    <th className="p-3">ชื่อ-นามสกุล</th>
                    <th className="p-3">เบอร์โทร</th>
                    <th className="p-3">อีเมล</th>
                    <th className="p-3">วันที่สมัคร</th>
                    <th className="p-3 text-center">สถานะ</th>
                    <th className="p-3 text-center">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {filteredMembers.map((member) => {
                    const memberCouponCount = memberCoupons.filter(c => c.memberId === member.id).length;
                    return (
                      <tr key={member.id} className="hover:bg-gray-50">
                        <td className="p-3 font-medium text-slate-700">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-blue-600" />
                            {member.memberCode}
                          </div>
                        </td>
                        <td className="p-3 text-gray-700 font-semibold">{member.name}</td>
                        <td className="p-3 text-gray-600">{member.phone}</td>
                        <td className="p-3 text-gray-600">{member.email}</td>
                        <td className="p-3 text-gray-600">
                          {new Date(member.registeredDate).toLocaleDateString("th-TH")}
                        </td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            member.status === "active"
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-700"
                          }`}>
                            {member.status === "active" ? "ใช้งาน" : "ไม่ใช้งาน"}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <span className="text-xs text-gray-500">
                              คูปอง: {memberCouponCount}
                            </span>
                            {(() => {
                              const activeCoupons = memberCoupons.filter(c => c.memberId === member.id && c.status === "active" && (c.amount - (c.usedAmount || 0)) > 0);
                              const hasActiveCoupons = activeCoupons.length > 0;
                              return (
                                <>
                                  {hasActiveCoupons && (
                                    <button
                                      onClick={() => {
                                        if (activeCoupons.length === 1) {
                                          setUseCouponSelectedMemberId(member.id);
                                          setUseCouponSelectedCouponId(activeCoupons[0].id);
                                          setUseCouponAmount("");
                                          setSelectedMemberCoupon(activeCoupons[0]);
                                          setIsUseCouponModalOpen(true);
                                        } else {
                                          // ถ้ามีหลายคูปอง ให้เปิด modal และเลือกคูปอง
                                          setUseCouponSelectedMemberId(member.id);
                                          setUseCouponSelectedCouponId(activeCoupons[0].id);
                                          setUseCouponAmount("");
                                          setSelectedMemberCoupon(activeCoupons[0]);
                                          setIsUseCouponModalOpen(true);
                                        }
                                      }}
                                      className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1"
                                      title="ใช้คูปอง"
                                    >
                                      <Ticket className="w-3 h-3" />
                                      <span>ใช้คูปอง</span>
                                    </button>
                                  )}
                                </>
                              );
                            })()}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab: Expiring Coupons */}
        {activeTab === "expiring" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-slate-700 text-lg">คูปองใกล้หมดอายุ</h3>
                <p className="text-sm text-gray-500 mt-1">
                  คูปองที่เหลืออายุไม่เกิน 7 วัน ({expiringCoupons.length} ใบ)
                </p>
              </div>
            </div>

            {expiringCoupons.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>ไม่มีคูปองใกล้หมดอายุ</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {expiringCoupons.map((coupon) => {
                  const daysUntilExpiry = getDaysUntilExpiry(coupon.expiryDate);
                  return (
                    <div
                      key={coupon.id}
                      className={`p-4 rounded-xl border-2 ${
                        daysUntilExpiry <= 3
                          ? "bg-red-50 border-red-200"
                          : daysUntilExpiry <= 5
                          ? "bg-orange-50 border-orange-200"
                          : "bg-yellow-50 border-yellow-200"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Ticket className="w-5 h-5 text-orange-600" />
                            <span className="font-bold text-slate-800">{coupon.couponCode}</span>
                          </div>
                          <p className="text-sm text-gray-600">{coupon.memberName}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          daysUntilExpiry <= 3
                            ? "bg-red-100 text-red-700"
                            : daysUntilExpiry <= 5
                            ? "bg-orange-100 text-orange-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}>
                          เหลือ {daysUntilExpiry} วัน
                        </span>
                      </div>
                      <div className="space-y-2 text-sm">
                        {coupon.fuelType && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">ชนิดน้ำมัน:</span>
                            <span className="font-semibold text-slate-800">{coupon.fuelType}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-gray-500">ปริมาณ:</span>
                          <span className="font-semibold text-slate-800">
                            {numberFormatter.format(coupon.quantity)} ลิตร
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">ยอดขาย:</span>
                          <span className="font-semibold text-slate-800">
                            ฿{numberFormatter.format(coupon.amount)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">ใช้ไปแล้ว:</span>
                          <span className="font-semibold text-gray-600">
                            ฿{numberFormatter.format(coupon.usedAmount || 0)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">ยอดคงเหลือ:</span>
                          <span className="font-semibold text-green-700">
                            ฿{numberFormatter.format(coupon.amount - (coupon.usedAmount || 0))}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">วันหมดอายุ:</span>
                          <span className="font-semibold text-slate-800">
                            {new Date(coupon.expiryDate).toLocaleDateString("th-TH")}
                          </span>
                        </div>
                        {coupon.renewals > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">ต่ออายุแล้ว:</span>
                            <span className="font-semibold text-blue-600">{coupon.renewals} ครั้ง</span>
                          </div>
                        )}
                      </div>
                      <div className="mt-4 flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedMemberCoupon(coupon);
                            setIsRenewModalOpen(true);
                          }}
                          className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1"
                        >
                          <RefreshCw className="w-3 h-3" />
                          ต่ออายุ
                        </button>
                        <button
                          onClick={() => {
                            setUseCouponSelectedMemberId(coupon.memberId);
                            setUseCouponSelectedCouponId(coupon.id);
                            setUseCouponAmount("");
                            setSelectedMemberCoupon(coupon);
                            setIsUseCouponModalOpen(true);
                          }}
                          className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1"
                        >
                          <Ticket className="w-3 h-3" />
                          ใช้คูปอง
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab: Usage History */}
        {activeTab === "history" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-slate-700 text-lg">ประวัติการใช้คูปอง</h3>
                <p className="text-sm text-gray-500 mt-1">
                  รายการประวัติการใช้คูปองสมาชิกทั้งหมด
                </p>
              </div>
            </div>

            <FilterBar
              onSearch={setSearchQuery}
              filters={[
                {
                  label: "สมาชิก",
                  value: selectedMember,
                  options: [
                    { value: "", label: "ทั้งหมด" },
                    ...members.map((m) => ({ value: m.id, label: m.name }))
                  ],
                  onChange: setSelectedMember,
                },
              ]}
            />

            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                  <tr>
                    <th className="p-3">วันที่ใช้</th>
                    <th className="p-3">รหัสคูปอง</th>
                    <th className="p-3">สมาชิก</th>
                    <th className="p-3">ชนิดน้ำมัน</th>
                    <th className="p-3">สาขา</th>
                    <th className="p-3 text-right">ปริมาณ (ลิตร)</th>
                    <th className="p-3 text-right">ยอดที่ใช้ (บาท)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {usageHistory
                    .filter((history) => {
                      const matchesSearch = searchQuery === "" ||
                        history.couponCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        history.memberName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        history.fuelType.toLowerCase().includes(searchQuery.toLowerCase());
                      const matchesMember = !selectedMember || history.memberId === selectedMember;
                      return matchesSearch && matchesMember;
                    })
                    .map((history) => (
                      <tr key={history.id} className="hover:bg-gray-50">
                        <td className="p-3 text-gray-600">
                          {new Date(history.usedDate).toLocaleDateString("th-TH", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </td>
                        <td className="p-3 font-medium text-slate-700">
                          <div className="flex items-center gap-2">
                            <Ticket className="w-4 h-4 text-orange-600" />
                            {history.couponCode}
                          </div>
                        </td>
                        <td className="p-3 text-gray-700">{history.memberName}</td>
                        <td className="p-3 text-gray-600">
                          <div className="flex items-center gap-2">
                            <Fuel className="w-4 h-4 text-blue-600" />
                            {history.fuelType}
                          </div>
                        </td>
                        <td className="p-3 text-gray-600">{history.branch}</td>
                        <td className="p-3 text-right font-mono text-slate-800">
                          {history.quantity > 0 ? numberFormatter.format(history.quantity) : "-"}
                        </td>
                        <td className="p-3 text-right font-bold text-slate-800">
                          ฿{numberFormatter.format(history.usedAmount)}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
              {usageHistory.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <History className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>ยังไม่มีประวัติการใช้คูปอง</p>
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* Add Member Modal */}
      <ModalForm
        isOpen={isAddMemberModalOpen}
        onClose={() => {
          setIsAddMemberModalOpen(false);
          resetMemberForm();
        }}
        title="เพิ่มสมาชิก"
        onSubmit={handleAddMember}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">รหัสสมาชิก</label>
            <input
              type="text"
              value={memberFormData.memberCode}
              onChange={(e) => setMemberFormData({ ...memberFormData, memberCode: e.target.value })}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="เช่น MEM001 (ถ้าไม่กรอกจะสร้างอัตโนมัติ)"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">ชื่อ-นามสกุล *</label>
            <input
              type="text"
              value={memberFormData.name}
              onChange={(e) => setMemberFormData({ ...memberFormData, name: e.target.value })}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">เบอร์โทร *</label>
              <input
                type="tel"
                value={memberFormData.phone}
                onChange={(e) => setMemberFormData({ ...memberFormData, phone: e.target.value })}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">อีเมล</label>
              <input
                type="email"
                value={memberFormData.email}
                onChange={(e) => setMemberFormData({ ...memberFormData, email: e.target.value })}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">วันที่สมัคร</label>
            <input
              type="date"
              value={memberFormData.registeredDate}
              onChange={(e) => setMemberFormData({ ...memberFormData, registeredDate: e.target.value })}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </ModalForm>

      {/* Add Member Coupon Modal */}
      <ModalForm
        isOpen={isAddMemberCouponModalOpen}
        onClose={() => {
          setIsAddMemberCouponModalOpen(false);
          resetMemberCouponForm();
        }}
        title="เพิ่มคูปองให้สมาชิก"
        onSubmit={handleAddMemberCoupon}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">เลือกสมาชิก *</label>
            <select
              value={memberCouponFormData.memberId}
              onChange={(e) => setMemberCouponFormData({ ...memberCouponFormData, memberId: e.target.value })}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">-- เลือกสมาชิก --</option>
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.memberCode} - {member.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">รหัสคูปอง</label>
            <input
              type="text"
              value={memberCouponFormData.couponCode}
              onChange={(e) => setMemberCouponFormData({ ...memberCouponFormData, couponCode: e.target.value })}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="ถ้าไม่กรอกจะสร้างอัตโนมัติ"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">วันที่ออก *</label>
              <input
                type="date"
                value={memberCouponFormData.issueDate}
                onChange={(e) => {
                  const issueDate = e.target.value;
                  const expiryDate = new Date(issueDate);
                  expiryDate.setMonth(expiryDate.getMonth() + 1);
                  setMemberCouponFormData({
                    ...memberCouponFormData,
                    issueDate,
                    expiryDate: expiryDate.toISOString().split("T")[0],
                  });
                }}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">วันหมดอายุ *</label>
              <input
                type="date"
                value={memberCouponFormData.expiryDate}
                onChange={(e) => setMemberCouponFormData({ ...memberCouponFormData, expiryDate: e.target.value })}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">ชนิดน้ำมัน (ไม่บังคับ - คูปองใช้ได้กับทุกน้ำมัน)</label>
            <select
              value={memberCouponFormData.fuelType}
              onChange={(e) => setMemberCouponFormData({ ...memberCouponFormData, fuelType: e.target.value })}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">ใช้ได้ทุกน้ำมัน</option>
              <option value="Premium Diesel">Premium Diesel</option>
              <option value="Premium Gasohol 95">Premium Gasohol 95</option>
              <option value="Diesel">Diesel</option>
              <option value="E85">E85</option>
              <option value="E20">E20</option>
              <option value="Gasohol 91">Gasohol 91</option>
              <option value="Gasohol 95">Gasohol 95</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">ถ้าไม่เลือก คูปองจะใช้ได้กับทุกชนิดน้ำมัน</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">ปริมาณ (ลิตร) *</label>
              <input
                type="number"
                value={memberCouponFormData.quantity}
                onChange={(e) => setMemberCouponFormData({ ...memberCouponFormData, quantity: e.target.value })}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">ยอดขาย (บาท) *</label>
              <input
                type="number"
                value={memberCouponFormData.amount}
                onChange={(e) => setMemberCouponFormData({ ...memberCouponFormData, amount: e.target.value })}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">สาขา</label>
            <select
              value={memberCouponFormData.branch}
              onChange={(e) => setMemberCouponFormData({ ...memberCouponFormData, branch: e.target.value })}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {branches.map((branch) => (
                <option key={branch} value={branch}>
                  {branch}
                </option>
              ))}
            </select>
          </div>
        </div>
      </ModalForm>

      {/* Renew Coupon Modal */}
      {selectedMemberCoupon && (
        <ModalForm
          isOpen={isRenewModalOpen}
          onClose={() => {
            setIsRenewModalOpen(false);
            setSelectedMemberCoupon(null);
          }}
          title="ต่ออายุคูปอง"
          onSubmit={() => handleRenewCoupon(selectedMemberCoupon)}
        >
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800 mb-2">
                <strong>รหัสคูปอง:</strong> {selectedMemberCoupon.couponCode}
              </p>
              <p className="text-sm text-blue-800 mb-2">
                <strong>สมาชิก:</strong> {selectedMemberCoupon.memberName}
              </p>
              <p className="text-sm text-blue-800 mb-2">
                <strong>วันหมดอายุปัจจุบัน:</strong> {new Date(selectedMemberCoupon.expiryDate).toLocaleDateString("th-TH")}
              </p>
              <p className="text-sm text-blue-800">
                <strong>วันหมดอายุใหม่:</strong>{" "}
                {new Date(new Date(selectedMemberCoupon.expiryDate).setMonth(new Date(selectedMemberCoupon.expiryDate).getMonth() + 1)).toLocaleDateString("th-TH")}
                {" "}(ต่ออายุ 1 เดือน)
              </p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-xs text-yellow-700">
                <strong>หมายเหตุ:</strong> การต่ออายุจะเพิ่มอายุคูปองอีก 1 เดือนจากวันหมดอายุปัจจุบัน
              </p>
            </div>
          </div>
        </ModalForm>
      )}

      {/* Use Coupon Modal */}
      <ModalForm
        isOpen={isUseCouponModalOpen}
        onClose={() => {
          setIsUseCouponModalOpen(false);
          setUseCouponAmount("");
          setUseCouponFuelType("");
          setUseCouponQuantity("");
          setUseCouponSelectedMemberId("");
          setUseCouponSelectedCouponId("");
          setSelectedMemberCoupon(null);
        }}
        title="ใช้คูปอง"
        onSubmit={() => handleUseCoupon()}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              เลือกสมาชิก *
            </label>
            <select
              value={useCouponSelectedMemberId}
              onChange={(e) => {
                setUseCouponSelectedMemberId(e.target.value);
                setUseCouponSelectedCouponId("");
                setUseCouponAmount("");
                const member = members.find(m => m.id === e.target.value);
                if (member) {
                  const firstActiveCoupon = memberCoupons.find(
                    c => c.memberId === member.id && 
                    c.status === "active" && 
                    (c.amount - (c.usedAmount || 0)) > 0
                  );
                  if (firstActiveCoupon) {
                    setUseCouponSelectedCouponId(firstActiveCoupon.id);
                    setSelectedMemberCoupon(firstActiveCoupon);
                  }
                }
              }}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">-- เลือกสมาชิก --</option>
              {members
                .filter(m => memberCoupons.some(
                  c => c.memberId === m.id && 
                  c.status === "active" && 
                  (c.amount - (c.usedAmount || 0)) > 0
                ))
                .map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.memberCode} - {member.name}
                  </option>
                ))}
            </select>
          </div>

          {useCouponSelectedMemberId && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                เลือกคูปอง *
              </label>
              <select
                value={useCouponSelectedCouponId}
                onChange={(e) => {
                  setUseCouponSelectedCouponId(e.target.value);
                  setUseCouponAmount("");
                  const coupon = memberCoupons.find(c => c.id === e.target.value);
                  if (coupon) {
                    setSelectedMemberCoupon(coupon);
                  }
                }}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">-- เลือกคูปอง --</option>
                {memberCoupons
                  .filter(c => 
                    c.memberId === useCouponSelectedMemberId && 
                    c.status === "active" && 
                    (c.amount - (c.usedAmount || 0)) > 0
                  )
                  .map((coupon) => {
                    const remaining = coupon.amount - (coupon.usedAmount || 0);
                    return (
                      <option key={coupon.id} value={coupon.id}>
                        {coupon.couponCode} {coupon.fuelType ? `- ${coupon.fuelType}` : "(ใช้ได้ทุกน้ำมัน)"} (คงเหลือ: ฿{numberFormatter.format(remaining)})
                      </option>
                    );
                  })}
              </select>
            </div>
          )}

          {useCouponSelectedCouponId && selectedMemberCoupon && (
            <>
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800 mb-2">
                  <strong>รหัสคูปอง:</strong> {selectedMemberCoupon.couponCode}
                </p>
                <p className="text-sm text-blue-800 mb-2">
                  <strong>สมาชิก:</strong> {selectedMemberCoupon.memberName}
                </p>
                <p className="text-sm text-blue-800 mb-2">
                  <strong>ยอดรวมทั้งหมด:</strong> ฿{numberFormatter.format(selectedMemberCoupon.amount)}
                </p>
                <p className="text-sm text-blue-800 mb-2">
                  <strong>ใช้ไปแล้ว:</strong> ฿{numberFormatter.format(selectedMemberCoupon.usedAmount || 0)}
                </p>
                <p className="text-sm text-green-800 font-bold">
                  <strong>ยอดคงเหลือ:</strong> ฿{numberFormatter.format(selectedMemberCoupon.amount - (selectedMemberCoupon.usedAmount || 0))}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  ชนิดน้ำมันที่ใช้ * (คูปองใช้ได้กับทุกน้ำมัน)
                </label>
                <select
                  value={useCouponFuelType}
                  onChange={(e) => setUseCouponFuelType(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">-- เลือกชนิดน้ำมัน --</option>
                  <option value="Premium Diesel">Premium Diesel</option>
                  <option value="Premium Gasohol 95">Premium Gasohol 95</option>
                  <option value="Diesel">Diesel</option>
                  <option value="E85">E85</option>
                  <option value="E20">E20</option>
                  <option value="Gasohol 91">Gasohol 91</option>
                  <option value="Gasohol 95">Gasohol 95</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    ปริมาณที่เติม (ลิตร)
                  </label>
                  <input
                    type="number"
                    value={useCouponQuantity}
                    onChange={(e) => setUseCouponQuantity(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="เช่น 20"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    จำนวนเงินที่ต้องการใช้ (บาท) *
                  </label>
                  <input
                    type="number"
                    value={useCouponAmount}
                    onChange={(e) => setUseCouponAmount(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={`สูงสุด ${numberFormatter.format(selectedMemberCoupon.amount - (selectedMemberCoupon.usedAmount || 0))} บาท`}
                    min="0"
                    max={selectedMemberCoupon.amount - (selectedMemberCoupon.usedAmount || 0)}
                    required
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500">
                ยอดคงเหลือ: ฿{numberFormatter.format(selectedMemberCoupon.amount - (selectedMemberCoupon.usedAmount || 0))}
              </p>
            </>
          )}

          <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-xs text-yellow-700">
              <strong>หมายเหตุ:</strong> สามารถใช้คูปองบางส่วนได้ หากใช้หมดแล้วสถานะจะเปลี่ยนเป็น "ใช้แล้ว"
            </p>
          </div>
        </div>
      </ModalForm>

    </div>
  );
}
