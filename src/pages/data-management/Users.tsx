import { useState, useMemo } from "react";
import { Plus, Search, Edit2, Trash2, Check, X } from "lucide-react";
import Pagination from "@/components/Pagination";

interface User {
    id: string;
    username: string;
    fullName: string;
    email: string;
    role: string;
    status: "active" | "inactive";
    branch?: string;
    department?: string;
}

const MOCK_USERS: User[] = Array.from({ length: 45 }, (_, i) => ({
    id: String(i + 1),
    username: `user${i + 1}`,
    fullName: `ผู้ใช้ ${i + 1}`,
    email: `user${i + 1}@ptt.com`,
    role: ["admin", "manager", "employee", "hr", "accountant"][i % 5],
    status: i % 7 === 0 ? "inactive" : "active",
    branch: ["สำนักงานใหญ่", "สาขา 1", "สาขา 2"][i % 3],
    department: ["IT", "ฝ่ายขาย", "ฝ่ายบัญชี", "ฝ่ายปฏิบัติการ"][i % 4],
}));

const ROLE_COLORS = {
    admin: { bg: "bg-purple-500 bg-opacity-15", text: "text-purple-700 dark:text-purple-400" },
    manager: { bg: "bg-blue-500 bg-opacity-15", text: "text-blue-700 dark:text-blue-400" },
    employee: { bg: "bg-gray-500 bg-opacity-15", text: "text-gray-700 dark:text-gray-400" },
    hr: { bg: "bg-green-500 bg-opacity-15", text: "text-green-700 dark:text-green-400" },
    accountant: { bg: "bg-orange-500 bg-opacity-15", text: "text-orange-700 dark:text-orange-400" },
};

export default function Users() {
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const filteredUsers = useMemo(() => {
        return MOCK_USERS.filter(
            (user) =>
                user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.email.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery]);

    const paginatedUsers = useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize;
        return filteredUsers.slice(startIndex, startIndex + pageSize);
    }, [filteredUsers, currentPage, pageSize]);

    const totalPages = Math.ceil(filteredUsers.length / pageSize);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handlePageSizeChange = (size: number) => {
        setPageSize(size);
        setCurrentPage(1);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-app">บัญชีผู้ใช้</h1>
                    <p className="text-sm text-muted mt-1">
                        จัดการบัญชีผู้ใช้งานในระบบ
                    </p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:brightness-110 transition-all shadow-md hover:shadow-lg active:scale-95">
                    <Plus className="w-4 h-4" />
                    <span>เพิ่มผู้ใช้</span>
                </button>
            </div>

            <div className="panel rounded-xl shadow-app overflow-hidden">
                <div className="p-6 pb-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                        <input
                            type="text"
                            placeholder="ค้นหาผู้ใช้..."
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
                                    ชื่อผู้ใช้
                                </th>
                                <th className="text-center py-3 px-4 text-sm font-semibold text-muted">
                                    ชื่อจริง
                                </th>
                                <th className="text-center py-3 px-4 text-sm font-semibold text-muted">
                                    อีเมล
                                </th>
                                <th className="text-center py-3 px-4 text-sm font-semibold text-muted">
                                    บทบาท
                                </th>
                                <th className="text-center py-3 px-4 text-sm font-semibold text-muted">
                                    สาขา
                                </th>
                                <th className="text-center py-3 px-4 text-sm font-semibold text-muted">
                                    แผนก
                                </th>
                                <th className="text-center py-3 px-4 text-sm font-semibold text-muted">
                                    สถานะ
                                </th>
                                <th className="text-center py-3 px-4 text-sm font-semibold text-muted">
                                    จัดการ
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedUsers.map((user) => {
                                const roleColor = ROLE_COLORS[user.role as keyof typeof ROLE_COLORS] || ROLE_COLORS.employee;
                                return (
                                    <tr
                                        key={user.id}
                                        className="border-b border-app last:border-0 hover:bg-soft transition-colors"
                                    >
                                        <td className="py-3 px-4 text-center text-sm font-medium text-app">
                                            {user.username}
                                        </td>
                                        <td className="py-3 px-4 text-center text-sm text-app">
                                            {user.fullName}
                                        </td>
                                        <td className="py-3 px-4 text-center text-sm text-muted">
                                            {user.email}
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleColor.bg} ${roleColor.text}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-center text-sm text-app">
                                            {user.branch || "-"}
                                        </td>
                                        <td className="py-3 px-4 text-center text-sm text-app">
                                            {user.department || "-"}
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            {user.status === "active" ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500 bg-opacity-15 text-green-700 dark:text-green-400">
                                                    <Check className="w-3 h-3" />
                                                    ใช้งาน
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[var(--danger)] bg-opacity-15 text-[var(--danger)]">
                                                    <X className="w-3 h-3" />
                                                    ไม่ใช้งาน
                                                </span>
                                            )}
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
                                );
                            })}
                        </tbody>
                    </table>

                    {paginatedUsers.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-muted">ไม่พบข้อมูลผู้ใช้</p>
                        </div>
                    )}
                </div>

                {filteredUsers.length > 0 && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        pageSize={pageSize}
                        totalItems={filteredUsers.length}
                        onPageChange={handlePageChange}
                        onPageSizeChange={handlePageSizeChange}
                    />
                )}
            </div>
        </div>
    );
}
