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
        className={`
          w-full 
          bg-white 
          p-4 pl-12 pr-12 
          border-2 border-gray-300 
          hover:border-gray-400 
          focus:border-main-blue 
          rounded-4xl 
          shadow-sm 
          focus:outline-none 
          focus:ring-2 focus:ring-main-blue/20 
          transition-all 
          font-medium 
          placeholder:text-gray-400 
          text-gray-900
          ${className}
        `.trim()}
        placeholder={placeholder}
        aria-label={ariaLabel ?? placeholder}
      />

      {/* Search Progress/Clear Indicator */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
        {value && (
          <button
            onClick={() => onChange("")}
            className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-all active:scale-90"
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