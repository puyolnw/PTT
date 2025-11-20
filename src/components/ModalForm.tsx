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
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={`bg-soft border border-app rounded-2xl shadow-2xl 
                         w-full ${sizeClasses[size]} max-h-[90vh] overflow-hidden flex flex-col`}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-app bg-gradient-to-r from-soft via-soft/95 to-soft">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-ptt-blue/20 rounded-lg">
                    <svg className="w-5 h-5 text-ptt-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-app font-display">
                    {title}
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-soft rounded-xl transition-all duration-200 text-muted hover:text-app hover:scale-110 active:scale-95"
                  aria-label="ปิด"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto px-6 py-6 bg-soft">
                {children}
              </div>

              {/* Footer */}
              {onSubmit && (
                <div className="flex items-center justify-end gap-3 px-6 py-5 border-t border-app bg-gradient-to-r from-soft/95 via-soft to-soft/95">
                  <button
                    onClick={onClose}
                    className="px-6 py-2.5 text-muted hover:text-app transition-all duration-200 font-medium
                             hover:bg-soft rounded-xl border border-app hover:border-app/50"
                  >
                    ยกเลิก
                  </button>
                  <button
                    onClick={onSubmit}
                    className="px-8 py-2.5 bg-gradient-to-r from-ptt-blue to-ptt-cyan hover:from-ptt-blue/90 hover:to-ptt-cyan/90 
                             text-white rounded-xl transition-all duration-200 font-semibold shadow-lg hover:shadow-xl
                             hover:-translate-y-0.5 active:translate-y-0"
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

