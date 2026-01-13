import { useEffect } from "react";
import {
  FileText,
  Shield,
  Upload,
  CheckCircle,
  Plus,
  ExternalLink,
  Zap,
  Clock,
  User,
  Coins,
  FolderOpen,
  Award,
  Crown,
} from "lucide-react";
import useWalletStore from "../store/wallet";
import Header from "../components/Header";
import ExtensionHeader from "../components/ExtensionHeader";
import NavigationHeader from "../components/NavigationHeader";
import { useNavigate } from "react-router-dom";

// Detect if running as Chrome extension
const isExtension = () => {
  return (
    typeof window !== "undefined" &&
    typeof window.chrome !== "undefined" &&
    window.chrome.runtime &&
    window.chrome.runtime.id
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { credits, documents, userRole, user } = useWalletStore();
  const isExt = isExtension();

  // Normalize role for comparison (handle both uppercase and lowercase)
  const normalizedRole =
    userRole?.toUpperCase() || user?.role?.toUpperCase() || "USER";
  const isSuperAdmin = normalizedRole === "SUPER_ADMIN";

  // Redirect SUPER_ADMIN users immediately to super admin dashboard
  useEffect(() => {
    if (isSuperAdmin) {
      navigate("/super-admin", { replace: true });
    }
  }, [isSuperAdmin, navigate]);

  // Don't render anything for SUPER_ADMIN - they should be redirected
  if (isSuperAdmin) {
    return null;
  }

  const quickActions = [
    {
      title:
        normalizedRole === "ISSUER" ? "Issue Certificate" : "Verify Document",
      description:
        normalizedRole === "ISSUER"
          ? "Create new certificates"
          : "Verify authenticity",
      icon: normalizedRole === "ISSUER" ? Plus : Shield,
      action: () =>
        navigate(normalizedRole === "ISSUER" ? "/batch-upload" : "/verify"),
      gradient:
        normalizedRole === "ISSUER"
          ? "from-dark to-darker"
          : "from-success to-success",
      visible: !isSuperAdmin,
    },
    {
      title: "Buy Credits",
      description: "Purchase more credits",
      icon: Coins,
      action: () => navigate("/purchase-credits"),
      gradient: "from-success to-success",
      badge: "💰",
      visible: !isSuperAdmin,
    },
    {
      title: "PDF Generator",
      description: "Design & generate certificate PDFs",
      icon: FileText,
      action: () => navigate("/certificate-generator"),
      gradient: "from-dark to-darker",
      visible: normalizedRole === "ISSUER" && !isSuperAdmin,
    },
    {
      title: "Designer POC",
      description: "Compare Fabric.js vs Current",
      icon: Zap,
      action: () => navigate("/designer-comparison"),
      gradient: "from-dark to-darker",
      visible: normalizedRole === "ISSUER" && !isSuperAdmin,
      badge: "NEW",
    },
    {
      title: "Batch Upload",
      description: "Process multiple certificates",
      icon: Upload,
      action: () => navigate("/batch-upload"),
      gradient: "from-dark to-darker",
      visible: normalizedRole === "ISSUER" && !isSuperAdmin,
    },
    {
      title: "My Issued Documents",
      description: "View all documents you've issued",
      icon: FolderOpen,
      action: () => navigate("/issuer-dashboard"),
      gradient: "from-dark to-darker",
      visible: normalizedRole === "ISSUER" && !isSuperAdmin,
    },
    {
      title: "My Documents",
      description: "View all your certificates and documents",
      icon: Award,
      action: () => navigate("/holder-dashboard"),
      gradient: "from-dark to-darker",
      visible:
        (normalizedRole === "USER" || normalizedRole === "HOLDER") &&
        !isSuperAdmin,
    },
    {
      title: "Super Admin",
      description: "Full platform visibility and control",
      icon: Crown,
      action: () => navigate("/super-admin"),
      gradient: "from-dark to-darker",
      visible: userRole === "SUPER_ADMIN",
      badge: "OWNER",
    },
  ];

  const stats = [
    {
      title: "Documents",
      value: documents.length,
      icon: FileText,
      gradient: "from-dark to-darker",
    },
    {
      title: "Verified",
      value: documents.filter((d) => d.status === "verified").length,
      icon: CheckCircle,
      gradient: "from-success to-success",
    },
    {
      title: "Credits",
      value: credits,
      icon: Zap,
      gradient: "from-dark to-darker",
    },
  ];

  if (isExt) {
    return (
      <div className="h-full bg-brand-background text-brand-text overflow-hidden flex flex-col">
        <ExtensionHeader />
        <NavigationHeader title="Dashboard" showBack={false} />

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-2">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-white border border-brand-secondary/60 rounded-xl p-3 shadow-sm"
              >
                <div
                  className={`w-8 h-8 bg-gradient-to-r from-brand-primary to-brand-primaryDark rounded-lg flex items-center justify-center mb-2`}
                >
                  <stat.icon size={16} className="text-white" />
                </div>
                <p className="text-lg font-bold text-brand-text">
                  {stat.value}
                </p>
                <p className="text-xs text-brand-primary">{stat.title}</p>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-brand-primary mb-2">
              Quick Actions
            </h3>
            {quickActions
              .filter((action) => action.visible !== false)
              .map((action, index) => (
                <button
                  key={index}
                  onClick={action.action}
                  className="w-full bg-white hover:bg-lightest border border-light rounded-xl p-3 transition-all duration-200 group shadow-sm"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-dark hover:bg-darker rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                      <action.icon size={18} className="text-white" />
                    </div>
                    <div className="text-left flex-1">
                      <h4 className="text-sm font-semibold text-dark flex items-center gap-2">
                        {action.title}
                        {action.badge && (
                          <span className="text-[10px] bg-light text-dark px-2 py-0.5 rounded-full font-bold">
                            {action.badge}
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-medium">
                        {action.description}
                      </p>
                    </div>
                    <ExternalLink
                      size={14}
                      className="text-medium group-hover:text-dark transition-colors"
                    />
                  </div>
                </button>
              ))}
          </div>

          {/* Recent Activity */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-brand-primary mb-2">
              Recent Activity
            </h3>
            <div className="bg-white border border-brand-secondary/60 rounded-xl p-3 shadow-sm">
              {documents.length > 0 ? (
                <div className="space-y-2">
                  {documents.slice(0, 3).map((doc, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-2 p-2 bg-brand-background rounded-lg border border-brand-secondary/40"
                    >
                      <div className="w-6 h-6 bg-brand-primary/20 rounded-md flex items-center justify-center">
                        <FileText size={12} className="text-brand-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-brand-text truncate">
                          {doc.filename || "Document"}
                        </p>
                        <p className="text-xs text-brand-primary">
                          2 hours ago
                        </p>
                      </div>
                      <div
                        className={`w-2 h-2 rounded-full ${
                          doc.status === "verified"
                            ? "bg-green-400"
                            : "bg-yellow-400"
                        }`}
                      ></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <Clock
                    size={24}
                    className="text-brand-secondary mx-auto mb-2"
                  />
                  <p className="text-xs text-brand-primary">
                    No recent activity
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Role Info */}
          <div className="bg-white border border-brand-secondary/60 rounded-xl p-3 shadow-sm">
            <div className="flex items-center space-x-2 mb-2">
              <User size={14} className="text-brand-primary" />
              <span className="text-sm font-semibold text-brand-text capitalize">
                {userRole} Mode
              </span>
            </div>
            <p className="text-xs text-brand-primary">
              {userRole === "issuer"
                ? "Create and manage certificates with advanced metadata."
                : "Verify document authenticity using blockchain technology."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-background">
      <Header />
      <NavigationHeader title="Dashboard" showBack={false} />

      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-brand-primary mb-2">
              Dashboard
            </h1>
            <p className="text-brand-primary">
              Welcome to your XertiQ certificate management platform
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-white border border-brand-secondary/60 rounded-2xl p-6 hover:bg-brand-background transition-all duration-300 shadow-sm"
              >
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`w-16 h-16 bg-gradient-to-r from-brand-primary to-brand-primaryDark rounded-2xl flex items-center justify-center`}
                  >
                    <stat.icon size={32} className="text-white" />
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-brand-text">
                      {stat.value}
                    </p>
                    <p className="text-sm text-brand-primary">{stat.title}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Quick Actions */}
            <div className="bg-white border border-brand-secondary/60 rounded-2xl p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-brand-primary mb-6">
                Quick Actions
              </h2>
              <div className="space-y-4">
                {quickActions
                  .filter((action) => action.visible !== false)
                  .map((action, index) => (
                    <button
                      key={index}
                      onClick={action.action}
                      className="w-full bg-white hover:bg-brand-background border border-brand-secondary/60 rounded-xl p-6 transition-all duration-200 group text-left shadow-sm"
                    >
                      <div className="flex items-center space-x-4">
                        <div
                          className={`w-16 h-16 bg-gradient-to-r from-brand-primary to-brand-primaryDark rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform`}
                        >
                          <action.icon size={24} className="text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-brand-text flex items-center gap-2">
                            {action.title}
                            {action.badge && (
                              <span className="text-xs bg-brand-secondary text-brand-text px-2 py-1 rounded-full font-bold">
                                {action.badge}
                              </span>
                            )}
                          </h3>
                          <p className="text-brand-primary">
                            {action.description}
                          </p>
                        </div>
                        <ExternalLink
                          size={20}
                          className="text-brand-primary group-hover:text-brand-primaryDark transition-colors"
                        />
                      </div>
                    </button>
                  ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white border border-brand-secondary/60 rounded-2xl p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-brand-primary mb-6">
                Recent Activity
              </h2>
              <div className="space-y-4">
                {documents.length > 0 ? (
                  documents.slice(0, 5).map((doc, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-4 p-4 bg-brand-background rounded-xl hover:bg-white transition-colors border border-brand-secondary/40"
                    >
                      <div className="w-12 h-12 bg-brand-primary/20 rounded-xl flex items-center justify-center">
                        <FileText size={20} className="text-brand-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-brand-text font-medium">
                          {doc.filename || "Document"}
                        </p>
                        <p className="text-sm text-brand-primary">
                          2 hours ago
                        </p>
                      </div>
                      <div
                        className={`w-3 h-3 rounded-full ${
                          doc.status === "verified"
                            ? "bg-green-400"
                            : "bg-yellow-400"
                        }`}
                      />
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <Clock
                      size={48}
                      className="text-brand-secondary mx-auto mb-4"
                    />
                    <p className="text-brand-primary">No recent activity</p>
                    <p className="text-sm text-brand-primaryDark mt-2">
                      Start by uploading your first certificate
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Role Information */}
          {!isSuperAdmin && (
            <div className="mt-8 bg-white border border-brand-secondary/60 rounded-2xl p-8 shadow-sm">
              <div className="flex items-center space-x-4 mb-4">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center bg-brand-primary/20`}
                >
                  <User size={24} className="text-brand-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-brand-text capitalize">
                    {userRole || "User"} Mode
                  </h3>
                  <p className="text-brand-primary">
                    {normalizedRole === "ISSUER"
                      ? "Create and manage certificates with advanced metadata and blockchain verification."
                      : "Verify document authenticity using blockchain technology and explore certificate details."}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
