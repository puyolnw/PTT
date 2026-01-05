import { createContext, useContext, useState, ReactNode } from "react";
import { branches } from "@/components/navbar/constants";

import { BranchContextType } from "./branch-types";

const BranchContext = createContext<BranchContextType | undefined>(undefined);

export function BranchProvider({ children }: { children: ReactNode }) {
    // Default: select all branches
    const [selectedBranches, setSelectedBranches] = useState<string[]>(
        branches.map((b) => b.id)
    );

    const toggleBranch = (branchId: string) => {
        setSelectedBranches((prev) => {
            if (prev.includes(branchId)) {
                // Prevent deselecting the last branch? Or allow empty?
                // Let's allow empty for now, UI can handle no data state
                return prev.filter((id) => id !== branchId);
            } else {
                return [...prev, branchId];
            }
        });
    };

    const selectAll = () => {
        setSelectedBranches(branches.map((b) => b.id));
    };

    const clearAll = () => {
        setSelectedBranches([]);
    };

    return (
        <BranchContext.Provider
            value={{
                selectedBranches,
                setSelectedBranches,
                toggleBranch,
                selectAll,
                clearAll,
            }}
        >
            {children}
        </BranchContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useBranch() {
    const context = useContext(BranchContext);
    if (context === undefined) {
        throw new Error("useBranch must be used within a BranchProvider");
    }
    return context;
}
