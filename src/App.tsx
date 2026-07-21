import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { LandingPage } from "@/pages/LandingPage";
import { Login } from "@/pages/Login";
import { Signup } from "@/pages/Signup";
import { Dashboard } from "@/pages/Dashboard";
import { GroupDetail } from "@/pages/GroupDetail";
import { AddExpense } from "@/pages/AddExpense";
import { Expenses } from "@/pages/Expenses";
import { Activity } from "@/pages/Activity";
import { Analytics } from "@/pages/Analytics";
import { Settings } from "@/pages/Settings";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { AppLayout } from "@/components/layout/AppLayout";
import { Toaster } from "sonner";

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* Protected Routes without Layout */}
          <Route path="/groups/:id" element={<AuthGuard><GroupDetail /></AuthGuard>} />
          <Route path="/expense/new" element={<AuthGuard><AddExpense /></AuthGuard>} />
          
          {/* Protected Routes WITH Layout */}
          <Route element={<AuthGuard><AppLayout /></AuthGuard>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/activity" element={<Activity />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
          
          {/* Redirects */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
      <Toaster position="top-center" theme="dark" />
    </>
  );
}

export default App;
