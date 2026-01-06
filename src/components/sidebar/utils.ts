import { SidebarItem, SidebarGroup } from "./types";

/**
 * Filter sidebar items based on user role and selected branches
 */
export function getSidebarItemsForRole(
    items: SidebarItem[],
    userRole: string,
    selectedBranches: string[] = []
): SidebarItem[] {
    return items.filter(item => {
        // 1. Role Check
        if (item.roles && item.roles.length > 0) {
            if (!item.roles.includes(userRole)) return false;
        }

        // 2. Branch Check
        // ถ้ามีการเลือกสาขา (ไม่ใช่ 'ทั้งหมด' หรือ 'ไม่มีเลย')
        if (selectedBranches.length > 0) {
            // ถ้าเมนูระบุสาขาที่อนุญาต
            if (item.branchIds && item.branchIds.length > 0) {
                // ต้องมีสาขาที่เลือกอย่างน้อยหนึ่งสาขาที่อยู่ในรายการอนุญาต
                const hasMatch = selectedBranches.some(bid => item.branchIds?.includes(bid));
                if (!hasMatch) return false;
            }
        }

        return true;
    });
}

/**
 * Filter sidebar groups based on user role and selected branches
 */
export function getSidebarGroupsForRole(
    groups: SidebarGroup[],
    userRole: string,
    selectedBranches: string[] = []
): SidebarGroup[] {
    return groups
        .filter(group => {
            // 1. Role Check
            if (group.roles && group.roles.length > 0) {
                if (!group.roles.includes(userRole)) return false;
            }

            // 2. Branch Check
            if (selectedBranches.length > 0) {
                if (group.branchIds && group.branchIds.length > 0) {
                    const hasMatch = selectedBranches.some(bid => group.branchIds?.includes(bid));
                    if (!hasMatch) return false;
                }
            }

            return true;
        })
        .map(group => ({
            ...group,
            // Filter items within the group
            items: getSidebarItemsForRole(group.items, userRole, selectedBranches)
        }))
        // Remove groups that became empty after filtering items
        .filter(group => group.items.length > 0);
}
