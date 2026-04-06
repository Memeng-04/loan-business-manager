import { useState } from "react";
import Header from "../../components/header/Header";
import Navbar from "../../components/navigation/Navbar";
import styles from "./LoanPage.module.css";

export default function LoanPage() {
  const [isNavOpen, setIsNavOpen] = useState(false);

  return (
    <main className={styles.page}>
      <Header title="Loans" onMenuClick={() => setIsNavOpen((prev) => !prev)} />
      <Navbar isOpen={isNavOpen} onClose={() => setIsNavOpen(false)} />

    </main>
  );
}
