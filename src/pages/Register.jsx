import { useState } from "react";
import {
  UserPlus,
  Eye,
  EyeOff,
  Loader,
  Shield,
  Check,
  X,
  Building2,
  User,
} from "lucide-react";
import apiService from "../services/api";
import { useNavigate, Link } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "USER", // Default to USER (Holder)
    organizationName: "",
    organizationLogo: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

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
    setSuccess(false);

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
      const response = await apiService.register({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: formData.role,
        organizationName: formData.organizationName || null,
        organizationLogo: formData.organizationLogo || null,
      });

      console.log("Registration successful:", response);

      // Show success notification
      setSuccess(true);

      // Clear form after successful registration
      setTimeout(() => {
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          password: "",
          confirmPassword: "",
          role: "USER",
          organizationName: "",
          organizationLogo: "",
        });
        setSuccess(false);
        navigate("/login");
        // You can add navigation here: navigate('/dashboard') or navigate('/login')
      }, 1000);
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
        isValid ? "text-green-600" : "text-gray-500"
      }`}
    >
      {isValid ? <Check size={12} /> : <X size={12} />}
      <span>{text}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f7fafc] to-[#e6f2ff] flex items-center justify-center p-3 sm:p-4 md:p-6 lg:p-8">
      <div className="w-full max-w-7xl mx-auto grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
        {/* Left side - Branding */}
        <div className="hidden lg:block">
          <div className="space-y-6">
            <div className="inline-flex w-20 h-20 bg-gradient-to-r from-[#3B82F6] to-[#1E40AF] rounded-2xl items-center justify-center shadow-lg">
              <UserPlus size={40} className="text-white" />
            </div>
            <div>
              <h1 className="text-5xl font-bold text-[#1E40AF] mb-4">
                Join XertiQ
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed">
                Create your secure digital credential wallet. Issue and verify
                blockchain-secured documents with ease.
              </p>
            </div>
          </div>
        </div>

        {/* Right side - Registration Form */}
        <div className="w-full">
          {/* Mobile header */}
          <div className="text-center mb-6 lg:hidden">
            <div className="inline-flex w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-[#3B82F6] to-[#1E40AF] rounded-2xl items-center justify-center mb-4 shadow-lg">
              <UserPlus size={32} className="text-white sm:w-10 sm:h-10" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#1E40AF] mb-2">
              Join XertiQ
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Create your secure wallet
            </p>
          </div>

          {/* Registration card */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-200">
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 sm:p-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                    <p className="text-red-600 text-sm font-medium">{error}</p>
                  </div>
                </div>
              )}

              {success && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-3 sm:p-4">
                  <div className="flex items-center space-x-2">
                    <Check size={16} className="text-success" />
                    <p className="text-success text-sm font-medium">
                      Registration successful! Redirecting...
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-1 sm:space-y-2">
                <label className="block text-sm font-medium text-[#000000]">
                  First Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  className="w-full bg-lightest border-2 border-light rounded-xl px-4 py-3 text-[#000000] placeholder-medium focus:outline-none focus:border-dark transition-all duration-200"
                  placeholder="Enter your first name"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-1 sm:space-y-2">
                <label className="block text-sm font-medium text-[#000000]">
                  Last Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  className="w-full bg-lightest border-2 border-light rounded-xl px-4 py-3 text-[#000000] placeholder-medium focus:outline-none focus:border-dark transition-all duration-200"
                  placeholder="Enter your last name"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-1 sm:space-y-2">
                <label className="block text-sm font-medium text-[#000000]">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full bg-lightest border-2 border-light rounded-xl px-4 py-3 text-[#000000] placeholder-medium focus:outline-none focus:border-dark transition-all duration-200"
                  placeholder="Enter your email address"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-1 sm:space-y-2">
                <label className="block text-sm font-medium text-[#000000] mb-3">
                  Account Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: "USER" })}
                    className={`relative p-4 rounded-xl border-2 transition-all duration-200 ${
                      formData.role === "USER"
                        ? "border-[#8B5CF6] bg-[#8B5CF6]/10"
                        : "border-gray-200 bg-white hover:border-[#8B5CF6]/50"
                    }`}
                    disabled={isLoading}
                  >
                    <div className="flex flex-col items-center space-y-2">
                      <User
                        size={24}
                        className={
                          formData.role === "USER"
                            ? "text-[#8B5CF6]"
                            : "text-gray-500"
                        }
                      />
                      <span
                        className={`text-sm font-medium ${
                          formData.role === "USER"
                            ? "text-[#8B5CF6]"
                            : "text-gray-600"
                        }`}
                      >
                        Holder
                      </span>
                      <span className="text-xs text-gray-500 text-center">
                        Receive documents
                      </span>
                    </div>
                    {formData.role === "USER" && (
                      <div className="absolute top-2 right-2">
                        <Check size={16} className="text-[#8B5CF6]" />
                      </div>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: "ISSUER" })}
                    className={`relative p-4 rounded-xl border-2 transition-all duration-200 ${
                      formData.role === "ISSUER"
                        ? "border-[#3B82F6] bg-[#3B82F6]/10"
                        : "border-gray-200 bg-white hover:border-[#3B82F6]/50"
                    }`}
                    disabled={isLoading}
                  >
                    <div className="flex flex-col items-center space-y-2">
                      <Building2
                        size={24}
                        className={
                          formData.role === "ISSUER"
                            ? "text-[#3B82F6]"
                            : "text-gray-500"
                        }
                      />
                      <span
                        className={`text-sm font-medium ${
                          formData.role === "ISSUER"
                            ? "text-[#3B82F6]"
                            : "text-gray-600"
                        }`}
                      >
                        Issuer
                      </span>
                      <span className="text-xs text-gray-500 text-center">
                        Issue documents
                      </span>
                    </div>
                    {formData.role === "ISSUER" && (
                      <div className="absolute top-2 right-2">
                        <Check size={16} className="text-[#3B82F6]" />
                      </div>
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {formData.role === "USER"
                    ? "Holders can view documents issued to them"
                    : "Issuers can create and manage document batches"}
                </p>
              </div>

              {/* Organization fields - show only for ISSUER role */}
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  formData.role === "ISSUER"
                    ? "max-h-48 opacity-100"
                    : "max-h-0 opacity-0"
                }`}
              >
                <div className="space-y-1 sm:space-y-2 bg-gray-100 border border-gray-200 rounded-xl p-4">
                  <label className="block text-sm font-medium text-gray-800 mb-1">
                    Organization Name{" "}
                    <span className="text-xs text-gray-500">
                      (Required for Issuers)
                    </span>
                  </label>
                  <div className="relative">
                    <Building2
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500"
                      size={18}
                    />
                    <input
                      type="text"
                      required={formData.role === "ISSUER"}
                      value={formData.organizationName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          organizationName: e.target.value,
                        })
                      }
                      className="w-full bg-white border-2 border-gray-200 rounded-xl pl-12 pr-4 py-3 text-gray-800 placeholder-gray-500 focus:outline-none focus:border-[#3B82F6] transition-all duration-200"
                      placeholder="e.g., Harvard University, Tech Corp"
                      disabled={isLoading}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Your organization name will appear on all certificates you
                    issue
                  </p>
                </div>
              </div>

              <div className="space-y-1 sm:space-y-2">
                <label className="block text-sm font-medium text-[#000000]">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 pr-12 text-gray-800 placeholder-gray-500 focus:outline-none focus:border-[#3B82F6] transition-all duration-200"
                    placeholder="Create a strong password"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-[#3B82F6] transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {formData.password && (
                  <div className="mt-3 p-3 bg-gray-100 rounded-xl border border-gray-200">
                    <p className="text-xs text-gray-800 mb-2 font-medium">
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

              <div className="space-y-1 sm:space-y-2">
                <label className="block text-sm font-medium text-[#000000]">
                  Confirm Password
                </label>
                <div className="relative">
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
                    className={`w-full bg-gray-50 border-2 rounded-xl px-4 py-3 pr-12 text-gray-800 placeholder-gray-500 focus:outline-none transition-all duration-200 ${
                      formData.confirmPassword
                        ? passwordsMatch
                          ? "border-green-500 focus:border-green-600"
                          : "border-red-500 focus:border-red-600"
                        : "border-gray-200 focus:border-[#3B82F6]"
                    }`}
                    placeholder="Confirm your password"
                    disabled={isLoading}
                  />
                  {formData.confirmPassword && (
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                      {passwordsMatch ? (
                        <Check size={18} className="text-green-600" />
                      ) : (
                        <X size={18} className="text-red-600" />
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Terms and Privacy Consent */}
              <div className="space-y-3 pt-2">
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="agreeTerms"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="w-4 h-4 mt-1 text-[#3B82F6] border-gray-300 rounded focus:ring-[#3B82F6] cursor-pointer"
                    disabled={isLoading}
                  />
                  <label htmlFor="agreeTerms" className="text-sm text-gray-600 leading-relaxed cursor-pointer">
                    I agree to the{" "}
                    <Link
                      to="/terms-of-service"
                      target="_blank"
                      className="text-[#3B82F6] hover:text-[#1E40AF] font-medium underline"
                    >
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link
                      to="/privacy-policy"
                      target="_blank"
                      className="text-[#3B82F6] hover:text-[#1E40AF] font-medium underline"
                    >
                      Privacy Policy
                    </Link>
                    . I understand that document data anchored to the blockchain is permanent.
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={
                  isLoading ||
                  !passwordsMatch ||
                  !Object.values(passwordValidations).every((v) => v) ||
                  !agreedToTerms
                }
                className="w-full bg-gradient-to-r from-[#3B82F6] to-[#1E40AF] hover:from-[#1E40AF] hover:to-[#1E3A8A] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg transform hover:scale-[1.01] active:scale-[0.99]"
              >
                {isLoading ? (
                  <>
                    <Loader size={18} className="animate-spin" />
                    <span>Creating Wallet...</span>
                  </>
                ) : (
                  <>
                    <Shield size={18} />
                    <span>Create Secure Wallet</span>
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-600 font-medium">
                Already have a wallet?
              </span>
            </div>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="inline-flex items-center space-x-2 text-[#3B82F6] hover:text-[#1E40AF] font-semibold transition-colors duration-200 group"
            >
              <span>Sign in to your wallet</span>
              <UserPlus
                size={16}
                className="transform group-hover:translate-x-1 transition-transform duration-200"
              />
            </button>
          </div>

          {/* Back to Home link */}
          <div className="text-center mt-4">
            <Link
              to="/"
              className="text-gray-600 hover:text-[#3B82F6] text-sm font-medium transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
        </div>

        <div className="text-center mt-6 lg:mt-0">
          <div className="inline-flex items-center space-x-2 text-xs text-gray-600 bg-white px-4 py-2 rounded-full border border-gray-200 shadow-sm">
            <Shield size={14} />
            <span>End-to-end encrypted • Your keys, your crypto</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
