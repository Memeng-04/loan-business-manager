import { useState } from "react";
import type { FormEvent } from "react";
import Button from "../../Button";
import Card from "../../card/Card";
import FeedbackMessage from "../../feedback/FeedbackMessage";
import type { CreateBorrowerInput } from "../../../types/borrowers";
import styles from "./AddBorrowerForm.module.css";

type AddBorrowerFormProps = {
  onSubmit: (input: CreateBorrowerInput) => Promise<void> | void;
  onCancel: () => void;
  loading?: boolean;
  error?: string | null;
  initialValues?: Partial<CreateBorrowerInput>;
};

export default function AddBorrowerForm({
  onSubmit,
  onCancel,
  loading = false,
  error = null,
  initialValues,
}: AddBorrowerFormProps) {
  const [fullName, setFullName] = useState(initialValues?.full_name ?? "");
  const [email, setEmail] = useState(initialValues?.email ?? "");
  const [address, setAddress] = useState(initialValues?.address ?? "");
  const [phone, setPhone] = useState(initialValues?.phone ?? "");
  const [monthlyIncome, setMonthlyIncome] = useState(
    typeof initialValues?.monthly_income === "number"
      ? String(initialValues.monthly_income)
      : "",
  );
  const [sourceOfIncome, setSourceOfIncome] = useState(
    initialValues?.source_of_income ?? "",
  );
  const [secondaryContactNumber, setSecondaryContactNumber] = useState(
    initialValues?.secondary_contact_number ?? "",
  );
  const [secondaryContactName, setSecondaryContactName] = useState(
    initialValues?.secondary_contact_name ?? "",
  );
  const [formError, setFormError] = useState<string | null>(null);

  function isDigits(value: string) {
    return /^\d+$/.test(value);
  }

  function isValidEmail(value: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedName = fullName.trim();
    const trimmedAddress = address.trim();
    const trimmedPhone = phone.trim();
    const trimmedEmail = email.trim();
    const trimmedSecondaryNumber = secondaryContactNumber.trim();
    const trimmedSecondaryName = secondaryContactName.trim();
    const trimmedSourceOfIncome = sourceOfIncome.trim();
    const trimmedMonthlyIncome = monthlyIncome.trim();

    if (!trimmedName || !trimmedAddress || !trimmedPhone) {
      setFormError("Name, address, and phone number are required.");
      return;
    }

    if (
      !isDigits(trimmedPhone) ||
      trimmedPhone.length < 7 ||
      trimmedPhone.length > 15
    ) {
      setFormError("Phone number must be numeric and 7 to 15 digits long.");
      return;
    }

    if (trimmedEmail && !isValidEmail(trimmedEmail)) {
      setFormError("Please enter a valid email address.");
      return;
    }

    if (
      trimmedSecondaryNumber &&
      (!isDigits(trimmedSecondaryNumber) ||
        trimmedSecondaryNumber.length < 7 ||
        trimmedSecondaryNumber.length > 15)
    ) {
      setFormError(
        "Secondary contact number must be numeric and 7 to 15 digits long.",
      );
      return;
    }

    if (trimmedSecondaryNumber && !trimmedSecondaryName) {
      setFormError("Please provide the secondary contact name.");
      return;
    }

    if (!trimmedSecondaryNumber && trimmedSecondaryName) {
      setFormError("Please provide the secondary contact number.");
      return;
    }

    if (trimmedMonthlyIncome && Number.isNaN(Number(trimmedMonthlyIncome))) {
      setFormError("Monthly income must be a valid number.");
      return;
    }

    setFormError(null);

    await onSubmit({
      full_name: trimmedName,
      email: trimmedEmail,
      address: trimmedAddress,
      phone: trimmedPhone,
      monthly_income: trimmedMonthlyIncome
        ? Number(trimmedMonthlyIncome)
        : undefined,
      source_of_income: trimmedSourceOfIncome,
      secondary_contact_number: trimmedSecondaryNumber,
      secondary_contact_name: trimmedSecondaryName,
    });
  }

  return (
    <Card className={styles.formCard}>
      <h1 className={styles.title}>Borrower Details</h1>
      <p className={styles.description}>
        All fields marked with ✦ are required.
      </p>

      <form className={styles.form} onSubmit={handleSubmit}>
        <label className={styles.field}>
          <span className={styles.label}>✦ Name</span>
          <input
            required
            className={styles.input}
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            placeholder="Enter full name"
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>✦ Address</span>
          <input
            required
            className={styles.input}
            value={address}
            onChange={(event) => setAddress(event.target.value)}
            placeholder="Enter address"
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>✦ Phone Number</span>
          <input
            required
            inputMode="numeric"
            className={styles.input}
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="Enter contact number"
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Email </span>
          <input
            type="email"
            className={styles.input}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Enter email address"
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Monthly Income </span>
          <input
            inputMode="decimal"
            className={styles.input}
            value={monthlyIncome}
            onChange={(event) => setMonthlyIncome(event.target.value)}
            placeholder="Enter monthly income"
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Source of Income </span>
          <input
            className={styles.input}
            value={sourceOfIncome}
            onChange={(event) => setSourceOfIncome(event.target.value)}
            placeholder="e.g. Salary, Online business"
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Secondary Contact Number</span>
          <input
            inputMode="numeric"
            className={styles.input}
            value={secondaryContactNumber}
            onChange={(event) => setSecondaryContactNumber(event.target.value)}
            placeholder="Enter secondary contact number"
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Secondary Contact Name</span>
          <input
            className={styles.input}
            value={secondaryContactName}
            onChange={(event) => setSecondaryContactName(event.target.value)}
            placeholder="Enter secondary contact name"
          />
        </label>

        {formError ? <FeedbackMessage message={formError} /> : null}
        {!formError && error ? <FeedbackMessage message={error} /> : null}

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
    </Card>
  );
}
