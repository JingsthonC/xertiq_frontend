import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Shield, Lock, Eye, EyeOff, Loader, CheckCircle, XCircle, ArrowRight, Mail } from "lucide-react";
import apiService from "../services/api";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [status, setStatus] = useState("idle"); // idle, loading, success, error, expired, invalid
  const [message, setMessage] = useState("");

  const validate = () => {
    if (!token || !email) {
      setStatus("error");
      setMessage("Invalid reset link. Missing token or email.");
      return false;
    }
    if (newPassword.length < 8) {
      setStatus("error");
      setMessage("Password must be at least 8 characters long.");
      return false;
    }
    if (newPassword !== confirmPassword) {
      setStatus("error");
      setMessage("Passwords do not match.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setStatus("loading");
    setMessage("");

    try {
      const response = await apiService.resetPassword(token, email, newPassword);

      if (response.success) {
        setStatus("success");
        setMessage(response.message || "Password reset successful! You can now log in.");
      } else {
        throw new Error(response.error || "Failed to reset password");
      }
    } catch (error) {
      console.error("Reset password error:", error);
      const errorData = error.response?.data;

      if (errorData?.expired) {
        setStatus("expired");
        setMessage("Your reset link has expired. Please request a new one.");
      } else if (errorData?.invalid) {
        setStatus("invalid");
        setMessage(errorData.error || "Invalid reset link. Please request a new one.");
      } else {
        setStatus("error");
        setMessage(errorData?.error || "Something went wrong. Please try again.");
      }
    }
  };

  const missingParams = !token || !email;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl items-center justify-center mb-4 shadow-lg">
              <Shield size={32} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">Reset Password</h1>
          </div>

          <div className="text-center">
            {/* Success */}
            {status === "success" && (
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle size={32} className="text-green-600" />
                </div>
                <h2 className="text-xl font-semibold text-green-700">Password Reset!</h2>
                <p className="text-slate-600">{message}</p>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 mt-4 px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
                >
                  Go to Login
                  <ArrowRight size={18} />
                </Link>
              </div>
            )}

            {/* Expired */}
            {status === "expired" && (
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto bg-amber-100 rounded-full flex items-center justify-center">
                  <Mail size={32} className="text-amber-600" />
                </div>
                <h2 className="text-xl font-semibold text-amber-700">Link Expired</h2>
                <p className="text-slate-600">{message}</p>
                <Link
                  to="/forgot-password"
                  className="inline-flex items-center gap-2 mt-4 px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
                >
                  Request New Link
                  <ArrowRight size={18} />
                </Link>
              </div>
            )}

            {/* Invalid */}
            {status === "invalid" && (
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto bg-amber-100 rounded-full flex items-center justify-center">
                  <XCircle size={32} className="text-amber-600" />
                </div>
                <h2 className="text-xl font-semibold text-amber-700">Invalid Link</h2>
                <p className="text-slate-600">{message}</p>
                <Link
                  to="/forgot-password"
                  className="inline-flex items-center gap-2 mt-4 px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
                >
                  Request New Link
                  <ArrowRight size={18} />
                </Link>
              </div>
            )}

            {/* Missing params error */}
            {missingParams && status === "idle" && (
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                  <XCircle size={32} className="text-red-600" />
                </div>
                <h2 className="text-xl font-semibold text-red-700">Invalid Link</h2>
                <p className="text-slate-600">This reset link is missing required parameters.</p>
                <Link
                  to="/forgot-password"
                  className="inline-flex items-center gap-2 mt-4 px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
                >
                  Request New Link
                  <ArrowRight size={18} />
                </Link>
              </div>
            )}

            {/* Form */}
            {!missingParams && !["success", "expired", "invalid"].includes(status) && (
              <form onSubmit={handleSubmit} className="space-y-5 text-left">
                <p className="text-sm text-slate-500 text-center mb-2">
                  Enter your new password for <strong>{email}</strong>
                </p>

                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-slate-700 mb-1.5">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      id="newPassword"
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="At least 8 characters"
                      required
                      minLength={8}
                      className="w-full pl-11 pr-11 py-3 border-2 border-slate-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      id="confirmPassword"
                      type={showConfirm ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter your password"
                      required
                      minLength={8}
                      className="w-full pl-11 pr-11 py-3 border-2 border-slate-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {status === "error" && message && (
                  <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{message}</p>
                )}

                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full px-4 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {status === "loading" ? (
                    <>
                      <Loader size={18} className="animate-spin" />
                      Resetting...
                    </>
                  ) : (
                    "Reset Password"
                  )}
                </button>

                <div className="text-center">
                  <Link
                    to="/login"
                    className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                  >
                    Back to Login
                  </Link>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-slate-500 mt-6">
          &copy; {new Date().getFullYear()} XertiQ. Blockchain-Secured Document Verification.
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;
