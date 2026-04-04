import { useState } from "react";
import Header from "../components/header/Header";
import Navbar from "../components/navigation/Navbar";
import styles from "./styles/HomePage.module.css";

export default function BorrowersPage() {
  const [isNavOpen, setIsNavOpen] = useState(false);

  return (
    <div className={styles.page}>
      <Header title="Borrowers" onMenuClick={() => setIsNavOpen((prev) => !prev)} />
      <Navbar isOpen={isNavOpen} />
      <main className={styles.content}>
        {/* Borrowers content will go here */}
      </main>
    </div>
  );
}
