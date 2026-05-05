import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicOnlyRoute from "./components/PublicOnlyRoute";
import AuthPage from "./pages/auth/AuthPage";
import DashboardPage from "./pages/home/HomePage";
import BorrowersPage from "./pages/borrowers/BorrowersPage/BorrowersPage";
import AddBorrowerPage from "./pages/borrowers/AddBorrowerPage/AddBorrowerPage";
import BorrowerDetailsPage from "./pages/borrowers/BorrowerDetailsPage/BorrowerDetailsPage";
import MorePage from "./pages/more/MorePage";
import LoanPage from "./pages/loans/LoanPage";
import BorrowerLoansPage from "./pages/loans/BorrowerLoansPage";
import NewLoanPage from "./pages/add/NewLoanPage";
import FundManagementPage from "./pages/funds/FundManagementPage";
import ProfileOnboardingPage from "./pages/onboarding/ProfileOnboardingPage";
import CapitalOnboardingPage from "./pages/onboarding/CapitalOnboardingPage";
import AppLayout from "./components/layout/AppLayout";

function App() {
  return (
    <Routes>
      <Route element={<PublicOnlyRoute />}>
        <Route path="/auth" element={<AuthPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="/onboarding/profile" element={<ProfileOnboardingPage />} />
        <Route path="/onboarding/capital" element={<CapitalOnboardingPage />} />
        
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/borrowers" element={<BorrowersPage />} />
          <Route path="/borrowers/new" element={<AddBorrowerPage />} />
          <Route path="/borrowers/:id" element={<BorrowerDetailsPage />} />
          <Route path="/more" element={<MorePage />} />
          <Route path="/loans" element={<LoanPage />} />
          <Route path="/loans/borrowers/:borrowerId" element={<BorrowerLoansPage />} />
          <Route path="/add" element={<NewLoanPage />} />
          <Route path="/funds" element={<FundManagementPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/auth" replace />} />
    </Routes>
  );
}

export default App;
