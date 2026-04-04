import { Menu } from "lucide-react";
import lendHorizontal from "../../assets/icons/192x192/lend-horizontal.png";
import styles from "./Header.module.css";

type HeaderProps = {
  title: string;
  onMenuClick?: () => void;
};

export default function Header({ title, onMenuClick }: HeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <button
          type="button"
          aria-label="Open navigation menu"
          className={styles.menuButton}
          onClick={onMenuClick}
        >
          <Menu className={styles.menuIcon} />
        </button>

        <div className={styles.textWrap}>
          <h1 className={styles.title}>{title}</h1>
        </div>

        <img src={lendHorizontal} alt="LEND" className={styles.logo} />
      </div>
    </header>
  );
}
