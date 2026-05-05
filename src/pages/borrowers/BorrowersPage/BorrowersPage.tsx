import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, Home, ClipboardList, Users, Settings, Filter, ArrowUpDown, User } from "lucide-react";
import LoadingState from "../../../components/LoadingState.tsx";
import BorrowerCard from "../../../components/borrowers/BorrowerCard/BorrowerCard.tsx";
import { useBorrowers } from "../../../hooks/useBorrowers.ts";
import type { Borrower } from "../../../types/borrowers.ts";

export default function BorrowersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { borrowers, loading, error } = useBorrowers();

  const normalizedQuery = searchQuery.trim().toLowerCase();
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
    <div className="flex h-screen bg-[#F9F9F8] font-poppins text-gray-900 overflow-hidden">
      {/* Thin Sidebar (BizLink style - Icon Only) */}
      <aside className="w-[80px] border-r border-gray-200 bg-[#FDFCF8] flex flex-col items-center py-6 shrink-0 transition-all duration-300">
        <div className="font-bold text-2xl text-[#012a6a] mb-10 flex items-center justify-center">
          <div className="w-10 h-10 bg-[#012a6a] text-white rounded-[12px] flex items-center justify-center text-xl">L</div>
        </div>
        
        <nav className="flex flex-col gap-4 w-full px-3">
          <button 
            onClick={() => navigate('/dashboard')}
            className="flex items-center justify-center p-3 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-colors"
            title="Dashboard"
          >
            <Home size={22} />
          </button>
          <button 
            onClick={() => navigate('/loans')}
            className="flex items-center justify-center p-3 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-colors"
            title="Loans"
          >
            <ClipboardList size={22} />
          </button>
          
          {/* Active Customers/Borrowers link */}
          <button 
            className="flex items-center justify-center p-3 bg-white shadow-sm border border-gray-100 rounded-xl text-gray-900 transition-colors relative"
            title="Borrowers"
          >
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#012a6a] rounded-r-md" />
            <Users size={22} className="text-[#012a6a]" />
          </button>
          
          <button 
            onClick={() => navigate('/more')}
            className="flex items-center justify-center p-3 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-colors"
            title="Settings"
          >
            <Settings size={22} />
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#F9F9F8]">
        {/* Header */}
        <header className="h-24 flex items-center justify-between px-8 shrink-0">
          <div className="relative w-72 lg:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
            <input 
              type="text" 
              placeholder="Search borrower..." 
              className="w-full bg-transparent border-none focus:ring-0 pl-12 py-3 outline-none text-gray-700 font-medium placeholder:text-gray-400 placeholder:font-normal"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-700">
              <button className="flex items-center gap-2 hover:text-gray-900"><ArrowUpDown size={16}/> Sort by</button>
              <button className="flex items-center gap-2 hover:text-gray-900"><Filter size={16}/> Filters</button>
              <button className="flex items-center gap-2 hover:text-gray-900"><User size={16}/> Me</button>
            </div>
            <button 
              onClick={() => navigate("/borrowers/new")}
              className="bg-[#012a6a] text-white px-5 py-2.5 rounded-[14px] font-medium flex items-center gap-2 hover:bg-[#1f3ca8] transition-colors shadow-sm"
            >
              <Plus size={18} strokeWidth={2.5} /> Add Borrower
            </button>
          </div>
        </header>

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
          <div className="flex-1 overflow-x-auto overflow-y-hidden px-8 pb-8">
            <div className="flex gap-6 h-full min-w-max">
              {columns.map(col => (
                <div key={col.id} className="w-[320px] flex flex-col h-full">
                  <div className="flex items-center justify-between mb-4 px-1">
                    <h2 className="font-semibold text-[1.05rem] text-gray-900">{col.title}</h2>
                    <div className="flex items-center gap-1 border border-gray-200 bg-white px-2 py-0.5 rounded-lg text-sm font-medium text-gray-600">
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
                        <BorrowerCard key={borrower.id} borrower={borrower} />
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
