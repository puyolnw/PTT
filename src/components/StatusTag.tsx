import { cva, type VariantProps } from "class-variance-authority";
import type { ReactNode } from "react";

// StatusTag Component — แสดงสถานะด้วยสีและไอคอน
const statusVariants = cva(
  "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        success: "bg-green-500/20 text-green-400 border border-green-500/30",
        warning: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
        danger: "bg-red-500/20 text-red-400 border border-red-500/30",
        info: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
        neutral: "bg-slate-500/20 text-muted border border-slate-500/30",
        primary: "bg-ptt-blue/20 text-ptt-cyan border border-ptt-blue/30",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  }
);

interface StatusTagProps extends VariantProps<typeof statusVariants> {
  children: ReactNode;
  icon?: ReactNode;
  className?: string;
}

export default function StatusTag({ children, variant, icon, className }: StatusTagProps) {
  return (
    <span className={`${statusVariants({ variant })} ${className || ""}`}>
      {icon && <span className="mr-1.5">{icon}</span>}
      {children}
    </span>
  );
}

// Helper function เพื่อแปลงสถานะเป็น variant
export function getStatusVariant(
  status: string
): "success" | "warning" | "danger" | "info" | "neutral" | "primary" {
  const lowerStatus = status.toLowerCase();

  if (lowerStatus.includes("active") || lowerStatus.includes("ตรงเวลา") || lowerStatus.includes("อนุมัติแล้ว") || lowerStatus.includes("ผ่าน")) {
    return "success";
  }

  if (lowerStatus.includes("สาย") || lowerStatus.includes("warning") || lowerStatus.includes("รออนุมัติ") || lowerStatus.includes("นัดสัมภาษณ์")) {
    return "warning";
  }

  if (lowerStatus.includes("ขาด") || lowerStatus.includes("ไม่ผ่าน") || lowerStatus.includes("resigned") || lowerStatus.includes("ไม่อนุมัติ")) {
    return "danger";
  }

  if (lowerStatus.includes("leave") || lowerStatus.includes("ลา") || lowerStatus.includes("รอตรวจสอบ")) {
    return "info";
  }

  return "neutral";
}

