// client/src/components/ProfileMenu.jsx
import { useState, useContext, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../authContext";

export default function ProfileMenu() {
  const { authUser, logoutUser } = useContext(AuthContext);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!authUser) return null;

  const initial = authUser.name?.charAt(0).toUpperCase() ?? "U";

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Avatar button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-9 h-9 rounded-full bg-sky-500 text-white flex items-center justify-center 
                   font-semibold hover:bg-sky-600 focus:outline-none focus:ring-2 
                   focus:ring-sky-500 focus:ring-offset-1 focus:ring-offset-slate-900"
      >
        {initial}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-lg z-40">
          <div className="px-4 pt-3 pb-2">
            <p className="text-xs text-slate-500 mb-0.5">Signed in as</p>
            <p className="text-sm font-medium text-slate-900 truncate">
              {authUser.email}
            </p>
          </div>

          <hr className="border-slate-100" />

          <nav className="py-1 text-sm">
            <Link
              to="/dashboard"
              className="block px-4 py-2 hover:bg-slate-50 text-slate-800"
              onClick={() => setOpen(false)}
            >
              Dashboard
            </Link>

            <Link
              to="/my-posts"
              className="block px-4 py-2 hover:bg-slate-50 text-slate-800"
              onClick={() => setOpen(false)}
            >
              Jaggu blogs
            </Link>

            <Link
              to="/change-password"
              className="block px-4 py-2 hover:bg-slate-50 text-slate-800"
              onClick={() => setOpen(false)}
            >
              Change password
            </Link>
          </nav>

          <hr className="border-slate-100" />

          <button
            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-b-xl"
            onClick={() => {
              logoutUser();
              setOpen(false);
              navigate("/");
            }}
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
