import { useState } from "react";
import type { FormEvent } from "react";
import Button from "../Button";
import type { CreateBorrowerInput } from "../../types/borrowers";
import styles from "./AddBorrowerForm.module.css";

type AddBorrowerFormProps = {
  onSubmit: (input: CreateBorrowerInput) => Promise<void> | void;
  onCancel: () => void;
  loading?: boolean;
  error?: string | null;
};

export default function AddBorrowerForm({
  onSubmit,
  onCancel,
  loading = false,
  error = null,
}: AddBorrowerFormProps) {
  const [fullName, setFullName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    await onSubmit({
      full_name: fullName.trim(),
      business_name: businessName.trim(),
      address: address.trim(),
      phone: phone.trim(),
      notes: notes.trim(),
    });
  }

  return (
    <div className={styles.formCard}>
      <h1 className={styles.title}>Borrower Details</h1>

      <form className={styles.form} onSubmit={handleSubmit}>
        <label className={styles.field}>
          <span className={styles.label}>Name</span>
          <input
            required
            className={styles.input}
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            placeholder="Enter full name"
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Business Name (optional)</span>
          <input
            className={styles.input}
            value={businessName}
            onChange={(event) => setBusinessName(event.target.value)}
            placeholder="Enter business name"
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Address (optional)</span>
          <input
            className={styles.input}
            value={address}
            onChange={(event) => setAddress(event.target.value)}
            placeholder="Enter address"
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Number</span>
          <input
            required
            className={styles.input}
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="Enter contact number"
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Notes (optional)</span>
          <textarea
            className={styles.textarea}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Any notes"
            rows={4}
          />
        </label>

        {error ? <p className={styles.errorText}>{error}</p> : null}

        <div className={styles.actions}>
          <Button
            variant="outline"
            size="md"
            className={styles.secondaryButton}
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="blue"
            size="md"
            className={styles.primaryButton}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save"}
          </Button>
        </div>
      </form>
    </div>
  );
}
