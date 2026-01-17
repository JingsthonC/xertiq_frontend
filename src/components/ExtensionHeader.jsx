import { useState } from "react";
import {
  LogOut,
  Settings,
  User,
  Shield,
  ChevronDown,
  Zap,
  Menu,
  FolderOpen,
  Award,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import useWalletStore from "../store/wallet";

const ExtensionHeader = () => {
  const { user, userRole, setUserRole, logout, credits } = useWalletStore();
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();

  const toggleRole = () => {
    // Switch between issuer and user/holder roles
    // Normalize userRole for comparison (handle both "user" and "holder")
    const isIssuer = userRole?.toLowerCase() === "issuer";
    const newRole = isIssuer ? "user" : "issuer";
    setUserRole(newRole);
  };

  return (
    <div className="bg-white border-b border-gray-200 p-3 shadow-sm">
      <div className="flex items-center justify-between">
        {/* Logo and Title */}
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-[#3834A8] to-[#2A1B5D] rounded-xl flex items-center justify-center shadow-md">
            <Shield size={16} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-[#2A1B5D]">XertiQ</h1>
            <div className="flex items-center space-x-1">
              <div
                className={`w-1.5 h-1.5 rounded-full ${
                  userRole?.toLowerCase() === "issuer"
                    ? "bg-[#3834A8]"
                    : "bg-[#00B8D4]"
                }`}
              ></div>
              <p className="text-xs text-gray-600 capitalize">{userRole}</p>
            </div>
          </div>
        </div>

        {/* Credits and Menu */}
        <div className="flex items-center space-x-2">
          {/* Credits */}
          <div className="bg-gradient-to-r from-[#00E5FF]/20 to-[#00B8D4]/20 border border-[#00B8D4]/40 rounded-lg px-2 py-1">
            <div className="flex items-center space-x-1">
              <Zap size={12} className="text-[#0097A7]" />
              <span className="text-[#0097A7] font-semibold text-xs">
                {credits}
              </span>
            </div>
          </div>

          {/* Menu Button */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="flex items-center space-x-1 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg px-2 py-1 transition-all duration-200"
            >
              <div className="w-6 h-6 bg-gradient-to-r from-[#3834A8] to-[#2A1B5D] rounded-md flex items-center justify-center">
                <User size={12} className="text-white" />
              </div>
              <ChevronDown size={12} className="text-gray-600" />
            </button>

            {/* Dropdown Menu */}
            {showMenu && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-200 rounded-2xl shadow-2xl z-[9999] overflow-hidden">
                {/* User Info Section */}
                <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-[#3834A8] to-[#2A1B5D] rounded-xl flex items-center justify-center shadow-md">
                      <User size={16} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">
                        {user?.name || "User"}
                      </p>
                      <p className="text-xs text-gray-600 truncate">
                        {user?.email || "admin@xertiq.com"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="p-2">
                  {/* Current User Display */}
                  <div className="mb-2 p-3 bg-gradient-to-r from-[#3834A8]/10 to-[#2A1B5D]/10 border border-[#3834A8]/30 rounded-xl">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-[#3834A8]/30 to-[#2A1B5D]/30 rounded-lg flex items-center justify-center">
                        <User size={14} className="text-[#3834A8]" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          User
                        </p>
                        <p className="text-xs text-gray-600">
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
                      className="w-full flex items-center space-x-3 px-3 py-3 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-xl transition-all duration-200 group"
                    >
                      <div className="w-8 h-8 bg-gradient-to-r from-[#00B8D4]/20 to-[#0097A7]/20 border border-[#00B8D4]/40 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                        <Shield size={14} className="text-[#00B8D4]" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-medium">
                          Switch to{" "}
                          {userRole?.toLowerCase() === "issuer"
                            ? "Holder"
                            : "Issuer"}
                        </p>
                        <p className="text-xs text-gray-600">
                          {userRole?.toLowerCase() === "issuer"
                            ? "View and verify documents"
                            : "Issue and manage certificates"}
                        </p>
                      </div>
                    </button>
                  )}

                  {/* Issuer Dashboard Link */}
                  {user?.role?.toLowerCase() === "issuer" && (
                    <button
                      onClick={() => {
                        navigate("/issuer-dashboard");
                        setShowMenu(false);
                      }}
                      className="w-full flex items-center space-x-3 px-3 py-3 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-xl transition-all duration-200 group"
                    >
                      <div className="w-8 h-8 bg-gradient-to-r from-[#3834A8]/20 to-[#2A1B5D]/20 border border-[#3834A8]/40 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                        <FolderOpen size={14} className="text-[#3834A8]" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-medium">My Issued Documents</p>
                        <p className="text-xs text-gray-600">
                          View all documents you've issued
                        </p>
                      </div>
                    </button>
                  )}

                  {/* Holder Dashboard Link */}
                  {(userRole?.toLowerCase() === "user" ||
                    userRole?.toLowerCase() === "holder") && (
                    <button
                      onClick={() => {
                        navigate("/holder-dashboard");
                        setShowMenu(false);
                      }}
                      className="w-full flex items-center space-x-3 px-3 py-3 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-xl transition-all duration-200 group"
                    >
                      <div className="w-8 h-8 bg-gradient-to-r from-[#00B8D4]/20 to-[#0097A7]/20 border border-[#00B8D4]/40 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                        <Award size={14} className="text-[#00B8D4]" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-medium">My Documents</p>
                        <p className="text-xs text-gray-600">
                          View all your certificates
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
                    className="w-full flex items-center space-x-3 px-3 py-3 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-xl transition-all duration-200 group"
                  >
                    <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Settings size={14} className="text-gray-600" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium">Settings</p>
                      <p className="text-xs text-gray-600">
                        Manage your preferences
                      </p>
                    </div>
                  </button>

                  {/* Divider */}
                  <div className="my-2 border-t border-gray-200"></div>

                  {/* Sign Out */}
                  <button
                    onClick={() => {
                      logout();
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center space-x-3 px-3 py-3 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 rounded-xl transition-all duration-200 group"
                  >
                    <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                      <LogOut size={14} className="text-red-600" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium">Sign Out</p>
                      <p className="text-xs text-red-400">
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
