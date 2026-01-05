export interface Module {
    name: string;
    path: string;
    icon: React.ElementType;
    roles?: string[]; // roles ที่สามารถเห็นเมนูนี้ได้ (ถ้าไม่ระบุ = ทุกคน)
}

export interface Branch {
    id: string;
    name: string;
}

export interface UserProfile {
    name: string;
    email: string;
    role: string;
    avatar?: string;
}
