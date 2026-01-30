import { useState } from "react";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import SuperAdminDashboard from "./components/SuperAdminDashboard";

function App() {
  const [user, setUser] = useState(null); // store logged-in user info

  return (
    <>
      {!user ? (
        // Pass setUser to Login so it can set user on successful login
        <Login setUser={setUser} />
      ) : (
        // Decide dashboard based on role
        user.role === "Super Admin" ? (
          <SuperAdminDashboard superAdminProfile={user} />
        ) : (
          <Dashboard userEmail={user.email} />
        )
      )}
    </>
  );
}

export default App;
