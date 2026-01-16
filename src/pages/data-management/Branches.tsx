import { useState, useMemo } from "react";
import { Plus, Search, Edit2, Trash2, MapPin } from "lucide-react";
import Pagination from "@/components/Pagination";

interface Branch {
    id: string;
    name: string;
    code: string;
    address: string;
    phone: string;
    manager: string;
    employeeCount: number;
}

const MOCK_BRANCHES: Branch[] = Array.from({ length: 28 }, (_, i) => ({
    id: String(i + 1),
    name: i === 0 ? "สำนักงานใหญ่" : `สาขา ${i}`,
    code: i === 0 ? "HQ001" : `BR${String(i).padStart(3, "0")}`,
    address: `${100 + i} ถนนสุขุมวิท กรุงเทพฯ`,
    phone: `02-${String(100 + i).padStart(3, "0")}-${String(1000 + i).padStart(4, "0")}`,
    manager: `ผู้จัดการ ${i + 1}`,
    employeeCount: Math.floor(Math.random() * 100) + 20,
}));

export default function Branches() {
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const filteredBranches = useMemo(() => {
        return MOCK_BRANCHES.filter(
            (branch) =>
                branch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                branch.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                branch.address.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery]);

    const paginatedBranches = useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize;
        return filteredBranches.slice(startIndex, startIndex + pageSize);
    }, [filteredBranches, currentPage, pageSize]);

    const totalPages = Math.ceil(filteredBranches.length / pageSize);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-app">สาขา</h1>
                    <p className="text-sm text-muted mt-1">
                        จัดการข้อมูลสาขาทั้งหมดในระบบ
                    </p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:brightness-110 transition-all shadow-md hover:shadow-lg active:scale-95">
                    <Plus className="w-4 h-4" />
                    <span>เพิ่มสาขา</span>
                </button>
            </div>

            <div className="panel rounded-xl shadow-app overflow-hidden">
                <div className="p-6 pb-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                        <input
                            type="text"
                            placeholder="ค้นหาสาขา..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full pl-10 pr-4 py-2 bg-soft border-app rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-opacity-50 text-app"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-y border-app bg-soft">
                                <th className="text-center py-3 px-4 text-sm font-semibold text-muted">
                                    รหัสสาขา
                                </th>
                                <th className="text-center py-3 px-4 text-sm font-semibold text-muted">
                                    ชื่อสาขา
                                </th>
                                <th className="text-center py-3 px-4 text-sm font-semibold text-muted">
                                    ที่อยู่
                                </th>
                                <th className="text-center py-3 px-4 text-sm font-semibold text-muted">
                                    เบอร์โทร
                                </th>
                                <th className="text-center py-3 px-4 text-sm font-semibold text-muted">
                                    ผู้จัดการ
                                </th>
                                <th className="text-center py-3 px-4 text-sm font-semibold text-muted">
                                    พนักงาน
                                </th>
                                <th className="text-center py-3 px-4 text-sm font-semibold text-muted">
                                    จัดการ
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedBranches.map((branch) => (
                                <tr
                                    key={branch.id}
                                    className="border-b border-app last:border-0 hover:bg-soft transition-colors"
                                >
                                    <td className="py-3 px-4 text-center text-sm font-medium text-app">
                                        {branch.code}
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="flex items-center justify-center gap-2">
                                            <MapPin className="w-4 h-4 text-[var(--primary)]" />
                                            <span className="text-sm font-medium text-app">
                                                {branch.name}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 text-center text-sm text-muted max-w-xs truncate">
                                        {branch.address}
                                    </td>
                                    <td className="py-3 px-4 text-center text-sm text-app">
                                        {branch.phone}
                                    </td>
                                    <td className="py-3 px-4 text-center text-sm text-app">
                                        {branch.manager}
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[var(--accent)] bg-opacity-15 text-[var(--accent)]">
                                            {branch.employeeCount} คน
                                        </span>
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="flex items-center justify-center gap-2">
                                            <button className="p-2 hover:bg-soft rounded-lg transition-all group active:scale-95" title="แก้ไข">
                                                <Edit2 className="w-4 h-4 text-muted group-hover:text-[var(--primary)] transition-colors" />
                                            </button>
                                            <button className="p-2 hover:bg-soft rounded-lg transition-all group active:scale-95" title="ลบ">
                                                <Trash2 className="w-4 h-4 text-muted group-hover:text-[var(--danger)] transition-colors" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {paginatedBranches.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-muted">ไม่พบข้อมูลสาขา</p>
                        </div>
                    )}
                </div>

                {filteredBranches.length > 0 && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        pageSize={pageSize}
                        totalItems={filteredBranches.length}
                        onPageChange={setCurrentPage}
                        onPageSizeChange={(size) => {
                            setPageSize(size);
                            setCurrentPage(1);
                        }}
                    />
                )}
            </div>
        </div>
    );
}
