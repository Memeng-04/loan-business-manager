import React, { useState } from 'react'
import type { WizardStepProps } from '../../../types/wizardTypes'
import type { Borrower } from '../../../types/borrowers'
import { useBorrowers } from '../../../hooks/useBorrowers'

/**
 * Step 2: Borrower Selection
 * User selects a borrower from a dropdown list. Selected borrower details are displayed in a card.
 * Next button is disabled until a borrower is selected.
 */
export const Step2Borrower: React.FC<WizardStepProps> = ({
  state,
  updateState,
  nextStep,
  prevStep,
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

  const canProceed = state.borrowerId && state.borrowerId.trim().length > 0

  const isLoading_ = isLoading || borrowersLoading

  return (
    <div className="p-6 flex flex-col gap-6">
      {/* Section Title */}
      <div>
        <h3 className="text-lg font-bold text-[#012a6a] mb-2">
          Select Borrower
        </h3>
        <p className="text-sm text-gray-600">
          Choose the borrower for this loan.
        </p>
      </div>

      {/* Error State */}
      {borrowersError && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-2xl">
          ❌ {borrowersError}
        </div>
      )}

      {/* Loading State */}
      {isLoading_ && !selectedBorrower && (
        <div className="text-center py-6">
          <p className="text-gray-500 text-sm">Loading borrowers...</p>
        </div>
      )}

      {/* Borrower Dropdown */}
      <div className="relative">
        <label className="block text-sm font-semibold text-[#012a6a] mb-2">
          Borrower
        </label>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          disabled={isLoading_}
          className={`w-full p-3 text-left border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#112bd6] transition ${
            isLoading_ ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'bg-white'
          } ${
            selectedBorrower
              ? 'text-[#012a6a] font-medium'
              : 'text-gray-500'
          }`}
        >
          <div className="flex items-center justify-between">
            <span>
              {selectedBorrower
                ? selectedBorrower.full_name
                : 'Select a borrower...'}
            </span>
            <span
              className={`transition transform ${
                isDropdownOpen ? 'rotate-180' : ''
              }`}
            >
              ▼
            </span>
          </div>
        </button>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-2xl shadow-lg z-10 max-h-60 overflow-y-auto">
            {borrowers.length === 0 ? (
              <div className="p-3 text-sm text-gray-500 text-center">
                No borrowers found
              </div>
            ) : (
              borrowers.map(borrower => (
                <button
                  key={borrower.id}
                  onClick={() => handleSelectBorrower(borrower.id!)}
                  className={`w-full text-left px-4 py-3 hover:bg-blue-50 transition border-b border-gray-100 last:border-b-0 ${
                    selectedBorrower?.id === borrower.id
                      ? 'bg-blue-50 border-l-4 border-l-[#112bd6]'
                      : ''
                  }`}
                >
                  <div className="font-medium text-[#012a6a]">
                    {borrower.full_name}
                  </div>
                  {borrower.business_name && (
                    <div className="text-xs text-gray-500">
                      {borrower.business_name}
                    </div>
                  )}
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* Selected Borrower Details Card */}
      {selectedBorrower && (
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-[#112bd6] rounded-2xl p-4">
          <h4 className="font-bold text-[#012a6a] mb-3">Borrower Details</h4>
          <div className="space-y-2">
            <div className="flex items-start gap-3">
              <span className="text-[#112bd6] font-bold min-w-fit">Name:</span>
              <span className="text-sm text-[#012a6a]">
                {selectedBorrower.full_name}
              </span>
            </div>
            {selectedBorrower.business_name && (
              <div className="flex items-start gap-3">
                <span className="text-[#112bd6] font-bold min-w-fit">
                  Business:
                </span>
                <span className="text-sm text-[#012a6a]">
                  {selectedBorrower.business_name}
                </span>
              </div>
            )}
            {selectedBorrower.phone && (
              <div className="flex items-start gap-3">
                <span className="text-[#112bd6] font-bold min-w-fit">
                  Phone:
                </span>
                <span className="text-sm text-[#012a6a]">
                  {selectedBorrower.phone}
                </span>
              </div>
            )}
            {selectedBorrower.address && (
              <div className="flex items-start gap-3">
                <span className="text-[#112bd6] font-bold min-w-fit">
                  Address:
                </span>
                <span className="text-sm text-[#012a6a]">
                  {selectedBorrower.address}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 border border-[#6db6fe] rounded-2xl p-4">
        <p className="text-xs text-[#012a6a] font-medium">
          💡 Can't find the borrower? Create a new borrower in the Borrowers
          section first.
        </p>
      </div>
    </div>
  )
}
