// client/src/App.jsx
import { Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";

function App() {
  return (
    <div
      style={{
        fontFamily: "system-ui, sans-serif",
        minHeight: "100vh",
        background: "#f5f5f5",
      }}
    >
      {/* Simple navbar */}
      <header
        style={{
          background: "#111827",
          color: "white",
          padding: "1rem 2rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ fontWeight: 700 }}>My Blog</div>
        <nav style={{ display: "flex", gap: "1rem" }}>
          <Link to="/" style={{ color: "white", textDecoration: "none" }}>
            Home
          </Link>
          <Link
            to="/dashboard"
            style={{ color: "white", textDecoration: "none" }}
          >
            Dashboard
          </Link>
          <Link
            to="/login"
            style={{ color: "white", textDecoration: "none" }}
          >
            Login
          </Link>
          <Link
            to="/register"
            style={{ color: "white", textDecoration: "none" }}
          >
            Register
          </Link>
        </nav>
      </header>

      {/* Page content */}
      <main style={{ padding: "2rem", maxWidth: "900px", margin: "0 auto" }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
