import { useState } from "react";
import { UserPlus, Eye, EyeOff, Loader, Shield, Check, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import useWalletStore from "../store/wallet";
import apiService from "../services/api";

const Register = () => {
  const navigate = useNavigate();
  const { setAuth } = useWalletStore();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Password strength validation
  const passwordValidations = {
    length: formData.password.length >= 8,
    uppercase: /[A-Z]/.test(formData.password),
    lowercase: /[a-z]/.test(formData.password),
    number: /\d/.test(formData.password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password),
  };

  const passwordsMatch =
    formData.password &&
    formData.confirmPassword &&
    formData.password === formData.confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!passwordsMatch) {
      setError("Passwords do not match");
      return;
    }

    if (!Object.values(passwordValidations).every((v) => v)) {
      setError("Please meet all password requirements");
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiService.register(
        formData.name,
        formData.email,
        formData.password
      );

      if (response.success && response.token && response.user) {
        // Store auth data in Zustand store
        setAuth(response.user, response.token);

        // Set the token in API service for immediate use
        apiService.setAuthToken(response.token);

        console.log("Registration successful:", response);

        // Redirect to dashboard
        navigate("/dashboard", { replace: true });
      } else {
        setError("Invalid response from server");
      }
    } catch (err) {
      console.error("Registration failed:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const ValidationItem = ({ isValid, text }) => (
    <div
      className={`flex items-center space-x-2 text-xs transition-colors duration-200 ${
        isValid ? "text-green-400" : "text-gray-400"
      }`}
    >
      {isValid ? <Check size={12} /> : <X size={12} />}
      <span>{text}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 w-full h-full">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo and header */}
        <div className="text-center mb-8">
          <div className="inline-flex w-20 h-20 bg-gradient-to-r from-purple-500 via-blue-500 to-purple-600 rounded-3xl items-center justify-center mb-6 shadow-lg shadow-purple-500/20 transform transition-all duration-300 hover:scale-110">
            <UserPlus size={40} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-purple-100 to-blue-100 bg-clip-text text-transparent mb-2">
            Join XertiQ
          </h1>
          <p className="text-gray-300 text-lg">Create your secure wallet</p>
        </div>

        {/* Registration form */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl shadow-black/20">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 animate-shake">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <p className="text-red-300 text-sm font-medium">{error}</p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-200 mb-3">
                Full Name
              </label>
              <div className="relative group">
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300 group-hover:border-white/20"
                  placeholder="Enter your full name"
                  disabled={isLoading}
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-200 mb-3">
                Email Address
              </label>
              <div className="relative group">
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300 group-hover:border-white/20"
                  placeholder="Enter your email address"
                  disabled={isLoading}
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-200 mb-3">
                Password
              </label>
              <div className="relative group">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 pr-12 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300 group-hover:border-white/20"
                  placeholder="Create a strong password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200 p-1"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>

              {/* Password requirements */}
              {formData.password && (
                <div className="mt-3 p-3 bg-white/5 rounded-lg border border-white/10">
                  <p className="text-xs text-gray-300 mb-2 font-medium">
                    Password requirements:
                  </p>
                  <div className="grid grid-cols-1 gap-1">
                    <ValidationItem
                      isValid={passwordValidations.length}
                      text="At least 8 characters"
                    />
                    <ValidationItem
                      isValid={passwordValidations.uppercase}
                      text="One uppercase letter"
                    />
                    <ValidationItem
                      isValid={passwordValidations.lowercase}
                      text="One lowercase letter"
                    />
                    <ValidationItem
                      isValid={passwordValidations.number}
                      text="One number"
                    />
                    <ValidationItem
                      isValid={passwordValidations.special}
                      text="One special character"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-200 mb-3">
                Confirm Password
              </label>
              <div className="relative group">
                <input
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                  className={`w-full bg-white/5 border rounded-xl px-4 py-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-300 group-hover:border-white/20 ${
                    formData.confirmPassword
                      ? passwordsMatch
                        ? "border-green-500/50 focus:ring-green-500/50 focus:border-green-500/50"
                        : "border-red-500/50 focus:ring-red-500/50 focus:border-red-500/50"
                      : "border-white/10 focus:ring-purple-500/50 focus:border-purple-500/50"
                  }`}
                  placeholder="Confirm your password"
                  disabled={isLoading}
                />
                {formData.confirmPassword && (
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    {passwordsMatch ? (
                      <Check size={20} className="text-green-400" />
                    ) : (
                      <X size={20} className="text-red-400" />
                    )}
                  </div>
                )}
                <div
                  className={`absolute inset-0 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none ${
                    formData.confirmPassword
                      ? passwordsMatch
                        ? "bg-gradient-to-r from-green-500/10 to-green-500/10"
                        : "bg-gradient-to-r from-red-500/10 to-red-500/10"
                      : "bg-gradient-to-r from-purple-500/10 to-blue-500/10"
                  }`}
                ></div>
              </div>
            </div>

            <button
              type="submit"
              disabled={
                isLoading ||
                !passwordsMatch ||
                !Object.values(passwordValidations).every((v) => v)
              }
              className="w-full bg-gradient-to-r from-purple-500 via-blue-500 to-purple-600 hover:from-purple-600 hover:via-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center space-x-3 shadow-lg shadow-purple-500/25 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {isLoading ? (
                <>
                  <Loader size={22} className="animate-spin" />
                  <span className="text-lg">Creating Wallet...</span>
                </>
              ) : (
                <>
                  <Shield size={22} />
                  <span className="text-lg">Create Secure Wallet</span>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-slate-900 text-gray-400 font-medium">
                Already have a wallet?
              </span>
            </div>
          </div>

          {/* Login link */}
          <div className="text-center">
            <Link
              to="/login"
              className="inline-flex items-center space-x-2 text-purple-400 hover:text-purple-300 font-semibold transition-colors duration-200 group"
            >
              <span>Sign in to your wallet</span>
              <UserPlus
                size={18}
                className="transform group-hover:translate-x-1 transition-transform duration-200"
              />
            </Link>
          </div>
        </div>

        {/* Security badge */}
        <div className="text-center mt-6">
          <div className="inline-flex items-center space-x-2 text-xs text-gray-400 bg-white/5 px-4 py-2 rounded-full border border-white/10">
            <Shield size={14} />
            <span>End-to-end encrypted • Your keys, your crypto</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
