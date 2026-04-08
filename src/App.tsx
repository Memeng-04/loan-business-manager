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
import NewLoanPage from "./pages/add/NewLoanPage";
import ProfileOnboardingPage from "./pages/onboarding/ProfileOnboardingPage";
import CapitalOnboardingPage from "./pages/onboarding/CapitalOnboardingPage";
import { useEffect } from "react";
import { supabase } from "./services/supabase";
//something
function App() {
  useEffect(() => {
    const testConnection = async () => {
      try {
        const { data, error } = await supabase.from("borrowers").select("*");
        if (error) {
          console.error("Supabase connection failed:", error.message);
        } else {
          console.log("Supabase connection successful! Data found:", data);
        }
      } catch (err) {
        console.error("Unexpected error connecting to Supabase:", err);
      }
    };
    testConnection();
  }, []);

  return (
    <Routes>
      <Route element={<PublicOnlyRoute />}>
        <Route path="/auth" element={<AuthPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="/onboarding/profile" element={<ProfileOnboardingPage />} />
        <Route path="/onboarding/capital" element={<CapitalOnboardingPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/borrowers" element={<BorrowersPage />} />
        <Route path="/borrowers/new" element={<AddBorrowerPage />} />
        <Route path="/borrowers/:id" element={<BorrowerDetailsPage />} />
        <Route path="/more" element={<MorePage />} />
        <Route path="/loans" element={<LoanPage />} />
        <Route path="/add" element={<NewLoanPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/auth" replace />} />
    </Routes>
  );
}

export default App;
