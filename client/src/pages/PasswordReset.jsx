import { useContext, useState } from "react";
import { AuthContext } from "../authContext";
import { apiRequest } from "../api";
import Breadcrumb from "../components/Breadcrumb";

function PasswordReset() {
  const { authUser } = useContext(AuthContext);

  const [step, setStep] = useState("request"); // "request" | "verify"
  const [email, setEmail] = useState(authUser?.email || "");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [msg, setMsg] = useState("");

  const isLoggedInChange = !!authUser;

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setMsg("");

    try {
      await apiRequest("/auth/password-otp", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      setMsg("OTP sent to your email (if it exists).");
      setStep("verify");
    } catch (err) {
      setMsg(err.message);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setMsg("");

    try {
      const res = await apiRequest("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ email, otp, newPassword }),
      });
      setMsg(res.message || "Password reset successfully. You can now login.");
    } catch (err) {
      setMsg(err.message);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <Breadcrumb
        items={[
          {
            label: isLoggedInChange ? "Change password" : "Forgot password",
          },
        ]}
      />

      <h2 className="text-xl font-semibold mb-3">
        {isLoggedInChange ? "Change password" : "Forgot password"}
      </h2>
      <p className="text-sm text-slate-600 mb-4">
        We&apos;ll send a one-time OTP to your email. The code will be valid for
        a few minutes.
      </p>

      {msg && (
        <p className="text-sm mb-3 text-sky-700 bg-sky-50 border border-sky-100 rounded-md px-3 py-2">
          {msg}
        </p>
      )}

      {step === "request" ? (
        <form className="space-y-3" onSubmit={handleRequestOtp}>
          {!isLoggedInChange && (
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm 
                           focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              />
            </div>
          )}

          {isLoggedInChange && (
            <p className="text-xs text-slate-500">
              OTP will be sent to{" "}
              <span className="font-medium">{email}</span>
            </p>
          )}

          <button
            type="submit"
            className="w-full mt-2 inline-flex items-center justify-center rounded-lg bg-sky-600 
                       px-4 py-2 text-sm font-medium text-white hover:bg-sky-700 
                       focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-1"
          >
            Send OTP
          </button>
        </form>
      ) : (
        <form className="space-y-3" onSubmit={handleResetPassword}>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              OTP
            </label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
              required
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm 
                         focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              New password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
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
            Reset password
          </button>
        </form>
      )}
    </div>
  );
}

export default PasswordReset;
