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
  TrendingUp,
  History,
  Wallet,
  AlertCircle,
} from "lucide-react";
import useWalletStore from "../store/wallet";
import Header from "../components/Header";
import ExtensionHeader from "../components/ExtensionHeader";
import { useNavigate } from "react-router-dom";

// Detect if running as Chrome extension
const isExtension = () => {
  return typeof window !== 'undefined' && 
         typeof window.chrome !== 'undefined' && 
         window.chrome.runtime && 
         window.chrome.runtime.id;
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { credits, documents, userRole } = useWalletStore();
  const isExt = isExtension();

  const quickActions = [
    {
      title: userRole === 'issuer' ? 'Issue Certificate' : 'Verify Document',
      description: userRole === 'issuer' ? 'Create new certificates' : 'Verify authenticity',
      icon: userRole === 'issuer' ? Plus : Shield,
      action: () => navigate(userRole === 'issuer' ? '/batch-upload' : '/verify'),
      gradient: userRole === 'issuer' ? 'from-purple-500 to-pink-500' : 'from-green-500 to-emerald-400',
    },
    {
      title: 'Batch Upload',
      description: 'Process multiple certificates',
      icon: Upload,
      action: () => navigate('/batch-upload'),
      gradient: 'from-blue-500 to-cyan-400',
      visible: userRole === 'issuer'
    }
  ];

  const stats = [
    {
      title: 'Documents',
      value: documents.length,
      icon: FileText,
      gradient: 'from-blue-500 to-cyan-400',
    },
    {
      title: 'Verified',
      value: documents.filter((d) => d.status === 'verified').length,
      icon: CheckCircle,
      gradient: 'from-green-500 to-emerald-400',
    },
    {
      title: 'Credits',
      value: credits,
      icon: Zap,
      gradient: 'from-purple-500 to-pink-500',
    },
  ];

  if (isExt) {
    return (
      <div className="h-full bg-gradient-to-br from-[#0a0e27] via-[#1a1347] to-[#0f0f23] text-white overflow-y-auto">
        <ExtensionHeader />
        
        <div className="p-4 space-y-4">
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-2">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-3">
                <div className={`w-8 h-8 bg-gradient-to-r ${stat.gradient} rounded-lg flex items-center justify-center mb-2`}>
                  <stat.icon size={16} className="text-white" />
                </div>
                <p className="text-lg font-bold text-white">{stat.value}</p>
                <p className="text-xs text-gray-400">{stat.title}</p>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-300 mb-2">Quick Actions</h3>
            {quickActions.filter(action => action.visible !== false).map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                className="w-full bg-white/5 hover:bg-white/10 backdrop-blur border border-white/10 rounded-xl p-3 transition-all duration-200 group"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 bg-gradient-to-r ${action.gradient} rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform`}>
                    <action.icon size={18} className="text-white" />
                  </div>
                  <div className="text-left flex-1">
                    <h4 className="text-sm font-semibold text-white">{action.title}</h4>
                    <p className="text-xs text-gray-400">{action.description}</p>
                  </div>
                  <ExternalLink size={14} className="text-gray-400 group-hover:text-white transition-colors" />
                </div>
              </button>
            ))}
          </div>

          {/* Recent Activity */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-300 mb-2">Recent Activity</h3>
            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-3">
              {documents.length > 0 ? (
                <div className="space-y-2">
                  {documents.slice(0, 3).map((doc, index) => (
                    <div key={index} className="flex items-center space-x-2 p-2 bg-white/5 rounded-lg">
                      <div className="w-6 h-6 bg-blue-500/20 rounded-md flex items-center justify-center">
                        <FileText size={12} className="text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-white truncate">{doc.filename || 'Document'}</p>
                        <p className="text-xs text-gray-400">2 hours ago</p>
                      </div>
                      <div className={`w-2 h-2 rounded-full ${doc.status === 'verified' ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
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
              <span className="text-sm font-semibold text-white capitalize">{userRole} Mode</span>
            </div>
            <p className="text-xs text-gray-400">
              {userRole === 'issuer' 
                ? 'Create and manage certificates with advanced metadata.' 
                : 'Verify document authenticity using blockchain technology.'
              }
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#1a1347] to-[#0f0f23]">
      <Header />
      <div className="p-8">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold">Web Dashboard</h2>
          <p className="text-gray-400">Full web version coming soon...</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

  const stats = [
    {
      title: "Total Documents",
      value: documents.length,
      icon: FileText,
      gradient: "from-blue-500 to-cyan-400",
      change: "+12%",
      trend: "up",
    },
    {
      title: "Verified",
      value: documents.filter((d) => d.status === "verified").length,
      icon: Shield,
      gradient: "from-green-500 to-emerald-400",
      change: "+8%",
      trend: "up",
    },
    {
      title: "Credits",
      value: credits,
      icon: Wallet,
      gradient: "from-purple-500 to-pink-500",
      change: "-2",
      trend: "down",
    },
  ];

  const recentActivity = [
    {
      type: "upload",
      title: "Certificate uploaded",
      time: "2 minutes ago",
      status: "success",
    },
    {
      type: "verify",
      title: "Document verified",
      time: "1 hour ago",
      status: "success",
    },
    {
      type: "pending",
      title: "Verification pending",
      time: "3 hours ago",
      status: "pending",
    },
  ];

  const quickActions = [
    {
      title: "Process Certificates",
      description: "Upload PDF certificates and CSV metadata for batch processing",
      icon: Upload,
      gradient: "from-blue-500 to-cyan-400",
      action: () => navigate("/batch-upload"),
    },
    {
      title: "Verify Document",
      description: "Verify document authenticity on blockchain",
      icon: Shield,
      gradient: "from-green-500 to-emerald-400",
      action: () => navigate("/verify"),
    },
    {
      title: "View Transactions",
      description: "Check your blockchain activity and history",
      icon: History,
      gradient: "from-purple-500 to-pink-500",
      action: () => console.log("View transactions"),
    },
    {
      title: "Buy Credits",
      description: "Purchase verification credits for documents",
      icon: Plus,
      gradient: "from-orange-500 to-red-500",
      action: () => console.log("Buy credits"),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#1a1347] to-[#0f0f23]">
      {/* Header Component */}
      <Header />

      <div className="p-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="group relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-6 hover:border-white/40 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20"
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`w-16 h-16 bg-gradient-to-br ${
                    stat.gradient
                  } rounded-2xl flex items-center justify-center shadow-xl shadow-${
                    stat.gradient.split("-")[1]
                  }-500/30 group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300`}
                >
                  <stat.icon size={28} className="text-white" />
                </div>
                <div
                  className={`flex items-center space-x-1.5 text-sm font-bold px-3 py-1.5 rounded-full ${
                    stat.trend === "up"
                      ? "bg-green-500/20 text-green-300 border border-green-400/30"
                      : "bg-red-500/20 text-red-300 border border-red-400/30"
                  }`}
                >
                  <TrendingUp
                    size={14}
                    className={stat.trend === "down" ? "rotate-180" : ""}
                  />
                  <span>{stat.change}</span>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-400 uppercase tracking-wider font-semibold mb-1">
                  {stat.title}
                </p>
                <p className="text-4xl font-bold text-white">{stat.value}</p>
              </div>
              <div
                className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
              ></div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Quick Actions */}
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-xl">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-3">
              <span>Quick Actions</span>
              <div className="w-2.5 h-2.5 bg-blue-400 rounded-full shadow-lg shadow-blue-400/50"></div>
            </h2>
            <div className="space-y-4">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.action}
                  className="group w-full bg-gradient-to-r from-white/10 to-white/5 hover:from-white/15 hover:to-white/10 border border-white/20 hover:border-white/40 rounded-xl p-5 text-left transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className={`w-14 h-14 bg-gradient-to-br ${action.gradient} rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300`}
                    >
                      <action.icon size={24} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-bold text-lg group-hover:text-blue-100 transition-colors duration-200">
                        {action.title}
                      </p>
                      <p className="text-gray-300 text-sm mt-1.5 group-hover:text-gray-200 transition-colors duration-200">
                        {action.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-xl">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-3">
              <span>Recent Activity</span>
              <div className="w-2.5 h-2.5 bg-purple-400 rounded-full shadow-lg shadow-purple-400/50"></div>
            </h2>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-4 p-4 bg-gradient-to-r from-white/10 to-white/5 rounded-xl border border-white/20 hover:border-white/30 transition-all duration-300 hover:scale-[1.02]"
                >
                  <div className="flex-shrink-0">
                    {activity.status === "success" && (
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500/30 to-emerald-500/30 border border-green-400/40 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20">
                        <CheckCircle size={22} className="text-green-300" />
                      </div>
                    )}
                    {activity.status === "pending" && (
                      <div className="w-12 h-12 bg-gradient-to-br from-yellow-500/30 to-amber-500/30 border border-yellow-400/40 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-500/20">
                        <Clock size={22} className="text-yellow-300" />
                      </div>
                    )}
                    {activity.status === "error" && (
                      <div className="w-12 h-12 bg-gradient-to-br from-red-500/30 to-pink-500/30 border border-red-400/40 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/20">
                        <AlertCircle size={22} className="text-red-300" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-semibold text-base">
                      {activity.title}
                    </p>
                    <p className="text-gray-300 text-sm mt-0.5">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="mt-8 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-xl">
          <h2 className="text-2xl font-bold text-white mb-8">
            Platform Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="group p-6 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl border border-blue-400/40 hover:border-blue-300/60 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/30">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500/40 to-cyan-500/40 border border-blue-400/50 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-blue-500/30">
                <Shield size={26} className="text-blue-200" />
              </div>
              <h3 className="text-white font-bold text-lg mb-3">
                Blockchain Security
              </h3>
              <p className="text-gray-200 text-sm leading-relaxed">
                Immutable document verification powered by Solana blockchain
                technology.
              </p>
            </div>

            <div className="group p-6 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl border border-purple-400/40 hover:border-purple-300/60 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/30">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500/40 to-pink-500/40 border border-purple-400/50 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-purple-500/30">
                <FileText size={26} className="text-purple-200" />
              </div>
              <h3 className="text-white font-bold text-lg mb-3">
                Document Management
              </h3>
              <p className="text-gray-200 text-sm leading-relaxed">
                Upload, organize, and manage your certificates with advanced
                metadata.
              </p>
            </div>

            <div className="group p-6 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl border border-green-400/40 hover:border-green-300/60 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-green-500/30">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500/40 to-emerald-500/40 border border-green-400/50 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-green-500/30">
                <Users size={26} className="text-green-200" />
              </div>
              <h3 className="text-white font-bold text-lg mb-3">
                Instant Verification
              </h3>
              <p className="text-gray-200 text-sm leading-relaxed">
                Real-time document authenticity verification for institutions
                and individuals.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
