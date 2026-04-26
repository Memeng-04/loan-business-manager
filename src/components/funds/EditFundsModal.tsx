import { useState, useEffect } from "react";
import Button from "../Button";
import { sanitizeNumber } from "../../utils/numberUtils";
import styles from "./EditFundsModal.module.css";

export type EditFundsFormData = {
  withdrawCapital: string;
  addCapital: string;
  withdrawProfit: string;
  addProfit: string;
};

interface EditFundsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: EditFundsFormData) => void;
  isSubmitting?: boolean;
}

export default function EditFundsModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
}: EditFundsModalProps) {
  const [formData, setFormData] = useState<EditFundsFormData>({
    withdrawCapital: "",
    addCapital: "",
    withdrawProfit: "",
    addProfit: "",
  });

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        withdrawCapital: "",
        addCapital: "",
        withdrawProfit: "",
        addProfit: "",
      });
    }
  }, [isOpen]);


  const handleInputChange = (field: keyof EditFundsFormData) => {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const sanitized = sanitizeNumber(e.target.value);
      setFormData((prev) => ({ ...prev, [field]: sanitized }));
    };
  };

  const handleSubmit = () => {
    onSubmit(formData);
  };

  const handleClose = () => {
    // Reset on manual close too
    setFormData({
      withdrawCapital: "",
      addCapital: "",
      withdrawProfit: "",
      addProfit: "",
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>Edit Funds</h2>
          <button className={styles.closeButton} onClick={handleClose} aria-label="Close modal">
            ✕
          </button>
        </div>

        <div className={styles.body}>
          <div className={styles.formGrid}>
            {(["withdrawCapital", "addCapital", "withdrawProfit", "addProfit"] as const).map(
              (field) => (
                <div key={field} className={styles.formField}>
                  <label className={styles.formLabel}>
                    {field === "withdrawCapital" && "Withdraw Capital"}
                    {field === "addCapital" && "Add Capital"}
                    {field === "withdrawProfit" && "Withdraw Profit"}
                    {field === "addProfit" && "Add Profit"}
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="0.00"
                    value={formData[field]}
                    onChange={handleInputChange(field)}
                    className={styles.formInput}
                  />
                </div>
              )
            )}
          </div>
        </div>

        <div className={styles.footer}>
          <Button variant="outline" size="md" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="blue" size="md" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}