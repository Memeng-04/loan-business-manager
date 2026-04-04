import { useState } from "react";
import Header from "../components/header/Header";
import Navbar from "../components/navigation/Navbar";
import styles from "./styles/DashboardPage.module.css";

export default function DashboardPage() {
  const [isNavOpen, setIsNavOpen] = useState(false);

  return (
    <main className={styles.page}>
      <Header
        title="Dashboard"
        onMenuClick={() => setIsNavOpen((prev) => !prev)}
      />
      <Navbar isOpen={isNavOpen} />
      <section className={styles.content} />
    </main>
  );
}
