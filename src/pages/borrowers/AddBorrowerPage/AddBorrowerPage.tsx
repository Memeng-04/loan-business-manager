import { useNavigate, useSearchParams } from "react-router-dom";
import AddBorrowerForm from "../../../components/borrowers/AddBorrowerForm/AddBorrowerForm";


import { useCreateBorrower } from "../../../hooks/useCreateBorrower";
import type { CreateBorrowerInput } from "../../../types/borrowers";


export default function AddBorrowerPage() {
  const navigate = useNavigate();

  const { createBorrower, loading, error } = useCreateBorrower();

  const [searchParams] = useSearchParams();
  const isFromWizard = searchParams.get('from') === 'wizard';

  async function handleSubmit(input: CreateBorrowerInput) {
    const saved = await createBorrower(input);

    if (saved) {
      navigate(isFromWizard ? "/add" : "/borrowers");
    }
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F9F9F8] overflow-y-auto">
      <Header
        title="Add Borrower"
        onMenuClick={() => setIsNavOpen((prev: boolean) => !prev)}
      />
      <Navbar isOpen={isNavOpen} onClose={() => setIsNavOpen(false)} />

      <div className="max-w-4xl mx-auto p-8 w-full">
        <AddBorrowerForm
          loading={loading}
          error={error}
          onSubmit={handleSubmit}
          onCancel={() => navigate(isFromWizard ? "/add" : "/borrowers")}
        />
      </div>
    </div>
  );
}
