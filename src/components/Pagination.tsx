import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    totalItems: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
    pageSizeOptions?: number[];
}

export default function Pagination({
    currentPage,
    totalPages,
    pageSize,
    totalItems,
    onPageChange,
    onPageSizeChange,
    pageSizeOptions = [10, 25, 50, 100],
}: PaginationProps) {
    const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, totalItems);

    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        const maxVisible = 5;

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 4; i++) pages.push(i);
                pages.push("...");
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1);
                pages.push("...");
                for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
            } else {
                pages.push(1);
                pages.push("...");
                for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
                pages.push("...");
                pages.push(totalPages);
            }
        }

        return pages;
    };

    return (
        <div className="flex items-center justify-between px-4 py-3 border-t border-app">
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted">แสดง</span>
                    <select
                        value={pageSize}
                        onChange={(e) => onPageSizeChange(Number(e.target.value))}
                        className="px-3 py-1.5 bg-soft border-app rounded-lg text-sm text-app focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-opacity-50"
                    >
                        {pageSizeOptions.map((size) => (
                            <option key={size} value={size}>
                                {size}
                            </option>
                        ))}
                    </select>
                    <span className="text-sm text-muted">รายการ</span>
                </div>
                <div className="text-sm text-muted">
                    แสดง {startItem}-{endItem} จาก {totalItems} รายการ
                </div>
            </div>

            <div className="flex items-center gap-2">
                <button
                    onClick={() => onPageChange(1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg hover:bg-soft transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
                    title="หน้าแรก"
                >
                    <ChevronsLeft className="w-4 h-4 text-muted" />
                </button>

                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg hover:bg-soft transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
                    title="หน้าก่อนหน้า"
                >
                    <ChevronLeft className="w-4 h-4 text-muted" />
                </button>

                <div className="flex items-center gap-1">
                    {getPageNumbers().map((page, index) => (
                        <button
                            key={index}
                            onClick={() => typeof page === "number" && onPageChange(page)}
                            disabled={page === "..."}
                            className={`min-w-[36px] h-9 px-3 rounded-lg text-sm font-medium transition-all ${page === currentPage
                                    ? "bg-[var(--primary)] text-white shadow-md"
                                    : page === "..."
                                        ? "cursor-default text-muted"
                                        : "hover:bg-soft text-app active:scale-95"
                                }`}
                        >
                            {page}
                        </button>
                    ))}
                </div>

                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg hover:bg-soft transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
                    title="หน้าถัดไป"
                >
                    <ChevronRight className="w-4 h-4 text-muted" />
                </button>

                <button
                    onClick={() => onPageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg hover:bg-soft transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
                    title="หน้าสุดท้าย"
                >
                    <ChevronsRight className="w-4 h-4 text-muted" />
                </button>
            </div>
        </div>
    );
}
