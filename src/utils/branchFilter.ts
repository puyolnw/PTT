import { branches as navbarBranches } from "@/components/navbar/constants";

export function normalizeBranchName(name: string): string {
  // Normalize common prefixes: "ปั๊ม" / "ปั้ม"
  return name
    .trim()
    .replace(/^ปั๊ม/, "")
    .replace(/^ปั้ม/, "")
    .replace(/^ปั๊ม/, "")
    .replace(/^ปั้ม/, "")
    .trim();
}

export function selectedBranchNameSetFromNavbarIds(selectedBranchIds: string[]): Set<string> {
  return new Set(
    selectedBranchIds.map((id) => {
      const branchName = navbarBranches.find((b) => b.id === id)?.name ?? id;
      return normalizeBranchName(branchName);
    })
  );
}

export function isAllNavbarBranchesSelected(selectedBranchIds: string[]): boolean {
  return selectedBranchIds.length === navbarBranches.length;
}

export function isInSelectedNavbarBranches(rowBranchName: string, selectedSet: Set<string>): boolean {
  return selectedSet.has(normalizeBranchName(rowBranchName));
}

