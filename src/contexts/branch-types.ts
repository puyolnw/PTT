export interface BranchContextType {
    selectedBranches: string[];
    setSelectedBranches: (branches: string[]) => void;
    toggleBranch: (branchId: string) => void;
    selectAll: () => void;
    clearAll: () => void;
}
