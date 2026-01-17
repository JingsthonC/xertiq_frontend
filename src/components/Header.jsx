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
  FolderOpen,
  Award,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import useWalletStore from "../store/wallet";

const Header = () => {
  const { user, userRole, setUserRole, logout, credits } = useWalletStore();
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();

  // Normalize role for comparison
  const normalizedRole =
    userRole?.toUpperCase() || user?.role?.toUpperCase() || "USER";
  const isSuperAdmin = normalizedRole === "SUPER_ADMIN";

  return (
    <header className="bg-white border-b border-gray-200 p-4 sticky top-0 z-50 overflow-visible shadow-sm">
      <div className="flex items-center justify-between relative overflow-visible">
        {/* Logo and Title */}
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-gradient-to-r from-[#3834A8] to-[#2A1B5D] rounded-2xl flex items-center justify-center shadow-lg">
            <Shield size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#2A1B5D]">XertiQ Wallet</h1>
            <div className="flex items-center space-x-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  userRole?.toLowerCase() === "issuer"
                    ? "bg-[#3834A8]"
                    : "bg-[#00B8D4]"
                }`}
              ></div>
              <p className="text-xs text-gray-600 capitalize font-medium">
                {userRole} Mode
              </p>
            </div>
          </div>
        </div>

        {/* Center - Credits Display (hidden for super admins) */}
        {!isSuperAdmin && (
          <div className="hidden md:flex items-center space-x-4">
            <div className="bg-gradient-to-r from-[#00E5FF]/20 to-[#00B8D4]/20 border border-[#00B8D4]/40 rounded-xl px-4 py-2">
              <div className="flex items-center space-x-2">
                <Zap size={14} className="text-[#0097A7]" />
                <span className="text-[#0097A7] font-semibold text-sm">
                  {credits}
                </span>
                <span className="text-gray-600 text-xs">Credits</span>
              </div>
            </div>
          </div>
        )}

        {/* User Menu */}
        <div className="relative z-50">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center space-x-3 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-xl px-4 py-2 transition-all duration-200 group"
          >
            <div className="w-8 h-8 bg-gradient-to-r from-[#3834A8] to-[#2A1B5D] rounded-lg flex items-center justify-center">
              <User size={16} className="text-white" />
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-gray-800">
                {user?.name || "User"}
              </p>
              <p className="text-xs text-gray-600">
                {user?.email || "user@example.com"}
              </p>
            </div>
            <ChevronDown
              size={14}
              className={`text-gray-600 transition-transform duration-200 ${
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
              <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-gray-200 rounded-2xl shadow-2xl z-[9999] overflow-hidden">
                {/* User Info Section */}
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-[#3834A8] to-[#2A1B5D] rounded-xl flex items-center justify-center shadow-md">
                      <User size={20} className="text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">
                        {user?.name || "User"}
                      </p>
                      <p className="text-xs text-gray-600">
                        {user?.email || "user@example.com"}
                      </p>
                    </div>
                  </div>

                  {/* Credits on mobile (hidden for super admins) */}
                  {!isSuperAdmin && (
                    <div className="md:hidden mt-3 p-2 bg-[#00E5FF]/10 border border-[#00B8D4]/30 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Zap size={14} className="text-[#0097A7]" />
                          <span className="text-[#0097A7] font-semibold text-sm">
                            {credits}
                          </span>
                        </div>
                        <span className="text-gray-600 text-xs">
                          Credits Available
                        </span>
                      </div>
                    </div>
                  )}
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
                      className="w-full text-left px-3 py-3 text-sm text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-200 flex items-center space-x-3 group"
                    >
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          userRole?.toLowerCase() === "issuer"
                            ? "bg-[#3834A8]/20 text-[#3834A8]"
                            : "bg-[#00B8D4]/20 text-[#00B8D4]"
                        }`}
                      >
                        {userRole?.toLowerCase() === "issuer" ? (
                          <User size={16} />
                        ) : (
                          <Crown size={16} />
                        )}
                      </div>
                      <div>
                        <p className="font-medium group-hover:text-gray-900 transition-colors">
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
                      className="w-full text-left px-3 py-3 text-sm text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-200 flex items-center space-x-3 group"
                    >
                      <div className="w-8 h-8 bg-[#3834A8]/20 rounded-lg flex items-center justify-center">
                        <FolderOpen
                          size={16}
                          className="text-[#3834A8] group-hover:text-[#2A1B5D] transition-colors"
                        />
                      </div>
                      <div>
                        <p className="font-medium group-hover:text-gray-900 transition-colors">
                          My Issued Documents
                        </p>
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
                      className="w-full text-left px-3 py-3 text-sm text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-200 flex items-center space-x-3 group"
                    >
                      <div className="w-8 h-8 bg-[#00B8D4]/20 rounded-lg flex items-center justify-center">
                        <Award
                          size={16}
                          className="text-[#00B8D4] group-hover:text-[#0097A7] transition-colors"
                        />
                      </div>
                      <div>
                        <p className="font-medium group-hover:text-gray-900 transition-colors">
                          My Documents
                        </p>
                        <p className="text-xs text-gray-600">
                          View all your certificates
                        </p>
                      </div>
                    </button>
                  )}

                  <button className="w-full text-left px-3 py-3 text-sm text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-200 flex items-center space-x-3 group">
                    <div className="w-8 h-8 bg-gray-300 rounded-lg flex items-center justify-center">
                      <Settings
                        size={16}
                        className="text-gray-600 group-hover:text-gray-800 transition-colors"
                      />
                    </div>
                    <div>
                      <p className="font-medium group-hover:text-gray-900 transition-colors">
                        Settings
                      </p>
                      <p className="text-xs text-gray-600">
                        Manage your preferences
                      </p>
                    </div>
                  </button>

                  <div className="border-t border-gray-200 mt-2 pt-2">
                    <button
                      onClick={logout}
                      className="w-full text-left px-3 py-3 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 flex items-center space-x-3 group"
                    >
                      <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                        <LogOut size={16} className="text-red-600" />
                      </div>
                      <div>
                        <p className="font-medium">Sign Out</p>
                        <p className="text-xs text-red-400">
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
