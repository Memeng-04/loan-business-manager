import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import type { WizardStepProps } from '../../../types/wizardTypes'
import { useBorrowers } from '../../../hooks/useBorrowers'
import { AlertCircle, Lightbulb, Search, X, User, Plus } from 'lucide-react'
import { SummaryCard } from '../SummaryCard'
import { InfoBox } from '../InfoBox'
import Button from '../../Button'
import styles from './Step2Borrower.module.css'

/**
 * Step 2: Borrower Selection with Search
 * User selects a borrower from a searchable dropdown list. Selected borrower details are displayed in a card.
 * Search feature filters borrowers by name, phone, or address for easier lookup.
 */
export const Step2Borrower: React.FC<WizardStepProps> = ({
  state,
  updateState,
  isLoading
}) => {
  const navigate = useNavigate()
  const { borrowers, loading: borrowersLoading, error: borrowersError } =
    useBorrowers()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const selectedBorrower = borrowers.find(b => b.id === state.borrowerId)

  // Filter borrowers based on search query
  const filteredBorrowers = useMemo(() => {
    if (!searchQuery.trim()) return borrowers
    
    const query = searchQuery.toLowerCase()
    return borrowers.filter(borrower => 
      borrower.full_name.toLowerCase().includes(query) ||
      borrower.phone?.toLowerCase().includes(query) ||
      borrower.address?.toLowerCase().includes(query)
    )
  }, [borrowers, searchQuery])

  const handleSelectBorrower = (borrowerId: string) => {
    updateState('borrowerId', borrowerId)
    setIsDropdownOpen(false)
    setSearchQuery('')
  }

  const handleClearSearch = () => {
    setSearchQuery('')
  }

  const isLoading_ = isLoading || borrowersLoading

  return (
    <div className={styles.stepContainer}>
      {/* Error State */}
      {borrowersError && (
        <div className={styles.errorMessage}>
          <AlertCircle size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
          {borrowersError}
        </div>
      )}

      {/* Loading State */}
      {isLoading_ && !selectedBorrower && (
        <div className={styles.loadingMessage}>
          <p>Loading borrowers...</p>
        </div>
      )}

      {/* Borrower Section Header with Create Button */}
      <div style={{ marginBottom: '0.5rem', marginTop: '-0.5rem' }}>
        <Button
          onClick={() => navigate('/borrowers/new')}
          variant="outline"
          size="md"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Plus size={16} />
          Create Borrower
        </Button>
      </div>

      {/* Borrower Dropdown with Search */}
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

          {/* Dropdown Menu with Search */}
          {isDropdownOpen && (
            <div className={styles.borrowerDropdownMenu}>
              {/* Search Input */}
              <div className={styles.searchInputWrapper}>
                <Search size={16} className={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Search by name, phone, or address..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={styles.searchInput}
                  autoFocus
                />
                {searchQuery && (
                  <button
                    onClick={handleClearSearch}
                    className={styles.searchClearButton}
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {/* Borrowers List */}
              <div className={styles.borrowersList}>
                {filteredBorrowers.length === 0 ? (
                  <div className={styles.borrowerDropdownEmpty}>
                    {searchQuery ? 'No borrowers match your search' : 'No borrowers found'}
                  </div>
                ) : (
                  filteredBorrowers.map(borrower => (
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
                      {borrower.phone && (
                        <div className={styles.borrowerDropdownOptionPhone}>
                          {borrower.phone}
                        </div>
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Selected Borrower Details Card */}
      {selectedBorrower && (
        <SummaryCard
          title="Borrower Details"
          icon={<User size={18} />}
          items={[
            { label: 'Name:', value: selectedBorrower.full_name },
            ...(selectedBorrower.phone ? [{ label: 'Phone:', value: selectedBorrower.phone }] : []),
            ...(selectedBorrower.address ? [{ label: 'Address:', value: selectedBorrower.address }] : [])
          ]}
        />
      )}

      {/* Info Box */}
      <InfoBox icon={<Lightbulb size={16} />}>
        Use the search box to find a borrower by name, phone, or address. If the borrower doesn't exist, click the "Create Borrower" button below to add a new one.
      </InfoBox>
    </div>
  )
}
