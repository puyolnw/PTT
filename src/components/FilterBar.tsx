import { Search } from "lucide-react";
import { useState } from "react";

interface FilterBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  filters?: {
    label: string;
    value: string;
    options: { label: string; value: string }[];
    onChange: (value: string) => void;
  }[];
}

export default function FilterBar({ placeholder = "ค้นหา...", onSearch, filters }: FilterBarProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    onSearch?.(value);
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
        <input
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 panel border border-app rounded-xl
                   text-app placeholder:text-slate-500
                   focus:outline-none focus:ring-2 focus:ring-ptt-blue focus:border-transparent
                   transition-all font-light"
        />
      </div>

      {/* Filter Dropdowns */}
      {filters && filters.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {filters.map((filter, index) => (
            <div key={index} className="flex items-center gap-2">
              <label className="text-sm text-muted whitespace-nowrap">{filter.label}:</label>
              <select
                value={filter.value}
                onChange={(e) => filter.onChange(e.target.value)}
                className="px-4 py-2.5 panel border border-app rounded-xl
                         text-app text-sm min-w-[150px]
                         focus:outline-none focus:ring-2 focus:ring-ptt-blue focus:border-transparent
                         transition-all cursor-pointer hover:border-white/20"
              >
                {filter.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

