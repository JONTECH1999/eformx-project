import { useState, useEffect } from "react"; // <-- import useEffect here!
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import SuperAdminDashboard from "./components/SuperAdminDashboard";

function App() {
  const [user, setUser] = useState(null); // store logged-in user info

  // Add useEffect to call your API once on mount:
  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/test')
      .then(res => res.json())
      .then(data => {
        console.log("API test response:", data); // { message: "API is working" }
      })
      .catch(err => {
        console.error("API test error:", err);
      });
  }, []); // <-- empty array = run once when App mounts

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