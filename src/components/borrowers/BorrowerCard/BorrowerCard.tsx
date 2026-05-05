import type { Borrower } from "../../../types/borrowers";
import { Link } from "react-router-dom";
import { Calendar, MessageSquare, MoreVertical } from "lucide-react";

type BorrowerCardProps = {
  borrower: Borrower;
};

export default function BorrowerCard({ borrower }: BorrowerCardProps) {
  // Use created_at as mock date, or fallback
  const dateStr = borrower.created_at 
    ? new Date(borrower.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) 
    : 'No due date';

  // Active loans mock count
  const loansCount = borrower.phone ? '1' : '0';
  const chatCount = borrower.email ? '3' : '0';

  const summaryText = borrower.source_of_income 
    ? `Income source: ${borrower.source_of_income}` 
    : "Active repayment phase. Consistent payments observed.";

  const content = (
    <>
      <div className="flex justify-between items-start mb-3 gap-2">
        <h3 className="font-semibold text-gray-900 text-base leading-tight truncate">{borrower.full_name}</h3>
        <button className="text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 focus:outline-none">
          <MoreVertical size={18} />
        </button>
      </div>
      
      <p className="text-[13px] text-gray-500 leading-relaxed mb-5 line-clamp-2 min-h-[40px]">
        {summaryText}
      </p>

      <div className="flex items-center justify-between text-xs font-medium text-gray-500">
        <div className="flex items-center gap-1.5 border border-gray-200 bg-white rounded-md px-2 py-1 shadow-sm">
          <Calendar size={13} className="text-gray-400" />
          <span>{dateStr}</span>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <MessageSquare size={14} className="text-gray-400" />
            <span>{chatCount}</span>
          </div>
          <div className="flex items-center gap-1">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
              <line x1="12" y1="22.08" x2="12" y2="12"></line>
            </svg>
            <span>{loansCount}</span>
          </div>
        </div>
      </div>
    </>
  );

  if (!borrower.id) {
    return (
      <div className="block bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        {content}
      </div>
    );
  }

  return (
    <Link 
      to={`/borrowers/${borrower.id}`}
      className="block bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-[#012a6a] cursor-pointer"
    >
      {content}
    </Link>
  );
}
