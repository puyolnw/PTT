import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { MoreVertical } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ActionItem {
  label: string;
  icon?: React.ElementType;
  onClick: () => void;
  variant?: "default" | "danger" | "primary" | "success" | "warning";
  hidden?: boolean;
}

interface TableActionMenuProps {
  actions: (ActionItem | null | undefined | false)[];
}

export default function TableActionMenu({ actions }: TableActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const visibleActions = actions.filter((action): action is ActionItem => 
    action !== null && action !== undefined && action !== false && !action.hidden
  );

  useEffect(() => {
    const updatePosition = () => {
      if (buttonRef.current && isOpen) {
        const rect = buttonRef.current.getBoundingClientRect();
        // Calculate position to show menu to bottom-left of button
        const menuWidth = 192; // w-48 = 12rem = 192px
        
        let top = rect.bottom + 4;
        let left = rect.right - menuWidth;

        // Adjust if going off screen (basic check)
        if (left < 0) left = rect.left;
        
        setPosition({ top, left });
      }
    };

    if (isOpen) {
      updatePosition();
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
    }
    
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Check if click is on button
      if (buttonRef.current && buttonRef.current.contains(event.target as Node)) {
        return; 
      }
      
      // Check if click is on menu (via portal)
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const getVariantClasses = (variant?: string) => {
    switch (variant) {
      case "danger":
        return "text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20";
      case "primary":
        return "text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20";
      case "success":
        return "text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20";
      case "warning":
        return "text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20";
      default:
        return "text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50";
    }
  };

  return (
    <>
      <button
        ref={buttonRef}
        onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
        }}
        className={`p-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20
          ${isOpen ? 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400'}
        `}
      >
        <MoreVertical className="w-5 h-5" />
      </button>

      {createPortal(
        <AnimatePresence>
          {isOpen && (
            <div
                ref={menuRef}
                style={{
                    position: 'fixed',
                    top: position.top,
                    left: position.left,
                    zIndex: 9999,
                }}
            >
                <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ duration: 0.1 }}
                className="w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden ring-1 ring-black/5"
                >
                <div className="py-1">
                    {visibleActions.map((action, index) => (
                    <button
                        key={index}
                        onClick={(e) => {
                        e.stopPropagation();
                        action.onClick();
                        setIsOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${getVariantClasses(action.variant)}`}
                    >
                        {action.icon && <action.icon className="w-4 h-4" />}
                        {action.label}
                    </button>
                    ))}
                </div>
                </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
