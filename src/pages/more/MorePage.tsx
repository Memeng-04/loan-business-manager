import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/Button";
import FeedbackMessage from "../../components/feedback/FeedbackMessage";
import Header from "../../components/header/Header";
import Navbar from "../../components/navigation/Navbar";
import { useAuth } from "../../hooks/useAuth";
import styles from "./MorePage.module.css";

export default function MorePage() {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    setLogoutError(null);

    const { error } = await signOut();

    setIsLoggingOut(false);

    if (error) {
      setLogoutError(error);
      return;
    }

    navigate("/auth", { replace: true });
  };

  return (
    <main className={styles.page}>
      <Header title="More" onMenuClick={() => setIsNavOpen((prev) => !prev)} />
      <Navbar isOpen={isNavOpen} onClose={() => setIsNavOpen(false)} />

      <section className={styles.actionsSection}>
        {logoutError ? <FeedbackMessage message={logoutError} /> : null}

        <Button
          variant="outline"
          size="md"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className={styles.logoutButton}
        >
          {isLoggingOut ? "Logging out..." : "Log out"}
        </Button>
      </section>
    </main>
  );
}
