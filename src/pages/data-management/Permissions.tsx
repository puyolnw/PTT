import { useState } from "react";
import { Plus, Search, Edit2, Trash2, Shield, Check, X, ChevronDown, ChevronRight } from "lucide-react";

interface Permission {
    module: string;
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
}

interface Role {
    id: string;
    name: string;
    code: string;
    description: string;
    userCount: number;
    permissions: Permission[];
}

const MODULES = [
    { id: "hr", name: "พนักงาน" },
    { id: "fund", name: "กองทุน" },
    { id: "documents", name: "เอกสาร" },
    { id: "reports", name: "รายงาน" },
    { id: "shops", name: "ร้านค้า" },
    { id: "rental", name: "พื้นที่เช่า" },
    { id: "accounting", name: "บัญชี" },
    { id: "gasStation", name: "ปั๊มน้ำมัน" },
    { id: "dataManagement", name: "จัดการข้อมูล" },
];

export default function Permissions() {
    const [searchQuery, setSearchQuery] = useState("");
    const [expandedRole, setExpandedRole] = useState<string | null>(null);

    const [roles] = useState<Role[]>([
        {
            id: "1",
            name: "ผู้ดูแลระบบ",
            code: "admin",
            description: "มีสิทธิ์เข้าถึงทุกระบบ",
            userCount: 5,
            permissions: MODULES.map(m => ({
                module: m.id,
                view: true,
                create: true,
                edit: true,
                delete: true,
            })),
        },
        {
            id: "2",
            name: "ผู้จัดการ",
            code: "manager",
            description: "สิทธิ์ระดับผู้จัดการ",
            userCount: 12,
            permissions: MODULES.map(m => ({
                module: m.id,
                view: true,
                create: m.id !== "accounting" && m.id !== "dataManagement",
                edit: m.id !== "accounting" && m.id !== "dataManagement",
                delete: false,
            })),
        },
        {
            id: "3",
            name: "พนักงาน HR",
            code: "hr",
            description: "จัดการระบบพนักงาน",
            userCount: 8,
            permissions: MODULES.map(m => ({
                module: m.id,
                view: m.id === "hr" || m.id === "documents",
                create: m.id === "hr",
                edit: m.id === "hr",
                delete: false,
            })),
        },
        {
            id: "4",
            name: "พนักงานบัญชี",
            code: "accountant",
            description: "จัดการระบบบัญชี",
            userCount: 6,
            permissions: MODULES.map(m => ({
                module: m.id,
                view: m.id === "accounting" || m.id === "documents" || m.id === "reports",
                create: m.id === "accounting",
                edit: m.id === "accounting",
                delete: false,
            })),
        },
    ]);

    const filteredRoles = roles.filter(
        (role) =>
            role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            role.code.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const toggleExpand = (roleId: string) => {
        setExpandedRole(expandedRole === roleId ? null : roleId);
    };

    const getPermission = (role: Role, moduleId: string) => {
        return role.permissions.find(p => p.module === moduleId);
    };

    const CheckIcon = ({ checked }: { checked: boolean }) => (
        checked ? (
            <Check className="w-4 h-4 text-green-600" />
        ) : (
            <X className="w-4 h-4 text-gray-400" />
        )
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-app">สิทธิ์การใช้งาน</h1>
                    <p className="text-sm text-muted mt-1">
                        จัดการสิทธิ์และบทบาทของผู้ใช้งานในระบบ
                    </p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:brightness-110 transition-all shadow-md hover:shadow-lg active:scale-95">
                    <Plus className="w-4 h-4" />
                    <span>เพิ่มบทบาท</span>
                </button>
            </div>

            <div className="panel rounded-xl shadow-app p-6">
                <div className="flex items-center gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                        <input
                            type="text"
                            placeholder="ค้นหาบทบาท..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-soft border-app rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-opacity-50 text-app"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-app bg-soft">
                                <th className="text-center py-3 px-4 text-sm font-semibold text-muted w-12"></th>
                                <th className="text-center py-3 px-4 text-sm font-semibold text-muted">
                                    บทบาท
                                </th>
                                <th className="text-center py-3 px-4 text-sm font-semibold text-muted">
                                    รหัส
                                </th>
                                <th className="text-center py-3 px-4 text-sm font-semibold text-muted">
                                    คำอธิบาย
                                </th>
                                <th className="text-center py-3 px-4 text-sm font-semibold text-muted">
                                    ผู้ใช้
                                </th>
                                <th className="text-center py-3 px-4 text-sm font-semibold text-muted">
                                    จัดการ
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRoles.map((role) => {
                                const isExpanded = expandedRole === role.id;
                                return (
                                    <>
                                        <tr
                                            key={role.id}
                                            className="border-b border-app hover:bg-soft transition-colors"
                                        >
                                            <td className="py-3 px-4">
                                                <button
                                                    onClick={() => toggleExpand(role.id)}
                                                    className="p-1 hover:bg-soft rounded transition-all"
                                                >
                                                    {isExpanded ? (
                                                        <ChevronDown className="w-4 h-4 text-muted" />
                                                    ) : (
                                                        <ChevronRight className="w-4 h-4 text-muted" />
                                                    )}
                                                </button>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="p-2 bg-[var(--primary)] bg-opacity-10 rounded-lg">
                                                        <Shield className="w-4 h-4 text-[var(--primary)]" />
                                                    </div>
                                                    <span className="text-sm font-medium text-app">
                                                        {role.name}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[var(--primary)] bg-opacity-10 text-[var(--primary)]">
                                                    {role.code}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-sm text-muted">
                                                {role.description}
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className="text-sm text-app">{role.userCount} คน</span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button className="p-2 hover:bg-soft rounded-lg transition-all group active:scale-95" title="แก้ไข">
                                                        <Edit2 className="w-4 h-4 text-muted group-hover:text-[var(--primary)] transition-colors" />
                                                    </button>
                                                    <button className="p-2 hover:bg-soft rounded-lg transition-all group active:scale-95" title="ลบ">
                                                        <Trash2 className="w-4 h-4 text-muted group-hover:text-[var(--danger)] transition-colors" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>

                                        {isExpanded && (
                                            <tr>
                                                <td colSpan={6} className="bg-soft p-6">
                                                    <div className="space-y-4">
                                                        <h4 className="text-sm font-semibold text-app mb-4">
                                                            สิทธิ์การเข้าถึงโมดูล
                                                        </h4>
                                                        <div className="overflow-x-auto">
                                                            <table className="w-full">
                                                                <thead>
                                                                    <tr className="border-b border-app">
                                                                        <th className="text-left py-2 px-3 text-xs font-semibold text-muted">
                                                                            โมดูล
                                                                        </th>
                                                                        <th className="text-center py-2 px-3 text-xs font-semibold text-muted">
                                                                            ดู (View)
                                                                        </th>
                                                                        <th className="text-center py-2 px-3 text-xs font-semibold text-muted">
                                                                            สร้าง (Create)
                                                                        </th>
                                                                        <th className="text-center py-2 px-3 text-xs font-semibold text-muted">
                                                                            แก้ไข (Edit)
                                                                        </th>
                                                                        <th className="text-center py-2 px-3 text-xs font-semibold text-muted">
                                                                            ลบ (Delete)
                                                                        </th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {MODULES.map((module) => {
                                                                        const perm = getPermission(role, module.id);
                                                                        if (!perm) return null;

                                                                        const hasAnyPermission = perm.view || perm.create || perm.edit || perm.delete;

                                                                        return (
                                                                            <tr
                                                                                key={module.id}
                                                                                className={`border-b border-app last:border-0 ${hasAnyPermission ? "" : "opacity-40"
                                                                                    }`}
                                                                            >
                                                                                <td className="py-2 px-3 text-sm text-app font-medium">
                                                                                    {module.name}
                                                                                </td>
                                                                                <td className="py-2 px-3 text-center">
                                                                                    <div className="flex justify-center">
                                                                                        <CheckIcon checked={perm.view} />
                                                                                    </div>
                                                                                </td>
                                                                                <td className="py-2 px-3 text-center">
                                                                                    <div className="flex justify-center">
                                                                                        <CheckIcon checked={perm.create} />
                                                                                    </div>
                                                                                </td>
                                                                                <td className="py-2 px-3 text-center">
                                                                                    <div className="flex justify-center">
                                                                                        <CheckIcon checked={perm.edit} />
                                                                                    </div>
                                                                                </td>
                                                                                <td className="py-2 px-3 text-center">
                                                                                    <div className="flex justify-center">
                                                                                        <CheckIcon checked={perm.delete} />
                                                                                    </div>
                                                                                </td>
                                                                            </tr>
                                                                        );
                                                                    })}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </>
                                );
                            })}
                        </tbody>
                    </table>

                    {filteredRoles.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-muted">ไม่พบข้อมูลบทบาท</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
