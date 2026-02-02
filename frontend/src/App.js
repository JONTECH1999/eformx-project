import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import SuperAdminDashboard from "./components/SuperAdminDashboard";
import PublicFormPage from "./pages/PublicFormPage";
import authService from "./services/authService";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for stored authentication on mount
  useEffect(() => {
    const storedUser = authService.getCurrentUser();
    if (storedUser) {
      setUser(storedUser);
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
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
                <Dashboard userEmail={user.email} onLogout={handleLogout} />
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
