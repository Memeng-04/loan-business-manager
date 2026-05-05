import { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Search, Plus, Home, ClipboardList, Users, Settings, Filter, ArrowUpDown, User } from "lucide-react";
import { motion } from "framer-motion";

export type AppLayoutContext = {
  searchQuery: string;
};

export default function AppLayout() {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const getPrimaryAction = () => {
    if (location.pathname.startsWith("/loans")) {
      return { label: "Add Loan", path: "/add" };
    }
    if (location.pathname.startsWith("/dashboard")) {
      return null;
    }
    return { label: "Add Borrower", path: "/borrowers/new" };
  };

  const action = getPrimaryAction();

  const getPlaceholder = () => {
    if (location.pathname.startsWith("/loans")) return "Search loans...";
    if (location.pathname.startsWith("/dashboard")) return "Search...";
    return "Search borrower...";
  };

  return (
    <div className="flex h-screen bg-[#F9F9F8] font-poppins text-gray-900 overflow-hidden">
      {/* Thin Sidebar (BizLink style - Icon Only) */}
      <aside className="w-[80px] border-r border-gray-200 bg-[#FDFCF8] flex flex-col items-center py-6 shrink-0 transition-all duration-300 z-10">
        <div className="font-bold text-2xl text-[#012a6a] mb-10 flex items-center justify-center">
          <div className="w-10 h-10 bg-[#012a6a] text-white rounded-[12px] flex items-center justify-center text-xl shadow-sm">L</div>
        </div>
        
        <nav className="flex flex-col gap-4 w-full px-3">
          <button 
            onClick={() => navigate('/dashboard')}
            className={`flex items-center justify-center p-3 rounded-xl transition-colors relative ${
              location.pathname.startsWith('/dashboard') 
                ? 'bg-white shadow-sm border border-gray-100 text-gray-900' 
                : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50'
            }`}
            title="Dashboard"
          >
            {location.pathname.startsWith('/dashboard') && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#012a6a] rounded-r-md" />}
            <Home size={22} className={location.pathname.startsWith('/dashboard') ? "text-[#012a6a]" : ""} />
          </button>
          
          <button 
            onClick={() => navigate('/loans')}
            className={`flex items-center justify-center p-3 rounded-xl transition-colors relative ${
              location.pathname.startsWith('/loans') 
                ? 'bg-white shadow-sm border border-gray-100 text-gray-900' 
                : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50'
            }`}
            title="Loans"
          >
            {location.pathname.startsWith('/loans') && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#012a6a] rounded-r-md" />}
            <ClipboardList size={22} className={location.pathname.startsWith('/loans') ? "text-[#012a6a]" : ""} />
          </button>
          
          <button 
            onClick={() => navigate('/borrowers')}
            className={`flex items-center justify-center p-3 rounded-xl transition-colors relative ${
              location.pathname.startsWith('/borrowers') 
                ? 'bg-white shadow-sm border border-gray-100 text-gray-900' 
                : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50'
            }`}
            title="Borrowers"
          >
            {location.pathname.startsWith('/borrowers') && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#012a6a] rounded-r-md" />}
            <Users size={22} className={location.pathname.startsWith('/borrowers') ? "text-[#012a6a]" : ""} />
          </button>
          
          <button 
            onClick={() => navigate('/more')}
            className={`flex items-center justify-center p-3 rounded-xl transition-colors relative ${
              location.pathname.startsWith('/more') 
                ? 'bg-white shadow-sm border border-gray-100 text-gray-900' 
                : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50'
            }`}
            title="Settings"
          >
            {location.pathname.startsWith('/more') && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#012a6a] rounded-r-md" />}
            <Settings size={22} className={location.pathname.startsWith('/more') ? "text-[#012a6a]" : ""} />
          </button>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#F9F9F8]">
        {/* Global Header */}
        <header className="h-24 flex items-center justify-between px-8 shrink-0 z-10">
          <div className="relative w-72 lg:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
            <input 
              type="text" 
              placeholder={getPlaceholder()}
              className="w-full bg-transparent border-none focus:ring-0 pl-12 py-3 outline-none text-gray-700 font-medium placeholder:text-gray-400 placeholder:font-normal"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-700">
              <button className="flex items-center gap-2 hover:text-gray-900 transition-colors"><ArrowUpDown size={16}/> Sort by</button>
              <button className="flex items-center gap-2 hover:text-gray-900 transition-colors"><Filter size={16}/> Filters</button>
              <button className="flex items-center gap-2 hover:text-gray-900 transition-colors"><User size={16}/> Me</button>
            </div>
            {action && (
              <button 
                onClick={() => navigate(action.path)}
                className="bg-[#012a6a] text-white px-5 py-2.5 rounded-[14px] font-medium flex items-center gap-2 hover:bg-[#1f3ca8] transition-colors shadow-sm"
              >
                <Plus size={18} strokeWidth={2.5} /> {action.label}
              </button>
            )}
          </div>
        </header>

        {/* Page Content with Animation */}
        <div className="flex-1 relative overflow-hidden">
          <motion.main 
            key={location.pathname}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="absolute inset-0 overflow-y-auto overflow-x-hidden flex flex-col"
          >
            <Outlet context={{ searchQuery } satisfies AppLayoutContext} />
          </motion.main>
        </div>
      </div>
    </div>
  );
}
