import {
  ClipboardList,
  Home,
  PlusCircle,
  Users,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "./Navbar.module.css";

type NavbarProps = {
  isOpen: boolean;
  onClose?: () => void;
};

const navItems = [
  { label: "Home", Icon: Home, path: "/dashboard" },
  { label: "Loans", Icon: ClipboardList, path: "/loans" },
  { label: "New", Icon: PlusCircle, path: "/new" },
  { label: "Borrowers", Icon: Users, path: "/borrowers" },
];

export default function Navbar({ isOpen, onClose }: NavbarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === "/borrowers") {
      return location.pathname.startsWith("/borrowers");
    }

    return location.pathname === path;
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    onClose?.();
  };

  return (
    <>
      <button
        type="button"
        aria-label="Close sidebar"
        onClick={onClose}
        className={`${styles.backdrop} ${isOpen ? styles.backdropOpen : ""}`}
      />

      <aside
        aria-label="Desktop sidebar navigation"
        className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ""}`}
      >
        <nav className={styles.sidebarNav}>
          {navItems.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => handleNavigate(item.path)}
              className={`${styles.navButton} ${isActive(item.path) ? styles.navButtonActive : ""}`}
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
              onClick={() => handleNavigate(item.path)}
              className={`${styles.mobileButton} ${isActive(item.path) ? styles.mobileButtonActive : ""}`}
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
