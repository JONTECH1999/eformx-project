 import { useState } from "react";
import Login from "./components/Login";
import Register from "./components/Register";
import ForgotPassword from "./components/ForgotPassword";
import Dashboard from "./components/Dashboard";

function App() {
  const [page, setPage] = useState("dashboard"); // for testing

  return (
    <>
      {page === "login" && (
        <Login
          goRegister={() => setPage("register")}
          goForgot={() => setPage("forgot")}
          goDashboard={() => setPage("dashboard")}
        />
      )}

      {page === "register" && (
        <Register goBack={() => setPage("login")} />
      )}

      {page === "forgot" && (
        <ForgotPassword goBack={() => setPage("login")} />
      )}

      {page === "dashboard" && <Dashboard />}
    </>
  );
}

export default App; 

//  import { useState } from "react";
//  import Login from "./components/Login";
//  import Register from "./components/Register";
//  import ForgotPassword from "./components/ForgotPassword";

//  function App() {
//    const [page, setPage] = useState("login");

//    return (
//      <>
//        {page === "login" && (
//       <Login
//          goRegister={() => setPage("register")}
//          goForgot={() => setPage("forgot")}
//         />
//      )}

//       {page === "register" && (
//          <Register goBack={() => setPage("login")} />
//        )}

//        {page === "forgot" && (
//          <ForgotPassword goBack={() => setPage("login")} />
//        )}
//      </>
//    );
//  }

//  export default App;

