import styles from './ConfirmLoanModal.module.css'
import Button from '../Button'

interface ConfirmLoanModalProps {
  isOpen: boolean
  borrowerName?: string
  paymentAmount?: string
  frequency?: string
  onConfirm: () => void
  onCancel: () => void
  isLoading?: boolean
}

/**
 * Confirmation modal shown before a loan is created.
 * Gives the user a final chance to review key terms and back out.
 */
export const ConfirmLoanModal = ({
  isOpen,
  borrowerName,
  paymentAmount,
  frequency,
  onConfirm,
  onCancel,
  isLoading = false,
}: ConfirmLoanModalProps) => {
  if (!isOpen) return null

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="modal-title">
      {/* Backdrop */}
      <div className={styles.backdrop} onClick={!isLoading ? onCancel : undefined} />

      {/* Modal Panel */}
      <div className={styles.panel}>
        {/* Icon */}
        <div className={styles.iconWrapper}>
          <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        {/* Content */}
        <h2 id="modal-title" className={styles.title}>Create this loan?</h2>
        <p className={styles.subtitle}>
          You're about to create a loan
          {borrowerName ? <> for <strong>{borrowerName}</strong></> : ''}.
          Once created, this cannot be undone.
        </p>

        {/* Key terms recap */}
        {paymentAmount && frequency && (
          <div className={styles.termsPill}>
            <span className={styles.termsLabel}>Payment per {frequency === 'bi-monthly' ? 'payout' : frequency}</span>
            <span className={styles.termsValue}>₱{paymentAmount}</span>
          </div>
        )}

        {/* Actions */}
        <div className={styles.actions}>
          <Button
            onClick={onCancel}
            disabled={isLoading}
            variant="outline"
            size="lg"
            className={styles.cancelBtn}
          >
            Back
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            variant="blue"
            size="lg"
            className={styles.confirmBtn}
          >
            {isLoading ? (
              <span className={styles.loadingRow}>
                <span className={styles.spinner} />
                Creating...
              </span>
            ) : (
              'Create'
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
