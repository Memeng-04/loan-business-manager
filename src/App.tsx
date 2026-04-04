import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicOnlyRoute from "./components/PublicOnlyRoute";
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/HomePage";
import BorrowersPage from "./pages/BorrowersPage";
import { useEffect } from 'react';
import { supabase } from './services/supabase';

function App() {
  useEffect(() => {
    const testConnection = async () => {
      try {
        const { data, error } = await supabase.from('borrowers').select('*');
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
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/borrowers" element={<BorrowersPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/auth" replace />} />
    </Routes>
  );
}

export default App;
