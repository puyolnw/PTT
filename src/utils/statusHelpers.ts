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
