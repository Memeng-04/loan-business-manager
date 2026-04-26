import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../../components/ui/card/Card';
import { User, ChevronRight, Phone } from 'lucide-react';
import SearchBar from '../../../components/ui/search/SearchBar';
import LoadingState from '../../../components/ui/LoadingState';

interface BorrowerListProps {
  borrowers: any[];
  loading: boolean;
}

export default function BorrowerList({ borrowers, loading }: BorrowerListProps) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  // Filter borrowers based on search query
  const filteredBorrowers = useMemo(() => {
    if (!searchQuery.trim()) return borrowers;
    const lowerQuery = searchQuery.toLowerCase();
    return borrowers.filter(b => 
      b.full_name?.toLowerCase().includes(lowerQuery) || 
      b.phone?.includes(lowerQuery)
    );
  }, [borrowers, searchQuery]);

  if (loading) {
    return (
      <LoadingState message="Synchronizing collections database..." />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Search Header */}
      <SearchBar 
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search collections database..."
      />

      {filteredBorrowers.length === 0 ? (
        <Card padding="lg" variant="subtle" className="border-dashed border-2 bg-gray-50/30 text-center py-20 flex flex-col items-center gap-4">
          <div className="p-4 bg-white rounded-full shadow-sm text-gray-200">
             <User size={32} />
          </div>
          <div>
            <p className="text-gray-800 font-bold">No results found</p>
            <p className="text-gray-400 text-sm mt-1">We couldn't find any borrowers matching "{searchQuery}"</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 px-1">Master Records ({filteredBorrowers.length})</h3>
          {filteredBorrowers.map((borrower) => (
            <Card 
              key={borrower.id}
              interactive
              padding="none"
              onClick={() => navigate(`/loans/borrowers/${borrower.id}`)}
              className="group overflow-hidden border border-gray-100/60 hover:border-main-blue/30 active:scale-[0.99] transition-all bg-white"
            >
              <div className="flex items-center p-4 sm:p-5">
                {/* Avatar Icon */}
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-main-blue group-hover:bg-main-blue group-hover:text-white transition-colors">
                  <User size={22} />
                </div>

                {/* Info */}
                <div className="ml-4 flex-1">
                  <h4 className="font-bold text-gray-900 group-hover:text-main-blue transition-colors truncate">{borrower.full_name}</h4>
                  <div className="flex items-center gap-3 text-xs font-medium text-gray-500 mt-1">
                    <span className="flex items-center gap-1"><Phone size={12} className="text-gray-300" /> {borrower.phone}</span>
                    <span className="w-1 h-1 rounded-full bg-gray-200"></span>
                    <span className="text-blue-600/60 font-bold uppercase tracking-tighter">View Account</span>
                  </div>
                </div>

                {/* Action Icon */}
                <div className="text-gray-200 group-hover:text-main-blue transition-colors">
                  <ChevronRight size={20} />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
