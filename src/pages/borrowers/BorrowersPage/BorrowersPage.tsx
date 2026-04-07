import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../../components/Button.tsx";
import LoadingState from "../../../components/LoadingState.tsx";
import SearchBar from "../../../components/search/SearchBar.tsx";
import BorrowerCard from "../../../components/borrowers/BorrowerCard/BorrowerCard.tsx";
import Header from "../../../components/header/Header.tsx";
import Navbar from "../../../components/navigation/Navbar.tsx";
import { useBorrowers } from "../../../hooks/useBorrowers.ts";
import styles from "./BorrowersPage.module.css";

export default function BorrowersPage() {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { borrowers, loading, error } = useBorrowers();

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredBorrowers = borrowers.filter((borrower) => {
    if (!normalizedQuery) {
      return true;
    }

    return [
      borrower.full_name,
      borrower.email,
      borrower.address,
      borrower.phone,
      borrower.notes,
    ]
      .filter(Boolean)
      .some((value) => value!.toLowerCase().includes(normalizedQuery));
  });

  return (
    <div className={styles.page}>
      <Header
        title="Borrowers"
        onMenuClick={() => setIsNavOpen((prev) => !prev)}
      />
      <Navbar isOpen={isNavOpen} onClose={() => setIsNavOpen(false)} />

      {loading ? (
        <main className={styles.content}>
          <section className={styles.loadingContainer}>
            <LoadingState message="Loading borrowers..." fullScreen={false} />
          </section>
        </main>
      ) : null}

      {!loading ? (
        <main className={styles.content}>
          <section className={styles.container}>
            <div className={styles.topRow}>
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search borrowers"
              />
              <Button
                variant="blue"
                size="md"
                className={styles.addButton}
                onClick={() => navigate("/borrowers/new")}
              >
                + Add
              </Button>
            </div>

            {error ? <p className={styles.errorText}>{error}</p> : null}

            {!loading && !error && borrowers.length === 0 ? (
              <p className={styles.stateText}>No borrowers yet.</p>
            ) : null}

            {!loading &&
            !error &&
            borrowers.length > 0 &&
            filteredBorrowers.length === 0 ? (
              <p className={styles.stateText}>
                No borrowers match your search.
              </p>
            ) : null}

            {!loading && !error && filteredBorrowers.length > 0 ? (
              <ul className={styles.list}>
                {filteredBorrowers.map((borrower) => (
                  <BorrowerCard key={borrower.id} borrower={borrower} />
                ))}
              </ul>
            ) : null}
          </section>
        </main>
      ) : null}
    </div>
  );
}
