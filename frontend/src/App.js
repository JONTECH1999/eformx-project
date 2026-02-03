import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import SuperAdminDashboard from "./components/SuperAdminDashboard";
import PublicFormPage from "./pages/PublicFormPage";
import authService from "./services/authService";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for stored authentication on mount
  useEffect(() => {
    try {
      const storedUser = authService.getCurrentUser();
      if (storedUser) {
        setUser(storedUser);
      }
    } catch (e) {
      console.error("Auth init error:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleLogout = async () => {
    await authService.logout();
    setUser(null);
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
      }}>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public Form Route - Accessible by anyone */}
        <Route path="/form/:id" element={<PublicFormPage />} />
        {/* Password reset routes */}
        <Route path="/forgot" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Auth Routes */}
        <Route
          path="/"
          element={
            !user ? (
              <Login setUser={setUser} />
            ) : (
              user.role === "Super Admin" ? (
                <SuperAdminDashboard superAdminProfile={user} onLogout={handleLogout} />
              ) : (
                <Dashboard userEmail={user.email} userName={user.name} onLogout={handleLogout} />
              )
            )
          }
        />

        {/* Redirect unknown routes to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;


