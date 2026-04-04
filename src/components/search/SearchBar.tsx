import { Search } from "lucide-react";
import styles from "./SearchBar.module.css";

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
  placeholder = "Search",
  ariaLabel,
  className,
}: SearchBarProps) {
  return (
    <div className={`${styles.root} ${className ?? ""}`.trim()}>
      <Search className={styles.icon} size={18} aria-hidden="true" />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={styles.input}
        placeholder={placeholder}
        aria-label={ariaLabel ?? placeholder}
      />
    </div>
  );
}
