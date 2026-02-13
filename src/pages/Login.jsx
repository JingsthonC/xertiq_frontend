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
  Mail,
  Lock,
  FileCheck,
  Award,
  CheckCircle,
  QrCode,
  Fingerprint,
  Database,
  FileSearch,
  BadgeCheck,
} from "lucide-react";
import apiService from "../services/api";
import useWalletStore from "../store/wallet";
import xertiqLogo from "../assets/xertiq_logo.png";

const Login = () => {
  const navigate = useNavigate();
  const { setAuth } = useWalletStore();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await apiService.login(
        formData.email,
        formData.password,
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
          "Login failed. Please check your credentials and try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Side - Blockchain Network Background */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#1E40AF] via-[#3B82F6] to-[#7C3AED] relative overflow-hidden items-center justify-center order-1">
        {/* XERTIQ Logo at top */}
        <div className="absolute top-8 left-1/2 -translate-x-1/2 z--1 flex justify-start space-x-3">
          {/* <div className="w-24 h-24 bg-white rounded-xl flex items-center justify-center shadow-xl p-2"> */}
          <img
            src={xertiqLogo}
            alt="XertiQ"
            className="w-full h-full object-contain"
          />
          {/* </div> */}
        </div>

        {/* Blockchain Network Visualization */}
        <div className="relative w-full h-full">
          {/* Shield Badges with 3D effect - matching the reference image */}
          <div
            className="absolute top-[20%] left-1/2 -translate-x-1/2 w-32 h-36 animate-float"
            style={{ animationDuration: "4s" }}
          >
            <div className="relative w-full h-full drop-shadow-2xl">
              <div
                className="absolute inset-0 bg-gradient-to-br from-[#D84A4A] via-[#C93838] to-[#8B2525] opacity-90"
                style={{
                  clipPath:
                    "polygon(50% 0%, 100% 20%, 100% 80%, 50% 100%, 0% 80%, 0% 20%)",
                }}
              ></div>
              <div
                className="absolute inset-0 bg-gradient-to-br from-[#E85E5E] to-[#C93838]"
                style={{
                  clipPath:
                    "polygon(50% 0%, 100% 20%, 100% 80%, 50% 100%, 0% 80%, 0% 20%)",
                  transform: "scale(0.85)",
                }}
              ></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="relative w-16 h-16">
                  <div
                    className="absolute inset-0 bg-white/20 backdrop-blur-sm"
                    style={{
                      clipPath:
                        "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)",
                    }}
                  ></div>
                  <Shield
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white"
                    size={40}
                    strokeWidth={2.5}
                  />
                </div>
              </div>
            </div>
          </div>

          <div
            className="absolute top-[42%] left-[18%] w-28 h-32 animate-float-delayed"
            style={{ animationDuration: "5s" }}
          >
            <div className="relative w-full h-full drop-shadow-2xl">
              <div
                className="absolute inset-0 bg-gradient-to-br from-[#D84A4A] via-[#C93838] to-[#8B2525] opacity-90"
                style={{
                  clipPath:
                    "polygon(50% 0%, 100% 20%, 100% 80%, 50% 100%, 0% 80%, 0% 20%)",
                }}
              ></div>
              <div
                className="absolute inset-0 bg-gradient-to-br from-[#E85E5E] to-[#C93838]"
                style={{
                  clipPath:
                    "polygon(50% 0%, 100% 20%, 100% 80%, 50% 100%, 0% 80%, 0% 20%)",
                  transform: "scale(0.85)",
                }}
              ></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="relative w-14 h-14">
                  <div
                    className="absolute inset-0 bg-white/20 backdrop-blur-sm"
                    style={{
                      clipPath:
                        "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)",
                    }}
                  ></div>
                  <Shield
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white"
                    size={36}
                    strokeWidth={2.5}
                  />
                </div>
              </div>
            </div>
          </div>

          <div
            className="absolute bottom-[28%] right-[15%] w-30 h-34 animate-float"
            style={{ animationDuration: "4.5s", animationDelay: "0.5s" }}
          >
            <div className="relative w-full h-full drop-shadow-2xl">
              <div
                className="absolute inset-0 bg-gradient-to-br from-[#D84A4A] via-[#C93838] to-[#8B2525] opacity-90"
                style={{
                  clipPath:
                    "polygon(50% 0%, 100% 20%, 100% 80%, 50% 100%, 0% 80%, 0% 20%)",
                }}
              ></div>
              <div
                className="absolute inset-0 bg-gradient-to-br from-[#E85E5E] to-[#C93838]"
                style={{
                  clipPath:
                    "polygon(50% 0%, 100% 20%, 100% 80%, 50% 100%, 0% 80%, 0% 20%)",
                  transform: "scale(0.85)",
                }}
              ></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="relative w-14 h-14">
                  <div
                    className="absolute inset-0 bg-white/20 backdrop-blur-sm"
                    style={{
                      clipPath:
                        "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)",
                    }}
                  ></div>
                  <Shield
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white"
                    size={36}
                    strokeWidth={2.5}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Wireframe Cube Nodes */}
          <div
            className="absolute top-[18%] left-[12%] w-12 h-12 border-2 border-cyan-300/70 animate-pulse"
            style={{
              transform: "rotateX(45deg) rotateY(45deg)",
              animationDuration: "3s",
            }}
          >
            <div className="absolute inset-2 border-2 border-cyan-300/40"></div>
          </div>
          <div
            className="absolute top-[15%] right-[8%] w-14 h-14 border-2 border-cyan-300/70 animate-pulse"
            style={{
              transform: "rotateX(45deg) rotateY(45deg)",
              animationDuration: "3.5s",
              animationDelay: "0.5s",
            }}
          >
            <div className="absolute inset-2 border-2 border-cyan-300/40"></div>
          </div>
          <div
            className="absolute top-[38%] right-[28%] w-10 h-10 border-2 border-cyan-300/70 animate-pulse"
            style={{
              transform: "rotateX(45deg) rotateY(45deg)",
              animationDuration: "3.2s",
              animationDelay: "0.3s",
            }}
          >
            <div className="absolute inset-2 border-2 border-cyan-300/40"></div>
          </div>
          <div
            className="absolute bottom-[35%] left-[8%] w-11 h-11 border-2 border-cyan-300/70 animate-pulse"
            style={{
              transform: "rotateX(45deg) rotateY(45deg)",
              animationDuration: "3.8s",
              animationDelay: "0.7s",
            }}
          >
            <div className="absolute inset-2 border-2 border-cyan-300/40"></div>
          </div>
          <div
            className="absolute bottom-[18%] right-[35%] w-13 h-13 border-2 border-cyan-300/70 animate-pulse"
            style={{
              transform: "rotateX(45deg) rotateY(45deg)",
              animationDuration: "3.3s",
              animationDelay: "1s",
            }}
          >
            <div className="absolute inset-2 border-2 border-cyan-300/40"></div>
          </div>
          <div
            className="absolute top-[55%] right-[12%] w-12 h-12 border-2 border-cyan-300/70 animate-pulse"
            style={{
              transform: "rotateX(45deg) rotateY(45deg)",
              animationDuration: "3.6s",
              animationDelay: "0.4s",
            }}
          >
            <div className="absolute inset-2 border-2 border-cyan-300/40"></div>
          </div>
          <div
            className="absolute bottom-[12%] left-[25%] w-10 h-10 border-2 border-cyan-300/70 animate-pulse"
            style={{
              transform: "rotateX(45deg) rotateY(45deg)",
              animationDuration: "3.4s",
              animationDelay: "0.6s",
            }}
          >
            <div className="absolute inset-2 border-2 border-cyan-300/40"></div>
          </div>

          {/* Network Connection Lines with Glow */}
          <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 5 }}>
            <defs>
              <linearGradient id="lineGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#7C3AED" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#6D28D9" stopOpacity="0.7" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Horizontal lines */}
            <line
              x1="0%"
              y1="15%"
              x2="50%"
              y2="20%"
              stroke="url(#lineGlow)"
              strokeWidth="2"
              opacity="0.7"
              filter="url(#glow)"
            >
              <animate
                attributeName="opacity"
                values="0.5;0.9;0.5"
                dur="3s"
                repeatCount="indefinite"
              />
            </line>
            <line
              x1="12%"
              y1="20%"
              x2="55%"
              y2="18%"
              stroke="url(#lineGlow)"
              strokeWidth="2"
              opacity="0.7"
              filter="url(#glow)"
              strokeDasharray="8,4"
            >
              <animate
                attributeName="opacity"
                values="0.6;1;0.6"
                dur="2.5s"
                repeatCount="indefinite"
              />
            </line>
            <line
              x1="50%"
              y1="18%"
              x2="92%"
              y2="18%"
              stroke="url(#lineGlow)"
              strokeWidth="2"
              opacity="0.7"
              filter="url(#glow)"
            >
              <animate
                attributeName="opacity"
                values="0.5;0.9;0.5"
                dur="3.5s"
                repeatCount="indefinite"
              />
            </line>
            <line
              x1="92%"
              y1="20%"
              x2="100%"
              y2="35%"
              stroke="url(#lineGlow)"
              strokeWidth="2"
              opacity="0.6"
              filter="url(#glow)"
              strokeDasharray="6,3"
            />

            {/* Vertical and diagonal connections */}
            <line
              x1="12%"
              y1="22%"
              x2="8%"
              y2="65%"
              stroke="url(#lineGlow)"
              strokeWidth="2"
              opacity="0.6"
              filter="url(#glow)"
              strokeDasharray="8,4"
            >
              <animate
                attributeName="opacity"
                values="0.4;0.8;0.4"
                dur="4s"
                repeatCount="indefinite"
              />
            </line>
            <line
              x1="18%"
              y1="50%"
              x2="50%"
              y2="45%"
              stroke="url(#lineGlow)"
              strokeWidth="2"
              opacity="0.7"
              filter="url(#glow)"
            >
              <animate
                attributeName="opacity"
                values="0.6;1;0.6"
                dur="3s"
                repeatCount="indefinite"
              />
            </line>
            <line
              x1="50%"
              y1="45%"
              x2="72%"
              y2="42%"
              stroke="url(#lineGlow)"
              strokeWidth="2"
              opacity="0.7"
              filter="url(#glow)"
              strokeDasharray="6,3"
            />
            <line
              x1="72%"
              y1="45%"
              x2="88%"
              y2="57%"
              stroke="url(#lineGlow)"
              strokeWidth="2"
              opacity="0.6"
              filter="url(#glow)"
            >
              <animate
                attributeName="opacity"
                values="0.5;0.9;0.5"
                dur="3.2s"
                repeatCount="indefinite"
              />
            </line>
            <line
              x1="50%"
              y1="50%"
              x2="60%"
              y2="88%"
              stroke="url(#lineGlow)"
              strokeWidth="2"
              opacity="0.6"
              filter="url(#glow)"
              strokeDasharray="8,4"
            />
            <line
              x1="25%"
              y1="88%"
              x2="85%"
              y2="72%"
              stroke="url(#lineGlow)"
              strokeWidth="2"
              opacity="0.7"
              filter="url(#glow)"
            >
              <animate
                attributeName="opacity"
                values="0.6;1;0.6"
                dur="2.8s"
                repeatCount="indefinite"
              />
            </line>

            {/* Glowing connection dots */}
            <circle
              cx="12%"
              cy="20%"
              r="5"
              fill="#8B5CF6"
              opacity="0.9"
              filter="url(#glow)"
            >
              <animate
                attributeName="r"
                values="4;6;4"
                dur="2s"
                repeatCount="indefinite"
              />
            </circle>
            <circle
              cx="50%"
              cy="18%"
              r="5"
              fill="#8B5CF6"
              opacity="0.9"
              filter="url(#glow)"
            >
              <animate
                attributeName="r"
                values="4;6;4"
                dur="2.5s"
                repeatCount="indefinite"
              />
            </circle>
            <circle
              cx="92%"
              cy="20%"
              r="5"
              fill="#8B5CF6"
              opacity="0.9"
              filter="url(#glow)"
            >
              <animate
                attributeName="r"
                values="4;6;4"
                dur="2.2s"
                repeatCount="indefinite"
              />
            </circle>
            <circle
              cx="50%"
              cy="45%"
              r="5"
              fill="#8B5CF6"
              opacity="0.9"
              filter="url(#glow)"
            >
              <animate
                attributeName="r"
                values="4;6;4"
                dur="2.8s"
                repeatCount="indefinite"
              />
            </circle>
            <circle
              cx="72%"
              cy="45%"
              r="5"
              fill="#8B5CF6"
              opacity="0.9"
              filter="url(#glow)"
            >
              <animate
                attributeName="r"
                values="4;6;4"
                dur="2.3s"
                repeatCount="indefinite"
              />
            </circle>
            <circle
              cx="85%"
              cy="72%"
              r="5"
              fill="#8B5CF6"
              opacity="0.9"
              filter="url(#glow)"
            >
              <animate
                attributeName="r"
                values="4;6;4"
                dur="2.6s"
                repeatCount="indefinite"
              />
            </circle>
          </svg>

          {/* Additional glowing particles */}
          <div
            className="absolute top-[25%] left-[35%] w-2 h-2 bg-cyan-300 rounded-full shadow-lg shadow-cyan-400/70 animate-ping"
            style={{ animationDuration: "3s" }}
          ></div>
          <div
            className="absolute top-[60%] right-[40%] w-2 h-2 bg-cyan-300 rounded-full shadow-lg shadow-cyan-400/70 animate-ping"
            style={{ animationDuration: "4s", animationDelay: "1s" }}
          ></div>
          <div
            className="absolute bottom-[45%] left-[28%] w-2 h-2 bg-cyan-300 rounded-full shadow-lg shadow-cyan-400/70 animate-ping"
            style={{ animationDuration: "3.5s", animationDelay: "0.5s" }}
          ></div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-8 lg:px-16 py-24 relative z-10 bg-white order-2">
        <div className="w-full max-w-xl">
          <div className="bg-white rounded-3xl shadow-2xl p-8 lg:p-12 border border-gray-100">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
              Log in to your account
            </h2>
            <p className="text-gray-500 text-base lg:text-lg mb-10">
              Enter your credentials to access your account
            </p>

            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Address */}
              <div>
                <label className="block text-base font-semibold text-gray-700 mb-2">
                  Email address
                </label>
                <div className="relative">
                  <Mail
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full pl-12 pr-4 py-3.5 text-base border-2 border-gray-200 rounded-xl focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 outline-none transition-all text-gray-800 bg-white/80"
                    placeholder="email@example.com"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-base font-semibold text-gray-700">
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-sm text-[#3B82F6] hover:text-[#2563EB] font-medium"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="w-full pl-12 pr-12 py-3.5 text-base border-2 border-gray-200 rounded-xl focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 outline-none transition-all text-gray-800 bg-white/80"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center pt-2">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-[#3B82F6] border-gray-300 rounded focus:ring-[#3B82F6]"
                />
                <label
                  htmlFor="remember"
                  className="ml-2 text-base text-gray-600"
                >
                  Remember me
                </label>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] hover:from-[#2563EB] hover:to-[#3B82F6] text-white text-lg font-semibold py-4 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl mt-8"
              >
                {isLoading ? (
                  <>
                    <Loader className="animate-spin" size={20} />
                    <span>Logging in...</span>
                  </>
                ) : (
                  <span>Log in</span>
                )}
              </button>
            </form>

            {/* Sign Up Link */}
            <div className="mt-8 text-center">
              <p className="text-base text-gray-600">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="text-[#3B82F6] hover:text-[#2563EB] font-semibold underline"
                >
                  Sign up
                </Link>
              </p>
            </div>

            {/* Back to Home */}
            <div className="mt-6 text-center">
              <Link
                to="/"
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
