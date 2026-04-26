import { useState } from "react";
import type { FormEvent } from "react";
import Button from "../../Button";
import Card from "../../card/Card";
import FeedbackMessage from "../../feedback/FeedbackMessage";
import type { Borrower, CreateBorrowerInput } from "../../../types/borrowers";
import { sanitizeNumber } from "../../../utils/numberUtils";
import styles from "./BorrowerDetailCards.module.css";

type BorrowerInformationCardProps = {
  borrower: Borrower;
  createdDate: string;
  onSave: (input: CreateBorrowerInput) => Promise<boolean>;
  saving: boolean;
  saveError?: string | null;
};

function DataCell({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.dataCell}>
      <span className={styles.dataLabel}>{label}</span>
      <p className={styles.dataValue}>{value}</p>
    </div>
  );
}

export default function BorrowerInformationCard({
  borrower,
  createdDate,
  onSave,
  saving,
  saveError = null,
}: BorrowerInformationCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fullName, setFullName] = useState(borrower.full_name);
  const [address, setAddress] = useState(borrower.address ?? "");
  const [phone, setPhone] = useState(borrower.phone ?? "");
  const [email, setEmail] = useState(borrower.email ?? "");
  const [monthlyIncome, setMonthlyIncome] = useState(
    borrower.monthly_income ? String(borrower.monthly_income) : "",
  );
  const [sourceOfIncome, setSourceOfIncome] = useState(
    borrower.source_of_income ?? "",
  );
  const [secondaryContactName, setSecondaryContactName] = useState(
    borrower.secondary_contact_name ?? "",
  );
  const [secondaryContactNumber, setSecondaryContactNumber] = useState(
    borrower.secondary_contact_number ?? "",
  );

  function resetFormFromBorrower() {
    setFullName(borrower.full_name);
    setAddress(borrower.address ?? "");
    setPhone(borrower.phone ?? "");
    setEmail(borrower.email ?? "");
    setMonthlyIncome(
      borrower.monthly_income ? String(borrower.monthly_income) : "",
    );
    setSourceOfIncome(borrower.source_of_income ?? "");
    setSecondaryContactName(borrower.secondary_contact_name ?? "");
    setSecondaryContactNumber(borrower.secondary_contact_number ?? "");
    setFormError(null);
  }

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
    const trimmedSourceOfIncome = sourceOfIncome.trim();
    const trimmedSecondaryName = secondaryContactName.trim();
    const trimmedSecondaryNumber = secondaryContactNumber.trim();
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

    if (trimmedSecondaryName && !trimmedSecondaryNumber) {
      setFormError("Please provide secondary contact number.");
      return;
    }

    if (trimmedSecondaryNumber && !trimmedSecondaryName) {
      setFormError("Please provide secondary contact name.");
      return;
    }

    if (trimmedMonthlyIncome && Number.isNaN(Number(trimmedMonthlyIncome))) {
      setFormError("Monthly income must be a valid number.");
      return;
    }

    setFormError(null);

    const didSave = await onSave({
      full_name: trimmedName,
      address: trimmedAddress,
      phone: trimmedPhone,
      email: trimmedEmail,
      monthly_income: trimmedMonthlyIncome
        ? Number(trimmedMonthlyIncome)
        : undefined,
      source_of_income: trimmedSourceOfIncome,
      secondary_contact_name: trimmedSecondaryName,
      secondary_contact_number: trimmedSecondaryNumber,
    });

    if (didSave) {
      setIsEditing(false);
    }
  }

  return (
    <Card as="section" className={styles.infoCard}>
      <h3 className={styles.cardTitle}>INFORMATION</h3>

      {isEditing ? (
        <form className={styles.editForm} onSubmit={handleSubmit}>
          <div className={`${styles.infoSections} ${styles.editSections}`}>
            <section className={styles.sectionBlock}>
              <h4 className={styles.sectionHeading}>CONTACT INFO</h4>
              <div className={styles.sectionGrid}>
                <label className={styles.formField}>
                  <span className={styles.dataLabel}>Name</span>
                  <input
                    required
                    className={styles.formInput}
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                  />
                </label>

                <label className={styles.formField}>
                  <span className={styles.dataLabel}>Address</span>
                  <input
                    required
                    className={styles.formInput}
                    value={address}
                    onChange={(event) => setAddress(event.target.value)}
                  />
                </label>

                <label className={styles.formField}>
                  <span className={styles.dataLabel}>Phone</span>
                  <input
                    required
                    type="tel"
                    inputMode="numeric"
                    className={styles.formInput}
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                  />
                </label>

                <label className={styles.formField}>
                  <span className={styles.dataLabel}>Email</span>
                  <input
                    type="email"
                    className={styles.formInput}
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                  />
                </label>
              </div>
            </section>

            <section className={styles.sectionBlock}>
              <h4 className={styles.sectionHeading}>FINANCIAL PROFILE</h4>
              <div className={styles.sectionGrid}>
                <label className={styles.formField}>
                  <span className={styles.dataLabel}>Monthly Income</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    className={styles.formInput}
                    value={monthlyIncome}
                    onChange={(event) => setMonthlyIncome(sanitizeNumber(event.target.value))}
                  />
                </label>

                <label className={styles.formField}>
                  <span className={styles.dataLabel}>Source of Income</span>
                  <input
                    className={styles.formInput}
                    value={sourceOfIncome}
                    onChange={(event) => setSourceOfIncome(event.target.value)}
                  />
                </label>
              </div>
            </section>

            <section className={styles.sectionBlock}>
              <h4 className={styles.sectionHeading}>SECONDARY REFERENCE</h4>
              <div className={styles.sectionGrid}>
                <label className={styles.formField}>
                  <span className={styles.dataLabel}>Secondary Name</span>
                  <input
                    className={styles.formInput}
                    value={secondaryContactName}
                    onChange={(event) =>
                      setSecondaryContactName(event.target.value)
                    }
                  />
                </label>

                <label className={styles.formField}>
                  <span className={styles.dataLabel}>Secondary Contact</span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    className={styles.formInput}
                    value={secondaryContactNumber}
                    onChange={(event) =>
                      setSecondaryContactNumber(event.target.value)
                    }
                  />
                </label>
              </div>
            </section>
          </div>

          {formError ? <FeedbackMessage message={formError} /> : null}
          {!formError && saveError ? (
            <FeedbackMessage message={saveError} />
          ) : null}

          <div className={styles.editActions}>
            <Button
              variant="outline"
              size="md"
              type="button"
              className={`mt-0! ${styles.editActionButton}`}
              onClick={() => {
                resetFormFromBorrower();
                setIsEditing(false);
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="blue"
              size="md"
              className={`mt-0! ${styles.editActionButton}`}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      ) : (
        <>
          <div className={styles.infoSections}>
            <section className={styles.sectionBlock}>
              <h4 className={styles.sectionHeading}>CONTACT INFO</h4>
              <div className={styles.sectionGrid}>
                <DataCell
                  label="ADDRESS"
                  value={borrower.address ?? "Not provided"}
                />
                <DataCell
                  label="PHONE"
                  value={borrower.phone ?? "Not provided"}
                />
                <DataCell label="EMAIL" value={borrower.email ?? "No email"} />
                <DataCell label="CREATED AT" value={createdDate} />
              </div>
            </section>

            <section className={styles.sectionBlock}>
              <h4 className={styles.sectionHeading}>FINANCIAL PROFILE</h4>
              <div className={styles.sectionGrid}>
                <DataCell
                  label="MONTHLY INCOME"
                  value={
                    typeof borrower.monthly_income === "number"
                      ? new Intl.NumberFormat("en-PH", {
                          style: "currency",
                          currency: "PHP",
                          maximumFractionDigits: 0,
                        }).format(borrower.monthly_income)
                      : "Not provided"
                  }
                />
                <DataCell
                  label="SOURCE OF INCOME"
                  value={borrower.source_of_income ?? "Not provided"}
                />
              </div>
            </section>

            <section className={styles.sectionBlock}>
              <h4 className={styles.sectionHeading}>SECONDARY REFERENCE</h4>
              <div className={styles.sectionGrid}>
                <DataCell
                  label="SECONDARY NAME"
                  value={borrower.secondary_contact_name ?? "Not provided"}
                />
                <DataCell
                  label="SECONDARY CONTACT"
                  value={borrower.secondary_contact_number ?? "Not provided"}
                />
              </div>
            </section>
          </div>

          <Button
            variant="blue"
            size="md"
            className={`mt-0! ${styles.primaryAction}`}
            onClick={() => {
              resetFormFromBorrower();
              setIsEditing(true);
            }}
          >
            Edit Borrower details
          </Button>
        </>
      )}
    </Card>
  );
}
