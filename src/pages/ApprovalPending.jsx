import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, Loader, LogOut, Shield, Building2 } from "lucide-react";
import apiService from "../services/api";
import useWalletStore from "../store/wallet";

const ApprovalPending = () => {
  const navigate = useNavigate();
  const { user, logout, setAuth, token } = useWalletStore();
  const [checkingStatus, setCheckingStatus] = useState(false);

  // Poll profile to check if user has been approved
  useEffect(() => {
    const checkApproval = async () => {
      try {
        setCheckingStatus(true);
        const response = await apiService.get("/auth/profile");
        if (response.success && response.user?.isApproved) {
          setAuth({ ...response.user }, token);
          navigate("/dashboard", { replace: true });
        }
      } catch {
        // Ignore errors during background check
      } finally {
        setCheckingStatus(false);
      }
    };

    checkApproval();
    const interval = setInterval(checkApproval, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

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
            <div className="inline-flex w-16 h-16 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl items-center justify-center mb-4 shadow-lg">
              <Clock size={32} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">Pending Approval</h1>
          </div>

          <div className="text-center space-y-4">
            <p className="text-slate-600">
              Your issuer account is pending admin approval.
            </p>

            {user.organizationName && (
              <div className="flex items-center justify-center gap-2 bg-slate-50 py-2 px-4 rounded-lg">
                <Building2 size={18} className="text-slate-500" />
                <span className="font-semibold text-slate-800">{user.organizationName}</span>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-left">
              <p className="text-sm text-blue-800">
                Our administration team will review your application. You will receive an email once your account is approved.
              </p>
            </div>

            <div className="pt-4">
              <button
                onClick={handleLogout}
                className="w-full px-4 py-3 border-2 border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>

            {checkingStatus && (
              <p className="text-xs text-slate-400 flex items-center justify-center gap-1">
                <Loader size={12} className="animate-spin" />
                Checking approval status...
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

export default ApprovalPending;
