import { useState } from "react";
import {
  LogOut,
  Settings,
  User,
  Wallet,
  Shield,
  ChevronDown,
  Zap,
  Crown,
} from "lucide-react";
import useWalletStore from "../store/wallet";

const Header = () => {
  const { user, userRole, setUserRole, logout, credits } = useWalletStore();
  const [showMenu, setShowMenu] = useState(false);

  return (
    <header className="bg-white/5 backdrop-blur-xl border-b border-white/10 p-4 sticky top-0 z-50 overflow-visible">
      <div className="flex items-center justify-between relative overflow-visible">
        {/* Logo and Title */}
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Shield size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
              XertiQ Wallet
            </h1>
            <div className="flex items-center space-x-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  userRole?.toLowerCase() === "issuer" ? "bg-purple-400" : "bg-blue-400"
                }`}
              ></div>
              <p className="text-xs text-gray-300 capitalize font-medium">
                {userRole} Mode
              </p>
            </div>
          </div>
        </div>

        {/* Center - Credits Display */}
        <div className="hidden md:flex items-center space-x-4">
          <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl px-4 py-2">
            <div className="flex items-center space-x-2">
              <Zap size={14} className="text-green-400" />
              <span className="text-green-400 font-semibold text-sm">
                {credits}
              </span>
              <span className="text-gray-400 text-xs">Credits</span>
            </div>
          </div>
        </div>

        {/* User Menu */}
        <div className="relative z-50">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center space-x-3 bg-white/10 hover:bg-white/15 border border-white/20 rounded-xl px-4 py-2 transition-all duration-200 group"
          >
            <div className="w-8 h-8 bg-gradient-to-r from-gray-500 to-gray-600 rounded-lg flex items-center justify-center">
              <User size={16} className="text-white" />
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-white">
                {user?.name || "User"}
              </p>
              <p className="text-xs text-gray-400">
                {user?.email || "user@example.com"}
              </p>
            </div>
            <ChevronDown
              size={14}
              className={`text-gray-400 transition-transform duration-200 ${
                showMenu ? "rotate-180" : ""
              }`}
            />
          </button>

          {showMenu && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-[9998]"
                onClick={() => setShowMenu(false)}
              ></div>

              {/* Menu */}
              <div className="absolute right-0 top-full mt-2 w-64 bg-gray-900/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl z-[9999] overflow-hidden">
                {/* User Info Section */}
                <div className="p-4 border-b border-white/10">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <User size={20} className="text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">
                        {user?.name || "User"}
                      </p>
                      <p className="text-xs text-gray-400">
                        {user?.email || "user@example.com"}
                      </p>
                    </div>
                  </div>

                  {/* Credits on mobile */}
                  <div className="md:hidden mt-3 p-2 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Zap size={14} className="text-green-400" />
                        <span className="text-green-400 font-semibold text-sm">
                          {credits}
                        </span>
                      </div>
                      <span className="text-gray-400 text-xs">
                        Credits Available
                      </span>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="p-2">
                  {/* Mode Switch - Only show for ISSUER users */}
                  {user?.role?.toLowerCase() === "issuer" && (
                    <button
                      onClick={() => {
                        // Switch between issuer and user/holder roles
                        // Normalize userRole for comparison (handle both "user" and "holder")
                        const isIssuer = userRole?.toLowerCase() === "issuer";
                        const newRole = isIssuer ? "user" : "issuer";
                        setUserRole(newRole);
                        setShowMenu(false);
                      }}
                      className="w-full text-left px-3 py-3 text-sm text-gray-300 hover:bg-white/10 rounded-xl transition-all duration-200 flex items-center space-x-3 group"
                    >
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          userRole?.toLowerCase() === "issuer"
                            ? "bg-blue-500/20 text-blue-400"
                            : "bg-purple-500/20 text-purple-400"
                        }`}
                      >
                        {userRole?.toLowerCase() === "issuer" ? (
                          <User size={16} />
                        ) : (
                          <Crown size={16} />
                        )}
                      </div>
                      <div>
                        <p className="font-medium group-hover:text-white transition-colors">
                          Switch to {userRole?.toLowerCase() === "issuer" ? "Holder" : "Issuer"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {userRole?.toLowerCase() === "issuer"
                            ? "View and verify documents"
                            : "Issue and manage certificates"}
                        </p>
                      </div>
                    </button>
                  )}

                  <button className="w-full text-left px-3 py-3 text-sm text-gray-300 hover:bg-white/10 rounded-xl transition-all duration-200 flex items-center space-x-3 group">
                    <div className="w-8 h-8 bg-gray-500/20 rounded-lg flex items-center justify-center">
                      <Settings
                        size={16}
                        className="text-gray-400 group-hover:text-white transition-colors"
                      />
                    </div>
                    <div>
                      <p className="font-medium group-hover:text-white transition-colors">
                        Settings
                      </p>
                      <p className="text-xs text-gray-500">
                        Manage your preferences
                      </p>
                    </div>
                  </button>

                  <div className="border-t border-white/10 mt-2 pt-2">
                    <button
                      onClick={logout}
                      className="w-full text-left px-3 py-3 text-sm text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-200 flex items-center space-x-3 group"
                    >
                      <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center">
                        <LogOut size={16} className="text-red-400" />
                      </div>
                      <div>
                        <p className="font-medium">Sign Out</p>
                        <p className="text-xs text-red-300/60">
                          Disconnect your wallet
                        </p>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
