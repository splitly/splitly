import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { LandingPage } from "@/pages/LandingPage";
import { Login } from "@/pages/Login";
import { Signup } from "@/pages/Signup";
import { Dashboard } from "@/pages/Dashboard";
import { GroupDetail } from "@/pages/GroupDetail";
import { AddExpense } from "@/pages/AddExpense";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { Toaster } from "sonner";

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* Protected Routes */}
          <Route path="/dashboard" element={<AuthGuard><Dashboard /></AuthGuard>} />
          <Route path="/groups/:id" element={<AuthGuard><GroupDetail /></AuthGuard>} />
          <Route path="/expense/new" element={<AuthGuard><AddExpense /></AuthGuard>} />
        </Routes>
      </Router>
      <Toaster position="top-center" theme="dark" />
    </>
  );
}

export default App;
