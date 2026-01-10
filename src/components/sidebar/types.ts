export interface SidebarItem {
    to: string;
    icon: any;
    label: string;
    end?: boolean;
    roles?: string[]; // roles ที่สามารถเห็นเมนูนี้ได้
    branchIds?: string[]; // สาขาที่สามารถเห็นเมนูนี้ได้
    isHeader?: boolean; // เพิ่มเพื่อรองรับการแสดงผลเป็นหัวข้อหมวดหมู่ภายใน
}

export interface SidebarGroup {
    id: string;
    label: string;
    icon?: any;
    items: SidebarItem[];
    roles?: string[]; // roles ที่สามารถเห็น group นี้ได้
    branchIds?: string[]; // สาขาที่สามารถเห็น group นี้ได้
}

export interface SidebarConfig {
    moduleName: string;
    moduleDescription: string;
    moduleIcon: any;
    // Supports simple list or grouped list
    items?: SidebarItem[];
    groups?: SidebarGroup[];
}

export interface SidebarProps {
    onClose?: () => void;
    isMobile?: boolean;
    isExpanded?: boolean;
    userRole?: string;
    selectedBranches?: string[];
}
