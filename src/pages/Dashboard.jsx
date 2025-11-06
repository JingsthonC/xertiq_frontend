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
  const { credits, documents, userRole } = useWalletStore();
  const isExt = isExtension();

  const quickActions = [
    {
      title: userRole === "issuer" ? "Issue Certificate" : "Verify Document",
      description:
        userRole === "issuer"
          ? "Create new certificates"
          : "Verify authenticity",
      icon: userRole === "issuer" ? Plus : Shield,
      action: () =>
        navigate(userRole === "issuer" ? "/batch-upload" : "/verify"),
      gradient:
        userRole === "issuer"
          ? "from-purple-500 to-pink-500"
          : "from-green-500 to-emerald-400",
    },
    {
      title: "PDF Generator",
      description: "Design & generate certificate PDFs",
      icon: FileText,
      action: () => navigate("/certificate-generator"),
      gradient: "from-orange-500 to-red-400",
      visible: userRole === "issuer",
    },
    {
      title: "Designer POC",
      description: "Compare Fabric.js vs Current",
      icon: Zap,
      action: () => navigate("/designer-comparison"),
      gradient: "from-yellow-500 to-orange-400",
      visible: userRole === "issuer",
      badge: "NEW",
    },
    {
      title: "Batch Upload",
      description: "Process multiple certificates",
      icon: Upload,
      action: () => navigate("/batch-upload"),
      gradient: "from-blue-500 to-cyan-400",
      visible: userRole === "issuer",
    },
  ];

  const stats = [
    {
      title: "Documents",
      value: documents.length,
      icon: FileText,
      gradient: "from-blue-500 to-cyan-400",
    },
    {
      title: "Verified",
      value: documents.filter((d) => d.status === "verified").length,
      icon: CheckCircle,
      gradient: "from-green-500 to-emerald-400",
    },
    {
      title: "Credits",
      value: credits,
      icon: Zap,
      gradient: "from-purple-500 to-pink-500",
    },
  ];

  if (isExt) {
    return (
      <div className="h-full bg-gradient-to-br from-[#0a0e27] via-[#1a1347] to-[#0f0f23] text-white overflow-hidden flex flex-col">
        <ExtensionHeader />
        <NavigationHeader title="Dashboard" showBack={false} />

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-2">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-3"
              >
                <div
                  className={`w-8 h-8 bg-gradient-to-r ${stat.gradient} rounded-lg flex items-center justify-center mb-2`}
                >
                  <stat.icon size={16} className="text-white" />
                </div>
                <p className="text-lg font-bold text-white">{stat.value}</p>
                <p className="text-xs text-gray-400">{stat.title}</p>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-300 mb-2">
              Quick Actions
            </h3>
            {quickActions
              .filter((action) => action.visible !== false)
              .map((action, index) => (
                <button
                  key={index}
                  onClick={action.action}
                  className="w-full bg-white/5 hover:bg-white/10 backdrop-blur border border-white/10 rounded-xl p-3 transition-all duration-200 group"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-10 h-10 bg-gradient-to-r ${action.gradient} rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform`}
                    >
                      <action.icon size={18} className="text-white" />
                    </div>
                    <div className="text-left flex-1">
                      <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                        {action.title}
                        {action.badge && (
                          <span className="text-[10px] bg-yellow-400 text-gray-900 px-2 py-0.5 rounded-full font-bold">
                            {action.badge}
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-gray-400">
                        {action.description}
                      </p>
                    </div>
                    <ExternalLink
                      size={14}
                      className="text-gray-400 group-hover:text-white transition-colors"
                    />
                  </div>
                </button>
              ))}
          </div>

          {/* Recent Activity */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-300 mb-2">
              Recent Activity
            </h3>
            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-3">
              {documents.length > 0 ? (
                <div className="space-y-2">
                  {documents.slice(0, 3).map((doc, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-2 p-2 bg-white/5 rounded-lg"
                    >
                      <div className="w-6 h-6 bg-blue-500/20 rounded-md flex items-center justify-center">
                        <FileText size={12} className="text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-white truncate">
                          {doc.filename || "Document"}
                        </p>
                        <p className="text-xs text-gray-400">2 hours ago</p>
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
                  <Clock size={24} className="text-gray-500 mx-auto mb-2" />
                  <p className="text-xs text-gray-400">No recent activity</p>
                </div>
              )}
            </div>
          </div>

          {/* Role Info */}
          <div className="bg-gradient-to-r from-white/5 to-white/10 backdrop-blur border border-white/10 rounded-xl p-3">
            <div className="flex items-center space-x-2 mb-2">
              <User size={14} className="text-blue-400" />
              <span className="text-sm font-semibold text-white capitalize">
                {userRole} Mode
              </span>
            </div>
            <p className="text-xs text-gray-400">
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
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#1a1347] to-[#0f0f23]">
      <Header />
      <NavigationHeader title="Dashboard" showBack={false} />

      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
            <p className="text-gray-300">
              Welcome to your XertiQ certificate management platform
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`w-16 h-16 bg-gradient-to-r ${stat.gradient} rounded-2xl flex items-center justify-center`}
                  >
                    <stat.icon size={32} className="text-white" />
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-white">
                      {stat.value}
                    </p>
                    <p className="text-sm text-gray-400">{stat.title}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Quick Actions */}
            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6">
                Quick Actions
              </h2>
              <div className="space-y-4">
                {quickActions
                  .filter((action) => action.visible !== false)
                  .map((action, index) => (
                    <button
                      key={index}
                      onClick={action.action}
                      className="w-full bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-6 transition-all duration-200 group text-left"
                    >
                      <div className="flex items-center space-x-4">
                        <div
                          className={`w-16 h-16 bg-gradient-to-r ${action.gradient} rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform`}
                        >
                          <action.icon size={24} className="text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-white group-hover:text-blue-100 flex items-center gap-2">
                            {action.title}
                            {action.badge && (
                              <span className="text-xs bg-yellow-400 text-gray-900 px-2 py-1 rounded-full font-bold">
                                {action.badge}
                              </span>
                            )}
                          </h3>
                          <p className="text-gray-400 group-hover:text-gray-300">
                            {action.description}
                          </p>
                        </div>
                        <ExternalLink
                          size={20}
                          className="text-gray-400 group-hover:text-white transition-colors"
                        />
                      </div>
                    </button>
                  ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6">
                Recent Activity
              </h2>
              <div className="space-y-4">
                {documents.length > 0 ? (
                  documents.slice(0, 5).map((doc, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-4 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
                    >
                      <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                        <FileText size={20} className="text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-medium">
                          {doc.filename || "Document"}
                        </p>
                        <p className="text-sm text-gray-400">2 hours ago</p>
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
                    <Clock size={48} className="text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400">No recent activity</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Start by uploading your first certificate
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Role Information */}
          <div className="mt-8 bg-gradient-to-r from-white/5 to-white/10 border border-white/10 rounded-2xl p-8">
            <div className="flex items-center space-x-4 mb-4">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  userRole === "issuer" ? "bg-purple-500/20" : "bg-blue-500/20"
                }`}
              >
                <User
                  size={24}
                  className={
                    userRole === "issuer" ? "text-purple-400" : "text-blue-400"
                  }
                />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white capitalize">
                  {userRole} Mode
                </h3>
                <p className="text-gray-400">
                  {userRole === "issuer"
                    ? "Create and manage certificates with advanced metadata and blockchain verification."
                    : "Verify document authenticity using blockchain technology and explore certificate details."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
