import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, type ReactNode } from "react";

interface ModalFormProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  onSubmit?: () => void;
  submitLabel?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export default function ModalForm({
  isOpen,
  onClose,
  title,
  children,
  onSubmit,
  submitLabel = "บันทึก",
  size = "md"
}: ModalFormProps) {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-2xl",
    lg: "max-w-4xl",
    xl: "max-w-6xl"
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={`panel border border-app rounded-2xl shadow-2xl 
                         w-full ${sizeClasses[size]} max-h-[90vh] overflow-hidden flex flex-col`}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-app">
                <h2 className="text-xl font-semibold text-app font-display">
                  {title}
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-ink-800 rounded-lg transition-colors text-muted hover:text-app"
                  aria-label="ปิด"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto px-6 py-4">
                {children}
              </div>

              {/* Footer */}
              {onSubmit && (
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-app">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-app hover:text-app transition-colors font-medium"
                  >
                    ยกเลิก
                  </button>
                  <button
                    onClick={onSubmit}
                    className="px-6 py-2 bg-ptt-blue hover:bg-ptt-blue/80 text-app rounded-xl 
                             transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
                  >
                    {submitLabel}
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

