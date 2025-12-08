// client/src/App.jsx
import { useState, useEffect } from "react";
import {
  Routes,
  Route,
  Link,
  useLocation,
  NavLink,
} from "react-router-dom";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import PostDetail from "./pages/PostDetail.jsx";
import { AuthContext } from "./authContext";
import ProfileMenu from "./components/ProfileMenu.jsx";
import MyPosts from "./pages/MyPosts.jsx";
import PasswordReset from "./pages/PasswordReset.jsx";

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

  // helper for active nav styling
  const navLinkClasses = ({ isActive }) =>
    `text-sm hover:text-sky-300 transition ${
      isActive ? "text-sky-300 font-medium" : "text-slate-100"
    }`;

  return (
    <AuthContext.Provider value={{ authUser, loginUser, logoutUser }}>
      <div className="min-h-screen bg-slate-100 text-slate-900">
        {/* Navbar */}
        <header className="bg-slate-900 text-white border-b border-slate-800">
          <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
            {/* Left: logo + nav */}
            <div className="flex items-center gap-8">
              <Link
                to="/"
                className="text-lg sm:text-xl font-semibold tracking-tight"
              >
                Jaggu Blogs
              </Link>

              {/* Main nav */}
              <nav className="hidden sm:flex items-center gap-4">
                <NavLink to="/" className={navLinkClasses} end>
                  Home
                </NavLink>

                {authUser && (
                  <>
                    <NavLink
                      to="/dashboard"
                      className={navLinkClasses}
                    >
                      Dashboard
                    </NavLink>
                    <NavLink
                      to="/my-posts"
                      className={navLinkClasses}
                    >
                      My blogs
                    </NavLink>
                  </>
                )}
              </nav>
            </div>

            {/* Right: auth area */}
            {authUser ? (
              <div className="flex items-center gap-3 text-sm">
                <span className="hidden sm:inline text-slate-200">
                  Hello,{" "}
                  <span className="font-semibold">{authUser.name}</span>
                </span>
                <ProfileMenu />
              </div>
            ) : (
              <nav className="flex items-center gap-4 text-sm">
                <NavLink
                  to="/login"
                  className={navLinkClasses}
                >
                  Login
                </NavLink>
                <NavLink
                  to="/register"
                  className={navLinkClasses}
                >
                  Register
                </NavLink>
              </nav>
            )}
          </div>
        </header>

        {/* Main content */}
        <main className="max-w-6xl mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/posts/:slug" element={<PostDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/my-posts" element={<MyPosts />} />
            <Route path="/password-reset" element={<PasswordReset />} />
            <Route path="/change-password" element={<PasswordReset />} />
          </Routes>
        </main>
      </div>
    </AuthContext.Provider>
  );
}

export default App;
