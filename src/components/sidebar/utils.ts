import { SidebarItem, SidebarGroup } from "./types";

/**
 * Filter sidebar items based on user role
 */
export function getSidebarItemsForRole(items: SidebarItem[], userRole: string): SidebarItem[] {
    // Admin เห็นทุกอย่าง
    if (userRole === "admin") return items;

    return items.filter(item => {
        if (!item.roles || item.roles.length === 0) return true;
        return item.roles.includes(userRole);
    });
}

/**
 * Filter sidebar groups based on user role
 */
export function getSidebarGroupsForRole(groups: SidebarGroup[], userRole: string): SidebarGroup[] {
    // Admin เห็นทุกอย่าง
    if (userRole === "admin") return groups;

    return groups
        .filter(group => {
            // Check group level permission
            if (!group.roles || group.roles.length === 0) return true;
            return group.roles.includes(userRole);
        })
        .map(group => ({
            ...group,
            // Filter items within the group
            items: getSidebarItemsForRole(group.items, userRole)
        }))
        // Remove groups that became empty after filtering items (optional, but good UX)
        .filter(group => group.items.length > 0);
}
