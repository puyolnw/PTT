import { useState, useMemo } from "react";
import { Plus, Search, Edit2, Trash2, Building2 } from "lucide-react";
import Pagination from "@/components/Pagination";

interface Department {
    id: string;
    name: string;
    code: string;
    branchId: string;
    branchName: string;
    manager: string;
    employeeCount: number;
    description: string;
}

const MOCK_DEPARTMENTS: Department[] = Array.from({ length: 35 }, (_, i) => ({
    id: String(i + 1),
    name: ["ฝ่าย IT", "ฝ่ายขาย", "ฝ่ายบัญชี", "ฝ่ายปฏิบัติการ", "ฝ่ายการตลาด", "ฝ่าย HR"][i % 6],
    code: `DEPT${String(i + 1).padStart(3, "0")}`,
    branchId: String((i % 5) + 1),
    branchName: i % 5 === 0 ? "สำนักงานใหญ่" : `สาขา ${(i % 5)}`,
    manager: `หัวหน้าแผนก ${i + 1}`,
    employeeCount: Math.floor(Math.random() * 30) + 5,
    description: `รับผิดชอบงาน${["เทคโนโลยี", "ขายและบริการ", "บัญชีการเงิน", "ปฏิบัติการ", "การตลาด", "ทรัพยากรบุคคล"][i % 6]}`,
}));

export default function Departments() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedBranch, setSelectedBranch] = useState<string>("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const branches = [
        { id: "all", name: "ทุกสาขา" },
        { id: "1", name: "สำนักงานใหญ่" },
        { id: "2", name: "สาขา 1" },
        { id: "3", name: "สาขา 2" },
        { id: "4", name: "สาขา 3" },
        { id: "5", name: "สาขา 4" },
    ];

    const filteredDepartments = useMemo(() => {
        return MOCK_DEPARTMENTS.filter((dept) => {
            const matchesSearch =
                dept.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                dept.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                dept.branchName.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesBranch =
                selectedBranch === "all" || dept.branchId === selectedBranch;

            return matchesSearch && matchesBranch;
        });
    }, [searchQuery, selectedBranch]);

    const paginatedDepartments = useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize;
        return filteredDepartments.slice(startIndex, startIndex + pageSize);
    }, [filteredDepartments, currentPage, pageSize]);

    const totalPages = Math.ceil(filteredDepartments.length / pageSize);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-app">แผนก</h1>
                    <p className="text-sm text-muted mt-1">
                        จัดการข้อมูลแผนกและความเชื่อมโยงกับสาขา
                    </p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:brightness-110 transition-all shadow-md hover:shadow-lg active:scale-95">
                    <Plus className="w-4 h-4" />
                    <span>เพิ่มแผนก</span>
                </button>
            </div>

            <div className="panel rounded-xl shadow-app overflow-hidden">
                <div className="p-6 pb-4">
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                            <input
                                type="text"
                                placeholder="ค้นหาแผนก..."
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full pl-10 pr-4 py-2 bg-soft border-app rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-opacity-50 text-app"
                            />
                        </div>
                        <select
                            value={selectedBranch}
                            onChange={(e) => {
                                setSelectedBranch(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="px-4 py-2 bg-soft border-app rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-opacity-50 text-app"
                        >
                            {branches.map((branch) => (
                                <option key={branch.id} value={branch.id}>
                                    {branch.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-y border-app bg-soft">
                                <th className="text-center py-3 px-4 text-sm font-semibold text-muted">
                                    รหัสแผนก
                                </th>
                                <th className="text-center py-3 px-4 text-sm font-semibold text-muted">
                                    ชื่อแผนก
                                </th>
                                <th className="text-center py-3 px-4 text-sm font-semibold text-muted">
                                    สาขา
                                </th>
                                <th className="text-center py-3 px-4 text-sm font-semibold text-muted">
                                    หัวหน้าแผนก
                                </th>
                                <th className="text-center py-3 px-4 text-sm font-semibold text-muted">
                                    พนักงาน
                                </th>
                                <th className="text-center py-3 px-4 text-sm font-semibold text-muted">
                                    รายละเอียด
                                </th>
                                <th className="text-center py-3 px-4 text-sm font-semibold text-muted">
                                    จัดการ
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedDepartments.map((dept) => (
                                <tr
                                    key={dept.id}
                                    className="border-b border-app last:border-0 hover:bg-soft transition-colors"
                                >
                                    <td className="py-3 px-4 text-center text-sm font-medium text-app">
                                        {dept.code}
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="flex items-center justify-center gap-2">
                                            <Building2 className="w-4 h-4 text-[var(--primary)]" />
                                            <span className="text-sm font-medium text-app">
                                                {dept.name}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-500 bg-opacity-15 text-purple-700 dark:text-purple-400">
                                            {dept.branchName}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-center text-sm text-app">
                                        {dept.manager}
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[var(--accent)] bg-opacity-15 text-[var(--accent)]">
                                            {dept.employeeCount} คน
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-center text-sm text-muted max-w-xs truncate">
                                        {dept.description}
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

                    {paginatedDepartments.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-muted">ไม่พบข้อมูลแผนก</p>
                        </div>
                    )}
                </div>

                {filteredDepartments.length > 0 && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        pageSize={pageSize}
                        totalItems={filteredDepartments.length}
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
