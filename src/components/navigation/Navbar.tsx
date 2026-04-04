import {
  BarChart3,
  ClipboardList,
  Home,
  PlusCircle,
  Users,
} from "lucide-react";
import styles from "./Navbar.module.css";

type NavbarProps = {
  isOpen: boolean;
};

const navItems = [
  { label: "Home", Icon: Home },
  { label: "Loans", Icon: ClipboardList },
  { label: "New", Icon: PlusCircle },
  { label: "Borrowers", Icon: Users },
  { label: "Reports", Icon: BarChart3 },
];

export default function Navbar({ isOpen }: NavbarProps) {
  return (
    <>
      <aside
        aria-label="Desktop sidebar navigation"
        className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ""}`}
      >
        <nav className={styles.sidebarNav}>
          {navItems.map((item) => (
            <button
              key={item.label}
              type="button"
              className={`${styles.navButton} ${item.label === "Home" ? styles.navButtonActive : ""}`}
            >
              <item.Icon className={styles.navIcon} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      <footer
        aria-label="Mobile footer navigation"
        className={styles.mobileFooter}
      >
        <nav className={styles.mobileNav}>
          {navItems.map((item) => (
            <button
              key={item.label}
              type="button"
              className={`${styles.mobileButton} ${item.label === "Home" ? styles.mobileButtonActive : ""}`}
            >
              <item.Icon className={styles.mobileIcon} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </footer>
    </>
  );
}
