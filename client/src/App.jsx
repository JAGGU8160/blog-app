// client/src/App.jsx
import { useState, useEffect } from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import PostDetail from "./pages/PostDetail.jsx";
import { AuthContext } from "./authContext";

function App() {
  const location = useLocation();

  const [authUser, setAuthUser] = useState(() => {
    try {
      const raw = localStorage.getItem("authUser");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const loginUser = (user, token) => {
    localStorage.setItem("authToken", token);
    localStorage.setItem("authUser", JSON.stringify(user));
    setAuthUser(user);
  };

  const logoutUser = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");
    setAuthUser(null);
  };

  useEffect(() => {
    try {
      const raw = localStorage.getItem("authUser");
      const user = raw ? JSON.parse(raw) : null;
      setAuthUser(user);
    } catch {
      setAuthUser(null);
    }
  }, [location.pathname]);

  return (
    <AuthContext.Provider value={{ authUser, loginUser, logoutUser }}>
      <div className="min-h-screen bg-slate-100 text-slate-900">
        {/* Top navbar */}
        <header className="bg-slate-900 text-white">
          <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
            <Link to="/" className="text-xl font-semibold tracking-tight">
              My Blog
            </Link>

            {/* Right side nav - depends on login state */}
            {authUser ? (
              <div className="flex items-center gap-4 text-sm">
                <span className="text-slate-200">
                  Hello,{" "}
                  <span className="font-semibold">{authUser.name}</span>
                </span>

                <Link
                  to="/dashboard"
                  className="hover:text-sky-300 transition"
                >
                  Dashboard
                </Link>

                <button
                  onClick={logoutUser}
                  className="rounded-lg border border-slate-300 px-3 py-1 text-xs font-medium 
                             text-slate-900 bg-white hover:bg-slate-100"
                >
                  Logout
                </button>
              </div>
            ) : (
              <nav className="flex items-center gap-4 text-sm">
                {/* Show Register first, then Login */}
                <Link
                  to="/register"
                  className="hover:text-sky-300 transition"
                >
                  Register
                </Link>
                <Link to="/login" className="hover:text-sky-300 transition">
                  Login
                </Link>
              </nav>
            )}
          </div>
        </header>

        {/* 🔻 THIS PART RENDERS HOME & OTHER PAGES */}
        <main className="max-w-6xl mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/posts/:slug" element={<PostDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </main>
      </div>
    </AuthContext.Provider>
  );
}

export default App;
