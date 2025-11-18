import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { fundApprovals } from "@/data/mockData";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import FilterBar from "@/components/FilterBar";

export default function Approvals() {
  const [filteredApprovals, setFilteredApprovals] = useState(fundApprovals);
  const [searchQuery, setSearchQuery] = useState("");
  const [deptFilter, setDeptFilter] = useState("");

  // Get unique departments
  const getUniqueDepartments = (): string[] => {
    const depts = new Set<string>();
    fundApprovals.forEach(approval => {
      if (approval.dept) depts.add(approval.dept);
    });
    return Array.from(depts).sort();
  };

  // Handle filtering
  const handleFilter = () => {
    let filtered = fundApprovals;

    if (searchQuery) {
      filtered = filtered.filter(
        (approval) =>
          approval.requestBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
          approval.purpose.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (deptFilter) {
      filtered = filtered.filter((approval) => approval.dept === deptFilter);
    }

    setFilteredApprovals(filtered);
  };

  useEffect(() => {
    handleFilter();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, deptFilter]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-ptt-cyan font-display">อนุมัติคำขอใช้เงิน</h2>
        <p className="text-muted font-light">พิจารณาและอนุมัติคำขอเบิกจ่ายเงินกองทุน</p>
      </div>

      {/* Filter Bar */}
      <FilterBar
        placeholder="ค้นหาชื่อผู้ขอหรือวัตถุประสงค์..."
        onSearch={(query) => {
          setSearchQuery(query);
          handleFilter();
        }}
        filters={[
          {
            label: "ทุกแผนก",
            value: deptFilter,
            options: [
              { label: "ทุกแผนก", value: "" },
              ...getUniqueDepartments().map((dept) => ({
                label: dept,
                value: dept
              }))
            ],
            onChange: (value) => {
              setDeptFilter(value);
              handleFilter();
            },
          },
        ]}
      />

      {/* Approval Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredApprovals.map((approval) => (
          <div 
            key={approval.id}
            className="panel/40 border border-app rounded-2xl p-6 hover:border-ptt-blue/30 transition-colors"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-ptt-blue/20 to-ptt-cyan/20 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-ptt-cyan" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-app">{approval.requestBy}</h3>
                  <p className="text-sm text-muted">{approval.dept}</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-lg text-xs font-semibold">
                รอดำเนินการ
              </span>
            </div>

            {/* Details */}
            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted">จำนวนเงิน:</span>
                <span className="text-xl font-bold text-ptt-cyan">
                  {approval.amount.toLocaleString()} ฿
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted">วันที่ยื่นคำขอ:</span>
                <span className="text-sm text-app">{approval.requestDate}</span>
              </div>
              <div className="pt-2">
                <p className="text-sm text-muted mb-1">วัตถุประสงค์:</p>
                <p className="text-sm text-app">{approval.purpose}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-500 rounded-xl transition-colors">
                <CheckCircle className="w-5 h-5" strokeWidth={1.5} />
                <span className="font-medium">อนุมัติ</span>
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-ptt-red hover:bg-ptt-red/80 rounded-xl transition-colors">
                <XCircle className="w-5 h-5" strokeWidth={1.5} />
                <span className="font-medium">ไม่อนุมัติ</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State (if no pending) */}
      {filteredApprovals.length === 0 && (
        <div className="panel/40 border border-app rounded-2xl p-12 text-center">
          <CheckCircle className="w-16 h-16 text-slate-600 mx-auto mb-4" strokeWidth={1.5} />
          <h3 className="text-lg font-semibold text-muted mb-2">ไม่พบคำขอ</h3>
          <p className="text-sm text-slate-500">ไม่พบคำขอที่ตรงกับเงื่อนไขการค้นหา</p>
        </div>
      )}
    </motion.div>
  );
}
