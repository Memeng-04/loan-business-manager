import React, { useState } from 'react'
import type { WizardStepProps } from '../../../types/wizardTypes'
import { useBorrowers } from '../../../hooks/useBorrowers'
import { AlertCircle, Lightbulb } from 'lucide-react'
import styles from './Step2Borrower.module.css'

/**
 * Step 2: Borrower Selection
 * User selects a borrower from a dropdown list. Selected borrower details are displayed in a card.
 * Styled with CSS modules for consistency with the new design system.
 */
export const Step2Borrower: React.FC<WizardStepProps> = ({
  state,
  updateState,
  isLoading
}) => {
  const { borrowers, loading: borrowersLoading, error: borrowersError } =
    useBorrowers()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const selectedBorrower = borrowers.find(b => b.id === state.borrowerId)

  const handleSelectBorrower = (borrowerId: string) => {
    updateState('borrowerId', borrowerId)
    setIsDropdownOpen(false)
  }

  const isLoading_ = isLoading || borrowersLoading

  return (
    <div className={styles.stepContainer}>
      {/* Section Title */}
      <div className={styles.sectionHeader}>
        <h3 className={styles.sectionTitle}>
          Select Borrower
        </h3>
        <p className={styles.sectionDescription}>
          Choose the borrower for this loan.
        </p>
      </div>

      {/* Error State */}
      {borrowersError && (
        <div className={styles.errorMessage}>
          ❌ {borrowersError}
        </div>
      )}

      {/* Loading State */}
      {isLoading_ && !selectedBorrower && (
        <div className={styles.loadingMessage}>
          <p>Loading borrowers...</p>
        </div>
      )}

      {/* Borrower Dropdown */}
      <div className={styles.formGroup}>
        <label className={styles.label}>Borrower</label>
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            disabled={isLoading_}
            className={styles.borrowerDropdown}
          >
            <span className={styles.borrowerDropdownText}>
              {selectedBorrower ? (
                <span style={{ color: '#012a6a', fontWeight: 500 }}>
                  {selectedBorrower.full_name}
                </span>
              ) : (
                <span className={styles.borrowerDropdownPlaceholder}>
                  Select a borrower...
                </span>
              )}
            </span>
            <span
              className={`${styles.borrowerDropdownArrow} ${
                isDropdownOpen ? styles.open : ''
              }`}
            >
              ▼
            </span>
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className={styles.borrowerDropdownMenu}>
              {borrowers.length === 0 ? (
                <div className={styles.borrowerDropdownEmpty}>
                  No borrowers found
                </div>
              ) : (
                borrowers.map(borrower => (
                  <button
                    key={borrower.id}
                    onClick={() => handleSelectBorrower(borrower.id!)}
                    className={`${styles.borrowerDropdownOption} ${
                      selectedBorrower?.id === borrower.id ? styles.active : ''
                    }`}
                  >
                    <div className={styles.borrowerDropdownOptionName}>
                      {borrower.full_name}
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Selected Borrower Details Card */}
      {selectedBorrower && (
        <div className={styles.detailsCard}>
          <h4 className={styles.detailsCardTitle}>Borrower Details</h4>
          <div className={styles.detailsItem}>
            <span className={styles.detailsLabel}>Name:</span>
            <span className={styles.detailsValue}>
              {selectedBorrower.full_name}
            </span>
          </div>
          {selectedBorrower.phone && (
            <div className={styles.detailsItem}>
              <span className={styles.detailsLabel}>Phone:</span>
              <span className={styles.detailsValue}>
                {selectedBorrower.phone}
              </span>
            </div>
          )}
          {selectedBorrower.address && (
            <div className={styles.detailsItem}>
              <span className={styles.detailsLabel}>Address:</span>
              <span className={styles.detailsValue}>
                {selectedBorrower.address}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Info Box */}
      <div className={styles.infoBox}>
        💡 Can't find the borrower? Create a new borrower in the Borrowers
        section first.
      </div>
    </div>
  )
}
