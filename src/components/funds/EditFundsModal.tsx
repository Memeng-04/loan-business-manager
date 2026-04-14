import { useState } from "react";
import Button from "../Button";
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
}

export default function EditFundsModal({
  isOpen,
  onClose,
  onSubmit,
}: EditFundsModalProps) {
  const [formData, setFormData] = useState<EditFundsFormData>({
    withdrawCapital: "",
    addCapital: "",
    withdrawProfit: "",
    addProfit: "",
  });

  const handleInputChange = (field: keyof EditFundsFormData) => {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: e.target.value,
      }));
    };
  };

  const handleSubmit = () => {
    onSubmit(formData);
  };

  const handleClose = () => {
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
          <button
            className={styles.closeButton}
            onClick={handleClose}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        <div className={styles.body}>
          <div className={styles.formGrid}>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Withdraw Capital</label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={formData.withdrawCapital}
                onChange={handleInputChange("withdrawCapital")}
                className={styles.formInput}
              />
            </div>

            <div className={styles.formField}>
              <label className={styles.formLabel}>Add Capital</label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={formData.addCapital}
                onChange={handleInputChange("addCapital")}
                className={styles.formInput}
              />
            </div>

            <div className={styles.formField}>
              <label className={styles.formLabel}>Withdraw Profit</label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={formData.withdrawProfit}
                onChange={handleInputChange("withdrawProfit")}
                className={styles.formInput}
              />
            </div>

            <div className={styles.formField}>
              <label className={styles.formLabel}>Add Profit</label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={formData.addProfit}
                onChange={handleInputChange("addProfit")}
                className={styles.formInput}
              />
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <Button variant="outline" size="md" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="blue" size="md" onClick={handleSubmit}>
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
