import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AddBorrowerForm from "../../../components/borrowers/AddBorrowerForm/AddBorrowerForm";
import Header from "../../../components/header/Header";
import Navbar from "../../../components/navigation/Navbar";
import { useCreateBorrower } from "../../../hooks/useCreateBorrower";
import type { CreateBorrowerInput } from "../../../types/borrowers";
import styles from "./AddBorrowerPage.module.css";

export default function AddBorrowerPage() {
  const navigate = useNavigate();
  const [isNavOpen, setIsNavOpen] = useState(false);

  const { createBorrower, loading, error } = useCreateBorrower();

  async function handleSubmit(input: CreateBorrowerInput) {
    const saved = await createBorrower(input);

    if (saved) {
      navigate("/borrowers");
    }
  }

  return (
    <main className={styles.page}>
      <Header
        title="Add Borrower"
        onMenuClick={() => setIsNavOpen((prev) => !prev)}
      />
      <Navbar isOpen={isNavOpen} onClose={() => setIsNavOpen(false)} />

      <section className={styles.content}>
        <AddBorrowerForm
          loading={loading}
          error={error}
          onSubmit={handleSubmit}
          onCancel={() => navigate("/borrowers")}
        />
      </section>
    </main>
  );
}
