import { Users, Building2, Briefcase, Shield } from "lucide-react";
import { Link } from "react-router-dom";

export default function Dashboard() {
    const stats = [
        {
            title: "บัญชีผู้ใช้",
            value: "156",
            icon: Users,
            color: "blue",
            link: "/app/data-management/users",
            description: "ผู้ใช้งานทั้งหมดในระบบ",
        },
        {
            title: "สาขา",
            value: "12",
            icon: Building2,
            color: "green",
            link: "/app/data-management/branches",
            description: "สาขาที่เปิดให้บริการ",
        },
        {
            title: "แผนก",
            value: "45",
            icon: Briefcase,
            color: "purple",
            link: "/app/data-management/departments",
            description: "แผนกทั้งหมดในองค์กร",
        },
        {
            title: "บทบาท",
            value: "8",
            icon: Shield,
            color: "orange",
            link: "/app/data-management/permissions",
            description: "บทบาทและสิทธิ์การใช้งาน",
        },
    ];

    const colorClasses = {
        blue: {
            bg: "bg-blue-50",
            icon: "text-blue-600",
            border: "border-blue-200",
        },
        green: {
            bg: "bg-green-50",
            icon: "text-green-600",
            border: "border-green-200",
        },
        purple: {
            bg: "bg-purple-50",
            icon: "text-purple-600",
            border: "border-purple-200",
        },
        orange: {
            bg: "bg-orange-50",
            icon: "text-orange-600",
            border: "border-orange-200",
        },
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-app">จัดการข้อมูล</h1>
                <p className="text-sm text-muted mt-1">
                    ภาพรวมการจัดการข้อมูลพื้นฐานของระบบ
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => {
                    const colors = colorClasses[stat.color as keyof typeof colorClasses];
                    return (
                        <Link
                            key={stat.title}
                            to={stat.link}
                            className="group"
                        >
                            <div className={`bg-card rounded-xl shadow-sm border ${colors.border} p-6 hover:shadow-lg transition-all hover:-translate-y-1`}>
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`p-3 ${colors.bg} rounded-lg`}>
                                        <stat.icon className={`w-6 h-6 ${colors.icon}`} />
                                    </div>
                                </div>
                                <h3 className="text-3xl font-bold text-app mb-1">
                                    {stat.value}
                                </h3>
                                <p className="text-sm font-medium text-app mb-1">
                                    {stat.title}
                                </p>
                                <p className="text-xs text-muted">
                                    {stat.description}
                                </p>
                            </div>
                        </Link>
                    );
                })}
            </div>

            <div className="bg-card rounded-xl shadow-sm border border-app p-6">
                <h2 className="text-lg font-semibold text-app mb-4">
                    เมนูการจัดการ
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {stats.map((stat) => {
                        const colors = colorClasses[stat.color as keyof typeof colorClasses];
                        return (
                            <Link
                                key={stat.title}
                                to={stat.link}
                                className="group flex items-center gap-4 p-4 bg-soft rounded-lg border border-app hover:shadow-md transition-all"
                            >
                                <div className={`p-3 ${colors.bg} rounded-lg`}>
                                    <stat.icon className={`w-5 h-5 ${colors.icon}`} />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-medium text-app group-hover:text-primary transition-colors">
                                        {stat.title}
                                    </h3>
                                    <p className="text-sm text-muted">
                                        {stat.description}
                                    </p>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
