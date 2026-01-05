import { ReactNode } from "react";

interface MobileDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    children: ReactNode;
}

export default function MobileDrawer({ isOpen, onClose, children }: MobileDrawerProps) {
    if (!isOpen) return null;

    return (
        <>
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden animate-fade-in transition-all duration-300 ease-out"
                onClick={onClose}
                aria-hidden="true"
            />

            <div
                className="fixed left-0 top-0 bottom-0 z-50 md:hidden animate-slide-in-left shadow-2xl will-change-transform"
                role="dialog"
                aria-modal="true"
                aria-label="Mobile menu"
            >
                {children}
            </div>
        </>
    );
}
