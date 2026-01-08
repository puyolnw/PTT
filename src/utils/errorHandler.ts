import { toast } from "sonner";

export const handleError = (error: unknown, fallbackMessage: string = "เกิดข้อผิดพลาดในการทำรายการ"): void => {
    console.error("ErrorHandler:", error);

    let message = fallbackMessage;
    let status: number | undefined;

    if (typeof error === 'object' && error !== null) {
        if ('status' in error) {
            status = (error as any).status;
        } else if ('statusCode' in error) {
            status = (error as any).statusCode;
        }
    }

    if (status) {
        switch (status) {
            case 400:
                message = "คำขอไม่ถูกต้อง (400) - กรุณาตรวจสอบข้อมูล";
                break;
            case 401:
                message = "กรุณาเข้าสู่ระบบใหม่ (401) - เซสชันหมดอายุ";
                break;
            case 403:
                message = "ไม่มีสิทธิ์เข้าถึง (403)";
                break;
            case 404:
                message = "ไม่พบข้อมูล (404)";
                break;
            case 429:
                message = "มีการใช้งานมากเกินไป (429) - กรุณารอสักครู่";
                break;
            case 500:
                message = "เกิดข้อผิดพลาดจากเซิร์ฟเวอร์ (500)";
                break;
            case 502:
                message = "เกตเวย์ไม่ถูกต้อง (502)";
                break;
            case 503:
                message = "บริการไม่พร้อมใช้งาน (503)";
                break;
            default:
                message = `ข้อผิดพลาด (${status})`;
        }

        if (error instanceof Error && error.message && error.message !== "Login failed" && error.message !== "Failed to fetch") {
            if ((error as any).message) {
                message = (error as any).message;
            }
        }
    } else {
        if (error instanceof Error) {
            message = error.message;
        } else if (typeof error === "string") {
            message = error;
        } else if (typeof error === "object" && error !== null && "message" in error) {
            message = String((error as any).message);
        }
    }

    toast.error(message);
};

export const handleSuccess = (message: string): void => {
    toast.success(message);
};
