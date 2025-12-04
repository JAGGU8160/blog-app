import { useState, useContext, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../authContext";

export default function ProfileMenu() {
  const { authUser, logoutUser } = useContext(AuthContext);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef();

  // Close menu when clicking outside
  useEffect(() => {
    function close(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Avatar */}
      <button
        onClick={() => setOpen(!open)}
        className="w-9 h-9 rounded-full bg-sky-500 text-white flex items-center justify-center 
                   font-semibold hover:bg-sky-600 select-none"
      >
        {authUser?.name?.charAt(0).toUpperCase()}
      </button>

      {/* Dropdown menu */}
      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-lg z-40">
          <div className="px-4 py-2 text-xs text-slate-500">Signed in as</div>
          <div className="px-4 pb-2 text-sm font-medium text-black">{authUser.email}</div>

          <hr />

          {/* Dashboard */}
          <Link
            to="/dashboard"
            className="block px-4 py-2 text-sm hover:bg-slate-100 text-black"
            onClick={() => setOpen(false)}
          >
            My Dashboard
          </Link>

          {/* My Blogs */}
          <Link
            to="/my-posts"
            className="block px-4 py-2 text-sm hover:bg-slate-100 text-black"
            onClick={() => setOpen(false)}
          >
            My Blogs
          </Link>

          {/* Change Password */}
          <Link
            to="/change-password"
            className="block px-4 py-2 text-sm hover:bg-slate-100 text-black"
            onClick={() => setOpen(false)}
          >
            Change Password
          </Link>

          {/* Logout */}
          <button
            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            onClick={() => {
              logoutUser();
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
