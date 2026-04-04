import { Menu } from "lucide-react";
import styles from "./Header.module.css";

type HeaderProps = {
  title: string;
  subtitle?: string;
};

export default function Header({ title, subtitle }: HeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <button
          type="button"
          aria-label="Open navigation menu"
          className={styles.menuButton}
        >
          <Menu className={styles.menuIcon} />
        </button>

        <div className={styles.textWrap}>
          <h1 className={styles.title}>{title}</h1>
          {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
        </div>
      </div>
    </header>
  );
}
