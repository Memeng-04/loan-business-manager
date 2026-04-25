import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import type { WizardStepProps } from "../../../../types/wizardTypes";
import { useBorrowers } from "../../../../hooks/useBorrowers";
import { AlertCircle, User, Plus } from "lucide-react";
import { SummaryCard } from "../../SummaryCard";
import { InfoBox } from "../../InfoBox";
import Button from "../../../Button";
import SearchBar from "../../../search/SearchBar";
import LoadingState from "../../../LoadingState";
import styles from "./Step2Borrower.module.css";

/**
 * Step 2: Borrower Selection with Search
 * User selects a borrower from a searchable dropdown list. Selected borrower details are displayed in a card.
 * Search feature filters borrowers by name, phone, or address for easier lookup.
 */
export const Step2Borrower: React.FC<WizardStepProps> = ({
  state,
  updateState,
  isLoading,
}) => {
  const navigate = useNavigate();
  const {
    borrowers,
    loading: borrowersLoading,
    error: borrowersError,
  } = useBorrowers();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const selectedBorrower = borrowers.find((b) => b.id === state.borrowerId);

  // Filter borrowers based on search query
  const filteredBorrowers = useMemo(() => {
    if (!searchQuery.trim()) return borrowers;

    const query = searchQuery.toLowerCase();
    return borrowers.filter(
      (borrower) =>
        borrower.full_name.toLowerCase().includes(query) ||
        borrower.phone?.toLowerCase().includes(query) ||
        borrower.address?.toLowerCase().includes(query),
    );
  }, [borrowers, searchQuery]);

  const handleSelectBorrower = (borrowerId: string) => {
    updateState("borrowerId", borrowerId);
    setIsDropdownOpen(false);
    setSearchQuery("");
  };

  const isLoading_ = isLoading || borrowersLoading;

  return (
    <div className={styles.stepContainer}>
      {/* Error State */}
      {borrowersError && (
        <div className={styles.errorMessage}>
          <AlertCircle size={16} />
          {borrowersError}
        </div>
      )}

      {/* Loading State */}
      {isLoading_ && !selectedBorrower && (
        <LoadingState
          message="Fetching records..."
          variant="compact"
          className="mb-4"
        />
      )}

      {/* Borrower Section Header with Create Button */}
      <div className="mb-4 mt-[-0.5rem]">
        <Button
          onClick={() => navigate('/borrowers/new?from=wizard')}
          variant="outline"
          size="md"
          className="gap-2 w-full sm:w-auto"
        >
          <Plus size={16} />
          New Borrower
        </Button>
      </div>

      {/* Borrower Dropdown with Search */}
      <div className={styles.formGroup}>
        <label className={styles.label}>Borrower</label>
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            disabled={isLoading_}
            className={`${styles.borrowerDropdown} transition-all border-gray-200 shadow-sm`}
          >
            <span className={styles.borrowerDropdownText}>
              {selectedBorrower ? (
                <span className="text-main-blue font-bold">
                  {selectedBorrower.full_name}
                </span>
              ) : (
                <span className="text-gray-400">Select a borrower...</span>
              )}
            </span>
            <span
              className={`${styles.borrowerDropdownArrow} ${
                isDropdownOpen ? styles.open : ""
              } text-gray-400`}
            >
              ▼
            </span>
          </button>

          {/* Dropdown Menu with Search */}
          {isDropdownOpen && (
            <div
              className={`${styles.borrowerDropdownMenu} shadow-2xl border-gray-100 z-50`}
            >
              {/* Search Interface using shared SearchBar */}
              <div className="p-2 border-b border-gray-50">
                <SearchBar
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Search by name, phone..."
                  className="!shadow-none !border-none"
                />
              </div>

              {/* Borrowers List */}
              <div className={styles.borrowersList}>
                {filteredBorrowers.length === 0 ? (
                  <div className="p-8 text-center text-gray-400 text-sm font-medium">
                    {searchQuery
                      ? "No accounts match your search"
                      : "No accounts found"}
                  </div>
                ) : (
                  filteredBorrowers.map((borrower) => (
                    <button
                      key={borrower.id}
                      onClick={() => handleSelectBorrower(borrower.id!)}
                      className={`${styles.borrowerDropdownOption} ${
                        selectedBorrower?.id === borrower.id
                          ? styles.active
                          : ""
                      } hover:bg-blue-50/50 transition-colors group`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex flex-col items-start">
                          <span
                            className={`font-bold ${selectedBorrower?.id === borrower.id ? "text-main-blue" : "text-gray-900"}`}
                          >
                            {borrower.full_name}
                          </span>
                          {borrower.phone && (
                            <span className="text-[10px] text-gray-400 uppercase font-black tracking-tighter">
                              {borrower.phone}
                            </span>
                          )}
                        </div>
                        {selectedBorrower?.id === borrower.id && (
                          <div className="w-2 h-2 rounded-full bg-main-blue animate-pulse"></div>
                        )}
                      </div>
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
          title="Profile Snapshot"
          icon={<User size={18} />}
          items={[
            { label: "Name", value: selectedBorrower.full_name },
            ...(selectedBorrower.phone
              ? [{ label: "Phone", value: selectedBorrower.phone }]
              : []),
            ...(selectedBorrower.address
              ? [{ label: "Address", value: selectedBorrower.address }]
              : []),
          ]}
        />
      )}

      {/* Info Box */}
      <InfoBox icon={<AlertCircle size={16} className="text-main-blue" />}>
        Search by name or contact number. If the borrower is new, use the button
        above to add them to the collections database first.
      </InfoBox>
    </div>
  );
};
