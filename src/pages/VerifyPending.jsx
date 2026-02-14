import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Loader, RefreshCw, LogOut, Shield, CheckCircle } from "lucide-react";
import apiService from "../services/api";
import useWalletStore from "../store/wallet";

const VerifyPending = () => {
  const navigate = useNavigate();
  const { user, logout, setAuth, token } = useWalletStore();
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const [checkingStatus, setCheckingStatus] = useState(false);

  // Poll profile to check if user has verified
  useEffect(() => {
    const checkVerification = async () => {
      try {
        setCheckingStatus(true);
        const response = await apiService.get("/auth/profile");
        if (response.success && response.user?.isVerified) {
          setAuth({ ...response.user }, token);
          if (response.user.role === "ISSUER" && !response.user.isApproved) {
            navigate("/approval-pending", { replace: true });
          } else {
            navigate("/dashboard", { replace: true });
          }
        }
      } catch {
        // Ignore errors during background check
      } finally {
        setCheckingStatus(false);
      }
    };

    checkVerification();
    const interval = setInterval(checkVerification, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  const handleResend = async () => {
    if (!user?.email) return;
    setResendLoading(true);
    setResendMessage("");

    try {
      const response = await apiService.resendVerification(user.email);
      if (response.success) {
        setResendMessage(response.alreadyVerified
          ? "Your email is already verified! Redirecting..."
          : "Verification email sent! Check your inbox.");
        if (response.alreadyVerified) {
          setTimeout(() => navigate("/dashboard", { replace: true }), 1500);
        }
      }
    } catch (error) {
      setResendMessage(error.response?.data?.error || "Failed to resend. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  if (!user) {
    navigate("/login", { replace: true });
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
          <div className="text-center mb-8">
            <div className="inline-flex w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl items-center justify-center mb-4 shadow-lg">
              <Mail size={32} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">Verify Your Email</h1>
          </div>

          <div className="text-center space-y-4">
            <p className="text-slate-600">
              We've sent a verification email to:
            </p>
            <p className="font-semibold text-slate-800 bg-slate-50 py-2 px-4 rounded-lg inline-block">
              {user.email}
            </p>
            <p className="text-sm text-slate-500">
              Please check your inbox and click the verification link to continue.
            </p>

            <div className="pt-4 space-y-3">
              <button
                onClick={handleResend}
                disabled={resendLoading}
                className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {resendLoading ? (
                  <>
                    <Loader size={18} className="animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <RefreshCw size={18} />
                    Resend Verification Email
                  </>
                )}
              </button>

              <button
                onClick={handleLogout}
                className="w-full px-4 py-3 border-2 border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>

            {resendMessage && (
              <p className={`text-sm mt-2 ${resendMessage.includes("sent") || resendMessage.includes("verified") ? "text-green-600" : "text-red-600"}`}>
                {resendMessage}
              </p>
            )}

            {checkingStatus && (
              <p className="text-xs text-slate-400 flex items-center justify-center gap-1">
                <Loader size={12} className="animate-spin" />
                Checking verification status...
              </p>
            )}
          </div>
        </div>

        <p className="text-center text-sm text-slate-500 mt-6">
          &copy; {new Date().getFullYear()} XertiQ. Blockchain-Secured Document Verification.
        </p>
      </div>
    </div>
  );
};

export default VerifyPending;
