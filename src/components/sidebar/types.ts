export interface SidebarItem {
    to: string;
    icon: React.ElementType;
    label: string;
    end?: boolean;
    roles?: string[]; // roles ที่สามารถเห็นเมนูนี้ได้
}

export interface SidebarGroup {
    id: string;
    label: string;
    icon?: React.ElementType;
    items: SidebarItem[];
    roles?: string[]; // roles ที่สามารถเห็น group นี้ได้
}

export interface SidebarConfig {
    moduleName: string;
    moduleDescription: string;
    moduleIcon: React.ElementType;
    // Supports simple list or grouped list
    items?: SidebarItem[];
    groups?: SidebarGroup[];
}

export interface SidebarProps {
    onClose?: () => void;
    isMobile?: boolean;
    isExpanded?: boolean;
    userRole?: string;
}
