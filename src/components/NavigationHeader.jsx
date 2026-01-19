import { useState } from "react";
import {
  ArrowLeft,
  Home,
  Menu,
  X,
  FileText,
  Shield,
  Upload,
  CheckCircle,
  Coins,
  Key,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import useWalletStore from "../store/wallet";
import CreditBalance from "./CreditBalance";
import { Crown } from "lucide-react";

const NavigationHeader = ({ title, showBack = true }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userRole, user } = useWalletStore();
  const [showSideNav, setShowSideNav] = useState(false);

  // Normalize role for comparison
  const normalizedRole =
    userRole?.toUpperCase() || user?.role?.toUpperCase() || "USER";
  const isSuperAdmin = normalizedRole === "SUPER_ADMIN";

  const getPageTitle = () => {
    switch (location.pathname) {
      case "/dashboard":
        return "Dashboard";
      case "/batch-upload":
        return "Batch Upload";
      case "/verify":
        return "Verify";
      case "/login":
        return "Login";
      case "/register":
        return "Register";
      default:
        return title || "XertiQ";
    }
  };

  const getBreadcrumbs = () => {
    const path = location.pathname;
    const breadcrumbs = [];

    if (path !== "/dashboard") {
      breadcrumbs.push({ name: "Home", path: "/dashboard", icon: Home });
    }

    switch (path) {
      case "/batch-upload":
        breadcrumbs.push({
          name: "Batch Upload",
          path: "/batch-upload",
          icon: Upload,
        });
        break;
      case "/verify":
        breadcrumbs.push({ name: "Verify", path: "/verify", icon: Shield });
        break;
    }

    return breadcrumbs;
  };

  const menuItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: Home,
      visible: true,
    },
    {
      name:
        normalizedRole === "ISSUER" ? "Issue Certificates" : "Verify Document",
      path: normalizedRole === "ISSUER" ? "/batch-upload" : "/verify",
      icon: normalizedRole === "ISSUER" ? Upload : Shield,
      visible: !isSuperAdmin,
    },
    {
      name: "Super Admin",
      path: "/super-admin",
      icon: Crown,
      visible: isSuperAdmin,
      highlight: true,
    },
    {
      name: "Batch Upload",
      path: "/batch-upload",
      icon: Upload,
      visible: normalizedRole === "ISSUER" && !isSuperAdmin,
    },
    {
      name: "Key Management",
      path: "/key-management",
      icon: Key,
      visible: normalizedRole === "ISSUER" && !isSuperAdmin,
    },
    {
      name: "Verify Document",
      path: "/verify",
      icon: Shield,
      visible: true,
    },
    {
      name: "Buy Credits",
      path: "/purchase-credits",
      icon: Coins,
      visible: !isSuperAdmin,
      highlight: true,
    },
  ];

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/dashboard");
    }
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <>
      <div className="bg-white/5 backdrop-blur-xl border-b border-white/10 px-3 py-2">
        <div className="flex items-center justify-between">
          {/* Left Side - Back Button & Breadcrumbs */}
          <div className="flex items-center space-x-2 flex-1 min-w-0">
            {showBack && location.pathname !== "/dashboard" && (
              <button
                onClick={handleBack}
                className="flex items-center justify-center w-8 h-8 bg-white/10 hover:bg-white/15 border border-white/20 rounded-lg transition-all duration-200"
              >
                <ArrowLeft size={16} className="text-gray-300" />
              </button>
            )}

            {/* Breadcrumbs */}
            <div className="flex items-center space-x-1 min-w-0">
              {breadcrumbs.length > 0 ? (
                <div className="flex items-center space-x-1 text-xs">
                  {breadcrumbs.map((crumb, index) => (
                    <div
                      key={crumb.path}
                      className="flex items-center space-x-1"
                    >
                      {index > 0 && <span className="text-gray-500">/</span>}
                      <button
                        onClick={() => navigate(crumb.path)}
                        className="flex items-center space-x-1 text-primary-600 hover:text-primary-400 hover:shadow-lg transition-colors"
                      >
                        <crumb.icon size={12} />
                        <span className="truncate max-w-20">{crumb.name}</span>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Home size={14} className="text-primary-600" />
                  <h1 className="text-sm font-semibold text-primary-600 truncate">
                    {getPageTitle()}
                  </h1>
                </div>
              )}
            </div>
          </div>

          {/* Center/Right Side - Credit Balance & Menu Button */}
          <div className="flex items-center gap-3">
            {!isSuperAdmin && <CreditBalance size="sm" />}

            <button
              onClick={() => setShowSideNav(true)}
              className="flex items-center justify-center w-8 h-8 bg-white/10 hover:bg-white/15 border border-white/20 rounded-lg transition-all duration-200"
            >
              <Menu size={16} className="text-gray-300" />
            </button>
          </div>
        </div>
      </div>

      {/* Side Navigation Overlay */}
      {showSideNav && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={() => setShowSideNav(false)}
          />

          {/* Side Navigation Panel */}
          <div className="fixed right-0 top-0 h-full w-64 bg-[#1a1347]/98 backdrop-blur-xl border-l border-white/20 z-50 transform transition-transform duration-300">
            <div className="p-4">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-white">Navigation</h2>
                <button
                  onClick={() => setShowSideNav(false)}
                  className="w-8 h-8 bg-white/10 hover:bg-white/15 border border-white/20 rounded-lg flex items-center justify-center transition-all duration-200"
                >
                  <X size={16} className="text-gray-300" />
                </button>
              </div>

              {/* Navigation Items */}
              <div className="space-y-2">
                {menuItems
                  .filter((item) => item.visible)
                  .map((item) => (
                    <button
                      key={item.path}
                      onClick={() => {
                        navigate(item.path);
                        setShowSideNav(false);
                      }}
                      className={`w-full flex items-center space-x-3 px-3 py-3 rounded-xl transition-all duration-200 ${
                        location.pathname === item.path
                          ? "bg-[#3834A8]/20 border border-[#00E5FF]/30 text-[#00E5FF]"
                          : item.highlight
                            ? "bg-gradient-to-r from-green-500/20 to-brand-primary/20 border border-green-400/30 text-green-300 hover:from-green-500/30 hover:to-brand-primary/30"
                            : "text-gray-300 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          location.pathname === item.path
                            ? "bg-[#3834A8]/30"
                            : item.highlight
                              ? "bg-green-500/30"
                              : "bg-white/10"
                        }`}
                      >
                        <item.icon size={16} />
                      </div>
                      <span className="font-medium">{item.name}</span>
                      {item.highlight && (
                        <span className="ml-auto text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">
                          New
                        </span>
                      )}
                    </button>
                  ))}
              </div>

              {/* Role Info */}
              {!isSuperAdmin && (
                <div className="mt-6 p-3 bg-gradient-to-r from-white/5 to-white/10 border border-white/10 rounded-xl">
                  <div className="flex items-center space-x-2 mb-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        normalizedRole === "ISSUER"
                          ? "bg-[#2A1B5D]"
                          : "bg-[#3834A8]"
                      }`}
                    />
                    <span className="text-sm font-semibold text-white capitalize">
                      {userRole || "User"} Mode
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">
                    {normalizedRole === "ISSUER"
                      ? "Create and manage certificates"
                      : "Verify document authenticity"}
                  </p>
                </div>
              )}
              {isSuperAdmin && (
                <div className="mt-6 p-3 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-xl">
                  <div className="flex items-center space-x-2 mb-2">
                    <Crown size={14} className="text-yellow-400" />
                    <span className="text-sm font-semibold text-white">
                      Super Admin Mode
                    </span>
                    <span className="ml-auto text-xs bg-yellow-400 text-gray-900 px-2 py-0.5 rounded-full font-bold">
                      OWNER
                    </span>
                  </div>
                  <p className="text-xs text-gray-300">
                    Full platform management and control
                  </p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default NavigationHeader;
