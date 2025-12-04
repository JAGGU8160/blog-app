// client/src/pages/Register.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../api";
import Breadcrumb from "../components/Breadcrumb";

function Register() {
  const navigate = useNavigate();
  const [msg, setMsg] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");

    try {
      const res = await apiRequest("/auth/register", {
        method: "POST",
        body: JSON.stringify(form),
      });

      setMsg(res.message || "Registered successfully. You can login now.");
      setTimeout(() => navigate("/login"), 1000);
    } catch (err) {
      setMsg(err.message);
    }
  };

  return (
    <>
    <Breadcrumb items={[{ label: "Register" }]} />
    <div className="flex justify-center">
      <div className="w-full max-w-md bg-white rounded-xl shadow-sm border border-slate-100 p-6 sm:p-8">
        <h2 className="text-xl font-semibold mb-2">Create an account</h2>
        <p className="text-sm text-slate-500 mb-4">
          Register to start writing and managing your blog posts.
        </p>

        {msg && (
          <p className="text-sm mb-3 text-sky-700 bg-sky-50 border border-sky-100 rounded-md px-3 py-2">
            {msg}
          </p>
        )}

        <form className="space-y-3" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Name
            </label>
            <input
              name="name"
              placeholder="Your name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm 
                         focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Email
            </label>
            <input
              name="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm 
                         focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Password
            </label>
            <input
              name="password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm 
                         focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            />
          </div>

          <button
            type="submit"
            className="w-full mt-2 inline-flex items-center justify-center rounded-lg bg-sky-600 
                       px-4 py-2 text-sm font-medium text-white hover:bg-sky-700 
                       focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-1"
          >
            Register
          </button>
        </form>
      </div>
    </div> </>
  );
}

export default Register;
