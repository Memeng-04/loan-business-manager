import { Search, X } from "lucide-react";

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  ariaLabel?: string;
  className?: string;
};

export default function SearchBar({
  value,
  onChange,
  placeholder = "Search...",
  ariaLabel,
  className = "",
}: SearchBarProps) {
  return (
    <div className={`relative group w-full ${className}`.trim()}>
      <div className="absolute inset-y-0 left-0 pl-1.5 flex items-center pointer-events-none">
        <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-transparent transition-colors group-focus-within:text-main-blue text-gray-400">
          <Search size={18} strokeWidth={2.5} />
        </div>
      </div>
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`w-full bg-gray-50/50 hover:bg-white focus:bg-white p-4 pl-12 pr-12 border-2 border-transparent hover:border-gray-200 focus:border-main-blue rounded-4xl shadow-sm focus:outline-none transition-all font-medium placeholder:text-gray-300 text-gray-900 ${className}`.trim()}
        placeholder={placeholder}
        aria-label={ariaLabel ?? placeholder}
      />

      {/* Search Progress/Clear Indicator */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
        {value && (
          <button
            onClick={() => onChange("")}
            className="p-2 rounded-xl bg-gray-100/50 hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all active:scale-90"
            type="button"
            aria-label="Clear search"
          >
            <X size={14} strokeWidth={3} />
          </button>
        )}
      </div>
    </div>
  );
}
