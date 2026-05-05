import { useOutletContext } from "react-router-dom";
import { ArrowUpDown } from "lucide-react";
import { motion } from "framer-motion";
import LoadingState from "../../../components/ui/LoadingState.tsx";
import BorrowerCard from "../../../components/borrowers/BorrowerCard/BorrowerCard.tsx";
import { useBorrowers } from "../../../hooks/useBorrowers.ts";
import type { Borrower } from "../../../types/borrowers.ts";
import type { AppLayoutContext } from "../../../components/layout/AppLayout.tsx";

export default function BorrowersPage() {
  const { borrowers, loading, error } = useBorrowers();
  const { searchQuery } = useOutletContext<AppLayoutContext>();

  const normalizedQuery = searchQuery?.trim().toLowerCase() || "";
  const filteredBorrowers = borrowers.filter((borrower) => {
    if (!normalizedQuery) return true;
    return [
      borrower.full_name,
      borrower.email,
      borrower.address,
      borrower.phone,
    ]
      .filter(Boolean)
      .some((value) => value!.toLowerCase().includes(normalizedQuery));
  });

  // Distribute borrowers into columns for the Kanban UI showcase
  const columnsData: Record<string, Borrower[]> = {
    new: [],
    active: [],
    completed: [],
    flagged: []
  };

  filteredBorrowers.forEach((b, i) => {
    const hash = i % 4;
    if (hash === 0) columnsData.new.push(b);
    else if (hash === 1) columnsData.active.push(b);
    else if (hash === 2) columnsData.completed.push(b);
    else columnsData.flagged.push(b);
  });

  const columns = [
    { id: 'new', title: 'New Borrowers', items: columnsData.new },
    { id: 'active', title: 'Active Loans', items: columnsData.active },
    { id: 'completed', title: 'Completed', items: columnsData.completed },
    { id: 'flagged', title: 'Flagged', items: columnsData.flagged },
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F9F9F8]">
      {/* Loading / Error States */}
      {loading && (
        <div className="flex-1 flex items-center justify-center">
          <LoadingState message="Loading borrowers..." fullScreen={false} />
        </div>
      )}
      
      {!loading && error && (
        <div className="flex-1 flex items-center justify-center px-8">
          <LoadingState variant="error" message={error} fullScreen={false} />
        </div>
      )}

      {/* Kanban Board Area */}
      {!loading && !error && (
        <div className="flex-1 overflow-x-auto overflow-y-hidden px-8 pb-8 pt-4">
          <div className="flex gap-6 h-full min-w-max">
            {columns.map(col => (
              <div key={col.id} className="w-[320px] flex flex-col h-full">
                <div className="flex items-center justify-between mb-4 px-1">
                  <h2 className="font-semibold text-[1.05rem] text-gray-900">{col.title}</h2>
                  <div className="flex items-center gap-1 border border-gray-200 bg-white px-2 py-0.5 rounded-lg text-sm font-medium text-gray-600 shadow-sm">
                    <span>{col.items.length}</span>
                    <ArrowUpDown size={14} className="text-gray-400" />
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto pr-2 pb-4 flex flex-col gap-4 scrollbar-thin">
                  {col.items.length === 0 ? (
                    <div className="border-2 border-dashed border-gray-200 rounded-2xl h-24 flex items-center justify-center text-sm text-gray-400 font-medium">
                      Empty
                    </div>
                  ) : (
                    col.items.map(borrower => (
                      <motion.div 
                        key={borrower.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.2 }}
                      >
                        <BorrowerCard borrower={borrower} />
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
