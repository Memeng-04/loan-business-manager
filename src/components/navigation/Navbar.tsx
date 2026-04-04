import styles from "./Navbar.module.css";

type NavbarProps = {
  isOpen: boolean;
};

export default function Navbar({ isOpen }: NavbarProps) {
  return (
    <>
      <aside
        aria-label="Desktop sidebar navigation"
        className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ""}`}
      />

      <footer
        aria-label="Mobile footer navigation"
        className={styles.mobileFooter}
      />
    </>
  );
}
