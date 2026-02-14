import { useState } from "react";
import { Link } from "react-router-dom";
import { Shield, Mail, Loader, CheckCircle, ArrowLeft } from "lucide-react";
import apiService from "../services/api";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle, loading, success, error
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      setStatus("error");
      setMessage("Please enter your email address.");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const response = await apiService.forgotPassword(email.trim());

      if (response.success) {
        setStatus("success");
        setMessage(response.message || "If an account exists with this email, you will receive password reset instructions.");
      } else {
        throw new Error(response.error || "Failed to process request");
      }
    } catch (error) {
      console.error("Forgot password error:", error);

      if (error.response?.status === 429) {
        setStatus("error");
        setMessage("Too many requests. Please wait a few minutes before trying again.");
      } else {
        setStatus("error");
        setMessage(error.response?.data?.error || "Something went wrong. Please try again later.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl items-center justify-center mb-4 shadow-lg">
              <Shield size={32} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">Forgot Password</h1>
            <p className="text-slate-500 mt-2">
              Enter your email and we'll send you a link to reset your password.
            </p>
          </div>

          {status === "success" ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle size={32} className="text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-green-700">Check Your Email</h2>
              <p className="text-slate-600">{message}</p>
              <p className="text-sm text-slate-500">
                Didn't receive the email? Check your spam folder or try again.
              </p>
              <button
                onClick={() => { setStatus("idle"); setMessage(""); }}
                className="text-primary-600 hover:text-primary-700 font-medium text-sm"
              >
                Try another email
              </button>
              <div>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 mt-2 text-primary-600 hover:text-primary-700 font-medium"
                >
                  <ArrowLeft size={16} />
                  Back to Login
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    className="w-full pl-11 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                  />
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
                    Sending...
                  </>
                ) : (
                  "Send Reset Link"
                )}
              </button>

              <div className="text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
                >
                  <ArrowLeft size={16} />
                  Back to Login
                </Link>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-slate-500 mt-6">
          &copy; {new Date().getFullYear()} XertiQ. Blockchain-Secured Document Verification.
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
