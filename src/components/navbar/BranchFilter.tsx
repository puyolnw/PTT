import { useState, useRef, useEffect } from "react";
import { Filter } from "lucide-react";
import { branches } from "./constants";

interface BranchFilterProps {
    selectedBranches: string[];
    onBranchesChange: (branches: string[]) => void;
}

export default function BranchFilter({ selectedBranches, onBranchesChange }: BranchFilterProps) {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    const toggleBranch = (branchId: string) => {
        const newSelection = selectedBranches.includes(branchId)
            ? selectedBranches.filter(id => id !== branchId)
            : [...selectedBranches, branchId];
        onBranchesChange(newSelection);
    };

    const toggleAll = () => {
        const newSelection = selectedBranches.length === branches.length
            ? []
            : branches.map(b => b.id);
        onBranchesChange(newSelection);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
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

    return (
        <div className="relative flex-shrink-0" ref={ref}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 hover:bg-soft rounded-lg transition-all hover:scale-110 active:scale-95 relative"
                title="กรองตามสาขา"
            >
                <Filter className="w-4 h-4 text-emerald-600" />
                {selectedBranches.length > 0 && selectedBranches.length < branches.length && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-[var(--primary)] text-white text-xs rounded-full flex items-center justify-center">
                        {selectedBranches.length}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute top-full right-0 mt-2 w-56 bg-[var(--bg)] border border-app rounded-xl shadow-2xl z-50 overflow-hidden">
                    <div className="py-2">
                        <div className="px-4 py-2 border-b border-app">
                            <p className="text-xs font-semibold text-muted">กรองตามสาขา</p>
                        </div>
                        <button
                            onClick={toggleAll}
                            className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-soft transition-colors"
                        >
                            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${selectedBranches.length === branches.length
                                    ? "bg-[var(--primary)] border-[var(--primary)]"
                                    : "border-app"
                                }`}>
                                {selectedBranches.length === branches.length && (
                                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                            </div>
                            <span className="text-sm font-medium text-app">ทั้งหมด</span>
                        </button>
                        {branches.map((branch) => (
                            <button
                                key={branch.id}
                                onClick={() => toggleBranch(branch.id)}
                                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-soft transition-colors"
                            >
                                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${selectedBranches.includes(branch.id)
                                        ? "bg-[var(--primary)] border-[var(--primary)]"
                                        : "border-app"
                                    }`}>
                                    {selectedBranches.includes(branch.id) && (
                                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                </div>
                                <span className="text-sm text-app">{branch.name}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
