import { useState, useEffect, useMemo } from "react";
import { X, ChevronDown, ChevronRight } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { SidebarConfig, SidebarProps, SidebarItem } from "./types";
import { getSidebarItemsForRole, getSidebarGroupsForRole } from "./utils";

interface BaseSidebarProps extends SidebarProps {
    config: SidebarConfig;
}

export default function BaseSidebar({
    onClose,
    isMobile = false,
    isExpanded = true,
    userRole = "employee",
    selectedBranches = [],
    config
}: BaseSidebarProps) {
    const { moduleName, moduleDescription, moduleIcon: ModuleIcon, items, groups } = config;
    const location = useLocation();

    // State for expanded groups
    const [expandedGroups, setExpandedGroups] = useState<string[]>([]);

    // Initialize visible items/groups
    const visibleItems = useMemo(() => 
        items ? getSidebarItemsForRole(items, userRole, selectedBranches) : []
    , [items, userRole, selectedBranches]);

    const visibleGroups = useMemo(() => 
        groups ? getSidebarGroupsForRole(groups, userRole, selectedBranches) : []
    , [groups, userRole, selectedBranches]);

    const showText = isMobile || isExpanded;
    const sidebarWidth = isMobile ? 'w-64' : (isExpanded ? 'w-64' : 'w-16');

    // Auto-expand group if active item is inside
    useEffect(() => {
        if (visibleGroups.length > 0) {
            const activeGroup = visibleGroups.find(group =>
                group.items.some(item => location.pathname === item.to || location.pathname.startsWith(item.to + '/'))
            );
            if (activeGroup && !expandedGroups.includes(activeGroup.id)) {
                setExpandedGroups(prev => [...prev, activeGroup.id]);
            }
        }
    }, [location.pathname, visibleGroups, expandedGroups]);

    const toggleGroup = (groupId: string) => {
        setExpandedGroups(prev =>
            prev.includes(groupId)
                ? prev.filter(id => id !== groupId)
                : [...prev, groupId]
        );
    };

    const renderItem = (item: SidebarItem) => (
        <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            title={item.label}
            aria-label={item.label}
            onClick={isMobile ? onClose : undefined}
            className={({ isActive }) =>
                `p-3 rounded-xl hover:panel relative group hover:scale-105 active:scale-95 outline-none focus:outline-none focus:ring-2 focus:ring-ptt-blue/30 ${isActive ? "panel shadow-md" : ""
                } ${showText ? 'flex items-center gap-3 w-full' : 'justify-center'}`
            }
            style={{
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
        >
            {({ isActive }) => (
                <>
                    {isActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-ptt-blue rounded-r-full shadow-[0_0_8px_rgba(40,103,224,0.6)]" />
                    )}

                    <item.icon
                        className={`w-5 h-5 flex-shrink-0 group-hover:scale-110 ${isActive ? "text-[var(--accent)]" : "text-muted group-hover:text-app"
                            }`}
                        strokeWidth={1.5}
                        style={{
                            transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
                        }}
                    />

                    {showText && (
                        <span
                            className={`text-sm font-medium whitespace-nowrap overflow-hidden ${isActive ? "text-[var(--accent)]" : "text-app group-hover:text-app"
                                }`}
                            style={{
                                transition: 'color 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                            }}
                        >
                            {item.label}
                        </span>
                    )}
                </>
            )}
        </NavLink>
    );

    return (
        <aside
            className={`
        ${sidebarWidth} 
        bg-[var(--bg)]
        flex flex-col 
        ${showText ? 'items-start px-4' : 'items-center'} 
        py-4 
        border-r border-app
        h-full
        transition-all duration-300 ease-in-out
        ${isMobile ? 'overflow-y-auto scrollbar-hide' : ''}
      `}
        >
            <div className={`mb-6 ${showText ? 'w-full flex items-center justify-between' : 'w-full flex items-center justify-center'}`}>
                <div className={`flex items-center gap-3 ${showText ? 'flex-1' : ''}`}>
                    <div className="w-10 h-10 bg-gradient-to-br from-ptt-blue to-ptt-cyan rounded-xl flex items-center justify-center shadow-lg shadow-ptt-blue/20 flex-shrink-0">
                        <ModuleIcon className="w-6 h-6 text-app" />
                    </div>
                    {showText && (
                        <div className="overflow-hidden">
                            <h2 className="text-lg font-semibold text-[var(--accent)] font-display whitespace-nowrap">
                                {moduleName}
                            </h2>
                            <p className="text-xs text-muted font-light whitespace-nowrap">{moduleDescription}</p>
                        </div>
                    )}
                </div>

                {isMobile && onClose && (
                    <button
                        onClick={onClose}
                        className="p-2 hover:panel rounded-lg transition-all hover:scale-110 active:scale-95 hover:rotate-90 flex-shrink-0"
                        aria-label="ปิดเมนู"
                    >
                        <X className="w-5 h-5 text-muted" />
                    </button>
                )}
            </div>

            <div className={`flex-1 flex flex-col space-y-2 ${showText ? 'w-full pb-6' : ''}`}>

                {/* Render Simple Items */}
                {visibleItems.map(item => renderItem(item))}

                {/* Render Groups */}
                {visibleGroups.map(group => {
                    const isGroupExpanded = expandedGroups.includes(group.id);

                    return (
                        <div key={group.id} className="space-y-1">
                            {showText ? (
                                // Group Header (Expanded View)
                                <button
                                    onClick={() => toggleGroup(group.id)}
                                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-soft text-app transition-colors group"
                                >
                                    <div className="flex items-center gap-3">
                                        {group.icon && <group.icon className="w-5 h-5 text-muted group-hover:text-[var(--primary)]" />}
                                        <span className="text-sm font-semibold text-muted group-hover:text-app">{group.label}</span>
                                    </div>
                                    {isGroupExpanded ? <ChevronDown className="w-4 h-4 text-muted" /> : <ChevronRight className="w-4 h-4 text-muted" />}
                                </button>
                            ) : (
                                // Group Header (Collapsed View - Divider)
                                <div className="w-full h-px bg-app my-2" />
                            )}

                            {/* Group Items */}
                            <div
                                className={`space-y-1 overflow-hidden transition-all duration-300 ${isGroupExpanded || !showText ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
                                    }`}
                            >
                                {group.items.map(item => (
                                    <div key={item.to} className={showText ? "pl-4" : ""}>
                                        {renderItem(item)}
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}

            </div>
        </aside>
    );
}
