import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
    FileSpreadsheet,
    Calendar,
    DollarSign,
    TrendingUp,
    Filter,
    Search,
    X,
    Check,
    ChevronUp,
    ChevronDown,
    ChevronsUpDown,
} from "lucide-react";

const numberFormatter = new Intl.NumberFormat("th-TH", {
    maximumFractionDigits: 2,
});

type ControlSheetEntry = {
    code: string;
    description: string;
    amount: number;
    note?: string;
};

type ControlSheetSection = {
    title: string;
    entries: ControlSheetEntry[];
};

// Mock data สำหรับ Control Sheet
const mockControlSheetData: ControlSheetSection[] = [
    {
        title: "Section 1: รายการหลัก",
        entries: [
            { code: "1.1", description: "ช.ท.น.ม.น้ำมัน", amount: 95510.94, note: "" },
            { code: "1.2", description: "ส่วนลดพนักงานทำน้ำมัน", amount: 4.19, note: "ช.ท.น.ยูเนี่ยน 8,918" },
            { code: "1.3", description: "ส่วนลด(พนักงาน)", amount: 0, note: "ช.ท.น.ส่วนลดพิเศษ 10,055" },
            { code: "1.4", description: "ส่วนลดพิเศษ", amount: 0, note: "ช.ท.น.ส่วนลด" },
            { code: "1.5", description: "ลูกหนี้", amount: 12681.10, note: "ฯลฯ" },
            { code: "1.6", description: "ยูเนี่ยน ฯ", amount: 1900, note: "ไม่มีข้อมูล" },
            { code: "1.7", description: "ไม่มีข้อมูล", amount: 0, note: "ไม่มีข้อมูล(ไม่)" },
            { code: "1.8", description: "ยูเนี่ยน ไม่มีค่าน้ำ ฯ", amount: 0, note: "ยูเนี่ยนส่วนลดพิเศษ" },
            { code: "1.9", description: "CASH/Sale", amount: 502163, note: "ส่วนลดส่วนลดพิเศษ 502.16.3 | 4.15.500" },
            { code: "1.10", description: "ไม่มีข้อมูล", amount: 0, note: "ส่วนลด" },
            { code: "1.11", description: "ยูเนี่ยน TR", amount: 0, note: "ไม่มีข้อมูล(TR/EXPENSE)" },
            { code: "1.12", description: "ไม่มีข้อมูล", amount: 0, note: "ยูเนี่ยนยูเนี่ยน(TR/EXPENSE)" },
            { code: "1.13", description: "ส่วนลดยูเนี่ยนไม่มีค่าน้ำ", amount: 0, note: "" },
        ],
    },
    {
        title: "Section 2: รายการเพิ่มเติม",
        entries: [
            { code: "2.1", description: "ไม่มีข้อมูล", amount: 911542, note: "เงิน 492,050.44" },
            { code: "2.2", description: "ไม่มีข้อมูลส่วนลดพิเศษ", amount: 0, note: "Buy-Balance(1+2) 1,650" },
            { code: "2.3", description: "ส่วนลด", amount: 1859, note: "ส่วนลด" },
            { code: "2.4", description: "ส่วนลดส่วนลดพิเศษ", amount: 0, note: "ใช้ส่วนลดพิเศษ(ไม่.)" },
            { code: "2.5", description: "เงินสดส่วนลดพิเศษ", amount: 0, note: "ใช้ส่วนลดพิเศษ(ไม่.)" },
            { code: "2.6", description: "เงินสด", amount: 0, note: "PROF 1" },
            { code: "2.7", description: "ค่าใช้จ่าย", amount: 0, note: "" },
        ],
    },
    {
        title: "Section 3: CASH และ Balance",
        entries: [
            { code: "3.1", description: "CASH/Sale เงินสดทำน้ำมัน", amount: 211552, note: "CASH-BALANCE 155,510.90" },
            { code: "3.2", description: "ค่าใช้จ่าย", amount: 99.02, note: "หนี้เงินส่วนลดพิเศษ(STLS)" },
            { code: "3.3", description: "Buy-ค่าน้ำ ซื้อน้ำมันส่วนลดพิเศษ", amount: 1951, note: "" },
            { code: "3.4", description: "ไม่มีข้อมูล", amount: 112, note: "AC" },
            { code: "3.5", description: "หนี้เงินยืม", amount: 195524.20, note: "" },
            { code: "3.6", description: "ฯลฯ", amount: 0, note: "" },
            { code: "3.7", description: "พิเศษ", amount: 0, note: "" },
        ],
    },
    {
        title: "Section 4: CASH/DEBT",
        entries: [
            { code: "4.1", description: "CASH/DEBT เงินสดทำน้ำมัน", amount: 0, note: "รับทรัพย์ไม่ไม่" },
            { code: "4.2", description: "ส่วนลดพิเศษ", amount: 0, note: "รับทรัพย์ไม่(ไม่)" },
            { code: "4.3", description: "ยูเนี่ยน DEBT", amount: 0, note: "" },
            { code: "4.4", description: "ไม่มีข้อมูล DEBT ส่วนลดทำน้ำมัน", amount: 0, note: "" },
            { code: "4.5", description: "ยูเนี่ยนไม่มีค่าน้ำ(ไม่)", amount: 0, note: "" },
        ],
    },
    {
        title: "Section 5: PAY-IN",
        entries: [
            { code: "5.1", description: "PAY-IN (รายการ)", amount: 0, note: "ส่งเงิน CASH/SALE เงินสดทำน้ำมัน" },
            { code: "5.2", description: "ไม่มีข้อมูล", amount: 0, note: "ส่งเงิน CASH/DEBT ไม่มีทรัพย์ไม่" },
            { code: "5.3", description: "ไม่มีข้อมูล", amount: 0, note: "ส่งเงินเงิน" },
            { code: "5.4", description: "ไม่มีข้อมูล", amount: 0, note: "PROF 1" },
        ],
    },
    {
        title: "Section 6: เช็คและอื่นๆ",
        entries: [
            { code: "6.1", description: "ไม่มีข้อมูล", amount: 0, note: "PROF-CHEQUE ฯ" },
            { code: "6.2", description: "ฯลฯ AC", amount: 0, note: "ส่วนลดส่วนลดทรัพย์ไม่ทรัพย์ไม่" },
            { code: "6.3", description: "ค่าใช้จ่าย", amount: 0, note: "" },
            { code: "6.4", description: "BUY CHEQUE ซื้อน้ำมันส่วนลดพิเศษ", amount: 0, note: "" },
            { code: "6.5", description: "ฯลฯ", amount: 0, note: "" },
        ],
    },
    {
        title: "Section 7: สรุป",
        entries: [
            { code: "7.1", description: "ไม่มีข้อมูล", amount: 944980, note: "ไม่มีข้อมูลส่วนลดทรัพย์(ไม่)" },
            { code: "7.2", description: "ไม่มีข้อมูลส่วนลดพิเศษ", amount: 0, note: "ไม่มีข้อมูลส่วนลดทรัพย์ไม่ทรัพย์(ไม่)" },
            { code: "7.3", description: "ไม่มีข้อมูลส่วนลดพิเศษ(ไม่)", amount: 0, note: "" },
        ],
    },
];

export default function ControlSheet() {
    type FilterType = "day" | "month" | "year";

    const [filterType, setFilterType] = useState<FilterType>("day");
    const [selectedDate, setSelectedDate] = useState("2024-12-05");
    const [selectedMonth, setSelectedMonth] = useState("2024-12");
    const [selectedYear, setSelectedYear] = useState("2024");
    const [searchTerm, setSearchTerm] = useState("");

    // State for editable data
    const [controlSheetData, setControlSheetData] = useState<ControlSheetSection[]>(
        JSON.parse(JSON.stringify(mockControlSheetData))
    );
    const [editingCell, setEditingCell] = useState<{
        sectionIndex: number;
        entryIndex: number;
        field: keyof ControlSheetEntry;
    } | null>(null);

    type FilterKey = "section" | "code" | "amount" | "note";
    type SortKey = "sectionTitle" | "code" | "description" | "amount" | "note";

    const [columnFilters, setColumnFilters] = useState<Record<FilterKey, string>>(() => ({
        section: "ทั้งหมด",
        code: "ทั้งหมด",
        amount: "ทั้งหมด",
        note: "ทั้งหมด",
    }));

    const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: "asc" | "desc" | null }>({
        key: "code",
        direction: "asc",
    });

    const [openHeaderFilter, setOpenHeaderFilter] = useState<{
        key: FilterKey;
        left: number;
        top: number;
    } | null>(null);

    // Helper function to format date in Thai
    const formatThaiDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const thaiMonths = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
        const day = date.getDate();
        const month = thaiMonths[date.getMonth()];
        const year = (date.getFullYear() + 543).toString().slice(-2);
        return `${day} ${month} ${year}`;
    };

    const formatThaiMonth = (monthStr: string) => {
        const [year, month] = monthStr.split("-");
        const thaiMonths = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];
        const thaiYear = parseInt(year) + 543;
        return `${thaiMonths[parseInt(month) - 1]} ${thaiYear}`;
    };

    const formatThaiYear = (yearStr: string) => {
        const thaiYear = parseInt(yearStr) + 543;
        return `ปี ${thaiYear}`;
    };

    // Get display text based on filter type
    const getDisplayDate = () => {
        switch (filterType) {
            case "day":
                return formatThaiDate(selectedDate);
            case "month":
                return formatThaiMonth(selectedMonth);
            case "year":
                return formatThaiYear(selectedYear);
            default:
                return formatThaiDate(selectedDate);
        }
    };

    // Handler for updating cell value
    const handleCellUpdate = (
        sectionIndex: number,
        entryIndex: number,
        field: keyof ControlSheetEntry,
        value: string | number
    ) => {
        const newData = [...controlSheetData];
        if (field === "amount") {
            newData[sectionIndex].entries[entryIndex][field] = parseFloat(value as string) || 0;
        } else {
            newData[sectionIndex].entries[entryIndex][field] = String(value);
        }
        setControlSheetData(newData);
    };

    // Handler for starting edit mode
    const startEditing = (sectionIndex: number, entryIndex: number, field: keyof ControlSheetEntry) => {
        setEditingCell({ sectionIndex, entryIndex, field });
    };

    // Handler for finishing edit mode
    const finishEditing = () => {
        setEditingCell(null);
    };

    // Check if a cell is being edited
    const isEditing = (sectionIndex: number, entryIndex: number, field: keyof ControlSheetEntry) => {
        return (
            editingCell?.sectionIndex === sectionIndex &&
            editingCell?.entryIndex === entryIndex &&
            editingCell?.field === field
        );
    };

    const flatRows = useMemo(() => {
        return controlSheetData.flatMap((section, sectionIndex) =>
            section.entries.map((entry, entryIndex) => ({
                sectionTitle: section.title,
                sectionIndex,
                entryIndex,
                ...entry,
            }))
        );
    }, [controlSheetData]);

    const filterOptions = useMemo(() => {
        const sections = ["ทั้งหมด", ...Array.from(new Set(controlSheetData.map((s) => s.title)))];
        const codes = ["ทั้งหมด", ...Array.from(new Set(flatRows.map((r) => r.code)))].sort((a, b) =>
            a.localeCompare(b)
        );
        const amounts = ["ทั้งหมด", "มีจำนวนเงิน", "ไม่มีจำนวนเงิน"];
        const notes = ["ทั้งหมด", "มีหมายเหตุ", "ไม่มีหมายเหตุ"];
        return { sections, codes, amounts, notes };
    }, [controlSheetData, flatRows]);

    const filteredRows = useMemo(() => {
        const term = searchTerm.trim().toLowerCase();
        let result = flatRows.filter((row) => {
            const matchesSearch =
                term === "" ||
                row.sectionTitle.toLowerCase().includes(term) ||
                row.code.toLowerCase().includes(term) ||
                row.description.toLowerCase().includes(term) ||
                (row.note || "").toLowerCase().includes(term);

            const matchesSection =
                columnFilters.section === "ทั้งหมด" || row.sectionTitle === columnFilters.section;
            const matchesCode = columnFilters.code === "ทั้งหมด" || row.code === columnFilters.code;
            const matchesAmount =
                columnFilters.amount === "ทั้งหมด" ||
                (columnFilters.amount === "มีจำนวนเงิน" ? row.amount > 0 : row.amount <= 0);
            const matchesNote =
                columnFilters.note === "ทั้งหมด" ||
                (columnFilters.note === "มีหมายเหตุ"
                    ? Boolean((row.note || "").trim())
                    : !(row.note || "").trim());

            return matchesSearch && matchesSection && matchesCode && matchesAmount && matchesNote;
        });

        if (sortConfig.direction) {
            const dir = sortConfig.direction === "asc" ? 1 : -1;
            result = [...result].sort((a, b) => {
                switch (sortConfig.key) {
                    case "sectionTitle":
                        return a.sectionTitle.localeCompare(b.sectionTitle) * dir;
                    case "code":
                        return a.code.localeCompare(b.code) * dir;
                    case "description":
                        return a.description.localeCompare(b.description) * dir;
                    case "amount":
                        return (a.amount - b.amount) * dir;
                    case "note":
                        return (a.note || "").localeCompare(b.note || "") * dir;
                }
            });
        }

        return result;
    }, [flatRows, searchTerm, columnFilters, sortConfig]);

    const totalAmount = useMemo(() => {
        return filteredRows.reduce((sum, r) => sum + r.amount, 0);
    }, [filteredRows]);

    const isAnyFilterActive = useMemo(() => {
        return (
            searchTerm.trim() !== "" ||
            columnFilters.section !== "ทั้งหมด" ||
            columnFilters.code !== "ทั้งหมด" ||
            columnFilters.amount !== "ทั้งหมด" ||
            columnFilters.note !== "ทั้งหมด"
        );
    }, [searchTerm, columnFilters]);

    const clearFilters = () => {
        setSearchTerm("");
        setColumnFilters({ section: "ทั้งหมด", code: "ทั้งหมด", amount: "ทั้งหมด", note: "ทั้งหมด" });
        setOpenHeaderFilter(null);
        setFilterType("day");
        setSelectedDate("2024-12-05");
        setSelectedMonth("2024-12");
        setSelectedYear("2024");
    };

    const handleSort = (key: SortKey) => {
        setSortConfig((prev) => {
            if (prev.key === key) {
                if (prev.direction === "asc") return { key, direction: "desc" };
                if (prev.direction === "desc") return { key, direction: null };
                return { key, direction: "asc" };
            }
            return { key, direction: "asc" };
        });
    };

    const getSortIcon = (key: SortKey) => {
        if (sortConfig.key !== key || !sortConfig.direction) {
            return <ChevronsUpDown className="w-3 h-3 opacity-30" />;
        }
        return sortConfig.direction === "asc" ? (
            <ChevronUp className="w-3 h-3 text-emerald-500" />
        ) : (
            <ChevronDown className="w-3 h-3 text-emerald-500" />
        );
    };

    const HeaderCell = ({
        label,
        sortKey,
        filterKey,
        options,
        align = "left",
    }: {
        label: string;
        sortKey: SortKey;
        filterKey?: FilterKey;
        options?: string[];
        align?: "left" | "right" | "center";
    }) => {
        const justify =
            align === "right" ? "justify-end" : align === "center" ? "justify-center" : "justify-start";

        const currentValue = filterKey ? columnFilters[filterKey] : "ทั้งหมด";

        return (
            <th className={`px-6 py-4 ${align === "right" ? "text-right" : align === "center" ? "text-center" : ""}`}>
                <div className={`flex items-center gap-2 ${justify}`}>
                    <button
                        type="button"
                        onClick={() => handleSort(sortKey)}
                        className={`flex items-center gap-1.5 hover:text-gray-600 transition-colors ${
                            sortConfig.key === sortKey ? "text-emerald-600" : ""
                        }`}
                        aria-label={`เรียงข้อมูลคอลัมน์ ${label}`}
                    >
                        <span>{label}</span>
                        {getSortIcon(sortKey)}
                    </button>

                    {filterKey && options && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                const rect = (e.currentTarget as HTMLButtonElement).getBoundingClientRect();
                                setOpenHeaderFilter((prev) =>
                                    prev?.key === filterKey
                                        ? null
                                        : { key: filterKey, left: rect.left, top: rect.bottom + 8 }
                                );
                            }}
                            className={`p-1 rounded-md transition-all ${
                                currentValue !== "ทั้งหมด"
                                    ? "bg-emerald-500 text-white shadow-sm"
                                    : "hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-300"
                            }`}
                            aria-label={`ตัวกรองคอลัมน์ ${label}`}
                        >
                            <Filter className="w-3 h-3" />
                        </button>
                    )}
                </div>
            </th>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8 space-y-6">
            {/* Header */}
            <header className="mb-2">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                            <div className="p-2 bg-emerald-500 rounded-2xl shadow-lg shadow-emerald-500/20">
                                <FileSpreadsheet className="w-8 h-8 text-white" />
                            </div>
                            Control Sheet
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">
                            แสดงผลแบบตาราง (พร้อมกรอง/เรียงข้อมูลที่หัวคอลัมน์)
                        </p>
                    </div>
                </div>
            </header>

            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm"
                >
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl">
                            <Calendar className="w-6 h-6 text-emerald-500" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">งวดที่แสดง</p>
                            <p className="text-lg font-black text-gray-900 dark:text-white">{getDisplayDate()}</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm"
                >
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl">
                            <TrendingUp className="w-6 h-6 text-emerald-500" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">จำนวนรายการ</p>
                            <p className="text-2xl font-black text-gray-900 dark:text-white">{filteredRows.length}</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm"
                >
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl">
                            <DollarSign className="w-6 h-6 text-emerald-500" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">ยอดรวม</p>
                            <p className="text-2xl font-black text-gray-900 dark:text-white">
                                ฿{numberFormatter.format(totalAmount)}
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Filter Bar (match TankEntryBook) */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="ค้นหา: Section, รหัส, รายการ, หมายเหตุ..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900 dark:text-white font-medium"
                    />
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto flex-wrap justify-end">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-gray-400" />
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value as FilterType)}
                            className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 text-gray-800 dark:text-white transition-all duration-200 text-sm font-medium"
                        >
                            <option value="day">รายวัน</option>
                            <option value="month">รายเดือน</option>
                            <option value="year">รายปี</option>
                        </select>

                        {filterType === "day" && (
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 text-gray-800 dark:text-white transition-all duration-200 text-sm font-medium"
                            />
                        )}

                        {filterType === "month" && (
                            <input
                                type="month"
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(e.target.value)}
                                className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 text-gray-800 dark:text-white transition-all duration-200 text-sm font-medium"
                            />
                        )}

                        {filterType === "year" && (
                            <input
                                type="number"
                                min={2000}
                                max={2100}
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(e.target.value)}
                                className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 text-gray-800 dark:text-white transition-all duration-200 text-sm font-medium w-32"
                            />
                        )}
                    </div>

                    {isAnyFilterActive && (
                        <button
                            onClick={clearFilters}
                            className="px-4 py-3 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-2xl font-bold text-sm transition-colors flex items-center gap-2"
                        >
                            <X className="w-4 h-4" />
                            ล้างตัวกรอง
                        </button>
                    )}

                    <div className="flex items-center gap-2 px-4 py-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-2xl border border-emerald-100 dark:border-emerald-800/50 shrink-0">
                        <Filter className="w-4 h-4" />
                        <span className="text-sm font-bold whitespace-nowrap">แสดง {filteredRows.length} รายการ</span>
                    </div>
                </div>
            </div>

            {/* Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden"
            >
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 dark:bg-gray-900/50 text-[10px] uppercase tracking-widest font-black text-gray-400">
                                <HeaderCell
                                    label="Section"
                                    sortKey="sectionTitle"
                                    filterKey="section"
                                    options={filterOptions.sections}
                                />
                                <HeaderCell
                                    label="รหัส"
                                    sortKey="code"
                                    filterKey="code"
                                    options={filterOptions.codes}
                                    align="center"
                                />
                                <HeaderCell label="รายการ" sortKey="description" />
                                <HeaderCell
                                    label="จำนวนเงิน"
                                    sortKey="amount"
                                    filterKey="amount"
                                    options={filterOptions.amounts}
                                    align="right"
                                />
                                <HeaderCell
                                    label="หมายเหตุ"
                                    sortKey="note"
                                    filterKey="note"
                                    options={filterOptions.notes}
                                />
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRows.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                                        ไม่พบข้อมูลที่ตรงกับเงื่อนไข
                                    </td>
                                </tr>
                            ) : (
                                filteredRows.map((row, index) => (
                                    <motion.tr
                                        key={`${row.sectionIndex}-${row.entryIndex}`}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.25, delay: index * 0.01 }}
                                        className={`border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                                            index % 2 === 0 ? "bg-white dark:bg-gray-800" : "bg-gray-50/50 dark:bg-gray-900/30"
                                        }`}
                                    >
                                        <td className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                            {row.sectionTitle}
                                        </td>

                                        <td className="px-6 py-4 text-center whitespace-nowrap">
                                            {isEditing(row.sectionIndex, row.entryIndex, "code") ? (
                                                <input
                                                    type="text"
                                                    value={row.code}
                                                    onChange={(e) =>
                                                        handleCellUpdate(row.sectionIndex, row.entryIndex, "code", e.target.value)
                                                    }
                                                    onBlur={finishEditing}
                                                    onKeyDown={(e) => {
                                                        if (e.key === "Enter") finishEditing();
                                                        if (e.key === "Escape") finishEditing();
                                                    }}
                                                    autoFocus
                                                    className="w-28 px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 font-semibold text-gray-900 dark:text-white"
                                                />
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => startEditing(row.sectionIndex, row.entryIndex, "code")}
                                                    className="text-sm font-semibold text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700/50 px-3 py-1.5 rounded-xl"
                                                >
                                                    {row.code}
                                                </button>
                                            )}
                                        </td>

                                        <td className="px-6 py-4 text-sm font-semibold text-gray-800 dark:text-white">
                                            {isEditing(row.sectionIndex, row.entryIndex, "description") ? (
                                                <input
                                                    type="text"
                                                    value={row.description}
                                                    onChange={(e) =>
                                                        handleCellUpdate(
                                                            row.sectionIndex,
                                                            row.entryIndex,
                                                            "description",
                                                            e.target.value
                                                        )
                                                    }
                                                    onBlur={finishEditing}
                                                    onKeyDown={(e) => {
                                                        if (e.key === "Enter") finishEditing();
                                                        if (e.key === "Escape") finishEditing();
                                                    }}
                                                    autoFocus
                                                    className="w-full min-w-[260px] px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 font-semibold text-gray-900 dark:text-white"
                                                />
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => startEditing(row.sectionIndex, row.entryIndex, "description")}
                                                    className="text-left hover:bg-gray-100 dark:hover:bg-gray-700/50 px-3 py-1.5 rounded-xl"
                                                >
                                                    {row.description}
                                                </button>
                                            )}
                                        </td>

                                        <td className="px-6 py-4 text-right whitespace-nowrap">
                                            {isEditing(row.sectionIndex, row.entryIndex, "amount") ? (
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={row.amount}
                                                    onChange={(e) =>
                                                        handleCellUpdate(row.sectionIndex, row.entryIndex, "amount", e.target.value)
                                                    }
                                                    onBlur={finishEditing}
                                                    onKeyDown={(e) => {
                                                        if (e.key === "Enter") finishEditing();
                                                        if (e.key === "Escape") finishEditing();
                                                    }}
                                                    autoFocus
                                                    className="w-36 px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 font-semibold text-gray-900 dark:text-white text-right"
                                                />
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => startEditing(row.sectionIndex, row.entryIndex, "amount")}
                                                    className="text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 px-3 py-1.5 rounded-xl"
                                                >
                                                    {row.amount > 0 ? numberFormatter.format(row.amount) : "-"}
                                                </button>
                                            )}
                                        </td>

                                        <td className="px-6 py-4 text-xs text-gray-600 dark:text-gray-400">
                                            {isEditing(row.sectionIndex, row.entryIndex, "note") ? (
                                                <input
                                                    type="text"
                                                    value={row.note || ""}
                                                    onChange={(e) =>
                                                        handleCellUpdate(row.sectionIndex, row.entryIndex, "note", e.target.value)
                                                    }
                                                    onBlur={finishEditing}
                                                    onKeyDown={(e) => {
                                                        if (e.key === "Enter") finishEditing();
                                                        if (e.key === "Escape") finishEditing();
                                                    }}
                                                    autoFocus
                                                    className="w-full min-w-[220px] px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 text-gray-800 dark:text-gray-200"
                                                />
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => startEditing(row.sectionIndex, row.entryIndex, "note")}
                                                    className="text-left hover:bg-gray-100 dark:hover:bg-gray-700/50 px-3 py-1.5 rounded-xl"
                                                >
                                                    {(row.note || "").trim() ? row.note : "-"}
                                                </button>
                                            )}
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                        <tfoot>
                            <tr className="bg-gray-50/50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
                                <td colSpan={3} className="px-6 py-4 text-right font-black text-gray-500">
                                    รวม
                                </td>
                                <td className="px-6 py-4 text-right font-black text-gray-900 dark:text-white whitespace-nowrap">
                                    ฿{numberFormatter.format(totalAmount)}
                                </td>
                                <td className="px-6 py-4"></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </motion.div>

            {/* Header filter dropdown rendered fixed (avoid clipping) */}
            <AnimatePresence>
                {openHeaderFilter && (
                    <>
                        <button
                            type="button"
                            className="fixed inset-0 z-40 bg-transparent"
                            onClick={() => setOpenHeaderFilter(null)}
                            aria-label="ปิดตัวกรองหัวคอลัมน์"
                        />
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.98 }}
                            className="fixed z-50 w-72 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden"
                            style={{ left: openHeaderFilter.left, top: openHeaderFilter.top }}
                        >
                            {(
                                openHeaderFilter.key === "section"
                                    ? filterOptions.sections
                                    : openHeaderFilter.key === "code"
                                      ? filterOptions.codes
                                      : openHeaderFilter.key === "amount"
                                        ? filterOptions.amounts
                                        : filterOptions.notes
                            ).map((opt) => {
                                const current = columnFilters[openHeaderFilter.key];
                                return (
                                    <button
                                        key={opt}
                                        type="button"
                                        onClick={() => {
                                            setColumnFilters((prev) => ({ ...prev, [openHeaderFilter.key]: opt }));
                                            setOpenHeaderFilter(null);
                                        }}
                                        className={`w-full text-left px-4 py-3 text-sm font-bold transition-colors flex items-center justify-between ${
                                            current === opt
                                                ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400"
                                                : "text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                                        }`}
                                    >
                                        <span className="truncate">{opt}</span>
                                        {current === opt && <Check className="w-4 h-4" />}
                                    </button>
                                );
                            })}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
