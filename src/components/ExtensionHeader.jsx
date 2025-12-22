import { useState } from "react";
import {
  LogOut,
  Settings,
  User,
  Shield,
  ChevronDown,
  Zap,
  Menu,
} from "lucide-react";
import useWalletStore from "../store/wallet";

const ExtensionHeader = () => {
  const { user, userRole, setUserRole, logout, credits } = useWalletStore();
  const [showMenu, setShowMenu] = useState(false);

  const toggleRole = () => {
    // Switch between issuer and user/holder roles
    // Normalize userRole for comparison (handle both "user" and "holder")
    const isIssuer = userRole?.toLowerCase() === "issuer";
    const newRole = isIssuer ? "user" : "issuer";
    setUserRole(newRole);
  };

  return (
    <div className="bg-white/5 backdrop-blur-xl border-b border-white/10 p-3">
      <div className="flex items-center justify-between">
        {/* Logo and Title */}
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-600 rounded-xl flex items-center justify-center">
            <Shield size={16} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
              XertiQ
            </h1>
            <div className="flex items-center space-x-1">
              <div
                className={`w-1.5 h-1.5 rounded-full ${
                  userRole?.toLowerCase() === "issuer" ? "bg-purple-400" : "bg-blue-400"
                }`}
              ></div>
              <p className="text-xs text-gray-300 capitalize">{userRole}</p>
            </div>
          </div>
        </div>

        {/* Credits and Menu */}
        <div className="flex items-center space-x-2">
          {/* Credits */}
          <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-lg px-2 py-1">
            <div className="flex items-center space-x-1">
              <Zap size={12} className="text-green-400" />
              <span className="text-green-400 font-semibold text-xs">
                {credits}
              </span>
            </div>
          </div>

          {/* Menu Button */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="flex items-center space-x-1 bg-white/10 hover:bg-white/15 border border-white/20 rounded-lg px-2 py-1 transition-all duration-200"
            >
              <div className="w-6 h-6 bg-gradient-to-r from-gray-500 to-gray-600 rounded-md flex items-center justify-center">
                <User size={12} className="text-white" />
              </div>
              <ChevronDown size={12} className="text-gray-400" />
            </button>

            {/* Dropdown Menu */}
            {showMenu && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-[#1a1347]/98 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl z-[9999] overflow-hidden">
                {/* User Info Section */}
                <div className="p-4 bg-gradient-to-r from-white/5 to-white/10 border-b border-white/10">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                      <User size={16} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">
                        {user?.name || "User"}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {user?.email || "admin@xertiq.com"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="p-2">
                  {/* Current User Display */}
                  <div className="mb-2 p-3 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-400/20 rounded-xl">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-lg flex items-center justify-center">
                        <User size={14} className="text-blue-300" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">User</p>
                        <p className="text-xs text-blue-300">
                          {user?.email || "admin@xertiq.com"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Role Switch - Only show for ISSUER users */}
                  {user?.role?.toLowerCase() === "issuer" && (
                    <button
                      onClick={() => {
                        toggleRole();
                        setShowMenu(false);
                      }}
                      className="w-full flex items-center space-x-3 px-3 py-3 text-sm text-gray-300 hover:bg-white/10 hover:text-white rounded-xl transition-all duration-200 group"
                    >
                      <div className="w-8 h-8 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-400/30 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                        <Shield size={14} className="text-green-400" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-medium">
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

                  {/* Settings */}
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      /* Handle settings */
                    }}
                    className="w-full flex items-center space-x-3 px-3 py-3 text-sm text-gray-300 hover:bg-white/10 hover:text-white rounded-xl transition-all duration-200 group"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-400/30 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Settings size={14} className="text-blue-400" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium">Settings</p>
                      <p className="text-xs text-gray-500">
                        Manage your preferences
                      </p>
                    </div>
                  </button>

                  {/* Divider */}
                  <div className="my-2 border-t border-white/10"></div>

                  {/* Sign Out */}
                  <button
                    onClick={() => {
                      logout();
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center space-x-3 px-3 py-3 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl transition-all duration-200 group"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-400/30 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                      <LogOut size={14} className="text-red-400" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium">Sign Out</p>
                      <p className="text-xs text-red-500/70">
                        Disconnect your wallet
                      </p>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Close menu when clicking outside */}
      {showMenu && (
        <div
          className="fixed inset-0 z-[9998]"
          onClick={() => setShowMenu(false)}
        />
      )}
    </div>
  );
};

export default ExtensionHeader;
