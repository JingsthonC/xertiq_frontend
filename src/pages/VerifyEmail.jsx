import { useState, useEffect } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { Shield, CheckCircle, XCircle, Loader, Mail, ArrowRight } from "lucide-react";
import apiService from "../services/api";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("verifying"); // verifying, success, error, expired
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    const emailParam = searchParams.get("email");

    if (emailParam) {
      setEmail(emailParam);
    }

    if (token && emailParam) {
      verifyEmail(token, emailParam);
    } else {
      setStatus("error");
      setMessage("Invalid verification link. Missing token or email.");
    }
  }, [searchParams]);

  const verifyEmail = async (token, email) => {
    try {
      const response = await apiService.verifyEmail(token, email);

      if (response.success) {
        if (response.alreadyVerified) {
          setStatus("success");
          setMessage("Your email is already verified. You can log in now.");
        } else {
          setStatus("success");
          setMessage("Email verified successfully! You can now log in.");
        }
      } else {
        throw new Error(response.error || "Verification failed");
      }
    } catch (error) {
      console.error("Verification error:", error);
      const errorMessage = error.response?.data?.error || error.message || "Verification failed";

      if (error.response?.data?.expired) {
        setStatus("expired");
        setMessage("Your verification link has expired. Please request a new one.");
      } else {
        setStatus("error");
        setMessage(errorMessage);
      }
    }
  };

  const handleResendVerification = async () => {
    if (!email) {
      setResendMessage("Email address is required");
      return;
    }

    setResendLoading(true);
    setResendMessage("");

    try {
      const response = await apiService.resendVerification(email);

      if (response.success) {
        setResendMessage(response.message || "Verification email sent! Check your inbox.");
        if (response.alreadyVerified) {
          setStatus("success");
          setMessage("Your email is already verified. You can log in now.");
        }
      } else {
        throw new Error(response.error || "Failed to resend");
      }
    } catch (error) {
      console.error("Resend error:", error);
      setResendMessage(error.response?.data?.error || "Failed to resend verification email");
    } finally {
      setResendLoading(false);
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
            <h1 className="text-2xl font-bold text-slate-800">Email Verification</h1>
          </div>

          {/* Status Display */}
          <div className="text-center">
            {status === "verifying" && (
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto bg-primary-100 rounded-full flex items-center justify-center">
                  <Loader size={32} className="text-primary-600 animate-spin" />
                </div>
                <p className="text-slate-600">Verifying your email address...</p>
              </div>
            )}

            {status === "success" && (
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle size={32} className="text-green-600" />
                </div>
                <h2 className="text-xl font-semibold text-green-700">Verified!</h2>
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

            {status === "error" && (
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                  <XCircle size={32} className="text-red-600" />
                </div>
                <h2 className="text-xl font-semibold text-red-700">Verification Failed</h2>
                <p className="text-slate-600">{message}</p>
                <Link
                  to="/login"
                  className="inline-block mt-4 text-primary-600 hover:text-primary-700 font-medium"
                >
                  Back to Login
                </Link>
              </div>
            )}

            {status === "expired" && (
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto bg-amber-100 rounded-full flex items-center justify-center">
                  <Mail size={32} className="text-amber-600" />
                </div>
                <h2 className="text-xl font-semibold text-amber-700">Link Expired</h2>
                <p className="text-slate-600">{message}</p>

                {/* Resend Form */}
                <div className="mt-6 p-4 bg-slate-50 rounded-xl">
                  <p className="text-sm text-slate-600 mb-3">
                    Enter your email to receive a new verification link:
                  </p>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all mb-3"
                  />
                  <button
                    onClick={handleResendVerification}
                    disabled={resendLoading || !email}
                    className="w-full px-4 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {resendLoading ? (
                      <>
                        <Loader size={18} className="animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Mail size={18} />
                        Resend Verification Email
                      </>
                    )}
                  </button>
                  {resendMessage && (
                    <p className={`mt-3 text-sm ${resendMessage.includes("sent") ? "text-green-600" : "text-red-600"}`}>
                      {resendMessage}
                    </p>
                  )}
                </div>

                <Link
                  to="/login"
                  className="inline-block mt-4 text-primary-600 hover:text-primary-700 font-medium"
                >
                  Back to Login
                </Link>
              </div>
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

export default VerifyEmail;
