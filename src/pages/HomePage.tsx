import { useState } from "react";
import Header from "../components/header/Header";
import Navbar from "../components/navigation/Navbar";
import styles from "./styles/HomePage.module.css";

export default function HomePage() {
  const [isNavOpen, setIsNavOpen] = useState(false);

  return (
    <main className={styles.page}>
      <Header
        title="Home"
        onMenuClick={() => setIsNavOpen((prev) => !prev)}
      />
      <Navbar isOpen={isNavOpen} />
      <section className={styles.content} />
    </main>
  );
}
