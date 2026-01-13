// import { useState } from "react";
// import { useNavigate, Link } from "react-router-dom";
// import {
//   Eye,
//   EyeOff,
//   Loader,
//   Shield,
//   Lock,
//   LogIn,
//   Sparkles,
// } from "lucide-react";
// import apiService from "../services/api";
// import useWalletStore from "../store/wallet";

// const Login = () => {
//   const navigate = useNavigate();
//   const { setAuth } = useWalletStore();
//   const [formData, setFormData] = useState({ email: "", password: "" });
//   const [showPassword, setShowPassword] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState("");

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsLoading(true);
//     setError("");

//     try {
//       const response = await apiService.login(
//         formData.email,
//         formData.password
//       );

//       if (response.success && response.token && response.user) {
//         // Store auth data in Zustand store
//         setAuth(response.user, response.token);

//         // Set the token in API service for immediate use
//         apiService.setAuthToken(response.token);

//         console.log("Login successful:", response);

//         // Redirect to dashboard
//         navigate("/dashboard", { replace: true });
//       } else {
//         setError("Invalid response from server");
//       }
//     } catch (error) {
//       console.error("Login failed:", error);
//       setError(
//         error.response?.data?.message ||
//           "Login failed. Please check your credentials and try again."
//       );
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
//       <div className="w-[360px] h-[600px] bg-gradient-to-br from-[#0a0e27] via-[#1a1347] to-[#0d0221] flex flex-col items-center justify-center relative overflow-hidden rounded-3xl shadow-[0_0_40px_rgba(139,92,246,0.4)] border border-purple-500/20">
//         {/* Animated gradient orbs */}
//         <div className="absolute -top-20 -left-20 w-56 h-56 bg-gradient-to-br from-blue-500/30 to-cyan-500/20 blur-[120px] rounded-full animate-pulse"></div>
//         <div
//           className="absolute -bottom-20 -right-20 w-72 h-72 bg-gradient-to-br from-purple-600/30 to-pink-500/20 blur-[140px] rounded-full animate-pulse"
//           style={{ animationDelay: "1s" }}
//         ></div>
//         <div
//           className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-violet-500/10 blur-[100px] rounded-full animate-pulse"
//           style={{ animationDelay: "0.5s" }}
//         ></div>

//         {/* Floating particles */}
//         <div
//           className="absolute top-20 left-10 w-1 h-1 bg-purple-400 rounded-full animate-ping"
//           style={{ animationDuration: "3s" }}
//         ></div>
//         <div
//           className="absolute top-40 right-16 w-1 h-1 bg-blue-400 rounded-full animate-ping"
//           style={{ animationDuration: "4s", animationDelay: "1s" }}
//         ></div>
//         <div
//           className="absolute bottom-32 left-20 w-1 h-1 bg-cyan-400 rounded-full animate-ping"
//           style={{ animationDuration: "3.5s", animationDelay: "0.5s" }}
//         ></div>

//         {/* Glass card with enhanced backdrop */}
//         <div className="relative z-10 w-[90%] bg-gradient-to-br from-white/[0.12] to-white/[0.05] backdrop-blur-2xl border border-white/[0.18] rounded-2xl p-8 shadow-[0_8px_32px_0_rgba(139,92,246,0.2)]">
//           <div className="text-center mb-8">
//             {/* Enhanced logo with glow effect */}
//             <div className="relative inline-flex mb-4">
//               <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl blur-xl opacity-60 animate-pulse"></div>
//               <div className="relative w-16 h-16 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 hover:rotate-6">
//                 <Shield size={32} className="text-white drop-shadow-lg" />
//                 <Sparkles
//                   size={12}
//                   className="absolute -top-1 -right-1 text-yellow-300 animate-pulse"
//                 />
//               </div>
//             </div>

//             <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent mb-2 tracking-tight">
//               XertiQ Wallet
//             </h1>
//             <p className="text-gray-300/90 text-sm tracking-wide font-light">
//               Secure blockchain authentication
//             </p>
//           </div>

//           <div className="space-y-5">
//             {error && (
//               <div className="bg-gradient-to-r from-red-500/10 to-pink-500/10 border border-red-400/40 rounded-xl p-3 text-xs text-red-200 text-center backdrop-blur-sm">
//                 <span className="font-medium">{error}</span>
//               </div>
//             )}

//             <div className="space-y-2">
//               <label className="block text-sm text-gray-200 font-medium">
//                 Email Address
//               </label>
//               <input
//                 type="email"
//                 value={formData.email}
//                 onChange={(e) =>
//                   setFormData({ ...formData, email: e.target.value })
//                 }
//                 className="w-full bg-slate-900/60 border border-slate-600/40 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 outline-none transition-all duration-200 hover:border-slate-500/60"
//                 placeholder="you@example.com"
//               />
//             </div>

//             <div className="space-y-2">
//               <label className="block text-sm text-gray-200 font-medium">
//                 Password
//               </label>
//               <div className="relative">
//                 <input
//                   type={showPassword ? "text" : "password"}
//                   value={formData.password}
//                   onChange={(e) =>
//                     setFormData({ ...formData, password: e.target.value })
//                   }
//                   className="w-full bg-slate-900/60 border border-slate-600/40 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 outline-none transition-all duration-200 hover:border-slate-500/60 pr-12"
//                   placeholder="••••••••"
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowPassword(!showPassword)}
//                   className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5"
//                 >
//                   {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
//                 </button>
//               </div>
//             </div>

//             <button
//               onClick={handleSubmit}
//               disabled={isLoading}
//               className="w-full flex items-center justify-center bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-500 hover:via-purple-500 hover:to-pink-500 text-white font-semibold py-3 rounded-xl text-sm transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] relative overflow-hidden group"
//             >
//               <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
//               {isLoading ? (
//                 <>
//                   <Loader size={18} className="animate-spin mr-2" />
//                   <span>Authenticating...</span>
//                 </>
//               ) : (
//                 <>
//                   <Lock size={18} className="mr-2" />
//                   <span>Login Securely</span>
//                 </>
//               )}
//             </button>

//             <div className="flex items-center justify-center my-4">
//               <div className="flex-1 border-t border-gray-700/50"></div>
//               <span className="mx-3 text-gray-500 text-xs font-medium">or</span>
//               <div className="flex-1 border-t border-gray-700/50"></div>
//             </div>

//             <div className="text-center">
//               <Link
//                 to="/register"
//                 className="text-purple-400 hover:text-purple-300 text-sm font-medium inline-flex items-center space-x-2 transition-all duration-200 hover:translate-x-1 group"
//               >
//                 <span>Create New Wallet</span>
//                 <LogIn
//                   size={16}
//                   className="group-hover:translate-x-1 transition-transform"
//                 />
//               </Link>
//             </div>
//           </div>
//         </div>

//         {/* Enhanced footer */}
//         <div className="absolute bottom-4 text-[10px] text-gray-400/80 flex items-center space-x-2 justify-center backdrop-blur-sm bg-black/10 px-4 py-2 rounded-full border border-white/5">
//           <Shield size={11} className="text-purple-400" />
//           <span className="font-medium">
//             256-bit encryption • Blockchain secured
//           </span>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Login;

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Loader,
  Shield,
  Lock,
  LogIn,
  Sparkles,
} from "lucide-react";
import apiService from "../services/api";
import useWalletStore from "../store/wallet";

const Login = () => {
  const navigate = useNavigate();
  const { setAuth } = useWalletStore();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Detect if running as extension
  const isExtension =
    typeof window !== "undefined" &&
    typeof window.chrome !== "undefined" &&
    window.chrome.runtime &&
    window.chrome.runtime.id;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await apiService.login(
        formData.email,
        formData.password
      );

      if (response.success && response.token && response.user) {
        setAuth(response.user, response.token);
        apiService.setAuthToken(response.token);
        console.log("Login successful:", response);
        navigate("/dashboard", { replace: true });
      } else {
        setError("Invalid response from server");
      }
    } catch (error) {
      console.error("Login failed:", error);
      setError(
        error.response?.data?.message ||
          "Login failed. Please check your credentials and try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={
        isExtension
          ? "w-full h-full bg-lightest"
          : "min-h-screen bg-lightest flex items-center justify-center p-4"
      }
    >
      <div
        className={`flex flex-col items-center relative border border-light bg-white ${
          isExtension
            ? "w-full h-full rounded-none py-4 px-5 justify-center overflow-hidden"
            : "w-[360px] h-[600px] rounded-3xl justify-center overflow-hidden shadow-[0_0_30px_rgba(201,181,156,0.25)]"
        }`}
      >
        {/* Animated gradient orbs - only show in web mode */}
        {!isExtension && (
          <>
            <div className="absolute -top-20 -left-20 w-56 h-56 bg-gradient-to-br from-medium/25 to-dark/15 blur-[120px] rounded-full animate-pulse"></div>
            <div
              className="absolute -bottom-20 -right-20 w-72 h-72 bg-gradient-to-br from-dark/20 to-medium/15 blur-[140px] rounded-full animate-pulse"
              style={{ animationDelay: "1s" }}
            ></div>
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-dark/10 blur-[100px] rounded-full animate-pulse"
              style={{ animationDelay: "0.5s" }}
            ></div>

            {/* Floating particles */}
            <div
              className="absolute top-20 left-10 w-1 h-1 bg-dark rounded-full animate-ping"
              style={{ animationDuration: "3s" }}
            ></div>
            <div
              className="absolute top-40 right-16 w-1 h-1 bg-medium rounded-full animate-ping"
              style={{ animationDuration: "4s", animationDelay: "1s" }}
            ></div>
            <div
              className="absolute bottom-32 left-20 w-1 h-1 bg-dark rounded-full animate-ping"
              style={{ animationDuration: "3.5s", animationDelay: "0.5s" }}
            ></div>
          </>
        )}

        {/* Glass card with enhanced backdrop */}
        <div
          className={`relative z-10 bg-lightest border border-light rounded-2xl shadow-[0_12px_30px_rgba(201,181,156,0.15)] ${
            isExtension ? "w-full p-5" : "w-[90%] p-8"
          }`}
        >
          <div
            className={isExtension ? "text-center mb-2" : "text-center mb-8"}
          >
            {/* Enhanced logo with glow effect */}
            <div
              className={
                isExtension
                  ? "relative inline-flex mb-1.5"
                  : "relative inline-flex mb-4"
              }
            >
              {!isExtension && (
                <div className="absolute inset-0 bg-gradient-to-r from-medium via-dark to-darker rounded-2xl blur-xl opacity-50 animate-pulse"></div>
              )}
              <div
                className={`relative bg-gradient-to-br from-dark via-darker to-dark rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 hover:rotate-6 ${
                  isExtension ? "w-12 h-12" : "w-16 h-16"
                }`}
              >
                <Shield
                  size={isExtension ? 24 : 32}
                  className="text-white drop-shadow-lg"
                />
                {!isExtension && (
                  <Sparkles
                    size={12}
                    className="absolute -top-1 -right-1 text-yellow-300 animate-pulse"
                  />
                )}
              </div>
            </div>

            <h1
              className={`font-bold text-dark tracking-tight ${
                isExtension ? "text-2xl mb-1" : "text-3xl mb-2"
              }`}
            >
              XertiQ Wallet
            </h1>
            <p
              className={`text-darker tracking-wide font-light ${
                isExtension ? "text-xs" : "text-sm"
              }`}
            >
              Secure blockchain authentication
            </p>
          </div>

          <div className={isExtension ? "space-y-3" : "space-y-5"}>
            {error && (
              <div
                className={`bg-error-bg border border-error-border rounded-xl text-error text-center ${
                  isExtension ? "p-2 text-[11px]" : "p-3 text-xs"
                }`}
              >
                <span className="font-medium">{error}</span>
              </div>
            )}

            <div className={isExtension ? "space-y-1.5" : "space-y-2"}>
              <label
                className={`block text-dark font-medium ${
                  isExtension ? "text-xs" : "text-sm"
                }`}
              >
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className={`w-full bg-white border-2 border-light rounded-xl text-[#000000] placeholder-medium focus:ring-2 focus:ring-dark/40 focus:border-dark/60 outline-none transition-all duration-200 hover:border-dark/40 ${
                  isExtension ? "px-3 py-2 text-xs" : "px-4 py-3 text-sm"
                }`}
                placeholder="you@example.com"
              />
            </div>

            <div className={isExtension ? "space-y-1.5" : "space-y-2"}>
              <label
                className={`block text-dark font-medium ${
                  isExtension ? "text-xs" : "text-sm"
                }`}
              >
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className={`w-full bg-white border-2 border-light rounded-xl text-[#000000] placeholder-medium focus:ring-2 focus:ring-dark/40 focus:border-dark/60 outline-none transition-all duration-200 hover:border-dark/40 pr-10 ${
                    isExtension ? "px-3 py-2 text-xs" : "px-4 py-3 text-sm"
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-dark hover:text-darker transition-colors p-1 rounded-lg hover:bg-medium/30"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className={`w-full flex items-center justify-center bg-dark hover:bg-darker text-white font-semibold rounded-xl transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(201,181,156,0.25)] hover:shadow-[0_0_30px_rgba(184,164,138,0.35)] relative overflow-hidden group ${
                isExtension ? "py-2.5 text-xs" : "py-3 text-sm"
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/25 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              {isLoading ? (
                <>
                  <Loader size={16} className="animate-spin mr-2" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <Lock size={16} className="mr-2" />
                  <span>Login Securely</span>
                </>
              )}
            </button>

            <div
              className={
                isExtension
                  ? "flex items-center justify-center my-2"
                  : "flex items-center justify-center my-4"
              }
            >
              <div className="flex-1 border-t border-light"></div>
              <span
                className={`text-dark font-medium ${
                  isExtension ? "mx-2 text-[10px]" : "mx-3 text-xs"
                }`}
              >
                or
              </span>
              <div className="flex-1 border-t border-light"></div>
            </div>

            <div className="text-center">
              <Link
                to="/register"
                className={`text-dark hover:text-darker font-medium inline-flex items-center space-x-2 transition-all duration-200 hover:translate-x-1 group ${
                  isExtension ? "text-xs" : "text-sm"
                }`}
              >
                <span>Create New Wallet</span>
                <LogIn
                  size={14}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </Link>
            </div>
          </div>
        </div>

        {/* Enhanced footer - only show in web mode */}
        {!isExtension && (
          <div className="absolute bottom-4 text-[10px] text-darker flex items-center space-x-2 justify-center backdrop-blur-sm bg-white/70 px-4 py-2 rounded-full border border-light shadow-sm">
            <Shield size={11} className="text-dark" />
            <span className="font-medium">
              256-bit encryption • Blockchain secured
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
