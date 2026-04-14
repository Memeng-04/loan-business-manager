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
function App() {
  return (
    <Routes>
      <Route element={<PublicOnlyRoute />}>
        <Route path="/auth" element={<AuthPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
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
