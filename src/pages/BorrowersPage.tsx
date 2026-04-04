import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import Header from "../components/header/Header";
import Navbar from "../components/navigation/Navbar";
import { useBorrowers } from "../hooks/useBorrowers.ts";
import styles from "./styles/BorrowersPage.module.css";

export default function BorrowersPage() {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const navigate = useNavigate();
  const { borrowers, loading, error } = useBorrowers();

  return (
    <div className={styles.page}>
      <Header
        title="Borrowers"
        onMenuClick={() => setIsNavOpen((prev) => !prev)}
      />
      <Navbar isOpen={isNavOpen} onClose={() => setIsNavOpen(false)} />
      <main className={styles.content}>
        <section className={styles.container}>
          <div className={styles.topRow}>
            <Button
              variant="blue"
              size="md"
              className={styles.addButton}
              onClick={() => navigate("/borrowers/new")}
            >
            + Add
            </Button>
          </div>

          {loading ? (
            <p className={styles.stateText}>Loading borrowers...</p>
          ) : null}
          {error ? <p className={styles.errorText}>{error}</p> : null}

          {!loading && !error && borrowers.length === 0 ? (
            <p className={styles.stateText}>No borrowers yet.</p>
          ) : null}

          {!loading && !error && borrowers.length > 0 ? (
            <ul className={styles.list}>
              {borrowers.map((borrower) => (
                <li key={borrower.id} className={styles.card}>
                  <h2 className={styles.borrowerName}>{borrower.full_name}</h2>
                  {borrower.business_name ? (
                    <p className={styles.metaLine}>
                      Business: {borrower.business_name}
                    </p>
                  ) : null}
                  {borrower.address ? (
                    <p className={styles.metaLine}>
                      Address: {borrower.address}
                    </p>
                  ) : null}
                  {borrower.phone ? (
                    <p className={styles.metaLine}>Number: {borrower.phone}</p>
                  ) : null}
                  {borrower.notes ? (
                    <p className={styles.notesLine}>Notes: {borrower.notes}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      </main>
    </div>
  );
}
